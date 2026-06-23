import { useMemo, useState } from "react";
import { C, Btn, Panel, SectionTitle, wrap } from "./ui/theme.jsx";
import { schedule, isDue, previewInterval, GRADES } from "./srs/sm2.js";
import { now } from "./lib/now.js";

const TYPE_LABEL = { pattern: "Pattern", concept: "Concept", auto: "Problem", manual: "Manual" };
const TYPE_COLOR = { pattern: "#2f8d46", concept: "#C58BE8", auto: "#1a7f37", manual: "#E0A23B" };

export default function Flashcards({ cards, setCards }) {
  const [mode, setMode] = useState("overview"); // overview | review | manage
  const due = useMemo(() => cards.filter((c) => isDue(c.srs ?? null)), [cards]);

  return (
    <div style={wrap}>
      <SectionTitle kicker="Spaced repetition · SM-2" title="Flashcards"
        right={<div style={{ display: "flex", gap: 8 }}>
          <Btn kind={mode === "overview" ? "primary" : "default"} onClick={() => setMode("overview")}>Overview</Btn>
          <Btn kind={mode === "manage" ? "primary" : "default"} onClick={() => setMode("manage")}>Manage deck</Btn>
          <Btn kind="green" onClick={() => setMode("review")} disabled={!due.length}>
            Review {due.length ? `(${due.length})` : "— all caught up"}
          </Btn>
        </div>} />

      {mode === "overview" && <Overview cards={cards} due={due} onReview={() => setMode("review")} />}
      {mode === "review" && <Review cards={cards} setCards={setCards} onDone={() => setMode("overview")} />}
      {mode === "manage" && <Manage cards={cards} setCards={setCards} />}
    </div>
  );
}

function Overview({ cards, due, onReview }) {
  const byType = useMemo(() => {
    const m = {};
    for (const c of cards) m[c.type] = (m[c.type] || 0) + 1;
    return m;
  }, [cards]);
  const newCount = cards.filter((c) => !c.srs).length;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        <Stat label="Cards total" value={cards.length} color={C.text} />
        <Stat label="Due now" value={due.length} color={due.length ? C.red : C.green} />
        <Stat label="New (unseen)" value={newCount} color={C.blue} />
        <Stat label="Learning" value={cards.filter((c) => c.srs && c.srs.reps > 0).length} color={C.green} />
      </div>
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {Object.keys(TYPE_LABEL).map((t) => (
            <span key={t} style={{ fontSize: 13, color: TYPE_COLOR[t], fontFamily: C.sys }}>
              {byType[t] || 0} {TYPE_LABEL[t]}
            </span>
          ))}
        </div>
      </Panel>
      {due.length
        ? <Btn kind="primary" onClick={onReview} style={{ fontSize: 15, padding: "12px 22px" }}>
            Start review — {due.length} card{due.length === 1 ? "" : "s"} due →
          </Btn>
        : <Panel style={{ color: C.green }}>Nothing due. Come back later, or add cards in “Manage deck”.</Panel>}
    </>
  );
}

function Review({ cards, setCards, onDone }) {
  // Freeze the queue (ids) at session start so grading doesn't reshuffle mid-review.
  const [queue] = useState(() => cards.filter((c) => isDue(c.srs ?? null)).map((c) => c.id));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [graded, setGraded] = useState(0);

  if (idx >= queue.length) {
    return (
      <Panel style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 40 }}>✓</div>
        <div style={{ fontSize: 20, fontWeight: 700, margin: "10px 0" }}>Session complete</div>
        <div style={{ color: C.muted, marginBottom: 18 }}>You reviewed {graded} card{graded === 1 ? "" : "s"}.</div>
        <Btn kind="primary" onClick={onDone}>Back to overview</Btn>
      </Panel>
    );
  }

  const card = cards.find((c) => c.id === queue[idx]);
  if (!card) { // card was deleted mid-session — skip
    setIdx(idx + 1);
    return null;
  }

  const grade = (g) => {
    const t = now();
    setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, srs: schedule(c.srs ?? null, g, t) } : c));
    setGraded((n) => n + 1);
    setFlipped(false);
    setIdx(idx + 1);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: C.sys, fontSize: 13, color: C.muted }}>
        <span>Card {idx + 1} / {queue.length}</span>
        <span style={{ color: TYPE_COLOR[card.type] }}>{TYPE_LABEL[card.type]} · {card.topic}</span>
      </div>
      <Panel style={{ minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", padding: "30px 28px" }}>
        <div onClick={() => setFlipped((f) => !f)} style={{ flex: 1 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: C.faint, marginBottom: 12, fontFamily: C.sys }}>
            {flipped ? "ANSWER" : "QUESTION"}
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.55, color: flipped ? C.green : C.text }}>
            {flipped ? card.back : card.front}
          </div>
          {!flipped && <div style={{ marginTop: 18, fontSize: 13, color: C.faint, fontFamily: C.sys }}>
            Tap to reveal answer
          </div>}
        </div>
      </Panel>

      {flipped && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 14 }}>
          <GradeBtn label="Again" sub={previewInterval(card.srs ?? null, GRADES.again)} color={C.red} onClick={() => grade(GRADES.again)} />
          <GradeBtn label="Hard" sub={previewInterval(card.srs ?? null, GRADES.hard)} color={C.amber} onClick={() => grade(GRADES.hard)} />
          <GradeBtn label="Good" sub={previewInterval(card.srs ?? null, GRADES.good)} color={C.blue} onClick={() => grade(GRADES.good)} />
          <GradeBtn label="Easy" sub={previewInterval(card.srs ?? null, GRADES.easy)} color={C.green} onClick={() => grade(GRADES.easy)} />
        </div>
      )}
      {!flipped && (
        <div style={{ marginTop: 14 }}>
          <Btn kind="primary" onClick={() => setFlipped(true)} style={{ width: "100%", padding: "12px" }}>Show answer</Btn>
        </div>
      )}
    </>
  );
}

function GradeBtn({ label, sub, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "rgba(255,255,255,.04)", border: `1px solid ${color}66`, color,
      borderRadius: 11, padding: "12px 8px", cursor: "pointer", fontFamily: C.sys,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{sub}</div>
    </button>
  );
}

function Manage({ cards, setCards }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [topic, setTopic] = useState("");

  const filtered = cards.filter((c) => {
    if (type !== "all" && c.type !== type) return false;
    if (q && !(`${c.front} ${c.back} ${c.topic}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const add = () => {
    if (!front.trim() || !back.trim()) return;
    // Stable, unique id without Date.now(): first free man-N slot.
    const ids = new Set(cards.map((c) => c.id));
    let n = cards.length, id;
    do { id = `man-${n++}`; } while (ids.has(id));
    setCards((prev) => [...prev, {
      id, type: "manual", topic: topic.trim() || "Custom",
      front: front.trim(), back: back.trim(), srs: null,
    }]);
    setFront(""); setBack(""); setTopic("");
  };

  const del = (id) => setCards((prev) => prev.filter((c) => c.id !== id));

  return (
    <>
      <Panel style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 10, fontFamily: C.sys }}>Add a card</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front (question)" style={inp} />
          <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back (answer)" rows={3} style={{ ...inp, resize: "vertical" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (optional)" style={{ ...inp, maxWidth: 220 }} />
            <Btn kind="primary" onClick={add}>Add card</Btn>
          </div>
        </div>
      </Panel>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search deck…" style={inp} />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ ...inp, maxWidth: 160, cursor: "pointer" }}>
          <option value="all" style={{ color: "#000" }}>All types</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k} style={{ color: "#000" }}>{v}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((c) => (
          <div key={c.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px",
            background: C.panel, border: `1px solid ${C.border}`, borderRadius: 11 }}>
            <span style={{ fontSize: 10.5, color: TYPE_COLOR[c.type], border: `1px solid ${TYPE_COLOR[c.type]}55`,
              borderRadius: 8, padding: "2px 7px", fontFamily: C.sys, whiteSpace: "nowrap", marginTop: 2 }}>
              {TYPE_LABEL[c.type]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: C.text }}>{c.front}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{c.back}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 4, fontFamily: C.sys }}>
                {c.topic}{c.srs ? ` · next in ${previewInterval(c.srs, GRADES.good)} · reps ${c.srs.reps}` : " · new"}
              </div>
            </div>
            <button onClick={() => del(c.id)} title="Delete" style={{
              background: "transparent", border: "1px solid #e5b3b3", color: C.red, borderRadius: 8,
              padding: "4px 9px", cursor: "pointer", fontSize: 12, fontFamily: C.sys, flexShrink: 0 }}>✕</button>
          </div>
        ))}
        {!filtered.length && <Panel style={{ color: C.muted }}>No cards match.</Panel>}
      </div>
    </>
  );
}

function Stat({ label, value, color }) {
  return (
    <Panel style={{ textAlign: "center" }}>
      <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontFamily: C.sys }}>{label}</div>
    </Panel>
  );
}

const inp = {
  background: "#ffffff", border: "1px solid #d0d7de", color: C.text,
  borderRadius: 9, padding: "9px 11px", fontSize: 13.5, fontFamily: C.font, outline: "none", flex: 1, width: "100%",
};
