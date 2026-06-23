// ---------------------------------------------------------------------------
//  pyRunner.js · in-browser Python execution for offline Flight Mode.
//
//  Loads Pyodide from the LOCALLY VENDORED copy in /public/pyodide (see
//  `npm run vendor:pyodide`), so it works with NO network — exactly what you
//  need on a plane. The runtime is lazy-loaded the first time you run code,
//  then cached as a singleton promise for the rest of the session.
// ---------------------------------------------------------------------------

let _pyPromise = null;

// Load (once) and return the Pyodide instance. `onStatus` receives short
// human-readable progress strings for the UI banner.
export function getPyodide(onStatus = () => {}) {
  if (!_pyPromise) {
    _pyPromise = (async () => {
      onStatus("Loading Python runtime (local)…");
      // Build the URL at RUNTIME so Vite's import-analysis can't resolve it as a
      // literal (it forbids static imports of files in /public). The browser then
      // does a native dynamic import of the locally-served, vendored runtime.
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/pyodide/pyodide.mjs`;
      const mod = await import(/* @vite-ignore */ url);
      const py = await mod.loadPyodide({ indexURL: `${origin}/pyodide/` });
      onStatus("Python ready");
      return py;
    })().catch((err) => {
      _pyPromise = null; // allow retry on failure
      throw err;
    });
  }
  return _pyPromise;
}

export function isPyReady() {
  return _pyPromise != null;
}

// Python comparison helper shared by the in-browser harness and the Node
// verifier. `mode` is the problem's `checker`: "exact" | "unordered" | "seteq".
// Kept as a string so both runners inject the identical logic.
export const CHECK_PY = `
def __norm(mode, v):
    if mode == 'unordered':
        return sorted(v)
    if mode == 'seteq':
        return sorted(sorted(x) for x in v)
    return v
def __cmp(mode, actual, expected):
    try:
        if mode == 'exact':
            return actual == expected
        return __norm(mode, actual) == __norm(mode, expected)
    except Exception:
        return False
`;

// Build a self-contained Python harness: exec the user's code in a fresh
// namespace, run every visible AND hidden test (comparing with the problem's
// checker), capture stdout, and emit a JSON result string as the final
// expression. Each result is tagged `hidden` so the UI can collapse hidden
// tests until one fails. Exported so a Node-side test can exercise the same path.
export function buildHarness(userCode, problem) {
  const mode = problem.checker || "exact";
  const rows = [
    ...problem.tests.map((t) => ({ ...t, hidden: false })),
    ...(problem.hidden || []).map((t) => ({ ...t, hidden: true })),
  ];
  const tests = rows
    .map((t) => `(${JSON.stringify(t.call)}, ${JSON.stringify(t.expected)}, ${t.hidden ? "True" : "False"})`)
    .join(", ");
  return `
import json, io, contextlib, traceback
${CHECK_PY}
__mode = ${JSON.stringify(mode)}
__out = io.StringIO()
__ns = {}
__compiled = True
try:
    with contextlib.redirect_stdout(__out):
        exec(${JSON.stringify(userCode)}, __ns)
except Exception:
    __compiled = False
    __err = traceback.format_exc()
__results = []
if __compiled:
    for __call, __expected, __hidden in [${tests}]:
        try:
            with contextlib.redirect_stdout(__out):
                __actual = eval(__call, __ns)
                __want = eval(__expected, __ns)
            __results.append({"call": __call, "ok": __cmp(__mode, __actual, __want),
                              "got": repr(__actual), "want": repr(__want),
                              "error": None, "hidden": __hidden})
        except Exception:
            __results.append({"call": __call, "ok": False, "got": None,
                              "want": __expected, "error": traceback.format_exc(),
                              "hidden": __hidden})
json.dumps({"compiled": __compiled,
            "compileError": (None if __compiled else __err),
            "results": __results,
            "stdout": __out.getvalue()})
`;
}

// Run the user's code against a problem's tests. Resolves to:
//   { compiled, compileError, results: [{call, ok, got, want, error, hidden}],
//     stdout, passed, total, hiddenPassed, hiddenTotal, allPass }
// `passed`/`total` count VISIBLE (sample) tests; hidden counts are separate.
export async function runProblem(userCode, problem, onStatus = () => {}) {
  const py = await getPyodide(onStatus);
  const raw = py.runPython(buildHarness(userCode, problem));
  const parsed = JSON.parse(raw);
  const results = parsed.results || [];
  const visible = results.filter((r) => !r.hidden);
  const hidden = results.filter((r) => r.hidden);
  const passed = visible.filter((r) => r.ok).length;
  const hiddenPassed = hidden.filter((r) => r.ok).length;
  const allPass =
    parsed.compiled && results.length > 0 && results.every((r) => r.ok);
  return {
    ...parsed,
    passed,
    total: visible.length,
    hiddenPassed,
    hiddenTotal: hidden.length,
    allPass,
  };
}
