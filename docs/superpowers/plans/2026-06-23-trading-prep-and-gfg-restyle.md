# Trading Prep, DSA Promotion, GfG Light Re-theme, Emoji Removal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a researched Trading Prep section, promote DSA to its own top-level section, re-theme the whole app to a GeeksforGeeks-style light look, and remove pictographic emoji.

**Architecture:** Extract the Pyodide coding-practice UI into a reusable `src/practice/CodingPractice.jsx` consumed by both a new `DSA.jsx` and the new `TradingPrep.jsx`. Trading content lives in committed static data files (`src/data/trading/`), authored from public interview anecdotes and labeled "reconstructed". A new publishable `trading` slice in `storage.js` tracks progress. The light theme flips central `C` tokens plus a scripted sweep of hardcoded dark hex literals.

**Tech Stack:** React 19 + Vite, CodeMirror 6 (`@uiw/react-codemirror`), Pyodide (vendored), Node built-in test runner, python3 for headless judging.

---

## Reference: existing data shapes (do not change)

Coding problem (in `src/data/flight/coding/*.js`), consumed by the judge:
```js
{ id, title, difficulty: "Easy"|"Medium"|"Hard", topic,
  statement, funcName, starter, solution,
  tests: [{ call, expected }], hint,
  hidden?: [{ call, expected }], checker?: "exact"|"unordered"|"seteq" }
```
The judge (`runProblem` in `src/flight/pyRunner.js`) and the headless verifier
(`scripts/verify-flight-coding.mjs`) ignore unknown extra fields, so adding
`firms`, `source`, `representative` to trading problems is safe.

---

## Phase 1 — Emoji removal + plain-text nav

### Task 1: Plain-text global nav + brand

**Files:**
- Modify: `src/ui/theme.jsx` (the `GlobalNav` items array and ghost buttons)

- [ ] **Step 1: Replace the nav items array and add DSA + Trading Prep, drop emoji**

In `src/ui/theme.jsx`, replace the `items` array inside `GlobalNav`:
```js
  const items = [
    ["today", "Today"],
    ["tracker", "Tracker"],
    ["bank", "Problem Bank"],
    ["dsa", "DSA"],
    ["trading", "Trading Prep"],
    ["cards", "Flashcards"],
    ["flight", "Flight Mode"],
    ["dashboard", "Dashboard"],
  ];
```
And replace the two ghost buttons' labels (remove the 🎯 and 📐):
```jsx
          <button onClick={() => setView("roles")} style={ghostBtn}>Roles</button>
          <button onClick={() => setView("framework")} style={ghostBtn}>Framework</button>
```

- [ ] **Step 2: Verify build still compiles**

Run: `npm run build`
Expected: build succeeds (the `dsa`/`trading` views don't exist yet but nav only sets state — no crash).

- [ ] **Step 3: Commit**
```bash
git add src/ui/theme.jsx
git commit -m "Plain-text nav, add DSA + Trading Prep entries"
```

### Task 2: Strip pictographic emoji from all UI files

**Files:**
- Modify: `src/studyTracker.jsx`, `src/Today.jsx`, `src/ProblemBank.jsx`, `src/Flashcards.jsx`, `src/Dashboard.jsx`, `src/FlightMode.jsx`, `src/FrameworkGuide.jsx`, `src/JobRoles.jsx`, `src/flight/GuideView.jsx`, `src/flight/diagrams.jsx`, `src/flight/deriveDiagram.js`, and guide data under `src/data/flight/guides/*.js`

- [ ] **Step 1: List every pictographic emoji occurrence**

Run:
```bash
LC_ALL=C.UTF-8 grep -rnoP "[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{2300}-\x{23FF}\x{FE0F}]" src --include="*.jsx" --include="*.js"
```
Expected: a list of lines. Note: this pattern also matches `↺`/`▶`/`✈` etc.

- [ ] **Step 2: Replace emoji with text, per the rules**

Rules:
- Remove decorative emoji entirely (🔥 📚 🃏 📊 🎯 📐 ✈️ ⌨️ 📖 🧠 🔢 🏗 🎉 etc.). If it prefixed a label, delete the emoji and the following space.
- Status glyphs in lists: `"✅"` → `"✓"` (green via existing color), `"🟡"` → `"•"`, `"⚪️"` → `"◦"`, `"🔒"` (hidden-test lock) → `"[hidden]"` text or drop, `"💡"` → drop (keep "Hint"), `"👁"` → drop (keep "Solution"), `"▶"` → drop (keep "Run tests"), `"↺"` keep (typographic), `"✓"`/`"✗"`/`"→"`/`"←"` keep.
- In `src/data/flight/guides/*.js`, remove emoji from rendered strings.

Apply with targeted `Edit` calls per occurrence from Step 1 (do not blind-replace `✓`/`→`/`↺`).

- [ ] **Step 3: Verify no decorative emoji remain**

Run:
```bash
LC_ALL=C.UTF-8 grep -rnoP "[\x{1F000}-\x{1FAFF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]" src --include="*.jsx" --include="*.js" | grep -v "↺\|▶"
```
Expected: no output (empty).

- [ ] **Step 4: Build + commit**
```bash
npm run build
git add -A
git commit -m "Remove pictographic emoji from UI and guide data"
```

---

## Phase 2 — GeeksforGeeks-style light theme

### Task 3: Flip the central theme tokens to light

**Files:**
- Modify: `src/ui/theme.jsx` (the `C` object and `page` style)

- [ ] **Step 1: Replace the `C` token values**

Replace the `C` object's color values (keep the keys/names so all 215 `C.*` references flip):
```js
export const C = {
  pageBg: "#f6f8fa",
  text: "#1f2328",
  muted: "#57606a",
  faint: "#8c959f",
  blue: "#2f8d46",      // primary accent (GfG green)
  green: "#1a7f37",     // success
  amber: "#9a6700",
  red: "#c0392b",
  panel: "#ffffff",
  panelSolid: "#ffffff",
  border: "#d0d7de",
  borderHi: "#2f8d46",
  chipBg: "#eef6f0",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif",
  sys: "system-ui",
};
```

- [ ] **Step 2: Replace the `page` background and nav bar**

In `src/ui/theme.jsx`, set `page.background` to `C.pageBg` (solid light), and in `GlobalNav` change the bar background `"rgba(8,14,24,.7)"` → `"rgba(255,255,255,.85)"` and its `borderBottom` `"#243650"` → `C.border`. Change inactive nav button text `"#AFC3E0"` → `C.muted`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**
```bash
git add src/ui/theme.jsx
git commit -m "Light theme tokens (GfG green accent)"
```

### Task 4: Sweep hardcoded dark hex literals to light

**Files:**
- Modify: all `.jsx`/`.js` under `src/` that contain dark hex (12 files listed in spec)

- [ ] **Step 1: Apply the dark→light hex mapping**

Run this Node command (reviewable via git diff afterward):
```bash
node -e '
const fs=require("fs"),cp=require("child_process");
const map={
 "#16243B":"#f6f8fa","#0B1422":"#ffffff","#070D16":"#f6f8fa","#0A1322":"#f3f4f6",
 "#101D33":"#ffffff","#0C1626":"#ffffff","#0E1B30":"#ffffff","#13243F":"#ffffff",
 "#0e1b30":"#ffffff","#152444":"#ffffff","#111E36":"#ffffff","#15294A":"#f3f6f9",
 "#1B3360":"#eef6f0","#16263f":"#eef6f0","#1A2840":"#e9eef3","#1C2C44":"#eef6f0",
 "#243650":"#d0d7de","#23344E":"#d0d7de","#1F2F47":"#d0d7de","#2A3C56":"#d0d7de",
 "#2F66C4":"#2f8d46","#2f66c4":"#2f8d46","#3C5174":"#aeb6bf","#3A4D6B":"#d0d7de",
 "#E8EDF4":"#1f2328","#F4F8FE":"#111418","#EAF0F8":"#111418","#D7E0EE":"#1f2328",
 "#CFE0F5":"#1f2328","#9CC0F5":"#2f8d46","#6FA8FF":"#2f8d46","#9FB6D6":"#57606a",
 "#8AA1C2":"#57606a","#7E9BC4":"#57606a","#8DA4C4":"#57606a","#5E7DA8":"#8c959f",
 "#5E7396":"#8c959f","#5FD79E":"#1a7f37","#3DBB7A":"#1a7f37","#27613F":"#1a7f37",
 "#5C7":"#1a7f37","#5A2A38":"#e5b3b3","#0e2018":"#eaf6ec","#23121a":"#fbeaea",
 "#C9E2C9":"#0a5d1f","#E2A9B4":"#9b2b2b","#9333A8":"#8250df","#B91C3B":"#c0392b",
 "#1A56DB":"#2f8d46","#B7791F":"#9a6700","#0F7A4A":"#1a7f37"
};
const files=cp.execSync("git ls-files src",{encoding:"utf8"}).split("\n").filter(f=>/\.(jsx?|)$/.test(f)&&/\.(jsx|js)$/.test(f));
for(const f of files){let s=fs.readFileSync(f,"utf8"),o=s;for(const[k,v]of Object.entries(map)){s=s.split(k).join(v);} if(s!==o)fs.writeFileSync(f,s);}
console.log("swept",files.length,"files");
'
```
Expected: `swept N files`.

- [ ] **Step 2: Fix the page radial gradient + scrollbar in studyTracker**

In `src/studyTracker.jsx`, the tracker view still hardcodes a dark radial gradient and dark scrollbar in its inline `<style>` and root `div`. Replace the root `background:` value with `"#f6f8fa"`, and in the `<style>` block change scrollbar `track` to `#f6f8fa` and `thumb` to `#c0c7ce`. Replace any remaining `linear-gradient(...dark...)` header backgrounds with `"#ffffff"`.

- [ ] **Step 3: Build + visually scan diff**

Run: `npm run build && git diff --stat`
Expected: build succeeds; diff touches the expected files.

- [ ] **Step 4: Commit**
```bash
git add -A
git commit -m "Sweep dark hex literals to light palette"
```

### Task 5: Light CodeMirror theme

**Files:**
- Modify: `src/flight/CodeEditor.jsx`

- [ ] **Step 1: Swap oneDark for the built-in light theme**

In `src/flight/CodeEditor.jsx`: remove `import { oneDark } from "@codemirror/theme-one-dark";`, change `theme={oneDark}` → `theme="light"`, and in the textarea fallback change `background: "#0A1322", color: "#E8EDF4"` → `background: "#f3f4f6", color: "#1f2328"`.

- [ ] **Step 2: Build + commit**
```bash
npm run build
git add src/flight/CodeEditor.jsx
git commit -m "Light CodeMirror editor theme"
```

---

## Phase 3 — Promote DSA; extract reusable CodingPractice

### Task 6: Extract `CodingPractice` from FlightMode

**Files:**
- Create: `src/practice/CodingPractice.jsx`
- Modify: `src/FlightMode.jsx`

- [ ] **Step 1: Create the reusable component**

Create `src/practice/CodingPractice.jsx`. Move `CodingMode`, `CodingProblem`, `RunOutput`, `TestRow` and the local style helpers (`statementStyle`, `pill`, `mono`, `DIFF_COLOR`, `selectStyle`) out of `FlightMode.jsx` into this file. Generalize the data + progress dependency: the component takes props `{ problems, progress, setProgress }` instead of reading `flight.coding`.

Top of file:
```jsx
import { useMemo, useState } from "react";
import { C, Btn, Panel } from "../ui/theme.jsx";
import { runProblem, isPyReady } from "../flight/pyRunner.js";
import { Diagram } from "../flight/diagrams.jsx";
import { deriveDiagram } from "../flight/deriveDiagram.js";
import CodeEditor from "../flight/CodeEditor.jsx";

const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const DIFF_COLOR = { Easy: C.green, Medium: C.amber, Hard: C.red };
const pill = (color) => ({ fontFamily: C.sys, fontSize: 11, fontWeight: 700, color,
  border: `1px solid ${color}55`, background: `${color}14`, borderRadius: 12, padding: "2px 9px" });
const statementStyle = { margin: 0, whiteSpace: "pre-wrap", fontFamily: C.sys,
  fontSize: 14, lineHeight: 1.6, color: C.text };
const selectStyle = { background: "#ffffff", border: `1px solid ${C.border}`, color: C.text,
  borderRadius: 8, padding: "7px 10px", fontFamily: C.sys, fontSize: 12.5, width: "100%" };

export default function CodingPractice({ problems, progress, setProgress }) {
  // ...body of the former CodingMode, but using `problems` instead of CODING,
  //    `progress` instead of `flight.coding`, and calling
  //    setProgress((prev) => ({ ...prev, [id]: {...} })) instead of setFlight.
}
```
In the moved `CodingProblem`, replace `patchProblem` with:
```jsx
  const patchProblem = (patch) => setProgress((prev) => ({
    ...prev, [problem.id]: { ...(prev?.[problem.id] || {}), ...patch },
  }));
```
and read `const saved = progress?.[problem.id];`. In the list, read `const st = progress?.[p.id];`. Replace the `"✅"/"🟡"/"⚪️"` glyphs (already removed in Task 2) with `st?.solved ? "✓" : st?.attempts ? "•" : "◦"`.

- [ ] **Step 2: Slim FlightMode to use it (Coding tab removed; keep teasers/math/design)**

In `src/FlightMode.jsx`: delete the moved code. Update `MODES` to drop `coding` and `guide`:
```js
const MODES = [
  ["teasers", "Brainteasers"],
  ["math", "Mental Math"],
  ["design", "System Design"],
];
```
Set the initial mode to `"teasers"`. Remove the now-unused imports (`CODING`, `runProblem`, `isPyReady`, `Diagram`, `deriveDiagram`, `CodeEditor`, `GuidesMode`) and the `coding`/`guide` branches in the render switch. Keep `BRAINTEASERS`, `SYS_DESIGN`, `genQuestion` etc. Update the `SectionTitle` `title` to `"Flight Mode"` and kicker to `"Offline · no wifi required"` (emoji already gone).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: succeeds, no unused-import lint errors.

Run: `npm run lint`
Expected: clean.

- [ ] **Step 4: Commit**
```bash
git add -A
git commit -m "Extract reusable CodingPractice from FlightMode"
```

### Task 7: New DSA section

**Files:**
- Create: `src/DSA.jsx`
- Modify: `src/studyTracker.jsx`

- [ ] **Step 1: Create `src/DSA.jsx`**
```jsx
import { useState } from "react";
import { SectionTitle, wrap } from "./ui/theme.jsx";
import CodingPractice from "./practice/CodingPractice.jsx";
import GuidesMode from "./flight/GuideView.jsx";
import { CODING } from "./data/flight/coding.js";

const TABS = [["practice", "Practice"], ["guide", "Guide"]];

export default function DSA({ flight, setFlight }) {
  const [tab, setTab] = useState("practice");
  const setCoding = (updater) =>
    setFlight((prev) => ({ ...prev, coding: updater(prev.coding || {}) }));
  return (
    <div style={wrap}>
      <SectionTitle kicker="Data structures & algorithms" title="DSA" />
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: tab === k ? "#2f8d46" : "#ffffff", color: tab === k ? "#fff" : "#57606a",
            border: "1px solid #d0d7de", borderRadius: 20, padding: "8px 16px",
            fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
          }}>{label}</button>
        ))}
      </div>
      {tab === "practice" && (
        <CodingPractice problems={CODING} progress={flight.coding || {}} setProgress={setCoding} />
      )}
      {tab === "guide" && <GuidesMode />}
    </div>
  );
}
```

- [ ] **Step 2: Wire DSA into studyTracker view switch**

In `src/studyTracker.jsx`, add the import near the other view imports:
```jsx
import DSA from "./DSA.jsx";
```
And add a branch inside the `if (view !== "tracker")` block (after the `flight` branch):
```jsx
        {view === "dsa" && <DSA flight={flight} setFlight={setFlight} />}
```

- [ ] **Step 3: Build + lint**

Run: `npm run build && npm run lint`
Expected: both succeed/clean.

- [ ] **Step 4: Commit**
```bash
git add -A
git commit -m "Add DSA top-level section (coding practice + guide)"
```

---

## Phase 4 — Publishable `trading` progress slice

### Task 8: Add `trading` slice to storage (TDD)

**Files:**
- Modify: `src/store/storage.js`
- Modify: `src/data/progress.json`
- Create: `src/store/storage.trading.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `src/store/storage.trading.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";

// Minimal localStorage shim so storage.js runs under node.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
})();
globalThis.structuredClone ??= (x) => JSON.parse(JSON.stringify(x));

const s = await import("./storage.js");

test("trading slice has the default shape", () => {
  const t = s.loadTrading();
  assert.deepEqual(t, { coding: {}, trivia: {} });
});

test("trading slice round-trips through save/load", () => {
  s.saveTrading({ coding: { "lob-match": { solved: true } }, trivia: { "mut-default": { seen: true } } });
  assert.equal(s.loadTrading().coding["lob-match"].solved, true);
});

test("exportAll includes trading; importAll restores it", () => {
  s.saveTrading({ coding: { x: { solved: true } }, trivia: {} });
  const dump = s.exportAll();
  assert.ok(dump.trading, "export has trading");
  s.saveTrading({ coding: {}, trivia: {} });
  s.importAll(dump);
  assert.equal(s.loadTrading().coding.x.solved, true);
});

test("resetToPublished clears trading", () => {
  s.saveTrading({ coding: { y: { solved: true } }, trivia: {} });
  s.resetToPublished();
  assert.deepEqual(s.loadTrading(), { coding: {}, trivia: {} });
});
```

- [ ] **Step 2: Run it — expect failure**

Run: `node --test src/store/storage.trading.test.mjs`
Expected: FAIL (`s.loadTrading is not a function`).

- [ ] **Step 3: Implement the slice**

In `src/store/storage.js`:
- Add to `KEYS`: `trading: "biginterview_trading_v1",`
- Add loaders after the flight slice:
```js
// ---- trading (publishable: Trading Prep coding solved + trivia seen) ----
export const loadTrading = () =>
  read(KEYS.trading, seed.trading || { coding: {}, trivia: {} });
export const saveTrading = (v) => write(KEYS.trading, v);
```
- In `exportAll()` add: `trading: loadTrading(),`
- In `importAll(obj)` add: `if (obj.trading) saveTrading(obj.trading);`
- In `resetToPublished()` add `KEYS.trading` to the array of keys removed.

- [ ] **Step 4: Seed progress.json**

In `src/data/progress.json`, add a top-level key (alongside `tracker`/`bank`/`cards`):
```json
  "trading": { "coding": {}, "trivia": {} },
```

- [ ] **Step 5: Run tests — expect pass**

Run: `node --test src/store/storage.trading.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**
```bash
git add src/store/storage.js src/data/progress.json src/store/storage.trading.test.mjs
git commit -m "Add publishable trading progress slice"
```

---

## Phase 5 — Trading Prep data (researched, reconstructed, labeled)

> Authoring note: every item gets `firms: [...]`, `source: "<url-or-'public reports'>"`,
> and (for problems) `representative: true`. Research via WebSearch/WebFetch across
> Glassdoor, Reddit (r/quant, r/csMajors), interview-experience blogs, and GitHub prep
> repos before authoring. Do NOT claim any item is verbatim.

### Task 9: Trading DSA problems + headless verifier

**Files:**
- Create: `src/data/trading/codingTrading.js`
- Create: `scripts/verify-trading-coding.mjs`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Research**

Use WebSearch for queries like: `HRT software engineer interview questions`, `Jane Street OCaml/coding interview`, `Citadel Securities SWE interview heap graph`, `Optiver coding round`, `Two Sigma interview algorithms`, `quant developer order book interview question`. WebFetch the top concrete write-ups. Capture URLs for `source`.

- [ ] **Step 2: Create the data file with one COMPLETE, verified example**

Create `src/data/trading/codingTrading.js`:
```js
// Reconstructed, firm-attributed trading interview problems. Same shape the
// Pyodide judge consumes; extra fields (firms/source/representative) are ignored
// by the runner. NOT verbatim — written from public interview reports.
export const TRADING_CODING = [
  {
    id: "lob-match-engine",
    title: "Limit Order Book — Matching Engine",
    difficulty: "Hard",
    topic: "Heaps / Hash Map",
    firms: ["HRT", "Citadel Securities", "Optiver"],
    source: "reconstructed from public reports (glassdoor, r/quant)",
    representative: true,
    statement: `Process a stream of order operations against a price-time-priority limit order book.\n\nEach op is one of:\n  ["limit", side, price, qty, oid]  side is "B" (buy) or "S" (sell)\n  ["cancel", oid]\n\nA new limit order matches against the best opposite-side resting orders:\n buys match the lowest-priced sells <= their price; sells match the highest-priced buys >= their price.\nWithin a price level, older orders fill first (FIFO). Partial fills are allowed; leftover quantity rests in the book. Cancelling removes any remaining quantity for that order id.\n\nReturn the list of fills as [buy_oid, sell_oid, price, qty] in the order they occur. A fill always executes at the resting (passive) order's price.\n\nExample:\nInput: ops = [["limit","S",101,5,1], ["limit","S",100,5,2], ["limit","B",101,8,3]]\nOutput: [[3,2,100,5],[3,1,101,3]]\nExplanation: buy 3 sweeps the cheapest sell (oid 2 @100, 5 shares) then oid 1 @101 (3 of 5).`,
    funcName: "match_orders",
    starter: `def match_orders(ops):\n    # Your code here\n    pass`,
    solution: `import heapq\nfrom collections import deque, defaultdict\n\ndef match_orders(ops):\n    buys = []   # max-heap: (-price, seq, oid)\n    sells = []  # min-heap: (price, seq, oid)\n    qty = {}    # oid -> remaining qty\n    live = set()\n    seq = 0\n    fills = []\n    def clean(h, sign):\n        while h and (h[0][2] not in live or qty.get(h[0][2], 0) == 0):\n            heapq.heappop(h)\n    for op in ops:\n        if op[0] == "cancel":\n            oid = op[1]\n            live.discard(oid); qty[oid] = 0\n            continue\n        _, side, price, q, oid = op\n        seq += 1\n        qty[oid] = q; live.add(oid)\n        if side == "B":\n            clean(sells, 1)\n            while q > 0 and sells and sells[0][0] <= price:\n                p, s, soid = sells[0]\n                take = min(q, qty[soid])\n                fills.append([oid, soid, p, take])\n                q -= take; qty[soid] -= take; qty[oid] -= take\n                if qty[soid] == 0:\n                    heapq.heappop(sells); live.discard(soid)\n                clean(sells, 1)\n            if q > 0:\n                heapq.heappush(buys, (-price, seq, oid))\n        else:\n            clean(buys, -1)\n            while q > 0 and buys and -buys[0][0] >= price:\n                negp, s, boid = buys[0]\n                p = -negp\n                take = min(q, qty[boid])\n                fills.append([boid, oid, p, take])\n                q -= take; qty[boid] -= take; qty[oid] -= take\n                if qty[boid] == 0:\n                    heapq.heappop(buys); live.discard(boid)\n                clean(buys, -1)\n            if q > 0:\n                heapq.heappush(sells, (price, seq, oid))\n    return fills`,
    tests: [
      { call: 'match_orders([["limit","S",101,5,1],["limit","S",100,5,2],["limit","B",101,8,3]])', expected: "[[3,2,100,5],[3,1,101,3]]" },
      { call: 'match_orders([["limit","B",100,5,1],["limit","S",100,5,2]])', expected: "[[1,2,100,5]]" },
      { call: 'match_orders([["limit","B",100,5,1],["cancel",1],["limit","S",100,5,2]])', expected: "[]" },
      { call: 'match_orders([])', expected: "[]" },
      { call: 'match_orders([["limit","S",100,3,1],["limit","S",100,3,2],["limit","B",100,4,3]])', expected: "[[3,1,100,3],[3,2,100,1]]" },
    ],
    hint: "Two heaps (max-heap of buys, min-heap of sells) keyed for price-time priority; lazily skip cancelled/empty orders at the top.",
  },
  // ... author the rest here (target 12-20 total) following this exact pattern.
];
```
Author 12–20 problems total. Suggested coverage: order-book matching (heaps), settlement/dependency cycle detection + topological order (graphs), VWAP over a sliding window, max profit with cooldown/fees (DP), order-throttle rate limiter (deque), median trade price stream (two heaps), interval merge for trading sessions, position netting / FIFO P&L, shortest arbitrage cycle (Bellman-Ford negative cycle). Tag each with realistic firms + source.

- [ ] **Step 3: Create the headless verifier (mirrors verify-flight-coding)**

Create `scripts/verify-trading-coding.mjs`:
```js
import { TRADING_CODING } from "../src/data/trading/codingTrading.js";
import { CHECK_PY } from "../src/flight/pyRunner.js";
import { spawnSync } from "node:child_process";

let pyProblems = "";
for (const p of TRADING_CODING) {
  const allTests = [...p.tests, ...(p.hidden || [])];
  const mode = JSON.stringify(p.checker || "exact");
  const tests = allTests
    .map((t) => `    _check(${JSON.stringify(p.id)}, ${mode}, ${JSON.stringify(t.call)}, (${t.call}), (${t.expected}))`)
    .join("\n");
  const fn = p.id.replace(/[^a-z0-9]/gi, "_");
  pyProblems += `\ndef _run_${fn}():\n${p.solution.split("\n").map((l) => "    " + l).join("\n")}\n${tests}\n_run_${fn}()\n`;
}
const py = `
${CHECK_PY}
FAILS = []; TOTAL = [0]
def _check(pid, mode, call, actual, expected):
    TOTAL[0] += 1
    if not __cmp(mode, actual, expected):
        FAILS.append((pid, call, repr(actual), repr(expected)))
${pyProblems}
print("PROBLEMS:", ${TRADING_CODING.length}, "TESTS:", TOTAL[0])
if FAILS:
    print("FAILURES:", len(FAILS))
    for f in FAILS: print("  ", f[0], "|", f[1], "-> got", f[2], "want", f[3])
    raise SystemExit(1)
print("ALL PASS")
`;
const res = spawnSync("python3", ["-c", py], { encoding: "utf8" });
process.stdout.write(res.stdout || ""); process.stderr.write(res.stderr || "");
process.exit(res.status ?? 1);
```

- [ ] **Step 4: Add the script to package.json**

In `package.json` `scripts`, add:
```json
    "verify:trading": "node scripts/verify-trading-coding.mjs",
```

- [ ] **Step 5: Run the verifier — every solution must pass**

Run: `npm run verify:trading`
Expected: `... ALL PASS`. If any FAILURES, fix the solution or the expected value and re-run until green.

- [ ] **Step 6: Commit**
```bash
git add src/data/trading/codingTrading.js scripts/verify-trading-coding.mjs package.json
git commit -m "Add reconstructed trading DSA problems + headless verifier"
```

### Task 10: Python trivia cards

**Files:**
- Create: `src/data/trading/pythonTrivia.js`

- [ ] **Step 1: Create the file with the verified data shape**
```js
// Predict-the-output / gotcha cards. Reconstructed from public interview reports.
export const PYTHON_TRIVIA = [
  {
    id: "mutable-default-arg",
    concept: "Mutable default argument",
    firms: ["HRT", "Two Sigma"],
    source: "common Python gotcha; appears in many interview reports",
    code: `def add(x, acc=[]):\n    acc.append(x)\n    return acc\n\nprint(add(1))\nprint(add(2))`,
    question: "What does this print, and why?",
    answer: "[1]\\n[1, 2]",
    explanation: "Default arguments are evaluated once at function definition time, so `acc` is a single list shared across calls. Each call mutates the same list. Use `acc=None` then `acc = acc or []` inside.",
  },
  // ... author the rest here (target 20-30 total) following this exact pattern.
];
```
Author 20–30 cards. Cover: late-binding closures in a loop, `is` vs `==` and small-int caching, list aliasing / shallow vs deep copy (the Jump pointer-reference case), tuple `+=` with a list element (raises AND mutates), generator exhaustion, `dict` insertion order, integer/​float edge (`0.1+0.2`), `bool` is an `int` subclass, chained comparison, `nonlocal`/scope, `*args` unpacking, `__name__` of a lambda, set ordering. Each card: `{ id, concept, firms, source, code, question, answer, explanation }`.

- [ ] **Step 2: Sanity-check the JS parses**

Run: `node -e "import('./src/data/trading/pythonTrivia.js').then(m=>console.log('cards:', m.PYTHON_TRIVIA.length))"`
Expected: prints the count (>= 20).

- [ ] **Step 3: Commit**
```bash
git add src/data/trading/pythonTrivia.js
git commit -m "Add Python trivia / gotcha cards"
```

### Task 11: Firm guides + quant pointers

**Files:**
- Create: `src/data/trading/firms.js`
- Create: `src/data/trading/quantPointers.js`

- [ ] **Step 1: Create `firms.js`**
```js
// Per-firm interview guides, reconstructed from public reports. Each firm:
// { id, name, blurb, rounds: [{ name, detail }], emphasis: [..], samples: [..], sources: [..] }
export const FIRMS = [
  {
    id: "hrt",
    name: "Hudson River Trading (HRT)",
    blurb: "Algorithmic trading firm; engineering-heavy. Bar is clean, correct code and strong CS core.",
    rounds: [
      { name: "Online assessment", detail: "HackerRank-style: 1–3 algorithm problems, medium difficulty, time-boxed." },
      { name: "Phone / coding", detail: "Live coding plus discussion of complexity, edge cases, and debugging." },
      { name: "Core round", detail: "OS / concurrency / systems fundamentals (memory, threads, cache)." },
      { name: "Final / onsite", detail: "Multiple coding + a probability/brainteaser conversation and team fit." },
    ],
    emphasis: ["Clean idiomatic code", "Debugging", "CS fundamentals (OS, memory)", "Some probability"],
    samples: ["Order-book / matching-engine style problems", "Graph dependency / scheduling", "Predict-the-output Python/C++ trivia"],
    sources: ["glassdoor.com (HRT SWE)", "reddit r/csMajors, r/quant threads"],
  },
  // ... author the other firms following this exact pattern.
];
```
Author guides for all selected firms: HRT, Jane Street, Citadel / Citadel Securities, Two Sigma, Optiver, IMC, SIG, DRW, Jump, plus adjacent (Akuna, Five Rings, Hudson Bay) at whatever depth public info supports.

- [ ] **Step 2: Create `quantPointers.js`**
```js
// Firm-tagged pointers into existing Brainteasers/Mental Math + a few new
// market-making math cards. Avoids duplicating the existing teaser bank.
export const QUANT_POINTERS = {
  note: "Probability, EV, and mental-math practice lives in Flight Mode → Brainteasers / Mental Math. These are the firm-relevant emphases.",
  byFirm: [
    { firm: "Optiver", focus: ["Fast mental arithmetic (80 in 8 min)", "EV of simple games", "Market-making spread intuition"] },
    { firm: "Jane Street", focus: ["Conditional probability", "Combinatorics", "Fair-value / betting puzzles"] },
    // ... author the rest.
  ],
  cards: [
    {
      id: "mm-ev-quote",
      concept: "EV of a market-making quote",
      firms: ["Optiver", "IMC"],
      source: "reconstructed from public reports",
      question: "You quote a two-sided market 99 @ 101 on a coin-flip asset worth 100 or 0 with equal probability. Fair value is 50. A counterparty lifts your offer (buys from you at 101). What is your expected profit on the trade?",
      answer: "+51 expected (you sold at 101 vs fair 50).",
      explanation: "Expected value of the asset is 0.5*100 + 0.5*0 = 50. Selling at 101 yields 101 - 50 = 51 expected profit per unit, before inventory risk.",
    },
    // ... author a few more.
  ],
};
```

- [ ] **Step 3: Sanity-check both parse**

Run:
```bash
node -e "Promise.all([import('./src/data/trading/firms.js'),import('./src/data/trading/quantPointers.js')]).then(([a,b])=>console.log('firms:',a.FIRMS.length,'pointers:',b.QUANT_POINTERS.cards.length))"
```
Expected: prints non-zero counts.

- [ ] **Step 4: Commit**
```bash
git add src/data/trading/firms.js src/data/trading/quantPointers.js
git commit -m "Add firm interview guides + quant pointers"
```

---

## Phase 6 — Trading Prep UI

### Task 12: TradingPrep section with four tabs

**Files:**
- Create: `src/TradingPrep.jsx`
- Modify: `src/studyTracker.jsx`

- [ ] **Step 1: Create `src/TradingPrep.jsx`**
```jsx
import { useMemo, useState } from "react";
import { C, Panel, SectionTitle, wrap } from "./ui/theme.jsx";
import CodingPractice from "./practice/CodingPractice.jsx";
import { TRADING_CODING } from "./data/trading/codingTrading.js";
import { PYTHON_TRIVIA } from "./data/trading/pythonTrivia.js";
import { FIRMS } from "./data/trading/firms.js";
import { QUANT_POINTERS } from "./data/trading/quantPointers.js";

const TABS = [["dsa", "Trading DSA"], ["trivia", "Python Trivia"], ["firms", "Firm Guides"], ["quant", "Quant / Math"]];
const tabStyle = (active) => ({
  background: active ? C.blue : "#ffffff", color: active ? "#fff" : C.muted,
  border: `1px solid ${C.border}`, borderRadius: 20, padding: "8px 16px",
  fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: C.sys,
});
const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export default function TradingPrep({ trading, setTrading }) {
  const [tab, setTab] = useState("dsa");
  const setCoding = (updater) => setTrading((p) => ({ ...p, coding: updater(p.coding || {}) }));
  const setTrivia = (updater) => setTrading((p) => ({ ...p, trivia: updater(p.trivia || {}) }));
  return (
    <div style={wrap}>
      <SectionTitle kicker="Quant & prop trading firms" title="Trading Prep"
        right={<span style={{ fontFamily: C.sys, fontSize: 11.5, color: C.faint,
          border: `1px solid ${C.border}`, borderRadius: 18, padding: "5px 11px" }}>
          Reconstructed from public reports
        </span>} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={tabStyle(tab === k)}>{label}</button>
        ))}
      </div>
      {tab === "dsa" && (
        <CodingPractice problems={TRADING_CODING} progress={trading.coding || {}} setProgress={setCoding} />
      )}
      {tab === "trivia" && <TriviaTab progress={trading.trivia || {}} setProgress={setTrivia} />}
      {tab === "firms" && <FirmsTab />}
      {tab === "quant" && <QuantTab />}
    </div>
  );
}

function TriviaTab({ progress, setProgress }) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const t = PYTHON_TRIVIA[Math.min(idx, PYTHON_TRIVIA.length - 1)];
  const go = (d) => { setIdx((i) => (i + d + PYTHON_TRIVIA.length) % PYTHON_TRIVIA.length); setRevealed(false); };
  const reveal = () => { setRevealed(true); setProgress((p) => ({ ...p, [t.id]: { seen: true } })); };
  const seen = Object.keys(progress).length;
  return (
    <div>
      <div style={{ fontFamily: C.sys, fontSize: 12, color: C.muted, marginBottom: 10 }}>
        {idx + 1} / {PYTHON_TRIVIA.length} · {seen} seen · {t.concept}
        {t.firms?.length ? ` · ${t.firms.join(", ")}` : ""}
      </div>
      <Panel>
        <pre style={{ margin: 0, fontFamily: mono, fontSize: 13.5, background: "#f3f4f6",
          padding: "12px 14px", borderRadius: 8, whiteSpace: "pre-wrap", color: C.text }}>{t.code}</pre>
        <div style={{ marginTop: 12, fontWeight: 700, color: C.text }}>{t.question}</div>
        {revealed ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontFamily: C.sys, fontSize: 12, color: C.faint }}>OUTPUT</div>
            <pre style={{ margin: "4px 0 10px", fontFamily: mono, fontSize: 13.5, color: C.green,
              whiteSpace: "pre-wrap" }}>{t.answer}</pre>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: C.muted }}>{t.explanation}</div>
            {t.source && <div style={{ fontSize: 11, color: C.faint, marginTop: 8 }}>Source: {t.source}</div>}
          </div>
        ) : (
          <button onClick={reveal} style={{ ...tabStyle(true), marginTop: 14 }}>Reveal answer</button>
        )}
      </Panel>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={() => go(-1)} style={tabStyle(false)}>← Prev</button>
        <button onClick={() => go(1)} style={tabStyle(false)}>Next →</button>
      </div>
    </div>
  );
}

function FirmsTab() {
  const [openId, setOpenId] = useState(FIRMS[0]?.id);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {FIRMS.map((f) => {
        const open = openId === f.id;
        return (
          <Panel key={f.id}>
            <button onClick={() => setOpenId(open ? null : f.id)} style={{ width: "100%", textAlign: "left",
              background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{f.name}</span>
              <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{f.blurb}</div>
            </button>
            {open && (
              <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>
                <H>Rounds</H>
                <ol style={{ margin: "4px 0 12px", paddingLeft: 20, color: C.muted }}>
                  {f.rounds.map((r, i) => <li key={i}><b style={{ color: C.text }}>{r.name}:</b> {r.detail}</li>)}
                </ol>
                <H>Emphasis</H>
                <div style={{ color: C.muted, marginBottom: 12 }}>{f.emphasis.join(" · ")}</div>
                <H>Sample question types</H>
                <ul style={{ margin: "4px 0 12px", paddingLeft: 20, color: C.muted }}>
                  {f.samples.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                <div style={{ fontSize: 11, color: C.faint }}>Sources: {f.sources.join("; ")}</div>
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}

function QuantTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel><div style={{ fontSize: 13.5, color: C.muted }}>{QUANT_POINTERS.note}</div></Panel>
      <Panel>
        <H>Firm emphasis</H>
        {QUANT_POINTERS.byFirm.map((b) => (
          <div key={b.firm} style={{ marginBottom: 8, fontSize: 14 }}>
            <b style={{ color: C.text }}>{b.firm}:</b> <span style={{ color: C.muted }}>{b.focus.join(" · ")}</span>
          </div>
        ))}
      </Panel>
      {QUANT_POINTERS.cards.map((c) => <QuantCard key={c.id} c={c} />)}
    </div>
  );
}

function QuantCard({ c }) {
  const [open, setOpen] = useState(false);
  return (
    <Panel>
      <div style={{ fontSize: 12, color: C.faint, fontFamily: C.sys }}>{c.concept}{c.firms?.length ? ` · ${c.firms.join(", ")}` : ""}</div>
      <div style={{ fontSize: 14.5, color: C.text, margin: "6px 0", lineHeight: 1.6 }}>{c.question}</div>
      {open ? (
        <div>
          <div style={{ color: C.green, fontWeight: 700, marginBottom: 6 }}>{c.answer}</div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{c.explanation}</div>
          {c.source && <div style={{ fontSize: 11, color: C.faint, marginTop: 8 }}>Source: {c.source}</div>}
        </div>
      ) : <button onClick={() => setOpen(true)} style={tabStyle(true)}>Show answer</button>}
    </Panel>
  );
}

const H = ({ children }) => (
  <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase",
    color: C.faint, fontFamily: C.sys, marginBottom: 2 }}>{children}</div>
);
```

- [ ] **Step 2: Wire trading state + view into studyTracker**

In `src/studyTracker.jsx`:
- Import: `import TradingPrep from "./TradingPrep.jsx";`
- Import from storage: add `loadTrading, saveTrading` to the existing `./store/storage.js` import.
- Add state near the others: `const [trading, setTrading] = usePersistedState(loadTrading, saveTrading);`
- Add a view branch:
```jsx
        {view === "trading" && <TradingPrep trading={trading} setTrading={setTrading} />}
```

- [ ] **Step 3: Build + lint**

Run: `npm run build && npm run lint`
Expected: both succeed/clean.

- [ ] **Step 4: Commit**
```bash
git add -A
git commit -m "Add Trading Prep section UI (DSA, trivia, firms, quant)"
```

---

## Phase 7 — Final verification

### Task 13: Full verification + smoke test

- [ ] **Step 1: Lint, unit tests, both verifiers, build**

Run:
```bash
npm run lint && npm test && npm run verify:flight && npm run verify:trading && npm run build
```
Expected: lint clean; all node tests pass; both verifiers print `ALL PASS`; build succeeds.

- [ ] **Step 2: No decorative emoji remain**

Run:
```bash
LC_ALL=C.UTF-8 grep -rnoP "[\x{1F000}-\x{1FAFF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]" src --include="*.jsx" --include="*.js" | grep -v "↺\|▶"
```
Expected: empty.

- [ ] **Step 3: Playwright smoke test**

Start dev server (`npm run dev -- --port 5191`), then with the Playwright MCP:
- Navigate to `http://localhost:5191/`.
- Confirm the nav shows plain-text `DSA` and `Trading Prep`, light background.
- Click `DSA` → Practice tab renders a problem list + editor; switch to Guide.
- Click `Trading Prep` → each of the four tabs renders; on Trading DSA, run the matching-engine problem's reference solution and confirm "Accepted".
- Click `Trading Prep → Python Trivia` → reveal an answer.
- Check console: zero errors.
Stop the dev server.

- [ ] **Step 4: Update README + CLAUDE.md**

Add DSA + Trading Prep sections to `README.md`'s feature table and note `npm run verify:trading`. In `CLAUDE.md`, document the new `src/practice/CodingPractice.jsx` shared component, the `src/data/trading/` data files, and the publishable `trading` storage slice.

- [ ] **Step 5: Final commit + push**
```bash
git add -A
git commit -m "Docs: DSA + Trading Prep; final verification"
git push origin master
```

---

## Self-review notes (coverage check)

- Trading Prep (DSA/trivia/firms/quant): Tasks 9–12. ✓
- DSA promoted out of Flight Mode: Tasks 6–7. ✓
- GfG light re-theme (tokens, literal sweep, CodeMirror, page bg): Tasks 3–5. ✓
- Emoji removal: Tasks 1–2. ✓
- Publishable trading progress (clone-master replicates): Task 8. ✓
- Reconstructed + labeled + sourced: enforced in Phase 5 authoring notes + each data shape. ✓
- Verification (lint/test/verifiers/build/playwright/emoji-grep): Task 13. ✓
