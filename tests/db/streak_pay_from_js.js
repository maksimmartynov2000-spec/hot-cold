// Награда за день серии живёт в двух местах: в игре (streakDayPay в js/pass.js)
// и в базе (streak_day_pay, миграция 066). Достаём из кода игры и сверяем с SQL
// (test_streak_pay.sql): монеты, кристаллы и сундук за дни 1–20
const fs = require('fs');
const path = require('path');
const src = require('./game_source')();
const m = src.match(/function streakDayPay\(s\) \{[\s\S]*?\n\}/);
if (!m) throw new Error('не нашёл streakDayPay в коде игры');
const f = Function(m[0] + '; return streakDayPay;')();
const rows = [];
for (let d = 1; d <= 20; d++) { const p = f(d); rows.push([d, p.coins, p.gems, p.chest].join(',')); }
fs.writeFileSync(path.join(__dirname, 'streak_pay_js.csv'), ['day,coins,gems,chest'].concat(rows).join('\n') + '\n');
console.log('дней серии из кода игры:', rows.length);
