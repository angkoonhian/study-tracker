// ---------------------------------------------------------------------------
//  sync.js  ·  optional LeetCode account sync (the ONLY runtime call to
//  leetcode.com). Routed through the Vite dev proxy at /lc-api to dodge CORS,
//  so it works under `npm run dev`. No official API exists, so this is
//  best-effort and degrades gracefully.
//
//  Two modes:
//    • Authenticated (full): if you paste your LEETCODE_SESSION cookie into
//      settings, /api/problems/all/ returns per-problem solved status — every
//      solved problem can be auto-marked in the bank.
//    • Public (counts only): with just a username, we can read aggregate solved
//      counts + your last ~20 accepted submissions. The full per-problem list
//      is NOT exposed publicly by LeetCode.
//
//  The cookie lives only in localStorage (KEYS.secret) and is forwarded to the
//  proxy via custom headers; it is never written to progress.json.
// ---------------------------------------------------------------------------

const BASE = "/lc-api";

function authHeaders(secret) {
  const h = {};
  if (secret?.session) {
    h["x-lc-session"] = secret.session;
    if (secret.csrf) h["x-lc-csrf"] = secret.csrf;
  }
  return h;
}

// Full per-problem status. Returns { solved:[id], attempted:[id], authed }.
export async function fetchSolvedStatus(secret) {
  let res;
  try {
    res = await fetch(`${BASE}/api/problems/all/`, { headers: authHeaders(secret) });
  } catch {
    throw new Error("Can't reach LeetCode. Sync needs the dev proxy — run `npm run dev`.");
  }
  if (!res.ok) throw new Error(`LeetCode responded ${res.status}. Cookie may be expired.`);
  const data = await res.json();
  const solved = [];
  const attempted = [];
  for (const p of data.stat_status_pairs || []) {
    const id = p.stat?.frontend_question_id;
    if (id == null) continue;
    if (p.status === "ac") solved.push(id);
    else if (p.status === "notac") attempted.push(id);
  }
  return { solved, attempted, authed: !!secret?.session };
}

// Public aggregate stats (no cookie). Returns { counts, recentSlugs } or throws.
export async function fetchPublicStats(username) {
  if (!username) throw new Error("Set your LeetCode username in settings first.");
  const query = `
    query stats($u: String!) {
      matchedUser(username: $u) {
        submitStatsGlobal { acSubmissionNum { difficulty count } }
      }
      recentAcSubmissionList(username: $u, limit: 20) { titleSlug }
    }`;
  let res;
  try {
    res = await fetch(`${BASE}/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables: { u: username } }),
    });
  } catch {
    throw new Error("Can't reach LeetCode. Sync needs the dev proxy — run `npm run dev`.");
  }
  if (!res.ok) throw new Error(`LeetCode responded ${res.status}.`);
  const json = await res.json();
  const user = json?.data?.matchedUser;
  if (!user) throw new Error(`No public profile found for "${username}".`);
  const counts = {};
  for (const r of user.submitStatsGlobal.acSubmissionNum) counts[r.difficulty] = r.count;
  const recentSlugs = (json.data.recentAcSubmissionList || []).map((s) => s.titleSlug);
  return { counts, recentSlugs };
}

// Merge a sync result into the bank object (pure-ish: returns a new bank).
// Solved problems are marked "solved"; attempted ones bumped to "attempted"
// unless already solved. Never downgrades a manually-set status.
export function applySyncToBank(bank, { solved = [], attempted = [] }, now = Date.now()) {
  const next = { ...bank };
  const ORDER = { todo: 0, attempted: 1, review: 2, solved: 3 };
  const bump = (id, status) => {
    const cur = next[id] || {};
    if ((ORDER[cur.status] ?? -1) >= ORDER[status]) return; // don't downgrade
    next[id] = { ...cur, status, syncedAt: now };
  };
  for (const id of attempted) bump(id, "attempted");
  for (const id of solved) bump(id, "solved");
  return next;
}
