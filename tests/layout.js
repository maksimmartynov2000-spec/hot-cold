// Проверка вёрстки на разных экранах: фон без швов, ничего не вылезает
// за края, ключевые элементы видны и не перекрывают друг друга.
const { chromium } = require('playwright');
const { GAME_URL, launchOptions, applyStub, check, report } = require('./helpers');

const DEVICES = [
  { name: 'маленький телефон', width: 360, height: 640 },
  { name: 'iPhone',            width: 390, height: 844 },
  { name: 'большой телефон',   width: 430, height: 932 },
  { name: 'планшет',           width: 768, height: 1024 },
  { name: 'ноутбук',           width: 1280, height: 800 }
];

async function run() {
  const browser = await chromium.launch(launchOptions());

  for (const d of DEVICES) {
    const context = await browser.newContext({ viewport: { width: d.width, height: d.height } });
    const page = await context.newPage();
    page.on('pageerror', e => check(d.name + ': без ошибок JS', false, e.message));
    await applyStub(page, { user: 'Максим' });
    await page.goto(GAME_URL);
    await page.waitForTimeout(300);

    // набираем длинную историю попыток — именно там вылезал тёмный шов
    await page.click('#tModeRun');
    await page.waitForTimeout(300);
    await page.click('#tRunStart');
    await page.waitForTimeout(250);
    const s = await page.evaluate(() => ({ secret, RANGE_MAX, MAX_GUESSES }));
    for (let i = 0; i < s.MAX_GUESSES - 1; i++) {
      let w = ((s.secret + i + 1) % s.RANGE_MAX) + 1;
      if (w === s.secret) w = (w % s.RANGE_MAX) + 1;
      await page.fill('#guessInput', String(w));
      await page.click('#tSubmitGuess');
      await page.waitForTimeout(40);
    }

    // 1. Горизонтальной прокрутки быть не должно
    const overflowX = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth + 1);
    check(d.name + ': нет горизонтальной прокрутки', !overflowX);

    // 2. Фон без шва. Прокручиваем страницу вниз и ищем резкий перепад яркости
    //    между соседними строками у левого края: градиент меняется плавно,
    //    а шов (когда ниже экрана начинается плоская заливка) даёт ступеньку.
    //    Полностраничный снимок для этого не годится — он сам клеит кадры по экрану.
    const scrolls = await page.evaluate(() => {
      const scrollable = document.documentElement.scrollHeight > window.innerHeight + 1;
      window.scrollTo(0, document.documentElement.scrollHeight);
      return scrollable;
    });
    await page.waitForTimeout(250);
    const shot = await page.screenshot();
    const seam = await page.evaluate(async (src) => {
      const img = new Image();
      await new Promise(res => { img.onload = res; img.src = src; });
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      let prev = null, jump = 0;
      for (let y = 0; y < img.height; y++) {
        const d = ctx.getImageData(0, y, 3, 1).data;
        const v = (d[0] + d[1] + d[2] + d[4] + d[5] + d[6] + d[8] + d[9] + d[10]) / 9;
        if (prev !== null) jump = Math.max(jump, Math.abs(v - prev));
        prev = v;
      }
      return +jump.toFixed(2);
    }, 'data:image/png;base64,' + shot.toString('base64'));
    check(d.name + ': фон без тёмного шва', seam < 2,
      'перепад ' + seam + (scrolls ? '' : ' (страница помещается целиком)'));
    await page.evaluate(() => window.scrollTo(0, 0));

    // 3. Ключевые элементы на месте и в пределах экрана
    const fits = await page.evaluate(() => {
      const bad = [];
      ['#thermoWrap', '#guessSection', '.info-bar'].forEach(sel => {
        const el = document.querySelector(sel);
        if (!el || el.classList.contains('hidden')) return;
        const r = el.getBoundingClientRect();
        if (r.left < -1 || r.right > window.innerWidth + 1) bad.push(sel);
      });
      return bad;
    });
    check(d.name + ': элементы не вылезают за края', fits.length === 0, fits.join(', '));

    await context.close();
  }

  await browser.close();
  console.log('');
  process.exit(report() > 0 ? 1 : 0);
}

run();
