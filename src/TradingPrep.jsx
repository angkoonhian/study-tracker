import { useState } from "react";
import { C, Panel, SectionTitle, wrap } from "./ui/theme.jsx";
import CodingPractice from "./practice/CodingPractice.jsx";
import { TRADING_CODING } from "./data/trading/codingTrading.js";
import { PYTHON_TRIVIA } from "./data/trading/pythonTrivia.js";
import { FIRMS } from "./data/trading/firms.js";
import { QUANT_POINTERS } from "./data/trading/quantPointers.js";

const TABS = [["dsa", "Trading DSA"], ["trivia", "Python Trivia"], ["firms", "Firm Guides"], ["quant", "Quant / Math"]];
const tabStyle = (active) => ({
  background: active ? C.blue : C.panel, color: active ? "#fff" : C.muted,
  border: `1px solid ${C.border}`, borderRadius: 20, padding: "8px 16px",
  fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: C.sys,
});
const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export default function TradingPrep({ trading, setTrading }) {
  const [tab, setTab] = useState("dsa");
  const setCoding = (updater) => setTrading((p) => ({ ...p, coding: updater(p.coding || {}) }));
  const setTrivia = (updater) => setTrading((p) => ({ ...p, trivia: updater(p.trivia || {}) }));
  return (
    <div style={wrap}>
      <SectionTitle kicker="Quant & prop trading firms" title="Trading Prep"
        right={<span style={{ fontFamily: C.sys, fontSize: 11.5, color: C.faint,
          border: `1px solid ${C.border}`, borderRadius: 18, padding: "5px 11px" }}>
          Reconstructed from public reports
        </span>} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={tabStyle(tab === k)}>{label}</button>
        ))}
      </div>
      {tab === "dsa" && (
        <CodingPractice problems={TRADING_CODING} progress={trading.coding || {}} setProgress={setCoding} />
      )}
      {tab === "trivia" && <TriviaTab progress={trading.trivia || {}} setProgress={setTrivia} />}
      {tab === "firms" && <FirmsTab />}
      {tab === "quant" && <QuantTab />}
    </div>
  );
}

function TriviaTab({ progress, setProgress }) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const t = PYTHON_TRIVIA[Math.min(idx, PYTHON_TRIVIA.length - 1)];
  const go = (d) => { setIdx((i) => (i + d + PYTHON_TRIVIA.length) % PYTHON_TRIVIA.length); setRevealed(false); };
  const reveal = () => { setRevealed(true); setProgress((p) => ({ ...p, [t.id]: { seen: true } })); };
  const seen = Object.keys(progress).length;
  return (
    <div>
      <div style={{ fontFamily: C.sys, fontSize: 12, color: C.muted, marginBottom: 10 }}>
        {idx + 1} / {PYTHON_TRIVIA.length} · {seen} seen · {t.concept}
        {t.firms?.length ? ` · ${t.firms.join(", ")}` : ""}
      </div>
      <Panel>
        <pre style={{ margin: 0, fontFamily: mono, fontSize: 13.5, background: C.soft,
          padding: "12px 14px", borderRadius: 8, whiteSpace: "pre-wrap", color: C.text }}>{t.code}</pre>
        <div style={{ marginTop: 12, fontWeight: 700, color: C.text }}>{t.question}</div>
        {revealed ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontFamily: C.sys, fontSize: 12, color: C.faint }}>OUTPUT</div>
            <pre style={{ margin: "4px 0 10px", fontFamily: mono, fontSize: 13.5, color: C.green,
              whiteSpace: "pre-wrap" }}>{t.answer}</pre>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: C.muted }}>{t.explanation}</div>
            {t.source && <div style={{ fontSize: 11, color: C.faint, marginTop: 8 }}>Source: {t.source}</div>}
          </div>
        ) : (
          <button onClick={reveal} style={{ ...tabStyle(true), marginTop: 14 }}>Reveal answer</button>
        )}
      </Panel>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={() => go(-1)} style={tabStyle(false)}>&#8592; Prev</button>
        <button onClick={() => go(1)} style={tabStyle(false)}>Next &#8594;</button>
      </div>
    </div>
  );
}

function FirmsTab() {
  const [openId, setOpenId] = useState(FIRMS[0]?.id);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {FIRMS.map((f) => {
        const open = openId === f.id;
        return (
          <Panel key={f.id}>
            <button onClick={() => setOpenId(open ? null : f.id)} style={{ width: "100%", textAlign: "left",
              background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{f.name}</span>
              <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{f.blurb}</div>
            </button>
            {open && (
              <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>
                <H>Rounds</H>
                <ol style={{ margin: "4px 0 12px", paddingLeft: 20, color: C.muted }}>
                  {f.rounds.map((r, i) => <li key={i}><b style={{ color: C.text }}>{r.name}:</b> {r.detail}</li>)}
                </ol>
                <H>Emphasis</H>
                <div style={{ color: C.muted, marginBottom: 12 }}>{f.emphasis.join(" · ")}</div>
                <H>Sample question types</H>
                <ul style={{ margin: "4px 0 12px", paddingLeft: 20, color: C.muted }}>
                  {f.samples.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                <div style={{ fontSize: 11, color: C.faint }}>Sources: {f.sources.join("; ")}</div>
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}

function QuantTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel><div style={{ fontSize: 13.5, color: C.muted }}>{QUANT_POINTERS.note}</div></Panel>
      <Panel>
        <H>Firm emphasis</H>
        {QUANT_POINTERS.byFirm.map((b) => (
          <div key={b.firm} style={{ marginBottom: 8, fontSize: 14 }}>
            <b style={{ color: C.text }}>{b.firm}:</b> <span style={{ color: C.muted }}>{b.focus.join(" · ")}</span>
          </div>
        ))}
      </Panel>
      {QUANT_POINTERS.cards.map((c) => <QuantCard key={c.id} c={c} />)}
    </div>
  );
}

function QuantCard({ c }) {
  const [open, setOpen] = useState(false);
  return (
    <Panel>
      <div style={{ fontSize: 12, color: C.faint, fontFamily: C.sys }}>{c.concept}{c.firms?.length ? ` · ${c.firms.join(", ")}` : ""}</div>
      <div style={{ fontSize: 14.5, color: C.text, margin: "6px 0", lineHeight: 1.6 }}>{c.question}</div>
      {open ? (
        <div>
          <div style={{ color: C.green, fontWeight: 700, marginBottom: 6 }}>{c.answer}</div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{c.explanation}</div>
          {c.source && <div style={{ fontSize: 11, color: C.faint, marginTop: 8 }}>Source: {c.source}</div>}
        </div>
      ) : <button onClick={() => setOpen(true)} style={tabStyle(true)}>Show answer</button>}
    </Panel>
  );
}

const H = ({ children }) => (
  <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase",
    color: C.faint, fontFamily: C.sys, marginBottom: 2 }}>{children}</div>
);
