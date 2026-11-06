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
// Редкость (миграция 063) и наборы — тоже один в один с базой (test_shop2_pets.sql)
fs.writeFileSync(path.join(__dirname, 'shop_rar_js.csv'), ['kind,code,rarity'].concat(items.map(i => [i.kind, i.code, i.rar].join(','))).join('\n') + '\n');
const b = html.match(/const SHOP_BUNDLES = (\[[\s\S]*?\n\]);/);
if (!b) throw new Error('не нашёл SHOP_BUNDLES в коде игры');
const bundles = Function('return ' + b[1])();
fs.writeFileSync(path.join(__dirname, 'shop_bundles_js.csv'), ['code,currency,pct,items'].concat(bundles.map(x => [x.code, x.currency, x.pct, x.items.join('|')].join(','))).join('\n') + '\n');
