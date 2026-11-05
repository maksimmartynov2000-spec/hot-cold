# Включить миры 36–45: python3 -I activate4.py <корень> [art] — art: портреты 351–450 уже в icons/
import os, re, sys
root = sys.argv[1]
art = len(sys.argv) > 2 and sys.argv[2] == 'art'
p = os.path.join(root, 'js', 'adventure.js')
s = open(p, encoding='utf-8').read()
anchor = "  { key: 'forge', range: 500, color: '#c0392b', bonus: 'lava', rule: 'traps' }"
assert s.count(anchor) == 1, 'сначала миры 26–35'
if "key: 'stadium'" not in s:
    s = s.replace(anchor, anchor + """,
  // Волна 8
  { key: 'stadium', range: 200, color: '#ff9f1c', bonus: 'shield' },
  { key: 'detective', range: 300, color: '#8d6e63', bonus: 'compass' },
  { key: 'galapagos', range: 300, color: '#26a69a', bonus: 'div3', rule: 'storm' },
  { key: 'wildwest', range: 400, color: '#c56b2c', bonus: 'thief', rule: 'first' },
  { key: 'yokai', range: 500, color: '#e84a5f', bonus: 'mirror', rule: 'traps', frost: true },
  // Волна 9
  { key: 'indonesia', range: 200, color: '#00b894', bonus: 'half' },
  { key: 'academy', range: 300, color: '#0984e3', bonus: 'div5', rule: 'storm' },
  { key: 'temple', range: 400, color: '#c0a062', bonus: 'lava', rule: 'traps' },
  { key: 'steppe', range: 400, color: '#a3cb38', bonus: 'xray', rule: 'first' },
  { key: 'asgard', range: 500, color: '#4a69bd', bonus: 'thief', frost: true }""")
open(p, 'w', encoding='utf-8').write(s)
if art:
    p = os.path.join(root, 'js', 'art.js')
    a = open(p, encoding='utf-8').read()
    a2 = re.sub(r'const ADV_ART = \d+;', 'const ADV_ART = 450;', a)
    assert a2 != a or 'ADV_ART = 450' in a
    open(p, 'w', encoding='utf-8').write(a2)
print('ok')
