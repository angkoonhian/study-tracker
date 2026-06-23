import { useMemo } from "react";
import { useCatalog, DIFF_LABEL, DIFF_COLOR, topicLabel } from "./lib/catalog.js";
import { C, Panel, SectionTitle, wrap } from "./ui/theme.jsx";
import { isDue } from "./srs/sm2.js";
import { now } from "./lib/now.js";

const DAY = 86_400_000;
const dayKey = (ts) => new Date(ts).toLocaleDateString("en-CA"); // YYYY-MM-DD, local

export default function Dashboard({ done, bank, cards, plan }) {
  const { problems, loading } = useCatalog();

  // ---- Plan progress ----
  const planStats = useMemo(() => {
    let tot = 0, dn = 0;
    const cats = {};
    plan.forEach((d) => d.tasks.forEach((t) => {
      tot++; cats[t.c] = cats[t.c] || { tot: 0, dn: 0 }; cats[t.c].tot++;
      if (done[t.id]) { dn++; cats[t.c].dn++; }
    }));
    return { tot, dn, pct: tot ? Math.round((dn / tot) * 100) : 0, cats };
  }, [plan, done]);

  // ---- Bank status + difficulty + topic mastery ----
  const bankStats = useMemo(() => {
    const status = { todo: 0, attempted: 0, solved: 0, review: 0 };
    const diff = { E: { s: 0, t: 0 }, M: { s: 0, t: 0 }, H: { s: 0, t: 0 } };
    const topics = {};
    for (const p of problems) {
      diff[p.diff].t++;
      const st = bank[p.id]?.status || "todo";
      status[st]++;
      const solved = st === "solved";
      if (solved) diff[p.diff].s++;
      for (const tg of p.topics) {
        topics[tg] = topics[tg] || { s: 0, t: 0 };
        topics[tg].t++;
        if (solved) topics[tg].s++;
      }
    }
    const topTopics = Object.entries(topics)
      .filter(([, v]) => v.t >= 15)
      .map(([k, v]) => ({ slug: k, ...v, pct: Math.round((v.s / v.t) * 100) }))
      .sort((a, b) => b.t - a.t)
      .slice(0, 14);
    return { status, diff, topTopics };
  }, [problems, bank]);

  // ---- Flashcards ----
  const cardStats = useMemo(() => {
    const due = cards.filter((c) => isDue(c.srs ?? null)).length;
    const mature = cards.filter((c) => c.srs && c.srs.interval >= 21).length;
    const young = cards.filter((c) => c.srs && c.srs.reps > 0 && c.srs.interval < 21).length;
    return { total: cards.length, due, mature, young, fresh: cards.length - mature - young };
  }, [cards]);

  // ---- Activity + streak (from real timestamps across stores) ----
  const activity = useMemo(() => {
    const days = new Set();
    const recent = {};
    const stamp = (ts) => {
      if (!ts) return;
      const k = dayKey(ts);
      days.add(k);
      recent[k] = (recent[k] || 0) + 1;
    };
    Object.values(bank).forEach((b) => { stamp(b?.updated); stamp(b?.syncedAt); if (b?.srs?.last) stamp(b.srs.last); });
    cards.forEach((c) => stamp(c?.srs?.last));

    // streak: consecutive days up to today with any activity
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const k = dayKey(now() - i * DAY);
      if (days.has(k)) streak++;
      else if (i > 0) break; // today with no activity yet doesn't break a prior streak
    }
    // last 14 day bars
    const bars = [];
    for (let i = 13; i >= 0; i--) {
      const k = dayKey(now() - i * DAY);
      bars.push({ k, n: recent[k] || 0 });
    }
    const max = Math.max(1, ...bars.map((b) => b.n));
    return { streak, bars, max, activeDays: days.size };
  }, [bank, cards]);

  const CAT_LABEL = { apply: "Apply", design: "Design", code: "Code", behave: "Behavioral", mock: "Mock" };
  const CAT_COLOR = { apply: "#E0A23B", design: C.blue, code: C.green, behave: "#C58BE8", mock: C.red };

  return (
    <div style={wrap}>
      <SectionTitle kicker="Your progress at a glance" title="Dashboard" />

      {/* headline stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 18 }}>
        <Big label="49-day plan" value={`${planStats.pct}%`} sub={`${planStats.dn}/${planStats.tot} tasks`} color={C.blue} />
        <Big label="Problems solved" value={bankStats.status.solved} sub={`${bankStats.status.attempted} attempted`} color={C.green} />
        <Big label="Cards due" value={cardStats.due} sub={`${cardStats.total} in deck`} color={cardStats.due ? C.red : C.green} />
        <Big label="Day streak" value={activity.streak} sub={`${activity.activeDays} active days`} color={C.amber} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* difficulty */}
        <Panel>
          <H>Problems by difficulty</H>
          {loading ? <Dim>Loading…</Dim> : ["E", "M", "H"].map((d) => (
            <Bar key={d} label={DIFF_LABEL[d]} value={bankStats.diff[d].s} total={bankStats.diff[d].t} color={DIFF_COLOR[d]} />
          ))}
        </Panel>
        {/* plan categories */}
        <Panel>
          <H>Plan by category</H>
          {Object.entries(planStats.cats).map(([k, v]) => (
            <Bar key={k} label={CAT_LABEL[k] || k} value={v.dn} total={v.tot} color={CAT_COLOR[k] || C.blue} />
          ))}
        </Panel>
      </div>

      {/* topic mastery */}
      <Panel style={{ marginBottom: 14 }}>
        <H>Topic mastery {`(weak areas in red)`}</H>
        {loading ? <Dim>Loading…</Dim> : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 26px" }}>
            {bankStats.topTopics.map((t) => (
              <Bar key={t.slug} label={topicLabel(t.slug)} value={t.s} total={t.t}
                color={t.pct >= 50 ? C.green : t.pct >= 20 ? C.amber : C.red} compact />
            ))}
          </div>
        )}
      </Panel>

      {/* activity + cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <Panel>
          <H>Activity — last 14 days</H>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 90, marginTop: 8 }}>
            {activity.bars.map((b) => (
              <div key={b.k} title={`${b.k}: ${b.n}`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ height: `${(b.n / activity.max) * 100}%`, minHeight: b.n ? 4 : 2,
                  background: b.n ? "#2f8d46" : "#e9eef3", borderRadius: 4 }} />
              </div>
            ))}
          </div>
          <Dim>{activity.bars.reduce((a, b) => a + b.n, 0)} actions in the last 14 days</Dim>
        </Panel>
        <Panel>
          <H>Flashcard maturity</H>
          <Bar label="Mature (≥21d)" value={cardStats.mature} total={cardStats.total} color={C.green} />
          <Bar label="Young" value={cardStats.young} total={cardStats.total} color={C.amber} />
          <Bar label="New / unseen" value={cardStats.fresh} total={cardStats.total} color={C.faint} />
        </Panel>
      </div>
    </div>
  );
}

const H = ({ children }) => (
  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2328", marginBottom: 12, fontFamily: C.sys }}>{children}</div>
);
const Dim = ({ children }) => (
  <div style={{ fontSize: 12, color: C.faint, marginTop: 8, fontFamily: C.sys }}>{children}</div>
);

function Big({ label, value, sub, color }) {
  return (
    <Panel style={{ textAlign: "center" }}>
      <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: C.text, marginTop: 8, fontWeight: 600, fontFamily: C.sys }}>{label}</div>
      <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2, fontFamily: C.sys }}>{sub}</div>
    </Panel>
  );
}

function Bar({ label, value, total, color, compact }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: compact ? 8 : 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: C.sys, marginBottom: 4 }}>
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ color }}>{value}/{total} · {pct}%</span>
      </div>
      <div style={{ height: compact ? 6 : 8, background: "#e9eef3", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 5 }} />
      </div>
    </div>
  );
}
