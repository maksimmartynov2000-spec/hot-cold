const path = require('path');

const GAME_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

// Chromium из окружения, если он там есть (в CI и песочницах он предустановлен)
function launchOptions() {
  const preinstalled = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  return require('fs').existsSync(preinstalled) ? { executablePath: preinstalled } : {};
}

// Заглушка Supabase: тесты не должны зависеть от сети и живой базы.
// Функция уезжает в браузер без замыкания, поэтому настройки передаём аргументом
function stubSupabase(opts) {
  return function (opts) {
    window.__rpcCalls = [];
    window.supabase = {
      createClient: () => ({
        from: () => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: null, error: 'stub' }) }) })
        }),
        rpc: async (name, args) => {
          window.__rpcCalls.push({ name, args });
          if (name === 'run_leaderboard_daily' || name === 'run_leaderboard_weekly' || name === 'run_leaderboard') {
            return { data: [{ username: 'Аня', best_run_score: 5200, best_run_rounds: 8 }], error: null };
          }
          if (name === 'submit_run_score') return { data: [{ is_best: true, best_score: args.p_score }], error: null };
          // Друзья: тест сам задаёт, что «лежит на сервере», через window.__friends
          // и window.__found, а ошибку подкладывает через window.__rpcError
          if (window.__rpcError && window.__rpcError.name === name) {
            return { data: null, error: { message: window.__rpcError.message } };
          }
          if (name === 'list_friends') return { data: window.__friends || [], error: null };
          if (name === 'find_students') return { data: window.__found || [], error: null };
          if (name === 'suggest_students') return { data: window.__suggested || [], error: null };
          if (name === 'send_friend_request') return { data: 'outgoing', error: null };
          if (name === 'respond_friend_request') return { data: args.p_accept ? 'friend' : 'declined', error: null };
          if (name === 'remove_friend') return { data: true, error: null };

          // Матчи: заглушка ведёт себя как сервер — держит состояние, проверяет
          // очередь и НЕ отдаёт загаданное число, пока раунд не кончился
          // Забег: заглушка считает его так же, как сервер, и так же не отдаёт
          // загаданное число — иначе проверки рейтинга смотрели бы в пустоту
          if (name === 'run_start') {
            const R = window.__run;
            if (!R.active || args.p_fresh) {
              R.active = true; R.round = 1; R.score = 0; R.frost = !!args.p_frost;
              window.__runDeal(1);
            }
            window.__runSave();
            return { data: window.__runSnapshot(), error: null };
          }
          if (name === 'run_state') return { data: window.__runSnapshot(), error: null };
          if (name === 'run_give_up') {
            const R = window.__run;
            R.active = false;
            window.__runSave();
            return { data: { score: R.score, rounds: Math.max(0, R.round - 1), secret: R.secret },
                     error: null };
          }
          if (name === 'run_guess') {
            const R = window.__run;
            if (!R.active) return { data: null, error: { message: 'no_run' } };
            if (args.p_guess < R.rangeMin || args.p_guess > R.rangeMax) {
              return { data: null, error: { message: 'out_of_range' } };
            }
            const d = Math.abs(args.p_guess - R.secret);
            const tier = d === 0 ? 8 : (d <= 3 ? 7 : (d <= 20 ? 5 : 1));
            R.moves++;
            R.movesLog.push({ guess: args.p_guess, tier: tier });
            window.__runSave();
            if (d === 0) {
              const span = R.rangeMax - R.rangeMin + 1;
              const points = Math.round(100 * R.round * (Math.max(1, Math.ceil(Math.log2(span))) / R.moves));
              R.score += points;
              window.__runSave();
              const was = R.secret;
              window.__runDeal(R.round + 1);
              return { data: { tier: tier, roundWon: true, points: points, secret: was,
                               state: window.__runSnapshot() }, error: null };
            }
            if (R.moves >= R.allowed) {
              const was = R.secret;
              R.active = false;
              window.__runSave();
              return { data: { tier: tier, over: true, secret: was, score: R.score,
                               rounds: Math.max(0, R.round - 1), state: window.__runSnapshot() },
                       error: null };
            }
            return { data: { tier: tier, state: window.__runSnapshot() }, error: null };
          }
          if (name === 'list_matches') return { data: window.__matches || [], error: null };
          if (name === 'match_state') return { data: window.__matchState(), error: null };
          if (name === 'challenge_friend') return { data: 1, error: null };
          if (name === 'respond_challenge') return { data: args.p_accept ? 'active' : 'declined', error: null };
          if (name === 'leave_match') return { data: true, error: null };
          if (name === 'match_guess') {
            const M = window.__match;
            if (M.cur !== M.seat) return { data: null, error: { message: 'not_your_turn' } };
            const d = Math.abs(args.p_guess - M.secret);
            const tier = d === 0 ? 8 : (d <= 3 ? 7 : (d <= 20 ? 5 : 1));
            M.moves.push({ seat: M.cur, guess: args.p_guess, tier: tier });
            if (d === 0) { M.roundOver = true; M.roundWinner = M.cur; M.wins[M.cur]++; }
            else if (!M.armed) { M.cur = 1 - M.cur; }
            M.armed = false;
            return { data: tier, error: null };
          }
          if (name === 'use_match_token') {
            const M = window.__match;
            M.armed = !!args.p_arm;
            M.tokens[M.seat] += args.p_arm ? -1 : 1;
            return { data: M.armed, error: null };
          }
          if (name === 'send_phrase') {
            const M = window.__match;
            if (['hi','hot','cold','nice','wow','think','hurry','gg'].indexOf(args.p_code) < 0) {
              return { data: null, error: { message: 'bad_phrase' } };
            }
            M.chat = M.chat || [];
            M.chat.push({ id: M.chat.length + 1, seat: M.seat, code: args.p_code, ago: 0 });
            return { data: true, error: null };
          }
          if (name === 'do_forced_turn') {
            const M = window.__match;
            const kind = M.forced;
            M.forced = null;
            if (kind === 'skip') { M.moves.push({ seat: M.cur, timeout: false, guess: 0, tier: 0 }); }
            M.cur = 1 - M.cur;
            return { data: kind, error: null };
          }
          if (name === 'next_match_round') {
            const M = window.__match;
            M.round++; M.roundOver = false; M.roundWinner = null;
            M.moves = []; M.tokens = [1, 1]; M.cur = 1 - M.starter; M.starter = M.cur;
            return { data: true, error: null };
          }
          // Рейтинговый онлайн: очередь и подбор живут в window.__rankedQ,
          // тест сам решает, когда соперник «нашёлся»
          if (name === 'ranked_status') return { data: window.__ranked(), error: null };
          if (name === 'join_ranked_queue') {
            const Q = window.__rankedQ;
            if (Q.matchId) return { data: { matchId: Q.matchId }, error: null };
            Q.inQueue = true;
            Q.joined = Date.now();
            return { data: { matchId: null, waiting: true }, error: null };
          }
          if (name === 'leave_ranked_queue') {
            window.__rankedQ.inQueue = false;
            return { data: true, error: null };
          }
          if (name === 'elo_leaderboard') return { data: window.__eloTop || [], error: null };
          if (name === 'get_pin_hint') return { data: opts.hint === undefined ? 'номер дома' : opts.hint, error: null };
          return { data: true, error: null };
        }
      })
    };
    // Забег на сервере переживает перезагрузку вкладки — заглушка должна тоже,
    // иначе проверка «игра пережила закрытие приложения» смотрит в пустоту
    window.__runSave = function () {
      try { localStorage.setItem('__stub_run', JSON.stringify(window.__run)); } catch (e) {}
    };
    window.__run = (function () {
      try {
        const raw = localStorage.getItem('__stub_run');
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return { active: false, round: 1, score: 0, rangeMin: 1, rangeMax: 10,
               allowed: 5, moves: 0, movesLog: [], frost: false, best: 0, secret: 1 };
    })();
    window.__runDeal = function (round) {
      const R = window.__run;
      // та же кривая, что в игре: диапазон растёт, попыток даётся по формуле
      const size = Math.max(10, Math.round(Math.min(10 * Math.pow(2.2, round - 1), 2000) / 10) * 10);
      R.round = round;
      R.rangeMin = R.frost ? -Math.floor(size / 2) : 1;
      R.rangeMax = R.frost ? Math.floor(size / 2) : size;
      const span = R.rangeMax - R.rangeMin + 1;
      R.allowed = Math.max(3, Math.min(Math.max(1, Math.ceil(Math.log2(span))) + Math.max(0, 5 - (round - 1)),
                                       Math.max(2, Math.ceil(span * 0.6))) - Math.max(0, round - 8));
      R.moves = 0;
      R.movesLog = [];
      R.secret = R.rangeMin + Math.floor((span) / 2);
      window.__runSave();
    };
    window.__runSnapshot = function () {
      const R = window.__run;
      return { active: R.active, round: R.round, score: R.score, rangeMin: R.rangeMin,
               rangeMax: R.rangeMax, allowed: R.allowed, moves: R.moves,
               movesLog: R.movesLog.slice(), frost: R.frost, best: R.best };
    };

    window.__rankedQ = { inQueue: false, matchId: null, queue: 1, elo: 1000,
                         games: 0, lastAgo: null, joined: 0 };
    window.__ranked = function () {
      const Q = window.__rankedQ;
      return { matchId: Q.matchId, inQueue: Q.inQueue && !Q.matchId,
               waited: Q.inQueue ? Math.floor((Date.now() - Q.joined) / 1000) : 0,
               queue: Q.queue, elo: Q.elo, games: Q.games, lastAgo: Q.lastAgo };
    };

    // Сервер отдаёт число только когда раунд кончился — заглушка обязана так же,
    // иначе проверка «ответ не виден» пройдёт впустую
    window.__match = { id: 1, seat: 0, status: 'active', names: ['Лев', 'Кира'],
      winsNeeded: 3, rangeMin: 1, rangeMax: 100, frost: false, round: 1,
      wins: [0, 0], cur: 0, starter: 0, tokens: [1, 1], armed: false,
      roundOver: false, roundWinner: null, matchOver: false, moves: [], secret: 42 };
    window.__matchState = function () {
      const M = window.__match;
      const open = !M.roundOver && !M.matchOver;
      return { id: M.id, seat: M.seat, names: M.names, status: M.status,
        winsNeeded: M.winsNeeded, rangeMin: M.rangeMin, rangeMax: M.rangeMax, frost: M.frost,
        round: M.round, wins: M.wins, cur: M.cur, tokens: M.tokens, armed: M.armed,
        roundOver: M.roundOver, roundWinner: M.roundWinner, matchOver: M.matchOver,
        moves: M.moves.map(mv => mv.timeout
          ? { seat: mv.seat, timeout: true }
          : (mv.hidden ? { seat: mv.seat, hidden: true }
                       : { seat: mv.seat, guess: mv.guess, tier: mv.tier })),
        secret: open ? null : M.secret,
        bonusesOn: !!M.bonusesOn, fog: M.fog || [false, false],
        blind: M.blind || [false, false], autoLava: M.autoLava || [false, false],
        skip: M.skip || [false, false], shortMemory: M.shortMemory || [false, false],
        rush: M.rush || [0, 0], nearBonus: !!M.nearBonus,
        lastBonus: M.lastBonus || null, lastBonusBy: M.lastBonusBy || 0,
        lastTimeout: !!M.lastTimeout, forced: M.forced || null, chat: M.chat || [],
        ranked: !!M.ranked,
        forfeitBy: M.forfeitBy === undefined ? null : M.forfeitBy,
        eloDelta: M.eloDelta || null,
        elo: M.elo === undefined ? 1000 : M.elo,
        turnSeconds: M.turnSeconds || 30,
        secondsLeft: M.secondsLeft === undefined ? 30 : M.secondsLeft,
        updatedAt: '2026-01-01T00:00:00Z' };
    };

    if (opts.user) {
      localStorage.setItem('hc_run_user', opts.user);
      localStorage.setItem('hc_run_pin', '1234');
    }
    localStorage.setItem('hc_lang', opts.lang || 'ru');
  };
}

// Ставит заглушку на страницу: обе части — и функция, и её настройки
async function applyStub(page, opts) {
  await page.addInitScript(stubSupabase(opts || {}), opts || {});
}

// Мини-фреймворк: собираем результаты, в конце печатаем и возвращаем код выхода
const results = [];

function check(name, condition, detail) {
  results.push({ name, ok: !!condition, detail: detail || '' });
}

function report() {
  let failed = 0;
  for (const r of results) {
    if (!r.ok) failed++;
    console.log((r.ok ? '  ok   ' : '  FAIL ') + r.name + (r.detail ? '  — ' + r.detail : ''));
  }
  console.log('\n' + (results.length - failed) + ' из ' + results.length + ' проверок пройдено');
  return failed;
}

module.exports = { GAME_URL, launchOptions, stubSupabase, applyStub, check, report, results };
