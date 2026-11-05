// ================= СУНДУК ДНЯ, СЕРИЯ И СЕЗОННЫЙ ПУТЬ =================
// Всё считает база (миграции 053 и 062): очки за игры и задания, сундук раз
// в день после любой игры, серия дней с заморозкой раз в неделю, 30 ступеней
// пути с наградами, «Испытание выходных». Игра только показывает и даёт
// надеть своё. Нет миграции — onlineInfo остаётся null, и ничего этого не видно

// Наборы — копии из базы (pass_frames и т. д.), сверяются тестом
// Рамки выходных: своя у каждого месяца (миграция 055); 'tourney' — первая, до них
const PASS_FRAMES = ['fire', 'ice', 'space', 'champion', 'streak', 'tourney',
  'cup-01', 'cup-02', 'cup-03', 'cup-04', 'cup-05', 'cup-06', 'cup-07', 'cup-08', 'cup-09', 'cup-10', 'cup-11', 'cup-12'];
const PASS_TITLES = ['hunter', 'sniper', 'regular', 'champion'];
const PASS_PHRASES = ['lava', 'rematch', 'streak', 'oops', 'genius', 'close'];
const PASS_ICONS = ['🦦', '🐞'];
const PASS_COLORS = ['grad-aurora', 'grad-lava', 'grad-night'];
const PASS_KIND_ICON = { frame: '⭕', title: '🏷️', phrase: '💬', icon: '🖼️', color: '🎨' };

let onlineInfo = null;

async function loadOnlineInfo() {
  if (!runAuth() || typeof sb === 'undefined' || !sb) { onlineInfo = null; return null; }
  try {
    const r = await friendRpc('my_online', {});
    onlineInfo = r && typeof r === 'object' && 'xp' in r ? r : null;
  } catch (e) {
    onlineInfo = null;
  }
  renderOnlineDaily();
  if (typeof renderModeInfo === 'function') renderModeInfo();
  return onlineInfo;
}

// Игра без интернета кончилась (миграция 062): Тренировка, игра вдвоём на
// одном телефоне, проигранный бой Приключения. База отмечает день (сундук
// открывается), даёт очки пути и засчитывает задание «сыграйте». Без входа —
// ничего. Чаще раза в 5 секунд база не примет — и не спрашиваем
let localDoneAt = 0;
function localGameDone(kind) {
  if (!runAuth() || typeof sb === 'undefined' || !sb) return;
  if (Date.now() - localDoneAt < 5000) return;
  localDoneAt = Date.now();
  friendRpc('local_game_done', { p_kind: kind })
    .then(() => {
      loadOnlineInfo();
      if (typeof loadProgress === 'function') loadProgress();
    })
    .catch(() => {});
}

function passOwns(kind, code) {
  return !!onlineInfo && (onlineInfo.owned || []).some(o => o.kind === kind && o.code === code);
}
// Где взять награду: ступень пути, день серии или «из сундука»
function passWhere(kind, code) {
  const P = t().pass;
  if (!onlineInfo) return '';
  const r = (onlineInfo.rewards || []).find(x => x.kind === kind && x.code === code);
  if (r) return P.whereLevel.replace('{n}', r.level);
  const s = (onlineInfo.streakRewards || []).find(x => x.kind === kind && x.code === code);
  if (s && DAILY_EXTRAS) return P.whereStreak.replace('{n}', s.days);
  if (kind === 'frame' && code === 'tourney') return P.weekend.where;
  if (kind === 'frame' && /^cup-\d\d$/.test(code)) return P.weekend.whereM.replace('{m}', seasonMonth('2026-' + code.slice(4)));
  if (kind === 'frame' && LEAGUE_FRAMES.indexOf(code) >= 0) return P.whereLeague;
  if (typeof isShopItem === 'function' && isShopItem(kind, code)) return t().shop.where;
  // Сундук дня спрятан — сюрпризы падают из сундуков «Испытания выходных»
  return DAILY_EXTRAS ? P.whereChest : P.whereWeekendChest;
}
// Награда, которую давала только спрятанная серия дней (DAILY_EXTRAS): пока
// серии не видно, получить её нельзя — в выборе её нет, если она ещё не своя
function passHiddenSource(kind, code) {
  if (DAILY_EXTRAS || !onlineInfo || passOwns(kind, code)) return false;
  const inStreak = (onlineInfo.streakRewards || []).some(x => x.kind === kind && x.code === code);
  const onPath = (onlineInfo.rewards || []).some(x => x.kind === kind && x.code === code);
  return inStreak && !onPath;
}
// Рамки лиг: лиг больше нет (миграция 062), полученные остались в коллекции
const LEAGUE_FRAMES = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend'];
function frameName(code) {
  const i = LEAGUE_FRAMES.indexOf(code);
  return i >= 0 ? t().leagues[i] : (t().pass.frames[code] || code);
}
function passLevel() {
  if (!onlineInfo) return 0;
  return Math.min(onlineInfo.maxLevel, Math.floor(onlineInfo.xp / onlineInfo.levelXp));
}
// Название награды словами: «Рамка «Огонь»», «Фраза «Лава!»»
function passRewardName(kind, code) {
  const P = t().pass, q = v => P.q[0] + v + P.q[1];
  if (kind === 'frame') return P.kinds.frame + ' ' + q(frameName(code));
  if (kind === 'title') return P.kinds.title + ' ' + q(P.titles[code]);
  if (kind === 'phrase') return P.kinds.phrase + ' ' + q(t().say[code] || code);
  if (kind === 'icon') return P.kinds.icon + ' ' + code;
  return P.kinds.color;
}
// Маленькая картинка награды: кружок с рамкой, цветом или иконкой
function passRewardArt(kind, code) {
  if (kind === 'frame') return '<span class="pr-art pr-frame" data-frame="' + code + '"></span>';
  if (kind === 'color') return '<span class="pr-art" style="background:' + avatarBgCss(code) + '"></span>';
  if (kind === 'icon') return '<span class="pr-art pr-icon">' + (iconArt(code, 0) || code) + '</span>';
  return '<span class="pr-art pr-emoji">' + PASS_KIND_ICON[kind] + '</span>';
}

// ---------- карточка в главном меню ----------
function renderOnlineDaily() {
  const box = document.getElementById('olDaily');
  if (!box) return;
  box.classList.toggle('hidden', !onlineInfo);
  if (!onlineInfo) return;
  const P = t().pass, I = onlineInfo;
  const lvl = passLevel();
  const inLevel = lvl >= I.maxLevel ? I.levelXp : I.xp - lvl * I.levelXp;
  const next = (I.rewards || []).find(r => r.level > lvl);
  const chest = I.chestOpened ? '<button class="od-chest done" onclick="openChestModal()">✅ <span>' + escapeHtml(P.chestDone) + '</span></button>'
    : I.played ? '<button class="od-chest ready" id="odChest" onclick="openChest()">🎁 <span>' + escapeHtml(P.chestOpen) + '</span></button>'
    : '<div class="od-chest locked">🔒 <span>' + escapeHtml(P.chestLocked) + '</span></div>';
  // Сундук и серия — пока спрятаны (DAILY_EXTRAS)
  box.innerHTML = (DAILY_EXTRAS ?
    '<div class="od-top">' + chest +
      '<div class="od-streak' + (I.streak ? ' on' : '') + '"><b>🔥 ' + I.streak + '</b><small>' +
        escapeHtml(withPlural(I.streak, P.dayForms).replace(/^\S+\s/, '')) + '</small>' +
        (I.freezeLeft ? '<i title="' + escapeHtml(P.freezeHint) + '">❄️</i>' : '') + '</div>' +
    '</div>' : '') +
    '<button class="od-pass" onclick="openPassModal()">' +
      '<span class="od-lvl"><b>' + lvl + '</b><small>/' + I.maxLevel + '</small></span>' +
      '<span class="od-bar"><span style="width:' + Math.round(100 * inLevel / I.levelXp) + '%"></span>' +
        '<em>' + escapeHtml(P.pathTitle) + ' · ' + inLevel + '/' + I.levelXp + '</em></span>' +
      (next ? '<span class="od-next">' + passRewardArt(next.kind, next.code) + '<small>' + escapeHtml(P.nextAt.replace('{n}', next.level)) + '</small></span>' : '<span class="od-next">🏆</span>') +
    '</button>' + weekendCardHtml();
}

// ---------- «Испытание выходных» (миграция 062) ----------
// Очки за субботу и воскресенье: Испытание на 5+ раундов или бой Приключения
// на ★★★. 3 очка — сундук, 5 — рамка месяца (если она уже есть — большой
// сундук). В будни видно, когда начало, и награду прошлых выходных ещё можно забрать
function weekendCardHtml() {
  const W = onlineInfo && onlineInfo.weekend;
  if (!W) return '';
  const C = t().pass.weekend;
  const pts = W.points || 0;
  const goal = (n, claimed) => {
    // Рамка за 5 — этого месяца (W.frame); есть уже — большой сундук
    const fr = W.frame || 'tourney';
    const big = n === 5 && passOwns('frame', fr) && !(claimed && claimed.frame);
    const got = pts >= n, label = n === 3 ? C.g3 : big ? C.g5b : passRewardName('frame', fr);
    const art = n === 3 ? '<span class="pr-art pr-emoji">🎁</span>'
      : (big ? '<span class="pr-art pr-emoji">💎</span>' : passRewardArt('frame', fr));
    const state = claimed ? '<i>✅</i>'
      : got ? '<button class="cup-claim" id="cupClaim' + n + '" onclick="claimWeekend(' + n + ')">' + escapeHtml(C.claim) + '</button>'
      : '<i>🔒</i>';
    return '<div class="cup-goal' + (got ? ' got' : '') + (got && !claimed ? ' ready' : '') + '" data-goal="' + n + '">' + art +
      '<span><b>' + n + '</b><small>' + escapeHtml(label) + '</small></span>' + state + '</div>';
  };
  const pending = (pts >= 3 && !W.claim3) || (pts >= 5 && !W.claim5);
  // В будни без невзятой награды — одна строка: когда начало
  if (!W.on && !pending) {
    return '<div class="od-cup off" id="odCup"><b>' + escapeHtml(C.title) + '</b><small>' +
      escapeHtml(C.off.replace('{t}', weekendTimeText(W.startsIn))) + '</small></div>';
  }
  const pct = Math.min(100, Math.round(100 * pts / 5));
  return '<div class="od-cup' + (W.on ? ' on' : '') + '" id="odCup">' +
    '<div class="cup-head"><b>' + escapeHtml(C.title) + '</b><small>' +
      escapeHtml(W.on ? C.on.replace('{t}', weekendTimeText(W.endsIn)) : C.last) + '</small></div>' +
    (W.on ? '<div class="cup-how">' + escapeHtml(C.how) + '</div>' : '') +
    '<div class="cup-bar"><span style="width:' + pct + '%"></span><em>' + escapeHtml(C.points.replace('{n}', Math.min(pts, 5) + '/5')) + '</em></div>' +
    '<div class="cup-goals">' + goal(3, W.claim3) + goal(5, W.claim5) + '</div>' +
    '</div>';
}
// Больше суток — днями, иначе часами и минутами
function weekendTimeText(sec) {
  if (sec >= 2 * 86400) return withPlural(Math.floor(sec / 86400), t().pass.dayForms);
  return timeLeftText(sec || 0);
}

async function claimWeekend(n) {
  const btn = document.getElementById('cupClaim' + n);
  if (btn) btn.disabled = true;
  let r;
  try {
    r = await friendRpc('weekend_claim', { p_goal: n });
  } catch (e) {
    if (btn) btn.disabled = false;
    return setNote('odNote', friendErrorText(e.message), true);
  }
  setNote('odNote', '');
  await loadOnlineInfo();
  // Кристаллы (миграция 061) — в кошелёк; показывает их сундук
  if (r && r.gems && typeof loadWallet === 'function') loadWallet();
  showWeekendChest(r);
}
function showWeekendChest(r) {
  const P = t().pass, C = P.weekend;
  const items = ['<div class="ch-xp">+' + r.xp + ' <small>' + escapeHtml(P.xp) + '</small></div>'];
  if (r.frame) items.push('<div class="ch-item gold">' + passRewardArt('frame', r.frame) +
    '<span><b>' + escapeHtml(C.frame) + '</b>' + escapeHtml(passRewardName('frame', r.frame)) + '</span></div>');
  if (r.surprise) items.push('<div class="ch-item">' + passRewardArt(r.surprise.kind, r.surprise.code) +
    '<span><b>' + escapeHtml(P.surprise) + '</b>' + escapeHtml(passRewardName(r.surprise.kind, r.surprise.code)) + '</span></div>');
  if (r.gems) items.push('<div class="ch-item gold"><span class="pr-art pr-emoji">💎</span><span><b>' +
    escapeHtml(t().shop.toastGems.replace('{n}', r.gems)) + '</b>' + escapeHtml(t().shop.gemsName) + '</span></div>');
  document.getElementById('chestTitle').textContent = r.goal === 3 ? C.chest : r.frame ? C.title : C.big;
  document.getElementById('chestBody').innerHTML = items.join('');
  document.getElementById('chestOk').textContent = P.ok;
  const m = document.getElementById('chestModal');
  m.classList.add('fresh');
  m.classList.remove('hidden');
  if (!r.already) {
    soundFanfare();
    celebrate('weekend:' + r.goal + ':' + r.xp + ':' + Date.now(), ['🏆', '⭐', '✨'], false);
  }
}

// ---------- сундук ----------
async function openChest() {
  const btn = document.getElementById('odChest');
  if (btn) btn.disabled = true;
  let r;
  try {
    r = await friendRpc('open_chest', {});
  } catch (e) {
    if (btn) btn.disabled = false;
    return setNote('odNote', friendErrorText(e.message), true);
  }
  setNote('odNote', '');
  await loadOnlineInfo();
  showChest(r, true);
}
function openChestModal() {
  if (onlineInfo && onlineInfo.chest) showChest(onlineInfo.chest, false);
}
function showChest(r, fresh) {
  const P = t().pass;
  const box = document.getElementById('chestBody');
  const items = [];
  items.push('<div class="ch-xp">+' + r.xp + ' <small>' + escapeHtml(P.xp) + '</small></div>');
  items.push('<div class="ch-streak">🔥 ' + escapeHtml(P.streakNow.replace('{n}', withPlural(r.streak, P.dayForms))) +
    (r.froze ? '<small>❄️ ' + escapeHtml(P.frozeUsed) + '</small>' : '') + '</div>');
  if (r.streakReward) items.push('<div class="ch-item gold">' + passRewardArt(r.streakReward.kind, r.streakReward.code) +
    '<span><b>' + escapeHtml(P.streakGift.replace('{n}', r.streakReward.days)) + '</b>' +
    escapeHtml(passRewardName(r.streakReward.kind, r.streakReward.code)) + '</span></div>');
  if (r.surprise) items.push('<div class="ch-item">' + passRewardArt(r.surprise.kind, r.surprise.code) +
    '<span><b>' + escapeHtml(P.surprise) + '</b>' + escapeHtml(passRewardName(r.surprise.kind, r.surprise.code)) + '</span></div>');
  document.getElementById('chestTitle').textContent = P.chestTitle;
  box.innerHTML = items.join('');
  document.getElementById('chestOk').textContent = P.ok;
  const m = document.getElementById('chestModal');
  m.classList.toggle('fresh', !!fresh);
  m.classList.remove('hidden');
  if (fresh) {
    soundFanfare();
    celebrate('chest:' + (onlineInfo ? onlineInfo.day : '') + ':' + r.xp, ['✨', '⭐', '🎁'], false);
  }
}
function closeChest() { document.getElementById('chestModal').classList.add('hidden'); }

// ---------- сезонный путь ----------
function openPassModal() {
  if (!onlineInfo) return;
  const P = t().pass, I = onlineInfo;
  const lvl = passLevel();
  document.getElementById('passTitle').textContent = P.pathTitle + ' · ' + seasonMonth(I.season) + ' ' + String(I.season).slice(0, 4);
  const days = Math.max(1, Math.ceil(I.seasonLeft / 86400));
  document.getElementById('passSub').textContent = P.pathSub.replace('{n}', lvl).replace('{m}', I.maxLevel)
    .replace('{d}', withPlural(days, P.dayForms));
  document.getElementById('passHow').textContent = DAILY_EXTRAS ? P.how : P.howGames;
  const list = document.getElementById('passList');
  const rows = [];
  for (let n = 1; n <= I.maxLevel; n++) {
    const rew = (I.rewards || []).filter(r => r.level === n);
    if (!rew.length && n !== lvl) continue;
    const got = n <= lvl;
    rows.push('<div class="pl-row' + (got ? ' got' : '') + (n === lvl + 1 ? ' next' : '') + '" data-level="' + n + '">' +
      '<span class="pl-n">' + n + '</span>' +
      '<span class="pl-r">' + (rew.length ? rew.map(r => passRewardArt(r.kind, r.code) + '<em>' + escapeHtml(passRewardName(r.kind, r.code)) + '</em>').join('')
        : '<em>' + escapeHtml(P.youHere) + '</em>') + '</span>' +
      '<span class="pl-s">' + (got ? '✅' : '🔒') + '</span></div>');
  }
  list.innerHTML = rows.join('');
  const sr = document.getElementById('passStreak');
  sr.classList.toggle('hidden', !DAILY_EXTRAS);
  sr.innerHTML = !DAILY_EXTRAS ? '' : '<div class="pl-head">🔥 ' + escapeHtml(P.streakHead) + '</div>' + (I.streakRewards || []).map(r =>
    '<div class="pl-row' + (I.bestStreak >= r.days || passOwns(r.kind, r.code) ? ' got' : '') + '"><span class="pl-n">' + r.days + '</span>' +
    '<span class="pl-r">' + passRewardArt(r.kind, r.code) + '<em>' + escapeHtml(passRewardName(r.kind, r.code)) + '</em></span>' +
    '<span class="pl-s">' + (passOwns(r.kind, r.code) ? '✅' : '🔒') + '</span></div>').join('');
  document.getElementById('passOk').textContent = P.ok;
  document.getElementById('passModal').classList.remove('hidden');
}
function closePassModal() { document.getElementById('passModal').classList.add('hidden'); }

// ---------- рамка и титул в профиле ----------
function renderStylePicker() {
  const box = document.getElementById('pfStyle');
  if (!box) return;
  box.classList.toggle('hidden', !onlineInfo);
  if (!onlineInfo) return;
  const P = t().pass;
  // Рамки выходных — коллекция: видны полученные и та, что разыгрывается
  // сейчас. Рамки лиг — только полученные: лиг больше нет
  const cupNow = onlineInfo.weekend && onlineInfo.weekend.frame;
  const frames = [null].concat(PASS_FRAMES.filter(f => !(f === 'tourney' || /^cup-/.test(f)) || passOwns('frame', f) || f === cupNow))
    .filter(f => !f || !passHiddenSource('frame', f))
    .concat(LEAGUE_FRAMES.filter(f => passOwns('frame', f)))
    .concat(shopOwnedCodes('frame'));
  const titles = [null].concat(PASS_TITLES.filter(x => !passHiddenSource('title', x))).concat(shopOwnedCodes('title'));
  const chip = (cls, sel, locked, html, fn) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls + (sel ? ' sel' : '') + (locked ? ' locked' : '');
    b.innerHTML = html;
    b.onclick = fn;
    return b;
  };
  document.getElementById('tPfFrames').textContent = P.frameHead;
  document.getElementById('pfFrames').replaceChildren(...frames.map(f => chip('st-frame', (onlineInfo.frame || null) === f,
    f && !passOwns('frame', f),
    '<span class="pr-art pr-frame" data-frame="' + (f || 'base') + '"></span><small>' + escapeHtml(f ? frameName(f) : P.frameBase) + '</small>',
    () => chooseStyle('frame', f))));
  document.getElementById('tPfTitles').textContent = P.titleHead;
  document.getElementById('pfShopLink').textContent = t().shop.more;
  document.getElementById('pfTitles').replaceChildren(...titles.map(x => chip('st-title', (onlineInfo.title || null) === x,
    x && !passOwns('title', x), escapeHtml(x ? P.titles[x] : P.titleNone), () => chooseStyle('title', x))));
}

async function chooseStyle(kind, code) {
  const P = t().pass;
  if (code && !passOwns(kind, code)) {
    return setNote('styleNote', P.locked.replace('{w}', passWhere(kind, code)), true);
  }
  const before = onlineInfo[kind];
  onlineInfo[kind] = code;
  renderStylePicker();
  fillProfile();
  setNote('styleNote', '');
  try {
    await friendRpc(kind === 'frame' ? 'set_frame' : 'set_title', kind === 'frame' ? { p_frame: code } : { p_title: code });
  } catch (e) {
    onlineInfo[kind] = before;
    renderStylePicker();
    fillProfile();
    setNote('styleNote', friendErrorText(e.message), true);
  }
}

// Фразы для чата: обычные, свои из наград и купленные в магазине
function sayCodesFor() {
  return SAY_CODES.concat(PASS_PHRASES.filter(c => passOwns('phrase', c))).concat(shopOwnedCodes('phrase'));
}
