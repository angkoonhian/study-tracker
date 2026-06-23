// End-to-end check of the in-browser runner WITHOUT a browser: load the real
// vendored Pyodide and run the EXACT harness pyRunner.js ships, for a correct
// solution (expect all pass) and a wrong one (expect a failure surfaced).
import { loadPyodide } from "../public/pyodide/pyodide.mjs";
import { buildHarness } from "../src/flight/pyRunner.js";
import { CODING } from "../src/data/flight/coding.js";

const py = await loadPyodide(); // indexURL defaults to public/pyodide → finds wasm/stdlib locally
const problem = CODING[0]; // two-sum

function run(code) {
  return JSON.parse(py.runPython(buildHarness(code, problem)));
}

// 1) reference solution → every test passes
const good = run(problem.solution);
const goodPass = good.compiled && good.results.every((r) => r.ok);

// 2) deliberately wrong solution → compiles, but tests fail (and we see got/want)
const bad = run(`def ${problem.funcName}(nums, target):\n    return [0, 0]`);
const badCaught = bad.compiled && bad.results.some((r) => !r.ok);

// 3) syntax error → compiled=false with an error message
const broken = run(`def ${problem.funcName}(nums, target)\n    return []`);
const brokenCaught = broken.compiled === false && !!broken.compileError;

console.log("reference solution all-pass :", goodPass, `(${good.results.filter(r=>r.ok).length}/${good.results.length})`);
console.log("wrong solution fails        :", badCaught, badCaught ? `(e.g. got ${bad.results.find(r=>!r.ok).got} want ${bad.results.find(r=>!r.ok).want})` : "");
console.log("syntax error surfaced       :", brokenCaught);

if (goodPass && badCaught && brokenCaught) {
  console.log("RUNNER OK");
  process.exit(0);
}
console.log("RUNNER FAILED");
process.exit(1);
