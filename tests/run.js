// Все проверки одним запуском: node run.js
const { chromium } = require('playwright');
const { GAME_URL, launchOptions, applyStub, check, report } = require('./helpers');

const PHONE = { width: 430, height: 850 };

async function newGame(browser, opts) {
  const page = await browser.newPage({ viewport: PHONE });
  page.on('pageerror', e => check('без ошибок JS', false, e.message));
  await applyStub(page, opts);
  await page.goto(GAME_URL);
  await page.waitForTimeout(300);
  return page;
}

async function testModes(browser) {
  console.log('\nРежимы и общий экран');
  const page = await newGame(browser);

  const names = await page.evaluate(() => [
    document.getElementById('tModeSolo').textContent,
    document.getElementById('tModeDuel').textContent,
    document.getElementById('tModeRun').textContent
  ]);
  check('в меню три режима с названиями', names.every(n => n && n.trim()), names.join(' / '));

  // Тренировка
  await page.click('#tModeSolo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  check('тренировка: термометр виден', await page.locator('#thermoWrap').isVisible());
  check('тренировка: шкала расстояний раскрыта', await page.evaluate(() => document.getElementById('scaleBox').open));
  const secret = await page.evaluate(() => secret);
  await page.fill('#guessInput', String(secret));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  check('тренировка: победа показывает результат',
    (await page.locator('#resultBox').textContent()).includes('Победа'));

  // Дуэль
  await page.click('#screenGame >> text=В меню');
  await page.click('#tModeDuel');
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  check('дуэль: карточки игроков видны', await page.locator('#pcard0').isVisible());
  check('дуэль: показан чей ход', (await page.locator('#turnBanner').textContent()).trim().length > 0);

  await page.close();
}

async function testRating(browser) {
  console.log('\nРежим на рейтинг');
  const page = await newGame(browser, { user: 'Максим' });

  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  check('вход по сохранённому аккаунту ведёт сразу в хаб', await page.locator('#screenRunHub').isVisible());
  check('чип с именем виден в хабе', await page.locator('#accountChip').isVisible());
  check('топ за неделю выбран по умолчанию',
    await page.locator('#tRunTopWeek').evaluate(e => e.classList.contains('active')));

  await page.click('#tRunStart');
  await page.waitForTimeout(250);
  check('чип скрыт во время игры', !(await page.locator('#accountChip').isVisible()));

  // язык не должен налезать на строку статуса
  const overlap = await page.evaluate(() => {
    const a = document.querySelector('.top-controls').getBoundingClientRect();
    const b = document.querySelector('.info-bar').getBoundingClientRect();
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  });
  check('панель языка не перекрывает строку статуса', !overlap);
  check('кнопка выхода из игры нажимается',
    await page.click('#tMenu', { timeout: 3000 }).then(() => true).catch(() => false));

  // круглые диапазоны и убывающие попытки
  await page.waitForTimeout(200);
  const curve = await page.evaluate(() => {
    const out = [];
    for (let n = 1; n <= 14; n++) { const r = runRangeForRound(n); out.push({ n, r, a: runAttemptsForRound(n, r) }); }
    return out;
  });
  check('диапазоны круглые', curve.every(c => c.r % 10 === 0), curve.map(c => c.r).join(', '));
  check('диапазон не растёт бесконечно', curve[13].r === curve[8].r);
  check('после потолка попыток становится меньше', curve[13].a < curve[8].a,
    curve[8].a + ' -> ' + curve[13].a);

  await page.close();
}

async function testScoringAndSubmit(browser) {
  console.log('\nОчки и отправка результата');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  await page.click('#tRunStart');
  await page.waitForTimeout(250);

  const s = await page.evaluate(() => ({ secret, RANGE_MAX, MAX_GUESSES }));
  await page.fill('#guessInput', String(s.secret));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(150);
  const afterWin = await page.evaluate(() => ({ score: RUN.totalScore, locked: RUN.locked }));
  check('за угаданный раунд начисляются очки', afterWin.score > 0, String(afterWin.score));

  // повторный ввод того же числа в паузе не должен давать очки снова
  await page.fill('#guessInput', String(s.secret));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(100);
  check('в паузе между раундами очки не накручиваются',
    (await page.evaluate(() => RUN.totalScore)) === afterWin.score);

  // сливаем раунд -> игра заканчивается и результат уходит на сервер
  await page.waitForTimeout(900);
  const s2 = await page.evaluate(() => ({ secret, RANGE_MAX, MAX_GUESSES }));
  for (let i = 0; i < s2.MAX_GUESSES; i++) {
    let wrong = ((s2.secret + i) % s2.RANGE_MAX) + 1;
    if (wrong === s2.secret) wrong = (wrong % s2.RANGE_MAX) + 1;
    await page.fill('#guessInput', String(wrong));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(500);
  check('после проигрыша возвращаемся в хаб', await page.locator('#screenRunHub').isVisible());
  const msg = (await page.locator('#runHubMessage').textContent()).replace(/\s+/g, ' ');
  check('в итогах показано загаданное число', msg.includes('Загаданное число'));
  const calls = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'submit_run_score'));
  check('результат отправлен на сервер', calls.length === 1, JSON.stringify(calls[0] && calls[0].args));

  await page.close();
}

async function testAuth(browser) {
  console.log('\nВход и регистрация');
  const page = await newGame(browser);

  await page.click('#tModeRun');
  await page.waitForTimeout(250);
  check('без аккаунта показывается выбор вход/регистрация', await page.locator('#screenAuthChoice').isVisible());

  await page.click('#screenAuthChoice >> text=Зарегистрироваться');
  await page.waitForTimeout(150);
  const regTitle = await page.locator('#runAuthTitle').textContent();
  await page.fill('#runUsername', 'Максим');
  await page.click('#runAuthSubmitBtn');
  await page.waitForTimeout(200);
  check('пустой PIN даёт понятную ошибку',
    (await page.locator('#runAuthError').textContent()).includes('PIN'));
  check('введённое имя не стирается после ошибки',
    (await page.inputValue('#runUsername')) === 'Максим');

  await page.click('#screenAuth >> text=Назад');
  await page.waitForTimeout(150);
  await page.click('#screenAuthChoice >> text=Войти');
  await page.waitForTimeout(150);
  check('экраны входа и регистрации различаются',
    (await page.locator('#runAuthTitle').textContent()) !== regTitle);

  await page.close();
}

async function testLogout(browser) {
  console.log('\nВыход из аккаунта');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  await page.click('#accountChip');
  await page.waitForTimeout(200);

  check('окно подтверждения открылось', await page.locator('#logoutModal').isVisible());
  check('текст в окне читается (не чёрный на тёмном)',
    (await page.locator('#tLogoutAsk').evaluate(e => getComputedStyle(e).color)) === 'rgb(255, 255, 255)');

  await page.click('#tLogoutCancel');
  await page.waitForTimeout(150);
  check('отмена не разлогинивает', !!(await page.evaluate(() => localStorage.getItem('hc_run_user'))));

  await page.click('#accountChip');
  await page.waitForTimeout(150);
  await page.click('#tLogoutConfirm');
  await page.waitForTimeout(250);
  check('подтверждение разлогинивает', !(await page.evaluate(() => localStorage.getItem('hc_run_user'))));

  await page.close();
}

async function testTranslations(browser) {
  console.log('\nПереводы');
  const page = await newGame(browser, { user: 'Максим' });

  for (const lang of ['en', 'ru', 'fr', 'de']) {
    await page.selectOption('#langSwitcher', lang);
    await page.waitForTimeout(150);
    const empty = await page.evaluate(() => {
      const ids = ['tModeSolo', 'tModeDuel', 'tModeRun', 'tRunStart', 'tRunTop', 'tRunTopWeek', 'tRunTopAll'];
      return ids.filter(id => !(document.getElementById(id).textContent || '').trim());
    });
    check('язык ' + lang + ': все подписи заполнены', empty.length === 0, empty.join(', '));
  }

  const missing = await page.evaluate(() => {
    const used = new Set();
    const html = document.documentElement.outerHTML;
    return Object.keys(i18n).flatMap(lang => {
      const ref = Object.keys(i18n.ru), refRun = Object.keys(i18n.ru.run);
      const a = ref.filter(k => i18n[lang][k] === undefined).map(k => lang + '.' + k);
      const b = refRun.filter(k => i18n[lang].run[k] === undefined).map(k => lang + '.run.' + k);
      return a.concat(b);
    });
  });
  check('во всех языках одинаковый набор ключей', missing.length === 0, missing.join(', '));

  await page.close();
}

(async () => {
  const browser = await chromium.launch(launchOptions());
  try {
    await testModes(browser);
    await testRating(browser);
    await testScoringAndSubmit(browser);
    await testAuth(browser);
    await testLogout(browser);
    await testTranslations(browser);
  } finally {
    await browser.close();
  }
  console.log('');
  process.exit(report() > 0 ? 1 : 0);
})();
