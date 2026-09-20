// Пояса считаются теперь в двух местах: в браузере и в базе. Расходиться им
// нельзя — иначе онлайн-игра и одиночная будут говорить разное про один и тот
// же ход. Этот скрипт достаёт функции прямо из index.html (не копию!) и печатает
// таблицу «диапазон, расстояние, пояс», которую потом сверяем с SQL.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function grab(startMarker, endMarker) {
  const a = html.indexOf(startMarker);
  if (a < 0) throw new Error('не нашёл в index.html: ' + startMarker);
  const b = html.indexOf(endMarker, a);
  if (b < 0) throw new Error('не нашёл конец для: ' + startMarker);
  return html.slice(a, b + endMarker.length);
}

const src = [
  grab('const RANGE_TIER_UPPER = {', '};'),
  grab('const HOT_TIER_UPPER = [', '];'),
  grab('function tierStep(v) {', '\n  }'),
  grab('function roundTier(v, up) {', '\n  }'),
  grab('function generateTierUpper(rangeMax) {', '\n  }'),
  grab('function buildFeedbackMeta(rangeMax) {', '\n  }')
].join('\n');

const TIER_COLORS = Array.from({ length: 8 }, () => ({ color: '', bg: '' }));
const BULLSEYE_TIER = { color: '', bg: '' };
const build = new Function('TIER_COLORS', 'BULLSEYE_TIER',
  src + '\n; return buildFeedbackMeta;')(TIER_COLORS, BULLSEYE_TIER);

// Тот же выбор пояса, что в игре: первый подходящий, иначе самый холодный
function tierOf(meta, distance) {
  const hit = meta.find(f => distance >= f.min && distance <= f.max);
  return (hit || meta[0]).labelIndex;
}

const SPANS = [];
for (let n = 2; n <= 120; n++) SPANS.push(n);
[250, 251, 500, 501, 1000, 1001, 2000, 2001, 5000].forEach(n => SPANS.push(n));

const out = [];
const bounds = [];
for (const span of SPANS) {
  const meta = build(span);
  for (let d = 0; d <= span - 1; d++) out.push(span + ',' + d + ',' + tierOf(meta, d));
  // Границы поясов клиент показывает словами в «Шкале расстояний» и по ним же
  // кидает в лаву, так что совпасть должен не только ответ, но и сами числа
  for (let i = 0; i < 8; i++) bounds.push(span + ',' + i + ',' + meta[i].min + ',' + meta[i].max);
}
fs.writeFileSync(path.join(__dirname, 'tiers_js.csv'), out.join('\n') + '\n');
fs.writeFileSync(path.join(__dirname, 'bounds_js.csv'), bounds.join('\n') + '\n');
console.log('строк из клиента: ' + out.length + ', границ: ' + bounds.length);
