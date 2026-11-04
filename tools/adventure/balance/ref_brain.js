// Прежний мозг бота — для «среднего игрока» в симуляции баланса
function refCandidates(moves, seat, flags, careless) {
  // Бот под помехой не видит ходы после неё — как человек. Номер хода — по
  // исходному списку, до отсева, иначе отметка съедет
  let seen = moves.filter((m, i) => !m.timeout && typeof m.guess === 'number' &&
                               m.labelIndex !== null && m.labelIndex !== undefined &&
                               !(flags.fog && m.p !== seat && i >= (flags.fogFrom || 0)) &&
                               !(flags.blind && m.p === seat && i >= (flags.blindFrom || 0)));
  const keep = careless ? 1 : (flags.shortMemory ? 2 : seen.length);
  seen = seen.slice(Math.max(0, seen.length - keep));
  const bands = reviewBands(FEEDBACK_META);
  const cand = new Uint8Array(RANGE_MAX - RANGE_MIN + 1).fill(1);
  seen.forEach(m => narrow(cand, RANGE_MIN, bands, m.guess, m.labelIndex));
  // Знание из бонусов (рентген, половина) бот тоже использует
  const k = flags.know;
  if (k && (k.parity !== undefined || k.half)) {
    const mid = halfMark();
    for (let i = 0; i < cand.length; i++) {
      const v = i + RANGE_MIN;
      if (k.parity !== undefined && Math.abs(v) % 2 !== k.parity) cand[i] = 0;
      if (k.half === 'low' && v > mid) cand[i] = 0;
      if (k.half === 'high' && v <= mid) cand[i] = 0;
    }
  }
  // Ответы честные, загаданное всегда среди возможных. На всякий случай
  if (!cand.includes(1)) cand.fill(1);
  return cand;
}
function refPool(cand, best, thr) {
  const scan = infoScan(cand, RANGE_MIN, RANGE_MAX, reviewBands(FEEDBACK_META));
  let pool = [];
  for (let x = RANGE_MIN; x <= RANGE_MAX; x++) {
    const h = scan.H(x);
    if (best ? h >= scan.hBest - 1e-9 : h >= thr * scan.hBest - 1e-9) pool.push(x);
  }
  if (best) {
    const hit = pool.filter(x => cand[x - RANGE_MIN]);
    if (hit.length) pool = hit;
  }
  return pool;
}
function refPick(moves, seat, flags, level, rnd) {
  rnd = rnd || Math.random;
  const cand = refCandidates(moves, seat, flags, rnd() < 0.9 * (1 - level) * (1 - level));
  const left = [];
  for (let i = 0; i < cand.length; i++) if (cand[i]) left.push(i + RANGE_MIN);
  if (left.length === 1) return left[0];
  const pool = refPool(cand, rnd() < 0.05 + 0.9 * level, 0.85 * level);
  return pool[Math.floor(rnd() * pool.length)];
}
window.refCandidates = refCandidates; window.refPick = refPick;
