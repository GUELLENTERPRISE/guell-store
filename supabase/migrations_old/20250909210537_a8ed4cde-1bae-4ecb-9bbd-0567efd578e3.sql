-- Add image and display order support to categories table
ALTER TABLE public.categories 
ADD COLUMN image_url TEXT,
ADD COLUMN display_order INTEGER DEFAULT 0,
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Create index for ordering
CREATE INDEX idx_categories_display_order ON public.categories(display_order, name);

-- Update RLS policies to allow admin management
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;

CREATE POLICY "Categories are publicly readable" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.id = auth.uid() 
  AND user_profiles.is_admin = true
));

-- Insert some sample categories if none exist
INSERT INTO public.categories (name, description, icon, color, image_url, display_order, is_active)
VALUES 
  ('Electronics', 'Latest gadgets and electronics', '📱', 'bg-blue-100', NULL, 1, true),
  ('Fashion', 'Trendy clothing and accessories', '👗', 'bg-pink-100', NULL, 2, true),
  ('Home & Garden', 'Everything for your home', '🏠', 'bg-green-100', NULL, 3, true),
  ('Sports', 'Sports equipment and gear', '⚽', 'bg-orange-100', NULL, 4, true),
  ('Books', 'Books and educational materials', '📚', 'bg-purple-100', NULL, 5, true),
  ('Beauty', 'Cosmetics and beauty products', '💄', 'bg-rose-100', NULL, 6, true),
  ('Toys', 'Toys and games for all ages', '🧸', 'bg-yellow-100', NULL, 7, true),
  ('Automotive', 'Car accessories and parts', '🚗', 'bg-muted', NULL, 8, true)
ON CONFLICT (name) DO NOTHING;