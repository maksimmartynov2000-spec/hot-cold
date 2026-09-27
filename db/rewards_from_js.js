// Награды за лиги живут в двух местах: в браузере (LEAGUE_REWARDS) и в базе
// (league_rewards). Достаём список из index.html и сверяем с SQL
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/const LEAGUE_REWARDS = \[([\s\S]*?)\];/);
if (!m) throw new Error('не нашёл LEAGUE_REWARDS в index.html');
const rows = [...m[1].matchAll(/league: (\d+), kind: '([a-z]+)', value: '([^']+)'/g)].map(r => [r[1], r[2], r[3]].join(','));
if (rows.length !== 15) throw new Error('наград в index.html: ' + rows.length);
fs.writeFileSync(path.join(__dirname, 'rewards_js.csv'), ['league,kind,value'].concat(rows).join('\n') + '\n');
console.log('наград из index.html:', rows.length);
