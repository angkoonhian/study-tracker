export default {
  id: "greedy",
  title: "Greedy Algorithms",
  subtitle: "Recognising when greedy works, and the patterns that show up over and over",
  emoji: "",
  intro: `Greedy is the most psychologically difficult algorithm category. The code is usually trivial — sort something, then sweep through it making the locally optimal choice. The hard part is knowing that the locally optimal choice gives the globally optimal answer. Get it wrong and your algorithm produces convincing-looking nonsense.\n\nThis guide focuses on recognition. We cover what makes a problem amenable to greedy, the two main proof techniques (exchange argument and dominance), the five recurring patterns (intervals, jump games, gas station, partitioning, priority-queue greedy), and the trap of applying greedy when DP is actually required. The code is usually short; the thinking is everything.\n\nTable of contents:\n1. What makes a problem greedy\n2. Proving a greedy works\n3. Pattern A: interval scheduling\n4. Pattern B: jump games\n5. Pattern C: gas station and circular sweeps\n6. Pattern D: partition and grouping\n7. Pattern E: priority-queue greedy\n8. When greedy fails\n9. Common bugs\n10. Study plan\n11. Cheat sheet`,
  sections: [
    {
      heading: "1. What makes a problem greedy",
      blocks: [
        { type: "p", text: `A greedy algorithm makes a locally optimal choice at each step and never reconsiders. No backtracking, no exploring alternatives — just pick the best-looking option right now and move on. This is shockingly fast (usually O(n log n) for the sort plus O(n) for the sweep) but only works for a specific class of problems.` },
        { type: "h3", text: "1.1 The two required properties" },
        { type: "ul", items: [
          `Greedy choice property. At each step, there exists a locally optimal choice that is part of some globally optimal solution. You don't need to enumerate possibilities — committing to the local choice is safe.`,
          `Optimal substructure. After making the greedy choice, the remaining subproblem has the same structure and can be solved the same way. (Same property DP needs.)`
        ]},
        { type: "p", text: `If your problem has these two properties, greedy works and you should use it — it's faster and simpler than DP. The trick is proving the first one. The second is usually obvious.` },
        { type: "h3", text: "1.2 Greedy vs DP" },
        { type: "table", headers: ["Aspect", "Greedy", "DP"], rows: [
          ["Decision style", "Pick the locally best choice immediately, never reconsider.", "Consider all possible choices at each step; remember results."],
          ["Time", "Usually O(n log n) (sort) or O(n).", "Usually O(n^2) or worse."],
          ["Space", "O(1) or O(n) (the sort).", "O(state space)."],
          ["When to use", "When the greedy-choice property holds.", "When it doesn't — when local choices need global context."],
          ["Risk", "Easy to apply incorrectly; produces wrong answers silently.", "Slow but reliably correct if you set up the state right."]
        ]},
        { type: "callout", text: `Default to suspicion. If a problem looks greedy but you can't argue why the locally optimal choice is globally safe, write a DP solution. Wrong DP is a minor performance issue; wrong greedy is a wrong answer.` },
        { type: "h3", text: "1.3 Linguistic signals" },
        { type: "ul", items: [
          `"Minimum / maximum number of ... such that ..." — sometimes greedy, sometimes DP.`,
          `"Schedule the most ...", "maximize the count of ..." — often interval scheduling.`,
          `"Can you reach ...", "minimum number of jumps ..." — usually a sweep with a running frontier.`,
          `"Minimum cost / number of moves to make all elements equal / sorted" — sometimes greedy (often the median), sometimes DP.`,
          `"Construct the largest / smallest ..." — frequently greedy with a stack or sort.`
        ]},
        { type: "p", text: `These are signals to consider greedy, not signals to commit to it. The proof obligation is what separates greedy from wishful thinking.` }
      ]
    },
    {
      heading: "2. Proving a greedy works",
      blocks: [
        { type: "p", text: `Two techniques cover most greedy correctness arguments. You don't need to write the proof formally in an interview, but you should be able to sketch it. If you can't, your solution is probably wrong.` },
        { type: "h3", text: "2.1 The exchange argument" },
        { type: "p", text: `The exchange argument shows that any optimal solution can be transformed into the greedy solution without making it worse. The skeleton:` },
        { type: "ul", items: [
          `Assume there's some optimal solution OPT that differs from the greedy solution GREEDY.`,
          `Find the earliest place they differ — say, OPT uses choice X where GREEDY uses choice Y, with Y being the locally-best.`,
          `Show that swapping X for Y in OPT produces a solution that's at least as good. Repeat the argument until OPT matches GREEDY, proving GREEDY is also optimal.`
        ]},
        { type: "p", text: `Example: interval scheduling. Given a set of intervals, schedule the maximum number of non-overlapping intervals. Greedy: sort by end time, take each interval that doesn't conflict with the last chosen.` },
        { type: "p", text: `Exchange argument: suppose OPT picks some interval I that ends later than the greedy's first choice G (which has the earliest end time). Swap I for G in OPT. Since G ends earlier, anything that fit after I still fits after G. So the modified OPT has the same count. Repeat for each subsequent choice. We've transformed OPT into GREEDY without decreasing the count, so GREEDY is optimal.` },
        { type: "h3", text: "2.2 The dominance argument" },
        { type: "p", text: `Show that the greedy's partial solution at each step is at least as good ("dominates") any other partial solution that could have been built so far. By induction on the steps, the final greedy solution dominates everything.` },
        { type: "p", text: `Example: jump game. Reach the end of an array where each nums[i] is the max jump from i. Greedy: track the farthest reachable index as you sweep.` },
        { type: "p", text: `Dominance argument: at every index, the greedy maintains the maximum possible "farthest reachable" value. No alternative strategy could reach farther by step i, because the alternatives are subsumed by the maximum. So if greedy can reach the end, the alternatives can too (or worse).` },
        { type: "h3", text: "2.3 The cheap heuristic: try small counter-examples" },
        { type: "p", text: `In an interview you usually can't prove things formally. Instead, stress-test the greedy on small examples designed to break it:` },
        { type: "ul", items: [
          `Cases with ties.`,
          `Cases where the locally best choice consumes resources needed later.`,
          `Adversarial inputs designed for the specific greedy strategy you have in mind.`
        ]},
        { type: "p", text: `If your greedy survives, it's probably correct. If you find a counter-example, it's definitely wrong — and you've learned what to fix or that you need DP instead.` }
      ]
    },
    {
      heading: "3. Pattern A: interval scheduling",
      blocks: [
        { type: "p", text: `The most classical greedy family. Several variants with subtly different sort keys.` },
        { type: "h3", text: "3.1 Maximum non-overlapping intervals" },
        { type: "p", text: `Problem: given a set of intervals, select the maximum number of pairwise non-overlapping intervals.` },
        { type: "p", text: `Greedy: sort by end time, take each interval whose start is >= the last chosen interval's end.` },
        { type: "code", code: `def maxNonOverlapping(intervals):\n    intervals.sort(key=lambda x: x[1])              # sort by end time\n    count = 0\n    last_end = float('-inf')\n    for start, end in intervals:\n        if start >= last_end:\n            count += 1\n            last_end = end\n    return count` },
        { type: "diagram", kind: "grid", data: {
          cells: [[1,3],[2,4],[3,5],[4,7],[6,8]],
          highlight: [[0,0],[0,1],[2,0],[2,1],[4,0],[4,1]],
          colors: { "0,0":"#5FD79E","0,1":"#5FD79E","2,0":"#5FD79E","2,1":"#5FD79E","4,0":"#5FD79E","4,1":"#5FD79E" }
        }, caption: `Intervals sorted by END time (each row is [start,end]). Greedy keeps rows in green: [1,3] then [3,5] (start 3 >= last_end 3) then [6,8]. Rows [2,4] and [4,7] conflict with an already-chosen interval and are skipped. Result: 3 non-overlapping intervals.` },
        { type: "callout", text: `Why end time and not start time? The interval that finishes earliest leaves the most room for future intervals. Sorting by start would prioritise an interval that begins early but runs long, which blocks many future options.` },
        { type: "h3", text: "3.2 Non-overlapping intervals (remove the fewest)" },
        { type: "p", text: `Problem: given a set of intervals, find the minimum number to remove so the remaining intervals are non-overlapping.` },
        { type: "p", text: `Equivalent to "maximum non-overlapping intervals", subtracted from total. Same algorithm, different reported value:` },
        { type: "code", code: `def eraseOverlapIntervals(intervals):\n    intervals.sort(key=lambda x: x[1])\n    kept = 0\n    last_end = float('-inf')\n    for start, end in intervals:\n        if start >= last_end:\n            kept += 1\n            last_end = end\n    return len(intervals) - kept` },
        { type: "h3", text: "3.3 Minimum arrows to burst balloons" },
        { type: "p", text: `Problem: each balloon is an interval. An arrow at position p bursts any balloon whose interval contains p. Minimum arrows to burst all balloons.` },
        { type: "p", text: `Equivalent to "max non-overlapping intervals", where overlapping balloons can share one arrow. Sort by end time, greedily fire arrows at the end of the earliest-ending balloon:` },
        { type: "code", code: `def findMinArrowShots(points):\n    if not points: return 0\n    points.sort(key=lambda x: x[1])\n    arrows = 1\n    last_arrow = points[0][1]\n    for start, end in points[1:]:\n        if start > last_arrow:                      # strict: touching counts\n            arrows += 1\n            last_arrow = end\n    return arrows` },
        { type: "callout", text: `Note the strict >: if balloons touch at the boundary (one ends where another begins), one arrow can burst both. Tightness of inequalities like this matters and is a common bug source.` },
        { type: "h3", text: "3.4 Merge intervals" },
        { type: "p", text: `Problem: merge all overlapping intervals into the minimum set of non-overlapping intervals.` },
        { type: "p", text: `Sort by start time (the only one in this family that does), then sweep, extending the current interval if it overlaps with the next:` },
        { type: "code", code: `def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    result = []\n    for interval in intervals:\n        if result and interval[0] <= result[-1][1]:\n            result[-1][1] = max(result[-1][1], interval[1])\n        else:\n            result.append(interval)\n    return result` },
        { type: "callout", text: `Why start time here, not end time? Different problem shape. For max-non-overlapping you're choosing intervals to keep; for merge you're scanning in temporal order and concatenating overlapping ones. The natural order for scanning is by start time.` },
        { type: "h3", text: "3.5 Partition labels" },
        { type: "p", text: `Problem: given a string, partition it into as many parts as possible such that each letter appears in at most one part.` },
        { type: "p", text: `Phrased differently: each character has a last-occurrence index. A partition can only end at or after every contained character's last-occurrence. So: sweep left to right; the current partition must extend at least to the max last-occurrence of any character seen so far. When the sweep index reaches that max, close the partition.` },
        { type: "code", code: `def partitionLabels(s):\n    last = {c: i for i, c in enumerate(s)}\n    result = []\n    start = 0\n    end = 0\n    for i, c in enumerate(s):\n        end = max(end, last[c])\n        if i == end:\n            result.append(end - start + 1)\n            start = i + 1\n    return result` },
        { type: "callout", text: `This is greedy with a twist: the "locally best" choice is to close the partition as soon as possible. The proof is essentially constructive — any partition must extend at least this far, so closing exactly at this point is safe and maximises the count.` }
      ]
    },
    {
      heading: "4. Pattern B: jump games",
      blocks: [
        { type: "h3", text: "4.1 Jump game I (can you reach the end?)" },
        { type: "p", text: `Problem: given an array where each nums[i] is the maximum forward jump from index i, return whether you can reach the last index from index 0.` },
        { type: "p", text: `Greedy: track the farthest reachable index as you sweep left to right. If at any point your current index exceeds the farthest reachable, you're stuck. Otherwise, update the farthest and continue.` },
        { type: "code", code: `def canJump(nums):\n    farthest = 0\n    for i, n in enumerate(nums):\n        if i > farthest:\n            return False                # gap we can't cross\n        farthest = max(farthest, i + n)\n    return True` },
        { type: "diagram", kind: "array", data: {
          values: [2,3,1,1,4],
          pointers: [{ name: "i", index: 1, color: "#6FA8FF" }],
          highlight: [4],
          labels: { "0":"jump", "4":"reachable" }
        }, caption: `nums = max jump length at each index. Sweeping i: at i=0 farthest=0+2=2, at i=1 farthest=max(2,1+3)=4 — the last index (green) is now reachable, so canJump returns True. The blue pointer is the current i; green is the farthest-reachable frontier.` },
        { type: "callout", text: `Why this works: the farthest reachable is a monotonically non-decreasing frontier — every step expands it (or leaves it alone). If the frontier ever fails to advance past the current index, no other strategy could have done better either: we already have the maximum.` },
        { type: "h3", text: "4.2 Jump game II (minimum number of jumps)" },
        { type: "p", text: `Problem: same setup, but return the minimum number of jumps to reach the last index. Assume it's always reachable.` },
        { type: "p", text: `Greedy: think of jumps as levels. Within the current level's reach, find the farthest you can reach via one more jump. When you exit the current level, you've used one jump. Repeat until you can reach the end.` },
        { type: "code", code: `def jump(nums):\n    jumps = 0\n    current_end = 0       # end of the range reachable with \`jumps\` jumps\n    farthest = 0          # farthest reachable with one more jump\n    for i in range(len(nums) - 1):\n        farthest = max(farthest, i + nums[i])\n        if i == current_end:\n            jumps += 1\n            current_end = farthest\n    return jumps` },
        { type: "callout", text: `The two-frontier idea is what makes this efficient. We don't track every individual jump; we treat each jump as expanding a region of indices. When the current region is exhausted, we commit to one more jump and the new region is the union of "farthests" we computed.` }
      ]
    },
    {
      heading: "5. Pattern C: gas station and circular sweeps",
      blocks: [
        { type: "p", text: `Problem: N gas stations arranged in a circle. Each station i has gas[i] available and cost[i] required to drive to station i+1. Find the starting station from which you can complete the circuit, or return -1 if impossible.` },
        { type: "p", text: `Two observations. (1) If the total gas is less than the total cost, no solution exists. (2) If a starting station s fails at some later station t, then no station between s and t (inclusive) can be a valid start either — they all run out of gas at t or earlier.` },
        { type: "p", text: `These let us do one O(n) pass instead of trying every start:` },
        { type: "code", code: `def canCompleteCircuit(gas, cost):\n    if sum(gas) < sum(cost):\n        return -1\n    tank = 0\n    start = 0\n    for i in range(len(gas)):\n        tank += gas[i] - cost[i]\n        if tank < 0:\n            start = i + 1                     # everything before fails\n            tank = 0\n    return start` },
        { type: "diagram", kind: "array", data: {
          values: [-2,-2,-2,3,3],
          pointers: [{ name: "start", index: 3, color: "#5FD79E" }],
          highlight: [3],
          labels: { "0":"gas-cost", "3":"valid start" }
        }, caption: `Net gas (gas[i] - cost[i]) per station, total = 0 so a solution exists. Sweeping: tank goes negative across indices 0-2, so start jumps to i+1 each time, landing on index 3 (green). From station 3 the tank stays non-negative around the circle: 3, 6, then wrapping 4, 2, 0. Valid start = 3.` },
        { type: "callout", text: `Why is this correct? The first observation ensures a solution exists when sums match. The second observation tells us that whenever the tank dips below zero, we can safely jump past all candidates so far. Since at most one valid start exists (when the totals match), the last surviving candidate is it.` },
        { type: "h3", text: "5.1 The \"discard a whole prefix\" pattern" },
        { type: "p", text: `Gas station is an instance of a broader pattern: when a partial scan fails, discard the entire prefix that led to failure. This shows up in:` },
        { type: "ul", items: [
          `Container with most water (move the shorter pointer).`,
          `Maximum subarray (Kadane's: reset to 0 when the running sum goes negative).`,
          `Longest substring without repeating characters (advance left past the duplicate).`
        ]},
        { type: "p", text: `The signature is a two-pointer or single-pointer sweep where failure tells you something the brute force has to learn the hard way.` },
        { type: "h3", text: "5.2 Kadane's algorithm (maximum subarray)" },
        { type: "p", text: `Problem: find the contiguous subarray with the largest sum.` },
        { type: "p", text: `Greedy insight: at each index, the best subarray ending here is either just this element, or this element plus the best subarray ending at the previous index — whichever is larger. If the running sum goes negative, abandon it and restart.` },
        { type: "code", code: `def maxSubArray(nums):\n    best = current = nums[0]\n    for n in nums[1:]:\n        current = max(n, current + n)\n        best = max(best, current)\n    return best` },
        { type: "diagram", kind: "array", data: {
          values: [-2,1,-3,4,-1,2,1,-5,4],
          pointers: [{ name: "restart", index: 3, color: "#E0A23B" }],
          highlight: [3,4,5,6],
          labels: { "3":"restart here", "6":"best end" }
        }, caption: `Kadane on [-2,1,-3,4,-1,2,1,-5,4]. At index 3 the running sum is negative (1 + -3 = -2 < 4), so current resets to start fresh at 4 (amber). The best contiguous subarray is the green window [4,-1,2,1] summing to 6 — the maximum.` },
        { type: "callout", text: `Often called "DP in disguise" — and it is — but the greedy framing is equally valid. The choice "extend or restart" is locally optimal and globally correct.` }
      ]
    },
    {
      heading: "6. Pattern D: partition and grouping",
      blocks: [
        { type: "h3", text: "6.1 Assign cookies" },
        { type: "p", text: `Problem: children have greed levels; cookies have sizes. Each child needs a cookie of size >= their greed. Maximise the number of satisfied children, with each cookie usable once.` },
        { type: "p", text: `Greedy: sort both arrays. Walk through them with two pointers, giving each greedy child the smallest cookie that satisfies them:` },
        { type: "code", code: `def findContentChildren(g, s):\n    g.sort()\n    s.sort()\n    i = j = 0\n    while i < len(g) and j < len(s):\n        if s[j] >= g[i]:\n            i += 1                  # this child is satisfied\n        j += 1                      # this cookie is used (or too small)\n    return i` },
        { type: "callout", text: `Exchange argument: if an optimal solution gives some child C a cookie larger than necessary, you can swap in a smaller cookie that also satisfies C, freeing the larger cookie for a greedier child. So always pairing the smallest sufficient cookie is safe.` },
        { type: "h3", text: "6.2 Lemonade change" },
        { type: "p", text: `Problem: customers pay with $5, $10, or $20 bills. You start with no change. Can you give correct change to all customers in order?` },
        { type: "p", text: `Greedy: when giving change for a $20, prefer giving back one $10 + one $5 over three $5s. The $5s are more flexible (any future customer paying $10 needs one), so hoard them.` },
        { type: "code", code: `def lemonadeChange(bills):\n    fives = tens = 0\n    for bill in bills:\n        if bill == 5:\n            fives += 1\n        elif bill == 10:\n            if fives == 0: return False\n            fives -= 1\n            tens += 1\n        else: # bill == 20\n            if tens > 0 and fives > 0:\n                tens -= 1\n                fives -= 1\n            elif fives >= 3:\n                fives -= 3\n            else:\n                return False\n    return True` },
        { type: "callout", text: `Why prefer the ten-plus-five combination? A $10 bill is useless for anything but $20-payment change. A $5 has more uses. So spending $10s first preserves flexibility.` }
      ]
    },
    {
      heading: "7. Pattern E: priority-queue greedy",
      blocks: [
        { type: "p", text: `Some greedy problems make the locally optimal choice from a dynamically-updated set, not a sorted prefix. A heap is the right tool: it always knows the current best.` },
        { type: "p", text: `These are covered in detail in the heaps and priority queues guide; here we cover the greedy framing.` },
        { type: "h3", text: "7.1 Reorganize string" },
        { type: "p", text: `Problem: rearrange a string so that no two adjacent characters are the same. Return "" if impossible.` },
        { type: "p", text: `Greedy: always place the most-frequent remaining character that isn't the same as the last placed. Max-heap on counts:` },
        { type: "code", code: `import heapq\nfrom collections import Counter\n\ndef reorganizeString(s):\n    count = Counter(s)\n    if max(count.values()) > (len(s) + 1) // 2:\n        return ""\n    heap = [(-cnt, ch) for ch, cnt in count.items()]\n    heapq.heapify(heap)\n\n    result = []\n    prev_cnt, prev_ch = 0, ''\n    while heap:\n        cnt, ch = heapq.heappop(heap)     # most frequent (negative)\n        result.append(ch)\n        if prev_cnt < 0:\n            heapq.heappush(heap, (prev_cnt, prev_ch))\n        prev_cnt, prev_ch = cnt + 1, ch    # one less of this char\n    return ''.join(result)` },
        { type: "callout", text: `The trick is to delay reinserting the just-used character by one step — that ensures it doesn't get picked again immediately.` },
        { type: "h3", text: "7.2 Task scheduler" },
        { type: "p", text: `Problem: tasks with cooldown n between identical tasks. Minimum intervals to finish all.` },
        { type: "p", text: `Greedy: always run the most-frequent available task. Use a heap for the available pool; tasks in cooldown sit in a separate queue until their time is up.` },
        { type: "code", code: `from collections import Counter, deque\n\ndef leastInterval(tasks, n):\n    count = Counter(tasks)\n    heap = [-c for c in count.values()]\n    heapq.heapify(heap)\n\n    time = 0\n    cooldown = deque()      # entries: (available_time, remaining_count)\n    while heap or cooldown:\n        time += 1\n        if heap:\n            cnt = heapq.heappop(heap) + 1   # one less\n            if cnt < 0:\n                cooldown.append((time + n, cnt))\n        if cooldown and cooldown[0][0] == time:\n            _, cnt = cooldown.popleft()\n            heapq.heappush(heap, cnt)\n    return time` }
      ]
    },
    {
      heading: "8. When greedy fails",
      blocks: [
        { type: "p", text: `Some problems look greedy but aren't. Understanding the failure modes helps you avoid wrong answers.` },
        { type: "h3", text: "8.1 Classic counter-examples" },
        { type: "p", text: `Coin change (with arbitrary denominations). The trap: "minimum coins to make X" looks greedy — always take the largest coin that fits. This works for US coins (1, 5, 10, 25), and is taught in school that way. But with denominations like [1, 7, 10] and target 14, greedy picks 10 + 1 + 1 + 1 + 1 = 5 coins, while the optimal is 7 + 7 = 2 coins. Use DP.` },
        { type: "diagram", kind: "array", data: {
          values: [10,1,1,1,1],
          pointers: [{ name: "greedy", index: 0, color: "#E0A23B" }],
          highlight: [],
          labels: { "0":"largest first" }
        }, caption: `COUNTEREXAMPLE — greedy coin change fails. Denominations [1,7,10], target 14. Greedy grabs the largest coin first: 10 + 1 + 1 + 1 + 1 = 5 coins (shown). The optimum is 7 + 7 = 2 coins, which greedy never considers because 10 > 7. This is why arbitrary-denomination coin change needs DP, not greedy.` },
        { type: "p", text: `Knapsack (0/1). The trap: "maximise value within capacity" suggests "take the highest value-per-weight ratio first". This works for the fractional knapsack where items can be split. But for 0/1 knapsack — where each item is taken whole or not at all — the greedy fails. Use DP.` },
        { type: "p", text: `Longest increasing subsequence. The trap: "longest increasing subsequence" suggests "always take the next element bigger than the current". This fails for arrays like [3, 1, 2, 5] where greedy gives [3, 5] but the optimal is [1, 2, 5]. Use DP (or the O(n log n) patience sort, which is greedy-ish on a derived structure, not on the input).` },
        { type: "h3", text: "8.2 How to tell during an interview" },
        { type: "p", text: `Three quick checks before committing to greedy:` },
        { type: "ul", items: [
          `Can I sketch a counter-example? Try inputs designed to make the local choice be a globally bad one. If you can construct one, the greedy is wrong.`,
          `Can I sketch the exchange or dominance argument? If you can't justify why the local choice is safe, it probably isn't.`,
          `Does the problem have "choose a subset" or "choose at most K" structure? These often have anti-greedy properties — taking the best item now might foreclose better combinations later. DP handles this; greedy doesn't.`
        ]},
        { type: "callout", text: `When in doubt, switch to DP. Greedy is faster, but DP is correct. A correct slow solution beats a fast wrong one every time.` }
      ]
    },
    {
      heading: "9. Common bugs",
      blocks: [
        { type: "table", headers: ["Bug", "What goes wrong"], rows: [
          ["Sorting by the wrong key", "Interval problems often need sort-by-end, not sort-by-start. Merge intervals is the exception. Get this wrong and the greedy produces subtly incorrect results."],
          ["Strict vs non-strict inequality", "start > last_arrow vs start >= last_arrow — these differ on boundary-touching intervals. Read the problem carefully: do touching intervals count as overlapping?"],
          ["Applying greedy to a non-greedy problem", "0/1 knapsack, arbitrary-denomination coin change, LIS — these look greedy but aren't. Verify the greedy choice property holds before committing."],
          ["Forgetting the impossibility check", "For gas station, problems can be infeasible. Without the sum(gas) < sum(cost) check, you'd return a junk start index."],
          ["Off-by-one in two-pointer cookie-style problems", "When pairing children with cookies, decide whether the cookie pointer advances on a fit or on every iteration. Trace small inputs."],
          ["Stale information in priority-queue greedy", "When you reinsert items into a heap with updated counts, make sure older entries are filtered out or never pushed in the first place. See heaps guide for lazy deletion."],
          ["Counting jumps vs counting elements", "Jump game II asks for the minimum jumps, not the minimum elements touched. Confusing these gives an off-by-one."],
          ["Sweeping the wrong direction", "Some greedy sweeps work right-to-left, not left-to-right. Try both if the natural direction doesn't yield a clean predicate."]
        ]}
      ]
    },
    {
      heading: "10. Study plan",
      blocks: [
        { type: "p", text: `Drill these in order. The first group establishes the interval-greedy instinct; later groups stretch it to sweeps and heap-based greedy.` },
        { type: "table", headers: ["#", "Problem", "Pattern"], rows: [
          ["", "Interval greedy", ""],
          ["1", "Non-overlapping intervals", "Sort by end, greedy keep."],
          ["2", "Minimum arrows to burst balloons", "Sort by end, fire arrow at each."],
          ["3", "Merge intervals", "Sort by start, sweep and extend."],
          ["4", "Insert interval", "Single-pass merge with the new interval."],
          ["5", "Meeting rooms", "Sort and check adjacency."],
          ["6", "Partition labels", "Track max last-occurrence; close at the boundary."],
          ["", "Jump-game and sweep greedy", ""],
          ["7", "Jump game", "Track farthest reachable."],
          ["8", "Jump game II", "Two-frontier level sweep."],
          ["9", "Gas station", "Discard failing prefix; one O(n) pass."],
          ["10", "Maximum subarray (Kadane's)", "Reset on negative running sum."],
          ["11", "Best time to buy and sell stock", "Track min so far, max profit so far."],
          ["12", "Best time to buy and sell stock II", "Sum all positive daily diffs."],
          ["", "Partition and grouping greedy", ""],
          ["13", "Assign cookies", "Sort both, two-pointer."],
          ["14", "Lemonade change", "Prefer giving away inflexible denominations first."],
          ["15", "Boats to save people", "Sort, two-pointer pairing heaviest with lightest."],
          ["16", "Candy", "Two-pass sweep (left-to-right, then right-to-left)."],
          ["", "Priority-queue greedy", ""],
          ["17", "Reorganize string", "Max-heap with delayed reinsertion."],
          ["18", "Task scheduler", "Max-heap plus cooldown queue."],
          ["19", "Minimum cost to hire K workers", "Sort by ratio; heap of weights."],
          ["20", "IPO (capital and profits)", "Two heaps: affordable projects and not."],
          ["", "Constructive greedy", ""],
          ["21", "Largest number", "Custom comparator: sort by concatenated comparison."],
          ["22", "Remove K digits", "Monotonic stack — greedy keep-or-pop."],
          ["23", "Queue reconstruction by height", "Sort by height desc, height asc; insert by index."],
          ["24", "Wiggle subsequence", "Count direction changes."]
        ]}
      ]
    },
    {
      heading: "11. One-page cheat sheet",
      blocks: [
        { type: "h3", text: "Pattern recognition" },
        { type: "table", headers: ["When the problem says...", "Reach for..."], rows: [
          ["Maximum non-overlapping intervals", "Sort by end time; sweep, taking each compatible interval."],
          ["Merge / combine intervals", "Sort by start time; sweep, extending the current interval."],
          ["\"Burst balloons / minimum arrows\"", "Sort by end time; one arrow per non-overlapping group."],
          ["Reach the end / minimum jumps", "Track the farthest reachable; sweep left to right."],
          ["Circular array, sum / cost balance", "Discard-the-failing-prefix pattern (gas station)."],
          ["Maximum sum of contiguous subarray", "Kadane's: extend or reset based on running sum."],
          ["Match pairs / pair smallest-with-smallest", "Sort both arrays, two-pointer sweep."],
          ["Schedule / cooldown / always pick best", "Priority queue (max-heap), possibly with a delay/cooldown structure."],
          ["Construct largest / smallest result", "Sort with a custom comparator, or monotonic stack."]
        ]},
        { type: "h3", text: "The decision tree before committing" },
        { type: "ul", items: [
          `Can I describe a single locally-optimal choice at each step?`,
          `Can I argue the local choice is safe (exchange or dominance)?`,
          `Have I tried 2-3 small adversarial inputs?`,
          `If all yes: greedy. If any no: DP.`
        ]},
        { type: "h3", text: "Sort keys by problem type" },
        { type: "table", headers: ["Problem", "Sort by"], rows: [
          ["Max non-overlapping intervals, arrows", "End time."],
          ["Merge intervals", "Start time."],
          ["Pair up two arrays optimally", "Both arrays, then two-pointer."],
          ["Tasks with priority", "Priority (use heap)."],
          ["Construct largest concatenated number", "Custom comparator on string concatenation."]
        ]},
        { type: "h3", text: "The mental model" },
        { type: "callout", text: `Greedy is the technique with the best speed-to-code-length ratio when it applies — and the worst correctness risk when it doesn't. The patterns in this guide are the recurring shapes; recognising them in a new problem is half the work. The other half is the discipline to not apply greedy until you've checked it works. When the proof feels wobbly, switch to DP and ship a correct solution.` }
      ]
    }
  ],
  cheatsheet: [
    `Greedy needs two properties: greedy-choice property (a locally optimal choice is part of some global optimum) and optimal substructure.`,
    `Default to suspicion: if you can't argue why the local choice is globally safe, write DP. Wrong DP is slow; wrong greedy is wrong.`,
    `Prove with the exchange argument (transform any OPT into GREEDY without making it worse) or the dominance argument (greedy's partial solution dominates all others by induction).`,
    `In interviews you can't prove formally — stress-test on small adversarial inputs (ties, locally-best choices that consume resources needed later).`,
    `Interval scheduling: max non-overlapping → sort by END time, keep each interval with start >= last_end.`,
    `Minimum arrows to burst balloons: sort by end, fire at earliest end; use strict > so touching balloons share one arrow.`,
    `Merge intervals is the exception — sort by START time and extend overlapping intervals while sweeping.`,
    `Partition labels: track the max last-occurrence of seen chars; close the partition when the index reaches it.`,
    `Jump game I: sweep, track farthest reachable; fail if current index > farthest.`,
    `Jump game II: two-frontier level sweep — count a jump each time you exhaust the current reachable region.`,
    `Gas station: if sum(gas) < sum(cost) return -1; otherwise reset start to i+1 whenever the tank dips below zero (discard-the-failing-prefix).`,
    `Kadane's max subarray: current = max(n, current + n); reset when the running sum goes negative.`,
    `Assign cookies: sort both arrays, two-pointer, give each child the smallest sufficient cookie.`,
    `Lemonade change: spend inflexible denominations ($10) first to preserve flexible $5s.`,
    `Priority-queue greedy (reorganize string, task scheduler): pop the most-frequent item from a max-heap, delay reinserting the just-used item.`,
    `Greedy FAILS on: arbitrary-denomination coin change, 0/1 knapsack, longest increasing subsequence — use DP.`,
    `Common bugs: sorting by the wrong key, strict vs non-strict inequality, missing impossibility check, off-by-one in two-pointer, stale heap entries, counting jumps vs elements, wrong sweep direction.`,
    `Decision tree: single locally-optimal choice? safe by exchange/dominance? survives 2-3 adversarial inputs? All yes → greedy; any no → DP.`
  ]
}
