import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StorefrontSettings {
  id: string;
  primary_cta_color?: string;
  primary_cta_label?: string;
  low_stock_threshold_default?: number;
  enable_urgency_messaging?: boolean;
  show_secure_payment_badge_default?: boolean;
  show_satisfaction_badge_default?: boolean;
  show_fast_shipping_badge_default?: boolean;
   // optional list of payment methods, e.g. ["Visa", "Mastercard", "PayPal"]
  payment_methods?: string[];
  /** Cart page: which payment icons to show. Keys: visa, mastercard, paypal, amex, applepay, googlepay. Empty = show none. Stored as array or comma-separated string. */
  cart_payment_icons?: string[] | string;
  cart_urgency_banner_text?: string;
  cart_trust_badges?: string[];
  free_shipping_threshold?: number;
  // Store verification settings
  verified_stores?: string[];
  // Exit intent popup settings
  exit_intent_enabled?: boolean;
  exit_intent_title?: string;
  exit_intent_message?: string;
  exit_intent_offer?: string;
  exit_intent_button_text?: string;
  created_at: string;
  updated_at: string;
}

export const useStorefrontSettings = () => {
  return useQuery({
    queryKey: ['storefront-settings'],
    queryFn: async () => {
      console.log('Fetching storefront settings...');
      try {
        const { data, error } = await supabase
          .from('storefront_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching storefront settings:', error);
          throw error;
        }

        console.log('Storefront settings fetched successfully:', data);
        return data as StorefrontSettings | null;
      } catch (err) {
        console.error('Unexpected error fetching storefront settings:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

