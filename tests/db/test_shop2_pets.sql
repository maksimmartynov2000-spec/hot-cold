\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Магазин 2.0 и питомцы (миграция 063): редкость, товары дня, наборы,
-- питомец, вещи на нём, опыт, градусник и эффект победы. Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null, pet = null, pet_gear = '{}'::jsonb, thermo = null, winfx = null,
                      tz = 'Pacific/Pago_Pago'
   where username in ('Лев', 'Кира', 'Максим');
  delete from wallet_log where username in ('Лев', 'Кира', 'Максим');
  delete from wallet where username in ('Лев', 'Кира', 'Максим');
  delete from cosmetics where username in ('Лев', 'Кира', 'Максим');
  delete from pet_xp where username in ('Лев', 'Кира', 'Максим');
  delete from shop_deals where username in ('Лев', 'Кира', 'Максим');
  delete from online_days where username in ('Лев', 'Кира', 'Максим');
  insert into wallet(username, coins, gems) values ('Лев', 5000, 200), ('Кира', 100, 0), ('Максим', 2000, 100);
end $$;
\echo ok

\echo === 1. каталог: 75 товаров, у каждого редкость; в игре и в базе одинаково; наборы — в одной валюте
create temp table js_rar(kind text, code text, rarity text);
\copy js_rar from 'shop_rar_js.csv' with (format csv, header true)
create temp table js_bundles(code text, currency text, pct int, items text);
\copy js_bundles from 'shop_bundles_js.csv' with (format csv, header true)
do $$ begin
  if (select count(*) from shop_catalog()) <> 75 then raise exception 'ОШИБКА: товаров %', (select count(*) from shop_catalog()); end if;
  if exists (select 1 from shop_catalog() c where c.rarity not in ('common', 'rare', 'epic', 'legend')) then raise exception 'ОШИБКА: редкость'; end if;
  if exists (select c.kind, c.code, c.rarity from shop_catalog() c except select j.kind, j.code, j.rarity from js_rar j)
     or exists (select j.kind, j.code, j.rarity from js_rar j except select c.kind, c.code, c.rarity from shop_catalog() c) then
    raise exception 'ОШИБКА: редкость в игре и в базе разная';
  end if;
  if exists (select b.code, b.currency, b.pct, array_to_string(b.items, '|') from shop_bundles() b
             except select j.code, j.currency, j.pct, j.items from js_bundles j)
     or exists (select j.code, j.currency, j.pct, j.items from js_bundles j
                except select b.code, b.currency, b.pct, array_to_string(b.items, '|') from shop_bundles() b) then
    raise exception 'ОШИБКА: наборы в игре и в базе разные';
  end if;
  if exists (select 1 from shop_bundles() b cross join lateral unnest(b.items) as it(item)
               left join shop_catalog() c on c.kind || ':' || c.code = it.item
              where c.kind is null or (b.currency = 'coins' and c.coins = 0) or (b.currency = 'gems' and c.gems = 0)) then
    raise exception 'ОШИБКА: в наборе вещь не той валюты или её нет';
  end if;
  if exists (select 1 from shop_catalog() c where c.kind = 'gear' and pet_gear_slot(c.code) is null) then raise exception 'ОШИБКА: вещь без места'; end if;
  -- Прежние иконки, фразы и фоны по-прежнему разрешены: старый список — из нового
  if (select count(*) from shop_items()) <> 75 or shop_codes('icon') <> (select array_agg(code order by code) from shop_catalog() where kind = 'icon') then
    raise exception 'ОШИБКА: shop_items не сходится с каталогом';
  end if;
end $$;
\echo ok

\echo === 2. питомец: первый купленный — сразу с вами, второй — нет; выбрать можно только своего
do $$
declare r jsonb;
begin
  r := shop_buy('Лев', '1234', 'pet', 'fox');
  if (r->>'paid')::int <> 450 or (select pet from students where username = 'Лев') <> 'fox' then raise exception 'ОШИБКА: первый питомец %', r; end if;
  perform shop_buy('Лев', '1234', 'pet', 'drake');
  if (select pet from students where username = 'Лев') <> 'fox' then raise exception 'ОШИБКА: второй питомец сменил первого'; end if;
  if (select gems from wallet where username = 'Лев') <> 170 then raise exception 'ОШИБКА: дракон не за 30 💎'; end if;
  begin
    perform set_pet('Лев', '1234', 'wolf');
    raise exception 'ОШИБКА: чужой питомец';
  exception when others then if sqlerrm not like '%pet_locked%' then raise; end if;
  end;
  if set_pet('Лев', '1234', 'drake') <> 'drake' then raise exception 'ОШИБКА: выбор питомца'; end if;
  perform set_pet('Лев', '1234', 'fox');
end $$;
\echo ok

\echo === 3. вещи: только свои и только на своё место; снять — null
do $$
declare g jsonb;
begin
  perform shop_buy('Лев', '1234', 'gear', 'shades');
  perform shop_buy('Лев', '1234', 'gear', 'crown');
  g := set_pet_gear('Лев', '1234', 'eyes', 'shades');
  g := set_pet_gear('Лев', '1234', 'head', 'crown');
  if g <> '{"eyes": "shades", "head": "crown"}'::jsonb then raise exception 'ОШИБКА: надеть %', g; end if;
  begin
    perform set_pet_gear('Лев', '1234', 'head', 'shades');
    raise exception 'ОШИБКА: очки на голову';
  exception when others then if sqlerrm not like '%bad_slot%' then raise; end if;
  end;
  begin
    perform set_pet_gear('Лев', '1234', 'neck', 'scarf');
    raise exception 'ОШИБКА: чужой шарф';
  exception when others then if sqlerrm not like '%gear_locked%' then raise; end if;
  end;
  g := set_pet_gear('Лев', '1234', 'eyes', null);
  if g <> '{"head": "crown"}'::jsonb then raise exception 'ОШИБКА: снять %', g; end if;
end $$;
\echo ok

\echo === 4. опыт: столько же, сколько очков пути за игру, не больше 200 в день; без питомца — никому
do $$
declare x int;
begin
  perform play_done('Лев', 20);
  perform local_game_done('Лев', '1234', 'solo');
  if (select xp from pet_xp where username = 'Лев' and pet = 'fox') <> 30 then raise exception 'ОШИБКА: опыт %', (select xp from pet_xp where username = 'Лев'); end if;
  perform play_done('Лев', 500);
  if (select xp from pet_xp where username = 'Лев' and pet = 'fox') <> 200 then raise exception 'ОШИБКА: предел за день'; end if;
  perform play_done('Кира', 20);
  if exists (select 1 from pet_xp where username = 'Кира') then raise exception 'ОШИБКА: опыт без питомца'; end if;
  if (my_look('Лев', '1234')->'xp'->>'fox')::int <> 200 then raise exception 'ОШИБКА: опыт в my_look'; end if;
end $$;
\echo ok

\echo === 5. товары дня: три вещи, 40/25/15 %, не питомцы и не своё; весь день те же; покупка — со скидкой
do $$
declare l jsonb; d jsonb; it record; c0 int; g0 int; r jsonb;
begin
  l := my_look('Максим', '1111');
  if jsonb_array_length(l->'deals') <> 3 then raise exception 'ОШИБКА: товаров дня %', l->'deals'; end if;
  if (select array_agg((x->>'pct')::int order by (x->>'pct')::int desc) from jsonb_array_elements(l->'deals') x) <> array[40, 25, 15] then
    raise exception 'ОШИБКА: скидки %', l->'deals';
  end if;
  if exists (select 1 from jsonb_array_elements(l->'deals') x where x->>'kind' = 'pet') then raise exception 'ОШИБКА: питомец в товарах дня'; end if;
  if (my_look('Максим', '1111')->'deals') <> l->'deals' then raise exception 'ОШИБКА: товары дня поменялись за день'; end if;
  if (l->>'dealsLeft')::int <= 0 or (l->>'dealsLeft')::int > 86400 then raise exception 'ОШИБКА: до смены %', l->>'dealsLeft'; end if;
  d := (select x from jsonb_array_elements(l->'deals') x where (x->>'pct')::int = 40);
  select * into it from shop_catalog() c where c.kind = d->>'kind' and c.code = d->>'code';
  c0 := (select coins from wallet where username = 'Максим');
  g0 := (select gems from wallet where username = 'Максим');
  r := shop_buy('Максим', '1111', it.kind, it.code);
  if (r->>'pct')::int <> 40 then raise exception 'ОШИБКА: скидка не применилась %', r; end if;
  if it.coins > 0 and (select coins from wallet where username = 'Максим') <> c0 - round(it.coins * 0.6) then
    raise exception 'ОШИБКА: цена со скидкой % → %', it.coins, c0 - (select coins from wallet where username = 'Максим');
  end if;
  if it.gems > 0 and (select gems from wallet where username = 'Максим') <> g0 - round(it.gems * 0.6) then
    raise exception 'ОШИБКА: цена в кристаллах со скидкой % → %', it.gems, g0 - (select gems from wallet where username = 'Максим');
  end if;
  -- Не в товарах дня — полная цена
  select * into it from shop_catalog() c
   where c.kind = 'phrase' and c.code not in (select x->>'code' from jsonb_array_elements(l->'deals') x) limit 1;
  r := shop_buy('Максим', '1111', it.kind, it.code);
  if (r->>'pct')::int <> 0 or (r->>'paid')::int <> it.coins then raise exception 'ОШИБКА: полная цена %', r; end if;
end $$;
\echo ok

\echo === 6. наборы: недостающее со скидкой, своё не продаётся дважды, всё есть — отказ
do $$
declare p int; r jsonb; c0 int;
begin
  -- У Киры ничего нет: Огнелис 450 + лавовый 200 + «Угли» 220 = 870 → −20 % = 696 → до десятков 700
  if shop_bundle_price('Кира', 'set_fox') <> 700 then raise exception 'ОШИБКА: цена набора %', shop_bundle_price('Кира', 'set_fox'); end if;
  begin
    perform shop_buy_bundle('Кира', '4321', 'set_fox');
    raise exception 'ОШИБКА: набор без денег';
  exception when others then if sqlerrm not like '%not_enough%' then raise; end if;
  end;
  -- У Льва Огнелис уже есть: 420 → 336 → 340
  p := shop_bundle_price('Лев', 'set_fox');
  if p <> 340 then raise exception 'ОШИБКА: набор без своего %', p; end if;
  c0 := (select coins from wallet where username = 'Лев');
  r := shop_buy_bundle('Лев', '1234', 'set_fox');
  if (r->>'paid')::int <> 340 or (select coins from wallet where username = 'Лев') <> c0 - 340 then raise exception 'ОШИБКА: покупка набора %', r; end if;
  if (r->'got') <> '["thermo:lava", "frame:ember"]'::jsonb then raise exception 'ОШИБКА: что пришло %', r->'got'; end if;
  if not cosmetic_has('Лев', 'thermo', 'lava') or not cosmetic_has('Лев', 'frame', 'ember') then raise exception 'ОШИБКА: вещей набора нет'; end if;
  -- Первый градусник надевается сам
  if (select thermo from students where username = 'Лев') <> 'lava' then raise exception 'ОШИБКА: градусник не надет'; end if;
  begin
    perform shop_buy_bundle('Лев', '1234', 'set_fox');
    raise exception 'ОШИБКА: набор дважды';
  exception when others then if sqlerrm not like '%already_owned%' then raise; end if;
  end;
  if (my_look('Лев', '1234')->'bundles'->>'set_fox')::int <> 0 then raise exception 'ОШИБКА: цена купленного набора'; end if;
  -- Набор за кристаллы: дракон уже есть — аура грозы 12 + «Галактика» 14 = 26 → 21
  if shop_bundle_price('Лев', 'set_drake') <> 21 then raise exception 'ОШИБКА: набор дракона %', shop_bundle_price('Лев', 'set_drake'); end if;
end $$;
\echo ok

\echo === 7. градусник и эффект победы: свои надеваются и снимаются, чужие — нет
do $$ begin
  begin
    perform set_thermo('Лев', '1234', 'neon');
    raise exception 'ОШИБКА: чужой градусник';
  exception when others then if sqlerrm not like '%thermo_locked%' then raise; end if;
  end;
  if set_thermo('Лев', '1234', null) is not null then raise exception 'ОШИБКА: снять градусник'; end if;
  if (select thermo from students where username = 'Лев') is not null then raise exception 'ОШИБКА: градусник не снялся'; end if;
  perform shop_buy('Лев', '1234', 'winfx', 'fireworks');
  if (select winfx from students where username = 'Лев') <> 'fireworks' then raise exception 'ОШИБКА: первый эффект не надет'; end if;
  begin
    perform set_winfx('Лев', '1234', 'meteors');
    raise exception 'ОШИБКА: чужой эффект';
  exception when others then if sqlerrm not like '%winfx_locked%' then raise; end if;
  end;
  if (my_look('Лев', '1234')->>'winfx') <> 'fireworks' then raise exception 'ОШИБКА: эффект в my_look'; end if;
end $$;
\echo ok

\echo === 8. без PIN — ничего
do $$ begin
  begin
    perform my_look('Лев', '0000');
    raise exception 'ОШИБКА: my_look без PIN';
  exception when others then if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
  begin
    perform shop_buy_bundle('Лев', '0000', 'set_wolf');
    raise exception 'ОШИБКА: набор без PIN';
  exception when others then if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
end $$;
\echo ok

rollback;
