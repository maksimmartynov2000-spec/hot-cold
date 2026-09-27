\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: партии и рейтинг откатываются в конце
begin;

\echo === подготовка
do $$ begin
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null;
end $$;
\echo ok

\echo === 1. пока партия идёт, всех ходов не отдают — ни участнику, ни чужому
do $$
declare mid bigint;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed)
  values ('Лев', 'Кира', 'active', 1, 100, 2) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set secret = 30 where matches.id = mid;
  perform match_guess('Лев', '1234', mid, 50);
  begin
    perform match_review('Лев', '1234', mid);
    raise exception 'ОШИБКА: ходы отданы до конца партии';
  exception when others then if sqlerrm not like '%match_not_over%' then raise; end if;
  end;
  begin
    perform match_review('Максим', '1111', mid);
    raise exception 'ОШИБКА: ходы отданы чужому';
  exception when others then if sqlerrm not like '%not_your_match%' then raise; end if;
  end;
  begin
    perform match_review('Лев', '0000', mid);
    raise exception 'ОШИБКА: ходы отданы без PIN';
  exception when others then if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Лев';
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

\echo === 2. после партии — все ходы всех раундов по порядку, у обоих
do $$
declare mid bigint; r jsonb; r2 jsonb; mv jsonb;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed)
  values ('Лев', 'Кира', 'active', 1, 100, 2) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set secret = 30 where matches.id = mid;
  perform match_guess('Лев', '1234', mid, 50);   -- раунд 1
  perform match_guess('Кира', '4321', mid, 30);
  perform next_match_round('Лев', '1234', mid);    -- раунд 2, начинает Кира
  update matches set secret = 70 where matches.id = mid;
  perform match_guess('Кира', '4321', mid, 10);
  perform match_guess('Лев', '1234', mid, 60);
  perform match_guess('Кира', '4321', mid, 70);
  r := match_review('Лев', '1234', mid);
  r2 := match_review('Кира', '4321', mid);
  if r is distinct from r2 then raise exception 'ОШИБКА: участники видят разное'; end if;
  if jsonb_array_length(r->'moves') <> 5 then raise exception 'ОШИБКА: ходов %', jsonb_array_length(r->'moves'); end if;
  if (select string_agg((x->>'round') || ':' || (x->>'seat') || ':' || (x->>'guess'), ',' order by n)
      from jsonb_array_elements(r->'moves') with ordinality t(x, n)) <> '1:0:50,1:1:30,2:1:10,2:0:60,2:1:70' then
    raise exception 'ОШИБКА: порядок ходов %', r->'moves';
  end if;
  mv := r->'moves'->1;
  if (mv->>'tier')::int <> 8 or (mv->>'forced')::boolean or (mv->>'limited')::boolean or (mv->>'timeout')::boolean then
    raise exception 'ОШИБКА: обычный угаданный ход размечен неверно: %', mv;
  end if;
  if (r->'moves'->0->>'tier')::int <> feedback_tier(100, 20) then raise exception 'ОШИБКА: пояс хода'; end if;
  -- И после конца чужой ходов не получает
  begin
    perform match_review('Максим', '1111', mid);
    raise exception 'ОШИБКА: чужой видит ходы законченной партии';
  exception when others then if sqlerrm not like '%not_your_match%' then raise; end if;
  end;
end $$;
\echo ok

\echo === 3. ход под туманом помечен, бросок в лаву помечен, пропуск по времени — отдельной строкой
do $$
declare mid bigint; r jsonb; flags text;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed, bonuses_on)
  values ('Лев', 'Кира', 'active', 1, 100, 1, true) returning matches.id into mid;
  perform start_match_round(mid);
  delete from match_bonuses where match_id = mid;
  update matches set secret = 40 where matches.id = mid;
  -- Лев ходит под туманом
  update matches set fog = array[true, false] where matches.id = mid;
  perform match_guess('Лев', '1234', mid, 90);
  -- Кира молчит до конца срока
  update matches set turn_deadline = now() - interval '1 second' where matches.id = mid;
  perform apply_turn_timeout(mid);
  -- Лев бросает в лаву
  update matches set fog = array[false, false], auto_lava = array[true, false] where matches.id = mid;
  perform do_forced_turn('Лев', '1234', mid);
  -- Кира угадывает
  perform match_guess('Кира', '4321', mid, 40);
  r := match_review('Лев', '1234', mid);
  select string_agg(case when (x->>'timeout')::boolean then 'T'
                         when (x->>'forced')::boolean then 'F'
                         when (x->>'limited')::boolean then 'L' else 'N' end, '' order by n)
    into flags
  from jsonb_array_elements(r->'moves') with ordinality t(x, n);
  if flags <> 'LTFN' then raise exception 'ОШИБКА: пометки % в %', flags, r->'moves'; end if;
  if (r->'moves'->1->>'guess') is not null then raise exception 'ОШИБКА: у пропуска есть число'; end if;
end $$;
\echo ok

\echo === 4. короткая память и слепота — тоже «под помехой»
do $$
declare mid bigint; r jsonb;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed)
  values ('Лев', 'Кира', 'active', 1, 100, 1) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set secret = 40, short_memory = array[true, false], blind = array[false, true] where matches.id = mid;
  perform match_guess('Лев', '1234', mid, 90);
  perform match_guess('Кира', '4321', mid, 40);
  r := match_review('Кира', '4321', mid);
  if not ((r->'moves'->0->>'limited')::boolean and (r->'moves'->1->>'limited')::boolean) then
    raise exception 'ОШИБКА: память/слепота не помечены: %', r->'moves';
  end if;
end $$;
\echo ok

\echo === 5. ход бота размечается так же
do $$
declare mid bigint; r jsonb;
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, starter, wins_needed)
  values ('Лев', '@bot:owl', true, 0, 'active', 1, 100, 1, 0.9, 1, 1) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set fog = array[false, true], turn_deadline = now() - interval '20 seconds' where matches.id = mid;
  perform bot_act(mid);
  update matches set status = 'finished', match_over = true where matches.id = mid;
  r := match_review('Лев', '1234', mid);
  if jsonb_array_length(r->'moves') <> 1 or (r->'moves'->0->>'seat')::int <> 1
     or not (r->'moves'->0->>'limited')::boolean then
    raise exception 'ОШИБКА: ход бота под туманом %', r->'moves';
  end if;
end $$;
\echo ok

\echo === 6. anon смотрит разбор через функцию, но таблицу ходов напрямую не читает
set local role anon;
do $$
declare n int := 0;
begin
  if not has_function_privilege('anon', 'match_review(text,text,bigint)', 'execute') then
    raise exception 'ОШИБКА: anon не может звать match_review';
  end if;
  begin
    select count(*) into n from match_moves;
  exception when insufficient_privilege then n := 0;
  end;
  if n > 0 then raise exception 'ОШИБКА: anon читает ходы напрямую'; end if;
  if has_function_privilege('anon', 'match_guess_core(bigint,int,int)', 'execute') then
    raise exception 'ОШИБКА: anon может ходить без PIN';
  end if;
end $$;
reset role;
\echo ok

rollback;
