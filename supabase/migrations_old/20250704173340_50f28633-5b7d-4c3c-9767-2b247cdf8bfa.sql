-- Set existing product as featured to fix the carousel
UPDATE products SET is_featured = true WHERE id = (SELECT id FROM products LIMIT 1);