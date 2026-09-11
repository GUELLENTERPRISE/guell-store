
-- Add new optional fields to the products table
ALTER TABLE public.products 
ADD COLUMN color text,
ADD COLUMN fabric_type text,
ADD COLUMN origin text,
ADD COLUMN is_guell_plus boolean DEFAULT false;
