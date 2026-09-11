
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, orderId } = await req.json();

    if (!sessionId || !orderId) {
      throw new Error("Missing session ID or order ID");
    }

    // Get authenticated user first - CRITICAL SECURITY FIX
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid authentication token");
    }

    const authenticatedUserId = userData.user.id;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    // Verify session belongs to this order
    if (session.metadata?.order_id !== orderId) {
      throw new Error("Session does not match order");
    }

    // Use service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // CRITICAL SECURITY FIX: Verify order ownership before processing
    const { data: orderOwnership, error: ownershipError } = await supabaseService
      .rpc('verify_order_ownership', {
        p_order_id: orderId,
        p_user_id: authenticatedUserId
      });

    if (ownershipError || !orderOwnership) {
      console.error('Order ownership verification failed:', ownershipError);
      throw new Error("Unauthorized: Order does not belong to user");
    }

    // Get order and items with product details
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (id, inventory, monthly_sold_count)
        )
      `)
      .eq('id', orderId)
      .eq('user_id', authenticatedUserId) // Double-check ownership
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      throw new Error("Order not found or access denied");
    }

    // Check if already processed
    if (order.status === 'paid') {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Payment already processed",
        order: {
          id: order.id,
          order_number: order.order_number,
          status: 'paid'
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Validate inventory availability before finalizing
    for (const item of order.order_items) {
      if (item.products.inventory < item.quantity) {
        console.error(`Insufficient inventory for product ${item.product_id}: ${item.products.inventory} < ${item.quantity}`);
        throw new Error(`Insufficient inventory for ${item.products.name || 'product'}`);
      }
    }

    // Begin transaction-like operations
    try {
      // Update order status first
      const { error: updateError } = await supabaseService
        .from('orders')
        .update({ 
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent || session.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', authenticatedUserId) // Ensure we only update user's own order
        .eq('status', 'pending'); // Prevent double-processing

      if (updateError) {
        console.error('Order update error:', updateError);
        throw new Error("Failed to update order status");
      }

      // Update product inventory and sales count atomically
      for (const item of order.order_items) {
        const newInventory = Math.max(0, item.products.inventory - item.quantity);
        const newSoldCount = (item.products.monthly_sold_count || 0) + item.quantity;

        const { error: productError } = await supabaseService
          .from('products')
          .update({ 
            inventory: newInventory,
            monthly_sold_count: newSoldCount
          })
          .eq('id', item.product_id)
          .eq('inventory', item.products.inventory); // Optimistic locking

        if (productError) {
          console.error(`Product update error for ${item.product_id}:`, productError);
          // Log but continue - inventory will be reconciled
        }
      }

      // Handle promo code usage using the secure RPC
      if (order.promo_code_id && order.user_id) {
        const { data: promoUpdated, error: promoError } = await supabaseService
          .rpc('increment_promo_code_usage', {
            p_promo_code_id: order.promo_code_id,
            p_user_id: order.user_id
          });

        if (promoError) {
          console.error('Promo code update error:', promoError);
          // Don't fail the order, but log the issue
        } else if (!promoUpdated) {
          console.warn(`Promo code ${order.promo_code_id} could not be incremented (may have reached max uses)`);
        }
      }

      // Clear user's cart
      if (order.user_id) {
        const { error: cartError } = await supabaseService
          .from('cart_items')
          .delete()
          .eq('user_id', order.user_id);

        if (cartError) {
          console.error('Cart clear error:', cartError);
          // Don't fail the order, cart will be cleared on next login
        }
      }

      console.log(`Payment verified and order ${order.order_number} updated to paid for user ${authenticatedUserId}`);

      return new Response(JSON.stringify({ 
        success: true, 
        order: {
          id: order.id,
          order_number: order.order_number,
          status: 'paid',
          total_amount: order.total_amount
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (transactionError) {
      console.error('Transaction error during payment processing:', transactionError);
      // In a real system, you'd want to implement proper rollback logic here
      throw new Error("Payment processing failed - please contact support");
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
