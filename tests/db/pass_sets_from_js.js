// Рамки пути и бонусы партий с другом живут в двух местах: в браузере и в базе. Достаём списки
// из кода игры и сверяем с SQL (test_no_online.sql, test_online_adv_bonuses.sql)
const fs = require('fs');
const path = require('path');
const html = require('./game_source')();
const pick = name => {
  const m = html.match(new RegExp('const ' + name + ' = (\\[[^\\]]*\\]);'));
  if (!m) throw new Error('не нашёл ' + name + ' в коде игры');
  return JSON.parse(m[1].replace(/'/g, '"'));
};
const rows = pick('PASS_FRAMES').map((c, i) => 'frame,' + (i + 1) + ',' + c)
  .concat(pick('BONUS_ONLINE').map((c, i) => 'bonus,' + (i + 1) + ',' + c));
fs.writeFileSync(path.join(__dirname, 'pass_sets_js.csv'), ['kind,n,code'].concat(rows).join('\n') + '\n');
console.log('наборов из кода игры:', rows.length);
