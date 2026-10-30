\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Сундук, серия и сезонный путь (миграция 053). Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null, frame = null, title = null;
  update matches set status = 'finished' where status in ('invited', 'active');
  delete from season_pass where username in ('Лев', 'Кира');
  delete from cosmetics where username in ('Лев', 'Кира');
  delete from online_days where username in ('Лев', 'Кира');
  delete from online_streak where username in ('Лев', 'Кира');
  -- Задания на сегодня уже выполнены: их 20 очков сюда не примешаются
  delete from daily_quests where username in ('Лев', 'Кира');
  insert into daily_quests(username, day, slot, code, goal, progress)
  select u, player_day(u), 1, 'play2', 2, 2 from unnest(array['Лев', 'Кира']) u;
end $$;
\echo ok

\echo === 1. сундук закрыт, пока нет доигранной партии
do $$ begin
  begin
    perform open_chest('Лев', '1234');
    raise exception 'ОШИБКА: сундук без партии';
  exception when others then if sqlerrm not like '%chest_locked%' then raise; end if;
  end;
  if (my_online('Лев', '1234')->>'played')::boolean then raise exception 'ОШИБКА: «играл» без партии'; end if;
end $$;
\echo ok

\echo === 2. партия: очки сезона обоим, победителю больше; день отмечен
do $$
declare mid bigint; a int; b int;
begin
  insert into matches(p0, p1, status, ranked, ranked_mode, range_min, range_max) values ('Лев', 'Кира', 'active', true, 0, 1, 100)
  returning id into mid;
  update matches set wins = array[3, 0], match_over = true, status = 'finished' where id = mid;
  select xp into a from season_pass where username = 'Лев' and season = ladder_season();
  select xp into b from season_pass where username = 'Кира' and season = ladder_season();
  if a is distinct from 20 or b is distinct from 10 then raise exception 'ОШИБКА: очки % / %', a, b; end if;
  if not (my_online('Лев', '1234')->>'played')::boolean then raise exception 'ОШИБКА: день не отмечен'; end if;
end $$;
\echo ok

\echo === 3. сундук: раз в день, очки, серия
do $$
declare r jsonb; r2 jsonb; xp int;
begin
  r := open_chest('Лев', '1234');
  if (r->>'xp')::int <> 30 or (r->>'streak')::int <> 1 then raise exception 'ОШИБКА: сундук %', r; end if;
  r2 := open_chest('Лев', '1234');
  if not (r2->>'already')::boolean or (r2->>'xp')::int <> 30 then raise exception 'ОШИБКА: второй сундук %', r2; end if;
  select s.xp into xp from season_pass s where username = 'Лев' and season = ladder_season();
  if xp <> 50 then raise exception 'ОШИБКА: очки после сундука %', xp; end if;
end $$;
\echo ok

\echo === 4. серия: вчера — +1, позавчера — заморозка раз в неделю, дальше — заново
do $$
declare r jsonb; d date;
begin
  d := player_day('Лев');
  update online_streak set streak = 2, last_day = d - 1, freeze_week = null where username = 'Лев';
  update online_days set chest_at = null, chest = null where username = 'Лев' and day = d;
  r := open_chest('Лев', '1234');
  if (r->>'streak')::int <> 3 or (r->>'froze')::boolean then raise exception 'ОШИБКА: вчера %', r; end if;
  if (r->'streakReward'->>'code') <> 'streak' then raise exception 'ОШИБКА: награда за 3 дня %', r; end if;
  update online_streak set streak = 6, last_day = d - 2, freeze_week = null where username = 'Лев';
  update online_days set chest_at = null, chest = null where username = 'Лев' and day = d;
  r := open_chest('Лев', '1234');
  if (r->>'streak')::int <> 7 or not (r->>'froze')::boolean then raise exception 'ОШИБКА: заморозка %', r; end if;
  if not cosmetic_has('Лев', 'title', 'regular') then raise exception 'ОШИБКА: титул за 7 дней'; end if;
  update online_streak set streak = 9, last_day = d - 2 where username = 'Лев';
  update online_days set chest_at = null, chest = null where username = 'Лев' and day = d;
  r := open_chest('Лев', '1234');
  if (r->>'streak')::int <> 1 then raise exception 'ОШИБКА: вторая заморозка за неделю %', r; end if;
end $$;
\echo ok

\echo === 5. путь: ступени дают награды, рамку и титул можно надеть только свои
do $$
declare r jsonb;
begin
  perform season_xp('Лев', 1300);
  if not cosmetic_has('Лев', 'frame', 'fire') or not cosmetic_has('Лев', 'title', 'hunter')
     or not cosmetic_has('Лев', 'phrase', 'lava') or not cosmetic_has('Лев', 'color', 'grad-aurora') then
    raise exception 'ОШИБКА: награды ступеней 3–12 не выданы';
  end if;
  if cosmetic_has('Лев', 'icon', '🦦') then raise exception 'ОШИБКА: награда 15-й ступени раньше времени'; end if;
  if set_frame('Лев', '1234', 'fire') <> 'fire' then raise exception 'ОШИБКА: рамка'; end if;
  begin
    perform set_frame('Лев', '1234', 'space');
    raise exception 'ОШИБКА: чужая рамка';
  exception when others then if sqlerrm not like '%frame_locked%' then raise; end if;
  end;
  if set_title('Лев', '1234', 'hunter') <> 'hunter' then raise exception 'ОШИБКА: титул'; end if;
  begin
    perform set_title('Лев', '1234', 'champion');
    raise exception 'ОШИБКА: чужой титул';
  exception when others then if sqlerrm not like '%title_locked%' then raise; end if;
  end;
  if set_avatar_color('Лев', '1234', 'grad-aurora') <> 'grad-aurora' then raise exception 'ОШИБКА: цвет с пути'; end if;
  begin
    perform set_avatar_color('Кира', '4321', 'grad-aurora');
    raise exception 'ОШИБКА: цвет без пути';
  exception when others then if sqlerrm not like '%color_locked%' then raise; end if;
  end;
  begin
    perform set_avatar('Кира', '4321', '🦦');
    raise exception 'ОШИБКА: иконка без пути';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  r := my_online('Лев', '1234');
  if (r->>'frame') <> 'fire' or (r->>'title') <> 'hunter' or jsonb_array_length(r->'owned') < 4 or (r->>'maxLevel')::int <> 30 then
    raise exception 'ОШИБКА: my_online %', r;
  end if;
  if (select frame from faces_for('Кира', '4321', array['Лев'])) <> 'fire' then raise exception 'ОШИБКА: рамку не видно другим'; end if;
end $$;
\echo ok

\echo === 6. фраза из наград — только своя
do $$
declare mid bigint;
begin
  insert into matches(p0, p1, status, range_min, range_max) values ('Лев', 'Кира', 'active', 1, 100) returning id into mid;
  if not send_phrase('Лев', '1234', mid, 'lava') then raise exception 'ОШИБКА: своя фраза'; end if;
  begin
    perform send_phrase('Кира', '4321', mid, 'lava');
    raise exception 'ОШИБКА: чужая фраза';
  exception when others then if sqlerrm not like '%phrase_locked%' then raise; end if;
  end;
  update matches set status = 'finished' where id = mid;
end $$;
\echo ok

\echo === 7. у ботов очков сезона нет; anon не может выдать награду
do $$ begin
  if season_xp((select username from bot_people limit 1), 100) <> 0 then raise exception 'ОШИБКА: очки боту'; end if;
end $$;
set local role anon;
do $$ begin
  if has_function_privilege('anon', 'cosmetic_grant(text,text,text,text)', 'execute')
     or has_function_privilege('anon', 'season_xp(text,int)', 'execute') then
    raise exception 'ОШИБКА: anon выдаёт награды';
  end if;
end $$;
reset role;
\echo ok

rollback;
