// ================= ПРИКЛЮЧЕНИЕ =================
// Вместо «Игры с ботом» — путь через пять миров, по десять соперников в
// каждом. Соперник — персонаж со своей особенностью: кто-то торопится, кто-то
// забывает ходы, кто-то ходит первым. Обыграл — открылся следующий. Десятый в
// мире — босс: играем до двух побед, а за него игрок получает иконку босса.
// Сложность — общий переключатель (легко / нормально / трудно), а не выбор бота.
//
// Прогресс — число обыгранных соперников подряд (0…50). Хранится в телефоне,
// а у вошедшего ещё и в базе (adventure_sync): так он переезжает на другой
// телефон и база знает, какие иконки боссов открыты.
//
// Звёзды: за победу над соперником — 1 (легко), 2 (нормально) или 3 (трудно).
// Хранится лучший результат по каждому, переиграть ради звёзд можно. Звёзды
// видны в профиле и друзьям, за них — достижения и задания дня.
//
// Бонусы — во всём Приключении: у каждого мира свой бонус (щит, половина,
// рентген, лава, заморозка), обычные соперники играют без ловушек, босс и
// «Фокусник» — с ловушками

const ADV_WORLDS = [
  { key: 'forest', range: 20, color: '#2bd18f', boss: '🧙', bonus: 'shield' },
  { key: 'jungle', range: 50, color: '#a3e635', boss: '🦍', bonus: 'half' },
  { key: 'sea', range: 100, color: '#42c8ff', boss: '🦑', bonus: 'xray' },
  { key: 'fire', range: 200, color: '#ff8a3d', boss: '🐲', bonus: 'lava' },
  { key: 'space', range: 500, color: '#a66bff', boss: '🛸', bonus: 'freeze' }
];
// Копия иконок боссов — в базе (adventure_icons), сверяется тестом
const ADV_ICONS = ADV_WORLDS.map(w => w.boss);
const ADV_PER_WORLD = 10;
const ADV_TOTAL = ADV_WORLDS.length * ADV_PER_WORLD;
// Особенности по кругу, в каждом мире — со своего места: в каждом мире есть
// все девять, но идут они по-разному, и миры не похожи друг на друга
const ADV_QUIRKS = ['plain', 'fast', 'forget', 'first', 'gambler', 'tokens', 'slow', 'bonus', 'frost'];
const ADV_QUIRK_ICON = { plain: '🙂', fast: '💨', forget: '🫧', first: '🥇', gambler: '🎲', tokens: '⚡',
                         slow: '🤔', bonus: '🎁', frost: '❄️', boss: '👑' };
const ADV_DIFFS = ['easy', 'normal', 'hard'];

function advChar(n) {
  const w = Math.floor(n / ADV_PER_WORLD), i = n % ADV_PER_WORLD;
  const boss = i === ADV_PER_WORLD - 1;
  return { n: n, w: w, i: i, boss: boss, world: ADV_WORLDS[w],
           quirk: boss ? 'boss' : ADV_QUIRKS[(i + w * 3) % ADV_QUIRKS.length],
           icon: 'adv-' + String(n + 1).padStart(2, '0') };
}
function advName(n) { return t().adv.names[n]; }

// Сила соперника растёт от мира к миру и чуть-чуть внутри мира
function advLevel(c, diff) {
  let L = 0.08 + c.w * 0.18 + c.i * 0.012 + (c.boss ? 0.06 : 0);
  if (c.quirk === 'fast') L -= 0.08;
  if (c.quirk === 'slow') L += 0.08;
  if (diff === 'easy') L *= 0.5;
  if (diff === 'hard') L += 0.2;
  return Math.max(0.02, Math.min(0.98, L));
}
function advThink(c, diff) {
  const base = c.quirk === 'fast' ? [0.6, 1.3] : c.quirk === 'slow' ? [3, 5] : [1.2, 2.8];
  return diff === 'easy' ? base.map(x => x * 1.2) : base;
}

function advDiff() {
  try {
    const d = localStorage.getItem('hc_adv_diff');
    if (ADV_DIFFS.indexOf(d) >= 0) return d;
  } catch (e) {}
  return 'normal';
}
function setAdvDiff(d) {
  try { localStorage.setItem('hc_adv_diff', d); } catch (e) {}
  renderAdventure();
}

// ---------- прогресс ----------
function advKey() {
  const a = runAuth();
  return 'hc_adv_' + (a ? a.username.toLowerCase() : 'guest');
}
function advDone() {
  try {
    const v = parseInt(localStorage.getItem(advKey()));
    return isNaN(v) ? 0 : Math.max(0, Math.min(ADV_TOTAL, v));
  } catch (e) { return 0; }
}
function advRemember(n) {
  if (n <= advDone()) return;
  try { localStorage.setItem(advKey(), String(n)); } catch (e) {}
}
// ---------- звёзды ----------
// Строка по символу на соперника: '0' — не обыгран, '1'…'3' — лучший результат
function advStarsKey() { return advKey().replace('hc_adv_', 'hc_advs_'); }
function advStars() {
  try {
    const v = localStorage.getItem(advStarsKey()) || '';
    return /^[0-3]{0,50}$/.test(v) ? v : '';
  } catch (e) { return ''; }
}
function advStarAt(n) { return +(advStars()[n] || 0); }
// Слить со звёздами из базы: на каждом месте — лучшее
function advMergeStars(other) {
  if (typeof other !== 'string' || !/^[0-3]{0,50}$/.test(other)) return;
  const a = advStars(), len = Math.max(a.length, other.length);
  let out = '';
  for (let i = 0; i < len; i++) out += Math.max(+(a[i] || 0), +(other[i] || 0));
  try { localStorage.setItem(advStarsKey(), out); } catch (e) {}
}
function advSetStar(n, k) {
  const cur = advStars().padEnd(n + 1, '0');
  if (+cur[n] >= k) return;
  try { localStorage.setItem(advStarsKey(), cur.slice(0, n) + k + cur.slice(n + 1)); } catch (e) {}
}
function advStarTotal(str) {
  let sum = 0;
  for (const ch of (str === undefined ? advStars() : str || '')) sum += +ch;
  return sum;
}
function advWorldStars(w) {
  return advStarTotal(advStars().slice(w * ADV_PER_WORLD, (w + 1) * ADV_PER_WORLD));
}
// ★★☆ — сколько из трёх
function advStarRow(k) { return '★'.repeat(k) + '☆'.repeat(3 - k); }
// Звёзды за победу на этой сложности
function advDiffStars(diff) { return ADV_DIFFS.indexOf(diff) + 1; }
// Соперники до прошлого запуска звёзд не записаны: пройдены — значит, хоть
// одна звезда у каждого есть
function advFillStars() {
  const done = advDone(), s = advStars();
  if (s.length >= done && s.slice(0, done).indexOf('0') < 0) return;
  let out = '';
  for (let i = 0; i < Math.max(done, s.length); i++) out += i < done ? Math.max(1, +(s[i] || 0)) : (s[i] || '0');
  try { localStorage.setItem(advStarsKey(), out); } catch (e) {}
}

// Сказать базе, сколько пройдено и какие звёзды, и забрать её ответ: на
// каждом месте больше из двух и есть правда. Без входа или без миграции —
// молча только телефон. advServer — база Приключение знает: только тогда в
// выборе иконки есть иконки боссов
let advServer = false;
async function advSync() {
  advFillStars();
  if (!runAuth() || typeof sb === 'undefined' || !sb) return;
  try {
    const r = await friendRpc('adventure_sync', { p_done: advDone(), p_stars: advStars() });
    if (r && typeof r.done === 'number') {
      advServer = true;
      advRemember(r.done);
      advMergeStars(r.stars);
      advFillStars();
      return;
    }
  } catch (e) {
    // База без миграции 050 — старый способ, без звёзд
    if (!/adventure_sync|function|schema/i.test(e.message || '')) return;
  }
  try {
    const v = await friendRpc('adventure_save', { p_done: advDone() });
    if (typeof v === 'number') { advServer = true; advRemember(v); }
  } catch (e) {}
}

// Победа: звёзды — сразу в телефон, а базе — отдельным вызовом, чтобы она
// засчитала задания дня. Не вышло — просто синхронизация
function advReport(n, k) {
  if (!runAuth() || typeof sb === 'undefined' || !sb) return;
  friendRpc('adventure_result', { p_n: n, p_stars: k })
    .then(r => {
      if (r && typeof r.done === 'number') { advRemember(r.done); advMergeStars(r.stars); }
      if (typeof loadProgress === 'function') loadProgress();
    })
    .catch(() => advSync());
}
function advWorldDone(w) { return advDone() >= (w + 1) * ADV_PER_WORLD; }

// Иконки соперников — в кружок, когда весь их мир пройден на ★★★. Копия
// списка — в базе (adventure_char_icons)
const ADV_CHAR_ICONS = Array.from({ length: ADV_TOTAL }, (_, i) => 'adv-' + String(i + 1).padStart(2, '0'));
function advWorldThree(w) {
  return [...advStars().slice(w * ADV_PER_WORLD, (w + 1) * ADV_PER_WORLD)].filter(c => c === '3').length;
}
function advWorldGold(w) { return advWorldThree(w) === ADV_PER_WORLD; }
function advGoldCount() { return ADV_WORLDS.filter((W, w) => advWorldGold(w)).length; }
function advCharIconOpen(icon) {
  const n = ADV_CHAR_ICONS.indexOf(icon);
  return n >= 0 && advWorldGold(Math.floor(n / ADV_PER_WORLD));
}
function advIconOpen(icon) {
  const w = ADV_ICONS.indexOf(icon);
  return w >= 0 && advWorldDone(w);
}

// ---------- карта ----------
function openAdventure() {
  endLessonMode();
  showScreen('adventure');
  renderAdventure();
  advSync().then(() => { if (screen === 'adventure') renderAdventure(); });
}

function renderAdventure() {
  const A = t().adv;
  document.getElementById('tAdvTitle').innerHTML = artSpan('icons/m-adventure.webp', '🗺️') + ' ' + escapeHtml(A.title);
  document.getElementById('tAdvHint').textContent = A.hint;
  const diff = advDiff();
  document.getElementById('advDiff').replaceChildren(...ADV_DIFFS.map((d, i) => {
    const b = document.createElement('button');
    b.className = 'ad-btn' + (d === diff ? ' on' : '');
    b.dataset.diff = d;
    b.innerHTML = escapeHtml(A.diff[i]) + '<small class="ad-stars">' + '★'.repeat(i + 1) + '</small>';
    b.onclick = () => setAdvDiff(d);
    return b;
  }));
  document.getElementById('advDiffHint').textContent = A.diffHint[ADV_DIFFS.indexOf(diff)] + ' · ' +
    A.winStars.replace('{s}', '★'.repeat(advDiffStars(diff)));
  advFillStars();
  document.getElementById('advStarsTotal').innerHTML = '<b>⭐ ' + advStarTotal() + '</b><span> / ' + ADV_TOTAL * 3 + '</span>' +
    '<small>' + escapeHtml(A.starsHint) + '</small>';

  const done = advDone();
  document.getElementById('advMap').replaceChildren(...ADV_WORLDS.map((W, w) => {
    const sec = document.createElement('section');
    sec.className = 'adv-world' + (done < w * ADV_PER_WORLD ? ' locked' : '');
    sec.style.setProperty('--wc', W.color);
    const beaten = Math.max(0, Math.min(ADV_PER_WORLD, done - w * ADV_PER_WORLD));
    const head = document.createElement('div');
    head.className = 'aw-head';
    head.innerHTML = '<span class="aw-name">' + escapeHtml(A.worlds[w]) + '</span>' +
      '<span class="aw-count">' + A.progress.replace('{n}', beaten) +
        ' · <span class="aw-stars">⭐ ' + advWorldStars(w) + '/' + ADV_PER_WORLD * 3 + '</span></span>' +
      '<span class="aw-reward' + (advWorldDone(w) ? ' got' : '') + '" title="' + escapeHtml(A.reward) + '">' +
      (iconArt(W.boss, 0) || W.boss) + '</span>';
    const grid = document.createElement('div');
    grid.className = 'aw-grid';
    for (let i = 0; i < ADV_PER_WORLD; i++) {
      const n = w * ADV_PER_WORLD + i;
      const c = advChar(n);
      const b = document.createElement('button');
      const state = n < done ? 'done' : n === done ? 'next' : 'locked';
      b.className = 'adv-tile ' + state + (c.boss ? ' boss' : '');
      b.dataset.n = n;
      const st = advStarAt(n);
      b.innerHTML = iconArt(c.icon, 0) + '<span class="at-quirk">' + ADV_QUIRK_ICON[c.quirk] + '</span>' +
        (state === 'done' ? '<span class="at-stars s' + st + '">' + advStarRow(st) + '</span>'
          : state === 'locked' ? '<span class="at-mark">🔒</span>' : '');
      b.setAttribute('aria-label', advName(n));
      b.onclick = () => openAdvCard(n);
      grid.appendChild(b);
    }
    // Цель мира: ★★★ у всех — их иконки в профиль
    const goal = document.createElement('div');
    goal.className = 'aw-goal' + (advWorldGold(w) ? ' got' : '');
    goal.textContent = advWorldGold(w) ? A.goldDone : A.goldGoal.replace('{n}', advWorldThree(w));
    sec.append(head, grid, goal);
    return sec;
  }));
  const next = document.querySelector('#advMap .adv-tile.next');
  if (next && next.scrollIntoView && done > 0) next.scrollIntoView({ block: 'center' });
}

// Карточка соперника: кто, в каком мире, чем опасен, на каких числах
function openAdvCard(n) {
  const A = t().adv, L = t();
  const c = advChar(n), done = advDone();
  const face = document.getElementById('acFace');
  face.innerHTML = iconArt(c.icon, 0);
  face.style.background = c.world.color;
  document.querySelector('#advCard .adv-card').style.setProperty('--wc', c.world.color);
  document.getElementById('acWorld').textContent = A.worlds[c.w] + ' · ' + (c.i + 1) + '/' + ADV_PER_WORLD;
  document.getElementById('acName').textContent = advName(n);
  const q = A.quirks[c.quirk];
  document.getElementById('acQuirk').innerHTML = '<b>' + ADV_QUIRK_ICON[c.quirk] + ' ' + escapeHtml(q[0]) + '</b>' +
    '<span>' + escapeHtml(q[1]) + '</span>';
  const half = Math.floor(c.world.range / 2);
  const range = c.quirk === 'frost' ? L.placeholderTpl.replace('{a}', formatNum(-half)).replace('{b}', formatNum(half))
    : L.placeholderTpl.replace('{a}', '1').replace('{b}', formatNum(c.world.range));
  const best = advStarAt(n);
  const bk = c.world.bonus;
  document.getElementById('acFacts').innerHTML =
    '<span>' + escapeHtml(A.range) + ': <b>' + range + '</b></span>' +
    '<span>' + escapeHtml(A.wins) + ' <b>' + (c.boss ? 2 : 1) + '</b></span>' +
    '<span class="ac-best">' + escapeHtml(A.best) + ': <b class="s' + best + '">' + advStarRow(best) + '</b></span>' +
    '<button type="button" class="ac-bonus" onclick="openBonusGuide(\'' + bk + '\')">' + escapeHtml(A.worldBonus) + ': <b>' +
      bonusArtHtml(bk, BONUS_ICON[bk]) + ' ' + escapeHtml(L.bonusNames[bk]) + '</b>' +
      (c.boss || c.quirk === 'bonus' ? ' · ' + escapeHtml(A.traps) : '') + '</button>' +
    '<span class="ac-gold">' + escapeHtml(advWorldGold(c.w) ? A.goldDone : A.cardGold.replace('{n}', advWorldThree(c.w))) + '</span>';
  const go = document.getElementById('acGo');
  const open = n <= done;
  go.textContent = open ? A.fight : A.locked;
  go.disabled = !open;
  go.onclick = () => startAdventure(n);
  document.getElementById('acBack').textContent = L.back;
  document.getElementById('advCard').classList.remove('hidden');
}
function closeAdvCard() {
  document.getElementById('advCard').classList.add('hidden');
}

// ---------- партия ----------
// Пока идёт Приключение, его особенности (бонусы, мороз) подменяют общие
// настройки игрока; после — возвращаем, как было
let adv = null;

function startAdventure(n) {
  closeAdvCard();
  const L = t();
  const c = advChar(n), diff = advDiff();
  endLessonMode();
  if (!adv) adv = { prev: { bonusMode, bonusCountChoice, frostMode } };
  adv.n = n;
  mode = 'duel';
  setupBot = false;
  stopBot();
  frostMode = c.quirk === 'frost';
  bonusCountChoice = 0;
  applyBounds(c.world.range);
  applyRangeToInputs();
  // Бонусы — у всех: бонус мира ложится всегда, ловушки — у босса и Фокусника,
  // у Фокусника бонусов вдвое больше
  const magic = c.quirk === 'bonus';
  bonusMode = true;
  bonusSet = {
    first: true,
    good: [c.world.bonus, 'extra', 'fog', 'blind'].concat(magic ? ['xray', 'half', 'shield', 'freeze'].filter(k => k !== c.world.bonus) : []),
    trap: (c.boss || magic) ? BONUS_TRAP : [],
    count: magic ? 2 * autoBonusCountFor(rangeCount()) : 0
  };
  vsBot = { adv: c, diff: diff, bot: { key: c.icon, icon: c.icon, color: c.world.color, level: advLevel(c, diff),
                           think: advThink(c, diff), greet: 'luck', react: 'nice' } };
  D.names[0] = myName() || L.you;
  D.names[1] = advName(n);
  D.winsNeeded = c.boss ? 2 : 1;
  // Жетоны: у «запасливого» два у соперника, на лёгком — два у игрока
  D.handicap = c.quirk === 'tokens' ? 2 : (diff === 'easy' ? 1 : 0);
  D.wins = [0, 0];
  D.round = 1;
  D.matchOver = false;
  D.starter = c.quirk === 'first' ? 1 : 0;
  startRound();
  applyTranslations();
  showScreen('game');
  setTimeout(() => botSay(vsBot && vsBot.bot.greet), 600);
}

function endAdventureMode() {
  if (!adv) return;
  bonusMode = adv.prev.bonusMode;
  bonusCountChoice = adv.prev.bonusCountChoice;
  frostMode = adv.prev.frostMode;
  bonusSet = null;
  adv = null;
}

function advWon() {
  return D.matchOver && D.wins[0] >= D.winsNeeded;
}

// Победа засчитывается один раз за партию: итог перерисовывается много раз
function advAward() {
  if (vsBot.advAward) return vsBot.advAward;
  const c = vsBot.adv, k = advDiffStars(vsBot.diff || advDiff());
  const was = advStarAt(c.n);
  advRemember(c.n + 1);
  advSetStar(c.n, k);
  vsBot.advAward = { k: k, was: was, now: Math.max(was, k), gained: Math.max(0, k - was) };
  advReport(c.n, k);
  return vsBot.advAward;
}

// Строки под заголовком итога: звёзды, мир пройден, всё пройдено или «ещё раз»
function advResultLine() {
  const A = t().adv, c = vsBot.adv;
  const line = document.createElement('div');
  line.className = 'r-forfeit adv-line';
  if (advWon()) {
    const w = advAward();
    const parts = [];
    const stars = '<span class="adv-got s' + w.now + '">' + advStarRow(w.now) + '</span>';
    if (w.gained > 0) parts.push(escapeHtml(A.starsGot.replace('{n}', w.gained)).replace('{s}', stars));
    else parts.push(escapeHtml(A.best) + ': ' + stars);
    if (w.now < 3) {
      parts.push('<small>' + escapeHtml(A.moreStars.replace('{d}', A.diff[Math.min(2, w.now)])) + '</small>');
    }
    if (c.n + 1 >= ADV_TOTAL && w.was === 0) parts.push(escapeHtml(A.allDone));
    else if (c.boss && w.was === 0) {
      parts.push(escapeHtml(A.worldDone.replace('{w}', A.worlds[c.w])) + ' ' + (iconArt(c.world.boss, 22) || ''));
    }
    line.innerHTML = parts.map(x => '<div>' + x + '</div>').join('');
  } else {
    line.textContent = A.lose;
  }
  return line;
}

function advActionsHtml() {
  const A = t().adv, c = vsBot.adv;
  // Не все звёзды — можно сразу переиграть ради них. Звёзды за эту победу
  // уже должны быть записаны: кнопки рисуются раньше строки итога
  if (advWon()) advAward();
  const again = advWon() && advStarAt(c.n) < 3
    ? '<button class="btn-ghost" onclick="startAdventure(' + c.n + ')">' + escapeHtml(A.again) + '</button>' : '';
  if (advWon() && c.n + 1 < ADV_TOTAL) {
    return '<button class="btn" onclick="advNext()">' + escapeHtml(A.next.replace('{name}', advName(c.n + 1))) + '</button>' +
      again + '<button class="btn-ghost" onclick="quitToMenu()">' + escapeHtml(A.toMap) + '</button>';
  }
  if (advWon()) return again + '<button class="btn-ghost" onclick="quitToMenu()">' + escapeHtml(A.toMap) + '</button>';
  return (advWon() ? '' : '<button class="btn" onclick="startAdventure(' + c.n + ')">' + escapeHtml(A.again) + '</button>') +
    '<button class="btn-ghost" onclick="quitToMenu()">' + escapeHtml(A.toMap) + '</button>';
}

// «Дальше»: на карту и сразу карточка следующего — видно, кто он и чем опасен
function advNext() {
  const n = vsBot && vsBot.adv ? vsBot.adv.n + 1 : advDone();
  quitToMenu();
  openAdvCard(n);
}
