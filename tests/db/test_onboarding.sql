\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: отметки, иконки и звёзды откатываются в конце
begin;

\echo === подготовка
do $$ begin
  delete from ladder where username = 'Кира';
  update students set failed_logins = 0, locked_until = null, avatar = null, tutorial_done = false;
end $$;
\echo ok

\echo === 1. иконка 🎓 — только тому, кто прошёл обучение
do $$
begin
  if (my_profile('Кира','4321')->>'tutorialDone')::boolean then raise exception 'ОШИБКА: обучение пройдено с самого начала'; end if;
  begin
    perform set_avatar('Кира','4321','🎓');
    raise exception 'ОШИБКА: иконка без обучения';
  exception when others then if sqlerrm <> 'avatar_locked' then raise; end if;
  end;
  perform tutorial_finished('Кира','4321');
  if not (my_profile('Кира','4321')->>'tutorialDone')::boolean then raise exception 'ОШИБКА: отметка не сохранилась'; end if;
  if set_avatar('Кира','4321','🎓') <> '🎓' then raise exception 'ОШИБКА: иконка не ставится'; end if;
  -- Обычные иконки и награды лиг работают как раньше
  if set_avatar('Кира','4321', (avatar_choices())[1]) <> (avatar_choices())[1] then raise exception 'ОШИБКА: обычная иконка'; end if;
  begin
    perform set_avatar('Кира','4321','🦖');
    raise exception 'ОШИБКА: награда лиги без лиги';
  exception when others then if sqlerrm <> 'avatar_locked' then raise; end if;
  end;
  begin
    perform tutorial_finished('Кира','0000');
    raise exception 'ОШИБКА: отметка без PIN';
  exception when others then if sqlerrm <> 'auth_failed' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Кира';
end $$;
\echo ok

\echo === 2. Ученик: 10 первых партий поражение звезду не отнимает, дальше — отнимает
do $$
declare i int; st jsonb;
begin
  perform ladder_touch('Кира');
  update ladder set stars = 7 where username = 'Кира';
  st := ladder_status('Кира','4321');
  if (st->>'apprentice')::int <> 10 then raise exception 'ОШИБКА: учеником % партий', st->>'apprentice'; end if;
  perform ladder_after('Кира', true);          -- 8
  for i in 1..9 loop perform ladder_after('Кира', false); end loop;
  if (select stars from ladder where username = 'Кира') <> 8 then
    raise exception 'ОШИБКА: у ученика сняли звёзды: %', (select stars from ladder where username = 'Кира');
  end if;
  st := ladder_status('Кира','4321');
  if (st->>'apprentice')::int <> 0 then raise exception 'ОШИБКА: после 10 партий ещё ученик: %', st->>'apprentice'; end if;
  perform ladder_after('Кира', false);         -- одиннадцатая — уже не ученик
  if (select stars from ladder where username = 'Кира') <> 7 then raise exception 'ОШИБКА: после ученичества звезда не снята'; end if;
end $$;
\echo ok

\echo === 3. партии за всё время: новый сезон ученичество не возвращает
do $$
begin
  update ladder set season = '2000-01' where username = 'Кира';
  perform ladder_touch('Кира');
  if (select games from ladder where username = 'Кира') <> 0 then raise exception 'ОШИБКА: сезон не сменился'; end if;
  if (ladder_status('Кира','4321')->>'apprentice')::int <> 0 then raise exception 'ОШИБКА: в новом сезоне снова ученик'; end if;
end $$;
\echo ok

\echo === 4. права
set local role anon;
do $$
begin
  if not has_function_privilege('anon', 'tutorial_finished(text,text)', 'execute') then
    raise exception 'ОШИБКА: игра не может отметить обучение';
  end if;
  if has_function_privilege('anon', 'ladder_after(text,boolean)', 'execute') then
    raise exception 'ОШИБКА: anon начисляет звёзды';
  end if;
end $$;
reset role;
\echo ok

rollback;
