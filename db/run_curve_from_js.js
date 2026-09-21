// Кривая сложности «Игры на рейтинг» теперь считается и в браузере, и в базе.
// Функции достаём из index.html, а не из копии рядом: копия разошлась бы молча.
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function grab(start, end) {
  const a = html.indexOf(start);
  if (a < 0) throw new Error('не нашёл: ' + start);
  const b = html.indexOf(end, a);
  return html.slice(a, b + end.length);
}

const src = [
  grab('function minAttempts(rangeMax) {', '\n  }'),
  grab('function roundRangeValue(v) {', '\n  }'),
  grab('function runRangeForRound(n) {', '\n  }'),
  grab('function runAttemptsForRound(n, range) {', '\n  }')
].join('\n');

const RUN_CONFIG = {
  start_range: 10, growth: 2.2, range_cap: 2000,
  buffer_start: 5, buffer_shrink: 1, squeeze_start: 8, min_attempts: 3
};
const f = new Function('RUN_CONFIG',
  src + '\n; return { runRangeForRound, runAttemptsForRound, minAttempts };')(RUN_CONFIG);

const rows = [];
for (let n = 1; n <= 60; n++) {
  const range = f.runRangeForRound(n);
  rows.push([n, range, f.runAttemptsForRound(n, range), f.minAttempts(range)].join(','));
}
// и отдельно minAttempts на всех диапазонах, которые встречаются
const mins = [];
for (let r = 1; r <= 4100; r++) mins.push(r + ',' + f.minAttempts(r));

fs.writeFileSync(path.join(__dirname, 'run_curve_js.csv'), rows.join('\n') + '\n');
fs.writeFileSync(path.join(__dirname, 'min_attempts_js.csv'), mins.join('\n') + '\n');
console.log('раундов: ' + rows.length + ', диапазонов для minAttempts: ' + mins.length);
