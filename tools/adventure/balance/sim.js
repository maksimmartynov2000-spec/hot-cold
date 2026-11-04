// Баланс: «средний игрок» (ПРЕЖНИЙ мозг ботов, уровень LP) против соперников Приключения.
// node tools/adventure/balance/sim.js N LP DIFF "0,1,2" [ROOT] [PATCH]  → строки "n rule won N"
// ROOT — копия игры, где нужные миры включены (по умолчанию — сам репозиторий)
const path = require('path');
const REPO = path.join(__dirname, '..', '..', '..');
const { chromium } = require(path.join(REPO, 'tests', 'node_modules', 'playwright'));
const { launchOptions, applyStub } = require(path.join(REPO, 'tests', 'helpers'));
const fs = require('fs');
const [N, LP, DIFF] = [+(process.argv[2] || 40), +(process.argv[3] || 0.45), process.argv[4] || 'normal'];
const LIST = (process.argv[5] || '0').split(',').filter(Boolean).map(Number);
const ROOT = process.argv[6] || REPO;
const PATCH = process.argv[7] || '';
const REF = fs.readFileSync(path.join(__dirname, 'ref_brain.js'), 'utf8');
(async () => {
  const b = await chromium.launch(launchOptions());
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await applyStub(p, { lang: 'ru', user: 'Максим' });
  await p.addInitScript(() => { localStorage.setItem('hc_tutorial', JSON.stringify({ done: [1, 2, 3], skipped: true })); localStorage.setItem('hc_adv_максим', '500'); });
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(500);
  await p.addScriptTag({ content: REF });
  const res = await p.evaluate(async ([N, LP, DIFF, LIST, PATCH]) => {
    if (PATCH) eval(PATCH);
    BOT_SPEED = 0; window.showRuleFlash = () => {}; window.botSayText = () => {}; window.soundForGuess = () => {};
    if (typeof showBonusFlash === 'function') window.showBonusFlash = () => {};
    localStorage.setItem('hc_adv_diff', DIFF);
    const out = [];
    const FIRE = {}; const _line = advLine; window.advLine = (n, kind, vars) => { if (kind === 'rule' || kind === 'a1' || kind === 'a2') FIRE[kind] = (FIRE[kind] || 0) + 1; return _line(n, kind, vars); };
    const playerMove = () => {
      const moves = history.filter(h => !hiddenRow(h.p, h)).map(h => ({ guess: h.guess, labelIndex: h.meta.labelIndex, p: h.p, timeout: !!h.timeout }));
      const flags = { fog: false, blind: false, shortMemory: D.shortMemory[0], know: D.know[0] };
      if (!D.armed && D.tokens[0] > 0 && moves.length) {
        const left = refCandidates(moves, 0, flags, false).reduce((a, c) => a + c, 0);
        if (left === 2 || (left === 3 && Math.random() < 0.5)) useToken(0);
      }
      let g = refPick(moves, 0, flags, LP);
      const k = D.know[0];
      if ((k.gt !== undefined && g <= k.gt) || (k.lt !== undefined && g >= k.lt)) {
        const lo = k.gt !== undefined ? k.gt + 1 : RANGE_MIN, hi = k.lt !== undefined ? k.lt - 1 : RANGE_MAX;
        if (lo <= hi) g = lo + Math.floor(Math.random() * (hi - lo + 1));
      }
      if (history.some(h => h.guess === g)) { const free = []; for (let v = RANGE_MIN; v <= RANGE_MAX; v++) if (!history.some(h => h.guess === v)) free.push(v); g = free[Math.floor(Math.random() * free.length)]; }
      duelPlay(g);
    };
    let rep = 0, botMoves = 0, imp = 0, far = 0, used = 0, rounds = 0, had = 0;
    for (const n of LIST) {
      let won = 0; const r0 = rounds; Object.keys(FIRE).forEach(k => delete FIRE[k]);
      for (let k = 0; k < N; k++) {
        quitToMenu(); startAdventure(n); stopBot();
        rounds++; if (D.tokens[1] > 0) had++;
        let guard = 0;
        while (!D.matchOver && guard++ < 800) {
          stopBot();
          if (D.roundOver) { nextRound(); rounds++; if (D.tokens[1] > 0) had++; continue; }
          if (localForced()) { doForcedTurn(D.cur === 1); continue; }
          if (D.cur === 1) {
            const before = history.length;
            // Что бот мог знать перед ходом — со всей памятью, как он видит (туман, слепота)
            const mv = history.map(h => ({ guess: h.guess, labelIndex: h.meta.labelIndex, p: h.p, timeout: !!h.timeout }));
            const fl = { fog: D.fog[1], blind: D.blind[1], shortMemory: false, fogFrom: D.fogFrom[1], blindFrom: D.blindFrom[1], know: D.know && D.know[1] };
            const full = refCandidates(mv, 1, fl, false);
            const forced = !!localForced();
            const tk = D.tokens[1], wasArmed = D.armed;
            const bands = reviewBands(FEEDBACK_META);
            const hot = mv.filter(h => !(D.fog[1] && h.p === 0)).reduce((a, h) => (!a || h.labelIndex > a.labelIndex ? h : a), null);
            botMove();
            if (!wasArmed && D.tokens[1] === tk - 1) used++;
            const m = history[history.length - 1];
            if (history.length > before && m && m.p === 1 && !forced && !m.forced) {
              botMoves++;
              if (history.slice(0, -1).some(h => h.guess === m.guess)) rep++;
              if (!full[m.guess - RANGE_MIN]) imp++;
              if (hot && hot.labelIndex >= 5 && hot.labelIndex < 8 && bandOf(Math.abs(m.guess - hot.guess), bands) < hot.labelIndex - 2) far++;
            }
          } else playerMove();
        }
        stopBot();
        if (D.wins[0] >= D.winsNeeded) won++;
      }
      const rr = rounds - r0; out.push(n + ' ' + vsBot.adv.rule + ' ' + won + ' ' + N + ' fires/round ' + ['rule', 'a1', 'a2'].map(k => ((FIRE[k] || 0) / rr).toFixed(2)).join(' '));
    }
    out.push('REP ' + rep + ' ' + botMoves + ' ' + imp + ' ' + far + ' ' + used + ' ' + rounds + ' ' + had);
    return out;
  }, [N, LP, DIFF, LIST, PATCH]);
  console.log(res.join('\n'));
  if (errs.length) console.log('ERR ' + [...new Set(errs)].join(' | '));
  await b.close();
})();
