\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Сюда пишем имя, которое должно исчезнуть из базы целиком после переименования.
-- Поиск идёт по всем текстовым столбцам всех таблиц, а не по списку: таблица,
-- которую добавят позже и забудут научить переименованию, тоже попадётся
create or replace function pg_temp.name_left_behind(p_old text)
returns text language plpgsql as $$
declare c record; n int; found text := '';
begin
  for c in select table_name, column_name, data_type from information_schema.columns
           where table_schema = 'public' and data_type in ('text', 'ARRAY', 'jsonb')
             and table_name in (select table_name from information_schema.tables
                                where table_schema = 'public' and table_type = 'BASE TABLE') loop
    if c.data_type = 'text' then
      execute format('select count(*) from %I where %I = $1', c.table_name, c.column_name) into n using p_old;
    else
      execute format('select count(*) from %I where %I::text like $1', c.table_name, c.column_name)
        into n using '%' || p_old || '%';
    end if;
    if n > 0 then found := found || c.table_name || '.' || c.column_name || '×' || n || ' '; end if;
  end loop;
  return found;
end $$;

\echo === подготовка: Ян и Ася дружат, переписываются, играли друг с другом
do $$
declare mid bigint;
begin
  delete from friend_chat; delete from friend_chat_read; delete from friendships;
  delete from matches; delete from rivalry; delete from push_outbox;
  delete from students where username in ('Ян', 'Ася', 'Юля', 'Яна', 'Ян2', 'Ярослав');
  update students set created_at = now() - interval '2 hours';
  perform register_student('Ян', '1111', 'год рождения');
  perform register_student('Ася', '2222', null);
  perform send_friend_request('Ян', '1111', 'Ася');
  perform respond_friend_request('Ася', '2222', 'Ян', true);
  perform send_friend_phrase('Ян', '1111', 'Ася', 'play');
  perform send_friend_phrase('Ася', '2222', 'Ян', 'gg');
  perform friend_thread('Ася', '2222', 'Ян');   -- Ася прочитала переписку
  -- «Ян» по алфавиту после «Ася»: в парах по алфавиту он стоит вторым
  insert into rivalry(a, b, winner, streak) values ('Ася', 'Ян', 'Ян', 3);
  insert into runs(username, score, rounds) values ('Ян', 120, 4);
  insert into push_outbox(username, kind, who) values ('Ася', 'talk', 'Ян');
  insert into elo_ratings(username, mode, elo, games) values ('Ян', 0, 1100, 5)
    on conflict do nothing;
  insert into matches(p0, p1, range_min, range_max, secret, status, ranked)
  values ('Ян', 'Ася', 1, 100, 50, 'finished', false) returning id into mid;
end $$;
\echo ok

\echo === 1. иконка: из набора — ставится, чужое — нет, пустое — возвращает букву
do $$ begin
  if set_avatar('Ян', '1111', '🦊') is distinct from '🦊' then raise exception 'ОШИБКА: иконка не встала'; end if;
  if (select avatar from students where username = 'Ян') is distinct from '🦊' then
    raise exception 'ОШИБКА: иконка не сохранилась';
  end if;
  begin
    perform set_avatar('Ян', '1111', 'привет');
    raise exception 'ОШИБКА: вместо иконки встал произвольный текст';
  exception when sqlstate 'P0001' then
    if sqlerrm not like '%invalid_avatar%' then raise; end if;
  end;
  begin
    perform set_avatar('Ян', '1111', '💩');
    raise exception 'ОШИБКА: встала иконка не из набора';
  exception when sqlstate 'P0001' then
    if sqlerrm not like '%invalid_avatar%' then raise; end if;
  end;
  -- Мимо функции, прямо в таблицу — база всё равно не пустит
  begin
    update students set avatar = 'текст' where username = 'Ася';
    raise exception 'ОШИБКА: столбец принял иконку не из набора';
  exception when check_violation then null;
  end;
  perform set_avatar('Ася', '2222', '🐼');
end $$;
\echo ok

\echo === 2. без PIN иконку не поменять
do $$ begin
  begin
    perform set_avatar('Ян', '9999', '🐼');
    raise exception 'ОШИБКА: иконка сменилась без PIN';
  exception when sqlstate 'P0001' then
    if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Ян';
end $$;
\echo ok

\echo === 3. иконки других видны, но только по своему PIN
do $$
declare r record; got text := '';
begin
  for r in select * from avatars_for('Ян', '1111', array['Ася', 'Ян', 'Никто']) order by 1 loop
    got := got || r.username || '=' || r.avatar || ' ';
  end loop;
  if got is distinct from 'Ася=🐼 Ян=🦊 ' then raise exception 'ОШИБКА: иконки: %', got; end if;
  begin
    perform * from avatars_for('Ян', '0000', array['Ася']);
    raise exception 'ОШИБКА: иконки отдали без PIN';
  exception when sqlstate 'P0001' then
    if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Ян';
end $$;
\echo ok

\echo === 3б. за один запрос — не больше двухсот имён
do $$ begin
  begin
    perform * from avatars_for('Ян', '1111', array(select 'x' || g from generate_series(1, 201) g));
    raise exception 'ОШИБКА: запрос на 201 имя прошёл';
  exception when sqlstate 'P0001' then
    if sqlerrm not like '%too_many_names%' then raise; end if;
  end;
  perform * from avatars_for('Ян', '1111', array(select 'x' || g from generate_series(1, 200) g));
end $$;
\echo ok

\echo === 4. профиль: иконка, дата создания, сколько ждать до смены имени
do $$
declare p jsonb;
begin
  p := my_profile('Ян', '1111');
  if p->>'avatar' is distinct from '🦊' then raise exception 'ОШИБКА: иконка в профиле'; end if;
  if p->>'since' is null then raise exception 'ОШИБКА: нет даты создания'; end if;
  if (p->>'renameWaitHours')::int <> 0 then raise exception 'ОШИБКА: новичку не дают сменить имя'; end if;
end $$;
\echo ok

-- Сколько уведомлений лежало в очереди до переименования: после него их
-- должно стать ровно столько же — переписку перекладывают молча
create temp table outbox_before as select count(*) as n from push_outbox;

\echo === 5. переименование «Ян» → «Абвгд» переворачивает алфавит в парах с «Асей»
do $$
declare left_behind text; th jsonb; unread int;
begin
  -- «Ян» стоит после «Ася», «Абвгд» — перед ней: в таблицах, где пара хранится
  -- по алфавиту, строки должны перевернуться, иначе база откажет целиком
  if rename_student('Ян', '1111', 'Абвгд') is distinct from 'Абвгд' then
    raise exception 'ОШИБКА: имя не сменилось';
  end if;
  -- Ася прочитала обе фразы до переименования. Номера фраз сохранились —
  -- значит, и после него непрочитанных нет. Новые номера дали бы две
  select r.unread into unread from list_friends('Ася', '2222') r where r.username = 'Абвгд';
  if unread is distinct from 0 then
    raise exception 'ОШИБКА: после переименования прочитанное стало непрочитанным (%)', unread;
  end if;
  left_behind := pg_temp.name_left_behind('Ян');
  if left_behind <> '' then raise exception 'ОШИБКА: старое имя осталось в: %', left_behind; end if;

  if friend_status('Абвгд', 'Ася') is distinct from 'friend' then raise exception 'ОШИБКА: дружба потерялась'; end if;
  th := friend_thread('Ася', '2222', 'Абвгд');
  if jsonb_array_length(th->'messages') <> 2 then raise exception 'ОШИБКА: переписка потерялась'; end if;
  if (th->'messages'->0->>'code') is distinct from 'play' then raise exception 'ОШИБКА: порядок фраз'; end if;
  if (select count(*) from rivalry where a = 'Абвгд' and b = 'Ася' and winner = 'Абвгд' and streak = 3) <> 1 then
    raise exception 'ОШИБКА: лесенка против накрутки не переехала';
  end if;
  if (select count(*) from runs where username = 'Абвгд' and score = 120) <> 1 then
    raise exception 'ОШИБКА: результат испытания остался под старым именем';
  end if;
  if (select elo from elo_ratings where username = 'Абвгд' and mode = 0) is distinct from 1100 then
    raise exception 'ОШИБКА: рейтинг не переехал';
  end if;
  if exists (select 1 from push_outbox where username = 'Ася' and who is distinct from 'Абвгд') then
    raise exception 'ОШИБКА: уведомление подписано старым именем';
  end if;
end $$;
\echo ok

\echo === 6. переписка переехала молча: друг не получил уведомлений о старых фразах
do $$
declare before int := (select n from outbox_before);
begin
  if (select count(*) from push_outbox) <> before then
    raise exception 'ОШИБКА: при переименовании ушло % лишних уведомлений', (select count(*) from push_outbox) - before;
  end if;
  -- А новая фраза после переименования будит как обычно
  perform send_friend_phrase('Абвгд', '1111', 'Ася', 'hi');
  if (select count(*) from push_outbox) <> before + 1 then
    raise exception 'ОШИБКА: уведомления перестали работать';
  end if;
end $$;
\echo ok

\echo === 7. авторы фраз пережили переименование
do $$
declare th jsonb;
begin
  th := friend_thread('Ася', '2222', 'Абвгд');
  -- У Аси чужие — «play» и «hi» от Абвгд, своя — «gg»
  if (select string_agg(m->>'code', ',' order by ord) from jsonb_array_elements(th->'messages')
        with ordinality e(m, ord) where (m->>'mine')::boolean = false) is distinct from 'play,hi' then
    raise exception 'ОШИБКА: фразы потеряли авторов';
  end if;
end $$;
\echo ok

\echo === 8. второй раз за сутки имя не сменить — и сказано, сколько ждать
do $$ begin
  begin
    perform rename_student('Абвгд', '1111', 'Ярослав');
    raise exception 'ОШИБКА: имя сменилось дважды за сутки';
  exception when sqlstate 'P0001' then
    if sqlerrm not like 'rename_too_soon:24' then raise exception 'ОШИБКА: ответ %', sqlerrm; end if;
  end;
  if (my_profile('Абвгд', '1111')->>'renameWaitHours')::int <> 24 then
    raise exception 'ОШИБКА: профиль не говорит, сколько ждать';
  end if;
  update students set renamed_at = now() - interval '20 hours' where username = 'Абвгд';
  begin
    perform rename_student('Абвгд', '1111', 'Ярослав');
    raise exception 'ОШИБКА: запрет снялся раньше суток';
  exception when sqlstate 'P0001' then
    if sqlerrm not like 'rename_too_soon:4' then raise exception 'ОШИБКА: ответ %', sqlerrm; end if;
  end;
  update students set renamed_at = now() - interval '25 hours' where username = 'Абвгд';
  if rename_student('Абвгд', '1111', 'Ян') is distinct from 'Ян' then raise exception 'ОШИБКА: через сутки не пустило'; end if;
end $$;
\echo ok

\echo === 9. занятое имя не отдать; «#» — только за удалёнными; длина как при регистрации
do $$ begin
  update students set renamed_at = null where username = 'Ян';
  begin perform rename_student('Ян', '1111', 'аСЯ'); raise exception 'ОШИБКА: отдали чужое имя';
  exception when sqlstate 'P0001' then if sqlerrm not like '%name_taken%' then raise; end if; end;
  begin perform rename_student('Ян', '1111', '#12'); raise exception 'ОШИБКА: имя на #';
  exception when sqlstate 'P0001' then if sqlerrm not like '%invalid_username%' then raise; end if; end;
  begin perform rename_student('Ян', '1111', 'Я'); raise exception 'ОШИБКА: имя из одной буквы';
  exception when sqlstate 'P0001' then if sqlerrm not like '%invalid_username%' then raise; end if; end;
  begin perform rename_student('Ян', '1111', repeat('я', 21)); raise exception 'ОШИБКА: имя длиннее 20';
  exception when sqlstate 'P0001' then if sqlerrm not like '%invalid_username%' then raise; end if; end;
  begin perform rename_student('Ян', '0000', 'Ярик'); raise exception 'ОШИБКА: переименовали без PIN';
  exception when sqlstate 'P0001' then if sqlerrm not like '%auth_failed%' then raise; end if; end;
  update students set failed_logins = 0, locked_until = null where username = 'Ян';
  -- Смена одного регистра — то же имя
  if rename_student('Ян', '1111', 'ян') is distinct from 'ян' then raise exception 'ОШИБКА: регистр'; end if;
  update students set renamed_at = null where username = 'ян';
  perform rename_student('ян', '1111', 'Ян');
end $$;
\echo ok

\echo === 10. старое имя сразу свободно — и новый владелец не наследует ничего
do $$ begin
  update students set renamed_at = null where username = 'Ян';
  perform rename_student('Ян', '1111', 'Ян2');
  if not register_student('Ян', '1111', null) then raise exception 'ОШИБКА: старое имя не освободилось'; end if;
  if friend_status('Ян', 'Ася') is not null then raise exception 'ОШИБКА: новому «Яну» досталась чужая дружба'; end if;
  if (select count(*) from runs where username = 'Ян') <> 0 then raise exception 'ОШИБКА: достались чужие результаты'; end if;
  -- Устройство со старым входом узнает подмену по дате создания
  if (my_profile('Ян', '1111')->>'since') = (my_profile('Ян2', '1111')->>'since') then
    raise exception 'ОШИБКА: у двух разных аккаунтов одна дата — подмену не заметить';
  end if;
  delete from students where username = 'Ян';
end $$;
\echo ok

\echo === 11. смена PIN: по старому, старая подсказка стирается
do $$ begin
  begin perform change_pin('Ян2', '0000', '5555', null); raise exception 'ОШИБКА: PIN сменили без старого';
  exception when sqlstate 'P0001' then if sqlerrm not like '%auth_failed%' then raise; end if; end;
  update students set failed_logins = 0, locked_until = null where username = 'Ян2';
  begin perform change_pin('Ян2', '1111', '12a4', null); raise exception 'ОШИБКА: PIN не из цифр';
  exception when sqlstate 'P0001' then if sqlerrm not like '%invalid_pin%' then raise; end if; end;
  begin perform change_pin('Ян2', '1111', '123', null); raise exception 'ОШИБКА: PIN из трёх цифр';
  exception when sqlstate 'P0001' then if sqlerrm not like '%invalid_pin%' then raise; end if; end;

  perform change_pin('Ян2', '1111', '5555', null);
  if check_student_pin('Ян2', '5555') is distinct from 'Ян2' then raise exception 'ОШИБКА: новый PIN не пускает'; end if;
  if check_student_pin('Ян2', '1111') is not null then raise exception 'ОШИБКА: старый PIN всё ещё пускает'; end if;
  if (select pin_hint from students where username = 'Ян2') is not null then
    raise exception 'ОШИБКА: старая подсказка осталась и подсказывает неверный PIN';
  end if;
  if (select pin_hash from students where username = 'Ян2') like '%5555%' then
    raise exception 'ОШИБКА: PIN лежит открытым текстом';
  end if;
  perform change_pin('Ян2', '5555', '6666', 'любимое число');
  if (select pin_hint from students where username = 'Ян2') is distinct from 'любимое число' then
    raise exception 'ОШИБКА: новая подсказка не записалась';
  end if;
  update students set failed_logins = 0, locked_until = null where username = 'Ян2';
end $$;
\echo ok

\echo === 12. регистрация: имя на «#» больше не проходит и в версии с подсказкой
do $$ begin
  begin perform register_student('#99', '1234', 'подсказка'); raise exception 'ОШИБКА: зарегистрировали #99';
  exception when sqlstate 'P0001' then if sqlerrm not like '%invalid_username%' then raise; end if; end;
end $$;
\echo ok

\echo === 13. удаление аккаунта после переименования работает
do $$ begin
  perform delete_account('Ян2', '6666');
  if exists (select 1 from students where username = 'Ян2') then raise exception 'ОШИБКА: аккаунт не удалился'; end if;
end $$;
\echo ok

\echo === 14. набор иконок в браузере и в базе один и тот же
create temp table js_avatars(avatar text);
\copy js_avatars from '/home/user/hot-cold/db/avatars_js.csv' with (format csv, header true)
do $$
declare js text[]; db text[];
begin
  select array_agg(avatar order by avatar) into js from js_avatars;
  select array_agg(a order by a) into db from unnest(avatar_choices()) a;
  if js is distinct from db then raise exception 'ОШИБКА: наборы разошлись: браузер %, база %', js, db; end if;
  if array_length(db, 1) <> 24 then raise exception 'ОШИБКА: в наборе % иконок, а не 24', array_length(db, 1); end if;
end $$;
\echo ok

\echo === уборка
do $$ begin
  delete from friend_chat; delete from friend_chat_read; delete from friendships;
  delete from matches; delete from rivalry; delete from push_outbox;
  delete from runs where username in ('Ян', 'Ян2', 'Абвгд');
  delete from students where username in ('Ян', 'Ася', 'Юля', 'Яна', 'Ян2', 'Ярослав', 'Абвгд', 'ян');
  delete from students where username like '#%';
end $$;
\echo ok
