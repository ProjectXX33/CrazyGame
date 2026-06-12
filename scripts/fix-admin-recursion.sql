-- ────────────────────────────────────────────────────────────────────────────
-- Fix: "infinite recursion detected in policy for relation admins"
--
-- Cause: admin-setup.sql gave the `admins` table a policy that queries
-- `admins` itself:
--   create policy "admins manage" on admins for all
--     using (exists (select 1 from admins a where a.id = auth.uid()))
-- → every read of `admins` triggers another read of `admins` → infinite loop.
--
-- This also broke every other table whose RLS does `exists (… admins …)` —
-- products, product_variants, site_settings, storage. So fetches return 500.
--
-- Fix: drop the recursive policy. The remaining "admins read self" policy
-- (auth.uid() = id) is enough for the app — every admin check is "is MY uid
-- in admins?", and that question can be answered with self-read only.
--
-- New admins are added via the SQL Editor (service_role bypasses RLS), not
-- through the app, so we don't need a self-managing policy at all.
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Drop the recursive policy on `admins`
drop policy if exists "admins manage" on admins;

-- 2) Make sure self-read still exists (idempotent)
drop policy if exists "admins read self" on admins;
create policy "admins read self"
  on admins for select
  using (auth.uid() = id);

-- 3) Verify — should return your uid if you're an admin (when logged in via the API).
--    Running this in the SQL Editor (service_role) lists ALL admins.
select id, email, created_at from admins;

-- ────────────────────────────────────────────────────────────────────────────
-- After running, refresh the site. Products + variants + settings should load.
-- ────────────────────────────────────────────────────────────────────────────
