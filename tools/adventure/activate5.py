# Включить миры 46–50: python3 -I activate5.py <корень> [art] — art: портреты 451–500 уже в icons/
import os, re, sys
root = sys.argv[1]
art = len(sys.argv) > 2 and sys.argv[2] == 'art'
p = os.path.join(root, 'js', 'adventure.js')
s = open(p, encoding='utf-8').read()
anchor = "  { key: 'asgard', range: 500, color: '#4a69bd', bonus: 'thief', frost: true }"
assert s.count(anchor) == 1, 'сначала миры 36–45'
if "key: 'newzealand'" not in s:
    s = s.replace(anchor, anchor + """,
  // Волна 10
  { key: 'newzealand', range: 300, color: '#3dc1d3', bonus: 'shield' },
  { key: 'amazon', range: 300, color: '#009432', bonus: 'half', rule: 'traps' },
  { key: 'magic', range: 400, color: '#9b59b6', bonus: 'mirror', rule: 'storm' },
  { key: 'heroes', range: 500, color: '#ff3f34', bonus: 'xray', rule: 'first' },
  { key: 'time', range: 500, color: '#f9ca24', bonus: 'freeze', rule: 'storm', frost: true }""")
open(p, 'w', encoding='utf-8').write(s)
if art:
    p = os.path.join(root, 'js', 'art.js')
    a = open(p, encoding='utf-8').read()
    a2 = re.sub(r'const ADV_ART = \d+;', 'const ADV_ART = 500;', a)
    assert a2 != a or 'ADV_ART = 500' in a
    open(p, 'w', encoding='utf-8').write(a2)
print('ok')
