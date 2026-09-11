
-- Fix 1: Prevent privilege escalation in user_profiles table
-- Remove the ability for users to update their is_admin flag
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can update their own profile (excluding admin flags)" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent users from changing admin status
  (OLD.is_admin IS NOT DISTINCT FROM NEW.is_admin) AND
  (OLD.is_prime_member IS NOT DISTINCT FROM NEW.is_prime_member) AND
  (OLD.prime_expires_at IS NOT DISTINCT FROM NEW.prime_expires_at)
);

-- Fix 2: Add a secure function to check admin status (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(is_admin, false) 
  FROM user_profiles 
  WHERE id = auth.uid();
$$;

-- Fix 3: Create a secure function to verify order ownership
CREATE OR REPLACE FUNCTION public.verify_order_ownership(p_order_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM orders 
    WHERE id = p_order_id AND user_id = p_user_id
  );
$$;

-- Fix 4: Update admin policies to use the secure function
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can update order items" ON public.order_items;

CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can insert order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update order items" 
ON public.order_items 
FOR UPDATE 
USING (public.is_current_user_admin());

-- Update other admin policies to use the secure function
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
USING (public.is_current_user_admin());

-- Update promo codes admin policy
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;

CREATE POLICY "Admins can manage promo codes" 
ON public.promo_codes 
FOR ALL 
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Update shipping methods admin policy
DROP POLICY IF EXISTS "Admins can manage shipping methods" ON public.shipping_methods;

CREATE POLICY "Admins can manage shipping methods" 
ON public.shipping_methods 
FOR ALL 
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Update tax rates admin policy
DROP POLICY IF EXISTS "Admins can manage tax rates" ON public.tax_rates;

CREATE POLICY "Admins can manage tax rates" 
ON public.tax_rates 
FOR ALL 
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Update shipping settings admin policy
DROP POLICY IF EXISTS "Admins can manage shipping settings" ON public.shipping_settings;

CREATE POLICY "Admins can manage shipping settings" 
ON public.shipping_settings 
FOR ALL 
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Fix 5: Add integrity constraints to prevent data corruption
ALTER TABLE public.orders 
ADD CONSTRAINT orders_total_amount_positive 
CHECK (total_amount >= 0);

ALTER TABLE public.orders 
ADD CONSTRAINT orders_shipping_amount_positive 
CHECK (shipping_amount >= 0);

ALTER TABLE public.orders 
ADD CONSTRAINT orders_tax_amount_positive 
CHECK (tax_amount >= 0);

ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_quantity_positive 
CHECK (quantity > 0);

ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_price_positive 
CHECK (price >= 0);

ALTER TABLE public.products 
ADD CONSTRAINT products_price_positive 
CHECK (price >= 0);

ALTER TABLE public.products 
ADD CONSTRAINT products_inventory_non_negative 
CHECK (inventory >= 0);
