\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Питомцы-картинки (миграция 065): вещи уходят, монеты возвращаются, ауры и
-- облики остаются надетыми, прежние места снимаются из нарядов.
-- Откатывается в конце
begin;

\echo === подготовка: у Киры барсук с короной, шапочкой, очками-звёздами, аурой пламени и медовым обликом
do $$ begin
  update students set failed_logins = 0, locked_until = null, pet = null, pet_gear = '{}'::jsonb, tz = 'Pacific/Pago_Pago'
   where username in ('Лев', 'Кира');
  delete from wallet_log where username in ('Лев', 'Кира');
  delete from wallet where username in ('Лев', 'Кира');
  delete from cosmetics where username in ('Лев', 'Кира');
  delete from shop_deals where username in ('Лев', 'Кира');
  insert into wallet(username, coins, gems) values ('Кира', 100, 5), ('Лев', 0, 0);
  insert into cosmetics(username, kind, code, source)
  values ('Кира', 'pet', 'badger', 'shop'), ('Кира', 'gear', 'crown', 'shop'), ('Кира', 'gear', 'mortar', 'shop'), ('Кира', 'gear', 'starglasses', 'shop'),
         ('Кира', 'gear', 'aura_fire', 'shop'), ('Кира', 'skin', 'badger_honey', 'shop'),
         ('Лев', 'pet', 'owl', 'shop'), ('Лев', 'gear', 'aura_moon', 'shop');
  update students set pet = 'badger',
         pet_gear = '{"badger": {"head": "crown", "eyes": "starglasses", "aura": "aura_fire", "skin": "honey"}, "owl": {"head": "tophat"}}'::jsonb
   where username = 'Кира';
  update students set pet = 'owl', pet_gear = '{"owl": {"aura": "aura_moon"}}'::jsonb where username = 'Лев';
  insert into shop_deals(username, day, items)
  values ('Кира', player_day('Кира'), '[{"kind": "gear", "code": "tophat", "pct": 40}]'::jsonb),
         ('Лев', player_day('Лев'), '[{"kind": "gear", "code": "aura_star", "pct": 40}]'::jsonb);
end $$;
\echo ok

\echo === 1. уборка: 450 + 250 + 200 🪙 назад, вещей нет, аура и облик надеты, прежние места сняты
do $$
declare n int;
begin
  n := raster_pets_cleanup();
  if n <> 3 then raise exception 'ОШИБКА: вещей с возвратом %', n; end if;
  if (select coins from wallet where username = 'Кира') <> 1000 or (select gems from wallet where username = 'Кира') <> 5 then
    raise exception 'ОШИБКА: возврат % 🪙 % 💎', (select coins from wallet where username = 'Кира'), (select gems from wallet where username = 'Кира');
  end if;
  if (select count(*) from wallet_log where username = 'Кира' and reason = 'refund') <> 3 then raise exception 'ОШИБКА: записей о возврате'; end if;
  if cosmetic_has('Кира', 'gear', 'crown') or cosmetic_has('Кира', 'gear', 'mortar') or cosmetic_has('Кира', 'gear', 'starglasses') then
    raise exception 'ОШИБКА: вещи остались';
  end if;
  if not cosmetic_has('Кира', 'gear', 'aura_fire') or not cosmetic_has('Кира', 'skin', 'badger_honey') then raise exception 'ОШИБКА: аура или облик пропали'; end if;
  if (select pet_gear from students where username = 'Кира') <> '{"badger": {"aura": "aura_fire", "skin": "honey"}, "owl": {}}'::jsonb then
    raise exception 'ОШИБКА: наряд после уборки %', (select pet_gear from students where username = 'Кира');
  end if;
  if (select pet from students where username = 'Кира') <> 'badger' then raise exception 'ОШИБКА: питомец снят'; end if;
  -- Наряд только из аур и обликов уборка не трогает
  if (select pet_gear from students where username = 'Лев') <> '{"owl": {"aura": "aura_moon"}}'::jsonb then raise exception 'ОШИБКА: наряд филина тронут'; end if;
  -- Товары дня с ушедшей вещью выбираются заново, с аурой — остаются
  if exists (select 1 from shop_deals where username = 'Кира') then raise exception 'ОШИБКА: товары дня с цилиндром остались'; end if;
  if not exists (select 1 from shop_deals where username = 'Лев') then raise exception 'ОШИБКА: товары дня с аурой пропали'; end if;
end $$;
\echo ok

\echo === 2. второй запуск ничего не возвращает
do $$
declare n int;
begin
  n := raster_pets_cleanup();
  if n <> 0 then raise exception 'ОШИБКА: возврат второй раз %', n; end if;
  if (select coins from wallet where username = 'Кира') <> 1000 then raise exception 'ОШИБКА: монеты второй раз'; end if;
end $$;
\echo ok

\echo === 3. вещей в магазине нет, прежних мест в наряде нет; аура и облик надеваются как раньше
do $$
declare g jsonb;
begin
  begin
    perform shop_buy('Кира', '4321', 'gear', 'crown');
    raise exception 'ОШИБКА: корона продаётся';
  exception when others then if sqlerrm not like '%no_such_item%' then raise; end if;
  end;
  begin
    perform set_pet_gear('Кира', '4321', 'head', null);
    raise exception 'ОШИБКА: место «голова» осталось';
  exception when others then if sqlerrm not like '%bad_slot%' then raise; end if;
  end;
  g := set_pet_gear('Кира', '4321', 'aura', null);
  if g->'badger' <> '{"skin": "honey"}'::jsonb then raise exception 'ОШИБКА: снять ауру %', g; end if;
  g := set_pet_gear('Кира', '4321', 'aura', 'aura_fire');
  if g->'badger' <> '{"aura": "aura_fire", "skin": "honey"}'::jsonb then raise exception 'ОШИБКА: надеть ауру %', g; end if;
end $$;
\echo ok

rollback;
