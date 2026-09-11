-- Add subscription orders table for Subscribe & Save
CREATE TABLE IF NOT EXISTS public.subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  frequency TEXT NOT NULL, -- 'weekly', 'biweekly', 'monthly'
  next_delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  discount_percentage NUMERIC DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add deals table for Deal of the Day and Lightning Deals
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  deal_type TEXT NOT NULL, -- 'daily', 'lightning'
  discount_percentage NUMERIC NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_quantity INTEGER,
  claimed_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add order status history for tracking
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add wishlist sharing table
CREATE TABLE IF NOT EXISTS public.wishlist_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_owner_id UUID NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_orders
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscription_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.subscription_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.subscription_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.subscription_orders FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for deals
CREATE POLICY "Anyone can view active deals"
  ON public.deals FOR SELECT
  USING (is_active = true AND start_time <= now() AND end_time >= now());

CREATE POLICY "Admins can manage deals"
  ON public.deals FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
  ));

-- RLS Policies for order_status_history
CREATE POLICY "Users can view their order status history"
  ON public.order_status_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage order status history"
  ON public.order_status_history FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
  ));

-- RLS Policies for wishlist_shares
CREATE POLICY "Users can manage their own wishlist shares"
  ON public.wishlist_shares FOR ALL
  USING (auth.uid() = wishlist_owner_id)
  WITH CHECK (auth.uid() = wishlist_owner_id);

CREATE POLICY "Anyone can view public wishlist shares"
  ON public.wishlist_shares FOR SELECT
  USING (is_public = true OR auth.uid() = wishlist_owner_id);

-- Add indexes for performance
CREATE INDEX idx_subscription_orders_user_id ON public.subscription_orders(user_id);
CREATE INDEX idx_subscription_orders_next_delivery ON public.subscription_orders(next_delivery_date) WHERE is_active = true;
CREATE INDEX idx_deals_product_id ON public.deals(product_id);
CREATE INDEX idx_deals_active ON public.deals(is_active, start_time, end_time);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_wishlist_shares_token ON public.wishlist_shares(share_token);

-- Add triggers for updated_at
CREATE TRIGGER update_subscription_orders_updated_at
  BEFORE UPDATE ON public.subscription_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;