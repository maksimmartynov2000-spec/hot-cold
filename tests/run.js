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
    document.getElementById('tModeRun').textContent
  ]);
  check('в меню три режима с названиями', names.every(n => n && n.trim()), names.join(' / '));

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
  await page.fill('#guessInput', String(s.secret));
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
  const s2 = await page.evaluate(() => ({ secret, RANGE_MAX, MAX_GUESSES }));
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
  const s = await page.evaluate(() => secret);
  await page.fill('#guessInput', String(s));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(1200);
  const scoreBefore = await page.evaluate(() => RUN.totalScore);
  check('игра сохраняется по ходу дела',
    !!(await page.evaluate(() => localStorage.getItem('hc_run_state'))));

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
  const sent = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'submit_run_score'));
  check('«сдаться» записывает текущий результат',
    sent.length === 1 && sent[0].args.p_score === scoreBefore,
    JSON.stringify(sent[0] && sent[0].args));
  check('после «сдаться» сохранение очищено',
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

  // Сервер пускает «аню» в аккаунт «Ани» — незаконченная игра должна найтись так же
  const page3 = await newGame(browser, { user: 'Аня' });
  await page3.evaluate(() => {
    localStorage.setItem('hc_run_state', JSON.stringify({
      round: 3, totalScore: 900, range: 50, rangeMin: 1, allowed: 9,
      secret: 7, history: [], user: 'АНЯ'
    }));
  });
  await page3.click('#tModeRun');
  await page3.waitForTimeout(400);
  check('игра находится, даже если имя набрано в другом регистре',
    await page3.locator('#tUnfinishedResume').isVisible());

  // а чужую игру по-прежнему не отдаём
  await page3.evaluate(() => {
    const st = JSON.parse(localStorage.getItem('hc_run_state'));
    st.user = 'Максим';
    localStorage.setItem('hc_run_state', JSON.stringify(st));
  });
  await page3.reload();
  await page3.waitForTimeout(300);
  await page3.click('#tModeRun');
  await page3.waitForTimeout(400);
  check('чужая незаконченная игра не показывается',
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
  check('с морозом границы симметричные', after.labels[1] === '-50…+50', after.labels.join(' '));
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
  check('и границы сразу симметричные',
    (await page3.evaluate(() =>
      [...document.querySelectorAll('#rangeMax option')].map(o => o.textContent)))[1] === '-50…+50');
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
  } finally {
    await browser.close();
  }
  console.log('');
  process.exit(report() > 0 ? 1 : 0);
})();
