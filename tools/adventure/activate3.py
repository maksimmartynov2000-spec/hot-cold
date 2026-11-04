# Включить миры 26–35: python3 -I activate3.py <корень> [art] — art: портреты 251–350 уже в icons/
import os, re, sys
root = sys.argv[1]
art = len(sys.argv) > 2 and sys.argv[2] == 'art'
p = os.path.join(root, 'js', 'adventure.js')
s = open(p, encoding='utf-8').read()
anchor = "  { key: 'rainbow', range: 500, color: '#fd79a8', bonus: 'half' }"
assert s.count(anchor) == 1, 'сначала миры 16–25'
if "key: 'swamp'" not in s:
    s = s.replace(anchor, anchor + """,
  // Волна 6
  { key: 'swamp', range: 150, color: '#5f8f3e', bonus: 'shield' },
  { key: 'music', range: 200, color: '#00b8a9', bonus: 'half' },
  { key: 'peaks', range: 300, color: '#6c8ebf', bonus: 'freeze', frost: true },
  { key: 'robots', range: 400, color: '#95a5a6', bonus: 'xray' },
  { key: 'myths', range: 500, color: '#8e44ad', bonus: 'lava' },
  // Волна 7
  { key: 'autumn', range: 200, color: '#d35400', bonus: 'shield' },
  { key: 'kitchen', range: 300, color: '#ff9f80', bonus: 'half' },
  { key: 'atlantis', range: 300, color: '#16a085', bonus: 'xray', frost: true },
  { key: 'dreams', range: 400, color: '#6c5ce7', bonus: 'freeze' },
  { key: 'forge', range: 500, color: '#c0392b', bonus: 'lava' }""")
open(p, 'w', encoding='utf-8').write(s)
if art:
    p = os.path.join(root, 'js', 'art.js')
    a = open(p, encoding='utf-8').read()
    a2 = re.sub(r'const ADV_ART = \d+;', 'const ADV_ART = 350;', a)
    assert a2 != a or 'ADV_ART = 350' in a
    open(p, 'w', encoding='utf-8').write(a2)
print('ok')
