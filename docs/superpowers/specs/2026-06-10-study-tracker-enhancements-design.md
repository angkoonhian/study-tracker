# Study Tracker — Major Enhancement Design

**Date:** 2026-06-10
**Status:** Implemented

## Goal

Extend the existing 49-day interview study tracker with: (1) a full LeetCode problem
bank, (2) Anki-style spaced-repetition flashcards, (3) analytics + smart review, and
(4) optional real LeetCode account sync — under a hard constraint: **no database,
everything static**, such that pulling the repo's `master` branch replicates the
author's published progress.

## Constraints & decisions

- **No backend / no database.** State = `localStorage` (live) + committed
  `src/data/progress.json` (published snapshot). Fresh clone → hydrate from snapshot.
- **Data model: separate Problem Bank** (not merged into `PLAN`). `PLAN`'s positional
  task ids (`d{day}t{index}`) are fragile; a standalone bank is purely additive and
  cannot corrupt existing saved progress.
- **Catalog pull:** build-time Node script (`npm run fetch:leetcode`) writes a static
  JSON snapshot of all ~3,958 problems to `public/data/`. Committed, so no runtime
  network needed to read it.
- **Account sync:** optional, dev-only, via a Vite `/lc-api` proxy (CORS workaround).
  Full per-problem sync needs the user's `LEETCODE_SESSION` cookie (local-only, never
  exported). Degrades to public counts + recent submissions without it.
- **SRS:** SM-2, implemented as pure functions, shared by flashcards and "spaced
  problem re-solve". Unit-tested with Node's built-in test runner (no new dependency).
- **Charts:** hand-rolled SVG/CSS to avoid heavy dependencies.

## Modules

| File | Responsibility |
|------|----------------|
| `scripts/fetch-leetcode.mjs` | Generate the static catalog from LeetCode GraphQL. |
| `vite.config.js` | `/lc-api` dev proxy (origin/referer rewrite, cookie injection). |
| `src/data/progress.json` | Published progress snapshot (the static source of truth). |
| `src/data/patternCards.js` | Seed pattern/concept flashcards. |
| `src/store/storage.js` | All persistence + export/import + reset-to-published. Cookie kept in a separate, never-exported key. |
| `src/srs/sm2.js` (+ `.test.mjs`) | Pure SM-2 scheduler. |
| `src/lib/catalog.js` | Load + cache the static catalog; topic labels. |
| `src/lib/now.js` | `Date.now()` behind a function boundary (react-hooks/purity). |
| `src/leetcode/sync.js` | The only runtime call to leetcode.com. |
| `src/ui/theme.jsx` | Shared dark-theme tokens + nav + UI primitives. |
| `src/ProblemBank.jsx` | Bank view: search/filter, status tracking, sync, re-solve, add-card. |
| `src/Flashcards.jsx` | Review sessions + deck management. |
| `src/Dashboard.jsx` | Analytics (read-only). |
| `src/Today.jsx` | Unified prioritized queue. |

## Data flow

`leetcode-problems.json` (catalog, read-only) + per-problem user state in `bank_v1`
(status, notes, re-solve SRS) + `cards_v1` (flashcards with inline SRS) + `settings_v1`.
SM-2 drives both card and re-solve scheduling. Dashboard and Today are pure views
computed from those stores. `StudyTracker` owns the state; persistence happens in the
setters (React 19's hooks lint rejects save-in-`useEffect`).

## Integration with existing app

- No router; `view` state gains `today`/`bank`/`cards`/`dashboard` alongside the
  existing `tracker`/`framework`/`roles`. Default view is `today`.
- Existing `biginterview_tracker_v1` key and `PLAN` are untouched; tracker progress is
  now also seeded from `progress.json` and included in export/import.

## Verification

- `npm run lint` clean, `npm test` 8/8 green, `npm run build` succeeds.
- Runtime smoke test (Playwright): all five views render, 3,958 problems load, the
  flashcard review→grade flow advances and schedules correctly, zero console errors.
