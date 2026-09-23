#!/bin/sh
# Проверка миграций на настоящем PostgreSQL. База собирается заново каждый раз,
# иначе прогон видит состояние предыдущего и проверки начинают врать.
#   sh db/run.sh
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(dirname "$DIR")

service postgresql status >/dev/null 2>&1 || service postgresql start >/dev/null

su postgres -c "dropdb --if-exists hotcold_test" >/dev/null 2>&1
su postgres -c "createdb hotcold_test"
# Пояса считаются и в браузере, и в базе. Таблицу для сверки достаём из
# index.html каждый раз заново: копия рядом разошлась бы с игрой незаметно
node "$DIR/tiers_from_js.js"
node "$DIR/run_curve_from_js.js"
node "$DIR/bonus_count_from_js.js"
chmod a+r "$DIR"/*.csv

su postgres -c "psql -q -d hotcold_test -v ON_ERROR_STOP=1 \
  -f $DIR/00_base.sql \
  -f $ROOT/migration_friends.txt \
  -f $ROOT/migration_tiers.txt \
  -f $ROOT/migration_matches.txt \
  -f $ROOT/migration_online_bonuses.txt \
  -f $ROOT/migration_timeout_row.txt \
  -f $ROOT/migration_run_server.txt \
  -f $ROOT/migration_run_moves.txt \
  -f $ROOT/migration_more_ranges.txt \
  -f $ROOT/migration_chat.txt \
  -f $ROOT/migration_suggest.txt \
  -f $ROOT/migration_ranked.txt \
  -f $ROOT/migration_ranked_modes.txt \
  -f $ROOT/migration_forced_token.txt \
  -f $ROOT/migration_rivalry.txt \
  -f $ROOT/migration_friend_chat.txt \
  -f $ROOT/migration_bonus_balance.txt \
  -f $ROOT/migration_push.txt \
  -f $ROOT/migration_friend_cancel.txt \
  -c \"select register_student('Лев','1234',null), register_student('Кира','4321',null), register_student('Максим','1111',null);\"" >/dev/null

FAILED=0
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
