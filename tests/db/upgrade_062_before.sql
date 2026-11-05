-- Переход на 062 (без онлайна): база в том виде, какой она была до неё —
-- рейтинг, лиги, рейтинговые партии, боты, турнир. Потом run.sh применяет
-- 062, а upgrade_062_after.sql проверяет, что сохранилось, а что ушло
insert into students(username, pin_hash) values
  ('Ада', extensions.crypt('1234', extensions.gen_salt('bf'))),
  ('Боря', extensions.crypt('1234', extensions.gen_salt('bf'))),
  ('Вера', extensions.crypt('1234', extensions.gen_salt('bf'))),
  ('Гена', extensions.crypt('1234', extensions.gen_salt('bf')));
update students set frame = 'fire' where username = 'Боря';
-- Ада: сейчас Золото (65 звёзд), высшая — Платина; Боря: Бронза, был в Серебре;
-- Гена: Бронза; у Веры рейтинга не было
insert into ladder(username, season, stars, peak) values
  ('Ада', '2026-11', 65, 3), ('Боря', '2026-11', 10, 1), ('Гена', '2026-11', 5, 0);
insert into matches(p0, p1, status, ranked, ranked_mode, range_min, range_max, match_over)
values ('Ада', 'Боря', 'finished', true, 0, 1, 100, true);
insert into matches(p0, p1, status, ranked, range_min, range_max, match_over)
values ('Ада', 'Вера', 'finished', false, 1, 100, true);
insert into matches(p0, p1, status, ranked, ranked_mode, range_min, range_max, bot_seat, bot_level, match_over)
values ('Вера', (select username from bot_people order by username limit 1), 'finished', true, 0, 1, 100, 1, 0.5, true);
insert into daily_quests(username, day, slot, code, goal, progress) values
  ('Ада', current_date, 1, 'ladder2', 2, 1), ('Ада', current_date, 2, 'daily_win1', 1, 0), ('Боря', current_date, 1, 'daily2', 2, 2);
insert into weekend_cup(username, week, wins) values ('Ада', '2026-11-07', 4);
insert into push_outbox(username, kind) values ('Ада', 'cup_start'), ('Боря', 'season_end');
insert into push_outbox(username, kind, who) values ('Вера', 'challenge', 'Ада');
