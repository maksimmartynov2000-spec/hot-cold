# Питомцы — герои Приключения: Барсук Очкарик, Филин Монокль, Тукан Панама,
# Хамелеон Очки, Краб Матрос, Пингвин Капитан. SVG 240×240, части — группами
# с классами pt-* для анимации (js/pets.js, стили — в styles.css). У каждого
# свой силуэт, характерная вещь, стихия, пять обликов (перекраска по группам
# цветов) и звёздный облик за 10-й уровень, две своих ауры и 1–2 вещи.
#   python3 tools/pets/pets.py            → js/pet-art.js
#   python3 tools/pets/pets.py --svg DIR  → ещё и отдельные .svg для просмотра
import os, sys, json, re, math, colorsys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[sys.argv.index('--svg') + 1] if '--svg' in sys.argv else None
if OUT: os.makedirs(OUT, exist_ok=True)

def mirror(path, cx=120):
    out = []; toks = path.replace(',', ' ').split(); i = 0
    while i < len(toks):
        t = toks[i]
        if t.isalpha(): out.append(t); i += 1; continue
        x = float(t); y = float(toks[i + 1]); out.append('%g %g' % (2 * cx - x, y)); i += 2
    return ' '.join(out)
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

class P:
    def __init__(self, key):
        self.k = key; self.defs = []; self.body = []
    def id(self, n): return self.k + '-' + n
    def stops(self, st): return ''.join('<stop offset="%s" stop-color="%s"%s/>' % (o, c, (' stop-opacity="%s"' % a) if a is not None else '') for o, c, a in st)
    def rg(self, n, st, cx='45%', cy='35%', r='70%'):
        self.defs.append('<radialGradient id="%s" cx="%s" cy="%s" r="%s">%s</radialGradient>' % (self.id(n), cx, cy, r, self.stops(st))); return 'url(#%s)' % self.id(n)
    def rgu(self, n, st, cx, cy, r):
        self.defs.append('<radialGradient id="%s" gradientUnits="userSpaceOnUse" cx="%g" cy="%g" r="%g">%s</radialGradient>' % (self.id(n), cx, cy, r, self.stops(st))); return 'url(#%s)' % self.id(n)
    def lg(self, n, st, x1=0, y1=0, x2=0, y2=1):
        self.defs.append('<linearGradient id="%s" x1="%s" y1="%s" x2="%s" y2="%s">%s</linearGradient>' % (self.id(n), x1, y1, x2, y2, self.stops(st))); return 'url(#%s)' % self.id(n)
    def clip(self, n, d):
        self.defs.append('<clipPath id="%s"><path d="%s"/></clipPath>' % (self.id(n), d)); return 'url(#%s)' % self.id(n)
    def add(self, *xs): self.body.extend(xs)
    def svg(self):
        return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" class="pet pet-%s">' % self.k +
                '<defs>%s</defs>%s</svg>' % (''.join(self.defs), ''.join(self.body)))

# ---------- глаз: миндаль или круглый ----------
def eye(p, cx, cy, w, h, tilt, side, iris, pupil, lidfill, ol, n, kind='slit', glow=None, shape='almond', sw=2.6, sclera=None):
    """Под обрезкой: белок/радужка, зрачок (pt-pupil смотрит, pt-pupil-size сужается),
    веко (pt-lid — поза, pt-lid-blink — моргание). Поверх — контур. Рядом — закрытый глаз дужкой"""
    if shape == 'round':
        r = w / 2
        shape_d = 'M %g %g A %g %g 0 1 1 %g %g A %g %g 0 1 1 %g %g Z' % (cx - r, cy, r, r, cx + r, cy, r, r, cx - r, cy)
        top = 'M %g %g A %g %g 0 0 1 %g %g' % (cx - r, cy, r, r, cx + r, cy)
        xo, yo, xi, yi = cx - side * r, cy, cx + side * r, cy
        lid = 'M %g %g L %g %g A %g %g 0 0 1 %g %g L %g %g Z' % (cx - r - 6, cy - 50, cx - r - 6, cy, r, r, cx + r, cy, cx + r + 6, cy - 50)
        lid = 'M %g %g L %g %g L %g %g A %g %g 0 0 1 %g %g L %g %g L %g %g Z' % (cx - r - 6, cy - 50, cx - r - 6, cy, cx - r, cy, r, r, cx + r, cy, cx + r + 6, cy, cx + r + 6, cy - 50)
        edge = top
        sh = 'M %g %g C %g %g %g %g %g %g' % (cx - r, cy + 2, cx - r * .5, cy - r * .7, cx + r * .5, cy - r * .7, cx + r, cy + 2)
    else:
        xo = cx - side * w / 2; xi = cx + side * w / 2
        yo = cy - tilt; yi = cy + 2
        top = 'M %g %g C %g %g %g %g %g %g' % (xo, yo, xo + side * w * .22, yo - h * .95, xi - side * w * .34, yi - h * .9, xi, yi)
        bot = 'C %g %g %g %g %g %g Z' % (xi - side * w * .3, yi + h * .62, xo + side * w * .25, yo + h * .58, xo, yo)
        shape_d = top + ' ' + bot
        lid = 'M %g %g L %g %g ' % (xo - side * 6, yo - 40, xo - side * 6, yo) + top.replace('M', 'L', 1) + ' L %g %g L %g %g Z' % (xi + side * 6, yi, xi + side * 6, yo - 40)
        edge = top
        sh = 'M %g %g C %g %g %g %g %g %g' % (xo, yo + h * .35, xo + side * w * .25, yo - h * .45, xi - side * w * .3, yi - h * .45, xi, yi + h * .2)
    clip = p.clip('eye' + n, shape_d)
    s = g('pt-eye ' + ('l' if side > 0 else 'r'), (cx, cy))
    s += g('pt-eye-open')
    s += '<g clip-path="%s">' % clip
    if glow: s += ell(cx, cy, w * .7, h * .8, glow)
    s += path(shape_d, sclera or iris)
    if sclera:   # радужка кругом на белке
        s += circ(cx, cy + 1, min(w, h) * .36, iris)
    s += ell(cx, cy + 1, w * .3, h * .62, pupil, extra=' opacity=".35"') if not sclera else ''
    s += g('pt-pupil', (cx, cy)) + g('pt-pupil-size', (cx, cy + 1))
    if kind == 'slit': s += ell(cx, cy + 1, 2.1, h * .5, pupil)
    else: s += circ(cx, cy + 1, h * .36 if not sclera else min(w, h) * .2, pupil)
    s += '</g>' + circ(cx - side * 3.5, cy - h * .25, 2.1, '#fff') + circ(cx + side * 3, cy + h * .3, 1.1, '#fff', extra=' opacity=".85"') + '</g>'
    s += g('pt-lid', (xi, yi)) + g('pt-lid-blink') + path(lid, lidfill) + path(edge, 'none', ol, sw) + '</g></g>'
    s += '</g>'
    s += path(shape_d, 'none', ol, sw)
    s += '</g>'
    s += g('pt-eye-shut') + path(sh, 'none', ol, 3) + '</g>'
    s += '</g>'
    return s

def brow(d, ol, side, origin, w=3.6):
    return g('pt-brow ' + ('l' if side > 0 else 'r'), origin) + path(d, 'none', ol, w) + '</g>'

def mouths(cx, cy, w, ol, inner, tongue, smile, teeth=True):
    """Шесть ртов: smile (покой), happy, sad, o, grin, chatter"""
    s = g('pt-m pt-m-smile') + smile + '</g>'
    hw = w / 2
    s += g('pt-m pt-m-happy', (cx, cy)) + path('M %g %g Q %g %g %g %g C %g %g %g %g %g %g Z' % (cx - hw, cy - 1, cx, cy + 1, cx + hw, cy - 1, cx + hw * .9, cy + w * .55, cx - hw * .9, cy + w * .55, cx - hw, cy - 1), inner, ol, 2.4) + \
         path('M %g %g C %g %g %g %g %g %g Z' % (cx - hw * .5, cy + w * .3, cx - hw * .3, cy + w * .18, cx + hw * .3, cy + w * .18, cx + hw * .5, cy + w * .3), tongue) + \
         (path('M %g %g L %g %g L %g %g Z M %g %g L %g %g L %g %g Z' % (cx - hw * .8, cy, cx - hw * .65, cy + 5, cx - hw * .5, cy, cx + hw * .8, cy, cx + hw * .65, cy + 5, cx + hw * .5, cy), '#fff') if teeth else '') + '</g>'
    s += g('pt-m pt-m-sad') + path('M %g %g Q %g %g %g %g' % (cx - hw * .8, cy + 4, cx, cy - 4, cx + hw * .8, cy + 4), 'none', ol, 2.6) + '</g>'
    s += g('pt-m pt-m-o', (cx, cy + 3)) + ell(cx, cy + 4, hw * .42, hw * .55, inner, ol, 2.4) + ell(cx, cy + 7, hw * .25, hw * .18, tongue) + '</g>'
    teeth_top = ' '.join('L %g %g L %g %g' % (cx - hw + (k + .5) * (w / 5), cy + 4, cx - hw + (k + 1) * (w / 5), cy - 1) for k in range(5))
    teeth_bot = ' '.join('L %g %g L %g %g' % (cx + hw - (k + .5) * (w / 5), cy + w * .42, cx + hw - (k + 1) * (w / 5), cy + w * .52) for k in range(5))
    s += g('pt-m pt-m-grin', (cx, cy)) + path('M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g Z' % (cx - hw, cy - 2, cx - hw * .6, cy - 5, cx + hw * .6, cy - 5, cx + hw, cy - 2, cx + hw * .9, cy + w * .62, cx - hw * .9, cy + w * .62, cx - hw, cy - 2), inner, ol, 2.4) + \
         (path('M %g %g %s Z' % (cx - hw, cy - 1, teeth_top), '#fff') + path('M %g %g %s Z' % (cx + hw, cy + w * .52, teeth_bot), '#fff') if teeth else path('M %g %g C %g %g %g %g %g %g Z' % (cx - hw * .5, cy + w * .4, cx - hw * .3, cy + w * .25, cx + hw * .3, cy + w * .25, cx + hw * .5, cy + w * .4), tongue)) + '</g>'
    s += g('pt-m pt-m-chatter', (cx, cy)) + '<rect x="%g" y="%g" width="%g" height="7" rx="3" fill="#fff" stroke="%s" stroke-width="2.2"/>' % (cx - hw * .6, cy, w * .6, ol) + \
         ''.join('<line x1="%g" y1="%g" x2="%g" y2="%g" stroke="%s" stroke-width="1.4"/>' % (cx - hw * .6 + k * (w * .6 / 4), cy + 1, cx - hw * .6 + k * (w * .6 / 4), cy + 6, ol) for k in range(1, 4)) + '</g>'
    return s

def beak(cx, cy, w, h, top, bot, ol, inner='#5a1030', tongue='#ff6b8a', hinge=None):
    """Клюв: верхняя половина на месте, нижняя (pt-beak-low) открывается. Шесть состояний
    теми же классами, что рты: smile — закрыт, happy — открыт, sad — опущен, o — приоткрыт,
    grin — распахнут, chatter — дрожит приоткрытым"""
    hw = w / 2
    up = 'M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g Z' % (cx - hw, cy, cx - hw * .6, cy - h * .9, cx + hw * .6, cy - h * .9, cx + hw, cy, cx + hw * .5, cy + h * .25, cx - hw * .5, cy + h * .25, cx - hw, cy)
    low = lambda d: 'M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g Z' % (cx - hw * .9, cy, cx - hw * .5, cy + h * .9 + d, cx + hw * .5, cy + h * .9 + d, cx + hw * .9, cy, cx + hw * .4, cy + h * .22, cx - hw * .4, cy + h * .22, cx - hw * .9, cy)
    mouth = lambda d: path('M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g Z' % (cx - hw * .85, cy, cx - hw * .4, cy + h * .25 + d * .9, cx + hw * .4, cy + h * .25 + d * .9, cx + hw * .85, cy, cx + hw * .4, cy + h * .22, cx - hw * .4, cy + h * .22, cx - hw * .85, cy), inner) + \
                      ell(cx, cy + h * .22 + d * .55, hw * .35, d * .22 + 1, tongue)
    def state(cls, d, rot=0, dy=0):
        s = g('pt-m ' + cls, (cx, cy))
        if d > 0: s += mouth(d)
        s += path(up, top, ol, 2.4)
        s += '<g style="transform-origin:%gpx %gpx;transform:rotate(%gdeg) translateY(%gpx)">' % (cx, cy, rot, dy) + path(low(0), bot, ol, 2.4) + '</g>'
        s += path('M %g %g C %g %g %g %g %g %g' % (cx - hw * .7, cy - h * .3, cx - hw * .3, cy - h * .5, cx + hw * .1, cy - h * .5, cx + hw * .3, cy - h * .35), 'none', '#fff', 2, ' opacity=".55"')
        return s + '</g>'
    return state('pt-m-smile', 0) + state('pt-m-happy', h * .7, 0, h * .55) + state('pt-m-sad', 0, 0, 1) + state('pt-m-o', h * .35, 0, h * .3) + \
           state('pt-m-grin', h * 1.05, 0, h * .9) + state('pt-m-chatter', h * .2, 0, h * .18)

def shadow(cx=120, cy=222, rx=60, ry=8):
    return ell(cx, cy, rx, ry, '#000', extra=' opacity=".3" class="pt-shadow" style="transform-origin:%gpx %gpx"' % (cx, cy))
def cheer(color, pts):
    return g('pt-cheer') + ''.join('<path d="M %g %g l 2.2 5.2 l 5.4 .6 l -4 3.8 l 1.2 5.4 l -4.8 -2.8 l -4.8 2.8 l 1.2 -5.4 l -4 -3.8 l 5.4 -.6 Z" fill="%s" style="animation-delay:%gs"/>' % (x, y, color, d) for x, y, d in pts) + '</g>'
def zzz(x, y, color):
    z = lambda X, Y, k: path('M %g %g L %g %g L %g %g L %g %g' % (X, Y, X + 6 * k, Y, X, Y + 6 * k, X + 6 * k, Y + 6 * k), 'none', color, 2.2 * k)
    return g('pt-zzz') + ''.join('<g style="animation-delay:%gs">%s</g>' % (d, z(x + dx, y + dy, k)) for dx, dy, k, d in [(0, 0, .8, 0), (8, -10, 1, .5), (18, -22, 1.25, 1)]) + '</g>'
def start(p, sh):
    p.add(sh, g('pt-all', (120, 218)), g('pt-flip', (120, 150)), '<g class="pt-gear-aura"></g>')
def finish(p, cheer_color, cheer_pts, zz):
    p.add(cheer(cheer_color, cheer_pts), zzz(zz[0], zz[1], zz[2]), '<g class="pt-skin-fx"></g>', '<g class="pt-gear-front"></g>', '</g>', '</g>')
    return p.svg()
GOL = 'stroke="#1b1030" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"'

# ===================== БАРСУК ОЧКАРИК =====================
p = P('badger'); OL = '#1c1a2e'
fur = p.rgu('fur', [(0, '#a7aec2', None), (.55, '#6b7390', None), (1, '#444a63', None)], 104, 90, 150)
furB = p.rg('furb', [(0, '#9aa2b8', None), (.6, '#6b7390', None), (1, '#444a63', None)], cx='40%', cy='25%', r='80%')
white = p.rgu('white', [(0, '#ffffff', None), (.6, '#eef0f6', None), (1, '#cfd4e3', None)], 110, 70, 90)
stripe = p.rgu('stripe', [(0, '#3a3650', None), (1, '#1c1a2e', None)], 104, 86, 60)
belly = p.rg('belly', [(0, '#d9dde8', None), (1, '#aab0c4', None)], cx='50%', cy='30%', r='80%')
dark = p.lg('dark', [(0, '#3a3650', None), (1, '#1c1a2e', None)])
eyeG = p.rg('eye', [(0, '#e8f0ff', None), (.5, '#8fb4ff', None), (1, '#2e6bd6', None)], cx='50%', cy='40%', r='65%')
glow = p.rg('glow', [(0, '#b7f0a6', .45), (1, '#4caf50', 0)], cx='50%', cy='50%', r='50%')
gold = p.lg('gold', [(0, '#ffe08a', None), (1, '#d9a21b', None)])
start(p, shadow(120, 222, 62, 8))
p.add(ell(120, 140, 110, 92, glow, extra=' class="pt-glow" style="transform-origin:120px 140px"'))
# Хвост: короткий пушистый справа
p.add(g('pt-tail-pose', (150, 200)), g('pt-tail', (150, 200)), path('M 148 206 C 166 206 182 196 184 180 L 176 184 L 180 172 L 170 178 L 172 166 L 160 176 C 154 186 150 196 148 206 Z', furB, OL, 3),
      path('M 160 196 C 170 194 176 186 178 178', 'none', '#c8cedf', 2.2, ' opacity=".7"'), g('pt-tail-tip', (176, 180)), '</g>', '</g>', '</g>')
p.add('<g class="pt-gear-back"></g>')
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    p.add(path('M %g 178 C %g 160 %g 160 %g 180 C %g 198 %g 212 %g 214 L %g 214 Z' % (X(106), X(92), X(70), X(63), X(58), X(70), X(88), X(108)), furB, OL, 3),
          path('M %g 184 C %g 172 %g 170 %g 176' % (X(70), X(74), X(84), X(92)), 'none', '#c8cedf', 2.4, ' opacity=".6"'),
          path('M %g 214 C %g 206 %g 203 %g 205 C %g 207 %g 213 %g 216 C %g 219 %g 219 %g 214 Z' % (X(60), X(61), X(72), X(84), X(92), X(95), X(91), X(80), X(64), X(60)), dark, OL, 2.6))
p.add(g('pt-body', (120, 216)))
p.add(path('M 96 118 C 86 134 84 152 88 170 C 94 192 104 210 120 214 C 136 210 146 192 152 170 C 156 152 154 134 144 118 Z', furB, OL, 3),
      path('M 103 118 C 98 134 100 152 106 166 C 112 174 128 174 134 166 C 140 152 142 134 137 118 Z', belly, OL, 2.4),
      ell(120, 122, 20, 6, OL, extra=' opacity=".18"'))
# Передние лапы с когтями (копает)
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    p.add(path('M %g 148 C %g 172 %g 196 %g 214 L %g 214 C %g 196 %g 172 %g 148 Z' % (X(100), X(99), X(101), X(102), X(116), X(116), X(117), X(116)), furB, OL, 2.6),
          path('M %g 213 C %g 207 %g 206 %g 209 C %g 211 %g 217 %g 219 C %g 220 %g 220 %g 213 Z' % (X(97), X(101), X(116), X(121), X(123), X(122), X(118), X(108), X(99), X(97)), dark, OL, 2.4),
          ''.join(path('M %g 219 l %g 7 l %g -1' % (X(102 + k * 6), 1.2 * side, 2.2 * side), '#e9e3d0', OL, 1.3) for k in range(3)))
p.add('<g class="pt-gear-neck"></g>')
p.add(g('pt-head-pose', (120, 128)), g('pt-head', (120, 128)))
for side in (1, -1):
    cls = 'l' if side > 0 else 'r'; ex = 92 if side > 0 else 148
    p.add(g('pt-ear-pose ' + cls, (ex, 62)), g('pt-ear ' + cls, (ex, 62)), circ(ex, 56, 10, furB, OL, 3), circ(ex, 57, 5, '#d9dde8', extra=' opacity=".8"'), '</g>', '</g>')
head = 'M 120 50 C 148 50 166 68 166 92 C 166 114 146 130 120 132 C 94 130 74 114 74 92 C 74 68 92 50 120 50 Z'
p.add(path(head, white, OL, 3))
for side in (1, -1):
    st = 'M 96 54 C 88 74 88 98 98 122 L 112 124 C 108 100 108 76 113 56 Z'
    if side < 0: st = mirror(st)
    p.add(path(st, stripe))
p.add(path('M 82 76 C 88 62 100 54 112 52', 'none', '#ffffff', 2.6, ' opacity=".7"'), '<g class="pt-gear-hair"></g>')
p.add(g('pt-eyes'), eye(p, 104, 90, 22, 16, 2, 1, eyeG, '#0f2050', stripe, OL, 'L', 'round'), eye(p, 136, 90, 22, 16, 2, -1, eyeG, '#0f2050', stripe, OL, 'R', 'round'), '</g>')
p.add(brow('M 91 76 Q 103 71 115 77', OL, 1, (91, 76), 3.2), brow('M 149 76 Q 137 71 125 77', OL, -1, (149, 76), 3.2))
# Очки — характерная вещь (pt-sig): круглые, золотая оправа, блик
p.add(g('pt-sig pt-glasses', (120, 92)), circ(104, 91, 15, 'none', '#1b1030', 5), circ(136, 91, 15, 'none', '#1b1030', 5), circ(104, 91, 15, 'none', gold, 2.6), circ(136, 91, 15, 'none', gold, 2.6),
      path('M 119 90 Q 120 86 121 90', 'none', gold, 2.6), path('M 89 90 L 78 86 M 151 90 L 162 86', 'none', gold, 2.6),
      circ(104, 91, 14.2, '#dff4ff', extra=' opacity=".14" class="pt-lens"'), circ(136, 91, 14.2, '#dff4ff', extra=' opacity=".14" class="pt-lens"'),
      g('pt-glint'), path('M 95 84 L 101 78 M 127 84 L 133 78', 'none', '#ffffff', 2.6, ' opacity=".9"'), '</g>', '</g>')
p.add(ell(120, 113, 7.5, 5, '#1c1a2e', OL, 2), ell(117.5, 111.5, 2.4, 1.3, '#fff', extra=' opacity=".6"'))
smile = path('M 112 122 Q 120 128 128 122', 'none', OL, 2.4)
p.add(mouths(120, 121, 22, OL, '#4a1430', '#ff6b8a', smile))
p.add('<g class="pt-gear-eyes"></g>', '<g class="pt-gear-head"></g>', '</g>', '</g>')
p.add('</g>')
# Листья кружат (покой) и комья земли (раскопки)
p.add(g('pt-fx', (120, 120)), ''.join(path('M %g %g c 6 -8 14 -8 16 0 c -2 8 -10 10 -16 0 Z' % (x, y), c, OL, 1.4) for x, y, c in [(34, 70, '#6cc24a'), (200, 60, '#f5a623'), (28, 160, '#8bd16b')]), '</g>')
p.add(g('pt-dirt'), ''.join('<ellipse class="pt-clod" cx="%g" cy="%g" rx="%g" ry="%g" fill="#6b4a2b" stroke="%s" stroke-width="1.6" style="animation-delay:%gs;--dx:%gpx"/>' % (x, y, r, r * .7, OL, d, dx) for x, y, r, d, dx in [(84, 206, 6, 0, -22), (104, 210, 4.5, .08, -8), (140, 208, 5, .04, 10), (160, 206, 4, .12, 24), (120, 212, 3.5, .16, 0)]), '</g>')
BADGER = finish(p, '#8bd16b', [(30, 60, 0), (200, 50, .15), (24, 150, .3), (210, 140, .1), (120, 20, .25)], (168, 52, '#d9dde8'))

# ===================== ФИЛИН МОНОКЛЬ =====================
p = P('owl'); OL = '#2b1608'
fe = p.rgu('fe', [(0, '#d8995a', None), (.55, '#a8672f', None), (1, '#6e3f18', None)], 110, 90, 150)
feB = p.rg('feb', [(0, '#c98a4c', None), (.6, '#a8672f', None), (1, '#6e3f18', None)], cx='40%', cy='25%', r='80%')
disc = p.rgu('disc', [(0, '#fff1d2', None), (.7, '#f3d4a0', None), (1, '#dcb376', None)], 118, 86, 70)
bellyG = p.rg('belly', [(0, '#f6dfb4', None), (1, '#d8aa6e', None)], cx='50%', cy='20%', r='85%')
wingG = p.lg('wing', [(0, '#8d5225', None), (1, '#5a3110', None)])
eyeG = p.rg('eye', [(0, '#fff6c4', None), (.45, '#ffc53a', None), (1, '#e06a00', None)], cx='50%', cy='40%', r='65%')
glow = p.rg('glow', [(0, '#c9b4ff', .45), (1, '#7c5cff', 0)], cx='50%', cy='50%', r='50%')
gold = p.lg('gold', [(0, '#ffe08a', None), (1, '#d9a21b', None)])
start(p, shadow(120, 222, 56, 8))
p.add(ell(120, 140, 108, 94, glow, extra=' class="pt-glow" style="transform-origin:120px 140px"'))
p.add(g('pt-tail-pose', (120, 206)), g('pt-tail', (120, 206)), path('M 96 196 L 86 222 L 102 216 L 110 226 L 120 212 L 130 226 L 138 216 L 154 222 L 144 196 Z', feB, OL, 2.6), g('pt-tail-tip'), '</g>', '</g>', '</g>')
p.add('<g class="pt-gear-back"></g>')
p.add(g('pt-body', (120, 216)))
body = 'M 120 62 C 158 62 178 98 178 150 C 178 196 154 216 120 216 C 86 216 62 196 62 150 C 62 98 82 62 120 62 Z'
p.add(path(body, feB, OL, 3), path('M 120 128 C 146 128 158 150 156 178 C 154 200 140 212 120 212 C 100 212 86 200 84 178 C 82 150 94 128 120 128 Z', bellyG, OL, 2.2))
for y in (150, 166, 182, 198):
    p.add(''.join(path('M %g %g q 7 -7 14 0' % (x, y), 'none', '#c9924f', 1.8, ' opacity=".8"') for x in range(96, 140, 14)))
p.add(path('M 72 110 C 68 136 68 170 76 196', 'none', '#f0c48a', 2.6, ' opacity=".5"'))
# Крылья (pt-wing) вдоль боков
for side in (1, -1):
    cls = 'l' if side > 0 else 'r'; wx = 76 if side > 0 else 164
    wing = 'M 76 112 C 58 132 52 170 66 204 C 80 200 90 180 90 150 C 90 132 86 118 76 112 Z'
    hl = 'M 70 130 C 62 150 62 176 70 196'
    if side < 0: wing, hl = mirror(wing), mirror(hl)
    p.add(g('pt-wing-pose ' + cls, (wx, 114)), g('pt-wing ' + cls, (wx, 114)), path(wing, wingG, OL, 2.8), path(hl, 'none', '#c98a4c', 2, ' opacity=".6"'), '</g>', '</g>')
p.add('<g class="pt-gear-neck"></g>')
p.add(g('pt-head-pose', (120, 120)), g('pt-head', (120, 120)))
for side in (1, -1):
    cls = 'l' if side > 0 else 'r'; ex = 92 if side > 0 else 148
    tuft = 'M 80 76 C 78 60 80 44 86 28 C 96 42 104 56 106 72 Z'
    if side < 0: tuft = mirror(tuft)
    p.add(g('pt-ear-pose ' + cls, (ex, 74)), g('pt-ear ' + cls, (ex, 74)), path(tuft, feB, OL, 2.8), '</g>', '</g>')
p.add(path('M 120 60 C 152 60 168 84 166 112 C 164 134 144 146 120 148 C 96 146 76 134 74 112 C 72 84 88 60 120 60 Z', disc, OL, 3),
      path('M 120 64 C 104 80 96 100 100 128 M 120 64 C 136 80 144 100 140 128', 'none', '#e0b77a', 2.2, ' opacity=".7"'),
      path('M 86 86 C 92 72 104 64 116 62', 'none', '#ffffff', 2.6, ' opacity=".6"'), '<g class="pt-gear-hair"></g>')
p.add(g('pt-eyes'), eye(p, 100, 100, 30, 28, 0, 1, eyeG, '#2b1608', disc, OL, 'L', 'round', None, 'round', 2.8), eye(p, 140, 100, 30, 28, 0, -1, eyeG, '#2b1608', disc, OL, 'R', 'round', None, 'round', 2.8), '</g>')
p.add(brow('M 84 80 Q 100 72 116 82', OL, 1, (84, 80), 4), brow('M 156 80 Q 140 72 124 82', OL, -1, (156, 80), 4))
# Монокль на правом глазу (справа для зрителя) с цепочкой
p.add(g('pt-sig pt-monocle', (140, 100)), circ(140, 100, 18, 'none', '#1b1030', 5), circ(140, 100, 18, 'none', gold, 3), circ(140, 100, 17, '#bfe3ff', extra=' opacity=".12"'),
      path('M 156 110 C 162 120 166 134 164 150', 'none', gold, 2, ' stroke-dasharray="3 2.5"'), g('pt-glint'), path('M 130 92 L 137 85', 'none', '#fff', 2.6, ' opacity=".9"'), '</g>', '</g>')
p.add(beak(120, 118, 18, 16, '#f2a93b', '#d98c1e', OL, '#4a1430', '#ff6b8a'))
p.add('<g class="pt-gear-eyes"></g>', '<g class="pt-gear-head"></g>', '</g>', '</g>')
p.add('</g>')
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    p.add(path('M %g 214 C %g 206 %g 206 %g 214 Z' % (X(90), X(94), X(112), X(116)), '#f2a93b', OL, 2.2),
          ''.join(path('M %g 214 l %g 7' % (X(94 + k * 7), 1 * side), 'none', OL, 2.2) for k in range(3)))
p.add(g('pt-fx', (120, 110)), ''.join(path('M %g %g c 4 -10 10 -12 12 -4 c -2 8 -8 12 -12 4 Z' % (x, y), c, OL, 1.4) for x, y, c in [(32, 80, '#d8995a'), (204, 70, '#f3d4a0'), (30, 170, '#a8672f')]), '</g>')
# «Ух!» — круги звука от клюва
p.add(g('pt-hoot', (120, 126)), ''.join('<circle class="pt-ring" cx="120" cy="126" r="%g" fill="none" stroke="#c9b4ff" stroke-width="3" style="animation-delay:%gs"/>' % (r, d) for r, d in [(10, 0), (10, .25), (10, .5)]), '</g>')
OWL = finish(p, '#f3d4a0', [(30, 50, 0), (206, 46, .15), (22, 150, .3), (214, 140, .1), (120, 16, .25)], (172, 48, '#f3d4a0'))

# ===================== ТУКАН ПАНАМА =====================
p = P('toucan'); OL = '#0e1420'
blk = p.rgu('blk', [(0, '#4a5570', None), (.5, '#242b44', None), (1, '#0e1420', None)], 110, 90, 150)
blkB = p.rg('blkb', [(0, '#3d4660', None), (.6, '#242b44', None), (1, '#0e1420', None)], cx='40%', cy='25%', r='80%')
bib = p.rg('bib', [(0, '#fff4b0', None), (.6, '#ffd23a', None), (1, '#f5a623', None)], cx='50%', cy='20%', r='85%')
beakG = p.lg('beak', [(0, '#ffb41f', None), (.55, '#ff8a1a', None), (1, '#e8344a', None)], 0, 0, 1, 1)
beakL = p.lg('beakl', [(0, '#ffcf3a', None), (1, '#ff7a1a', None)], 0, 0, 1, 1)
face = p.rgu('face', [(0, '#ffffff', None), (1, '#dfe8f5', None)], 112, 92, 50)
eyeG = p.rg('eye', [(0, '#e8f6ff', None), (.5, '#6fd0ff', None), (1, '#1f7ae8', None)], cx='50%', cy='40%', r='65%')
glow = p.rg('glow', [(0, '#7ef0a0', .45), (1, '#1fc1b0', 0)], cx='50%', cy='50%', r='50%')
hatG = p.rg('hat', [(0, '#f6e4b8', None), (1, '#d2b680', None)], cx='45%', cy='25%', r='80%')
start(p, shadow(120, 222, 54, 8))
p.add(ell(120, 140, 108, 94, glow, extra=' class="pt-glow" style="transform-origin:120px 140px"'))
p.add(g('pt-tail-pose', (120, 206)), g('pt-tail', (120, 206)), path('M 100 196 L 92 226 L 108 218 L 120 230 L 132 218 L 148 226 L 140 196 Z', '#e8344a', OL, 2.6), path('M 106 198 L 102 216 L 120 222 L 138 216 L 134 198 Z', blkB, OL, 2), g('pt-tail-tip'), '</g>', '</g>', '</g>')
p.add('<g class="pt-gear-back"></g>')
p.add(g('pt-body', (120, 216)))
p.add(path('M 120 118 C 154 118 172 146 172 182 C 172 206 152 216 120 216 C 88 216 68 206 68 182 C 68 146 86 118 120 118 Z', blkB, OL, 3),
      path('M 98 126 C 108 150 132 150 142 126 C 152 156 142 192 120 198 C 98 192 88 156 98 126 Z', bib, OL, 2.4),
      path('M 74 150 C 70 166 70 186 76 202', 'none', '#6f7da0', 2.6, ' opacity=".5"'))
for side in (1, -1):
    cls = 'l' if side > 0 else 'r'; wx = 78 if side > 0 else 162
    wing = 'M 80 132 C 62 150 58 180 70 206 C 84 202 92 184 92 160 C 92 146 88 136 80 132 Z'
    hl = 'M 74 150 C 68 168 68 186 74 200'
    if side < 0: wing, hl = mirror(wing), mirror(hl)
    p.add(g('pt-wing-pose ' + cls, (wx, 134)), g('pt-wing ' + cls, (wx, 134)), path(wing, blkB, OL, 2.8), path(hl, 'none', '#5fa8ff', 2, ' opacity=".5"'), '</g>', '</g>')
p.add('<g class="pt-gear-neck"></g>')
p.add(g('pt-head-pose', (120, 118)), g('pt-head', (120, 118)))
p.add(path('M 120 54 C 148 54 162 72 162 96 C 162 112 150 124 134 128 L 106 128 C 90 124 78 112 78 96 C 78 72 92 54 120 54 Z', blk, OL, 3),
      path('M 120 66 C 140 66 150 80 150 96 C 150 110 140 118 128 120 L 112 120 C 100 118 90 110 90 96 C 90 80 100 66 120 66 Z', face, OL, 2.2),
      path('M 86 78 C 92 66 104 58 116 56', 'none', '#8fa3c8', 2.6, ' opacity=".5"'), '<g class="pt-gear-hair"></g>')
p.add(g('pt-eyes'), eye(p, 106, 94, 20, 16, 2, 1, eyeG, '#0a2a5a', face, OL, 'L', 'round'), eye(p, 134, 94, 20, 16, 2, -1, eyeG, '#0a2a5a', face, OL, 'R', 'round'), '</g>')
p.add(circ(106, 94, 12.5, 'none', '#38bdf8', 2.2, ' opacity=".9"'), circ(134, 94, 12.5, 'none', '#38bdf8', 2.2, ' opacity=".9"'))
p.add(brow('M 95 80 Q 106 76 117 82', OL, 1, (95, 80), 3.2), brow('M 145 80 Q 134 76 123 82', OL, -1, (145, 80), 3.2))
# Клюв — большой клин вниз, цветной; нижняя половина открывается
p.add(g('pt-beak', (120, 110)))
beak_up = 'M 96 108 C 104 102 136 102 144 108 C 150 122 146 142 134 150 L 106 150 C 94 142 90 122 96 108 Z'
beak_low = 'M 106 150 L 134 150 C 132 162 126 170 120 172 C 114 170 108 162 106 150 Z'
def tbeak(cls, d):
    s = g('pt-m ' + cls, (120, 150))
    if d > 0: s += path('M 106 150 L 134 150 C 132 %g 126 %g 120 %g C 114 %g 108 %g 106 150 Z' % (150 + d, 152 + d, 153 + d, 152 + d, 150 + d), '#4a1430', OL, 2) + ell(120, 150 + d * .6, 6, 2 + d * .15, '#ff6b8a')
    s += path(beak_up, beakG, OL, 2.8) + path('M 104 112 C 110 108 130 108 136 112', 'none', '#fff', 2, ' opacity=".5"') + path('M 100 118 L 104 124 L 108 118 M 132 118 L 136 124 L 140 118', 'none', OL, 1.4)
    s += '<g style="transform-origin:120px 150px;transform:translateY(%gpx)">' % d + path(beak_low, beakL, OL, 2.6) + '</g>'
    return s + '</g>'
p.add(tbeak('pt-m-smile', 0), tbeak('pt-m-happy', 12), tbeak('pt-m-sad', 0), tbeak('pt-m-o', 6), tbeak('pt-m-grin', 18), tbeak('pt-m-chatter', 3), '</g>')
# Пробковый шлем — характерная вещь
p.add(g('pt-sig pt-hat', (120, 56)), path('M 70 62 C 80 56 160 56 170 62 C 164 70 76 70 70 62 Z', hatG, OL, 2.6),
      path('M 86 60 C 86 40 100 28 120 28 C 140 28 154 40 154 60 Z', hatG, OL, 2.6), path('M 88 54 C 94 52 146 52 152 54 L 152 60 L 88 60 Z', '#6b5a3a', OL, 1.8),
      path('M 120 30 C 112 34 104 44 102 54 M 120 30 C 128 34 136 44 138 54', 'none', '#b89a62', 1.8), ell(120, 30, 5, 2.4, '#d2b680', OL, 1.6), '</g>')
p.add('<g class="pt-gear-eyes"></g>', '<g class="pt-gear-head"></g>', '</g>', '</g>')
p.add('</g>')
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    p.add(path('M %g 214 C %g 206 %g 206 %g 214 Z' % (X(92), X(96), X(112), X(116)), '#6f8fb8', OL, 2.2), ''.join(path('M %g 214 l %g 7' % (X(96 + k * 7), 1 * side), 'none', OL, 2.2) for k in range(3)))
p.add(g('pt-fx', (120, 110)), ''.join(path('M %g %g c 8 -10 18 -8 20 2 c -4 8 -14 10 -20 -2 Z' % (x, y), c, OL, 1.4) for x, y, c in [(28, 72, '#2ecc71'), (196, 58, '#1fc1b0'), (26, 162, '#f5a623')]), '</g>')
p.add(g('pt-hoot', (150, 128)), ''.join(path('M %g %g A %g %g 0 0 1 %g %g' % (146 + k * 10, 110 - k * 7, 10 + k * 8, 10 + k * 8, 146 + k * 10, 146 + k * 7), 'none', '#ffd23a', 3, ' class="pt-ring" style="animation-delay:%gs"' % (k * .18)) for k in range(3)), '</g>')
TOUCAN = finish(p, '#ffd23a', [(28, 50, 0), (204, 40, .15), (22, 150, .3), (214, 140, .1), (120, 12, .25)], (172, 50, '#ffd23a'))

# ===================== ХАМЕЛЕОН ОЧКИ =====================
p = P('cham'); OL = '#143a1a'
sk = p.rgu('sk', [(0, '#b9f06a', None), (.5, '#5fc84a', None), (1, '#2e8a3a', None)], 110, 96, 150)
skB = p.rg('skb', [(0, '#a4e85a', None), (.6, '#5fc84a', None), (1, '#2e8a3a', None)], cx='40%', cy='25%', r='80%')
bellyG = p.lg('belly', [(0, '#f1ffb8', None), (1, '#bfe47a', None)])
band = p.lg('band', [(0, '#2ecc71', None), (1, '#1f8a4a', None)])
eyeG = p.rg('eye', [(0, '#fff9c4', None), (.5, '#ffd23a', None), (1, '#e8742a', None)], cx='50%', cy='40%', r='65%')
glow = p.rg('glow', [(0, '#f6ff9a', .4), (1, '#8ef06a', 0)], cx='50%', cy='50%', r='50%')
branch = p.lg('branch', [(0, '#8a5a2b', None), (1, '#5a3614', None)])
start(p, shadow(120, 222, 70, 7))
p.add(ell(120, 140, 108, 92, glow, extra=' class="pt-glow" style="transform-origin:120px 140px"'))
# Ветка
p.add(path('M 14 212 C 50 200 190 200 226 212', 'none', OL, 16), path('M 14 212 C 50 200 190 200 226 212', 'none', branch, 11),
      path('M 40 206 C 70 200 160 200 200 206', 'none', '#b07a46', 2, ' opacity=".6"'),
      path('M 48 202 c -6 -14 4 -22 14 -16 c 2 10 -6 18 -14 16 Z', '#5fc84a', OL, 1.6), path('M 184 203 c 6 -14 -4 -22 -14 -16 c -2 10 6 18 14 16 Z', '#8bd16b', OL, 1.6))
# Хвост-спираль справа
p.add(g('pt-tail-pose', (150, 196)), g('pt-tail', (150, 196)), path('M 150 196 C 184 200 206 180 200 158 C 196 142 178 140 172 152 C 168 160 176 168 184 164', 'none', OL, 15),
      path('M 150 196 C 184 200 206 180 200 158 C 196 142 178 140 172 152 C 168 160 176 168 184 164', 'none', '#5fc84a', 9.5),
      path('M 160 196 C 176 196 190 186 194 170', 'none', '#b9f06a', 2.4, ' opacity=".7"'), g('pt-tail-tip', (184, 164)), circ(184, 164, 4, '#2e8a3a'), '</g>', '</g>', '</g>')
p.add('<g class="pt-gear-back"></g>')
# Задние лапы-варежки на ветке
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    p.add(path('M %g 176 C %g 186 %g 198 %g 206 L %g 206 C %g 198 %g 188 %g 176 Z' % (X(86), X(78), X(72), X(70), X(92), X(94), X(96), X(100)), skB, OL, 2.6),
          path('M %g 206 C %g 200 %g 198 %g 206 C %g 214 %g 214 %g 206 Z' % (X(66), X(70), X(90), X(96), X(94), X(68), X(66)), band, OL, 2.2))
p.add(g('pt-color'))   # всё, что меняет цвет на «горячо» и «холодно»
p.add(g('pt-body', (120, 212)))
p.add(path('M 90 122 C 72 146 74 184 94 204 L 146 204 C 166 184 168 146 150 122 Z', skB, OL, 3),
      path('M 108 128 C 100 150 102 180 112 202 L 128 202 C 138 180 140 150 132 128 Z', bellyG, OL, 2.2),
      ''.join(path('M %g 134 C %g 156 %g 176 %g 198' % (x, x - 4, x - 4, x), 'none', '#2e8a3a', 4, ' opacity=".55"') for x in (90, 150)),
      ''.join(circ(x, y, 2.2, '#1f8a4a', extra=' opacity=".55"') for x, y in [(98, 150), (142, 150), (96, 172), (144, 172), (100, 190), (140, 190)]))
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    p.add(path('M %g 150 C %g 170 %g 190 %g 206 L %g 206 C %g 190 %g 170 %g 150 Z' % (X(100), X(96), X(94), X(94), X(112), X(112), X(112), X(112)), skB, OL, 2.6),
          path('M %g 206 C %g 200 %g 198 %g 206 C %g 214 %g 214 %g 206 Z' % (X(90), X(94), X(110), X(116), X(114), X(92), X(90)), band, OL, 2.2))
p.add('<g class="pt-gear-neck"></g>')
p.add(g('pt-head-pose', (120, 128)), g('pt-head', (120, 128)))
# Гребень-каска
p.add(path('M 100 62 C 104 44 112 32 120 24 C 128 32 136 44 140 62 Z', band, OL, 2.6), path('M 120 30 L 120 58', 'none', '#b9f06a', 2, ' opacity=".6"'))
head = 'M 120 50 C 146 50 160 70 160 92 C 160 114 142 128 120 130 C 98 128 80 114 80 92 C 80 70 94 50 120 50 Z'
p.add(path(head, sk, OL, 3), path('M 86 84 C 90 68 102 56 114 54', 'none', '#e4ffa8', 2.6, ' opacity=".6"'), '<g class="pt-gear-hair"></g>')
# Глаза-башенки: бугор + глаз внутри
p.add(circ(98, 86, 16, skB, OL, 2.6), circ(142, 86, 16, skB, OL, 2.6), ''.join(path('M %g %g a 16 16 0 0 1 %g %g' % (x, 86 - 16, 0, 0), 'none', '#2e8a3a', 1) for x in ()))
p.add(g('pt-eyes'), eye(p, 98, 86, 17, 17, 0, 1, eyeG, '#2b1a00', sk, OL, 'L', 'round', None, 'round', 2.4), eye(p, 142, 86, 17, 17, 0, -1, eyeG, '#2b1a00', sk, OL, 'R', 'round', None, 'round', 2.4), '</g>')
p.add(brow('M 86 70 Q 98 64 110 70', OL, 1, (86, 70), 3), brow('M 154 70 Q 142 64 130 70', OL, -1, (154, 70), 3))
# Солнечные очки — характерная вещь: цветная оправа, розовые стёкла
p.add(g('pt-sig pt-glasses', (120, 88)), path('M 78 82 C 80 72 118 74 118 84 C 118 100 84 102 78 82 Z', '#ff5c8a', None, 0, ' opacity=".3"'), path('M 162 82 C 160 72 122 74 122 84 C 122 100 156 102 162 82 Z', '#ff5c8a', None, 0, ' opacity=".3"'),
      path('M 78 82 C 80 72 118 74 118 84 C 118 100 84 102 78 82 Z M 162 82 C 160 72 122 74 122 84 C 122 100 156 102 162 82 Z', 'none', '#ff8a1a', 3.2), path('M 118 82 L 122 82', 'none', '#ff8a1a', 3.2),
      path('M 78 80 L 70 76 M 162 80 L 170 76', 'none', '#ff8a1a', 3), g('pt-glint'), path('M 86 90 L 96 80 M 130 90 L 140 80', 'none', '#fff', 2.4, ' opacity=".85"'), '</g>', '</g>')
smile = path('M 104 112 Q 120 124 136 112', 'none', OL, 2.6)
p.add(mouths(120, 112, 30, OL, '#3a1a3a', '#ff6b8a', smile, False))
p.add(g('pt-tongue', (120, 114)), path('M 118 114 C 118 130 118 160 112 190', 'none', '#ff6b8a', 7), path('M 118 114 C 118 130 118 160 112 190', 'none', OL, 1.4, ' opacity=".3"'), circ(112, 190, 6, '#ff5c8a', OL, 2), '</g>')
p.add('<g class="pt-gear-eyes"></g>', '<g class="pt-gear-head"></g>', '</g>', '</g>')
p.add('</g>', '</g>')   # body, color
p.add(g('pt-fx', (120, 110)), ''.join('<g class="pt-butter" style="transform-origin:%gpx %gpx"><path d="M %g %g c -8 -10 -16 -2 -8 6 c 8 -8 16 0 8 -6 Z" fill="%s" stroke="%s" stroke-width="1.2"/></g>' % (x, y, x, y, c, OL) for x, y, c in [(34, 76, '#ff8ad4'), (204, 66, '#7fd6ff'), (30, 160, '#ffd23a')]), '</g>')
CHAM = finish(p, '#b9f06a', [(26, 54, 0), (206, 44, .15), (22, 150, .3), (214, 146, .1), (120, 10, .25)], (168, 46, '#e4ffa8'))

# ===================== КРАБ МАТРОС =====================
p = P('crab'); OL = '#4a0f10'
sh = p.rgu('sh', [(0, '#ff9a6a', None), (.5, '#ef5a3a', None), (1, '#b8261c', None)], 108, 120, 140)
shB = p.rg('shb', [(0, '#ff8a5a', None), (.6, '#ef5a3a', None), (1, '#b8261c', None)], cx='40%', cy='25%', r='80%')
clawG = p.rg('claw', [(0, '#ff8a5a', None), (.6, '#e84a2a', None), (1, '#a81e16', None)], cx='40%', cy='30%', r='80%')
bellyG = p.lg('belly', [(0, '#ffd2b0', None), (1, '#f5a07a', None)])
eyeG = p.rg('eye', [(0, '#ffffff', None), (.6, '#dfe8f5', None), (1, '#9fb4d6', None)], cx='50%', cy='40%', r='65%')
glow = p.rg('glow', [(0, '#7fe0ff', .45), (1, '#1f9ae8', 0)], cx='50%', cy='50%', r='50%')
navy = p.lg('navy', [(0, '#2f5bd8', None), (1, '#1b3a9c', None)])
start(p, shadow(120, 222, 76, 7))
p.add(ell(120, 150, 112, 84, glow, extra=' class="pt-glow" style="transform-origin:120px 150px"'))
p.add('<g class="pt-gear-back"></g>')
# Ножки
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    for k, (x0, y0, x1, y1, x2, y2) in enumerate([(78, 166, 56, 184, 50, 206), (84, 178, 66, 198, 66, 214), (96, 186, 86, 204, 90, 216)]):
        d = 'M %g %g L %g %g L %g %g' % (X(x0), y0, X(x1), y1, X(x2), y2)
        p.add(g('pt-leg ' + ('l' if side > 0 else 'r') + str(k), (X(x0), y0)), path(d, 'none', OL, 9), path(d, 'none', '#e84a2a', 5.5), '</g>')
# Клешни
for side in (1, -1):
    cls = 'l' if side > 0 else 'r'; sx = 66 if side > 0 else 174
    arm = 'M 70 140 C 56 132 44 136 36 150'
    claw = 'M 52 148 C 34 128 6 136 8 160 C 10 182 36 190 54 174 L 46 166 C 36 174 22 168 22 158 C 22 148 36 144 44 152 Z'
    fin = 'M 54 174 C 60 168 60 160 54 154'
    if side < 0: arm, claw, fin = mirror(arm), mirror(claw), mirror(fin)
    p.add(g('pt-claw-pose ' + cls, (sx, 140)), g('pt-claw ' + cls, (sx, 140)), path(arm, 'none', OL, 13), path(arm, 'none', '#e84a2a', 8.5),
          path(claw, clawG, OL, 3), path(fin, 'none', '#ffb08a', 2.4, ' opacity=".6"'), '</g>', '</g>')
p.add(g('pt-body', (120, 194)))
p.add(path('M 60 150 C 60 118 90 104 120 104 C 150 104 180 118 180 150 C 180 178 150 194 120 194 C 90 194 60 178 60 150 Z', shB, OL, 3),
      path('M 72 160 C 80 184 160 184 168 160 C 160 190 80 190 72 160 Z', bellyG, OL, 2),
      ''.join(circ(x, y, 2.6, '#ffb08a', extra=' opacity=".6"') for x, y in [(90, 128), (150, 128), (78, 150), (162, 150), (120, 116)]),
      path('M 70 136 C 76 122 92 112 110 108', 'none', '#ffd2b0', 2.6, ' opacity=".6"'))
# Матросский воротник и галстук — характерная вещь
p.add(g('pt-sig pt-collar'), path('M 94 112 L 146 112 L 152 128 L 120 140 L 88 128 Z', navy, OL, 2.4), path('M 98 118 L 142 118 M 102 124 L 138 124', 'none', '#fff', 2),
      path('M 114 132 L 120 150 L 126 132 Z', '#e8344a', OL, 1.8), '</g>')
p.add('<g class="pt-gear-neck"></g>')
# Голова = панцирь: глаза на стебельках
p.add(g('pt-head-pose', (120, 140)), g('pt-head', (120, 140)))
for side in (1, -1):
    cls = 'l' if side > 0 else 'r'; bx = 104 if side > 0 else 136; tx = 98 if side > 0 else 142
    p.add(g('pt-stalk-pose ' + cls, (bx, 108)), g('pt-stalk ' + cls, (bx, 108)), path('M %g 110 C %g 96 %g 86 %g 76' % (bx, bx, tx, tx), 'none', OL, 11), path('M %g 110 C %g 96 %g 86 %g 76' % (bx, bx, tx, tx), 'none', '#e84a2a', 7),
          circ(tx, 72, 12, shB, OL, 2.6), eye(p, tx, 72, 15, 15, 0, side, eyeG, '#15102a', sh, OL, cls.upper(), 'round', None, 'round', 2.2), '</g>', '</g>')
p.add(brow('M 88 60 Q 98 55 108 60', OL, 1, (88, 60), 3), brow('M 152 60 Q 142 55 132 60', OL, -1, (152, 60), 3))
p.add('<g class="pt-gear-hair"></g>')
# Бескозырка между стебельками
p.add(g('pt-sig pt-cap', (120, 100)), path('M 98 104 C 100 92 140 92 142 104 Z', '#ffffff', OL, 2.4), path('M 96 104 L 144 104 L 144 110 L 96 110 Z', navy, OL, 2), path('M 136 110 L 150 122 M 138 110 L 154 118', 'none', navy, 3),
      ell(120, 92, 4, 2.5, '#e8344a', OL, 1.4), '</g>')
smile = path('M 108 160 Q 120 170 132 160', 'none', OL, 2.6)
p.add(g('pt-mouth-anchor', (120, 160)), mouths(120, 158, 24, OL, '#4a0f10', '#ff6b8a', smile), '</g>')
p.add(ell(104, 150, 5, 3, '#ff8fa8', extra=' opacity=".6"'), ell(136, 150, 5, 3, '#ff8fa8', extra=' opacity=".6"'))
p.add('<g class="pt-gear-eyes"></g>', '<g class="pt-gear-head"></g>', '</g>', '</g>')
p.add('</g>')
p.add(g('pt-fx', (120, 120)), ''.join('<circle class="pt-bubble" cx="%g" cy="%g" r="%g" fill="none" stroke="#bfefff" stroke-width="2" style="animation-delay:%gs"/>' % (x, y, r, d) for x, y, r, d in [(44, 120, 5, 0), (196, 110, 4, .8), (36, 80, 3, 1.5), (204, 70, 3.5, .4)]), '</g>')
p.add(g('pt-wave'), path('M 0 230 C 30 206 60 206 90 222 C 120 238 150 238 180 222 C 210 206 230 206 240 222 L 240 240 L 0 240 Z', '#5fd0ff', OL, 2.6, ' opacity=".9"'), path('M 20 224 C 50 210 76 210 100 222', 'none', '#fff', 2.6, ' opacity=".8"'), '</g>')
p.add(g('pt-snap'), path('M 24 120 L 16 108 M 36 112 L 36 98 M 14 134 L 2 130', 'none', '#fff', 3), path('M 216 120 L 224 108 M 204 112 L 204 98 M 226 134 L 238 130', 'none', '#fff', 3), '</g>')
CRAB = finish(p, '#bfefff', [(28, 60, 0), (206, 50, .15), (22, 150, .3), (214, 150, .1), (120, 20, .25)], (170, 40, '#ffd2b0'))

# ===================== ПИНГВИН КАПИТАН =====================
p = P('penguin'); OL = '#0b1024'
bk = p.rgu('bk', [(0, '#5a6a9c', None), (.5, '#28335c', None), (1, '#111735', None)], 106, 90, 150)
bkB = p.rg('bkb', [(0, '#4a5a8c', None), (.6, '#28335c', None), (1, '#111735', None)], cx='40%', cy='25%', r='80%')
wh = p.rgu('wh', [(0, '#ffffff', None), (.7, '#eef2fb', None), (1, '#c9d2e8', None)], 118, 110, 110)
orange = p.lg('orange', [(0, '#ffb53a', None), (1, '#f5801f', None)])
eyeG = p.rg('eye', [(0, '#ffffff', None), (.55, '#dfe8f5', None), (1, '#9fb4d6', None)], cx='50%', cy='40%', r='65%')
glow = p.rg('glow', [(0, '#bfefff', .45), (1, '#4fb8ff', 0)], cx='50%', cy='50%', r='50%')
navy = p.lg('navy', [(0, '#2a3f8c', None), (1, '#16255c', None)])
gold = p.lg('gold', [(0, '#ffe08a', None), (1, '#d9a21b', None)])
start(p, shadow(120, 222, 58, 8))
p.add(ell(120, 140, 108, 94, glow, extra=' class="pt-glow" style="transform-origin:120px 140px"'))
p.add(g('pt-tail-pose', (120, 212)), g('pt-tail', (120, 212)), path('M 104 206 L 96 224 L 120 218 L 144 224 L 136 206 Z', bkB, OL, 2.4), g('pt-tail-tip'), '</g>', '</g>', '</g>')
p.add('<g class="pt-gear-back"></g>')
p.add(g('pt-body', (120, 216)))
p.add(path('M 120 58 C 160 58 180 100 180 160 C 180 200 156 218 120 218 C 84 218 60 200 60 160 C 60 100 80 58 120 58 Z', bkB, OL, 3),
      path('M 120 100 C 146 100 158 128 158 164 C 158 198 142 212 120 212 C 98 212 82 198 82 164 C 82 128 94 100 120 100 Z', wh, OL, 2.2),
      path('M 70 110 C 64 136 64 170 72 198', 'none', '#8fa3d6', 2.6, ' opacity=".45"'))
for side in (1, -1):
    cls = 'l' if side > 0 else 'r'; wx = 70 if side > 0 else 170
    wing = 'M 72 118 C 54 140 48 172 60 202 C 72 198 80 172 82 140 C 82 128 78 120 72 118 Z'
    if side < 0: wing = mirror(wing)
    p.add(g('pt-wing-pose ' + cls, (wx, 120)), g('pt-wing ' + cls, (wx, 120)), path(wing, bkB, OL, 2.8), '</g>', '</g>')
p.add('<g class="pt-gear-neck"></g>')
p.add(g('pt-head-pose', (120, 122)), g('pt-head', (120, 122)))
p.add(path('M 120 64 C 144 64 156 82 154 102 C 152 116 138 122 120 124 C 102 122 88 116 86 102 C 84 82 96 64 120 64 Z', wh, OL, 2.6),
      path('M 84 84 C 90 72 102 64 114 62', 'none', '#ffffff', 2.6, ' opacity=".7"'), '<g class="pt-gear-hair"></g>')
p.add(g('pt-eyes'), eye(p, 106, 92, 20, 16, 1, 1, eyeG, '#15102a', wh, OL, 'L', 'round'), eye(p, 134, 92, 20, 16, 1, -1, eyeG, '#15102a', wh, OL, 'R', 'round'), '</g>')
p.add(ell(98, 104, 6, 3.5, '#ffa8b8', extra=' opacity=".7"'), ell(142, 104, 6, 3.5, '#ffa8b8', extra=' opacity=".7"'))
p.add(brow('M 96 80 Q 106 76 116 82', OL, 1, (96, 80), 3.2), brow('M 144 80 Q 134 76 124 82', OL, -1, (144, 80), 3.2))
p.add(beak(120, 108, 20, 14, orange, '#e8742a', OL, '#4a1430', '#ff6b8a'))
# Капитанская фуражка — характерная вещь
p.add(g('pt-sig pt-cap', (120, 60)), path('M 86 66 C 90 46 150 46 154 66 Z', '#ffffff', OL, 2.4), path('M 84 66 L 156 66 L 154 78 L 86 78 Z', navy, OL, 2.2),
      path('M 92 80 C 104 90 136 90 148 80 Z', '#0b1024', OL, 2), path('M 90 72 L 150 72', 'none', gold, 2),
      path('M 120 50 L 120 64 M 114 58 C 114 64 126 64 126 58 M 116 52 L 124 52', 'none', gold, 2.2), circ(120, 50, 2, gold), '</g>')
p.add('<g class="pt-gear-eyes"></g>', '<g class="pt-gear-head"></g>', '</g>', '</g>')
p.add('</g>')
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    p.add(path('M %g 218 C %g 206 %g 206 %g 218 Z' % (X(86), X(90), X(112), X(116)), orange, OL, 2.2), path('M %g 218 L %g 210 M %g 218 L %g 209' % (X(96), X(97), X(106), X(106)), 'none', OL, 1.4))
p.add(g('pt-fx', (120, 110)), ''.join('<path class="pt-flake" d="M %g %g l 0 12 M %g %g l 12 0 M %g %g l 8.5 8.5 M %g %g l -8.5 8.5" fill="none" stroke="#dff4ff" stroke-width="2" style="transform-origin:%gpx %gpx;animation-delay:%gs"/>' % (x, y - 6, x - 6, y, x - 4.2, y - 4.2, x + 4.2, y - 4.2, x, y, d) for x, y, d in [(34, 70, 0), (206, 60, .7), (28, 160, 1.4), (212, 150, .3)]), '</g>')
p.add(g('pt-hoot', (120, 118)), ''.join('<circle class="pt-ring" cx="120" cy="118" r="10" fill="none" stroke="#bfefff" stroke-width="3" style="animation-delay:%gs"/>' % d for d in (0, .25, .5)), '</g>')
PENGUIN = finish(p, '#bfefff', [(28, 50, 0), (206, 44, .15), (22, 150, .3), (214, 146, .1), (120, 12, .25)], (170, 48, '#dff4ff'))

ART = {'badger': BADGER, 'owl': OWL, 'toucan': TOUCAN, 'cham': CHAM, 'crab': CRAB, 'penguin': PENGUIN}

# ---------- точки посадки вещей ----------
KINDS = ['badger', 'owl', 'toucan', 'cham', 'crab', 'penguin']
# Куда садятся вещи: макушка, ширина шапки, глаза, шея, аура — в координатах 240×240
RIG = {
    'badger':  dict(cap=(120, 54), capw=46, eyes=((104, 90), (136, 90)), neck=(120, 124), nw=44, aura=(120, 140), ar=86),
    'owl':     dict(cap=(120, 60), capw=44, eyes=((100, 100), (140, 100)), neck=(120, 150), nw=60, aura=(120, 140), ar=88),
    'toucan':  dict(cap=(120, 58), capw=46, eyes=((106, 94), (134, 94)), neck=(120, 124), nw=46, aura=(120, 140), ar=86),
    'cham':    dict(cap=(120, 56), capw=44, eyes=((98, 86), (142, 86)), neck=(120, 130), nw=46, aura=(120, 140), ar=86),
    'crab':    dict(cap=(120, 98), capw=40, eyes=((98, 72), (142, 72)), neck=(120, 150), nw=60, aura=(120, 150), ar=84),
    'penguin': dict(cap=(120, 62), capw=46, eyes=((106, 92), (134, 92)), neck=(120, 130), nw=50, aura=(120, 140), ar=88),
}
# ---------- облики: перекраска по группам цветов ----------
PAL = {
    'badger': {'fur': ['#a7aec2', '#6b7390', '#444a63', '#9aa2b8', '#c8cedf', '#d9dde8', '#aab0c4'], 'light': ['#ffffff', '#eef0f6', '#cfd4e3'],
               'dark': ['#3a3650', '#1c1a2e'], 'eye': ['#e8f0ff', '#8fb4ff', '#2e6bd6', '#0f2050'], 'fx': ['#6cc24a', '#f5a623', '#8bd16b'], 'glow': ['#b7f0a6', '#4caf50']},
    'owl': {'fur': ['#d8995a', '#a8672f', '#6e3f18', '#c98a4c', '#8d5225', '#5a3110', '#c9924f', '#f0c48a'], 'light': ['#fff1d2', '#f3d4a0', '#dcb376', '#f6dfb4', '#d8aa6e', '#e0b77a'],
            'eye': ['#fff6c4', '#ffc53a', '#e06a00'], 'accent': ['#f2a93b', '#d98c1e'], 'glow': ['#c9b4ff', '#7c5cff']},
    'toucan': {'fur': ['#4a5570', '#242b44', '#0e1420', '#3d4660', '#6f7da0', '#8fa3c8', '#5fa8ff'], 'light': ['#fff4b0', '#ffd23a', '#f5a623'],
               'accent': ['#ffb41f', '#ff8a1a', '#e8344a', '#ffcf3a', '#ff7a1a'], 'face': ['#ffffff', '#dfe8f5'], 'eye': ['#e8f6ff', '#6fd0ff', '#1f7ae8', '#38bdf8'],
               'cloth': ['#f6e4b8', '#d2b680', '#6b5a3a', '#b89a62'], 'fx': ['#2ecc71', '#1fc1b0'], 'glow': ['#7ef0a0', '#1fc1b0']},
    'cham': {'fur': ['#b9f06a', '#5fc84a', '#2e8a3a', '#a4e85a', '#2ecc71', '#1f8a4a', '#e4ffa8'], 'light': ['#f1ffb8', '#bfe47a'],
             'eye': ['#fff9c4', '#ffd23a', '#e8742a'], 'cloth': ['#ff5c8a', '#ff8a1a'], 'glow': ['#f6ff9a', '#8ef06a']},
    'crab': {'fur': ['#ff9a6a', '#ef5a3a', '#b8261c', '#ff8a5a', '#e84a2a', '#a81e16', '#ffb08a'], 'light': ['#ffd2b0', '#f5a07a'],
             'eye': ['#dfe8f5', '#9fb4d6'], 'cloth': ['#2f5bd8', '#1b3a9c', '#e8344a'], 'fx': ['#bfefff', '#5fd0ff'], 'glow': ['#7fe0ff', '#1f9ae8']},
    'penguin': {'fur': ['#5a6a9c', '#28335c', '#111735', '#4a5a8c', '#8fa3d6'], 'light': ['#ffffff', '#eef2fb', '#c9d2e8'],
                'accent': ['#ffb53a', '#f5801f', '#e8742a'], 'eye': ['#dfe8f5', '#9fb4d6'], 'cloth': ['#2a3f8c', '#16255c'], 'fx': ['#dff4ff', '#bfefff'], 'glow': ['#bfefff', '#4fb8ff']},
}
def shade(hexc, hue=None, sat=1.0, light=1.0, add=0.0):
    r, gg, b = (int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, l, s_ = colorsys.rgb_to_hls(r, gg, b)
    if hue is not None: h = (hue / 360.0) % 1
    s_ = max(0, min(1, s_ * sat)); l = max(0, min(1, l * light + add))
    return '#%02x%02x%02x' % tuple(round(x * 255) for x in colorsys.hls_to_rgb(h, l, s_))
# (тон, насыщенность, яркость, прибавка) по группам
SKINS = {
    'badger': {'honey': {'fur': (32, .75, 1.0, 0), 'light': (40, .5, 1, 0), 'glow': (40, 1, 1, 0)},
               'midnight': {'fur': (235, .6, .55, 0), 'light': (230, .6, .92, 0), 'eye': (190, 1, 1, 0), 'glow': (250, 1, 1, 0)},
               'snow': {'fur': (210, .12, 1.3, .08), 'dark': (215, .3, 1.6, 0), 'eye': (200, 1, 1, 0)},
               'autumn': {'fur': (18, .85, .95, 0), 'light': (40, .6, 1, 0), 'eye': (90, 1, 1, 0), 'fx': (25, 1, 1, 0), 'glow': (30, 1, 1, 0)},
               'mint': {'fur': (160, .55, 1.08, 0), 'light': (160, .3, 1, 0), 'eye': (330, 1, 1, 0), 'glow': (160, 1, 1, 0)}},
    'owl': {'snowy': {'fur': (210, .12, 1.35, .06), 'light': (210, .08, 1.08, 0), 'eye': (45, 1, 1, 0), 'glow': (200, 1, 1, 0)},
            'night': {'fur': (235, .65, .55, 0), 'light': (230, .5, .9, 0), 'eye': (48, 1, 1, .05), 'glow': (250, 1, 1, 0)},
            'ruby': {'fur': (10, 1.0, .9, 0), 'light': (30, .9, 1, 0), 'eye': (50, 1, 1, 0), 'glow': (10, 1, 1, 0)},
            'ash': {'fur': (220, .12, .8, 0), 'light': (220, .1, 1, 0), 'eye': (200, 1, 1, 0), 'glow': (220, 1, 1, 0)},
            'moon': {'fur': (265, .5, 1.05, 0), 'light': (265, .4, 1, 0), 'eye': (190, 1, 1, 0), 'glow': (265, 1, 1, 0)}},
    'toucan': {'sunset': {'fur': (285, .7, 1.2, 0), 'accent': (330, 1, 1, 0), 'light': (20, 1, 1, 0), 'glow': (300, 1, 1, 0)},
               'lime': {'fur': (135, .6, 1.1, 0), 'accent': (52, 1, 1, 0), 'light': (60, 1, 1, 0), 'glow': (100, 1, 1, 0)},
               'arctic': {'fur': (210, .15, 1.6, .06), 'accent': (200, 1, 1, 0), 'light': (195, .8, 1, 0), 'eye': (210, 1, 1, 0), 'glow': (200, 1, 1, 0)},
               'neon': {'fur': (250, .5, .7, 0), 'accent': (165, 1, 1, 0), 'light': (150, 1, 1, 0), 'eye': (300, 1, 1, 0), 'glow': (160, 1, 1, 0)},
               'cherry': {'fur': (350, .6, .75, 0), 'accent': (45, 1, 1, 0), 'light': (40, 1, 1, 0), 'glow': (350, 1, 1, 0)}},
    'cham': {'lava': {'fur': (15, 1, .95, 0), 'light': (40, 1, 1, 0), 'glow': (15, 1, 1, 0)},
             'ocean': {'fur': (200, .8, 1.0, 0), 'light': (190, .8, 1, 0), 'glow': (200, 1, 1, 0)},
             'lemon': {'fur': (55, 1, 1.05, 0), 'light': (60, 1, 1, 0), 'glow': (55, 1, 1, 0)},
             'berry': {'fur': (300, .7, 1.0, 0), 'light': (320, .8, 1, 0), 'glow': (300, 1, 1, 0)},
             'midnight': {'fur': (235, .6, .55, 0), 'light': (180, .8, .9, 0), 'eye': (180, 1, 1, 0), 'glow': (250, 1, 1, 0)}},
    'crab': {'blue': {'fur': (215, .9, 1.0, 0), 'light': (200, .8, 1, 0), 'glow': (215, 1, 1, 0)},
             'sand': {'fur': (38, .6, 1.2, 0), 'light': (45, .7, 1, 0), 'glow': (40, 1, 1, 0)},
             'neon': {'fur': (290, .9, 1.0, 0), 'light': (320, .9, 1, 0), 'glow': (290, 1, 1, 0)},
             'sunny': {'fur': (45, 1, 1.05, 0), 'light': (50, 1, 1, 0), 'glow': (45, 1, 1, 0)},
             'deep': {'fur': (225, .7, .55, 0), 'light': (190, .8, .9, 0), 'eye': (190, 1, 1, 0), 'glow': (250, 1, 1, 0)}},
    'penguin': {'emperor': {'fur': (220, .25, 1.3, 0), 'accent': (45, 1, 1, 0), 'glow': (45, 1, 1, 0)},
                'night': {'fur': (265, .7, .9, 0), 'light': (265, .3, .97, 0), 'glow': (265, 1, 1, 0)},
                'snowy': {'fur': (210, .1, 1.6, .1), 'accent': (200, .9, 1, 0), 'glow': (200, 1, 1, 0)},
                'rose': {'fur': (335, .7, 1.2, 0), 'light': (340, .5, 1, 0), 'accent': (20, 1, 1, 0), 'glow': (335, 1, 1, 0)},
                'sunny': {'fur': (42, .9, 1.1, 0), 'accent': (10, 1, 1, 0), 'glow': (42, 1, 1, 0)}},
}
STAR = {'fur': (252, .75, .55, 0), 'light': (230, .7, .9, 0), 'accent': (265, 1, 1, .05), 'face': (230, .6, .95, 0), 'eye': (195, 1, 1, .12), 'glow': (250, 1, 1, 0), 'fx': (200, 1, 1, .1)}
def skin_table(kind, rules):
    table = {}
    for grp, hexes in PAL[kind].items():
        if grp in rules:
            hue, sat, light, add = rules[grp]
            for hx in hexes: table[hx.lower()] = shade(hx, hue, sat, light, add)
    return table
def skin(svg, kind, name, rules):
    table = skin_table(kind, rules)
    return re.sub(r'#[0-9a-fA-F]{6}\b', lambda m: table.get(m.group(0).lower(), m.group(0)), svg)
def stars_fx():
    pts = [(70, 150, 1), (96, 130, .7), (150, 136, .9), (166, 170, .6), (118, 170, .8), (100, 66, .7), (144, 70, .6), (130, 196, .6)]
    return ''.join('<path class="pt-star" d="M %g %g l %g %g l %g %g l %g %g l %g %g Z" fill="#fff6c8" style="animation-delay:%gs;transform-origin:%gpx %gpx"/>' % (
        x, y - 5 * k, 1.4 * k, 3.6 * k, 3.6 * k, 1.4 * k, -3.6 * k, 1.4 * k, -1.4 * k, 3.6 * k, i * .37, x, y) for i, (x, y, k) in enumerate(pts))
# Таблицы перекраски по обликам: игра подставляет цвета сама (js/pets.js), а
# .svg для просмотра собираются здесь готовыми
SKIN_COLORS = {}
for k in KINDS:
    SKIN_COLORS[k] = {name: skin_table(k, rules) for name, rules in SKINS[k].items()}
    SKIN_COLORS[k]['star'] = skin_table(k, STAR)
    if OUT:
        for name, rules in SKINS[k].items(): open(os.path.join(OUT, k + '_' + name + '.svg'), 'w').write(skin(ART[k], k, name, rules))
        open(os.path.join(OUT, k + '_star.svg'), 'w').write(skin(ART[k], k, 'star', STAR).replace('<g class="pt-skin-fx"></g>', '<g class="pt-skin-fx">' + stars_fx() + '</g>'))

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

# ---------- вещи ----------
def gear_crown(k):
    cx, y = RIG[k]['cap']; w = RIG[k]['capw'] / 2
    gem = {'badger': '#3bd1ff', 'owl': '#ff9a1a', 'toucan': '#2ecc71', 'cham': '#ff5c8a', 'crab': '#38bdf8', 'penguin': '#ff3b5c'}[k]
    pts = ' '.join('L %g %g' % (cx - w + i * (2 * w / 4), y - (14 if i % 2 == 0 else 0)) for i in range(5))
    s = path('M %g %g %s L %g %g Z' % (cx - w, y + 6, pts, cx + w, y + 6), '#ffc83a', '#1b1030', 2.4)
    s += '<rect x="%g" y="%g" width="%g" height="8" rx="3.5" fill="#e0a000" %s/>' % (cx - w - 1, y + 2, 2 * w + 2, GOL)
    s += ''.join(circ(cx - w + i * (2 * w / 4), y - 14, 2.6, '#fff6c8', '#1b1030', 1.3) for i in (0, 2, 4))
    s += circ(cx, y + 6, 3.4, gem, '#1b1030', 1.4) + circ(cx - w * .55, y + 6, 2.2, gem, '#1b1030', 1.2) + circ(cx + w * .55, y + 6, 2.2, gem, '#1b1030', 1.2)
    return s
def gear_mortar(k):   # шапочка учёного (барсук)
    cx, y = RIG[k]['cap']
    return path('M %g %g C %g %g %g %g %g %g Z' % (cx - 20, y + 8, cx - 20, y - 8, cx + 20, y - 8, cx + 20, y + 8), '#2b2b3f', '#1b1030', 2.4) + \
           path('M %g %g L %g %g L %g %g L %g %g Z' % (cx - 34, y - 6, cx, y - 20, cx + 34, y - 6, cx, y + 6), '#2b2b3f', '#1b1030', 2.4) + \
           path('M %g %g L %g %g L %g %g' % (cx, y - 8, cx + 24, y - 2, cx + 26, y + 14), 'none', '#ffd23a', 2.4) + circ(cx + 26, y + 15, 3, '#ffd23a', '#1b1030', 1.2)
def gear_starglasses(k):   # очки-звёзды (барсук, заменяют круглые)
    (lx, ly), (rx, ry) = RIG[k]['eyes']
    star = lambda x, y: path('M %g %g l %g %g l %g %g l %g %g l %g %g l %g %g l %g %g l %g %g l %g %g l %g %g Z' % (
        x, y - 16, 4.8, 11, 11.5, 0, -9, 7, 3.5, 11, -10.8, -6.5, -10.8, 6.5, 3.5, -11, -9, -7, 11.5, 0), '#ffd23a', '#1b1030', 2.4)
    return star(lx, ly + 1) + star(rx, ry + 1) + path('M %g %g L %g %g' % (lx + 10, ly - 2, rx - 10, ry - 2), 'none', '#1b1030', 2.6) + \
           path('M %g %g L %g %g M %g %g L %g %g' % (lx - 12, ly - 2, lx - 22, ly - 6, rx + 12, ry - 2, rx + 22, ry - 6), 'none', '#1b1030', 2.6)
def gear_tophat(k):
    cx, y = RIG[k]['cap']; w = RIG[k]['capw'] / 2
    return path('M %g %g L %g %g L %g %g L %g %g Z' % (cx - w + 4, y + 2, cx - w + 6, y - 34, cx + w - 6, y - 34, cx + w - 4, y + 2), '#1e1e2e', '#1b1030', 2.4) + \
           ell(cx, y + 3, w + 8, 6, '#1e1e2e', '#1b1030', 2.4) + path('M %g %g L %g %g L %g %g L %g %g Z' % (cx - w + 5, y - 4, cx - w + 5, y - 12, cx + w - 5, y - 12, cx + w - 5, y - 4), '#8e44ad', '#1b1030', 1.6) + \
           path('M %g %g L %g %g' % (cx - w + 9, y - 30, cx - w + 10, y - 8), 'none', '#ffffff', 2, ' opacity=".35"')
def gear_argyle(k):   # шарф в ромбик
    cx, y = RIG[k]['neck']; w = RIG[k]['nw'] / 2
    s = path('M %g %g C %g %g %g %g %g %g L %g %g C %g %g %g %g %g %g Z' % (cx - w, y - 8, cx - w * .4, y + 4, cx + w * .4, y + 4, cx + w, y - 8, cx + w + 2, y + 6, cx + w * .4, y + 18, cx - w * .4, y + 18, cx - w - 2, y + 6), '#c0392b', '#1b1030', 2.4)
    for d in (-w * .55, 0, w * .55):
        s += path('M %g %g l 6 6 l -6 6 l -6 -6 Z' % (cx + d, y - 2 + abs(d) / w * 4), '#f1c40f', '#1b1030', 1)
    s += path('M %g %g L %g %g L %g %g L %g %g Z' % (cx + w * .3, y + 12, cx + w * .3 + 6, y + 40, cx + w * .3 + 18, y + 36, cx + w * .3 + 12, y + 10), '#c0392b', '#1b1030', 2.4) + path('M %g %g l 5 5 l -5 5 l -5 -5 Z' % (cx + w * .3 + 10, y + 22), '#f1c40f', '#1b1030', 1)
    return s
def gear_lei(k):   # цветочная гирлянда
    cx, y = RIG[k]['neck']; w = RIG[k]['nw'] / 2 + 8; s = ''
    for i in range(9):
        t = i / 8; x = cx - w + 2 * w * t; yy = y + 2 + 22 * math.sin(math.pi * t); c = ['#ff5c8a', '#ffd23a', '#ff9a1a', '#c8a2ff'][i % 4]
        s += ''.join(ell(x + 5 * math.cos(math.radians(a)), yy + 5 * math.sin(math.radians(a)), 4, 2.6, c, '#1b1030', 1.2, ' transform="rotate(%g %g %g)"' % (a, x + 5 * math.cos(math.radians(a)), yy + 5 * math.sin(math.radians(a)))) for a in range(0, 360, 72)) + circ(x, yy, 2.2, '#fff6c8')
    return s
def gear_sunglasses(k):
    (lx, ly), (rx, ry) = RIG[k]['eyes']; w = 13
    lens = lambda x, y: path('M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g Z' % (x - w, y - 7, x - w * .5, y - 11, x + w * .5, y - 11, x + w, y - 7, x + w, y + 8, x - w, y + 8, x - w, y - 7), '#141022', '#1b1030', 2.4) + path('M %g %g L %g %g' % (x - 7, y - 2, x - 3, y - 6), 'none', '#fff', 2, ' opacity=".8"')
    return lens(lx, ly) + lens(rx, ry) + path('M %g %g C %g %g %g %g %g %g' % (lx + w - 1, ly - 4, lx + w + 4, ly - 8, rx - w - 4, ry - 8, rx - w + 1, ry - 4), 'none', '#1b1030', 2.6) + path('M %g %g L %g %g M %g %g L %g %g' % (lx - w, ly - 3, lx - w - 7, ly - 7, rx + w, ry - 3, rx + w + 7, ry - 7), 'none', '#1b1030', 2.6)
def gear_cap(k):   # кепка задом наперёд
    cx, y = RIG[k]['cap']; w = RIG[k]['capw'] / 2 + 2
    return path('M %g %g C %g %g %g %g %g %g Z' % (cx - w, y + 6, cx - w, y - 20, cx + w, y - 20, cx + w, y + 6), '#e74c3c', '#1b1030', 2.4) + \
           path('M %g %g C %g %g %g %g %g %g' % (cx, y - 18, cx - 6, y - 10, cx - 8, y, cx - 6, y + 6), 'none', '#1b1030', 1.6, ' opacity=".5"') + \
           path('M %g %g C %g %g %g %g %g %g Z' % (cx + w - 6, y, cx + w + 8, y - 2, cx + w + 20, y + 4, cx + w + 4, y + 8), '#c0392b', '#1b1030', 2.2) + circ(cx, y - 19, 3, '#e74c3c', '#1b1030', 1.6)
def gear_safari(k):
    cx, y = RIG[k]['cap']; w = RIG[k]['capw'] / 2
    return path('M %g %g C %g %g %g %g %g %g C %g %g %g %g %g %g Z' % (cx - w - 18, y + 6, cx - w - 8, y - 2, cx + w + 8, y - 2, cx + w + 18, y + 6, cx + w + 8, y + 12, cx - w - 8, y + 12, cx - w - 18, y + 6), '#c8b27a', '#1b1030', 2.4) + \
           path('M %g %g C %g %g %g %g %g %g Z' % (cx - w + 6, y + 2, cx - w + 8, y - 22, cx + w - 8, y - 22, cx + w - 6, y + 2), '#d9c48e', '#1b1030', 2.4) + path('M %g %g L %g %g' % (cx - w + 6, y - 4, cx + w - 6, y - 4), 'none', '#6b5a3a', 4)
def gear_lifebuoy(k):
    cx, cy = 120, 150; r = 58; s = circ(cx, cy, r, 'none', '#1b1030', 18) + circ(cx, cy, r, 'none', '#ffffff', 13)
    for i in range(4):
        s += '<path d="M %g %g A %g %g 0 0 1 %g %g" fill="none" stroke="#e8344a" stroke-width="13"/>' % (cx + r * math.cos(math.radians(i * 90 - 20)), cy + r * math.sin(math.radians(i * 90 - 20)), r, r, cx + r * math.cos(math.radians(i * 90 + 20)), cy + r * math.sin(math.radians(i * 90 + 20)))
    return s + circ(cx, cy, r, 'none', '#1b1030', 2) + path('M %g %g A %g %g 0 0 1 %g %g' % (cx - r * .7, cy - r * .7, r, r, cx - r * .2, cy - r * .97), 'none', '#fff', 2.4, ' opacity=".6"')
def gear_striped(k):   # тельняшка на панцире
    s = path('M 76 148 C 84 170 156 170 164 148 C 158 186 82 186 76 148 Z', '#ffffff', '#1b1030', 2.2)
    for y in (154, 162, 170, 178):
        s += path('M 80 %g C 100 %g 140 %g 160 %g' % (y, y + 6, y + 6, y), 'none', '#1d4ed8', 4)
    return s
def gear_jacket(k):   # китель капитана
    s = path('M 90 124 C 100 150 100 190 104 210 L 136 210 C 140 190 140 150 150 124 C 140 134 100 134 90 124 Z', '#1b2f6b', '#1b1030', 2.4)
    s += path('M 120 134 L 120 208', 'none', '#ffd23a', 1.6, ' opacity=".7"') + ''.join(circ(x, y, 2.6, '#ffd23a', '#1b1030', 1.2) for x in (112, 128) for y in (150, 166, 182))
    s += path('M 82 122 L 102 118 L 100 128 L 84 132 Z M 158 122 L 138 118 L 140 128 L 156 132 Z', '#ffd23a', '#1b1030', 1.8)
    return s
def gear_binoculars(k):
    return path('M 92 128 C 100 150 140 150 148 128', 'none', '#1b1030', 2.4) + \
           '<rect x="106" y="146" width="12" height="22" rx="4" fill="#2b2b3f" %s/><rect x="122" y="146" width="12" height="22" rx="4" fill="#2b2b3f" %s/>' % (GOL, GOL) + \
           '<rect x="116" y="150" width="8" height="8" rx="2" fill="#5a5a7a" %s/>' % GOL + circ(112, 150, 3, '#7fd6ff') + circ(128, 150, 3, '#7fd6ff')
# slot — место в базе и на экране питомца (head, eyes, neck, body, aura),
# layer — слой рисунка (hair, eyes, neck, front, aura); only — вещь одного питомца
GEAR = {
    'crown': {'slot': 'head', 'layer': 'hair', 'all': True, 'fn': gear_crown},
    'mortar': {'slot': 'head', 'layer': 'hair', 'only': 'badger', 'fn': gear_mortar}, 'starglasses': {'slot': 'eyes', 'layer': 'eyes', 'only': 'badger', 'fn': gear_starglasses},
    'tophat': {'slot': 'head', 'layer': 'hair', 'only': 'owl', 'fn': gear_tophat}, 'argyle': {'slot': 'neck', 'layer': 'neck', 'only': 'owl', 'fn': gear_argyle},
    'lei': {'slot': 'neck', 'layer': 'neck', 'only': 'toucan', 'fn': gear_lei}, 'sunglasses': {'slot': 'eyes', 'layer': 'eyes', 'only': 'toucan', 'fn': gear_sunglasses},
    'cap': {'slot': 'head', 'layer': 'hair', 'only': 'cham', 'fn': gear_cap}, 'safari': {'slot': 'head', 'layer': 'hair', 'only': 'cham', 'fn': gear_safari},
    'lifebuoy': {'slot': 'body', 'layer': 'front', 'only': 'crab', 'fn': gear_lifebuoy}, 'striped': {'slot': 'body', 'layer': 'front', 'only': 'crab', 'fn': gear_striped},
    'jacket': {'slot': 'body', 'layer': 'neck', 'only': 'penguin', 'fn': gear_jacket}, 'binoculars': {'slot': 'neck', 'layer': 'neck', 'only': 'penguin', 'fn': gear_binoculars},
}
PET_GEAR_ART = {}
for code, G in GEAR.items():
    ks = KINDS if G.get('all') else [G['only']]
    PET_GEAR_ART[code] = {'slot': G['slot'], 'layer': G['layer'], 'pet': None if G.get('all') else G['only'], 'art': {k: G['fn'](k) for k in ks}}
for code, which in GEN_AURAS.items():
    PET_GEAR_ART[code] = {'slot': 'aura', 'layer': 'aura', 'pet': None, 'art': {k: ring_aura(k, which) for k in KINDS}}
for k, own in OWN.items():
    for code, which in own.items(): PET_GEAR_ART[code] = {'slot': 'aura', 'layer': 'front' if which in FRONT else 'aura', 'pet': k, 'art': {k: own_aura(k, which)}}

if OUT:
    for k, v in ART.items(): open(os.path.join(OUT, k + '.svg'), 'w').write(v)
with open(os.path.join(ROOT, 'js', 'pet-art.js'), 'w', encoding='utf-8') as f:
    f.write('// Рисунки питомцев. Собирает tools/pets/pets.py — правьте там, не здесь.\n'
            '// PET_ART — рисунок каждого; PET_SKIN_COLORS — облики: какой цвет на какой\n'
            '// заменить (звёздный — star, к нему ещё звёзды PET_STAR_FX);\n'
            '// PET_GEAR_ART — вещи и ауры: место (slot), слой рисунка (layer), чья (pet) и рисунок по питомцам\n')
    f.write('const PET_ART = ' + json.dumps(ART, ensure_ascii=False) + ';\n')
    f.write('const PET_SKIN_COLORS = ' + json.dumps(SKIN_COLORS, ensure_ascii=False) + ';\n')
    f.write('const PET_STAR_FX = ' + json.dumps(stars_fx(), ensure_ascii=False) + ';\n')
    f.write('const PET_GEAR_ART = ' + json.dumps(PET_GEAR_ART, ensure_ascii=False) + ';\n')
print('питомцы', {k: len(ART[k]) for k in KINDS}, 'вещей и аур', len(PET_GEAR_ART))
