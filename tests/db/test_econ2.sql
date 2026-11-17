\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Подарок-перерасчёт (миграция 068): ещё столько же монет, сколько заработано
-- за Приключение, игры с другом, Испытание и серию; +1 💎 за босса, +2 💎 за
-- мир на ★★★. Один раз. Откатывается в конце
begin;

\echo === подготовка: у Киры прошлые заработки, у Льва — ничего
do $$ begin
  update students set failed_logins = 0, locked_until = null where username in ('Лев', 'Кира');
  delete from gifts where username in ('Лев', 'Кира');
  delete from wallet_log where username in ('Лев', 'Кира');
  delete from wallet where username in ('Лев', 'Кира');
  insert into wallet(username, coins, gems, boss_paid, gold_paid) values ('Кира', 500, 4, '11000', '10000'), ('Лев', 0, 0, '', '');
  insert into wallet_log(username, coins, gems, reason, ref, day) values
    ('Кира', 150, 7, 'adventure', null, current_date), ('Кира', 15, 0, 'online', 'match:1', current_date),
    ('Кира', 20, 0, 'trial', null, current_date), ('Кира', 25, 0, 'streak', 'streak:x', current_date),
    ('Кира', -90, 0, 'buy', 'icon:shop-01', current_date), ('Кира', 20, 0, 'quest', 'quest:x', current_date);
end $$;
\echo ok

\echo === 1. Кире: 150 + 15 + 20 + 25 = 210 🪙 и 2 босса + 1 мир = 4 💎; покупки и задания не считаются; Льву ничего
do $$
declare n int; g jsonb;
begin
  n := econ2_gift();
  if (select coins from wallet where username = 'Кира') <> 710 or (select gems from wallet where username = 'Кира') <> 8 then
    raise exception 'ОШИБКА: подарок % 🪙 % 💎', (select coins from wallet where username = 'Кира'), (select gems from wallet where username = 'Кира');
  end if;
  if exists (select 1 from gifts where username = 'Лев') then raise exception 'ОШИБКА: подарок без заработков'; end if;
  g := my_gift('Кира', '4321');
  if g <> '{"code": "econ2", "coins": 210, "gems": 4}'::jsonb then raise exception 'ОШИБКА: my_gift %', g; end if;
end $$;
\echo ok

\echo === 2. второй запуск ничего не даёт; показан — больше не приходит
do $$ begin
  perform econ2_gift();
  if (select coins from wallet where username = 'Кира') <> 710 then raise exception 'ОШИБКА: подарок дважды'; end if;
  if not gift_seen('Кира', '4321', 'econ2') then raise exception 'ОШИБКА: отметка'; end if;
  if my_gift('Кира', '4321') is not null then raise exception 'ОШИБКА: показан второй раз'; end if;
  begin
    perform my_gift('Кира', '0000');
    raise exception 'ОШИБКА: без PIN';
  exception when others then if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
end $$;
\echo ok

rollback;
