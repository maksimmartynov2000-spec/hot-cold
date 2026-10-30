// Режимы дня и рамки живут в двух местах: в браузере и в базе. Достаём списки
// из кода игры и сверяем с SQL (test_daily_weekend.sql)
const fs = require('fs');
const path = require('path');
const html = require('./game_source')();
const pick = name => {
  const m = html.match(new RegExp('const ' + name + ' = (\\[[^\\]]*\\]);'));
  if (!m) throw new Error('не нашёл ' + name + ' в коде игры');
  return JSON.parse(m[1].replace(/'/g, '"'));
};
const rows = pick('DAILY_VARIANTS').map((c, i) => 'daily,' + (i + 1) + ',' + c)
  .concat(pick('PASS_FRAMES').map((c, i) => 'frame,' + (i + 1) + ',' + c));
fs.writeFileSync(path.join(__dirname, 'pass_sets_js.csv'), ['kind,n,code'].concat(rows).join('\n') + '\n');
console.log('наборов из кода игры:', rows.length);
