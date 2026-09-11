-- Create brand sections table for admin-editable brand sections
CREATE TABLE public.brand_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  button_text TEXT NOT NULL DEFAULT 'Shop Now',
  image_path TEXT,
  background_color TEXT DEFAULT '#10b981',
  search_category TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.brand_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for brand sections
CREATE POLICY "Brand sections are publicly readable"
ON public.brand_sections
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage brand sections"
ON public.brand_sections
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE user_profiles.id = auth.uid()
  AND user_profiles.is_admin = true
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_brand_sections_updated_at
BEFORE UPDATE ON public.brand_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default brand sections
INSERT INTO public.brand_sections (title, subtitle, description, button_text, background_color, search_category, display_order) VALUES
('Pre-loved jewelry', 'Sustainable luxury', 'Discover beautiful pre-owned jewelry pieces that tell a story. Sustainable luxury at its finest.', 'Shop Pre-loved', 'hsl(var(--accent))', 'jewelry', 1),
('GÜELL', 'Premium Collection', 'Experience the finest in luxury fashion and accessories. Curated collections for the discerning taste.', 'Explore GÜELL', 'hsl(var(--primary))', '', 2);