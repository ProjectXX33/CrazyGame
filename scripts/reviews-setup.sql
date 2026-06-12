-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — Product Reviews (real, moderated)
-- Run once in Supabase → SQL Editor. Safe to re-run (idempotent).
--
-- Customers (logged in) submit reviews → they start UNAPPROVED.
-- Admins approve/reject/delete from the dashboard.
-- Only approved reviews are public and counted in the star averages.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists reviews (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references products(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text not null default 'Customer',
  rating      int  not null check (rating between 1 and 5),
  title       text,
  body        text,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists reviews_product_idx  on reviews(product_id);
create index if not exists reviews_approved_idx on reviews(approved);
-- One review per customer per product
create unique index if not exists reviews_user_product_uniq
  on reviews(user_id, product_id) where user_id is not null;

alter table reviews enable row level security;

-- ── Read policies ────────────────────────────────────────────────────────────
drop policy if exists "reviews read approved" on reviews;
create policy "reviews read approved" on reviews
  for select using (approved = true);

drop policy if exists "reviews read own" on reviews;
create policy "reviews read own" on reviews
  for select using (auth.uid() = user_id);

drop policy if exists "reviews read admin" on reviews;
create policy "reviews read admin" on reviews
  for select using (exists (select 1 from admins a where a.id = auth.uid()));

-- ── Write policies ───────────────────────────────────────────────────────────
-- Logged-in customers may insert their OWN review, and cannot self-approve.
drop policy if exists "reviews insert own" on reviews;
create policy "reviews insert own" on reviews
  for insert with check (auth.uid() = user_id and approved = false);

-- Admins moderate.
drop policy if exists "reviews update admin" on reviews;
create policy "reviews update admin" on reviews
  for update using (exists (select 1 from admins a where a.id = auth.uid()));

drop policy if exists "reviews delete admin" on reviews;
create policy "reviews delete admin" on reviews
  for delete using (exists (select 1 from admins a where a.id = auth.uid()));

-- Table privileges (RLS still governs row visibility).
grant select, insert on reviews to authenticated;
grant select on reviews to anon;
grant update, delete on reviews to authenticated;

-- ── Approved-review stats per product (powers the star averages) ─────────────
-- security_invoker → the view obeys the caller's RLS, so it only ever
-- aggregates rows the caller can see (approved reviews are public).
drop view if exists product_review_stats;
create view product_review_stats
  with (security_invoker = true) as
  select product_id,
         round(avg(rating)::numeric, 2) as avg_rating,
         count(*)::int                  as review_count
  from reviews
  where approved = true
  group by product_id;

grant select on product_review_stats to anon, authenticated;

-- ── Optional: realtime so the storefront refreshes on approval ───────────────
-- (Run only if you want live updates; harmless if the publication already has it.)
do $$
begin
  begin
    alter publication supabase_realtime add table reviews;
  exception when duplicate_object then null;
  end;
end $$;
