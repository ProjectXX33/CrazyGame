-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game admin auth — Supabase setup
-- Run AFTER auth-setup.sql.
-- Switches the dashboard from a shared password to per-user Supabase Auth.
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Admins table — every row = a user who can sign into /dashboard.
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

-- Authenticated users can check whether their OWN id is an admin.
-- This is the check src/auth.js -> isAdmin() does.
-- This is the ONLY policy on `admins` — do not add a self-referential one
-- (e.g. "exists (select from admins …)"), it causes infinite recursion and
-- breaks every other policy that checks admin status.
-- New admins are added via Supabase SQL Editor (service_role bypasses RLS).
drop policy if exists "admins read self" on admins;
create policy "admins read self"
  on admins for select
  using (auth.uid() = id);

-- (intentionally no "admins manage" policy — see comment above)
drop policy if exists "admins manage" on admins;

-- 2) Promote mohamed.salem1107@gmail.com to admin.
insert into admins (id, email)
  values ('5b979b08-e5b3-4213-8799-21d51b192b43', 'mohamed.salem1107@gmail.com')
  on conflict (id) do nothing;

-- 3) Tighten site_settings + storage writes to admins-only (replaces the
--    permissive public-write policies from dashboard-setup.sql).
drop policy if exists "site_settings public write" on site_settings;
drop policy if exists "site_settings admin write" on site_settings;
create policy "site_settings admin write"
  on site_settings for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));

drop policy if exists "site-assets public write" on storage.objects;
drop policy if exists "site-assets public update" on storage.objects;
drop policy if exists "site-assets public delete" on storage.objects;

drop policy if exists "site-assets admin write" on storage.objects;
create policy "site-assets admin write"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and exists (select 1 from admins where id = auth.uid()));

drop policy if exists "site-assets admin update" on storage.objects;
create policy "site-assets admin update"
  on storage.objects for update
  using (bucket_id = 'site-assets' and exists (select 1 from admins where id = auth.uid()));

drop policy if exists "site-assets admin delete" on storage.objects;
create policy "site-assets admin delete"
  on storage.objects for delete
  using (bucket_id = 'site-assets' and exists (select 1 from admins where id = auth.uid()));

-- 4) Allow admins to read ALL customers (the dashboard Customers tab).
--    The "customers admin read" policy in auth-setup.sql was wide-open; tighten it.
drop policy if exists "customers admin read" on customers;
create policy "customers admin read"
  on customers for select
  using (exists (select 1 from admins where id = auth.uid()));

-- 5) Allow admins to edit products from the dashboard.
alter table products enable row level security;
drop policy if exists "products public read" on products;
create policy "products public read" on products for select using (true);
drop policy if exists "products admin write" on products;
create policy "products admin write"
  on products for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));
