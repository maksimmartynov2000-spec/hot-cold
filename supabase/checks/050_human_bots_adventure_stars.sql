-- Проверка миграции 050_human_bots_adventure_stars.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'соперники-«люди» созданы (не меньше 30)',
      to_regclass('public.bot_people') is not null
      and (select count(*) from bot_people b join students s on s.username = b.username and s.is_bot) >= 30),
  (2, 'войти под ними нельзя, в друзья не позвать',
      not exists (select 1 from bot_people b join students s on s.username = b.username and not s.is_bot)
      and exists (select 1 from fn where name = 'friendships_no_bots' and src like '%is_bot%')),
  (3, 'поиск соперника 5–25 секунд, без «через 15 с — бот»',
      exists (select 1 from fn where name = 'ranked_pair' and src like '%bot_people%' and src like '% % 21%')
      and exists (select 1 from fn where name = 'ranked_status' and src like '%''botWait'', null%')),
  (4, 'бот заходит в партию и жмёт «Готов» не сразу',
      exists (select 1 from fn where name = 'match_flow_tick' and src like '%match_side_here%')
      and exists (select 1 from fn where name = 'next_match_round' and src like '%match_side_ready%')),
  (5, 'бот думает по-разному, ошибается, пишет фразы',
      exists (select 1 from fn where name = 'bot_act' and src like '%h.speed%' and src like '%h.quirk%'
                                 and src like '%h.chatty%')),
  (6, 'реванш: бот принимает и сам предлагает',
      exists (select 1 from fn where name = 'bot_after_match')
      and exists (select 1 from fn where name = 'match_state' and src like '%''rematch'', rem%')),
  (7, 'игра не видит, что соперник — бот',
      exists (select 1 from fn where name = 'match_state' and src like '%case when match_legacy_bot(m) then m.bot_seat end%')),
  (8, 'у ботов нет заданий и достижений',
      exists (select 1 from fn where name = 'achievements_sync' and src like '%s.is_bot%')
      and exists (select 1 from fn where name = 'quest_event' and src like '%is_bot%')),
  (9, 'звёзды Приключения хранятся в базе',
      exists (select 1 from information_schema.columns where table_name = 'students' and column_name = 'adventure_stars')
      and exists (select 1 from fn where name = 'adventure_sync')
      and exists (select 1 from fn where name = 'adventure_result')
      and exists (select 1 from fn where name = 'friend_adventure')),
  (10, 'достижений 58: + звёзды и миры Приключения',
      coalesce(array_length(achievement_codes(), 1), 0) = 58 and achievement_codes() @> array['adv_stars_150', 'adv_worlds_5']),
  (11, 'задания дня про Приключение',
      exists (select 1 from quest_pool() q where q.code = 'adv_win2')
      and exists (select 1 from quest_pool() q where q.code = 'adv_stars3')),
  (12, 'профиль знает звёзды Приключения',
      exists (select 1 from fn where name = 'my_progress' and src like '%advStars%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
