
-- Add a videos array column to store product video URLs
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}'::text[];
