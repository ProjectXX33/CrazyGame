-- ────────────────────────────────────────────────────────────────────────────
-- Crazy Game — atomic stock decrement
-- A safe RPC the customer cart calls when "Place order" is pressed.
-- Atomically subtracts each ordered qty from the matching product row.
-- Returns the new stock for each product so the UI can refetch.
-- ────────────────────────────────────────────────────────────────────────────

-- Takes a JSON array like:
--   [{"product_id": 12, "qty": 2}, {"product_id": 84, "qty": 1}]
-- Skips digital items / rows with NULL stock (treated as unlimited).
create or replace function decrement_stock(items jsonb)
returns table (product_id bigint, new_stock int)
language plpgsql
security definer
set search_path = public
as $$
declare
  it jsonb;
  pid bigint;
  q   int;
  cur_stock int;
begin
  for it in select * from jsonb_array_elements(items) loop
    pid := (it->>'product_id')::bigint;
    q   := greatest(0, coalesce((it->>'qty')::int, 0));
    if pid is null or q = 0 then continue; end if;

    select stock into cur_stock from products where id = pid for update;
    if cur_stock is null then
      -- Unlimited stock — skip.
      continue;
    end if;

    update products
       set stock     = greatest(0, cur_stock - q),
           in_stock  = (greatest(0, cur_stock - q) > 0)
     where id = pid
     returning products.id, products.stock
     into product_id, new_stock;
    return next;
  end loop;
end;
$$;

grant execute on function decrement_stock(jsonb) to anon, authenticated;
