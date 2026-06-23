// ---------------------------------------------------------------------------
//  mentalMath.js · procedurally-generated mental-arithmetic drills.
//  No data file, effectively infinite. Each generator returns:
//    { prompt, answer, tol }   tol = absolute tolerance (0 = exact match)
//  Quant first-rounds love fast arithmetic, % estimation, and PnL-style sums.
// ---------------------------------------------------------------------------

const ri = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const GENERATORS = {
  mult2x1: () => {
    const a = ri(12, 99), b = ri(3, 9);
    return { prompt: `${a} × ${b}`, answer: a * b, tol: 0 };
  },
  mult2x2: () => {
    const a = ri(11, 99), b = ri(11, 99);
    return { prompt: `${a} × ${b}`, answer: a * b, tol: 0 };
  },
  addsub: () => {
    const a = ri(120, 980), b = ri(120, 980);
    if (Math.random() < 0.5) return { prompt: `${a} + ${b}`, answer: a + b, tol: 0 };
    const [hi, lo] = a >= b ? [a, b] : [b, a];
    return { prompt: `${hi} − ${lo}`, answer: hi - lo, tol: 0 };
  },
  percent: () => {
    const p = pick([5, 10, 12.5, 15, 20, 25, 30, 40, 75]);
    const base = ri(2, 40) * 20; // clean-ish base
    return { prompt: `${p}% of ${base}`, answer: (p / 100) * base, tol: 0.01 };
  },
  fracDec: () => {
    const b = pick([3, 6, 7, 8, 9, 11, 12, 16]);
    const a = ri(1, b - 1);
    return { prompt: `${a}/${b} as a decimal (2 dp)`, answer: Math.round((a / b) * 100) / 100, tol: 0.011 };
  },
  pnl: () => {
    const sh = ri(2, 40) * 50;
    const px = ri(2, 60) / 4; // quarter-dollar prices
    return { prompt: `${sh} shares at $${px.toFixed(2)} — total $?`, answer: sh * px, tol: 0.01 };
  },
  estimate: () => {
    const a = ri(180, 9800), b = ri(7, 89);
    return { prompt: `Estimate ${a} ÷ ${b} (within 10%)`, answer: a / b, tol: (a / b) * 0.1 };
  },
  sqrtish: () => {
    const n = ri(10, 95);
    return { prompt: `${n}² `, answer: n * n, tol: 0 };
  },
};

// Difficulty tiers control which generators are in the pool.
export const LEVELS = {
  warmup: ["mult2x1", "addsub", "percent", "sqrtish"],
  standard: ["mult2x1", "mult2x2", "addsub", "percent", "fracDec", "pnl", "sqrtish"],
  hard: ["mult2x2", "addsub", "percent", "fracDec", "pnl", "estimate"],
};

export function genQuestion(level = "standard") {
  const key = pick(LEVELS[level] || LEVELS.standard);
  return { ...GENERATORS[key](), kind: key };
}

// Is the user's numeric answer acceptable?
export function checkAnswer(q, raw) {
  const val = Number(String(raw).replace(/[, $]/g, ""));
  if (Number.isNaN(val)) return false;
  return Math.abs(val - q.answer) <= q.tol + 1e-9;
}

export function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
