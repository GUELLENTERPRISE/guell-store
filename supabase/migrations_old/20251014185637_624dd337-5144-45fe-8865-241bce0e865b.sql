-- Add shipped_from and sold_by columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shipped_from TEXT,
ADD COLUMN IF NOT EXISTS sold_by TEXT;

-- Set default values for existing products
UPDATE public.products 
SET shipped_from = 'GÜELL Warehouse',
    sold_by = 'GÜELL Store'
WHERE shipped_from IS NULL OR sold_by IS NULL;