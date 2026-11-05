# Подбор силы героев партии (10 миров) симуляцией «среднего игрока» на «Нормально».
#   OUT=/tmp/adv-balance python3 -I tools/adventure/balance/calib.py ITER N W0 ROOT
# W0 — номер первого мира партии с нуля (15 для миров 16–25), ROOT — копия игры, где
# миры партии включены (activateN.py). Состояние — $OUT/calib_W0.json, итог шага —
# в вывод: по миру средняя доля побед (цель), доли по героям и силы до шага.
# Цели: обычный i-й герой — A+6−1,5i, босс — B; от волны к волне на 2 п.п. ниже.
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get('OUT', '/tmp/adv-balance'); os.makedirs(OUT, exist_ok=True)
it, N, W0, ROOT = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
A3, B3 = [53.8, 47.8, 41.7, 35.7, 29.8], [36, 30, 25, 19, 12]   # волна миров 16–20
def A(w): return A3[w % 5] - 2.05 * (w // 5 - 3)
def B(w): return B3[w % 5] - (w // 5 - 3)
def target(n):
    w, i = n // 10, n % 10
    return B(w) if i == 9 else A(w) + 6 - 1.5 * i
def base(w):
    return min(0.9, 0.17 + 0.03 * (w // 5) + 0.14 * (w % 5))
def eff(n, lv):
    return base(n // 10) + (n % 10) * 0.012 + (0.06 if n % 10 == 9 else 0) + lv
first, last = W0 * 10, W0 * 10 + 99
state_f = os.path.join(OUT, 'calib_%d.json' % W0)
if os.path.exists(state_f):
    L = {int(k): v for k, v in json.load(open(state_f)).items()}
else:
    L = {n: (-0.2 if n % 10 == 9 else 0.0) for n in range(first, last + 1)}
patch = 'for (let w = %d; w < %d; w++) ADV_BRAIN_SHIFT[w] = 0; const LV = ' % (W0, W0 + 10) + \
        json.dumps({str(n - 50): round(v, 3) for n, v in L.items()}) + \
        '; ADV_HEROES.forEach((h, i) => { if (i in LV) h.level = LV[i]; }); advHeroRules.length = 0;'
tag = 'c%d_%d' % (W0, it)
subprocess.run([os.path.join(HERE, 'run.sh'), tag, str(N), 'normal', str(first), str(last), ROOT, patch], check=True)
res = {}
for line in open(os.path.join(OUT, 'bal_%s.txt' % tag)):
    p = line.split()
    if len(p) >= 4 and p[0].isdigit():
        res[int(p[0])] = 100.0 * int(p[2]) / int(p[3])
assert len(res) == 100, len(res)
damp = float(os.environ.get('DAMP', '0.8'))
rows, off = [], 0
for n in range(first, last + 1):
    T, win = target(n), res[n]
    slope = 110.0 if n % 10 == 9 else 70.0
    # Глупый соперник (сила ниже 0,3–0,4) резко слабеет от каждой сотой — шаг меньше
    e = eff(n, L[n])
    slope *= 2.8 if e < 0.3 else 1.6 if e < 0.4 else 1.0
    step = max(-0.2, min(0.2, (win - T) / slope)) * damp
    # Шум: при N игр ошибка ~ 50/sqrt(N) п.п. — мелкие отклонения не трогаем
    if abs(win - T) < 0.8 * 50 / N ** 0.5: step = 0
    old = L[n]
    # Выше 0,98 сила не растёт — не уходим за потолок. Поправка героя — до +0,7:
    # кто сам себе мешает (пропускает ходы), тому нужна сильная игра в остальном
    L[n] = round(max(-0.6, min(0.7, 1.0 - eff(n, 0), old + step)), 3)
    rows.append((n, T, win, old, L[n]))
    off += abs(win - T)
json.dump({str(k): v for k, v in L.items()}, open(state_f, 'w'))
for w in range(W0, W0 + 10):
    rs = [r for r in rows if r[0] // 10 == w]
    print('w%-2d avg %4.1f (цель %4.1f) | ' % (w + 1, sum(r[2] for r in rs) / 10, sum(r[1] for r in rs) / 10) +
          ' '.join('%3d' % r[2] for r in rs) + ' | ' + ' '.join('%+.2f' % r[3] for r in rs))
print('сумма |откл.| %.0f, среднее %.1f' % (off, off / 100))
