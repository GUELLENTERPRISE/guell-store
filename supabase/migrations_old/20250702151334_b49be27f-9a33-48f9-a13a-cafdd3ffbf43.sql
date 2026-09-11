-- Add missing fields to products table that are being sent from the form
ALTER TABLE public.products 
ADD COLUMN shipped_from TEXT,
ADD COLUMN sold_by TEXT,
ADD COLUMN recommended_uses TEXT[],
ADD COLUMN monthly_sold_count INTEGER;