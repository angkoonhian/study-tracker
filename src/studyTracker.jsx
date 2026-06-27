import React, { useState, useMemo, useCallback } from "react";
import FrameworkGuide from "./FrameworkGuide.jsx";
import JobRoles from "./JobRoles.jsx";
import ProblemBank from "./ProblemBank.jsx";
import Flashcards from "./Flashcards.jsx";
import Dashboard from "./Dashboard.jsx";
import Today from "./Today.jsx";
import FlightMode from "./FlightMode.jsx";
import DSA from "./DSA.jsx";
import TradingPrep from "./TradingPrep.jsx";
import { QUANT_PLAN } from "./data/quantPlan.js";
import { HRT_PLAN, HRT_WEEK_TITLES, HRT_INFO } from "./data/hrtPlan.js";
import { C, GlobalNav, page as pageStyle } from "./ui/theme.jsx";
import {
  loadTracker, saveTracker, loadBank, saveBank, loadCards, saveCards,
  loadSettings, saveSettings, loadFlight, saveFlight,
  loadTrading, saveTrading, loadTrackerHrt, saveTrackerHrt, loadTrack, saveTrack,
  exportAll, importAll, resetToPublished, KEYS,
} from "./store/storage.js";

// ---------------------------------------------------------------------------
//  49-DAY BIG TECH INTERVIEW STUDY TRACKER
//  System-design-weighted (~45%), apply Week 1, ~7-week ramp.
//  Progress persists across sessions via localStorage.
// ---------------------------------------------------------------------------

// LeetCode slug map for the NeetCode problems referenced in PLAN. Keyed by
// the exact problem name as it appears in a task (lowercased). If a problem
// isn't here, it renders as plain text — safe fallback.
const NC_SLUGS = {
  "two sum": "two-sum",
  "contains duplicate": "contains-duplicate",
  "valid anagram": "valid-anagram",
  "group anagrams": "group-anagrams",
  "top k frequent elements": "top-k-frequent-elements",
  "product of array except self": "product-of-array-except-self",
  "encode/decode strings": "encode-and-decode-strings",
  "longest consecutive sequence": "longest-consecutive-sequence",
  "valid palindrome": "valid-palindrome",
  "two sum ii": "two-sum-ii-input-array-is-sorted",
  "3sum": "3sum",
  "container with most water": "container-with-most-water",
  "best time to buy/sell stock": "best-time-to-buy-and-sell-stock",
  "longest substring without repeating": "longest-substring-without-repeating-characters",
  "longest repeating character replacement": "longest-repeating-character-replacement",
  "valid parentheses": "valid-parentheses",
  "min stack": "min-stack",
  "daily temperatures": "daily-temperatures",
  "car fleet": "car-fleet",
  "binary search": "binary-search",
  "search rotated sorted array": "search-in-rotated-sorted-array",
  "invert tree": "invert-binary-tree",
  "max depth": "maximum-depth-of-binary-tree",
  "same tree": "same-tree",
  "diameter": "diameter-of-binary-tree",
  "balanced tree": "balanced-binary-tree",
  "level order traversal": "binary-tree-level-order-traversal",
  "validate bst": "validate-binary-search-tree",
  "lca of bst": "lowest-common-ancestor-of-a-binary-search-tree",
  "kth smallest in bst": "kth-smallest-element-in-a-bst",
  "construct tree from preorder/inorder": "construct-binary-tree-from-preorder-and-inorder-traversal",
  "implement trie": "implement-trie-prefix-tree",
  "add and search word": "design-add-and-search-words-data-structure",
  "kth largest in stream": "kth-largest-element-in-a-stream",
  "last stone weight": "last-stone-weight",
  "k closest points": "k-closest-points-to-origin",
  "subsets": "subsets",
  "combination sum": "combination-sum",
  "permutations": "permutations",
  "number of islands": "number-of-islands",
  "clone graph": "clone-graph",
  "pacific atlantic": "pacific-atlantic-water-flow",
  "course schedule i": "course-schedule",
  "course schedule ii": "course-schedule-ii",
  "graph valid tree": "graph-valid-tree",
  "number of connected components": "number-of-connected-components-in-an-undirected-graph",
  "word ladder": "word-ladder",
  "climbing stairs": "climbing-stairs",
  "house robber i": "house-robber",
  "house robber ii": "house-robber-ii",
  "coin change": "coin-change",
  "longest increasing subsequence": "longest-increasing-subsequence",
  "word break": "word-break",
  "decode ways": "decode-ways",
  "unique paths": "unique-paths",
  "longest common subsequence": "longest-common-subsequence",
  "network delay": "network-delay-time",
  "min cost to connect points": "min-cost-to-connect-all-points",
  "maximum subarray": "maximum-subarray",
  "jump game": "jump-game",
  "merge intervals": "merge-intervals",
  "insert interval": "insert-interval",
  "non-overlapping intervals": "non-overlapping-intervals",
  "meeting rooms i": "meeting-rooms",
  "meeting rooms ii": "meeting-rooms-ii",
  "single number": "single-number",
  "number of 1 bits": "number-of-1-bits",
  "counting bits": "counting-bits",
  // HRT track (DP / greedy) problems
  "minimum path sum": "minimum-path-sum",
  "edit distance": "edit-distance",
  "palindromic substrings": "palindromic-substrings",
  "longest palindromic substring": "longest-palindromic-substring",
  "partition equal subset sum": "partition-equal-subset-sum",
  "target sum": "target-sum",
  "coin change ii": "coin-change-ii",
  "gas station": "gas-station",
  "reorganize string": "reorganize-string",
  "jump game i": "jump-game",
  "jump game ii": "jump-game-ii",
  "minimum cost to connect sticks": "minimum-cost-to-connect-sticks",
};

const lcUrl = (slug) => `https://leetcode.com/problems/${slug}/`;

// Turn a task string into renderable segments. For "NeetCode...: A, B, C" the
// problem names become clickable LeetCode links. Everything else passes through
// as plain text.
function renderTaskSegments(text) {
  if (!/neetcode/i.test(text)) return [{ text }];
  const lastColon = text.lastIndexOf(":");
  if (lastColon < 0) return [{ text }];

  const prefix = text.slice(0, lastColon + 1);
  const rest = text.slice(lastColon + 1);
  const segments = [{ text: prefix + " " }];

  const parts = rest.split(",");
  parts.forEach((rawPart, i) => {
    if (i > 0) segments.push({ text: ", " });

    const part = rawPart.trim();
    // Pull off a trailing parenthetical, e.g. "Network Delay (Dijkstra)"
    const parenMatch = part.match(/^(.+?)\s*(\([^)]*\))\s*$/);
    const name = parenMatch ? parenMatch[1].trim() : part;
    const note = parenMatch ? " " + parenMatch[2] : "";

    // Expand "Foo I & II" into two linked problems
    const romanMatch = name.match(/^(.+?)\s+I\s*&\s*II$/i);
    if (romanMatch) {
      const base = romanMatch[1].trim();
      const s1 = NC_SLUGS[(base + " i").toLowerCase()];
      const s2 = NC_SLUGS[(base + " ii").toLowerCase()];
      pushNameSegment(segments, base + " I", s1);
      segments.push({ text: " & " });
      pushNameSegment(segments, "II", s2);
      if (note) segments.push({ text: note });
      return;
    }

    const slug = NC_SLUGS[name.toLowerCase()];
    pushNameSegment(segments, name, slug);
    if (note) segments.push({ text: note });
  });

  return segments;
}

function pushNameSegment(segments, label, slug) {
  if (slug) segments.push({ text: label, url: lcUrl(slug) });
  else segments.push({ text: label });
}

const CATS = {
  apply: { label: "Applications", color: C.amber, bg: "#FBF1E0" },
  design: { label: "System Design", color: C.blue, bg: "#E6EEFB" },
  code: { label: "Coding", color: C.green, bg: "#E2F2EA" },
  behave: { label: "Behavioral", color: "#8250df", bg: "#F2E6F7" },
  mock: { label: "Mock / Sim", color: C.red, bg: "#FAE6EB" },
  prob: { label: "Probability & Stats", color: "#0E7490", bg: "#E0F2F4" },
  mental: { label: "Brainteasers & Mental Math", color: "#6D28D9", bg: "#EDE7FB" },
  markets: { label: "Markets & Microstructure", color: "#BE185D", bg: "#FBE6F0" },
  dp: { label: "Greedy & DP", color: "#C2410C", bg: "#FBEAE0" },
  format: { label: "Format Rehearsal", color: "#0F766E", bg: "#E0F2F0" },
};

// Each day: { w, d, title, focus, tasks:[{id,c,text}] }
const MAIN_PLAN = [
  // ===================== WEEK 1 =====================
  { w:1, d:1, title:"Launch applications + design framework", focus:"The single highest-ROI day. Apps go out, design starts.",
    tasks:[
      {c:"apply", text:"List 10–12 target roles from the job plan (Google, Meta, Databricks, TikTok, Stripe, Atlassian, Spotify, Apple)"},
      {c:"apply", text:"Check LinkedIn for 2nd-degree connections at each target company"},
      {c:"design", text:"Memorize the 7-step framework: Requirements → Estimates → API → Data → HLD → Deep dive → Tradeoffs"},
      {c:"design", text:"Read System Design Primer: scalability + back-of-envelope estimation sections"},
      {c:"code", text:"NeetCode: 1 Easy + 1 Medium (Arrays & Hashing): Two Sum, Contains Duplicate"},
    ]},
  { w:1, d:2, title:"Send applications + first design", focus:"Get the pipeline moving. Referrals before cold applies.",
    tasks:[
      {c:"apply", text:"Send 5 referral requests to 2nd-degree connections (template-based, personalized)"},
      {c:"apply", text:"Submit 10–12 applications (referral-backed where possible)"},
      {c:"design", text:"Full written design #1: URL shortener (use all 7 steps, include real numbers)"},
      {c:"code", text:"NeetCode: Valid Anagram, Group Anagrams"},
    ]},
  { w:1, d:3, title:"Convert your experience to vocabulary", focus:"Turn the systems you've built into interview ammunition.",
    tasks:[
      {c:"design", text:"Write 1 paragraph each: 24× speedup → 'latency optimization via caching tier'"},
      {c:"design", text:"Write: alerting system → 'event-driven pub/sub notification pipeline'"},
      {c:"design", text:"Write: reporting framework → 'batch + intraday compute layer'; MCP → 'plugin architecture w/ clean API'"},
      {c:"code", text:"NeetCode: Top K Frequent Elements, Product of Array Except Self"},
      {c:"behave", text:"List your 6–7 strongest projects (one line each, don't polish)"},
    ]},
  { w:1, d:4, title:"Core concepts: Tier A (part 1)", focus:"The building blocks every design reuses.",
    tasks:[
      {c:"design", text:"Study load balancing: L4 vs L7, consistent hashing (why it matters for caches/shards)"},
      {c:"design", text:"Study caching: cache-aside vs write-through vs write-back, eviction (LRU/LFU/TTL)"},
      {c:"code", text:"NeetCode: Encode/Decode Strings, Longest Consecutive Sequence"},
      {c:"code", text:"Write the 1-page fundamentals cheat sheet from memory (Big-O of every common op)"},
    ]},
  { w:1, d:5, title:"Core concepts: Tier A (part 2)", focus:"Database scaling + the SQL/NoSQL decision.",
    tasks:[
      {c:"design", text:"Study DB scaling: replication (leader-follower), sharding (range/hash/geo), resharding problem"},
      {c:"design", text:"Study SQL vs NoSQL: document/KV/wide-column/graph; tie choice to access pattern"},
      {c:"code", text:"NeetCode Two Pointers: Valid Palindrome, Two Sum II"},
      {c:"behave", text:"Draft STAR one-liner for each project: situation + your action + measurable result"},
    ]},
  { w:1, d:6, title:"Consistency models + review", focus:"CAP done correctly. Then consolidate.",
    tasks:[
      {c:"design", text:"Study consistency: strong vs eventual, CAP (behavior during partition, not 'pick 2')"},
      {c:"design", text:"Re-do URL shortener design from memory — no notes, time-box 30 min"},
      {c:"code", text:"NeetCode: 3Sum, Container With Most Water"},
    ]},
  { w:1, d:7, title:"Week 1 review + buffer", focus:"Catch up, then self-assess. Light day by design.",
    tasks:[
      {c:"apply", text:"Confirm: 10–12 applications sent + ~5 referral requests out (non-negotiable)"},
      {c:"design", text:"Self-grade URL shortener redo on the 4 axes (navigation/design/depth/communication)"},
      {c:"code", text:"Re-do any 2 problems from this week that felt weak (from memory)"},
      {c:"behave", text:"Pick which project becomes your 'failure story' (you'll write it by Week 5)"},
    ]},
  // ===================== WEEK 2 =====================
  { w:2, d:8, title:"System design core + wave 2 apps", focus:"Canonical-systems muscle begins. Numbers are mandatory.",
    tasks:[
      {c:"design", text:"Full written design #2: Rate limiter (token bucket, where to enforce, distributed counter)"},
      {c:"apply", text:"Submit 8–10 more applications (wave 2)"},
      {c:"apply", text:"Respond within 24h to any recruiter replies from Week 1"},
      {c:"code", text:"NeetCode Sliding Window: Best Time to Buy/Sell Stock, Longest Substring Without Repeating"},
    ]},
  { w:2, d:9, title:"Design #3 + deep concepts", focus:"Fan-out and pub-sub.",
    tasks:[
      {c:"design", text:"Full written design #3: Notification system (pub-sub, fan-out, retries, gateways)"},
      {c:"design", text:"Deep study: message queues — Kafka vs SQS mental model, at-least-once vs exactly-once"},
      {c:"code", text:"NeetCode: Longest Repeating Character Replacement"},
    ]},
  { w:2, d:10, title:"Design #4 (the big one)", focus:"News feed — fan-out on write vs read, the celebrity problem.",
    tasks:[
      {c:"design", text:"Full written design #4: News feed / Twitter timeline (with hard numbers)"},
      {c:"design", text:"Compare your design against a reference write-up; list what you missed"},
      {c:"code", text:"NeetCode Stack: Valid Parentheses, Min Stack"},
    ]},
  { w:2, d:11, title:"Tier B concepts", focus:"CDNs, rate limiting, observability.",
    tasks:[
      {c:"design", text:"Study CDNs: static vs dynamic, edge caching, invalidation (the 'design YouTube' staple)"},
      {c:"design", text:"Study rate limiting algorithms + observability (metrics/logs/traces — mention unprompted)"},
      {c:"code", text:"NeetCode: Daily Temperatures, Car Fleet"},
    ]},
  { w:2, d:12, title:"Design #5 + concurrency", focus:"Chat/messaging — real-time mechanics.",
    tasks:[
      {c:"design", text:"Full written design #5: Chat/messaging (WebSockets, receipts, presence, message store)"},
      {c:"design", text:"Study concurrency primitives: idempotency keys, optimistic vs pessimistic locking, dual-write"},
      {c:"code", text:"NeetCode Binary Search: Binary Search, Search Rotated Sorted Array"},
    ]},
  { w:2, d:13, title:"Coding depth: trees", focus:"Shift coding to Medium-dominant.",
    tasks:[
      {c:"code", text:"NeetCode Trees: Invert Tree, Max Depth, Same Tree, Diameter, Balanced Tree"},
      {c:"code", text:"NeetCode: Level Order Traversal, Validate BST"},
      {c:"design", text:"Re-do Rate limiter from memory, 30 min, spoken aloud"},
    ]},
  { w:2, d:14, title:"Week 2 review + buffer", focus:"Consolidate. 20+ apps should be out by now.",
    tasks:[
      {c:"apply", text:"Confirm 20+ total applications submitted; update tracking sheet"},
      {c:"design", text:"Review all 5 designs; identify your single weakest of the 7 framework steps"},
      {c:"code", text:"Re-do 3 hardest problems from this week from memory"},
      {c:"behave", text:"Expand 2 STAR one-liners into full stories (S/T/A/R, ≤2 min spoken)"},
    ]},
  // ===================== WEEK 3 =====================
  { w:3, d:15, title:"Timed design begins", focus:"Shift from 'can I design' to 'can I design while talking'.",
    tasks:[
      {c:"design", text:"TIMED 45-min spoken design: Notification system (no notes, narrate throughout)"},
      {c:"design", text:"Drill the 5 follow-ups: 10× traffic, why this DB, node failure, consistency risk, monitoring"},
      {c:"code", text:"NeetCode Trees: LCA of BST, Kth Smallest in BST, Construct Tree from Preorder/Inorder"},
      {c:"behave", text:"Expand 2 more STAR stories to full form"},
    ]},
  { w:3, d:16, title:"Design #6 + tries", focus:"Web crawler — BFS at scale.",
    tasks:[
      {c:"design", text:"Full written design #6: Web crawler (politeness, dedup, distributed workers)"},
      {c:"code", text:"NeetCode Tries: Implement Trie, Add and Search Word"},
      {c:"behave", text:"Expand remaining STAR stories — aim for 7 total written"},
    ]},
  { w:3, d:17, title:"TIMED design + heaps", focus:"Pressure rep on a hard one.",
    tasks:[
      {c:"design", text:"TIMED 45-min spoken design: Chat/messaging + all 5 follow-ups"},
      {c:"code", text:"NeetCode Heap: Kth Largest in Stream, Last Stone Weight, K Closest Points"},
    ]},
  { w:3, d:18, title:"Design #7 + backtracking", focus:"Distributed cache — pure DS mechanics.",
    tasks:[
      {c:"design", text:"Full written design #7: Distributed cache (consistent hashing, eviction, hot keys)"},
      {c:"code", text:"NeetCode Backtracking: Subsets, Combination Sum, Permutations"},
    ]},
  { w:3, d:19, title:"Graphs (Google/Meta heavy)", focus:"Over-invest here — highest-frequency hard category.",
    tasks:[
      {c:"code", text:"NeetCode Graphs: Number of Islands, Clone Graph, Pacific Atlantic"},
      {c:"code", text:"NeetCode: Course Schedule I & II (topological sort)"},
      {c:"design", text:"Re-do News feed design from memory, timed 40 min"},
    ]},
  { w:3, d:20, title:"TIMED design + graphs cont.", focus:"Keep the design pressure on.",
    tasks:[
      {c:"design", text:"TIMED 45-min spoken design: Web crawler + follow-ups"},
      {c:"code", text:"NeetCode Graphs: Graph Valid Tree, Number of Connected Components"},
      {c:"code", text:"NeetCode Graphs (hard): Word Ladder"},
    ]},
  { w:3, d:21, title:"Week 3 review + buffer", focus:"Phone screens may start landing now.",
    tasks:[
      {c:"design", text:"Review the 3 timed designs; score each on the 4 axes; note weakest axis"},
      {c:"code", text:"Mixed review: 4 problems with NO pattern labels (simulate not knowing category)"},
      {c:"behave", text:"Confirm 7 STAR stories written; tag each with the trait it proves"},
      {c:"apply", text:"Check pipeline; respond to any recruiter outreach within 24h"},
    ]},
  // ===================== WEEK 4 =====================
  { w:4, d:22, title:"Design #8 + dynamic programming", focus:"File storage. DP is highest-leverage hard category.",
    tasks:[
      {c:"design", text:"Full written design #8: File storage / Dropbox (chunking, dedup, metadata/blob split, sync)"},
      {c:"code", text:"NeetCode DP (1-D): Climbing Stairs, House Robber I & II"},
    ]},
  { w:4, d:23, title:"TIMED design + DP", focus:"Pressure rep.",
    tasks:[
      {c:"design", text:"TIMED 45-min spoken design: Distributed cache + follow-ups"},
      {c:"code", text:"NeetCode DP: Coin Change, Longest Increasing Subsequence"},
    ]},
  { w:4, d:24, title:"Design #9 (integrative)", focus:"Ride-hailing — geospatial + real-time + matching.",
    tasks:[
      {c:"design", text:"Full written design #9: Ride-hailing / nearby (geohash/quadtree, matching, real-time)"},
      {c:"code", text:"NeetCode DP: Word Break, Decode Ways"},
    ]},
  { w:4, d:25, title:"Design #10 + NeetCode 2D DP", focus:"Payment system — idempotency & exactly-once.",
    tasks:[
      {c:"design", text:"Full written design #10: Payment system (idempotency, ledger, consistency under failure)"},
      {c:"code", text:"NeetCode 2-D DP extras: Unique Paths, Longest Common Subsequence"},
    ]},
  { w:4, d:26, title:"TIMED design + advanced graphs", focus:"Pull NeetCode graph extras (Google/Meta).",
    tasks:[
      {c:"design", text:"TIMED 45-min spoken design: Ride-hailing + follow-ups"},
      {c:"code", text:"NeetCode extras: Network Delay (Dijkstra), Min Cost to Connect Points (MST)"},
    ]},
  { w:4, d:27, title:"Intervals + greedy", focus:"Round out the coding patterns.",
    tasks:[
      {c:"code", text:"NeetCode Greedy/Intervals: Maximum Subarray, Jump Game, Merge Intervals"},
      {c:"code", text:"NeetCode: Insert Interval, Non-overlapping Intervals, Meeting Rooms I & II"},
      {c:"design", text:"Re-do Payment system from memory, timed 40 min"},
    ]},
  { w:4, d:28, title:"Week 4 review + buffer", focus:"All 10 designs done. Coding patterns covered.",
    tasks:[
      {c:"design", text:"Confirm all 10 designs written; rank your 3 worst for timed re-drilling later"},
      {c:"code", text:"NeetCode Bit Manipulation: Single Number, Number of 1 Bits, Counting Bits"},
      {c:"code", text:"Mixed review: 4 unlabeled problems"},
      {c:"behave", text:"Rehearse 'Tell me about yourself' + 'Why this company' aloud"},
    ]},
  // ===================== WEEK 5 =====================
  { w:5, d:29, title:"Mocks begin (design-weighted)", focus:"Live pushback is where real growth is for you.",
    tasks:[
      {c:"mock", text:"System design mock #1 (interviewing.io or peer) — record it"},
      {c:"mock", text:"Write self-review: how did you handle ambiguity & follow-ups, not just the diagram"},
      {c:"code", text:"1–2 Mediums, mixed/unlabeled"},
      {c:"behave", text:"WRITE THE FAILURE STORY — real, owned, changed outcome (must hold up to probing)"},
    ]},
  { w:5, d:30, title:"Coding mock + AI-assisted prep", focus:"Meta's AI round rewards your MCP background.",
    tasks:[
      {c:"mock", text:"Coding mock #1 — narrate throughout, state complexity unprompted"},
      {c:"design", text:"AI-assisted format practice: let AI scaffold, audit line-by-line aloud, narrate what you'd verify"},
      {c:"code", text:"1 Medium + re-do 1 weak problem from memory"},
    ]},
  { w:5, d:31, title:"Design mock #2 + weak-axis work", focus:"Target the axis your mocks exposed.",
    tasks:[
      {c:"mock", text:"System design mock #2 — focus on your weakest of the 4 axes"},
      {c:"design", text:"Re-do the design you handled worst in a mock, from scratch"},
      {c:"code", text:"1–2 Mediums, mixed"},
    ]},
  { w:5, d:32, title:"Behavioral rehearsal", focus:"Conversational, not memorized.",
    tasks:[
      {c:"behave", text:"Rehearse all 7 STAR stories + failure story aloud until conversational"},
      {c:"behave", text:"Rehearse 'Most challenging project' & 'A time you were wrong' with technical depth"},
      {c:"code", text:"1–2 Mediums, mixed"},
      {c:"design", text:"Re-do 1 of your 3 worst designs, timed"},
    ]},
  { w:5, d:33, title:"Design mock #3", focus:"Keep the live reps coming.",
    tasks:[
      {c:"mock", text:"System design mock #3 — full 45 min, new problem"},
      {c:"mock", text:"Self-review + log the specific follow-up that tripped you"},
      {c:"code", text:"1 Medium + 1 Hard (graph or DP)"},
    ]},
  { w:5, d:34, title:"Company-specific tuning", focus:"Tailor for whatever is live in your pipeline.",
    tasks:[
      {c:"apply", text:"For each active interview: study company-tagged LeetCode + engineering values page"},
      {c:"behave", text:"Re-tag your STAR stories in that company's language (e.g. Google 'Googleyness')"},
      {c:"code", text:"Company-tagged problems for your most advanced pipeline"},
    ]},
  { w:5, d:35, title:"Week 5 review + buffer", focus:"4+ mocks done. Screens in progress.",
    tasks:[
      {c:"mock", text:"Confirm 4+ mocks done with written self-reviews"},
      {c:"behave", text:"Confirm failure story written and rehearsed aloud"},
      {c:"design", text:"Re-do final one of your 3 worst designs, timed + narrated"},
      {c:"apply", text:"Pipeline review: every stage, every company, next action logged"},
    ]},
  // ===================== WEEK 6 =====================
  { w:6, d:36, title:"Design mock #4 + maintenance", focus:"Sharpness, not new volume.",
    tasks:[
      {c:"mock", text:"System design mock #4"},
      {c:"code", text:"1 Medium maintenance, mixed"},
      {c:"design", text:"Drill follow-ups on your 2 strongest designs (so they're bulletproof)"},
    ]},
  { w:6, d:37, title:"Coding mock #2", focus:"Phone-screen sharpness.",
    tasks:[
      {c:"mock", text:"Coding mock #2 — plain editor, no autocomplete, hand-trace output"},
      {c:"code", text:"Re-do your 5 hardest problems from memory"},
      {c:"behave", text:"Rehearse stories with a focus on quantified results"},
    ]},
  { w:6, d:38, title:"Design mock #5", focus:"Last scheduled design mock.",
    tasks:[
      {c:"mock", text:"System design mock #5 — pick the system type you've practiced least"},
      {c:"mock", text:"Self-review; compare against mock #1 to measure improvement"},
      {c:"code", text:"1 Medium, mixed"},
    ]},
  { w:6, d:39, title:"Company tuning + comp research", focus:"Prep specifics for active loops.",
    tasks:[
      {c:"apply", text:"Pull comp ranges from levels.fyi for your level/location (before any offer)"},
      {c:"apply", text:"For each onsite: tailor 'why this company' to a specific team/product"},
      {c:"code", text:"Company-tagged problems for upcoming onsites"},
    ]},
  { w:6, d:40, title:"Behavioral polish", focus:"Make probing comfortable.",
    tasks:[
      {c:"behave", text:"Mock behavioral round: have someone fire follow-ups on your failure story"},
      {c:"behave", text:"Tighten any story over 2 minutes; cut to the essential 'I' actions"},
      {c:"design", text:"Re-do 1 of your 3 weakest designs, timed"},
    ]},
  { w:6, d:41, title:"Weak-area sprint", focus:"Spend the day on whatever is lowest.",
    tasks:[
      {c:"design", text:"Honest audit: which of the 4 design axes is still weakest? Drill it for 90 min"},
      {c:"code", text:"Drill your weakest coding pattern (re-do 4 problems in it)"},
      {c:"mock", text:"Optional extra mock if a specific area is shaky"},
    ]},
  { w:6, d:42, title:"Week 6 review + buffer", focus:"You should be near peak now.",
    tasks:[
      {c:"design", text:"Final design audit: can you do any of the 10 cold, 45 min, narrated? Spot-check 2"},
      {c:"code", text:"Mixed review: 5 unlabeled problems, timed 25–35 min each"},
      {c:"behave", text:"Full story bank rehearsal — all stories, aloud, one sitting"},
      {c:"apply", text:"Pipeline review + schedule remaining onsites"},
    ]},
  // ===================== WEEK 7 =====================
  { w:7, d:43, title:"Full-loop simulation #1", focus:"Stamina across a real loop is what fails strong candidates.",
    tasks:[
      {c:"mock", text:"Back-to-back sim: 1 coding + 1 system design + 1 behavioral in one sitting"},
      {c:"mock", text:"Written debrief: where did fatigue/consistency slip?"},
    ]},
  { w:7, d:44, title:"Recover + targeted fixes", focus:"Fix what the sim exposed.",
    tasks:[
      {c:"design", text:"Re-do the sim's design round, addressing the specific gap"},
      {c:"code", text:"1 Medium maintenance + re-do the sim's coding problem clean"},
      {c:"behave", text:"Re-rehearse whichever story landed weakest in the sim"},
    ]},
  { w:7, d:45, title:"Full-loop simulation #2", focus:"Consistency check — closer to the real thing.",
    tasks:[
      {c:"mock", text:"Back-to-back sim #2: full loop, new problems"},
      {c:"mock", text:"Compare consistency vs sim #1"},
    ]},
  { w:7, d:46, title:"Weakest-design re-drill", focus:"Deepen what you have; don't learn new systems.",
    tasks:[
      {c:"design", text:"Re-do the 3 designs you handled worst, timed + narrated, back to back"},
      {c:"code", text:"1 Medium + re-do your 5 hardest problems"},
    ]},
  { w:7, d:47, title:"Per-onsite custom prep", focus:"Tailor to each live interview.",
    tasks:[
      {c:"apply", text:"For the next onsite: company-tagged problems, product, eng culture, 'why this team'"},
      {c:"behave", text:"Rehearse the story set most relevant to that company's values"},
      {c:"design", text:"Review the design types that company is known to ask"},
    ]},
  { w:7, d:48, title:"Light maintenance + readiness", focus:"Stay sharp, don't cram. Rest matters now.",
    tasks:[
      {c:"code", text:"1 Medium only — keep the reflex warm, don't exhaust"},
      {c:"design", text:"Skim your concept cheat sheet + the 5 follow-up questions"},
      {c:"behave", text:"Light run-through of top 5 stories; then stop and rest"},
    ]},
  { w:7, d:49, title:"Buffer / ongoing loop", focus:"Repeat per-onsite prep for each interview as it comes.",
    tasks:[
      {c:"apply", text:"Negotiation: never accept on the spot; always have/imply a competing process"},
      {c:"apply", text:"For every subsequent onsite, repeat Day 47's per-onsite prep cycle"},
      {c:"mock", text:"Insert an extra full-loop sim before any high-priority onsite"},
    ]},
  // ── Quant track (Weeks 8-13, days 50-91) appended after the Foundations
  //    weeks. Existing day numbers/task order are untouched, so saved progress
  //    is preserved (ids are d{day.d}t{index}).
  ...QUANT_PLAN,
];

// build stable task ids per plan. Task ids are `d{day.d}t{index}`; HRT day
// numbers (1–21) are independent of the main plan's and live under a separate
// storage key, so the id namespaces never actually collide in storage.
MAIN_PLAN.forEach(day => day.tasks.forEach((tk, idx) => { tk.id = `d${day.d}t${idx}`; }));
HRT_PLAN.forEach(day => day.tasks.forEach((tk, idx) => { tk.id = `d${day.d}t${idx}`; }));

// Week titles per track.
const MAIN_WEEK_TITLES = {
  1: "Foundations + Application Engine",
  2: "System Design Core + Wave 2",
  3: "Design Fluency + Coding Depth",
  4: "All 10 Designs + Pattern Coverage",
  5: "Mocks + Screens Converting",
  6: "Peak Sharpness + Tuning",
  7: "Full-Loop Sim + Offer Phase",
  8: "Quant: Probability & Expected Value",
  9: "Quant: Statistics & Stochastic Processes",
  10: "Quant: Python Coding Patterns",
  11: "Quant: Low-Latency & Performance (Python)",
  12: "Quant: Markets & Microstructure",
  13: "Quant: Mental Math, Mocks & Fit",
};

// Track registry: each track has its own plan, week titles, and storage.
const TRACKS = {
  main: { label: "Main", plan: MAIN_PLAN, weekTitles: MAIN_WEEK_TITLES },
  hrt: { label: "HRT (5-week)", plan: HRT_PLAN, weekTitles: HRT_WEEK_TITLES, info: HRT_INFO },
};

// A setState wrapper that also persists synchronously (React 19's hooks lint
// rejects the obvious save-in-useEffect, so persistence lives in the setters).
function usePersistedState(loader, saver) {
  const [value, setValue] = useState(loader);
  const update = useCallback((arg) => {
    setValue((prev) => {
      const next = typeof arg === "function" ? arg(prev) : arg;
      saver(next);
      return next;
    });
  }, [saver]);
  return [value, update, setValue];
}

export default function StudyTracker() {
  // Two separate, independently-persisted tracker checklists (separate storage
  // keys). The `track` selector chooses which one the Tracker view edits; Today
  // and Dashboard always reflect the MAIN plan.
  const [mainDone, setMainDone] = usePersistedState(loadTracker, saveTracker);
  const [hrtDone, setHrtDone] = usePersistedState(loadTrackerHrt, saveTrackerHrt);
  const [track, setTrack] = usePersistedState(loadTrack, saveTrack);
  const [bank, setBank] = usePersistedState(loadBank, saveBank);
  const [cards, setCards] = usePersistedState(loadCards, saveCards);
  const [settings, setSettings] = usePersistedState(loadSettings, saveSettings);
  const [flight, setFlight] = usePersistedState(loadFlight, saveFlight);
  const [trading, setTrading] = usePersistedState(loadTrading, saveTrading);
  const [openWeek, setOpenWeek] = useState(1);
  const [filter, setFilter] = useState("all");
  const [showInfo, setShowInfo] = useState(false);
  // "today" | "tracker" | "bank" | "cards" | "dashboard" | "flight" | "framework" | "roles"
  const [view, setView] = useState("today");

  const isHrt = track === "hrt";
  const activeTrack = TRACKS[isHrt ? "hrt" : "main"];
  const activePlan = activeTrack.plan;
  const activeWeekTitles = activeTrack.weekTitles;
  const done = isHrt ? hrtDone : mainDone;
  const setDone = isHrt ? setHrtDone : setMainDone;

  // Tracker-view toggle uses the active track; Today edits the MAIN plan only.
  const toggle = useCallback((id) => {
    setDone((p) => ({ ...p, [id]: !p[id] }));
  }, [setDone]);
  const toggleMain = useCallback((id) => {
    setMainDone((p) => ({ ...p, [id]: !p[id] }));
  }, [setMainDone]);

  const switchTrack = useCallback((t) => {
    setTrack(t);
    setFilter("all");
    setOpenWeek(1);
    setShowInfo(false);
  }, [setTrack]);

  const TOTAL_TASKS = useMemo(
    () => activePlan.reduce((s, d) => s + d.tasks.length, 0), [activePlan]);
  const completedCount = useMemo(
    () => activePlan.reduce((s, d) => s + d.tasks.filter(tk => done[tk.id]).length, 0),
    [activePlan, done]);
  const pct = TOTAL_TASKS ? Math.round((completedCount / TOTAL_TASKS) * 100) : 0;

  const weeks = useMemo(() => {
    const m = {};
    activePlan.forEach(d => { (m[d.w] = m[d.w] || []).push(d); });
    return m;
  }, [activePlan]);

  const weekStats = useCallback((wd) => {
    let tot = 0, dn = 0;
    wd.forEach(day => day.tasks.forEach(tk => { tot++; if (done[tk.id]) dn++; }));
    return { tot, dn, pct: tot ? Math.round((dn / tot) * 100) : 0 };
  }, [done]);

  const resetAll = useCallback(() => {
    if (typeof window !== "undefined" && window.confirm(
      `Reset the ${activeTrack.label} checklist? This clears only that track's checkboxes.`)) {
      setDone({});
      try { localStorage.removeItem(isHrt ? KEYS.trackerHrt : KEYS.tracker); } catch { /* ignored */ }
    }
  }, [setDone, isHrt, activeTrack.label]);

  // Publish: download a progress.json to commit to the repo (the static snapshot
  // that anyone who pulls master will replicate). No secrets are included.
  const publishSnapshot = useCallback(() => {
    const data = exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "progress.json"; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importSnapshot = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { importAll(JSON.parse(String(reader.result))); window.location.reload(); }
      catch (err) { window.alert("Import failed: " + err.message); }
    };
    reader.readAsText(file);
  }, []);

  const resetPublished = useCallback(() => {
    if (window.confirm("Discard local progress and reload the published snapshot from the repo?")) {
      resetToPublished(); window.location.reload();
    }
  }, []);

  const catCounts = useMemo(() => {
    const c = {};
    Object.keys(CATS).forEach(k => c[k] = { tot: 0, dn: 0 });
    activePlan.forEach(day => day.tasks.forEach(tk => {
      c[tk.c].tot++; if (done[tk.id]) c[tk.c].dn++;
    }));
    return c;
  }, [activePlan, done]);

  // Only show category chips for categories the active track actually uses.
  const presentCats = useMemo(() => {
    const s = new Set();
    activePlan.forEach(day => day.tasks.forEach(tk => s.add(tk.c)));
    return s;
  }, [activePlan]);

  const weekTitles = activeWeekTitles;

  if (view === "framework") {
    return <FrameworkGuide onBack={() => setView("tracker")} />;
  }
  if (view === "roles") {
    return <JobRoles onBack={() => setView("tracker")} />;
  }
  if (view !== "tracker") {
    return (
      <div style={pageStyle}>
        <GlobalNav view={view} setView={setView} />
        {view === "today" && (
          <Today done={mainDone} toggleTask={toggleMain} bank={bank} setBank={setBank}
            cards={cards} plan={MAIN_PLAN} setView={setView} />
        )}
        {view === "bank" && (
          <ProblemBank bank={bank} setBank={setBank} settings={settings}
            setSettings={setSettings} cards={cards} setCards={setCards} />
        )}
        {view === "cards" && <Flashcards cards={cards} setCards={setCards} />}
        {view === "dashboard" && (
          <Dashboard done={mainDone} bank={bank} cards={cards} plan={MAIN_PLAN} />
        )}
        {view === "dsa" && <DSA flight={flight} setFlight={setFlight} />}
        {view === "flight" && (
          <FlightMode flight={flight} setFlight={setFlight} />
        )}
        {view === "trading" && <TradingPrep trading={trading} setTrading={setTrading} />}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: C.pageBg,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif",
      color: C.text, padding: "0 0 80px 0",
    }}>
      <GlobalNav view={view} setView={setView} />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
        .day-card { animation: fadeUp .35s ease both; }
        .task:hover { background: ${C.soft}; }
        .wk-btn:hover { transform: translateX(3px); }
        .cb { transition: all .15s ease; }
        ::-webkit-scrollbar { width: 9px; }
        ::-webkit-scrollbar-track { background: ${C.pageBg}; }
        ::-webkit-scrollbar-thumb { background: ${C.scrollThumb}; border-radius: 5px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        background: C.panel,
        backdropFilter: "blur(6px)", padding: "34px 28px 26px",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase",
                color: C.muted, marginBottom: 8, fontFamily: "system-ui" }}>
                {isHrt
                  ? "HRT Track · Python · DP & Greedy · Probability"
                  : "Quant-Developer Track · Python · Probability · Low-Latency"}
              </div>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700,
                color: C.strong, lineHeight: 1.15 }}>
                {isHrt ? "HRT Interview Tracker" : "Quant Interview Tracker"}
              </h1>
            </div>
            <div style={{ textAlign: "right", fontFamily: "system-ui" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: C.blue,
                lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                {completedCount} / {TOTAL_TASKS} tasks
                <span style={{ color: "#5C7" }}> · saved</span>
              </div>
            </div>
          </div>

          {/* track selector */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center",
            flexWrap: "wrap", fontFamily: "system-ui" }}>
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Track:</span>
            {Object.entries(TRACKS).map(([k, t]) => (
              <button key={k} onClick={() => switchTrack(k)} style={{
                background: track === k ? C.blue : C.soft,
                color: track === k ? C.onAccent : C.muted,
                border: `1px solid ${track === k ? C.blue : C.border}`,
                borderRadius: 20, padding: "5px 14px", fontSize: 12.5, fontWeight: 700,
                cursor: "pointer", fontFamily: "system-ui" }}>{t.label}</button>
            ))}
            {isHrt && (
              <button onClick={() => setShowInfo(v => !v)} style={{
                marginLeft: "auto", background: C.chipBg, border: `1px solid ${C.amber}`,
                color: C.amber, borderRadius: 20, padding: "5px 14px", fontSize: 12,
                cursor: "pointer", fontFamily: "system-ui", fontWeight: 600 }}>
                {showInfo ? "Hide HRT brief" : "HRT interview brief"}
              </button>
            )}
          </div>

          {/* HRT info panel */}
          {isHrt && showInfo && activeTrack.info && <HrtInfoPanel info={activeTrack.info} />}

          {/* progress bar */}
          <div style={{ marginTop: 18, height: 8, background: C.subtle,
            borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%",
              background: C.blue,
              borderRadius: 6, transition: "width .4s ease" }} />
          </div>

          {/* category chips */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap",
            fontFamily: "system-ui" }}>
            <Chip active={filter==="all"} onClick={()=>setFilter("all")}
              color={C.muted} bg={C.chipBg} label={`All`} />
            {Object.entries(CATS).filter(([k]) => presentCats.has(k)).map(([k, v]) => (
              <Chip key={k} active={filter===k} onClick={()=>setFilter(filter===k?"all":k)}
                color={v.color} bg={v.bg}
                label={`${v.label} ${catCounts[k].dn}/${catCounts[k].tot}`} />
            ))}
            <button onClick={() => setView("roles")} style={{
              marginLeft: "auto", background: C.chipBg,
              border: `1px solid ${C.green}`, color: C.green,
              borderRadius: 20, padding: "5px 14px", fontSize: 12,
              cursor: "pointer", fontFamily: "system-ui",
              fontWeight: 600 }}>
              Target Roles →
            </button>
            <button onClick={() => setView("framework")} style={{
              background: C.chipBg,
              border: `1px solid ${C.blue}`, color: C.blue,
              borderRadius: 20, padding: "5px 14px", fontSize: 12,
              cursor: "pointer", fontFamily: "system-ui",
              fontWeight: 600 }}>
              7-Step Framework →
            </button>
            <button onClick={publishSnapshot} title="Download progress.json to commit to your repo" style={{
              background: C.chipBg, border: `1px solid ${C.green}`,
              color: C.green, borderRadius: 20, padding: "5px 14px", fontSize: 12,
              cursor: "pointer", fontFamily: "system-ui", fontWeight: 600 }}>
              Publish snapshot
            </button>
            <label title="Restore from a progress.json" style={{
              background: C.chipBg, border: `1px solid ${C.blue}`,
              color: C.blue, borderRadius: 20, padding: "5px 14px", fontSize: 12,
              cursor: "pointer", fontFamily: "system-ui", fontWeight: 600 }}>
              Import
              <input type="file" accept="application/json" onChange={importSnapshot}
                style={{ display: "none" }} />
            </label>
            <button onClick={resetPublished} title="Discard local changes, reload the committed snapshot" style={{
              background: "transparent", border: `1px solid ${C.border}`, color: C.muted,
              borderRadius: 20, padding: "5px 14px", fontSize: 12,
              cursor: "pointer", fontFamily: "system-ui" }}>
              ↺ From master
            </button>
            <button onClick={resetAll} style={{
              background: "transparent",
              border: `1px solid ${C.border}`, color: C.muted,
              borderRadius: 20, padding: "5px 14px", fontSize: 12,
              cursor: "pointer", fontFamily: "system-ui" }}>
              Reset plan
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 920, margin: "26px auto 0", padding: "0 22px" }}>
        {Object.keys(weeks).map(wk => {
          const wd = weeks[wk];
          const st = weekStats(wd);
          const isOpen = String(openWeek) === String(wk);
          return (
            <div key={wk} style={{ marginBottom: 16 }}>
              <button className="wk-btn" onClick={() =>
                setOpenWeek(isOpen ? null : wk)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: isOpen
                    ? C.chipBg
                    : C.panel,
                  border: "1px solid " + (isOpen ? C.blue : C.border),
                  borderRadius: 14, padding: "18px 22px", color: C.text,
                  transition: "all .2s ease", display: "flex",
                  alignItems: "center", gap: 18,
                }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: C.blue,
                  fontFamily: "system-ui", minWidth: 58,
                  letterSpacing: 1 }}>WK {wk}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {weekTitles[wk]}</div>
                  <div style={{ fontSize: 12.5, color: C.muted,
                    marginTop: 3, fontFamily: "system-ui" }}>
                    Days {wd[0].d}–{wd[wd.length-1].d} · {st.dn}/{st.tot} tasks
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 80, height: 6, background: C.subtle,
                    borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${st.pct}%`, height: "100%",
                      background: st.pct===100 ? C.green : C.blue }} />
                  </div>
                  <div style={{ fontSize: 13, fontFamily: "system-ui",
                    color: st.pct===100 ? C.green : C.muted,
                    minWidth: 34, textAlign: "right" }}>{st.pct}%</div>
                  <div style={{ fontSize: 18, color: C.blue,
                    transform: isOpen ? "rotate(90deg)" : "none",
                    transition: "transform .2s" }}>›</div>
                </div>
              </button>

              {isOpen && (
                <div style={{ marginTop: 10, display: "flex",
                  flexDirection: "column", gap: 10 }}>
                  {wd.map(day => {
                    const vis = day.tasks.filter(tk =>
                      filter === "all" || tk.c === filter);
                    if (!vis.length) return null;
                    const dDn = day.tasks.filter(tk => done[tk.id]).length;
                    const allDone = dDn === day.tasks.length;
                    return (
                      <div key={day.d} className="day-card" style={{
                        background: C.panel,
                        border: "1px solid " + (allDone ? C.green : C.border),
                        borderRadius: 13, padding: "16px 18px",
                      }}>
                        <div style={{ display: "flex", alignItems: "baseline",
                          gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, fontWeight: 800,
                            fontFamily: "system-ui", color: C.faint,
                            letterSpacing: 1 }}>DAY {day.d}</span>
                          <span style={{ fontSize: 17, fontWeight: 700,
                            color: C.strong }}>{day.title}</span>
                          {allDone && <span style={{ fontSize: 11,
                            color: C.green, fontFamily: "system-ui",
                            border: `1px solid ${C.green}`, borderRadius: 10,
                            padding: "2px 9px" }}>complete</span>}
                          <span style={{ marginLeft: "auto", fontSize: 12,
                            color: C.muted, fontFamily: "system-ui" }}>
                            {dDn}/{day.tasks.length}</span>
                        </div>
                        <div style={{ fontSize: 13.5, color: C.muted,
                          fontStyle: "italic", marginBottom: 12,
                          lineHeight: 1.5 }}>{day.focus}</div>

                        <div style={{ display: "flex",
                          flexDirection: "column", gap: 3 }}>
                          {vis.map(tk => {
                            const isD = !!done[tk.id];
                            const cat = CATS[tk.c];
                            return (
                              <div key={tk.id} className="task"
                                onClick={() => toggle(tk.id)}
                                style={{ display: "flex", gap: 12,
                                  alignItems: "flex-start", cursor: "pointer",
                                  padding: "9px 8px", borderRadius: 8 }}>
                                <div className="cb" style={{
                                  width: 19, height: 19, borderRadius: 5,
                                  marginTop: 1, flexShrink: 0,
                                  border: "2px solid " + (isD ? cat.color : "#aeb6bf"),
                                  background: isD ? cat.color : "transparent",
                                  display: "flex", alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 12, color: "#fff", fontWeight: 700 }}>
                                  {isD ? "✓" : ""}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: 14.5,
                                    lineHeight: 1.55,
                                    color: isD ? C.faint : C.text,
                                    textDecoration: isD ? "line-through" : "none" }}>
                                    {renderTaskSegments(tk.text).map((seg, si) =>
                                      seg.url ? (
                                        <a key={si} href={seg.url}
                                          target="_blank" rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          style={{
                                            color: isD ? C.faint : C.blue,
                                            textDecoration: "underline",
                                            textDecorationColor: isD ? C.faint : C.blue,
                                            textDecorationThickness: 1,
                                            textUnderlineOffset: 2,
                                          }}>
                                          {seg.text}
                                        </a>
                                      ) : (
                                        <React.Fragment key={si}>{seg.text}</React.Fragment>
                                      )
                                    )}
                                  </span>
                                  <span style={{ display: "inline-block",
                                    marginLeft: 9, fontSize: 10.5,
                                    fontFamily: "system-ui", verticalAlign: "middle",
                                    color: cat.color,
                                    background: C.soft,
                                    border: `1px solid ${cat.color}55`,
                                    borderRadius: 9, padding: "1px 8px" }}>
                                    {cat.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ marginTop: 28, padding: "20px 24px",
            background: C.panel,
            border: `1px solid ${C.border}`, borderRadius: 14,
            fontSize: 14, lineHeight: 1.65, color: C.muted }}>
            <strong style={{ color: C.blue }}>How to use this:</strong>{" "}
            One day at a time, in order — the sequence is deliberate
            (later system designs assume concepts earlier ones teach).
            Tap any task to check it off; progress saves automatically and
            persists when you reopen this. The "buffer" day each week is
            intentional slack — if you fall behind, use it to catch up rather
            than skipping the deliberate ordering. Days are sized for
            ~1.5–2.5 hrs; the heavier ones land on weekends by design.
            Filter by category using the chips up top to focus a session.
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, color, label }) {
  return (
    <button onClick={onClick} style={{
      background: active ? color : C.soft,
      color: active ? C.onAccent : color,
      border: `1px solid ${active ? color : color + "55"}`,
      borderRadius: 20, padding: "6px 14px", fontSize: 12.5,
      fontWeight: 600, cursor: "pointer", fontFamily: "system-ui",
      transition: "all .15s ease", whiteSpace: "nowrap",
    }}>{label}</button>
  );
}

// Collapsible reference panel shown on the HRT track (process, what's graded,
// frameworks, resource, top priorities — distilled from the prep brief + public
// interview reports).
function HrtInfoPanel({ info }) {
  const sys = "system-ui";
  const head = (t) => (
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6,
      textTransform: "uppercase", color: C.faint, fontFamily: sys, margin: "14px 0 6px" }}>{t}</div>
  );
  return (
    <div style={{ marginTop: 14, background: C.panel, border: `1px solid ${C.amber}55`,
      borderRadius: 12, padding: "16px 18px", fontFamily: sys }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.amber }}>HRT interview brief</div>

      {head("Process")}
      <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>{info.process}</div>

      {head("What's graded")}
      <ul style={{ margin: "2px 0 0", paddingLeft: 18, color: C.muted, fontSize: 13.5, lineHeight: 1.55 }}>
        {info.graded.map((g, i) => <li key={i}>{g}</li>)}
      </ul>

      {head("Frameworks")}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {info.frameworks.map((f, i) => (
          <div key={i} style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55 }}>
            <b style={{ color: C.text }}>{f.k}:</b> {f.v}
          </div>
        ))}
      </div>

      {head("Top 3 priorities")}
      <ol style={{ margin: "2px 0 0", paddingLeft: 18, color: C.muted, fontSize: 13.5, lineHeight: 1.55 }}>
        {info.top3.map((t, i) => <li key={i}>{t}</li>)}
      </ol>

      {head("Resource")}
      <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>{info.resource}</div>

      <div style={{ fontSize: 11, color: C.faint, marginTop: 12 }}>
        Sources: {info.sources.join("; ")} · reconstructed from public reports, not verbatim.
      </div>
    </div>
  );
}
