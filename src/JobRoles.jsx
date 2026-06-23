import { useState } from "react";

const ROLE_GROUPS = [
  {
    group: "Quant Developer / Quant SWE",
    color: "#2f8d46",
    border: "#2f8d46",
    blurb: "The most natural pivot from a software engineering seat. You build the systems researchers and traders run on.",
    roles: [
      {
        company: "Quant Developer",
        title: "Quant Software Engineer (core platform)",
        location: "Pod & prop shops",
        track: "primary",
        what: "Build and own the engineering backbone of a trading desk: market-data ingestion, order/execution gateways, backtesting and simulation frameworks, position/PnL services, and the research-to-production pipeline. You are the bridge between researchers (who write signals) and live trading (which must not break). At a pod like Millennium this often means owning a desk's tooling end to end; the work is real systems engineering, not glue scripts.",
        skills: [
          "Python as the primary language — clean APIs, async I/O, pandas/numpy/polars, profiling and vectorization, packaging.",
          "Data engineering: time-series storage, parquet/Arrow, kdb/clickhouse exposure, idempotent pipelines, handling messy vendor feeds.",
          "Systems design for trading: order book modeling, market-data fan-out, gateways, idempotency, backtester vs live parity.",
          "Solid CS fundamentals: data structures & algorithms, concurrency, latency vs throughput trade-offs.",
          "C++ shows up as production reality at some HFT shops for the hot path — good to recognize, not something you need to study to break in on the Python side.",
        ],
        interview: "Recruiter screen → 1-2 Python/DSA coding rounds (LeetCode-medium flavor, but cleaner-code expectations than big tech) → a system design round centered on something trading-shaped (design an order book, a market-data feed handler, a backtester, a rate-limited gateway) → often a lighter probability/brainteaser round → team/manager fit. Some shops add a take-home or pair-programming session.",
        screen: "Can you write correct, idiomatic Python under time pressure? Do you reason about edge cases, failure modes, and data integrity the way someone touching real money must? Do you understand enough markets/microstructure to model an order book without hand-holding? They screen hard for engineering maturity and ownership over raw algorithm-puzzle speed.",
        comp: "Strong total comp — base often comparable to senior big-tech, with bonus tied to desk/firm performance. At top pods and prop shops all-in can exceed FAANG, with more variance because the bonus is performance-linked.",
      },
      {
        company: "Quant Developer",
        title: "Execution / Low-Latency Services Engineer",
        location: "HFT & market-making",
        track: "primary",
        what: "Same family as above but tilted toward the latency-sensitive path: smart order routers, execution algos, feed handlers, and the services that sit microseconds from the exchange. Python is heavily used for the control plane, tooling, and research harnesses around these systems even where the hot path is native.",
        skills: [
          "Everything from core quant dev, plus a sharper focus on performance, measurement, and tail latency.",
          "Comfort reasoning about queues, backpressure, and what happens under bursty load.",
          "Understanding of exchange connectivity and market microstructure at a practical level.",
        ],
        interview: "Very similar loop — Python coding, a latency-flavored design round, and probability. Expect deeper follow-ups on 'what breaks at scale / under load' and how you'd measure it.",
        screen: "Precision and a measurement mindset. They want engineers who instinctively ask 'how fast, how do we know, and what's the failure mode' rather than guessing.",
        comp: "Top of the quant-dev band; market-making and HFT shops pay aggressively for strong systems engineers.",
      },
    ],
  },
  {
    group: "Quant Researcher / Quant Analyst",
    color: "#1a7f37",
    border: "#1a7f37",
    blurb: "The signal side. Heavier on statistics and probability, lighter on production systems — though Python is still the daily tool.",
    roles: [
      {
        company: "Quant Researcher",
        title: "Quantitative Researcher (alpha / signal research)",
        location: "Pod & prop shops",
        track: "research",
        what: "Hunt for predictive signal: form hypotheses about what moves prices, build features from data, fit and validate models, and turn surviving ideas into strategies. The day-to-day is research in Python — exploratory analysis, statistical testing, and rigorous backtesting with brutal attention to overfitting and look-ahead bias. Researchers lean on quant devs to productionize what works.",
        skills: [
          "Probability & statistics at depth: distributions, expectation/variance, conditional probability, hypothesis testing, regression.",
          "Time-series and ML: stationarity, cross-validation that respects time, regularization, feature engineering, awareness of overfitting.",
          "Python for research: numpy, pandas/polars, scikit-learn, statsmodels, notebook-to-pipeline discipline.",
          "Scientific skepticism — distinguishing real edge from noise and data-mined artifacts.",
        ],
        interview: "Probability-heavy. Expect multiple rounds of probability and statistics problems (combinatorics, expected value, Bayesian reasoning, Markov chains), a stats/ML discussion, often a data/research case or take-home where you analyze a dataset in Python, and a discussion of your past research. Coding exists but is secondary to quantitative reasoning.",
        screen: "Raw quantitative horsepower and research judgment. Can you reason precisely under uncertainty, design an honest experiment, and avoid fooling yourself? They probe how you'd validate a signal and what would make you distrust a good-looking backtest.",
        comp: "High and highly performance-linked. Base similar to quant dev; bonus can dwarf it when your research makes money, with corresponding variance.",
      },
      {
        company: "Quant Analyst",
        title: "Quantitative Analyst (modeling / risk / desk support)",
        location: "Banks, pods, asset managers",
        track: "research",
        what: "A broader, sometimes more applied cousin of the researcher: pricing and risk modeling, desk analytics, strategy support, and turning quantitative questions from traders/PMs into models and tools. More common as a title at banks and multi-strats; scope ranges from near-research to near-dev.",
        skills: [
          "Strong applied statistics and probability.",
          "Python for modeling and analytics; comfort with financial/market data.",
          "Communication — translating between traders/PMs and quantitative work.",
        ],
        interview: "Probability and stats screening similar to the researcher track, plus more domain/markets questions and a fit-with-the-desk emphasis. Often a Python data exercise.",
        screen: "Quantitative competence plus the ability to work directly with a desk and explain your reasoning clearly.",
        comp: "Solid; varies widely by employer — pods/prop pay more than banks for comparable seats.",
      },
    ],
  },
  {
    group: "Quant Trader",
    color: "#C084FC",
    border: "#7C3AED",
    blurb: "Pricing risk in real time. Least code-centric of the quant roles — the bar is mental speed, probabilistic intuition, and markets feel.",
    roles: [
      {
        company: "Quant Trader",
        title: "Quantitative / Market-Making Trader",
        location: "Prop & market-making",
        track: "trading",
        what: "Quote and manage risk in real time — make markets, run execution, and decide when to lean into or out of positions. You think in expected value and probabilities continuously, lean on the researchers' and devs' tooling, and live with immediate feedback on every decision. Strong programming helps you automate and analyze, but the core skill is fast, sound decision-making under uncertainty.",
        skills: [
          "Fast, accurate mental math and estimation under pressure.",
          "Probability and expected-value intuition — sizing bets, reading odds, updating on new information.",
          "Markets and microstructure intuition; comfort with risk and being wrong often but profitably.",
          "Enough Python to analyze your own trading and build small tools.",
        ],
        interview: "Famous for probability and mental-math games: rapid arithmetic drills, EV and betting/market-making games (someone makes a market, you decide to buy/sell), poker-style and Monty-Hall-style probability puzzles, and sequential games that test how you update and size under uncertainty. Often a markets-curiosity conversation. Coding is minimal.",
        screen: "Speed, composure, and calibrated probabilistic thinking. Do you stay sharp under pressure, size decisions sensibly, and learn fast from feedback? They want people who are comfortable acting on edge without complete information.",
        comp: "Among the highest ceilings in the industry and the most variance — heavily tied to the book/desk you run. Top traders earn far above any engineering seat; early seats carry more uncertainty.",
      },
    ],
  },
  {
    group: "Pod / Multi-Strat vs Prop / HFT",
    color: "#FFB86C",
    border: "#9A5A1E",
    blurb: "You already sit at a multi-strat pod (Millennium). Here's how the two worlds differ so you target the right loop and culture.",
    roles: [
      {
        company: "Pod / Multi-Strat",
        title: "Millennium · Citadel · Point72 style",
        location: "Multi-strategy hedge funds",
        track: "context",
        what: "Capital is allocated to many semi-independent PM 'pods,' each running its own strategies under tight risk limits. Quant devs and researchers often embed with a specific desk/PM, so the work is closer to that desk's needs and you see business context directly. Breadth of strategies, more business-facing collaboration, and a strong risk-management culture. Your current Millennium SWE seat is the most credible internal/lateral bridge into a pod quant-dev role.",
        skills: [
          "Pragmatic Python engineering and data work tied to a desk's strategies.",
          "Comfort with ambiguity and shifting priorities as PMs' needs change.",
          "Relationship and communication skills — you serve specific PMs/traders.",
        ],
        interview: "Loops resemble the quant-dev/researcher tracks above but with more team/desk fit and 'how do you work with a PM' emphasis. Bar is high on engineering and judgment; somewhat less obsessive about nanosecond latency than pure HFT.",
        screen: "Strong engineering plus the ability to partner with a desk and operate under risk discipline.",
        comp: "Excellent; bonus is tied to your pod's and the firm's performance, so upside and variance track the desk you support.",
      },
      {
        company: "Prop / HFT",
        title: "Jane Street · HRT · Optiver style",
        location: "Proprietary trading firms",
        track: "context",
        what: "Trade the firm's own capital, often in market-making and high-frequency strategies. Flatter, deeply technical cultures where engineering, research, and trading sit very close together. The intellectual bar — especially on probability, problem-solving, and clean code — is famously high, and the interview loops are correspondingly puzzle- and rigor-heavy. C++ is the production reality on the hot path at several of these shops, but plenty of Python-centric tooling and research work exists alongside it.",
        skills: [
          "Exceptional fundamentals: probability, clean problem-solving, careful coding.",
          "For the Python-side seats: strong Python plus data/research or systems chops.",
          "Genuine curiosity about markets and a high tolerance for hard puzzles.",
        ],
        interview: "Multi-stage and demanding: several rounds of probability/brainteasers, strong coding (clean and correct, not just passing), and design/reasoning rounds. Expect a higher puzzle density than at a pod.",
        screen: "Sheer problem-solving ability and rigor. They optimize for raw talent and clean thinking over domain experience, then train the rest.",
        comp: "Top of the market, especially at the most selective firms; structure is more firm-wide than single-pod-linked.",
      },
    ],
  },
];

const TRACK_TAGS = {
  primary: { label: "Best fit from SWE", color: "#2f8d46", bg: "rgba(111,168,255,.12)", border: "rgba(111,168,255,.35)" },
  research: { label: "Probability-heavy", color: "#1a7f37", bg: "rgba(95,215,158,.12)", border: "rgba(95,215,158,.35)" },
  trading: { label: "Mental-math / EV", color: "#C084FC", bg: "rgba(192,132,252,.12)", border: "rgba(192,132,252,.35)" },
  context: { label: "Context", color: "#FFB86C", bg: "rgba(255,184,108,.12)", border: "rgba(255,184,108,.35)" },
};

const TOTAL_ROLES = ROLE_GROUPS.reduce((s, g) => s + g.roles.length, 0);

function Section({ heading, color, items }) {
  if (!items) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: 11, fontWeight: 800, letterSpacing: 1.2,
        textTransform: "uppercase", color, marginBottom: 5,
        fontFamily: "system-ui",
      }}>{heading}</div>
      {Array.isArray(items) ? (
        <ul style={{ margin: 0, paddingLeft: 18, color: "#9DB2D2",
          fontSize: 13, lineHeight: 1.55 }}>
          {items.map((it, i) => <li key={i} style={{ marginBottom: 3 }}>{it}</li>)}
        </ul>
      ) : (
        <div style={{ fontSize: 13.5, color: "#9DB2D2", lineHeight: 1.6 }}>{items}</div>
      )}
    </div>
  );
}

export default function JobRoles({ onBack }) {
  const [expandedGroup, setExpandedGroup] = useState(0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f6f8fa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif",
      color: "#1f2328", padding: "0 0 80px 0",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
        .role-card { animation: fadeUp .35s ease both; }
        .role-card:hover { background: #f3f4f6; }
        .group-btn:hover { transform: translateX(3px); }
        ::-webkit-scrollbar { width: 9px; }
        ::-webkit-scrollbar-track { background: #ffffff; }
        ::-webkit-scrollbar-thumb { background: #d0d7de; border-radius: 5px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #d0d7de",
        background: "#ffffff",
        backdropFilter: "blur(6px)", padding: "34px 28px 26px",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <button onClick={onBack} style={{
            background: "#eef6f0", border: "1px solid #2f8d46",
            color: "#2f8d46", borderRadius: 20, padding: "5px 14px",
            fontSize: 12, cursor: "pointer", fontFamily: "system-ui",
            fontWeight: 600, marginBottom: 16,
          }}>← Back to Tracker</button>

          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase",
                color: "#57606a", marginBottom: 8, fontFamily: "system-ui" }}>
                SWE → Quant · Roles Reference
              </div>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700,
                color: "#111418", lineHeight: 1.15 }}>
                Quant Roles & Interview Loops
              </h1>
            </div>
            <div style={{ textAlign: "right", fontFamily: "system-ui" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#2f8d46",
                lineHeight: 1 }}>{TOTAL_ROLES}</div>
              <div style={{ fontSize: 12, color: "#57606a", marginTop: 4 }}>
                roles across {ROLE_GROUPS.length} tracks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 920, margin: "26px auto 0", padding: "0 22px" }}>
        {/* Profile / orientation */}
        <div style={{
          padding: "16px 20px", marginBottom: 20,
          background: "#ffffff",
          border: "1px solid #d0d7de", borderRadius: 14,
          fontSize: 13.5, lineHeight: 1.65, color: "#57606a",
        }}>
          <strong style={{ color: "#2f8d46" }}>Where you stand:</strong>{" "}
          Software Engineer at <strong>Millennium</strong> (multi-strategy pod hedge fund) aiming to move into quant.
          Your strongest, most credible pivot is <strong>Quant Developer / Quant SWE</strong> — it leans directly on
          your engineering experience. <strong>Python</strong> is the language to emphasize across the dev and research
          coding rounds; probability and stats are the muscles to build for the research and trading loops.
        </div>

        {ROLE_GROUPS.map((grp, gi) => {
          const isOpen = expandedGroup === gi;
          return (
            <div key={gi} style={{ marginBottom: 16 }}>
              <button className="group-btn" onClick={() =>
                setExpandedGroup(isOpen ? null : gi)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: isOpen
                    ? "#eef6f0"
                    : "#ffffff",
                  border: `1px solid ${isOpen ? grp.border : "#d0d7de"}`,
                  borderRadius: 14, padding: "18px 22px", color: "#1f2328",
                  transition: "all .2s ease", display: "flex",
                  alignItems: "center", gap: 18,
                }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: grp.color,
                  fontFamily: "system-ui", minWidth: 28,
                }}>{grp.roles.length}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{grp.group}</div>
                  <div style={{ fontSize: 12.5, color: "#57606a",
                    marginTop: 3, fontFamily: "system-ui" }}>
                    {grp.blurb}
                  </div>
                </div>
                <div style={{ fontSize: 18, color: grp.color,
                  transform: isOpen ? "rotate(90deg)" : "none",
                  transition: "transform .2s" }}>›</div>
              </button>

              {isOpen && (
                <div style={{ marginTop: 10, display: "flex",
                  flexDirection: "column", gap: 8 }}>
                  {grp.roles.map((role, ri) => {
                    const tt = TRACK_TAGS[role.track];
                    return (
                      <div key={ri} className="role-card" style={{
                        background: "#ffffff",
                        border: "1px solid #d0d7de",
                        borderRadius: 13, padding: "16px 18px",
                        animationDelay: `${ri * 0.04}s`,
                      }}>
                        <div style={{ display: "flex", alignItems: "baseline",
                          gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, fontWeight: 800,
                            fontFamily: "system-ui", color: grp.color,
                            letterSpacing: 1 }}>{role.company.toUpperCase()}</span>
                          <span style={{ fontSize: 16, fontWeight: 700,
                            color: "#111418" }}>{role.title}</span>
                          <span style={{ marginLeft: "auto", display: "flex", gap: 6,
                            alignItems: "center", flexShrink: 0 }}>
                            {tt && (
                              <span style={{ fontSize: 10.5, fontWeight: 700,
                                fontFamily: "system-ui", color: tt.color,
                                background: tt.bg, border: `1px solid ${tt.border}`,
                                borderRadius: 10, padding: "2px 10px",
                                whiteSpace: "nowrap", letterSpacing: 0.3 }}>
                                {tt.label}
                              </span>
                            )}
                            <span style={{ fontSize: 11.5,
                              color: "#57606a", fontFamily: "system-ui",
                              border: "1px solid #d0d7de", borderRadius: 10,
                              padding: "2px 10px", whiteSpace: "nowrap" }}>
                              {role.location}
                            </span>
                          </span>
                        </div>

                        <Section heading="What the role does" color={grp.color} items={role.what} />
                        <Section heading="Core skills" color={grp.color} items={role.skills} />
                        <Section heading="Interview process / loop" color={grp.color} items={role.interview} />
                        <Section heading="What they screen for" color={grp.color} items={role.screen} />
                        {role.comp && <Section heading="Comp framing" color={grp.color} items={role.comp} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Game plan */}
        <div style={{
          marginTop: 28, padding: "20px 24px",
          background: "#ffffff",
          border: "1px solid #d0d7de", borderRadius: 14,
          fontSize: 14, lineHeight: 1.65, color: "#57606a",
        }}>
          <strong style={{ color: "#1a7f37" }}>Suggested path from your SWE seat:</strong>
          <ol style={{ margin: "10px 0 0", paddingLeft: 22, color: "#1f2328" }}>
            <li><strong>Quant Developer / Quant SWE</strong> — primary target; your engineering background carries most of the loop.</li>
            <li><strong>Lean on the internal bridge</strong> — being a Millennium SWE is real credibility for a pod quant-dev seat; explore lateral moves alongside external ones.</li>
            <li><strong>Sharpen Python</strong> — idiomatic, fast, clean; numpy/pandas plus the DSA you already know.</li>
            <li><strong>Learn trading system design</strong> — order books, market-data feeds, backtesters, gateways.</li>
            <li><strong>Build probability fluency</strong> — enough for the dev round now; deeper if you drift toward researcher or trader.</li>
          </ol>
        </div>

        <div style={{
          marginTop: 16, padding: "16px 24px",
          background: "#ffffff",
          border: "1px solid #d0d7de", borderRadius: 14,
          fontSize: 13, lineHeight: 1.6, color: "#57606a",
        }}>
          <strong style={{ color: "#9a6700" }}>Note:</strong>{" "}
          Comp figures are framing, not quotes — quant pay is heavily performance-linked and varies by firm,
          desk, and year. Loops differ between shops; treat each track here as the shape to prepare for, then
          tailor once you know which firm and seat you're interviewing for.
        </div>
      </div>
    </div>
  );
}
