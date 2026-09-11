create extension if not exists pgcrypto;

create table if not exists public.tableflow_tables (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null,
  table_number text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tableflow_tables_merchant_table_unique
    unique (merchant_id, table_number)
);

create table if not exists public.tableflow_sessions (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null,
  table_number text not null,
  guest_id text not null,
  guest_name text,
  status text not null default 'open'
    check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tableflow_sessions_guest_unique
    unique (merchant_id, table_number, guest_id),
  constraint tableflow_sessions_table_fk
    foreign key (merchant_id, table_number)
    references public.tableflow_tables (merchant_id, table_number)
    on delete cascade
);

create table if not exists public.tableflow_orders (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null,
  table_number text not null,
  session_id uuid references public.tableflow_sessions(id) on delete set null,
  guest_id text not null,
  guest_name text,
  local_order_id text not null unique,
  payment_choice text not null
    check (payment_choice in ('later', 'split', 'full')),
  status text not null default 'confirmed'
    check (status in ('draft', 'confirmed', 'sent', 'cancelled')),
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0 check (subtotal >= 0),
  tax numeric(10,2) not null default 0 check (tax >= 0),
  total numeric(10,2) not null default 0 check (total >= 0),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tableflow_orders_table_fk
    foreign key (merchant_id, table_number)
    references public.tableflow_tables (merchant_id, table_number)
    on delete cascade
);

create index if not exists idx_tableflow_tables_merchant_table
  on public.tableflow_tables (merchant_id, table_number);

create index if not exists idx_tableflow_sessions_merchant_table
  on public.tableflow_sessions (merchant_id, table_number);

create index if not exists idx_tableflow_sessions_guest
  on public.tableflow_sessions (guest_id);

create index if not exists idx_tableflow_orders_merchant_table
  on public.tableflow_orders (merchant_id, table_number);

create index if not exists idx_tableflow_orders_session_id
  on public.tableflow_orders (session_id);

create index if not exists idx_tableflow_orders_submitted_at
  on public.tableflow_orders (submitted_at desc);

create index if not exists idx_tableflow_orders_local_order_id
  on public.tableflow_orders (local_order_id);

alter table public.tableflow_tables enable row level security;
alter table public.tableflow_sessions enable row level security;
alter table public.tableflow_orders enable row level security;

drop policy if exists "TableFlow tables are readable" on public.tableflow_tables;
create policy "TableFlow tables are readable"
on public.tableflow_tables
for select
using (true);

drop policy if exists "TableFlow tables are insertable" on public.tableflow_tables;
create policy "TableFlow tables are insertable"
on public.tableflow_tables
for insert
with check (true);

drop policy if exists "TableFlow tables are updatable" on public.tableflow_tables;
create policy "TableFlow tables are updatable"
on public.tableflow_tables
for update
using (true);

drop policy if exists "TableFlow sessions are readable" on public.tableflow_sessions;
create policy "TableFlow sessions are readable"
on public.tableflow_sessions
for select
using (true);

drop policy if exists "TableFlow sessions are insertable" on public.tableflow_sessions;
create policy "TableFlow sessions are insertable"
on public.tableflow_sessions
for insert
with check (true);

drop policy if exists "TableFlow sessions are updatable" on public.tableflow_sessions;
create policy "TableFlow sessions are updatable"
on public.tableflow_sessions
for update
using (true);

drop policy if exists "TableFlow orders are readable" on public.tableflow_orders;
create policy "TableFlow orders are readable"
on public.tableflow_orders
for select
using (true);

drop policy if exists "TableFlow orders are insertable" on public.tableflow_orders;
create policy "TableFlow orders are insertable"
on public.tableflow_orders
for insert
with check (true);

drop policy if exists "TableFlow orders are updatable" on public.tableflow_orders;
create policy "TableFlow orders are updatable"
on public.tableflow_orders
for update
using (true);

drop trigger if exists update_tableflow_tables_updated_at on public.tableflow_tables;
create trigger update_tableflow_tables_updated_at
before update on public.tableflow_tables
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_tableflow_sessions_updated_at on public.tableflow_sessions;
create trigger update_tableflow_sessions_updated_at
before update on public.tableflow_sessions
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_tableflow_orders_updated_at on public.tableflow_orders;
create trigger update_tableflow_orders_updated_at
before update on public.tableflow_orders
for each row
execute function public.update_updated_at_column();