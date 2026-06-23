import { useState } from "react";

// ---------------------------------------------------------------------------
//  THE 7-STEP QUANT / LOW-LATENCY SYSTEM DESIGN FRAMEWORK
//  Tuned for hedge-fund / trading-systems interviews — in-memory limit order
//  book / matching engine as the running example. Python-first.
//  Each step: What it is → Why it exists → What you do → Running example →
//  What this sounds like out loud → Pitfalls.
// ---------------------------------------------------------------------------

const ACCENT = "#6FA8FF";

const AT_A_GLANCE = [
  { n: 1, step: "Requirements",      one: "Decide what you're building and at what scale, before designing anything", time: "~5 min" },
  { n: 2, step: "Estimates",         one: "Put numbers on message rate, latency budget, and memory so choices are justified", time: "~5 min" },
  { n: 3, step: "API design",        one: "Define the contract — order/cancel/market-data ops; this anchors the data model", time: "~5 min" },
  { n: 4, step: "Data model",        one: "Entities, in-memory structures, and storage — chosen for the hot-path access pattern", time: "~7 min" },
  { n: 5, step: "High-level design", one: "The boxes-and-arrows diagram; walk the order/tick path end to end",          time: "~8 min" },
  { n: 6, step: "Deep dive",         one: "Go deep on 1–2 components; find the latency bottleneck and the correctness risk", time: "~10 min" },
  { n: 7, step: "Tradeoffs / wrap",  one: "State tradeoffs, failure modes, monitoring; what you'd do with more time",  time: "~5 min" },
];

const STEPS = [
  // ============================ STEP 1 ============================
  {
    n: 1,
    name: "Requirements",
    time: "~5 min",
    whatItIs:
      "Pinning down exactly what system you're being asked to build, and at what scale, before you design a single component. It is a conversation, not a monologue — you ask, the interviewer answers, you write it down.",
    whyItExists:
      "\"Design a matching engine\" is deliberately under-specified. Is it equities or futures? Price-time priority or pro-rata? Single instrument or many? Do they care about the wire protocol, or just the in-memory book? If you start designing without scoping, you'll either build the wrong thing or try to build everything and run out of time. Interviewers at trading firms are explicitly evaluating whether you nail down correctness and latency requirements before acting — getting the matching semantics or the determinism guarantee wrong is a fatal flaw, and they want to see you surface those constraints yourself. Skipping this step doesn't just lose time; it loses a signal they are actively scoring.",
    whatYouDo: [
      { lead: "Separate functional from non-functional.", body: "Functional = what it does (accept a limit order, cancel an order, match crossing orders, publish fills). Non-functional = the qualities (throughput, tail latency, determinism, correctness, recoverability)." },
      { lead: "Explicitly scope IN and OUT.", body: "Say out loud what you will and won't cover. \"I'll focus on the in-memory limit order book for one instrument with price-time priority; I'll treat the FIX gateway, clearing, and multi-instrument sharding as out of scope unless you'd like me to cover them.\" This shows judgment and protects your time." },
      { lead: "Ask the four questions that change the design:", body: "(a) throughput — peak messages/sec (orders + cancels + market data)? (b) latency target — tick-to-trade budget, and is it p50 or p99/p99.9 that matters? (c) order types and matching policy — limit/market/IOC/FOK, price-time vs pro-rata? (d) determinism & recovery — must replaying the same input stream reproduce identical fills, and what's the RTO after a crash?" },
      { lead: "Write the answers down", body: "(on the whiteboard / shared doc). You will refer back to them in every later step to justify decisions." },
    ],
    example: {
      title: "Design an in-memory limit order book / matching engine",
      body: [
        { type: "kv", label: "Functional (in scope)", text: "accept a new limit order (side, price, qty); cancel/amend a resting order by id; match incoming orders against the book under price-time priority; emit fills (executions) and book updates." },
        { type: "kv", label: "Out of scope (stated explicitly)", text: "the FIX/binary order-entry gateway, risk pre-trade checks, clearing/settlement, and multi-symbol sharding — \"happy to come back to these if time allows.\"" },
        { type: "kv", label: "Non-functional", text: "single hot instrument, ~100K–1M order messages/sec at peak; tick-to-trade target on the order of single-digit microseconds at p99 (the engine must be deterministic — replaying the same ordered input must produce byte-identical fills, since that's how we reconcile and audit); strong correctness over availability — a wrong fill is far worse than a brief outage; must recover and rebuild book state from a durable event log. State that the production hot path would be C++/Rust, but I'll design and prototype the logic in Python." },
      ],
    },
    script: [
      "Before I design anything, let me clarify scope. When you say 'design a matching engine,' I'm going to assume the core is: the in-memory limit order book for a single instrument with price-time priority — accept orders, cancel orders, match, and publish fills. I'll treat the order-entry gateway, pre-trade risk, and multi-symbol sharding as out of scope unless you want them. A few questions: what throughput are we targeting — hundreds of thousands of messages a second? What's the latency budget, and is it p50 or the tail, p99/p99.9, that you grade on? Price-time priority or pro-rata, and which order types — IOC, FOK? And on determinism: do we need the engine to reproduce identical fills when we replay the same input stream, for audit and recovery?",
      "Great — so to summarize what I'm building: [restate the scoped requirements]. I'll keep these on the board and refer back as I make decisions. One framing note: I'll design and prototype in Python, and call out where production would drop to C++/Rust on the hot path.",
    ],
    pitfalls: [
      { lead: "Designing during this step.", body: "Resist. No data structures, no boxes yet. Just scope." },
      { lead: "Not pinning the matching policy.", body: "Price-time vs pro-rata changes the whole book structure; assuming silently reads as inexperience with exchanges." },
      { lead: "Ignoring determinism.", body: "Not asking whether replay must reproduce identical fills misses the constraint that dominates trading-system design." },
    ],
  },

  // ============================ STEP 2 ============================
  {
    n: 2,
    name: "Estimates",
    time: "~5 min",
    whatItIs:
      "Quick \"back-of-the-envelope\" math to attach numbers to the scale you just clarified: message rate (messages/sec), the per-message latency budget, and memory footprint of the live book. Precision is irrelevant — order of magnitude (and the latency budget breakdown) is everything.",
    whyItExists:
      "Every later decision — can this run single-threaded, do I need lock-free structures, can the book fit in L3 cache, must I avoid the GC on the hot path — is only defensible relative to a number. Without estimates, \"I'll make it fast\" is a buzzword; with them, \"at a 2 µs p99 budget and 500K msg/sec, a single message gets ~2 µs and ~150 ns of GC pause is unacceptable, so the hot path must be allocation-free\" is engineering. Estimates convert opinions into justified decisions. Quant interviewers specifically listen for whether your architecture is driven by the latency budget or decorated with it afterward.",
    whatYouDo: [
      { lead: "Start from the rate figure", body: "you established in step 1 (e.g. peak ~500K order messages/sec on the hot instrument)." },
      { lead: "Turn the latency target into a per-message budget:", body: "if the tick-to-trade p99 budget is a few microseconds, divide it across parse → risk → match → publish so each stage has a number to hit." },
      { lead: "Estimate memory of the live book:", body: "resting orders × bytes per order + price-level index → does it fit in cache / a single node's RAM? Round hard." },
      { lead: "Estimate the durable event log:", body: "messages/day × bytes per event → log volume/day for replay and audit (this drives recovery, not the hot path)." },
      { lead: "Say the numbers out loud and write them down.", body: "Then immediately state the implication — that's the whole point of doing it." },
    ],
    example: {
      title: "Design an in-memory limit order book / matching engine",
      body: [
        { type: "kv", label: "Message rate", text: "~500K messages/sec at peak on the hot instrument (orders + cancels + amends), bursting higher around the open/close. That's a new message roughly every 2 µs — so the engine must process one message in single-digit microseconds just to keep up." },
        { type: "kv", label: "Latency budget", text: "tick-to-trade p99 target ~5 µs, split: ~1 µs parse/decode, ~1 µs pre-trade risk, ~2 µs match against the book, ~1 µs publish fill. The p99/p99.9 tail dominates — a single GC pause or page fault blows the budget. This is the number that drives the design." },
        { type: "kv", label: "Memory", text: "say ~1M resting orders × ~64 bytes ≈ 64 MB, plus a price-level index — comfortably fits in RAM and largely in cache, so the entire live book stays in-process; no database is on the hot path." },
        { type: "kv", label: "The implications you state immediately", text: "(1) the per-message budget is microseconds → the match path must be single-threaded, branch-predictable, and allocation-free (in Python: no per-message object churn; in production C++/Rust); (2) the book fits in memory → state lives in-process, persistence is an append-only event log off the hot path; (3) the tail latency, not the average, is the single most important fact and it will drive the deep dive in step 6." },
      ],
    },
    script: [
      "Let me put numbers on this. At ~500K messages a second peak, a new message arrives every ~2 microseconds, so the engine has to process one in single-digit microseconds just to keep up. The latency target is what really drives the design: if tick-to-trade p99 is around 5 microseconds, I can split it roughly one microsecond for decode, one for risk, two for the actual match, one to publish — and the tail matters far more than the average, because a single GC pause or page fault blows the whole budget. The live book is small — a million resting orders is tens of megabytes — so it lives entirely in process and largely in cache; there's no database on the hot path, just an append-only event log off to the side for replay and audit. So the takeaways: single-threaded allocation-free match path, in-memory state, and tail latency is the thing I'll deep-dive.",
    ],
    pitfalls: [
      { lead: "False precision.", body: "Nobody wants 487,213 msg/sec. 'Half a million per second' is the right resolution. Round aggressively." },
      { lead: "Optimizing the average, ignoring the tail.", body: "In trading, p99.9 latency is what's graded. Quoting only p50 misses the point of the system." },
      { lead: "Numbers with no conclusion.", body: "Computing a budget and not saying what it implies wastes the step. Always end with '…therefore'." },
    ],
  },

  // ============================ STEP 3 ============================
  {
    n: 3,
    name: "API Design",
    time: "~5 min",
    whatItIs:
      "Defining the small set of operations the system exposes — the method names, their inputs, and their outputs. Think of it as the contract between the client and your system.",
    whyItExists:
      "The API is the bridge between \"what it does\" (step 1) and \"how data is shaped\" (step 4). Defining it forces precision: to write submit(order) you must decide what's in an order — a client-assigned id, side, price, qty, time-in-force — which forces you to think about how the book is structured and how cancels find their order. Candidates who skip this tend to produce vague data models and hand-wave the match path. The order-entry API is also where you naturally surface idempotency, sequencing, and the inbound/outbound split — all things trading-systems interviewers like to see raised unprompted.",
    whatYouDo: [
      { lead: "List only the core operations", body: "that map to your in-scope functional requirements — usually 3 to 5. Inbound: submit, cancel, amend. Outbound: the market-data / execution stream. Don't design a hundred messages." },
      { lead: "Specify inputs and outputs at a signature level.", body: "You do not need a full binary wire spec; the shape and key fields are enough. Show it as Python — a typed dataclass and method signatures." },
      { lead: "Decide the transport briefly.", body: "Internally it's a single ordered command stream into the engine (in-process queue / ring buffer); externally, low-latency order entry is a binary protocol over kernel-bypass (e.g. a FIX-like or proprietary binary format) — mention it, don't dwell." },
      { lead: "Flag the cross-cutting concerns:", body: "every command carries a monotonic sequence number so the engine is deterministic on replay; a client order id makes submits idempotent (a retried submit must not create a duplicate order); cancels/amends reference the resting order by id. One sentence each." },
    ],
    example: {
      title: "Design an in-memory limit order book / matching engine",
      body: [
        { type: "code", text: "from dataclasses import dataclass\n\n@dataclass(frozen=True, slots=True)\nclass NewOrder:\n    seq: int          # monotonic, assigned by the sequencer\n    client_oid: str   # idempotency key\n    side: str         # 'B' | 'S'\n    price: int        # integer ticks — never float\n    qty: int\n    tif: str          # 'GTC' | 'IOC' | 'FOK'\n\nengine.submit(order: NewOrder)   -> list[Fill]\nengine.cancel(seq: int, oid: str) -> CancelAck | Reject\nengine.amend(seq: int, oid: str, new_qty: int) -> AmendAck | Reject\n# outbound: stream of Fill / BookUpdate events to subscribers" },
        { type: "kv", label: "Notes you say aloud", text: "prices are integer ticks, never floats — float comparison would make matching non-deterministic and is an instant red flag; every command carries a monotonic seq so replaying the stream reproduces identical fills; client_oid makes submit idempotent so a gateway retry can't double-insert; submit returns the fills it generated synchronously and the same events are also published on the outbound stream." },
      ],
    },
    script: [
      "The core API is small and one-directional into the engine. submit takes an order — and I'll be explicit that price is an integer number of ticks, never a float, because float comparison would make matching non-deterministic, which is fatal here. cancel and amend reference a resting order by its client order id. Every command carries a monotonic sequence number assigned upstream by a sequencer, which is what lets me replay the stream and get byte-identical fills for audit and recovery. The client order id also makes submit idempotent, so if the gateway retries I don't double-insert. submit returns the fills it produced, and the same fill and book-update events go out on the outbound market-data stream. I'd write all of this in Python as a frozen dataclass with slots.",
    ],
    pitfalls: [
      { lead: "Floating-point prices.", body: "Using float for price/qty breaks determinism and exact matching — interviewers treat it as a red flag. Use integer ticks." },
      { lead: "No sequence number.", body: "Without a monotonic seq on every command you can't guarantee deterministic replay — the property the whole system depends on." },
      { lead: "Designing 20 message types.", body: "Stay to submit/cancel/amend plus the outbound stream; breadth here is wasted time." },
    ],
  },

  // ============================ STEP 4 ============================
  {
    n: 4,
    name: "Data Model",
    time: "~7 min",
    whatItIs:
      "The entities the system holds — chiefly the in-memory data structures of the live book — plus where any durable state lives (the event log, the end-of-day tick store), with each structure choice justified by the hot-path access pattern, never by fashion.",
    whyItExists:
      "This is where many otherwise-good candidates lose a trading-systems round, by saying \"I'll keep orders in a dict\" or \"I'll use a sorted list\" without reasoning about the operations the matcher performs millions of times a second. The data model is graded on whether your structure choice follows from the match-path access pattern: best-bid/best-ask in O(1), price-level updates and cancels-by-id fast, FIFO within a price level for time priority. The interviewer wants \"the access pattern is X, therefore this structure, with this complexity.\" It also sets up step 6 — the latency bottleneck is almost always here.",
    whatYouDo: [
      { lead: "List the core entities", body: "and their key fields: Order (id, side, price, qty, ts); PriceLevel (a FIFO queue of resting orders at one price); Book (the two sides, bids and asks)." },
      { lead: "State the hot-path access patterns first,", body: "then choose structures to fit them. \"On every message I read best bid/ask, walk price levels from the top while crossing, append at the back of a level for time priority, and cancel a specific resting order by id\" drives the choice — not the other way around." },
      { lead: "Pick in-memory structures with a stated reason.", body: "Each side as a price-indexed structure giving O(1) top-of-book and ordered traversal (e.g. an array/bucket of price levels for a dense tick grid, or a balanced tree / skiplist if prices are sparse); each price level a FIFO (deque) for time priority; a hash map order_id → (price level, node) so cancel is O(1). Name the actual tradeoff (array = fastest but assumes bounded price range; tree = general but pointer-chasing hurts cache)." },
      { lead: "Specify where durable state lives — off the hot path.", body: "An append-only event log (the sequenced command stream) for replay/recovery; a columnar tick store / time-series DB for end-of-day analytics and backtests. \"Persistence never sits on the match path.\"" },
    ],
    example: {
      title: "Design an in-memory limit order book / matching engine",
      body: [
        { type: "kv", label: "Entities", text: "Order (id, side, price_ticks, qty, ts); PriceLevel (FIFO deque of resting Orders + total volume); Book (bids and asks, each price-indexed; plus order_id → location map)." },
        { type: "kv", label: "Hot-path access patterns", text: "(1) read best bid / best ask — O(1); (2) on an incoming order, walk levels from the top while it crosses and match FIFO within each level; (3) insert a resting order at the back of its price level (time priority); (4) cancel/amend by order id — O(1) lookup; (5) all off-hot-path: append every command to the event log; periodically flush trades/ticks to the tick store." },
        { type: "kv", label: "Structure choice with reasoning", text: "for a liquid instrument with a bounded, dense tick range I'd use a flat array of price levels indexed by tick offset → O(1) top-of-book and cache-friendly sequential scans while sweeping the book, plus a deque per level for FIFO time priority, plus a dict order_id → (level, node) for O(1) cancel. \"I'm choosing the array specifically because the dominant access is 'sweep from the top tick downward and pop FIFO,' which an array does with great cache locality — not a tree, whose pointer-chasing would blow the latency tail. If prices were sparse/unbounded I'd switch to a sorted map.\" In Python I'd prototype with dict-of-deques and note the array layout is what you'd do in C++/Rust for cache behavior." },
      ],
    },
    script: [
      "Three entities: the Order, a PriceLevel which is a FIFO queue of orders at one price, and the Book which is the two sides plus a map from order id to where each order rests. Before I pick structures I'll state the hot-path access patterns: read top of book in O(1), sweep price levels from the top while an incoming order crosses, match FIFO within each level for time priority, insert resting orders at the back, and cancel by id in O(1). Given that dominant pattern of 'sweep from the best price downward,' for a liquid instrument with a dense tick grid I'd index each side as a flat array of price levels — O(1) top of book and cache-friendly sequential scans — with a deque per level for time priority and a dict from order id to its node for O(1) cancels. I'm choosing the array for cache locality on the sweep, not a tree whose pointer-chasing hurts the latency tail; if prices were sparse I'd use a sorted map instead. The event log and the tick store are durable but deliberately off the match path. I'd prototype this in Python as dict-of-deques.",
    ],
    pitfalls: [
      { lead: "'A sorted list of orders.'", body: "Re-sorting on every insert is O(n log n) per message — fatal. Always tie the structure to the per-message operations." },
      { lead: "No O(1) cancel.", body: "Forgetting the order_id → location map means cancels scan the book; cancels are a huge fraction of traffic." },
      { lead: "Putting a database on the hot path.", body: "Any disk/network I/O per message destroys the latency budget; persistence is async, off to the side." },
    ],
  },

  // ============================ STEP 5 ============================
  {
    n: 5,
    name: "High-Level Design",
    time: "~8 min",
    whatItIs:
      "The boxes-and-arrows diagram: gateway → sequencer → matching engine → publisher → (downstream consumers), plus the durable log and the path a message takes through them. The first time you actually draw the system.",
    whyItExists:
      "This is the shared picture you and the interviewer reason about for the rest of the session. Its purpose is coverage and a walkthrough, not depth yet — show that the end-to-end order/tick path exists and is coherent. Candidates who jump here first (skipping 1–4) draw a plausible diagram they can't justify; candidates who arrive here having done 1–4 can defend every box. The diagram earns its credibility from the prior steps.",
    whatYouDo: [
      { lead: "Draw the standard trading spine:", body: "order-entry gateway → sequencer (assigns the monotonic seq and writes the durable event log) → single-threaded matching engine (the in-memory book) → market-data publisher → downstream consumers (risk/PnL, OMS, market-data feed)." },
      { lead: "Separate the order-entry (inbound) path from the market-data (outbound) path.", body: "Inbound is the latency-critical match path; outbound fans out fills and book updates. You'll deep-dive the match path in step 6 — set that up here." },
      { lead: "Walk one order end to end, out loud.", body: "\"A new order hits the gateway, the sequencer stamps a seq and appends to the log, the engine matches it against the book, and the publisher emits fills…\" Narrating the path is the deliverable, not the boxes themselves." },
      { lead: "Make the engine single-threaded and explain why.", body: "One ordered input stream into a single-writer engine is what gives determinism and removes locking from the hot path — say so explicitly; you scale by sharding instruments across engines, not by threading one book." },
    ],
    example: {
      title: "Design an in-memory limit order book / matching engine",
      body: [
        { type: "kv", label: "Components", text: "Gateway (decode/validate) → Sequencer (monotonic seq + append-only event log) → Matching Engine (single-threaded, in-memory book) → Publisher (fills + book updates) → consumers: real-time PnL/risk service, OMS / smart order router, and the market-data feed; the event log feeds the tick store for backtests offline." },
        { type: "kv", label: "Order-entry (inbound) path", text: "client order → gateway decodes & validates → sequencer assigns seq and durably appends → engine matches against the in-memory book, mutating it and generating fills (the latency-critical path — deep-dived next)." },
        { type: "kv", label: "Market-data (outbound) path", text: "engine emits fill + book-update events → publisher broadcasts to consumers (PnL/risk, OMS, feed); consumers are downstream and never block the matcher." },
      ],
    },
    script: [
      "Here's the high-level shape. Orders hit a gateway that decodes and validates, then a sequencer that stamps a monotonic sequence number and appends the command to a durable event log — that log is what makes the whole thing replayable and recoverable. The sequenced stream feeds a single-threaded matching engine holding the in-memory book; I'm deliberately keeping it single-writer because one ordered input into one engine gives me determinism and zero locking on the hot path — I scale by sharding instruments across engines, not by threading one book. The engine emits fills and book updates to a publisher, which fans out to the PnL/risk service, the OMS or smart order router, and the market-data feed. Let me trace one order end to end: [walk inbound, then outbound]. The downstream consumers never block the matcher.",
    ],
    pitfalls: [
      { lead: "Drawing this first.", body: "Without steps 1–4 you can't defend the boxes; interviewers probe and it collapses." },
      { lead: "Multi-threading the single book.", body: "Locking one book across threads kills determinism and adds tail latency; the senior answer is single-writer + shard by instrument." },
      { lead: "Going deep here.", body: "Depth is step 6. Here you want a complete, coherent skeleton — breadth over depth." },
    ],
  },

  // ============================ STEP 6 ============================
  {
    n: 6,
    name: "Deep Dive",
    nameSuffix: " — where you earn the hire",
    time: "~10 min",
    whatItIs:
      "Picking one or two components — usually the latency bottleneck or the correctness risk — and going genuinely deep: the hard tradeoff, the failure mode, the recovery mechanism. This is the longest step and the one that most determines the outcome.",
    whyItExists:
      "Steps 1–5 prove competence; step 6 separates a hire from a no-hire. A surface-level design that never goes deep reads as junior. The interviewer is now probing: \"what's your tail latency, what breaks first, and how do you recover deterministically.\" In trading-systems rounds the decisive signal is not the initial design but how you handle this deep dive and its follow-ups about the latency tail and correctness. This is the step to spend your strongest minutes on.",
    whatYouDo: [
      { lead: "Name the bottleneck explicitly", body: "and why it's the bottleneck (point back at your latency budget from step 2). Usually it's the match path's tail latency and the determinism/recovery guarantee." },
      { lead: "Present the real tradeoff", body: "with at least two options, their costs, and a defended choice — not one magic answer." },
      { lead: "Bring in the mechanisms:", body: "single-writer threading, allocation-free hot path, the durable event log, snapshots, busy-spin vs blocking — and say precisely where and why each applies." },
      { lead: "Address failure:", body: "what happens when the engine crashes mid-stream, how you rebuild the exact book, where a fill could be lost or duplicated, and how a primary/replica failover stays deterministic." },
    ],
    example: {
      title: "Design the matching engine — determinism, tail latency, and recovery (the classic deep dive)",
      body: [
        { type: "kv", label: "The bottleneck", text: "from step 2, the per-message budget is single-digit microseconds and the p99.9 tail is what's graded. The matcher is single-threaded by design, so the question isn't throughput — it's keeping the tail flat (no GC pauses, no allocations, no page faults) while guaranteeing the engine can be reproduced exactly after a crash." },
        { type: "kv", label: "Option A — rebuild state from the event log on recovery", text: "persist only the sequenced command log; on restart, replay every command from seq 0 to rebuild the book. Pro: dead simple, perfectly deterministic, single source of truth. Con: replaying a full trading day can take minutes — too slow if RTO is seconds." },
        { type: "kv", label: "Option B — periodic snapshots + tail replay", text: "checkpoint the full book state every N seconds (off the hot path, e.g. a background thread copying an immutable snapshot); on restart, load the latest snapshot and replay only the commands after it. Pro: fast recovery (RTO in seconds). Con: snapshotting must not pause the matcher and must capture a consistent seq boundary." },
        { type: "kv", label: "The defended answer — log + snapshots, single-writer, allocation-free", text: "keep the durable sequenced log as the source of truth and add periodic consistent snapshots taken at a known seq so recovery = load snapshot + replay the short tail. Hot path stays single-threaded and allocation-free: pre-allocated order pools and ring buffers so there's no GC churn (in Python, reuse __slots__ objects and avoid per-message allocation; note the real hot path is C++/Rust where you'd pin threads, busy-spin on the input ring, and use kernel-bypass NICs). \"This trades a bit of snapshot machinery for a fast, deterministic recovery without ever touching the latency tail of the live matcher.\"" },
        { type: "kv", label: "Failure & determinism", text: "for HA, run a hot replica fed the identical sequenced stream — because matching is deterministic, the replica's book is byte-identical, so failover is just promoting it; no state transfer needed. A fill is never lost because it's derived from a durably-logged command; on replay the same command yields the same fill, and the client_oid/seq make re-emitted fills idempotent for downstream consumers." },
      ],
    },
    script: [
      "The bottleneck isn't throughput — the matcher is single-threaded on purpose. It's the latency tail and the recovery guarantee. From my budget, p99.9 is what's graded, so the enemy is anything that causes a pause: GC, allocation, page faults. So the hot path is allocation-free — pre-allocated order pools and ring buffers, no per-message object churn; in Python I'd reuse slotted objects, and I'd note that in production this path is C++ or Rust with pinned threads busy-spinning on the input ring. On recovery there's a real tradeoff. Option one: persist only the sequenced command log and replay from zero — perfectly deterministic but replaying a whole day takes minutes. Option two: add periodic snapshots of the book at a known sequence number, taken off the hot path, so recovery is load-the-snapshot plus replay the short tail — seconds instead of minutes. I'd take the second, keeping the log as the source of truth. And for HA I'd run a hot replica fed the identical sequenced stream: because matching is deterministic, its book is byte-identical, so failover is just promoting the replica — no state transfer. No fill is ever lost because every fill derives from a durably-logged command, and seq plus client order id make re-emitted fills idempotent downstream.",
    ],
    pitfalls: [
      { lead: "Staying shallow.", body: "'I'd make it fast' with no mechanism is a no-hire. Go to the tail-latency tradeoff and the recovery model." },
      { lead: "Ignoring determinism on failover.", body: "Proposing state transfer instead of replaying the same stream into a replica misses the whole point of a deterministic engine." },
      { lead: "Snapshotting on the hot path.", body: "A checkpoint that pauses the matcher blows the latency budget; it must be off the hot path at a known seq boundary." },
    ],
    callout: {
      title: "This is your highest-leverage practice target",
      body: "In your study plan, the five follow-up drills — \"what's the p99.9 and what blows it,\" \"why this data structure,\" \"engine crash recovery,\" \"determinism / correctness risk,\" \"monitoring\" — all live in this step. When you practice, spend the majority of each design's effort here, because this is the step the interview outcome actually turns on.",
    },
  },

  // ============================ STEP 7 ============================
  {
    n: 7,
    name: "Tradeoffs & Wrap-Up",
    time: "~5 min",
    whatItIs:
      "A deliberate closing: state the tradeoffs you made, the failure modes, how you'd monitor the system in production, and what you'd do with more time. A short, structured landing — not trailing off.",
    whyItExists:
      "Junior answers end with \"…and that's the design.\" Strong answers end by acknowledging that every decision had a cost. This step signals engineering maturity: you know nothing is free, you've thought about operating and observing a latency-sensitive system, not just building it. Mentioning latency monitoring and a kill-switch unprompted is a specific strong signal of real trading-systems experience — make sure it lands.",
    whatYouDo: [
      { lead: "Restate 2–3 key tradeoffs in one line each:", body: "\"I chose a single-threaded engine for determinism and a flat latency tail — the cost is that one book is capped at one core's throughput, which I handle by sharding instruments across engines.\"" },
      { lead: "Name the main failure modes", body: "and how the system degrades safely: engine crash → recover from snapshot + log replay; sequencer failover → promote the deterministic hot replica; downstream consumer lag → it buffers, never blocks the matcher." },
      { lead: "Add observability explicitly:", body: "the metrics you'd watch (tick-to-trade p99/p99.9, GC pause count, input-queue depth, gap/sequence errors, fill-reconciliation mismatches) and what you'd alert on — plus a risk kill-switch. Say this even if not asked." },
      { lead: "End with \"with more time I'd…\"", body: "naming the things you scoped out in step 1 (the order-entry gateway, pre-trade risk, multi-instrument sharding, the tick store/backtester) — closing the loop shows you never forgot them." },
    ],
    example: {
      title: "Design an in-memory limit order book / matching engine",
      body: [
        { type: "kv", label: "Tradeoffs", text: "single-threaded engine trades per-book throughput for determinism and a flat tail (recovered by sharding instruments); integer-tick prices trade a little ergonomics for exact, reproducible matching; allocation-free hot path trades code simplicity for no GC pauses; log + snapshots trade some machinery for fast deterministic recovery." },
        { type: "kv", label: "Failure modes", text: "engine crash → rebuild exact book from latest snapshot + tail replay (degrade: brief halt, never wrong); sequencer/engine failover → promote the byte-identical hot replica, no state transfer; a slow downstream consumer (PnL, feed) buffers and lags but never back-pressures the matcher." },
        { type: "kv", label: "Monitoring", text: "alert on tick-to-trade p99 and p99.9 latency, GC pause count/duration, input-queue depth, sequence-gap errors, and end-of-day fill reconciliation against the replica. \"I'd treat p99.9 tick-to-trade as the primary SLI, and wire a risk kill-switch that halts order acceptance on a breach.\"" },
        { type: "kv", label: "With more time", text: "the order-entry gateway and binary protocol, pre-trade risk checks, multi-instrument sharding across engine cores, and the offline path — flushing the event log into a columnar tick store to feed the backtesting engine — all explicitly scoped out earlier." },
      ],
    },
    script: [
      "To wrap up: the main tradeoffs were the single-threaded engine for determinism and a flat latency tail — capped at one core per book, which I handle by sharding instruments — integer-tick prices for exact reproducible matching, and an allocation-free hot path to avoid GC pauses. On failure: an engine crash recovers the exact book from a snapshot plus tail replay, failover just promotes the byte-identical hot replica with no state transfer, and a slow downstream consumer buffers without ever back-pressuring the matcher. For production I'd monitor tick-to-trade p99 and p99.9, GC pauses, input-queue depth, sequence gaps, and end-of-day fill reconciliation against the replica — and I'd wire a risk kill-switch that halts order acceptance on a latency or risk breach. With more time I'd design the pieces I scoped out: the order-entry gateway, pre-trade risk, multi-instrument sharding, and the offline path feeding the tick store and backtester.",
    ],
    pitfalls: [
      { lead: "Trailing off.", body: "'Yeah, that's about it' wastes the maturity signal. Land it deliberately." },
      { lead: "No latency monitoring or kill-switch.", body: "Omitting tail-latency SLIs and a risk halt forfeits a strong trading-systems signal you can easily earn." },
      { lead: "Forgetting the scoped-out items.", body: "Naming them again proves the step-1 scoping was deliberate, not forgetful." },
    ],
  },
];

export default function FrameworkGuide({ onBack }) {
  const [activeStep, setActiveStep] = useState(null);

  const scrollToStep = (n) => {
    const el = document.getElementById(`step-${n}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveStep(n);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, #16243B 0%, #0B1422 60%, #070D16 100%)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif",
        color: "#E8EDF4",
        padding: "0 0 80px 0",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
        .step-card { animation: fadeUp .35s ease both; }
        .step-chip:hover { transform: translateY(-1px); }
        ::-webkit-scrollbar { width: 9px; }
        ::-webkit-scrollbar-track { background: #0B1422; }
        ::-webkit-scrollbar-thumb { background: #2A3C56; border-radius: 5px; }
      `}</style>

      {/* Sticky header */}
      <div
        style={{
          borderBottom: "1px solid #243650",
          background:
            "linear-gradient(180deg, rgba(20,33,54,.92), rgba(11,20,34,.7))",
          backdropFilter: "blur(6px)",
          padding: "24px 28px 18px",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: "1px solid #3A4D6B",
              color: "#9FB6D6",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: "system-ui",
              marginBottom: 12,
            }}
          >
            ← Back to Tracker
          </button>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#7E9BC4",
              marginBottom: 4,
              fontFamily: "system-ui",
            }}
          >
            Quant · Low-Latency System Design · Reference
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              color: "#F4F8FE",
              lineHeight: 1.15,
            }}
          >
            The 7-Step Quant System Design Framework
          </h1>
          <div
            style={{
              fontSize: 13,
              color: "#9CC0F5",
              marginTop: 6,
              fontStyle: "italic",
              fontFamily: "system-ui",
            }}
          >
            A deep reference for hedge-fund / trading-systems interviews — what
            each step is, why it exists, and exactly what to say. Python-first,
            worked end-to-end with one running example: "Design an in-memory
            limit order book / matching engine."
          </div>

          {/* Step nav chips */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 14,
              flexWrap: "wrap",
              fontFamily: "system-ui",
            }}
          >
            {STEPS.map((s) => (
              <button
                key={s.n}
                className="step-chip"
                onClick={() => scrollToStep(s.n)}
                style={{
                  background:
                    activeStep === s.n ? ACCENT : "rgba(255,255,255,.04)",
                  color: activeStep === s.n ? "#0B1422" : ACCENT,
                  border: `1px solid ${
                    activeStep === s.n ? ACCENT : ACCENT + "55"
                  }`,
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {s.n}. {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 920, margin: "22px auto 0", padding: "0 22px" }}>
        {/* How to read this */}
        <Callout tone="info" title="How to read this document">
          <p style={pStyle}>
            Each step has five parts:{" "}
            <b>(1) What it is</b> in one line, <b>(2) Why it exists</b> — the
            failure it prevents, <b>(3) What you actually do</b>,{" "}
            <b>(4) The running matching-engine example</b>, and{" "}
            <b>(5) a script box</b> showing roughly what it sounds like spoken
            aloud. The examples are quant / low-latency (limit order book,
            market-data feed handler, tick store, backtester, PnL/risk, OMS)
            and Python-first. Read it once start-to-finish, then keep it open
            beside your first 3–4 practice designs and consciously walk the
            steps. After ~4 reps you won't need it.
          </p>
          <p style={{ ...pStyle, marginTop: 8 }}>
            <b>The time budget for a 45-minute interview</b> is shown per
            step. Total ≈ 45 min. The single biggest pacing mistake is spending
            15 minutes on requirements and never reaching the deep dive — the
            timings exist to prevent exactly that. The emphasis throughout is
            latency, throughput, determinism, and correctness — not web-scale.
          </p>
        </Callout>

        {/* At a glance */}
        <SectionHeading text="The Framework at a Glance" />
        <p style={{ ...pStyle, marginBottom: 14 }}>
          Memorize this column of seven words first —{" "}
          <b>
            Requirements, Estimates, API, Data, High-level, Deep-dive,
            Tradeoffs
          </b>
          . Everything else is detail you hang on these seven pegs.
        </p>
        <Glance rows={AT_A_GLANCE} />
        <Callout tone="warm" title="The mental model">
          <p style={pStyle}>
            Steps 1–2 are <b>scoping</b> (you're mostly asking, not designing).
            Step 3–4 are the <b>contract and the nouns</b>. Step 5 is the{" "}
            <b>skeleton</b>. Step 6 is where you <b>earn the hire</b> — depth.
            Step 7 is <b>maturity</b> — showing you know nothing is free. A
            weak candidate sprints to step 5 and draws boxes. A strong one
            earns the right to those boxes through 1–4, then goes deep in 6.
          </p>
        </Callout>

        {/* The seven step cards */}
        {STEPS.map((step) => (
          <StepCard key={step.n} step={step} />
        ))}

        {/* Putting it together */}
        <SectionHeading text="Putting It Together — The One-Page Mental Loop" />
        <p style={pStyle}>
          When you hear any design prompt, this is the loop that should fire
          automatically:
        </p>
        <div
          style={{
            margin: "10px 0 14px 0",
            padding: "14px 18px",
            background: "linear-gradient(135deg,#13243F,#0E1B30)",
            border: "1px solid #2F66C4",
            borderRadius: 12,
            fontSize: 14.5,
            lineHeight: 1.7,
            color: "#D7E0EE",
          }}
        >
          <b>Scope it</b> (Req) → <b>size it</b> (Est) →{" "}
          <b>define the contract</b> (API) → <b>shape the data</b> (Model) →{" "}
          <b>draw the skeleton</b> (HLD) → <b>go deep on the bottleneck</b>{" "}
          (Deep dive) → <b>land it with tradeoffs</b> (Wrap).
        </div>
        <p style={pStyle}>
          Steps 1–5 should feel <b>automatic and fast</b> — they're structure,
          and structure is what you memorize so your brain is free for step 6,
          which is where the actual thinking and the actual evaluation happen.
          The reason to drill the framework until it's reflexive is precisely
          so that{" "}
          <b>
            under pressure your working memory is spent on the problem, not on
            remembering what to do next.
          </b>
        </p>
        <Callout tone="info" title="The discipline">
          <p style={pStyle}>
            For your first 3–4 practice designs, keep this open and announce
            each step out loud as you enter it ("Now I'll move to the data
            model…"). It will feel mechanical. That mechanical feeling is the
            framework being burned in. By the fourth design you'll stop
            needing the document — and that is exactly when it has done its
            job.
          </p>
        </Callout>
      </div>
    </div>
  );
}

// ----------------------------- subcomponents -----------------------------

const pStyle = {
  fontSize: 14.5,
  lineHeight: 1.7,
  color: "#D7E0EE",
  margin: 0,
};

function StepCard({ step }) {
  return (
    <div
      id={`step-${step.n}`}
      className="step-card"
      style={{
        marginTop: 24,
        marginBottom: 8,
        background: "linear-gradient(180deg,#101D33,#0C1626)",
        border: "1px solid #1F2F47",
        borderRadius: 14,
        padding: "22px 24px",
        scrollMarginTop: 210,
      }}
    >
      {/* Step header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginBottom: 14,
          flexWrap: "wrap",
          paddingBottom: 10,
          borderBottom: "1px solid #1F2F47",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            fontFamily: "system-ui",
            color: ACCENT,
            letterSpacing: 1.5,
            border: `1px solid ${ACCENT}55`,
            borderRadius: 8,
            padding: "3px 10px",
          }}
        >
          STEP {step.n}
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "#F4F8FE",
          }}
        >
          {step.name}
          {step.nameSuffix && (
            <span
              style={{ color: "#8AA1C2", fontWeight: 500, fontSize: 18 }}
            >
              {step.nameSuffix}
            </span>
          )}
        </h2>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "#7E9BC4",
            fontFamily: "system-ui",
            border: "1px solid #2A3C56",
            borderRadius: 10,
            padding: "3px 10px",
          }}
        >
          ⏱ {step.time}
        </span>
      </div>

      <SubHeading text="What it is" />
      <p style={pStyle}>{step.whatItIs}</p>

      <SubHeading text="Why it exists (the failure it prevents)" />
      <p style={pStyle}>{step.whyItExists}</p>

      <SubHeading text="What you actually do" />
      <LeadList items={step.whatYouDo} />

      <SubHeading text={`Running example — ${step.example.title}`} />
      <ExampleBody body={step.example.body} />

      <ScriptBox lines={step.script} />

      {step.callout && (
        <div style={{ marginTop: 16 }}>
          <Callout tone="success" title={step.callout.title}>
            <p style={pStyle}>{step.callout.body}</p>
          </Callout>
        </div>
      )}

      <SubHeading text="Pitfalls" tone="warn" />
      <LeadList items={step.pitfalls} tone="warn" />
    </div>
  );
}

function SectionHeading({ text }) {
  return (
    <h2
      style={{
        marginTop: 26,
        marginBottom: 10,
        fontSize: 22,
        fontWeight: 700,
        color: "#9CC0F5",
        borderBottom: "1px solid #243650",
        paddingBottom: 8,
      }}
    >
      {text}
    </h2>
  );
}

function SubHeading({ text, tone }) {
  const color = tone === "warn" ? "#F4B26A" : "#9CC0F5";
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: 2,
        textTransform: "uppercase",
        color,
        fontFamily: "system-ui",
        fontWeight: 700,
        marginTop: 16,
        marginBottom: 8,
      }}
    >
      {text}
    </div>
  );
}

function LeadList({ items, tone }) {
  const dotColor = tone === "warn" ? "#F4B26A" : ACCENT;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            fontSize: 14.5,
            lineHeight: 1.7,
            color: "#D7E0EE",
            paddingLeft: 18,
            position: "relative",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 10,
              width: 6,
              height: 6,
              borderRadius: 3,
              background: dotColor,
            }}
          />
          <b style={{ color: tone === "warn" ? "#F4D2A8" : "#EAF0F8" }}>
            {it.lead}
          </b>{" "}
          {it.body}
        </li>
      ))}
    </ul>
  );
}

function ExampleBody({ body }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {body.map((seg, i) => {
        if (seg.type === "kv") {
          return (
            <div
              key={i}
              style={{
                fontSize: 14.5,
                lineHeight: 1.7,
                color: "#D7E0EE",
              }}
            >
              <b style={{ color: "#EAF0F8" }}>{seg.label}:</b> {seg.text}
            </div>
          );
        }
        if (seg.type === "code") {
          return (
            <pre
              key={i}
              style={{
                margin: "4px 0",
                padding: "12px 14px",
                background: "#0A1322",
                border: "1px solid #1B2A44",
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.6,
                color: "#B7CDEC",
                fontFamily:
                  "'JetBrains Mono', 'Consolas', 'Menlo', monospace",
                whiteSpace: "pre-wrap",
                overflowX: "auto",
              }}
            >
              {seg.text}
            </pre>
          );
        }
        return null;
      })}
    </div>
  );
}

function ScriptBox({ lines }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: "14px 18px",
        background: "rgba(47,102,196,.08)",
        border: "1px solid #2F66C4",
        borderLeftWidth: 4,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#9CC0F5",
          fontFamily: "system-ui",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        What this sounds like out loud
      </div>
      {lines.map((line, i) => (
        <p
          key={i}
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#C5D3EA",
            fontStyle: "italic",
            margin: i === 0 ? 0 : "8px 0 0 0",
          }}
        >
          "{line}"
        </p>
      ))}
    </div>
  );
}

function Callout({ tone, title, children }) {
  const palettes = {
    info: { bg: "rgba(47,102,196,.10)", border: "#2F66C4", title: "#9CC0F5" },
    warm: { bg: "rgba(244,178,106,.08)", border: "#A77136", title: "#F4B26A" },
    success: { bg: "rgba(95,215,158,.08)", border: "#2C6444", title: "#5FD79E" },
  };
  const p = palettes[tone] || palettes.info;
  return (
    <div
      style={{
        margin: "14px 0",
        padding: "14px 18px",
        background: p.bg,
        border: `1px solid ${p.border}`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: p.title,
          fontFamily: "system-ui",
          marginBottom: 6,
          letterSpacing: 0.3,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Glance({ rows }) {
  return (
    <div
      style={{
        border: "1px solid #1F2F47",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 14,
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 2.2fr 80px",
          background: "#13243F",
          color: "#9CC0F5",
          fontSize: 12,
          fontWeight: 700,
          padding: "10px 14px",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        <div>#</div>
        <div>Step</div>
        <div>One-line purpose</div>
        <div style={{ textAlign: "right" }}>Time</div>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.n}
          style={{
            display: "grid",
            gridTemplateColumns: "44px 1fr 2.2fr 80px",
            padding: "10px 14px",
            background: i % 2 === 0 ? "#0E1B30" : "#101D33",
            color: "#D7E0EE",
            fontSize: 13.5,
            lineHeight: 1.55,
            borderTop: "1px solid #1B2A44",
            alignItems: "center",
          }}
        >
          <div style={{ color: ACCENT, fontWeight: 700 }}>{r.n}</div>
          <div style={{ fontWeight: 600, color: "#EAF0F8" }}>{r.step}</div>
          <div>{r.one}</div>
          <div style={{ textAlign: "right", color: "#9CC0F5" }}>{r.time}</div>
        </div>
      ))}
    </div>
  );
}
