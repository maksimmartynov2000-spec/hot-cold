#!/bin/sh
# Проверка миграций на настоящем PostgreSQL. База собирается заново каждый раз,
# иначе прогон видит состояние предыдущего и проверки начинают врать.
#   sh tests/db/run.sh
#
# Миграции берутся из supabase/migrations по порядку номеров — новую сюда
# вписывать не нужно. Тестовая база стартует с 00_base.sql (состояние после
# миграции 007) и получает миграции с 008.
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(dirname "$(dirname "$DIR")")
MIG="$ROOT/supabase/migrations"
CHECKS="$ROOT/supabase/checks"
FIRST=008

service postgresql status >/dev/null 2>&1 || service postgresql start >/dev/null

# Два файла с одним номером — порядок между ними не определён
DUP=$(ls "$MIG" | cut -c1-3 | uniq -d)
if [ -n "$DUP" ]; then
  echo "ЕСТЬ ПАДЕНИЯ: два файла миграций с номером $DUP"
  exit 1
fi

# Пояса считаются и в браузере, и в базе. Таблицу для сверки достаём из
# index.html каждый раз заново: копия рядом разошлась бы с игрой незаметно
node "$DIR/tiers_from_js.js"
node "$DIR/run_curve_from_js.js"
node "$DIR/bonus_count_from_js.js"
node "$DIR/near_radius_from_js.js"
node "$DIR/avatars_from_js.js"
node "$DIR/say_codes_from_js.js"
node "$DIR/bots_from_js.js"
node "$DIR/rewards_from_js.js"
chmod a+r "$DIR"/*.csv

# Список «-f файл» для psql: все миграции с номером не меньше $1.
# С $2 = twice каждая идёт дважды подряд
mig_args() {
  for M in "$MIG"/*.txt; do
    N=$(basename "$M" | cut -c1-3)
    if [ "$N" -ge "$1" ]; then
      printf ' -f %s' "$M"
      if [ "$2" = "twice" ]; then printf ' -f %s' "$M"; fi
    fi
  done
}

FAILED=0

# 1. База с нуля по всем миграциям подряд: номера стоят в том порядке,
#    в котором миграции можно применить. Каждую — дважды: если человек не
#    уверен, что миграция прошла, и запустит её снова, это не должно ломаться
echo "--- все миграции с нуля"
su postgres -c "dropdb --if-exists hotcold_scratch" >/dev/null 2>&1
su postgres -c "createdb hotcold_scratch"
if ! su postgres -c "psql -q -d hotcold_scratch -v ON_ERROR_STOP=1 \
     -f $DIR/00_supabase.sql $(mig_args 001 twice)" >/dev/null 2>"$DIR/.scratch.log"; then
  grep -v NOTICE "$DIR/.scratch.log"
  FAILED=1
fi
rm -f "$DIR/.scratch.log"
su postgres -c "dropdb --if-exists hotcold_scratch" >/dev/null 2>&1

# 2. Тестовая база
su postgres -c "dropdb --if-exists hotcold_test" >/dev/null 2>&1
su postgres -c "createdb hotcold_test"
su postgres -c "psql -q -d hotcold_test -v ON_ERROR_STOP=1 \
  -f $DIR/00_base.sql $(mig_args $FIRST) \
  -c \"select register_student('Лев','1234',null), register_student('Кира','4321',null), register_student('Максим','1111',null);\"" >/dev/null

# 3. Файлы проверки из supabase/checks: на базе со всеми миграциями в каждом
#    должны быть только ✔ — иначе пользователь увидит ложную тревогу
for C in "$CHECKS"/*.sql; do
  echo "--- $(basename "$C")"
  if ! OUT=$(su postgres -c "psql -q -A -t -d hotcold_test -v ON_ERROR_STOP=1 -f $C" 2>&1); then
    echo "$OUT"
    FAILED=1
  elif echo "$OUT" | grep -q "✘"; then
    echo "$OUT" | grep "✘"
    FAILED=1
  fi
done

# Правило «партия с человеком начинается, когда оба пришли» (миграция 035)
# сценарии ниже не проверяют: они про ход игры после старта и сразу ходят.
# Его проверяет test_match_flow.sql — он сам включает правило у себя
su postgres -c "psql -q -d hotcold_test -c 'alter table matches disable trigger matches_flow'" >/dev/null

# 4. Сценарии. Они подгружают таблицы-сверки по имени файла, без пути:
#    работают из папки db, где бы ни лежал сам репозиторий
cd "$DIR"
for T in "$DIR"/test_*.sql; do
  echo "--- $(basename "$T")"
  if ! su postgres -c "psql -q -d hotcold_test -v ON_ERROR_STOP=1 -f $T" 2>&1; then
    FAILED=1
  fi
done

if [ "$FAILED" = "0" ]; then
  echo ""
  echo "все сценарии прошли"
else
  echo ""
  echo "ЕСТЬ ПАДЕНИЯ"
  exit 1
fi
