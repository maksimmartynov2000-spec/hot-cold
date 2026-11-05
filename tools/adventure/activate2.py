# Включить миры 16–25: python3 -I activate2.py <корень> [art] — art: портреты 151–250 уже в icons/
import os, re, sys
root = sys.argv[1]
art = len(sys.argv) > 2 and sys.argv[2] == 'art'
p = os.path.join(root, 'js', 'adventure.js')
s = open(p, encoding='utf-8').read()
anchor = "  { key: 'castle', range: 500, color: '#e6b422', bonus: 'mirror' }"
assert s.count(anchor) == 1
if "key: 'savanna'" not in s:
    s = s.replace(anchor, anchor + """,
  // Волна 4
  { key: 'savanna', range: 100, color: '#f0a04b', bonus: 'shield' },
  { key: 'dragons', range: 150, color: '#e8553f', bonus: 'lava' },
  { key: 'abyss', range: 300, color: '#2e86de', bonus: 'xray', frost: true },
  { key: 'bamboo', range: 300, color: '#4cc38a', bonus: 'div3' },
  { key: 'ufo', range: 500, color: '#5b6cff', bonus: 'div5', rule: 'first' },
  // Волна 5
  { key: 'australia', range: 150, color: '#ff7f50', bonus: 'thief' },
  { key: 'circus', range: 200, color: '#e84393', bonus: 'mirror', rule: 'storm' },
  { key: 'crystal', range: 300, color: '#7ed6df', bonus: 'compass' },
  { key: 'mammoth', range: 400, color: '#74b9ff', bonus: 'freeze', frost: true },
  { key: 'rainbow', range: 500, color: '#fd79a8', bonus: 'half' }""")
open(p, 'w', encoding='utf-8').write(s)
if art:
    p = os.path.join(root, 'js', 'art.js')
    a = open(p, encoding='utf-8').read()
    a2 = re.sub(r'const ADV_ART = \d+;', 'const ADV_ART = 250;', a)
    assert a2 != a or 'ADV_ART = 250' in a
    open(p, 'w', encoding='utf-8').write(a2)
print('ok')
