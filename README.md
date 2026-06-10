# BigInterview Study Tracker

A single-page React + Vite app for running a **49-day big-tech interview prep plan**, with a full LeetCode problem bank, Anki-style spaced-repetition flashcards, spaced problem re-solves, and a progress dashboard — all **100% static, no database**.

## Why "no database"

All state lives in two places:

- **`localStorage`** — your live working copy as you click around.
- **`src/data/progress.json`** — a committed *published snapshot*. A fresh clone with empty localStorage hydrates from it, so **anyone who pulls `master` replicates exactly the progress you published**.

To publish your progress: open the app → header → **⬆ Publish snapshot** (downloads a `progress.json`) → replace `src/data/progress.json` with it → commit + push. The LeetCode session cookie is the one secret that is **never** included in a snapshot.

## Features

| View | What it does |
|------|--------------|
| **🔥 Today** | One prioritized queue: due flashcards + due problem re-solves + the next incomplete plan day. |
| **🗓 Tracker** | The original 49-day checklist (`PLAN`), unchanged. |
| **📚 Problem Bank** | All ~3,958 LeetCode problems (static snapshot). Search + filter by difficulty/topic/status, track status (todo/attempted/solved/review), schedule spaced re-solves, turn any problem into a flashcard, and optionally sync your real solved status from LeetCode. |
| **🃏 Flashcards** | SM-2 spaced repetition over three deck sources: auto-from-problem, seeded pattern/concept cards, and your own manual cards. |
| **📊 Dashboard** | Plan %, solved-by-difficulty, topic mastery (weak areas in red), 14-day activity, day streak, flashcard maturity. |

## Commands

```bash
npm run dev             # Vite dev server (also enables the LeetCode sync proxy)
npm run build           # production build → dist/
npm run preview         # serve the built dist/
npm run lint            # ESLint
npm test                # SM-2 spaced-repetition unit tests (Node's built-in runner)
npm run fetch:leetcode  # refresh the static LeetCode catalog → public/data/leetcode-problems.json
```

## LeetCode sync (optional)

There is no official LeetCode API, so sync is best-effort and routed through a Vite dev proxy (`/lc-api` in `vite.config.js`) to avoid CORS. It only works under `npm run dev`.

- **Public stats** — enter your username for aggregate solved counts + recent accepted submissions.
- **Full sync** — paste your `LEETCODE_SESSION` cookie (DevTools → Application → Cookies → leetcode.com) to auto-mark every solved problem in the bank. The cookie is stored only in your browser's localStorage and is never written to `progress.json`.

## Architecture

See `docs/superpowers/specs/2026-06-10-study-tracker-enhancements-design.md` for the full design. Key modules:

- `src/store/storage.js` — single owner of all persistence + export/import + reset-to-published.
- `src/srs/sm2.js` — pure SM-2 scheduler (unit-tested), shared by flashcards and problem re-solves.
- `src/lib/catalog.js` — loads/caches the static problem catalog.
- `src/leetcode/sync.js` — the only runtime call to leetcode.com.
- `src/ProblemBank.jsx`, `src/Flashcards.jsx`, `src/Dashboard.jsx`, `src/Today.jsx` — the four new views.
