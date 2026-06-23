// Offline coding-practice problems for the study app.
// Consumed by a Pyodide in-browser Python runner and a python3 verifier.
// Every `solution` is stdlib-only and Python 3.9 compatible.
// Every `expected` equals exactly what the solution returns (deterministic).

import { BACKTRACKING } from "./coding/backtracking.js";
import { HEAP } from "./coding/heap.js";
import { STRUCTURES } from "./coding/structures.js";
import { ALGORITHMS } from "./coding/algorithms.js";
import { HIDDEN } from "./hiddenTests.generated.js";

const CORE = [
  // ----------------------------------------------------------------------
  // Arrays & Hashing (3)
  // ----------------------------------------------------------------------
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays & Hashing",
    statement: `Given an array of order sizes \`nums\` and a target total, return the indices of the two orders that sum to the target. Each input has exactly one solution and you may not reuse the same element.\n\nYou may return the two indices in any order.\n\nExample:\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]   (because 2 + 7 == 9)`,
    funcName: "two_sum",
    starter: `def two_sum(nums, target):\n    # Your code here\n    pass`,
    solution: `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []`,
    tests: [
      { call: "two_sum([2,7,11,15], 9)", expected: "[0, 1]" },
      { call: "two_sum([3,2,4], 6)", expected: "[1, 2]" },
      { call: "two_sum([3,3], 6)", expected: "[0, 1]" },
      { call: "two_sum([-1,-2,-3,-4,-5], -8)", expected: "[2, 4]" },
      { call: "two_sum([0,4,3,0], 0)", expected: "[0, 3]" },
    ],
    hint: "Store each value's index in a hash map and look for the complement as you scan.",
  },
  {
    id: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    topic: "Arrays & Hashing",
    statement: `Given a list of trade IDs \`nums\`, return True if any value appears at least twice, and False if every value is distinct.\n\nExample:\nInput: nums = [1, 2, 3, 1]\nOutput: True`,
    funcName: "contains_duplicate",
    starter: `def contains_duplicate(nums):\n    # Your code here\n    pass`,
    solution: `def contains_duplicate(nums):\n    seen = set()\n    for n in nums:\n        if n in seen:\n            return True\n        seen.add(n)\n    return False`,
    tests: [
      { call: "contains_duplicate([1,2,3,1])", expected: "True" },
      { call: "contains_duplicate([1,2,3,4])", expected: "False" },
      { call: "contains_duplicate([])", expected: "False" },
      { call: "contains_duplicate([7])", expected: "False" },
      { call: "contains_duplicate([-1,-1])", expected: "True" },
    ],
    hint: "Track values you've already seen in a set.",
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    topic: "Arrays & Hashing",
    statement: `Given a list of strings, group the anagrams together. Return a list of groups where each group is sorted alphabetically, and the list of groups is sorted as well (so the output is deterministic).\n\nExample:\nInput: ["eat", "tea", "tan", "ate", "nat", "bat"]\nOutput: [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]`,
    funcName: "group_anagrams",
    starter: `def group_anagrams(strs):\n    # Your code here\n    pass`,
    solution: `def group_anagrams(strs):\n    from collections import defaultdict\n    groups = defaultdict(list)\n    for s in strs:\n        key = ''.join(sorted(s))\n        groups[key].append(s)\n    result = [sorted(g) for g in groups.values()]\n    result.sort()\n    return result`,
    tests: [
      { call: "group_anagrams(['eat','tea','tan','ate','nat','bat'])", expected: "[['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']]" },
      { call: "group_anagrams([''])", expected: "[['']]" },
      { call: "group_anagrams(['a'])", expected: "[['a']]" },
      { call: "group_anagrams(['abc','cba','bca','xyz'])", expected: "[['abc', 'bca', 'cba'], ['xyz']]" },
      { call: "group_anagrams([])", expected: "[]" },
    ],
    hint: "Use the sorted characters of each string as a dictionary key.",
  },

  // ----------------------------------------------------------------------
  // Two Pointers (2)
  // ----------------------------------------------------------------------
  {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    topic: "Two Pointers",
    statement: `Given a string \`s\`, return True if it is a palindrome considering only alphanumeric characters and ignoring case.\n\nExample:\nInput: s = "A man, a plan, a canal: Panama"\nOutput: True`,
    funcName: "is_palindrome",
    starter: `def is_palindrome(s):\n    # Your code here\n    pass`,
    solution: `def is_palindrome(s):\n    i, j = 0, len(s) - 1\n    while i < j:\n        while i < j and not s[i].isalnum():\n            i += 1\n        while i < j and not s[j].isalnum():\n            j -= 1\n        if s[i].lower() != s[j].lower():\n            return False\n        i += 1\n        j -= 1\n    return True`,
    tests: [
      { call: "is_palindrome('A man, a plan, a canal: Panama')", expected: "True" },
      { call: "is_palindrome('race a car')", expected: "False" },
      { call: "is_palindrome('')", expected: "True" },
      { call: "is_palindrome(' ')", expected: "True" },
      { call: "is_palindrome('0P')", expected: "False" },
    ],
    hint: "Walk two pointers inward, skipping non-alphanumeric characters.",
  },
  {
    id: "two-sum-sorted",
    title: "Two Sum II - Sorted Prices",
    difficulty: "Medium",
    topic: "Two Pointers",
    statement: `Given a list of prices \`nums\` sorted in non-decreasing order and a target, return the 1-indexed positions of the two prices that add up to the target. Exactly one solution exists.\n\nExample:\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [1, 2]`,
    funcName: "two_sum_sorted",
    starter: `def two_sum_sorted(nums, target):\n    # Your code here\n    pass`,
    solution: `def two_sum_sorted(nums, target):\n    i, j = 0, len(nums) - 1\n    while i < j:\n        s = nums[i] + nums[j]\n        if s == target:\n            return [i + 1, j + 1]\n        elif s < target:\n            i += 1\n        else:\n            j -= 1\n    return []`,
    tests: [
      { call: "two_sum_sorted([2,7,11,15], 9)", expected: "[1, 2]" },
      { call: "two_sum_sorted([2,3,4], 6)", expected: "[1, 3]" },
      { call: "two_sum_sorted([-1,0], -1)", expected: "[1, 2]" },
      { call: "two_sum_sorted([1,2,3,4,4,9,56,90], 8)", expected: "[4, 5]" },
      { call: "two_sum_sorted([-5,-3,0,2,8], 5)", expected: "[2, 5]" },
    ],
    hint: "Move two pointers from both ends based on whether the sum is too small or too large.",
  },

  // ----------------------------------------------------------------------
  // Sliding Window (2)
  // ----------------------------------------------------------------------
  {
    id: "best-time-to-buy-sell",
    title: "Best Time to Buy and Sell",
    difficulty: "Easy",
    topic: "Sliding Window",
    statement: `Given a price series \`prices\` where \`prices[i]\` is the price on day i, return the maximum profit from a single buy then later sell. If no profit is possible, return 0.\n\nExample:\nInput: prices = [7, 1, 5, 3, 6, 4]\nOutput: 5   (buy at 1, sell at 6)`,
    funcName: "max_profit",
    starter: `def max_profit(prices):\n    # Your code here\n    pass`,
    solution: `def max_profit(prices):\n    best = 0\n    if not prices:\n        return 0\n    lo = prices[0]\n    for p in prices:\n        if p < lo:\n            lo = p\n        elif p - lo > best:\n            best = p - lo\n    return best`,
    tests: [
      { call: "max_profit([7,1,5,3,6,4])", expected: "5" },
      { call: "max_profit([7,6,4,3,1])", expected: "0" },
      { call: "max_profit([])", expected: "0" },
      { call: "max_profit([5])", expected: "0" },
      { call: "max_profit([1,2,3,4,5])", expected: "4" },
      { call: "max_profit([2,4,1])", expected: "2" },
    ],
    hint: "Track the lowest price seen so far and the best profit against it.",
  },
  {
    id: "longest-stable-streak",
    title: "Longest Substring Without Repeats",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: `Given a string \`s\` (a stream of event codes), return the length of the longest contiguous substring with no repeated character.\n\nExample:\nInput: s = "abcabcbb"\nOutput: 3   ("abc")`,
    funcName: "length_of_longest",
    starter: `def length_of_longest(s):\n    # Your code here\n    pass`,
    solution: `def length_of_longest(s):\n    last = {}\n    start = 0\n    best = 0\n    for i, ch in enumerate(s):\n        if ch in last and last[ch] >= start:\n            start = last[ch] + 1\n        last[ch] = i\n        if i - start + 1 > best:\n            best = i - start + 1\n    return best`,
    tests: [
      { call: "length_of_longest('abcabcbb')", expected: "3" },
      { call: "length_of_longest('bbbbb')", expected: "1" },
      { call: "length_of_longest('pwwkew')", expected: "3" },
      { call: "length_of_longest('')", expected: "0" },
      { call: "length_of_longest('au')", expected: "2" },
      { call: "length_of_longest('dvdf')", expected: "3" },
    ],
    hint: "Slide a window and jump the left edge past the last occurrence of a repeat.",
  },

  // ----------------------------------------------------------------------
  // Stack (2)
  // ----------------------------------------------------------------------
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    statement: `Given a string \`s\` containing only the characters '()[]{}', return True if every opening bracket is closed by the matching type in the correct order.\n\nExample:\nInput: s = "()[]{}"\nOutput: True`,
    funcName: "is_valid",
    starter: `def is_valid(s):\n    # Your code here\n    pass`,
    solution: `def is_valid(s):\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for ch in s:\n        if ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n        else:\n            stack.append(ch)\n    return not stack`,
    tests: [
      { call: "is_valid('()')", expected: "True" },
      { call: "is_valid('()[]{}')", expected: "True" },
      { call: "is_valid('(]')", expected: "False" },
      { call: "is_valid('([)]')", expected: "False" },
      { call: "is_valid('{[]}')", expected: "True" },
      { call: "is_valid('')", expected: "True" },
    ],
    hint: "Push openers onto a stack and match each closer against the top.",
  },
  {
    id: "daily-temperatures",
    title: "Days Until Higher Price",
    difficulty: "Medium",
    topic: "Stack",
    statement: `Given a price series \`prices\`, return an array \`answer\` where \`answer[i]\` is the number of days you must wait after day i for a strictly higher price. If there is no future higher price, set that entry to 0.\n\nExample:\nInput: prices = [73, 74, 75, 71, 69, 72, 76, 73]\nOutput: [1, 1, 4, 2, 1, 1, 0, 0]`,
    funcName: "days_until_higher",
    starter: `def days_until_higher(prices):\n    # Your code here\n    pass`,
    solution: `def days_until_higher(prices):\n    res = [0] * len(prices)\n    stack = []\n    for i, p in enumerate(prices):\n        while stack and prices[stack[-1]] < p:\n            j = stack.pop()\n            res[j] = i - j\n        stack.append(i)\n    return res`,
    tests: [
      { call: "days_until_higher([73,74,75,71,69,72,76,73])", expected: "[1, 1, 4, 2, 1, 1, 0, 0]" },
      { call: "days_until_higher([30,40,50,60])", expected: "[1, 1, 1, 0]" },
      { call: "days_until_higher([30,60,90])", expected: "[1, 1, 0]" },
      { call: "days_until_higher([90,80,70])", expected: "[0, 0, 0]" },
      { call: "days_until_higher([5])", expected: "[0]" },
    ],
    hint: "Keep a stack of unresolved indices waiting for a higher value.",
  },

  // ----------------------------------------------------------------------
  // Binary Search (2)
  // ----------------------------------------------------------------------
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    topic: "Binary Search",
    statement: `Given a sorted array \`nums\` and a value \`target\`, return its index, or -1 if it is absent.\n\nExample:\nInput: nums = [-1, 0, 3, 5, 9, 12], target = 9\nOutput: 4`,
    funcName: "binary_search",
    starter: `def binary_search(nums, target):\n    # Your code here\n    pass`,
    solution: `def binary_search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1`,
    tests: [
      { call: "binary_search([-1,0,3,5,9,12], 9)", expected: "4" },
      { call: "binary_search([-1,0,3,5,9,12], 2)", expected: "-1" },
      { call: "binary_search([5], 5)", expected: "0" },
      { call: "binary_search([], 1)", expected: "-1" },
      { call: "binary_search([1,2,3,4,5], 1)", expected: "0" },
      { call: "binary_search([1,2,3,4,5], 5)", expected: "4" },
    ],
    hint: "Halve the search range each step by comparing against the midpoint.",
  },
  {
    id: "search-rotated",
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    topic: "Binary Search",
    statement: `A sorted array of distinct prices was rotated at an unknown pivot. Given the rotated array \`nums\` and a \`target\`, return its index or -1.\n\nExample:\nInput: nums = [4, 5, 6, 7, 0, 1, 2], target = 0\nOutput: 4`,
    funcName: "search_rotated",
    starter: `def search_rotated(nums, target):\n    # Your code here\n    pass`,
    solution: `def search_rotated(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[lo] <= nums[mid]:\n            if nums[lo] <= target < nums[mid]:\n                hi = mid - 1\n            else:\n                lo = mid + 1\n        else:\n            if nums[mid] < target <= nums[hi]:\n                lo = mid + 1\n            else:\n                hi = mid - 1\n    return -1`,
    tests: [
      { call: "search_rotated([4,5,6,7,0,1,2], 0)", expected: "4" },
      { call: "search_rotated([4,5,6,7,0,1,2], 3)", expected: "-1" },
      { call: "search_rotated([1], 0)", expected: "-1" },
      { call: "search_rotated([1], 1)", expected: "0" },
      { call: "search_rotated([5,1,3], 5)", expected: "0" },
      { call: "search_rotated([3,1], 1)", expected: "1" },
    ],
    hint: "At each step one half is sorted — decide which half can contain the target.",
  },

  // ----------------------------------------------------------------------
  // Linked List (2)  -- array-based to keep tests literal-friendly
  // ----------------------------------------------------------------------
  {
    id: "reverse-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    topic: "Linked List",
    statement: `A singly linked list is represented as a Python list of its node values in order. Return the values of the reversed list.\n\nExample:\nInput: head = [1, 2, 3, 4, 5]\nOutput: [5, 4, 3, 2, 1]`,
    funcName: "reverse_list",
    starter: `def reverse_list(head):\n    # head is a list of node values\n    # Your code here\n    pass`,
    solution: `def reverse_list(head):\n    class Node:\n        def __init__(self, v):\n            self.v = v\n            self.next = None\n    dummy_head = None\n    for v in head:\n        node = Node(v)\n        node.next = dummy_head\n        dummy_head = node\n    out = []\n    while dummy_head:\n        out.append(dummy_head.v)\n        dummy_head = dummy_head.next\n    return out`,
    tests: [
      { call: "reverse_list([1,2,3,4,5])", expected: "[5, 4, 3, 2, 1]" },
      { call: "reverse_list([1,2])", expected: "[2, 1]" },
      { call: "reverse_list([])", expected: "[]" },
      { call: "reverse_list([7])", expected: "[7]" },
      { call: "reverse_list([-1,0,1])", expected: "[1, 0, -1]" },
    ],
    hint: "Prepend each node to a new list (or flip the next pointers one by one).",
  },
  {
    id: "merge-two-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topic: "Linked List",
    statement: `Two sorted singly linked lists are given as Python lists of values. Merge them into one sorted list and return its values.\n\nExample:\nInput: l1 = [1, 2, 4], l2 = [1, 3, 4]\nOutput: [1, 1, 2, 3, 4, 4]`,
    funcName: "merge_two_lists",
    starter: `def merge_two_lists(l1, l2):\n    # l1, l2 are lists of node values\n    # Your code here\n    pass`,
    solution: `def merge_two_lists(l1, l2):\n    out = []\n    i = j = 0\n    while i < len(l1) and j < len(l2):\n        if l1[i] <= l2[j]:\n            out.append(l1[i])\n            i += 1\n        else:\n            out.append(l2[j])\n            j += 1\n    out.extend(l1[i:])\n    out.extend(l2[j:])\n    return out`,
    tests: [
      { call: "merge_two_lists([1,2,4], [1,3,4])", expected: "[1, 1, 2, 3, 4, 4]" },
      { call: "merge_two_lists([], [])", expected: "[]" },
      { call: "merge_two_lists([], [0])", expected: "[0]" },
      { call: "merge_two_lists([1,3,5], [])", expected: "[1, 3, 5]" },
      { call: "merge_two_lists([-2,1], [-1,0])", expected: "[-2, -1, 0, 1]" },
    ],
    hint: "Walk both lists with two indices, always taking the smaller head.",
  },

  // ----------------------------------------------------------------------
  // Trees (2)  -- list-encoded input, build tree inside solution
  // ----------------------------------------------------------------------
  {
    id: "level-order",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    topic: "Trees",
    statement: `A binary tree is given in level-order (BFS) array form where None marks a missing child, like LeetCode encoding. Return its values grouped by depth, top to bottom.\n\nExample:\nInput: root = [3, 9, 20, None, None, 15, 7]\nOutput: [[3], [9, 20], [15, 7]]`,
    funcName: "level_order",
    starter: `def level_order(root):\n    # root is a level-order list with None for missing nodes\n    # Your code here\n    pass`,
    solution: `def level_order(root):\n    from collections import deque\n    class TN:\n        def __init__(self, v):\n            self.v = v\n            self.left = None\n            self.right = None\n    if not root or root[0] is None:\n        return []\n    nodes = [TN(v) if v is not None else None for v in root]\n    kids = deque(nodes[1:])\n    for node in nodes:\n        if node is None:\n            continue\n        if kids:\n            node.left = kids.popleft()\n        if kids:\n            node.right = kids.popleft()\n    result = []\n    q = deque([nodes[0]])\n    while q:\n        level = []\n        for _ in range(len(q)):\n            n = q.popleft()\n            level.append(n.v)\n            if n.left:\n                q.append(n.left)\n            if n.right:\n                q.append(n.right)\n        result.append(level)\n    return result`,
    tests: [
      { call: "level_order([3,9,20,None,None,15,7])", expected: "[[3], [9, 20], [15, 7]]" },
      { call: "level_order([1])", expected: "[[1]]" },
      { call: "level_order([])", expected: "[]" },
      { call: "level_order([1,2,3,4,5])", expected: "[[1], [2, 3], [4, 5]]" },
      { call: "level_order([1,None,2,None,3])", expected: "[[1], [2], [3]]" },
    ],
    hint: "Rebuild the tree from the array, then BFS level by level with a queue.",
  },
  {
    id: "max-depth",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    topic: "Trees",
    statement: `A binary tree is given in level-order array form with None for missing children. Return its maximum depth (number of nodes on the longest root-to-leaf path).\n\nExample:\nInput: root = [3, 9, 20, None, None, 15, 7]\nOutput: 3`,
    funcName: "max_depth",
    starter: `def max_depth(root):\n    # root is a level-order list with None for missing nodes\n    # Your code here\n    pass`,
    solution: `def max_depth(root):\n    from collections import deque\n    class TN:\n        def __init__(self, v):\n            self.v = v\n            self.left = None\n            self.right = None\n    if not root or root[0] is None:\n        return 0\n    nodes = [TN(v) if v is not None else None for v in root]\n    kids = deque(nodes[1:])\n    for node in nodes:\n        if node is None:\n            continue\n        if kids:\n            node.left = kids.popleft()\n        if kids:\n            node.right = kids.popleft()\n    def depth(n):\n        if n is None:\n            return 0\n        return 1 + max(depth(n.left), depth(n.right))\n    return depth(nodes[0])`,
    tests: [
      { call: "max_depth([3,9,20,None,None,15,7])", expected: "3" },
      { call: "max_depth([1,None,2])", expected: "2" },
      { call: "max_depth([])", expected: "0" },
      { call: "max_depth([0])", expected: "1" },
      { call: "max_depth([1,2,3,4,None,None,5])", expected: "3" },
    ],
    hint: "Recurse: depth of a node is 1 plus the max depth of its children.",
  },

  // ----------------------------------------------------------------------
  // Heap / Priority Queue (2)
  // ----------------------------------------------------------------------
  {
    id: "k-largest",
    title: "K Largest Elements",
    difficulty: "Medium",
    topic: "Heap / Priority Queue",
    statement: `Given a list of returns \`nums\` and an integer \`k\`, return the \`k\` largest values sorted in descending order.\n\nExample:\nInput: nums = [3, 2, 1, 5, 6, 4], k = 2\nOutput: [6, 5]`,
    funcName: "k_largest",
    starter: `def k_largest(nums, k):\n    # Your code here\n    pass`,
    solution: `def k_largest(nums, k):\n    import heapq\n    if k <= 0:\n        return []\n    top = heapq.nlargest(k, nums)\n    return top`,
    tests: [
      { call: "k_largest([3,2,1,5,6,4], 2)", expected: "[6, 5]" },
      { call: "k_largest([1], 1)", expected: "[1]" },
      { call: "k_largest([3,3,3], 2)", expected: "[3, 3]" },
      { call: "k_largest([-1,-2,-3], 2)", expected: "[-1, -2]" },
      { call: "k_largest([5,4,3,2,1], 0)", expected: "[]" },
      { call: "k_largest([7,7,8,8], 3)", expected: "[8, 8, 7]" },
    ],
    hint: "A max-heap or heapq.nlargest gives the top k directly.",
  },
  {
    id: "median-stream",
    title: "Running Median of a Stream",
    difficulty: "Hard",
    topic: "Heap / Priority Queue",
    statement: `Given a stream of latencies \`nums\`, return a list where the i-th entry is the median of the first i+1 values. With an even count, the median is the average of the two middle values (use float division).\n\nExample:\nInput: nums = [2, 3, 4]\nOutput: [2, 2.5, 3]`,
    funcName: "running_median",
    starter: `def running_median(nums):\n    # Your code here\n    pass`,
    solution: `def running_median(nums):\n    import heapq\n    low = []   # max-heap (negated)\n    high = []  # min-heap\n    out = []\n    for x in nums:\n        if not low or x <= -low[0]:\n            heapq.heappush(low, -x)\n        else:\n            heapq.heappush(high, x)\n        if len(low) > len(high) + 1:\n            heapq.heappush(high, -heapq.heappop(low))\n        elif len(high) > len(low):\n            heapq.heappush(low, -heapq.heappop(high))\n        if len(low) > len(high):\n            out.append(-low[0])\n        else:\n            out.append((-low[0] + high[0]) / 2)\n    return out`,
    tests: [
      { call: "running_median([2,3,4])", expected: "[2, 2.5, 3]" },
      { call: "running_median([1,2])", expected: "[1, 1.5]" },
      { call: "running_median([5])", expected: "[5]" },
      { call: "running_median([])", expected: "[]" },
      { call: "running_median([1,1,1,1])", expected: "[1, 1.0, 1, 1.0]" },
      { call: "running_median([4,3,2,1])", expected: "[4, 3.5, 3, 2.5]" },
    ],
    hint: "Maintain a max-heap of the lower half and a min-heap of the upper half, balanced in size.",
  },

  // ----------------------------------------------------------------------
  // Backtracking (1)
  // ----------------------------------------------------------------------
  {
    id: "subsets",
    title: "Subsets",
    difficulty: "Medium",
    topic: "Backtracking",
    statement: `Given a list of distinct integers \`nums\`, return all possible subsets (the power set). To make the output deterministic, return the subsets sorted: each subset in ascending order, and the overall list sorted.\n\nExample:\nInput: nums = [1, 2, 3]\nOutput: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]`,
    funcName: "subsets",
    starter: `def subsets(nums):\n    # Your code here\n    pass`,
    solution: `def subsets(nums):\n    nums = sorted(nums)\n    res = []\n    def backtrack(start, path):\n        res.append(list(path))\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    res.sort()\n    return res`,
    tests: [
      { call: "subsets([1,2,3])", expected: "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]" },
      { call: "subsets([0])", expected: "[[], [0]]" },
      { call: "subsets([])", expected: "[[]]" },
      { call: "subsets([2,1])", expected: "[[], [1], [1, 2], [2]]" },
      { call: "subsets([-1,1])", expected: "[[], [-1], [-1, 1], [1]]" },
    ],
    hint: "Backtrack: at each index choose to include or skip the element.",
  },

  // ----------------------------------------------------------------------
  // Graphs (2)
  // ----------------------------------------------------------------------
  {
    id: "num-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    topic: "Graphs",
    statement: `Given a grid of '1' (land) and '0' (water) as a list of lists, return the number of islands. An island is land connected horizontally or vertically.\n\nExample:\nInput: grid = [["1","1","0"],["1","0","0"],["0","0","1"]]\nOutput: 2`,
    funcName: "num_islands",
    starter: `def num_islands(grid):\n    # grid is a list of lists of '0'/'1' strings\n    # Your code here\n    pass`,
    solution: `def num_islands(grid):\n    if not grid or not grid[0]:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    seen = set()\n    count = 0\n    def dfs(r, c):\n        stack = [(r, c)]\n        while stack:\n            i, j = stack.pop()\n            if i < 0 or i >= rows or j < 0 or j >= cols:\n                continue\n            if (i, j) in seen or grid[i][j] != '1':\n                continue\n            seen.add((i, j))\n            stack.extend([(i+1, j), (i-1, j), (i, j+1), (i, j-1)])\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1' and (r, c) not in seen:\n                count += 1\n                dfs(r, c)\n    return count`,
    tests: [
      { call: "num_islands([['1','1','0'],['1','0','0'],['0','0','1']])", expected: "2" },
      { call: "num_islands([['1','1','1'],['1','1','1']])", expected: "1" },
      { call: "num_islands([['0','0'],['0','0']])", expected: "0" },
      { call: "num_islands([['1']])", expected: "1" },
      { call: "num_islands([])", expected: "0" },
      { call: "num_islands([['1','0','1','0','1']])", expected: "3" },
    ],
    hint: "Flood-fill each unvisited land cell with DFS/BFS and count how many fills you start.",
  },
  {
    id: "course-schedule",
    title: "Course Schedule",
    difficulty: "Medium",
    topic: "Graphs",
    statement: `There are \`num_courses\` courses labeled 0..num_courses-1. \`prereqs\` is a list of pairs [a, b] meaning you must take b before a. Return True if you can finish all courses (the dependency graph has no cycle).\n\nExample:\nInput: num_courses = 2, prereqs = [[1, 0]]\nOutput: True`,
    funcName: "can_finish",
    starter: `def can_finish(num_courses, prereqs):\n    # Your code here\n    pass`,
    solution: `def can_finish(num_courses, prereqs):\n    from collections import deque, defaultdict\n    graph = defaultdict(list)\n    indeg = [0] * num_courses\n    for a, b in prereqs:\n        graph[b].append(a)\n        indeg[a] += 1\n    q = deque([i for i in range(num_courses) if indeg[i] == 0])\n    taken = 0\n    while q:\n        node = q.popleft()\n        taken += 1\n        for nxt in graph[node]:\n            indeg[nxt] -= 1\n            if indeg[nxt] == 0:\n                q.append(nxt)\n    return taken == num_courses`,
    tests: [
      { call: "can_finish(2, [[1,0]])", expected: "True" },
      { call: "can_finish(2, [[1,0],[0,1]])", expected: "False" },
      { call: "can_finish(1, [])", expected: "True" },
      { call: "can_finish(4, [[1,0],[2,1],[3,2]])", expected: "True" },
      { call: "can_finish(3, [[0,1],[1,2],[2,0]])", expected: "False" },
      { call: "can_finish(5, [])", expected: "True" },
    ],
    hint: "Topological sort with Kahn's algorithm: if you can't process every node, there's a cycle.",
  },

  // ----------------------------------------------------------------------
  // Dynamic Programming (3)
  // ----------------------------------------------------------------------
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    statement: `You climb a staircase of \`n\` steps, taking 1 or 2 steps at a time. Return how many distinct ways you can reach the top.\n\nExample:\nInput: n = 3\nOutput: 3   (1+1+1, 1+2, 2+1)`,
    funcName: "climb_stairs",
    starter: `def climb_stairs(n):\n    # Your code here\n    pass`,
    solution: `def climb_stairs(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b`,
    tests: [
      { call: "climb_stairs(2)", expected: "2" },
      { call: "climb_stairs(3)", expected: "3" },
      { call: "climb_stairs(1)", expected: "1" },
      { call: "climb_stairs(5)", expected: "8" },
      { call: "climb_stairs(10)", expected: "89" },
    ],
    hint: "Ways(n) = Ways(n-1) + Ways(n-2) — it's the Fibonacci recurrence.",
  },
  {
    id: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: `Given coin denominations \`coins\` and a target \`amount\`, return the fewest coins needed to make the amount, or -1 if it cannot be made. You have unlimited coins of each denomination.\n\nExample:\nInput: coins = [1, 2, 5], amount = 11\nOutput: 3   (5 + 5 + 1)`,
    funcName: "coin_change",
    starter: `def coin_change(coins, amount):\n    # Your code here\n    pass`,
    solution: `def coin_change(coins, amount):\n    INF = float('inf')\n    dp = [0] + [INF] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a and dp[a - c] + 1 < dp[a]:\n                dp[a] = dp[a - c] + 1\n    return dp[amount] if dp[amount] != INF else -1`,
    tests: [
      { call: "coin_change([1,2,5], 11)", expected: "3" },
      { call: "coin_change([2], 3)", expected: "-1" },
      { call: "coin_change([1], 0)", expected: "0" },
      { call: "coin_change([1,2,5], 0)", expected: "0" },
      { call: "coin_change([2,5,10], 1)", expected: "-1" },
      { call: "coin_change([186,419,83,408], 6249)", expected: "20" },
    ],
    hint: "Bottom-up DP: dp[a] = 1 + min over coins of dp[a - coin].",
  },
  {
    id: "max-subarray",
    title: "Maximum Subarray (Kadane)",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: `Given a list of daily P&L values \`nums\`, return the largest sum of any contiguous subarray (the best run of consecutive days). The array has at least one element.\n\nExample:\nInput: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6   (the subarray [4, -1, 2, 1])`,
    funcName: "max_subarray",
    starter: `def max_subarray(nums):\n    # Your code here\n    pass`,
    solution: `def max_subarray(nums):\n    best = cur = nums[0]\n    for x in nums[1:]:\n        cur = max(x, cur + x)\n        best = max(best, cur)\n    return best`,
    tests: [
      { call: "max_subarray([-2,1,-3,4,-1,2,1,-5,4])", expected: "6" },
      { call: "max_subarray([1])", expected: "1" },
      { call: "max_subarray([5,4,-1,7,8])", expected: "23" },
      { call: "max_subarray([-1])", expected: "-1" },
      { call: "max_subarray([-3,-2,-5])", expected: "-2" },
      { call: "max_subarray([0,0,0])", expected: "0" },
    ],
    hint: "Kadane's: track the best subarray ending here, resetting when it dips below the current element.",
  },

  // ----------------------------------------------------------------------
  // Intervals (1)
  // ----------------------------------------------------------------------
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    topic: "Intervals",
    statement: `Given a list of trading-session intervals \`intervals\` as [start, end] pairs, merge all overlapping intervals and return the merged list sorted by start.\n\nExample:\nInput: intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]\nOutput: [[1, 6], [8, 10], [15, 18]]`,
    funcName: "merge_intervals",
    starter: `def merge_intervals(intervals):\n    # Your code here\n    pass`,
    solution: `def merge_intervals(intervals):\n    if not intervals:\n        return []\n    arr = sorted(intervals, key=lambda x: x[0])\n    merged = [list(arr[0])]\n    for s, e in arr[1:]:\n        if s <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], e)\n        else:\n            merged.append([s, e])\n    return merged`,
    tests: [
      { call: "merge_intervals([[1,3],[2,6],[8,10],[15,18]])", expected: "[[1, 6], [8, 10], [15, 18]]" },
      { call: "merge_intervals([[1,4],[4,5]])", expected: "[[1, 5]]" },
      { call: "merge_intervals([[1,4],[2,3]])", expected: "[[1, 4]]" },
      { call: "merge_intervals([])", expected: "[]" },
      { call: "merge_intervals([[5,7]])", expected: "[[5, 7]]" },
      { call: "merge_intervals([[3,5],[1,2]])", expected: "[[1, 2], [3, 5]]" },
    ],
    hint: "Sort by start, then extend the last merged interval whenever the next one overlaps it.",
  },
];

// Core 24 problems plus the topic-focused expansions (heavy on heap & backtracking).
const PROBLEMS = [...CORE, ...BACKTRACKING, ...HEAP, ...STRUCTURES, ...ALGORITHMS];

// How each problem's output is compared against the expected value, mirroring
// what LeetCode actually accepts (see hiddenTests.generated.js / pyRunner.js):
//   "exact"     -> actual == expected                       (default; scalars, ordered sequences)
//   "unordered" -> sorted(actual) == sorted(expected)       (top-level order irrelevant; inner fixed)
//   "seteq"     -> order irrelevant at both levels           (collections of sets/groups)
// Anything not listed is "exact".
const CHECKERS = {
  // any order of the two indices / elements
  "two-sum": "unordered",
  "k-largest": "unordered",
  "merge-intervals": "unordered",
  "permutations": "unordered",
  "permutations-ii": "unordered",
  "letter-combinations": "unordered",
  "generate-parentheses": "unordered",
  "palindrome-partitioning": "unordered",
  "restore-ip-addresses": "unordered",
  "top-k-frequent": "unordered",
  "k-closest-points": "unordered",
  "k-smallest-pairs": "unordered",
  "pacific-atlantic": "unordered",
  // collections of groups/subsets — order free at both levels
  "group-anagrams": "seteq",
  "subsets": "seteq",
  "subsets-ii": "seteq",
  "combinations": "seteq",
  "combination-sum": "seteq",
  "combination-sum-ii": "seteq",
  "combination-sum-iii": "seteq",
  "three-sum": "seteq",
};

export const CODING = PROBLEMS.map((p) => ({
  ...p,
  checker: CHECKERS[p.id] || "exact",
  hidden: HIDDEN[p.id] || [],
}));
