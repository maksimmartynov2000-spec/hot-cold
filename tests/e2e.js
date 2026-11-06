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
  execSync('sh ' + path.join(__dirname, 'db', 'run.sh'), { stdio: 'pipe' });
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
  await context.route('**/vendor/supabase.js', route =>
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
  await page.addInitScript(l => {
    localStorage.setItem('hc_lang', l);
    // Обучение проверяет run.js; здесь игроки его уже прошли
    if (localStorage.getItem('hc_tutorial') === null) {
      localStorage.setItem('hc_tutorial', JSON.stringify({ done: [1, 2, 3], skipped: false }));
      // Все бонусы партий с другом, четыре из Приключения (миграция 057) и новые
      // (060) тоже: иначе случайный ход на 🩻/🌗/🛡️/🧊/3️⃣/5️⃣/🧭/🦝/🪞 открывал
      // окно-объяснение поверх кнопок
      localStorage.setItem('hc_seen_bonus', JSON.stringify(['extra', 'fog', 'blind', 'rush', 'lava', 'skip', 'gift', 'memory', 'near',
        'xray', 'half', 'shield', 'freeze', 'div3', 'div5', 'compass', 'thief', 'mirror', 'tens', 'units']));
    }
  }, lang || 'ru');
  await page.goto(GAME);
  await page.waitForTimeout(400);
  return { context, page, log };
}

async function registerPlayer(p, name, pin) {
  await p.page.click('#friendsBtn');
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
  // «Сейчас» для базы — обычная среда: в выходные идёт «Испытание выходных»,
  // и проверки зависели бы от дня запуска. Игра ходит в базу через это же соединение
  await db.query("set hc.now = '2026-11-04T12:00:00+00'");
  // Сценарии миграций оставляют после себя игроков — для чистоты берём своих
  await db.query("delete from students where username in ('Тимур','Лада','Артур')");
  // run.sh выключает правило «начинаем, когда оба пришли» для своих сценариев.
  // Здесь игра идёт как в жизни — правило включено
  await db.query('alter table matches enable trigger matches_flow');

  const browser = await chromium.launch(launchOptions());
  const A = await openPlayer(browser, db, 'ru');
  const B = await openPlayer(browser, db, 'ru');

  await registerPlayer(A, 'Тимур', '111111');
  await registerPlayer(B, 'Лада', '222222');
  check('оба аккаунта зарегистрированы в настоящей базе',
    (await db.query("select count(*) from students where username in ('Тимур','Лада')")).rows[0].count === '2');
  check('после регистрации открылись «Друзья»', await A.page.locator('#screenFriends').isVisible());

  // Друзья — отдельный экран, к нему идут из меню
  await A.page.click('#navPlay');
  await B.page.click('#navPlay');
  await A.page.waitForTimeout(300);
  await B.page.waitForTimeout(300);
  await A.page.click('#friendsBtn');
  await B.page.click('#friendsBtn');
  await A.page.waitForTimeout(500);
  await B.page.waitForTimeout(500);
  check('экран друзей открывается из нижнего меню', await A.page.locator('#screenFriends').isVisible() &&
    !(await A.page.locator('#screenOnline').count()));
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
  // Вызвавшего ещё нет: часы стоят, у принявшего — «Ждём …»
  const waiting = await B.page.evaluate(() => ({
    banner: document.getElementById('turnBanner').textContent,
    input: !document.getElementById('guessSection').classList.contains('hidden')
  }));
  const lobbyRow = (await db.query('select lobby, turn_deadline from matches where id = $1', [match.id])).rows[0];
  check('пока вызвавшего нет — «Ждём», часы не идут',
    waiting.banner.includes('Ждём') && !waiting.input && lobbyRow.lobby && lobbyRow.turn_deadline === null,
    JSON.stringify({ waiting, lobbyRow }));

  // Вызвавший тоже должен открыть матч: у него в списке он стал активным
  await A.page.waitForTimeout(11000);
  const mine = await A.page.evaluate(() =>
    [...document.querySelectorAll('#screenFriends .friend-row[data-id]')].map(r => r.dataset.state));
  check('у вызвавшего игра стала активной', mine.join() === 'active', mine.join());
  await A.page.click('#screenFriends .friend-row[data-id] .fr-btn');
  await A.page.waitForTimeout(1500);
  check('доска открылась и у вызвавшего', await A.page.locator('#screenGame').isVisible());
  // Оба на месте — отсчёт 3-2-1, потом игра
  await A.page.waitForTimeout(4500);

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

  // Разбор партии: все ходы приходят из базы только теперь, и у обоих одинаковые
  const dbMoves = +(await db.query("select count(*) from match_moves where match_id = $1 and kind = 'guess'",
    [match.id])).rows[0].count;
  const revA = await A.page.evaluate(() => ({ btn: (document.getElementById('reviewBtn') || {}).textContent || '',
    rv: currentReview() && { n: currentReview().moves.length, acc: currentReview().accuracy } }));
  const revB = await B.page.evaluate(() => ({ btn: (document.getElementById('reviewBtn') || {}).textContent || '',
    rv: currentReview() && { n: currentReview().moves.length, acc: currentReview().accuracy } }));
  check('после партии у обоих кнопка разбора с точностью',
    /Разбор/.test(revA.btn) && /Разбор/.test(revB.btn), revA.btn + ' / ' + revB.btn);
  check('разобраны все ходы из базы, у обоих одинаково',
    revA.rv && revA.rv.n === dbMoves && JSON.stringify(revA.rv) === JSON.stringify(revB.rv),
    JSON.stringify({ dbMoves, a: revA.rv, b: revB.rv }));
  await A.page.click('#reviewBtn');
  await A.page.waitForTimeout(200);
  check('окно разбора партии открывается', (await A.page.locator('#tReviewTitle').textContent()) === 'Разбор партии');
  await A.page.click('#tReviewClose');

  // После дружеской игры кнопка «В меню» возвращает к друзьям
  await A.page.click('.r-actions .btn-ghost');
  await B.page.click('.r-actions .btn-ghost');
  await A.page.waitForTimeout(900);
  await B.page.waitForTimeout(900);
  check('после дружеской игры оба вернулись к друзьям',
    (await A.page.locator('#screenFriends').isVisible()) &&
    (await B.page.locator('#screenFriends').isVisible()));

  // ===== Игра с другом — игра (миграция 062): день отмечен, очки пути, монеты
  const days = (await db.query("select username, played, play_xp from online_days where username in ('Тимур','Лада') " +
                               'order by username')).rows;
  check('партия с другом открыла обоим сундук дня и дала очки пути: победителю 20, проигравшему 10',
    days.length === 2 && days.every(d => d.played) && days.find(d => d.username === 'Лада').play_xp === 20 &&
    days.find(d => d.username === 'Тимур').play_xp === 10, JSON.stringify(days));
  const coins = (await db.query("select username, coins from wallet where username in ('Тимур','Лада') order by username")).rows;
  check('и монеты: победителю 15 🪙, проигравшему 5 🪙',
    coins.length === 2 && coins.find(c => c.username === 'Лада').coins === 15 && coins.find(c => c.username === 'Тимур').coins === 5,
    JSON.stringify(coins));

  // Тренировка без интернета — тоже игра: база отмечает день (local_game_done)
  await db.query("delete from online_days where username = 'Тимур'");
  await A.page.click('#navPlay');
  await A.page.waitForTimeout(300);
  await A.page.evaluate(() => openSetup('solo'));
  await A.page.click('#tStartMatch');
  await A.page.waitForTimeout(300);
  const soloSecret = await A.page.evaluate(() => secret);
  await A.page.fill('#guessInput', String(soloSecret));
  await A.page.click('#tSubmitGuess');
  await A.page.waitForTimeout(1200);
  const solo = (await db.query("select played, play_xp from online_days where username = 'Тимур'")).rows[0];
  check('конец Тренировки отмечен в настоящей базе: сундук открыт, +10 очков пути',
    solo && solo.played === true && solo.play_xp === 10, JSON.stringify(solo));
  await A.page.evaluate(() => quitToMenu());
  await A.page.waitForTimeout(900);
  // Сундук дня спрятан (DAILY_EXTRAS) — база его всё равно держит: проверяем её с переключателем
  check('сундука в меню нет — он спрятан', (await A.page.locator('#odChest').count()) === 0);
  await A.page.evaluate(() => { DAILY_EXTRAS = true; return loadOnlineInfo(); });
  await A.page.waitForTimeout(600);
  check('с переключателем — «Открыть сундук» в главном меню', await A.page.locator('#screenMode #odChest').isVisible());
  // Кнопка пульсирует — «стоять на месте» она не будет, жмём её функцией
  await A.page.evaluate(() => openChest());
  await A.page.waitForTimeout(1200);
  const opened = (await db.query("select chest_at is not null as opened from online_days where username = 'Тимур'")).rows[0];
  check('сундук открыт через настоящую базу', opened && opened.opened === true &&
    !(await A.page.locator('#chestModal').evaluate(e => e.classList.contains('hidden'))), JSON.stringify(opened));
  await A.page.evaluate(() => closeChest());

  // ---------- Профиль: иконка, смена имени и PIN — через настоящий SQL ----------
  // «Тимур» стоит по алфавиту после «Лады», «Артур» — перед ней: в парах, что
  // хранятся по алфавиту (переписка, лесенка против накрутки), строки должны
  // перевернуться, иначе база откажет в переименовании целиком
  await db.query("select send_friend_phrase('Тимур', '111111', 'Лада', 'play')");
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
  await A.page.click('#pfAvatar');
  await A.page.click('#avGrid .av-tile[data-icon="🦊"]');
  await A.page.waitForTimeout(500);
  check('иконка записана в базу',
    (await db.query("select avatar from students where username = 'Тимур'")).rows[0].avatar === '🦊');
  await A.page.click('#pfAvatar');
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

  await A.page.evaluate(() => { document.getElementById('pfEditFold').open = true; });
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

  await A.page.evaluate(() => { document.getElementById('pfEditFold').open = true; });
  await A.page.click('#tPinStart');
  await A.page.fill('#pinOld', '111111');
  await A.page.fill('#pinNew', '333333');
  await A.page.click('#tPinSave');
  await A.page.waitForTimeout(700);
  check('новый PIN подходит в базе',
    (await db.query("select check_student_pin('Артур', '333333') as u")).rows[0].u === 'Артур');
  await A.page.click('#tProfileDone');
  await A.page.click('#friendsBtn');
  await A.page.waitForTimeout(800);
  check('после смены PIN устройство работает дальше',
    (await A.page.evaluate(() => localStorage.getItem('hc_run_user'))) === 'Артур' &&
    (await A.page.locator('#screenFriends').isVisible()));

  await B.page.evaluate(() => { quitToMenu(); });

  // Задания дня: засчитывает база по настоящим партиям
  const decided = (await db.query("select count(*)::int as n from matches m where match_winner(m) is not null and 'Лада' in (m.p0, m.p1)")).rows[0].n;
  const ladaStats = (await db.query("select online_games, online_wins from player_stats where username = 'Лада'")).rows[0];
  check('партии Лады с исходом посчитаны базой', decided >= 1 && ladaStats && ladaStats.online_games === decided,
    JSON.stringify({ decided, ladaStats }));
  await B.page.evaluate(() => { DAILY_EXTRAS = true; quitToMenu(); });
  await B.page.waitForTimeout(1200);
  const qc = await B.page.evaluate(() => ({ shown: !document.getElementById('questCard').classList.contains('hidden'),
    rows: [...document.querySelectorAll('#qcList .qc-row')].map(r => r.dataset.code + ' ' + r.querySelector('.qc-n').textContent) }));
  const dq = (await db.query("select code, goal, progress from daily_quests where username = 'Лада' and day = player_day('Лада') order by slot")).rows;
  check('в меню — задания дня из настоящей базы, прогресс как в базе',
    qc.shown && qc.rows.length === 3 && qc.rows.join() === dq.map(q => q.code + ' ' + Math.min(q.progress, q.goal) + '/' + q.goal).join(),
    JSON.stringify({ qc, dq }));
  // Первое задание — «сыграть любые игры» или «бои Приключения»: у Лады одна партия с другом.
  // Задание про Приключение ею не двигается
  const want = { play2: decided, play3: decided }[dq[0].code] || 0;
  check('партия с другом продвинула первое задание (или не тронула чужое)',
    dq[0].progress === Math.min(dq[0].goal, want), JSON.stringify(dq[0]));

  // «В игре сейчас» через настоящую базу: первый отметился — второй видит точку
  await db.query("update students set last_seen = null where username in ('Артур', 'Лада')");
  await A.page.evaluate(() => markSeen());
  await A.page.waitForTimeout(500);
  await B.page.evaluate(() => openFriends());
  await B.page.waitForTimeout(1200);
  const presence = await B.page.evaluate(() => [...document.querySelectorAll('#friendsList .friend-row')]
    .map(r => r.dataset.name + ':' + r.querySelector('.avatar').classList.contains('online')));
  check('друг отметился «я здесь» — у второго зелёная точка', presence.includes('Артур:true'), presence.join());
  await B.page.evaluate(() => quitToMenu());

  // Испытание считается в телефоне, итог уходит в базу (миграция 051)
  await B.page.evaluate(() => { openRunEntry(); startRun(true); RUN.round = 4; RUN.totalScore = 1300; finishRun({}, true); });
  await B.page.waitForTimeout(1500);
  const rr = (await db.query("select score, rounds from runs where username = 'Лада' order by id desc limit 1")).rows[0];
  check('итог Испытания из телефона записан в базу', rr && rr.score === 1300 && rr.rounds === 3, JSON.stringify(rr));
  await B.page.evaluate(() => leaveRun());

  check('ни очереди, ни рейтинга, ни ботов в базе нет',
    (await db.query("select count(*) from information_schema.tables where table_schema = 'public' " +
                    "and table_name in ('ranked_queue', 'elo_ratings', 'ladder', 'bot_people', 'weekend_cup')")).rows[0].count === '0' &&
    (await db.query('select count(*) from students where is_bot')).rows[0].count === '0');

  const calls = A.log.concat(B.log);
  check('профиль шёл через настоящие функции базы',
    ['my_profile', 'set_avatar', 'set_avatar_color', 'rename_student', 'change_pin', 'send_friend_text', 'friend_thread']
      .every(f => calls.includes(f)) && (calls.includes('faces_for') || calls.includes('avatars_for')),
    [...new Set(calls)].join(', '));
  check('всё шло через настоящие функции базы',
    calls.includes('match_guess') && calls.includes('match_state') &&
    calls.includes('send_phrase') && calls.includes('challenge_friend') &&
    calls.includes('match_review') && calls.includes('my_online') && calls.includes('local_game_done') &&
    calls.includes('open_chest') && !calls.some(c => /ladder|play_join|play_status|ranked|elo_/.test(c)),
    [...new Set(calls)].join(', '));

  await browser.close();
  await db.end();
  console.log('');
  process.exit(report() > 0 ? 1 : 0);
})();
