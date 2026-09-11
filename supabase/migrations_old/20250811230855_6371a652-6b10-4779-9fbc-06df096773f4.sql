
-- Phase 1: Security and plumbing fixes

-- 1. Add missing RLS policies for orders table
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

-- 2. Add RLS policy for order_items (optional admin edits)
CREATE POLICY "Admins can insert order items" ON public.order_items
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

CREATE POLICY "Admins can update order items" ON public.order_items
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

-- 3. Harden database functions by setting search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE public.products 
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_notifications(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, title text, message text, type text, read boolean, data jsonb, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.title,
    n.message,
    n.type,
    n.read,
    n.data,
    n.created_at
  FROM public.notifications n
  WHERE n.user_id = p_user_id
  ORDER BY n.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.notifications 
  SET read = true
  WHERE id = notification_id 
  AND user_id = auth.uid();
END;
$function$;

-- 4. Add tables for Phase 2-3 (addresses, shipping, taxes)
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('shipping', 'billing', 'both')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  street_line_1 TEXT NOT NULL,
  street_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own addresses" ON public.addresses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_cost NUMERIC NOT NULL DEFAULT 0,
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping methods are publicly readable" ON public.shipping_methods
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage shipping methods" ON public.shipping_methods
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

-- Insert default shipping methods
INSERT INTO public.shipping_methods (name, description, base_cost, estimated_days_min, estimated_days_max) VALUES
('Standard Shipping', 'Free shipping on orders over $35', 9.99, 5, 7),
('Express Shipping', 'Get it in 2-3 business days', 19.99, 2, 3),
('Overnight Shipping', 'Get it by tomorrow', 39.99, 1, 1);

CREATE TABLE public.tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  state TEXT,
  rate NUMERIC NOT NULL CHECK (rate >= 0 AND rate <= 1),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tax rates are publicly readable" ON public.tax_rates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tax rates" ON public.tax_rates
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

-- Insert default tax rates for US states
INSERT INTO public.tax_rates (country, state, rate, name) VALUES
('US', 'CA', 0.0875, 'California Sales Tax'),
('US', 'NY', 0.08, 'New York Sales Tax'),
('US', 'TX', 0.0625, 'Texas Sales Tax'),
('US', 'FL', 0.06, 'Florida Sales Tax'),
('US', NULL, 0.08, 'Default US Sales Tax');
