// Запуск: обработчики полей, service worker, первый экран. Подключается
// последним — к этому моменту все функции из остальных файлов уже объявлены.

// ================= ИНИЦИАЛИЗАЦИЯ =================
document.getElementById('guessInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleGuess(); });
[['guessInput', 'guessSign'], ['finalInput', 'finalSign']].forEach(([id, signId]) => {
  document.getElementById(id).addEventListener('input', e => {
    filterNumberInput(e.target);
    renderSignBtn(id, signId);
    // Начали набирать новое число — старое замечание уже прочитано
    if (id === 'guessInput') setGuessNote('');
  });
});
document.getElementById('finalInput').addEventListener('keydown', e => { if (e.key === 'Enter') submitFinal(); });
document.getElementById('runPin').addEventListener('keydown', e => { if (e.key === 'Enter') runAuthSubmit(); });
document.getElementById('friendSearch').addEventListener('keydown', e => {
  if (e.key === 'Enter') searchStudents();
});
document.getElementById('friendSearch').addEventListener('input', e => {
  if (!e.target.value.trim()) loadSuggestions();
});

// Офлайн: страница открывается и играется без сети после первого захода
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// Общий ключ рекорда остался от прежней версии, и чей он — уже не узнать.
// Приписать его текущему аккаунту нельзя: именно так и появлялся чужой рекорд.
// Убираем; свой вернётся с сервера после первой же доигранной партии
try { localStorage.removeItem('hc_run_best'); } catch (e) {}

// Прежние версии держали незаконченный забег в браузере. Теперь он на
// сервере, и локальная копия только сбивала бы с толку
try { localStorage.removeItem('hc_run_state'); } catch (e) {}

// Подписи на прямой расставляются по ширине экрана, поэтому поворот телефона
// или смена размера окна требуют пересчёта
window.addEventListener('resize', () => { if (screen === 'game') renderNumberLine(); });

// Шкала расстояний раньше помнила, раскрыта ли она, и считала сыгранные
// партии. Теперь она окном по кнопке — эти записи больше ни к чему
try { localStorage.removeItem('hc_scale_open'); localStorage.removeItem('hc_games_done'); } catch (e) {}

// Поле ввода прижато к низу экрана. На iPhone клавиатура не сжимает страницу,
// а наезжает на неё — и поле оказалось бы под клавиатурой. Сколько она
// заняла, видно по visualViewport: на столько поле и поднимаем
function watchKeyboard() {
  const vv = window.visualViewport;
  if (!vv) return;
  const update = () => {
    const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
    document.documentElement.style.setProperty('--kb', kb + 'px');
    document.body.classList.toggle('kb-open', kb > 80);
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}
watchKeyboard();

captureInvite();
tutInit();
document.getElementById('langSwitcher').value = currentLang;
document.getElementById('winsNeeded').value = '3';
initChips();
applyTranslations();
showScreen('mode');
// Первый экран нарисован — показать (до этого видна только заставка-фон)
document.body.classList.remove('booting');
runSplash();
// Подтянуть свою иконку и проверить, что сохранённый вход ещё наш
if (runAuth()) { syncProfile(); startSignals(); startSeen(); }
// Вернулся в игру — сразу отметиться «я здесь», не дожидаясь минуты
document.addEventListener('visibilitychange', () => { if (!document.hidden) markSeen(); });
checkPendingInvite();

checkRemoteConfig();
setInterval(checkRemoteConfig, 60000);
// Тексты миров 6+ на своём языке — заранее, когда игра уже нарисовалась:
// service worker положит их в кеш, и Приключение откроется и без сети
setTimeout(() => advLoadPack(), 3000);

// ================= ЗАСТАВКА =================
// Логотип и градусник: ртуть поднимается по мере того, как готово меню —
// шрифты, картинки меню и питомца, данные из базы (профиль, монеты, питомец).
// Около двух секунд всегда, как у приложения; дольше 2,6 с не ждёт: что не
// успело, дорисуется в меню. Без входа и без сети данных не ждём. Под
// автотестами заставки нет (navigator.webdriver), кроме теста самой заставки
const SPLASH_MIN = 2000, SPLASH_MAX = 2600;
function runSplash() {
  const sp = document.getElementById('splash');
  if (!sp) return;
  if (navigator.webdriver && !window.__splash) { sp.remove(); return; }
  sp.classList.add('js');
  const tips = t().splashTips || [];
  const tip = document.getElementById('spTip');
  if (tips.length) { tip.textContent = tips[Math.floor(Math.random() * tips.length)]; requestAnimationFrame(() => tip.classList.add('show')); }
  const fill = document.getElementById('spFill');
  // Время — от начала загрузки страницы, а не от запуска скрипта
  const now = () => (window.performance && performance.now ? performance.now() : Date.now() - splashT0);
  let fonts = false;
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { fonts = true; });
  const auth = typeof runAuth === 'function' && runAuth() && typeof sb !== 'undefined' && !!sb;
  const imgsReady = () => {
    const imgs = [...document.querySelectorAll('#screenMode img, #petCard img')].filter(i => i.offsetParent);
    return !imgs.length ? 1 : imgs.filter(i => i.complete).length / imgs.length;
  };
  const dataReady = () => !auth ? 1 :
    ((typeof onlineInfoAt !== 'undefined' && onlineInfoAt ? 1 : 0) + (typeof shopWalletAt !== 'undefined' && shopWalletAt ? 1 : 0) +
     (typeof petLookAt !== 'undefined' && petLookAt ? 1 : 0)) / 3;
  const done = () => {
    clearInterval(timer);
    fill.style.setProperty('--p', 1);
    sp.classList.add('hot');
    setTimeout(() => { sp.classList.add('gone'); setTimeout(() => sp.remove(), 500); }, 280);
  };
  const timer = setInterval(() => {
    const el = now();
    const real = 0.15 * (fonts ? 1 : 0) + 0.25 * imgsReady() + 0.6 * dataReady();
    // Ртуть не обгоняет ни настоящую готовность, ни часы: к двум секундам — вверху
    fill.style.setProperty('--p', Math.max(0.3, Math.min(real, el / SPLASH_MIN)).toFixed(3));
    if ((el >= SPLASH_MIN && real >= 0.999) || el >= SPLASH_MAX) done();
  }, 100);
}
const splashT0 = Date.now();
