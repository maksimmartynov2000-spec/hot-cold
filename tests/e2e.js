// Сквозной прогон: два настоящих браузера, настоящий index.html и настоящие
// функции в PostgreSQL. Живой Supabase из этого окружения недоступен (сетевая
// политика отклоняет CONNECT), поэтому запросы к нему перехватываются и
// исполняются в локальной базе — той же самой, на которой проверяются миграции.
//
// Что это проверяет: клиентский код, реальный SQL, взаимодействие двух игроков,
// опрос, переход хода, сокрытие числа.
// Чего не проверяет: сам PostgREST, настоящую сеть с её задержками и обрывами,
// и поведение supabase-js — вместо него здесь тонкая прослойка на fetch.
const { chromium } = require('playwright');
const { Client } = require('pg');
const { execSync } = require('child_process');
const path = require('path');
const { launchOptions, check, report } = require('./helpers');

const ROOT = path.resolve(__dirname, '..');
const GAME = 'file://' + path.join(ROOT, 'index.html');
const SUPA = 'https://fzakcsvyceqsnowvkxfu.supabase.co';

// Прослойка вместо supabase-js: тот же договор — rpc(name, args) → {data, error}
const SHIM = `
window.supabase = {
  createClient: function (url, key) {
    return {
      from: function () {
        return { select: function () { return { eq: function () {
          return { single: async function () { return { data: null, error: 'no-config' }; } };
        } }; } };
      },
      rpc: async function (name, args) {
        var res = await fetch(url + '/rest/v1/rpc/' + name, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: key },
          body: JSON.stringify(args || {})
        });
        var body = null;
        try { body = await res.json(); } catch (e) {}
        if (!res.ok) return { data: null, error: { message: (body && body.message) || ('http ' + res.status) } };
        return { data: body, error: null };
      }
    };
  }
};`;

function rebuildDatabase() {
  execSync('sh ' + path.join(ROOT, 'db', 'run.sh'), { stdio: 'pipe' });
  // Узел работает от root, а сокет пускает по имени системного пользователя:
  // без такой роли подключиться нечем. SQL кладём в файл — в строке для оболочки
  // доллары превращаются в номер процесса
  const f = path.join(require('os').tmpdir(), 'hc_role.sql');
  require('fs').writeFileSync(f,
    "do $$ begin if not exists (select 1 from pg_roles where rolname = 'root') " +
    "then create role root superuser login; end if; end $$;\n");
  execSync('chmod a+r ' + f, { stdio: 'pipe' });
  execSync('su postgres -c "psql -q -f ' + f + '"', { stdio: 'pipe' });
}

// PostgREST отдаёт скалярную функцию значением, а табличную — массивом строк.
// Клиент рассчитывает именно на это, поэтому форма ответа воспроизводится
async function callFunction(db, fn, args) {
  const keys = Object.keys(args || {});
  const named = keys.map((k, i) => k + ' := $' + (i + 1)).join(', ');
  const r = await db.query('select * from ' + fn + '(' + named + ')',
    keys.map(k => args[k]));
  if (r.fields.length === 1 && r.fields[0].name === fn) {
    return r.rows.length ? r.rows[0][fn] : null;
  }
  return r.rows;
}

async function attach(context, db, log) {
  await context.route('**/cdn.jsdelivr.net/**', route =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: SHIM }));
  await context.route(SUPA + '/**', async route => {
    const url = new URL(route.request().url());
    const m = url.pathname.match(/^\/rest\/v1\/rpc\/([a-z_]+)$/);
    if (!m) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
    let args = {};
    try { args = JSON.parse(route.request().postData() || '{}'); } catch (e) {}
    try {
      const data = await callFunction(db, m[1], args);
      log.push(m[1]);
      route.fulfill({ status: 200, contentType: 'application/json',
                      body: JSON.stringify(data === undefined ? null : data) });
    } catch (e) {
      route.fulfill({ status: 400, contentType: 'application/json',
                      body: JSON.stringify({ message: e.message }) });
    }
  });
}

async function openPlayer(browser, db, lang) {
  const context = await browser.newContext({ viewport: { width: 430, height: 860 } });
  const log = [];
  await attach(context, db, log);
  const page = await context.newPage();
  page.on('pageerror', e => check('без ошибок JS', false, e.message));
  await page.addInitScript(l => localStorage.setItem('hc_lang', l), lang || 'ru');
  await page.goto(GAME);
  await page.waitForTimeout(400);
  return { context, page, log };
}

async function registerPlayer(p, name, pin) {
  await p.page.click('#tModeOnline');
  await p.page.waitForTimeout(300);
  await p.page.click('#tRunChoiceRegister');
  await p.page.waitForTimeout(200);
  await p.page.fill('#runUsername', name);
  await p.page.fill('#runPin', pin);
  await p.page.click('#runAuthSubmitBtn');
  await p.page.waitForTimeout(700);
}

(async () => {
  rebuildDatabase();
  const db = new Client({ host: '/var/run/postgresql', user: 'root', database: 'hotcold_test' });
  await db.connect();
  // Сценарии миграций оставляют после себя игроков — для чистоты берём своих
  await db.query("delete from students where username in ('Тимур','Лада')");

  const browser = await chromium.launch(launchOptions());
  const A = await openPlayer(browser, db, 'ru');
  const B = await openPlayer(browser, db, 'ru');

  await registerPlayer(A, 'Тимур', '1111');
  await registerPlayer(B, 'Лада', '2222');
  check('оба аккаунта зарегистрированы в настоящей базе',
    (await db.query("select count(*) from students where username in ('Тимур','Лада')")).rows[0].count === '2');
  check('после регистрации открылся онлайн', await A.page.locator('#screenOnline').isVisible());
  check('по умолчанию открыта вкладка рейтинга',
    await A.page.locator('#olRanked').isVisible() &&
    !(await A.page.locator('#olFriends').isVisible()));

  // Дружба: всё это живёт на своей вкладке
  await A.page.click('#tTabFriends');
  await B.page.click('#tTabFriends');
  await A.page.waitForTimeout(300);
  await B.page.waitForTimeout(300);
  await A.page.fill('#friendSearch', 'ла');
  await A.page.click('#tFindBtn');
  await A.page.waitForTimeout(600);
  const found = await A.page.evaluate(() =>
    [...document.querySelectorAll('#searchResults .friend-row')].map(r => r.dataset.name));
  check('поиск нашёл второго игрока', found.join() === 'Лада', found.join());

  await A.page.click('#searchResults .friend-row .fr-btn');
  await A.page.waitForTimeout(700);
  check('заявка записана в базу',
    (await db.query("select status from friendships where requester='Тимур' and addressee='Лада'"))
      .rows[0].status === 'pending');

  await B.page.waitForTimeout(11000);   // ждём опрос списка друзей
  const incoming = await B.page.evaluate(() =>
    [...document.querySelectorAll('#friendsList .friend-row')].map(r => r.dataset.name + ':' + r.dataset.relation));
  check('заявка сама доехала до второго игрока',
    incoming.join() === 'Тимур:incoming', incoming.join());

  await B.page.click('#friendsList .friend-row .fr-btn.yes');
  await B.page.waitForTimeout(700);
  check('дружба принята в базе',
    (await db.query("select status from friendships where requester='Тимур' and addressee='Лада'"))
      .rows[0].status === 'accepted');

  // Вызов
  await A.page.waitForTimeout(11000);
  await A.page.click('#friendsList .friend-row .fr-btn.yes');
  await A.page.waitForTimeout(400);
  await A.page.selectOption('#chRange', '100');
  await A.page.check('#chBonuses');
  await A.page.waitForTimeout(200);
  await A.page.selectOption('#chWins', '1');
  await A.page.click('#tChSend');
  await A.page.waitForTimeout(800);
  const match = (await db.query("select id, bonuses_on, range_max from matches order by id desc limit 1")).rows[0];
  check('вызов создан с выбранными условиями',
    match && match.bonuses_on === true && match.range_max === 100, JSON.stringify(match));

  await B.page.waitForTimeout(11000);
  const invite = await B.page.evaluate(() =>
    [...document.querySelectorAll('#gamesList .friend-row')].map(r => r.dataset.state));
  check('вызов доехал до соперника', invite.join() === 'incoming', invite.join());

  await B.page.click('#gamesList .friend-row .fr-btn.yes');
  await B.page.waitForTimeout(1500);
  check('у принявшего открылась доска', await B.page.locator('#screenGame').isVisible());
  const started = (await db.query('select secret, status, cur from matches where id = $1', [match.id])).rows[0];
  check('число загадано сервером и матч идёт',
    started.status === 'active' && started.secret !== null, JSON.stringify(started));

  // Число не видно ни одному из клиентов
  const seen = await B.page.evaluate(() => ({ secret: secret, seat: online.seat }));
  check('загаданное число клиенту неизвестно', seen.secret === 0, String(seen.secret));
  check('место за доской получено с сервера', seen.seat === 1, String(seen.seat));

  // Вызвавший тоже должен открыть матч: у него в списке он стал активным
  await A.page.waitForTimeout(11000);
  const mine = await A.page.evaluate(() =>
    [...document.querySelectorAll('#gamesList .friend-row')].map(r => r.dataset.state));
  check('у вызвавшего игра стала активной', mine.join() === 'active', mine.join());
  await A.page.click('#gamesList .friend-row .fr-btn');
  await A.page.waitForTimeout(1500);
  check('доска открылась и у вызвавшего', await A.page.locator('#screenGame').isVisible());

  // Ходит вызвавший
  check('первым ходит вызвавший', await A.page.locator('#guessSection').isVisible());
  check('у соперника поля ввода нет', !(await B.page.locator('#guessSection').isVisible()));

  const wrong = started.secret === 1 ? 2 : 1;
  await A.page.fill('#guessInput', String(wrong));
  await A.page.click('#tSubmitGuess');
  await A.page.waitForTimeout(900);
  check('ход записан в базу',
    (await db.query('select count(*) from match_moves where match_id = $1', [match.id])).rows[0].count === '1');

  await B.page.waitForTimeout(2600);
  const sawMove = await B.page.evaluate(() =>
    [...document.querySelectorAll('.history-item .h-guess')].map(e => e.textContent));
  check('соперник увидел ход сам, без перезахода', sawMove.join() === String(wrong), sawMove.join());
  check('и теперь его очередь', await B.page.locator('#guessSection').isVisible());

  // Фраза
  await B.page.click('#sayBtn');
  await B.page.waitForTimeout(300);
  await B.page.click('#sayPad button[data-code="hot"]');
  await B.page.waitForTimeout(900);
  check('фраза записана в базу',
    (await db.query('select code from match_chat where match_id = $1', [match.id])).rows[0].code === 'hot');
  await A.page.waitForTimeout(2600);
  const heard = await A.page.locator('#sayBubble').textContent();
  check('фразу услышал соперник', heard.indexOf('Лада') >= 0 && heard.indexOf('теплее') >= 0, heard);

  // Победа
  await B.page.fill('#guessInput', String(started.secret));
  await B.page.click('#tSubmitGuess');
  await B.page.waitForTimeout(1200);
  const over = (await db.query('select round_over, match_over, wins, status from matches where id = $1',
    [match.id])).rows[0];
  check('раунд и матч закрыты сервером',
    over.round_over === true && over.match_over === true && over.status === 'finished',
    JSON.stringify(over));
  const shown = await B.page.evaluate(() => ({ secret: secret, result: document.getElementById('resultBox').textContent }));
  check('после победы число открылось', shown.secret === started.secret, String(shown.secret));
  check('в итогах названо число', shown.result.indexOf(String(started.secret)) >= 0);

  await A.page.waitForTimeout(2600);
  const loserSees = await A.page.evaluate(() => ({ secret: secret, over: D.matchOver }));
  check('проигравший тоже увидел итог', loserSees.over === true && loserSees.secret === started.secret,
    JSON.stringify(loserSees));

  // ===== Рейтинговый онлайн: очередь, автоматический подбор, сдача по молчанию
  await A.page.click('.r-actions .btn');
  await B.page.click('.r-actions .btn');
  await A.page.waitForTimeout(900);
  await B.page.waitForTimeout(900);
  check('после матча оба вернулись в онлайн',
    (await A.page.locator('#screenOnline').isVisible()) &&
    (await B.page.locator('#screenOnline').isVisible()));

  // Рейтинг: играем разновидность с морозом и бонусами — самую непохожую
  await A.page.click('#tTabRanked');
  await B.page.click('#tTabRanked');
  await A.page.waitForTimeout(300);
  await B.page.waitForTimeout(300);
  await A.page.click('.rk-mode[data-mode="3"]');
  await B.page.click('.rk-mode[data-mode="3"]');
  await A.page.waitForTimeout(500);
  await B.page.waitForTimeout(500);

  await A.page.click('#tRkPlay');
  await A.page.waitForTimeout(900);
  check('первый встал в очередь и ждёт', await A.page.locator('#rkWaitBox').isVisible());
  check('очередь записана в базу',
    (await db.query("select count(*) from ranked_queue where username = 'Тимур'")).rows[0].count === '1');
  const waitText = await A.page.locator('#rkWaitText').textContent();
  check('в ожидании написано, что соперника ещё нет',
    waitText.indexOf('только вы') >= 0, waitText);

  await B.page.click('#tRkPlay');
  await B.page.waitForTimeout(1500);
  const rk = (await db.query('select * from matches where ranked order by id desc limit 1')).rows[0];
  check('матч создан по правилам выбранной разновидности',
    rk && rk.status === 'active' && rk.wins_needed === 3 && rk.ranked_mode === 3 &&
    rk.range_min === -100 && rk.range_max === 100 && rk.bonuses_on === true && rk.frost === true,
    JSON.stringify(rk && { s: rk.status, m: rk.ranked_mode, lo: rk.range_min,
                           hi: rk.range_max, b: rk.bonuses_on, f: rk.frost }));
  check('бонусы для этой разновидности действительно разложены',
    (await db.query('select count(*) from match_bonuses where match_id = $1', [rk.id]))
      .rows[0].count !== '0');
  check('второму сразу открылась доска', await B.page.locator('#screenGame').isVisible());

  // Ждавшего в матч затягивает его же опрос очереди — без нажатий
  await A.page.waitForTimeout(4200);
  check('ждавшего подбор сам перенёс на доску', await A.page.locator('#screenGame').isVisible());
  const bothRanked = await A.page.evaluate(() => online && online.ranked);
  check('клиент знает, что игра рейтинговая', bothRanked === true, String(bothRanked));
  check('очередь после подбора пуста',
    (await db.query('select count(*) from ranked_queue')).rows[0].count === '0');

  // Молчание: у хода второго игрока просрочен срок и один пропуск уже был
  const bSeat = await B.page.evaluate(() => online.seat);
  await db.query('update matches set cur = $2, timeouts[$2 + 1] = 1, ' +
                 "turn_deadline = now() - interval '1 second' where id = $1", [rk.id, bSeat]);
  await A.page.waitForTimeout(2600);
  const gone = (await db.query('select forfeit_by, match_over, elo_applied, elo_delta, status ' +
                               'from matches where id = $1', [rk.id])).rows[0];
  check('второй пропуск подряд закончил матч сдачей',
    gone.match_over === true && gone.status === 'finished' && gone.forfeit_by === bSeat,
    JSON.stringify(gone));
  check('рейтинг посчитан один раз', gone.elo_applied === true);

  const elos = (await db.query("select username, mode, elo, games from elo_ratings " +
                               "where username in ('Тимур','Лада') order by username")).rows;
  const lada = elos.find(r => r.username === 'Лада');
  const timur = elos.find(r => r.username === 'Тимур');
  check('оставшийся вырос, ушедший упал',
    timur && lada && timur.elo > 1000 && lada.elo < 1000 &&
    timur.games === 1 && lada.games === 1, JSON.stringify(elos));
  check('рейтинг записан именно в свою разновидность',
    elos.every(r => r.mode === 3) && elos.length === 2, JSON.stringify(elos));

  // В карточке число разделено пробелами по-русски: сравниваем без них
  const card = (await A.page.locator('#resultBox').textContent()).replace(/[\s\u00a0\u202f]/g, '');
  check('оставшемуся объяснили, что соперник ушёл', card.indexOf('Ладавышелизигры') >= 0, card);
  check('и показали новый рейтинг с прибавкой',
    card.indexOf('(+') >= 0 && card.indexOf(String(timur.elo)) >= 0, card);
  check('причина стоит раньше счёта', card.indexOf('вышелизигры') < card.indexOf('0:0'), card);

  const calls = A.log.concat(B.log);
  check('всё шло через настоящие функции базы',
    calls.includes('match_guess') && calls.includes('match_state') &&
    calls.includes('send_phrase') && calls.includes('challenge_friend') &&
    calls.includes('join_ranked_queue') && calls.includes('ranked_status') &&
    calls.includes('elo_leaderboard'),
    [...new Set(calls)].join(', '));

  await browser.close();
  await db.end();
  console.log('');
  process.exit(report() > 0 ? 1 : 0);
})();
