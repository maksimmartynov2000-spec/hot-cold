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
// Подтянуть свою иконку и проверить, что сохранённый вход ещё наш
if (runAuth()) { syncProfile(); startSignals(); startSeen(); }
// Вернулся в игру — сразу отметиться «я здесь», не дожидаясь минуты
document.addEventListener('visibilitychange', () => { if (!document.hidden) markSeen(); });
checkPendingInvite();

checkRemoteConfig();
setInterval(checkRemoteConfig, 60000);
