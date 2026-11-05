# Портреты партии: python3 -I tools/adventure/portraits/finish.py <партия> <cutdir> <icons dir> <picks>
# cutdir — клетки после cutsheet.py: <лист><вариант>-<NN>.png (лист 1–5, вариант a, b…).
# picks — пять строк через «/», в каждой 20 букв варианта по клеткам листа:
#   "aaaaaaaaaaaaaaaaaaaa/abaa…/…". Боссам (9-я и 19-я клетка) — кремовое сияние за спиной.
# Партия 1 — герои 51–150 (adv-51…), партия 2 — 151–250 и т. д. Рядом с cutdir — контактный лист.
import numpy as np, os, sys
from PIL import Image, ImageDraw
batch, CUT, OUT, picks = int(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4].split('/')
assert len(picks) == 5 and all(len(p) == 20 for p in picks), picks
def glow(size=192):
    y, x = np.mgrid[0:size, 0:size]
    r = np.hypot(x - size / 2 + 0.5, y - size / 2 + 0.5) / (size / 2)
    a = np.clip((0.98 - r) / 0.22, 0, 1) ** 1.4 * 235
    img = np.zeros((size, size, 4), np.uint8)
    img[..., 0], img[..., 1], img[..., 2], img[..., 3] = 255, 247, 228, a.astype(np.uint8)
    return Image.fromarray(img, 'RGBA')
done = []
for s, row in enumerate(picks, 1):
    for i, v in enumerate(row):
        im = Image.open(os.path.join(CUT, '%d%s-%02d.png' % (s, v, i))).convert('RGBA')
        n = 50 + (batch - 1) * 100 + (s - 1) * 20 + i
        if n % 10 == 9:
            base = glow(); base.alpha_composite(im.resize((172, 172), Image.LANCZOS), (10, 12)); im = base
        name = 'adv-' + str(n + 1).zfill(2)
        im.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=88, method=6)
        done.append(name)
sheet = Image.new('RGB', (10 * 100 + 20, 10 * 112 + 20), (246, 242, 236))
d = ImageDraw.Draw(sheet)
for k, name in enumerate(done):
    im = Image.open(os.path.join(OUT, name + '.webp')).convert('RGBA').resize((96, 96), Image.LANCZOS)
    x, y = 10 + (k % 10) * 100, 10 + (k // 10) * 112
    sheet.paste(im, (x + 2, y), im)
    d.text((x + 30, y + 97), name[4:], fill=(90, 80, 70))
sheet.save(os.path.join(os.path.dirname(os.path.abspath(CUT)), 'batch%d.png' % batch))
print('ok', len(done), done[0], done[-1])
