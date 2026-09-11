-- Create hero_banners table for fully editable promotional banners
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  button_text TEXT DEFAULT 'Shop Now',
  button_link TEXT DEFAULT '/search',
  image_path TEXT,
  background_color TEXT DEFAULT '#1aafff',
  text_color TEXT DEFAULT '#ffffff',
  show_products BOOLEAN DEFAULT true,
  product_ids UUID[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  auto_rotate_interval INTEGER DEFAULT 4000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active banners
CREATE POLICY "Anyone can view active hero banners" 
ON public.hero_banners 
FOR SELECT 
USING (is_active = true);

-- Admin-only write policies
CREATE POLICY "Admins can insert hero banners" 
ON public.hero_banners 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update hero banners" 
ON public.hero_banners 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can delete hero banners" 
ON public.hero_banners 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hero_banners_updated_at
BEFORE UPDATE ON public.hero_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default banner
INSERT INTO public.hero_banners (title, subtitle, button_text, button_link, background_color, show_products, display_order)
VALUES ('Members-Only Deals', 'Exclusive savings for Prime members', 'Join Prime', '/subscription', '#1aafff', true, 0);