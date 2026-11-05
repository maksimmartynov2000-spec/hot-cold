-- Что осталось после 062 (см. upgrade_062_before.sql)
do $$
declare got text;
begin
  -- Награды лиг — в коллекции
  select string_agg(kind || ':' || code, ',' order by kind, code) into got from cosmetics where username = 'Ада' and source = 'league';
  if got is distinct from 'color:#14b8a6,color:#94a3b8,color:#eab308,frame:gold,frame:platinum,frame:silver,icon:🐉,icon:🐳,icon:🐺,icon:🦅,icon:🦚,icon:🦩' then
    raise exception 'ОШИБКА: награды Ады %', got;
  end if;
  select string_agg(kind || ':' || code, ',' order by kind, code) into got from cosmetics where username = 'Боря' and source = 'league';
  if got is distinct from 'color:#94a3b8,frame:silver,icon:🐺,icon:🦅' then raise exception 'ОШИБКА: награды Бори %', got; end if;
  if exists (select 1 from cosmetics where username in ('Вера', 'Гена')) then raise exception 'ОШИБКА: награды без лиги'; end if;
  -- Рамка «по лиге» стала своей, выбранная — не тронута, бронза — по умолчанию
  if (select frame from students where username = 'Ада') is distinct from 'gold'
     or (select frame from students where username = 'Боря') is distinct from 'fire'
     or (select frame from students where username = 'Гена') is not null then
    raise exception 'ОШИБКА: рамки % / % / %', (select frame from students where username = 'Ада'),
      (select frame from students where username = 'Боря'), (select frame from students where username = 'Гена');
  end if;
  -- Рейтинговые партии и партии с ботами удалены, с другом — на месте
  if exists (select 1 from matches where ranked or bot_seat is not null) then raise exception 'ОШИБКА: рейтинговые партии остались'; end if;
  if not exists (select 1 from matches where p0 = 'Ада' and p1 = 'Вера') then raise exception 'ОШИБКА: партия с другом пропала'; end if;
  if exists (select 1 from students where is_bot) then raise exception 'ОШИБКА: боты остались'; end if;
  -- Задания на рейтинг и режим дня заменены равными
  if (select string_agg(code || '/' || goal || '/' || progress, ',' order by username, slot) from daily_quests
      where username in ('Ада', 'Боря') and day = current_date) is distinct from 'play2/2/1,win1/1/0,play2/2/2' then
    raise exception 'ОШИБКА: задания %', (select string_agg(code, ',') from daily_quests where username in ('Ада', 'Боря'));
  end if;
  -- Уведомления турнира и сезона рейтинга — убраны, о вызове друга — на месте
  if exists (select 1 from push_outbox where kind in ('cup_start', 'cup_left', 'season_end')) then raise exception 'ОШИБКА: старые уведомления'; end if;
  if not exists (select 1 from push_outbox where kind = 'challenge') then raise exception 'ОШИБКА: уведомление о вызове пропало'; end if;
  if to_regclass('public.ladder') is not null or to_regclass('public.weekend_cup') is not null then raise exception 'ОШИБКА: таблицы остались'; end if;
end $$;
\echo переход на 062: ok
