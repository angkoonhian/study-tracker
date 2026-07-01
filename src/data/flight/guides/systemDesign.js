export default {
  id: "system-design",
  title: "System Design",
  subtitle: "A readable handbook: the 7-step framework, the building blocks, and canonical walkthroughs",
  emoji: "",
  intro: `System design interviews scare people because they feel open-ended. They are not. A good design answer follows a fixed method, is grounded in numbers, and says its trade-offs out loud. The interviewer is not looking for the "right" architecture — there isn't one — they are watching how you reason: do you nail down requirements before drawing boxes, do you estimate scale before choosing a database, do you notice the bottleneck and name the failure modes.\n\nThis handbook is written to be read start to finish or dipped into. The first sections give you the spine: a mindset, a 7-step framework, and back-of-envelope estimation. The middle sections are a tour of the building blocks — networking, load balancing, caching, CDNs, databases, replication and sharding, consistency, consistent hashing, queues, rate limiting, reliability patterns, and observability. The last sections apply everything end to end in three canonical designs (a URL shortener, a news feed, and a real-time market-data feed), then close with what interviewers actually grade and a one-page cheat sheet.\n\nTable of contents: (1) How to use this + the mindset, (2) The 7-step framework, (3) Back-of-envelope estimation, (4) Networking and protocols, (5) Load balancing, (6) Caching, (7) CDNs, (8) SQL vs NoSQL, (9) Scaling a database, (10) Consistency and CAP, (11) Consistent hashing, (12) Message queues and streaming, (13) Rate limiting, (14) Idempotency, retries, and reliability, (15) Observability, (16) Partitioning and replication trade-offs, (17) Walkthrough: URL shortener, (18) Walkthrough: news feed, (19) Walkthrough: real-time market-data feed, (20) What interviewers grade and the cheat sheet.`,
  sections: [
    {
      heading: "1. How to use this handbook and the mindset",
      blocks: [
        { type: "p", text: `Read sections 1 through 3 until the framework and the estimation math are muscle memory — they are the load-bearing parts. Sections 4 through 16 are a reference tour of the building blocks; skim them once, then return to whichever one a problem forces you to reason about. Sections 17 through 19 show the whole method applied end to end. Section 20 tells you what you are actually being graded on.` },
        { type: "p", text: `Three habits separate strong candidates from the rest. They are worth internalising before any specific technology.` },
        { type: "h3", text: "1.1 Requirements first, always" },
        { type: "p", text: `Never draw a box until you know what the system must do and how big it is. The single most common failure is jumping to "I'll use Kafka and Cassandra" before establishing whether the workload is read-heavy or write-heavy, whether reads must be strongly consistent, and whether we are serving thousands or billions of requests. Spend the first few minutes clarifying scope. It is not wasted time; it is the interview.` },
        { type: "h3", text: "1.2 Numbers always" },
        { type: "p", text: `Every architectural choice should be justified by a number. "We need a cache" is weak. "At 50k reads per second with a 95 percent hit rate, the database only sees 2.5k QPS, which one replica can handle" is strong. You do not need precise numbers — order of magnitude is enough — but you must produce them. Estimation is covered in section 3 and used throughout.` },
        { type: "h3", text: "1.3 Trade-offs out loud" },
        { type: "p", text: `There is no free lunch in distributed systems. Every choice buys something and costs something: more consistency costs latency, more replication costs write throughput and storage, more caching costs staleness. Say the trade-off as you make the choice. "I'll use eventual consistency here because the feed can be a few seconds stale, and that buys me cheap horizontal read scaling" is exactly the sentence interviewers want to hear.` },
        { type: "callout", text: `The meta-point: the interview is a conversation about reasoning, not a quiz about technologies. A candidate who derives a simple correct design out loud beats one who name-drops a complex one silently. When in doubt, state your assumption, make a choice, and explain the trade-off.` }
      ]
    },
    {
      heading: "2. The 7-step framework",
      blocks: [
        { type: "p", text: `This is the spine of every answer. Walk the seven steps in order, out loud, and you will never freeze. Each step is one sentence of intent below; the rest of the handbook fills in the detail.` },
        { type: "ol", items: [
          `Requirements. Pin down functional requirements (what the system does), non-functional requirements (latency, availability, consistency, durability), and scale (users, QPS, data volume). Clarify scope explicitly and write assumptions down.`,
          `Estimates. Back-of-envelope the numbers that will drive design: QPS (average and peak), storage per year, bandwidth, and how much fits in memory. This tells you where the pressure is.`,
          `API. Define the handful of endpoints or RPCs the system exposes. This forces you to nail down the data contract before internal design and reveals read/write shapes.`,
          `Data model. Define the core entities, their relationships, and the primary access patterns. The access patterns decide SQL vs NoSQL and the partition key.`,
          `High-level design. Draw the boxes: clients, load balancer, app servers, caches, databases, queues. Get the request flowing end to end at a coarse level before zooming in.`,
          `Deep dive. Zoom into the one or two components that are hard for this problem — the sharding scheme, the fan-out strategy, the consistency model — and design them properly.`,
          `Trade-offs, bottlenecks, and failure modes. Name where the system breaks under load, what happens when each component fails, and what you would monitor. Close the loop.`
        ]},
        { type: "callout", text: `The framework is fractal: the deep dive (step 6) often runs its own mini version of steps 1 through 5 on a subcomponent. And you will loop back — an estimate in step 2 may change a data-model choice in step 4. That is normal and good; narrate the loop.` },
        { type: "h3", text: "2.1 Requirements: the three buckets" },
        { type: "table", headers: ["Bucket", "Questions to ask", "Examples"], rows: [
          ["Functional", "What must it do? Which features are in scope?", "Post a tweet, read a timeline, follow a user, shorten a URL, redirect."],
          ["Non-functional", "How fast, how available, how consistent, how durable?", "p99 read latency under 200ms, 99.99% availability, reads can be seconds-stale, no data loss."],
          ["Scale", "How many users, requests, and bytes?", "100M DAU, 10k write QPS, 500k read QPS, 100TB over 5 years."]
        ]},
        { type: "p", text: `A tip on scoping: interviewers deliberately give a huge problem ("design Twitter") and expect you to cut it down. Pick two or three core features, say the rest is out of scope, and get the interviewer to agree. Designing the whole of Twitter in 45 minutes is not the goal; designing the read/write path for tweets and timelines well is.` }
      ]
    },
    {
      heading: "3. Back-of-envelope estimation",
      blocks: [
        { type: "p", text: `Estimation is the skill that makes the rest of the interview quantitative. You do not need arithmetic precision; you need the right formula and an order of magnitude. Round aggressively: a year is about 30 million seconds, a day is about 100k seconds (86,400, round to 10^5).` },
        { type: "h3", text: "3.1 QPS from users" },
        { type: "p", text: `The core throughput formula converts daily active users into requests per second, then adds a peak multiplier because traffic is never uniform.` },
        { type: "code", code: `average QPS = DAU * actions_per_user_per_day / 86,400
peak QPS    = average QPS * peak_factor      (peak_factor typically 2-3x)

# Separate reads from writes -- they scale differently and
# usually the read:write ratio is the single most important number.` },
        { type: "p", text: `Always split reads from writes. A read-heavy system (100:1, like a social feed) is a caching and replication problem. A write-heavy system (like ingesting metrics or trades) is a sharding and queueing problem. The ratio determines the shape of the whole design.` },
        { type: "h3", text: "3.2 Storage and bandwidth" },
        { type: "code", code: `storage = items_per_day * bytes_per_item * retention_days * replication_factor
bandwidth (bytes/sec) = QPS * bytes_per_response

# Replication factor is usually 3 (one leader + two followers, or
# three copies across availability zones). Don't forget it -- it is
# the difference between 100TB and 300TB.` },
        { type: "h3", text: "3.3 The latency ladder" },
        { type: "p", text: `You should be able to place any operation on this ladder from memory. It is the reason we cache, colocate, and avoid cross-region calls in the hot path.` },
        { type: "table", headers: ["Operation", "Rough latency", "Implication"], rows: [
          ["L1/L2 CPU cache reference", "~1 ns", "Effectively free."],
          ["Main memory (RAM) reference", "~100 ns", "In-memory cache hit; ~10 million/sec per core."],
          ["SSD random read", "~100 us (0.1 ms)", "1000x slower than RAM. This is why hot data lives in RAM."],
          ["Datacenter network round trip", "~0.5 ms", "Same-region service call."],
          ["Read 1 MB sequentially from SSD", "~1 ms", "Bulk reads are cheap per byte."],
          ["HDD disk seek", "~10 ms", "100x slower than SSD seek; avoid random HDD access."],
          ["Cross-region round trip (e.g. US-EU)", "~50-150 ms", "Never in the synchronous hot path if you can avoid it."]
        ]},
        { type: "callout", text: `The one takeaway: memory is roughly 1000x faster than SSD, which is roughly 1000x faster than a cross-region hop. When a design has a latency budget of 200ms, a single cross-region synchronous call can eat most of it. This is why we replicate data close to users and cache aggressively.` },
        { type: "h3", text: "3.4 Powers of two and data-size cheats" },
        { type: "table", headers: ["Quantity", "Approx value", "Use"], rows: [
          ["2^10", "~1 thousand (KB)", "Kilobyte."],
          ["2^20", "~1 million (MB)", "Megabyte."],
          ["2^30", "~1 billion (GB)", "Gigabyte; also ~1 billion for population-scale counts."],
          ["2^32", "~4 billion", "Max unsigned 32-bit int; ID space limit to watch for."],
          ["2^40", "~1 trillion (TB)", "Terabyte."],
          ["char / short", "1-2 bytes", "ASCII char, small int."],
          ["int / timestamp", "4-8 bytes", "Sizing rows and IDs."],
          ["UUID", "16 bytes", "Sizing keys."]
        ]},
        { type: "h3", text: "3.5 A worked example" },
        { type: "p", text: `Suppose we design a photo-sharing service. 100M DAU, each user views 50 photos/day and uploads 1 photo/day. Average photo is 1 MB, kept 5 years, replicated 3x.` },
        { type: "code", code: `Reads (views):
  100M * 50 / 86,400  =~ 58,000 read QPS average
  peak (3x)           =~ 174,000 read QPS

Writes (uploads):
  100M * 1 / 86,400   =~ 1,160 write QPS average
  peak (3x)           =~ 3,500 write QPS

Read:write ratio =~ 50:1  ->  read-heavy: cache + read replicas + CDN.

Storage per year:
  100M uploads/day * 1 MB * 365 days   =~ 36.5 PB/year (raw)
  * 3 replication                       =~ 110 PB/year stored

Bandwidth (read):
  58,000 QPS * 1 MB =~ 58 GB/s served  -> a CDN is mandatory, not optional.` },
        { type: "p", text: `Notice how much the design fell out of the numbers: 50:1 reads means a CDN and read replicas; 58 GB/s of egress means we absolutely cannot serve images from origin; 110 PB/year means blob storage (S3-style), not a relational database, for the photo bytes. We have not drawn a single box yet and the architecture is already implied. That is the power of estimating first.` }
      ]
    },
    {
      heading: "4. Networking and protocols",
      blocks: [
        { type: "p", text: `The protocol choice is usually the first "internal" decision. It is driven by one question: who initiates messages, and how often? Request/response, streaming, and push each have a natural fit.` },
        { type: "table", headers: ["Protocol", "Model", "Best for", "Cost / caveat"], rows: [
          ["HTTP/REST", "Request/response, stateless, text (JSON)", "Public APIs, CRUD, wide client support, cacheable GETs", "Verbose; no server push; one request per response."],
          ["gRPC", "Request/response + streaming, binary (protobuf), HTTP/2", "Internal service-to-service, low latency, strong typed contracts", "Not browser-native without a proxy; harder to debug by hand."],
          ["WebSockets", "Full-duplex, persistent connection", "Chat, live dashboards, multiplayer, anything with bidirectional push", "Stateful connection to manage; scaling connection fan-out is work."],
          ["Server-Sent Events (SSE)", "Server -> client push over one HTTP connection", "One-way live updates (feeds, notifications, price ticks to a browser)", "Server-to-client only; client uses normal HTTP to send."],
          ["Long polling", "Client holds a request open until data is ready", "Push-like behaviour where WebSockets/SSE aren't available", "Wastes connections and adds latency; a fallback, not a first choice."]
        ]},
        { type: "p", text: `Rule of thumb: REST for public and CRUD, gRPC between internal services, and a push protocol (WebSockets for two-way, SSE for one-way) when the server must notify clients without being asked. Long polling is the legacy fallback when nothing else is available.` },
        { type: "h3", text: "4.1 Idempotency of HTTP verbs" },
        { type: "p", text: `An operation is idempotent if performing it many times has the same effect as performing it once. This matters enormously for reliability: on a network you must retry, and retries are only safe if the operation is idempotent. The HTTP spec assigns idempotency to verbs.` },
        { type: "table", headers: ["Verb", "Idempotent?", "Safe (read-only)?", "Typical use"], rows: [
          ["GET", "Yes", "Yes", "Fetch a resource; cacheable."],
          ["PUT", "Yes", "No", "Replace a resource at a known ID; retry-safe."],
          ["DELETE", "Yes", "No", "Remove a resource; deleting twice is still deleted."],
          ["POST", "No", "No", "Create a new resource; retrying may create duplicates."],
          ["PATCH", "Not necessarily", "No", "Partial update; idempotent only if the patch is absolute, not relative."]
        ]},
        { type: "callout", text: `POST is the dangerous one. Because it is not idempotent, a client that times out and retries a "create order" POST can create two orders. The fix is an idempotency key (section 14): the client sends a unique key with the request and the server deduplicates. Design write APIs so that retries are always safe.` }
      ]
    },
    {
      heading: "5. Load balancing",
      blocks: [
        { type: "p", text: `A load balancer spreads incoming requests across a pool of servers so no single machine is overwhelmed and so the system survives individual failures. It is also the natural place for health checking, TLS termination, and (sometimes) rate limiting.` },
        { type: "h3", text: "5.1 Layer 4 vs Layer 7" },
        { type: "table", headers: ["", "L4 (transport)", "L7 (application)"], rows: [
          ["Operates on", "IP + TCP/UDP; forwards packets", "HTTP; reads the request itself"],
          ["Can route by", "Source/dest IP and port", "URL path, headers, cookies, method"],
          ["Speed", "Faster, lower overhead", "Slower; must parse the request"],
          ["Use when", "Raw throughput, protocol-agnostic", "Content-based routing, sticky sessions, path-based microservice routing"]
        ]},
        { type: "h3", text: "5.2 Balancing algorithms" },
        { type: "ul", items: [
          `Round robin. Rotate through servers in order. Simple; assumes requests are roughly equal in cost and servers are roughly equal in capacity.`,
          `Weighted round robin. Round robin biased toward more powerful machines. Good for heterogeneous pools.`,
          `Least connections. Send the next request to the server with the fewest active connections. Better when request durations vary widely (some requests hold the server for a long time).`,
          `Hashing (e.g. by client IP or user ID). Deterministically map a key to a server. Gives session affinity for free, but rebalances badly on resize unless you use consistent hashing (section 11).`
        ]},
        { type: "h3", text: "5.3 Health checks and sticky sessions" },
        { type: "p", text: `Health checks are what make the load balancer a reliability tool, not just a distributor. The LB periodically pings each server (active check) or watches error rates (passive check) and stops routing to unhealthy instances until they recover. Without health checks, the LB happily forwards traffic into a black hole.` },
        { type: "p", text: `Sticky sessions (session affinity) pin a given client to the same backend, usually via a cookie or IP hash, so per-connection server-side state stays reachable. It is convenient but a design smell: it undermines even balancing and makes deployments and failures harder (losing a server loses its sessions). The better pattern is stateless servers with shared session state in a cache (Redis), so any server can handle any request.` },
        { type: "callout", text: `Prefer stateless app servers. If any server can serve any request, load balancing is trivial, autoscaling is trivial, and a server dying is a non-event. Push session and other transient state into a shared store rather than pinning users to machines.` }
      ]
    },
    {
      heading: "6. Caching",
      blocks: [
        { type: "p", text: `A cache stores the result of expensive work (a query, a computation, a remote call) close to where it is needed so future requests are fast. Caching is the highest-leverage move in a read-heavy system: a 90 percent hit rate cuts backend load by 10x. The cost is staleness and complexity, which is why the write strategy matters.` },
        { type: "h3", text: "6.1 Where caches live" },
        { type: "ul", items: [
          `Client / browser. Fastest possible; no network at all. Governed by cache-control headers. Good for static assets and user-specific data the client owns.`,
          `CDN / edge. Caches responses geographically close to users. Ideal for static content and cacheable API responses (section 7).`,
          `Application / distributed cache (Redis, Memcached). A shared in-memory tier between app servers and the database. The workhorse of most designs.`,
          `Database cache. The DB's own buffer pool, plus materialized views and query caches. Cheapest to adopt (it's built in) but least controllable.`
        ]},
        { type: "h3", text: "6.2 Write strategies" },
        { type: "table", headers: ["Strategy", "How it works", "Trade-off"], rows: [
          ["Cache-aside (lazy)", "App reads cache; on miss, reads DB and populates cache. Writes go to the DB and invalidate/update the cache entry.", "Most common. Only caches what's used, but the first read of any key is a miss, and there's a window where cache and DB disagree."],
          ["Write-through", "App writes to the cache, which synchronously writes to the DB. Reads always hit a warm cache.", "Cache and DB stay consistent and reads are fast, but every write pays the cache + DB latency, and you cache data that may never be read."],
          ["Write-back (write-behind)", "App writes to the cache; the cache flushes to the DB asynchronously in batches.", "Fastest writes and great for write-heavy bursts, but a cache crash before flush loses data. Use only where some loss is tolerable or the cache is durable."]
        ]},
        { type: "h3", text: "6.3 Eviction policies" },
        { type: "p", text: `A cache is finite, so it must decide what to drop. LRU (least recently used) evicts the entry untouched for the longest — the safe default, good for temporal locality. LFU (least frequently used) evicts the least-accessed entry — better when some keys are perennially hot. TTL (time to live) expires entries after a fixed age regardless of use — the simplest way to bound staleness. Most real caches combine an LRU/LFU eviction with a TTL ceiling.` },
        { type: "h3", text: "6.4 The thundering herd (cache stampede)" },
        { type: "p", text: `When a hot key expires, thousands of concurrent requests all miss the cache at once and stampede the database — often taking it down. This is one of the most-tested caching pitfalls. Mitigations:` },
        { type: "ul", items: [
          `Request coalescing / single-flight. Only let one request recompute the value; others wait for and share the result. This is the primary fix.`,
          `Add jitter to TTLs. Randomize expiry so keys don't all expire on the same second.`,
          `Early / probabilistic recomputation. Refresh a hot key shortly before it expires so it never actually goes cold.`,
          `Serve stale while revalidating. Return the expired value and refresh it in the background, so no request ever waits on the DB.`
        ]},
        { type: "callout", text: `Two hard caching problems recur: the thundering herd (above) and cache invalidation. "There are only two hard things in computer science: cache invalidation and naming things" is a joke with a real point. Prefer TTL-based expiry and event-driven invalidation over trying to hand-track every place a value is cached.` }
      ]
    },
    {
      heading: "7. Content delivery networks (CDNs)",
      blocks: [
        { type: "p", text: `A CDN is a globally distributed network of edge caches. When a user requests content, they are served from the nearest edge location instead of the origin server, which cuts latency dramatically and offloads enormous bandwidth from the origin. For anything served to a geographically spread audience — images, video, JS/CSS bundles, and increasingly API responses — a CDN is table stakes.` },
        { type: "h3", text: "7.1 Static vs dynamic content" },
        { type: "p", text: `Static content (images, video, fonts, versioned bundles) is the natural fit: it is identical for every user and rarely changes, so it caches beautifully at the edge. Dynamic content (personalized, per-request) is harder but not hopeless — modern CDNs cache dynamic responses briefly (micro-caching, a few seconds), run compute at the edge, and terminate TLS and accelerate the connection to origin even when they cannot cache the body.` },
        { type: "h3", text: "7.2 Invalidation: making sure users see fresh content" },
        { type: "p", text: `The central CDN problem is the same as any cache: how do you update content without serving stale copies? Three approaches, usually combined:` },
        { type: "ul", items: [
          `TTL expiry. Set a cache lifetime via cache-control headers; the edge refetches from origin after it expires. Simple, but users see stale content until the TTL passes.`,
          `Versioned / fingerprinted URLs. Put a content hash or version in the URL (app.9f2c1a.js). New content = new URL, so it is always a fresh fetch and old URLs can cache forever. This is the cleanest pattern for deployable assets.`,
          `Active purge / invalidation. Explicitly tell the CDN to evict a URL now. Immediate but slower to propagate across all edges and rate-limited by most providers, so reserve it for urgent corrections.`
        ]},
        { type: "callout", text: `Best practice: give static assets a long TTL and a versioned URL, so you never purge — you just deploy a new filename. Use short TTLs for things that change often, and reserve active purge for emergencies like taking down bad content.` }
      ]
    },
    {
      heading: "8. Databases: SQL vs NoSQL",
      blocks: [
        { type: "p", text: `The database choice should follow from the access pattern you established in step 4, not from fashion. The real question is never "SQL or NoSQL" in the abstract — it is "how will this data be written and read, and what guarantees does the workload need?"` },
        { type: "h3", text: "8.1 When relational wins" },
        { type: "p", text: `Reach for a relational database (Postgres, MySQL) when you have structured data with meaningful relationships, need multi-row/multi-table transactions with ACID guarantees, and run varied ad hoc queries (joins, aggregations) whose shape you cannot fully predict. Anything financial — orders, payments, ledgers, trades — wants transactions and strong consistency, so it wants relational (or a NewSQL system that provides the same guarantees at scale). Do not dismiss SQL as "unscalable"; a single well-tuned Postgres instance handles a very large workload, and read replicas plus sharding take it further.` },
        { type: "h3", text: "8.2 The NoSQL families" },
        { type: "table", headers: ["Family", "Model", "Great at", "Examples"], rows: [
          ["Key-value", "Opaque value by key", "Simple, blazing-fast lookups: sessions, caches, feature flags", "Redis, DynamoDB, Memcached"],
          ["Document", "JSON-like documents, flexible schema", "Semi-structured data read as a whole object; rapid iteration", "MongoDB, Couchbase"],
          ["Wide-column", "Rows with dynamic columns, partitioned by key", "Massive write throughput, time-series, huge datasets with known query patterns", "Cassandra, HBase, Bigtable"],
          ["Graph", "Nodes and edges", "Relationship-heavy traversals: social graphs, fraud rings, recommendations", "Neo4j, Neptune"]
        ]},
        { type: "p", text: `NoSQL generally trades away joins, rich ad hoc querying, and (often) strong multi-key transactions in exchange for horizontal scalability, flexible schemas, and very high throughput on a known access pattern. The catch: because you cannot join or query arbitrarily, you must design the data model around your queries up front. In wide-column stores especially, you model per query — denormalize and duplicate data so each read hits one partition.` },
        { type: "callout", text: `The decision heuristic: if you need transactions, joins, and unpredictable queries, choose relational. If you need to scale one well-known access pattern to enormous volume, choose the matching NoSQL family. And say why out loud — "reads are always by user_id and I need 100k write QPS, so a wide-column store partitioned by user_id fits better than a single relational instance."` }
      ]
    },
    {
      heading: "9. Scaling a database",
      blocks: [
        { type: "p", text: `A single database eventually hits a ceiling on reads, writes, or storage. The scaling toolkit, in the order you usually apply it: add read replicas (for read scaling), then shard (for write and storage scaling). Each introduces its own hard problem.` },
        { type: "h3", text: "9.1 Replication" },
        { type: "p", text: `Replication keeps copies of the data on multiple machines. The common pattern is leader-follower (primary-replica): all writes go to the leader, which streams its changes to followers that serve reads. This scales reads (add more followers) and provides failover (promote a follower if the leader dies).` },
        { type: "p", text: `The catch is replication lag. Followers apply the leader's changes slightly behind, so a read from a follower may not reflect a write that just succeeded on the leader. This breaks read-your-own-writes: a user updates their profile, then reloads and sees the old value because their read hit a lagging follower. Mitigations: route a user's reads to the leader for a short window after they write, or track a version and read only from replicas caught up past it.` },
        { type: "h3", text: "9.2 Sharding (horizontal partitioning)" },
        { type: "p", text: `Replication scales reads but not writes or storage — every replica still holds all the data and takes every write. To scale those, you shard: split the data across multiple independent databases, each holding a subset. The choice of shard key is everything.` },
        { type: "table", headers: ["Sharding scheme", "How", "Strength", "Weakness"], rows: [
          ["Range-based", "Partition by key ranges (A-M, N-Z; or by date)", "Efficient range scans", "Hot spots if data or traffic is skewed toward one range (e.g. recent dates)"],
          ["Hash-based", "Shard = hash(key) mod N", "Even distribution", "Range queries become scatter-gather; resharding is painful (see consistent hashing)"],
          ["Geo / entity-based", "Partition by region or tenant", "Data locality, compliance, blast-radius isolation", "Uneven load if one region/tenant dominates"]
        ]},
        { type: "h3", text: "9.3 The hard problems: resharding and hot keys" },
        { type: "p", text: `Resharding — adding shards as you grow — is genuinely hard with naive hash sharding, because hash(key) mod N remaps almost every key when N changes, forcing a massive data reshuffle. Consistent hashing (section 11) exists precisely to make this cheap. A hot key (or hot shard) is a single key or partition that receives a wildly disproportionate share of traffic — a celebrity user, a viral post, a single popular symbol. Mitigations: further split the hot key (add a random suffix to spread it across sub-keys), cache it hard in front of the DB, or give it dedicated capacity.` },
        { type: "callout", text: `Two things break sharded systems in interviews: cross-shard queries and hot keys. A query that must touch every shard (scatter-gather) is slow and fragile; design your shard key so the common query hits one shard. And always ask "what if one key gets 1000x the traffic?" — the celebrity problem shows up in almost every social or feed design.` }
      ]
    },
    {
      heading: "10. Consistency and CAP",
      blocks: [
        { type: "p", text: `Consistency is about what a read is guaranteed to see relative to prior writes. In a distributed system with replicas, this is a genuine design choice with real cost, and CAP is the theorem that frames it. Getting CAP right in an interview signals maturity; getting it wrong ("you pick two of three") signals the opposite.` },
        { type: "h3", text: "10.1 CAP, stated correctly" },
        { type: "p", text: `CAP says: when a network partition (P) occurs — some nodes cannot talk to others — a distributed system must choose between consistency (C) and availability (A). It cannot have both during the partition. It is not "pick two of three." Partitions are a fact of networks you do not get to opt out of; the real choice is how you behave when one happens.` },
        { type: "ul", items: [
          `CP (consistency over availability). During a partition, refuse requests that can't be served consistently rather than return possibly-stale data. Choose this when correctness is non-negotiable: banking, inventory, order matching.`,
          `AP (availability over consistency). During a partition, keep serving, accept that replicas may diverge, and reconcile later (eventual consistency). Choose this when uptime matters more than momentary staleness: social feeds, likes, view counts.`
        ]},
        { type: "h3", text: "10.2 The consistency spectrum" },
        { type: "p", text: `Consistency is not binary. From strongest to weakest: strong consistency (every read sees the latest committed write, as if there were one copy) -> read-your-writes (you always see your own writes, though maybe not others' latest) -> monotonic reads (you never see time go backwards) -> eventual consistency (given no new writes, all replicas eventually converge). Weaker models are cheaper and faster; pick the weakest one the feature can tolerate.` },
        { type: "h3", text: "10.3 Quorums: tuning consistency with N, W, R" },
        { type: "p", text: `Many distributed stores let you tune consistency per operation using quorums. With N replicas, a write must be acknowledged by W of them and a read must consult R of them.` },
        { type: "code", code: `N = number of replicas
W = replicas that must ack a write
R = replicas that must respond to a read

If  W + R > N   -> strong consistency (read and write sets overlap,
                    so a read always sees the latest write)

Examples with N = 3:
  W=3, R=1  -> fast reads, slow/fragile writes  (write-heavy read paths)
  W=1, R=3  -> fast writes, slow reads
  W=2, R=2  -> balanced, still W+R > N, so consistent` },
        { type: "callout", text: `The knob is latency-vs-consistency. Higher W or R means more replicas must respond, which means higher latency and lower availability, in exchange for stronger guarantees. W + R > N buys strong consistency; W + R <= N gives you eventual consistency with lower latency. State which you're choosing and why.` }
      ]
    },
    {
      heading: "11. Consistent hashing",
      blocks: [
        { type: "p", text: `Consistent hashing is the standard technique for distributing keys across a changing set of nodes — cache servers, database shards, or partitions — while moving as little data as possible when nodes are added or removed. It appears constantly in system design because "how do you reshard without a massive reshuffle" is a near-universal sub-problem.` },
        { type: "h3", text: "11.1 Why plain hash mod N is bad" },
        { type: "p", text: `The obvious scheme, server = hash(key) mod N, distributes keys evenly — until N changes. Go from 4 servers to 5 and the mod changes for almost every key, so nearly all keys map to a different server. For a cache, that means a near-total cache miss storm on every scaling event; for a shard, a near-total data migration. This is the resharding problem in its rawest form.` },
        { type: "h3", text: "11.2 The ring" },
        { type: "p", text: `Consistent hashing maps both keys and servers onto the same circular hash space (imagine a ring from 0 to 2^32). Each key belongs to the first server encountered going clockwise from the key's position. When a server is added or removed, only the keys between it and the previous server on the ring move — roughly 1/N of the keys — instead of nearly all of them.` },
        { type: "h3", text: "11.3 Virtual nodes" },
        { type: "p", text: `A naive ring has two problems: with few servers the load is uneven (some arcs are much larger than others), and removing a server dumps all its load onto its single successor. The fix is virtual nodes: each physical server is placed at many points on the ring (dozens to hundreds of virtual positions). This smooths the load distribution and, when a server leaves, spreads its keys across many remaining servers instead of one.` },
        { type: "callout", text: `Consistent hashing plus virtual nodes is the answer to "how do you shard/cache so that adding a node doesn't reshuffle everything?" It is the mechanism behind DynamoDB and Cassandra partitioning, and behind well-behaved distributed caches. Naming it, and mentioning virtual nodes for even load, is a strong signal.` }
      ]
    },
    {
      heading: "12. Message queues and streaming",
      blocks: [
        { type: "p", text: `A message queue or stream decouples producers from consumers. Instead of service A calling service B synchronously (and blocking, and failing if B is down), A writes a message and B processes it when able. This buys asynchrony, buffering against traffic spikes, load leveling, and resilience — B being slow or briefly down no longer breaks A.` },
        { type: "h3", text: "12.1 The Kafka vs SQS mental model" },
        { type: "table", headers: ["", "Log-based stream (Kafka)", "Traditional queue (SQS / RabbitMQ)"], rows: [
          ["Data model", "Append-only log; messages retained and re-readable", "Messages consumed and removed"],
          ["Consumption", "Consumers track their own offset; can replay history", "Message is delivered, acked, and gone"],
          ["Fan-out", "Many independent consumer groups read the same log", "Typically one logical consumer per message (or fan-out via multiple queues)"],
          ["Best for", "Event streaming, replay, high-throughput pipelines, multiple downstream systems", "Task/work queues, decoupling, simple background jobs"]
        ]},
        { type: "p", text: `The mental shorthand: Kafka is a durable, replayable log that many consumers can read independently and re-read from any point; a classic queue is a to-do list where each item is handed to a worker and then discarded. Choose the log when you need replay, ordering within a partition, or multiple independent consumers; choose the queue for simple job distribution.` },
        { type: "h3", text: "12.2 Delivery guarantees" },
        { type: "ul", items: [
          `At-most-once. Fire and forget; a message may be lost but never duplicated. Rarely acceptable.`,
          `At-least-once. Retry until acknowledged; a message is never lost but may be delivered more than once. The common default — and it forces consumers to be idempotent.`,
          `Exactly-once. Every message takes effect once, no loss and no duplicate. Genuinely hard and expensive end to end; usually approximated by at-least-once delivery plus idempotent consumers (dedup on a message/idempotency key).`
        ]},
        { type: "callout", text: `In practice you build "effectively exactly once" out of at-least-once delivery + idempotent processing, not out of a magic exactly-once transport. Give every message a unique id and have consumers dedupe on it. This is the single most important reliability pattern for queue-based systems.` },
        { type: "h3", text: "12.3 Patterns and pitfalls" },
        { type: "ul", items: [
          `Pub/sub and fan-out. One event, many interested consumers (send-tweet -> update timelines, notifications, search index, analytics). Decouples the producer from an ever-growing list of downstream systems.`,
          `Back-pressure. When consumers can't keep up, the queue grows. You need a plan: scale consumers, shed load, or slow producers. An unbounded, ever-growing backlog is a failure mode, not a feature.`,
          `Dead-letter queue (DLQ). Messages that repeatedly fail processing are shunted to a separate queue for inspection instead of blocking the main flow forever (poison messages). Always have one.`,
          `Ordering. Global ordering is expensive; most systems guarantee ordering only within a partition/key. Design so that order matters only within a single key (e.g. per user, per symbol).`
        ]}
      ]
    },
    {
      heading: "13. Rate limiting",
      blocks: [
        { type: "p", text: `Rate limiting protects a system from being overwhelmed — by abusive clients, buggy retriers, or organic spikes — and enforces fair usage and API quotas. The algorithm you pick determines how bursts are handled.` },
        { type: "table", headers: ["Algorithm", "How it works", "Character"], rows: [
          ["Token bucket", "A bucket refills tokens at a steady rate up to a cap; each request spends a token; empty bucket = reject.", "Allows short bursts (up to bucket size) while bounding the average rate. The usual default."],
          ["Leaky bucket", "Requests enter a fixed-size queue drained at a constant rate; overflow is dropped.", "Smooths output to a steady rate; no bursts pass through. Good for protecting a downstream with a hard throughput limit."],
          ["Fixed window", "Count requests per fixed interval (e.g. per minute); reset at the boundary.", "Simple, but allows a 2x burst straddling the window boundary."],
          ["Sliding window", "Track requests over a rolling time window (log or weighted count).", "Smooth and accurate, no boundary burst; costs more memory/computation."]
        ]},
        { type: "h3", text: "13.1 Where to enforce" },
        { type: "p", text: `Enforce as early and as close to the edge as possible — at the API gateway or load balancer — so rejected traffic never consumes backend resources. You may also add finer per-service limits deeper in for internal protection. Reject with HTTP 429 (Too Many Requests) and, ideally, a Retry-After header so well-behaved clients back off.` },
        { type: "h3", text: "13.2 Distributed rate limiting" },
        { type: "p", text: `With many gateway instances, a per-instance counter lets a client exceed the global limit by hitting different instances. The counters must be shared. The standard approach is a central fast store (Redis) holding the counters, updated atomically (e.g. an atomic increment, or a Lua script implementing token-bucket logic). The trade-off is a network hop per request to the counter store; for extreme scale, instances keep a small local budget and reconcile with the central store periodically, accepting slight over-admission for lower latency.` }
      ]
    },
    {
      heading: "14. Idempotency, retries, and reliability",
      blocks: [
        { type: "p", text: `Distributed systems fail partially and constantly: packets drop, servers restart mid-request, timeouts fire on requests that actually succeeded. Reliability is the discipline of designing so these events don't corrupt data or cascade. The patterns below are the core toolkit and come up in almost every design.` },
        { type: "h3", text: "14.1 Idempotency keys" },
        { type: "p", text: `Since you must retry, and retries can duplicate non-idempotent operations (a second "charge card" or "place order"), make writes idempotent. The client generates a unique idempotency key per logical operation and sends it with the request. The server records processed keys; if it sees a key again, it returns the original result instead of doing the work twice. This turns an unsafe POST into a safe, retryable operation.` },
        { type: "code", code: `POST /orders
Idempotency-Key: 7c1e...unique-per-attempt

# Server logic:
#   if key already processed -> return the stored prior result
#   else -> process, store (key -> result) atomically, return result` },
        { type: "h3", text: "14.2 Retries: backoff and jitter" },
        { type: "p", text: `Naive immediate retries make outages worse: when a service hiccups, every client retries at once and hammers it back down (a retry storm). The fix is exponential backoff — wait 1s, 2s, 4s, 8s between attempts — plus jitter, a random delay added so clients don't all retry in lockstep. Backoff spreads retries over time; jitter spreads them across clients. Cap the number of retries and the total delay.` },
        { type: "h3", text: "14.3 Timeouts and circuit breakers" },
        { type: "p", text: `Every remote call needs a timeout; without one, a hung dependency ties up your threads and the failure spreads upstream. A circuit breaker goes further: after a dependency fails repeatedly, the breaker "opens" and fails fast for a cooldown period instead of sending doomed requests, then "half-opens" to test recovery. This stops one failing service from cascading into a full outage and gives the sick dependency room to recover.` },
        { type: "h3", text: "14.4 The dual-write problem and the outbox pattern" },
        { type: "p", text: `A subtle, common bug: an operation must both write to the database and publish an event (or write to a second store). If you do these as two separate calls, a crash between them leaves the system inconsistent — the DB updated but the event never sent, or vice versa. There is no atomic way to write to two systems at once. The transactional outbox pattern solves it: within the same DB transaction that does the write, also insert the event into an "outbox" table. A separate process then reads the outbox and publishes the events, marking them sent. Because the write and the outbox insert share one transaction, they succeed or fail together; the event is delivered at least once afterward.` },
        { type: "callout", text: `These patterns compose: idempotency keys make at-least-once retries safe, backoff + jitter make retries non-catastrophic, circuit breakers stop cascades, and the outbox makes "write then publish" atomic. Mentioning them at the right moment ("this POST needs an idempotency key so retries don't double-charge") is exactly the reliability awareness interviewers reward.` }
      ]
    },
    {
      heading: "15. Observability",
      blocks: [
        { type: "p", text: `You cannot operate what you cannot see. Observability is the ability to understand a system's internal state from its outputs, so you can detect problems, debug them, and know whether you're meeting your promises. It rests on three pillars and a couple of frameworks worth naming.` },
        { type: "h3", text: "15.1 The three pillars" },
        { type: "ul", items: [
          `Metrics. Numeric time-series (QPS, error rate, latency percentiles, CPU, queue depth). Cheap to store and aggregate; the basis for dashboards and alerts. Always look at percentiles (p50, p95, p99), not averages — averages hide the tail where users actually hurt.`,
          `Logs. Discrete, timestamped records of events. Rich detail for debugging a specific incident, but expensive at volume. Structured (machine-parseable) logs beat free text.`,
          `Traces. Follow a single request across every service it touches, showing where the time went. Essential in microservices, where one user action fans out into dozens of internal calls.`
        ]},
        { type: "h3", text: "15.2 The four golden signals" },
        { type: "p", text: `From Google's SRE practice, these are the four things to monitor for any user-facing service. If you watch only four things, watch these:` },
        { type: "ul", items: [
          `Latency. How long requests take (track the distribution, and separate successful from failed requests — a fast error is still an error).`,
          `Traffic. How much demand — QPS, connections, throughput.`,
          `Errors. The rate of failing requests.`,
          `Saturation. How full the system is — CPU, memory, disk, queue depth — i.e. how close to the limit before things degrade.`
        ]},
        { type: "h3", text: "15.3 SLIs, SLOs, and SLAs" },
        { type: "p", text: `An SLI (Service Level Indicator) is a measured number, like "p99 latency" or "percentage of successful requests." An SLO (Service Level Objective) is your internal target for an SLI, like "99.9 percent of requests succeed in under 200ms." An SLA (Service Level Agreement) is a contractual promise to customers, usually looser than the SLO, with penalties for breach. The gap between SLO and 100 percent is your error budget: the amount of failure you can spend on risk (deploys, experiments) before you must stop and stabilize.` },
        { type: "callout", text: `Closing the 7-step framework with "here's what I'd monitor" — the golden signals plus a couple of domain-specific SLIs, backed by an SLO — is what turns a design into an operable system. It's the difference between architecture and engineering, and interviewers notice.` }
      ]
    },
    {
      heading: "16. Data partitioning and replication trade-offs",
      blocks: [
        { type: "p", text: `Partitioning (sharding) and replication solve different problems and are almost always used together. This summary table collects the trade-offs from sections 9 through 11 in one place for quick reference.` },
        { type: "table", headers: ["Technique", "Solves", "Costs / risks"], rows: [
          ["Read replicas", "Read throughput; failover", "Replication lag -> stale reads; breaks read-your-writes unless mitigated"],
          ["Range sharding", "Storage + write scaling; range queries", "Hot spots on skewed or time-based keys"],
          ["Hash sharding", "Even write distribution", "Scatter-gather range queries; painful resharding without consistent hashing"],
          ["Consistent hashing + vnodes", "Cheap resharding; even load", "More moving parts; still needs a hot-key plan"],
          ["Multi-leader / active-active", "Write availability across regions", "Write conflicts requiring resolution; weaker consistency"],
          ["Quorum tuning (N/W/R)", "Per-operation consistency vs latency knob", "Higher W/R -> higher latency, lower availability"]
        ]},
        { type: "p", text: `The unifying idea: replication is about copies for availability and read scale; partitioning is about splitting for write and storage scale. Replication trades storage and write cost for read scale and durability; partitioning trades query flexibility (cross-shard joins, global ordering) for horizontal scale. Almost every large system uses both — sharded data, with each shard replicated.` }
      ]
    },
    {
      heading: "17. Walkthrough: URL shortener",
      blocks: [
        { type: "p", text: `The classic warm-up. It's simple enough to finish and rich enough to exercise the whole framework. Let's walk all seven steps.` },
        { type: "h3", text: "17.1 Requirements" },
        { type: "ul", items: [
          `Functional: create a short code for a long URL; redirect a short code to its long URL. Optional: custom aliases, expiry, click analytics.`,
          `Non-functional: redirects must be very low latency (they're in the user's critical path) and highly available; the mapping is immutable once created, so reads can be cached hard.`,
          `Scale (assume): 100M new URLs/month, 10:1 read:write, so ~1B new URLs over ~10 years. Reads dominate massively.`
        ]},
        { type: "h3", text: "17.2 Estimates" },
        { type: "code", code: `Writes: 100M/month / (30*86,400) =~ 40 write QPS  (tiny)
Reads : ~10x                      =~ 400 read QPS avg, ~1-2k peak

Key space: need to encode ~1B (really 10B for headroom) URLs.
  base62 (a-z A-Z 0-9): 62^7 =~ 3.5 trillion  ->  7 chars is plenty.

Storage: 1B URLs * ~500 bytes (short + long + metadata) =~ 500 GB.
  Small enough for a single sharded DB; hot mappings fit in a cache.` },
        { type: "h3", text: "17.3 API" },
        { type: "code", code: `POST /shorten     { "long_url": "...", "custom_alias"?: "..." } -> { "short_url": "..." }
GET  /{short_code}  -> HTTP 301/302 redirect to the long URL` },
        { type: "h3", text: "17.4 Data model" },
        { type: "code", code: `urls(
  short_code   VARCHAR(7) PRIMARY KEY,   -- the lookup key
  long_url     TEXT,
  created_at   TIMESTAMP,
  expires_at   TIMESTAMP NULL
)
# Access pattern is a pure key lookup by short_code -> a KV store fits
# perfectly (DynamoDB / Redis-backed), though a sharded relational DB is fine too.` },
        { type: "h3", text: "17.5 High-level design and the key-generation deep dive" },
        { type: "p", text: `Request flow: client -> load balancer -> stateless app servers -> cache (short_code -> long_url) -> database. Redirects check the cache first; since mappings are immutable, the hit rate is extremely high and the DB barely sees traffic. Front the whole thing so popular links are served from cache or even the CDN.` },
        { type: "p", text: `The one interesting design question is how to generate short codes without collisions. Three options:` },
        { type: "ul", items: [
          `Hash the long URL (e.g. MD5) and take the first 7 base62 chars. Simple, but hashes collide; you must detect collisions and rehash, and identical URLs map to the same code (sometimes desired, sometimes not).`,
          `Auto-increment a global counter and base62-encode it. No collisions ever, codes are short and dense. Downside: a single counter is a bottleneck and single point of failure, and sequential codes are guessable/enumerable.`,
          `Distributed unique IDs. Hand out ID ranges to each app server from a coordination service (e.g. a ticket/ID server, or per-node ranges), or use a Snowflake-style ID (timestamp + machine id + sequence). Base62-encode the ID. Scales writes with no coordination on the hot path and no collisions. This is the strong answer.`
        ]},
        { type: "h3", text: "17.6 Trade-offs and failure modes" },
        { type: "p", text: `Use 301 (permanent) redirects to let browsers and CDNs cache, cutting server load — but then you lose per-click analytics (the browser won't come back). If analytics matter, use 302 (temporary) and log each hit, accepting more traffic. Bottleneck to watch: the ID generator (mitigated by range allocation or Snowflake). Failure modes: the DB is not in the hot path thanks to caching, so a DB blip degrades new-URL creation but redirects keep working from cache — a nice property to point out. Analytics should be captured asynchronously via a queue so logging never slows a redirect.` }
      ]
    },
    {
      heading: "18. Walkthrough: news feed / timeline",
      blocks: [
        { type: "p", text: `Designing a social feed (Twitter/Instagram home timeline) is the canonical read-heavy design, and it hinges on one great trade-off: fan-out on write vs fan-out on read. It also surfaces the celebrity (hot-key) problem.` },
        { type: "h3", text: "18.1 Requirements and estimates" },
        { type: "ul", items: [
          `Functional: post content; follow users; view a home timeline of recent posts from people you follow, newest first.`,
          `Non-functional: loading the timeline must be fast (it's the core action, done constantly); it can be slightly stale (seconds-old is fine) -> eventual consistency and heavy caching are acceptable.`,
          `Scale (assume): 300M DAU, each reads their timeline ~10x/day (huge read QPS) and posts ~0.3x/day. Read:write is on the order of 100:1 -> read-heavy.`
        ]},
        { type: "h3", text: "18.2 The core decision: fan-out on write vs read" },
        { type: "table", headers: ["", "Fan-out on write (push)", "Fan-out on read (pull)"], rows: [
          ["When you post", "Immediately write the post into every follower's precomputed timeline cache", "Do nothing extra; just store the post"],
          ["When you read", "Read your ready-made timeline from cache -> very fast", "Query recent posts from everyone you follow, then merge and sort -> slower"],
          ["Great when", "Reads vastly outnumber writes; most users have modest follower counts", "Users follow huge numbers of accounts, or post rarely relative to reads"],
          ["Painful when", "A celebrity posts -> millions of timeline writes at once (write amplification)", "A user follows thousands -> every read is an expensive scatter-merge"]
        ]},
        { type: "h3", text: "18.3 The celebrity problem and the hybrid answer" },
        { type: "p", text: `Pure fan-out on write breaks on celebrities: a user with 100M followers triggers 100M writes per post — a massive, spiky load and the classic hot-key problem. The standard production answer is a hybrid. Use fan-out on write for the vast majority of users (normal follower counts, cheap to push). For a small set of celebrity/high-follower accounts, do not fan out on write; instead, pull their recent posts at read time and merge them into the reader's precomputed timeline. Each user's feed = their materialized timeline (from normal posters) merged with a live pull of the handful of celebrities they follow. This bounds both the write amplification and the read cost.` },
        { type: "h3", text: "18.4 High-level design" },
        { type: "p", text: `Post path: client -> API -> write post to the post store -> emit an event to a queue -> a fan-out service pushes the post id into followers' timeline lists (in Redis), skipping celebrities. Read path: client -> API -> read the precomputed timeline id list from Redis -> hydrate post contents from cache/store -> merge in celebrity pulls -> return. The queue decouples posting from the (potentially large) fan-out work and absorbs spikes.` },
        { type: "callout", text: `The graded insight here is naming fan-out on write vs read, explaining the read-heavy workload makes precompute-on-write the default, and then catching the celebrity edge case and proposing the hybrid. That progression — default choice, then edge case, then refinement — is exactly the reasoning arc interviewers look for.` }
      ]
    },
    {
      heading: "19. Walkthrough: real-time market-data feed",
      blocks: [
        { type: "p", text: `A low-latency price-distribution system — the exchange or broker pushes live prices to many subscribers. It's an excellent real-time design and a natural quant/trading tie-in, exercising push protocols, fan-out at scale, sequencing, and the snapshot-plus-delta pattern. (The same skeleton designs a chat system; prices are just the messages.)` },
        { type: "h3", text: "19.1 Requirements and estimates" },
        { type: "ul", items: [
          `Functional: clients subscribe to symbols (AAPL, ES future, a currency pair) and receive live price updates; a newly subscribing client must get the current state immediately, then incremental updates.`,
          `Non-functional: very low latency (single-digit to tens of milliseconds; in true HFT contexts, microseconds) and correct ordering — a client must never apply updates out of order or silently miss one. Availability is critical during market hours.`,
          `Scale (assume): tens of thousands of symbols, each updating up to hundreds of times per second in bursts; hundreds of thousands of concurrent subscribers. This is a fan-out and latency problem.`
        ]},
        { type: "code", code: `Update ingest: 50k symbols * ~100 updates/sec (bursty) =~ 5M updates/sec peak.
Fan-out     : each update * (subscribers to that symbol) -> the real load.
              A popular symbol with 100k subscribers = one input -> 100k pushes.
              This is the hot-symbol / celebrity problem again.` },
        { type: "h3", text: "19.2 Protocol and topology" },
        { type: "p", text: `This is server-push, so WebSockets (bidirectional, for browser/app clients) or a raw TCP/multicast feed (for latency-sensitive machine subscribers) — not request/response. The topology is publish/subscribe: an ingestion tier receives raw market data, normalizes it, and publishes onto a low-latency message bus keyed by symbol; a tier of gateway servers each hold many client WebSocket connections and subscribe to the bus for the symbols their clients care about, pushing updates outward. Partition by symbol so each symbol's stream is ordered and can be scaled independently, and place gateways geographically near clients to shave round-trip latency.` },
        { type: "h3", text: "19.3 Sequence numbers, snapshots, and deltas" },
        { type: "p", text: `The heart of a correct market-data feed is the snapshot-plus-delta model with sequence numbers, which solves both "new subscriber needs current state" and "did I miss anything?":` },
        { type: "ul", items: [
          `Every update for a symbol carries a monotonically increasing sequence number. Clients track the last sequence they saw. A gap (expected N, got N+2) means an update was missed -> the client requests a re-sync. This is how you get correctness over an unreliable or lossy transport.`,
          `Snapshot: the full current state of a symbol (full order book, or latest price/quote). A newly-subscribing client gets a snapshot at sequence N, then applies deltas from N+1 onward. Snapshots are periodically re-published so recovering clients don't have to replay from the beginning of the day.`,
          `Delta: a small incremental change (this price ticked, this level changed). Deltas are tiny, so steady-state bandwidth stays low; you only pay for a full snapshot on subscribe or resync.`
        ]},
        { type: "p", text: `This snapshot + delta pattern is exactly how real exchange feeds and order-book distribution work, and it generalizes: any "sync a large state, then stream small changes, and detect loss" problem (collaborative editing, replication, live dashboards) uses the same trio of snapshot, deltas, and sequence numbers.` },
        { type: "h3", text: "19.4 Bottlenecks, back-pressure, and failure modes" },
        { type: "p", text: `Hot symbols are the load-defining case: one popular symbol fans out to every subscriber, so scale by replicating gateways per symbol and letting many gateways subscribe to the same bus stream. Back-pressure matters acutely: if a slow client can't keep up with a fast symbol, you must not let it stall the whole feed — the standard tactic is conflation, where you drop intermediate ticks and send the slow client only the latest state (for prices, the newest value is what matters; stale intermediate ticks are worthless). Failure modes to name: a dropped update is caught by the sequence-number gap check and repaired via resync/snapshot; a gateway crash drops its connections, and clients reconnect to another gateway and re-snapshot; the ingestion tier is the critical path, so it runs redundantly with fast failover during market hours.` },
        { type: "callout", text: `The quant-flavored insights that land: push protocol over pull, partition-by-symbol for ordering and scale, sequence numbers to detect loss, snapshot + delta so subscribers sync cheaply, and conflation as the back-pressure answer for slow consumers of fast data. Latency budgeting (keep cross-region hops out of the hot path) ties it back to the estimation ladder from section 3.` }
      ]
    },
    {
      heading: "20. What interviewers grade, common mistakes, and cheat sheet",
      blocks: [
        { type: "p", text: `The design itself is only half the score. The other half is how you got there. Here is what interviewers actually reward and the mistakes that sink otherwise-capable candidates.` },
        { type: "h3", text: "20.1 What interviewers actually grade" },
        { type: "ul", items: [
          `Structure. Do you drive the conversation through a clear method (the 7 steps) instead of wandering? Leading the process is itself a signal.`,
          `Requirements and scoping. Did you clarify before designing, and cut a huge problem down to a tractable core?`,
          `Quantitative reasoning. Do your choices follow from numbers you estimated, not from buzzwords?`,
          `Trade-off awareness. Do you state costs and benefits out loud and justify each decision, rather than presenting one option as obviously correct?`,
          `Depth on demand. When asked to go deep on a component, can you actually design it (the sharding, the fan-out, the consistency model)?`,
          `Failure thinking. Do you volunteer bottlenecks, single points of failure, and what you'd monitor?`,
          `Communication. Clear boxes, clear data flow, and a running narrative of your thinking.`
        ]},
        { type: "h3", text: "20.2 Common mistakes" },
        { type: "ul", items: [
          `Jumping to a solution before nailing requirements and scale. The number-one killer.`,
          `Never estimating — designing entirely qualitatively, so every choice is unjustified.`,
          `Over-engineering: adding queues, microservices, and five datastores to a problem a single service and one database would solve. Simplicity is a virtue; scale up only where the numbers demand it.`,
          `Buzzword-driven design: naming Kafka/Cassandra/Kubernetes without saying why they fit this workload.`,
          `Stating CAP as "pick two of three" instead of "choose C or A under a partition."`,
          `Ignoring the read:write ratio, then picking a database that fights the actual workload.`,
          `Forgetting hot keys / the celebrity problem in any social, feed, or fan-out design.`,
          `No failure story: designing only the happy path and never saying what breaks or what you'd monitor.`,
          `Going silent. An unspoken good design scores worse than a narrated decent one.`
        ]},
        { type: "callout", text: `The through-line of the whole handbook: requirements first, numbers always, trade-offs out loud, and close with failure modes and monitoring. Do those four things using the 7-step framework and you will handle any system design prompt calmly, whether it's a URL shortener, a global feed, or a low-latency market-data system.` }
      ]
    }
  ],
  cheatsheet: [
    `7-step framework: Requirements (functional + non-functional + scale) -> Estimates -> API -> Data model -> High-level design -> Deep dive -> Trade-offs/bottlenecks/failure modes. Narrate every step.`,
    `Mindset: requirements first, numbers always, trade-offs out loud. Clarify and scope before drawing boxes; justify every choice with an order-of-magnitude number; name the cost of each decision.`,
    `QPS = DAU * actions_per_day / 86,400, times 2-3x for peak. Always split reads from writes; the read:write ratio shapes the whole design (read-heavy = cache + replicas + CDN; write-heavy = shard + queue).`,
    `Storage = items * size * retention * replication_factor (usually 3x). Bandwidth = QPS * response_size. A day ~= 10^5 seconds, a year ~= 3*10^7 seconds.`,
    `Latency ladder: RAM ~100ns, SSD read ~100us, same-datacenter round trip ~0.5ms, cross-region ~50-150ms. Memory ~1000x faster than SSD ~1000x faster than a cross-region hop. Keep cross-region calls out of the hot path.`,
    `Protocols: REST for public/CRUD (cacheable GETs), gRPC between internal services, WebSockets for two-way push, SSE for one-way server push, long polling as a fallback. GET/PUT/DELETE are idempotent; POST is not -> use an idempotency key.`,
    `Load balancing: L4 (fast, IP/port) vs L7 (routes by path/header/cookie). Algorithms: round robin, least connections, hashing. Prefer stateless app servers with shared session state over sticky sessions. Health checks make the LB a reliability tool.`,
    `Caching write strategies: cache-aside (lazy, most common), write-through (consistent, slower writes), write-back (fast, risks loss). Eviction: LRU (default), LFU (hot keys), TTL (bounds staleness). Cache locations: client, CDN, app (Redis), DB.`,
    `Thundering herd / cache stampede: a hot key expires and everyone misses at once. Fix with request coalescing (single-flight), TTL jitter, early recompute, or serve-stale-while-revalidate.`,
    `CDN: edge caches near users; mandatory when egress is large. Invalidate via TTL, versioned/fingerprinted URLs (best for assets -> never purge, just deploy a new filename), or active purge (emergencies only).`,
    `SQL vs NoSQL follows the access pattern. Relational wins for transactions, joins, and ad hoc queries (anything financial). NoSQL families: key-value (fast lookups), document (semi-structured), wide-column (massive writes, known queries), graph (relationship traversals). NoSQL = model per query.`,
    `Scaling a DB: read replicas scale reads (but replication lag breaks read-your-writes -> read from leader after a write). Sharding scales writes + storage: range (range scans, hot spots) vs hash (even, scatter-gather + hard resharding) vs geo. Watch hot keys / the celebrity problem.`,
    `CAP correctly: under a network partition you must choose Consistency OR Availability (not "two of three"). CP = refuse to serve stale (banking, inventory); AP = stay up and reconcile (feeds, likes). Consistency spectrum: strong -> read-your-writes -> eventual.`,
    `Quorums: with N replicas, write to W and read from R. W + R > N gives strong consistency (read/write sets overlap). Higher W/R = stronger but higher latency and lower availability.`,
    `Consistent hashing: plain hash mod N remaps almost every key on resize (cache miss storm / mass migration). Put keys and nodes on a ring; a node change moves only ~1/N of keys. Virtual nodes even out load and spread a departing node's keys across many.`,
    `Queues decouple producers from consumers (async, buffering, resilience). Kafka = replayable log, many independent consumers; SQS/RabbitMQ = consume-and-delete work queue. At-least-once + idempotent consumers ~= exactly-once. Use DLQs, plan for back-pressure, order only within a partition/key.`,
    `Rate limiting: token bucket (allows bursts, default) vs leaky bucket (smooths to a steady rate) vs fixed window (simple, boundary burst) vs sliding window (accurate, costlier). Enforce at the edge; return 429. Distribute counters via Redis atomic ops.`,
    `Reliability: idempotency keys make retries safe; exponential backoff + jitter prevents retry storms; timeouts + circuit breakers stop cascades; the transactional outbox fixes the dual-write problem (write + publish an event atomically via one DB transaction).`,
    `Observability: metrics (percentiles, not averages), logs, traces. Four golden signals: latency, traffic, errors, saturation. SLI (measured) -> SLO (internal target) -> SLA (customer contract); the gap to 100% is your error budget. Close every design with "here's what I'd monitor."`,
    `Feed design: fan-out on write (push, precompute timelines, great for read-heavy + normal follower counts) vs fan-out on read (pull, merge at read time, great for heavy-following users). Hybrid handles celebrities: push for normal users, pull-and-merge for high-follower accounts.`,
    `Real-time / market-data feed: push protocol (WebSockets/multicast), pub/sub partitioned by symbol for ordering + scale, monotonic sequence numbers to detect loss, snapshot + delta so new/recovering subscribers sync cheaply, and conflation (send only the latest) as back-pressure for slow consumers of fast data.`,
    `URL shortener: base62-encode a distributed unique ID (Snowflake or range-allocated) for collision-free short codes; immutable mappings cache extremely well; 301 caches and offloads but loses analytics, 302 keeps analytics at the cost of traffic; log clicks asynchronously via a queue.`
  ]
}
