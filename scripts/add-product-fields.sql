-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — add gallery/screenshots column to products
-- Safe to re-run (idempotent).
-- ────────────────────────────────────────────────────────────────────────────

alter table products
  add column if not exists screenshots text[] default '{}'::text[];

-- The `description` (long form) column already exists from the importer, but
-- guard it just in case:
alter table products
  add column if not exists description text;

comment on column products.screenshots is
  'Array of public image URLs for the product gallery / screenshots.';
