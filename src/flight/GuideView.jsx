// ---------------------------------------------------------------------------
//  GuideView.jsx · renders the embedded DSA topic handbooks (src/data/flight/
//  guides). A guide is { id, title, subtitle, emoji, intro, sections[], cheatsheet[] }
//  where each section has typed content blocks: p | h3 | ul | ol | code | callout | table.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { C, Panel } from "../ui/theme.jsx";
import { GUIDES } from "../data/flight/guides/index.js";
import { Diagram } from "./diagrams.jsx";

const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export default function GuidesMode() {
  const [id, setId] = useState(GUIDES[0].id);
  const [active, setActive] = useState(0);
  const guide = useMemo(() => GUIDES.find((g) => g.id === id) || GUIDES[0], [id]);
  const sectionRefs = useRef({});

  const jump = (i) => {
    const el = sectionRefs.current[i];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scroll-spy: highlight the section nearest the top of the viewport.
  useEffect(() => {
    const els = guide.sections.map((_, i) => sectionRefs.current[i]).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b);
        const idx = els.indexOf(topMost.target);
        if (idx >= 0) setActive(idx);
      },
      { rootMargin: "-64px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [guide]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "230px minmax(0,1fr) 210px", gap: 16, alignItems: "start" }}>
      {/* guide picker */}
      <Panel style={{ padding: 12, position: "sticky", top: 64 }}>
        <div style={{ fontFamily: C.sys, fontSize: 11, color: C.faint, letterSpacing: 1,
          textTransform: "uppercase", marginBottom: 8 }}>Handbooks</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {GUIDES.map((g) => (
            <button key={g.id} onClick={() => { setId(g.id); window.scrollTo({ top: 0 }); }} style={{
              textAlign: "left", background: g.id === id ? "#eef6f0" : "transparent",
              border: `1px solid ${g.id === id ? C.borderHi : "transparent"}`,
              borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: C.text,
              fontFamily: C.sys, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <span>{g.title}</span>
            </button>
          ))}
        </div>
      </Panel>

      {/* reader */}
      <div style={{ minWidth: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 30, color: "#111418" }}>{guide.title}</h1>
          <div style={{ fontFamily: C.sys, fontSize: 15, color: C.muted, fontStyle: "italic" }}>{guide.subtitle}</div>
        </div>

        {guide.intro && <Panel style={{ marginBottom: 16 }}>
          {String(guide.intro).split("\n\n").map((para, i) => (
            <p key={i} style={paraStyle}>{para}</p>
          ))}
        </Panel>}

        {guide.sections.map((s, i) => (
          <section key={i} ref={(el) => (sectionRefs.current[i] = el)} style={{ scrollMarginTop: 64, marginBottom: 22 }}>
            <h2 style={{ fontSize: 22, color: "#111418", margin: "0 0 12px",
              borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>{s.heading}</h2>
            {(s.blocks || []).map((b, j) => <Block key={j} b={b} />)}
          </section>
        ))}

        {guide.cheatsheet && guide.cheatsheet.length > 0 && (
          <Panel style={{ background: "#eef6f0", borderColor: "#1a7f37", marginBottom: 30 }}>
            <div style={{ fontFamily: C.sys, fontSize: 12, color: C.green, letterSpacing: 1,
              textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Cheat sheet</div>
            <ul style={{ margin: 0, paddingLeft: 20, color: C.text, fontFamily: C.sys, fontSize: 13.5, lineHeight: 1.8 }}>
              {guide.cheatsheet.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </Panel>
        )}
      </div>

      {/* on-this-page contents */}
      <aside style={{ position: "sticky", top: 64, alignSelf: "start" }}>
        <div style={{ fontFamily: C.sys, fontSize: 11, color: C.faint, letterSpacing: 1,
          textTransform: "uppercase", marginBottom: 10, paddingLeft: 12 }}>On this page</div>
        <div style={{ display: "flex", flexDirection: "column", borderLeft: `1px solid ${C.border}` }}>
          {guide.sections.map((s, i) => (
            <button key={i} onClick={() => jump(i)} style={{
              textAlign: "left", background: "transparent", border: "none",
              borderLeft: `2px solid ${active === i ? C.blue : "transparent"}`,
              marginLeft: -1, padding: "5px 12px", cursor: "pointer",
              color: active === i ? "#1f2328" : C.muted,
              fontFamily: C.sys, fontSize: 12.5, lineHeight: 1.45,
              fontWeight: active === i ? 600 : 400 }}>
              {s.heading}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Block({ b }) {
  switch (b.type) {
    case "p":
      return <p style={paraStyle}>{b.text}</p>;
    case "h3":
      return <h3 style={{ fontSize: 16.5, color: "#1f2328", margin: "18px 0 8px" }}>{b.text}</h3>;
    case "ul":
      return <ul style={listStyle}>{b.items.map((it, i) => <li key={i} style={{ marginBottom: 4 }}>{it}</li>)}</ul>;
    case "ol":
      return <ol style={listStyle}>{b.items.map((it, i) => <li key={i} style={{ marginBottom: 4 }}>{it}</li>)}</ol>;
    case "code":
      return (
        <pre style={{ background: "#f3f4f6", border: `1px solid ${C.border}`, borderRadius: 10,
          padding: "13px 15px", overflowX: "auto", margin: "10px 0", fontFamily: mono,
          fontSize: 12.8, lineHeight: 1.55, color: "#1f2328", whiteSpace: "pre" }}>{b.code}</pre>
      );
    case "callout":
      return (
        <div style={{ borderLeft: `3px solid ${C.blue}`, background: "#eef6f0",
          borderRadius: "0 8px 8px 0", padding: "10px 14px", margin: "12px 0",
          fontFamily: C.sys, fontSize: 13.5, color: "#1f2328", lineHeight: 1.6 }}>{b.text}</div>
      );
    case "table":
      return <GuideTable headers={b.headers} rows={b.rows} />;
    case "diagram":
      return <Diagram kind={b.kind} data={b.data} caption={b.caption} />;
    default:
      return null;
  }
}

function GuideTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "12px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: C.sys, fontSize: 13 }}>
        <thead>
          <tr>{headers.map((h, i) => (
            <th key={i} style={{ textAlign: "left", padding: "8px 11px", color: C.muted,
              borderBottom: `2px solid ${C.border}`, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? "transparent" : "#f6f8fa" }}>
              {r.map((cell, j) => (
                <td key={j} style={{ padding: "8px 11px", color: C.text, verticalAlign: "top",
                  borderBottom: `1px solid ${C.border}`, lineHeight: 1.5 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const paraStyle = { fontFamily: C.font, fontSize: 14.5, lineHeight: 1.68, color: C.text, margin: "0 0 12px" };
const listStyle = { margin: "8px 0", paddingLeft: 22, color: C.text, fontFamily: C.sys, fontSize: 14, lineHeight: 1.6 };
