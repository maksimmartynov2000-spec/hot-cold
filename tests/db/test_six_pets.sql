\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Переход на шесть питомцев (миграция 064): прежние питомцы и вещи уходят,
-- монеты и кристаллы возвращаются, корона остаётся (её заберёт уже 065),
-- наряд снимается.
-- Откатывается в конце
begin;

\echo === подготовка: у Киры прежние Огнелис, дракон, тёмные очки и корона
do $$ begin
  update students set failed_logins = 0, locked_until = null, pet = null, pet_gear = '{}'::jsonb, tz = 'Pacific/Pago_Pago'
   where username in ('Лев', 'Кира');
  delete from wallet_log where username in ('Лев', 'Кира');
  delete from wallet where username in ('Лев', 'Кира');
  delete from cosmetics where username in ('Лев', 'Кира');
  delete from pet_xp where username in ('Лев', 'Кира');
  delete from shop_deals where username in ('Лев', 'Кира');
  insert into wallet(username, coins, gems) values ('Кира', 100, 5), ('Лев', 0, 0);
  insert into cosmetics(username, kind, code, source)
  values ('Кира', 'pet', 'fox', 'shop'), ('Кира', 'pet', 'drake', 'shop'), ('Кира', 'gear', 'shades', 'shop'), ('Кира', 'gear', 'crown', 'shop'),
         ('Лев', 'pet', 'badger', 'shop');
  insert into pet_xp(username, pet, xp) values ('Кира', 'fox', 300);
  update students set pet = 'fox', pet_gear = '{"head": "crown", "eyes": "shades"}'::jsonb where username = 'Кира';
  update students set pet = 'badger', pet_gear = '{"badger": {"head": "crown"}}'::jsonb where username = 'Лев';
  insert into shop_deals(username, day, items)
  values ('Кира', player_day('Кира'), '[{"kind": "gear", "code": "shades", "pct": 40}]'::jsonb),
         ('Лев', player_day('Лев'), '[{"kind": "gear", "code": "aura_fire", "pct": 40}]'::jsonb);
end $$;
\echo ok

\echo === 1. уборка: 450 + 180 🪙 и 30 💎 назад, прежних вещей нет, корона осталась, питомец и наряд сняты
do $$
declare n int;
begin
  n := six_pets_cleanup();
  if n <> 3 then raise exception 'ОШИБКА: вещей с возвратом %', n; end if;
  if (select coins from wallet where username = 'Кира') <> 730 or (select gems from wallet where username = 'Кира') <> 35 then
    raise exception 'ОШИБКА: возврат % 🪙 % 💎', (select coins from wallet where username = 'Кира'), (select gems from wallet where username = 'Кира');
  end if;
  if (select count(*) from wallet_log where username = 'Кира' and reason = 'refund') <> 3 then raise exception 'ОШИБКА: записей о возврате'; end if;
  if cosmetic_has('Кира', 'pet', 'fox') or cosmetic_has('Кира', 'pet', 'drake') or cosmetic_has('Кира', 'gear', 'shades') then raise exception 'ОШИБКА: прежние вещи остались'; end if;
  if not cosmetic_has('Кира', 'gear', 'crown') then raise exception 'ОШИБКА: корона пропала'; end if;
  if (select pet from students where username = 'Кира') is not null or (select pet_gear from students where username = 'Кира') <> '{}'::jsonb then
    raise exception 'ОШИБКА: питомец или наряд не сняты';
  end if;
  if exists (select 1 from pet_xp where username = 'Кира') then raise exception 'ОШИБКА: опыт Огнелиса остался'; end if;
  -- Товары дня с ушедшей вещью выбираются заново, с аурой пламени — остаются
  -- (корона была бы в каталоге до 065; теперь её нет, и такой товар дня тоже ушёл бы)
  if exists (select 1 from shop_deals where username = 'Кира') then raise exception 'ОШИБКА: товары дня с очками остались'; end if;
  if not exists (select 1 from shop_deals where username = 'Лев') then raise exception 'ОШИБКА: товары дня с аурой пропали'; end if;
  -- Новый наряд (по питомцам) уборка не трогает
  if (select pet from students where username = 'Лев') <> 'badger' or (select pet_gear from students where username = 'Лев') <> '{"badger": {"head": "crown"}}'::jsonb then
    raise exception 'ОШИБКА: наряд барсука тронут';
  end if;
end $$;
\echo ok

\echo === 2. второй запуск ничего не возвращает
do $$
declare n int;
begin
  n := six_pets_cleanup();
  if n <> 0 then raise exception 'ОШИБКА: возврат второй раз %', n; end if;
  if (select coins from wallet where username = 'Кира') <> 730 then raise exception 'ОШИБКА: монеты второй раз'; end if;
end $$;
\echo ok

\echo === 3. прежних питомцев и вещей в магазине нет
do $$ begin
  begin
    perform shop_buy('Кира', '4321', 'pet', 'fox');
    raise exception 'ОШИБКА: Огнелис продаётся';
  exception when others then if sqlerrm not like '%no_such_item%' then raise; end if;
  end;
  begin
    perform shop_buy('Кира', '4321', 'gear', 'cape');
    raise exception 'ОШИБКА: плащ продаётся';
  exception when others then if sqlerrm not like '%no_such_item%' then raise; end if;
  end;
end $$;
\echo ok

rollback;
