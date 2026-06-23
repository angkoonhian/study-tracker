export default {
  id: "dynamic-programming",
  title: "Dynamic Programming",
  subtitle: "A complete reference: from recursion to tabulation, every pattern that matters",
  emoji: "🧮",
  intro: `Dynamic programming is the single biggest topic in algorithmic interviews — and the one people fear most. The good news: DP is not about memorising tricks. It is a small set of patterns applied with a consistent method. Once you internalise the method, the patterns become recognisable and the solutions almost write themselves.\n\nThis guide covers what DP is, the recursion-to-tabulation pyramid, the five-step method that solves every DP problem, and the seven sub-patterns that account for nearly every DP question you will see: 1D linear DP, grid DP, sequence DP, knapsack, interval DP, state-machine DP, and tree DP. Each pattern is taught with worked examples, the build-up from recursion to tabulation, and notes on space optimisation. The final sections cover recognition signals, common bugs, a 30-problem study plan, and a cheat sheet.\n\nTable of contents: (1) What is dynamic programming, (2) The recursion-to-tabulation pyramid, (3) The five-step method, (4) Pattern A: 1D linear DP, (5) Pattern B: 2D grid DP, (6) Pattern C: sequence and string DP, (7) Pattern D: knapsack family, (8) Pattern E: interval DP, (9) Pattern F: state-machine DP, (10) Pattern G: DP on trees, (11) Memoisation vs tabulation, (12) Space optimisation, (13) Common bugs, (14) Recognising DP in the wild, (15) Study plan, (16) One-page cheat sheet.`,
  sections: [
    {
      heading: "1. What is dynamic programming",
      blocks: [
        { type: "p", text: `Dynamic programming is, at its heart, a single idea: solve a problem by solving smaller versions of itself, and remember the answers so you don't solve the same subproblem twice. That's it. "Dynamic programming" is an intimidating name for what is fundamentally recursion plus a cache.` },
        { type: "p", text: `Every DP problem has the same shape. You have a problem of size n. You notice that to solve the problem of size n, you'd really like to know the answer to the problem of size n - 1 (or some smaller version). If you had that, the rest would be easy. So you solve the smaller version recursively, and you cache its answer because the same smaller problem keeps coming up.` },
        { type: "h3", text: "1.1 The two requirements" },
        { type: "p", text: `A problem is amenable to DP if and only if it has two properties:` },
        { type: "ul", items: [
          `Optimal substructure. The optimal answer to the problem can be constructed from optimal answers to its subproblems. If "the best path from A to Z" doesn't decompose into "the best path from A to some intermediate X" plus "the best path from X to Z", you can't use DP.`,
          `Overlapping subproblems. A naive recursive solution would solve the same subproblem many times. If every subproblem is unique, DP buys you nothing — that's just recursion. The whole point of DP is to dodge redundant work by caching.`
        ]},
        { type: "p", text: `Trees of recursive calls without overlap (like merge sort) are divide-and-conquer, not DP. DP is what you reach for when the recursion tree has many duplicate nodes.` },
        { type: "h3", text: "1.2 The classic motivating example: Fibonacci" },
        { type: "p", text: `Fibonacci is the easiest demonstration of overlapping subproblems. The naive recursive definition is direct:` },
        { type: "code", code: `def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)` },
        { type: "p", text: `Correct, but ruinously slow. fib(40) takes noticeable time. Why? Look at the recursion tree:` },
        { type: "code", code: `                   fib(5)\n                 /         \\\n            fib(4)         fib(3)\n          /      \\        /     \\\n      fib(3)    fib(2) fib(2) fib(1)\n      /     \\\n  fib(2) fib(1)\n  ...` },
        { type: "p", text: `fib(3) is computed twice. fib(2) is computed three times. The waste grows exponentially. The runtime is O(φⁿ) — yes, that's the golden ratio in the exponent.` },
        { type: "p", text: `The DP fix is comically simple: just remember answers. Compute fib(3) once; the second time it's asked, return the cached value. The runtime drops from exponential to linear:` },
        { type: "code", code: `from functools import cache\n\n@cache\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\n# That's it. fib(100) is now instant.` },
        { type: "callout", text: `Every DP solution is fundamentally this transformation — recursion plus a cache — even when it's written as a bottom-up loop. The loop is just a way of filling in the cache in the right order so the recursion isn't needed.` }
      ]
    },
    {
      heading: "2. The recursion-to-tabulation pyramid",
      blocks: [
        { type: "p", text: `Every DP solution sits on one of four levels. Each level is the previous level plus an optimisation. Walking up the pyramid in order is the standard way to derive any DP solution.` },
        { type: "table", headers: ["Level", "Approach", "Time", "Space"], rows: [
          ["1", "Naive recursion", "Exponential (typically)", "O(depth) for the call stack"],
          ["2", "Top-down with memoisation", "O(number of subproblems · work per subproblem)", "O(number of subproblems) + recursion stack"],
          ["3", "Bottom-up tabulation", "Same as memoisation", "O(number of subproblems), no stack"],
          ["4", "Space-optimised tabulation", "Same as level 3", "Often O(1) or O(n) instead of O(n²)"]
        ]},
        { type: "h3", text: "2.1 Climbing stairs at all four levels" },
        { type: "p", text: `Problem: you can climb 1 or 2 stairs at a time. How many distinct ways are there to reach step n? Worked out at every level of the pyramid.` },
        { type: "p", text: `Level 1: naive recursion. To reach step n, your last move was either +1 (so you came from step n - 1) or +2 (from step n - 2). The total ways is the sum of those two counts.` },
        { type: "code", code: `def climb(n):\n    if n <= 2:\n        return n\n    return climb(n - 1) + climb(n - 2)` },
        { type: "p", text: `Same shape as Fibonacci — same exponential blow-up. Correct, but useless for n > 30.` },
        { type: "p", text: `Level 2: top-down memoisation. Identical code with a cache wrapped around it. Each n is computed at most once.` },
        { type: "code", code: `from functools import cache\n\n@cache\ndef climb(n):\n    if n <= 2:\n        return n\n    return climb(n - 1) + climb(n - 2)` },
        { type: "p", text: `Time and space both O(n). The @cache decorator from functools is the cleanest way to memoise in Python — no manual dictionary needed. Internally it's a hashmap keyed on the function arguments.` },
        { type: "p", text: `Level 3: bottom-up tabulation. Instead of recursing, build the answer iteratively. Start from the base cases and work outward.` },
        { type: "code", code: `def climb(n):\n    if n <= 2:\n        return n\n    dp = [0] * (n + 1)\n    dp[1], dp[2] = 1, 2\n    for i in range(3, n + 1):\n        dp[i] = dp[i - 1] + dp[i - 2]\n    return dp[n]` },
        { type: "diagram", kind: "array", data: {
          values: [1, 2, 3, 5, 8, 13],
          pointers: [
            { name: "i-2", index: 3, color: "#E0A23B" },
            { name: "i-1", index: 4, color: "#E0A23B" },
            { name: "i", index: 5, color: "#5FD79E" }
          ],
          highlight: [5],
          labels: { "0": "dp[1]", "5": "dp[6]" }
        }, caption: "Climbing stairs dp table (1-indexed by step). dp[6] = dp[5] + dp[4] = 8 + 5 = 13: the current cell (green) is the sum of its two predecessors (amber)." },
        { type: "p", text: `Same complexity as memoisation, no recursion stack, no decorator. dp[i] answers the subproblem "how many ways to reach step i?". The transition is exactly the recursion: dp[i] = dp[i - 1] + dp[i - 2].` },
        { type: "p", text: `Level 4: space-optimised. Notice that dp[i] only depends on the two previous entries. We don't need to keep the whole array — two variables suffice.` },
        { type: "code", code: `def climb(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2     # ways to reach step 1 and step 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b` },
        { type: "p", text: `Time O(n), space O(1). This is the same shape as the iterative Fibonacci. Whenever your DP transition only looks back a constant number of steps, you can compress the array down to that many variables.` },
        { type: "callout", text: `The standard workflow. Solve the problem at level 1 to confirm the recursion is right. Add @cache to get level 2. If the interviewer wants tabulation or you need to avoid stack issues, translate to level 3. If space matters and your transition is local, compress to level 4. Most interview problems want level 3 or 4.` }
      ]
    },
    {
      heading: "3. The five-step method",
      blocks: [
        { type: "p", text: `Every DP solution comes from answering five questions, in this order. Get fluent with this list and you can attack any DP problem, even one you've never seen.` },
        { type: "h3", text: "Step 1: define the state" },
        { type: "p", text: `What variables uniquely identify a subproblem? "State" means the inputs to your recursive function (or the indices into your DP table). Two subproblems with the same state values are the same subproblem.` },
        { type: "p", text: `For climbing stairs, the state is just n — how many stairs are left. For 0/1 knapsack, the state is two numbers: the index of the current item being considered, and the remaining capacity. For edit distance, it's two indices, one into each string.` },
        { type: "p", text: `Pick the smallest state that captures everything you need. If you find yourself passing extra parameters that don't actually matter, prune them. Conversely, if two subproblems with the same state values can have different answers, your state is incomplete.` },
        { type: "h3", text: "Step 2: define the meaning of dp[state]" },
        { type: "p", text: `Be precise. Write it down in one English sentence. Vague definitions kill DP solutions because the transition won't be writable.` },
        { type: "p", text: `Good: "dp[i] = the minimum cost to reach house i, robbing it." Bad: "dp[i] = something about house i."` },
        { type: "p", text: `Two common pitfalls. First, ambiguity about whether the answer includes the current element ("longest ending at i" vs "longest among the first i"). Second, ambiguity about whether the state represents "exactly K" or "at most K". These conflations are responsible for a huge fraction of subtle DP bugs.` },
        { type: "h3", text: "Step 3: find the transition (the recurrence)" },
        { type: "p", text: `How does dp[state] relate to smaller states? This is the heart of the algorithm.` },
        { type: "p", text: `The standard mental move: consider the last decision. At state state, what could the final action have been? Each possibility leads to a smaller subproblem. The transition is the best (or sum, or count) over those options.` },
        { type: "p", text: `For climbing stairs at step n, the last move was +1 or +2. So dp[n] = dp[n-1] + dp[n-2]. For house robber at house i, the choice was rob i or skip i. So dp[i] = max(dp[i-1], dp[i-2] + nums[i]). For coin change at amount A, the last coin used was some c. So dp[A] = 1 + min over c of dp[A - c].` },
        { type: "h3", text: "Step 4: identify base cases" },
        { type: "p", text: `What are the smallest subproblems whose answers you know directly, with no recursion? These are the bottom of the table or the recursion's termination conditions.` },
        { type: "p", text: `Common base cases: empty input (often dp[0] = 0 for sums and counts, or dp[0] = 1 for "number of ways to make zero"); the first element (dp[1] = nums[0]); boundaries of grids (the first row and first column).` },
        { type: "callout", text: `Off-by-one bugs hide here. Most botched DP solutions are off-by-one in the base case, not in the recurrence. Sanity-check by hand for n = 0 and n = 1 before trusting the rest.` },
        { type: "h3", text: "Step 5: determine the iteration order" },
        { type: "p", text: `For tabulation, you must fill the table in an order where every value you need has already been computed. "What does dp[i] depend on?" — those must be ready before you compute dp[i].` },
        { type: "p", text: `For 1D DP this is usually trivial: iterate left to right. For 2D DP it depends on the transition: if dp[i][j] depends on dp[i-1][...] and dp[...][j-1], you iterate top-to-bottom, left-to-right. For interval DP, you iterate by interval length (small intervals first), not by start index.` },
        { type: "p", text: `When this gets tangled, write the recurrence on paper and draw arrows from each cell to the ones it depends on. The order is whatever makes all arrows point to already-computed cells.` },
        { type: "h3", text: "Bringing it together: house robber, end to end" },
        { type: "p", text: `Problem: given an array of house values, what's the maximum money you can rob if you can't rob two adjacent houses?` },
        { type: "ul", items: [
          `State. Index i into the array.`,
          `Meaning. dp[i] = max money robbed considering houses 0..i.`,
          `Transition. At house i, you either skip it (take dp[i-1]) or rob it (take dp[i-2] + nums[i]). Take the max.`,
          `Base. dp[0] = nums[0]; dp[1] = max(nums[0], nums[1]).`,
          `Order. Left to right.`
        ]},
        { type: "code", code: `def rob(nums):\n    if not nums: return 0\n    if len(nums) == 1: return nums[0]\n    dp = [0] * len(nums)\n    dp[0] = nums[0]\n    dp[1] = max(nums[0], nums[1])\n    for i in range(2, len(nums)):\n        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])\n    return dp[-1]` },
        { type: "diagram", kind: "array", data: {
          values: [2, 7, 9, 3, 1],
          pointers: [
            { name: "i-2", index: 2, color: "#E0A23B" },
            { name: "i-1", index: 3, color: "#E0A23B" },
            { name: "i", index: 4, color: "#6FA8FF" }
          ],
          highlight: [4],
          labels: { "0": "nums" }
        }, caption: "House robber on nums = [2,7,9,3,1]. Computing dp[4]: rob (dp[2] + nums[4]) vs skip (dp[3]). dp = [2,7,11,11,12], so the answer is 12 (rob houses 0, 2, 4)." },
        { type: "p", text: `And space-optimised, since only the last two values matter:` },
        { type: "code", code: `def rob(nums):\n    prev, curr = 0, 0\n    for n in nums:\n        prev, curr = curr, max(curr, prev + n)\n    return curr` }
      ]
    },
    {
      heading: "4. Pattern A: 1D linear DP",
      blocks: [
        { type: "p", text: `1D DP is the entry point. State is a single index. You iterate left to right (usually), and each dp[i] depends on a small number of earlier entries. This is the easiest pattern to recognise: anything that asks "best (or count) over a sequence where the decision at each position depends on a few prior decisions".` },
        { type: "h3", text: "4.1 House robber II (circular)" },
        { type: "p", text: `Problem: same as house robber, but the houses are in a circle — house 0 and house n-1 are now adjacent.` },
        { type: "p", text: `Trick: the circular constraint is annoying, but observe: either you rob house 0 or you don't. If you do, you can't rob house n-1, so the subarray to consider is nums[0..n-2]. If you don't rob house 0, the subarray is nums[1..n-1]. Both are linear sub-problems — run the original house robber on each and return the max.` },
        { type: "code", code: `def rob_circular(nums):\n    if len(nums) == 1:\n        return nums[0]\n\n    def rob_linear(arr):\n        prev, curr = 0, 0\n        for n in arr:\n            prev, curr = curr, max(curr, prev + n)\n        return curr\n\n    return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))` },
        { type: "p", text: `This "split a circular problem into two linear ones" trick comes up fairly often. Same idea handles "circular array" variants of other linear DPs.` },
        { type: "h3", text: "4.2 Decode ways" },
        { type: "p", text: `Problem: a message encoded as digits, where A=1, B=2, ..., Z=26. Given the digit string, how many ways are there to decode it?` },
        { type: "p", text: `State: i = index in the string. Meaning: dp[i] = ways to decode s[0..i-1] (first i characters). Transition: the last decoding step used either one digit (s[i-1], valid if it's 1-9) or two digits (s[i-2..i-1], valid if it's 10-26).` },
        { type: "code", code: `def numDecodings(s):\n    if not s or s[0] == '0':\n        return 0\n    n = len(s)\n    dp = [0] * (n + 1)\n    dp[0] = dp[1] = 1\n    for i in range(2, n + 1):\n        one = int(s[i - 1])\n        two = int(s[i - 2:i])\n        if 1 <= one <= 9:\n            dp[i] += dp[i - 1]\n        if 10 <= two <= 26:\n            dp[i] += dp[i - 2]\n    return dp[n]` },
        { type: "diagram", kind: "array", data: {
          values: [1, 1, 2, 3],
          pointers: [
            { name: "two-digit", index: 1, color: "#E0A23B" },
            { name: "one-digit", index: 2, color: "#E0A23B" },
            { name: "i", index: 3, color: "#5FD79E" }
          ],
          highlight: [3],
          labels: { "0": "''", "1": "'1'", "2": "'12'", "3": "'126'" }
        }, caption: "Decode ways for '126'. dp[i] = ways to decode the first i chars. dp[3] = dp[2] (since '6' is 1-9) + dp[1] (since '26' is 10-26) = 2 + 1 = 3." },
        { type: "p", text: `Edge cases drive most of the bugs here. The string "06" has zero decodings (you can't start with 0 and the two-digit 06 isn't valid). Always trace n = 1 and n = 2 manually before submitting.` },
        { type: "h3", text: "4.3 Word break" },
        { type: "p", text: `Problem: given a string and a dictionary, can the string be segmented into a sequence of dictionary words?` },
        { type: "p", text: `State: i = index. Meaning: dp[i] = True if s[0..i-1] can be segmented. Transition: dp[i] is True iff there exists some j < i such that dp[j] is True and s[j..i-1] is in the dictionary.` },
        { type: "code", code: `def wordBreak(s, wordDict):\n    word_set = set(wordDict)\n    n = len(s)\n    dp = [False] * (n + 1)\n    dp[0] = True\n    for i in range(1, n + 1):\n        for j in range(i):\n            if dp[j] and s[j:i] in word_set:\n                dp[i] = True\n                break\n    return dp[n]` },
        { type: "callout", text: `The base case dp[0] = True is crucial. It encodes "the empty string is trivially segmentable." Without it, no later dp[i] can ever flip to True. This is a recurring pattern: the "empty prefix" base case being True or 0 or 1.` },
        { type: "h3", text: "4.4 The 1D pattern" },
        { type: "p", text: `1D DP is right when:` },
        { type: "ul", items: [
          `There is a linear input (array, string, sequence).`,
          `At each position, you make a decision (take or skip; jump 1 or 2 or k; include in current segment or start a new one).`,
          `The decision at position i depends on a small, constant number of earlier positions — often just i - 1 and i - 2, but sometimes arbitrarily many.`
        ]},
        { type: "p", text: `When the dependency is on a constant number of earlier indices, you can always compress to O(1) space. When it's on all earlier indices (like word break or LIS), you need the full O(n) array.` }
      ]
    },
    {
      heading: "5. Pattern B: 2D grid DP",
      blocks: [
        { type: "p", text: `Two indices instead of one. The transition typically comes from a small set of neighbouring cells. This pattern covers all the "how many paths", "minimum cost path", "largest square / rectangle" problems on a grid.` },
        { type: "h3", text: "5.1 Unique paths" },
        { type: "p", text: `Problem: from the top-left of an m × n grid, how many unique paths to the bottom-right? You can only move down or right.` },
        { type: "p", text: `State: (i, j) = current cell. Meaning: dp[i][j] = number of paths from (0, 0) to (i, j). Transition: the last move arrived from above or from the left, so dp[i][j] = dp[i-1][j] + dp[i][j-1].` },
        { type: "code", code: `def uniquePaths(m, n):\n    dp = [[1] * n for _ in range(m)]      # first row and col are all 1\n    for i in range(1, m):\n        for j in range(1, n):\n            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]\n    return dp[m - 1][n - 1]` },
        { type: "diagram", kind: "grid", data: {
          cells: [
            [1, 1, 1, 1],
            [1, 2, 3, 4],
            [1, 3, 6, 10]
          ],
          highlight: [[2, 2]],
          colors: {
            "2,2": "#5FD79E",
            "1,2": "#E0A23B",
            "2,1": "#E0A23B"
          }
        }, caption: "Unique paths on a 3x4 grid. Each cell = paths from the top-left. dp[2][2] = 6 (green) = dp[1][2] (above, 3) + dp[2][1] (left, 3), its two amber dependencies. The bottom-right answer is 10." },
        { type: "p", text: `The first row and column are all 1 because there's exactly one way to reach any cell along the top edge (keep moving right) or left edge (keep moving down). Initialising them to 1 saves us writing two separate boundary loops.` },
        { type: "p", text: `Space optimisation. dp[i][j] only depends on the row above and the cell to its left. We can collapse to a 1D array, updated in place.` },
        { type: "code", code: `def uniquePaths(m, n):\n    dp = [1] * n\n    for _ in range(1, m):\n        for j in range(1, n):\n            dp[j] += dp[j - 1]\n    return dp[-1]` },
        { type: "p", text: `dp[j] on the left of = is being updated to row i; dp[j] on the right is still the value from row i-1 (haven't overwritten it yet). dp[j-1] on the right has already been updated for row i. So we get exactly dp[i-1][j] + dp[i][j-1] with one array.` },
        { type: "callout", text: `This row-rolling trick is the standard space optimisation for grid DP. It works when the transition only reads from the current row (already updated cells) and the previous row (cells not yet updated). When it doesn't fit, you may need two rows instead of one.` },
        { type: "h3", text: "5.2 Minimum path sum" },
        { type: "p", text: `Problem: grid of non-negative numbers; find a path from top-left to bottom-right that minimises the sum of numbers along the path.` },
        { type: "code", code: `def minPathSum(grid):\n    m, n = len(grid), len(grid[0])\n    dp = [[0] * n for _ in range(m)]\n    dp[0][0] = grid[0][0]\n    for i in range(1, m):\n        dp[i][0] = dp[i - 1][0] + grid[i][0]\n    for j in range(1, n):\n        dp[0][j] = dp[0][j - 1] + grid[0][j]\n    for i in range(1, m):\n        for j in range(1, n):\n            dp[i][j] = grid[i][j] + min(dp[i - 1][j], dp[i][j - 1])\n    return dp[m - 1][n - 1]` },
        { type: "p", text: `Same shape as unique paths, just with min instead of addition. The first row and column have to be initialised explicitly because there's no choice along the edges — you sum your way in.` },
        { type: "h3", text: "5.3 Maximal square" },
        { type: "p", text: `Problem: in a binary matrix, find the largest square containing only 1s. Return its area.` },
        { type: "p", text: `State: (i, j). Meaning: dp[i][j] = side length of the largest all-1s square whose bottom-right corner is (i, j). (This subtle definition is the whole trick.) Transition: if the current cell is 0, then dp[i][j] = 0. Otherwise the largest square ending here is bounded by the smallest of its three neighbours' squares, plus one:` },
        { type: "code", code: `def maximalSquare(matrix):\n    m, n = len(matrix), len(matrix[0])\n    dp = [[0] * n for _ in range(m)]\n    best = 0\n    for i in range(m):\n        for j in range(n):\n            if matrix[i][j] == '1':\n                if i == 0 or j == 0:\n                    dp[i][j] = 1\n                else:\n                    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\n                best = max(best, dp[i][j])\n    return best * best` },
        { type: "diagram", kind: "grid", data: {
          cells: [
            [0, 1, 1, 1],
            [0, 1, 2, 2],
            [0, 1, 2, 3]
          ],
          highlight: [[2, 3]],
          colors: {
            "2,3": "#5FD79E",
            "1,3": "#E0A23B",
            "2,2": "#E0A23B",
            "1,2": "#E0A23B"
          }
        }, caption: "Maximal square dp (side length of largest all-1s square ending at each cell). dp[2][3] = 3 (green) = 1 + min(up=2, left=2, diagonal=2) (the three amber neighbours). Largest square has side 3, area 9." },
        { type: "p", text: `The intuition: for a 2×2 all-1s square ending at (i, j), the three diagonal/horizontal/vertical neighbours must each end at least a 1×1 square. To grow to k×k, all three must end (k-1)×(k-1) squares. Taking the min and adding 1 captures this exactly.` }
      ]
    },
    {
      heading: "6. Pattern C: sequence and string DP",
      blocks: [
        { type: "p", text: `Two sequences (or one sequence with two pointers). The state is two indices, one into each. This pattern owns longest common subsequence, edit distance, longest increasing subsequence, and the family of string-matching DPs.` },
        { type: "h3", text: "6.1 Longest common subsequence (LCS)" },
        { type: "p", text: `Problem: given two strings, find the length of their longest common subsequence. (Subsequence, not substring — characters need not be contiguous.)` },
        { type: "p", text: `State: (i, j) = considering the first i characters of A and first j characters of B. Meaning: dp[i][j] = LCS length for those prefixes. Transition: consider the last characters. If they match, they contribute 1 to LCS — recurse on the shorter prefixes. If not, drop one or the other and take the max.` },
        { type: "code", code: `def longestCommonSubsequence(A, B):\n    m, n = len(A), len(B)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if A[i - 1] == B[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    return dp[m][n]` },
        { type: "diagram", kind: "grid", data: {
          cells: [
            ["", "", "A", "C", "E"],
            ["", 0, 0, 0, 0],
            ["A", 0, 1, 1, 1],
            ["B", 0, 1, 1, 1],
            ["C", 0, 1, 2, 2],
            ["E", 0, 1, 2, 3]
          ],
          highlight: [[5, 4]],
          colors: {
            "5,4": "#5FD79E",
            "4,3": "#E0A23B"
          }
        }, caption: "LCS of A = 'ABCE' (rows) and B = 'ACE' (cols). Header row/col show the characters; the inner (m+1)x(n+1) grid holds dp values. At dp[5][4] the chars 'E'=='E' match, so it inherits the diagonal dp[4][3]=2 (amber) plus 1 = 3 (green). LCS = 'ACE', length 3." },
        { type: "callout", text: `Note the indexing. dp has dimensions (m+1) × (n+1). The extra row and column are for the empty-prefix base cases. dp[i][j] looks at A[i-1] and B[j-1] because the table is 1-indexed while the strings are 0-indexed. This off-by-one shift is universal for two-sequence DPs.` },
        { type: "h3", text: "6.2 Edit distance (Levenshtein)" },
        { type: "p", text: `Problem: minimum number of insertions, deletions, and substitutions to transform string A into string B.` },
        { type: "p", text: `State: (i, j) same as LCS. Meaning: dp[i][j] = min edits to turn A's first i characters into B's first j characters. Transition: three cases for the last operation — delete a character from A, insert a character into A (which is the same as deleting from B), or substitute. If the last characters already match, no operation is needed and we just inherit from dp[i-1][j-1].` },
        { type: "code", code: `def minDistance(A, B):\n    m, n = len(A), len(B)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    # Base cases: turning A's prefix into empty string requires i deletions,\n    # turning empty into B's prefix requires j insertions.\n    for i in range(m + 1): dp[i][0] = i\n    for j in range(n + 1): dp[0][j] = j\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if A[i - 1] == B[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1]\n            else:\n                dp[i][j] = 1 + min(\n                    dp[i - 1][j],                # delete from A\n                    dp[i][j - 1],                # insert into A\n                    dp[i - 1][j - 1],            # substitute\n                )\n    return dp[m][n]` },
        { type: "diagram", kind: "grid", data: {
          cells: [
            ["", "", "C", "A", "T"],
            ["", 0, 1, 2, 3],
            ["C", 1, 0, 1, 2],
            ["A", 2, 1, 0, 1],
            ["R", 3, 2, 1, 1]
          ],
          highlight: [[4, 4]],
          colors: {
            "4,4": "#5FD79E",
            "3,3": "#E0A23B",
            "3,4": "#E0A23B",
            "4,3": "#E0A23B"
          }
        }, caption: "Edit distance from 'CAR' (rows) to 'CAT' (cols). First row/col are the base cases (i deletions / j insertions). At dp[4][4] the chars 'R' vs 'T' differ, so it is 1 + min(diagonal=0 substitute, up=1 delete, left=1 insert) (amber) = 1 (green). Answer: 1 edit (R to T)." },
        { type: "p", text: `Edit distance is the canonical "three-way transition" DP. Every operation maps to one of the three neighbouring cells. Understanding this fully lets you tackle distinct subsequences, regex matching, and the rest of the two-string DP family.` },
        { type: "h3", text: "6.3 Longest increasing subsequence (LIS)" },
        { type: "p", text: `Problem: given an array, find the length of its longest strictly increasing subsequence.` },
        { type: "p", text: `LIS in O(n²). State: i. Meaning: dp[i] = length of the longest increasing subsequence ending at index i. The "ending at i" is critical — without it, the recurrence doesn't have local structure.` },
        { type: "code", code: `def lengthOfLIS(nums):\n    n = len(nums)\n    dp = [1] * n\n    for i in range(n):\n        for j in range(i):\n            if nums[j] < nums[i]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp)` },
        { type: "p", text: `The answer isn't dp[n-1] — it's the max over all dp[i], because the longest LIS may end anywhere. This is the cost of defining the state as "ending at i".` },
        { type: "p", text: `LIS in O(n log n) with binary search. Maintain a list tails where tails[k] is the smallest possible tail of an increasing subsequence of length k+1. For each new number, find the leftmost position in tails where it can go (via binary search), and overwrite that entry. The length of tails at the end is the LIS length.` },
        { type: "code", code: `from bisect import bisect_left\n\ndef lengthOfLIS(nums):\n    tails = []\n    for n in nums:\n        i = bisect_left(tails, n)\n        if i == len(tails):\n            tails.append(n)\n        else:\n            tails[i] = n\n    return len(tails)` },
        { type: "p", text: `tails is not itself the LIS — it's a stand-in that has the right length. Replacing instead of appending keeps the smallest possible tails at each length, maximising future room to grow. This is one of the more counter-intuitive DP transforms; worth working through a small example by hand.` }
      ]
    },
    {
      heading: "7. Pattern D: knapsack family",
      blocks: [
        { type: "p", text: `Knapsack-style DPs all share the same flavour: you have a set of items, each with a cost (or weight), and you're picking a subset to optimise some quantity subject to a constraint. The state is typically (index of current item, remaining capacity).` },
        { type: "h3", text: "7.1 0/1 knapsack" },
        { type: "p", text: `Problem: given items each with weight and value, and a knapsack with capacity W, pick a subset maximising total value such that total weight does not exceed W. Each item may be used at most once.` },
        { type: "p", text: `State: (i, w) = considering the first i items, with w capacity remaining. Meaning: dp[i][w] = max value achievable. Transition: for item i, either skip it (inherit dp[i-1][w]) or take it if it fits (dp[i-1][w - weight[i]] + value[i]). Take the max.` },
        { type: "code", code: `def knapsack(weights, values, W):\n    n = len(weights)\n    dp = [[0] * (W + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for w in range(W + 1):\n            dp[i][w] = dp[i - 1][w]                         # skip\n            if weights[i - 1] <= w:\n                dp[i][w] = max(dp[i][w],\n                               dp[i - 1][w - weights[i - 1]] + values[i - 1])\n    return dp[n][W]` },
        { type: "diagram", kind: "grid", data: {
          cells: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 3, 3, 3, 3],
            [0, 0, 3, 4, 4, 7],
            [0, 0, 3, 4, 5, 7]
          ],
          highlight: [[2, 5]],
          colors: {
            "2,5": "#5FD79E",
            "1,5": "#E0A23B",
            "1,2": "#E0A23B"
          }
        }, caption: "0/1 knapsack: rows = items considered (weights [2,3,4], values [3,4,5]), cols = capacity 0..5. dp[2][5] = 7 (green) = max(skip: dp[1][5]=3, take item 2: dp[1][5-3] + 4 = 3 + 4 = 7) — its two amber dependencies in row i-1. Max value at capacity 5 is 7." },
        { type: "p", text: `Space optimisation: the iteration-direction trick. Notice dp[i][w] only depends on row i-1. So we can collapse to a 1D array. But there's a subtlety: when iterating capacity w, we must go from right to left, not left to right. Otherwise, the entry we read for dp[w - weight[i-1]] would already have been updated for the current item, allowing us to use it twice.` },
        { type: "code", code: `def knapsack(weights, values, W):\n    dp = [0] * (W + 1)\n    for i in range(len(weights)):\n        for w in range(W, weights[i] - 1, -1):   # right to left!\n            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])\n    return dp[W]` },
        { type: "callout", text: `The direction is everything. Iterate left-to-right and you get unbounded knapsack (each item can be reused). Iterate right-to-left and you get 0/1 knapsack (each item used at most once). The two algorithms differ by exactly one character.` },
        { type: "h3", text: "7.2 Partition equal subset sum" },
        { type: "p", text: `Problem: can the array be split into two subsets with equal sums?` },
        { type: "p", text: `Reformulation: the total sum must be even, and we need to find a subset summing to total / 2. That's subset sum, a knapsack variant where the constraint is "reach this target exactly".` },
        { type: "code", code: `def canPartition(nums):\n    total = sum(nums)\n    if total % 2 == 1:\n        return False\n    target = total // 2\n    dp = [False] * (target + 1)\n    dp[0] = True                          # empty subset sums to 0\n    for num in nums:\n        for s in range(target, num - 1, -1):   # right to left, 0/1\n            dp[s] = dp[s] or dp[s - num]\n    return dp[target]` },
        { type: "p", text: `Same skeleton as 0/1 knapsack: right-to-left iteration over the capacity, OR-combining a take and a skip option. The transition is dp[s] = dp[s] or dp[s - num]: this target is reachable if it was already reachable without this number, or if (s - num) was reachable so we can add num.` },
        { type: "h3", text: "7.3 Coin change (min coins)" },
        { type: "p", text: `Problem: given coin denominations and a target amount, what's the minimum number of coins to make that amount? Each coin can be used unlimited times.` },
        { type: "p", text: `Unbounded knapsack — the same item can be picked many times. State: a = amount. Meaning: dp[a] = min coins to make amount a. Transition: for each coin c, dp[a] = min(dp[a], dp[a - c] + 1). Iterate left to right on amount (unbounded).` },
        { type: "code", code: `def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1` },
        { type: "diagram", kind: "array", data: {
          values: [0, 1, 1, 2, 2, 1, 2],
          pointers: [
            { name: "a-5", index: 1, color: "#E0A23B" },
            { name: "a-2", index: 4, color: "#E0A23B" },
            { name: "a", index: 6, color: "#5FD79E" }
          ],
          highlight: [6],
          labels: { "0": "amount 0", "6": "amount 6" }
        }, caption: "Coin change with coins [1,2,5], dp[a] = min coins for amount a. dp[6] = 2 (green): min over coins of dp[a-c]+1 — dp[6-5]+1 = dp[1]+1 = 2 and dp[6-2]+1 = dp[4]+1 = 3, so 2 wins (5 + 1). Amber cells are the candidate predecessors." },
        { type: "p", text: `Initialising dp to infinity is important: it lets min propagate "impossible" correctly. If a + c can't be made, neither can a. Only dp[0] = 0 is a known base.` },
        { type: "h3", text: "7.4 Coin change II (number of ways)" },
        { type: "p", text: `Problem: same coins, but instead of min coins, count the number of distinct combinations to make the amount.` },
        { type: "p", text: `This is where the loop order trap lives. If you iterate amount in the outer loop and coins inner, you count permutations, not combinations. To count combinations, iterate coins outer, amount inner:` },
        { type: "code", code: `def change(amount, coins):\n    dp = [0] * (amount + 1)\n    dp[0] = 1\n    for c in coins:                  # coins outer\n        for a in range(c, amount + 1): # amount inner\n            dp[a] += dp[a - c]\n    return dp[amount]` },
        { type: "callout", text: `The mental model. Iterating coins outer means we decide "how many of this coin to use" before moving to the next coin — so the order in which coins are used is fixed (by the outer iteration order), which means we never count [2, 1] and [1, 2] separately. Iterating coins inner would allow any ordering and would count both. For "number of ways" problems, always think about whether order matters; the loop order encodes the answer.` }
      ]
    },
    {
      heading: "8. Pattern E: interval DP",
      blocks: [
        { type: "p", text: `Interval DP solves problems on a range [l, r] by combining solutions on sub-ranges. The signature shape: a 2D table dp[l][r], filled in order of increasing interval length — not by row or column.` },
        { type: "p", text: `Recognising it: the problem talks about a sequence and asks about choosing a "split point" (or last operation) inside a range. The transition is dp[l][r] = best over k in (l, r) of f(dp[l][k], dp[k][r]) for some combining function.` },
        { type: "h3", text: "8.1 Burst balloons" },
        { type: "p", text: `Problem: n balloons with values; bursting balloon i earns left * nums[i] * right where left and right are the values of its immediate neighbours at the time of bursting. Maximise total coins.` },
        { type: "p", text: `The reframing trick. Instead of asking "which balloon to burst first", ask "which balloon to burst last in a range". The last balloon burst in range (l, r) has the original boundary values as its neighbours, because everything in the middle is gone. That makes the subproblems clean.` },
        { type: "p", text: `State: (l, r), an open interval — balloons strictly between indices l and r. Meaning: dp[l][r] = max coins from bursting all balloons strictly between l and r. Transition: pick which balloon k is burst last in (l, r); k's neighbours when burst are nums[l] and nums[r]:` },
        { type: "code", code: `def maxCoins(nums):\n    nums = [1] + nums + [1]                 # virtual boundary balloons\n    n = len(nums)\n    dp = [[0] * n for _ in range(n)]\n    # length = r - l, the size of the open interval\n    for length in range(2, n):              # length 2 means at least 1 balloon inside\n        for l in range(n - length):\n            r = l + length\n            for k in range(l + 1, r):       # k = last burst inside (l, r)\n                dp[l][r] = max(\n                    dp[l][r],\n                    nums[l] * nums[k] * nums[r] + dp[l][k] + dp[k][r],\n                )\n    return dp[0][n - 1]` },
        { type: "callout", text: `Critical: the outer loop iterates by interval length. The two sub-intervals dp[l][k] and dp[k][r] are shorter than (l, r), and we need them already computed. Iterating by length top-down (length 2, then 3, then 4...) guarantees that.` },
        { type: "h3", text: "8.2 The interval DP pattern" },
        { type: "p", text: `Generic skeleton you can adapt:` },
        { type: "code", code: `n = len(arr)\ndp = [[0] * n for _ in range(n)]\n\n# Initialise base cases for intervals of size 1 (or 0)\n# ...\n\nfor length in range(2, n + 1):              # interval length\n    for l in range(n - length + 1):\n        r = l + length - 1                  # closed interval [l, r]\n        for k in range(l, r):               # split point\n            dp[l][r] = best(dp[l][r], combine(dp[l][k], dp[k+1][r], ...))` },
        { type: "p", text: `Other classic interval DPs include matrix chain multiplication, optimal binary search tree, palindrome partitioning II, and stone game. The details vary but the skeleton above does not.` }
      ]
    },
    {
      heading: "9. Pattern F: state-machine DP",
      blocks: [
        { type: "p", text: `Sometimes the state isn't just an index — it's a mode the algorithm is in. At each step you can transition between modes according to some rules. The DP table picks up an extra dimension for the current mode.` },
        { type: "p", text: `The canonical examples are the "best time to buy and sell stock" family of problems. You're stepping through prices, and at each price you're in one of a few states (holding a share, not holding, in cooldown). The transition table between states encodes the problem rules.` },
        { type: "h3", text: "9.1 Stock: single transaction (warm-up)" },
        { type: "p", text: `Problem: given a price array, find the max profit from one buy and one later sell. Doesn't even need a state machine — just track the min so far:` },
        { type: "code", code: `def maxProfit(prices):\n    min_price = float('inf')\n    best = 0\n    for p in prices:\n        min_price = min(min_price, p)\n        best = max(best, p - min_price)\n    return best` },
        { type: "h3", text: "9.2 Stock: unlimited transactions" },
        { type: "p", text: `Problem: same array; you can buy and sell any number of times, but only one share at a time. Greedy trick: sum every positive price difference between consecutive days.` },
        { type: "code", code: `def maxProfit(prices):\n    profit = 0\n    for i in range(1, len(prices)):\n        if prices[i] > prices[i - 1]:\n            profit += prices[i] - prices[i - 1]\n    return profit` },
        { type: "h3", text: "9.3 Stock with cooldown (the real state machine)" },
        { type: "p", text: `Problem: unlimited transactions, but after selling you must rest one day before buying again. Now we genuinely need a state machine. Three states at any day:` },
        { type: "ul", items: [
          `hold: currently holding a share. (Bought at some point, haven't sold yet.)`,
          `sold: just sold today. (Tomorrow must be rest.)`,
          `rest: not holding, not in cooldown. (Can buy tomorrow.)`
        ]},
        { type: "p", text: `Transitions per day with price p:` },
        { type: "ul", items: [
          `new_hold = max(hold, rest - p) (keep holding, or buy from rest)`,
          `new_sold = hold + p (sell today)`,
          `new_rest = max(rest, sold) (stay rested, or transition from sold)`
        ]},
        { type: "code", code: `def maxProfit(prices):\n    if not prices: return 0\n    hold, sold, rest = -prices[0], 0, 0\n    for p in prices[1:]:\n        new_hold = max(hold, rest - p)\n        new_sold = hold + p\n        new_rest = max(rest, sold)\n        hold, sold, rest = new_hold, new_sold, new_rest\n    return max(sold, rest)` },
        { type: "p", text: `The answer is max(sold, rest), not max of all three. If we end while still holding a share, we never sold it, so that profit isn't realised. Either we just sold (state sold), or we're not holding (state rest).` },
        { type: "p", text: `The state-machine pattern generalises: stock with fee adds the fee to the sell transition; at most K transactions adds a third dimension for the number of completed transactions; "longest happy subarray" and similar problems all use the same idea — model the problem as a small graph of states with a transition relation, then DP over days × states.` }
      ]
    },
    {
      heading: "10. Pattern G: DP on trees",
      blocks: [
        { type: "p", text: `Trees support DP very naturally. The recursion you'd write for a tree problem is the DP — each subtree's answer composes from its children's answers, and there are no overlapping subproblems (each subtree appears exactly once). So tree DP is technically not the "overlapping" kind, but the technique of "return one value per subtree" is identical in spirit.` },
        { type: "h3", text: "10.1 House robber III (binary tree)" },
        { type: "p", text: `Problem: houses are arranged as a binary tree. You can't rob a parent and a child both. Max money?` },
        { type: "p", text: `State per node: two values — max money if we rob this node, max money if we don't. (One value is not enough — the parent's decision depends on both possibilities.) Return them as a tuple.` },
        { type: "code", code: `def rob(root):\n    def helper(node):\n        if not node:\n            return (0, 0)         # (rob_this, skip_this)\n        l_rob, l_skip = helper(node.left)\n        r_rob, r_skip = helper(node.right)\n        # If we rob this node, children must be skipped\n        rob_this = node.val + l_skip + r_skip\n        # If we skip this node, children can choose either\n        skip_this = max(l_rob, l_skip) + max(r_rob, r_skip)\n        return (rob_this, skip_this)\n    return max(helper(root))` },
        { type: "p", text: `This "return a tuple of (do, don't) per subtree" pattern is the standard shape of tree DP. Whenever a node-level decision affects its parent's options, you need to surface both possibilities upward.` },
        { type: "h3", text: "10.2 Binary tree maximum path sum" },
        { type: "p", text: `Problem: a path is any sequence of nodes connected via parent-child edges (it can dip down through a node, not necessarily root-to-leaf). Max path sum?` },
        { type: "p", text: `Same idea as the trees-guide "return one thing, track another" trick. Each call returns the maximum gain extending upward (a path going from node to an ancestor); meanwhile it updates a closure variable tracking the best path that passes through the current node (which is left_gain + node + right_gain).` },
        { type: "code", code: `def maxPathSum(root):\n    best = [float('-inf')]\n    def gain(node):\n        if not node: return 0\n        left = max(0, gain(node.left))      # ignore negative branches\n        right = max(0, gain(node.right))\n        best[0] = max(best[0], left + node.val + right)\n        return node.val + max(left, right)\n    gain(root)\n    return best[0]` },
        { type: "p", text: `The max(0, ...) trick prunes negative subtrees: if extending into a subtree would hurt the sum, just don't.` }
      ]
    },
    {
      heading: "11. Memoisation vs tabulation: when to use which",
      blocks: [
        { type: "p", text: `Both reach the same final algorithm. The difference is when one is easier to write and reason about than the other.` },
        { type: "table", headers: ["Use memoisation (top-down) when...", "Use tabulation (bottom-up) when..."], rows: [
          ["The recursion is intuitive but the iteration order is non-obvious.", "The iteration order is obvious (left to right, or by length)."],
          ["The state space is sparse — many subproblems are never needed.", "All subproblems are needed."],
          ["The state involves complex keys (tuples, strings) that don't index naturally into an array.", "Indices are integers in a known range."],
          ["You're prototyping and want to ship correct code fast — just write the recursion and add @cache.", "You need to space-optimise (rolling arrays) or avoid recursion limits."],
          ["The problem feels naturally recursive (tree DP, game DP, search DP).", "The problem feels naturally iterative (array sweeps, grids)."]
        ]},
        { type: "callout", text: `In practice. Start with naive recursion to validate your transition. Add @cache to get a working solution. Translate to tabulation only if you need space optimisation, want to avoid recursion depth issues, or the interviewer asks for iterative. This workflow takes the guesswork out of which to write.` }
      ]
    },
    {
      heading: "12. Space optimisation",
      blocks: [
        { type: "p", text: `Many DP solutions allocate an O(n) or O(n · m) table even though the transition only reads from the last row, or the last constant number of cells. In those cases you can compress the storage.` },
        { type: "h3", text: "12.1 Constant-window dependency" },
        { type: "p", text: `When dp[i] only reads dp[i-1] and dp[i-2], you don't need an array at all. Two variables.` },
        { type: "code", code: `# Was:\ndp = [0] * n\nfor i in range(2, n):\n    dp[i] = f(dp[i-1], dp[i-2])\n# Becomes:\nprev2, prev1 = ..., ...\nfor _ in range(2, n):\n    prev2, prev1 = prev1, f(prev1, prev2)` },
        { type: "h3", text: "12.2 Row-rolling for grids" },
        { type: "p", text: `When dp[i][j] only reads from row i-1 (and possibly from already-updated cells in row i), you can use a single 1D array, updating it in place. The order of iteration matters — when updating a cell, the array entries you're reading must still contain their previous-row values, not yet updated.` },
        { type: "p", text: `For knapsack-style: iterate the inner index right to left to read previous-row values, or left to right to read current-row values (intended for unbounded knapsack).` },
        { type: "h3", text: "12.3 When you can't compress" },
        { type: "p", text: `Don't space-optimise just because you can. Some cases require the full table:` },
        { type: "ul", items: [
          `You need to reconstruct the optimal path or choice, not just its value — the full table preserves the structure you need to walk back through.`,
          `The transition reads from non-adjacent rows (e.g., dp[i-3][j]), so you'd need more than one or two rolling rows.`,
          `The transition depends on column j-2 of the current row as well, breaking naive in-place updates.`
        ]},
        { type: "callout", text: `When in doubt, write the unoptimised version first. Compression is an optimisation; correctness comes first.` }
      ]
    },
    {
      heading: "13. Common bugs",
      blocks: [
        { type: "table", headers: ["Bug", "What goes wrong"], rows: [
          ["Imprecise state definition", `"dp[i] = something about the first i elements" — if you can't write the transition as a one-liner referencing this definition exactly, the definition is too vague. Tighten it before writing code.`],
          ["Off-by-one in base cases", "Most DP bugs are not in the recurrence — they're in the base. Sanity-check by hand for n = 0, 1, 2."],
          ["Wrong iteration order", "The cells you read from must have been computed. For interval DP, iterate by interval length, not by start index."],
          [`Confusing "exactly K" with "at most K"`, `These need different states (and often different base cases). "Exactly" tracks the count precisely; "at most" rolls a dimension forward.`],
          ["Coin-change loop order", "Coins-outer counts combinations; amount-outer counts permutations. Pick the right one for what the problem asks."],
          ["Knapsack direction", "Right-to-left = 0/1 (each item once). Left-to-right = unbounded (each item unlimited). Swapping changes the algorithm."],
          ["Reading the answer from the wrong cell", `For LIS, the answer is max(dp), not dp[n-1]. For "ending at i" definitions, always max over all i.`],
          ["Forgetting to handle empty input", "An empty array or string is a base case in disguise. Guard at the top."],
          ["Mutating state during memoisation", "If your recursive function takes a list or dict and mutates it, @cache won't hash mutable arguments. Pass immutable forms (tuples, frozensets) or use indices into a shared structure."],
          ["Recursion depth on large inputs", "Top-down memoisation can hit Python's recursion limit. Either raise the limit, or translate to tabulation."],
          ["Integer overflow in counting problems", `Some "number of ways" problems require the answer modulo a prime. Don't forget the modulus inside the recurrence.`]
        ]}
      ]
    },
    {
      heading: "14. Recognising DP in the wild",
      blocks: [
        { type: "p", text: `DP problems don't announce themselves. Here are the linguistic and structural signals that should make you reach for the DP template.` },
        { type: "h3", text: "14.1 Question phrasings that mean DP" },
        { type: "ul", items: [
          `"Maximum / minimum ..." over a sequence of decisions.`,
          `"Number of ways to ..." — counting problems are nearly always DP.`,
          `"Is it possible to ..." with combinatorial structure (partition, subset sum).`,
          `"Longest / shortest ..." subsequence or substring with a property.`,
          `"Optimal strategy for a game" — game DP is a flavour of state-machine DP.`,
          `Anything with "... in at most k moves" or "... within k transactions".`
        ]},
        { type: "h3", text: "14.2 Structural signals" },
        { type: "ul", items: [
          `You can describe an optimal solution as making a last decision and delegating the rest to a smaller subproblem.`,
          `The naive recursive solution would have an exponential blow-up of duplicate subproblems.`,
          `The problem has a clear notion of "prefix", "interval", or "index" that defines what a subproblem is.`
        ]},
        { type: "h3", text: "14.3 Anti-signals: when it isn't DP" },
        { type: "ul", items: [
          `There's a greedy choice that's provably correct (interval scheduling, fractional knapsack).`,
          `The problem can be reduced to a shortest path or graph traversal.`,
          `Naive recursion has no overlapping subproblems (then it's divide-and-conquer, not DP).`,
          `The output structure is too complex to fit in a polynomial-size table (NP-hard problems may still admit DP, but the state space might be exponential — e.g., bitmask DP).`
        ]}
      ]
    },
    {
      heading: "15. Study plan",
      blocks: [
        { type: "p", text: `Drill in this order. Each problem cements one pattern. Once you can solve all 30 without looking, you have full DP coverage for interviews.` },
        { type: "table", headers: ["#", "Problem", "Pattern reinforced"], rows: [
          ["—", "1D linear DP", ""],
          ["1", "Climbing stairs", "The canonical introduction — see all 4 levels."],
          ["2", "Min cost climbing stairs", "1D with cost per step."],
          ["3", "House robber", "Take-or-skip decisions."],
          ["4", "House robber II", "Circular reduction to two linear problems."],
          ["5", "Decode ways", "1D with two transition options and edge cases."],
          ["6", "Word break", "Variable lookback length, dictionary lookup."],
          ["7", "Maximum subarray (Kadane's)", "Running max ending at i."],
          ["—", "Grid DP", ""],
          ["8", "Unique paths", "Canonical grid DP with row-rolling space optimisation."],
          ["9", "Unique paths II", "Same, with obstacles forcing some cells to 0."],
          ["10", "Min path sum", "Same skeleton, min instead of sum."],
          ["11", "Maximal square", `Subtle state ("ending at"), three-way min.`],
          ["12", "Dungeon game", "Reverse iteration: fill from the bottom-right back."],
          ["—", "Sequence and string DP", ""],
          ["13", "Longest common subsequence", "Two-string DP skeleton."],
          ["14", "Edit distance", "Three-way transition (insert / delete / substitute)."],
          ["15", "Distinct subsequences", "Counting variant of LCS."],
          ["16", "Longest palindromic subsequence", "Interval-style on one string."],
          ["17", "Longest increasing subsequence", `"Ending at i" plus O(n log n) variant.`],
          ["18", "Regular expression matching", "String DP with operator handling."],
          ["—", "Knapsack family", ""],
          ["19", "Partition equal subset sum", "Subset sum, 0/1 knapsack reformulation."],
          ["20", "Target sum", "Reduction to subset sum."],
          ["21", "Coin change", "Unbounded knapsack: min coins."],
          ["22", "Coin change II", "Unbounded knapsack: number of ways. Loop order matters."],
          ["23", "Ones and zeroes", "2D knapsack constraint (two capacities)."],
          ["—", "Interval DP", ""],
          ["24", "Palindrome partitioning II", "Min cuts with palindrome precomputation."],
          ["25", "Burst balloons", "Last-action reframing, length-major iteration."],
          ["26", "Stone game", "Game DP on intervals."],
          ["—", "State-machine DP", ""],
          ["27", "Best time to buy and sell stock III / IV", "K transactions as third dimension."],
          ["28", "Best time to buy and sell stock with cooldown", "Three-state machine."],
          ["—", "Tree DP", ""],
          ["29", "House robber III", "Tuple-returning tree DP."],
          ["30", "Binary tree maximum path sum", "Return-one-thing-track-another."]
        ]}
      ]
    },
    {
      heading: "16. One-page cheat sheet",
      blocks: [
        { type: "h3", text: "16.1 The five-step method" },
        { type: "ul", items: [
          `State. What variables uniquely identify a subproblem?`,
          `Meaning. One precise sentence: what does dp[state] stand for?`,
          `Transition. Consider the last decision. How does this subproblem decompose?`,
          `Base. Which subproblems are trivially known?`,
          `Order. In what order can the table be filled so dependencies are ready?`
        ]},
        { type: "h3", text: "16.2 Pattern recognition" },
        { type: "table", headers: ["Signal", "Pattern"], rows: [
          ["Decisions along a 1D sequence", "1D linear DP (climbing stairs, house robber, decode ways, word break)."],
          ["Movement on a grid", "2D grid DP (unique paths, min path sum, maximal square). Iterate top-to-bottom, left-to-right."],
          ["Two sequences compared", "Sequence DP (LCS, edit distance, distinct subsequences). State is (i, j) into the two sequences."],
          [`Single sequence, "ending at i" questions`, "LIS-style. max(dp), not dp[-1], is the answer."],
          ["Choose subset under capacity", "0/1 knapsack. Iterate items outer, capacity inner right-to-left."],
          ["Each item usable many times", "Unbounded knapsack (coin change). Iterate capacity inner left-to-right."],
          ["Counting combinations", "Iterate items outer, target inner. Initialise dp[0] = 1."],
          ["Problem on a range; combine via split point", "Interval DP. Iterate by length, not by index."],
          ["Multiple modes per step", "State-machine DP (stock family). Add a state dimension; write the transition table."],
          ["Recursive structure on a tree", "Tree DP. Often return a tuple per subtree."]
        ]},
        { type: "h3", text: "16.3 Key tactical reminders" },
        { type: "ul", items: [
          `Start with recursion. Add @cache. Translate to tabulation only if needed.`,
          `For knapsack, the iteration direction encodes the variant. Right-to-left for 0/1; left-to-right for unbounded.`,
          `For "number of ways", loop order matters: items-outer means combinations, items-inner means permutations.`,
          `For interval DP, iterate by interval length.`,
          `Define dp with one precise sentence before writing any code.`,
          `Test by hand for n = 0, 1, 2 before trusting the code.`
        ]},
        { type: "callout", text: `The mindset shift. DP feels hard because it's taught as a bag of clever tricks. It's not. DP is recursion with a cache. Every DP solution comes from clearly answering five questions about a recursive structure. The patterns in this guide are not mysterious algorithms to memorise; they are five questions answered slightly differently in seven recurring contexts. Master the five-step method on simple problems and the harder ones stop being intimidating — they're just the same questions, asked on bigger state spaces.` }
      ]
    }
  ],
  cheatsheet: [
    `Five-step method — State: what variables uniquely identify a subproblem? Meaning: one precise sentence for dp[state]. Transition: consider the last decision. Base: trivially-known subproblems. Order: fill so dependencies are ready first.`,
    `DP is recursion plus a cache. Two requirements: optimal substructure + overlapping subproblems. No overlap = divide-and-conquer, not DP.`,
    `Pyramid of four levels: naive recursion → top-down @cache memoisation → bottom-up tabulation → space-optimised tabulation. Most interview answers want level 3 or 4.`,
    `Workflow: start with naive recursion to validate the transition, add @cache, translate to tabulation only if you need space optimisation, want to avoid recursion limits, or the interviewer asks for iterative.`,
    `1D linear DP (climbing stairs, house robber, decode ways, word break): single index, iterate left-to-right; compress to O(1) when dependency is on a constant number of earlier indices.`,
    `House robber transition: dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Circular variant = run linear robber on nums[:-1] and nums[1:], take the max.`,
    `Word break / "empty prefix" base case: dp[0] = True (or 0 or 1). Without it nothing flips.`,
    `2D grid DP (unique paths, min path sum, maximal square): iterate top-to-bottom, left-to-right. Row-rolling collapses to a single 1D array.`,
    `Maximal square: dp[i][j] = side of largest all-1s square ending at (i,j) = 1 + min(up, left, diagonal) if cell is 1.`,
    `Sequence/string DP (LCS, edit distance, distinct subsequences): state (i, j) into two strings; table is (m+1)×(n+1) with dp[i][j] reading A[i-1], B[j-1]. Edit distance = three-way transition (delete / insert / substitute).`,
    `LIS: dp[i] = longest increasing subsequence ending at i; answer is max(dp), not dp[-1]. O(n log n) via tails + bisect_left, replacing not appending.`,
    `Knapsack iteration direction is everything: right-to-left = 0/1 (item used once); left-to-right = unbounded (item reused). Differs by one character.`,
    `Coin change min coins (unbounded): dp[a] = min(dp[a], dp[a-c] + 1); init dp to infinity, dp[0]=0.`,
    `Coin change II / "number of ways": coins outer, amount inner → counts combinations; amount outer → counts permutations. Init dp[0] = 1.`,
    `Partition equal subset sum: total must be even; reduces to subset sum target = total//2 with dp[s] = dp[s] or dp[s-num], right-to-left.`,
    `Interval DP (burst balloons, palindrome partitioning II, stone game): dp[l][r] over a range, iterate by increasing interval length (not by start index). Burst balloons reframes as "which balloon burst last".`,
    `State-machine DP (stock family): add a dimension for the current mode. Cooldown: hold/sold/rest with new_hold=max(hold,rest-p), new_sold=hold+p, new_rest=max(rest,sold); answer max(sold, rest).`,
    `Tree DP (house robber III, max path sum): return a tuple per subtree (e.g. (rob, skip)) or "return one thing, track another" via a closure; use max(0, gain) to prune negative branches.`,
    `Memoisation vs tabulation: top-down for intuitive recursion / sparse or complex-key state spaces; bottom-up for obvious order, full state space, space optimisation, or recursion-limit avoidance.`,
    `Common bugs: off-by-one in base cases (check n=0,1,2), wrong iteration order, "exactly K" vs "at most K", reading answer from wrong cell, mutating state under @cache, recursion depth, forgetting the modulus in counting problems.`,
    `DP signals: "maximum/minimum", "number of ways", "is it possible", "longest/shortest", "optimal game strategy", "in at most k moves". Anti-signals: provable greedy, shortest-path reduction, no overlapping subproblems.`
  ]
}
