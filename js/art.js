// Рисунки иконок. Все иконки кружка — и обычные звери, и награды (за лиги,
// серию заданий, обучение) — объёмные картинки в одном стиле (папка icons/):
// так они одинаковые на любом телефоне, а не разные эмодзи у Apple и Android.
// Наградные фоны кружка — металл и камень.
//
// В базе иконка по-прежнему записана своим эмодзи (🦊, 👑, …), фон — цветом
// (#eab308, …): меняется только то, как их рисует игра.

// Наградные фоны: металл и камень вместо плоского цвета. Ключ — цвет из базы.
// Сверху — блик: металл без отражения выглядит пластиком
const SHEEN = 'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.75) 0, rgba(255,255,255,0) 38%), ';
const REWARD_BG = {
  '#94a3b8': SHEEN + 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 25%, #64748b 50%, #e2e8f0 72%, #475569 100%)',   // Серебро
  '#eab308': SHEEN + 'linear-gradient(135deg, #fff7c2 0%, #facc15 25%, #b45309 50%, #fde047 72%, #92400e 100%)',   // Золото
  '#14b8a6': SHEEN + 'linear-gradient(135deg, #f0fdfa 0%, #5eead4 25%, #0f766e 50%, #99f6e4 72%, #115e59 100%)',   // Платина
  '#0ea5e9': SHEEN + 'conic-gradient(from 200deg, #e0f2fe, #38bdf8, #0369a1, #bae6fd, #0ea5e9, #e0f2fe)',          // Алмаз
  '#d946ef': SHEEN + 'conic-gradient(from 160deg, #fae8ff, #d946ef, #6d28d9, #f0abfc, #22d3ee, #fae8ff)'           // Легенда
};
// Градиенты из обычного набора: в базе они записаны словом
const AVATAR_GRAD = {
  'grad-sunset': 'linear-gradient(135deg, #ffd166 0%, #ff8a3d 45%, #ff4d6d 100%)',
  'grad-ocean': 'linear-gradient(135deg, #a5f3fc 0%, #42c8ff 40%, #4f46e5 100%)',
  'grad-candy': 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 45%, #a78bfa 100%)',
  'grad-forest': 'linear-gradient(135deg, #d9f99d 0%, #4ade80 45%, #0f766e 100%)'
};
// С каким фоном кружок ещё и переливается
const SHINY_BG = ['#0ea5e9', '#d946ef'];

function avatarBgCss(color) {
  return REWARD_BG[color] || AVATAR_GRAD[color] || color || '';
}

function isShinyBg(color) {
  return SHINY_BG.indexOf(color) >= 0;
}

// Иконки, у которых есть рисунок. Файл — icons/<код символа>.webp: 🦊 → 1f98a.webp.
// Список нужен и чтобы не просить у сервера картинку, которой нет
const ICON_ART = new Set([
  '🦊', '🐻', '🦉', '🦔', '🦝', '🦌', '🐸', '🦋', '🦁', '🐯',
  '🐵', '🐘', '🦒', '🦓', '🐼', '🐨', '🐬', '🐙', '🦈', '🐢',
  '🐧', '🦀', '🦭', '🐊', '🐶', '🐱', '🐰', '🐹', '🐥', '🦙',
  '🐝', '🐴', '🦄', '👽', '👻', '🧚', '🎃', '⛄', '🦕', '👾',
  '🦅', '🐺', '🦚', '🐉', '🦩', '🐳', '🦖', '🦜', '👑', '🌟',
  '🔥', '🚀', '🌋', '🌈', '🎓', '🧙', '🦍', '🦑', '🐲', '🛸'
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
