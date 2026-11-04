# levelsN.json из состояния подбора: сдвиг мира = средняя сила 9 обычных героев,
# у героя — остаток. python3 -I mklevels.py <state.json> <out.json> <first world index>
import json, sys
L = {int(k): v for k, v in json.load(open(sys.argv[1])).items()}
w0 = int(sys.argv[3])
shift, level = {}, {}
for w in range(w0, w0 + 10):
    reg = [L[w * 10 + i] for i in range(9)]
    s = round(sum(reg) / 9, 2)
    shift[str(w)] = s
    for i in range(10):
        v = round(L[w * 10 + i] - s, 2)
        if v: level[str(w * 10 + i)] = v
json.dump({'shift': shift, 'level': level}, open(sys.argv[2], 'w'))
print('shift', shift)
