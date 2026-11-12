// ================= ПИТОМЦЫ =================
// Шесть героев Приключения: Барсук Очкарик и Филин Монокль из Волшебного леса,
// Тукан Панама и Хамелеон Очки из Джунглей, Краб Матрос и Пингвин Капитан из
// Морской глубины. Питомец — картинка (icons/pets/<питомец>_<вид>.webp,
// нарезка листов нейросети, миграция 065): шесть эмоций и шесть обликов у
// каждого. Реакция — картинка эмоции плюс движение классом r-<имя> и
// частицы поверх; в облике картинка одна, и реакция — только движение и
// частицы. Ауры — SVG из js/pet-art.js (собирает tools/pets/pets.py) позади
// и перед картинкой, анимации — в styles.css.
// Что у игрока (питомец, наряд каждого питомца, опыт, градусник, эффект победы,
// товары дня) — из базы одним запросом my_look. Питомцев, облики и ауры
// покупают в магазине; звёздный облик открывается на 10-м уровне.
const PETS = ['badger', 'owl', 'toucan', 'cham', 'crab', 'penguin'];
// Из какого мира Приключения герой (номер в ADV_WORLDS)
const PET_WORLD = { badger: 0, owl: 0, toucan: 1, cham: 1, crab: 2, penguin: 2 };
// Три питомца на карточке в меню, пока своего нет: по одному из каждого мира
const PET_CARD_TRIO = ['badger', 'cham', 'penguin'];

// Ауры: место (slot: aura), слой рисунка (layer: aura — позади питомца,
// front — перед), чья (pet: null — всем) и рисунок по питомцам.
// Облик — отдельное место skin
const PET_AURAS = PET_AURA_ART;
const PET_SLOTS = ['aura'];
// Облики каждого питомца по порядку магазина; звёздный — не товар
const PET_SKINS = {
  badger: ['honey', 'midnight', 'snow', 'autumn', 'mint'], owl: ['snowy', 'night', 'ruby', 'ash', 'moon'],
  toucan: ['sunset', 'lime', 'arctic', 'neon', 'cherry'], cham: ['lava', 'ocean', 'lemon', 'berry', 'midnight'],
  crab: ['blue', 'sand', 'neon', 'sunny', 'deep'], penguin: ['emperor', 'night', 'snowy', 'rose', 'sunny'],
};
const PET_STAR = 'star';
// Картинки эмоций: покой и пять настроений
const PET_STATES = ['idle', 'happy', 'sad', 'cold', 'hot', 'sleepy'];
function petImg(kind, state) { return 'icons/pets/' + kind + '_' + state + '.webp'; }
// Аура подходит питомцу: общая или его
function petAuraFits(code, kind) { const a = PET_AURAS[code]; return !!a && !!a.art[kind]; }
// Чья аура или облик: код питомца или null, если всем
function petItemFor(kind, code) {
  if (kind === 'skin') return code.split('_')[0];
  if (kind === 'gear') return PET_AURAS[code] ? PET_AURAS[code].pet : null;
  return null;
}
function petSkinOk(kind, skin) { return skin === PET_STAR || (PET_SKINS[kind] || []).indexOf(skin) >= 0; }

// Питомец разметкой: <span class="pet pet-<вид> [skin-<облик>]"> аура позади,
// картинка, аура спереди, слой частиц </span>. opts: skin — облик (своя
// картинка), auras — ауры (по слоям)
function petHtml(kind, opts) {
  opts = opts || {};
  if (PETS.indexOf(kind) < 0) return '';
  const skin = opts.skin && petSkinOk(kind, opts.skin) ? opts.skin : null;
  let back = '', front = '';
  (opts.auras || []).forEach(code => {
    const a = PET_AURAS[code];
    if (!a || !a.art[kind]) return;
    const g = '<g class="pt-gear g-aura g-' + code + '">' + a.art[kind] + '</g>';
    if (a.layer === 'front') front += g; else back += g;
  });
  const svg = (s, cls) => s ? '<svg class="pet-aura ' + cls + '" viewBox="0 0 240 240" aria-hidden="true">' + s + '</svg>' : '';
  return '<span class="pet pet-' + kind + (skin ? ' skin-' + skin : '') + '" data-pet="' + kind + '"' + (skin ? ' data-skin="' + skin + '"' : '') + '>' +
    '<span class="pet-shadow" aria-hidden="true"></span>' + svg(back, 'pa-back') +
    '<span class="pet-body"><img class="pet-img" src="' + petImg(kind, skin || 'idle') + '" alt="" draggable="false"></span>' +
    svg(front, 'pa-front') + '<span class="pet-fx" aria-hidden="true"></span></span>';
}
// Картинки эмоций своего питомца — заранее в кеш, чтобы первая реакция не
// ждала сети (дальше их держит service worker)
const petWarmed = {};
function petWarm(kind) {
  if (!kind || petWarmed[kind] || typeof Image === 'undefined') return;
  petWarmed[kind] = true;
  PET_STATES.forEach(s => { const im = new Image(); im.src = petImg(kind, s); });
}

// Реакция = картинка эмоции (img), движение классом r-<имя> и частицы (fx) на
// время; новая сменяет прежнюю. В облике картинка не меняется: движение и
// частицы те же. Класс e-<эмоция> остаётся для стилей
const PET_REACT = {
  flip: { ms: 1450, img: 'happy' },
  win: { ms: 2700, img: 'happy', fx: 'sparks' },
  lose: { ms: 2600, img: 'sad', fx: 'drops' },
  element: { ms: 1900, img: 'happy', fx: 'element' },
  roar: { ms: 1500, img: 'happy', fx: 'rings' },
  sleep: { ms: 3000, img: 'sleepy', fx: 'zzz' },
  hot: { ms: 1900, img: 'hot', fx: 'steam' },
  cold: { ms: 2200, img: 'cold', fx: 'flakes' },
};
// Частицы — нарисованные (SVG 24×24), а не эмодзи: на всех телефонах одинаково
const PET_FX_ART = {
  leaf: c => '<svg viewBox="0 0 24 24"><path d="M4 20C4 9 11 3 21 3c0 10-6 17-17 17Z" fill="' + c + '" stroke="#5a2a0a" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M5 19C9 14 13 10 18 6" stroke="#5a2a0a" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',
  note: c => '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v12" stroke="#2b1550" stroke-width="2" fill="none" stroke-linejoin="round"/>' +
    '<ellipse cx="6.5" cy="18" rx="3.6" ry="2.8" fill="' + c + '" stroke="#2b1550" stroke-width="1.4"/><ellipse cx="17.5" cy="15.5" rx="3.6" ry="2.8" fill="' + c + '" stroke="#2b1550" stroke-width="1.4"/></svg>',
  spark: c => '<svg viewBox="0 0 24 24"><path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6Z" fill="' + c + '" stroke="#fff" stroke-width="1" stroke-linejoin="round"/></svg>',
  flake: c => '<svg viewBox="0 0 24 24" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/>' +
    '<path d="M9.5 3.8L12 6l2.5-2.2M9.5 20.2L12 18l2.5 2.2"/></svg>',
  drop: c => '<svg viewBox="0 0 24 24"><path d="M12 2C9 8 6 11 6 15a6 6 0 0 0 12 0c0-4-3-7-6-13Z" fill="' + c + '" stroke="#1d3d7a" stroke-width="1.4"/>' +
    '<ellipse cx="9.6" cy="14" rx="1.4" ry="2.4" fill="#fff" opacity=".7"/></svg>',
  steam: c => '<svg viewBox="0 0 24 24" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linecap="round"><path d="M8 22c-3-4 3-6 0-10s3-6 0-10"/><path d="M16 22c-3-4 3-6 0-10s3-6 0-10"/></svg>',
};
const PET_RAINBOW = ['#ff5d73', '#ff9f1c', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff'];
// Стихия у каждого своя: листья, круги звука, ноты, радуга, пузыри, снежинки
const PET_ELEMENT = {
  badger: { cls: 'fx-emo', art: 'leaf', colors: ['#e8742c', '#f2b134', '#c94a1e', '#e89a2c'], n: 7 }, owl: { cls: 'fx-ring', n: 3 },
  toucan: { cls: 'fx-emo', art: 'note', colors: ['#ffd166', '#06d6a0', '#ff5d73', '#4cc9f0'], n: 6 },
  cham: { cls: 'fx-emo', art: 'spark', colors: PET_RAINBOW, n: 6 }, crab: { cls: 'fx-bubble', n: 8 },
  penguin: { cls: 'fx-emo', art: 'flake', colors: ['#e6f6ff', '#bfe6ff', '#ffffff'], n: 7 },
};
// Частицы поверх питомца: кто где начинает, куда сносит и с какой задержкой —
// случайно, чтобы два раза подряд не было одинаково. Снос — в em: 1em слоя
// частиц = 16 % ширины питомца (styles.css)
function petFxHtml(kind, fx) {
  const R = (a, b) => a + Math.random() * (b - a);
  const part = (cls, i, ch, left, top, step) => '<i class="' + cls + '" style="left:' + left.toFixed(0) + '%;top:' + top.toFixed(0) + '%;animation-delay:' +
    (i * (step || 0.11)).toFixed(2) + 's;--dx:' + R(-1.8, 1.8).toFixed(1) + 'em;--r:' + R(-200, 200).toFixed(0) + 'deg;--s:' + R(0.75, 1.2).toFixed(2) + '">' + (ch || '') + '</i>';
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let html = '';
  if (fx === 'element') {
    const E = PET_ELEMENT[kind] || PET_ELEMENT.badger;
    for (let i = 0; i < E.n; i++) html += E.cls === 'fx-ring' ? '<i class="fx-ring" style="animation-delay:' + (i * 0.28).toFixed(2) + 's"></i>'
      : part(E.cls, i, E.art ? PET_FX_ART[E.art](E.art === 'spark' ? E.colors[i % E.colors.length] : pick(E.colors)) : '', R(8, 82), R(E.cls === 'fx-bubble' ? 45 : 30, 85));
  } else if (fx === 'sparks') {
    for (let i = 0; i < 6; i++) html += part('fx-emo fx-spark', i, PET_FX_ART.spark(pick(['#ffd166', '#fff1a8', '#ffb703'])), R(0, 85), R(5, 70));
  } else if (fx === 'drops') {
    for (let i = 0; i < 2; i++) html += part('fx-emo fx-drop', i, PET_FX_ART.drop('#7cc4ff'), 36 + i * 22, 24, 0.7);
  } else if (fx === 'steam') {
    for (let i = 0; i < 3; i++) html += part('fx-emo fx-steam', i, PET_FX_ART.steam('rgba(255,255,255,.85)'), 24 + i * 22, R(4, 14), 0.25);
  } else if (fx === 'flakes') {
    for (let i = 0; i < 5; i++) html += part('fx-emo fx-flake', i, PET_FX_ART.flake(pick(['#e6f6ff', '#bfe6ff'])), R(2, 86), R(-8, 30), 0.2);
  } else if (fx === 'rings') {
    for (let i = 0; i < 3; i++) html += '<i class="fx-ring" style="animation-delay:' + (i * 0.22).toFixed(2) + 's"></i>';
  } else if (fx === 'zzz') {
    for (let i = 0; i < 3; i++) html += '<i class="fx-z" style="left:' + (58 + i * 9) + '%;top:' + (22 - i * 7) + '%;animation-delay:' + (i * 0.5).toFixed(1) + 's">z</i>';
  }
  return html;
}
function petKindOf(pet) { return pet.dataset.pet; }
function petClearReact(pet) {
  Object.keys(PET_REACT).forEach(k => pet.classList.remove('r-' + k));
  PET_FIDGETS.forEach(f => pet.classList.remove(f));
  PET_STATES.forEach(e => pet.classList.remove('e-' + e));
  const img = pet.querySelector('.pet-img');
  if (img) { const want = petImg(petKindOf(pet), pet.dataset.skin || 'idle'); if (img.getAttribute('src') !== want) img.src = want; }
  const fx = pet.querySelector('.pet-fx');
  if (fx) fx.innerHTML = '';
}
function petReact(el, name) {
  const R = PET_REACT[name];
  if (!el || !R) return;
  const pet = el.matches && el.matches('.pet') ? el : el.querySelector('.pet');
  if (!pet) return;
  petClearReact(pet);
  void pet.getBoundingClientRect();
  const kind = petKindOf(pet);
  const img = pet.querySelector('.pet-img');
  if (img && !pet.dataset.skin) img.src = petImg(kind, R.img);
  pet.classList.add('r-' + name, 'e-' + R.img);
  const fx = pet.querySelector('.pet-fx');
  if (fx && R.fx) fx.innerHTML = petFxHtml(kind, R.fx);
  // Голос (js/sound.js): в партии — тише и вдогонку ноте хода
  if (typeof petVoice === 'function') petVoice(kind, name, !!pet.closest('#gamePet'));
  clearTimeout(pet._petT);
  pet._petT = setTimeout(() => petClearReact(pet), R.ms);
}

// Ужимки в покое: время от времени питомец сам подпрыгивает, оглядывается или
// переминается — пока он на виду и ничем не занят. Только крупные питомцы (в
// меню, на своём экране, в партии, в карточке товара), не вся витрина
const PET_FIDGETS = ['f-hop', 'f-look', 'f-wiggle'];
const PET_FIDGET_AT = '.pc-pet .pet, #pmStage .pet, #gamePet .pet, #siArt > .sha-pet .pet';
setInterval(() => {
  if (document.hidden) return;
  try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  document.querySelectorAll(PET_FIDGET_AT).forEach(pet => {
    if (!pet.offsetParent || /\br-/.test(pet.className) || /\bf-/.test(pet.className) || Math.random() > 0.2) return;
    const f = PET_FIDGETS[Math.floor(Math.random() * PET_FIDGETS.length)];
    pet.classList.add(f);
    setTimeout(() => pet.classList.remove(f), 1100);
  });
}, 1600);

// Уровень по опыту: 1–10. Следующий уровень — на 60 опыта дороже прошлого
function petLevel(xp) {
  let lv = 1, need = 60, left = Math.max(0, xp || 0);
  while (lv < 10 && left >= need) { left -= need; lv++; need += 60; }
  return { lv, xp: left, need: lv < 10 ? need : 0 };
}
// Трюки по уровням; на 10-м — звёздный облик
const PET_TRICKS = [{ code: 'flip', lv: 1 }, { code: 'element', lv: 3 }, { code: 'roar', lv: 5 }, { code: 'win', lv: 7 }, { code: 'sleep', lv: 9 }];
const PET_STAR_LV = 10;

// ---------- что у игрока ----------
// { pet, gear: {питомец: {aura: аура, skin: облик}}, xp: {питомец: опыт}, thermo, winfx, deals, dealsLeft, bundles }
let petLook = null;
let petLookAt = 0;
async function loadLook() {
  if (!runAuth() || typeof sb === 'undefined' || !sb) { petLook = null; petLookDone(); return null; }
  try {
    const r = await friendRpc('my_look', {});
    petLook = r && typeof r === 'object' && 'gear' in r ? r : null;
  } catch (e) {
    petLook = null;   // база без 063 — питомцев ещё нет
  }
  petLookAt = Date.now();
  petLookDone();
  return petLook;
}
function petLookDone() {
  renderPetCard();
  applyThermoSkin();
  if (screen === 'game') gamePetSync();
  if (!document.getElementById('petModal').classList.contains('hidden')) renderPetModal();
}
function petOwns(kind, code) { return typeof passOwns === 'function' && passOwns(kind, code); }
// Свой питомец — выбранный и купленный
function myPet() {
  return petLook && petLook.pet && PETS.indexOf(petLook.pet) >= 0 && petOwns('pet', petLook.pet) ? petLook.pet : null;
}
function petXpOf(kind) { return petLook && petLook.xp ? petLook.xp[kind] || 0 : 0; }
// Наряд питомца из базы: {aura: аура, skin: облик}
function petOutfit(kind) {
  const g = petLook && petLook.gear ? petLook.gear[kind] : null;
  return g && typeof g === 'object' ? g : {};
}
// Надетые ауры питомца — только свои и подходящие ему
function petAurasOn(kind) {
  kind = kind || myPet();
  if (!kind) return [];
  const o = petOutfit(kind);
  return PET_SLOTS.map(s => o[s]).filter(c => c && petAuraFits(c, kind) && petOwns('gear', c));
}
function petStarOpen(kind) { return petLevel(petXpOf(kind)).lv >= PET_STAR_LV; }
// Надетый облик: купленный или звёздный с 10-го уровня
function petSkinOn(kind) {
  kind = kind || myPet();
  const sk = kind ? petOutfit(kind).skin : null;
  if (!sk || !petSkinOk(kind, sk)) return null;
  if (sk === PET_STAR) return petStarOpen(kind) ? sk : null;
  return petOwns('skin', kind + '_' + sk) ? sk : null;
}
// Питомец в своём наряде — разметкой
function myPetHtml(kind) {
  kind = kind || myPet();
  return kind ? petHtml(kind, { auras: petAurasOn(kind), skin: petSkinOn(kind) }) : '';
}
function petName(kind) { return (t().pets.names || {})[kind] || kind; }
function petSkinName(code) { return code === PET_STAR ? t().pets.star : (t().pets.skins || {})[code] || code; }
// «Герой мира „Волшебный лес“»
function petHeroText(kind) {
  const w = PET_WORLD[kind];
  return typeof advWorldName === 'function' && w !== undefined ? t().pets.hero.replace('{world}', advWorldName(w)) : '';
}

// ---------- карточка в меню ----------
// Со своим питомцем — он сам, уровень и полоса опыта. Без питомца — три
// питомца в ряд и «в магазин». Без входа карточки нет
function renderPetCard() {
  const box = document.getElementById('petCard');
  if (!box) return;
  const P = t().pets;
  if (!runAuth() || !petLook) { box.classList.add('hidden'); box.innerHTML = ''; return; }
  box.classList.remove('hidden');
  // Карточка — кнопка: Enter и пробел тоже открывают
  box.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); box.click(); } };
  const kind = myPet();
  if (!kind) {
    box.className = 'pet-card none';
    box.innerHTML = '<span class="pc-trio">' + PET_CARD_TRIO.map(k => '<span class="pc-mini">' + petHtml(k) + '</span>').join('') + '</span>' +
      '<span class="pc-text"><b>' + escapeHtml(P.cardNone) + '</b><span>' + escapeHtml(P.cardNoneSub) + '</span></span><span class="m-go">›</span>';
    box.onclick = () => openShop('pet');
    return;
  }
  petWarm(kind);
  const L = petLevel(petXpOf(kind));
  const next = PET_TRICKS.find(x => x.lv > L.lv);
  const nextText = next ? P.cardNext.replace('{n}', next.lv).replace('{what}', P.tricks[next.code])
    : L.lv < PET_STAR_LV ? P.cardNext.replace('{n}', PET_STAR_LV).replace('{what}', P.star) : P.maxLevel;
  box.className = 'pet-card';
  box.innerHTML = '<span class="pc-pet">' + myPetHtml(kind) + '</span>' +
    '<span class="pc-text"><b>' + escapeHtml(petName(kind)) + ' <small>' + escapeHtml(P.level.replace('{n}', L.lv)) + '</small></b>' +
    '<span class="pc-bar"><i style="width:' + (L.need ? Math.round(100 * L.xp / L.need) : 100) + '%"></i></span>' +
    '<span class="pc-next">' + escapeHtml(nextText) + '</span></span><span class="m-go">›</span>';
  box.onclick = e => {
    // Нажали на самого питомца — сальто; на карточку — открылся его экран
    if (e.target.closest('.pc-pet')) { petReact(box.querySelector('.pc-pet'), 'flip'); return; }
    openPetModal();
  };
}

// ---------- экран питомца ----------
let petModalKind = null;
function openPetModal(kind) {
  petModalKind = kind || myPet() || PETS[0];
  document.getElementById('petModal').classList.remove('hidden');
  renderPetModal();
}
function closePetModal() {
  document.getElementById('petModal').classList.add('hidden');
}
function renderPetModal() {
  const P = t().pets, S = t().shop;
  const kind = petModalKind || myPet() || PETS[0];
  const own = petOwns('pet', kind), mine = myPet() === kind;
  const L = petLevel(petXpOf(kind));
  const it = typeof shopItem === 'function' ? shopItem('pet', kind) : null;
  if (own) petWarm(kind);
  document.getElementById('pmName').textContent = petName(kind);
  document.getElementById('pmRar').textContent = it ? S.rarity[it.rar] : '';
  document.getElementById('pmRar').className = 'pm-rar rar-' + (it ? it.rar : 'common');
  document.getElementById('pmWho').textContent = petHeroText(kind) + ' ' + P.who[kind];
  const stage = document.getElementById('pmStage');
  stage.innerHTML = own ? myPetHtml(kind) : petHtml(kind);
  stage.onclick = () => petReact(stage, 'flip');
  // Уровень и опыт
  document.getElementById('pmLevel').textContent = own ? P.level.replace('{n}', L.lv) : '';
  document.getElementById('pmXp').innerHTML = own ? '<span class="pc-bar"><i style="width:' + (L.need ? Math.round(100 * L.xp / L.need) : 100) +
    '%"></i></span><small>' + escapeHtml(L.need ? P.xp.replace('{a}', L.xp).replace('{b}', L.need) : P.maxLevel) + ' · ' + escapeHtml(P.xpHow) + '</small>' : '';
  // Трюки: открытые нажимаются, закрытые — с уровнем
  const tricks = document.getElementById('pmTricks');
  tricks.innerHTML = '<b>' + escapeHtml(P.tricksHead) + '</b>' + PET_TRICKS.map(x => {
    const open = own && L.lv >= x.lv;
    return '<button type="button" class="pm-trick' + (open ? '' : ' locked') + '" data-trick="' + x.code + '"' + (open ? '' : ' disabled') + '>' +
      escapeHtml(P.tricks[x.code]) + (open ? '' : ' <small>🔒 ' + escapeHtml(P.lv.replace('{n}', x.lv)) + '</small>') + '</button>';
  }).join('');
  tricks.querySelectorAll('[data-trick]').forEach(b => { b.onclick = () => petReact(stage, b.dataset.trick); });
  // Облики: обычный, купленные, звёздный (с 10-го уровня); остальные — в магазине
  const skins = document.getElementById('pmSkins');
  const on = own ? petSkinOn(kind) : null;
  const ownSkins = PET_SKINS[kind].filter(sk => petOwns('skin', kind + '_' + sk));
  const starOpen = own && petStarOpen(kind);
  if (!own) skins.innerHTML = '';
  else {
    skins.innerHTML = '<b>' + escapeHtml(P.skinsHead) + '</b>' +
      '<button type="button" class="pm-trick" data-skin="" aria-pressed="' + !on + '">' + escapeHtml(P.skinPlain) + '</button>' +
      ownSkins.map(sk => '<button type="button" class="pm-trick" data-skin="' + sk + '" aria-pressed="' + (on === sk) + '">' + escapeHtml(petSkinName(sk)) + '</button>').join('') +
      '<button type="button" class="pm-trick star' + (starOpen ? '' : ' locked') + '" data-skin="' + PET_STAR + '" aria-pressed="' + (on === PET_STAR) + '"' +
        (starOpen ? '' : ' disabled') + '>✨ ' + escapeHtml(P.star) + (starOpen ? '' : ' <small>🔒 ' + escapeHtml(P.lv.replace('{n}', PET_STAR_LV)) + '</small>') + '</button>' +
      (ownSkins.length < PET_SKINS[kind].length ? '<button type="button" class="pm-gear" data-shop="skin">🛍️ ' + escapeHtml(P.skinShop) + '</button>' : '');
    skins.querySelectorAll('[data-skin]').forEach(b => { b.onclick = () => petWearGear('skin', b.dataset.skin || null); });
  }
  // Ауры: только подходящие этому питомцу; надетая — подсвечена, нажатие
  // снимает или надевает. Подпись места — только когда мест больше одного
  const gear = document.getElementById('pmGear');
  const ownAuras = Object.keys(PET_AURAS).filter(c => petAuraFits(c, kind) && petOwns('gear', c));
  const outfit = petOutfit(kind);
  if (!own) gear.innerHTML = '';
  else if (!ownAuras.length) {
    gear.innerHTML = '<b>' + escapeHtml(P.gearHead) + '</b><span class="pm-none">' + escapeHtml(P.gearNone) + '</span>' +
      '<button type="button" class="pm-gear" data-shop="gear">🛍️ ' + escapeHtml(P.gearShop) + '</button>';
  } else {
    gear.innerHTML = '<b>' + escapeHtml(P.gearHead) + '</b>' + PET_SLOTS.filter(slot => ownAuras.some(c => PET_AURAS[c].slot === slot)).map(slot => {
      const codes = ownAuras.filter(c => PET_AURAS[c].slot === slot);
      return '<div class="pm-slot">' + (PET_SLOTS.length > 1 ? '<span class="pm-slot-name">' + escapeHtml(S.slots[slot]) + '</span>' : '') +
        codes.map(c => '<button type="button" class="pm-gear' + (c === outfit[slot] ? ' on' : '') + '" data-slot="' + slot + '" data-code="' + c + '" aria-pressed="' +
          (c === outfit[slot]) + '">' + escapeHtml(S.gear[c]) + '</button>').join('') + '</div>';
    }).join('') + '<button type="button" class="pm-gear" data-shop="gear">🛍️ ' + escapeHtml(P.gearShop) + '</button>';
  }
  gear.querySelectorAll('[data-slot]').forEach(b => { b.onclick = () => petWearGear(b.dataset.slot, outfit[b.dataset.slot] === b.dataset.code ? null : b.dataset.code); });
  document.querySelectorAll('#pmSkins [data-shop], #pmGear [data-shop]').forEach(b => { b.onclick = () => { closePetModal(); openShop(b.dataset.shop); }; });
  // Все питомцы: свои — выбрать, остальные — в магазин
  document.getElementById('pmPets').innerHTML = PETS.map(k => {
    const o = petOwns('pet', k), lv = petLevel(petXpOf(k)).lv;
    return '<button type="button" class="pm-pick' + (k === kind ? ' sel' : '') + (o ? '' : ' locked') + '" data-pet="' + k + '">' +
      '<span class="pm-pick-art">' + (o ? myPetHtml(k) : petHtml(k)) + '</span><span>' + escapeHtml(petName(k)) + '</span><small>' +
      escapeHtml(o ? (myPet() === k ? P.withYou : P.level.replace('{n}', lv)) : (shopItem('pet', k) ? shopPriceText(shopItem('pet', k)) : '')) + '</small></button>';
  }).join('');
  document.querySelectorAll('#pmPets [data-pet]').forEach(b => { b.onclick = () => { petModalKind = b.dataset.pet; renderPetModal(); }; });
  // Главная кнопка: взять с собой / уже с вами / купить
  const go = document.getElementById('pmGo');
  go.disabled = false;
  if (!own) { go.textContent = S.buyFor.replace('{p}', it ? shopPriceText(it) : ''); go.onclick = () => { closePetModal(); openShop('pet'); openShopItem('pet', kind); }; }
  else if (mine) { go.textContent = P.withYou; go.disabled = true; }
  else { go.textContent = P.takeWith; go.onclick = () => petChoose(kind); }
  document.getElementById('pmClose').textContent = S.close;
}

async function petChoose(kind) {
  try { await friendRpc('set_pet', { p_pet: kind }); } catch (e) { return; }
  if (petLook) petLook.pet = kind;
  renderPetModal(); renderPetCard(); gamePetSync(true);
  petReact(document.getElementById('pmStage'), 'win');
}
// Надеть на своего питомца ауру (slot: aura) или облик (skin); null — снять.
// База возвращает наряды всех питомцев
async function petWearGear(slot, code) {
  let g;
  try { g = await friendRpc('set_pet_gear', { p_slot: slot, p_code: code || null }); } catch (e) { return; }
  if (petLook) petLook.gear = g && typeof g === 'object' ? g : {};
  renderPetModal(); renderPetCard(); gamePetSync(true);
  petReact(document.getElementById('pmStage'), 'flip');
}

// ---------- питомец в партии ----------
// Сидит над полем ввода справа и отвечает на свои ходы: «горячо», «холодно»,
// победа, проигрыш. Его можно спрятать в меню «вид» (👁️)
const PET_IN_GAME_KEY = 'hc_pet_in_game';
function petInGame() {
  try { return localStorage.getItem(PET_IN_GAME_KEY) !== '0'; } catch (e) { return true; }
}
function togglePetInGame() {
  try { localStorage.setItem(PET_IN_GAME_KEY, petInGame() ? '0' : '1'); } catch (e) {}
  gamePetSync();
  if (typeof renderVizToggles === 'function') renderVizToggles();
}
let gamePetKey = '';
let gamePetMove = null;
function gamePetSync(force) {
  const box = document.getElementById('gamePet');
  if (!box) return;
  const kind = myPet();
  // В уроках обучения питомца нет: там учитель, и смотреть надо на подсказки
  const show = screen === 'game' && !!kind && petInGame() && !(typeof lesson !== 'undefined' && lesson);
  box.classList.toggle('hidden', !show);
  if (!show) return;
  petWarm(kind);
  const key = kind + '|' + petAurasOn(kind).join(',') + '|' + (petSkinOn(kind) || '');
  if (force || key !== gamePetKey || !box.firstChild) {
    gamePetKey = key;
    box.innerHTML = myPetHtml(kind);
    box.onclick = () => petReact(box, 'flip');
  }
  gamePetPlace();
}
// Вход на доску: прошлые ходы питомец не переживает заново
function gamePetEnter() {
  gamePetMove = typeof currentMove === 'function' ? currentMove() : null;
  gamePetOutcomeKey = null;
  gamePetSync(true);
}
// Над полем ввода, если оно прижато к низу; иначе — в углу экрана
function gamePetPlace() {
  const box = document.getElementById('gamePet');
  if (!box || box.classList.contains('hidden')) return;
  const dock = ['guessSection', 'finalBox', 'forcedTurn'].map(id => document.getElementById(id))
    .find(el => el && !el.classList.contains('hidden') && getComputedStyle(el).position === 'fixed');
  const r = dock ? dock.getBoundingClientRect() : null;
  box.style.bottom = (r && r.height ? Math.round(window.innerHeight - r.top) + 4 : 12) + 'px';
}
// Новый ход: свой — питомец отвечает поясом. Чужие ходы он только смотрит
function gamePetOnMove(mv) {
  if (!mv || mv === gamePetMove) return;
  gamePetMove = mv;
  if (screen !== 'game') return;
  const mine = mode !== 'duel' || (typeof online !== 'undefined' && online ? mv.p === online.seat : mv.p === 0);
  if (!mine || !mv.meta || mv.meta.custom || isHit(mv)) return;
  const k = mv.meta.labelIndex;
  if (k >= 5) petReact(document.getElementById('gamePet'), 'hot');
  else if (k <= 1) petReact(document.getElementById('gamePet'), 'cold');
}
// Итог: победа или проигрыш — один раз на событие
let gamePetOutcomeKey = null;
function gamePetOutcome(key, won) {
  if (key === gamePetOutcomeKey) return;
  gamePetOutcomeKey = key;
  gamePetSync();
  gamePetPlace();
  petReact(document.getElementById('gamePet'), won ? 'win' : 'lose');
}
window.addEventListener('resize', () => gamePetPlace());

// ---------- облик градусника ----------
const THERMO_SKINS = ['ice', 'lava', 'neon', 'space'];
function applyThermoSkin(code) {
  const wrap = document.getElementById('thermoWrap');
  if (!wrap) return;
  const want = code !== undefined ? code : (petLook && petLook.thermo && petOwns('thermo', petLook.thermo) ? petLook.thermo : null);
  THERMO_SKINS.forEach(s => wrap.classList.toggle('sk-' + s, s === want));
}
// Градусник в магазине: тот же, что в партии, только маленький
function thermoMiniHtml(code) {
  return '<span class="thermo-mini sk-' + code + '"><span class="thermo-tube"><span class="thermo-fill" style="height:62%;background:#f97316"></span></span>' +
    '<span class="thermo-bulb" style="background:#f97316"></span></span>';
}

// ---------- эффекты победы ----------
const WINFX = { confetti: '🎊', fireworks: '🎆', lightning: '⚡', meteors: '☄️' };
function myWinFx() {
  return petLook && petLook.winfx && WINFX[petLook.winfx] && petOwns('winfx', petLook.winfx) ? petLook.winfx : null;
}
// Эффект на весь экран, полторы секунды; нажатиям не мешает
function playWinFx(code, big) {
  try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  const layer = document.createElement('div');
  layer.className = 'winfx winfx-' + code;
  const R = (a, b) => a + Math.random() * (b - a);
  let html = '';
  if (code === 'confetti') {
    const colors = ['#ff5d73', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff9f1c'];
    for (let i = 0; i < (big ? 70 : 46); i++) {
      html += '<i style="left:' + R(0, 100).toFixed(1) + '%;background:' + colors[i % colors.length] + ';--r:' + R(-540, 540).toFixed(0) +
        'deg;--x:' + R(-60, 60).toFixed(0) + 'px;animation-delay:' + R(0, 0.5).toFixed(2) + 's;animation-duration:' + R(1.4, 2.2).toFixed(2) + 's"></i>';
    }
  } else if (code === 'fireworks') {
    const colors = ['#ffd166', '#ff5d73', '#4cc9f0', '#06d6a0', '#ffffff'];
    for (let b = 0; b < (big ? 5 : 3); b++) {
      const x = R(15, 85).toFixed(0), y = R(15, 55).toFixed(0), col = colors[b % colors.length], d = (b * 0.32).toFixed(2);
      html += '<span class="fw" style="left:' + x + '%;top:' + y + '%">';
      for (let i = 0; i < 16; i++) {
        const a = i * Math.PI / 8;
        html += '<i style="background:' + col + ';--dx:' + (Math.cos(a) * 70).toFixed(0) + 'px;--dy:' + (Math.sin(a) * 70).toFixed(0) +
          'px;animation-delay:' + d + 's"></i>';
      }
      html += '</span>';
    }
  } else if (code === 'lightning') {
    html = '<b class="flash"></b>';
    for (let i = 0; i < (big ? 4 : 3); i++) {
      let x = R(10, 90), y = -5, d = 'M' + x.toFixed(1) + ' ' + y;
      while (y < 70) { x += R(-9, 9); y += R(7, 13); d += ' L' + x.toFixed(1) + ' ' + y.toFixed(1); }
      html += '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="animation-delay:' + (i * 0.18).toFixed(2) + 's"><path d="' + d +
        '" fill="none" stroke="#fff6a8" stroke-width="1.4" vector-effect="non-scaling-stroke"/><path d="' + d +
        '" fill="none" stroke="#7df9ff" stroke-width="6" opacity=".35" vector-effect="non-scaling-stroke"/></svg>';
    }
  } else if (code === 'meteors') {
    for (let i = 0; i < (big ? 12 : 8); i++) {
      html += '<i style="left:' + R(20, 110).toFixed(0) + '%;top:' + R(-20, 30).toFixed(0) + '%;animation-delay:' + R(0, 0.9).toFixed(2) + 's"></i>';
    }
    for (let i = 0; i < 18; i++) html += '<s style="left:' + R(0, 100).toFixed(0) + '%;top:' + R(0, 70).toFixed(0) + '%;animation-delay:' + R(0, 1).toFixed(2) + 's">✦</s>';
  }
  layer.innerHTML = html;
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 2600);
}
