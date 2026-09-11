
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { cartItems, shippingAddress, billingAddress, shippingMethodId, promoCodeId } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.products.price * item.quantity), 0
    );

    // Get shipping cost
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let shippingCost = 9.99; // default
    if (shippingMethodId) {
      const { data: shippingMethod } = await supabaseService
        .from('shipping_methods')
        .select('base_cost')
        .eq('id', shippingMethodId)
        .single();
      
      if (shippingMethod) {
        shippingCost = Number(shippingMethod.base_cost);
      }
    }

    // Apply promo code discount
    let discountAmount = 0;
    if (promoCodeId) {
      const { data: promoCode } = await supabaseService
        .from('promo_codes')
        .select('*')
        .eq('id', promoCodeId)
        .single();

      if (promoCode && promoCode.current_uses < promoCode.max_uses) {
        if (promoCode.discount_type === 'percentage') {
          discountAmount = subtotal * (promoCode.discount_value / 100);
        } else {
          discountAmount = Number(promoCode.discount_value);
        }
      }
    }

    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * 0.08; // Default 8% tax
    const totalAmount = discountedSubtotal + shippingCost + taxAmount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order in pending state
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        total_amount: totalAmount,
        shipping_amount: shippingCost,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        promo_code_id: promoCodeId,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
    }));

    const { error: itemsError } = await supabaseService
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error('Failed to create order items');
    }

    // Create Stripe checkout session
    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.products.name,
          images: item.products.images?.slice(0, 1) || [],
        },
        unit_amount: Math.round(item.products.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as line item
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as line item
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Tax" },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/checkout/cancel?order_id=${order.id}`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    });

    // Update order with stripe session ID
    await supabaseService
      .from('orders')
      .update({ stripe_payment_intent_id: session.id })
      .eq('id', order.id);

    console.log(`Created checkout session for order ${orderNumber}`);

    return new Response(JSON.stringify({ 
      url: session.url,
      order_id: order.id,
      order_number: orderNumber 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
