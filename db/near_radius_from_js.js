// Радиус сигнала «рядом» считается в двух местах: в браузере и в базе. Копия
// рядом разошлась бы незаметно, поэтому функции достаём прямо из index.html и
// печатаем таблицу «диапазон, радиус», которую потом сверяем с SQL.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function extract(marker) {
  const a = html.indexOf(marker);
  if (a < 0) throw new Error('не нашёл ' + marker + ' в index.html');
  const b = html.indexOf('\n  }', a);
  if (b < 0) throw new Error('не нашёл конец ' + marker);
  return html.slice(a, b + 4);
}
const src = extract('function autoBonusCountFor(n) {') + '\n' + extract('function bonusNearRadius() {');

// В игре длина прямой берётся из текущих границ; здесь подставляем её сами
let N = 0;
const rangeCount = () => N;
const bonusNearRadius = new Function('rangeCount', src + '\n; return bonusNearRadius;')(rangeCount);

// До 4100: самый широкий диапазон в игре, −2000…2000, — это 4001 число
const out = ['span,radius'];
for (N = 2; N <= 4100; N++) out.push(N + ',' + bonusNearRadius());
fs.writeFileSync(path.join(__dirname, 'near_radius_js.csv'), out.join('\n') + '\n');
console.log('таблица радиусов собрана из index.html:', out.length - 1, 'диапазонов');
