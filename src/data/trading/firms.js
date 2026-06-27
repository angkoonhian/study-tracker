// Per-firm interview guides, reconstructed/summarized from public reports
// (Glassdoor, Wall Street Oasis, firm careers/engineering-blog pages, r/quant,
// trading-interview prep sites, Blind). These are RECONSTRUCTIONS in our own
// words of how the process is commonly described publicly — NOT verbatim,
// leaked, or confidential material, and exact loops vary by team/role/year.
//
// Shape: { id, name, blurb, rounds:[{name,detail}], emphasis:[..], samples:[..], sources:[..] }

export const FIRMS = [
  {
    id: "hrt",
    name: "Hudson River Trading (HRT)",
    blurb:
      "A quantitative, research-driven market maker known for an engineering-heavy culture. SWE interviews lean hard on low-level systems knowledge and clean, idiomatic code rather than finance trivia.",
    rounds: [
      {
        name: "Online assessment",
        detail:
          "Timed coding assessment, commonly described as ~3 algorithmic problems (easy-to-medium) to filter on correctness and speed.",
      },
      {
        name: "Phone / first-round technical",
        detail:
          "~45-60 min live coding plus discussion, often touching systems topics (memory, I/O, processes) alongside a data-structures problem.",
      },
      {
        name: "Virtual / on-site loop",
        detail:
          "Multiple technical rounds split between programming (write working, idiomatic code) and systems/problem-solving discussions; some roles require C++ or Python specifically.",
      },
    ],
    emphasis: [
      "Idiomatic, well-structured, readable code",
      "Systems fundamentals: memory, I/O, processes, OS",
      "Breaking down unfamiliar problems incrementally",
      "Correctness and performance under constraints",
    ],
    samples: [
      "Data-structure / algorithm problems with follow-up optimization",
      "Systems-level reasoning (what happens at the memory / OS level)",
      "Open-ended 'how would you approach this' design discussions",
      "Language-specific idiom and complexity questions",
    ],
    sources: [
      "hudsonrivertrading.com/hrtbeat (How to Prepare for Your SWE Interview at HRT)",
      "hudsonrivertrading.com/hrtbeat (Engineering and Interviewing at HRT)",
      "Hacker News thread on HRT interviews (item 44840102)",
      "AlgoDaily — Hudson River Trading interview questions",
      "LinkJob — How I Aced the HRT CodeSignal Assessment",
      "Glassdoor / Blind — HRT SWE interviews (login-walled; search snippets only)",
    ],
    tips: [
      "Narrate your reasoning out loud — communication is weighted ~equally with technical skill; over-communicate when you change approach.",
      "Take hints gracefully; teachability (applying earlier ideas to later problems) is scored — collaborate, don't go silent.",
      "Treat the OA as proctored and medium–hard; practice the timed CodeSignal-style format and expect at least one very hard question.",
      "Build genuine systems fundamentals (virtual memory, OS, I/O) — HRT probes for real understanding, not memorized definitions.",
      "Practice debugging unfamiliar / broken code fast, including SSH/CLI workflows for Python roles.",
      "Don't rely on 'aha' tricks — HRT deliberately avoids burst-of-insight puzzles; favor methodical, fundamentals-driven solutions.",
      "Be honest about what you don't know; admitting uncertainty is valued, and using LLMs to cheat is a top disqualifier.",
    ],
    experiences: [
      { text: "HRT's own guide describes the pipeline as a take-home, ~2 phone interviews, and a full day of back-to-back onsite rounds (coding/debugging, technical design, team fit); candidates choose C++, Python, or TypeScript/Python.", source: "HRTBeat — How to Prepare" },
      { text: "An HRT engineer's Q&A stresses that they rank technical ability and communication about equally and list shallow fundamentals plus poor communication/listening as the top reasons candidates fail.", source: "HRTBeat — Engineering and Interviewing" },
      { text: "A candidate reported a Python-internals round needing deep CPython knowledge (how dict collisions are handled, memory management) — they spent weeks in the CPython source to prepare.", source: "Hacker News (44840102)" },
      { text: "A reported first-round CodeSignal OA was ~4 classic LeetCode medium/hard questions in ~70 minutes, with later rounds touching OS internals, data structures, and networking.", source: "Glassdoor snippets" },
      { text: "Python-engineer reports mention a debugging round where you SSH into a company server to fix code, with early rounds on a short (~30 min) CoderPad over Zoom.", source: "Blind snippets" },
    ],
  },
  {
    id: "jane-street",
    name: "Jane Street",
    blurb:
      "An OCaml-centric proprietary trading firm with a strong functional-programming and probabilistic-reasoning culture. Interviews prize clear thinking, clean code, and explaining your reasoning out loud over raw algorithm trivia.",
    rounds: [
      {
        name: "Recruiter / resume screen",
        detail:
          "Background call to discuss experience and interest; language-agnostic (you don't need OCaml going in).",
      },
      {
        name: "Technical phone interview",
        detail:
          "A coding/problem-solving call, typically a LeetCode easy-to-medium core problem that grows in steps (extra constraints or follow-ups added as you go).",
      },
      {
        name: "On-site / virtual loop",
        detail:
          "Several back-to-back technical rounds mixing coding, problem decomposition, and probability/estimation discussion, often ending with a Q&A with engineers.",
      },
    ],
    emphasis: [
      "Clear verbal reasoning and communication",
      "Clean, correct, incrementally-built code",
      "Probability and conditional / Bayesian thinking",
      "Comfort with open-ended, evolving problems",
    ],
    samples: [
      "A simple coding problem with several layered follow-up steps",
      "Conditional-probability and combinatorics puzzles",
      "Fair-value / betting / EV reasoning questions",
      "Estimation and 'reason about the tradeoffs' discussions",
    ],
    sources: [
      "janestreet.com — Preparing for a Software Engineering Interview",
      "blog.janestreet.com — What a Jane Street dev interview is like",
      "janestreet.com/join-jane-street/interviewing",
      "Exponent / interviewing.io — Jane Street SWE guides",
      "Glassdoor — Jane Street SWE interviews (login-walled; snippets only)",
    ],
    tips: [
      "Use the language you're most comfortable with — Jane Street explicitly says do NOT pick OCaml to impress; no functional-programming experience is required or rewarded.",
      "Drill your strongest language until standard data-structure APIs are automatic, so you can focus on the problem.",
      "Narrate continuously — they grade how your thinking unfolds, so silent coding hurts you.",
      "Treat it as collaborative: ask clarifying questions, state assumptions, engage with hints.",
      "Expect the problem to be extended — write clean, modular code so layering on new requirements is easy.",
      "Prioritize careful, correct, readable code over racing to optimal or finishing every part — the 'journey' matters more than the final snapshot.",
      "If you've seen the question before, disclose it immediately — intellectual honesty is part of the evaluation.",
      "Note: SWE interviews are 'programming, plain and simple' — no mental-math test or betting/fair-value puzzles (those are the TRADING track).",
    ],
    experiences: [
      { text: "A described phone screen starts with a memoized function via a hash table, then the interviewer flags unbounded memory growth and asks for FIFO eviction, then pushes toward an O(1) LRU cache with a doubly-linked list — the classic extend-the-problem style.", source: "blog.janestreet.com" },
      { text: "Onsite rounds build on a single solution as requirements get layered on, with examples like generalizing Connect Four, Merkle trees with traversal extensions, or memoization → LRU.", source: "Exponent — Jane Street SWE guide" },
      { text: "Candidates report underspecified design-flavored prompts like 'Design Tetris' or 'Design a video-player API,' coding the core logic from scratch under time pressure.", source: "interviewing.io" },
      { text: "Jane Street's published guidance frames evaluation around four mantras — be nice, be clear, know your language, know what you don't know — and stresses the journey over the final solution.", source: "janestreet.com — Preparing" },
    ],
  },
  {
    id: "citadel-securities",
    name: "Citadel / Citadel Securities",
    blurb:
      "Citadel (multi-strategy hedge fund) and Citadel Securities (market maker) run rigorous, fast-paced loops. Engineering interviews stress correct, efficient code under real production constraints — latency, determinism, throughput — not just abstract puzzles.",
    rounds: [
      {
        name: "Recruiter screen",
        detail: "Background and role-fit call before the technical pipeline begins.",
      },
      {
        name: "Online assessment",
        detail:
          "Timed OA, commonly ~2-3 algorithmic problems with strict hidden tests and tight time limits; conceptually-correct-but-fails-edge-cases is treated as wrong.",
      },
      {
        name: "Live technical rounds",
        detail:
          "Multiple 45-60 min video coding rounds, often 2-3 problems each, emphasizing fast, correct, edge-case-aware solutions.",
      },
      {
        name: "On-site / final + committee",
        detail:
          "Several 45-min interviews rotating coding, system design, and behavioral, followed by a hiring-committee review.",
      },
    ],
    emphasis: [
      "Speed and correctness with strict edge-case handling",
      "Efficient code against latency/throughput realities",
      "System design grounded in production constraints",
      "Consistency of signal across coding, design, and behavioral",
    ],
    samples: [
      "Array/tree/graph/DP problems with adversarial test cases",
      "Multiple problems within one timed round",
      "System design with latency / determinism constraints",
      "Behavioral probing on disciplined problem solving",
    ],
    sources: [
      "citadelsecurities.com/careers — Our Engineering Interview Process",
      "Hiya Chatterjee, Medium — Citadel Securities HackerRank coding round",
      "techinterview.org / techprep.app / quantt.co.uk — Citadel guides",
      "Glassdoor — Citadel / Citadel Securities SWE interviews (login-walled; snippets)",
      "Wall Street Oasis — Citadel Securities interview entries",
    ],
    tips: [
      "Read the constraint sizes first — they signal the intended complexity (e.g. n up to 2e5 implies O(n log n)/O(n), not brute force).",
      "Optimize, don't just finish: aim for the best time complexity and explain trade-offs; a tidy near-optimal partial beats a sloppy passing solution.",
      "Drill edge cases relentlessly (empty input, ties, intervals touching at a point) — hidden tests target them, and near-100% pass is the expectation.",
      "Practice interval / sweep-line and binary-search-on-boundary patterns specifically — they recur in the OA.",
      "Think out loud and clarify ambiguous, scenario-based prompts before coding.",
      "For Citadel Securities / low-latency roles, go deep on C++ internals (memory model, lock-free, false sharing) — surface-level C++ is a filter.",
      "Confirm which org you're interviewing with (hedge fund vs Securities) — pipelines, weighting, and topics differ.",
      "For quant-dev tracks, prep probability / expected-value and the market-making 'trading game' (anchor a price, keep tight spreads, update on new info).",
    ],
    experiences: [
      { text: "A Citadel Securities candidate got two HackerRank problems in a 90-minute window — both interval-overlap variants with large n (one a sweep-line for max concurrent overlaps, one binary search with careful boundaries); recognition speed under time pressure was the differentiator.", source: "Hiya Chatterjee, Medium" },
      { text: "Multiple candidates describe the onsite as ~three coding rounds: two scenario-based problems (clarify → design → implement) plus one LeetCode-medium algorithm question.", source: "techprep.app / Glassdoor snippets" },
      { text: "One reported task was an optimization variant of Best Time to Buy/Sell Stock, expecting a move from O(n²) to O(n) with justification.", source: "Algo.monster snippet" },
      { text: "Candidates note a market-making 'trading game' where interviewers leak partial info about an unknown value and watch whether you anchor a reasonable price, keep tight spreads, update on new data, and manage inventory calmly.", source: "techinterview.org" },
      { text: "Guides consistently flag that Citadel (hedge fund) leans more on statistics/probability while Citadel Securities is heavier on coding and systems thinking, with separate pipelines and sub-1% acceptance.", source: "quantt.co.uk" },
    ],
  },
  {
    id: "two-sigma",
    name: "Two Sigma",
    blurb:
      "A systematic, data-science-driven hedge fund. SWE loops blend algorithms with object-oriented / system design and a meaningful behavioral component reflecting a research-engineering culture.",
    rounds: [
      {
        name: "Online assessment",
        detail:
          "Coding OA, commonly described as roughly one medium and one hard LeetCode-style problem.",
      },
      {
        name: "Technical rounds",
        detail:
          "Back-to-back technicals: one often OOP / system-design flavored, another algorithm-focused (e.g. trees), typically 45-60 min each.",
      },
      {
        name: "Behavioral + committee",
        detail:
          "Multiple behavioral interviews, then hiring-committee and management-committee review.",
      },
    ],
    emphasis: [
      "Algorithms plus object-oriented / system design",
      "Data-structure depth (trees, graphs)",
      "Communication and behavioral fit",
      "Correctness with clean structure",
    ],
    samples: [
      "Medium/hard algorithm problems with follow-ups",
      "Object-oriented design of a small system",
      "Tree/graph-centric coding questions",
      "Behavioral STAR-style questions",
    ],
    sources: [
      "Glassdoor — Two Sigma SWE interviews",
      "Wall Street Oasis — Two Sigma interview entries",
    ],
  },
  {
    id: "optiver",
    name: "Optiver",
    blurb:
      "A global market maker famous for its mental-math gate. Trading interviews are built around rapid arithmetic, expected-value reasoning, and market-making intuition; SWE roles add systems and coding.",
    rounds: [
      {
        name: "Mental-math assessment ('80 in 8')",
        detail:
          "The well-known timed arithmetic test: ~80 questions in 8 minutes (add/subtract/multiply/divide multi-digit numbers, no calculator). Often paired with a sequences test.",
      },
      {
        name: "Phone / video interview",
        detail:
          "Behavioral plus probability and EV questions; for SWE, coding and systems topics.",
      },
      {
        name: "On-site / assessment day",
        detail:
          "Half or full day with probability, trading simulations / market-making games, behavioral, and sometimes a second mental-math round.",
      },
    ],
    emphasis: [
      "Fast, accurate mental arithmetic",
      "Expected-value reasoning under time pressure",
      "Market-making and spread intuition",
      "Probability and pattern recognition",
    ],
    samples: [
      "Rapid multi-digit arithmetic drills (Zetamac-style)",
      "Number-sequence / pattern completion",
      "EV of simple dice/coin games",
      "Make-a-market / quoting games",
    ],
    sources: [
      "Glassdoor — Optiver Trading interviews",
      "Tradermath — Optiver interview guide",
      "QuantPrep — Optiver 8-in-80 test",
    ],
  },
  {
    id: "imc",
    name: "IMC Trading",
    blurb:
      "A technology-driven market maker. SWE loops are algorithm- and C++-heavy with strong systems/OS focus; trading loops add math, probability, and group exercises.",
    rounds: [
      {
        name: "Online assessment",
        detail:
          "For SWE, commonly ~2 HackerRank-style algorithmic problems in ~90 minutes (reported pass rates are low). Trading tracks add math/logic OAs.",
      },
      {
        name: "Behavioral / recruiter call",
        detail:
          "A conversational call about your background and the role after passing the OA.",
      },
      {
        name: "First-round technical",
        detail:
          "Live problem-solving with a trader or engineer; SWE focuses on C++ (or Java), memory management, OS fundamentals, and data structures.",
      },
      {
        name: "Assessment day (super day)",
        detail:
          "On-site with ~4-5 technical and behavioral stations; some tracks include a group discussion.",
      },
    ],
    emphasis: [
      "Algorithms and data structures",
      "C++ / systems and memory management",
      "OS fundamentals",
      "Probability and group problem-solving (trading)",
    ],
    samples: [
      "Two timed HackerRank-style algorithm problems",
      "C++ memory-management and OS questions",
      "Pen-and-paper DSA problems",
      "Probability / market-making exercises (trading track)",
    ],
    sources: [
      "careers.imc.com — Recruitment / Hiring Process",
      "Glassdoor — IMC Trading SWE interviews",
      "Wall Street Oasis — IMC interview entries",
    ],
  },
  {
    id: "sig",
    name: "Susquehanna International Group (SIG)",
    blurb:
      "A major options market maker famous for its poker-and-EV culture. Trader interviews probe expected-value decision-making and game theory; SWE roles are LeetCode-style coding loops.",
    rounds: [
      {
        name: "Online assessment",
        detail:
          "For trading, a timed quantitative test (e.g. ~20-min logic/brainteaser set: EV, systems of equations, grid/path puzzles). For SWE, medium-hard LeetCode-style coding.",
      },
      {
        name: "Phone interview",
        detail:
          "Background plus problem-solving / probability questions.",
      },
      {
        name: "Technical interview(s)",
        detail:
          "Probability- and EV-heavy rounds for trading; coding rounds for SWE.",
      },
      {
        name: "Final round / super day",
        detail:
          "On-site mixing technical and HR; trader candidates almost always do a poker / game-theory exercise testing EV reasoning, bet sizing, and info asymmetry under pressure.",
      },
    ],
    emphasis: [
      "Expected-value over most-likely-outcome thinking",
      "Probability and decision theory",
      "Bet sizing and information asymmetry (poker mindset)",
      "Coding fundamentals (SWE track)",
    ],
    samples: [
      "EV puzzles where the modal outcome isn't the best decision (Monty Hall-style)",
      "Make-a-market and betting games",
      "Poker / game-theory decision exercises",
      "Medium-hard coding problems (SWE)",
    ],
    sources: [
      "Tradermath — SIG interview guide",
      "Glassdoor — Susquehanna International Group interviews",
      "Wall Street Oasis — SIG interview entries",
    ],
  },
  {
    id: "drw",
    name: "DRW",
    blurb:
      "A diversified principal trading firm. Loops are moderate-to-hard with an in-person super day; SWE roles reward depth in advanced CS, trading roles reward coding plus problem-solving.",
    rounds: [
      {
        name: "Online assessment",
        detail:
          "Proctored OA; for trading commonly described as ~six coding/problem-solving questions.",
      },
      {
        name: "Technical interview",
        detail:
          "A round with an engineer on the team (SWE) or a problem-solving interview (trading).",
      },
      {
        name: "Super day (on-site)",
        detail:
          "Flown to Chicago for several back-to-back technical and behavioral rounds; expenses covered.",
      },
    ],
    emphasis: [
      "Advanced CS depth (SWE)",
      "Correctness and problem-solving",
      "Behavioral / team fit",
      "Performance under back-to-back rounds",
    ],
    samples: [
      "In-depth algorithm and CS-concept questions",
      "Multi-question coding OA",
      "System / design discussion",
      "Behavioral questions on the super day",
    ],
    sources: [
      "drw.com/updates/insights — Preparing for DRW's Final Round",
      "Glassdoor — DRW SWE interviews",
    ],
  },
  {
    id: "jump-trading",
    name: "Jump Trading",
    blurb:
      "A high-frequency trading firm where C++ is the primary, non-negotiable language for SWE. Loops escalate in difficulty, ending in deep architecture/research-design rounds.",
    rounds: [
      {
        name: "Online assessment",
        detail:
          "Algorithmic coding OA (HackerRank or proprietary), commonly ~90-120 min with 2-3 hard problems.",
      },
      {
        name: "Phone screens",
        detail:
          "Two-to-three 45-60 min calls: deep live coding on a shared editor plus systems design.",
      },
      {
        name: "On-site super day",
        detail:
          "Five-to-seven back-to-back 45-60 min rounds (Chicago/NY/London), deliberately ramping from easier early rounds to the hardest architecture/research-design rounds last.",
      },
    ],
    emphasis: [
      "C++ proficiency (required for SWE)",
      "Correctness, speed, and edge-case handling",
      "Systems and low-level performance",
      "Architecture / research design at the top end",
    ],
    samples: [
      "Hard algorithmic problems under time pressure",
      "Live shared-editor coding with follow-ups",
      "Systems-design and low-latency discussions",
      "Architecture / research-design deep dives",
    ],
    sources: [
      "Glassdoor — Jump Trading SWE interviews",
      "Blind — Jump Trading interview process (SWE)",
      "Wall Street Oasis — Jump Trading interview entries",
    ],
  },
  {
    id: "akuna-capital",
    name: "Akuna Capital",
    blurb:
      "An options market maker with a structured trader-training program, so trading interviews weight raw aptitude (mental math, probability, decision-making) over prior finance knowledge.",
    rounds: [
      {
        name: "Online assessments",
        detail:
          "An 80-in-8 mental-math test plus a sequences test (reported as ~24 questions in ~12 min).",
      },
      {
        name: "Recorded / video interview",
        detail:
          "Asynchronous interview probing background and thinking process.",
      },
      {
        name: "Technical phone interview",
        detail:
          "With a trader: brainteasers, market-making games, probability, and basic derivatives.",
      },
      {
        name: "Final round (on-site, Chicago)",
        detail:
          "~4-5 back-to-back 45-min interviews plus a trading game and team lunch.",
      },
    ],
    emphasis: [
      "Heavy mental math",
      "Probability and EV reasoning",
      "Market-making / trading-game intuition",
      "Raw aptitude and decision-making over finance knowledge",
    ],
    samples: [
      "80-in-8 arithmetic and number-sequence tests",
      "Dice/card trading games",
      "Probability and statistics questions",
      "Basic derivatives / instrument questions",
    ],
    sources: [
      "Tradermath — Akuna Capital interview guide",
      "Glassdoor — Akuna Capital Trading interviews",
      "Wall Street Oasis — Akuna Capital interview entries",
    ],
  },
  {
    id: "five-rings",
    name: "Five Rings Capital",
    blurb:
      "A quantitative trading firm with a math- and game-theory-heavy trader loop. Public reports emphasize fast-but-accurate mental math and probability under tight per-question time limits.",
    rounds: [
      {
        name: "Online assessment / recruiter call",
        detail:
          "Math, probability, brainteasers, and quick-math questions; reports describe a brief behavioral piece plus ~10 rapid questions on a ~30-sec-each timer (accuracy prioritized over raw speed).",
      },
      {
        name: "Technical interviews (3-4)",
        detail:
          "A series of virtual rounds focused on probability, stochastic processes, and game theory.",
      },
      {
        name: "Final rounds",
        detail:
          "Senior rounds, commonly described as one with the head of trading and one with a founder.",
      },
    ],
    emphasis: [
      "Fast, accurate mental math under a per-question timer",
      "Probability and stochastic reasoning",
      "Game theory",
      "Estimation / guesstimation",
    ],
    samples: [
      "Rapid-fire math/probability with ~30-sec limits",
      "Guesstimation (e.g. count of a digit over a range)",
      "Stochastic-process reasoning",
      "Game-theory decision problems",
    ],
    sources: [
      "Glassdoor — Five Rings Quantitative Trader interviews",
      "Wall Street Oasis — Five Rings Capital interview entries",
      "Medium — ex-Five Rings recruiter writeup",
    ],
  },
  {
    id: "hudson-bay-capital",
    name: "Hudson Bay Capital",
    blurb:
      "A multi-strategy investment manager. Public, role-specific interview detail is thin and easily confused with the unrelated retailer 'Hudson's Bay' — treat the outline below as approximate and verify with current first-hand sources.",
    rounds: [
      {
        name: "Background / screen",
        detail:
          "Initial conversation on history and experience.",
      },
      {
        name: "Technical / strategy rounds",
        detail:
          "Quantitative assessment and strategy discussion; some reports mention a case study and markets-focused conversations.",
      },
      {
        name: "Final rounds",
        detail:
          "Meet-the-team rounds and follow-ups; one report describes a long multi-round process spread over months.",
      },
    ],
    emphasis: [
      "Quantitative / analytical aptitude",
      "Markets and strategy understanding",
      "Case-study reasoning",
      "Team fit",
    ],
    samples: [
      "Background and motivation questions",
      "Markets / strategy discussion",
      "Case-study analysis",
      "Quantitative reasoning",
    ],
    sources: [
      "Glassdoor — Hudson Bay Capital Management interviews (limited)",
      "Levels.fyi / Quantt — Hudson Bay Capital Management profiles",
    ],
  },
];
