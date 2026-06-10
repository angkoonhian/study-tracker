// ---------------------------------------------------------------------------
//  fetch-leetcode.mjs  ·  run with `npm run fetch:leetcode`
//
//  Pulls the full public LeetCode problem catalog (titles, slugs, difficulty,
//  topic tags, acceptance rate, paid flag) via the unofficial GraphQL endpoint
//  and writes a compact static snapshot to public/data/leetcode-problems.json.
//
//  This is the ONLY part of the app that talks to leetcode.com. The output is a
//  plain JSON file committed to the repo — so anyone who clones the repo gets
//  the exact same catalog without needing network access or an API. Re-run this
//  script whenever you want to refresh the catalog (new problems get added to
//  LeetCode over time).
//
//  No API key, no auth, no database. Just a static file generator.
// ---------------------------------------------------------------------------

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/data/leetcode-problems.json");

const ENDPOINT = "https://leetcode.com/graphql";
const PAGE = 100;

const QUERY = `
query problemList($skip: Int!, $limit: Int!) {
  problemsetQuestionList: questionList(
    categorySlug: ""
    limit: $limit
    skip: $skip
    filters: {}
  ) {
    total: totalNum
    questions: data {
      questionFrontendId
      title
      titleSlug
      difficulty
      isPaidOnly
      acRate
      topicTags { slug }
    }
  }
}`;

const DIFF = { Easy: "E", Medium: "M", Hard: "H" };

async function fetchPage(skip) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "referer": "https://leetcode.com/problemset/all/",
      "user-agent": "study-tracker-catalog-fetch",
    },
    body: JSON.stringify({ query: QUERY, variables: { skip, limit: PAGE } }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} at skip=${skip}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 300));
  return json.data.problemsetQuestionList;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("Fetching LeetCode catalog…");
  const first = await fetchPage(0);
  const total = first.total;
  console.log(`Total problems reported: ${total}`);

  const all = [...first.questions];
  for (let skip = PAGE; skip < total; skip += PAGE) {
    await sleep(250); // be polite to the endpoint
    const page = await fetchPage(skip);
    all.push(...page.questions);
    process.stdout.write(`\r  fetched ${all.length}/${total}`);
  }
  process.stdout.write("\n");

  // Compact, stable shape. Sorted by numeric problem id for deterministic diffs.
  const problems = all
    .map((q) => ({
      id: Number(q.questionFrontendId),
      title: q.title,
      slug: q.titleSlug,
      diff: DIFF[q.difficulty] || "M",
      paid: q.isPaidOnly ? 1 : 0,
      ac: Math.round(q.acRate * 10) / 10,
      topics: q.topicTags.map((t) => t.slug).sort(),
    }))
    .sort((a, b) => a.id - b.id);

  const out = {
    generatedAtNote: "Snapshot of the public LeetCode catalog. Re-run npm run fetch:leetcode to refresh.",
    count: problems.length,
    problems,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out));
  console.log(`Wrote ${problems.length} problems → ${OUT}`);
}

main().catch((e) => {
  console.error("\nfetch-leetcode failed:", e.message);
  process.exit(1);
});
