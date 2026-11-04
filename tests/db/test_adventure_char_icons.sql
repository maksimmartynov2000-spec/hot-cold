\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Иконки соперников Приключения (миграция 052). Откатывается в конце
begin;

\echo === 1. иконка мира — только когда все 10 соперников мира на 3★
do $$ begin
  update students set failed_logins = 0, locked_until = null, adventure = 20, adventure_stars = '3333333332' where username = 'Лев';
  begin
    perform set_avatar('Лев', '1234', 'adv-03');
    raise exception 'ОШИБКА: иконка без мира на 3★';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  update students set adventure_stars = '3333333333' || '1111111111' where username = 'Лев';
  if set_avatar('Лев', '1234', 'adv-03') is distinct from 'adv-03' then raise exception 'ОШИБКА: adv-03 не встала'; end if;
  if set_avatar('Лев', '1234', 'adv-10') is distinct from 'adv-10' then raise exception 'ОШИБКА: босс мира не встал'; end if;
  begin
    perform set_avatar('Лев', '1234', 'adv-11');
    raise exception 'ОШИБКА: иконка второго мира без 3★';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  -- 50 миров (миграция 059): портреты есть до adv-500, за ними — ничего
  begin
    perform set_avatar('Лев', '1234', 'adv-501');
    raise exception 'ОШИБКА: несуществующая иконка';
  exception when others then if sqlerrm not like '%invalid_avatar%' then raise; end if;
  end;
  begin
    perform set_avatar('Лев', '1234', 'adv-51');
    raise exception 'ОШИБКА: портрет шестого мира без 3★';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  -- Портрет босса шестого мира — за победу над ним, как эмодзи боссов первых пяти
  begin
    perform set_avatar('Лев', '1234', 'adv-60');
    raise exception 'ОШИБКА: босс шестого мира не пройден';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  update students set adventure = 60 where username = 'Лев';
  if set_avatar('Лев', '1234', 'adv-60') is distinct from 'adv-60' then raise exception 'ОШИБКА: босс шестого мира не встал'; end if;
  -- Трёхзначные номера: adv-100, adv-150 (lpad до двух знаков их бы обрезал)
  if (adventure_char_icons())[100] is distinct from 'adv-100' or (adventure_char_icons())[150] is distinct from 'adv-150'
     or (adventure_char_icons())[9] is distinct from 'adv-09' then
    raise exception 'ОШИБКА: имена портретов %', (adventure_char_icons())[95:105];
  end if;
  update students set adventure = 150, adventure_stars = repeat('3', 150) where username = 'Лев';
  if set_avatar('Лев', '1234', 'adv-105') is distinct from 'adv-105' then raise exception 'ОШИБКА: adv-105 не встала'; end if;
  if set_avatar('Лев', '1234', 'adv-150') is distinct from 'adv-150' then raise exception 'ОШИБКА: босс 15-го мира не встал'; end if;
  update students set adventure = 20, adventure_stars = '3333333333' || '1111111111' where username = 'Лев';
end $$;
\echo ok

\echo === 2. достижения и счётчик
do $$
declare r jsonb;
begin
  r := my_progress('Лев', '1234', null);
  if (r->'stats'->>'advGold')::int <> 1 then raise exception 'ОШИБКА: миров на 3★ %', r->'stats'->>'advGold'; end if;
  if not exists (select 1 from achievements where username = 'Лев' and code = 'adv_gold_1') then
    raise exception 'ОШИБКА: достижение «мир на 3★» не открылось';
  end if;
  if exists (select 1 from achievements where username = 'Лев' and code = 'adv_gold_3') then
    raise exception 'ОШИБКА: «3 мира» за один';
  end if;
  if adventure_gold_worlds(repeat('3', 50)) <> 5 or adventure_gold_worlds('') <> 0 or adventure_gold_worlds(repeat('3', 500)) <> 50 then
    raise exception 'ОШИБКА: подсчёт миров';
  end if;
end $$;
\echo ok

rollback;
