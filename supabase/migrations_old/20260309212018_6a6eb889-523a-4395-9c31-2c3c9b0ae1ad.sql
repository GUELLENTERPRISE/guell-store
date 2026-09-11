
-- Add image_alt_text column (pipe-delimited alt texts matching images)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_alt_text text[] DEFAULT '{}'::text[];

-- Add slug column with unique constraint for SEO-friendly URLs
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

-- Create function to generate slug from product name
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug: lowercase, remove accents, replace non-alphanumeric with hyphens
  base_slug := lower(unaccent(NEW.name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Only generate if slug is not already set
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    final_slug := base_slug;
    -- Handle duplicates by appending a counter
    LOOP
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.products WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      );
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate slug on insert/update
DROP TRIGGER IF EXISTS trigger_generate_product_slug ON public.products;
CREATE TRIGGER trigger_generate_product_slug
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_product_slug();

-- Enable unaccent extension if not already enabled
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Generate slugs for existing products that don't have one
UPDATE public.products SET slug = NULL WHERE slug IS NULL OR slug = '';

-- Add unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
