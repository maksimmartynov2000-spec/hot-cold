// Набор иконок живёт в двух местах: в браузере и в базе. Копия рядом разошлась
// бы незаметно, поэтому список достаём прямо из кода игры и сверяем с SQL.
const fs = require('fs');
const path = require('path');
const html = require('./game_source')();
const m = html.match(/const AVATAR_CHOICES = (\[[^\]]*\]);/);
if (!m) throw new Error('не нашёл AVATAR_CHOICES в коде игры');
const list = JSON.parse(m[1].replace(/'/g, '"'));
fs.writeFileSync(path.join(__dirname, 'avatars_js.csv'), ['avatar'].concat(list).join('\n') + '\n');
console.log('набор иконок из кода игры:', list.length);

// Цвета фона — так же: копия в базе (avatar_colors) сверяется с этой
const c = html.match(/const AVATAR_BG = (\[[^\]]*\]);/);
if (!c) throw new Error('не нашёл AVATAR_BG в коде игры');
const colors = JSON.parse(c[1].replace(/'/g, '"'));
fs.writeFileSync(path.join(__dirname, 'avatar_colors_js.csv'), ['color'].concat(colors).join('\n') + '\n');
console.log('цветов фона из кода игры:', colors.length);

// Иконки боссов Приключения — копия в базе (adventure_icons). У первых пяти
// миров — эмодзи из ADV_WORLDS, дальше — портрет босса (как ADV_ICONS в игре)
const emoji = [...html.matchAll(/color: '[^']+', boss: '([^']+)'/g)].map(m => m[1]);
const max = html.match(/const ADV_WORLD_MAX = (\d+);/);
if (emoji.length !== 5 || !max) throw new Error('не нашёл иконки боссов Приключения в коде игры');
const adv = Array.from({ length: +max[1] }, (_, w) => w < 5 ? emoji[w] : 'adv-' + (w + 1) * 10);
fs.writeFileSync(path.join(__dirname, 'adventure_icons_js.csv'), ['icon'].concat(adv).join('\n') + '\n');
console.log('иконок боссов из кода игры:', adv.length);
