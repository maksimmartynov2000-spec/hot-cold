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
  await db.query("delete from students where username in ('Тимур','Лада','Артур')");

  const browser = await chromium.launch(launchOptions());
  const A = await openPlayer(browser, db, 'ru');
  const B = await openPlayer(browser, db, 'ru');

  await registerPlayer(A, 'Тимур', '1111');
  await registerPlayer(B, 'Лада', '2222');
  check('оба аккаунта зарегистрированы в настоящей базе',
    (await db.query("select count(*) from students where username in ('Тимур','Лада')")).rows[0].count === '2');
  check('после регистрации открылся рейтинг', await A.page.locator('#screenOnline').isVisible());

  // Друзья — отдельный экран, к нему идут из меню
  await A.page.click('#tOnlineBack');
  await B.page.click('#tOnlineBack');
  await A.page.waitForTimeout(300);
  await B.page.waitForTimeout(300);
  await A.page.click('#friendsBtn');
  await B.page.click('#friendsBtn');
  await A.page.waitForTimeout(500);
  await B.page.waitForTimeout(500);
  check('экран друзей отдельный от рейтинга',
    (await A.page.locator('#screenFriends').isVisible()) &&
    !(await A.page.locator('#screenOnline').isVisible()));
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
    [...document.querySelectorAll('#screenFriends .friend-row[data-id]')].map(r => r.dataset.state));
  check('вызов доехал до соперника', invite.join() === 'incoming', invite.join());

  await B.page.click('#screenFriends .friend-row[data-id] .fr-btn.yes');
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
    [...document.querySelectorAll('#screenFriends .friend-row[data-id]')].map(r => r.dataset.state));
  check('у вызвавшего игра стала активной', mine.join() === 'active', mine.join());
  await A.page.click('#screenFriends .friend-row[data-id] .fr-btn');
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
  await B.page.click('#sayPad button[data-code="luck"]');
  await B.page.waitForTimeout(900);
  check('фраза записана в базу',
    (await db.query('select code from match_chat where match_id = $1', [match.id])).rows[0].code === 'luck');
  await A.page.waitForTimeout(2600);
  const heard = await A.page.locator('#sayBubble').textContent();
  check('фразу услышал соперник', heard.indexOf('Лада') >= 0 && heard.indexOf('Удачи') >= 0, heard);

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
  // После дружеской игры кнопка «В меню» возвращает к друзьям
  await A.page.click('.r-actions .btn-ghost');
  await B.page.click('.r-actions .btn-ghost');
  await A.page.waitForTimeout(900);
  await B.page.waitForTimeout(900);
  check('после дружеской игры оба вернулись к друзьям',
    (await A.page.locator('#screenFriends').isVisible()) &&
    (await B.page.locator('#screenFriends').isVisible()));

  // Рейтинг: играем разновидность с морозом и бонусами — самую непохожую
  await A.page.click('#tFriendsBack');
  await B.page.click('#tFriendsBack');
  await A.page.waitForTimeout(300);
  await B.page.waitForTimeout(300);
  await A.page.click('#tModeOnline');
  await B.page.click('#tModeOnline');
  await A.page.waitForTimeout(600);
  await B.page.waitForTimeout(600);
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

  // ---------- Профиль: иконка, смена имени и PIN — через настоящий SQL ----------
  // «Тимур» стоит по алфавиту после «Лады», «Артур» — перед ней: в парах, что
  // хранятся по алфавиту (переписка, лесенка против накрутки), строки должны
  // перевернуться, иначе база откажет в переименовании целиком
  await db.query("select send_friend_phrase('Тимур', '1111', 'Лада', 'play')");
  for (const P of [A, B]) await P.page.evaluate(() => quitToMenu());

  // Текст вне игры: грубое слово база прячет сама
  await A.page.evaluate(() => openChat('Лада'));
  await A.page.waitForTimeout(700);
  await A.page.fill('#chatText', 'Привет, сука! Сыграем?');
  await A.page.click('#tChatSend');
  await A.page.waitForTimeout(900);
  const bodies = (await db.query('select body from friend_chat where body is not null')).rows.map(r => r.body);
  check('текст записан в базу, грубое слово под ***', bodies.join() === 'привет, ***! сыграем?', bodies.join());
  const mineText = await A.page.evaluate(() =>
    (document.querySelector('#chatList .chat-msg:last-child') || {}).textContent || '');
  check('и в ленте у отправителя уже очищенный', mineText.indexOf('привет, ***! сыграем?') === 0, mineText);
  await A.page.evaluate(() => quitToMenu());

  await A.page.click('#accountChip');
  await A.page.waitForTimeout(700);
  await A.page.click('#tAvatarStart');
  await A.page.click('#avGrid .av-tile[data-icon="🦊"]');
  await A.page.waitForTimeout(500);
  check('иконка записана в базу',
    (await db.query("select avatar from students where username = 'Тимур'")).rows[0].avatar === '🦊');
  await A.page.click('#tAvatarStart');
  await A.page.click('#avGrid .av-color[data-color="#2dd4bf"]');
  await A.page.waitForTimeout(600);
  check('цвет фона записан в базу',
    (await db.query("select avatar_color from students where username = 'Тимур'")).rows[0].avatar_color === '#2dd4bf');

  await B.page.click('#friendsBtn');
  await B.page.waitForTimeout(900);
  const face = await B.page.evaluate(() => {
    const row = document.querySelector('#friendsList .friend-row[data-name="Тимур"]');
    return row ? row.querySelector('.avatar').textContent : null;
  });
  check('второй игрок видит иконку друга', face === '🦊', String(face));
  const faceBg = await B.page.evaluate(() => {
    const row = document.querySelector('#friendsList .friend-row[data-name="Тимур"]');
    return row ? getComputedStyle(row.querySelector('.avatar')).backgroundColor : null;
  });
  check('и его цвет фона', faceBg === 'rgb(45, 212, 191)', String(faceBg));

  await A.page.click('#tRenameStart');
  await A.page.fill('#renameInput', 'Артур');
  await A.page.click('#tRenameSave');
  await A.page.waitForTimeout(700);
  check('имя сменилось в базе',
    (await db.query("select count(*) from students where username = 'Артур'")).rows[0].count === '1');
  // Старое имя не должно остаться нигде — обходим все текстовые столбцы базы
  const cols = (await db.query(
    "select table_name, column_name, data_type from information_schema.columns " +
    "where table_schema = 'public' and data_type in ('text', 'ARRAY', 'jsonb') and table_name in " +
    "(select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE')")).rows;
  const leftovers = [];
  for (const c of cols) {
    const q = c.data_type === 'text'
      ? `select count(*) from "${c.table_name}" where "${c.column_name}" = 'Тимур'`
      : `select count(*) from "${c.table_name}" where "${c.column_name}"::text like '%Тимур%'`;
    const n = +(await db.query(q)).rows[0].count;
    if (n) leftovers.push(c.table_name + '.' + c.column_name + '×' + n);
  }
  check('старое имя не осталось ни в одной таблице', leftovers.length === 0, leftovers.join(', '));
  check('устройство теперь входит под новым именем',
    (await A.page.evaluate(() => localStorage.getItem('hc_run_user'))) === 'Артур');

  await B.page.evaluate(() => loadFriends());
  await B.page.waitForTimeout(700);
  const renamedRow = await B.page.evaluate(() => {
    const row = document.querySelector('#friendsList .friend-row[data-name="Артур"]');
    return row ? { rel: row.dataset.relation, face: row.querySelector('.avatar').textContent } : null;
  });
  check('у друга новое имя, дружба и иконка на месте',
    renamedRow && renamedRow.rel === 'friend' && renamedRow.face === '🦊', JSON.stringify(renamedRow));
  await B.page.click('#friendsList .friend-row[data-name="Артур"] .fr-name');
  await B.page.waitForTimeout(800);
  const thread = await B.page.evaluate(() =>
    [...document.querySelectorAll('#chatList .chat-msg')].map(m => ({ cls: m.className, text: m.textContent })));
  check('переписка пережила переименование — и фраза, и текст',
    thread.length === 2 && thread.every(m => m.cls.indexOf('theirs') >= 0) &&
    thread[1].text.indexOf('привет, ***! сыграем?') === 0, JSON.stringify(thread));

  await A.page.click('#tPinStart');
  await A.page.fill('#pinOld', '1111');
  await A.page.fill('#pinNew', '3333');
  await A.page.click('#tPinSave');
  await A.page.waitForTimeout(700);
  check('новый PIN подходит в базе',
    (await db.query("select check_student_pin('Артур', '3333') as u")).rows[0].u === 'Артур');
  await A.page.click('#tProfileDone');
  await A.page.click('#friendsBtn');
  await A.page.waitForTimeout(800);
  check('после смены PIN устройство работает дальше',
    (await A.page.evaluate(() => localStorage.getItem('hc_run_user'))) === 'Артур' &&
    (await A.page.locator('#screenFriends').isVisible()));

  // ---- Бот в рейтинге: никого нет 15 секунд — играет бот
  await B.page.evaluate(() => { quitToMenu(); });
  await B.page.click('#tModeOnline');
  await B.page.waitForTimeout(700);
  await B.page.click('.rk-mode[data-mode="0"]');
  await B.page.waitForTimeout(400);
  await B.page.click('#tRkPlay');
  await B.page.waitForTimeout(900);
  check('с ботом: игрок встал в очередь', await B.page.locator('#rkWaitBox').isVisible());
  const botSoon = await B.page.locator('#rkWaitSub').textContent();
  check('в очереди сказано, когда будет бот', /сыграете с ботом/.test(botSoon), botSoon);
  await db.query("update ranked_queue set joined_at = now() - interval '16 seconds' where username = 'Лада'");
  await B.page.waitForTimeout(3600);
  const bm = (await db.query("select * from matches where p0 = 'Лада' and bot_seat is not null " +
                             "order by id desc limit 1")).rows[0];
  check('через 15 секунд создана партия с ботом', bm && bm.status === 'active' && bm.bot_seat === 1 &&
    /^@bot:/.test(bm.p1) && bm.ranked_mode === 0, JSON.stringify(bm && { p1: bm.p1, s: bm.status }));
  check('доска с ботом открылась сама', await B.page.locator('#screenGame').isVisible());
  const botLabel = await B.page.locator('#pname1').textContent();
  check('бот подписан персонажем и 🤖', /🤖/.test(botLabel) && !/@bot/.test(botLabel), botLabel);

  const miss = bm.secret === 50 ? 51 : 50;
  await B.page.fill('#guessInput', String(miss));
  await B.page.click('#tSubmitGuess');
  await B.page.waitForTimeout(600);
  // Раздумья бота — несколько секунд; сдвигаем начало его хода в прошлое
  await db.query("update matches set turn_deadline = turn_deadline - interval '20 seconds' where id = $1", [bm.id]);
  await B.page.waitForTimeout(2600);
  const botMoves = +(await db.query('select count(*) from match_moves where match_id = $1 and seat = 1', [bm.id])).rows[0].count;
  check('бот походил сам, пока игрок смотрит на доску', botMoves >= 1, String(botMoves));
  const whoRows = await B.page.evaluate(() => [...document.querySelectorAll('#historyList .h-who')].map(e => e.textContent));
  check('ход бота виден у игрока', whoRows.some(w => /🤖/.test(w)), whoRows.join());
  check('бот поздоровался в чате партии',
    +(await db.query('select count(*) from match_chat where match_id = $1 and seat = 1', [bm.id])).rows[0].count >= 1);

  await B.page.evaluate(() => leaveGame());
  await B.page.waitForTimeout(200);
  await B.page.click('#tResignGo');
  await B.page.waitForTimeout(900);
  const bEnd = (await db.query('select status, elo_delta from matches where id = $1', [bm.id])).rows[0];
  const skill = (await db.query("select level, streak from bot_skill where username = 'Лада' and mode = 0")).rows[0];
  check('сдача боту — поражение, рейтинг вдвое меньше',
    bEnd.status === 'finished' && bEnd.elo_delta[0] === -10 && bEnd.elo_delta[1] === 0, JSON.stringify(bEnd));
  check('после поражения следующий бот слабее',
    skill && Math.abs(skill.level - 0.23) < 0.001 && skill.streak === -1, JSON.stringify(skill));
  check('у бота рейтинга нет',
    (await db.query("select count(*) from elo_ratings where username like '@bot:%'")).rows[0].count === '0');

  const calls = A.log.concat(B.log);
  check('профиль шёл через настоящие функции базы',
    ['my_profile', 'set_avatar', 'set_avatar_color', 'avatars_for', 'rename_student', 'change_pin', 'send_friend_text', 'friend_thread']
      .every(f => calls.includes(f)),
    [...new Set(calls)].join(', '));
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
