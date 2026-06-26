# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR (also enables the `/lc-api` LeetCode sync proxy)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/` locally
- `npm run lint` — ESLint over the repo (flat config in `eslint.config.js`)
- `npm test` — unit tests via Node's built-in runner (`src/**/*.test.mjs`: SM-2 scheduler + storage slices). Uses a JSON-import preload (`src/store/json-loader.mjs`) so storage.js's `import progress.json` works under Node.
- `npm run verify:flight` / `npm run verify:trading` — headless judges that run every coding problem's reference `solution` against its tests in Python. They resolve a working interpreter (`python3`→`python`→`py`) and run via a temp file (avoids the Windows `-c` command-length limit).
- `npm run fetch:leetcode` — regenerate `public/data/leetcode-problems.json`.

Known baseline: `npm run lint` reports 3 pre-existing `react-refresh/only-export-components` errors in `src/ui/theme.jsx` (it exports tokens alongside components). Don't add new lint errors; those 3 are accepted.

## Architecture

This is a single-page React 19 + Vite app. `src/main.jsx` mounts `StudyTracker`; `src/App.jsx` is the leftover Vite template and is not rendered. There's no router — a `view` state inside `StudyTracker` switches between sections.

- **`src/studyTracker.jsx`** — root component. Holds all persisted state via the `usePersistedState(loader, saver)` helper and renders the active view. The 49-day `PLAN` checklist is the `tracker` view.
- **`src/ui/theme.jsx`** — theming. Two concrete hex palettes (`LIGHT` + `DARK`, GeeksforGeeks-style); the active one is selected at module load from `localStorage` key `biginterview_theme_v1` (**default dark**) and exposed as the `C` token object, plus shared primitives (`GlobalNav`, `Btn`, `Panel`, `SectionTitle`, `wrap`). The nav has a Light/Dark toggle that persists the choice and reloads (instant switching would break the `${C.token}55` alpha-append idiom used app-wide, since `C` must stay concrete hex; the app already reloads on import/reset). To add a token: add it to BOTH palettes. Components should reference `C.*`, not hardcoded hex, so both themes work. Legacy category/role accent colors (pastels) are intentionally left as literals.
- Views: `Today.jsx`, `ProblemBank.jsx`, `DSA.jsx`, `TradingPrep.jsx`, `Flashcards.jsx`, `FlightMode.jsx`, `Dashboard.jsx`, plus `FrameworkGuide.jsx` and `JobRoles.jsx` (reached via the `Framework` / `Roles` nav buttons).
- **`src/practice/CodingPractice.jsx`** — the reusable Python-judged coding-practice UI (`{ problems, progress, setProgress }`). Used by both `DSA.jsx` (over `CODING`, writing the `flight.coding` slice) and `TradingPrep.jsx` (over `TRADING_CODING`, writing the `trading.coding` slice). `src/flight/` holds the shared runner/editor/diagram/guide infra both depend on.
- **`src/data/trading/`** — Trading Prep content (`codingTrading.js`, `pythonTrivia.js`, `firms.js`, `quantPointers.js`), all reconstructed-from-public-reports and firm-labeled. Trading DSA problems use the same shape as `src/data/flight/coding/*`; `npm run verify:trading` gates their correctness.

### Persistence (`src/store/storage.js`)

Single owner of all `localStorage` I/O + export/import. Slices: publishable (`tracker`, `bank`, `cards`, `settings`, `trading`) are included in `exportAll`/`importAll`/`resetToPublished` and seeded from `src/data/progress.json`; local-only (`flight`, `secret`) are not. A fresh clone hydrates from the committed `progress.json`, so pulling `master` replicates the published progress. Bump a key in `KEYS` if a slice's shape changes. When adding a new publishable slice, add it to `exportAll`, `importAll`, `resetToPublished`, and the `progress.json` seed.

Key things to know before editing `studyTracker.jsx`:

- **`PLAN` is the source of truth.** It's a flat array of day objects (`{w, d, title, focus, tasks:[{c, text}]}`). At module load, a top-level `PLAN.forEach` mutates each task to add a stable `id` of the form `d{day}t{index}`. **If you reorder or remove tasks mid-array, every following task's id shifts** and previously-saved progress for those slots will silently misalign. Append-only edits within a day are safe; structural reshuffling breaks user state.
- **Persistence** for the tracker (and every other slice) goes through `usePersistedState(loader, saver)` in `studyTracker.jsx`, which writes synchronously inside the state setter — there is intentionally no save `useEffect` (React 19's `react-hooks/set-state-in-effect` rule rejects the obvious version). The tracker slice key is `biginterview_tracker_v1`; see the Persistence section above for all slices.
- **`NC_SLUGS` + `renderTaskSegments(text)`** turn NeetCode tasks into clickable LeetCode links. The parser looks for the *last* `:` in a task that contains "NeetCode", splits the trailing portion on `,`, normalizes each problem name, and looks it up in `NC_SLUGS`. Names not in the map render as plain text (safe fallback). The parser also handles the `Foo I & II` shorthand (expands to two links) and trailing parentheticals like `Network Delay (Dijkstra)`. When adding new NeetCode problems to `PLAN`, add the matching `"problem name" → "leetcode-slug"` entry to `NC_SLUGS` or the link silently won't appear. Link clicks call `stopPropagation` so they don't toggle the task checkbox.
- **`CATS`** maps category keys (`apply`, `design`, `code`, `behave`, `mock`) to `{ label, color, bg }`. Every task's `c` field must match a key here or rendering will throw on `CATS[tk.c]`.
- **`weekTitles`** is keyed by week number and must stay in sync with the `w` values used in `PLAN`.
- **`CATS`** has been extended with quant categories (`prob`, `mental`, `markets`) for the merged quant plan — keep it in sync with every `c` value used in `PLAN`/`QUANT_PLAN`.
- Styling is inline-only (no CSS modules / Tailwind). Prefer the `C` tokens from `src/ui/theme.jsx`; the light theme means new color literals should be light-on-white, not dark.

ESLint uses flat config with `react-hooks` and `react-refresh/vite` rules — keep components export-stable for HMR, and don't reintroduce the `setState`-inside-`useEffect` pattern for persistence (the rule is strict in this React version).
