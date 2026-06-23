// ---------------------------------------------------------------------------
//  FlightMode.jsx · fully-offline practice for a 10-hour flight.
//  Four modes, no network: Coding (Python in-browser via vendored Pyodide),
//  Brainteasers/Probability, Mental Math drills, and Quant System Design.
//  Progress persists to localStorage via the `flight` slice in storage.js.
// ---------------------------------------------------------------------------

import { useMemo, useRef, useState } from "react";
import { C, Btn, Panel, SectionTitle, wrap } from "./ui/theme.jsx";
import { CODING } from "./data/flight/coding.js";
import { BRAINTEASERS } from "./data/flight/brainteasers.js";
import { SYS_DESIGN } from "./data/flight/systemDesign.js";
import { runProblem, isPyReady } from "./flight/pyRunner.js";
import { genQuestion, checkAnswer, median, LEVELS } from "./flight/mentalMath.js";
import GuidesMode from "./flight/GuideView.jsx";
import { Diagram } from "./flight/diagrams.jsx";
import { deriveDiagram } from "./flight/deriveDiagram.js";
import CodeEditor from "./flight/CodeEditor.jsx";

const DIFF_COLOR = { Easy: C.green, Medium: C.amber, Hard: C.red };
const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const MODES = [
  ["coding", "⌨️ Coding"],
  ["guide", "📖 DSA Guide"],
  ["teasers", "🧠 Brainteasers"],
  ["math", "🔢 Mental Math"],
  ["design", "🏗 System Design"],
];

export default function FlightMode({ flight, setFlight }) {
  const [mode, setMode] = useState("coding");

  return (
    <div style={wrap}>
      <SectionTitle
        kicker="Offline · no wifi required"
        title="✈️ Flight Mode"
        right={<OfflineBadge />}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {MODES.map(([k, label]) => (
          <button key={k} onClick={() => setMode(k)} style={tab(mode === k)}>{label}</button>
        ))}
      </div>
      {mode === "coding" && <CodingMode flight={flight} setFlight={setFlight} />}
      {mode === "guide" && <GuidesMode />}
      {mode === "teasers" && <TeasersMode flight={flight} setFlight={setFlight} />}
      {mode === "math" && <MathMode flight={flight} setFlight={setFlight} />}
      {mode === "design" && <DesignMode flight={flight} setFlight={setFlight} />}
    </div>
  );
}

function OfflineBadge() {
  return (
    <span style={{ fontFamily: C.sys, fontSize: 12, color: C.faint,
      border: `1px solid ${C.border}`, borderRadius: 18, padding: "5px 11px" }}>
      Runs 100% locally · Python via vendored Pyodide
    </span>
  );
}

const tab = (active) => ({
  background: active ? C.blue : "rgba(255,255,255,.04)",
  color: active ? "#08101F" : "#AFC3E0",
  border: `1px solid ${active ? C.blue : "#2A3C56"}`,
  borderRadius: 20, padding: "8px 16px", fontSize: 13.5, fontWeight: 700,
  cursor: "pointer", fontFamily: C.sys,
});

const pill = (color) => ({
  fontFamily: C.sys, fontSize: 11, fontWeight: 700, color,
  border: `1px solid ${color}55`, background: `${color}14`,
  borderRadius: 12, padding: "2px 9px",
});

// ===========================================================================
//  CODING
// ===========================================================================
function CodingMode({ flight, setFlight }) {
  const topics = useMemo(() => ["All", ...new Set(CODING.map((p) => p.topic))], []);
  const [topic, setTopic] = useState("All");
  const [selId, setSelId] = useState(CODING[0].id);

  const list = useMemo(
    () => (topic === "All" ? CODING : CODING.filter((p) => p.topic === topic)),
    [topic],
  );
  // Group the (filtered) list into an ordered topic directory so each topic
  // gets its own header, NeetCode-roadmap style.
  const groups = useMemo(() => {
    const order = [];
    const byTopic = new Map();
    for (const p of list) {
      if (!byTopic.has(p.topic)) { byTopic.set(p.topic, []); order.push(p.topic); }
      byTopic.get(p.topic).push(p);
    }
    return order.map((t) => ({ topic: t, problems: byTopic.get(t) }));
  }, [list]);
  const problem = CODING.find((p) => p.id === selId) || list[0];
  const solvedCount = Object.values(flight.coding || {}).filter((c) => c.solved).length;
  const isSolved = (p) => !!flight.coding?.[p.id]?.solved;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>
      <Panel style={{ padding: 12 }}>
        <div style={{ fontFamily: C.sys, fontSize: 12, color: C.muted, marginBottom: 8 }}>
          {solvedCount}/{CODING.length} solved
        </div>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} style={selectStyle}>
          {topics.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", maxHeight: 460, overflowY: "auto" }}>
          {groups.map((g) => {
            const solved = g.problems.filter(isSolved).length;
            return (
              <div key={g.topic}>
                <div style={{
                  position: "sticky", top: 0, zIndex: 1, background: C.panel,
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  padding: "8px 6px 5px", marginTop: 2,
                  fontFamily: C.sys, fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                  textTransform: "uppercase", color: C.faint,
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <span>{g.topic}</span>
                  <span style={{ color: solved === g.problems.length ? C.green : C.faint, fontWeight: 600 }}>
                    {solved}/{g.problems.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "4px 0 6px" }}>
                  {g.problems.map((p) => {
                    const st = flight.coding?.[p.id];
                    const active = p.id === problem.id;
                    return (
                      <button key={p.id} onClick={() => setSelId(p.id)} style={{
                        textAlign: "left", background: active ? "#16263f" : "transparent",
                        border: `1px solid ${active ? C.borderHi : "transparent"}`,
                        borderRadius: 8, padding: "7px 9px", cursor: "pointer", color: C.text,
                        fontFamily: C.sys, fontSize: 12.5, display: "flex", gap: 7, alignItems: "center",
                      }}>
                        <span>{st?.solved ? "✅" : st?.attempts ? "🟡" : "⚪️"}</span>
                        <span style={{ flex: 1 }}>{p.title}</span>
                        <span style={{ color: DIFF_COLOR[p.difficulty], fontSize: 10 }}>{p.difficulty[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
      <CodingProblem key={problem.id} problem={problem} flight={flight} setFlight={setFlight} />
    </div>
  );
}

function CodingProblem({ problem, flight, setFlight }) {
  const saved = flight.coding?.[problem.id];
  const diagram = useMemo(() => deriveDiagram(problem), [problem]);
  const [code, setCode] = useState(saved?.lastCode ?? problem.starter);
  const [out, setOut] = useState(null);     // run result
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [showSol, setShowSol] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const patchProblem = (patch) => setFlight((prev) => ({
    ...prev,
    coding: { ...prev.coding, [problem.id]: { ...(prev.coding?.[problem.id] || {}), ...patch } },
  }));

  const run = async () => {
    setRunning(true); setOut(null);
    setStatus(isPyReady() ? "Running…" : "Loading Python runtime (first run ~a few sec, all local)…");
    try {
      const res = await runProblem(code, problem, setStatus);
      setOut(res); setStatus("");
      patchProblem({
        lastCode: code,
        attempts: (saved?.attempts || 0) + 1,
        solved: saved?.solved || res.allPass,
      });
    } catch (err) {
      setStatus("");
      setOut({ fatal: String(err?.message || err) });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: "#F4F8FE" }}>{problem.title}</h2>
          <span style={pill(DIFF_COLOR[problem.difficulty])}>{problem.difficulty}</span>
          <span style={pill(C.blue)}>{problem.topic}</span>
          {saved?.solved && <span style={pill(C.green)}>✓ solved</span>}
        </div>
        <pre style={statementStyle}>{problem.statement}</pre>
        {diagram && <Diagram {...diagram} />}
      </Panel>

      <Panel style={{ padding: 0, overflow: "hidden" }}>
        <CodeEditor value={code} onChange={setCode} />
        <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: `1px solid ${C.border}`,
          alignItems: "center", flexWrap: "wrap" }}>
          <Btn kind="primary" onClick={run} disabled={running}>
            {running ? "Running…" : "▶ Run tests"}
          </Btn>
          <Btn onClick={() => setCode(problem.starter)} disabled={running}>↺ Reset code</Btn>
          <Btn onClick={() => setShowHint((v) => !v)}>{showHint ? "Hide hint" : "💡 Hint"}</Btn>
          <Btn onClick={() => setShowSol((v) => !v)}>{showSol ? "Hide solution" : "👁 Solution"}</Btn>
          <span style={{ fontFamily: C.sys, fontSize: 11.5, color: C.faint }}>
            {problem.tests.length} sample · 🔒 {(problem.hidden || []).length} hidden
          </span>
          {status && <span style={{ fontFamily: C.sys, fontSize: 12, color: C.muted }}>{status}</span>}
        </div>
      </Panel>

      {showHint && <Panel style={{ borderColor: "#3a3320" }}>
        <span style={{ color: C.amber, fontFamily: C.sys, fontSize: 13 }}>💡 {problem.hint}</span>
      </Panel>}

      {out && <RunOutput out={out} />}

      {showSol && <Panel>
        <div style={{ fontFamily: C.sys, fontSize: 12, color: C.faint, marginBottom: 6 }}>REFERENCE SOLUTION</div>
        <pre style={{ ...statementStyle, fontFamily: mono, color: "#C9E2C9" }}>{problem.solution}</pre>
      </Panel>}
    </div>
  );
}

function RunOutput({ out }) {
  if (out.fatal) {
    return <Panel style={{ borderColor: "#5A2A38" }}>
      <div style={{ color: C.red, fontFamily: C.sys, fontWeight: 700, marginBottom: 6 }}>Runtime failed to load</div>
      <pre style={{ ...statementStyle, fontFamily: mono, color: "#E2A9B4" }}>{out.fatal}</pre>
    </Panel>;
  }
  if (!out.compiled) {
    return <Panel style={{ borderColor: "#5A2A38" }}>
      <div style={{ color: C.red, fontFamily: C.sys, fontWeight: 700, marginBottom: 6 }}>Your code raised an error</div>
      <pre style={{ ...statementStyle, fontFamily: mono, color: "#E2A9B4" }}>{out.compileError}</pre>
    </Panel>;
  }
  const allPass = out.allPass;
  const visible = out.results.filter((r) => !r.hidden);
  const hiddenResults = out.results.filter((r) => r.hidden);
  const firstHiddenFail = hiddenResults.find((r) => !r.ok);
  const totalPassed = out.passed + out.hiddenPassed;
  const totalAll = out.total + out.hiddenTotal;
  return (
    <Panel style={{ borderColor: allPass ? "#27613F" : "#5A2A38" }}>
      <div style={{ fontFamily: C.sys, fontWeight: 800, fontSize: 15,
        color: allPass ? C.green : C.red, marginBottom: 10 }}>
        {allPass ? "✓ Accepted — all tests passed" : "✗ Some tests failed"} — {totalPassed}/{totalAll}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.map((r, i) => <TestRow key={i} r={r} />)}
      </div>

      {/* hidden tests: collapse to a count; reveal only the first failing case */}
      {out.hiddenTotal > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontFamily: C.sys, fontSize: 12.5, fontWeight: 700,
            color: out.hiddenPassed === out.hiddenTotal ? C.green : C.red, marginBottom: firstHiddenFail ? 6 : 0 }}>
            {out.hiddenPassed === out.hiddenTotal ? "🔒 ✓" : "🔒 ✗"} Hidden tests {out.hiddenPassed}/{out.hiddenTotal} passed
          </div>
          {firstHiddenFail && (
            <>
              <div style={{ fontFamily: C.sys, fontSize: 11, color: C.faint, margin: "2px 0 6px" }}>
                First failing hidden test:
              </div>
              <TestRow r={firstHiddenFail} />
            </>
          )}
        </div>
      )}

      {out.stdout && <div style={{ marginTop: 10 }}>
        <div style={{ fontFamily: C.sys, fontSize: 11, color: C.faint, marginBottom: 4 }}>STDOUT</div>
        <pre style={{ ...statementStyle, fontFamily: mono, color: C.muted }}>{out.stdout}</pre>
      </div>}
    </Panel>
  );
}

function TestRow({ r }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 12.5,
      background: r.ok ? "#0e2018" : "#23121a", border: `1px solid ${r.ok ? "#27613F" : "#5A2A38"}`,
      borderRadius: 7, padding: "7px 10px" }}>
      <span style={{ color: r.ok ? C.green : C.red, fontWeight: 700 }}>{r.ok ? "✓" : "✗"}</span>{" "}
      <span style={{ color: C.text }}>{r.call}</span>
      {!r.ok && !r.error && (
        <span style={{ color: C.muted }}>{"  →  got "}<span style={{ color: C.red }}>{r.got}</span>{", want "}<span style={{ color: C.green }}>{r.want}</span></span>
      )}
      {r.error && <pre style={{ margin: "6px 0 0", color: "#E2A9B4", whiteSpace: "pre-wrap" }}>{r.error}</pre>}
    </div>
  );
}

// ===========================================================================
//  BRAINTEASERS
// ===========================================================================
const RATINGS = [["again", "Again", C.red], ["good", "Got it", C.amber], ["easy", "Easy", C.green]];

function TeasersMode({ flight, setFlight }) {
  const cats = useMemo(() => ["All", ...new Set(BRAINTEASERS.map((t) => t.category))], []);
  const [cat, setCat] = useState("All");
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const list = useMemo(
    () => (cat === "All" ? BRAINTEASERS : BRAINTEASERS.filter((t) => t.category === cat)),
    [cat],
  );
  const t = list[Math.min(idx, list.length - 1)];
  const seenCount = Object.keys(flight.teasers || {}).length;

  const go = (d) => { setIdx((i) => (i + d + list.length) % list.length); setRevealed(false); };
  const rate = (r) => setFlight((prev) => ({
    ...prev, teasers: { ...prev.teasers, [t.id]: { rating: r, seen: true } },
  }));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <select value={cat} onChange={(e) => { setCat(e.target.value); setIdx(0); setRevealed(false); }} style={selectStyle}>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span style={{ fontFamily: C.sys, fontSize: 12, color: C.muted }}>
          {idx + 1} / {list.length} · {seenCount} reviewed overall
        </span>
      </div>
      <Panel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={pill(C.blue)}>{t.category}</span>
          <span style={pill(DIFF_COLOR[t.difficulty])}>{t.difficulty}</span>
          {flight.teasers?.[t.id] && <span style={pill(C.faint)}>last: {flight.teasers[t.id].rating}</span>}
        </div>
        <pre style={{ ...statementStyle, fontSize: 15.5, color: "#F1F5FB" }}>{t.question}</pre>

        {!revealed ? (
          <Btn kind="primary" style={{ marginTop: 16 }} onClick={() => setRevealed(true)}>Show answer & solution</Btn>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div style={{ background: "#0e2018", border: "1px solid #27613F", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
              <span style={{ fontFamily: C.sys, fontSize: 12, color: C.faint }}>ANSWER  </span>
              <span style={{ fontWeight: 800, color: C.green, fontSize: 15 }}>{t.answer}</span>
            </div>
            <pre style={statementStyle}>{t.solution}</pre>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {RATINGS.map(([key, label, color]) => (
                <button key={key} onClick={() => { rate(key); go(1); }} style={{
                  ...pill(color), cursor: "pointer", padding: "8px 16px", fontSize: 13 }}>{label}</button>
              ))}
            </div>
          </div>
        )}
      </Panel>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <Btn onClick={() => go(-1)}>← Previous</Btn>
        <Btn onClick={() => go(1)}>Skip / Next →</Btn>
      </div>
    </div>
  );
}

// ===========================================================================
//  MENTAL MATH
// ===========================================================================
const ROUND_LEN = 20;

function MathMode({ flight, setFlight }) {
  const [level, setLevel] = useState("standard");
  const [active, setActive] = useState(false);
  const [q, setQ] = useState(null);
  const [val, setVal] = useState("");
  const [log, setLog] = useState([]);       // [{ok, ms}]
  const [feedback, setFeedback] = useState("");
  const startRef = useRef(0);
  const rounds = flight.math?.rounds || [];
  const best = rounds.reduce((b, r) => Math.max(b, r.accuracy), 0);

  const now = () => (typeof performance !== "undefined" ? performance.now() : 0);

  const begin = () => {
    setActive(true); setLog([]); setFeedback(""); setVal("");
    setQ(genQuestion(level)); startRef.current = now();
  };

  const submit = () => {
    if (!q) return;
    const ms = now() - startRef.current;
    const ok = checkAnswer(q, val);
    setFeedback(ok ? "✓" : `✗  answer: ${q.answer}`);
    const nextLog = [...log, { ok, ms }];
    setLog(nextLog); setVal("");
    if (nextLog.length >= ROUND_LEN) {
      finish(nextLog);
    } else {
      setQ(genQuestion(level)); startRef.current = now();
    }
  };

  const finish = (finalLog) => {
    const correct = finalLog.filter((r) => r.ok).length;
    const round = {
      level, total: finalLog.length, correct,
      accuracy: Math.round((correct / finalLog.length) * 100),
      medianMs: Math.round(median(finalLog.map((r) => r.ms))),
    };
    setFlight((prev) => ({ ...prev, math: { rounds: [...(prev.math?.rounds || []), round].slice(-50) } }));
    setActive(false); setQ(null);
  };

  if (active) {
    return (
      <Panel style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: C.sys, fontSize: 13, color: C.muted, marginBottom: 18 }}>
          <span>Question {log.length + 1} / {ROUND_LEN}</span>
          <span>{log.filter((r) => r.ok).length} correct</span>
        </div>
        <div style={{ fontSize: 38, fontWeight: 800, textAlign: "center", color: "#F4F8FE", margin: "10px 0 22px", fontFamily: mono }}>
          {q.prompt}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} style={{ display: "flex", gap: 8 }}>
          <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal"
            placeholder="answer" style={{ flex: 1, fontSize: 22, textAlign: "center", fontFamily: mono,
              background: "#0A1322", color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px" }} />
          <Btn kind="primary" onClick={submit}>Enter</Btn>
        </form>
        <div style={{ textAlign: "center", marginTop: 14, height: 22, fontFamily: mono, fontSize: 15,
          color: feedback.startsWith("✓") ? C.green : C.red }}>{feedback}</div>
      </Panel>
    );
  }

  const last = rounds[rounds.length - 1];
  return (
    <div style={{ maxWidth: 560 }}>
      <Panel>
        <div style={{ fontFamily: C.sys, fontSize: 13, color: C.muted, marginBottom: 12 }}>
          {ROUND_LEN} questions · type the answer, hit Enter. Estimation questions accept a range.
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {Object.keys(LEVELS).map((lv) => (
            <button key={lv} onClick={() => setLevel(lv)} style={tab(level === lv)}>{lv}</button>
          ))}
        </div>
        <Btn kind="primary" onClick={begin}>Start round</Btn>
        {last && (
          <div style={{ marginTop: 18, fontFamily: C.sys, fontSize: 13, color: C.text }}>
            Last round: <b style={{ color: C.green }}>{last.accuracy}%</b> ({last.correct}/{last.total}),
            median <b>{(last.medianMs / 1000).toFixed(1)}s</b>/q · best accuracy <b>{best}%</b>
          </div>
        )}
      </Panel>
      {rounds.length > 0 && (
        <Panel style={{ marginTop: 14 }}>
          <div style={{ fontFamily: C.sys, fontSize: 12, color: C.faint, marginBottom: 8 }}>RECENT ROUNDS</div>
          {rounds.slice(-8).reverse().map((r, i) => (
            <div key={i} style={{ fontFamily: mono, fontSize: 12.5, color: C.muted, padding: "3px 0" }}>
              {r.level.padEnd(9)} {String(r.accuracy).padStart(3)}%  {(r.medianMs / 1000).toFixed(1)}s/q
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}

// ===========================================================================
//  SYSTEM DESIGN
// ===========================================================================
function DesignMode({ flight, setFlight }) {
  const [selId, setSelId] = useState(SYS_DESIGN[0].id);
  const [reveal, setReveal] = useState(false);
  const d = SYS_DESIGN.find((x) => x.id === selId);
  const saved = flight.design?.[d.id] || {};
  const reviewedCount = Object.values(flight.design || {}).filter((x) => x.reviewed).length;

  const patch = (p) => setFlight((prev) => ({
    ...prev, design: { ...prev.design, [d.id]: { ...(prev.design?.[d.id] || {}), ...p } },
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, alignItems: "start" }}>
      <Panel style={{ padding: 12 }}>
        <div style={{ fontFamily: C.sys, fontSize: 12, color: C.muted, marginBottom: 8 }}>
          {reviewedCount}/{SYS_DESIGN.length} reviewed
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {SYS_DESIGN.map((x) => (
            <button key={x.id} onClick={() => { setSelId(x.id); setReveal(false); }} style={{
              textAlign: "left", background: x.id === selId ? "#16263f" : "transparent",
              border: `1px solid ${x.id === selId ? C.borderHi : "transparent"}`,
              borderRadius: 8, padding: "8px 9px", cursor: "pointer", color: C.text,
              fontFamily: C.sys, fontSize: 12.5, display: "flex", gap: 7 }}>
              <span>{flight.design?.[x.id]?.reviewed ? "✅" : "⚪️"}</span>
              <span>{x.title}</span>
            </button>
          ))}
        </div>
      </Panel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 19, color: "#F4F8FE" }}>{d.title}</h2>
            <span style={pill(DIFF_COLOR[d.difficulty])}>{d.difficulty}</span>
          </div>
          <pre style={{ ...statementStyle, fontSize: 14.5 }}>{d.prompt}</pre>
          <div style={{ marginTop: 14, fontFamily: C.sys, fontSize: 12, color: C.faint, marginBottom: 6 }}>SURFACE THESE</div>
          <ul style={{ margin: 0, paddingLeft: 20, color: C.text, fontFamily: C.sys, fontSize: 13.5, lineHeight: 1.7 }}>
            {d.requirements.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <div style={{ marginTop: 14, padding: "10px 14px", background: "#101d33", border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <span style={{ fontFamily: C.sys, fontSize: 12, color: C.blue }}>WHY A FUND ASKS THIS  </span>
            <span style={{ fontFamily: C.sys, fontSize: 13, color: C.muted }}>{d.quantAngle}</span>
          </div>
        </Panel>

        <textarea
          value={saved.notes || ""} onChange={(e) => patch({ notes: e.target.value })}
          placeholder="Sketch your approach here before revealing the model answer…"
          rows={5} spellCheck={false}
          style={{ width: "100%", boxSizing: "border-box", background: "#0A1322", color: C.text,
            border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px",
            fontFamily: C.sys, fontSize: 13.5, resize: "vertical" }} />

        <div style={{ display: "flex", gap: 8 }}>
          <Btn kind="primary" onClick={() => setReveal((v) => !v)}>{reveal ? "Hide model answer" : "👁 Model answer"}</Btn>
          <Btn kind={saved.reviewed ? "green" : "default"} onClick={() => patch({ reviewed: !saved.reviewed })}>
            {saved.reviewed ? "✓ Reviewed" : "Mark reviewed"}
          </Btn>
        </div>

        {reveal && <Panel>
          <div style={{ fontFamily: C.sys, fontSize: 12, color: C.faint, marginBottom: 8 }}>MODEL TALKING POINTS</div>
          <pre style={statementStyle}>{d.talkingPoints}</pre>
        </Panel>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
const statementStyle = {
  whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
  fontFamily: C.font, fontSize: 14, lineHeight: 1.6, color: C.text,
};
const selectStyle = {
  background: "#0A1322", color: C.text, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "7px 10px", fontFamily: C.sys, fontSize: 13, width: "100%",
};
