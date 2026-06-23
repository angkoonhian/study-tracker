// ---------------------------------------------------------------------------
//  theme.js  ·  shared light-theme tokens (GeeksforGeeks-style) + small UI
//  primitives, so the new views (Today / Problem Bank / Flashcards / Dashboard)
//  share one look without each re-declaring inline styles.
// ---------------------------------------------------------------------------

export const C = {
  pageBg: "#f6f8fa",
  text: "#1f2328",
  muted: "#57606a",
  faint: "#8c959f",
  blue: "#2f8d46",
  green: "#1a7f37",
  amber: "#9a6700",
  red: "#c0392b",
  panel: "#ffffff",
  panelSolid: "#ffffff",
  border: "#d0d7de",
  borderHi: "#2f8d46",
  chipBg: "#eef6f0",
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
    ["today", "Today"],
    ["tracker", "Tracker"],
    ["bank", "Problem Bank"],
    ["dsa", "DSA"],
    ["trading", "Trading Prep"],
    ["cards", "Flashcards"],
    ["flight", "Flight Mode"],
    ["dashboard", "Dashboard"],
  ];
  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,.85)",
      backdropFilter: "blur(6px)", position: "sticky", top: 0, zIndex: 30,
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "10px 18px", display: "flex",
        gap: 8, alignItems: "center", flexWrap: "wrap", fontFamily: C.sys,
      }}>
        <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1,
          color: C.blue, marginRight: 6 }}>QUANTPREP</span>
        {items.map(([k, label]) => {
          const active = view === k;
          return (
            <button key={k} onClick={() => setView(k)} style={{
              background: active ? C.blue : "#f3f4f6",
              color: active ? "#ffffff" : C.muted,
              border: `1px solid ${active ? C.blue : C.border}`,
              borderRadius: 18, padding: "6px 13px", fontSize: 12.5,
              fontWeight: 600, cursor: "pointer",
            }}>{label}</button>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setView("roles")} style={ghostBtn}>Roles</button>
          <button onClick={() => setView("framework")} style={ghostBtn}>Framework</button>
        </div>
      </div>
    </div>
  );
}

const ghostBtn = {
  background: C.chipBg, border: `1px solid ${C.border}`,
  color: C.blue, borderRadius: 18, padding: "6px 12px", fontSize: 12.5,
  cursor: "pointer", fontFamily: C.sys, fontWeight: 600,
};

export function Btn({ children, onClick, kind = "default", disabled, style, type = "button" }) {
  const kinds = {
    default: { bg: "#f3f4f6", bd: C.border, fg: C.text },
    primary: { bg: C.blue, bd: C.blue, fg: "#ffffff" },
    green: { bg: C.chipBg, bd: C.green, fg: C.green },
    danger: { bg: "transparent", bd: C.red, fg: C.red },
  }[kind];
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
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
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.text }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

export const wrap = { maxWidth: 1080, margin: "26px auto 0", padding: "0 18px" };
