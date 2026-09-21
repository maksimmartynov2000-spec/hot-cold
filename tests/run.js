// Все проверки одним запуском: node run.js
const { chromium } = require('playwright');
const { GAME_URL, launchOptions, applyStub, check, report } = require('./helpers');

const PHONE = { width: 430, height: 850 };

// Свой контекст на каждый тест: иначе страницы делят localStorage и влияют друг на друга
async function newGame(browser, opts) {
  const context = await browser.newContext({ viewport: PHONE });
  const page = await context.newPage();
  page.on('pageerror', e => check('без ошибок JS', false, e.message));
  await applyStub(page, opts);
  await page.goto(GAME_URL);
  await page.waitForTimeout(300);
  return page;
}

async function done(page) {
  await page.context().close();
}

// Страница, открытая с заранее выставленной памятью браузера. Нужна там, где
// проверяется «настройка запомнилась»: читать её после page.reload() нельзя —
// по file:// Chromium изредка обнуляет хранилище, и тест мигает без вины игры
async function gameWithStorage(browser, opts, entries) {
  const context = await browser.newContext({ viewport: PHONE });
  const page = await context.newPage();
  page.on('pageerror', e => check('без ошибок JS', false, e.message));
  await applyStub(page, opts);
  await page.addInitScript(pairs => {
    Object.keys(pairs).forEach(k => localStorage.setItem(k, pairs[k]));
  }, entries);
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
    document.getElementById('tModeRun').textContent,
    document.getElementById('tModeOnline').textContent
  ]);
  check('в меню четыре режима с названиями', names.every(n => n && n.trim()), names.join(' / '));
  check('карточек в меню тоже четыре',
    await page.evaluate(() => document.querySelectorAll('#screenMode .mode-btn').length) === 4);

  // Тренировка
  await page.click('#tModeSolo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  check('тренировка: термометр виден', await page.locator('#thermoWrap').isVisible());
  check('тренировка: название игры видно', await page.locator('.header h1').isVisible());
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

  await done(page);
}

async function testRating(browser) {
  console.log('\nРежим на рейтинг');
  const page = await newGame(browser, { user: 'Максим' });

  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  check('вход по сохранённому аккаунту ведёт сразу в хаб', await page.locator('#screenRunHub').isVisible());
  check('чип с именем виден в хабе', await page.locator('#accountChip').isVisible());
  check('топ за сегодня выбран по умолчанию',
    await page.locator('#tRunTopDay').evaluate(e => e.classList.contains('active')));

  // Каждая вкладка тянет свой срез: за день, за неделю и за всё время
  for (const [id, rpc] of [['#tRunTopDay', 'run_leaderboard_daily'],
                           ['#tRunTopAll', 'run_leaderboard'],
                           ['#tRunTopWeek', 'run_leaderboard_weekly']]) {
    await page.evaluate(() => { window.__rpcCalls.length = 0; });
    await page.click(id);
    await page.waitForTimeout(200);
    const last = await page.evaluate(() => (window.__rpcCalls.pop() || {}).name);
    check('вкладка ' + id.slice(8) + ' запрашивает ' + rpc, last === rpc, 'запрошено ' + last);
    check('вкладка ' + id.slice(8) + ' подсвечена',
      await page.locator(id).evaluate(e => e.classList.contains('active')));
    const others = await page.evaluate(sel => [...document.querySelectorAll('.lb-tab')]
      .filter(e => !e.matches(sel) && e.classList.contains('active')).length, id);
    check('вкладка ' + id.slice(8) + ': остальные погашены', others === 0);
  }

  await page.click('#tRunStart');
  await page.waitForTimeout(250);
  check('чип скрыт во время игры', !(await page.locator('#accountChip').isVisible()));
  check('название игры видно в рейтинге', await page.locator('.header h1').isVisible());

  // язык не должен налезать на строку статуса
  const overlap = await page.evaluate(() => {
    const a = document.querySelector('.top-controls').getBoundingClientRect();
    const b = document.querySelector('.info-bar').getBoundingClientRect();
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  });
  check('панель языка не перекрывает строку статуса', !overlap);
  check('кнопка паузы нажимается',
    await page.click('#tMenu', { timeout: 3000 }).then(() => true).catch(() => false));
  await page.click('#tPauseResume').catch(() => {});

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

  await done(page);
}

async function testScoringAndSubmit(browser) {
  console.log('\nОчки и отправка результата');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  await page.click('#tRunStart');
  await page.waitForTimeout(250);

  const s = await page.evaluate(() => ({ secret: window.__run.secret, RANGE_MAX, MAX_GUESSES }));
  await page.fill('#guessInput', String(await page.evaluate(() => window.__run.secret)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(150);
  const afterWin = await page.evaluate(() => ({ score: RUN.totalScore, locked: RUN.locked }));
  check('за угаданный раунд начисляются очки', afterWin.score > 0, String(afterWin.score));

  // повторный ввод того же числа в паузе не должен давать очки снова
  await page.fill('#guessInput', String(await page.evaluate(() => window.__run.secret)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(100);
  check('в паузе между раундами очки не накручиваются',
    (await page.evaluate(() => RUN.totalScore)) === afterWin.score);

  // сливаем раунд -> игра заканчивается и результат уходит на сервер
  await page.waitForTimeout(900);
  const s2 = await page.evaluate(() => ({ secret: window.__run.secret, RANGE_MAX, MAX_GUESSES }));
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
  // Отправлять результат больше нечего: его считал и записал сервер. Проверяем,
  // что игра шла через него и что забег на сервере закрыт
  const calls = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'run_guess'));
  check('ходы шли через сервер', calls.length > 1, String(calls.length));
  check('клиент не отправляет итог сам',
    await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'submit_run_score').length) === 0);
  check('забег на сервере закрыт',
    await page.evaluate(() => window.__run.active === false));

  await done(page);
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

  await done(page);
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

  await done(page);
}

async function testTranslations(browser) {
  console.log('\nПереводы');
  const page = await newGame(browser, { user: 'Максим' });

  for (const lang of ['en', 'ru', 'fr', 'de']) {
    await page.selectOption('#langSwitcher', lang);
    await page.waitForTimeout(150);
    const empty = await page.evaluate(() => {
      const ids = ['tModeSolo', 'tModeDuel', 'tModeRun', 'tRunStart', 'tRunTop', 'tRunTopDay', 'tRunTopWeek', 'tRunTopAll'];
      return ids.filter(id => !(document.getElementById(id).textContent || '').trim());
    });
    check('язык ' + lang + ': все подписи заполнены', empty.length === 0, empty.join(', '));
  }

  // Числительные согласуются с числом, а не подставляются одной строкой
  const plurals = await page.evaluate(() => {
    const bad = [];
    const expect = {
      ru: { 1: '1 очко', 2: '2 очка', 5: '5 очков', 11: '11 очков', 21: '21 очко', 133: '133 очка' },
      en: { 1: '1 point', 2: '2 points', 5: '5 points' },
      fr: { 0: '0 point', 1: '1 point', 2: '2 points' },
      de: { 1: '1 Punkt', 2: '2 Punkte', 5: '5 Punkte' }
    };
    for (const lang of Object.keys(expect)) {
      currentLang = lang;
      for (const n of Object.keys(expect[lang])) {
        const got = withPlural(+n, i18n[lang].run.pointForms);
        if (got !== expect[lang][n]) bad.push(lang + ': ' + got + ' вместо ' + expect[lang][n]);
      }
    }
    return bad;
  });
  check('числительные согласованы во всех языках', plurals.length === 0, plurals.join('; '));

  // Игра называется одинаково везде, включая текст «поделиться»
  const named = await page.evaluate(() => Object.keys(i18n)
    .filter(l => i18n[l].run.shareText.indexOf('Hot or Cold') === -1));
  check('в тексте «поделиться» игра названа как Hot or Cold', named.length === 0, named.join(', '));

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

  await done(page);
}


async function testSoundAndShare(browser) {
  console.log('\nЗвук, рекорд и «поделиться»');
  const page = await newGame(browser, { user: 'Максим' });

  // Звук: кнопка есть, переключается и запоминается
  check('кнопка звука видна', await page.locator('#soundBtn').isVisible());
  check('звук включён по умолчанию', (await page.locator('#soundBtn').textContent()) === '🔊');
  await page.click('#soundBtn');
  await page.waitForTimeout(100);
  check('звук выключается', (await page.locator('#soundBtn').textContent()) === '🔇');
  check('выбор звука записан в память',
    await page.evaluate(() => localStorage.getItem('hc_sound')) === '0');
  await page.click('#soundBtn');
  await page.waitForTimeout(100);

  // Тон звучит на каждый ход — проверяем, что осциллятор действительно создаётся
  await page.evaluate(() => {
    window.__tones = 0;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const orig = Ctx.prototype.createOscillator;
    Ctx.prototype.createOscillator = function () { window.__tones++; return orig.call(this); };
  });
  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  await page.click('#tRunStart');
  await page.waitForTimeout(250);
  const s = await page.evaluate(() => ({ secret, RANGE_MAX }));
  const wrong = s.secret === 1 ? 2 : 1;
  await page.fill('#guessInput', String(wrong));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  check('на ход играет звук', (await page.evaluate(() => window.__tones)) > 0);

  // и обратная сторона: выключенный звук читается из памяти при запуске
  const muted = await gameWithStorage(browser, { user: 'Максим' }, { hc_sound: '0' });
  check('при запуске выключенный звук читается из памяти',
    (await muted.locator('#soundBtn').textContent()) === '🔇');
  await done(muted);

  // Личный рекорд в строке статуса
  await page.evaluate(() => localStorage.setItem(runBestKey(), '4200'));
  await page.fill('#guessInput', String(await page.evaluate(() => window.__run.secret)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(1200);
  // toLocaleString ставит неразрывный пробел — сравниваем по цифрам
  const status = (await page.locator('#tConfirmed').textContent()).replace(/\s/g, ' ');
  check('личный рекорд виден во время игры', status.includes('4 200'), status.trim());

  // «Поделиться» на экране итогов. Прежнюю игру сначала завершаем:
  // пока она висит незаконченной, новую начать нельзя — так и задумано
  await page.click('#tMenu');
  await page.waitForTimeout(200);
  await page.click('#tPauseGiveUp');
  await page.waitForTimeout(600);
  await page.click('#tRunStart');
  await page.waitForTimeout(250);
  const s2 = await page.evaluate(() => ({ secret: window.__run.secret, RANGE_MAX, MAX_GUESSES }));
  for (let i = 0; i < s2.MAX_GUESSES; i++) {
    let w = ((s2.secret + i) % s2.RANGE_MAX) + 1;
    if (w === s2.secret) w = (w % s2.RANGE_MAX) + 1;
    await page.fill('#guessInput', String(w));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(600);
  check('в итогах есть кнопка «поделиться»', await page.locator('#shareBtn').isVisible());

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  await page.evaluate(() => { navigator.share = undefined; });
  await page.click('#shareBtn');
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
  check('результат копируется в буфер', /очк|Горячо/.test(copied), copied.slice(0, 60));

  await done(page);
}

async function testDuelWording(browser) {
  console.log('\nФормулировки дуэли');
  const page = await newGame(browser);
  await page.click('#tModeDuel');
  await page.selectOption('#winsNeeded', '1');
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  const secret = await page.evaluate(() => secret);
  await page.fill('#guessInput', String(secret));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(300);
  const text = (await page.locator('#resultBox').textContent()).replace(/\s+/g, ' ');
  check('в итогах дуэли нет слова «матч»', !/матч/i.test(text), text.slice(0, 70));
  await done(page);
}


async function testPauseAndGiveUp(browser) {
  console.log('\nПауза, продолжение и «сдаться»');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  await page.click('#tRunStart');
  await page.waitForTimeout(250);

  // выигрываем раунд, чтобы было что сохранять
  const s = await page.evaluate(() => window.__run.secret);
  await page.fill('#guessInput', String(s));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(1200);
  const scoreBefore = await page.evaluate(() => RUN.totalScore);
  check('забег живёт на сервере, а не в браузере',
    await page.evaluate(() => window.__run.active === true && window.__run.round === 2),
    await page.evaluate(() => JSON.stringify({ active: window.__run.active, round: window.__run.round })));

  // кнопка в игре открывает паузу, а не выбрасывает молча
  await page.click('#tMenu');
  await page.waitForTimeout(200);
  check('кнопка в игре открывает паузу', await page.locator('#pauseModal').isVisible());
  await page.click('#tPauseResume');
  await page.waitForTimeout(200);
  check('«Продолжить» возвращает в игру',
    !(await page.locator('#pauseModal').isVisible()) && await page.locator('#thermoWrap').isVisible());

  // выход с сохранением -> в хабе предлагают продолжить
  await page.click('#tMenu');
  await page.waitForTimeout(200);
  await page.click('#tPauseExit');
  await page.waitForTimeout(300);
  check('после выхода хаб предлагает незаконченную игру',
    await page.locator('#unfinishedBox').isVisible());
  check('пока игра не закончена, новую начать не предлагают',
    !(await page.locator('#tRunStart').isVisible()));
  const info = await page.locator('#unfinishedInfo').textContent();
  check('в карточке видно раунд и очки', /Раунд\s*2/.test(info), info.trim());

  // полная перезагрузка страницы — игра должна пережить закрытие приложения
  await page.reload();
  await page.waitForTimeout(400);
  await page.click('#tModeRun');
  await page.waitForTimeout(400);
  check('игра переживает перезагрузку страницы', await page.locator('#unfinishedBox').isVisible());

  await page.click('#tUnfinishedResume');
  await page.waitForTimeout(300);
  const resumed = await page.evaluate(() => ({ score: RUN.totalScore, round: RUN.round }));
  check('продолжение восстанавливает счёт и раунд',
    resumed.score === scoreBefore && resumed.round === 2,
    'очки ' + resumed.score + ', раунд ' + resumed.round);

  // сдаться -> результат уходит на сервер, сохранение чистится
  await page.evaluate(() => { window.__rpcCalls.length = 0; });
  await page.click('#tMenu');
  await page.waitForTimeout(200);
  await page.click('#tPauseGiveUp');
  await page.waitForTimeout(600);
  const sent = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'run_give_up'));
  check('«сдаться» уходит на сервер', sent.length === 1, String(sent.length));
  check('и забег там закрыт', await page.evaluate(() => window.__run.active === false));
  check('в браузере забег не хранится',
    !(await page.evaluate(() => localStorage.getItem('hc_run_state'))));
  check('после «сдаться» снова можно начать игру', await page.locator('#tRunStart').isVisible());

  await done(page);
}


async function testBestPerAccount(browser) {
  console.log('\nЛичный рекорд принадлежит аккаунту');
  const page = await newGame(browser, { user: 'Аня' });

  // Ане записался рекорд — она в общем топе
  await page.click('#tModeRun');
  await page.waitForTimeout(350);
  await page.click('#tRunTopAll');
  await page.waitForTimeout(300);
  const anyaBest = await page.evaluate(() => runBest());
  check('рекорд подтянулся из общего топа', anyaBest === 5200, String(anyaBest));

  // тот же телефон, другой ученик
  const maksimBest = await page.evaluate(() => {
    localStorage.setItem('hc_run_user', 'Максим');
    return runBest();
  });
  check('новому ученику чужой рекорд не достался', maksimBest === 0, String(maksimBest));

  // а Ане её рекорд остался
  const back = await page.evaluate(() => {
    localStorage.setItem('hc_run_user', 'Аня');
    return runBest();
  });
  check('свой рекорд у Ани остался', back === 5200, String(back));

  // без входа рекорда нет вовсе
  const anon = await page.evaluate(() => {
    localStorage.removeItem('hc_run_user');
    return runBest();
  });
  check('без входа рекорд не показывается', anon === 0, String(anon));

  await done(page);

  // Ключ прежней версии был общим на всё устройство — он не должен достаться никому
  const page2 = await newGame(browser, { user: 'Новичок' });
  await page2.evaluate(() => localStorage.setItem('hc_run_best', '99999'));
  await page2.reload();
  await page2.waitForTimeout(400);
  const legacy = await page2.evaluate(() => ({ best: runBest(), old: localStorage.getItem('hc_run_best') }));
  check('старый общий ключ убирается', legacy.old === null, String(legacy.old));
  check('из старого ключа рекорд не подставляется', legacy.best === 0, String(legacy.best));

  await done(page2);

  // Незаконченный забег приезжает с сервера, а не лежит в браузере. Кому он
  // принадлежит, решает тот же check_student_pin, что и всё остальное, —
  // и регистр имени там уже проверен сценариями в базе
  const page3 = await newGame(browser, { user: 'Аня' });
  await page3.evaluate(() => {
    window.__run.active = true;
    window.__run.round = 3;
    window.__run.score = 700;
    window.__runSave();
  });
  await page3.click('#tModeRun');
  await page3.waitForTimeout(500);
  check('незаконченный забег предлагают продолжить',
    await page3.locator('#tUnfinishedResume').isVisible());
  check('его состояние спрошено у сервера',
    await page3.evaluate(() => window.__rpcCalls.filter(c => c.name === 'run_state').length) > 0);
  check('в браузере забег не хранится',
    !(await page3.evaluate(() => localStorage.getItem('hc_run_state'))));
  const card = await page3.locator('#unfinishedInfo').textContent();
  check('в карточке видны раунд и очки с сервера',
    /Раунд\s*3/.test(card) && /700/.test(card), card.trim());

  // Закрываем забег на сервере и заходим заново: из хаба в меню не выйти
  await page3.evaluate(() => { window.__run.active = false; window.__runSave(); });
  await page3.reload();
  await page3.waitForTimeout(400);
  await page3.click('#tModeRun');
  await page3.waitForTimeout(500);
  check('законченный забег продолжать не предлагают',
    !(await page3.locator('#tUnfinishedResume').isVisible()));

  await done(page3);
}

async function testFrostMode(browser) {
  console.log('\nМороз и жара');
  const page = await newGame(browser, { user: 'Максим' });

  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  const before = await page.evaluate(() => ({
    labels: [...document.querySelectorAll('#rangeMax option')].map(o => o.textContent),
    attempts: [...document.querySelectorAll('#attemptsCount option')].map(o => o.textContent)
  }));
  check('без мороза границы обычные', before.labels.join(' ').indexOf('-') === -1, before.labels.join(' '));

  await page.check('#frostSetup');
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({
    labels: [...document.querySelectorAll('#rangeMax option')].map(o => o.textContent),
    attempts: [...document.querySelectorAll('#attemptsCount option')].map(o => o.textContent)
  }));
  check('с морозом границы симметричные',
    after.labels.includes('-50…+50') && after.labels.includes('-5…+5') &&
    after.labels.every(l => l.indexOf('-') === 0), after.labels.join(' '));
  // toLocaleString ставит неразрывный пробел — сравниваем после нормализации
  const plain = arr => arr.map(l => l.replace(/\s/g, ' '));
  check('новые диапазоны на месте',
    ['1–20', '1–200', '1–2 000'].every(v => plain(before.labels).includes(v)),
    plain(before.labels).join(' '));
  check('и у них симметричная пара',
    ['-10…+10', '-100…+100', '-1 000…+1 000'].every(v => plain(after.labels).includes(v)),
    plain(after.labels).join(' '));
  // чисел столько же, значит и попыток должно предлагаться столько же
  check('попыток предлагается столько же', after.attempts.join() === before.attempts.join(),
    before.attempts.join() + ' → ' + after.attempts.join());

  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  const g = await page.evaluate(() => ({
    min: RANGE_MIN, max: RANGE_MAX, count: rangeCount(), secret,
    signBtn: !document.getElementById('guessSign').classList.contains('hidden'),
    placeholder: document.getElementById('guessInput').placeholder
  }));
  check('границы зеркальны относительно нуля', g.min === -g.max, g.min + '…' + g.max);
  check('чисел столько же, сколько в обычной тысяче', g.count === 1001, String(g.count));
  check('секрет внутри границ', g.secret >= g.min && g.secret <= g.max, String(g.secret));
  check('минус доступен — рядом с полем стоит своя кнопка', g.signBtn === true);
  check('подсказка в поле называет обе границы',
    g.placeholder.indexOf('-500') >= 0 && g.placeholder.indexOf('500') >= 0, g.placeholder);

  // отрицательная догадка засчитывается, расстояние считается верно
  await page.fill('#guessInput', '-400');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const h = await page.evaluate(() => ({ len: history.length, d: history[0].distance, s: secret }));
  check('отрицательная догадка принята', h.len === 1);
  check('расстояние от отрицательной догадки верное', h.d === Math.abs(-400 - h.s),
    h.d + ' вместо ' + Math.abs(-400 - h.s));

  // ноль — тоже допустимое число
  await page.fill('#guessInput', '0');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  check('ноль принимается как догадка', await page.evaluate(() => history.length) === 2);

  // за границей — не принимается
  await page.fill('#guessInput', '-501');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  check('число за нижней границей отклонено', await page.evaluate(() => history.length) === 2);

  // рекорды не перемешиваются с обычной игрой
  const keys = await page.evaluate(() => {
    localStorage.setItem('hc_record_1000', '5');
    return { frost: recordKey(1000), normal: (setFrostMode(false), recordKey(1000)) };
  });
  check('у мороза свой ключ рекорда', keys.frost !== keys.normal, keys.frost + ' / ' + keys.normal);

  await done(page);

  // Переключатель есть и в режиме на рейтинг, и он запоминается
  const page2 = await newGame(browser, { user: 'Максим' });
  await page2.click('#tModeRun');
  await page2.waitForTimeout(350);
  check('в хабе рейтинга есть переключатель', await page2.locator('#frostRun').isVisible());
  await page2.check('#frostRun');
  await page2.waitForTimeout(150);
  await page2.click('#tRunStart');
  await page2.waitForTimeout(300);
  const r = await page2.evaluate(() => ({ min: RANGE_MIN, max: RANGE_MAX }));
  check('рейтинг играется в симметричных границах', r.min === -r.max && r.min < 0, r.min + '…' + r.max);

  check('выбор мороза записан в память',
    await page2.evaluate(() => localStorage.getItem('hc_frost')) === '1');

  await done(page2);

  const page3 = await gameWithStorage(browser, { user: 'Максим' }, { hc_frost: '1' });
  check('при запуске мороз читается из памяти',
    await page3.evaluate(() => frostMode === true));
  await page3.click('#tModeSolo');
  await page3.waitForTimeout(200);
  const startLabels = await page3.evaluate(() =>
    [...document.querySelectorAll('#rangeMax option')].map(o => o.textContent));
  check('и границы сразу симметричные',
    startLabels.length > 0 && startLabels.every(l => l.indexOf('-') === 0),
    startLabels.join(' '));
  await done(page3);
}


async function testNumberLine(browser) {
  console.log('\nЧисловая прямая');
  const page = await newGame(browser, { user: 'Максим' });

  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  await page.check('#frostSetup');
  await page.waitForTimeout(200);
  await page.selectOption('#rangeMax', '10');
  await page.waitForTimeout(150);
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  await page.evaluate(() => { secret = 3; });

  check('прямая видна до первой догадки', await page.locator('#numLine').isVisible());

  // на −5…+5 места хватает на каждое целое число
  const labels = await page.evaluate(() =>
    [...document.querySelectorAll('#numLineSvg text')].map(t => t.textContent));
  const want = ['-5', '-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5'];
  check('на узком диапазоне подписано каждое деление',
    want.every(v => labels.includes(v)), labels.join(' '));
  check('ноль подписан', labels.includes('0'));

  // подсказок о том, где ответ, на прямой нет — только числа и догадки
  check('закрашенных участков нет',
    await page.evaluate(() => document.querySelectorAll('#numLineSvg rect').length) === 0);

  await page.fill('#guessInput', '-1');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const marks = await page.evaluate(() => {
    const c = [...document.querySelectorAll('#numLineSvg circle')];
    return { count: c.length, filled: c.filter(e => e.getAttribute('fill') !== 'none').length,
             x: parseFloat(c[c.length - 1].getAttribute('cx')), want: nlPos(-1) };
  });
  check('догадка отмечена на своём месте', Math.abs(marks.x - marks.want) < 0.01,
    marks.x + ' вместо ' + marks.want);
  check('текущая догадка одна и она залита', marks.filled === 1, JSON.stringify(marks));

  // пояс расстояний — помощь для тренировки, тут он нужен, и стоит он справа
  check('в тренировке пояс показан отдельно от подсказки',
    await page.locator('#feedbackBand').isVisible() &&
    !/\d/.test(await page.locator('#feedbackLabel').textContent()),
    await page.locator('#feedbackPanel').textContent());
  const sides = await page.evaluate(() => {
    const l = document.getElementById('feedbackLabel').getBoundingClientRect();
    const b = document.getElementById('feedbackBand').getBoundingClientRect();
    return { gap: +(b.left - l.right).toFixed(0), labelLeft: +l.left.toFixed(0),
             panelLeft: +document.getElementById('feedbackPanel').getBoundingClientRect().left.toFixed(0) };
  });
  check('подсказка слева, пояс справа, между ними просвет', sides.gap > 20, JSON.stringify(sides));

  // на телефоне подписи крупнее: их читает второклассник с рук
  const sizes = await page.evaluate(() =>
    [...document.querySelectorAll('#numLineSvg text')].map(t => +t.getAttribute('font-size')));
  check('подписи на телефоне не мельче 12 пикселей', Math.min(...sizes) >= 12,
    'минимальный размер ' + Math.min(...sizes));
  // число самой догадки — главное на прямой, оно крупнее делений
  // догадка рисуется последней, поэтому деления — это всё, кроме неё
  const guessSize = sizes[sizes.length - 1];
  const tickMax = Math.max(...sizes.slice(0, -1));
  check('номер догадки крупнее подписей делений', guessSize >= tickMax + 2,
    guessSize + ' против ' + tickMax);

  // шкалу расстояний внизу читают те же дети
  const legend = await page.evaluate(() => {
    const px = sel => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
    return { item: px('.legend-item .l-label'), range: px('.legend-item .l-range'),
             title: px('#scaleBox summary'),
             wrapped: [...document.querySelectorAll('.legend-item')]
               .filter(i => i.getBoundingClientRect().height > 24).length };
  });
  check('шкала расстояний не мельче 14 пикселей',
    legend.item >= 14 && legend.range >= 14 && legend.title >= 14, JSON.stringify(legend));
  check('строки шкалы не переносятся', legend.wrapped === 0, 'перенесено строк: ' + legend.wrapped);

  // на широком диапазоне подписи редеют, но не наезжают друг на друга
  await page.evaluate(() => { frostMode = false; applyBounds(1000); history = []; secret = 640; renderAll(); });
  await page.waitForTimeout(150);
  const wide = await page.evaluate(() => {
    const texts = [...document.querySelectorAll('#numLineSvg text')];
    const xs = texts.map(t => parseFloat(t.getAttribute('x'))).sort((a, b) => a - b);
    let min = 100;
    for (let i = 1; i < xs.length; i++) min = Math.min(min, xs[i] - xs[i - 1]);
    return { count: texts.length, minGap: +min.toFixed(1), labels: texts.map(t => t.textContent) };
  });
  check('на широком диапазоне подписи не наезжают', wide.minGap >= 8,
    'минимальный зазор ' + wide.minGap + '%, подписи: ' + wide.labels.join(' '));
  check('границы диапазона подписаны',
    wide.labels.some(v => v.replace(/\s/g, '') === '1000'), wide.labels.join(' '));

  await done(page);
}

async function testDistanceHint(browser) {
  console.log('\nПодсказка о расстоянии во всех режимах');

  // Во всех трёх режимах пояс есть и снимается кнопкой прямо во время игры
  for (const kind of ['solo', 'duel', 'run']) {
    const page = await newGame(browser, { user: 'Максим' });
    if (kind === 'run') {
      await page.click('#tModeRun');
      await page.waitForTimeout(350);
      await page.click('#tRunStart');
    } else {
      await page.click(kind === 'solo' ? '#tModeSolo' : '#tModeDuel');
      await page.waitForTimeout(200);
      await page.click('#tStartMatch');
    }
    await page.waitForTimeout(300);
    await page.evaluate(() => { secret = 2; });   // догадка 1 гарантированно мимо
    await page.fill('#guessInput', '1');
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(300);

    check(kind + ': пояс показан', await page.locator('#feedbackBand').isVisible());
    check(kind + ': кнопка подсказки подсвечена', await page.evaluate(() =>
      document.getElementById('toggleHintBtn').classList.contains('on')));

    await page.click('#toggleHintBtn');
    await page.waitForTimeout(250);
    check(kind + ': пояс снимается кнопкой', !(await page.locator('#feedbackBand').isVisible()));
    check(kind + ': кнопка погасла', await page.evaluate(() =>
      !document.getElementById('toggleHintBtn').classList.contains('on')));

    await page.click('#toggleHintBtn');
    await page.waitForTimeout(250);
    check(kind + ': пояс возвращается', await page.locator('#feedbackBand').isVisible());
    check(kind + ': выбор записан в память',
      await page.evaluate(() => localStorage.getItem('hc_hint')) === '1');

    await done(page);
  }

  // Выключённая подсказка читается из памяти при запуске
  const muted = await gameWithStorage(browser, { user: 'Максим' }, { hc_hint: '0' });
  check('при запуске выключенная подсказка читается из памяти',
    await muted.evaluate(() => distanceHint === false));
  await muted.click('#tModeSolo');
  await muted.waitForTimeout(200);
  await muted.click('#tStartMatch');
  await muted.waitForTimeout(250);
  await muted.evaluate(() => { secret = 2; });
  await muted.fill('#guessInput', '1');
  await muted.click('#tSubmitGuess');
  await muted.waitForTimeout(300);
  check('и пояс не появляется', !(await muted.locator('#feedbackBand').isVisible()));
  check('галочки на экране настройки больше нет',
    await muted.evaluate(() => document.getElementById('hintRow') === null));
  await done(muted);
}

async function testRoundTiers(browser) {
  console.log('\nКруглые числа в поясах расстояний');
  const page = await newGame(browser, { user: 'Максим' });

  const bad = await page.evaluate(() => {
    const problems = [];
    const sizes = [10, 20, 50, 100, 250, 500, 1000, 2000];
    for (const n of sizes) {
      for (const frost of [false, true]) {
        const count = frost ? Math.floor(n / 2) * 2 + 1 : n;
        const maxDistance = count - 1;
        const meta = buildFeedbackMeta(count);
        const name = (frost ? '±' + (n / 2) : '1–' + n);
        const tiers = meta.slice(0, 8);

        // пояса идут подряд и вместе накрывают все возможные расстояния
        if (tiers[7].min !== 1) problems.push(name + ': шкала начинается не с 1');
        if (tiers[0].max < maxDistance) problems.push(name + ': не накрыто расстояние ' + maxDistance);
        for (let i = 0; i < 8; i++) {
          if (tiers[i].min > tiers[i].max) problems.push(name + ': пустой пояс ' + i);
          if (i && tiers[i - 1].min !== tiers[i].max + 1) problems.push(name + ': разрыв между поясами');
        }
        // Круглой должна быть верхняя граница пояса. Нижняя — это «предыдущая
        // плюс один», она и обязана быть 21 или 61: так «21–50» и читается
        tiers.forEach(t => {
          if (t.max > 10 && t.max % 5 !== 0) problems.push(name + ': некруглая граница ' + t.max);
        });
      }
    }
    return problems;
  });
  check('границы поясов круглые и без дыр', bad.length === 0, bad.slice(0, 5).join('; '));

  // сотня — самый ходовой диапазон, проверяем её подписи целиком
  const hundred = await page.evaluate(() =>
    buildFeedbackMeta(100).slice(0, 8).map(m => m.rangeSign).reverse().join(' '));
  check('шкала сотни читается круглыми числами',
    hundred === '1 2 3–4 5–8 9–15 16–30 31–60 61–100', hundred);

  await done(page);
}

async function testSetupSpacing(browser) {
  console.log('\nВоздух на экране настройки');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeSolo');
  await page.waitForTimeout(250);

  const gaps = await page.evaluate(() => {
    const r = sel => document.querySelector(sel).getBoundingClientRect();
    const range = r('#rangeMax'), frost = r('.frost-row'), attempts = r('#attemptsField');
    return { above: +(frost.top - range.bottom).toFixed(0),
             below: +(attempts.top - frost.bottom).toFixed(0) };
  });
  // Галочка относится к диапазону, значит держится за него, а не висит посередине
  check('галочка ближе к своему полю, чем к следующему', gaps.below > gaps.above + 6,
    'сверху ' + gaps.above + 'px, снизу ' + gaps.below + 'px');
  check('зазоры не слипшиеся', gaps.above >= 6 && gaps.below >= 16, JSON.stringify(gaps));

  // Экран настройки должен помещаться целиком — и в дуэли, где полей вдвое больше
  check('настройка тренировки помещается без прокрутки', await page.evaluate(() =>
    document.documentElement.scrollHeight <= window.innerHeight + 1));
  await page.click('#tBack');
  await page.waitForTimeout(150);
  await page.click('#tModeDuel');
  await page.waitForTimeout(250);
  check('настройка дуэли помещается без прокрутки', await page.evaluate(() =>
    document.documentElement.scrollHeight <= window.innerHeight + 1));

  await done(page);
}

async function testMinusButton(browser) {
  console.log('\nКнопка минуса');
  const page = await newGame(browser, { user: 'Максим' });

  // В обычной игре отрицательных чисел нет — и кнопки быть не должно
  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  check('в обычной игре кнопки минуса нет', !(await page.locator('#guessSign').isVisible()));

  await page.click('#tMenu');
  await page.waitForTimeout(200);
  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  await page.check('#frostSetup');
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.waitForTimeout(120);
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  await page.evaluate(() => { secret = 37; });
  check('в «Морозе и Жаре» кнопка минуса есть', await page.locator('#guessSign').isVisible());

  // Минус можно нажать до цифр — как пишут на бумаге
  await page.click('#guessSign');
  await page.waitForTimeout(120);
  check('минус остаётся в пустом поле', (await page.inputValue('#guessInput')) === '-');
  await page.type('#guessInput', '30');
  await page.waitForTimeout(120);
  check('цифры дописываются после минуса', (await page.inputValue('#guessInput')) === '-30');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  check('отрицательная догадка засчитана',
    await page.evaluate(() => history.length === 1 && history[0].guess === -30));

  // И после цифр — знак переставляется туда-обратно
  await page.fill('#guessInput', '12');
  await page.click('#guessSign');
  await page.waitForTimeout(120);
  check('знак ставится к набранному числу', (await page.inputValue('#guessInput')) === '-12');
  check('кнопка подсвечена при минусе',
    await page.evaluate(() => document.getElementById('guessSign').classList.contains('on')));
  await page.click('#guessSign');
  await page.waitForTimeout(120);
  check('знак снимается повторным нажатием', (await page.inputValue('#guessInput')) === '12');
  check('подсветка снялась',
    await page.evaluate(() => !document.getElementById('guessSign').classList.contains('on')));

  // Буквы и лишние минусы в поле не попадают
  await page.fill('#guessInput', 'ab-1-2c3');
  await page.waitForTimeout(150);
  check('в поле остаются только цифры и один минус',
    (await page.inputValue('#guessInput')) === '-123', await page.inputValue('#guessInput'));

  // Строка ввода не разъезжается даже на самом узком телефоне
  const fits = await page.evaluate(() => {
    const row = document.querySelector('.guess-section .row').getBoundingClientRect();
    const btn = document.getElementById('tSubmitGuess').getBoundingClientRect();
    const sign = document.getElementById('guessSign').getBoundingClientRect();
    return { overflow: Math.round(btn.right - row.right), sign: Math.round(sign.width) };
  });
  check('строка ввода помещается', fits.overflow <= 0, JSON.stringify(fits));
  check('по кнопке минуса удобно попасть пальцем', fits.sign >= 44, String(fits.sign));

  await done(page);
}

async function testShortHistory(browser) {
  console.log('\nВидны только последние ходы');

  for (const kind of ['solo', 'duel', 'run']) {
    const page = await newGame(browser, { user: 'Максим' });
    if (kind === 'run') {
      await page.click('#tModeRun');
      await page.waitForTimeout(350);
      await page.click('#tRunStart');
      await page.waitForTimeout(300);
      // Раунд в рейтинге короткий, а его длину теперь задаёт сервер — правим
      // там же, где он живёт, и оттуда же берём загаданное число
      await page.evaluate(() => {
        window.__run.allowed = 20; window.__run.secret = 10; window.__runSave();
      });
    } else {
      await page.click(kind === 'solo' ? '#tModeSolo' : '#tModeDuel');
      await page.waitForTimeout(200);
      await page.click('#tStartMatch');
      await page.waitForTimeout(300);
    }
    // В рейтинге первый раунд узкий, туда крупные числа просто не пройдут
    const guesses = kind === 'run' ? [1, 2, 3, 4, 5, 6, 7] : [100, 200, 300, 400, 500, 600, 700];
    if (kind !== 'run') await page.evaluate(() => { secret = -999999; });

    for (const g of guesses) {
      await page.fill('#guessInput', String(g));
      await page.click('#tSubmitGuess');
      await page.waitForTimeout(90);
    }

    const seen = await page.evaluate(() => {
      const list = document.getElementById('historyList');
      return { total: history.length, rows: list.children.length,
               nums: [...list.children].map(el => el.querySelector('.h-num').textContent),
               guesses: [...list.children].map(el => el.querySelector('.h-guess').textContent),
               rings: document.querySelectorAll('#numLineSvg circle').length };
    });
    check(kind + ': ходов сделано семь, показано четыре',
      seen.total === 7 && seen.rows === 4, JSON.stringify(seen));
    check(kind + ': показаны именно последние четыре',
      seen.guesses.join() === guesses.slice(-4).reverse().join(), seen.guesses.join());
    check(kind + ': номера настоящие, а не с единицы',
      seen.nums.join() === '#7,#6,#5,#4', seen.nums.join());
    // прямая — та же память: старые догадки не должны на ней оставаться
    check(kind + ': на прямой тоже четыре отметки', seen.rings === 4, String(seen.rings));

    await done(page);
  }
}

// Ставит дуэль с бонусами и один бонус нужного вида в известное место
async function duelWithBonus(browser, type, at) {
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeDuel');
  await page.waitForTimeout(200);
  await page.check('#bonusSetup');
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.waitForTimeout(120);
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  await page.evaluate(([t, v]) => {
    secret = 90;
    D.bonuses = [{ value: v, type: t, taken: false }];
    history = [];
    renderAll();
  }, [type, at]);
  return page;
}

async function testBonusMode(browser) {
  console.log('\nБонусы в игре с другом');

  // Радиус сигнала «рядом» — от диапазона: три клетки накрывали почти весь
  // десяток и не значили ничего на тысяче
  let page = await duelWithBonus(browser, 'extra', 40);
  const radii = await page.evaluate(() => {
    const out = {};
    [[1, 10], [1, 100], [1, 1000], [-500, 500]].forEach(([lo, hi]) => {
      RANGE_MIN = lo; RANGE_MAX = hi;
      out[lo + '..' + hi] = bonusNearRadius();
    });
    RANGE_MIN = 1; RANGE_MAX = 100;
    return out;
  });
  check('на десятке сигнал за одну клетку', radii['1..10'] === 1, JSON.stringify(radii));
  check('на сотне — за три', radii['1..100'] === 3, JSON.stringify(radii));
  check('на тысяче — за пять', radii['1..1000'] === 5 && radii['-500..500'] === 5,
    JSON.stringify(radii));

  await page.fill('#guessInput', '44');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  check('за четыре клетки бонус не чувствуется', !(await page.locator('#bonusLine').isVisible()));
  await page.fill('#guessInput', '43');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const nearLine = await page.locator('#bonusLine').textContent();
  check('за три клетки виден сигнал', nearLine.indexOf('рядом') >= 0, nearLine);
  // Рядом может лежать и ловушка, поэтому значок больше не подарок
  check('значок сигнала нейтральный', nearLine.indexOf('❓') >= 0 && nearLine.indexOf('🎁') < 0,
    nearLine);
  check('бонус при этом не сработал', await page.evaluate(() => D.bonuses[0].taken === false));
  await done(page);

  // Два про запас — жетоны, а не немедленный лишний ход
  page = await duelWithBonus(browser, 'extra', 40);
  const tokensBefore = await page.evaluate(() => D.tokens.slice());
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const extra = await page.evaluate(() => ({ tokens: D.tokens.slice(), cur: D.cur }));
  check('«Два про запас» даёт взявшему два жетона',
    extra.tokens[0] === tokensBefore[0] + 2, tokensBefore.join() + ' → ' + extra.tokens.join());
  check('сопернику жетонов не добавилось', extra.tokens[1] === tokensBefore[1]);
  check('ход при этом переходит к сопернику', extra.cur === 1, 'ходит ' + extra.cur);
  check('бонус назван в строке под подсказкой',
    (await page.locator('#bonusLine').textContent()).indexOf('Два про запас') >= 0);
  check('взятый бонус больше не сработает', await page.evaluate(() => D.bonuses[0].taken === true));
  await done(page);

  // Туман — соперник до конца раунда не видит ЧУЖИЕ ходы
  page = await duelWithBonus(browser, 'fog', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const fog = await page.evaluate(() => ({
    onRival: D.fog[1] === true, turn: D.cur,
    masked: [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent),
    panel: !document.getElementById('feedbackPanel').classList.contains('hidden'),
    marks: document.getElementById('peff1').textContent
  }));
  check('«Туман» ложится на соперника', fog.onRival && fog.turn === 1, JSON.stringify(fog));
  check('чужой ход в истории скрыт', fog.masked.join() === '•••', fog.masked.join());
  check('подсказка тоже скрыта', fog.panel === false);
  check('на карточке соперника виден значок помехи', fog.marks.indexOf('🙈') >= 0, fog.marks);
  await done(page);

  // Слепой ход — соперник не видит СВОИ ходы, и это до конца раунда
  page = await duelWithBonus(browser, 'blind', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  check('«Слепой ход» ложится на соперника', await page.evaluate(() => D.blind[1] === true));
  await page.fill('#guessInput', '50');       // ходит соперник
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await page.fill('#guessInput', '60');       // ходит взявший
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const blindView = await page.evaluate(() => ({
    still: D.blind[1] === true, viewer: D.cur,
    rows: [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent)
  }));
  check('помеха не снимается после хода', blindView.still, JSON.stringify(blindView));
  check('соперник смотрит на доску своим ходом', blindView.viewer === 1);
  check('его собственный ход закрыт', blindView.rows.indexOf('50') < 0, blindView.rows.join());
  check('чужие ходы он при этом видит',
    blindView.rows.indexOf('60') >= 0 && blindView.rows.indexOf('40') >= 0, blindView.rows.join());
  await done(page);

  // Туман и слепой ход вместе оставили бы игрока совсем без глаз
  page = await duelWithBonus(browser, 'blind', 40);
  await page.evaluate(() => { D.fog[1] = true; renderAll(); });
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const guard = await page.evaluate(() => ({
    blind: D.blind[1], fog: D.fog[1], shown: D.lastBonus, tokens: D.tokens.slice()
  }));
  check('вторая помеха на того же игрока не ложится', guard.blind === false, JSON.stringify(guard));
  check('вместо неё выдан запас ходов', guard.shown === 'extra' && guard.tokens[0] === 3,
    JSON.stringify(guard));
  check('и в строке написано именно это',
    (await page.locator('#bonusLine').textContent()).indexOf('Два про запас') >= 0);
  await done(page);

  // Закрытый ход не должен подменяться прошлым: пока помеха висит, подсказки нет
  page = await duelWithBonus(browser, 'blind', 40);
  await page.evaluate(() => {
    secret = 90;
    history = [{ guess: 10, distance: 80, meta: getFeedback(80), p: 1 },
               { guess: 40, distance: 50, meta: getFeedback(50), p: 0 }];
    D.cur = 0;                 // свой же ход последний — так бывает с жетоном
    D.blind = [true, false];
    renderAll();
  });
  const blinded = await page.evaluate(() => ({
    panel: !document.getElementById('feedbackPanel').classList.contains('hidden'),
    thermo: document.getElementById('thermoFill').style.height,
    filled: [...document.querySelectorAll('#numLineSvg circle')]
      .filter(c => c.getAttribute('fill') !== 'none').length,
    rows: [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent)
  }));
  check('при закрытом ходе подсказки нет вовсе', blinded.panel === false, JSON.stringify(blinded));
  check('и градусник не показывает прошлый ход', blinded.thermo === '8%', blinded.thermo);
  check('и на прямой нет текущей точки', blinded.filled === 0, String(blinded.filled));
  check('чужой ход при этом виден', blinded.rows.indexOf('10') >= 0, blinded.rows.join());

  await page.evaluate(() => { D.blind = [false, false]; renderAll(); });
  check('без помехи подсказка возвращается', await page.evaluate(() =>
    !document.getElementById('feedbackPanel').classList.contains('hidden')));
  await done(page);

  // Бросок в лаву — ход делает случай, но по кнопке и руками того, у кого его отняли
  page = await duelWithBonus(browser, 'lava', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(600);
  const waiting = await page.evaluate(() => ({
    onRival: D.autoLava[1] === true, turn: D.cur, moves: history.length,
    panel: !document.getElementById('forcedTurn').classList.contains('hidden'),
    input: !document.getElementById('guessSection').classList.contains('hidden'),
    text: document.getElementById('forcedText').textContent,
    token: document.getElementById('ptoken1').disabled
  }));
  check('сам собой ход не делается', waiting.moves === 1 && waiting.turn === 1,
    JSON.stringify(waiting));
  check('вместо поля ввода — панель с кнопкой', waiting.panel && !waiting.input,
    JSON.stringify(waiting));
  check('в панели названо, что происходит',
    waiting.text.indexOf('лаву') >= 0 && waiting.text.indexOf('за вас') >= 0, waiting.text);
  check('жетон на отнятом ходе не взвести', waiting.token === true);

  await page.click('#forcedBtn');
  await page.waitForTimeout(400);
  const lava = await page.evaluate(() => {
    const last = history[history.length - 1];
    return { by: last.p, distance: last.distance, moves: history.length,
             turn: D.cur, flag: D.autoLava[1] };
  });
  check('по кнопке за соперника ходит случай', lava.moves === 2 && lava.by === 1,
    JSON.stringify(lava));
  check('ход попал в самый горячий пояс, но не в ответ',
    lava.distance >= 1 && lava.distance <= 3, 'расстояние ' + lava.distance);
  check('помеха снялась и ход вернулся', lava.flag === false && lava.turn === 0,
    JSON.stringify(lava));
  await done(page);

  // Пропуск хода — ловушка: бьёт по тому, кто наступил
  page = await duelWithBonus(browser, 'skip', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  check('«Пропуск хода» ложится на взявшего', await page.evaluate(() => D.skip[0] === true));
  await page.fill('#guessInput', '50');       // соперник ходит как обычно
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const skipping = await page.evaluate(() => ({
    turn: D.cur, moves: history.length,
    panel: !document.getElementById('forcedTurn').classList.contains('hidden'),
    input: !document.getElementById('guessSection').classList.contains('hidden'),
    btn: document.getElementById('forcedBtn').textContent
  }));
  check('свой ход взявший не получает', skipping.turn === 0 && skipping.panel && !skipping.input,
    JSON.stringify(skipping));
  check('кнопка так и называется', skipping.btn === 'Пропустить', skipping.btn);
  await page.click('#forcedBtn');
  await page.waitForTimeout(300);
  const skipped = await page.evaluate(() => ({
    turn: D.cur, moves: history.length, flag: D.skip[0]
  }));
  check('пропуск отдаёт ход сопернику', skipped.turn === 1, JSON.stringify(skipped));
  check('и не добавляет хода в историю', skipped.moves === 2, JSON.stringify(skipped));
  check('пропуск одноразовый', skipped.flag === false);
  await done(page);

  // Подарок сопернику — жетон уходит не туда, куда хотелось
  page = await duelWithBonus(browser, 'gift', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const gift = await page.evaluate(() => D.tokens.slice());
  check('«Подарок сопернику» добавляет жетон сопернику', gift[1] === 2, gift.join());
  check('а взявшему — ничего', gift[0] === 1, gift.join());
  await done(page);

  // Короткая память — до конца раунда видно два хода вместо четырёх
  page = await duelWithBonus(browser, 'memory', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  check('«Короткая память» ложится на взявшего',
    await page.evaluate(() => D.shortMemory[0] === true));
  const memory = await page.evaluate(() => {
    history = [1, 2, 3, 4, 5, 6].map((v, i) => ({
      guess: v * 10, distance: Math.abs(v * 10 - secret),
      meta: getFeedback(Math.abs(v * 10 - secret)), p: i % 2
    }));
    D.cur = 0; renderAll();
    const mine = { rows: document.querySelectorAll('.history-item').length,
                   dots: document.querySelectorAll('#numLineSvg circle').length };
    D.cur = 1; renderAll();
    const his = { rows: document.querySelectorAll('.history-item').length,
                  dots: document.querySelectorAll('#numLineSvg circle').length };
    return { mine, his };
  });
  check('взявший видит два хода вместо четырёх', memory.mine.rows === 2,
    JSON.stringify(memory));
  check('и на прямой у него тоже два', memory.mine.dots === 2, JSON.stringify(memory));
  check('соперника это не касается', memory.his.rows === 4, JSON.stringify(memory));
  await done(page);

  // Ловушек примерно треть — они должны попадаться, но не решать раунд
  page = await duelWithBonus(browser, 'extra', 40);
  const mix = await page.evaluate(() => {
    let good = 0, trap = 0;
    for (let i = 0; i < 200; i++) {
      startRound();
      D.bonuses.forEach(b => (BONUS_TRAP.indexOf(b.type) >= 0 ? trap++ : good++));
    }
    return { good, trap, share: trap / (good + trap) };
  });
  check('ловушек примерно треть', mix.share > 0.25 && mix.share < 0.42,
    (100 * mix.share).toFixed(0) + '%');
  check('и полезных бонусов больше', mix.good > mix.trap);
  await done(page);

  // Сколько бонусов на поле — выбирает игрок
  page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeDuel');
  await page.waitForTimeout(200);
  check('без галочки настройки числа нет', !(await page.locator('#bonusCountField').isVisible()));
  await page.check('#bonusSetup');
  await page.waitForTimeout(200);
  check('с галочкой она появляется', await page.locator('#bonusCountField').isVisible());
  await page.selectOption('#rangeMax', '10');
  await page.waitForTimeout(200);
  const ladder = await page.evaluate(() => ({
    values: [...document.querySelectorAll('#bonusCount option')].map(o => +o.value),
    labels: [...document.querySelectorAll('#bonusCount option')].map(o => o.textContent)
  }));
  check('на десятке больше девяти бонусов не предлагают',
    Math.max(...ladder.values) === 9, ladder.values.join(','));
  check('обычное значение подписано словами',
    ladder.labels.some(l => l.indexOf('как обычно') >= 0), ladder.labels.join(' / '));

  await page.selectOption('#bonusCount', '6');
  await page.waitForTimeout(150);
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  check('выбранное число бонусов и ставится',
    await page.evaluate(() => D.bonuses.length === 6),
    String(await page.evaluate(() => D.bonuses.length)));
  check('выбор запомнился',
    await page.evaluate(() => localStorage.getItem('hc_bonus_n')) === '6');
  check('больше, чем чисел без загаданного, не поместится',
    await page.evaluate(() => { bonusCountChoice = 999; return bonusCount() === rangeCount() - 1; }));
  await done(page);

  // Бонусы не стоят у ответа и не появляются там, где их не просили
  const page2 = await newGame(browser, { user: 'Максим' });
  await page2.click('#tModeDuel');
  await page2.waitForTimeout(200);
  await page2.check('#bonusSetup');
  await page2.waitForTimeout(150);
  await page2.selectOption('#rangeMax', '1000');
  await page2.waitForTimeout(120);
  await page2.click('#tStartMatch');
  await page2.waitForTimeout(250);
  const placed = await page2.evaluate(() => {
    const bad = [];
    for (let i = 0; i < 60; i++) {
      startRound();
      if (!D.bonuses.length) bad.push('раунд без бонусов');
      const seen = new Set();
      D.bonuses.forEach(b => {
        if (b.value === secret) bad.push('бонус на загаданном числе');
        if (b.value < RANGE_MIN || b.value > RANGE_MAX) bad.push('бонус за диапазоном: ' + b.value);
        if (seen.has(b.value)) bad.push('два бонуса на одном числе');
        seen.add(b.value);
      });
    }
    return bad.slice(0, 3);
  });
  check('бонусы не садятся на ответ и не наслаиваются', placed.length === 0, placed.join('; '));

  // Сигнал «рядом» перестаёт что-либо значить, если накрывает половину прямой
  const density = await page2.evaluate(() => {
    const bad = [];
    [10, 20, 50, 100, 250, 500, 1000].forEach(n => {
      RANGE_MIN = 1; RANGE_MAX = n;
      const k = bonusCount();
      if (k < 1) bad.push(n + ': ни одного бонуса');
      if (k > 12) bad.push(n + ': бонусов больше дюжины');
      // На тесном диапазоне зона «рядом» в семь чисел и так накрывает половину
      // прямой — там бонусов должно остаться столько же, сколько было
      const base = Math.max(1, Math.ceil(Math.sqrt(n) / 4));
      if (n <= 20 && k !== base) bad.push(n + ': на тесном диапазоне бонусов стало больше — ' + k);
      // Дюжина — потолок: больше бонусов уже не про поиск, а про толчею
      if (n >= 50 && k < Math.min(base * 2, 12)) bad.push(n + ': на широком диапазоне бонусов мало — ' + k);
    });
    return bad;
  });
  check('бонусов столько, чтобы сигнал ещё что-то значил', density.length === 0, density.join('; '));

  await page2.evaluate(() => { bonusMode = false; startRound(); });
  check('без галочки бонусов нет', await page2.evaluate(() => D.bonuses.length === 0));
  await done(page2);

  // В тренировке бонусов не бывает
  const solo = await newGame(browser, { user: 'Максим' });
  await solo.click('#tModeSolo');
  await solo.waitForTimeout(200);
  await solo.click('#tStartMatch');
  await solo.waitForTimeout(250);
  check('в тренировке строки бонуса нет', !(await solo.locator('#bonusLine').isVisible()));
  check('в тренировке галочки бонусов нет', !(await solo.locator('#bonusSetup').isVisible()));
  await done(solo);
}

async function testScaleOrder(browser) {
  console.log('\nПорядок в шкале расстояний');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);

  const order = await page.evaluate(() => ({
    labels: [...document.querySelectorAll('.legend-item .l-label')].map(e => e.textContent.trim()),
    ranges: [...document.querySelectorAll('.legend-item .l-range')].map(e => e.textContent.trim())
  }));
  check('шкала начинается с лавы', order.labels[0].indexOf('Лава') >= 0, order.labels[0]);
  check('и заканчивается самым холодным',
    order.labels[order.labels.length - 1].indexOf('Очень холодно') >= 0,
    order.labels[order.labels.length - 1]);
  // расстояния должны расти сверху вниз: от ближнего к дальнему
  const firstNums = order.ranges.map(r => parseInt(r));
  check('расстояния идут по возрастанию',
    firstNums.every((v, i) => i === 0 || v > firstNums[i - 1]), order.ranges.join(' '));

  await done(page);
}

async function testVizToggles(browser) {
  console.log('\nКнопки «спрятать градусник» и «спрятать прямую»');
  const page = await newGame(browser, { user: 'Максим' });

  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);

  check('по умолчанию градусник виден', await page.locator('#thermoWrap').isVisible());
  check('по умолчанию прямая видна', await page.locator('#numLine').isVisible());
  check('все три кнопки подсвечены как включённые', await page.evaluate(() =>
    ['toggleThermoBtn', 'toggleLineBtn', 'toggleHintBtn']
      .every(id => document.getElementById(id).classList.contains('on'))));
  check('у кнопок есть подпись для наведения',
    (await page.locator('#toggleThermoBtn').getAttribute('title')) === 'Градусник');

  await page.click('#toggleThermoBtn');
  await page.waitForTimeout(200);
  check('градусник прячется', !(await page.locator('#thermoWrap').isVisible()));
  check('прямая при этом остаётся', await page.locator('#numLine').isVisible());
  check('кнопка градусника погасла', await page.evaluate(() =>
    !document.getElementById('toggleThermoBtn').classList.contains('on')));

  await page.click('#toggleLineBtn');
  await page.waitForTimeout(200);
  check('прямая прячется', !(await page.locator('#numLine').isVisible()));

  // Запись проверяем прямо здесь. Читать её после page.reload() нельзя: страница
  // открыта по file://, и Chromium в этом режиме изредка обнуляет хранилище —
  // проверка мигала не из-за игры, а из-за окружения
  const saved = await page.evaluate(() => ({
    t: localStorage.getItem('hc_show_thermo'), l: localStorage.getItem('hc_show_line') }));
  check('выбор записан в память браузера', saved.t === '0' && saved.l === '0', JSON.stringify(saved));

  await page.click('#toggleThermoBtn');
  await page.click('#toggleLineBtn');
  await page.waitForTimeout(250);
  check('обе возвращаются на место',
    (await page.locator('#thermoWrap').isVisible()) && (await page.locator('#numLine').isVisible()));

  await done(page);

  // Обратную сторону — что записанное читается при запуске — проверяем на чистой
  // странице с заранее выставленной памятью, без перезагрузки
  const page2 = await gameWithStorage(browser, { user: 'Максим' },
    { hc_show_thermo: '0', hc_show_line: '0' });
  await page2.click('#tModeSolo');
  await page2.waitForTimeout(200);
  await page2.click('#tStartMatch');
  await page2.waitForTimeout(250);
  check('при запуске выбор читается из памяти', await page2.evaluate(() =>
    showThermo === false && showLine === false));
  check('спрятанное остаётся спрятанным',
    !(await page2.locator('#thermoWrap').isVisible()) && !(await page2.locator('#numLine').isVisible()));

  await done(page2);
}

async function testPinHelp(browser) {
  console.log('\nПодсказка к PIN и свой PIN');
  const page = await newGame(browser);

  // При регистрации есть поле подсказки, при входе — кнопка «Забыли PIN?»
  await page.click('#tModeRun');
  await page.waitForTimeout(250);
  await page.click('#screenAuthChoice >> text=Зарегистрироваться');
  await page.waitForTimeout(150);
  check('при регистрации есть поле подсказки', await page.locator('#hintField').isVisible());
  check('при регистрации нет кнопки «Забыли PIN?»', !(await page.locator('#tRunForgot').isVisible()));

  await page.fill('#runUsername', 'Максим');
  await page.fill('#runPin', '1234');
  await page.fill('#runHint', 'номер дома');
  await page.click('#runAuthSubmitBtn');
  await page.waitForTimeout(300);
  const reg = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'register_student').pop());
  check('подсказка уходит на сервер при регистрации',
    reg && reg.args.p_hint === 'номер дома', JSON.stringify(reg && reg.args));

  await done(page);

  // На экране входа подсказку можно запросить по имени
  const page2 = await newGame(browser);
  await page2.click('#tModeRun');
  await page2.waitForTimeout(250);
  await page2.click('#screenAuthChoice >> text=Войти');
  await page2.waitForTimeout(150);
  check('при входе есть кнопка «Забыли PIN?»', await page2.locator('#tRunForgot').isVisible());
  check('при входе нет поля подсказки', !(await page2.locator('#hintField').isVisible()));

  await page2.click('#tRunForgot');
  await page2.waitForTimeout(200);
  check('без имени просят его ввести',
    (await page2.locator('#runAuthError').textContent()).length > 0);

  await page2.fill('#runUsername', 'Максим');
  await page2.click('#tRunForgot');
  await page2.waitForTimeout(300);
  const shown = await page2.locator('#runAuthError').textContent();
  check('подсказка показывается', shown.includes('номер дома'), shown.trim());
  await done(page2);

  // Если подсказки нет — честно об этом говорим
  const page3 = await newGame(browser, { hint: null });
  await page3.click('#tModeRun');
  await page3.waitForTimeout(250);
  await page3.click('#screenAuthChoice >> text=Войти');
  await page3.waitForTimeout(150);
  await page3.fill('#runUsername', 'Аня');
  await page3.click('#tRunForgot');
  await page3.waitForTimeout(300);
  check('при отсутствии подсказки сообщается об этом',
    (await page3.locator('#runAuthError').textContent()).includes('подсказки нет'));
  await done(page3);

  // Свой PIN виден в окне аккаунта
  const page4 = await newGame(browser, { user: 'Максим' });
  await page4.click('#tModeRun');
  await page4.waitForTimeout(300);
  await page4.click('#accountChip');
  await page4.waitForTimeout(200);
  check('в окне аккаунта видно имя',
    (await page4.locator('#accountName').textContent()).includes('Максим'));
  check('PIN спрятан до нажатия',
    !(await page4.locator('#tShowPin').textContent()).includes('1234'));
  await page4.click('#tShowPin');
  await page4.waitForTimeout(150);
  check('свой PIN показывается по нажатию',
    (await page4.locator('#tShowPin').textContent()).includes('1234'));
  check('выход из аккаунта остался на месте', await page4.locator('#tLogoutConfirm').isVisible());
  await done(page4);
}

// Конец раунда: ответ на прямой, счётчик ходов, свёрнутая шкала
async function testEndOfRound(browser) {
  console.log('\nИтоги раунда');
  const page = await newGame(browser, { user: 'Максим' });

  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  await page.selectOption('#rangeMax', '100');
  await page.waitForTimeout(150);
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  await page.evaluate(() => { secret = 40; MAX_GUESSES = 3; renderAll(); });

  const nl = () => page.evaluate(() => {
    const svg = document.getElementById('numLineSvg');
    const marks = [...svg.querySelectorAll('circle')].map(c => c.getAttribute('fill'));
    return {
      answer: marks.filter(f => f === '#4ADE80').length,
      hollow: marks.filter(f => f === 'none').length,
      current: marks.filter(f => f === '#0f1430').length,
      labels: [...svg.querySelectorAll('text')].map(t => t.textContent),
      // Подпись ответа — единственная зелёная: деления на прямой серые
      answerLabels: [...svg.querySelectorAll('text')]
        .filter(t => t.getAttribute('fill') === '#4ADE80').map(t => t.textContent)
    };
  });

  await page.fill('#guessInput', '10');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const mid = await nl();
  check('пока идёт партия, ответ на прямой не отмечен', mid.answer === 0, JSON.stringify(mid));
  check('текущая догадка отмечена залитой точкой', mid.current === 1);
  check('счётчик показывает остаток попыток',
    (await page.locator('#attemptsLabel').textContent()).includes('Попыток'));

  // Проигрыш: два холодных хода, потом мимо в последней догадке
  await page.fill('#guessInput', '90');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  await page.fill('#guessInput', '95');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  check('последняя догадка открывает поле ответа', await page.locator('#finalBox').isVisible());
  check('шкала расстояний ещё раскрыта: партия не кончилась',
    await page.evaluate(() => document.getElementById('scaleBox').open));
  await page.fill('#finalInput', '38');
  await page.click('#tFinalSubmit');
  await page.waitForTimeout(300);

  const lost = await nl();
  check('после проигрыша ответ отмечен на прямой', lost.answer === 1, JSON.stringify(lost));
  check('ответ подписан числом', lost.answerLabels.join() === '40', lost.answerLabels.join(' '));
  check('залитой точки догадки больше нет', lost.current === 0);
  check('прошлые догадки остались полыми кружками', lost.hollow === 3, 'кружков ' + lost.hollow);
  const lostLabel = await page.locator('#attemptsLabel').textContent();
  check('вместо остатка попыток — сколько ходов ушло', lostLabel.trim() === '4 хода', lostLabel);
  check('шкала расстояний свернулась на итогах',
    !(await page.evaluate(() => document.getElementById('scaleBox').open)));

  // Новая игра возвращает шкалу и обычный счётчик
  await page.click('#resultBox .btn');
  await page.waitForTimeout(300);
  check('в новой партии шкала снова раскрыта',
    await page.evaluate(() => document.getElementById('scaleBox').open));
  check('в новой партии счётчик снова про попытки',
    (await page.locator('#attemptsLabel').textContent()).includes('Попыток'));

  // Победа: ответ и догадка — одно и то же число
  await page.evaluate(() => { secret = 40; renderAll(); });
  await page.fill('#guessInput', '25');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(300);
  const won = await nl();
  check('после победы ответ отмечен на прямой', won.answer === 1, JSON.stringify(won));
  check('и подписан он ответом, а не догадкой', won.answerLabels.join() === '40',
    won.answerLabels.join(' '));
  const wonLabel = await page.locator('#attemptsLabel').textContent();
  check('после победы счётчик показывает число ходов', wonLabel.trim() === '2 хода', wonLabel);
  check('шкала свернулась и после победы',
    !(await page.evaluate(() => document.getElementById('scaleBox').open)));

  await done(page);
}

// Свёрнутую вручную шкалу игра не раскрывает обратно
async function testScaleMemory(browser) {
  console.log('\nПамять шкалы расстояний');
  const page = await gameWithStorage(browser, { user: 'Максим' }, { hc_scale_open: '0' });
  await page.click('#tModeSolo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  check('свёрнутая шкала так и остаётся свёрнутой',
    !(await page.evaluate(() => document.getElementById('scaleBox').open)));

  await page.click('#scaleBox summary');
  await page.waitForTimeout(200);
  check('щелчок игрока раскрывает шкалу',
    await page.evaluate(() => document.getElementById('scaleBox').open));
  check('и его выбор запоминается',
    await page.evaluate(() => localStorage.getItem('hc_scale_open')) === '1');
  await done(page);
}

// Галочки нарисованы свои: системный чекбокс — белый квадрат на тёмном экране
async function testCheckboxLook(browser) {
  console.log('\nВид галочек');
  const page = await newGame(browser);
  await page.click('#tModeSolo');
  await page.waitForTimeout(250);

  const box = await page.evaluate(() => {
    const el = document.getElementById('frostSetup');
    const cs = getComputedStyle(el);
    const rgb = cs.backgroundColor.match(/[\d.]+/g).map(Number);
    return { appearance: cs.appearance || cs.webkitAppearance, bg: cs.backgroundColor,
             radius: parseFloat(cs.borderRadius), light: (rgb[0] + rgb[1] + rgb[2]) / 3,
             alpha: rgb.length > 3 ? rgb[3] : 1 };
  });
  check('галочка не системная', box.appearance === 'none', box.appearance);
  check('в покое галочка не светится белым', box.light < 200 || box.alpha < 0.2, JSON.stringify(box));
  check('у галочки скруглённый край', box.radius >= 3, box.radius + 'px');

  await page.check('#frostSetup');
  await page.waitForTimeout(400);
  const on = await page.evaluate(() => {
    const el = document.getElementById('frostSetup');
    const tick = getComputedStyle(el, '::after');
    return { rgb: getComputedStyle(el).backgroundColor.match(/[\d.]+/g).map(Number),
             content: tick.content, side: parseFloat(tick.borderBottomWidth),
             turn: tick.transform };
  });
  check('включённая галочка синяя',
    Math.abs(on.rgb[0] - 99) < 6 && Math.abs(on.rgb[1] - 102) < 6 && Math.abs(on.rgb[2] - 241) < 6,
    on.rgb.join(','));
  // Галка — это две стороны рамки, повёрнутые на 45°: проверяем и то и другое
  check('и в ней есть галка',
    on.content !== 'none' && on.side >= 1.5 && /matrix/.test(on.turn), JSON.stringify(on));
  await done(page);
}

// Точка на прямой переезжает, а не перепрыгивает
async function testDotMotion(browser) {
  console.log('\nДвижение точки на прямой');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  await page.selectOption('#rangeMax', '100');
  await page.waitForTimeout(150);
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  // Ответ намеренно не посередине: иначе догадки 10 и 90 дают одно и то же
  // расстояние, столбик не двигается, и сверять его с точкой не в чем
  await page.evaluate(() => { secret = 20; MAX_GUESSES = 9; renderAll(); });

  const anim = () => page.evaluate(() => {
    const dot = [...document.querySelectorAll('#numLineSvg circle')]
      .find(c => c.getAttribute('fill') === '#0f1430');
    const label = [...document.querySelectorAll('#numLineSvg text')].pop();
    const a = dot && dot.querySelector('animate[attributeName="cx"]');
    return {
      cx: dot ? dot.getAttribute('cx') : null,
      from: a ? a.getAttribute('from') : null,
      to: a ? a.getAttribute('to') : null,
      fade: !!(dot && dot.querySelector('animate[attributeName="opacity"]')),
      labelMoves: !!(label && label.querySelector('animate[attributeName="x"]'))
    };
  });

  await page.fill('#guessInput', '10');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const first = await anim();
  check('первый ход не едет — ему неоткуда', first.from === null, JSON.stringify(first));
  check('зато он проявляется', first.fade, JSON.stringify(first));

  // Меряем не атрибуты, а то, где точка на самом деле: SMIL легко объявить и
  // не запустить — атрибуты при этом выглядят правильными, а точка не едет
  await page.fill('#guessInput', '90');
  const travel = await page.evaluate(() => new Promise(res => {
    const out = [];
    const t0 = performance.now();
    document.getElementById('tSubmitGuess').click();
    const tick = () => {
      const dot = [...document.querySelectorAll('#numLineSvg circle')]
        .find(c => c.getAttribute('fill') === '#0f1430');
      if (dot) out.push({ t: Math.round(performance.now() - t0),
                          now: Math.round(dot.cx.animVal.value),
                          end: Math.round(dot.cx.baseVal.value),
                          h: document.getElementById('thermoFill')
                               .getBoundingClientRect().height });
      if (performance.now() - t0 < 1100) requestAnimationFrame(tick); else res(out);
    };
    requestAnimationFrame(tick);
  }));
  const second = await anim();
  const path = travel.map(p => p.now);
  const end = travel[travel.length - 1];
  check('второй ход едет от первого', second.from === first.cx, JSON.stringify(second));
  check('точка действительно двигается, а не появляется на месте',
    path.length > 3 && end.end - path[0] > 20, path.slice(0, 6).join(' → ') + ' … ' + end.now);
  check('едет она только вперёд', path.every((v, i) => i === 0 || v >= path[i - 1]),
    path.join(' '));
  check('и доезжает ровно до своего места', end.now === end.end, end.now + ' из ' + end.end);
  check('подпись едет вместе с точкой', second.labelMoves);

  // Раньше точка проскакивала за треть секунды — второкласснику не уследить
  const at300 = travel.find(p => p.t >= 300) || end;
  check('через треть секунды точка ещё в пути', at300.now < end.end,
    at300.now + ' из ' + end.end + ' на ' + at300.t + 'мс');

  // Градусник и точка показывают один и тот же ход. Сравнивать момент приезда
  // нельзя: у столбика ход всего в десяток пикселей, и последний из них
  // достигается заметно раньше конца кривой. Сравниваем долю пройденного пути
  // в один и тот же момент — это и есть «едут вместе»
  const from = travel[0], to = travel[travel.length - 1];
  const mid = travel.find(p => p.t >= 300) || to;
  const part = (a, b, c) => (b - a) === 0 ? null : (c - a) / (b - a);
  const dotPart = part(from.now, to.now, mid.now);
  const thermoPart = part(from.h, to.h, mid.h);
  check('столбику градусника было что показать', thermoPart !== null,
    Math.round(from.h) + 'px → ' + Math.round(to.h) + 'px');
  check('градусник и точка идут в ногу', Math.abs(dotPart - thermoPart) <= 0.1,
    'на ' + mid.t + 'мс точка прошла ' + Math.round(100 * dotPart) +
    '%, градусник ' + Math.round(100 * thermoPart) + '%');

  // Длительность задана в одном месте — в CSS, рядом с переходом градусника
  const dur = await page.evaluate(() => {
    const css = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--move-dur'));
    const thermo = parseFloat(getComputedStyle(document.getElementById('thermoFill'))
      .transitionDuration);
    const svg = [...document.querySelectorAll('#numLineSvg animate')]
      .map(a => parseFloat(a.getAttribute('dur')));
    return { css, thermo, svg };
  });
  check('градусник берёт длительность из общей переменной', dur.thermo === dur.css,
    JSON.stringify(dur));
  check('и движение на прямой — оттуда же',
    dur.svg.length === 0 || dur.svg.every(v => v === dur.css), JSON.stringify(dur));
  check('движение заметно дольше трети секунды', dur.css >= 0.6, dur.css + 'с');

  // Перерисовка без хода не должна дёргать прямую
  await page.waitForTimeout(500);
  await page.click('#toggleThermoBtn');
  await page.waitForTimeout(200);
  const idle = await anim();
  check('без нового хода точка стоит', idle.from === null && !idle.fade, JSON.stringify(idle));
  check('и остаётся на месте последнего хода', idle.cx === second.cx);
  await page.click('#toggleThermoBtn');

  // С отключённой анимацией в системе не двигается ничего
  await done(page);
  const calm = await browser.newContext({ viewport: PHONE, reducedMotion: 'reduce' });
  const p2 = await calm.newPage();
  await applyStub(p2, { user: 'Максим' });
  await p2.goto(GAME_URL);
  await p2.waitForTimeout(300);
  await p2.click('#tModeSolo');
  await p2.click('#tStartMatch');
  await p2.waitForTimeout(300);
  await p2.evaluate(() => { secret = 500; renderAll(); });
  for (const g of [100, 900]) {
    await p2.fill('#guessInput', String(g));
    await p2.click('#tSubmitGuess');
    await p2.waitForTimeout(200);
  }
  const off = await p2.evaluate(() => document.querySelectorAll('#numLineSvg animate').length);
  check('при выключенной анимации прямая не двигается', off === 0, 'анимаций ' + off);
  await calm.close();
}

// Имя ученика видно на хабе, а не только по нажатию на чип
async function testHubGreeting(browser) {
  console.log('\nИмя ученика на хабе');
  const page = await newGame(browser, { user: 'Александра' });
  await page.click('#tModeRun');
  await page.waitForTimeout(400);

  // Читаем через evaluate: если блока нет вовсе, проверка должна упасть, а не
  // уронить весь прогон ожиданием несуществующего элемента
  const greet = sel => page.evaluate(s => {
    const el = document.querySelector(s);
    return el && el.offsetParent !== null ? el.textContent : null;
  }, sel);

  check('приветствие видно', (await greet('#runGreeting')) !== null);
  const text = (await greet('#runGreeting')) || '';
  check('в нём названо имя', text.includes('Александра'), text);
  check('имя выделено', (await greet('#runGreeting strong')) === 'Александра');

  await page.selectOption('#langSwitcher', 'en');
  await page.waitForTimeout(250);
  const en = (await greet('#runGreeting')) || '';
  check('при смене языка приветствие переводится', en.includes('Playing as') && en.includes('Александра'), en);

  // Имя не должно ломать строку и не должно выдавливать кнопку
  await page.selectOption('#langSwitcher', 'ru');
  await page.waitForTimeout(200);
  const fit = await page.evaluate(() => {
    const el = document.getElementById('runGreeting');
    if (!el) return { lines: -1, overflow: document.documentElement.scrollWidth - innerWidth };
    return { lines: Math.round(el.getBoundingClientRect().height),
             overflow: document.documentElement.scrollWidth - innerWidth };
  });
  check('приветствие в одну строку', fit.lines > 0 && fit.lines <= 22, fit.lines + 'px');
  check('и не растягивает экран вбок', fit.overflow === 0);

  // Во время самой игры приветствие не мешается
  await page.click('#tRunStart');
  await page.waitForTimeout(300);
  check('в игре приветствия не видно', (await greet('#runGreeting')) === null);
  await done(page);
}

// Итог раунда — первое, что видно после статуса, а не середина экрана
async function testResultPlacement(browser) {
  console.log('\nМесто карточки результата');

  const geom = page => page.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null;
      const b = e.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom) }; };
    return { card: r('#resultBox'), bar: r('.info-bar'), thermo: r('#thermoWrap'),
             line: r('#numLine'), histTitle: r('.history-title'),
             view: innerHeight };
  });

  // Тренировка, победа
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  await page.selectOption('#rangeMax', '100');
  await page.waitForTimeout(150);
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  await page.evaluate(() => { secret = 40; MAX_GUESSES = 8; renderAll(); });
  for (const g of [70, 20, 40]) {
    await page.fill('#guessInput', String(g));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(300);

  const g = await geom(page);
  check('карточка идёт сразу за строкой статуса', g.card.top < g.thermo.top && g.card.top < g.line.top,
    JSON.stringify(g));
  check('и не заезжает на саму строку статуса', g.card.top >= g.bar.bottom, g.bar.bottom + ' / ' + g.card.top);
  check('карточка видна целиком, без прокрутки', g.card.bottom <= g.view,
    g.card.bottom + ' при экране ' + g.view);
  check('прямая под ней не слипается с историей', g.histTitle.top - g.line.bottom >= 10,
    (g.histTitle.top - g.line.bottom) + 'px');

  // Во время игры карточки нет, и прямая стоит как стояла
  await page.click('#resultBox .btn');
  await page.waitForTimeout(300);
  check('во время игры карточки не видно', !(await page.locator('#resultBox').isVisible()));
  const playing = await page.evaluate(() =>
    document.getElementById('board').classList.contains('over'));
  check('признак конца партии снят', !playing);
  await done(page);

  // Дуэль: тот же порядок
  const duel = await newGame(browser, { user: 'Максим' });
  await duel.click('#tModeDuel');
  await duel.waitForTimeout(200);
  await duel.selectOption('#rangeMax', '100');
  await duel.waitForTimeout(150);
  await duel.click('#tStartMatch');
  await duel.waitForTimeout(300);
  await duel.evaluate(() => { secret = 40; renderAll(); });
  for (const guess of [70, 20, 40]) {
    await duel.fill('#guessInput', String(guess));
    await duel.click('#tSubmitGuess');
    await duel.waitForTimeout(250);
  }
  await duel.waitForTimeout(300);
  const d = await geom(duel);
  check('в дуэли итог раунда тоже сверху', d.card.top < d.thermo.top && d.card.top < d.line.top,
    JSON.stringify(d));
  await done(duel);

  // На невысоком телефоне карточка целиком в первом экране
  const small = await browser.newContext({ viewport: { width: 360, height: 640 } });
  const p3 = await small.newPage();
  await applyStub(p3, { user: 'Максим' });
  await p3.goto(GAME_URL);
  await p3.waitForTimeout(300);
  await p3.click('#tModeSolo');
  await p3.click('#tStartMatch');
  await p3.waitForTimeout(300);
  await p3.evaluate(() => { secret = 500; MAX_GUESSES = 8; renderAll(); });
  for (const guess of [100, 900, 500]) {
    await p3.fill('#guessInput', String(guess));
    await p3.click('#tSubmitGuess');
    await p3.waitForTimeout(200);
  }
  await p3.waitForTimeout(300);
  const s3 = await geom(p3);
  check('на маленьком экране итог виден целиком', s3.card.bottom <= s3.view,
    s3.card.bottom + ' при экране ' + s3.view);
  await small.close();
}

// Онлайн: друзья
async function testFriends(browser) {
  console.log('\nОнлайн: друзья');

  // Без аккаунта режим ведёт на вход, а после входа — обратно в онлайн
  let page = await newGame(browser);
  await page.click('#tModeOnline');
  await page.waitForTimeout(250);
  check('без аккаунта просят войти', await page.locator('#screenAuthChoice').isVisible());
  await page.click('#tRunChoiceRegister');
  await page.waitForTimeout(200);
  await page.fill('#runUsername', 'Лев');
  await page.fill('#runPin', '1234');
  await page.click('#runAuthSubmitBtn');
  await page.waitForTimeout(400);
  check('после входа возвращаемся в онлайн, а не в рейтинг',
    await page.locator('#screenOnline').isVisible());
  check('на экране написано, кто играет',
    (await page.locator('#onlineGreeting').textContent()).includes('Лев'));
  check('пустой список объясняет себя',
    (await page.locator('#friendsNote').textContent()).length > 0,
    await page.locator('#friendsNote').textContent());
  await done(page);

  // Поиск
  page = await newGame(browser, { user: 'Лев' });
  await page.click('#tModeOnline');
  await page.waitForTimeout(400);
  check('со входом сразу открывается онлайн', await page.locator('#screenOnline').isVisible());

  await page.fill('#friendSearch', 'к');
  await page.click('#tFindBtn');
  await page.waitForTimeout(200);
  const short = await page.locator('#searchNote').textContent();
  check('одна буква — поиска нет', short.length > 0 && (await page.evaluate(() =>
    window.__rpcCalls.filter(c => c.name === 'find_students').length)) === 0, short);

  await page.evaluate(() => {
    window.__found = [{ username: 'Кира', best_run_score: 5200, relation: null },
                      { username: 'Ким', best_run_score: 0, relation: 'friend' },
                      { username: 'Кузя', best_run_score: 10, relation: 'outgoing' }];
  });
  await page.fill('#friendSearch', 'ки');
  await page.click('#tFindBtn');
  await page.waitForTimeout(300);
  const search = await page.evaluate(() => ({
    sent: (window.__rpcCalls.filter(c => c.name === 'find_students').pop() || {}).args,
    rows: [...document.querySelectorAll('#searchResults .friend-row')].map(r => ({
      name: r.dataset.name, rel: r.dataset.relation,
      btns: [...r.querySelectorAll('.fr-btn')].map(b => b.textContent)
    }))
  }));
  check('запрос ушёл с именем и PIN',
    search.sent.p_query === 'ки' && search.sent.p_username === 'Лев' && search.sent.p_pin === '1234',
    JSON.stringify(search.sent));
  check('найденных показали троих', search.rows.length === 3, JSON.stringify(search.rows));
  check('незнакомого можно добавить',
    search.rows[0].btns.join() === 'Добавить', JSON.stringify(search.rows[0]));
  check('другу предлагают вызвать и убрать, а не добавить',
    search.rows[1].btns.join() === 'Вызвать,Убрать', JSON.stringify(search.rows[1]));
  check('на висящую заявку кнопки нет',
    search.rows[2].btns.length === 0, JSON.stringify(search.rows[2]));

  // Добавление
  await page.evaluate(() => { window.__found[0].relation = 'outgoing'; });
  await page.click('#searchResults .friend-row:first-child .fr-btn');
  await page.waitForTimeout(400);
  const added = await page.evaluate(() => ({
    sent: (window.__rpcCalls.filter(c => c.name === 'send_friend_request').pop() || {}).args,
    note: document.getElementById('searchNote').textContent,
    rel: document.querySelector('#searchResults .friend-row').dataset.relation
  }));
  check('заявка ушла на выбранное имя', added.sent.p_to === 'Кира', JSON.stringify(added.sent));
  check('игроку сказали, что заявка ушла', added.note.includes('Кира'), added.note);
  check('строка сразу перерисовалась в «ждёт ответа»', added.rel === 'outgoing', added.rel);
  await done(page);

  // Список: входящие первыми
  page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__friends = [{ username: 'Яна', relation: 'outgoing' },
                        { username: 'Аня', relation: 'friend' },
                        { username: 'Кира', relation: 'incoming' },
                        { username: 'Боря', relation: 'friend' }];
  });
  await page.click('#tModeOnline');
  await page.waitForTimeout(400);
  const list = await page.evaluate(() =>
    [...document.querySelectorAll('#friendsList .friend-row')].map(r => r.dataset.name + ':' + r.dataset.relation));
  check('входящие заявки стоят первыми',
    list.join(' ') === 'Кира:incoming Аня:friend Боря:friend Яна:outgoing', list.join(' '));

  // Принять
  await page.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' },
                        { username: 'Аня', relation: 'friend' },
                        { username: 'Боря', relation: 'friend' },
                        { username: 'Яна', relation: 'outgoing' }];
  });
  await page.click('#friendsList .friend-row:first-child .fr-btn.yes');
  await page.waitForTimeout(400);
  const accepted = await page.evaluate(() => ({
    sent: (window.__rpcCalls.filter(c => c.name === 'respond_friend_request').pop() || {}).args,
    rel: document.querySelector('#friendsList .friend-row').dataset.relation
  }));
  check('принятие ушло на сервер с согласием',
    accepted.sent.p_from === 'Кира' && accepted.sent.p_accept === true, JSON.stringify(accepted.sent));
  check('список обновился сам', accepted.rel === 'friend', accepted.rel);
  await done(page);

  // Ошибки сервера читаются по-человечески
  page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__found = [{ username: 'Максим', best_run_score: 0, relation: null }];
  });
  await page.click('#tModeOnline');
  await page.waitForTimeout(400);
  await page.fill('#friendSearch', 'ма');
  await page.click('#tFindBtn');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    window.__rpcError = { name: 'send_friend_request', message: 'recently_declined' };
  });
  await page.click('#searchResults .friend-row:first-child .fr-btn');
  await page.waitForTimeout(400);
  const err = await page.locator('#searchNote').textContent();
  check('отказ объясняют словами, а не кодом',
    err.indexOf('Заявку отклонили') >= 0 && err.indexOf('recently_declined') < 0, err);
  check('строка ошибки подсвечена',
    await page.locator('#searchNote').evaluate(e => e.classList.contains('bad')));
  await done(page);

  // Опрос идёт только пока экран открыт
  page = await newGame(browser, { user: 'Лев' });
  await page.click('#tModeOnline');
  await page.waitForTimeout(400);
  check('опрос запущен', await page.evaluate(() => friendsTimer !== null));
  await page.click('#tOnlineBack');
  await page.waitForTimeout(300);
  check('после выхода опрос остановлен', await page.evaluate(() => friendsTimer === null));
  check('вышли в меню', await page.locator('#screenMode').isVisible());
  await done(page);
}

// Онлайн: сам матч
async function testOnlineMatch(browser) {
  console.log('\nОнлайн: матч');

  const page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' }];
    window.__matches = [{ id: 1, other: 'Кира', seat: 1, status: 'invited',
                          round: 1, wins: [0, 0], my_turn: false }];
  });
  await page.click('#tModeOnline');
  await page.waitForTimeout(400);

  // Вызов приходит и его можно принять
  const invite = await page.evaluate(() => {
    const r = document.querySelector('#gamesList .friend-row');
    return { state: r && r.dataset.state,
             btns: r ? [...r.querySelectorAll('.fr-btn')].map(b => b.textContent) : [] };
  });
  check('входящий вызов виден', invite.state === 'incoming', JSON.stringify(invite));
  check('и его можно принять или отклонить',
    invite.btns.join() === 'Принять,Отклонить', invite.btns.join());

  await page.click('#gamesList .friend-row .fr-btn.yes');
  await page.waitForTimeout(500);
  check('после принятия открывается матч', await page.locator('#screenGame').isVisible());
  check('на доске имена обоих',
    (await page.locator('#pname0').textContent()).includes('Лев') &&
    (await page.locator('#pname1').textContent()).includes('Кира'));

  // Ответ не виден, пока раунд идёт
  const hidden = await page.evaluate(() => ({ secret: secret, seat: online.seat, cur: D.cur }));
  check('загаданное число клиенту не известно', hidden.secret === 0, String(hidden.secret));
  check('своё место за доской известно', hidden.seat === 0);

  // Ход
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(400);
  const moved = await page.evaluate(() => ({
    rows: [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent),
    cur: D.cur,
    inputHidden: document.getElementById('guessSection').classList.contains('hidden'),
    distance: history[0].distance,
    label: document.getElementById('feedbackLabel').textContent
  }));
  check('ход записан', moved.rows.join() === '40', moved.rows.join());
  check('очередь перешла к сопернику', moved.cur === 1, String(moved.cur));
  check('пока ходит соперник, поля ввода нет', moved.inputHidden);
  check('расстояние клиенту не приходит', moved.distance === null, String(moved.distance));
  check('пояс при этом показан', moved.label.length > 0, moved.label);

  // Отказ сервера должен быть виден. Экран сам по себе уже не даёт сходить не в
  // свою очередь — поле ввода спрятано, — поэтому расходим клиент с сервером:
  // клиент думает, что его очередь, а сервер считает иначе
  await page.evaluate(() => {
    window.__match.cur = 1;   // на сервере ходит соперник
    D.cur = 0;                // а клиент думает, что ходит он
    renderAll();
    document.getElementById('guessInput').value = '50';
    onlineGuess();
  });
  await page.waitForTimeout(400);
  const refused = await page.evaluate(() => ({
    note: document.getElementById('matchNote').textContent,
    shown: !document.getElementById('matchNote').classList.contains('hidden'),
    moves: window.__match.moves.length
  }));
  check('отказ сервера объясняется словами',
    refused.shown && refused.note.indexOf('соперник') >= 0, JSON.stringify(refused));
  check('и ход на сервере не появился', refused.moves === 1, String(refused.moves));

  // Победа открывает число
  await page.evaluate(() => { window.__match.cur = 0; D.cur = 0; renderAll(); });
  await page.fill('#guessInput', '42');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(500);
  const won = await page.evaluate(() => ({
    secret: secret, over: D.roundOver, winner: D.roundWinner,
    result: document.getElementById('resultBox').textContent
  }));
  check('после победы число открывается', won.secret === 42, String(won.secret));
  check('раунд закрыт и победитель назван', won.over && won.winner === 0, JSON.stringify(won));
  check('итог раунда показан', won.result.indexOf('42') >= 0, won.result);

  // Следующий раунд
  await page.click('#resultBox .btn');
  await page.waitForTimeout(500);
  const next = await page.evaluate(() => ({
    round: D.round, over: D.roundOver, secret: secret,
    moves: history.length, tokens: D.tokens.slice()
  }));
  check('следующий раунд начался', next.round === 2 && !next.over, JSON.stringify(next));
  check('и число снова спрятано', next.secret === 0, String(next.secret));
  check('ходы прошлого раунда убраны', next.moves === 0);
  check('жетоны вернулись', next.tokens.join() === '1,1', next.tokens.join());

  // Опрос идёт, пока открыт матч, и прекращается при выходе
  check('матч опрашивается', await page.evaluate(() => matchTimer !== null));
  await page.click('#tMenu');
  await page.waitForTimeout(400);
  check('выход возвращает к друзьям, а не в меню',
    await page.locator('#screenOnline').isVisible());
  check('опрос матча остановлен', await page.evaluate(() => matchTimer === null));
  check('матч при этом не закрыт',
    await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'leave_match').length) === 0);
  await done(page);

  // Вызов друга
  const p2 = await newGame(browser, { user: 'Лев' });
  await p2.evaluate(() => { window.__friends = [{ username: 'Кира', relation: 'friend' }]; });
  await p2.click('#tModeOnline');
  await p2.waitForTimeout(400);
  check('окно вызова закрыто, пока не позвали',
    !(await p2.locator('#challengeBox').isVisible()));
  await p2.click('#friendsList .friend-row .fr-btn.yes');
  await p2.waitForTimeout(250);
  check('кнопка «Вызвать» открывает настройку', await p2.locator('#challengeBox').isVisible());
  check('в заголовке названо имя',
    (await p2.locator('#challengeTitle').textContent()).includes('Кира'));

  await p2.selectOption('#chRange', '1000');
  await p2.check('#chFrost');
  await p2.selectOption('#chWins', '5');
  await p2.click('#tChSend');
  await p2.waitForTimeout(400);
  const sent = await p2.evaluate(() =>
    (window.__rpcCalls.filter(c => c.name === 'challenge_friend').pop() || {}).args);
  check('вызов ушёл с выбранными условиями',
    sent.p_to === 'Кира' && sent.p_range === 1000 && sent.p_frost === true && sent.p_wins === 5,
    JSON.stringify(sent));
  check('окно настройки закрылось', !(await p2.locator('#challengeBox').isVisible()));
  await done(p2);
}

// Онлайн: часы, потерянный ход и бонусы
async function testOnlineClock(browser) {
  console.log('\nОнлайн: часы и бонусы');

  const page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' }];
    window.__matches = [{ id: 1, other: 'Кира', seat: 0, status: 'active',
                          round: 1, wins: [0, 0], my_turn: true }];
  });
  await page.click('#tModeOnline');
  await page.waitForTimeout(400);
  await page.click('#gamesList .friend-row .fr-btn');
  await page.waitForTimeout(600);

  // Часы
  const clock = await page.evaluate(() => ({
    shown: !document.getElementById('turnClock').classList.contains('hidden'),
    text: document.getElementById('turnClock').textContent,
    seconds: online.turnSeconds
  }));
  check('часы хода видны', clock.shown, JSON.stringify(clock));
  check('на ход тридцать секунд', clock.seconds === 30, String(clock.seconds));
  check('написано, что ход ваш', clock.text.indexOf('Ваш ход') >= 0, clock.text);

  // Часы тикают между ответами сервера
  const before = await page.evaluate(() => document.getElementById('turnClock').textContent);
  await page.waitForTimeout(1300);
  const after = await page.evaluate(() => document.getElementById('turnClock').textContent);
  check('секунды идут, не дожидаясь сервера', before !== after, before + ' → ' + after);

  // Мало времени — цвет меняется. Опрос останавливаем: он вернул бы полные
  // тридцать секунд и перебил подставленный срок
  await page.evaluate(() => { stopMatchPoll(); online.deadlineAt = Date.now() + 5000; renderClock(); });
  await page.waitForTimeout(100);
  check('под конец часы краснеют',
    await page.locator('#turnClock').evaluate(e => e.classList.contains('low')));

  // Ход соперника подписан иначе
  await page.evaluate(() => { D.cur = 1; renderClock(); });
  check('чужой ход подписан иначе',
    (await page.locator('#turnClock').textContent()).indexOf('соперник') >= 0);

  // Потерянный по времени ход виден в истории
  await page.evaluate(() => {
    window.__match.moves = [{ seat: 1, timeout: true }, { seat: 0, guess: 30, tier: 5 }];
    window.__match.cur = 0;
    refreshMatch();
  });
  await page.waitForTimeout(400);
  const rows = await page.evaluate(() => ({
    labels: [...document.querySelectorAll('.history-item .h-label')].map(e => e.textContent),
    guesses: [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent),
    dots: document.querySelectorAll('#numLineSvg circle').length
  }));
  check('пропуск по времени показан строкой',
    rows.labels.some(l => l.indexOf('время вышло') >= 0), rows.labels.join(' / '));
  check('вместо числа у него прочерк', rows.guesses.indexOf('—') >= 0, rows.guesses.join());
  check('на прямой пропуск точкой не рисуется', rows.dots === 1, String(rows.dots));
  await done(page);

  // Закрытый ход приезжает без числа, и клиент его не выдумывает
  const p2 = await newGame(browser, { user: 'Лев' });
  await p2.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' }];
    window.__matches = [{ id: 1, other: 'Кира', seat: 0, status: 'active',
                          round: 1, wins: [0, 0], my_turn: true }];
    window.__match.moves = [{ seat: 1, hidden: true }];
    window.__match.fog = [true, false];
    window.__match.cur = 0;
  });
  await p2.click('#tModeOnline');
  await p2.waitForTimeout(400);
  await p2.click('#gamesList .friend-row .fr-btn');
  await p2.waitForTimeout(600);
  const fog = await p2.evaluate(() => ({
    guesses: [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent),
    known: history.map(h => h.guess),
    panel: !document.getElementById('feedbackPanel').classList.contains('hidden'),
    mark: document.getElementById('peff0').textContent
  }));
  check('закрытый ход показан точками', fog.guesses.join() === '•••', fog.guesses.join());
  check('числа закрытого хода клиент не знает вовсе',
    fog.known.every(g => g === undefined || g === null), JSON.stringify(fog.known));
  check('подсказки по закрытому ходу нет', fog.panel === false);
  check('на карточке видно, что висит туман', fog.mark.indexOf('🙈') >= 0, fog.mark);
  await done(p2);

  // Вынужденный ход в онлайне идёт на сервер
  const p3 = await newGame(browser, { user: 'Лев' });
  await p3.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' }];
    window.__matches = [{ id: 1, other: 'Кира', seat: 0, status: 'active',
                          round: 1, wins: [0, 0], my_turn: true }];
    window.__match.forced = 'lava';
    window.__match.cur = 0;
  });
  await p3.click('#tModeOnline');
  await p3.waitForTimeout(400);
  await p3.click('#gamesList .friend-row .fr-btn');
  await p3.waitForTimeout(600);
  check('вынужденный ход объявлен', await p3.locator('#forcedTurn').isVisible());
  check('поля ввода при этом нет',
    !(await p3.locator('#guessSection').isVisible()));
  await p3.click('#forcedBtn');
  await p3.waitForTimeout(500);
  check('кнопка отправила вынужденный ход на сервер',
    await p3.evaluate(() => window.__rpcCalls.filter(c => c.name === 'do_forced_turn').length) === 1);
  await done(p3);

  // Бонусы в окне вызова
  const p4 = await newGame(browser, { user: 'Лев' });
  await p4.evaluate(() => { window.__friends = [{ username: 'Кира', relation: 'friend' }]; });
  await p4.click('#tModeOnline');
  await p4.waitForTimeout(400);
  await p4.click('#friendsList .friend-row .fr-btn.yes');
  await p4.waitForTimeout(250);
  check('без галочки числа бонусов не спрашивают',
    !(await p4.locator('#chBonusCountField').isVisible()));
  await p4.check('#chBonuses');
  await p4.waitForTimeout(200);
  check('с галочкой появляется выбор числа',
    await p4.locator('#chBonusCountField').isVisible());
  await p4.selectOption('#chRange', '10');
  await p4.waitForTimeout(200);
  const ladder = await p4.evaluate(() =>
    [...document.querySelectorAll('#chBonusCount option')].map(o => +o.value));
  check('лесенка считается от выбранного диапазона',
    Math.max(...ladder) === 9, ladder.join(','));

  await p4.selectOption('#chBonusCount', '3');
  await p4.click('#tChSend');
  await p4.waitForTimeout(400);
  const sent = await p4.evaluate(() =>
    (window.__rpcCalls.filter(c => c.name === 'challenge_friend').pop() || {}).args);
  check('вызов ушёл с бонусами и их числом',
    sent.p_bonuses === true && sent.p_bonus_count === 3, JSON.stringify(sent));
  await done(p4);
}

// Онлайн: готовые фразы
async function testPhrases(browser) {
  console.log('\nОнлайн: готовые фразы');

  const page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' }];
    window.__matches = [{ id: 1, other: 'Кира', seat: 0, status: 'active',
                          round: 1, wins: [0, 0], my_turn: true }];
  });
  await page.click('#tModeOnline');
  await page.waitForTimeout(400);
  await page.click('#gamesList .friend-row .fr-btn');
  await page.waitForTimeout(600);

  check('кнопка фраз появилась в матче', await page.locator('#sayBtn').isVisible());
  check('палитра закрыта, пока её не открыли', !(await page.locator('#sayPad').isVisible()));

  await page.click('#sayBtn');
  await page.waitForTimeout(250);
  const pad = await page.evaluate(() => ({
    open: !document.getElementById('sayPad').classList.contains('hidden'),
    codes: [...document.querySelectorAll('#sayPad button[data-code]')].map(b => b.dataset.code),
    texts: [...document.querySelectorAll('#sayPad button[data-code]')].map(b => b.textContent),
    mute: !!document.getElementById('sayMuteBtn')
  }));
  check('палитра открывается кнопкой', pad.open);
  check('в ней восемь фраз', pad.codes.length === 8, pad.codes.join(','));
  check('фразы про эту игру, а не общие',
    pad.texts.some(t => t.indexOf('теплее') >= 0) && pad.texts.some(t => t.indexOf('холод') >= 0),
    pad.texts.join(' | '));
  check('есть кнопка «скрыть фразы»', pad.mute);

  // Отправка
  await page.click('#sayPad button[data-code="hot"]');
  await page.waitForTimeout(500);
  const sent = await page.evaluate(() => ({
    args: (window.__rpcCalls.filter(c => c.name === 'send_phrase').pop() || {}).args,
    bubble: document.getElementById('sayBubble').textContent,
    shown: !document.getElementById('sayBubble').classList.contains('hidden')
  }));
  check('фраза ушла кодом, а не текстом',
    sent.args.p_code === 'hot' && sent.args.p_match_id === 1, JSON.stringify(sent.args));
  check('своя фраза видна на доске', sent.shown && sent.bubble.indexOf('теплее') >= 0, sent.bubble);
  check('и подписана именем', sent.bubble.indexOf('Лев') >= 0, sent.bubble);

  // Фраза соперника приходит опросом
  await page.evaluate(() => {
    window.__match.chat.push({ id: 99, seat: 1, code: 'wow', ago: 0 });
  });
  await page.waitForTimeout(2600);
  const from = await page.evaluate(() => document.getElementById('sayBubble').textContent);
  check('фраза соперника приходит сама', from.indexOf('Кира') >= 0, from);

  // Со временем гаснет
  await page.evaluate(() => { sayShownUntil = Date.now() - 1; renderSayBubble(); });
  await page.waitForTimeout(200);
  check('реплика гаснет, а не висит весь раунд',
    !(await page.locator('#sayBubble').isVisible()));

  // Выключение
  await page.click('#sayMuteBtn');
  await page.waitForTimeout(200);
  check('выбор «скрыть» записан в память',
    await page.evaluate(() => localStorage.getItem('hc_mute')) === '1');
  await page.evaluate(() => {
    window.__match.chat.push({ id: 100, seat: 1, code: 'hurry', ago: 0 });
  });
  await page.waitForTimeout(2600);
  check('с выключенными фразами чужая реплика не показывается',
    !(await page.locator('#sayBubble').isVisible()));
  await done(page);

  // В местной игре фраз нет: там соперник рядом
  const solo = await newGame(browser, { user: 'Лев' });
  await solo.click('#tModeDuel');
  await solo.waitForTimeout(200);
  await solo.click('#tStartMatch');
  await solo.waitForTimeout(300);
  check('в игре за одним телефоном кнопки фраз нет',
    !(await solo.locator('#sayBtn').isVisible()));
  await done(solo);
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
    await testSoundAndShare(browser);
    await testDuelWording(browser);
    await testPauseAndGiveUp(browser);
    await testPinHelp(browser);
    await testFrostMode(browser);
    await testBestPerAccount(browser);
    await testNumberLine(browser);
    await testVizToggles(browser);
    await testDistanceHint(browser);
    await testScaleOrder(browser);
    await testRoundTiers(browser);
    await testSetupSpacing(browser);
    await testMinusButton(browser);
    await testShortHistory(browser);
    await testBonusMode(browser);
    await testEndOfRound(browser);
    await testScaleMemory(browser);
    await testCheckboxLook(browser);
    await testDotMotion(browser);
    await testHubGreeting(browser);
    await testResultPlacement(browser);
    await testFriends(browser);
    await testOnlineMatch(browser);
    await testOnlineClock(browser);
    await testPhrases(browser);
  } finally {
    await browser.close();
  }
  console.log('');
  process.exit(report() > 0 ? 1 : 0);
})();
