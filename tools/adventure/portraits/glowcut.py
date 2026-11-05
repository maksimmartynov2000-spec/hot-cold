# Иконки с сиянием (легендарные «Стихии» за 💎, ряды 3–4 листа Gemini): персонаж —
# непрозрачный, сияние — мягкое полупрозрачное («цвет в прозрачность» против
# белого фона листа), белые искры вокруг — непрозрачные. Обычные иконки режет cutsheet.py.
# python3 -I glowcut.py <лист.jpg> <outdir> [перепад=10] [сияние=70] [клетки=10,…,19]
#                       [заклейка=5] [размытие=0] [светлое тело=0] [мелочь=0.02]
# Для листа «Стихии» (магазин, миграция 061):
#   клетки 10,11,12,14,15,16,17,19 — 10 70 <клетки> 5 0 0 0.003
#   сова (13) — 10 70 13 12 3 30 0.003; кролик (18) — 10 70 18 16 5 30 0.003
# Клетки 0-based: shop-NN.png → icons/shop-(NN+1).webp, 192×192, WEBP quality 88
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage
src, OUT = sys.argv[1], sys.argv[2]
G0 = float(sys.argv[3]) if len(sys.argv) > 3 else 10.0   # порог перепада яркости — контур и фактура тела
TG = float(sys.argv[4]) if len(sys.argv) > 4 else 70.0   # «тёмность», с которой сияние уже непрозрачно
cells = [int(x) for x in sys.argv[5].split(',')] if len(sys.argv) > 5 else list(range(10, 20))
CLOSE = int(sys.argv[6]) if len(sys.argv) > 6 else 5   # сколько шагов «заклеивать» разрывы контура
FILL = float(sys.argv[7]) if len(sys.argv) > 7 else 0   # размытие маски тела: заполнить щербины у края
LIGHT = float(sys.argv[8]) if len(sys.argv) > 8 else 0  # белое тело внутри сияния: светлее порога и не касается края клетки
KEEP = float(sys.argv[9]) if len(sys.argv) > 9 else 0.02  # мелкие части (искры, серп) — от этой доли самой большой
os.makedirs(OUT, exist_ok=True)
im_all = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = im_all.shape
cols, rows, SIZE = 5, 4, 192
for i in cells:
    r, c = divmod(i, cols)
    y0, y1 = int(r * H / rows), int((r + 1) * H / rows)
    x0, x1 = int(c * W / cols), int((c + 1) * W / cols)
    im = im_all[y0:y1, x0:x1]
    dark = 255 - im.min(axis=2)
    gray = im.mean(axis=2)
    g = ndimage.gaussian_filter(gray, 1.0)
    grad = np.hypot(ndimage.sobel(g, 0), ndimage.sobel(g, 1)) / 8
    edge = (grad > G0) | (dark > 150)
    core = ndimage.binary_closing(edge, iterations=CLOSE)
    if LIGHT > 0:
        light = dark < LIGHT
        ll, _ = ndimage.label(light)
        touch = set(np.unique(np.concatenate([ll[0], ll[-1], ll[:, 0], ll[:, -1]]))) - {0}
        core = core | (light & ~np.isin(ll, list(touch)))
    core = ndimage.binary_fill_holes(core)
    core = ndimage.binary_opening(core, iterations=2)
    lab, n = ndimage.label(core)
    if n:
        sizes = ndimage.sum(core, lab, range(1, n + 1))
        big = sizes.max()
        keep_ids = [k + 1 for k, s in enumerate(sizes) if s >= big * KEEP]
        core = np.isin(lab, keep_ids)
    # Мягкий край тела: 1,5 px
    core_a = ndimage.gaussian_filter(core.astype(np.float32), 1.2)
    core_a = np.where(core, np.maximum(core_a, 0.5), core_a)
    glow_a = np.clip((dark - 4) / TG, 0, 1) * 0.92
    body = np.where(core, 1.0, core_a)
    # Искры: светлее сияния вокруг — сами светятся, прозрачными их делать нельзя
    local = ndimage.gaussian_filter(dark, 5)
    spark = np.clip((local - dark - 8) / 20, 0, 1) * (local > 18)
    body = np.maximum(body, np.where(core, 1.0, spark))
    if FILL > 0:
        body = np.maximum(body, np.clip(ndimage.gaussian_filter(core.astype(np.float32), FILL) * 1.8, 0, 1))
    alpha = np.maximum(body, glow_a)
    a3 = alpha[..., None]
    rgb = np.where(a3 > 0.02, (im - (1 - a3) * 255) / np.maximum(a3, 0.02), 0).clip(0, 255)
    w = body[..., None]
    rgb = im * w + rgb * (1 - w)
    vis = alpha > 0.06
    ys, xs = np.where(vis)
    by0, by1, bx0, bx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgba = np.dstack([rgb[by0:by1, bx0:bx1], alpha[by0:by1, bx0:bx1] * 255]).astype(np.uint8)
    piece = Image.fromarray(rgba, 'RGBA')
    side = int(max(piece.size) * 1.04)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(piece, ((side - piece.size[0]) // 2, (side - piece.size[1]) // 2))
    canvas.resize((SIZE, SIZE), Image.LANCZOS).save(os.path.join(OUT, 'shop-%02d.png' % i))
    # для отладки — маска тела
    Image.fromarray((core * 255).astype(np.uint8)).save(os.path.join(OUT, 'core-%02d.png' % i))
print('ok')
