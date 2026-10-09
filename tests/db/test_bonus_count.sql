\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: партии откатываются в конце
begin;

\echo === 1. −1000…1000 и 2000 бонусов — ровно 2000, все на разных числах, загаданное свободно
do $$
declare mid bigint; n int; d int; hit int;
begin
  insert into matches(p0, p1, range_min, range_max, secret, status, bonuses_on, bonus_count)
  values ('Лев', 'Кира', -1000, 1000, 437, 'active', true, 2000) returning id into mid;
  perform place_match_bonuses(mid);
  select count(*), count(distinct value), count(*) filter (where value = 437)
    into n, d, hit from match_bonuses where match_id = mid;
  if n <> 2000 or d <> 2000 or hit <> 0 then
    raise exception 'ОШИБКА: бонусов %, разных %, на загаданном %', n, d, hit;
  end if;
  if exists (select 1 from match_bonuses where match_id = mid and (value < -1000 or value > 1000 or type is null)) then
    raise exception 'ОШИБКА: бонус вне диапазона или без типа';
  end if;
end $$;
\echo ok

\echo === 2. больше, чем чисел без загаданного, не ставится
do $$
declare mid bigint; n int;
begin
  insert into matches(p0, p1, range_min, range_max, secret, status, bonuses_on, bonus_count)
  values ('Лев', 'Кира', 1, 10, 4, 'active', true, 50) returning id into mid;
  perform place_match_bonuses(mid);
  select count(*) into n from match_bonuses where match_id = mid;
  if n <> 9 then raise exception 'ОШИБКА: на 1…10 бонусов % (нужно 9)', n; end if;
end $$;
\echo ok

\echo === 3. ловушек — примерно треть
do $$
declare mid bigint; traps int;
begin
  insert into matches(p0, p1, range_min, range_max, secret, status, bonuses_on, bonus_count)
  values ('Лев', 'Кира', 1, 1000, 500, 'active', true, 300) returning id into mid;
  perform place_match_bonuses(mid);
  select count(*) into traps from match_bonuses where match_id = mid and type in ('skip', 'gift', 'memory');
  if traps <> 100 then raise exception 'ОШИБКА: ловушек % из 300', traps; end if;
end $$;
\echo ok

rollback;
