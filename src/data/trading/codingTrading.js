// Trading / quant-firm interview coding problems (Phase 5a).
//
// These are REPRESENTATIVE, reconstructed problems written in the style of
// public interview reports (Glassdoor, Reddit r/quant, Wall Street Oasis,
// interview-prep sites). They are NOT verbatim transcriptions of any firm's
// proprietary questions — every entry is tagged `representative: true` with a
// `source` describing the public grounding.
//
// Sources consulted while authoring this set:
//   - Glassdoor "Hudson River Trading Software Engineer" interview reports
//   - Glassdoor "Citadel order book matching algorithm" interview question
//   - oavoservice.com Optiver OA "order book simulation"
//   - quantt.co.uk "Quant Coding Interview Questions: 20 Real Examples"
//   - quantt.co.uk "Quant Developer Interview Questions: 25 Real Examples"
//   - lodely.com Jane Street Online Assessment breakdown
//   - linkjob.ai Citadel HackerRank assessment writeup
//
// Each problem is consumed unchanged by the in-browser Pyodide runner
// (src/flight/pyRunner.js) and by the headless verifier
// (scripts/verify-trading-coding.mjs). Every `solution` is stdlib-only and
// Python 3.9 compatible, and every `expected` is a string of Python literal(s)
// equal to what the solution returns under the problem's `checker`.

export const TRADING_CODING = [
  // --------------------------------------------------------------------------
  // 1. Limit Order Book — Matching Engine (Heaps / Hash Map) — Hard
  // --------------------------------------------------------------------------
  {
    id: "lob-match-engine",
    leetcode: "https://leetcode.com/problems/design-a-food-rating-system/",
    title: "Limit Order Book — Matching Engine",
    difficulty: "Hard",
    topic: "Heaps / Hash Map",
    firms: ["HRT", "Citadel Securities", "Optiver"],
    source: "reconstructed from public reports (glassdoor, r/quant)",
    representative: true,
    statement: `Process a stream of order operations against a price-time-priority limit order book.\n\nEach op is one of:\n  ["limit", side, price, qty, oid]  side is "B" (buy) or "S" (sell)\n  ["cancel", oid]\n\nA new limit order matches against the best opposite-side resting orders: buys match the lowest-priced sells <= their price; sells match the highest-priced buys >= their price. Within a price level, older orders fill first (FIFO). Partial fills are allowed; leftover quantity rests in the book. Cancelling removes any remaining quantity for that order id.\n\nReturn the list of fills as [buy_oid, sell_oid, price, qty] in execution order. A fill executes at the resting (passive) order's price.\n\nExample:\nInput: ops = [["limit","S",101,5,1], ["limit","S",100,5,2], ["limit","B",101,8,3]]\nOutput: [[3,2,100,5],[3,1,101,3]]`,
    funcName: "match_orders",
    starter: `def match_orders(ops):\n    # Your code here\n    pass`,
    solution: `import heapq\n\ndef match_orders(ops):\n    buys = []   # max-heap: (-price, seq, oid)\n    sells = []  # min-heap: (price, seq, oid)\n    qty = {}\n    live = set()\n    seq = 0\n    fills = []\n    def top_ok(h):\n        while h and (h[0][2] not in live or qty.get(h[0][2], 0) == 0):\n            heapq.heappop(h)\n    for op in ops:\n        if op[0] == "cancel":\n            oid = op[1]\n            live.discard(oid); qty[oid] = 0\n            continue\n        _, side, price, q, oid = op\n        seq += 1\n        qty[oid] = q; live.add(oid)\n        if side == "B":\n            top_ok(sells)\n            while q > 0 and sells and sells[0][0] <= price:\n                p, s, soid = sells[0]\n                take = min(q, qty[soid])\n                fills.append([oid, soid, p, take])\n                q -= take; qty[soid] -= take; qty[oid] -= take\n                if qty[soid] == 0:\n                    heapq.heappop(sells); live.discard(soid)\n                top_ok(sells)\n            if q > 0:\n                heapq.heappush(buys, (-price, seq, oid))\n        else:\n            top_ok(buys)\n            while q > 0 and buys and -buys[0][0] >= price:\n                negp, s, boid = buys[0]\n                p = -negp\n                take = min(q, qty[boid])\n                fills.append([boid, oid, p, take])\n                q -= take; qty[boid] -= take; qty[oid] -= take\n                if qty[boid] == 0:\n                    heapq.heappop(buys); live.discard(boid)\n                top_ok(buys)\n            if q > 0:\n                heapq.heappush(sells, (price, seq, oid))\n    return fills`,
    tests: [
      { call: 'match_orders([["limit","S",101,5,1],["limit","S",100,5,2],["limit","B",101,8,3]])', expected: "[[3,2,100,5],[3,1,101,3]]" },
      { call: 'match_orders([["limit","B",100,5,1],["limit","S",100,5,2]])', expected: "[[1,2,100,5]]" },
      { call: 'match_orders([["limit","B",100,5,1],["cancel",1],["limit","S",100,5,2]])', expected: "[]" },
      { call: 'match_orders([])', expected: "[]" },
      { call: 'match_orders([["limit","S",100,3,1],["limit","S",100,3,2],["limit","B",100,4,3]])', expected: "[[3,1,100,3],[3,2,100,1]]" },
    ],
    hidden: [
      { call: 'match_orders([["limit","B",105,10,1],["limit","S",100,4,2],["limit","S",102,4,3]])', expected: "[[1,2,105,4],[1,3,105,4]]" },
      { call: 'match_orders([["limit","S",50,5,1],["limit","B",40,5,2]])', expected: "[]" },
    ],
    hint: "Two heaps (max-heap buys, min-heap sells) for price-time priority; lazily skip cancelled/empty orders at the top.",
  },

  // --------------------------------------------------------------------------
  // 2. Settlement dependency cycle detection + topo order (Graphs) — Hard
  // --------------------------------------------------------------------------
  {
    id: "settlement-topo-order",
    leetcode: "https://leetcode.com/problems/course-schedule-ii/",
    title: "Settlement Dependency Ordering",
    difficulty: "Hard",
    topic: "Graphs / Topological Sort",
    firms: ["Citadel Securities", "Two Sigma", "DRW"],
    source: "reconstructed from public reports (glassdoor, quantt.co.uk)",
    representative: true,
    statement: `A clearing system settles trades, but some trades depend on others settling first. You are given n trades labelled 0..n-1 and a list of dependencies [a, b] meaning trade a must settle before trade b.\n\nReturn a valid settlement order as a list. To make the answer deterministic, always pick the ready trade with the SMALLEST label first (lexicographically smallest topological order). If a cycle makes settlement impossible, return [].\n\nExample:\nInput: n = 4, deps = [[0,1],[0,2],[1,3],[2,3]]\nOutput: [0, 1, 2, 3]`,
    funcName: "settlement_order",
    starter: `def settlement_order(n, deps):\n    # Your code here\n    pass`,
    solution: `import heapq\n\ndef settlement_order(n, deps):\n    adj = [[] for _ in range(n)]\n    indeg = [0] * n\n    for a, b in deps:\n        adj[a].append(b)\n        indeg[b] += 1\n    heap = [i for i in range(n) if indeg[i] == 0]\n    heapq.heapify(heap)\n    order = []\n    while heap:\n        u = heapq.heappop(heap)\n        order.append(u)\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                heapq.heappush(heap, v)\n    return order if len(order) == n else []`,
    tests: [
      { call: "settlement_order(4, [[0,1],[0,2],[1,3],[2,3]])", expected: "[0, 1, 2, 3]" },
      { call: "settlement_order(3, [[0,1],[1,2],[2,0]])", expected: "[]" },
      { call: "settlement_order(2, [])", expected: "[0, 1]" },
      { call: "settlement_order(1, [])", expected: "[0]" },
      { call: "settlement_order(4, [[1,0],[2,0],[3,1],[3,2]])", expected: "[3, 1, 2, 0]" },
    ],
    hidden: [
      { call: "settlement_order(5, [[0,1],[0,2],[3,4]])", expected: "[0, 1, 2, 3, 4]" },
      { call: "settlement_order(3, [[0,0]])", expected: "[]" },
    ],
    hint: "Kahn's algorithm with a min-heap of zero-indegree nodes for the lexicographically smallest order; empty result if not all nodes are emitted.",
  },

  // --------------------------------------------------------------------------
  // 3. Max VWAP over a sliding window (Sliding Window) — Medium
  // --------------------------------------------------------------------------
  {
    id: "max-vwap-window",
    leetcode: "https://leetcode.com/problems/maximum-average-subarray-i/",
    title: "Max VWAP Over a Sliding Window",
    difficulty: "Medium",
    topic: "Sliding Window",
    firms: ["Optiver", "IMC", "Jane Street"],
    source: "reconstructed from public reports (quantt.co.uk, optiver OA)",
    representative: true,
    statement: `You are given parallel lists prices and volumes for consecutive trades, and a window size k. For each contiguous window of k trades, compute the volume-weighted average price (VWAP):\n\n  VWAP = sum(price_i * volume_i) / sum(volume_i)\n\nReturn the MAXIMUM VWAP across all windows, rounded to 4 decimal places. Assume every window has positive total volume and 1 <= k <= len(prices).\n\nExample:\nInput: prices = [10, 12, 11], volumes = [1, 1, 2], k = 2\nOutput: 11.3333   (window [12,11] with vols [1,2] -> (12+22)/3)`,
    funcName: "max_vwap",
    starter: `def max_vwap(prices, volumes, k):\n    # Your code here\n    pass`,
    solution: `def max_vwap(prices, volumes, k):\n    n = len(prices)\n    pv = sum(prices[i] * volumes[i] for i in range(k))\n    vol = sum(volumes[:k])\n    best = pv / vol\n    for i in range(k, n):\n        pv += prices[i] * volumes[i] - prices[i - k] * volumes[i - k]\n        vol += volumes[i] - volumes[i - k]\n        cur = pv / vol\n        if cur > best:\n            best = cur\n    return round(best, 4)`,
    tests: [
      { call: "max_vwap([10,12,11], [1,1,2], 2)", expected: "11.3333" },
      { call: "max_vwap([10,20,30], [1,1,1], 1)", expected: "30.0" },
      { call: "max_vwap([100,100,100], [5,3,2], 3)", expected: "100.0" },
      { call: "max_vwap([5,5,5,5], [1,2,3,4], 2)", expected: "5.0" },
      { call: "max_vwap([10,30,20,40], [2,1,1,3], 2)", expected: "35.0" },
    ],
    hidden: [
      { call: "max_vwap([1,2,3,4,5], [1,1,1,1,1], 5)", expected: "3.0" },
      { call: "max_vwap([8,6,4], [3,1,1], 3)", expected: "6.8" },
    ],
    hint: "Slide two running sums (price*volume and volume); recompute VWAP per window in O(1) and track the max.",
  },

  // --------------------------------------------------------------------------
  // 4. Best time to trade with cooldown (DP) — Medium/Hard
  // --------------------------------------------------------------------------
  {
    id: "trade-with-cooldown",
    leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
    title: "Max Profit Trading With a Cooldown",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    firms: ["Two Sigma", "Citadel Securities", "Jump"],
    source: "reconstructed from public reports (quantt.co.uk)",
    representative: true,
    statement: `Given daily prices of a security, find the maximum profit you can make with as many buy/sell transactions as you like, subject to: you must sell before buying again, and after you sell you must wait one full day (cooldown) before buying.\n\nReturn the max achievable profit (0 if no profit is possible).\n\nExample:\nInput: prices = [1, 2, 3, 0, 2]\nOutput: 3   (buy 1, sell 3, cooldown, buy 0, sell 2 -> 2 + 1)`,
    funcName: "max_profit_cooldown",
    starter: `def max_profit_cooldown(prices):\n    # Your code here\n    pass`,
    solution: `def max_profit_cooldown(prices):\n    if not prices:\n        return 0\n    hold = float('-inf')   # max profit while holding a share\n    sold = 0               # max profit, just sold today\n    rest = 0               # max profit, in cooldown/idle\n    for p in prices:\n        prev_sold = sold\n        sold = hold + p\n        hold = max(hold, rest - p)\n        rest = max(rest, prev_sold)\n    return max(sold, rest)`,
    tests: [
      { call: "max_profit_cooldown([1,2,3,0,2])", expected: "3" },
      { call: "max_profit_cooldown([1])", expected: "0" },
      { call: "max_profit_cooldown([])", expected: "0" },
      { call: "max_profit_cooldown([5,4,3,2,1])", expected: "0" },
      { call: "max_profit_cooldown([1,2,4])", expected: "3" },
    ],
    hidden: [
      { call: "max_profit_cooldown([6,1,3,2,4,7])", expected: "6" },
      { call: "max_profit_cooldown([2,1,4])", expected: "3" },
    ],
    hint: "Three-state DP per day: hold, sold-today, resting; cooldown means you may only buy from the resting state.",
  },

  // --------------------------------------------------------------------------
  // 5. Best time to trade with a transaction fee (DP) — Medium
  // --------------------------------------------------------------------------
  {
    id: "trade-with-fee",
    leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/",
    title: "Max Profit With a Transaction Fee",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    firms: ["DRW", "SIG", "Optiver"],
    source: "reconstructed from public reports (quantt.co.uk)",
    representative: true,
    statement: `Given daily prices and a fixed fee charged per completed transaction (one buy + sell), find the maximum profit with unlimited transactions. The fee is deducted once per sell.\n\nExample:\nInput: prices = [1, 3, 2, 8, 4, 9], fee = 2\nOutput: 8   (buy 1 sell 8 -> 5 after fee; buy 4 sell 9 -> 3 after fee)`,
    funcName: "max_profit_fee",
    starter: `def max_profit_fee(prices, fee):\n    # Your code here\n    pass`,
    solution: `def max_profit_fee(prices, fee):\n    if not prices:\n        return 0\n    cash = 0\n    hold = -prices[0]\n    for p in prices[1:]:\n        cash = max(cash, hold + p - fee)\n        hold = max(hold, cash - p)\n    return cash`,
    tests: [
      { call: "max_profit_fee([1,3,2,8,4,9], 2)", expected: "8" },
      { call: "max_profit_fee([1,3,7,5,10,3], 3)", expected: "6" },
      { call: "max_profit_fee([1], 1)", expected: "0" },
      { call: "max_profit_fee([], 5)", expected: "0" },
      { call: "max_profit_fee([5,4,3,2,1], 1)", expected: "0" },
    ],
    hidden: [
      { call: "max_profit_fee([1,2,3,4,5], 0)", expected: "4" },
      { call: "max_profit_fee([10,1,1,6], 1)", expected: "4" },
    ],
    hint: "Track best cash (not holding) and best hold (holding a share) each day; subtract the fee when you sell.",
  },

  // --------------------------------------------------------------------------
  // 6. Order-throttle / rate limiter over a time window (Deque) — Medium
  // --------------------------------------------------------------------------
  {
    id: "order-rate-limiter",
    leetcode: "https://leetcode.com/problems/number-of-recent-calls/",
    title: "Order Rate Limiter",
    difficulty: "Medium",
    topic: "Deque / Queue",
    firms: ["HRT", "Jump", "Citadel Securities"],
    source: "reconstructed from public reports (quantt.co.uk, glassdoor)",
    representative: true,
    statement: `An exchange gateway allows at most max_orders order submissions within any rolling window of window_ms milliseconds. Given a chronologically sorted list of submission timestamps (ms), return a list of booleans: True if that order is ACCEPTED, False if it is REJECTED (throttled).\n\nAn order at time t is accepted only if, counting it, no more than max_orders accepted orders fall in the window (t - window_ms, t] (i.e. strictly older than window_ms ago are dropped). Rejected orders do not count toward the limit.\n\nExample:\nInput: times = [0, 100, 200, 300], window_ms = 250, max_orders = 2\nOutput: [True, True, False, True]`,
    funcName: "rate_limit",
    starter: `def rate_limit(times, window_ms, max_orders):\n    # Your code here\n    pass`,
    solution: `from collections import deque\n\ndef rate_limit(times, window_ms, max_orders):\n    accepted = deque()\n    out = []\n    for t in times:\n        while accepted and accepted[0] <= t - window_ms:\n            accepted.popleft()\n        if len(accepted) < max_orders:\n            accepted.append(t)\n            out.append(True)\n        else:\n            out.append(False)\n    return out`,
    tests: [
      { call: "rate_limit([0,100,200,300], 250, 2)", expected: "[True, True, False, True]" },
      { call: "rate_limit([0,1,2,3,4], 10, 3)", expected: "[True, True, True, False, False]" },
      { call: "rate_limit([], 100, 5)", expected: "[]" },
      { call: "rate_limit([0,0,0], 1, 2)", expected: "[True, True, False]" },
      { call: "rate_limit([0,10,20,30], 10, 1)", expected: "[True, True, True, True]" },
    ],
    hidden: [
      { call: "rate_limit([0,5,10,15], 11, 2)", expected: "[True, True, False, True]" },
      { call: "rate_limit([1,2,3], 100, 0)", expected: "[False, False, False]" },
    ],
    hint: "Keep a deque of accepted timestamps; evict entries that fell out of the window before each check.",
  },

  // --------------------------------------------------------------------------
  // 7. Running median of a trade-price stream (Two Heaps) — Hard
  // --------------------------------------------------------------------------
  {
    id: "running-median-stream",
    leetcode: "https://leetcode.com/problems/find-median-from-data-stream/",
    title: "Running Median of a Price Stream",
    difficulty: "Hard",
    topic: "Two Heaps",
    firms: ["Jane Street", "Two Sigma", "HRT"],
    source: "reconstructed from public reports (lodely.com jane street OA)",
    representative: true,
    statement: `Trade prices arrive one at a time. After each price, report the median of all prices seen so far. The median of an even count is the average of the two middle values.\n\nReturn the list of medians (as floats) after each insertion.\n\nExample:\nInput: prices = [5, 15, 1, 3]\nOutput: [5.0, 10.0, 5.0, 4.0]`,
    funcName: "running_median",
    starter: `def running_median(prices):\n    # Your code here\n    pass`,
    solution: `import heapq\n\ndef running_median(prices):\n    lo = []  # max-heap (negated): smaller half\n    hi = []  # min-heap: larger half\n    out = []\n    for x in prices:\n        if lo and x <= -lo[0]:\n            heapq.heappush(lo, -x)\n        else:\n            heapq.heappush(hi, x)\n        if len(lo) > len(hi) + 1:\n            heapq.heappush(hi, -heapq.heappop(lo))\n        elif len(hi) > len(lo):\n            heapq.heappush(lo, -heapq.heappop(hi))\n        if len(lo) > len(hi):\n            out.append(float(-lo[0]))\n        else:\n            out.append((-lo[0] + hi[0]) / 2.0)\n    return out`,
    tests: [
      { call: "running_median([5,15,1,3])", expected: "[5.0, 10.0, 5.0, 4.0]" },
      { call: "running_median([1,2,3,4,5])", expected: "[1.0, 1.5, 2.0, 2.5, 3.0]" },
      { call: "running_median([2])", expected: "[2.0]" },
      { call: "running_median([])", expected: "[]" },
      { call: "running_median([4,4,4,4])", expected: "[4.0, 4.0, 4.0, 4.0]" },
    ],
    hidden: [
      { call: "running_median([10,1,8,2,6])", expected: "[10.0, 5.5, 8.0, 5.0, 6.0]" },
      { call: "running_median([1,1,2])", expected: "[1.0, 1.0, 1.0]" },
    ],
    hint: "Maintain a max-heap of the lower half and a min-heap of the upper half, rebalancing so their sizes differ by at most one.",
  },

  // --------------------------------------------------------------------------
  // 8. Merge overlapping trading sessions (Intervals) — Medium
  // --------------------------------------------------------------------------
  {
    id: "merge-trading-sessions",
    leetcode: "https://leetcode.com/problems/merge-intervals/",
    title: "Merge Overlapping Trading Sessions",
    difficulty: "Medium",
    topic: "Intervals",
    firms: ["IMC", "SIG", "Optiver"],
    source: "reconstructed from public reports (quantt.co.uk)",
    representative: true,
    statement: `Given a list of [start, end] trading sessions (inclusive, possibly unsorted and overlapping), merge all overlapping or touching sessions and return the merged list sorted by start. Sessions that merely touch (end == next start) should be merged into one.\n\nExample:\nInput: [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]`,
    funcName: "merge_sessions",
    starter: `def merge_sessions(sessions):\n    # Your code here\n    pass`,
    solution: `def merge_sessions(sessions):\n    if not sessions:\n        return []\n    s = sorted(sessions)\n    out = [list(s[0])]\n    for start, end in s[1:]:\n        if start <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], end)\n        else:\n            out.append([start, end])\n    return out`,
    tests: [
      { call: "merge_sessions([[1,3],[2,6],[8,10],[15,18]])", expected: "[[1,6],[8,10],[15,18]]" },
      { call: "merge_sessions([[1,4],[4,5]])", expected: "[[1,5]]" },
      { call: "merge_sessions([[1,4],[2,3]])", expected: "[[1,4]]" },
      { call: "merge_sessions([])", expected: "[]" },
      { call: "merge_sessions([[5,6],[1,2],[3,4]])", expected: "[[1,2],[3,4],[5,6]]" },
    ],
    hidden: [
      { call: "merge_sessions([[1,10],[2,3],[4,5],[6,7]])", expected: "[[1,10]]" },
      { call: "merge_sessions([[1,2]])", expected: "[[1,2]]" },
    ],
    hint: "Sort by start, then extend the last merged interval whenever the next start is within (<=) its end.",
  },

  // --------------------------------------------------------------------------
  // 9. FIFO position netting / realized P&L (Queue) — Medium
  // --------------------------------------------------------------------------
  {
    id: "fifo-realized-pnl",
    title: "FIFO Realized P&L From a Fill Stream",
    difficulty: "Medium",
    topic: "Queue / FIFO",
    firms: ["Citadel Securities", "DRW", "Two Sigma"],
    source: "reconstructed from public reports (quantt.co.uk)",
    representative: true,
    statement: `Compute realized profit-and-loss from a stream of single-symbol fills using FIFO lot matching. Each fill is ["B", qty, price] (buy) or ["S", qty, price] (sell). A sell closes the oldest open buy lots first; a buy closes the oldest open short lots first. Realized P&L on a closing match of size m at price p against an opening lot at price o is:\n  long lot closed by a sell:  (p - o) * m\n  short lot closed by a buy:  (o - p) * m\n\nAssume fills never flip and close exactly (no over-selling beyond open position in the tests). Return total realized P&L as an integer when whole, else a float.\n\nExample:\nInput: fills = [["B",10,100],["B",5,110],["S",12,120]]\nOutput: 220   (10*(120-100) + 2*(120-110))`,
    funcName: "realized_pnl",
    starter: `def realized_pnl(fills):\n    # Your code here\n    pass`,
    solution: `from collections import deque\n\ndef realized_pnl(fills):\n    longs = deque()   # open buy lots: [qty, price]\n    shorts = deque()  # open short lots: [qty, price]\n    pnl = 0\n    for side, qty, price in fills:\n        if side == "B":\n            while qty > 0 and shorts:\n                lot = shorts[0]\n                m = min(qty, lot[0])\n                pnl += (lot[1] - price) * m\n                lot[0] -= m; qty -= m\n                if lot[0] == 0:\n                    shorts.popleft()\n            if qty > 0:\n                longs.append([qty, price])\n        else:\n            while qty > 0 and longs:\n                lot = longs[0]\n                m = min(qty, lot[0])\n                pnl += (price - lot[1]) * m\n                lot[0] -= m; qty -= m\n                if lot[0] == 0:\n                    longs.popleft()\n            if qty > 0:\n                shorts.append([qty, price])\n    return pnl`,
    tests: [
      { call: 'realized_pnl([["B",10,100],["B",5,110],["S",12,120]])', expected: "220" },
      { call: 'realized_pnl([["B",5,100],["S",5,90]])', expected: "-50" },
      { call: 'realized_pnl([["S",10,100],["B",10,80]])', expected: "200" },
      { call: 'realized_pnl([])', expected: "0" },
      { call: 'realized_pnl([["B",10,100]])', expected: "0" },
    ],
    hidden: [
      { call: 'realized_pnl([["B",5,10],["S",2,12],["S",3,8]])', expected: "-2" },
      { call: 'realized_pnl([["S",4,50],["S",4,60],["B",6,55]])', expected: "-10" },
    ],
    hint: "Keep two FIFO queues (open longs and open shorts); a fill first closes the opposite side oldest-first, then any remainder opens a new lot.",
  },

  // --------------------------------------------------------------------------
  // 10. Currency arbitrage cycle (Bellman-Ford) — Hard
  // --------------------------------------------------------------------------
  {
    id: "currency-arbitrage",
    leetcode: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    title: "Detect a Currency Arbitrage Cycle",
    difficulty: "Hard",
    topic: "Graphs / Bellman-Ford",
    firms: ["Jane Street", "Jump", "HRT"],
    source: "reconstructed from public reports (lodely.com jane street OA)",
    representative: true,
    statement: `You are given an n x n matrix rates where rates[i][j] is the amount of currency j you get for 1 unit of currency i. An arbitrage opportunity exists if there is a cycle of conversions that returns more than 1 unit of the starting currency (product of rates along the cycle > 1).\n\nReturn True if any arbitrage cycle exists, else False.\n\nUse the classic transform: take -log of each rate and look for a negative-weight cycle (Bellman-Ford).\n\nExample:\nInput: rates = [[1.0, 2.0],[0.6, 1.0]]\nOutput: True   (1 -> currency1 = 2.0, back = 1.2 > 1)`,
    funcName: "has_arbitrage",
    starter: `def has_arbitrage(rates):\n    # Your code here\n    pass`,
    solution: `import math\n\ndef has_arbitrage(rates):\n    n = len(rates)\n    if n == 0:\n        return False\n    edges = []\n    for i in range(n):\n        for j in range(n):\n            if i != j and rates[i][j] > 0:\n                edges.append((i, j, -math.log(rates[i][j])))\n    dist = [0.0] * n  # start from a virtual source: all reachable\n    for _ in range(n - 1):\n        for u, v, w in edges:\n            if dist[u] + w < dist[v] - 1e-12:\n                dist[v] = dist[u] + w\n    for u, v, w in edges:\n        if dist[u] + w < dist[v] - 1e-12:\n            return True\n    return False`,
    tests: [
      { call: "has_arbitrage([[1.0,2.0],[0.6,1.0]])", expected: "True" },
      { call: "has_arbitrage([[1.0,2.0],[0.4,1.0]])", expected: "False" },
      { call: "has_arbitrage([[1.0]])", expected: "False" },
      { call: "has_arbitrage([])", expected: "False" },
      { call: "has_arbitrage([[1.0,0.5],[2.0,1.0]])", expected: "False" },
    ],
    hidden: [
      { call: "has_arbitrage([[1.0,0.5,0.2],[2.0,1.0,0.5],[5.0,2.0,1.0]])", expected: "True" },
      { call: "has_arbitrage([[1.0,0.9,90.0],[1.1,1.0,1.0],[0.0123,1.0,1.0]])", expected: "True" },
    ],
    hint: "Convert each rate to weight -log(rate); an arbitrage cycle is a negative-weight cycle, detectable by an extra Bellman-Ford relaxation pass.",
  },

  // --------------------------------------------------------------------------
  // 11. Cumulative P&L peak drawdown (Prefix Sums) — Medium
  // --------------------------------------------------------------------------
  {
    id: "max-drawdown",
    leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    title: "Maximum Drawdown of Cumulative P&L",
    difficulty: "Medium",
    topic: "Prefix Sums",
    firms: ["Two Sigma", "DRW", "SIG"],
    source: "reconstructed from public reports (quantt.co.uk)",
    representative: true,
    statement: `Given a list of per-trade P&L values (positive or negative), build the cumulative equity curve and return the maximum drawdown: the largest drop from any running peak to a later point.\n\nThe equity curve starts at 0 (before any trade). Drawdown at time t = (running max of cumulative, including the starting 0) - (cumulative at t). Return the maximum such value over all t (0 if the curve never drops below its peak).\n\nExample:\nInput: pnl = [3, -1, -2, 4, -5]\nOutput: 5   (cum = [3, 2, 0, 4, -1], running peak = 4, lowest after peak = -1 -> 5)`,
    funcName: "max_drawdown",
    starter: `def max_drawdown(pnl):\n    # Your code here\n    pass`,
    solution: `def max_drawdown(pnl):\n    cum = 0\n    peak = 0  # equity curve starts at 0\n    worst = 0\n    for x in pnl:\n        cum += x\n        if cum > peak:\n            peak = cum\n        dd = peak - cum\n        if dd > worst:\n            worst = dd\n    return worst`,
    tests: [
      { call: "max_drawdown([3,-1,-2,4,-5])", expected: "5" },
      { call: "max_drawdown([1,2,3,4])", expected: "0" },
      { call: "max_drawdown([-1,-2,-3])", expected: "6" },
      { call: "max_drawdown([])", expected: "0" },
      { call: "max_drawdown([5,-3,2,-6,4])", expected: "7" },
    ],
    hidden: [
      { call: "max_drawdown([10,-10,10,-10])", expected: "10" },
      { call: "max_drawdown([0,0,0])", expected: "0" },
    ],
    hint: "Sweep once tracking cumulative sum and its running peak; the answer is the max of (peak - cumulative).",
  },

  // --------------------------------------------------------------------------
  // 12. Next higher price (Monotonic Stack) — Medium
  // --------------------------------------------------------------------------
  {
    id: "next-higher-price",
    leetcode: "https://leetcode.com/problems/next-greater-element-i/",
    title: "Next Higher Price",
    difficulty: "Medium",
    topic: "Monotonic Stack",
    firms: ["Optiver", "IMC", "Citadel Securities"],
    source: "reconstructed from public reports (quantt.co.uk)",
    representative: true,
    statement: `Given a list of tick prices, for each tick return the number of ticks you must wait until a strictly higher price appears. If no higher price ever appears, return 0 for that tick.\n\nExample:\nInput: prices = [73, 74, 75, 71, 69, 72, 76, 73]\nOutput: [1, 1, 4, 2, 1, 1, 0, 0]`,
    funcName: "next_higher",
    starter: `def next_higher(prices):\n    # Your code here\n    pass`,
    solution: `def next_higher(prices):\n    n = len(prices)\n    res = [0] * n\n    stack = []  # indices with no resolved next-higher yet\n    for i, p in enumerate(prices):\n        while stack and prices[stack[-1]] < p:\n            j = stack.pop()\n            res[j] = i - j\n        stack.append(i)\n    return res`,
    tests: [
      { call: "next_higher([73,74,75,71,69,72,76,73])", expected: "[1, 1, 4, 2, 1, 1, 0, 0]" },
      { call: "next_higher([1,2,3])", expected: "[1, 1, 0]" },
      { call: "next_higher([3,2,1])", expected: "[0, 0, 0]" },
      { call: "next_higher([])", expected: "[]" },
      { call: "next_higher([5,5,5])", expected: "[0, 0, 0]" },
    ],
    hidden: [
      { call: "next_higher([2,1,2,1,3])", expected: "[4, 1, 2, 1, 0]" },
      { call: "next_higher([10])", expected: "[0]" },
    ],
    hint: "Keep a stack of indices whose next-higher tick is still unknown; when a higher price arrives, pop and record the index distance.",
  },

  // --------------------------------------------------------------------------
  // 13. Binary search on book levels (Binary Search) — Medium
  // --------------------------------------------------------------------------
  {
    id: "fill-marketable-qty",
    leetcode: "https://leetcode.com/problems/search-insert-position/",
    title: "Quantity Fillable At Or Below a Limit",
    difficulty: "Medium",
    topic: "Binary Search",
    firms: ["HRT", "Optiver", "Jump"],
    source: "reconstructed from public reports (quantt.co.uk, optiver OA)",
    representative: true,
    statement: `The ask side of a book is given as two parallel sorted lists: ask_prices (strictly increasing) and ask_qty (resting quantity at each price level). A marketable buy with limit price L can sweep every level with price <= L. Given a list of query limit prices, return for each query the total quantity available at or below that limit.\n\nUse binary search + a prefix-sum of quantities for O(log n) per query.\n\nExample:\nInput: ask_prices = [100, 101, 103], ask_qty = [5, 3, 7], queries = [99, 100, 102, 200]\nOutput: [0, 5, 8, 15]`,
    funcName: "fillable_qty",
    starter: `def fillable_qty(ask_prices, ask_qty, queries):\n    # Your code here\n    pass`,
    solution: `import bisect\n\ndef fillable_qty(ask_prices, ask_qty, queries):\n    prefix = [0]\n    for q in ask_qty:\n        prefix.append(prefix[-1] + q)\n    out = []\n    for L in queries:\n        idx = bisect.bisect_right(ask_prices, L)\n        out.append(prefix[idx])\n    return out`,
    tests: [
      { call: "fillable_qty([100,101,103], [5,3,7], [99,100,102,200])", expected: "[0, 5, 8, 15]" },
      { call: "fillable_qty([10], [4], [9,10,11])", expected: "[0, 4, 4]" },
      { call: "fillable_qty([], [], [5])", expected: "[0]" },
      { call: "fillable_qty([1,2,3], [1,1,1], [])", expected: "[]" },
      { call: "fillable_qty([5,10,15], [2,2,2], [5,10,15])", expected: "[2, 4, 6]" },
    ],
    hidden: [
      { call: "fillable_qty([100,200,300], [10,20,30], [50,250,1000])", expected: "[0, 30, 60]" },
      { call: "fillable_qty([1,2], [100,100], [0])", expected: "[0]" },
    ],
    hint: "Prefix-sum the quantities once; for each query, bisect_right the price array to find how many levels are at or below the limit.",
  },

  // --------------------------------------------------------------------------
  // 14. Best single trade (max subarray flavor) (Arrays) — Easy
  // --------------------------------------------------------------------------
  {
    id: "best-single-trade",
    leetcode: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    title: "Best Single Buy/Sell",
    difficulty: "Easy",
    topic: "Arrays / Greedy",
    firms: ["Optiver", "IMC", "SIG"],
    source: "reconstructed from public reports (quantt.co.uk)",
    representative: true,
    statement: `Given daily prices, find the maximum profit from a single buy followed by a later sell. If no profit is possible, return 0.\n\nExample:\nInput: prices = [7, 1, 5, 3, 6, 4]\nOutput: 5   (buy at 1, sell at 6)`,
    funcName: "best_single_trade",
    starter: `def best_single_trade(prices):\n    # Your code here\n    pass`,
    solution: `def best_single_trade(prices):\n    if not prices:\n        return 0\n    min_price = prices[0]\n    best = 0\n    for p in prices[1:]:\n        if p - min_price > best:\n            best = p - min_price\n        if p < min_price:\n            min_price = p\n    return best`,
    tests: [
      { call: "best_single_trade([7,1,5,3,6,4])", expected: "5" },
      { call: "best_single_trade([7,6,4,3,1])", expected: "0" },
      { call: "best_single_trade([1,2,3,4,5])", expected: "4" },
      { call: "best_single_trade([])", expected: "0" },
      { call: "best_single_trade([3])", expected: "0" },
    ],
    hidden: [
      { call: "best_single_trade([2,4,1,7])", expected: "6" },
      { call: "best_single_trade([5,5,5])", expected: "0" },
    ],
    hint: "Track the lowest price seen so far and the best (price - lowest) as you scan left to right.",
  },

  // --------------------------------------------------------------------------
  // 15. Top-K most active symbols (Heap / Hash Map) — Medium
  // --------------------------------------------------------------------------
  {
    id: "top-k-active-symbols",
    leetcode: "https://leetcode.com/problems/top-k-frequent-elements/",
    title: "Top-K Most Traded Symbols",
    difficulty: "Medium",
    topic: "Heap / Hash Map",
    firms: ["Two Sigma", "Citadel Securities", "DRW"],
    source: "reconstructed from public reports (quantt.co.uk)",
    representative: true,
    statement: `Given a list of trade symbols (strings) and an integer k, return the k symbols with the highest trade counts, ordered by count descending. Break ties by symbol name ascending (alphabetical). Assume k <= number of distinct symbols.\n\nExample:\nInput: trades = ["AAPL","MSFT","AAPL","GOOG","MSFT","AAPL"], k = 2\nOutput: ["AAPL", "MSFT"]`,
    funcName: "top_k_symbols",
    starter: `def top_k_symbols(trades, k):\n    # Your code here\n    pass`,
    solution: `from collections import Counter\n\ndef top_k_symbols(trades, k):\n    counts = Counter(trades)\n    items = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))\n    return [sym for sym, _ in items[:k]]`,
    tests: [
      { call: 'top_k_symbols(["AAPL","MSFT","AAPL","GOOG","MSFT","AAPL"], 2)', expected: '["AAPL", "MSFT"]' },
      { call: 'top_k_symbols(["A","B","C"], 3)', expected: '["A", "B", "C"]' },
      { call: 'top_k_symbols(["X","X","Y","Y","Z"], 2)', expected: '["X", "Y"]' },
      { call: 'top_k_symbols(["SPY"], 1)', expected: '["SPY"]' },
      { call: 'top_k_symbols(["B","A","B","A","C"], 1)', expected: '["A"]' },
    ],
    hidden: [
      { call: 'top_k_symbols(["T","T","T","Q","Q","R"], 2)', expected: '["T", "Q"]' },
      { call: 'top_k_symbols(["z","y","x"], 2)', expected: '["x", "y"]' },
    ],
    hint: "Count with a Counter, then sort items by (-count, symbol) and take the first k.",
  },

  // --------------------------------------------------------------------------
  // 16. Shortest conversion path / fewest hops (BFS) — Medium
  // --------------------------------------------------------------------------
  {
    id: "fewest-conversion-hops",
    leetcode: "https://leetcode.com/problems/word-ladder/",
    title: "Fewest Conversion Hops",
    difficulty: "Medium",
    topic: "Graphs / BFS",
    firms: ["Jane Street", "Jump", "IMC"],
    source: "reconstructed from public reports (quantt.co.uk)",
    representative: true,
    statement: `You can convert between assets via a set of directed conversion pairs [a, b] (you can convert a -> b). Given a start asset and a target asset, return the minimum number of conversions needed to get from start to target. Return 0 if start == target, and -1 if the target is unreachable.\n\nExample:\nInput: pairs = [["USD","EUR"],["EUR","GBP"],["USD","JPY"]], start = "USD", target = "GBP"\nOutput: 2`,
    funcName: "fewest_hops",
    starter: `def fewest_hops(pairs, start, target):\n    # Your code here\n    pass`,
    solution: `from collections import deque, defaultdict\n\ndef fewest_hops(pairs, start, target):\n    if start == target:\n        return 0\n    adj = defaultdict(list)\n    for a, b in pairs:\n        adj[a].append(b)\n    seen = {start}\n    q = deque([(start, 0)])\n    while q:\n        node, d = q.popleft()\n        for nxt in adj[node]:\n            if nxt == target:\n                return d + 1\n            if nxt not in seen:\n                seen.add(nxt)\n                q.append((nxt, d + 1))\n    return -1`,
    tests: [
      { call: 'fewest_hops([["USD","EUR"],["EUR","GBP"],["USD","JPY"]], "USD", "GBP")', expected: "2" },
      { call: 'fewest_hops([["USD","EUR"]], "USD", "USD")', expected: "0" },
      { call: 'fewest_hops([["USD","EUR"]], "EUR", "USD")', expected: "-1" },
      { call: 'fewest_hops([], "A", "B")', expected: "-1" },
      { call: 'fewest_hops([["A","B"],["A","C"],["C","D"],["B","D"]], "A", "D")', expected: "2" },
    ],
    hidden: [
      { call: 'fewest_hops([["A","B"],["B","C"],["C","A"]], "A", "C")', expected: "2" },
      { call: 'fewest_hops([["A","B"],["B","C"],["A","C"]], "A", "C")', expected: "1" },
    ],
    hint: "Plain BFS over the directed conversion graph; the level at which you first reach the target is the answer.",
  },
];
