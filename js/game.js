// Сама игра без сети: пояса «горячо/холодно», настройка, одиночная игра, дуэль,
// бонусы, прямая, разбор партии, бот, лиги (что показывать), звук.
// Все файлы — обычные скрипты с общими именами: функция из одного видна в другом.
// Порядок подключения важен только для кода, который выполняется при загрузке.


// Восемь цветов шкалы — фиксированы, не зависят от диапазона (это исходная,
// одобренная палитра). Меняются только числовые границы каждого пояса.
const TIER_COLORS = [
  { color: "#93C5FD", bg: "rgba(147, 197, 253, 0.15)" }, // очень холодно
  { color: "#38BDF8", bg: "rgba(56, 189, 248, 0.15)" },  // холодно
  { color: "#2DD4BF", bg: "rgba(45, 212, 191, 0.15)" },  // прохладно
  { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.15)" },  // тепло
  { color: "#FB923C", bg: "rgba(251, 146, 60, 0.15)" },  // жарко
  { color: "#F87171", bg: "rgba(248, 113, 113, 0.15)" }, // очень горячо
  { color: "#FF5733", bg: "rgba(255, 87, 51, 0.18)" },   // очень-очень горячо
  { color: "#FF4500", bg: "rgba(255, 69, 0, 0.2)" },     // лава
];
const BULLSEYE_TIER = { color: "#4ADE80", bg: "rgba(74, 222, 128, 0.15)" };

// Верхние границы 8 поясов (от самого холодного к самому горячему) для
// каждого диапазона. 1000 — эталон, остальные — та же логарифмическая форма,
// пересчитанная под свой диапазон (см. ответ в чате).
const RANGE_TIER_UPPER = {
  10:      [9, 7, 6, 5, 4, 3, 2, 1],
  100:     [100, 60, 30, 15, 8, 4, 2, 1],
  1000:    [1000, 500, 200, 100, 50, 20, 10, 3],
};
// Между десяткой и сотней (и дальше) шаг был слишком большим: двадцать и
// двести дают промежуточную ступень, которой не хватало младшим
const RANGE_PRESETS = [10, 20, 100, 200, 1000, 2000];

// Горячий конец шкалы не растёт вместе с диапазоном: жарко/горячо/очень горячо/лава
// всегда означают одни и те же расстояния. Именно по горячим поясам игрок и вычисляет
// число в конце — если бы они росли пропорционально, «лава» на диапазоне в 10 000
// значила бы «где-то в пределах 40», и добить раунд стало бы невозможно.
// Значения взяты из ручной таблицы для 1000 — то есть шкала ведёт себя так же, как там.
const HOT_TIER_UPPER = [50, 20, 10, 3];

// Границы поясов округляем: «51–100» читается и запоминается легче, чем «51–106»,
// а ученику ещё и считать по ним. Шаг растёт вместе с величиной, чтобы округление
// не перекосило сам пояс: у сотни это десятки, у тысячи — полсотни
function tierStep(v) {
  return v < 12 ? 1 : v < 30 ? 5 : v < 100 ? 10 : v < 300 ? 25 : v < 1000 ? 50 : v < 3000 ? 100 : 500;
}

// Верхнюю границу самого холодного пояса округляем вверх: она должна накрывать
// и наибольшее возможное расстояние, иначе подпись начнёт врать
function roundTier(v, up) {
  const step = tierStep(v);
  return Math.max(1, (up ? Math.ceil(v / step) : Math.round(v / step)) * step);
}

// Для произвольного диапазона (режим на рейтинг) готовой таблицы поясов нет — считаем её.
function generateTierUpper(rangeMax) {
  const maxDistance = Math.max(1, rangeMax - 1);

  // Тесный диапазон: горячие пояса в него просто не помещаются, раскладываем
  // логарифмически по всей ширине. Для 10 это даёт ровно ручную таблицу.
  if (maxDistance <= HOT_TIER_UPPER[0]) {
    const U = [];
    for (let i = 0; i < 8; i++) {
      U.push(Math.max(roundTier(maxDistance * Math.pow(0.45, i), i === 0), 8 - i));
    }
    for (let i = 1; i < 8; i++) {
      if (U[i] >= U[i - 1]) U[i] = Math.max(1, U[i - 1] - 1);
    }
    return U;
  }

  // Широкий диапазон: холодные четыре пояса растягиваются от края диапазона
  // до начала горячей зоны, горячие четыре — фиксированы.
  const ratio = Math.pow(HOT_TIER_UPPER[0] / maxDistance, 1 / 4);
  const U = [];
  for (let i = 0; i < 4; i++) U.push(roundTier(maxDistance * Math.pow(ratio, i), i === 0));
  HOT_TIER_UPPER.forEach(v => U.push(v));
  for (let i = 1; i < 8; i++) {
    if (U[i] >= U[i - 1]) U[i] = Math.max(1, U[i - 1] - 1);
  }
  return U;
}

function buildFeedbackMeta(rangeMax) {
  const U = RANGE_TIER_UPPER[rangeMax] || generateTierUpper(rangeMax);
  const meta = [];
  for (let i = 0; i < 8; i++) {
    const max = U[i];
    const min = (i === 7) ? 1 : U[i + 1] + 1;
    meta.push({
      min, max, labelIndex: i,
      color: TIER_COLORS[i].color, bg: TIER_COLORS[i].bg,
      rangeSign: (min === max) ? String(min) : (min + '–' + max)
    });
  }
  meta.push({ min: 0, max: 0, labelIndex: 8, rangeSign: "0",
              color: BULLSEYE_TIER.color, bg: BULLSEYE_TIER.bg });
  return meta;
}

function minAttempts(rangeMax) {
  return Math.max(1, Math.ceil(Math.log2(rangeMax)));
}

// Русский требует трёх форм («1 очко», «2 очка», «5 очков»), остальным хватает двух.
// Форму выбираем по числу, иначе на экране появляется «133 очков»
function plural(n, forms) {
  // Во французском единственное число берут и ноль, и единица, в остальных — только единица
  const one = (currentLang === 'fr') ? Math.abs(n) < 2 : Math.abs(n) === 1;
  if (currentLang !== 'ru') return forms[one ? 0 : 1];
  const rest100 = Math.abs(n) % 100, rest10 = rest100 % 10;
  if (rest100 > 10 && rest100 < 20) return forms[2];
  if (rest10 === 1) return forms[0];
  if (rest10 > 1 && rest10 < 5) return forms[1];
  return forms[2];
}

function withPlural(n, forms) { return formatNum(n) + ' ' + plural(n, forms); }

function formatNum(n) {
  try { return n.toLocaleString(currentLang === 'en' ? 'en-US' : currentLang); }
  catch (e) { return String(n); }
}

let RANGE_MAX = 1000;
// Нижняя граница. В обычной игре это 1, в «морозе и жаре» — зеркало верхней.
// Дальше всё считается от пары границ, поэтому минус не плодит отдельных веток
let RANGE_MIN = 1;
let MAX_GUESSES = 10;
let FEEDBACK_META = buildFeedbackMeta(RANGE_MAX);

// «Мороз и жара»: число берётся из −N…+N. Половину берём от выбранного
// диапазона, чтобы чисел осталось столько же и игра не стала длиннее
let frostMode = localStorage.getItem('hc_frost') === '1';

// Градусник и числовая прямая показываются по умолчанию; кому тесно на экране —
// может убрать любую из них, и выбор запомнится
// Пояс расстояний рядом с подсказкой. Включён по умолчанию и снимается кнопкой
// прямо во время игры — как градусник и прямая. Тайны в нём нет: те же числа
// написаны в шкале расстояний внизу экрана, она открыта во всех режимах
let distanceHint = localStorage.getItem('hc_hint') !== '0';

let showThermo = localStorage.getItem('hc_show_thermo') !== '0';
let showLine = localStorage.getItem('hc_show_line') !== '0';

function renderVizToggles() {
  const L = t();
  [['toggleThermoBtn', showThermo, L.vizThermo], ['toggleLineBtn', showLine, L.vizLine],
   ['toggleHintBtn', distanceHint, L.hintLabel]]
    .forEach(([id, on, title]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('on', on);
      el.title = title;
      el.setAttribute('aria-label', title);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}

function toggleThermo() {
  showThermo = !showThermo;
  try { localStorage.setItem('hc_show_thermo', showThermo ? '1' : '0'); } catch (e) {}
  renderAll();
  firstTimeTip('thermo', 'toggleThermoBtn', '🌡️', showThermo);
}

function toggleLine() {
  showLine = !showLine;
  try { localStorage.setItem('hc_show_line', showLine ? '1' : '0'); } catch (e) {}
  renderAll();
  firstTimeTip('line', 'toggleLineBtn', '📏', showLine);
}

function toggleHint() {
  distanceHint = !distanceHint;
  try { localStorage.setItem('hc_hint', distanceHint ? '1' : '0'); } catch (e) {}
  renderAll();
  firstTimeTip('hint', 'toggleHintBtn', '💡', distanceHint);
}

// Значок без подписи понятен, только когда уже знаешь, что он делает. Поэтому
// первое нажатие на каждый объясняет себя парой слов: что скрылось или
// появилось. Дальше не мешаем — запомнено, что человек уже видел
const TIP_MS = 3500;
let tipTimer = null;
function firstTimeTip(key, btnId, icon, on) {
  try {
    if (localStorage.getItem('hc_tip_' + key) === '1') return;
    localStorage.setItem('hc_tip_' + key, '1');
  } catch (e) {}
  const tip = document.getElementById('barTip');
  tip.textContent = icon + ' ' + t().tips[key][on ? 1 : 0];
  tip.classList.remove('hidden');
  // Стрелка — под той кнопкой, что нажали
  const b = document.getElementById(btnId).getBoundingClientRect();
  const t0 = tip.getBoundingClientRect();
  tip.style.setProperty('--arrow-right', Math.max(8, Math.round(t0.right - (b.left + b.width / 2) - 6)) + 'px');
  clearTimeout(tipTimer);
  tipTimer = setTimeout(hideBarTip, TIP_MS);
}
function hideBarTip() {
  clearTimeout(tipTimer);
  tipTimer = null;
  document.getElementById('barTip').classList.add('hidden');
}

function rangeCount() { return RANGE_MAX - RANGE_MIN + 1; }

// Сколько последних ходов видно тому, кто сейчас смотрит на экран. Ловушка
// «короткая память» режет это вдвое — и в списке, и на прямой, иначе прямая
// показывала бы то, что из истории убрали
function historyVisible() {
  return (mode === 'duel' && !D.roundOver && D.shortMemory[viewerSeat()])
    ? HISTORY_SHORT : HISTORY_VISIBLE;
}
function maxDistance() { return RANGE_MAX - RANGE_MIN; }

// Сколько чисел получится из выбранного размера диапазона
function countFor(size) { return frostMode ? Math.floor(size / 2) * 2 + 1 : size; }

function applyBounds(size) {
  if (frostMode) {
    const half = Math.floor(size / 2);
    RANGE_MIN = -half; RANGE_MAX = half;
  } else {
    RANGE_MIN = 1; RANGE_MAX = size;
  }
  // Пояса зависят от расстояния между догадкой и ответом, а не от границ:
  // равносильный обычный диапазон — это «максимальное расстояние плюс один»
  FEEDBACK_META = buildFeedbackMeta(maxDistance() + 1);
}

// Вызов онлайн выбирает мороз своей галочкой, а не общей настройкой, поэтому
// подпись умеет принимать его отдельно
function boundsLabel(size, frost) {
  const half = Math.floor(size / 2);
  const cold = (frost === undefined) ? frostMode : frost;
  // Минус берём обычный, с клавиатуры: ребёнок увидит ровно то, что ему набирать
  return cold ? (formatNum(-half) + '…+' + formatNum(half))
              : ('1–' + formatNum(size));
}

function renderFrostToggles() {
  ['frostSetup', 'frostRun'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = frostMode;
  });
}

function setFrostMode(on) {
  frostMode = !!on;
  try { localStorage.setItem('hc_frost', frostMode ? '1' : '0'); } catch (e) {}
  buildRangeOptions();
  renderFrostToggles();
}
const P_COLORS = ["#6366f1", "#fbbf24"];

// Сколько последних ходов остаётся на виду — и в истории, и на прямой.
// Остальное игрок помнит сам: в этом и смысл
const HISTORY_VISIBLE = 4;
const HISTORY_SHORT = 2;

let currentLang = localStorage.getItem('hc_lang') || 'en';

// ---------- общее состояние ----------
let mode = null;          // 'solo' | 'duel'
let screen = 'mode';      // 'mode' | 'setup' | 'game'
let secret = 0;
let history = [];
let gameOver = false;
let gameOverType = null;
let movesUsed = 0;
let lastWinIsRecord = false;
// Последняя догадка после исчерпанных попыток в историю не идёт, но в
// разборе партии она — такой же ход
let finalGuessValue = null;

// Игра с ботом без интернета: та же дуэль, второй игрок — бот
let vsBot = null;        // { bot } — с кем играем, или null
let botTimer = null;
let BOT_SPEED = 1;       // множитель «раздумий»; тесты ставят 0

// ---------- состояние дуэли ----------
const D = {
  names: ["", ""],
  winsNeeded: 3,
  handicap: 0,      // 0 нет, 1/2 — 2 жетона игроку 1/2
  wins: [0, 0],
  tokens: [0, 0],
  cur: 0,
  starter: 0,
  round: 1,
  armed: false,
  roundOver: false,
  matchOver: false,
  roundWinner: null,

  // Бонусы раунда и наложенные ими помехи. Всё живёт только внутри раунда
  bonuses: [],              // { value, type, taken }
  fog: [false, false],        // не видит ЧУЖИЕ ходы до конца раунда
  blind: [false, false],      // не видит СВОИ ходы до конца раунда
  fogFrom: [0, 0],            // с какого хода (номер в истории) они закрыты:
  blindFrom: [0, 0],          // ход, которым помеху взяли, и прежние игрок уже видел
  autoLava: [false, false],   // следующий ход за него сделает случай
  skip: [false, false],       // пропускает свой следующий ход
  shortMemory: [false, false],// видит вдвое меньше ходов до конца раунда
  nearBonus: false,         // последний ход прошёл рядом с бонусом
  lastBonus: null,          // что сработало, для строки под подсказкой
  lastBonusBy: 0            // кто его взял — чтобы назвать игроков поимённо
};

// Бонус срабатывает только при точном попадании, а за несколько клеток до него
// загорается сигнал. Радиус считается от длины прямой и числа бонусов так,
// чтобы все зоны «рядом» вместе накрывали не больше трети прямой: k бонусов
// по 2r клеток — это 2rk, и r = 3n / 20k даёт ровно 30 %. Прежняя ступенька
// (1, 3, 5) числа бонусов не знала и на −10…10 зажигала сигнал на 57 %
// прямой — писк металлоискателя на половине пляжа ничего не говорит.
// На больших полях бонусов 3 % клеток, и формула сама сходится к пяти
function bonusNearRadius() {
  const n = rangeCount();
  return Math.max(1, Math.floor(3 * n / (20 * autoBonusCountFor(n))));
}

// Полезные бонусы и ловушки. Ловушка бьёт по тому, кто на неё наступил, —
// из-за этого сигнал «рядом» перестаёт быть приманкой и становится выбором
const BONUS_GOOD = ['extra', 'fog', 'blind', 'lava'];
const BONUS_TRAP = ['skip', 'gift', 'memory'];
const BONUS_TYPES = BONUS_GOOD.concat(BONUS_TRAP);
const BONUS_TRAP_SHARE = 1 / 3;

let bonusMode = localStorage.getItem('hc_bonus') === '1';
let bonusCountChoice = parseInt(localStorage.getItem('hc_bonus_n')) || 0;  // 0 — «как обычно»

function setBonusMode(on) {
  bonusMode = !!on;
  try { localStorage.setItem('hc_bonus', bonusMode ? '1' : '0'); } catch (e) {}
  renderBonusSetup();
}

function setBonusCount(v) {
  bonusCountChoice = parseInt(v) || 0;
  try { localStorage.setItem('hc_bonus_n', String(bonusCountChoice)); } catch (e) {}
}

// Сколько бонусов ставить, если игрок не выбирал сам. Растёт медленнее
// диапазона: на тысяче их должно быть заметно больше, чем на сотне, но не в
// сто раз. На тесных диапазонах удваивать нельзя — зона «рядом» накроет
// половину прямой, и сигнал перестанет что-либо значить
// Третье слагаемое — три процента клеток: на маленьких диапазонах оно меньше
// остальных и ничего не меняет, на больших снимает прежний потолок в двенадцать
function autoBonusCountFor(n) {
  const base = Math.max(1, Math.ceil(Math.sqrt(n) / 4));
  const roomy = Math.max(1, Math.floor(n * 0.086));
  return Math.max(base, Math.min(base * 2, roomy), Math.floor(n * 0.03));
}

// Больше, чем чисел без загаданного, на доску не поместится при всём желании
function bonusCount() {
  const n = rangeCount();
  return Math.max(1, Math.min(bonusCountChoice || autoBonusCountFor(n), n - 1));
}

// Бонусы ложатся куда угодно — на любое число, кроме загаданного и кроме
// уже занятого другим бонусом. Ловушек примерно треть: они должны попадаться,
// но не решать, кто выиграл раунд
function placeBonuses() {
  D.bonuses = [];
  if (!bonusMode) return;
  const count = bonusCount();
  const traps = Math.round(count * BONUS_TRAP_SHARE);
  const good = BONUS_GOOD.slice().sort(() => Math.random() - 0.5);
  const trap = BONUS_TRAP.slice().sort(() => Math.random() - 0.5);
  const pool = [];
  for (let i = 0; i < count - traps; i++) pool.push(good[i % good.length]);
  for (let i = 0; i < traps; i++) pool.push(trap[i % trap.length]);
  pool.sort(() => Math.random() - 0.5);
  const used = new Set([secret]);
  for (let guard = 0; guard < 800 && D.bonuses.length < count; guard++) {
    const v = RANGE_MIN + Math.floor(Math.random() * rangeCount());
    if (used.has(v)) continue;
    used.add(v);
    D.bonuses.push({ value: v, type: pool[D.bonuses.length], taken: false });
  }
}

function t() { return i18n[currentLang]; }

// ================= ЯЗЫК =================
function changeLanguage() {
  currentLang = document.getElementById('langSwitcher').value;
  localStorage.setItem('hc_lang', currentLang);
  applyTranslations();
  // Язык меняют в окне профиля — оно должно сразу заговорить по-новому
  if (!document.getElementById('logoutModal').classList.contains('hidden')) fillProfile();
  updateAccountChip();
}

// Фора — только лишний жетон. «Всегда ходит первым» убрано: первый ход
// и так переходит от раунда к раунду. В подписи — имена, если их ввели
function buildHandicapOptions() {
  const sel = document.getElementById('handicap');
  const prev = sel.value || "0";
  const L = t();
  const who = i => (document.getElementById(i ? 'nameP2' : 'nameP1').value || '').trim() ||
                   (i ? L.defP2 : L.defP1);
  const opts = [
    L.hcNone,
    who(0) + " — " + L.hcTokens,
    who(1) + " — " + L.hcTokens
  ];
  sel.innerHTML = '';
  opts.forEach((txt, i) => {
    const o = document.createElement('option');
    o.value = i; o.textContent = txt;
    sel.appendChild(o);
  });
  sel.value = prev;
}

function applyTranslations() {
  const L = t();

  document.getElementById('docTitle').textContent = L.docTitle;
  document.title = L.docTitle;
  document.getElementById('tTitle').textContent = L.title;
  // В строке статуса «Меню» — значком: словом оно не помещалось в одну
  // строку с попытками и тремя переключателями, и строка ломалась надвое
  const menuBtn = document.getElementById('tMenu');
  menuBtn.textContent = '☰';
  menuBtn.title = L.menu;
  menuBtn.setAttribute('aria-label', L.menu);
  menuBtn.classList.toggle('icon', mode !== 'run');
  document.getElementById('tFinalWarning').textContent = L.finalWarning;
  document.getElementById('tFinalSubmit').textContent = L.finalSubmit;
  document.getElementById('tSubmitGuess').textContent = L.submitGuess;
  document.getElementById('tHistoryTitle').textContent = L.historyTitle;
  document.getElementById('tLegendTitle').textContent = L.legendTitle;
  // Приветствие собирается из имени, поэтому при смене языка его надо пересобрать
  const greetAuth = runAuth();
  renderGreeting(greetAuth && greetAuth.username);

  document.getElementById('tModeSolo').textContent = L.modeSolo;
  document.getElementById('tModeDuel').textContent = L.modeDuel;
  document.getElementById('tModeBot').textContent = L.modeBot;
  document.getElementById('tLblBot').textContent = L.lblBot;
  // У каждого экрана своё название — с тем же значком, что в меню
  document.getElementById('tSetupScreen').textContent =
    mode === 'duel' ? '🤝 ' + L.modeDuel : '🎯 ' + L.modeSolo;

  document.getElementById('tLblP1').textContent = L.lblP1;
  document.getElementById('tLblP2').textContent = L.lblP2;
  document.getElementById('tLblWins').textContent = L.lblWins;
  document.getElementById('tLblHandicap').textContent = L.lblHandicap;
  document.getElementById('tBack').textContent = L.back;
  document.getElementById('tStartMatch').textContent = L.startMatch;
  document.getElementById('tWinsLabel0').textContent = L.winsLabel;
  document.getElementById('tWinsLabel1').textContent = L.winsLabel;

  document.getElementById('nameP1').placeholder = L.defP1;
  document.getElementById('nameP2').placeholder = L.defP2;
  document.getElementById('guessInput').placeholder =
    L.placeholderTpl.replace('{a}', formatNum(RANGE_MIN)).replace('{b}', formatNum(RANGE_MAX));
  document.getElementById('finalInput').placeholder = L.finalInput;
  renderVizToggles();
  document.getElementById('tFrostSetup').textContent = L.frostLabel;
  document.getElementById('tBonusSetup').textContent = L.bonusLabel;
  document.getElementById('tFrostHint').textContent = L.frostHint;
  document.getElementById('tFrostRunHint').textContent = L.frostHint;
  document.getElementById('tBonusHint').textContent = L.bonusHint;
  document.getElementById('bonusSetup').checked = bonusMode;
  document.getElementById('tLblBonusCount').textContent = L.lblBonusCount;
  buildBonusCountOptions();
  renderBonusSetup();
  document.getElementById('tFrostRun').textContent = L.frostLabel;
  renderFrostToggles();

  // экраны режима на рейтинг
  document.getElementById('tModeRun').textContent = L.run.mode;
  document.getElementById('tRunScreen').textContent = '🏆 ' + L.run.mode;
  document.getElementById('tGroupOffline').textContent = L.groupOffline;
  document.getElementById('tGroupOnline').textContent = L.groupOnline;
  document.getElementById('tModeOnline').textContent = L.online.mode;
  renderTutorialMenu();
  renderQuestCard();
  // Значок — как у «🎮 Игры»: разделы экрана подписаны одинаково
  document.getElementById('tLblFindFriend').textContent = '🔍 ' + L.online.find;
  document.getElementById('tFindBtn').textContent = L.online.findBtn;
  document.getElementById('tFriendsTitle').textContent = L.online.friends;
  document.getElementById('tOnlineBack').textContent = L.online.back;
  document.getElementById('tGamesTitle').textContent = L.online.games;
  document.getElementById('tFriendsBack').textContent = L.online.back;
  document.getElementById('tFriendsScreen').textContent = L.online.menuFriends;
  document.getElementById('tInviteBtn').textContent = L.inv.invBtn;
  document.getElementById('tDeleteAccount').textContent = L.online.deleteAccount;
  document.getElementById('tChatInvite').textContent = L.online.chatInvite;
  document.getElementById('chatText').placeholder = L.online.chatPh;
  document.getElementById('tChatSend').title = L.online.chatSendLabel;
  document.getElementById('tChatSend').setAttribute('aria-label', L.online.chatSendLabel);
  document.getElementById('tChatFriendly').textContent = L.online.chatFriendly;
  document.getElementById('tChatRanked').textContent = L.online.chatRanked;
  document.getElementById('tChatBack').textContent = L.online.chatBack;
  document.getElementById('tRkPlay').textContent = L.online.rkPlay;
  document.getElementById('tRkCancel').textContent = L.online.rkCancel;
  document.getElementById('tRkTop').textContent = L.online.rkTop;
  document.getElementById('tOnlineScreen').textContent = '🌐 ' + L.online.mode;
  document.getElementById('tRkGames').textContent = L.online.rkGames;
  document.getElementById('tChRange').textContent = L.online.chRange;
  document.getElementById('tChFrost').textContent = L.frostLabel;
  document.getElementById('tChWins').textContent = L.online.chWins;
  document.getElementById('tChSend').textContent = L.online.chSend;
  document.getElementById('tChBonuses').textContent = L.online.chBonuses;
  document.getElementById('tChBonusCount').textContent = L.online.chBonusCount;
  document.getElementById('tChCancel').textContent = L.online.chCancel;
  document.getElementById('friendSearch').placeholder = L.online.searchPh;
  document.getElementById('tRunChoiceLogin').textContent = L.run.choiceLogin;
  document.getElementById('tRunChoiceLoginSub').textContent = L.run.choiceLoginSub;
  document.getElementById('tRunChoiceRegister').textContent = L.run.choiceRegister;
  document.getElementById('tRunChoiceRegisterSub').textContent = L.run.choiceRegisterSub;
  document.getElementById('tRunChoiceBack').textContent = L.run.back;
  document.getElementById('tRunAuthBack').textContent = L.run.back;
  document.getElementById('tRunName').textContent = L.run.name;
  document.getElementById('tRunHint').textContent = L.run.hint;
  document.getElementById('runHint').placeholder = L.run.hintPh;
  document.getElementById('tRunForgot').textContent = L.run.forgot;
  document.getElementById('tRunPin').textContent = runAuthMode === 'register' ? L.run.pin : L.run.pinLogin;
  document.getElementById('runUsername').placeholder = L.run.namePh;
  document.getElementById('tRunStart').textContent = L.run.start;
  document.getElementById('tRunTop').textContent = L.run.top;
  document.getElementById('tRunTopDay').textContent = L.run.topDay;
  document.getElementById('tRunTopWeek').textContent = L.run.topWeek;
  document.getElementById('tRunTopAll').textContent = L.run.topAll;
  document.getElementById('tRunToMenu').textContent = L.run.toMenu;
  if (mode === 'run') {
    document.getElementById('tMenu').textContent = L.run.pause;
    document.getElementById('tMenu').title = L.run.pause;
    document.getElementById('tMenu').setAttribute('aria-label', L.run.pause);
  }
  document.getElementById('tPauseTitle').textContent = L.run.pauseTitle;
  document.getElementById('tPauseResume').textContent = L.run.resume;
  document.getElementById('tPauseExit').textContent = L.run.exitKeep;
  document.getElementById('tPauseGiveUp').textContent = L.run.surrender;
  document.getElementById('tUnfinished').textContent = L.run.unfinished;
  document.getElementById('tUnfinishedResume').textContent = L.run.resume;
  document.getElementById('tUnfinishedFinish').textContent = L.run.surrender;
  renderSoundBtn();
  if (screen === 'auth') {
    document.getElementById('runAuthTitle').textContent =
      runAuthMode === 'register' ? L.run.registerTitle : L.run.loginTitle;
    document.getElementById('runAuthSubmitBtn').textContent =
      runAuthMode === 'register' ? L.run.registerBtn : L.run.loginBtn;
  }

  document.getElementById('tLblRange').textContent = L.lblRange;
  document.getElementById('tLblAttempts').textContent = L.lblAttempts;

  buildHandicapOptions();
  buildRangeOptions();
  buildLegend();
  renderAll();
}

// ================= НАВИГАЦИЯ =================
function showScreen(name) {
  screen = name;
  document.getElementById('screenMode').classList.toggle('hidden', name !== 'mode');
  document.getElementById('screenSetup').classList.toggle('hidden', name !== 'setup');
  document.getElementById('screenGame').classList.toggle('hidden', name !== 'game');
  document.getElementById('screenAuthChoice').classList.toggle('hidden', name !== 'authChoice');
  document.getElementById('screenAuth').classList.toggle('hidden', name !== 'auth');
  document.getElementById('screenRunHub').classList.toggle('hidden', name !== 'runHub');
  document.getElementById('screenOnline').classList.toggle('hidden', name !== 'online');
  document.getElementById('screenFriends').classList.toggle('hidden', name !== 'friends');
  document.getElementById('screenChat').classList.toggle('hidden', name !== 'chat');
  if (name !== 'chat') stopChatPoll();
  if (name !== 'friends') stopFriendsPoll();
  if (name !== 'online') { stopRankedPoll(); stopOnlinePoll(); }
  document.getElementById('card').classList.toggle('wide', name === 'game' && mode === 'duel');
  document.getElementById('card').classList.toggle('solo-game', name === 'game' && mode !== 'duel');
  document.querySelector('.header').classList.toggle('compact', name === 'game');
  document.querySelector('.legend').classList.toggle('hidden', name !== 'game');
  updateAccountChip();
  // Вернулся в меню — задания могли продвинуться: партия или Испытание
  if (name === 'mode') loadProgress();
}

function quitToMenu() {
  setGuessNote('');
  endLessonMode();
  liftCurtain();
  curtainPrevCur = null;
  hideBarTip();
  stopBot();
  vsBot = null;
  mode = null;
  D.matchOver = false;
  applyTranslations();
  showScreen('mode');
}

// Выход с игрового экрана: в режиме на рейтинг это отказ от текущей игры —
// возвращаемся в хаб режима, а не в главное меню
function leaveGame() {
  // Из рейтинговой игры так просто не выйти: сначала вопрос
  if (online && online.ranked && !D.matchOver) return openResign();
  if (online) return backToOnline();
  if (mode === 'run') { openPause(); return; }
  if (hasProgress()) return openQuit();
  quitToMenu();
}

// Есть ли что терять: начатая и не законченная партия. Пустую или уже
// сыгранную закрываем без вопроса — спрашивать там не о чем
function hasProgress() {
  if (mode === 'solo') {
    return history.length > 0 && (!gameOver || gameOverType === 'lose_waiting');
  }
  if (mode === 'duel') {
    return !D.matchOver && (history.length > 0 || D.round > 1 || D.wins[0] + D.wins[1] > 0);
  }
  return false;
}

function openQuit() {
  const L = t();
  document.getElementById('tQuitAsk').textContent = L.quitAsk;
  document.getElementById('tQuitStay').textContent = L.quitStay;
  document.getElementById('tQuitGo').textContent = L.quitGo;
  document.getElementById('quitModal').classList.remove('hidden');
}

function closeQuit() {
  document.getElementById('quitModal').classList.add('hidden');
}

// ================= ОБЩАЯ НАСТРОЙКА (диапазон/попытки/дуэль) =================
// Игра с ботом — та же дуэль: вместо второго имени и форы выбирается бот
let setupBot = false;
function openSetup(m, bot) {
  endLessonMode();
  mode = m;
  setupBot = !!bot && m === 'duel';
  const L = t();
  document.getElementById('duelOnlyFields').classList.toggle('hidden', m !== 'duel');
  document.getElementById('attemptsField').classList.toggle('hidden', m !== 'solo');
  document.getElementById('botPickField').classList.toggle('hidden', !setupBot);
  document.getElementById('namesPair').classList.toggle('hidden', setupBot);
  document.getElementById('handicapField').classList.toggle('hidden', setupBot);
  document.getElementById('tStartMatch').textContent = (m === 'duel') ? L.startMatch : L.startGame;
  document.getElementById('tSetupScreen').textContent =
    setupBot ? '🤖 ' + L.modeBot : m === 'duel' ? '🤝 ' + L.modeDuel : '🎯 ' + L.modeSolo;
  buildRangeOptions();
  if (m === 'duel') buildHandicapOptions();
  if (setupBot) renderBotPick();
  renderBonusSetup();
  showScreen('setup');
}

function buildRangeOptions() {
  const sel = document.getElementById('rangeMax');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  RANGE_PRESETS.forEach(n => {
    const o = document.createElement('option');
    o.value = n;
    o.textContent = boundsLabel(n);
    sel.appendChild(o);
  });
  const saved = savedSetup('hc_range');
  sel.value = RANGE_PRESETS.includes(parseInt(prev)) ? prev
    : RANGE_PRESETS.includes(parseInt(saved)) ? saved : DEFAULT_RANGE;
  buildAttemptsOptions();
  buildBonusCountOptions();
}

function onRangeChange() {
  buildAttemptsOptions();
  buildBonusCountOptions();
  saveSetupChoice();
}

// Диапазон и попытки запоминаются: ребёнок выбрал удобное — в следующий раз
// не надо искать заново. Новичку — 1–100: 1–1000 для младших тяжеловато
const DEFAULT_RANGE = '100';
function saveSetupChoice() {
  try {
    localStorage.setItem('hc_range', document.getElementById('rangeMax').value);
    localStorage.setItem('hc_attempts', document.getElementById('attemptsCount').value);
  } catch (e) {}
}

function savedSetup(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

// Лесенкой, а не полем ввода: настройку открывают дети и родители, вызывать
// тут клавиатуру незачем — а тем более давать ввести семьсот бонусов на
// диапазоне из десяти чисел
function buildBonusCountOptions() {
  const sel = document.getElementById('bonusCount');
  if (!sel) return;
  const rangeSel = document.getElementById('rangeMax');
  const n = countFor(parseInt(rangeSel && rangeSel.value) || 1000);
  const auto = autoBonusCountFor(n);
  const values = [...new Set([1, 2, 3, 6, 12, 25, 50, 100, auto, n - 1])]
    .filter(v => v >= 1 && v <= n - 1)
    .sort((a, b) => a - b);
  sel.innerHTML = '';
  values.forEach(v => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = (v === auto) ? t().bonusAuto.replace('{n}', v) : String(v);
    sel.appendChild(o);
  });
  sel.value = String(Math.max(1, Math.min(bonusCountChoice || auto, n - 1)));
}

function renderBonusSetup() {
  const f = document.getElementById('bonusCountField');
  if (f) f.classList.toggle('hidden', !bonusMode);
}

function buildAttemptsOptions() {
  const rangeSel = document.getElementById('rangeMax');
  const rangeMax = parseInt(rangeSel && rangeSel.value) || 1000;
  const min = minAttempts(countFor(rangeMax));
  const sel = document.getElementById('attemptsCount');
  const prev = sel.value;
  const options = [min, min + 1, min + 2, min + 3, min + 5, min + 8, min + 12];
  sel.innerHTML = '';
  options.forEach(v => {
    const o = document.createElement('option');
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  });
  const saved = savedSetup('hc_attempts');
  sel.value = options.includes(parseInt(prev)) ? prev
    : options.includes(parseInt(saved)) ? saved : String(min);
}

function applyRangeToInputs() {
  const signed = RANGE_MIN < 0;
  [['guessInput', 'guessSign'], ['finalInput', 'finalSign']].forEach(([id, signId]) => {
    const el = document.getElementById(id);
    el.setAttribute('aria-valuemin', RANGE_MIN);
    el.setAttribute('aria-valuemax', RANGE_MAX);
    // Кнопка минуса нужна только там, где отрицательные числа вообще бывают
    document.getElementById(signId).classList.toggle('hidden', !signed);
    renderSignBtn(id, signId);
  });
}

// В поле пускаем только цифры и один минус в начале: клавиатура на компьютере
// и автозамена на телефоне иначе занесут туда что угодно
function filterNumberInput(el) {
  const cleaned = el.value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '');
  if (cleaned !== el.value) el.value = cleaned;
}

function renderSignBtn(id, signId) {
  const el = document.getElementById(id);
  const btn = document.getElementById(signId);
  if (el && btn) btn.classList.toggle('on', String(el.value).trim().charAt(0) === '-');
}

// Переставляет знак у набранного числа. Пустое поле просто запоминает минус,
// чтобы можно было нажать его до цифр — как на бумаге
function flipSign(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const v = String(el.value).trim();
  el.value = v.charAt(0) === '-' ? v.slice(1) : '-' + v;
  renderSignBtn(id, id === 'guessInput' ? 'guessSign' : 'finalSign');
  el.focus();
}

function startFromSetup() {
  applyBounds(parseInt(document.getElementById('rangeMax').value) || 1000);
  if (mode === 'solo') {
    MAX_GUESSES = parseInt(document.getElementById('attemptsCount').value) || minAttempts(rangeCount());
  }
  applyRangeToInputs();
  if (mode === 'duel') startMatch(); else startSolo();
}

// ================= ОДИНОЧНАЯ ИГРА =================
function startSolo() {
  resetSolo();
  applyTranslations();
  showScreen('game');
}

function resetSolo() {
  secret = RANGE_MIN + Math.floor(Math.random() * rangeCount());
  history = [];
  setGuessNote('');
  gameOver = false;
  gameOverType = null;
  movesUsed = 0;
  lastWinIsRecord = false;
  finalGuessValue = null;
  document.getElementById('finalInput').value = '';
  document.getElementById('guessInput').value = '';
  renderAll();
}

// Строка под полем ввода. Число вне диапазона — красным и поле вздрагивает;
// повтор — жёлтым, ход при этом засчитан
function setGuessNote(text, bad) {
  const el = document.getElementById('guessNote');
  if (!el) return;
  el.textContent = text || '';
  el.classList.toggle('hidden', !text);
  el.classList.toggle('bad', !!bad);
}

// Что ввели в поле: число в диапазоне или null. Пустое поле — молча null:
// нажали «Проверить», ничего не набрав, — объяснять нечего
function readGuess() {
  const input = document.getElementById('guessInput');
  const raw = input.value.trim();
  if (!raw || raw === '-') return null;
  const guess = parseInt(raw);
  if (isNaN(guess) || guess < RANGE_MIN || guess > RANGE_MAX) {
    setGuessNote(t().outOfRange.replace('{a}', formatNum(RANGE_MIN)).replace('{b}', formatNum(RANGE_MAX)), true);
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    return null;
  }
  setGuessNote('');
  return guess;
}

// Это число в раунде уже называли (кто угодно): ответ будет тот же
function noteIfRepeat(guess, before) {
  if (before.some(h => h.guess === guess)) setGuessNote(t().repeatGuess.replace('{n}', formatNum(guess)));
}

function handleGuess() {
  if (online) return onlineGuess();
  if (mode === 'duel') return duelGuess();
  if (mode === 'run') return runGuess();
  if (gameOver) return;
  const input = document.getElementById('guessInput');
  const guess = readGuess();
  if (guess === null) return;
  noteIfRepeat(guess, history);

  const distance = Math.abs(guess - secret);
  const meta = getFeedback(distance);
  history.push({ guess, distance, meta, p: null });
  input.value = '';

  soundForGuess(meta);
  if (distance === 0) {
    gameOver = true;
    gameOverType = 'win';
    movesUsed = history.length;
    lastWinIsRecord = maybeSaveRecord(RANGE_MAX, history.length);
  } else if (history.length >= MAX_GUESSES) {
    gameOver = true;
    gameOverType = 'lose_waiting';
  }
  renderAll();
}

function submitFinal() {
  const input = document.getElementById('finalInput');
  const g = parseInt(input.value);
  if (isNaN(g)) return;
  const win = (g === secret);
  finalGuessValue = g;
  gameOverType = win ? 'win' : 'lose';
  // Последняя догадка в историю не идёт, но ходом она была — считаем её
  movesUsed = history.length + 1;
  lastWinIsRecord = win ? maybeSaveRecord(RANGE_MAX, history.length + 1) : false;
  renderAll();
}

// ================= РЕКОРДЫ (только одиночная игра) =================
function recordKey(rangeMax) { return 'hc_record_' + (frostMode ? 's' : '') + rangeMax; }

function getRecord(rangeMax) {
  try {
    const v = localStorage.getItem(recordKey(rangeMax));
    return v ? parseInt(v) : null;
  } catch (e) { return null; }
}

function maybeSaveRecord(rangeMax, guesses) {
  try {
    const cur = getRecord(rangeMax);
    if (cur === null || guesses < cur) {
      localStorage.setItem(recordKey(rangeMax), String(guesses));
      return true;
    }
  } catch (e) {}
  return false;
}

// ================= ДУЭЛЬ =================
function startMatch() {
  const L = t();
  mode = 'duel';
  stopBot();
  vsBot = setupBot ? { bot: BOTS.find(b => b.key === botChoice()) || BOTS[1] } : null;
  D.names[0] = vsBot ? (myName() || L.you)
                     : (document.getElementById('nameP1').value || '').trim() || L.defP1;
  D.names[1] = vsBot ? botName(vsBot.bot)
                     : (document.getElementById('nameP2').value || '').trim() || L.defP2;
  D.winsNeeded = parseInt(document.getElementById('winsNeeded').value);
  D.handicap = vsBot ? 0 : parseInt(document.getElementById('handicap').value);
  D.wins = [0, 0];
  D.round = 1;
  D.matchOver = false;
  D.starter = 0;
  startRound();
  applyTranslations();
  showScreen('game');
  if (vsBot) setTimeout(() => botSay(vsBot && vsBot.bot.greet), 600);
}

function startRound() {
  secret = RANGE_MIN + Math.floor(Math.random() * rangeCount());
  history = [];
  setGuessNote('');
  D.tokens = [1, 1];
  if (D.handicap === 1) D.tokens[0] = 2;
  if (D.handicap === 2) D.tokens[1] = 2;
  D.cur = D.starter;
  D.armed = false;
  D.roundOver = false;
  D.roundWinner = null;
  D.fog = [false, false];
  D.blind = [false, false];
  D.fogFrom = [0, 0];
  D.blindFrom = [0, 0];
  D.autoLava = [false, false];
  D.skip = [false, false];
  D.shortMemory = [false, false];
  D.nearBonus = false;
  D.lastBonus = null;
  placeBonuses();
  document.getElementById('guessInput').value = '';
  renderAll();
}

function nextRound() {
  if (online) return onlineNextRound();
  D.round++;
  D.starter = 1 - D.starter;
  startRound();
}

function newMatch() {
  D.wins = [0, 0];
  D.round = 1;
  D.matchOver = false;
  D.starter = 0;
  startRound();
}

function useToken(p) {
  if (mode !== 'duel' || D.roundOver || D.matchOver) return;
  if (p !== D.cur) return;
  if (online) { if (p === online.seat) onlineToken(); return; }
  if (vsBot && p === 1) return;
  if (D.armed) {
    D.armed = false;
    D.tokens[p]++;
    renderAll();
    return;
  }
  if (D.tokens[p] <= 0) return;
  // Жетон — в любой момент, и первым ходом раунда тоже
  D.tokens[p]--;
  D.armed = true;
  renderAll();
}

function duelGuess() {
  if (D.roundOver || D.matchOver) return;
  if (vsBot && D.cur === 1) return;
  const input = document.getElementById('guessInput');
  const guess = readGuess();
  if (guess === null) return;
  noteIfRepeat(guess, history);
  input.value = '';
  duelPlay(guess);
}

function duelPlay(guess, forced) {
  const distance = Math.abs(guess - secret);
  const meta = getFeedback(distance);
  // Для разбора: ход сделан сам (бросок в лаву) или игрок видел не все
  // ходы (туман, слепота, короткая память) — такие ходы не оцениваются
  const limited = !!(D.fog[D.cur] || D.blind[D.cur] || D.shortMemory[D.cur]);
  const move = { guess, distance, meta, p: D.cur, forced: !!forced, limited };
  history.push(move);

  const hit = D.bonuses.find(b => !b.taken && b.value === guess);
  const radius = bonusNearRadius();
  D.nearBonus = !hit && D.bonuses.some(b => !b.taken && Math.abs(b.value - guess) <= radius);
  // Помеха, которая ослепила бы игрока полностью, на месте превращается в
  // запас ходов — и ровно это игрок и увидит в строке под подсказкой
  let type = hit ? hit.type : null;
  if (type && bonusBlocked(type, 1 - D.cur)) type = 'extra';
  D.lastBonus = type;
  D.lastBonusBy = D.cur;
  if (hit) {
    hit.taken = true;
    applyBonus(type, D.cur);
  }

  const usedDouble = D.armed;
  D.armed = false;

  if (distance === 0) {
    D.roundOver = true;
    D.roundWinner = D.cur;
    D.wins[D.cur]++;
    if (D.wins[D.cur] >= D.winsNeeded) D.matchOver = true;
    if (vsBot) botSay(D.matchOver ? 'gg' : (D.cur === 0 && Math.random() < 0.5 ? vsBot.bot.react : null));
  }
  // У каждого пояса свой звук: закрытый от человека ход бота звучать не
  // должен, иначе туман слышно. Проверяем после бонуса и конца раунда —
  // от них зависит, закрыт ли ход
  if (!(vsBot && hiddenRow(move.p, move))) soundForGuess(meta);
  if (distance !== 0 && !usedDouble) D.cur = 1 - D.cur;
  renderAll();
}

// Туман закрывает чужие ходы, слепой — свои. Вместе они не оставляют игроку
// ничего: до конца раунда он не видит ни одной подсказки и просто перебирает
// числа. Второй такой бонус на того же игрока не ложится
function bonusBlocked(type, victim) {
  if (type === 'fog') return D.blind[victim];
  if (type === 'blind') return D.fog[victim];
  return false;
}

// Полезные бонусы бьют по сопернику, ловушки — по тому, кто наступил
function applyBonus(type, by) {
  const rival = 1 - by;
  if (type === 'extra') D.tokens[by] += 2;
  // Отметка — номер следующего хода: этот ход уже в истории и остаётся виден
  if (type === 'fog' && !D.fog[rival]) { D.fog[rival] = true; D.fogFrom[rival] = history.length; }
  if (type === 'blind' && !D.blind[rival]) { D.blind[rival] = true; D.blindFrom[rival] = history.length; }
  if (type === 'lava') D.autoLava[rival] = true;
  if (type === 'skip') D.skip[by] = true;
  if (type === 'gift') D.tokens[rival] += 1;
  if (type === 'memory') D.shortMemory[by] = true;
}

// Ход отнят бонусом: игрок не вводит число, а нажимает кнопку. Раньше ход за
// него делался сам через секунду — экран менялся, и в моменте никто не
// понимал, что произошло и кто это сделал
function forcedTurn() {
  if (mode !== 'duel' || D.roundOver || D.matchOver) return null;
  // Онлайн: решает сервер, и только для того, чей сейчас ход
  if (online) return (D.cur === online.seat) ? online.forced : null;
  // Отнятый ход бота бот делает сам — кнопку человеку не показываем
  if (vsBot && D.cur === 1) return null;
  return localForced();
}

function localForced() {
  if (mode !== 'duel' || D.roundOver || D.matchOver) return null;
  if (D.skip[D.cur]) return 'skip';
  if (D.autoLava[D.cur]) return 'lava';
  return null;
}

// Случайное число в поясе «лава или очень горячо», но не само загаданное.
// Только «лава» была слишком точной подсказкой тому, кто ходит следующим
function lavaThrow() {
  const hot = FEEDBACK_META[6];
  const options = [];
  for (let d = 1; d <= hot.max; d++) {
    [secret - d, secret + d].forEach(v => {
      if (v >= RANGE_MIN && v <= RANGE_MAX && v !== secret) options.push(v);
    });
  }
  return options.length ? options[Math.floor(Math.random() * options.length)] : null;
}

async function onlineForcedTurn() {
  try {
    await friendRpc('do_forced_turn', { p_match_id: online.id });
    await refreshMatch();
  } catch (e) {
    setMatchNote(onlineMatchError(e.message));
    await refreshMatch(true);
  }
}

function doForcedTurn(byBot) {
  const kind = byBot ? localForced() : forcedTurn();
  if (!kind) return;
  if (online) return onlineForcedTurn();
  if (kind === 'skip') {
    D.skip[D.cur] = false;
    // Взведённый жетон работает и здесь: пропуск идёт первым ходом, а второй
    // игрок делает сам. Ради этого жетон и взводят
    if (D.armed) { D.armed = false; renderAll(); return; }
    D.cur = 1 - D.cur;
    renderAll();
    return;
  }
  D.autoLava[D.cur] = false;
  const value = lavaThrow();
  if (value === null) {
    if (D.armed) { D.armed = false; renderAll(); return; }
    D.cur = 1 - D.cur;
    renderAll();
    return;
  }
  // Бросок идёт обычным ходом, поэтому жетон сработает внутри duelPlay
  duelPlay(value, true);
}

// ================= РЕНДЕР =================
// Помехи из бонусов прячут чужие или свои ходы от того, чей сейчас ход.
// Когда раунд окончен, прячется всё равно нечего — показываем как есть
function hiddenRow(ownerP, h) {
  // В онлайне сервер уже решил, что показывать: закрытый ход приезжает без
  // числа, и гадать на месте нечего
  if (online) return !!(h && h.masked);
  if (mode !== 'duel' || D.roundOver || D.matchOver) return false;
  if (ownerP === null || ownerP === undefined) return false;
  // Прячутся ходы, сделанные после того, как помеха легла. С ботом в экран
  // смотрит только человек — помеха на нём действует весь раунд, на любом
  // ходу. Вдвоём за одним телефоном — пока ходит тот, на ком помеха: в
  // чужой ход экран смотрит второй
  const viewer = viewerSeat();
  const at = history.indexOf(h);
  const mine = ownerP === viewer;
  if (D.fog[viewer] && !mine && at >= D.fogFrom[viewer]) return true;
  if (D.blind[viewer] && mine && at >= D.blindFrom[viewer]) return true;
  return false;
}

// Кто сейчас смотрит в экран: в онлайне — хозяин телефона, с ботом —
// человек, вдвоём за одним телефоном — тот, чей ход
function viewerSeat() {
  if (online) return online.seat;
  if (vsBot) return 0;
  return D.cur;
}

// Подсказка и градусник показывают положение дел прямо сейчас — то есть
// последний сделанный ход. Если он от игрока закрыт, показывать нечего:
// откатываться на ход раньше нельзя, старая подсказка прочитается как свежая
function currentMove() {
  const last = history[history.length - 1];
  if (!last || last.timeout) return null;
  return hiddenRow(last.p, last) ? null : last;
}

// Попал или нет — видно по поясу, а не по расстоянию. В онлайне расстояния
// нет вовсе: сервер его не отдаёт, потому что догадка вместе с расстоянием
// выдаёт ответ с точностью до двух вариантов
function isHit(h) { return !!(h && h.meta && h.meta.labelIndex === 8); }

function getFeedback(distance) {
  return FEEDBACK_META.find(f => distance >= f.min && distance <= f.max) || FEEDBACK_META[0];
}
function getFbText(meta) { return t().labels[meta.labelIndex]; }

function renderAll() {
  if (screen !== 'game' && mode === null) return;
  const duel = mode === 'duel';
  const board = document.getElementById('board');
  board.classList.toggle('duel', duel);
  board.classList.toggle('solo', !duel);
  board.classList.toggle('over', roundOver());
  document.getElementById('pcard0').classList.toggle('hidden', !duel);
  document.getElementById('pcard1').classList.toggle('hidden', !duel);
  document.getElementById('historyList').classList.toggle('tall', duel);

  renderFeedback();
  renderVizToggles();
  renderThermo();
  renderNumberLine();
  renderStatus();
  renderResult();
  renderHistory();
  renderBonusLine();
  renderForcedTurn();
  renderClock();
  renderSayPad();
  renderSayBubble();
  syncScaleBox();
  if (duel) renderPlayers();
  checkCurtain();
  // Сначала итог урока: он отмечает урок пройденным, и подсказка гаснет
  renderLessonResult();
  renderCoach();
  checkBonusCard();
  botTick();
}

function renderBonusLine() {
  const box = document.getElementById('bonusLine');
  if (!box) return;
  const L = t();
  // Если панель отнятого хода уже сказала то же самое, строка не нужна:
  // два одинаковых сообщения подряд занимают пол-экрана телефона
  const show = mode === 'duel' && bonusMode && !D.roundOver &&
               (D.lastBonus || D.nearBonus) &&
               !(D.lastBonus && forcedTurn() === D.lastBonus);
  box.classList.toggle('hidden', !show);
  if (!show) return;
  const by = D.lastBonusBy, rival = 1 - by;
  const desc = (L.bonusDesc[D.lastBonus] || '')
    .replace('{a}', escapeHtml(D.names[by]))
    .replace('{b}', escapeHtml(D.names[rival]));
  // Рядом может лежать и ловушка, поэтому значок нейтральный: сигнал больше
  // не «иди сюда», а «здесь что-то есть — решай сам»
  box.innerHTML = D.lastBonus
    ? '<span class="b-name">🎁 ' + L.bonusNames[D.lastBonus] + '</span>' +
      '<span class="b-desc">' + desc + '</span>'
    : '<span class="b-name">❓ ' + L.bonusNear + '</span>';
}

// Часы идут на месте: сервер присылает остаток раз в две секунды, а между
// посылками секунды отсчитывает браузер — иначе цифра прыгала бы через одну
let clockTimer = null;

function renderClock() {
  const box = document.getElementById('turnClock');
  if (!box) return;
  const show = online && !D.roundOver && !D.matchOver && online.deadlineAt && !onlineHold();
  box.classList.toggle('hidden', !show);
  if (!show) return;
  const left = Math.max(0, Math.ceil((online.deadlineAt - Date.now()) / 1000));
  const mine = D.cur === online.seat;
  const L = t().online;
  box.textContent = (mine ? L.clockMine : L.clockTheirs).replace('{n}', left);
  box.classList.toggle('low', left <= 10 && left > 0);
  box.classList.toggle('out', left === 0);
}

// Раз в четверть секунды: текст ожидания и отсчёты. Отсчёт 3-2-1 кончился —
// перерисовываем всё: появляется поле ввода и часы хода
let lastHold = null;
function renderFlowTick() {
  const hold = onlineHold();
  if (hold !== lastHold) { lastHold = hold; renderAll(); return; }
  if (hold) document.getElementById('turnBanner').innerHTML = holdText();
  const line = document.getElementById('rNext');
  if (line) line.innerHTML = nextLineText();
}

// Строка под итогом раунда: сколько до следующего и готов ли соперник
function nextLineText() {
  if (!online || !online.nextAt) return '';
  const L = t().online;
  const other = 1 - online.seat;
  let text = L.nextIn.replace('{n}', secsTo(online.nextAt));
  if (online.botSeat === null && online.ready[other]) {
    text += ' · ' + L.oppReady.replace('{name}', escapeHtml(D.names[other]));
  }
  return text;
}

function startClock() {
  stopClock();
  clockTimer = setInterval(() => {
    if (online && screen === 'game') { renderClock(); renderSayBubble(); renderFlowTick(); } else stopClock();
  }, 250);
}

function stopClock() {
  if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
}

function renderForcedTurn() {
  const box = document.getElementById('forcedTurn');
  if (!box) return;
  const kind = forcedTurn();
  box.classList.toggle('hidden', !kind);
  if (!kind) return;
  const L = t();
  document.getElementById('forcedText').textContent =
    L.forced[kind].replace('{a}', D.names[D.cur]);
  document.getElementById('forcedBtn').textContent = L.forcedBtn[kind];
  const canArm = !D.armed && D.tokens[D.cur] > 0 &&
                 (!online || D.cur === online.seat);
  const hint = document.getElementById('forcedHint');
  hint.textContent = canArm ? L.forcedHint[kind] : '';
  hint.classList.toggle('hidden', !canArm);
}

function renderFeedback() {
  const panel = document.getElementById('feedbackPanel');
  const last = currentMove();
  const hide = !last || (mode === 'duel' ? D.roundOver : gameOverType === 'win' || gameOverType === 'lose');
  if (hide) { panel.classList.add('hidden'); return; }
  panel.style.background = last.meta.bg;
  panel.style.border = '1px solid ' + last.meta.color;
  panel.classList.remove('hidden');
  const label = document.getElementById('feedbackLabel');
  label.textContent = getFbText(last.meta);
  // Пояс — помощь для тренировки: там учатся. В игре с другом и в рейтинге его
  // нет, иначе это преимущество, а не учёба
  const band = document.getElementById('feedbackBand');
  const showBand = distanceHint && !isHit(last);
  band.classList.toggle('hidden', !showBand);
  band.textContent = showBand ? last.meta.rangeSign : '';
  band.style.color = last.meta.color;
  panel.classList.toggle('with-band', showBand);
  label.style.color = last.meta.color;
}

function renderThermo() {
  const wrap = document.getElementById('thermoWrap');
  // На итогах градусник только повторяет карточку («в точку!»), а ответ и
  // так отмечен на прямой — убираем его, чтобы итог и история попыток
  // поместились на экран
  const hide = !showThermo || (mode !== 'run' && roundOver());
  wrap.classList.toggle('hidden', hide);
  if (hide) return;

  const fill = document.getElementById('thermoFill');
  const bulb = document.getElementById('thermoBulb');
  const last = currentMove();

  let pct, color;
  if (!last) {
    pct = 8;
    color = TIER_COLORS[0].color;
  } else if (isHit(last)) {
    pct = 100;
    color = BULLSEYE_TIER.color;
  } else {
    pct = Math.round(((last.meta.labelIndex + 1) / 9) * 100);
    color = last.meta.color;
  }

  fill.style.height = pct + '%';
  fill.style.background = color;
  bulb.style.background = color;
  bulb.style.boxShadow = '0 0 18px 2px ' + color + '59';

  if (isHit(last)) {
    bulb.classList.remove('pulse');
    void bulb.offsetWidth; // перезапуск анимации при повторной победе
    bulb.classList.add('pulse');
  } else {
    bulb.classList.remove('pulse');
  }
}

// ================= ЧИСЛОВАЯ ПРЯМАЯ =================
// Игрок знает не точное расстояние, а пояс: «очень горячо» — это 4–10.
// Значит из догадки g следует, что ответ лежит в [g−max; g−min] или [g+min; g+max].
// Эти два участка и закрашиваем: ученик видит, что ответ бывает по обе стороны,
// и что минус — не край мира, а такая же сторона прямой.
const NL = { left: 6, right: 94, axisY: 25, baseY: 45 };

function nlPos(v) {
  const span = Math.max(1, RANGE_MAX - RANGE_MIN);
  const k = (Math.min(RANGE_MAX, Math.max(RANGE_MIN, v)) - RANGE_MIN) / span;
  return NL.left + (NL.right - NL.left) * k;
}

// Шаг делений выбираем круглый и такой, чтобы их поместилось не больше нужного
function nlStep(span, maxCount) {
  return [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000]
    .find(v => span / v <= maxCount) || span;
}

function nlText(x, y, anchor, size, fill, weight, str) {
  return '<text x="' + x + '%" y="' + y + '" text-anchor="' + anchor + '" font-size="' + size +
         '" font-weight="' + weight + '" fill="' + fill + '">' + str + '</text>';
}

// Игрок с выключенной анимацией в системе не должен ничего ловить глазами
function nlCalm() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch (e) { return false; }
}

// Движение точки описываем в самом SVG: разметку прямой мы каждый раз
// собираем заново, и CSS-переход на новом элементе просто не с чего начинать
// begin="indefinite" — обязательное: отсчёт SMIL идёт от загрузки страницы,
// и «begin=0s» на только что вставленном элементе означает «уже давно кончилось».
// Запускаем вручную сразу после вставки разметки, см. nlPlay()
// Длительность живёт в CSS, рядом с переходом градусника: одно значение на
// оба движения, иначе они разъедутся при первой же правке
let moveDurCache = null;
function moveDur() {
  if (moveDurCache === null) {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--move-dur');
    moveDurCache = parseFloat(v) || 0.9;
  }
  return moveDurCache;
}

function nlSlide(attr, from, to) {
  return '<animate attributeName="' + attr + '" from="' + from + '%" to="' + to +
         '%" dur="' + moveDur() + 's" begin="indefinite" fill="freeze" ' +
         // та же кривая, что у перехода градусника (cubic-bezier(.4,0,.2,1)):
         // одинаковой длительности мало, с разной плавностью они всё равно
         // приходят в разное время
         'calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />';
}

function nlFade() {
  return '<animate attributeName="opacity" from="0" to="1" dur="' + moveDur() +
         's" begin="indefinite" fill="freeze" />';
}

function nlPlay(svg) {
  svg.querySelectorAll('animate').forEach(a => {
    try { a.beginElement(); } catch (e) {}
  });
}

// Где стояла точка в прошлый раз и от какого хода. Ключ нужен, чтобы прямая
// не дёргалась на перерисовках без хода — от поворота экрана или кнопки
let nlAnim = { key: null, x: null };
// Что нарисовано сейчас — без движений. Онлайн один ход приносит две-три
// перерисовки подряд (ответ на ход и сигналы Realtime); если прямая от них не
// меняется, её не трогаем — иначе начатое движение обрывалось и точка
// прыгала в конец
let nlDrawn = null;

function nlTick(v, y1, y2, stroke, width) {
  return '<line x1="' + nlPos(v) + '%" y1="' + y1 + '" x2="' + nlPos(v) + '%" y2="' + y2 +
         '" stroke="' + stroke + '" stroke-width="' + width + '" />';
}

// Партия (или раунд в дуэли) кончилась. Вопрос один и тот же в четырёх местах,
// поэтому и ответ на него один
function roundOver() {
  return (mode === 'duel') ? D.roundOver
                           : (gameOverType === 'win' || gameOverType === 'lose');
}

function renderNumberLine() {
  const box = document.getElementById('numLine');
  const svg = document.getElementById('numLineSvg');
  if (!box || !svg) return;
  box.classList.toggle('hidden', !showLine);
  if (!showLine) return;

  const span = Math.max(1, RANGE_MAX - RANGE_MIN);
  // Закрытые ходы на прямой не отмечаем, а залитой точкой обозначаем только
  // настоящий последний ход — если он виден
  const visible = history.slice(-historyVisible())
    .filter(h => !hiddenRow(h.p, h) && !h.timeout);
  const last = currentMove();
  const rings = last ? visible.filter(h => h !== last) : visible;
  let out = '';

  // Сама прямая
  out += '<line x1="' + NL.left + '%" y1="' + NL.axisY + '" x2="' + NL.right + '%" y2="' + NL.axisY +
         '" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" />';

  // Подписей помещается столько, сколько позволяет ширина: считаем её по самому
  // длинному числу на прямой, иначе на узком телефоне они наедут друг на друга.
  // На телефоне шрифт крупнее: читать эти числа должен второклассник с рук
  const w = svg.clientWidth || 320;
  const fs = w < 520 ? 12 : 11;
  const labelPx = Math.max(formatNum(RANGE_MIN).length, formatNum(RANGE_MAX).length) * fs * 0.62 + 9;
  const labelPct = (labelPx / w) * 100;
  // Считаем по той длине, что прямая занимает на самом деле, а не по всей ширине
  const labelRoom = w * (NL.right - NL.left) / 100;
  const labelStep = nlStep(span, Math.max(2, Math.floor(labelRoom / labelPx)));
  const tickStep = nlStep(span, 20);

  for (let v = Math.ceil(RANGE_MIN / tickStep) * tickStep; v <= RANGE_MAX; v += tickStep) {
    if (v === 0 && RANGE_MIN < 0) continue;       // ноль рисуется отдельно и ярче
    out += nlTick(v, NL.axisY + 3, NL.axisY + 7, 'rgba(255,255,255,0.22)', 1.5);
  }

  for (let v = Math.ceil(RANGE_MIN / labelStep) * labelStep; v <= RANGE_MAX; v += labelStep) {
    if (v === 0 && RANGE_MIN < 0) continue;
    const p = nlPos(v);
    // пропускаем только те, что реально налезли бы на подписи границ
    if (Math.abs(p - NL.left) < labelPct || Math.abs(p - NL.right) < labelPct) continue;
    out += nlTick(v, NL.axisY + 3, NL.axisY + 9, 'rgba(255,255,255,0.35)', 1.5);
    out += nlText(p, NL.baseY, 'middle', fs, 'rgba(255,255,255,0.5)', 400, formatNum(v));
  }

  // Ноль отмечаем отдельно — ради него всё и затевалось
  if (RANGE_MIN < 0 && RANGE_MAX > 0) {
    out += nlTick(0, NL.axisY - 7, NL.axisY + 9, 'rgba(255,255,255,0.55)', 1.5);
    out += nlText(nlPos(0), NL.baseY, 'middle', fs, 'rgba(255,255,255,0.75)', 700, '0');
  }

  // Границы диапазона. Их подписи тоже по центру деления, как у остальных:
  // так соседнее число не приходится выбрасывать из-за мнимого наложения
  [RANGE_MIN, RANGE_MAX].forEach(v => {
    out += nlText(nlPos(v), NL.baseY, 'middle', fs, 'rgba(255,255,255,0.5)', 400, formatNum(v));
  });

  // Раунд кончился — число больше не тайна. Словами его и так называют, но на
  // прямой видно то, чего в словах нет: насколько мимо прошли догадки и с
  // какой стороны. Ради этого прямая и нужна
  const revealed = roundOver();

  // Прошлые догадки — полыми кружками, текущая — залитым. После раскрытия
  // залитая точка снимается: ярким на прямой остаётся только ответ
  (revealed ? visible : rings).forEach(h => {
    out += '<circle cx="' + nlPos(h.guess) + '%" cy="' + NL.axisY + '" r="2.5" fill="none" ' +
           'stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />';
  });

  // Новый ход или нет — видно по ключу. Двигаем точку только на новом ходе:
  // так глаз сам замечает, в какую сторону игрок сдвинулся и насколько
  const animKey = history.length + '|' + (last ? last.guess : '-') + '|' + revealed +
                  '|' + RANGE_MIN + '|' + RANGE_MAX;
  const fresh = animKey !== nlAnim.key && !nlCalm();
  let dotX = null;

  if (last && !revealed) {
    const color = isHit(last) ? BULLSEYE_TIER.color : last.meta.color;
    const p = nlPos(last.guess);
    dotX = p;
    // Ехать есть откуда только со второго хода: первому не от чего отталкиваться
    const from = (fresh && nlAnim.x !== null) ? nlAnim.x : null;
    const move = (from === null) ? '' : nlSlide('cx', from, p);
    out += '<circle cx="' + p + '%" cy="' + NL.axisY + '" r="5" fill="#0f1430" stroke="' + color +
           '" stroke-width="2.5">' + (move || (fresh ? nlFade() : '')) + '</circle>';
    // у самого края подпись разворачиваем внутрь, иначе она уезжает за карточку
    const anchor = p < 12 ? 'start' : (p > 88 ? 'end' : 'middle');
    const label = nlText(p, 12, anchor, fs + 3, color, 700, formatNum(last.guess));
    // Подпись едет вместе со своей точкой, иначе число отрывается от неё
    out += (from === null) ? label
                           : label.replace('</text>', nlSlide('x', from, p) + '</text>');
  }

  if (revealed) {
    const p = nlPos(secret);
    const color = BULLSEYE_TIER.color;
    out += nlTick(secret, NL.axisY - 10, NL.axisY + 10, color, 2);
    out += '<circle cx="' + p + '%" cy="' + NL.axisY + '" r="5" fill="' + color +
           '" stroke="#0f1430" stroke-width="1.5">' + (fresh ? nlFade() : '') + '</circle>';
    const anchor = p < 12 ? 'start' : (p > 88 ? 'end' : 'middle');
    out += nlText(p, 12, anchor, fs + 3, color, 700, formatNum(secret));
  }

  if (animKey !== nlAnim.key) nlAnim = { key: animKey, x: dotX };

  const still = out.replace(/<animate [^>]*\/>/g, '');
  if (!fresh && still === nlDrawn && svg.firstChild) return;
  nlDrawn = still;
  svg.innerHTML = out;
  nlPlay(svg);
}

// Партия с человеком ещё не началась: ждём соперника или идёт отсчёт 3-2-1.
// Отменённая — тоже не игра: соперник так и не пришёл
function onlineHold() {
  if (!online) return null;
  if (online.status === 'expired') return 'gone';
  if (online.lobby) return 'lobby';
  if (online.startsAt && online.startsAt > Date.now()) return 'count';
  return null;
}

function secsTo(at) { return Math.max(0, Math.ceil((at - Date.now()) / 1000)); }

function holdText() {
  const L = t().online;
  const other = escapeHtml(D.names[1 - online.seat]);
  const hold = onlineHold();
  if (hold === 'gone') return L.lobbyGone.replace('{name}', other);
  if (hold === 'count') return L.startsIn.replace('{n}', secsTo(online.startsAt)) +
    (online.ladder ? '' : '<small class="tb-note">' + escapeHtml(L.noStars) + '</small>');
  let text = L.waitFor.replace('{name}', other);
  if (online.lobbyEndsAt) {
    const left = secsTo(online.lobbyEndsAt);
    text += ' · ' + L.lobbyCancel.replace('{t}', Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'));
  }
  // Реванш и вызов друга звёзд не дают — сказать до начала, а не после
  if (!online.ladder) text += '<small class="tb-note">' + escapeHtml(L.noStars) + '</small>';
  return text;
}

function renderStatus() {
  const L = t();
  const duel = mode === 'duel';
  const attempts = document.getElementById('attemptsLabel');
  const banner = document.getElementById('turnBanner');
  const confirmed = document.getElementById('tConfirmed');

  // «Число загадано ✓» ничего не сообщало: число загадано всегда. Место
  // остаётся пустым, если сказать нечего, — и строка не переносится
  if (duel) {
    confirmed.textContent = '';
    attempts.textContent = L.roundLabel + D.round;
    attempts.className = 'attempts';
    const hold = onlineHold();
    if (hold) {
      banner.classList.remove('hidden');
      banner.innerHTML = holdText();
      banner.classList.toggle('count', hold === 'count');
      banner.style.borderColor = 'rgba(255,255,255,0.25)';
      banner.style.background = 'rgba(255,255,255,0.06)';
      banner.style.color = '';
    } else if (D.roundOver) { banner.classList.add('hidden'); }
    else {
      banner.classList.remove('count');
      banner.classList.remove('hidden');
      banner.textContent = L.turnOf + D.names[D.cur] + (D.armed ? '  ' + L.tokenArmed : '');
      banner.style.borderColor = P_COLORS[D.cur];
      banner.style.background = 'rgba(255,255,255,0.06)';
      banner.style.color = P_COLORS[D.cur];
    }
    document.getElementById('finalBox').classList.add('hidden');
    document.getElementById('guessSection').classList.toggle('hidden',
      D.roundOver || !!forcedTurn() || (online && (D.cur !== online.seat || !!onlineHold())));
  } else {
    banner.classList.add('hidden');
    // Партия кончилась — «осталось попыток» уже ничего не значит и читается
    // как ошибка. На этом месте полезно то, что игрок и так хочет знать:
    // за сколько ходов вышло
    const over = roundOver();
    const left = MAX_GUESSES - history.length;
    attempts.textContent = over ? withPlural(movesUsed, L.moveForms)
                                : L.attemptsPrefix + left + ' / ' + MAX_GUESSES;
    attempts.className = 'attempts' + (!over && left <= 3 ? ' low' : '');
    document.getElementById('finalBox').classList.toggle('hidden', mode === 'run' || gameOverType !== 'lose_waiting');
    document.getElementById('guessSection').classList.toggle('hidden', gameOver);

    if (mode === 'run') {
      const best = runBest();
      confirmed.innerHTML = L.run.round + '<strong>' + RUN.round + '</strong>&nbsp;&nbsp;' +
                            L.run.score + '<strong>' + RUN.totalScore + '</strong>' +
                            (best ? '&nbsp;&nbsp;<span class="own-best">' + L.run.best +
                                    formatNum(best) + '</span>' : '');
    } else {
      const rec = getRecord(RANGE_MAX);
      // Партия кончилась — рекорд рядом с числом ходов, отдельная строка не нужна
      if (over) {
        confirmed.innerHTML = '';
        if (rec !== null) attempts.textContent += ' · ' + L.recordShort.replace('{n}', rec);
      } else {
        confirmed.innerHTML = (rec === null) ? '' : (L.recordLabel + '<strong>' + rec + '</strong>');
      }
    }
  }
}

function renderResult() {
  const box = document.getElementById('resultBox');
  const L = t();
  box.innerHTML = '';

  // В режиме на рейтинг итогов внутри раунда нет: победа сразу ведёт
  // в следующий раунд, проигрыш — на экран с результатом всей игры
  if (mode === 'run') { box.classList.add('hidden'); return; }

  if (mode === 'duel') {
    if (!D.roundOver) { box.classList.add('hidden'); return; }
    const w = D.roundWinner;
    box.className = 'result-box ' + (D.matchOver ? 'result-win' : 'result-round');

    const title = document.createElement('div');
    title.className = 'r-title';
    title.style.color = D.matchOver ? P_COLORS[w] : '#fff';
    const icon = document.createElement('span');
    icon.className = 'r-icon';
    icon.textContent = D.matchOver ? '🏆' : '🎯';
    title.appendChild(icon);
    title.appendChild(document.createTextNode(D.names[w] + (D.matchOver ? L.matchWin : L.roundWin)));

    // Сетка из трёх колонок: имя стоит ровно над своим счётом
    const score = document.createElement('div');
    score.className = 'r-score';
    score.innerHTML =
      '<div class="rs-name" style="color:' + P_COLORS[0] + '">' + escapeHtml(D.names[0]) + '</div>' +
      '<div></div>' +
      '<div class="rs-name" style="color:' + P_COLORS[1] + '">' + escapeHtml(D.names[1]) + '</div>' +
      '<div class="rs-num" style="color:' + P_COLORS[0] + '">' + D.wins[0] + '</div>' +
      '<div class="r-vs">:</div>' +
      '<div class="rs-num" style="color:' + P_COLORS[1] + '">' + D.wins[1] + '</div>';

    const secretLine = document.createElement('div');
    secretLine.className = 'r-secret';
    secretLine.textContent = L.secretWas + secret;

    // Точность обоих — и нажатие открывает разбор раунда
    // Онлайн разбор — после всей партии: ходы всех раундов база отдаёт
    // только когда партия закончена
    if (online && D.matchOver) loadOnlineReview();
    const drv = currentReview();
    let reviewBtn = null;
    if (drv) {
      reviewBtn = document.createElement('button');
      reviewBtn.className = 'r-review';
      reviewBtn.id = 'reviewBtn';
      const pct = a => a === null ? '—' : a + '%';
      reviewBtn.textContent = '📊 ' + D.names[0] + ' ' + pct(drv.accuracy[0]) + ' · ' +
        D.names[1] + ' ' + pct(drv.accuracy[1]) + ' · ' + L.review.open;
      reviewBtn.onclick = openReview;
    }

    // Рейтинговый матч заканчивается двумя способами, и второй надо назвать
    // словами: иначе победа «из ничего» выглядит ошибкой
    let forfeitLine = null;
    // Партия на звёзды: сколько прибавилось, где теперь, что открылось.
    // Число рейтинга здесь не показываем — его заменяют звёзды
    const starBox = online && D.matchOver && onlineReview && onlineReview.id === online.id && onlineReview.stars
      ? starsResult(onlineReview.stars, online.seat) : null;
    if (online && online.ranked) {
      if (online.forfeitBy !== null && online.forfeitBy !== undefined) {
        forfeitLine = document.createElement('div');
        forfeitLine.className = 'r-forfeit';
        forfeitLine.textContent = online.forfeitBy === online.seat
          ? L.online.rkLeftYou
          : L.online.rkLeftThem.replace('{name}', D.names[online.forfeitBy]);
      }
      // Числа рейтинга игрок не видит никогда: его заменяют лиги и звёзды,
      // а рейтинг незаметно подбирает соперника. Раньше число всплывало,
      // если лига ещё не успела загрузиться (например, после перезагрузки)
    }

    // Партия с человеком без звёзд (реванш, вызов друга): иначе кажется,
    // что звезду не дали по ошибке
    let noStarsLine = null;
    if (online && D.matchOver && online.botSeat === null && !online.ladder) {
      noStarsLine = document.createElement('div');
      noStarsLine.className = 'r-forfeit';
      noStarsLine.textContent = L.online.noStars;
    }

    const actions = document.createElement('div');
    actions.className = 'r-actions';
    if (D.matchOver) {
      // Онлайн-матч переиграть на месте нельзя: новый — это новый вызов
      // Реванш зовёт того же соперника на тех же условиях. Пока приглашение
      // не отправлено — кнопка; после — строка о том, что оно ушло
      actions.innerHTML = online
        ? ((online.rematchSent ? '' :
            '<button class="btn" onclick="offerRematch()">' + L.online.rematch + '</button>') +
           '<button class="btn-ghost" onclick="backToOnline()">' + L.toMenu + '</button>')
        : '<button class="btn" onclick="newMatch()">' + L.newMatch + '</button>' +
          '<button class="btn-ghost" onclick="quitToMenu()">' + L.toMenu + '</button>';
    } else if (online && online.botSeat === null) {
      // С человеком: «Готов». Раунд начнётся, когда готовы оба или выйдет время
      const mine = online.ready[online.seat];
      actions.innerHTML = mine
        ? '<button class="btn" disabled>' + L.online.readyWait.replace('{name}', escapeHtml(D.names[1 - online.seat])) + '</button>'
        : '<button class="btn" onclick="nextRound()">' + L.online.readyBtn + '</button>';
    } else {
      actions.innerHTML = '<button class="btn" onclick="nextRound()">' + L.nextRound + '</button>';
    }
    let nextLine = null;
    if (online && !D.matchOver && online.nextAt) {
      nextLine = document.createElement('div');
      nextLine.className = 'r-next';
      nextLine.id = 'rNext';
      nextLine.innerHTML = nextLineText();
    }
    // Причина стоит сразу под заголовком: иначе «выигрывает игру» рядом со
    // счётом 0:0 читается как ошибка, а не как сдача соперника
    let sentLine = null;
    if (online && online.rematchSent) {
      sentLine = document.createElement('div');
      sentLine.className = 'r-forfeit';
      sentLine.textContent = L.online.rematchSent.replace('{name}', online.rematchSent);
    }

    box.appendChild(title);
    if (forfeitLine) box.appendChild(forfeitLine);
    box.appendChild(score);
    box.appendChild(secretLine);
    if (reviewBtn) box.appendChild(reviewBtn);
    if (starBox) box.appendChild(starBox);
    if (noStarsLine) box.appendChild(noStarsLine);
    if (sentLine) box.appendChild(sentLine);
    box.appendChild(actions);
    if (nextLine) box.appendChild(nextLine);
    box.classList.remove('hidden');
    duelCelebrate(starBox);
    return;
  }

  if (gameOverType === 'win' || gameOverType === 'lose') {
    box.className = 'result-box ' + (gameOverType === 'win' ? 'result-win' : 'result-lose');
    const title = document.createElement('div');
    title.className = 'r-title';
    title.textContent = gameOverType === 'win' ? L.resultWin : (L.resultLose + secret);
    box.appendChild(title);

    if (gameOverType === 'win' && lastWinIsRecord) {
      const rec = document.createElement('div');
      rec.className = 'r-secret r-newrec r-pop';
      rec.textContent = L.newRecord;
      box.appendChild(rec);
    }
    // Салют один раз на партию: ключ — сама история ходов этой партии
    if (gameOverType === 'win') {
      celebrate(history, lastWinIsRecord ? ['🏆', '⭐', '✨', '🎉'] : ['🎉', '✨', '⭐'], lastWinIsRecord);
    }

    // Точность партии сразу в итогах; нажатие открывает разбор ходов
    const rv = mode === 'solo' ? currentReview() : null;
    if (rv) {
      const btn = document.createElement('button');
      btn.className = 'r-review';
      btn.id = 'reviewBtn';
      btn.textContent = '📊 ' + L.review.accuracy + ' ' + rv.accuracy + '% · ' + L.review.open;
      btn.onclick = openReview;
      box.appendChild(btn);
    }

    const actions = document.createElement('div');
    actions.className = 'r-actions';
    actions.innerHTML = '<button class="btn" onclick="resetSolo()">' + L.newGame + '</button>' +
                        '<button class="btn-ghost" onclick="quitToMenu()">' + L.toMenu + '</button>';
    box.appendChild(actions);

    box.classList.remove('hidden');
  } else {
    box.classList.add('hidden');
  }
}

function renderPlayers() {
  const L = t();
  for (let p = 0; p < 2; p++) {
    const card = document.getElementById('pcard' + p);
    card.style.borderColor = P_COLORS[p];
    card.classList.toggle('active', D.cur === p && !D.roundOver);

    const nameEl = document.getElementById('pname' + p);
    nameEl.innerHTML = '<span class="p-dot" style="background:' + P_COLORS[p] + ';color:' + P_COLORS[p] + '"></span>' + escapeHtml(D.names[p]);

    let pips = '';
    for (let i = 0; i < D.winsNeeded; i++) pips += (i < D.wins[p] ? '●' : '○');
    const pipsEl = document.getElementById('ppips' + p);
    pipsEl.textContent = pips;
    pipsEl.style.color = P_COLORS[p];

    const btn = document.getElementById('ptoken' + p);
    const isArmedByMe = D.armed && D.cur === p;
    const canArm = !D.armed && D.tokens[p] > 0;
    // Пока ждём соперника и идёт отсчёт, партии ещё нет — и жетона тоже
    const canUse = !D.roundOver && !D.matchOver && D.cur === p && (isArmedByMe || canArm) && !onlineHold();
    btn.disabled = !canUse;
    btn.classList.toggle('armed', isArmedByMe);
    const count = D.tokens[p] > 1 ? ' ×' + D.tokens[p] : '';
    btn.textContent = (D.armed && D.cur === p) ? L.tokenArmed
                      : (D.tokens[p] === 0 ? L.tokenSpent : L.tokenBtn + count);

    // Что на игроке висит — значками, с полными названиями по наведению
    const flags = [[D.fog[p], '🙈', L.bonusNames.fog],
                   [D.blind[p], '🌫️', L.bonusNames.blind],
                   [D.autoLava[p], '🌋', L.bonusNames.lava],
                   [D.skip[p], '⏭', L.bonusNames.skip],
                   [D.shortMemory[p], '🧠', L.bonusNames.memory]].filter(f => f[0]);
    const eff = document.getElementById('peff' + p);
    eff.textContent = flags.map(f => f[1]).join('');
    eff.title = flags.map(f => f[2]).join(', ');
  }
}

function renderHistory() {
  const section = document.getElementById('historySection');
  const list = document.getElementById('historyList');
  if (history.length === 0) { section.classList.add('hidden'); list.innerHTML = ''; return; }
  section.classList.remove('hidden');
  list.innerHTML = '';

  // Оценка хода, как на chess.com: в тренировке — сразу после хода,
  // в игре с другом — после раунда
  const rv0 = currentReview(true);
  // Разбор онлайн-партии идёт по всем раундам, а в истории — последние ходы
  // последнего: значки к ним не привязать
  const rv = rv0 && rv0.match ? null : rv0;

  // Видны только последние ходы: остальное игрок держит в голове. Номера
  // остаются настоящими, поэтому пропуск виден и без пояснений
  history.slice(-historyVisible()).reverse().forEach((h, i) => {
    const realIndex = history.length - i;
    const item = document.createElement('div');
    item.className = 'history-item';
    const masked = hiddenRow(h.p, h);
    const accent = masked ? 'rgba(255,255,255,0.2)'
                          : ((h.p === null || h.p === undefined) ? h.meta.color : P_COLORS[h.p]);
    item.style.borderLeft = '3px solid ' + accent;
    const who = (h.p === null || h.p === undefined)
      ? ''
      : '<span class="h-who" style="color:' + P_COLORS[h.p] + '">' + escapeHtml(D.names[h.p]) + '</span>';
    item.innerHTML = h.timeout
      ? '<span class="h-num">#' + realIndex + '</span>' + who +
        '<span class="h-guess h-masked">—</span>' +
        '<span class="h-label h-masked">\u23f1\ufe0f ' + t().online.timedOut + '</span>'
      : masked
      ? '<span class="h-num">#' + realIndex + '</span>' + who +
        '<span class="h-guess h-masked">•••</span><span class="h-label h-masked">🙈</span>'
      : '<span class="h-num">#' + realIndex + '</span>' + who +
        '<span class="h-guess">' + h.guess + '</span>' +
        '<span class="h-label" style="color:' + h.meta.color + '">' + getFbText(h.meta) + '</span>';
    // У угаданного хода значок не нужен: «🎯 В точку!» уже написано
    // Оценка — второй строкой под ответом: в одну строку на телефоне не влезает
    if (rv && rv.moves[realIndex - 1] && rv.moves[realIndex - 1].grade !== 'hit') {
      const label = item.querySelector('.h-label');
      const side = document.createElement('span');
      side.className = 'h-side';
      label.replaceWith(side);
      side.append(label, gradeLine(rv.moves[realIndex - 1], 'h-grade'));
    }
    list.appendChild(item);
  });
}

// ================= РАЗБОР ПАРТИИ =================
// Как на chess.com: после партии каждый ход получает оценку, и видно, какой
// ход был лучшим. Считается точно, перебором: диапазоны не больше 2001
// числа, и для каждого возможного хода считаем, сколько информации он даёт.
//
// После каждого ответа («горячо», «холодно»…) часть чисел становится
// невозможной. Ход тем лучше, чем ровнее он делит оставшиеся числа по
// поясам: тогда любой ответ отсекает много. Мера — энтропия в битах
// (ожидаемое число «да/нет», которое даёт ход). Оценка — доля от лучшего
// возможного хода в этой же позиции
const GRADES = ['brilliant', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];
const GRADE_ICON = { brilliant: '!!', best: '★', excellent: '👍', good: '✓',
                     inaccuracy: '?!', mistake: '?', blunder: '??', hit: '🎯', forced: '🌋', limited: '🙈' };
const GRADE_COLOR = { brilliant: '#1baca6', best: '#81b64c', excellent: '#81b64c', good: '#95b776',
                      inaccuracy: '#f7c631', mistake: '#ffa459', blunder: '#fa412d', hit: '#4ade80',
                      forced: 'rgba(255,255,255,0.25)', limited: 'rgba(255,255,255,0.25)' };
// Пороги доли от лучшего хода. Блестящий — лучший ход (кроме первого),
// который не совпадает с «очевидной серединой»: его нашёл тот, кто понимает
// пояса, а не просто делит отрезок пополам
const GRADE_LIMITS = [['excellent', 0.9], ['good', 0.75], ['inaccuracy', 0.5], ['mistake', 0.2]];
const BEST_EPS = 1e-6;

// Пояса расстояний: от «очень холодно» (0) до «лава» (7); «в точку» — 8.
// У самого холодного пояса верхней границы нет: в «морозе и жаре»
// расстояние бывает больше диапазона
function reviewBands(meta) {
  return meta.filter(m => m.labelIndex < 8)
    .map(m => ({ lo: m.min, hi: m.labelIndex === 0 ? Infinity : m.max, idx: m.labelIndex }));
}

function bandOf(d, bands) {
  if (d === 0) return 8;
  const b = bands.find(x => d >= x.lo && d <= x.hi);
  return b ? b.idx : 0;
}

// Информационная сторона позиции: сколько бит даёт каждый возможный ход.
// Общая для тренировки, дуэли и (позже) бота
function infoScan(cand, min, max, bands) {
  const N = max - min + 1;
  const P = new Int32Array(N + 1);
  for (let i = 0; i < N; i++) P[i + 1] = P[i] + cand[i];
  const total = P[N];
  const count = (a, b) => {
    const ia = Math.max(a, min) - min, ib = Math.min(b, max) - min;
    return ia > ib ? 0 : P[ib + 1] - P[ia];
  };
  const H = x => {
    let h = 0;
    const add = c => { if (c > 0) { const p = c / total; h -= p * Math.log2(p); } };
    add(x >= min && x <= max ? cand[x - min] : 0);
    for (const b of bands) add(count(x - b.hi, x - b.lo) + count(x + b.lo, x + b.hi));
    return h;
  };
  let hBest = -1;
  const hs = new Float64Array(N);
  for (let x = min; x <= max; x++) {
    const h = H(x);
    hs[x - min] = h;
    if (h > hBest) hBest = h;
  }
  // Лучших ходов бывает несколько. Сначала — те, что могут сразу попасть
  // в загаданное (когда осталось одно число, информации не даёт ни один
  // ход, и лучший — само это число), потом — ближайший к сделанному
  const pickBest = g => {
    let best = null;
    for (let x = min; x <= max; x++) {
      if (hs[x - min] < hBest - BEST_EPS) continue;
      if (best === null) { best = x; continue; }
      const cx = cand[x - min], cb = cand[best - min];
      if (cx !== cb ? cx > cb : Math.abs(x - g) < Math.abs(best - g)) best = x;
    }
    return best;
  };
  return { total, H, hBest, pickBest };
}

// Оценка по доле от лучшего; «блестяще» — лучший ход (не первый), который не
// совпадает с очевидной серединой
function gradeOf(r, isFirst, total, midRatio, isMid) {
  if (r >= 1 - BEST_EPS) {
    return (!isFirst && total >= 6 && midRatio < 0.97 && !isMid) ? 'brilliant' : 'best';
  }
  for (const [name, lim] of GRADE_LIMITS) { if (r >= lim) return name; }
  return 'blunder';
}

// Процент качества хода. 100% — только у лучшего: «Отлично 100%» рядом
// с «Лучший 100%» сбивало бы с толку, поэтому не лучший ход — не выше 99%
function movePct(r) {
  return Math.min(99, Math.round(r * 100));
}

function hullMid(cand, min) {
  return Math.round((cand.indexOf(1) + cand.lastIndexOf(1)) / 2) + min;
}

function narrow(cand, min, bands, g, labelIndex) {
  for (let i = 0; i < cand.length; i++) {
    if (cand[i] && bandOf(Math.abs(g - (i + min)), bands) !== labelIndex) cand[i] = 0;
  }
}

// moves — [{ guess, labelIndex }] по порядку; final — последняя догадка или null
function analyseGame(moves, min, max, meta, final) {
  const N = max - min + 1;
  const bands = reviewBands(meta);
  const cand = new Uint8Array(N).fill(1);
  const out = [];
  const steps = moves.map(m => ({ guess: m.guess, labelIndex: m.labelIndex, final: false }));
  if (final !== null && final !== undefined) steps.push({ guess: final, labelIndex: null, final: true });

  for (const step of steps) {
    const g = step.guess;
    const inCand = g >= min && g <= max && cand[g - min] === 1;
    if (!cand.includes(1)) break;
    let res;
    if (step.final) {
      // Последняя догадка без подсказки: лучший ход — любое из возможных чисел
      const firstCand = cand.indexOf(1) + min;
      res = { guess: g, final: true, grade: inCand ? 'best' : 'blunder', score: inCand ? 100 : 0,
              best: inCand ? g : firstCand };
    } else {
      const scan = infoScan(cand, min, max, bands);
      const best = scan.pickBest(g);
      const r = scan.hBest > 0 ? scan.H(g) / scan.hBest : 0;
      let grade;
      if (step.labelIndex === 8) grade = 'hit';
      else if (scan.total === 1) grade = 'blunder';     // ответ был уже известен
      else {
        const mid = hullMid(cand, min);
        // Первый ход — как дебют в шахматах: лучший первый ход один и тот же
        // для диапазона, его можно просто запомнить. «Блестяще» за него не даём
        grade = gradeOf(r, out.length === 0, scan.total, scan.H(mid) / scan.hBest, g === mid);
      }
      const score = (grade === 'hit' || grade === 'brilliant' || grade === 'best') ? 100 : movePct(r);
      res = { guess: g, final: false, grade, score, best, ratio: r };
      // Ответ отсекает всё, что с ним не сходится
      narrow(cand, min, bands, g, step.labelIndex);
    }
    out.push(res);
  }
  const accuracy = out.length ? Math.round(out.reduce((a, m) => a + m.score, 0) / out.length) : 0;
  return { moves: out, accuracy };
}

// ---------- Дуэль ----------
// Оба видят все ходы, поэтому ход, дающий много информации, помогает и
// сопернику. Пока чисел много, угадать сразу почти нельзя, и мера та же, что
// в тренировке, — информация. Когда их осталось DUEL_EXACT и меньше,
// считаем точно: вероятность угадать первым, если дальше оба играют лучше
// всех. Иногда выгоднее рискнуть и назвать число, иногда — не дать
// сопернику подсказку
const DUEL_EXACT = 10;

// Все разные разбиения набора чисел, которые может дать какой-нибудь ход.
// Разбиение меняется, только когда |g − s| переходит границу пояса, поэтому
// достаточно проверить ходы у этих границ
function duelSplits(S, min, max, bands) {
  const edges = [0];
  bands.forEach(b => { edges.push(b.lo); if (b.hi !== Infinity) edges.push(b.hi + 1); });
  const pts = new Set([min, max]);
  S.forEach(s => edges.forEach(e => [s - e, s + e].forEach(v => [v - 1, v, v + 1].forEach(x => {
    if (x >= min && x <= max) pts.add(x);
  }))));
  const seen = new Map();
  for (const g of pts) {
    const sp = splitOf(S, g, bands);
    // «Пас» — ход, который ничего не отсекает и не может попасть: соперник
    // получает ту же позицию. В поиске лучшего хода его нет, иначе два
    // идеальных игрока пасовали бы бесконечно
    if (sp.parts.length === 1 && !sp.parts[0].hit) continue;
    const key = S.map(s => bandOf(Math.abs(g - s), bands)).join(',');
    if (!seen.has(key)) seen.set(key, Object.assign(sp, { g }));
  }
  return [...seen.values()];
}

function splitOf(S, g, bands) {
  const parts = {};
  S.forEach(s => { const k = bandOf(Math.abs(g - s), bands); (parts[k] || (parts[k] = [])).push(s); });
  return { parts: Object.keys(parts).map(k => ({ hit: k === '8', set: parts[k] })) };
}

// Вероятность угадать первым тому, кто ходит сейчас; memo — общий на партию
function duelWin(S, min, max, bands, memo) {
  const key = S.join(',');
  if (memo.has(key)) return memo.get(key);
  let best = 0;
  for (const sp of duelSplits(S, min, max, bands)) {
    const v = duelMoveValue(sp, S.length, false, min, max, bands, memo);
    if (v > best) best = v;
  }
  memo.set(key, best);
  return best;
}

// Ценность хода: попал — выиграл; иначе ходит соперник (или снова я, если
// у меня следующий ход — жетон или пропуск у соперника)
function duelMoveValue(sp, n, sameNext, min, max, bands, memo) {
  let v = 0;
  for (const part of sp.parts) {
    const p = part.set.length / n;
    if (part.hit) { v += p; continue; }
    // Пас: позиция та же, её ценность — уже посчитанная (или считаемая) для S
    const w = duelWin(part.set, min, max, bands, memo);
    v += p * (sameNext ? w : 1 - w);
  }
  return v;
}

// moves — [{ guess, labelIndex, p, forced, limited }] раунда по порядку
function analyseDuel(moves, min, max, meta) {
  const N = max - min + 1;
  const bands = reviewBands(meta);
  const cand = new Uint8Array(N).fill(1);
  const memo = new Map();
  const out = [];
  moves.forEach((m, k) => {
    const g = m.guess;
    const next = moves[k + 1];
    const sameNext = !!next && next.p === m.p;
    let res;
    if (m.forced || m.limited) {
      res = { guess: g, p: m.p, grade: m.forced ? 'forced' : 'limited', score: null, best: null };
    } else if (m.labelIndex === 8) {
      res = { guess: g, p: m.p, grade: 'hit', score: 100, best: g };
    } else {
      const S = [];
      for (let i = 0; i < N; i++) if (cand[i]) S.push(i + min);
      let r, best, midRatio, isMid;
      const mid = hullMid(cand, min);
      if (S.length > DUEL_EXACT) {
        const scan = infoScan(cand, min, max, bands);
        best = scan.pickBest(g);
        r = scan.hBest > 0 ? scan.H(g) / scan.hBest : 0;
        midRatio = scan.hBest > 0 ? scan.H(mid) / scan.hBest : 1;
      } else {
        const splits = duelSplits(S, min, max, bands);
        const valOf = x => duelMoveValue(splitOf(S, x, bands), S.length, sameNext, min, max, bands, memo);
        let vBest = -1;
        splits.forEach(sp => { sp.v = duelMoveValue(sp, S.length, sameNext, min, max, bands, memo); if (sp.v > vBest) vBest = sp.v; });
        // Лучший ход для показа: с лучшей ценностью, попадающий, ближайший.
        // Ценности разбиений уже запомнены, так что перебор всех ходов дешёвый
        best = null;
        for (let x = min; x <= max; x++) {
          if (valOf(x) < vBest - BEST_EPS) continue;
          if (best === null) { best = x; continue; }
          const cx = cand[x - min], cb = cand[best - min];
          if (cx !== cb ? cx > cb : Math.abs(x - g) < Math.abs(best - g)) best = x;
        }
        // Пас бывает выгоднее хода, который дарит сопернику подсказку, —
        // тогда доля больше единицы, и это честно «лучший»
        r = vBest > 0 ? Math.min(1, valOf(g) / vBest) : 0;
        midRatio = vBest > 0 ? valOf(mid) / vBest : 1;
      }
      isMid = g === mid;
      const grade = S.length === 1 ? 'blunder' : gradeOf(r, k === 0, S.length, midRatio, isMid);
      const score = (grade === 'brilliant' || grade === 'best') ? 100 : movePct(r);
      res = { guess: g, p: m.p, grade, score, best, ratio: r };
    }
    narrow(cand, min, bands, g, m.labelIndex);
    out.push(res);
  });
  const acc = p => {
    const own = out.filter(x => x.p === p && x.score !== null);
    return own.length ? Math.round(own.reduce((a, x) => a + x.score, 0) / own.length) : null;
  };
  return { moves: out, accuracy: [acc(0), acc(1)] };
}

// Разбор текущей партии тренировки или раунда игры с другом — только когда
// он закончился. Онлайн — позже
let reviewCache = null;
// ---------- Разбор онлайн-партии ----------
// Ходы всех раундов приходят с сервера после конца партии. Каждый раунд
// разбирается дуэльным движком отдельно, точность — по всем ходам партии
let onlineReview = null;   // { id, data } — data: null, пока не пришло или не вышло

async function loadOnlineReview() {
  if (!online || (onlineReview && onlineReview.id === online.id)) return;
  const id = online.id;
  onlineReview = { id, data: null };
  let res;
  try {
    res = await friendRpc('match_review', { p_match_id: id });
  } catch (e) {
    return;   // старая база без разбора — кнопки просто нет
  }
  if (!online || online.id !== id || !res || !Array.isArray(res.moves)) return;
  onlineReview = { id, data: analyseOnlineMatch(res.moves), stars: res.stars || null };
  renderAll();
}

// Салют в дуэли: с другом на одном телефоне — любому выигранному раунду,
// с ботом и онлайн — только своему. Партия и новая лига — побольше, с фанфарами
function duelCelebrate(starBox) {
  if (!D.roundOver) return;
  const mine = online ? online.seat : (vsBot ? 0 : D.roundWinner);
  if (D.roundWinner !== mine) return;
  const key = online ? 'o:' + online.id + ':' + D.round + (D.matchOver ? ':m' : '') : history;
  const newLeague = !!(starBox && starBox.querySelector('.r-pop'));
  const icons = newLeague ? [LEAGUE_ICONS[ladderPos(onlineReview.stars.after[online.seat]).league], '⭐', '✨']
                          : ['🎉', '✨', '⭐'];
  // Итог онлайн-партии приходит двумя шагами: сначала раунд, потом звёзды.
  // Новая лига — отдельный повод, даже если за раунд салют уже был
  celebrate(newLeague ? key + ':lg' : key, icons, D.matchOver || newLeague);
}

function starsResult(stars, seat) {
  const L = t().online;
  const d = (stars.delta || [])[seat];
  const after = (stars.after || [])[seat];
  if (typeof d !== 'number' || typeof after !== 'number') return null;
  const box = document.createElement('div');
  box.className = 'r-stars';
  const was = after - d;
  const main = document.createElement('div');
  main.className = 'r-stars-main';
  // Легенда: звёзд больше нет, остаётся лига
  const change = after >= 150 && was >= 150 ? '' : (d > 0 ? '+' + d + ' ★' : d < 0 ? '−' + (-d) + ' ★' : '±0 ★');
  main.textContent = (change ? change + ' · ' : '') + leagueLabel(after) + (after < 150 ? ' ' + starsLine(after) : '');
  box.appendChild(main);
  const note = document.createElement('div');
  note.className = 'r-stars-note';
  const lines = [];
  if (d === 2) lines.push(L.lgStreak);
  if (d === 0 && after < 150 && after % 15 === 0 && D.roundWinner !== seat) lines.push(L.lgFloor);
  // Проиграл, а звезда на месте и это не ступень — значит, Ученик
  else if (d === 0 && after < 150 && D.roundWinner !== seat) lines.push(t().tut.lgApprentice);
  const promoted = ladderPos(after).league > ladderPos(was).league;
  if (promoted) lines.push(L.lgNew.replace('{l}', leagueLabel(after).replace(/ \d+$/, '')));
  const unlock = (stars.unlock || [])[seat];
  if (typeof unlock === 'number') {
    const got = LEAGUE_REWARDS.filter(r => r.league === unlock && r.kind === 'icon').map(r => r.value).join(' ');
    lines.push(L.lgUnlock.replace('{x}', got));
  }
  note.textContent = lines.join(' · ');
  if (lines.length) box.appendChild(note);
  if (promoted) main.classList.add('r-pop');
  return box;
}

function analyseOnlineMatch(list) {
  const rounds = [...new Set(list.map(m => m.round))].sort((a, b) => a - b);
  const moves = [];
  const info = [];
  rounds.forEach(r => {
    // Пропуск по времени — не ход: оценивать нечего, но очередь он передал,
    // и это движок видит по тому, кто ходит следующим
    const played = list.filter(m => m.round === r && !m.timeout && m.guess !== null && m.guess !== undefined);
    const hit = played.find(m => m.tier === 8);
    info.push({ round: r, winner: hit ? hit.seat : null });
    if (!played.length) return;
    const rv = analyseDuel(played.map(m => ({ guess: m.guess, labelIndex: m.tier, p: m.seat,
                                              forced: !!m.forced, limited: !!m.limited })),
                           RANGE_MIN, RANGE_MAX, FEEDBACK_META);
    rv.moves.forEach(x => moves.push(Object.assign(x, { round: r })));
  });
  const acc = p => {
    const own = moves.filter(x => x.p === p && x.score !== null);
    return own.length ? Math.round(own.reduce((a, x) => a + x.score, 0) / own.length) : null;
  };
  return { duel: true, match: true, moves, rounds: info, accuracy: [acc(0), acc(1)] };
}

// live — оценки уже во время тренировки: каждая считается только по ходам
// до неё, поэтому после партии они те же. Лучший ход при этом не показываем
function currentReview(live) {
  if (online) {
    return (D.matchOver && onlineReview && onlineReview.id === online.id) ? onlineReview.data : null;
  }
  if (mode === 'duel' && !online && D.roundOver) {
    const key = 'duel:' + D.round + ':' + history.length + ':' + secret;
    if (reviewCache && reviewCache.key === key) return reviewCache.data;
    const data = analyseDuel(history.map(h => ({ guess: h.guess, labelIndex: h.meta.labelIndex, p: h.p,
                                                 forced: !!h.forced, limited: !!h.limited })),
                             RANGE_MIN, RANGE_MAX, FEEDBACK_META);
    data.duel = true;
    reviewCache = { key, data };
    return data;
  }
  if (mode !== 'solo' || online) return null;
  if (!(gameOverType === 'win' || gameOverType === 'lose') && !live) return null;
  const key = history.length + ':' + finalGuessValue + ':' + secret;
  if (reviewCache && reviewCache.key === key) return reviewCache.data;
  const data = analyseGame(history.map(h => ({ guess: h.guess, labelIndex: h.meta.labelIndex })),
                           RANGE_MIN, RANGE_MAX, FEEDBACK_META, finalGuessValue);
  if (finalGuessValue !== null && finalGuessValue === secret && data.moves.length) {
    data.moves[data.moves.length - 1].grade = 'hit';
  }
  reviewCache = { key, data };
  return data;
}

function gradeBadge(grade) {
  const b = document.createElement('span');
  b.className = 'gr-badge gr-' + grade;
  b.style.background = GRADE_COLOR[grade];
  b.textContent = GRADE_ICON[grade];
  return b;
}

// «👍 Отлично 92%». У хода без оценки (лава, туман) процента нет
function gradeLine(m, cls) {
  const box = document.createElement('span');
  box.className = cls;
  box.dataset.grade = m.grade;
  const name = document.createElement('span');
  name.className = 'g-name';
  name.style.color = GRADE_COLOR[m.grade];
  name.textContent = t().review.grades[m.grade];
  box.append(gradeBadge(m.grade), name);
  if (m.grade !== 'hit' && m.score !== null && m.score !== undefined) {
    const pct = document.createElement('span');
    pct.className = 'g-pct';
    pct.textContent = m.score + '%';
    box.appendChild(pct);
  }
  return box;
}

function openReview() {
  const rv = currentReview();
  if (!rv) return;
  const L = t();
  document.getElementById('tReviewTitle').textContent = (rv.duel && !rv.match) ? L.review.titleRound : L.review.title;
  const accBox = document.getElementById('rvAcc');
  accBox.innerHTML = '';
  if (rv.duel) {
    // У каждого своя точность — цветом игрока
    [0, 1].forEach(p => {
      const el = document.createElement('span');
      el.className = 'rv-acc-player';
      el.style.color = P_COLORS[p];
      const name = document.createElement('small');
      name.textContent = D.names[p];
      el.append(name, document.createTextNode(rv.accuracy[p] === null ? '—' : rv.accuracy[p] + '%'));
      accBox.appendChild(el);
    });
  } else {
    accBox.textContent = rv.accuracy + '%';
  }
  document.getElementById('tRvAcc').textContent = L.review.accuracy;
  document.getElementById('tReviewClose').textContent = L.run.done;
  // Сводка: сколько ходов какого класса — только те, что были
  const sum = document.getElementById('rvSum');
  sum.innerHTML = '';
  ['hit', ...GRADES, 'forced', 'limited'].forEach(gr => {
    const n = rv.moves.filter(m => m.grade === gr).length;
    if (!n) return;
    const chip = document.createElement('span');
    chip.className = 'rv-chip';
    chip.dataset.grade = gr;
    chip.appendChild(gradeBadge(gr));
    chip.appendChild(document.createTextNode(' ' + n));
    chip.title = L.review.grades[gr];
    sum.appendChild(chip);
  });
  const list = document.getElementById('rvList');
  list.innerHTML = '';
  let lastRound = null;
  let inRound = 0;
  rv.moves.forEach((m, i) => {
    // Партия онлайн — несколько раундов: перед каждым подпись и кто выиграл
    if (rv.match && m.round !== lastRound) {
      lastRound = m.round;
      inRound = 0;
      const head = document.createElement('div');
      head.className = 'rv-round';
      head.dataset.round = m.round;
      const r = rv.rounds.find(x => x.round === m.round);
      head.textContent = L.review.round.replace('{n}', m.round) +
        (r && r.winner !== null ? ' · 🎯 ' + D.names[r.winner] : '');
      list.appendChild(head);
    }
    inRound++;
    const row = document.createElement('div');
    row.className = 'rv-row';
    row.dataset.grade = m.grade;
    const num = document.createElement('span');
    num.className = 'rv-num';
    num.textContent = '#' + (rv.match ? inRound : i + 1);
    if (rv.duel) {
      row.style.borderLeft = '3px solid ' + P_COLORS[m.p];
      row.dataset.p = m.p;
    }
    const guess = document.createElement('span');
    guess.className = 'rv-guess';
    guess.textContent = m.guess;
    row.append(num, guess, gradeLine(m, 'rv-grade'));
    if (m.final) {
      const note = document.createElement('span');
      note.className = 'rv-final';
      note.textContent = L.review.finalGuess;
      row.appendChild(note);
    }
    list.appendChild(row);
  });
  document.getElementById('reviewModal').classList.remove('hidden');
}

function closeReview() {
  document.getElementById('reviewModal').classList.add('hidden');
}

// Удалённый аккаунт хранится под служебным именем с решёткой: показывать
// его как есть незачем, но и терять из истории тоже нельзя
function playerName(name) {
  const n = String(name == null ? '' : name);
  const bot = botOf(n);
  if (bot) return botName(bot);
  return n.charAt(0) === '#' ? t().online.deletedPlayer : n;
}

// ================= БОТЫ =================
// Пять персонажей от слабого к сильному. Тот же список — в базе
// (bot_personas), сверяется тестом. level — сила в игре без интернета;
// в рейтинге силу подбирает сервер под игрока. Бот всегда подписан 🤖:
// выдавать его за человека нельзя
const BOTS = [
  { id: '@bot:turtle', key: 'turtle', icon: '🐢', color: '#34d399', level: 0.1, think: [2, 4], greet: 'hi', react: 'wow' },
  { id: '@bot:panda', key: 'panda', icon: '🐼', color: '#e2e8f0', level: 0.3, think: [1.5, 3.5], greet: 'hi', react: 'nice' },
  { id: '@bot:dolphin', key: 'dolphin', icon: '🐬', color: '#60a5fa', level: 0.5, think: [1.5, 3], greet: 'luck', react: 'nice' },
  { id: '@bot:fox', key: 'fox', icon: '🦊', color: '#fb923c', level: 0.7, think: [1, 2.5], greet: 'luck', react: 'almost' },
  { id: '@bot:owl', key: 'owl', icon: '🦉', color: '#a78bfa', level: 0.9, think: [1.5, 3], greet: 'luck', react: 'wow' }
];

function botOf(name) {
  const n = String(name == null ? '' : name).toLowerCase();
  return BOTS.find(b => b.id === n) || null;
}

function botName(bot) {
  return bot.icon + ' ' + t().bots[bot.key] + ' 🤖';
}

// ================= ЛИГИ =================
// Та же лестница — в базе (ladder). Звёзды 0…149 — пять лиг по десять
// рангов (10 → 1) по три звезды; 150 — Легенда
const LEAGUE_ICONS = ['🥉', '🥈', '🥇', '💠', '💎', '👑'];
// Награды за лигу, достигнутую хоть раз. Копия — в базе (league_rewards),
// сверяется тестом
const LEAGUE_REWARDS = [
  { league: 1, kind: 'icon', value: '🦅' }, { league: 1, kind: 'icon', value: '🐺' }, { league: 1, kind: 'color', value: '#94a3b8' },
  { league: 2, kind: 'icon', value: '🦚' }, { league: 2, kind: 'icon', value: '🐉' }, { league: 2, kind: 'color', value: '#eab308' },
  { league: 3, kind: 'icon', value: '🦩' }, { league: 3, kind: 'icon', value: '🐳' }, { league: 3, kind: 'color', value: '#14b8a6' },
  { league: 4, kind: 'icon', value: '🦖' }, { league: 4, kind: 'icon', value: '🦜' }, { league: 4, kind: 'color', value: '#0ea5e9' },
  { league: 5, kind: 'icon', value: '👑' }, { league: 5, kind: 'icon', value: '🌟' }, { league: 5, kind: 'color', value: '#d946ef' }
];
// Своя лестница с сервера. null — сервер лиг не знает (или ещё не ответил):
// тогда всё выглядит по-старому, с числом рейтинга
let ladderInfo = null;

function ladderPos(stars) {
  if (stars >= 150) return { league: 5, rank: null, inRank: 0, legend: true };
  return { league: Math.floor(stars / 30), rank: 10 - Math.floor((stars % 30) / 3),
           inRank: stars % 3, legend: false };
}

function leagueLabel(stars) {
  const p = ladderPos(stars);
  return LEAGUE_ICONS[p.league] + ' ' + t().leagues[p.league] + (p.legend ? '' : ' ' + p.rank);
}

function starsLine(stars) {
  const p = ladderPos(stars);
  return p.legend ? '' : '★'.repeat(p.inRank) + '☆'.repeat(3 - p.inRank);
}

function seasonMonth(season) {
  try {
    return new Intl.DateTimeFormat(currentLang, { month: 'long', timeZone: 'UTC' })
      .format(new Date(season + '-15T00:00:00Z'));
  } catch (e) { return season; }
}

function rewardLeague(kind, value) {
  const r = LEAGUE_REWARDS.find(x => x.kind === kind && x.value === value);
  return r ? r.league : 0;
}

// Открыта ли награда: лига, до которой игрок хоть раз дошёл
function rewardOpen(kind, value) {
  return !!ladderInfo && (ladderInfo.peak || 0) >= rewardLeague(kind, value);
}

async function loadLadder() {
  if (!runAuth()) return null;
  try {
    const st = await friendRpc('ladder_status');
    ladderInfo = (st && typeof st === 'object' && 'stars' in st) ? st : null;
  } catch (e) {
    ladderInfo = null;
  }
  if (ladderInfo && ladderInfo.summary) showSeasonSummary(ladderInfo.summary);
  return ladderInfo;
}

// ---------- итоги сезона ----------
// Сезон сменился — один раз показываем, чем кончился прошлый. База помнит,
// что итоги видели, поэтому на другом устройстве они второй раз не всплывут
let seasonShown = null;
function showSeasonSummary(sm) {
  if (!sm || !sm.season || seasonShown === sm.season) return;
  seasonShown = sm.season;
  const P = t().prog;
  const L = t();
  const lg = Math.max(0, Math.min(5, sm.league || 0));
  document.getElementById('ssTitle').textContent = P.ssTitle.replace('{season}',
    seasonMonth(sm.season) + ' ' + String(sm.season).slice(0, 4));
  const big = document.createElement('span');
  big.className = 'big';
  big.textContent = LEAGUE_ICONS[lg];
  const box = document.getElementById('ssLeague');
  box.replaceChildren(big, document.createTextNode(L.leagues[lg]));
  document.getElementById('ssBest').textContent = P.ssBest.replace('{league}', leagueLabel(sm.best || 0));
  document.getElementById('ssGames').textContent = P.ssGames.replace('{g}', sm.games || 0).replace('{w}', sm.wins || 0);
  document.getElementById('ssNow').textContent = ladderInfo
    ? P.ssNow.replace('{league}', leagueLabel(ladderInfo.stars)) : '';
  document.getElementById('ssBadge').textContent = P.ssBadge;
  document.getElementById('ssGo').textContent = P.ssGo;
  document.getElementById('seasonModal').classList.remove('hidden');
}

function closeSeasonSummary() {
  document.getElementById('seasonModal').classList.add('hidden');
  if (seasonShown) friendRpc('season_summary_seen', { p_season: seasonShown }).catch(() => {});
}

// ---------- задания дня и достижения ----------
// Иконки за серию дней. Копия — в базе (quest_rewards), сверяется тестом
const QUEST_ICONS = [{ days: 3, icon: '🔥' }, { days: 7, icon: '🚀' }, { days: 14, icon: '🌋' }, { days: 30, icon: '🌈' }];
// Порядок и коды — как в базе (achievement_codes), сверяется тестом
const ACHIEVEMENTS = [
  { code: 'first_win', icon: '🎉' }, { code: 'wins_10', icon: '💪' }, { code: 'wins_50', icon: '🏆' },
  { code: 'streak_3', icon: '⚡' }, { code: 'league_gold', icon: '🥇' }, { code: 'league_diamond', icon: '💎' },
  { code: 'legend', icon: '👑' }, { code: 'run_5', icon: '🧗' }, { code: 'run_10', icon: '🏔️' },
  { code: 'friends_3', icon: '🤝' }, { code: 'quests_7', icon: '📅' }, { code: 'tutorial', icon: '🎓' }
];

// Что сервер знает о заданиях и достижениях. null — не знаем: нет входа,
// нет сети или миграция не применена. Тогда карточки нет вовсе
let progressInfo = null;

async function loadProgress() {
  if (!runAuth() || !sb) {
    progressInfo = null;
    renderQuestCard();
    return null;
  }
  let tz = null;
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch (e) {}
  try {
    const p = await friendRpc('my_progress', { p_tz: tz });
    progressInfo = (p && typeof p === 'object' && Array.isArray(p.quests)) ? p : null;
  } catch (e) {
    progressInfo = null;
  }
  renderQuestCard();
  return progressInfo;
}

function questIconDays(icon) {
  const q = QUEST_ICONS.find(x => x.icon === icon);
  return q ? q.days : 0;
}

function questIconOpen(icon) {
  return !!progressInfo && (progressInfo.bestStreak || 0) >= questIconDays(icon);
}

function timeLeftText(sec) {
  const P = t().prog;
  const h = Math.floor(sec / 3600);
  return h >= 1 ? P.hours.replace('{n}', h) : P.minutes.replace('{n}', Math.max(1, Math.ceil(sec / 60)));
}

function renderQuestCard() {
  const card = document.getElementById('questCard');
  const show = !!(progressInfo && runAuth() && progressInfo.quests.length);
  card.classList.toggle('hidden', !show);
  if (!show) return;
  const P = t().prog;
  const I = progressInfo;
  document.getElementById('qcTitle').textContent = P.title;
  const streak = document.getElementById('qcStreak');
  streak.textContent = I.streak > 0 ? P.streak.replace('{n}', I.streak) : '';
  const list = document.getElementById('qcList');
  list.replaceChildren();
  I.quests.forEach(q => {
    const done = q.progress >= q.goal;
    const row = document.createElement('div');
    row.className = 'qc-row' + (done ? ' done' : '');
    row.dataset.code = q.code;
    const mark = document.createElement('span');
    mark.textContent = done ? '✅' : '▫️';
    const text = document.createElement('span');
    text.textContent = P.q[q.code] || q.code;
    const n = document.createElement('span');
    n.className = 'qc-n';
    n.textContent = Math.min(q.progress, q.goal) + '/' + q.goal;
    row.append(mark, text, n);
    const bar = document.createElement('div');
    bar.className = 'qc-bar';
    const fill = document.createElement('span');
    fill.style.width = Math.round(100 * Math.min(1, q.progress / q.goal)) + '%';
    bar.appendChild(fill);
    list.append(row, bar);
  });
  // Внизу — что дальше: сколько ждать новых и какая иконка следующая
  const next = QUEST_ICONS.find(x => x.days > (I.bestStreak || 0));
  const parts = [I.doneToday ? P.allDone : P.left.replace('{t}', timeLeftText(I.secondsLeft || 0))];
  if (next) parts.push(P.next.replace('{n}', next.days).replace('{icon}', next.icon));
  document.getElementById('qcFoot').textContent = parts.join(' · ');
}

// Сетка достижений: открытые — в цвете, закрытые — серые с тем, как открыть
function fillAchGrid(box, got, onlyOpen) {
  const P = t().prog;
  const have = new Set((got || []).map(a => a.code));
  box.replaceChildren();
  ACHIEVEMENTS.filter(a => !onlyOpen || have.has(a.code)).forEach(a => {
    const tile = document.createElement('div');
    tile.className = 'ach-tile' + (have.has(a.code) ? '' : ' locked');
    tile.dataset.code = a.code;
    const icon = document.createElement('div');
    icon.className = 'a-icon';
    icon.textContent = a.icon;
    const name = document.createElement('div');
    name.className = 'a-name';
    name.textContent = P.ach[a.code][0];
    const sub = document.createElement('div');
    sub.className = 'a-sub';
    sub.textContent = P.ach[a.code][1];
    tile.append(icon, name, sub);
    box.appendChild(tile);
  });
  return have.size;
}

function fillProgressProfile() {
  const P = t().prog;
  const I = progressInfo;
  const on = !!(runAuth() && I);
  const line = document.getElementById('pfStreak');
  line.classList.toggle('hidden', !(on && (I.bestStreak || 0) > 0));
  if (on) line.textContent = P.pfStreak.replace('{n}', I.streak || 0).replace('{best}', I.bestStreak || 0);
  const fold = document.getElementById('pfAchFold');
  fold.classList.toggle('hidden', !on);
  if (!on) return;
  const n = fillAchGrid(document.getElementById('pfAchGrid'), I.achievements, false);
  document.getElementById('tAchHead').textContent =
    P.achHead.replace('{n}', n).replace('{total}', ACHIEVEMENTS.length);
}

async function openFriendAch(name) {
  const P = t().prog;
  document.getElementById('achTitle').textContent = P.achTitle.replace('{name}', playerName(name));
  document.getElementById('achClose').textContent = P.close;
  document.getElementById('achGrid').replaceChildren();
  setNote('achNote', '');
  document.getElementById('achModal').classList.remove('hidden');
  try {
    const got = await friendRpc('friend_achievements', { p_friend: name }) || [];
    // У друга показываем только открытое: чужие замки ни о чём не говорят
    const n = fillAchGrid(document.getElementById('achGrid'), got, true);
    if (!n) setNote('achNote', P.achNone);
  } catch (e) {
    setNote('achNote', friendErrorText(e.message), true);
  }
}

function closeFriendAch() {
  document.getElementById('achModal').classList.add('hidden');
}

// Какого бота выбрали в прошлый раз. Сначала — 🐼: слабый, но не беспомощный
function botChoice() {
  try {
    const k = localStorage.getItem('hc_bot');
    if (BOTS.some(b => b.key === k)) return k;
  } catch (e) {}
  return 'panda';
}

function renderBotPick() {
  const box = document.getElementById('botPick');
  const L = t();
  const chosen = botChoice();
  box.replaceChildren(...BOTS.map(b => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'bot-tile' + (b.key === chosen ? ' active' : '');
    tile.dataset.bot = b.key;
    const icon = document.createElement('span');
    icon.className = 'bt-icon';
    icon.textContent = b.icon;
    const name = document.createElement('span');
    name.className = 'bt-name';
    name.textContent = L.bots[b.key];
    const sub = document.createElement('span');
    sub.className = 'bt-sub';
    sub.textContent = L.botsSub[b.key];
    // Сила — точками: пятый из пяти самый сильный
    const power = document.createElement('span');
    power.className = 'bt-power';
    const n = BOTS.indexOf(b) + 1;
    power.textContent = '●'.repeat(n) + '○'.repeat(BOTS.length - n);
    tile.append(icon, name, sub, power);
    tile.onclick = () => {
      try { localStorage.setItem('hc_bot', b.key); } catch (e) {}
      renderBotPick();
    };
    return tile;
  }));
}

// ---------- как бот выбирает ход ----------
// Та же логика — в базе (bot_pick), для рейтинга. Бот видит только ответы
// на ходы, загаданного не знает. Под туманом не видит чужих ходов, под
// слепотой — своих, при короткой памяти — только два последних.
// Сила L от 0 до 1: с вероятностью 0,9·(1−L)² бот рассеян и помнит только
// последний ход; с вероятностью 0,05 + 0,9·L берёт лучший ход (сначала —
// такой, что может сразу попасть), иначе любой не хуже 0,85·L от лучшего
function botCandidates(moves, seat, flags, careless) {
  // Бот под помехой не видит ходы после неё — как человек. Номер хода — по
  // исходному списку, до отсева, иначе отметка съедет
  let seen = moves.filter((m, i) => !m.timeout && typeof m.guess === 'number' &&
                               m.labelIndex !== null && m.labelIndex !== undefined &&
                               !(flags.fog && m.p !== seat && i >= (flags.fogFrom || 0)) &&
                               !(flags.blind && m.p === seat && i >= (flags.blindFrom || 0)));
  const keep = careless ? 1 : (flags.shortMemory ? 2 : seen.length);
  seen = seen.slice(Math.max(0, seen.length - keep));
  const bands = reviewBands(FEEDBACK_META);
  const cand = new Uint8Array(RANGE_MAX - RANGE_MIN + 1).fill(1);
  seen.forEach(m => narrow(cand, RANGE_MIN, bands, m.guess, m.labelIndex));
  // Ответы честные, загаданное всегда среди возможных. На всякий случай
  if (!cand.includes(1)) cand.fill(1);
  return cand;
}

function botPool(cand, best, thr) {
  const scan = infoScan(cand, RANGE_MIN, RANGE_MAX, reviewBands(FEEDBACK_META));
  let pool = [];
  for (let x = RANGE_MIN; x <= RANGE_MAX; x++) {
    const h = scan.H(x);
    if (best ? h >= scan.hBest - 1e-9 : h >= thr * scan.hBest - 1e-9) pool.push(x);
  }
  if (best) {
    const hit = pool.filter(x => cand[x - RANGE_MIN]);
    if (hit.length) pool = hit;
  }
  return pool;
}

function botPick(moves, seat, flags, level, rnd) {
  rnd = rnd || Math.random;
  const cand = botCandidates(moves, seat, flags, rnd() < 0.9 * (1 - level) * (1 - level));
  const left = [];
  for (let i = 0; i < cand.length; i++) if (cand[i]) left.push(i + RANGE_MIN);
  if (left.length === 1) return left[0];
  const pool = botPool(cand, rnd() < 0.05 + 0.9 * level, 0.85 * level);
  return pool[Math.floor(rnd() * pool.length)];
}

// Ход бота в игре без интернета: после «раздумий», как у человека
function botTick() {
  if (!vsBot || online || mode !== 'duel' || screen !== 'game') return;
  if (D.roundOver || D.matchOver || D.cur !== 1 || botTimer) return;
  const [lo, hi] = vsBot.bot.think;
  botTimer = setTimeout(botMove, (lo + Math.random() * (hi - lo)) * 1000 * BOT_SPEED);
}

function stopBot() {
  if (botTimer) { clearTimeout(botTimer); botTimer = null; }
}

function botMove() {
  botTimer = null;
  if (!vsBot || online || mode !== 'duel' || screen !== 'game') return;
  if (D.roundOver || D.matchOver || D.cur !== 1) return;
  if (localForced()) return doForcedTurn(true);
  const moves = history.map(h => ({ guess: h.guess, labelIndex: h.meta.labelIndex, p: h.p, timeout: !!h.timeout }));
  const flags = { fog: D.fog[1], blind: D.blind[1], shortMemory: D.shortMemory[1],
                  fogFrom: D.fogFrom[1], blindFrom: D.blindFrom[1] };
  const level = vsBot.bot.level;
  // Жетон: когда осталось два числа, два хода подряд выигрывают наверняка
  if (!D.armed && D.tokens[1] > 0 && history.length > 0) {
    const left = botCandidates(moves, 1, flags, false).reduce((a, c) => a + c, 0);
    if ((left === 2 && Math.random() < 0.2 + 0.8 * level) || (left === 3 && Math.random() < 0.5 * level)) {
      D.tokens[1]--;
      D.armed = true;
    }
  }
  duelPlay(botPick(moves, 1, flags, level));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Шкала расстояний: в начале каждого раунда — в том виде, в каком её
// оставил игрок.
//
// Если игрок её не трогал: на телефоне она раскрыта только в первой партии —
// пока шкалу не видел, она нужна; дальше полэкрана под неё жалко, а раскрыть
// её можно одним нажатием. На широком экране место есть — раскрыта всегда
const SCALE_NARROW = '(max-width: 859px)';
function scaleWanted() {
  let choice = null, played = 0;
  try {
    choice = localStorage.getItem('hc_scale_open');
    played = parseInt(localStorage.getItem('hc_games_done')) || 0;
  } catch (e) {}
  if (choice !== null) return choice !== '0';
  return !(played > 0 && window.matchMedia(SCALE_NARROW).matches);
}
function countGameDone() {
  try {
    const n = parseInt(localStorage.getItem('hc_games_done')) || 0;
    localStorage.setItem('hc_games_done', String(n + 1));
  } catch (e) {}
}
let scaleAutoValue = null;
let scaleCollapsed = false;

function setScaleOpen(open) {
  const box = document.getElementById('scaleBox');
  if (!box || box.open === open) return;
  scaleAutoValue = open;
  box.open = open;
}

function initScaleBox() {
  const box = document.getElementById('scaleBox');
  if (!box) return;
  // toggle у <details> приходит отложенно, поэтому свой щелчок от щелчка игрока
  // отличаем не флагом (он успеет сброситься), а совпадением с выставленным
  box.addEventListener('toggle', () => {
    const auto = scaleAutoValue;
    scaleAutoValue = null;
    if (auto !== null && box.open === auto) return;
    try { localStorage.setItem('hc_scale_open', box.open ? '1' : '0'); } catch (e) {}
  });
  setScaleOpen(scaleWanted());
}

// В конце раунда шкалу не сворачиваем: страница от этого укорачивалась и
// прыгала вверх. Раскрыта она или нет — решается в начале раунда
function syncScaleBox() {
  const over = roundOver();
  if (over === scaleCollapsed) return;
  scaleCollapsed = over;
  if (over) countGameDone();
  else setScaleOpen(scaleWanted());
}

function buildLegend() {
  const grid = document.getElementById('legendGrid');
  const bar = document.getElementById('legendBar');
  grid.innerHTML = '';
  bar.innerHTML = '';
  const labels = t().labels;
  // От лавы к холоду, а не наоборот: ближняя подсказка — самая частая и самая
  // нужная, ей место в начале списка, а не в самом низу
  FEEDBACK_META.slice(0, 8).reverse().forEach(meta => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = '<span class="l-label" style="color:' + meta.color + '">' + labels[meta.labelIndex] +
                     '</span><span class="l-range">' + meta.rangeSign + '</span>';
    grid.appendChild(item);

    const seg = document.createElement('span');
    seg.style.background = meta.color;
    bar.appendChild(seg);
  });
}

// ================= ЗВУК И ВИБРАЦИЯ =================
// Тон синтезируется на лету: никаких файлов, ничего не грузится, работает офлайн.
// Чем ближе к числу, тем выше нота — подсказка на слух, а не только глазами.
let soundOn = localStorage.getItem('hc_sound') !== '0';
let audioCtx = null;

function renderSoundBtn() {
  const btn = document.getElementById('soundBtn');
  btn.textContent = soundOn ? '🔊' : '🔇';
  btn.setAttribute('aria-label', t().run.sound);
}

function toggleSound() {
  soundOn = !soundOn;
  try { localStorage.setItem('hc_sound', soundOn ? '1' : '0'); } catch (e) {}
  renderSoundBtn();
  if (soundOn) playTone(660, 0.12);
}

function playTone(freq, seconds, delay) {
  if (!soundOn) return;
  try {
    // Контекст создаём при первом касании: iOS не даёт звучать без действия игрока
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const start = audioCtx.currentTime + (delay || 0);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.02);
  } catch (e) {}
}

function buzz(pattern) {
  if (!soundOn) return;
  // На iPhone вибрации нет — Safari не поддерживает этот API, на Android работает
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
}

// Пентатоника по поясам: от «очень холодно» к «лаве» нота ползёт вверх
const TIER_NOTES = [196, 220, 262, 294, 330, 392, 440, 523];

function soundForGuess(meta) {
  if (!meta) return;
  if (meta.labelIndex === 8) {
    playTone(659, 0.12);            // попал: короткий восходящий аккорд
    playTone(880, 0.18, 0.1);
    buzz(40);
  } else {
    playTone(TIER_NOTES[meta.labelIndex] || 220, 0.14);
  }
}

// Фанфары: рекорд, выигранная партия, новая лига
function soundFanfare() {
  [523, 659, 784, 1047].forEach((f, i) => playTone(f, i === 3 ? 0.3 : 0.12, i * 0.11));
  buzz([30, 40, 30, 40, 80]);
}

// Салют: эмодзи разлетаются из центра и гаснут за секунду с небольшим.
// Один раз на событие: итог перерисовывается при каждом опросе, а салют —
// нет. Кто попросил в системе меньше движения, тому салюта нет
let celebratedFor = null;
function celebrate(key, icons, big) {
  if (key === celebratedFor) return false;
  celebratedFor = key;
  if (big) soundFanfare();
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  } catch (e) {}
  const layer = document.createElement('div');
  layer.className = 'confetti';
  const n = big ? 26 : 14;
  for (let i = 0; i < n; i++) {
    const bit = document.createElement('span');
    bit.textContent = icons[i % icons.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * (big ? 160 : 100);
    bit.style.setProperty('--dx', Math.round(Math.cos(angle) * dist) + 'px');
    bit.style.setProperty('--dy', Math.round(Math.sin(angle) * dist - 30) + 'px');
    bit.style.animationDelay = (Math.random() * 0.15).toFixed(2) + 's';
    layer.appendChild(bit);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 1700);
  return true;
}

function soundGameOver() {
  playTone(330, 0.18);
  playTone(196, 0.32, 0.16);
  buzz([60, 50, 120]);
}

