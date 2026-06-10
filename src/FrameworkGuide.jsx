import { useState } from "react";

// ---------------------------------------------------------------------------
//  THE 7-STEP SYSTEM DESIGN FRAMEWORK
//  Faithful to SystemDesign_7Step_Framework.pdf — Twitter/X running example.
//  Each step: What it is → Why it exists → What you do → Running example →
//  What this sounds like out loud → Pitfalls.
// ---------------------------------------------------------------------------

const ACCENT = "#6FA8FF";

const AT_A_GLANCE = [
  { n: 1, step: "Requirements",      one: "Decide what you're building and at what scale, before designing anything", time: "~5 min" },
  { n: 2, step: "Estimates",         one: "Put rough numbers on scale so later choices are justified, not arbitrary", time: "~5 min" },
  { n: 3, step: "API design",        one: "Define the contract; this anchors the data model and components",          time: "~5 min" },
  { n: 4, step: "Data model",        one: "Entities, schema, and the storage choice — with a reason tied to access patterns", time: "~7 min" },
  { n: 5, step: "High-level design", one: "The boxes-and-arrows diagram; walk the request path end to end",            time: "~8 min" },
  { n: 6, step: "Deep dive",         one: "Go deep on 1–2 components; show real depth and find the bottleneck",        time: "~10 min" },
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
      "\"Design Twitter\" is deliberately under-specified. Do they mean the timeline? DMs? Search? Trending? Notifications? If you start designing without scoping, you will either build the wrong thing or try to build everything and run out of time. Interviewers are explicitly evaluating whether you clarify ambiguity before acting — it's one of the graded axes, and at big tech it maps directly to a core trait (\"deals with ambiguity\"). Skipping this step doesn't just lose time; it loses a signal they are actively scoring.",
    whatYouDo: [
      { lead: "Separate functional from non-functional.", body: "Functional = what it does (post a tweet, follow a user, view a feed). Non-functional = the qualities (scale, latency, availability, consistency)." },
      { lead: "Explicitly scope IN and OUT.", body: "Say out loud what you will and won't cover. \"I'll focus on posting tweets and the home timeline; I'll treat search and DMs as out of scope unless you'd like me to cover them.\" This shows judgment and protects your time." },
      { lead: "Ask the four questions that change the design:", body: "(a) scale — how many users / how much traffic? (b) read vs write ratio? (c) latency target — is this user-facing real-time or can it be async? (d) consistency — does stale data for a few seconds matter?" },
      { lead: "Write the answers down", body: "(on the whiteboard / shared doc). You will refer back to them in every later step to justify decisions." },
    ],
    example: {
      title: "Design Twitter/X",
      body: [
        { type: "kv", label: "Functional (in scope)", text: "a user can post a tweet; a user can follow other users; a user can view a home timeline of tweets from people they follow, newest first." },
        { type: "kv", label: "Out of scope (stated explicitly)", text: "search, DMs, trending, ads, notifications — \"happy to come back to these if time allows.\"" },
        { type: "kv", label: "Non-functional", text: "~200M daily active users; massively read-heavy (people read feeds far more than they post — roughly 100:1); home timeline should load in under ~200 ms; eventual consistency is acceptable (a tweet appearing in followers' feeds a few seconds late is fine; this is a huge simplification and you should say so)." },
      ],
    },
    script: [
      "Before I design anything, let me clarify scope. When you say 'design Twitter,' I'm going to assume the core is: posting tweets, following users, and a home timeline. I'll treat search, DMs, and trending as out of scope unless you want them. A few questions: roughly what scale are we targeting — hundreds of millions of users? And is this read-heavy as I'd expect, where reads massively outnumber writes? And is eventual consistency acceptable for the timeline — is it OK if a tweet shows up in followers' feeds a couple of seconds late?",
      "Great — so to summarize what I'm building: [restate the scoped requirements]. I'll keep these on the board and refer back as I make decisions.",
    ],
    pitfalls: [
      { lead: "Designing during this step.", body: "Resist. No databases, no boxes yet. Just scope." },
      { lead: "Asking no questions.", body: "Silence here reads as 'jumps to solutions without understanding the problem' — a documented negative signal." },
      { lead: "Accepting the prompt literally.", body: "'Design Twitter' in full is a year of work; un-scoped, you'll fail by trying to cover everything." },
    ],
  },

  // ============================ STEP 2 ============================
  {
    n: 2,
    name: "Estimates",
    time: "~5 min",
    whatItIs:
      "Quick \"back-of-the-envelope\" math to attach rough numbers to the scale you just clarified: queries per second (QPS), storage growth, bandwidth. Precision is irrelevant — order of magnitude is everything.",
    whyItExists:
      "Every later decision — do I need a cache, do I need to shard the database, one server or a thousand — is only defensible relative to a number. Without estimates, \"I'll add a cache\" is a buzzword; with them, \"at ~350K timeline reads/sec a single DB can't serve this, so a cache is mandatory\" is engineering. Estimates convert opinions into justified decisions. Interviewers specifically listen for whether your architecture is driven by the numbers or decorated with them afterward.",
    whatYouDo: [
      { lead: "Start from the scale figure", body: "you established in step 1 (e.g. 200M DAU)." },
      { lead: "Estimate writes:", body: "DAU × actions per user per day, divided by 86,400 sec/day, to get average QPS. Multiply by ~2–3 for peak." },
      { lead: "Estimate reads", body: "using the read:write ratio from step 1 (often the dominant number for a feed system)." },
      { lead: "Estimate storage:", body: "writes/day × size per item × 365 → storage/year. Round hard." },
      { lead: "Say the numbers out loud and write them down.", body: "Then immediately state the implication — that's the whole point of doing it." },
    ],
    example: {
      title: "Design Twitter/X",
      body: [
        { type: "kv", label: "Writes (tweets)", text: "say 200M DAU, each posts ~2 tweets/day → 400M tweets/day ÷ 86,400 ≈ ~4,600 tweets/sec average, call it ~10K/sec at peak." },
        { type: "kv", label: "Reads (timeline loads)", text: "read-heavy at ~100:1 → on the order of ~hundreds of thousands of timeline reads/sec. This is the number that dominates the design." },
        { type: "kv", label: "Storage", text: "400M tweets/day × ~300 bytes ≈ 120 GB/day ≈ ~44 TB/year of tweet text alone (media handled separately, far larger)." },
        { type: "kv", label: "The implications you state immediately", text: "(1) read volume is orders of magnitude above write volume → the system must be optimized for reads, caching is not optional; (2) yearly storage is large but not exotic → a sharded store is needed but it's a known problem; (3) the read:write asymmetry is the single most important fact and it will drive the timeline design in step 6." },
      ],
    },
    script: [
      "Let me put rough numbers on this. With ~200 million daily users posting a couple of tweets each, that's about 400 million tweets a day — roughly 4–5 thousand writes per second average, maybe 10K at peak. But it's read-heavy, so timeline reads are on the order of hundreds of thousands per second. That asymmetry is the key fact: this is overwhelmingly a read-optimization problem, so caching and how I build the timeline will be the heart of the design. Storage is tens of terabytes a year for text — large, so I'll need to shard, but that's a solved problem.",
    ],
    pitfalls: [
      { lead: "False precision.", body: "Nobody wants 4,629.6 QPS. 'A few thousand per second' is the right resolution. Round aggressively." },
      { lead: "Numbers with no conclusion.", body: "Computing QPS and then not saying what it implies wastes the step. Always end with '…therefore'." },
      { lead: "Spending 12 minutes here.", body: "It's a 5-minute sanity check, not an actuarial exercise." },
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
      "The API is the bridge between \"what it does\" (step 1) and \"how data is shaped\" (step 4). Defining it forces precision: to write getTimeline(userId, pagination) you must decide it's paginated, which forces you to think about how the feed is stored and retrieved. Candidates who skip this tend to produce vague data models and hand-wave the read path. The API is also where you naturally surface auth, pagination, and idempotency — all things interviewers like to see raised unprompted.",
    whatYouDo: [
      { lead: "List only the core endpoints", body: "that map to your in-scope functional requirements — usually 3 to 5. Don't design a hundred endpoints." },
      { lead: "Specify inputs and outputs at a signature level.", body: "You do not need full request/response JSON; the shape and key fields are enough." },
      { lead: "Decide REST vs something else briefly.", body: "REST/HTTP is the safe default; mention gRPC or WebSockets only if the problem needs low latency or push (e.g. chat)." },
      { lead: "Flag the cross-cutting concerns:", body: "pagination for any list endpoint, an idempotency key for writes that must not double-apply, auth via a token. One sentence each." },
    ],
    example: {
      title: "Design Twitter/X",
      body: [
        { type: "code", text: "postTweet(userId, content)        → { tweetId, timestamp }\nfollowUser(followerId, followeeId) → { success }\ngetHomeTimeline(userId, cursor, limit) → { tweets[], nextCursor }" },
        { type: "kv", label: "Notes you say aloud", text: "the timeline endpoint is cursor-paginated (not offset — offset breaks on a constantly-changing feed); postTweet should accept an idempotency key so a retried request doesn't create duplicate tweets; all endpoints are authenticated via a token resolved to userId at the gateway." },
      ],
    },
    script: [
      "The core API is small. postTweet takes a user and content and returns a tweet ID and timestamp. followUser is straightforward. The important one is getHomeTimeline — it takes a user and a pagination cursor and returns a page of tweets plus the next cursor. I'm using cursor-based pagination deliberately, because offset pagination breaks when the underlying feed is changing every second. I'd also have postTweet accept an idempotency key so a client retry doesn't double-post.",
    ],
    pitfalls: [
      { lead: "Designing 20 endpoints.", body: "Stay to the in-scope core; breadth here is wasted time." },
      { lead: "Offset pagination on a live feed.", body: "Classic mistake; cursor-based is the expected answer." },
      { lead: "Full JSON schemas.", body: "Signatures and key fields are enough; verbosity costs you the clock." },
    ],
  },

  // ============================ STEP 4 ============================
  {
    n: 4,
    name: "Data Model",
    time: "~7 min",
    whatItIs:
      "The entities the system stores, their key fields and relationships, and the storage technology choice (SQL vs a specific NoSQL family) — with the choice justified by the access pattern, never by fashion.",
    whyItExists:
      "This is where many otherwise-good candidates lose the round, by saying \"I'll use NoSQL because it scales.\" That is a non-answer. The data model is graded on whether your storage choice follows from how the data is read and written. The interviewer wants to see you reason: \"the access pattern is X, therefore this store, with this as the partition key, indexed this way.\" It also sets up step 6 — the bottleneck is almost always here.",
    whatYouDo: [
      { lead: "List the core entities", body: "and their important fields: e.g. User, Tweet, Follow (the relationship)." },
      { lead: "State the access patterns first,", body: "then choose storage to fit them. \"I need to look up tweets by author, and fetch a user's followers fast\" drives the choice — not the other way around." },
      { lead: "Pick storage with a stated reason.", body: "SQL when relationships/transactions matter and scale is moderate; a key-value or wide-column store when you need massive horizontal scale on a known access pattern; name the actual tradeoff." },
      { lead: "Specify the partition/shard key and key indexes.", body: "This is the detail that separates senior-sounding answers — \"shard tweets by authorId so a user's tweets are co-located.\"" },
    ],
    example: {
      title: "Design Twitter/X",
      body: [
        { type: "kv", label: "Entities", text: "User (id, handle, name); Tweet (id, authorId, content, createdAt); Follow (followerId, followeeId, createdAt)." },
        { type: "kv", label: "Access patterns", text: "(1) write a tweet; (2) get a user's recent tweets by authorId; (3) get a user's followers / followees; (4) assemble a home timeline (the hard one — deferred to step 6)." },
        { type: "kv", label: "Storage choice with reasoning", text: "the Tweet store is write-heavy, append-mostly, and accessed by a known key (authorId + time) at huge scale → a wide-column / key-value store sharded by authorId fits the access pattern and scales horizontally. The Follow graph is relationship data with simpler patterns; it can live in a sharded relational store or a dedicated graph/KV structure. \"I'm choosing the wide-column store specifically because the dominant access is 'give me tweets for these author IDs, newest first' — a partition-key + sort-key query it's perfect for, not because 'NoSQL scales.'\"" },
      ],
    },
    script: [
      "Three entities: User, Tweet, and the Follow relationship. Before I pick a database I'll state the access patterns: I write tweets, I read a given author's recent tweets, I read a user's follower list, and I assemble timelines — which I'll deep-dive separately. Given the dominant pattern is 'fetch tweets for a set of author IDs, newest first,' at very high scale, I'll store tweets in a wide-column store sharded by author ID, so a user's tweets are co-located and time-sortable. I want to be explicit that I'm choosing this for the access pattern, not because NoSQL is trendy — if the dominant need were multi-entity transactions I'd argue for relational instead.",
    ],
    pitfalls: [
      { lead: "'NoSQL because it scales.'", body: "The single most common fatal hand-wave. Always tie the store to the access pattern." },
      { lead: "No partition key.", body: "'A sharded store' without saying the shard key is incomplete; the key is the interesting decision." },
      { lead: "Skipping access patterns.", body: "Choosing a DB before stating how data is read is backwards and reads as inexperience." },
    ],
  },

  // ============================ STEP 5 ============================
  {
    n: 5,
    name: "High-Level Design",
    time: "~8 min",
    whatItIs:
      "The boxes-and-arrows diagram: client → load balancer → services → data stores, plus the path a request takes through them. The first time you actually draw the system.",
    whyItExists:
      "This is the shared picture you and the interviewer reason about for the rest of the session. Its purpose is coverage and a walkthrough, not depth yet — show that the end-to-end path exists and is coherent. Candidates who jump here first (skipping 1–4) draw a plausible-looking diagram they can't justify; candidates who arrive here having done 1–4 can defend every box. The diagram earns its credibility from the prior steps.",
    whatYouDo: [
      { lead: "Draw the standard spine:", body: "client → load balancer / API gateway → stateless application services → datastores, with a cache alongside the read path." },
      { lead: "Separate the write path from the read path.", body: "For a feed system these are very different and you'll deep-dive the read path in step 6 — set that up here." },
      { lead: "Walk one request end to end, out loud.", body: "\"A tweet POST hits the gateway, authenticates, goes to the Tweet service, writes to the store, and triggers fan-out…\" Narrating the path is the deliverable, not the boxes themselves." },
      { lead: "Keep components stateless where possible", body: "and say so — it's what makes horizontal scaling trivial and you want that observation on the record." },
    ],
    example: {
      title: "Design Twitter/X",
      body: [
        { type: "kv", label: "Components", text: "Client → API Gateway / LB → (Tweet Service, Timeline Service, Follow Service — all stateless) → Tweet store (sharded), Follow store, plus a Timeline Cache on the read path and a message queue connecting the write path to timeline construction." },
        { type: "kv", label: "Write path", text: "client posts → gateway authenticates → Tweet Service persists the tweet → publishes a \"new tweet\" event to a queue → (fan-out work happens asynchronously — deep-dived next)." },
        { type: "kv", label: "Read path", text: "client requests timeline → gateway → Timeline Service → reads the pre-built timeline from the Timeline Cache (ideally a single fast lookup) → returns a page." },
      ],
    },
    script: [
      "Here's the high-level shape. Clients hit a gateway that handles auth and load-balances to stateless services — a Tweet service, a Timeline service, a Follow service. Tweets persist to the sharded store. The key structural decision: the write path and read path are decoupled by a queue. When you post, we persist and publish an event; timeline construction happens asynchronously off that event. When you read your timeline, you ideally hit a pre-computed result in the timeline cache — one fast lookup. Let me trace a tweet through end to end: [walk the write path, then the read path]. Everything except the datastores is stateless, so we scale horizontally by adding instances.",
    ],
    pitfalls: [
      { lead: "Drawing this first.", body: "Without steps 1–4 you can't defend the boxes; interviewers probe and it collapses." },
      { lead: "Boxes with no walkthrough.", body: "The narrated request path is the actual signal, not the picture." },
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
      "Picking one or two components — usually the bottleneck — and going genuinely deep: the hard tradeoff, the failure mode, the scaling mechanism. This is the longest step and the one that most determines the outcome at mid-level.",
    whyItExists:
      "Steps 1–5 prove competence; step 6 separates a hire from a no-hire. A surface-level design that never goes deep reads as junior. The interviewer is now probing: \"what breaks first, and how do you fix it.\" At mid-level, the documented decisive signal is not the initial design but how you handle this deep dive and its follow-ups. This is the step to spend your strongest minutes on.",
    whatYouDo: [
      { lead: "Name the bottleneck explicitly", body: "and why it's the bottleneck (point back at your estimates from step 2)." },
      { lead: "Present the real tradeoff", body: "with at least two options, their costs, and a defended choice — not one magic answer." },
      { lead: "Bring in the mechanisms:", body: "caching, sharding, replication, queues, consistency — and say precisely where and why each applies." },
      { lead: "Address failure:", body: "what happens when a node/region dies, where data can be lost, how the system degrades." },
    ],
    example: {
      title: "Design Twitter/X — the timeline (the classic deep dive)",
      body: [
        { type: "kv", label: "The bottleneck", text: "from step 2, reads dominate at hundreds of thousands/sec. Building each home timeline on-demand by querying every followee at read time is far too slow. So the core question is fan-out: when do we do the work?" },
        { type: "kv", label: "Option A — fan-out on read (pull)", text: "store tweets only by author; build the timeline at read time by querying all followees and merging. Pro: cheap writes, no duplication. Con: brutally slow reads for users following many people — and reads are the dominant load. Fails the latency target." },
        { type: "kv", label: "Option B — fan-out on write (push)", text: "when a user tweets, immediately push the tweet ID into the precomputed timeline cache of every follower. Pro: timeline reads become a single fast lookup — perfect for a read-heavy system. Con: a celebrity with 100M followers causes 100M writes per tweet (the \"celebrity / hot-key\" problem)." },
        { type: "kv", label: "The defended answer — hybrid", text: "fan-out on write for the vast majority of users (cheap, gives fast reads); for celebrities above a follower threshold, don't fan out — instead the follower's timeline is assembled at read time by merging their precomputed timeline with the small number of celebrities they follow, fetched live. This bounds the worst case on both sides. \"This hybrid is the standard real-world answer because it directly trades a manageable amount of read-time merge work to eliminate the unbounded celebrity write amplification.\"" },
        { type: "kv", label: "Failure & consistency", text: "the fan-out runs off the queue asynchronously, so a fan-out worker dying delays a tweet appearing in some feeds by seconds — acceptable, because in step 1 we established eventual consistency is fine. The queue must be durable so events aren't lost on worker failure; at-least-once delivery plus idempotent timeline insertion handles retries." },
      ],
    },
    script: [
      "The bottleneck is the timeline read — from my estimates, reads are hundreds of thousands per second, so I cannot build feeds on demand. The real question is fan-out timing. Option one, fan-out on read: cheap writes but the read does a huge merge across everyone you follow — and reads are my dominant load, so this fails the latency goal. Option two, fan-out on write: when you tweet I push it into every follower's precomputed timeline, so reads become one fast lookup — ideal for read-heavy — but a celebrity with a hundred million followers means a hundred million writes per tweet. So I'd go hybrid: fan-out on write for normal users, but above a follower threshold I skip fan-out and merge those few celebrity accounts in at read time. That bounds both the write amplification and the read cost. The fan-out is async off a durable queue, which is fine because we agreed eventual consistency is acceptable; I make the timeline insert idempotent so at-least-once retries don't duplicate.",
    ],
    pitfalls: [
      { lead: "Staying shallow.", body: "'I'd add a cache' with no mechanism is a no-hire at mid-level. Go to the tradeoff and the failure mode." },
      { lead: "One magic solution.", body: "Present options and defend a choice; a single unexamined answer looks like memorization." },
      { lead: "Ignoring failure.", body: "'What happens when this dies' is the follow-up you must reach before they ask it." },
    ],
    callout: {
      title: "This is your highest-leverage practice target",
      body: "In your study plan, the five follow-up drills — \"what breaks at 10×,\" \"why this DB,\" \"node failure,\" \"consistency risk,\" \"monitoring\" — all live in this step. When you practice, spend the majority of each design's effort here, because this is the step the interview outcome actually turns on.",
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
      "Junior answers end with \"…and that's the design.\" Senior answers end by acknowledging that every decision had a cost. This step signals engineering maturity: you know nothing is free, you've thought about operating the thing, not just building it. Mentioning monitoring unprompted is a specific, documented strong signal of real production experience — and you have that experience, so make sure it lands.",
    whatYouDo: [
      { lead: "Restate 2–3 key tradeoffs in one line each:", body: "\"I chose eventual consistency for timeline freshness to get read latency and availability — the cost is a few seconds of staleness, which we agreed was acceptable.\"" },
      { lead: "Name the main failure modes", body: "and how the system degrades (not crashes): queue backlog delays feeds; a cache region loss falls back to slower rebuild; etc." },
      { lead: "Add observability explicitly:", body: "the metrics, logs, and traces you'd watch (timeline read latency p99, fan-out lag, queue depth) and what you'd alert on. Say this even if not asked." },
      { lead: "End with \"with more time I'd…\"", body: "naming the things you scoped out in step 1 (search, DMs, media pipeline) — closing the loop shows you never forgot them." },
    ],
    example: {
      title: "Design Twitter/X",
      body: [
        { type: "kv", label: "Tradeoffs", text: "eventual consistency for read speed and availability; the hybrid fan-out trades read-time merge cost to kill celebrity write amplification; denormalized precomputed timelines trade storage and write complexity for fast reads." },
        { type: "kv", label: "Failure modes", text: "fan-out workers down → feeds lag by seconds but recover (degrade, not fail); timeline cache region loss → rebuild from the tweet store, slower but correct." },
        { type: "kv", label: "Monitoring", text: "alert on timeline read p99 latency, fan-out lag (event → visible-in-feed), queue depth, cache hit rate. \"I'd treat fan-out lag as a primary SLI since it's the user-visible freshness of the product.\"" },
        { type: "kv", label: "With more time", text: "search (a separate inverted-index service), the media pipeline (object storage + CDN), trending, and DMs — all explicitly scoped out earlier." },
      ],
    },
    script: [
      "To wrap up: the main tradeoffs were eventual consistency for read latency and availability, the hybrid fan-out to bound the celebrity case, and denormalized timelines that cost storage and write complexity to make reads fast. On failure: fan-out workers going down degrades freshness by seconds rather than breaking anything, and a cache loss rebuilds from the tweet store. For production I'd monitor timeline read p99, fan-out lag — which I'd treat as the key freshness SLI — queue depth, and cache hit rate, with alerts on each. With more time I'd design the pieces I scoped out: search, the media/CDN path, trending, and DMs.",
    ],
    pitfalls: [
      { lead: "Trailing off.", body: "'Yeah, that's about it' wastes the maturity signal. Land it deliberately." },
      { lead: "No monitoring.", body: "Omitting observability forfeits a documented strong signal you can easily earn — and that you genuinely have the background for." },
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
            System Design · Reference
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
            The 7-Step System Design Framework
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
            A deep reference — what each step is, why it exists, and exactly
            what to say. Worked end-to-end with one running example: "Design
            Twitter/X"
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
            <b>(4) The running Twitter example</b>, and{" "}
            <b>(5) a script box</b> showing roughly what it sounds like spoken
            aloud. Read it once start-to-finish, then keep it open beside your
            first 3–4 practice designs and consciously walk the steps. After
            ~4 reps you won't need it.
          </p>
          <p style={{ ...pStyle, marginTop: 8 }}>
            <b>The time budget for a 45-minute interview</b> is shown per
            step. Total ≈ 45 min. The single biggest pacing mistake is spending
            15 minutes on requirements and never reaching the deep dive — the
            timings exist to prevent exactly that.
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
