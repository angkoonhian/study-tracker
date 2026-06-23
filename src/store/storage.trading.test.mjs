import { test } from "node:test";
import assert from "node:assert/strict";

// Minimal localStorage shim so storage.js runs under node.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
})();
globalThis.structuredClone ??= (x) => JSON.parse(JSON.stringify(x));

const s = await import("./storage.js");

test("trading slice has the default shape", () => {
  const t = s.loadTrading();
  assert.deepEqual(t, { coding: {}, trivia: {} });
});

test("trading slice round-trips through save/load", () => {
  s.saveTrading({ coding: { "lob-match": { solved: true } }, trivia: { "mut-default": { seen: true } } });
  assert.equal(s.loadTrading().coding["lob-match"].solved, true);
});

test("exportAll includes trading; importAll restores it", () => {
  s.saveTrading({ coding: { x: { solved: true } }, trivia: {} });
  const dump = s.exportAll();
  assert.ok(dump.trading, "export has trading");
  s.saveTrading({ coding: {}, trivia: {} });
  s.importAll(dump);
  assert.equal(s.loadTrading().coding.x.solved, true);
});

test("resetToPublished clears trading", () => {
  s.saveTrading({ coding: { y: { solved: true } }, trivia: {} });
  s.resetToPublished();
  assert.deepEqual(s.loadTrading(), { coding: {}, trivia: {} });
});
