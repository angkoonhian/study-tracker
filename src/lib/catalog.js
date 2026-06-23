// ---------------------------------------------------------------------------
//  catalog.js  ·  loads the static LeetCode problem catalog once and caches it.
//  The catalog is a committed JSON file in public/data — no network needed at
//  runtime to read it (only the optional account sync touches leetcode.com).
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";

let cache = null; // resolved { count, problems }
let inflight = null; // de-dupes concurrent loads

const URL = `${import.meta.env.BASE_URL}data/leetcode-problems.json`;

export function loadCatalog() {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch(URL)
    .then((r) => {
      if (!r.ok) throw new Error(`catalog HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      cache = data;
      inflight = null;
      return data;
    })
    .catch((e) => {
      inflight = null;
      throw e;
    });
  return inflight;
}

// React hook: { problems, count, loading, error }
export function useCatalog() {
  const [state, setState] = useState(() =>
    cache ? { ...cache, loading: false, error: null }
          : { problems: [], count: 0, loading: true, error: null });

  useEffect(() => {
    if (cache) return;
    let alive = true;
    loadCatalog()
      .then((d) => alive && setState({ ...d, loading: false, error: null }))
      .catch((e) => alive && setState({ problems: [], count: 0, loading: false, error: e.message }));
    return () => { alive = false; };
  }, []);

  return state;
}

export const DIFF_LABEL = { E: "Easy", M: "Medium", H: "Hard" };
export const DIFF_COLOR = { E: "#1a7f37", M: "#E0A23B", H: "#E2566F" };

const SPECIAL = {
  "depth-first-search": "DFS",
  "breadth-first-search": "BFS",
  "ordered-map": "Ordered Map",
  "bit-manipulation": "Bit Manipulation",
};

// Turn a topic slug into a readable label ("hash-table" -> "Hash Table").
export function topicLabel(slug) {
  if (SPECIAL[slug]) return SPECIAL[slug];
  return slug.replace(/(^|-)([a-z])/g, (_, sep, c) => (sep ? " " : "") + c.toUpperCase()).trim();
}
