\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка
do $$ begin
  update students set avatar = null, avatar_color = null, renamed_at = null;
end $$;
\echo ok

\echo === 1. цвет выбирается и возвращается в профиле
do $$
declare p jsonb;
begin
  p := my_profile('Лев','1234');
  if not (p ? 'color') then raise exception 'ОШИБКА: профиль без поля color'; end if;
  if p->>'color' is not null then raise exception 'ОШИБКА: цвет есть, хотя его не выбирали'; end if;
  perform set_avatar_color('Лев','1234','#a78bfa');
  if my_profile('Лев','1234')->>'color' is distinct from '#a78bfa' then
    raise exception 'ОШИБКА: цвет не сохранился';
  end if;
end $$;
\echo ok

\echo === 2. чужой цвет не принимается, null возвращает цвет «из имени»
do $$ begin
  begin
    perform set_avatar_color('Лев','1234','#123456');
    raise exception 'ОШИБКА: принят цвет не из набора';
  exception when others then
    if sqlerrm not like '%invalid_color%' then raise; end if;
  end;
  begin
    perform set_avatar_color('Лев','1234','red; drop table students');
    raise exception 'ОШИБКА: принята строка вместо цвета';
  exception when others then
    if sqlerrm not like '%invalid_color%' then raise; end if;
  end;
  perform set_avatar_color('Лев','1234',null);
  if my_profile('Лев','1234')->>'color' is not null then raise exception 'ОШИБКА: цвет не сбросился'; end if;
end $$;
\echo ok

\echo === 3. база сама не даёт записать чужой цвет в обход функции
do $$ begin
  begin
    update students set avatar_color = '#000000' where username = 'Лев';
    raise exception 'ОШИБКА: записался цвет не из набора';
  exception when check_violation then null;
  end;
end $$;
\echo ok

\echo === 4. другие видят цвет — и у того, кто выбрал только цвет, без иконки
do $$
declare r record; n int := 0;
begin
  perform set_avatar_color('Кира','4321','#f87171');
  perform set_avatar('Максим','1111','🐼');
  for r in select * from avatars_for('Лев','1234', array['Кира','Максим']) loop
    n := n + 1;
    if r.username = 'Кира' and (r.color is distinct from '#f87171' or r.avatar is not null) then
      raise exception 'ОШИБКА: у Киры %/%', r.avatar, r.color;
    end if;
    if r.username = 'Максим' and (r.avatar is distinct from '🐼' or r.color is not null) then
      raise exception 'ОШИБКА: у Максима %/%', r.avatar, r.color;
    end if;
  end loop;
  if n <> 2 then raise exception 'ОШИБКА: вернулось % строк вместо двух', n; end if;
  -- Без иконки и без цвета — строки нет: буква и цвет из имени считаются в браузере
  perform set_avatar('Максим','1111',null);
  if exists (select 1 from avatars_for('Лев','1234', array['Максим'])) then
    raise exception 'ОШИБКА: пустая строка для игрока без иконки и цвета';
  end if;
end $$;
\echo ok

\echo === 5. без PIN цвет не сменить
do $$ begin
  begin
    perform set_avatar_color('Лев','0000','#34d399');
    raise exception 'ОШИБКА: цвет сменён с чужим PIN';
  exception when others then
    if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Лев';
end $$;
\echo ok

\echo === 6. смена имени сохраняет цвет
do $$ begin
  perform set_avatar_color('Кира','4321','#2dd4bf');
  perform rename_student('Кира','4321','Кирилла');
  if my_profile('Кирилла','4321')->>'color' is distinct from '#2dd4bf' then
    raise exception 'ОШИБКА: цвет потерялся при смене имени';
  end if;
  update students set renamed_at = null where username = 'Кирилла';
  perform rename_student('Кирилла','4321','Кира');
  update students set renamed_at = null, avatar_color = null where username = 'Кира';
end $$;
\echo ok

\echo === 7. набор цветов в базе тот же, что в игре
create temp table js_colors(color text);
\copy js_colors from '/home/user/hot-cold/db/avatar_colors_js.csv' with (format csv, header true)
do $$
declare js text[]; db text[];
begin
  select array_agg(color order by color) into js from js_colors;
  select array_agg(c order by c) into db from unnest(avatar_colors()) c;
  if js is distinct from db then raise exception 'ОШИБКА: цвета разошлись: игра % / база %', js, db; end if;
  if array_length(db, 1) <> 10 then raise exception 'ОШИБКА: цветов %', array_length(db, 1); end if;
end $$;
\echo ok

\echo === 8. anon выбирает цвет через функцию, но не пишет в таблицу напрямую
begin;
set local role anon;
do $$
declare n int := 0;
begin
  perform set_avatar_color('Лев','1234','#fb923c');
  -- RLS без правил: запрос либо запрещён, либо не находит ни одной строки
  begin
    update students set avatar_color = '#fb923c' where username = 'Кира';
    get diagnostics n = row_count;
  exception when insufficient_privilege then n := 0;
  end;
  if n > 0 then raise exception 'ОШИБКА: anon меняет чужой цвет напрямую'; end if;
end $$;
rollback;
\echo ok
