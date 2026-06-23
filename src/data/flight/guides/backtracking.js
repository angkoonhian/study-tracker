export default {
  id: "backtracking",
  title: "Backtracking",
  subtitle: "Subsets, permutations, combinations, partitions, and the universal template",
  emoji: "",
  intro: `Backtracking is the technique for enumerating all valid configurations of something — all subsets, all permutations, all ways to partition a string, all placements of N queens. It's recursion plus state mutation plus a critical "undo" step that lets the same state buffer be reused across many branches of exploration.\n\nBacktracking is intimidating because the recursion tree branches wildly and the state mutations make tracing confusing. But the template is almost identical across every problem: choose, recurse, un-choose. Master the template on subsets and permutations, and the rest of the backtracking family — combinations, partitions, N-queens, word search, sudoku — follows the same shape.`,
  sections: [
    {
      heading: "1. What is backtracking",
      blocks: [
        { type: "p", text: `Backtracking is a brute-force search that prunes intelligently. You explore a tree of decisions, where each path from the root represents a potential solution. Whenever a partial decision can't possibly lead to a valid full solution, you abandon that branch and try something else. The "backtrack" in the name is this abandonment step — you undo the last decision and try a different one.` },
        { type: "h3", text: "1.1 When to use backtracking" },
        {
          type: "ul",
          items: [
            `Generate all valid configurations. All subsets, all permutations, all sequences satisfying some property.`,
            `Count valid configurations. If you're counting rather than enumerating, DP is often better. Backtracking still works but is slower.`,
            `Find one valid configuration. Sudoku solver, N-queens — return as soon as a complete solution is found.`,
            `Find the best configuration. Backtracking + score tracking. DP often beats backtracking here too, but not always.`
          ]
        },
        { type: "h3", text: "1.2 The shape of a backtracking solution" },
        { type: "p", text: `Every backtracking solution looks like:` },
        { type: "code", code: `def backtrack(state):\n    if is_complete(state):\n        record(state)\n        return\n    for choice in choices(state):\n        if is_valid(choice, state):\n            apply(choice, state)\n            backtrack(state)\n            undo(choice, state)         # the crucial undo step` },
        { type: "p", text: `Four ingredients: is_complete (have we built a full solution?), choices (what can we add next?), is_valid (does this choice fit?), apply / undo (the mutation pair).` },
        { type: "callout", text: `The undo step is what makes it backtracking and not just plain recursion. Without undo, your state would carry the previous branch's decisions into the next branch, polluting it. The undo restores state to exactly what it was before apply, so the next iteration of the loop starts from a clean slate.` },
        { type: "h3", text: "1.3 Why the state is mutated in place (not copied)" },
        { type: "p", text: `You could pass an immutable snapshot of state down each recursive call. It works, but it's slow — every recursive call allocates a new copy. Mutating in place plus undoing is dramatically faster and more memory efficient. The pattern is so common that interviewers expect it.` },
        { type: "p", text: `The one place to be careful: when you record a complete solution, append a copy, not the live state. The live state is going to be mutated next, and if you stored a reference to it, your stored solution would change underneath you.` },
        { type: "code", code: `# WRONG: stores a reference; later mutations will corrupt it\nresult.append(state)\n\n# RIGHT: stores a snapshot\nresult.append(state[:])      # or list(state), or state.copy()` }
      ]
    },
    {
      heading: "2. The universal template",
      blocks: [
        { type: "p", text: `Three slightly different recursion shapes cover almost every backtracking problem. Recognising which shape a problem needs is the main lift; the code is mechanical once you have the shape.` },
        { type: "h3", text: "Shape 1: index-based (subsets, combinations)" },
        { type: "code", code: `def backtrack(start, path):\n    record(path)                       # every node may be a valid output\n    for i in range(start, len(nums)):\n        path.append(nums[i])\n        backtrack(i + 1, path)         # i + 1 prevents reuse\n        path.pop()                     # undo` },
        { type: "p", text: `The start parameter is the cornerstone. It ensures that each iteration only considers elements after the last one we picked, so we generate subsets in sorted order and avoid duplicates like [1, 2] vs [2, 1].` },
        { type: "h3", text: "Shape 2: used-array (permutations)" },
        { type: "code", code: `def backtrack(path, used):\n    if len(path) == len(nums):\n        record(path)\n        return\n    for i in range(len(nums)):\n        if used[i]:\n            continue\n        used[i] = True\n        path.append(nums[i])\n        backtrack(path, used)\n        path.pop()\n        used[i] = False` },
        { type: "p", text: `Permutations need to consider every element at every position (just not the ones already used), so there's no start — instead a boolean used array tracks which elements are currently in path.` },
        { type: "h3", text: "Shape 3: position-based (N-queens, sudoku, grids)" },
        { type: "code", code: `def backtrack(position):\n    if position == final_position:\n        record(state)\n        return\n    for value in possible_values(position):\n        if is_valid(position, value):\n            place(position, value)\n            backtrack(next_position(position))\n            unplace(position, value)` },
        { type: "p", text: `When the problem has a structural "current position" (the row in N-queens, the next empty cell in sudoku, the current character in word search), you advance the position rather than tracking an index.` },
        { type: "callout", text: `How to pick the shape. Are you enumerating subsets of an array? Shape 1. Permutations of an array? Shape 2. Filling a grid or sequence of slots? Shape 3. These three shapes cover roughly 95% of backtracking problems.` }
      ]
    },
    {
      heading: "3. Pattern A: subsets",
      blocks: [
        { type: "p", text: `Problem: given a set of distinct integers, return all possible subsets (the power set).` },
        { type: "p", text: `State: path (the current subset being built) and start (where in the input array to consider next). Every node in the recursion tree is a valid subset, so we record at every call.` },
        { type: "code", code: `def subsets(nums):\n    result = []\n    def backtrack(start, path):\n        result.append(path[:])             # snapshot every state\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    return result` },
        { type: "h3", text: "Tracing through [1, 2, 3]" },
        { type: "code", code: `backtrack(0, [])             record []\n  backtrack(1, [1])          record [1]\n    backtrack(2, [1, 2])     record [1, 2]\n      backtrack(3, [1,2,3])  record [1, 2, 3]\n    backtrack(3, [1, 3])     record [1, 3]\n  backtrack(2, [2])          record [2]\n    backtrack(3, [2, 3])     record [2, 3]\n  backtrack(3, [3])          record [3]` },
        {
          type: "diagram",
          kind: "graph",
          data: {
            directed: true,
            nodes: ["[]", "[1]", "[2]", "[3]", "[1,2]", "[1,3]", "[2,3]", "[1,2,3]"],
            edges: [
              ["[]", "[1]"], ["[]", "[2]"], ["[]", "[3]"],
              ["[1]", "[1,2]"], ["[1]", "[1,3]"],
              ["[2]", "[2,3]"],
              ["[1,2]", "[1,2,3]"]
            ],
            positions: {
              "[]": [300, 20],
              "[1]": [120, 84],
              "[2]": [380, 84],
              "[3]": [520, 84],
              "[1,2]": [60, 148],
              "[1,3]": [200, 148],
              "[2,3]": [380, 148],
              "[1,2,3]": [60, 212]
            },
            highlight: ["[]", "[1]", "[2]", "[3]", "[1,2]", "[1,3]", "[2,3]", "[1,2,3]"]
          },
          caption: "every node is a recorded subset"
        },
        { type: "p", text: `Eight subsets total (2^3). Note how start = i + 1 is what prevents [2, 1] and [1, 2] from both showing up — we always advance past the index we just used.` },
        { type: "h3", text: "3.1 Subsets II (with duplicates)" },
        { type: "p", text: `Problem: same as subsets, but the input array may contain duplicates. Output should be unique subsets only.` },
        { type: "p", text: `Two changes. Sort the input first, so duplicates are adjacent. Then inside the loop, skip a value if it's the same as the previous value at the same recursion depth:` },
        { type: "code", code: `def subsetsWithDup(nums):\n    nums.sort()\n    result = []\n    def backtrack(start, path):\n        result.append(path[:])\n        for i in range(start, len(nums)):\n            if i > start and nums[i] == nums[i - 1]:\n                continue                # skip duplicate at same level\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    return result` },
        { type: "callout", text: `The condition i > start is critical. It allows us to use the duplicate at the first iteration of any level (so [1, 1] can appear once) while skipping it on subsequent iterations of that same level (so we don't get [1, 1] twice). The same duplicate-skip pattern reappears in permutations II, combination sum II, and several other problems.` }
      ]
    },
    {
      heading: "4. Pattern B: permutations",
      blocks: [
        { type: "p", text: `Problem: given a set of distinct integers, return all possible permutations.` },
        { type: "p", text: `Permutations consider every element at every position (just not currently-used ones), so the start trick from subsets doesn't apply. Use a boolean used array instead.` },
        { type: "code", code: `def permute(nums):\n    result = []\n    used = [False] * len(nums)\n    def backtrack(path):\n        if len(path) == len(nums):\n            result.append(path[:])\n            return\n        for i in range(len(nums)):\n            if used[i]:\n                continue\n            used[i] = True\n            path.append(nums[i])\n            backtrack(path)\n            path.pop()\n            used[i] = False\n    backtrack([])\n    return result` },
        {
          type: "diagram",
          kind: "graph",
          data: {
            directed: true,
            nodes: ["[]", "[1]", "[2]", "[3]", "[1,2]", "[1,3]", "[2,1]", "[2,3]"],
            edges: [
              ["[]", "[1]"], ["[]", "[2]"], ["[]", "[3]"],
              ["[1]", "[1,2]"], ["[1]", "[1,3]"],
              ["[2]", "[2,1]"], ["[2]", "[2,3]"]
            ],
            positions: {
              "[]": [300, 20],
              "[1]": [110, 84],
              "[2]": [300, 84],
              "[3]": [500, 84],
              "[1,2]": [40, 148],
              "[1,3]": [180, 148],
              "[2,1]": [300, 148],
              "[2,3]": [440, 148]
            },
            highlight: ["[1,2]", "[1,3]", "[2,1]", "[2,3]"]
          },
          caption: "permutations branch on every unused element; only the leaves (full-length paths) are recorded"
        },
        { type: "p", text: `We only record at leaves (when len(path) == len(nums)), unlike subsets where every node is recorded. This is the structural difference between "all subsets" and "all permutations": subsets include partials, permutations don't.` },
        {
          type: "diagram",
          kind: "stack",
          data: { items: ["1", "2", "3"] },
          caption: "the path during one DFS branch — bottom-to-top is the order elements were chosen; a pop() removes the top before trying the next sibling"
        },
        { type: "h3", text: "4.1 Permutations II (with duplicates)" },
        { type: "p", text: `Problem: same as permutations, but the input may contain duplicates.` },
        { type: "p", text: `The pattern is similar to subsets II, with one subtlety. We need to make sure that when there are duplicates, we use them in a fixed order — say, always the leftmost-unused first. This is what prevents us from generating [1a, 1b, 2] and [1b, 1a, 2] as separate "permutations".` },
        { type: "code", code: `def permuteUnique(nums):\n    nums.sort()\n    result = []\n    used = [False] * len(nums)\n    def backtrack(path):\n        if len(path) == len(nums):\n            result.append(path[:])\n            return\n        for i in range(len(nums)):\n            if used[i]:\n                continue\n            # Skip duplicate: if a previous identical value is still unused,\n            # this means it's our turn to use that one first.\n            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:\n                continue\n            used[i] = True\n            path.append(nums[i])\n            backtrack(path)\n            path.pop()\n            used[i] = False\n    backtrack([])\n    return result` },
        { type: "p", text: `The not used[i - 1] condition is the trick. We sort first so duplicates are adjacent. When considering nums[i], if it equals nums[i - 1] and nums[i - 1] is NOT in the current path (not used[i - 1]), it means we've already tried building permutations starting with the earlier copy at this level. Skipping this iteration prevents the duplicate.` }
      ]
    },
    {
      heading: "5. Pattern C: combinations and combination sum",
      blocks: [
        { type: "h3", text: "5.1 Combinations (choose k from n)" },
        { type: "p", text: `Problem: return all combinations of k numbers chosen from 1..n.` },
        { type: "p", text: `Same shape as subsets, but we only record when the path has exactly k elements:` },
        { type: "code", code: `def combine(n, k):\n    result = []\n    def backtrack(start, path):\n        if len(path) == k:\n            result.append(path[:])\n            return\n        for i in range(start, n + 1):\n            path.append(i)\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(1, [])\n    return result` },
        { type: "p", text: `Subsets enumerated all subsets of any size; combinations restrict to subsets of size exactly k. Other than the size check, the code is identical.` },
        { type: "h3", text: "Pruning: skip impossible branches" },
        { type: "p", text: `The inner loop can be pruned: if we already have len(path) elements and we need k total, we need at least k - len(path) more. So we shouldn't iterate past n - (k - len(path)) + 1.` },
        { type: "code", code: `for i in range(start, n - (k - len(path)) + 2):\n    # ...` },
        { type: "p", text: `This optimisation alone can speed up the algorithm enormously for small k. We'll see more aggressive pruning in section 8.` },
        { type: "h3", text: "5.2 Combination sum (unlimited reuse)" },
        { type: "p", text: `Problem: given distinct candidates and a target, find all unique combinations that sum to the target. Each candidate may be used unlimited times.` },
        { type: "p", text: `The key change. Because each candidate can be reused, the recursive call uses i instead of i + 1 for the next start. This lets the same index be picked again at the next level.` },
        { type: "code", code: `def combinationSum(candidates, target):\n    result = []\n    candidates.sort()                      # for pruning\n    def backtrack(start, path, remaining):\n        if remaining == 0:\n            result.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            if candidates[i] > remaining:  # pruning\n                break\n            path.append(candidates[i])\n            backtrack(i, path, remaining - candidates[i])    # i, not i + 1\n            path.pop()\n    backtrack(0, [], target)\n    return result` },
        { type: "p", text: `Sorting candidates lets us break early. Once candidates[i] > remaining, all subsequent candidates are also too big (sorted), so we abandon the entire rest of the loop. This is a major speedup.` },
        { type: "h3", text: "5.3 Combination sum II (each used once, may have duplicates)" },
        { type: "p", text: `Problem: like combination sum, but each candidate may be used at most once, and the input may contain duplicates.` },
        { type: "p", text: `Combine the tricks from subsets II (duplicate skip) and combination sum (early break on sorted input):` },
        { type: "code", code: `def combinationSum2(candidates, target):\n    result = []\n    candidates.sort()\n    def backtrack(start, path, remaining):\n        if remaining == 0:\n            result.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            if candidates[i] > remaining:\n                break\n            if i > start and candidates[i] == candidates[i - 1]:\n                continue                   # skip duplicate at same level\n            path.append(candidates[i])\n            backtrack(i + 1, path, remaining - candidates[i])\n            path.pop()\n    backtrack(0, [], target)\n    return result` }
      ]
    },
    {
      heading: "6. Pattern D: partitioning",
      blocks: [
        { type: "h3", text: "6.1 Palindrome partitioning" },
        { type: "p", text: `Problem: partition a string into substrings such that every substring is a palindrome. Return all such partitions.` },
        { type: "p", text: `State: start (index where the next substring begins) and path (list of palindromic substrings so far). At each step, try every possible end position for the next substring.` },
        { type: "code", code: `def partition(s):\n    result = []\n    def is_palindrome(sub):\n        return sub == sub[::-1]\n    def backtrack(start, path):\n        if start == len(s):\n            result.append(path[:])\n            return\n        for end in range(start + 1, len(s) + 1):\n            piece = s[start:end]\n            if is_palindrome(piece):\n                path.append(piece)\n                backtrack(end, path)\n                path.pop()\n    backtrack(0, [])\n    return result` },
        { type: "p", text: `The choice at each step is "where does the next piece end?" — any position from start + 1 to len(s). We try every option, recurse if the piece is a palindrome, and undo by popping.` },
        { type: "h3", text: "6.2 Restore IP addresses" },
        { type: "p", text: `Problem: given a string of digits, return all valid IP addresses that can be formed by inserting dots between them.` },
        { type: "p", text: `Same shape as palindrome partitioning, with the constraints: exactly 4 pieces, each piece is 1-3 digits, value 0-255, no leading zeros (except "0" itself).` },
        { type: "code", code: `def restoreIpAddresses(s):\n    result = []\n    def is_valid(piece):\n        if not piece or len(piece) > 3:\n            return False\n        if piece[0] == '0' and len(piece) > 1:\n            return False\n        return 0 <= int(piece) <= 255\n    def backtrack(start, path):\n        if len(path) == 4:\n            if start == len(s):\n                result.append('.'.join(path))\n            return\n        for end in range(start + 1, min(start + 4, len(s) + 1)):\n            piece = s[start:end]\n            if is_valid(piece):\n                path.append(piece)\n                backtrack(end, path)\n                path.pop()\n    backtrack(0, [])\n    return result` },
        { type: "p", text: `The two-condition completion check is important. We need both exactly 4 pieces and all digits consumed. Having 4 pieces with leftover digits is invalid; having all digits consumed but fewer than 4 pieces is also invalid. Both checks together ensure correctness.` }
      ]
    },
    {
      heading: "7. Pattern E: grid backtracking",
      blocks: [
        { type: "h3", text: "7.1 Word search" },
        { type: "p", text: `Problem: given a 2D board of characters and a word, return True if the word can be formed by tracing through adjacent cells (no diagonals, no cell reused).` },
        { type: "p", text: `Try DFS from every cell. At each step, mark the current cell as visited (so it can't be reused in the same path), recurse in all four directions, then unmark.` },
        { type: "code", code: `def exist(board, word):\n    R, C = len(board), len(board[0])\n    def backtrack(r, c, i):\n        if i == len(word):\n            return True\n        if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[i]:\n            return False\n        # Mark this cell as visited\n        original = board[r][c]\n        board[r][c] = '#'\n        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:\n            if backtrack(r + dr, c + dc, i + 1):\n                return True\n        board[r][c] = original         # undo\n        return False\n    for r in range(R):\n        for c in range(C):\n            if backtrack(r, c, 0):\n                return True\n    return False` },
        { type: "p", text: `Marking in place with a sentinel (like '#') is a memory-efficient alternative to a separate visited set. Just remember to restore the original value on the way out — that's the backtrack step. If the problem doesn't allow mutation, use a visited set instead.` },
        { type: "h3", text: "7.2 N-queens" },
        { type: "p", text: `Problem: place N queens on an N×N board such that no two attack each other (no shared row, column, or diagonal).` },
        { type: "p", text: `Position-by-position: place one queen per row. For each row, try every column; check whether it's safe given the queens placed in earlier rows.` },
        { type: "code", code: `def solveNQueens(n):\n    cols = set()\n    diag1 = set()        # r - c, the anti-diagonal\n    diag2 = set()        # r + c, the diagonal\n    board = []\n    result = []\n\n    def backtrack(row):\n        if row == n:\n            result.append(board[:])\n            return\n        for col in range(n):\n            if col in cols or (row - col) in diag1 or (row + col) in diag2:\n                continue\n            # place\n            cols.add(col)\n            diag1.add(row - col)\n            diag2.add(row + col)\n            board.append('.' * col + 'Q' + '.' * (n - col - 1))\n            backtrack(row + 1)\n            # unplace\n            cols.remove(col)\n            diag1.remove(row - col)\n            diag2.remove(row + col)\n            board.pop()\n    backtrack(0)\n    return result` },
        { type: "p", text: `The three sets give O(1) safety checks. Without them, you'd have to walk through the queens already placed and verify no conflicts — O(N) per check. The sets capture all three attack patterns: same column (cols), same anti-diagonal (constant row - col), same diagonal (constant row + col).` },
        {
          type: "diagram",
          kind: "grid",
          data: {
            cells: [
              [".", "Q", ".", "."],
              [".", ".", ".", "Q"],
              ["Q", ".", ".", "."],
              [".", ".", "Q", "."]
            ],
            highlight: [[0, 1], [1, 3], [2, 0], [3, 2]]
          },
          caption: "one solution to 4-queens: exactly one Q per row, none sharing a column or diagonal"
        },
        {
          type: "diagram",
          kind: "array",
          data: { values: [false, true, false, true], highlight: [1, 3] },
          caption: "the used[] / cols state for the board above — columns 1 and 3 are occupied; the next row may only pick column 0 or 2"
        }
      ]
    },
    {
      heading: "8. Pruning: how to make backtracking fast",
      blocks: [
        { type: "p", text: `Backtracking is brute force in the worst case — exponential in the input size. But pruning can make it dramatically faster in practice. The art of backtracking is finding ways to abandon branches early.` },
        { type: "h3", text: "8.1 Standard pruning techniques" },
        {
          type: "ul",
          items: [
            `Sort and break. If the input is sorted and the current choice already fails (sum too big, value too large), all subsequent choices in this loop also fail. Use break instead of continue.`,
            `Constraint propagation. Maintain auxiliary structures (sets, counts) that let you check validity in O(1) instead of walking the path.`,
            `Length pruning. If you need k more elements and there aren't k candidates remaining, abandon the branch.`,
            `Sum/cost pruning. If the partial sum already exceeds the target (or can't reach it given remaining range), abandon.`,
            `Order the loop intelligently. Try the most promising / most constrained option first — failures happen sooner.`,
            `Memoise on shared sub-states. If different branches converge to the same sub-state, cache results. (At this point, it's becoming DP.)`
          ]
        },
        { type: "h3", text: "8.2 Example: combination sum with pruning" },
        { type: "p", text: `We already saw break for sum pruning. Here's a complete example highlighting where every pruning opportunity comes in:` },
        { type: "code", code: `def combinationSum(candidates, target):\n    result = []\n    candidates.sort()                          # sort for break-pruning\n    def backtrack(start, path, remaining):\n        if remaining == 0:\n            result.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            if candidates[i] > remaining:      # sum pruning\n                break\n            path.append(candidates[i])\n            backtrack(i, path, remaining - candidates[i])\n            path.pop()\n    backtrack(0, [], target)\n    return result` },
        { type: "p", text: `Without sorting + breaking, this is O(2^n) in the worst case. With them, the recursion tree is dramatically narrower in practice.` }
      ]
    },
    {
      heading: "9. Common bugs",
      blocks: [
        {
          type: "table",
          headers: ["Bug", "What goes wrong"],
          rows: [
            ["Forgetting to undo", "Without the un-choose step, state pollutes from one branch into the next. Symptom: results contain elements that shouldn't be there, or the search misses valid solutions."],
            ["Storing references instead of copies", "result.append(path) stores a live reference. Later mutations corrupt the recorded result. Always result.append(path[:]) or list(path)."],
            ["Wrong recursion shape", "Using start-based recursion for permutations (misses valid orderings) or used-based for subsets (generates duplicate subsets in different orders)."],
            ["Missing duplicate skip on duplicate input", "Subsets II / permutations II / combination sum II all need a duplicate-skip condition. Forgetting it gives duplicate outputs."],
            ["Duplicate skip condition wrong", "i > start for subsets II (same level), but not used[i - 1] for permutations II (across siblings, not across levels). Mixing them up gives wrong answers."],
            ["Off-by-one in slicing", "When extracting a substring or sub-range, s[start:end] is exclusive on the right. Recursing with end as the new start is correct; recursing with end + 1 skips a character."],
            ["Recursion before validity check", "Marking a cell visited before checking if it's the right character (in word search) causes spurious work and harder-to-trace bugs. Check validity early."],
            ["Not restoring state in the early-return case", "If the recursive call returns True (found a solution) and we return True immediately, we may skip the undo. For find-one-solution problems, this is usually fine (we never need to come back). For find-all-solutions, make sure undo runs."],
            ["No base case", "Without a clear is_complete check, the recursion never terminates. Especially common when adapting templates between problem types."],
            ["Pruning incorrectly", "Pruning that's too aggressive misses valid solutions. Sketch the pruning condition on paper before adding it."]
          ]
        }
      ]
    },
    {
      heading: "10. Study plan",
      blocks: [
        { type: "p", text: `Drill in this order. The duplicate variants are deliberately spaced after their base versions so you can practice the duplicate-skip trick in isolation.` },
        {
          type: "table",
          headers: ["#", "Problem", "Pattern"],
          rows: [
            ["", "Subsets and combinations", ""],
            ["1", "Subsets", "Index-based, record at every node."],
            ["2", "Subsets II", "Add duplicate skip with i > start."],
            ["3", "Combinations", "Same as subsets, gated on path length."],
            ["4", "Combination sum", "Reuse allowed: recurse with i not i + 1."],
            ["5", "Combination sum II", "No reuse + duplicates. Combine both tricks."],
            ["6", "Combination sum III", "Fixed size + value range. Length pruning."],
            ["", "Permutations", ""],
            ["7", "Permutations", "Used-array shape, record at leaves only."],
            ["8", "Permutations II", "Add not used[i - 1] skip."],
            ["9", "Letter combinations of a phone number", "Mapping-driven permutations."],
            ["", "Partitioning", ""],
            ["10", "Palindrome partitioning", "Choose substring end positions."],
            ["11", "Restore IP addresses", "Fixed 4 pieces, validity constraints."],
            ["12", "Word break II", "Partition + dictionary check; memoise for speed."],
            ["", "Grid backtracking", ""],
            ["13", "Word search", "DFS with mark-and-undo on the grid."],
            ["14", "Word search II", "Trie + word search for multiple words."],
            ["15", "N-queens", "Position-based with three constraint sets."],
            ["16", "Sudoku solver", "Cell-by-cell fill with row/col/box constraint sets."],
            ["", "Other classic backtracking", ""],
            ["17", "Generate parentheses", "Count-based: track open / close counts."],
            ["18", "Beautiful arrangement", "Permutations with a divisibility constraint."],
            ["19", "Partition to K equal sum subsets", "Multi-bucket packing with backtracking."],
            ["20", "Matchsticks to square", "Bucket-packing variant of partition."]
          ]
        }
      ]
    },
    {
      heading: "11. One-page cheat sheet",
      blocks: [
        { type: "h3", text: "The three recursion shapes" },
        {
          type: "table",
          headers: ["Trigger", "Shape", "Distinguishing feature"],
          rows: [
            ["Subsets, combinations, partitions", "Index-based", "start parameter; recursion with i + 1 (or i for reuse)."],
            ["Permutations, arrangements", "Used-array", "used[] boolean array; iterate all indices each call."],
            ["N-queens, sudoku, word search, grids", "Position-based", "Advance through cells/rows; constraint-set checks for O(1) validity."]
          ]
        },
        { type: "h3", text: "Duplicate handling" },
        {
          type: "table",
          headers: ["Problem type", "Skip condition"],
          rows: [
            ["Subsets II, combination sum II", "Sort, then inside loop: if i > start and nums[i] == nums[i-1]: continue"],
            ["Permutations II", "Sort, then: if i > 0 and nums[i] == nums[i-1] and not used[i-1]: continue"]
          ]
        },
        { type: "h3", text: "The universal template" },
        { type: "code", code: `def backtrack(state):\n    if is_complete(state):\n        result.append(snapshot(state))\n        return\n    for choice in choices(state):\n        if is_valid(choice, state):\n            apply(choice, state)\n            backtrack(state)\n            undo(choice, state)` },
        { type: "h3", text: "Pruning checklist" },
        {
          type: "ul",
          items: [
            `Sort the input so you can break on impossible suffixes.`,
            `Track auxiliary counts / sets for O(1) validity checks.`,
            `Length-prune: if you can't reach the target size, abandon.`,
            `Sum-prune: if the partial sum has overshot, abandon.`,
            `Try the most-constrained option first.`
          ]
        },
        { type: "h3", text: "The mental model" },
        { type: "p", text: `Backtracking is exploring a tree of decisions with the same state buffer reused across branches. The undo is what makes that reuse safe. Most backtracking problems collapse into one of three recursion shapes — index-based, used-array, or position-based — and the duplicate-handling patterns are reusable across the variants. Once you can write the three shapes from memory and recognise which shape a problem needs, the category becomes routine.` }
      ]
    }
  ],
  cheatsheet: [
    `Three recursion shapes: index-based (subsets/combinations — start param, recurse i+1 or i for reuse), used-array (permutations — used[] boolean, iterate all indices), position-based (N-queens/sudoku/grids — advance through cells, constraint-set O(1) checks).`,
    `Universal template: if is_complete -> record snapshot & return; else for each choice -> if valid: apply, recurse, undo. The undo is what makes it backtracking.`,
    `Subsets record at every node; permutations record only at leaves (len(path) == len(nums)).`,
    `Combinations = subsets gated on path length == k. Combination sum: recurse with i (reuse) vs i + 1 (no reuse).`,
    `Always append a COPY: result.append(path[:]) — never the live reference.`,
    `Duplicate skip — Subsets II / combination sum II: sort, then if i > start and nums[i] == nums[i-1]: continue.`,
    `Duplicate skip — Permutations II: sort, then if i > 0 and nums[i] == nums[i-1] and not used[i-1]: continue.`,
    `Pruning: sort + break on impossible suffixes; auxiliary sets/counts for O(1) validity; length-prune; sum-prune; try most-constrained option first.`,
    `Grids: mark cell with a sentinel (e.g. '#') and restore on the way out, or use a visited set if mutation isn't allowed.`,
    `not root vs leaf (no children) are different; check validity before recursing, and make sure undo runs even on early returns when finding ALL solutions.`
  ]
}
