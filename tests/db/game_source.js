// Код игры целиком: index.html и все js/*.js подряд. Таблицы, записанные и в
// игре, и в базе, достаём отсюда — где бы в игре они ни лежали
const fs = require('fs');
const path = require('path');

module.exports = function gameSource() {
  const root = path.join(__dirname, '..', '..');
  const js = fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js')).sort()
    .map(f => fs.readFileSync(path.join(root, 'js', f), 'utf8'));
  return [fs.readFileSync(path.join(root, 'index.html'), 'utf8')].concat(js).join('\n');
};
