-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — `product-images` storage bucket policies
-- Required for the dashboard's Image upload + Media library to work.
-- Run after admin-setup.sql (it depends on the `admins` table).
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Make sure the bucket exists & is public-readable
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do update set public = true;

-- 2) Public read (so customer-facing site can render product images)
drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- 3) Admin-only write/update/delete (dashboard uploads + Media library)
drop policy if exists "product-images admin insert" on storage.objects;
create policy "product-images admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from admins where id = auth.uid())
  );

drop policy if exists "product-images admin update" on storage.objects;
create policy "product-images admin update"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (select 1 from admins where id = auth.uid())
  );

drop policy if exists "product-images admin delete" on storage.objects;
create policy "product-images admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (select 1 from admins where id = auth.uid())
  );
