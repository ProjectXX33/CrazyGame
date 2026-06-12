-- ────────────────────────────────────────────────────────────────────────────
-- Fix: "products no longer load from Supabase"
-- Most common cause after admin-setup.sql + slug-setup.sql:
--   RLS got enabled on `products` but the read policy is missing or broken,
--   so the anon key returns 0 rows (no error, just empty array).
--
-- This script is idempotent. Run it in Supabase → SQL Editor.
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Diagnose — these SELECTs print what's currently in place.
--    Look at the result panel after running.
do $$
declare
  rls_enabled bool;
  policy_count int;
  product_count int;
begin
  select relrowsecurity into rls_enabled
    from pg_class where relname = 'products' and relnamespace = 'public'::regnamespace;
  select count(*) into policy_count
    from pg_policies where schemaname = 'public' and tablename = 'products';
  select count(*) into product_count from products;

  raise notice '── products diagnostic ──';
  raise notice 'RLS enabled on products: %', rls_enabled;
  raise notice 'Policies on products: %', policy_count;
  raise notice 'Total rows in products: %', product_count;
end $$;

-- 2) Make sure RLS is on, and there is a permissive read policy for everyone.
alter table products enable row level security;

drop policy if exists "products public read" on products;
create policy "products public read"
  on products for select
  using (true);

-- 3) Admin-only writes (replaces any older permissive write).
drop policy if exists "products public write" on products;
drop policy if exists "products admin write" on products;
create policy "products admin write"
  on products for insert
  with check (exists (select 1 from admins where id = auth.uid()));

drop policy if exists "products admin update" on products;
create policy "products admin update"
  on products for update
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));

drop policy if exists "products admin delete" on products;
create policy "products admin delete"
  on products for delete
  using (exists (select 1 from admins where id = auth.uid()));

-- 4) Verify — should show > 0 rows.
select count(*) as product_count from products;
select id, name, slug from products order by id limit 5;
