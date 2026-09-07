// Проверка офлайна: поднимаем локальный сервер (service worker не работает с file://),
// заходим, отключаем сеть и убеждаемся, что игра всё равно открывается и играется.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { launchOptions, check, report } = require('./helpers');

const ROOT = path.resolve(__dirname, '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json'
};

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

(async () => {
  const { server, port } = await serve();
  const url = 'http://127.0.0.1:' + port + '/index.html';
  const browser = await chromium.launch(launchOptions());
  const context = await browser.newContext({ viewport: { width: 430, height: 850 } });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('hc_lang', 'ru'));

  // supabase-js берётся с CDN, которого в тесте нет — подменяем заглушкой,
  // чтобы проверять именно офлайн-загрузку страницы, а не сеть до Supabase
  await page.route('**/supabase-js*', route =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.supabase={createClient:()=>({from:()=>({select:()=>({eq:()=>({single:async()=>({data:null,error:1})})})}),rpc:async()=>({data:[],error:null})})};' }));

  await page.goto(url);
  await page.waitForTimeout(500);

  const registered = await page.evaluate(() =>
    navigator.serviceWorker.ready.then(r => !!r.active).catch(() => false));
  check('service worker зарегистрировался', registered);

  await page.waitForTimeout(700); // дать ему прогреть кеш

  // рубим сеть и перезагружаемся
  await context.setOffline(true);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(600);

  check('без сети страница открывается', await page.locator('#screenMode').isVisible());
  check('без сети видны все три режима',
    (await page.locator('#screenMode .mode-btn').count()) === 3);

  // тренировка должна полностью работать офлайн
  await page.click('#tModeSolo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  check('без сети тренировка запускается', await page.locator('#thermoWrap').isVisible());
  const secret = await page.evaluate(() => secret);
  await page.fill('#guessInput', String(secret));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(300);
  check('без сети тренировка доигрывается до победы',
    (await page.locator('#resultBox').textContent()).includes('Победа'));

  check('без сети нет ошибок JS', errors.length === 0, errors.join('; '));

  await browser.close();
  server.close();
  console.log('');
  process.exit(report() > 0 ? 1 : 0);
})();
