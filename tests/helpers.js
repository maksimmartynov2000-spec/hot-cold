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
          if (name === 'send_friend_request') return { data: 'outgoing', error: null };
          if (name === 'respond_friend_request') return { data: args.p_accept ? 'friend' : 'declined', error: null };
          if (name === 'remove_friend') return { data: true, error: null };

          // Матчи: заглушка ведёт себя как сервер — держит состояние, проверяет
          // очередь и НЕ отдаёт загаданное число, пока раунд не кончился
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
          if (name === 'next_match_round') {
            const M = window.__match;
            M.round++; M.roundOver = false; M.roundWinner = null;
            M.moves = []; M.tokens = [1, 1]; M.cur = 1 - M.starter; M.starter = M.cur;
            return { data: true, error: null };
          }
          if (name === 'get_pin_hint') return { data: opts.hint === undefined ? 'номер дома' : opts.hint, error: null };
          return { data: true, error: null };
        }
      })
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
        moves: M.moves.map(mv => ({ seat: mv.seat, guess: mv.guess, tier: mv.tier })),
        secret: open ? null : M.secret, updatedAt: '2026-01-01T00:00:00Z' };
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
