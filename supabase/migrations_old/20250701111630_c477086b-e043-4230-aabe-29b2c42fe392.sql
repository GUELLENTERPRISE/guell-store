
-- Create promotional codes table
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by UUID REFERENCES auth.users,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0
);

-- Add RLS policies
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage promo codes
CREATE POLICY "Admins can manage promo codes" 
  ON public.promo_codes 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

-- Policy for users to view available promo codes (not used and not expired)
CREATE POLICY "Users can view available promo codes" 
  ON public.promo_codes 
  FOR SELECT 
  USING (current_uses < max_uses AND (expires_at IS NULL OR expires_at > now()));

-- Add promo code field to orders table
ALTER TABLE public.orders 
ADD COLUMN promo_code_id UUID REFERENCES public.promo_codes,
ADD COLUMN discount_amount NUMERIC DEFAULT 0;

-- Create shipping settings table for admin customization
CREATE TABLE public.shipping_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipped_from TEXT NOT NULL DEFAULT 'GÜELL',
  sold_by TEXT NOT NULL DEFAULT 'GÜELL',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default shipping settings
INSERT INTO public.shipping_settings (shipped_from, sold_by) 
VALUES ('GÜELL', 'GÜELL');

-- Add RLS for shipping settings
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage shipping settings
CREATE POLICY "Admins can manage shipping settings" 
  ON public.shipping_settings 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

-- Policy for everyone to read shipping settings
CREATE POLICY "Everyone can read shipping settings" 
  ON public.shipping_settings 
  FOR SELECT 
  USING (true);

-- Add avatar_url to user_profiles if not exists (already exists based on schema)
-- ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
