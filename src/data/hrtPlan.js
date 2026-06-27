// ---------------------------------------------------------------------------
//  hrtPlan.js · 5-week HRT (Hudson River Trading, Python role) prep track.
//  Rolling (not date-locked), ~10–15 hrs/week. Selectable as a separate track
//  in the tracker, with its own storage key so progress never collides with
//  the main plan. Day shape matches the main PLAN: { w, d, title, focus,
//  tasks:[{c, text}] }. Categories: dp (Greedy & DP), prob (Probability),
//  format (format rehearsal), plus reused code & mock.
//
//  Coding tasks end with "NeetCode: A, B, C" so the tracker's link parser turns
//  the named problems into clickable LeetCode links (names not in NC_SLUGS fall
//  back to plain text).
// ---------------------------------------------------------------------------

export const HRT_WEEK_TITLES = {
  1: "DP Foundations + Probability Restart",
  2: "DP Depth + Greedy + Bayes",
  3: "Knapsack + Combinatorics + First Mock (OA-ready)",
  4: "Mixed Coding Under Pressure + Puzzles + Mocks",
  5: "Full Simulation + Weak-Spot Drilling (loop-ready)",
};

export const HRT_PLAN = [
  // ===================== WEEK 1 =====================
  { w: 1, d: 1, title: "1-D linear DP — foundations", focus: "Build the recurrence; don't time yet. Top-down + memo first.",
    tasks: [
      { c: "dp", text: "Study 1-D linear DP — understand the recurrence, top-down + memo first. NeetCode: Climbing Stairs, House Robber I & II, Maximum Subarray, Decode Ways" },
      { c: "format", text: "Narrate every problem aloud from day one — communication is explicitly graded at HRT" },
    ] },
  { w: 1, d: 2, title: "1-D DP with choices", focus: "A decision at each index; define the state precisely.",
    tasks: [
      { c: "dp", text: "Study 1-D DP with choices, top-down first. NeetCode: Coin Change, Word Break, Longest Increasing Subsequence" },
      { c: "format", text: "Talk through your state and transition out loud as you code" },
    ] },
  { w: 1, d: 3, title: "Probability restart", focus: "Rebuild the core until it's automatic.",
    tasks: [
      { c: "prob", text: "Green book probability chapter, first third. Re-derive expected value and linearity of expectation until automatic" },
      { c: "format", text: "Explain each probability step aloud as if to a non-expert" },
    ] },
  { w: 1, d: 4, title: "Speed maintenance", focus: "Keep your existing Medium speed warm.",
    tasks: [
      { c: "code", text: "2–3 mixed Mediums, timed (aim 10–15 min each)" },
      { c: "format", text: "Narrate while timed — simulate the real round, don't go silent" },
    ] },

  // ===================== WEEK 2 =====================
  { w: 2, d: 5, title: "2-D grid DP", focus: "Add a timer — aim 20–25 min per problem.",
    tasks: [
      { c: "dp", text: "Study 2-D grid DP, timed 20–25 min. NeetCode: Unique Paths, Minimum Path Sum, Edit Distance" },
    ] },
  { w: 2, d: 6, title: "2-D string DP", focus: "The string-matching family.",
    tasks: [
      { c: "dp", text: "Study 2-D string DP. NeetCode: Longest Common Subsequence, Edit Distance, Palindromic Substrings" },
    ] },
  { w: 2, d: 7, title: "Greedy — intervals & selection", focus: "State WHY greedy is safe each time — that's the real skill.",
    tasks: [
      { c: "dp", text: "Greedy intervals + selection — prove greedy is valid before coding. NeetCode: Merge Intervals, Non-overlapping Intervals, Jump Game I & II, Gas Station" },
    ] },
  { w: 2, d: 8, title: "Bayes + cold redo", focus: "Conditional probability, then retention.",
    tasks: [
      { c: "prob", text: "Conditional probability & Bayes; drill the classic false-positive / disease-test problem until reflexive" },
      { c: "dp", text: "Redo 3 DP problems from Week 1 cold (no notes) — rebuild the recurrence from scratch" },
    ] },

  // ===================== WEEK 3 — OA-ready =====================
  { w: 3, d: 9, title: "Knapsack family", focus: "Hardest DP category — take your time.",
    tasks: [
      { c: "dp", text: "0/1 knapsack family — capacity-vs-value state. NeetCode: Partition Equal Subset Sum, Target Sum, Coin Change II" },
    ] },
  { w: 3, d: 10, title: "Heap-greedy", focus: "Greedy backed by a priority queue.",
    tasks: [
      { c: "dp", text: "Heap-greedy patterns. NeetCode: Reorganize String, Minimum Cost to Connect Sticks, K Closest Points" },
    ] },
  { w: 3, d: 11, title: "Combinatorics + distributions", focus: "Know mean & variance of each cold.",
    tasks: [
      { c: "prob", text: "Combinatorics + common distributions: Bernoulli, binomial, geometric, Poisson, uniform, normal — mean & variance of each" },
    ] },
  { w: 3, d: 12, title: "First mock + debugging round", focus: "Baseline under observation.",
    tasks: [
      { c: "mock", text: "First timed coding mock (interviewing.io or a peer) for a baseline under observation" },
      { c: "format", text: "Debugging-round rehearsal: introduce a bug into unfamiliar code and find it — HRT often has a defining debugging round" },
    ] },
  { w: 3, d: 13, title: "GATE — OA-ready checkpoint", focus: "Acclimate to the proctored platform.",
    tasks: [
      { c: "format", text: "Do 2–3 CodeSignal / HackerRank timed sets to acclimate to the proctored format (expect at least one very hard question)" },
      { c: "mock", text: "Checkpoint: be OA-ready. On timed sets, solve the easy ones first and reserve time for edge-case review" },
    ] },

  // ===================== WEEK 4 =====================
  { w: 4, d: 14, title: "Mixed coding under pressure", focus: "Simulate not knowing the type.",
    tasks: [
      { c: "dp", text: "Mixed greedy/DP with NO category labels, timed (simulate not knowing the pattern). Add a few DP Hards for ceiling" },
    ] },
  { w: 4, d: 15, title: "Probability puzzles", focus: "Green book brainteasers chapter.",
    tasks: [
      { c: "prob", text: "Green book brainteasers + classics: gambler's ruin, expected number of trials, dice/coin problems" },
    ] },
  { w: 4, d: 16, title: "Mocks", focus: "Verbalize reasoning throughout.",
    tasks: [
      { c: "mock", text: "1 coding mock + (if possible) 1 probability/brainteaser mock, verbalizing your reasoning the whole way" },
    ] },
  { w: 4, d: 17, title: "Verbal format rehearsal", focus: "Talk-aloud should now be automatic.",
    tasks: [
      { c: "format", text: "One verbally-dictated-problem rehearsal — have someone read a problem aloud and solve it from listening (no screen)" },
    ] },

  // ===================== WEEK 5 — loop-ready =====================
  { w: 5, d: 18, title: "Full onsite simulation", focus: "Stamina test — one sitting.",
    tasks: [
      { c: "mock", text: "Simulate the onsite: back-to-back coding + probability in one sitting (this is a stamina test)" },
    ] },
  { w: 5, d: 19, title: "Weak-spot DP drilling", focus: "Cold, from the recurrence.",
    tasks: [
      { c: "dp", text: "Re-do your 5 worst DP problems cold — no notes, rebuild the recurrence each time" },
    ] },
  { w: 5, d: 20, title: "Weak-spot probability drilling", focus: "Cold, no notes.",
    tasks: [
      { c: "prob", text: "Re-do your 5 hardest probability problems cold" },
    ] },
  { w: 5, d: 21, title: "Final mocks + rest", focus: "No new patterns this late — rest before the real thing.",
    tasks: [
      { c: "mock", text: "1–2 final mocks with a written self-review after each" },
      { c: "code", text: "Maintenance only — no new patterns. Rest before the real thing" },
    ] },
];

// Reference facts shown in the collapsible info panel on the HRT track.
// Distilled from the prep spec + public interview reports (HRT's own HRTBeat
// blog, Hacker News, AlgoDaily, LinkJob; Glassdoor/Blind were login-walled).
export const HRT_INFO = {
  process:
    "OA (CodeSignal / HackerRank — medium–hard, proctored, Python; format varies, e.g. ~4 questions in 70 min or 3 in 150 min) → ~2 phone screens (one often a debugging round) → full-day onsite (coding + debugging, technical/system design, team fit). Python roles may add a math/probability component; some report deep CPython-internals questions.",
  graded: [
    "Communication — weighted roughly equally with technical skill. Narrate aloud; over-communicate when you change approach.",
    "Teachability — take hints gracefully and apply earlier ideas to later problems.",
    "Fundamentals — real intuition for memory / OS / I/O, not memorized definitions.",
    "Methodical problem-solving — HRT deliberately avoids 'aha' LeetCode tricks; favor a clear, incremental approach.",
    "Honesty — admit uncertainty; using LLMs to cheat is a top disqualifier.",
  ],
  frameworks: [
    { k: "DP", v: "state → recurrence → base case → order. Write it top-down with memoization first." },
    { k: "Greedy", v: "knowing WHETHER greedy is valid matters more than the code. Prove it's safe each time." },
    { k: "Probability", v: "master LINEARITY OF EXPECTATION first — it's the highest-leverage tool." },
  ],
  resource:
    "“A Practical Guide to Quantitative Finance Interviews” (Xinfeng Zhou — the “green book”): probability + brainteaser chapters only.",
  top3: [
    "Close the DP gap with the framework, not memorization — redo problems cold until the recurrence is natural.",
    "Refresh probability from the green book — linearity of expectation first.",
    "Narrate aloud on everything from day one — it's directly graded.",
  ],
  sources: [
    "HRT HRTBeat interview blog (hudsonrivertrading.com/hrtbeat)",
    "Hacker News, AlgoDaily, LinkJob CodeSignal write-ups",
    "Glassdoor / Blind (login-walled; search snippets only)",
  ],
};
