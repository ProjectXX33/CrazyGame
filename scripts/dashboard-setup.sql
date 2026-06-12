-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game admin dashboard — Supabase setup
-- Run this in Supabase → SQL Editor → New query → Run
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Settings table (hero config, section visibility, etc.)
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

-- Public read (so visitors see the same config)
drop policy if exists "site_settings public read" on site_settings;
create policy "site_settings public read"
  on site_settings for select using (true);

-- Public write — the admin-password gate lives in the app.
-- If you want stricter security later, switch to Supabase Auth and gate writes by JWT.
drop policy if exists "site_settings public write" on site_settings;
create policy "site_settings public write"
  on site_settings for all using (true) with check (true);

-- 2) Storage bucket for hero images
insert into storage.buckets (id, name, public)
  values ('site-assets', 'site-assets', true)
  on conflict (id) do update set public = true;

-- Public read on bucket
drop policy if exists "site-assets public read" on storage.objects;
create policy "site-assets public read"
  on storage.objects for select
  using (bucket_id = 'site-assets');

-- Public write/update/delete on bucket (admin-password gate in app)
drop policy if exists "site-assets public write" on storage.objects;
create policy "site-assets public write"
  on storage.objects for insert
  with check (bucket_id = 'site-assets');

drop policy if exists "site-assets public update" on storage.objects;
create policy "site-assets public update"
  on storage.objects for update
  using (bucket_id = 'site-assets');

drop policy if exists "site-assets public delete" on storage.objects;
create policy "site-assets public delete"
  on storage.objects for delete
  using (bucket_id = 'site-assets');

-- 3) (Optional) Make sure products RLS allows updates from anon key.
-- If product editing in the dashboard returns "permission denied", uncomment:
--
-- alter table products enable row level security;
-- drop policy if exists "products public read" on products;
-- create policy "products public read" on products for select using (true);
-- drop policy if exists "products public write" on products;
-- create policy "products public write" on products for all using (true) with check (true);
