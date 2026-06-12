-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — game_requests table
-- Stores customer "request a game" submissions. Public can INSERT,
-- only admins can SELECT / UPDATE / DELETE.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists game_requests (
  id          bigserial primary key,
  name        text not null,
  phone       text not null,
  game_title  text not null,
  image_url   text,
  status      text default 'new'  check (status in ('new', 'contacted', 'sourced', 'done', 'dropped')),
  notes       text,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists game_requests_status_idx on game_requests(status);
create index if not exists game_requests_created_idx on game_requests(created_at desc);

alter table game_requests enable row level security;

-- Anyone (including anon) can submit a request
drop policy if exists "game_requests insert public" on game_requests;
create policy "game_requests insert public"
  on game_requests for insert
  with check (true);

-- Admins only can read / update / delete
drop policy if exists "game_requests admin read" on game_requests;
create policy "game_requests admin read"
  on game_requests for select
  using (exists (select 1 from admins where id = auth.uid()));

drop policy if exists "game_requests admin update" on game_requests;
create policy "game_requests admin update"
  on game_requests for update
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));

drop policy if exists "game_requests admin delete" on game_requests;
create policy "game_requests admin delete"
  on game_requests for delete
  using (exists (select 1 from admins where id = auth.uid()));

-- Auto-bump updated_at on updates
create or replace function game_requests_touch()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists game_requests_touch_trigger on game_requests;
create trigger game_requests_touch_trigger
  before update on game_requests
  for each row execute procedure game_requests_touch();
