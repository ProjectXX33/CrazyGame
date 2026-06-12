-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — add image_url column to product_variants
-- Each variant can have its own thumbnail (e.g. the actual gift-card art for
-- a specific PSN region/denomination).
-- Safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

alter table product_variants
  add column if not exists image_url text;

comment on column product_variants.image_url is
  'Optional public URL to a thumbnail for this variant. Overrides the parent product image on the customer-facing variant picker.';
