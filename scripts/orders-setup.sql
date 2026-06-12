-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — orders table
-- Customer-facing checkout writes here. Admins manage via the dashboard.
-- Safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists orders (
  id            bigserial primary key,
  user_id       uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone         text not null,
  email         text,
  address       text,
  city          text,
  governorate   text,
  payment_method text default 'cod',
  items         jsonb not null default '[]'::jsonb,
  subtotal      numeric not null default 0,
  shipping      numeric not null default 0,
  total         numeric not null default 0,
  item_count    int not null default 0,
  status        text not null default 'new'
                check (status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists orders_status_idx     on orders(status);
create index if not exists orders_created_idx    on orders(created_at desc);
create index if not exists orders_user_idx       on orders(user_id);

alter table orders enable row level security;

-- Anyone can place an order (no login required for cash-on-delivery)
drop policy if exists "orders public insert" on orders;
create policy "orders public insert"
  on orders for insert
  with check (true);

-- A signed-in customer can read THEIR OWN orders
drop policy if exists "orders read own" on orders;
create policy "orders read own"
  on orders for select
  using (auth.uid() is not null and auth.uid() = user_id);

-- Admins see/edit/delete every order
drop policy if exists "orders admin read" on orders;
create policy "orders admin read"
  on orders for select
  using (exists (select 1 from admins where id = auth.uid()));

drop policy if exists "orders admin update" on orders;
create policy "orders admin update"
  on orders for update
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));

drop policy if exists "orders admin delete" on orders;
create policy "orders admin delete"
  on orders for delete
  using (exists (select 1 from admins where id = auth.uid()));

-- Auto-bump updated_at on updates
create or replace function orders_touch()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists orders_touch_trigger on orders;
create trigger orders_touch_trigger
  before update on orders
  for each row execute procedure orders_touch();
