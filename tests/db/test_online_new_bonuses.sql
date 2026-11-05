\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Новые бонусы в онлайне (миграция 060). Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null;
  update matches set status = 'finished' where status in ('invited', 'active');
end $$;
\echo ok

-- Партия 1..100, загадано 45, бонус в нужной клетке
create or replace function pg_temp.mk(p_type text, p_at int) returns bigint language plpgsql as $$
declare mid bigint;
begin
  insert into matches(p0, p1, status, range_min, range_max, bonuses_on, wins_needed) values ('Лев', 'Кира', 'active', 1, 100, true, 3)
  returning id into mid;
  perform start_match_round(mid);
  update matches set secret = 45, cur = 0, lobby = false, start_at = null where id = mid;
  delete from match_bonuses where match_id = mid;
  insert into match_bonuses(match_id, round, value, type) values (mid, 1, p_at, p_type);
  return mid;
end $$;

\echo === 1. раскладка: тринадцать полезных (с новыми) и три ловушки
do $$
declare mid bigint; types text[];
begin
  insert into matches(p0, p1, status, range_min, range_max, bonuses_on, bonus_count) values ('Лев', 'Кира', 'active', 1, 100, true, 60)
  returning id into mid;
  perform start_match_round(mid);
  select array_agg(distinct type) into types from match_bonuses where match_id = mid;
  if not types @> array['div3', 'div5', 'compass', 'thief', 'mirror', 'xray', 'shield', 'skip', 'gift', 'memory'] then
    raise exception 'ОШИБКА: набор %', types;
  end if;
  if (select count(*) from match_bonuses where match_id = mid and type in ('skip', 'gift', 'memory')) <> 20 then
    raise exception 'ОШИБКА: ловушек не треть';
  end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 2. «Делится на 3?» и «Делится на 5?»: ответ — только взявшему
do $$
declare mid bigint; a jsonb; b jsonb;
begin
  mid := pg_temp.mk('div3', 70);
  perform match_guess('Лев', '1234', mid, 70);
  a := match_state('Лев', '1234', mid); b := match_state('Кира', '4321', mid);
  if (a->'know'->>'div3')::boolean is distinct from true then raise exception 'ОШИБКА: взявший не знает делимость на 3 %', a->'know'; end if;
  if b->'know'->>'div3' is not null then raise exception 'ОШИБКА: соперник видит делимость %', b->'know'; end if;
  if b->>'lastBonus' <> 'div3' then raise exception 'ОШИБКА: соперник не видит, что взяли бонус'; end if;
  update matches set status = 'finished' where id = mid;

  mid := pg_temp.mk('div5', 70);
  update matches set secret = 44 where id = mid;
  perform match_guess('Лев', '1234', mid, 70);
  a := match_state('Лев', '1234', mid);
  if (a->'know'->>'div5')::boolean is distinct from false then raise exception 'ОШИБКА: 44 на 5 не делится %', a->'know'; end if;
  update matches set status = 'finished' where id = mid;

  -- Мороз: у −45 делители те же
  mid := pg_temp.mk('div5', 70);
  update matches set secret = -45, range_min = -100 where id = mid;
  perform match_guess('Лев', '1234', mid, 70);
  a := match_state('Лев', '1234', mid);
  if (a->'know'->>'div5')::boolean is distinct from true then raise exception 'ОШИБКА: −45 делится на 5 %', a->'know'; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 3. Компас: больше или меньше числа, на котором лежал
do $$
declare mid bigint; a jsonb; m matches; c int[];
begin
  mid := pg_temp.mk('compass', 30);
  insert into match_bonuses(match_id, round, value, type) values (mid, 1, 60, 'compass'), (mid, 1, 20, 'compass');
  perform match_guess('Лев', '1234', mid, 30);
  update matches set cur = 0 where id = mid;
  perform match_guess('Лев', '1234', mid, 60);
  update matches set cur = 0 where id = mid;
  perform match_guess('Лев', '1234', mid, 20);
  a := match_state('Лев', '1234', mid);
  if (a->'know'->>'gt')::int is distinct from 30 or (a->'know'->>'lt')::int is distinct from 60 then
    raise exception 'ОШИБКА: компас %', a->'know';
  end if;
  if match_state('Кира', '4321', mid)->'know'->>'gt' is not null then raise exception 'ОШИБКА: соперник видит компас'; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 4. Воришка: «⚡» соперника — себе, у пустого — из запаса
do $$
declare mid bigint; m matches;
begin
  mid := pg_temp.mk('thief', 70);
  update matches set tokens = array[1, 2] where id = mid;
  perform match_guess('Лев', '1234', mid, 70);
  select * into m from matches where id = mid;
  if m.tokens <> array[2, 1] then raise exception 'ОШИБКА: воришка %', m.tokens; end if;
  update matches set status = 'finished' where id = mid;

  mid := pg_temp.mk('thief', 70);
  update matches set tokens = array[0, 0] where id = mid;
  perform match_guess('Лев', '1234', mid, 70);
  select * into m from matches where id = mid;
  if m.tokens <> array[1, 0] then raise exception 'ОШИБКА: воришка у пустого %', m.tokens; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 5. Зеркало видно обоим и отражает ловушку; щит при этом остаётся
do $$
declare mid bigint; s jsonb; m matches;
begin
  mid := pg_temp.mk('mirror', 70);
  insert into match_bonuses(match_id, round, value, type) values (mid, 1, 80, 'skip'), (mid, 1, 90, 'gift');
  perform match_guess('Лев', '1234', mid, 70);
  s := match_state('Кира', '4321', mid);
  if not (s->'mirror'->>0)::boolean then raise exception 'ОШИБКА: зеркало не видно сопернику %', s->'mirror'; end if;
  update matches set cur = 0, shield[1] = true where id = mid;
  perform match_guess('Лев', '1234', mid, 80);
  select * into m from matches where id = mid;
  if m.skip_turn[1] or not m.skip_turn[2] or m.mirror[1] or not m.shield[1]
     or m.last_bonus <> 'mirrorUsed' or m.shield_trap <> 'skip' then
    raise exception 'ОШИБКА: зеркало не отразило ловушку %', row_to_json(m);
  end if;
  s := match_state('Кира', '4321', mid);
  if s->>'forced' <> 'skip' then raise exception 'ОШИБКА: отражённый пропуск не у соперника %', s; end if;
  perform do_forced_turn('Кира', '4321', mid);
  -- Второй ловушкой — подарок: зеркала нет, его отбивает щит
  perform match_guess('Лев', '1234', mid, 90);
  select * into m from matches where id = mid;
  if m.last_bonus <> 'shieldUsed' or m.shield[1] then raise exception 'ОШИБКА: после зеркала щит %', row_to_json(m); end if;
  update matches set status = 'finished' where id = mid;

  -- Отражённый подарок: «⚡» получает хозяин зеркала
  mid := pg_temp.mk('mirror', 70);
  insert into match_bonuses(match_id, round, value, type) values (mid, 1, 90, 'gift');
  update matches set tokens = array[1, 1] where id = mid;
  perform match_guess('Лев', '1234', mid, 70);
  update matches set cur = 0 where id = mid;
  perform match_guess('Лев', '1234', mid, 90);
  select * into m from matches where id = mid;
  if m.tokens <> array[2, 1] then raise exception 'ОШИБКА: отражённый подарок %', m.tokens; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 6. новый раунд — новое знание и зеркало сначала
do $$
declare mid bigint; m matches;
begin
  mid := pg_temp.mk('xray', 70);
  update matches set mirror = array[true, true], know_div3 = array[true, false], know_gt = array[10, 20], know_lt = array[90, 80]
  where id = mid;
  perform start_match_round(mid);
  select * into m from matches where id = mid;
  if m.mirror[1] or m.know_div3[1] is not null or m.know_gt[2] is not null or m.know_lt[1] is not null then
    raise exception 'ОШИБКА: перенеслось в раунд %', row_to_json(m);
  end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

rollback;
