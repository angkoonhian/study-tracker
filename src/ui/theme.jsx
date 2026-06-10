// ---------------------------------------------------------------------------
//  theme.js  ·  shared dark-theme tokens + small UI primitives, so the new
//  views (Today / Problem Bank / Flashcards / Dashboard) share one look without
//  each re-declaring inline styles. Matches the existing tracker palette.
// ---------------------------------------------------------------------------

export const C = {
  pageBg: "radial-gradient(ellipse at top, #16243B 0%, #0B1422 60%, #070D16 100%)",
  text: "#E8EDF4",
  muted: "#8AA1C2",
  faint: "#5E7DA8",
  blue: "#6FA8FF",
  green: "#5FD79E",
  amber: "#E0A23B",
  red: "#E2566F",
  panel: "linear-gradient(180deg,#101D33,#0C1626)",
  panelSolid: "#0E1B30",
  border: "#1F2F47",
  borderHi: "#2F66C4",
  chipBg: "#1C2C44",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif",
  sys: "system-ui",
};

export const page = {
  minHeight: "100vh",
  background: C.pageBg,
  fontFamily: C.font,
  color: C.text,
  padding: "0 0 80px 0",
};

export function GlobalNav({ view, setView }) {
  const items = [
    ["today", "🔥 Today"],
    ["tracker", "🗓 Tracker"],
    ["bank", "📚 Problem Bank"],
    ["cards", "🃏 Flashcards"],
    ["dashboard", "📊 Dashboard"],
  ];
  return (
    <div style={{
      borderBottom: "1px solid #243650", background: "rgba(8,14,24,.7)",
      backdropFilter: "blur(6px)", position: "sticky", top: 0, zIndex: 30,
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "10px 18px", display: "flex",
        gap: 8, alignItems: "center", flexWrap: "wrap", fontFamily: C.sys,
      }}>
        <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1,
          color: C.blue, marginRight: 6 }}>BIGINTERVIEW</span>
        {items.map(([k, label]) => {
          const active = view === k;
          return (
            <button key={k} onClick={() => setView(k)} style={{
              background: active ? C.blue : "rgba(255,255,255,.04)",
              color: active ? "#08101F" : "#AFC3E0",
              border: `1px solid ${active ? C.blue : "#2A3C56"}`,
              borderRadius: 18, padding: "6px 13px", fontSize: 12.5,
              fontWeight: 600, cursor: "pointer",
            }}>{label}</button>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setView("roles")} style={ghostBtn}>🎯 Roles</button>
          <button onClick={() => setView("framework")} style={ghostBtn}>📐 Framework</button>
        </div>
      </div>
    </div>
  );
}

const ghostBtn = {
  background: "rgba(111,168,255,.07)", border: "1px solid #2A3C56",
  color: "#9CC0F5", borderRadius: 18, padding: "6px 12px", fontSize: 12.5,
  cursor: "pointer", fontFamily: C.sys, fontWeight: 600,
};

export function Btn({ children, onClick, kind = "default", disabled, style }) {
  const kinds = {
    default: { bg: "rgba(255,255,255,.05)", bd: "#2A3C56", fg: C.text },
    primary: { bg: C.blue, bd: C.blue, fg: "#08101F" },
    green: { bg: "rgba(95,215,158,.1)", bd: "#27613F", fg: C.green },
    danger: { bg: "transparent", bd: "#5A2A38", fg: C.red },
  }[kind];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: kinds.bg, border: `1px solid ${kinds.bd}`, color: kinds.fg,
      borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      fontFamily: C.sys, ...style,
    }}>{children}</button>
  );
}

export function Panel({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "18px 20px", ...style }}>{children}</div>
  );
}

export function SectionTitle({ kicker, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end",
      justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
      <div>
        {kicker && <div style={{ fontSize: 12, letterSpacing: 3,
          textTransform: "uppercase", color: C.faint, marginBottom: 6,
          fontFamily: C.sys }}>{kicker}</div>}
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#F4F8FE" }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

export const wrap = { maxWidth: 1080, margin: "26px auto 0", padding: "0 18px" };
