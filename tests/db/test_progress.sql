\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: задания, счётчики, достижения откатываются в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null, tz = null, tz_set_at = null,
                      tutorial_done = false, avatar = null;
  delete from daily_quests; delete from player_stats; delete from achievements;
  delete from friendships; delete from ladder; delete from season_badges;
  delete from season_notices; delete from push_outbox; delete from push_subscriptions;
  delete from run_sessions; delete from ranked_queue;
  update matches set status = 'expired' where status in ('invited', 'active');
end $$;
-- Задания на сегодня — те, что нужны сценарию, а не выпавшие по жребию
create function pg_temp.set_quests(p_user text, p_codes text[]) returns void language plpgsql as $$
declare d date := player_day(p_user); c text; i int := 0;
begin
  delete from daily_quests where username = p_user and day = d;
  foreach c in array p_codes loop
    i := i + 1;
    insert into daily_quests(username, day, slot, code, goal)
    select p_user, d, i, q.code, q.goal from quest_pool() q where q.code = c;
  end loop;
end $$;
create function pg_temp.progress(p_user text, p_code text) returns int language sql as $$
  select progress from daily_quests where username = p_user and day = player_day(p_user) and code = p_code;
$$;
-- Партия, законченная так, как её заканчивает игра
-- Партия из очереди (a_ladder) создаётся сразу идущей — так её и помечает база
create function pg_temp.play(a0 text, a1 text, a_winner int, a_ladder boolean, a_bot int) returns bigint language plpgsql as $$
declare mid bigint;
begin
  insert into matches(p0, p1, wins_needed, status, ranked, bot_seat)
  values (a0, a1, 1, 'active', a_ladder, a_bot) returning id into mid;
  update matches set wins[a_winner + 1] = 1, round_winner = a_winner, round_over = true, match_over = true,
                     status = 'finished' where id = mid;
  return mid;
end $$;
\echo ok

\echo === 1. три задания на день: по одному с каждого места, одни и те же весь день
do $$
declare p1 jsonb; p2 jsonb; codes text[];
begin
  p1 := my_progress('Лев', '1234', null);
  p2 := my_progress('Лев', '1234', null);
  if jsonb_array_length(p1->'quests') <> 3 then raise exception 'ОШИБКА: заданий %', p1->'quests'; end if;
  if p1->'quests' <> p2->'quests' then raise exception 'ОШИБКА: задания сменились за день'; end if;
  select array_agg(q->>'code') into codes from jsonb_array_elements(p1->'quests') q;
  if not (codes[1] in ('play2','play3','ladder2') and codes[2] = 'win1'
          and codes[3] in ('run1','run_rounds5','run_best3')) then
    raise exception 'ОШИБКА: набор %', codes;
  end if;
  if (p1->>'streak')::int <> 0 or (p1->>'doneToday')::boolean then raise exception 'ОШИБКА: серия у новичка'; end if;
  begin
    perform my_progress('Лев', '0000', null);
    raise exception 'ОШИБКА: без PIN';
  exception when others then if sqlerrm <> 'auth_failed' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Лев';
end $$;
\echo ok

\echo === 2. день — по часам игрока; пояс меняется не чаще раза в сутки, мусор не принимается
do $$ begin
  perform my_progress('Лев', '1234', 'Pacific/Kiritimati');
  if (select tz from students where username = 'Лев') <> 'Pacific/Kiritimati' then raise exception 'ОШИБКА: пояс не запомнен'; end if;
  if player_day('Лев') <> (now() at time zone 'Pacific/Kiritimati')::date then raise exception 'ОШИБКА: день не по поясу'; end if;
  perform my_progress('Лев', '1234', 'Pacific/Pago_Pago');
  if (select tz from students where username = 'Лев') <> 'Pacific/Kiritimati' then raise exception 'ОШИБКА: пояс сменился дважды за сутки'; end if;
  perform my_progress('Кира', '4321', 'Mars/Olympus');
  if (select tz from students where username = 'Кира') is not null then raise exception 'ОШИБКА: принят выдуманный пояс'; end if;
  update students set tz_set_at = now() - interval '1 day' where username = 'Лев';
  perform my_progress('Лев', '1234', 'Asia/Makassar');
  if (select tz from students where username = 'Лев') <> 'Asia/Makassar' then raise exception 'ОШИБКА: через сутки пояс не сменился'; end if;
end $$;
\echo ok

\echo === 3. партия с другом: «сыграть» — обоим, победа на звёзды — нет; без исхода — ничего
do $$ begin
  perform pg_temp.set_quests('Лев', array['play2','win1','run1']);
  perform pg_temp.set_quests('Кира', array['play2','win1','run1']);
  perform pg_temp.play('Лев', 'Кира', 0, false, null);
  if pg_temp.progress('Лев','play2') <> 1 or pg_temp.progress('Кира','play2') <> 1 then raise exception 'ОШИБКА: «сыграть» не засчитано'; end if;
  if pg_temp.progress('Лев','win1') <> 0 then raise exception 'ОШИБКА: победа над другом засчитана'; end if;
  if (select online_wins from player_stats where username = 'Лев') <> 1
     or (select online_games from player_stats where username = 'Кира') <> 1 then raise exception 'ОШИБКА: счётчики'; end if;
  -- Ушёл из партии с другом — партия без исхода, никому ничего
  insert into matches(p0, p1, status) values ('Лев', 'Кира', 'active');
  update matches set status = 'finished', match_over = true where p0 = 'Лев' and status = 'active';
  if pg_temp.progress('Лев','play2') <> 1 then raise exception 'ОШИБКА: засчитана партия без исхода'; end if;
end $$;
\echo ok

\echo === 4. партия на звёзды с ботом: всё — человеку, боту — ничего; прогресс не выше цели
do $$ begin
  perform pg_temp.set_quests('Лев', array['ladder2','win1','run1']);
  perform pg_temp.play('Лев', '@bot:owl', 0, true, 1);
  perform pg_temp.play('Лев', '@bot:owl', 0, true, 1);
  perform pg_temp.play('Лев', '@bot:owl', 1, true, 1);
  if pg_temp.progress('Лев','ladder2') <> 2 then raise exception 'ОШИБКА: на звёзды %', pg_temp.progress('Лев','ladder2'); end if;
  if pg_temp.progress('Лев','win1') <> 1 then raise exception 'ОШИБКА: победа %', pg_temp.progress('Лев','win1'); end if;
  if exists (select 1 from player_stats where username like '@bot:%') or exists (select 1 from daily_quests where username like '@bot:%') then
    raise exception 'ОШИБКА: боту засчитано';
  end if;
end $$;
\echo ok

\echo === 5. Испытание: засчитывает база по окончании; сдался сразу — не «пройдено»
do $$ begin
  perform pg_temp.set_quests('Кира', array['play2','win1','run1']);
  insert into run_sessions(username, round, range_min, range_max, allowed, secret) values ('Кира', 1, 1, 10, 3, 5);
  update run_sessions set status = 'finished' where username = 'Кира';
  if pg_temp.progress('Кира','run1') <> 0 then raise exception 'ОШИБКА: 0 раундов засчитано'; end if;
  update run_sessions set status = 'active', round = 7 where username = 'Кира';
  update run_sessions set status = 'finished' where username = 'Кира';
  if pg_temp.progress('Кира','run1') <> 1 then raise exception 'ОШИБКА: Испытание не засчитано'; end if;
  if (select run_best from player_stats where username = 'Кира') <> 6 then raise exception 'ОШИБКА: лучшее Испытание'; end if;
  if not exists (select 1 from achievements where username = 'Кира' and code = 'run_5') then raise exception 'ОШИБКА: нет «5 раундов»'; end if;
  if exists (select 1 from achievements where username = 'Кира' and code = 'run_10') then raise exception 'ОШИБКА: «10 раундов» за 6'; end if;
  -- Раунды за день складываются, лучшая попытка — берётся наибольшая
  perform pg_temp.set_quests('Кира', array['play2','run_rounds5']);
  perform pg_temp.set_quests('Максим', array['run_best3']);
  update run_sessions set status = 'active', round = 3 where username = 'Кира';
  update run_sessions set status = 'finished' where username = 'Кира';
  update run_sessions set status = 'active', round = 4 where username = 'Кира';
  update run_sessions set status = 'finished' where username = 'Кира';
  if pg_temp.progress('Кира','run_rounds5') <> 5 then raise exception 'ОШИБКА: раунды за день %', pg_temp.progress('Кира','run_rounds5'); end if;
  insert into run_sessions(username, round, range_min, range_max, allowed, secret) values ('Максим', 5, 1, 10, 3, 5);
  update run_sessions set status = 'finished' where username = 'Максим';
  update run_sessions set status = 'active', round = 2 where username = 'Максим';
  update run_sessions set status = 'finished' where username = 'Максим';
  if pg_temp.progress('Максим','run_best3') <> 3 then raise exception 'ОШИБКА: лучшая попытка %', pg_temp.progress('Максим','run_best3'); end if;
end $$;
\echo ok

\echo === 6. всё за день — +1 к серии; вчера было — серия растёт; пропуск — заново
do $$
declare p jsonb;
begin
  perform pg_temp.set_quests('Лев', array['play2','win1']);
  update player_stats set quest_streak = 2, quest_best = 2, quest_last = player_day('Лев') - 1 where username = 'Лев';
  perform pg_temp.play('Лев', '@bot:owl', 0, true, 1);
  if (select quest_streak from player_stats where username = 'Лев') <> 2 then raise exception 'ОШИБКА: серия до конца заданий'; end if;
  perform pg_temp.play('Лев', '@bot:owl', 1, true, 1);
  p := my_progress('Лев', '1234', null);
  if (p->>'streak')::int <> 3 or (p->>'bestStreak')::int <> 3 or not (p->>'doneToday')::boolean then
    raise exception 'ОШИБКА: серия %', p;
  end if;
  -- Ещё партия в тот же день — серия не растёт
  perform pg_temp.play('Лев', '@bot:owl', 0, true, 1);
  if (select quest_streak from player_stats where username = 'Лев') <> 3 then raise exception 'ОШИБКА: день посчитан дважды'; end if;
  -- Пропустил два дня — серия видна как 0, новая начинается с 1, лучшая остаётся
  update player_stats set quest_last = player_day('Лев') - 3 where username = 'Лев';
  if (my_progress('Лев', '1234', null)->>'streak')::int <> 0 then raise exception 'ОШИБКА: серия жива после пропуска'; end if;
  perform pg_temp.set_quests('Лев', array['win1']);
  perform pg_temp.play('Лев', '@bot:owl', 0, true, 1);
  if (select quest_streak from player_stats where username = 'Лев') <> 1
     or (select quest_best from player_stats where username = 'Лев') <> 3 then raise exception 'ОШИБКА: после пропуска'; end if;
end $$;
\echo ok

\echo === 7. иконки за серию: 3 дня — 🔥 можно, 🚀 — нет
do $$ begin
  if set_avatar('Лев', '1234', '🔥') <> '🔥' then raise exception 'ОШИБКА: 🔥 не поставилась'; end if;
  begin
    perform set_avatar('Лев', '1234', '🚀');
    raise exception 'ОШИБКА: 🚀 без 7 дней';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  begin
    perform set_avatar('Кира', '4321', '🔥');
    raise exception 'ОШИБКА: 🔥 без серии';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
end $$;
\echo ok

\echo === 8. достижения: победа, лига, серия побед, друзья, обучение, серия заданий
do $$
declare a jsonb;
begin
  if not exists (select 1 from achievements where username = 'Лев' and code = 'first_win') then raise exception 'ОШИБКА: нет первой победы'; end if;
  if exists (select 1 from achievements where username = 'Кира' and code = 'first_win') then raise exception 'ОШИБКА: победа у проигравшей'; end if;
  perform ladder_touch('Кира');
  update ladder set peak = 2 where username = 'Кира';
  if not exists (select 1 from achievements where username = 'Кира' and code = 'league_gold') then raise exception 'ОШИБКА: нет Золота'; end if;
  if exists (select 1 from achievements where username = 'Кира' and code = 'league_diamond') then raise exception 'ОШИБКА: Алмаз за Золото'; end if;
  update ladder set streak = 3 where username = 'Кира';
  if not exists (select 1 from achievements where username = 'Кира' and code = 'streak_3') then raise exception 'ОШИБКА: нет серии побед'; end if;
  insert into students(username, pin_hash) values ('Ника', 'x');
  insert into friendships(requester, addressee, status) values ('Кира', 'Лев', 'accepted'), ('Кира', 'Максим', 'accepted'),
         ('Кира', 'Ника', 'accepted');
  if not exists (select 1 from achievements where username = 'Кира' and code = 'friends_3') then raise exception 'ОШИБКА: нет «3 друга»'; end if;
  if exists (select 1 from achievements where username = 'Лев' and code = 'friends_3') then raise exception 'ОШИБКА: «3 друга» у Льва с одним'; end if;
  update students set tutorial_done = true where username = 'Максим';
  if not exists (select 1 from achievements where username = 'Максим' and code = 'tutorial') then raise exception 'ОШИБКА: нет обучения'; end if;
  update player_stats set quest_best = 7 where username = 'Максим';
  a := my_progress('Максим', '1111', null)->'achievements';
  if not a @> '[{"code":"quests_7"}]' then raise exception 'ОШИБКА: нет «7 дней заданий»: %', a; end if;
  -- Коды — только из списка
  if exists (select 1 from achievements where not (code = any (achievement_codes()))) then raise exception 'ОШИБКА: код не из списка'; end if;
end $$;
\echo ok

\echo === 9. достижения друга — только другу
do $$
declare a jsonb;
begin
  a := friend_achievements('Лев', '1234', 'Кира');
  if not a @> '[{"code":"league_gold"}]' then raise exception 'ОШИБКА: другу не видно: %', a; end if;
  delete from friendships where requester = 'Кира' and addressee = 'Лев';
  begin
    perform friend_achievements('Лев', '1234', 'Кира');
    raise exception 'ОШИБКА: видно не другу';
  exception when others then if sqlerrm <> 'not_friends' then raise; end if;
  end;
end $$;
\echo ok

\echo === 10. итоги сезона: один раз после смены сезона; победы за сезон считаются
do $$
declare s jsonb;
begin
  delete from ladder where username = 'Максим';
  perform ladder_touch('Максим');
  perform ladder_after('Максим', true);
  perform ladder_after('Максим', false);
  if (select wins from ladder where username = 'Максим') <> 1 then raise exception 'ОШИБКА: победы за сезон'; end if;
  if ladder_status('Максим', '1111')->'summary' <> 'null'::jsonb then raise exception 'ОШИБКА: итоги посреди сезона'; end if;
  update ladder set season = '2000-01', best = 40, games = 12, wins = 7, stars = 40 where username = 'Максим';
  s := ladder_status('Максим', '1111')->'summary';
  if s->>'season' <> '2000-01' or (s->>'league')::int <> 1 or (s->>'games')::int <> 12
     or (s->>'wins')::int <> 7 or (s->>'best')::int <> 40 then raise exception 'ОШИБКА: итоги %', s; end if;
  if (select wins from ladder where username = 'Максим') <> 0 then raise exception 'ОШИБКА: победы не обнулились с сезоном'; end if;
  if ladder_status('Максим', '1111')->'summary' is null then raise exception 'ОШИБКА: итоги пропали до просмотра'; end if;
  perform season_summary_seen('Максим', '1111', '2000-01');
  if ladder_status('Максим', '1111')->'summary' <> 'null'::jsonb then raise exception 'ОШИБКА: итоги показаны дважды'; end if;
end $$;
\echo ok

\echo === 11. за 2 дня до конца сезона — уведомление играющим, один раз
do $$
declare ends timestamptz; cur text;
begin
  delete from push_outbox; delete from season_notices;
  cur := ladder_season();
  ends := (date_trunc('month', now() at time zone 'UTC') + interval '1 month') at time zone 'UTC';
  insert into push_subscriptions(endpoint, username, p256dh, auth) values ('e1', 'Лев', 'k', 'a'), ('e2', 'Кира', 'k', 'a');
  perform ladder_touch('Лев');
  update ladder set season = cur, games = 3 where username = 'Лев';
  update ladder set season = cur, games = 0 where username = 'Кира';
  perform season_end_check(ends - interval '3 days');
  if exists (select 1 from push_outbox) then raise exception 'ОШИБКА: уведомление за 3 дня'; end if;
  perform season_end_check(ends - interval '1 day');
  if (select array_agg(username) from push_outbox where kind = 'season_end') is distinct from array['Лев'] then
    raise exception 'ОШИБКА: кому %', (select array_agg(username) from push_outbox);
  end if;
  perform season_end_check(ends - interval '1 hour');
  if (select count(*) from push_outbox) <> 1 then raise exception 'ОШИБКА: уведомление дважды'; end if;
end $$;
\echo ok

rollback;
