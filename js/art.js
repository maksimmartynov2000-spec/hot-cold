// Рисунки иконок. Все иконки кружка — и обычные звери, и награды (за лиги,
// серию заданий, обучение) — объёмные картинки в одном стиле (папка icons/):
// так они одинаковые на любом телефоне, а не разные эмодзи у Apple и Android.
// Наградные фоны кружка — металл и камень.
//
// В базе иконка по-прежнему записана своим эмодзи (🦊, 👑, …), фон — цветом
// (#eab308, …): меняется только то, как их рисует игра.

// Наградные фоны: металл и камень вместо плоского цвета. Ключ — цвет из базы
const REWARD_BG = {
  '#94a3b8': 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 42%, #e2e8f0 58%, #64748b 100%)',          // Серебро
  '#eab308': 'linear-gradient(135deg, #fef9c3 0%, #eab308 40%, #fde047 58%, #a16207 100%)',          // Золото
  '#14b8a6': 'linear-gradient(135deg, #ccfbf1 0%, #14b8a6 40%, #5eead4 58%, #0f766e 100%)',          // Платина
  '#0ea5e9': 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 30%, #0ea5e9 48%, #bae6fd 62%, #0369a1 100%)', // Алмаз
  '#d946ef': 'linear-gradient(135deg, #fae8ff 0%, #d946ef 35%, #8b5cf6 65%, #f0abfc 100%)'           // Легенда
};
// С каким фоном кружок ещё и переливается
const SHINY_BG = ['#0ea5e9', '#d946ef'];

function avatarBgCss(color) {
  return REWARD_BG[color] || color || '';
}

function isShinyBg(color) {
  return SHINY_BG.indexOf(color) >= 0;
}

// Иконки, у которых есть рисунок. Файл — icons/<код символа>.webp: 🦊 → 1f98a.webp.
// Список нужен и чтобы не просить у сервера картинку, которой нет
const ICON_ART = new Set([
  '🦊', '🐼', '🐯', '🦁', '🐨', '🐸', '🐵', '🐧',
  '🦉', '🐙', '🦄', '🐊', '🐶', '🐱', '🐰', '🐻',
  '🦙', '🐹', '🐥', '🐢', '🦋', '🐝', '🐬', '🦈',
  '🦅', '🐺', '🦚', '🐉', '🦩', '🐳', '🦖', '🦜',
  '👑', '🌟', '🔥', '🚀', '🌋', '🌈', '🎓'
]);
function iconFile(code) {
  return 'icons/' + [...code].filter(c => c !== '\ufe0f').map(c => c.codePointAt(0).toString(16)).join('-') + '.webp';
}

// Рисунок иконки или '' — если такой иконки нет в наборе.
// size — в пикселях; 0 — по размеру кружка
function iconArt(code, size) {
  if (!ICON_ART.has(code)) return '';
  const wh = size ? ' width="' + size + '" height="' + size + '"' : ' width="100%" height="100%"';
  // Название — эмодзи в <title>: его прочтёт экранный диктор, и текст кружка
  // остаётся тем же эмодзи, что и в базе
  return '<svg class="icon-art" viewBox="0 0 100 100"' + wh + ' role="img"><title>' + code + '</title>' +
    '<image href="' + iconFile(code) + '" width="100" height="100"/></svg>';
}
