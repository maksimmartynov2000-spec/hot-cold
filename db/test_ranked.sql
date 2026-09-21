\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка: чистая очередь, рейтинги по 1000
do $$ begin
  delete from ranked_queue;
  delete from matches where ranked;
  update students set elo = 1000, elo_games = 0;
end $$;
\echo ok

\echo === 1. первый в очереди остаётся ждать
do $$
declare r jsonb;
begin
  r := join_ranked_queue('Лев','1234');
  if r->>'matchId' is not null then raise exception 'ОШИБКА: матч из пустой очереди'; end if;
  if (r->>'waiting')::boolean is distinct from true then raise exception 'ОШИБКА: не ждёт'; end if;
  if (select count(*) from ranked_queue where username = 'Лев') is distinct from 1 then
    raise exception 'ОШИБКА: в очереди не записан';
  end if;
end $$;
\echo ok

\echo === 2. ranked_status видит своё ожидание и размер очереди
do $$
declare r jsonb;
begin
  r := ranked_status('Лев','1234');
  if (r->>'inQueue')::boolean is distinct from true then raise exception 'ОШИБКА: не в очереди'; end if;
  if (r->>'queue')::int is distinct from 1 then raise exception 'ОШИБКА: размер очереди'; end if;
  if (r->>'elo')::int is distinct from 1000 then raise exception 'ОШИБКА: рейтинг новичка'; end if;
  if (r->>'games')::int is distinct from 0 then raise exception 'ОШИБКА: счётчик игр'; end if;
  if r->>'matchId' is not null then raise exception 'ОШИБКА: матч взялся неизвестно откуда'; end if;
  if r->>'lastAgo' is not null then raise exception 'ОШИБКА: игр не было, а давность есть'; end if;
end $$;
\echo ok

\echo === 3. второй игрок подбирается к первому
do $$
declare r jsonb; mid bigint; m matches;
begin
  r := join_ranked_queue('Кира','4321');
  mid := (r->>'matchId')::bigint;
  if mid is null then raise exception 'ОШИБКА: подбор не сработал'; end if;
  perform set_config('t.m', mid::text, false);
  select * into m from matches where id = mid;
  if not m.ranked then raise exception 'ОШИБКА: матч не рейтинговый'; end if;
  if m.status is distinct from 'active' then raise exception 'ОШИБКА: матч не начат'; end if;
  if m.bonuses_on or m.frost then raise exception 'ОШИБКА: рейтинг с бонусами или морозом'; end if;
  if m.wins_needed is distinct from 3 then raise exception 'ОШИБКА: не три победы'; end if;
  if (m.range_min, m.range_max) is distinct from (1, 100) then raise exception 'ОШИБКА: диапазон'; end if;
  -- Первым ходит тот, кто ждал дольше
  if m.p0 is distinct from 'Лев' or m.cur is distinct from 0 then
    raise exception 'ОШИБКА: ждавший дольше не ходит первым';
  end if;
  if m.secret is null or m.turn_deadline is null then raise exception 'ОШИБКА: раунд не роздан'; end if;
end $$;
\echo ok

\echo === 4. очередь после подбора пуста, и оба видят матч
do $$
declare r jsonb; mid bigint := current_setting('t.m')::bigint;
begin
  r := ranked_status('Лев','1234');
  if (r->>'matchId')::bigint is distinct from mid then raise exception 'ОШИБКА: ждавший не видит матч'; end if;
  r := ranked_status('Кира','4321');
  if (r->>'matchId')::bigint is distinct from mid then raise exception 'ОШИБКА: второй не видит матч'; end if;
  if (select count(*) from ranked_queue) is distinct from 0 then raise exception 'ОШИБКА: очередь не убрана'; end if;
end $$;
\echo ok

\echo === 5. повторный вход в очередь возвращает уже идущий матч
do $$
declare r jsonb; mid bigint := current_setting('t.m')::bigint;
begin
  r := join_ranked_queue('Лев','1234');
  if (r->>'matchId')::bigint is distinct from mid then raise exception 'ОШИБКА: создался второй матч'; end if;
  if (select count(*) from ranked_queue) is distinct from 0 then raise exception 'ОШИБКА: попал в очередь при живом матче'; end if;
end $$;
\echo ok

\echo === 6. окно подбора расширяется со временем ожидания
do $$
declare w0 int; w1 int; w2 int;
begin
  w0 := queue_window(now());
  w1 := queue_window(now() - interval '20 seconds');
  w2 := queue_window(now() - interval '60 seconds');
  if w0 is distinct from 100 then raise exception 'ОШИБКА: стартовое окно %', w0; end if;
  if w1 is distinct from 150 then raise exception 'ОШИБКА: окно через 20 с %', w1; end if;
  if w2 is distinct from 300 then raise exception 'ОШИБКА: окно через минуту %', w2; end if;
end $$;
\echo ok

\echo === 7. далёкий по рейтингу соперник сразу не подбирается, а через минуту да
do $$
declare r jsonb;
begin
  delete from ranked_queue;
  delete from matches where ranked;
  update students set elo = 1000, elo_games = 0;
  update students set elo = 1400 where username = 'Кира';

  perform join_ranked_queue('Лев','1234');
  r := join_ranked_queue('Кира','4321');
  if r->>'matchId' is not null then raise exception 'ОШИБКА: подобрал слишком далёкого'; end if;

  -- Лев ждёт уже полторы минуты: окно 400, разрыв 400 — пора играть
  update ranked_queue set joined_at = now() - interval '90 seconds' where username = 'Лев';
  delete from ranked_queue where username = 'Кира';
  r := join_ranked_queue('Кира','4321');
  if r->>'matchId' is null then raise exception 'ОШИБКА: окно не расширилось'; end if;
  perform set_config('t.m', (r->>'matchId'), false);
end $$;
\echo ok

\echo === 8. рейтинг считается один раз и ровно по Эло
do $$
declare mid bigint := current_setting('t.m')::bigint; m matches;
        lev int; kira int; d jsonb;
begin
  select * into m from matches where id = mid;
  -- Лев (1000) обыгрывает Киру (1400): ожидание 0.0909, K=40 у обоих
  update matches set wins[match_seat(m,'Лев') + 1] = 2, cur = match_seat(m, 'Лев'),
      turn_deadline = now() + interval '1 minute' where id = mid;
  select * into m from matches where id = mid;
  perform match_guess('Лев','1234', mid, m.secret);

  select elo into lev from students where username = 'Лев';
  select elo into kira from students where username = 'Кира';
  if lev is distinct from 1036 then raise exception 'ОШИБКА: рейтинг победителя %', lev; end if;
  if kira is distinct from 1364 then raise exception 'ОШИБКА: рейтинг проигравшего %', kira; end if;
  if (select elo_games from students where username = 'Лев') is distinct from 1 then
    raise exception 'ОШИБКА: игра не засчитана';
  end if;

  select to_jsonb(elo_delta) into d from matches where id = mid;
  if (d->>(match_seat(m,'Лев')))::int is distinct from 36 then raise exception 'ОШИБКА: прибавка не записана'; end if;
  if (d->>(match_seat(m,'Кира')))::int is distinct from -36 then raise exception 'ОШИБКА: убавка не записана'; end if;

  -- Второй раз тот же матч рейтинг не двигает
  perform apply_elo(mid, match_seat(m, 'Лев'));
  if (select elo from students where username = 'Лев') is distinct from lev then
    raise exception 'ОШИБКА: рейтинг начислился дважды';
  end if;
end $$;
\echo ok

\echo === 9. K падает до 24 после десяти игр
do $$
declare mid bigint; m matches;
begin
  delete from matches where ranked;
  delete from ranked_queue;
  update students set elo = 1000, elo_games = 20;
  perform join_ranked_queue('Лев','1234');
  mid := (join_ranked_queue('Кира','4321')->>'matchId')::bigint;
  select * into m from matches where id = mid;
  update matches set wins[match_seat(m,'Лев') + 1] = 2, cur = match_seat(m, 'Лев'),
      turn_deadline = now() + interval '1 minute' where id = mid;
  select * into m from matches where id = mid;
  perform match_guess('Лев','1234', mid, m.secret);
  -- равные рейтинги: ожидание 0.5, прибавка round(24 * 0.5) = 12
  if (select elo from students where username = 'Лев') is distinct from 1012 then
    raise exception 'ОШИБКА: K после десяти игр';
  end if;
  if (select elo from students where username = 'Кира') is distinct from 988 then
    raise exception 'ОШИБКА: K проигравшего после десяти игр';
  end if;
end $$;
\echo ok

\echo === 10. дружеский матч рейтинг не двигает
do $$
declare mid bigint; m matches;
begin
  delete from matches;
  update students set elo = 1000, elo_games = 0;
  if friend_status('Лев','Кира') is distinct from 'friend' then
    perform send_friend_request('Лев','1234','Кира');
    perform respond_friend_request('Кира','4321','Лев',true);
  end if;
  mid := challenge_friend('Лев','1234','Кира',100,false,1,false,null);
  perform respond_challenge('Кира','4321', mid, true);
  update matches set turn_deadline = now() + interval '1 minute' where id = mid;
  select * into m from matches where id = mid;
  perform match_guess(case when m.cur = 0 then m.p0 else m.p1 end,
                      case when (case when m.cur = 0 then m.p0 else m.p1 end) = 'Лев' then '1234' else '4321' end,
                      mid, m.secret);
  if (select count(*) from students where elo <> 1000 or elo_games <> 0) is distinct from 0 then
    raise exception 'ОШИБКА: дружеская игра попала в рейтинг';
  end if;
end $$;
\echo ok

\echo === 11. один пропуск хода — не поражение, ход переходит
do $$
declare mid bigint; m matches; was int;
begin
  delete from matches; delete from ranked_queue;
  update students set elo = 1000, elo_games = 0;
  perform join_ranked_queue('Лев','1234');
  mid := (join_ranked_queue('Кира','4321')->>'matchId')::bigint;
  perform set_config('t.m', mid::text, false);
  select * into m from matches where id = mid;
  was := m.cur;
  update matches set turn_deadline = now() - interval '1 second' where id = mid;
  if apply_turn_timeout(mid) is distinct from true then raise exception 'ОШИБКА: просрочка не сработала'; end if;
  select * into m from matches where id = mid;
  if m.match_over then raise exception 'ОШИБКА: первый пропуск закончил матч'; end if;
  if m.cur is distinct from 1 - was then raise exception 'ОШИБКА: ход не перешёл'; end if;
  if m.timeouts[was + 1] is distinct from 1 then raise exception 'ОШИБКА: молчание не посчитано'; end if;
  if (select count(*) from students where elo_games > 0) is distinct from 0 then
    raise exception 'ОШИБКА: рейтинг за один пропуск';
  end if;
end $$;
\echo ok

\echo === 12. реальный ход обнуляет счётчик молчания
do $$
declare mid bigint := current_setting('t.m')::bigint; m matches; mover text; pin text;
begin
  select * into m from matches where id = mid;
  mover := case when m.cur = 0 then m.p0 else m.p1 end;
  pin := case when mover = 'Лев' then '1234' else '4321' end;
  update matches set timeouts[m.cur + 1] = 1, turn_deadline = now() + interval '1 minute'
  where id = mid;
  perform match_guess(mover, pin, mid, case when m.secret = m.range_min then m.range_max else m.range_min end);
  if (select timeouts[m.cur + 1] from matches where id = mid) is distinct from 0 then
    raise exception 'ОШИБКА: счётчик не обнулился';
  end if;
end $$;
\echo ok

\echo === 13. два пропуска подряд — поражение и рейтинг сопернику
do $$
declare mid bigint := current_setting('t.m')::bigint; m matches; gone int; rival int;
begin
  select * into m from matches where id = mid;
  gone := m.cur; rival := 1 - m.cur;
  update matches set turn_deadline = now() - interval '1 second', timeouts[m.cur + 1] = 1 where id = mid;
  perform apply_turn_timeout(mid);
  select * into m from matches where id = mid;
  if not m.match_over then raise exception 'ОШИБКА: матч не закончился'; end if;
  if m.status is distinct from 'finished' then raise exception 'ОШИБКА: статус матча'; end if;
  if m.forfeit_by is distinct from gone then raise exception 'ОШИБКА: не отмечен ушедший'; end if;
  if m.round_winner is distinct from rival then raise exception 'ОШИБКА: раунд не отдан сопернику'; end if;
  if m.turn_deadline is not null then raise exception 'ОШИБКА: таймер продолжает идти'; end if;
  if not m.elo_applied then raise exception 'ОШИБКА: рейтинг не начислен'; end if;
  if m.elo_delta[rival + 1] <= 0 then raise exception 'ОШИБКА: победитель не вырос'; end if;
  if m.elo_delta[gone + 1] >= 0 then raise exception 'ОШИБКА: ушедший не потерял'; end if;
end $$;
\echo ok

\echo === 14. match_state рассказывает про рейтинг и про уход
do $$
declare mid bigint := current_setting('t.m')::bigint; m matches; st jsonb; leaver text;
begin
  select * into m from matches where id = mid;
  leaver := case when m.forfeit_by = 0 then m.p0 else m.p1 end;
  st := match_state(leaver, case when leaver = 'Лев' then '1234' else '4321' end, mid);
  if (st->>'ranked')::boolean is distinct from true then raise exception 'ОШИБКА: не видно, что матч рейтинговый'; end if;
  if (st->>'forfeitBy')::int is distinct from m.forfeit_by then raise exception 'ОШИБКА: не видно ухода'; end if;
  if st->'eloDelta' is null or st->'eloDelta' = 'null'::jsonb then raise exception 'ОШИБКА: не видно изменения рейтинга'; end if;
  if (st->>'elo')::int is distinct from (select elo from students where username = leaver) then
    raise exception 'ОШИБКА: свой рейтинг не отдан';
  end if;
end $$;
\echo ok

\echo === 15. выход из рейтинговой игры — поражение, из дружеской — нет
do $$
declare mid bigint; m matches;
begin
  delete from matches; delete from ranked_queue;
  update students set elo = 1000, elo_games = 0;
  perform join_ranked_queue('Лев','1234');
  mid := (join_ranked_queue('Кира','4321')->>'matchId')::bigint;
  perform leave_match('Лев','1234', mid);
  select * into m from matches where id = mid;
  if m.forfeit_by is distinct from match_seat(m, 'Лев') then raise exception 'ОШИБКА: ушедший не отмечен'; end if;
  if not m.elo_applied then raise exception 'ОШИБКА: за уход рейтинг не начислен'; end if;
  if (select elo from students where username = 'Лев') >= 1000 then raise exception 'ОШИБКА: ушедший не потерял рейтинг'; end if;
  if (select elo from students where username = 'Кира') <= 1000 then raise exception 'ОШИБКА: оставшийся не получил рейтинг'; end if;

  delete from matches;
  update students set elo = 1000, elo_games = 0;
  mid := challenge_friend('Лев','1234','Кира',100,false,3,false,null);
  perform respond_challenge('Кира','4321', mid, true);
  perform leave_match('Лев','1234', mid);
  select * into m from matches where id = mid;
  if m.forfeit_by is not null then raise exception 'ОШИБКА: дружеский выход записан как сдача'; end if;
  if (select count(*) from students where elo_games > 0) is distinct from 0 then
    raise exception 'ОШИБКА: дружеский выход задел рейтинг';
  end if;
end $$;
\echo ok

\echo === 15б. список игр различает рейтинг и дружеский вызов
do $$
declare mid bigint; n int;
begin
  delete from matches; delete from ranked_queue;
  update students set elo = 1000, elo_games = 0;
  perform join_ranked_queue('Лев','1234');
  mid := (join_ranked_queue('Кира','4321')->>'matchId')::bigint;
  select count(*) into n from list_matches('Лев','1234') where id = mid and ranked;
  if n is distinct from 1 then raise exception 'ОШИБКА: рейтинговая игра не помечена'; end if;

  delete from matches;
  mid := challenge_friend('Лев','1234','Кира',100,false,3,false,null);
  select count(*) into n from list_matches('Лев','1234') where id = mid and not ranked;
  if n is distinct from 1 then raise exception 'ОШИБКА: дружеский вызов помечен рейтингом'; end if;
end $$;
\echo ok

\echo === 16. выход из очереди
do $$
declare r jsonb;
begin
  delete from matches; delete from ranked_queue;
  perform join_ranked_queue('Максим','1111');
  if (select count(*) from ranked_queue) is distinct from 1 then raise exception 'ОШИБКА: не встал в очередь'; end if;
  perform leave_ranked_queue('Максим','1111');
  if (select count(*) from ranked_queue) is distinct from 0 then raise exception 'ОШИБКА: не вышел из очереди'; end if;
  r := ranked_status('Максим','1111');
  if (r->>'inQueue')::boolean is distinct from false then raise exception 'ОШИБКА: всё ещё в очереди'; end if;
end $$;
\echo ok

\echo === 17. таблица рейтинга: только с трёх игр, по убыванию
do $$
declare n int; top text;
begin
  update students set elo = 1000, elo_games = 0;
  update students set elo = 1200, elo_games = 5 where username = 'Кира';
  update students set elo = 1100, elo_games = 3 where username = 'Лев';
  update students set elo = 1500, elo_games = 2 where username = 'Максим';
  select count(*) into n from elo_leaderboard();
  if n is distinct from 2 then raise exception 'ОШИБКА: в таблице % строк', n; end if;
  select username into top from elo_leaderboard() limit 1;
  if top is distinct from 'Кира' then raise exception 'ОШИБКА: порядок в таблице'; end if;
  if exists (select 1 from elo_leaderboard() where username = 'Максим') then
    raise exception 'ОШИБКА: попал с двумя играми';
  end if;
end $$;
\echo ok

\echo === 18. чужим PIN в рейтинг не войти
do $$ begin
  begin
    perform join_ranked_queue('Лев','9999');
    raise exception 'ОШИБКА: вошёл с чужим PIN';
  exception when others then
    if sqlerrm is distinct from 'auth_failed' then raise; end if;
  end;
  begin
    perform ranked_status('Лев','9999');
    raise exception 'ОШИБКА: статус по чужому PIN';
  exception when others then
    if sqlerrm is distinct from 'auth_failed' then raise; end if;
  end;
end $$;
\echo ok

\echo === 19. очередь недоступна напрямую и служебные функции закрыты
begin;
set local role anon;
do $$ begin
  if (select count(*) from ranked_queue) is distinct from 0 then
    raise exception 'ОШИБКА: anon читает очередь';
  end if;
  begin
    insert into ranked_queue(username, elo) values ('Лев', 3000);
    raise exception 'ОШИБКА: anon пишет в очередь';
  exception when insufficient_privilege then null;
  end;
  begin
    perform apply_elo(1, 0);
    raise exception 'ОШИБКА: anon начисляет рейтинг';
  exception when insufficient_privilege then null;
  end;
  begin
    perform queue_window(now());
    raise exception 'ОШИБКА: anon видит окно подбора';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
\echo ok

\echo === 20. рейтинг не уходит ниже пола, и потеря показывается настоящая
do $$
declare mid bigint;
begin
  delete from matches; delete from ranked_queue;
  -- Оба на самом дне: формула отняла бы 20, но отнимать уже нечего
  update students set elo = 100, elo_games = 0;
  insert into matches(p0, p1, wins_needed, range_min, range_max, ranked, status, secret)
  values ('Лев', 'Кира', 1, 1, 100, true, 'active', 50) returning id into mid;
  perform apply_elo(mid, 0);
  if (select elo from students where username = 'Кира') is distinct from 100 then
    raise exception 'ОШИБКА: рейтинг ушёл ниже пола: %',
      (select elo from students where username = 'Кира');
  end if;
  if (select elo from students where username = 'Лев') is distinct from 120 then
    raise exception 'ОШИБКА: победитель получил не 20';
  end if;
  if (select elo_delta[2] from matches where id = mid) is distinct from 0 then
    raise exception 'ОШИБКА: показана потеря, которой не было: %',
      (select elo_delta[2] from matches where id = mid);
  end if;
end $$;
\echo ok

\echo === 21. занятую строку очереди третий игрок не подхватывает
do $$
declare r jsonb; mid bigint;
begin
  delete from matches; delete from ranked_queue;
  update students set elo = 1000, elo_games = 0;
  perform join_ranked_queue('Лев','1234');
  mid := (join_ranked_queue('Кира','4321')->>'matchId')::bigint;
  if mid is null then raise exception 'ОШИБКА: пара не собралась'; end if;

  -- Строка Льва уже отработала: Максим должен остаться ждать
  r := join_ranked_queue('Максим','1111');
  if r->>'matchId' is not null then raise exception 'ОШИБКА: подобрался к занятому'; end if;
  if (select count(*) from matches where ranked and status = 'active'
        and (p0 = 'Лев' or p1 = 'Лев')) is distinct from 1 then
    raise exception 'ОШИБКА: у Льва больше одного рейтингового матча';
  end if;
end $$;
\echo ok

\echo === уборка
do $$ begin
  delete from matches; delete from ranked_queue;
  update students set elo = 1000, elo_games = 0;
end $$;
\echo ok
