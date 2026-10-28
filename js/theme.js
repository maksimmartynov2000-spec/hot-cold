// Тема: тёмная, светлая или «как в телефоне» (auto). Файл грузится в <head>,
// до первой отрисовки: из скриптов в конце страницы светлая тема успела бы
// мигнуть тёмной. «auto» следит за телефоном и переключается вместе с ним
function themeChoice() {
  try { return localStorage.getItem('hc_theme') || 'auto'; } catch (e) { return 'auto'; }
}
function applyTheme() {
  var c = themeChoice();
  var light = c === 'light' || (c === 'auto' && window.matchMedia('(prefers-color-scheme: light)').matches);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = light ? '#fff7ee' : '#140f33';
}
applyTheme();
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
