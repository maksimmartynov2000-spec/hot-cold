// ================= МАГАЗИН =================
// Монеты 🪙 и кристаллы 💎 копит база (миграции 061 и 062): за звёзды
// Приключения, партии с другом, Испытание и «Испытание выходных».
// Купленное ложится к наградам пути (cosmetics). Иконки, рамки, фоны и
// титулы надеваются в профиле; питомцы, вещи для них, градусники и эффекты
// победы (миграция 063) — здесь же и на экране питомца.
// Без входа витрину видно, а купить нельзя; без миграции — «скоро откроется».

// Товары — копия из базы (shop_catalog, миграция 064), сверяется тестом.
// Цена — либо в монетах, либо в кристаллах; редкость: common, rare, epic, legend.
// Облик (skin) — <питомец>_<облик>; вещь одного питомца (PET_GEAR[code].pet)
// и облик продаются только тому, у кого этот питомец есть
const SHOP_ITEMS = [
  // Иконки «Стихии»
  { kind: 'icon', code: 'shop-01', coins: 90, rar: 'common' }, { kind: 'icon', code: 'shop-02', coins: 100, rar: 'common' },
  { kind: 'icon', code: 'shop-03', coins: 110, rar: 'common' }, { kind: 'icon', code: 'shop-04', coins: 120, rar: 'common' },
  { kind: 'icon', code: 'shop-05', coins: 160, rar: 'rare' }, { kind: 'icon', code: 'shop-06', coins: 170, rar: 'rare' },
  { kind: 'icon', code: 'shop-07', coins: 180, rar: 'rare' }, { kind: 'icon', code: 'shop-08', coins: 200, rar: 'rare' },
  { kind: 'icon', code: 'shop-09', coins: 220, rar: 'rare' }, { kind: 'icon', code: 'shop-10', coins: 260, rar: 'epic' },
  { kind: 'icon', code: 'shop-11', gems: 12, rar: 'epic' }, { kind: 'icon', code: 'shop-12', gems: 14, rar: 'epic' },
  { kind: 'icon', code: 'shop-13', gems: 14, rar: 'epic' }, { kind: 'icon', code: 'shop-14', gems: 16, rar: 'epic' },
  { kind: 'icon', code: 'shop-15', gems: 16, rar: 'epic' }, { kind: 'icon', code: 'shop-16', gems: 20, rar: 'legend' },
  { kind: 'icon', code: 'shop-17', gems: 22, rar: 'legend' }, { kind: 'icon', code: 'shop-18', gems: 22, rar: 'legend' },
  { kind: 'icon', code: 'shop-19', gems: 24, rar: 'legend' }, { kind: 'icon', code: 'shop-20', gems: 25, rar: 'legend' },
  // Рамки
  { kind: 'frame', code: 'leaf', coins: 100, rar: 'common' }, { kind: 'frame', code: 'ocean', coins: 180, rar: 'rare' },
  { kind: 'frame', code: 'coral', coins: 200, rar: 'rare' }, { kind: 'frame', code: 'ember', coins: 220, rar: 'rare' },
  { kind: 'frame', code: 'night', coins: 300, rar: 'epic' }, { kind: 'frame', code: 'galaxy', gems: 14, rar: 'epic' },
  { kind: 'frame', code: 'aurora', gems: 18, rar: 'legend' }, { kind: 'frame', code: 'prism', gems: 20, rar: 'legend' },
  // Фоны кружка
  { kind: 'color', code: 'grad-mint', coins: 80, rar: 'common' }, { kind: 'color', code: 'grad-peach', coins: 80, rar: 'common' },
  { kind: 'color', code: 'grad-sky', coins: 90, rar: 'common' }, { kind: 'color', code: 'grad-violet', coins: 140, rar: 'rare' },
  { kind: 'color', code: 'grad-sand', coins: 120, rar: 'rare' }, { kind: 'color', code: 'grad-galaxy', gems: 10, rar: 'epic' },
  { kind: 'color', code: 'grad-rainbow', gems: 14, rar: 'legend' }, { kind: 'color', code: 'grad-sun', gems: 12, rar: 'epic' },
  // Титулы
  { kind: 'title', code: 'thinker', coins: 90, rar: 'common' }, { kind: 'title', code: 'explorer', coins: 100, rar: 'common' },
  { kind: 'title', code: 'lucky', coins: 150, rar: 'rare' }, { kind: 'title', code: 'strategist', coins: 180, rar: 'rare' },
  { kind: 'title', code: 'speedy', coins: 160, rar: 'rare' }, { kind: 'title', code: 'calm', coins: 110, rar: 'common' },
  { kind: 'title', code: 'sleuth', coins: 170, rar: 'rare' }, { kind: 'title', code: 'friend', coins: 80, rar: 'common' },
  { kind: 'title', code: 'legend', gems: 15, rar: 'legend' }, { kind: 'title', code: 'genius', gems: 12, rar: 'epic' },
  // Фразы для чата в партии
  { kind: 'phrase', code: 'bingo', coins: 60, rar: 'common' }, { kind: 'phrase', code: 'respect', coins: 70, rar: 'common' },
  { kind: 'phrase', code: 'brain', coins: 80, rar: 'common' }, { kind: 'phrase', code: 'whatluck', coins: 120, rar: 'rare' },
  { kind: 'phrase', code: 'thanks', coins: 60, rar: 'common' }, { kind: 'phrase', code: 'math', coins: 100, rar: 'rare' },
  { kind: 'phrase', code: 'comeback', coins: 140, rar: 'rare' }, { kind: 'phrase', code: 'bravo', coins: 70, rar: 'common' },
  // Питомцы: все шесть покупаются
  { kind: 'pet', code: 'badger', coins: 450, rar: 'epic' }, { kind: 'pet', code: 'owl', coins: 500, rar: 'epic' },
  { kind: 'pet', code: 'toucan', coins: 450, rar: 'epic' }, { kind: 'pet', code: 'cham', coins: 550, rar: 'epic' },
  { kind: 'pet', code: 'crab', coins: 500, rar: 'epic' }, { kind: 'pet', code: 'penguin', coins: 550, rar: 'epic' },
  // Облики питомцев (кристаллы): <питомец>_<облик>; звёздный — не товар, он за 10-й уровень
  { kind: 'skin', code: 'badger_honey', gems: 8, rar: 'rare' }, { kind: 'skin', code: 'badger_midnight', gems: 12, rar: 'epic' },
  { kind: 'skin', code: 'badger_snow', gems: 8, rar: 'rare' }, { kind: 'skin', code: 'badger_autumn', gems: 10, rar: 'rare' },
  { kind: 'skin', code: 'badger_mint', gems: 10, rar: 'rare' }, { kind: 'skin', code: 'owl_snowy', gems: 8, rar: 'rare' },
  { kind: 'skin', code: 'owl_night', gems: 12, rar: 'epic' }, { kind: 'skin', code: 'owl_ruby', gems: 10, rar: 'rare' },
  { kind: 'skin', code: 'owl_ash', gems: 8, rar: 'rare' }, { kind: 'skin', code: 'owl_moon', gems: 12, rar: 'epic' },
  { kind: 'skin', code: 'toucan_sunset', gems: 10, rar: 'rare' }, { kind: 'skin', code: 'toucan_lime', gems: 8, rar: 'rare' },
  { kind: 'skin', code: 'toucan_arctic', gems: 10, rar: 'rare' }, { kind: 'skin', code: 'toucan_neon', gems: 12, rar: 'epic' },
  { kind: 'skin', code: 'toucan_cherry', gems: 8, rar: 'rare' }, { kind: 'skin', code: 'cham_lava', gems: 12, rar: 'epic' },
  { kind: 'skin', code: 'cham_ocean', gems: 10, rar: 'rare' }, { kind: 'skin', code: 'cham_lemon', gems: 8, rar: 'rare' },
  { kind: 'skin', code: 'cham_berry', gems: 10, rar: 'rare' }, { kind: 'skin', code: 'cham_midnight', gems: 12, rar: 'epic' },
  { kind: 'skin', code: 'crab_blue', gems: 8, rar: 'rare' }, { kind: 'skin', code: 'crab_sand', gems: 8, rar: 'rare' },
  { kind: 'skin', code: 'crab_neon', gems: 12, rar: 'epic' }, { kind: 'skin', code: 'crab_sunny', gems: 10, rar: 'rare' },
  { kind: 'skin', code: 'crab_deep', gems: 12, rar: 'epic' }, { kind: 'skin', code: 'penguin_emperor', gems: 12, rar: 'epic' },
  { kind: 'skin', code: 'penguin_night', gems: 10, rar: 'rare' }, { kind: 'skin', code: 'penguin_snowy', gems: 8, rar: 'rare' },
  { kind: 'skin', code: 'penguin_rose', gems: 10, rar: 'rare' }, { kind: 'skin', code: 'penguin_sunny', gems: 8, rar: 'rare' },
  // Вещи: корона — всем, остальные — одному питомцу
  { kind: 'gear', code: 'crown', coins: 450, rar: 'epic' }, { kind: 'gear', code: 'mortar', coins: 250, rar: 'rare' },
  { kind: 'gear', code: 'starglasses', coins: 200, rar: 'rare' }, { kind: 'gear', code: 'tophat', coins: 250, rar: 'rare' },
  { kind: 'gear', code: 'argyle', coins: 150, rar: 'common' }, { kind: 'gear', code: 'lei', coins: 150, rar: 'common' },
  { kind: 'gear', code: 'sunglasses', coins: 200, rar: 'rare' }, { kind: 'gear', code: 'cap', coins: 150, rar: 'common' },
  { kind: 'gear', code: 'safari', coins: 250, rar: 'rare' }, { kind: 'gear', code: 'lifebuoy', coins: 250, rar: 'rare' },
  { kind: 'gear', code: 'striped', coins: 150, rar: 'common' }, { kind: 'gear', code: 'jacket', coins: 300, rar: 'rare' },
  { kind: 'gear', code: 'binoculars', coins: 200, rar: 'rare' },
  // Ауры: четыре общие (стихии и звёзды) и по две своих у каждого
  { kind: 'gear', code: 'aura_fire', coins: 700, rar: 'epic' }, { kind: 'gear', code: 'aura_ice', coins: 700, rar: 'epic' },
  { kind: 'gear', code: 'aura_storm', coins: 700, rar: 'epic' }, { kind: 'gear', code: 'aura_star', coins: 900, rar: 'legend' },
  { kind: 'gear', code: 'aura_leaves', coins: 500, rar: 'epic' }, { kind: 'gear', code: 'aura_fireflies', coins: 500, rar: 'epic' },
  { kind: 'gear', code: 'aura_moon', coins: 500, rar: 'epic' }, { kind: 'gear', code: 'aura_feathers', coins: 500, rar: 'epic' },
  { kind: 'gear', code: 'aura_tropics', coins: 500, rar: 'epic' }, { kind: 'gear', code: 'aura_fruit', coins: 500, rar: 'epic' },
  { kind: 'gear', code: 'aura_rainbow', coins: 500, rar: 'epic' }, { kind: 'gear', code: 'aura_butterflies', coins: 500, rar: 'epic' },
  { kind: 'gear', code: 'aura_bubbles', coins: 500, rar: 'epic' }, { kind: 'gear', code: 'aura_seabed', coins: 500, rar: 'epic' },
  { kind: 'gear', code: 'aura_snow', coins: 500, rar: 'epic' }, { kind: 'gear', code: 'aura_fish', coins: 500, rar: 'epic' },
  // Облики градусника
  { kind: 'thermo', code: 'ice', coins: 200, rar: 'rare' }, { kind: 'thermo', code: 'lava', coins: 200, rar: 'rare' },
  { kind: 'thermo', code: 'neon', coins: 350, rar: 'epic' }, { kind: 'thermo', code: 'space', gems: 15, rar: 'legend' },
  // Эффекты победы
  { kind: 'winfx', code: 'confetti', coins: 120, rar: 'common' }, { kind: 'winfx', code: 'fireworks', coins: 240, rar: 'rare' },
  { kind: 'winfx', code: 'lightning', coins: 400, rar: 'epic' }, { kind: 'winfx', code: 'meteors', gems: 18, rar: 'legend' }
];
// Наборы — копия из базы (shop_bundles): питомец и две его вещи, за монеты.
// Цена — за то, чего у игрока ещё нет, со скидкой набора
const SHOP_BUNDLES = [
  { code: 'set_badger', currency: 'coins', pct: 20, items: ['pet:badger', 'gear:mortar', 'gear:starglasses'] },
  { code: 'set_owl', currency: 'coins', pct: 20, items: ['pet:owl', 'gear:tophat', 'gear:argyle'] },
  { code: 'set_toucan', currency: 'coins', pct: 20, items: ['pet:toucan', 'gear:lei', 'gear:sunglasses'] },
  { code: 'set_cham', currency: 'coins', pct: 20, items: ['pet:cham', 'gear:cap', 'gear:safari'] },
  { code: 'set_crab', currency: 'coins', pct: 20, items: ['pet:crab', 'gear:lifebuoy', 'gear:striped'] },
  { code: 'set_penguin', currency: 'coins', pct: 20, items: ['pet:penguin', 'gear:jacket', 'gear:binoculars'] }
];
// Разделы витрины по порядку. Первый — «Витрина»: товары дня и наборы
const SHOP_KINDS = ['deals', 'pet', 'skin', 'gear', 'icon', 'frame', 'color', 'title', 'phrase', 'thermo', 'winfx'];
const SHOP_RARS = ['common', 'rare', 'epic', 'legend'];

let shopWallet = null;   // { coins, gems, today, cap } — как сказала база
let shopKind = 'deals';  // открытый раздел
let shopOpenItem = null; // { kind, code } или { bundle } в карточке товара
let shopState = 'ok';    // 'ok' | 'guest' | 'off' (нет сети или миграции)

function shopCodes(kind) {
  return SHOP_ITEMS.filter(i => i.kind === kind).map(i => i.code);
}
function shopItem(kind, code) {
  return SHOP_ITEMS.find(i => i.kind === kind && i.code === code) || null;
}
function isShopItem(kind, code) { return !!shopItem(kind, code); }
// Своё из магазина: купленное лежит в тех же наградах, что и с пути
function shopOwned(kind, code) {
  return typeof passOwns === 'function' && passOwns(kind, code);
}
// Купленные коды раздела — для выбора в профиле и для чата
function shopOwnedCodes(kind) {
  return shopCodes(kind).filter(c => shopOwned(kind, c));
}
// Цена словами: «150 🪙», «15 💎». Со скидкой дня — уже со скидкой
function shopPriceText(it) {
  const p = shopPrice(it);
  return p.gems ? p.gems + ' 💎' : p.coins + ' 🪙';
}
// Товары дня (миграция 063): у каждого свои три вещи со скидкой
function shopDeals() {
  return petLookDeals().filter(d => isShopItem(d.kind, d.code));
}
function petLookDeals() {
  return typeof petLook !== 'undefined' && petLook && Array.isArray(petLook.deals) ? petLook.deals : [];
}
function shopDealOf(it) {
  return shopDeals().find(d => d.kind === it.kind && d.code === it.code) || null;
}
// Цена для игрока — как считает база: скидка дня, округление до целых
function shopPrice(it) {
  const d = shopDealOf(it), pct = d ? d.pct : 0;
  const cut = v => v ? Math.max(1, Math.round(v * (100 - pct) / 100)) : 0;
  return { coins: cut(it.coins || 0), gems: cut(it.gems || 0), pct };
}
function shopFullPriceText(it) { return it.gems ? it.gems + ' 💎' : it.coins + ' 🪙'; }
// Наборы: цена за недостающее со скидкой набора. Монеты — до десятков
function shopBundle(code) { return SHOP_BUNDLES.find(b => b.code === code) || null; }
function shopBundleItems(b) {
  return b.items.map(x => { const [kind, code] = x.split(':'); return shopItem(kind, code); }).filter(Boolean);
}
function shopBundlePrice(b) {
  if (typeof petLook !== 'undefined' && petLook && petLook.bundles && typeof petLook.bundles[b.code] === 'number') return petLook.bundles[b.code];
  const sum = shopBundleItems(b).filter(i => !shopOwned(i.kind, i.code)).reduce((a, i) => a + (b.currency === 'coins' ? i.coins || 0 : i.gems || 0), 0);
  return b.currency === 'coins' ? Math.round(sum * (100 - b.pct) / 1000) * 10 : Math.round(sum * (100 - b.pct) / 100);
}
function shopBundleFull(b) {
  return shopBundleItems(b).reduce((a, i) => a + (b.currency === 'coins' ? i.coins || 0 : i.gems || 0), 0);
}
function shopBundleOwned(b) { return shopBundleItems(b).every(i => shopOwned(i.kind, i.code)); }
function shopBundlePet(b) { const x = b.items.find(i => i.startsWith('pet:')); return x ? x.slice(4) : null; }
function shopMoney(n, currency) { return n + (currency === 'gems' ? ' 💎' : ' 🪙'); }
// Через сколько сменятся товары дня: «5 ч 12 мин»
function shopDealsLeftText() {
  if (typeof petLook === 'undefined' || !petLook || typeof petLook.dealsLeft !== 'number') return '';
  const left = Math.max(0, petLook.dealsLeft - Math.round((Date.now() - petLookAt) / 1000));
  const h = Math.floor(left / 3600), m = Math.floor(left % 3600 / 60);
  const S = t().shop;
  return S.dealsLeft.replace('{t}', h ? S.hm.replace('{h}', h).replace('{m}', m) : S.mins.replace('{m}', Math.max(1, m)));
}

// ---------- кошелёк ----------
async function loadWallet() {
  if (!runAuth() || typeof sb === 'undefined' || !sb) { shopWallet = null; renderShopWallet(); return null; }
  try {
    const w = await friendRpc('my_wallet', {});
    shopWallet = w && typeof w === 'object' && 'coins' in w ? w : null;
  } catch (e) {
    shopWallet = null;
  }
  renderShopWallet();
  return shopWallet;
}
// После игры: что пришло в кошелёк — короткой всплывашкой «+15 🪙»
async function walletAfterGame() {
  if (!runAuth()) return;
  const before = shopWallet;
  await loadWallet();
  if (!before || !shopWallet) return;
  walletToast(shopWallet.coins - before.coins, shopWallet.gems - before.gems);
}
// Сервер сам сказал, сколько начислил (бой Приключения, Испытание)
function walletGot(coins, gems) {
  coins = Math.max(0, coins || 0);
  gems = Math.max(0, gems || 0);
  if (!coins && !gems) return;
  if (shopWallet) { shopWallet.coins += coins; shopWallet.gems += gems; renderShopWallet(); }
  walletToast(coins, gems);
}
function walletToast(dc, dg) {
  const S = t().shop;
  const parts = [];
  if (dc > 0) parts.push(S.toastCoins.replace('{n}', dc));
  if (dg > 0) parts.push(S.toastGems.replace('{n}', dg));
  if (!parts.length) return;
  let el = document.getElementById('walletToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'walletToast';
    el.className = 'wallet-toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = parts.join('  ');
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(walletToast.timer);
  walletToast.timer = setTimeout(() => el.classList.remove('show'), 2600);
}

function renderShopWallet() {
  const box = document.getElementById('shopWallet');
  if (!box) return;
  const S = t().shop;
  if (!shopWallet) { box.innerHTML = ''; return; }
  box.innerHTML = '<span class="sw-chip" aria-label="' + escapeHtml(S.coinsName) + '">🪙 <b>' + shopWallet.coins + '</b></span>' +
    '<span class="sw-chip gem" aria-label="' + escapeHtml(S.gemsName) + '">💎 <b>' + shopWallet.gems + '</b></span>';
}

// ---------- витрина ----------
async function openShop(kind) {
  const m = document.getElementById('shopModal');
  m.classList.remove('hidden');
  if (kind && SHOP_KINDS.indexOf(kind) >= 0) shopKind = kind;
  shopState = runAuth() ? 'ok' : 'guest';
  renderShop();
  document.getElementById('shopScroll').scrollTop = 0;
  if (shopState !== 'ok') return;
  // Своё (купленное и награды), питомец с товарами дня и кошелёк — свежие
  const [, , w] = await Promise.all([typeof loadOnlineInfo === 'function' ? loadOnlineInfo() : null,
    typeof loadLook === 'function' ? loadLook() : null, loadWallet()]);
  shopState = w ? 'ok' : 'off';
  renderShop();
}
function closeShop() {
  document.getElementById('shopModal').classList.add('hidden');
  closeShopItem();
}

function renderShop() {
  const S = t().shop;
  document.getElementById('shopTitle').textContent = S.title;
  renderShopWallet();
  // Разделы
  const tabs = document.getElementById('shopTabs');
  tabs.replaceChildren(...SHOP_KINDS.map(k => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sh-tab' + (k === shopKind ? ' sel' : '');
    b.textContent = S.tabs[k];
    b.setAttribute('aria-pressed', k === shopKind ? 'true' : 'false');
    b.onclick = () => { shopKind = k; renderShop(); document.getElementById('shopScroll').scrollTop = 0; };
    return b;
  }));
  // Выбранный раздел — на виду в ряду, который прокручивается вбок
  const sel = tabs.querySelector('.sel');
  if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  // Товары раздела; «Витрина» — товары дня и наборы
  const grid = document.getElementById('shopGrid');
  grid.className = 'sh-grid sh-' + shopKind;
  if (shopKind === 'deals') renderShopDeals(grid);
  else if (shopKind === 'skin' || shopKind === 'gear') renderShopByPet(grid, shopKind);
  else grid.replaceChildren(...SHOP_ITEMS.filter(i => i.kind === shopKind).map(shopItemButton));
  // Что сверху: вход, нет сети, или как копить
  const note = document.getElementById('shopNote');
  note.className = 'sh-note' + (shopState === 'ok' ? '' : ' warn');
  if (shopState === 'guest') note.innerHTML = escapeHtml(S.guest) + ' <button class="btn" type="button" onclick="closeShop(); openLogoutModal()">' + escapeHtml(S.login) + '</button>';
  else if (shopState === 'off') note.textContent = S.off;
  else note.textContent = shopWallet ? S.today.replace('{n}', shopWallet.today).replace('{m}', shopWallet.cap) : '';
  document.getElementById('shopEarnHead').textContent = S.earnHead;
  // Задания дня спрятаны (DAILY_EXTRAS) — и строки про них нет
  const earn = DAILY_EXTRAS ? S.earn.slice(0, 5).concat([S.earnQuest], S.earn.slice(5)) : S.earn;
  document.getElementById('shopEarn').innerHTML = earn.map(x => '<div class="sh-earn-row">' + escapeHtml(x) + '</div>').join('');
  document.getElementById('shopTrophy').textContent = S.trophy;
  document.getElementById('shopOk').textContent = S.close;
}

// Вещь или облик чужого питомца: купить нельзя, пока его нет
function shopPetLocked(kind, code) {
  const who = typeof petItemFor === 'function' ? petItemFor(kind, code) : null;
  return !!who && !shopOwned('pet', who);
}
function shopItemButton(it) {
  const S = t().shop;
  const b = document.createElement('button');
  b.type = 'button';
  const own = shopOwned(it.kind, it.code), worn = shopWorn(it.kind, it.code), deal = !own && shopDealOf(it), locked = !own && shopPetLocked(it.kind, it.code);
  b.className = 'sh-item rar-' + it.rar + (it.gems ? ' rare' : '') + (own ? ' own' : '') + (worn ? ' worn' : '') + (deal ? ' deal' : '') + (locked ? ' locked' : '');
  b.dataset.kind = it.kind;
  b.dataset.code = it.code;
  b.innerHTML = (deal ? '<span class="sh-off">−' + deal.pct + '%</span>' : '') +
    '<span class="sh-art">' + shopArtHtml(it.kind, it.code) + '</span>' +
    '<span class="sh-name">' + escapeHtml(shopName(it.kind, it.code)) + '</span>' +
    '<span class="sh-price">' + (worn ? escapeHtml(S.worn) : own ? escapeHtml(S.owned) : (locked ? '🔒 ' : '') +
      (deal ? '<s>' + escapeHtml(shopFullPriceText(it)) + '</s> ' : '') + escapeHtml(shopPriceText(it))) + '</span>';
  b.onclick = () => openShopItem(it.kind, it.code);
  return b;
}
function shopHead(text, sub) {
  const h = document.createElement('div');
  h.className = 'sh-head';
  h.innerHTML = '<b>' + escapeHtml(text) + '</b>' + (sub ? '<span>' + escapeHtml(sub) + '</span>' : '');
  return h;
}
// Облики и вещи — по питомцам: сначала то, что подходит всем (корона, ауры
// стихий), потом у каждого своё. Чужого питомца — с замком
function renderShopByPet(grid, kind) {
  const S = t().shop, parts = [];
  const items = SHOP_ITEMS.filter(i => i.kind === kind);
  const groups = [[null, items.filter(i => !petItemFor(kind, i.code))]].concat(PETS.map(k => [k, items.filter(i => petItemFor(kind, i.code) === k)]));
  groups.forEach(([k, list]) => {
    if (!list.length) return;
    parts.push(shopHead(k ? petName(k) : S.forAll, k && !shopOwned('pet', k) ? S.petLockedShort : ''));
    list.forEach(it => parts.push(shopItemButton(it)));
  });
  grid.replaceChildren(...parts);
}
// Витрина: три товара дня со скидкой и наборы
function renderShopDeals(grid) {
  const S = t().shop;
  const parts = [];
  const head = shopHead;
  // Товары дня знает только база: без входа — «после входа», без ответа
  // базы — ни слова (а не «у вас уже всё есть»)
  const deals = shopDeals(), known = typeof petLook !== 'undefined' && !!petLook;
  if (deals.length || shopState === 'guest' || known) parts.push(head(S.deals, deals.length ? shopDealsLeftText() : ''));
  if (deals.length) deals.forEach(d => parts.push(shopItemButton(shopItem(d.kind, d.code))));
  else if (shopState === 'guest' || known) {
    const n = document.createElement('div');
    n.className = 'sh-empty';
    n.textContent = shopState === 'guest' ? S.dealsGuest : S.dealsNone;
    parts.push(n);
  }
  parts.push(head(S.bundles, S.bundlesSub));
  SHOP_BUNDLES.forEach(bd => {
    const b = document.createElement('button');
    b.type = 'button';
    const owned = shopBundleOwned(bd), price = shopBundlePrice(bd), full = shopBundleFull(bd);
    b.className = 'sh-bundle' + (owned ? ' own' : '') + (bd.currency === 'gems' ? ' rare' : '');
    b.dataset.bundle = bd.code;
    b.innerHTML = '<span class="sb-arts">' + shopBundleItems(bd).map(i => '<span class="sb-art' + (shopOwned(i.kind, i.code) ? ' have' : '') + '">' +
      shopArtHtml(i.kind, i.code, shopBundlePet(bd)) + '</span>').join('') + '</span>' +
      '<span class="sb-text"><b>' + escapeHtml(S.bundleNames[bd.code]) + '</b><span>' + escapeHtml(owned ? S.bundleOwned :
        S.bundleHint.replace('{p}', bd.pct)) + '</span></span>' +
      '<span class="sb-price">' + (owned ? '✓' : (price < full ? '<s>' + escapeHtml(shopMoney(full, bd.currency)) + '</s>' : '') +
        '<b>' + escapeHtml(shopMoney(price, bd.currency)) + '</b>') + '</span>';
    b.onclick = () => openShopBundle(bd.code);
    parts.push(b);
  });
  grid.replaceChildren(...parts);
}

// Надето ли сейчас: иконка, фон, рамка, титул. Фраза не «надевается»
function shopWorn(kind, code) {
  if (kind === 'icon') return typeof myAvatar === 'function' && myAvatar() === code;
  if (kind === 'color') return typeof myColor === 'function' && myColor() === code;
  if (kind === 'frame' || kind === 'title') return !!onlineInfo && onlineInfo[kind] === code;
  // Питомец, вещи на нём, градусник и эффект победы (миграция 063)
  if (typeof petLook === 'undefined' || !petLook) return false;
  if (kind === 'pet') return petLook.pet === code;
  const p = typeof myPet === 'function' ? myPet() : null;
  if (kind === 'gear') return !!p && !!PET_GEAR[code] && petOutfit(p)[PET_GEAR[code].slot] === code;
  if (kind === 'skin') return !!p && petItemFor('skin', code) === p && petOutfit(p).skin === shopSkinOf(code);
  if (kind === 'thermo' || kind === 'winfx') return petLook[kind] === code;
  return false;
}

// Название товара словами
function shopName(kind, code) {
  const S = t().shop, P = t().pass;
  if (kind === 'icon') return S.icons[code] || code;
  if (kind === 'color') return S.colors[code] || code;
  if (kind === 'frame') return P.frames[code] || code;
  if (kind === 'title') return P.titles[code] || code;
  if (kind === 'pet') return t().pets.names[code] || code;
  if (kind === 'skin') return petSkinName(shopSkinOf(code));
  if (kind === 'gear') return S.gear[code] || code;
  if (kind === 'thermo') return S.thermos[code] || code;
  if (kind === 'winfx') return S.winfxs[code] || code;
  return (t().say[code] || code);
}

// Фон своего кружка: выбранный или тот, что считается из имени. Без входа — океан
function shopBg() {
  return runAuth() && typeof colorOf === 'function' ? colorOf(myName()) : 'grad-ocean';
}

// Картинка товара: иконка на своём фоне, рамка вокруг своего кружка, кружок
// цвета, табличка титула, облачко фразы
// Облик из кода товара: badger_honey → honey
function shopSkinOf(code) { return code.slice(code.indexOf('_') + 1); }
// Вещь питомца крупным планом: голова и глаза — голова, шея — грудь, тело и
// аура — целиком. Макушка, глаза и шея у каждого питомца на своей высоте
const PET_VIEW_Y = { badger: { head: 54, eyes: 90, neck: 124 }, owl: { head: 60, eyes: 100, neck: 150 }, toucan: { head: 58, eyes: 94, neck: 124 },
  cham: { head: 56, eyes: 86, neck: 130 }, crab: { head: 98, eyes: 72, neck: 150 }, penguin: { head: 62, eyes: 92, neck: 130 } };
function shopGearView(kind, slot) {
  const y = PET_VIEW_Y[kind] || PET_VIEW_Y.badger;
  if (slot === 'head') return '35 ' + Math.max(0, y.head - 50) + ' 170 170';
  if (slot === 'eyes') return '45 ' + Math.max(0, y.eyes - 60) + ' 150 150';
  if (slot === 'neck') return '30 ' + Math.max(0, y.neck - 74) + ' 180 180';
  return '0 0 240 240';
}
function shopGearArt(code, petFor) {
  const g = PET_GEAR[code];
  const kind = g.pet || petFor || (typeof myPet === 'function' && myPet()) || PETS[0];
  // Крупный план обрезан: что за краем кадра, не вылезает на подписи рядом
  return '<span class="sha-pet sha-crop">' + petSvg(kind, { gear: [code] }).replace('viewBox="0 0 240 240"', 'viewBox="' + shopGearView(kind, g.slot) + '"') + '</span>';
}
function shopArtHtml(kind, code, petFor) {
  const bg = shopBg();
  if (kind === 'icon') {
    const art = iconArt(code, 0);
    return '<span class="sha-face' + (art ? ' has-art' : '') + (isShinyBg(bg) ? ' shine' : '') + '" style="background:' +
      avatarBgCss(bg) + '">' + (art || '🖼️') + '</span>';
  }
  if (kind === 'color') {
    return '<span class="sha-face' + (isShinyBg(code) ? ' shine' : '') + '" style="background:' + avatarBgCss(code) + '"></span>';
  }
  if (kind === 'frame') {
    const me = runAuth() && typeof myAvatar === 'function' ? myAvatar() : '';
    const art = me ? iconArt(me, 0) : '';
    const face = art || escapeHtml(me || (runAuth() ? avatarLetter(myName()) : '🙂'));
    return '<span class="sha-ring" data-frame="' + code + '"><span class="sha-face' + (art ? ' has-art' : '') +
      (isShinyBg(bg) ? ' shine' : '') + '" style="background:' + avatarBgCss(bg) + '">' + face + '</span></span>';
  }
  if (kind === 'title') return '<span class="sha-title">' + escapeHtml(shopName(kind, code)) + '</span>';
  // Питомец — сам (свой — в наряде), облик — на своём питомце, вещь — на том, чья она
  if (kind === 'pet') return '<span class="sha-pet">' + (shopOwned('pet', code) ? myPetSvg(code) : petSvg(code)) + '</span>';
  if (kind === 'skin') return '<span class="sha-pet">' + petSvg(petItemFor('skin', code), { skin: shopSkinOf(code) }) + '</span>';
  if (kind === 'gear') return shopGearArt(code, petFor);
  if (kind === 'thermo') return thermoMiniHtml(code);
  if (kind === 'winfx') return '<span class="sha-fx">' + WINFX[code] + '</span>';
  return '<span class="sha-phrase">' + escapeHtml(shopName(kind, code)) + '</span>';
}

// ---------- карточка товара ----------
function openShopItem(kind, code) {
  shopOpenItem = { kind, code };
  renderShopItem();
  document.getElementById('shopItemModal').classList.remove('hidden');
}
function openShopBundle(code) {
  shopOpenItem = { bundle: code };
  renderShopItem();
  document.getElementById('shopItemModal').classList.remove('hidden');
}
function closeShopItem() {
  const m = document.getElementById('shopItemModal');
  if (m) m.classList.add('hidden');
  shopOpenItem = null;
}
// Что вещь даёт и где видна: питомец — характер, вещь — на какое место, и т. п.
function shopItemAbout(kind, code) {
  const S = t().shop;
  if (kind === 'phrase') return S.phraseHint;
  if (kind === 'pet') return petHeroText(code) + ' ' + t().pets.who[code];
  if (kind === 'gear') {
    const who = petItemFor('gear', code);
    return S.gearHint.replace('{slot}', S.slots[PET_GEAR[code].slot]) + ' ' + (who ? S.gearFor.replace('{pet}', petName(who)) : S.gearAll);
  }
  if (kind === 'skin') return S.skinHint.replace('{pet}', petName(petItemFor('skin', code)));
  if (kind === 'thermo') return S.thermoHint;
  if (kind === 'winfx') return S.winfxHint;
  return '';
}
function renderShopItem() {
  if (!shopOpenItem) return;
  if (shopOpenItem.bundle) { renderShopBundle(); return; }
  const S = t().shop, P = t().pass;
  const { kind, code } = shopOpenItem;
  const it = shopItem(kind, code);
  const own = shopOwned(kind, code), worn = shopWorn(kind, code), deal = !own && shopDealOf(it);
  const card = document.querySelector('#shopItemModal .shop-item-card');
  card.className = 'modal-card shop-item-card rar-' + it.rar;
  document.getElementById('siArt').className = 'si-art si-' + kind;
  document.getElementById('siArt').innerHTML = shopArtHtml(kind, code);
  // Питомца можно потрогать: сделает сальто
  document.getElementById('siArt').onclick = () => { if (typeof petReact === 'function') petReact(document.getElementById('siArt'), 'flip'); };
  document.getElementById('siKind').innerHTML = escapeHtml(P.kinds[kind] || S.kindNames[kind]) + ' · <span class="si-rar">' + escapeHtml(S.rarity[it.rar]) + '</span>';
  document.getElementById('siName').textContent = shopName(kind, code);
  const price = document.getElementById('siPrice');
  price.innerHTML = own ? escapeHtml(worn ? S.worn : S.owned) :
    (deal ? '<s>' + escapeHtml(shopFullPriceText(it)) + '</s> ' : '') + escapeHtml(shopPriceText(it)) + (deal ? ' <span class="si-off">−' + deal.pct + '%</span>' : '');
  price.className = 'si-price' + (it.gems && !own ? ' gem' : '');
  const btn = document.getElementById('siBuy');
  const note = document.getElementById('siNote');
  note.className = 'si-note';
  note.textContent = shopItemAbout(kind, code);
  // Эффект победы — посмотреть прямо здесь
  const prev = document.getElementById('siPreview');
  prev.classList.toggle('hidden', kind !== 'winfx');
  prev.textContent = S.preview;
  prev.onclick = () => playWinFx(code, false);
  btn.disabled = false;
  btn.classList.remove('hidden');
  if (own) {
    if (kind === 'phrase') btn.classList.add('hidden');
    // Вещь питомца, облик, градусник и эффект победы снимаются той же кнопкой
    const canOff = kind === 'gear' || kind === 'skin' || kind === 'thermo' || kind === 'winfx';
    btn.textContent = worn ? (canOff ? S.unwear : kind === 'pet' ? t().pets.withYou : S.wornBtn) : kind === 'pet' ? t().pets.takeWith : S.wear;
    btn.disabled = worn && !canOff;
    btn.onclick = () => shopWear(kind, code, worn);
    if ((kind === 'gear' || kind === 'skin') && !(typeof myPet === 'function' && myPet())) {
      btn.disabled = true;
      note.textContent = S.gearNoPet;
    }
  } else if (shopPetLocked(kind, code)) {
    // Вещь или облик питомца, которого ещё нет: сначала он
    btn.textContent = S.buyFor.replace('{p}', shopPriceText(it));
    btn.disabled = true;
    note.className = 'si-note warn';
    note.textContent = S.petFirst.replace('{pet}', petName(petItemFor(kind, code)));
  } else if (shopState !== 'ok' || !shopWallet) {
    btn.textContent = shopState === 'guest' ? S.login : S.buyFor.replace('{p}', shopPriceText(it));
    btn.disabled = shopState !== 'guest';
    btn.onclick = () => { closeShop(); openLogoutModal(); };
    note.textContent = shopState === 'guest' ? S.guest : S.off;
  } else {
    const p = shopPrice(it);
    const have = it.gems ? shopWallet.gems : shopWallet.coins, need = it.gems ? p.gems : p.coins;
    btn.textContent = S.buyFor.replace('{p}', shopPriceText(it));
    if (have < need) {
      btn.disabled = true;
      note.className = 'si-note warn';
      // Сколько не хватает и за что дают: кристаллы — не за любую игру
      note.innerHTML = escapeHtml(S.notEnough.replace('{p}', (need - have) + (it.gems ? ' 💎' : ' 🪙'))) +
        '<span class="si-how">' + escapeHtml(it.gems ? S.gemsHow : DAILY_EXTRAS ? S.coinsHow : S.coinsHowNoQuests) + '</span>';
    }
    btn.onclick = () => shopBuy(kind, code);
  }
  document.getElementById('siBack').textContent = S.back;
}
// Карточка набора: три вещи, что уже есть — отмечено, цена за недостающее
function renderShopBundle() {
  const S = t().shop;
  const bd = shopBundle(shopOpenItem.bundle);
  const items = shopBundleItems(bd), owned = shopBundleOwned(bd), price = shopBundlePrice(bd), full = shopBundleFull(bd);
  const card = document.querySelector('#shopItemModal .shop-item-card');
  card.className = 'modal-card shop-item-card rar-' + (bd.currency === 'gems' ? 'legend' : 'epic');
  const art = document.getElementById('siArt');
  art.className = 'si-art si-bundle';
  art.innerHTML = items.map(i => '<span class="sb-art' + (shopOwned(i.kind, i.code) ? ' have' : '') + '">' + shopArtHtml(i.kind, i.code, shopBundlePet(bd)) + '</span>').join('');
  art.onclick = null;
  document.getElementById('siKind').innerHTML = escapeHtml(S.bundle) + ' · <span class="si-rar">−' + bd.pct + '%</span>';
  document.getElementById('siName').textContent = S.bundleNames[bd.code];
  const pr = document.getElementById('siPrice');
  pr.innerHTML = owned ? escapeHtml(S.bundleOwned) : (price < full ? '<s>' + escapeHtml(shopMoney(full, bd.currency)) + '</s> ' : '') + escapeHtml(shopMoney(price, bd.currency));
  pr.className = 'si-price' + (bd.currency === 'gems' && !owned ? ' gem' : '');
  const note = document.getElementById('siNote');
  note.className = 'si-note';
  note.innerHTML = items.map(i => '<span class="si-line">' + (shopOwned(i.kind, i.code) ? '✓ ' : '• ') + escapeHtml(shopName(i.kind, i.code)) +
    ' <small>' + escapeHtml(shopOwned(i.kind, i.code) ? S.owned : shopFullPriceText(i)) + '</small></span>').join('') +
    (owned ? '' : '<span class="si-how">' + escapeHtml(S.bundleHint.replace('{p}', bd.pct)) + '</span>');
  document.getElementById('siPreview').classList.add('hidden');
  const btn = document.getElementById('siBuy');
  btn.classList.remove('hidden');
  btn.disabled = owned;
  if (owned) btn.textContent = S.bundleOwned;
  else if (shopState !== 'ok' || !shopWallet) {
    btn.textContent = shopState === 'guest' ? S.login : S.buyBundle.replace('{p}', shopMoney(price, bd.currency));
    btn.disabled = shopState !== 'guest';
    btn.onclick = () => { closeShop(); openLogoutModal(); };
  } else {
    btn.textContent = S.buyBundle.replace('{p}', shopMoney(price, bd.currency));
    const have = bd.currency === 'gems' ? shopWallet.gems : shopWallet.coins;
    if (have < price) {
      btn.disabled = true;
      note.innerHTML += '<span class="si-how warn">' + escapeHtml(S.notEnough.replace('{p}', shopMoney(price - have, bd.currency))) + '</span>';
    }
    btn.onclick = () => shopBuyBundle(bd.code);
  }
  document.getElementById('siBack').textContent = S.back;
}

function shopBuyError(e) {
  const S = t().shop;
  const who = shopOpenItem && shopOpenItem.kind && typeof petItemFor === 'function' ? petItemFor(shopOpenItem.kind, shopOpenItem.code) : null;
  const m = /not_enough/.test(e.message) ? S.notEnoughShort : /already_owned/.test(e.message) ? S.owned :
    /pet_locked/.test(e.message) && who ? S.petFirst.replace('{pet}', petName(who)) : friendErrorText(e.message);
  const note = document.getElementById('siNote');
  note.className = 'si-note warn';
  note.textContent = m;
}
// Купленное — сразу своё, не дожидаясь my_online; питомец, цены наборов и
// товары дня — свежие из базы
function shopGotItems(list) {
  if (onlineInfo) onlineInfo.owned = (onlineInfo.owned || []).concat(list.map(x => ({ kind: x[0], code: x[1] })));
}
async function shopAfterBuy() {
  if (typeof loadLook === 'function') await loadLook();
  renderShop();
  renderShopItem();
  const note = document.getElementById('siNote');
  note.className = 'si-note good';
  note.textContent = t().shop.bought;
  if (typeof confettiBurst === 'function') confettiBurst();
  else if (typeof celebrate === 'function') celebrate('buy:' + Date.now(), ['✨', '⭐', '🎉'], false);
}
async function shopBuy(kind, code) {
  const btn = document.getElementById('siBuy');
  btn.disabled = true;
  let r;
  try {
    r = await friendRpc('shop_buy', { p_kind: kind, p_code: code });
  } catch (e) {
    btn.disabled = false;
    shopBuyError(e);
    return;
  }
  if (r && typeof r.coins === 'number' && shopWallet) { shopWallet.coins = r.coins; shopWallet.gems = r.gems; }
  shopGotItems([[kind, code]]);
  await shopAfterBuy();
}
async function shopBuyBundle(code) {
  const btn = document.getElementById('siBuy');
  btn.disabled = true;
  let r;
  try {
    r = await friendRpc('shop_buy_bundle', { p_code: code });
  } catch (e) {
    btn.disabled = false;
    shopBuyError(e);
    return;
  }
  if (r && typeof r.coins === 'number' && shopWallet) { shopWallet.coins = r.coins; shopWallet.gems = r.gems; }
  shopGotItems(shopBundle(code).items.map(x => x.split(':')));
  await shopAfterBuy();
}

// Надеть купленное: иконка, фон, рамка, титул — тем же путём, что и награды в
// профиле; питомец, его вещи и облики, градусник и эффект победы — своими
// запросами. Вещь или облик другого своего питомца сначала зовёт его.
// Надетые вещь, облик, градусник и эффект той же кнопкой снимаются
async function shopWear(kind, code, off) {
  try {
    if (kind === 'icon') await chooseAvatar(code);
    else if (kind === 'color') await chooseColor(code);
    else if (kind === 'frame' || kind === 'title') await chooseStyle(kind, code);
    else if (kind === 'pet') await petChoose(code);
    else if (kind === 'gear' || kind === 'skin') {
      const who = petItemFor(kind, code);
      if (who && who !== myPet()) await petChoose(who);
      if (kind === 'gear') await petWearGear(PET_GEAR[code].slot, off ? null : code);
      else await petWearGear('skin', off ? null : shopSkinOf(code));
    }
    else if (kind === 'thermo' || kind === 'winfx') {
      const v = off ? null : code;
      await friendRpc(kind === 'thermo' ? 'set_thermo' : 'set_winfx', { p_code: v });
      if (petLook) petLook[kind] = v;
      if (kind === 'thermo') applyThermoSkin();
      else if (v) playWinFx(v, false);
    }
  } catch (e) {
    shopBuyError(e);
    return;
  }
  renderShop();
  renderShopItem();
}
