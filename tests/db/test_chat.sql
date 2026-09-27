\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка
do $$
declare mid bigint;
begin
  if friend_status('Лев','Кира') is distinct from 'friend' then
    perform send_friend_request('Лев','1234','Кира');
    if friend_status('Лев','Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира','4321','Лев',true);
    end if;
  end if;
  delete from matches where (p0, p1) in (('Лев','Кира'), ('Кира','Лев'));
  mid := challenge_friend('Лев','1234','Кира',100,false,3,false,null);
  perform respond_challenge('Кира','4321',mid,true);
  perform set_config('t.c', mid::text, false);
end $$;
\echo ok

\echo === 1. фраза уходит и видна обоим
do $$
declare mid bigint := current_setting('t.c')::bigint; a jsonb; b jsonb;
begin
  perform send_phrase('Лев','1234',mid,'hi');
  a := match_state('Лев','1234',mid);
  b := match_state('Кира','4321',mid);
  if jsonb_array_length(a -> 'chat') is distinct from 1 then
    raise exception 'ОШИБКА: у отправителя фразы нет — %', a -> 'chat';
  end if;
  if jsonb_array_length(b -> 'chat') is distinct from 1 then
    raise exception 'ОШИБКА: соперник фразу не видит';
  end if;
  if (b -> 'chat' -> 0 ->> 'code') is distinct from 'hi' then
    raise exception 'ОШИБКА: пришёл не тот код';
  end if;
  if (b -> 'chat' -> 0 ->> 'seat')::int is distinct from 0 then
    raise exception 'ОШИБКА: фраза приписана не тому';
  end if;
  if (b -> 'chat' -> 0 ->> 'ago') is null then
    raise exception 'ОШИБКА: возраст фразы не пришёл';
  end if;
end $$;
\echo ok

\echo === 2. свои слова придумать нельзя
do $$
declare mid bigint := current_setting('t.c')::bigint;
begin
  begin
    perform send_phrase('Лев','1234',mid,'ты проиграл, неудачник');
    raise exception 'ОШИБКА: приняли произвольный текст';
  exception when others then
    if sqlerrm is distinct from 'bad_phrase' then raise; end if;
  end;
end $$;
\echo ok

\echo === 3. спамить не выходит
do $$
declare mid bigint := current_setting('t.c')::bigint;
begin
  perform send_phrase('Лев','1234',mid,'hot');
  perform send_phrase('Лев','1234',mid,'cold');
  begin
    perform send_phrase('Лев','1234',mid,'wow');
    raise exception 'ОШИБКА: четвёртая фраза подряд прошла';
  exception when others then
    if sqlerrm is distinct from 'too_fast' then raise; end if;
  end;
end $$;
\echo ok

\echo === 4. предел у каждого свой
do $$
declare mid bigint := current_setting('t.c')::bigint;
begin
  perform send_phrase('Кира','4321',mid,'nice');
end $$;
\echo ok

\echo === 5. в чужой матч не написать
do $$
declare mid bigint := current_setting('t.c')::bigint;
begin
  begin
    perform send_phrase('Максим','1111',mid,'hi');
    raise exception 'ОШИБКА: посторонний написал в матч';
  exception when others then
    if sqlerrm is distinct from 'not_your_match' then raise; end if;
  end;
end $$;
\echo ok

\echo === 6. фразы не мешают остальному состоянию
do $$
declare mid bigint := current_setting('t.c')::bigint; st jsonb; sec int;
begin
  select secret into sec from matches where id = mid;
  st := match_state('Лев','1234',mid);
  if st ->> 'secret' is not null then raise exception 'УТЕЧКА: число открылось'; end if;
  if st -> 'chat' is null then raise exception 'ОШИБКА: чата нет в состоянии'; end if;
end $$;
\echo ok

\echo === 7. в законченный матч не написать
do $$
declare mid bigint := current_setting('t.c')::bigint;
begin
  update matches set status = 'finished' where id = mid;
  begin
    perform send_phrase('Лев','1234',mid,'gg');
    raise exception 'ОШИБКА: написали в законченный матч';
  exception when others then
    if sqlerrm is distinct from 'not_playing' then raise; end if;
  end;
  update matches set status = 'active' where id = mid;
end $$;
\echo ok

\echo === 8. напрямую к чату anon не добирается
begin;
set local role anon;
do $$
declare n int;
begin
  begin
    select count(*) into n from match_chat;
    if n > 0 then raise exception 'УТЕЧКА: anon читает чат напрямую'; end if;
  exception when insufficient_privilege then null;
  end;
  begin
    insert into match_chat(match_id, seat, code) values (1, 0, 'hi');
    raise exception 'УТЕЧКА: anon пишет в чат напрямую';
  exception when insufficient_privilege then null;
       when foreign_key_violation then raise exception 'УТЕЧКА: anon дошёл до записи в чат';
  end;
end $$;
commit;
\echo ok
