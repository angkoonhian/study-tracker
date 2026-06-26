// ---------------------------------------------------------------------------
//  theme.jsx  ·  shared theme tokens (light + dark) + small UI primitives.
//
//  Two concrete hex palettes; the active one is chosen at module load from a
//  saved preference (default: dark). `C` stays a plain hex object so the
//  `${C.token}55` alpha-append idiom used across the app keeps working. The
//  toggle persists the choice and reloads to apply (instant in-place switching
//  would require making every token reactive, which breaks alpha-append) — the
//  app already reloads on import / reset, so this is consistent.
//
//  Each LIGHT value equals the literal the codebase previously hardcoded, so
//  the existing light theme is unchanged by the token migration; only the dark
//  palette introduces new appearance.
// ---------------------------------------------------------------------------

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif";

const LIGHT = {
  pageBg: "#f6f8fa", panel: "#ffffff", panelSolid: "#ffffff", soft: "#f3f4f6",
  text: "#1f2328", strong: "#111418", muted: "#57606a", faint: "#8c959f",
  blue: "#2f8d46", green: "#1a7f37", amber: "#9a6700", red: "#c0392b",
  border: "#d0d7de", borderHi: "#2f8d46", chipBg: "#eef6f0", subtle: "#e9eef3",
  onAccent: "#ffffff", navBar: "rgba(255,255,255,.85)", scrollThumb: "#c0c7ce",
  hintBg: "#fffaf0", okBg: "#eaf6ec", failBg: "#fbeaea", failBorder: "#e5b3b3", failText: "#9b2b2b",
};

const DARK = {
  pageBg: "#0d1117", panel: "#161b22", panelSolid: "#161b22", soft: "#21262d",
  text: "#e6edf3", strong: "#f0f6fc", muted: "#9aa4b2", faint: "#6e7681",
  blue: "#3fb950", green: "#56d364", amber: "#d29922", red: "#f85149",
  border: "#30363d", borderHi: "#3fb950", chipBg: "#12261a", subtle: "#21262d",
  onAccent: "#ffffff", navBar: "rgba(13,17,23,.85)", scrollThumb: "#30363d",
  hintBg: "#2b2611", okBg: "#0f2a17", failBg: "#2a1518", failBorder: "#5a2a30", failText: "#f0a3a3",
};

const THEME_KEY = "biginterview_theme_v1";

function readTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "light" || t === "dark") return t;
  } catch { /* storage unavailable */ }
  return "dark"; // default: dark
}

// Module-internal (not exported) so theme.jsx adds no new non-component exports.
const THEME = readTheme();

function doToggleTheme() {
  try { localStorage.setItem(THEME_KEY, THEME === "dark" ? "light" : "dark"); }
  catch { /* ignore */ }
  if (typeof window !== "undefined") window.location.reload();
}

export const C = { ...(THEME === "dark" ? DARK : LIGHT), font: FONT, sys: "system-ui" };

// Theme the area behind the app (and the pre-React first paint / overscroll).
if (typeof document !== "undefined") {
  document.documentElement.style.backgroundColor = C.pageBg;
}

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
      borderBottom: `1px solid ${C.border}`, background: C.navBar,
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
              background: active ? C.blue : C.soft,
              color: active ? C.onAccent : C.muted,
              border: `1px solid ${active ? C.blue : C.border}`,
              borderRadius: 18, padding: "6px 13px", fontSize: 12.5,
              fontWeight: 600, cursor: "pointer",
            }}>{label}</button>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setView("roles")} style={ghostBtn}>Roles</button>
          <button onClick={() => setView("framework")} style={ghostBtn}>Framework</button>
          <button onClick={doToggleTheme} title="Switch light / dark theme"
            style={ghostBtn}>{THEME === "dark" ? "Light" : "Dark"}</button>
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
    default: { bg: C.soft, bd: C.border, fg: C.text },
    primary: { bg: C.blue, bd: C.blue, fg: C.onAccent },
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
