
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

const getEstimatedDelivery = (): string => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 business days estimate
  return formatDate(deliveryDate);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { orderId }: OrderConfirmationRequest = await req.json();
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Sending order confirmation for:', { orderId, userId: user.id });

    // Fetch order details with products
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            images,
            brand
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      console.error('Order not found or unauthorized:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found or unauthorized' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user email
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    const userEmail = profile?.email || user.email;
    const userName = profile?.full_name || 'Valued Customer';
    
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate totals
    const shippingAmount = order.shipping_amount || 0;
    const taxAmount = order.tax_amount || 0;
    const discountAmount = order.discount_amount || 0;
    const subtotal = order.order_items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Generate order items HTML
    const orderItemsHtml = order.order_items.map((item: any) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${item.products?.images?.[0] || 'https://via.placeholder.com/80'}" 
                 alt="${item.products?.name || 'Product'}" 
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                ${item.products?.brand || 'GÜELL'}
              </p>
              <p style="margin: 0; font-weight: 500; color: #111827;">
                ${item.products?.name || 'Product'}
              </p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
                Qty: ${item.quantity}
              </p>
            </div>
          </div>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500; color: #111827;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `).join('');

    // Shipping address
    const shippingAddr = order.shipping_address;
    const shippingAddressHtml = shippingAddr ? `
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #111827;">Shipping Address</p>
        <p style="margin: 0; color: #4b5563; line-height: 1.6;">
          ${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}<br>
          ${shippingAddr.streetLine1 || shippingAddr.street_line_1 || ''}<br>
          ${(shippingAddr.streetLine2 || shippingAddr.street_line_2) ? (shippingAddr.streetLine2 || shippingAddr.street_line_2) + '<br>' : ''}
          ${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.postalCode || shippingAddr.postal_code || ''}<br>
          ${shippingAddr.country || 'United States'}
        </p>
      </div>
    ` : '';

    // Estimated delivery date
    const estimatedDelivery = order.estimated_delivery 
      ? formatDate(order.estimated_delivery) 
      : getEstimatedDelivery();

    // Order tracking section (if tracking number exists)
    const trackingHtml = order.tracking_number ? `
      <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-top: 24px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #065f46;">📦 Tracking Information</p>
        <p style="margin: 0; color: #047857;">
          Tracking Number: <strong>${order.tracking_number}</strong>
        </p>
        <p style="margin: 8px 0 0 0;">
          <a href="https://www.ups.com/track?tracknum=${order.tracking_number}" 
             style="color: #059669; text-decoration: underline;">
            Track your package →
          </a>
        </p>
      </div>
    ` : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #111827; padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">GÜELL</h1>
                  </td>
                </tr>

                <!-- Success Banner -->
                <tr>
                  <td style="background-color: #10b981; padding: 24px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 8px;">✓</div>
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Order Confirmed!</h2>
                    <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px;">
                      Thank you for your purchase, ${userName}
                    </p>
                  </td>
                </tr>

                <!-- Order Info -->
                <tr>
                  <td style="padding: 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 24px;">
                          <table width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 16px;">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
                                <p style="margin: 4px 0 0 0; color: #111827; font-weight: 600; font-size: 16px;">#${order.order_number}</p>
                              </td>
                              <td width="50%" style="text-align: right;">
                                <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
                                <p style="margin: 4px 0 0 0; color: #111827; font-weight: 600; font-size: 16px;">${formatDate(order.created_at)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Estimated Delivery -->
                    <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px;">
                        <strong>🚚 Estimated Delivery:</strong> ${estimatedDelivery}
                      </p>
                    </div>

                    ${trackingHtml}

                    <!-- Order Items -->
                    <h3 style="margin: 24px 0 16px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">Order Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tbody>
                        ${orderItemsHtml}
                      </tbody>
                    </table>

                    <!-- Order Summary -->
                    <table width="100%" style="margin-top: 24px; border-top: 2px solid #e5e7eb; padding-top: 16px;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
                        <td style="padding: 8px 0; text-align: right; color: #111827;">${formatCurrency(subtotal)}</td>
                      </tr>
                      ${discountAmount > 0 ? `
                      <tr>
                        <td style="padding: 8px 0; color: #059669;">Discount</td>
                        <td style="padding: 8px 0; text-align: right; color: #059669;">-${formatCurrency(discountAmount)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
                        <td style="padding: 8px 0; text-align: right; color: #111827;">${shippingAmount > 0 ? formatCurrency(shippingAmount) : 'FREE'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Tax</td>
                        <td style="padding: 8px 0; text-align: right; color: #111827;">${formatCurrency(taxAmount)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 8px 0; font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb;">Total</td>
                        <td style="padding: 16px 0 8px 0; text-align: right; font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb;">${formatCurrency(order.total_amount)}</td>
                      </tr>
                    </table>

                    <!-- Shipping Address -->
                    <div style="margin-top: 24px;">
                      ${shippingAddressHtml}
                    </div>

                    <!-- CTA Button -->
                    <div style="margin-top: 32px; text-align: center;">
                      <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/orders" 
                         style="display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        View Order Status
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                      Questions about your order? Contact us at
                    </p>
                    <a href="mailto:support@guell.com" style="color: #111827; text-decoration: underline; font-weight: 500;">
                      support@guell.com
                    </a>
                    <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} GÜELL. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "GÜELL <orders@resend.dev>",
        to: [userEmail],
        subject: `Order Confirmed! #${order.order_number}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send email:", emailResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailResult }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Order confirmation email sent:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResponse: emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
