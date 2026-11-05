// Товары магазина живут в двух местах: в браузере (SHOP_ITEMS в js/shop.js) и
// в базе (shop_items, миграция 061). Достаём список из кода игры и сверяем
// с SQL (test_shop.sql): цена, раздел и код — один в один
const fs = require('fs');
const path = require('path');
const html = require('./game_source')();
const m = html.match(/const SHOP_ITEMS = (\[[\s\S]*?\n\]);/);
if (!m) throw new Error('не нашёл SHOP_ITEMS в коде игры');
const items = Function('return ' + m[1])();
const rows = items.map(i => [i.kind, i.code, i.coins || 0, i.gems || 0].join(','));
fs.writeFileSync(path.join(__dirname, 'shop_js.csv'), ['kind,code,coins,gems'].concat(rows).join('\n') + '\n');
console.log('товаров из кода игры:', rows.length);
