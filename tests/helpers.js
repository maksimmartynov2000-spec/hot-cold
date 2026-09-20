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
          if (name === 'get_pin_hint') return { data: opts.hint === undefined ? 'номер дома' : opts.hint, error: null };
          return { data: true, error: null };
        }
      })
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
