// Всё, что идёт через Supabase: аккаунт и профиль, друзья и приглашения, онлайн-
// партии и рейтинг, задания и достижения, сигналы Realtime, переписка,
// уведомления, Испытание. Здесь же обучение и шторка «Передайте телефон»:
// они стояли в этом месте исходного файла, а порядок объявлений не меняли.

// ================= SUPABASE: обновления и таблица рекордов =================
const SUPABASE_URL = "https://fzakcsvyceqsnowvkxfu.supabase.co";
const SUPABASE_KEY = "sb_publishable_F-68zKeUGcA9i3bgqKtr6w_TElrOvg5";
const APP_VERSION = "1"; // повышайте вручную в Supabase (game_config.app_version) после каждого реального обновления кода

let sb = null;
try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) {}

// Параметры сложности «Забега» — можно менять в Supabase (game_config.run_config), без деплоя
let RUN_CONFIG = {
  start_range: 10, growth: 2.2, range_cap: 2000,
  buffer_start: 5, buffer_shrink: 1, squeeze_start: 8, min_attempts: 3
};

async function checkRemoteConfig() {
  if (!sb) return;
  try {
    const { data, error } = await sb.from('game_config').select('app_version, announcement, run_config').eq('id', 1).single();
    if (error || !data) return;
    if (data.run_config && typeof data.run_config === 'object') {
      RUN_CONFIG = Object.assign({}, RUN_CONFIG, data.run_config);
    }
    const banner = document.getElementById('updateBanner');
    if (data.app_version && String(data.app_version) !== APP_VERSION) {
      banner.textContent = t().updateAvailable;
      banner.onclick = () => location.reload();
      banner.classList.remove('hidden');
    } else if (data.announcement && localStorage.getItem('hc_ann_seen') !== data.announcement) {
      banner.textContent = data.announcement;
      banner.onclick = () => {
        localStorage.setItem('hc_ann_seen', data.announcement);
        banner.classList.add('hidden');
      };
      banner.classList.remove('hidden');
    }
  } catch (e) {}
}

// ================= ЗАБЕГ: аккаунт (имя + PIN, без email/пароля) =================
function runAuth() {
  const u = localStorage.getItem('hc_run_user');
  const p = localStorage.getItem('hc_run_pin');
  return (u && p) ? { username: u, pin: p } : null;
}

function runLogout() {
  localStorage.removeItem('hc_run_user');
  localStorage.removeItem('hc_run_pin');
  localStorage.removeItem('hc_run_since');
  localStorage.removeItem('hc_run_avatar');
  profileInfo = null;
  progressInfo = null;
  renderQuestCard();
  stopSignals();
  stopSeen();
}

// ================= ПРОФИЛЬ: иконка, имя, PIN =================
// Что сервер знает о своём аккаунте. null — не знаем: нет сети или сервер
// ещё без профиля (миграция не применена). Тогда новых кнопок не показываем
let profileInfo = null;

async function syncProfile() {
  const auth = runAuth();
  if (!auth || !sb) return null;
  let data;
  try {
    data = await friendRpc('my_profile');
  } catch (e) {
    return null;
  }
  if (!data || typeof data !== 'object' || !('since' in data) || myName() !== auth.username) return null;
  // Имя освобождается сразу после смены. Если его занял другой человек и
  // PIN совпал, по одному имени и PIN не понять, что аккаунт уже чужой.
  // Дата создания у каждого аккаунта своя — по ней и понятно
  const known = localStorage.getItem('hc_run_since');
  if (known && data.since && known !== String(data.since)) {
    signedOutElsewhere(t().run.ownerChanged);
    return null;
  }
  if (data.since) localStorage.setItem('hc_run_since', String(data.since));
  // Старый сервер цвета не знает — тогда свой выбор не трогаем
  setMyLook(data.avatar || '', 'color' in data ? (data.color || '') : myColor());
  profileInfo = data;
  // Обучение прошли, пока не были в аккаунте, — отметить в базе
  if ('tutorialDone' in data && !data.tutorialDone && tutorialComplete()) {
    friendRpc('tutorial_finished', {}).then(() => { if (profileInfo) profileInfo.tutorialDone = true; }).catch(() => {});
  }
  updateAccountChip();
  return data;
}

// Чип с именем ученика живёт рядом с переключателем языка и показывается
// только в хабе режима на рейтинг — во время самой игры он лишний и легко нажать случайно
// Кружок с буквой: первая буква имени и цвет, который из имени же и
// считается — у каждого свой и не меняется от входа к входу. Array.from, а
// не [0]: имя может начинаться с эмодзи, и половинка суррогатной пары
// нарисовалась бы квадратиком
const AVATAR_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6',
                       '#a78bfa', '#fb923c', '#2dd4bf', '#a3e635'];
function avatarColor(name) {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function avatarLetter(name) {
  const first = Array.from(String(name || '').trim())[0];
  return first ? first.toUpperCase() : '?';
}
// Набор иконок. Вторая копия — в базе (avatar_choices), они сверяются тестом.
// Только животные из готового списка: свободный текст в кружке у детского
// приложения — лишний риск, а набор проверяет сама база
// Цвета фона на выбор. Вторая копия — в базе (avatar_colors), сверяются
// тестом. Первые восемь — те же, что считаются из имени: кто цвет не
// выбирал, у того он и остаётся прежним
const AVATAR_BG = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa',
                   '#fb923c', '#2dd4bf', '#a3e635', '#f87171', '#e2e8f0'];
const AVATAR_CHOICES = ['🦊', '🐼', '🐯', '🦁', '🐨', '🐸', '🐵', '🐧', '🦉', '🐙', '🦄', '🐊', '🐶', '🐱', '🐰', '🐻', '🦙', '🐹', '🐥', '🐢', '🦋', '🐝', '🐬', '🦈'];

// Иконки других игроков: имя → { icon, color }; пустые — буква и цвет из
// имени. Заполняется по мере того, как имена появляются в списках, заново —
// при входе в «Друзья»
const avatarCache = {};

function myName() {
  const a = runAuth();
  return a ? a.username : null;
}

// Своя иконка и цвет хранятся с именем: после выхода и входа под другим
// аккаунтом чужие не должны остаться в шапке
function myLook() {
  try {
    const v = JSON.parse(localStorage.getItem('hc_run_avatar') || 'null');
    if (v && v.user === myName()) return { avatar: v.avatar || '', color: v.color || '' };
  } catch (e) {}
  return { avatar: '', color: '' };
}
function setMyLook(avatar, color) {
  try {
    localStorage.setItem('hc_run_avatar',
      JSON.stringify({ user: myName(), avatar: avatar || '', color: color || '' }));
  } catch (e) {}
}
function myAvatar() { return myLook().avatar; }
function myColor() { return myLook().color; }
function setMyAvatar(avatar) { setMyLook(avatar, myColor()); }
function setMyColor(color) { setMyLook(myAvatar(), color); }

function avatarOf(name) {
  if (name && name === myName()) return myAvatar();
  if (botOf(name)) return botOf(name).icon;
  return (avatarCache[name] || {}).icon || '';
}

// Выбранный цвет, а если не выбран — тот, что считается из имени
function colorOf(name) {
  if (botOf(name)) return botOf(name).color;
  const chosen = (name && name === myName()) ? myColor() : (avatarCache[name] || {}).color;
  return chosen || avatarColor(name);
}

function paintAvatar(el, name) {
  const icon = avatarOf(name);
  // Иконка — рисунком (js/art.js); иконка, которой в наборе уже нет, — эмодзи; без иконки — буква
  const art = icon ? iconArt(icon, 0) : '';
  if (art) el.innerHTML = art; else el.textContent = icon || avatarLetter(name);
  el.classList.toggle('has-icon', !!icon);
  el.classList.toggle('has-art', !!art);
  const bg = colorOf(name);
  el.style.background = avatarBgCss(bg);
  el.classList.toggle('shine', isShinyBg(bg));
  el.dataset.avatarFor = name;
}

function repaintAvatarsOf(name) {
  document.querySelectorAll('.avatar[data-avatar-for], #pfAvatar[data-avatar-for]').forEach(el => {
    if (el.dataset.avatarFor === name) paintAvatar(el, name);
  });
}

// Узнаём иконки тех, кого видно в списке, одним запросом — и только тех,
// чьих иконок ещё не знаем. Сервер без профиля отвечает ошибкой: тогда
// остаются буквы, и больше не спрашиваем
let avatarsSupported = true;
async function fetchAvatars(names) {
  if (!avatarsSupported || !runAuth()) return;
  const me = myName();
  const want = [...new Set(names)].filter(n =>
    n && n !== me && String(n).charAt(0) !== '#' && !(n in avatarCache)).slice(0, 200);
  if (!want.length) return;
  let rows;
  try {
    rows = await friendRpc('avatars_for', { p_names: want });
  } catch (e) {
    if (/avatars_for|function|schema/i.test(e.message)) avatarsSupported = false;
    return;
  }
  want.forEach(n => { avatarCache[n] = { icon: '', color: '' }; });
  (Array.isArray(rows) ? rows : []).forEach(r => {
    avatarCache[r.username] = { icon: r.avatar || '', color: r.color || '' };
  });
  document.querySelectorAll('.avatar[data-avatar-for]').forEach(el => {
    if (want.indexOf(el.dataset.avatarFor) >= 0) paintAvatar(el, el.dataset.avatarFor);
  });
}

function updateAccountChip() {
  const chip = document.getElementById('accountChip');
  const auth = runAuth();
  // Профиль виден везде, кроме самой партии: без аккаунта он же — настройки,
  // а язык должен быть под рукой и у того, кто ещё не вошёл
  const show = screen !== 'game';
  chip.classList.toggle('hidden', !show);
  chip.classList.toggle('guest', !auth);
  const face = document.getElementById('accountChipName');
  if (auth) {
    paintAvatar(face, auth.username);
    chip.style.background = colorOf(auth.username);
    chip.title = auth.username;
  } else {
    face.textContent = '⚙';
    chip.style.background = '';
    chip.title = t().run.settings;
  }
  chip.setAttribute('aria-label', chip.title);

  // Друзья живут в шапке рядом с профилем: это не режим игры, а место,
  // куда заходят между делом
  // Кнопка видна и без аккаунта: иначе про друзей никто не узнает, пока
  // случайно не зайдёт в онлайн. Нажатие приведёт ко входу
  const fr = document.getElementById('friendsBtn');
  fr.classList.toggle('hidden', screen === 'game' || screen === 'setup');
}

// Значок на кнопке считает и непрочитанные фразы, и неотвеченные заявки:
// и то и другое ждёт ответа
function setFriendsBadge(rows) {
  const n = (rows || []).reduce((sum, r) =>
    sum + (r.unread || 0) + (r.relation === 'incoming' ? 1 : 0), 0);
  const badge = document.getElementById('friendsBadge');
  badge.textContent = n > 9 ? '9+' : String(n);
  badge.classList.toggle('hidden', n === 0);
}

// Тексты окна отдельно от открытия: язык меняют прямо в этом окне, и оно
// должно тут же заговорить на новом, не закрываясь
function fillProfile() {
  const auth = runAuth();
  const L = t();
  const face = document.getElementById('pfAvatar');
  face.classList.toggle('guest', !auth);
  if (auth) {
    paintAvatar(face, auth.username);
  } else {
    face.textContent = '⚙';
    face.style.background = '';
  }
  document.getElementById('accountName').textContent = auth ? auth.username : L.run.settings;
  document.getElementById('tAccountTitle').textContent = '';
  // Старый PIN из 4 цифр — предложить сменить на 6
  const short = !!(auth && /^[0-9]{4}$/.test(auth.pin || ''));
  const warn = document.getElementById('pfPinShort');
  warn.textContent = short ? L.run.pinShort : '';
  warn.classList.toggle('hidden', !short);
  const lg = document.getElementById('pfLeague');
  lg.classList.toggle('hidden', !(auth && ladderInfo));
  if (auth && ladderInfo) {
    lg.textContent = leagueLabel(ladderInfo.stars) +
      (ladderInfo.stars < 150 ? ' ' + starsLine(ladderInfo.stars) : '');
    // Значки прошлых сезонов: лучшая лига и месяц
    const badges = (ladderInfo.badges || []).map(b =>
      LEAGUE_ICONS[b.league] + ' ' + String(b.season).slice(5) + '.' + String(b.season).slice(0, 4));
    if (badges.length) {
      const row = document.createElement('span');
      row.className = 'pf-badges';
      row.textContent = L.run.lgSeasons + ': ' + badges.join('  ');
      lg.appendChild(row);
    }
  }
  fillProgressProfile();
  document.getElementById('pfAccount').classList.toggle('hidden', !auth);
  document.getElementById('pfLogout').classList.toggle('hidden', !auth);
  document.getElementById('tDeleteAccount').classList.toggle('hidden', !auth);
  document.getElementById('tSignIn').classList.toggle('hidden', !!auth);
  document.getElementById('tSignIn').textContent = L.run.signIn;
  document.getElementById('tLangLabel').textContent = L.run.language;
  document.getElementById('tProfileDone').textContent = L.run.done;
  document.getElementById('tLogoutStart').textContent = L.run.logout;
  document.getElementById('tLogoutCancel').textContent = L.run.cancel;
  document.getElementById('tLogoutConfirm').textContent = L.run.logout;
  document.getElementById('tAvatarStart').textContent =
    colorsSupported() ? L.run.avatarColorChange : L.run.avatarChange;
  document.getElementById('tRenameStart').textContent = L.run.renameStart;
  document.getElementById('tNamePinHead').textContent = L.run.namePin;
  document.getElementById('tBlockedHead').textContent = L.online.blHead;
  document.getElementById('tRenameSave').textContent = L.run.save;
  document.getElementById('tRenameCancel').textContent = L.run.cancel;
  document.getElementById('renameInput').placeholder = L.run.renameNew;
  document.getElementById('tPinStart').textContent = L.run.pinStart;
  document.getElementById('tPinSave').textContent = L.run.save;
  document.getElementById('tPinCancel').textContent = L.run.cancel;
  document.getElementById('pinOld').placeholder = L.run.pinOld;
  document.getElementById('pinNew').placeholder = L.run.pinNew;
  document.getElementById('pinHintNew').placeholder = L.run.pinHintNew;
  // Иконки, имя и PIN — только когда сервер умеет профиль
  document.getElementById('pfAvatarBox').classList.toggle('hidden', !(auth && profileInfo));
  face.classList.toggle('editable', !!(auth && profileInfo));
  document.getElementById('pfEdit').classList.toggle('hidden', !(auth && profileInfo));
  document.getElementById('pfBlockedFold').classList.toggle('hidden', !(auth && profileInfo));
  document.getElementById('tMoreHead').textContent = L.more;
  if (auth && profileInfo) renderAvatarGrid();
  if (auth) {
    paintPinButton();
    document.getElementById('tLogoutAsk').textContent = L.run.logoutAsk.replace('{name}', auth.username);
    document.getElementById('tDeleteAccount').textContent = L.online.deleteAccount;
    renderPushToggle();
  }
}

function openLogoutModal() {
  const auth = runAuth();
  askLogout(false);
  hideOwnPin();
  showAvatarPicker(false);
  openRename(false);
  openPinChange(false);
  document.getElementById('pfEditFold').open = false;
  document.getElementById('pfMoreFold').open = false;
  ['avNote', 'renameNote', 'pinNote'].forEach(id => setNote(id, ''));
  fillProfile();
  if (auth) {
    setNote('pushNote', '');
    loadPushState();
    // Свежие иконку и «сколько ждать до смены имени» — с сервера; пока они
    // идут, окно уже открыто с тем, что известно
    syncProfile().then(() => {
      if (!document.getElementById('logoutModal').classList.contains('hidden')) fillProfile();
    });
    loadLadder().then(() => {
      if (!document.getElementById('logoutModal').classList.contains('hidden')) fillProfile();
    });
    loadProgress().then(() => {
      if (!document.getElementById('logoutModal').classList.contains('hidden')) fillProfile();
    });
  }
  document.getElementById('logoutModal').classList.remove('hidden');
}

function showAvatarPicker(show) {
  document.getElementById('avGrid').classList.toggle('hidden', !show);
}

function toggleAvatarPicker() {
  showAvatarPicker(document.getElementById('avGrid').classList.contains('hidden'));
}

// Сервер умеет цвет — значит, миграция с цветом применена
function colorsSupported() {
  return !!(profileInfo && 'color' in profileInfo);
}

function renderAvatarGrid() {
  const grid = document.getElementById('avGrid');
  const me = myName();
  const current = myAvatar();
  const bg = colorOf(me);
  grid.innerHTML = '';
  // Сверху — цвета фона, два ряда по пять; ниже — буква и животные уже на
  // выбранном цвете: сразу видно, как это будет выглядеть
  // Награды за лиги — только когда сервер знает лиги
  const rewardsOf = kind => ladderInfo ? LEAGUE_REWARDS.filter(r => r.kind === kind).map(r => r.value) : [];
  if (colorsSupported()) {
    AVATAR_BG.concat(rewardsOf('color')).forEach(color => {
      const c = document.createElement('button');
      const locked = rewardLeague('color', color) > 0 && !rewardOpen('color', color);
      c.className = 'av-color' + (color === bg ? ' sel' : '') + (locked ? ' locked' : '');
      c.dataset.color = color;
      c.style.background = avatarBgCss(color);
      c.setAttribute('aria-label', color);
      c.onclick = () => chooseColor(color);
      grid.appendChild(c);
    });
    const sep = document.createElement('div');
    sep.className = 'av-sep';
    grid.appendChild(sep);
  }
  // Первая клетка — буква: вернуться к ней можно так же, как выбрать иконку
  // Иконка за обучение — когда сервер о ней знает (миграция 037)
  const tutIcon = profileInfo && 'tutorialDone' in profileInfo ? [TUTORIAL_ICON] : [];
  // Иконки за серию заданий — когда сервер знает задания (миграция 041)
  const questIcons = progressInfo ? QUEST_ICONS.map(q => q.icon) : [];
  ['', ...AVATAR_CHOICES, ...rewardsOf('icon'), ...tutIcon, ...questIcons].forEach(icon => {
    const b = document.createElement('button');
    const locked = icon === TUTORIAL_ICON ? !tutorialIconOpen()
      : questIconDays(icon) ? !questIconOpen(icon)
      : rewardLeague('icon', icon) > 0 && !rewardOpen('icon', icon);
    b.className = 'av-tile' + (icon ? '' : ' letter') + (icon === current ? ' sel' : '') + (locked ? ' locked' : '');
    b.dataset.icon = icon;
    const art = icon ? iconArt(icon, 0) : '';
    if (art) b.innerHTML = art; else b.textContent = icon || avatarLetter(me);
    b.classList.toggle('has-art', !!art);
    b.style.background = avatarBgCss(bg);
    b.onclick = () => chooseAvatar(icon);
    grid.appendChild(b);
  });
}

// Цвет виден сразу; сетка не сворачивается — после цвета часто выбирают и
// животное. Сервер не принял — возвращаем прежний
// Закрытая награда: говорим, в какой лиге она откроется
function lockedNote(kind, value) {
  if (!rewardLeague(kind, value) || rewardOpen(kind, value)) return false;
  setNote('avNote', t().run.lgLocked.replace('{l}', t().leagues[rewardLeague(kind, value)]), true);
  return true;
}

async function chooseColor(color) {
  if (lockedNote('color', color)) return;
  const before = myColor();
  if (color === colorOf(myName())) return;
  setMyColor(color);
  fillProfile();
  updateAccountChip();
  repaintAvatarsOf(myName());
  setNote('avNote', '');
  try {
    await friendRpc('set_avatar_color', { p_color: color });
    if (profileInfo) profileInfo.color = color;
  } catch (e) {
    if (!runAuth()) return;
    setMyColor(before);
    fillProfile();
    updateAccountChip();
    repaintAvatarsOf(myName());
    setNote('avNote', friendErrorText(e.message), true);
  }
}

// Выбор видно сразу; если сервер не принял — возвращаем прежнюю
function tutorialIconOpen() {
  return !!(profileInfo && profileInfo.tutorialDone) || tutorialComplete();
}

async function chooseAvatar(icon) {
  if (lockedNote('icon', icon)) return;
  if (questIconDays(icon) && !questIconOpen(icon)) {
    return setNote('avNote', t().prog.streakLocked.replace('{n}', questIconDays(icon)), true);
  }
  if (icon === TUTORIAL_ICON) {
    if (!tutorialIconOpen()) return setNote('avNote', t().tut.tutIconLocked, true);
    // Обучение пройдено без входа — сначала сказать базе, иначе иконку не примет
    if (!(profileInfo && profileInfo.tutorialDone)) {
      try { await friendRpc('tutorial_finished', {}); if (profileInfo) profileInfo.tutorialDone = true; } catch (e) {}
    }
  }
  const before = myAvatar();
  // Выбрал — сетка сворачивается: новая иконка видна в большом кружке
  showAvatarPicker(false);
  if (icon === before) return;
  setMyAvatar(icon);
  fillProfile();
  updateAccountChip();
  setNote('avNote', '');
  try {
    await friendRpc('set_avatar', { p_avatar: icon || null });
    if (profileInfo) profileInfo.avatar = icon || null;
  } catch (e) {
    if (!runAuth()) return;
    setMyAvatar(before);
    fillProfile();
    updateAccountChip();
    setNote('avNote', friendErrorText(e.message), true);
  }
}

function openRename(show) {
  const L = t().run;
  const wait = profileInfo ? profileInfo.renameWaitHours : 0;
  // Раньше суток не пускаем и не открываем поле зря — говорим, сколько ждать
  if (show && wait > 0) {
    setNote('renameNote', L.renameWait.replace('{n}', wait), true);
    return;
  }
  document.getElementById('renameBox').classList.toggle('hidden', !show);
  document.getElementById('tRenameStart').classList.toggle('hidden', !!show);
  syncProfileDone();
  if (show) {
    setNote('renameNote', '');
    const input = document.getElementById('renameInput');
    input.value = myName() || '';
    input.focus();
  }
}

function profileErrorText(message) {
  const L = t().run;
  const m = String(message || '');
  const wait = m.match(/rename_too_soon:(\d+)/);
  if (wait) return L.renameWait.replace('{n}', wait[1]);
  if (m.indexOf('name_taken') >= 0) return L.errTaken;
  if (m.indexOf('invalid_username') >= 0) return L.errName;
  if (m.indexOf('invalid_pin') >= 0) return L.errPin;
  if (m.indexOf('auth_failed') >= 0) return L.errWrongPin;
  if (m.indexOf('locked_out') >= 0) return L.errLocked;
  return friendErrorText(m);
}

async function saveRename() {
  const L = t().run;
  const next = (document.getElementById('renameInput').value || '').trim();
  const before = myName();
  if (next.length < 2 || next.length > 20 || next.charAt(0) === '#') {
    return setNote('renameNote', L.errName, true);
  }
  if (next === before) return openRename(false);
  const icon = myAvatar();
  const color = myColor();
  const btn = document.getElementById('tRenameSave');
  btn.disabled = true;
  try {
    const renamed = await friendRpc('rename_student', { p_new: next });
    localStorage.setItem('hc_run_user', renamed);
    setMyLook(icon, color);
    if (profileInfo) profileInfo.renameWaitHours = 24;
    openRename(false);
    fillProfile();
    updateAccountChip();
    setNote('renameNote', L.renameDone);
  } catch (e) {
    if (runAuth()) setNote('renameNote', profileErrorText(e.message), true);
  } finally {
    btn.disabled = false;
  }
}

function openPinChange(show) {
  document.getElementById('pinBox').classList.toggle('hidden', !show);
  document.getElementById('tPinStart').classList.toggle('hidden', !!show);
  syncProfileDone();
  ['pinOld', 'pinNew', 'pinHintNew'].forEach(id => { document.getElementById(id).value = ''; });
  if (show) {
    setNote('pinNote', '');
    document.getElementById('pinOld').focus();
  }
}

// PIN меняется по текущему PIN, который вводят руками, — не тому, что лежит
// в браузере: случайно, мимоходом, его не сменить. Запрос идёт мимо
// friendRpc: неверный текущий PIN здесь — просто опечатка, а не повод выходить
async function savePin() {
  const L = t().run;
  const auth = runAuth();
  if (!auth || !sb) return setNote('pinNote', L.errNoConn, true);
  const old = document.getElementById('pinOld').value.trim();
  const next = document.getElementById('pinNew').value.trim();
  const hint = (document.getElementById('pinHintNew').value || '').trim().slice(0, 60);
  // Текущий — 4 или 6 цифр (старые аккаунты), новый — всегда 6
  if (!/^([0-9]{4}|[0-9]{6})$/.test(old) || !/^[0-9]{6}$/.test(next)) return setNote('pinNote', L.errPin, true);
  const btn = document.getElementById('tPinSave');
  btn.disabled = true;
  try {
    const { error } = await sb.rpc('change_pin',
      { p_username: auth.username, p_pin: old, p_new_pin: next, p_hint: hint || null });
    if (error) return setNote('pinNote', profileErrorText(error.message), true);
    localStorage.setItem('hc_run_pin', next);
    openPinChange(false);
    fillProfile();
    setNote('pinNote', hint ? L.pinDoneHint : L.pinDone);
  } catch (e) {
    setNote('pinNote', L.errNoConn, true);
  } finally {
    btn.disabled = false;
  }
}

function closeLogoutModal() {
  hideOwnPin();
  document.getElementById('logoutModal').classList.add('hidden');
}

// Вопрос «выйти?» появляется только после нажатия «Выйти», а «Отмена»
// прячет его обратно, не закрывая профиль
function askLogout(show) {
  document.getElementById('logoutConfirmBox').classList.toggle('hidden', !show);
  document.getElementById('tLogoutStart').classList.toggle('hidden', !!show);
  syncProfileDone();
}

// Пока открыт вопрос о выходе или форма имени и PIN, у них своя синяя кнопка.
// Вторая синяя — «Готово» — спорила бы с ней, какая главная
function syncProfileDone() {
  const open = ['logoutConfirmBox', 'renameBox', 'pinBox']
    .some(id => !document.getElementById(id).classList.contains('hidden'));
  document.getElementById('tProfileDone').classList.toggle('hidden', open);
}

function signInFromProfile() {
  closeLogoutModal();
  authReturn = 'mode';
  showScreen('authChoice');
}

function confirmLogout() {
  closeLogoutModal();
  runLogout();
  showScreen('mode');
}

// Удаление аккаунта. Спрашиваем отдельным окном и пишем, что именно исчезнет:
// рейтинг и друзей вернуть будет нечем
function openDeleteModal() {
  const auth = runAuth();
  if (!auth) return;
  const L = t().online;
  closeLogoutModal();
  document.getElementById('tDeleteAsk').textContent =
    L.deleteAsk.replace('{name}', auth.username);
  document.getElementById('tDeleteCancel').textContent = t().run.cancel;
  document.getElementById('tDeleteGo').textContent = L.deleteGo;
  setNote('deleteNote', '');
  document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.add('hidden');
}

async function confirmDelete() {
  try {
    await friendRpc('delete_account');
  } catch (e) {
    return setNote('deleteNote', friendErrorText(e.message), true);
  }
  closeDeleteModal();
  runLogout();
  stopFriendsPoll();
  stopRankedPoll();
  stopOnlinePoll();
  online = null;
  mode = null;
  applyTranslations();
  showScreen('mode');
  alert(t().online.deleted);
}

let runAuthMode = 'login';

// Куда вернуться после входа: аккаунт нужен и рейтингу, и онлайну
let authReturn = 'runHub';

function afterAuth() {
  // Запомнить, чей это аккаунт, и подтянуть свою иконку
  syncProfile();
  startSignals();
  startSeen();
  // Пришёл по ссылке-приглашению и только что вошёл — теперь можно добавить
  if (pendingInvite()) setTimeout(checkPendingInvite, 300);
  if (authReturn === 'mode') return showScreen('mode');
  if (authReturn === 'online') return openOnline();
  if (authReturn === 'friends') return openFriends();
  return openRunHub();
}

function openRunEntry() {
  if (!onlineOpen()) return openLessonGate();
  authReturn = 'runHub';
  if (runAuth()) openRunHub(); else showScreen('authChoice');
}

function openOnlineEntry() {
  if (!onlineOpen()) return openLessonGate();
  authReturn = 'online';
  if (runAuth()) openOnline(); else showScreen('authChoice');
}

function openFriendsEntry() {
  if (!onlineOpen()) return openLessonGate();
  authReturn = 'friends';
  if (runAuth()) openFriends(); else showScreen('authChoice');
}

// Открывает форму заново: поля чистые, ошибок нет
function showRunAuth(authMode) {
  const L = t();
  runAuthMode = authMode;
  document.getElementById('runUsername').value = '';
  document.getElementById('runPin').value = '';
  document.getElementById('runHint').value = '';
  // подсказку пишут при регистрации, а спрашивают при входе
  document.getElementById('hintField').classList.toggle('hidden', authMode !== 'register');
  document.getElementById('tRunForgot').classList.toggle('hidden', authMode !== 'login');
  document.getElementById('runAuthTitle').textContent =
    authMode === 'register' ? L.run.registerTitle : L.run.loginTitle;
  document.getElementById('runAuthSubmitBtn').textContent =
    authMode === 'register' ? L.run.registerBtn : L.run.loginBtn;
  // Вход — старым 4-значным PIN тоже; регистрация — только 6 цифр
  document.getElementById('tRunPin').textContent = authMode === 'register' ? L.run.pin : L.run.pinLogin;
  // В подсказке не «123456»: ребёнок так и вводил
  document.getElementById('runPin').placeholder = authMode === 'register' ? L.run.pinPh : '';
  showRunPin(false);
  runAuthError('');
  showScreen('auth');
}

// Показывает/прячет ошибку, НЕ трогая введённые поля
function runAuthError(msg) {
  const err = document.getElementById('runAuthError');
  if (msg) { err.textContent = msg; err.classList.remove('hidden'); }
  else { err.textContent = ''; err.classList.add('hidden'); }
}

function runAuthSubmit() {
  return runAuthMode === 'register' ? runRegister() : runLogin();
}

function runAuthReadForm() {
  return {
    username: (document.getElementById('runUsername').value || '').trim(),
    pin: (document.getElementById('runPin').value || '').trim()
  };
}

function runAuthErrorText(message) {
  const L = t();
  const m = String(message || '');
  if (m.indexOf('invalid_username') >= 0) return L.run.errName;
  if (m.indexOf('invalid_pin') >= 0) return L.run.errPin;
  if (m.indexOf('locked_out') >= 0) return L.run.errLocked;
  if (m.indexOf('too_many_signups') >= 0) return L.run.errTooMany;
  if (m.indexOf('implausible_score') >= 0) return L.run.errImplausible;
  return L.run.errServer + m;
}

async function runRegister() {
  const L = t();
  const { username, pin } = runAuthReadForm();
  if (username.length < 2 || username.length > 20) return runAuthError(L.run.errName);
  // Новые аккаунты — 6 цифр: 4 цифры подбираются за пару недель
  if (!/^[0-9]{6}$/.test(pin)) return runAuthError(L.run.errPin);
  if (!sb) return runAuthError(L.run.errNoConn);
  const btn = document.getElementById('runAuthSubmitBtn');
  btn.disabled = true;
  try {
    const hint = (document.getElementById('runHint').value || '').trim().slice(0, 60);
    const { data, error } = await sb.rpc('register_student',
      { p_username: username, p_pin: pin, p_hint: hint || null });
    if (error) return runAuthError(runAuthErrorText(error.message));
    if (data === false) return runAuthError(L.run.errTaken);
    localStorage.setItem('hc_run_user', username);
    localStorage.setItem('hc_run_pin', pin);
    afterAuth();
  } catch (e) {
    runAuthError(L.run.errNoConn);
  } finally {
    btn.disabled = false;
  }
}

async function runLogin() {
  const L = t();
  const { username, pin } = runAuthReadForm();
  if (!username || !pin) return runAuthError(L.run.errFill);
  if (!sb) return runAuthError(L.run.errNoConn);
  const btn = document.getElementById('runAuthSubmitBtn');
  btn.disabled = true;
  try {
    const { data, error } = await sb.rpc('login_student', { p_username: username, p_pin: pin });
    if (error) return runAuthError(runAuthErrorText(error.message));
    if (data !== true) return runAuthError(L.run.errBadLogin);
    localStorage.setItem('hc_run_user', username);
    localStorage.setItem('hc_run_pin', pin);
    afterAuth();
  } catch (e) {
    runAuthError(L.run.errNoConn);
  } finally {
    btn.disabled = false;
  }
}

// Подсказку к PIN ученик пишет сам, и она не секрет — иначе от неё не было бы толку
async function showPinHint() {
  const L = t();
  const username = (document.getElementById('runUsername').value || '').trim();
  if (!username) return runAuthError(L.run.errFill);
  if (!sb) return runAuthError(L.run.errNoConn);
  try {
    const { data, error } = await sb.rpc('get_pin_hint', { p_username: username });
    if (error) return runAuthError(runAuthErrorText(error.message));
    runAuthError(data ? L.run.hintIs + data : L.run.noHint);
  } catch (e) {
    runAuthError(L.run.errNoConn);
  }
}

// Свой собственный PIN на своём же устройстве: он и так лежит в браузере,
// так что показать его владельцу — это не раскрытие, а напоминание
// PIN на экране — ровно пока нужен: нажал ещё раз — спрятался, забыл
// спрятать — спрячется сам через 10 секунд (вдруг рядом кто-то смотрит)
const PIN_SHOW_MS = 10000;
let pinTimer = null;

function revealOwnPin() {
  const auth = runAuth();
  if (!auth) return;
  if (pinTimer) return hideOwnPin();
  pinTimer = setTimeout(hideOwnPin, PIN_SHOW_MS);
  paintPinButton();
}

function hideOwnPin() {
  if (pinTimer) clearTimeout(pinTimer);
  pinTimer = null;
  paintPinButton();
}

function paintPinButton() {
  const btn = document.getElementById('tShowPin');
  const auth = runAuth();
  const L = t().run;
  btn.classList.toggle('pin-shown', !!(pinTimer && auth));
  if (!pinTimer || !auth) { btn.textContent = L.showPin; return; }
  btn.textContent = L.yourPin + auth.pin;
  const hint = document.createElement('span');
  hint.className = 'pin-hide';
  hint.textContent = L.pinHide;
  btn.appendChild(hint);
}

async function openRunHub(message) {
  const auth = runAuth();
  if (!auth) return showScreen('authChoice');
  document.getElementById('runHubMessage').innerHTML = message || '';
  setNote('runNote', '');
  renderUnfinished();
  renderRunRules();
  showScreen('runHub');
  await loadRunPending();
  await renderRunLeaderboard();
}

// Правила Испытания. Раскрыты, пока человек ни разу его не начинал
function renderRunRules() {
  const R = t().run;
  document.getElementById('tRunRulesHead').textContent = R.rulesHead;
  document.getElementById('runRulesList').replaceChildren(...R.rules.map(line => {
    const li = document.createElement('li');
    li.textContent = line;
    return li;
  }));
  let seen = false;
  try { seen = localStorage.getItem('hc_run_rules_seen') === '1'; } catch (e) {}
  document.getElementById('runRules').open = !seen;
}

function showRunPin(show) {
  document.getElementById('runPin').type = show ? 'text' : 'password';
  document.getElementById('runPinEye').classList.toggle('on', show);
}

function toggleRunPinEye() {
  showRunPin(document.getElementById('runPin').type === 'password');
}

// Личный рекорд знаем из двух бесплатных источников: ответа сервера при отправке
// результата и собственной строки в общем топе. Отдельный запрос ради него не нужен.
//
// Ключ — с именем ученика. На одном телефоне играют по очереди: с общим ключом
// следующий вошедший видел чужой рекорд как свой
function runBestKey() {
  const auth = runAuth();
  return auth ? 'hc_run_best_' + auth.username.toLowerCase() : null;
}

function runBest() {
  const key = runBestKey();
  if (!key) return 0;
  const v = parseInt(localStorage.getItem(key));
  return isNaN(v) ? 0 : v;
}

function rememberRunBest(value) {
  const key = runBestKey();
  if (!key) return;
  if (typeof value === 'number' && value > runBest()) {
    try { localStorage.setItem(key, String(value)); } catch (e) {}
  }
}

// 'week' — топ за последние 7 дней, 'all' — за всё время.
// Дневной по умолчанию: вечный топ застывает, недельный к пятнице уже решён,
// а сегодняшний догоняем за один вечер — ради этого и возвращаются
let leaderboardScope = 'day';
const LB_RPC = { day: 'run_leaderboard_daily', week: 'run_leaderboard_weekly', all: 'run_leaderboard' };

function setLeaderboardScope(scope) {
  leaderboardScope = scope;
  renderRunLeaderboard();
}

// Строка любого топа — рейтинга и «Испытания» одинаково. Первые три —
// медалями: место читается с одного взгляда
// Место — цифрой в кружке, первые три — золотой, серебряный, бронзовый.
// Медали-эмодзи путались с медалями лиг: «🥇 Аня … 🥇 Золото 1»
function topRow(i, name, points, isMe) {
  const row = document.createElement('div');
  row.className = 'lb-row rk-top-row' + (isMe ? ' me' : '');
  const place = document.createElement('span');
  place.className = 'rk-place' + (i < 3 ? ' p' + (i + 1) : '');
  place.textContent = String(i + 1);
  const face = document.createElement('span');
  face.className = 'avatar';
  paintAvatar(face, name);
  const who = document.createElement('span');
  who.className = 'rk-who';
  who.textContent = name;
  const pts = document.createElement('span');
  pts.className = 'rk-pts';
  pts.textContent = typeof points === 'number' ? formatNum(points) : points;
  row.append(place, face, who, pts);
  return row;
}

async function renderRunLeaderboard() {
  const el = document.getElementById('runLeaderboardList');
  if (!sb || !el) return;
  const L = t();
  const auth = runAuth();
  document.getElementById('tRunTopDay').classList.toggle('active', leaderboardScope === 'day');
  document.getElementById('tRunTopWeek').classList.toggle('active', leaderboardScope === 'week');
  document.getElementById('tRunTopAll').classList.toggle('active', leaderboardScope === 'all');
  el.innerHTML = '';
  try {
    let { data, error } = await sb.rpc(LB_RPC[leaderboardScope]);
    // пока миграция со срезом не применена — показываем общий топ, а не пустоту
    if (error && leaderboardScope !== 'all') {
      ({ data, error } = await sb.rpc(LB_RPC.all));
    }
    if (error) return;
    if (!data || !data.length) {
      el.innerHTML = '<div class="lb-empty">' + L.run.noScores + '</div>';
      return;
    }
    // Заменяем целиком, а не дописываем: два запроса подряд (быстро
    // переключили вкладку) иначе сложили бы строки дважды
    el.replaceChildren(...data.map((r, i) => {
      const isMe = !!auth && String(r.username).toLowerCase() === auth.username.toLowerCase();
      if (isMe && leaderboardScope === 'all') rememberRunBest(r.best_run_score);
      return topRow(i, r.username, r.best_run_score, isMe);
    }));
    fetchAvatars(data.map(r => r.username));
  } catch (e) {}
}

// ================= ОНЛАЙН: ДРУЗЬЯ =================
// Список опрашивается, пока экран открыт: входящая заявка должна появиться
// сама, без перезахода. Раз в десять секунд — заметить успеваешь, а нагрузка
// остаётся крошечной: два запроса в минуту на одного открытого игрока
const FRIENDS_POLL_MS = 10000;
let friendsTimer = null;
let friendsBusy = false;

// Рейтинг и друзья — разные экраны. На одном они мешали друг другу: за
// рейтингом приходят играть сейчас, к друзьям — договариваться
function openOnline() {
  const auth = runAuth();
  if (!auth) { authReturn = 'online'; return showScreen('authChoice'); }
  setNote('rkNote', '');
  applyTranslations();
  renderRankedModes();
  renderRanked(null);
  showScreen('online');
  startOnlinePoll();
  loadFriends(true);
  loadMatches();
  loadRanked();
  // Лестница меняется только после партии — спрашиваем при входе, не в опросе
  loadLadder().then(() => { if (screen === 'online') { renderRanked(null); loadEloTop(); } });
}

// Раскрыт ли поиск, решаем один раз за заход на экран — по первому списку
// друзей. Дальше решает игрок: опрос каждые 10 секунд его выбор не трогает
let findDecided = false;

function openFriends() {
  const auth = runAuth();
  if (!auth) { authReturn = 'friends'; return showScreen('authChoice'); }
  friendsData = null;
  friendMatches = [];
  document.getElementById('findBox').open = false;
  findDecided = false;
  // Иконки могли смениться с прошлого раза — спрашиваем заново
  Object.keys(avatarCache).forEach(k => { delete avatarCache[k]; });
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('friendSearch').value = '';
  setNote('searchNote', '');
  setNote('friendsNote', '');
  setNote('gamesNote', '');
  closeChallenge();
  applyTranslations();
  showScreen('friends');
  startFriendsPoll();
  loadFriends();
  loadMatches();
  loadSuggestions();
}

function startFriendsPoll() {
  stopFriendsPoll();
  friendsTimer = setInterval(() => {
    if (screen !== 'friends') return stopFriendsPoll();
    loadFriends(true);
    loadMatches(true);
  }, FRIENDS_POLL_MS);
}

function stopFriendsPoll() {
  if (friendsTimer) { clearInterval(friendsTimer); friendsTimer = null; }
}

function setNote(id, text, bad) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text || '';
  el.classList.toggle('hidden', !text);
  el.classList.toggle('bad', !!bad);
}

// Сервер отвечает кодом, игрок должен прочитать человеческую фразу
function friendErrorText(message) {
  const L = t();
  const m = String(message || '');
  // Сеть отвалилась: supabase-js бросает «Failed to fetch» и подобное, и это
  // не ошибка сервера, а её отсутствие — игрок должен прочитать про связь
  if (m.indexOf('no_conn') >= 0) return L.run.errNoConn;
  if (/fetch|network|offline|Load failed/i.test(m)) return L.run.errNoConn;
  if (m.indexOf('auth_failed') >= 0) return L.online.errAuth;
  if (m.indexOf('locked_out') >= 0) return L.run.errLocked;
  if (m.indexOf('query_too_short') >= 0) return L.online.errShort;
  if (m.indexOf('no_such_student') >= 0) return L.online.errNoStudent;
  if (m.indexOf('cannot_friend_self') >= 0) return L.online.errSelf;
  if (m.indexOf('recently_declined') >= 0) return L.online.errDeclined;
  if (m.indexOf('recently_cancelled') >= 0) return L.online.errCancelled;
  if (m.indexOf('too_many_requests') >= 0) return L.online.errTooMany;
  if (m.indexOf('no_such_request') >= 0) return L.online.errNoRequest;
  if (m.indexOf('unavailable') >= 0) return L.online.errUnavailable;
  if (m.indexOf('too_many_reports') >= 0) return L.online.errTooManyReports;
  return L.run.errServer + m;
}

// Имя и PIN подставляются сами: руками их не передаёт ни один вызов
async function friendRpc(name, args) {
  const auth = runAuth();
  if (!auth || !sb) throw new Error('no_conn');
  const { data, error } = await sb.rpc(name,
    Object.assign({ p_username: auth.username, p_pin: auth.pin }, args || {}));
  if (error) {
    // Сохранённые имя и PIN больше не подходят: их сменили на другом
    // устройстве. Повторять нельзя — каждая попытка считается ошибкой входа,
    // и опрос раз в десять секунд запер бы хозяину его же аккаунт
    if (String(error.message).indexOf('auth_failed') >= 0) signedOutElsewhere();
    throw new Error(error.message);
  }
  return data;
}

let signingOut = false;
function signedOutElsewhere(message) {
  if (signingOut || !runAuth()) return;
  signingOut = true;
  runLogout();
  stopFriendsPoll();
  stopRankedPoll();
  stopOnlinePoll();
  stopChatPoll();
  closeLogoutModal();
  online = null;
  mode = null;
  applyTranslations();
  showScreen('mode');
  signingOut = false;
  alert(message || t().run.sessionExpired);
}

// Входящие заявки первыми: это единственное, что требует действия
const FRIEND_ORDER = { incoming: 0, friend: 1, outgoing: 2 };

// Что с другом сейчас и что с этим делать. Чем меньше rank, тем выше в
// списке: сначала те, кто ждёт от вас действия
function friendState(relation, unread, m, here) {
  const L = t().online;
  const parts = [];
  let rank = 5, hot = false;
  if (relation === 'incoming') return { rank: 0, text: L.stWantsFriend, hot: true };
  if (relation === 'outgoing') return { rank: 9, text: capFirst(L.waiting), hot: false };
  if (relation !== 'friend') return { rank: 9, text: '', hot: false };
  if (m && m.status === 'invited' && m.seat === 1) { parts.push(L.stInvite); rank = 0; hot = true; }
  else if (m && m.status === 'active' && m.my_turn) { parts.push(capFirst(L.yourTurn)); rank = 1; hot = true; }
  else if (m && m.status === 'active') { parts.push(L.stTheirTurn); rank = 3; }
  else if (m) { parts.push(L.stSent); rank = 4; }
  if (unread > 0) {
    parts.push('💬 ' + withPlural(unread, L.msgForms));
    rank = Math.min(rank, 2); hot = true;
  }
  // Друг в игре прямо сейчас — вызов, скорее всего, примут: выше остальных
  if (!parts.length && here) return { rank: 4.5, text: L.stOnline, hot: false, on: true };
  // Сказать нечего — подсказка-действие: нажатие на строку открывает переписку
  if (!parts.length) return { rank, text: '💬 ' + L.stWrite, hot: false, act: true };
  return { rank, text: parts.join(' · '), hot };
}

function capFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// Главная игра с другом, если их вдруг несколько: сначала та, где ждут вас
function matchRank(m) {
  if (m.status === 'invited' && m.seat === 1) return 0;
  if (m.status === 'active' && m.my_turn) return 1;
  if (m.status === 'active') return 2;
  return 3;
}

function friendRow(name, relation, unread, match) {
  const L = t().online;
  const row = document.createElement('div');
  row.className = 'friend-row';
  row.dataset.name = name;
  row.dataset.relation = relation || 'none';
  if (relation === 'incoming') row.classList.add('req');
  if (match) {
    row.dataset.id = match.id;
    row.dataset.state = match.status === 'invited' ? (match.seat === 1 ? 'incoming' : 'outgoing') : 'active';
  }

  // Кружок с буквой, как в шапке: друзей узнают по цвету раньше, чем прочтут имя.
  // У удалённого игрока имени нет — вместо буквы знак вопроса и серый круг
  const face = document.createElement('span');
  face.className = 'avatar';
  if (String(name).charAt(0) === '#') {
    face.textContent = '?';
    face.style.background = 'rgba(255, 255, 255, 0.25)';
  } else {
    paintAvatar(face, name);
  }
  const here = relation === 'friend' && friendsOnline.has(name);
  face.classList.toggle('online', here);
  row.appendChild(face);

  const main = document.createElement('span');
  main.className = 'fr-main';
  const who = document.createElement('span');
  who.className = 'fr-name';
  who.textContent = playerName(name);
  main.appendChild(who);
  const st = friendState(relation, unread, match, here);
  if (st.text) {
    const status = document.createElement('span');
    status.className = 'fr-status' + (st.hot ? ' hot' : '') + (st.on ? ' on' : '') + (st.act ? ' act' : '');
    status.textContent = st.text;
    main.appendChild(status);
  }
  row.appendChild(main);

  // С другом переписка открывается нажатием на всю строку, кроме кнопок
  if (relation === 'friend') {
    row.classList.add('tap');
    row.onclick = e => { if (!e.target.closest('button')) openChat(name); };
  }

  const button = (label, cls, fn) => {
    const b = document.createElement('button');
    b.className = 'fr-btn' + (cls ? ' ' + cls : '');
    b.textContent = label;
    b.onclick = fn;
    row.appendChild(b);
    return b;
  };

  if (relation === 'incoming') {
    button(L.accept, 'yes', () => respondFriend(name, true));
    button('✕', 'no x', () => respondFriend(name, false)).setAttribute('aria-label', L.decline);
  } else if (relation === 'friend') {
    // Одна главная кнопка — по тому, что сейчас с другом
    // Друг зовёт играть — ответить и есть всё, что сейчас нужно: «⋯» не
    // показываем, иначе на телефоне трём кнопкам тесно и статус обрезается
    if (match && match.status === 'invited' && match.seat === 1) {
      button(L.accept, 'yes', () => answerChallenge(match.id, true));
      button('✕', 'no x', () => answerChallenge(match.id, false)).setAttribute('aria-label', L.decline);
      return row;
    } else if (match && match.status === 'invited') {
      button('✕', 'x', () => dropMatch(match.id)).setAttribute('aria-label', L.cancelGame);
    } else if (match) {
      button(L.stPlay, match.my_turn ? 'yes' : '', () => openMatch(match.id));
    } else {
      button(L.challenge, 'yes', () => openChallenge(name));
    }
    // «Убрать» стояло вровень с «Вызвать» — промахнулся пальцем, и друга нет.
    // Теперь оно за «⋯»: сначала открыть, потом нажать. Какая строка открыта,
    // помним отдельно: список перерисовывается опросом каждые несколько
    // секунд, и открытое «Убрать» иначе захлопывалось бы под пальцем
    // Теперь за ним и «Пожаловаться» с «Заблокировать» — трём кнопкам в
    // строке тесно, поэтому «⋯» открывает окно со всеми действиями
    button('⋯', 'more', () => openFriendSheet(name, false)).setAttribute('aria-label', L.shCancel);
  } else if (relation === 'outgoing') {
    // Заявку было не забрать назад: отправил не тому — и она висела вечно
    button(L.cancelReq, '', () => cancelFriendRequest(name));
  } else if (relation !== 'declined') {
    button(L.add, '', () => addFriend(name));
  }
  return row;
}

// Список и игры приходят разными запросами; строка друга собирается из обоих
let friendsData = null;
let friendMatches = [];

function renderFriends(rows) {
  friendsData = rows;
  rows.forEach(r => {
    if (r.relation === 'incoming') notifyAway('friend-' + r.username);
    if (r.unread > 0) notifyAway('talkfrom-' + r.username + '-' + r.unread);
  });
  renderFriendsList();
  fetchAvatars(rows.map(r => r.username));
}

function renderFriendsList() {
  if (!friendsData) return;
  const box = document.getElementById('friendsList');
  const friends = new Set(friendsData.filter(r => r.relation === 'friend').map(r => r.username));
  const best = {};
  friendMatches.forEach(m => {
    if (!friends.has(m.other)) return;
    if (!best[m.other] || matchRank(m) < matchRank(best[m.other])) best[m.other] = m;
  });
  box.innerHTML = '';
  friendsData
    .map(r => ({ r, st: friendState(r.relation, r.unread, best[r.username],
                                    r.relation === 'friend' && friendsOnline.has(r.username)) }))
    .sort((a, b) => (FRIEND_ORDER[a.r.relation] - FRIEND_ORDER[b.r.relation]) ||
                    (a.st.rank - b.st.rank) ||
                    String(a.r.username).localeCompare(String(b.r.username)))
    .forEach(({ r }) => box.appendChild(friendRow(r.username, r.relation, r.unread, best[r.username])));

  // Игры с теми, кого нет в друзьях (удалили из друзей посреди игры), — отдельно
  const rest = friendMatches.filter(m => best[m.other] !== m);
  const games = document.getElementById('gamesList');
  games.innerHTML = '';
  rest.forEach(m => games.appendChild(matchRow(m)));
  document.getElementById('gamesBox').classList.toggle('hidden', !rest.length);
}

// quiet — это опрос по таймеру: молча, иначе на экране будет мигать ошибка
// связи каждые десять секунд
let friendsFlash = null;
function flashFriends(text) {
  friendsFlash = text;
  setNote('friendsNote', text);
}

async function loadFriends(quiet) {
  if (friendsBusy) return;
  friendsBusy = true;
  try {
    // Кто из друзей в игре — отдельным запросом: без миграции 043 его нет,
    // и тогда список просто без зелёных точек
    const [list, here] = await Promise.all([
      friendRpc('list_friends'),
      friendRpc('friends_online').catch(() => null)
    ]);
    const rows = list || [];
    friendsOnline = new Set(Array.isArray(here) ? here : []);
    setFriendsBadge(rows);
    renderFriends(rows);
    if (!findDecided) {
      findDecided = true;
      if (!rows.some(r => r.relation === 'friend')) document.getElementById('findBox').open = true;
    }
    // Друзей нет — поиск раскрыт, и он сам всё объясняет: без лишней строки.
    // Сообщение о только что сделанном (подружились, заблокировал) живёт до
    // первого обновления списка — иначе оно стиралось, не успев показаться
    setNote('friendsNote', friendsFlash || '');
    friendsFlash = null;
  } catch (e) {
    if (!quiet) setNote('friendsNote', friendErrorText(e.message), true);
  } finally {
    friendsBusy = false;
  }
}

// Игры и заявки на игру живут рядом с друзьями и обновляются тем же опросом
function matchRow(m) {
  const L = t().online;
  const row = document.createElement('div');
  row.className = 'friend-row';
  row.dataset.id = m.id;
  row.dataset.state = m.status === 'invited' ? (m.seat === 1 ? 'incoming' : 'outgoing') : 'active';

  const who = document.createElement('span');
  who.className = 'fr-name';
  who.textContent = playerName(m.other);
  row.appendChild(who);

  const button = (label, cls, fn) => {
    const b = document.createElement('button');
    b.className = 'fr-btn' + (cls ? ' ' + cls : '');
    b.textContent = label;
    b.onclick = fn;
    row.appendChild(b);
  };
  const note = text => {
    const el = document.createElement('span');
    el.className = 'fr-wait';
    el.textContent = text;
    row.appendChild(el);
  };

  if (m.ranked) {
    const tag = document.createElement('span');
    tag.className = 'rk-row-tag';
    tag.textContent = L.rkBadge;
    who.appendChild(tag);
  }

  if (m.status === 'invited' && m.seat === 1) {
    button(L.accept, 'yes', () => answerChallenge(m.id, true));
    button(L.decline, 'no', () => answerChallenge(m.id, false));
  } else if (m.status === 'invited') {
    note(L.waiting);
    button(L.cancelGame, '', () => dropMatch(m.id));
  } else {
    note(m.my_turn ? L.yourTurn : L.theirTurn);
    button(L.play, m.my_turn ? 'yes' : '', () => openMatch(m.id));
  }
  return row;
}

async function loadMatches(quiet) {
  try {
    const rows = (await friendRpc('list_matches')) || [];
    rows.forEach(m => { if (m.status === 'invited' && m.seat === 1) notifyAway('invite-' + m.id); });
    // Дружеские игры — в строках друзей; рейтинговые — на экране рейтинга
    friendMatches = rows.filter(m => !m.ranked);
    renderFriendsList();
    const rk = document.getElementById('rkGamesList');
    rk.innerHTML = '';
    rows.filter(m => m.ranked).forEach(m => rk.appendChild(matchRow(m)));
    document.getElementById('rkGamesBox').classList.toggle('hidden', !rows.some(m => m.ranked));
  } catch (e) {
    if (!quiet) {
      setNote('gamesNote', onlineMatchError(e.message), true);
      if (screen === 'online') setNote('rkNote', onlineMatchError(e.message), true);
    }
  }
}

// Лесенка числа бонусов та же, что в местной дуэли, но считается от
// выбранного здесь диапазона, а не от того, во что играли в прошлый раз
function renderChallengeBonuses() {
  const on = document.getElementById('chBonuses').checked;
  document.getElementById('chBonusCountField').classList.toggle('hidden', !on);
  if (!on) return;
  const sel = document.getElementById('chBonusCount');
  const n = parseInt(document.getElementById('chRange').value) || 100;
  const auto = autoBonusCountFor(n);
  const prev = parseInt(sel.value);
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
  sel.value = String(values.includes(prev) ? prev : auto);
}

// Список диапазонов один на всю игру: собирать его руками в двух местах —
// значит однажды забыть про одно из них
function buildChallengeRanges() {
  const sel = document.getElementById('chRange');
  if (!sel) return;
  const prev = sel.value;
  const frost = document.getElementById('chFrost').checked;
  sel.innerHTML = '';
  RANGE_PRESETS.forEach(n => {
    const o = document.createElement('option');
    o.value = n;
    o.textContent = boundsLabel(n, frost);
    sel.appendChild(o);
  });
  sel.value = RANGE_PRESETS.includes(parseInt(prev)) ? prev : '100';
}

function openChallenge(name) {
  const box = document.getElementById('challengeBox');
  box.dataset.name = name;
  buildChallengeRanges();
  renderChallengeBonuses();
  document.getElementById('challengeTitle').textContent =
    t().online.chTitle.replace('{name}', name);
  box.classList.remove('hidden');
  // Окно вызова стоит над списком: друг мог быть внизу, прокручиваем к окну
  if (box.scrollIntoView) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function closeChallenge() {
  document.getElementById('challengeBox').classList.add('hidden');
}

async function sendChallenge() {
  const box = document.getElementById('challengeBox');
  const name = box.dataset.name;
  try {
    const withBonuses = document.getElementById('chBonuses').checked;
    await friendRpc('challenge_friend', {
      p_to: name,
      p_range: parseInt(document.getElementById('chRange').value),
      p_frost: document.getElementById('chFrost').checked,
      p_wins: parseInt(document.getElementById('chWins').value),
      p_bonuses: withBonuses,
      p_bonus_count: withBonuses
        ? parseInt(document.getElementById('chBonusCount').value) || null
        : null
    });
    closeChallenge();
    await loadMatches();
    setNote('gamesNote', t().online.sentGame.replace('{name}', name));
  } catch (e) {
    setNote('gamesNote', onlineMatchError(e.message), true);
  }
}

async function answerChallenge(id, accept) {
  try {
    const status = await friendRpc('respond_challenge', { p_match_id: id, p_accept: !!accept });
    await loadMatches();
    if (status === 'active') openMatch(id);
  } catch (e) {
    setNote('gamesNote', onlineMatchError(e.message), true);
  }
}

async function dropMatch(id) {
  try {
    await friendRpc('leave_match', { p_match_id: id });
    await loadMatches();
  } catch (e) {
    setNote('gamesNote', onlineMatchError(e.message), true);
  }
}

async function loadSuggestions() {
  const box = document.getElementById('searchResults');
  if (!box) return;
  try {
    const rows = (await friendRpc('suggest_students')) || [];
    box.innerHTML = '';
    rows.forEach(r => box.appendChild(friendRow(r.username, null)));
    fetchAvatars(rows.map(r => r.username));
    setNote('searchNote', rows.length ? t().online.whoPlays : '');
  } catch (e) {
    setNote('searchNote', friendErrorText(e.message), true);
  }
}

async function searchStudents() {
  const q = (document.getElementById('friendSearch').value || '').trim();
  const box = document.getElementById('searchResults');
  // Пустой запрос — не ошибка, а повод показать, кто вообще есть
  if (!q.length) return loadSuggestions();
  box.innerHTML = '';
  if (q.length < 2) return setNote('searchNote', t().online.errShort, true);
  setNote('searchNote', t().online.searching);
  try {
    const rows = (await friendRpc('find_students', { p_query: q })) || [];
    rows.forEach(r => box.appendChild(friendRow(r.username, r.relation)));
    fetchAvatars(rows.map(r => r.username));
    setNote('searchNote', rows.length ? '' : t().online.nobody);
  } catch (e) {
    setNote('searchNote', friendErrorText(e.message), true);
  }
}

async function addFriend(name) {
  try {
    await friendRpc('send_friend_request', { p_to: name });
    await searchStudents();
    setNote('searchNote', t().online.sent.replace('{name}', name));
    loadFriends(true);
    loadMatches(true);
  } catch (e) {
    setNote('searchNote', friendErrorText(e.message), true);
  }
}

async function respondFriend(name, accept) {
  try {
    await friendRpc('respond_friend_request', { p_from: name, p_accept: !!accept });
    await loadFriends();
  } catch (e) {
    setNote('friendsNote', friendErrorText(e.message), true);
  }
}

async function cancelFriendRequest(name) {
  try {
    await friendRpc('cancel_friend_request', { p_to: name });
    await loadFriends();
  } catch (e) {
    setNote('friendsNote', friendErrorText(e.message), true);
  }
}

// ================= ПРИГЛАШЕНИЕ ПО ССЫЛКЕ =================
// Ссылка с кодом игрока: открыл — «Лев зовёт вас в друзья», нажал — сразу
// друзья. Код запоминаем до входа: новичку сначала нужно зарегистрироваться
const INVITE_KEY = 'hc_pending_invite';
let inviteLink = '';

function captureInvite() {
  try {
    const u = new URL(location.href);
    const code = u.searchParams.get('invite');
    if (!code) return;
    localStorage.setItem(INVITE_KEY, code.trim().toUpperCase().slice(0, 12));
    // Из адреса код убираем: иначе обновление страницы звало бы снова
    u.searchParams.delete('invite');
    // window. — обязательно: в игре своя переменная history (ходы партии)
    window.history.replaceState(null, '', u.pathname + u.search + u.hash);
  } catch (e) {}
}
function pendingInvite() {
  try { return localStorage.getItem(INVITE_KEY); } catch (e) { return null; }
}
function dropPendingInvite() {
  try { localStorage.removeItem(INVITE_KEY); } catch (e) {}
  document.getElementById('inviteInModal').classList.add('hidden');
}

let inviteHost = null;
async function checkPendingInvite() {
  const code = pendingInvite();
  if (!code || !sb) return;
  let host = null;
  try {
    const { data, error } = await sb.rpc('invite_owner', { p_code: code });
    if (error) throw new Error(error.message);
    host = data;
  } catch (e) { return; }   // нет сети — спросим в следующий раз
  if (!host || host === myName()) return dropPendingInvite();
  inviteHost = host;
  const I = t().inv;
  document.getElementById('inTitle').textContent = I.inTitle.replace('{name}', playerName(host));
  document.getElementById('inAdd').textContent = runAuth() ? I.inAdd : I.inLogin;
  document.getElementById('inLater').textContent = I.inLater;
  setNote('inNote', '');
  document.getElementById('inviteInModal').classList.remove('hidden');
}

async function acceptPendingInvite() {
  const code = pendingInvite();
  if (!runAuth()) {
    // Сначала вход или регистрация; код ждёт в браузере
    document.getElementById('inviteInModal').classList.add('hidden');
    authReturn = 'friends';
    return showScreen('authChoice');
  }
  try {
    const host = await friendRpc('accept_invite', { p_code: code });
    dropPendingInvite();
    openFriends();
    flashFriends(t().inv.inDone.replace('{name}', playerName(host || inviteHost)));
  } catch (e) {
    const m = String(e.message || '');
    setNote('inNote', m.indexOf('no_such_invite') >= 0 ? t().inv.errNoInvite : friendErrorText(m), true);
  }
}

async function openInvite() {
  const I = t().inv;
  document.getElementById('invTitle').textContent = I.invTitle;
  document.getElementById('invHint').textContent = I.invHint;
  document.getElementById('invShare').textContent = I.invShare;
  document.getElementById('invCopy').textContent = I.invCopy;
  document.getElementById('invDone').textContent = I.invDone;
  document.getElementById('invShare').classList.toggle('hidden', !navigator.share);
  setNote('invNote', '');
  let code;
  try {
    code = await friendRpc('my_invite_code', {});
  } catch (e) {
    return setNote('friendsNote', friendErrorText(e.message), true);
  }
  inviteLink = location.href.split(/[?#]/)[0] + '?invite=' + encodeURIComponent(code);
  const box = document.getElementById('invQr');
  box.innerHTML = '';
  if (typeof qrcode === 'function') {
    const qr = qrcode(0, 'M');
    qr.addData(inviteLink);
    qr.make();
    box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  }
  document.getElementById('inviteModal').classList.remove('hidden');
}

function closeInvite() { document.getElementById('inviteModal').classList.add('hidden'); }

async function shareInvite() {
  const I = t().inv;
  try {
    await navigator.share({ title: 'Hot or Cold', text: I.invShareText.replace('{name}', myName()), url: inviteLink });
  } catch (e) {}
}

async function copyInvite() {
  try {
    await navigator.clipboard.writeText(inviteLink);
    setNote('invNote', t().inv.invCopied);
  } catch (e) {
    // Буфер обмена недоступен — ссылка на экране выделяется целиком одним нажатием
    setNote('invNote', inviteLink);
  }
}

// ================= ШТОРКА «ПЕРЕДАЙТЕ ТЕЛЕФОН» =================
// Вдвоём за одним телефоном туман и слепота ничего не прятали: экран общий,
// и второй видел всё. Пока на ком-то помеха, после смены хода экран закрыт,
// пока телефон не взял тот, чей ход
let curtainFor = null;
let curtainPrevCur = null;

function hiddenInfoActive() {
  return D.fog.some(Boolean) || D.blind.some(Boolean) || D.shortMemory.some(Boolean);
}

function checkCurtain() {
  const local = mode === 'duel' && !online && !vsBot && screen === 'game';
  if (!local || D.roundOver || D.matchOver) {
    curtainPrevCur = local ? D.cur : null;
    if (curtainFor !== null) liftCurtain();
    return;
  }
  if (curtainPrevCur !== null && D.cur !== curtainPrevCur && hiddenInfoActive()) curtainFor = D.cur;
  curtainPrevCur = D.cur;
  const box = document.getElementById('curtain');
  box.classList.toggle('hidden', curtainFor === null);
  if (curtainFor === null) return;
  const C = t().curtain;
  const name = escapeHtml(D.names[curtainFor]);
  document.getElementById('ctText').innerHTML = C.text.replace('{name}', name);
  document.getElementById('ctWhy').textContent = C.why;
  document.getElementById('ctGo').innerHTML = C.go.replace('{name}', name);
}

function liftCurtain() {
  curtainFor = null;
  document.getElementById('curtain').classList.add('hidden');
}

// ================= ОБУЧЕНИЕ =================
// Три урока: подсказки, дуэль с ботом, бонусы. Пока не пройдены первые два,
// онлайн закрыт. Кто уже играл до появления обучения, ничего не проходит —
// его узнаём по следам прошлых игр в браузере
const TUTORIAL_ICON = '🎓';
const TUT_KEY = 'hc_tutorial';
const SEEN_BONUS_KEY = 'hc_seen_bonus';
let lesson = null;   // { n, prev, done } — идёт урок n

function tutState() {
  try { return JSON.parse(localStorage.getItem(TUT_KEY)) || { done: [], skipped: false }; }
  catch (e) { return { done: [], skipped: false }; }
}
function tutSave(st) {
  try { localStorage.setItem(TUT_KEY, JSON.stringify(st)); } catch (e) {}
}
function tutInit() {
  try {
    if (localStorage.getItem(TUT_KEY) !== null) return;
    const quiet = ['hc_lang', 'hc_mute', 'hc_sound', TUT_KEY, SEEN_BONUS_KEY, INVITE_KEY];
    let veteran = false;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('hc_') === 0 && quiet.indexOf(k) < 0) veteran = true;
    }
    // Пришёл по приглашению — друг ждёт: онлайн открыт сразу, уроки только предлагаются
    tutSave({ done: [], skipped: veteran, veteran: veteran, invited: !!pendingInvite() });
    // Старые игроки бонусы уже видели: карточки им ни к чему
    if (veteran) localStorage.setItem(SEEN_BONUS_KEY, JSON.stringify(BONUS_TYPES.concat(['near'])));
  } catch (e) {}
}
function onlineOpen() {
  const st = tutState();
  return st.skipped || !!st.invited || (st.done.indexOf(1) >= 0 && st.done.indexOf(2) >= 0);
}
function tutorialComplete() { return tutState().done.length >= 3; }
function nextLessonNo() {
  const done = tutState().done;
  return [1, 2, 3].find(n => done.indexOf(n) < 0) || 1;
}

function renderTutorialMenu() {
  const T = t().tut;
  const st = tutState();
  const show = !st.skipped && st.done.length < 3;
  const card = document.getElementById('tutCard');
  card.classList.toggle('hidden', !show);
  if (show) {
    const n = nextLessonNo();
    document.getElementById('tTutTitle').textContent = T.tutTitle.replace('{n}', n);
    document.getElementById('tTutSub').textContent = T.tutSub[n - 1];
  }
  const locked = !onlineOpen();
  ['run', 'online'].forEach(k => {
    document.querySelector('.mode-btn.' + k).classList.toggle('locked', locked);
    const sub = document.getElementById(k === 'run' ? 'tRunLock' : 'tOnlineLock');
    sub.textContent = T.tutLocked;
    sub.classList.toggle('hidden', !locked);
  });
  document.getElementById('tTutReplay').textContent = T.tutReplay;
}

function openLessonGate() {
  const T = t().tut;
  document.getElementById('gateText').textContent = T.gateText;
  document.getElementById('gateGo').textContent = T.gateGo.replace('{n}', nextLessonNo());
  document.getElementById('gateSkip').textContent = T.gateSkip;
  document.getElementById('gateModal').classList.remove('hidden');
}
function closeGate() { document.getElementById('gateModal').classList.add('hidden'); }
function skipTutorial() {
  const st = tutState();
  st.skipped = true;
  tutSave(st);
  closeGate();
  renderTutorialMenu();
}

// Урок идёт обычной игрой с заданными условиями. Настройки игрока (бонусы,
// мороз, число бонусов) урок не трогает: берёт на время и возвращает
function startLesson(n) {
  if (lesson) endLessonMode();
  lesson = { n: n, done: false, prev: { bonusMode, bonusCountChoice, frostMode } };
  frostMode = false;
  stopBot();
  vsBot = null;
  if (n === 1) {
    mode = 'solo';
    applyBounds(20);
    MAX_GUESSES = minAttempts(rangeCount()) + 3;
    applyRangeToInputs();
    startSolo();
    return;
  }
  const L = t();
  mode = 'duel';
  setupBot = true;
  bonusMode = n === 3;
  bonusCountChoice = n === 3 ? 5 : 0;
  applyBounds(50);
  applyRangeToInputs();
  // Черепаха — самый мягкий соперник: урок про правила, а не про победу
  vsBot = { bot: BOTS[0] };
  D.names[0] = myName() || L.you;
  D.names[1] = botName(vsBot.bot);
  D.winsNeeded = 1;
  D.handicap = 0;
  D.wins = [0, 0];
  D.round = 1;
  D.matchOver = false;
  D.starter = 0;
  startRound();
  applyTranslations();
  showScreen('game');
}

function startNextLesson() { startLesson(nextLessonNo()); }

function endLessonMode() {
  if (!lesson) return;
  bonusMode = lesson.prev.bonusMode;
  bonusCountChoice = lesson.prev.bonusCountChoice;
  frostMode = lesson.prev.frostMode;
  lesson = null;
}

function lessonFinished() {
  if (!lesson) return false;
  if (lesson.n === 1) return gameOverType === 'win' || gameOverType === 'lose';
  return D.matchOver;
}

function finishLesson() {
  lesson.done = true;
  const st = tutState();
  if (st.done.indexOf(lesson.n) < 0) st.done.push(lesson.n);
  st.done.sort();
  tutSave(st);
  // Всё пройдено — база откроет иконку. Без входа отметим при входе
  if (st.done.length >= 3 && runAuth()) friendRpc('tutorial_finished', {}).then(() => {
    if (profileInfo) profileInfo.tutorialDone = true;
  }).catch(() => {});
}

// Подсказка урока — по тому, что сейчас на доске
function coachStep() {
  const n = lesson.n;
  const mine = history.filter(h => h.p === 0 || h.p === null).length;
  if (n === 1) return Math.min(history.length, 2);
  if (n === 2) {
    if (!mine) return 0;
    return mine >= 2 && D.tokens[0] > 0 ? 2 : 1;
  }
  if (D.bonuses.some(b => b.taken)) return 2;
  return D.nearBonus ? 1 : 0;
}

function renderCoach() {
  const box = document.getElementById('coach');
  const show = !!lesson && !lesson.done;
  box.classList.toggle('hidden', !show);
  if (!show) return;
  box.textContent = t().tut.coach[lesson.n][coachStep()];
}

// Конец урока: вместо «Новая игра» — следующий урок
function renderLessonResult() {
  if (!lesson || !lessonFinished()) return;
  if (!lesson.done) finishLesson();
  const box = document.getElementById('resultBox');
  const actions = box.querySelector('.r-actions');
  if (!actions || box.querySelector('.r-lesson')) return;
  const T = t().tut;
  const line = document.createElement('div');
  line.className = 'r-lesson';
  const parts = [T.lessonDone.replace('{n}', lesson.n)];
  if (lesson.n === 2 && onlineOpen()) parts.push(T.lessonOpen);
  if (tutorialComplete() && lesson.n === 3) parts.push(T.tutAllDone);
  line.textContent = parts.join(' · ');
  box.insertBefore(line, actions);
  const next = lesson.n < 3 ? lesson.n + 1 : null;
  actions.innerHTML = (next
    ? '<button class="btn" onclick="startLesson(' + next + ')">' + T.lessonNext.replace('{n}', next) + '</button>'
    : '<button class="btn" onclick="quitToMenu()">' + T.lessonFinish + '</button>') +
    (next ? '<button class="btn-ghost" onclick="quitToMenu()">' + t().toMenu + '</button>' : '');
}

// ---------- Карточки бонусов ----------
const BONUS_ICON = { extra: '⚡', fog: '🙈', blind: '🌫️', lava: '🌋', skip: '⏭', gift: '🎁', memory: '🧠', near: '❓' };
let bonusCardFor = null;
function seenBonuses() {
  try { return JSON.parse(localStorage.getItem(SEEN_BONUS_KEY)) || []; } catch (e) { return []; }
}
function checkBonusCard() {
  if (mode !== 'duel' || screen !== 'game' || bonusCardFor) return;
  const kind = D.lastBonus && BONUS_ICON[D.lastBonus] ? D.lastBonus : (D.nearBonus ? 'near' : null);
  if (!kind) return;
  const seen = seenBonuses();
  if (seen.indexOf(kind) >= 0) return;
  seen.push(kind);
  try { localStorage.setItem(SEEN_BONUS_KEY, JSON.stringify(seen)); } catch (e) {}
  const T = t().tut;
  bonusCardFor = kind;
  document.getElementById('bcIcon').textContent = BONUS_ICON[kind];
  document.getElementById('bcTitle').textContent = kind === 'near' ? T.bcNear
    : T.bcTitle.replace('{name}', t().bonusNames[kind]);
  document.getElementById('bcDesc').textContent = T.bcDesc[kind];
  document.getElementById('bcOk').textContent = T.bcOk;
  document.getElementById('bonusCard').classList.remove('hidden');
}
function closeBonusCard() {
  bonusCardFor = null;
  document.getElementById('bonusCard').classList.add('hidden');
}

// ================= ЖАЛОБА И БЛОКИРОВКА =================
let sheetFor = null;
let reportReason = null;

function openFriendSheet(name, fromChat) {
  if (!name) return;
  sheetFor = name;
  const L = t().online;
  const row = (friendsData || []).find(r => r.username === name);
  document.getElementById('fsName').textContent = playerName(name);
  document.getElementById('fsWrite').textContent = L.shWrite;
  document.getElementById('fsRemove').textContent = L.shRemove;
  document.getElementById('fsAch').textContent = t().prog.fsAch;
  // Достижения видны только друзьям — так решает и база
  document.getElementById('fsAch').classList.toggle('hidden', !(row && row.relation === 'friend'));
  document.getElementById('fsReport').textContent = L.shReport;
  document.getElementById('fsBlock').textContent = L.shBlock;
  document.getElementById('fsCancel').textContent = L.shCancel;
  // Из переписки «Написать» некуда: она уже открыта
  document.getElementById('fsWrite').classList.toggle('hidden', !!fromChat);
  document.getElementById('fsRemove').classList.toggle('hidden', !!(row && row.relation !== 'friend'));
  document.getElementById('friendSheet').classList.remove('hidden');
}

function closeFriendSheet() {
  document.getElementById('friendSheet').classList.add('hidden');
}

function friendSheetDo(what) {
  const name = sheetFor;
  closeFriendSheet();
  if (what === 'write') return openChat(name);
  if (what === 'remove') return removeFriend(name);
  if (what === 'ach') return openFriendAch(name);
  if (what === 'report') return openReport(name);
  if (what === 'block') return openBlock(name);
}

function openReport(name) {
  sheetFor = name;
  reportReason = null;
  const L = t().online;
  document.getElementById('rpTitle').textContent = L.rpTitle.replace('{name}', playerName(name));
  const box = document.getElementById('rpReasons');
  box.innerHTML = '';
  [['rude', L.rpRude], ['spam', L.rpSpam], ['other', L.rpOther]].forEach(([code, label]) => {
    const b = document.createElement('button');
    b.className = 'btn-ghost';
    b.dataset.reason = code;
    b.textContent = label;
    b.onclick = () => {
      reportReason = code;
      box.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      document.getElementById('rpSend').disabled = false;
    };
    box.appendChild(b);
  });
  const note = document.getElementById('rpNote');
  note.value = '';
  note.placeholder = L.rpNote;
  document.getElementById('rpCancel').textContent = L.shCancel;
  document.getElementById('rpSend').textContent = L.rpSend;
  // Без причины отправить нельзя: жалоба «ни о чём» ничего не скажет
  document.getElementById('rpSend').disabled = true;
  setNote('rpMsg', '');
  document.getElementById('reportModal').classList.remove('hidden');
}

function closeReport() {
  document.getElementById('reportModal').classList.add('hidden');
}

async function sendReport() {
  if (!reportReason) return;
  const name = sheetFor;
  try {
    await friendRpc('report_player', { p_who: name, p_reason: reportReason,
                                       p_note: document.getElementById('rpNote').value });
    closeReport();
    const L = t().online;
    setNote(screen === 'chat' ? 'chatNote' : 'friendsNote', L.rpDone);
  } catch (e) {
    setNote('rpMsg', friendErrorText(e.message), true);
  }
}

function openBlock(name) {
  sheetFor = name;
  const L = t().online;
  document.getElementById('blAsk').textContent = L.blAsk.split('{name}').join(playerName(name));
  document.getElementById('blCancel').textContent = L.shCancel;
  document.getElementById('blGo').textContent = L.blGo;
  setNote('blMsg', '');
  document.getElementById('blockModal').classList.remove('hidden');
}

function closeBlock() {
  document.getElementById('blockModal').classList.add('hidden');
}

async function confirmBlock() {
  const name = sheetFor;
  try {
    await friendRpc('block_player', { p_who: name });
    closeBlock();
    // Из переписки с заблокированным уходим: писать туда больше нельзя
    if (screen === 'chat') openFriends(); else await loadFriends();
    flashFriends(t().online.blDone.replace('{name}', playerName(name)));
  } catch (e) {
    setNote('blMsg', friendErrorText(e.message), true);
  }
}

async function loadBlocked() {
  const box = document.getElementById('pfBlockedList');
  const L = t().online;
  try {
    const rows = await friendRpc('blocked_players', {}) || [];
    box.innerHTML = '';
    if (!rows.length) {
      box.innerHTML = '<div class="fr-note">—</div>';
      return;
    }
    rows.forEach(r => {
      const row = document.createElement('div');
      row.className = 'bl-row';
      const who = document.createElement('span');
      who.textContent = playerName(r.username);
      const b = document.createElement('button');
      b.className = 'fr-btn';
      b.textContent = L.blUnblock;
      b.onclick = async () => {
        try { await friendRpc('unblock_player', { p_who: r.username }); } catch (e) {}
        loadBlocked();
      };
      row.appendChild(who);
      row.appendChild(b);
      box.appendChild(row);
    });
  } catch (e) {
    box.innerHTML = '';
    const n = document.createElement('div');
    n.className = 'fr-note bad';
    n.textContent = friendErrorText(e.message);
    box.appendChild(n);
  }
}

async function removeFriend(name) {
  try {
    await friendRpc('remove_friend', { p_other: name });
    await loadFriends();
  } catch (e) {
    setNote('friendsNote', friendErrorText(e.message), true);
  }
}

// ================= ОНЛАЙН: МАТЧ =================
// Играется он тем же экраном и той же отрисовкой, что дуэль за одним
// телефоном: mode остаётся 'duel', а online хранит то, чего у местной игры
// нет — номер матча и своё место за доской. Ветвится только ввод: ход, жетон
// и следующий раунд уходят на сервер, а не считаются здесь
const MATCH_POLL_MS = 2000;
// ================= «В ИГРЕ СЕЙЧАС» =================
// Открытая игра раз в минуту отмечается «я здесь» (миграция 043). Друзья
// видят зелёную точку, пока отметка свежее двух минут. Свёрнутая вкладка не
// отмечается: игрок ушёл, звать его бесполезно
const SEEN_MS = 60000;
let friendsOnline = new Set();
let seenTimer = null;

function markSeen() {
  if (!runAuth() || !sb || document.hidden) return;
  friendRpc('mark_seen').catch(() => {});
}

function startSeen() {
  if (seenTimer) return;
  markSeen();
  seenTimer = setInterval(markSeen, SEEN_MS);
}

function stopSeen() {
  if (seenTimer) { clearInterval(seenTimer); seenTimer = null; }
  friendsOnline = new Set();
}

// ================= МГНОВЕННЫЕ СИГНАЛЫ (Realtime) =================
// База толкает в личный канал «что-то изменилось»: ход, вызов, заявка,
// сообщение. В сигнале только вид и номер — что именно, игра спрашивает
// обычными функциями с PIN. Канала нет (нет сети, старый сервер) — всё
// работает на опросе, как раньше. Опрос партии остаётся каждые 2 с: на нём
// держатся таймер хода, ход бота и отметка «соперник на месте»
let sigChannel = null;
let sigLive = false;
let sigStarting = false;

async function startSignals() {
  if (sigChannel || sigStarting || !runAuth() || !sb || typeof sb.channel !== 'function') return;
  sigStarting = true;
  let key = null;
  const who = myName();
  try { key = await friendRpc('my_signal_key'); } catch (e) {}
  sigStarting = false;
  // Пока ждали ключ, могли выйти или войти под другим именем
  if (!key || typeof key !== 'string' || !runAuth() || myName() !== who || sigChannel) return;
  try {
    sigChannel = sb.channel('hc:' + key)
      .on('broadcast', { event: 'sig' }, msg => onSignal((msg && msg.payload) || {}))
      .subscribe(status => { sigLive = status === 'SUBSCRIBED'; });
  } catch (e) {
    sigChannel = null;
    sigLive = false;
  }
}

function stopSignals() {
  if (sigChannel && sb) { try { sb.removeChannel(sigChannel); } catch (e) {} }
  sigChannel = null;
  sigLive = false;
}

function onSignal(p) {
  if (!runAuth()) return;
  if (p.k === 'match') {
    if (online && screen === 'game' && online.id === p.id) refreshMatch(true);
    else if (screen === 'online' || screen === 'friends') loadMatches(true);
  } else if (p.k === 'friends') {
    if (screen === 'online' || screen === 'friends') loadFriends(true);
  } else if (p.k === 'chat') {
    if (screen === 'chat' && chatWith) loadChat(true);
    else if (screen === 'online' || screen === 'friends') loadFriends(true);
  }
}

// ================= ПЕРЕПИСКА С ДРУГОМ =================
// Вне игры друзья пишут текстом. Готовые фразы остались кодами: код
// переводится у читающего, поэтому «Привет!» дойдёт до француза по-французски.
// Во время матча — только готовые фразы (SAY_CODES): там не до переписки
const CHAT_POLL_MS = 5000;
let chatWith = null;
let chatTimer = null;
let chatBusy = false;
let chatLastId = 0;

function startChatPoll() {
  stopChatPoll();
  let tick = 0;
  chatTimer = setInterval(() => {
    if (!(screen === 'chat' && chatWith)) return stopChatPoll();
    // Канал жив — новое сообщение приходит сигналом, опрос лишь страхует: раз в 10 с
    if (sigLive && (tick++ % 2)) return;
    loadChat(true);
  }, CHAT_POLL_MS);
}

function stopChatPoll() {
  if (chatTimer) { clearInterval(chatTimer); chatTimer = null; }
}

function openChat(name) {
  chatWith = name;
  chatLastId = 0;
  const L = t().online;
  // Заголовок — сам друг: кружок и имя, как в списке друзей
  document.getElementById('chatWho').textContent = playerName(name);
  paintAvatar(document.getElementById('chatFace'), name);
  fetchAvatars([name]);
  document.getElementById('chatList').innerHTML = '';
  document.getElementById('chatText').value = '';
  renderChatLeft();
  setNote('chatNote', '');
  renderChatPad();
  renderChatModes();
  applyTranslations();
  showScreen('chat');
  startChatPoll();
  loadChat();
}

// Из шестнадцати старых фраз под рукой четыре: остальное пишут текстом.
// Переводы всех шестнадцати остаются — ими показана прежняя переписка
const QUICK_TALK = ['hi', 'play', 'later', 'bye'];
const CHAT_MAX = 200;
const CHAT_WARN = 170;

function renderChatPad() {
  const pad = document.getElementById('chatPad');
  const L = t().online.talk;
  pad.innerHTML = '';
  QUICK_TALK.forEach(code => {
    const b = document.createElement('button');
    b.dataset.code = code;
    b.textContent = L[code];
    b.disabled = chatBusy;
    b.onclick = () => sendTalk(code);
    pad.appendChild(b);
  });
}

// Позвать на рейтинг можно в любую разновидность: условия берёт сервер
function renderChatModes() {
  const box = document.getElementById('chatModes');
  box.innerHTML = '';
  RANKED_MODES.forEach(mode => box.appendChild(rankedModeButton(mode, false, () => challengeRankedFromChat(mode))));
}

function renderChat(messages) {
  const box = document.getElementById('chatList');
  const L = t().online;
  box.innerHTML = '';
  if (!messages.length) {
    const empty = document.createElement('div');
    empty.className = 'fr-note';
    empty.textContent = L.chatEmpty;
    box.appendChild(empty);
    return;
  }
  messages.forEach(m => {
    const el = document.createElement('div');
    el.className = 'chat-msg ' + (m.mine ? 'mine' : 'theirs');
    // Текст показываем как есть — через textContent, разметкой он не станет
    if (m.text !== null && m.text !== undefined) {
      el.textContent = m.text;
    } else {
      el.dataset.code = m.code;
      el.textContent = L.talk[m.code] || m.code;
    }
    const ago = document.createElement('span');
    ago.className = 'cm-ago';
    ago.textContent = agoShort(m.ago);
    el.appendChild(ago);
    box.appendChild(el);
  });
  box.scrollTop = box.scrollHeight;
}

// Возраст сообщения теми же словами, что и давность игры в рейтинге
function agoShort(seconds) {
  const L = t().online;
  if (seconds === null || seconds === undefined || seconds < 90) return L.rkAgoNow;
  if (seconds < 5400) return L.rkAgoMin.replace('{n}', Math.round(seconds / 60));
  if (seconds < 172800) return L.rkAgoHour.replace('{n}', Math.round(seconds / 3600));
  return L.rkAgoDay.replace('{n}', Math.round(seconds / 86400));
}

async function loadChat(quiet) {
  if (!chatWith) return;
  try {
    const th = await friendRpc('friend_thread', { p_to: chatWith });
    const messages = (th && th.messages) || [];
    renderChat(messages);
    const last = messages.length ? messages[messages.length - 1] : null;
    // Окликаем только чужое и только то, чего ещё не видели
    if (last && !last.mine && last.id > chatLastId && chatLastId) {
      notifyAway('talk-' + chatWith + '-' + last.id);
    }
    if (last) chatLastId = last.id;
    if (!quiet) setNote('chatNote', '');
  } catch (e) {
    if (!quiet) setNote('chatNote', onlineMatchError(e.message), true);
  }
}

async function sendTalk(code) {
  if (chatBusy || !chatWith) return;
  chatBusy = true;
  renderChatPad();
  try {
    await friendRpc('send_friend_phrase', { p_to: chatWith, p_code: code });
    setNote('chatNote', '');
    await loadChat(true);
  } catch (e) {
    setNote('chatNote', onlineMatchError(e.message), true);
  } finally {
    chatBusy = false;
    renderChatPad();
  }
}

function renderChatLeft() {
  const n = (document.getElementById('chatText').value || '').length;
  const left = CHAT_MAX - n;
  const el = document.getElementById('chatLeft');
  el.classList.toggle('hidden', n < CHAT_WARN);
  el.textContent = t().online.chatLeft.replace('{n}', left);
}

async function sendChatText() {
  const input = document.getElementById('chatText');
  const text = (input.value || '').trim();
  if (!text || chatBusy || !chatWith) return;
  chatBusy = true;
  renderChatPad();
  document.getElementById('tChatSend').disabled = true;
  try {
    await friendRpc('send_friend_text', { p_to: chatWith, p_text: text });
    input.value = '';
    renderChatLeft();
    setNote('chatNote', '');
    await loadChat(true);
  } catch (e) {
    setNote('chatNote', chatTextError(e.message), true);
  } finally {
    chatBusy = false;
    renderChatPad();
    document.getElementById('tChatSend').disabled = false;
  }
}

function chatTextError(message) {
  const L = t().online;
  const m = String(message || '');
  if (m.indexOf('too_long') >= 0) return L.errTooLong;
  // Сервер ещё без миграции: функции нет вовсе
  if (m.indexOf('send_friend_text') >= 0 || m.indexOf('PGRST202') >= 0) return L.errTextOff;
  return onlineMatchError(m);
}

// Дружеская игра настраивается, поэтому уводим в то же окно вызова
function challengeFromChat() {
  const name = chatWith;
  openFriends();
  openChallenge(name);
}

async function challengeRankedFromChat(mode) {
  if (!chatWith) return;
  try {
    await friendRpc('challenge_friend_ranked', { p_to: chatWith, p_mode: mode });
    setNote('chatNote', t().online.chatSent);
  } catch (e) {
    setNote('chatNote', onlineMatchError(e.message), true);
  }
}

// ================= УВЕДОМЛЕНИЯ НА ЗАКРЫТОЕ ПРИЛОЖЕНИЕ =================
// Пока на сервере не настроен ключ, переключателя нет вовсе: обещать нечего.
// На айфоне подписка возможна только если игру добавили на домашний экран —
// это ограничение Apple, обойти его нельзя, поэтому говорим об этом словами
let pushKey = null;
let pushOn = false;
let pushBusy = false;

function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Ключ приходит строкой base64url, а подписке нужен массив байтов
function pushKeyBytes(key) {
  const pad = '='.repeat((4 - key.length % 4) % 4);
  const raw = atob((key + pad).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// serviceWorker.ready не отклоняется, а просто не наступает, если работник
// не встал (например, страницу открыли файлом). Без срока ожидания окно
// аккаунта молча зависало бы на полпути
function pushReady() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise(resolve => setTimeout(() => resolve(null), 3000))
  ]);
}

async function pushSubscription() {
  if (!pushSupported()) return null;
  try {
    const reg = await pushReady();
    return reg ? await reg.pushManager.getSubscription() : null;
  } catch (e) { return null; }
}

async function loadPushState() {
  // Ключ спрашиваем и там, где подписаться нельзя: на айфоне во вкладке
  // нужно объяснить, почему кнопки нет, а объяснять нечего, если
  // уведомления у проекта вообще не настроены
  const ask = pushSupported() || pushNeedsHomeScreen();
  if (!sb || !ask || !runAuth()) { pushKey = null; return renderPushToggle(); }
  try {
    const { data, error } = await sb.rpc('push_config');
    pushKey = error ? null : (data || null);
  } catch (e) { pushKey = null; }
  pushOn = !!(await pushSubscription());
  renderPushToggle();
}

// Айфон отдаёт уведомления только приложению с домашнего экрана: во вкладке
// Safari самих этих возможностей в системе нет. Молчать об этом нельзя —
// кнопки просто не будет, и человек решит, что уведомлений у игры нет вовсе
function pushNeedsHomeScreen() {
  if (pushSupported()) return false;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform || ''));
  return ios && navigator.standalone !== true;
}

function renderPushToggle() {
  const btn = document.getElementById('tPushToggle');
  if (!btn) return;
  const L = t().online;
  const show = !!pushKey && pushSupported() && !!runAuth();
  btn.classList.toggle('hidden', !show);
  if (!show) {
    if (pushKey && runAuth() && pushNeedsHomeScreen()) setNote('pushNote', L.pushHomeScreen);
    return;
  }
  btn.textContent = pushOn ? L.pushOff : L.pushOn;
  btn.disabled = pushBusy;
}

async function togglePush() {
  if (pushBusy || !pushKey) return;
  pushBusy = true;
  setNote('pushNote', '');
  renderPushToggle();
  try {
    if (pushOn) await disablePush(); else await enablePush();
  } catch (e) {
    setNote('pushNote', friendErrorText(e && e.message), true);
  } finally {
    pushBusy = false;
    pushOn = !!(await pushSubscription());
    renderPushToggle();
  }
}

async function enablePush() {
  const L = t().online;
  const allowed = await Notification.requestPermission();
  if (allowed !== 'granted') return setNote('pushNote', L.pushDenied, true);

  const reg = await pushReady();
  if (!reg) return setNote('pushNote', L.pushHomeScreen, true);
  // Ключ разбираем до подписки: кривой ключ — это ошибка настройки сервера,
  // и валить её на домашний экран айфона было бы неправдой
  const keyBytes = pushKeyBytes(pushKey);
  let sub;
  try {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes
    });
  } catch (e) {
    // На айфоне без добавления на домашний экран подписка просто не заводится
    return setNote('pushNote', L.pushHomeScreen, true);
  }
  const raw = sub.toJSON().keys || {};
  await friendRpc('save_push_subscription', {
    p_endpoint: sub.endpoint, p_p256dh: raw.p256dh, p_auth: raw.auth,
    p_lang: currentLang
  });
  setNote('pushNote', L.pushReady);
}

async function disablePush() {
  const sub = await pushSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  try { await sub.unsubscribe(); } catch (e) {}
  try { await friendRpc('drop_push_subscription', { p_endpoint: endpoint }); } catch (e) {}
  setNote('pushNote', '');
}

// ================= ОКЛИК ИЗ СОСЕДНЕЙ ВКЛАДКИ =================
// Настоящие push-уведомления этой игре почти не нужны: ход длится тридцать
// секунд, и сообщение, пришедшее на закрытое приложение, опоздает. А вот
// когда вкладка открыта, но человек в другой, — окликнуть стоит
const BASE_TITLE = document.title;
let alertCount = 0;
let alertSeen = {};

function notifyAway(key) {
  if (!document.hidden) return;
  if (alertSeen[key]) return;
  alertSeen[key] = true;
  alertCount++;
  document.title = '(' + alertCount + ') ' + BASE_TITLE;
  playTone(880, 0.1);
  setTimeout(() => playTone(1175, 0.12), 130);
}

function clearAway() {
  if (!alertCount) return;
  alertCount = 0;
  alertSeen = {};
  document.title = BASE_TITLE;
}

document.addEventListener('visibilitychange', () => { if (!document.hidden) clearAway(); });

// ================= РЕЙТИНГОВЫЙ ОНЛАЙН =================
// Четыре разновидности, у каждой свой отдельный рейтинг. Номер режима —
// два бита: младший включает мороз и жару, старший — бонусы. Ровно то же
// правило действует на сервере, поэтому подпись кнопки всегда совпадает
// с тем, во что раздадут играть
const RANKED_POLL_MS = 3000;
const RANKED_MODES = [0, 1, 2, 3];
let rankedTimer = null;
let onlineTimer = null;
let rankedBusy = false;
let rankedInQueue = false;
let rankedMatchId = null;
let rankedMode = (function () {
  try {
    const v = parseInt(localStorage.getItem('hc_rkmode'));
    return (v >= 0 && v <= 3) ? v : 0;
  } catch (e) { return 0; }
})();
let rankedRatings = null;

function startRankedPoll() {
  stopRankedPoll();
  rankedTimer = setInterval(() => {
    if (screen === 'online' && rankedInQueue) loadRanked(true);
    else stopRankedPoll();
  }, RANKED_POLL_MS);
}

// Пока экран рейтинга открыт, список игр и рейтинг обновляются сами:
// соперник мог принять реванш, пока вы смотрите на таблицу
function startOnlinePoll() {
  stopOnlinePoll();
  onlineTimer = setInterval(() => {
    if (screen !== 'online') return stopOnlinePoll();
    loadMatches(true);
    loadFriends(true);
    if (!rankedInQueue) loadRanked(true);
  }, FRIENDS_POLL_MS);
}

function stopOnlinePoll() {
  if (onlineTimer) { clearInterval(onlineTimer); onlineTimer = null; }
}

function stopRankedPoll() {
  if (rankedTimer) { clearInterval(rankedTimer); rankedTimer = null; }
}

function rankedModeFrost(mode) { return (mode & 1) === 1; }
function rankedModeBonuses(mode) { return (mode & 2) === 2; }

// Разновидность словами: «−100…100 · бонусы» ребёнку ничего не говорило.
// Диапазон — мелкой строкой под названием (rankedModeRange)
function rankedModeLabel(mode) {
  return t().online.rkModeNames[mode] || '';
}

function rankedModeRange(mode) {
  return rankedModeFrost(mode) ? '−100…100' : '1–100';
}

function rankedModeButton(mode, active, onClick) {
  const b = document.createElement('button');
  b.className = 'rk-mode' + (active ? ' active' : '');
  b.dataset.mode = mode;
  const name = document.createElement('div');
  name.className = 'rm-name';
  name.textContent = rankedModeLabel(mode);
  const range = document.createElement('div');
  range.className = 'rm-range';
  range.textContent = rankedModeRange(mode);
  b.append(name, range);
  b.onclick = onClick;
  return b;
}

// Переключение разновидности выводит из очереди: ждать в двух местах нельзя,
// иначе человека затянуло бы в две партии сразу
async function setRankedMode(mode) {
  if (mode === rankedMode) return;
  const wasQueued = rankedInQueue;
  rankedMode = mode;
  try { localStorage.setItem('hc_rkmode', String(mode)); } catch (e) {}
  if (wasQueued) await cancelRanked();
  renderRankedModes();
  renderRanked(null);
  loadEloTop();
  loadRanked(true);
}

function renderRankedModes() {
  const box = document.getElementById('rkModes');
  if (!box) return;
  box.innerHTML = '';
  RANKED_MODES.forEach(mode => box.appendChild(rankedModeButton(mode, mode === rankedMode, () => setRankedMode(mode))));
}

// Давность в человеческих словах. Меньше полутора минут — «только что»:
// точнее незачем, решение «ждать или не ждать» от секунд не зависит
function rankedAgoText(seconds) {
  const L = t().online;
  if (seconds === null || seconds === undefined) return L.rkLastNever;
  if (seconds < 90) return L.rkLastPlayed.replace('{n}', L.rkAgoNow);
  if (seconds < 5400) return L.rkLastPlayed.replace('{n}', L.rkAgoMin.replace('{n}', Math.round(seconds / 60)));
  if (seconds < 172800) return L.rkLastPlayed.replace('{n}', L.rkAgoHour.replace('{n}', Math.round(seconds / 3600)));
  return L.rkLastPlayed.replace('{n}', L.rkAgoDay.replace('{n}', Math.round(seconds / 86400)));
}

function renderRanked(st) {
  const L = t().online;
  const mine = rankedRatings && rankedRatings[rankedMode];
  const elo = document.getElementById('rkElo');
  const starsEl = document.getElementById('rkStars');
  elo.classList.toggle('league', !!ladderInfo);
  starsEl.classList.toggle('hidden', !ladderInfo);
  if (ladderInfo) {
    // Лига — крупно, звёзды под ней. Число рейтинга видно только Легенде:
    // ниже его заменяют звёзды, а рейтинг работает на подбор соперника
    const p = ladderPos(ladderInfo.stars);
    elo.textContent = leagueLabel(ladderInfo.stars).replace(/^\S+\s/, '');
    // Герб лиги рисунком; эмодзи-медаль из подписи убрана — она бы дублировала герб
    const em = document.getElementById('rkEmblem');
    em.innerHTML = leagueEmblem(p.league, p.legend ? null : p.rank, 76);
    em.style.setProperty('--lg-glow', LEAGUE_ART[p.league].glow);
    em.classList.remove('hidden');
    const link = document.getElementById('rkPathLink');
    link.textContent = t().path.link;
    link.classList.remove('hidden');
    // Число рейтинга не показываем и Легенде: лестница — лиги и звёзды
    starsEl.textContent = p.legend ? '' : starsLine(ladderInfo.stars);
    const days = Math.floor((ladderInfo.endsIn || 0) / 86400);
    const month = seasonMonth(ladderInfo.season);
    document.getElementById('rkEloSub').textContent = days > 0
      ? L.lgSeason.replace('{m}', month).replace('{n}', days) : L.lgSeasonLast.replace('{m}', month);
    // Ученик: первые партии без потери звёзд — сказать, сколько ещё
    const left = ladderInfo.apprentice || 0;
    const ap = document.getElementById('rkApprentice');
    ap.textContent = t().tut.rkApprentice.replace('{n}', left);
    ap.classList.toggle('hidden', !(left > 0));
  } else {
    document.getElementById('rkEmblem').classList.add('hidden');
    document.getElementById('rkPathLink').classList.add('hidden');
    elo.textContent = mine ? formatNum(mine.elo) : '—';
    document.getElementById('rkEloSub').textContent = mine
      ? L.rkEloSub.replace('{g}', mine.games) : L.rkEloSub.replace('{g}', '0');
  }

  const play = document.getElementById('tRkPlay');
  play.textContent = rankedMatchId ? L.rkResume : L.rkPlay;
  play.classList.toggle('hidden', rankedInQueue);
  document.getElementById('rkWaitBox').classList.toggle('hidden', !rankedInQueue);
  if (!rankedInQueue || !st) return;

  // Точки в конце — единственная живая деталь на экране ожидания: по ней
  // видно, что опрос идёт, а не подвис
  // Сверху — «ищем» и секундомер, ниже — по строке на каждую подробность.
  // Раньше всё шло одной строкой через точки и читалось как шифр
  const dots = '.'.repeat(1 + (Math.floor(st.waited / 3) % 3));
  const mm = Math.floor(st.waited / 60), ss = st.waited % 60;
  document.getElementById('rkWaitText').textContent =
    '🔍 ' + L.rkSearching + dots + '  ' + mm + ':' + String(ss).padStart(2, '0');
  // Когда ждёшь один, полезно знать две вещи: скоро ли бот и давно ли тут
  // вообще играли люди
  const botLine = !st.botWait ? ''
    : (st.waited < st.botWait ? L.rkBotSoon.replace('{n}', st.botWait - st.waited) : L.rkBotNow);
  document.getElementById('rkWaitSub').textContent = (st.queue > 1
    ? [L.rkQueueMany.replace('{n}', st.queue), botLine]
    : [L.rkQueueOne, botLine, rankedAgoText(st.lastAgo)]).filter(Boolean).join('\n');
}

async function loadRanked(quiet) {
  try {
    const st = await friendRpc('ranked_status', { p_mode: rankedMode });
    if (!st) return;
    const wasQueued = rankedInQueue;
    rankedMatchId = st.matchId || null;
    rankedInQueue = !!st.inQueue;
    rankedRatings = st.ratings || null;
    // В матч затягиваем только того, кто стоял в очереди и ждал именно этого.
    // Иначе с экрана начатой игры было бы не уйти: он открывался бы заново
    if (rankedMatchId && wasQueued) {
      rankedInQueue = false;
      stopRankedPoll();
      notifyAway('found-' + rankedMatchId);
      return openMatch(rankedMatchId);
    }
    if (rankedInQueue && !rankedTimer) startRankedPoll();
    renderRankedModes();
    renderRanked(st);
    // Ждём в другой разновидности — об этом надо сказать, иначе «Играть»
    // здесь выглядит как потеря очереди без причины
    const other = (st.queueMode === null || st.queueMode === undefined || st.inQueue)
      ? '' : t().online.rkOtherMode.replace('{mode}', rankedModeLabel(st.queueMode));
    if (other) setNote('rkNote', other);
    else if (!quiet) setNote('rkNote', '');
  } catch (e) {
    if (!quiet) setNote('rkNote', onlineMatchError(e.message), true);
  }
}

async function startRanked() {
  if (rankedBusy) return;
  if (rankedMatchId) return openMatch(rankedMatchId);
  rankedBusy = true;
  setNote('rkNote', '');
  try {
    const r = await friendRpc('join_ranked_queue', { p_mode: rankedMode });
    if (r && r.matchId) {
      rankedInQueue = false;
      rankedMatchId = r.matchId;
      stopRankedPoll();
      rankedBusy = false;
      return openMatch(r.matchId);
    }
    rankedInQueue = true;
    startRankedPoll();
    await loadRanked(true);
  } catch (e) {
    setNote('rkNote', onlineMatchError(e.message), true);
  } finally {
    rankedBusy = false;
  }
}

async function cancelRanked() {
  rankedInQueue = false;
  stopRankedPoll();
  try {
    await friendRpc('leave_ranked_queue');
  } catch (e) {
    setNote('rkNote', onlineMatchError(e.message), true);
  }
  await loadRanked(true);
}

async function loadEloTop() {
  if (!sb) return;
  const box = document.getElementById('rkTopList');
  if (!box) return;
  // С лигами топ один на все режимы — по звёздам сезона
  if (ladderInfo) {
    document.getElementById('tRkTop').textContent = t().online.lgTop;
    try {
      const { data, error } = await sb.rpc('ladder_top');
      if (error) throw new Error(error.message);
      const rows = data || [];
      const me = (runAuth() || {}).username;
      if (!rows.length) {
        box.innerHTML = '<div class="fr-note">' + escapeHtml(t().online.rkTopEmpty) + '</div>';
        return;
      }
      box.replaceChildren(...rows.map((r, i) => topRow(i, r.username, leagueLabel(r.stars), r.username === me)));
      fetchAvatars(rows.map(r => r.username));
    } catch (e) {}
    return;
  }
  try {
    const { data, error } = await sb.rpc('elo_leaderboard', { p_mode: rankedMode });
    if (error) throw new Error(error.message);
    const rows = data || [];
    const me = (runAuth() || {}).username;
    if (!rows.length) {
      box.innerHTML = '<div class="fr-note">' + escapeHtml(t().online.rkTopEmpty) + '</div>';
      return;
    }
    box.replaceChildren(...rows.map((r, i) => topRow(i, r.username, r.elo, r.username === me)));
    fetchAvatars(rows.map(r => r.username));
  } catch (e) {}
}

// Выход из рейтинговой игры — поражение, и спросить об этом надо до того,
// как оно случится: сервер потом уже ничего не отменит
function openResign() {
  const L = t().online;
  document.getElementById('tResignTitle').textContent = L.rkResignAsk;
  document.getElementById('tResignStay').textContent = L.rkStay;
  document.getElementById('tResignGo').textContent = L.rkResign;
  document.getElementById('resignModal').classList.remove('hidden');
}

function closeResign() {
  document.getElementById('resignModal').classList.add('hidden');
}

async function resignMatch() {
  closeResign();
  const id = online && online.id;
  if (!id) return backToOnline();
  try {
    await friendRpc('leave_match', { p_match_id: id });
    await refreshMatch(true);
  } catch (e) {
    setMatchNote(onlineMatchError(e.message));
  }
}

let online = null;
let matchTimer = null;
let matchBusy = false;

function onlineMatchError(message) {
  const L = t();
  const m = String(message || '');
  if (m.indexOf('not_your_turn') >= 0) return L.online.errNotYourTurn;
  if (m.indexOf('round_over') >= 0) return L.online.errRoundOver;
  if (m.indexOf('out_of_range') >= 0) return L.online.errOutOfRange;
  if (m.indexOf('no_tokens') >= 0) return L.online.errNoTokens;
  if (m.indexOf('not_first_move') >= 0) return L.online.errFirstMove;
  if (m.indexOf('match_already_live') >= 0) return L.online.errLive;
  if (m.indexOf('not_a_friend') >= 0) return L.online.errNotFriend;
  if (m.indexOf('invite_closed') >= 0) return L.online.errInviteGone;
  if (m.indexOf('no_such_match') >= 0) return L.online.errNoMatch;
  if (m.indexOf('not_playing') >= 0) return L.online.errNotPlaying;
  if (m.indexOf('too_fast') >= 0) return L.online.errTooFast;
  if (m.indexOf('not_started') >= 0) return L.online.errNotStarted;
  if (m.indexOf('bad_phrase') >= 0) return L.online.errNoMatch;
  return friendErrorText(m);
}

// Состояние с сервера — единственный источник правды: всё, что рисуется,
// берётся отсюда, и ничего не досчитывается на месте
function applyMatchState(st) {
  if (!st) return;
  online.seat = st.seat;
  online.status = st.status;
  online.ranked = !!st.ranked;
  online.forfeitBy = (st.forfeitBy === null || st.forfeitBy === undefined) ? null : st.forfeitBy;
  online.eloDelta = st.eloDelta || null;
  // Партия кончилась — чуть погодя спросить, не открылось ли достижение:
  // уведомление выезжает поверх итога партии
  // Партию закончили у нас на глазах (а не открыли старую) — тогда звёзды
  // покажем на весь экран
  if (!st.matchOver) online.wasPlaying = true;
  if (st.matchOver && online.wasPlaying) online.justFinished = true;
  if (st.matchOver && !online.progressAsked) {
    online.progressAsked = true;
    setTimeout(() => { if (runAuth()) loadProgress(); }, 2500);
  }
  online.elo = st.elo;
  online.botSeat = (st.botSeat === null || st.botSeat === undefined) ? null : st.botSeat;
  // Начало партии и перерыв: сервер присылает остаток секунд, дальше
  // отсчитывает браузер — как часы хода
  const at = n => (n === null || n === undefined) ? null : Date.now() + n * 1000;
  online.lobby = !!st.lobby;
  online.lobbyEndsAt = at(st.lobbyLeft);
  online.startsAt = at(st.startsIn);
  online.nextAt = at(st.nextIn);
  online.ready = (st.ready || [false, false]).slice();
  // Без поля (база до миграции 035) считаем, что звёзды есть: так было
  online.ladder = st.ladder === undefined ? true : !!st.ladder;
  mode = 'duel';
  RANGE_MIN = st.rangeMin;
  RANGE_MAX = st.rangeMax;
  frostMode = !!st.frost;
  FEEDBACK_META = buildFeedbackMeta(maxDistance() + 1);

  D.names = st.names.map(playerName);
  D.winsNeeded = st.winsNeeded;
  D.wins = st.wins.slice();
  // Новый раунд — замечание про прошлое число к нему не относится
  if (D.round !== st.round) setGuessNote('');
  D.round = st.round;
  D.cur = st.cur;
  D.tokens = st.tokens.slice();
  D.armed = !!st.armed;
  D.roundOver = !!st.roundOver;
  D.roundWinner = st.roundWinner;
  D.matchOver = !!st.matchOver;
  D.fog = (st.fog || [false, false]).slice();
  D.blind = (st.blind || [false, false]).slice();
  D.autoLava = (st.autoLava || [false, false]).slice();
  D.skip = (st.skip || [false, false]).slice();
  D.shortMemory = (st.shortMemory || [false, false]).slice();
  D.rush = (st.rush || [0, 0]).slice();
  D.nearBonus = !!st.nearBonus;
  D.lastBonus = st.lastBonus || null;
  D.lastBonusBy = st.lastBonusBy || 0;
  D.bonuses = [];
  bonusMode = !!st.bonusesOn;
  online.forced = st.forced || null;
  online.turnSeconds = st.turnSeconds || 30;
  online.secondsLeft = st.secondsLeft;
  online.deadlineAt = (st.secondsLeft === null || st.secondsLeft === undefined)
    ? null : Date.now() + st.secondsLeft * 1000;
  applyChat(st.chat);

  // Расстояния сервер не присылает: пояс — это всё, что известно. Закрытый
  // ход приезжает без числа, потерянный по времени — как отдельная строка
  history = (st.moves || []).map(mv => ({
    guess: mv.guess, distance: null, p: mv.seat,
    timeout: !!mv.timeout,
    masked: !!mv.hidden,
    meta: (mv.tier === null || mv.tier === undefined) ? FEEDBACK_META[0] : FEEDBACK_META[mv.tier]
  }));
  secret = (st.secret === null || st.secret === undefined) ? 0 : st.secret;
  applyRangeToInputs();
  renderAll();
  // Ключ меняется с каждым ходом, поэтому один ход окликает ровно один раз
  if (st.status === 'active' && !st.roundOver && !st.matchOver && st.cur === st.seat) {
    notifyAway('turn-' + st.id + '-' + st.round + '-' + (st.moves || []).length);
  }
}

// Сигнал пришёл, пока ответ на прошлый запрос ещё в пути, — спросить ещё
// раз сразу после: иначе свежий ход ждал бы следующего опроса
let matchAgain = false;

async function refreshMatch(quiet) {
  if (!online) return;
  if (matchBusy) { matchAgain = true; return; }
  matchBusy = true;
  try {
    const st = await friendRpc('match_state', { p_match_id: online.id });
    applyMatchState(st);
    if (!quiet) setMatchNote('');
  } catch (e) {
    if (!quiet) setMatchNote(onlineMatchError(e.message));
  } finally {
    matchBusy = false;
    if (matchAgain) {
      matchAgain = false;
      if (online && screen === 'game') refreshMatch(true);
    }
  }
}

// Строка связи живёт в той же полоске, что и бонусы: отдельного места для
// неё на экране нет, а во время онлайн-матча бонусов всё равно не бывает
function setMatchNote(text) {
  const box = document.getElementById('matchNote');
  if (!box) return;
  box.textContent = text ? '\u26a0\ufe0f ' + text : '';
  box.classList.toggle('hidden', !text);
}

function startMatchPoll() {
  stopMatchPoll();
  matchTimer = setInterval(() => {
    if (online && screen === 'game') refreshMatch(true); else stopMatchPoll();
  }, MATCH_POLL_MS);
}

function stopMatchPoll() {
  if (matchTimer) { clearInterval(matchTimer); matchTimer = null; }
}

async function openMatch(id) {
  stopBot();
  vsBot = null;
  onlineReview = null;
  online = { id: id, seat: 0, status: 'active' };
  sayLastId = 0;
  sayShownUntil = 0;
  sayPadOpen = false;
  hideSayBubble();
  stopFriendsPoll();
  try {
    const st = await friendRpc('match_state', { p_match_id: id });
    applyMatchState(st);
  } catch (e) {
    online = null;
    setNote('friendsNote', onlineMatchError(e.message), true);
    return;
  }
  applyTranslations();
  showScreen('game');
  renderAll();
  startMatchPoll();
  startClock();
}

async function onlineGuess() {
  const input = document.getElementById('guessInput');
  const guess = readGuess();
  if (guess === null) return;
  if (D.cur !== online.seat) return setMatchNote(t().online.errNotYourTurn);
  noteIfRepeat(guess, history);
  input.value = '';
  try {
    await friendRpc('match_guess', { p_match_id: online.id, p_guess: guess });
    await refreshMatch();
  } catch (e) {
    setMatchNote(onlineMatchError(e.message));
    await refreshMatch(true);
  }
}

async function onlineToken() {
  try {
    await friendRpc('use_match_token', { p_match_id: online.id, p_arm: !D.armed });
    await refreshMatch();
  } catch (e) {
    setMatchNote(onlineMatchError(e.message));
  }
}

async function onlineNextRound() {
  if (online.ready) { online.ready[online.seat] = true; renderAll(); }
  try {
    await friendRpc('next_match_round', { p_match_id: online.id });
    await refreshMatch();
  } catch (e) {
    setMatchNote(onlineMatchError(e.message));
    await refreshMatch(true);
  }
}

// Уход с экрана матч не закрывает: к начатой игре можно вернуться
// Возвращаемся туда, откуда игра началась: рейтинг и друзья живут порознь
function backToOnline() {
  const wasRanked = !!(online && online.ranked);
  stopMatchPoll();
  stopClock();
  setMatchNote('');
  online = null;
  mode = null;
  if (wasRanked) openOnline(); else openFriends();
}

// Приглашение уходит, но игра начнётся только когда соперник согласится:
// уводить с экрана раньше времени незачем
async function offerRematch() {
  if (!online || online.rematchSent) return;
  const other = D.names[1 - online.seat];
  let newId;
  try {
    newId = await friendRpc('rematch', { p_match_id: online.id });
  } catch (e) {
    return setMatchNote(onlineMatchError(e.message));
  }
  // Бот согласия не ждёт: новая партия уже идёт
  if (online.botSeat !== null && newId) { stopMatchPoll(); return openMatch(newId); }
  online.rematchSent = other;
  setMatchNote('');
  renderAll();
}

// ================= ГОТОВЫЕ ФРАЗЫ =================
// Свободного текста нет намеренно: играют дети из разных стран, которых никто
// не сводил лично. Восемь фраз переводятся на все языки сами, так что ответ
// приходит на языке читающего, а не пишущего
// Набор дружелюбный: без «Время идёт!» (подгоняет) и «Ледяной холод!»
// (звучит как насмешка над ходом). Их переводы остались — для старых реплик
const SAY_CODES = ['hi', 'luck', 'nice', 'wow', 'think', 'almost', 'again', 'gg'];
const SAY_SHOW_MS = 6000;
let sayMuted = localStorage.getItem('hc_mute') === '1';
let sayPadOpen = false;
let sayLastId = 0;
let sayShownUntil = 0;
let sayBusy = false;

function toggleSayPad() {
  sayPadOpen = !sayPadOpen;
  renderSayPad();
}

function toggleMute() {
  sayMuted = !sayMuted;
  try { localStorage.setItem('hc_mute', sayMuted ? '1' : '0'); } catch (e) {}
  if (sayMuted) hideSayBubble();
  renderSayPad();
}

function renderSayPad() {
  const btn = document.getElementById('sayBtn');
  const pad = document.getElementById('sayPad');
  if (!btn || !pad) return;
  const inMatch = !!online && !D.matchOver;
  btn.classList.toggle('hidden', !inMatch);
  btn.classList.toggle('on', sayPadOpen);
  pad.classList.toggle('hidden', !(inMatch && sayPadOpen));
  if (!(inMatch && sayPadOpen)) return;

  const L = t().say;
  pad.innerHTML = '';
  SAY_CODES.forEach(code => {
    const b = document.createElement('button');
    b.textContent = L[code];
    b.dataset.code = code;
    b.disabled = sayBusy;
    b.onclick = () => sendPhrase(code);
    pad.appendChild(b);
  });
  const mute = document.createElement('button');
  mute.className = 'mute';
  mute.id = 'sayMuteBtn';
  mute.textContent = sayMuted ? L.unmute : L.mute;
  mute.onclick = toggleMute;
  pad.appendChild(mute);
}

async function sendPhrase(code) {
  if (!online || sayBusy) return;
  sayBusy = true;
  renderSayPad();
  try {
    await friendRpc('send_phrase', { p_match_id: online.id, p_code: code });
    await refreshMatch();
  } catch (e) {
    setMatchNote(onlineMatchError(e.message));
  } finally {
    sayBusy = false;
    renderSayPad();
  }
}

function hideSayBubble() {
  const box = document.getElementById('sayBubble');
  if (box) box.classList.add('hidden');
}

// Показываем только свежую реплику и только пока она свежая: иначе фраза
// висела бы весь раунд и читалась как подпись к чужому ходу
function applyChat(list) {
  if (!Array.isArray(list) || !list.length) return;
  const last = list[list.length - 1];
  if (!last || last.id <= sayLastId) return;
  sayLastId = last.id;
  if (sayMuted && last.seat !== online.seat) return;
  if (typeof last.ago === 'number' && last.ago * 1000 > SAY_SHOW_MS) return;
  sayShownUntil = Date.now() + SAY_SHOW_MS - (last.ago || 0) * 1000;

  const box = document.getElementById('sayBubble');
  if (!box) return;
  box.innerHTML = '<span class="s-who" style="color:' + P_COLORS[last.seat] + '">' +
    escapeHtml(D.names[last.seat]) + '</span>' + escapeHtml(t().say[last.code] || '');
  box.style.borderColor = P_COLORS[last.seat];
  box.classList.remove('hidden');
}

function renderSayBubble() {
  const box = document.getElementById('sayBubble');
  if (!box) return;
  if ((!online && !vsBot) || Date.now() > sayShownUntil) box.classList.add('hidden');
}

// Фраза бота в игре без интернета — тот же пузырь, что у соперника онлайн
function botSay(code) {
  if (!code || !vsBot || online || screen !== 'game' || sayMuted) return;
  const box = document.getElementById('sayBubble');
  if (!box) return;
  sayShownUntil = Date.now() + SAY_SHOW_MS;
  box.innerHTML = '<span class="s-who" style="color:' + P_COLORS[1] + '">' +
    escapeHtml(D.names[1]) + '</span>' + escapeHtml(t().say[code] || '');
  box.style.borderColor = P_COLORS[1];
  box.classList.remove('hidden');
  setTimeout(renderSayBubble, SAY_SHOW_MS + 50);
}

// ================= ПАУЗА И СОХРАНЁННАЯ ИГРА =================
// Состояние пишется после каждого хода, поэтому закрытая вкладка, севший телефон
// или случайный выход не стоят игроку результата: игра ждёт его на том же месте.
// Забег больше не хранится в браузере. Ключ остаётся только чтобы убрать
// то, что успели сохранить прежние версии
const RUN_STATE_KEY = 'hc_run_state';

// Незаконченный забег живёт на сервере, а не в браузере: он переживает
// закрытую вкладку и находится с другого устройства. Локальной копии нет
// намеренно — она разошлась бы с сервером и дала бы второй, «свой» счёт
let runPending = null;

async function loadRunPending() {
  runPending = null;
  try {
    const st = await friendRpc('run_state');
    if (st && st.active) runPending = st;
    setNote('runNote', '');
  } catch (e) {
    // Забег теперь считает сервер, значит без сети режим не работает.
    // Молчать об этом нельзя: иначе экран выглядит рабочим, а кнопка не пойдёт
    setNote('runNote', friendErrorText(e.message), true);
  }
  renderUnfinished();
}

function resumeSavedRun() {
  startRun(false);
}

// «Завершить» из хаба: доигрывать не хочется, но результат должен засчитаться
async function finishSavedRun() {
  try {
    const res = await friendRpc('run_give_up');
    RUN = { round: (res.rounds || 0) + 1, totalScore: res.score || 0, locked: true };
    mode = 'run';
    secret = res.secret;
    await endRun({ score: res.score, rounds: res.rounds, secret: res.secret });
  } catch (e) {
    setNote('runNote', friendErrorText(e.message), true);
  }
}

function renderUnfinished() {
  const L = t();
  const st = runPending;
  const box = document.getElementById('unfinishedBox');
  box.classList.toggle('hidden', !st);
  // пока игра не закончена, новую не предлагаем — иначе она молча потеряется
  document.getElementById('tRunStart').classList.toggle('hidden', !!st);
  if (!st) return;
  document.getElementById('unfinishedInfo').textContent =
    L.run.unfinishedInfo.replace('{round}', st.round).replace('{score}', formatNum(st.score));
}

function openPause() {
  document.getElementById('pauseModal').classList.remove('hidden');
}

function closePause() {
  document.getElementById('pauseModal').classList.add('hidden');
}

// Уход с паузы забег не заканчивает: он ждёт на сервере
function pauseAndLeave() {
  closePause();
  RUN = null;
  mode = null;
  applyTranslations();
  openRunHub();
}

async function giveUpRun() {
  closePause();
  try {
    const res = await friendRpc('run_give_up');
    await endRun({ score: res.score, rounds: res.rounds, secret: res.secret });
  } catch (e) {
    setMatchNote(friendErrorText(e.message));
  }
}

// Поделиться результатом: системное окно «Поделиться» там, где оно есть
// (в Safari на iPhone работает), иначе просто копируем в буфер
async function shareRunResult(score, rounds) {
  const L = t();
  const link = location.origin + location.pathname;
  const text = L.run.shareText
    .replace('{score}', withPlural(score, L.run.pointForms))
    .replace('{rounds}', withPlural(rounds, L.run.roundForms));
  const btn = document.getElementById('shareBtn');
  try {
    if (navigator.share) {
      await navigator.share({ text: text, url: link });
      return;
    }
    await navigator.clipboard.writeText(text + ' ' + link);
    if (btn) {
      btn.textContent = L.run.shareCopied;
      setTimeout(() => { if (btn) btn.textContent = L.run.share; }, 2000);
    }
  } catch (e) {
    // отказ игрока в системном окне — не ошибка, молчим
  }
}

// ================= ЗАБЕГ: сама игра =================
let RUN = null;

// Диапазон округляется до круглого числа: «от 1 до 250» читается и держится в голове,
// «от 1 до 234» — нет. Шаг округления растёт вместе с числом.
function roundRangeValue(v) {
  const step = v < 100 ? 10 : v < 500 ? 50 : v < 1000 ? 100 : v < 5000 ? 500 : 1000;
  return Math.max(10, Math.round(v / step) * step);
}

// Диапазон растёт до потолка и дальше не увеличивается: «угадай число до полумиллиона»
// формально проходимо, но играть в это на телефоне невозможно
function runRangeForRound(n) {
  const grown = RUN_CONFIG.start_range * Math.pow(RUN_CONFIG.growth, n - 1);
  return roundRangeValue(Math.min(grown, RUN_CONFIG.range_cap));
}

// Сложность после потолка идёт от точности: с каждым раундом на попытку меньше.
// Без этого игра не заканчивается — по градуснику с девятью поясами игрок получает
// за ход около трёх бит, а попыток выдаётся из расчёта одного бита за ход, то есть вдвое больше нужного.
function runAttemptsForRound(n, range) {
  const buffer = Math.max(0, RUN_CONFIG.buffer_start - (n - 1) * RUN_CONFIG.buffer_shrink);
  const squeeze = Math.max(0, n - RUN_CONFIG.squeeze_start);
  // потолок: попыток всегда заметно меньше, чем чисел в диапазоне,
  // иначе на маленьких диапазонах раунд проходится тупым перебором
  const cap = Math.max(2, Math.ceil(range * 0.6));
  const allowed = Math.min(minAttempts(range) + buffer, cap) - squeeze;
  return Math.max(RUN_CONFIG.min_attempts, allowed);
}

// Режим на рейтинг играется на том же экране, что и одиночная игра:
// термометр, история попыток и шкала берутся оттуда как есть
// Забег считает сервер: число, раунды, бюджет попыток и очки живут там.
// Клиент только показывает то, что ему прислали, и отправляет догадки
async function startRun(fresh) {
  const L = t();
  try { localStorage.setItem('hc_run_rules_seen', '1'); } catch (e) {}
  try {
    const st = await friendRpc('run_start',
      { p_frost: !!frostMode, p_fresh: !!fresh });
    RUN = { round: 1, totalScore: 0, locked: false };
    mode = 'run';
    applyRunSnapshot(st);
    applyTranslations();
    showScreen('game');
    renderAll();
  } catch (e) {
    setNote('runNote', friendErrorText(e.message), true);
  }
}

// Единственный источник правды — снимок с сервера. Догадки клиент рисует из
// присланного списка: своих чисел он не помнит, чтобы после продолжения на
// другом устройстве история была та же самая
function applyRunSnapshot(st) {
  if (!st || !RUN) return;
  RANGE_MIN = st.rangeMin;
  RANGE_MAX = st.rangeMax;
  frostMode = !!st.frost;
  MAX_GUESSES = st.allowed;
  FEEDBACK_META = buildFeedbackMeta(maxDistance() + 1);
  RUN.round = st.round;
  RUN.totalScore = st.score;
  RUN.locked = false;
  if (typeof st.best === 'number') rememberRunBest(st.best);
  history = (st.movesLog || []).map(mv => ({
    guess: mv.guess, distance: null, meta: FEEDBACK_META[mv.tier], p: null
  }));
  gameOver = false;
  gameOverType = null;
  secret = 0;
  document.getElementById('guessInput').value = '';
  applyRangeToInputs();
}

async function runGuess() {
  // locked — пауза между раундами: иначе можно успеть отправить ещё один ход,
  // пока на экране висит «+очки»
  if (!RUN || RUN.locked) return;
  const input = document.getElementById('guessInput');
  const guess = readGuess();
  if (guess === null) return;
  noteIfRepeat(guess, history);
  RUN.locked = true;
  input.value = '';

  let res;
  try {
    res = await friendRpc('run_guess', { p_guess: guess });
  } catch (e) {
    RUN.locked = false;
    setMatchNote(friendErrorText(e.message));
    return;
  }
  setMatchNote('');

  const meta = FEEDBACK_META[res.tier];
  history.push({ guess: guess, distance: null, meta: meta, p: null });
  soundForGuess(meta);

  if (res.over) {
    gameOver = true;
    soundGameOver();
    renderAll();
    return endRun(res);
  }

  if (res.roundWon) {
    RUN.totalScore = res.state.score;
    renderAll();
    const L = t();
    document.getElementById('feedbackLabel').textContent =
      L.labels[8] + '  +' + withPlural(res.points, L.run.pointForms);
    setTimeout(() => { applyRunSnapshot(res.state); applyTranslations(); renderAll(); }, 900);
    return;
  }

  RUN.locked = false;
  applyRunSnapshot(res.state);
  history = (res.state.movesLog || []).map(mv => ({
    guess: mv.guess, distance: null, meta: FEEDBACK_META[mv.tier], p: null
  }));
  renderAll();
}

// Результат уже записан сервером: отправлять нечего, остаётся показать
async function endRun(res) {
  // Испытание кончилось — то же: могло открыться «Испытание: 10»
  setTimeout(() => { if (runAuth()) loadProgress(); }, 2000);
  const L = t();
  const finalScore = (res && typeof res.score === 'number') ? res.score : (RUN ? RUN.totalScore : 0);
  const roundsSurvived = (res && typeof res.rounds === 'number')
    ? res.rounds : (RUN ? RUN.round - 1 : 0);
  const secretWas = (res && typeof res.secret === 'number') ? res.secret : secret;
  RUN = null;
  let resultHtml = '<div class="rr-title">' + L.run.over + '</div>' +
    '<p>' + L.run.secretWas + '<strong>' + secretWas + '</strong></p>' +
    '<p>' + L.run.roundsDone + '<strong>' + roundsSurvived + '</strong></p>' +
    '<p>' + L.run.finalScore + '<strong>' + finalScore + '</strong></p>';
  // Счёт записан там же, где считался. Рекорд узнаём из состояния, а не
  // из ответа на отправку: отправлять больше нечего
  const wasBest = finalScore > 0 && finalScore >= runBest();
  if (wasBest) {
    rememberRunBest(finalScore);
    resultHtml += '<p class="rr-best">' + L.run.newBest + '</p>';
  }
  resultHtml = '<div class="run-result">' + resultHtml +
    '<button class="btn-ghost" id="shareBtn" onclick="shareRunResult(' +
    finalScore + ',' + roundsSurvived + ')">' + L.run.share + '</button>' +
    '</div>';
  mode = null;
  openRunHub(resultHtml);
}

