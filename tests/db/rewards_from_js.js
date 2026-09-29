// Награды за лиги живут в двух местах: в браузере (LEAGUE_REWARDS) и в базе
// (league_rewards). Достаём список из кода игры и сверяем с SQL
const fs = require('fs');
const path = require('path');
const html = require('./game_source')();
const m = html.match(/const LEAGUE_REWARDS = \[([\s\S]*?)\];/);
if (!m) throw new Error('не нашёл LEAGUE_REWARDS в коде игры');
const rows = [...m[1].matchAll(/league: (\d+), kind: '([a-z]+)', value: '([^']+)'/g)].map(r => [r[1], r[2], r[3]].join(','));
if (rows.length !== 15) throw new Error('наград в коде игры: ' + rows.length);
fs.writeFileSync(path.join(__dirname, 'rewards_js.csv'), ['league,kind,value'].concat(rows).join('\n') + '\n');
console.log('наград из кода игры:', rows.length);
