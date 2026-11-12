-- Проверка миграции 065_raster_pets.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
gone(code) as (values ('crown'), ('mortar'), ('starglasses'), ('tophat'), ('argyle'), ('lei'), ('sunglasses'), ('cap'), ('safari'),
                      ('lifebuoy'), ('striped'), ('jacket'), ('binoculars')),
checks(nn, what, ok) as (values
  -- С 067 питомцев, обликов и аур больше — поэтому «не меньше»
  (1, 'в магазине питомцы, облики и ауры; вещей (корона, шапочки, очки, одежда) нет',
      (select count(*) from shop_catalog()) >= 114
      and (select count(*) from shop_catalog() where kind = 'pet') >= 6
      and (select count(*) from shop_catalog() where kind = 'skin') >= 30
      and (select count(*) from shop_catalog() where kind = 'gear') >= 16
      and not exists (select 1 from shop_catalog() c where c.kind = 'gear' and c.code not like 'aura\_%')
      and not exists (select 1 from shop_catalog() c join gone g on g.code = c.code)),
  (2, 'у каждой ауры место — аура; своя аура питомца знает хозяина, ауры стихий и звёзд — всем',
      not exists (select 1 from shop_catalog() c where c.kind = 'gear' and pet_gear_slot(c.code) is distinct from 'aura')
      and pet_item_for('gear', 'aura_fire') is null and pet_item_for('gear', 'aura_star') is null
      and pet_item_for('gear', 'aura_leaves') = 'badger' and pet_item_for('gear', 'aura_fish') = 'penguin'
      and pet_gear_slot('crown') is null),
  (3, 'наборы: в каждом питомец и две его ауры за монеты',
      (select count(*) from shop_bundles()) >= 6
      and not exists (select 1 from shop_bundles() b cross join lateral unnest(b.items) as it(item)
                        left join shop_catalog() c on c.kind || ':' || c.code = it.item
                       where c.kind is null or c.coins = 0)
      and not exists (select 1 from shop_bundles() b cross join lateral unnest(b.items) as it(item)
                       where split_part(it.item, ':', 1) = 'gear'
                         and pet_item_for('gear', split_part(it.item, ':', 2)) is distinct from split_part(b.items[1], ':', 2))),
  (4, 'наряд питомца — аура и облик; прежних мест нет',
      exists (select 1 from fn where name = 'set_pet_gear' and src like '%''aura''%' and src like '%''skin''%' and src not like '%''head''%')),
  (5, 'вещи убраны из коллекций и нарядов, монеты возвращены; аура и облик остались надетыми',
      exists (select 1 from fn where name = 'raster_pets_cleanup')
      and not exists (select 1 from cosmetics c join gone g on g.code = c.code where c.kind = 'gear')
      and not exists (select 1 from students s cross join lateral jsonb_each(s.pet_gear) as e(k, v)
                       where jsonb_typeof(e.v) = 'object' and (e.v ? 'head' or e.v ? 'eyes' or e.v ? 'neck' or e.v ? 'body'))),
  (6, 'из игры: купить и надеть — можно; уборку запускает только база',
      has_function_privilege('anon', 'shop_buy(text,text,text,text)', 'execute')
      and has_function_privilege('anon', 'set_pet_gear(text,text,text,text)', 'execute')
      and not has_function_privilege('anon', 'raster_pets_cleanup()', 'execute'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
