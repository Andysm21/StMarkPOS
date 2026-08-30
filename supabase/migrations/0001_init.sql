-- St.Mark Borg El Arab Cantine — initial schema
-- Run this whole file in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

-- ========== TABLES ==========

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text,
  price numeric not null default 0,
  quantity_on_hand int not null default 0,
  image_url text,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists tabs (
  id uuid primary key default gen_random_uuid(),
  tab_number int not null,
  customer_name_ar text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  total_charged numeric not null default 0,
  total_paid numeric not null default 0,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists tab_items (
  id uuid primary key default gen_random_uuid(),
  tab_id uuid not null references tabs(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name_snapshot text not null,
  price_snapshot numeric not null,
  qty int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  tab_id uuid not null references tabs(id) on delete cascade,
  amount numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists quick_sales (
  id uuid primary key default gen_random_uuid(),
  total numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists quick_sale_items (
  id uuid primary key default gen_random_uuid(),
  quick_sale_id uuid not null references quick_sales(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name_snapshot text not null,
  price_snapshot numeric not null,
  qty int not null default 1
);

create table if not exists usage_counter (
  id int primary key default 1,
  estimated_bytes_used bigint not null default 0,
  last_reset_at timestamptz not null default now(),
  constraint usage_counter_single_row check (id = 1)
);

insert into usage_counter (id, estimated_bytes_used, last_reset_at)
values (1, 0, now())
on conflict (id) do nothing;

create table if not exists settings (
  key text primary key,
  value text
);

insert into settings (key, value) values
  ('usage_threshold_bytes', '400000000'),
  ('low_stock_threshold', '5')
on conflict (key) do nothing;

-- ========== INDEXES ==========

create index if not exists idx_tabs_status on tabs(status);
create index if not exists idx_tabs_tab_number on tabs(tab_number);
create index if not exists idx_tab_items_tab_id on tab_items(tab_id);
create index if not exists idx_payments_tab_id on payments(tab_id);
create index if not exists idx_quick_sale_items_sale_id on quick_sale_items(quick_sale_id);

-- ========== TRIGGERS: keep tabs.total_charged / total_paid in sync ==========

create or replace function recompute_tab_totals() returns trigger as $$
declare
  v_tab_id uuid;
begin
  v_tab_id := coalesce(new.tab_id, old.tab_id);

  update tabs
  set
    total_charged = coalesce((select sum(price_snapshot * qty) from tab_items where tab_id = v_tab_id), 0),
    total_paid = coalesce((select sum(amount) from payments where tab_id = v_tab_id), 0)
  where id = v_tab_id;

  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists trg_tab_items_recompute on tab_items;
create trigger trg_tab_items_recompute
after insert or update or delete on tab_items
for each row execute function recompute_tab_totals();

drop trigger if exists trg_payments_recompute on payments;
create trigger trg_payments_recompute
after insert or update or delete on payments
for each row execute function recompute_tab_totals();

-- ========== ROW LEVEL SECURITY (deny-all; app uses the service-role key server-side only) ==========

alter table products enable row level security;
alter table tabs enable row level security;
alter table tab_items enable row level security;
alter table payments enable row level security;
alter table quick_sales enable row level security;
alter table quick_sale_items enable row level security;
alter table usage_counter enable row level security;
alter table settings enable row level security;

drop policy if exists deny_all on products;
create policy deny_all on products for all using (false) with check (false);

drop policy if exists deny_all on tabs;
create policy deny_all on tabs for all using (false) with check (false);

drop policy if exists deny_all on tab_items;
create policy deny_all on tab_items for all using (false) with check (false);

drop policy if exists deny_all on payments;
create policy deny_all on payments for all using (false) with check (false);

drop policy if exists deny_all on quick_sales;
create policy deny_all on quick_sales for all using (false) with check (false);

drop policy if exists deny_all on quick_sale_items;
create policy deny_all on quick_sale_items for all using (false) with check (false);

drop policy if exists deny_all on usage_counter;
create policy deny_all on usage_counter for all using (false) with check (false);

drop policy if exists deny_all on settings;
create policy deny_all on settings for all using (false) with check (false);
