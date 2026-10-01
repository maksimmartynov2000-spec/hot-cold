// Рисунки наград. Наградные иконки (за лиги, серию заданий, обучение) и
// наградные фоны кружка рисуются здесь векторно, а не эмодзи: так они
// заметнее обычных и выглядят одинаково на любом телефоне.
//
// В базе награда по-прежнему записана своим эмодзи (🦅, 👑, …) и цветом
// (#eab308, …) — меняется только то, как её рисует игра.

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

// Общие детали рисунков
let artSeq = 0;
function artGrad(id, a, b, vertical) {
  return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vertical ? 0 : 1) + '" y2="1">' +
         '<stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>';
}
function artEye(x, y, r, iris) {
  return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (iris || '#1f2937') + '"/>' +
         '<circle cx="' + (x - r * 0.35) + '" cy="' + (y - r * 0.35) + '" r="' + (r * 0.38) + '" fill="#fff"/>';
}

// Каждый рисунок — функция от уникального префикса (градиенты на странице
// не должны совпадать по id)
const REWARD_ART = {
  // Орёл: белая голова, крючковатый клюв
  '🦅': p => '<defs>' + artGrad(p + 'b', '#a16207', '#5b3410', true) + artGrad(p + 'h', '#ffffff', '#cbd5e1', true) + '</defs>' +
    '<path d="M18 96 C16 74 26 60 40 54 L72 58 C82 72 86 86 84 96 Z" fill="url(#' + p + 'b)"/>' +
    '<path d="M34 60 L42 66 L48 58 L55 67 L62 59 L68 66 L74 60" fill="none" stroke="#3f2308" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M26 56 C22 34 40 18 58 20 C72 22 82 32 82 44 C82 54 74 60 64 62 C50 64 34 66 26 56 Z" fill="url(#' + p + 'h)"/>' +
    '<path d="M72 36 C86 34 96 44 94 58 C90 52 84 50 78 52 C76 46 74 41 72 36 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>' +
    '<path d="M78 52 C84 50 90 52 94 58 C88 60 82 58 78 52 Z" fill="#d97706"/>' +
    '<path d="M54 32 C60 28 68 29 72 33" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round"/>' +
    artEye(63, 38, 4.2, '#7c2d12'),
  // Волк: морда анфас, уши торчком
  '🐺': p => '<defs>' + artGrad(p + 'f', '#9ca3af', '#4b5563', true) + '</defs>' +
    '<path d="M18 12 L36 34 L28 42 Z M82 12 L64 34 L72 42 Z" fill="#4b5563"/>' +
    '<path d="M22 20 L34 36 L29 40 Z M78 20 L66 36 L71 40 Z" fill="#fda4af"/>' +
    '<path d="M50 24 C70 24 84 38 84 56 C84 72 68 90 50 94 C32 90 16 72 16 56 C16 38 30 24 50 24 Z" fill="url(#' + p + 'f)"/>' +
    '<path d="M50 52 C62 52 70 62 68 74 C64 86 56 92 50 92 C44 92 36 86 32 74 C30 62 38 52 50 52 Z" fill="#e5e7eb"/>' +
    '<path d="M28 44 L42 50 L36 56 Z M72 44 L58 50 L64 56 Z" fill="#374151"/>' +
    artEye(38, 50, 3.6, '#fbbf24') + artEye(62, 50, 3.6, '#fbbf24') +
    '<path d="M43 66 C43 62 57 62 57 66 C57 71 50 74 50 74 C50 74 43 71 43 66 Z" fill="#111827"/>' +
    '<path d="M50 74 L50 80 M44 82 C47 84 53 84 56 82" stroke="#374151" stroke-width="2" fill="none" stroke-linecap="round"/>',
  // Павлин: веер перьев с «глазками»
  '🦚': p => {
    let fan = '';
    for (let i = 0; i < 7; i++) {
      const a = -75 + i * 25;
      fan += '<g transform="rotate(' + a + ' 50 78)"><path d="M50 78 L46 22 C46 14 54 14 54 22 Z" fill="#15803d"/>' +
             '<ellipse cx="50" cy="22" rx="8" ry="10" fill="#16a34a"/><ellipse cx="50" cy="22" rx="5" ry="6.5" fill="#0ea5e9"/>' +
             '<ellipse cx="50" cy="22" rx="2.6" ry="3.4" fill="#1e3a8a"/></g>';
    }
    return '<defs>' + artGrad(p + 'b', '#3b82f6', '#1e3a8a', true) + '</defs>' + fan +
      '<path d="M50 50 C60 50 64 62 62 74 C60 86 54 94 50 94 C46 94 40 86 38 74 C36 62 40 50 50 50 Z" fill="url(#' + p + 'b)"/>' +
      '<circle cx="50" cy="46" r="8" fill="#2563eb"/><path d="M50 38 L48 30 M50 38 L52 30" stroke="#1e40af" stroke-width="1.5"/>' +
      '<path d="M57 46 L63 48 L57 50 Z" fill="#f59e0b"/>' + artEye(52, 45, 1.8);
  },
  // Дракон: голова в профиль с рогами и гребнем
  '🐉': p => '<defs>' + artGrad(p + 'g', '#4ade80', '#15803d', true) + '</defs>' +
    '<path d="M20 30 C24 18 34 14 40 18 C36 22 34 28 36 34 Z M36 24 C42 12 52 10 56 14 C50 18 48 24 50 30 Z" fill="#facc15" stroke="#a16207" stroke-width="1.2"/>' +
    '<path d="M14 62 L8 54 L18 56 L12 46 L22 50 L20 40 L28 46 Z" fill="#16a34a"/>' +
    '<path d="M22 44 C26 30 44 26 58 32 C70 36 80 40 90 46 C94 50 92 58 86 60 L66 62 C62 74 52 84 38 86 C26 86 18 76 18 64 C18 56 19 50 22 44 Z" fill="url(#' + p + 'g)" stroke="#14532d" stroke-width="1.5"/>' +
    '<path d="M66 62 C74 64 84 64 90 60 C88 68 80 72 70 72 Z" fill="#bbf7d0"/>' +
    '<path d="M70 66 L72 70 M76 66 L78 70 M82 64 L84 68" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="86" cy="48" r="1.6" fill="#14532d"/>' +
    '<path d="M44 40 C50 36 58 38 60 42" fill="none" stroke="#14532d" stroke-width="2.5" stroke-linecap="round"/>' +
    artEye(52, 46, 4.2, '#dc2626'),
  // Фламинго: шея-«S», клюв с изгибом
  '🦩': p => '<defs>' + artGrad(p + 'p', '#fbcfe8', '#ec4899', true) + '</defs>' +
    '<path d="M54 92 L54 70 M54 80 L62 74" stroke="#db2777" stroke-width="3" stroke-linecap="round" fill="none"/>' +
    '<path d="M36 52 C40 40 58 38 70 46 C78 52 76 64 66 70 C56 74 42 72 36 64 C34 60 34 56 36 52 Z" fill="url(#' + p + 'p)"/>' +
    '<path d="M62 46 C68 40 64 32 54 30 C44 28 40 20 44 12 C48 6 58 6 62 12" fill="none" stroke="#f472b6" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M60 12 C66 10 74 12 76 18 C76 22 72 24 70 26 L66 20 Z" fill="#fff"/>' +
    '<path d="M70 26 C72 24 76 22 76 18 C78 22 76 28 72 30 Z" fill="#111827"/>' +
    artEye(58, 12, 2.2) +
    '<path d="M44 56 C50 52 58 54 62 60" fill="none" stroke="#be185d" stroke-width="2" stroke-linecap="round"/>',
  // Кит: с фонтаном
  '🐳': p => '<defs>' + artGrad(p + 'w', '#60a5fa', '#1d4ed8', true) + '</defs>' +
    '<path d="M40 30 C38 22 42 16 48 18 M48 30 C48 20 54 14 60 18 M44 30 L44 22" stroke="#7dd3fc" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M10 58 C10 42 26 34 46 34 C68 34 82 46 84 58 C86 70 74 80 52 80 C30 80 10 74 10 58 Z" fill="url(#' + p + 'w)"/>' +
    '<path d="M82 56 C88 46 96 44 96 44 C94 52 92 56 88 60 C94 62 96 68 96 68 C90 68 86 66 82 62 Z" fill="#1d4ed8"/>' +
    '<path d="M16 66 C26 76 48 80 68 74 C60 80 44 82 30 78 C22 76 18 72 16 66 Z" fill="#e0f2fe"/>' +
    '<path d="M22 66 L30 68 M34 70 L42 71 M46 72 L54 72" stroke="#93c5fd" stroke-width="1.6" stroke-linecap="round"/>' +
    artEye(30, 52, 3.4) + '<path d="M20 60 C26 63 32 62 36 60" stroke="#1e3a8a" stroke-width="2" fill="none" stroke-linecap="round"/>',
  // Динозавр: тираннозавр в профиль
  '🦖': p => '<defs>' + artGrad(p + 'd', '#86efac', '#16a34a', true) + '</defs>' +
    '<path d="M30 46 C24 60 22 76 26 90 L36 90 L38 76 L50 78 L52 90 L62 90 L62 72 C70 66 72 56 68 48 Z" fill="url(#' + p + 'd)"/>' +
    '<path d="M30 52 C20 58 10 72 6 88 C14 80 22 72 30 66 Z" fill="#16a34a"/>' +
    '<path d="M36 50 C34 30 46 14 64 14 C80 14 92 22 92 32 C92 40 86 44 78 44 L62 46 C56 50 46 54 36 50 Z" fill="url(#' + p + 'd)" stroke="#14532d" stroke-width="1.5"/>' +
    '<path d="M62 46 L64 40 L68 46 L70 40 L74 46 L76 40 L78 44" fill="#fff" stroke="#14532d" stroke-width="0.8"/>' +
    '<path d="M60 58 L68 60 L66 64 M60 62 L66 66" stroke="#14532d" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M40 22 L36 16 L44 18 M48 16 L46 10 L54 14" fill="#22c55e" stroke="#14532d" stroke-width="1.2"/>' +
    artEye(66, 26, 3.8, '#78350f') + '<circle cx="86" cy="28" r="1.4" fill="#14532d"/>',
  // Попугай: ара, красный с жёлто-синим крылом
  '🦜': p => '<defs>' + artGrad(p + 'r', '#f87171', '#b91c1c', true) + '</defs>' +
    '<path d="M48 70 L42 98 L52 96 L56 72 Z" fill="#2563eb"/><path d="M54 72 L58 98 L66 94 L60 70 Z" fill="#facc15"/>' +
    '<path d="M30 40 C30 24 44 14 58 16 C72 18 78 30 76 44 C74 62 64 76 50 78 C36 76 30 58 30 40 Z" fill="url(#' + p + 'r)"/>' +
    '<path d="M38 52 C50 50 62 56 66 70 C56 76 44 74 38 66 Z" fill="#facc15"/><path d="M42 62 C52 62 60 66 64 74 C54 78 46 76 42 70 Z" fill="#2563eb"/>' +
    '<path d="M62 22 C74 18 86 26 84 40 C80 34 74 32 68 34 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>' +
    '<path d="M70 34 C78 32 84 38 82 46 C78 42 74 40 70 40 Z" fill="#1f2937"/>' +
    '<path d="M50 26 C56 22 64 24 66 30 C64 34 56 36 52 34 Z" fill="#fff"/>' + artEye(59, 29, 3, '#0f172a'),
  // Корона: золото и камни
  '👑': p => '<defs>' + artGrad(p + 'c', '#fde68a', '#d97706', true) + '</defs>' +
    '<path d="M12 34 L30 56 L50 22 L70 56 L88 34 L82 78 L18 78 Z" fill="url(#' + p + 'c)" stroke="#92400e" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<rect x="16" y="76" width="68" height="12" rx="3" fill="#f59e0b" stroke="#92400e" stroke-width="2.5"/>' +
    '<circle cx="12" cy="32" r="5" fill="#fde68a" stroke="#92400e" stroke-width="2"/><circle cx="50" cy="20" r="6" fill="#fde68a" stroke="#92400e" stroke-width="2"/>' +
    '<circle cx="88" cy="32" r="5" fill="#fde68a" stroke="#92400e" stroke-width="2"/>' +
    '<path d="M50 58 L56 66 L50 74 L44 66 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>' +
    '<circle cx="30" cy="68" r="4" fill="#3b82f6" stroke="#1e3a8a" stroke-width="1.2"/><circle cx="70" cy="68" r="4" fill="#22c55e" stroke="#14532d" stroke-width="1.2"/>' +
    '<path d="M24 40 L32 52" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/>',
  // Звезда: с лучами-вспышками
  '🌟': p => '<defs><radialGradient id="' + p + 's" cx="0.45" cy="0.4" r="0.6"><stop offset="0" stop-color="#fffbeb"/>' +
    '<stop offset="0.5" stop-color="#fde047"/><stop offset="1" stop-color="#f59e0b"/></radialGradient></defs>' +
    '<path d="M50 2 L52 18 L50 22 L48 18 Z M50 98 L52 82 L50 78 L48 82 Z M2 50 L18 52 L22 50 L18 48 Z M98 50 L82 52 L78 50 L82 48 Z" fill="#fde68a"/>' +
    '<path d="M50 14 L60 38 L86 40 L66 57 L72 83 L50 69 L28 83 L34 57 L14 40 L40 38 Z" fill="url(#' + p + 's)" stroke="#b45309" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M50 24 L56 40" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round"/>',
  // Огонь
  '🔥': p => '<defs>' + artGrad(p + 'o', '#fb923c', '#dc2626', true) + artGrad(p + 'y', '#fef08a', '#f59e0b', true) + '</defs>' +
    '<path d="M50 4 C58 22 80 32 80 60 C80 80 66 94 50 94 C34 94 20 80 20 60 C20 46 28 38 34 30 C36 42 42 46 46 46 C42 32 44 16 50 4 Z" fill="url(#' + p + 'o)"/>' +
    '<path d="M52 38 C58 50 68 56 68 70 C68 82 60 90 50 90 C40 90 32 82 32 72 C32 64 38 58 42 54 C44 62 48 64 50 64 C48 54 48 46 52 38 Z" fill="url(#' + p + 'y)"/>' +
    '<path d="M50 62 C54 68 58 72 58 78 C58 84 54 88 50 88 C46 88 42 84 42 79 C42 74 46 70 50 62 Z" fill="#fffbeb"/>',
  // Ракета
  '🚀': p => '<defs>' + artGrad(p + 'k', '#ffffff', '#cbd5e1') + artGrad(p + 'f', '#fde047', '#f97316', true) + '</defs>' +
    '<g transform="rotate(35 50 50)">' +
    '<path d="M40 74 C42 88 50 98 50 98 C50 98 58 88 60 74 Z" fill="url(#' + p + 'f)"/>' +
    '<path d="M36 58 L22 72 L22 80 L38 72 Z M64 58 L78 72 L78 80 L62 72 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>' +
    '<path d="M50 4 C64 16 66 40 64 74 L36 74 C34 40 36 16 50 4 Z" fill="url(#' + p + 'k)" stroke="#64748b" stroke-width="2"/>' +
    '<path d="M50 4 C57 10 61 18 62 26 L38 26 C39 18 43 10 50 4 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>' +
    '<circle cx="50" cy="42" r="8" fill="#38bdf8" stroke="#475569" stroke-width="3"/><circle cx="47" cy="39" r="2.5" fill="#e0f2fe"/>' +
    '<path d="M44 74 L44 80 M50 74 L50 82 M56 74 L56 80" stroke="#64748b" stroke-width="2"/></g>',
  // Вулкан: лава и дым
  '🌋': p => '<defs>' + artGrad(p + 'm', '#a16207', '#451a03', true) + '</defs>' +
    '<circle cx="40" cy="16" r="9" fill="#9ca3af"/><circle cx="54" cy="10" r="11" fill="#d1d5db"/><circle cx="66" cy="18" r="8" fill="#9ca3af"/>' +
    '<path d="M8 92 L38 34 L62 34 L92 92 Z" fill="url(#' + p + 'm)"/>' +
    '<path d="M38 34 L62 34 L58 42 C56 50 60 58 56 66 C54 58 50 56 48 50 C44 58 46 66 40 74 C40 62 42 52 40 44 Z" fill="#f97316"/>' +
    '<path d="M38 34 C44 28 56 28 62 34 C56 38 44 38 38 34 Z" fill="#facc15"/>' +
    '<path d="M24 74 L34 60 M70 70 L76 82" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>',
  // Радуга с облаками
  '🌈': p => '<path d="M10 76 A40 40 0 0 1 90 76" fill="none" stroke="#ef4444" stroke-width="8"/>' +
    '<path d="M18 76 A32 32 0 0 1 82 76" fill="none" stroke="#f59e0b" stroke-width="8"/>' +
    '<path d="M26 76 A24 24 0 0 1 74 76" fill="none" stroke="#22c55e" stroke-width="8"/>' +
    '<path d="M34 76 A16 16 0 0 1 66 76" fill="none" stroke="#3b82f6" stroke-width="8"/>' +
    '<g fill="#fff" stroke="#cbd5e1" stroke-width="1.5"><path d="M4 84 C4 76 12 72 18 76 C20 68 32 68 32 78 C38 78 40 86 34 88 L8 88 C4 88 4 86 4 84 Z"/>' +
    '<path d="M68 84 C68 76 76 72 82 76 C84 68 96 68 96 78 C100 80 100 88 94 88 L72 88 C68 88 68 86 68 84 Z"/></g>',
  // Шапка выпускника
  '🎓': p => '<defs>' + artGrad(p + 'c', '#334155', '#0f172a', true) + '</defs>' +
    '<path d="M28 50 L28 70 C28 78 72 78 72 70 L72 50 Z" fill="url(#' + p + 'c)"/>' +
    '<path d="M50 22 L94 40 L50 58 L6 40 Z" fill="#1e293b" stroke="#475569" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M50 26 L84 40 L50 54" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>' +
    '<circle cx="50" cy="40" r="3" fill="#fbbf24"/>' +
    '<path d="M50 40 L80 52 L80 72" fill="none" stroke="#fbbf24" stroke-width="2.5"/>' +
    '<path d="M76 72 L84 72 L86 84 L74 84 Z" fill="#fbbf24"/>'
};

// Рисунок награды или '' — если у иконки рисунка нет (обычное эмодзи).
// size — в пикселях; 0 — по размеру кружка
function rewardArt(code, size) {
  const draw = REWARD_ART[code];
  if (!draw) return '';
  const id = 'ra' + (++artSeq);
  const wh = size ? ' width="' + size + '" height="' + size + '"' : ' width="100%" height="100%"';
  return '<svg class="reward-art" viewBox="0 0 100 100"' + wh + ' role="img" aria-label="' + code + '">' + draw(id) + '</svg>';
}
