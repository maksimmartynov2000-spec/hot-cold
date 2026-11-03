\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Бонусы из Приключения в онлайне (миграция 057). Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null;
  update matches set status = 'finished' where status in ('invited', 'active');
end $$;
\echo ok

-- Партия 1..100, загадано 40, бонус в нужной клетке
create or replace function pg_temp.mk(p_type text, p_at int) returns bigint language plpgsql as $$
declare mid bigint;
begin
  insert into matches(p0, p1, status, range_min, range_max, bonuses_on, wins_needed) values ('Лев', 'Кира', 'active', 1, 100, true, 3)
  returning id into mid;
  perform start_match_round(mid);
  update matches set secret = 40, cur = 0, lobby = false, start_at = null where id = mid;
  delete from match_bonuses where match_id = mid;
  insert into match_bonuses(match_id, round, value, type) values (mid, 1, p_at, p_type);
  return mid;
end $$;

\echo === 1. раскладка: восемь полезных (с новыми) и три ловушки
do $$
declare mid bigint; types text[];
begin
  insert into matches(p0, p1, status, range_min, range_max, bonuses_on, bonus_count) values ('Лев', 'Кира', 'active', 1, 100, true, 33)
  returning id into mid;
  perform start_match_round(mid);
  select array_agg(distinct type) into types from match_bonuses where match_id = mid;
  if not types @> array['xray', 'half', 'shield', 'freeze', 'extra', 'fog', 'skip', 'gift', 'memory'] then
    raise exception 'ОШИБКА: набор %', types;
  end if;
  if (select count(*) from match_bonuses where match_id = mid and type in ('skip', 'gift', 'memory')) <> 11 then
    raise exception 'ОШИБКА: ловушек не треть';
  end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 2. Рентген и Половина: ответ — только взявшему
do $$
declare mid bigint; a jsonb; b jsonb;
begin
  mid := pg_temp.mk('xray', 70);
  perform match_guess('Лев', '1234', mid, 70);
  a := match_state('Лев', '1234', mid); b := match_state('Кира', '4321', mid);
  if (a->'know'->>'parity')::int is distinct from 0 then raise exception 'ОШИБКА: взявший не знает чётность %', a->'know'; end if;
  if b->'know'->>'parity' is not null then raise exception 'ОШИБКА: соперник видит чётность %', b->'know'; end if;
  if b->>'lastBonus' <> 'xray' then raise exception 'ОШИБКА: соперник не видит, что взяли Рентген'; end if;
  update matches set status = 'finished' where id = mid;

  mid := pg_temp.mk('half', 70);
  perform match_guess('Лев', '1234', mid, 70);
  a := match_state('Лев', '1234', mid); b := match_state('Кира', '4321', mid);
  if a->'know'->>'half' <> 'low' or b->'know'->>'half' is not null then raise exception 'ОШИБКА: половина % / %', a->'know', b->'know'; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 3. Щит виден обоим и отбивает ловушку; заморозку не отбивает
do $$
declare mid bigint; s jsonb; m matches;
begin
  mid := pg_temp.mk('shield', 70);
  insert into match_bonuses(match_id, round, value, type) values (mid, 1, 80, 'skip');
  perform match_guess('Лев', '1234', mid, 70);
  s := match_state('Кира', '4321', mid);
  if not (s->'shield'->>0)::boolean then raise exception 'ОШИБКА: щит не виден сопернику %', s->'shield'; end if;
  update matches set cur = 0 where id = mid;
  perform match_guess('Лев', '1234', mid, 80);
  select * into m from matches where id = mid;
  if m.skip_turn[1] or m.shield[1] or m.last_bonus <> 'shieldUsed' or m.shield_trap <> 'skip' then
    raise exception 'ОШИБКА: щит не отбил ловушку %', row_to_json(m);
  end if;
  update matches set status = 'finished' where id = mid;

  mid := pg_temp.mk('freeze', 70);
  update matches set shield[2] = true where id = mid;
  perform match_guess('Лев', '1234', mid, 70);
  select * into m from matches where id = mid;
  if not m.skip_turn[2] or not m.frozen[2] or not m.shield[2] or m.cur <> 1 then raise exception 'ОШИБКА: заморозка %', row_to_json(m); end if;
  s := match_state('Кира', '4321', mid);
  if s->>'forced' <> 'skip' or not (s->'frozen'->>1)::boolean then raise exception 'ОШИБКА: замёрзшему не сказано %', s; end if;
  perform do_forced_turn('Кира', '4321', mid);
  select * into m from matches where id = mid;
  if m.frozen[2] or m.skip_turn[2] or m.cur <> 0 then raise exception 'ОШИБКА: после пропуска %', row_to_json(m); end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 3б. набор полезных бонусов в игре и в базе один
create temp table js_sets(kind text, n int, code text);
\copy js_sets from 'pass_sets_js.csv' with (format csv, header true)
do $$ begin
  if (select array_agg(code order by n) from js_sets where kind = 'bonus') is distinct from online_bonus_good() then
    raise exception 'ОШИБКА: бонусы онлайна в игре и в базе разные';
  end if;
end $$;
\echo ok

\echo === 4. новый раунд — знания и щиты сначала
do $$
declare mid bigint; m matches;
begin
  mid := pg_temp.mk('xray', 70);
  update matches set shield = array[true, true], know_half = array['low', 'high'] where id = mid;
  perform start_match_round(mid);
  select * into m from matches where id = mid;
  if m.shield[1] or m.know_half[1] is not null or m.know_parity[1] is not null then raise exception 'ОШИБКА: перенеслось в раунд %', row_to_json(m); end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

rollback;
