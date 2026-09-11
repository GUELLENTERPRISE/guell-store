-- Create storefront_settings table (if it doesn't exist) and ensure it has a verified stores column
CREATE TABLE IF NOT EXISTS public.storefront_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_cta_color text,
  primary_cta_label text,
  low_stock_threshold_default integer,
  enable_urgency_messaging boolean,
  show_secure_payment_badge_default boolean,
  show_satisfaction_badge_default boolean,
  show_fast_shipping_badge_default boolean,
  payment_methods text[],
  cart_payment_icons text[],
  cart_urgency_banner_text text,
  cart_trust_badges text[],
  free_shipping_threshold integer,
  verified_stores text[] DEFAULT '{}'::text[],
  exit_intent_enabled boolean,
  exit_intent_title text,
  exit_intent_message text,
  exit_intent_offer text,
  exit_intent_button_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.storefront_settings
ADD COLUMN IF NOT EXISTS verified_stores text[] DEFAULT '{}'::text[];
