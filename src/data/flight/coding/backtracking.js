export const BACKTRACKING = [
  {
    id: "subsets-ii",
    title: "Subsets II",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given an integer array nums that may contain duplicates, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the subsets sorted (outer list and each inner subset in non-decreasing order).\n\nExample:\nInput: nums = [1, 2, 2]\nOutput: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]`,
    funcName: "subsets_with_dup",
    starter: `def subsets_with_dup(nums):\n    # Your code here\n    pass`,
    solution: `def subsets_with_dup(nums):\n    nums = sorted(nums)\n    result = []\n    path = []\n\n    def backtrack(start):\n        result.append(path[:])\n        for i in range(start, len(nums)):\n            if i > start and nums[i] == nums[i - 1]:\n                continue\n            path.append(nums[i])\n            backtrack(i + 1)\n            path.pop()\n\n    backtrack(0)\n    return sorted(result)`,
    tests: [
      { call: "subsets_with_dup([1, 2, 2])", expected: "[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]" },
      { call: "subsets_with_dup([])", expected: "[[]]" },
      { call: "subsets_with_dup([0])", expected: "[[], [0]]" },
      { call: "subsets_with_dup([2, 1, 2])", expected: "[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]" },
      { call: "subsets_with_dup([1, 1, 1])", expected: "[[], [1], [1, 1], [1, 1, 1]]" }
    ],
    hint: "Sort first, then skip duplicates at the same recursion depth with `if i > start and nums[i] == nums[i-1]: continue`."
  },
  {
    id: "combinations",
    title: "Combinations",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n].\n\nReturn the combinations sorted.\n\nExample:\nInput: n = 4, k = 2\nOutput: [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]`,
    funcName: "combine",
    starter: `def combine(n, k):\n    # Your code here\n    pass`,
    solution: `def combine(n, k):\n    result = []\n    path = []\n\n    def backtrack(start):\n        if len(path) == k:\n            result.append(path[:])\n            return\n        # prune: need (k - len(path)) more numbers\n        for i in range(start, n - (k - len(path)) + 2):\n            path.append(i)\n            backtrack(i + 1)\n            path.pop()\n\n    backtrack(1)\n    return sorted(result)`,
    tests: [
      { call: "combine(4, 2)", expected: "[[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]" },
      { call: "combine(1, 1)", expected: "[[1]]" },
      { call: "combine(3, 3)", expected: "[[1, 2, 3]]" },
      { call: "combine(3, 1)", expected: "[[1], [2], [3]]" },
      { call: "combine(5, 4)", expected: "[[1, 2, 3, 4], [1, 2, 3, 5], [1, 2, 4, 5], [1, 3, 4, 5], [2, 3, 4, 5]]" }
    ],
    hint: "Track a `start` index so each number is only used once and in increasing order; prune when remaining numbers can't fill k slots."
  },
  {
    id: "combination-sum",
    title: "Combination Sum",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given an array of distinct integers candidates and a target, return all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen an unlimited number of times.\n\nReturn the combinations sorted (each combination in non-decreasing order).\n\nExample:\nInput: candidates = [2, 3, 6, 7], target = 7\nOutput: [[2, 2, 3], [7]]`,
    funcName: "combination_sum",
    starter: `def combination_sum(candidates, target):\n    # Your code here\n    pass`,
    solution: `def combination_sum(candidates, target):\n    candidates = sorted(candidates)\n    result = []\n    path = []\n\n    def backtrack(start, remaining):\n        if remaining == 0:\n            result.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            if candidates[i] > remaining:\n                break\n            path.append(candidates[i])\n            backtrack(i, remaining - candidates[i])\n            path.pop()\n\n    backtrack(0, target)\n    return sorted(result)`,
    tests: [
      { call: "combination_sum([2, 3, 6, 7], 7)", expected: "[[2, 2, 3], [7]]" },
      { call: "combination_sum([2, 3, 5], 8)", expected: "[[2, 2, 2, 2], [2, 3, 3], [3, 5]]" },
      { call: "combination_sum([2], 1)", expected: "[]" },
      { call: "combination_sum([1], 2)", expected: "[[1, 1]]" },
      { call: "combination_sum([3, 5, 8], 11)", expected: "[[3, 3, 5], [3, 8]]" }
    ],
    hint: "Pass `i` (not `i+1`) into recursion to allow reuse; sort candidates and break early once a candidate exceeds the remaining target."
  },
  {
    id: "combination-sum-ii",
    title: "Combination Sum II",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given a collection of candidate numbers (which may contain duplicates) and a target, find all unique combinations where the candidate numbers sum to target. Each number may be used at most once.\n\nReturn the combinations sorted (each combination in non-decreasing order).\n\nExample:\nInput: candidates = [10, 1, 2, 7, 6, 1, 5], target = 8\nOutput: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]`,
    funcName: "combination_sum2",
    starter: `def combination_sum2(candidates, target):\n    # Your code here\n    pass`,
    solution: `def combination_sum2(candidates, target):\n    candidates = sorted(candidates)\n    result = []\n    path = []\n\n    def backtrack(start, remaining):\n        if remaining == 0:\n            result.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            if i > start and candidates[i] == candidates[i - 1]:\n                continue\n            if candidates[i] > remaining:\n                break\n            path.append(candidates[i])\n            backtrack(i + 1, remaining - candidates[i])\n            path.pop()\n\n    backtrack(0, target)\n    return sorted(result)`,
    tests: [
      { call: "combination_sum2([10, 1, 2, 7, 6, 1, 5], 8)", expected: "[[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]" },
      { call: "combination_sum2([2, 5, 2, 1, 2], 5)", expected: "[[1, 2, 2], [5]]" },
      { call: "combination_sum2([1], 1)", expected: "[[1]]" },
      { call: "combination_sum2([1], 2)", expected: "[]" },
      { call: "combination_sum2([3, 1, 3, 5, 1, 1], 8)", expected: "[[1, 1, 1, 5], [1, 1, 3, 3], [3, 5]]" }
    ],
    hint: "Sort, advance with `i+1` (each used once), and skip duplicate branches with `if i > start and candidates[i] == candidates[i-1]: continue`."
  },
  {
    id: "combination-sum-iii",
    title: "Combination Sum III",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Find all valid combinations of k numbers that sum up to n, where only numbers 1 through 9 are used and each number is used at most once.\n\nReturn the combinations sorted (each combination in increasing order).\n\nExample:\nInput: k = 3, n = 7\nOutput: [[1, 2, 4]]`,
    funcName: "combination_sum3",
    starter: `def combination_sum3(k, n):\n    # Your code here\n    pass`,
    solution: `def combination_sum3(k, n):\n    result = []\n    path = []\n\n    def backtrack(start, remaining):\n        if len(path) == k:\n            if remaining == 0:\n                result.append(path[:])\n            return\n        for i in range(start, 10):\n            if i > remaining:\n                break\n            path.append(i)\n            backtrack(i + 1, remaining - i)\n            path.pop()\n\n    backtrack(1, n)\n    return sorted(result)`,
    tests: [
      { call: "combination_sum3(3, 7)", expected: "[[1, 2, 4]]" },
      { call: "combination_sum3(3, 9)", expected: "[[1, 2, 6], [1, 3, 5], [2, 3, 4]]" },
      { call: "combination_sum3(4, 1)", expected: "[]" },
      { call: "combination_sum3(2, 18)", expected: "[]" },
      { call: "combination_sum3(1, 5)", expected: "[[5]]" }
    ],
    hint: "Restrict the digit pool to 1..9, advance with `i+1`, and stop when you have k digits — check the running sum only then."
  },
  {
    id: "permutations",
    title: "Permutations",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given an array nums of distinct integers, return all the possible permutations.\n\nReturn the list of permutations sorted (outer list only — order within each permutation is meaningful).\n\nExample:\nInput: nums = [1, 2, 3]\nOutput: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]`,
    funcName: "permute",
    starter: `def permute(nums):\n    # Your code here\n    pass`,
    solution: `def permute(nums):\n    result = []\n    path = []\n    used = [False] * len(nums)\n\n    def backtrack():\n        if len(path) == len(nums):\n            result.append(path[:])\n            return\n        for i in range(len(nums)):\n            if used[i]:\n                continue\n            used[i] = True\n            path.append(nums[i])\n            backtrack()\n            path.pop()\n            used[i] = False\n\n    backtrack()\n    return sorted(result)`,
    tests: [
      { call: "permute([1, 2, 3])", expected: "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]" },
      { call: "permute([0, 1])", expected: "[[0, 1], [1, 0]]" },
      { call: "permute([1])", expected: "[[1]]" },
      { call: "permute([])", expected: "[[]]" },
      { call: "permute([3, 1])", expected: "[[1, 3], [3, 1]]" }
    ],
    hint: "Use a `used` boolean array; append when the path length equals the input length. Sort only the outer list of results."
  },
  {
    id: "permutations-ii",
    title: "Permutations II",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given a collection of numbers nums that might contain duplicates, return all possible unique permutations.\n\nReturn the list of permutations sorted (outer list only — order within each permutation is meaningful).\n\nExample:\nInput: nums = [1, 1, 2]\nOutput: [[1, 1, 2], [1, 2, 1], [2, 1, 1]]`,
    funcName: "permute_unique",
    starter: `def permute_unique(nums):\n    # Your code here\n    pass`,
    solution: `def permute_unique(nums):\n    nums = sorted(nums)\n    result = []\n    path = []\n    used = [False] * len(nums)\n\n    def backtrack():\n        if len(path) == len(nums):\n            result.append(path[:])\n            return\n        for i in range(len(nums)):\n            if used[i]:\n                continue\n            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:\n                continue\n            used[i] = True\n            path.append(nums[i])\n            backtrack()\n            path.pop()\n            used[i] = False\n\n    backtrack()\n    return sorted(result)`,
    tests: [
      { call: "permute_unique([1, 1, 2])", expected: "[[1, 1, 2], [1, 2, 1], [2, 1, 1]]" },
      { call: "permute_unique([1, 2, 3])", expected: "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]" },
      { call: "permute_unique([2, 2, 2])", expected: "[[2, 2, 2]]" },
      { call: "permute_unique([1])", expected: "[[1]]" },
      { call: "permute_unique([3, 1, 1])", expected: "[[1, 1, 3], [1, 3, 1], [3, 1, 1]]" }
    ],
    hint: "Sort first; skip a duplicate when its identical predecessor hasn't been used in the current branch: `nums[i] == nums[i-1] and not used[i-1]`."
  },
  {
    id: "letter-combinations",
    title: "Letter Combinations of a Phone Number",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given a string containing digits from 2-9, return all possible letter combinations that the number could represent (using the classic telephone keypad mapping).\n\nReturn the combinations as a sorted list of strings. If the input is empty, return [].\n\nExample:\nInput: digits = "23"\nOutput: ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf']`,
    funcName: "letter_combinations",
    starter: `def letter_combinations(digits):\n    # Your code here\n    pass`,
    solution: `def letter_combinations(digits):\n    if not digits:\n        return []\n    mapping = {\n        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',\n        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'\n    }\n    result = []\n    path = []\n\n    def backtrack(index):\n        if index == len(digits):\n            result.append(''.join(path))\n            return\n        for ch in mapping[digits[index]]:\n            path.append(ch)\n            backtrack(index + 1)\n            path.pop()\n\n    backtrack(0)\n    return sorted(result)`,
    tests: [
      { call: "letter_combinations(\"23\")", expected: "['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf']" },
      { call: "letter_combinations(\"\")", expected: "[]" },
      { call: "letter_combinations(\"2\")", expected: "['a', 'b', 'c']" },
      { call: "letter_combinations(\"9\")", expected: "['w', 'x', 'y', 'z']" },
      { call: "letter_combinations(\"79\")", expected: "['pw', 'px', 'py', 'pz', 'qw', 'qx', 'qy', 'qz', 'rw', 'rx', 'ry', 'rz', 'sw', 'sx', 'sy', 'sz']" }
    ],
    hint: "Map each digit to its letters; recurse digit by digit, appending a character at each level. Return [] for empty input."
  },
  {
    id: "generate-parentheses",
    title: "Generate Parentheses",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given n pairs of parentheses, generate all combinations of well-formed parentheses.\n\nReturn the combinations as a sorted list of strings.\n\nExample:\nInput: n = 3\nOutput: ['((()))', '(()())', '(())()', '()(())', '()()()']`,
    funcName: "generate_parenthesis",
    starter: `def generate_parenthesis(n):\n    # Your code here\n    pass`,
    solution: `def generate_parenthesis(n):\n    result = []\n    path = []\n\n    def backtrack(open_count, close_count):\n        if len(path) == 2 * n:\n            result.append(''.join(path))\n            return\n        if open_count < n:\n            path.append('(')\n            backtrack(open_count + 1, close_count)\n            path.pop()\n        if close_count < open_count:\n            path.append(')')\n            backtrack(open_count, close_count + 1)\n            path.pop()\n\n    backtrack(0, 0)\n    return sorted(result)`,
    tests: [
      { call: "generate_parenthesis(3)", expected: "['((()))', '(()())', '(())()', '()(())', '()()()']" },
      { call: "generate_parenthesis(1)", expected: "['()']" },
      { call: "generate_parenthesis(0)", expected: "['']" },
      { call: "generate_parenthesis(2)", expected: "['(())', '()()']" }
    ],
    hint: "Add '(' while open count < n, and ')' only while close count < open count; record when the string reaches length 2n."
  },
  {
    id: "palindrome-partitioning",
    title: "Palindrome Partitioning",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitionings.\n\nReturn the partitions as a sorted list of lists of strings.\n\nExample:\nInput: s = "aab"\nOutput: [['a', 'a', 'b'], ['aa', 'b']]`,
    funcName: "partition_palindrome",
    starter: `def partition_palindrome(s):\n    # Your code here\n    pass`,
    solution: `def partition_palindrome(s):\n    result = []\n    path = []\n\n    def is_palindrome(sub):\n        return sub == sub[::-1]\n\n    def backtrack(start):\n        if start == len(s):\n            result.append(path[:])\n            return\n        for end in range(start + 1, len(s) + 1):\n            piece = s[start:end]\n            if is_palindrome(piece):\n                path.append(piece)\n                backtrack(end)\n                path.pop()\n\n    backtrack(0)\n    return sorted(result)`,
    tests: [
      { call: "partition_palindrome(\"aab\")", expected: "[['a', 'a', 'b'], ['aa', 'b']]" },
      { call: "partition_palindrome(\"a\")", expected: "[['a']]" },
      { call: "partition_palindrome(\"\")", expected: "[[]]" },
      { call: "partition_palindrome(\"aba\")", expected: "[['a', 'b', 'a'], ['aba']]" },
      { call: "partition_palindrome(\"bb\")", expected: "[['b', 'b'], ['bb']]" }
    ],
    hint: "At each start index, try every prefix that is a palindrome, then recurse from its end. An empty string yields one empty partition."
  },
  {
    id: "restore-ip-addresses",
    title: "Restore IP Addresses",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given a string s containing only digits, return all possible valid IP address combinations that can be formed by inserting dots into s. Each of the four integers must be between 0 and 255 (inclusive) and cannot have leading zeros (except the number 0 itself).\n\nReturn the addresses as a sorted list of strings.\n\nExample:\nInput: s = "25525511135"\nOutput: ['255.255.11.135', '255.255.111.35']`,
    funcName: "restore_ip_addresses",
    starter: `def restore_ip_addresses(s):\n    # Your code here\n    pass`,
    solution: `def restore_ip_addresses(s):\n    result = []\n    path = []\n\n    def is_valid(seg):\n        if len(seg) == 0 or len(seg) > 3:\n            return False\n        if len(seg) > 1 and seg[0] == '0':\n            return False\n        return int(seg) <= 255\n\n    def backtrack(start):\n        if len(path) == 4:\n            if start == len(s):\n                result.append('.'.join(path))\n            return\n        for end in range(start + 1, min(start + 3, len(s)) + 1):\n            seg = s[start:end]\n            if is_valid(seg):\n                path.append(seg)\n                backtrack(end)\n                path.pop()\n\n    backtrack(0)\n    return sorted(result)`,
    tests: [
      { call: "restore_ip_addresses(\"25525511135\")", expected: "['255.255.11.135', '255.255.111.35']" },
      { call: "restore_ip_addresses(\"0000\")", expected: "['0.0.0.0']" },
      { call: "restore_ip_addresses(\"1111\")", expected: "['1.1.1.1']" },
      { call: "restore_ip_addresses(\"101023\")", expected: "['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3']" },
      { call: "restore_ip_addresses(\"1\")", expected: "[]" }
    ],
    hint: "Build exactly 4 segments, each 1-3 digits, value <= 255, no leading zeros (unless it's '0'); succeed only when all characters are consumed."
  },
  {
    id: "word-search",
    title: "Word Search",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given an m x n grid of characters board and a string word, return True if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically). The same cell may not be used more than once.\n\nExample:\nInput: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"\nOutput: True`,
    funcName: "word_search",
    starter: `def word_search(board, word):\n    # Your code here\n    pass`,
    solution: `def word_search(board, word):\n    if not word:\n        return True\n    if not board or not board[0]:\n        return False\n    rows, cols = len(board), len(board[0])\n\n    def backtrack(r, c, index):\n        if index == len(word):\n            return True\n        if r < 0 or r >= rows or c < 0 or c >= cols:\n            return False\n        if board[r][c] != word[index]:\n            return False\n        temp = board[r][c]\n        board[r][c] = '#'\n        found = (\n            backtrack(r + 1, c, index + 1) or\n            backtrack(r - 1, c, index + 1) or\n            backtrack(r, c + 1, index + 1) or\n            backtrack(r, c - 1, index + 1)\n        )\n        board[r][c] = temp\n        return found\n\n    for i in range(rows):\n        for j in range(cols):\n            if backtrack(i, j, 0):\n                return True\n    return False`,
    tests: [
      { call: "word_search([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCCED')", expected: "True" },
      { call: "word_search([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'SEE')", expected: "True" },
      { call: "word_search([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCB')", expected: "False" },
      { call: "word_search([['A']], 'A')", expected: "True" },
      { call: "word_search([['A']], 'B')", expected: "False" },
      { call: "word_search([['A','B'],['C','D']], 'ABDC')", expected: "True" }
    ],
    hint: "DFS from every cell; mark a visited cell with a sentinel ('#') before recursing and restore it afterward (un-choose)."
  },
  {
    id: "n-queens-count",
    title: "N-Queens (count solutions)",
    difficulty: "Hard",
    topic: "Backtracking",
    statement: `The n-queens puzzle is the problem of placing n queens on an n x n chessboard so that no two queens attack each other (no shared row, column, or diagonal).\n\nGiven an integer n, return the number of distinct solutions.\n\nExample:\nInput: n = 4\nOutput: 2`,
    funcName: "total_n_queens",
    starter: `def total_n_queens(n):\n    # Your code here\n    pass`,
    solution: `def total_n_queens(n):\n    count = 0\n    cols = set()\n    diag1 = set()\n    diag2 = set()\n\n    def backtrack(row):\n        nonlocal count\n        if row == n:\n            count += 1\n            return\n        for col in range(n):\n            if col in cols or (row - col) in diag1 or (row + col) in diag2:\n                continue\n            cols.add(col)\n            diag1.add(row - col)\n            diag2.add(row + col)\n            backtrack(row + 1)\n            cols.remove(col)\n            diag1.remove(row - col)\n            diag2.remove(row + col)\n\n    backtrack(0)\n    return count`,
    tests: [
      { call: "total_n_queens(4)", expected: "2" },
      { call: "total_n_queens(1)", expected: "1" },
      { call: "total_n_queens(2)", expected: "0" },
      { call: "total_n_queens(3)", expected: "0" },
      { call: "total_n_queens(5)", expected: "10" },
      { call: "total_n_queens(6)", expected: "4" }
    ],
    hint: "Place one queen per row; track occupied columns and both diagonals (row-col and row+col) in sets for O(1) conflict checks."
  },
  {
    id: "partition-k-equal-sum",
    title: "Partition to K Equal Sum Subsets",
    difficulty: "Hard",
    topic: "Backtracking",
    statement: `Given an integer array nums and an integer k, return True if it is possible to divide this array into k non-empty subsets whose sums are all equal.\n\nExample:\nInput: nums = [4, 3, 2, 3, 5, 2, 1], k = 4\nOutput: True (subsets [5], [1,4], [2,3], [2,3] each sum to 5)`,
    funcName: "can_partition_k_subsets",
    starter: `def can_partition_k_subsets(nums, k):\n    # Your code here\n    pass`,
    solution: `def can_partition_k_subsets(nums, k):\n    total = sum(nums)\n    if k <= 0 or total % k != 0:\n        return False\n    target = total // k\n    nums = sorted(nums, reverse=True)\n    if nums and nums[0] > target:\n        return False\n    used = [False] * len(nums)\n\n    def backtrack(start, current_sum, buckets_left):\n        if buckets_left == 0:\n            return True\n        if current_sum == target:\n            return backtrack(0, 0, buckets_left - 1)\n        prev = -1\n        for i in range(start, len(nums)):\n            if used[i]:\n                continue\n            if nums[i] == prev:\n                continue\n            if current_sum + nums[i] > target:\n                continue\n            used[i] = True\n            if backtrack(i + 1, current_sum + nums[i], buckets_left):\n                return True\n            used[i] = False\n            prev = nums[i]\n        return False\n\n    return backtrack(0, 0, k)`,
    tests: [
      { call: "can_partition_k_subsets([4, 3, 2, 3, 5, 2, 1], 4)", expected: "True" },
      { call: "can_partition_k_subsets([1, 2, 3, 4], 3)", expected: "False" },
      { call: "can_partition_k_subsets([1, 1, 1, 1], 4)", expected: "True" },
      { call: "can_partition_k_subsets([2, 2, 2, 2, 3, 4, 5], 4)", expected: "False" },
      { call: "can_partition_k_subsets([1], 1)", expected: "True" },
      { call: "can_partition_k_subsets([4, 3, 2, 3, 5, 2, 1], 5)", expected: "False" }
    ],
    hint: "Compute target = total/k; fill one bucket at a time. Sort descending to prune early, and skip equal values that already failed at the same level."
  },
  {
    id: "beautiful-arrangement",
    title: "Beautiful Arrangement",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Suppose you have n integers labeled 1 through n. A permutation perm (1-indexed) is a beautiful arrangement if, for every i (1 <= i <= n), either perm[i] is divisible by i, or i is divisible by perm[i].\n\nGiven an integer n, return the number of beautiful arrangements you can construct.\n\nExample:\nInput: n = 2\nOutput: 2 (the arrangements [1,2] and [2,1] are both beautiful)`,
    funcName: "count_arrangement",
    starter: `def count_arrangement(n):\n    # Your code here\n    pass`,
    solution: `def count_arrangement(n):\n    count = 0\n    used = [False] * (n + 1)\n\n    def backtrack(pos):\n        nonlocal count\n        if pos > n:\n            count += 1\n            return\n        for num in range(1, n + 1):\n            if not used[num] and (num % pos == 0 or pos % num == 0):\n                used[num] = True\n                backtrack(pos + 1)\n                used[num] = False\n\n    backtrack(1)\n    return count`,
    tests: [
      { call: "count_arrangement(2)", expected: "2" },
      { call: "count_arrangement(1)", expected: "1" },
      { call: "count_arrangement(3)", expected: "3" },
      { call: "count_arrangement(4)", expected: "8" },
      { call: "count_arrangement(5)", expected: "10" },
      { call: "count_arrangement(6)", expected: "36" }
    ],
    hint: "Assign numbers position by position (1..n); only place a number at position pos when num % pos == 0 or pos % num == 0."
  }
];
