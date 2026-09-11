-- Food Database Schema for GÜELL Food Section
-- This migration creates separate tables for food ordering with modifiers support

-- Food categories (Pizza, Burgers, Sushi, etc.)
CREATE TABLE IF NOT EXISTS food_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants/Stores
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    delivery_time_min INTEGER, -- in minutes
    delivery_time_max INTEGER, -- in minutes
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    minimum_order DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant categories (many-to-many relationship)
CREATE TABLE IF NOT EXISTS restaurant_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES food_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, category_id)
);

-- Food menu items
CREATE TABLE IF NOT EXISTS food_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES food_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    preparation_time INTEGER, -- in minutes
    calories INTEGER,
    allergens TEXT[], -- array of allergen information
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food item modifiers (extra ingredients, options, etc.)
CREATE TABLE IF NOT EXISTS food_modifiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('single', 'multiple', 'required')),
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modifier options (specific choices for each modifier)
CREATE TABLE IF NOT EXISTS food_modifier_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    modifier_id UUID REFERENCES food_modifiers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link modifiers to food items (many-to-many relationship)
CREATE TABLE IF NOT EXISTS food_item_modifiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
    modifier_id UUID REFERENCES food_modifiers(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(food_item_id, modifier_id)
);

-- Food orders (separate from store orders)
CREATE TABLE IF NOT EXISTS food_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    delivery_address TEXT,
    delivery_instructions TEXT,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food order items
CREATE TABLE IF NOT EXISTS food_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES food_orders(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food order item modifiers (selected modifiers for each order item)
CREATE TABLE IF NOT EXISTS food_order_item_modifiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_item_id UUID REFERENCES food_order_items(id) ON DELETE CASCADE,
    modifier_option_id UUID REFERENCES food_modifier_options(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_item_id, modifier_option_id)
);

-- Food cart (temporary cart for logged-in users)
CREATE TABLE IF NOT EXISTS food_cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, food_item_id)
);

-- Food cart modifiers (selected modifiers for cart items)
CREATE TABLE IF NOT EXISTS food_cart_modifiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_item_id UUID REFERENCES food_cart(id) ON DELETE CASCADE,
    modifier_option_id UUID REFERENCES food_modifier_options(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cart_item_id, modifier_option_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_categories_active ON food_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_food_items_restaurant ON food_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_available ON food_items(is_available);
CREATE INDEX IF NOT EXISTS idx_food_modifiers_restaurant ON food_modifiers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_user ON food_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_orders_restaurant ON food_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_cart_user ON food_cart(user_id);

-- RLS (Row Level Security) policies
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_order_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_cart_modifiers ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, restaurants, and food items
CREATE POLICY "Public read access for food categories" ON food_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for restaurants" ON restaurants
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for food items" ON food_items
    FOR SELECT USING (is_available = true);

CREATE POLICY "Public read access for modifiers" ON food_modifiers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for modifier options" ON food_modifier_options
    FOR SELECT USING (is_available = true);

-- Users can only access their own orders and cart
CREATE POLICY "Users can view own food orders" ON food_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food orders" ON food_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food orders" ON food_orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food orders" ON food_orders
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own food cart" ON food_cart
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own food cart modifiers" ON food_cart_modifiers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM food_cart 
            WHERE food_cart.id = food_cart_modifiers.cart_item_id 
            AND food_cart.user_id = auth.uid()
        )
    );

-- Insert sample data
INSERT INTO food_categories (name, description, display_order) VALUES
('Pizza', 'Freshly baked pizzas with various toppings', 1),
('Burgers', 'Juicy burgers with premium ingredients', 2),
('Sushi', 'Traditional and fusion sushi rolls', 3),
('Asian', 'Asian cuisine from various regions', 4),
('Mexican', 'Authentic Mexican dishes and tacos', 5),
('Healthy', 'Nutritious and healthy options', 6),
('Desserts', 'Sweet treats and desserts', 7),
('Drinks', 'Beverages and refreshments', 8)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_food_categories_updated_at BEFORE UPDATE ON food_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_items_updated_at BEFORE UPDATE ON food_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_modifiers_updated_at BEFORE UPDATE ON food_modifiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_modifier_options_updated_at BEFORE UPDATE ON food_modifier_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_orders_updated_at BEFORE UPDATE ON food_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_cart_updated_at BEFORE UPDATE ON food_cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
