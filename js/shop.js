// ================= МАГАЗИН =================
// Монеты 🪙 и кристаллы 💎 копит база (миграция 061): за звёзды Приключения,
// партии онлайн, Испытание, задания дня и турнир выходных. Купленное ложится
// к наградам пути (cosmetics) и надевается там же — в профиле.
// Без входа витрину видно, а купить нельзя; без миграции — «скоро откроется».

// Товары — копия из базы (shop_items), сверяется тестом. Цена — либо в
// монетах, либо в кристаллах
const SHOP_ITEMS = [
  { kind: 'icon', code: 'shop-01', coins: 150 }, { kind: 'icon', code: 'shop-02', coins: 150 },
  { kind: 'icon', code: 'shop-03', coins: 150 }, { kind: 'icon', code: 'shop-04', coins: 150 },
  { kind: 'icon', code: 'shop-05', coins: 150 }, { kind: 'icon', code: 'shop-06', coins: 150 },
  { kind: 'icon', code: 'shop-07', coins: 150 }, { kind: 'icon', code: 'shop-08', coins: 150 },
  { kind: 'icon', code: 'shop-09', coins: 150 }, { kind: 'icon', code: 'shop-10', coins: 150 },
  { kind: 'icon', code: 'shop-11', gems: 15 }, { kind: 'icon', code: 'shop-12', gems: 15 },
  { kind: 'icon', code: 'shop-13', gems: 15 }, { kind: 'icon', code: 'shop-14', gems: 15 },
  { kind: 'icon', code: 'shop-15', gems: 15 }, { kind: 'icon', code: 'shop-16', gems: 15 },
  { kind: 'icon', code: 'shop-17', gems: 15 }, { kind: 'icon', code: 'shop-18', gems: 15 },
  { kind: 'icon', code: 'shop-19', gems: 15 }, { kind: 'icon', code: 'shop-20', gems: 15 },
  { kind: 'frame', code: 'leaf', coins: 150 }, { kind: 'frame', code: 'ocean', coins: 150 },
  { kind: 'frame', code: 'coral', coins: 150 }, { kind: 'frame', code: 'ember', coins: 150 },
  { kind: 'frame', code: 'night', coins: 150 }, { kind: 'frame', code: 'galaxy', gems: 12 },
  { kind: 'frame', code: 'aurora', gems: 12 }, { kind: 'frame', code: 'prism', gems: 12 },
  { kind: 'color', code: 'grad-mint', coins: 100 }, { kind: 'color', code: 'grad-peach', coins: 100 },
  { kind: 'color', code: 'grad-sky', coins: 100 }, { kind: 'color', code: 'grad-violet', coins: 100 },
  { kind: 'color', code: 'grad-sand', coins: 100 }, { kind: 'color', code: 'grad-galaxy', gems: 10 },
  { kind: 'color', code: 'grad-rainbow', gems: 10 }, { kind: 'color', code: 'grad-gold', gems: 10 },
  { kind: 'title', code: 'thinker', coins: 150 }, { kind: 'title', code: 'explorer', coins: 150 },
  { kind: 'title', code: 'lucky', coins: 150 }, { kind: 'title', code: 'strategist', coins: 150 },
  { kind: 'title', code: 'speedy', coins: 150 }, { kind: 'title', code: 'calm', coins: 150 },
  { kind: 'title', code: 'sleuth', coins: 150 }, { kind: 'title', code: 'friend', coins: 150 },
  { kind: 'title', code: 'legend', gems: 10 }, { kind: 'title', code: 'genius', gems: 10 },
  { kind: 'phrase', code: 'bingo', coins: 100 }, { kind: 'phrase', code: 'respect', coins: 100 },
  { kind: 'phrase', code: 'brain', coins: 100 }, { kind: 'phrase', code: 'whatluck', coins: 100 },
  { kind: 'phrase', code: 'thanks', coins: 100 }, { kind: 'phrase', code: 'math', coins: 100 },
  { kind: 'phrase', code: 'comeback', coins: 100 }, { kind: 'phrase', code: 'bravo', coins: 100 }
];
// Разделы витрины по порядку
const SHOP_KINDS = ['icon', 'frame', 'color', 'title', 'phrase'];

let shopWallet = null;   // { coins, gems, today, cap } — как сказала база
let shopKind = 'icon';   // открытый раздел
let shopOpenItem = null; // { kind, code } в карточке товара
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
// Цена словами: «150 🪙», «15 💎»
function shopPriceText(it) {
  return it.gems ? it.gems + ' 💎' : it.coins + ' 🪙';
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
async function openShop() {
  const m = document.getElementById('shopModal');
  m.classList.remove('hidden');
  shopState = runAuth() ? 'ok' : 'guest';
  renderShop();
  if (shopState !== 'ok') return;
  // Своё (купленное и награды) и кошелёк — свежие
  const [, w] = await Promise.all([typeof loadOnlineInfo === 'function' ? loadOnlineInfo() : null, loadWallet()]);
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
    b.onclick = () => { shopKind = k; renderShop(); };
    return b;
  }));
  // Товары раздела
  const grid = document.getElementById('shopGrid');
  grid.className = 'sh-grid sh-' + shopKind;
  grid.replaceChildren(...SHOP_ITEMS.filter(i => i.kind === shopKind).map(it => {
    const b = document.createElement('button');
    b.type = 'button';
    const own = shopOwned(it.kind, it.code), worn = shopWorn(it.kind, it.code);
    b.className = 'sh-item' + (it.gems ? ' rare' : '') + (own ? ' own' : '') + (worn ? ' worn' : '');
    b.dataset.kind = it.kind;
    b.dataset.code = it.code;
    b.innerHTML = '<span class="sh-art">' + shopArtHtml(it.kind, it.code) + '</span>' +
      '<span class="sh-name">' + escapeHtml(shopName(it.kind, it.code)) + '</span>' +
      '<span class="sh-price">' + escapeHtml(worn ? S.worn : own ? S.owned : shopPriceText(it)) + '</span>';
    b.onclick = () => openShopItem(it.kind, it.code);
    return b;
  }));
  // Что сверху: вход, нет сети, или как копить
  const note = document.getElementById('shopNote');
  note.className = 'sh-note' + (shopState === 'ok' ? '' : ' warn');
  if (shopState === 'guest') note.innerHTML = escapeHtml(S.guest) + ' <button class="btn btn-small" type="button" onclick="closeShop(); openLogoutModal()">' + escapeHtml(S.login) + '</button>';
  else if (shopState === 'off') note.textContent = S.off;
  else note.textContent = shopWallet ? S.today.replace('{n}', shopWallet.today).replace('{m}', shopWallet.cap) : '';
  document.getElementById('shopEarnHead').textContent = S.earnHead;
  document.getElementById('shopEarn').innerHTML = S.earn.map(x => '<div class="sh-earn-row">' + escapeHtml(x) + '</div>').join('');
  document.getElementById('shopTrophy').textContent = S.trophy;
  document.getElementById('shopOk').textContent = t().pass.ok;
}

// Надето ли сейчас: иконка, фон, рамка, титул. Фраза не «надевается»
function shopWorn(kind, code) {
  if (kind === 'icon') return typeof myAvatar === 'function' && myAvatar() === code;
  if (kind === 'color') return typeof myColor === 'function' && myColor() === code;
  if (kind === 'frame' || kind === 'title') return !!onlineInfo && onlineInfo[kind] === code;
  return false;
}

// Название товара словами
function shopName(kind, code) {
  const S = t().shop, P = t().pass;
  if (kind === 'icon') return S.icons[code] || code;
  if (kind === 'color') return S.colors[code] || code;
  if (kind === 'frame') return P.frames[code] || code;
  if (kind === 'title') return P.titles[code] || code;
  return (t().say[code] || code);
}

// Картинка товара: иконка на своём фоне, рамка вокруг своего кружка, кружок
// цвета, табличка титула, облачко фразы
function shopArtHtml(kind, code) {
  const bg = typeof myColor === 'function' ? myColor() : '';
  if (kind === 'icon') {
    const art = iconArt(code, 0);
    return '<span class="sha-face' + (art ? ' has-art' : '') + '" style="background:' + avatarBgCss(bg) + '">' + (art || '🖼️') + '</span>';
  }
  if (kind === 'color') {
    return '<span class="sha-face' + (isShinyBg(code) ? ' shine' : '') + '" style="background:' + avatarBgCss(code) + '"></span>';
  }
  if (kind === 'frame') {
    const me = runAuth() && typeof myAvatar === 'function' ? myAvatar() : '';
    const art = me ? iconArt(me, 0) : '';
    return '<span class="sha-ring" data-frame="' + code + '"><span class="sha-face' + (art ? ' has-art' : '') +
      '" style="background:' + avatarBgCss(bg) + '">' + (art || escapeHtml(me || '🙂')) + '</span></span>';
  }
  if (kind === 'title') return '<span class="sha-title">' + escapeHtml(shopName(kind, code)) + '</span>';
  return '<span class="sha-phrase">' + escapeHtml(shopName(kind, code)) + '</span>';
}

// ---------- карточка товара ----------
function openShopItem(kind, code) {
  shopOpenItem = { kind, code };
  renderShopItem();
  document.getElementById('shopItemModal').classList.remove('hidden');
}
function closeShopItem() {
  const m = document.getElementById('shopItemModal');
  if (m) m.classList.add('hidden');
  shopOpenItem = null;
}
function renderShopItem() {
  if (!shopOpenItem) return;
  const S = t().shop, P = t().pass;
  const { kind, code } = shopOpenItem;
  const it = shopItem(kind, code);
  const own = shopOwned(kind, code), worn = shopWorn(kind, code);
  document.getElementById('siArt').className = 'si-art si-' + kind;
  document.getElementById('siArt').innerHTML = shopArtHtml(kind, code);
  document.getElementById('siKind').textContent = P.kinds[kind] + (it.gems ? ' · ' + S.rare : '');
  document.getElementById('siName').textContent = shopName(kind, code);
  document.getElementById('siPrice').textContent = own ? (worn ? S.worn : S.owned) : shopPriceText(it);
  const btn = document.getElementById('siBuy');
  const note = document.getElementById('siNote');
  note.className = 'si-note';
  note.textContent = kind === 'phrase' ? S.phraseHint : '';
  btn.disabled = false;
  btn.classList.remove('hidden');
  if (own) {
    if (kind === 'phrase') btn.classList.add('hidden');
    btn.textContent = worn ? S.wornBtn : S.wear;
    btn.disabled = worn;
    btn.onclick = () => shopWear(kind, code);
  } else if (shopState !== 'ok' || !shopWallet) {
    btn.textContent = shopState === 'guest' ? S.login : S.buyFor.replace('{p}', shopPriceText(it));
    btn.disabled = shopState !== 'guest';
    btn.onclick = () => { closeShop(); openLogoutModal(); };
    note.textContent = shopState === 'guest' ? S.guest : S.off;
  } else {
    const have = it.gems ? shopWallet.gems : shopWallet.coins, need = it.gems || it.coins;
    btn.textContent = S.buyFor.replace('{p}', shopPriceText(it));
    if (have < need) {
      btn.disabled = true;
      note.className = 'si-note warn';
      note.textContent = S.notEnough.replace('{p}', (need - have) + (it.gems ? ' 💎' : ' 🪙'));
    }
    btn.onclick = () => shopBuy(kind, code);
  }
  document.getElementById('siBack').textContent = S.back;
}

async function shopBuy(kind, code) {
  const S = t().shop;
  const btn = document.getElementById('siBuy');
  btn.disabled = true;
  let r;
  try {
    r = await friendRpc('shop_buy', { p_kind: kind, p_code: code });
  } catch (e) {
    btn.disabled = false;
    const m = /not_enough/.test(e.message) ? S.notEnoughShort : /already_owned/.test(e.message) ? S.owned : friendErrorText(e.message);
    const note = document.getElementById('siNote');
    note.className = 'si-note warn';
    note.textContent = m;
    return;
  }
  if (r && typeof r.coins === 'number' && shopWallet) { shopWallet.coins = r.coins; shopWallet.gems = r.gems; }
  // Купленное — сразу своё, не дожидаясь my_online
  if (onlineInfo) {
    onlineInfo.owned = (onlineInfo.owned || []).concat([{ kind, code }]);
  }
  renderShop();
  renderShopItem();
  const note = document.getElementById('siNote');
  note.className = 'si-note good';
  note.textContent = S.bought;
  if (typeof confettiBurst === 'function') confettiBurst();
}

// Надеть купленное — тем же путём, что и награды в профиле
async function shopWear(kind, code) {
  if (kind === 'icon') await chooseAvatar(code);
  else if (kind === 'color') await chooseColor(code);
  else if (kind === 'frame' || kind === 'title') await chooseStyle(kind, code);
  renderShop();
  renderShopItem();
}
