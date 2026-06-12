-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — product slug column + auto-generation
-- Run in Supabase → SQL Editor → New query → Run
-- Safe to re-run (idempotent).
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Add slug column (text, nullable for now; filled by trigger / backfill)
alter table products
  add column if not exists slug text;

-- 2) Slug generator — lowercases, strips non-alphanumeric, collapses hyphens.
--    For names with no ASCII chars (e.g. pure Arabic), returns 'product' so the
--    unique_product_slug() wrapper below can suffix it with -2, -3, etc.
create or replace function generate_product_slug(input_name text)
returns text
language plpgsql
immutable
as $$
declare
  s text;
begin
  s := lower(coalesce(input_name, ''));
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '^-+|-+$', '', 'g');
  if s = '' then s := 'product'; end if;
  return s;
end;
$$;

-- 3) Unique-slug helper — appends -2, -3, … on collision.
--    `current_id` excludes the row itself when used in BEFORE UPDATE triggers.
create or replace function unique_product_slug(input_name text, current_id bigint)
returns text
language plpgsql
as $$
declare
  base      text := generate_product_slug(input_name);
  candidate text := base;
  n         int  := 1;
begin
  while exists (
    select 1 from products
    where slug = candidate
      and (current_id is null or id <> current_id)
  ) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;

-- 4) BEFORE INSERT/UPDATE trigger
--    - On INSERT: if slug not provided, generate from name.
--    - On UPDATE: if name changed and slug was not manually edited, regenerate.
create or replace function products_set_slug()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    if new.slug is null or new.slug = '' then
      new.slug := unique_product_slug(new.name, new.id);
    end if;
  elsif (tg_op = 'UPDATE') then
    -- Regenerate if slug was cleared, or if name changed and slug wasn't manually set
    if new.slug is null or new.slug = '' then
      new.slug := unique_product_slug(new.name, new.id);
    elsif new.name is distinct from old.name and new.slug = old.slug then
      new.slug := unique_product_slug(new.name, new.id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists products_slug_trigger on products;
create trigger products_slug_trigger
  before insert or update on products
  for each row execute procedure products_set_slug();

-- 5) Backfill existing rows — done row-by-row so unique_product_slug() sees
--    slugs assigned earlier in the loop. (A bulk UPDATE would race and the
--    unique-index step below would then fail for duplicate names.)
do $$
declare
  r record;
begin
  for r in
    select id, name from products
    where slug is null or slug = ''
    order by id
  loop
    update products
      set slug = unique_product_slug(r.name, r.id)
      where id = r.id;
  end loop;
end $$;

-- 6) Unique index — guarantees no two products share a slug
create unique index if not exists products_slug_uniq on products(slug);
