// Персонажи-боты живут в двух местах: в браузере (BOTS) и в базе
// (bot_personas). Достаём список из кода игры и сверяем с SQL
const fs = require('fs');
const path = require('path');
const html = require('./game_source')();
const m = html.match(/const BOTS = \[([\s\S]*?)\];/);
if (!m) throw new Error('не нашёл BOTS в коде игры');
const rows = [...m[1].matchAll(/id: '([^']+)'[^}]*icon: '([^']+)'[^}]*color: '([^']+)'/g)]
  .map(r => [r[1], r[2], r[3]].join(','));
if (rows.length !== 5) throw new Error('ботов в коде игры: ' + rows.length);
fs.writeFileSync(path.join(__dirname, 'bots_js.csv'), ['username,icon,color'].concat(rows).join('\n') + '\n');
console.log('ботов из кода игры:', rows.length);
