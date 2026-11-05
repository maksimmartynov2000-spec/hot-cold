# Проверка файла текстов партии: python3 -I tools/adventure/check.py <партия> <язык>
import re, sys, json, os
b, lang = int(sys.argv[1]), sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
def load(f):
    g = {}; exec(open(os.path.join(here, f), encoding='utf-8').read(), g); return g
S = load('spec%d.py' % b)['S']
T = load('t%d_%s.py' % (b, lang))
TELL = {'tellDir', 'tellParity', 'tellHalf'}
bad = []
for i, (s, h) in enumerate(zip(S, T['H'])):
    keys = ['n', 'a1t', 'a1d', 'a2t', 'a2d', 'hi', 'a1', 'a2', 'luck', 'worry', 'win', 'lose'] if s.get('boss') else ['n', 't', 'd', 'hi', 'rule', 'luck', 'worry', 'win', 'lose']
    if sorted(h) != sorted(keys): bad.append((i, 'keys', sorted(h)))
    ons = [('a1', s['a1']), ('a2', s['a2'])] if s.get('boss') else ([('rule', s['on'])] if s.get('on') else [])
    for kind, on in ons:
        if ('{k}' in h.get(kind, '')) != (on[1] in TELL): bad.append((i, kind, on[1], h.get(kind)))
# Прозвища: не повторяются среди всех героев этого языка (вместе с прошлыми партиями и первыми 50)
names = [h['n'] for h in T['H']]
prev = []
for pb in range(1, b):
    prev += [h['n'] for h in load('t%d_%s.py' % (pb, lang))['H']]
root = os.path.join(here, '..', '..')
src = open(os.path.join(root, 'js/i18n.js'), encoding='utf-8').read()
i = src.index('\n  %s: {' % lang); j = src.index('adv: {"goldGoal', i)
first = json.JSONDecoder().raw_decode(src[j + 5:])[0]['names']
allnames = first + prev + names
nick = (lambda n: (re.match(r'^(.*?) the ', n) or [None, ''])[1]) if lang == 'en' else (lambda n: ' '.join(n.split(' ')[1:]))
seen = {}
for k, n in enumerate(allnames):
    x = nick(n).lower()
    if x: seen.setdefault(x, []).append(n)
dups = [v for v in seen.values() if len(v) > 1 and any(n in names for n in v)]
print(lang, 'героев', len(T['H']), 'миров', len(T['WORLDS']), 'ошибок', len(bad), 'повторов имён', len(set(allnames)) != len(allnames))
for x in bad[:10]: print('  ', x)
print('  прозвища-повторы:', dups)
