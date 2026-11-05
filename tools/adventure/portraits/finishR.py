# Портреты замен (heroesR.py): python3 -I tools/adventure/portraits/finishR.py <cutdir> <icons dir> <picks>
# cutdir — клетки после cutsheet.py: R<лист><вариант>-<NN>.png (листы 1–5 — 5×4, лист 6 — 3×2:
#   cutsheet.py лист6.jpg cut R6a 3 2).
# picks — шесть строк через «/», в каждой по букве варианта на клетку листа:
#   "aaaaaaaaaaaaaaaaaaaa/…/aaaaaa". Боссам (номер на 0) — кремовое сияние за спиной.
# Рядом с cutdir — контактный лист replaced.png: что на какой номер легло.
import numpy as np, os, sys
from PIL import Image, ImageDraw
# То же сияние, что у боссов партий (finish.py)
def glow(size=192):
    y, x = np.mgrid[0:size, 0:size]
    r = np.hypot(x - size / 2 + 0.5, y - size / 2 + 0.5) / (size / 2)
    a = np.clip((0.98 - r) / 0.22, 0, 1) ** 1.4 * 235
    img = np.zeros((size, size, 4), np.uint8)
    img[..., 0], img[..., 1], img[..., 2], img[..., 3] = 255, 247, 228, a.astype(np.uint8)
    return Image.fromarray(img, 'RGBA')
CUT, OUT, picks = sys.argv[1], sys.argv[2], sys.argv[3].split('/')
g = {}
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'heroesR.py'), encoding='utf-8').read(), g)
SHEETS = g['SHEETS']
assert len(picks) == len(SHEETS) and all(len(p) == len(s) for p, s in zip(picks, SHEETS)), picks
done = []
for s, (row, sheet) in enumerate(zip(picks, SHEETS), 1):
    for i, (v, (n, name, _)) in enumerate(zip(row, sheet)):
        im = Image.open(os.path.join(CUT, 'R%d%s-%02d.png' % (s, v, i))).convert('RGBA')
        if n % 10 == 0:
            base = glow(); base.alpha_composite(im.resize((172, 172), Image.LANCZOS), (10, 12)); im = base
        im.save(os.path.join(OUT, 'adv-%d.webp' % n), 'WEBP', quality=88, method=6)
        done.append((n, name))
sheet = Image.new('RGB', (10 * 100 + 20, ((len(done) + 9) // 10) * 112 + 20), (246, 242, 236))
d = ImageDraw.Draw(sheet)
for k, (n, name) in enumerate(done):
    im = Image.open(os.path.join(OUT, 'adv-%d.webp' % n)).convert('RGBA').resize((96, 96), Image.LANCZOS)
    x, y = 10 + (k % 10) * 100, 10 + (k // 10) * 112
    sheet.paste(im, (x + 2, y), im)
    d.text((x + 30, y + 97), str(n), fill=(90, 80, 70))
sheet.save(os.path.join(os.path.dirname(os.path.abspath(CUT)), 'replaced.png'))
print('ok', len(done))
