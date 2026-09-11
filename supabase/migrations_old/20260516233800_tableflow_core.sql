-- TableFlow Core
-- QR table ordering for restaurants inside the venue
-- Compatible with existing public.restaurants and public.fooditems tables

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- Helpers
-- =========================================================

CREATE OR REPLACE FUNCTION public.tableflow_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updatedat = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tableflow_generate_short_code(prefix TEXT DEFAULT 'TF')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  generated TEXT;
BEGIN
  generated := upper(prefix) || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  RETURN generated;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT isadmin
    FROM public.userprofiles
    WHERE id = auth.uid()
  ), false);
$$;

-- =========================================================
-- Enums via CHECK constraints
-- =========================================================

-- table status: active | inactive
-- session status: open | closed | cancelled
-- order status: draft | submitted | confirmed | preparing | ready | served | cancelled
-- payment mode: pay_now | pay_later
-- payment status: unpaid | pending | paid | failed | refunded | partially_paid
-- kitchen status: new | seen | preparing | ready | served | cancelled

-- =========================================================
-- TableFlow tables
-- =========================================================

CREATE TABLE IF NOT EXISTS public.tableflow_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurantid UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  tablenumber TEXT NOT NULL,
  tablelabel TEXT,
  qrtoken UUID NOT NULL DEFAULT gen_random_uuid(),
  seats INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  createdby UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurantid, tablenumber),
  UNIQUE (qrtoken)
);

CREATE TABLE IF NOT EXISTS public.tableflow_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurantid UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  tableid UUID NOT NULL REFERENCES public.tableflow_tables(id) ON DELETE CASCADE,
  sessioncode TEXT NOT NULL UNIQUE DEFAULT public.tableflow_generate_short_code('TS'),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  guestcount INTEGER NOT NULL DEFAULT 0 CHECK (guestcount >= 0),
  openedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closedat TIMESTAMPTZ,
  createdby UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tableflow_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessionid UUID NOT NULL REFERENCES public.tableflow_sessions(id) ON DELETE CASCADE,
  guestcode TEXT NOT NULL DEFAULT public.tableflow_generate_short_code('TG'),
  guestname TEXT,
  devicefingerprint TEXT,
  seatlabel TEXT,
  joinedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lastseenat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sessionid, guestcode)
);

CREATE TABLE IF NOT EXISTS public.tableflow_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurantid UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  tableid UUID NOT NULL REFERENCES public.tableflow_tables(id) ON DELETE RESTRICT,
  sessionid UUID NOT NULL REFERENCES public.tableflow_sessions(id) ON DELETE CASCADE,
  guestid UUID REFERENCES public.tableflow_guests(id) ON DELETE SET NULL,

  ordernumber TEXT NOT NULL UNIQUE DEFAULT public.tableflow_generate_short_code('TO'),
  localreference TEXT,
  externalpaymentreference TEXT,

  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),

  kitchenstatus TEXT NOT NULL DEFAULT 'new'
    CHECK (kitchenstatus IN ('new', 'seen', 'preparing', 'ready', 'served', 'cancelled')),

  paymentmode TEXT NOT NULL DEFAULT 'pay_later'
    CHECK (paymentmode IN ('pay_now', 'pay_later')),

  paymentstatus TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (paymentstatus IN ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'partially_paid')),

  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  servicefee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (servicefee >= 0),
  discountamount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discountamount >= 0),
  tipamount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tipamount >= 0),
  total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),

  totalitems INTEGER NOT NULL DEFAULT 0 CHECK (totalitems >= 0),
  paidamount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (paidamount >= 0),

  notes TEXT,
  cancellationreason TEXT,

  submittedat TIMESTAMPTZ,
  confirmedat TIMESTAMPTZ,
  preparingat TIMESTAMPTZ,
  readyat TIMESTAMPTZ,
  servedat TIMESTAMPTZ,
  cancelledat TIMESTAMPTZ,

  createdby UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tableflow_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderid UUID NOT NULL REFERENCES public.tableflow_orders(id) ON DELETE CASCADE,
  fooditemid UUID NOT NULL REFERENCES public.fooditems(id) ON DELETE RESTRICT,
  fooditemname TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unitprice NUMERIC(12,2) NOT NULL CHECK (unitprice >= 0),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  specialinstructions TEXT,
  modifiersnapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  itemstatus TEXT NOT NULL DEFAULT 'pending'
    CHECK (itemstatus IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tableflow_order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderid UUID NOT NULL REFERENCES public.tableflow_orders(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  provider TEXT,
  providerpaymentid TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  paidbyguestid UUID REFERENCES public.tableflow_guests(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tableflow_kitchen_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderid UUID NOT NULL REFERENCES public.tableflow_orders(id) ON DELETE CASCADE,
  fromstatus TEXT,
  tostatus TEXT NOT NULL,
  changedby UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  createdat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_tableflow_tables_restaurant
  ON public.tableflow_tables(restaurantid);

CREATE INDEX IF NOT EXISTS idx_tableflow_tables_qr
  ON public.tableflow_tables(qrtoken);

CREATE INDEX IF NOT EXISTS idx_tableflow_tables_status
  ON public.tableflow_tables(status);

CREATE INDEX IF NOT EXISTS idx_tableflow_sessions_restaurant
  ON public.tableflow_sessions(restaurantid);

CREATE INDEX IF NOT EXISTS idx_tableflow_sessions_table
  ON public.tableflow_sessions(tableid);

CREATE INDEX IF NOT EXISTS idx_tableflow_sessions_status
  ON public.tableflow_sessions(status);

CREATE INDEX IF NOT EXISTS idx_tableflow_guests_session
  ON public.tableflow_guests(sessionid);

CREATE INDEX IF NOT EXISTS idx_tableflow_orders_restaurant
  ON public.tableflow_orders(restaurantid);

CREATE INDEX IF NOT EXISTS idx_tableflow_orders_table
  ON public.tableflow_orders(tableid);

CREATE INDEX IF NOT EXISTS idx_tableflow_orders_session
  ON public.tableflow_orders(sessionid);

CREATE INDEX IF NOT EXISTS idx_tableflow_orders_guest
  ON public.tableflow_orders(guestid);

CREATE INDEX IF NOT EXISTS idx_tableflow_orders_status
  ON public.tableflow_orders(status);

CREATE INDEX IF NOT EXISTS idx_tableflow_orders_kitchenstatus
  ON public.tableflow_orders(kitchenstatus);

CREATE INDEX IF NOT EXISTS idx_tableflow_orders_paymentstatus
  ON public.tableflow_orders(paymentstatus);

CREATE INDEX IF NOT EXISTS idx_tableflow_orders_createdat
  ON public.tableflow_orders(createdat DESC);

CREATE INDEX IF NOT EXISTS idx_tableflow_order_items_order
  ON public.tableflow_order_items(orderid);

CREATE INDEX IF NOT EXISTS idx_tableflow_order_items_fooditem
  ON public.tableflow_order_items(fooditemid);

CREATE INDEX IF NOT EXISTS idx_tableflow_order_payments_order
  ON public.tableflow_order_payments(orderid);

CREATE INDEX IF NOT EXISTS idx_tableflow_kitchen_events_order
  ON public.tableflow_kitchen_events(orderid);

-- =========================================================
-- Triggers
-- =========================================================

DROP TRIGGER IF EXISTS trg_tableflow_tables_updated_at ON public.tableflow_tables;
CREATE TRIGGER trg_tableflow_tables_updated_at
BEFORE UPDATE ON public.tableflow_tables
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_set_updated_at();

DROP TRIGGER IF EXISTS trg_tableflow_sessions_updated_at ON public.tableflow_sessions;
CREATE TRIGGER trg_tableflow_sessions_updated_at
BEFORE UPDATE ON public.tableflow_sessions
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_set_updated_at();

DROP TRIGGER IF EXISTS trg_tableflow_guests_updated_at ON public.tableflow_guests;
CREATE TRIGGER trg_tableflow_guests_updated_at
BEFORE UPDATE ON public.tableflow_guests
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_set_updated_at();

DROP TRIGGER IF EXISTS trg_tableflow_orders_updated_at ON public.tableflow_orders;
CREATE TRIGGER trg_tableflow_orders_updated_at
BEFORE UPDATE ON public.tableflow_orders
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_set_updated_at();

DROP TRIGGER IF EXISTS trg_tableflow_order_items_updated_at ON public.tableflow_order_items;
CREATE TRIGGER trg_tableflow_order_items_updated_at
BEFORE UPDATE ON public.tableflow_order_items
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_set_updated_at();

DROP TRIGGER IF EXISTS trg_tableflow_order_payments_updated_at ON public.tableflow_order_payments;
CREATE TRIGGER trg_tableflow_order_payments_updated_at
BEFORE UPDATE ON public.tableflow_order_payments
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_set_updated_at();

-- =========================================================
-- Totals recalculation
-- =========================================================

CREATE OR REPLACE FUNCTION public.tableflow_recalculate_order_totals(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_subtotal NUMERIC(12,2);
  v_total_items INTEGER;
  v_tax NUMERIC(12,2);
  v_servicefee NUMERIC(12,2);
  v_discount NUMERIC(12,2);
  v_tip NUMERIC(12,2);
BEGIN
  SELECT
    COALESCE(SUM(subtotal), 0),
    COALESCE(SUM(quantity), 0)
  INTO v_subtotal, v_total_items
  FROM public.tableflow_order_items
  WHERE orderid = p_order_id
    AND itemstatus <> 'cancelled';

  SELECT
    COALESCE(tax, 0),
    COALESCE(servicefee, 0),
    COALESCE(discountamount, 0),
    COALESCE(tipamount, 0)
  INTO v_tax, v_servicefee, v_discount, v_tip
  FROM public.tableflow_orders
  WHERE id = p_order_id;

  UPDATE public.tableflow_orders
  SET
    subtotal = v_subtotal,
    totalitems = v_total_items,
    total = GREATEST(v_subtotal + v_tax + v_servicefee + v_tip - v_discount, 0)
  WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.tableflow_order_item_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.subtotal := ROUND((NEW.quantity::numeric * NEW.unitprice::numeric), 2);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tableflow_order_item_after_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.tableflow_recalculate_order_totals(COALESCE(NEW.orderid, OLD.orderid));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_tableflow_order_item_before_write ON public.tableflow_order_items;
CREATE TRIGGER trg_tableflow_order_item_before_write
BEFORE INSERT OR UPDATE ON public.tableflow_order_items
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_order_item_before_write();

DROP TRIGGER IF EXISTS trg_tableflow_order_item_after_write ON public.tableflow_order_items;
CREATE TRIGGER trg_tableflow_order_item_after_write
AFTER INSERT OR UPDATE OR DELETE ON public.tableflow_order_items
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_order_item_after_write();

-- =========================================================
-- Session guest count sync
-- =========================================================

CREATE OR REPLACE FUNCTION public.tableflow_sync_session_guest_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  v_session_id := COALESCE(NEW.sessionid, OLD.sessionid);

  UPDATE public.tableflow_sessions
  SET guestcount = (
    SELECT COUNT(*)
    FROM public.tableflow_guests
    WHERE sessionid = v_session_id
  )
  WHERE id = v_session_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_tableflow_sync_session_guest_count ON public.tableflow_guests;
CREATE TRIGGER trg_tableflow_sync_session_guest_count
AFTER INSERT OR UPDATE OR DELETE ON public.tableflow_guests
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_sync_session_guest_count();

-- =========================================================
-- Payment aggregation
-- =========================================================

CREATE OR REPLACE FUNCTION public.tableflow_sync_payment_status(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_order_total NUMERIC(12,2);
  v_paid NUMERIC(12,2);
BEGIN
  SELECT total INTO v_order_total
  FROM public.tableflow_orders
  WHERE id = p_order_id;

  SELECT COALESCE(SUM(amount), 0)
  INTO v_paid
  FROM public.tableflow_order_payments
  WHERE orderid = p_order_id
    AND status = 'paid';

  UPDATE public.tableflow_orders
  SET
    paidamount = v_paid,
    paymentstatus = CASE
      WHEN v_paid <= 0 THEN paymentstatus
      WHEN v_paid >= v_order_total THEN 'paid'
      ELSE 'partially_paid'
    END
  WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.tableflow_payment_after_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.tableflow_sync_payment_status(COALESCE(NEW.orderid, OLD.orderid));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_tableflow_payment_after_write ON public.tableflow_order_payments;
CREATE TRIGGER trg_tableflow_payment_after_write
AFTER INSERT OR UPDATE OR DELETE ON public.tableflow_order_payments
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_payment_after_write();

-- =========================================================
-- Kitchen event tracking
-- =========================================================

CREATE OR REPLACE FUNCTION public.tableflow_track_kitchen_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.kitchenstatus IS DISTINCT FROM OLD.kitchenstatus THEN
    INSERT INTO public.tableflow_kitchen_events (
      orderid,
      fromstatus,
      tostatus,
      changedby
    )
    VALUES (
      NEW.id,
      OLD.kitchenstatus,
      NEW.kitchenstatus,
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tableflow_track_kitchen_status_change ON public.tableflow_orders;
CREATE TRIGGER trg_tableflow_track_kitchen_status_change
AFTER UPDATE ON public.tableflow_orders
FOR EACH ROW
EXECUTE FUNCTION public.tableflow_track_kitchen_status_change();

-- =========================================================
-- Convenience RPCs
-- =========================================================

CREATE OR REPLACE FUNCTION public.tableflow_get_or_create_open_session(
  p_qr_token UUID
)
RETURNS public.tableflow_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_table public.tableflow_tables;
  v_session public.tableflow_sessions;
BEGIN
  SELECT *
  INTO v_table
  FROM public.tableflow_tables
  WHERE qrtoken = p_qr_token
    AND status = 'active'
  LIMIT 1;

  IF v_table.id IS NULL THEN
    RAISE EXCEPTION 'TABLEFLOW_TABLE_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_session
  FROM public.tableflow_sessions
  WHERE tableid = v_table.id
    AND status = 'open'
  ORDER BY openedat DESC
  LIMIT 1;

  IF v_session.id IS NULL THEN
    INSERT INTO public.tableflow_sessions (
      restaurantid,
      tableid,
      status
    )
    VALUES (
      v_table.restaurantid,
      v_table.id,
      'open'
    )
    RETURNING * INTO v_session;
  END IF;

  RETURN v_session;
END;
$$;

CREATE OR REPLACE FUNCTION public.tableflow_close_session(
  p_session_id UUID
)
RETURNS public.tableflow_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.tableflow_sessions;
BEGIN
  UPDATE public.tableflow_sessions
  SET
    status = 'closed',
    closedat = NOW()
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  RETURN v_session;
END;
$$;

-- =========================================================
-- Metrics views
-- =========================================================

CREATE OR REPLACE VIEW public.tableflow_restaurant_order_metrics AS
SELECT
  o.restaurantid,
  COUNT(*) AS totalorders,
  COUNT(*) FILTER (WHERE o.paymentstatus = 'paid') AS paidorders,
  COUNT(*) FILTER (WHERE o.paymentstatus IN ('unpaid', 'pending', 'partially_paid')) AS unpaidorpartialorders,
  COALESCE(SUM(o.total), 0)::NUMERIC(12,2) AS grosssales,
  COALESCE(SUM(o.paidamount), 0)::NUMERIC(12,2) AS paidinflow,
  COALESCE(AVG(o.total), 0)::NUMERIC(12,2) AS averageticket,
  MIN(o.createdat) AS firstorderat,
  MAX(o.createdat) AS lastorderat
FROM public.tableflow_orders o
WHERE o.status <> 'draft'
GROUP BY o.restaurantid;

CREATE OR REPLACE VIEW public.tableflow_restaurant_item_metrics AS
SELECT
  o.restaurantid,
  oi.fooditemid,
  oi.fooditemname,
  COALESCE(SUM(oi.quantity), 0) AS units_sold,
  COALESCE(SUM(oi.subtotal), 0)::NUMERIC(12,2) AS gross_revenue
FROM public.tableflow_order_items oi
JOIN public.tableflow_orders o
  ON o.id = oi.orderid
WHERE o.status <> 'cancelled'
  AND oi.itemstatus <> 'cancelled'
GROUP BY o.restaurantid, oi.fooditemid, oi.fooditemname;

-- =========================================================
-- RLS
-- =========================================================

ALTER TABLE public.tableflow_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tableflow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tableflow_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tableflow_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tableflow_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tableflow_order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tableflow_kitchen_events ENABLE ROW LEVEL SECURITY;

-- Public read for active table by QR is handled via RPC
-- Public access for direct table reads is denied by default

-- Admin policies
DROP POLICY IF EXISTS "Admins manage tableflow_tables" ON public.tableflow_tables;
CREATE POLICY "Admins manage tableflow_tables"
ON public.tableflow_tables
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins manage tableflow_sessions" ON public.tableflow_sessions;
CREATE POLICY "Admins manage tableflow_sessions"
ON public.tableflow_sessions
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins manage tableflow_guests" ON public.tableflow_guests;
CREATE POLICY "Admins manage tableflow_guests"
ON public.tableflow_guests
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins manage tableflow_orders" ON public.tableflow_orders;
CREATE POLICY "Admins manage tableflow_orders"
ON public.tableflow_orders
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins manage tableflow_order_items" ON public.tableflow_order_items;
CREATE POLICY "Admins manage tableflow_order_items"
ON public.tableflow_order_items
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins manage tableflow_order_payments" ON public.tableflow_order_payments;
CREATE POLICY "Admins manage tableflow_order_payments"
ON public.tableflow_order_payments
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins manage tableflow_kitchen_events" ON public.tableflow_kitchen_events;
CREATE POLICY "Admins manage tableflow_kitchen_events"
ON public.tableflow_kitchen_events
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Authenticated users can read restaurant-level TableFlow data only if admin for now
-- Public order creation will be done through RPC / edge function in next step

-- RPC permissions
REVOKE ALL ON FUNCTION public.tableflow_get_or_create_open_session(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tableflow_get_or_create_open_session(UUID) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.tableflow_close_session(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tableflow_close_session(UUID) TO authenticated;

COMMIT;