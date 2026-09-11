-- Fix 1: Add auth check to get_user_notifications function
CREATE OR REPLACE FUNCTION public.get_user_notifications(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  message text,
  type text,
  read boolean,
  data jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Verify the caller is requesting their own notifications
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other users notifications';
  END IF;

  RETURN QUERY 
  SELECT n.id, n.user_id, n.title, n.message, n.type, n.read, n.data, n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id
  ORDER BY n.created_at DESC;
END;
$function$;

-- Fix mark_notification_read to also check auth
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Verify the caller owns this notification
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  UPDATE notifications 
  SET read = true 
  WHERE id = notification_id 
    AND user_id = auth.uid();
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification not found or unauthorized';
  END IF;
END;
$function$;

-- Fix 2: Restrict product-images storage policies to admin users only
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Create admin-only policies for product images
CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);