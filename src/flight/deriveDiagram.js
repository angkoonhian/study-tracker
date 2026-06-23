// ---------------------------------------------------------------------------
//  deriveDiagram.js · turn a coding problem's first test case into a Diagram
//  spec ({kind, data, caption}) so every problem gets an input visualization
//  with no hand-authoring. Returns null when the input isn't visualizable.
// ---------------------------------------------------------------------------

// Split a Python call's argument list at top-level commas.
function parseArgs(call) {
  const open = call.indexOf("(");
  const close = call.lastIndexOf(")");
  if (open < 0 || close < 0) return [];
  const inner = call.slice(open + 1, close);
  const args = [];
  let depth = 0, cur = "";
  for (const ch of inner) {
    if (ch === "[" || ch === "(" || ch === "{") depth++;
    if (ch === "]" || ch === ")" || ch === "}") depth--;
    if (ch === "," && depth === 0) { args.push(cur); cur = ""; } else cur += ch;
  }
  if (cur.trim()) args.push(cur);
  return args.map((a) => a.trim());
}

// Best-effort Python-literal → JS value (ints, strings, lists, bools, None).
function pyLit(s) {
  if (s == null) return undefined;
  try {
    return JSON.parse(s.replace(/\bNone\b/g, "null").replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false").replace(/'/g, '"'));
  } catch { return undefined; }
}

const isArr = Array.isArray;
const flat = (a) => isArr(a) && a.length > 0 && a.length <= 24 && a.every((x) => typeof x === "number" || typeof x === "string");
const grid2d = (a) => isArr(a) && a.length > 0 && a.every((r) => isArr(r));
const pairs = (a) => isArr(a) && a.length > 0 && a.every((r) => isArr(r) && r.length === 2);

export function deriveDiagram(problem) {
  const t = problem.tests && problem.tests[0];
  if (!t) return null;
  const args = parseArgs(t.call).map(pyLit);
  const a0 = args[0];
  const cap = `Example: ${t.call}`;
  try {
    switch (problem.topic) {
      case "Trees":
        return isArr(a0) ? { kind: "tree", data: { nodes: a0 }, caption: cap } : null;
      case "Linked List": {
        if (!isArr(a0)) return null;
        if (problem.id === "linked-list-cycle")
          return { kind: "linkedlist", data: { values: a0, cycleTo: typeof args[1] === "number" ? args[1] : -1 }, caption: cap };
        return flat(a0) ? { kind: "linkedlist", data: { values: a0 }, caption: cap } : null;
      }
      case "Graphs": {
        if (grid2d(a0)) return { kind: "grid", data: { cells: a0 }, caption: cap };
        if (typeof a0 === "number" && pairs(args[1]))
          return { kind: "graph", data: { nodes: Array.from({ length: a0 }, (_, i) => i), edges: args[1], directed: problem.id.includes("course") }, caption: cap };
        return null;
      }
      case "Tries":
        return null; // command-list inputs aren't visualizable as a structure
      default: {
        // arrays / heap / DP / two-pointers / sliding window / binary search /
        // greedy / bit / intervals / stack / backtracking with list inputs
        if (grid2d(a0)) return { kind: "grid", data: { cells: a0 }, caption: cap };
        if (flat(a0)) return { kind: "array", data: { values: a0 }, caption: cap };
        if (typeof a0 === "string" && a0.length > 0 && a0.length <= 24)
          return { kind: "array", data: { values: a0.split("") }, caption: cap };
        return null;
      }
    }
  } catch {
    return null;
  }
}
