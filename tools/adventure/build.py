# Сборка Приключения из партий: правила (specN.py) → js/adventure.js (ADV_HEROES),
# тексты (tN_<язык>.py) → js/adv-<язык>.js, сила (levelsN.json) → level и ADV_BRAIN_SHIFT.
# Партия без текстов попадает только в правила. Запуск из корня репозитория:
#   python3 -I tools/adventure/build.py . <партий>
import json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
root = sys.argv[1]
NB = int(sys.argv[2]) if len(sys.argv) > 2 else 2
LANGS = ('ru', 'en', 'fr', 'de')
def load(name):
    g = {}
    exec(open(os.path.join(here, name), encoding='utf-8').read(), g)
    return g
S, T, LV = [], {l: {'WORLDS': [], 'H': []} for l in LANGS}, {'shift': {}, 'level': {}}
texts_upto, sizes = 0, []
for b in range(1, NB + 1):
    part = load('spec%d.py' % b)['S']
    # Партия — 10 миров (100 героев); последняя, пятая, — 5 миров (50)
    assert len(part) == (50 if b == 5 else 100), (b, len(part))
    S += part; sizes.append(len(part))
    lf = os.path.join(here, 'levels%d.json' % b)
    if os.path.exists(lf):
        d = json.load(open(lf))
        LV['shift'].update(d['shift']); LV['level'].update(d['level'])
    if all(os.path.exists(os.path.join(here, 't%d_%s.py' % (b, l))) for l in LANGS) and texts_upto == b - 1:
        for l in LANGS:
            g = load('t%d_%s.py' % (b, l))
            T[l]['WORLDS'] += g['WORLDS']; T[l]['H'] += g['H']
        texts_upto = b
for i, s_ in enumerate(S):
    v = LV['level'].get(str(50 + i), 0)
    if v: s_['level'] = v
# Имена миров для комментариев: из текстов, а пока их нет — из списка портретов
def worlds_ru(b):
    if os.path.exists(os.path.join(here, 't%d_ru.py' % b)): return load('t%d_ru.py' % b)['WORLDS']
    return [w for w, _ in load(os.path.join('portraits', 'heroes%d.py' % b))['W']]
WORLDS_RU = sum((worlds_ru(b) for b in range(1, NB + 1)), [])

TELL = {'tellDir', 'tellParity', 'tellHalf', 'tellDiv3', 'tellDiv5', 'tellTens', 'tellUnits'}
def acts(s):
    if s.get('boss'): return [('a1', s['a1']), ('a2', s['a2'])]
    return [('rule', s['on'])] if s.get('on') else []
# Проверки: у каждого героя все поля, {k} — ровно там, где правило что-то говорит
for lang, g in T.items():
    H = g['H']
    assert len(H) == sum(sizes[:texts_upto]), (lang, len(H))
    names = [h['n'] for h in H]
    assert len(set(names)) == len(names), (lang, [n for n in names if names.count(n) > 1])
    for i, h in enumerate(H):
        s = S[i]
        keys = ['n', 'a1t', 'a1d', 'a2t', 'a2d', 'hi', 'a1', 'a2', 'luck', 'worry', 'win', 'lose'] if s.get('boss') \
            else ['n', 't', 'd', 'hi', 'rule', 'luck', 'worry', 'win', 'lose']
        assert sorted(h) == sorted(keys), (lang, i, sorted(h))
        assert all(isinstance(h[k], str) and h[k].strip() for k in keys), (lang, i)
        for kind, on in acts(s):
            assert ('{k}' in h[kind]) == (on[1] in TELL), (lang, i, kind, h[kind])
        for k in keys:
            if k not in ('rule', 'a1', 'a2'):
                assert '{k}' not in h[k], (lang, i, k)
            assert not re.search(r'\{(?!k\})', h[k]), (lang, i, k, h[k])

def js(v):
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return repr(v)
    if isinstance(v, str): return "'" + v.replace('\\', '\\\\').replace("'", "\\'") + "'"
    if isinstance(v, list): return '[' + ', '.join(js(x) for x in v) + ']'
    raise TypeError(v)
ORDER = ['boss', 'icon', 'on', 'a1icon', 'a1', 'a2icon', 'a2', 'pick', 'first', 'think', 'immune', 'level', 'tokens', 'frost']
lines = ['// Герои миров 6–50: правило — запись, а не функция (см. advCompile). Номер',
         '// героя n = 50 + индекс; тексты — в js/adv-<язык>.js в том же порядке',
         'const ADV_HEROES = [']
for i, s in enumerate(S):
    if i % 10 == 0:
        w = 5 + i // 10
        lines.append('  // %d · %s (%d–%d)' % (w + 1, WORLDS_RU[w - 5], 51 + i, 60 + i))
    extra = [k for k in s if k not in ORDER]
    assert not extra, extra
    lines.append('  { ' + ', '.join('%s: %s' % (k, js(s[k])) for k in ORDER if k in s) + ' },')
lines[-1] = lines[-1].rstrip(',')
lines.append('];')
block = '\n'.join(lines) + '\n'

path = os.path.join(root, 'js', 'adventure.js')
src = open(path, encoding='utf-8').read()
start = src.find('// Герои миров 6–50: правило — запись')
end = src.index('];\n', start) + 3
src = src[:start] + block + src[end:]
# Сдвиг силы миров с шестого (подобран симуляцией): ADV_BRAIN_SHIFT[5…]
m = re.search(r'const ADV_BRAIN_SHIFT = \[([^\]]*)\];', src)
head = [x.strip() for x in m.group(1).split(',')][:5]
ws = sorted(int(w) for w in LV['shift'])
vals = head + ['%g' % LV['shift'][str(w)] for w in range(5, ws[-1] + 1)] if ws else head
src = src[:m.start()] + 'const ADV_BRAIN_SHIFT = [' + ', '.join(vals) + '];' + src[m.end():]
open(path, 'w', encoding='utf-8').write(src)

HEAD = {
    'ru': 'Приключение: тексты соперников миров 6–{w} (герои 51–{n}) на русском.',
    'en': 'Adventure: rival texts for worlds 6–{w} (heroes 51–{n}) in English.',
    'fr': 'Aventure : textes des adversaires des mondes 6 à {w} (héros 51–{n}) en français.',
    'de': 'Abenteuer: Texte der Gegner der Welten 6–{w} (Helden 51–{n}) auf Deutsch.',
}
NBSP = ' '
def tidy(lang, v):
    v = v.replace('⚡ +1 ', '⚡' + NBSP + '+1' + NBSP)
    if lang == 'fr':
        v = re.sub(r' ([!?:;»])', NBSP + r'\1', v)
        v = v.replace('« ', '«' + NBSP)
    return v
for lang, g in T.items():
    H = g['H']
    cast = [{k: tidy(lang, v) for k, v in h.items() if k != 'n'} for h in H]
    out = ['// ' + HEAD[lang].replace('{w}', str(5 + len(H) // 10)).replace('{n}', str(50 + len(H))),
           '// Грузится, когда нужен (advLoadPack в js/adventure.js); порядок — как в ADV_HEROES',
           'ADV_PACKS.%s = {' % lang,
           '  "worlds": ' + json.dumps(g['WORLDS'], ensure_ascii=False) + ',',
           '  "names": [']
    for i, h in enumerate(H):
        out.append('    ' + json.dumps(h['n'], ensure_ascii=False) + (',' if i < len(H) - 1 else ''))
    out.append('  ],')
    out.append('  "cast": [')
    for i, c in enumerate(cast):
        out.append('    ' + json.dumps(c, ensure_ascii=False) + (',' if i < len(cast) - 1 else ''))
    out.append('  ]')
    out.append('};')
    open(os.path.join(root, 'js', 'adv-%s.js' % lang), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('ok: правил', len(S), 'текстов', len(T['ru']['H']))
