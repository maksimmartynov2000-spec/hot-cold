// ================= ПИТОМЦЫ =================
// Огнелис, Ледяной волк и Грозовой дракон (миграция 063). Рисунки — в
// js/pet-art.js (собирает tools/pets/pets.py), анимации — классами в
// styles.css: покой идёт сам, реакция — класс r-<имя> на время.
// Что у игрока (питомец, вещи на нём, опыт, градусник, эффект победы, товары
// дня) — из базы одним запросом my_look. Питомца и вещи покупают в магазине.
const PETS = ['fox', 'wolf', 'drake'];

// Куда садятся вещи: точка и масштаб у каждого питомца (координаты рисунка 240×240)
const PET_ANCHORS = {
  fox:   { head: [120, 55, 1], eyes: [120, 83, 1], neck: [120, 117, 1], back: [120, 118, 1], aura: [120, 138, 0.86] },
  wolf:  { head: [120, 50, 1.06], eyes: [120, 84, 1.04], neck: [120, 138, 1.12], back: [120, 116, 1.12], aura: [120, 138, 0.88] },
  drake: { head: [120, 46, 1.06], eyes: [120, 80, 1.06], neck: [120, 128, 1.06], back: [120, 118, 1.1], aura: [120, 136, 0.9] },
};

const GEAR_OL = 'stroke="#1b1030" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
function gearFlames() {
  let s = '';
  for (let i = 0; i < 12; i++) {
    const a = i * 30;
    s += '<path transform="rotate(' + a + ')" d="M -8 -96 C -8 -106 -2 -112 0 -122 C 2 -112 8 -106 8 -96 Z" fill="#ff8a1a" ' + GEAR_OL + '/>' +
      '<path transform="rotate(' + a + ')" d="M -4 -98 C -4 -104 -1 -108 0 -114 C 1 -108 4 -104 4 -98 Z" fill="#ffe27a"/>';
  }
  return '<circle r="96" fill="none" stroke="#ff6a1a" stroke-width="5" opacity=".55"/>' + s;
}
function gearIce() {
  let s = '';
  for (let i = 0; i < 10; i++) {
    const a = i * 36;
    s += '<g transform="rotate(' + a + ')"><path d="M 0 -122 L 7 -100 L 0 -94 Z" fill="#1d6fd0"/><path d="M 0 -122 L -7 -100 L 0 -94 Z" fill="#c8f6ff"/>' +
      '<path d="M 0 -122 L 7 -100 L 0 -94 L -7 -100 Z" fill="none" ' + GEAR_OL + '/></g>';
  }
  return '<circle r="98" fill="none" stroke="#8be3ff" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round" opacity=".8"/>' + s;
}
function gearStorm() {
  let s = '';
  for (let i = 0; i < 8; i++) {
    const a = i * 45 + 22;
    s += '<path transform="rotate(' + a + ')" d="M -4 -122 L 4 -110 L -2 -108 L 6 -94" fill="none" stroke="#ffe14d" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  return '<circle r="100" fill="none" stroke="#7df9ff" stroke-width="3" opacity=".6"/><circle r="92" fill="none" stroke="#8f7cff" stroke-width="2" stroke-dasharray="6 8" opacity=".7"/>' + s;
}


// Вещи. slot: head — на голову, eyes — на глаза, neck — на шею, back — за спину, aura — вокруг
const PET_GEAR = {
  crown: { slot: 'head', svg:
    '<path d="M -21 2 L -24 -19 L -11 -8 L 0 -26 L 11 -8 L 24 -19 L 21 2 Z" fill="#ffc83a" ' + GEAR_OL + '/>' +
    '<path d="M -18 -2 L -20 -13 L -11 -5 Z M 2 -20 L 0 -9 L -5 -6 Z" fill="#fff3b0" opacity=".8"/>' +
    '<rect x="-22" y="-2" width="44" height="8" rx="3.5" fill="#e0a000" ' + GEAR_OL + '/>' +
    '<circle cx="0" cy="2" r="3" fill="#ff3b5c" stroke="#1b1030" stroke-width="1.4"/><circle cx="-12" cy="2" r="2.2" fill="#3bd1ff" stroke="#1b1030" stroke-width="1.2"/>' +
    '<circle cx="12" cy="2" r="2.2" fill="#3bd1ff" stroke="#1b1030" stroke-width="1.2"/>' +
    '<circle cx="0" cy="-26" r="3" fill="#fff6c8" ' + GEAR_OL + '/><circle cx="-24" cy="-19" r="2.4" fill="#fff6c8" ' + GEAR_OL + '/><circle cx="24" cy="-19" r="2.4" fill="#fff6c8" ' + GEAR_OL + '/>' },
  viking: { slot: 'head', svg:
    '<path d="M -20 -8 C -30 -10 -38 -22 -34 -36 C -30 -26 -22 -20 -14 -18 Z" fill="#fff2d6" ' + GEAR_OL + '/>' +
    '<path d="M 20 -8 C 30 -10 38 -22 34 -36 C 30 -26 22 -20 14 -18 Z" fill="#fff2d6" ' + GEAR_OL + '/>' +
    '<path d="M -21 4 C -21 -20 21 -20 21 4 Z" fill="#9aa6b8" ' + GEAR_OL + '/>' +
    '<path d="M -14 -8 C -10 -14 -2 -16 4 -16" fill="none" stroke="#e6edf7" stroke-width="2.4" stroke-linecap="round"/>' +
    '<rect x="-23" y="0" width="46" height="7" rx="3" fill="#c48a3a" ' + GEAR_OL + '/>' +
    '<circle cx="-14" cy="3.5" r="1.6" fill="#ffe7b0"/><circle cx="0" cy="3.5" r="1.6" fill="#ffe7b0"/><circle cx="14" cy="3.5" r="1.6" fill="#ffe7b0"/>' },
  wizard: { slot: 'head', svg:
    '<path d="M -18 2 C -10 -14 -4 -30 2 -44 C 6 -48 12 -50 16 -46 C 10 -44 8 -38 9 -30 C 12 -18 16 -8 18 2 Z" fill="#5b3fd6" ' + GEAR_OL + '/>' +
    '<path d="M -4 -10 l 2 -5 l 2 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 Z" fill="#ffd23a"/>' +
    '<circle cx="6" cy="-26" r="2" fill="#7df9ff"/><circle cx="-8" cy="-2" r="1.6" fill="#7df9ff"/>' +
    '<ellipse cx="0" cy="3" rx="27" ry="6" fill="#4428b8" ' + GEAR_OL + '/>' },
  shades: { slot: 'eyes', svg:
    '<path d="M -29 -5 L -5 -5 L -7 5 C -9 9 -23 9 -26 5 Z" fill="#141022" ' + GEAR_OL + '/>' +
    '<path d="M 29 -5 L 5 -5 L 7 5 C 9 9 23 9 26 5 Z" fill="#141022" ' + GEAR_OL + '/>' +
    '<path d="M -5 -3 C -2 -5 2 -5 5 -3" fill="none" stroke="#1b1030" stroke-width="2.6"/>' +
    '<path d="M -24 -2 L -18 -2 M 10 -2 L 16 -2" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".8"/>' },
  scarf: { slot: 'neck', svg:
    '<path d="M -30 -8 C -12 2 12 2 30 -8 L 32 4 C 12 14 -12 14 -32 4 Z" fill="#e8344a" ' + GEAR_OL + '/>' +
    '<path d="M -22 -2 L -24 8 M -8 2 L -9 12 M 8 2 L 9 12 M 22 -2 L 24 8" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" opacity=".85"/>' +
    '<path d="M 10 8 L 16 34 L 28 31 L 22 6 Z" fill="#e8344a" ' + GEAR_OL + '/>' +
    '<path d="M 13 20 L 25 17" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M 17 34 l -1 4 M 21 33 l 0 4 M 25 32 l 1 4" stroke="#e8344a" stroke-width="2" stroke-linecap="round"/>' },
  bowtie: { slot: 'neck', svg:
    '<path d="M -3 0 L -20 -9 L -20 9 Z" fill="#7c5cff" ' + GEAR_OL + '/><path d="M 3 0 L 20 -9 L 20 9 Z" fill="#7c5cff" ' + GEAR_OL + '/>' +
    '<rect x="-5" y="-5" width="10" height="10" rx="3" fill="#a48bff" ' + GEAR_OL + '/>' },
  cape: { slot: 'back', svg:
    '<path d="M -34 -4 C -54 30 -66 70 -72 98 C -40 92 40 92 72 98 C 66 70 54 30 34 -4 Z" fill="#c8243c" ' + GEAR_OL + '/>' +
    '<path d="M -40 30 C -48 54 -54 74 -58 90 M 40 30 C 48 54 54 74 58 90" fill="none" stroke="#8e1226" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M -28 2 C -38 22 -44 40 -48 56" fill="none" stroke="#ff6b7d" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>' },
  aura_fire: { slot: 'aura', svg: gearFlames() },
  aura_ice: { slot: 'aura', svg: gearIce() },
  aura_storm: { slot: 'aura', svg: gearStorm() },
};

const PET_SLOTS = ['head', 'eyes', 'neck', 'back', 'aura'];

let petSeq = 0;
// Рисунок питомца строкой SVG. opts: gear — вещи (по одной на место), gold — золотой облик
function petSvg(kind, opts) {
  opts = opts || {};
  if (!PET_ART[kind]) return '';
  const n = ++petSeq;
  // Свои id у каждого экземпляра: один питомец бывает на странице дважды,
  // и градиенты из спрятанной копии в некоторых браузерах не рисуются
  let svg = PET_ART[opts.gold ? kind + '_gold' : kind].replace(new RegExp('(id="|url\\(#)' + kind + '-', 'g'), '$1' + kind + n + '-');
  const A = PET_ANCHORS[kind], by = {};
  (opts.gear || []).forEach(code => { const g = PET_GEAR[code]; if (g) by[g.slot] = g; });
  const put = slot => {
    const g = by[slot]; if (!g) return '';
    const [x, y, s] = A[slot];
    return '<g class="pt-gear g-' + slot + '" transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + g.svg + '</g>';
  };
  return svg.replace('<g class="pt-gear-aura"></g>', '<g class="pt-gear-aura">' + put('aura') + '</g>')
    .replace('<g class="pt-gear-back"></g>', '<g class="pt-gear-back">' + put('back') + '</g>')
    .replace('<g class="pt-gear-neck"></g>', '<g class="pt-gear-neck">' + put('neck') + '</g>')
    .replace('<g class="pt-gear-head"></g>', '<g class="pt-gear-head">' + put('eyes') + put('head') + '</g>');
}

// Реакция: класс r-<имя> на время. Новая реакция сменяет прежнюю
const PET_REACT_MS = { jump: 800, hot: 1500, cold: 1600, win: 2200, lose: 2000, element: 1400, roar: 1300 };
function petReact(el, name) {
  if (!el || !PET_REACT_MS[name]) return;
  const svg = el.matches && el.matches('svg.pet') ? el : el.querySelector('svg.pet');
  if (!svg) return;
  Object.keys(PET_REACT_MS).forEach(k => svg.classList.remove('r-' + k));
  void svg.getBoundingClientRect();
  svg.classList.add('r-' + name);
  clearTimeout(svg._petT);
  svg._petT = setTimeout(() => svg.classList.remove('r-' + name), PET_REACT_MS[name]);
}

// Уровень по опыту: 1–10. Следующий уровень — на 60 опыта дороже прошлого
function petLevel(xp) {
  let lv = 1, need = 60, left = Math.max(0, xp || 0);
  while (lv < 10 && left >= need) { left -= need; lv++; need += 60; }
  return { lv, xp: left, need: lv < 10 ? need : 0 };
}
// Трюки по уровням; на 10-м — золотой облик
const PET_TRICKS = [{ code: 'jump', lv: 1 }, { code: 'element', lv: 3 }, { code: 'roar', lv: 5 }, { code: 'win', lv: 7 }];
const PET_GOLD_LV = 10;

// ---------- что у игрока ----------
// { pet, gear: {место: вещь}, xp: {питомец: опыт}, thermo, winfx, deals, dealsLeft, bundles }
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
function petGearOn() {
  if (!petLook || !petLook.gear) return [];
  return PET_SLOTS.map(s => petLook.gear[s]).filter(c => c && PET_GEAR[c] && petOwns('gear', c));
}
// Золотой облик: открыт на 10-м уровне, включается и выключается на экране питомца
function petGoldKey(kind) { return 'hc_pet_gold_' + kind; }
function petGoldOn(kind) {
  if (petLevel(petXpOf(kind)).lv < PET_GOLD_LV) return false;
  try { return localStorage.getItem(petGoldKey(kind)) !== '0'; } catch (e) { return true; }
}
// Свой питомец со всеми вещами — строкой SVG
function myPetSvg(kind) {
  kind = kind || myPet();
  return kind ? petSvg(kind, { gear: kind === myPet() ? petGearOn() : [], gold: petGoldOn(kind) }) : '';
}
function petName(kind) { return (t().pets.names || {})[kind] || kind; }

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
    box.innerHTML = '<span class="pc-trio">' + PETS.map(k => '<span class="pc-mini">' + petSvg(k) + '</span>').join('') + '</span>' +
      '<span class="pc-text"><b>' + escapeHtml(P.cardNone) + '</b><span>' + escapeHtml(P.cardNoneSub) + '</span></span><span class="m-go">›</span>';
    box.onclick = () => openShop('pet');
    return;
  }
  const L = petLevel(petXpOf(kind));
  const next = PET_TRICKS.find(x => x.lv > L.lv);
  const nextText = next ? P.cardNext.replace('{n}', next.lv).replace('{what}', P.tricks[next.code])
    : L.lv < PET_GOLD_LV ? P.cardNext.replace('{n}', PET_GOLD_LV).replace('{what}', P.gold) : P.maxLevel;
  box.className = 'pet-card';
  box.innerHTML = '<span class="pc-pet">' + myPetSvg(kind) + '</span>' +
    '<span class="pc-text"><b>' + escapeHtml(petName(kind)) + ' <small>' + escapeHtml(P.level.replace('{n}', L.lv)) + '</small></b>' +
    '<span class="pc-bar"><i style="width:' + (L.need ? Math.round(100 * L.xp / L.need) : 100) + '%"></i></span>' +
    '<span class="pc-next">' + escapeHtml(nextText) + '</span></span><span class="m-go">›</span>';
  box.onclick = e => {
    // Нажали на самого питомца — подпрыгнул; на карточку — открылся его экран
    if (e.target.closest('.pc-pet')) { petReact(box.querySelector('.pc-pet'), 'jump'); return; }
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
  document.getElementById('pmName').textContent = petName(kind);
  document.getElementById('pmRar').textContent = it ? S.rarity[it.rar] : '';
  document.getElementById('pmRar').className = 'pm-rar rar-' + (it ? it.rar : 'common');
  document.getElementById('pmWho').textContent = P.who[kind];
  const stage = document.getElementById('pmStage');
  stage.innerHTML = own ? myPetSvg(kind) : petSvg(kind);
  stage.onclick = () => petReact(stage, 'jump');
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
  }).join('') + (function () {
    const open = own && L.lv >= PET_GOLD_LV, on = open && petGoldOn(kind);
    return '<button type="button" class="pm-trick gold' + (open ? '' : ' locked') + '" data-gold aria-pressed="' + on + '"' + (open ? '' : ' disabled') + '>✨ ' +
      escapeHtml(P.gold) + (open ? '' : ' <small>🔒 ' + escapeHtml(P.lv.replace('{n}', PET_GOLD_LV)) + '</small>') + '</button>';
  })();
  tricks.querySelectorAll('[data-trick]').forEach(b => { b.onclick = () => petReact(stage, b.dataset.trick); });
  const gb = tricks.querySelector('[data-gold]');
  if (gb) gb.onclick = () => {
    try { localStorage.setItem(petGoldKey(kind), petGoldOn(kind) ? '0' : '1'); } catch (e) {}
    renderPetModal(); renderPetCard(); gamePetSync(true);
    petReact(document.getElementById('pmStage'), 'jump');
  };
  // Вещи по местам: надетая — подсвечена, нажатие снимает или надевает
  const gear = document.getElementById('pmGear');
  const ownGear = Object.keys(PET_GEAR).filter(c => petOwns('gear', c));
  if (!own) gear.innerHTML = '';
  else if (!ownGear.length) {
    gear.innerHTML = '<b>' + escapeHtml(P.gearHead) + '</b><span class="pm-none">' + escapeHtml(P.gearNone) + '</span>' +
      '<button type="button" class="pm-gear" data-shop="gear">🛍️ ' + escapeHtml(P.gearShop) + '</button>';
  } else {
    gear.innerHTML = '<b>' + escapeHtml(P.gearHead) + '</b>' + PET_SLOTS.map(slot => {
      const codes = ownGear.filter(c => PET_GEAR[c].slot === slot);
      const on = petLook && petLook.gear ? petLook.gear[slot] : null;
      return '<div class="pm-slot"><span class="pm-slot-name">' + escapeHtml(S.slots[slot]) + '</span>' +
        (codes.length ? codes.map(c => '<button type="button" class="pm-gear' + (c === on ? ' on' : '') + '" data-slot="' + slot + '" data-code="' + c + '" aria-pressed="' +
          (c === on) + '">' + escapeHtml(S.gear[c]) + '</button>').join('') : '<span class="pm-none">—</span>') + '</div>';
    }).join('') + '<button type="button" class="pm-gear" data-shop="gear">🛍️ ' + escapeHtml(P.gearShop) + '</button>';
  }
  gear.querySelectorAll('[data-slot]').forEach(b => { b.onclick = () => petWearGear(b.dataset.slot, b.dataset.code); });
  gear.querySelectorAll('[data-shop]').forEach(b => { b.onclick = () => { closePetModal(); openShop('gear'); }; });
  // Все питомцы: свои — выбрать, остальные — в магазин
  document.getElementById('pmPets').innerHTML = PETS.map(k => {
    const o = petOwns('pet', k), lv = petLevel(petXpOf(k)).lv;
    return '<button type="button" class="pm-pick' + (k === kind ? ' sel' : '') + (o ? '' : ' locked') + '" data-pet="' + k + '">' +
      '<span class="pm-pick-art">' + petSvg(k) + '</span><span>' + escapeHtml(petName(k)) + '</span><small>' +
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
async function petWearGear(slot, code) {
  const on = petLook && petLook.gear && petLook.gear[slot] === code;
  let g;
  try { g = await friendRpc('set_pet_gear', { p_slot: slot, p_code: on ? null : code }); } catch (e) { return; }
  if (petLook) petLook.gear = g && typeof g === 'object' ? g : {};
  renderPetModal(); renderPetCard(); gamePetSync(true);
  petReact(document.getElementById('pmStage'), 'jump');
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
  const key = kind + '|' + petGearOn().join(',') + '|' + petGoldOn(kind);
  if (force || key !== gamePetKey || !box.firstChild) {
    gamePetKey = key;
    box.innerHTML = myPetSvg(kind);
    box.onclick = () => petReact(box, 'jump');
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
