\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка
do $$ begin
  delete from ranked_queue;
  delete from matches;
  delete from elo_ratings; delete from rivalry;
end $$;
\echo ok

\echo === 1. четыре режима дают четыре разных набора условий
do $$
declare r record; n int;
begin
  select * into r from ranked_rules(0);
  if (r.range_min, r.range_max, r.frost, r.bonuses) is distinct from (1, 100, false, false) then
    raise exception 'ОШИБКА: режим 0';
  end if;
  select * into r from ranked_rules(1);
  if (r.range_min, r.range_max, r.frost, r.bonuses) is distinct from (-100, 100, true, false) then
    raise exception 'ОШИБКА: режим 1';
  end if;
  select * into r from ranked_rules(2);
  if (r.range_min, r.range_max, r.frost, r.bonuses) is distinct from (1, 100, false, true) then
    raise exception 'ОШИБКА: режим 2';
  end if;
  select * into r from ranked_rules(3);
  if (r.range_min, r.range_max, r.frost, r.bonuses) is distinct from (-100, 100, true, true) then
    raise exception 'ОШИБКА: режим 3';
  end if;
  -- Все четыре должны отличаться друг от друга, иначе режимы не режимы
  select count(distinct (range_min, range_max, frost, bonuses)) into n
  from generate_series(0, 3) g, lateral ranked_rules(g);
  if n is distinct from 4 then raise exception 'ОШИБКА: режимы совпадают между собой'; end if;
end $$;
\echo ok

\echo === 2. созданный матч соответствует условиям своего режима
do $$
declare md int; mid bigint; m matches; r record; bonuses int;
begin
  for md in 0..3 loop
    delete from matches; delete from ranked_queue;
    perform join_ranked_queue('Лев','1234', md);
    mid := (join_ranked_queue('Кира','4321', md)->>'matchId')::bigint;
    if mid is null then raise exception 'ОШИБКА: режим % не собрал пару', md; end if;
    select * into m from matches where id = mid;
    select * into r from ranked_rules(md);
    if (m.range_min, m.range_max, m.frost, m.bonuses_on) is distinct from
       (r.range_min, r.range_max, r.frost, r.bonuses) then
      raise exception 'ОШИБКА: режим % создан не по своим правилам', md;
    end if;
    if m.ranked_mode is distinct from md then raise exception 'ОШИБКА: режим не записан'; end if;
    if m.wins_needed is distinct from 3 then raise exception 'ОШИБКА: не три победы в режиме %', md; end if;
    if m.secret < m.range_min or m.secret > m.range_max then
      raise exception 'ОШИБКА: число вне диапазона режима %', md;
    end if;
    select count(*) into bonuses from match_bonuses where match_id = mid and round = m.round;
    if r.bonuses and bonuses = 0 then raise exception 'ОШИБКА: режим % без бонусов на поле', md; end if;
    if not r.bonuses and bonuses <> 0 then raise exception 'ОШИБКА: режим % с лишними бонусами', md; end if;
  end loop;
end $$;
\echo ok

\echo === 3. рейтинги режимов не перетекают друг в друга
do $$
declare mid bigint; m matches; n int;
begin
  delete from matches; delete from ranked_queue; delete from elo_ratings; delete from rivalry;
  perform join_ranked_queue('Лев','1234', 2);
  mid := (join_ranked_queue('Кира','4321', 2)->>'matchId')::bigint;
  select * into m from matches where id = mid;
  update matches set wins[match_seat(m,'Лев') + 1] = 2, cur = match_seat(m, 'Лев'),
      turn_deadline = now() + interval '1 minute' where id = mid;
  select * into m from matches where id = mid;
  perform match_guess('Лев','1234', mid, m.secret);

  if (select elo from elo_ratings where username = 'Лев' and mode = 2) is distinct from 1020 then
    raise exception 'ОШИБКА: рейтинг режима 2 не начислен';
  end if;
  select count(*) into n from elo_ratings where mode <> 2;
  if n is distinct from 0 then raise exception 'ОШИБКА: задело чужие режимы (% строк)', n; end if;
end $$;
\echo ok

\echo === 4. каждый режим считает свои игры и свой рейтинг
do $$
declare r jsonb;
begin
  delete from elo_ratings; delete from rivalry;
  insert into elo_ratings(username, mode, elo, games) values
    ('Лев',0,1100,4), ('Лев',1,900,6), ('Лев',3,1300,11);
  r := ranked_status('Лев','1234',1);
  if (r->>'elo')::int is distinct from 900 then raise exception 'ОШИБКА: не тот рейтинг'; end if;
  if (r->>'games')::int is distinct from 6 then raise exception 'ОШИБКА: не те игры'; end if;
  if (r->>'mode')::int is distinct from 1 then raise exception 'ОШИБКА: режим не назван'; end if;

  -- Все четыре приходят одним ответом: переключение вкладки не ждёт сервер
  if (r->'ratings'->'0'->>'elo')::int is distinct from 1100 then raise exception 'ОШИБКА: режим 0 в сводке'; end if;
  if (r->'ratings'->'2'->>'elo')::int is distinct from 1000 then raise exception 'ОШИБКА: несыгранный режим не 1000'; end if;
  if (r->'ratings'->'2'->>'games')::int is distinct from 0 then raise exception 'ОШИБКА: несыгранный режим с играми'; end if;
  if (r->'ratings'->'3'->>'elo')::int is distinct from 1300 then raise exception 'ОШИБКА: режим 3 в сводке'; end if;
end $$;
\echo ok

\echo === 5. таблица рейтинга у каждого режима своя
do $$
declare n int; top text;
begin
  delete from elo_ratings; delete from rivalry;
  insert into elo_ratings(username, mode, elo, games) values
    ('Лев',0,1500,5), ('Кира',0,1200,4),
    ('Кира',1,1400,7), ('Максим',1,1300,3), ('Лев',1,1900,2);
  select count(*) into n from elo_leaderboard(0);
  if n is distinct from 2 then raise exception 'ОШИБКА: в топе режима 0 % строк', n; end if;
  select username into top from elo_leaderboard(1) limit 1;
  if top is distinct from 'Кира' then raise exception 'ОШИБКА: не тот первый в режиме 1'; end if;
  if exists (select 1 from elo_leaderboard(1) where username = 'Лев') then
    raise exception 'ОШИБКА: попал в топ с двумя играми';
  end if;
  if exists (select 1 from elo_leaderboard(2)) then
    raise exception 'ОШИБКА: в несыгранном режиме кто-то есть';
  end if;
end $$;
\echo ok

\echo === 6. в очереди можно стоять только в одном режиме
do $$
declare r jsonb; q ranked_queue;
begin
  delete from matches; delete from ranked_queue; delete from elo_ratings; delete from rivalry;
  perform join_ranked_queue('Лев','1234', 0);
  perform join_ranked_queue('Лев','1234', 3);
  if (select count(*) from ranked_queue where username = 'Лев') is distinct from 1 then
    raise exception 'ОШИБКА: две очереди сразу';
  end if;
  select * into q from ranked_queue where username = 'Лев';
  if q.mode is distinct from 3 then raise exception 'ОШИБКА: режим очереди не сменился'; end if;

  r := ranked_status('Лев','1234',0);
  if (r->>'inQueue')::boolean is distinct from false then raise exception 'ОШИБКА: чужой режим показан как очередь'; end if;
  if (r->>'queueMode')::int is distinct from 3 then raise exception 'ОШИБКА: не сказано, где именно ждём'; end if;
  r := ranked_status('Лев','1234',3);
  if (r->>'inQueue')::boolean is distinct from true then raise exception 'ОШИБКА: свой режим не показан как очередь'; end if;
end $$;
\echo ok

\echo === 7. соперник из другого режима не подбирается
do $$
declare r jsonb;
begin
  delete from matches; delete from ranked_queue;
  perform join_ranked_queue('Лев','1234', 0);
  r := join_ranked_queue('Кира','4321', 1);
  if r->>'matchId' is not null then raise exception 'ОШИБКА: свёл разные режимы'; end if;
  if (select count(*) from ranked_queue where match_id is null) is distinct from 2 then
    raise exception 'ОШИБКА: очереди режимов перепутались';
  end if;

  -- И размер очереди считается по своему режиму
  if (ranked_status('Лев','1234',0)->>'queue')::int is distinct from 1 then
    raise exception 'ОШИБКА: в очередь режима 0 попал чужой';
  end if;
end $$;
\echo ok

\echo === 8. давность игры считается по своему режиму
do $$
declare mid bigint; r jsonb;
begin
  delete from matches; delete from ranked_queue;
  insert into matches(p0, p1, ranked, ranked_mode, status, updated_at)
  values ('Лев','Кира', true, 2, 'finished', now() - interval '10 minutes');
  r := ranked_status('Лев','1234',2);
  if (r->>'lastAgo')::int not between 560 and 640 then
    raise exception 'ОШИБКА: давность своего режима %', r->>'lastAgo';
  end if;
  r := ranked_status('Лев','1234',0);
  if r->>'lastAgo' is not null then raise exception 'ОШИБКА: чужая игра засчитана в давность'; end if;
end $$;
\echo ok

\echo === 9. номер режима проверяется
do $$ begin
  begin
    perform join_ranked_queue('Лев','1234', 4);
    raise exception 'ОШИБКА: принял несуществующий режим';
  exception when others then
    if sqlerrm is distinct from 'bad_mode' then raise; end if;
  end;
  begin
    perform ranked_status('Лев','1234', -1);
    raise exception 'ОШИБКА: статус по несуществующему режиму';
  exception when others then
    if sqlerrm is distinct from 'bad_mode' then raise; end if;
  end;
end $$;
\echo ok

\echo === 10. матч знает свой режим, и anon не лезет в рейтинги
do $$
declare mid bigint; st jsonb;
begin
  delete from matches; delete from ranked_queue;
  perform join_ranked_queue('Лев','1234', 1);
  mid := (join_ranked_queue('Кира','4321', 1)->>'matchId')::bigint;
  st := match_state('Лев','1234', mid);
  if (st->>'rankedMode')::int is distinct from 1 then raise exception 'ОШИБКА: режим не доехал до клиента'; end if;
  if (st->>'rangeMin')::int is distinct from -100 then raise exception 'ОШИБКА: границы режима 1'; end if;
  if (st->>'frost')::boolean is distinct from true then raise exception 'ОШИБКА: мороз в режиме 1'; end if;
end $$;
\echo ok

begin;
set local role anon;
do $$ begin
  if (select count(*) from elo_ratings) is distinct from 0 then
    raise exception 'ОШИБКА: anon читает рейтинги';
  end if;
  begin
    insert into elo_ratings(username, mode, elo) values ('Лев', 0, 9000);
    raise exception 'ОШИБКА: anon пишет рейтинг';
  exception when insufficient_privilege then null;
  end;
  begin
    perform ranked_rules(0);
    raise exception 'ОШИБКА: anon зовёт служебную функцию';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
\echo ok

\echo === уборка
do $$ begin
  delete from matches; delete from ranked_queue; delete from elo_ratings; delete from rivalry;
end $$;
\echo ok
