\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: вызовы и уведомления откатываются в конце
begin;
alter table matches enable trigger matches_flow;

\echo === подготовка
do $$ begin
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null;
  delete from player_blocks;
  if friend_status('Лев','Кира') is distinct from 'friend' then
    perform send_friend_request('Лев','1234','Кира');
    if friend_status('Лев','Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира','4321','Лев',true);
    end if;
  end if;
  delete from push_outbox;
end $$;
\echo ok

\echo === 1. вызов приняли — вызвавшему уведомление «принял»
do $$
declare mid bigint;
begin
  mid := challenge_friend('Лев','1234','Кира',100,false,3);
  perform respond_challenge('Кира','4321',mid,true);
  if not exists (select 1 from push_outbox where username = 'Лев' and kind = 'accepted' and who = 'Кира') then
    raise exception 'ОШИБКА: нет уведомления о принятом вызове: %', (select jsonb_agg(p) from push_outbox p);
  end if;
  perform set_config('t.acc', mid::text, false);
end $$;
\echo ok

\echo === 2. отказ — никакого «принял»; дальнейшие изменения партии — тоже
do $$
declare mid bigint := current_setting('t.acc')::bigint; mid2 bigint; n int;
begin
  perform match_state('Лев','1234',mid);
  perform match_state('Кира','4321',mid);
  update matches set status = 'finished' where id = mid;
  mid2 := challenge_friend('Лев','1234','Кира',100,false,3);
  perform respond_challenge('Кира','4321',mid2,false);
  select count(*) into n from push_outbox where kind = 'accepted';
  if n <> 1 then raise exception 'ОШИБКА: уведомлений «принял» %', n; end if;
end $$;
\echo ok

\echo === 3. жетон до старта не взводится
do $$
declare mid bigint;
begin
  mid := challenge_friend('Лев','1234','Кира',100,false,3);
  perform respond_challenge('Кира','4321',mid,true);
  begin
    perform use_match_token('Лев','1234',mid,true);
    raise exception 'ОШИБКА: жетон взведён до старта';
  exception when others then if sqlerrm <> 'not_started' then raise; end if;
  end;
  perform match_state('Лев','1234',mid);
  perform match_state('Кира','4321',mid);
  update matches set start_at = now() - interval '1 second' where id = mid;
  if not use_match_token('Лев','1234',mid,true) then raise exception 'ОШИБКА: после старта жетон не взводится'; end if;
end $$;
\echo ok

\echo === 4. новые виды уведомлений база принимает, неизвестные — нет
do $$
begin
  insert into push_outbox(username, kind, who) values ('Лев','season_end',''), ('Лев','invite_joined','Кира');
  begin
    insert into push_outbox(username, kind, who) values ('Лев','spam','x');
    raise exception 'ОШИБКА: принят неизвестный вид';
  exception when check_violation then null;
  end;
end $$;
\echo ok

rollback;
