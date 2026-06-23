# Trading Prep section, DSA promotion, GfG-style light re-theme, emoji removal

**Date:** 2026-06-23
**Status:** Approved, pending implementation plan

## Goal

Four related changes to the study tracker:

1. Add a **Trading Prep** section: researched, firm-attributed interview content for
   quant/trading firms (HRT, Jane Street, Citadel, Two Sigma, Optiver, IMC, SIG, DRW,
   Jump, and adjacent shops) — complex multi-step trading DSA, Python trivia/gotchas,
   per-firm interview guides, and firm-tagged quant/math pointers.
2. **Promote DSA** (the Coding practice + DSA Guide) out of Flight Mode into its own
   top-level section. Flight Mode keeps Brainteasers, Mental Math, System Design.
3. Re-theme the **whole app** to a GeeksforGeeks-style light look (white background,
   green accent, article-like typography, structured example/approach/complexity
   blocks, syntax-highlighted code, tables).
4. **Remove pictographic emoji** from the UI (keep plain `✓` and `→`/`←`).

## Constraints

- Still 100% static, no backend, no runtime scraping. Research happens at build/author
  time; results are committed as data files.
- Honor the existing "clone master = replicate my progress" model: Trading Prep
  progress is publishable (in `progress.json`); Flight Mode stays local-only as it is.
- Interview questions are NDA'd; only public anecdotes exist. Every Trading Prep item
  is **reconstructed and labeled** with its firm + a "reconstructed from public
  reports" note + a source link where one exists. Never claimed as verbatim.

## Structure / nav

Plain-text nav (no emoji), reordered:

```
QUANTPREP   Today · Tracker · Problem Bank · DSA · Trading Prep · Flashcards · Flight Mode · Dashboard      Roles · Framework
```

- **DSA** (new top-level): Coding practice + DSA Guide, moved out of Flight Mode.
- **Flight Mode**: Brainteasers + Mental Math + System Design only (content otherwise unchanged).
- **Trading Prep** (new top-level): four tabs (below).

## Refactor for isolation

Extract the coding-practice UI currently inside `FlightMode.jsx` into a reusable
**`src/practice/CodingPractice.jsx`** with props `{ problems, solved, onSolved }`.

- `src/DSA.jsx` → `CodingPractice` with existing `CODING` + `GuideView`.
- `src/TradingPrep.jsx` "Trading DSA" tab → same `CodingPractice` with the trading dataset.

`src/flight/` (CodeEditor, pyRunner, diagrams, deriveDiagram, mentalMath, GuideView)
becomes shared practice infrastructure used by both DSA and Flight Mode; data files stay
in `src/data/flight/` to avoid breaking imports. This is documented, not moved.

## Trading Prep tabs

1. **Trading DSA** — Python-judged, multi-step, trading-framed problems. Same data shape
   as existing coding (`id, title, difficulty, topic, statement, funcName, starter,
   solution, tests:[{call,expected}], hint`) plus `firms:[], source, representative:true`.
   Examples: limit-order-book matching engine (heaps + hashmap), settlement dependency
   cycle detection / topological sort (graphs), VWAP sliding window, position netting,
   order-throttling rate limiter. Target ~12–20 problems. Data: `src/data/trading/codingTrading.js`
   (split by topic if it grows). Verified headlessly via the `verify:flight` script pattern.
2. **Python Trivia** — predict-the-output / gotcha reveal-cards:
   `{ id, code, question, answer, explanation, concept, firms:[], source }`. Covers mutable
   default args, late-binding closures, list aliasing (the Jump pointer-reference case),
   `is` vs `==` / small-int caching, generator exhaustion, default-arg evaluation time,
   tuple/`+=` mutation, etc. Target ~20–30 cards. Data: `src/data/trading/pythonTrivia.js`.
3. **Firm Guides** — per-firm cards: round structure, what each round screens for, topic
   emphasis, sourced sample questions, sources. Data: `src/data/trading/firms.js`.
4. **Quant/Math** — firm-tagged pointers that cross-link into the existing Brainteasers /
   Mental Math (no wholesale duplication) plus a small set of new market-making-math
   cards. Data: `src/data/trading/quantPointers.js`.

## Persistence

Add a publishable **`trading`** slice to `storage.js`:
`{ coding: { [id]: { solved } }, trivia: { [id]: { seen } } }`. Wire into
`loadTrading`/`saveTrading`, `exportAll`, `importAll`, `resetToPublished`, and the
`KEYS` map. Seed slice in `progress.json`.

## GfG light re-theme

- Redefine the `C` tokens in `src/ui/theme.jsx` to a GfG light palette:
  page `#ffffff`/`#f7f7f7`, primary green `#2f8d46`, text `#333333`, muted `#5b6168`,
  borders `#e0e0e0`, code-block bg `#f3f3f3`, accent links green. Replace the dark
  radial-gradient page background and dark scrollbar styling.
- Sweep hardcoded hex literals across the 12 `.jsx` files via an explicit old→new
  mapping (most dark literals are inline copies of token values, so they map cleanly to
  the new light equivalents). 215 `C.*` token references flip automatically.
- Adopt GfG content presentation in the views: clear section headings, light example/
  approach/complexity boxes, bordered tables, and light-theme syntax highlighting in the
  code editor (swap CodeMirror's `one-dark` theme for a light theme).
- Ensure contrast on status pills/difficulty dots reads on a light background.

## Emoji removal

Strip pictographic emoji (🔥 📚 🃏 📊 ✈️ 🎯 📐 ⌨️ 📖 🧠 🔢 🏗 🎉 ✅ etc.) from all UI
components (~11 files) and the ~14 in guide data, replaced with text labels and the
existing colored dots/pills. Keep plain typographic `✓` and `→`/`←`.

## Research method

At implementation time, run web searches per firm (Glassdoor, Reddit r/quant & r/csMajors,
interview-experience blogs, GitHub prep repos), extract patterns and anecdotes, then
author the reconstructed Trading DSA problems, Python trivia, and firm guides — each
labeled with firm + source + "reconstructed."

## Verification

- `npm run lint` clean; `npm test` green.
- Extend the `verify:flight` headless judge to the trading coding set — every solution
  passes all its tests.
- `npm run build` succeeds.
- Playwright smoke test: DSA + Trading Prep render, all four Trading Prep tabs work, the
  coding judge runs in both DSA and Trading DSA, light theme applied, and a grep confirms
  no pictographic emoji remain in `src`.

## Out of scope (YAGNI)

No backend, no runtime firm-data scraping, no changes to Flight Mode's remaining tab
content, no new dependencies beyond a light CodeMirror theme (already available in the
installed CodeMirror packages).
