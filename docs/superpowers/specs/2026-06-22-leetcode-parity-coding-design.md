# LeetCode-parity coding practice — design

Date: 2026-06-22

## Problem

Flight Mode's Coding tab checks user solutions with exact equality
(`eval(actual) == eval(expected)`). This produces two LeetCode-fidelity gaps:

1. **False negatives on valid answers.** Problems where LeetCode accepts
   multiple valid outputs (e.g. two-sum's `[0,1]` vs `[1,0]`) mark a correct
   answer wrong because the order differs.
2. **Thin coverage.** Each problem has ~5 visible tests and no hidden tests, so
   wrong/over-fit solutions can pass. There are no LeetCode-style hidden tests.

All 83 problems / 435 visible tests currently pass against their reference
solutions, so no stored `expected` value is literally wrong — the issue is the
*checker*, plus missing coverage.

## Goals

- Accept any valid answer ordering where LeetCode does.
- Add comprehensive hidden tests to all 83 problems.
- Show results LeetCode/NeetCode-style (sample tests visible; hidden tests
  collapsed to a pass count; first failing hidden test revealed on failure).
- Guarantee every stored `expected` is correct **by construction** (computed by
  executing the reference solution, never hand-written).

## Design

### Checker modes

Optional `checker` field per problem:

| mode | comparison | use for |
|------|-----------|---------|
| `exact` *(default)* | `actual == expected` | scalars, strings, order-defined lists |
| `unordered` | `sorted(actual) == sorted(expected)` (outer order free, inner fixed) | two-sum, "any order" index/element lists |
| `seteq` | outer **and** inner order free | group-anagrams, subsets/permutations/combinations |

Audit all 83 and tag the few needing `unordered`/`seteq`; the rest stay `exact`.
Drop two-sum's "return indices in increasing order" wording (we now accept any
order). No custom-validator mode — under NeetCode constraints the three modes
cover every problem.

### Data shape

```js
{
  ...existing,
  tests:  [{ call, expected }],   // visible "examples" (unchanged)
  hidden: [{ call, expected }],   // NEW — revealed only on failure
  checker: "unordered",           // NEW — optional, default "exact"
}
```

Hidden tests live in a generated module `src/data/flight/hiddenTests.generated.js`
(map of `problemId -> [{call, expected}]`) and are merged onto each problem at
load time in `coding.js`. This keeps generated content separate from the
hand-written problem definitions and regenerable.

### Authoring (correctness guarantee)

`scripts/gen-hidden-tests.mjs`:
- holds a hand-authored map `problemId -> [callString, ...]` of edge-case inputs
  (empty, single, duplicates, negatives, boundaries, one large stress case);
- execs each problem's reference `solution` in `python3`, evals each call,
  captures `repr(...)` as the `expected`;
- writes `hiddenTests.generated.js`.

Expected values are therefore correct by construction.

### Runner / verifier

`pyRunner.js` harness and `verify-flight-coding.mjs` gain a shared per-checker
comparison helper (`exact`/`unordered`/`seteq`) and run hidden tests in addition
to visible ones. The verifier asserts every reference solution passes all
visible + hidden tests under its checker.

### UI (FlightMode `CodingProblem` / `RunOutput`)

- Sample tests show call/got/want as today.
- Hidden tests collapse to `✓ Hidden tests N/N passed`.
- On failure, reveal the **first failing hidden test** (input · expected · got),
  remaining shown as a count.
- "Solved" requires all sample **and** hidden tests to pass.

## Non-goals

- Custom per-problem Python validators.
- Changing the visible example tests' role.
- Networked/online judge behavior.
