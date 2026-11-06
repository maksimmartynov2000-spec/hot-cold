# Питомцы: Огнелис, Ледяной волк, Грозовой дракон. SVG 240×240, части — группами
# с классами pt-* для анимации (js/pets.js, стили — в styles.css). Стиль:
# тёмный контур, тени и блики пятнами, светящиеся стихии, глаза миндалём с
# бровями (без «малышовых» круглых глаз).
#   python3 tools/pets/pets.py            → js/pet-art.js
#   python3 tools/pets/pets.py --svg DIR  → ещё и отдельные .svg для просмотра
import os, sys, math
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[sys.argv.index('--svg') + 1] if '--svg' in sys.argv else None
if OUT: os.makedirs(OUT, exist_ok=True)

def mirror(path, cx=120):
    """Отразить путь из абсолютных команд M/L/C/Q/Z относительно x = cx."""
    out = []
    toks = path.replace(',', ' ').split()
    i = 0
    cmd = None
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t; out.append(t); i += 1; continue
        x = float(t); y = float(toks[i + 1])
        out.append('%g %g' % (2 * cx - x, y)); i += 2
    return ' '.join(out)

class P:
    def __init__(self, key):
        self.k = key; self.defs = []; self.body = []
    def id(self, n): return self.k + '-' + n
    def rg(self, n, stops, cx='45%', cy='35%', r='70%'):
        st = ''.join('<stop offset="%s" stop-color="%s"%s/>' % (o, c, (' stop-opacity="%s"' % a) if a is not None else '') for o, c, a in stops)
        self.defs.append('<radialGradient id="%s" cx="%s" cy="%s" r="%s">%s</radialGradient>' % (self.id(n), cx, cy, r, st))
        return 'url(#%s)' % self.id(n)
    def lg(self, n, stops, x1=0, y1=0, x2=0, y2=1):
        st = ''.join('<stop offset="%s" stop-color="%s"%s/>' % (o, c, (' stop-opacity="%s"' % a) if a is not None else '') for o, c, a in stops)
        self.defs.append('<linearGradient id="%s" x1="%s" y1="%s" x2="%s" y2="%s">%s</linearGradient>' % (self.id(n), x1, y1, x2, y2, st))
        return 'url(#%s)' % self.id(n)
    def add(self, *xs): self.body.extend(xs)
    def svg(self, origins):
        body = ''.join(self.body)
        for cls, (x, y) in origins.items():
            body = body.replace('class="%s"' % cls, 'class="%s" style="transform-origin:%gpx %gpx"' % (cls, x, y))
        return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" class="pet pet-%s">' % self.k +
                '<defs>%s</defs><g class="pt-all" style="transform-origin:120px 218px">%s</g></svg>' % (''.join(self.defs), body))

def path(d, fill, stroke=None, w=3, extra=''):
    s = ' stroke="%s" stroke-width="%s" stroke-linejoin="round" stroke-linecap="round"' % (stroke, w) if stroke else ''
    return '<path d="%s" fill="%s"%s%s/>' % (d, fill, s, extra)

# ============ Огнелис ============
p = P('fox')
OL = '#2a0f14'
furG = p.rg('fur', [(0, '#ffb35c', None), (.55, '#f2661c', None), (1, '#b8380f', None)], cx='45%', cy='30%', r='75%')
furSide = p.lg('furs', [(0, '#c9420f', None), (1, '#ff8a2e', None)], 0, 0, 1, 0)
cream = p.rg('cream', [(0, '#fff7e6', None), (1, '#f1c992', None)], cx='50%', cy='30%', r='80%')
dark = p.lg('dark', [(0, '#4a2638', None), (1, '#24121c', None)])
flOut = p.lg('flo', [(0, '#ffcf3a', None), (.45, '#ff7a1a', None), (1, '#e0301a', None)], 0, 0, 0, 1)
flMid = p.lg('flm', [(0, '#fff0a0', None), (1, '#ffb21f', None)], 0, 0, 0, 1)
flCore = p.rg('flc', [(0, '#ffffff', None), (1, '#ffe27a', None)], cx='50%', cy='70%', r='70%')
eyeG = p.rg('eye', [(0, '#fff3a6', None), (.5, '#ffc22e', None), (1, '#ff7a00', None)], cx='50%', cy='45%', r='60%')
glow = p.rg('glow', [(0, '#ffb347', .55), (1, '#ff6a00', 0)], cx='50%', cy='50%', r='50%')
earIn = p.lg('earin', [(0, '#24121c', None), (1, '#5a2a3a', None)])

# Хвост-пламя (сзади)
tail_out = 'M 98 212 C 58 218 22 198 22 160 C 22 130 42 118 34 88 C 52 100 58 118 56 130 C 62 108 58 84 72 60 C 82 88 80 108 76 124 C 88 112 94 96 94 78 C 108 108 106 140 100 160 C 112 170 114 190 98 212 Z'
tail_mid = 'M 96 206 C 66 208 40 194 40 164 C 40 142 52 132 50 114 C 62 126 66 138 64 150 C 72 134 72 116 78 100 C 86 120 84 138 82 150 C 90 142 94 130 94 118 C 102 140 100 160 94 172 C 104 182 104 196 96 206 Z'
tail_core = 'M 92 200 C 74 200 58 190 58 172 C 58 160 66 152 68 142 C 74 152 76 160 76 168 C 80 158 82 146 84 138 C 92 154 92 168 88 178 C 96 184 98 194 92 200 Z'
p.add('<g class="pt-gear-aura"></g>')
p.add('<g id="fox-tail" class="pt-tail">',
      '<ellipse cx="62" cy="130" rx="58" ry="74" fill="%s" class="pt-glow"/>' % glow,
      '<g class="pt-flame">', path(tail_out, flOut, OL, 3), path(tail_mid, flMid), path(tail_core, flCore), '</g>',
      # мех у основания хвоста
      path('M 88 214 C 92 198 104 190 118 192 L 112 214 Z', furG, OL, 3),
      '</g>')
p.add('<g class="pt-gear-back"></g>')
# Задние лапы (сидит): бёдра по бокам, ступни вперёд
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    haunch = 'M %g 178 C %g 160 %g 160 %g 180 C %g 198 %g 212 %g 214 L %g 214 Z' % (X(106), X(92), X(70), X(63), X(58), X(70), X(88), X(108))
    p.add(path(haunch, furG, OL, 3),
          path('M %g 184 C %g 172 %g 170 %g 176' % (X(70), X(74), X(84), X(92)), 'none', '#ffc27a', 2.4, ' opacity=".7"'))
    foot = 'M %g 214 C %g 206 %g 203 %g 205 C %g 207 %g 213 %g 216 C %g 219 %g 219 %g 214 Z' % (X(60), X(61), X(72), X(84), X(92), X(95), X(91), X(80), X(64), X(60))
    p.add(path(foot, dark, OL, 2.6), path('M %g 212 l 1 5 M %g 211 l 1 5' % (X(72), X(80)), 'none', '#6b3a4c', 1.3))
# Тело: плечи, бока, живот за лапами
p.add('<g id="fox-body" class="pt-body">',
      path('M 96 118 C 86 134 84 152 88 170 C 94 192 104 210 120 214 C 136 210 146 192 152 170 C 156 152 154 134 144 118 Z', furG, OL, 3),
      path('M 146 132 C 152 148 152 168 146 188', 'none', '#ffc27a', 2.4, ' opacity=".6"'),
      path('M 94 136 C 90 150 90 166 94 180', 'none', '#9c2f0c', 2.2, ' opacity=".5"'),
      # грудка: пушистая, низ — клочками
      path('M 101 114 C 96 132 98 150 104 164 L 109 156 L 113 170 L 118 158 L 122 170 L 127 158 L 131 168 L 136 156 C 142 146 144 130 139 114 Z', cream, OL, 2.5),
      '</g>')
# Передние лапы: стройные, книзу тоньше, «чулки» с рваной кромкой
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    leg = 'M %g 148 C %g 172 %g 196 %g 214 L %g 214 C %g 196 %g 172 %g 148 Z' % (X(100), X(99), X(101), X(102), X(114), X(114), X(115), X(114))
    sock = 'M %g 182 L %g 186 L %g 181 L %g 187 L %g 182 L %g 188 C %g 198 %g 206 %g 214 L %g 214 C %g 206 %g 196 %g 182 Z' % (
        X(100.5), X(104), X(107), X(110), X(113), X(114), X(114), X(114), X(114), X(102), X(101), X(100.5), X(100.5))
    p.add(path(leg, furG, OL, 2.6), path(sock, dark),
          path('M %g 213 C %g 207 %g 206 %g 209 C %g 211 %g 217 %g 219 C %g 220 %g 220 %g 213 Z' % (X(97), X(101), X(114), X(119), X(121), X(120), X(116), X(108), X(99), X(97)), dark, OL, 2.4),
          path('M %g 213 l 0 5 M %g 213 l 0 5' % (X(105), X(111)), 'none', '#6b3a4c', 1.3))
p.add('<g class="pt-gear-neck"></g>')
# Голова
p.add('<g id="fox-head" class="pt-head">')
for side in (1, -1):
    ear = 'M 86 76 C 79 56 75 38 70 16 C 88 24 104 40 110 60 Z'
    inner = 'M 88 68 C 84 52 81 40 78 28 C 90 36 99 46 104 60 Z'
    tuft = 'M 88 70 L 91 58 L 94 66 L 97 55 L 100 64 L 104 58 L 104 68 Z'
    if side < 0:
        ear, inner, tuft = mirror(ear), mirror(inner), mirror(tuft)
    p.add('<g id="fox-ear%s" class="pt-ear %s">' % ('L' if side > 0 else 'R', 'l' if side > 0 else 'r'),
          path(ear, furG, OL, 3), path(inner, earIn), path(tuft, cream), '</g>')
head = 'M 120 50 C 142 50 158 62 162 78 L 174 82 L 163 89 L 172 97 L 159 99 C 152 112 137 124 120 126 C 103 124 88 112 81 99 L 68 97 L 77 89 L 66 82 L 78 78 C 82 62 98 50 120 50 Z'
mask = 'M 120 92 C 128 84 141 82 151 88 L 162 96 L 152 99 C 146 109 134 119 120 122 C 106 119 94 109 88 99 L 78 96 L 89 88 C 99 82 112 84 120 92 Z'
p.add(path(head, furG, OL, 3), path(mask, cream),
      # огненная метка на лбу
      path('M 120 58 C 116 64 114 68 116 72 C 117 70 118 69 119 70 C 117 73 118 76 120 78 C 122 76 123 73 121 70 C 122 69 123 70 124 72 C 126 68 124 64 120 58 Z', flMid, '#b8380f', 1.2))
# Глаза: миндаль, внешний край вверх; зрачок — щёлочка
p.add('<g id="fox-eyes" class="pt-eyes">')
for side in (1, -1):
    eye = 'M 92 80 C 99 75 109 77 113 86 C 105 89 96 87 92 80 Z'
    if side < 0: eye = mirror(eye)
    cx = 104 if side > 0 else 136
    p.add(path(eye, eyeG, OL, 2.6),
          '<ellipse cx="%g" cy="83" rx="1.7" ry="4.2" fill="#2a0f00"/>' % cx,
          '<circle cx="%g" cy="80.6" r="1.6" fill="#fff"/>' % (cx - 3 * side))
p.add('</g>')
# Брови: левая ниже (уверенно), правая приподнята (с хитринкой)
p.add('<g id="fox-brows" class="pt-brows">',
      path('M 90 74 Q 101 68 113 76', 'none', OL, 3.4),
      path('M 127 74 Q 138 66 150 71', 'none', OL, 3.4), '</g>')
# Нос и ухмылка с клыком
p.add(path('M 113 100 C 115 96 125 96 127 100 C 126 104 122 107 120 107 C 118 107 114 104 113 100 Z', '#24121c', OL, 2),
      '<ellipse cx="117.5" cy="99.5" rx="2.2" ry="1.2" fill="#fff" opacity=".6"/>',
      '<g id="fox-mouth" class="pt-mouth">',
      path('M 120 107 C 119 111 115 114 109 112', 'none', OL, 2.4),
      path('M 120 107 C 122 111 129 113 134 107', 'none', OL, 2.4),
      path('M 127 111 L 129 116 L 131 110 Z', '#fff', OL, 1.2),
      '</g>',
      '<g class="pt-mouth-open">', path('M 109 106 C 113 104 127 104 131 106 C 130 116 125 122 120 122 C 115 122 110 116 109 106 Z', '#5a0f14', OL, 2.2),
      path('M 114 117 C 117 114 123 114 126 117 C 124 120 116 120 114 117 Z', '#ff6b6b'),
      path('M 111 107 L 113 112 L 115 107 Z M 129 107 L 127 112 L 125 107 Z', '#fff'), '</g>')
p.add('<g class="pt-gear-head"></g>', '</g>')
# Искры
p.add('<g id="fox-sparks" class="pt-fx">',
      '<circle cx="40" cy="66" r="2.6" fill="#ffd23a"/><circle cx="60" cy="42" r="2" fill="#ffb21f"/><circle cx="26" cy="104" r="1.8" fill="#ffe27a"/>',
      '</g>')
FOX = p.svg({'pt-tail': (104, 206), 'pt-body': (120, 216), 'pt-head': (120, 126), 'pt-ear l': (96, 70), 'pt-ear r': (144, 70), 'pt-eyes': (120, 83), 'pt-mouth-open': (120, 110), 'pt-glow': (62, 130), 'pt-fx': (60, 80)})
OUT and open(os.path.join(OUT, '1-fox.svg'), 'w').write(FOX)

def crystal(cx, cy, h, w, rot, light, darkf, ol, sw=2):
    """Ледяной кристалл острием вверх: светлая и тёмная грань."""
    left = 'M %g %g L %g %g L %g %g Z' % (cx, cy - h, cx - w, cy, cx, cy + h * .22)
    right = 'M %g %g L %g %g L %g %g Z' % (cx, cy - h, cx + w, cy, cx, cy + h * .22)
    outline = 'M %g %g L %g %g L %g %g L %g %g Z' % (cx, cy - h, cx + w, cy, cx, cy + h * .22, cx - w, cy)
    return ('<g transform="rotate(%g %g %g)">' % (rot, cx, cy) + path(left, light) + path(right, darkf) +
            path(outline, 'none', ol, sw) + path('M %g %g L %g %g' % (cx - w * .45, cy - h * .45, cx - w * .2, cy - h * .7), 'none', '#ffffff', 1.4, ' opacity=".9"') + '</g>')

# ============ Ледяной волк ============
p = P('wolf')
OL = '#0f1b3d'
furG = p.rg('fur', [(0, '#ffffff', None), (.55, '#d6e7fb', None), (1, '#8fb2e3', None)], cx='45%', cy='30%', r='75%')
furDeep = p.rg('furd', [(0, '#c3d8f6', None), (1, '#6f93d1', None)], cx='45%', cy='30%', r='75%')
mane = p.rg('mane', [(0, '#ffffff', None), (1, '#bcd4f4', None)], cx='50%', cy='20%', r='80%')
crL = p.lg('crl', [(0, '#f2feff', None), (1, '#8be3ff', None)])
crD = p.lg('crd', [(0, '#5fd0f7', None), (1, '#1d6fd0', None)])
eyeG = p.rg('eye', [(0, '#ffffff', None), (.45, '#a8f4ff', None), (1, '#1fa7e8', None)], cx='50%', cy='50%', r='60%')
eyeGlow = p.rg('eyeglow', [(0, '#7ff3ff', .7), (1, '#7ff3ff', 0)], cx='50%', cy='50%', r='50%')
aura = p.rg('aura', [(0, '#9fe8ff', .32), (1, '#4fb8ff', 0)], cx='50%', cy='50%', r='50%')
earIn = p.lg('earin', [(0, '#5a7fc0', None), (1, '#a9c3e8', None)])
pawG = p.lg('paw', [(0, '#d6e7fb', None), (1, '#9cbbe8', None)])

p.add('<g class="pt-gear-aura"></g>')
p.add('<ellipse cx="120" cy="150" rx="112" ry="92" fill="%s" class="pt-glow"/>' % aura)
# Хвост: пышный, справа, на кончике — лёд
p.add('<g id="wolf-tail" class="pt-tail">',
      path('M 146 210 C 178 214 208 196 212 164 C 215 142 206 124 196 110 L 193 124 L 184 113 L 184 128 L 174 120 C 181 140 179 160 169 176 C 161 188 152 198 146 210 Z', furG, OL, 3),
      path('M 160 196 C 178 194 196 180 200 160', 'none', '#8fb2e3', 2.4, ' opacity=".8"'),
      crystal(198, 110, 20, 5.5, 18, crL, crD, OL), crystal(208, 124, 14, 4.5, 48, crL, crD, OL),
      '</g>')
p.add('<g class="pt-gear-back"></g>')
# Бёдра и задние лапы
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    haunch = 'M %g 176 C %g 156 %g 156 %g 178 C %g 198 %g 214 %g 216 L %g 216 Z' % (X(104), X(88), X(64), X(57), X(52), X(66), X(86), X(108))
    p.add(path(haunch, furG, OL, 3), path('M %g 184 C %g 170 %g 166 %g 172' % (X(64), X(68), X(80), X(90)), 'none', '#ffffff', 2.6, ' opacity=".8"'))
    foot = 'M %g 216 C %g 207 %g 203 %g 205 C %g 207 %g 214 %g 218 C %g 221 %g 221 %g 216 Z' % (X(54), X(55), X(68), X(82), X(91), X(94), X(90), X(78), X(58), X(54))
    p.add(path(foot, pawG, OL, 2.6), path('M %g 215 l 1 5 M %g 214 l 1 5 M %g 214 l 1 5' % (X(64), X(71), X(78)), 'none', OL, 1.4))
# Тело
p.add('<g id="wolf-body" class="pt-body">',
      path('M 92 116 C 80 134 78 156 82 176 C 88 198 100 214 120 218 C 140 214 152 198 158 176 C 162 156 160 134 148 116 Z', furG, OL, 3),
      path('M 150 132 C 156 150 156 172 150 194', 'none', '#ffffff', 2.4, ' opacity=".7"'),
      path('M 90 136 C 86 152 86 170 90 186', 'none', '#6f93d1', 2.4, ' opacity=".55"'),
      '</g>')
# Передние лапы: мощные, с когтями
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    leg = 'M %g 146 C %g 172 %g 196 %g 214 L %g 214 C %g 196 %g 172 %g 146 Z' % (X(97), X(95), X(96), X(97), X(115), X(115), X(116), X(115))
    p.add(path(leg, furG, OL, 2.8),
          path('M %g 160 C %g 176 %g 194 %g 208' % (X(112), X(112.5), X(112.5), X(112)), 'none', '#8fb2e3', 2.2, ' opacity=".7"'),
          path('M %g 212 C %g 205 %g 204 %g 207 C %g 210 %g 217 %g 220 C %g 221 %g 221 %g 212 Z' % (X(93), X(97), X(114), X(120), X(122), X(121), X(117), X(106), X(95), X(93)), pawG, OL, 2.4),
          path('M %g 219 l -1 4 M %g 220 l 0 4 M %g 219 l 1 4' % (X(100), X(107), X(114)), 'none', '#e8f4ff', 2))
# Грива-воротник
p.add(path('M 82 94 L 75 110 L 86 114 L 79 128 L 92 130 L 88 144 L 102 142 L 103 156 L 113 148 L 120 162 L 127 148 L 137 156 L 138 142 L 152 144 L 148 130 L 161 128 L 154 114 L 165 110 L 158 94 Z', mane, OL, 2.8))
p.add('<g class="pt-gear-neck"></g>')
# Ледяные наплечники: кристаллы растут из гривы на плечах
p.add('<g id="wolf-ice" class="pt-fx pt-ice">')
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    for (x, y, h, w, r) in [(80, 140, 20, 5.5, -52), (82, 128, 32, 8, -32), (92, 120, 22, 6, -14)]:
        p.add(crystal(X(x), y, h, w, r * side, crL, crD, OL))
p.add('</g>')
# Голова
p.add('<g id="wolf-head" class="pt-head">')
for side in (1, -1):
    ear = 'M 86 70 C 81 52 79 38 80 22 C 95 30 106 44 110 58 Z'
    inner = 'M 89 63 C 86 50 85 40 85 31 C 95 38 101 47 104 57 Z'
    if side < 0: ear, inner = mirror(ear), mirror(inner)
    p.add('<g id="wolf-ear%s" class="pt-ear %s">' % ('L' if side > 0 else 'R', 'l' if side > 0 else 'r'), path(ear, furDeep, OL, 3), path(inner, earIn), '</g>')
head = 'M 120 46 C 143 46 160 58 164 76 L 177 80 L 167 88 L 175 96 L 160 99 C 156 113 141 125 120 128 C 99 125 84 113 80 99 L 65 96 L 73 88 L 63 80 L 76 76 C 80 58 97 46 120 46 Z'
p.add(path(head, furG, OL, 3),
      # тёмная «маска» сверху и светлая морда
      path('M 120 50 C 136 50 150 58 156 72 C 146 70 134 74 126 82 L 120 90 L 114 82 C 106 74 94 70 84 72 C 90 58 104 50 120 50 Z', furDeep),
      path('M 120 84 C 131 84 139 93 141 105 C 139 117 131 125 120 127 C 109 125 101 117 99 105 C 101 93 109 84 120 84 Z', '#ffffff', OL, 2.2),
      # кристалл на лбу
      path('M 120 54 L 126 63 L 120 74 L 114 63 Z', crD, OL, 1.8), path('M 120 54 L 114 63 L 120 74 Z', crL))
p.add('<g id="wolf-eyes" class="pt-eyes">')
for side in (1, -1):
    eye = 'M 91 82 C 98 77 107 79 112 86 C 104 90 95 89 91 82 Z'
    if side < 0: eye = mirror(eye)
    cx = 102 if side > 0 else 138
    p.add('<ellipse cx="%g" cy="84" rx="13" ry="9" fill="%s"/>' % (cx, eyeGlow), path(eye, eyeG, OL, 2.6),
          '<circle cx="%g" cy="84.5" r="2.2" fill="#0b3a66"/>' % cx, '<circle cx="%g" cy="82" r="1.4" fill="#fff"/>' % (cx - 2.5 * side))
p.add('</g>',
      '<g id="wolf-brows" class="pt-brows">', path('M 89 74 Q 101 72 113 80', 'none', OL, 3.6), path('M 151 74 Q 139 72 127 80', 'none', OL, 3.6), '</g>',
      path('M 112 107 C 114 102 126 102 128 107 C 127 112 122 115 120 115 C 118 115 113 112 112 107 Z', '#1a2244', OL, 2),
      '<ellipse cx="116.5" cy="106" rx="2.2" ry="1.1" fill="#fff" opacity=".6"/>',
      '<g id="wolf-mouth" class="pt-mouth">',
      path('M 120 115 L 120 119 C 116 122 111 122 107 119 M 120 119 C 124 122 129 122 133 119', 'none', OL, 2.3),
      path('M 109 120 L 111 125 L 113 121 Z', '#ffffff', OL, 1.1), '</g>',
      '<g class="pt-mouth-open">', path('M 108 115 C 112 113 128 113 132 115 C 131 125 126 131 120 131 C 114 131 109 125 108 115 Z', '#1f1b4d', OL, 2.2),
      path('M 113 126 C 116 123 124 123 127 126 C 125 129 115 129 113 126 Z', '#ff8fa8'),
      path('M 110 116 L 112 121 L 114 116 Z M 130 116 L 128 121 L 126 116 Z', '#fff'), '</g>')
p.add('<g class="pt-gear-head"></g>', '</g>')
# Изморозь вокруг
p.add('<g id="wolf-sparks" class="pt-fx">')
for (x, y, r) in [(40, 70, 5), (196, 60, 4), (30, 150, 3.5), (214, 190, 3)]:
    k = r * .3
    p.add('<path d="M %g %g Q %g %g %g %g Q %g %g %g %g Q %g %g %g %g Q %g %g %g %g Z" fill="#dff8ff"/>' % (
        x, y - r, x + k, y - k, x + r, y, x + k, y + k, x, y + r, x - k, y + k, x - r, y, x - k, y - k, x, y - r))
p.add('</g>')
WOLF = p.svg({'pt-tail': (150, 206), 'pt-body': (120, 216), 'pt-head': (120, 128), 'pt-ear l': (96, 66), 'pt-ear r': (144, 66), 'pt-eyes': (120, 84), 'pt-mouth-open': (120, 120), 'pt-glow': (120, 150), 'pt-fx pt-ice': (120, 130), 'pt-fx': (120, 120)})
OUT and open(os.path.join(OUT, '2-wolf.svg'), 'w').write(WOLF)

# ============ Грозовой дракон ============
p = P('drake')
OL = '#160c3d'
sc = p.rg('scale', [(0, '#a796ff', None), (.5, '#6a4ff0', None), (1, '#3a26a8', None)], cx='45%', cy='30%', r='75%')
scDeep = p.rg('scaled', [(0, '#5b43d6', None), (1, '#241773', None)], cx='45%', cy='30%', r='80%')
belly = p.lg('belly', [(0, '#fff2a8', None), (1, '#f2b733', None)])
wingM = p.lg('wing', [(0, '#5a45e0', None), (1, '#24177a', None)], 0, 0, 1, 1)
horn = p.lg('horn', [(0, '#fffdf2', None), (1, '#d9c79a', None)])
eyeG = p.rg('eye', [(0, '#ffffff', None), (.4, '#f6ff7a', None), (1, '#ffb800', None)], cx='50%', cy='50%', r='60%')
bolt = p.lg('bolt', [(0, '#fffbd0', None), (1, '#ffd21f', None)])
aura = p.rg('aura', [(0, '#8f7cff', .35), (1, '#5a45e0', 0)], cx='50%', cy='50%', r='50%')
spark = p.rg('spark', [(0, '#fff7a8', .9), (1, '#ffd21f', 0)], cx='50%', cy='50%', r='50%')

p.add('<g class="pt-gear-aura"></g>')
p.add('<ellipse cx="120" cy="140" rx="116" ry="98" fill="%s" class="pt-glow"/>' % aura)
# Крылья
p.add('<g id="drake-wings" class="pt-wings">')
for side in (1, -1):
    wing = 'M 98 122 L 74 58 L 34 30 C 42 54 38 78 20 98 C 40 96 50 106 52 120 C 62 110 74 112 80 124 C 86 120 92 120 98 122 Z'
    bones = 'M 74 58 L 52 120 M 74 58 L 20 98 M 74 58 L 80 124'
    edge = 'M 34 30 C 42 54 38 78 20 98 C 40 96 50 106 52 120 C 62 110 74 112 80 124'
    if side < 0: wing, bones, edge = mirror(wing), mirror(bones), mirror(edge)
    p.add('<g class="pt-wing %s">' % ('l' if side > 0 else 'r'), path(wing, wingM, OL, 3), path(bones, 'none', '#9b86ff', 2.4, ' opacity=".85"'),
          path(edge, 'none', '#7df9ff', 1.6, ' opacity=".7"'), '</g>')
p.add('</g>')
p.add('<g class="pt-gear-back"></g>')
# Хвост справа, кончик — молния
p.add('<g id="drake-tail" class="pt-tail">',
      path('M 146 208 C 176 214 200 200 198 176 C 197 160 186 150 190 132', 'none', OL, 15),
      path('M 146 208 C 176 214 200 200 198 176 C 197 160 186 150 190 132', 'none', '#6a4ff0', 9.5),
      path('M 160 212 L 164 204 L 170 212 L 176 203 L 182 209 L 186 198 L 192 202', 'none', '#3a26a8', 2.2),
      path('M 190 134 L 180 120 L 192 118 L 184 98 L 206 122 L 194 124 L 202 138 Z', bolt, OL, 2.6),
      '</g>')
# Бёдра и задние лапы с когтями
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    p.add(path('M %g 174 C %g 154 %g 152 %g 174 C %g 194 %g 212 %g 216 L %g 216 Z' % (X(104), X(88), X(62), X(55), X(50), X(64), X(86), X(108)), sc, OL, 3),
          path('M %g 178 C %g 166 %g 162 %g 168' % (X(64), X(70), X(80), X(88)), 'none', '#b9abff', 2.4, ' opacity=".7"'),
          path('M %g 216 C %g 208 %g 205 %g 207 C %g 209 %g 215 %g 218 C %g 220 %g 220 %g 216 Z' % (X(54), X(56), X(68), X(82), X(90), X(92), X(88), X(76), X(58), X(54)), scDeep, OL, 2.6))
    for k in range(3):
        x = X(58 + k * 10)
        p.add(path('M %g 217 L %g 224 L %g 217' % (x - 2.5, x + 1 * side, x + 2.5), horn, OL, 1.4))
# Тело и брюшко
p.add('<g id="drake-body" class="pt-body">',
      path('M 92 118 C 78 138 76 166 82 188 C 90 208 104 216 120 216 C 136 216 150 208 158 188 C 164 166 162 138 148 118 Z', sc, OL, 3),
      path('M 103 122 C 98 150 100 180 108 210 L 132 210 C 140 180 142 150 137 122 Z', belly, OL, 2.4))
for y in (136, 150, 164, 178, 192):
    p.add(path('M %g %g Q 120 %g %g %g' % (102 + (y - 122) * .03, y, y + 4, 138 - (y - 122) * .03, y), 'none', '#c98a1a', 1.8))
p.add('</g>')
# Передние лапы с когтями
for side in (1, -1):
    def X(x): return 120 + (x - 120) * side
    p.add(path('M %g 146 C %g 170 %g 194 %g 212 L %g 212 C %g 194 %g 170 %g 146 Z' % (X(92), X(90), X(93), X(95), X(111), X(111), X(111), X(108)), sc, OL, 2.8),
          path('M %g 210 C %g 204 %g 203 %g 206 C %g 209 %g 215 %g 217 C %g 218 %g 218 %g 210 Z' % (X(90), X(94), X(110), X(115), X(117), X(116), X(112), X(102), X(92), X(90)), scDeep, OL, 2.4))
    for k in range(3):
        x = X(96 + k * 7)
        p.add(path('M %g 216 L %g 223 L %g 216' % (x - 2.4, x, x + 2.4), horn, OL, 1.3))
p.add('<g class="pt-gear-neck"></g>')
# Голова
p.add('<g id="drake-head" class="pt-head">')
# гребень за головой
p.add(path('M 104 52 L 108 38 L 114 50 L 120 34 L 126 50 L 132 38 L 136 52 Z', '#ffd21f', OL, 2.4))
for side in (1, -1):
    hornp = 'M 98 64 C 88 52 80 38 82 20 C 92 32 104 44 110 56 Z'
    if side < 0: hornp = mirror(hornp)
    p.add('<g id="drake-horn%s" class="pt-ear %s">' % ('L' if side > 0 else 'R', 'l' if side > 0 else 'r'), path(hornp, horn, OL, 2.8),
          path(('M 86 40 C 90 46 96 52 102 56' if side > 0 else mirror('M 86 40 C 90 46 96 52 102 56')), 'none', '#c9b37e', 1.6),
          '<circle cx="%g" cy="22" r="7" fill="%s"/>' % (82 if side > 0 else 158, spark), '</g>')
head = 'M 120 50 C 145 50 162 64 162 86 C 162 98 156 106 148 110 L 142 120 C 136 126 128 129 120 129 C 112 129 104 126 98 120 L 92 110 C 84 106 78 98 78 86 C 78 64 95 50 120 50 Z'
p.add(path(head, sc, OL, 3),
      # щёчные шипы
      path('M 80 92 L 66 90 L 78 100 L 68 104 L 84 106 Z', scDeep, OL, 2.2), path(mirror('M 80 92 L 66 90 L 78 100 L 68 104 L 84 106 Z'), scDeep, OL, 2.2),
      # морда светлее
      path('M 120 94 C 134 94 146 102 146 112 C 142 122 132 128 120 128 C 108 128 98 122 94 112 C 94 102 106 94 120 94 Z', '#9b86ff', None, 0, ' opacity=".55"'),
      '<ellipse cx="112" cy="104" rx="2.4" ry="1.6" fill="%s"/><ellipse cx="128" cy="104" rx="2.4" ry="1.6" fill="%s"/>' % (OL, OL))
p.add('<g id="drake-eyes" class="pt-eyes">')
for side in (1, -1):
    eye = 'M 90 80 C 97 74 107 76 112 84 C 104 88 95 87 90 80 Z'
    if side < 0: eye = mirror(eye)
    cx = 101 if side > 0 else 139
    p.add(path(eye, eyeG, OL, 2.6), '<ellipse cx="%g" cy="81.5" rx="1.6" ry="4" fill="#3a2a00"/>' % cx, '<circle cx="%g" cy="79" r="1.4" fill="#fff"/>' % (cx - 2.5 * side))
p.add('</g>',
      '<g id="drake-brows" class="pt-brows">', path('M 86 72 L 100 68 L 113 76', 'none', OL, 3.6), path('M 154 70 L 141 66 L 127 76', 'none', OL, 3.6), '</g>',
      '<g id="drake-mouth" class="pt-mouth">',
      path('M 100 112 C 108 120 132 120 140 110', 'none', OL, 2.6),
      path('M 107 116 L 109 122 L 112 117 Z', '#ffffff', OL, 1.2), path('M 133 116 L 131 122 L 128 117 Z', '#ffffff', OL, 1.2), '</g>',
      '<g class="pt-mouth-open">', path('M 98 109 C 110 112 130 112 142 108 C 140 122 130 130 120 130 C 110 130 100 122 98 109 Z', '#3a0d2a', OL, 2.4),
      path('M 108 124 C 114 120 126 120 132 124 C 128 128 112 128 108 124 Z', '#ff5c8a'),
      path('M 103 110 L 106 117 L 109 111 Z M 137 110 L 134 117 L 131 111 Z M 113 112 L 115 116 L 117 112 Z M 127 112 L 125 116 L 123 112 Z', '#fff'), '</g>')
p.add('<g class="pt-gear-head"></g>', '</g>')
# Искры-молнии
p.add('<g id="drake-sparks" class="pt-fx">',
      path('M 70 20 L 76 28 L 70 30 L 78 40', 'none', '#ffe14d', 2.4), path('M 170 20 L 164 28 L 170 30 L 162 40', 'none', '#7df9ff', 2.4),
      path('M 26 150 L 32 156 L 26 160 L 34 168', 'none', '#ffe14d', 2), '</g>')
DRAKE = p.svg({'pt-tail': (148, 208), 'pt-body': (120, 216), 'pt-head': (120, 128), 'pt-ear l': (102, 60), 'pt-ear r': (138, 60), 'pt-eyes': (120, 81), 'pt-mouth-open': (120, 118), 'pt-glow': (120, 140), 'pt-fx': (120, 80), 'pt-wing l': (98, 122), 'pt-wing r': (142, 122)})
OUT and open(os.path.join(OUT, '3-drake.svg'), 'w').write(DRAKE)

import json, re
# Золотой облик: каждый цвет — в золото той же яркости (тёмное — в бронзу, светлое — в бледное золото)
GOLD = [(0.0, (46, 26, 0)), (0.3, (128, 84, 0)), (0.55, (214, 152, 0)), (0.75, (255, 206, 64)), (0.9, (255, 236, 150)), (1.0, (255, 250, 222))]
def to_gold(m):
    h = m.group(0)[1:]
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    L = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    for (a, ca), (bb, cb) in zip(GOLD, GOLD[1:]):
        if L <= bb:
            k = (L - a) / (bb - a) if bb > a else 0
            c = [round(x + (y - x) * k) for x, y in zip(ca, cb)]
            return '#%02x%02x%02x' % tuple(c)
    return '#fffade'
def gold(svg, kind):
    return re.sub(r'#[0-9a-fA-F]{6}\b', to_gold, svg).replace('class="pet pet-%s"' % kind, 'class="pet pet-%s gold"' % kind)
ART = {'fox': FOX, 'wolf': WOLF, 'drake': DRAKE}
for k in list(ART): ART[k + '_gold'] = gold(ART[k], k)
if OUT:
    for k in ('fox', 'wolf', 'drake'):
        open(os.path.join(OUT, '9-%s-gold.svg' % k), 'w').write(ART[k + '_gold'])
with open(os.path.join(ROOT, 'js', 'pet-art.js'), 'w', encoding='utf-8') as f:
    f.write('// Рисунки питомцев. Собирает tools/pets/pets.py — правьте там, не здесь.\n'
            '// *_gold — золотой облик (10-й уровень): те же рисунки в золоте\n'
            'const PET_ART = ' + json.dumps(ART, ensure_ascii=False, indent=0) + ';\n')
print('art', len(FOX), len(WOLF), len(DRAKE))
