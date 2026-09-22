\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка
do $$ begin
  if friend_status('Лев','Кира') is distinct from 'friend' then
    perform send_friend_request('Лев','1234','Кира');
    if friend_status('Лев','Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира','4321','Лев',true);
    end if;
  end if;
  delete from matches where (p0, p1) in (('Лев','Кира'), ('Кира','Лев'));
end $$;
\echo ok

\echo === 1. таймер: тридцать секунд на ход
do $$
declare mid bigint; st jsonb;
begin
  mid := challenge_friend('Лев','1234','Кира',100,false,3,false,null);
  perform set_config('t.b', mid::text, false);
  perform respond_challenge('Кира','4321',mid,true);
  st := match_state('Лев','1234',mid);
  if (st ->> 'turnSeconds')::int is distinct from 30 then
    raise exception 'ОШИБКА: на ход % секунд вместо 30', st ->> 'turnSeconds';
  end if;
  if (st ->> 'secondsLeft')::int > 30 or (st ->> 'secondsLeft')::int < 25 then
    raise exception 'ОШИБКА: осталось % секунд', st ->> 'secondsLeft';
  end if;
end $$;
\echo ok

\echo === 2. просроченный ход отдаёт очередь сопернику
do $$
declare mid bigint := current_setting('t.b')::bigint; st jsonb;
begin
  update matches set turn_deadline = now() - interval '1 second' where id = mid;
  st := match_state('Кира','4321',mid);
  if (st ->> 'cur')::int is distinct from 1 then raise exception 'ОШИБКА: очередь не перешла по времени'; end if;
  if not (st ->> 'lastTimeout')::boolean then raise exception 'ОШИБКА: не отмечено, что вышло время'; end if;
  if (st ->> 'secondsLeft')::int < 25 then raise exception 'ОШИБКА: таймер не перезапустился'; end if;
end $$;
\echo ok

\echo === 3. ход после срока не проходит, а превращается в потерю хода
do $$
declare mid bigint := current_setting('t.b')::bigint; n1 int; n2 int; st jsonb;
begin
  select count(*) into n1 from match_moves where match_id = mid;
  update matches set turn_deadline = now() - interval '1 second' where id = mid;
  begin
    perform match_guess('Кира','4321',mid,50);
    raise exception 'ОШИБКА: опоздавший ход прошёл';
  exception when others then
    if sqlerrm is distinct from 'not_your_turn' then raise; end if;
  end;
  select count(*) into n2 from match_moves where match_id = mid;
  if n2 is distinct from n1 then raise exception 'ОШИБКА: опоздавший ход записался'; end if;
  st := match_state('Лев','1234',mid);
  if (st ->> 'cur')::int is distinct from 0 then raise exception 'ОШИБКА: очередь не вернулась'; end if;
end $$;
\echo ok

\echo === 4. бонусы расставляются только когда их просили
do $$
declare mid bigint := current_setting('t.b')::bigint; n int;
begin
  select count(*) into n from match_bonuses where match_id = mid;
  if n is distinct from 0 then raise exception 'ОШИБКА: бонусы появились без спроса (% шт.)', n; end if;
end $$;
\echo ok

\echo === 5. с бонусами: их столько, сколько нужно, и не на ответе
do $$
declare mid bigint; m matches; n int; bad int;
begin
  delete from matches where (p0, p1) in (('Лев','Кира'), ('Кира','Лев'));
  mid := challenge_friend('Лев','1234','Кира',100,false,9,true,6);
  perform set_config('t.b', mid::text, false);
  perform respond_challenge('Кира','4321',mid,true);
  select * into m from matches where id = mid;
  select count(*) into n from match_bonuses where match_id = mid and round = m.round;
  if n is distinct from 6 then raise exception 'ОШИБКА: бонусов % вместо 6', n; end if;
  select count(*) into bad from match_bonuses b
  where b.match_id = mid and (b.value = m.secret or b.value < m.range_min or b.value > m.range_max);
  if bad is distinct from 0 then raise exception 'ОШИБКА: бонус на ответе или за границей'; end if;
end $$;
\echo ok

\echo === 6. бонусы не видны игрокам в состоянии
do $$
declare mid bigint := current_setting('t.b')::bigint; st jsonb; v int;
begin
  select value into v from match_bonuses where match_id = mid limit 1;
  st := match_state('Лев','1234',mid);
  if st::text ~ ('"value"') then raise exception 'УТЕЧКА: позиции бонусов в ответе'; end if;
  if st ? 'bonuses' then raise exception 'УТЕЧКА: список бонусов в ответе'; end if;
end $$;
\echo ok

\echo === 7. «Спешка» урезает время сопернику и складывается
do $$
declare mid bigint := current_setting('t.b')::bigint; m matches; st jsonb;
begin
  select * into m from matches where id = mid;
  perform apply_match_bonus(mid, 'rush', 0);
  select * into m from matches where id = mid;
  if m.rush[2] is distinct from 3 then raise exception 'ОШИБКА: спешка не легла на соперника'; end if;
  perform apply_match_bonus(mid, 'rush', 0);
  select * into m from matches where id = mid;
  if m.rush[2] is distinct from 6 then raise exception 'ОШИБКА: спешка не сложилась'; end if;
  update matches set cur = 1 where id = mid;
  select * into m from matches where id = mid;
  if turn_seconds(m) is distinct from 24 then raise exception 'ОШИБКА: на ход % секунд вместо 24', turn_seconds(m); end if;
  update matches set rush = array[0, 100], cur = 1 where id = mid;
  select * into m from matches where id = mid;
  if turn_seconds(m) is distinct from 10 then raise exception 'ОШИБКА: время упало ниже десяти секунд — %', turn_seconds(m); end if;
  update matches set rush = array[0, 0], cur = 0 where id = mid;
end $$;
\echo ok

\echo === 8. туман прячет чужие ходы прямо в ответе сервера
do $$
declare mid bigint; m matches; st jsonb; mine int;
begin
  delete from matches where (p0, p1) in (('Лев','Кира'), ('Кира','Лев'));
  mid := challenge_friend('Лев','1234','Кира',100,false,9,true,1);
  perform respond_challenge('Кира','4321',mid,true);
  perform set_config('t.b', mid::text, false);
  select * into m from matches where id = mid;
  -- Лев ходит, потом на Киру кладём туман
  perform match_guess('Лев','1234',mid, case when m.secret = 1 then 2 else 1 end);
  update matches set fog = array[false, true] where id = mid;
  st := match_state('Кира','4321',mid);
  if not ((st -> 'moves' -> 0) ? 'hidden') then
    raise exception 'УТЕЧКА: под туманом чужой ход виден — %', st -> 'moves';
  end if;
  if (st -> 'moves' -> 0) ? 'guess' then
    raise exception 'УТЕЧКА: число чужого хода уехало игроку';
  end if;
  -- а Лев свои ходы видит
  st := match_state('Лев','1234',mid);
  if (st -> 'moves' -> 0) ? 'hidden' then raise exception 'ОШИБКА: свои ходы закрылись'; end if;
end $$;
\echo ok

\echo === 9. короткая память режет список до двух
do $$
declare mid bigint := current_setting('t.b')::bigint; st jsonb; m matches; i int;
begin
  update matches set fog = array[false, false], short_memory = array[false, false] where id = mid;
  select * into m from matches where id = mid;
  for i in 1..5 loop
    insert into match_moves(match_id, round, seat, guess, tier)
    values (mid, m.round, i % 2, 10 + i, 3);
  end loop;
  update matches set cur = 0 where id = mid;
  st := match_state('Лев','1234',mid);
  if jsonb_array_length(st -> 'moves') is distinct from 4 then
    raise exception 'ОШИБКА: без памяти показано % ходов', jsonb_array_length(st -> 'moves');
  end if;
  update matches set short_memory = array[true, false] where id = mid;
  st := match_state('Лев','1234',mid);
  if jsonb_array_length(st -> 'moves') is distinct from 2 then
    raise exception 'ОШИБКА: с короткой памятью показано % ходов', jsonb_array_length(st -> 'moves');
  end if;
  update matches set short_memory = array[false, false] where id = mid;
end $$;
\echo ok

\echo === 10. пропуск хода: ходить нельзя, только нажать кнопку
do $$
declare mid bigint := current_setting('t.b')::bigint; st jsonb; before int; after int;
begin
  update matches set skip_turn = array[true, false], cur = 0, round_over = false,
                     turn_deadline = now() + interval '30 seconds' where id = mid;
  st := match_state('Лев','1234',mid);
  if st ->> 'forced' is distinct from 'skip' then raise exception 'ОШИБКА: пропуск не объявлен'; end if;
  begin
    perform match_guess('Лев','1234',mid,50);
    raise exception 'ОШИБКА: сходил вместо пропуска';
  exception when others then
    if sqlerrm is distinct from 'forced_turn' then raise; end if;
  end;
  select count(*) into before from match_moves where match_id = mid;
  perform do_forced_turn('Лев','1234',mid);
  select count(*) into after from match_moves where match_id = mid;
  if after is distinct from before then raise exception 'ОШИБКА: пропуск добавил ход в историю'; end if;
  st := match_state('Лев','1234',mid);
  if (st ->> 'cur')::int is distinct from 1 then raise exception 'ОШИБКА: пропуск не отдал очередь'; end if;
end $$;
\echo ok

\echo === 11. бросок в лаву попадает в горячие пояса, но не в ответ
do $$
declare mid bigint := current_setting('t.b')::bigint; m matches; last_move record; hot int;
begin
  update matches set auto_lava = array[false, true], cur = 1, round_over = false,
                     turn_deadline = now() + interval '30 seconds' where id = mid;
  perform do_forced_turn('Кира','4321',mid);
  select * into m from matches where id = mid;
  select * into last_move from match_moves where match_id = mid order by id desc limit 1;
  -- «Лава или очень горячо»: седьмая граница, а не восьмая
  hot := (tier_upper(match_span(m)))[7];
  if last_move.seat is distinct from 1 then raise exception 'ОШИБКА: бросок сделан не за того'; end if;
  if abs(last_move.guess - m.secret) > hot or last_move.guess = m.secret then
    raise exception 'ОШИБКА: бросок мимо горячих поясов или прямо в ответ';
  end if;
end $$;
\echo ok

\echo === 12. туман и слепота на одного игрока не складываются
do $$
declare mid bigint := current_setting('t.b')::bigint; m matches;
begin
  update matches set fog = array[false, true], blind = array[false, false] where id = mid;
  select * into m from matches where id = mid;
  if not match_bonus_blocked(m, 'blind', 1) then
    raise exception 'ОШИБКА: слепота легла бы поверх тумана';
  end if;
  if match_bonus_blocked(m, 'fog', 1) then
    raise exception 'ОШИБКА: туман зря заблокирован';
  end if;
  update matches set fog = array[false, false] where id = mid;
end $$;
\echo ok

\echo === 13. новый раунд сбрасывает помехи и переставляет бонусы
do $$
declare mid bigint := current_setting('t.b')::bigint; m matches; before int[]; after int[];
begin
  update matches set round_over = true, round_winner = 0, match_over = false,
                     fog = array[true, true], rush = array[9, 9],
                     short_memory = array[true, true] where id = mid;
  select array_agg(value order by value) into before from match_bonuses where match_id = mid;
  perform next_match_round('Лев','1234',mid);
  select * into m from matches where id = mid;
  if m.fog[1] or m.fog[2] or m.short_memory[1] or m.rush[1] is distinct from 0 then
    raise exception 'ОШИБКА: помехи пережили раунд';
  end if;
  select array_agg(value order by value) into after from match_bonuses
  where match_id = mid and round = m.round;
  if after is null then raise exception 'ОШИБКА: в новом раунде бонусов нет'; end if;
  if m.turn_deadline is null then raise exception 'ОШИБКА: таймер нового раунда не заведён'; end if;
end $$;
\echo ok

\echo === 14. напрямую к бонусам anon не добирается
begin;
set local role anon;
do $$
declare n int;
begin
  begin
    select count(*) into n from match_bonuses;
    if n > 0 then raise exception 'УТЕЧКА: anon видит % бонусов напрямую', n; end if;
  exception when insufficient_privilege then null;
  end;
end $$;
commit;
\echo ok

\echo === 15. потерянный по времени ход остаётся в истории
do $$
declare mid bigint := current_setting('t.b')::bigint; st jsonb; m matches; n1 int; n2 int;
begin
  update matches set round_over = false, match_over = false, status = 'active',
                     cur = 0, fog = array[false, false], blind = array[false, false],
                     short_memory = array[false, false],
                     skip_turn = array[false, false], auto_lava = array[false, false],
                     turn_deadline = now() - interval '1 second' where id = mid;
  select * into m from matches where id = mid;
  select count(*) into n1 from match_moves where match_id = mid and round = m.round;
  st := match_state('Кира','4321',mid);
  select count(*) into n2 from match_moves where match_id = mid and round = m.round;
  if n2 is distinct from n1 + 1 then raise exception 'ОШИБКА: пропуск не записан в историю'; end if;
  if not ((st -> 'moves' -> -1) ? 'timeout') then
    raise exception 'ОШИБКА: пропуск не виден в состоянии — %', st -> 'moves';
  end if;
  if (st -> 'moves' -> -1 ->> 'seat')::int is distinct from 0 then
    raise exception 'ОШИБКА: пропуск записан не тому игроку';
  end if;
end $$;
\echo ok

\echo === 16. два клиента одновременно не делают двух пропусков
do $$
declare mid bigint := current_setting('t.b')::bigint; m matches; n1 int; n2 int;
begin
  update matches set turn_deadline = now() - interval '1 second' where id = mid;
  select * into m from matches where id = mid;
  select count(*) into n1 from match_moves where match_id = mid and round = m.round;
  perform match_state('Лев','1234',mid);
  perform match_state('Кира','4321',mid);
  perform match_state('Лев','1234',mid);
  select count(*) into n2 from match_moves where match_id = mid and round = m.round;
  if n2 is distinct from n1 + 1 then
    raise exception 'ОШИБКА: пропусков записано % вместо одного', n2 - n1;
  end if;
end $$;
\echo ok

\echo === 17. жетон на пропуске: пропуск идёт первым ходом, второй делает игрок
do $$
declare mid bigint := current_setting('t.b')::bigint; st jsonb; m matches;
        tok int; before int;
begin
  update matches set skip_turn = array[true, false], auto_lava = array[false, false],
                     cur = 0, round_over = false, match_over = false, armed = false,
                     tokens = array[1, 1],
                     turn_deadline = now() + interval '30 seconds' where id = mid;
  -- Жетон нельзя взвести первым ходом раунда: сделаем, чтобы ход уже был
  select count(*) into before from match_moves where match_id = mid;
  if before = 0 then
    insert into match_moves(match_id, round, seat, guess, tier)
    select mid, m2.round, 1, m2.range_min, 0 from matches m2 where id = mid;
  end if;

  if use_match_token('Лев','1234',mid,true) is distinct from true then
    raise exception 'ОШИБКА: жетон не взвёлся на отнятом ходе';
  end if;
  select * into m from matches where id = mid;
  if not m.armed then raise exception 'ОШИБКА: взвод не записан'; end if;
  if m.tokens[1] is distinct from 0 then raise exception 'ОШИБКА: жетон не списан'; end if;

  perform do_forced_turn('Лев','1234',mid);
  select * into m from matches where id = mid;
  if m.cur is distinct from 0 then raise exception 'ОШИБКА: пропуск с жетоном отдал ход'; end if;
  if m.armed then raise exception 'ОШИБКА: жетон не сгорел'; end if;
  if m.skip_turn[1] then raise exception 'ОШИБКА: пропуск не снялся'; end if;
  if m.turn_deadline is null or m.turn_deadline <= now() then
    raise exception 'ОШИБКА: на второй ход не дали времени';
  end if;

  st := match_state('Лев','1234',mid);
  if st ->> 'forced' is not null then raise exception 'ОШИБКА: кнопка пропуска осталась'; end if;

  -- И второй ход действительно можно сделать
  select * into m from matches where id = mid;
  perform match_guess('Лев','1234',mid,
    case when m.secret = m.range_min then m.range_max else m.range_min end);
  select * into m from matches where id = mid;
  if m.cur is distinct from 1 then raise exception 'ОШИБКА: второй ход не передал очередь'; end if;
end $$;
\echo ok

\echo === 18. без жетона пропуск по-прежнему отдаёт ход
do $$
declare mid bigint := current_setting('t.b')::bigint; m matches;
begin
  update matches set skip_turn = array[true, false], cur = 0, round_over = false,
                     match_over = false, armed = false, tokens = array[1, 1],
                     turn_deadline = now() + interval '30 seconds' where id = mid;
  perform do_forced_turn('Лев','1234',mid);
  select * into m from matches where id = mid;
  if m.cur is distinct from 1 then raise exception 'ОШИБКА: пропуск без жетона оставил ход'; end if;
  if m.tokens[1] is distinct from 1 then raise exception 'ОШИБКА: жетон тронули без надобности'; end if;
end $$;
\echo ok

\echo === 19. жетон на броске в лаву тоже даёт второй ход
do $$
declare mid bigint := current_setting('t.b')::bigint; m matches; n1 int; n2 int;
begin
  update matches set auto_lava = array[true, false], skip_turn = array[false, false],
                     cur = 0, round_over = false, match_over = false, armed = true,
                     tokens = array[0, 1],
                     turn_deadline = now() + interval '30 seconds' where id = mid;
  select count(*) into n1 from match_moves where match_id = mid;
  perform do_forced_turn('Лев','1234',mid);
  select count(*) into n2 from match_moves where match_id = mid;
  select * into m from matches where id = mid;
  if n2 is distinct from n1 + 1 then raise exception 'ОШИБКА: бросок не записан ходом'; end if;
  if m.round_over then return; end if;
  if m.cur is distinct from 0 then raise exception 'ОШИБКА: бросок с жетоном отдал ход'; end if;
  if m.armed then raise exception 'ОШИБКА: жетон не сгорел на броске'; end if;
end $$;
\echo ok

\echo === 20. число бонусов совпадает в браузере и в базе
create temp table js_bonus(span int, count int);
\copy js_bonus from '/home/user/hot-cold/db/bonus_count_js.csv' with (format csv, header true)
do $$
declare bad record; n int;
begin
  select count(*) into n from js_bonus;
  if n < 2000 then raise exception 'ОШИБКА: таблица из клиента пуста (% строк)', n; end if;
  select * into bad from js_bonus j
  where j.count is distinct from auto_bonus_count(j.span) limit 1;
  if bad.span is not null then
    raise exception 'ОШИБКА: на диапазоне % клиент считает % бонусов, база — %',
      bad.span, bad.count, auto_bonus_count(bad.span);
  end if;
  raise notice 'число бонусов совпало на всех % диапазонах', n;
end $$;
\echo ok

\echo === 21. бросок в лаву не указывает на ответ одной клеткой
do $$
declare mid bigint; m matches; i int; d int; distinct_d int[] := '{}'; v int;
begin
  delete from matches;
  insert into matches(p0, p1, range_min, range_max, secret, status, ranked)
  values ('Лев','Кира', 1, 100, 50, 'active', false) returning id into mid;
  select * into m from matches where id = mid;
  for i in 1..400 loop
    v := lava_value(m);
    d := abs(v - m.secret);
    if not (d = any(distinct_d)) then distinct_d := distinct_d || d; end if;
    -- Бросок обязан попасть в «лаву или очень горячо», но не в сам ответ
    if d = 0 then raise exception 'ОШИБКА: бросок попал в ответ'; end if;
    if feedback_tier(match_span(m), d) < 6 then
      raise exception 'ОШИБКА: бросок вне горячих поясов, расстояние %', d;
    end if;
  end loop;
  -- Раньше расстояние было ровно одно, и следующий ход выигрывал наверняка
  if array_length(distinct_d, 1) < 2 then
    raise exception 'ОШИБКА: бросок всегда на одном расстоянии — это подсказка, а не помеха';
  end if;
  delete from matches;
end $$;
\echo ok
