// Service worker: игра открывается и играется без интернета.
// Тренировка и игра с другом работают офлайн полностью, режим на рейтинг
// требует сети (вход и топ), но сама страница загрузится в любом случае.

const CACHE = 'hot-cold-v1';

// Своё, что нужно для запуска
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  // addAll падает целиком, если хоть один файл не отдался, — кладём по одному
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(CORE.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Запросы к Supabase (вход, результаты, топ, настройки) кешировать нельзя:
  // это живые данные, и офлайн они должны честно падать, а не отдавать старое
  if (url.hostname.endsWith('.supabase.co')) return;

  // Сама страница: сначала сеть — чтобы обновление приезжало сразу,
  // и только при её отсутствии показываем сохранённую копию
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  // Остальное (иконки, библиотека с CDN): отдаём из кеша сразу,
  // а свежую версию подтягиваем в фоне на следующий раз
  event.respondWith(
    caches.match(req).then(hit => {
      const network = fetch(req)
        .then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
