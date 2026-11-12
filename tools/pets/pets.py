# Ауры питомцев: четыре общие (пламя, иней, гроза, звёзды) и по две своих у
# каждого. Рисунки питомцев — растровые (icons/pets/*.webp, нарезка листов
# Gemini), а ауры — SVG 240×240 поверх и позади картинки, анимация классами
# в styles.css (js/pets.js).
#   python3 tools/pets/pets.py            → js/pet-art.js
#   python3 tools/pets/pets.py --svg DIR  → ещё и отдельные .svg аур для просмотра
import os, sys, json, math
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[sys.argv.index('--svg') + 1] if '--svg' in sys.argv else None
if OUT: os.makedirs(OUT, exist_ok=True)

def path(d, fill, stroke=None, w=3, extra=''):
    s = ' stroke="%s" stroke-width="%s" stroke-linejoin="round" stroke-linecap="round"' % (stroke, w) if stroke else ''
    return '<path d="%s" fill="%s"%s%s/>' % (d, fill, s, extra)
def g(cls, origin=None, extra=''):
    st = ' style="transform-origin:%gpx %gpx"' % origin if origin else ''
    return '<g class="%s"%s%s>' % (cls, st, extra)
def circ(cx, cy, r, fill, stroke=None, w=2.4, extra=''):
    s = ' stroke="%s" stroke-width="%s"' % (stroke, w) if stroke else ''
    return '<circle cx="%g" cy="%g" r="%g" fill="%s"%s%s/>' % (cx, cy, r, fill, s, extra)
def ell(cx, cy, rx, ry, fill, stroke=None, w=2.4, extra=''):
    s = ' stroke="%s" stroke-width="%s"' % (stroke, w) if stroke else ''
    return '<ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="%s"%s%s/>' % (cx, cy, rx, ry, fill, s, extra)

KINDS = ['badger', 'owl', 'toucan', 'cham', 'crab', 'penguin']
# Центр и радиус ауры вокруг растрового питомца в поле 240×240: питомец стоит на
# низу холста ростом ~200, кольцо охватывает тело
RIG = {
    'badger':  dict(aura=(120, 140), ar=86),
    'owl':     dict(aura=(120, 140), ar=88),
    'toucan':  dict(aura=(120, 140), ar=86),
    'cham':    dict(aura=(120, 140), ar=86),
    'crab':    dict(aura=(120, 150), ar=84),
    'penguin': dict(aura=(120, 140), ar=88),
}
# ---------- ауры ----------
def ring_aura(k, which):
    cx, cy = RIG[k]['aura']; r = RIG[k]['ar']
    s = g('pt-aura-spin', (cx, cy))
    if which == 'fire':
        s += circ(cx, cy, r, 'none', '#ff6a1a', 5, ' opacity=".55"')
        for i in range(12):
            a = math.radians(i * 30); ca, sa = math.cos(a), math.sin(a)
            T = lambda x, y: (cx + x * ca - y * sa, cy + x * sa + y * ca)
            s += path('M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g Z' % (T(-8, -r) + T(-8, -r - 10) + T(-2, -r - 16) + T(0, -r - 26) + T(2, -r - 16) + T(8, -r - 10) + T(8, -r)), '#ff8a1a', '#1b1030', 2.4)
            s += path('M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g Z' % (T(-4, -r - 2) + T(-4, -r - 8) + T(-1, -r - 12) + T(0, -r - 18) + T(1, -r - 12) + T(4, -r - 8) + T(4, -r - 2)), '#ffe27a')
    elif which == 'ice':
        s += circ(cx, cy, r + 2, 'none', '#8be3ff', 4, ' stroke-dasharray="2 10" opacity=".8"')
        for i in range(10):
            s += '<g transform="rotate(%g %g %g)">' % (i * 36, cx, cy) + path('M %g %g L %g %g L %g %g Z' % (cx, cy - r - 26, cx + 7, cy - r - 4, cx, cy - r + 2), '#1d6fd0') + \
                 path('M %g %g L %g %g L %g %g Z' % (cx, cy - r - 26, cx - 7, cy - r - 4, cx, cy - r + 2), '#c8f6ff') + path('M %g %g L %g %g L %g %g L %g %g Z' % (cx, cy - r - 26, cx + 7, cy - r - 4, cx, cy - r + 2, cx - 7, cy - r - 4), 'none', '#1b1030', 2.4) + '</g>'
    elif which == 'storm':
        s += circ(cx, cy, r + 4, 'none', '#7df9ff', 3, ' opacity=".6"') + circ(cx, cy, r - 4, 'none', '#8f7cff', 2, ' stroke-dasharray="6 8" opacity=".7"')
        for i in range(8):
            s += '<g transform="rotate(%g %g %g)">' % (i * 45 + 22, cx, cy) + path('M %g %g L %g %g L %g %g L %g %g' % (cx - 4, cy - r - 26, cx + 4, cy - r - 14, cx - 2, cy - r - 12, cx + 6, cy - r + 2), 'none', '#ffe14d', 3.4) + '</g>'
    else:
        s += circ(cx, cy, r + 2, 'none', '#ffe9a8', 3, ' stroke-dasharray="1 9" stroke-linecap="round" opacity=".85"') + circ(cx, cy, r + 14, 'none', '#ffd166', 1.2, ' opacity=".35"')
        for i in range(7):
            a = math.radians(i * 360 / 7); rr = r + 12 + (8 if i % 2 else 0); x, y = cx + rr * math.cos(a), cy + rr * math.sin(a); kk = 1.3 if i % 2 else 1.8
            s += '<g class="pt-aura-star" style="animation-delay:%gs;transform-origin:%gpx %gpx">' % (i * .3, x, y) + path('M %g %g l %g %g l %g %g l %g %g l %g %g Z M %g %g l %g %g l %g %g l %g %g l %g %g Z' % (
                x, y - 9 * kk, 2.6 * kk, 6.4 * kk, 6.4 * kk, 2.6 * kk, -6.4 * kk, 2.6 * kk, -2.6 * kk, 6.4 * kk, x, y - 9 * kk, -2.6 * kk, 6.4 * kk, -6.4 * kk, 2.6 * kk, 6.4 * kk, 2.6 * kk, 2.6 * kk, 6.4 * kk), '#fff3b0', '#1b1030', 1.6) + '</g>'
    return s + '</g>'
def leaf(x, y, c, k=1, rot=0):
    return '<g transform="rotate(%g %g %g)">' % (rot, x, y) + path('M %g %g c %g %g %g %g %g 0 c %g %g %g %g %g 0 Z' % (x - 10 * k, y, 6 * k, -12 * k, 16 * k, -12 * k, 20 * k, -4 * k, 12 * k, -16 * k, 10 * k, -20 * k), c, '#1b1030', 1.6) + \
           path('M %g %g L %g %g' % (x - 8 * k, y, x + 8 * k, y - 1 * k), 'none', '#1b1030', 1, ' opacity=".5"') + '</g>'
def own_aura(k, which):
    cx, cy = RIG[k]['aura']; r = RIG[k]['ar']; s = ''
    if which == 'leaves':
        s += g('pt-aura-spin', (cx, cy))
        for i in range(8):
            a = math.radians(i * 45); x, y = cx + (r + 4) * math.cos(a), cy + (r + 4) * math.sin(a)
            s += '<g class="pt-aura-wisp" style="animation-delay:%gs;transform-origin:%gpx %gpx">' % (i * .2, x, y) + leaf(x, y, ['#6cc24a', '#f5a623', '#e8742a', '#8bd16b'][i % 4], .9, i * 45 + 20) + '</g>'
        s += '</g>'
    elif which == 'fireflies':
        for i, (x, y) in enumerate([(40, 70), (196, 56), (24, 150), (214, 140), (70, 190), (170, 200), (120, 30), (60, 110), (184, 100)]):
            s += '<g class="pt-firefly" style="animation-delay:%gs;transform-origin:%gpx %gpx">' % (i * .45, x, y) + circ(x, y, 12, '#f6ff9a', extra=' opacity=".45"') + circ(x, y, 4.2, '#fff8b0', '#1b1030', 1.4) + '</g>'
    elif which == 'moon':
        s += path('M 190 54 A 26 26 0 1 0 190 106 A 20 20 0 1 1 190 54 Z', '#fff1b8', '#1b1030', 2.2)
        for i, (x, y, kk) in enumerate([(40, 60, 1.2), (70, 36, .8), (150, 24, 1), (26, 130, .9), (214, 150, .7), (40, 190, .8)]):
            s += '<g class="pt-aura-star" style="animation-delay:%gs;transform-origin:%gpx %gpx">' % (i * .3, x, y) + path('M %g %g l %g %g l %g %g l %g %g l %g %g Z' % (x, y - 7 * kk, 2 * kk, 5 * kk, 5 * kk, 2 * kk, -5 * kk, 2 * kk, -2 * kk, 5 * kk), '#fff6c8') + '</g>'
    elif which == 'feathers':
        s += g('pt-aura-spin', (cx, cy))
        for i in range(6):
            a = math.radians(i * 60 + 30); x, y = cx + (r + 2) * math.cos(a), cy + (r + 2) * math.sin(a)
            s += '<g class="pt-aura-wisp" style="animation-delay:%gs;transform-origin:%gpx %gpx"><g transform="rotate(%g %g %g)">' % (i * .25, x, y, i * 60 - 20, x, y) + \
                 path('M %g %g c 4 -14 12 -18 14 -6 c -2 10 -8 14 -14 6 Z' % (x, y), ['#d8995a', '#f3d4a0', '#a8672f'][i % 3], '#1b1030', 1.6) + path('M %g %g L %g %g' % (x, y, x + 10, y - 10), 'none', '#1b1030', 1, ' opacity=".5"') + '</g></g>'
        s += '</g>'
    elif which == 'tropics':
        for i, (x, y, c, rot, kk) in enumerate([(30, 200, '#2ecc71', -30, 1.6), (212, 196, '#1f8a4a', 30, 1.5), (26, 70, '#27ae60', 40, 1.2), (214, 60, '#2ecc71', -40, 1.3)]):
            s += '<g class="pt-aura-ribbon" style="animation-delay:%gs;transform-origin:%gpx %gpx">' % (i * .5, x, y) + leaf(x, y, c, kk, rot) + '</g>'
        for x, y in [(56, 40), (192, 36), (40, 160), (204, 160)]:
            s += ''.join(ell(x + 7 * math.cos(math.radians(a)), y + 7 * math.sin(math.radians(a)), 5, 3.5, '#ff5c8a', '#1b1030', 1.4, ' transform="rotate(%g %g %g)"' % (a, x + 7 * math.cos(math.radians(a)), y + 7 * math.sin(math.radians(a)))) for a in range(0, 360, 72)) + circ(x, y, 3, '#ffd23a')
    elif which == 'fruit':
        s += g('pt-aura-spin', (cx, cy))
        items = []
        for i in range(6):
            a = math.radians(i * 60); x, y = cx + (r + 4) * math.cos(a), cy + (r + 4) * math.sin(a); t = i % 3
            if t == 0: art = path('M %g %g c -12 -4 -22 4 -22 16 c 6 2 18 -2 22 -16 Z' % (x + 11, y - 8), '#ffd23a', '#1b1030', 1.8) + path('M %g %g l 4 -4' % (x + 10, y - 8), 'none', '#1b1030', 1.6)   # банан
            elif t == 1: art = circ(x, y, 9, '#ff8a1a', '#1b1030', 1.8) + circ(x - 3, y - 3, 3, '#ffd2a0', extra=' opacity=".7"') + path('M %g %g l 0 -6' % (x, y - 9), 'none', '#2ecc71', 2.4)   # апельсин
            else: art = ell(x, y + 2, 7, 10, '#f5a623', '#1b1030', 1.8) + path('M %g %g L %g %g M %g %g L %g %g' % (x - 7, y, x + 7, y + 4, x - 7, y + 6, x + 7, y + 10), 'none', '#1b1030', 1, ' opacity=".4"') + path('M %g %g l -5 -8 M %g %g l 0 -10 M %g %g l 5 -8' % (x, y - 8, x, y - 8, x, y - 8), 'none', '#2ecc71', 2.2)   # ананас
            s += '<g class="pt-aura-wisp" style="animation-delay:%gs;transform-origin:%gpx %gpx">%s</g>' % (i * .22, x, y, art)
        s += '</g>'
    elif which == 'rainbow':
        for i, c in enumerate(['#ff5c5c', '#ff9a1a', '#ffd23a', '#5fc84a', '#38bdf8', '#9b5cff']):
            s += circ(cx, cy, r + 14 - i * 4, 'none', c, 4, ' opacity=".55"')
    elif which == 'butterflies':
        s += g('pt-aura-spin', (cx, cy))
        for i in range(6):
            a = math.radians(i * 60 + 15); rr = r + (2 if i % 2 else 12); x, y = cx + rr * math.cos(a), cy + rr * math.sin(a); c = ['#ff8ad4', '#7fd6ff', '#ffd23a', '#b9f06a', '#ff9a1a', '#c8a2ff'][i]
            s += '<g class="pt-aura-butter" style="animation-delay:%gs;transform-origin:%gpx %gpx">' % (i * .18, x, y) + path('M %g %g c -10 -14 -22 -4 -10 8 c 10 -10 22 0 10 -8 Z' % (x, y), c, '#1b1030', 1.4) + path('M %g %g c -10 10 -20 4 -10 -6 c 10 8 20 0 10 6 Z' % (x, y), c, '#1b1030', 1.4, ' opacity=".85"') + path('M %g %g l 0 -4' % (x, y + 2), 'none', '#1b1030', 2) + '</g>'
        s += '</g>'
    elif which == 'bubbles':
        for i, (x, y, rr) in enumerate([(40, 150, 7), (200, 140, 6), (30, 90, 4), (210, 80, 5), (70, 200, 5), (170, 206, 4), (120, 40, 6), (90, 60, 3), (160, 50, 4)]):
            s += '<g class="pt-aura-bubble" style="animation-delay:%gs">' % (i * .35) + circ(x, y, rr, '#bfefff', '#5fd0ff', 1.6, ' opacity=".55"') + circ(x - rr * .35, y - rr * .35, rr * .3, '#fff', extra=' opacity=".9"') + '</g>'
    elif which == 'seabed':
        s += path('M 0 232 C 40 222 80 226 120 230 C 160 226 200 222 240 232 L 240 240 L 0 240 Z', '#e8c98a', '#1b1030', 2)
        star5 = lambda x, y, kk, c: path('M %g %g l %g %g l %g %g l %g %g l %g %g l %g %g l %g %g l %g %g l %g %g l %g %g Z' % (
            x, y - 10 * kk, 3 * kk, 7 * kk, 7 * kk, 0, -5.5 * kk, 4.5 * kk, 2 * kk, 7 * kk, -6.5 * kk, -4 * kk, -6.5 * kk, 4 * kk, 2 * kk, -7 * kk, -5.5 * kk, -4.5 * kk, 7 * kk, 0), c, '#1b1030', 1.6)
        s += star5(34, 214, 1.1, '#ff9a6a') + star5(206, 216, .9, '#ffd23a')
        s += path('M 70 220 c 0 -14 18 -14 18 0 c -6 -4 -12 -4 -18 0 Z', '#f8e8ff', '#1b1030', 1.6) + path('M 160 220 c 0 -12 16 -12 16 0 c -5 -3 -11 -3 -16 0 Z', '#ffd6e0', '#1b1030', 1.6)
        for x in (20, 226):
            s += '<g class="pt-aura-ribbon" style="transform-origin:%gpx 222px">' % x + path('M %g 222 C %g 200 %g 190 %g 170 C %g 180 %g 200 %g 222 Z' % (x - 4, x - 12, x - 2, x + 2, x + 8, x + 6, x + 4), '#2ecc71', '#1b1030', 1.6) + '</g>'
    elif which == 'snow':
        for i, (x, y, kk) in enumerate([(36, 50, 1), (90, 30, .8), (150, 26, 1.1), (206, 60, .9), (24, 120, .8), (216, 130, 1), (60, 180, .7), (180, 190, .9), (120, 70, .6)]):
            s += '<g class="pt-aura-snow" style="animation-delay:%gs;transform-origin:%gpx %gpx">' % (i * .4, x, y) + path('M %g %g l 0 %g M %g %g l %g 0 M %g %g l %g %g M %g %g l %g %g' % (x, y - 7 * kk, 14 * kk, x - 7 * kk, y, 14 * kk, x - 5 * kk, y - 5 * kk, 10 * kk, 10 * kk, x + 5 * kk, y - 5 * kk, -10 * kk, 10 * kk), 'none', '#eaf9ff', 2.4 * kk) + '</g>'
    elif which == 'fish':
        s += g('pt-aura-spin', (cx, cy))
        for i in range(4):
            a = math.radians(i * 90 + 45); x, y = cx + (r + 2) * math.cos(a), cy + (r + 2) * math.sin(a); c = ['#ff9a1a', '#38bdf8', '#ffd23a', '#ff5c8a'][i]
            s += '<g class="pt-aura-wisp" style="animation-delay:%gs;transform-origin:%gpx %gpx"><g transform="rotate(%g %g %g)">' % (i * .3, x, y, i * 90 + 135, x, y) + \
                 ell(x, y, 12, 7, c, '#1b1030', 1.8) + path('M %g %g l 8 -6 l 0 12 Z' % (x + 10, y), c, '#1b1030', 1.8) + circ(x - 5, y - 1.5, 1.8, '#1b1030') + '</g></g>'
        s += '</g>'
    return s
GEN_AURAS = {'aura_fire': 'fire', 'aura_ice': 'ice', 'aura_storm': 'storm', 'aura_star': 'star'}
OWN = {'badger': {'aura_leaves': 'leaves', 'aura_fireflies': 'fireflies'}, 'owl': {'aura_moon': 'moon', 'aura_feathers': 'feathers'},
       'toucan': {'aura_tropics': 'tropics', 'aura_fruit': 'fruit'}, 'cham': {'aura_rainbow': 'rainbow', 'aura_butterflies': 'butterflies'},
       'crab': {'aura_bubbles': 'bubbles', 'aura_seabed': 'seabed'}, 'penguin': {'aura_snow': 'snow', 'aura_fish': 'fish'}}
FRONT = {'fireflies', 'feathers', 'fruit', 'butterflies', 'bubbles', 'snow', 'fish', 'leaves'}


# slot — место в базе (aura), layer — слой: aura позади питомца, front — перед ним
PET_AURA_ART = {}
for code, which in GEN_AURAS.items():
    PET_AURA_ART[code] = {'slot': 'aura', 'layer': 'aura', 'pet': None, 'art': {k: ring_aura(k, which) for k in KINDS}}
for k, own in OWN.items():
    for code, which in own.items(): PET_AURA_ART[code] = {'slot': 'aura', 'layer': 'front' if which in FRONT else 'aura', 'pet': k, 'art': {k: own_aura(k, which)}}

if OUT:
    for code, A in PET_AURA_ART.items():
        for k, v in A['art'].items():
            open(os.path.join(OUT, code + '_' + k + '.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' + v + '</svg>')
with open(os.path.join(ROOT, 'js', 'pet-art.js'), 'w', encoding='utf-8') as f:
    f.write('// Ауры питомцев. Собирает tools/pets/pets.py — правьте там, не здесь.\n'
            '// PET_AURA_ART — место (slot), слой (layer: aura — позади питомца, front — перед), чья (pet) и рисунок по питомцам\n')
    f.write('const PET_AURA_ART = ' + json.dumps(PET_AURA_ART, ensure_ascii=False) + ';\n')
print('аур', len(PET_AURA_ART))
