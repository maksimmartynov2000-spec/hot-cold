\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка: Лев и Кира друзья, Максим сам по себе
do $$ begin
  delete from friend_chat; delete from friend_chat_read; delete from push_outbox;
  update students set created_at = now() - interval '2 hours';
  if friend_status('Лев','Кира') is distinct from 'friend' then
    perform send_friend_request('Лев','1234','Кира');
    if friend_status('Лев','Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира','4321','Лев',true);
    end if;
  end if;
  if friend_status('Лев','Максим') = 'friend' then
    perform remove_friend('Лев','1234','Максим');
  end if;
end $$;
\echo ok

\echo === 1. текст доходит до друга, свой помечен своим
do $$
declare th jsonb; m jsonb;
begin
  perform send_friend_text('Лев','1234','Кира','Привет! Сыграем после школы?');
  th := friend_thread('Кира','4321','Лев');
  m := th->'messages'->-1;
  if m->>'text' is distinct from 'Привет! Сыграем после школы?' then
    raise exception 'ОШИБКА: текст дошёл как «%»', m->>'text';
  end if;
  if m->>'code' is not null then raise exception 'ОШИБКА: у текста есть код фразы'; end if;
  if (m->>'mine')::boolean then raise exception 'ОШИБКА: чужой текст помечен своим'; end if;
  if (friend_thread('Лев','1234','Кира')->'messages'->-1->>'mine')::boolean is distinct from true then
    raise exception 'ОШИБКА: свой текст помечен чужим';
  end if;
end $$;
\echo ok

\echo === 2. фраза и текст в одной ленте, фраза без текста
do $$
declare th jsonb;
begin
  perform send_friend_phrase('Кира','4321','Лев','later');
  th := friend_thread('Лев','1234','Кира');
  if th->'messages'->-1->>'code' is distinct from 'later' or th->'messages'->-1->>'text' is not null then
    raise exception 'ОШИБКА: фраза в ленте испорчена: %', th->'messages'->-1;
  end if;
end $$;
\echo ok

\echo === 3. грубые слова заменяются на *** в базе, обычные не трогаются
do $$
declare b text;
begin
  perform send_friend_text('Лев','1234','Кира','ну ты и СУКА');
  select body into b from friend_chat order by id desc limit 1;
  if b is distinct from 'ну ты и ***' then raise exception 'ОШИБКА: записано «%»', b; end if;
  if chat_clean('Победа! Похудеть, хлеб, застрахуем, computer, marsch') is distinct from
     'Победа! Похудеть, хлеб, застрахуем, computer, marsch' then
    raise exception 'ОШИБКА: фильтр задел обычные слова: %', chat_clean('Победа! Похудеть, хлеб, застрахуем, computer, marsch');
  end if;
  if chat_clean('what the fuck, merde, Scheiße, ёбаный, пиздец') ~ '(fuck|merde|schei|еба|пизд)' then
    raise exception 'ОШИБКА: фильтр пропустил: %', chat_clean('what the fuck, merde, Scheiße, ёбаный, пиздец');
  end if;
  if chat_clean('Нормальное Сообщение') is distinct from 'Нормальное Сообщение' then
    raise exception 'ОШИБКА: у чистого сообщения пропали заглавные';
  end if;
end $$;
\echo ok

\echo === 4. пустое, длинное, переносы строк
do $$
declare b text;
begin
  begin
    perform send_friend_text('Лев','1234','Кира', E'   \n\t ');
    raise exception 'ОШИБКА: пустое сообщение прошло';
  exception when others then
    if sqlerrm not like '%empty_text%' then raise; end if;
  end;
  begin
    perform send_friend_text('Лев','1234','Кира', repeat('а', 201));
    raise exception 'ОШИБКА: 201 символ прошёл';
  exception when others then
    if sqlerrm not like '%too_long%' then raise; end if;
  end;
  perform send_friend_text('Лев','1234','Кира', repeat('я', 200));
  perform send_friend_text('Лев','1234','Кира', E'раз\nдва   три');
  select body into b from friend_chat order by id desc limit 1;
  if b is distinct from 'раз два три' then raise exception 'ОШИБКА: переносы и пробелы: «%»', b; end if;
end $$;
\echo ok

\echo === 5. писать можно только другу
do $$ begin
  begin
    perform send_friend_text('Лев','1234','Максим','привет');
    raise exception 'ОШИБКА: написали не другу';
  exception when others then
    if sqlerrm not like '%not_a_friend%' then raise; end if;
  end;
  begin
    perform send_friend_text('Лев','0000','Кира','привет');
    raise exception 'ОШИБКА: написали с чужим PIN';
  exception when others then
    if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Лев';
end $$;
\echo ok

\echo === 6. лимит общий с фразами: десять в минуту
do $$
declare n int;
begin
  delete from friend_chat;
  for i in 1..5 loop perform send_friend_phrase('Лев','1234','Кира','hi'); end loop;
  for i in 1..5 loop perform send_friend_text('Лев','1234','Кира','текст ' || i); end loop;
  begin
    perform send_friend_text('Лев','1234','Кира','одиннадцатое');
    raise exception 'ОШИБКА: одиннадцатое сообщение за минуту прошло';
  exception when others then
    if sqlerrm not like '%too_fast%' then raise; end if;
  end;
  -- Кира пишет своё: её лимит отдельный
  perform send_friend_text('Кира','4321','Лев','а я могу');
  select count(*) into n from friend_chat;
  if n <> 11 then raise exception 'ОШИБКА: сообщений %', n; end if;
end $$;
\echo ok

\echo === 7. ровно одно из двух: фраза или текст
do $$ begin
  begin
    insert into friend_chat(a, b, sender, code, body) values ('Кира','Лев','Лев','hi','и текст');
    raise exception 'ОШИБКА: записалось и то и другое';
  exception when check_violation then null;
  end;
  begin
    insert into friend_chat(a, b, sender) values ('Кира','Лев','Лев');
    raise exception 'ОШИБКА: записалось пустое';
  exception when check_violation then null;
  end;
  begin
    insert into friend_chat(a, b, sender, body) values ('Кира','Лев','Лев', repeat('ы', 201));
    raise exception 'ОШИБКА: записался слишком длинный текст';
  exception when check_violation then null;
  end;
end $$;
\echo ok

\echo === 8. текст будит уведомление, как и фраза
do $$ begin
  delete from push_outbox;
  update friend_chat set created_at = now() - interval '2 minutes';
  perform send_friend_text('Лев','1234','Кира','проснись');
  if not exists (select 1 from push_outbox where username = 'Кира' and kind = 'talk' and who = 'Лев') then
    raise exception 'ОШИБКА: уведомления о тексте нет';
  end if;
end $$;
\echo ok

\echo === 9. в ленте не больше 50 сообщений
do $$
declare n int;
begin
  delete from friend_chat;
  for i in 1..60 loop
    update friend_chat set created_at = now() - interval '2 minutes';
    perform send_friend_text('Лев','1234','Кира','сообщение ' || i);
  end loop;
  select count(*) into n from friend_chat;
  if n <> 50 then raise exception 'ОШИБКА: хранится %', n; end if;
  if (friend_thread('Кира','4321','Лев')->'messages'->-1->>'text') is distinct from 'сообщение 60' then
    raise exception 'ОШИБКА: последним не последнее';
  end if;
end $$;
\echo ok

\echo === 10. anon шлёт текст через функцию, но фильтр напрямую не зовёт
begin;
set local role anon;
do $$ begin
  perform send_friend_text('Кира','4321','Лев','через anon');
  begin
    perform chat_clean('x');
    raise exception 'ОШИБКА: anon зовёт служебный фильтр';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
\echo ok

\echo === 11. фразы игры и быстрые ответы есть в базе
create temp table js_codes(kind text, code text);
\copy js_codes from '/home/user/hot-cold/db/say_codes_js.csv' with (format csv, header true)
do $$
declare missing text;
begin
  select string_agg(kind || ':' || code, ', ') into missing from js_codes
  where (kind = 'say' and not (code = any(chat_codes())))
     or (kind = 'quick' and not (code = any(friend_phrases())));
  if missing is not null then raise exception 'ОШИБКА: база не знает фраз: %', missing; end if;
  if (select count(*) from js_codes where kind = 'say') not between 4 and 10 then
    raise exception 'ОШИБКА: фраз в игре % — должно быть 4–10', (select count(*) from js_codes where kind = 'say');
  end if;
  -- Старые коды принимаются: у кого открыта прежняя версия игры, не сломается
  if not ('hurry' = any(chat_codes())) then raise exception 'ОШИБКА: старая фраза больше не принимается'; end if;
end $$;
\echo ok

\echo === 12. смена имени сохраняет текст сообщений
do $$
declare th jsonb;
begin
  delete from friend_chat;
  perform send_friend_text('Лев','1234','Кира','до переименования');
  update students set renamed_at = null where username in ('Лев','Кира');
  perform rename_student('Кира','4321','Анна');
  th := friend_thread('Лев','1234','Анна');
  if th->'messages'->0->>'text' is distinct from 'до переименования' then
    raise exception 'ОШИБКА: текст потерялся: %', th;
  end if;
  update students set renamed_at = null where username = 'Анна';
  perform rename_student('Анна','4321','Кира');
  update students set renamed_at = null where username = 'Кира';
end $$;
\echo ok
