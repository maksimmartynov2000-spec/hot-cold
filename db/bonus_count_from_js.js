// Число бонусов на поле считается в двух местах: в браузере и в базе. Копия
// рядом разошлась бы незаметно, поэтому функцию достаём прямо из index.html
// и печатаем таблицу «диапазон, бонусов», которую потом сверяем с SQL.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const marker = 'function autoBonusCountFor(n) {';
const a = html.indexOf(marker);
if (a < 0) throw new Error('не нашёл autoBonusCountFor в index.html');
const b = html.indexOf('\n  }', a);
if (b < 0) throw new Error('не нашёл конец autoBonusCountFor');
const src = html.slice(a, b + 4);

const autoBonusCountFor = new Function(src + '\n; return autoBonusCountFor;')();

const out = ['span,count'];
for (let span = 2; span <= 2100; span++) out.push(span + ',' + autoBonusCountFor(span));
fs.writeFileSync(path.join(__dirname, 'bonus_count_js.csv'), out.join('\n') + '\n');
console.log('таблица числа бонусов собрана из index.html:', out.length - 1, 'диапазонов');
