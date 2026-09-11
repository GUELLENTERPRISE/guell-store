create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'tableflow_payment_choice'
  ) then
    create type public.tableflow_payment_choice as enum ('now', 'later');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'tableflow_session_status'
  ) then
    create type public.tableflow_session_status as enum ('draft', 'confirmed', 'closed', 'cancelled');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'tableflow_kitchen_status'
  ) then
    create type public.tableflow_kitchen_status as enum ('new', 'preparing', 'ready', 'served');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'tableflow_payment_status'
  ) then
    create type public.tableflow_payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end $$;

create table if not exists public.tableflow_tables (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null,
  table_number text not null,
  qr_slug text unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, table_number)
);

create table if not exists public.tableflow_sessions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null,
  table_id uuid not null references public.tableflow_tables(id) on delete cascade,
  guest_id text not null,
  guest_label text not null,
  status public.tableflow_session_status not null default 'draft',
  opened_at timestamptz not null default now(),
  submitted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (table_id, guest_id)
);

create table if not exists public.tableflow_orders (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null,
  table_id uuid not null references public.tableflow_tables(id) on delete restrict,
  session_id uuid not null references public.tableflow_sessions(id) on delete restrict,
  local_order_id text not null,
  payment_choice public.tableflow_payment_choice not null,
  session_status public.tableflow_session_status not null default 'confirmed',
  kitchen_status public.tableflow_kitchen_status not null default 'new',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  total_items integer not null default 0,
  submitted_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, local_order_id)
);

create table if not exists public.tableflow_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.tableflow_orders(id) on delete cascade,
  merchant_id uuid not null,
  food_item_id text,
  item_name text not null,
  item_image text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  modifiers jsonb not null default '[]'::jsonb,
  special_instructions text,
  line_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tableflow_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.tableflow_orders(id) on delete cascade,
  merchant_id uuid not null,
  amount numeric(12,2) not null check (amount >= 0),
  status public.tableflow_payment_status not null default 'pending',
  provider text,
  provider_reference text,
  paid_by_guest_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_tableflow_tables_merchant_id
  on public.tableflow_tables (merchant_id);

create index if not exists idx_tableflow_sessions_table_id
  on public.tableflow_sessions (table_id);

create index if not exists idx_tableflow_orders_table_id
  on public.tableflow_orders (table_id);

create index if not exists idx_tableflow_orders_session_id
  on public.tableflow_orders (session_id);

create index if not exists idx_tableflow_orders_merchant_submitted_at
  on public.tableflow_orders (merchant_id, submitted_at desc);

create index if not exists idx_tableflow_orders_kitchen_status
  on public.tableflow_orders (merchant_id, kitchen_status);

create index if not exists idx_tableflow_order_items_order_id
  on public.tableflow_order_items (order_id);

create index if not exists idx_tableflow_payments_order_id
  on public.tableflow_payments (order_id);