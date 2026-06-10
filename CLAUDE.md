# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/` locally
- `npm run lint` — ESLint over the repo (flat config in `eslint.config.js`)

No test runner is configured.

## Architecture

This is a single-page React 19 + Vite app. `src/main.jsx` mounts `StudyTracker` directly; `src/App.jsx` is the leftover Vite template and is not rendered. The app has two views, toggled via a `view` state inside `StudyTracker` — there's no router.

- **`src/studyTracker.jsx`** — the 49-day checklist. Renders by default.
- **`src/FrameworkGuide.jsx`** — the "7-step system design framework" reference page. Reached via the `📐 7-Step Framework` button in the tracker header; returns via its own `← Back to Tracker` button.

Key things to know before editing `studyTracker.jsx`:

- **`PLAN` is the source of truth.** It's a flat array of day objects (`{w, d, title, focus, tasks:[{c, text}]}`). At module load, a top-level `PLAN.forEach` mutates each task to add a stable `id` of the form `d{day}t{index}`. **If you reorder or remove tasks mid-array, every following task's id shifts** and previously-saved progress for those slots will silently misalign. Append-only edits within a day are safe; structural reshuffling breaks user state.
- **Persistence uses `localStorage`** under the key `biginterview_tracker_v1`. Reads happen via a lazy initial state (`useState(loadInitialDone)`) and writes happen synchronously inside the `toggle` / `resetAll` callbacks via `persistDone(next)` — there is intentionally no save `useEffect` (React 19's `react-hooks/set-state-in-effect` rule rejects the obvious version). Bump the key if the saved-state shape changes.
- **`NC_SLUGS` + `renderTaskSegments(text)`** turn NeetCode tasks into clickable LeetCode links. The parser looks for the *last* `:` in a task that contains "NeetCode", splits the trailing portion on `,`, normalizes each problem name, and looks it up in `NC_SLUGS`. Names not in the map render as plain text (safe fallback). The parser also handles the `Foo I & II` shorthand (expands to two links) and trailing parentheticals like `Network Delay (Dijkstra)`. When adding new NeetCode problems to `PLAN`, add the matching `"problem name" → "leetcode-slug"` entry to `NC_SLUGS` or the link silently won't appear. Link clicks call `stopPropagation` so they don't toggle the task checkbox.
- **`CATS`** maps category keys (`apply`, `design`, `code`, `behave`, `mock`) to `{ label, color, bg }`. Every task's `c` field must match a key here or rendering will throw on `CATS[tk.c]`.
- **`weekTitles`** is keyed by week number and must stay in sync with the `w` values used in `PLAN`.
- Styling is inline-only (no CSS modules / Tailwind); the dark theme and color tokens live as literals throughout both components.

ESLint uses flat config with `react-hooks` and `react-refresh/vite` rules — keep components export-stable for HMR, and don't reintroduce the `setState`-inside-`useEffect` pattern for persistence (the rule is strict in this React version).
