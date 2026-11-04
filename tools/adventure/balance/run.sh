#!/bin/bash
# run.sh TAG N DIFF FROM TO [ROOT] [PATCH] — соперники FROM..TO, 3 дорожки, в каждой —
# порции по 8 соперников (свежий браузер на порцию: иначе память копится), итог в $OUT/bal_TAG.txt
HERE=$(cd "$(dirname "$0")" && pwd)
S=${OUT:-/tmp/adv-balance}; mkdir -p $S
TAG=$1; N=$2; DIFF=$3; FROM=$4; TO=$5; ROOT=${6:-$(cd "$HERE/../../.." && pwd)}; PATCH=$7
LANES=${LANES:-3}
rm -f $S/balp_${TAG}_*.txt
for i in $(seq 0 $((LANES-1))); do
  (
    ALL=$(seq $((FROM+i)) $LANES $TO | tr '\n' ' ')
    set -- $ALL
    k=0
    while [ $# -gt 0 ]; do
      L=$(echo "$@" | tr ' ' '\n' | head -8 | paste -sd,)
      shift $(( $# < 8 ? $# : 8 ))
      node $HERE/sim.js $N 0.45 $DIFF "$L" "$ROOT" "$PATCH" > $S/balp_${TAG}_${i}_$k.txt 2>&1
      k=$((k+1))
    done
  ) &
done
wait
cat $S/balp_${TAG}_*.txt | grep -v '^REP' | grep -v '^ERR' | sort -n > $S/bal_${TAG}.txt
grep -h "^ERR" $S/balp_${TAG}_*.txt | head -3
