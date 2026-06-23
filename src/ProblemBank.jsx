import { useMemo, useState } from "react";
import { useCatalog, DIFF_LABEL, DIFF_COLOR, topicLabel } from "./lib/catalog.js";
import { C, Btn, Panel, SectionTitle, wrap } from "./ui/theme.jsx";
import { loadSecret, saveSecret } from "./store/storage.js";
import { fetchSolvedStatus, fetchPublicStats, applySyncToBank } from "./leetcode/sync.js";
import { newSchedule, isDue } from "./srs/sm2.js";
import { now } from "./lib/now.js";

const STATUSES = ["todo", "attempted", "solved", "review"];
const STATUS_COLOR = { todo: "#5E7DA8", attempted: C.amber, solved: C.green, review: "#C58BE8" };
const PAGE_SIZE = 50;
const lc = (slug) => `https://leetcode.com/problems/${slug}/`;

export default function ProblemBank({ bank, setBank, settings, setSettings, cards, setCards }) {
  const { problems, count, loading, error } = useCatalog();
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("all");
  const [status, setStatus] = useState("all");
  const [topic, setTopic] = useState("all");
  const [hidePaid, setHidePaid] = useState(false);
  const [page, setPage] = useState(0);

  const topics = useMemo(() => {
    const s = new Set();
    problems.forEach((p) => p.topics.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [problems]);

  const cardProblemIds = useMemo(
    () => new Set(cards.filter((c) => c.problemId != null).map((c) => c.problemId)), [cards]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return problems.filter((p) => {
      if (diff !== "all" && p.diff !== diff) return false;
      if (hidePaid && p.paid) return false;
      if (topic !== "all" && !p.topics.includes(topic)) return false;
      if (status !== "all") {
        const st = bank[p.id]?.status || "todo";
        if (st !== status) return false;
      }
      if (needle) {
        if (!p.title.toLowerCase().includes(needle) && String(p.id) !== needle) return false;
      }
      return true;
    });
  }, [problems, q, diff, status, topic, hidePaid, bank]);

  // reset page when filters change result set smaller than current page
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, pageCount - 1);
  const slice = filtered.slice(curPage * PAGE_SIZE, curPage * PAGE_SIZE + PAGE_SIZE);

  const setProblem = (id, patch) =>
    setBank((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));

  const cycleStatus = (id) => {
    const cur = bank[id]?.status || "todo";
    const next = STATUSES[(STATUSES.indexOf(cur) + 1) % STATUSES.length];
    setProblem(id, { status: next, updated: now() });
  };

  const toggleResolve = (id) => {
    const cur = bank[id];
    if (cur?.srs) setProblem(id, { srs: null });
    else setProblem(id, { srs: newSchedule(now()), status: cur?.status === "todo" ? "solved" : cur?.status });
  };

  const addCard = (p) => {
    if (cardProblemIds.has(p.id)) return;
    const card = {
      id: `prob-${p.id}`, type: "auto", topic: p.topics.map(topicLabel)[0] || "LeetCode",
      problemId: p.id,
      front: `${p.title} (#${p.id}) — what pattern solves it, and the time/space complexity?`,
      back: `Recall your approach for "${p.title}". Re-derive the pattern, complexity, and the key insight. Open it: ${lc(p.slug)}`,
      srs: null,
    };
    setCards((prev) => [...prev, card]);
  };

  const counts = useMemo(() => {
    const c = { todo: 0, attempted: 0, solved: 0, review: 0 };
    problems.forEach((p) => { c[bank[p.id]?.status || "todo"]++; });
    return c;
  }, [problems, bank]);

  return (
    <div style={wrap}>
      <SectionTitle kicker={`${count || "…"} problems · static catalog`} title="Problem Bank"
        right={<div style={{ display: "flex", gap: 14, fontFamily: C.sys, fontSize: 13 }}>
          {STATUSES.map((s) => (
            <span key={s} style={{ color: STATUS_COLOR[s] }}>{counts[s]} {s}</span>
          ))}
        </div>} />

      <SyncPanel settings={settings} setSettings={setSettings} setBank={setBank} />

      {/* Filters */}
      <Panel style={{ marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }}
          placeholder="Search title or #id…" style={inputStyle} />
        <Select value={diff} onChange={(v) => { setDiff(v); setPage(0); }}
          opts={[["all", "All difficulty"], ["E", "Easy"], ["M", "Medium"], ["H", "Hard"]]} />
        <Select value={status} onChange={(v) => { setStatus(v); setPage(0); }}
          opts={[["all", "All status"], ...STATUSES.map((s) => [s, s[0].toUpperCase() + s.slice(1)])]} />
        <Select value={topic} onChange={(v) => { setTopic(v); setPage(0); }}
          opts={[["all", "All topics"], ...topics.map((t) => [t, topicLabel(t)])]} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.muted, cursor: "pointer" }}>
          <input type="checkbox" checked={hidePaid} onChange={(e) => { setHidePaid(e.target.checked); setPage(0); }} />
          Hide paid
        </label>
        <span style={{ marginLeft: "auto", fontSize: 13, color: C.muted, fontFamily: C.sys }}>
          {filtered.length} match{filtered.length === 1 ? "" : "es"}
        </span>
      </Panel>

      {loading && <Panel>Loading catalog…</Panel>}
      {error && <Panel style={{ color: C.red }}>Couldn't load catalog: {error}. Run `npm run fetch:leetcode`.</Panel>}

      {!loading && !error && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {slice.map((p) => {
              const st = bank[p.id]?.status || "todo";
              const srs = bank[p.id]?.srs;
              const resolveDue = srs && isDue(srs);
              const hasCard = cardProblemIds.has(p.id);
              return (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  background: C.panel, border: `1px solid ${st === "solved" ? "#27613F" : C.border}`,
                  borderRadius: 11,
                }}>
                  <button onClick={() => cycleStatus(p.id)} title="Click to cycle status" style={{
                    minWidth: 86, textAlign: "center", cursor: "pointer",
                    background: "rgba(255,255,255,.04)", color: STATUS_COLOR[st],
                    border: `1px solid ${STATUS_COLOR[st]}55`, borderRadius: 8,
                    padding: "5px 8px", fontSize: 12, fontWeight: 700, fontFamily: C.sys,
                  }}>{st}</button>
                  <span style={{ fontFamily: C.sys, fontSize: 12, color: C.faint, minWidth: 44 }}>#{p.id}</span>
                  <a href={lc(p.slug)} target="_blank" rel="noreferrer" style={{
                    flex: 1, color: C.text, textDecoration: "none", fontSize: 14.5, fontWeight: 500,
                  }}>{p.title}{p.paid ? <span style={{ color: C.amber, fontSize: 11 }}> [paid]</span> : null}</a>
                  <div style={{ display: "flex", gap: 5 }}>
                    {p.topics.slice(0, 2).map((t) => (
                      <span key={t} style={tagStyle}>{topicLabel(t)}</span>
                    ))}
                  </div>
                  <span style={{ color: DIFF_COLOR[p.diff], fontSize: 12, fontWeight: 700,
                    fontFamily: C.sys, minWidth: 58, textAlign: "center" }}>{DIFF_LABEL[p.diff]}</span>
                  <span style={{ fontSize: 11.5, color: C.faint, fontFamily: C.sys, minWidth: 42 }}>{p.ac}%</span>
                  <button onClick={() => toggleResolve(p.id)} title="Schedule spaced re-solve"
                    style={{ ...iconBtn, color: srs ? (resolveDue ? C.red : C.green) : C.faint,
                      borderColor: srs ? (resolveDue ? "#5A2A38" : "#27613F") : "#2A3C56" }}>↻</button>
                  <button onClick={() => addCard(p)} disabled={hasCard} title="Add flashcard"
                    style={{ ...iconBtn, color: hasCard ? C.green : C.blue,
                      borderColor: hasCard ? "#27613F" : "#2A3C56",
                      cursor: hasCard ? "default" : "pointer" }}>{hasCard ? "✓" : "+"}</button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center",
            gap: 14, marginTop: 18, fontFamily: C.sys }}>
            <Btn onClick={() => setPage(Math.max(0, curPage - 1))} disabled={curPage === 0}>← Prev</Btn>
            <span style={{ fontSize: 13, color: C.muted }}>Page {curPage + 1} / {pageCount}</span>
            <Btn onClick={() => setPage(Math.min(pageCount - 1, curPage + 1))}
              disabled={curPage >= pageCount - 1}>Next →</Btn>
          </div>
        </>
      )}
    </div>
  );
}

function SyncPanel({ settings, setSettings, setBank }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const secret = loadSecret();
  const [session, setSession] = useState(secret.session || "");
  const [csrf, setCsrf] = useState(secret.csrf || "");

  const runFullSync = async () => {
    setBusy(true); setMsg(null);
    try {
      saveSecret({ session: session.trim(), csrf: csrf.trim() });
      const res = await fetchSolvedStatus({ session: session.trim(), csrf: csrf.trim() });
      if (!res.authed) {
        setMsg({ kind: "warn", text: "No cookie set — paste LEETCODE_SESSION below for full per-problem sync." });
      } else {
        setBank((prev) => applySyncToBank(prev, res));
        setMsg({ kind: "ok", text: `Synced: ${res.solved.length} solved, ${res.attempted.length} attempted auto-marked.` });
      }
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally { setBusy(false); }
  };

  const runPublic = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetchPublicStats((settings.lcUsername || "").trim());
      const total = Object.values(r.counts).reduce((a, b) => a + b, 0) - (r.counts.All || 0);
      setMsg({ kind: "ok", text: `Public stats for ${settings.lcUsername}: ${r.counts.All ?? total} solved (${r.counts.Easy || 0}E / ${r.counts.Medium || 0}M / ${r.counts.Hard || 0}H). Recent ${r.recentSlugs.length} pulled.` });
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally { setBusy(false); }
  };

  const msgColor = msg ? ({ ok: C.green, warn: C.amber, err: C.red })[msg.kind] : C.muted;

  return (
    <Panel style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.blue, fontFamily: C.sys }}>LeetCode sync</span>
        <input value={settings.lcUsername || ""} onChange={(e) => setSettings((s) => ({ ...s, lcUsername: e.target.value }))}
          placeholder="leetcode username" style={{ ...inputStyle, maxWidth: 200 }} />
        <Btn kind="green" onClick={runPublic} disabled={busy}>Public stats</Btn>
        <Btn kind="primary" onClick={runFullSync} disabled={busy}>{busy ? "Syncing…" : "Full sync (cookie)"}</Btn>
        <button onClick={() => setOpen((o) => !o)} style={{ ...iconBtn, color: C.muted, width: "auto", padding: "0 10px" }}>
          {open ? "▲ cookie" : "▼ cookie"}
        </button>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: C.faint, fontFamily: C.sys }}>
          Sync needs `npm run dev` (proxy)
        </span>
      </div>
      {open && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
            For full per-problem sync, paste your <code>LEETCODE_SESSION</code> cookie (DevTools → Application → Cookies → leetcode.com).
            Stored only in your browser's localStorage; never written to progress.json.
          </div>
          <input value={session} onChange={(e) => setSession(e.target.value)} placeholder="LEETCODE_SESSION" style={inputStyle} />
          <input value={csrf} onChange={(e) => setCsrf(e.target.value)} placeholder="csrftoken (optional)" style={inputStyle} />
        </div>
      )}
      {msg && <div style={{ marginTop: 10, fontSize: 13, color: msgColor, fontFamily: C.sys }}>{msg.text}</div>}
    </Panel>
  );
}

function Select({ value, onChange, opts }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{
      ...inputStyle, cursor: "pointer", maxWidth: 200,
    }}>
      {opts.map(([v, label]) => <option key={v} value={v} style={{ color: "#000" }}>{label}</option>)}
    </select>
  );
}

const inputStyle = {
  background: "#0B1422", border: "1px solid #2A3C56", color: C.text,
  borderRadius: 9, padding: "8px 11px", fontSize: 13, fontFamily: C.sys, outline: "none", flex: 1, minWidth: 120,
};
const iconBtn = {
  width: 34, height: 30, borderRadius: 8, background: "rgba(255,255,255,.04)",
  border: "1px solid #2A3C56", cursor: "pointer", fontSize: 13, fontFamily: C.sys, flexShrink: 0,
};
const tagStyle = {
  fontSize: 10.5, color: "#9FB6D6", background: "rgba(255,255,255,.05)",
  border: "1px solid #2A3C5655", borderRadius: 8, padding: "2px 7px", fontFamily: C.sys, whiteSpace: "nowrap",
};
