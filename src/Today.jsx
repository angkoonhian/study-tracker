import { useMemo } from "react";
import { useCatalog } from "./lib/catalog.js";
import { C, Btn, Panel, SectionTitle, wrap } from "./ui/theme.jsx";
import { isDue, schedule, previewInterval, GRADES } from "./srs/sm2.js";
import { now } from "./lib/now.js";

const lc = (slug) => `https://leetcode.com/problems/${slug}/`;

export default function Today({ done, toggleTask, bank, setBank, cards, plan, setView }) {
  const { problems } = useCatalog();
  const byId = useMemo(() => {
    const m = new Map();
    problems.forEach((p) => m.set(p.id, p));
    return m;
  }, [problems]);

  const dueCards = useMemo(() => cards.filter((c) => isDue(c.srs ?? null)), [cards]);

  const dueResolves = useMemo(() =>
    Object.entries(bank)
      .filter(([, v]) => v?.srs && isDue(v.srs))
      .map(([id]) => Number(id))
      .sort((a, b) => a - b), [bank]);

  // "Today" plan = the first day not fully complete.
  const todayDay = useMemo(() => {
    for (const d of plan) {
      const allDone = d.tasks.every((t) => done[t.id]);
      if (!allDone) return d;
    }
    return null; // whole plan complete
  }, [plan, done]);

  const gradeResolve = (id, g) => {
    setBank((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), srs: schedule(prev[id]?.srs ?? null, g, now()) } }));
  };

  const nothingDue = !dueCards.length && !dueResolves.length && (!todayDay || todayDay.tasks.every((t) => done[t.id]));

  return (
    <div style={wrap}>
      <SectionTitle kicker="Your prioritized queue" title="Today"
        right={<div style={{ fontFamily: C.sys, fontSize: 13, color: C.muted, display: "flex", gap: 14 }}>
          <span style={{ color: dueCards.length ? C.blue : C.faint }}>{dueCards.length} cards</span>
          <span style={{ color: dueResolves.length ? C.red : C.faint }}>{dueResolves.length} re-solves</span>
        </div>} />

      {nothingDue && (
        <Panel style={{ color: C.green, fontSize: 15 }}>
          You're all caught up. No cards due, no re-solves scheduled, and today's plan is done. Nice work.
        </Panel>
      )}

      {/* Flashcards due */}
      {dueCards.length > 0 && (
        <Panel style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{dueCards.length} flashcard{dueCards.length === 1 ? "" : "s"} due</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Spaced repetition keeps patterns & concepts fresh.</div>
          </div>
          <Btn kind="primary" onClick={() => setView("cards")}>Review now →</Btn>
        </Panel>
      )}

      {/* Problem re-solves due */}
      {dueResolves.length > 0 && (
        <Panel style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#CFE0F5" }}>
            ↻ Re-solve from scratch ({dueResolves.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dueResolves.map((id) => {
              const p = byId.get(id);
              const srs = bank[id]?.srs;
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                  padding: "10px 12px", background: "rgba(226,86,111,.05)", border: "1px solid #5A2A38", borderRadius: 10 }}>
                  <span style={{ fontSize: 12, color: C.faint, fontFamily: C.sys, minWidth: 44 }}>#{id}</span>
                  <a href={p ? lc(p.slug) : `https://leetcode.com/problemset/`} target="_blank" rel="noreferrer"
                    style={{ flex: 1, minWidth: 160, color: C.text, fontSize: 14.5, textDecoration: "none", fontWeight: 500 }}>
                    {p ? p.title : `Problem #${id}`}
                  </a>
                  <span style={{ fontSize: 11.5, color: C.faint, fontFamily: C.sys }}>
                    reps {srs?.reps ?? 0}{srs?.last ? ` · last ${Math.round((now() - srs.last) / 86400000)}d ago` : ""}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[["Again", GRADES.again, C.red], ["Hard", GRADES.hard, C.amber], ["Good", GRADES.good, C.blue], ["Easy", GRADES.easy, C.green]].map(([label, g, col]) => (
                      <button key={label} onClick={() => gradeResolve(id, g)} title={`next: ${previewInterval(srs ?? null, g)}`} style={{
                        background: "rgba(255,255,255,.04)", border: `1px solid ${col}66`, color: col,
                        borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: C.sys }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Today's plan */}
      {todayDay && (
        <Panel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.faint, fontFamily: C.sys, letterSpacing: 1 }}>DAY {todayDay.d}</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{todayDay.title}</span>
            <Btn onClick={() => setView("tracker")} style={{ marginLeft: "auto", padding: "4px 10px", fontSize: 12 }}>Open full plan →</Btn>
          </div>
          <div style={{ fontSize: 13.5, color: C.muted, fontStyle: "italic", marginBottom: 12 }}>{todayDay.focus}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {todayDay.tasks.map((t) => {
              const isD = !!done[t.id];
              return (
                <div key={t.id} onClick={() => toggleTask(t.id)} style={{ display: "flex", gap: 11, alignItems: "flex-start",
                  cursor: "pointer", padding: "8px 6px", borderRadius: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, marginTop: 1, flexShrink: 0,
                    border: `2px solid ${isD ? C.green : "#3C5174"}`, background: isD ? C.green : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#08101F", fontWeight: 700 }}>
                    {isD ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: isD ? C.faint : "#D7E0EE",
                    textDecoration: isD ? "line-through" : "none" }}>{t.text}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
