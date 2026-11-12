// ================= ГОЛОСА ПИТОМЦЕВ, ЗВУКИ ИГРЫ, МУЗЫКА =================
// Голоса и звуки синтезируются на лету (Web Audio), как ноты ходов в
// js/game.js: файлов нет, весят ноль, работают без сети, лицензий не нужно.
// Выключаются той же кнопкой «Звук». Музыка — файлами music/*.m4a
// (MUSIC_TRACKS), у неё свой выключатель «Музыка»; пока файлов нет
// (MUSIC_READY = false), выключателя не видно и ничего не грузится.

// ---------- кирпичики ----------
function sndCtx() {
  if (!soundOn) return null;
  try {
    // Контекст — при первом касании: iOS не даёт звучать без действия игрока
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch (e) { return null; }
}
// Тон: частота f (к концу — to), форма волны, огибающая, дрожание (vib — доля
// частоты, rate — Гц), фильтр (lp — срез сверху, bp — полоса)
function sTone(c, o) {
  const t0 = c.currentTime + (o.at || 0), dur = o.dur || 0.15, vol = (o.vol || 0.2) * SND_VOL * sndScale;
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(o.f, t0);
  if (o.mid) osc.frequency.exponentialRampToValueAtTime(o.mid, t0 + dur * 0.4);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  let node = osc;
  if (o.vib) {
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = o.rate || 6; lg.gain.value = o.f * o.vib;
    lfo.connect(lg).connect(osc.frequency); lfo.start(t0); lfo.stop(t0 + dur + 0.05);
  }
  if (o.lp || o.bp) {
    const fl = c.createBiquadFilter();
    fl.type = o.bp ? 'bandpass' : 'lowpass'; fl.frequency.value = o.bp || o.lp; fl.Q.value = o.q || (o.bp ? 4 : 0.7);
    node.connect(fl); node = fl;
  }
  const a = o.attack || 0.012;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + a);
  if (o.trem) {
    // Дрожь: громкость вверх-вниз (замёрз)
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = o.trem; lg.gain.value = vol * 0.6;
    lfo.connect(lg).connect(g.gain); lfo.start(t0); lfo.stop(t0 + dur + 0.05);
  }
  g.gain.setValueAtTime(vol, t0 + Math.max(a, dur * 0.55));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  node.connect(g).connect(sndOut(c));
  osc.start(t0); osc.stop(t0 + dur + 0.05);
}
// Шум: щелчок, вздох, фырканье, пар — шум через полосовой фильтр
let sndNoiseBuf = null;
function sNoise(c, o) {
  if (!sndNoiseBuf) {
    sndNoiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = sndNoiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = c.currentTime + (o.at || 0), dur = o.dur || 0.1, vol = (o.vol || 0.2) * SND_VOL * sndScale;
  const src = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
  src.buffer = sndNoiseBuf;
  fl.type = o.type || 'bandpass'; fl.Q.value = o.q || 1.2;
  fl.frequency.setValueAtTime(o.f || 1000, t0);
  if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + (o.attack || 0.008));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(fl).connect(g).connect(sndOut(c));
  src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.05);
}
// Общий выход с мягким ограничителем: несколько звуков разом не хрипят
const SND_VOL = 1;
let sndScale = 1;   // голос питомца в партии — вполовину
let sndBus = null;
function sndOut(c) {
  if (sndBus && sndBus.context === c) return sndBus;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4;
  comp.connect(c.destination);
  sndBus = comp;
  return comp;
}

// ---------- голоса питомцев ----------
// У каждого свой «голос» — одна фраза, которую он говорит выше или ниже, короче
// или дольше: барсук фыркает, филин ухает, тукан щебечет, хамелеон булькает,
// краб щёлкает клешнями, пингвин крякает. p — высота (1 — обычная), len — длина,
// shape — интонация: up (радость), down (грусть), flat
const PET_CALL = {
  badger(c, at, p, len, shape) {
    sNoise(c, { at, dur: 0.07 * len, f: 900 * p, to: 500 * p, vol: 0.25, q: 2 });
    sTone(c, { at: at + 0.03, dur: 0.16 * len, type: 'triangle', f: 190 * p, to: (shape === 'up' ? 290 : shape === 'down' ? 140 : 200) * p, vol: 0.32, lp: 900 });
  },
  owl(c, at, p, len, shape) {
    sTone(c, { at, dur: 0.32 * len, f: 400 * p, mid: 440 * p, to: (shape === 'up' ? 470 : shape === 'down' ? 300 : 390) * p, vol: 0.3, attack: 0.06, vib: 0.015, rate: 7 });
    sNoise(c, { at, dur: 0.25 * len, f: 500 * p, vol: 0.05, q: 0.8, attack: 0.05 });
  },
  toucan(c, at, p, len, shape) {
    const n = shape === 'down' ? 1 : 2;
    for (let i = 0; i < n; i++) sTone(c, { at: at + i * 0.09, dur: 0.08 * len, f: (shape === 'down' ? 2400 : 1700) * p, to: (shape === 'down' ? 1500 : 2700 + i * 300) * p, vol: 0.2 });
  },
  cham(c, at, p, len, shape) {
    sTone(c, { at, dur: 0.12 * len, f: (shape === 'down' ? 900 : 500) * p, to: (shape === 'down' ? 380 : 1150) * p, vol: 0.26 });
    sTone(c, { at: at + 0.1 * len, dur: 0.06, f: 1400 * p, to: 900 * p, vol: 0.12 });
  },
  crab(c, at, p, len, shape) {
    const n = shape === 'down' ? 1 : 2;
    for (let i = 0; i < n; i++) {
      sNoise(c, { at: at + i * 0.07, dur: 0.035, f: 3200 * p, vol: 0.4, q: 6, attack: 0.002 });
      sTone(c, { at: at + i * 0.07, dur: 0.05, type: 'square', f: 760 * p, to: 640 * p, vol: 0.08, lp: 2200 });
    }
    if (shape !== 'flat') sTone(c, { at: at + 0.15, dur: 0.14 * len, type: 'triangle', f: (shape === 'up' ? 520 : 420) * p, to: (shape === 'up' ? 700 : 280) * p, vol: 0.18 });
  },
  penguin(c, at, p, len, shape) {
    sTone(c, { at, dur: 0.17 * len, type: 'sawtooth', f: 520 * p, to: (shape === 'up' ? 640 : shape === 'down' ? 360 : 470) * p, vol: 0.26, bp: 1300 * p, q: 3 });
    sTone(c, { at, dur: 0.15 * len, type: 'square', f: 260 * p, to: (shape === 'up' ? 320 : 200) * p, vol: 0.06, lp: 1200 });
  },
};
// Вздох и пар — общие у всех
function sBreath(c, at, n) { for (let i = 0; i < n; i++) sNoise(c, { at: at + i * 0.2, dur: 0.14, f: 1500, to: 900, vol: 0.13, q: 0.7, attack: 0.03 }); }
function sSnore(c, at) { [0, 0.75].forEach(d => sNoise(c, { at: at + d, dur: 0.6, type: 'lowpass', f: 260, to: 520, vol: 0.2, q: 1, attack: 0.25 })); }
function sSparkle(c, at) { [1568, 2093, 2637, 3136].forEach((f, i) => sTone(c, { at: at + i * 0.06, dur: 0.22, type: 'triangle', f, vol: 0.09 })); }
// Реакция → что питомец говорит
const PET_VOICE = {
  flip: (c, k) => { PET_CALL[k](c, 0, 1.1, 1, 'up'); sNoise(c, { at: 0.05, dur: 0.35, f: 600, to: 2400, vol: 0.07, q: 0.6, attack: 0.15 }); },
  win: (c, k) => { PET_CALL[k](c, 0, 1, 1, 'up'); PET_CALL[k](c, 0.2, 1.25, 1, 'up'); sSparkle(c, 0.35); },
  lose: (c, k) => PET_CALL[k](c, 0, 0.85, 1.8, 'down'),
  element: (c, k) => { [0, 0.18, 0.36].forEach((d, i) => PET_CALL[k](c, d, 1 + i * 0.12, 1, 'up')); },
  roar: (c, k) => { PET_CALL[k](c, 0, 0.7, 2, 'flat'); PET_CALL[k](c, 0.3, 0.8, 1.6, 'up'); },
  sleep: (c, k) => { PET_CALL[k](c, 0, 0.8, 1.4, 'down'); sSnore(c, 0.4); },
  hot: (c, k) => { sBreath(c, 0, 3); PET_CALL[k](c, 0.6, 1, 0.8, 'flat'); },
  cold: (c, k) => {
    PET_CALL[k](c, 0, 0.9, 1, 'flat');
    sTone(c, { at: 0.2, dur: 0.6, type: 'triangle', f: 300, to: 280, vol: 0.12, trem: 22, lp: 1200 });
  },
};
// В партии голос тише и чуть позже ноты хода: нота — главное, питомец — вдогонку
let petVoiceAt = 0;
function petVoice(kind, name, quiet) {
  const c = sndCtx();
  const say = PET_VOICE[name];
  if (!c || !say || !PET_CALL[kind]) return;
  // Два раза подряд за полсекунды не говорит: сальто по сальто не превращается в кашу
  if (Date.now() - petVoiceAt < 450) return;
  petVoiceAt = Date.now();
  const run = () => {
    // Все тоны фразы ставятся в очередь сразу — множитель громкости действует только на них
    sndScale = quiet ? 0.5 : 1;
    try { say(c, kind); } catch (e) {}
    sndScale = 1;
  };
  if (quiet) setTimeout(run, 220); else run();
}

// ---------- звуки игры ----------
const SFX = {
  // Лёгкое касание кнопки
  tap: c => sTone(c, { dur: 0.045, f: 1250, to: 950, vol: 0.07 }),
  // Покупка: монетки звенят
  buy: c => {
    [1319, 1568, 1976, 2637].forEach((f, i) => sTone(c, { at: i * 0.07, dur: 0.18, type: 'triangle', f, vol: 0.14 }));
    sNoise(c, { at: 0.02, dur: 0.3, f: 6000, vol: 0.06, q: 2 });
  },
  // Надеть облик или ауру: «вжух» и звон
  equip: c => { sNoise(c, { dur: 0.28, f: 500, to: 3000, vol: 0.1, q: 0.8, attack: 0.12 }); sTone(c, { at: 0.22, dur: 0.3, type: 'triangle', f: 1760, vol: 0.12 }); },
  // Сундук: скрип крышки и россыпь
  chest: c => {
    sTone(c, { dur: 0.25, type: 'sawtooth', f: 160, to: 240, vol: 0.06, lp: 700 });
    [523, 659, 784, 1047, 1319].forEach((f, i) => sTone(c, { at: 0.25 + i * 0.08, dur: 0.28, type: 'triangle', f, vol: 0.13 }));
    sSparkle(c, 0.65);
  },
  // Новый уровень питомца: короткие фанфары
  level: c => { [392, 523, 659, 784].forEach((f, i) => sTone(c, { at: i * 0.1, dur: i === 3 ? 0.5 : 0.14, type: 'square', f, vol: 0.07, lp: 2400 })); sSparkle(c, 0.4); },
};
function sfx(name) {
  const c = sndCtx();
  if (c && SFX[name]) { try { SFX[name](c); } catch (e) {} }
}
// Касание кнопок меню, вкладок и окон. На доске — нет: там у хода своя нота
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('button, .mode-btn, [role="button"]');
  if (!b || b.disabled || (typeof screen !== 'undefined' && screen === 'game' && !b.closest('.modal-backdrop'))) return;
  sfx('tap');
}, true);

// ---------- музыка ----------
// Файлы появятся позже (подсказки для Gemini — у автора). Громкость — тихо
// в меню и Приключении, совсем тихо в партии: дети считают
const MUSIC_READY = false;
const MUSIC_TRACKS = { menu: 'music/menu.m4a', adventure: 'music/adventure.m4a', game: 'music/game.m4a' };
const MUSIC_VOL = { menu: 0.35, adventure: 0.35, game: 0.12 };
const MUSIC_KEY = 'hc_music';
let musicOn = (() => { try { return localStorage.getItem(MUSIC_KEY) !== '0'; } catch (e) { return true; } })();
let musicEl = null, musicName = null, musicFade = null;
function musicTrackFor(scr) { return scr === 'adventure' ? 'adventure' : scr === 'game' ? 'game' : 'menu'; }
function musicFor(scr) {
  if (!MUSIC_READY) return;
  const want = musicOn ? musicTrackFor(scr) : null;
  if (want === musicName && musicEl) { musicVolume(MUSIC_VOL[want] || 0.3); return; }
  musicName = want;
  const old = musicEl;
  if (old) musicFadeTo(old, 0, () => old.pause());
  musicEl = null;
  if (!want) return;
  const a = new Audio(MUSIC_TRACKS[want]);
  a.loop = true; a.volume = 0; a.preload = 'auto';
  a.onerror = () => { if (musicEl === a) musicEl = null; };
  musicEl = a;
  musicPlay();
}
function musicVolume(v) { if (musicEl) musicFadeTo(musicEl, v); }
function musicFadeTo(a, v, done) {
  clearInterval(a._fade);
  a._fade = setInterval(() => {
    const d = v - a.volume;
    if (Math.abs(d) < 0.03) { a.volume = v; clearInterval(a._fade); if (done) done(); return; }
    a.volume = Math.max(0, Math.min(1, a.volume + Math.sign(d) * 0.03));
  }, 40);
}
function musicPlay() {
  if (!musicEl) return;
  const a = musicEl;
  const p = a.play();
  // iOS не даёт начать без касания: начнём с первого же
  if (p && p.catch) p.then(() => musicFadeTo(a, MUSIC_VOL[musicName] || 0.3)).catch(() => {});
  else musicFadeTo(a, MUSIC_VOL[musicName] || 0.3);
}
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (musicEl && musicEl.paused && !document.hidden) musicPlay(); }, { passive: true }));
// Свернули игру — музыка молчит
document.addEventListener('visibilitychange', () => {
  if (!musicEl) return;
  if (document.hidden) musicEl.pause(); else musicPlay();
});
function toggleMusic() {
  musicOn = !musicOn;
  try { localStorage.setItem(MUSIC_KEY, musicOn ? '1' : '0'); } catch (e) {}
  musicFor(typeof screen !== 'undefined' ? screen : 'mode');
  renderMusicToggles();
}
// Выключатели: в профиле — рядом со звуком, в партии — в меню вида
function renderMusicToggles() {
  const L = t();
  ['pfMusicRow', 'vizMusic'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('hidden', !MUSIC_READY); });
  const lbl = document.getElementById('tMusicLabel'); if (lbl) lbl.textContent = L.music;
  const btn = document.getElementById('musicBtn');
  if (btn) { btn.textContent = musicOn ? '🎵' : '🔕'; btn.setAttribute('aria-label', L.music); }
  const viz = document.getElementById('vizMusic');
  if (viz) {
    viz.classList.toggle('on', musicOn);
    viz.querySelector('.vr-ic').textContent = musicOn ? '🎵' : '🔕';
    document.getElementById('tVizMusic').textContent = L.music;
  }
}
