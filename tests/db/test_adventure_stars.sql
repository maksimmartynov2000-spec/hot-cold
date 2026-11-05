\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Звёзды Приключения в базе (миграции 050 и 059): лучший результат, слияние
-- с телефоном, задания дня, звёзды друга. Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null;
end $$;
\echo ok

\echo === 1. звёзды Приключения: лучший результат, слияние с телефоном
do $$
declare r jsonb;
begin
  update students set adventure = 0, adventure_stars = '' where username = 'Лев';
  begin
    perform adventure_result('Лев', '1234', 3, 2);
    raise exception 'ОШИБКА: звёзды за закрытого соперника';
  exception when others then if sqlerrm not like '%not_open%' then raise; end if;
  end;
  r := adventure_result('Лев', '1234', 0, 1);
  if r->>'stars' <> '1' or (r->>'done')::int <> 1 or (r->>'new')::int <> 1 then raise exception 'ОШИБКА: %', r; end if;
  r := adventure_result('Лев', '1234', 0, 3);
  if r->>'stars' <> '3' or (r->>'new')::int <> 2 then raise exception 'ОШИБКА: улучшение %', r; end if;
  r := adventure_result('Лев', '1234', 0, 1);
  if r->>'stars' <> '3' or (r->>'new')::int <> 0 then raise exception 'ОШИБКА: хуже лучшего: %', r; end if;
  r := adventure_sync('Лев', '1234', 12, '012222222223');
  if r->>'stars' <> '312222222223' or (r->>'done')::int <> 12 or (r->>'total')::int <> 25 then
    raise exception 'ОШИБКА: слияние %', r;
  end if;
  begin
    perform adventure_sync('Лев', '1234', 1, '9');
    raise exception 'ОШИБКА: звёзды 9';
  exception when others then if sqlerrm not like '%bad_stars%' then raise; end if;
  end;
  if not exists (select 1 from achievements where username = 'Лев' and code = 'adv_worlds_1') then
    raise exception 'ОШИБКА: мир пройден, а достижения нет';
  end if;
  if not exists (select 1 from achievements where username = 'Лев' and code = 'adv_stars_10') then
    raise exception 'ОШИБКА: 25 звёзд, а достижения нет';
  end if;
  r := my_progress('Лев', '1234', null);
  if (r->'stats'->>'advStars')::int <> 25 or (r->'stats'->>'advWorlds')::int <> 1 then
    raise exception 'ОШИБКА: счётчики %', r->'stats';
  end if;
end $$;
\echo ok

\echo === 2. задания дня про Приключение
do $$
declare d date; p int;
begin
  d := quest_ensure('Лев');
  delete from daily_quests where username = 'Лев' and day = d;
  insert into daily_quests(username, day, slot, code, goal) values
    ('Лев', d, 1, 'adv_win2', 2), ('Лев', d, 2, 'win1', 1), ('Лев', d, 3, 'adv_stars3', 3);
  perform adventure_result('Лев', '1234', 1, 2);
  perform adventure_result('Лев', '1234', 1, 3);
  select progress into p from daily_quests where username = 'Лев' and day = d and code = 'adv_win2';
  if p <> 2 then raise exception 'ОШИБКА: побед %', p; end if;
  -- Было 1, стало 2, потом 3: новых звёзд две
  select progress into p from daily_quests where username = 'Лев' and day = d and code = 'adv_stars3';
  if p <> 2 then raise exception 'ОШИБКА: новых звёзд %', p; end if;
end $$;
\echo ok

\echo === 3. звёзды друга — только другу
do $$
declare r jsonb;
begin
  if friend_status('Лев', 'Кира') is distinct from 'friend' then
    perform send_friend_request('Лев', '1234', 'Кира');
    if friend_status('Лев', 'Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира', '4321', 'Лев', true);
    end if;
  end if;
  r := friend_adventure('Кира', '4321', 'Лев');
  if (r->>'total')::int <> 27 then raise exception 'ОШИБКА: у друга %', r; end if;
  delete from friendships where (requester = 'Максим' and addressee = 'Лев') or (requester = 'Лев' and addressee = 'Максим');
  begin
    perform friend_adventure('Максим', '1111', 'Лев');
    raise exception 'ОШИБКА: чужие звёзды';
  exception when others then if sqlerrm not like '%not_friends%' then raise; end if;
  end;
end $$;
\echo ok

\echo === 4. anon: Приключение — можно, служебное — нет
set local role anon;
do $$
declare f text;
begin
  foreach f in array array['match_side_here(matches,int)', 'match_side_ready(matches,int)', 'adventure_wallet(text)'] loop
    if has_function_privilege('anon', f, 'execute') then raise exception 'ОШИБКА: anon может %', f; end if;
  end loop;
  foreach f in array array['adventure_sync(text,text,int,text)', 'adventure_result(text,text,int,int)',
                           'friend_adventure(text,text,text)', 'match_state(text,text,bigint)'] loop
    if not has_function_privilege('anon', f, 'execute') then raise exception 'ОШИБКА: anon не может %', f; end if;
  end loop;
end $$;
reset role;
\echo ok

rollback;
