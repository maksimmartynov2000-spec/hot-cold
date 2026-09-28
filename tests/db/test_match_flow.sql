\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: партии, рейтинг и включённое правило откатываются в конце
begin;
-- run.sh выключает правило для остальных сценариев — здесь оно нужно
alter table matches enable trigger matches_flow;

\echo === подготовка
do $$ begin
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null;
  delete from ranked_queue;
  if friend_status('Лев','Кира') is distinct from 'friend' then
    perform send_friend_request('Лев','1234','Кира');
    if friend_status('Лев','Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира','4321','Лев',true);
    end if;
  end if;
end $$;
\echo ok

\echo === 1. вызов приняли — часы не идут и ходить нельзя, пока вызвавший не пришёл
do $$
declare mid bigint; m matches; st jsonb;
begin
  mid := challenge_friend('Лев','1234','Кира',100,false,3);
  perform set_config('t.f', mid::text, false);
  perform respond_challenge('Кира','4321',mid,true);
  select * into m from matches where id = mid;
  if not m.lobby or m.turn_deadline is not null then
    raise exception 'ОШИБКА: партия пошла без вызвавшего: lobby %, срок %', m.lobby, m.turn_deadline;
  end if;
  st := match_state('Кира','4321',mid);
  if not (st->>'lobby')::boolean or (st->'present'->>0)::boolean or not (st->'present'->>1)::boolean then
    raise exception 'ОШИБКА: кто на месте: %', st->'present';
  end if;
  if (st->>'lobbyLeft')::int not between 295 and 300 then raise exception 'ОШИБКА: до отмены %', st->>'lobbyLeft'; end if;
  -- Вызов друга звёзд не даёт — игра должна это знать, чтобы сказать заранее
  if (st->>'ladder')::boolean then raise exception 'ОШИБКА: вызов друга помечен как партия на звёзды'; end if;
  begin
    perform match_guess('Лев','1234',mid,50);
    raise exception 'ОШИБКА: сходил до старта';
  exception when others then if sqlerrm <> 'not_started' then raise; end if;
  end;
  -- Сколько ни жди, по времени ход не теряется: часов нет
  perform apply_turn_timeout(mid);
  if exists (select 1 from match_moves where match_id = mid) then raise exception 'ОШИБКА: пропуск до старта'; end if;
end $$;
\echo ok

\echo === 2. пришёл давно и ушёл — не считается; пришли оба — отсчёт 3 секунды
do $$
declare mid bigint := current_setting('t.f')::bigint; m matches; st jsonb;
begin
  update matches set seen_at[1] = now() - interval '20 seconds' where id = mid;
  st := match_state('Кира','4321',mid);
  if not (st->>'lobby')::boolean then raise exception 'ОШИБКА: старое присутствие засчитано'; end if;

  perform match_state('Лев','1234',mid);
  select * into m from matches where id = mid;
  if m.lobby or m.start_at is null then raise exception 'ОШИБКА: оба на месте, а партия не началась'; end if;
  if m.start_at not between now() + interval '2 seconds' and now() + interval '4 seconds' then
    raise exception 'ОШИБКА: отсчёт не 3 секунды: %', m.start_at - now();
  end if;
  if m.turn_deadline < m.start_at + interval '29 seconds' then raise exception 'ОШИБКА: часы съели отсчёт'; end if;
  st := match_state('Кира','4321',mid);
  if (st->>'startsIn')::int not between 2 and 3 then raise exception 'ОШИБКА: startsIn %', st->>'startsIn'; end if;
  begin
    perform match_guess('Лев','1234',mid,50);
    raise exception 'ОШИБКА: сходил во время отсчёта';
  exception when others then if sqlerrm <> 'not_started' then raise; end if;
  end;
  -- Отсчёт прошёл
  update matches set start_at = now() - interval '1 second' where id = mid;
  perform match_guess('Лев','1234',mid, case when m.secret = 50 then 51 else 50 end);
end $$;
\echo ok

\echo === 3. между раундами: 10 секунд, «Готов» одного не начинает, обоих — начинает
do $$
declare mid bigint := current_setting('t.f')::bigint; m matches; st jsonb; r boolean;
begin
  select * into m from matches where id = mid;
  perform match_guess('Кира','4321',mid,m.secret);
  st := match_state('Лев','1234',mid);
  if not (st->>'roundOver')::boolean then raise exception 'ОШИБКА: раунд не кончился'; end if;
  if (st->>'nextIn')::int not between 9 and 10 then raise exception 'ОШИБКА: nextIn %', st->>'nextIn'; end if;
  r := next_match_round('Лев','1234',mid);
  st := match_state('Кира','4321',mid);
  if r or (st->>'round')::int <> 1 or not (st->'ready'->>0)::boolean or (st->'ready'->>1)::boolean then
    raise exception 'ОШИБКА: один «Готов» начал раунд или не отмечен: % %', r, st->'ready';
  end if;
  r := next_match_round('Кира','4321',mid);
  st := match_state('Лев','1234',mid);
  if not r or (st->>'round')::int <> 2 or (st->>'roundOver')::boolean then raise exception 'ОШИБКА: оба готовы, а раунда нет'; end if;
  if (st->'ready'->>0)::boolean or (st->'ready'->>1)::boolean then raise exception 'ОШИБКА: «Готов» перешёл в новый раунд'; end if;
  if st->>'nextIn' is not null then raise exception 'ОШИБКА: отсчёт до раунда посреди раунда'; end if;
end $$;
\echo ok

\echo === 4. никто не нажал — через 10 секунд раунд начинается сам
do $$
declare mid bigint := current_setting('t.f')::bigint; m matches; st jsonb;
begin
  select * into m from matches where id = mid;
  perform match_guess(case when m.cur = 0 then 'Лев' else 'Кира' end,
                      case when m.cur = 0 then '1234' else '4321' end, mid, m.secret);
  st := match_state('Лев','1234',mid);
  if (st->>'round')::int <> 2 or not (st->>'roundOver')::boolean then raise exception 'ОШИБКА: раунд начался сразу'; end if;
  update matches set round_ended_at = now() - interval '11 seconds' where id = mid;
  st := match_state('Кира','4321',mid);
  if (st->>'round')::int <> 3 or (st->>'roundOver')::boolean then raise exception 'ОШИБКА: раунд сам не начался'; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 5. вызвавший не пришёл за 5 минут — отмена без результата
do $$
declare mid bigint; m matches; st jsonb;
begin
  mid := challenge_friend('Лев','1234','Кира',100,false,3);
  perform respond_challenge('Кира','4321',mid,true);
  update matches set accepted_at = now() - interval '6 minutes' where id = mid;
  st := match_state('Кира','4321',mid);
  select * into m from matches where id = mid;
  if m.status <> 'expired' or m.elo_applied or m.forfeit_by is not null then
    raise exception 'ОШИБКА: не отменилась или с результатом: % % %', m.status, m.elo_applied, m.forfeit_by;
  end if;
end $$;
\echo ok

\echo === 6. очередь: партия людей тоже ждёт обоих; уход до старта — без поражения
do $$
declare mid bigint; m matches; before int; after int;
begin
  delete from ranked_queue;
  perform join_ranked_queue('Кира','4321',0);
  perform join_ranked_queue('Лев','1234',0);
  select id into mid from matches where status = 'active' and ranked and bot_seat is null
    and (p0, p1) in (('Кира','Лев'), ('Лев','Кира')) order by id desc limit 1;
  select * into m from matches where id = mid;
  if mid is null or not m.lobby or not m.ladder then raise exception 'ОШИБКА: партия из очереди без ожидания'; end if;
  if not (match_state('Кира','4321',mid)->>'ladder')::boolean then raise exception 'ОШИБКА: партия из очереди без звёзд'; end if;
  select coalesce(max(elo), 1000) into before from elo_ratings where username = 'Кира' and mode = 0;
  perform leave_match('Кира','4321',mid);
  select * into m from matches where id = mid;
  select coalesce(max(elo), 1000) into after from elo_ratings where username = 'Кира' and mode = 0;
  if m.status <> 'expired' or m.elo_applied or before <> after then
    raise exception 'ОШИБКА: уход до старта засчитан: % % % → %', m.status, m.elo_applied, before, after;
  end if;
  if exists (select 1 from matches where id = mid and star_delta <> array[0, 0]) then
    raise exception 'ОШИБКА: звёзды за несостоявшуюся партию';
  end if;
end $$;
\echo ok

\echo === 7. с ботом ждать некого: ход сразу, «Готов» одного начинает раунд
do $$
declare mid bigint; m matches; r boolean;
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, starter, wins_needed)
  values ('Лев', '@bot:owl', true, 0, 'active', 1, 100, 1, 0.5, 0, 3) returning matches.id into mid;
  perform start_match_round(mid);
  select * into m from matches where id = mid;
  if m.lobby or m.turn_deadline is null then raise exception 'ОШИБКА: с ботом ждём'; end if;
  perform match_guess('Лев','1234',mid,m.secret);
  r := next_match_round('Лев','1234',mid);
  select * into m from matches where id = mid;
  if not r or m.round <> 2 or m.round_over then raise exception 'ОШИБКА: с ботом раунд не начался'; end if;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 8. служебное снаружи не вызвать
set local role anon;
do $$
begin
  if has_function_privilege('anon', 'match_flow_tick(bigint,int)', 'execute')
     or has_function_privilege('anon', 'match_start_next(bigint)', 'execute')
     or has_function_privilege('anon', 'matches_flow()', 'execute') then
    raise exception 'ОШИБКА: anon зовёт служебные функции';
  end if;
  if not has_function_privilege('anon', 'next_match_round(text,text,bigint)', 'execute')
     or not has_function_privilege('anon', 'leave_match(text,text,bigint)', 'execute') then
    raise exception 'ОШИБКА: anon не может нажать «Готов» или уйти';
  end if;
end $$;
reset role;
\echo ok

rollback;
