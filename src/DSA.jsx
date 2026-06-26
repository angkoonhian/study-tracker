// ---------------------------------------------------------------------------
//  DSA.jsx  ·  Data Structures & Algorithms section.
//  Two tabs: Practice (in-browser Python coding) and Guide (reference).
//  Reads/writes flight.coding for progress persistence.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { C, SectionTitle, wrap } from "./ui/theme.jsx";
import CodingPractice from "./practice/CodingPractice.jsx";
import GuidesMode from "./flight/GuideView.jsx";
import { CODING } from "./data/flight/coding.js";

const TABS = [["practice", "Practice"], ["guide", "Guide"]];

export default function DSA({ flight, setFlight }) {
  const [tab, setTab] = useState("practice");
  const setCoding = (updater) =>
    setFlight((prev) => ({ ...prev, coding: updater(prev.coding || {}) }));
  return (
    <div style={wrap}>
      <SectionTitle kicker="Data structures & algorithms" title="DSA" />
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: tab === k ? C.blue : C.panel, color: tab === k ? "#fff" : C.muted,
            border: `1px solid ${C.border}`, borderRadius: 20, padding: "8px 16px",
            fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
          }}>{label}</button>
        ))}
      </div>
      {tab === "practice" && (
        <CodingPractice problems={CODING} progress={flight.coding || {}} setProgress={setCoding} />
      )}
      {tab === "guide" && <GuidesMode />}
    </div>
  );
}
