-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — blog_posts table
-- Run after admin-setup.sql (depends on the `admins` table).
-- Safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists blog_posts (
  id           bigserial primary key,
  slug         text unique not null,
  title        text not null,
  category     text default 'News',
  excerpt      text,
  body         text,
  author       text,
  hue          int  default 230,
  read_time    text default '5 min',
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on blog_posts (published_at desc);

alter table blog_posts enable row level security;

drop policy if exists "blog public read" on blog_posts;
create policy "blog public read"
  on blog_posts for select using (true);

drop policy if exists "blog admin write" on blog_posts;
create policy "blog admin write"
  on blog_posts for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));

-- Slug auto-generator (similar pattern to products)
create or replace function generate_blog_slug(input_title text)
returns text language plpgsql immutable as $$
declare s text;
begin
  s := lower(coalesce(input_title, ''));
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '^-+|-+$', '', 'g');
  if s = '' then s := 'post'; end if;
  return s;
end;
$$;

create or replace function unique_blog_slug(input_title text, current_id bigint)
returns text language plpgsql as $$
declare
  base text := generate_blog_slug(input_title);
  candidate text := base;
  n int := 1;
begin
  while exists (
    select 1 from blog_posts where slug = candidate
    and (current_id is null or id <> current_id)
  ) loop
    n := n + 1; candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;

create or replace function blog_posts_set_slug()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    if new.slug is null or new.slug = '' then
      new.slug := unique_blog_slug(new.title, new.id);
    end if;
  elsif (tg_op = 'UPDATE') then
    if new.slug is null or new.slug = '' then
      new.slug := unique_blog_slug(new.title, new.id);
    end if;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists blog_posts_slug_trigger on blog_posts;
create trigger blog_posts_slug_trigger
  before insert or update on blog_posts
  for each row execute procedure blog_posts_set_slug();
