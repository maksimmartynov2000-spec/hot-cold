// ================= СУНДУК ДНЯ, СЕРИЯ И СЕЗОННЫЙ ПУТЬ =================
// Всё считает база (миграция 053): очки за партии и задания, сундук раз в
// день после доигранной партии, серия дней с заморозкой раз в неделю,
// 30 ступеней пути с наградами. Игра только показывает и даёт надеть своё.
// Нет миграции — onlineInfo остаётся null, и ничего этого не видно

// Наборы — копии из базы (pass_frames и т. д.), сверяются тестом
const PASS_FRAMES = ['fire', 'ice', 'space', 'champion', 'streak'];
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
  if (s) return P.whereStreak.replace('{n}', s.days);
  return P.whereChest;
}
function passLevel() {
  if (!onlineInfo) return 0;
  return Math.min(onlineInfo.maxLevel, Math.floor(onlineInfo.xp / onlineInfo.levelXp));
}
// Название награды словами: «Рамка «Огонь»», «Фраза «Лава!»»
function passRewardName(kind, code) {
  const P = t().pass, q = v => P.q[0] + v + P.q[1];
  if (kind === 'frame') return P.kinds.frame + ' ' + q(P.frames[code]);
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

// ---------- карточка на экране онлайна ----------
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
  box.innerHTML =
    '<div class="od-top">' + chest +
      '<div class="od-streak' + (I.streak ? ' on' : '') + '"><b>🔥 ' + I.streak + '</b><small>' +
        escapeHtml(withPlural(I.streak, P.dayForms).replace(/^\S+\s/, '')) + '</small>' +
        (I.freezeLeft ? '<i title="' + escapeHtml(P.freezeHint) + '">❄️</i>' : '') + '</div>' +
    '</div>' +
    '<button class="od-pass" onclick="openPassModal()">' +
      '<span class="od-lvl"><b>' + lvl + '</b><small>/' + I.maxLevel + '</small></span>' +
      '<span class="od-bar"><span style="width:' + Math.round(100 * inLevel / I.levelXp) + '%"></span>' +
        '<em>' + escapeHtml(P.pathTitle) + ' · ' + inLevel + '/' + I.levelXp + '</em></span>' +
      (next ? '<span class="od-next">' + passRewardArt(next.kind, next.code) + '<small>' + next.level + '</small></span>' : '<span class="od-next">🏆</span>') +
    '</button>';
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
    return setNote('rkNote', friendErrorText(e.message), true);
  }
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
  document.getElementById('passHow').textContent = P.how;
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
  sr.innerHTML = '<div class="pl-head">🔥 ' + escapeHtml(P.streakHead) + '</div>' + (I.streakRewards || []).map(r =>
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
  const frames = [null].concat(PASS_FRAMES);
  const titles = [null].concat(PASS_TITLES);
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
    '<span class="pr-art pr-frame" data-frame="' + (f || leagueFrame()) + '"></span><small>' + escapeHtml(f ? P.frames[f] : P.frameLeague) + '</small>',
    () => chooseStyle('frame', f))));
  document.getElementById('tPfTitles').textContent = P.titleHead;
  document.getElementById('pfTitles').replaceChildren(...titles.map(x => chip('st-title', (onlineInfo.title || null) === x,
    x && !passOwns('title', x), escapeHtml(x ? P.titles[x] : P.titleNone), () => chooseStyle('title', x))));
}

function leagueFrame() {
  const FRAMES = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend'];
  return ladderInfo ? FRAMES[ladderPos(ladderInfo.stars).league] : 'base';
}
// Рамка своего кружка: выбранная с пути или цвета лиги
function myFrame() {
  return (onlineInfo && onlineInfo.frame) || leagueFrame();
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

// Фразы для чата: обычные и свои из наград
function sayCodesFor() {
  return SAY_CODES.concat(PASS_PHRASES.filter(c => passOwns('phrase', c)));
}
