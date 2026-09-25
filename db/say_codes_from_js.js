// Фразы живут в двух местах: в браузере и в базе. Если игра предложит фразу,
// которой база не знает, кнопка молча откажет. Списки достаём прямо из
// index.html и сверяем с SQL: фразы в матче и быстрые ответы в переписке
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const pick = name => {
  const m = html.match(new RegExp('const ' + name + ' = (\\[[^\\]]*\\]);'));
  if (!m) throw new Error('не нашёл ' + name + ' в index.html');
  return JSON.parse(m[1].replace(/'/g, '"'));
};
const rows = pick('SAY_CODES').map(c => 'say,' + c).concat(pick('QUICK_TALK').map(c => 'quick,' + c));
fs.writeFileSync(path.join(__dirname, 'say_codes_js.csv'), ['kind,code'].concat(rows).join('\n') + '\n');
console.log('фраз из index.html:', rows.length);
