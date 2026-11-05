// ================= ПРИКЛЮЧЕНИЕ =================
// Вместо «Игры с ботом» — путь через миры (в замысле 50), по десять
// соперников в каждом. Соперник — персонаж со своим правилом: кто-то
// торопится, кто-то прячет ходы, кто-то ходит первым. Обыграл — открылся
// следующий. Десятый в мире — босс: играем до двух побед, а за него игрок
// получает иконку босса. Сложность — общий переключатель (легко / нормально /
// трудно), а не выбор бота.
//
// Прогресс — число обыгранных соперников подряд (0…500). Хранится в телефоне,
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

// Всего миров в замысле — 50; выходят партиями, готовые — в ADV_WORLDS.
// С шестого мира — волны по пять миров (см. advLevel), у героев — правила-данные
// (ADV_HEROES), тексты — отдельным файлом на язык (js/adv-<язык>.js).
// frost — у всех соперников мира числа с минусом. rule — особое правило мира:
// storm — бонусов вдвое больше, traps — ловушки в каждом бою (не только у
// босса), first — каждый раунд первым ходит соперник
const ADV_WORLD_MAX = 50;
const ADV_WORLDS = [
  { key: 'forest', range: 20, color: '#2bd18f', boss: '🧙', bonus: 'shield' },
  { key: 'jungle', range: 50, color: '#a3e635', boss: '🦍', bonus: 'half' },
  { key: 'sea', range: 100, color: '#42c8ff', boss: '🦑', bonus: 'xray' },
  { key: 'fire', range: 200, color: '#ff8a3d', boss: '🐲', bonus: 'lava' },
  { key: 'space', range: 500, color: '#a66bff', boss: '🛸', bonus: 'freeze' },
  // Волна 2
  { key: 'lemurs', range: 50, color: '#17c3b2', bonus: 'shield' },
  { key: 'arctic', range: 100, color: '#5aa9ff', bonus: 'freeze', frost: true },
  { key: 'desert', range: 150, color: '#e0a23a', bonus: 'compass' },
  { key: 'farm', range: 200, color: '#6fc04a', bonus: 'div3' },
  { key: 'sky', range: 300, color: '#8f9dff', bonus: 'half', rule: 'storm' },
  // Волна 3
  { key: 'garden', range: 100, color: '#d66bff', bonus: 'div5' },
  { key: 'dino', range: 150, color: '#a8b83a', bonus: 'xray' },
  { key: 'pirate', range: 200, color: '#e0574f', bonus: 'thief', rule: 'first' },
  { key: 'spooky', range: 300, color: '#5b5bd6', bonus: 'lava', rule: 'traps' },
  { key: 'castle', range: 500, color: '#e6b422', bonus: 'mirror' },
  // Волна 4
  { key: 'savanna', range: 100, color: '#f0a04b', bonus: 'shield' },
  { key: 'dragons', range: 150, color: '#e8553f', bonus: 'lava' },
  { key: 'abyss', range: 300, color: '#2e86de', bonus: 'xray', frost: true },
  { key: 'bamboo', range: 300, color: '#4cc38a', bonus: 'div3' },
  { key: 'ufo', range: 500, color: '#5b6cff', bonus: 'div5', rule: 'first' },
  // Волна 5
  { key: 'australia', range: 150, color: '#ff7f50', bonus: 'thief' },
  { key: 'circus', range: 200, color: '#e84393', bonus: 'mirror', rule: 'storm' },
  { key: 'crystal', range: 300, color: '#7ed6df', bonus: 'compass' },
  { key: 'mammoth', range: 400, color: '#74b9ff', bonus: 'freeze', frost: true },
  { key: 'rainbow', range: 500, color: '#fd79a8', bonus: 'half' },
  // Волна 6
  { key: 'swamp', range: 150, color: '#5f8f3e', bonus: 'shield', rule: 'traps' },
  { key: 'tsardom', range: 200, color: '#e74c3c', bonus: 'div3' },
  { key: 'peaks', range: 300, color: '#6c8ebf', bonus: 'freeze', frost: true },
  { key: 'robots', range: 400, color: '#95a5a6', bonus: 'div5', rule: 'first' },
  { key: 'myths', range: 500, color: '#8e44ad', bonus: 'lava' },
  // Волна 7
  { key: 'autumn', range: 200, color: '#d35400', bonus: 'thief' },
  { key: 'pyramids', range: 300, color: '#d4a017', bonus: 'half' },
  { key: 'atlantis', range: 300, color: '#16a085', bonus: 'compass', frost: true },
  { key: 'dreams', range: 400, color: '#6c5ce7', bonus: 'mirror', rule: 'storm' },
  { key: 'forge', range: 500, color: '#c0392b', bonus: 'lava', rule: 'traps' }
];
// Иконка за босса: у первых пяти миров — эмодзи, дальше — портрет самого
// босса. Список — на все 50 миров. Копия — в базе (adventure_icons), сверяется тестом
const ADV_ICONS = Array.from({ length: ADV_WORLD_MAX }, (_, w) => (w < 5 ? ADV_WORLDS[w].boss : 'adv-' + (w + 1) * 10));
ADV_WORLDS.forEach((W, w) => { if (!W.boss) W.boss = ADV_ICONS[w]; });
const ADV_PER_WORLD = 10;
// Сколько соперников уже можно сыграть
const ADV_TOTAL = ADV_WORLDS.length * ADV_PER_WORLD;
// С шестого мира новый мир открывает не только победа над боссом, но и
// звёзды в прошлом мире: стимул переиграть на «Нормально» и «Трудно»
const ADV_GATE_FROM = 5, ADV_GATE_STARS = 20;
const ADV_DIFFS = ['easy', 'normal', 'hard'];

// ---------- характеры ----------
// У каждого соперника — своё постоянное правило, у босса — две способности.
// Правило — набор «крючков», которые движок дуэли зовёт в нужный момент
// (game.js: startRound, duelPlay, useToken, botMove, hiddenRow, applyBonus):
//   start(R)        — начало раунда;
//   after(R, m)     — после хода m (m.p: 0 — игрок, 1 — соперник);
//   arm(R, p)       — p взвёл «⚡ +1 ход»; true — взвод перехвачен;
//   turn(R)         — соперник начинает свой ход;
//   pick(R, cand)   — какое число назовёт соперник (null — как обычно).
// Поля: icon — значок, level / think — сила и раздумья, tokens — прибавка
// «⚡ +1 ход» [игроку, сопернику], frost — числа с минусом, first — ходит
// первым, forget — помнит два хода, gamble — доля ходов наугад, immune — какие
// помехи на него не действуют, bonus — свои бонусы на прямой, noTokens — сам
// «+1 ход» не берёт.
// Загаданное число правила не трогают никогда: меняется только, кто что
// видит, кто когда ходит и у кого сколько «+1 ход».
const ADV_HOT = 5, ADV_VERY_HOT = 6, ADV_COLD = 1;   // пояса: «Горячо», «Очень горячо», «Холодно»
const ADV_CAST = [
  'apple', 'acorns', 'thief', 'hop', 'specs', 'shy', 'cloak', 'sleepy', 'owl', 'wizard',
  'toucan', 'frog', 'chameleon', 'sloth', 'banana', 'snake', 'zebra', 'giraffe', 'elephant', 'gorilla',
  'clown', 'seahorse', 'crab', 'jelly', 'seal', 'turtle', 'penguin', 'octopus', 'shark', 'kraken',
  'spark', 'miner', 'ember', 'bat', 'bell', 'phoenix', 'beetle', 'knight', 'crystal', 'dragon',
  'robot', 'alien', 'cat', 'moon', 'meteor', 'whale', 'eyes', 'comet', 'blackhole', 'ufo'
];
// «Горячо» и ближе, но не попадание: на попадании раунд уже кончился
function advHot(R, m) { const k = R.tier(m); return k >= ADV_HOT && k < 8; }
function advVeryHot(R, m) { const k = R.tier(m); return k >= ADV_VERY_HOT && k < 8; }
// Первый ход соперника в раунде — повод сказать про своё правило
function advFirstBotMove(R, m) { return m.p === 1 && R.count(1) === 1; }
const ADV_RULES = {
  // ---- Волшебный лес ----
  apple: { icon: '🍎', after(R, m) { if (m.p === 0 && advHot(R, m) && R.once('apple')) { R.give(0, 1); R.fire('rule'); } } },
  acorns: { icon: '🌰', level: -0.05, tokens: [0, 1], arm(R, p) { if (p === 1) R.fire('rule'); } },
  thief: { icon: '🧣', after(R, m) {
    if (m.p === 0 && R.tier(m) <= ADV_COLD && D.tokens[0] > 0) { R.take(0, 1); R.give(1, 1); R.fire('rule'); } } },
  hop: { icon: '🥕', first: true, after(R, m) { if (advFirstBotMove(R, m)) { R.again(); R.fire('rule'); } } },
  specs: { icon: '👓', level: -0.1, start(R) { R.know(0, 'parity'); R.know(1, 'parity'); R.fire('rule', { k: R.word('parity') }); } },
  shy: { icon: '🌼', after(R, m) { if (m.p === 0 && advVeryHot(R, m) && R.once('shy')) { R.skip(1); R.fire('rule'); } } },
  cloak: { icon: '🦊', after(R, m) { if (advFirstBotMove(R, m)) { R.hide(m); R.fire('rule'); } } },
  sleepy: { icon: '🍯', after(R, m) { if (m.p === 1 && R.count(1) % 2 === 0) { R.skip(1); R.fire('rule'); } } },
  owl: { icon: '🧐', start(R) { R.know(1, 'half'); R.fire('rule'); } },
  wizard: { icon: '👑', a1icon: '🌫️', a2icon: '✨', boss: true, after(R, m) {
    if (m.p === 0 && advHot(R, m) && !D.blind[0] && R.once('a1')) { R.fog(0); R.fire('a1'); }
    else if (m.p === 1 && advHot(R, m) && R.once('a2')) { R.again(); R.fire('a2'); } } },
  // ---- Джунгли ----
  toucan: { icon: '📢', after(R, m) {
    if (m.p === 1 && R.tier(m) < 8) { const k = R.dir(m.guess); R.know(0, k, m.guess); R.fire('rule', { k: R.word(k, m.guess) }); } } },
  frog: { icon: '🐸', pick(R, cand, plan) {
    // Пока чисел много — прыгает на ближайшее круглое
    if (R.left(cand) <= 5) return null;
    const r = Math.round(plan / 5) * 5;
    const v = Math.max(RANGE_MIN, Math.min(RANGE_MAX, r));
    if (R.once('frog')) R.fire('rule');
    return R.named(v) ? null : v; } },
  chameleon: { icon: '🦎', after(R, m) {
    // Виден только последний его ход: прежние прячутся
    if (m.p !== 1) return;
    history.forEach(h => { if (h.p === 1 && h !== m) R.hide(h); });
    if (R.count(1) === 2) R.fire('rule'); } },
  sloth: { icon: '🤔', level: 0.08, think: [3, 5], after(R, m) { if (advFirstBotMove(R, m)) R.fire('rule'); } },
  banana: { icon: '🍌', level: 0.06, after(R, m) {
    if (m.p === 0 && R.tier(m) < 8 && R.nearBot(m.guess, 2) && R.once('banana')) { R.skip(0); R.fire('rule'); } } },
  snake: { icon: '🎀', arm(R, p) { if (p === 0) { R.give(1, 1); R.fire('rule'); } } },
  zebra: { icon: '🎧', level: -0.08, think: [0.6, 1.3], after(R, m) { if (advFirstBotMove(R, m)) R.fire('rule'); } },
  giraffe: { icon: '🦒', pick(R, cand) {
    const b = R.bonusIn(cand);
    if (b === null || Math.random() > 0.7) return null;
    R.fire('rule');
    return b; } },
  // Его «Топот» даёт два хода подряд у самого ответа — сам играет попроще
  elephant: { icon: '🐘', level: -0.15, after(R, m) { if (m.p === 1 && advHot(R, m) && R.once('elephant')) { R.skip(0); R.fire('rule'); } } },
  gorilla: { icon: '👑', a1icon: '🔊', a2icon: '🍌', boss: true,
    start(R) { if (D.tokens[0] > 0) { R.take(0, 1); R.give(1, 1); R.fire('a2'); } },
    after(R, m) { if (m.p === 0 && advHot(R, m) && R.once('a1')) { R.skip(0, true); R.fire('a1'); } } },
  // ---- Морская глубина ----
  clown: { icon: '🤡', level: -0.1, gamble: 0.3 },
  seahorse: { icon: '🔮', start(R) { R.know(0, 'half'); R.fire('rule', { k: R.word('half') }); } },
  crab: { icon: '🦀', after(R, m) {
    if (m.p !== 0) return;
    if (R.round.grab) { R.round.grab = false; R.hide(m); }
    else if (advHot(R, m) && R.once('crab')) { R.round.grab = true; R.fire('rule'); } } },
  jelly: { icon: '🪼', forget: true, after(R, m) { if (m.p === 1 && R.count(1) === 3) R.fire('rule'); } },
  seal: { icon: '🍦', frost: true, start(R) { if (D.round === 1) R.fire('rule'); } },
  turtle: { icon: '🐢', immune: ['fog', 'blind', 'freeze'] },
  penguin: { icon: '🐧', level: -0.12, first: true, start(R) { R.fire('rule'); } },
  octopus: { icon: '🤹', bonus: 'magic', start(R) { R.fire('rule'); } },
  shark: { icon: '🦈', start(R) { R.know(1, 'parity'); R.fire('rule'); } },
  kraken: { icon: '👑', a1icon: '🌑', a2icon: '🏴‍☠️', boss: true, level: -0.15,
    // Абордаж: взведённый «+1 ход» игрока уходит кракену
    arm(R, p) { if (p === 0 && R.once('a2')) { R.give(1, 1); R.fire('a2'); return true; } },
    after(R, m) { if (m.p === 0 && advHot(R, m) && R.once('a1')) { R.memory(0); R.fire('a1'); } } },
  // ---- Огненные горы ----
  spark: { icon: '✨', after(R, m) { if (m.p === 0 && R.tier(m) <= ADV_COLD && R.once('spark')) { R.lava(0); R.fire('rule'); } } },
  miner: { icon: '⛏️', pick(R, cand) {
    // Копает по порядку: 25, 50, 75… — пока сам не дойдёт до «Тепло»
    if (history.some(h => h.p === 1 && R.tier(h) >= 3)) return null;
    for (let v = 25; v <= RANGE_MAX; v += 25) {
      if (v >= RANGE_MIN && !R.named(v) && cand[v - RANGE_MIN]) { if (R.once('miner')) R.fire('rule'); return v; }
    }
    return null; } },
  ember: { icon: '🔥', level: -0.2, arm(R, p) { if (p === 1) { D.armedExtra = 1; R.fire('rule'); } } },
  // Дальние её ходы («Прохладно» и холоднее) — в темноте, близкие видно
  bat: { icon: '🦇', after(R, m) { if (m.p === 1 && R.tier(m) <= 2) { R.hide(m); if (R.once('bat')) R.fire('rule'); } } },
  bell: { icon: '🔔', after(R, m) {
    if (m.p === 0 && advHot(R, m)) { const k = R.dir(m.guess); R.know(0, k, m.guess); R.fire('rule', { k: R.word(k, m.guess) }); } } },
  phoenix: { icon: '🐣', level: -0.15, after(R, m) { if (m.p === 1 && R.tier(m) <= ADV_COLD && R.once('phoenix')) { R.again(); R.fire('rule'); } } },
  beetle: { icon: '🪲', after(R, m) { if (m.p === 1 && R.tier(m) <= ADV_COLD && D.tokens[1] < 3) { R.give(1, 1); R.fire('rule'); } } },
  knight: { icon: '🛡️', bonus: 'knight', noTokens: true, start(R) { R.fire('rule'); },
    pick(R, cand, plan) {
      // Бонусы обходит: если задуманное число — бонус, берёт соседнее возможное
      if (!D.bonuses.some(b => !b.taken && b.value === plan)) return null;
      for (let d = 1; d <= RANGE_MAX - RANGE_MIN; d++) {
        for (const v of [plan - d, plan + d]) {
          if (v >= RANGE_MIN && v <= RANGE_MAX && cand[v - RANGE_MIN] && !R.named(v) &&
              !D.bonuses.some(b => !b.taken && b.value === v)) return v;
        }
      }
      return null; } },
  crystal: { icon: '💎', frost: true, start(R) { R.know(0, 'parity'); R.know(1, 'parity'); R.fire('rule', { k: R.word('parity') }); } },
  // Обе способности сильные — сам дракон играет попроще, иначе он выходил
  // сложнее финального босса
  dragon: { icon: '👑', a1icon: '🔥', a2icon: '🌡️', boss: true, level: -0.3, after(R, m) {
    if (m.p !== 1) return;
    if (R.count(1) === 3) { R.lava(0); R.fire('a1'); }
    else if (advVeryHot(R, m) && D.tokens[0] > 0 && R.once('a2')) { D.tokens[0] = 0; R.fire('a2'); } } },
  // ---- Космос ----
  robot: { icon: '🤖', levelSet: 0.98, after(R, m) { if (advFirstBotMove(R, m)) R.fire('rule'); } },
  alien: { icon: '👽', tokens: [1, 0], start(R) { R.fire('rule'); } },
  cat: { icon: '🐱', pick(R, cand) {
    // Любопытный: идёт к вашему последнему числу — ближайшее возможное к нему
    const mine = history.filter(h => h.p === 0);
    if (!mine.length) return null;
    const x = mine[mine.length - 1].guess;
    let best = null;
    for (let i = 0; i < cand.length; i++) {
      const v = i + RANGE_MIN;
      if (cand[i] && !R.named(v) && (best === null || Math.abs(v - x) < Math.abs(best - x))) best = v;
    }
    if (best !== null && R.once('cat')) R.fire('rule');
    return best; } },
  moon: { icon: '🌙', level: -0.25, after(R, m) { if (m.p === 1 && R.count(1) % 2 === 0) { R.hide(m); if (R.once('moon')) R.fire('rule'); } } },
  meteor: { icon: '☄️', after(R, m) {
    // Каждый третий ход — метеорит: следующий ход, чей бы он ни был, делается сам
    if (history.length % 3 === 0 && R.tier(m) < 8) { D.lavaNext = true; R.fire('rule'); } } },
  whale: { icon: '🐋', level: -0.08, start(R) { R.know(0, 'half'); R.know(1, 'half'); R.fire('rule', { k: R.word('half') }); } },
  // Обмен: сам знает половину, а вам говорит чётность
  eyes: { icon: '👁️', level: -0.25, start(R) { R.know(1, 'half'); R.know(0, 'parity'); R.fire('rule', { k: R.word('parity') }); } },
  comet: { icon: '💫', level: -0.15, think: [0.3, 0.8], after(R, m) { if (advFirstBotMove(R, m)) R.fire('rule'); } },
  blackhole: { icon: '🌀', frost: true, after(R, m) { if (m.p === 0 && R.tier(m) === 0) { R.hide(m); R.fire('rule'); } } },
  ufo: { icon: '👑', a1icon: '🛸', a2icon: '🚀', boss: true,
    turn(R) { if (R.round.teleport) { R.round.teleport = false; D.armed = true; } },
    after(R, m) {
      if (m.p !== 0) return;
      if (advHot(R, m) && R.once('a1')) { R.hide(m); R.fire('a1'); }
      else if (R.tier(m) <= ADV_COLD && R.once('a2')) { R.round.teleport = true; R.fire('a2'); } } }
};

// ---------- герои с шестого мира: правило — данными ----------
// Первые 50 соперников — правила-функции выше. С шестого мира герой — запись
// в ADV_HEROES: on: [когда, что, раз за раунд (1) или каждый раз (0)] и черты
// (level, think, tokens, first, forget, gamble, immune, noTokens, pick).
// У босса вместо on — две способности, a1 и a2. Так 450 героев — таблица, а не
// 450 функций, и тест проверяет, что сочетания не повторяются.
//   когда, после хода: youHot / youVeryHot / youWarm / youCold / youVeryCold —
//     пояс вашего хода («Горячо», «Очень горячо», «Тепло» и ближе; «Холодно»,
//     «Очень холодно» и дальше); youCloser / youColder — вы теплее или холоднее,
//     чем своим прошлым ходом; me… — то же про ход соперника; meN:k / youN:k —
//     его (ваш) k-й ход в раунде; meEvery:k / youEvery:k / every:k — каждый
//     k-й ход: его, ваш, любой. Без хода: start — начало раунда; youArm / meArm
//     — взвели «⚡ +1 ход»
//   что: giveYou / giveMe / giveBoth — «⚡ +1 ход» вам, ему, обоим; steal — ваш
//     «⚡» уходит ему; burn — ваш «⚡» пропадает, burnMe — его; swapTokens —
//     меняетесь «⚡»; skipYou / freezeYou / skipMe — пропуск хода (freeze — ещё
//     и 🧊); again — тот, кто сходил, ходит ещё раз; double — следующий ход
//     соперника двойной; hide — этот ход не видно; fogYou — до конца раунда не
//     видно его ходов, blindYou — своих; memoryYou — видны только два последних
//     хода; lavaYou — ваш следующий ход — шальной бросок; tellDir / tellParity /
//     tellHalf — говорит вам «больше/меньше», чётность, половину; knowDir /
//     knowParity / knowHalf — знает сам
//   pick — как выбирает число: tens (круглые), mirror (зеркально вашему), creep
//     (шажками), up (всё выше), lucky (с семёркой)
function advTrend(R, m) {
  const mine = history.filter(h => h.p === m.p && !h.timeout);
  const i = mine.indexOf(m);
  return i < 1 ? 0 : Math.sign(R.tier(m) - R.tier(mine[i - 1]));
}
const advWarm = (R, m) => R.tier(m) >= 3 && R.tier(m) < 8;
const ADV_WHEN = {
  youHot: (R, m) => m.p === 0 && advHot(R, m),
  youVeryHot: (R, m) => m.p === 0 && advVeryHot(R, m),
  youWarm: (R, m) => m.p === 0 && advWarm(R, m),
  youCold: (R, m) => m.p === 0 && R.tier(m) <= ADV_COLD,
  youVeryCold: (R, m) => m.p === 0 && R.tier(m) === 0,
  youCloser: (R, m) => m.p === 0 && R.tier(m) < 8 && advTrend(R, m) > 0,
  youColder: (R, m) => m.p === 0 && advTrend(R, m) < 0,
  meHot: (R, m) => m.p === 1 && advHot(R, m),
  meVeryHot: (R, m) => m.p === 1 && advVeryHot(R, m),
  meWarm: (R, m) => m.p === 1 && advWarm(R, m),
  meCold: (R, m) => m.p === 1 && R.tier(m) <= ADV_COLD,
  meVeryCold: (R, m) => m.p === 1 && R.tier(m) === 0,
  meCloser: (R, m) => m.p === 1 && R.tier(m) < 8 && advTrend(R, m) > 0,
  meColder: (R, m) => m.p === 1 && advTrend(R, m) < 0,
  meN: (R, m, k) => m.p === 1 && R.count(1) === k,
  youN: (R, m, k) => m.p === 0 && R.count(0) === k,
  meEvery: (R, m, k) => m.p === 1 && R.count(1) % k === 0,
  youEvery: (R, m, k) => m.p === 0 && R.count(0) % k === 0,
  every: (R, m, k) => history.length % k === 0
};
// false — не вышло (нечего забрать): правило молчит и не тратит «раз за раунд»;
// объект — слова для реплики ({k})
const ADV_ACT = {
  giveYou: R => { R.give(0, 1); },
  giveMe: R => { if (D.tokens[1] >= 3) return false; R.give(1, 1); },
  steal: R => { if (!D.tokens[0]) return false; R.take(0, 1); R.give(1, 1); },
  burn: R => { if (!D.tokens[0]) return false; R.take(0, 1); },
  skipYou: R => { R.skip(0); },
  freezeYou: R => { R.skip(0, true); },
  skipMe: R => { R.skip(1); },
  again: R => { R.again(); },
  double: R => { R.round.double = true; },
  hide: (R, m) => { R.hide(m); },
  // Туман и слепота вместе закрыли бы всё — как и у бонусов, второго нет
  fogYou: R => { if (D.fog[0] || D.blind[0]) return false; R.fog(0); },
  blindYou: R => { if (D.blind[0] || D.fog[0]) return false; R.blind(0); },
  memoryYou: R => { if (D.shortMemory[0]) return false; R.memory(0); },
  lavaYou: R => { R.lava(0); },
  tellDir: (R, m) => { const k = R.dir(m.guess); R.know(0, k, m.guess); return { k: R.word(k, m.guess) }; },
  tellParity: R => { R.know(0, 'parity'); return { k: R.word('parity') }; },
  tellHalf: R => { R.know(0, 'half'); return { k: R.word('half') }; },
  knowParity: R => { R.know(1, 'parity'); },
  knowHalf: R => { R.know(1, 'half'); },
  // Сам узнаёт, больше загаданное этого числа или меньше. Вам не скажет
  knowDir: (R, m) => { R.know(1, R.dir(m.guess), m.guess); },
  swapTokens: () => { if (D.tokens[0] === D.tokens[1]) return false; D.tokens.reverse(); },
  giveBoth: R => { R.give(0, 1); R.give(1, 1); },
  burnMe: R => { if (!D.tokens[1]) return false; R.take(1, 1); }
};
// Свой способ выбирать число: null — как обычно
const ADV_PICKS = {
  // Круглые, на 0, пока возможных много
  tens: (R, cand, plan) => {
    if (R.left(cand) <= 6) return null;
    for (let d = 0; d <= RANGE_MAX - RANGE_MIN; d += 10) {
      for (const v of [Math.round(plan / 10) * 10 - d, Math.round(plan / 10) * 10 + d]) {
        if (v >= RANGE_MIN && v <= RANGE_MAX && cand[v - RANGE_MIN] && !R.named(v)) return v;
      }
    }
    return null;
  },
  // Зеркально вашему последнему числу, если оно ещё может быть загаданным
  mirror: (R, cand) => {
    const mine = history.filter(h => h.p === 0);
    if (!mine.length) return null;
    const v = RANGE_MIN + RANGE_MAX - mine[mine.length - 1].guess;
    return v >= RANGE_MIN && v <= RANGE_MAX && cand[v - RANGE_MIN] && !R.named(v) ? v : null;
  },
  // Растёт вверх: ближайшее возможное число выше своего прошлого
  up: (R, cand) => {
    const me = history.filter(h => h.p === 1);
    if (!me.length || R.left(cand) <= 6) return null;
    for (let v = me[me.length - 1].guess + 1; v <= RANGE_MAX; v++) if (cand[v - RANGE_MIN] && !R.named(v)) return v;
    return null;
  },
  // Любит семёрки: число с цифрой 7 поближе к задуманному, пока возможных много
  lucky: (R, cand, plan) => {
    if (R.left(cand) <= 6) return null;
    for (let d = 0; d <= RANGE_MAX - RANGE_MIN; d++) {
      for (const v of [plan - d, plan + d]) {
        if (v >= RANGE_MIN && v <= RANGE_MAX && cand[v - RANGE_MIN] && !R.named(v) && /7/.test(String(v))) return v;
      }
    }
    return null;
  },
  // Маленькими шажками рядом со своим прошлым числом
  creep: (R, cand) => {
    const me = history.filter(h => h.p === 1);
    if (!me.length) return null;
    const x = me[me.length - 1].guess;
    for (let d = 1; d <= 3; d++) {
      for (const v of [x - d, x + d]) {
        if (v >= RANGE_MIN && v <= RANGE_MAX && cand[v - RANGE_MIN] && !R.named(v)) return v;
      }
    }
    return null;
  }
};
// Запись героя → правило с теми же крючками, что у первых пятидесяти
function advCompile(spec) {
  const R = Object.assign({}, spec);
  const list = spec.boss ? [['a1', spec.a1], ['a2', spec.a2]] : spec.on ? [['rule', spec.on]] : [];
  const run = (Rc, kind, on, m, act) => {
    if (on[2] && Rc.round.once[kind]) return false;
    const v = (act || ADV_ACT[on[1]])(Rc, m);
    if (v === false) return false;
    if (on[2]) Rc.round.once[kind] = true;
    Rc.fire(kind, v || undefined);
    return true;
  };
  const key = on => on[0].split(':')[0], arg = on => +(on[0].split(':')[1] || 0);
  const starts = list.filter(([, on]) => key(on) === 'start');
  const arms = list.filter(([, on]) => key(on) === 'youArm' || key(on) === 'meArm');
  const afters = list.filter(([, on]) => ADV_WHEN[key(on)]);
  // Черта без «когда» (первым ходит, минус-числа, свой способ ходить…) —
  // говорит о себе в начале боя
  R.start = Rc => {
    starts.forEach(([kind, on]) => run(Rc, kind, on, null));
    if (!list.length && !spec.pick && D.round === 1) Rc.fire('rule');
  };
  if (afters.length) {
    R.after = (Rc, m) => {
      for (const [kind, on] of afters) if (ADV_WHEN[key(on)](Rc, m, arg(on)) && run(Rc, kind, on, m)) break;
    };
  }
  if (arms.length) {
    // Взведённый «⚡» уже списан со счёта: steal отдаёт его сопернику, burn —
    // просто гасит. Обычные steal/burn забрали бы второй, ещё не взведённый
    const onArm = { steal: Rc => { Rc.give(1, 1); }, burn: () => {} };
    R.arm = (Rc, p) => {
      for (const [kind, on] of arms) {
        if ((key(on) === 'youArm') !== (p === 0)) continue;
        const cut = p === 0 ? onArm[on[1]] : null;
        // Ваш «⚡» перехвачен или сгорел: двух ходов подряд не будет
        if (run(Rc, kind, on, null, cut) && cut) return true;
      }
      return false;
    };
  }
  if (list.some(([, on]) => on[1] === 'double')) {
    R.turn = Rc => { if (Rc.round.double) { Rc.round.double = false; D.armed = true; } };
  }
  if (typeof spec.pick === 'string') {
    const how = ADV_PICKS[spec.pick];
    R.pick = (Rc, cand, plan) => {
      const v = how(Rc, cand, plan);
      if (v !== null && Rc.once('pick')) Rc.fire('rule');
      return v;
    };
  }
  return R;
}
// Герои миров 6–50: правило — запись, а не функция (см. advCompile). Номер
// героя n = 50 + индекс; тексты — в js/adv-<язык>.js в том же порядке
const ADV_HEROES = [
  // 6 · Остров лемуров (51–60)
  { icon: '🚧', on: ['youCold', 'skipYou', 1], level: -0.29 },
  { icon: '🥭', on: ['meHot', 'giveYou', 1], level: -0.19 },
  { icon: '🕛', on: ['youN:1', 'fogYou', 1], level: -0.36 },
  { icon: '💃', on: ['youHot', 'double', 1], level: -0.26 },
  { icon: '🌰', on: ['meN:2', 'giveMe', 1], level: 0.02 },
  { icon: '📖', on: ['youN:1', 'tellParity', 1], level: 0.16 },
  { icon: '🍂', on: ['youCloser', 'skipMe', 1], level: 0.5 },
  { icon: '💤', on: ['youN:2', 'skipMe', 1], level: 0.5 },
  { icon: '📢', on: ['youWarm', 'memoryYou', 1], level: -0.03 },
  { boss: true, icon: '👑', a1icon: '🐾', a1: ['youCloser', 'steal', 1], a2icon: '🍖', a2: ['every:4', 'giveMe', 1], level: 0.35 },
  // 7 · Ледяная Арктика (61–70)
  { icon: '⛄', on: ['youN:1', 'lavaYou', 1] },
  { icon: '🌨️', on: ['youColder', 'fogYou', 1], level: -0.03 },
  { icon: '🎣', on: ['meColder', 'giveMe', 1], level: -0.01 },
  { icon: '🧭', on: ['meHot', 'tellDir', 1], level: 0.03 },
  { icon: '🌙', on: ['meEvery:3', 'hide', 0], level: -0.01 },
  { icon: '🔔', on: ['youWarm', 'tellDir', 1], level: 0.13 },
  { icon: '❄️', on: ['youVeryHot', 'freezeYou', 1] },
  { icon: '🐟', on: ['youColder', 'giveMe', 1], level: 0.01 },
  { icon: '🛷', on: ['meN:2', 'double', 1], level: -0.08 },
  { boss: true, icon: '👑', a1icon: '🌪️', a1: ['youN:2', 'fogYou', 1], a2icon: '🥶', a2: ['youCloser', 'freezeYou', 1], level: -0.2 },
  // 8 · Жаркая пустыня (71–80)
  { icon: '💦', on: ['youHot', 'burn', 1], level: -0.11 },
  { icon: '👂', on: ['youN:2', 'tellHalf', 1], level: -0.06 },
  { icon: '🔭', on: ['meEvery:2', 'tellDir', 0], level: 0.09 },
  { icon: '🦂', on: ['youCloser', 'lavaYou', 1], level: -0.17 },
  { icon: '😎', on: ['meWarm', 'skipMe', 1], level: 0.22 },
  { icon: '🥎', on: ['meColder', 'again', 1], level: -0.07 },
  { icon: '🔁', pick: 'mirror', level: 0.12 },
  { icon: '🐾', on: ['youWarm', 'hide', 1], level: -0.07 },
  { icon: '😱', on: ['meN:1', 'skipYou', 1], level: 0.04 },
  { boss: true, icon: '👑', a1icon: '🏜️', a1: ['youN:3', 'memoryYou', 1], a2icon: '🏺', a2: ['youVeryHot', 'lavaYou', 1], level: -0.34 },
  // 9 · Весёлая ферма (81–90)
  { icon: '🥛', on: ['youCold', 'giveYou', 1], level: 0.02 },
  { icon: '🐽', on: ['youColder', 'memoryYou', 1], level: -0.29 },
  { icon: '🛑', on: ['meN:2', 'skipMe', 1], level: 0.43 },
  { icon: '📣', on: ['meN:1', 'tellDir', 1], level: 0.09 },
  { icon: '🎯', pick: 'tens', level: -0.02 },
  { icon: '🐎', on: ['meHot', 'double', 1], level: -0.18 },
  { icon: '🐕', on: ['youColder', 'skipYou', 1], level: -0.1 },
  { icon: '🎴', on: ['meN:2', 'hide', 1], level: -0.11 },
  { icon: '🧀', on: ['youVeryCold', 'giveMe', 1], level: 0.13 },
  { boss: true, icon: '👑', a1icon: '🤏', a1: ['youWarm', 'steal', 1], a2icon: '🎺', a2: ['meColder', 'double', 1], level: -0.27 },
  // 10 · Облачный город (91–100)
  { icon: '🦜', on: ['youVeryHot', 'tellDir', 1], level: -0.12 },
  { icon: '🌺', on: ['meN:1', 'again', 1], level: -0.17 },
  { icon: '🦩', on: ['every:5', 'skipMe', 1], level: 0.28 },
  { icon: '🦅', on: ['meN:2', 'knowParity', 1], level: -0.29 },
  { icon: '🌪️', on: ['youN:3', 'hide', 1], level: -0.13 },
  { icon: '🌬️', on: ['meCloser', 'again', 1] },
  { icon: '✉️', on: ['youColder', 'giveYou', 1], level: 0.06 },
  { icon: '🪂', on: ['meColder', 'hide', 0], level: 0.22 },
  { icon: '📦', on: ['youN:2', 'giveYou', 1], level: 0.2 },
  { boss: true, icon: '👑', a1icon: '🌩️', a1: ['youCloser', 'skipYou', 1], a2icon: '🌧️', a2: ['every:4', 'hide', 1], level: -0.28 },
  // 11 · Цветочный сад (101–110)
  { icon: '🍯', on: ['meHot', 'giveMe', 1], level: -0.04 },
  { icon: '🌈', on: ['youWarm', 'tellParity', 1], level: 0.05 },
  { icon: '📖', on: ['meN:3', 'knowHalf', 1] },
  { icon: '🐌', pick: 'creep', think: [2.5, 4], level: -0.14 },
  { icon: '🎻', on: ['every:3', 'tellParity', 1], level: 0.13 },
  { icon: '🚁', on: ['meWarm', 'again', 1], level: -0.13 },
  { icon: '💪', on: ['youArm', 'skipMe', 1], level: 0.11 },
  { icon: '🌸', on: ['meCloser', 'giveYou', 1], level: 0.11 },
  { icon: '🕳️', on: ['meN:3', 'again', 1], level: -0.09 },
  { boss: true, icon: '👑', a1icon: '🐝', a1: ['youCloser', 'fogYou', 1], a2icon: '🪤', a2: ['youVeryHot', 'skipYou', 1], level: -0.14 },
  // 12 · Долина динозавров (111–120)
  { icon: '🦏', on: ['meVeryHot', 'skipYou', 1], level: -0.06 },
  { icon: '🦔', on: ['youArm', 'burn', 1], level: -0.1 },
  { icon: '🪶', on: ['youColder', 'double', 1], level: -0.07 },
  { icon: '🦒', on: ['meN:3', 'tellHalf', 1], level: 0.02 },
  { icon: '🔨', on: ['youVeryHot', 'burn', 1] },
  { icon: '💨', on: ['meN:2', 'again', 1], think: [0.5, 1.2], level: -0.04 },
  { icon: '🥚', on: ['meN:1', 'skipMe', 1], level: 0.31 },
  { icon: '🎺', on: ['youCold', 'tellDir', 0], level: 0.04 },
  { icon: '🌊', on: ['meWarm', 'hide', 1], level: -0.11 },
  { boss: true, icon: '👑', a1icon: '🦖', a1: ['meHot', 'freezeYou', 1], a2icon: '👣', a2: ['meN:4', 'double', 1], level: -0.03 },
  // 13 · Пиратский остров (121–130)
  { icon: '📢', on: ['meColder', 'tellDir', 0], level: -0.07 },
  { icon: '🏴‍☠️', on: ['youHot', 'steal', 1], level: -0.13 },
  { icon: '🪙', on: ['youVeryHot', 'giveYou', 1] },
  { icon: '⭐', on: ['start', 'tellParity', 0], level: 0.48 },
  { icon: '📯', on: ['meN:3', 'freezeYou', 1], level: -0.18 },
  { icon: '🦞', on: ['youCloser', 'hide', 1], level: -0.04 },
  { icon: '🗺️', on: ['meN:2', 'tellHalf', 1], level: 0.08 },
  { icon: '🗝️', on: ['youColder', 'steal', 1], level: -0.02 },
  { icon: '💥', on: ['meVeryHot', 'lavaYou', 1], level: -0.1 },
  { boss: true, icon: '👑', a1icon: '⚔️', a1: ['youVeryHot', 'steal', 1], a2icon: '💣', a2: ['every:5', 'skipYou', 1], level: -0.23 },
  // 14 · Деревня Хэллоуин (131–140)
  { icon: '👻', on: ['meHot', 'hide', 1], level: -0.08 },
  { icon: '👉', on: ['youN:2', 'tellDir', 1], level: 0.07 },
  { icon: '🧹', on: ['meVeryHot', 'again', 1], level: 0.03 },
  { icon: '🩹', on: ['youN:3', 'skipYou', 1], level: -0.12 },
  { icon: '🔌', on: ['meN:2', 'lavaYou', 1], level: -0.1 },
  { icon: '🕸️', on: ['youWarm', 'skipYou', 1], level: 0.01 },
  { icon: '😵', on: ['youColder', 'lavaYou', 1], level: -0.02 },
  { icon: '🌕', on: ['every:6', 'double', 1], level: 0.15 },
  { icon: '🦶', on: ['meCloser', 'skipYou', 1], level: 0.02 },
  { boss: true, icon: '👑', a1icon: '🦇', a1: ['meVeryHot', 'fogYou', 1], a2icon: '🧛', a2: ['youCloser', 'burn', 1], level: -0.33 },
  // 15 · Королевский замок (141–150)
  { icon: '🐸', on: ['youVeryCold', 'again', 1], level: 0.06 },
  { icon: '📜', on: ['youN:1', 'skipYou', 1], level: 0.02 },
  { icon: '🃏', on: ['every:3', 'lavaYou', 1], level: -0.14 },
  { icon: '🩰', on: ['meCloser', 'hide', 1], level: -0.18 },
  { icon: '🦚', on: ['meN:1', 'tellHalf', 1], level: 0.21 },
  { icon: '🧲', on: ['meCloser', 'steal', 1], level: -0.13 },
  { icon: '🤺', on: ['meHot', 'burn', 1], level: -0.07 },
  { icon: '🗡️', on: ['meN:2', 'tellParity', 1], first: true, level: 0.3 },
  { icon: '🌉', on: ['youN:2', 'steal', 1], level: -0.05 },
  { boss: true, icon: '👑', a1icon: '🦁', a1: ['youVeryHot', 'memoryYou', 1], a2icon: '👑', a2: ['meWarm', 'double', 1], level: -0.17 },
  // 16 · Саванна (151–160)
  { icon: '🐤', on: ['youCloser', 'tellParity', 1] },
  { icon: '🌼', on: ['meCold', 'giveYou', 1] },
  { icon: '🏁', on: ['meN:1', 'double', 1], level: -0.1 },
  { icon: '😆', on: ['youColder', 'tellDir', 1], level: 0.04 },
  { icon: '🙈', on: ['youHot', 'hide', 1], level: -0.04 },
  { icon: '🌿', on: ['meCloser', 'double', 1], level: -0.02 },
  { icon: '🐃', on: ['every:4', 'skipYou', 1], level: -0.11 },
  { icon: '👀', on: ['meN:2', 'knowHalf', 1], level: 0.13 },
  { icon: '✒️', on: ['youN:3', 'tellHalf', 1], level: 0.11 },
  { boss: true, icon: '👑', a1icon: '🔄', a1: ['youCloser', 'swapTokens', 1], a2icon: '🐾', a2: ['youHot', 'skipYou', 1], level: 0.116 },
  // 17 · Драконья долина (161–170)
  { icon: '🔥', on: ['youCloser', 'giveMe', 1], level: -0.08 },
  { icon: '🎐', on: ['meWarm', 'tellDir', 1], level: 0.05 },
  { icon: '🤧', on: ['youN:2', 'lavaYou', 1], level: -0.1 },
  { icon: '💨', on: ['meN:3', 'double', 1], level: -0.03 },
  { icon: '👻', on: ['meN:3', 'hide', 1], level: -0.01 },
  { icon: '💛', on: ['youColder', 'again', 1], level: 0.15 },
  { icon: '🔊', on: ['every:3', 'skipYou', 1], level: -0.1 },
  { icon: '💰', on: ['youN:2', 'burn', 1], level: -0.09 },
  { icon: '☁️', on: ['meColder', 'skipMe', 1], level: 0.16 },
  { boss: true, icon: '👑', a1icon: '🌋', a1: ['meVeryHot', 'blindYou', 1], a2icon: '🐲', a2: ['every:4', 'double', 1], level: -0.27 },
  // 18 · Тёмная бездна (171–180)
  { icon: '🏮', on: ['youCold', 'tellParity', 1], level: 0.11 },
  { icon: '🐙', on: ['meHot', 'fogYou', 1], level: -0.27 },
  { icon: '✨', on: ['meN:1', 'knowHalf', 1], level: 0.01 },
  { icon: '🛡️', on: ['youArm', 'giveMe', 1], level: -0.05 },
  { icon: '😇', on: ['youVeryCold', 'giveYou', 1], level: 0.14 },
  { icon: '🦐', on: ['meCloser', 'lavaYou', 1], level: -0.11 },
  { icon: '😮', on: ['youVeryHot', 'hide', 1], level: -0.02 },
  { icon: '🫠', on: ['every:3', 'skipMe', 1], level: 0.32 },
  { icon: '🪞', on: ['meHot', 'knowParity', 1], level: -0.1 },
  { boss: true, icon: '👑', a1icon: '🌑', a1: ['meHot', 'blindYou', 1], a2icon: '🐚', a2: ['youColder', 'burn', 1], level: -0.25 },
  // 19 · Бамбуковая роща (181–190)
  { icon: '🐒', on: ['meWarm', 'steal', 1], level: -0.3 },
  { icon: '🍎', on: ['youN:3', 'giveYou', 1], level: 0.06 },
  { icon: '💃', on: ['meN:4', 'skipMe', 1], level: 0.08 },
  { icon: '🎏', on: ['every:5', 'giveYou', 1], level: 0.08 },
  { icon: '🎐', on: ['meVeryHot', 'hide', 1], level: -0.21 },
  { icon: '🍃', on: ['youN:1', 'hide', 1], level: -0.12 },
  { icon: '💡', on: ['youColder', 'tellHalf', 1], level: 0.32 },
  { icon: '🧶', on: ['youWarm', 'burn', 1], level: -0.12 },
  { icon: '🧗', pick: 'up', level: 0.21 },
  { boss: true, icon: '👑', a1icon: '🧘', a1: ['meN:2', 'knowDir', 1], a2icon: '🎍', a2: ['youWarm', 'freezeYou', 1], level: -0.14 },
  // 20 · Станция НЛО (191–200)
  { icon: '🛸', on: ['every:6', 'tellHalf', 1], level: -0.09 },
  { icon: '🎈', on: ['youN:3', 'lavaYou', 1], level: -0.33 },
  { icon: '👥', on: ['meN:4', 'again', 1], level: -0.12 },
  { icon: '🐌', on: ['youVeryCold', 'skipYou', 1], level: 0.11 },
  { icon: '💥', on: ['meCloser', 'burn', 1], level: -0.11 },
  { icon: '🎒', on: ['meN:1', 'giveMe', 1], level: -0.06 },
  { icon: '📡', on: ['every:2', 'tellDir', 1], level: 0.23 },
  { icon: '💭', on: ['meEvery:3', 'knowDir', 0], level: 0.22 },
  { icon: '🚀', on: ['youHot', 'giveMe', 1], level: 0.14 },
  { boss: true, icon: '👑', a1icon: '🌌', a1: ['every:4', 'freezeYou', 1], a2icon: '🌟', a2: ['meHot', 'again', 1], level: -0.15 },
  // 21 · Австралия (201–210)
  { icon: '🦘', on: ['youN:1', 'double', 1], level: -0.11 },
  { icon: '🐨', on: ['youWarm', 'skipMe', 1], level: 0.04 },
  { icon: '🟫', on: ['youCold', 'burn', 1], level: -0.04 },
  { icon: '📡', on: ['meN:2', 'tellDir', 1], level: 0.08 },
  { icon: '🪡', on: ['youWarm', 'giveMe', 1], level: -0.08 },
  { icon: '🗯️', on: ['every:3', 'tellDir', 1] },
  { icon: '😂', on: ['youColder', 'skipMe', 1], level: 0.22 },
  { icon: '😊', on: ['youCloser', 'giveBoth', 1], level: -0.05 },
  { icon: '🔥', on: ['meN:1', 'burn', 1], level: -0.09 },
  { boss: true, icon: '👑', a1icon: '🐊', a1: ['youHot', 'freezeYou', 1], a2icon: '☀️', a2: ['meN:3', 'giveMe', 1], level: -0.19 },
  // 22 · Цирк (211–220)
  { icon: '7️⃣', pick: 'lucky', level: -0.04 },
  { icon: '☂️', on: ['meCloser', 'knowHalf', 1], level: -0.02 },
  { icon: '🤹', on: ['every:3', 'giveMe', 1], level: -0.1 },
  { icon: '⭕', on: ['meVeryHot', 'burnMe', 1], level: 0.17 },
  { icon: '🦙', on: ['youColder', 'hide', 1], level: 0.03 },
  { icon: '🏋️', on: ['meHot', 'steal', 1], level: -0.12 },
  { icon: '🐞', on: ['every:2', 'double', 1], level: -0.14 },
  { icon: '🤸', on: ['every:4', 'tellParity', 1], level: 0.43 },
  { icon: '🎩', on: ['meWarm', 'fogYou', 1], level: -0.24 },
  { boss: true, icon: '👑', a1icon: '🎪', a1: ['every:5', 'double', 1], a2icon: '🧐', a2: ['youCloser', 'knowDir', 1], level: -0.07 },
  // 23 · Хрустальные пещеры (221–230)
  { icon: '🪨', on: ['youCold', 'giveMe', 1], level: -0.07 },
  { icon: '💗', on: ['meColder', 'giveYou', 1], level: 0.04 },
  { icon: '🔮', on: ['youN:2', 'knowHalf', 1], level: 0.11 },
  { icon: '🔦', on: ['youHot', 'tellParity', 1], level: 0.27 },
  { icon: '💧', on: ['meN:2', 'freezeYou', 1], level: -0.09 },
  { icon: '💠', on: ['youVeryHot', 'blindYou', 1], level: -0.22 },
  { icon: '🕯️', on: ['meCloser', 'knowParity', 1], level: 0.03 },
  { icon: '🦗', on: ['every:3', 'knowParity', 1], level: -0.21 },
  { icon: '⛏️', on: ['youCloser', 'tellHalf', 1], level: 0.16 },
  { boss: true, icon: '👑', a1icon: '🔷', a1: ['youN:3', 'burn', 1], a2icon: '🧊', a2: ['meCloser', 'freezeYou', 1], level: -0.05 },
  // 24 · Эпоха мамонтов (231–240)
  { icon: '❄️', on: ['youCold', 'freezeYou', 1], level: -0.16 },
  { icon: '🦷', on: ['meN:2', 'burn', 1], level: -0.27 },
  { icon: '🧣', on: ['youN:1', 'giveYou', 1], level: 0.1 },
  { icon: '🛌', on: ['youCold', 'skipMe', 1] },
  { icon: '📯', on: ['meN:3', 'tellParity', 1], level: 0.2 },
  { icon: '👀', on: ['every:3', 'hide', 1], level: -0.1 },
  { icon: '🐚', on: ['meN:3', 'giveYou', 1], level: 0.24 },
  { icon: '🤗', on: ['youColder', 'giveBoth', 1], level: 0.19 },
  { icon: '🐈', on: ['meVeryHot', 'steal', 1], level: -0.23 },
  { boss: true, icon: '👑', a1icon: '🌨️', a1: ['every:6', 'freezeYou', 1], a2icon: '🤝', a2: ['meN:2', 'giveBoth', 1], level: -0.32 },
  // 25 · Радужная страна (241–250)
  { icon: '🦄', on: ['meN:1', 'knowParity', 1], level: -0.37 },
  { icon: '☁️', on: ['meWarm', 'tellHalf', 1], level: -0.04 },
  { icon: '🌀', on: ['youN:3', 'freezeYou', 1], level: -0.27 },
  { icon: '🎨', on: ['every:7', 'giveYou', 1], level: 0.21 },
  { icon: '☯️', on: ['youN:1', 'knowHalf', 1], level: 0.14 },
  { icon: '💢', on: ['meHot', 'skipYou', 1], level: 0.1 },
  { icon: '🕺', on: ['youHot', 'tellDir', 1], level: 0.18 },
  { icon: '🌺', on: ['every:2', 'giveMe', 1], level: -0.01 },
  { icon: '✒️', on: ['meN:4', 'fogYou', 1], level: 0.08 },
  { boss: true, icon: '👑', a1icon: '🐉', a1: ['youVeryHot', 'fogYou', 1], a2icon: '🔀', a2: ['meHot', 'swapTokens', 1], level: -0.34 },
  // 26 · Болото (251–260)
  { icon: '🌾', on: ['youN:1', 'tellHalf', 1], level: 0.02 },
  { icon: '📯', on: ['every:6', 'skipYou', 1], level: -0.09 },
  { icon: '✋', on: ['youCold', 'steal', 1], level: -0.05 },
  { icon: '🐸', on: ['youCloser', 'giveYou', 1] },
  { icon: '🦟', on: ['youCloser', 'tellDir', 1], level: -0.01 },
  { icon: '🦫', on: ['meN:3', 'burn', 1], level: 0.02 },
  { icon: '🍃', on: ['youWarm', 'lavaYou', 1], level: -0.1 },
  { icon: '🪵', on: ['every:3', 'giveBoth', 1], level: -0.05 },
  { icon: '👃', on: ['meCloser', 'tellParity', 1], level: 0.22 },
  { boss: true, icon: '👑', a1icon: '🫧', a1: ['youColder', 'freezeYou', 1], a2icon: '🪷', a2: ['youN:1', 'giveMe', 1], level: -0.14 },
  // 27 · Тридевятое царство (261–270)
  { icon: '🎶', on: ['youColder', 'tellParity', 1], level: 0.04 },
  { icon: '💬', on: ['meCloser', 'tellHalf', 1], level: -0.04 },
  { icon: '🌲', on: ['meWarm', 'giveMe', 1], level: -0.07 },
  { icon: '🐉', on: ['meVeryHot', 'double', 1], level: -0.18 },
  { icon: '🏠', on: ['meEvery:2', 'hide', 0], level: -0.14 },
  { icon: '🪶', on: ['youHot', 'giveYou', 1], level: 0.16 },
  { icon: '🦅', on: ['meN:3', 'tellDir', 1], level: 0.05 },
  { icon: '🧹', on: ['youArm', 'double', 1], level: 0.02 },
  { icon: '🪄', on: ['youN:1', 'knowDir', 1], level: 0.18 },
  { boss: true, icon: '👑', a1icon: '🥶', a1: ['every:5', 'freezeYou', 1], a2icon: '⏩', a2: ['youCloser', 'double', 1], level: -0.24 },
  // 28 · Горные вершины (271–280)
  { icon: '🐂', on: ['youN:1', 'skipMe', 1], level: -0.07 },
  { icon: '😴', on: ['meHot', 'skipMe', 1], level: 0.26 },
  { icon: '🐏', on: ['every:2', 'freezeYou', 1] },
  { icon: '🎵', on: ['every:4', 'tellHalf', 1], level: 0.02 },
  { icon: '🛟', on: ['every:4', 'giveYou', 1], level: 0.1 },
  { icon: '🐭', on: ['meWarm', 'burn', 1], level: -0.22 },
  { icon: '💍', on: ['meN:1', 'steal', 1], level: -0.23 },
  { icon: '⛰️', on: ['meHot', 'lavaYou', 1], level: -0.1 },
  { icon: '🔭', on: ['meHot', 'tellParity', 1], level: 0.25 },
  { boss: true, icon: '👑', a1icon: '🐾', a1: ['youCloser', 'blindYou', 1], a2icon: '🏔️', a2: ['meWarm', 'knowDir', 1], level: -0.35 },
  // 29 · Фабрика роботов (281–290)
  { icon: '🐕', on: ['every:2', 'knowDir', 1], level: 0.09 },
  { icon: '🔌', on: ['every:2', 'burn', 1], level: -0.14 },
  { icon: '🚁', on: ['every:4', 'tellDir', 1], level: 0.14 },
  { icon: '🧲', on: ['youN:1', 'steal', 1], level: -0.14 },
  { icon: '🔋', on: ['start', 'giveMe', 1], level: 0.01 },
  { icon: '🦾', on: ['youN:2', 'freezeYou', 1], level: -0.13 },
  { icon: '🔍', on: ['meN:3', 'knowParity', 1], level: 0.11 },
  { icon: '🥫', on: ['meCloser', 'swapTokens', 1], level: 0.04 },
  { icon: '🛞', on: ['every:3', 'double', 1], level: 0.06 },
  { boss: true, icon: '👑', a1icon: '📡', a1: ['meN:2', 'fogYou', 1], a2icon: '⚙️', a2: ['meCloser', 'giveMe', 1], level: -0.41 },
  // 30 · Мир мифов (291–300)
  { icon: '🏹', on: ['meN:1', 'knowDir', 1], level: 0.1 },
  { icon: '🐶', on: ['meEvery:3', 'again', 0], level: -0.16 },
  { icon: '👁️', on: ['youCloser', 'knowHalf', 1], level: 0.23 },
  { icon: '🧜', on: ['youCold', 'fogYou', 1], level: -0.18 },
  { icon: '🐐', on: ['youN:2', 'skipYou', 1], level: 0.02 },
  { icon: '🧞', on: ['youArm', 'steal', 1], level: -0.04 },
  { icon: '🐑', on: ['every:5', 'giveMe', 1], level: 0.18 },
  { icon: '💰', on: ['every:4', 'steal', 1], level: -0.06 },
  { icon: '🦊', on: ['meWarm', 'blindYou', 1], level: -0.05 },
  { boss: true, icon: '👑', a1icon: '🧶', a1: ['youN:2', 'memoryYou', 1], a2icon: '🐮', a2: ['meN:1', 'freezeYou', 1], level: -0.23 },
  // 31 · Осенний лес (301–310)
  { icon: '🐿️', on: ['youN:3', 'giveBoth', 1], level: -0.03 },
  { icon: '🪵', on: ['every:2', 'tellHalf', 1], level: -0.06 },
  { icon: '🍁', on: ['meCloser', 'tellDir', 1] },
  { icon: '🧣', on: ['every:3', 'steal', 1], level: -0.17 },
  { icon: '🐗', on: ['meN:3', 'skipMe', 1], level: 0.1 },
  { icon: '🪶', on: ['youN:2', 'hide', 1], level: -0.13 },
  { icon: '🗯️', on: ['youCold', 'tellHalf', 1], level: 0.07 },
  { icon: '🦨', on: ['meN:3', 'skipYou', 1], level: -0.17 },
  { icon: '💤', on: ['meVeryHot', 'skipMe', 1], level: 0.41 },
  { boss: true, icon: '👑', a1icon: '🍂', a1: ['every:3', 'freezeYou', 1], a2icon: '🦌', a2: ['meWarm', 'knowHalf', 1], level: -0.1 },
  // 32 · Долина пирамид (311–320)
  { icon: '📜', on: ['meHot', 'tellHalf', 1], level: -0.01 },
  { icon: '☀️', on: ['youHot', 'lavaYou', 1], level: -0.2 },
  { icon: '✨', on: ['meN:1', 'giveYou', 1], level: 0.03 },
  { icon: '⚖️', on: ['every:4', 'swapTokens', 1], level: -0.04 },
  { icon: '👁️', on: ['every:5', 'tellDir', 1], level: 0.07 },
  { icon: '💦', on: ['youN:3', 'burnMe', 1], level: 0.21 },
  { icon: '🌊', on: ['meN:1', 'hide', 1], level: -0.11 },
  { icon: '🥚', on: ['every:6', 'giveMe', 1], level: 0.11 },
  { icon: '🌅', on: ['youColder', 'knowParity', 1], level: -0.04 },
  { boss: true, icon: '👑', a1icon: '🥵', a1: ['every:2', 'lavaYou', 1], a2icon: '🌞', a2: ['meVeryHot', 'giveMe', 1], level: -0.12 },
  // 33 · Атлантида (321–330)
  { icon: '🐬', on: ['youN:3', 'tellDir', 1], level: 0.02 },
  { icon: '⛵', on: ['every:5', 'hide', 1], level: -0.2 },
  { icon: '🐡', on: ['meWarm', 'freezeYou', 1], level: -0.03 },
  { icon: '🐚', on: ['youN:2', 'tellParity', 1], level: 0.31 },
  { icon: '🦑', on: ['meN:3', 'fogYou', 1], level: -0.29 },
  { icon: '🌀', on: ['meCloser', 'knowDir', 1], level: 0.06 },
  { icon: '🦭', on: ['every:4', 'skipMe', 1], level: 0.28 },
  { icon: '🐠', on: ['meN:2', 'steal', 1], level: -0.2 },
  { icon: '🗡️', on: ['youHot', 'knowDir', 1], level: 0.1 },
  { boss: true, icon: '👑', a1icon: '🔱', a1: ['youCloser', 'memoryYou', 1], a2icon: '🌊', a2: ['meWarm', 'skipYou', 1], level: -0.47 },
  // 34 · Страна снов (331–340)
  { icon: '🐘', on: ['youN:4', 'memoryYou', 1], level: -0.22 },
  { icon: '😴', on: ['every:6', 'skipMe', 1], level: 0.2 },
  { icon: '🌙', on: ['every:3', 'knowHalf', 1], level: 0.12 },
  { icon: '🥱', on: ['youN:1', 'freezeYou', 1], level: -0.02 },
  { icon: '☂️', on: ['youHot', 'blindYou', 1], level: -0.25 },
  { icon: '🦇', on: ['meHot', 'knowHalf', 1], level: 0.15 },
  { icon: '🕸️', on: ['youN:3', 'steal', 1], level: -0.04 },
  { icon: '🚶', on: ['youCold', 'again', 1], level: 0.13 },
  { icon: '🐈', on: ['every:4', 'lavaYou', 1], level: -0.06 },
  { boss: true, icon: '👑', a1icon: '🌌', a1: ['meN:1', 'fogYou', 1], a2icon: '⭐', a2: ['youVeryHot', 'giveMe', 1], level: -0.61 },
  // 35 · Кузница гномов (341–350)
  { icon: '🔨', on: ['meN:2', 'skipYou', 1], level: -0.11 },
  { icon: '🕯️', on: ['youColder', 'blindYou', 1], level: -0.01 },
  { icon: '⚒️', on: ['every:3', 'knowDir', 1], level: 0.2 },
  { icon: '🛒', on: ['meN:3', 'steal', 1], level: -0.09 },
  { icon: '♨️', on: ['youHot', 'fogYou', 1], level: -0.4 },
  { icon: '👃', on: ['every:4', 'knowParity', 1], level: -0.05 },
  { icon: '🍀', on: ['youN:2', 'giveMe', 1], level: 0.15 },
  { icon: '⚔️', on: ['meVeryHot', 'freezeYou', 1], level: 0.14 },
  { icon: '💥', on: ['meN:1', 'lavaYou', 1], level: 0.12 },
  { boss: true, icon: '👑', a1icon: '⛏️', a1: ['meN:2', 'memoryYou', 1], a2icon: '💎', a2: ['every:2', 'steal', 1], level: -0.58 }
];
const advHeroRules = [];
function advHeroRule(n) {
  const i = n - 50;
  return advHeroRules[i] || (advHeroRules[i] = advCompile(ADV_HEROES[i]));
}

function advChar(n) {
  const w = Math.floor(n / ADV_PER_WORLD), i = n % ADV_PER_WORLD;
  const boss = i === ADV_PER_WORLD - 1;
  const rule = n < 50 ? ADV_CAST[n] : 'h' + (n + 1);
  return { n: n, w: w, i: i, boss: boss, world: ADV_WORLDS[w], rule: rule,
           R: n < 50 ? ADV_RULES[rule] : advHeroRule(n), icon: 'adv-' + String(n + 1).padStart(2, '0') };
}

// ---------- тексты миров 6+ ----------
// Лежат отдельным файлом на язык (js/adv-ru.js …): 450 героев на четырёх
// языках раздули бы загрузку игры. Файл кладёт свои тексты в ADV_PACKS.
// Пока он не пришёл — «…», и карта перерисуется, когда придёт
const ADV_PACKS = {};
function advPack() { return ADV_PACKS[currentLang] || ADV_PACKS.en || null; }
function advWorldName(w) {
  if (w < 5) return t().adv.worlds[w];
  const P = advPack();
  return (P && P.worlds[w - 5]) || '…';
}
function advName(n) {
  if (n < 50) return t().adv.names[n];
  const P = advPack();
  return (P && P.names[n - 50]) || '…';
}
function advCast(n) {
  if (n < 50) return t().adv.cast[n] || {};
  const P = advPack();
  return (P && P.cast[n - 50]) || {};
}
const advPackWait = {};
function advLoadPack(lang) {
  lang = lang || currentLang;
  if (ADV_TOTAL <= 50 || ADV_PACKS[lang]) return Promise.resolve();
  if (advPackWait[lang]) return advPackWait[lang];
  return (advPackWait[lang] = new Promise(done => {
    const s = document.createElement('script');
    s.src = 'js/adv-' + lang + '.js';
    // Без сети и без копии — не беда: попробуем в следующий раз
    s.onload = s.onerror = () => { delete advPackWait[lang]; done(); };
    document.head.appendChild(s);
  }));
}

// Сила соперника растёт от мира к миру и чуть-чуть внутри мира. От
// сложности не зависит: соперник — один и тот же характер, сложность меняет
// только, у кого сколько «⚡ +1 ход» (см. advTokens)
// Соперники умнее тратят «⚡ +1 ход» и не делают глупых ходов — «голову» чуть
// убавили, чтобы доля побед осталась прежней (подобрано симуляцией). С шестого
// мира — поправка мира, а у героя — своя (level в ADV_HEROES): правило, что
// помогает вам, — соперник умнее, и наоборот. Цель «среднего игрока» на
// «Нормально» — в первом мире волны около 57% побед, к пятому — около 33%
const ADV_BRAIN_SHIFT = [-0.03, -0.04, -0.1, -0.11, 0, 0.2, -0.04, -0.06, -0.07, -0.06, 0.06, -0.01, -0.03, -0.18, -0.17, 0.02, -0.01, -0.08, -0.07, -0.12, 0.08, -0.02, -0.08, -0.02, -0.1, 0.06, -0.02, 0.05, -0.17, -0.13, 0.08, -0.01, 0.02, 0.02, -0.12];
// С шестого мира — волны по пять миров: внутри волны сильнее, первый мир
// волны — передышка, от волны к волне чуть сильнее
function advWaveBase(w) {
  const wave = Math.floor(w / 5), pos = w % 5;
  return Math.min(0.9, 0.17 + 0.03 * wave + 0.14 * pos);
}
function advLevel(c) {
  if (c.R.levelSet) return c.R.levelSet;
  const base = c.w < 5 ? 0.08 + c.w * 0.18 : advWaveBase(c.w);
  const L = base + c.i * 0.012 + (c.boss ? 0.06 : 0) + (c.R.level || 0) + (ADV_BRAIN_SHIFT[c.w] || 0);
  return Math.max(0.02, Math.min(0.98, L));
}
function advThink(c) {
  return c.R.think || [1.2, 2.8];
}

// Сложность — это «⚡ +1 ход» (два хода подряд) на раунд: [у игрока, у соперника].
// Легко — оба у игрока, трудно — оба у соперника. Правило соперника может
// добавить: Белка Жёлудь берёт себе на один больше, Зелёныш дарит один игроку
const ADV_DIFF_TOKENS = { easy: [2, 0], normal: [1, 1], hard: [0, 2] };
function advTokens(c, diff) {
  const t = (ADV_DIFF_TOKENS[diff] || ADV_DIFF_TOKENS.normal).slice();
  const add = (c && c.R && c.R.tokens) || [0, 0];
  return [t[0] + add[0], t[1] + add[1]];
}

// ---------- правило в партии ----------
// Состояние правила на раунд: что уже сработало, что запланировано
function advRoundState() {
  if (!vsBot || !vsBot.adv) return null;
  if (!vsBot.advRound || vsBot.advRound.round !== D.round) {
    vsBot.advRound = { round: D.round, once: {}, fired: {}, queue: null };
  }
  return vsBot.advRound;
}

// Что правилу можно делать. Всё — через состояние дуэли D, как у бонусов
function advCtx() {
  const round = advRoundState();
  if (!round) return null;
  const c = vsBot.adv;
  const R = {
    c: c, rule: c.R, round: round,
    tier: m => (m && m.meta ? m.meta.labelIndex : 0),
    count: p => history.filter(h => h.p === p && !h.timeout).length,
    once: key => (round.once[key] ? false : (round.once[key] = true)),
    named: v => history.some(h => h.guess === v),
    left: cand => { let k = 0; for (let i = 0; i < cand.length; i++) k += cand[i]; return k; },
    nearBot: (x, d) => history.some(h => h.p === 1 && h.guess !== x && Math.abs(h.guess - x) <= d),
    bonusIn: cand => { const b = D.bonuses.find(b => !b.taken && cand[b.value - RANGE_MIN] && !R.named(b.value)); return b ? b.value : null; },
    give: (p, k) => { D.tokens[p] = Math.min(9, D.tokens[p] + k); },
    take: (p, k) => { D.tokens[p] = Math.max(0, D.tokens[p] - k); },
    // Помеха на игрока проходит через щит и зеркало: зеркало отправляет её
    // сопернику, щит просто отбивает. Что именно сработало — помним до fire
    guard: (p, go) => {
      if (p !== 0) return go(p);
      if (D.mirror && D.mirror[0]) { D.mirror[0] = false; round.guarded = 'mirrorRule'; return go(1); }
      if (D.shield && D.shield[0]) { D.shield[0] = false; round.guarded = 'shieldRule'; return; }
      go(0);
    },
    skip: (p, freeze) => R.guard(p, q => { D.skip[q] = true; if (freeze) D.frozen[q] = true; }),
    fog: p => R.guard(p, q => { if (!D.fog[q]) { D.fog[q] = true; D.fogFrom[q] = 0; } }),
    blind: p => R.guard(p, q => { if (!D.blind[q]) { D.blind[q] = true; D.blindFrom[q] = 0; } }),
    memory: p => R.guard(p, q => { D.shortMemory[q] = true; }),
    lava: p => R.guard(p, q => { D.autoLava[q] = true; }),
    again: () => { D.extraTurn = true; },
    hide: m => { m.ruleHidden = true; },
    dir: x => (secret > x ? 'gt' : 'lt'),
    know: (p, key, x) => {
      const k = D.know[p];
      if (key === 'parity') k.parity = Math.abs(secret) % 2;
      if (key === 'half') k.half = secret <= halfMark() ? 'low' : 'high';
      if (key === 'gt') k.gt = k.gt === undefined ? x : Math.max(k.gt, x);
      if (key === 'lt') k.lt = k.lt === undefined ? x : Math.min(k.lt, x);
    },
    // Слово для реплики: «чётное», «больше 23», «не больше 50»
    word: (key, x) => {
      const W = t().adv.kw;
      if (key === 'parity') return Math.abs(secret) % 2 === 0 ? W.even : W.odd;
      if (key === 'half') return (secret <= halfMark() ? W.low : W.high).replace('{m}', formatNum(halfMark()));
      return W[key].replace('{n}', formatNum(x));
    },
    // Правило сработало: в первый раз за раунд — большой карточкой посреди
    // экрана, дальше — репликой в пузыре. В начале раунда — в очередь: экран
    // партии ещё не открыт
    fire: (kind, vars) => {
      // Помеху отбил щит или отразило зеркало: вместо реплики правила —
      // вспышка щита или зеркала с названием правила
      if (round.guarded) return advGuarded(c, kind);
      const text = advLine(c.n, kind, vars);
      if (!text) return;
      round.firedNow = true;
      const big = !round.fired[kind];
      round.fired[kind] = true;
      if (round.queue) { round.queue.push([kind, text, big]); return; }
      advShowFire(kind, text, big);
    }
  };
  return R;
}

// Щит или зеркало встретили правило соперника. Вспышку покажет движок
// (checkBonusFx): как у бонуса, только с названием правила
function advGuarded(c, kind) {
  const round = advRoundState();
  if (!round || !round.guarded) return;
  D.lastBonus = round.guarded;
  D.lastBonusBy = 0;
  // Тексты героев с шестого мира грузятся отдельно: пока их нет — имя героя
  D.shieldedText = advFireTitle(c.n, kind || 'rule') || advName(c.n);
  round.guarded = null;
  round.firedNow = true;
}

// Реплика соперника: hi, rule, a1, a2, luck, worry, win, lose
function advLine(n, kind, vars) {
  const cast = advCast(n);
  let text = cast[kind] || '';
  if (vars) Object.keys(vars).forEach(k => { text = text.split('{' + k + '}').join(vars[k]); });
  return text;
}
// Название сработавшего: правило — его имя, способность босса — её имя
function advFireTitle(n, kind) {
  const cast = advCast(n);
  return kind === 'a1' ? cast.a1t : kind === 'a2' ? cast.a2t : cast.t;
}
function advShowFire(kind, text, big) {
  const c = vsBot && vsBot.adv;
  if (!c) return;
  if (big && typeof showRuleFlash === 'function') {
    const icon = kind === 'a1' ? c.R.a1icon : kind === 'a2' ? c.R.a2icon : c.R.icon;
    showRuleFlash(c, icon + ' ' + (advFireTitle(c.n, kind) || ''), text);
  } else if (typeof botSayText === 'function') botSayText(text);
}
function advSay(kind) {
  if (!vsBot || !vsBot.adv) return;
  const text = advLine(vsBot.adv.n, kind);
  if (text && typeof botSayText === 'function') botSayText(text);
}

// Крючки для движка дуэли (game.js)
function advRoundStart() {
  const R = advCtx();
  if (!R) return;
  R.round.queue = [];
  if (R.rule.first || R.c.world.rule === 'first') { D.starter = 1; D.cur = 1; }
  if (R.rule.start) R.rule.start(R);
  if (R.round.guarded) advGuarded(R.c, 'rule');
  const queue = R.round.queue;
  R.round.queue = null;
  // Экран партии откроется чуть позже: реплики — после него. В первом раунде
  // сначала «привет», потом правило
  const hi = D.round === 1;
  // Пока ждали, бой могли бросить или раунд мог кончиться — тогда молчим
  const alive = () => vsBot && vsBot.adv === R.c && D.round === R.round.round;
  setTimeout(() => {
    if (!alive()) return;
    if (hi) advSay('hi');
    // Вспышки по очереди — каждая успевает показаться целиком
    queue.forEach(([kind, text, big], i) => setTimeout(() => { if (alive()) advShowFire(kind, text, big); },
                                                       (hi ? 1600 : 0) + i * (BONUS_FX_MS + 200)));
  }, 650);
}
function advAfterMove(m) {
  const R = advCtx();
  // Победный ход закрывает раунд: правило молчит, слово — за репликой
  // «выиграл/проиграл» (иначе Мишка Медок, выиграв, говорил бы про сон)
  if (!R || D.roundOver) return;
  R.round.firedNow = false;
  if (R.rule.after) R.rule.after(R, m);
  if (R.round.guarded) advGuarded(R.c, 'rule');
  if (R.round.firedNow) return;
  // Без правила — реплика на удачный ход: свой или ваш, раз за раунд
  if (m.p === 1 && advVeryHot(R, m) && R.once('luck')) advSay('luck');
  else if (m.p === 0 && advVeryHot(R, m) && R.once('worry')) advSay('worry');
}
// Взвели «⚡ +1 ход». true — взвод перехвачен правилом (Кракен)
function advArm(p) {
  const R = advCtx();
  return !!(R && R.rule.arm && R.rule.arm(R, p));
}
function advBotTurn() {
  const R = advCtx();
  if (R && R.rule.turn) R.rule.turn(R);
}
function advPick(cand, plan) {
  const R = advCtx();
  if (!R || !R.rule.pick) return null;
  const v = R.rule.pick(R, cand, plan);
  return (typeof v === 'number' && v >= RANGE_MIN && v <= RANGE_MAX) ? v : null;
}
// Помеха на соперника не действует (Черепаха): сказать об этом
function advImmune(type) {
  const R = advCtx();
  if (!R || !R.rule.immune || R.rule.immune.indexOf(type) < 0) return false;
  R.fire('rule');
  return true;
}
// Итог: раунд или вся партия
function advRoundEndLine() {
  if (!vsBot || !vsBot.adv) return;
  const botWon = D.roundWinner === 1;
  advSay(D.matchOver ? (botWon ? 'win' : 'lose') : (botWon ? 'luck' : 'worry'));
}

// Цифра загаданного в бою с боссом — с шестого мира, через мир: десятков или
// последняя
function advBossDigit(c) {
  return c.boss && c.w >= 5 ? (c.w % 2 ? 'units' : 'tens') : null;
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
  // Выбрали в карточке соперника — там же сразу видно, что изменилось
  if (advCardFor !== null && !document.getElementById('advCard').classList.contains('hidden')) renderAdvCardDiff(advCardFor);
}

// Кнопки сложности: название и сколько звёзд за победу. Одни и те же — на карте
// и в карточке соперника
function advDiffButtons(box) {
  const A = t().adv, diff = advDiff();
  box.replaceChildren(...ADV_DIFFS.map((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ad-btn' + (d === diff ? ' on' : '');
    b.dataset.diff = d;
    b.innerHTML = escapeHtml(A.diff[i]) + '<small class="ad-stars">' + '★'.repeat(i + 1) + '</small>';
    b.onclick = () => setAdvDiff(d);
    return b;
  }));
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
    return /^[0-3]{0,500}$/.test(v) ? v : '';
  } catch (e) { return ''; }
}
function advStarAt(n) { return +(advStars()[n] || 0); }
// Слить со звёздами из базы: на каждом месте — лучшее
function advMergeStars(other) {
  if (typeof other !== 'string' || !/^[0-3]{0,500}$/.test(other)) return;
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
// Мир открыт: побеждён босс прошлого мира, а с шестого мира — ещё и
// ADV_GATE_STARS звёзд в прошлом мире. Начатый мир уже не закрывается
function advWorldOpen(w) {
  if (w <= 0) return true;
  const done = advDone();
  if (done < w * ADV_PER_WORLD) return false;
  if (w < ADV_GATE_FROM || done > w * ADV_PER_WORLD) return true;
  return advWorldStars(w - 1) >= ADV_GATE_STARS;
}
function advOpenN(n) { return n >= 0 && n < ADV_TOTAL && n <= advDone() && advWorldOpen(Math.floor(n / ADV_PER_WORLD)); }
// Мир, где вы сейчас: в нём следующий соперник. Если следующий мир ещё
// закрыт звёздами — прошлый, где их добирать
function advCurrentWorld() {
  const w = Math.min(ADV_WORLDS.length - 1, Math.floor(advDone() / ADV_PER_WORLD));
  return advWorldOpen(w) ? w : Math.max(0, w - 1);
}
// Почему мир закрыт: нужен босс прошлого мира или звёзды в нём
function advGateText(w) {
  const A = t().adv;
  if (advDone() < w * ADV_PER_WORLD) return A.gateBoss.replace('{w}', advWorldName(w - 1));
  return A.gateStars.replace('{m}', ADV_GATE_STARS).replace('{w}', advWorldName(w - 1)).replace('{n}', advWorldStars(w - 1));
}

// Иконки соперников — в кружок, когда весь их мир пройден на ★★★. Копия
// списка — в базе (adventure_char_icons)
const ADV_CHAR_ICONS = Array.from({ length: ADV_TOTAL }, (_, i) => 'adv-' + String(i + 1).padStart(2, '0'));
// Для выбора в профиле: портрет босса нового мира — иконка за босса (ADV_ICONS),
// второй раз среди соперников он не нужен. Иконки за боссов — только готовых миров
const ADV_PICK_CHARS = ADV_CHAR_ICONS.filter(icon => ADV_ICONS.indexOf(icon) < 0);
const ADV_PICK_BOSSES = ADV_ICONS.slice(0, ADV_WORLDS.length);
function advCharOpenCount() { return ADV_PICK_CHARS.filter(advCharIconOpen).length; }
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
  advOpenWorlds = null;
  renderAdventure(true);
  // Тексты миров 6+ — своим файлом: пришёл — перерисовать имена
  if (!ADV_PACKS[currentLang]) advLoadPack().then(() => { if (screen === 'adventure') renderAdventure(); });
  // Карту перерисовываем, только если база что-то поменяла
  const was = advDone() + '|' + advStars();
  advSync().then(() => { if (screen === 'adventure' && advDone() + '|' + advStars() !== was) renderAdventure(); });
}

// Какие миры раскрыты на карте: сначала — тот, где вы сейчас. Остальные —
// одной строкой, раскрываются нажатием: 50 миров с картинками сразу — долгая
// карта и заметная пауза на слабом телефоне
let advOpenWorlds = null;
function advToggleWorld(w) {
  if (advOpenWorlds.has(w)) advOpenWorlds.delete(w); else advOpenWorlds.add(w);
  renderAdventure();
}

function renderAdventure(scroll) {
  const A = t().adv;
  document.getElementById('tAdvTitle').innerHTML = artSpan('icons/m-adventure.webp', '🗺️') + ' ' + escapeHtml(A.title);
  document.getElementById('tAdvHint').textContent = A.hint;
  const diff = advDiff();
  advDiffButtons(document.getElementById('advDiff'));
  // Что значит сложность — прямо под кнопками: у кого сколько «⚡ +1 ход»
  document.getElementById('advDiffHint').textContent = A.diffHint[ADV_DIFFS.indexOf(diff)] + ' · ' +
    A.winStars.replace('{s}', '★'.repeat(advDiffStars(diff)));
  advFillStars();
  document.getElementById('advStarsTotal').innerHTML = '<b>⭐ ' + advStarTotal() + '</b><span> / ' + ADV_TOTAL * 3 + '</span>' +
    '<small>' + escapeHtml(A.starsHint) + '</small>';

  const done = advDone(), cur = advCurrentWorld();
  if (!advOpenWorlds) advOpenWorlds = new Set([cur]);
  const worlds = ADV_WORLDS.map((W, w) => {
    const open = advWorldOpen(w), shown = advOpenWorlds.has(w);
    const sec = document.createElement('section');
    sec.className = 'adv-world' + (open ? '' : ' locked') + (shown ? ' shown' : '');
    sec.dataset.w = w;
    sec.style.setProperty('--wc', W.color);
    const beaten = Math.max(0, Math.min(ADV_PER_WORLD, done - w * ADV_PER_WORLD));
    // Строка мира — кнопка: раскрыть и свернуть
    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'aw-head';
    head.setAttribute('aria-expanded', shown ? 'true' : 'false');
    head.onclick = () => advToggleWorld(w);
    // Имя сверху, счёт под ним: длинное имя не рвёт счёт на куски. У закрытого
    // мира счёта нет (там всегда 0) — что его откроет, сказано строкой ниже
    // Рядом с именем — бонус мира и значок правила: видно, чего ждать, ещё до боя
    const rule = W.rule && A.worldRules[W.rule];
    head.innerHTML = '<span class="aw-title"><span class="aw-top"><span class="aw-name">' + escapeHtml(advWorldName(w)) + '</span>' +
      '<span class="aw-tags">' + bonusArtHtml(W.bonus, BONUS_ICON[W.bonus]) + (rule ? rule[0] : '') + '</span></span>' +
      (open ? '<span class="aw-count">' + A.progress.replace('{n}', beaten) +
        ' · <span class="aw-stars">⭐ ' + advWorldStars(w) + '/' + ADV_PER_WORLD * 3 + '</span></span>' : '') + '</span>' +
      '<span class="aw-reward' + (advWorldDone(w) ? ' got' : '') + '" title="' + escapeHtml(A.reward) + '">' +
      (iconArt(W.boss, 0) || W.boss) + '</span>' +
      '<span class="aw-fold">' + (shown ? '▾' : '▸') + '</span>';
    sec.appendChild(head);
    // Закрытый мир — почему: босс прошлого мира или звёзды в нём
    if (!open) {
      const gate = document.createElement('div');
      gate.className = 'aw-gate';
      gate.textContent = advGateText(w);
      sec.appendChild(gate);
    }
    if (!shown) return sec;
    const grid = document.createElement('div');
    grid.className = 'aw-grid';
    for (let i = 0; i < ADV_PER_WORLD; i++) {
      const n = w * ADV_PER_WORLD + i;
      const c = advChar(n);
      const b = document.createElement('button');
      const state = n < done ? 'done' : n === done && open ? 'next' : 'locked';
      b.className = 'adv-tile ' + state + (c.boss ? ' boss' : '');
      b.dataset.n = n;
      const st = advStarAt(n);
      b.innerHTML = iconArt(c.icon, 0) + '<span class="at-quirk">' + c.R.icon + '</span>' +
        (state === 'done' ? '<span class="at-stars s' + st + '">' + advStarRow(st) + '</span>'
          : state === 'locked' ? '<span class="at-mark">🔒</span>' : '');
      b.setAttribute('aria-label', advName(n));
      b.onclick = () => openAdvCard(n);
      grid.appendChild(b);
    }
    // Цель мира: ★★★ у всех — их иконки в профиль. У закрытого мира не видна
    const goal = document.createElement('div');
    goal.className = 'aw-goal' + (advWorldGold(w) ? ' got' : '') + (open ? '' : ' hidden');
    goal.textContent = advWorldGold(w) ? A.goldDone : A.goldGoal.replace('{n}', advWorldThree(w));
    sec.append(grid, goal);
    return sec;
  });
  // Миры выходят партиями: сколько ещё впереди
  if (ADV_WORLDS.length < ADV_WORLD_MAX) {
    const soon = document.createElement('div');
    soon.className = 'adv-soon';
    soon.textContent = A.soon.replace('{n}', ADV_WORLD_MAX - ADV_WORLDS.length);
    worlds.push(soon);
  }
  document.getElementById('advMap').replaceChildren(...worlds);
  if (!scroll) return;
  const next = document.querySelector('#advMap .adv-tile.next') || document.querySelector('#advMap .adv-world.shown');
  if (next && next.scrollIntoView && done > 0) next.scrollIntoView({ block: 'center' });
}

// Сложность в карточке: кнопки и у кого сколько «⚡ +1 ход» с этим соперником —
// выбирают прямо перед боем и видят, что меняется
let advCardFor = null;
function renderAdvCardDiff(n) {
  const A = t().adv, c = advChar(n), diff = advDiff();
  advDiffButtons(document.getElementById('acDiff'));
  const [mine, theirs] = advTokens(c, diff);
  document.getElementById('acTokens').innerHTML =
    '<span class="act-row"><span class="act-side"><b>' + escapeHtml(A.tokYou) + '</b><span class="act-n">' + advTokenIcons(mine) + '</span></span>' +
    '<span class="act-side"><b>' + escapeHtml(A.tokThem) + '</b><span class="act-n">' + advTokenIcons(theirs) + '</span></span></span>' +
    '<small>' + escapeHtml(A.tokWhat) + ' · ' + escapeHtml(A.winStars.replace('{s}', '★'.repeat(advDiffStars(diff)))) + '</small>';
}
// «⚡⚡» — столько, сколько есть; ни одного — «—»
function advTokenIcons(k) {
  return k > 0 ? '⚡'.repeat(k) : '<span class="act-none">—</span>';
}

// Карточка соперника: кто, в каком мире, чем опасен, на каких числах
function openAdvCard(n) {
  advCardFor = n;
  const A = t().adv, L = t();
  const c = advChar(n), done = advDone();
  const face = document.getElementById('acFace');
  face.innerHTML = iconArt(c.icon, 0);
  face.style.background = c.world.color;
  document.querySelector('#advCard .adv-card').style.setProperty('--wc', c.world.color);
  document.getElementById('acWorld').textContent = advWorldName(c.w) + ' · ' + (c.i + 1) + '/' + ADV_PER_WORLD;
  document.getElementById('acName').textContent = advName(n);
  const cast = advCast(n);
  document.getElementById('acQuirk').innerHTML = c.boss
    ? '<b>👑 ' + escapeHtml(A.bossTitle) + '</b><span>' + escapeHtml(A.bossNote) + '</span>' +
      '<span class="ac-ab"><b>' + c.R.a1icon + ' ' + escapeHtml(cast.a1t) + '</b>' + escapeHtml(cast.a1d) + '</span>' +
      '<span class="ac-ab"><b>' + c.R.a2icon + ' ' + escapeHtml(cast.a2t) + '</b>' + escapeHtml(cast.a2d) + '</span>'
    : '<b>' + c.R.icon + ' ' + escapeHtml(cast.t) + '</b><span>' + escapeHtml(cast.d) + '</span>';
  const half = Math.floor(c.world.range / 2);
  const range = (c.R.frost || c.world.frost) ? L.placeholderTpl.replace('{a}', formatNum(-half)).replace('{b}', formatNum(half))
    : L.placeholderTpl.replace('{a}', '1').replace('{b}', formatNum(c.world.range));
  const best = advStarAt(n);
  // Бонус мира, у босса с шестого мира — ещё цифра загаданного; ниже — правило мира
  const bk = c.world.bonus, digit = advBossDigit(c), rule = c.world.rule && A.worldRules[c.world.rule];
  const bonusOf = k => '<b>' + bonusArtHtml(k, BONUS_ICON[k]) + ' ' + escapeHtml(L.bonusNames[k]) + '</b>';
  document.getElementById('acFacts').innerHTML =
    '<span>' + escapeHtml(A.range) + ': <b>' + range + '</b></span>' +
    '<span>' + escapeHtml(A.wins) + ' <b>' + (c.boss ? 2 : 1) + '</b></span>' +
    '<span class="ac-best">' + escapeHtml(A.best) + ': <b class="s' + best + '">' + advStarRow(best) + '</b></span>' +
    '<button type="button" class="ac-bonus" onclick="openBonusGuide(\'' + bk + '\')">' + escapeHtml(A.worldBonus) + ': ' +
      bonusOf(bk) + (digit ? ', ' + escapeHtml(A.bossBonus).replace('{b}', bonusOf(digit)) : '') +
      (c.boss || c.R.bonus === 'magic' || c.world.rule === 'traps' ? ' · ' + escapeHtml(A.traps) : '') + '</button>' +
    (rule ? '<span class="ac-rule">' + escapeHtml(A.ruleLabel) + ': <b>' + rule[0] + ' ' + escapeHtml(rule[1]) + '</b> — ' +
      escapeHtml(rule[2]) + '</span>' : '') +
    '<span class="ac-gold">' + escapeHtml(advWorldGold(c.w) ? A.goldDone : A.cardGold.replace('{n}', advWorldThree(c.w))) + '</span>';
  const go = document.getElementById('acGo');
  // Закрыт: не обыгран прошлый соперник — или мир ждёт звёзд в прошлом мире
  const open = advOpenN(n);
  go.textContent = open ? A.fight : n <= done ? advGateText(c.w) : A.locked;
  go.disabled = !open;
  go.onclick = () => startAdventure(n);
  document.getElementById('acBack').textContent = L.back;
  // Сложность — только у открытого: закрытого всё равно не сыграть
  document.getElementById('acDiffBox').classList.toggle('hidden', !open);
  if (open) renderAdvCardDiff(n);
  document.getElementById('advCard').classList.remove('hidden');
  // Новая карточка — с начала, а не с того места, где листали прошлую
  document.getElementById('acBody').scrollTop = 0;
}
function closeAdvCard() {
  advCardFor = null;
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
  frostMode = !!(c.R.frost || c.world.frost);
  bonusCountChoice = 0;
  applyBounds(c.world.range);
  applyRangeToInputs();
  // Бонусы — у всех: бонус мира ложится всегда, ловушки — у босса и у
  // Осьминога Жонглёра (у него бонусов вдвое больше). У Ящера Рыцаря — втрое
  // больше, и только полезные. С шестого мира у босса ещё и цифра загаданного
  // (десятков или последняя — через мир), она тоже ложится всегда. Правило
  // мира: «буря» — бонусов вдвое больше, «ловушки» — ловушки в каждом бою
  const magic = c.R.bonus === 'magic', knight = c.R.bonus === 'knight';
  const allGood = ['xray', 'half', 'shield', 'freeze'].filter(k => k !== c.world.bonus);
  const digit = advBossDigit(c);
  const mult = (magic ? 2 : knight ? 3 : 1) * (c.world.rule === 'storm' ? 2 : 1);
  bonusMode = true;
  bonusSet = {
    first: digit ? 2 : 1,
    good: [c.world.bonus].concat(digit ? [digit] : [], ['extra', 'fog', 'blind'], magic || knight ? allGood : []),
    trap: (c.boss || magic || c.world.rule === 'traps') ? BONUS_TRAP : [],
    count: mult > 1 ? mult * autoBonusCountFor(rangeCount()) : 0
  };
  vsBot = { adv: c, diff: diff, bot: { key: c.icon, icon: c.icon, color: c.world.color, level: advLevel(c),
                           think: advThink(c), greet: 'luck', react: 'nice' } };
  D.names[0] = myName() || L.you;
  D.names[1] = advName(n);
  D.winsNeeded = c.boss ? 2 : 1;
  // «⚡ +1 ход» раздаёт сложность (advTokens) в начале каждого раунда, а не фора
  D.handicap = 0;
  D.wins = [0, 0];
  D.round = 1;
  D.matchOver = false;
  D.starter = (c.R.first || c.world.rule === 'first') ? 1 : 0;
  startRound();
  applyTranslations();
  showScreen('game');
  // «Привет» и правило соперник говорит сам — из advRoundStart
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
      parts.push(escapeHtml(A.worldDone.replace('{w}', advWorldName(c.w))) + ' ' + (iconArt(c.world.boss, 22) || ''));
    }
    // Следующий мир ждёт звёзд в этом — сказать сразу, сколько не хватает
    if (c.n + 1 < ADV_TOTAL && !advOpenN(c.n + 1) && c.n + 1 <= advDone()) parts.push(escapeHtml(advGateText(c.w + 1)));
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
  if (advWon() && advOpenN(c.n + 1)) {
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
