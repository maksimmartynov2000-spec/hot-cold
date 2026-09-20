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
  if (st ->> 'turnSeconds')::int <> 30 then
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
  if (st ->> 'cur')::int <> 1 then raise exception 'ОШИБКА: очередь не перешла по времени'; end if;
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
    if sqlerrm <> 'not_your_turn' then raise; end if;
  end;
  select count(*) into n2 from match_moves where match_id = mid;
  if n2 <> n1 then raise exception 'ОШИБКА: опоздавший ход записался'; end if;
  st := match_state('Лев','1234',mid);
  if (st ->> 'cur')::int <> 0 then raise exception 'ОШИБКА: очередь не вернулась'; end if;
end $$;
\echo ok

\echo === 4. бонусы расставляются только когда их просили
do $$
declare mid bigint := current_setting('t.b')::bigint; n int;
begin
  select count(*) into n from match_bonuses where match_id = mid;
  if n <> 0 then raise exception 'ОШИБКА: бонусы появились без спроса (% шт.)', n; end if;
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
  if n <> 6 then raise exception 'ОШИБКА: бонусов % вместо 6', n; end if;
  select count(*) into bad from match_bonuses b
  where b.match_id = mid and (b.value = m.secret or b.value < m.range_min or b.value > m.range_max);
  if bad <> 0 then raise exception 'ОШИБКА: бонус на ответе или за границей'; end if;
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
  if m.rush[2] <> 3 then raise exception 'ОШИБКА: спешка не легла на соперника'; end if;
  perform apply_match_bonus(mid, 'rush', 0);
  select * into m from matches where id = mid;
  if m.rush[2] <> 6 then raise exception 'ОШИБКА: спешка не сложилась'; end if;
  update matches set cur = 1 where id = mid;
  select * into m from matches where id = mid;
  if turn_seconds(m) <> 24 then raise exception 'ОШИБКА: на ход % секунд вместо 24', turn_seconds(m); end if;
  update matches set rush = array[0, 100], cur = 1 where id = mid;
  select * into m from matches where id = mid;
  if turn_seconds(m) <> 10 then raise exception 'ОШИБКА: время упало ниже десяти секунд — %', turn_seconds(m); end if;
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
  if jsonb_array_length(st -> 'moves') <> 4 then
    raise exception 'ОШИБКА: без памяти показано % ходов', jsonb_array_length(st -> 'moves');
  end if;
  update matches set short_memory = array[true, false] where id = mid;
  st := match_state('Лев','1234',mid);
  if jsonb_array_length(st -> 'moves') <> 2 then
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
  if st ->> 'forced' <> 'skip' then raise exception 'ОШИБКА: пропуск не объявлен'; end if;
  begin
    perform match_guess('Лев','1234',mid,50);
    raise exception 'ОШИБКА: сходил вместо пропуска';
  exception when others then
    if sqlerrm <> 'forced_turn' then raise; end if;
  end;
  select count(*) into before from match_moves where match_id = mid;
  perform do_forced_turn('Лев','1234',mid);
  select count(*) into after from match_moves where match_id = mid;
  if after <> before then raise exception 'ОШИБКА: пропуск добавил ход в историю'; end if;
  st := match_state('Лев','1234',mid);
  if (st ->> 'cur')::int <> 1 then raise exception 'ОШИБКА: пропуск не отдал очередь'; end if;
end $$;
\echo ok

\echo === 11. бросок в лаву попадает в самый горячий пояс
do $$
declare mid bigint := current_setting('t.b')::bigint; m matches; last_move record; hottest int;
begin
  update matches set auto_lava = array[false, true], cur = 1, round_over = false,
                     turn_deadline = now() + interval '30 seconds' where id = mid;
  perform do_forced_turn('Кира','4321',mid);
  select * into m from matches where id = mid;
  select * into last_move from match_moves where match_id = mid order by id desc limit 1;
  hottest := (tier_upper(match_span(m)))[8];
  if last_move.seat <> 1 then raise exception 'ОШИБКА: бросок сделан не за того'; end if;
  if abs(last_move.guess - m.secret) > hottest or last_move.guess = m.secret then
    raise exception 'ОШИБКА: бросок мимо лавы или прямо в ответ';
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
  if m.fog[1] or m.fog[2] or m.short_memory[1] or m.rush[1] <> 0 then
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
  if n2 <> n1 + 1 then raise exception 'ОШИБКА: пропуск не записан в историю'; end if;
  if not ((st -> 'moves' -> -1) ? 'timeout') then
    raise exception 'ОШИБКА: пропуск не виден в состоянии — %', st -> 'moves';
  end if;
  if (st -> 'moves' -> -1 ->> 'seat')::int <> 0 then
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
  if n2 <> n1 + 1 then
    raise exception 'ОШИБКА: пропусков записано % вместо одного', n2 - n1;
  end if;
end $$;
\echo ok
