// ---------------------------------------------------------------------------
//  FlightMode.jsx · fully-offline practice for a 10-hour flight.
//  Four modes, no network: Coding (Python in-browser via vendored Pyodide),
//  Brainteasers/Probability, Mental Math drills, and Quant System Design.
//  Progress persists to localStorage via the `flight` slice in storage.js.
// ---------------------------------------------------------------------------

import { useMemo, useRef, useState } from "react";
import { C, Btn, Panel, SectionTitle, wrap } from "./ui/theme.jsx";
import { BRAINTEASERS } from "./data/flight/brainteasers.js";
import { SYS_DESIGN } from "./data/flight/systemDesign.js";
import { genQuestion, checkAnswer, median, LEVELS } from "./flight/mentalMath.js";
import GuidesMode from "./flight/GuideView.jsx";

const DIFF_COLOR = { Easy: C.green, Medium: C.amber, Hard: C.red };
const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const MODES = [
  ["handbooks", "Handbooks"],
  ["teasers", "Brainteasers"],
  ["math", "Mental Math"],
  ["design", "System Design"],
];

export default function FlightMode({ flight, setFlight }) {
  const [mode, setMode] = useState("handbooks");

  return (
    <div style={wrap}>
      <SectionTitle
        kicker="Offline · no wifi required"
        title="Flight Mode"
        right={<OfflineBadge />}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {MODES.map(([k, label]) => (
          <button key={k} onClick={() => setMode(k)} style={tab(mode === k)}>{label}</button>
        ))}
      </div>
      {mode === "handbooks" && <GuidesMode />}
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
      Handbooks &amp; drills read fully offline · coding runner uses Pyodide (vendored, or CDN when hosted)
    </span>
  );
}

const tab = (active) => ({
  background: active ? C.blue : C.soft,
  color: active ? C.panel : C.muted,
  border: `1px solid ${active ? C.blue : C.border}`,
  borderRadius: 20, padding: "8px 16px", fontSize: 13.5, fontWeight: 700,
  cursor: "pointer", fontFamily: C.sys,
});

const pill = (color) => ({
  fontFamily: C.sys, fontSize: 11, fontWeight: 700, color,
  border: `1px solid ${color}55`, background: `${color}14`,
  borderRadius: 12, padding: "2px 9px",
});

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
        <pre style={{ ...statementStyle, fontSize: 15.5, color: C.text }}>{t.question}</pre>

        {!revealed ? (
          <Btn kind="primary" style={{ marginTop: 16 }} onClick={() => setRevealed(true)}>Show answer & solution</Btn>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div style={{ background: C.okBg, border: `1px solid ${C.green}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
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
        <div style={{ fontSize: 38, fontWeight: 800, textAlign: "center", color: C.strong, margin: "10px 0 22px", fontFamily: mono }}>
          {q.prompt}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} style={{ display: "flex", gap: 8 }}>
          <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal"
            placeholder="answer" style={{ flex: 1, fontSize: 22, textAlign: "center", fontFamily: mono,
              background: C.soft, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px" }} />
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
              textAlign: "left", background: x.id === selId ? C.chipBg : "transparent",
              border: `1px solid ${x.id === selId ? C.borderHi : "transparent"}`,
              borderRadius: 8, padding: "8px 9px", cursor: "pointer", color: C.text,
              fontFamily: C.sys, fontSize: 12.5, display: "flex", gap: 7 }}>
              <span>{flight.design?.[x.id]?.reviewed ? "✓" : "◦"}</span>
              <span>{x.title}</span>
            </button>
          ))}
        </div>
      </Panel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 19, color: C.strong }}>{d.title}</h2>
            <span style={pill(DIFF_COLOR[d.difficulty])}>{d.difficulty}</span>
          </div>
          <pre style={{ ...statementStyle, fontSize: 14.5 }}>{d.prompt}</pre>
          <div style={{ marginTop: 14, fontFamily: C.sys, fontSize: 12, color: C.faint, marginBottom: 6 }}>SURFACE THESE</div>
          <ul style={{ margin: 0, paddingLeft: 20, color: C.text, fontFamily: C.sys, fontSize: 13.5, lineHeight: 1.7 }}>
            {d.requirements.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <div style={{ marginTop: 14, padding: "10px 14px", background: C.chipBg, border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <span style={{ fontFamily: C.sys, fontSize: 12, color: C.blue }}>WHY A FUND ASKS THIS  </span>
            <span style={{ fontFamily: C.sys, fontSize: 13, color: C.muted }}>{d.quantAngle}</span>
          </div>
        </Panel>

        <textarea
          value={saved.notes || ""} onChange={(e) => patch({ notes: e.target.value })}
          placeholder="Sketch your approach here before revealing the model answer…"
          rows={5} spellCheck={false}
          style={{ width: "100%", boxSizing: "border-box", background: C.soft, color: C.text,
            border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px",
            fontFamily: C.sys, fontSize: 13.5, resize: "vertical" }} />

        <div style={{ display: "flex", gap: 8 }}>
          <Btn kind="primary" onClick={() => setReveal((v) => !v)}>{reveal ? "Hide model answer" : "Model answer"}</Btn>
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
  background: C.soft, color: C.text, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "7px 10px", fontFamily: C.sys, fontSize: 13, width: "100%",
};
