// Набор иконок живёт в двух местах: в браузере и в базе. Копия рядом разошлась
// бы незаметно, поэтому список достаём прямо из index.html и сверяем с SQL.
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/const AVATAR_CHOICES = (\[[^\]]*\]);/);
if (!m) throw new Error('не нашёл AVATAR_CHOICES в index.html');
const list = JSON.parse(m[1].replace(/'/g, '"'));
fs.writeFileSync(path.join(__dirname, 'avatars_js.csv'), ['avatar'].concat(list).join('\n') + '\n');
console.log('набор иконок из index.html:', list.length);
