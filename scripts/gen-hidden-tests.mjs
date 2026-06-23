// Generate hidden test cases for every coding problem.
//
// For each problem we hand-author a list of edge-case INPUT calls (empty/min,
// duplicates, negatives, boundaries, a larger stress case). The EXPECTED value
// is computed by executing that problem's reference `solution` in python3 and
// capturing repr(...), so expected values are correct by construction and can
// never drift from the reference solution.
//
// Writes src/data/flight/hiddenTests.generated.js.  Run: node scripts/gen-hidden-tests.mjs

import { CODING } from "../src/data/flight/coding.js";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

// problem id -> array of additional call expressions (distinct from visible tests)
const HIDDEN_INPUTS = {
  // ---- Arrays & Hashing / Two Pointers / Sliding Window / Stack (CORE) ----
  "two-sum": [
    "two_sum([1,2,3,4], 7)", "two_sum([5,75,25], 100)", "two_sum([-3,4,3,90], 0)",
    "two_sum([2,5,5,11], 10)", "two_sum([3,2,4,1,9], 13)",
    "two_sum([1,2,3,4,5,6,7,8,9,10], 19)",
  ],
  "contains-duplicate": [
    "contains_duplicate([1,1,1,1])", "contains_duplicate([0])",
    "contains_duplicate([-1,-2,-3,-1])", "contains_duplicate(list(range(1000)))",
    "contains_duplicate(list(range(1000)) + [500])",
  ],
  "group-anagrams": [
    "group_anagrams(['abc','bca','cab','xy','yx'])", "group_anagrams(['', '', 'a'])",
    "group_anagrams(['listen','silent','enlist','google','gogole'])",
    "group_anagrams(['z'])", "group_anagrams(['ab','ba','abc'])",
  ],
  "valid-palindrome": [
    "is_palindrome('Was it a car or a cat I saw?')", "is_palindrome('No lemon, no melon')",
    "is_palindrome('abccba')", "is_palindrome('ab')", "is_palindrome('.,')", "is_palindrome('a.')",
  ],
  "two-sum-sorted": [
    "two_sum_sorted([1,3,4,5,7,11], 9)", "two_sum_sorted([2,3,4], 7)",
    "two_sum_sorted([0,0,3,4], 0)", "two_sum_sorted([5,25,75], 100)",
    "two_sum_sorted([-5,-3,-1,2,4], -8)",
  ],
  "best-time-to-buy-sell": [
    "max_profit([2,4,1,7])", "max_profit([3,3,3])", "max_profit([1,2])",
    "max_profit([2,1])", "max_profit([7,6,4,3,1,8])",
  ],
  "longest-stable-streak": [
    "length_of_longest('abba')", "length_of_longest('tmmzuxt')", "length_of_longest('aab')",
    "length_of_longest('abcdefg')", "length_of_longest(' ')", "length_of_longest('aabaab!bb')",
  ],
  "valid-parentheses": [
    "is_valid('((()))')", "is_valid('(((')", "is_valid(')(')",
    "is_valid('{[()]}')", "is_valid('[')",
  ],
  "daily-temperatures": [
    "days_until_higher([100,90,80,70,75])", "days_until_higher([55,55,55])",
    "days_until_higher([1,2,3,2,1,4])", "days_until_higher([10])", "days_until_higher([2,1,2,1,2])",
  ],
  "binary-search": [
    "binary_search([1,3,5,7,9,11], 7)", "binary_search([1,3,5,7,9,11], 8)",
    "binary_search([2,4], 4)", "binary_search(list(range(0,100,2)), 50)",
    "binary_search([-5,-3,-1,0,2], -3)",
  ],
  "search-rotated": [
    "search_rotated([6,7,0,1,2,4,5], 4)", "search_rotated([5,1,2,3,4], 1)",
    "search_rotated([4,5,6,7,8,1,2,3], 8)", "search_rotated([1,2,3,4,5], 3)",
    "search_rotated([7,8,1,2,3,4,5,6], 9)",
  ],
  "reverse-list": [
    "reverse_list([1,2,3])", "reverse_list([42])", "reverse_list([])",
    "reverse_list([1,1,2,2])", "reverse_list(list(range(10)))",
  ],
  "merge-two-lists": [
    "merge_two_lists([1,3,5,7], [2,4,6,8])", "merge_two_lists([1,1,1], [1,1])",
    "merge_two_lists([5], [1,2,3])", "merge_two_lists([-5,-3], [-4,-2,0])",
    "merge_two_lists([], [1])",
  ],
  "level-order": [
    "level_order([1,2,3,4,5,6,7])", "level_order([1,None,2,3])",
    "level_order([5,4,8,11,None,13,4,7,2,None,None,None,1])", "level_order([0])", "level_order([1,2])",
  ],
  "max-depth": [
    "max_depth([1,2,3,4,5,6,7])", "max_depth([1,2,None,3,None,4])",
    "max_depth([1,None,2,None,3,None,4])", "max_depth([5])", "max_depth([1,2,3])",
  ],
  "k-largest": [
    "k_largest([1,2,3,4,5], 3)", "k_largest([5,5,5,5], 2)", "k_largest([-1,-5,-3], 1)",
    "k_largest([10], 1)", "k_largest([4,1,7,3,8,5], 4)",
  ],
  "median-stream": [
    "running_median([1,2,3,4,5])", "running_median([5,4,3,2,1])", "running_median([2,2,2])",
    "running_median([10])", "running_median([1,3,2,4])",
  ],
  "subsets": [
    "subsets([1,2,3,4])", "subsets([5])", "subsets([1,2])", "subsets([-2,3,7])", "subsets([0,9])",
  ],
  "num-islands": [
    "num_islands([['1','1','0','0'],['0','1','0','1'],['0','0','0','1']])",
    "num_islands([['1','0','1'],['0','1','0'],['1','0','1']])", "num_islands([['0']])",
    "num_islands([['1','1'],['1','1']])", "num_islands([['1','0','0','1','1']])",
  ],
  "course-schedule": [
    "can_finish(3, [[1,0],[2,1]])", "can_finish(2, [[0,1],[1,0]])",
    "can_finish(4, [[0,1],[1,2],[2,3],[3,0]])", "can_finish(6, [[1,0],[2,0],[3,1],[4,2],[5,3]])",
    "can_finish(3, [])",
  ],
  "climbing-stairs": [
    "climb_stairs(4)", "climb_stairs(6)", "climb_stairs(7)", "climb_stairs(20)", "climb_stairs(8)",
  ],
  "coin-change": [
    "coin_change([1,5,10,25], 30)", "coin_change([2,4], 7)", "coin_change([3,7], 14)",
    "coin_change([1], 5)", "coin_change([5,10], 0)",
  ],
  "max-subarray": [
    "max_subarray([1,2,3,4])", "max_subarray([-5,-4,-3])", "max_subarray([3,-2,5,-1])",
    "max_subarray([-2,-3,4,-1,-2,1,5,-3])", "max_subarray([8])",
  ],
  "merge-intervals": [
    "merge_intervals([[1,4],[0,4]])", "merge_intervals([[1,4],[5,6]])",
    "merge_intervals([[1,10],[2,3],[4,5],[6,7]])", "merge_intervals([[6,8],[1,9],[2,4],[4,7]])",
    "merge_intervals([[1,4],[0,2],[3,5]])",
  ],

  // ---- Backtracking ----
  "subsets-ii": [
    "subsets_with_dup([1,2,2,3])", "subsets_with_dup([4,4,4,4])", "subsets_with_dup([0,0])",
    "subsets_with_dup([1,2,3])", "subsets_with_dup([2,2,3,3])",
  ],
  "combinations": [
    "combine(5,2)", "combine(5,3)", "combine(6,1)", "combine(4,4)", "combine(6,5)",
  ],
  "combination-sum": [
    "combination_sum([2,4,6], 8)", "combination_sum([3,4,5], 12)", "combination_sum([7], 14)",
    "combination_sum([2,3], 7)", "combination_sum([5,10,15], 5)",
  ],
  "combination-sum-ii": [
    "combination_sum2([1,1,1,2,2], 4)", "combination_sum2([2,3,5,3,1], 6)",
    "combination_sum2([1,2,3,4], 5)", "combination_sum2([6,6,6], 6)",
    "combination_sum2([10,1,2,7,6,1,5], 10)",
  ],
  "combination-sum-iii": [
    "combination_sum3(2,9)", "combination_sum3(3,15)", "combination_sum3(4,20)",
    "combination_sum3(2,5)", "combination_sum3(3,45)",
  ],
  "permutations": [
    "permute([1,2,3,4])", "permute([5])", "permute([1,2])", "permute([0,1,2])", "permute([7,8,9])",
  ],
  "permutations-ii": [
    "permute_unique([1,1,2,2])", "permute_unique([2,2,1,1])", "permute_unique([0,0,0])",
    "permute_unique([1,2,2])", "permute_unique([3,3,3,3])",
  ],
  "letter-combinations": [
    'letter_combinations("234")', 'letter_combinations("99")', 'letter_combinations("78")',
    'letter_combinations("5")', 'letter_combinations("27")',
  ],
  "generate-parentheses": [
    "generate_parenthesis(4)", "generate_parenthesis(5)",
  ],
  "palindrome-partitioning": [
    'partition_palindrome("aabb")', 'partition_palindrome("racecar")', 'partition_palindrome("abc")',
    'partition_palindrome("aa")', 'partition_palindrome("noon")',
  ],
  "restore-ip-addresses": [
    'restore_ip_addresses("19216811")', 'restore_ip_addresses("255255255255")',
    'restore_ip_addresses("010010")', 'restore_ip_addresses("12121212")',
    'restore_ip_addresses("99999999")',
  ],
  "word-search": [
    "word_search([['A','B'],['C','D']], 'ACDB')", "word_search([['A','B'],['C','D']], 'ABCD')",
    "word_search([['C','A','A'],['A','A','A'],['B','C','D']], 'AAB')",
    "word_search([['A']], 'AA')", "word_search([['A','B','C'],['D','E','F'],['G','H','I']], 'ABEDGH')",
  ],
  "n-queens-count": [
    "total_n_queens(7)", "total_n_queens(8)", "total_n_queens(9)",
  ],
  "partition-k-equal-sum": [
    "can_partition_k_subsets([2,2,2,2], 2)", "can_partition_k_subsets([1,2,3,4,5,6], 3)",
    "can_partition_k_subsets([4,4,4,4], 4)", "can_partition_k_subsets([1,1,1,1,1], 2)",
    "can_partition_k_subsets([2,2,2,2,3,4,5], 3)",
  ],
  "beautiful-arrangement": [
    "count_arrangement(7)", "count_arrangement(8)", "count_arrangement(9)", "count_arrangement(10)",
  ],

  // ---- Heap / Priority Queue ----
  "kth-largest-array": [
    "find_kth_largest([7,6,5,4,3,2,1], 3)", "find_kth_largest([1,2], 1)",
    "find_kth_largest([2,2,2,2], 3)", "find_kth_largest([9,8,7,6,5], 5)",
    "find_kth_largest([-1,-2,-3], 1)",
  ],
  "top-k-frequent": [
    "top_k_frequent([1,1,1,2,2,3], 2)", "top_k_frequent([4,4,4,4,5,5,5,6,6,7], 3)",
    "top_k_frequent([9,9,9,8,8,7], 1)", "top_k_frequent([1,2,2,3,3,3], 3)",
    "top_k_frequent([-1,-1,-2], 1)",
  ],
  "k-closest-points": [
    "k_closest([[1,2],[3,4],[5,6]], 2)", "k_closest([[2,1],[7,8],[1,1]], 2)",
    "k_closest([[10,0],[0,5],[3,3]], 1)", "k_closest([[-2,2],[1,3]], 1)",
    "k_closest([[0,0],[1,1]], 2)",
  ],
  "merge-k-sorted": [
    "merge_k_lists([[1,2],[3,4],[5,6]])", "merge_k_lists([[1,1,1],[1,1],[1]])",
    "merge_k_lists([[-5,-3],[-4,0],[1]])", "merge_k_lists([[10]])", "merge_k_lists([[],[],[]])",
  ],
  "task-scheduler": [
    'least_interval(["A","A","A","B","B","B","C","C"], 2)', 'least_interval(["A","B","C"], 0)',
    'least_interval(["A","A","A","A"], 3)', 'least_interval(["A","A","B","B"], 1)',
    'least_interval(["X","Y","Z","X","Y","Z"], 2)',
  ],
  "last-stone-weight": [
    "last_stone_weight([1,1,1,1])", "last_stone_weight([9,3,2,10])", "last_stone_weight([2,2,4,4])",
    "last_stone_weight([100])", "last_stone_weight([1,3])",
  ],
  "kth-largest-in-stream": [
    "kth_largest_stream(2, [4,5,8,2], [3,5,10,9,4])", "kth_largest_stream(1, [10], [5,15,3])",
    "kth_largest_stream(3, [1,2,3,4,5], [6])", "kth_largest_stream(2, [], [5,5,5])",
    "kth_largest_stream(4, [4,5,8,2,1], [])",
  ],
  "meeting-rooms-ii": [
    "min_meeting_rooms([[1,10],[2,7],[3,19],[8,12],[10,20],[11,30]])",
    "min_meeting_rooms([[5,8],[6,8]])", "min_meeting_rooms([[1,2]])",
    "min_meeting_rooms([[0,30],[5,10],[15,20],[20,30]])",
    "min_meeting_rooms([[2,15],[36,45],[9,29],[16,23],[4,9]])",
  ],
  "k-smallest-pairs": [
    "k_smallest_pairs([1,2,3],[10,20,30],3)", "k_smallest_pairs([1,4,7],[2,8],2)",
    "k_smallest_pairs([2,4,6],[1,3],3)", "k_smallest_pairs([1],[1,2,3],2)",
    "k_smallest_pairs([1,2],[1],2)",
  ],
  "nth-ugly-number": [
    "nth_ugly_number(2)", "nth_ugly_number(20)", "nth_ugly_number(100)",
    "nth_ugly_number(50)", "nth_ugly_number(3)",
  ],
  "connect-sticks": [
    "connect_sticks([1,2,3,4,5])", "connect_sticks([10,20,30])", "connect_sticks([2,2,2,2])",
    "connect_sticks([7])", "connect_sticks([4,3,3,2])",
  ],
  "single-threaded-cpu": [
    "get_order([[1,5],[2,3],[3,1]])", "get_order([[5,2],[5,2],[5,2]])",
    "get_order([[1,1],[1,1],[1,1]])", "get_order([[100,1],[1,100]])", "get_order([[1,2],[2,1]])",
  ],
  "smallest-range-k-lists": [
    "smallest_range([[0,1,2],[3,4,5],[6,7,8]])", "smallest_range([[1,2,3,4],[5,6,7],[8,9]])",
    "smallest_range([[-5,0,5],[-3,2],[1,4]])", "smallest_range([[1],[1],[1]])",
    "smallest_range([[10,20,30],[15,25],[12,18]])",
  ],

  // ---- Trees / Graphs / Tries / Linked List / Stack (STRUCTURES) ----
  "validate-bst": [
    "is_valid_bst([5,3,8,1,4,7,9])", "is_valid_bst([5,3,8,1,6,7,9])", "is_valid_bst([1,1])",
    "is_valid_bst([10,5,15,3,7,12,20])", "is_valid_bst([3,1,5,0,2,4,6])",
  ],
  "lowest-common-ancestor-bst": [
    "lca_bst([6,2,8,0,4,7,9,None,None,3,5], 0, 5)", "lca_bst([6,2,8,0,4,7,9,None,None,3,5], 7, 9)",
    "lca_bst([2,1,3], 1, 3)", "lca_bst([5,3,8,1,4,7,9], 1, 4)", "lca_bst([20,10,30,5,15], 5, 15)",
  ],
  "invert-tree": [
    "invert_tree([1,2,3,4,5,6,7])", "invert_tree([1,2,3])", "invert_tree([1])",
    "invert_tree([3,9,20,None,None,15,7])", "invert_tree([1,2,3,None,4])",
  ],
  "diameter-of-tree": [
    "diameter_of_tree([1,2,3,4,5,6,7])", "diameter_of_tree([1])",
    "diameter_of_tree([1,2,None,3,None,4])", "diameter_of_tree([1,2,2,3,3,3,3])",
    "diameter_of_tree([4,2,7,1,3,6,9])",
  ],
  "kth-smallest-bst": [
    "kth_smallest_bst([3,1,4,None,2], 2)", "kth_smallest_bst([5,3,6,2,4,None,None,1], 1)",
    "kth_smallest_bst([10,5,15,3,7], 4)", "kth_smallest_bst([2,1,3], 3)",
    "kth_smallest_bst([20,10,30], 2)",
  ],
  "clone-graph": [
    "clone_graph([[1,2,3],[0,2],[0,1],[0]])", "clone_graph([[1],[0],[3],[2]])",
    "clone_graph([[2],[2],[0,1]])", "clone_graph([[],[]])", "clone_graph([[],[],[]])",
  ],
  "pacific-atlantic": [
    "pacific_atlantic([[1,1],[1,1]])", "pacific_atlantic([[3,3,3],[3,1,3],[3,3,3]])",
    "pacific_atlantic([[1,2,3],[2,3,4],[3,4,5]])", "pacific_atlantic([[10,10,10],[10,1,10],[10,10,10]])",
    "pacific_atlantic([[5]])",
  ],
  "number-of-connected-components": [
    "count_components(5, [[0,1],[2,3]])", "count_components(3, [[0,1],[1,2],[0,2]])",
    "count_components(10, [])", "count_components(4, [[0,1],[1,2],[2,3]])",
    "count_components(7, [[0,1],[2,3],[4,5]])",
  ],
  "implement-trie": [
    'trie_ops([["insert","cat"],["insert","car"],["search","cat"],["startsWith","ca"],["search","ca"]])',
    'trie_ops([["insert","hello"],["startsWith","hell"],["search","hell"],["insert","hell"],["search","hell"]])',
    'trie_ops([["startsWith","abc"]])',
    'trie_ops([["insert","a"],["insert","ab"],["insert","abc"],["search","ab"],["startsWith","abc"]])',
    'trie_ops([["insert","test"],["search","test"],["search","tes"],["search","testing"]])',
  ],
  "linked-list-cycle": [
    "has_cycle([[1,2,3,4,5], 2])", "has_cycle([[1,2,3], -1])", "has_cycle([[1,2,3,4], 0])",
    "has_cycle([[5], -1])", "has_cycle([[1,2,3,4,5,6], 5])",
  ],
  "reorder-list": [
    "reorder_list([1,2,3,4,5,6])", "reorder_list([1,2,3,4,5,6,7])", "reorder_list([1,2])",
    "reorder_list([1,2,3,4,5,6,7,8])", "reorder_list([10,20,30])",
  ],
  "add-two-numbers": [
    "add_two_numbers([1,2,3], [4,5,6])", "add_two_numbers([9], [9])", "add_two_numbers([0], [5])",
    "add_two_numbers([9,9,9], [1])", "add_two_numbers([2,4], [5,6,7])",
  ],
  "min-stack": [
    'min_stack_ops([["push",5],["push",3],["push",7],["getMin"],["pop"],["getMin"],["top"]])',
    'min_stack_ops([["push",1],["push",2],["getMin"],["top"]])',
    'min_stack_ops([["push",-1],["push",-2],["push",-3],["getMin"],["pop"],["getMin"]])',
    'min_stack_ops([["push",10],["top"]])', 'min_stack_ops([["push",2],["pop"]])',
  ],
  "largest-rectangle-histogram": [
    "largest_rectangle([2,1,5,6,2,3,1])", "largest_rectangle([1,2,3,4,5])",
    "largest_rectangle([5,4,3,2,1])", "largest_rectangle([3,3,3,3])", "largest_rectangle([0,0,0])",
  ],

  // ---- DP / Sliding Window / Two Pointers / Binary Search / Intervals / Greedy / Bits (ALGORITHMS) ----
  "house-robber": [
    "rob([2,7,9,3,1,5])", "rob([100])", "rob([1,2])", "rob([5,5,10,100,10,5])", "rob([2,1,1,2,5,3])",
  ],
  "house-robber-ii": [
    "rob([2,3,2,4])", "rob([1,2,3,4,5])", "rob([5])", "rob([200,3,140,20,10])", "rob([1,2,1,1])",
  ],
  "longest-increasing-subsequence": [
    "lengthOfLIS([1,2,3,4,5])", "lengthOfLIS([5,4,3,2,1])",
    "lengthOfLIS([10,9,2,5,3,7,101,18,1,2,3,4])", "lengthOfLIS([2,2,2,2])",
    "lengthOfLIS([1,3,6,7,9,4,10,5,6])",
  ],
  "word-break": [
    'wordBreak("abcd", ["a","abc","b","cd"])', 'wordBreak("aaaaaaa", ["aaaa","aaa"])',
    'wordBreak("catsanddog", ["cat","cats","and","sand","dog"])', 'wordBreak("cars", ["car","ca","rs"])',
    'wordBreak("ab", ["a"])',
  ],
  "unique-paths": [
    "uniquePaths(3,3)", "uniquePaths(7,3)", "uniquePaths(1,1)", "uniquePaths(5,5)", "uniquePaths(2,2)",
  ],
  "longest-common-subsequence": [
    'longestCommonSubsequence("abcba", "abcbcba")', 'longestCommonSubsequence("aaaa", "aa")',
    'longestCommonSubsequence("abc", "")', 'longestCommonSubsequence("ezupkr", "ubmrapg")',
    'longestCommonSubsequence("abcdgh", "aedfhr")',
  ],
  "longest-substring-without-repeat": [
    'lengthOfLongestSubstring("anviaj")', 'lengthOfLongestSubstring("abcdeafghij")',
    'lengthOfLongestSubstring(" ")', 'lengthOfLongestSubstring("aab")', 'lengthOfLongestSubstring("cdd")',
  ],
  "min-window-substring": [
    'minWindow("aa", "aa")', 'minWindow("abc", "cba")', 'minWindow("cabwefgewcwaefgcf", "cae")',
    'minWindow("bba", "ab")', 'minWindow("xyz", "w")',
  ],
  "three-sum": [
    "threeSum([-2,0,0,2,2])", "threeSum([1,2,-2,-1])", "threeSum([3,0,-2,-1,1,2])",
    "threeSum([0,0,0,0])", "threeSum([-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6])",
  ],
  "container-with-most-water": [
    "maxArea([1,2,4,3])", "maxArea([2,3,10,5,7,8,9])", "maxArea([1,1,1,1])",
    "maxArea([6,1,1,1,6])", "maxArea([1,2,3,4,5,6])",
  ],
  "koko-eating-bananas": [
    "minEatingSpeed([3,6,7,11], 4)", "minEatingSpeed([312,250,124,78,904], 312)",
    "minEatingSpeed([1,1,1,1], 4)", "minEatingSpeed([5,5,5], 3)", "minEatingSpeed([100], 10)",
  ],
  "find-min-rotated": [
    "findMin([4,5,6,7,0,1,2])", "findMin([2,3,4,5,1])", "findMin([1,2,3,4,5])",
    "findMin([5,1,2,3,4])", "findMin([10])",
  ],
  "non-overlapping-intervals": [
    "eraseOverlapIntervals([[1,100],[11,22],[1,11],[2,12]])",
    "eraseOverlapIntervals([[1,2],[3,4],[5,6]])", "eraseOverlapIntervals([[0,2],[1,3],[2,4],[3,5]])",
    "eraseOverlapIntervals([[1,5],[2,3],[3,4]])",
    "eraseOverlapIntervals([[-52,31],[-73,-26],[82,97],[-65,-11],[-62,-49],[95,99],[58,95],[-31,49],[66,98],[-63,2],[30,47],[-40,-26]])",
  ],
  "jump-game": [
    "canJump([1,1,1,1])", "canJump([5,0,0,0,0])", "canJump([1,0,1])",
    "canJump([2,5,0,0])", "canJump([0,2])",
  ],
  "gas-station": [
    "canCompleteCircuit([3,3,4], [3,4,4])", "canCompleteCircuit([4,5,2,6,5,3], [3,2,7,3,2,9])",
    "canCompleteCircuit([5,8,2,8], [6,5,6,6])", "canCompleteCircuit([2], [1])",
    "canCompleteCircuit([1,1,1,1], [2,2,2,2])",
  ],
  "single-number": [
    "singleNumber([1,1,2,2,3])", "singleNumber([0,1,0])", "singleNumber([99])",
    "singleNumber([4,1,2,1,2,5,4])", "singleNumber([-5,-5,7])",
  ],
  "counting-bits": [
    "countBits(10)", "countBits(3)", "countBits(16)", "countBits(7)", "countBits(1)",
  ],
};

// ---- run every problem's reference solution to compute expected values ----
const pyStr = (s) => JSON.stringify(s); // JSON string literal is valid Python too

let py = "import json\nRESULT = {}\n";
const missing = [];
for (const [pid, calls] of Object.entries(HIDDEN_INPUTS)) {
  const prob = CODING.find((p) => p.id === pid);
  if (!prob) { missing.push(pid); continue; }
  py += `\n_ns = {}\nexec(${pyStr(prob.solution)}, _ns)\n_out = []\n`;
  for (const c of calls) {
    py += `_out.append([${pyStr(c)}, repr(eval(${pyStr(c)}, _ns))])\n`;
  }
  py += `RESULT[${pyStr(pid)}] = _out\n`;
}
py += "print(json.dumps(RESULT))\n";

if (missing.length) {
  console.error("Unknown problem ids:", missing.join(", "));
  process.exit(1);
}

// Cross-check: every problem in CODING must have hidden inputs authored.
const uncovered = CODING.filter((p) => !HIDDEN_INPUTS[p.id]).map((p) => p.id);
if (uncovered.length) {
  console.error(`Missing hidden inputs for ${uncovered.length} problems:`, uncovered.join(", "));
  process.exit(1);
}

const res = spawnSync("python3", ["-c", py], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
if (res.status !== 0) {
  process.stderr.write(res.stderr || "");
  console.error("python3 failed while generating hidden tests");
  process.exit(1);
}

const data = JSON.parse(res.stdout);
let body = "";
let count = 0;
for (const pid of CODING.map((p) => p.id)) {
  const rows = data[pid] || [];
  count += rows.length;
  body += `  ${JSON.stringify(pid)}: [\n`;
  for (const [call, expected] of rows) {
    body += `    { call: ${JSON.stringify(call)}, expected: ${JSON.stringify(expected)} },\n`;
  }
  body += "  ],\n";
}

const out = `// AUTO-GENERATED by scripts/gen-hidden-tests.mjs — do not edit by hand.
// Maps problem id -> hidden tests [{ call, expected }]. Expected values are
// produced by executing each problem's reference solution in python3, so they
// are correct by construction. Regenerate with: node scripts/gen-hidden-tests.mjs
export const HIDDEN = {
${body}};
`;

writeFileSync(new URL("../src/data/flight/hiddenTests.generated.js", import.meta.url), out);
console.log(`Wrote ${count} hidden tests across ${CODING.length} problems.`);
