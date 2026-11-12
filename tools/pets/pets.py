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

KINDS = ['badger', 'owl', 'toucan', 'cham', 'crab', 'penguin', 'dragon', 'shrimp']
# Центр и радиус ауры вокруг растрового питомца в поле 240×240: питомец стоит на
# низу холста ростом ~200, кольцо охватывает тело
RIG = {
    'badger':  dict(aura=(120, 140), ar=86),
    'owl':     dict(aura=(120, 140), ar=88),
    'toucan':  dict(aura=(120, 140), ar=86),
    'cham':    dict(aura=(120, 140), ar=86),
    'crab':    dict(aura=(120, 150), ar=84),
    'penguin': dict(aura=(120, 140), ar=88),
    'dragon':  dict(aura=(120, 140), ar=90),
    'shrimp':  dict(aura=(120, 140), ar=86),
}
# ---------- общие ауры: мягкие, без обводок ----------
# Свечение позади питомца (soft_back) и живые частицы перед ним (soft_front):
# пламя — языки огня и искры, иней — кристаллы и снежинки, гроза — тучки и
# молнии, звёзды — ореол и звёзды. id градиентов — с префиксом au-, js/pets.js
# делает их своими у каждого экземпляра. Питомец в поле 240×240 стоит на низу
# (y≈234), ростом ~200, шириной ~145
def sparkle(x, y, k, c, delay, cls='pt-twinkle'):
    return '<g class="%s" style="animation-delay:%gs;transform-origin:%gpx %gpx">' % (cls, delay, x, y) + \
        '<path d="M %g %g Q %g %g %g %g Q %g %g %g %g Q %g %g %g %g Q %g %g %g %g Z" fill="%s"/>' % (
            x, y - 7 * k, x + 1.2 * k, y - 1.2 * k, x + 7 * k, y, x + 1.2 * k, y + 1.2 * k, x, y + 7 * k, x - 1.2 * k, y + 1.2 * k, x - 7 * k, y, x - 1.2 * k, y - 1.2 * k, x, y - 7 * k, c) + '</g>'
def glow(gid, cx, cy, rx, ry, stops):
    st = ''.join('<stop offset="%g" stop-color="%s" stop-opacity="%g"/>' % x for x in stops)
    return '<defs><radialGradient id="%s">%s</radialGradient></defs><ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="url(#%s)"/>' % (gid, st, cx, cy, rx, ry, gid)
def flake(x, y, k, delay):
    arms = ''.join('<path d="M %g %g L %g %g" />' % (x, y, x + 6 * k * math.cos(math.radians(a)), y + 6 * k * math.sin(math.radians(a))) for a in range(0, 360, 60))
    return '<g class="pt-aura-snow" style="animation-delay:%gs" stroke="#ffffff" stroke-width="%g" stroke-linecap="round" opacity=".9">%s</g>' % (delay, 1.3 * k, arms)
def soft_back(k, which):
    if which == 'fire':
        s = glow('au-fire', 120, 170, 116, 104, [(0, '#ffcf5a', .6), (.5, '#ff7a2e', .34), (1, '#ff4d1a', 0)])
        # Языки пламени за спиной: по краям ниже, к центру выше, низ растворяется;
        # чуть размыты — мягкие, как у картинок питомцев
        defs = ('<defs><linearGradient id="au-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d00" stop-opacity="0"/>'
                '<stop offset=".18" stop-color="#ff5a1f" stop-opacity=".9"/><stop offset=".6" stop-color="#ffb02e"/><stop offset="1" stop-color="#fff1a0" stop-opacity="0"/></linearGradient>'
                '<linearGradient id="au-flame2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd166" stop-opacity="0"/><stop offset=".3" stop-color="#ffe27a"/>'
                '<stop offset="1" stop-color="#fff8d6" stop-opacity="0"/></linearGradient><filter id="au-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter></defs>')
        def tongue(x, base, h, w, d, grad, lean):
            return ('<path class="pt-flame" style="animation-delay:%gs;transform-origin:%gpx %gpx" d="M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g Z" fill="url(#%s)"/>'
                    % (d, x, base, x - w, base, x - w * 1.2, base - h * .45, x - w * .2 + lean * .5, base - h * .78, x + lean, base - h,
                       x + w * .5 + lean * .3, base - h * .6, x + w * 1.2, base - h * .35, x + w, base, grad))
        f = '<g filter="url(#au-soft)">'
        for i, (x, base, h, w, lean) in enumerate([(30, 214, 70, 12, -6), (48, 222, 104, 15, -4), (70, 226, 128, 16, -2), (96, 228, 112, 14, 3),
                                                   (144, 228, 112, 14, -3), (170, 226, 128, 16, 2), (192, 222, 104, 15, 4), (210, 214, 70, 12, 6)]):
            f += tongue(x, base, h, w, i * .13, 'au-flame', lean)
            f += tongue(x + lean * .3, base - 4, h * .62, w * .55, i * .13 + .3, 'au-flame2', lean * .6)
        return s + defs + f + '</g>'
    if which == 'ice':
        s = glow('au-ice', 120, 160, 112, 104, [(0, '#e6fbff', .5), (.6, '#7fd8ff', .28), (1, '#4aa8ff', 0)])
        cr = '<defs><linearGradient id="au-cr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#bff0ff"/><stop offset="1" stop-color="#5cc4ff"/></linearGradient></defs>'
        ring = '<g class="pt-aura-spin" style="transform-origin:120px 150px">'
        for i in range(10):
            ring += '<g transform="rotate(%g 120 150)"><path d="M 120 34 L 127 52 L 120 62 L 113 52 Z" fill="url(#au-cr)" opacity=".85"/></g>' % (i * 36)
        return s + cr + ring + '</g>'
    if which == 'storm':
        s = glow('au-storm', 120, 160, 112, 104, [(0, '#c7b8ff', .45), (.6, '#7b6cff', .28), (1, '#3b2f9e', 0)])
        cloud = lambda x, y, k: '<g opacity=".95">' + ''.join('<circle cx="%g" cy="%g" r="%g" fill="%s"/>' % (x + dx * k, y + dy * k, r * k, c) for dx, dy, r, c in
            [(-12, 2, 10, '#6f6a9e'), (0, -4, 13, '#7d78ad'), (13, 1, 10, '#6f6a9e'), (-4, 6, 10, '#5d588a'), (8, 7, 9, '#5d588a')]) + '</g>'
        return s + cloud(52, 44, 1.1) + cloud(190, 52, 1.0)
    # звёзды
    s = glow('au-star', 120, 150, 112, 108, [(0, '#fff6d0', .32), (.55, '#ffe08a', .14), (1, '#ffd166', 0)])
    s += '<circle cx="120" cy="140" r="98" fill="none" stroke="#ffe9a8" stroke-width="1.4" stroke-dasharray="1.5 7" stroke-linecap="round" opacity=".8"/>'
    return s
def soft_front(k, which):
    if which == 'fire':
        s = ''
        for i, (x, y) in enumerate([(46, 200), (70, 214), (96, 196), (146, 206), (172, 192), (196, 210), (120, 220), (60, 176)]):
            s += '<circle class="pt-ember" style="animation-delay:%gs" cx="%g" cy="%g" r="%g" fill="%s"/>' % (i * .37, x, y, 2.2 + (i % 3) * .7, ['#ffe27a', '#ffb02e', '#fff6c8'][i % 3])
        return s
    if which == 'ice':
        s = ''.join(flake(x, y, kk, d) for x, y, kk, d in [(40, 70, 1.2, 0), (200, 60, 1, .8), (60, 150, .9, 1.6), (186, 140, 1.2, .4), (30, 190, 1, 2.2), (210, 196, .9, 1.2)])
        s += sparkle(78, 52, 1, '#ffffff', .3) + sparkle(168, 92, .8, '#e6fbff', 1.1) + sparkle(208, 120, .7, '#ffffff', 1.9)
        return s
    if which == 'storm':
        bolt = lambda pts, d: '<g class="pt-aura-bolt" style="animation-delay:%gs"><polyline points="%s" fill="none" stroke="#9df3ff" stroke-width="6" stroke-linejoin="round" opacity=".35"/><polyline points="%s" fill="none" stroke="#fffbd0" stroke-width="2.6" stroke-linejoin="round"/></g>' % (d, pts, pts)
        return bolt('46,58 38,82 50,84 40,112', 0) + bolt('192,64 200,88 188,90 198,120', .85) + sparkle(30, 130, .8, '#fffbd0', .4) + sparkle(214, 150, .8, '#9df3ff', 1.2)
    s = '<g class="pt-aura-spin" style="transform-origin:120px 140px">'
    for i in range(6):
        a = math.radians(i * 60 + 15); x, y = 120 + 100 * math.cos(a), 140 + 98 * math.sin(a)
        s += sparkle(x, y, 1.3 if i % 2 else .9, '#fff3b0', i * .35)
    s += '</g>'
    return s + sparkle(56, 64, 1.1, '#ffffff', .2) + sparkle(190, 84, .9, '#ffe9a8', 1.3)

# ---------- свои ауры дракона и креветки: мягкие, как общие ----------
def soft_own(k, which):
    if which == 'embers':        # Угольки: тёплое свечение и рой искр вверх
        s = ''
        for i, (x, y) in enumerate([(36, 210), (58, 180), (80, 214), (104, 200), (136, 210), (160, 186), (184, 214), (206, 196), (120, 226), (70, 150), (176, 150)]):
            s += '<circle class="pt-ember" style="animation-delay:%gs" cx="%g" cy="%g" r="%g" fill="%s"/>' % (i * .27, x, y, 2 + (i % 3) * .8, ['#ff9a3c', '#ffd166', '#fff1b0'][i % 3])
        return s + sparkle(44, 120, .8, '#ffd166', .5) + sparkle(200, 104, .7, '#ffb02e', 1.4)
    if which == 'clouds':        # Небо: облачка плывут вокруг
        cl = lambda x, y, kk, d: ('<g class="pt-aura-wisp" style="animation-delay:%gs;transform-origin:%gpx %gpx" opacity=".92">' % (d, x, y) +
            ''.join('<circle cx="%g" cy="%g" r="%g" fill="%s"/>' % (x + dx * kk, y + dy * kk, r * kk, c) for dx, dy, r, c in
                    [(-13, 3, 10, '#e9f3ff'), (0, -4, 13, '#ffffff'), (13, 2, 10, '#e9f3ff'), (-3, 7, 11, '#d7e7fb'), (9, 7, 9, '#d7e7fb')]) + '</g>')
        s = glow('au-sky', 120, 150, 112, 106, [(0, '#bfe6ff', .4), (.6, '#7cc4ff', .2), (1, '#4aa8ff', 0)])
        return s + cl(40, 60, 1, 0) + cl(200, 76, .9, .7) + cl(26, 170, .8, 1.4) + cl(214, 184, .85, 2.1)
    if which == 'coral':         # Коралловый риф: кораллы у ног, морское свечение, пузырьки
        s = glow('au-reef', 120, 170, 114, 96, [(0, '#7fe0ff', .35), (.6, '#2fa8d8', .2), (1, '#1d6fd0', 0)])
        def branch(x, base, h, c, flip):
            d = 'M %g %g C %g %g %g %g %g %g M %g %g C %g %g %g %g %g %g M %g %g C %g %g %g %g %g %g' % (
                x, base, x, base - h * .4, x - 6 * flip, base - h * .7, x - 4 * flip, base - h,
                x, base - h * .45, x + 10 * flip, base - h * .55, x + 14 * flip, base - h * .8, x + 13 * flip, base - h * .95,
                x - 2 * flip, base - h * .7, x - 14 * flip, base - h * .75, x - 18 * flip, base - h * .9, x - 18 * flip, base - h * .98)
            return '<path d="%s" fill="none" stroke="%s" stroke-width="7" stroke-linecap="round" opacity=".95"/>' % (d, c)
        s += branch(36, 232, 70, '#ff7aa8', 1) + branch(60, 232, 46, '#ffb36b', -1) + branch(204, 232, 74, '#ff8fc0', -1) + branch(182, 232, 48, '#ffa25a', 1)
        for i, (x, y, r) in enumerate([(30, 150, 4), (46, 120, 3), (210, 140, 4.5), (196, 110, 3), (110, 40, 3.5)]):
            s += '<circle class="pt-aura-bubble" style="animation-delay:%gs" cx="%g" cy="%g" r="%g" fill="none" stroke="#e8fbff" stroke-width="1.4" opacity=".85"/>' % (i * .6, x, y, r)
        return s
    if which == 'jelly':         # Медузы: три полупрозрачные медузки покачиваются вокруг
        def jf(x, y, kk, c, d):
            t = ''.join('<path d="M %g %g q %g %g 0 %g" fill="none" stroke="%s" stroke-width="%g" stroke-linecap="round" opacity=".8"/>' % (
                x + dx * kk, y + 4 * kk, 4 * kk, 7 * kk, 16 * kk, c, 1.6 * kk) for dx in (-7, -2.5, 2.5, 7))
            return ('<g class="pt-aura-wisp" style="animation-delay:%gs;transform-origin:%gpx %gpx">' % (d, x, y) + t +
                    '<path d="M %g %g a %g %g 0 0 1 %g 0 q %g %g %g 0 z" fill="%s" opacity=".85"/>' % (x - 11 * kk, y + 4 * kk, 11 * kk, 11 * kk, 22 * kk, -11 * kk, 4 * kk, -22 * kk, c) +
                    '<ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="#ffffff" opacity=".55"/>' % (x - 4 * kk, y - 2 * kk, 3 * kk, 2 * kk) + '</g>')
        return jf(38, 70, 1.1, '#ff9ad1', 0) + jf(204, 92, 1, '#b79bff', .9) + jf(30, 176, .85, '#8fd8ff', 1.8)

# ---------- ауры ----------
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
       'crab': {'aura_bubbles': 'bubbles', 'aura_seabed': 'seabed'}, 'penguin': {'aura_snow': 'snow', 'aura_fish': 'fish'},
       'dragon': {'aura_embers': 'embers', 'aura_clouds': 'clouds'}, 'shrimp': {'aura_coral': 'coral', 'aura_jelly': 'jelly'}}
SOFT_OWN = {'embers', 'clouds', 'coral', 'jelly'}
FRONT = {'fireflies', 'feathers', 'fruit', 'butterflies', 'bubbles', 'snow', 'fish', 'leaves', 'embers', 'jelly'}


# slot — место в базе (aura), layer — слой: aura позади питомца, front — перед ним
PET_AURA_ART = {}
# Общие ауры — в два слоя: свечение позади (art), частицы перед питомцем (front)
for code, which in GEN_AURAS.items():
    PET_AURA_ART[code] = {'slot': 'aura', 'layer': 'aura', 'pet': None, 'art': {k: soft_back(k, which) for k in KINDS},
                          'front': {k: soft_front(k, which) for k in KINDS}}
for k, own in OWN.items():
    for code, which in own.items(): PET_AURA_ART[code] = {'slot': 'aura', 'layer': 'front' if which in FRONT else 'aura', 'pet': k,
                                                     'art': {k: (soft_own if which in SOFT_OWN else own_aura)(k, which)}}

if OUT:
    for code, A in PET_AURA_ART.items():
        for k, v in A['art'].items():
            open(os.path.join(OUT, code + '_' + k + '.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' + v + '</svg>')
with open(os.path.join(ROOT, 'js', 'pet-art.js'), 'w', encoding='utf-8') as f:
    f.write('// Ауры питомцев. Собирает tools/pets/pets.py — правьте там, не здесь.\n'
            '// PET_AURA_ART — место (slot), слой (layer: aura — позади питомца, front — перед), чья (pet) и рисунок по питомцам\n')
    f.write('const PET_AURA_ART = ' + json.dumps(PET_AURA_ART, ensure_ascii=False) + ';\n')
print('аур', len(PET_AURA_ART))
