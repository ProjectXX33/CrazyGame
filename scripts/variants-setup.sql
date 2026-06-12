-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — Product variants (denominations for gift cards)
-- Run in Supabase → SQL Editor → New query → Run
-- Safe to re-run (variants are upserted by product+label).
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Variants table — one row per denomination (e.g. "$10", "100$ EGP5,555")
create table if not exists product_variants (
  id          bigserial primary key,
  product_id  bigint    not null references products(id) on delete cascade,
  label       text      not null,                  -- e.g. "10$", "50 Euro", "1100 YEN"
  price       numeric   not null,                  -- in EGP
  sort_order  int       not null default 0,
  created_at  timestamptz not null default now(),
  unique (product_id, label)
);

create index if not exists product_variants_product_idx on product_variants(product_id);

alter table product_variants enable row level security;

drop policy if exists "variants public read" on product_variants;
create policy "variants public read"
  on product_variants for select using (true);

drop policy if exists "variants admin write" on product_variants;
create policy "variants admin write"
  on product_variants for all
  using (exists (select 1 from admins where id = auth.uid()))
  with check (exists (select 1 from admins where id = auth.uid()));

-- 2) Seeder — finds the first product matching the ILIKE pattern, then upserts
--    its full set of variants from a JSON array of {label, price}.
create or replace function seed_product_variants(name_pattern text, variants jsonb)
returns text
language plpgsql
as $$
declare
  pid bigint;
  v jsonb;
  i int := 0;
begin
  select id into pid
    from products
    where name ilike name_pattern
    order by id
    limit 1;

  if pid is null then
    return 'SKIPPED: no product matches ' || name_pattern;
  end if;

  for v in select * from jsonb_array_elements(variants) loop
    i := i + 1;
    insert into product_variants (product_id, label, price, sort_order)
    values (pid, v->>'label', (v->>'price')::numeric, i)
    on conflict (product_id, label)
      do update set price = excluded.price, sort_order = excluded.sort_order;
  end loop;

  return 'OK: product ' || pid || ' got ' || i || ' variants';
end;
$$;

-- 3) Seed the data
select seed_product_variants('%psn%bahr%', '[
  {"label":"10$",  "price":605},
  {"label":"20$",  "price":1133},
  {"label":"40$",  "price":2324},
  {"label":"50$",  "price":2857},
  {"label":"60$",  "price":3410},
  {"label":"70$",  "price":3960},
  {"label":"100$", "price":5555}
]'::jsonb) as bahrain;

select seed_product_variants('%psn%canad%', '[
  {"label":"50$", "price":2640}
]'::jsonb) as canada;

select seed_product_variants('%psn%franc%', '[
  {"label":"10 Euro", "price":618},
  {"label":"20 Euro", "price":1236},
  {"label":"25 Euro", "price":1489},
  {"label":"50 Euro", "price":3090},
  {"label":"60 Euro", "price":3708}
]'::jsonb) as france;

select seed_product_variants('%psn%japan%', '[
  {"label":"1100 YEN", "price":1100},
  {"label":"3000 YEN", "price":2365}
]'::jsonb) as japan;

select seed_product_variants('%psn%oman%', '[
  {"label":"10$",  "price":578},
  {"label":"20$",  "price":1128},
  {"label":"40$",  "price":2310},
  {"label":"50$",  "price":2915},
  {"label":"60$",  "price":3410},
  {"label":"70$",  "price":3960},
  {"label":"100$", "price":5775}
]'::jsonb) as oman;

select seed_product_variants('%psn%leb%', '[
  {"label":"10$", "price":578},
  {"label":"20$", "price":1155},
  {"label":"30$", "price":1733},
  {"label":"34$", "price":1876},
  {"label":"40$", "price":2310},
  {"label":"50$", "price":2819},
  {"label":"60$", "price":3465},
  {"label":"70$", "price":4043},
  {"label":"83$", "price":4573}
]'::jsonb) as lebanon;

select seed_product_variants('%psn%kuwait%', '[
  {"label":"10$",  "price":578},
  {"label":"20$",  "price":1128},
  {"label":"40$",  "price":2228},
  {"label":"50$",  "price":2750},
  {"label":"60$",  "price":3300},
  {"label":"70$",  "price":3850},
  {"label":"100$", "price":5500}
]'::jsonb) as kuwait;

select seed_product_variants('%psn%ksa%', '[
  {"label":"10$",  "price":605},
  {"label":"40$",  "price":2365},
  {"label":"50$",  "price":2970},
  {"label":"60$",  "price":3575},
  {"label":"70$",  "price":4015},
  {"label":"100$", "price":5500},
  {"label":"120$", "price":6600},
  {"label":"160$", "price":8800},
  {"label":"200$", "price":11000}
]'::jsonb) as ksa;

select seed_product_variants('%psn%qatar%', '[
  {"label":"10$",  "price":633},
  {"label":"20$",  "price":1210},
  {"label":"40$",  "price":2365},
  {"label":"45$",  "price":2613},
  {"label":"50$",  "price":3135},
  {"label":"60$",  "price":3520},
  {"label":"70$",  "price":4087},
  {"label":"100$", "price":6160}
]'::jsonb) as qatar;

select seed_product_variants('%psn%uae%', '[
  {"label":"60$",  "price":3300},
  {"label":"120$", "price":6609},
  {"label":"160$", "price":8812},
  {"label":"200$", "price":11015}
]'::jsonb) as uae;

-- 4) Verify — should list every PSN product with its variants
select p.id, p.name, count(v.*) as variant_count,
       string_agg(v.label || '=' || v.price, ', ' order by v.sort_order) as variants
  from products p
  left join product_variants v on v.product_id = p.id
  where p.name ilike '%psn%'
  group by p.id, p.name
  order by p.id;
