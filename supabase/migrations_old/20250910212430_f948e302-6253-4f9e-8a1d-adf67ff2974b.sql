-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for category images
CREATE POLICY "Category images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'category-images');

CREATE POLICY "Admins can upload category images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'category-images' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update category images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'category-images' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can delete category images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'category-images' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Update categories table to support direct image uploads and color palette
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS background_color text DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS image_path text;

-- Create tables for CategoryGrid (marketing tiles)
CREATE TABLE public.marketing_tiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_path text,
  background_color text DEFAULT '#3b82f6',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for marketing_tiles
ALTER TABLE public.marketing_tiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing tiles are publicly readable" 
ON public.marketing_tiles 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage marketing tiles" 
ON public.marketing_tiles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- Create tables for SecondaryCategories (promotional blocks)
CREATE TABLE public.promotional_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_path text,
  background_color text DEFAULT '#10b981',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for promotional_blocks
ALTER TABLE public.promotional_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promotional blocks are publicly readable" 
ON public.promotional_blocks 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage promotional blocks" 
ON public.promotional_blocks 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- Create function to automatically assign GÜELL+ Basic Membership on user registration
CREATE OR REPLACE FUNCTION public.assign_basic_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create user profile with basic membership
  INSERT INTO public.user_profiles (id, email, full_name, is_prime_member)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    true  -- Basic membership is automatically active
  )
  ON CONFLICT (id) DO UPDATE SET
    is_prime_member = true;

  -- Create subscriber record with basic membership
  INSERT INTO public.subscribers (
    user_id,
    email,
    subscription_tier,
    subscribed,
    subscription_end
  )
  VALUES (
    NEW.id,
    NEW.email,
    'GÜELL+ Basic Membership',
    true,
    NULL  -- Basic membership never expires
  )
  ON CONFLICT (email) DO UPDATE SET
    subscription_tier = EXCLUDED.subscription_tier,
    subscribed = true,
    subscription_end = NULL;

  RETURN NEW;
END;
$$;

-- Update the existing trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_basic_membership();

-- Add sample data for marketing tiles
INSERT INTO public.marketing_tiles (title, description, background_color, display_order) VALUES
('Pre-loved jewelry', 'Discover unique vintage pieces', '#f59e0b', 1),
('Luxury handbags', 'Premium designer collections', '#ec4899', 2),
('Vintage watches', 'Timeless elegance', '#3b82f6', 3),
('Designer shoes', 'Step into luxury', '#10b981', 4);

-- Add sample data for promotional blocks
INSERT INTO public.promotional_blocks (title, subtitle, background_color, display_order) VALUES
('Summer Collection', 'New arrivals for the season', '#f59e0b', 1),
('GÜELL+ Exclusive', 'Members-only deals', '#8b5cf6', 2);

-- Add trigger for updated_at
CREATE TRIGGER update_marketing_tiles_updated_at
BEFORE UPDATE ON public.marketing_tiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotional_blocks_updated_at
BEFORE UPDATE ON public.promotional_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();