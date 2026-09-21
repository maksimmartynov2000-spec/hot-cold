\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === 1. в списке нет тебя самого и есть остальные
do $$
declare n int; mine int;
begin
  delete from friendships;
  select count(*) into n from suggest_students('Лев','1234');
  if n < 2 then raise exception 'ОШИБКА: в списке % игроков', n; end if;
  select count(*) into mine from suggest_students('Лев','1234') where username = 'Лев';
  if mine is distinct from 0 then raise exception 'ОШИБКА: игрок видит сам себя'; end if;
end $$;
\echo ok

\echo === 2. друзья и отправленные заявки из списка уходят
do $$
declare n int;
begin
  perform send_friend_request('Лев','1234','Кира');
  select count(*) into n from suggest_students('Лев','1234') where username = 'Кира';
  if n is distinct from 0 then raise exception 'ОШИБКА: тот, кому послана заявка, остался в списке'; end if;
  perform respond_friend_request('Кира','4321','Лев',true);
  select count(*) into n from suggest_students('Лев','1234') where username = 'Кира';
  if n is distinct from 0 then raise exception 'ОШИБКА: друг остался в списке'; end if;
  select count(*) into n from suggest_students('Кира','4321') where username = 'Лев';
  if n is distinct from 0 then raise exception 'ОШИБКА: друг остался в списке с другой стороны'; end if;
end $$;
\echo ok

\echo === 3. кто играл недавно, тот выше
do $$
declare first_name text;
begin
  delete from friendships;
  update students set created_at = now() - interval '30 days';
  insert into runs(username, score, rounds) values ('Максим', 10, 1);
  update runs set created_at = now() where username = 'Максим';
  select username into first_name from suggest_students('Лев','1234') limit 1;
  if first_name is distinct from 'Максим' then
    raise exception 'ОШИБКА: первым идёт %, а не тот, кто играл только что', first_name;
  end if;
end $$;
\echo ok

\echo === 4. список не длиннее десяти
do $$
declare i int; n int;
begin
  for i in 1..15 loop
    perform register_student('Гость' || i, '0000', null);
  end loop;
  select count(*) into n from suggest_students('Лев','1234');
  if n is distinct from 10 then raise exception 'ОШИБКА: в списке % игроков вместо десяти', n; end if;
end $$;
\echo ok

\echo === 5. без PIN список не получить
do $$ begin
  begin
    perform suggest_students('Лев','0000');
    raise exception 'ОШИБКА: список отдан по неверному PIN';
  exception when others then
    if sqlerrm is distinct from 'auth_failed' then raise; end if;
  end;
end $$;
\echo ok
