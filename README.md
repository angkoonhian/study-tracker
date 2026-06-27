# BigInterview Study Tracker

A single-page React + Vite app for big-tech and quant/prop-trading interview prep: a 49-day plan, a full LeetCode problem bank, a standalone DSA practice section (in-browser Python judge), a Trading Prep section (firm-specific DSA, Python trivia, firm guides, quant math), Anki-style spaced-repetition flashcards, an offline Flight Mode, and a progress dashboard — all **100% static, no database**, with a **dark / light theme toggle** (GeeksforGeeks-style; defaults to dark).

## Why "no database"

All state lives in two places:

- **`localStorage`** — your live working copy as you click around.
- **`src/data/progress.json`** — a committed *published snapshot*. A fresh clone with empty localStorage hydrates from it, so **anyone who pulls `master` replicates exactly the progress you published**.

To publish your progress: open the app → header → **Publish snapshot** (downloads a `progress.json`) → replace `src/data/progress.json` with it → commit + push. The LeetCode session cookie is the one secret that is **never** included in a snapshot. (Flight Mode progress is local-only; Trading Prep progress is publishable.)

## Features

| View | What it does |
|------|--------------|
| **Today** | One prioritized queue: due flashcards + due problem re-solves + the next incomplete plan day. |
| **Tracker** | Selectable **tracks** via a header switch: the main plan (49-day + quant) and a 5-week **HRT** (Hudson River Trading, Python) plan with DP/greedy + probability + format-rehearsal categories and a collapsible interview brief. Each track persists under its own storage key, so progress never collides. |
| **Problem Bank** | All ~3,958 LeetCode problems (static snapshot). Search + filter by difficulty/topic/status, track status, schedule spaced re-solves, turn any problem into a flashcard, optionally sync your real solved status from LeetCode. |
| **DSA** | Practice (in-browser Python judge over the core problem set) + a DSA guide. Promoted out of Flight Mode. |
| **Trading Prep** | Reconstructed quant/prop-firm interview content: Trading DSA (Python-judged), Python trivia/gotchas, per-firm interview guides, and quant/math pointers. Every item is labeled "reconstructed from public reports". |
| **Flashcards** | SM-2 spaced repetition over auto-from-problem, seeded pattern/concept, and manual cards. |
| **Flight Mode** | Fully offline practice: Brainteasers, Mental Math, System Design. |
| **Dashboard** | Plan %, solved-by-difficulty, topic mastery, 14-day activity, day streak, flashcard maturity. |

## Commands

```bash
npm run dev             # Vite dev server (also enables the LeetCode sync proxy)
npm run build           # production build → dist/
npm run preview         # serve the built dist/
npm run lint            # ESLint
npm test                # unit tests (SM-2 scheduler + storage slices), Node's built-in runner
npm run verify:flight   # headless judge: every DSA solution passes its tests
npm run verify:trading  # headless judge: every Trading DSA solution passes its tests
npm run fetch:leetcode  # refresh the static LeetCode catalog → public/data/leetcode-problems.json
```

The coding verifiers resolve a working Python interpreter (`python3` → `python` → `py`) and run via a temp file, so they work on Windows where `python3` is a Store stub.

## LeetCode sync (optional)

There is no official LeetCode API, so sync is best-effort and routed through a Vite dev proxy (`/lc-api` in `vite.config.js`) to avoid CORS. It only works under `npm run dev`.

- **Public stats** — enter your username for aggregate solved counts + recent accepted submissions.
- **Full sync** — paste your `LEETCODE_SESSION` cookie (DevTools → Application → Cookies → leetcode.com) to auto-mark every solved problem in the bank. The cookie is stored only in your browser's localStorage and is never written to `progress.json`.

## Architecture

Specs in `docs/superpowers/specs/`. Key modules:

- `src/studyTracker.jsx` — root component; holds all state via `usePersistedState` and switches views (no router).
- `src/ui/theme.jsx` — `C` color tokens with two palettes (light + dark); the active one is chosen at load from a saved preference (default dark), toggled from the nav (persists + reloads). Plus shared UI primitives (`GlobalNav`, `Btn`, `Panel`, `SectionTitle`).
- `src/store/storage.js` — single owner of persistence + export/import + reset-to-published; publishable slices (`tracker`, `bank`, `cards`, `settings`, `trading`) plus local-only (`flight`, `secret`).
- `src/practice/CodingPractice.jsx` — reusable Python-judged coding-practice UI; consumed by both `DSA.jsx` and `TradingPrep.jsx`.
- `src/srs/sm2.js` — pure SM-2 scheduler (unit-tested), shared by flashcards and problem re-solves.
- `src/lib/catalog.js` — loads/caches the static problem catalog.
- `src/leetcode/sync.js` — the only runtime call to leetcode.com.
- `src/flight/` — shared practice infra (Pyodide runner, CodeMirror editor, diagrams, guides).
- `src/data/trading/` — Trading Prep data: `codingTrading.js`, `pythonTrivia.js`, `firms.js`, `quantPointers.js`.
- Views: `Today.jsx`, `ProblemBank.jsx`, `DSA.jsx`, `TradingPrep.jsx`, `Flashcards.jsx`, `FlightMode.jsx`, `Dashboard.jsx`.
