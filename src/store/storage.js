// ---------------------------------------------------------------------------
//  storage.js  ·  the single owner of all persistence
//
//  Model (NO database, fully static):
//    • The committed src/data/progress.json is the PUBLISHED snapshot. A fresh
//      clone with empty localStorage hydrates from it — so pulling master
//      replicates exactly the published progress.
//    • localStorage is the live working copy. Once you interact, it shadows the
//      seed. "Publish snapshot" exports a new progress.json you commit; "Reset
//      to published" clears localStorage so you fall back to the committed seed.
//
//  Every read falls back to the seed slice; every write goes to localStorage.
//  The LeetCode session cookie is kept in a SEPARATE key that is never exported
//  (it's a secret, and must not land in a committed progress.json).
// ---------------------------------------------------------------------------

import seed from "../data/progress.json";
import { PATTERN_CARDS } from "../data/patternCards.js";

export const KEYS = {
  tracker: "biginterview_tracker_v1", // unchanged — preserves existing progress
  bank: "biginterview_bank_v1",
  cards: "biginterview_cards_v1",
  settings: "biginterview_settings_v1",
  secret: "biginterview_secret_v1", // LeetCode cookie — never exported
  flight: "biginterview_flight_v1", // offline Flight Mode progress (local only)
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) return JSON.parse(raw);
  } catch {
    // corrupt JSON or storage unavailable — fall through to seed
  }
  return structuredClone(fallback);
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded / storage disabled — app still works in-session
  }
}

// ---- tracker (49-day checklist done-flags) ----
export const loadTracker = () => read(KEYS.tracker, seed.tracker || {});
export const saveTracker = (v) => write(KEYS.tracker, v);

// ---- bank (per-problem user state: status, srs, notes) ----
export const loadBank = () => read(KEYS.bank, seed.bank || {});
export const saveBank = (v) => write(KEYS.bank, v);

// ---- settings (lcUsername, etc. — public, exportable) ----
export const loadSettings = () => read(KEYS.settings, seed.settings || {});
export const saveSettings = (v) => write(KEYS.settings, v);

// ---- secret (LeetCode session cookie — local only, never exported) ----
export const loadSecret = () => read(KEYS.secret, {});
export const saveSecret = (v) => write(KEYS.secret, v);

// ---- flight (offline Flight Mode: solved problems, teaser ratings, math stats) ----
export const loadFlight = () =>
  read(KEYS.flight, { coding: {}, teasers: {}, math: { rounds: [] }, design: {} });
export const saveFlight = (v) => write(KEYS.flight, v);

// ---- cards (flashcard deck) ----
// Pattern cards are merged in by id so a fresh deck always has the seed deck and
// new seed cards reach existing users — without overwriting their srs schedule.
export function loadCards() {
  const stored = read(KEYS.cards, seed.cards || []);
  const byId = new Map(stored.map((c) => [c.id, c]));
  for (const pc of PATTERN_CARDS) {
    if (!byId.has(pc.id)) byId.set(pc.id, { ...pc, srs: null });
  }
  return [...byId.values()];
}
export const saveCards = (v) => write(KEYS.cards, v);

// ---- export / import / reset (the "publish snapshot" machinery) ----
export function exportAll() {
  return {
    version: 1,
    exportedNote:
      "Replace src/data/progress.json with this file, then commit + push to publish.",
    tracker: loadTracker(),
    bank: loadBank(),
    cards: loadCards().map(({ srs, id }) => ({ id, srs })), // schedule only; defs come from code+catalog
    cardsFull: loadCards(), // full card objects so manual/auto cards survive a restore
    settings: loadSettings(),
  };
}

export function importAll(obj) {
  if (!obj || typeof obj !== "object") throw new Error("Invalid snapshot file");
  if (obj.tracker) saveTracker(obj.tracker);
  if (obj.bank) saveBank(obj.bank);
  if (obj.cardsFull) saveCards(obj.cardsFull);
  else if (obj.cards) saveCards(obj.cards);
  if (obj.settings) saveSettings(obj.settings);
}

// Clear the live working copy so the next load falls back to the committed seed.
export function resetToPublished() {
  for (const k of [KEYS.tracker, KEYS.bank, KEYS.cards, KEYS.settings]) {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  }
}
