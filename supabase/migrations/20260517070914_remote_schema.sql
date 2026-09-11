

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."assign_basic_membership"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Create user profile with basic membership
  INSERT INTO public.user_profiles (id, email, full_name, is_prime_member)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    true  -- Basic membership is automatically active
  )
  ON CONFLICT (id) DO UPDATE SET
    is_prime_member = true;

  -- Create subscriber record with basic membership
  INSERT INTO public.subscribers (
    user_id,
    email,
    subscription_tier,
    subscribed,
    subscription_end
  )
  VALUES (
    NEW.id,
    NEW.email,
    'GÜELL+ Basic Membership',
    true,
    NULL  -- Basic membership never expires
  )
  ON CONFLICT (email) DO UPDATE SET
    subscription_tier = EXCLUDED.subscription_tier,
    subscribed = true,
    subscription_end = NULL;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."assign_basic_membership"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_product_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug: lowercase, remove accents, replace non-alphanumeric with hyphens
  base_slug := lower(unaccent(NEW.name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Only generate if slug is not already set
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    final_slug := base_slug;
    -- Handle duplicates by appending a counter
    LOOP
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.products WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      );
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_product_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_share_token"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$;


ALTER FUNCTION "public"."generate_share_token"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "title" "text", "message" "text", "type" "text", "read" boolean, "data" "jsonb", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_promo_code_usage"("p_promo_code_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  updated_count int;
BEGIN
  UPDATE public.promo_codes
  SET
    current_uses = COALESCE(current_uses, 0) + 1,
    used_by = p_user_id,
    used_at = now()
  WHERE id = p_promo_code_id
    AND (max_uses IS NULL OR current_uses < max_uses);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;


ALTER FUNCTION "public"."increment_promo_code_usage"("p_promo_code_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_notification_read"("notification_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."mark_notification_read"("notification_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.products 
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_product_rating"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_review_helpful_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_review_helpful_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_user_subscription"("p_stripe_customer_id" "text" DEFAULT NULL::"text", "p_subscription_tier" "text" DEFAULT NULL::"text", "p_subscribed" boolean DEFAULT false, "p_subscription_end" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."upsert_user_subscription"("p_stripe_customer_id" "text", "p_subscription_tier" "text", "p_subscribed" boolean, "p_subscription_end" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_promo_code"("code_input" "text") RETURNS TABLE("id" "uuid", "code" "text", "discount_type" "text", "discount_value" numeric, "max_uses" integer, "current_uses" integer, "expires_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."validate_promo_code"("code_input" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "company" "text",
    "street_line_1" "text" NOT NULL,
    "street_line_2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "postal_code" "text" NOT NULL,
    "country" "text" DEFAULT 'US'::"text" NOT NULL,
    "phone" "text",
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "addresses_type_check" CHECK (("type" = ANY (ARRAY['shipping'::"text", 'billing'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brand_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "description" "text",
    "button_text" "text" DEFAULT 'Shop Now'::"text" NOT NULL,
    "image_path" "text",
    "background_color" "text" DEFAULT '#10b981'::"text",
    "search_category" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."brand_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."browsing_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "viewed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."browsing_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "product_id" "uuid",
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "color" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_url" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "background_color" "text" DEFAULT '#3b82f6'::"text",
    "image_path" "text"
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "deal_type" "text" NOT NULL,
    "discount_percentage" numeric NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "max_quantity" integer,
    "claimed_quantity" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."deals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hero_banners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "description" "text",
    "button_text" "text" DEFAULT 'Shop Now'::"text",
    "button_link" "text" DEFAULT '/search'::"text",
    "image_path" "text",
    "background_color" "text" DEFAULT '#1aafff'::"text",
    "text_color" "text" DEFAULT '#ffffff'::"text",
    "show_products" boolean DEFAULT true,
    "product_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "auto_rotate_interval" integer DEFAULT 4000,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."hero_banners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketing_tiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_path" "text",
    "background_color" "text" DEFAULT '#3b82f6'::"text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."marketing_tiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "product_id" "uuid",
    "quantity" integer NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_status_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid",
    "status" "text" NOT NULL,
    "location" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_status_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "order_number" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "shipping_amount" numeric(10,2) DEFAULT 0,
    "tax_amount" numeric(10,2) DEFAULT 0,
    "shipping_address" "jsonb" NOT NULL,
    "billing_address" "jsonb" NOT NULL,
    "payment_method" "jsonb",
    "stripe_payment_intent_id" "text",
    "tracking_number" "text",
    "estimated_delivery" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "promo_code_id" "uuid",
    "discount_amount" numeric DEFAULT 0
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."search_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "search_query" "text" NOT NULL,
    "category_filter" "text",
    "results_count" integer DEFAULT 0 NOT NULL,
    "filters_applied" "jsonb" DEFAULT '{}'::"jsonb",
    "search_duration_ms" integer,
    "clicked_result_id" "uuid",
    "clicked_result_position" integer,
    "session_id" "text",
    "user_agent" "text",
    "ip_address" "inet",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."search_analytics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."popular_searches" AS
 SELECT "search_analytics"."search_query",
    "count"(*) AS "search_count",
    "avg"("search_analytics"."results_count") AS "avg_results",
    "count"(DISTINCT "search_analytics"."user_id") AS "unique_users",
    "max"("search_analytics"."created_at") AS "last_searched"
   FROM "public"."search_analytics"
  WHERE (("search_analytics"."created_at" >= ("now"() - '30 days'::interval)) AND ("search_analytics"."search_query" IS NOT NULL) AND ("length"(TRIM(BOTH FROM "search_analytics"."search_query")) > 0))
  GROUP BY "search_analytics"."search_query"
  ORDER BY ("count"(*)) DESC
 LIMIT 100;


ALTER TABLE "public"."popular_searches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "answer" "text" NOT NULL,
    "is_seller" boolean DEFAULT false,
    "helpful_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variant_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "sku" "text",
    "variant_values" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "price_adjustment" numeric(10,2) DEFAULT 0,
    "inventory" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_variant_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "options" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "original_price" numeric(10,2),
    "category_id" "uuid",
    "inventory" integer DEFAULT 0 NOT NULL,
    "images" "text"[] DEFAULT '{}'::"text"[],
    "rating" numeric(3,2) DEFAULT 0,
    "review_count" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false,
    "is_prime" boolean DEFAULT false,
    "brand" "text",
    "specifications" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "color" "text",
    "fabric_type" "text",
    "origin" "text",
    "is_guell_plus" boolean DEFAULT false,
    "shipped_from" "text",
    "sold_by" "text",
    "recommended_uses" "text"[],
    "monthly_sold_count" integer,
    "videos" "text"[] DEFAULT '{}'::"text"[],
    "image_alt_text" "text"[] DEFAULT '{}'::"text"[],
    "slug" "text"
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promo_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "discount_type" "text" NOT NULL,
    "discount_value" numeric NOT NULL,
    "is_used" boolean DEFAULT false NOT NULL,
    "used_by" "uuid",
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    "max_uses" integer DEFAULT 1,
    "current_uses" integer DEFAULT 0,
    CONSTRAINT "promo_codes_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"text", 'fixed'::"text"]))),
    CONSTRAINT "promo_codes_discount_value_check" CHECK (("discount_value" > (0)::numeric))
);


ALTER TABLE "public"."promo_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promotional_blocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "image_path" "text",
    "background_color" "text" DEFAULT '#10b981'::"text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."promotional_blocks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."review_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "title" "text" NOT NULL,
    "comment" "text" NOT NULL,
    "images" "text"[] DEFAULT '{}'::"text"[],
    "helpful_count" integer DEFAULT 0,
    "verified_purchase" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shipping_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "base_cost" numeric DEFAULT 0 NOT NULL,
    "estimated_days_min" integer,
    "estimated_days_max" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."shipping_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shipping_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shipped_from" "text" DEFAULT 'GÜELL'::"text" NOT NULL,
    "sold_by" "text" DEFAULT 'GÜELL'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."shipping_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storefront_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "primary_cta_color" "text",
    "primary_cta_label" "text",
    "low_stock_threshold_default" integer,
    "enable_urgency_messaging" boolean,
    "show_secure_payment_badge_default" boolean,
    "show_satisfaction_badge_default" boolean,
    "show_fast_shipping_badge_default" boolean,
    "payment_methods" "text"[],
    "cart_payment_icons" "text"[],
    "cart_urgency_banner_text" "text",
    "cart_trust_badges" "text"[],
    "free_shipping_threshold" integer,
    "verified_stores" "text"[] DEFAULT '{}'::"text"[],
    "exit_intent_enabled" boolean,
    "exit_intent_title" "text",
    "exit_intent_message" "text",
    "exit_intent_offer" "text",
    "exit_intent_button_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."storefront_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "stripe_customer_id" "text",
    "subscribed" boolean DEFAULT false NOT NULL,
    "subscription_tier" "text",
    "subscription_end" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subscribers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "quantity" integer DEFAULT 1 NOT NULL,
    "frequency" "text" NOT NULL,
    "next_delivery_date" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "discount_percentage" numeric DEFAULT 5,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tax_rates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country" "text" NOT NULL,
    "state" "text",
    "rate" numeric NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tax_rates_rate_check" CHECK ((("rate" >= (0)::numeric) AND ("rate" <= (1)::numeric)))
);


ALTER TABLE "public"."tax_rates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."terms_and_conditions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" DEFAULT 'Terms and Conditions'::"text" NOT NULL,
    "content" "text" NOT NULL,
    "version" "text" DEFAULT '1.0'::"text" NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."terms_and_conditions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "phone" "text",
    "is_prime_member" boolean DEFAULT false,
    "prime_expires_at" timestamp with time zone,
    "addresses" "jsonb" DEFAULT '[]'::"jsonb",
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_admin" boolean DEFAULT false
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wishlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "product_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."wishlist" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wishlist_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "wishlist_owner_id" "uuid" NOT NULL,
    "share_token" "text" NOT NULL,
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."wishlist_shares" OWNER TO "postgres";


ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_sections"
    ADD CONSTRAINT "brand_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."browsing_history"
    ADD CONSTRAINT "browsing_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."browsing_history"
    ADD CONSTRAINT "browsing_history_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hero_banners"
    ADD CONSTRAINT "hero_banners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketing_tiles"
    ADD CONSTRAINT "marketing_tiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_answers"
    ADD CONSTRAINT "product_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_questions"
    ADD CONSTRAINT "product_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variant_options"
    ADD CONSTRAINT "product_variant_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variant_options"
    ADD CONSTRAINT "product_variant_options_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotional_blocks"
    ADD CONSTRAINT "promotional_blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_votes"
    ADD CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_votes"
    ADD CONSTRAINT "review_votes_review_id_user_id_key" UNIQUE ("review_id", "user_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."search_analytics"
    ADD CONSTRAINT "search_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipping_methods"
    ADD CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shipping_settings"
    ADD CONSTRAINT "shipping_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storefront_settings"
    ADD CONSTRAINT "storefront_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscribers"
    ADD CONSTRAINT "subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."subscribers"
    ADD CONSTRAINT "subscribers_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."subscribers"
    ADD CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_orders"
    ADD CONSTRAINT "subscription_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tax_rates"
    ADD CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."terms_and_conditions"
    ADD CONSTRAINT "terms_and_conditions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlist_shares"
    ADD CONSTRAINT "wishlist_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlist_shares"
    ADD CONSTRAINT "wishlist_shares_share_token_key" UNIQUE ("share_token");



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_user_id_product_id_key" UNIQUE ("user_id", "product_id");



CREATE INDEX "idx_browsing_history_user_id" ON "public"."browsing_history" USING "btree" ("user_id");



CREATE INDEX "idx_browsing_history_viewed_at" ON "public"."browsing_history" USING "btree" ("viewed_at" DESC);



CREATE INDEX "idx_categories_display_order" ON "public"."categories" USING "btree" ("display_order", "name");



CREATE INDEX "idx_deals_active" ON "public"."deals" USING "btree" ("is_active", "start_time", "end_time");



CREATE INDEX "idx_deals_product_id" ON "public"."deals" USING "btree" ("product_id");



CREATE INDEX "idx_order_status_history_order_id" ON "public"."order_status_history" USING "btree" ("order_id");



CREATE UNIQUE INDEX "idx_products_slug" ON "public"."products" USING "btree" ("slug");



CREATE INDEX "idx_reviews_product_id" ON "public"."reviews" USING "btree" ("product_id");



CREATE INDEX "idx_reviews_user_id" ON "public"."reviews" USING "btree" ("user_id");



CREATE INDEX "idx_search_analytics_created_at" ON "public"."search_analytics" USING "btree" ("created_at");



CREATE INDEX "idx_search_analytics_search_query" ON "public"."search_analytics" USING "btree" ("search_query");



CREATE INDEX "idx_search_analytics_user_id" ON "public"."search_analytics" USING "btree" ("user_id");



CREATE INDEX "idx_subscription_orders_next_delivery" ON "public"."subscription_orders" USING "btree" ("next_delivery_date") WHERE ("is_active" = true);



CREATE INDEX "idx_subscription_orders_user_id" ON "public"."subscription_orders" USING "btree" ("user_id");



CREATE INDEX "idx_wishlist_shares_token" ON "public"."wishlist_shares" USING "btree" ("share_token");



CREATE OR REPLACE TRIGGER "on_review_vote_change" AFTER INSERT OR DELETE ON "public"."review_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_review_helpful_count"();



CREATE OR REPLACE TRIGGER "trigger_generate_product_slug" BEFORE INSERT OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."generate_product_slug"();



CREATE OR REPLACE TRIGGER "update_brand_sections_updated_at" BEFORE UPDATE ON "public"."brand_sections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_hero_banners_updated_at" BEFORE UPDATE ON "public"."hero_banners" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_marketing_tiles_updated_at" BEFORE UPDATE ON "public"."marketing_tiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_promotional_blocks_updated_at" BEFORE UPDATE ON "public"."promotional_blocks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscription_orders_updated_at" BEFORE UPDATE ON "public"."subscription_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_terms_and_conditions_updated_at" BEFORE UPDATE ON "public"."terms_and_conditions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."browsing_history"
    ADD CONSTRAINT "browsing_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."browsing_history"
    ADD CONSTRAINT "browsing_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_answers"
    ADD CONSTRAINT "product_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."product_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_answers"
    ADD CONSTRAINT "product_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_questions"
    ADD CONSTRAINT "product_questions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_questions"
    ADD CONSTRAINT "product_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variant_options"
    ADD CONSTRAINT "product_variant_options_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_used_by_fkey" FOREIGN KEY ("used_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."review_votes"
    ADD CONSTRAINT "review_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_votes"
    ADD CONSTRAINT "review_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."search_analytics"
    ADD CONSTRAINT "search_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."subscribers"
    ADD CONSTRAINT "subscribers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_orders"
    ADD CONSTRAINT "subscription_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete hero banners" ON "public"."hero_banners" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can delete products" ON "public"."products" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can insert hero banners" ON "public"."hero_banners" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can insert order items" ON "public"."order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can insert products" ON "public"."products" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage brand sections" ON "public"."brand_sections" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage categories" ON "public"."categories" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage deals" ON "public"."deals" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage marketing tiles" ON "public"."marketing_tiles" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage order status history" ON "public"."order_status_history" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage promo codes" ON "public"."promo_codes" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage promotional blocks" ON "public"."promotional_blocks" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage shipping methods" ON "public"."shipping_methods" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage shipping settings" ON "public"."shipping_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage tax rates" ON "public"."tax_rates" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage variant options" ON "public"."product_variant_options" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can manage variants" ON "public"."product_variants" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can update hero banners" ON "public"."hero_banners" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can update order items" ON "public"."order_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can update orders" ON "public"."orders" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can update products" ON "public"."products" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can view all order items" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can view all orders" ON "public"."orders" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Admins can view all search analytics" ON "public"."search_analytics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."id" = "auth"."uid"()) AND ("user_profiles"."is_admin" = true)))));



CREATE POLICY "Anyone can view active deals" ON "public"."deals" FOR SELECT USING ((("is_active" = true) AND ("start_time" <= "now"()) AND ("end_time" >= "now"())));



CREATE POLICY "Anyone can view active hero banners" ON "public"."hero_banners" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view answers" ON "public"."product_answers" FOR SELECT USING (true);



CREATE POLICY "Anyone can view product variants" ON "public"."product_variants" FOR SELECT USING (true);



CREATE POLICY "Anyone can view products" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Anyone can view public wishlist shares" ON "public"."wishlist_shares" FOR SELECT USING ((("is_public" = true) OR ("auth"."uid"() = "wishlist_owner_id")));



CREATE POLICY "Anyone can view questions" ON "public"."product_questions" FOR SELECT USING (true);



CREATE POLICY "Anyone can view reviews" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Anyone can view variant options" ON "public"."product_variant_options" FOR SELECT USING (true);



CREATE POLICY "Anyone can view votes" ON "public"."review_votes" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can answer" ON "public"."product_answers" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can ask questions" ON "public"."product_questions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can create reviews" ON "public"."reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can validate specific promo codes" ON "public"."promo_codes" FOR SELECT TO "authenticated" USING (false);



CREATE POLICY "Authenticated users can vote" ON "public"."review_votes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Brand sections are publicly readable" ON "public"."brand_sections" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Categories are publicly readable" ON "public"."categories" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Everyone can read shipping settings" ON "public"."shipping_settings" FOR SELECT USING (true);



CREATE POLICY "Marketing tiles are publicly readable" ON "public"."marketing_tiles" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Only authenticated users can manage terms" ON "public"."terms_and_conditions" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Products are publicly readable" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Promotional blocks are publicly readable" ON "public"."promotional_blocks" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Shipping methods are publicly readable" ON "public"."shipping_methods" FOR SELECT USING (("is_active" = true));



CREATE POLICY "System can track browsing" ON "public"."browsing_history" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Tax rates are publicly readable" ON "public"."tax_rates" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Terms and conditions are viewable by everyone" ON "public"."terms_and_conditions" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Users can create their own subscriptions" ON "public"."subscription_orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete from their own wishlist" ON "public"."wishlist" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own cart items" ON "public"."cart_items" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own reviews" ON "public"."reviews" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own subscriptions" ON "public"."subscription_orders" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own cart items" ON "public"."cart_items" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own orders" ON "public"."orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own search analytics" ON "public"."search_analytics" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can insert their own subscription" ON "public"."subscribers" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") OR (("auth"."email"() = "email") AND ("user_id" IS NULL))));



CREATE POLICY "Users can insert to their own wishlist" ON "public"."wishlist" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own addresses" ON "public"."addresses" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own wishlist shares" ON "public"."wishlist_shares" USING (("auth"."uid"() = "wishlist_owner_id")) WITH CHECK (("auth"."uid"() = "wishlist_owner_id"));



CREATE POLICY "Users can remove their votes" ON "public"."review_votes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own cart items" ON "public"."cart_items" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own reviews" ON "public"."reviews" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own subscription" ON "public"."subscribers" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (("auth"."email"() = "email") AND ("user_id" IS NULL)))) WITH CHECK ((("auth"."uid"() = "user_id") OR (("auth"."email"() = "email") AND ("user_id" IS NULL))));



CREATE POLICY "Users can update their own subscriptions" ON "public"."subscription_orders" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view order items for their orders" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their order status history" ON "public"."order_status_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_status_history"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own cart items" ON "public"."cart_items" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own history" ON "public"."browsing_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own subscriptions" ON "public"."subscription_orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own wishlist" ON "public"."wishlist" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brand_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."browsing_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hero_banners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."marketing_tiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_status_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variant_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promo_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotional_blocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."search_analytics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_own_subscription" ON "public"."subscribers" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("email" = "auth"."email"())));



ALTER TABLE "public"."shipping_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shipping_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tax_rates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."terms_and_conditions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wishlist" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wishlist_shares" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."assign_basic_membership"() TO "anon";
GRANT ALL ON FUNCTION "public"."assign_basic_membership"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_basic_membership"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_product_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_product_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_product_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_share_token"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_share_token"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_share_token"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_promo_code_usage"("p_promo_code_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_promo_code_usage"("p_promo_code_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_promo_code_usage"("p_promo_code_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_read"("notification_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("notification_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_rating"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_review_helpful_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_review_helpful_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_review_helpful_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_user_subscription"("p_stripe_customer_id" "text", "p_subscription_tier" "text", "p_subscribed" boolean, "p_subscription_end" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_user_subscription"("p_stripe_customer_id" "text", "p_subscription_tier" "text", "p_subscribed" boolean, "p_subscription_end" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_user_subscription"("p_stripe_customer_id" "text", "p_subscription_tier" "text", "p_subscribed" boolean, "p_subscription_end" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_promo_code"("code_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_promo_code"("code_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_promo_code"("code_input" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON TABLE "public"."brand_sections" TO "anon";
GRANT ALL ON TABLE "public"."brand_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_sections" TO "service_role";



GRANT ALL ON TABLE "public"."browsing_history" TO "anon";
GRANT ALL ON TABLE "public"."browsing_history" TO "authenticated";
GRANT ALL ON TABLE "public"."browsing_history" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."deals" TO "anon";
GRANT ALL ON TABLE "public"."deals" TO "authenticated";
GRANT ALL ON TABLE "public"."deals" TO "service_role";



GRANT ALL ON TABLE "public"."hero_banners" TO "anon";
GRANT ALL ON TABLE "public"."hero_banners" TO "authenticated";
GRANT ALL ON TABLE "public"."hero_banners" TO "service_role";



GRANT ALL ON TABLE "public"."marketing_tiles" TO "anon";
GRANT ALL ON TABLE "public"."marketing_tiles" TO "authenticated";
GRANT ALL ON TABLE "public"."marketing_tiles" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."order_status_history" TO "anon";
GRANT ALL ON TABLE "public"."order_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."order_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."search_analytics" TO "anon";
GRANT ALL ON TABLE "public"."search_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."search_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."popular_searches" TO "anon";
GRANT ALL ON TABLE "public"."popular_searches" TO "authenticated";
GRANT ALL ON TABLE "public"."popular_searches" TO "service_role";



GRANT ALL ON TABLE "public"."product_answers" TO "anon";
GRANT ALL ON TABLE "public"."product_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."product_answers" TO "service_role";



GRANT ALL ON TABLE "public"."product_questions" TO "anon";
GRANT ALL ON TABLE "public"."product_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."product_questions" TO "service_role";



GRANT ALL ON TABLE "public"."product_variant_options" TO "anon";
GRANT ALL ON TABLE "public"."product_variant_options" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variant_options" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."promo_codes" TO "anon";
GRANT ALL ON TABLE "public"."promo_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."promo_codes" TO "service_role";



GRANT ALL ON TABLE "public"."promotional_blocks" TO "anon";
GRANT ALL ON TABLE "public"."promotional_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."promotional_blocks" TO "service_role";



GRANT ALL ON TABLE "public"."review_votes" TO "anon";
GRANT ALL ON TABLE "public"."review_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."review_votes" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."shipping_methods" TO "anon";
GRANT ALL ON TABLE "public"."shipping_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_methods" TO "service_role";



GRANT ALL ON TABLE "public"."shipping_settings" TO "anon";
GRANT ALL ON TABLE "public"."shipping_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_settings" TO "service_role";



GRANT ALL ON TABLE "public"."storefront_settings" TO "anon";
GRANT ALL ON TABLE "public"."storefront_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."storefront_settings" TO "service_role";



GRANT ALL ON TABLE "public"."subscribers" TO "anon";
GRANT ALL ON TABLE "public"."subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_orders" TO "anon";
GRANT ALL ON TABLE "public"."subscription_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_orders" TO "service_role";



GRANT ALL ON TABLE "public"."tax_rates" TO "anon";
GRANT ALL ON TABLE "public"."tax_rates" TO "authenticated";
GRANT ALL ON TABLE "public"."tax_rates" TO "service_role";



GRANT ALL ON TABLE "public"."terms_and_conditions" TO "anon";
GRANT ALL ON TABLE "public"."terms_and_conditions" TO "authenticated";
GRANT ALL ON TABLE "public"."terms_and_conditions" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."wishlist" TO "anon";
GRANT ALL ON TABLE "public"."wishlist" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlist" TO "service_role";



GRANT ALL ON TABLE "public"."wishlist_shares" TO "anon";
GRANT ALL ON TABLE "public"."wishlist_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlist_shares" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_basic_membership();


  create policy "Admins can delete category images"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'category-images'::text) AND (EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))));



  create policy "Admins can delete product images"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'product-images'::text) AND (EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))));



  create policy "Admins can update category images"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'category-images'::text) AND (EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))));



  create policy "Admins can update product images"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'product-images'::text) AND (EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))));



  create policy "Admins can upload category images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'category-images'::text) AND (EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))));



  create policy "Admins can upload product images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'product-images'::text) AND (EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))));



  create policy "Anyone can view product images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product-images'::text));



  create policy "Category images are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'category-images'::text));



