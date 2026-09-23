-- Проверка миграции migration_bonus_radius.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "диапазон", r as "радиус"
from (values
  (1, '−10…10: было 3, стало 1',   bonus_near_radius(21)   = 1, bonus_near_radius(21)),
  (2, '−20…20: было 3, стало 2',   bonus_near_radius(41)   = 2, bonus_near_radius(41)),
  (3, '1–100: было 3, стало 2',    bonus_near_radius(100)  = 2, bonus_near_radius(100)),
  (4, '−100…100: было 5, стало 3', bonus_near_radius(201)  = 3, bonus_near_radius(201)),
  (5, '1–10: как было, 1',         bonus_near_radius(10)   = 1, bonus_near_radius(10)),
  (6, '1–200: как было, 3',        bonus_near_radius(200)  = 3, bonus_near_radius(200)),
  (7, '1–1000: как было, 5',       bonus_near_radius(1000) = 5, bonus_near_radius(1000))
) as t(nn, what, ok, r)
order by 1;
