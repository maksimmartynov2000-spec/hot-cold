\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === 1. поиск: короткий запрос отклоняется
do $$ begin
  begin
    perform find_students('Лев','1234','Л');
    raise exception 'ОШИБКА: короткий запрос прошёл';
  exception when others then
    if sqlerrm is distinct from 'query_too_short' then raise; end if;
  end;
end $$;
\echo ok

\echo === 2. поиск: неверный PIN отклоняется
do $$ begin
  begin
    perform find_students('Лев','9999','Ки');
    raise exception 'ОШИБКА: чужой PIN прошёл';
  exception when others then
    if sqlerrm is distinct from 'auth_failed' then raise; end if;
  end;
end $$;
\echo ok

\echo === 3. поиск находит по началу имени и не показывает меня самого
select 'найдено: ' || coalesce(string_agg(username, ','), 'ничего')
from find_students('Лев','1234','ки');
select 'себя не вернул: ' || (count(*) = 0)::text from find_students('Лев','1234','ле');

\echo === 4. заявка уходит и видна обеим сторонам
select 'отправка: ' || send_friend_request('Лев','1234','Кира');
select 'у Льва: ' || relation from list_friends('Лев','1234');
select 'у Киры: ' || relation from list_friends('Кира','4321');

\echo === 5. повторная заявка не плодит строк
select 'повтор: ' || send_friend_request('Лев','1234','Кира');
select 'строк в базе: ' || count(*)::text from friendships;

\echo === 6. встречная заявка сразу делает друзьями
select 'встречная: ' || send_friend_request('Кира','4321','Лев');
select 'у Льва: ' || relation from list_friends('Лев','1234');
select 'у Киры: ' || relation from list_friends('Кира','4321');

\echo === 7. поиск показывает, что уже друзья
select 'связь: ' || relation from find_students('Лев','1234','ки');

\echo === 8. сам себе не друг
do $$ begin
  begin
    perform send_friend_request('Лев','1234','Лев');
    raise exception 'ОШИБКА: сам себе отправил';
  exception when others then
    if sqlerrm is distinct from 'cannot_friend_self' then raise; end if;
  end;
end $$;
\echo ok

\echo === 9. отказ и запрет повторной заявки на сутки
select 'заявка Максиму: ' || send_friend_request('Лев','1234','Максим');
select 'отказ: ' || respond_friend_request('Максим','1111','Лев',false);
do $$ begin
  begin
    perform send_friend_request('Лев','1234','Максим');
    raise exception 'ОШИБКА: заявка прошла сразу после отказа';
  exception when others then
    if sqlerrm is distinct from 'recently_declined' then raise; end if;
  end;
end $$;
\echo ok
select 'отказавшего в списке нет: ' || (count(*) = 0)::text
from list_friends('Максим','1111');

\echo === 10. через сутки можно снова
update friendships set decided_at = now() - interval '25 hours'
where requester = 'Лев' and addressee = 'Максим';
select 'повторная заявка: ' || send_friend_request('Лев','1234','Максим');

\echo === 11. принять заявку
select 'принял: ' || respond_friend_request('Максим','1111','Лев',true);
select 'у Льва друзей: ' || count(*)::text from list_friends('Лев','1234') where relation = 'friend';

\echo === 12. ответить на несуществующую заявку нельзя
do $$ begin
  begin
    perform respond_friend_request('Кира','4321','Максим',true);
    raise exception 'ОШИБКА: ответ на пустоту прошёл';
  exception when others then
    if sqlerrm is distinct from 'no_such_request' then raise; end if;
  end;
end $$;
\echo ok

\echo === 13. удаление дружбы работает с любой стороны
select 'удалил: ' || remove_friend('Максим','1111','Лев')::text;
select 'осталось связей: ' || count(*)::text from friendships where requester in ('Лев','Максим') and addressee in ('Лев','Максим');

\echo === 14. имя в другом регистре находит того же человека
select 'регистр: ' || send_friend_request('Максим','1111','лЕв');

\echo === 15. предел исходящих заявок
do $$
declare i int;
begin
  for i in 1..25 loop
    perform register_student('Бот' || i, '0000', null);
  end loop;
  for i in 1..20 loop
    perform send_friend_request('Кира','4321','Бот' || i);
  end loop;
  begin
    perform send_friend_request('Кира','4321','Бот21');
    raise exception 'ОШИБКА: 21-я заявка прошла';
  exception when others then
    if sqlerrm is distinct from 'too_many_requests' then raise; end if;
  end;
end $$;
\echo ok (двадцать заявок предел)

\echo === 16. напрямую к таблице anon не добирается
begin;
set local role anon;
do $$
declare n int;
begin
  begin
    select count(*) into n from friendships;
    if n > 0 then raise exception 'ОШИБКА: anon видит % строк напрямую', n; end if;
  exception when insufficient_privilege then null;
  end;
  begin
    insert into friendships(requester, addressee) values ('Лев', 'Кира');
    raise exception 'ОШИБКА: anon пишет в таблицу напрямую';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;
\echo ok

\echo === 17. а через функции anon работает
begin;
set local role anon;
select 'список друзей: ' || count(*)::text from list_friends('Лев','1234');
commit;

\echo === 18. служебная функция закрыта от anon
begin;
set local role anon;
do $$ begin
  begin
    perform friend_status('Лев','Кира');
    raise exception 'ОШИБКА: anon вызвал служебную функцию';
  exception when insufficient_privilege then null;
  end;
end $$;
commit;
\echo ok
