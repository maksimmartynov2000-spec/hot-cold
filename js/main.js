// Запуск: обработчики полей, service worker, первый экран. Подключается
// последним — к этому моменту все функции из остальных файлов уже объявлены.

// ================= ИНИЦИАЛИЗАЦИЯ =================
document.getElementById('guessInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleGuess(); });
[['guessInput', 'guessSign'], ['finalInput', 'finalSign']].forEach(([id, signId]) => {
  document.getElementById(id).addEventListener('input', e => {
    filterNumberInput(e.target);
    renderSignBtn(id, signId);
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

captureInvite();
tutInit();
initScaleBox();
document.getElementById('langSwitcher').value = currentLang;
document.getElementById('winsNeeded').value = '3';
applyTranslations();
showScreen('mode');
// Подтянуть свою иконку и проверить, что сохранённый вход ещё наш
if (runAuth()) { syncProfile(); startSignals(); }
checkPendingInvite();

checkRemoteConfig();
setInterval(checkRemoteConfig, 60000);
