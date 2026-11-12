// Все проверки одним запуском: node run.js
const { chromium } = require('playwright');
const { GAME_URL, launchOptions, applyStub, check, report } = require('./helpers');

const PHONE = { width: 430, height: 850 };

// Свой контекст на каждый тест: иначе страницы делят localStorage и влияют друг на друга
// Экран входа открывают «Друзья» (Испытание входа не просит)
async function openAuth(page) {
  await page.evaluate(() => { tutSave({ done: [1, 2, 3], skipped: true, veteran: true }); openFriendsEntry(); });
}

async function newGame(browser, opts) {
  const context = await browser.newContext({ viewport: PHONE });
  const page = await context.newPage();
  if (opts && opts.clock) await page.clock.install();
  page.on('pageerror', e => check('без ошибок JS', false, e.message));
  await applyStub(page, opts);
  await page.goto(GAME_URL);
  await page.waitForTimeout(300);
  return page;
}

// Вдвоём за одним телефоном при помехе после хода появляется шторка
// «Передайте телефон» — игрок её убирает, и тесты тоже. Нет шторки — ничего
async function liftCurtainIfShown(page) {
  const shown = await page.evaluate(() => {
    const c = document.getElementById('curtain');
    return !!c && !c.classList.contains('hidden');
  }).catch(() => false);
  if (shown) { await page.click('#ctGo'); await page.waitForTimeout(80); }
}

// Язык живёт в окне профиля: открыть, выбрать, закрыть
async function setLang(page, lang) {
  await page.click('#accountChip');
  await page.waitForTimeout(100);
  await page.selectOption('#langSwitcher', lang);
  await page.click('#tProfileDone');
  await page.waitForTimeout(100);
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
    document.getElementById('tModeBot').textContent,
    document.getElementById('tModeRun').textContent
  ]);
  // Онлайна со случайными соперниками нет (миграция 062): с другом — через «Друзей»
  check('в меню четыре режима с названиями', names.every(n => n && n.trim()), names.join(' / '));
  check('карточек в меню тоже четыре, онлайна нет',
    // Карточка обучения видна только новичку — здесь её нет
    await page.evaluate(() => document.querySelectorAll('#screenMode .mode-btn:not(.hidden)').length === 4 &&
      !document.getElementById('tModeOnline') && !document.getElementById('screenOnline')));

  // Тренировка
  await page.click('#tModeSolo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  // Шапка с названием — только на главном: в партии всё место доске
  check('тренировка: шапки в партии нет', !(await page.locator('.header h1').isVisible()));
  check('тренировка: нижнего меню в партии нет', !(await page.locator('#tabbar').isVisible()));
  check('тренировка: шкала спрятана за «?»', !(await page.locator('#legendGrid').isVisible()));
  const wrong = await page.evaluate(() => secret === RANGE_MIN ? RANGE_MAX : RANGE_MIN);
  await page.fill('#guessInput', String(wrong));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  check('тренировка: градусник — в карточке ответа',
    await page.evaluate(() => document.getElementById('thermoWrap').parentElement.id === 'feedbackPanel') &&
    await page.locator('#thermoWrap').isVisible());
  const secret = await page.evaluate(() => secret);
  await page.fill('#guessInput', String(secret));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  await liftCurtainIfShown(page);
  check('тренировка: победа показывает результат',
    (await page.locator('#resultBox').textContent()).includes('Победа'));

  // Дуэль
  await page.click('#screenGame >> text=В меню');
  await page.click('#tModeDuel');
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  check('дуэль: карточки игроков видны', await page.locator('#pcard0').isVisible());
  // Чей ход — ярлык над плашкой игрока, а не отдельная полоса
  check('дуэль: показан чей ход', await page.locator('#pturn0').isVisible() &&
    (await page.locator('#pturn0').textContent()).trim().length > 0 && !(await page.locator('#pturn1').isVisible()));
  check('дуэль: полосы «Ходит» нет', !(await page.locator('#turnBanner').isVisible()));

  await done(page);
}

async function testRating(browser) {
  console.log('\nИспытание: хаб');
  const page = await newGame(browser, { user: 'Максим' });

  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  check('вход по сохранённому аккаунту ведёт сразу в хаб', await page.locator('#screenRunHub').isVisible());
  check('чип с именем виден в хабе', await page.locator('#accountChip').isVisible());
  check('таблиц рекордов больше нет — соревноваться не с кем',
    (await page.locator('#tRunTopDay').count()) === 0 && (await page.locator('#runLeaderboardList').count()) === 0);
  const hub = await page.evaluate(() => ({ best: document.getElementById('trialBest').textContent,
    medals: document.querySelectorAll('#trialBest .tr-medal').length, daily: document.getElementById('trialDaily').textContent }));
  check('в хабе — личный рекорд и три медали', /Личный рекорд/.test(hub.best) && hub.medals === 3, hub.best);
  check('в хабе — Испытание дня с правилом и кнопкой', /Испытание дня/.test(hub.daily) && /Так во всех раундах сегодня/.test(hub.daily) &&
    /Играть Испытание дня/.test(hub.daily), hub.daily);

  await page.click('#tRunStart');
  await page.waitForTimeout(250);
  check('чип скрыт во время игры', !(await page.locator('#accountChip').isVisible()));
  check('в Испытании шапки нет — место доске', !(await page.locator('.header h1').isVisible()));

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

  // Без входа Испытание тоже играется: счёт в телефоне
  const guest = await newGame(browser, {});
  await guest.evaluate(() => { try { localStorage.setItem('hc_tut', JSON.stringify({ done: [1, 2], skipped: true })); } catch (e) {} });
  await guest.click('#tModeRun');
  await guest.waitForTimeout(300);
  check('гость попадает в хаб Испытания, без входа', await guest.locator('#screenRunHub').isVisible());
  await guest.click('#tRunStart');
  await guest.waitForTimeout(250);
  check('гость играет Испытание', await guest.evaluate(() => mode === 'run' && !!RUN && RUN.round === 1));
  await done(guest);
}

async function testScoringAndSubmit(browser) {
  console.log('\nОчки и итог Испытания');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  await page.click('#tRunStart');
  await page.waitForTimeout(250);

  await page.fill('#guessInput', String(await page.evaluate(() => secret)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(150);
  const afterWin = await page.evaluate(() => ({ score: RUN.totalScore, locked: RUN.locked }));
  check('за угаданный раунд начисляются очки', afterWin.score > 0, String(afterWin.score));
  check('в паузе между раундами поля ввода нет', !(await page.locator('#guessInput').isVisible()));
  await page.evaluate(() => { document.getElementById('guessInput').value = String(secret); return runGuess(); });
  await page.waitForTimeout(100);
  check('в паузе между раундами очки не накручиваются',
    (await page.evaluate(() => RUN.totalScore)) === afterWin.score);
  const doors = await page.evaluate(() => [...document.querySelectorAll('#runStage .rs-door')].map(b => b.textContent));
  check('после раунда — две двери: риск и запас', doors.length === 2 && /Риск/.test(doors[0]) && /Запас/.test(doors[1]), doors.join(' | '));

  // Риск: очки ×2 и на попытку меньше
  const before = await page.evaluate(() => ({ tries: runAttemptsForRound(2, runRangeForRound(2)), mod: RUN.stage.nextMod }));
  await page.evaluate(() => { RUN.stage.nextMod = null; renderAll(); });
  await page.click('#rsRisk');
  await page.waitForTimeout(200);
  const risk = await page.evaluate(() => ({ mult: RUN.mult, tries: MAX_GUESSES, round: RUN.round }));
  check('риск: очки ×2, на попытку меньше', risk.mult === 2 && risk.tries === before.tries - 1 && risk.round === 2, JSON.stringify(risk));
  const p0 = await page.evaluate(() => RUN.totalScore);
  await page.evaluate(() => { document.getElementById('guessInput').value = String(secret); handleGuess(); });
  const got = await page.evaluate(() => RUN.log[1].points);
  const expect = await page.evaluate(() => Math.round(100 * 2 * (minAttempts(rangeCount()) / 1)) * 2);
  check('очки за раунд с риском удвоены', got === expect, got + ' / ' + expect);
  await page.evaluate(() => { RUN.stage.nextMod = null; RUN.stage.reward = 'tries'; renderAll(); });
  await page.click('#rsSafe');
  await page.waitForTimeout(200);
  const safe = await page.evaluate(() => ({ tries: MAX_GUESSES, base: runAttemptsForRound(3, runRangeForRound(3)) }));
  check('запас «+2 попытки»', safe.tries === safe.base + 2, JSON.stringify(safe));

  // сливаем раунд -> игра заканчивается и итог уходит в базу
  await page.evaluate(() => { window.__rpcCalls.length = 0; });
  const s2 = await page.evaluate(() => ({ secret, RANGE_MIN, RANGE_MAX, MAX_GUESSES }));
  for (let i = 0; i < s2.MAX_GUESSES; i++) {
    let wrong = s2.RANGE_MIN + ((s2.secret - s2.RANGE_MIN + 1 + i) % (s2.RANGE_MAX - s2.RANGE_MIN + 1));
    if (wrong === s2.secret) wrong = wrong === s2.RANGE_MAX ? s2.RANGE_MIN : wrong + 1;
    await page.fill('#guessInput', String(wrong));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(500);
  const over = await page.evaluate(() => ({
    card: !document.getElementById('runStage').classList.contains('hidden') &&
      document.getElementById('runStage').classList.contains('over'),
    text: document.getElementById('runStage').textContent,
    input: !document.getElementById('guessSection').classList.contains('hidden') }));
  check('после проигрыша — карточка итога на доске', over.card && !over.input, JSON.stringify(over).slice(0, 200));
  check('в итогах — почему кончилось, число и счёт',
    /Испытание окончено/.test(over.text) && /кончились попытки/.test(over.text) &&
    over.text.includes('Загаданное число') && /Раундов пройдено/.test(over.text), over.text);
  check('загаданное число отмечено на прямой',
    await page.evaluate(() => [...document.querySelectorAll('#numLineSvg text')].some(t => t.getAttribute('fill') === '#4ADE80')));
  check('кнопка в строке статуса — уже не «Пауза»', (await page.locator('#tMenu').textContent()) === '☰');
  const rep = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'run_report').map(c => c.args));
  check('итог ушёл в базу один раз: раунды и очки', rep.length === 1 && rep[0].p_rounds === 2 && rep[0].p_score > 0, JSON.stringify(rep));
  await page.click('#rgHub');
  await page.waitForTimeout(400);
  check('«К Испытанию» ведёт в хаб', await page.locator('#screenRunHub').isVisible());
  const st = await page.evaluate(() => trialStats());
  check('рекорд раундов записан в телефоне', st.bestRounds === 2 && st.best > 0, JSON.stringify(st));

  await done(page);
}

async function testAuth(browser) {
  console.log('\nВход и регистрация');
  const page = await newGame(browser);

  // Испытание входа не просит: счёт в телефоне. Вход нужен друзьям
  await page.click('#tModeRun');
  await page.waitForTimeout(250);
  check('Испытание без аккаунта открывается сразу', await page.locator('#screenRunHub').isVisible());
  await page.evaluate(() => { tutSave({ done: [1, 2, 3], skipped: true, veteran: true }); openFriendsEntry(); });
  await page.waitForTimeout(250);
  check('без аккаунта «Друзья» показывают выбор вход/регистрация', await page.locator('#screenAuthChoice').isVisible() &&
    /Друзья/.test(await page.locator('#tAuthChoiceTitle').textContent()));

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

  check('окно профиля открылось', await page.locator('#logoutModal').isVisible());
  // «Выйти» — под «Ещё»: рядом с «Готово» туда легко попасть случайно
  check('«Выйти» спрятано под «Ещё»', !(await page.locator('#tLogoutStart').isVisible()));
  await page.click('#tMoreHead');
  // Раньше вопрос «Выйти?» висел сразу, хотя человек ничего не нажимал
  check('вопрос о выходе не задаётся, пока не нажали «Выйти»',
    !(await page.locator('#tLogoutAsk').isVisible()) && await page.locator('#tLogoutStart').isVisible());

  await page.evaluate(() => { document.getElementById('pfMoreFold').open = true; }); await page.click('#tLogoutStart');
  await page.waitForTimeout(150);
  check('после «Выйти» появляется вопрос', await page.locator('#tLogoutAsk').isVisible());
  check('текст в окне читается (не чёрный на тёмном)',
    await page.locator('#tLogoutAsk').evaluate(e => {
      const c = getComputedStyle(e).color, bg = getComputedStyle(e.closest('.modal-card')).backgroundColor;
      const lum = s => { const [r, g, b] = s.match(/\d+/g).map(Number); return 0.299 * r + 0.587 * g + 0.114 * b; };
      return Math.abs(lum(c) - lum(bg)) > 120;
    }));

  // Под вопросом две синие кнопки подряд — «Выйти» и «Готово» — спорили бы,
  // какая главная. Пока спрашиваем, «Готово» убрано
  check('пока спрашиваем о выходе, «Готово» не спорит с «Выйти»',
    !(await page.locator('#tProfileDone').isVisible()));

  await page.click('#tLogoutCancel');
  await page.waitForTimeout(150);
  check('отмена не разлогинивает', !!(await page.evaluate(() => localStorage.getItem('hc_run_user'))));
  check('после отмены «Готово» на месте', await page.locator('#tProfileDone').isVisible());
  check('и прячет вопрос, не закрывая профиль',
    !(await page.locator('#tLogoutAsk').isVisible()) && await page.locator('#logoutModal').isVisible());

  await page.evaluate(() => { document.getElementById('pfMoreFold').open = true; }); await page.click('#tLogoutStart');
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
    await setLang(page, lang);
    await page.waitForTimeout(150);
    const empty = await page.evaluate(() => {
      const ids = ['tModeSolo', 'tModeDuel', 'tModeRun', 'tRunStart'];
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

  // Звук: кнопка в профиле, переключается и запоминается
  check('в меню кнопки звука нет', !(await page.locator('#soundBtn').isVisible()));
  await page.click('#accountChip');
  await page.waitForTimeout(200);
  check('кнопка звука видна в профиле', await page.locator('#soundBtn').isVisible());
  check('звук включён по умолчанию', (await page.locator('#soundBtn').textContent()) === '🔊');
  await page.click('#soundBtn');
  await page.waitForTimeout(100);
  check('звук выключается', (await page.locator('#soundBtn').textContent()) === '🔇');
  check('выбор звука записан в память',
    await page.evaluate(() => localStorage.getItem('hc_sound')) === '0');
  await page.click('#soundBtn');
  await page.waitForTimeout(100);
  await page.click('#tProfileDone');

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
  await liftCurtainIfShown(page);
  check('на ход играет звук', (await page.evaluate(() => window.__tones)) > 0);

  // и обратная сторона: выключенный звук читается из памяти при запуске
  const muted = await gameWithStorage(browser, { user: 'Максим' }, { hc_sound: '0' });
  check('при запуске выключенный звук читается из памяти',
    (await muted.locator('#soundBtn').textContent()) === '🔇');
  await done(muted);

  // Личный рекорд в строке статуса
  await page.evaluate(() => localStorage.setItem(runBestKey(), '4200'));
  await page.fill('#guessInput', String(await page.evaluate(() => secret)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(1200);
  await liftCurtainIfShown(page);
  // toLocaleString ставит неразрывный пробел — сравниваем по цифрам
  const status = (await page.locator('#tConfirmed').textContent()).replace(/\s/g, ' ');
  check('личный рекорд виден во время игры', status.includes('4 200'), status.trim());

  // «Поделиться» на экране итогов. Прежнюю игру сначала завершаем:
  // пока она висит незаконченной, новую начать нельзя — так и задумано
  await page.click('#tMenu');
  await page.waitForTimeout(200);
  await page.click('#tPauseGiveUp');
  await page.waitForTimeout(600);
  await page.click('#rgHub');
  await page.waitForTimeout(300);
  await page.click('#tRunStart');
  await page.waitForTimeout(250);
  const s2 = await page.evaluate(() => ({ secret: secret, RANGE_MAX, MAX_GUESSES }));
  for (let i = 0; i < s2.MAX_GUESSES; i++) {
    let w = ((s2.secret + i) % s2.RANGE_MAX) + 1;
    if (w === s2.secret) w = (w % s2.RANGE_MAX) + 1;
    await page.fill('#guessInput', String(w));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(60);
    await liftCurtainIfShown(page);
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
  await liftCurtainIfShown(page);
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

  await page.fill('#guessInput', String(await page.evaluate(() => secret)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(300);
  await page.evaluate(() => { RUN.stage.nextMod = null; });
  await page.click('#rsSafe');
  await page.waitForTimeout(300);
  const scoreBefore = await page.evaluate(() => RUN.totalScore);
  check('незаконченная игра записана в телефоне', await page.evaluate(() => {
    const v = JSON.parse(localStorage.getItem('hc_trial_state') || 'null'); return !!v && v.RUN.round === 2; }));

  await page.click('#tMenu');
  await page.waitForTimeout(200);
  check('кнопка в игре открывает паузу', await page.locator('#pauseModal').isVisible());
  await page.click('#tPauseResume');
  await page.waitForTimeout(200);
  check('«Продолжить» возвращает в игру',
    !(await page.locator('#pauseModal').isVisible()) && await page.locator('#guessInput').isVisible());

  await page.click('#tMenu');
  await page.waitForTimeout(200);
  await page.click('#tPauseExit');
  await page.waitForTimeout(300);
  check('после выхода хаб предлагает незаконченную игру', await page.locator('#unfinishedBox').isVisible());
  check('пока игра не закончена, новую начать не предлагают', !(await page.locator('#tRunStart').isVisible()));
  const info = await page.locator('#unfinishedInfo').textContent();
  check('в карточке видно раунд и очки', /Раунд\s*2/.test(info), info.trim());

  await page.reload();
  await page.waitForTimeout(400);
  await page.click('#tModeRun');
  const survived = await page.locator('#unfinishedBox').waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
  check('игра переживает перезагрузку страницы', survived);
  if (survived) await page.click('#tUnfinishedResume');
  await page.waitForTimeout(300);
  const resumed = await page.evaluate(() => ({ score: RUN.totalScore, round: RUN.round }));
  check('продолжение восстанавливает счёт и раунд', resumed.score === scoreBefore && resumed.round === 2,
    'очки ' + resumed.score + ', раунд ' + resumed.round);

  await page.evaluate(() => { window.__rpcCalls.length = 0; });
  await page.click('#tMenu');
  await page.waitForTimeout(200);
  await page.click('#tPauseGiveUp');
  await page.waitForTimeout(600);
  const sent = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'run_report'));
  check('«сдаться» — итог уходит в базу', sent.length === 1 && sent[0].args.p_rounds === 1, JSON.stringify(sent));
  check('незаконченной игры больше нет', !(await page.evaluate(() => localStorage.getItem('hc_trial_state'))));
  check('после «сдаться» — итог на доске', await page.locator('#runStage.over').isVisible());
  await page.click('#rgHub');
  await page.waitForTimeout(400);
  check('после «сдаться» снова можно начать игру', await page.locator('#tRunStart').isVisible());

  await done(page);
}


async function testBestPerAccount(browser) {
  console.log('\nЛичный рекорд и незаконченная игра принадлежат игроку');
  const page = await newGame(browser, { user: 'Аня' });
  const r = await page.evaluate(() => {
    localStorage.setItem('hc_trial_stats_аня', JSON.stringify({ best: 5200, bestRounds: 8, daily: {} }));
    const anya = runBest();
    localStorage.setItem('hc_run_user', 'Максим');
    const maksim = runBest();
    localStorage.setItem('hc_run_user', 'Аня');
    const back = runBest();
    localStorage.removeItem('hc_run_user');
    const guest = runBest();
    localStorage.setItem('hc_run_user', 'Аня');
    return { anya, maksim, back, guest };
  });
  check('свой рекорд у Ани', r.anya === 5200, String(r.anya));
  check('новому ученику чужой рекорд не достался', r.maksim === 0, String(r.maksim));
  check('свой рекорд у Ани остался', r.back === 5200, String(r.back));
  check('у гостя свой рекорд, не Анин', r.guest === 0, String(r.guest));
  await done(page);

  const page2 = await newGame(browser, { user: 'Новичок' });
  await page2.evaluate(() => localStorage.setItem('hc_run_best', '99999'));
  await page2.reload();
  await page2.waitForTimeout(400);
  const legacy = await page2.evaluate(() => ({ best: runBest(), old: localStorage.getItem('hc_run_best') }));
  check('старый общий ключ убирается', legacy.old === null, String(legacy.old));
  check('из старого ключа рекорд не подставляется', legacy.best === 0, String(legacy.best));
  await done(page2);

  // Незаконченная игра Ани не достаётся Максиму на том же телефоне
  const page3 = await newGame(browser, { user: 'Аня' });
  await page3.click('#tModeRun');
  await page3.waitForTimeout(300);
  await page3.click('#tRunStart');
  await page3.waitForTimeout(200);
  await page3.evaluate(() => { pauseAndLeave(); localStorage.setItem('hc_run_user', 'Максим'); openRunHub(); });
  await page3.waitForTimeout(200);
  check('чужую незаконченную игру не предлагают', !(await page3.locator('#tUnfinishedResume').isVisible()));
  await page3.evaluate(() => { localStorage.setItem('hc_run_user', 'Аня'); openRunHub(); });
  await page3.waitForTimeout(200);
  check('свою — предлагают', await page3.locator('#tUnfinishedResume').isVisible());
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
  await liftCurtainIfShown(page);
  const h = await page.evaluate(() => ({ len: history.length, d: history[0].distance, s: secret }));
  check('отрицательная догадка принята', h.len === 1);
  check('расстояние от отрицательной догадки верное', h.d === Math.abs(-400 - h.s),
    h.d + ' вместо ' + Math.abs(-400 - h.s));

  // ноль — тоже допустимое число
  await page.fill('#guessInput', '0');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  check('ноль принимается как догадка', await page.evaluate(() => history.length) === 2);

  // за границей — не принимается
  await page.fill('#guessInput', '-501');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  await liftCurtainIfShown(page);
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
  await liftCurtainIfShown(page);
  const marks = await page.evaluate(() => {
    const c = [...document.querySelectorAll('#numLineSvg circle')];
    return { count: c.length, filled: c.filter(e => e.getAttribute('fill') !== 'none').length,
             x: parseFloat(c[c.length - 1].getAttribute('cx')), want: nlPos(-1) };
  });
  check('догадка отмечена на своём месте', Math.abs(marks.x - marks.want) < 0.01,
    marks.x + ' вместо ' + marks.want);
  check('текущая догадка одна и она залита', marks.filled === 1, JSON.stringify(marks));

  // пояс расстояний — помощь для тренировки, тут он нужен; стоит он под словом
  check('в тренировке пояс показан отдельно от подсказки',
    await page.locator('#feedbackBand').isVisible() &&
    !/\d/.test(await page.locator('#feedbackLabel').textContent()),
    await page.locator('#feedbackPanel').textContent());
  const sides = await page.evaluate(() => {
    const l = document.getElementById('feedbackLabel').getBoundingClientRect();
    const b = document.getElementById('feedbackBand').getBoundingClientRect();
    return { below: +(b.top - l.bottom).toFixed(0), dx: +Math.abs(b.left - l.left).toFixed(0) };
  });
  check('пояс — под словом, с одного края', sides.below >= -2 && sides.dx <= 2, JSON.stringify(sides));

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

  // шкалу расстояний читают те же дети
  await page.click('#scaleStrip');
  await page.waitForTimeout(150);
  const legend = await page.evaluate(() => {
    const px = sel => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
    return { item: px('.legend-item .l-label'), range: px('.legend-item .l-range'),
             title: px('#scaleStrip .ss-seg'),
             wrapped: [...document.querySelectorAll('.legend-item')]
               .filter(i => i.getBoundingClientRect().height > 24).length };
  });
  check('шкала расстояний не мельче 14 пикселей',
    legend.item >= 14 && legend.range >= 14 && legend.title >= 14, JSON.stringify(legend));
  check('строки шкалы не переносятся', legend.wrapped === 0, 'перенесено строк: ' + legend.wrapped);
  await page.click('#scaleStrip');

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
    await liftCurtainIfShown(page);

    check(kind + ': пояс показан', await page.locator('#feedbackBand').isVisible());
    check(kind + ': кнопка подсказки подсвечена', await page.evaluate(() =>
      document.getElementById('toggleHintBtn').classList.contains('on')));

    await page.evaluate(() => openVizPanel()); await page.click('#toggleHintBtn');
    await page.waitForTimeout(250);
    check(kind + ': пояс снимается кнопкой', !(await page.locator('#feedbackBand').isVisible()));
    check(kind + ': кнопка погасла', await page.evaluate(() =>
      !document.getElementById('toggleHintBtn').classList.contains('on')));

    await page.evaluate(() => openVizPanel()); await page.click('#toggleHintBtn');
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
    const range = r('.chips-rangeMax'), frost = r('.frost-row'), attempts = r('#attemptsField');
    return { above: +(frost.top - range.bottom).toFixed(0),
             below: +(attempts.top - frost.bottom).toFixed(0) };
  });
  // Галочка относится к диапазону, значит держится за него, а не висит посередине
  check('переключатель — сразу под диапазоном, к которому относится', gaps.above >= 6 && gaps.above <= 24,
    'сверху ' + gaps.above + 'px, снизу ' + gaps.below + 'px');
  check('зазоры не слипшиеся', gaps.above >= 6 && gaps.below >= 12, JSON.stringify(gaps));

  // Экран настройки должен помещаться целиком — и в дуэли, где полей вдвое больше
  check('настройка тренировки помещается без прокрутки', await page.evaluate(() =>
    document.documentElement.scrollHeight <= window.innerHeight + 1));
  await page.click('#navPlay');
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
  await liftCurtainIfShown(page);
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
      // Раунд в Испытании короткий — даём попыток с запасом и прячем число
      await page.evaluate(() => { MAX_GUESSES = 20; secret = 10; RUN.mod = null; renderAll(); });
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
      await liftCurtainIfShown(page);
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

  // Радиус сигнала «рядом» считается от длины прямой и числа бонусов, чтобы
  // сигнал не горел на половине прямой. Ступенька 1–3–5 числа бонусов не знала
  // и на −10…10 зажигала «рядом» на 57 % ходов
  let page = await duelWithBonus(browser, 'extra', 40);
  const radii = await page.evaluate(() => {
    const out = {};
    [[1, 10], [-10, 10], [1, 100], [1, 1000], [-500, 500]].forEach(([lo, hi]) => {
      RANGE_MIN = lo; RANGE_MAX = hi;
      out[lo + '..' + hi] = bonusNearRadius();
    });
    RANGE_MIN = 1; RANGE_MAX = 100;
    return out;
  });
  check('на десятке сигнал за одну клетку', radii['1..10'] === 1, JSON.stringify(radii));
  check('на −10…10 тоже за одну, а не за три', radii['-10..10'] === 1, JSON.stringify(radii));
  check('на сотне — за две', radii['1..100'] === 2, JSON.stringify(radii));
  check('на тысяче — по-прежнему за пять', radii['1..1000'] === 5 && radii['-500..500'] === 5,
    JSON.stringify(radii));

  await page.fill('#guessInput', '43');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  check('за три клетки бонус не чувствуется', !(await page.locator('#bonusLine').isVisible()));
  await page.fill('#guessInput', '42');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  const nearLine = await page.locator('#bonusLine').textContent();
  check('за две клетки виден сигнал', nearLine.indexOf('рядом') >= 0, nearLine);
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
  await liftCurtainIfShown(page);
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
  await liftCurtainIfShown(page);
  const fog = await page.evaluate(() => ({
    onRival: D.fog[1] === true, turn: D.cur,
    masked: [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent),
    panel: !document.getElementById('feedbackPanel').classList.contains('hidden'),
    marks: document.getElementById('peff1').textContent
  }));
  check('«Туман» ложится на соперника', fog.onRival && fog.turn === 1, JSON.stringify(fog));
  // Под туманом не видно ни одного чужого хода — даже того, которым туман взяли
  check('туман лёг — закрыт и ход, которым его взяли', fog.masked.join() === '•••', fog.masked.join());
  check('на карточке соперника виден значок помехи', fog.marks.indexOf('🙈') >= 0, fog.marks);
  // Телефон передают из рук в руки: при помехе между ходами — шторка
  const lift = async () => {
    if (await page.evaluate(() => !document.getElementById('curtain').classList.contains('hidden'))) {
      await page.click('#ctGo');
      await page.waitForTimeout(100);
    }
  };
  await lift();
  // А следующий чужой ход на его ходу закрыт
  await page.fill('#guessInput', '10');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(150);
  await liftCurtainIfShown(page);
  await lift();
  await page.fill('#guessInput', '20');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  await lift();
  const fog2 = await page.evaluate(() => ({
    turn: D.cur,
    masked: [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent),
    panel: !document.getElementById('feedbackPanel').classList.contains('hidden')
  }));
  check('все чужие ходы под туманом скрыты', fog2.turn === 1 && fog2.masked.join() === '•••,10,•••',
    JSON.stringify(fog2));
  check('подсказка к нему тоже скрыта', fog2.panel === false);
  await done(page);

  // Слепой ход — соперник не видит СВОИ ходы, и это до конца раунда
  page = await duelWithBonus(browser, 'blind', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  check('«Слепой ход» ложится на соперника', await page.evaluate(() => D.blind[1] === true));
  await page.fill('#guessInput', '50');       // ходит соперник
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  await page.fill('#guessInput', '60');       // ходит взявший
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
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
  await liftCurtainIfShown(page);
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
  await liftCurtainIfShown(page);
  const waiting = await page.evaluate(() => ({
    onRival: D.autoLava[1] === true, turn: D.cur, moves: history.length,
    panel: !document.getElementById('forcedTurn').classList.contains('hidden'),
    input: !document.getElementById('guessSection').classList.contains('hidden'),
    text: document.getElementById('forcedText').textContent,
    btn: document.getElementById('forcedBtn').textContent,
    hint: document.getElementById('forcedHint').textContent,
    token: document.getElementById('ptoken1').disabled
  }));
  check('сам собой ход не делается', waiting.moves === 1 && waiting.turn === 1,
    JSON.stringify(waiting));
  check('вместо поля ввода — панель с кнопкой', waiting.panel && !waiting.input,
    JSON.stringify(waiting));
  check('в панели сказано, что ход сделается сам',
    waiting.text.indexOf('Шальной бросок') >= 0 && waiting.text.indexOf('сам') >= 0, waiting.text);
  check('кнопка называется «Бросить»', waiting.btn === 'Бросить', waiting.btn);
  check('жетон на отнятом ходе взвести можно', waiting.token === false);
  check('и об этом сказано прямо в панели',
    waiting.hint.indexOf('+1 ход') >= 0, waiting.hint);

  await page.click('#forcedBtn');
  await page.waitForTimeout(400);
  const lava = await page.evaluate(() => {
    const last = history[history.length - 1];
    return { by: last.p, distance: last.distance, moves: history.length,
             turn: D.cur, flag: D.autoLava[1] };
  });
  check('по кнопке за соперника ходит случай', lava.moves === 2 && lava.by === 1,
    JSON.stringify(lava));
  check('ход попал в горячие пояса, но не в ответ',
    lava.distance >= 1 && lava.distance <= 2, 'расстояние ' + lava.distance);

  // Раньше бросок всегда ложился ровно в одну клетку от ответа, и следующий
  // ход выигрывал наверняка. Теперь расстояний несколько
  const spread = await page.evaluate(() => {
    const seen = {};
    for (let i = 0; i < 400; i++) seen[Math.abs(lavaThrow() - secret)] = true;
    return Object.keys(seen).map(Number).sort((a, b) => a - b);
  });
  check('бросок не указывает на ответ одной клеткой',
    spread.length >= 2, 'расстояния: ' + spread.join(','));
  check('и не попадает ни в ответ, ни мимо горячих поясов',
    spread[0] >= 1 && spread[spread.length - 1] <= 2, 'расстояния: ' + spread.join(','));
  check('помеха снялась и ход вернулся', lava.flag === false && lava.turn === 0,
    JSON.stringify(lava));
  await done(page);

  // Пропуск хода — ловушка: бьёт по тому, кто наступил
  page = await duelWithBonus(browser, 'skip', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  check('«Пропуск хода» ложится на взявшего', await page.evaluate(() => D.skip[0] === true));
  await page.fill('#guessInput', '50');       // соперник ходит как обычно
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  const skipping = await page.evaluate(() => ({
    turn: D.cur, moves: history.length,
    panel: !document.getElementById('forcedTurn').classList.contains('hidden'),
    input: !document.getElementById('guessSection').classList.contains('hidden'),
    btn: document.getElementById('forcedBtn').textContent
  }));
  check('свой ход взявший не получает', skipping.turn === 0 && skipping.panel && !skipping.input,
    JSON.stringify(skipping));
  check('кнопка так и называется', skipping.btn === 'Пропустить ход', skipping.btn);
  await page.click('#forcedBtn');
  await page.waitForTimeout(300);
  const skipped = await page.evaluate(() => ({
    turn: D.cur, moves: history.length, flag: D.skip[0]
  }));
  check('пропуск отдаёт ход сопернику', skipped.turn === 1, JSON.stringify(skipped));
  check('и не добавляет хода в историю', skipped.moves === 2, JSON.stringify(skipped));
  check('пропуск одноразовый', skipped.flag === false);
  await done(page);

  // Жетон на пропуске: пропуск идёт первым ходом, второй игрок делает сам
  page = await duelWithBonus(browser, 'skip', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  await page.fill('#guessInput', '50');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  const before = await page.evaluate(() => ({
    tokens: D.tokens.slice(), turn: D.cur,
    token: document.getElementById('ptoken0').disabled,
    hint: document.getElementById('forcedHint').textContent
  }));
  check('на пропуске жетон доступен', before.token === false && before.turn === 0,
    JSON.stringify(before));
  check('и в панели объяснено, зачем он тут',
    before.hint.indexOf('первым ходом') >= 0, before.hint);

  // Если жетон недоступен, дальше идти некуда — провал уже назван выше
  if (!before.token) await page.click('#ptoken0');
  await page.waitForTimeout(250);
  const armed = await page.evaluate(() => ({
    armed: D.armed, tokens: D.tokens.slice(),
    hint: document.getElementById('forcedHint').textContent,
    panel: !document.getElementById('forcedTurn').classList.contains('hidden')
  }));
  check('жетон взводится прямо на пропуске', armed.armed === true, JSON.stringify(armed));
  check('и списывается', armed.tokens[0] === before.tokens[0] - 1, JSON.stringify(armed));
  check('взведённому подсказка больше не нужна', armed.hint === '', armed.hint);
  check('кнопка пропуска осталась на месте', armed.panel);

  await page.click('#forcedBtn');
  await page.waitForTimeout(350);
  const afterSkip = await page.evaluate(() => ({
    turn: D.cur, armed: D.armed, flag: D.skip[0],
    panel: !document.getElementById('forcedTurn').classList.contains('hidden'),
    input: !document.getElementById('guessSection').classList.contains('hidden')
  }));
  check('с жетоном пропуск не отдаёт ход', afterSkip.turn === 0, JSON.stringify(afterSkip));
  check('жетон при этом сгорает', afterSkip.armed === false, JSON.stringify(afterSkip));
  check('пропуск снят, и можно ходить', !afterSkip.panel && afterSkip.input && !afterSkip.flag,
    JSON.stringify(afterSkip));

  await page.fill('#guessInput', '60');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(350);
  await liftCurtainIfShown(page);
  const second = await page.evaluate(() => ({
    turn: D.cur, last: history[history.length - 1].guess, by: history[history.length - 1].p
  }));
  check('второй ход делает сам игрок', second.last === 60 && second.by === 0,
    JSON.stringify(second));
  check('и только после него ход уходит', second.turn === 1, JSON.stringify(second));
  await done(page);

  // Подарок сопернику — жетон уходит не туда, куда хотелось
  page = await duelWithBonus(browser, 'gift', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  const gift = await page.evaluate(() => D.tokens.slice());
  check('«Подарок сопернику» добавляет жетон сопернику', gift[1] === 2, gift.join());
  check('а взявшему — ничего', gift[0] === 1, gift.join());
  await done(page);

  // Короткая память — до конца раунда видно два хода вместо четырёх
  page = await duelWithBonus(browser, 'memory', 40);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
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
      const base = Math.max(1, Math.ceil(Math.sqrt(n) / 4));
      const roomy = Math.max(1, Math.floor(n * 0.086));
      // Потолок в дюжину снят ради больших диапазонов. Маленьких это не должно
      // касаться вовсе: там считаем ровно как раньше
      const before = Math.max(base, Math.min(base * 2, 12, roomy));
      if (n <= 200 && k !== before) {
        bad.push(n + ': на тесном диапазоне число изменилось — было ' + before + ', стало ' + k);
      }
      // На широком поле бонусы должны встречаться, а не теряться в пустоте
      if (n >= 500 && k / n < 0.03) bad.push(n + ': на широком диапазоне бонусов мало — ' + k);
    });
    // Сигнал «рядом» не должен гореть больше чем на трети прямой — ни на одном
    // диапазоне игры, включая «мороз»: иначе он ничего не говорит
    [[1, 10], [1, 20], [1, 100], [1, 200], [1, 1000], [1, 2000],
     [-10, 10], [-20, 20], [-100, 100], [-200, 200], [-1000, 1000], [-2000, 2000]].forEach(([lo, hi]) => {
      RANGE_MIN = lo; RANGE_MAX = hi;
      const n = rangeCount(), k = autoBonusCountFor(n);
      const covered = 2 * bonusNearRadius() * k / n;
      if (covered > 0.34) bad.push(lo + '…' + hi + ': сигнал «рядом» накрывает ' + Math.round(covered * 100) + '%');
    });
    RANGE_MIN = 1; RANGE_MAX = 100;
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
  // Градусник живёт в карточке ответа — она появляется с первым ходом
  check('до первого хода карточки с градусником нет', !(await page.locator('#feedbackPanel').isVisible()));
  await page.evaluate(() => { document.getElementById('guessInput').value = String(secret === RANGE_MIN ? RANGE_MAX : RANGE_MIN); });
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);

  check('по умолчанию градусник виден', await page.locator('#thermoWrap').isVisible());
  check('по умолчанию прямая видна', await page.locator('#numLine').isVisible());
  check('все три кнопки подсвечены как включённые', await page.evaluate(() =>
    ['toggleThermoBtn', 'toggleLineBtn', 'toggleHintBtn']
      .every(id => document.getElementById(id).classList.contains('on'))));
  check('у кнопок есть подпись для наведения',
    (await page.locator('#toggleThermoBtn').getAttribute('title')) === 'Градусник');

  await page.evaluate(() => openVizPanel()); await page.click('#toggleThermoBtn');
  await page.waitForTimeout(200);
  check('градусник прячется', !(await page.locator('#thermoWrap').isVisible()));
  check('прямая при этом остаётся', await page.locator('#numLine').isVisible());
  check('кнопка градусника погасла', await page.evaluate(() =>
    !document.getElementById('toggleThermoBtn').classList.contains('on')));

  await page.evaluate(() => openVizPanel()); await page.click('#toggleLineBtn');
  await page.waitForTimeout(200);
  check('прямая прячется', !(await page.locator('#numLine').isVisible()));

  // Запись проверяем прямо здесь. Читать её после page.reload() нельзя: страница
  // открыта по file://, и Chromium в этом режиме изредка обнуляет хранилище —
  // проверка мигала не из-за игры, а из-за окружения
  const saved = await page.evaluate(() => ({
    t: localStorage.getItem('hc_show_thermo'), l: localStorage.getItem('hc_show_line') }));
  check('выбор записан в память браузера', saved.t === '0' && saved.l === '0', JSON.stringify(saved));

  await page.evaluate(() => openVizPanel()); await page.click('#toggleThermoBtn');
  await page.evaluate(() => openVizPanel()); await page.click('#toggleLineBtn');
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
  await openAuth(page);
  await page.waitForTimeout(250);
  await page.click('#screenAuthChoice >> text=Зарегистрироваться');
  await page.waitForTimeout(150);
  check('при регистрации есть поле подсказки', await page.locator('#hintField').isVisible());
  check('при регистрации нет кнопки «Забыли PIN?»', !(await page.locator('#tRunForgot').isVisible()));

  await page.fill('#runUsername', 'Максим');
  // Регистрация — только 6 цифр: 4 не уходят на сервер, а говорят почему
  await page.fill('#runPin', '1234');
  await page.click('#runAuthSubmitBtn');
  await page.waitForTimeout(200);
  const short4 = await page.evaluate(() => ({ err: document.getElementById('runAuthError').textContent,
    sent: window.__rpcCalls.filter(c => c.name === 'register_student').length,
    label: document.getElementById('tRunPin').textContent }));
  check('регистрация с PIN из 4 цифр — «ровно 6 цифр», на сервер не уходит',
    short4.err === 'PIN — ровно 6 цифр' && short4.sent === 0 && short4.label === 'PIN (6 цифр)', JSON.stringify(short4));
  await page.fill('#runPin', '123456');
  await page.fill('#runHint', 'номер дома');
  await page.click('#runAuthSubmitBtn');
  await page.waitForTimeout(300);
  const reg = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'register_student').pop());
  check('подсказка уходит на сервер при регистрации',
    reg && reg.args.p_hint === 'номер дома', JSON.stringify(reg && reg.args));

  await done(page);

  // На экране входа подсказку можно запросить по имени
  const page2 = await newGame(browser);
  await openAuth(page2);
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
  await openAuth(page3);
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
  await page4.evaluate(() => { document.getElementById('pfEditFold').open = true; });
  await page4.click('#tShowPin');
  await page4.waitForTimeout(150);
  check('свой PIN показывается по нажатию',
    (await page4.locator('#tShowPin').textContent()).includes('1234'));
  check('выход из аккаунта остался на месте — под «Ещё»', await page4.evaluate(() => !!document.querySelector('#pfMoreFold #tLogoutStart')));
  // Повторное нажатие на PIN прячет его
  await page4.evaluate(() => { document.getElementById('pfEditFold').open = true; });
  await page4.click('#tShowPin');
  await page4.waitForTimeout(150);
  check('второе нажатие прячет PIN',
    !(await page4.locator('#tShowPin').textContent()).includes('1234'),
    await page4.locator('#tShowPin').textContent());
  // Закрыл профиль с открытым PIN — в следующий раз он снова спрятан
  await page4.evaluate(() => { document.getElementById('pfEditFold').open = true; });
  await page4.click('#tShowPin');
  await page4.click('#tProfileDone');
  await page4.click('#accountChip');
  await page4.waitForTimeout(200);
  check('при новом открытии профиля PIN снова спрятан',
    !(await page4.locator('#tShowPin').textContent()).includes('1234'));
  await done(page4);

  // Забыл спрятать — прячется сам через 10 секунд. Часы подменены, чтобы
  // не ждать по-настоящему
  const page5 = await newGame(browser, { user: 'Максим', clock: true });
  await page5.click('#accountChip');
  await page5.waitForTimeout(200);
  await page5.evaluate(() => { document.getElementById('pfEditFold').open = true; });
  await page5.click('#tShowPin');
  await page5.clock.runFor(9000);
  const at9 = await page5.locator('#tShowPin').textContent();
  await page5.clock.runFor(1500);
  const at10 = await page5.locator('#tShowPin').textContent();
  check('через 9 секунд PIN ещё виден', at9.includes('1234'), at9);
  check('через 10 секунд прячется сам', !at10.includes('1234'), at10);
  await done(page5);
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
  await liftCurtainIfShown(page);
  const mid = await nl();
  check('пока идёт партия, ответ на прямой не отмечен', mid.answer === 0, JSON.stringify(mid));
  check('текущая догадка отмечена залитой точкой', mid.current === 1);
  check('счётчик показывает остаток попыток: «Осталось 4 из 5»',
    /^Осталось \d+ из \d+$/.test((await page.locator('#attemptsLabel').textContent()).trim()),
    await page.locator('#attemptsLabel').textContent());

  // Проигрыш: два холодных хода, потом мимо в последней догадке
  await page.fill('#guessInput', '90');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  await liftCurtainIfShown(page);
  await page.fill('#guessInput', '95');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  check('последняя догадка открывает поле ответа', await page.locator('#finalBox').isVisible());
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

  // Новая игра возвращает шкалу и обычный счётчик
  await page.click('#resultBox .btn');
  await page.waitForTimeout(300);
  check('в новой партии счётчик снова про попытки',
    (await page.locator('#attemptsLabel').textContent()).includes('Осталось '));

  // Победа: ответ и догадка — одно и то же число
  await page.evaluate(() => { secret = 40; renderAll(); });
  await page.fill('#guessInput', '25');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  await liftCurtainIfShown(page);
  await page.fill('#guessInput', '40');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(300);
  await liftCurtainIfShown(page);
  const won = await nl();
  check('после победы ответ отмечен на прямой', won.answer === 1, JSON.stringify(won));
  check('и подписан он ответом, а не догадкой', won.answerLabels.join() === '40',
    won.answerLabels.join(' '));
  const wonLabel = await page.locator('#attemptsLabel').textContent();
  // Рекорд — в той же строке, отдельной строки над ней больше нет
  check('после победы счётчик показывает число ходов и рекорд', wonLabel.trim() === '2 хода · рекорд 2' &&
    (await page.locator('#tConfirmed').textContent()) === '', wonLabel);

  await done(page);
}

// Шкала расстояний — полоска поясов под ответом: текущий подсвечен, по
// нажатию раскрывается с числами, и это помнится
async function testScaleMemory(browser) {
  console.log('\nШкала расстояний: полоска под ответом');
  const page = await gameWithStorage(browser, { user: 'Максим' }, { hc_scale_open: '1', hc_games_done: '3' });
  check('старые записи о шкале убраны',
    await page.evaluate(() => localStorage.getItem('hc_scale_open') === null && localStorage.getItem('hc_games_done') === null));
  await page.click('#tModeSolo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  check('полоска из 8 поясов видна сразу', await page.locator('#scaleStrip').isVisible() &&
    await page.locator('#ssBar .ss-seg').count() === 8);
  check('числа шкалы свёрнуты', !(await page.locator('#legendGrid').isVisible()));
  const far = await page.evaluate(() => secret > (RANGE_MIN + RANGE_MAX) / 2 ? RANGE_MIN : RANGE_MAX);
  await page.fill('#guessInput', String(far));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  const lit = await page.evaluate(() => ({
    on: [...document.querySelectorAll('#ssBar .ss-seg.on')].map(e => +e.dataset.tier),
    want: currentMove().meta.labelIndex }));
  check('подсвечен пояс последнего хода', lit.on.length === 1 && lit.on[0] === lit.want, JSON.stringify(lit));
  await page.click('#scaleStrip');
  await page.waitForTimeout(150);
  check('нажатие раскрывает шкалу с числами', await page.locator('#legendGrid').isVisible() &&
    await page.locator('#legendGrid .legend-item').count() === 8);
  check('и в списке подсвечен тот же пояс',
    await page.evaluate(() => +document.querySelector('#legendGrid .legend-item.on').dataset.tier === currentMove().meta.labelIndex));
  check('выбор запоминается', await page.evaluate(() => localStorage.getItem('hc_scale_strip')) === '1');
  await page.click('#scaleStrip');
  await page.waitForTimeout(150);
  check('повторное нажатие сворачивает', !(await page.locator('#legendGrid').isVisible()));
  await done(page);

  // Градусник, прямая, подсказка и звук — в меню «вид», с подписями
  const tp = await newGame(browser, {});
  await tp.click('#tModeSolo');
  await tp.click('#tStartMatch');
  await tp.waitForTimeout(300);
  check('три значка в строке статуса заменены одной кнопкой',
    !(await tp.locator('#toggleThermoBtn').isVisible()) && await tp.locator('#vizBtn').isVisible());
  await tp.click('#vizBtn');
  const rows = await tp.evaluate(() => [...document.querySelectorAll('#vizPanel .viz-row:not(.hidden)')].map(r => r.textContent.trim()));
  // В тренировке пятый — «Где может быть число». Шестой — питомец, только у кого он есть
  check('в меню — пять подписанных переключателей', rows.length === 5 && rows.every(r => r.length > 3), rows.join(' | '));
  await tp.click('#toggleThermoBtn');
  check('меню не закрывается от переключения', await tp.locator('#vizPanel').isVisible() &&
    !(await tp.evaluate(() => showThermo)));
  await tp.click('#feedbackPanel, #numLine', { force: true }).catch(() => {});
  await tp.mouse.click(10, 700);
  await tp.waitForTimeout(100);
  check('нажатие мимо закрывает меню', !(await tp.locator('#vizPanel').isVisible()));
  await tp.click('#vizBtn');
  await tp.evaluate(() => quitToMenu());
  check('уход из партии закрывает меню', await tp.evaluate(() => document.getElementById('vizPanel').classList.contains('hidden')));
  await done(tp);
}

// Галочки нарисованы свои: системный чекбокс — белый квадрат на тёмном экране
async function testCheckboxLook(browser) {
  console.log('\nВид переключателей');
  const page = await newGame(browser);
  await page.click('#tModeSolo');
  await page.waitForTimeout(250);
  const look = () => page.evaluate(() => {
    const el = document.getElementById('frostSetup');
    const cs = getComputedStyle(el), knob = getComputedStyle(el, '::after');
    return { appearance: cs.appearance || cs.webkitAppearance, w: parseFloat(cs.width), h: parseFloat(cs.height),
             bg: cs.backgroundColor, knob: parseFloat(knob.left) };
  });
  const off = await look();
  check('переключатель свой, а не системная галочка', off.appearance === 'none' && off.w > off.h * 1.4, JSON.stringify(off));
  await page.check('#frostSetup');
  await page.waitForTimeout(400);
  const on = await look();
  check('включённый — зелёный, бегунок справа', /43, 209, 143/.test(on.bg) && on.knob > off.knob + 10, JSON.stringify(on));
  check('пояснение спрятано за «?»', !(await page.locator('#tFrostHint').isVisible()));
  await page.click('.frost-row .hint-q');
  check('«?» показывает пояснение и не трогает переключатель',
    await page.locator('#tFrostHint').isVisible() && await page.isChecked('#frostSetup'));
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
  await liftCurtainIfShown(page);
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
  await page.evaluate(() => openVizPanel()); await page.click('#toggleThermoBtn');
  await page.waitForTimeout(200);
  // Прямую при перерисовке без хода не трогают вовсе: закончившееся движение
  // остаётся в разметке, но точка стоит на своём числе и никуда не едет
  const idle = await page.evaluate(async () => {
    const dot = () => [...document.querySelectorAll('#numLineSvg circle')].find(e => e.getAttribute('r') === '5');
    const at = () => Math.round(dot().cx.animVal.valueInSpecifiedUnits * 10) / 10;
    const a = at();
    renderAll();
    const b = at();
    await new Promise(r => setTimeout(r, 300));
    return { a, b, c: at(), base: Math.round(parseFloat(dot().getAttribute('cx')) * 10) / 10, cx: dot().getAttribute('cx') };
  });
  check('без нового хода точка стоит', idle.a === idle.base && idle.b === idle.base && idle.c === idle.base,
    JSON.stringify(idle));
  check('и остаётся на месте последнего хода', idle.cx === second.cx);
  await page.evaluate(() => openVizPanel()); await page.click('#toggleThermoBtn');

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

// «Играет Александра» под заголовком убрано: кто вошёл, видно по кружку в шапке
async function testHubGreeting(browser) {
  console.log('\nХаб без строки «Играет …»');
  const page = await newGame(browser, { user: 'Александра' });
  await page.click('#tModeRun');
  await page.waitForTimeout(400);
  const hub = await page.evaluate(() => ({
    greeting: !!document.querySelector('.run-greeting, #runGreeting, #onlineGreeting'),
    text: document.getElementById('screenRunHub').innerText,
    chip: document.getElementById('accountChipName').textContent.trim(),
    overflow: document.documentElement.scrollWidth - innerWidth }));
  check('на хабе Испытания нет строки «Играет …»', !hub.greeting && !/Играет/.test(hub.text), hub.text.slice(0, 80));
  check('кто вошёл — видно по кружку в нижнем меню', hub.chip === 'А', hub.chip);
  check('и экран не растянут вбок', hub.overflow === 0);
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
             line: r('#numLine'), histTitle: r('#historyList'),
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
    await liftCurtainIfShown(page);
  }
  await page.waitForTimeout(300);

  const g = await geom(page);
  check('карточка идёт сразу за строкой статуса', g.card.top < g.line.top, JSON.stringify(g));
  // Градусник на итогах повторял карточку, а ответ и так на прямой
  check('на итогах градусника нет — ответ отмечен на прямой',
    !(await page.locator('#thermoWrap').isVisible()) && await page.locator('#numLine').isVisible());
  check('и не заезжает на саму строку статуса', g.card.top >= g.bar.bottom, g.bar.bottom + ' / ' + g.card.top);
  check('карточка видна целиком, без прокрутки', g.card.bottom <= g.view,
    g.card.bottom + ' при экране ' + g.view);
  check('прямая под ней не слипается с историей', g.histTitle.top - g.line.bottom >= 10,
    (g.histTitle.top - g.line.bottom) + 'px');

  // Во время игры карточки нет, и прямая стоит как стояла
  await page.click('#resultBox .btn');
  await page.waitForTimeout(300);
  check('во время игры карточки не видно', !(await page.locator('#resultBox').isVisible()));
  check('в новой партии карточки ответа нет до первого хода', !(await page.locator('#feedbackPanel').isVisible()));
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
  check('в дуэли итог раунда тоже сверху', d.card.top < d.line.top, JSON.stringify(d));
  check('и градусника на итогах раунда нет', !(await duel.locator('#thermoWrap').isVisible()));
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
  await page.click('#friendsBtn');
  await page.waitForTimeout(250);
  check('без аккаунта просят войти', await page.locator('#screenAuthChoice').isVisible());
  await page.click('#tRunChoiceRegister');
  await page.waitForTimeout(200);
  await page.fill('#runUsername', 'Лев');
  await page.fill('#runPin', '123456');
  await page.click('#runAuthSubmitBtn');
  await page.waitForTimeout(400);
  check('после входа попадаем туда, откуда пришли',
    await page.locator('#screenFriends').isVisible());
  check('кто вошёл — видно по кружку в нижнем меню',
    (await page.locator('#accountChipName').textContent()).trim() === 'Л');
  // Друзей нет — вместо трёх сообщений сразу раскрытый поиск
  check('пустой список: без лишних надписей, сразу поиск',
    (await page.locator('#friendsNote').textContent()) === '' && await page.locator('#friendSearch').isVisible(),
    await page.locator('#friendsNote').textContent());
  await done(page);

  // Список тех, кто недавно играл, — на месте пустого поиска
  page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__suggested = [{ username: 'Гриша', best_run_score: 300 },
                          { username: 'Поля', best_run_score: 0 }];
  });
  await page.click('#friendsBtn');
  await page.waitForTimeout(500);
  check('со входом сразу открывается экран друзей', await page.locator('#screenFriends').isVisible());
  check('у новичка без друзей поиск раскрыт сразу', await page.locator('#friendSearch').isVisible());
  const suggested = await page.evaluate(() => ({
    rows: [...document.querySelectorAll('#searchResults .friend-row')].map(r => r.dataset.name),
    btns: [...document.querySelectorAll('#searchResults .fr-btn')].map(b => b.textContent),
    note: document.getElementById('searchNote').textContent
  }));
  check('пустой поиск показывает, кто недавно играл',
    suggested.rows.join() === 'Гриша,Поля', suggested.rows.join());
  check('их можно добавить прямо оттуда',
    suggested.btns.every(b => b === 'Добавить'), suggested.btns.join());
  check('и объяснено, что это за список',
    suggested.note.indexOf('Недавно играли') >= 0, suggested.note);

  // Ввели имя — список сменился поиском, стёрли — вернулся
  await page.evaluate(() => { window.__found = [{ username: 'Кира', relation: null }]; });
  await page.fill('#friendSearch', 'ки');
  await page.click('#tFindBtn');
  await page.waitForTimeout(400);
  check('поиск вытесняет список',
    await page.evaluate(() =>
      [...document.querySelectorAll('#searchResults .friend-row')].map(r => r.dataset.name).join()) === 'Кира');
  await page.fill('#friendSearch', '');
  await page.waitForTimeout(500);
  check('пустое поле возвращает список',
    await page.evaluate(() =>
      [...document.querySelectorAll('#searchResults .friend-row')].map(r => r.dataset.name).join()) === 'Гриша,Поля');
  await done(page);

  // Поиск
  page = await newGame(browser, { user: 'Лев' });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);

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
  // «Убрать» стояло вровень с «Вызвать» — мимо пальцем, и друга нет. Теперь
  // оно за «⋯», чтобы до него было два осознанных нажатия
  check('другу предлагают вызвать, а «убрать» спрятано за «⋯»',
    search.rows[1].btns.join() === 'Вызвать,⋯', JSON.stringify(search.rows[1]));
  await page.click('#searchResults .friend-row:nth-child(2) .fr-btn.more');
  await page.waitForTimeout(150);
  // «⋯» открывает окно со всеми действиями: рядом с «Убрать» теперь
  // «Пожаловаться» и «Заблокировать», в строке им тесно
  const more = await page.evaluate(() => ({
    open: !document.getElementById('friendSheet').classList.contains('hidden'),
    name: document.getElementById('fsName').textContent,
    btns: [...document.querySelectorAll('#friendSheet button')].filter(b => !b.classList.contains('hidden')).map(b => b.textContent)
  }));
  check('«⋯» открывает окно: написать, убрать, пожаловаться, заблокировать',
    more.open && more.name.includes('Ким') &&
    more.btns.join() === '✉️ Написать,Убрать из друзей,⚠️ Пожаловаться,🚫 Заблокировать,Отмена', JSON.stringify(more));
  await page.click('#fsRemove');
  await page.waitForTimeout(300);
  const removed = await page.evaluate(() =>
    (window.__rpcCalls.filter(c => c.name === 'remove_friend').pop() || {}).args);
  check('и «Убрать» уходит на сервер с именем друга',
    removed && removed.p_other === 'Ким', JSON.stringify(removed));
  // Заявку, которая ждёт ответа, повторно не отправишь — её можно только забрать
  check('висящую заявку предлагают отменить, а не отправить снова',
    search.rows[2].btns.join() === 'Отменить', JSON.stringify(search.rows[2]));

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
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  const list = await page.evaluate(() =>
    [...document.querySelectorAll('#friendsList .friend-row')].map(r => r.dataset.name + ':' + r.dataset.relation));
  check('входящие заявки стоят первыми',
    list.join(' ') === 'Кира:incoming Аня:friend Боря:friend Яна:outgoing', list.join(' '));

  // Свою заявку можно забрать назад: отправил не тому — и она висела вечно
  const outRow = '#friendsList .friend-row[data-relation="outgoing"]';
  check('у своей заявки есть кнопка отмены',
    await page.evaluate(sel => {
      const b = document.querySelector(sel + ' .fr-btn');
      return !!b && b.textContent === 'Отменить';
    }, outRow));
  await page.evaluate(() => {
    window.__friends = [{ username: 'Аня', relation: 'friend' },
                        { username: 'Кира', relation: 'incoming' },
                        { username: 'Боря', relation: 'friend' }];
  });
  await page.click(outRow + ' .fr-btn');
  await page.waitForTimeout(400);
  const cancelled = await page.evaluate(() => ({
    sent: (window.__rpcCalls.filter(c => c.name === 'cancel_friend_request').pop() || {}).args,
    rows: [...document.querySelectorAll('#friendsList .friend-row')].map(r => r.dataset.name).join(' ')
  }));
  check('отмена уходит на сервер с именем адресата',
    cancelled.sent && cancelled.sent.p_to === 'Яна', JSON.stringify(cancelled.sent));
  check('и строка со списка пропадает',
    cancelled.rows.indexOf('Яна') < 0, cancelled.rows);

  // Мгновенный повтор сервер не пропустит — и это должно быть сказано словами
  await page.evaluate(() => {
    window.__friends = [{ username: 'Яна', relation: 'outgoing' }];
    window.__rpcError = { name: 'cancel_friend_request', message: 'recently_cancelled' };
  });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click(outRow + ' .fr-btn');
  await page.waitForTimeout(400);
  const cancelNote = await page.evaluate(() => document.getElementById('friendsNote').textContent);
  check('запрет на мгновенный повтор объяснён словами',
    cancelNote.indexOf('через час') >= 0, cancelNote);
  await page.evaluate(() => { window.__rpcError = null; });

  await page.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'incoming' },
                        { username: 'Аня', relation: 'friend' },
                        { username: 'Боря', relation: 'friend' },
                        { username: 'Яна', relation: 'outgoing' }];
  });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);

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
  await page.click('#friendsBtn');
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
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  check('опрос запущен', await page.evaluate(() => friendsTimer !== null));
  await page.click('#navPlay');
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
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);

  // Вызов приходит и его можно принять
  const invite = await page.evaluate(() => {
    const r = document.querySelector('#screenFriends .friend-row[data-id]');
    return { state: r && r.dataset.state,
             btns: r ? [...r.querySelectorAll('.fr-btn')].map(b => b.textContent) : [] };
  });
  check('входящий вызов виден прямо в строке друга', invite.state === 'incoming', JSON.stringify(invite));
  check('и его можно принять или отклонить',
    invite.btns.join() === 'Принять,✕', invite.btns.join());

  await page.click('#screenFriends .friend-row[data-id] .fr-btn.yes');
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
  await liftCurtainIfShown(page);
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
  await liftCurtainIfShown(page);
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
  check('выход из дружеской игры возвращает к друзьям, а не в меню',
    await page.locator('#screenFriends').isVisible());
  check('опрос матча остановлен', await page.evaluate(() => matchTimer === null));
  check('матч при этом не закрыт',
    await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'leave_match').length) === 0);
  await done(page);

  // Вызов друга
  const p2 = await newGame(browser, { user: 'Лев' });
  await p2.evaluate(() => { window.__friends = [{ username: 'Кира', relation: 'friend' }]; });
  await p2.click('#friendsBtn');
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
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click('#screenFriends .friend-row[data-id] .fr-btn');
  await page.waitForTimeout(600);

  // Часы
  const clock = await page.evaluate(() => ({
    shown: !document.getElementById('turnClock').classList.contains('hidden'),
    text: document.getElementById('turnClock').textContent,
    seconds: online.turnSeconds
  }));
  check('часы хода видны', clock.shown, JSON.stringify(clock));
  check('на ход тридцать секунд', clock.seconds === 30, String(clock.seconds));
  // «Ваш ход» — ярлык над своей плашкой, в самих часах только секунды: без повтора
  const tag = () => page.evaluate(() => {
    const on = [0, 1].find(p => !document.getElementById('pturn' + p).classList.contains('hidden'));
    return { seat: on, mine: online.seat, text: on === undefined ? '' : document.getElementById('pturn' + on).textContent };
  });
  const mineTag = await tag();
  check('написано, что ход ваш, а часы — только секунды', /^⏱ \d+ с$/.test(clock.text) &&
    mineTag.seat === mineTag.mine && mineTag.text === 'Ваш ход', clock.text + ' ' + JSON.stringify(mineTag));

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
  await page.evaluate(() => { D.cur = 1; renderAll(); renderClock(); });
  const theirTag = await tag();
  check('чужой ход подписан иначе — «ходит» над плашкой соперника',
    theirTag.seat !== theirTag.mine && theirTag.text === 'ходит', JSON.stringify(theirTag));

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
  await p2.click('#friendsBtn');
  await p2.waitForTimeout(400);
  await p2.click('#screenFriends .friend-row[data-id] .fr-btn');
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
  await p3.click('#friendsBtn');
  await p3.waitForTimeout(400);
  await p3.click('#screenFriends .friend-row[data-id] .fr-btn');
  await p3.waitForTimeout(600);
  check('вынужденный ход объявлен', await p3.locator('#forcedTurn').isVisible());
  check('поля ввода при этом нет',
    !(await p3.locator('#guessSection').isVisible()));
  await p3.click('#forcedBtn');
  await p3.waitForTimeout(500);
  check('кнопка отправила вынужденный ход на сервер',
    await p3.evaluate(() => window.__rpcCalls.filter(c => c.name === 'do_forced_turn').length) === 1);
  await done(p3);

  // Онлайн: на отнятом ходе жетон тоже взводится, и ход остаётся за игроком
  const p3b = await newGame(browser, { user: 'Лев' });
  await p3b.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' }];
    window.__matches = [{ id: 1, other: 'Кира', seat: 0, status: 'active',
                          round: 1, wins: [0, 0], my_turn: true }];
    Object.assign(window.__match, { forced: 'skip', cur: 0, seat: 0, tokens: [1, 1],
                                    moves: [{ seat: 1, guess: 20, tier: 3 }] });
  });
  await p3b.click('#friendsBtn');
  await p3b.waitForTimeout(400);
  await p3b.click('#screenFriends .friend-row[data-id] .fr-btn');
  await p3b.waitForTimeout(600);
  const p3bArm = await p3b.evaluate(() => document.getElementById('ptoken0').disabled === false);
  check('на отнятом ходе жетон доступен и в онлайне', p3bArm);
  if (p3bArm) await p3b.click('#ptoken0');
  await p3b.waitForTimeout(500);
  check('взвод ушёл на сервер',
    await p3b.evaluate(() => window.__rpcCalls.filter(c => c.name === 'use_match_token').length) === 1);
  check('кнопка пропуска никуда не делась', await p3b.locator('#forcedTurn').isVisible());
  await p3b.click('#forcedBtn');
  await p3b.waitForTimeout(600);
  const kept = await p3b.evaluate(() => ({
    cur: D.cur, armed: D.armed, forced: online.forced,
    input: !document.getElementById('guessSection').classList.contains('hidden')
  }));
  check('ход после пропуска с жетоном остался за игроком',
    kept.cur === 0 && !kept.forced, JSON.stringify(kept));
  check('и поле ввода вернулось', kept.input, JSON.stringify(kept));
  await done(p3b);

  // Бонусы в окне вызова
  const p4 = await newGame(browser, { user: 'Лев' });
  await p4.evaluate(() => { window.__friends = [{ username: 'Кира', relation: 'friend' }]; });
  await p4.click('#friendsBtn');
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
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click('#screenFriends .friend-row[data-id] .fr-btn');
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
  check('в ней восемь фраз нового набора',
    pad.codes.join() === 'hi,luck,nice,wow,think,almost,again,gg', pad.codes.join(','));
  check('дружелюбные: без «Время идёт!» и «Ледяной холод!»',
    pad.texts.some(t => t.indexOf('Удачи') >= 0) && pad.texts.some(t => t.indexOf('Почти') >= 0) &&
    !pad.texts.some(t => /Время идёт|Ледяной/.test(t)), pad.texts.join(' | '));
  check('есть кнопка «скрыть фразы»', pad.mute);

  // Отправка
  await page.click('#sayPad button[data-code="luck"]');
  await page.waitForTimeout(500);
  const sent = await page.evaluate(() => ({
    args: (window.__rpcCalls.filter(c => c.name === 'send_phrase').pop() || {}).args,
    bubble: document.getElementById('sayBubble').textContent,
    shown: !document.getElementById('sayBubble').classList.contains('hidden')
  }));
  check('фраза ушла кодом, а не текстом',
    sent.args.p_code === 'luck' && sent.args.p_match_id === 1, JSON.stringify(sent.args));
  check('своя фраза видна на доске', sent.shown && sent.bubble.indexOf('Удачи') >= 0, sent.bubble);
  check('и подписана именем', sent.bubble.indexOf('Лев') >= 0, sent.bubble);

  // Фраза соперника приходит опросом
  await page.evaluate(() => {
    window.__match.chat.push({ id: 99, seat: 1, code: 'wow', ago: 0 });
  });
  await page.waitForTimeout(2600);
  const from = await page.evaluate(() => document.getElementById('sayBubble').textContent);
  check('фраза соперника приходит сама', from.indexOf('Кира') >= 0 && from.indexOf('Ого') >= 0, from);

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
    window.__match.chat.push({ id: 100, seat: 1, code: 'gg', ago: 0 });
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

// ------------------------------------------------------------ карточка итогов
async function testRoundCard(browser) {
  console.log('\nКарточка итогов раунда');

  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeDuel');
  await page.waitForTimeout(200);
  await page.selectOption('#rangeMax', '100');
  await page.waitForTimeout(150);
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    D.names = ['Александра', 'Кира'];
    D.wins = [1, 2];
    D.winsNeeded = 3;
    D.roundOver = true;
    D.roundWinner = 1;
    D.matchOver = false;
    secret = 42;
    renderAll();
  });

  const compact = await page.evaluate(() => {
    const box = document.getElementById('resultBox');
    const title = box.querySelector('.r-title');
    const nums = [...box.querySelectorAll('.rs-num')].map(e => e.getBoundingClientRect());
    const vs = box.querySelector('.r-vs').getBoundingClientRect();
    const mid = r => (r.top + r.bottom) / 2;
    return { iconInTitle: !!title.querySelector('.r-icon'), titleH: Math.round(title.getBoundingClientRect().height),
             vsOff: Math.round(Math.abs(mid(vs) - mid(nums[0]))), h: Math.round(box.getBoundingClientRect().height) };
  });
  check('значок стоит в строке заголовка, а не отдельным этажом', compact.iconInTitle, JSON.stringify(compact));
  check('двоеточие — посередине счёта, а не ниже', compact.vsOff <= 3, JSON.stringify(compact));
  check('карточка раунда компактная', compact.h <= 250, JSON.stringify(compact));

  const card = await page.evaluate(() => {
    const box = document.getElementById('resultBox');
    const names = [...box.querySelectorAll('.rs-name')];
    const nums = [...box.querySelectorAll('.rs-num')];
    const r = e => e.getBoundingClientRect();
    return {
      names: names.map(e => e.textContent),
      nums: nums.map(e => e.textContent),
      chips: box.querySelectorAll('.r-chip').length,
      // Имя стоит над своим счётом: выше по вертикали и по той же середине
      above: names.length === 2 && nums.length === 2 &&
             r(names[0]).bottom <= r(nums[0]).top + 1 &&
             r(names[1]).bottom <= r(nums[1]).top + 1,
      aligned: names.length === 2 && nums.length === 2 &&
               Math.abs((r(names[0]).left + r(names[0]).right) / 2 -
                        (r(nums[0]).left + r(nums[0]).right) / 2) < 2 &&
               Math.abs((r(names[1]).left + r(names[1]).right) / 2 -
                        (r(nums[1]).left + r(nums[1]).right) / 2) < 2,
      // Счёт крупнее имени: на него и смотрят
      bigger: nums.length === 2 &&
              parseFloat(getComputedStyle(nums[0]).fontSize) >
              parseFloat(getComputedStyle(names[0]).fontSize),
      colors: names.map(e => getComputedStyle(e).color)
        .concat(nums.map(e => getComputedStyle(e).color)),
      width: box.scrollWidth <= box.clientWidth + 1
    };
  });
  check('в карточке два имени и два числа',
    card.names.join() === 'Александра,Кира' && card.nums.join() === '1,2',
    JSON.stringify(card.names) + ' / ' + JSON.stringify(card.nums));
  check('старых плашек «имя счёт» больше нет', card.chips === 0, String(card.chips));
  check('имя стоит строкой выше своего счёта', card.above);
  check('и ровно над ним', card.aligned);
  check('счёт крупнее имени', card.bigger);
  check('цвет имени и его счёта совпадает',
    card.colors[0] === card.colors[2] && card.colors[1] === card.colors[3],
    card.colors.join(' | '));
  check('длинное имя не растягивает карточку', card.width);

  await done(page);
}

// ------------------------------------------------- удаление аккаунта и оклик
async function testAccountDelete(browser) {
  console.log('\nУдаление аккаунта');

  const page = await newGame(browser, { user: 'Лев' });
  await page.click('#friendsBtn');
  await page.waitForTimeout(500);
  await page.click('#accountChip');
  await page.waitForTimeout(250);

  const inAccount = await page.evaluate(() => ({
    open: !document.getElementById('logoutModal').classList.contains('hidden'),
    del: document.getElementById('tDeleteAccount').textContent,
    danger: document.getElementById('tDeleteAccount').classList.contains('danger')
  }));
  check('в окне аккаунта есть удаление', inAccount.open && inAccount.del === 'Удалить аккаунт',
    inAccount.del);
  check('и оно выделено как опасное', inAccount.danger);

  await page.evaluate(() => { document.getElementById('pfMoreFold').open = true; });
  await page.click('#tDeleteAccount');
  await page.waitForTimeout(250);
  const ask = await page.evaluate(() => ({
    open: !document.getElementById('deleteModal').classList.contains('hidden'),
    account: !document.getElementById('logoutModal').classList.contains('hidden'),
    text: document.getElementById('tDeleteAsk').textContent,
    stay: document.getElementById('tDeleteCancel').textContent,
    go: document.getElementById('tDeleteGo').textContent
  }));
  check('удаление спрашивает отдельным окном', ask.open && !ask.account);
  check('в вопросе названо имя', ask.text.indexOf('Лев') >= 0, ask.text);
  check('и сказано, что именно исчезнет: друзья, монеты и покупки — без рейтинга',
    /Друзья, рекорды, монеты и покупки/.test(ask.text) && ask.text.indexOf('навсегда') >= 0 && !/Рейтинг/.test(ask.text), ask.text);
  check('и что игры у друзей останутся',
    ask.text.indexOf('останутся у друзей') >= 0, ask.text);
  check('уйти из окна можно', ask.stay === 'Отмена', ask.stay);
  check('кнопка удаления названа прямо', ask.go === 'Удалить навсегда', ask.go);

  // Отказ ничего не делает
  await page.click('#tDeleteCancel');
  await page.waitForTimeout(200);
  check('отказ закрывает окно и никого не удаляет', await page.evaluate(() =>
    document.getElementById('deleteModal').classList.contains('hidden') &&
    !window.__deleted && !!localStorage.getItem('hc_run_user')));

  // Согласие удаляет и выкидывает в меню
  await page.evaluate(() => { window.alert = () => {}; });
  await page.click('#accountChip');
  await page.waitForTimeout(200);
  await page.evaluate(() => { document.getElementById('pfMoreFold').open = true; });
  await page.click('#tDeleteAccount');
  await page.waitForTimeout(200);
  await page.click('#tDeleteGo');
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({
    called: !!window.__deleted,
    user: localStorage.getItem('hc_run_user'),
    menu: !document.getElementById('screenMode').classList.contains('hidden')
  }));
  check('удаление ушло на сервер', after.called);
  check('аккаунт с устройства стёрт', !after.user, String(after.user));
  check('и человек оказался в меню', after.menu);
  await done(page);

  // Удалённый соперник показывается словами, а не служебным именем
  const p2 = await newGame(browser, { user: 'Лев' });
  await p2.evaluate(() => {
    window.__matches = [{ id: 5, other: '#12', seat: 0, status: 'active',
                          round: 1, wins: [0, 0], my_turn: true, ranked: false }];
  });
  await p2.click('#friendsBtn');
  await p2.waitForTimeout(500);
  const row = await p2.evaluate(() =>
    (document.querySelector('#gamesList .fr-name') || {}).textContent);
  check('вместо служебного имени написано «удалённый игрок»',
    row === 'удалённый игрок', String(row));
  await done(p2);
}

// ------------------------------------------------------------------ оклик
async function testAwayAlerts(browser) {
  console.log('\nОклик из соседней вкладки');

  const page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__friends = [];
    window.__matches = [];
  });
  await page.click('#friendsBtn');
  await page.waitForTimeout(500);
  const base = await page.title();

  // Вкладка открыта — молчим
  await page.evaluate(() => { window.__matches = [{ id: 3, other: 'Кира', seat: 1,
    status: 'invited', round: 1, wins: [0, 0], my_turn: false, ranked: false }]; });
  await page.evaluate(() => loadMatches(true));
  await page.waitForTimeout(400);
  check('пока вкладка открыта, заголовок не трогаем',
    (await page.title()) === base, await page.title());

  // Человек ушёл в другую вкладку
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    window.__matches = [{ id: 4, other: 'Кира', seat: 1, status: 'invited',
                          round: 1, wins: [0, 0], my_turn: false, ranked: false }];
  });
  await page.evaluate(() => loadMatches(true));
  await page.waitForTimeout(400);
  const away = await page.title();
  check('вызов в фоне помечается в заголовке',
    away.indexOf('(1)') === 0 && away.indexOf(base) > 0, away);

  // Тот же вызов второй раз не считается
  await page.evaluate(() => loadMatches(true));
  await page.waitForTimeout(300);
  check('один и тот же вызов не считается дважды',
    (await page.title()).indexOf('(1)') === 0, await page.title());

  // Заявка в друзья добавляет ещё один
  await page.evaluate(() => {
    window.__friends = [{ username: 'Гриша', relation: 'incoming' }];
  });
  await page.evaluate(() => loadFriends(true));
  await page.waitForTimeout(400);
  check('заявка в друзья считается отдельно',
    (await page.title()).indexOf('(2)') === 0, await page.title());

  // Вернулись — заголовок чистый
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(250);
  check('возвращение очищает заголовок', (await page.title()) === base, await page.title());
  await done(page);
}

// ------------------------------------------------------- переписка с другом
async function testFriendChat(browser) {
  console.log('\nПереписка с другом');

  const page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__friends = [
      { username: 'Кира', relation: 'friend', unread: 3 },
      { username: 'Гриша', relation: 'incoming', unread: 0 }
    ];
    window.__talk = { 'Кира': [
      { id: 1, mine: false, code: 'play', ago: 300 },
      { id: 2, mine: true, code: 'later', ago: 120 },
      { id: 3, mine: false, code: 'hour', ago: 10 }
    ] };
  });
  await page.click('#friendsBtn');
  await page.waitForTimeout(600);

  const list = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#friendsList .friend-row')];
    const friend = rows.find(r => r.dataset.name === 'Кира');
    const incoming = rows.find(r => r.dataset.name === 'Гриша');
    const st = r => (r.querySelector('.fr-status') || {}).textContent || '';
    return {
      badge: friend ? st(friend) : null,
      clickable: friend ? getComputedStyle(friend).cursor : null,
      // На заявке переписки быть не может — друзьями ещё не стали
      noBadge: incoming ? st(incoming).indexOf('💬') < 0 : false,
      noClick: incoming ? getComputedStyle(incoming).cursor !== 'pointer' : false
    };
  });
  check('непрочитанное видно прямо под именем', list.badge === '💬 3 новых', String(list.badge));

  // Значок в шапке считает и фразы, и неотвеченные заявки
  const hdr = await page.evaluate(() => ({
    shown: !document.getElementById('friendsBadge').classList.contains('hidden'),
    text: document.getElementById('friendsBadge').textContent,
    btn: !document.getElementById('friendsBtn').classList.contains('hidden')
  }));
  check('кнопка «Друзья» живёт в шапке', hdr.btn);
  check('на ней видно, сколько всего ждёт ответа',
    hdr.shown && hdr.text === '4', JSON.stringify(hdr));
  check('и на строку друга можно нажать', list.clickable === 'pointer', String(list.clickable));
  check('у неотвеченной заявки переписки нет', list.noBadge && list.noClick);

  // Открываем переписку
  await page.click('#friendsList .friend-row[data-name="Кира"] .fr-name');
  await page.waitForTimeout(600);
  const chat = await page.evaluate(() => ({
    open: !document.getElementById('screenChat').classList.contains('hidden'),
    who: document.getElementById('chatWho').textContent,
    msgs: [...document.querySelectorAll('.chat-msg')].map(e => ({
      code: e.dataset.code, mine: e.classList.contains('mine'), text: e.textContent
    })),
    pad: [...document.querySelectorAll('#chatPad button')].map(b => b.dataset.code),
    texts: [...document.querySelectorAll('#chatPad button')].map(b => b.textContent)
  }));
  check('переписка открылась и названа по имени',
    chat.open && chat.who === 'Кира', chat.who);
  const chatLook = await page.evaluate(() => {
    const pad = [...document.querySelectorAll('#chatPad button')];
    const rows = new Set(pad.map(b => Math.round(b.getBoundingClientRect().top))).size;
    const msg = document.querySelector('.chat-msg');
    const ago = msg.querySelector('.cm-ago').getBoundingClientRect();
    const txt = msg.getBoundingClientRect();
    const invite = document.getElementById('tChatFriendly').getBoundingClientRect();
    return { face: document.getElementById('chatFace').textContent, rows,
             oneLine: ago.bottom <= txt.bottom && Math.round(txt.height) <= 44,
             invite: Math.round(invite.bottom), view: innerHeight };
  });
  check('в заголовке переписки — кружок друга', chatLook.face === 'К', JSON.stringify(chatLook));
  check('фразы — «таблетки», рядов меньше, чем было (8)', chatLook.rows <= 6, JSON.stringify(chatLook));
  check('время сообщения в той же строке, что и текст', chatLook.oneLine, JSON.stringify(chatLook));
  check('«Дружеская игра» видна без прокрутки', chatLook.invite <= chatLook.view, JSON.stringify(chatLook));
  check('видно всю ленту в правильном порядке',
    chat.msgs.map(m => m.code).join() === 'play,later,hour', chat.msgs.map(m => m.code).join());
  check('свои и чужие фразы различаются',
    chat.msgs.map(m => m.mine).join() === 'false,true,false',
    chat.msgs.map(m => m.mine).join());
  check('фразы показаны словами, а не кодами',
    chat.msgs[0].text.indexOf('Сыграем?') === 0, chat.msgs[0].text);
  check('у каждой видно, когда она сказана',
    chat.msgs[0].text.indexOf('5 мин назад') > 0, chat.msgs[0].text);
  // Вне игры пишут текстом; под рукой — четыре быстрых ответа
  check('быстрых ответов четыре', chat.pad.join() === 'hi,play,later,bye', chat.pad.join(','));
  check('есть поле для текста и кнопка отправки',
    await page.locator('#chatText').isVisible() && await page.locator('#tChatSend').isVisible());
  check('в поле не больше 200 символов',
    (await page.getAttribute('#chatText', 'maxlength')) === '200');

  // Отправка фразы
  await page.click('#chatPad button[data-code="bye"]');
  await page.waitForTimeout(600);
  const sent = await page.evaluate(() => ({
    calls: window.__rpcCalls.filter(c => c.name === 'send_friend_phrase').map(c => c.args.p_code),
    last: (document.querySelector('.chat-msg:last-child') || {}).dataset,
    count: document.querySelectorAll('.chat-msg').length
  }));
  check('фраза ушла на сервер', sent.calls.join() === 'bye', sent.calls.join());
  check('и сразу появилась в ленте своей',
    sent.count === 4 && sent.last.code === 'bye', JSON.stringify(sent));

  // Текст: пустое не уходит, Enter отправляет, разметка остаётся буквами
  await page.fill('#chatText', '   ');
  await page.click('#tChatSend');
  await page.waitForTimeout(300);
  check('пустое сообщение не отправляется',
    await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'send_friend_text').length) === 0);
  await page.fill('#chatText', '  Давай в 5? <b>жду</b>  ');
  await page.press('#chatText', 'Enter');
  await page.waitForTimeout(600);
  const txt = await page.evaluate(() => {
    const last = document.querySelector('.chat-msg:last-child');
    return { args: (window.__rpcCalls.filter(c => c.name === 'send_friend_text').pop() || {}).args,
             text: last.firstChild.textContent, bold: !!last.querySelector('b'),
             mine: last.classList.contains('mine'), input: document.getElementById('chatText').value };
  });
  check('Enter отправляет текст без пробелов по краям',
    txt.args && txt.args.p_to === 'Кира' && txt.args.p_text === 'Давай в 5? <b>жду</b>', JSON.stringify(txt.args));
  check('текст в ленте как написан — разметка не срабатывает',
    txt.text === 'Давай в 5? <b>жду</b>' && !txt.bold && txt.mine, JSON.stringify(txt));
  check('поле очистилось', txt.input === '', txt.input);

  // Близко к пределу — видно, сколько осталось
  await page.fill('#chatText', 'а'.repeat(185));
  const left = await page.evaluate(() => ({ shown: !document.getElementById('chatLeft').classList.contains('hidden'),
                                            text: document.getElementById('chatLeft').textContent }));
  check('у предела видно, сколько символов осталось', left.shown && left.text === 'Осталось символов: 15',
    JSON.stringify(left));
  await page.fill('#chatText', 'коротко');
  check('в начале счётчика не видно', !(await page.locator('#chatLeft').isVisible()));
  await page.evaluate(() => { window.__talkError = 'too_long'; });
  await page.click('#tChatSend');
  await page.waitForTimeout(400);
  check('слишком длинное — так и сказано',
    (await page.locator('#chatNote').textContent()).indexOf('до 200 символов') >= 0,
    await page.locator('#chatNote').textContent());
  await page.evaluate(() => { window.__talkError = 'Could not find the function public.send_friend_text'; });
  await page.click('#tChatSend');
  await page.waitForTimeout(400);
  check('сервер без обновления — понятное объяснение',
    (await page.locator('#chatNote').textContent()).indexOf('после обновления сервера') >= 0,
    await page.locator('#chatNote').textContent());
  check('и набранный текст не пропал', (await page.inputValue('#chatText')) === 'коротко');
  await page.evaluate(() => { window.__talkError = null; });

  // Сервер отказал — человек должен прочитать почему
  await page.evaluate(() => { window.__talkError = 'too_fast'; });
  await page.click('#chatPad button[data-code="hi"]');
  await page.waitForTimeout(600);
  const note = await page.evaluate(() => ({
    text: document.getElementById('chatNote').textContent,
    bad: document.getElementById('chatNote').classList.contains('bad')
  }));
  check('отказ сервера объяснён словами',
    note.bad && note.text.indexOf('Слишком часто') >= 0, note.text);
  await page.evaluate(() => { window.__talkError = null; });

  // Из переписки зовут только в дружескую игру: игр на звёзды больше нет
  check('в переписке нет вызова на рейтинг', await page.evaluate(() =>
    !document.getElementById('chatModes') && !document.getElementById('chatModesFold')));

  // Дружеская игра настраивается — уводит в то же окно вызова
  await page.click('#tChatFriendly');
  await page.waitForTimeout(600);
  const friendly = await page.evaluate(() => ({
    friends: !document.getElementById('screenFriends').classList.contains('hidden'),
    box: !document.getElementById('challengeBox').classList.contains('hidden'),
    name: document.getElementById('challengeBox').dataset.name
  }));
  check('дружеская игра открывает окно вызова с настройками',
    friendly.friends && friendly.box, JSON.stringify(friendly));
  check('и вызывает того же человека', friendly.name === 'Кира', String(friendly.name));
  await done(page);
}

// ------------------------------------------------ уведомления на закрытое
async function testPushNotifications(browser) {
  console.log('\nУведомления');

  // Ключа на сервере нет — переключателя быть не должно
  let page = await newGame(browser, { user: 'Лев', push: {} });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click('#accountChip');
  await page.waitForTimeout(700);
  check('без ключа на сервере уведомления не предлагаются',
    await page.evaluate(() =>
      document.getElementById('tPushToggle').classList.contains('hidden')));
  await done(page);

  // Ключ есть — появляется кнопка
  page = await newGame(browser, { user: 'Лев', push: { key: 'BBfy2eKdFPotrpnneRKep1FWCJ89mIlNtvGSLKB34dMs1e2JOzQL0rNr-RzSNKi8lmYIiUqCQc03G8He8_TR5yI' } });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click('#accountChip');
  await page.waitForTimeout(700);
  const off = await page.evaluate(() => ({
    hidden: document.getElementById('tPushToggle').classList.contains('hidden'),
    text: document.getElementById('tPushToggle').textContent
  }));
  check('с ключом кнопка появляется', !off.hidden);
  check('и предлагает включить', off.text === '🔔 Включить уведомления', off.text);

  // Включаем
  await page.click('#tPushToggle');
  await page.waitForTimeout(700);
  const on = await page.evaluate(() => ({
    saved: window.__push.saved,
    text: document.getElementById('tPushToggle').textContent,
    note: document.getElementById('pushNote').textContent
  }));
  check('подписка ушла на сервер с адресом и ключами',
    on.saved && on.saved.p_endpoint === 'https://push.example/dev1' &&
    on.saved.p_p256dh === 'PPP' && on.saved.p_auth === 'AAA', JSON.stringify(on.saved));
  check('и с языком, на котором читает этот человек',
    on.saved && on.saved.p_lang === 'ru', on.saved && on.saved.p_lang);
  check('кнопка стала выключателем', on.text === '🔕 Выключить уведомления', on.text);
  check('и сказано, что всё готово', on.note.indexOf('включены') >= 0, on.note);

  // Выключаем
  await page.click('#tPushToggle');
  await page.waitForTimeout(700);
  const back = await page.evaluate(() => ({
    dropped: window.__push.dropped,
    unsub: window.__push.unsubscribed,
    text: document.getElementById('tPushToggle').textContent
  }));
  check('отписка ушла и в браузер, и на сервер',
    back.unsub === true && back.dropped === 'https://push.example/dev1', JSON.stringify(back));
  check('кнопка снова предлагает включить',
    back.text === '🔔 Включить уведомления', back.text);
  await done(page);

  // Другой язык — подписка должна уехать с ним, а не с русским
  const KEY = 'BBfy2eKdFPotrpnneRKep1FWCJ89mIlNtvGSLKB34dMs1e2JOzQL0rNr-RzSNKi8lmYIiUqCQc03G8He8_TR5yI';
  page = await newGame(browser, { user: 'Лев', lang: 'fr', push: { key: KEY } });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click('#accountChip');
  await page.waitForTimeout(700);
  await page.click('#tPushToggle');
  await page.waitForTimeout(700);
  const fr = await page.evaluate(() => window.__push.saved);
  check('язык подписки берётся у читающего, а не подставляется всегда русский',
    fr && fr.p_lang === 'fr', fr && fr.p_lang);
  await done(page);

  // Телефон отказал
  page = await newGame(browser, { user: 'Лев', push: { key: 'BBfy2eKdFPotrpnneRKep1FWCJ89mIlNtvGSLKB34dMs1e2JOzQL0rNr-RzSNKi8lmYIiUqCQc03G8He8_TR5yI' } });
  await page.evaluate(() => { window.__push.permission = 'denied'; });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click('#accountChip');
  await page.waitForTimeout(700);
  await page.click('#tPushToggle');
  await page.waitForTimeout(700);
  const denied = await page.evaluate(() => ({
    note: document.getElementById('pushNote').textContent,
    bad: document.getElementById('pushNote').classList.contains('bad'),
    saved: window.__push.saved
  }));
  check('отказ телефона объяснён словами',
    denied.bad && denied.note.indexOf('разрешите') >= 0, denied.note);
  check('и на сервер ничего не ушло', denied.saved === null, JSON.stringify(denied.saved));
  await done(page);

  // Подписка не завелась — на айфоне это про домашний экран
  page = await newGame(browser, { user: 'Лев', push: { key: 'BBfy2eKdFPotrpnneRKep1FWCJ89mIlNtvGSLKB34dMs1e2JOzQL0rNr-RzSNKi8lmYIiUqCQc03G8He8_TR5yI' } });
  await page.evaluate(() => { window.__push.subscribeFails = true; });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click('#accountChip');
  await page.waitForTimeout(700);
  await page.click('#tPushToggle');
  await page.waitForTimeout(700);
  const home = await page.evaluate(() => document.getElementById('pushNote').textContent);
  check('несостоявшаяся подписка объяснена домашним экраном',
    home.indexOf('домашний экран') >= 0, home);
  await done(page);

  // Айфон во вкладке Safari: кнопки нет и быть не может, но молчать нельзя
  page = await newGame(browser, { user: 'Лев', push: {
    key: 'BBfy2eKdFPotrpnneRKep1FWCJ89mIlNtvGSLKB34dMs1e2JOzQL0rNr-RzSNKi8lmYIiUqCQc03G8He8_TR5yI',
    ios: true, noPushManager: true } });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click('#accountChip');
  await page.waitForTimeout(700);
  const tab = await page.evaluate(() => ({
    hidden: document.getElementById('tPushToggle').classList.contains('hidden'),
    note: document.getElementById('pushNote').textContent
  }));
  check('во вкладке Safari кнопки уведомлений нет', tab.hidden);
  check('но сказано, почему её нет', tab.note.indexOf('домашний экран') >= 0, tab.note);
  await done(page);

  // На обычном телефоне этой подсказки быть не должно: она там неуместна
  page = await newGame(browser, { user: 'Лев', push: {
    key: 'BBfy2eKdFPotrpnneRKep1FWCJ89mIlNtvGSLKB34dMs1e2JOzQL0rNr-RzSNKi8lmYIiUqCQc03G8He8_TR5yI' } });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  await page.click('#accountChip');
  await page.waitForTimeout(700);
  const android = await page.evaluate(() => document.getElementById('pushNote').textContent);
  check('там, где уведомления работают, про домашний экран не говорится',
    android.indexOf('домашний экран') < 0, android);
  await done(page);
}

// ------------------------------------------ новый вид: шапка, профиль, меню, друзья, дуэль
async function testNewLook(browser) {
  console.log('\nНовый вид: шапка, профиль, меню, друзья');

  // Шапка у вошедшего: профиль — кружок с буквой, его не спутать с «Друзьями»
  let page = await newGame(browser, { user: 'Максим' });
  const hdr = await page.evaluate(() => {
    const chip = document.getElementById('accountChip');
    return {
      chipVisible: !chip.classList.contains('hidden'),
      letter: document.getElementById('accountChipName').textContent.trim(),
      bg: getComputedStyle(document.getElementById('accountFace')).backgroundColor,
      friends: document.getElementById('friendsBtn').textContent.trim(),
      langInHeader: !!document.querySelector('.top-controls #langSwitcher')
    };
  });
  check('профиль виден уже в главном меню', hdr.chipVisible);
  check('профиль — первая буква имени, а не силуэт 👤', hdr.letter === 'М', hdr.letter);
  check('у кружка свой цвет', hdr.bg !== 'rgba(0, 0, 0, 0)' && hdr.bg !== 'rgba(255, 255, 255, 0.1)', hdr.bg);
  check('кнопка друзей выглядит иначе, чем профиль', hdr.friends.indexOf('М') < 0 && hdr.friends !== hdr.letter);
  check('язык больше не занимает место в шапке', !hdr.langInHeader);

  // Цвет считается из имени: у одного имени всегда один цвет, у разных — обычно разный
  const colors = await page.evaluate(() => ({
    same: avatarColor('Максим') === avatarColor('Максим'),
    spread: new Set(['Аня', 'Боря', 'Кира', 'Лев', 'Яна', 'Ким', 'Максим', 'Оля']
      .map(avatarColor)).size,
    emoji: avatarLetter('🦊Лиса'),
    lower: avatarLetter('анна')
  }));
  check('цвет аватара не меняется от раза к разу', colors.same);
  check('у разных людей разные цвета', colors.spread >= 4, String(colors.spread));
  check('имя с эмодзи не рвёт кружок пополам', colors.emoji === '🦊', colors.emoji);
  check('буква в кружке заглавная', colors.lower === 'А', colors.lower);

  // Язык меняют прямо в профиле — окно тут же переходит на новый
  await page.click('#accountChip');
  await page.waitForTimeout(150);
  await page.selectOption('#langSwitcher', 'en');
  await page.waitForTimeout(150);
  const flipped = await page.evaluate(() => ({
    done: document.getElementById('tProfileDone').textContent,
    lang: document.getElementById('tLangLabel').textContent,
    menu: document.getElementById('tModeSolo').textContent
  }));
  check('профиль переводится сразу, не закрываясь',
    flipped.done === 'Done' && flipped.lang === 'Language', JSON.stringify(flipped));
  check('и меню за ним тоже', flipped.menu === 'Practice', flipped.menu);
  await page.selectOption('#langSwitcher', 'ru');
  await page.click('#tProfileDone');
  await page.waitForTimeout(100);
  check('«Готово» закрывает профиль', !(await page.locator('#logoutModal').isVisible()));

  // Тап мимо окна тоже закрывает — как в любом приложении
  await page.click('#accountChip');
  await page.waitForTimeout(100);
  await page.mouse.click(5, 5);
  await page.waitForTimeout(100);
  check('тап мимо окна закрывает профиль', !(await page.locator('#logoutModal').isVisible()));

  // Главное меню: у каждого режима значок и короткое «что это» под названием.
  // Раньше подписи убирали; вернули по разбору «понятно ли ребёнку» — новичок
  // не отличал Испытание от Тренировки
  const menu = await page.evaluate(() =>
    [...document.querySelectorAll('#screenMode .mode-btn:not(.hidden)')].map(b => ({
      icon: (b.querySelector('.m-icon') || {}).textContent || '',
      // «🔒 после уроков» бывает только у новичка — у остальных она скрыта
      subs: b.querySelectorAll('.m-sub:not(.hidden)').length
    })));
  check('у каждого режима есть значок', menu.every(m => m.icon.trim().length > 0),
    menu.map(m => m.icon).join(' '));
  check('под каждым режимом — одна короткая подпись', menu.every(m => m.subs === 1),
    menu.map(m => m.subs).join(','));

  // Одиночный режим на очки назывался «Игра на рейтинг»; рейтинга больше нет
  const runName = await page.evaluate(() => document.getElementById('tModeRun').textContent);
  check('одиночный режим на очки называется «Испытание»', runName === 'Испытание' && runName.indexOf('рейтинг') < 0, runName);

  // Два блока по тому, нужен ли интернет: подпись стоит перед своими режимами
  const groups = await page.evaluate(() => {
    const kids = [...document.querySelector('#screenMode .mode-list').children].filter(k => !k.classList.contains('hidden'));
    return kids.map(k => k.classList.contains('mode-group') ? 'G:' + k.textContent
                                                            : k.className.replace('mode-btn ', ''));
  });
  check('меню разбито на «без интернета» и «нужен интернет»',
    groups.join(',') === 'G:Нужен интернет,run wide,G:Без интернета,solo tile,duel tile,bot tile', groups.join(','));
  for (const lang of ['en', 'fr', 'de']) {
    await setLang(page, lang);
    const heads = await page.evaluate(() =>
      [...document.querySelectorAll('#screenMode .mode-group')].map(e => e.textContent.trim()));
    check('подписи блоков переведены: ' + lang, heads.length === 2 && heads.every(x => x.length > 0)
      && heads[0] !== 'Без интернета', heads.join(' | '));
  }
  await setLang(page, 'ru');
  await done(page);

  // Гость: вместо буквы шестерёнка, внутри язык и вход
  page = await newGame(browser, {});
  const guest = await page.evaluate(() => {
    const chip = document.getElementById('accountChip');
    return { visible: !chip.classList.contains('hidden'), face: document.getElementById('accountChipName').textContent.trim(),
             guest: document.getElementById('accountFace').classList.contains('guest') };
  });
  check('без аккаунта в нижнем меню шестерёнка', guest.visible && guest.face === '⚙' && guest.guest,
    JSON.stringify(guest));
  await page.click('#accountChip');
  await page.waitForTimeout(150);
  const sheet = await page.evaluate(() => ({
    lang: !!document.querySelector('#logoutModal #langSwitcher'),
    signIn: !document.getElementById('tSignIn').classList.contains('hidden'),
    pin: !document.getElementById('pfAccount').classList.contains('hidden'),
    logout: !document.getElementById('pfLogout').classList.contains('hidden'),
    del: !document.getElementById('tDeleteAccount').classList.contains('hidden')
  }));
  check('гость может сменить язык', sheet.lang);
  check('и войти оттуда же', sheet.signIn);
  check('PIN, выхода и удаления у гостя нет', !sheet.pin && !sheet.logout && !sheet.del, JSON.stringify(sheet));
  await page.selectOption('#langSwitcher', 'de');
  await page.waitForTimeout(150);
  check('гость меняет язык без входа',
    (await page.evaluate(() => document.getElementById('tModeSolo').textContent)) === 'Training');
  await page.selectOption('#langSwitcher', 'ru');
  await page.click('#tSignIn');
  await page.waitForTimeout(200);
  check('«Войти» ведёт к выбору входа', await page.locator('#screenAuthChoice').isVisible());
  await done(page);

  // Друзья: сначала те, кто ждёт ответа, и сами друзья, поиск — внизу
  page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'incoming' }, { username: 'Аня', relation: 'friend' },
                        { username: '#7', relation: 'friend' }];
  });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  const order = await page.evaluate(() => {
    const y = id => document.getElementById(id).getBoundingClientRect().top;
    return { friends: y('friendsList'), games: y('gamesList'), search: y('findBox'),
             titles: document.querySelectorAll('#screenFriends .lb-title:not(.hidden)').length,
             avatars: Object.fromEntries([...document.querySelectorAll('#friendsList .friend-row')]
               .map(r => [r.dataset.name, (r.querySelector('.avatar') || {}).textContent])) };
  });
  // Отдельного списка игр больше нет: игры — в строках друзей, а блок
  // «чужих» игр без таких игр скрыт
  check('отдельного списка игр при обычных друзьях нет',
    !(await page.locator('#gamesBox').isVisible()), JSON.stringify(order));
  check('поиск — последним', order.friends < order.search, JSON.stringify(order));

  // Друзья есть — поиск свёрнут в одну строку и раскрывается по нажатию
  check('с друзьями поиск свёрнут', !(await page.locator('#friendSearch').isVisible()));
  check('видна только строка «Найти игрока»',
    (await page.locator('#tLblFindFriend').textContent()) === '🔍 Найти игрока' &&
    await page.locator('#tLblFindFriend').isVisible());
  await page.click('#tLblFindFriend');
  await page.waitForTimeout(150);
  check('нажатие раскрывает поиск', await page.locator('#friendSearch').isVisible());
  await page.evaluate(() => loadFriends(true));
  await page.waitForTimeout(300);
  check('опрос списка раскрытый поиск не сворачивает', await page.locator('#friendSearch').isVisible());
  await page.click('#tLblFindFriend');
  await page.waitForTimeout(150);
  check('повторное нажатие сворачивает', !(await page.locator('#friendSearch').isVisible()));
  await page.evaluate(() => { window.__friends = []; loadFriends(true); });
  await page.waitForTimeout(300);
  check('и свёрнутый опрос тоже не трогает', !(await page.locator('#friendSearch').isVisible()));
  await page.evaluate(() => { window.__friends = [{ username: 'Кира', relation: 'incoming' },
    { username: 'Аня', relation: 'friend' }, { username: '#7', relation: 'friend' }]; });
  check('у каждого в списке кружок с буквой',
    order.avatars['Кира'] === 'К' && order.avatars['Аня'] === 'А', JSON.stringify(order.avatars));
  check('у удалённого игрока — знак вопроса, а не буква служебного имени',
    order.avatars['#7'] === '?', JSON.stringify(order.avatars));

  // Открытое окно «⋯» не должно захлопываться, пока список обновляется опросом
  await page.click('#friendsList .friend-row[data-name="Аня"] .fr-btn.more');
  await page.waitForTimeout(100);
  await page.evaluate(() => loadFriends(true));
  await page.waitForTimeout(300);
  const stillOpen = await page.evaluate(() => ({
    open: !document.getElementById('friendSheet').classList.contains('hidden'),
    name: document.getElementById('fsName').textContent }));
  check('открытое окно «⋯» переживает обновление списка', stillOpen.open && stillOpen.name.includes('Аня'),
    JSON.stringify(stillOpen));
  await page.evaluate(() => closeFriendSheet());
  await done(page);

  // Дуэль на телефоне: ничего не вылезает за карточку, поле ввода — на экране.
  // Ширина 360 — самые узкие из ходовых телефонов: на 390 старая сетка уже
  // помещалась благодаря мелкому шрифту кнопки, и поломка проходила бы молча
  const ctx = await browser.newContext({ viewport: { width: 360, height: 700 } });
  page = await ctx.newPage();
  await applyStub(page, {});
  await page.addInitScript(() => {
    window.tokenSpills = b => {
      const cs = getComputedStyle(b);
      const room = b.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const r = document.createRange();
      r.selectNodeContents(b);
      return r.getBoundingClientRect().width > room + 0.5;
    };
  });
  await page.goto(GAME_URL);
  await page.waitForTimeout(300);
  await page.click('.mode-btn.duel');
  await page.waitForTimeout(200);
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  await page.fill('#guessInput', '50');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(300);
  await liftCurtainIfShown(page);
  const duel = await page.evaluate(() => {
    const card = document.getElementById('card');
    const edge = card.getBoundingClientRect().right - parseFloat(getComputedStyle(card).paddingRight);
    const out = [...document.querySelectorAll('#screenGame .pcard, #screenGame .info-bar, #screenGame .turn-banner')]
      .filter(e => e.getBoundingClientRect().right > edge + 1).map(e => e.id || e.className);
    // Длинное слово на кнопке («Дополнительный», «supplémentaire») не должно
    // вылезать за её рамку
    // Меряем сам текст: scrollWidth заползание в поля кнопки не видит, а на
    // глаз слово тогда упирается в рамку
    const spill = [...document.querySelectorAll('.token-btn')].filter(tokenSpills)
      .map(b => b.id + ': ' + b.textContent);
    return { out, spill, input: document.getElementById('guessInput').getBoundingClientRect().bottom };
  });
  check('в дуэли на телефоне ничего не вылезает за правый край', duel.out.length === 0, duel.out.join(', '));
  check('надпись на кнопке жетона помещается в кнопку', duel.spill.length === 0, duel.spill.join('; '));
  const tokenText = await page.evaluate(() => document.getElementById('ptoken0').textContent.trim());
  check('на кнопке жетона короткое «⚡ +1 ход»', tokenText.indexOf('⚡ +1 ход') === 0, tokenText);
  // Шрифт больше не ужимается под ширину: короткой надписи хватает обычного
  const tokenFont = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('ptoken0')).fontSize));
  check('и написана обычным шрифтом, а не мелким', tokenFont >= 12, tokenFont + 'px');
  // И на французском, где слово ещё длиннее
  await page.evaluate(() => { document.getElementById('langSwitcher').value = 'fr'; changeLanguage(); });
  await page.waitForTimeout(200);
  const spillFr = await page.evaluate(() => [...document.querySelectorAll('.token-btn')]
    .filter(tokenSpills).map(b => b.id + ': ' + b.textContent));
  check('и на французском тоже', spillFr.length === 0, spillFr.join('; '));
  await page.evaluate(() => { document.getElementById('langSwitcher').value = 'ru'; changeLanguage(); });
  check('поле ввода видно без прокрутки на экране высотой 700', duel.input <= 700, Math.round(duel.input) + 'px');
  await ctx.close();
}

// ------------------------------------ фора, названия экранов, раскладка
async function testCalmScreens(browser) {
  console.log('\nФора, названия экранов, раскладка');

  // Фора — только жетоны, и в подписи имена, а не «Игрок 1»
  let page = await newGame(browser);
  await page.click('#tModeDuel');
  await page.waitForTimeout(200);
  await page.fill('#nameP1', 'Маша');
  await page.fill('#nameP2', 'Петя');
  const hc = await page.evaluate(() => [...document.querySelectorAll('#handicap option')].map(o => o.textContent));
  check('в форе только «нет» и «⚡ +1 ход ×2» кому-то одному',
    hc.join(' | ') === 'Нет | Маша — ⚡ +1 ход ×2 | Петя — ⚡ +1 ход ×2', hc.join(' | '));
  check('«всегда ходит первым» убрано', !hc.some(o => /перв/.test(o)), hc.join(' | '));
  const setupLook = await page.evaluate(() => ({
    title: document.getElementById('tSetupScreen').textContent,
    p1: document.getElementById('nameP1').getBoundingClientRect().top,
    p2: document.getElementById('nameP2').getBoundingClientRect().top
  }));
  check('у формы дуэли своё название', setupLook.title === '🤝 Игра с другом', setupLook.title);
  check('имена игроков в одну строку', Math.abs(setupLook.p1 - setupLook.p2) < 1, JSON.stringify(setupLook));

  await page.selectOption('#handicap', '2');
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  const r1 = await page.evaluate(() => ({ tokens: D.tokens.join(), starter: D.starter }));
  check('фора даёт второй жетон выбранному', r1.tokens === '1,2', JSON.stringify(r1));
  await page.evaluate(() => { D.roundOver = true; nextRound(); });
  const r2 = await page.evaluate(() => ({ tokens: D.tokens.join(), starter: D.starter }));
  check('в следующем раунде первый ход переходит к другому', r1.starter === 0 && r2.starter === 1,
    JSON.stringify([r1, r2]));
  check('а лишний жетон остаётся у того же', r2.tokens === '1,2', JSON.stringify(r2));
  await done(page);

  page = await newGame(browser);
  await page.click('#tModeSolo');
  await page.waitForTimeout(200);
  check('у тренировки своё название',
    (await page.locator('#tSetupScreen').textContent()) === '🎯 Тренировка');
  await done(page);

  // Шапка с названием — только на главном; на остальных экранах наверху
  // свой заголовок, и стоит он там же, где стояла шапка: ничего не прыгает
  page = await newGame(browser, { user: 'Лев' });
  const headTop = () => page.evaluate(() => {
    const el = [...document.querySelectorAll('.top-controls, .screen-title, #infoBar')]
      .find(e => e.getClientRects().length && e.getBoundingClientRect().height > 0);
    return el ? Math.round(el.getBoundingClientRect().top) : null;
  });
  const tops = { menu: await headTop() };
  await page.click('#tModeSolo'); await page.waitForTimeout(200); tops.setup = await headTop();
  await page.click('#tStartMatch'); await page.waitForTimeout(300); tops.game = await headTop();
  await page.evaluate(() => quitToMenu()); await page.waitForTimeout(200);
  await page.click('#tModeRun'); await page.waitForTimeout(400); tops.run = await headTop();
  check('верх экрана не прыгает между экранами', Math.max(...Object.values(tops)) - Math.min(...Object.values(tops)) <= 4,
    JSON.stringify(tops));
  const hub = await page.evaluate(() => {
    const b = document.getElementById('tRunStart').getBoundingClientRect();
    const f = document.querySelector('#screenRunHub .frost-row').getBoundingClientRect();
    // «Начать» — первой, «Мороз и Жара» — сразу под ней, с отступом
    return { gap: Math.round(f.top - b.bottom), title: document.getElementById('tRunScreen').textContent,
             greet: !!document.getElementById('runGreeting') };
  });
  check('у «Испытания» название, без строки «Играет …»',
    hub.title === '🏆 Испытание' && !hub.greet, JSON.stringify(hub));
  check('«Мороз и Жара» под кнопкой и не прилипает к ней', hub.gap >= 8, hub.gap + 'px');
  await done(page);

  // Вход: подпись под названием, а не узкой полоской сбоку
  page = await newGame(browser);
  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  const choice = await page.evaluate(() => ['tRunChoiceRegister', 'tRunChoiceLogin'].map(id => {
    const t = document.getElementById(id).getBoundingClientRect();
    const sub = document.getElementById(id + 'Sub').getBoundingClientRect();
    return { below: sub.top >= t.bottom - 1, lines: Math.round(sub.height / 17) };
  }));
  check('подпись под названием', choice.every(c => c.below), JSON.stringify(choice));
  check('и не больше двух строк', choice.every(c => c.lines <= 2), JSON.stringify(choice));
  await done(page);

  // Строка статуса в игре — одна строка даже на узком телефоне, без пустого
  // «Число загадано ✓»; «Меню» — значком с подписью для подсказки
  for (const m of ['Solo', 'Duel']) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => check('без ошибок JS', false, e.message));
    await applyStub(p, {});
    await p.goto(GAME_URL);
    await p.waitForTimeout(300);
    await p.click('#tMode' + m);
    await p.waitForTimeout(200);
    await p.click('#tStartMatch');
    await p.waitForTimeout(300);
    const bar = await p.evaluate(() => {
      const b = document.getElementById('infoBar');
      const tops = [...b.querySelectorAll('#attemptsLabel, .bar-actions')]
        .map(e => Math.round(e.getBoundingClientRect().top + e.getBoundingClientRect().height / 2));
      const menu = document.getElementById('tMenu');
      return { text: b.innerText, oneLine: Math.abs(tops[0] - tops[1]) <= 2,
               menu: menu.textContent, label: menu.getAttribute('aria-label'), title: menu.title };
    });
    check(m + ': в строке статуса нет «Число загадано»', !/загадано/.test(bar.text), bar.text);
    check(m + ': строка статуса в одну строку на 360px', bar.oneLine, JSON.stringify(bar));
    check(m + ': «Меню» — значок с подписью', bar.menu === '☰' && bar.label === 'Меню' && bar.title === 'Меню',
      JSON.stringify(bar));
    await ctx.close();
  }

  // В «Испытании» на этом месте — «Пауза» словом
  page = await newGame(browser, { user: 'Лев' });
  await page.click('#tModeRun');
  await page.waitForTimeout(500);
  await page.click('#tRunStart');
  await page.waitForTimeout(400);
  check('в «Испытании» кнопка называется «Пауза»',
    (await page.locator('#tMenu').textContent()) === 'Пауза');
  await done(page);
}

// ------------------------------------ друзья: один список со статусами
async function testFriendsBoard(browser) {
  console.log('\nДрузья: один список со статусами');
  let page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__friends = [
      { username: 'Егор', relation: 'friend' },
      { username: 'GABI', relation: 'outgoing' },
      { username: 'Аня', relation: 'friend', unread: 2 },
      { username: 'Вика', relation: 'friend' },
      { username: 'Кира', relation: 'incoming' },
      { username: 'Боря', relation: 'friend' },
      { username: 'Гоша', relation: 'friend' },
      { username: 'Дима', relation: 'friend' }];
    window.__matches = [
      { id: 1, other: 'Боря', seat: 1, status: 'invited', round: 1, wins: [0, 0], my_turn: false },
      { id: 2, other: 'Вика', seat: 0, status: 'active', round: 2, wins: [1, 0], my_turn: true },
      { id: 3, other: 'Гоша', seat: 0, status: 'active', round: 1, wins: [0, 0], my_turn: false },
      { id: 4, other: 'Дима', seat: 0, status: 'invited', round: 1, wins: [0, 0], my_turn: false },
      { id: 9, other: 'Незнакомец', seat: 0, status: 'active', round: 1, wins: [0, 0], my_turn: true }];
  });
  await page.click('#friendsBtn');
  await page.waitForTimeout(800);
  const rows = await page.evaluate(() => [...document.querySelectorAll('#friendsList .friend-row')].map(r => ({
    name: r.dataset.name, state: r.dataset.state || '', status: (r.querySelector('.fr-status') || {}).textContent,
    hot: !!r.querySelector('.fr-status.hot'), btns: [...r.querySelectorAll('.fr-btn')].map(b => b.textContent) })));
  const by = Object.fromEntries(rows.map(r => [r.name, r]));
  check('порядок по срочности: заявка, зовут играть, ваш ход, сообщения, ход друга, вызов, остальные, ждут ответа',
    rows.map(r => r.name).join() === 'Кира,Боря,Вика,Аня,Гоша,Дима,Егор,GABI', rows.map(r => r.name).join());
  check('заявка в друзья — «Хочет дружить», принять или ✕',
    by['Кира'].status === 'Хочет дружить' && by['Кира'].btns.join() === 'Принять,✕', JSON.stringify(by['Кира']));
  check('друг зовёт играть — принять или ✕, без «⋯»',
    by['Боря'].status === 'Зовёт играть' && by['Боря'].btns.join() === 'Принять,✕' && by['Боря'].hot,
    JSON.stringify(by['Боря']));
  check('ваш ход — «Играть», и статус выделен',
    by['Вика'].status === 'Ваш ход' && by['Вика'].btns.join() === 'Играть,⋯' && by['Вика'].hot, JSON.stringify(by['Вика']));
  check('новые сообщения видны под именем',
    by['Аня'].status === '💬 2 новых' && by['Аня'].btns.join() === 'Вызвать,⋯', JSON.stringify(by['Аня']));
  check('ход друга — спокойным цветом',
    by['Гоша'].status === 'Ход друга' && !by['Гоша'].hot, JSON.stringify(by['Гоша']));
  check('свой вызов можно отменить ✕',
    by['Дима'].status === 'Вызов отправлен' && by['Дима'].btns.join() === '✕,⋯', JSON.stringify(by['Дима']));
  check('без событий — «Написать» и «Вызвать»',
    by['Егор'].status === '💬 Написать' && by['Егор'].btns.join() === 'Вызвать,⋯', JSON.stringify(by['Егор']));
  check('своя заявка — «Ждёт ответа» и «Отменить»',
    by['GABI'].status === 'Ждёт ответа' && by['GABI'].btns.join() === 'Отменить', JSON.stringify(by['GABI']));
  const orphans = await page.evaluate(() => ({
    shown: !document.getElementById('gamesBox').classList.contains('hidden'),
    ids: [...document.querySelectorAll('#gamesList .friend-row')].map(r => r.dataset.id) }));
  check('игра с тем, кого нет в друзьях, не пропала — отдельным блоком',
    orphans.shown && orphans.ids.join() === '9', JSON.stringify(orphans));

  // Нажатие на строку открывает переписку, на кнопку — нет
  await page.click('#friendsList .friend-row[data-name="Вика"] .fr-btn.yes');
  await page.waitForTimeout(500);
  check('«Играть» открывает игру, а не переписку', await page.locator('#screenGame').isVisible());
  await page.evaluate(() => openFriends());
  await page.waitForTimeout(700);
  await page.click('#friendsList .friend-row[data-name="Егор"] .fr-status');
  await page.waitForTimeout(500);
  check('нажатие на строку друга открывает переписку',
    await page.locator('#screenChat').isVisible() &&
    (await page.locator('#chatWho').textContent()) === 'Егор');
  await page.evaluate(() => openFriends());
  await page.waitForTimeout(700);
  await page.click('#friendsList .friend-row[data-name="Кира"] .fr-name');
  await page.waitForTimeout(300);
  check('строка заявки переписку не открывает', await page.locator('#screenFriends').isVisible());

  // Вызов — окно наверху списка
  await page.click('#friendsList .friend-row[data-name="Егор"] .fr-btn.yes');
  await page.waitForTimeout(300);
  const ch = await page.evaluate(() => ({
    shown: !document.getElementById('challengeBox').classList.contains('hidden'),
    title: document.getElementById('challengeTitle').textContent,
    above: document.getElementById('challengeBox').getBoundingClientRect().top <
           document.getElementById('friendsList').getBoundingClientRect().top }));
  check('«Вызвать» открывает окно вызова над списком', ch.shown && ch.above && ch.title.indexOf('Егор') >= 0,
    JSON.stringify(ch));
  await done(page);

  // Текст выхода — только вопрос
  page = await newGame(browser, { user: 'Лев' });
  await page.click('#accountChip');
  await page.waitForTimeout(200);
  await page.evaluate(() => { document.getElementById('pfMoreFold').open = true; }); await page.click('#tLogoutStart');
  const ask = await page.locator('#tLogoutAsk').textContent();
  check('при выходе — только вопрос, без лишнего про прогресс и PIN', ask === 'Выйти из аккаунта Лев?', ask);
  await done(page);
}

// ------------------------------------------------------------ цвет фона кружка
async function testAvatarColor(browser) {
  console.log('\nЦвет фона кружка');
  let page = await newGame(browser, { user: 'Максим', profile: { avatar: '🦊', colors: { 'Аня': '#f472b6' } } });
  await page.waitForTimeout(300);
  await page.click('#accountChip');
  await page.waitForTimeout(300);
  await page.click('#pfAvatar');
  await page.waitForTimeout(150);
  const pick = await page.evaluate(() => ({
    colors: [...document.querySelectorAll('#avGrid .av-color')].map(b => b.dataset.color),
    rows: new Set([...document.querySelectorAll('#avGrid .av-color')].map(b => Math.round(b.getBoundingClientRect().top))).size,
    tiles: document.querySelectorAll('#avGrid .av-tile').length }));
  check('в выборе двадцать цветов четырьмя рядами, последние — градиенты',
    pick.colors.length === 20 && pick.rows === 4 && pick.colors.slice(-4).every(c => /^grad-/.test(c)), JSON.stringify(pick));
  // Иконки за боссов — по одной на мир
  const nW = await page.evaluate(() => ADV_WORLDS.length);
  check('и по-прежнему буква, 40 иконок и по иконке за босса каждого мира', pick.tiles === 41 + nW, pick.tiles + ' / ' + nW);

  await page.click('#avGrid .av-color[data-color="#a78bfa"]');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({
    sent: (window.__profile.calls.filter(c => c.name === 'set_avatar_color').pop() || {}).args,
    chip: getComputedStyle(document.getElementById('accountChipName')).backgroundColor,
    big: getComputedStyle(document.getElementById('pfAvatar')).backgroundColor,
    tile: getComputedStyle(document.querySelector('#avGrid .av-tile[data-icon="🐼"]')).backgroundColor,
    sel: [...document.querySelectorAll('#avGrid .av-color.sel')].map(b => b.dataset.color),
    open: !document.getElementById('avGrid').classList.contains('hidden') }));
  const violet = 'rgb(167, 139, 250)';
  check('цвет уходит на сервер', after.sent && after.sent.p_color === '#a78bfa', JSON.stringify(after.sent));
  check('и сразу виден в шапке, в профиле и под иконками',
    after.chip === violet && after.big === violet && after.tile === violet, JSON.stringify(after));
  check('выбранный цвет отмечен', after.sel.join() === '#a78bfa', after.sel.join());
  check('после цвета выбор не закрывается — можно выбрать и животное', after.open);

  // Сервер не принял — цвет возвращается
  await page.evaluate(() => { window.__profile.colorError = 'invalid_color'; });
  await page.click('#avGrid .av-color[data-color="#f87171"]');
  await page.waitForTimeout(300);
  const back = await page.evaluate(() => getComputedStyle(document.getElementById('pfAvatar')).backgroundColor);
  check('отказ сервера возвращает прежний цвет', back === violet, back);
  await done(page);

  // Цвет друга виден в списке
  page = await newGame(browser, { user: 'Лев', profile: { colors: { 'Аня': '#e2e8f0' } } });
  await page.evaluate(() => { window.__friends = [{ username: 'Аня', relation: 'friend' }]; });
  await page.click('#friendsBtn');
  await page.waitForTimeout(800);
  const friendBg = await page.evaluate(() =>
    getComputedStyle(document.querySelector('#friendsList .friend-row[data-name="Аня"] .avatar')).backgroundColor);
  check('у друга — его цвет', friendBg === 'rgb(226, 232, 240)', friendBg);
  await done(page);

  // Сервер без миграции цвета: выбора цвета нет, всё остальное работает
  page = await newGame(browser, { user: 'Лев', profile: { noColor: true } });
  await page.click('#accountChip');
  await page.waitForTimeout(400);
  await page.click('#pfAvatar');
  await page.waitForTimeout(150);
  const old = await page.evaluate(() => ({
    colors: document.querySelectorAll('#avGrid .av-color').length,
    tiles: document.querySelectorAll('#avGrid .av-tile').length,
    label: document.getElementById('tAvatarStart').textContent }));
  check('без миграции цвета выбора цвета нет, иконки на месте',
    old.colors === 0 && old.tiles === 41 + await page.evaluate(() => ADV_WORLDS.length) && old.label === 'Сменить иконку', JSON.stringify(old));
  await done(page);
}

// ------------------------------------------------------------ разбор партии
async function soloGame(browser, range, secret, guesses, opts) {
  const page = await newGame(browser, opts || {});
  await page.click('#tModeSolo');
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', String(range));
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  await page.evaluate(s => { secret = s; renderAll(); }, secret);
  for (const g of guesses) {
    await page.fill('#guessInput', String(g));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(80);
    await liftCurtainIfShown(page);
  }
  await page.waitForTimeout(250);
  return page;
}

async function testReview(browser) {
  console.log('\nРазбор партии');

  // Движок сверяется с «лобовым» пересчётом: для случайных позиций энтропия
  // каждого хода и множество возможных чисел считаются заново, по определению
  let page = await newGame(browser);
  const cross = await page.evaluate(() => {
    const bad = [];
    for (const [min, max] of [[1, 20], [1, 100], [-50, 50]]) {
      const meta = buildFeedbackMeta(max - min + 1 > 100 ? 100 : max);
      const bands = reviewBands(meta);
      for (let t = 0; t < 30; t++) {
        const secretN = min + Math.floor(Math.random() * (max - min + 1));
        const moves = [];
        for (let k = 0; k < 4; k++) {
          const g = min + Math.floor(Math.random() * (max - min + 1));
          moves.push({ guess: g, labelIndex: bandOf(Math.abs(g - secretN), bands) });
          if (g === secretN) break;
        }
        const rv = analyseGame(moves, min, max, meta, null);
        // Лобовой пересчёт
        let cand = [];
        for (let x = min; x <= max; x++) cand.push(x);
        rv.moves.forEach((m, k) => {
          const H = g => {
            const parts = {};
            cand.forEach(x => { const b = bandOf(Math.abs(g - x), bands); parts[b] = (parts[b] || 0) + 1; });
            return Object.values(parts).reduce((h, c) => h - (c / cand.length) * Math.log2(c / cand.length), 0);
          };
          let hb = 0;
          for (let x = min; x <= max; x++) hb = Math.max(hb, H(x));
          const r = hb > 0 ? H(moves[k].guess) / hb : 0;
          if (Math.abs(H(m.best) - hb) > 1e-9) bad.push('лучший ход не лучший ' + JSON.stringify(m));
          if (m.ratio !== undefined && Math.abs(m.ratio - r) > 1e-9) bad.push('доля ' + m.ratio + ' / ' + r);
          // 100% — только у лучшего: округлённое «Отлично 100%» сбивало бы с толку
          const top = ['best', 'brilliant', 'hit'].includes(m.grade);
          if (top ? m.score !== 100 : !(m.score <= 99 && m.score === Math.min(99, Math.round(r * 100)))) {
            bad.push('процент ' + m.score + ' у «' + m.grade + '»');
          }
          if (!cand.includes(secretN)) bad.push('загаданное выпало из возможных');
          cand = cand.filter(x => bandOf(Math.abs(moves[k].guess - x), bands) === moves[k].labelIndex);
        });
        if (rv.moves.length !== moves.length) bad.push('ходов ' + rv.moves.length + ' из ' + moves.length);
      }
    }
    return bad.slice(0, 5);
  });
  check('движок совпадает с лобовым пересчётом в 90 случайных партиях', cross.length === 0, cross.join('; '));
  check('почти лучший ход — 99%, а не 100%', await page.evaluate(() =>
    movePct(0.996) === 99 && movePct(0.5) === 50 && movePct(0) === 0));

  // Партия из одних лучших ходов — точность 100%
  const perfect = await page.evaluate(() => {
    const min = 1, max = 100, meta = buildFeedbackMeta(100), bands = reviewBands(meta);
    const secretN = 63, moves = [];
    for (let k = 0; k < 12; k++) {
      const rv = analyseGame(moves.concat([{ guess: min, labelIndex: bandOf(Math.abs(min - secretN), bands) }]), min, max, meta, null);
      const best = rv.moves[rv.moves.length - 1].best;
      moves.push({ guess: best, labelIndex: bandOf(Math.abs(best - secretN), bands) });
      if (best === secretN) break;
    }
    const rv = analyseGame(moves, min, max, meta, null);
    return { acc: rv.accuracy, grades: rv.moves.map(m => m.grade) };
  });
  check('одни лучшие ходы — точность 100%', perfect.acc === 100 &&
    perfect.grades.every(g => ['best', 'brilliant', 'hit'].includes(g)), JSON.stringify(perfect));
  check('первый ход не бывает «блестящим» — как дебют в шахматах', perfect.grades[0] === 'best', perfect.grades[0]);

  // Скорость: самый большой диапазон, десять ходов
  const speed = await page.evaluate(() => {
    const min = -1000, max = 1000, meta = buildFeedbackMeta(2000), bands = reviewBands(meta);
    const moves = [0, 500, -300, 250, 100, 10, 40, 33, 30, 31].map(g => ({ guess: g, labelIndex: bandOf(Math.abs(g - 31), bands) }));
    const t0 = performance.now();
    analyseGame(moves, min, max, meta, null);
    return performance.now() - t0;
  });
  check('разбор большой партии считается быстро', speed < 400, Math.round(speed) + ' мс');
  await done(page);

  // Настоящая партия в тренировке
  page = await soloGame(browser, 100, 37, [50, 90, 30, 40, 36, 37]);
  const res = await page.evaluate(() => ({
    btn: (document.getElementById('reviewBtn') || {}).textContent,
    badges: [...document.querySelectorAll('#historyList .gr-badge')].map(b => b.textContent),
    rv: currentReview() }));
  check('в итогах — точность и кнопка разбора', /Точность \d+% · Разбор/.test(res.btn || ''), String(res.btn));
  check('в истории оценок нет — они только в разборе', res.badges.length === 0, res.badges.join(' '));
  check('каждому ходу — оценка из семи или «в точку»',
    res.rv.moves.length === 6 && res.rv.moves.every(m => GRADES_OK.includes(m.grade)) && res.rv.moves[5].grade === 'hit',
    JSON.stringify(res.rv.moves.map(m => m.grade)));
  // Пороги закреплены: эта партия всегда оценивается одинаково
  check('оценки известной партии не поплыли',
    res.rv.moves.map(m => m.grade).join() === 'good,mistake,inaccuracy,good,best,hit' && res.rv.accuracy === 77,
    res.rv.moves.map(m => m.grade).join() + ' / ' + res.rv.accuracy);
  check('у первого хода 50 подсказан лучший — 21', res.rv.moves[0].best === 21 && res.rv.moves[0].grade !== 'best',
    JSON.stringify(res.rv.moves[0]));
  await page.click('#reviewBtn');
  await page.waitForTimeout(200);
  const modal = await page.evaluate(() => ({
    shown: !document.getElementById('reviewModal').classList.contains('hidden'),
    acc: document.getElementById('rvAcc').textContent,
    rows: [...document.querySelectorAll('#rvList .rv-row')].map(r => ({
      g: r.querySelector('.rv-guess').textContent, name: r.querySelector('.g-name').textContent,
      pct: (r.querySelector('.g-pct') || {}).textContent || '', text: r.textContent })),
    chips: [...document.querySelectorAll('#rvSum .rv-chip')].map(c => c.textContent.trim()) }));
  check('разбор открывается: точность, сводка и все ходы', modal.shown && /^\d+%$/.test(modal.acc) &&
    modal.rows.length === 6 && modal.chips.length > 0, JSON.stringify(modal));
  check('рядом с оценкой — процент хода, у «в точку» процента нет',
    modal.rows.every((r, i) => i === 5 ? r.pct === '' : r.pct === res.rv.moves[i].score + '%') &&
    modal.rows[5].name === 'В точку!', JSON.stringify(modal.rows));
  // «Можно лучше» — это оценка; подсказкой было бы «лучше было 21»
  check('лучший ход в разборе не подсказывается', !modal.rows.some(r => /лучше было|21/.test(r.text)),
    JSON.stringify(modal.rows.map(r => r.text)));
  await page.click('#tReviewClose');
  check('разбор закрывается', !(await page.locator('#reviewModal').isVisible()));
  await page.click('#resultBox .btn');
  await page.waitForTimeout(250);
  check('в новой партии значков и кнопки разбора нет', await page.evaluate(() =>
    !document.getElementById('reviewBtn') && !document.querySelector('#historyList .gr-badge')));
  await done(page);

  // Во время тренировки оценок в истории нет: только горячо/холодно. Разбор — после партии
  page = await soloGame(browser, 100, 37, [50, 90]);
  check('во время тренировки у ходов нет оценок', await page.evaluate(() =>
    !document.querySelector('#historyList .h-grade, #historyList .gr-badge')));
  check('кнопки разбора до конца партии нет', await page.evaluate(() => !document.getElementById('reviewBtn')));
  await done(page);

  // В забеге оценок по ходу нет: там очки и рекорды
  page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  await page.click('#tRunStart');
  await page.waitForTimeout(250);
  await page.fill('#guessInput', String(await page.evaluate(() => secret > RANGE_MIN + 30 ? RANGE_MIN : RANGE_MAX)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  await liftCurtainIfShown(page);
  check('в забеге оценок по ходу нет', await page.evaluate(() =>
    history.length === 1 && !document.querySelector('#historyList .h-grade')));
  await done(page);

  // Последняя догадка после исчерпанных попыток — тоже ход в разборе
  page = await newGame(browser);
  await page.click('#tModeSolo');
  await page.selectOption('#rangeMax', '100');
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  await page.evaluate(() => { secret = 40; MAX_GUESSES = 2; renderAll(); });
  for (const g of [80, 20]) { await page.fill('#guessInput', String(g)); await page.click('#tSubmitGuess'); await page.waitForTimeout(80); }
  await page.fill('#finalInput', '99');
  await page.click('#tFinalSubmit');
  await page.waitForTimeout(300);
  const fin = await page.evaluate(() => currentReview().moves.map(m => ({ g: m.guess, grade: m.grade, final: m.final })));
  check('последняя догадка вне возможных — «зевок»',
    fin.length === 3 && fin[2].final && fin[2].g === 99 && fin[2].grade === 'blunder', JSON.stringify(fin));
  await done(page);

  // В игре с другом разбора нет — даже сразу после выигранной тренировки:
  // признак «партия окончена» от неё остаётся, дуэль его не сбрасывает
  page = await soloGame(browser, 100, 50, [50]);
  await page.evaluate(() => quitToMenu());
  await page.waitForTimeout(150);
  await page.click('#tModeDuel');
  await page.selectOption('#winsNeeded', '3');
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  await page.fill('#guessInput', String(await page.evaluate(() => secret === 1 ? 2 : 1)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  check('после тренировки ходы дуэли без значков разбора',
    await page.evaluate(() => !document.querySelector('#historyList .gr-badge')));
  await done(page);

  page = await newGame(browser);
  await page.click('#tModeDuel');
  await page.selectOption('#winsNeeded', '1');
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  const s2 = await page.evaluate(() => secret);
  await page.fill('#guessInput', String(s2));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(300);
  await liftCurtainIfShown(page);
  // Раунд выигран первым же ходом: разбор есть, в нём один ход «в точку»
  check('в игре с другом после раунда — разбор', await page.evaluate(() =>
    !!document.getElementById('reviewBtn') && currentReview().moves.map(m => m.grade).join() === 'hit'));
  await done(page);
}
const GRADES_OK = ['brilliant', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder', 'hit'];

async function testDuelReview(browser) {
  console.log('\nРазбор раунда в игре с другом');
  let page = await newGame(browser);
  // Точная часть движка сверяется с перебором ВСЕХ ходов подряд (без поиска
  // по границам поясов) на маленьком диапазоне
  const exact = await page.evaluate(() => {
    const min = 1, max = 30, meta = buildFeedbackMeta(20), bands = reviewBands(meta);
    const naiveMemo = new Map();
    const naiveW = S => {
      const key = S.join(',');
      if (naiveMemo.has(key)) return naiveMemo.get(key);
      let best = 0;
      for (let g = min; g <= max; g++) {
        const sp = splitOf(S, g, bands);
        if (sp.parts.length === 1 && !sp.parts[0].hit) continue;
        let v = 0;
        sp.parts.forEach(pt => { v += pt.hit ? pt.set.length / S.length : pt.set.length / S.length * (1 - naiveW(pt.set)); });
        best = Math.max(best, v);
      }
      naiveMemo.set(key, best);
      return best;
    };
    const bad = [];
    const memo = new Map();
    for (let t = 0; t < 60; t++) {
      const n = 1 + (t % 7);
      const S = [...new Set(Array.from({ length: n }, () => min + Math.floor(Math.random() * (max - min + 1))))].sort((a, b) => a - b);
      const a = duelWin(S, min, max, bands, memo), b = naiveW(S);
      if (Math.abs(a - b) > 1e-9) bad.push(S.join(',') + ': ' + a + ' / ' + b);
    }
    return { bad: bad.slice(0, 3), one: duelWin([7], min, max, bands, memo), two: duelWin([7, 8], min, max, bands, memo) };
  });
  check('точная часть совпадает с перебором всех ходов', exact.bad.length === 0, exact.bad.join('; '));
  check('одно число — ходящий выигрывает, два — пополам', exact.one === 1 && exact.two === 0.5, JSON.stringify(exact));

  // Жетон: если следующий ход снова мой, подсказка достаётся мне, а не сопернику
  const token = await page.evaluate(() => {
    const meta = buildFeedbackMeta(100), bands = reviewBands(meta), memo = new Map();
    const S = [36, 37, 38];
    const sp = splitOf(S, 1, bands); // далёкий ход: все три в одном поясе — пас
    const info = splitOf(S, 40, bands);
    return { alt: duelMoveValue(info, 3, false, 1, 100, bands, memo), same: duelMoveValue(info, 3, true, 1, 100, bands, memo),
             pass: sp.parts.length };
  });
  check('ход перед своим же ходом ценнее, чем перед ходом соперника', token.same > token.alt, JSON.stringify(token));

  // Эндшпиль дуэли: самый информативный ход бывает проигрышным — он дарит
  // подсказку сопернику. Ищем такую позицию и проверяем, что дуэльный разбор
  // его «лучшим» не называет (а разбор тренировки — называет)
  const endgame = await page.evaluate(() => {
    const min = 1, max = 100, meta = buildFeedbackMeta(100), bands = reviewBands(meta);
    for (let secretN = 20; secretN <= 80; secretN++) {
      for (const first of [50, 30, 70, 40, 60]) {
        const cand = new Uint8Array(100).fill(1);
        narrow(cand, min, bands, first, bandOf(Math.abs(first - secretN), bands));
        const S = []; cand.forEach((c, i) => { if (c) S.push(i + 1); });
        if (S.length < 3 || S.length > DUEL_EXACT) continue;
        const scan = infoScan(cand, min, max, bands);
        const gE = scan.pickBest(1);
        if (gE === secretN) continue;
        const moves = [first, gE].map((g, i) => ({ guess: g, labelIndex: bandOf(Math.abs(g - secretN), bands), p: i % 2 }));
        moves.push({ guess: secretN, labelIndex: 8, p: 0 });
        const duel = analyseDuel(moves, min, max, meta).moves[1];
        const solo = analyseGame(moves.slice(0, 2), min, max, meta, null).moves[1];
        if (duel.grade !== 'best' && duel.grade !== 'brilliant') {
          return { found: true, secretN, first, gE, duel: duel.grade, solo: solo.grade, S: S.join(',') };
        }
      }
    }
    return { found: false };
  });
  check('в эндшпиле дуэли самый информативный ход бывает не лучшим — дуэль считает шанс угадать первым',
    endgame.found && ['best', 'brilliant'].includes(endgame.solo), JSON.stringify(endgame));

  // Вынужденные и «вслепую» ходы не оцениваются и в точность не идут
  const skip = await page.evaluate(() => {
    const meta = buildFeedbackMeta(100), bands = reviewBands(meta), secretN = 42;
    const mk = (g, p, extra) => Object.assign({ guess: g, labelIndex: bandOf(Math.abs(g - secretN), bands), p }, extra || {});
    const rv = analyseDuel([mk(50, 0), mk(10, 1, { forced: true }), mk(40, 0, { limited: true }), mk(42, 1)], 1, 100, meta);
    return { grades: rv.moves.map(m => m.grade), acc: rv.accuracy };
  });
  check('бросок в лаву и ход вслепую — без оценки', skip.grades.join() === skip.grades[0] + ',forced,limited,hit',
    skip.grades.join());
  check('и в точность не идут', skip.acc[1] === 100 && typeof skip.acc[0] === 'number', JSON.stringify(skip.acc));

  const speed = await page.evaluate(() => {
    const meta = buildFeedbackMeta(2000), bands = reviewBands(meta), secretN = 777;
    const moves = [0, 900, 700, 800, 780, 760, 775, 778, 776, 777].map((g, i) => ({ guess: g, labelIndex: bandOf(Math.abs(g - secretN), bands), p: i % 2 }));
    const t0 = performance.now();
    analyseDuel(moves, -1000, 1000, meta);
    return performance.now() - t0;
  });
  check('разбор раунда на большом диапазоне быстрый', speed < 600, Math.round(speed) + ' мс');
  await done(page);

  // Настоящий раунд
  page = await newGame(browser);
  await page.click('#tModeDuel');
  await page.fill('#nameP1', 'Маша');
  await page.fill('#nameP2', 'Петя');
  await page.selectOption('#rangeMax', '100');
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  await page.evaluate(() => { secret = 37; renderAll(); });
  await page.fill('#guessInput', '50');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(100);
  await liftCurtainIfShown(page);
  check('пока раунд идёт, разбора и значков нет', await page.evaluate(() =>
    !currentReview() && !document.querySelector('#historyList .gr-badge')));
  for (const g of [20, 30, 45, 36, 38, 37]) {
    await page.fill('#guessInput', String(g));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(100);
    await liftCurtainIfShown(page);
  }
  await page.waitForTimeout(250);
  const btn = await page.evaluate(() => (document.getElementById('reviewBtn') || {}).textContent || '');
  check('в итоге раунда — точность обоих и «Разбор»', /Маша \d+% · Петя \d+% · Разбор/.test(btn), btn);
  check('в истории значков нет — оценки в разборе', await page.evaluate(() => document.querySelectorAll('#historyList .gr-badge').length === 0));
  await page.click('#reviewBtn');
  await page.waitForTimeout(200);
  const m = await page.evaluate(() => ({
    title: document.getElementById('tReviewTitle').textContent,
    players: [...document.querySelectorAll('#rvAcc .rv-acc-player')].map(e => e.textContent),
    rows: [...document.querySelectorAll('#rvList .rv-row')].map(r => r.dataset.p) }));
  check('разбор раунда: у каждого своя точность', m.title === 'Разбор раунда' && m.players.length === 2 &&
    /^Маша\d+%$/.test(m.players[0]) && /^Петя\d+%$/.test(m.players[1]), JSON.stringify(m));
  check('ходы подписаны игроками по очереди', m.rows.join() === '0,1,0,1,0,1,0', m.rows.join());
  await page.click('#tReviewClose');
  await page.click('#resultBox .btn');
  await page.waitForTimeout(250);
  check('в новом раунде разбора нет', await page.evaluate(() => !currentReview() && !document.getElementById('reviewBtn')));
  await done(page);
}

// ------------------------------------------ боты
async function testBots(browser) {
  console.log('\nБоты');
  let page = await newGame(browser);

  const look = await page.evaluate(() => ({
    owl: playerName('@bot:owl'), upper: playerName('@BOT:OWL'), human: playerName('Лев'),
    icon: avatarOf('@bot:fox'), color: colorOf('@bot:panda'),
    order: BOTS.map(b => b.key).join(), rising: BOTS.every((b, i) => i === 0 || b.level > BOTS[i - 1].level) }));
  check('бот подписан именем персонажа и 🤖', look.owl === 'Сова 🤖' && look.upper === look.owl, look.owl);
  check('у бота своя иконка и свой цвет', look.icon === '🦊' && look.color === '#e2e8f0', look.icon + look.color);
  check('человек подписан по-прежнему своим именем', look.human === 'Лев', look.human);
  check('персонажей пять, от слабого к сильному',
    look.order === 'turtle,panda,dolphin,fox,owl' && look.rising, look.order);

  // Движок: возможные числа — ровно те, что сходятся со всеми видимыми ответами
  const eng = await page.evaluate(() => {
    RANGE_MIN = 1; RANGE_MAX = 100; FEEDBACK_META = buildFeedbackMeta(100);
    const bands = reviewBands(FEEDBACK_META);
    const tier = (g, x) => bandOf(Math.abs(g - x), bands);
    const list = cand => { const r = []; cand.forEach((c, i) => { if (c) r.push(i + 1); }); return r.join(); };
    const brute = (moves, sec) => {
      const r = [];
      for (let x = 1; x <= 100; x++) if (moves.every(m => tier(m.guess, x) === tier(m.guess, sec))) r.push(x);
      return r.join();
    };
    const mk = (g, p, sec) => ({ guess: g, labelIndex: tier(g, sec), p });
    const m1 = [mk(50, 0, 37), mk(20, 1, 37), mk(30, 0, 37)];
    // Ходы подобраны так, что каждая помеха меняет итог: иначе проверка
    // прошла бы и без неё
    // Самый горячий здесь — первый ход (35), последний — 51
    const m2 = [mk(35, 0, 1), mk(69, 1, 1), mk(56, 0, 1), mk(51, 1, 1)];
    const full = list(botCandidates(m2, 1, {}, false));
    const views = [list(botCandidates(m2, 1, { fog: true }, false)), list(botCandidates(m2, 1, { blind: true }, false)),
                   list(botCandidates(m2, 1, { shortMemory: true }, false)), list(botCandidates(m2, 1, {}, true))];
    return {
      differ: views.every(v => v !== full) && new Set(views).size === 4,
      plain: list(botCandidates(m1, 1, {}, false)) === brute(m1, 37),
      secretIn: list(botCandidates(m1, 1, {}, false)).split(',').includes('37'),
      fog: list(botCandidates(m2, 1, { fog: true }, false)) === brute(m2.filter(m => m.p === 1), 1),
      blind: list(botCandidates(m2, 1, { blind: true }, false)) === brute(m2.filter(m => m.p === 0), 1),
      memory: list(botCandidates(m2, 1, { shortMemory: true }, false)) === brute(m2.slice(-2), 1),
      // Рассеянный держится за последний ответ и самый горячий (35), а
      // остальные названные числа (69, 56) всё равно видит в списке и не предлагает
      careless: list(botCandidates(m2, 1, {}, true)) ===
        brute([m2[0], m2[3]], 1).split(',').filter(v => v !== '69' && v !== '56').join(),
      timeouts: list(botCandidates(m1.concat([{ timeout: true, p: 1 }]), 1, {}, false)) === brute(m1, 37)
    };
  });
  check('бот считает возможные числа так же, как перебор', eng.plain && eng.secretIn && eng.timeouts, JSON.stringify(eng));
  check('под туманом бот не видит чужих ходов, под слепотой — своих',
    eng.fog && eng.blind, JSON.stringify(eng));
  check('короткая память — два последних хода, рассеянность — последний и самый горячий', eng.memory && eng.careless, JSON.stringify(eng));
  check('каждая помеха в этом примере меняет то, что видит бот', eng.differ, JSON.stringify(eng));

  const pool = await page.evaluate(() => {
    const bands = reviewBands(FEEDBACK_META);
    const S = [35, 36, 37, 38, 39];
    const cand = new Uint8Array(100);
    S.forEach(v => { cand[v - 1] = 1; });
    const H = x => {
      const c = {};
      S.forEach(v => { const b = bandOf(Math.abs(x - v), bands); c[b] = (c[b] || 0) + 1; });
      return Object.values(c).reduce((h, n) => h - n / 5 * Math.log2(n / 5), 0);
    };
    let hb = 0;
    for (let x = 1; x <= 100; x++) hb = Math.max(hb, H(x));
    const best = botPool(cand, true, 1);
    const ok = botPool(cand, false, 0.5);
    const tier = (g, x) => bandOf(Math.abs(g - x), bands);
    // Две «лавы» по бокам оставляют одно число — его бот и называет
    const two = [{ guess: 43, labelIndex: tier(43, 44), p: 0 }, { guess: 45, labelIndex: tier(45, 44), p: 1 }];
    return {
      best: best.length > 0 && best.every(x => Math.abs(H(x) - hb) < 1e-9 && S.includes(x)),
      ok: ok.every(x => H(x) >= 0.5 * hb - 1e-9) && ok.length > best.length,
      single: [0.1, 0.5, 0.99].every(r => botPick(two, 0, {}, 0.9, () => r) === 44)
    };
  });
  check('лучший ход бота — самый информативный и может сразу попасть', pool.best, JSON.stringify(pool));
  check('«неплохие» ходы не хуже заданной доли от лучшего', pool.ok, JSON.stringify(pool));
  check('когда число одно, бот его и называет', pool.single);

  // Глупых ходов нет: названное число бот не повторяет — ни сильный, ни
  // слабый; после «Горячо» не уходит от этого ответа на другой конец прямой
  const sane = await page.evaluate(() => {
    RANGE_MIN = 1; RANGE_MAX = 100; FEEDBACK_META = buildFeedbackMeta(100);
    const bands = reviewBands(FEEDBACK_META);
    let seed = 777;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let rep = 0, far = 0, total = 0;
    for (let g = 0; g < 300; g++) {
      const sec = 1 + Math.floor(rnd() * 100), moves = [], L = [0, 0.3, 1][g % 3];
      for (let n = 0; n < 12; n++) {
        const x = botPick(moves, 1, {}, L, rnd);
        total++;
        if (moves.some(m => m.guess === x)) rep++;
        const hot = moves.reduce((a, m) => (!a || m.labelIndex > a.labelIndex ? m : a), null);
        if (hot && hot.labelIndex >= 5 && bandOf(Math.abs(x - hot.guess), bands) < hot.labelIndex - 2) far++;
        const li = bandOf(Math.abs(x - sec), bands);
        moves.push({ guess: x, labelIndex: li, p: 1 });
        if (li === 8) break;
      }
    }
    return { rep, far, total };
  });
  check('бот не повторяет названные числа — ни слабый, ни сильный', sane.rep === 0, JSON.stringify(sane));
  check('после «Горячо» бот не уходит далеко от горячего ответа', sane.far === 0, JSON.stringify(sane));
  // «⚡ +1 ход» — с толком: при двух числах почти всегда, при двух «⚡» и
  // когда соперник уже «Горячо» — раньше; при одном числе не нужен
  const tok = await page.evaluate(() => {
    const r = v => () => v;
    return {
      one: !botWantsToken(1, 3, true, 1, r(0)),
      two: botWantsToken(2, 1, false, 0, r(0.7)) && !botWantsToken(2, 1, false, 0, r(0.8)),
      waits: !botWantsToken(8, 1, false, 1, r(0)),
      twoTokens: botWantsToken(8, 2, false, 1, r(0)),
      danger: botWantsToken(7, 1, true, 1, r(0)) && !botWantsToken(7, 1, false, 1, r(0))
    };
  });
  check('«⚡» бот тратит с толком: при двух числах, при двух «⚡» и под угрозой — раньше', Object.values(tok).every(Boolean), JSON.stringify(tok));

  // Сила: партии бот против бота. Уровни подобраны перебором, здесь — что
  // порядок сохранился: сильный обыгрывает слабого, равные — поровну
  const power = await page.evaluate(() => {
    RANGE_MIN = 1; RANGE_MAX = 100; FEEDBACK_META = buildFeedbackMeta(100);
    const bands = reviewBands(FEEDBACK_META);
    let seed = 12345;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const round = (La, Lb, starter) => {
      const sec = 1 + Math.floor(rnd() * 100);
      const moves = [];
      let cur = starter;
      for (let n = 0; n < 80; n++) {
        const g = botPick(moves, cur, {}, cur === 0 ? La : Lb, rnd);
        const li = bandOf(Math.abs(g - sec), bands);
        moves.push({ guess: g, labelIndex: li, p: cur });
        if (li === 8) return cur;
        cur = 1 - cur;
      }
      return -1;
    };
    const rate = (a, b, n) => { let w = 0; for (let i = 0; i < n; i++) if (round(a, b, i % 2) === 0) w++; return w / n; };
    return { strong: rate(1, 0, 200), mid: rate(0.5, 0, 200), even: rate(0.5, 0.5, 200) };
  });
  check('сильный бот обыгрывает слабого', power.strong > 0.75, JSON.stringify(power));
  check('средний тоже сильнее слабого, равные — примерно поровну',
    power.mid > 0.6 && Math.abs(power.even - 0.5) < 0.12, JSON.stringify(power));
  await done(page);

  // ---- Игра с ботом без интернета
  page = await newGame(browser);
  await page.evaluate(() => openSetup('duel', true));
  await page.waitForTimeout(150);
  const setup = await page.evaluate(() => ({
    title: document.getElementById('tSetupScreen').textContent,
    tiles: [...document.querySelectorAll('#botPick .bot-tile')].map(el => el.dataset.bot),
    active: (document.querySelector('#botPick .bot-tile.active') || {}).dataset.bot,
    power: [...document.querySelectorAll('#botPick .bt-power')].map(el => (el.textContent.match(/●/g) || []).length),
    names: !document.getElementById('namesPair').classList.contains('hidden'),
    hc: !document.getElementById('handicapField').classList.contains('hidden') }));
  check('игра с ботом: пять персонажей, сначала выбрана 🐼',
    setup.tiles.join() === 'turtle,panda,dolphin,fox,owl' && setup.active === 'panda' && /Приключение/.test(setup.title),
    JSON.stringify(setup));
  check('сила персонажей — точками от одной до пяти', setup.power.join() === '1,2,3,4,5', setup.power.join());
  check('имён игроков и форы в игре с ботом нет', !setup.names && !setup.hc);
  await page.click('.bot-tile[data-bot="owl"]');
  check('выбор бота запоминается', await page.evaluate(() =>
    localStorage.getItem('hc_bot') === 'owl' && document.querySelector('#botPick .bot-tile.active').dataset.bot === 'owl'));
  await page.selectOption('#rangeMax', '100');
  await page.selectOption('#winsNeeded', '1');
  await page.evaluate(() => { BOT_SPEED = 0; });
  await page.click('#tStartMatch');
  await page.waitForTimeout(800);
  const start = await page.evaluate(() => ({ names: D.names.slice(), bot: vsBot && vsBot.bot.key,
    bubble: document.getElementById('sayBubble').classList.contains('hidden') ? '' : document.getElementById('sayBubble').textContent }));
  check('партия: вы против Совы', start.bot === 'owl' && start.names[0] === 'Вы' && start.names[1] === 'Сова 🤖',
    JSON.stringify(start));
  check('Сова желает удачи', /Сова/.test(start.bubble) && /Удачи/.test(start.bubble), start.bubble);

  await page.evaluate(() => { secret = 77; });
  await page.fill('#guessInput', '1');
  await page.click('#tSubmitGuess');
  await page.waitForFunction(() => history.length >= 2 || D.roundOver, null, { timeout: 3000 });
  check('бот ходит сам после хода человека', await page.evaluate(() => history[1] && history[1].p === 1 && D.cur === 0));

  // В ход бота человек за него не ходит и жетон его не трогает
  await page.evaluate(() => { BOT_SPEED = 1000; });
  await page.fill('#guessInput', '2');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(100);
  await liftCurtainIfShown(page);
  const stolen = await page.evaluate(() => {
    const before = history.length;
    document.getElementById('guessInput').value = '3';
    duelGuess();
    useToken(1);
    return { same: history.length === before, armed: D.armed, cur: D.cur,
             forcedHidden: document.getElementById('forcedTurn').classList.contains('hidden') };
  });
  check('в ход бота за него не сходить и жетон не взвести', stolen.same && !stolen.armed && stolen.cur === 1,
    JSON.stringify(stolen));

  // Помехи в игре с ботом прячут ходы весь раунд: в экран смотрит только человек
  const hide = await page.evaluate(() => {
    D.fog[0] = true;
    const botRow = history.find(h => h.p === 1);
    const myRow = history.find(h => h.p === 0);
    const whileBot = hiddenRow(1, botRow);
    D.cur = 0;
    const whileMe = hiddenRow(1, botRow);
    D.cur = 1;
    D.fog[0] = false;
    // Помеха на боте человеку ничего не прячет: смотрит в экран он
    D.fog[1] = true;
    D.blind[1] = false;
    const botFog = hiddenRow(0, myRow);
    D.fog[1] = false;
    return { whileBot, whileMe, botFog };
  });
  check('туман прячет ходы бота и пока ходит бот, и пока человек', hide.whileBot && hide.whileMe, JSON.stringify(hide));
  check('туман на боте не прячет ходы от человека', !hide.botFog, JSON.stringify(hide));

  // Отнятый ход бота бот делает сам, кнопку человеку не показывают
  const lava = await page.evaluate(() => {
    stopBot();
    D.autoLava[1] = true;
    renderAll();
    return document.getElementById('forcedTurn').classList.contains('hidden');
  });
  check('отнятый ход бота человеку не показывается кнопкой', lava);
  await page.evaluate(() => { BOT_SPEED = 0; stopBot(); botTick(); });
  await page.waitForFunction(() => !D.autoLava[1], null, { timeout: 3000 });
  check('бросок в лаву за бота сделан сам', await page.evaluate(() => {
    const last = history.filter(h => h.p === 1).pop();
    return !!last && last.forced === true && last.meta.labelIndex >= 6;
  }));

  // Доигрываем: человек ходит как сильный бот, бот отвечает сам
  for (let i = 0; i < 60; i++) {
    const st = await page.evaluate(() => ({ over: D.matchOver, cur: D.cur, ro: D.roundOver }));
    if (st.over) break;
    if (st.cur !== 0 || st.ro) { await page.waitForTimeout(40); continue; }
    const g = await page.evaluate(() => botPick(history.map(h => ({ guess: h.guess, labelIndex: h.meta.labelIndex, p: h.p })), 0, {}, 1));
    await page.fill('#guessInput', String(g));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(40);
    await liftCurtainIfShown(page);
  }
  const fin = await page.evaluate(() => ({ over: D.matchOver,
    bubble: document.getElementById('sayBubble').textContent,
    review: (document.getElementById('reviewBtn') || {}).textContent || '' }));
  check('партия с ботом доигрывается до конца', fin.over, JSON.stringify(fin));
  check('в конце бот говорит «Хорошая игра!»', /Хорошая игра/.test(fin.bubble), fin.bubble);
  check('после партии с ботом есть разбор с точностью обоих', /Вы \d+%( · Сова 🤖 \d+%)? · Разбор/.test(fin.review) && !/—/.test(fin.review), fin.review);

  // Выход в меню останавливает бота
  await page.evaluate(() => { newMatch(); BOT_SPEED = 1000; D.cur = 1; renderAll(); quitToMenu(); });
  check('выход в меню останавливает бота', await page.evaluate(() => botTimer === null && vsBot === null));
  // Обычная игра с другом после игры с ботом — снова двое людей
  await page.click('.mode-btn.duel');
  await page.waitForTimeout(100);
  const again = await page.evaluate(() => ({
    names: !document.getElementById('namesPair').classList.contains('hidden'),
    pick: !document.getElementById('botPickField').classList.contains('hidden') }));
  await page.click('#tStartMatch');
  await page.waitForTimeout(150);
  check('после бота «Игра с другом» — снова с именами и без бота',
    again.names && !again.pick && await page.evaluate(() => vsBot === null && !/🤖/.test(D.names[1])));
  await done(page);
}

// ------------------------------------------ разбор онлайн-партии
async function testOnlineReview(browser) {
  console.log('\nРазбор онлайн-партии');
  const setup = () => {
    FEEDBACK_META = buildFeedbackMeta(100);
    const t = (g, sec) => bandOf(Math.abs(g - sec), reviewBands(FEEDBACK_META));
    const mk = (r, seat, g, sec, extra) => Object.assign({ round: r, seat, guess: g, tier: t(g, sec),
      timeout: false, forced: false, limited: false }, extra || {});
    window.__matchReview = [
      mk(1, 0, 50, 37), mk(1, 1, 30, 37), mk(1, 0, 40, 37), mk(1, 1, 37, 37),
      mk(2, 1, 50, 71), { round: 2, seat: 0, guess: null, tier: null, timeout: true, forced: false, limited: false },
      mk(2, 1, 75, 71, { limited: true }), mk(2, 0, 70, 71, { forced: true }), mk(2, 1, 71, 71),
      mk(3, 0, 50, 12), mk(3, 1, 25, 12), mk(3, 0, 12, 12)];
    Object.assign(window.__match, { names: ['Лев', 'Кира'], ranked: false, round: 3, wins: [1, 2],
      winsNeeded: 2, roundOver: true, matchOver: false, status: 'active', roundWinner: 0,
      moves: [{ seat: 0, guess: 50, tier: t(50, 12) }], secret: 12 });
  };
  let page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(setup);
  await page.evaluate(() => openMatch(1));
  await page.waitForTimeout(400);
  check('пока партия идёт, всех ходов у сервера не просят и кнопки нет', await page.evaluate(() =>
    !window.__reviewCalls && !document.getElementById('reviewBtn')));

  // Партия кончилась
  await page.evaluate(() => {
    Object.assign(window.__match, { matchOver: true, status: 'finished', wins: [1, 2], roundWinner: 1 });
    return refreshMatch(true);
  });
  await page.waitForTimeout(300);
  const res = await page.evaluate(() => {
    const rv = currentReview();
    // Ожидание: каждый раунд — дуэльным движком отдельно, точность по всем ходам
    const list = window.__matchReview;
    const all = [];
    [1, 2, 3].forEach(r => {
      const played = list.filter(m => m.round === r && !m.timeout);
      analyseDuel(played.map(m => ({ guess: m.guess, labelIndex: m.tier, p: m.seat, forced: m.forced, limited: m.limited })),
                  1, 100, FEEDBACK_META).moves.forEach(x => all.push(x));
    });
    const acc = p => { const own = all.filter(x => x.p === p && x.score !== null);
                       return Math.round(own.reduce((a, x) => a + x.score, 0) / own.length); };
    return { btn: (document.getElementById('reviewBtn') || {}).textContent || '', calls: window.__reviewCalls,
             acc: rv && rv.accuracy, want: [acc(0), acc(1)], n: rv && rv.moves.length,
             grades: rv && rv.moves.map(m => m.grade),
             badges: document.querySelectorAll('#historyList .gr-badge, #historyList .h-grade').length };
  });
  check('после партии — кнопка с точностью обоих', /📊 Лев \d+% · Кира \d+% · Разбор/.test(res.btn), res.btn);
  check('все ходы спрошены один раз', res.calls === 1, String(res.calls));
  check('разобраны все ходы всех раундов, пропуск по времени — нет', res.n === 11, String(res.n));
  check('бросок в лаву и ход под помехой без оценки',
    res.grades[5] === 'limited' && res.grades[6] === 'forced', JSON.stringify(res.grades));
  check('точность — по всем ходам партии, без неоценённых',
    JSON.stringify(res.acc) === JSON.stringify(res.want), JSON.stringify(res));
  check('в истории последнего раунда значков нет — разбор по всей партии', res.badges === 0);

  await page.click('#reviewBtn');
  await page.waitForTimeout(200);
  const modal = await page.evaluate(() => ({
    title: document.getElementById('tReviewTitle').textContent,
    heads: [...document.querySelectorAll('#rvList .rv-round')].map(e => e.textContent),
    nums: [...document.querySelectorAll('#rvList .rv-row .rv-num')].map(e => e.textContent).join(),
    players: [...document.querySelectorAll('#rvAcc .rv-acc-player')].length }));
  check('разбор партии: заголовок и оба игрока', modal.title === 'Разбор партии' && modal.players === 2, JSON.stringify(modal));
  check('раунды подписаны и назван победитель каждого',
    modal.heads.join('|') === 'Раунд 1 · 🎯 Кира|Раунд 2 · 🎯 Кира|Раунд 3 · 🎯 Лев', modal.heads.join('|'));
  check('ходы нумеруются внутри раунда', modal.nums === '#1,#2,#3,#4,#1,#2,#3,#4,#1,#2,#3', modal.nums);
  await page.click('#tReviewClose');

  // Повторные опросы разбор заново не спрашивают
  await page.evaluate(() => refreshMatch(true));
  await page.evaluate(() => refreshMatch(true));
  check('опрос не спрашивает ходы повторно', await page.evaluate(() => window.__reviewCalls === 1));
  await done(page);

  // Старая база без разбора: кнопки нет, ошибок нет
  page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(setup);
  await page.evaluate(() => {
    window.__reviewError = 'function match_review does not exist';
    Object.assign(window.__match, { matchOver: true, status: 'finished' });
    return openMatch(1);
  });
  await page.waitForTimeout(400);
  check('без разбора на сервере кнопки нет', await page.evaluate(() =>
    window.__reviewCalls === 1 && !document.getElementById('reviewBtn')));
  // Сбой прошёл — та же партия, открытая заново, спрашивает разбор снова
  await page.evaluate(() => { window.__reviewError = null; return openMatch(1); });
  await page.waitForTimeout(400);
  check('после сбоя разбор той же партии спрашивается заново', await page.evaluate(() =>
    window.__reviewCalls === 2 && !!document.getElementById('reviewBtn')));
  // Новая партия — свой разбор
  await page.evaluate(() => { window.__match.id = 2; return openMatch(2); });
  await page.waitForTimeout(400);
  check('у новой партии свой разбор', await page.evaluate(() =>
    window.__reviewCalls === 3 && !!document.getElementById('reviewBtn')));
  await done(page);
}

// ------------------------------------------ полировка: жетон, экраны, салют
// ☰ во время игры без интернета: начатую партию не стирать молча
async function testQuitConfirm(browser) {
  console.log('\nВыход из начатой партии');
  const page = await newGame(browser);
  const state = () => page.evaluate(() => ({
    modal: !document.getElementById('quitModal').classList.contains('hidden'),
    menu: !document.getElementById('screenMode').classList.contains('hidden'),
    game: !document.getElementById('screenGame').classList.contains('hidden'),
    n: history.length
  }));
  const startSolo = async () => {
    await page.click('.mode-btn.solo');
    await page.waitForTimeout(150);
    await page.selectOption('#rangeMax', '100');
    await page.click('#tStartMatch');
    await page.waitForTimeout(200);
    await page.evaluate(() => { secret = 77; });
  };
  const guess = async v => {
    await page.fill('#guessInput', String(v));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(120);
    await liftCurtainIfShown(page);
  };

  // Тренировка без ходов — терять нечего, выходим сразу
  await startSolo();
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  let s = await state();
  check('тренировка без ходов: ☰ выходит сразу', s.menu && !s.modal, JSON.stringify(s));

  // После хода — вопрос; «Продолжить» оставляет партию как была
  await startSolo();
  await guess(10);
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  s = await state();
  const txt = await page.evaluate(() => ({
    ask: document.getElementById('tQuitAsk').textContent, stay: document.getElementById('tQuitStay').textContent,
    go: document.getElementById('tQuitGo').textContent, want: [t().quitAsk, t().quitStay, t().quitGo]
  }));
  check('тренировка после хода: ☰ сначала спрашивает', s.modal && s.game && !s.menu, JSON.stringify(s));
  check('в вопросе — текст и обе кнопки на языке игры',
    !!txt.ask && txt.ask === txt.want[0] && txt.stay === txt.want[1] && txt.go === txt.want[2], JSON.stringify(txt));
  await page.click('#tQuitStay');
  await page.waitForTimeout(100);
  s = await state();
  check('«Продолжить» — остаёмся в той же партии', !s.modal && s.game && s.n === 1, JSON.stringify(s));
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  await page.click('#tQuitGo');
  await page.waitForTimeout(150);
  s = await state();
  check('«Выйти» — в меню', !s.modal && s.menu, JSON.stringify(s));

  // Выигранная партия — без вопроса
  await startSolo();
  await guess(77);
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  s = await state();
  check('после победы ☰ выходит сразу', s.menu && !s.modal, JSON.stringify(s));

  // Попытки кончились, осталась последняя догадка — партия ещё идёт
  await startSolo();
  await guess(10);
  await page.evaluate(() => { gameOver = true; gameOverType = 'lose_waiting'; renderAll(); });
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  s = await state();
  check('на последней догадке — тоже вопрос', s.modal, JSON.stringify(s));
  await page.click('#tQuitGo');
  await page.waitForTimeout(150);

  // Дуэль: ход сделан — вопрос
  const startDuel = async wins => {
    await page.click('.mode-btn.duel');
    await page.waitForTimeout(150);
    await page.selectOption('#rangeMax', '100');
    await page.selectOption('#winsNeeded', wins);
    await page.click('#tStartMatch');
    await page.waitForTimeout(200);
    await page.evaluate(() => { secret = 77; });
  };
  await startDuel('3');
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  s = await state();
  check('дуэль без ходов: ☰ выходит сразу', s.menu && !s.modal, JSON.stringify(s));
  await startDuel('3');
  await guess(10);
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  s = await state();
  check('дуэль после хода: вопрос', s.modal && s.game, JSON.stringify(s));
  await page.click('#tQuitStay');
  // Раунд выигран, партия — нет: счёт потерялся бы
  await guess(77);
  await page.evaluate(() => { history = []; renderAll(); });
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  s = await state();
  const sc = await page.evaluate(() => ({ round: D.round, wins: D.wins.slice(), over: D.matchOver }));
  check('дуэль между раундами при счёте 0:1 — вопрос', s.modal && !sc.over, JSON.stringify({ s, sc }));
  await page.click('#tQuitGo');
  await page.waitForTimeout(150);
  // Партия сыграна — без вопроса
  await startDuel('1');
  await guess(77);
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  s = await state();
  check('дуэль сыграна: ☰ выходит сразу', s.menu && !s.modal, JSON.stringify(s));

  // С ботом: вопрос тот же, после выхода бот не ходит
  await page.evaluate(() => openSetup('duel', true));
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.evaluate(() => { BOT_SPEED = 0; });
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  await page.evaluate(() => { secret = 77; });
  await guess(10);
  await page.waitForTimeout(200);
  await page.click('#tMenu');
  await page.waitForTimeout(100);
  s = await state();
  check('игра с ботом после хода: вопрос', s.modal, JSON.stringify(s));
  await page.click('#tQuitGo');
  await page.waitForTimeout(300);
  s = await state();
  const bot = await page.evaluate(() => ({ vsBot, timer: botTimer }));
  check('после выхода от бота — меню, бот остановлен', s.menu && !bot.vsBot && !bot.timer, JSON.stringify({ s, bot }));

  // Тексты есть на всех языках
  const langs = await page.evaluate(() => Object.keys(i18n).filter(l => !i18n[l].quitAsk || !i18n[l].quitStay || !i18n[l].quitGo));
  check('вопрос переведён на все языки', langs.length === 0, langs.join(','));
  await page.context().close();
}

// Туман и слепота с ботом — весь раунд: в экран смотрит только человек
async function testFogWholeRound(browser) {
  console.log('\nПомехи с ботом — весь раунд');
  const page = await newGame(browser);
  await page.evaluate(() => openSetup('duel', true));
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.evaluate(() => { BOT_SPEED = 1000; });   // бот сам не ходит: его ходы делает тест
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    stopBot();
    secret = 90; D.cur = 0; history = [];
    D.bonuses = [{ value: 30, type: 'fog', taken: false }];
    window.__snd = 0;
    const orig = soundForGuess;
    soundForGuess = m => { window.__snd++; orig(m); };
    renderAll();
  });
  const rows = () => page.evaluate(() => ({
    cur: D.cur, snd: window.__snd,
    shown: [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent)
  }));
  const me = async v => {
    await page.fill('#guessInput', String(v));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(120);
    await liftCurtainIfShown(page);
    await page.evaluate(() => stopBot());
  };
  const bot = v => page.evaluate(x => { stopBot(); duelPlay(x); stopBot(); }, v);

  await me(10);
  await bot(30);                                   // бот взял туман — он лёг на человека
  let r = await rows();
  check('бот взял туман — и этот его ход человеку закрыт', r.cur === 0 && r.shown.join() === '•••,10', JSON.stringify(r));
  await me(20);
  await bot(50);                                   // ход после тумана
  r = await rows();
  check('все ходы бота закрыты на ходу человека', r.cur === 0 && r.shown.join() === '•••,20,•••,10', JSON.stringify(r));
  check('закрытые ходы бота не звучат — по звуку не угадать пояс', r.snd === 2, 'звуков ' + r.snd);
  await me(60);
  r = await rows();
  check('и на ходу бота они тоже закрыты', r.cur === 1 && r.shown.join() === '60,•••,20,•••', JSON.stringify(r));
  await bot(90);                                   // бот угадал — раунд окончен, всё открыто
  r = await rows();
  check('раунд окончен — ходы открыты', r.shown.includes('50') && !r.shown.includes('•••'), JSON.stringify(r));

  // Туман на боте: ни одного хода человека он не видит
  await page.evaluate(() => {
    nextRound(); stopBot();
    secret = 90; D.cur = 0; history = [];
    D.bonuses = [{ value: 40, type: 'fog', taken: false }];
    renderAll();
  });
  await me(40);
  await bot(70);
  await me(88);                                    // рядом с ответом: боту бы очень помог
  const view = await page.evaluate(() => {
    const moves = history.map(h => ({ guess: h.guess, labelIndex: h.meta.labelIndex, p: h.p, timeout: !!h.timeout }));
    const flags = { fog: D.fog[1], blind: D.blind[1], shortMemory: D.shortMemory[1],
                    fogFrom: D.fogFrom[1], blindFrom: D.blindFrom[1] };
    const got = Array.from(botCandidates(moves, 1, flags, false)).join('');
    // Под туманом бот видит только свои ходы — ни одного хода человека
    const want = Array.from(botCandidates(moves.filter(m => m.p === 1), 1, {}, false)).join('');
    const all = Array.from(botCandidates(moves, 1, {}, false)).join('');
    return { fog: D.fog[1], from: D.fogFrom[1], same: got === want, differs: want !== all };
  });
  check('бот под туманом не видит ни одного хода человека',
    view.fog && view.from === 0 && view.same && view.differs, JSON.stringify(view));
  await page.context().close();
}

// Партия с человеком: ждём обоих, отсчёт 3-2-1, «Готов» между раундами
async function testMatchFlow(browser) {
  console.log('\nПартия с другом: начало и перерыв');
  const page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    Object.assign(window.__match, { lobby: true, lobbyLeft: 270, present: [true, false] });
    openMatch(1);
  });
  await page.waitForTimeout(500);
  const view = () => page.evaluate(() => ({
    banner: document.getElementById('turnBanner').textContent,
    bannerShown: !document.getElementById('turnBanner').classList.contains('hidden'),
    input: !document.getElementById('guessSection').classList.contains('hidden'),
    clock: !document.getElementById('turnClock').classList.contains('hidden'),
    next: (document.getElementById('rNext') || {}).textContent || '',
    btns: [...document.querySelectorAll('#resultBox .r-actions .btn')].map(b => ({ t: b.textContent, off: b.disabled }))
  }));
  let v = await view();
  check('соперника нет — «Ждём Кира» и сколько до отмены',
    v.bannerShown && v.banner.includes('Ждём Кира') && /отмена через 4:(2\d|30)/.test(v.banner), v.banner);
  check('пока ждём — ни поля ввода, ни часов хода', !v.input && !v.clock, JSON.stringify(v));
  // Звёзд и рейтинга больше нет (миграция 062): говорить о них незачем
  check('до начала — ни слова про звёзды', !/звёзд/i.test(v.banner), v.banner);

  // Соперник пришёл — отсчёт
  await page.evaluate(() => { Object.assign(window.__match, { lobby: false, lobbyLeft: null, startsIn: 2, present: [true, true] }); refreshMatch(true); });
  await page.waitForTimeout(400);
  v = await view();
  check('оба на месте — «Начинаем через 2…»', /Начинаем через [12]…/.test(v.banner) && !v.input && !v.clock, JSON.stringify(v));
  // Опрос сервера выключен: поле должно появиться от самого отсчёта, а не
  // от очередного ответа сервера двумя секундами позже
  await page.evaluate(() => { window.__match.startsIn = null; stopMatchPoll(); });
  await page.waitForTimeout(2200);
  v = await view();
  // Чей ход — ярлык над плашкой; полоса с отсчётом уходит
  const tagOn = await page.evaluate(() => [0, 1].some(p => !document.getElementById('pturn' + p).classList.contains('hidden')));
  check('отсчёт кончился — поле ввода, часы хода и ярлык «чей ход»', v.input && v.clock && !v.bannerShown && tagOn, JSON.stringify(v));
  await page.evaluate(() => startMatchPoll());

  // Раунд окончен: «Готов», 10 секунд, соперник ещё не готов
  await page.evaluate(() => {
    Object.assign(window.__match, { roundOver: true, roundWinner: 0, wins: [1, 0], nextIn: 8, waitReady: true,
                                    moves: [{ seat: 0, guess: 42, tier: 8 }] });
    window.__nextCalls = 0;
    refreshMatch(true);
  });
  await page.waitForTimeout(400);
  v = await view();
  check('между раундами — «Готов» и сколько до следующего', v.btns.length === 1 && v.btns[0].t === 'Готов' &&
    /Следующий раунд через [78] с/.test(v.next), JSON.stringify(v));
  await page.click('#resultBox .r-actions .btn');
  await page.waitForTimeout(400);
  v = await view();
  const calls = await page.evaluate(() => ({ n: window.__nextCalls, round: D.round, over: D.roundOver }));
  check('нажал «Готов» — ждём соперника, раунд не начался',
    v.btns[0] && v.btns[0].off && v.btns[0].t.includes('ждём Кира') && calls.n === 1 && calls.over && calls.round === 1,
    JSON.stringify({ v, calls }));
  await page.evaluate(() => { window.__match.ready = [true, true]; refreshMatch(true); });
  await page.waitForTimeout(400);
  v = await view();
  check('соперник тоже готов — это видно', v.next.includes('✓ Кира ждёт'), v.next);
  // Вышло время — сервер начал раунд сам
  await page.evaluate(() => {
    Object.assign(window.__match, { roundOver: false, roundWinner: null, round: 2, cur: 1, nextIn: null, ready: [false, false], moves: [] });
    refreshMatch(true);
  });
  await page.waitForTimeout(400);
  v = await view();
  const r2 = await page.evaluate(() => ({ round: D.round, over: D.roundOver, line: !!document.querySelector('#rNext') }));
  check('новый раунд начался сам', r2.round === 2 && !r2.over && !r2.line, JSON.stringify(r2));

  // Не пришёл — отменено
  await page.evaluate(() => { Object.assign(window.__match, { status: 'expired' }); refreshMatch(true); });
  await page.waitForTimeout(400);
  v = await view();
  check('соперник не пришёл — «Партия отменена», ходить нельзя', v.banner.includes('Партия отменена — Кира') && !v.input && !v.clock,
    JSON.stringify(v));

  await page.context().close();
}

// Пожаловаться и заблокировать: из «⋯» у друга и из переписки
async function testBlockReport(browser) {
  console.log('\nЖалоба и блокировка');
  const page = await newGame(browser, { user: 'Максим', profile: {} });
  await page.evaluate(() => { window.__friends = [{ username: 'Аня', relation: 'friend' }, { username: 'Кира', relation: 'friend' }]; });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);

  // Жалоба: без причины не отправить; причина, пара слов — и на сервер
  await page.click('#friendsList .friend-row[data-name="Аня"] .fr-btn.more');
  await page.waitForTimeout(100);
  await page.click('#fsReport');
  await page.waitForTimeout(100);
  const form = await page.evaluate(() => ({
    open: !document.getElementById('reportModal').classList.contains('hidden'),
    title: document.getElementById('rpTitle').textContent,
    reasons: [...document.querySelectorAll('#rpReasons button')].map(b => b.textContent),
    sendOff: document.getElementById('rpSend').disabled
  }));
  check('жалоба: три причины, без причины не отправить',
    form.open && form.title.includes('Аня') && form.reasons.join() === 'Грубость,Спам,Другое' && form.sendOff, JSON.stringify(form));
  await page.click('#rpReasons button[data-reason="rude"]');
  await page.fill('#rpNote', 'обзывается');
  await page.click('#rpSend');
  await page.waitForTimeout(300);
  const sent = await page.evaluate(() => ({
    args: (window.__reports || [])[0],
    closed: document.getElementById('reportModal').classList.contains('hidden'),
    note: document.getElementById('friendsNote').textContent
  }));
  check('жалоба ушла с причиной и комментарием, игроку сказали спасибо',
    sent.args && sent.args.p_who === 'Аня' && sent.args.p_reason === 'rude' && sent.args.p_note === 'обзывается' &&
    sent.closed && sent.note.includes('Жалоба отправлена'), JSON.stringify(sent));

  // Блокировка: сначала вопрос, «Отмена» ничего не делает
  await page.click('#friendsList .friend-row[data-name="Аня"] .fr-btn.more');
  await page.waitForTimeout(100);
  await page.click('#fsBlock');
  await page.waitForTimeout(100);
  const ask = await page.evaluate(() => document.getElementById('blAsk').textContent);
  check('перед блокировкой — вопрос и что будет', ask.startsWith('Заблокировать: Аня?') && ask.includes('не сможет писать вам'), ask);
  await page.click('#blCancel');
  await page.waitForTimeout(100);
  check('«Отмена» ничего не блокирует', await page.evaluate(() => !(window.__blocked || []).length &&
    document.getElementById('blockModal').classList.contains('hidden')));
  await page.click('#friendsList .friend-row[data-name="Аня"] .fr-btn.more');
  await page.waitForTimeout(100);
  await page.click('#fsBlock');
  await page.waitForTimeout(100);
  await page.click('#blGo');
  await page.waitForTimeout(400);
  const blocked = await page.evaluate(() => ({
    list: window.__blocked, rows: [...document.querySelectorAll('#friendsList .friend-row')].map(r => r.dataset.name),
    note: document.getElementById('friendsNote').textContent
  }));
  check('заблокирована — ушла из списка, об этом сказано',
    blocked.list.join() === 'Аня' && !blocked.rows.includes('Аня') && blocked.note.includes('больше не сможет вам писать'),
    JSON.stringify(blocked));

  // Из переписки: «⋯» в заголовке, «Написать» там лишнее; после блокировки — к друзьям
  await page.evaluate(() => openChat('Кира'));
  await page.waitForTimeout(300);
  await page.click('#chatMore');
  await page.waitForTimeout(100);
  const fromChat = await page.evaluate(() =>
    [...document.querySelectorAll('#friendSheet button')].filter(b => !b.classList.contains('hidden')).map(b => b.textContent));
  check('в переписке «⋯» — без «Написать»', fromChat.join() === '🏅 Достижения,Убрать из друзей,⚠️ Пожаловаться,🚫 Заблокировать,Отмена',
    fromChat.join());
  await page.click('#fsBlock');
  await page.waitForTimeout(100);
  await page.click('#blGo');
  await page.waitForTimeout(500);
  check('заблокировал из переписки — вернулся к друзьям', await page.locator('#screenFriends').isVisible());

  // Профиль: список заблокированных, разблокировать
  await page.click('#accountChip');
  await page.waitForTimeout(300);
  await page.evaluate(() => { document.getElementById('pfMoreFold').open = true; document.getElementById('pfBlockedFold').open = true; });
  await page.waitForTimeout(400);
  let list = await page.evaluate(() => [...document.querySelectorAll('#pfBlockedList .bl-row')].map(r => r.textContent));
  check('в профиле — кого заблокировал', list.join() === 'АняРазблокировать,КираРазблокировать', list.join());
  await page.click('#pfBlockedList .bl-row:first-child .fr-btn');
  await page.waitForTimeout(400);
  list = await page.evaluate(() => [...document.querySelectorAll('#pfBlockedList .bl-row')].map(r => r.textContent));
  check('«Разблокировать» убирает из списка', list.join() === 'КираРазблокировать' &&
    await page.evaluate(() => window.__blocked.join() === 'Кира'), list.join());
  await page.evaluate(() => closeLogoutModal());

  // Заблокированному не говорят, что его заблокировали
  const msg = await page.evaluate(() => friendErrorText('unavailable'));
  check('ответ «unavailable» — «Игрок недоступен»', msg === 'Игрок недоступен', msg);
  await page.context().close();
}

// Обучение новичка: три урока, замок на онлайне, карточки бонусов, иконка, Ученик
async function testTutorial(browser) {
  console.log('\nОбучение новичка');
  let page = await newGame(browser, { newbie: true });
  await page.evaluate(() => { currentLang = 'ru'; applyTranslations(); });
  const menu = () => page.evaluate(() => ({
    card: !document.getElementById('tutCard').classList.contains('hidden'),
    title: document.getElementById('tTutTitle').textContent, sub: document.getElementById('tTutSub').textContent,
    runLocked: !onlineOpen(),
    trialLocked: document.querySelector('.mode-btn.run').classList.contains('locked'),
    online: !!document.querySelector('.mode-btn.online')
  }));
  let m = await menu();
  check('новичку — карточка «Обучение · урок 1 из 3»', m.card && m.title === 'Обучение · урок 1 из 3' && m.sub === 'Как читать подсказки',
    JSON.stringify(m));
  check('«Друзья» закрыты до уроков 1–2, Испытание открыто сразу, плитки онлайна нет', m.runLocked && !m.trialLocked && !m.online,
    JSON.stringify(m));
  await page.click('#friendsBtn');
  await page.waitForTimeout(150);
  const gate = await page.evaluate(() => ({
    open: !document.getElementById('gateModal').classList.contains('hidden'),
    text: document.getElementById('gateText').textContent,
    go: document.getElementById('gateGo').textContent, skip: document.getElementById('gateSkip').textContent,
    friends: !document.getElementById('screenFriends').classList.contains('hidden') }));
  check('«Друзья» предлагают урок или пропустить', gate.open && !gate.friends && /«Друзья» откроются/.test(gate.text) &&
    gate.go === '🎓 Начать урок 1' && gate.skip === 'Пропустить обучение', JSON.stringify(gate));

  // Урок 1: тренировка 1–20, подсказки по шагам
  await page.click('#gateGo');
  await page.waitForTimeout(250);
  const coach = () => page.evaluate(() => document.getElementById('coach').classList.contains('hidden') ? '' :
    document.getElementById('coach').textContent);
  const l1 = await page.evaluate(() => ({ mode, min: RANGE_MIN, max: RANGE_MAX, ph: document.getElementById('guessInput').placeholder }));
  check('урок 1 — тренировка от 1 до 20', l1.mode === 'solo' && l1.min === 1 && l1.max === 20, JSON.stringify(l1));
  check('подсказка учителя: что делать', (await coach()).startsWith('🎓 Я загадал число от 1 до 20'), await coach());
  await page.evaluate(() => { secret = 15; });
  const guess = async v => { await page.fill('#guessInput', String(v)); await page.click('#tSubmitGuess'); await page.waitForTimeout(150); };
  await guess(3);
  check('после хода — как читать «горячо / холодно»', (await coach()).includes('🔥 горячо'), await coach());
  await guess(19);
  check('потом — про прямую', (await coach()).includes('Прямая'), await coach());
  await guess(15);
  let res = await page.evaluate(() => ({
    line: (document.querySelector('#resultBox .r-lesson') || {}).textContent,
    btns: [...document.querySelectorAll('#resultBox .r-actions button')].map(b => b.textContent),
    coach: document.getElementById('coach').classList.contains('hidden'), st: tutState() }));
  check('урок 1 пройден — кнопка «Урок 2»', res.line === '🎓 Урок 1 пройден!' && res.btns.join() === '🎓 Урок 2,В меню' &&
    res.coach && res.st.done.join() === '1', JSON.stringify(res));

  // Урок 2: дуэль с черепахой, до одной победы. Ходы бота делает тест:
  // быстрый бот мог бы случайно угадать и закончить урок раньше проверок
  await page.evaluate(() => { BOT_SPEED = 1000; });
  await page.click('#resultBox .r-actions .btn');
  await page.waitForTimeout(250);
  const l2 = await page.evaluate(() => ({ mode, bot: vsBot && vsBot.bot.key, wins: D.winsNeeded, max: RANGE_MAX, bonus: bonusMode }));
  check('урок 2 — дуэль с самым мягким ботом, 1–50, до одной победы, без бонусов',
    l2.mode === 'duel' && l2.bot === 'turtle' && l2.wins === 1 && l2.max === 50 && !l2.bonus, JSON.stringify(l2));
  check('подсказка: ходите по очереди', (await coach()).includes('ходите по очереди'), await coach());
  const bot = v => page.evaluate(x => { stopBot(); duelPlay(x); stopBot(); }, v);
  await page.evaluate(() => { secret = 33; });
  await guess(10);
  await bot(40);
  check('после хода — ход бота тоже подсказка', (await coach()).includes('Ход бота'), await coach());
  await guess(20);
  await bot(41);
  check('дальше — про жетон «+1 ход»', (await coach()).includes('+1 ход'), await coach());
  await guess(33);
  res = await page.evaluate(() => ({ line: (document.querySelector('#resultBox .r-lesson') || {}).textContent, st: tutState() }));
  check('урок 2 пройден — «Друзья» открыты', res.line === '🎓 Урок 2 пройден! · 🔓 «Друзья» открыты' && res.st.done.join() === '1,2',
    JSON.stringify(res));

  // Урок 3: бонусы; первый бонус объясняется карточкой
  await page.click('#resultBox .r-actions .btn');
  await page.waitForTimeout(250);
  const l3 = await page.evaluate(() => ({ bonus: bonusMode, n: D.bonuses.length }));
  check('урок 3 — с бонусами', l3.bonus && l3.n === 5, JSON.stringify(l3));
  check('подсказка про бонусы', (await coach()).includes('бонусы 🎁'), await coach());
  await page.evaluate(() => { stopBot(); secret = 44; D.cur = 0; D.bonuses = [{ value: 10, type: 'fog', taken: false }]; renderAll(); });
  await guess(10);
  const card = await page.evaluate(() => ({
    open: !document.getElementById('bonusCard').classList.contains('hidden'),
    icon: document.getElementById('bcIcon').textContent, title: document.getElementById('bcTitle').textContent,
    desc: document.getElementById('bcDesc').textContent }));
  check('первый туман — карточка «Новый бонус: Туман» с объяснением',
    card.open && card.icon === '🙈' && card.title === 'Новый бонус: Туман' && card.desc.startsWith('Туман ложится на соперника'),
    JSON.stringify(card));
  await page.click('#bcOk');
  await page.waitForTimeout(100);
  check('после бонуса — подсказка про карточку', (await coach()).includes('Сработал бонус'), await coach());
  await page.evaluate(() => { stopBot(); D.cur = 0; D.lastBonus = 'fog'; renderAll(); });
  check('второй раз тот же бонус карточку не показывает',
    await page.evaluate(() => document.getElementById('bonusCard').classList.contains('hidden')));
  await page.evaluate(() => { stopBot(); D.cur = 0; D.lastBonus = null; renderAll(); });
  await guess(44);
  res = await page.evaluate(() => ({ line: (document.querySelector('#resultBox .r-lesson') || {}).textContent,
    btns: [...document.querySelectorAll('#resultBox .r-actions button')].map(b => b.textContent), st: tutState() }));
  check('урок 3 пройден — иконка 🎓 в профиле, кнопка «Готово»',
    res.line === '🎓 Урок 3 пройден! · Обучение пройдено! Иконка 🎓 — в профиле.' && res.btns.join() === '🎓 Готово' &&
    res.st.done.join() === '1,2,3', JSON.stringify(res));
  await page.click('#resultBox .r-actions .btn');
  await page.waitForTimeout(250);
  m = await menu();
  const prefs = await page.evaluate(() => ({ bonus: bonusMode, n: bonusCountChoice, lesson }));
  check('после обучения — карточки нет, «Друзья» открыты', !m.card && !m.runLocked, JSON.stringify(m));
  check('свои настройки игрока урок вернул как было', !prefs.bonus && prefs.n === 0 && prefs.lesson === null, JSON.stringify(prefs));
  await page.context().close();

  // Пропустить
  page = await newGame(browser, { newbie: true });
  await page.evaluate(() => { currentLang = 'ru'; applyTranslations(); });
  await page.click('#friendsBtn');
  await page.waitForTimeout(150);
  await page.click('#gateSkip');
  await page.waitForTimeout(150);
  m = await menu();
  check('«Пропустить обучение» — всё открыто, карточки нет', !m.card && !m.runLocked, JSON.stringify(m));
  await page.context().close();

  // Кто уже играл, тот не новичок
  page = await newGame(browser, { newbie: true, user: 'Лев' });
  m = await menu();
  check('у игравшего раньше нет ни уроков, ни замков', !m.card && !m.runLocked, JSON.stringify(m));
  await page.context().close();

  // Иконка 🎓: закрыта до обучения; прошёл без входа — база узнает при выборе
  page = await newGame(browser, { user: 'Лев', profile: { tutorialDone: false } });
  await page.click('#accountChip');
  await page.waitForTimeout(300);
  await page.evaluate(() => showAvatarPicker(true));
  await page.waitForTimeout(100);
  const tile = () => page.evaluate(() => {
    const b = document.querySelector('#avGrid .av-tile[data-icon="🎓"]');
    return b ? { locked: b.classList.contains('locked') } : null;
  });
  let tl = await tile();
  check('в сетке иконок есть 🎓 — закрыта до обучения', tl && tl.locked, JSON.stringify(tl));
  await page.click('#avGrid .av-tile[data-icon="🎓"]');
  await page.waitForTimeout(200);
  check('нажал закрытую — «Откроется после обучения»',
    (await page.evaluate(() => document.getElementById('avNote').textContent)) === 'Откроется после обучения');
  await page.evaluate(() => { tutSave({ done: [1, 2, 3], skipped: false }); renderAvatarGrid(); showAvatarPicker(true); });
  await page.waitForTimeout(100);
  tl = await tile();
  check('обучение пройдено — 🎓 открыта', tl && !tl.locked, JSON.stringify(tl));
  await page.click('#avGrid .av-tile[data-icon="🎓"]');
  await page.waitForTimeout(400);
  const av = await page.evaluate(() => ({ fin: window.__tutorialFinished || 0, avatar: window.__profile.avatar }));
  check('выбор 🎓 сначала отмечает обучение в базе, потом ставит иконку', av.fin >= 1 && av.avatar === '🎓', JSON.stringify(av));
  await page.context().close();
}

// Тексты уведомлений: каждый вид, который знает база, есть на всех языках,
// а заголовок — «Hot or Cold» везде
async function testPushTexts() {
  console.log('\nТексты уведомлений');
  const fs = require('fs'), path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'push', 'index.ts'), 'utf8');
  let code = src.slice(src.indexOf('const TEXT'), src.indexOf('Deno.serve'));
  code = 'return ' + code.slice(code.indexOf('>> = {') + 5).trim().replace(/;\s*$/, '');
  const TEXT = new Function(code)();
  // Виды — из последней миграции, где их список меняли
  const dir = path.join(__dirname, '..', 'supabase', 'migrations');
  const last = fs.readdirSync(dir).sort().reverse().map(f => fs.readFileSync(path.join(dir, f), 'utf8'))
    .find(t => /constraint push_kind/.test(t));
  const kinds = last.match(/check \(kind in \(([^)]*)\)\)/)[1].split(',').map(k => k.trim().replace(/'/g, ''));
  const missing = [];
  ['en', 'ru', 'fr', 'de'].forEach(l => kinds.forEach(k => {
    const f = TEXT[l] && TEXT[l][k];
    const r = f ? f('Кира') : null;
    if (!r || r[0] !== 'Hot or Cold' || !r[1]) missing.push(l + ':' + k);
  }));
  check('у каждого вида уведомления есть текст на 4 языках, заголовок «Hot or Cold»',
    kinds.length >= 6 && missing.length === 0, 'видов ' + kinds.length + ', нет: ' + missing.join(' '));
  check('«принял вызов» называет того, кто принял', TEXT.ru.accepted('Кира')[1].startsWith('Кира'), TEXT.ru.accepted('Кира')[1]);
}

// Вдвоём за одним телефоном при помехах — шторка между ходами
async function testCurtain(browser) {
  console.log('\nШторка «Передайте телефон»');
  const page = await newGame(browser);
  await page.click('.mode-btn.duel');
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  await page.evaluate(() => { secret = 90; });
  const state = () => page.evaluate(() => ({
    shown: !document.getElementById('curtain').classList.contains('hidden'),
    text: document.getElementById('ctText').textContent, go: document.getElementById('ctGo').textContent, cur: D.cur }));
  const guess = async v => { await page.fill('#guessInput', String(v)); await page.click('#tSubmitGuess'); await page.waitForTimeout(150); };
  await guess(10);
  await guess(15);
  let st = await state();
  check('без помех шторки нет — и после двух ходов', !st.shown && st.cur === 0, JSON.stringify(st));
  // Игрок 1 наступает на туман — туман ложится на игрока 2
  await page.evaluate(() => { D.bonuses = [{ value: 20, type: 'fog', taken: false }]; bonusMode = true; renderAll(); });
  await guess(20);
  st = await state();
  check('помеха есть — после хода «Передайте телефон: Игрок 2»', st.shown && st.cur === 1 &&
    st.text.includes('Передайте телефон: Игрок 2') && st.go === 'Я Игрок 2 — показать', JSON.stringify(st));
  await page.click('#ctGo');
  await page.waitForTimeout(100);
  st = await state();
  check('«Показать» открывает экран тому, чей ход', !st.shown && st.cur === 1, JSON.stringify(st));
  await guess(30);
  st = await state();
  check('и так — после каждого хода, пока действует помеха', st.shown && st.cur === 0 && st.text.includes('Игрок 1'), JSON.stringify(st));
  await page.click('#ctGo');
  await guess(90);
  st = await state();
  check('раунд окончен — шторки нет', !st.shown, JSON.stringify(st));
  await page.context().close();

  // С ботом и онлайн шторки не бывает: экран у каждого свой
  const p2 = await newGame(browser);
  await p2.evaluate(() => openSetup('duel', true));
  await p2.waitForTimeout(150);
  await p2.evaluate(() => { BOT_SPEED = 1000; });
  await p2.click('#tStartMatch');
  await p2.waitForTimeout(250);
  await p2.evaluate(() => { stopBot(); secret = 90; D.fog = [true, false]; D.cur = 1; renderAll(); duelPlay(40); stopBot(); });
  await p2.waitForTimeout(150);
  check('с ботом шторки нет', await p2.evaluate(() => document.getElementById('curtain').classList.contains('hidden')));
  await p2.context().close();

  // Жетон, пока ждём соперника онлайн, не нажимается
  const p3 = await newGame(browser, { user: 'Лев' });
  await p3.evaluate(() => { Object.assign(window.__match, { lobby: true, lobbyLeft: 200 }); openMatch(1); });
  await p3.waitForTimeout(500);
  const tok = await p3.evaluate(() => document.getElementById('ptoken0').disabled);
  await p3.evaluate(() => { Object.assign(window.__match, { lobby: false, lobbyLeft: null, startsIn: null }); refreshMatch(true); });
  await p3.waitForTimeout(400);
  const tok2 = await p3.evaluate(() => document.getElementById('ptoken0').disabled);
  check('пока ждём соперника, жетон не нажимается; после старта — можно', tok === true && tok2 === false, tok + ' → ' + tok2);
  await p3.context().close();
}

// Приглашение по ссылке и QR-коду
async function testInviteLink(browser) {
  console.log('\nПриглашение по ссылке');
  const { GAME_URL } = require('./helpers');
  // Пригласить: QR и ссылка
  let page = await newGame(browser, { user: 'Лев' });
  await page.click('#friendsBtn');
  await page.waitForTimeout(400);
  check('у друзей есть «Пригласить друга»', (await page.locator('#tInviteBtn').textContent()) === '🔗 Пригласить друга');
  await page.click('#tInviteBtn');
  await page.waitForTimeout(300);
  const inv = await page.evaluate(() => ({
    open: !document.getElementById('inviteModal').classList.contains('hidden'),
    svg: !!document.querySelector('#invQr svg rect, #invQr svg path'),
    link: inviteLink, linkText: !!document.getElementById('invLink') }));
  check('окно приглашения: QR-код, ссылка с кодом — в кнопке, а не текстом', inv.open && inv.svg && !inv.linkText &&
    /index\.html\?invite=ABCD2345$/.test(inv.link), JSON.stringify(inv));
  await page.click('#invCopy');
  await page.waitForTimeout(200);
  const note = await page.evaluate(() => document.getElementById('invNote').textContent);
  check('«Скопировать» — ссылка в буфере или на экране', note === 'Ссылка скопирована' || note === inv.link, note);
  await page.context().close();

  // Открыл ссылку, уже в аккаунте: «Лев зовёт вас в друзья» → сразу друзья
  const open = async (opts, code) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => check('без ошибок JS', false, e.message));
    await applyStub(p, opts);
    await p.addInitScript(() => { window.__invites = { ABCD2345: 'Лев' }; });
    await p.goto(GAME_URL + '?invite=' + code);
    await p.waitForTimeout(600);
    return p;
  };
  page = await open({ user: 'Кира' }, 'abcd2345');
  let st = await page.evaluate(() => ({
    open: !document.getElementById('inviteInModal').classList.contains('hidden'),
    title: document.getElementById('inTitle').textContent, add: document.getElementById('inAdd').textContent,
    url: location.search }));
  check('ссылка открыта — «👋 Лев зовёт вас в друзья»',
    // Из адреса код убирается на настоящем сайте; у file:// менять адрес
    // браузер не даёт — это проверяет offline.js на локальном сервере
    st.open && st.title === '👋 Лев зовёт вас в друзья' && st.add === 'Добавить в друзья', JSON.stringify(st));
  await page.click('#inAdd');
  await page.waitForTimeout(500);
  st = await page.evaluate(() => ({ acc: window.__accepted, friends: !document.getElementById('screenFriends').classList.contains('hidden'),
    note: document.getElementById('friendsNote').textContent, left: localStorage.getItem('hc_pending_invite') }));
  check('«Добавить» — сразу друзья, код больше не ждёт', st.acc && st.acc[0] === 'ABCD2345' && st.friends &&
    st.note === 'Теперь вы друзья: Лев' && st.left === null, JSON.stringify(st));
  await page.context().close();

  // Новичок без аккаунта: сначала вход, потом добавить; «Друзья» открыты сразу
  page = await open({ newbie: true }, 'ABCD2345');
  st = await page.evaluate(() => ({
    add: document.getElementById('inAdd').textContent, locked: !onlineOpen(),
    card: !document.getElementById('tutCard').classList.contains('hidden') }));
  check('новичок по приглашению: «Войти или зарегистрироваться», «Друзья» не закрыты, уроки предложены',
    st.add === 'Войти или зарегистрироваться' && !st.locked && st.card, JSON.stringify(st));
  await page.click('#inAdd');
  await page.waitForTimeout(300);
  check('ведёт на вход', await page.locator('#screenAuthChoice').isVisible());
  await page.evaluate(() => { localStorage.setItem('hc_run_user', 'Кира'); localStorage.setItem('hc_run_pin', '4321'); afterAuth(); });
  await page.waitForTimeout(800);
  st = await page.evaluate(() => ({ open: !document.getElementById('inviteInModal').classList.contains('hidden'),
    add: document.getElementById('inAdd').textContent }));
  check('после входа — снова предложение, уже «Добавить в друзья»', st.open && st.add === 'Добавить в друзья', JSON.stringify(st));
  await page.context().close();

  // Свой код и несуществующий — ничего не показываем
  page = await open({ user: 'Лев' }, 'ABCD2345');
  st = await page.evaluate(() => ({ open: !document.getElementById('inviteInModal').classList.contains('hidden'), left: localStorage.getItem('hc_pending_invite') }));
  check('свою ссылку открыл сам — ничего не спрашиваем', !st.open && st.left === null, JSON.stringify(st));
  await page.context().close();
  page = await open({ user: 'Кира' }, 'ZZZZ9999');
  st = await page.evaluate(() => ({ open: !document.getElementById('inviteInModal').classList.contains('hidden'), left: localStorage.getItem('hc_pending_invite') }));
  check('несуществующий код — тихо забыт', !st.open && st.left === null, JSON.stringify(st));
  await page.context().close();
}

// Задания дня, достижения, итоги сезона (миграция 041)
async function testProgress(browser) {
  console.log('\nЗадания дня и достижения');
  const fs = require('fs'), path = require('path');
  const PROG = { day: '2026-09-29', streak: 2, bestStreak: 4, doneToday: false, secondsLeft: 5 * 3600 + 100,
    quests: [{ code: 'play2', goal: 2, progress: 1 }, { code: 'win1', goal: 1, progress: 1 }, { code: 'run_best3', goal: 3, progress: 0 }],
    achievements: [{ code: 'first_win', at: '2026-09-01' }, { code: 'tutorial', at: '2026-09-02' }] };

  // Коды и иконки — одни в игре и в базе
  const mig = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '041_progress.txt'), 'utf8');
  // Список достижений — из последней миграции, где его меняли
  const migDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const achMig = fs.readdirSync(migDir).sort().reverse().map(f => fs.readFileSync(path.join(migDir, f), 'utf8'))
    .find(x => /function achievement_codes\(\)/.test(x));
  const page = await newGame(browser, { user: 'Лев', profile: {}, progress: PROG });
  const js = await page.evaluate(() => ({ ach: ACHIEVEMENTS.map(a => a.code), icons: QUEST_ICONS.map(q => q.days + q.icon),
    q: Object.keys(t().prog.q), langs: ['en', 'ru', 'fr', 'de'].map(l => {
      const P = i18n[l].prog;
      return ACH_LADDERS.every(l => P.lad[l.key] && P.lad[l.key].title) &&
        Object.keys(i18n.ru.prog.q).every(k => P.q[k]) && Object.keys(i18n.ru.prog).every(k => k in P);
    }) }));
  const dbAch = achMig.match(/select array\[('first_win'[^\]]*)\]/)[1].replace(/\s/g, '').split(',').map(x => x.replace(/'/g, ''));
  const dbIcons = [...mig.match(/values \(3, '🔥'\)[^;]*;/)[0].matchAll(/\((\d+), '([^']+)'\)/g)].map(m => m[1] + m[2]);
  // Задания — тоже из последней миграции, где менялся их набор
  const qMig = fs.readdirSync(migDir).sort().reverse().map(f => fs.readFileSync(path.join(migDir, f), 'utf8'))
    .find(x => /function quest_pool\(\)/.test(x));
  const dbQuests = [...qMig.match(/create or replace function quest_pool\(\)[\s\S]*?\$\$;/)[0].matchAll(/'([a-z_0-9]+)'/g)].map(m => m[1]);
  check('достижения: 71 код лестницами, те же, что в базе, в том же порядке', js.ach.length === 71 && js.ach.join() === dbAch.join(), js.ach.join() + ' / ' + dbAch.join());
  check('иконки за серию — те же, что в базе', js.icons.join() === dbIcons.join(), js.icons.join() + ' / ' + dbIcons.join());
  check('у каждого задания из базы есть текст, лишних нет', dbQuests.length === 9 && dbQuests.every(c => js.q.includes(c)) &&
    js.q.length === 9, dbQuests.join() + ' / ' + js.q.join());
  check('тексты заданий и достижений есть на всех 4 языках', js.langs.every(Boolean), JSON.stringify(js.langs));

  // Задания дня спрятаны (DAILY_EXTRAS): по умолчанию в меню их нет
  check('задания дня спрятаны: карточки в меню нет', await page.evaluate(() => !DAILY_EXTRAS &&
    document.getElementById('questCard').classList.contains('hidden')));
  // Дальше — так, как будет, когда их вернут
  await page.evaluate(() => { DAILY_EXTRAS = true; renderQuestCard(); });

  // Карточка в меню
  const card = () => page.evaluate(() => {
    const c = document.getElementById('questCard');
    return { shown: !c.classList.contains('hidden'), title: document.getElementById('qcTitle').textContent,
      streak: document.getElementById('qcStreak').textContent,
      rows: [...document.querySelectorAll('#qcList .qc-row')].map(r => (r.classList.contains('done') ? '✓' : '·') + r.textContent),
      foot: document.getElementById('qcFoot').textContent };
  });
  let c = await card();
  check('в меню — «📅 Задания дня», серия 🔥 2', c.shown && c.title === '📅 Задания дня' && c.streak === '🔥 2', JSON.stringify(c));
  check('три задания с прогрессом; выполненное отмечено',
    c.rows.join('|') === '·○Сыграть 2 любые игры1/2|✓✅Одержать победу — в Приключении или над другом1/1|·○Пройти 3 раунда Испытания за одну попытку0/3', c.rows.join('|'));
  check('внизу — когда новые и какая иконка следующая', c.foot === 'Новые задания через 5 ч · Серия 7 дн. — иконка 🚀', c.foot);
  check('часовой пояс отправлен', await page.evaluate(() => (window.__progressCalls || []).some(a => typeof a.p_tz === 'string' && a.p_tz.length > 0)));

  // Всё выполнено
  await page.evaluate(() => { Object.assign(window.__progress, { doneToday: true, streak: 3,
    quests: window.__progress.quests.map(q => Object.assign({}, q, { progress: q.goal })) }); showScreen('mode'); });
  await page.waitForTimeout(300);
  c = await card();
  check('всё выполнено — «Приходите завтра», серия 🔥 3', c.streak === '🔥 3' && c.foot.startsWith('Всё выполнено!') && c.rows.every(r => r[0] === '✓'), JSON.stringify(c));

  // Профиль: серия, достижения, иконки за серию
  await page.click('#accountChip');
  await page.waitForTimeout(400);
  let pf = await page.evaluate(() => ({ streak: document.getElementById('pfStreak').textContent,
    streakShown: !document.getElementById('pfStreak').classList.contains('hidden'),
    head: document.getElementById('tAchHead').textContent,
    rows: [...document.querySelectorAll('#pfAchGrid .lad-row')].map(x => x.dataset.ladder + ':' + x.dataset.tier),
    wins: (document.querySelector('#pfAchGrid .lad-row[data-ladder="wins"]') || {}).textContent || '' }));
  check('профиль: серия заданий и лучшая', pf.streakShown && pf.streak === '📅 Серия заданий: 3 дн. · лучшая 4', pf.streak);
  // Лиг нет (миграция 062): их лестница и ступени — только у того, кто их получил
  check('профиль: «🏅 Достижения: 2 из 66», по строке на лестницу со ступенью, лиг нет',
    pf.head === '🏅 Достижения: 2 из 66' && pf.rows.join() === 'wins:1,games:0,streak:0,firstTry:0,modes:0,quests:0,run:0,friends:0,rivals:0,tutorial:1,advStars:0,advWorlds:0,advGold:0',
    JSON.stringify(pf));
  check('победы — «Победы», без «онлайн»', /Победы ·/.test(pf.wins) && !/онлайн/i.test(pf.wins), pf.wins);
  check('у лестницы — что открыто и что дальше', /Первая победа/.test(pf.wins) && /Дальше: 5 побед/.test(pf.wins), pf.wins);
  // Новые лестницы и верх старых: сколько до следующей ступени
  const lad = await page.evaluate(() => {
    const box = document.createElement('div');
    const got = ['first_win', 'wins_5', 'wins_10', 'wins_25', 'wins_50', 'wins_100', 'wins_250', 'wins_500', 'wins_1000',
                 'first_try_1', 'modes_2', 'rivals_1', 'rivals_3'].map(code => ({ code }));
    fillAchLadders(box, got, { wins: 1200, firstTry: 2, modes: 2, rivals: 4 });
    const row = k => box.querySelector('.lad-row[data-ladder="' + k + '"]');
    return { wins: row('wins').textContent, winsMedal: row('wins').querySelector('.ach-medal').className,
      first: row('firstTry').textContent, modes: row('modes').textContent, rivals: row('rivals').textContent };
  });
  check('победы: все 9 ступеней, «1000 побед», медаль высшей ступени',
    /1\s?000 побед/.test(lad.wins) && /Все ступени пройдены/.test(lad.wins) && /\bt9\b/.test(lad.winsMedal), JSON.stringify(lad));
  check('с первой попытки: дальше «3 раза», 2 / 3', /С первой попытки · 1 раз/.test(lad.first) && /Дальше: 3 раза · 2 \/ 3/.test(lad.first), lad.first);
  check('режимы и друзья: «2 режима» → «3 режима», «3 друга» → «10 друзей» 4 / 10',
    /Дальше: 3 режима · 2 \/ 3/.test(lad.modes) && /Победы над друзьями · 3 друга/.test(lad.rivals) && /Дальше: 10 друзей · 4 \/ 10/.test(lad.rivals),
    lad.modes + ' | ' + lad.rivals);
  await page.click('#pfAvatar');
  await page.waitForTimeout(200);
  const tiles = await page.evaluate(() => ['🔥', '🚀'].map(i => {
    const b = document.querySelector('#avGrid .av-tile[data-icon="' + i + '"]');
    return b ? (b.classList.contains('locked') ? 'locked' : 'open') : 'none';
  }));
  check('иконки за серию: 🔥 (3 дня) открыта при лучшей 4, 🚀 (7) — под замком', tiles.join() === 'open,locked', tiles.join());
  await page.click('#avGrid .av-tile[data-icon="🚀"]');
  await page.waitForTimeout(200);
  const note = await page.evaluate(() => ({ note: document.getElementById('avNote').textContent,
    sent: window.__profile.calls.some(x => x.name === 'set_avatar') }));
  check('закрытая 🚀 — «Откроется за серию заданий: 7 дн.», на сервер не шлём',
    note.note === 'Откроется за серию заданий: 7 дн. подряд' && !note.sent, JSON.stringify(note));
  await page.click('#avGrid .av-tile[data-icon="🔥"]');
  await page.waitForTimeout(300);
  check('открытая 🔥 ставится', await page.evaluate(() => window.__profile.avatar === '🔥'));
  // Как сейчас в игре (задания спрятаны): серии заданий в профиле нет, её лестницы
  // нет без ступени, в счёт её ступени не идут, закрытых иконок за неё не видно
  const hid = await page.evaluate(() => { DAILY_EXTRAS = false; fillProfile(); renderAvatarGrid(); showAvatarPicker(true);
    return { streak: document.getElementById('pfStreak').classList.contains('hidden'),
      quests: !!document.querySelector('#pfAchGrid .lad-row[data-ladder="quests"]'), head: document.getElementById('tAchHead').textContent,
      fire: !!document.querySelector('#avGrid .av-tile[data-icon="🔥"]'), rocket: !!document.querySelector('#avGrid .av-tile[data-icon="🚀"]') }; });
  check('задания спрятаны — в профиле ни серии, ни её лестницы, «2 из 60»; иконка 🔥 (своя) есть, закрытой 🚀 нет',
    hid.streak && !hid.quests && hid.head === '🏅 Достижения: 2 из 60' && hid.fire && !hid.rocket, JSON.stringify(hid));
  await page.click('#tProfileDone');
  await page.context().close();

  // Без миграции — ни карточки, ни достижений, ни иконок
  const p2 = await newGame(browser, { user: 'Лев', profile: {} });
  await p2.waitForTimeout(200);
  const none = await p2.evaluate(() => ({ card: document.getElementById('questCard').classList.contains('hidden'),
    fold: (fillProfile(), document.getElementById('pfAchFold').classList.contains('hidden')), icon: (renderAvatarGrid(), !!document.querySelector('#avGrid [data-icon="🔥"]')) }));
  check('сервер без миграции — карточки и достижений нет, иконок за серию тоже', none.card && none.fold && !none.icon, JSON.stringify(none));
  await p2.context().close();

  // Вышел из аккаунта — карточка уходит сразу, чужие задания не висят
  const p6 = await newGame(browser, { user: 'Лев', progress: PROG });
  const before = await p6.evaluate(() => { DAILY_EXTRAS = true; renderQuestCard(); return !document.getElementById('questCard').classList.contains('hidden'); });
  await p6.click('#accountChip');
  await p6.waitForTimeout(200);
  await p6.evaluate(() => { document.getElementById('pfMoreFold').open = true; }); await p6.click('#tLogoutStart');
  await p6.click('#tLogoutConfirm');
  await p6.waitForTimeout(300);
  check('вышел из аккаунта — карточки заданий нет', before && await p6.evaluate(() =>
    document.getElementById('questCard').classList.contains('hidden') && progressInfo === null));
  await p6.context().close();

  // Без входа — карточки нет
  const p3 = await newGame(browser, { progress: PROG });
  check('без входа карточки нет', await p3.evaluate(() => { DAILY_EXTRAS = true; renderQuestCard(); return document.getElementById('questCard').classList.contains('hidden'); }));
  await p3.context().close();

  // Достижения друга: в «⋯» у друга, не у чужого
  const p4 = await newGame(browser, { user: 'Лев', progress: PROG });
  await p4.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' }, { username: 'Ося', relation: 'incoming' }];
    window.__friendAch = { 'Кира': [{ code: 'league_gold', at: '2026-09-01' }, { code: 'first_win', at: '2026-08-01' }] };
  });
  await p4.click('#friendsBtn');
  await p4.waitForTimeout(500);
  await p4.evaluate(() => openFriendSheet('Ося'));
  check('у не-друга «Достижений» нет', await p4.evaluate(() => document.getElementById('fsAch').classList.contains('hidden')));
  await p4.evaluate(() => closeFriendSheet());
  await p4.evaluate(() => openFriendSheet('Кира'));
  const fsAch = await p4.evaluate(() => ({ hidden: document.getElementById('fsAch').classList.contains('hidden'), text: document.getElementById('fsAch').textContent }));
  check('у друга в «⋯» — «🏅 Достижения»', !fsAch.hidden && fsAch.text === '🏅 Достижения', JSON.stringify(fsAch));
  await p4.click('#fsAch');
  await p4.waitForTimeout(400);
  const fa = await p4.evaluate(() => ({ open: !document.getElementById('achModal').classList.contains('hidden'),
    title: document.getElementById('achTitle').textContent,
    tiles: [...document.querySelectorAll('#achGrid .ach-tile')].map(x => x.dataset.ladder + ':' + x.dataset.tier + ':' + x.textContent) }));
  // У друга — по плитке на лестницу с его высшей ступенью
  check('окно: «Достижения: Кира» — высшая ступень каждой открытой лестницы',
    fa.open && fa.title === 'Достижения: Кира' && fa.tiles.join() === 'wins:1:🏆1Первая победа,league:2:🛡️2Золото', JSON.stringify(fa));
  await p4.evaluate(() => { window.__friendAch['Кира'] = []; closeFriendAch(); openFriendAch('Кира'); });
  await p4.waitForTimeout(300);
  check('у друга пока ничего — «Пока ни одного»', await p4.evaluate(() => document.getElementById('achNote').textContent === 'Пока ни одного'));
  await p4.context().close();
}

// Мгновенные сигналы через Realtime (миграция 042)
async function testRealtime(browser) {
  console.log('\nМгновенные сигналы (Realtime)');
  const page = await newGame(browser, { user: 'Лев' });
  await page.waitForTimeout(200);
  let st = await page.evaluate(() => ({ name: window.__sigChannel && window.__sigChannel.name, live: sigLive }));
  check('вошёл — подписан на свой канал', st.name === 'hc:kЛев' && st.live === true, JSON.stringify(st));

  const calls = n => page.evaluate(n => window.__rpcCalls.filter(c => c.name === n).length, n);
  // Партия: опрос выключаем — обновить экран должен только сигнал
  await page.evaluate(() => openMatch(1));
  await page.waitForTimeout(500);
  await page.evaluate(() => stopMatchPoll());
  let before = await calls('match_state');
  await page.evaluate(() => {
    const M = window.__match;
    M.moves.push({ seat: 1, guess: 77, tier: 3 });
    M.cur = 0;
    window.__sigFire({ k: 'match', id: 1 });
  });
  await page.waitForTimeout(300);
  // Ходы партии — в общем списке игры (глобальный history, не window.history)
  const seen = await page.evaluate(() => history.map(h => h.guess).join('|'));
  check('сигнал «партия» — ход соперника сразу на экране, без опроса',
    (await calls('match_state')) === before + 1 && seen.includes('77'), (await calls('match_state')) - before + ' / ' + seen.slice(0, 120));
  before = await calls('match_state');
  await page.evaluate(() => window.__sigFire({ k: 'match', id: 99 }));
  await page.waitForTimeout(200);
  check('сигнал про другую партию эту не трогает', (await calls('match_state')) === before);
  // Сигнал во время запроса не теряется: после ответа — ещё один
  before = await calls('match_state');
  await page.evaluate(async () => {
    const p = refreshMatch(true);
    window.__sigFire({ k: 'match', id: 1 });
    await p;
  });
  await page.waitForTimeout(300);
  check('сигнал, пришедший во время запроса, не теряется', (await calls('match_state')) === before + 2,
    String((await calls('match_state')) - before));
  await page.evaluate(() => backToOnline());
  await page.waitForTimeout(300);

  // Друзья: заявка приходит сразу
  await page.evaluate(() => { quitToMenu(); });
  await page.click('#friendsBtn');
  await page.waitForTimeout(500);
  await page.evaluate(() => { stopFriendsPoll(); window.__friends = [{ username: 'Гриша', relation: 'incoming', unread: 0 }]; });
  before = await calls('list_friends');
  await page.evaluate(() => window.__sigFire({ k: 'friends' }));
  await page.waitForTimeout(300);
  const rows = await page.evaluate(() => [...document.querySelectorAll('#friendsList .friend-row')].map(r => r.dataset.name));
  check('сигнал «друзья» — заявка видна сразу', (await calls('list_friends')) === before + 1 && rows.includes('Гриша'), rows.join());
  // Сообщение другу: в переписке — сразу
  await page.evaluate(() => { window.__talk = { 'Кира': [{ id: 1, mine: false, code: 'play', ago: 5 }] }; openChat('Кира'); });
  await page.waitForTimeout(400);
  await page.evaluate(() => { stopChatPoll(); window.__talk['Кира'].push({ id: 2, mine: false, code: 'hour', ago: 1 }); });
  before = await calls('friend_thread');
  await page.evaluate(() => window.__sigFire({ k: 'chat', id: 2 }));
  await page.waitForTimeout(300);
  check('сигнал «сообщение» — в открытой переписке сразу', (await calls('friend_thread')) === before + 1);

  // Вышел — канал закрыт
  await page.evaluate(() => { runLogout(); });
  st = await page.evaluate(() => ({ ch: window.__sigChannel, live: sigLive, fired: window.__sigFire({ k: 'friends' }) }));
  check('вышел из аккаунта — канал закрыт', st.ch === null && st.live === false && st.fired === false, JSON.stringify(st));
  await page.context().close();

  // Старый сервер без миграции и клиент без Realtime — игра как раньше, на опросе
  for (const opts of [{ user: 'Лев', noSignalKey: true }, { user: 'Лев', noRealtime: true }, { user: 'Лев', realtimeDown: true }]) {
    const p = await newGame(browser, opts);
    await p.waitForTimeout(200);
    await p.click('#friendsBtn');
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({ live: sigLive, friends: !document.getElementById('screenFriends').classList.contains('hidden') }));
    check('без Realtime (' + Object.keys(opts).filter(k => k !== 'user')[0] + ') — канала нет, друзья открываются', !r.live && r.friends, JSON.stringify(r));
    await p.context().close();
  }
}

// Игра разделена на файлы: каждый, что подключает index.html, должен быть в
// кеше service worker, иначе без сети игра не откроется
async function testSplitFiles() {
  console.log('\nФайлы игры и офлайн-кеш');
  const fs = require('fs'), path = require('path');
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const own = [...html.matchAll(/<(?:script src|link rel="stylesheet" href)="([^"]+)"/g)].map(m => m[1])
    .filter(u => !/^https?:/.test(u));
  const missing = own.filter(u => !sw.includes("'./" + u + "'"));
  const absent = own.filter(u => !fs.existsSync(path.join(root, u)));
  check('всё своё, что подключает страница, есть на диске и в кеше service worker',
    own.length >= 6 && missing.length === 0 && absent.length === 0,
    'файлов ' + own.length + '; нет в кеше: ' + missing.join(' ') + '; нет на диске: ' + absent.join(' '));
  check('в index.html не осталось встроенного кода и стилей',
    !/<script>(?!\s*<\/script>)/.test(html) && !/<style>/.test(html));
}

// Разбор глазами ученика: ошибки ввода, повтор, мягкие оценки, умолчания
// тренировки, правила Испытания, PIN при регистрации, «в игре сейчас»
async function testUxPass(browser) {
  console.log('\nРазбор глазами ученика');
  const note = p => p.evaluate(() => {
    const el = document.getElementById('guessNote');
    return { text: el.classList.contains('hidden') ? '' : el.textContent, bad: el.classList.contains('bad') };
  });
  // Тренировка: новичку 1–100, выбор запоминается
  let page = await newGame(browser, { freshSetup: true });
  await page.click('.mode-btn.solo');
  await page.waitForTimeout(200);
  check('тренировка по умолчанию — 1–100', (await page.inputValue('#rangeMax')) === '100', await page.inputValue('#rangeMax'));
  await page.selectOption('#rangeMax', '20');
  await page.selectOption('#attemptsCount', { index: 2 });
  const att = await page.inputValue('#attemptsCount');
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  // Число вне диапазона — сказано словами, ход не сделан
  await page.fill('#guessInput', '38');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(150);
  let n = await note(page);
  check('число вне диапазона — «Нужно число от 1 до 20», ход не засчитан',
    n.text === 'Нужно число от 1 до 20' && n.bad && await page.evaluate(() => history.length === 0), JSON.stringify(n));
  await page.fill('#guessInput', '');
  await page.type('#guessInput', '5');
  n = await note(page);
  check('начал набирать — замечание ушло', n.text === '', JSON.stringify(n));
  // Повтор — предупреждение, попытка потрачена
  const s = await page.evaluate(() => secret);
  const g = s === 1 ? 2 : 1;
  for (let i = 0; i < 2; i++) { await page.fill('#guessInput', String(g)); await page.click('#tSubmitGuess'); await page.waitForTimeout(150); }
  n = await note(page);
  check('повтор — «уже называли», попытка потрачена',
    n.text === g + ' уже называли — ответ тот же, попытка потрачена' && !n.bad &&
    await page.evaluate(() => history.length === 2), JSON.stringify(n));
  const grades = await page.evaluate(() => document.getElementById('historyList').textContent);
  check('оценки ходов — без шахматных слов', !/Зевок|Неточность|Ошибка/.test(grades), grades.slice(0, 200));
  // Перезагрузка — как новый заход: выбор должен пережить её. Сначала убедиться,
  // что он записан: под нагрузкой браузер сбрасывает запись на диск не сразу,
  // а живой игрок и не перезагружает страницу через миллисекунды после выбора
  await page.waitForFunction(() => localStorage.getItem('hc_range') === '20');
  await page.waitForTimeout(500);
  await page.reload();
  await page.waitForSelector('.mode-btn.solo', { state: 'visible' });
  await page.waitForTimeout(300);
  await page.click('.mode-btn.solo');
  await page.waitForTimeout(200);
  const again = { r: await page.inputValue('#rangeMax'), a: await page.inputValue('#attemptsCount'), want: att };
  check('в следующий раз — прошлый выбор: 1–20 и те же попытки',
    again.r === '20' && again.a === att, JSON.stringify(again));
  await page.context().close();

  // Дуэль: число соперника — тоже повтор
  page = await newGame(browser, {});
  await page.click('.mode-btn.duel');
  await page.selectOption('#rangeMax', '100');
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  const s2 = await page.evaluate(() => secret);
  const g2 = s2 === 1 ? 2 : 1;
  for (let i = 0; i < 2; i++) { await page.fill('#guessInput', String(g2)); await page.click('#tSubmitGuess'); await page.waitForTimeout(150); await liftCurtainIfShown(page); }
  check('дуэль: число соперника назвали снова — тоже предупреждение', (await note(page)).text.startsWith(g2 + ' уже называли'));
  await page.context().close();

  // Онлайн: вне диапазона — на сервер не уходит
  page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => openMatch(1));
  await page.waitForTimeout(500);
  await page.fill('#guessInput', '500');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  n = await note(page);
  check('онлайн: вне диапазона — замечание, на сервер не отправлено',
    n.text === 'Нужно число от 1 до 100' && await page.evaluate(() => !window.__rpcCalls.some(c => c.name === 'match_guess')), JSON.stringify(n));
  await page.context().close();

  // Испытание: правила свёрнуты всегда — кнопка «Начать» первая
  page = await newGame(browser, { user: 'Лев' });
  await page.click('.mode-btn.run');
  await page.waitForTimeout(500);
  let rules = await page.evaluate(() => ({ open: document.getElementById('runRules').open,
    head: document.getElementById('tRunRulesHead').textContent, n: document.querySelectorAll('#runRulesList li').length }));
  check('Испытание: «❓ Как играть» свёрнуто, внутри 5 правил',
    !rules.open && rules.head === '❓ Как играть' && rules.n === 5, JSON.stringify(rules));
  await page.click('#tRunStart');
  await page.waitForTimeout(400);
  await page.evaluate(() => openRunHub());
  await page.waitForTimeout(300);
  check('после первой игры правила свёрнуты', await page.evaluate(() => !document.getElementById('runRules').open));
  await page.context().close();

  // Регистрация: PIN скрыт, «глаз» показывает; подсказка — не «123456»
  page = await newGame(browser, {});
  await page.evaluate(() => { authReturn = 'mode'; showRunAuth('register'); });
  let pin = await page.evaluate(() => ({ type: document.getElementById('runPin').type, ph: document.getElementById('runPin').placeholder }));
  check('регистрация: PIN скрыт, подсказка «Любые 6 цифр»', pin.type === 'password' && pin.ph === 'Любые 6 цифр', JSON.stringify(pin));
  await page.click('#runPinEye');
  check('«глаз» показывает набранный PIN', (await page.evaluate(() => document.getElementById('runPin').type)) === 'text');
  await page.evaluate(() => showRunAuth('login'));
  check('на входе PIN снова скрыт', (await page.evaluate(() => document.getElementById('runPin').type)) === 'password');
  await page.context().close();

  // «В игре сейчас»: зелёная точка, выше остальных, отметка «я здесь»
  page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' }, { username: 'Ося', relation: 'friend' }];
    window.__online = ['Ося'];
  });
  await page.click('#friendsBtn');
  await page.waitForTimeout(500);
  const fr = await page.evaluate(() => ({ seen: window.__seen || 0,
    rows: [...document.querySelectorAll('#friendsList .friend-row')].map(r => r.dataset.name + ':' +
      (r.querySelector('.avatar').classList.contains('online') ? 'on' : 'off') + ':' + (r.querySelector('.fr-status') || {}).textContent) }));
  check('друг в игре — зелёная точка, «В игре сейчас», выше остальных',
    fr.rows.join('|') === 'Ося:on:В игре сейчас|Кира:off:💬 Написать' &&
    await page.evaluate(() => document.querySelector('#friendsList .fr-status.on') !== null), fr.rows.join('|'));
  check('игра отмечается «я здесь»', fr.seen >= 1, String(fr.seen));
  await page.context().close();
  page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => { window.__friends = [{ username: 'Кира', relation: 'friend' }]; });
  await page.click('#friendsBtn');
  await page.waitForTimeout(500);
  check('сервер без миграции — список друзей как раньше, без точек',
    await page.evaluate(() => document.querySelectorAll('#friendsList .friend-row').length === 1 && !document.querySelector('.avatar.online')));
  await page.context().close();
}

// Онлайн один ход приносит несколько перерисовок подряд (ответ на ход и
// сигналы Realtime). Точка на прямой должна доехать плавно, а не прыгнуть
// в конец на второй перерисовке
async function testLineSmooth(browser) {
  console.log('\nПрямая: плавный ход точки при повторных перерисовках');
  const page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => { Object.assign(window.__match, { moves: [{ seat: 0, guess: 10, tier: 2 }, { seat: 1, guess: 20, tier: 3 }], cur: 0 }); openMatch(1); });
  await page.waitForTimeout(1500);
  await page.evaluate(() => stopMatchPoll());
  const s = await page.evaluate(async () => {
    window.__match.moves.push({ seat: 1, guess: 90, tier: 5 });
    const pos = () => {
      const c = [...document.querySelectorAll('#numLineSvg circle')].find(e => e.getAttribute('r') === '5');
      return c ? c.cx.animVal.valueInSpecifiedUnits : null;
    };
    await refreshMatch(true);
    const t0 = performance.now();
    await new Promise(r => setTimeout(r, 150));
    await refreshMatch(true);
    await refreshMatch(true);
    const out = [];
    while (performance.now() - t0 < 1300) {
      out.push({ t: Math.round(performance.now() - t0), x: pos() });
      await new Promise(r => setTimeout(r, 40));
    }
    return out;
  });
  const end = s[s.length - 1].x;
  // Через 0,35 с после хода точка ещё в пути — не у цели
  const mid = s.filter(p => p.t > 250 && p.t < 450).map(p => p.x);
  const steps = s.map((p, i) => i ? p.x - s[i - 1].x : 0);
  check('после второй перерисовки точка продолжает ехать, а не прыгает в конец',
    mid.length > 0 && mid.every(x => x < end - 3) && Math.max(...steps) < 25,
    s.map(p => p.t + ':' + Math.round(p.x)).join(' '));
  check('и доезжает до своего числа', end > 80, String(end));
  await page.context().close();
}

// Разбор глазами игрока: лишнего нет, нужное понятно, тексты на своём языке
// Новое оформление: темы, нижнее меню, плитки режимов, задания одной строкой
async function testRedesign(browser) {
  console.log('\nОформление и раскладка');
  const PROG = { day: '2026-10-28', streak: 2, bestStreak: 8, doneToday: false, secondsLeft: 3600,
    quests: [{ code: 'play2', goal: 2, progress: 1 }, { code: 'win1', goal: 1, progress: 1 }, { code: 'run_best3', goal: 3, progress: 0 }],
    achievements: [], stats: {} };
  const page = await newGame(browser, { user: 'Максим', progress: PROG });
  await page.evaluate(() => { localStorage.setItem('hc_run_best_максим', '1240'); showScreen('mode'); });
  await page.waitForTimeout(400);
  // Оформление одно — тёмное, и в светлом телефоне тоже
  check('фон тёмный', await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor) === 'rgb(20, 15, 51)');
  await page.click('#accountChip');
  await page.waitForTimeout(200);
  check('выбора темы в профиле нет', await page.locator('#themeSwitcher').count() === 0);
  await page.click('#tProfileDone');

  // Нижнее меню вместо значков в шапке
  check('нижнее меню видно на главном', await page.locator('#tabbar').isVisible());
  check('вкладка «Играть» подсвечена', await page.locator('#navPlay').evaluate(e => e.classList.contains('on')));
  check('вкладки подписаны', (await page.locator('#tabbar').textContent()).includes('Друзья') &&
    (await page.locator('#tabbar').textContent()).includes('Профиль'));
  check('в шапке только название', await page.locator('.top-controls button').count() === 0);

  // Под Испытанием — своё: рекорд
  await page.waitForTimeout(300);
  check('под Испытанием — рекорд', /1\s240/.test(await page.locator('#tRunInfo').textContent()) &&
    await page.locator('#tRunInfo').isVisible(), await page.locator('#tRunInfo').textContent());
  check('плитки онлайна нет, Испытание — выше режимов без интернета', await page.evaluate(() => !document.querySelector('.mode-btn.online') &&
    document.querySelector('.mode-btn.run').getBoundingClientRect().top <
    document.querySelector('.mode-btn.solo').getBoundingClientRect().top));
  const tiles = await page.evaluate(() => ['solo', 'duel', 'bot'].map(k =>
    document.querySelector('.mode-btn.' + k).getBoundingClientRect()).map(r => ({ top: Math.round(r.top), w: Math.round(r.width) })));
  check('три режима без интернета — в один ряд', tiles.every(r => r.top === tiles[0].top) && tiles[0].w < 140,
    JSON.stringify(tiles));
  check('на плитках короткие названия', await page.locator('#tModeDuel').textContent() === 'С другом');

  // Задания (спрятаны, DAILY_EXTRAS) — одна строка; по нажатию раскрываются
  check('по умолчанию заданий дня в меню нет', !(await page.locator('#questCard').isVisible()));
  await page.evaluate(() => { DAILY_EXTRAS = true; renderQuestCard(); });
  check('задания свёрнуты: видна строка со счётом', (await page.locator('#qcCount').textContent()) === '1/3' &&
    !(await page.locator('#qcList').isVisible()));
  await page.click('#questCard');
  check('по нажатию — сами задания', await page.locator('#qcList').isVisible() &&
    await page.locator('.qc-row').count() === 3);
  await page.click('#questCard');

  // Друзья и возврат кнопкой «Играть»
  await page.click('#friendsBtn');
  await page.waitForTimeout(300);
  check('вкладка «Друзья» подсвечена на экране друзей',
    await page.locator('#friendsBtn').evaluate(e => e.classList.contains('on')));
  check('«В меню» не дублирует нижнее меню', !(await page.locator('#tFriendsBack').isVisible()));
  await page.click('#navPlay');
  await page.waitForTimeout(200);
  check('«Играть» возвращает на главный', await page.locator('#screenMode').isVisible());

  // Партия: история плитками по три, поле ввода внизу экрана
  await page.click('.mode-btn.solo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  const sec = await page.evaluate(() => secret);
  for (const g of [1, 2, 3, 4].map(n => n === sec ? n + 10 : n)) {
    await page.fill('#guessInput', String(g));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(120);
  }
  const hist = await page.evaluate(() => [...document.querySelectorAll('.history-item')].map(e => {
    const r = e.getBoundingClientRect(); return Math.round(r.top); }));
  const near = (a, b) => Math.abs(a - b) <= 4;   // первая плитка чуть «вплывает» — пара пикселей
  check('история — по три в ряд', hist.length === 4 && near(hist[0], hist[1]) && near(hist[1], hist[2]) && hist[3] > hist[0] + 20,
    JSON.stringify(hist));
  const dock = await page.evaluate(() => {
    const r = document.getElementById('guessSection').getBoundingClientRect();
    return { bottom: Math.round(r.bottom), h: window.innerHeight };
  });
  check('поле ввода прижато к низу экрана', Math.abs(dock.bottom - dock.h) <= 1, JSON.stringify(dock));
  const att = await page.evaluate(() => document.getElementById('attFill').style.width);
  check('полоса попыток показывает остаток', att === '60%', att);
  check('пояс подписан словом', /^разница /.test(await page.locator('#feedbackBand').textContent()),
    await page.locator('#feedbackBand').textContent());
  // Клавиатура: поле поднимается на её высоту
  await page.evaluate(() => document.documentElement.style.setProperty('--kb', '300px'));
  const lifted = await page.evaluate(() => Math.round(window.innerHeight - document.getElementById('guessSection').getBoundingClientRect().bottom));
  check('над клавиатурой поле поднимается', lifted === 300, String(lifted));
  await page.evaluate(() => document.documentElement.style.removeProperty('--kb'));
  await done(page);
}

// Испытание: между раундами — карточка «пройден», что меняется, и «дальше»
async function testRunStage(browser) {
  console.log('\nИспытание: переход между раундами');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeRun');
  await page.waitForTimeout(300);
  await page.click('#tRunStart');
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => ({ round: RUN.round, max: RANGE_MAX, tries: MAX_GUESSES }));
  await page.fill('#guessInput', String(await page.evaluate(() => secret)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(1500);
  const st = await page.evaluate(() => ({
    shown: !document.getElementById('runStage').classList.contains('hidden'),
    text: document.getElementById('runStage').textContent,
    input: !document.getElementById('guessSection').classList.contains('hidden'),
    round: RUN.round }));
  check('после победы раунд сам не переключается — висит карточка', st.shown && st.round === before.round, JSON.stringify(st));
  check('в карточке: какой раунд пройден и сколько очков', /Раунд 1 пройден!/.test(st.text) && /\+\d+ очк/.test(st.text), st.text);
  check('в карточке: что будет дальше — числа и попытки', /Дальше — раунд 2/.test(st.text) && /Числа/.test(st.text) && /Попыток/.test(st.text), st.text);
  check('пока карточка висит, ходить нельзя', !st.input);
  await page.click('#rsSafe');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({ round: RUN.round, stage: !document.getElementById('runStage').classList.contains('hidden'),
    input: !document.getElementById('guessSection').classList.contains('hidden'), locked: RUN.locked }));
  check('«Раунд 2 →» начинает следующий раунд', after.round === 2 && !after.stage && after.input && !after.locked, JSON.stringify(after));

  // Сдался — итог тот же, но причина другая и без «последней догадки»
  await page.click('#tMenu');
  await page.waitForTimeout(200);
  await page.click('#tPauseGiveUp');
  await page.waitForTimeout(500);
  const quit = await page.evaluate(() => document.getElementById('runStage').textContent);
  check('сдался — «Вы сдались в раунде 2», очки по раундам', /Вы сдались в раунде 2/.test(quit) &&
    !/последняя догадка/.test(quit) && /Очки по раундам/.test(quit), quit);
  await page.click('#rgAgain');
  await page.waitForTimeout(400);
  const again = await page.evaluate(() => ({ round: RUN && RUN.round, over: !!(RUN && RUN.over),
    card: !document.getElementById('runStage').classList.contains('hidden'),
    input: !document.getElementById('guessSection').classList.contains('hidden') }));
  check('«Ещё раз» — сразу новое Испытание с первого раунда', again.round === 1 && !again.over && !again.card && again.input,
    JSON.stringify(again));
  await done(page);
}

// Список бонусов: из настройки игры, с описанием каждого, на всех языках
async function testBonusGuide(browser) {
  console.log('\nСписок бонусов и ловушек');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('.mode-btn.duel');
  await page.waitForTimeout(200);
  check('у переключателя бонусов есть «?» — «Что за бонусы?»', await page.locator('#tBonusGuide').isVisible() &&
    (await page.locator('#tBonusGuide').getAttribute('title')).includes('Что за бонусы'));
  for (const lang of ['ru', 'en', 'fr', 'de']) {
    await page.evaluate(l => { currentLang = l; applyTranslations(); }, lang);
    await page.click('#tBonusGuide');
    await page.waitForTimeout(150);
    const g = await page.evaluate(() => ({
      shown: !document.getElementById('bonusGuide').classList.contains('hidden'),
      heads: document.querySelectorAll('#bgList .bg-head').length,
      rows: [...document.querySelectorAll('#bgList .bg-row')].map(r => r.textContent.trim()) }));
    check(lang + ': в списке 13 помощей, 3 ловушки и 3 бонуса только Приключения, у каждой название и описание',
      g.shown && g.heads === 3 && g.rows.length === 19 && g.rows.every(r => r.length > 25 && !/undefined/.test(r)),
      JSON.stringify(g).slice(0, 300));
    await page.click('#bgOk');
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => { currentLang = 'ru'; applyTranslations(); });
  check('«Понятно» закрывает список', !(await page.locator('#bonusGuide').isVisible()));
  await done(page);
}

// Приключение: карта из 50 соперников, особенности, сложность, прогресс,
// иконки боссов
async function testAdventure(browser) {
  console.log('\nПриключение');
  let page = await newGame(browser, { user: 'Максим' });
  check('плитка в меню называется «Приключение»', (await page.locator('#tModeBot').textContent()) === 'Приключение');
  await page.click('.mode-btn.bot');
  await page.waitForTimeout(300);
  const map = await page.evaluate(() => ({
    shown: !document.getElementById('screenAdventure').classList.contains('hidden'),
    worlds: document.querySelectorAll('#advMap .adv-world').length,
    paths: document.querySelectorAll('#advMap .aw-path').length,
    tiles: document.querySelectorAll('#advMap .adv-tile').length,
    next: [...document.querySelectorAll('#advMap .adv-tile.next')].map(e => +e.dataset.n),
    locked: document.querySelectorAll('#advMap .adv-tile.locked').length,
    q: document.querySelectorAll('#advMap .adv-tile .at-q').length,
    bosses: [...document.querySelectorAll('#advMap .adv-tile.boss')].map(e => +e.dataset.n),
    art: [...document.querySelectorAll('#advMap .adv-tile .at-img')].map(e => e.closest('.adv-tile').dataset.n),
    buttons: document.querySelectorAll('#advMap button.adv-tile').length,
    diff: (document.querySelector('#advDiff .ad-btn.on') || {}).dataset.diff }));
  const nWorlds = await page.evaluate(() => ADV_WORLDS.length);
  check('карта — тропа: у каждого мира кружок на каждого из 10 соперников', map.shown && map.worlds === nWorlds && nWorlds >= 15 &&
    map.paths === nWorlds && map.tiles === nWorlds * 10, JSON.stringify(map).slice(0, 300));
  check('открыт только первый, остальные — загадка «?», боссы видны под замком', map.next.join() === '0' &&
    map.locked === nWorlds * 10 - 1 && map.q === nWorlds * 9 - 1 && map.buttons === 1, JSON.stringify(map).slice(0, 300));
  // Тропа снизу вверх: в разметке первым идёт самый дальний мир, мир 1 — последним
  const bossesDown = Array.from({ length: nWorlds }, (_, w) => (nWorlds - 1 - w) * 10 + 9).join();
  // В мире 1 первым в разметке идёт следующий соперник (0), потом его босс (9)
  check('портреты — у следующего соперника и у боссов всех миров; мир 1 — внизу', map.art.length === nWorlds + 1 &&
    map.art.join() === bossesDown.split(',').slice(0, -1).concat(['0', '9']).join(), map.art.join());
  check('десятый в каждом мире — босс', map.bosses.join() === bossesDown, map.bosses.join());
  check('сложность по умолчанию — нормальная', map.diff === 'normal');

  // Будущий соперник и будущий босс не нажимаются: кто там — загадка
  await page.click('.adv-tile[data-n="5"]');
  await page.click('.adv-tile[data-n="19"]');
  await page.waitForTimeout(150);
  check('на будущего соперника и босса нажать нельзя — карточка не открывается',
    await page.evaluate(() => document.getElementById('advCard').classList.contains('hidden')));

  // Первый — карточка и партия
  await page.click('.adv-tile[data-n="0"]');
  await page.waitForTimeout(150);
  const card = await page.evaluate(() => ({ name: document.getElementById('acName').textContent,
    quirk: document.getElementById('acQuirk').textContent, facts: document.getElementById('acFacts').textContent }));
  check('карточка: имя, правило, числа', card.name === 'Ёжик Яблочко' && /Угощает/.test(card.quirk) &&
    /от 1 до 20/.test(card.facts), JSON.stringify(card));
  await page.evaluate(() => { BOT_SPEED = 1000; });
  await page.click('#acGo');
  await page.waitForTimeout(300);
  const game = await page.evaluate(() => ({ adv: vsBot && vsBot.adv && vsBot.adv.n, name: D.names[1], max: RANGE_MAX,
    wins: D.winsNeeded, art: !!document.querySelector('#pname1 .p-bot svg.icon-art') }));
  check('партия с Ёжиком: числа до 20, до одной победы, портрет у плашки',
    game.adv === 0 && game.name === 'Ёжик Яблочко' && game.max === 20 && game.wins === 1 && game.art, JSON.stringify(game));
  await page.evaluate(() => { stopBot(); D.cur = 0; duelPlay(secret); });
  await page.waitForTimeout(300);
  const won = await page.evaluate(() => ({ done: advDone(), server: window.__adventure,
    btn: (document.querySelector('#resultBox .r-actions .btn') || {}).textContent }));
  check('победа: прогресс записан и в телефоне, и в базе', won.done === 1 && won.server === 1, JSON.stringify(won));
  check('после победы — «Дальше: следующий»', won.btn === 'Дальше: Белка Жёлудь →', won.btn);
  const st = await page.evaluate(() => ({ local: advStars(), res: window.__advResults,
    line: (document.querySelector('#resultBox .adv-line') || {}).textContent }));
  check('победа на «Нормально»: две звезды — в телефоне, в базе и в итоге',
    st.local === '2' && JSON.stringify(st.res) === '[[0,2]]' && /\+2/.test(st.line) && /★★☆/.test(st.line), JSON.stringify(st));
  await page.click('#resultBox .r-actions .btn');
  await page.waitForTimeout(300);
  check('«Дальше» — карта и карточка следующего', await page.locator('#screenAdventure').isVisible() &&
    (await page.locator('#acName').textContent()) === 'Белка Жёлудь' && !(await page.locator('#acGo').isDisabled()));
  await page.click('#acBack');

  // Сложность — только «⚡ +1 ход»: соперник один и тот же, меняется, у кого сколько
  await page.click('.ad-btn[data-diff="hard"]');
  check('сложность запоминается', await page.evaluate(() => localStorage.getItem('hc_adv_diff')) === 'hard');
  const lv = await page.evaluate(() => [advLevel(advChar(3), 'easy'), advLevel(advChar(3), 'normal'), advLevel(advChar(3), 'hard')]);
  check('сила соперника от сложности не зависит', lv[0] === lv[1] && lv[1] === lv[2], lv.join(' '));
  const toks = await page.evaluate(() => ['easy', 'normal', 'hard'].map(d => advTokens(advChar(3), d).join(':')));
  check('«⚡ +1 ход»: легко 2:0, нормально 1:1, трудно 0:2', toks.join() === '2:0,1:1,0:2', toks.join());
  const hoard = await page.evaluate(() => { const c = advChar(1); return c.rule + ' ' + ['easy', 'normal', 'hard'].map(d => advTokens(c, d).join(':')).join(','); });
  check('Белка Жёлудь «Запасливая» — на один «+1 ход» больше: 2:1, 1:2, 0:3', hoard === 'acorns 2:1,1:2,0:3', hoard);
  const grow = await page.evaluate(() => [0, 10, 20, 30, 40].map(n => advLevel(advChar(n), 'normal')));
  check('от мира к миру соперники сильнее', grow.every((v, i) => !i || v > grow[i - 1]), grow.join(' '));

  // Особенности: у каждого мира все девять, у босса — две победы
  const quirks = await page.evaluate(() => [0, 1, 2, 3, 4].map(w =>
    new Set(Array.from({ length: 10 }, (_, i) => advChar(w * 10 + i).rule)).size));
  check('в каждом мире у всех десяти — свои правила', quirks.every(n => n === 10), quirks.join());

  // Босс первого мира: до двух побед, за него — иконка 🧙
  await page.evaluate(() => { localStorage.setItem(advKey(), '9'); renderAdventure(); });
  await page.click('.adv-tile[data-n="9"]');
  await page.waitForTimeout(150);
  await page.evaluate(() => { BOT_SPEED = 1000; });
  await page.click('#acGo');
  await page.waitForTimeout(300);
  check('с боссом — до двух побед', await page.evaluate(() => D.winsNeeded === 2));
  await page.evaluate(() => { stopBot(); D.cur = 0; duelPlay(secret); });
  await page.waitForTimeout(200);
  await page.evaluate(() => { nextRound(); stopBot(); D.cur = 0; duelPlay(secret); });
  await page.waitForTimeout(300);
  const boss = await page.evaluate(() => ({ done: advDone(), line: (document.querySelector('#resultBox .adv-line') || {}).textContent }));
  check('мир пройден — сказано, что новая иконка в профиле', boss.done === 10 && /Волшебный лес/.test(boss.line || ''), JSON.stringify(boss));
  await page.evaluate(() => quitToMenu());
  await page.waitForTimeout(200);
  check('выход из партии Приключения — на карту', await page.locator('#screenAdventure').isVisible());
  await page.click('#accountChip');
  await page.waitForTimeout(400);
  await page.click('#pfAvatar');
  await page.waitForTimeout(150);
  const icons = await page.evaluate(() => ['🧙', '🦍'].map(i => {
    const el = document.querySelector('#avGrid .av-tile[data-icon="' + i + '"]');
    return el ? (el.classList.contains('locked') ? 'locked' : 'open') : 'none'; }));
  check('в выборе иконки: 🧙 открыт, 🦍 ещё закрыт', icons.join() === 'open,locked', icons.join());
  await page.click('.av-tile[data-icon="🦍"]');
  await page.waitForTimeout(150);
  check('закрытая иконка босса — где откроется', /Джунгли/.test(await page.locator('#avNote').textContent()));
  await done(page);

  // Переводы: у всех 50 имена, у всех особенностей описания, на всех языках
  page = await newGame(browser);
  const tr = await page.evaluate(() => ['ru', 'en', 'fr', 'de'].map(l => {
    const A = i18n[l].adv;
    const bad = [];
    if (!A || A.names.length !== 50 || A.names.some(n => !n)) bad.push('names');
    if (A.worlds.length !== 5) bad.push('worlds');
    if (!A.cast || A.cast.length !== 50) bad.push('cast');
    if (!A.bossTitle || !A.bossNote || !A.kw || !A.kw.gt) bad.push('boss/kw');
    return l + ':' + (bad.join(',') || 'ok');
  }));
  check('Приключение переведено на 4 языка', tr.every(x => /:ok$/.test(x)), tr.join(' '));
  // На узком телефоне и на немецком карта и карточка не вылезают за экран
  await page.setViewportSize({ width: 360, height: 740 });
  await page.evaluate(() => { currentLang = 'de'; applyTranslations(); openAdventure(); openAdvCard(0); });
  await page.waitForTimeout(300);
  const fit = await page.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth,
    card: document.querySelector('.adv-card').getBoundingClientRect().right <= innerWidth }));
  check('360px, немецкий: без горизонтальной прокрутки', fit.over <= 0 && fit.card, JSON.stringify(fit));
  await done(page);
}

// Приключение: бонус мира, ловушки у босса, новые бонусы, звёзды по сложности
async function testAdventureBonus(browser) {
  console.log('\nПриключение: бонусы и звёзды');
  const page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(() => { localStorage.setItem('hc_adv_максим', '50'); BOT_SPEED = 1000; });
  const worlds = await page.evaluate(() => [0, 10, 20, 30, 40].map(n => {
    startAdventure(n); stopBot();
    const kinds = D.bonuses.map(b => b.type);
    const r = { n, bonus: bonusMode, first: advChar(n).world.bonus, has: kinds.includes(advChar(n).world.bonus),
                traps: kinds.filter(k => BONUS_TRAP.includes(k)).length, setTraps: bonusSet.trap.length };
    quitToMenu();
    return r;
  }));
  check('в каждом мире бонусы включены и бонус мира на поле',
    worlds.every(w => w.bonus && w.has), JSON.stringify(worlds));
  check('бонусы миров: щит, половина, рентген, лава, заморозка',
    worlds.map(w => w.first).join() === 'shield,half,xray,lava,freeze', worlds.map(w => w.first).join());
  check('у обычных соперников ловушек нет', worlds.every(w => w.setTraps === 0 && w.traps === 0), JSON.stringify(worlds));
  const boss = await page.evaluate(() => {
    startAdventure(9); stopBot();
    const r = { traps: bonusSet.trap.length, wins: D.winsNeeded };
    quitToMenu();
    return r;
  });
  check('босс играет с ловушками', boss.traps === 3 && boss.wins === 2, JSON.stringify(boss));
  const magic = await page.evaluate(() => {
    const n = [...Array(50).keys()].find(i => advChar(i).rule === 'octopus');
    startAdventure(n); stopBot();
    const r = { n, count: D.bonuses.length, auto: autoBonusCountFor(rangeCount()), traps: bonusSet.trap.length };
    quitToMenu();
    return r;
  });
  check('у Осьминога Жонглёра бонусов вдвое больше и есть ловушки', magic.count === 2 * magic.auto && magic.traps === 3, JSON.stringify(magic));
  // Соперник «Первый ход» ходит сам, без нажатий игрока: раньше его ход не
  // назначался, потому что партия рисовалась до открытия доски
  const firstMove = await page.evaluate(async () => {
    const n = [...Array(50).keys()].find(i => advChar(i).rule === 'penguin');
    BOT_SPEED = 0.05;
    startAdventure(n);
    const planned = !!botTimer;
    const t0 = Date.now();
    while (history.length === 0 && Date.now() - t0 < 3000) await new Promise(r => setTimeout(r, 20));
    const r = { planned, moved: history.length === 1 && history[0].p === 1, cur: D.cur };
    quitToMenu();
    BOT_SPEED = 1000;
    return r;
  });
  check('первым ходит соперник — он ходит сам, ход передаётся игроку', firstMove.planned && firstMove.moved && firstMove.cur === 0,
    JSON.stringify(firstMove));
  const after = await page.evaluate(() => ({ set: bonusSet, adv: !!adv }));
  check('после Приключения обычный набор бонусов вернулся', after.set === null && !after.adv, JSON.stringify(after));

  // Новые бонусы на настоящей доске
  const eff = await page.evaluate(() => {
    startAdventure(20); stopBot();
    D.cur = 0;
    const out = {};
    applyBonus('xray', 0);
    out.xray = D.know[0].parity === Math.abs(secret) % 2;
    applyBonus('half', 0);
    out.half = D.know[0].half === (secret <= halfMark() ? 'low' : 'high');
    renderAll();
    out.chip = document.getElementById('peff0').textContent;
    out.rivalChip = document.getElementById('peff1').textContent;
    // Бот тоже пользуется знанием: все его возможные числа той же чётности
    D.know[1] = { parity: Math.abs(secret) % 2 };
    const cand = botCandidates([], 1, { know: D.know[1] }, false);
    out.botParity = [...cand].every((c, i) => !c || Math.abs(i + RANGE_MIN) % 2 === D.know[1].parity);
    // Щит отбивает ловушку
    applyBonus('shield', 0);
    const v = secret === RANGE_MIN ? RANGE_MIN + 1 : RANGE_MIN;
    D.bonuses = [{ value: v, type: 'skip', taken: false }];
    duelPlay(v);
    out.shield = !D.skip[0] && D.lastBonus === 'shieldUsed' && !D.shield[0];
    out.line = document.getElementById('bonusLine').textContent;
    // Заморозка — соперник пропускает ход
    D.cur = 0;
    applyBonus('freeze', 0);
    out.freeze = D.skip[1] && D.frozen[1];
    D.cur = 1;
    renderAll();
    out.frozenFlag = document.getElementById('peff1').textContent.includes('🧊');
    quitToMenu();
    return out;
  });
  check('рентген: чётность загаданного', eff.xray, JSON.stringify(eff));
  check('половина: в какой половине прямой', eff.half, JSON.stringify(eff));
  check('знание видно у своего имени словами, у соперника — нет', /чётное|нечётное/.test(eff.chip) && /больше/.test(eff.chip) &&
    !/чётное/.test(eff.rivalChip), eff.chip + ' / ' + eff.rivalChip);
  check('бот с рентгеном ищет только среди чисел нужной чётности', eff.botParity);
  check('щит отбил ловушку — и об этом сказано', eff.shield && /щит отбил ловушку «Пропуск хода»/.test(eff.line), eff.line);
  check('заморозка: соперник пропускает ход, у него значок 🧊', eff.freeze && eff.frozenFlag, JSON.stringify(eff));

  // Лава в Огненных горах: соперник бросает в лаву
  const lava = await page.evaluate(() => {
    startAdventure(30); stopBot();
    const r = { has: D.bonuses.some(b => b.type === 'lava') };
    applyBonus('lava', 1);
    D.cur = 0;
    renderAll();
    r.forced = forcedTurn();
    r.btn = document.getElementById('forcedBtn').textContent;
    quitToMenu();
    return r;
  });
  check('в Огненных горах лава: ход в лаву у игрока', lava.has && lava.forced === 'lava' && lava.btn === 'Бросить', JSON.stringify(lava));

  // Звёзды по сложности и лучший результат
  const stars = await page.evaluate(async () => {
    localStorage.setItem('hc_adv_максим', '3');
    localStorage.removeItem('hc_advs_максим');
    window.__adventure = 3;
    window.__advStars = '';
    advFillStars();
    const before = advStars();
    const won = async (n, diff) => {
      setAdvDiff(diff);
      startAdventure(n); stopBot();
      D.cur = 0; duelPlay(secret);
      const line = (document.querySelector('#resultBox .adv-line') || {}).textContent;
      const again = [...document.querySelectorAll('#resultBox .r-actions button')].map(b => b.textContent);
      quitToMenu();
      return { line, again, stars: advStars() };
    };
    const a = await won(3, 'easy');
    const b = await won(3, 'hard');
    const c = await won(3, 'normal');
    openAdventure();
    const tile = document.querySelector('#advMap .adv-tile[data-n="3"] .at-stars').textContent;
    const total = document.getElementById('advStarsTotal').textContent;
    const world = document.querySelector('#advMap .adv-world .aw-stars').textContent;
    openAdvCard(3);
    const best = document.querySelector('#acFacts .ac-best').textContent;
    closeAdvCard();
    return { before, a, b, c, tile, total, world, best };
  });
  check('пройденным раньше — по звезде', stars.before === '111', stars.before);
  check('легко — ★, и подсказка «Больше звёзд — на «Нормально»»', stars.a.stars === '1111' && /Больше звёзд — на «Нормально»/.test(stars.a.line),
    JSON.stringify(stars.a));
  check('не все звёзды — в итоге есть «Ещё раз»', stars.a.again.includes('Ещё раз'), stars.a.again.join());
  check('трудно — ★★★, +2', stars.b.stars === '1113' && /\+2/.test(stars.b.line) && !stars.b.again.includes('Ещё раз'),
    JSON.stringify(stars.b));
  check('хуже лучшего — звёзды не убавились', stars.c.stars === '1113' && /Лучший результат/.test(stars.c.line), JSON.stringify(stars.c));
  check('на карте: у соперника ★★★, в мире и всего — 6', stars.tile === '★★★' && /⭐ 6/.test(stars.total) && /⭐ 6\/30/.test(stars.world),
    JSON.stringify(stars));
  check('в карточке — лучший результат', /★★★/.test(stars.best), stars.best);
  const diffBtns = await page.evaluate(() => [...document.querySelectorAll('#advDiff .ad-btn')].map(b => b.textContent));
  check('у кнопок сложности — сколько звёзд', diffBtns.join() === 'Легко★,Нормально★★,Трудно★★★', diffBtns.join());

  // База: звёзды уходят и сливаются
  const sync = await page.evaluate(async () => {
    window.__advStars = '0003000003';
    await advSync();
    return { local: advStars(), server: window.__advStars };
  });
  check('синхронизация: на каждом месте лучшее из телефона и базы', sync.local === '1113000003' && sync.server === '1113000003',
    JSON.stringify(sync));

  // Иконки соперников: мир на ★★★ — все десять в кружок
  const icons = await page.evaluate(() => {
    localStorage.setItem('hc_advs_максим', '3333333333' + '3333332111');
    progressInfo = Object.assign({ quests: [], achievements: [] }, progressInfo || {}, { stats: { advGold: 1 } });
    openAdventure();
    // Цели миров — от мира 1: тропа снизу вверх, в разметке он последний
    const goals = [...document.querySelectorAll('#advMap .aw-goal')].map(e => e.textContent).reverse();
    openLogoutModal(); showAvatarPicker(true); renderAvatarGrid();
    const tiles = [...document.querySelectorAll('#avGrid .av-tile.adv-icon')];
    const r = { goals, n: tiles.length, open: tiles.filter(x => !x.classList.contains('locked')).map(x => x.dataset.icon),
                head: (document.querySelector('#avGrid .av-head') || {}).textContent };
    chooseAvatar('adv-15');
    r.note = document.getElementById('avNote').textContent;
    r.pf = document.getElementById('pfAdv').textContent;
    closeLogoutModal();
    return r;
  });
  // Портреты боссов с шестого мира — иконки за боссов: среди соперников их нет
  const nChar = await page.evaluate(() => ADV_TOTAL - (ADV_WORLDS.length - 5));
  check('в выборе — все иконки соперников, открыт только мир на ★★★', icons.n === nChar && icons.open.length === 10 &&
    icons.open[0] === 'adv-01' && icons.open[9] === 'adv-10' && icons.head.includes('10 из ' + nChar), JSON.stringify(icons).slice(0, 300));
  check('закрытая иконка говорит, что нужно', /Джунгли/.test(icons.note) && /6 из 10/.test(icons.note), icons.note);
  check('на карте — цель мира: открыто или сколько из 10', /в профиле/.test(icons.goals[0]) && /6\/10/.test(icons.goals[1]), icons.goals.join(' | '));
  check('в профиле — счётчик иконок', icons.pf.includes('иконок 10 из ' + nChar), icons.pf);

  // Профиль и друзья
  const pf = await page.evaluate(async () => {
    window.__friendAdv = { done: 12, stars: '2', total: 21 };
    await openFriendAch('Кира');
    const friend = document.getElementById('achAdv').textContent;
    closeFriendAch();
    return { friend };
  });
  const nW2 = await page.evaluate(() => ADV_WORLDS.length);
  check('у друга видны звёзды и миры Приключения', pf.friend === '🗺️ Приключение: ⭐ 21 из ' + nW2 * 30 + ' · миров 1 из ' + nW2, pf.friend);

  // Переводы
  for (const lang of ['en', 'fr', 'de']) {
    const tx = await page.evaluate(l => {
      currentLang = l; applyTranslations();
      const T = t();
      return BONUS_ADV.concat(BONUS_BOSS).every(k => T.bonusNames[k] && T.tut.bcDesc[k] && (k === 'lava' || T.bonusDesc[k])) &&
        ['mirrorUsed', 'shieldRule', 'mirrorRule'].every(k => T.bonusNames[k] && /\{a\}/.test(T.bonusDesc[k]) && /\{t\}/.test(T.bonusDesc[k])) &&
        ['div3', 'notDiv3', 'div5', 'notDiv5', 'tens', 'units', 'gt', 'lt'].every(k => T.bonusKnow[k]) &&
        ['storm', 'traps', 'first'].every(k => (T.adv.worldRules[k] || []).length === 3) && T.adv.ruleLabel && /\{b\}/.test(T.adv.bossBonus) &&
        T.forced.freeze && T.bonusKnow.even && T.adv.winStars && T.adv.pfLine && T.prog.q.adv_win2 &&
        T.prog.q.adv_stars3 && T.prog.lad.advStars.forms && T.prog.lad.advWorlds.forms && T.online.rematchAsk;
    }, lang);
    check(lang + ': бонусы, звёзды, задания и реванш переведены', !!tx);
  }
  await page.evaluate(() => { currentLang = 'ru'; applyTranslations(); });
  await page.context().close();
}

// Часть 1 переработки: шальной бросок, вспышка и звук бонуса, метки на
// прямой, уроки-приёмы, «где может быть число», разбор и прогресс тренировки
async function testTrainBonusFx(browser) {
  console.log('\nТренировка и бонусы: вспышка, метки, уроки, прогресс');
  const page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(() => {
    localStorage.setItem('hc_seen_bonus', JSON.stringify(['extra', 'fog', 'blind', 'rush', 'lava', 'skip', 'gift', 'memory', 'near', 'half', 'shield', 'freeze', 'xray']));
    localStorage.setItem('hc_adv_максим', '50');
  });
  const names = await page.evaluate(() => ['ru', 'en', 'fr', 'de'].map(l => i18n[l].bonusNames.lava));
  check('«Бросок в лаву» переименован на 4 языках', names.join() === 'Шальной бросок,Wild throw,Lancer fou,Wilder Wurf', names.join());
  const fx = await page.evaluate(() => {
    const tones = [];
    const orig = playTone;
    window.playTone = (...a) => { tones.push(a[0]); };
    startAdventure(41); stopBot(); D.cur = 0;
    const v = secret === RANGE_MIN ? RANGE_MIN + 1 : RANGE_MIN;
    D.bonuses = [{ value: v, type: 'freeze', taken: false }];
    duelPlay(v);
    const box = document.getElementById('bonusFlash');
    const r = { show: box.classList.contains('show'), cls: box.className, name: document.getElementById('bfName').textContent,
                tones: tones.length, mark: !!document.querySelector('#numLineSvg .nl-bonus') };
    window.playTone = orig;
    quitToMenu();
    return r;
  });
  check('бонус сработал — крупная вспышка с эффектом и названием', fx.show && /k-freeze/.test(fx.cls) && fx.name === 'Заморозка', JSON.stringify(fx));
  check('у бонуса свой звук', fx.tones >= 2, String(fx.tones));
  check('у только что сделанного хода метки нет — о бонусе говорит строка', !fx.mark);
  const first = await page.evaluate(() => {
    localStorage.setItem('hc_seen_bonus', '[]');
    startAdventure(41); stopBot(); D.cur = 0;
    const v = secret === RANGE_MIN ? RANGE_MIN + 1 : RANGE_MIN;
    D.bonuses = [{ value: v, type: 'freeze', taken: false }];
    document.getElementById('bonusFlash').classList.remove('show');
    duelPlay(v);
    const r = { flash: document.getElementById('bonusFlash').classList.contains('show'),
                card: !document.getElementById('bonusCard').classList.contains('hidden') };
    closeBonusCard(); quitToMenu();
    return r;
  });
  check('впервые — вместо вспышки карточка с объяснением', !first.flash && first.card, JSON.stringify(first));
  // Метка бонуса на прямой не выдаёт закрытый ход: соперник наступил на
  // туман — его ход скрыт, и метки нет; у видимого хода метка — рисунком
  const marks = await page.evaluate(() => {
    localStorage.setItem('hc_seen_bonus', JSON.stringify(['extra', 'fog', 'blind', 'rush', 'lava', 'skip', 'gift', 'memory', 'near', 'half', 'shield', 'freeze', 'xray']));
    startAdventure(31); stopBot(); D.cur = 1;
    const v = secret === RANGE_MAX ? RANGE_MAX - 1 : RANGE_MAX;
    D.bonuses = [{ value: v, type: 'fog', taken: false }];
    duelPlay(v); D.cur = 0;
    duelPlay(secret === RANGE_MIN ? RANGE_MIN + 1 : RANGE_MIN); D.cur = 0; renderAll();
    const hidden = document.querySelectorAll('#numLineSvg .nl-bonus').length;
    quitToMenu(); startAdventure(31); stopBot(); D.cur = 0;
    const w = secret === 100 ? 101 : 100;
    D.bonuses = [{ value: w, type: 'blind', taken: false }];
    duelPlay(w); D.cur = 0; duelPlay(secret === 150 ? 151 : 150); D.cur = 0; renderAll();
    const shown = document.querySelector('#numLineSvg .nl-bonus image');
    const r = { hidden, art: shown ? shown.getAttribute('href') : null, line: document.getElementById('bonusLine').innerHTML };
    D.lastBonus = 'memory'; renderAll();
    r.icon = !!document.querySelector('#bonusLine .b-name [style*="b-memory"]');
    quitToMenu();
    return r;
  });
  check('ход соперника под туманом — без метки на прямой', marks.hidden === 0, JSON.stringify(marks));
  check('метка у видимого хода — рисунком бонуса', marks.art === 'icons/b-blind.webp', JSON.stringify(marks));
  check('в строке бонуса — его собственный значок, а не общий 🎁', marks.icon, marks.line);
  const tok = await page.evaluate(() => { startAdventure(0); stopBot(); D.cur = 0; useToken(0);
    const r = document.getElementById('ptoken0').textContent; quitToMenu(); return r; });
  check('взведённый жетон — коротко «⚡ Активен», без переноса', tok === '⚡ Активен', tok);

  // Тренировка: панель на настройке
  await page.evaluate(() => openSetup('solo'));
  await page.waitForTimeout(300);
  const panel = await page.evaluate(() => ({ shown: !document.getElementById('trainPanel').classList.contains('hidden'),
    drills: document.querySelectorAll('#trainDrills .drill-chip').length, goal: document.getElementById('trainGoal').textContent }));
  check('в настройке тренировки — 4 урока и цель', panel.shown && panel.drills === 4 && /Цель/.test(panel.goal), JSON.stringify(panel));
  await page.click('#trainDrills .drill-chip[data-drill="bands"]');
  await page.waitForTimeout(200);
  const card = await page.evaluate(() => document.getElementById('drWhy').textContent);
  check('урок объясняет, почему приём работает', /не говорит, в какую сторону/.test(card), card.slice(0, 80));
  await page.click('#drGo');
  await page.waitForTimeout(300);
  const coach = await page.evaluate(() => {
    const before = document.getElementById('drillCoach').textContent;
    const g = secret <= 10 ? 15 : 5;
    document.getElementById('guessInput').value = g; handleGuess();
    return { before, after: document.getElementById('drillCoach').textContent, max: RANGE_MAX };
  });
  check('урок «Расстояние»: 1–20 и подсказка учителя после хода', coach.max === 20 && /Назовите любое/.test(coach.before) &&
    /разница/.test(coach.after), JSON.stringify(coach));
  const win = await page.evaluate(() => { document.getElementById('guessInput').value = secret; handleGuess();
    return { done: JSON.parse(localStorage.getItem('hc_drills') || '[]'), log: JSON.parse(localStorage.getItem('hc_train_log') || '[]').length }; });
  check('победа в уроке — урок отмечен пройденным, игра в журнале', win.done.includes('bands') && win.log === 1, JSON.stringify(win));
  const rv = await page.evaluate(() => { openReview(); const r = { strong: document.getElementById('rvStrong').textContent,
    left: [...document.querySelectorAll('#rvList .rv-left')].map(e => e.textContent) }; closeReview(); return r; });
  check('разбор: сколько хватило бы лучшими ходами и «было → осталось»', /Лучшими ходами — за/.test(rv.strong) && rv.left.length >= 1 &&
    /было \d+ → осталось \d+/.test(rv.left[0]), JSON.stringify(rv));
  // «Где может быть число» в обычной тренировке
  const known = await page.evaluate(() => {
    quitToMenu(); openSetup('solo'); startFromSetup();
    knownOn = false; toggleKnown();
    const g = secret === 50 ? 51 : 50;
    document.getElementById('guessInput').value = g; handleGuess();
    const r = { line: document.getElementById('knownLine').textContent, rects: document.querySelectorAll('#numLineSvg .nl-known').length,
                btn: !document.getElementById('toggleKnownBtn').classList.contains('hidden') };
    toggleKnown();
    return r;
  });
  check('«Где может быть число»: строка и отрезки на прямой', /Ещё возможно/.test(known.line) && known.rects >= 1 && known.btn, JSON.stringify(known));
  const duelKnown = await page.evaluate(() => { quitToMenu(); startAdventure(0); stopBot(); renderAll();
    const r = document.getElementById('toggleKnownBtn').classList.contains('hidden'); quitToMenu(); return r; });
  check('в игре против соперника «где может быть» нет', duelKnown);
  for (const lang of ['en', 'fr', 'de']) {
    const ok = await page.evaluate(l => { const T = i18n[l].train;
      return ['bands', 'best', 'two', 'minus'].every(k => T.drills[k].title && T.drills[k].why && T.drills[k].first) &&
        T.goal && T.strong && T.left && T.distOne; }, lang);
    check(lang + ': уроки и прогресс переведены', ok);
  }
  await page.context().close();
}

// Испытание в телефоне: сюрпризы, двери, запасная жизнь, Испытание дня, медали
async function testTrialSurprises(browser) {
  console.log('\nИспытание: сюрпризы, Испытание дня, медали');
  const page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(() => openRunEntry());
  await page.waitForTimeout(200);
  const mods = await page.evaluate(() => {
    startRun(true);
    const out = {};
    trialDeal(5, 'warmer', null);
    const max = RANGE_MAX, tries = MAX_GUESSES;
    const g1 = secret === RANGE_MIN ? RANGE_MIN + 1 : RANGE_MIN;
    document.getElementById('guessInput').value = g1; handleGuess();
    const g2 = secret === RANGE_MAX ? RANGE_MAX - 1 : RANGE_MAX;
    document.getElementById('guessInput').value = g2; handleGuess();
    out.warmer = { max, tries, first: history[0].meta.custom, second: history[1].meta.custom,
      label: document.getElementById('feedbackLabel').textContent, thermo: document.getElementById('thermoWrap').classList.contains('hidden'),
      strip: document.getElementById('scaleStrip').classList.contains('hidden') };
    trialDeal(5, 'frost', null);
    out.frost = { min: RANGE_MIN, max: RANGE_MAX };
    trialDeal(5, 'fog', null);
    [1, 2, 3, 4].forEach(k => { const g = RANGE_MIN + k; if (g !== secret) { document.getElementById('guessInput').value = g; handleGuess(); } });
    renderAll();
    out.fog = { cards: document.querySelectorAll('#historyList .h-card, #historyList > *').length, extra: MAX_GUESSES - runAttemptsForRound(5, rangeCount()) };
    trialDeal(5, 'timed', null);
    renderAll();
    out.timed = { deadline: !!RUN.deadline, banner: document.getElementById('runMod').textContent, extra: MAX_GUESSES - runAttemptsForRound(5, rangeCount()) };
    trialDeal(5, 'gift', null);
    out.gift = { mult: RUN.mult, max: RANGE_MAX, base: runRangeForRound(5) };
    return out;
  });
  check('«теплее / холоднее»: первый ход — без сравнения, дальше — теплее или холоднее',
    mods.warmer.first === 'first' && ['warmer', 'colder', 'same'].includes(mods.warmer.second) &&
    /Теплее|Холоднее|Так же/.test(mods.warmer.label), JSON.stringify(mods.warmer));
  check('«теплее / холоднее»: до 100 и попыток с запасом, градусника и шкалы нет',
    mods.warmer.max <= 100 && mods.warmer.tries === Math.ceil(Math.log2(mods.warmer.max)) + 3 && mods.warmer.thermo && mods.warmer.strip,
    JSON.stringify(mods.warmer));
  check('мороз: отрицательные числа', mods.frost.min < 0 && mods.frost.max === -mods.frost.min, JSON.stringify(mods.frost));
  check('туман: +1 попытка', mods.fog.extra === 1, JSON.stringify(mods.fog));
  check('на время: часы и +1 попытка, сказано в полоске', mods.timed.deadline && mods.timed.extra === 1 && /На время/.test(mods.timed.banner),
    JSON.stringify(mods.timed));
  check('подарок: диапазон поменьше и очки ×2', mods.gift.mult === 2 && mods.gift.max < mods.gift.base, JSON.stringify(mods.gift));
  const timeout = await page.evaluate(async () => {
    trialDeal(3, 'timed', null);
    RUN.lives = 1;
    RUN.deadline = Date.now() - 1;
    await new Promise(r => setTimeout(r, 500));
    const afterLife = { round: RUN.round, lives: RUN.lives, over: !!RUN.over, banner: document.getElementById('runMod').textContent };
    RUN.deadline = Date.now() - 1;
    await new Promise(r => setTimeout(r, 500));
    return { afterLife, over: !!RUN.over, why: RUN.over && RUN.over.why, text: document.getElementById('runStage').textContent };
  });
  check('кончилось время — запасная жизнь даёт раунд заново', timeout.afterLife.round === 3 && timeout.afterLife.lives === 0 &&
    !timeout.afterLife.over && /Запасная жизнь спасла/.test(timeout.afterLife.banner), JSON.stringify(timeout.afterLife));
  check('без жизни — конец, «кончилось время»', timeout.over && timeout.why === 'time' && /кончилось время/.test(timeout.text), timeout.text.slice(0, 120));

  // Испытание дня: одно правило на день и одни и те же числа
  const daily = await page.evaluate(() => {
    leaveRun();
    startRun(true, true);
    const a = { secret, mod: RUN.dailyMod };
    leaveRun();
    startRun(true, true);
    const b = { secret };
    document.getElementById('guessInput').value = secret; handleGuess();
    const nextMod = RUN.stage.nextMod;
    giveUpRun();
    return { a, b, nextMod, st: trialStats() };
  });
  check('Испытание дня: числа одинаковые у всех и при повторе', daily.a.secret === daily.b.secret, JSON.stringify(daily));
  check('Испытание дня: правило дня во всех раундах', daily.nextMod === daily.a.mod, JSON.stringify(daily));
  check('Испытание дня: результат дня записан отдельно', Object.values(daily.st.daily).includes(1) && daily.st.bestRounds !== 1, JSON.stringify(daily.st));
  const medals = await page.evaluate(() => {
    const st = trialStats(); st.bestRounds = 11; trialSaveStats(st);
    openRunHub();
    return [...document.querySelectorAll('#trialBest .tr-medal')].map(m => m.classList.contains('got'));
  });
  check('медали: за 11 раундов — бронза и серебро, золото — нет', medals.join() === 'true,true,false', medals.join());
  const over = await page.evaluate(() => {
    startRun(true);
    RUN.round = 11; RUN.totalScore = 5000;
    finishRun({}, true);
    return document.getElementById('runStage').textContent;
  });
  check('в итоге — медаль за раунды', /Медаль: серебро/.test(over), over.slice(0, 200));
  for (const lang of ['en', 'fr', 'de']) {
    const ok = await page.evaluate(l => { const T = i18n[l].trial;
      return TRIAL_MODS.concat(['gift']).every(k => T.mods[k] && T.mods[k][0] && T.mods[k][1]) &&
        TRIAL_REWARDS.every(k => T.rewards[k]) && T.rules.length === 5 && T.rel.warmer && T.dailyTitle && T.medals.gold; }, lang);
    check(lang + ': Испытание переведено', ok);
  }
  await page.context().close();
}

// Карточка дня в главном меню (миграции 053 и 062): сундук, серия, путь и
// «Испытание выходных». Сундук открывает любая игра — и без интернета тоже
async function testDailyCard(browser) {
  console.log('\nКарточка дня: сундук, путь, «Испытание выходных»');
  const page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(async () => {
    window.__online = { day: '2026-10-30', played: false, chestOpened: false, chest: null, streak: 2, bestStreak: 2, freezeLeft: true,
      season: '2026-10', xp: 250, levelXp: 100, maxLevel: 30, seasonLeft: 86400 * 5, playXp: 0, playXpCap: 150,
      rewards: [{ level: 3, kind: 'phrase', code: 'lava' }, { level: 12, kind: 'frame', code: 'fire' }, { level: 9, kind: 'title', code: 'hunter' }],
      streakRewards: [{ days: 3, kind: 'phrase', code: 'streak' }, { days: 7, kind: 'title', code: 'regular' }, { days: 30, kind: 'frame', code: 'streak' }],
      owned: [], frame: null, title: null,
      weekend: { on: false, points: 0, claim3: null, claim5: null, frame: 'cup-11', startsIn: 3 * 86400 + 600, endsIn: 0 } };
    tutSave({ done: [1, 2, 3], skipped: true, veteran: true });
    await loadOnlineInfo();
    showScreen('mode');
  });
  await page.waitForTimeout(200);
  const card = await page.evaluate(() => ({ inMenu: !!document.querySelector('#screenMode #olDaily:not(.hidden)'),
    text: document.getElementById('olDaily').textContent, off: document.getElementById('odCup').classList.contains('off'),
    chest: !!document.querySelector('#olDaily .od-chest, #olDaily .od-streak'), lvl: document.querySelector('#olDaily .od-lvl').textContent,
    online: !!document.querySelector('.mode-btn.online, #screenOnline') }));
  check('карточка дня — в главном меню, онлайна со случайными соперниками нет', card.inMenu && !card.online, JSON.stringify(card));
  // Сундук дня и серия дней спрятаны (DAILY_EXTRAS): в карточке — путь и выходные
  check('сундука и серии дней в карточке нет — спрятаны', !card.chest && !/сундук|🔥/i.test(card.text), card.text);
  check('ступень пути и очки до следующей', card.lvl === '2/30' && /50\/100/.test(card.text), card.text);
  check('в будни «Испытание выходных» — одной строкой: когда начнётся', card.off && /Испытание выходных/.test(card.text) &&
    /через 3 дня/.test(card.text), card.text);

  // Тренировка без интернета — тоже игра: база отмечает день и даёт очки пути
  await page.evaluate(() => openSetup('solo'));
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  const s1 = await page.evaluate(() => secret);
  await page.fill('#guessInput', String(s1));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({ sent: (window.__localDone || []).join(), played: window.__online.played }));
  check('конец Тренировки — в базу («solo»), день отмечен', after.sent === 'solo' && after.played, JSON.stringify(after));
  await page.evaluate(() => quitToMenu());
  await page.waitForTimeout(200);
  check('кнопки сундука и после игры нет — он спрятан', (await page.locator('#odChest').count()) === 0);
  // Путь: правила без сундука и заданий, серии дней в окне нет
  await page.evaluate(() => openPassModal());
  await page.waitForTimeout(200);
  const passRead = () => page.evaluate(() => ({ rows: [...document.querySelectorAll('#passList .pl-row')].map(r => r.dataset.level + (r.classList.contains('got') ? '+' : '-')),
    sub: document.getElementById('passSub').textContent, how: document.getElementById('passHow').textContent,
    streak: document.getElementById('passStreak').textContent, streakHidden: document.getElementById('passStreak').classList.contains('hidden') }));
  let pass = await passRead();
  check('путь: награды по ступеням, полученные отмечены', pass.rows.join() === '2+,3-,9-,12-' && /Ступень 2 из 30/.test(pass.sub), JSON.stringify(pass));
  check('путь: очки за любую игру, до 150 в день; ни сундука дня, ни заданий, ни серии', /любую игру/.test(pass.how) && /150/.test(pass.how) &&
    !/сундук —|задани|онлайн/i.test(pass.how) && pass.streakHidden && !pass.streak, pass.how + ' | ' + pass.streak);
  await page.evaluate(() => closePassModal());

  // Когда вернём (DAILY_EXTRAS = true): сундук после игры и серия в окне пути работают
  await page.evaluate(async () => { DAILY_EXTRAS = true; await loadOnlineInfo(); });
  check('с переключателем — кнопка «Открыть сундук» в меню', await page.locator('#odChest').isVisible());
  await page.evaluate(() => { window.__chestSurprise = { kind: 'phrase', code: 'genius' }; openChest(); });
  await page.waitForTimeout(500);
  const chest = await page.evaluate(() => ({ shown: !document.getElementById('chestModal').classList.contains('hidden'),
    text: document.getElementById('chestBody').textContent, card: document.getElementById('olDaily').textContent }));
  check('сундук: очки, серия и сюрприз', chest.shown && /\+30/.test(chest.text) && /Серия: 3/.test(chest.text) &&
    /Сюрприз/.test(chest.text) && /Гениально/.test(chest.text), chest.text);
  check('после — «Сундук открыт · завтра новый»', /Сундук открыт/.test(chest.card), chest.card);
  await page.evaluate(() => closeChest());
  const say = await page.evaluate(() => sayCodesFor());
  check('фраза из сундука — в наборе фраз чата', say.includes('genius') && !say.includes('lava'), say.join());
  await page.evaluate(() => openPassModal());
  await page.waitForTimeout(200);
  pass = await passRead();
  check('с переключателем в окне пути — серия дней, правила с сундуком и заданиями', !pass.streakHidden &&
    /Серия дней с игрой/.test(pass.streak) && /любая игра/.test(pass.how) && /задание дня/.test(pass.how), pass.how + ' | ' + pass.streak);
  await page.evaluate(async () => { closePassModal(); DAILY_EXTRAS = false; await loadOnlineInfo(); });

  // Рамки: «Обычная» — первой; из лиг — только полученные, с названием лиги
  await page.evaluate(async () => {
    window.__online.owned.push({ kind: 'frame', code: 'fire' }, { kind: 'title', code: 'hunter' }, { kind: 'frame', code: 'silver' });
    await loadOnlineInfo(); openLogoutModal();
  });
  await page.waitForTimeout(400);
  const frames = await page.evaluate(() => [...document.querySelectorAll('#pfFrames .st-frame')]
    .map(b => b.querySelector('[data-frame]').dataset.frame + ':' + b.textContent));
  check('рамки: «Обычная» первой, из лиг — только полученное «Серебро»', frames[0] === 'base:Обычная' &&
    frames.includes('silver:Серебро') && !frames.some(f => /^(bronze|gold|platinum|diamond|legend):/.test(f)), frames.join(' | '));
  // Награды серии дней, пока она спрятана, получить нельзя — в выборе их нет
  const titles = await page.evaluate(() => [...document.querySelectorAll('#pfTitles .st-title')].map(b => b.textContent));
  check('награды серии дней (рамка «Неудержимый», титул «Завсегдатай») — не видны, пока серия спрятана',
    !frames.some(f => /^streak:/.test(f)) && !titles.includes('Завсегдатай') && titles.includes('Охотник за числами'), frames.join() + ' / ' + titles.join());
  await page.evaluate(() => chooseStyle('frame', 'ice'));
  const lockedNote = await page.evaluate(() => document.getElementById('styleNote').textContent);
  check('чужая рамка — сказано, где взять', /ступень|серия|сундук/.test(lockedNote), lockedNote);
  await page.evaluate(async () => { await chooseStyle('frame', 'silver'); await chooseStyle('title', 'hunter'); });
  await page.waitForTimeout(200);
  const pf = await page.evaluate(() => ({ frame: document.getElementById('pfAvatar').dataset.frame, title: document.getElementById('pfTitle').textContent,
    sent: window.__online.frame + '/' + window.__online.title }));
  check('надел рамку лиги «Серебро» и титул — видно в профиле и ушло в базу', pf.frame === 'silver' && pf.title === 'Охотник за числами' &&
    pf.sent === 'silver/hunter', JSON.stringify(pf));
  await page.evaluate(async () => { await chooseStyle('frame', null); closeLogoutModal(); });
  check('сняв рамку, кружок — с обычной', await page.evaluate(() => document.getElementById('pfAvatar').dataset.frame) === 'base');

  // «Испытание выходных»: очки — за Испытание на 5+ раундов и бой Приключения на ★★★
  await page.evaluate(async () => {
    Object.assign(window.__online.weekend, { on: true, points: 2, startsIn: 0, endsIn: 86400 + 3600 });
    window.__wallet = { coins: 0, gems: 0, today: 0, cap: 300 };
    window.__chestSurprise = { kind: 'phrase', code: 'oops' };
    await loadOnlineInfo();
  });
  let wk = await page.evaluate(() => ({ text: document.getElementById('odCup').textContent, claims: document.querySelectorAll('.cup-claim').length }));
  check('выходные идут: за что очко, сколько осталось, «Очки: 2/5»', /Испытание на 5\+ раундов/.test(wk.text) && /★★★/.test(wk.text) &&
    /25 ч/.test(wk.text) && /Очки: 2\/5/.test(wk.text) && wk.claims === 0 && !/побед|турнир|звёзды ×2/i.test(wk.text), wk.text);
  await page.evaluate(async () => { window.__online.weekend.points = 3; await loadOnlineInfo(); });
  wk = await page.evaluate(() => [...document.querySelectorAll('.cup-claim')].map(b => b.id).join());
  check('3 очка — «Забрать» у сундука', wk === 'cupClaim3', wk);
  await page.evaluate(() => claimWeekend(3));
  await page.waitForTimeout(500);
  let modal = await page.evaluate(() => ({ title: document.getElementById('chestTitle').textContent, body: document.getElementById('chestBody').textContent,
    shown: !document.getElementById('chestModal').classList.contains('hidden') }));
  check('сундук выходных: очки, сюрприз и 1 💎', modal.shown && modal.title === 'Сундук выходных' && /\+50/.test(modal.body) &&
    /Сюрприз/.test(modal.body) && /\+1 💎/.test(modal.body), JSON.stringify(modal));
  await page.evaluate(async () => { closeChest(); window.__online.weekend.points = 5; await loadOnlineInfo(); });
  const mon = await page.evaluate(() => document.querySelector('.cup-goal[data-goal="5"]').textContent);
  check('за 5 очков — рамка месяца «Выходные: ноябрь»', /Выходные: ноябрь/.test(mon), mon);
  await page.evaluate(() => claimWeekend(5));
  await page.waitForTimeout(400);
  modal = await page.evaluate(() => ({ body: document.getElementById('chestBody').textContent, own: passOwns('frame', 'cup-11'),
    checks: document.querySelectorAll('.cup-goal i').length }));
  check('5 очков — рамка ноября и 2 💎, обе награды отмечены', /Новая рамка/.test(modal.body) && /\+2 💎/.test(modal.body) &&
    modal.own && modal.checks === 2, JSON.stringify(modal));
  await page.evaluate(() => { closeChest(); openLogoutModal(); });
  await page.waitForTimeout(300);
  const pick = await page.evaluate(() => [...document.querySelectorAll('#pfFrames [data-frame]')].map(x => x.dataset.frame).filter(f => /^cup-|tourney/.test(f)));
  check('в профиле из рамок выходных — только полученная', pick.join() === 'cup-11', pick.join());
  await page.evaluate(() => closeLogoutModal());

  // Игра вдвоём на одном телефоне и проигранный бой Приключения — тоже игры.
  // Выигранный бой присылает adventure_result, а не это
  await page.evaluate(() => { localDoneAt = 0; window.__localDone = []; openSetup('duel'); });
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  await page.evaluate(() => { stopBot(); D.winsNeeded = 1; D.cur = 0; duelPlay(secret); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { quitToMenu(); localDoneAt = 0; BOT_SPEED = 1000; startAdventure(0); stopBot(); D.cur = 1; duelPlay(secret); stopBot(); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { quitToMenu(); localDoneAt = 0; startAdventure(0); stopBot(); D.cur = 0; duelPlay(secret); stopBot(); });
  await page.waitForTimeout(300);
  const sent = await page.evaluate(() => ({ local: window.__localDone.join(), adv: JSON.stringify(window.__advResults || []) }));
  check('вдвоём — «duel», проигрыш в Приключении — «adv», победа — через adventure_result', sent.local === 'duel,adv' &&
    /\[0,/.test(sent.adv), JSON.stringify(sent));

  // Без миграции 053 ничего этого нет и ничего не ломается
  const none = await page.evaluate(async () => { quitToMenu(); window.__online = null; await loadOnlineInfo();
    return { card: document.getElementById('olDaily').classList.contains('hidden'), say: sayCodesFor().length === SAY_CODES.length }; });
  check('без миграции карточки нет, фразы обычные', none.card && none.say, JSON.stringify(none));
  for (const lang of ['en', 'fr', 'de']) {
    const ok = await page.evaluate(l => { const P = i18n[l].pass, W = P.weekend;
      return PASS_FRAMES.every(k => P.frames[k]) && PASS_TITLES.every(k => P.titles[k]) && PASS_PHRASES.every(k => i18n[l].say[k]) &&
        P.chestOpen && P.how && P.locked && P.menuChest && P.frameBase && P.whereLeague && i18n[l].leagues.length === 6 &&
        ['title', 'on', 'off', 'last', 'how', 'points', 'g3', 'g5b', 'claim', 'chest', 'big', 'frame', 'where', 'whereM'].every(k => W[k]) &&
        ['play2', 'play3', 'win1', 'win2', 'adv_win2', 'adv_stars3', 'run1', 'run_rounds5', 'run_best3'].every(k => i18n[l].prog.q[k]); }, lang);
    check(lang + ': сундук, путь, рамки, «Испытание выходных» и задания переведены', ok);
  }
  await page.context().close();

  // Без входа — ни карточки, ни отчётов об играх
  const guest = await newGame(browser);
  await guest.evaluate(() => openSetup('solo'));
  await guest.click('#tStartMatch');
  await guest.waitForTimeout(200);
  const s2 = await guest.evaluate(() => secret);
  await guest.fill('#guessInput', String(s2));
  await guest.click('#tSubmitGuess');
  await guest.waitForTimeout(300);
  const g = await guest.evaluate(() => ({ sent: (window.__localDone || []).length, card: document.getElementById('olDaily').classList.contains('hidden') }));
  check('гость: карточки нет, в базу ничего не уходит', g.sent === 0 && g.card, JSON.stringify(g));
  await guest.context().close();
}


// Магазин (миграция 061): вкладка, витрина, кошелёк, покупка, надеть купленное
async function testShop(browser) {
  console.log('\nМагазин: монеты, кристаллы, товары');
  const fs = require('fs'), path = require('path');
  const page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(() => {
    window.__online = { day: '2026-11-04', played: false, chestOpened: false, chest: null, streak: 0, bestStreak: 0, freezeLeft: true,
      season: '2026-11', xp: 0, levelXp: 100, maxLevel: 30, seasonLeft: 86400 * 20, rewards: [], streakRewards: [],
      owned: [], frame: null, title: null };
    window.__wallet = { coins: 160, gems: 3, today: 40, cap: 300 };
    tutSave({ done: [1, 2, 3], skipped: true, veteran: true });
  });
  await page.evaluate(() => loadOnlineInfo());
  const tab = await page.evaluate(() => ({ text: document.getElementById('shopBtn').textContent,
    order: [...document.querySelectorAll('#tabbar .tab')].map(b => b.id).join() }));
  check('в нижнем меню — «Магазин» вторым', /Магазин/.test(tab.text) && tab.order === 'navPlay,shopBtn,friendsBtn,accountChip', JSON.stringify(tab));
  await page.click('#shopBtn');
  await page.waitForTimeout(400);
  // Магазин 2.0 (миграции 063 и 064): одиннадцать разделов, первой открывается
  // «Витрина» — товары дня и наборы. База без 063 товаров дня не знает: их и не видно
  const front = await page.evaluate(() => ({ tabs: [...document.querySelectorAll('#shopTabs .sh-tab')].map(b => b.textContent).join('|'),
    sel: document.querySelector('#shopTabs .sh-tab.sel').textContent, bundles: document.querySelectorAll('#shopGrid .sh-bundle').length,
    heads: [...document.querySelectorAll('#shopGrid .sh-head b')].map(h => h.textContent).join('|'),
    empty: document.querySelectorAll('#shopGrid .sh-empty').length }));
  check('одиннадцать разделов, открыта «Витрина»: шесть наборов, товаров дня без базы 063 нет',
    front.tabs === 'Витрина|Питомцы|Облики|Ауры|Иконки|Рамки|Фоны|Титулы|Фразы|Градусники|Победа' && front.sel === 'Витрина' &&
    front.bundles === 6 && front.heads === '🎁 Наборы' && !front.empty, JSON.stringify(front));
  await page.click('#shopTabs .sh-tab:nth-child(5)');
  await page.waitForTimeout(150);
  const shop = await page.evaluate(() => ({ shown: !document.getElementById('shopModal').classList.contains('hidden'),
    wallet: [...document.querySelectorAll('#shopWallet .sw-chip')].map(c => c.textContent).join('|'),
    note: document.getElementById('shopNote').textContent,
    tabs: [...document.querySelectorAll('#shopTabs .sh-tab')].map(b => b.textContent).join('|'),
    items: document.querySelectorAll('#shopGrid .sh-item').length, rare: document.querySelectorAll('#shopGrid .sh-item.rare').length,
    rars: ['common', 'rare', 'epic', 'legend'].map(r => r + ':' + document.querySelectorAll('#shopGrid .sh-item.rar-' + r).length).join(),
    first: document.querySelector('#shopGrid .sh-item').textContent, earn: document.querySelectorAll('#shopEarn .sh-earn-row').length,
    earnText: document.getElementById('shopEarn').textContent,
    trophy: document.getElementById('shopTrophy').textContent }));
  check('витрина: кошелёк 🪙 160 и 💎 3, сколько сегодня из 300', shop.shown && shop.wallet === '🪙 160|💎 3' && /40 из 300/.test(shop.note), JSON.stringify(shop));
  check('иконок 20, из них 10 за 💎; у каждой — редкость', shop.items === 20 && shop.rare === 10 && shop.rars === 'common:4,rare:5,epic:6,legend:5',
    JSON.stringify(shop));
  check('у товара имя и своя цена', /Листовой зайчик/.test(shop.first) && /90 🪙/.test(shop.first), shop.first);
  // Задания дня спрятаны (DAILY_EXTRAS) — строки про них нет
  check('как копить — семь строк, без заданий дня, трофеи не продаются', shop.earn === 7 && !/Задание дня/.test(shop.earnText) &&
    /не продаются/.test(shop.trophy), JSON.stringify(shop));
  // Онлайна со случайными соперниками нет (миграция 062): монеты — за игру с
  // другом, кристаллы — за «Испытание выходных»
  check('как копить: игра с другом и «Испытание выходных», без онлайна и турнира',
    /Игра с другом: победа — 15/.test(shop.earnText) && /Испытание выходных: 3 очка — 1 💎/.test(shop.earnText) &&
    !/онлайн|турнир|режиме дня/i.test(shop.earnText + shop.note + shop.trophy), shop.earnText + ' | ' + shop.note);
  // Покупка за монеты, затем надеть
  await page.click('#shopGrid .sh-item[data-code="shop-01"]');
  await page.waitForTimeout(200);
  const card = await page.evaluate(() => ({ name: document.getElementById('siName').textContent, price: document.getElementById('siPrice').textContent,
    btn: document.getElementById('siBuy').textContent, off: document.getElementById('siBuy').disabled,
    kind: document.getElementById('siKind').textContent }));
  check('карточка товара: имя, редкость, цена, «Купить за 90 🪙»', card.name === 'Листовой зайчик' && card.price === '90 🪙' &&
    card.btn === 'Купить за 90 🪙' && !card.off && card.kind === 'Иконка · Обычный', JSON.stringify(card));
  await page.click('#siBuy');
  await page.waitForTimeout(300);
  const bought = await page.evaluate(() => ({ wallet: [...document.querySelectorAll('#shopWallet .sw-chip')].map(c => c.textContent).join('|'),
    note: document.getElementById('siNote').textContent, btn: document.getElementById('siBuy').textContent,
    own: document.querySelector('#shopGrid .sh-item[data-code="shop-01"]').className,
    price: document.querySelector('#shopGrid .sh-item[data-code="shop-01"] .sh-price').textContent }));
  check('куплено: 90 🪙 списано, «Куплено!», кнопка «Надеть»', bought.wallet === '🪙 70|💎 3' && /Куплено/.test(bought.note) &&
    bought.btn === 'Надеть' && /\bown\b/.test(bought.own) && bought.price === 'Куплено', JSON.stringify(bought));
  await page.click('#siBuy');
  await page.waitForTimeout(300);
  const worn = await page.evaluate(() => ({ me: myAvatar(), btn: document.getElementById('siBuy').textContent, off: document.getElementById('siBuy').disabled,
    sent: window.__profile.calls.filter(c => c.name === 'set_avatar').map(c => c.args.p_avatar).join() }));
  check('надел — иконка своя и ушла в базу, кнопка «Надето ✓»', worn.me === 'shop-01' && worn.sent === 'shop-01' && worn.btn === 'Надето ✓' && worn.off,
    JSON.stringify(worn));
  await page.evaluate(() => closeShopItem());
  // Редкое за кристаллы — не хватает: сказано, сколько
  await page.click('#shopGrid .sh-item[data-code="shop-11"]');
  await page.waitForTimeout(200);
  const rare = await page.evaluate(() => ({ note: document.getElementById('siNote').textContent, off: document.getElementById('siBuy').disabled,
    kind: document.getElementById('siKind').textContent, price: document.getElementById('siPrice').textContent }));
  check('эпическое за 💎: не хватает 9 💎, кнопка выключена', /Не хватает 9 💎/.test(rare.note) && rare.off && rare.kind === 'Иконка · Эпический' &&
    rare.price === '12 💎', JSON.stringify(rare));
  await page.evaluate(() => closeShopItem());
  // Остальные разделы: рамка, фон, титул, фраза
  await page.evaluate(async () => { window.__wallet.coins = 1000; window.__wallet.gems = 20; await loadWallet(); });
  const kinds = await page.evaluate(async () => {
    const out = {};
    for (const [kind, code] of [['frame', 'leaf'], ['color', 'grad-mint'], ['title', 'thinker'], ['phrase', 'bingo'], ['frame', 'galaxy']]) {
      shopKind = kind; renderShop();
      out[kind + 'Count'] = document.querySelectorAll('#shopGrid .sh-item').length;
      openShopItem(kind, code);
      await shopBuy(kind, code);
      out[code] = document.getElementById('siNote').textContent;
      if (kind !== 'phrase') await shopWear(kind, code);
      out[code + 'Btn'] = document.getElementById('siBuy').classList.contains('hidden') ? 'hidden' : document.getElementById('siBuy').textContent;
      closeShopItem();
    }
    return out;
  });
  check('рамок 8, фонов 8, титулов 10, фраз 8', kinds.frameCount === 8 && kinds.colorCount === 8 && kinds.titleCount === 10 && kinds.phraseCount === 8,
    JSON.stringify(kinds));
  check('купил рамку, фон, титул и фразу; у фразы нет «Надеть»', ['leaf', 'grad-mint', 'thinker', 'bingo', 'galaxy'].every(c => /Куплено/.test(kinds[c])) &&
    kinds.bingoBtn === 'hidden' && kinds.leafBtn === 'Надето ✓', JSON.stringify(kinds));
  const wear = await page.evaluate(() => ({ frame: window.__online.frame, title: window.__online.title, color: myColor(),
    say: sayCodesFor().includes('bingo'), wallet: JSON.stringify(window.__wallet) }));
  check('надето: рамка «Галактика», титул, фон; фраза — в чате', wear.frame === 'galaxy' && wear.title === 'thinker' && wear.color === 'grad-mint' && wear.say,
    JSON.stringify(wear));
  await page.evaluate(() => closeShop());
  // В профиле купленное — среди своего, и ссылка в магазин
  await page.evaluate(() => { openLogoutModal(); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { document.getElementById('pfStyle').open = true; showAvatarPicker(true); });
  const pf = await page.evaluate(() => ({ frames: [...document.querySelectorAll('#pfFrames .st-frame')].map(b => b.querySelector('.pr-frame').dataset.frame),
    titles: [...document.querySelectorAll('#pfTitles .st-title')].map(b => b.textContent),
    icon: !!document.querySelector('#avGrid .av-tile[data-icon="shop-01"]'), color: !!document.querySelector('#avGrid .av-color[data-color="grad-mint"]'),
    shopColorsLocked: !!document.querySelector('#avGrid .av-color[data-color="grad-peach"]'),
    links: [document.getElementById('pfShopLink').textContent, (document.querySelector('#avGrid .av-shop') || {}).textContent].join('|'),
    frame: document.getElementById('pfAvatar').dataset.frame, title: document.getElementById('pfTitle').textContent }));
  check('в профиле: купленные рамки и титул в выборе, иконка и фон в сетке; некупленного нет', pf.frames.includes('leaf') && pf.frames.includes('galaxy') &&
    !pf.frames.includes('ocean') && pf.titles.includes('Мыслитель') && pf.icon && pf.color && !pf.shopColorsLocked, JSON.stringify(pf));
  check('в профиле — рамка «Галактика» и титул, ссылки «Ещё — в магазине»', pf.frame === 'galaxy' && pf.title === 'Мыслитель' &&
    pf.links === '🛍️ Ещё — в магазине|🛍️ Ещё — в магазине', JSON.stringify(pf));
  await page.evaluate(() => closeLogoutModal());
  // Монеты после игры: всплывашка, кристаллы «Испытания выходных» — в сундуке
  await page.evaluate(() => { window.__advPay = { coins: 15, gems: 5 }; advReport(0, 3); });
  await page.waitForTimeout(300);
  const toast = await page.evaluate(() => { const el = document.getElementById('walletToast');
    return { text: el && el.textContent, show: !!el && el.classList.contains('show'), wallet: shopWallet.coins + '/' + shopWallet.gems }; });
  check('бой Приключения: всплывашка «+15 🪙 +5 💎», кошелёк вырос', toast.show && /\+15 🪙/.test(toast.text) && /\+5 💎/.test(toast.text), JSON.stringify(toast));
  const cup = await page.evaluate(() => { showWeekendChest({ goal: 3, xp: 50, surprise: null, frame: null, gems: 1 });
    const t = document.getElementById('chestBody').textContent; closeChest(); return t; });
  check('сундук выходных: +1 💎', /\+1 💎/.test(cup) && /Кристаллы/.test(cup), cup);
  // Без миграции 061 — «сейчас не отвечает», без входа — «войти»
  const off = await page.evaluate(async () => { window.__wallet = null; await openShop();
    const r = { note: document.getElementById('shopNote').textContent, items: document.querySelectorAll('#shopGrid .sh-item').length };
    closeShop(); return r; });
  check('без миграции витрина видна, сказано, что магазин не отвечает', /не отвечает/.test(off.note) && off.items > 0, JSON.stringify(off));
  await page.context().close();
  const guest = await newGame(browser, {});
  const g = await guest.evaluate(async () => { await openShop();
    const deals = (document.querySelector('#shopGrid .sh-empty') || {}).textContent, bundles = document.querySelectorAll('#shopGrid .sh-bundle').length;
    openShopItem('icon', 'shop-02');
    return { note: document.getElementById('shopNote').textContent, btn: document.getElementById('siBuy').textContent,
      off: document.getElementById('siBuy').disabled, login: !!document.querySelector('#shopNote .btn'), deals, bundles }; });
  check('без входа: витрина видна, купить — после входа', /после входа/.test(g.note) && g.btn === 'Войти' && !g.off && g.login, JSON.stringify(g));
  check('без входа: товары дня — «после входа», наборы видны', /после входа/.test(g.deals) && g.bundles === 6, JSON.stringify(g));
  await guest.context().close();
  // Тексты на всех языках, рисунки, рамки, фоны
  const p2 = await newGame(browser, {});
  const tr = await p2.evaluate(() => ['en', 'fr', 'de', 'ru'].map(l => {
    const S = i18n[l].shop, P = i18n[l].pass;
    const names = { icon: S.icons, color: S.colors, frame: P.frames, title: P.titles, pet: i18n[l].pets.names, gear: S.gear,
      thermo: S.thermos, winfx: S.winfxs, phrase: i18n[l].say };
    const miss = SHOP_ITEMS.filter(it => it.kind === 'skin' ? !i18n[l].pets.skins[it.code.slice(it.code.indexOf('_') + 1)] : !names[it.kind][it.code]);
    const keys = ['title', 'coinsName', 'gemsName', 'toastCoins', 'toastGems', 'worn', 'owned', 'guest', 'login', 'off', 'today', 'earnHead',
      'trophy', 'rare', 'phraseHint', 'wornBtn', 'wear', 'buyFor', 'notEnough', 'back', 'notEnoughShort', 'bought', 'where', 'more',
      'close', 'coinsHow', 'coinsHowNoQuests', 'gemsHow', 'earnQuest', 'deals', 'dealsLeft', 'hm', 'mins', 'dealsGuest', 'dealsNone',
      'bundles', 'bundlesSub', 'bundleHint', 'bundleOwned', 'bundle', 'buyBundle', 'unwear', 'preview', 'gearHint', 'gearNoPet',
      'gearFor', 'gearAll', 'skinHint', 'petFirst', 'forAll', 'petLockedShort', 'thermoHint', 'winfxHint'];
    const Pp = i18n[l].pets, petKeys = ['star', 'skinsHead', 'skinPlain', 'skinShop', 'hero', 'level', 'lv', 'xp', 'xpHow', 'maxLevel', 'tricksHead',
      'gearHead', 'gearShop', 'withYou', 'takeWith', 'cardNone', 'cardNoneSub', 'cardNext', 'vizPet', 'gearNone'];
    return l + ':' + (miss.length + keys.filter(k => !S[k]).length + SHOP_KINDS.filter(k => !S.tabs[k]).length +
      petKeys.filter(k => !Pp[k]).length + PETS.filter(k => !Pp.names[k] || !Pp.who[k]).length + PET_TRICKS.filter(x => !Pp.tricks[x.code]).length +
      SHOP_RARS.filter(r => !S.rarity[r]).length + ['pet', 'skin', 'gear', 'thermo', 'winfx'].filter(k => !S.kindNames[k]).length +
      PET_SLOTS.filter(k => !S.slots[k]).length + SHOP_BUNDLES.filter(b => !S.bundleNames[b.code]).length +
      (S.earn.length === 7 ? 0 : 1) + (i18n[l].navShop ? 0 : 1));
  }).join());
  check('магазин переведён на 4 языка: разделы, товары, подсказки', tr === 'en:0,fr:0,de:0,ru:0', tr);
  const art = await p2.evaluate(() => {
    const ring = document.createElement('span');
    ring.className = 'sha-ring';
    document.body.appendChild(ring);
    const frames = shopCodes('frame').filter(c => { ring.dataset.frame = c; return !getComputedStyle(ring).getPropertyValue('--fr').trim(); });
    ring.remove();
    return { icons: shopCodes('icon').filter(c => !isNamedArt(c)), files: shopCodes('icon').map(iconFile),
      colors: shopCodes('color').filter(c => !AVATAR_GRAD[c]), frames,
      shiny: SHOP_ITEMS.filter(i => i.kind === 'color' && i.gems).every(i => isShinyBg(i.code)) };
  });
  const absent = art.files.filter(f => !fs.existsSync(path.join(__dirname, '..', f)));
  check('у каждого товара есть вид: иконки рисунком, фоны, рамки; редкие фоны переливаются', !art.icons.length && !art.colors.length &&
    !art.frames.length && art.shiny, JSON.stringify(art));
  check('рисунки иконок магазина — в icons/', !absent.length, absent.join(' '));
  await p2.context().close();
}

// Магазин 2.0 и питомцы (миграции 063–065): шесть героев Приключения
// картинками, облики и ауры по питомцам, товары дня, наборы, питомец в меню,
// его экран, питомец в партии, облик градусника и эффект победы
async function testPets(browser) {
  console.log('\nПитомцы-картинки — герои Приключения, облики, ауры, товары дня, наборы, градусник и эффект победы');
  const fs = require('fs'), path = require('path');
  const page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(async () => {
    window.__online = { day: '2026-11-04', played: false, chestOpened: false, chest: null, streak: 0, bestStreak: 0, freezeLeft: true,
      season: '2026-11', xp: 0, levelXp: 100, maxLevel: 30, seasonLeft: 86400 * 20, rewards: [], streakRewards: [],
      owned: [], frame: null, title: null };
    window.__wallet = { coins: 3000, gems: 40, today: 0, cap: 300 };
    window.__look = { pet: null, gear: {}, xp: {}, thermo: null, winfx: null, dealsLeft: 5 * 3600 + 12 * 60 + 30,
      deals: [{ kind: 'icon', code: 'shop-05', pct: 40 }, { kind: 'gear', code: 'aura_star', pct: 25 }, { kind: 'title', code: 'lucky', pct: 15 }] };
    tutSave({ done: [1, 2, 3], skipped: true, veteran: true });
    await loadOnlineInfo();
    showScreen('mode');
    await loadLook();
  });
  await page.waitForTimeout(300);
  // В меню: питомца нет — три питомца в ряд и «в магазин»
  const none = await page.evaluate(() => { const c = document.getElementById('petCard');
    return { shown: !c.classList.contains('hidden'), cls: c.className, pets: c.querySelectorAll('.pet').length, text: c.textContent,
      imgs: [...c.querySelectorAll('.pet-img')].map(i => i.getAttribute('src')).join() }; });
  check('в меню без питомца — карточка «Питомцы» с тремя питомцами-картинками', none.shown && /\bnone\b/.test(none.cls) && none.pets === 3 &&
    /Питомцы/.test(none.text) && /болеть за вас/.test(none.text) && none.imgs === 'icons/pets/badger_idle.webp,icons/pets/cham_idle.webp,icons/pets/penguin_idle.webp',
    JSON.stringify(none));
  await page.click('#petCard');
  await page.waitForTimeout(400);
  const pets = await page.evaluate(() => ({ sel: document.querySelector('#shopTabs .sh-tab.sel').textContent,
    items: [...document.querySelectorAll('#shopGrid .sh-item')].map(b => b.dataset.code + ':' + b.className.match(/rar-(\w+)/)[1] + ':' +
      b.querySelector('.sh-price').textContent).join('|'), art: document.querySelectorAll('#shopGrid .sh-item .pet .pet-img').length,
    names: [...document.querySelectorAll('#shopGrid .sh-name')].map(x => x.textContent).join('|') }));
  check('карточка ведёт в магазин к питомцам: шесть героев Приключения, эпические, за монеты',
    pets.sel === 'Питомцы' && pets.items === 'badger:epic:450 🪙|owl:epic:500 🪙|toucan:epic:450 🪙|cham:epic:550 🪙|crab:epic:500 🪙|penguin:epic:550 🪙' &&
    pets.art === 6 && pets.names === 'Барсук Очкарик|Филин Монокль|Тукан Панама|Хамелеон Очки|Краб Матрос|Пингвин Капитан', JSON.stringify(pets));
  // Карточка питомца: герой какого мира и характер
  await page.click('#shopGrid .sh-item[data-code="penguin"]');
  await page.waitForTimeout(150);
  const pcard = await page.evaluate(() => ({ note: document.getElementById('siNote').textContent, kind: document.getElementById('siKind').textContent,
    btn: document.getElementById('siBuy').textContent }));
  check('карточка питомца: «Герой мира „Морская глубина“», характер, «Купить за 550 🪙»', /Герой мира «Морская глубина»/.test(pcard.note) &&
    /Капитан\. Холод ему в радость/.test(pcard.note) && pcard.kind === 'Питомец · Эпический' && pcard.btn === 'Купить за 550 🪙', JSON.stringify(pcard));
  await page.evaluate(() => closeShopItem());
  // Витрина: три товара дня со скидкой, до смены — часы и минуты; шесть наборов
  await page.click('#shopTabs .sh-tab:nth-child(1)');
  await page.waitForTimeout(150);
  const front = await page.evaluate(() => ({
    heads: [...document.querySelectorAll('#shopGrid .sh-head')].map(h => h.textContent).join('|'),
    deals: [...document.querySelectorAll('#shopGrid .sh-item.deal')].map(b => b.dataset.code + ':' + b.querySelector('.sh-off').textContent + ':' +
      b.querySelector('.sh-price').textContent).join('|'),
    bundles: [...document.querySelectorAll('#shopGrid .sh-bundle')].map(b => b.dataset.bundle + ':' + b.querySelector('.sb-price').textContent).join('|') }));
  check('товары дня: −40 %, −25 %, −15 %, старая цена зачёркнута, «новые через 5 ч 12 мин»',
    front.deals === 'shop-05:−40%:160 🪙 96 🪙|aura_star:−25%:900 🪙 675 🪙|lucky:−15%:150 🪙 128 🪙' &&
    front.heads === '🔥 Товары дняновые через 5 ч 12 мин|🎁 Наборыдешевле, чем по отдельности', JSON.stringify(front));
  check('наборы: питомец и две его ауры со скидкой 20 % (как в базе: 1160, 1200, 1160, 1240, 1200, 1240)',
    front.bundles === 'set_badger:1450 🪙1160 🪙|set_owl:1500 🪙1200 🪙|set_toucan:1450 🪙1160 🪙|set_cham:1550 🪙1240 🪙|set_crab:1500 🪙1200 🪙|set_penguin:1550 🪙1240 🪙',
    front.bundles);
  // Без цены от базы магазин считает так же
  const fallback = await page.evaluate(() => { const saved = petLook.bundles; petLook.bundles = null;
    const r = SHOP_BUNDLES.map(b => shopBundlePrice(b)).join(); petLook.bundles = saved; return r; });
  check('цена набора в игре считается так же, как в базе', fallback === '1160,1200,1160,1240,1200,1240', fallback);
  // Товар дня — со скидкой
  await page.click('#shopGrid .sh-item[data-code="shop-05"]');
  await page.waitForTimeout(150);
  const dealCard = await page.evaluate(() => ({ price: document.getElementById('siPrice').textContent, btn: document.getElementById('siBuy').textContent,
    kind: document.getElementById('siKind').textContent }));
  check('карточка товара дня: зачёркнутая цена, −40 %, «Купить за 96 🪙»', dealCard.price === '160 🪙 96 🪙 −40%' && dealCard.btn === 'Купить за 96 🪙' &&
    dealCard.kind === 'Иконка · Редкий', JSON.stringify(dealCard));
  await page.click('#siBuy');
  await page.waitForTimeout(300);
  check('купил со скидкой: списано 96 🪙', await page.evaluate(() => window.__wallet.coins) === 2904);
  await page.evaluate(() => closeShopItem());
  // Набор Барсука: питомец, листопад и светлячки разом
  await page.click('#shopGrid .sh-bundle[data-bundle="set_badger"]');
  await page.waitForTimeout(150);
  const bcard = await page.evaluate(() => ({ name: document.getElementById('siName').textContent, kind: document.getElementById('siKind').textContent,
    lines: [...document.querySelectorAll('#siNote .si-line')].map(x => x.textContent).join('|'), btn: document.getElementById('siBuy').textContent,
    art: document.querySelectorAll('#siArt .sb-art').length, badger: document.querySelectorAll('#siArt .pet.pet-badger').length,
    auras: document.querySelectorAll('#siArt .pet.pet-badger .pet-aura .g-aura').length }));
  check('карточка набора: барсук и две ауры на нём, скидка, «Купить набор за 1160 🪙»', bcard.name === 'Набор Барсука' && bcard.kind === 'Набор · −20%' &&
    bcard.lines === '• Барсук Очкарик 450 🪙|• Листопад 500 🪙|• Светлячки 500 🪙' && bcard.btn === 'Купить набор за 1160 🪙' && bcard.art === 3 &&
    bcard.badger === 3 && bcard.auras === 2, JSON.stringify(bcard));
  await page.click('#siBuy');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({ coins: window.__wallet.coins, pet: myPet(),
    owned: window.__online.owned.map(o => o.kind + ':' + o.code).join(), price: document.getElementById('siPrice').textContent,
    btn: document.getElementById('siBuy').textContent, off: document.getElementById('siBuy').disabled,
    owl: (document.querySelector('#shopGrid .sh-bundle[data-bundle="set_owl"] .sb-price') || {}).textContent }));
  check('набор куплен: 1160 🪙, Барсук сразу с вами, листопад и светлячки свои', after.coins === 1744 && after.pet === 'badger' &&
    /pet:badger,gear:aura_leaves,gear:aura_fireflies/.test(after.owned) && after.price === 'Всё уже есть' && after.off, JSON.stringify(after));
  check('после покупки цены наборов — от базы заново', after.owl === '1500 🪙1200 🪙', JSON.stringify(after));
  await page.evaluate(() => closeShopItem());
  // Облики: по питомцам, чужого питомца — с замком; свой купить и надеть
  await page.evaluate(() => { shopKind = 'skin'; renderShop(); });
  const skins = await page.evaluate(() => ({ n: document.querySelectorAll('#shopGrid .sh-item').length,
    heads: [...document.querySelectorAll('#shopGrid .sh-head')].map(h => h.textContent).join('|'),
    locked: document.querySelectorAll('#shopGrid .sh-item.locked').length, lockedBadger: document.querySelectorAll('#shopGrid .sh-item.locked[data-code^="badger_"]').length,
    onBadger: document.querySelectorAll('#shopGrid .sh-item[data-code^="badger_"] .pet.pet-badger.skin-honey').length,
    img: document.querySelector('#shopGrid .sh-item[data-code="badger_honey"] .pet-img').getAttribute('src'),
    price: document.querySelector('#shopGrid .sh-item[data-code="owl_night"] .sh-price').textContent,
    gems: [...document.querySelectorAll('#shopGrid .sh-item')].every(b => /💎/.test(b.querySelector('.sh-price').textContent)) }));
  check('обликов 30 по шести питомцам, все за 💎, каждый — своей картинкой; у чужих питомцев — с замком, свои — без', skins.n === 30 && skins.gems &&
    skins.heads === 'Барсук Очкарик|Филин Монокльсначала сам питомец|Тукан Панамасначала сам питомец|Хамелеон Очкисначала сам питомец|Краб Матроссначала сам питомец|Пингвин Капитансначала сам питомец' &&
    skins.locked === 25 && skins.lockedBadger === 0 && skins.onBadger === 1 && skins.img === 'icons/pets/badger_honey.webp' && skins.price === '🔒 12 💎', JSON.stringify(skins));
  await page.click('#shopGrid .sh-item[data-code="owl_night"]');
  await page.waitForTimeout(150);
  const lockedCard = await page.evaluate(() => ({ note: document.getElementById('siNote').textContent, off: document.getElementById('siBuy').disabled,
    kind: document.getElementById('siKind').textContent }));
  check('облик чужого питомца: «Сначала заведите питомца: Филин Монокль», кнопка выключена', lockedCard.off &&
    lockedCard.note === 'Сначала заведите питомца: Филин Монокль.' && lockedCard.kind === 'Облик питомца · Эпический', JSON.stringify(lockedCard));
  await page.evaluate(() => closeShopItem());
  await page.click('#shopGrid .sh-item[data-code="badger_honey"]');
  await page.waitForTimeout(150);
  const sk = await page.evaluate(() => ({ name: document.getElementById('siName').textContent, note: document.getElementById('siNote').textContent,
    price: document.getElementById('siPrice').textContent, btn: document.getElementById('siBuy').textContent }));
  check('карточка облика: «Медовый», для Барсука, 8 💎', sk.name === 'Медовый' && sk.note === 'Облик для питомца: Барсук Очкарик.' && sk.price === '8 💎' &&
    sk.btn === 'Купить за 8 💎', JSON.stringify(sk));
  await page.click('#siBuy');
  await page.waitForTimeout(300);
  await page.click('#siBuy');
  await page.waitForTimeout(300);
  const skOn = await page.evaluate(() => ({ gems: window.__wallet.gems, gear: JSON.stringify(petLook.gear), btn: document.getElementById('siBuy').textContent,
    art: !!document.querySelector('#siArt .pet.pet-badger.skin-honey'), card: !!document.querySelector('#petCard .pet.pet-badger.skin-honey'),
    img: (document.querySelector('#petCard .pet-img') || {}).getAttribute('src') }));
  check('облик куплен за 8 💎 и надет — в карточке и на питомце в меню, кнопка «Снять»', skOn.gems === 32 && skOn.gear === '{"badger":{"skin":"honey"}}' &&
    skOn.btn === 'Снять' && skOn.art && skOn.card && skOn.img === 'icons/pets/badger_honey.webp', JSON.stringify(skOn));
  await page.evaluate(() => closeShopItem());
  // Ауры: общие и по питомцам, каждая — на питомце целиком; листопад из набора — надеть
  await page.evaluate(() => { shopKind = 'gear'; renderShop(); });
  const gear = await page.evaluate(() => ({ n: document.querySelectorAll('#shopGrid .sh-item').length,
    heads: [...document.querySelectorAll('#shopGrid .sh-head b')].map(h => h.textContent).join('|'),
    all: [...document.querySelectorAll('#shopGrid .sh-item')].slice(0, 4).map(b => b.dataset.code).join(),
    onBadger: document.querySelectorAll('#shopGrid .sh-item .pet.pet-badger').length, onOwl: document.querySelectorAll('#shopGrid .sh-item .pet.pet-owl').length,
    drawn: [...document.querySelectorAll('#shopGrid .sh-item')].filter(b => b.querySelector('.pet .pet-aura .g-' + b.dataset.code)).length,
    coins: [...document.querySelectorAll('#shopGrid .sh-item')].every(b => /🪙|Куплено/.test(b.querySelector('.sh-price').textContent)),
    own: [...document.querySelectorAll('#shopGrid .sh-item.own')].map(b => b.dataset.code).join(),
    fire: document.querySelector('#shopGrid .sh-item[data-code="aura_fire"] .sh-price').textContent }));
  check('аур 16: сначала «Для всех питомцев» (пламя, иней, гроза, звёзды на своём барсуке), потом у каждого свои; у каждой — рисунок',
    gear.n === 16 && gear.heads === 'Для всех питомцев|Барсук Очкарик|Филин Монокль|Тукан Панама|Хамелеон Очки|Краб Матрос|Пингвин Капитан' &&
    gear.all === 'aura_fire,aura_ice,aura_storm,aura_star' && gear.onBadger === 6 && gear.onOwl === 2 && gear.drawn === 16 && gear.coins &&
    gear.own === 'aura_leaves,aura_fireflies' && gear.fire === '700 🪙', JSON.stringify(gear));
  await page.click('#shopGrid .sh-item[data-code="aura_leaves"]');
  await page.waitForTimeout(150);
  const gc = await page.evaluate(() => document.getElementById('siNote').textContent + '|' + document.getElementById('siKind').textContent + '|' +
    document.getElementById('siBuy').textContent);
  check('карточка ауры: где видна и чья', gc === 'Сияет вокруг питомца — в меню и в каждой партии. Для питомца: Барсук Очкарик.|Аура питомца · Эпический|Надеть', gc);
  await page.click('#siBuy');
  await page.waitForTimeout(300);
  const worn = await page.evaluate(() => ({ gear: JSON.stringify(petLook.gear), btn: document.getElementById('siBuy').textContent,
    card: !!document.querySelector('#petCard .pet .g-aura_leaves'), art: !!document.querySelector('#siArt .pet .g-aura_leaves') }));
  check('листопад надет — и на питомце в меню, кнопка «Снять»', worn.gear === '{"badger":{"skin":"honey","aura":"aura_leaves"}}' && worn.btn === 'Снять' && worn.card && worn.art,
    JSON.stringify(worn));
  await page.evaluate(() => closeShopItem());
  const fireCard = await page.evaluate(() => { openShopItem('gear', 'aura_fire'); return document.getElementById('siNote').textContent; });
  check('аура пламени подходит всем питомцам', fireCard === 'Сияет вокруг питомца — в меню и в каждой партии. Подходит всем питомцам.', fireCard);
  await page.evaluate(() => { closeShopItem(); closeShop(); });
  // Карточка в меню: имя, уровень, что дальше
  const card = await page.evaluate(() => { const c = document.getElementById('petCard');
    return { text: c.textContent, pet: !!c.querySelector('.pc-pet .pet.pet-badger'), bar: c.querySelector('.pc-bar i').style.width }; });
  check('в меню — Барсук Очкарик, уровень 1, «Ур. 3: Стихия»', card.pet && /Барсук Очкарик/.test(card.text) && /Уровень 1/.test(card.text) &&
    /Ур\. 3: Стихия/.test(card.text) && card.bar === '0%', JSON.stringify(card));
  // Нажатие на самого питомца — сальто, на карточку — его экран. В облике картинка остаётся своя
  await page.click('#petCard .pc-pet');
  await page.waitForTimeout(100);
  const flip = await page.evaluate(() => ({ r: document.querySelector('#petCard .pet').classList.contains('r-flip'),
    e: document.querySelector('#petCard .pet').classList.contains('e-happy'), img: document.querySelector('#petCard .pet-img').getAttribute('src'),
    modal: !document.getElementById('petModal').classList.contains('hidden') }));
  check('нажал на питомца — сальто с радостью, картинка облика на месте, экран не открылся', flip.r && flip.e && flip.img === 'icons/pets/badger_honey.webp' && !flip.modal,
    JSON.stringify(flip));
  await page.click('#petCard .pc-text');
  await page.waitForTimeout(200);
  const pm = await page.evaluate(() => ({ name: document.getElementById('pmName').textContent, rar: document.getElementById('pmRar').textContent,
    who: document.getElementById('pmWho').textContent,
    level: document.getElementById('pmLevel').textContent, xp: document.getElementById('pmXp').textContent,
    tricks: [...document.querySelectorAll('#pmTricks .pm-trick')].map(b => (b.disabled ? '🔒' : '') + b.dataset.trick).join(),
    skins: [...document.querySelectorAll('#pmSkins .pm-trick')].map(b => (b.disabled ? '🔒' : '') + (b.getAttribute('aria-pressed') === 'true' ? '*' : '') + (b.dataset.skin || 'plain')).join(),
    skinShop: !!document.querySelector('#pmSkins [data-shop="skin"]'),
    gear: [...document.querySelectorAll('#pmGear .pm-slot')].map(s => s.textContent).join('|'),
    on: [...document.querySelectorAll('#pmGear .pm-gear.on')].map(b => b.dataset.code).join(),
    pets: [...document.querySelectorAll('#pmPets .pm-pick')].map(b => b.textContent).join('|'),
    go: document.getElementById('pmGo').textContent, goOff: document.getElementById('pmGo').disabled }));
  check('экран питомца: имя, редкость, герой Волшебного леса, уровень 1, 0 из 60 опыта', pm.name === 'Барсук Очкарик' && pm.rar === 'Эпический' &&
    /Герой мира «Волшебный лес»\. Умник/.test(pm.who) && pm.level === 'Уровень 1' && /0 из 60 опыта/.test(pm.xp) && /до 200 в день/.test(pm.xp), JSON.stringify(pm));
  check('трюки: на 1-м уровне — сальто, остальное под замком (стихия, рык, танец, дремота)', pm.tricks === 'flip,🔒element,🔒roar,🔒win,🔒sleep', pm.tricks);
  check('облики: обычный, медовый (надет), звёздный под замком до 10-го уровня, остальные — в магазине', pm.skins === 'plain,*honey,🔒star' && pm.skinShop,
    JSON.stringify(pm));
  check('ауры: листопад надет, светлячки есть; подписи места нет — оно одно', pm.gear === 'ЛистопадСветлячки' && pm.on === 'aura_leaves', JSON.stringify(pm));
  check('питомцы: Барсук с вами, остальные пять — с ценой',
    pm.pets === 'Барсук ОчкарикС вами ✓|Филин Монокль500 🪙|Тукан Панама450 🪙|Хамелеон Очки550 🪙|Краб Матрос500 🪙|Пингвин Капитан550 🪙' &&
    pm.go === 'С вами ✓' && pm.goOff, JSON.stringify(pm));
  // Трюк — питомец его показывает; листопад снимается нажатием, светлячки надеваются
  await page.click('#pmTricks [data-trick="flip"]');
  const trick = await page.evaluate(() => document.querySelector('#pmStage .pet').classList.contains('r-flip'));
  await page.click('#pmGear .pm-gear[data-code="aura_leaves"]');
  await page.waitForTimeout(200);
  await page.click('#pmGear .pm-gear[data-code="aura_fireflies"]');
  await page.waitForTimeout(200);
  const off = await page.evaluate(() => ({ gear: JSON.stringify(petLook.gear), leaves: !!document.querySelector('#pmStage .g-aura_leaves'),
    fireflies: !!document.querySelector('#pmStage .pet-aura.pa-front .g-aura_fireflies'), sent: JSON.stringify(window.__look.gear.badger) }));
  check('трюк «сальто» показывается; листопад снят, светлячки надеты (перед питомцем) — и в базе', trick &&
    off.gear === '{"badger":{"skin":"honey","aura":"aura_fireflies"}}' && !off.leaves && off.fireflies && off.sent === JSON.stringify(JSON.parse(off.gear).badger), JSON.stringify(off));
  // Чужой питомец: «Купить за…» ведёт в магазин
  await page.click('#pmPets [data-pet="owl"]');
  await page.waitForTimeout(100);
  const owl = await page.evaluate(() => ({ name: document.getElementById('pmName').textContent, go: document.getElementById('pmGo').textContent,
    level: document.getElementById('pmLevel').textContent, gear: document.getElementById('pmGear').textContent, skins: document.getElementById('pmSkins').textContent }));
  check('филин не куплен: «Купить за 500 🪙», без уровня, обликов и аур', owl.name === 'Филин Монокль' && owl.go === 'Купить за 500 🪙' && !owl.level && !owl.gear && !owl.skins,
    JSON.stringify(owl));
  // Опыт: уровень 10 — все трюки и звёздный облик
  await page.evaluate(async () => { window.__look.xp = { badger: 2700 }; petModalKind = 'badger'; await loadLook(); });
  await page.waitForTimeout(100);
  const top = await page.evaluate(() => ({ level: document.getElementById('pmLevel').textContent, xp: document.getElementById('pmXp').textContent,
    tricks: [...document.querySelectorAll('#pmTricks .pm-trick')].filter(b => !b.disabled).length,
    star: !document.querySelector('#pmSkins [data-skin="star"]').disabled }));
  check('2700 опыта — уровень 10: все пять трюков и звёздный облик открыты', top.level === 'Уровень 10' && /Высший уровень/.test(top.xp) && top.tricks === 5 && top.star,
    JSON.stringify(top));
  // Стихия и дремота — с частицами поверх картинки
  const fx = await page.evaluate(() => {
    const st = document.getElementById('pmStage');
    petReact(st, 'element'); const el = { cls: st.querySelector('.pet').className, n: st.querySelectorAll('.pet-fx .fx-emo').length };
    petReact(st, 'sleep'); const sl = { cls: st.querySelector('.pet').className, n: st.querySelectorAll('.pet-fx .fx-z').length };
    petReact(st, 'flip');
    return { el, sl, none: st.querySelectorAll('.pet-fx i').length };
  });
  check('стихия барсука — листья поверх, дремота — «z», новая реакция убирает частицы прежней', /\br-element\b/.test(fx.el.cls) && fx.el.n === 7 &&
    /\br-sleep\b/.test(fx.sl.cls) && /\be-sleepy\b/.test(fx.sl.cls) && fx.sl.n === 3 && fx.none === 0, JSON.stringify(fx));
  await page.click('#pmSkins [data-skin="star"]');
  await page.waitForTimeout(200);
  const star = await page.evaluate(() => ({ stage: document.querySelector('#pmStage .pet').classList.contains('skin-star'),
    img: document.querySelector('#pmStage .pet-img').getAttribute('src'), card: !!document.querySelector('#petCard .pet.skin-star'), skin: petLook.gear.badger.skin }));
  check('звёздный облик надет: своя картинка, и в меню', star.stage && star.img === 'icons/pets/badger_star.webp' && star.card && star.skin === 'star', JSON.stringify(star));
  await page.click('#pmSkins [data-skin=""]');
  await page.waitForTimeout(200);
  // Без облика сальто уже меняет картинку на радостную; когда оно кончилось — покой
  const plainNow = await page.evaluate(() => document.querySelector('#pmStage .pet').className + ' ' + document.querySelector('#pmStage .pet-img').getAttribute('src'));
  await page.waitForTimeout(1600);
  const plain = await page.evaluate(() => ({ stage: document.querySelector('#pmStage .pet').className, img: document.querySelector('#pmStage .pet-img').getAttribute('src'),
    skin: petLook.gear.badger.skin || null }));
  check('«Обычный» снимает облик: сальто радостной картинкой, потом картинка покоя', /\br-flip\b.*badger_happy\.webp/.test(plainNow) && !/skin-|r-flip/.test(plain.stage) &&
    plain.img === 'icons/pets/badger_idle.webp' && plain.skin === null, JSON.stringify({ plainNow, plain }));
  await page.evaluate(() => { window.__look.xp = { badger: 0 }; closePetModal(); });
  await page.evaluate(async () => { await loadLook(); });
  // Эффект победы — посмотреть в магазине, купить: надевается сам; градусник — тоже
  await page.evaluate(async () => { window.__wallet.coins = 1000; await openShop('winfx'); openShopItem('winfx', 'fireworks'); });
  await page.waitForTimeout(300);
  await page.click('#siPreview');
  await page.waitForTimeout(100);
  const prev = await page.evaluate(() => ({ fx: document.querySelectorAll('.winfx.winfx-fireworks').length, label: document.getElementById('siPreview').textContent }));
  check('эффект победы можно посмотреть до покупки', prev.fx === 1 && prev.label === '▶ Посмотреть', JSON.stringify(prev));
  await page.click('#siBuy');
  await page.waitForTimeout(300);
  check('первый эффект победы надевается сам', await page.evaluate(() => myWinFx()) === 'fireworks');
  await page.evaluate(async () => { closeShopItem(); openShopItem('thermo', 'lava'); await shopBuy('thermo', 'lava'); });
  check('первый градусник надевается сам', await page.evaluate(() => petLook.thermo) === 'lava');
  await page.evaluate(() => { closeShopItem(); closeShop(); });
  // Партия: питомец справа над полем ввода со светлячками, градусник — лавовый
  await page.click('#tModeSolo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  const inGame = await page.evaluate(() => { const b = document.getElementById('gamePet');
    return { shown: !b.classList.contains('hidden'), badger: !!b.querySelector('.pet.pet-badger'), aura: !!b.querySelector('.pet.pet-badger .g-aura_fireflies'),
      img: b.querySelector('.pet-img').getAttribute('src'), skin: document.getElementById('thermoWrap').className, bottom: parseInt(b.style.bottom, 10) }; });
  check('в партии питомец рядом со своей аурой, градусник — лавовый', inGame.shown && inGame.badger && inGame.aura && inGame.img === 'icons/pets/badger_idle.webp' &&
    /\bsk-lava\b/.test(inGame.skin) && inGame.bottom > 12, JSON.stringify(inGame));
  // «Горячо» — картинка жары, «холодно» — картинка холода
  const { sec, near, far } = await page.evaluate(() => ({ sec: secret, near: secret > RANGE_MIN ? secret - 1 : secret + 1,
    far: secret - RANGE_MIN > RANGE_MAX - secret ? RANGE_MIN : RANGE_MAX }));
  await page.fill('#guessInput', String(near));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(150);
  const hot = await page.evaluate(() => document.querySelector('#gamePet .pet').className + ' ' + document.querySelector('#gamePet .pet-img').getAttribute('src'));
  await page.fill('#guessInput', String(far));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(150);
  const cold = await page.evaluate(() => document.querySelector('#gamePet .pet').className + ' ' + document.querySelector('#gamePet .pet-img').getAttribute('src'));
  check('на «горячо» барсук пыхтит, на «холодно» мёрзнет — другой картинкой', /\br-hot\b/.test(hot) && /badger_hot\.webp/.test(hot) && /\br-cold\b/.test(cold) &&
    /\be-cold\b/.test(cold) && /badger_cold\.webp/.test(cold), JSON.stringify({ hot, cold }));
  // Спрятать питомца из меню вида и вернуть
  const viz = await page.evaluate(() => { renderVizToggles(); const b = document.getElementById('togglePetBtn');
    const r = { shown: !b.classList.contains('hidden'), name: b.textContent, on: b.classList.contains('on') };
    togglePetInGame(); r.hidden = document.getElementById('gamePet').classList.contains('hidden'); r.off = !b.classList.contains('on');
    togglePetInGame(); r.back = !document.getElementById('gamePet').classList.contains('hidden'); return r; });
  check('в меню вида — «🐾 Питомец»: прячет и возвращает', viz.shown && /Питомец/.test(viz.name) && viz.on && viz.hidden && viz.off && viz.back, JSON.stringify(viz));
  // Победа: танец и свой эффект вместо салюта
  await page.evaluate(() => document.querySelectorAll('.winfx').forEach(x => x.remove()));
  await page.fill('#guessInput', String(sec));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(200);
  await liftCurtainIfShown(page);
  const win = await page.evaluate(() => ({ r: document.querySelector('#gamePet .pet').classList.contains('r-win'), img: document.querySelector('#gamePet .pet-img').getAttribute('src'),
    sparks: document.querySelectorAll('#gamePet .pet-fx .fx-spark').length,
    fx: document.querySelectorAll('.winfx.winfx-fireworks').length, confetti: document.querySelectorAll('.confetti').length }));
  check('победа: питомец танцует радостный с искрами, вместо салюта — свой «Салют»', win.r && /badger_happy\.webp/.test(win.img) && win.sparks === 6 && win.fx === 1 &&
    win.confetti === 0, JSON.stringify(win));
  // Опыт — за любую игру: база начисляет, игра перечитывает
  await page.waitForTimeout(300);
  const xp = await page.evaluate(() => ({ xp: petXpOf('badger'), sent: (window.__localDone || []).join() }));
  check('за партию питомцу пришёл опыт', xp.xp === 10 && /solo/.test(xp.sent), JSON.stringify(xp));
  // В меню и в уроках питомца на поле нет
  await page.click('#screenGame >> text=В меню');
  await page.waitForTimeout(200);
  check('вне партии питомца на поле нет', await page.evaluate(() => document.getElementById('gamePet').classList.contains('hidden')));
  await page.context().close();
  // Картинки и тексты: у всех питомцев, обликов, аур, градусников и эффектов
  const p2 = await newGame(browser, {});
  const art = await p2.evaluate(() => {
    // Облик меняет трубку и шарик градусника: с ним вид другой, чем без него
    const test = document.createElement('div');
    document.body.appendChild(test);
    const look = cls => { test.innerHTML = '<span class="thermo-mini ' + cls + '"><span class="thermo-tube"></span><span class="thermo-bulb"></span></span>';
      const a = getComputedStyle(test.querySelector('.thermo-tube')), b = getComputedStyle(test.querySelector('.thermo-bulb'));
      return a.borderTopColor + a.backgroundImage + b.boxShadow; };
    const base = look('');
    const skins = THERMO_SKINS.filter(s => look('sk-' + s) === base);
    test.remove();
    const skinItems = shopCodes('skin');
    const strip = s => s.replace(/style="[^"]*"/g, '');
    return { pets: PETS.filter(k => PET_SKINS[k].length !== 5).length,
      // Каждому питомцу — картинки покоя, пяти эмоций, пяти обликов и звёздного
      files: PETS.flatMap(k => PET_STATES.concat(PET_SKINS[k], [PET_STAR]).map(s => petImg(k, s))),
      // Облик — своя картинка и класс; у каждого питомца по пять в магазине
      skinArt: PETS.filter(k => PET_SKINS[k].some(sk => !petHtml(k, { skin: sk }).includes('skin-' + sk) || !petHtml(k, { skin: sk }).includes(petImg(k, sk)))).length,
      skinItems: PETS.filter(k => skinItems.filter(c => c.startsWith(k + '_')).length !== 5 || PET_SKINS[k].some(sk => !skinItems.includes(k + '_' + sk))).length,
      auras: shopCodes('gear').filter(c => !PET_AURAS[c]).length, slots: shopCodes('gear').filter(c => PET_AURAS[c].slot !== 'aura').length,
      // У общей ауры рисунок для всех шести, у своей — для своего питомца
      fits: shopCodes('gear').filter(c => PET_AURAS[c].pet ? !PET_AURAS[c].art[PET_AURAS[c].pet] : PETS.some(k => !PET_AURAS[c].art[k])).length,
      drawn: shopCodes('gear').filter(c => { const k = PET_AURAS[c].pet || 'owl'; return !petHtml(k, { auras: [c] }).includes('class="pt-gear g-aura g-' + c + '"'); }).length,
      // Две одинаковые ауры в одной разметке не плодят случайностей: частицы кладёт только реакция
      same: PETS.every(k => strip(petHtml(k, { auras: ['aura_fire'] })) === strip(petHtml(k, { auras: ['aura_fire'] }))),
      thermo: shopCodes('thermo').filter(c => !THERMO_SKINS.includes(c)).length, skins: skins.length,
      winfx: shopCodes('winfx').filter(c => !WINFX[c]).length };
  });
  const absent = art.files.filter(f => !fs.existsSync(path.join(__dirname, '..', f)));
  check('у каждого питомца есть 12 картинок (72 в icons/pets), пять обликов и звёздный, у аур — рисунок на своём питомце, у градусников и эффектов — вид',
    !art.pets && art.files.length === 72 && !absent.length && !art.skinArt && !art.skinItems && !art.auras && !art.slots && !art.fits && !art.drawn && art.same &&
    !art.thermo && !art.skins && !art.winfx, JSON.stringify(art).slice(0, 400) + ' нет: ' + absent.join(' '));
  const tr = await p2.evaluate(() => {
    const ru = i18n.ru;
    const ph = s => (String(s).match(/\{\w+\}/g) || []).sort().join();
    return ['en', 'fr', 'de', 'ru'].map(l => {
      const P = i18n[l].pets, S = i18n[l].shop;
      const keys = ['level', 'lv', 'xp', 'xpHow', 'maxLevel', 'tricksHead', 'star', 'skinsHead', 'skinPlain', 'skinShop', 'hero', 'gearHead', 'gearShop',
        'gearNone', 'withYou', 'takeWith', 'cardNone', 'cardNoneSub', 'cardNext', 'vizPet'];
      const bad = keys.filter(k => !P[k] || ph(P[k]) !== ph(ru.pets[k])).length +
        PETS.filter(k => !P.names[k] || !P.who[k]).length + PET_TRICKS.filter(x => !P.tricks[x.code]).length +
        PETS.filter(k => PET_SKINS[k].some(sk => !P.skins[sk])).length + shopCodes('gear').filter(c => !S.gear[c]).length +
        PET_SLOTS.filter(k => !S.slots[k]).length + (S.tabs.gear && S.kindNames.gear && S.gearHint && S.gearNoPet ? 0 : 1) +
        ['dealsLeft', 'hm', 'mins', 'bundleHint', 'buyBundle', 'gearHint', 'gearFor', 'skinHint', 'petFirst'].filter(k => ph(S[k]) !== ph(ru.shop[k])).length;
      return l + ':' + bad;
    }).join();
  });
  check('питомцы переведены на 4 языка, подстановки на месте', tr === 'en:0,fr:0,de:0,ru:0', tr);
  await p2.context().close();
}


// Разбор «понятно ли ребёнку»: главное — на первом экране, слова — одни и те же
async function testKidClarity(browser) {
  console.log('\nПонятно ребёнку: кнопки на виду, слова одни');
  let page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(async () => {
    window.__online = { day: '2026-11-01', played: false, chestOpened: false, chest: null, streak: 3, bestStreak: 6, freezeLeft: true,
      season: '2026-11', xp: 640, levelXp: 100, maxLevel: 30, seasonLeft: 86400 * 29, rewards: [{ level: 9, kind: 'title', code: 'hunter' }],
      streakRewards: [], owned: [], frame: null, title: null,
      weekend: { on: true, points: 1, claim3: null, claim5: null, frame: 'cup-11', startsIn: 0, endsIn: 3600 } };
    tutSave({ done: [1, 2, 3], skipped: true, veteran: true });
    await loadOnlineInfo();
    showScreen('mode');
  });
  await page.waitForTimeout(500);
  const next = await page.evaluate(() => document.querySelector('#screenMode .od-next small').textContent);
  check('у награды пути — «ступень 9», а не просто число', next === 'ступень 9', next);
  await page.context().close();

  page = await newGame(browser, {});
  await page.evaluate(() => openFriendsEntry());
  await page.waitForTimeout(400);
  const auth = await page.evaluate(() => ({ title: document.getElementById('tAuthChoiceTitle').textContent,
    why: document.getElementById('tAuthChoiceWhy').textContent, shown: screen }));
  check('вход: заголовок «куда» и зачем имя и PIN', auth.shown === 'authChoice' && /Друзья/.test(auth.title) && /PIN/.test(auth.why), JSON.stringify(auth));
  await page.evaluate(() => openAdventure());
  await page.waitForTimeout(400);
  const adv = await page.evaluate(() => ({ goals: [...document.querySelectorAll('#advMap .aw-goal:not(.hidden)')].length,
    hint: document.getElementById('advDiffHint').textContent }));
  check('Приключение: цель «★★★ у всех» — только у открытого мира', adv.goals === 1, String(adv.goals));
  check('Приключение: под сложностью — у кого сколько «⚡ +1 ход» и звёзды',
    adv.hint === '«⚡ +1 ход»: у вас и у соперника по одному · за победу ★★', adv.hint);
  const words = await page.evaluate(() => ['en', 'ru', 'fr', 'de'].map(l => JSON.stringify(i18n[l]).match(/жетон|jeton|\bMarken?\b|\btokens?\b(?!\")/gi)));
  check('слова «жетон» в текстах больше нет — везде «⚡ +1 ход»', words.every(w => !w), JSON.stringify(words));
  await page.context().close();
}

// Онлайн: Рентген, Половина, Щит, Заморозка (миграция 057)
async function testOnlineAdvBonuses(browser) {
  console.log('\nОнлайн: бонусы из Приключения');
  const page = await newGame(browser, { user: 'Лев' });
  await page.evaluate(() => {
    Object.assign(window.__match, { bonusesOn: true, seat: 0, cur: 0, names: ['Лев', 'Кира'],
      shield: [true, false], frozen: [false, false], know: { parity: 0, half: 'low' },
      lastBonus: 'xray', lastBonusBy: 0 });
    openMatch(1);
  });
  await page.waitForTimeout(500);
  const v = await page.evaluate(() => ({ me: document.getElementById('peff0').innerHTML, rival: document.getElementById('peff1').innerHTML,
    line: document.getElementById('bonusLine').textContent }));
  check('у меня — щит и что я знаю: чётное, нижняя половина', /🛡️/.test(v.me) && /чётн/i.test(v.me) && /≤ ?50|до 50|50/.test(v.me), v.me);
  check('у соперника моего знания нет', !/чётн/i.test(v.rival), v.rival);
  check('строка бонуса — «Рентген»', /Рентген/.test(v.line), v.line);

  // Сопернику: он взял Рентген, но ответа ему не видно — сервер не присылает
  await page.evaluate(() => { Object.assign(window.__match, { seat: 1, know: { parity: null, half: null }, shield: [true, false] }); refreshMatch(true); });
  await page.waitForTimeout(300);
  const other = await page.evaluate(() => ({ me: document.getElementById('peff1').innerHTML, rival: document.getElementById('peff0').innerHTML }));
  check('щит соперника видно мне', /🛡️/.test(other.rival), other.rival);
  check('его чётность мне не видна', !/чётн/i.test(other.me + other.rival), other.me + other.rival);

  // Заморозка: мой ход пропускается — словами про заморозку, не про ловушку
  await page.evaluate(() => { Object.assign(window.__match, { seat: 1, cur: 1, skip: [false, true], frozen: [false, true], forced: 'skip',
    lastBonus: 'freeze', lastBonusBy: 0, shield: [false, false] }); refreshMatch(true); });
  await page.waitForTimeout(300);
  const fz = await page.evaluate(() => ({ text: document.getElementById('forcedText').textContent, eff: document.getElementById('peff1').innerHTML }));
  check('замёрз — «Заморозка — этот ход вы пропускаете», значок 🧊', /Заморозка/.test(fz.text) && /🧊/.test(fz.eff), JSON.stringify(fz));

  // Щит отбил ловушку
  await page.evaluate(() => { Object.assign(window.__match, { seat: 0, cur: 1, skip: [false, false], frozen: [false, false], forced: null,
    lastBonus: 'shieldUsed', lastBonusBy: 0, shieldTrap: 'skip' }); refreshMatch(true); });
  await page.waitForTimeout(300);
  const su = await page.evaluate(() => document.getElementById('bonusLine').textContent);
  check('строка: щит отбил ловушку «Пропуск хода»', /Щит/.test(su) && /Пропуск хода/.test(su), su);

  // Новые бонусы (миграция 060): зеркало видно обоим, делимость и компас — только свои
  await page.evaluate(() => { Object.assign(window.__match, { seat: 0, cur: 0, skip: [false, false], frozen: [false, false], forced: null,
    shield: [false, false], mirror: [false, true], know: { parity: null, half: null, div3: true, div5: false, gt: 20, lt: 70 },
    lastBonus: 'compass', lastBonusBy: 0, shieldTrap: null }); refreshMatch(true); });
  await page.waitForTimeout(300);
  const nb = await page.evaluate(() => ({ me: document.getElementById('peff0').textContent, rival: document.getElementById('peff1').textContent,
    line: document.getElementById('bonusLine').textContent }));
  check('онлайн: делимость и компас — у моего имени', /делится на 3/.test(nb.me) && /не делится на 5/.test(nb.me) &&
    /больше 20/.test(nb.me) && /меньше 70/.test(nb.me), nb.me);
  check('онлайн: зеркало соперника видно мне, у меня его нет', /🪞/.test(nb.rival) && !/🪞/.test(nb.me) && /Компас/.test(nb.line),
    JSON.stringify(nb));
  await page.evaluate(() => { Object.assign(window.__match, { seat: 0, cur: 0, mirror: [false, false], know: {},
    lastBonus: 'mirrorUsed', lastBonusBy: 1, shieldTrap: 'gift' }); refreshMatch(true); });
  await page.waitForTimeout(300);
  const mu = await page.evaluate(() => document.getElementById('bonusLine').textContent);
  check('строка: зеркало отразило ловушку «Подарок сопернику»', /зеркало отразило ловушку «Подарок сопернику»/.test(mu), mu);

  // Список бонусов: четыре новых — в полезных, «только в Приключении» — один Шальной бросок
  await page.evaluate(() => openBonusGuide());
  const guide = await page.evaluate(() => [...document.querySelectorAll('#bgList .bg-head')].map(h => {
    const rows = []; let n = h.nextElementSibling;
    while (n && n.classList.contains('bg-row')) { rows.push(n.querySelector('b').textContent); n = n.nextElementSibling; }
    return h.textContent + ': ' + rows.join(',');
  }));
  check('список бонусов: Рентген, Половина, Щит, Заморозка и новые — среди полезных',
    /Рентген,Половина,Щит,Заморозка,Делится на 3\?,Делится на 5\?,Компас,Воришка,Зеркало$/.test(guide[0]) &&
    guide[2] === 'Только в Приключении: Шальной бросок,Цифра десятков,Последняя цифра', guide.join(' | '));
  await page.context().close();
}

// «С другом» на одном телефоне: бонусы из Приключения работают и здесь
async function testLocalAdvBonuses(browser) {
  console.log('\nС другом: бонусы из Приключения');
  const page = await newGame(browser);
  await page.click('#tModeDuel');
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.evaluate(() => { const b = document.getElementById('bonusSetup'); if (b && !b.checked) b.click(); });
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    secret = 40;
    D.bonuses = [{ value: 70, type: 'xray', taken: false }, { value: 20, type: 'freeze', taken: false },
                 { value: 90, type: 'shield', taken: false }, { value: 10, type: 'skip', taken: false }];
    return { on: bonusMode };
  });
  check('бонусы включены', r.on);
  const step = async g => { await page.fill('#guessInput', String(g)); await page.click('#tSubmitGuess'); await page.waitForTimeout(350);
    await page.evaluate(() => { document.querySelectorAll('.curtain:not(.hidden), #curtain:not(.hidden)').forEach(c => c.click());
      const bc = document.getElementById('bonusCard'); if (bc) bc.classList.add('hidden'); }); };
  await step(70);                       // игрок 1 — Рентген
  const x = await page.evaluate(() => ({ know: D.know[0].parity, eff: document.getElementById('peff0').innerHTML }));
  check('Рентген: игрок 1 узнал, что число чётное', x.know === 0, JSON.stringify(x));
  await step(90);                       // игрок 2 — Щит
  check('Щит: у игрока 2', await page.evaluate(() => D.shield[1]));
  await step(20);                       // игрок 1 — Заморозка: игрок 2 пропускает
  const f = await page.evaluate(() => ({ skip: D.skip[1], frozen: D.frozen[1], forced: forcedTurn() }));
  check('Заморозка: игрок 2 пропускает ход', f.skip && f.frozen && f.forced === 'skip', JSON.stringify(f));
  const ft = await page.evaluate(() => document.getElementById('forcedText').textContent);
  check('и сказано — «Заморозка»', /Заморозка/.test(ft), ft);
  await page.context().close();
}

// Новые бонусы: делимость на 3 и 5, цифры у боссов, компас, воришка, зеркало.
// И правила миров: буря бонусов, ловушки у всех, соперник первым
async function testNewBonuses(browser) {
  console.log('\nНовые бонусы и правила миров');
  const page = await newGame(browser, { user: 'Максим' });
  await page.click('#tModeDuel');
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.evaluate(() => { const b = document.getElementById('bonusSetup'); if (b && !b.checked) b.click(); });
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  const k = await page.evaluate(() => {
    const out = {};
    secret = 45;
    D.know = [{}, {}];
    applyBonus('div3', 0); applyBonus('div5', 0);
    out.div = [D.know[0].div3, D.know[0].div5];
    applyBonus('tens', 0); applyBonus('units', 0);
    out.digits = [D.know[0].tens, D.know[0].units];
    out.text = knowText(0).join(' · ');
    renderAll();
    out.chip = document.getElementById('peff0').textContent;
    // 45 — единственное число от 1 до 100 с цифрами 4 и 5: бот это знает
    const cand = botCandidates([], 0, { know: D.know[0] }, false);
    out.cand = [...cand].map((c, i) => c ? i + RANGE_MIN : 0).filter(Boolean).join();
    // Компас мерит от числа, на котором лежал, и сужает с двух сторон
    applyBonus('compass', 1, 30); applyBonus('compass', 1, 60); applyBonus('compass', 1, 20);
    out.compass = [D.know[1].gt, D.know[1].lt].join();
    out.compassText = knowText(1).join(' · ');
    // Не делится — тоже знание
    secret = 44; D.know[1] = {};
    applyBonus('div3', 1); applyBonus('div5', 1);
    out.notDiv = knowText(1).join(' · ');
    const c2 = botCandidates([], 1, { know: D.know[1] }, false);
    out.botNotDiv = [...c2].every((c, i) => !c || ((i + RANGE_MIN) % 3 !== 0 && (i + RANGE_MIN) % 5 !== 0));
    // Воришка: «⚡» соперника — себе; у соперника пусто — из запаса
    D.tokens = [0, 2]; applyBonus('thief', 0); out.thief = D.tokens.join();
    D.tokens = [0, 0]; applyBonus('thief', 0); out.thiefEmpty = D.tokens.join();
    return out;
  });
  check('➗3 и ➗5: у 45 — делится на оба', k.div[0] === true && k.div[1] === true, JSON.stringify(k));
  check('цифры босса: у 45 десятков 4, последняя 5', k.digits.join() === '4,5', JSON.stringify(k));
  check('знание словами у своего имени', /делится на 3/.test(k.chip) && /делится на 5/.test(k.chip) &&
    /цифра десятков 4/.test(k.chip) && /последняя цифра 5/.test(k.chip), k.chip);
  check('бот с этим знанием ищет только 45', k.cand === '45', k.cand);
  check('компас: больше 30, меньше 60 (20 ничего не добавил)', k.compass === '30,60' && /больше 30/.test(k.compassText) &&
    /меньше 60/.test(k.compassText), JSON.stringify(k));
  check('44 — «не делится на 3», «не делится на 5», бот их пропускает', /не делится на 3/.test(k.notDiv) &&
    /не делится на 5/.test(k.notDiv) && k.botNotDiv, k.notDiv);
  check('воришка: забрал «⚡» у соперника, у пустого — из запаса', k.thief === '1,1' && k.thiefEmpty === '1,0', JSON.stringify(k));

  // Зеркало на доске: игрок 1 берёт зеркало, потом наступает на ловушку — она уходит игроку 2
  await page.evaluate(() => {
    secret = 40; D.cur = 0; D.skip = [false, false]; D.know = [{}, {}];
    D.bonuses = [{ value: 70, type: 'mirror', taken: false }, { value: 20, type: 'skip', taken: false }];
  });
  const step = async g => { await page.fill('#guessInput', String(g)); await page.click('#tSubmitGuess'); await page.waitForTimeout(350);
    await page.evaluate(() => { document.querySelectorAll('.curtain:not(.hidden), #curtain:not(.hidden)').forEach(c => c.click());
      const bc = document.getElementById('bonusCard'); if (bc) bc.classList.add('hidden'); }); };
  await step(70);
  const m1 = await page.evaluate(() => ({ mirror: D.mirror[0], flags: document.getElementById('peff0').textContent }));
  check('зеркало: у игрока 1, значок 🪞 у имени', m1.mirror && /🪞/.test(m1.flags), JSON.stringify(m1));
  await step(50);
  await step(20);
  const m2 = await page.evaluate(() => ({ skip: D.skip.join(), mirror: D.mirror[0], last: D.lastBonus, cur: D.cur,
    forced: forcedTurn(), line: document.getElementById('bonusLine').textContent }));
  check('зеркало отразило «Пропуск хода» в соперника — пропускает он', m2.skip === 'false,true' && !m2.mirror &&
    m2.last === 'mirrorUsed' && m2.cur === 1 && m2.forced === 'skip', JSON.stringify(m2));
  check('и об этом сказано', /зеркало отразило ловушку «Пропуск хода»/.test(m2.line), m2.line);
  await page.evaluate(() => quitToMenu());

  // Приключение: правила миров и цифра у босса
  const w = await page.evaluate(() => {
    localStorage.setItem(advKey(), String(ADV_TOTAL)); localStorage.setItem(advStarsKey(), '3'.repeat(ADV_TOTAL)); BOT_SPEED = 1000;
    const find = rule => ADV_WORLDS.findIndex(W => W.rule === rule);
    const plain = w => [...Array(9).keys()].map(i => w * 10 + i).find(n => !advChar(n).R.bonus && !advChar(n).R.first);
    const out = { worlds: ADV_WORLDS.slice(5).map(W => W.bonus + (W.rule ? ':' + W.rule : '')).join() };
    let n = plain(find('storm'));
    startAdventure(n); stopBot();
    out.storm = { n: D.bonuses.length, auto: autoBonusCountFor(rangeCount()), traps: bonusSet.trap.length };
    quitToMenu();
    n = plain(find('traps'));
    startAdventure(n); stopBot();
    out.traps = { set: bonusSet.trap.length, on: D.bonuses.filter(b => BONUS_TRAP.includes(b.type)).length };
    quitToMenu();
    n = plain(find('first'));
    startAdventure(n); stopBot();
    out.first = { starter: D.starter, cur: D.cur };
    D.round = 2; startRound(); stopBot();
    out.first.cur2 = D.cur;
    quitToMenu();
    // Обычный мир без правила: первым ходит игрок
    n = plain(ADV_WORLDS.findIndex((W, i) => i >= 5 && !W.rule));
    startAdventure(n); stopBot();
    out.plain = { cur: D.cur, traps: bonusSet.trap.length, n: D.bonuses.length, auto: autoBonusCountFor(rangeCount()) };
    quitToMenu();
    // Боссы с шестого мира: цифра лежит всегда, через мир — десятков или последняя
    out.boss = [4, 5, 6].map(w => {
      startAdventure(w * 10 + 9); stopBot();
      const r = { w, digit: advBossDigit(vsBot.adv), lead: bonusSet.good.slice(0, bonusSet.first).join(),
                  on: D.bonuses.some(b => b.type === 'tens' || b.type === 'units') };
      quitToMenu();
      return r;
    });
    // Карточка: правило мира и цифра босса
    const sw = find('storm');
    openAdventure(); openAdvCard(sw * 10 + 9);
    out.card = document.getElementById('acFacts').textContent;
    closeAdvCard();
    out.tags = document.querySelector('#advMap .adv-world[data-w="' + sw + '"] .aw-tags').textContent;
    out.name = document.querySelector('#advMap .adv-world[data-w="' + sw + '"] .aw-name').textContent;
    return out;
  });
  check('бонусы миров 6–15 и правила', w.worlds.split(',').slice(0, 10).join() ===
    'shield,freeze,compass,div3,half:storm,div5,xray,thief:first,lava:traps,mirror', w.worlds);
  check('буря бонусов: бонусов вдвое больше', w.storm.n === 2 * w.storm.auto && w.storm.traps === 0, JSON.stringify(w.storm));
  check('ловушки у всех: и у обычного соперника', w.traps.set === 3 && w.traps.on > 0, JSON.stringify(w.traps));
  check('соперник первым — в каждом раунде', w.first.starter === 1 && w.first.cur === 1 && w.first.cur2 === 1, JSON.stringify(w.first));
  check('мир без правила: первым — игрок, бонусов обычно, ловушек нет', w.plain.cur === 0 && w.plain.traps === 0 &&
    w.plain.n === w.plain.auto, JSON.stringify(w.plain));
  check('босс пятого мира — без цифры, шестого — последняя, седьмого — десятков', w.boss[0].digit === null &&
    w.boss[1].digit === 'units' && w.boss[1].on && w.boss[1].lead === 'shield,units' &&
    w.boss[2].digit === 'tens' && w.boss[2].on && w.boss[2].lead === 'freeze,tens', JSON.stringify(w.boss));
  check('в карточке босса — цифра и правило мира', /у босса ещё 🔢 Последняя цифра|у босса ещё 🔟 Цифра десятков/.test(w.card) &&
    /Правило мира: 🌪️ Буря бонусов — Бонусов вдвое больше/.test(w.card), w.card);
  check('на карте у имени мира — значки бонуса и правила, имя без них', w.tags === '🌗🌪️' && !/🌪️/.test(w.name), JSON.stringify(w));

  // Щит и зеркало встречают и помеху из правила соперника
  const g = await page.evaluate(async () => {
    await advLoadPack();
    startAdventure(50); stopBot();
    const R = advCtx();
    const out = {};
    D.shield[0] = true;
    R.skip(0); R.fire('rule');
    out.shield = { skip: D.skip[0], shield: D.shield[0], last: D.lastBonus, text: D.shieldedText };
    renderAll();
    out.line = document.getElementById('bonusLine').textContent;
    D.mirror[0] = true;
    R.fog(0); R.fire('rule');
    out.mirror = { fog: D.fog.join(), mirror: D.mirror[0], last: D.lastBonus };
    renderAll();
    out.line2 = document.getElementById('bonusLine').textContent;
    // Без щита и зеркала помеха работает как раньше
    R.memory(0); R.fire('rule');
    out.plain = D.shortMemory[0];
    out.title = advFireTitle(50, 'rule');
    quitToMenu();
    return out;
  });
  check('щит отбил помеху правила — ход не пропущен, сказано, что именно', !g.shield.skip && !g.shield.shield &&
    g.shield.last === 'shieldRule' && g.shield.text === g.title && g.line.includes('щит отбил «' + g.title + '»'), JSON.stringify(g));
  check('зеркало отразило помеху правила в соперника', g.mirror.fog === 'false,true' && !g.mirror.mirror &&
    g.mirror.last === 'mirrorRule' && /зеркало отразило/.test(g.line2), JSON.stringify(g));
  check('без защиты помеха правила работает', g.plain === true, JSON.stringify(g));
  await done(page);
}

// Полная проверка «что дёргается и куда не попасть»
async function testNoJumps(browser) {
  console.log('\nНичего не дёргается, кнопки под палец');
  const page = await newGame(browser, { user: 'Лев' });
  await page.click('.mode-btn.solo');
  await page.evaluate(() => { document.getElementById('rangeMax').value = '100'; onRangeChange(); });
  await page.click('#tStartMatch');
  await page.evaluate(() => { secret = 63; });
  const tops = [];
  for (const g of [50, 80, 70, 60, 65, 64]) {
    await page.fill('#guessInput', String(g)); await page.click('#tSubmitGuess'); await page.waitForTimeout(350);
    tops.push(await page.evaluate(() => Math.round(document.getElementById('historySection').getBoundingClientRect().top)));
  }
  check('история ходов не прыгает от хода к ходу (и на «Очень горячо»)', new Set(tops.slice(1)).size === 1, tops.join(','));
  const lab = await page.evaluate(() => { const l = document.getElementById('feedbackLabel'); return { h: l.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(l).fontSize), t: l.textContent }; });
  check('подпись подсказки — в одну строку', lab.h < lab.lh * 1.8, JSON.stringify(lab));
  const btns = await page.evaluate(() => ['vizBtn', 'tMenu'].map(id => { const r = document.getElementById(id).getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); }));
  check('кнопки над доской — не меньше 38×34', btns.every(x => { const [w, h] = x.split('x').map(Number); return w >= 38 && h >= 34; }), btns.join(' '));
  await page.fill('#guessInput', '63'); await page.click('#tSubmitGuess'); await page.waitForTimeout(1200);
  await page.evaluate(() => openReview());
  await page.waitForTimeout(300);
  const last = await page.evaluate(() => { const rows = document.querySelectorAll('#reviewList .rv-row, .rv-row'); return rows[rows.length - 1].textContent; });
  check('у угадывающего хода нет «было 1 → осталось 1»', !/осталось/.test(last), last);
  await page.context().close();
}

// iPad: та же вёрстка, только крупнее (масштаб на сенсорных экранах от 744 px)
async function testTablet(browser) {
  console.log('\niPad: крупнее и без пустот');
  for (const [w, h, z] of [[820, 1180, '1.3'], [1180, 820, '1.25']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => check('без ошибок JS', false, e.message));
    await applyStub(page, { user: 'Лев' });
    await page.goto(GAME_URL);
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => ({ zoom: getComputedStyle(document.documentElement).zoom, hs: document.documentElement.scrollWidth > innerWidth + 1 }));
    check(w + '×' + h + ': игра крупнее (×' + z + '), без прокрутки вбок', r.zoom === z && !r.hs, JSON.stringify(r));
    // «Испытание» — во всю ширину меню, под ним три плитки в ряд
    const row = await page.evaluate(() => { const a = document.querySelector('.mode-btn.run').getBoundingClientRect(),
      l = document.querySelector('#screenMode .mode-list').getBoundingClientRect(),
      t = ['solo', 'duel', 'bot'].map(k => document.querySelector('.mode-btn.' + k).getBoundingClientRect());
      return { full: Math.abs(a.width - l.width) < 2, row: t.every(x => Math.abs(x.top - t[0].top) < 2) }; });
    check(w + '×' + h + ': меню — Испытание во всю ширину, три плитки в ряд', row.full && row.row, JSON.stringify(row));
    // Испытание: «Начать» и Испытание дня — рядом только горизонтально
    await page.evaluate(() => openRunEntry());
    await page.waitForTimeout(400);
    const tr = await page.evaluate(() => { const a = document.getElementById('tRunStart').getBoundingClientRect(),
      b = document.getElementById('trialDaily').getBoundingClientRect(); return Math.abs(a.top - b.top) < 4 && b.left > a.right; });
    check(w + '×' + h + ': Испытание — ' + (w > h ? 'две колонки' : 'одна колонка'), tr === (w > h), String(tr));
    // Приключение: одна тропа — миры друг под другом при любом повороте
    await page.evaluate(() => { showScreen('mode'); openAdventure(); });
    await page.waitForTimeout(400);
    const adv = await page.evaluate(() => { const w = document.querySelectorAll('#advMap .adv-world');
      const a = w[0].getBoundingClientRect(), b = w[1].getBoundingClientRect(); return b.top > a.bottom - 4; });
    check(w + '×' + h + ': Приключение — миры одной тропой', adv, String(adv));
    await page.evaluate(() => showScreen('mode'));
    await page.click('.mode-btn.solo');
    await page.evaluate(() => { document.getElementById('rangeMax').value = '100'; onRangeChange(); });
    await page.click('#tStartMatch');
    await page.evaluate(() => { secret = 63; });
    await page.fill('#guessInput', '50'); await page.click('#tSubmitGuess'); await page.waitForTimeout(300);
    const g = await page.evaluate(() => ({ hs: document.documentElement.scrollWidth > innerWidth + 1, hist: document.querySelectorAll('#historyList > *').length }));
    check(w + '×' + h + ': партия идёт, ход записан', !g.hs && g.hist >= 1, JSON.stringify(g));
    await ctx.close();
  }
  // Компьютер (мышь) — без масштаба
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await applyStub(page, {});
  await page.goto(GAME_URL);
  await page.waitForTimeout(300);
  const z = await page.evaluate(() => getComputedStyle(document.documentElement).zoom);
  check('компьютер: масштаба нет', z === '1' || z === 'normal', z);
  await ctx.close();
}

// Соперники Приключения: у каждого своё правило, у босса — две способности,
// у всех — свои реплики. Каждое правило проверяется на своём моменте
async function testAdvRules(browser) {
  console.log('\nПриключение: у каждого соперника своё правило');
  const page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(() => { localStorage.setItem(advKey(), '50'); BOT_SPEED = 1000; });
  const cast = await page.evaluate(() => ({
    n: ADV_CAST.length, uniq: new Set(ADV_CAST).size, known: ADV_CAST.every(id => !!ADV_RULES[id]),
    texts: ['en', 'ru', 'fr', 'de'].map(l => i18n[l].adv.cast.filter((c, n) => n % 10 === 9
      ? c.a1t && c.a1d && c.a2t && c.a2d && c.hi && c.a1 && c.a2 && c.win && c.lose
      : c.t && c.d && c.hi && c.rule && c.luck && c.worry && c.win && c.lose).length),
    titles: new Set(i18n.ru.adv.cast.filter((c, n) => n % 10 !== 9).map(c => c.t)).size,
    bosses: ADV_CAST.filter((id, n) => n % 10 === 9).every(id => ADV_RULES[id].boss) }));
  check('50 соперников — 50 разных правил, у боссов по две способности', cast.n === 50 && cast.uniq === 50 && cast.known && cast.bosses,
    JSON.stringify(cast));
  check('у всех правила и реплики на 4 языках, названия правил не повторяются', cast.texts.every(k => k === 50) && cast.titles === 45,
    JSON.stringify(cast.texts) + ' ' + cast.titles);

  // Карточка: правило — вместо прежней «особенности»; у босса — две способности
  const card = await page.evaluate(() => {
    localStorage.setItem(advKey(), '9'); openAdventure(); openAdvCard(2);
    const reg = document.getElementById('acQuirk').textContent;
    closeAdvCard(); openAdvCard(9);
    const boss = { text: document.getElementById('acQuirk').textContent, ab: document.querySelectorAll('#acQuirk .ac-ab').length };
    closeAdvCard();
    const badge = document.querySelector('#advMap .adv-tile[data-n="2"] .at-quirk').textContent;
    return { reg, boss, badge };
  });
  check('карточка Енота: «Воришка» и что он делает', /Воришка/.test(card.reg) && /Холодно/.test(card.reg) && card.badge === '🧣', JSON.stringify(card));
  check('карточка Волшебника: «Морок» и «Колдовской шаг»', card.boss.ab === 2 && /Морок/.test(card.boss.text) && /Колдовской шаг/.test(card.boss.text),
    JSON.stringify(card.boss));

  // Помощники в странице: начать бой без раздумий бота, сделать ход с нужным поясом
  await page.evaluate(() => {
    window.__fires = [];
    window.showRuleFlash = (c, title, text) => { window.__fires.push('F ' + title + ' | ' + text); };
    window.botSayText = text => { window.__fires.push('S ' + text); };
    // Бонусы с прямой убираем: случайный бонус под ходом сбил бы счёт «+1 ход»
    window.advTest = (n, s, diff) => {
      quitToMenu(); closeAdvCard(); setAdvDiff(diff || 'normal'); startAdventure(n); stopBot();
      if (s !== undefined) secret = s;
      D.bonuses = [];
      window.__fires = [];
    };
    // Число с нужным поясом k (0 — «Очень холодно», 5 — «Горячо»…): по расстоянию от загаданного
    window.atTier = k => {
      const f = FEEDBACK_META[k];
      for (let d = f.min; d <= f.max; d++) for (const v of [secret - d, secret + d]) {
        if (v >= RANGE_MIN && v <= RANGE_MAX && v !== secret && !history.some(h => h.guess === v)) return v;
      }
      return null;
    };
    window.play = (p, k) => { const v = atTier(k); if (v === null) return; stopBot(); D.cur = p; duelPlay(v); stopBot(); };
  });
  const r = {};
  r.apple = await page.evaluate(() => { advTest(0, 10); const t0 = D.tokens[0]; play(0, 5); const t1 = D.tokens[0];
    play(1, 1); play(0, 6); return { gain: t1 - t0, once: D.tokens[0] === t1, fire: __fires[0] || '' }; });
  check('Ёжик: вам «Горячо» — дарит «+1 ход», раз за раунд', r.apple.gain === 1 && r.apple.once && /яблочко/.test(r.apple.fire), JSON.stringify(r.apple));
  r.thief = await page.evaluate(() => { advTest(2, 15); const a = D.tokens.join(':'); play(0, 0); return { a, b: D.tokens.join(':') }; });
  check('Енот: вам «Холодно» — утаскивает ваш «+1 ход» себе', r.thief.a === '1:1' && r.thief.b === '0:2', JSON.stringify(r.thief));
  r.hop = await page.evaluate(() => { advTest(3, 15); const first = D.cur; play(1, 1); return { first, still: D.cur }; });
  check('Заяц: ходит первым и прыгает два раза подряд', r.hop.first === 1 && r.hop.still === 1, JSON.stringify(r.hop));
  r.specs = await page.evaluate(() => { advTest(4, 14); advRoundStart(); return { me: D.know[0].parity, bot: D.know[1].parity, txt: knowText(0).join() }; });
  check('Барсук: оба знают чётность — у вас она видна у имени', r.specs.me === 0 && r.specs.bot === 0 && /чётное/.test(r.specs.txt), JSON.stringify(r.specs));
  r.shy = await page.evaluate(() => { advTest(5, 10); play(0, 6); return D.skip[1]; });
  check('Оленёнок: вам «Очень горячо» — пропускает ход', r.shy === true);
  r.cloak = await page.evaluate(() => { advTest(6, 10); play(0, 1); play(1, 2); const m = history[history.length - 1];
    const hid = hiddenRow(1, m); play(0, 3); play(1, 3); const second = hiddenRow(1, history[history.length - 1]); return { hid, second }; });
  check('Лис: его первый ход спрятан, второй — виден', r.cloak.hid === true && r.cloak.second === false, JSON.stringify(r.cloak));
  r.sleepy = await page.evaluate(() => { advTest(7, 10); play(0, 1); play(1, 1); const a = D.skip[1]; play(0, 2); play(1, 2); return { a, b: D.skip[1] }; });
  check('Мишка: после второго своего хода засыпает', r.sleepy.a === false && r.sleepy.b === true, JSON.stringify(r.sleepy));
  r.owl = await page.evaluate(() => { advTest(8, 15); advRoundStart(); return { bot: D.know[1].half, me: D.know[0].half || null }; });
  check('Филин: половину знает только он', r.owl.bot === 'high' && r.owl.me === null, JSON.stringify(r.owl));
  r.wizard = await page.evaluate(() => { advTest(9, 10); play(0, 5); const fog = D.fog[0]; play(1, 5); return { fog, again: D.cur, fires: __fires.length }; });
  check('Волшебник: вам «Горячо» — туман; ему «Горячо» — ходит ещё раз', r.wizard.fog === true && r.wizard.again === 1, JSON.stringify(r.wizard));
  r.toucan = await page.evaluate(() => { advTest(10, 30); play(1, 2); const k = D.know[0]; return { gt: k.gt, lt: k.lt, txt: knowText(0).join(), fire: __fires[0] || '' }; });
  check('Тукан: после своего хода проговаривается — «больше/меньше»',
    (r.toucan.gt !== undefined || r.toucan.lt !== undefined) && /больше|меньше/.test(r.toucan.txt) && /Загаданное/.test(r.toucan.fire), JSON.stringify(r.toucan));
  r.chameleon = await page.evaluate(() => { advTest(12, 25); play(1, 1); play(0, 1); play(1, 2);
    const bot = history.filter(h => h.p === 1); return bot.map(h => hiddenRow(1, h)).join(); });
  check('Хамелеон: виден только его последний ход', r.chameleon === 'true,false', r.chameleon);
  r.banana = await page.evaluate(() => { advTest(14, 25); stopBot(); D.cur = 1; duelPlay(40); stopBot(); D.cur = 0; duelPlay(41); return D.skip[0]; });
  check('Мартышка: назвали число рядом с её ходом — пропуск хода', r.banana === true);
  r.snake = await page.evaluate(() => { advTest(15, 25); D.cur = 0; useToken(0); return D.tokens.join(':') + (D.armed ? ' взведён' : ''); });
  check('Змей: вы взяли «+1 ход» — он тоже', r.snake === '0:2 взведён', r.snake);
  r.elephant = await page.evaluate(() => { advTest(18, 25); play(1, 5); return D.skip[0]; });
  check('Слон: ему «Горячо» — вы пропускаете ход', r.elephant === true);
  r.gorilla = await page.evaluate(() => { advTest(19, 25); const tax = D.tokens.join(':'); play(0, 5); return { tax, skip: D.skip[0], frozen: D.frozen[0] }; });
  check('Горилла: налог «+1 ход» в начале раунда, рёв на ваше «Горячо»', r.gorilla.tax === '0:2' && r.gorilla.skip && r.gorilla.frozen, JSON.stringify(r.gorilla));
  r.crab = await page.evaluate(() => { advTest(22, 50); play(0, 5); play(1, 1); play(0, 2); return hiddenRow(0, history[history.length - 1]); });
  check('Краб: после вашего «Горячо» хватает следующий ваш ход', r.crab === true);
  r.frost = await page.evaluate(() => [24, 38, 48].map(n => { advTest(n); return RANGE_MIN + '…' + RANGE_MAX; }).join(' '));
  check('Тюлень, Хрусталь, Вихрик — числа с минусом', r.frost === '-50…50 -100…100 -250…250', r.frost);
  r.turtle = await page.evaluate(() => { advTest(25, 50); applyBonus('fog', 0); applyBonus('freeze', 0); return { fog: D.fog[1], skip: D.skip[1] }; });
  check('Черепаха: туман и заморозка на неё не действуют', r.turtle.fog === false && r.turtle.skip === false, JSON.stringify(r.turtle));
  r.penguin = await page.evaluate(() => { advTest(26); return D.cur; });
  check('Пингвин: ходит первым', r.penguin === 1);
  r.kraken = await page.evaluate(() => { advTest(29, 50); D.cur = 0; useToken(0); const a = { armed: D.armed, t: D.tokens.join(':') };
    D.tokens[0] = 1; useToken(0); return { a, second: D.armed }; });
  check('Кракен: первый ваш «+1 ход» за раунд перехватывает', r.kraken.a.armed === false && r.kraken.a.t === '0:2' && r.kraken.second === true, JSON.stringify(r.kraken));
  r.spark = await page.evaluate(() => { advTest(30, 5); play(0, 0); return D.autoLava[0]; });
  check('Саламандра: вам «Холодно» — следующий ваш ход сделается сам', r.spark === true);
  r.ember = await page.evaluate(() => { advTest(32, 5); D.cur = 1; D.armed = true; advArm(1); play(1, 2); const a = D.cur; play(1, 3); const b = D.cur; play(1, 4); return [a, b, D.cur].join(); });
  check('Лис Огонёк: с «+1 ход» ходит три раза подряд', r.ember === '1,1,0', r.ember);
  r.bat = await page.evaluate(() => { advTest(33, 5); play(1, 1); const far = hiddenRow(1, history[history.length - 1]);
    play(0, 2); play(1, 5); const near = hiddenRow(1, history[history.length - 1]); return { far, near }; });
  check('Мышка: дальние её ходы в темноте, близкие видно', r.bat.far === true && r.bat.near === false, JSON.stringify(r.bat));
  r.phoenix = await page.evaluate(() => { advTest(35, 5); play(1, 0); return D.cur; });
  check('Феникс: «Холодно» — сразу ходит ещё раз', r.phoenix === 1);
  r.beetle = await page.evaluate(() => { advTest(36, 5); const a = D.tokens[1]; play(1, 0); return D.tokens[1] - a; });
  check('Жук: его «Холодно» — ему «+1 ход»', r.beetle === 1);
  r.knight = await page.evaluate(() => { advTest(37); return { traps: bonusSet.trap.length, more: bonusSet.count, base: autoBonusCountFor(rangeCount()), noTok: !!vsBot.adv.R.noTokens }; });
  check('Рыцарь: полезных бонусов втрое больше, ловушек нет, «+1 ход» не берёт',
    r.knight.traps === 0 && r.knight.more === 3 * r.knight.base && r.knight.noTok, JSON.stringify(r.knight));
  r.dragon = await page.evaluate(() => { advTest(39, 5); play(1, 2); play(0, 2); play(1, 3); play(0, 3); play(1, 4); const lava = D.autoLava[0];
    D.tokens[0] = 2; D.autoLava[0] = false; play(1, 6); return { lava, melt: D.tokens[0] }; });
  check('Дракон: третьим ходом — ваш шальной бросок; «Очень горячо» — плавит «+1 ход»', r.dragon.lava === true && r.dragon.melt === 0, JSON.stringify(r.dragon));
  r.robot = await page.evaluate(() => { advTest(40); return vsBot.bot.level; });
  check('Робот: сильнейший', r.robot === 0.98, String(r.robot));
  r.alien = await page.evaluate(() => { advTest(41); return D.tokens.join(':'); });
  check('Зелёныш: дарит «+1 ход» в начале раунда', r.alien === '2:1', r.alien);
  r.moon = await page.evaluate(() => { advTest(43, 100); play(1, 1); play(0, 1); play(1, 2); return history.filter(h => h.p === 1).map(h => hiddenRow(1, h)).join(); });
  check('Лунный зайка: каждый второй его ход спрятан', r.moon === 'false,true', r.moon);
  r.meteor = await page.evaluate(() => { advTest(44, 100); play(0, 1); play(1, 1); play(0, 1); return { next: D.cur, lava: D.autoLava[D.cur] }; });
  check('Фея Звездопад: третий ход — следующий делается сам', r.meteor.lava === true, JSON.stringify(r.meteor));
  r.whale = await page.evaluate(() => { advTest(45, 100); advRoundStart(); return [D.know[0].half, D.know[1].half].join(); });
  check('Кит: оба знают половину', r.whale === 'low,low', r.whale);
  r.eyes = await page.evaluate(() => { advTest(46, 100); advRoundStart(); return [D.know[1].parity === undefined ? '-' : D.know[1].parity, D.know[1].half, D.know[0].half || '-'].join(); });
  r.eyesMine = await page.evaluate(() => D.know[0].parity);
  check('Трёхглазик: сам знает половину, вам говорит чётность', r.eyes === '-,low,-' && r.eyesMine === 0, r.eyes + ' ' + r.eyesMine);
  r.blackhole = await page.evaluate(() => { advTest(48, -240); play(0, 0); return hiddenRow(0, history[history.length - 1]); });
  check('Вихрик: ваш ход «Очень холодно» затягивает', r.blackhole === true);
  r.ufo = await page.evaluate(() => { advTest(49, 100); play(0, 5); const hid = hiddenRow(0, history[history.length - 1]);
    play(1, 1); play(0, 0); stopBot(); D.cur = 1; advBotTurn(); return { hid, double: D.armed }; });
  check('НЛО: похищает ваш «Горячо», после «Холодно» — двойной ход', r.ufo.hid === true && r.ufo.double === true, JSON.stringify(r.ufo));

  // Загаданное число правила не трогают: тот же secret до конца партии
  const same = await page.evaluate(() => {
    let ok = true;
    for (const n of [2, 9, 19, 29, 39, 44, 49]) {
      advTest(n, 17);
      for (let i = 0; i < 6 && !D.roundOver; i++) { play(i % 2, i % 3 ? 1 : 5); if (secret !== 17) ok = false; }
    }
    return ok;
  });
  check('ни одно правило не меняет загаданное число', same);

  // Реплики: «привет» в начале боя, правило — большой карточкой в первый раз
  await page.evaluate(() => { advTest(4); });
  await page.waitForTimeout(2600);
  const lines = await page.evaluate(() => ({ list: window.__fires.slice(), even: D.know[0].parity === 0 }));
  check('Барсук: «привет», потом правило карточкой с ответом',
    /В очках всё видно/.test(lines.list[0] || '') &&
    new RegExp('^F .*Всё видит \\| Скажу честно: число ' + (lines.even ? 'чётное' : 'нечётное') + '!').test(lines.list[1] || ''),
    JSON.stringify(lines));
  const end = await page.evaluate(() => { advTest(0, 10); __fires = []; D.cur = 0; duelPlay(10); return __fires.slice(); });
  check('проиграл — говорит своё «проиграл»', /Ты победил! Держи яблочко/.test(end.join()), JSON.stringify(end));
  // Победный ход правило не трогает: Мишка выиграл вторым ходом — говорит
  // «выиграл», а не про сон, и не засыпает
  const bear = await page.evaluate(() => { advTest(7, 10); play(1, 0); play(0, 0); __fires = []; D.cur = 1; duelPlay(10);
    return { fires: __fires.slice(), skip: D.skip[1], win: i18n.ru.adv.cast[7].win }; });
  check('Мишка выиграл вторым ходом — «выиграл», а не «Соня»', bear.fires.length === 1 && bear.fires[0] === 'S ' + bear.win && !bear.skip,
    JSON.stringify(bear));
  await done(page);

  // Вспышка правила держится 3 с, и бот под ней не ходит: его ход не
  // прячется за карточкой
  {
    const pg = await newGame(browser, { user: 'Максим' });
    await pg.evaluate(() => { localStorage.setItem(advKey(), '50'); setAdvDiff('normal'); });
    await pg.evaluate(() => { startAdventure(2); stopBot(); secret = 17; D.bonuses = []; BOT_SPEED = 1; D.cur = 0; duelPlay(2); });
    await pg.waitForTimeout(2500);
    const mid = await pg.evaluate(() => ({ show: document.getElementById('bonusFlash').classList.contains('show'),
      moves: history.length, ms: BONUS_FX_MS }));
    await pg.waitForTimeout(2600);
    const after = await pg.evaluate(() => ({ show: document.getElementById('bonusFlash').classList.contains('show'), moves: history.length }));
    check('вспышка правила — 3 с, через 2,5 с ещё на экране', mid.ms === 3000 && mid.show, JSON.stringify(mid));
    check('под вспышкой бот ждёт, а после неё ходит', mid.moves === 1 && !after.show && after.moves >= 2, JSON.stringify({ mid, after }));
    await done(pg);
  }

  // Карточка босса длиннее экрана: описание прокручивается, а «В бой!» и
  // «Назад» на виду везде — на iPhone, маленьком iPhone, набок и на iPad
  for (const [w, h] of [[390, 844], [375, 667], [844, 390], [820, 1180], [1180, 820]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const pg = await ctx.newPage();
    await applyStub(pg, { user: 'Максим' });
    await pg.goto(GAME_URL);
    await pg.waitForTimeout(300);
    const r = await pg.evaluate(() => {
      localStorage.setItem(advKey(), '50'); openAdventure(); openAdvCard(39);
      const body = document.getElementById('acBody');
      body.scrollTop = 9999;
      const scrolled = body.scrollTop;
      closeAdvCard(); openAdvCard(2);
      const back = document.getElementById('acBack').getBoundingClientRect(), go = document.getElementById('acGo').getBoundingClientRect();
      const top = body.scrollTop;
      closeAdvCard(); openAdvCard(39);
      const b2 = document.getElementById('acBack').getBoundingClientRect();
      return { bossBack: Math.round(b2.bottom), back: Math.round(back.bottom), go: Math.round(go.top), vh: innerHeight, scrolled, top };
    });
    check(w + '×' + h + ': у босса «В бой!» и «Назад» видны без прокрутки', r.bossBack <= r.vh && r.back <= r.vh && r.go > 0, JSON.stringify(r));
    check(w + '×' + h + ': следующая карточка открывается с начала', r.top === 0, JSON.stringify(r));
    await ctx.close();
  }
}

// Приключение, миры 6–50: герои — записи в ADV_HEROES, тексты — отдельными
// файлами на язык, новый мир открывают босс прошлого и 20 ⭐ в нём, сила — волнами
async function testAdvWorlds(browser) {
  const fs = require('fs'), path = require('path');
  console.log('\nПриключение: новые миры');
  const page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(() => {
    localStorage.setItem(advKey(), String(ADV_TOTAL));
    localStorage.setItem(advStarsKey(), '3'.repeat(ADV_TOTAL));
    BOT_SPEED = 1000;
    window.__fires = [];
    window.showRuleFlash = (c, title, text) => { window.__fires.push('F ' + title + ' | ' + text); };
    window.botSayText = text => { window.__fires.push('S ' + text); };
    window.advTest = (n, s) => {
      quitToMenu(); closeAdvCard(); setAdvDiff('normal'); startAdventure(n); stopBot();
      if (s !== undefined) secret = s;
      D.bonuses = [];
      window.__fires = [];
    };
    window.atTier = k => {
      const f = FEEDBACK_META[k];
      for (let d = f.min; d <= f.max; d++) for (const v of [secret - d, secret + d]) {
        if (v >= RANGE_MIN && v <= RANGE_MAX && v !== secret && !history.some(h => h.guess === v)) return v;
      }
      return null;
    };
    window.play = (p, k) => { const v = atTier(k); if (v === null) return; stopBot(); D.cur = p; duelPlay(v); stopBot(); };
    // Номер героя по его правилу — не зависит от порядка в таблице
    window.heroBy = (when, act) => 50 + ADV_HEROES.findIndex(h => h.on && h.on[0] === when && h.on[1] === act);
  });
  // Тексты миров 6–15 — отдельным файлом: дождаться его
  await page.evaluate(() => advLoadPack());

  // Таблица героев: всё из известного, сочетания не повторяются, портреты на месте
  const data = await page.evaluate(() => {
    const key = on => on[0].split(':')[0];
    const ok = on => Array.isArray(on) && on.length === 3 && (ADV_WHEN[key(on)] || ['start', 'youArm', 'meArm'].includes(key(on))) &&
      !!ADV_ACT[on[1]] && (on[2] === 0 || on[2] === 1);
    const combos = [], bad = [];
    ADV_HEROES.forEach((h, i) => {
      const ons = h.boss ? [h.a1, h.a2] : h.on ? [h.on] : [];
      ons.forEach(on => { if (!ok(on)) bad.push(i + 51); else combos.push(on[0] + '>' + on[1]); });
      if (h.pick) { if (!ADV_PICKS[h.pick]) bad.push(i + 51); combos.push('pick>' + h.pick); }
      if (!ons.length && !h.pick) bad.push(i + 51);
      if (!h.icon || (h.boss && !(h.a1icon && h.a2icon)) || !!h.boss !== (i % 10 === 9)) bad.push(i + 51);
    });
    const art = NAMED_ART.filter(c => /^adv-/.test(c));
    return { worlds: ADV_WORLDS.length, total: ADV_TOTAL, heroes: ADV_HEROES.length, bad, combos: combos.length, uniq: new Set(combos).size,
             bossIcons: ADV_ICONS.slice(5, ADV_WORLDS.length).join(), last: ADV_ICONS[ADV_WORLD_MAX - 1], art: art.length,
             files: art.map(iconFile), rules: new Set(Array.from({ length: ADV_TOTAL }, (_, n) => advChar(n).rule)).size };
  });
  check('миры с шестого: у героев правила — записи из известных «когда» и «что»',
    data.worlds >= 15 && data.total === data.worlds * 10 && data.heroes >= data.total - 50 && [100, 200, 300, 400, 450].indexOf(data.heroes) >= 0 &&
    !data.bad.length && data.rules === data.total, JSON.stringify([data.worlds, data.total, data.heroes, data.bad]));
  check('сочетания «когда → что» у новых героев не повторяются', data.combos === data.uniq, data.combos + ' / ' + data.uniq);
  check('иконки за боссов новых миров — их портреты adv-60, adv-70 …', data.bossIcons === Array.from({ length: data.worlds - 5 }, (_, w) => 'adv-' + (w + 6) * 10).join() &&
    data.last === 'adv-500', data.bossIcons);
  const missing = data.files.filter(f => !fs.existsSync(path.join(__dirname, '..', f)));
  check('портреты всех соперников открытых миров — в icons/', data.art === data.total && !missing.length, missing.slice(0, 5).join());

  // Открытие по звёздам: мир 6 — после босса Космоса и 20 ⭐ в Космосе
  const gate = await page.evaluate(() => {
    const set = (done, stars) => { localStorage.setItem(advKey(), String(done)); localStorage.setItem(advStarsKey(), stars); };
    const space = k => '3'.repeat(40) + '2'.repeat(k) + '1'.repeat(10 - k);   // в Космосе 10 + k ⭐
    const r = {};
    set(50, space(9));
    r.locked = !advWorldOpen(5) && !advOpenN(50) && advCurrentWorld() === 4;
    r.text = advGateText(5);
    openAdventure();
    r.shown = (document.querySelector('#advMap .adv-world[data-w="5"] .aw-gate') || {}).textContent;
    r.cur = String(advCurrentWorld());
    r.next = document.querySelectorAll('#advMap .adv-tile.next').length;
    openAdvCard(50);
    r.btn = document.getElementById('acGo').textContent; r.dis = document.getElementById('acGo').disabled;
    closeAdvCard();
    set(50, space(10));
    r.open = advWorldOpen(5) && advOpenN(50) && advCurrentWorld() === 5;
    set(51, space(0));
    r.started = advWorldOpen(5);
    set(60, '3'.repeat(50) + '1'.repeat(10));
    r.w7 = advGateText(6);
    r.w7locked = !advWorldOpen(6);
    set(40, '3'.repeat(40));
    r.boss = advGateText(5);
    return r;
  });
  check('мир 6 закрыт, пока в Космосе меньше 20 ⭐: на карте и в карточке сказано, сколько нужно',
    gate.locked && gate.text === '🔒 Нужно 20 ⭐ в мире «Космос» — сейчас 19' && gate.shown === gate.text && gate.cur === '4' && gate.next === 0 &&
    gate.btn === gate.text && gate.dis, JSON.stringify(gate));
  check('20 ⭐ — мир 6 открыт; начатый мир не закрывается', gate.open && gate.started, JSON.stringify(gate));
  check('мир 7 ждёт 20 ⭐ на Острове лемуров; без босса — «Откроется после мира»', gate.w7locked &&
    /Остров лемуров/.test(gate.w7) && /сейчас 10/.test(gate.w7) && gate.boss === '🔒 Откроется после мира «Космос»', JSON.stringify(gate));

  // Итог боя с боссом Космоса без нужных звёзд: «Дальше» нет, сказано, чего не хватает
  const after = await page.evaluate(() => {
    localStorage.setItem(advKey(), '49');
    localStorage.setItem(advStarsKey(), '3'.repeat(40) + '1'.repeat(9));
    window.__adventure = 49; window.__advStars = '3'.repeat(40) + '1'.repeat(9);
    setAdvDiff('easy'); startAdventure(49); stopBot();
    D.cur = 0; duelPlay(secret); nextRound(); stopBot(); D.cur = 0; duelPlay(secret);
    const r = { done: advDone(), lines: [...document.querySelectorAll('#resultBox .adv-line')].map(e => e.textContent).join(' | '),
                btns: [...document.querySelectorAll('#resultBox .r-actions button')].map(b => b.textContent) };
    quitToMenu(); setAdvDiff('normal');
    return r;
  });
  check('Космос пройден на 10 ⭐: «Дальше» нет, сказано про 20 ⭐', after.done === 50 && /Нужно 20 ⭐/.test(after.lines) &&
    !after.btns.some(b => /Дальше/.test(b)), JSON.stringify(after));

  // Карта: все миры одной тропой; следующий — в мире, где вы сейчас; внизу — сколько ещё впереди
  const map = await page.evaluate(() => {
    localStorage.setItem(advKey(), '73'); localStorage.setItem(advStarsKey(), '3'.repeat(73));
    openAdventure();
    const r = { worlds: document.querySelectorAll('#advMap .adv-world').length,
      tiles: document.querySelectorAll('#advMap .adv-tile').length,
      done: document.querySelectorAll('#advMap .adv-tile.done').length,
      next: [...document.querySelectorAll('#advMap .adv-tile.next')].map(e => +e.dataset.n).join(),
      nextWorld: +document.querySelector('#advMap .adv-tile.next').closest('.adv-world').dataset.w,
      gates: document.querySelectorAll('#advMap .aw-gate').length,
      soon: (document.querySelector('#advMap .adv-soon') || {}).textContent,
      badge: (document.querySelector('#advMap .adv-tile[data-n="50"] .at-quirk') || {}).textContent,
      ahead: (document.querySelector('#advMap .adv-tile[data-n="80"] .at-quirk') || {}).textContent,
      name: document.querySelector('#advMap .adv-world[data-w="5"] .aw-name').textContent,
      no: document.querySelector('#advMap .adv-world[data-w="5"] .aw-no').textContent,
      line: !!document.querySelector('#advMap .adv-world[data-w="7"] .aw-line path.done') };
    return r;
  });
  check('карта: все миры тропой, пройдено 73, следующий — 74-й в Пустыне, линия до него — цветом мира', map.worlds === data.worlds &&
    map.tiles === data.worlds * 10 && map.done === 73 && map.next === '73' && map.nextWorld === 7 && map.line, JSON.stringify(map));
  check('у пройденного — значок правила, у будущего — нет; шапка мира — номер и имя', map.badge === '🚧' && map.ahead === undefined &&
    map.name === 'Остров лемуров' && map.no === 'Мир 6', JSON.stringify(map));
  check('у закрытых миров — что их откроет; внизу — сколько миров ещё впереди', map.gates === data.worlds - 8 &&
    (data.worlds === 50 ? map.soon === undefined : map.soon === '🌍 Ещё ' + (50 - data.worlds) + ' миров — скоро'),
    JSON.stringify(map));

  // Сила волнами: внутри волны растёт, первый мир волны — передышка
  const wave = await page.evaluate(() => Array.from({ length: 45 }, (_, k) => advWaveBase(k + 5)));
  check('волны: первый мир волны — передышка, внутри волны сильнее, от волны к волне сильнее',
    wave.every((v, k) => k % 5 === 0 ? !k || (v < wave[k - 1] && v > wave[k - 5]) : v > wave[k - 1] || v === 0.9), wave.join(' '));
  const bonus = await page.evaluate(() => Array.from({ length: ADV_WORLDS.length - 5 }, (_, k) => {
    advTest((k + 5) * 10);
    const r = { w: k + 6, has: bonusMode && D.bonuses.length >= 0, min: RANGE_MIN, max: RANGE_MAX,
                field: !!bonusSet && bonusSet.good[0] === ADV_WORLDS[k + 5].bonus };
    quitToMenu();
    return r;
  }));
  const RANGES = ['1..50', '-50..50', '1..150', '1..200', '1..300', '1..100', '1..150', '1..200', '1..300', '1..500',
                  '1..100', '1..150', '-150..150', '1..300', '1..500', '1..150', '1..200', '1..300', '-200..200', '1..500',
                  '1..150', '1..200', '-150..150', '1..400', '1..500', '1..200', '1..300', '-150..150', '1..400', '1..500',
                  '1..200', '1..300', '1..300', '1..400', '-250..250', '1..200', '1..300', '1..400', '1..400', '-250..250',
                  '1..300', '1..300', '1..400', '1..500', '-250..250'];
  check('числа миров с шестого и бонус мира в наборе', bonus.length >= 10 &&
    bonus.map(b => b.min + '..' + b.max).join() === RANGES.slice(0, bonus.length).join() && bonus.every(b => b.has && b.field), JSON.stringify(bonus));

  // Правила новых героев — на настоящей доске
  const r = await page.evaluate(() => {
    const out = {};
    let n = heroBy('youCold', 'skipYou'); advTest(n, 25); play(0, 1);
    out.sticky = { n, skip: D.skip[0], fire: __fires[0] || '' };
    n = heroBy('meHot', 'giveYou'); advTest(n, 25); let t0 = D.tokens[0]; play(1, 5); const t1 = D.tokens[0]; play(0, 1); play(1, 6);
    out.gift = { gain: t1 - t0, once: D.tokens[0] === t1 };
    n = heroBy('youHot', 'double'); advTest(n, 25); play(0, 5); stopBot(); D.cur = 1; advBotTurn();
    out.double = D.armed;
    n = heroBy('youN:1', 'tellParity'); advTest(n, 24); play(0, 1);
    out.parity = { know: D.know[0].parity, fire: __fires.join() };
    n = heroBy('meHot', 'tellDir'); advTest(n, 10); play(1, 5);
    const k = D.know[0];
    out.dir = { gt: k.gt, lt: k.lt, fire: __fires.join(), ok: (k.gt !== undefined && 10 > k.gt) || (k.lt !== undefined && 10 < k.lt) };
    n = heroBy('youArm', 'burn'); advTest(n, 70); D.cur = 0; t0 = D.tokens.join(':'); useToken(0);
    out.burn = { before: t0, after: D.tokens.join(':'), armed: D.armed, fire: !!__fires.length };
    n = heroBy('youArm', 'skipMe'); advTest(n, 50); D.cur = 0; useToken(0);
    out.ant = { armed: D.armed, skip: D.skip[1] };
    n = heroBy('youHot', 'steal'); advTest(n, 100); t0 = D.tokens.join(':'); play(0, 5);
    out.steal = { before: t0, after: D.tokens.join(':') };
    n = heroBy('youWarm', 'memoryYou'); advTest(n, 25); play(0, 3);
    out.memory = D.shortMemory[0];
    n = heroBy('youCloser', 'lavaYou'); advTest(n, 140); play(0, 1); play(1, 1); play(0, 3);
    out.lava = D.autoLava[0];
    n = heroBy('youWarm', 'hide'); advTest(n, 75); play(0, 3);
    out.hide = hiddenRow(0, history[history.length - 1]);
    n = heroBy('youColder', 'fogYou'); advTest(n, 48); play(0, 5); play(1, 1); play(0, 1);
    out.fog = D.fog[0];
    n = heroBy('meN:2', 'giveMe'); advTest(n, 25); t0 = D.tokens[1]; play(1, 1); play(0, 1); play(1, 1);
    out.stash = D.tokens[1] - t0;
    n = heroBy('meN:1', 'again'); advTest(n, 150); play(1, 1);
    out.again = D.cur;
    n = heroBy('youVeryHot', 'freezeYou'); advTest(n, 0); play(0, 6);
    out.freeze = D.skip[0] && D.frozen[0];
    n = heroBy('start', 'tellParity'); advTest(n, 100); advRoundStart();
    out.start = D.know[0].parity;
    n = 50 + ADV_HEROES.findIndex(h => h.first); advTest(n, 50);
    out.first = D.cur;
    n = 50 + ADV_HEROES.findIndex(h => h.pick === 'tens'); advTest(n, 77); D.cur = 1; botMove(); stopBot();
    out.tens = history[0] && history[0].guess % 10;
    // Владыка Фосса: теплеете — забирает ваш «⚡», четвёртым ходом раунда — «⚡» себе
    advTest(59, 25); play(0, 1); play(1, 1); const q1 = D.tokens.join(':'); play(0, 3); const q2 = D.tokens.join(':'); play(1, 1);
    out.queen = [q1, q2, D.tokens.join(':')].join(' ');
    quitToMenu();
    return out;
  });
  check('Жук-жираф: вам «Холодно» — пропускаете ход, правило — карточкой', r.sticky.skip && /^F 🚧 Шлагбаум/.test(r.sticky.fire),
    JSON.stringify(r.sticky));
  check('Лемур Кольцехвост: ему «Горячо» — дарит «⚡», раз за раунд', r.gift.gain === 1 && r.gift.once, JSON.stringify(r.gift));
  check('Сифака: вам «Горячо» — его следующий ход двойной', r.double === true);
  check('Черепаха: после вашего первого хода — чётность словами', r.parity.know === 0 && /[Чч]исло чётное/.test(r.parity.fire), JSON.stringify(r.parity));
  check('Нарвал: ему «Горячо» — больше или меньше его числа, и это правда', r.dir.ok && /(больше|меньше) /.test(r.dir.fire), JSON.stringify(r.dir));
  check('Стегозавр: взвели «⚡» — он лопнул: взвода нет, второй жетон цел', r.burn.before === '1:1' && r.burn.after === '0:1' &&
    !r.burn.armed && r.burn.fire, JSON.stringify(r.burn));
  check('Муравей: взвели «⚡» — он растерялся и пропускает ход, а ваш «⚡» работает', r.ant.armed && r.ant.skip, JSON.stringify(r.ant));
  check('Мопс: вам «Горячо» — ваш «⚡» уходит к нему', r.steal.before === '1:1' && r.steal.after === '0:2', JSON.stringify(r.steal));
  check('Лягушка, Скорпиончик, Песчаная кошка, Песец: память, шальной бросок, скрытый ход, туман', r.memory && r.lava && r.hide && r.fog,
    JSON.stringify([r.memory, r.lava, r.hide, r.fog]));
  check('Мышиный лемур: на втором ходу — «⚡» себе; Колибри: первым ходом ходит ещё раз', r.stash === 1 && r.again === 1, JSON.stringify([r.stash, r.again]));
  check('Горностай: вам «Очень горячо» — заморозка', r.freeze === true);
  check('Звезда: в начале раунда — чётность; Барсук ходит первым; Утка — по круглым', r.start === 0 && r.first === 1 && r.tens === 0,
    JSON.stringify([r.start, r.first, r.tens]));
  check('Владыка Фосса: забирает ваш «⚡», четвёртым ходом раунда берёт себе', r.queen === '1:1 0:2 0:3', r.queen);

  // Новые действия и манеры хода партии 2 — прямо на идущей партии
  const acts = await page.evaluate(() => {
    advTest(50, 25);
    const R = advCtx(), out = {};
    out.blind = [ADV_ACT.blindYou(R) !== false && D.blind[0], ADV_ACT.blindYou(R) === false, ADV_ACT.fogYou(R) === false].join();
    advTest(50, 25); const R2 = advCtx(); R2.fog(0);
    out.blindAfterFog = ADV_ACT.blindYou(R2) === false && !D.blind[0];
    D.tokens = [2, 0]; ADV_ACT.swapTokens(R2); out.swap = D.tokens.join(':');
    D.tokens = [1, 1]; out.swapEqual = ADV_ACT.swapTokens(R2) === false;
    ADV_ACT.giveBoth(R2); out.both = D.tokens.join(':');
    D.tokens = [1, 1]; ADV_ACT.burnMe(R2); out.burnMe = D.tokens.join(':') + ' ' + (ADV_ACT.burnMe(R2) === false);
    ADV_ACT.knowDir(R2, { guess: 10 });
    const cand = botCandidates([], 1, { know: D.know[1] }, false);
    out.knowDir = D.know[1].gt === 10 && !cand.slice(0, 10 - RANGE_MIN + 1).some(Boolean) && cand[25 - RANGE_MIN] === 1;
    // Растёт вверх: ближайшее возможное выше своего прошлого; любит семёрки: число с 7
    advTest(50, 40); D.cur = 1; duelPlay(12); stopBot();
    const c2 = botCandidates(history.map(h => ({ guess: h.guess, labelIndex: h.meta.labelIndex, p: h.p })), 1, {}, false);
    const up = ADV_PICKS.up(advCtx(), c2, 30);
    out.up = up > 12 && c2[up - RANGE_MIN] === 1 && ![...Array(up - 13).keys()].some(i => c2[13 + i - RANGE_MIN]);
    const c3 = new Array(RANGE_MAX - RANGE_MIN + 1).fill(1);
    out.lucky = String(ADV_PICKS.lucky(advCtx(), c3, 30));
    quitToMenu();
    return out;
  });
  check('новые действия: слепота (не вместе с туманом), обмен «⚡», всем по «⚡», свой «⚡» — роняет',
    acts.blind === 'true,true,true' && acts.blindAfterFog && acts.swap === '0:2' && acts.swapEqual && acts.both === '2:2' &&
    acts.burnMe === '1:0 true', JSON.stringify(acts));
  check('сам узнаёт «больше/меньше» — и бот этим пользуется', acts.knowDir === true, JSON.stringify(acts));
  check('манеры хода: «растёт вверх» — ближайшее возможное выше, «любит семёрки» — число с 7', acts.up === true && /7/.test(acts.lucky),
    JSON.stringify(acts));

  // Математика с 36-го мира: делится ли на 3 и на 5, цифра десятков, последняя
  // цифра — по модулю числа (у −47 те же цифры, что у 47). tell… — вам словами,
  // know… — себе, и бот этим пользуется. Медоед не боится заморозки и броска
  const math = await page.evaluate(() => {
    const out = {};
    advTest(60, -47);   // мир 7: числа от −50 до 50
    const R = advCtx();
    out.words = ['tellDiv3', 'tellDiv5', 'tellTens', 'tellUnits'].map(a => ADV_ACT[a](R).k).join(' | ');
    const k0 = D.know[0];
    out.you = [k0.div3, k0.div5, k0.tens, k0.units].join();
    ['knowDiv3', 'knowDiv5', 'knowTens', 'knowUnits'].forEach(a => ADV_ACT[a](R));
    const k1 = D.know[1];
    out.me = [k1.div3, k1.div5, k1.tens, k1.units].join();
    const cand = botCandidates([], 1, { know: D.know[1] }, false);
    out.cand = Array.from(cand).map((c, i) => c ? i + RANGE_MIN : null).filter(v => v !== null).join();
    advTest(60, 30); const R2 = advCtx();
    out.round = ['tellDiv3', 'tellDiv5', 'tellTens', 'tellUnits'].map(a => ADV_ACT[a](R2).k).join(' | ');
    // Медоед: «Заморозка» и «Шальной бросок» на него не действуют, туман — действует
    const badger = 50 + ADV_HEROES.findIndex(h => h.immune && h.immune.indexOf('lava') >= 0);
    out.badgerN = badger;
    if (badger >= 50 && badger < ADV_TOTAL) {
      advTest(badger, 100); applyBonus('freeze', 0); applyBonus('lava', 0); applyBonus('fog', 0);
      out.badger = { skip: D.skip[1], lava: D.autoLava[1], fog: D.fog[1] };
    }
    advTest(50, 25); applyBonus('lava', 0);
    out.plainLava = D.autoLava[1];
    quitToMenu();
    return out;
  });
  check('математика: подсказки словами и по модулю числа (−47 — как 47)',
    math.words === 'не делится на 3 | не делится на 5 | цифра десятков — 4 | последняя цифра — 7' &&
    math.you === 'false,false,4,7' && math.round === 'делится на 3 | делится на 5 | цифра десятков — 3 | последняя цифра — 0',
    JSON.stringify(math));
  check('математика: сам узнал — бот выбирает только из подходящих (−47 и 47)', math.me === 'false,false,4,7' && math.cand === '-47,47',
    JSON.stringify(math));
  check('Медоед: заморозка и шальной бросок не действуют, туман — действует; у других бросок срабатывает',
    !!math.badger && math.badger.skip === false && math.badger.lava === false && math.badger.fog === true && math.plainLava === true,
    JSON.stringify(math));

  // Загаданное число правила не трогают, и ни одно правило не роняет игру
  const same = await page.evaluate(() => {
    let ok = true;
    for (let n = 50; n < ADV_TOTAL; n++) {
      advTest(n, n % 2 ? 17 : 23);
      const s = secret;
      for (let i = 0; i < 8 && !D.roundOver; i++) {
        if (i === 2 && D.tokens[0] > 0) { D.cur = 0; useToken(0); }
        play(i % 2, [1, 5, 3, 0, 6, 2][i % 6]);
        if (secret !== s) ok = false;
      }
    }
    quitToMenu();
    return ok;
  });
  check('герои 51–150: правила не меняют загаданное число', same);

  // Тексты — отдельным файлом на язык: всё на месте, {k} — там, где правило говорит
  const packs = await page.evaluate(async () => {
    const out = [];
    for (const l of ['ru', 'en', 'fr', 'de']) {
      await advLoadPack(l);
      const P = ADV_PACKS[l], bad = [];
      if (!P) { out.push(l + ':нет'); continue; }
      // Тексты могут быть готовы раньше портретов: героев в файле — не меньше, чем открыто
      if (P.worlds.length < ADV_WORLDS.length - 5 || P.worlds.length * 10 !== P.names.length || P.worlds.some(w => !w)) bad.push('worlds');
      if (P.names.length < ADV_TOTAL - 50 || P.names.length > ADV_HEROES.length ||
          new Set(i18n[l].adv.names.concat(P.names)).size !== 50 + P.names.length) bad.push('names');
      if (P.cast.length !== P.names.length) bad.push('cast');
      P.cast.forEach((c, i) => {
        const h = ADV_HEROES[i];
        const keys = h.boss ? ['a1t', 'a1d', 'a2t', 'a2d', 'hi', 'a1', 'a2', 'luck', 'worry', 'win', 'lose'] : ['t', 'd', 'hi', 'rule', 'luck', 'worry', 'win', 'lose'];
        if (keys.some(k => typeof c[k] !== 'string' || !c[k].trim())) bad.push(i + 51);
        (h.boss ? [['a1', h.a1], ['a2', h.a2]] : h.on ? [['rule', h.on]] : []).forEach(([k, on]) => {
          if (/^tell/.test(on[1]) !== c[k].includes('{k}')) bad.push('{k}' + (i + 51));
        });
      });
      out.push(l + ':' + (bad.join(',') || 'ok'));
    }
    return out;
  });
  check('тексты героев 51–150 на 4 языках — полные, имена не повторяются', packs.every(x => /:ok$/.test(x)), packs.join(' '));
  await done(page);

  // Файл текстов грузится, только когда нужен, и только на своём языке
  const de = await newGame(browser, { user: 'Максим', lang: 'de' });
  await de.evaluate(() => { localStorage.setItem(advKey(), '60'); localStorage.setItem(advStarsKey(), '3'.repeat(60)); openAdventure(); });
  // Файл текстов вырос вместе с мирами: ждём сам файл, а не угадываем время
  await de.waitForFunction(() => !!ADV_PACKS.de, null, { timeout: 5000 }).catch(() => {});
  await de.waitForTimeout(200);
  const lazy = await de.evaluate(() => ({ scripts: [...document.querySelectorAll('script[src*="adv-"]')].map(s => s.getAttribute('src')),
    head: document.querySelector('#advMap .adv-world[data-w="5"] .aw-name').textContent,
    card: (openAdvCard(50), document.getElementById('acName').textContent) }));
  check('немецкий: подгружен только js/adv-de.js, мир 6 и герой — по-немецки', lazy.scripts.join() === 'js/adv-de.js' &&
    lazy.head === 'Lemureninsel' && lazy.card === 'Giraffenkäfer Stelze', JSON.stringify(lazy));
  await done(de);
}

// Сложность Приключения — только «⚡ +1 ход»: видно на карте, в карточке
// соперника перед боем и на плашках в бою
async function testAdvDifficulty(browser) {
  console.log('\nПриключение: сложность — это «⚡ +1 ход»');
  const page = await newGame(browser, { user: 'Максим' });
  await page.evaluate(() => { localStorage.setItem(advKey(), '13'); BOT_SPEED = 1000; openAdventure(); });
  await page.waitForTimeout(300);
  // Карточка открытого соперника: те же кнопки сложности и у кого сколько «+1 ход»
  await page.evaluate(() => openAdvCard(13));
  await page.waitForTimeout(150);
  const card = () => page.evaluate(() => ({
    box: !document.getElementById('acDiffBox').classList.contains('hidden'),
    on: (document.querySelector('#acDiff .ad-btn.on') || {}).dataset.diff,
    sides: [...document.querySelectorAll('#acTokens .act-side')].map(e => e.textContent.replace(/\s+/g, ' ').trim()),
    note: (document.querySelector('#acTokens small') || {}).textContent }));
  let c = await card();
  check('карточка: сложность прямо перед боем, «у вас ⚡ · у соперника ⚡»', c.box && c.on === 'normal' &&
    c.sides.join('|') === 'У вас⚡|У соперника⚡' && /два хода подряд/.test(c.note) && /★★$/.test(c.note), JSON.stringify(c));
  await page.click('#acDiff .ad-btn[data-diff="easy"]');
  c = await card();
  check('«Легко» в карточке: у вас ⚡⚡, у соперника — ничего, за победу ★', c.on === 'easy' &&
    c.sides.join('|') === 'У вас⚡⚡|У соперника—' && /★$/.test(c.note), JSON.stringify(c));
  const synced = await page.evaluate(() => ({ stored: localStorage.getItem('hc_adv_diff'),
    map: (document.querySelector('#advDiff .ad-btn.on') || {}).dataset.diff }));
  check('выбор в карточке — тот же, что на карте', synced.stored === 'easy' && synced.map === 'easy', JSON.stringify(synced));
  await page.click('#acDiff .ad-btn[data-diff="hard"]');
  c = await card();
  check('«Трудно»: у вас ничего, у соперника ⚡⚡, за победу ★★★', c.sides.join('|') === 'У вас—|У соперника⚡⚡' && /★★★$/.test(c.note), JSON.stringify(c));
  // «Запасливая» Белка Жёлудь — на один больше
  await page.evaluate(() => { closeAdvCard(); openAdvCard(1); });
  c = await card();
  check('«Запасливая» на «Трудно»: у соперника ⚡⚡⚡', c.sides.join('|') === 'У вас—|У соперника⚡⚡⚡', JSON.stringify(c));
  // Закрытого не сыграть — и сложности в его карточке нет
  await page.evaluate(() => { closeAdvCard(); openAdvCard(30); });
  check('у закрытого соперника сложности нет', !(await card()).box);
  // Бой на «Трудно»: у игрока «Без ⚡», у соперника ×3, раунд за раундом
  await page.evaluate(() => { closeAdvCard(); startAdventure(1); });
  await page.waitForTimeout(300);
  const fight = await page.evaluate(() => { stopBot(); return { tokens: D.tokens.join(':'), mine: document.getElementById('ptoken0').textContent,
    theirs: document.getElementById('ptoken1').textContent, disabled: document.getElementById('ptoken0').disabled }; });
  check('бой на «Трудно»: «Без ⚡» у вас, «⚡ +1 ход ×3» у Белки Жёлудь', fight.tokens === '0:3' && fight.mine === 'Без ⚡' &&
    fight.theirs === '⚡ +1 ход ×3' && fight.disabled, JSON.stringify(fight));
  // Сила одна и та же на любой сложности
  const lv = await page.evaluate(() => { const a = vsBot.bot.level; quitToMenu(); closeAdvCard(); setAdvDiff('easy'); startAdventure(1); stopBot();
    return { hard: a, easy: vsBot.bot.level, tokens: D.tokens.join(':'), mine: document.getElementById('ptoken0').textContent }; });
  check('«Легко»: та же сила соперника, у вас ⚡ ×2, у Белки один', lv.hard === lv.easy && lv.tokens === '2:1' &&
    lv.mine === '⚡ +1 ход ×2', JSON.stringify(lv));
  // Босс — два раунда: «⚡» раздаются заново в каждом
  const boss = await page.evaluate(() => { quitToMenu(); closeAdvCard(); localStorage.setItem(advKey(), '19'); setAdvDiff('hard');
    startAdventure(19); stopBot(); D.tokens[1] = 0; D.cur = 0; duelPlay(secret); nextRound(); stopBot(); return D.tokens.join(':'); });
  check('у босса во втором раунде — снова по сложности (0:2)', boss === '0:2', boss);
  // Длинное имя не сплющивает портрет: многоточие вместо сжатого кружка
  const face = await page.evaluate(() => { quitToMenu(); closeAdvCard(); startAdventure(13); stopBot();
    const r = document.querySelector('#pname1 .p-bot').getBoundingClientRect(), nm = document.querySelector('#pname1 .p-nm');
    return { w: Math.round(r.width), h: Math.round(r.height), cut: getComputedStyle(nm).textOverflow }; });
  check('«Ленивец Колпачок»: портрет 18×18, имя с многоточием', face.w === 18 && face.h === 18 && face.cut === 'ellipsis', JSON.stringify(face));
  // Потратили свой — «⚡ 0», а не «Без ⚡»: длинное «использован» вылезало
  // из узкой карточки игрока на соседнюю
  const spent = await page.evaluate(() => { quitToMenu(); closeAdvCard(); setAdvDiff('normal'); startAdventure(12); stopBot();
    D.cur = 0; useToken(0); duelPlay(secret === RANGE_MIN ? RANGE_MIN + 1 : RANGE_MIN); stopBot();
    return { tokens: D.tokens.join(':'), mine: document.getElementById('ptoken0').textContent }; });
  check('потраченный «+1 ход» — «⚡ 0»', spent.tokens.startsWith('0') && spent.mine === '⚡ 0', JSON.stringify(spent));
  await done(page);
}

async function testScreensEverywhere(browser) {
  console.log('\nЭкраны на всех устройствах: набок, iPad, скорость');
  // Телефон набок и iPad горизонтально: партия в две половины. Раньше поле
  // ввода, закреплённое внизу, закрывало подсказку и прямую
  for (const [w, h] of [[844, 390], [667, 375], [1180, 820]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => check('без ошибок JS', false, e.message));
    await applyStub(page, { user: 'Лев' });
    await page.goto(GAME_URL);
    await page.waitForTimeout(400);
    const tag = w + '×' + h;
    if (h < 500) {
      const tb = await page.evaluate(() => document.getElementById('tabbar').offsetHeight);
      check(tag + ': нижнее меню в одну строку — ниже вдвое', tb > 0 && tb <= 52, tb + 'px');
    }
    await page.click('.mode-btn.solo');
    await page.evaluate(() => { document.getElementById('rangeMax').value = '100'; onRangeChange(); });
    await page.click('#tStartMatch');
    await page.evaluate(() => { secret = 63; });
    await page.fill('#guessInput', '50'); await page.click('#tSubmitGuess'); await page.waitForTimeout(300);
    const g = await page.evaluate(() => {
      const r = el => el.getBoundingClientRect();
      const main = r(document.querySelector('.g-main')), side = r(document.querySelector('.g-side'));
      const fb = r(document.getElementById('feedbackPanel')), inp = r(document.getElementById('guessSection'));
      const line = r(document.getElementById('numLine'));
      const cross = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      return { sideBySide: side.left >= main.right - 1, inputUp: inp.top < innerHeight / 2,
        hidesHint: cross(inp, fb), hidesLine: cross(inp, line), hs: document.documentElement.scrollWidth > innerWidth + 1,
        hist: document.querySelectorAll('#historyList > *').length };
    });
    check(tag + ': партия — слева подсказка, справа поле ввода и ходы', g.sideBySide && g.inputUp && !g.hs && g.hist === 1, JSON.stringify(g));
    check(tag + ': поле ввода не закрывает подсказку и прямую', !g.hidesHint && !g.hidesLine, JSON.stringify(g));
    // Слово подсказки целиком в своей половине
    const fit = await page.evaluate(() => { const l = document.getElementById('feedbackLabel'), p = document.getElementById('feedbackPanel');
      return l.getBoundingClientRect().right <= p.getBoundingClientRect().right + 1; });
    check(tag + ': «горячо/холодно» помещается в карточку', fit);
    await page.evaluate(() => { quitToMenu(); openSetup('duel'); });
    await page.click('#tStartMatch');
    await page.waitForTimeout(300);
    const d = await page.evaluate(() => {
      const p0 = document.getElementById('pcard0').getBoundingClientRect(), p1 = document.getElementById('pcard1').getBoundingClientRect();
      const main = document.querySelector('.g-main').getBoundingClientRect(), side = document.querySelector('.g-side').getBoundingClientRect();
      return { cardsRow: Math.abs(p0.top - p1.top) < 2 && p1.left > p0.right, below: main.top >= p0.bottom - 1 && side.top >= p1.bottom - 1 };
    });
    check(tag + ': дуэль — плашки игроков в ряд над обеими половинами', d.cardsRow && d.below, JSON.stringify(d));
    // «⚡ +1 ход» — под палец: не ниже 36 px (было 28)
    const tok = await page.evaluate(() => document.getElementById('ptoken0').getBoundingClientRect().height / (parseFloat(getComputedStyle(document.documentElement).zoom) || 1));
    check(tag + ': кнопка «+1 ход» не мельче 36 px', tok >= 35.5, tok.toFixed(1));
    await ctx.close();
  }

  // Телефон вертикально — по-старому: поле ввода закреплено внизу экрана
  let page = await newGame(browser, { user: 'Лев' });
  await page.click('#tModeSolo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  const v = await page.evaluate(() => ({ pos: getComputedStyle(document.getElementById('guessSection')).position,
    bottom: Math.round(innerHeight - document.getElementById('guessSection').getBoundingClientRect().bottom),
    halves: getComputedStyle(document.querySelector('.g-main')).display }));
  check('телефон вертикально: поле ввода внизу экрана, одна колонка', v.pos === 'fixed' && v.bottom <= 1 && v.halves === 'contents', JSON.stringify(v));
  // Скорость: QR-код не грузится при запуске, а приходит, когда открыли приглашение
  const qr0 = await page.evaluate(() => typeof qrcode);
  await page.evaluate(() => openInvite());
  await page.waitForTimeout(500);
  const qr1 = await page.evaluate(() => ({ lib: typeof qrcode, svg: !!document.querySelector('#invQr svg') }));
  check('QR-библиотека грузится только для приглашения', qr0 === 'undefined' && qr1.lib === 'function' && qr1.svg, qr0 + ' → ' + JSON.stringify(qr1));
  // Запуск без мелькания заготовки: класс снят после первого экрана
  check('после запуска экран показан (booting снят)', await page.evaluate(() => !document.body.classList.contains('booting')));
  // supabase-js — своей копией из vendor/, а не с CDN
  check('supabase-js подключён из vendor/, не с CDN', await page.evaluate(() =>
    [...document.scripts].some(s => /vendor\/supabase\.js$/.test(s.src)) && ![...document.scripts].some(s => /jsdelivr/.test(s.src))));
  await done(page);

  // Профиль: сетка иконок строится, только когда её открыли
  page = await newGame(browser, { user: 'Лев', profile: { avatar: '🦊', color: '#60a5fa' } });
  await page.evaluate(() => openLogoutModal());
  await page.waitForTimeout(300);
  const av0 = await page.evaluate(() => document.querySelectorAll('#avGrid .av-tile').length);
  await page.evaluate(() => showAvatarPicker(true));
  const av1 = await page.evaluate(() => document.querySelectorAll('#avGrid .av-tile').length);
  check('профиль: сетка иконок — только по нажатию', av0 === 0 && av1 > 20, av0 + ' → ' + av1);
  await done(page);

  // iPad горизонтально: окно профиля выше экрана — прокручивается, верх не за краем
  const ip = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
  page = await ip.newPage();
  await applyStub(page, { user: 'Лев', profile: { avatar: '🦊', color: '#60a5fa' } });
  await page.goto(GAME_URL);
  await page.waitForTimeout(300);
  await page.evaluate(() => openLogoutModal());
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => { const bd = document.getElementById('logoutModal'), c = bd.firstElementChild.getBoundingClientRect();
    return { top: Math.round(c.top), fits: c.bottom <= innerHeight + 1, scroll: bd.scrollHeight > bd.clientHeight + 1 }; });
  check('iPad: окно профиля целиком достаётся (верх на экране, низ — прокруткой)', m.top >= -1 && (m.fits || m.scroll), JSON.stringify(m));
  await ip.close();
}

// iPhone в установленной игре: страница рисуется и под часами с батареей
// (viewport-fit=cover, прозрачная строка состояния), а снизу — полоска «Домой».
// Окна шли от верха на 20 px, и их заголовок оказывался размыт под строкой
// состояния. «Чёлку» задаём как у iPhone с Dynamic Island: 59 px и 34 px
async function testSafeArea(browser) {
  console.log('\niPhone с «чёлкой»: окна не заходят под часы и полоску «Домой»');
  const TOP = 59, BOTTOM = 34;
  const context = await browser.newContext({ viewport: PHONE });
  const page = await context.newPage();
  page.on('pageerror', e => check('без ошибок JS', false, e.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: TOP, bottom: BOTTOM, left: 0, right: 0 } });
  await applyStub(page, { user: 'Максим' });
  await page.goto(GAME_URL);
  await page.waitForTimeout(300);
  // Окна появляются с увеличением — мерить надо уже на месте
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
  // Каждое окно игры — с длинным содержимым, то есть во весь рост: самый тесный случай
  const r = await page.evaluate(([TOP, BOTTOM]) => {
    const bad = [];
    let n = 0;
    document.querySelectorAll('.modal-backdrop').forEach(bd => {
      const card = bd.querySelector(':scope > .modal-card');
      if (!card) { bad.push(bd.id + ': не окно'); return; }
      const was = bd.classList.contains('hidden');
      bd.classList.remove('hidden');
      const fill = document.createElement('div');
      fill.style.height = '3000px';
      card.appendChild(fill);
      const rc = card.getBoundingClientRect();
      n++;
      if (rc.top < TOP + 12 || innerHeight - rc.bottom < BOTTOM + 12) bad.push(bd.id + ' ' + Math.round(rc.top) + '/' + Math.round(innerHeight - rc.bottom));
      fill.remove();
      if (was) bd.classList.add('hidden');
    });
    return { n, bad };
  }, [TOP, BOTTOM]);
  check('ни одно окно не заходит под часы и полоску «Домой», даже во весь рост', r.n >= 20 && !r.bad.length, r.n + ' окон; ' + r.bad.join(', '));
  // Магазин — во всю высоту: верх ниже часов, «Закрыть» выше полоски «Домой»
  await page.evaluate(async () => { window.__wallet = { coins: 100, gems: 0, today: 0, cap: 300 }; await openShop('icon'); });
  await page.waitForTimeout(200);
  const shop = await page.evaluate(() => { const c = document.querySelector('#shopModal > .modal-card').getBoundingClientRect(),
    t = document.getElementById('shopTitle').getBoundingClientRect(), ok = document.getElementById('shopOk').getBoundingClientRect(),
    bd = document.getElementById('shopModal');
    return { top: Math.round(c.top), title: Math.round(t.top), close: Math.round(innerHeight - ok.bottom), scroll: bd.scrollHeight > bd.clientHeight + 1 }; });
  check('магазин: заголовок и кошелёк ниже часов, «Закрыть» выше полоски «Домой», окно не прокручивается целиком',
    shop.top >= TOP + 12 && shop.title >= TOP + 20 && shop.close >= BOTTOM + 12 && !shop.scroll, JSON.stringify(shop));
  await page.evaluate(() => closeShop());
  // Меню, партия и всплывашка достижения — тоже ниже часов
  const top = await page.evaluate(() => ({ head: Math.round(document.querySelector('.header').getBoundingClientRect().top),
    ach: parseFloat(getComputedStyle(document.getElementById('achToast')).top),
    tabbar: parseFloat(getComputedStyle(document.getElementById('tabbar')).paddingBottom) }));
  await page.click('#tModeSolo');
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  const game = await page.evaluate(() => ({ info: Math.round(document.getElementById('infoBar').getBoundingClientRect().top),
    dock: parseFloat(getComputedStyle(document.getElementById('guessSection')).paddingBottom) }));
  check('меню и партия начинаются ниже часов, достижение выезжает под ними, меню и поле ввода — над полоской «Домой»',
    top.head >= TOP && top.ach >= TOP && top.tabbar >= BOTTOM && game.info >= TOP && game.dock >= BOTTOM, JSON.stringify({ top, game }));
  await context.close();
}

async function testAudit(browser) {
  console.log('\nРазбор глазами игрока');

  // Салют — только в той партии, где победили: следующая партия его не повторяет
  let page = await soloGame(browser, 100, 63, [63]);
  const won = await page.evaluate(() => document.querySelectorAll('.confetti').length);
  await page.evaluate(() => {
    window.__cele = 0;
    const orig = celebrate;
    window.celebrate = function (...a) { const r = orig.apply(this, a); if (r) window.__cele++; return r; };
    quitToMenu();
  });
  const leftBits = await page.evaluate(() => document.querySelectorAll('.confetti').length);
  check('ушёл с доски — салют убирается сразу', won > 0 && leftBits === 0, won + ' → ' + leftBits);
  await page.click('#tModeDuel');
  await page.waitForTimeout(150);
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  // Мимо загаданного: попадание честно запустило бы салют этой партии
  await page.fill('#guessInput', String(await page.evaluate(() => secret === 50 ? 51 : 50)));
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(250);
  await liftCurtainIfShown(page);
  // Салют повторялся при выходе из следующей партии: меню перерисовывало старую победу
  await page.evaluate(() => quitToMenu());
  await page.waitForTimeout(150);
  const again = await page.evaluate(() => ({ cele: window.__cele, bits: document.querySelectorAll('.confetti').length }));
  check('победа в тренировке не запускает салют в следующей партии и при выходе из неё', again.cele === 0 && again.bits === 0,
    JSON.stringify(again));
  // Игрок 1 / Игрок 2 — подписи над полями, в самих полях подсказка «Имя», кружки побед без подписи
  await page.evaluate(() => quitToMenu());
  await page.click('#tModeDuel');
  await page.waitForTimeout(150);
  const setup = await page.evaluate(() => ({ ph: [document.getElementById('nameP1').placeholder, document.getElementById('nameP2').placeholder],
    winsLabel: !!document.querySelector('.p-wins-label') }));
  check('в полях имён — подсказка «Имя», а не второй раз «Игрок 1»', setup.ph.join() === 'Имя,Имя' && !setup.winsLabel, JSON.stringify(setup));
  await done(page);

  // Плашка «новая версия» — на языке игрока
  page = await newGame(browser, { lang: 'en' });
  const banner = await page.evaluate(async () => {
    sb.from = () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { app_version: '999' }, error: null }) }) }) });
    await checkRemoteConfig();
    const b = document.getElementById('updateBanner');
    return { shown: !b.classList.contains('hidden'), text: b.textContent };
  });
  check('плашка «новая версия» — на языке игрока', banner.shown && /new version/.test(banner.text) && !/[а-яё]/i.test(banner.text),
    JSON.stringify(banner));
  await done(page);

  // Узкий телефон (360 px), все четыре языка: длинные надписи не вылезают за край
  // и не обрезаются — ни на кнопках вызова, ни в статусах друзей
  for (const lang of ['en', 'ru', 'fr', 'de']) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const q = await ctx.newPage();
    q.on('pageerror', e => check('без ошибок JS', false, e.message));
    await applyStub(q, { user: 'Лев', lang });
    await q.goto(GAME_URL);
    await q.waitForTimeout(300);
    await q.evaluate(() => {
      window.__friends = [{ username: 'Аня', relation: 'friend' }, { username: 'Ося', relation: 'incoming' }];
    });
    await q.click('#friendsBtn');
    await q.waitForTimeout(500);
    await q.evaluate(() => openChallenge('Аня'));
    await q.waitForTimeout(300);
    const m = await q.evaluate(() => {
      const card = document.getElementById('card').getBoundingClientRect();
      const send = document.getElementById('tChSend');
      const btns = [...send.parentElement.children].filter(e => e.tagName === 'BUTTON');
      const cut = el => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
      return { inside: send.getBoundingClientRect().right <= card.right + 0.5,
               wide: document.documentElement.scrollWidth - innerWidth,
               btnCut: btns.filter(cut).map(e => e.textContent),
               statusCut: [...document.querySelectorAll('#friendsList .fr-status')].filter(cut).map(e => e.textContent) };
    });
    check(lang + ', 360 px: кнопки вызова внутри экрана и не обрезаны, статусы друзей целиком',
      m.inside && m.wide <= 0 && !m.btnCut.length && !m.statusCut.length, JSON.stringify(m));
    if (lang === 'de') {
      // Запас на будущее: даже очень длинная надпись переносится внутри кнопки
      const long = await q.evaluate(() => {
        const btn = document.getElementById('tChSend');
        btn.textContent = 'Herausforderung senden an alle Freunde';
        const card = document.getElementById('card').getBoundingClientRect();
        const ghost = document.getElementById('tChCancel');
        return { inside: btn.getBoundingClientRect().right <= card.right + 0.5, wide: document.documentElement.scrollWidth - innerWidth,
                 ghostCut: ghost.scrollWidth > ghost.clientWidth + 1 };
      });
      check('длинная надпись на кнопке переносится, а «Отмена» рядом не сжимается', long.inside && long.wide <= 0 && !long.ghostCut,
        JSON.stringify(long));
    }
    await ctx.close();
  }

  // Бонусов ровно столько, сколько выбрали: «−1000…1000» и 2000 бонусов — все 2000
  page = await newGame(browser);
  await page.click('#tModeDuel');
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '2000');
  await page.check('#frostSetup');
  await page.check('#bonusSetup');
  const opts = await page.evaluate(() => [...document.getElementById('bonusCount').options].map(o => o.value));
  await page.selectOption('#bonusCount', '2000');
  await page.click('#tStartMatch');
  await page.waitForTimeout(300);
  const bon = await page.evaluate(() => ({ min: RANGE_MIN, max: RANGE_MAX, n: D.bonuses.length,
    uniq: new Set(D.bonuses.map(b => b.value)).size, onSecret: D.bonuses.some(b => b.value === secret),
    typed: D.bonuses.every(b => !!b.type), kinds: [...new Set(D.bonuses.map(b => b.type))].sort().join() }));
  check('−1000…1000 и 2000 бонусов — на поле ровно 2000, все на разных числах, кроме загаданного',
    opts.includes('2000') && bon.min === -1000 && bon.max === 1000 && bon.n === 2000 && bon.uniq === 2000 && !bon.onSecret && bon.typed,
    JSON.stringify(bon));
  // С другом — все полезные, и из Приключения тоже: рентген, половина, щит, заморозка, ➗3, ➗5, компас, воришка, зеркало
  check('«Бросок в лаву» убран: среди 2000 бонусов его нет, остальные виды есть (и 9 из Приключения)',
    bon.kinds === 'blind,compass,div3,div5,extra,fog,freeze,gift,half,memory,mirror,shield,skip,thief,xray', bon.kinds);
  await page.evaluate(() => quitToMenu());
  await done(page);

  // Боты нарисованы, как иконки игроков; в имени — без эмодзи зверя
  page = await newGame(browser);
  await page.evaluate(() => openSetup('duel', true));
  await page.waitForTimeout(200);
  const bots = await page.evaluate(() => ({
    drawn: document.querySelectorAll('#botPick .bt-icon svg.icon-art').length,
    names: [...document.querySelectorAll('#botPick .bt-name')].map(e => e.textContent) }));
  check('пять ботов — рисунками в кружках', bots.drawn === 5 && bots.names.join() === 'Черепаха,Панда,Дельфин,Лис,Сова',
    JSON.stringify(bots));
  // Свой ход — «Ваш ход», своя победа — «Вы выиграли», а не своё имя в третьем лице
  await page.selectOption('#rangeMax', '100');
  await page.selectOption('#winsNeeded', '1');
  await page.evaluate(() => { BOT_SPEED = 0; });
  await page.click('#tStartMatch');
  await page.waitForTimeout(400);
  const turn = await page.evaluate(() => document.getElementById('pturn0').textContent);
  await page.evaluate(() => { secret = 77; });
  await page.fill('#guessInput', '77');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(400);
  const fin = await page.evaluate(() => ({ title: document.querySelector('#resultBox .r-title').textContent,
    bot: !!document.querySelector('#pname1 .p-bot svg.icon-art') }));
  check('свой ход — «Ваш ход»', turn === 'Ваш ход', turn);
  check('своя победа — «Вы выиграли игру!», у бота — рисунок вместо точки', /Вы выиграли игру!/.test(fin.title) && fin.bot,
    JSON.stringify(fin));
  await page.evaluate(() => { BOT_SPEED = 1000; quitToMenu(); });
  await done(page);

  // Профиль: карандаш на кружке — рисунком; чат: только дружеская игра
  page = await newGame(browser, { user: 'Лев', profile: {} });
  await page.click('#accountChip');
  await page.waitForTimeout(400);
  const pencil = await page.evaluate(() => {
    const st = getComputedStyle(document.getElementById('pfAvatar'), '::after');
    return { content: st.content, img: /svg/.test(st.backgroundImage) };
  });
  check('карандаш на кружке профиля — рисунком, а не знаком ✎', pencil.content === '""' && pencil.img, JSON.stringify(pencil));
  await page.click('#tProfileDone');
  await page.evaluate(() => { window.__friends = [{ username: 'Аня', relation: 'friend' }]; openChat('Аня'); });
  await page.waitForTimeout(500);
  const chat = await page.evaluate(() => ({ friendly: document.getElementById('tChatFriendly').textContent,
    ranked: !!document.getElementById('chatModesFold') || !!document.querySelector('#screenChat .rk-mode') }));
  check('в переписке — только «Дружеская игра», режимов на звёзды нет', chat.friendly === 'Дружеская игра' && !chat.ranked,
    JSON.stringify(chat));
  await done(page);

  // Переводы: в английском кавычки свои, французский — на «tu», немецкий — на «du»,
  // жетон везде называется одинаково
  page = await newGame(browser);
  const tone = await page.evaluate(() => {
    const flat = (o, out = []) => {
      for (const k in o) {
        const v = o[k];
        if (typeof v === 'string') out.push(v);
        else if (Array.isArray(v)) v.forEach(x => { if (typeof x === 'string') out.push(x); });
        else if (v && typeof v === 'object') flat(v, out);
      }
      return out;
    };
    return {
      en: flat(i18n.en).filter(s => /[«»]/.test(s)),
      fr: flat(i18n.fr).filter(s => /\b(votre|vos|Votre|Vos)\b|\+1 tour|Jouer classé/.test(s) ||
        (s.match(/\b[a-zé]+ez\b/g) || []).some(w => w !== 'chez' && w !== 'assez')),
      // «Ihr seid jetzt Freunde» — «вы оба» на «ты», это правильно; вежливое — Sie/Ihre/Ihnen
      de: flat(i18n.de).filter(s => /\b(Sie|Ihre|Ihren|Ihnen)\b|Jeton|Um Punkte|Gewertet/.test(s)),
      ru: flat(i18n.ru).filter(s => /\((л?а)\)/.test(s)) };
  });
  check('английский: без «ёлочек»', tone.en.length === 0, tone.en.join(' | '));
  check('французский: на «tu», жетон называется одинаково', tone.fr.length === 0, tone.fr.join(' | '));
  check('немецкий: на «du», жетон — «Marke»', tone.de.length === 0, tone.de.join(' | '));
  check('русский: без «пришёл(ла)»', tone.ru.length === 0, tone.ru.join(' | '));
  await done(page);
}


// Старый PIN из 4 цифр — профиль предлагает сменить на 6
async function testPinShort(browser) {
  console.log('\nPIN из 4 цифр — предложение сменить');
  const page = await newGame(browser, { user: 'Лев', profile: {} });
  await page.click('#accountChip');
  await page.waitForTimeout(300);
  const warn = () => page.evaluate(() => {
    const el = document.getElementById('pfPinShort');
    return el.classList.contains('hidden') ? '' : el.textContent;
  });
  check('в профиле: «PIN из 4 цифр — смените на 6»', (await warn()) === '🔒 У вас PIN из 4 цифр — смените на 6, так гораздо надёжнее',
    await warn());
  await page.evaluate(() => { localStorage.setItem('hc_run_pin', '123456'); fillProfile(); });
  check('PIN из 6 цифр — предложения нет', (await warn()) === '');
  await page.context().close();
}

async function testPolish(browser) {
  console.log('\nПолировка');
  let page = await newGame(browser);
  // Жетон — первым ходом раунда тоже
  await page.click('.mode-btn.duel');
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  await page.evaluate(() => { secret = 77; renderAll(); });
  const tok0 = await page.evaluate(() => document.getElementById('ptoken0').disabled);
  await page.click('#ptoken0');
  await page.fill('#guessInput', '1');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(150);
  await liftCurtainIfShown(page);
  const tok = await page.evaluate(() => ({ cur: D.cur, armed: D.armed, tokens: D.tokens.slice(), n: history.length }));
  check('жетон доступен и первым ходом раунда', tok0 === false, String(tok0));
  check('первым ходом с жетоном — два хода подряд', tok.cur === 0 && !tok.armed && tok.tokens[0] === 0 && tok.n === 1,
    JSON.stringify(tok));
  await page.evaluate(() => quitToMenu());

  // Настройка: пояснения к галочкам и «Играем до» рядом с форой
  await page.click('.mode-btn.duel');
  await page.waitForTimeout(150);
  const setup = await page.evaluate(() => {
    const w = document.querySelector('.chips-winsNeeded').getBoundingClientRect();
    const h = document.querySelector('.chips-handicap').getBoundingClientRect();
    return { frost: document.getElementById('tFrostHint').textContent, bonus: document.getElementById('tBonusHint').textContent,
             wins: document.getElementById('tLblWins').textContent, stacked: h.top > w.bottom && w.width > 300 };
  });
  check('у «Мороза» и «Бонусов» — пояснение одной строкой',
    /отрицательные/.test(setup.frost) && /сюрпризы/.test(setup.bonus), JSON.stringify(setup));
  // Кнопкам нужна вся ширина: «Играем до» и «Фора» — друг под другом
  check('«Играем до» и «Фора» — друг под другом, кнопками на всю ширину', setup.stacked && setup.wins === 'Играем до', JSON.stringify(setup));
  await page.evaluate(() => quitToMenu());

  // Тренировка: надписи над полем нет, история не обрезается
  await page.click('.mode-btn.solo');
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  await page.evaluate(() => { secret = 63; });
  for (const g of [50, 75, 60, 62]) {
    await page.fill('#guessInput', String(g));
    await page.click('#tSubmitGuess');
    await page.waitForTimeout(100);
    await liftCurtainIfShown(page);
  }
  const hist = await page.evaluate(() => {
    const list = document.getElementById('historyList');
    const lb = list.getBoundingClientRect();
    const rows = [...list.querySelectorAll('.history-item')];
    return { label: !!document.getElementById('tEnterGuess'), rows: rows.length,
             whole: rows.every(r => r.getBoundingClientRect().bottom <= lb.bottom + 1),
             scroll: list.scrollHeight > list.clientHeight + 1 };
  });
  check('над полем ввода нет лишней надписи', !hist.label);
  check('история: все видимые ходы целиком, без прокрутки внутри', hist.rows === 4 && hist.whole && !hist.scroll,
    JSON.stringify(hist));

  // Салют: один раз на победу, и не у того, кто просил меньше движения
  await page.fill('#guessInput', '63');
  await page.click('#tSubmitGuess');
  await page.waitForTimeout(150);
  await liftCurtainIfShown(page);
  const party = await page.evaluate(() => {
    const first = document.querySelectorAll('.confetti').length;
    renderAll(); renderAll();
    return { first, again: document.querySelectorAll('.confetti').length,
             rec: !!document.querySelector('#resultBox .r-newrec.r-pop') };
  });
  check('победа — салют, повторная отрисовка его не повторяет', party.first === 1 && party.again === 1, JSON.stringify(party));
  check('новый рекорд подпрыгивает', party.rec);
  await page.waitForTimeout(1900);
  check('салют исчезает сам', await page.evaluate(() => document.querySelectorAll('.confetti').length === 0));
  await done(page);

  page = await newGame(browser);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.click('.mode-btn.solo');
  await page.waitForTimeout(150);
  await page.click('#tStartMatch');
  await page.waitForTimeout(200);
  await page.evaluate(() => { secret = RANGE_MIN; });
  await page.evaluate(() => { document.getElementById('guessInput').value = String(RANGE_MIN); handleGuess(); });
  await page.waitForTimeout(150);
  check('кто просил меньше движения — без салюта', await page.evaluate(() =>
    gameOverType === 'win' && document.querySelectorAll('.confetti').length === 0));
  await done(page);

  // С ботом: салют только за свою победу
  page = await newGame(browser);
  await page.evaluate(() => openSetup('duel', true));
  await page.waitForTimeout(150);
  await page.selectOption('#rangeMax', '100');
  await page.evaluate(() => { BOT_SPEED = 1000; });
  await page.click('#tStartMatch');
  await page.waitForTimeout(250);
  const botWin = await page.evaluate(() => {
    stopBot();
    D.cur = 1; secret = 40;
    duelPlay(40);
    return { over: D.roundOver, winner: D.roundWinner, confetti: document.querySelectorAll('.confetti').length };
  });
  check('выиграл бот — салюта нет', botWin.over && botWin.winner === 1 && botWin.confetti === 0, JSON.stringify(botWin));
  await done(page);

  // Профиль: без «Ваш аккаунт»; «Показать PIN», имя и PIN — под одной строкой,
  // редкое — под «Ещё»
  page = await newGame(browser, { user: 'Лев' });
  await page.click('#accountChip');
  await page.waitForTimeout(400);
  const pf = await page.evaluate(() => ({
    sub: document.getElementById('tAccountTitle').textContent,
    pin: document.getElementById('tShowPin').checkVisibility(),
    fold: document.getElementById('pfEditFold').open,
    rename: document.getElementById('tRenameStart').checkVisibility(),
    head: document.getElementById('tNamePinHead').textContent,
    more: document.getElementById('tMoreHead').textContent,
    rare: ['tTutReplay', 'tDeleteAccount'].map(id => document.getElementById(id).checkVisibility()) }));
  check('профиль: PIN, имя и их смена свёрнуты под «Имя и PIN»',
    pf.sub === '' && !pf.pin && !pf.fold && !pf.rename && pf.head === 'Имя и PIN', JSON.stringify(pf));
  check('обучение заново и удаление аккаунта — под «Ещё»', pf.more === 'Ещё' && !pf.rare.some(Boolean), JSON.stringify(pf));
  await page.click('#tNamePinHead');
  await page.waitForTimeout(150);
  check('строка «Имя и PIN» раскрывает «Показать PIN» и обе кнопки', await page.evaluate(() =>
    document.getElementById('tShowPin').checkVisibility() &&
    document.getElementById('tRenameStart').checkVisibility() && document.getElementById('tPinStart').checkVisibility()));
  await page.click('#tMoreHead');
  await page.waitForTimeout(150);
  check('«Ещё» раскрывает заблокированных, обучение и удаление', await page.evaluate(() =>
    ['pfBlockedFold', 'tTutReplay', 'tDeleteAccount'].every(id => document.getElementById(id).checkVisibility())));
  await page.click('#tProfileDone');
  await page.click('#accountChip');
  await page.waitForTimeout(300);
  check('при новом открытии — снова свёрнуто', await page.evaluate(() => !document.getElementById('pfEditFold').open));
  await done(page);
}

// ------------------------------------------ профиль: иконка, имя, PIN
async function testProfile(browser) {
  console.log('\nПрофиль: иконка, имя, PIN');

  // Своя иконка приходит с сервера и стоит в шапке вместо буквы
  let page = await newGame(browser, { user: 'Максим', profile: { avatar: '🦊' } });
  await page.waitForTimeout(300);
  const head = await page.evaluate(() => document.getElementById('accountChipName').textContent.trim());
  check('своя иконка в шапке вместо буквы', head === '🦊', head);

  // Сетка иконок свёрнута: кто не меняет иконку, тому она не занимает окно
  await page.click('#accountChip');
  await page.waitForTimeout(300);
  const folded = await page.evaluate(() => ({
    grid: !document.getElementById('avGrid').classList.contains('hidden'),
    btn: !document.getElementById('pfAvatarBox').classList.contains('hidden') &&
         document.getElementById('tAvatarStart').textContent,
    pen: document.getElementById('pfAvatar').classList.contains('editable')
  }));
  check('сетка иконок при открытии профиля свёрнута', !folded.grid, JSON.stringify(folded));
  check('на её месте кнопка «Иконка и цвет», на кружке карандаш',
    folded.btn === 'Иконка и цвет' && folded.pen, JSON.stringify(folded));

  // Нажатие на большой кружок раскрывает сетку, повторное — сворачивает
  await page.click('#pfAvatar');
  await page.waitForTimeout(150);
  const byFace = await page.locator('#avGrid').isVisible();
  await page.click('#pfAvatar');
  await page.waitForTimeout(150);
  const byFaceAgain = await page.locator('#avGrid').isVisible();
  check('кружок открывает и закрывает выбор', byFace && !byFaceAgain, byFace + ' ' + byFaceAgain);

  // Выбор иконки: буква и 40 иконок, выбранная отмечена
  await page.click('#pfAvatar');
  await page.waitForTimeout(150);
  const grid = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('#avGrid .av-tile')];
    return { n: tiles.length, first: tiles[0].textContent, firstLetter: tiles[0].classList.contains('letter'),
             sel: tiles.filter(t => t.classList.contains('sel')).map(t => t.dataset.icon) };
  });
  const nWb = await page.evaluate(() => ADV_WORLDS.length);
  check('в профиле буква, 40 иконок и иконки боссов', grid.n === 41 + nWb && grid.firstLetter && grid.first === 'М',
    JSON.stringify(grid));
  check('выбранная иконка отмечена', grid.sel.join() === '🦊', grid.sel.join());

  await page.click('#avGrid .av-tile[data-icon="🐼"]');
  await page.waitForTimeout(300);
  const picked = await page.evaluate(() => ({
    sent: (window.__profile.calls.filter(c => c.name === 'set_avatar').pop() || {}).args,
    head: document.getElementById('accountChipName').textContent.trim(),
    big: document.getElementById('pfAvatar').textContent.trim()
  }));
  check('выбор уходит на сервер', picked.sent && picked.sent.p_avatar === '🐼', JSON.stringify(picked.sent));
  check('и сразу виден в шапке и в профиле', picked.head === '🐼' && picked.big === '🐼', JSON.stringify(picked));
  check('после выбора сетка сворачивается', !(await page.locator('#avGrid').isVisible()));

  await page.click('#pfAvatar');
  await page.waitForTimeout(150);
  await page.click('#avGrid .av-tile.letter');
  await page.waitForTimeout(300);
  const back = await page.evaluate(() => ({
    sent: (window.__profile.calls.filter(c => c.name === 'set_avatar').pop() || {}).args,
    head: document.getElementById('accountChipName').textContent.trim()
  }));
  check('к букве можно вернуться', back.sent && back.sent.p_avatar === null && back.head === 'М', JSON.stringify(back));

  // Клетки выбора — не меньше 44px: мельче детскому пальцу попадать неудобно
  await page.click('#pfAvatar');
  await page.waitForTimeout(150);
  const tile = await page.evaluate(() => {
    const r = document.querySelector('#avGrid .av-tile').getBoundingClientRect();
    const tops = new Set([...document.querySelectorAll('#avGrid .av-tile')].map(t => Math.round(t.getBoundingClientRect().top)));
    return { w: r.width, h: r.height, rows: tops.size };
  });
  check('клетки иконок крупные, по пять в ряд', tile.w >= 44 && tile.h >= 44 && tile.rows === Math.ceil((41 + nWb) / 5),
    JSON.stringify(tile));

  // Закрыл профиль с раскрытой сеткой — в следующий раз она снова свёрнута
  await page.click('#tProfileDone');
  await page.click('#accountChip');
  await page.waitForTimeout(300);
  check('при новом открытии профиля сетка снова свёрнута', !(await page.locator('#avGrid').isVisible()));

  // Смена имени
  await page.evaluate(() => { document.getElementById('pfEditFold').open = true; });
  await page.click('#tRenameStart');
  await page.waitForTimeout(150);
  check('поле нового имени заполнено текущим',
    (await page.inputValue('#renameInput')) === 'Максим');
  check('пока открыта форма, «Готово» не спорит с «Сохранить»',
    !(await page.locator('#tProfileDone').isVisible()));
  await page.fill('#renameInput', '#77');
  await page.click('#tRenameSave');
  await page.waitForTimeout(200);
  const bad = await page.evaluate(() => ({
    note: document.getElementById('renameNote').textContent,
    calls: window.__profile.calls.filter(c => c.name === 'rename_student').length
  }));
  check('имя на «#» не уходит на сервер', bad.calls === 0 && bad.note.indexOf('от 2 до 20') >= 0, bad.note);

  await page.evaluate(() => { window.__rpcError = { name: 'rename_student', message: 'rename_too_soon:5' }; });
  await page.fill('#renameInput', 'Максимус');
  await page.click('#tRenameSave');
  await page.waitForTimeout(250);
  const soon = await page.evaluate(() => document.getElementById('renameNote').textContent);
  check('второй раз за сутки — сказано, сколько ждать', soon.indexOf('раз в сутки') >= 0 && soon.indexOf('5 ч') >= 0, soon);
  check('и из аккаунта не выбросило', await page.evaluate(() => !!localStorage.getItem('hc_run_user')));

  await page.evaluate(() => { window.__rpcError = { name: 'rename_student', message: 'name_taken' }; });
  await page.click('#tRenameSave');
  await page.waitForTimeout(250);
  const taken = await page.evaluate(() => document.getElementById('renameNote').textContent);
  check('занятое имя — так и сказано', taken.indexOf('уже занято') >= 0, taken);

  await page.evaluate(() => { window.__rpcError = null; });
  await page.click('#tRenameSave');
  await page.waitForTimeout(300);
  const renamed = await page.evaluate(() => ({
    user: localStorage.getItem('hc_run_user'),
    note: document.getElementById('renameNote').textContent,
    name: document.getElementById('accountName').textContent,
    head: document.getElementById('accountChipName').textContent.trim()
  }));
  check('после смены имени вход идёт под новым', renamed.user === 'Максимус', renamed.user);
  check('в профиле новое имя и «Имя изменено»',
    renamed.name === 'Максимус' && renamed.note.indexOf('Имя изменено') >= 0, JSON.stringify(renamed));

  // Раньше суток форму даже не открываем — сразу говорим, сколько ждать
  await page.evaluate(() => { document.getElementById('pfEditFold').open = true; });
  await page.click('#tRenameStart');
  await page.waitForTimeout(150);
  const again = await page.evaluate(() => ({
    open: !document.getElementById('renameBox').classList.contains('hidden'),
    note: document.getElementById('renameNote').textContent
  }));
  check('сменить имя снова сразу нельзя — и видно почему', !again.open && again.note.indexOf('24 ч') >= 0,
    JSON.stringify(again));

  // Смена PIN: по текущему PIN, набранному руками
  await page.evaluate(() => { document.getElementById('pfEditFold').open = true; });
  await page.click('#tPinStart');
  await page.waitForTimeout(150);
  await page.fill('#pinOld', '0000');
  await page.fill('#pinNew', '567890');
  await page.click('#tPinSave');
  await page.waitForTimeout(300);
  const wrong = await page.evaluate(() => ({
    note: document.getElementById('pinNote').textContent,
    pin: localStorage.getItem('hc_run_pin'), user: localStorage.getItem('hc_run_user')
  }));
  check('неверный текущий PIN — сказано, PIN не сменился', wrong.note.indexOf('Неверный текущий PIN') >= 0 &&
    wrong.pin === '1234', JSON.stringify(wrong));
  check('опечатка в текущем PIN не выбрасывает из аккаунта', wrong.user === 'Максимус');

  await page.fill('#pinOld', '1234');
  await page.fill('#pinNew', '56');
  await page.click('#tPinSave');
  await page.waitForTimeout(150);
  check('короткий новый PIN не уходит на сервер',
    await page.evaluate(() => window.__profile.calls.filter(c => c.name === 'change_pin').length === 1));
  // Новый PIN — 6 цифр; 4 цифры тоже не уходят
  await page.fill('#pinNew', '5678');
  await page.click('#tPinSave');
  await page.waitForTimeout(150);
  check('новый PIN из 4 цифр тоже не уходит — нужно 6',
    await page.evaluate(() => window.__profile.calls.filter(c => c.name === 'change_pin').length === 1 &&
      document.getElementById('pinNote').textContent === 'PIN — ровно 6 цифр'));

  await page.fill('#pinNew', '567890');
  await page.click('#tPinSave');
  await page.waitForTimeout(300);
  const pinOk = await page.evaluate(() => ({
    note: document.getElementById('pinNote').textContent,
    pin: localStorage.getItem('hc_run_pin'), hint: window.__profile.hint
  }));
  check('новый PIN сохранён на устройстве', pinOk.pin === '567890', pinOk.pin);
  check('форма закрылась — «Готово» снова на месте', await page.locator('#tProfileDone').isVisible());
  check('и сказано, что старая подсказка удалена', pinOk.note.indexOf('Старая подсказка удалена') >= 0 &&
    pinOk.hint === null, JSON.stringify(pinOk));

  await page.evaluate(() => { document.getElementById('pfEditFold').open = true; });
  await page.click('#tPinStart');
  await page.fill('#pinOld', '567890');
  await page.fill('#pinNew', '432100');
  await page.fill('#pinHintNew', 'год кота');
  await page.click('#tPinSave');
  await page.waitForTimeout(300);
  const withHint = await page.evaluate(() => ({ note: document.getElementById('pinNote').textContent,
                                                hint: window.__profile.hint }));
  check('новая подсказка уходит вместе с PIN', withHint.hint === 'год кота' &&
    withHint.note.indexOf('новая подсказка сохранена') >= 0, JSON.stringify(withHint));
  await done(page);

  // Иконки друзей видны в списке, у кого иконки нет — буква
  page = await newGame(browser, { user: 'Лев', profile: { avatars: { 'Аня': '🐼' } } });
  await page.evaluate(() => {
    window.__friends = [{ username: 'Кира', relation: 'friend' }, { username: 'Аня', relation: 'friend' }];
  });
  await page.click('#friendsBtn');
  await page.waitForTimeout(600);
  const faces = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('#friendsList .friend-row')].map(r => [r.dataset.name, r.querySelector('.avatar').textContent])));
  check('у друга с иконкой — иконка', faces['Аня'] === '🐼', JSON.stringify(faces));
  check('у друга без иконки — буква', faces['Кира'] === 'К', JSON.stringify(faces));
  await done(page);

  // Сервер без миграции профиля: новых кнопок нет, ничего не ломается
  page = await newGame(browser, { user: 'Лев', profile: { unsupported: true } });
  await page.click('#accountChip');
  await page.waitForTimeout(400);
  const old = await page.evaluate(() => ({
    grid: !document.getElementById('pfAvatarBox').classList.contains('hidden'),
    edit: !document.getElementById('pfEdit').classList.contains('hidden'),
    head: document.getElementById('accountChipName').textContent.trim(),
    user: localStorage.getItem('hc_run_user')
  }));
  check('без миграции иконок и смены имени нет', !old.grid && !old.edit, JSON.stringify(old));
  check('а буква и вход на месте', old.head === 'Л' && old.user === 'Лев', JSON.stringify(old));
  await done(page);

  // Имя или PIN сменили на другом устройстве: это устройство выходит сразу,
  // а не стучится со старым PIN, запирая хозяину аккаунт
  page = await newGame(browser, { user: 'Лев' });
  const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
  await page.evaluate(() => { window.__rpcError = { name: 'list_friends', message: 'auth_failed' }; });
  await page.click('#friendsBtn');
  await page.waitForTimeout(600);
  const out = await page.evaluate(() => ({
    user: localStorage.getItem('hc_run_user'),
    menu: !document.getElementById('screenMode').classList.contains('hidden')
  }));
  check('чужой PIN на устройстве — выход, а не повторы', out.user === null && out.menu, JSON.stringify(out));
  check('и сказано почему', dialogs.some(m => m.indexOf('другом устройстве') >= 0), dialogs.join(' | '));
  const lists = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'list_friends').length);
  await page.waitForTimeout(11000);
  const listsLater = await page.evaluate(() => window.__rpcCalls.filter(c => c.name === 'list_friends').length);
  check('опрос после выхода остановлен', listsLater === lists, lists + ' → ' + listsLater);
  await done(page);

  // Имя освободилось и его занял другой с тем же PIN: по дате создания видно подмену
  // Сообщение всплывает при самом запуске — слушать надо до загрузки страницы
  const ctx2 = await browser.newContext({ viewport: PHONE });
  page = await ctx2.newPage();
  const dialogs2 = [];
  page.on('dialog', d => { dialogs2.push(d.message()); d.accept(); });
  page.on('pageerror', e => check('без ошибок JS', false, e.message));
  await applyStub(page, { user: 'Лев', profile: { since: '2026-05-05T00:00:00+00:00' } });
  await page.addInitScript(() => localStorage.setItem('hc_run_since', '2026-01-01T00:00:00+00:00'));
  await page.goto(GAME_URL);
  await page.waitForTimeout(600);
  check('чужой аккаунт под тем же именем — выход с объяснением',
    (await page.evaluate(() => localStorage.getItem('hc_run_user'))) === null &&
    dialogs2.some(m => m.indexOf('у другого игрока') >= 0), dialogs2.join(' | '));
  await done(page);

  // Первый запуск после обновления: дату создания запоминаем, из аккаунта не выбрасываем
  page = await newGame(browser, { user: 'Лев' });
  await page.waitForTimeout(500);
  const first = await page.evaluate(() => ({ since: localStorage.getItem('hc_run_since'),
                                             user: localStorage.getItem('hc_run_user') }));
  check('дата создания запомнена при первом запуске',
    first.since === '2026-01-01T00:00:00+00:00' && first.user === 'Лев', JSON.stringify(first));
  await done(page);
}

// ------------------------------------------ страница создания ключей VAPID
async function testKeyPage(browser) {
  console.log('\nСтраница ключей');

  const context = await browser.newContext({ viewport: PHONE });
  const page = await context.newPage();
  page.on('pageerror', e => check('без ошибок JS на странице ключей', false, e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '..', 'push', 'keys.html'));
  await page.waitForTimeout(300);

  check('до нажатия ключей не показывают',
    await page.evaluate(() => document.getElementById('out').classList.contains('hidden')));

  await page.click('#go');
  await page.waitForTimeout(700);
  const keys = await page.evaluate(() => ({
    pub: document.getElementById('pub').textContent,
    priv: document.getElementById('priv').textContent,
    sql: document.getElementById('sql').textContent,
    shown: !document.getElementById('out').classList.contains('hidden')
  }));
  const decode = s => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  check('ключи появились', keys.shown);
  // Открытый ключ VAPID — несжатая точка на P-256: 65 байт, первый 0x04
  const pub = decode(keys.pub);
  check('открытый ключ нужной длины и вида',
    pub.length === 65 && pub[0] === 4, pub.length + ' байт, первый ' + pub[0]);
  check('закрытый ключ — тридцать два байта',
    decode(keys.priv).length === 32, decode(keys.priv).length + ' байт');
  check('оба в base64url, без символов, ломающих ссылки',
    !/[=+/]/.test(keys.pub) && !/[=+/]/.test(keys.priv), keys.pub.slice(-4));
  check('готовая строка для базы содержит открытый ключ',
    keys.sql.indexOf(keys.pub) > 0 && keys.sql.indexOf('vapid_public') > 0, keys.sql.slice(0, 50));
  check('закрытый ключ в эту строку не попал', keys.sql.indexOf(keys.priv) < 0);

  // Пропуск для планировщика делается отдельной кнопкой: пара ключей уже
  // может быть записана в базу, и повторное нажатие первой кнопки её сломало бы
  check('до нажатия пропуска не показывают',
    await page.evaluate(() => document.getElementById('outSecret').classList.contains('hidden')));
  await page.click('#goSecret');
  await page.waitForTimeout(200);
  const pass = await page.evaluate(() => ({
    secret: document.getElementById('secret').textContent,
    cron: document.getElementById('cron').textContent,
    pub: document.getElementById('pub').textContent,
    priv: document.getElementById('priv').textContent
  }));
  check('пропуск — тридцать два случайных байта',
    decode(pass.secret).length === 32, decode(pass.secret).length + ' байт');
  check('пропуск в base64url: заголовок его не искажает',
    !/[=+/]/.test(pass.secret) && !/[^A-Za-z0-9_-]/.test(pass.secret), pass.secret.slice(-4));
  check('готовая строка расписания содержит пропуск в заголовке',
    pass.cron.indexOf('x-push-secret') > 0 && pass.cron.indexOf(pass.secret) > 0,
    pass.cron.slice(0, 40));
  check('и зовёт именно функцию push', pass.cron.indexOf('/functions/v1/push') > 0);
  // Без расширений схемы cron нет вовсе, и расписание падает на первой же строке
  check('очередь чистится вторым заданием, а не копится вечно',
    pass.cron.indexOf("cron.schedule('push-clean'") > 0
    && pass.cron.indexOf('delete from push_outbox') > 0
    && pass.cron.indexOf("cron.schedule('push-drain'") < pass.cron.indexOf("cron.schedule('push-clean'"));
  check('та же уборка убирает и заявки в друзья без ответа',
    pass.cron.indexOf('expire_friend_requests') > pass.cron.indexOf("cron.schedule('push-clean'"));
  check('расширения идут в той же строке, до расписания',
    pass.cron.indexOf('create extension if not exists pg_cron') === 0
    && pass.cron.indexOf('pg_net') > 0
    && pass.cron.indexOf('pg_net') < pass.cron.indexOf('cron.schedule'),
    pass.cron.slice(0, 24));
  check('пропуск не тронул уже созданные ключи',
    pass.pub === keys.pub && pass.priv === keys.priv);
  check('закрытый ключ в расписание не попал', pass.cron.indexOf(keys.priv) < 0);

  await page.reload();
  await page.waitForTimeout(200);
  await page.click('#goSecret');
  await page.waitForTimeout(200);
  const passAgain = await page.evaluate(() => document.getElementById('secret').textContent);
  check('каждый запуск даёт новый пропуск', passAgain !== pass.secret);

  // Каждый раз новая пара — иначе все проекты жили бы с одним ключом
  await page.reload();
  await page.waitForTimeout(200);
  await page.click('#go');
  await page.waitForTimeout(700);
  const again = await page.evaluate(() => document.getElementById('pub').textContent);
  check('каждый запуск даёт новую пару', again !== keys.pub);

  // Страница ничего не отправляет наружу: ключи не должны утечь
  const requests = [];
  page.on('request', r => { if (!r.url().startsWith('file://')) requests.push(r.url()); });
  await page.reload();
  await page.waitForTimeout(200);
  await page.click('#go');
  await page.click('#goSecret');
  await page.waitForTimeout(700);
  check('страница не ходит в сеть', requests.length === 0, requests.join(', '));

  await context.close();
}

(async () => {
  const browser = await chromium.launch(launchOptions());
  let crashed = null;
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
    await testRoundCard(browser);
    await testAccountDelete(browser);
    await testAwayAlerts(browser);
    await testFriendChat(browser);
    await testPushNotifications(browser);
    await testKeyPage(browser);
    await testNewLook(browser);
    await testProfile(browser);
    await testCalmScreens(browser);
    await testFriendsBoard(browser);
    await testAvatarColor(browser);
    await testReview(browser);
    await testDuelReview(browser);
    await testBots(browser);
    await testOnlineReview(browser);
    await testPolish(browser);
    await testQuitConfirm(browser);
    await testFogWholeRound(browser);
    await testMatchFlow(browser);
    await testBlockReport(browser);
    await testTutorial(browser);
    await testPushTexts();
    await testCurtain(browser);
    await testInviteLink(browser);
    await testPinShort(browser);
    await testProgress(browser);
    await testRealtime(browser);
    await testSplitFiles();
    await testUxPass(browser);
    await testLineSmooth(browser);
    await testAudit(browser);
    await testRedesign(browser);
    await testRunStage(browser);
    await testBonusGuide(browser);
    await testAdventure(browser);
    await testAdventureBonus(browser);
    await testTrainBonusFx(browser);
    await testTrialSurprises(browser);
    await testDailyCard(browser);
    await testShop(browser);
    await testPets(browser);
    await testKidClarity(browser);
    await testOnlineAdvBonuses(browser);
    await testLocalAdvBonuses(browser);
    await testNewBonuses(browser);
    await testNoJumps(browser);
    await testTablet(browser);
    await testScreensEverywhere(browser);
    await testSafeArea(browser);
    await testAdvDifficulty(browser);
    await testAdvRules(browser);
    await testAdvWorlds(browser);
  } catch (e) {
    // Упавший прогон раньше не печатал ничего: результаты копятся и выводятся
    // в конце, а до конца дело не доходило. Молчание легко принять за «без
    // замечаний», поэтому сначала показываем всё, что успели проверить
    crashed = e;
  } finally {
    await browser.close();
  }
  console.log('');
  const failed = report();
  if (crashed) {
    console.log('\n  ПРОГОН ОБОРВАЛСЯ: ' + (crashed && crashed.message || crashed));
    process.exit(1);
  }
  process.exit(failed > 0 ? 1 : 0);
})();
