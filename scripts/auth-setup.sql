-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game customer auth — Supabase setup
-- Run in Supabase → SQL Editor → New query → Run
-- Prerequisite: Supabase Auth → Providers → Email is enabled (it is by default).
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Customer profile table
-- id matches auth.users.id (1:1 relationship)
create table if not exists customers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text default '',
  phone text default '',
  address text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table customers enable row level security;

-- Each user can read their OWN profile
drop policy if exists "customers read own" on customers;
create policy "customers read own"
  on customers for select
  using (auth.uid() = id);

-- Each user can update their OWN profile
drop policy if exists "customers update own" on customers;
create policy "customers update own"
  on customers for update
  using (auth.uid() = id);

-- Allow anyone to insert their own row at signup (id must match auth uid)
drop policy if exists "customers insert own" on customers;
create policy "customers insert own"
  on customers for insert
  with check (auth.uid() = id OR auth.uid() IS NULL);

-- Public read for admin dashboard (uses anon key + app-level password gate).
-- If you switch to Supabase Auth for admin later, restrict this to a role check.
drop policy if exists "customers admin read" on customers;
create policy "customers admin read"
  on customers for select
  using (true);

-- 2) Auto-create customer row when a new auth user signs up
-- (Backup in case the client-side insert in src/auth.js fails)
create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_customer();

-- ────────────────────────────────────────────────────────────────────────────
-- Optional: confirm email setting
--   By default Supabase requires email confirmation. To skip it for testing:
--   Dashboard → Authentication → Providers → Email → "Confirm email" → OFF
-- ────────────────────────────────────────────────────────────────────────────
