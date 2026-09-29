-- Что было в базе до первой миграции: то, что Supabase даёт каждому новому
-- проекту, и таблица game_config — её создавали вручную, в миграциях её нет.
-- Нужен только проверке «база собирается с нуля по всем миграциям подряд».
-- Настоящее определение game_config не сохранилось: здесь ровно те колонки,
-- на которые опираются первые миграции.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Realtime: в Supabase схема и realtime.send есть в каждом проекте. Здесь —
-- пустышка той же подписи; что уходит в каналы, проверяет test_realtime.sql
create schema if not exists realtime;
create or replace function realtime.send(payload jsonb, event text, topic text, private boolean default true)
returns void language sql as $$ select null::void $$;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
end $$;

grant usage on schema public to anon;
alter default privileges in schema public grant all on tables to anon;

create table if not exists game_config (
  id int primary key default 1,
  updated_at timestamptz not null default now()
);
insert into game_config(id) values (1) on conflict do nothing;
alter table game_config enable row level security;
