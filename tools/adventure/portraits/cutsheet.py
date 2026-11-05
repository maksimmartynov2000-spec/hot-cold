# Нарезка листа Gemini 5×4 на 20 портретов 192×192 (прозрачный фон).
# python3 -I cutsheet.py <sheet.jpg> <outdir> <prefix> [cols rows]
import numpy as np, sys, os
from PIL import Image
from scipy import ndimage
src, OUT, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 5
rows = int(sys.argv[5]) if len(sys.argv) > 5 else 4
SIZE = 192
os.makedirs(OUT, exist_ok=True)
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = im.shape
dark = 255 - im.min(axis=2)
near = dark < 24
lab, _ = ndimage.label(near)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
alpha = np.where(bg, np.clip(dark / 24.0, 0, 1), 1.0)
alpha = np.where(bg & ~ndimage.binary_dilation(~bg, iterations=3), 0, alpha)
a3 = alpha[..., None]
rgb = np.where(a3 > 0.02, (im - (1 - a3) * 255) / np.maximum(a3, 0.02), 0).clip(0, 255)
obj = alpha > 0.5
l, n = ndimage.label(ndimage.binary_dilation(obj, iterations=10))
sizes = ndimage.sum(obj, l, range(1, n + 1))
cms = ndimage.center_of_mass(obj, l, range(1, n + 1))
cell = (H / rows) * (W / cols)
owner = {}
for k, (cy, cx) in enumerate(cms, 1):
    if np.isnan(cy) or sizes[k - 1] < cell * 0.004: continue
    owner[k] = min(int(cy * rows / H), rows - 1) * cols + min(int(cx * cols / W), cols - 1)
for i in range(cols * rows):
    ids = [k for k, v in owner.items() if v == i]
    if not ids: print('пусто', i); continue
    big = max(ids, key=lambda k: sizes[k - 1])
    ids = [k for k in ids if sizes[k - 1] >= sizes[big - 1] * 0.03]
    keep = np.isin(l, ids) & (alpha > 0.02)
    ys, xs = np.where(keep)
    by0, by1, bx0, bx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    a = (alpha * keep)[by0:by1, bx0:bx1]
    rgba = np.dstack([rgb[by0:by1, bx0:bx1], a * 255]).astype(np.uint8)
    piece = Image.fromarray(rgba, 'RGBA')
    side = int(max(piece.size) * 1.08)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(piece, ((side - piece.size[0]) // 2, (side - piece.size[1]) // 2))
    canvas.resize((SIZE, SIZE), Image.LANCZOS).save(os.path.join(OUT, '%s-%02d.png' % (prefix, i)))
print(prefix, 'ok', W, H)
