\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: партии откатываются в конце
begin;

\echo === подготовка
do $$ begin
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null;
end $$;
\echo ok

-- Что видит игрок: 'n' — число хода, 'h' — закрыт, по порядку ходов
create or replace function pg_temp.seen(p_user text, p_pin text, p_mid bigint)
returns text language sql as $$
  select coalesce(string_agg(case when x ? 'hidden' then 'h' else x->>'guess' end, ',' order by n), '')
  from jsonb_array_elements(match_state(p_user, p_pin, p_mid)->'moves') with ordinality t(x, n);
$$;

\echo === 1. туман взят ходом: этот ход виден, следующие закрыты — и на своём ходу, и на чужом
do $$
declare mid bigint; v text;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed, bonuses_on)
  values ('Лев', 'Кира', 'active', 1, 100, 2, true) returning matches.id into mid;
  perform start_match_round(mid);
  delete from match_bonuses where match_id = mid;
  insert into match_bonuses(match_id, round, value, type) values (mid, 1, 50, 'fog');
  update matches set secret = 40, cur = 0 where matches.id = mid;
  perform set_config('t.fog', mid::text, false);

  perform match_guess('Лев', '1234', mid, 50);            -- взял туман, он лёг на Киру
  if not (select fog[2] from matches where id = mid) then raise exception 'ОШИБКА: туман не лёг'; end if;
  v := pg_temp.seen('Кира', '4321', mid);
  if v <> '50' then raise exception 'ОШИБКА: ход, которым взят туман, закрыт: %', v; end if;

  perform match_guess('Кира', '4321', mid, 90);           -- теперь ходит Лев
  v := pg_temp.seen('Кира', '4321', mid);
  if v <> '50,90' then raise exception 'ОШИБКА: на ходу Льва Кира видит %', v; end if;

  perform match_guess('Лев', '1234', mid, 60);            -- ход после тумана
  v := pg_temp.seen('Кира', '4321', mid);
  if v <> '50,90,h' then raise exception 'ОШИБКА: на своём ходу Кира видит %', v; end if;

  perform match_guess('Кира', '4321', mid, 95);           -- снова ходит Лев
  v := pg_temp.seen('Кира', '4321', mid);
  -- Раньше здесь ход Льва открывался: туман работал только на ходу Киры
  if v <> '50,90,h,95' then raise exception 'УТЕЧКА: на ходу Льва Кира видит %', v; end if;

  v := pg_temp.seen('Лев', '1234', mid);
  if v <> '50,90,60,95' then raise exception 'ОШИБКА: у Льва без тумана закрыто: %', v; end if;
end $$;
\echo ok

\echo === 2. раунд кончился — видно всё; новый раунд — тумана нет
do $$
declare mid bigint := current_setting('t.fog')::bigint; v text;
begin
  perform match_guess('Лев', '1234', mid, 40);
  v := pg_temp.seen('Кира', '4321', mid);
  if v <> '90,60,95,40' then raise exception 'ОШИБКА: после раунда закрыто: %', v; end if;
  perform next_match_round('Лев', '1234', mid);
  delete from match_bonuses where match_id = mid;
  update matches set secret = 40 where id = mid;
  if (select fog[2] from matches where id = mid) then raise exception 'ОШИБКА: туман перешёл в новый раунд'; end if;
  perform match_guess('Кира', '4321', mid, 70);
  perform match_guess('Лев', '1234', mid, 71);
  v := pg_temp.seen('Кира', '4321', mid);
  if v <> '70,71' then raise exception 'ОШИБКА: в новом раунде закрыто: %', v; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 3. слепота: свои ходы после неё закрыты на любом ходу, прежние видны
do $$
declare mid bigint; v text;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed, bonuses_on)
  values ('Лев', 'Кира', 'active', 1, 100, 1, true) returning matches.id into mid;
  perform start_match_round(mid);
  delete from match_bonuses where match_id = mid;
  insert into match_bonuses(match_id, round, value, type) values (mid, 1, 50, 'blind');
  update matches set secret = 40, cur = 1 where matches.id = mid;

  perform match_guess('Кира', '4321', mid, 10);           -- до слепоты
  perform match_guess('Лев', '1234', mid, 50);            -- слепота на Киру
  if not (select blind[2] from matches where id = mid) then raise exception 'ОШИБКА: слепота не легла'; end if;
  perform match_guess('Кира', '4321', mid, 20);           -- после слепоты
  v := pg_temp.seen('Кира', '4321', mid);                 -- ход Льва
  if v <> '10,50,h' then raise exception 'УТЕЧКА: на ходу Льва Кира видит свои: %', v; end if;
  perform match_guess('Лев', '1234', mid, 55);
  v := pg_temp.seen('Кира', '4321', mid);                 -- ход Киры
  if v <> '10,50,h,55' then raise exception 'ОШИБКА: на своём ходу Кира видит %', v; end if;
  v := pg_temp.seen('Лев', '1234', mid);
  if v <> '10,50,20,55' then raise exception 'ОШИБКА: у Льва закрыто: %', v; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 4. короткая память — два хода и на чужом ходу
do $$
declare mid bigint; v text;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed)
  values ('Лев', 'Кира', 'active', 1, 100, 1) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set secret = 40, cur = 0 where matches.id = mid;
  perform match_guess('Лев', '1234', mid, 11);
  perform match_guess('Кира', '4321', mid, 12);
  perform match_guess('Лев', '1234', mid, 13);
  perform match_guess('Кира', '4321', mid, 14);
  update matches set short_memory = array[false, true] where id = mid;
  v := pg_temp.seen('Кира', '4321', mid);                 -- ход Льва
  if v <> '13,14' then raise exception 'УТЕЧКА: с короткой памятью на ходу Льва Кира видит %', v; end if;
  v := pg_temp.seen('Лев', '1234', mid);
  if v <> '11,12,13,14' then raise exception 'ОШИБКА: у Льва память урезана: %', v; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 5. отметка ставится один раз; туман, легший до миграции, закрывает всё
do $$
declare mid bigint; f bigint; v text;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed)
  values ('Лев', 'Кира', 'active', 1, 100, 1) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set secret = 40, cur = 0 where matches.id = mid;
  perform match_guess('Лев', '1234', mid, 11);
  update matches set fog = array[false, true] where id = mid;
  select fog_from[2] into f from matches where id = mid;
  if f <> (select max(id) from match_moves where match_id = mid) then raise exception 'ОШИБКА: отметка %', f; end if;
  perform match_guess('Кира', '4321', mid, 12);
  perform match_guess('Лев', '1234', mid, 13);
  -- Повторный туман на уже затуманенного отметку не двигает
  update matches set fog = array[false, true], cur = 1 where id = mid;
  if (select fog_from[2] from matches where id = mid) <> f then raise exception 'ОШИБКА: отметка сдвинулась'; end if;
  v := pg_temp.seen('Кира', '4321', mid);
  if v <> '11,12,h' then raise exception 'ОШИБКА: %', v; end if;
  -- Партия, где туман лёг до миграции: отметки нет (0) — закрыты все чужие ходы
  update matches set fog_from = array[0, 0] where id = mid;
  v := pg_temp.seen('Кира', '4321', mid);
  if v <> 'h,12,h' then raise exception 'ОШИБКА: старый туман: %', v; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 6. бот под туманом видит то же, что человек: ход до тумана — да, после — нет
do $$
declare mid bigint; v int[];
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level)
  values ('Лев', '@bot:owl', true, 0, 'active', 1, 100, 1, 0.9) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set secret = 1, cur = 0 where matches.id = mid;
  perform match_guess_core(mid, 0, 40);
  update matches set fog = array[false, true] where id = mid;
  perform match_guess_core(mid, 1, 27);
  perform match_guess_core(mid, 0, 38);
  v := bot_candidates(mid, 1, false);
  if v is distinct from (select array_agg(x order by x) from generate_series(1, 100) x
                         where feedback_tier(100, abs(x - 40)) = feedback_tier(100, 39)
                           and feedback_tier(100, abs(x - 27)) = feedback_tier(100, 26)) then
    raise exception 'ОШИБКА: бот под туманом видит не то: %', v;
  end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 7. отметку снаружи не поставить и не вызвать
set local role anon;
do $$
begin
  if has_function_privilege('anon', 'matches_hide_from()', 'execute') then
    raise exception 'ОШИБКА: anon может звать matches_hide_from';
  end if;
  if not has_function_privilege('anon', 'match_state(text,text,bigint)', 'execute') then
    raise exception 'ОШИБКА: anon не может звать match_state';
  end if;
end $$;
reset role;
\echo ok

rollback;
