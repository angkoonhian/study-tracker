// ---------------------------------------------------------------------------
//  CodingPractice.jsx  ·  reusable coding-practice component.
//  Renders a topic-grouped problem sidebar + selected-problem panel with
//  in-browser Python execution via vendored Pyodide.
//
//  Props:
//    problems   – array of problem objects (same shape as CODING in coding.js)
//    progress   – object keyed by problem id: { [id]: { solved, attempts, lastCode } }
//    setProgress – state updater (fn(updater) or fn(newVal)) for progress
// ---------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { C, Btn, Panel } from "../ui/theme.jsx";
import { runProblem, isPyReady } from "../flight/pyRunner.js";
import { Diagram } from "../flight/diagrams.jsx";
import { deriveDiagram } from "../flight/deriveDiagram.js";
import CodeEditor from "../flight/CodeEditor.jsx";

// ---------------------------------------------------------------------------
//  Local style helpers (self-contained; intentionally re-declared here so
//  this component has no dependency on FlightMode internals)
// ---------------------------------------------------------------------------
const DIFF_COLOR = { Easy: C.green, Medium: C.amber, Hard: C.red };
const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const pill = (color) => ({
  fontFamily: C.sys, fontSize: 11, fontWeight: 700, color,
  border: `1px solid ${color}55`, background: `${color}14`,
  borderRadius: 12, padding: "2px 9px",
});

const selectStyle = {
  background: "#f3f4f6", color: C.text, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "7px 10px", fontFamily: C.sys, fontSize: 13, width: "100%",
};

const statementStyle = {
  whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
  fontFamily: C.font, fontSize: 14, lineHeight: 1.6, color: C.text,
};

// ---------------------------------------------------------------------------
//  CodingPractice (default export)
// ---------------------------------------------------------------------------
export default function CodingPractice({ problems, progress, setProgress }) {
  const topics = useMemo(() => ["All", ...new Set(problems.map((p) => p.topic))], [problems]);
  const [topic, setTopic] = useState("All");
  const [selId, setSelId] = useState(problems[0]?.id);

  const list = useMemo(
    () => (topic === "All" ? problems : problems.filter((p) => p.topic === topic)),
    [problems, topic],
  );

  // Group into an ordered topic directory so each topic gets its own header
  const groups = useMemo(() => {
    const order = [];
    const byTopic = new Map();
    for (const p of list) {
      if (!byTopic.has(p.topic)) { byTopic.set(p.topic, []); order.push(p.topic); }
      byTopic.get(p.topic).push(p);
    }
    return order.map((t) => ({ topic: t, problems: byTopic.get(t) }));
  }, [list]);

  const problem = problems.find((p) => p.id === selId) || list[0];
  const solvedCount = Object.values(progress || {}).filter((c) => c.solved).length;
  const isSolved = (p) => !!progress?.[p.id]?.solved;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>
      <Panel style={{ padding: 12 }}>
        <div style={{ fontFamily: C.sys, fontSize: 12, color: C.muted, marginBottom: 8 }}>
          {solvedCount}/{problems.length} solved
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
                    const st = progress?.[p.id];
                    const active = p.id === problem?.id;
                    return (
                      <button key={p.id} onClick={() => setSelId(p.id)} style={{
                        textAlign: "left", background: active ? "#eef6f0" : "transparent",
                        border: `1px solid ${active ? C.borderHi : "transparent"}`,
                        borderRadius: 8, padding: "7px 9px", cursor: "pointer", color: C.text,
                        fontFamily: C.sys, fontSize: 12.5, display: "flex", gap: 7, alignItems: "center",
                      }}>
                        <span>{st?.solved ? "✓" : st?.attempts ? "•" : "◦"}</span>
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
      {problem && (
        <CodingProblem
          key={problem.id}
          problem={problem}
          progress={progress}
          setProgress={setProgress}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
//  CodingProblem
// ---------------------------------------------------------------------------
function CodingProblem({ problem, progress, setProgress }) {
  const saved = progress?.[problem.id];
  const diagram = useMemo(() => deriveDiagram(problem), [problem]);
  const [code, setCode] = useState(saved?.lastCode ?? problem.starter);
  const [out, setOut] = useState(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");
  const [showSol, setShowSol] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const patchProblem = (patch) => setProgress((prev) => ({
    ...prev, [problem.id]: { ...(prev?.[problem.id] || {}), ...patch },
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
          <h2 style={{ margin: 0, fontSize: 20, color: "#111418" }}>{problem.title}</h2>
          <span style={pill(DIFF_COLOR[problem.difficulty])}>{problem.difficulty}</span>
          <span style={pill(C.blue)}>{problem.topic}</span>
          {saved?.solved && <span style={pill(C.green)}>✓ solved</span>}
          {problem.leetcode && (
            <a href={problem.leetcode} target="_blank" rel="noreferrer"
              title="The classic LeetCode problem this is based on"
              style={{ marginLeft: "auto", fontFamily: C.sys, fontSize: 12, fontWeight: 700,
                color: C.blue, textDecoration: "none", border: `1px solid ${C.blue}55`,
                borderRadius: 12, padding: "3px 10px", whiteSpace: "nowrap" }}>
              LeetCode ↗
            </a>
          )}
        </div>
        <pre style={statementStyle}>{problem.statement}</pre>
        {diagram && <Diagram {...diagram} />}
      </Panel>

      <Panel style={{ padding: 0, overflow: "hidden" }}>
        <CodeEditor value={code} onChange={setCode} />
        <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: `1px solid ${C.border}`,
          alignItems: "center", flexWrap: "wrap" }}>
          <Btn kind="primary" onClick={run} disabled={running}>
            {running ? "Running…" : "Run tests"}
          </Btn>
          <Btn onClick={() => setCode(problem.starter)} disabled={running}>↺ Reset code</Btn>
          <Btn onClick={() => setShowHint((v) => !v)}>{showHint ? "Hide hint" : "Hint"}</Btn>
          <Btn onClick={() => setShowSol((v) => !v)}>{showSol ? "Hide solution" : "Solution"}</Btn>
          <span style={{ fontFamily: C.sys, fontSize: 11.5, color: C.faint }}>
            {problem.tests.length} sample · {(problem.hidden || []).length} hidden
          </span>
          {status && <span style={{ fontFamily: C.sys, fontSize: 12, color: C.muted }}>{status}</span>}
        </div>
      </Panel>

      {showHint && <Panel style={{ borderColor: `${C.amber}66`, background: "#fffaf0" }}>
        <span style={{ color: C.amber, fontFamily: C.sys, fontSize: 13 }}>{problem.hint}</span>
      </Panel>}

      {out && <RunOutput out={out} />}

      {showSol && <Panel>
        <div style={{ fontFamily: C.sys, fontSize: 12, color: C.faint, marginBottom: 6 }}>REFERENCE SOLUTION</div>
        <pre style={{ ...statementStyle, fontFamily: mono, color: C.green }}>{problem.solution}</pre>
      </Panel>}
    </div>
  );
}

// ---------------------------------------------------------------------------
//  RunOutput
// ---------------------------------------------------------------------------
function RunOutput({ out }) {
  if (out.fatal) {
    return <Panel style={{ borderColor: "#e5b3b3" }}>
      <div style={{ color: C.red, fontFamily: C.sys, fontWeight: 700, marginBottom: 6 }}>Runtime failed to load</div>
      <pre style={{ ...statementStyle, fontFamily: mono, color: "#9b2b2b" }}>{out.fatal}</pre>
    </Panel>;
  }
  if (!out.compiled) {
    return <Panel style={{ borderColor: "#e5b3b3" }}>
      <div style={{ color: C.red, fontFamily: C.sys, fontWeight: 700, marginBottom: 6 }}>Your code raised an error</div>
      <pre style={{ ...statementStyle, fontFamily: mono, color: "#9b2b2b" }}>{out.compileError}</pre>
    </Panel>;
  }
  const allPass = out.allPass;
  const visible = out.results.filter((r) => !r.hidden);
  const hiddenResults = out.results.filter((r) => r.hidden);
  const firstHiddenFail = hiddenResults.find((r) => !r.ok);
  const totalPassed = out.passed + out.hiddenPassed;
  const totalAll = out.total + out.hiddenTotal;
  return (
    <Panel style={{ borderColor: allPass ? "#1a7f37" : "#e5b3b3" }}>
      <div style={{ fontFamily: C.sys, fontWeight: 800, fontSize: 15,
        color: allPass ? C.green : C.red, marginBottom: 10 }}>
        {allPass ? "✓ Accepted — all tests passed" : "✗ Some tests failed"} — {totalPassed}/{totalAll}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.map((r, i) => <TestRow key={i} r={r} />)}
      </div>

      {out.hiddenTotal > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontFamily: C.sys, fontSize: 12.5, fontWeight: 700,
            color: out.hiddenPassed === out.hiddenTotal ? C.green : C.red, marginBottom: firstHiddenFail ? 6 : 0 }}>
            {out.hiddenPassed === out.hiddenTotal ? "✓" : "✗"} Hidden tests {out.hiddenPassed}/{out.hiddenTotal} passed
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

// ---------------------------------------------------------------------------
//  TestRow
// ---------------------------------------------------------------------------
function TestRow({ r }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 12.5,
      background: r.ok ? "#eaf6ec" : "#fbeaea", border: `1px solid ${r.ok ? "#1a7f37" : "#e5b3b3"}`,
      borderRadius: 7, padding: "7px 10px" }}>
      <span style={{ color: r.ok ? C.green : C.red, fontWeight: 700 }}>{r.ok ? "✓" : "✗"}</span>{" "}
      <span style={{ color: C.text }}>{r.call}</span>
      {!r.ok && !r.error && (
        <span style={{ color: C.muted }}>{"  →  got "}<span style={{ color: C.red }}>{r.got}</span>{", want "}<span style={{ color: C.green }}>{r.want}</span></span>
      )}
      {r.error && <pre style={{ margin: "6px 0 0", color: "#9b2b2b", whiteSpace: "pre-wrap" }}>{r.error}</pre>}
    </div>
  );
}
