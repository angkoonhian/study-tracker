// ---------------------------------------------------------------------------
//  sm2.js  ·  SuperMemo-2 spaced repetition (pure, no side effects)
//
//  One small, well-bounded unit with a single job: given a card's current
//  schedule state and how the user graded their recall, compute the next
//  schedule state. Used by BOTH flashcards and "spaced problem re-solve" — the
//  same forgetting curve applies whether you're recalling a fact or re-solving
//  a whole problem.
//
//  Pure functions only: every function takes `now` (ms epoch) explicitly so the
//  scheduling is deterministic and unit-testable. The app passes Date.now();
//  tests pass a fixed timestamp. No localStorage, no Date.now() inside.
// ---------------------------------------------------------------------------

export const DAY = 86_400_000; // ms in a day

// The four review buttons map to SM-2 quality grades (0..5).
export const GRADES = {
  again: 0, // total blank / wrong — reset
  hard: 3, // recalled with serious difficulty
  good: 4, // recalled after some thought
  easy: 5, // instant, effortless recall
};

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;

// Fresh schedule state for a brand-new card/problem — due immediately.
export function newSchedule(now = Date.now()) {
  return { ease: DEFAULT_EASE, interval: 0, reps: 0, lapses: 0, due: now, last: null };
}

export function isDue(state, now = Date.now()) {
  if (!state) return true;
  return (state.due ?? 0) <= now;
}

// Canonical SM-2 ease update.
function nextEase(ease, grade) {
  const e = ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  return Math.max(MIN_EASE, Number(e.toFixed(4)));
}

// Given current `state` and a `grade` (0..5), return the next state.
export function schedule(state, grade, now = Date.now()) {
  const cur = state || newSchedule(now);
  const ease = nextEase(cur.ease ?? DEFAULT_EASE, grade);

  // Failed recall: reset the streak, count a lapse, see it again tomorrow.
  if (grade < 3) {
    return { ease, interval: 1, reps: 0, lapses: (cur.lapses ?? 0) + 1,
      due: now + 1 * DAY, last: now };
  }

  const reps = (cur.reps ?? 0) + 1;
  let interval;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 6;
  else interval = Math.round((cur.interval || 1) * ease);

  // Light Anki-style nudges so the three "pass" buttons feel distinct.
  if (grade === GRADES.hard) interval = Math.max(1, Math.round(interval * 0.8));
  else if (grade === GRADES.easy) interval = Math.round(interval * 1.3);

  return { ease, interval, reps, lapses: cur.lapses ?? 0,
    due: now + interval * DAY, last: now };
}

// Human-friendly "next review" label for a prospective grade, used on buttons.
export function previewInterval(state, grade, now = Date.now()) {
  const next = schedule(state, grade, now);
  const d = next.interval;
  if (grade < 3) return "1d";
  if (d < 1) return "<1d";
  if (d < 30) return `${d}d`;
  if (d < 365) return `${Math.round(d / 30)}mo`;
  return `${(d / 365).toFixed(1)}y`;
}
