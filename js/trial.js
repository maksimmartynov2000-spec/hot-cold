// ================= ИСПЫТАНИЕ =================
// Соло-режим: раунд за раундом диапазон растёт, попыток всё меньше. Счёт
// идёт в телефоне — соревноваться не с кем, поэтому и прятать на сервере
// нечего: играть можно без входа и без сети. У вошедшего итог уходит в базу
// (run_report) — для заданий дня, достижений и личного рекорда.
//
// Чтобы раунды не были одинаковыми:
//   • сюрпризы — раунд на время, «теплее / холоднее», мороз, туман, подарок;
//   • выбор пути после раунда — риск (очки ×2, попытка меньше) или запас
//     (запасная жизнь, +2 попытки или рентген);
//   • Испытание дня — у всех одно и то же: одни числа и одно правило на весь день;
//   • медали — за раунды за один заход: 5, 10, 15.

const TRIAL_MODS = ['timed', 'warmer', 'frost', 'fog'];
const TRIAL_REWARDS = ['life', 'tries', 'xray'];
const TRIAL_MEDALS = [[5, 'bronze', '🥉'], [10, 'silver', '🥈'], [15, 'gold', '🥇']];
const TRIAL_TIME = 60;
const TRIAL_STATE = 'hc_trial_state';
const TRIAL_MOD_ICON = { timed: '⏱️', warmer: '🌡️', frost: '❄️', fog: '🌫️', gift: '🎁' };
const TRIAL_REWARD_ICON = { life: '❤️', tries: '➕', xray: '🩻' };

// Случайность: в обычном Испытании — своя, в Испытании дня — от даты, чтобы у
// всех в этот день были одни и те же числа и сюрпризы
function trialRng(seed) {
  let a = 0;
  for (let i = 0; i < seed.length; i++) a = (Math.imul(31, a) + seed.charCodeAt(i)) | 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function trialToday() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
// Правило дня — по номеру дня, по кругу
function trialDailyMod(day) {
  const n = Math.floor(Date.parse(day + 'T12:00:00Z') / 86400000);
  return TRIAL_MODS[((n % TRIAL_MODS.length) + TRIAL_MODS.length) % TRIAL_MODS.length];
}

// ---------- рекорды и медали (в телефоне, по игроку) ----------
function trialUserKey() {
  const a = runAuth();
  return a ? a.username.toLowerCase() : 'guest';
}
function trialStats() {
  try {
    const v = JSON.parse(localStorage.getItem('hc_trial_stats_' + trialUserKey()));
    if (v && typeof v === 'object') return Object.assign({ best: 0, bestRounds: 0, daily: {} }, v);
  } catch (e) {}
  return { best: 0, bestRounds: 0, daily: {} };
}
function trialSaveStats(s) {
  try { localStorage.setItem('hc_trial_stats_' + trialUserKey(), JSON.stringify(s)); } catch (e) {}
}
function trialMedal(rounds) {
  let m = null;
  TRIAL_MEDALS.forEach(x => { if (rounds >= x[0]) m = x; });
  return m;
}

// Личный рекорд: у вошедшего — ещё и из базы; гостю — только телефон
function runBestKey() {
  return 'hc_run_best_' + trialUserKey();
}
function runBest() {
  const v = parseInt(localStorage.getItem(runBestKey()));
  return Math.max(isNaN(v) ? 0 : v, trialStats().best);
}
function rememberRunBest(value) {
  if (typeof value === 'number' && value > runBest()) {
    try { localStorage.setItem(runBestKey(), String(value)); } catch (e) {}
  }
}

// ---------- хаб ----------
function openRunEntry() {
  authReturn = 'runHub';
  openRunHub();
}

function openRunHub() {
  const L = t(), T = L.trial;
  setNote('runNote', '');
  renderRunRules();
  const st = trialStats();
  const saved = trialLoadState();
  document.getElementById('unfinishedBox').classList.toggle('hidden', !saved);
  document.getElementById('tRunStart').classList.toggle('hidden', !!saved);
  if (saved) {
    document.getElementById('tUnfinished').textContent = L.run.unfinished;
    document.getElementById('unfinishedInfo').textContent =
      L.run.unfinishedInfo.replace('{round}', saved.RUN.round).replace('{score}', formatNum(saved.RUN.totalScore));
    document.getElementById('tUnfinishedResume').textContent = L.run.resume;
    document.getElementById('tUnfinishedFinish').textContent = L.run.surrender;
  }
  // Рекорд и медали
  const medal = trialMedal(st.bestRounds);
  document.getElementById('trialBest').innerHTML =
    '<div class="tb-row"><span>' + escapeHtml(T.best) + '</span><b>' + formatNum(runBest()) + '</b></div>' +
    '<div class="tb-row"><span>' + escapeHtml(T.bestRounds) + '</span><b>' + formatNum(st.bestRounds) + '</b></div>' +
    '<div class="tr-medals">' + TRIAL_MEDALS.map(([n, key, ic]) =>
      '<span class="tr-medal ' + key + (st.bestRounds >= n ? ' got' : '') + '"><i>' + ic + '</i><small>' +
      escapeHtml(T.medalRounds.replace('{n}', n)) + '</small></span>').join('') + '</div>' +
    (medal ? '' : '<small class="tr-next">' + escapeHtml(T.medalNext.replace('{n}', TRIAL_MEDALS[0][0])) + '</small>');
  // Испытание дня
  const day = trialToday(), mod = trialDailyMod(day);
  const today = st.daily[day] || 0;
  const tm = trialMedal(today);
  const counts = { bronze: 0, silver: 0, gold: 0 };
  Object.keys(st.daily).forEach(d => { const m = trialMedal(st.daily[d]); if (m) counts[m[1]]++; });
  document.getElementById('trialDaily').innerHTML =
    '<div class="td-head">📅 ' + escapeHtml(T.dailyTitle) + '</div>' +
    '<div class="td-rule"><span class="td-ic">' + TRIAL_MOD_ICON[mod] + '</span><span><b>' + escapeHtml(T.mods[mod][0]) +
      '</b><small>' + escapeHtml(T.dailyRule.replace('{rule}', T.mods[mod][1])) + '</small></span></div>' +
    '<div class="td-today">' + escapeHtml(today ? T.dailyToday.replace('{n}', withPlural(today, L.run.roundForms)) : T.dailyNone) +
      (tm ? ' ' + tm[2] : '') + '</div>' +
    '<button class="btn btn-block" id="trialDailyGo" onclick="startRun(true, true)">' + escapeHtml(T.dailyGo) + '</button>' +
    '<div class="td-coll">' + escapeHtml(T.dailyColl) + ' <span>🥇 ' + counts.gold + '</span><span>🥈 ' + counts.silver +
      '</span><span>🥉 ' + counts.bronze + '</span></div>';
  showScreen('runHub');
}

function renderRunRules() {
  const R = t().trial;
  document.getElementById('tRunRulesHead').textContent = t().run.rulesHead;
  document.getElementById('runRulesList').replaceChildren(...R.rules.map(line => {
    const li = document.createElement('li');
    li.textContent = line;
    return li;
  }));
  let seen = false;
  try { seen = localStorage.getItem('hc_run_rules_seen') === '1'; } catch (e) {}
  document.getElementById('runRules').open = !seen;
}

// ---------- партия ----------
let RUN = null;
let trialTimer = null;

// Диапазон округляется до круглого числа: «от 1 до 250» держится в голове,
// «от 1 до 234» — нет. Шаг округления растёт вместе с числом
function roundRangeValue(v) {
  const step = v < 100 ? 10 : v < 500 ? 50 : v < 1000 ? 100 : v < 5000 ? 500 : 1000;
  return Math.max(10, Math.round(v / step) * step);
}
function runRangeForRound(n) {
  const grown = RUN_CONFIG.start_range * Math.pow(RUN_CONFIG.growth, n - 1);
  return roundRangeValue(Math.min(grown, RUN_CONFIG.range_cap));
}
// После потолка сложность идёт от точности: с каждым раундом на попытку меньше
function runAttemptsForRound(n, range) {
  const buffer = Math.max(0, RUN_CONFIG.buffer_start - (n - 1) * RUN_CONFIG.buffer_shrink);
  const squeeze = Math.max(0, n - RUN_CONFIG.squeeze_start);
  const cap = Math.max(2, Math.ceil(range * 0.6));
  const allowed = Math.min(minAttempts(range) + buffer, cap) - squeeze;
  return Math.max(RUN_CONFIG.min_attempts, allowed);
}

function trialRand() {
  if (!RUN.daily) return Math.random();
  if (!RUN.rng) RUN.rng = trialRng(RUN.day + ':' + RUN.round + ':' + (RUN.retries || 0) + ':' + (RUN.draws = (RUN.draws || 0) + 1));
  return RUN.rng();
}

// Что будет в раунде n: сюрприз. В Испытании дня — правило дня во всех раундах
function trialRollMod(n) {
  if (RUN.daily) return n === 1 ? null : RUN.dailyMod;
  const r = trialRand();
  if (n >= 4 && r < 0.1) return 'gift';
  if (n >= 3 && r < 0.45) return TRIAL_MODS[Math.floor(trialRand() * TRIAL_MODS.length)];
  return null;
}

// Каким будет раунд n с сюрпризом mod (без двери): диапазон и попытки
function trialPlan(n, mod) {
  let size = runRangeForRound(mod === 'gift' ? Math.max(1, n - 2) : n);
  if (mod === 'warmer') size = Math.min(size, RUN.daily ? 200 : 100);
  const frost = RUN.frostAll || mod === 'frost';
  const half = Math.floor(size / 2);
  const min = frost ? -half : 1, max = frost ? half : size;
  const count = max - min + 1;
  let tries = mod === 'warmer' ? minAttempts(count) + 3 : runAttemptsForRound(n, count);
  if (mod === 'timed' || mod === 'fog') tries += 1;
  return { size, frost, min, max, tries };
}

// Раздать раунд: диапазон, попытки, число — с учётом сюрприза и выбранной двери
function trialDeal(n, mod, door) {
  RUN.round = n;
  RUN.mod = mod;
  RUN.door = door || null;
  RUN.mult = 1;
  RUN.xray = false;
  RUN.rng = null;
  RUN.draws = 0;
  const plan = trialPlan(n, mod);
  frostMode = plan.frost;
  applyBounds(plan.size);
  let tries = plan.tries;
  if (mod === 'gift') RUN.mult *= 2;
  if (door && door.kind === 'risk') { tries = Math.max(2, tries - 1); RUN.mult *= 2; }
  if (door && door.kind === 'safe') {
    if (door.reward === 'tries') tries += 2;
    if (door.reward === 'life') RUN.lives = (RUN.lives || 0) + 1;
    if (door.reward === 'xray') RUN.xray = true;
  }
  MAX_GUESSES = tries;
  secret = RANGE_MIN + Math.floor(trialRand() * rangeCount());
  history = [];
  gameOver = false;
  gameOverType = null;
  RUN.locked = false;
  RUN.deadline = mod === 'timed' ? Date.now() + TRIAL_TIME * 1000 : null;
  document.getElementById('guessInput').value = '';
  applyRangeToInputs();
  trialStartTimer();
  trialSaveState();
}

// fresh — начать заново (старое незаконченное засчитывается как оконченное)
function startRun(fresh, daily) {
  try { localStorage.setItem('hc_run_rules_seen', '1'); } catch (e) {}
  const saved = trialLoadState();
  if (saved && !fresh) return trialResume(saved);
  if (saved) trialClearState();
  endLessonMode();
  const day = trialToday();
  RUN = { daily: !!daily, day: day, dailyMod: trialDailyMod(day), frostAll: !daily && !!frostMode,
          prevFrost: frostMode, totalScore: 0, log: [], lives: 0, retries: 0 };
  mode = 'run';
  trialDeal(1, trialRollMod(1), null);
  applyTranslations();
  showScreen('game');
  renderAll();
}

// Подсказка «теплее / холоднее»: сравнение с прошлым ходом, а не пояс
const REL_META = {
  first: { color: '#e2e8f0', bg: 'rgba(226, 232, 240, 0.12)', icon: '🎯' },
  warmer: { color: '#ff8a3d', bg: 'rgba(255, 138, 61, 0.16)', icon: '🔥' },
  colder: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.16)', icon: '❄️' },
  same: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.16)', icon: '↔️' }
};
function relMeta(kind) {
  const m = REL_META[kind];
  return { labelIndex: -1, min: 0, max: 0, rangeSign: '', color: m.color, bg: m.bg, custom: kind, icon: m.icon };
}

function runGuess() {
  if (!RUN || RUN.locked) return;
  const input = document.getElementById('guessInput');
  const guess = readGuess();
  if (guess === null) return;
  noteIfRepeat(guess, history);
  input.value = '';
  const distance = Math.abs(guess - secret);
  let meta = getFeedback(distance);
  if (RUN.mod === 'warmer' && distance > 0) {
    const prev = history[history.length - 1];
    meta = relMeta(!prev ? 'first' : distance < prev.distance ? 'warmer' : distance > prev.distance ? 'colder' : 'same');
  }
  history.push({ guess: guess, distance: distance, meta: meta, p: null });
  soundForGuess(meta);
  if (distance === 0) return trialRoundWon();
  if (history.length >= MAX_GUESSES) return trialRoundLost('tries');
  trialSaveState();
  renderAll();
}

function trialRoundWon() {
  const span = rangeCount();
  const points = Math.round(100 * RUN.round * (minAttempts(span) / history.length)) * RUN.mult;
  RUN.totalScore += points;
  RUN.log.push({ round: RUN.round, points: points, mod: RUN.mod });
  RUN.locked = true;
  trialStopTimer();
  // Следующий раунд: сюрприз известен заранее, награда за «запас» — тоже
  const next = RUN.round + 1;
  const nextMod = trialRollMod(next);
  const reward = TRIAL_REWARDS[Math.floor(trialRand() * TRIAL_REWARDS.length)];
  RUN.stage = { round: RUN.round, points: points, moves: history.length, total: RUN.totalScore,
                from: { min: RANGE_MIN, max: RANGE_MAX, tries: MAX_GUESSES },
                mult: RUN.mult, next: next, nextMod: nextMod, reward: reward };
  trialSaveState();
  renderAll();
}

function trialRoundLost(why) {
  trialStopTimer();
  if (RUN.lives > 0) {
    // Запасная жизнь: тот же раунд заново, с новым числом
    RUN.lives--;
    RUN.retries = (RUN.retries || 0) + 1;
    RUN.saved = { why: why, secret: secret };
    trialDeal(RUN.round, RUN.mod, null);
    renderAll();
    return;
  }
  finishRun({ why: why }, false);
}

function trialStartTimer() {
  trialStopTimer();
  if (!RUN || !RUN.deadline) return;
  trialTimer = setInterval(() => {
    if (!RUN || mode !== 'run' || !RUN.deadline) return trialStopTimer();
    if (RUN.locked) return;
    if (Date.now() >= RUN.deadline) { trialStopTimer(); trialRoundLost('time'); return; }
    renderRunMod();
  }, 250);
}
function trialStopTimer() {
  if (trialTimer) { clearInterval(trialTimer); trialTimer = null; }
}

// Полоска над доской: какой это раунд и что в нём особенного
function renderRunMod() {
  const box = document.getElementById('runMod');
  if (!box) return;
  const show = mode === 'run' && !!RUN && !RUN.over && !RUN.stage;
  box.classList.toggle('hidden', !show);
  if (!show) return;
  const T = t().trial;
  const parts = [];
  if (RUN.daily) parts.push('<span class="rm-tag daily">📅 ' + escapeHtml(T.dailyShort) + '</span>');
  if (RUN.mod) {
    let text = '<b>' + TRIAL_MOD_ICON[RUN.mod] + ' ' + escapeHtml(T.mods[RUN.mod][0]) + '</b> ' + escapeHtml(T.mods[RUN.mod][1]);
    if (RUN.mod === 'timed' && RUN.deadline) {
      const left = Math.max(0, Math.ceil((RUN.deadline - Date.now()) / 1000));
      text += ' <span class="rm-time' + (left <= 10 ? ' low' : '') + '">' + T.secLeft.replace('{n}', left) + '</span>';
    }
    parts.push('<span class="rm-mod">' + text + '</span>');
  }
  if (RUN.mult > 1) parts.push('<span class="rm-tag mult">×' + RUN.mult + ' ' + escapeHtml(T.points) + '</span>');
  if (RUN.lives > 0) parts.push('<span class="rm-tag life">❤️ ×' + RUN.lives + '</span>');
  if (RUN.xray) parts.push('<span class="rm-tag xray">🩻 ' + escapeHtml(Math.abs(secret) % 2 === 0 ? T.even : T.odd) + '</span>');
  if (RUN.saved && history.length === 0) parts.push('<span class="rm-tag life">' + escapeHtml(T.lifeUsed.replace('{n}', formatNum(RUN.saved.secret))) + '</span>');
  box.innerHTML = parts.join('');
  box.classList.toggle('empty', !parts.length);
}

// Карточка между раундами: сколько набрал, что дальше и две двери
function renderRunStage() {
  const box = document.getElementById('runStage');
  const O = mode === 'run' && RUN && RUN.over;
  const S = mode === 'run' && RUN && RUN.stage;
  box.classList.toggle('hidden', !S && !O);
  box.classList.toggle('over', !!O);
  renderRunMod();
  if (O) { box.innerHTML = runOverHtml(O); return; }
  if (!S) return;
  const L = t(), T = L.trial;
  const plan = trialPlan(S.next, S.nextMod);
  const range = (a, b) => L.placeholderTpl.replace('{a}', formatNum(a)).replace('{b}', formatNum(b));
  const row = (label, now, was, cls) =>
    '<div class="rs-row"><span class="rs-k">' + label + '</span><span class="rs-v">' + now +
    (was === null ? '' : ' <span class="rs-was ' + cls + '">' + L.rsWas.replace('{v}', was) + '</span>') + '</span></div>';
  const rangeChanged = plan.min !== S.from.min || plan.max !== S.from.max;
  const rows = row(L.rsRange, range(plan.min, plan.max), rangeChanged ? range(S.from.min, S.from.max) : null,
      plan.max - plan.min >= S.from.max - S.from.min ? 'up' : 'down') +
    row(L.rsTries, formatNum(plan.tries), plan.tries !== S.from.tries ? formatNum(S.from.tries) : null,
      plan.tries > S.from.tries ? 'up' : 'down');
  const modLine = S.nextMod
    ? '<div class="rs-mod"><span>' + TRIAL_MOD_ICON[S.nextMod] + '</span><span><b>' + escapeHtml(T.nextMod) + ' ' +
      escapeHtml(T.mods[S.nextMod][0]) + '</b><small>' + escapeHtml(T.mods[S.nextMod][1]) + '</small></span></div>'
    : '';
  box.innerHTML =
    '<div class="rs-title">🎯 ' + L.rsDone.replace('{n}', S.round) + '</div>' +
    '<div class="rs-got">' + L.rsGot.replace('{p}', withPlural(S.points, L.run.pointForms))
      .replace('{m}', withPlural(S.moves, L.moveForms)) + (S.mult > 1 ? ' <b class="rs-mult">×' + S.mult + '</b>' : '') + '</div>' +
    '<div class="rs-total">' + L.rsTotal.replace('{s}', withPlural(S.total, L.run.pointForms)) + '</div>' +
    '<div class="rs-next">' + L.rsNext.replace('{n}', S.next) + '</div>' + rows + modLine +
    '<div class="rs-doors">' +
      '<button class="rs-door risk" id="rsRisk" onclick="runNextRound(\'risk\')"><i>🔥</i><b>' + escapeHtml(T.risk) + '</b><small>' +
        escapeHtml(T.riskDesc) + '</small></button>' +
      '<button class="rs-door safe" id="rsSafe" onclick="runNextRound(\'safe\')"><i>' + TRIAL_REWARD_ICON[S.reward] + '</i><b>' +
        escapeHtml(T.safe) + '</b><small>' + escapeHtml(T.rewards[S.reward]) + '</small></button>' +
    '</div>';
}

function runNextRound(kind) {
  if (!RUN || !RUN.stage) return;
  const S = RUN.stage;
  RUN.stage = null;
  RUN.saved = null;
  trialDeal(S.next, S.nextMod, { kind: kind === 'risk' ? 'risk' : 'safe', reward: S.reward });
  applyTranslations();
  renderAll();
}

// Итог: почему кончилось, число, очки и раунды, медаль, рекорд, очки по раундам
function runOverHtml(O) {
  const L = t(), T = L.trial;
  const pts = n => withPlural(n, L.run.pointForms);
  const why = O.quit ? L.rgWhyQuit : O.why === 'time' ? T.whyTime : L.rgWhy;
  let h = '<div class="rs-title">' + (O.daily ? '📅 ' : '') + L.rgTitle + '</div>' +
    '<div class="rg-why">' + why.replace('{n}', O.round) + '</div>';
  if (O.secret !== null) {
    h += '<div class="rg-secret"><span>' + L.rgSecret + '</span><b>' + formatNum(O.secret) + '</b></div>';
    if (O.last !== null) h += '<div class="rg-last">' + L.rgLast.replace('{g}', formatNum(O.last))
      .replace('{d}', formatNum(Math.abs(O.last - O.secret))) + '</div>';
  }
  h += '<div class="rg-stats"><div><b>' + formatNum(O.rounds) + '</b><span>' + L.rgRounds + '</span></div>' +
    '<div><b>' + formatNum(O.score) + '</b><span>' + L.rgScore + '</span></div></div>';
  const medal = trialMedal(O.rounds);
  if (medal) h += '<div class="rg-medal ' + medal[1] + '">' + medal[2] + ' ' + escapeHtml(T.medalGot.replace('{m}', T.medals[medal[1]])) + '</div>';
  else h += '<div class="rg-tobest">' + escapeHtml(T.medalNext.replace('{n}', TRIAL_MEDALS[0][0])) + '</div>';
  if (O.score > 0 && O.score > O.bestBefore) h += '<div class="rg-best">' + L.run.newBest + '</div>';
  else if (O.bestBefore > O.score) h += '<div class="rg-tobest">' + L.rgToBest.replace('{b}', formatNum(O.bestBefore))
    .replace('{d}', pts(O.bestBefore - O.score)) + '</div>';
  if (O.log.length) h += '<div class="rs-next">' + L.rgByRound + '</div><div class="rg-chips">' +
    O.log.map(r => '<span><i>' + r.round + '</i>' + (r.mod ? TRIAL_MOD_ICON[r.mod] : '') + '+' + formatNum(r.points) + '</span>').join('') + '</div>';
  h += '<button class="btn btn-block" id="rgAgain" onclick="runAgain()">' + L.rgAgain + '</button>' +
    '<div class="setup-row"><button class="btn-ghost btn-block" id="shareBtn" onclick="shareRunResult(' +
    O.score + ',' + O.rounds + ')">' + L.run.share + '</button>' +
    '<button class="btn-ghost btn-block" id="rgHub" onclick="runToHub()">' + L.rgHub + '</button></div>';
  return h;
}

function finishRun(res, quit) {
  trialStopTimer();
  // Сдались на карточке между раундами — пройденный раунд засчитан
  const inStage = !!RUN.stage;
  const rounds = inStage ? RUN.round : RUN.round - 1;
  const score = RUN.totalScore;
  const bestBefore = runBest();
  const st = trialStats();
  if (score > st.best) st.best = score;
  if (!RUN.daily && rounds > st.bestRounds) st.bestRounds = rounds;
  if (RUN.daily) st.daily[RUN.day] = Math.max(st.daily[RUN.day] || 0, rounds);
  trialSaveStats(st);
  rememberRunBest(score);
  const last = history.length ? history[history.length - 1].guess : null;
  RUN.locked = true;
  RUN.stage = null;
  RUN.over = {
    quit: !!quit, why: res && res.why, round: inStage ? RUN.round + 1 : RUN.round, score: score, rounds: rounds, daily: RUN.daily,
    secret: secret, last: quit ? null : last, bestBefore: bestBefore, log: RUN.log || []
  };
  trialClearState();
  gameOver = true;
  gameOverType = 'lose';
  movesUsed = history.length;
  if (!quit) soundGameOver();
  trialReport(rounds, score);
  applyTranslations();
  renderAll();
}

// Итог — в базу: задания дня, достижения, рекорд. Без входа или сети — молча
function trialReport(rounds, score) {
  if (!runAuth() || typeof sb === 'undefined' || !sb) return;
  friendRpc('run_report', { p_rounds: rounds, p_score: score })
    .then(r => { if (r && typeof r.best === 'number') rememberRunBest(r.best); if (runAuth()) loadProgress(); })
    .catch(() => {});
}

function leaveRun() {
  trialStopTimer();
  if (RUN) frostMode = RUN.prevFrost;
  RUN = null;
  mode = null;
  gameOver = false;
  gameOverType = null;
  applyTranslations();
}
function runToHub() { leaveRun(); openRunHub(); }
function runAgain() { const daily = RUN && RUN.daily; leaveRun(); startRun(true, daily); }

// ---------- пауза и незаконченная игра ----------
// Состояние пишется после каждого хода: закрытая вкладка или севший телефон
// не стоят результата — игра ждёт на том же месте
function trialSaveState() {
  if (!RUN || RUN.over) return;
  try {
    localStorage.setItem(TRIAL_STATE, JSON.stringify({
      user: trialUserKey(), RUN: Object.assign({}, RUN, { rng: null, deadlineLeft: RUN.deadline ? RUN.deadline - Date.now() : null }),
      secret: secret, history: history.map(h => ({ guess: h.guess, distance: h.distance, custom: h.meta.custom || null })),
      min: RANGE_MIN, max: RANGE_MAX, frost: frostMode, tries: MAX_GUESSES
    }));
  } catch (e) {}
}
function trialLoadState() {
  try {
    const v = JSON.parse(localStorage.getItem(TRIAL_STATE));
    if (v && v.RUN && v.user === trialUserKey()) return v;
  } catch (e) {}
  return null;
}
function trialClearState() {
  try { localStorage.removeItem(TRIAL_STATE); } catch (e) {}
}
function trialResume(saved) {
  RUN = Object.assign({}, saved.RUN);
  RUN.rng = null;
  // Время на паузе не идёт
  RUN.deadline = RUN.deadlineLeft !== null && RUN.deadlineLeft !== undefined ? Date.now() + Math.max(5000, RUN.deadlineLeft) : null;
  mode = 'run';
  frostMode = saved.frost;
  RANGE_MIN = saved.min;
  RANGE_MAX = saved.max;
  FEEDBACK_META = buildFeedbackMeta(maxDistance() + 1);
  MAX_GUESSES = saved.tries;
  secret = saved.secret;
  history = saved.history.map(h => ({ guess: h.guess, distance: h.distance, p: null,
    meta: h.custom ? relMeta(h.custom) : getFeedback(h.distance) }));
  gameOver = false;
  gameOverType = null;
  applyRangeToInputs();
  trialStartTimer();
  applyTranslations();
  showScreen('game');
  renderAll();
}
function resumeSavedRun() { startRun(false); }
// «Завершить» из хаба: результат засчитывается, как если бы сдались
function finishSavedRun() {
  const saved = trialLoadState();
  if (!saved) return openRunHub();
  trialResume(saved);
  finishRun({}, true);
}

function openPause() {
  if (RUN && RUN.deadline) RUN.pausedLeft = RUN.deadline - Date.now();
  document.getElementById('pauseModal').classList.remove('hidden');
}
function closePause() {
  if (RUN && RUN.pausedLeft) { RUN.deadline = Date.now() + RUN.pausedLeft; RUN.pausedLeft = null; }
  document.getElementById('pauseModal').classList.add('hidden');
}
// Уход с паузы игру не заканчивает: она ждёт в телефоне
function pauseAndLeave() {
  if (RUN && RUN.pausedLeft) { RUN.deadline = Date.now() + RUN.pausedLeft; RUN.pausedLeft = null; }
  trialSaveState();
  document.getElementById('pauseModal').classList.add('hidden');
  trialStopTimer();
  if (RUN) frostMode = RUN.prevFrost;
  RUN = null;
  mode = null;
  applyTranslations();
  openRunHub();
}
function giveUpRun() {
  closePause();
  if (RUN) finishRun({}, true);
}

// Поделиться результатом: системное окно там, где оно есть, иначе — в буфер
async function shareRunResult(score, rounds) {
  const L = t();
  const link = location.origin + location.pathname;
  const text = L.run.shareText
    .replace('{score}', withPlural(score, L.run.pointForms))
    .replace('{rounds}', withPlural(rounds, L.run.roundForms));
  const btn = document.getElementById('shareBtn');
  try {
    if (navigator.share) { await navigator.share({ text: text, url: link }); return; }
    await navigator.clipboard.writeText(text + ' ' + link);
    if (btn) {
      btn.textContent = L.run.shareCopied;
      setTimeout(() => { if (btn) btn.textContent = L.run.share; }, 2000);
    }
  } catch (e) {}
}
