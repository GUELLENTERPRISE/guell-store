-- Fix subscribers table security vulnerability
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create secure policies that properly restrict access
CREATE POLICY "Users can insert their own subscription" ON public.subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id) OR 
    (auth.email() = email AND user_id IS NULL)
  );

CREATE POLICY "Users can update their own subscription" ON public.subscribers
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = user_id) OR 
    (auth.email() = email AND user_id IS NULL)
  )
  WITH CHECK (
    (auth.uid() = user_id) OR 
    (auth.email() = email AND user_id IS NULL)
  );

-- Create a secure function for subscription management that ensures proper validation
CREATE OR REPLACE FUNCTION public.upsert_user_subscription(
  p_stripe_customer_id text DEFAULT NULL,
  p_subscription_tier text DEFAULT NULL,
  p_subscribed boolean DEFAULT false,
  p_subscription_end timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_id uuid;
  user_email text;
BEGIN
  -- Get the authenticated user's email
  SELECT auth.email() INTO user_email;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Insert or update the subscription record
  INSERT INTO public.subscribers (
    user_id,
    email,
    stripe_customer_id,
    subscription_tier,
    subscribed,
    subscription_end,
    updated_at
  )
  VALUES (
    auth.uid(),
    user_email,
    p_stripe_customer_id,
    p_subscription_tier,
    p_subscribed,
    p_subscription_end,
    now()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, subscribers.stripe_customer_id),
    subscription_tier = COALESCE(EXCLUDED.subscription_tier, subscribers.subscription_tier),
    subscribed = EXCLUDED.subscribed,
    subscription_end = EXCLUDED.subscription_end,
    updated_at = now()
  RETURNING id INTO subscription_id;

  RETURN subscription_id;
END;
$$;

-- Grant execute permission on the secure function
GRANT EXECUTE ON FUNCTION public.upsert_user_subscription(text, text, boolean, timestamptz) TO authenticated;

-- Add a unique constraint to prevent duplicate subscriptions per email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscribers_email_unique'
  ) THEN
    ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_email_unique UNIQUE (email);
  END IF;
END
$$;