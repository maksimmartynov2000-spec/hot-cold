\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Бот пользуется знанием из Рентгена и Половины (миграция 058). Откатывается в конце
begin;

\echo === 1. без знания — весь диапазон; Рентген — только чётные; ещё Половина — чётные нижней половины
do $$
declare mid bigint; c int[];
begin
  insert into matches(p0, p1, status, range_min, range_max, bonuses_on) values ('Лев', 'Кира', 'active', 1, 100, true)
  returning id into mid;
  perform start_match_round(mid);
  update matches set secret = 40 where id = mid;
  c := bot_candidates(mid, 1, false);
  if array_length(c, 1) <> 100 then raise exception 'ОШИБКА: без знания %', array_length(c, 1); end if;
  update matches set know_parity[2] = 0 where id = mid;
  c := bot_candidates(mid, 1, false);
  if array_length(c, 1) <> 50 or exists (select 1 from unnest(c) x where x % 2 <> 0) then raise exception 'ОШИБКА: Рентген %', c; end if;
  update matches set know_half[2] = 'low' where id = mid;
  c := bot_candidates(mid, 1, false);
  if array_length(c, 1) <> 25 or exists (select 1 from unnest(c) x where x > 50 or x % 2 <> 0) or not (40 = any (c)) then
    raise exception 'ОШИБКА: Рентген + Половина %', c;
  end if;
  -- Знание чужое — не моё: у места 0 весь диапазон
  if array_length(bot_candidates(mid, 0, false), 1) <> 100 then raise exception 'ОШИБКА: бот знает чужое'; end if;
  -- Отрицательные числа: −100…100, нечётное, верхняя половина (больше 0)
  update matches set range_min = -100, range_max = 100, secret = -37, know_parity[2] = 1, know_half[2] = 'low' where id = mid;
  c := bot_candidates(mid, 1, false);
  if not (-37 = any (c)) or exists (select 1 from unnest(c) x where abs(x) % 2 <> 1 or x > 0) then raise exception 'ОШИБКА: минус-числа %', c; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

rollback;
