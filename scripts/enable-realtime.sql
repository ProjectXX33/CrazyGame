-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — enable Supabase Realtime on customer-facing tables
-- Run once in Supabase → SQL Editor. After this, changes made in the dashboard
-- broadcast to every open tab automatically (admin & customer windows alike).
-- Safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array[
    'products',
    'product_variants',
    'blog_posts',
    'site_settings'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
      raise notice 'Realtime enabled: %', t;
    exception when duplicate_object then
      raise notice 'Realtime already enabled: %', t;
    when undefined_table then
      raise notice 'Skipping (table missing): %', t;
    end;
  end loop;
end $$;
