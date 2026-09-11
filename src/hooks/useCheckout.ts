
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCheckout = () => {
  const { user } = useAuth();

  const createCheckoutSessionMutation = useMutation({
    mutationFn: async ({ 
      cartItems, 
      shippingAddress, 
      billingAddress,
      shippingMethodId,
      promoCodeId
    }: { 
      cartItems: Array<{id: string; name: string; price: number; quantity: number}>; 
      shippingAddress: {street: string; city: string; state: string; zipCode: string; country: string} | null; 
      billingAddress: {street: string; city: string; state: string; zipCode: string; country: string} | null;
      shippingMethodId?: string;
      promoCodeId?: string;
    }) => {
      if (!user) throw new Error('Must be logged in to checkout');

      // Input validation
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart cannot be empty');
      }

      if (!shippingAddress || !shippingAddress.street_line_1 || !shippingAddress.city) {
        throw new Error('Invalid shipping address');
      }

      if (!billingAddress || !billingAddress.street_line_1 || !billingAddress.city) {
        throw new Error('Invalid billing address');
      }

      // Validate cart items have required fields
      for (const item of cartItems) {
        if (!item.product_id || !item.quantity || item.quantity <= 0) {
          throw new Error('Invalid cart item data');
        }
        if (!item.products?.price || item.products.price < 0) {
          throw new Error('Invalid product pricing');
        }
      }

      // Rate limiting check - prevent multiple rapid checkout attempts
      const recentAttempts = localStorage.getItem('checkout_attempts');
      if (recentAttempts) {
        const attempts = JSON.parse(recentAttempts);
        const oneMinuteAgo = Date.now() - 60000;
        const recentCount = attempts.filter((time: number) => time > oneMinuteAgo).length;
        
        if (recentCount >= 3) {
          throw new Error('Too many checkout attempts. Please wait a moment.');
        }
      }

      // Record this attempt
      const currentAttempts = recentAttempts ? JSON.parse(recentAttempts) : [];
      currentAttempts.push(Date.now());
      localStorage.setItem('checkout_attempts', JSON.stringify(currentAttempts.slice(-5))); // Keep last 5

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          cartItems, 
          shippingAddress, 
          billingAddress,
          shippingMethodId,
          promoCodeId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process');
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ sessionId, orderId }: { sessionId: string; orderId: string }) => {
      if (!user) throw new Error('Must be logged in to verify payment');

      // Input validation
      if (!sessionId || !orderId) {
        throw new Error('Missing session ID or order ID');
      }

      // Basic format validation
      if (!/^cs_/.test(sessionId)) {
        throw new Error('Invalid session ID format');
      }

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId, orderId }
      });

      if (error) throw error;
      
      // If payment was successful, send confirmation email
      if (data.success) {
        try {
          await supabase.functions.invoke('send-order-confirmation', {
            body: { orderId }
          });
          // Order confirmation email sent
        } catch (emailError) {
          // Don't fail the payment verification if email fails
        // Error handled silently - TODO: add proper error reporting
        }
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Payment successful! Check your email for confirmation.');
        // Clear checkout attempts on successful payment
        localStorage.removeItem('checkout_attempts');
      }
    },
    onError: (error) => {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
    },
  });

  return {
    createCheckoutSession: createCheckoutSessionMutation.mutate,
    verifyPayment: verifyPaymentMutation.mutate,
    isCreatingSession: createCheckoutSessionMutation.isPending,
    isVerifyingPayment: verifyPaymentMutation.isPending,
  };
};
