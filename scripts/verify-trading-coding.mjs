// Independent verifier for the Trading Prep coding dataset: exec each problem's
// `solution`, run every VISIBLE and HIDDEN test's `call`, assert it matches
// `expected` under the problem's checker (exact/unordered/seteq). Mirrors the
// in-browser runner (src/flight/pyRunner.js).
//
// NOTE: on this machine the `python3` command is a broken Windows app-execution
// stub, so we resolve the first working interpreter among python3/python/py.
import { TRADING_CODING } from "../src/data/trading/codingTrading.js";
import { CHECK_PY } from "../src/flight/pyRunner.js";
import { spawnSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function resolvePython() {
  for (const bin of ["python3", "python", "py"]) {
    const r = spawnSync(bin, ["--version"], { encoding: "utf8" });
    if (r.status === 0) return bin;
  }
  throw new Error("No working python interpreter found (tried python3, python, py)");
}

let pyProblems = "";
for (const p of TRADING_CODING) {
  const allTests = [...p.tests, ...(p.hidden || [])];
  const mode = JSON.stringify(p.checker || "exact");
  const tests = allTests
    .map((t) => `    _check(${JSON.stringify(p.id)}, ${mode}, ${JSON.stringify(t.call)}, (${t.call}), (${t.expected}))`)
    .join("\n");
  pyProblems += `
def _run_${p.id.replace(/[^a-z0-9]/gi, "_")}():
${p.solution.split("\n").map((l) => "    " + l).join("\n")}
${tests}
_run_${p.id.replace(/[^a-z0-9]/gi, "_")}()
`;
}

const py = `
${CHECK_PY}
FAILS = []
TOTAL = [0]
def _check(pid, mode, call, actual, expected):
    TOTAL[0] += 1
    if not __cmp(mode, actual, expected):
        FAILS.append((pid, call, repr(actual), repr(expected)))
${pyProblems}
print("PROBLEMS:", ${TRADING_CODING.length}, "TESTS:", TOTAL[0])
if FAILS:
    print("FAILURES:", len(FAILS))
    for f in FAILS:
        print("  ", f[0], "|", f[1], "-> got", f[2], "want", f[3])
    raise SystemExit(1)
print("ALL PASS")
`;

let bin;
try {
  bin = resolvePython();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

// Write to a temp file rather than passing via `-c`: the inlined program can
// exceed the OS command-line length limit (notably ~32K on Windows).
const tmp = join(tmpdir(), `verify-trading-${process.pid}.py`);
writeFileSync(tmp, py);
const res = spawnSync(bin, [tmp], { encoding: "utf8" });
try { rmSync(tmp); } catch { /* ignore */ }
process.stdout.write(res.stdout || "");
process.stderr.write(res.stderr || "");
process.exit(res.status ?? 1);
