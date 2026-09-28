\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: блокировки, жалобы и дружба откатываются в конце
begin;

\echo === подготовка: Лев и Кира друзья, переписываются, есть вызов
do $$
declare mid bigint;
begin
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null;
  delete from ranked_queue; delete from player_blocks; delete from player_reports;
  if friend_status('Лев','Кира') is distinct from 'friend' then
    perform send_friend_request('Лев','1234','Кира');
    if friend_status('Лев','Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира','4321','Лев',true);
    end if;
  end if;
  perform send_friend_text('Кира','4321','Лев','привет');
  perform send_friend_text('Лев','1234','Кира','привет, сыграем?');
  perform send_friend_text('Кира','4321','Лев','ты дурак');
  mid := challenge_friend('Кира','4321','Лев',100,false,3);
  perform set_config('t.inv', mid::text, false);
end $$;
\echo ok

\echo === 1. жалоба: причина, комментарий и переписка прикладываются сами
do $$
declare rid bigint; r player_reports;
begin
  rid := report_player('Лев','1234','кира','rude', '  обзывается  ' || repeat('x', 400));
  select * into r from player_reports where id = rid;
  if r.reporter <> 'Лев' or r.reported <> 'Кира' or r.reason <> 'rude' or r.reviewed then
    raise exception 'ОШИБКА: жалоба записана не так: %', row_to_json(r);
  end if;
  if char_length(r.note) <> 300 or left(r.note, 10) <> 'обзывается' then raise exception 'ОШИБКА: комментарий %', r.note; end if;
  if jsonb_array_length(r.messages) <> 3 or r.messages->2->>'text' <> 'ты дурак' or r.messages->2->>'from' <> 'Кира' then
    raise exception 'ОШИБКА: переписка не приложена: %', r.messages;
  end if;
  begin
    perform report_player('Лев','1234','Кира','hate', null);
    raise exception 'ОШИБКА: принята неизвестная причина';
  exception when others then if sqlerrm <> 'bad_reason' then raise; end if;
  end;
  begin
    perform report_player('Лев','1234','Лев','spam', null);
    raise exception 'ОШИБКА: жалоба на себя';
  exception when others then if sqlerrm <> 'cannot_report_self' then raise; end if;
  end;
  begin
    perform report_player('Лев','0000','Кира','spam', null);
    raise exception 'ОШИБКА: жалоба без PIN';
  exception when others then if sqlerrm <> 'auth_failed' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Лев';
end $$;
\echo ok

\echo === 2. больше 10 жалоб в сутки — нельзя
do $$
declare i int;
begin
  for i in 2..10 loop perform report_player('Лев','1234','Кира','spam', null); end loop;
  begin
    perform report_player('Лев','1234','Кира','spam', null);
    raise exception 'ОШИБКА: одиннадцатая жалоба принята';
  exception when others then if sqlerrm <> 'too_many_reports' then raise; end if;
  end;
end $$;
\echo ok

\echo === 3. блокировка снимает дружбу и отменяет вызов
do $$
declare inv bigint := current_setting('t.inv')::bigint;
begin
  perform block_player('Лев','1234','кира');
  if friend_status('Лев','Кира') is not null then raise exception 'ОШИБКА: дружба осталась'; end if;
  if (select status from matches where id = inv) <> 'declined' then raise exception 'ОШИБКА: вызов не отменён'; end if;
  if exists (select 1 from list_friends('Кира','4321') where username = 'Лев') then
    raise exception 'ОШИБКА: у Киры Лев остался в друзьях';
  end if;
  if (select string_agg(username, ',') from blocked_players('Лев','1234')) <> 'Кира' then
    raise exception 'ОШИБКА: список заблокированных';
  end if;
  if exists (select 1 from blocked_players('Кира','4321')) then raise exception 'ОШИБКА: Кира видит чужой список'; end if;
end $$;
\echo ok

\echo === 4. заблокированный не пишет, не зовёт, не добавляет — в обе стороны, «недоступен»
do $$
declare mid bigint;
begin
  begin
    perform send_friend_request('Кира','4321','Лев');
    raise exception 'ОШИБКА: заблокированная отправила заявку';
  exception when others then if sqlerrm <> 'unavailable' then raise; end if;
  end;
  begin
    perform send_friend_request('Лев','1234','Кира');
    raise exception 'ОШИБКА: заблокировавший отправил заявку';
  exception when others then if sqlerrm <> 'unavailable' then raise; end if;
  end;
  begin
    perform send_friend_text('Кира','4321','Лев','ну и ладно');
    raise exception 'ОШИБКА: написала заблокировавшему';
  exception when others then if sqlerrm <> 'not_a_friend' then raise; end if;
  end;
  begin
    perform challenge_friend('Кира','4321','Лев',100,false,3);
    raise exception 'ОШИБКА: вызвала заблокировавшего';
  exception when others then if sqlerrm <> 'not_a_friend' then raise; end if;
  end;
  -- Реванш после партии из очереди — тоже нет
  insert into matches(p0, p1, status, range_min, range_max, wins_needed, ranked, ranked_mode, match_over)
  values ('Кира', 'Лев', 'finished', 1, 100, 3, true, 0, true) returning id into mid;
  begin
    perform rematch('Кира','4321',mid);
    raise exception 'ОШИБКА: реванш с заблокировавшим';
  exception when others then if sqlerrm <> 'unavailable' then raise; end if;
  end;
end $$;
\echo ok

\echo === 5. в поиске и подсказках друг друга не видно
do $$
begin
  if exists (select 1 from find_students('Кира','4321','ле') where username = 'Лев') then
    raise exception 'ОШИБКА: Кира находит Льва';
  end if;
  if exists (select 1 from find_students('Лев','1234','ки') where username = 'Кира') then
    raise exception 'ОШИБКА: Лев находит Киру';
  end if;
  if exists (select 1 from suggest_students('Кира','4321') where username = 'Лев') then
    raise exception 'ОШИБКА: Льва подсказывают Кире';
  end if;
  if not exists (select 1 from find_students('Кира','4321','ма') where username = 'Максим') then
    raise exception 'ОШИБКА: поиск сломался для остальных';
  end if;
end $$;
\echo ok

\echo === 6. в очереди на рейтинг их не сводит
do $$
begin
  delete from ranked_queue;
  perform join_ranked_queue('Кира','4321',0);
  perform join_ranked_queue('Лев','1234',0);
  if exists (select 1 from matches where status = 'active' and bot_seat is null
             and (p0, p1) in (('Кира','Лев'), ('Лев','Кира'))) then
    raise exception 'ОШИБКА: очередь свела заблокированных';
  end if;
  -- А с другим игроком сводит
  perform join_ranked_queue('Максим','1111',0);
  if not exists (select 1 from matches where status = 'active' and bot_seat is null
                 and 'Максим' in (p0, p1)) then
    raise exception 'ОШИБКА: очередь сломалась для остальных';
  end if;
  delete from ranked_queue;
  update matches set status = 'finished' where status = 'active';
end $$;
\echo ok

\echo === 7. разблокировал — снова можно подружиться
do $$
begin
  perform unblock_player('Лев','1234','Кира');
  if exists (select 1 from blocked_players('Лев','1234')) then raise exception 'ОШИБКА: не разблокирован'; end if;
  if send_friend_request('Кира','4321','Лев') <> 'outgoing' then raise exception 'ОШИБКА: заявка после разблокировки'; end if;
  -- Разблокировать может только тот, кто заблокировал
  perform block_player('Лев','1234','Кира');
  perform unblock_player('Кира','4321','Лев');
  if not players_blocked('Лев','Кира') then raise exception 'ОШИБКА: разблокировала чужой блок'; end if;
end $$;
\echo ok

\echo === 8. таблицы снаружи закрыты, служебное не вызвать
set local role anon;
do $$
declare n int := 0;
begin
  begin select count(*) into n from player_reports; exception when insufficient_privilege then n := 0; end;
  if n > 0 then raise exception 'ОШИБКА: anon читает жалобы'; end if;
  begin select count(*) into n from player_blocks; exception when insufficient_privilege then n := 0; end;
  if n > 0 then raise exception 'ОШИБКА: anon читает блокировки'; end if;
  if has_function_privilege('anon', 'players_blocked(text,text)', 'execute') then
    raise exception 'ОШИБКА: anon проверяет чужие блокировки';
  end if;
  if not has_function_privilege('anon', 'report_player(text,text,text,text,text)', 'execute')
     or not has_function_privilege('anon', 'block_player(text,text,text)', 'execute') then
    raise exception 'ОШИБКА: игра не может пожаловаться или заблокировать';
  end if;
end $$;
reset role;
\echo ok

rollback;
