-- Fix promo codes security vulnerability
-- Remove the overly permissive policy that exposes all active codes
DROP POLICY IF EXISTS "Users can view available promo codes" ON public.promo_codes;

-- Create a secure function for promo code validation
CREATE OR REPLACE FUNCTION public.validate_promo_code(code_input text)
RETURNS TABLE(
  id uuid,
  code text,
  discount_type text,
  discount_value numeric,
  max_uses integer,
  current_uses integer,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return the specific code if it's valid and available
  RETURN QUERY
  SELECT 
    pc.id,
    pc.code,
    pc.discount_type,
    pc.discount_value,
    pc.max_uses,
    pc.current_uses,
    pc.expires_at
  FROM public.promo_codes pc
  WHERE pc.code = UPPER(code_input)
    AND pc.current_uses < pc.max_uses
    AND (pc.expires_at IS NULL OR pc.expires_at > now())
  LIMIT 1;
END;
$$;

-- Add a policy that only allows authenticated users to validate codes they provide
-- This prevents browsing all codes but allows validation of specific codes
CREATE POLICY "Authenticated users can validate specific promo codes" ON public.promo_codes
  FOR SELECT 
  TO authenticated
  USING (false); -- This policy blocks direct SELECT access

-- Grant execute permission on the validation function
GRANT EXECUTE ON FUNCTION public.validate_promo_code(text) TO authenticated;