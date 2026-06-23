// Independent verifier: exec each problem's `solution`, run every VISIBLE and
// HIDDEN test's `call`, assert it matches `expected` under the problem's checker
// (exact/unordered/seteq) in python3. Mirrors the in-browser runner.
import { CODING } from "../src/data/flight/coding.js";
import { CHECK_PY } from "../src/flight/pyRunner.js";
import { spawnSync } from "node:child_process";

let pyProblems = "";
for (const p of CODING) {
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
print("PROBLEMS:", ${CODING.length}, "TESTS:", TOTAL[0])
if FAILS:
    print("FAILURES:", len(FAILS))
    for f in FAILS:
        print("  ", f[0], "|", f[1], "-> got", f[2], "want", f[3])
    raise SystemExit(1)
print("ALL PASS")
`;

const res = spawnSync("python3", ["-c", py], { encoding: "utf8" });
process.stdout.write(res.stdout || "");
process.stderr.write(res.stderr || "");
process.exit(res.status ?? 1);
