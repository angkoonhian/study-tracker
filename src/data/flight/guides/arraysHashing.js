export default {
  id: "arrays-hashing",
  title: "Arrays & Hashing",
  subtitle: "Frequency counts, complement search, prefix sums, and the O(1)-lookup mindset",
  emoji: "🗂️",
  intro: `Almost every array problem that isn't about sorting or two pointers is secretly a hashing problem. The moment you find yourself writing a nested loop to ask "have I seen this before?" or "does the matching element exist?", a hash map or hash set collapses that O(n²) scan into a single O(n) pass. Learning to feel that reflex — to swap a search for a lookup — is the single highest-leverage skill in this category.\n\nThe data structures are small: Python's dict (hash map), set (hash set), and the three workhorses from collections — Counter, defaultdict, and OrderedDict. The patterns built on top of them are a handful: frequency counting, complement search (the two-sum family), grouping by a canonical key (anagrams), prefix sums (subarray-sum problems), seen-sets for dedup and sequence detection, and in-place marking that abuses the array itself as a hash table.\n\nThis handbook walks through each pattern with correct, stdlib-only Python, then closes with the failure modes (mutable keys, worst-case collisions, dict-order assumptions), a common-bugs table, a study plan of classic problems mapped to the pattern each teaches, and a one-page cheat sheet with a trigger-to-pattern lookup.`,
  sections: [
    {
      heading: "1. What hashing buys you",
      blocks: [
        { type: "p", text: `A hash table stores keys by computing a hash of each key and using it to index into an internal array. Lookups, insertions, and deletions are O(1) on average — independent of how many elements are stored. That average-case O(1) is the entire reason the data structure exists, and it is what turns brute-force O(n²) array scans into O(n) single passes.` },
        { type: "h3", text: "1.1 The core trade: search becomes lookup" },
        { type: "p", text: `The canonical example is "does this array contain a value x?". With a plain list that is an O(n) linear scan; do it inside a loop over the array and you have O(n²). Put the elements in a set first and each membership test is O(1), so the whole thing is O(n) — at the cost of O(n) extra space. Hashing is almost always a time-for-space trade.` },
        { type: "code", code: `# O(n^2): linear search inside a loop\ndef has_pair_slow(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return True\n    return False\n\n# O(n): membership test is O(1)\ndef has_pair_fast(nums, target):\n    seen = set()\n    for x in nums:\n        if target - x in seen:\n            return True\n        seen.add(x)\n    return False` },
        { type: "callout", text: `The reflex to train: whenever a nested loop asks "is there another element that... ?", ask whether a set or dict can answer that question in O(1). If yes, you almost certainly have an O(n) solution hiding behind an O(n²) one.` },
        { type: "h3", text: "1.2 dict vs set — when to use which" },
        {
          type: "table",
          headers: ["Need", "Structure", "Why"],
          rows: [
            ["Just membership ('have I seen x?')", "set", "Stores keys only, no values; smallest and clearest"],
            ["Map a key to data (index, count, list)", "dict", "Stores key -> value; the value carries the extra info"],
            ["Count occurrences", "Counter", "A dict subclass that defaults missing keys to 0"],
            ["Accumulate into lists / sets per key", "defaultdict", "Auto-creates the default value on first access"],
            ["Dedup a collection", "set", "Constructed from any iterable, drops duplicates"]
          ]
        },
        { type: "p", text: `A common beginner mistake is reaching for a dict when a set is enough, or for a set when you actually need the value (the index, in two-sum). Pick the smallest structure that holds exactly the information you need.` },
        { type: "h3", text: "1.3 The collections toolbox" },
        { type: "p", text: `Three classes from the standard library remove almost all the boilerplate around hashing.` },
        { type: "code", code: `from collections import Counter, defaultdict, OrderedDict\n\n# Counter: frequency map in one line\ncounts = Counter("mississippi")\n# Counter({'s': 4, 'i': 4, 'p': 2, 'm': 1})\ncounts.most_common(2)          # [('s', 4), ('i', 4)]\ncounts['z']                    # 0  (missing key -> 0, no KeyError)\n\n# defaultdict: missing key auto-creates a default\ngroups = defaultdict(list)\ngroups['a'].append(1)          # no need to check 'a' in groups first\n\n# Counter arithmetic\nCounter("aab") - Counter("a")  # Counter({'a': 1, 'b': 1})\nCounter("aab") & Counter("ab") # Counter({'a': 1, 'b': 1})  (min)` },
        { type: "callout", text: `Counter[missing] returns 0; dict[missing] raises KeyError. That single difference is why Counter is the right tool for frequency problems — you never have to guard the first increment.` },
        { type: "h3", text: "1.4 When hashing is the wrong tool" },
        {
          type: "ul",
          items: [
            `Order matters. Hash tables don't keep elements sorted. If you need the smallest / next-greater / k-th order statistic, reach for a heap, sorted structure, or sort first.`,
            `Range / interval queries. "How many values fall between a and b?" is not a hashing question — that's a sorted array, BIT, or segment tree.`,
            `Tiny fixed domains. For lowercase letters, a length-26 list indexed by ord(c) - ord('a') beats a dict — same O(1), less overhead, and no hashing.`,
            `Keys aren't hashable. Lists and dicts can't be keys (see 9.1). You must convert to a tuple / frozenset first.`,
            `Adversarial worst case matters. Hash collisions can degrade lookups to O(n); see 9.2. Rare in interviews, occasionally relevant in production.`
          ]
        }
      ]
    },
    {
      heading: "2. Pattern A: frequency counting",
      blocks: [
        { type: "p", text: `The most basic hashing pattern: count how many times each element appears, then answer questions from the count map. Recognising it is easy — any problem that says "duplicate", "majority", "appears k times", "most common", or "first unique" is a frequency-count problem.` },
        { type: "h3", text: "2.1 The count map" },
        { type: "code", code: `from collections import Counter\n\ndef contains_duplicate(nums):\n    return len(set(nums)) < len(nums)        # any dup -> set is smaller\n\ndef first_unique_char(s):\n    counts = Counter(s)\n    for i, ch in enumerate(s):\n        if counts[ch] == 1:\n            return i\n    return -1` },
        { type: "p", text: `Counter(s) is a single O(n) pass. The second loop is another O(n) pass that reads the now-complete counts. Two passes, still O(n) total — a recurring shape: build the map, then query it.` },
        { type: "diagram", kind: "grid", data: { cells: [["m", "i", "s", "p"], [1, 4, 4, 2]], highlight: [[1, 0]], colors: { "1,0": "#5FD79E" } }, caption: 'Counter("mississippi"): top row items, bottom row counts. m is the only char with count 1 -> first unique.' },
        { type: "h3", text: "2.2 Top-K frequent elements" },
        { type: "p", text: `Problem: return the k most frequent elements. The naive approach counts, then sorts the counts in O(n log n). But because frequencies are bounded by n, bucket sort gives O(n).` },
        { type: "code", code: `from collections import Counter\n\ndef top_k_frequent(nums, k):\n    counts = Counter(nums)\n    # buckets[f] = list of values that appear exactly f times\n    buckets = [[] for _ in range(len(nums) + 1)]\n    for val, freq in counts.items():\n        buckets[freq].append(val)\n    result = []\n    for freq in range(len(buckets) - 1, 0, -1):   # high freq first\n        for val in buckets[freq]:\n            result.append(val)\n            if len(result) == k:\n                return result\n    return result` },
        { type: "p", text: `A frequency can be at most n (an element can appear at most n times), so a list of n + 1 buckets indexed by frequency captures every possibility. Walking it from high to low yields elements in descending frequency order without ever sorting — O(n) time, O(n) space.` },
        { type: "callout", text: `Bucket sort by frequency is the standard trick when the key you'd sort on is bounded by n. It converts an O(n log n) sort into an O(n) scan. The same idea powers "sort characters by frequency" and "H-index".` }
      ]
    },
    {
      heading: "3. Pattern B: complement search (two-sum family)",
      blocks: [
        { type: "p", text: `Complement search is the defining array-and-hashing pattern. You walk the array once, and for each element you ask "is the value I need to complete a target already in my map?". The map stores what you've seen so far; the lookup is O(1).` },
        { type: "h3", text: "3.1 Two Sum" },
        { type: "p", text: `Problem: return indices of the two numbers that add up to target. The brute force is O(n²). Hashing makes it O(n): for each x, the number that completes the pair is target - x, and a dict from value to index tells us in O(1) whether we've already seen it.` },
        { type: "code", code: `def two_sum(nums, target):\n    seen = {}                       # value -> index\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i                 # store AFTER checking\n    return []` },
        { type: "callout", text: `Store after you check, not before. If you insert nums[i] into the map first and then look for the complement, an element can pair with itself (e.g. target = 6, nums[i] = 3 finds its own index). Checking first guarantees the complement came from an earlier, distinct index.` },
        { type: "diagram", kind: "array", data: { values: [2, 7, 11, 15], pointers: [{ name: "i", index: 1, color: "#6FA8FF" }], highlight: [0, 1], labels: { "0": "need=9-7=2 seen", "1": "x=7" } }, caption: "Two Sum, target=9: at i=1 the complement 2 is already in the map, so return [0, 1]." },
        { type: "h3", text: "3.2 Why a dict and not a set" },
        { type: "p", text: `If the problem only asked "does such a pair exist?" a set would do (section 1.1). Because Two Sum wants the indices, we need the value-to-index mapping a dict provides. This is the dict-vs-set decision from 1.2 in action: store exactly the extra data the answer requires.` },
        { type: "h3", text: "3.3 The wider family" },
        {
          type: "table",
          headers: ["Problem", "Complement / key idea"],
          rows: [
            ["Two Sum", "Look for target - x in a value->index map"],
            ["Two Sum II (sorted)", "Use two pointers instead — O(1) space, exploits order"],
            ["3Sum", "Fix one element, then complement-search the rest (or sort + two pointers)"],
            ["4Sum / kSum", "Recurse down to 2Sum at the base; hashing or two pointers there"],
            ["Pair with given difference", "Look for x + k or x - k in a seen set"],
            ["Count pairs summing to target", "Map value -> count; add counts[target - x] before inserting x"]
          ]
        },
        { type: "p", text: `Note the recurring branch: if the array is unsorted and you want O(n), hash. If it is (or can be) sorted and you want O(1) extra space, two pointers. They solve the same family from opposite trade-offs.` }
      ]
    },
    {
      heading: "4. Pattern C: grouping by a canonical key",
      blocks: [
        { type: "p", text: `Many problems ask you to bucket items that are "the same" under some equivalence. The trick is to compute a canonical key — a representation that's identical for all equivalent items — and use it as a dict key. Anagrams are the textbook case.` },
        { type: "h3", text: "4.1 Group Anagrams" },
        { type: "p", text: `Problem: group strings that are anagrams of each other. Two strings are anagrams iff they have the same multiset of characters, so any canonical form of that multiset works as the key.` },
        { type: "code", code: `from collections import defaultdict\n\ndef group_anagrams(strs):\n    groups = defaultdict(list)\n    for s in strs:\n        key = ''.join(sorted(s))          # canonical: sorted letters\n        groups[key].append(s)\n    return list(groups.values())` },
        { type: "p", text: `Sorting each string costs O(L log L) for a string of length L, giving O(n · L log L) overall. We can do better with a count-based key.` },
        { type: "h3", text: "4.2 Char-count tuple key (avoiding the sort)" },
        { type: "p", text: `Instead of sorting, build a length-26 count vector and use it as the key. A list isn't hashable, so convert it to a tuple. This drops the per-string cost to O(L).` },
        { type: "code", code: `from collections import defaultdict\n\ndef group_anagrams(strs):\n    groups = defaultdict(list)\n    for s in strs:\n        count = [0] * 26\n        for ch in s:\n            count[ord(ch) - ord('a')] += 1\n        groups[tuple(count)].append(s)        # tuple is hashable\n    return list(groups.values())` },
        { type: "callout", text: `tuple(count) is the key move. A list can't be a dict key (it's mutable, hence unhashable); a tuple of the same values can. Converting a count vector or sorted sequence to a tuple is the standard way to make a composite, order-independent key hashable.` },
        { type: "diagram", kind: "grid", data: { cells: [["eat", "tea", "tan", "ate", "nat"], ["aet", "aet", "ant", "aet", "ant"]], highlight: [[1, 0], [1, 1], [1, 3]], colors: { "1,0": "#5FD79E", "1,1": "#5FD79E", "1,3": "#5FD79E" } }, caption: "Group Anagrams: top row inputs, bottom row canonical key (sorted letters). Equal keys land in the same bucket." },
        { type: "h3", text: "4.3 Other canonical-key problems" },
        {
          type: "ul",
          items: [
            `Valid anagram: two strings are anagrams iff Counter(a) == Counter(b) — the canonical keys are equal.`,
            `Group shifted strings: canonical key is the tuple of pairwise character differences mod 26.`,
            `Isomorphic strings: canonical key is the pattern of first-occurrence indices, e.g. "egg" -> (0, 1, 1).`,
            `Find duplicate subtrees: serialize each subtree to a string; equal serializations group duplicates.`
          ]
        }
      ]
    },
    {
      heading: "5. Pattern D: prefix sums + hashing",
      blocks: [
        { type: "p", text: `A prefix sum is the running total P[i] = nums[0] + ... + nums[i-1]. The sum of any subarray nums[i:j] equals P[j] - P[i]. Combining prefix sums with a hash map of "prefix sums seen so far" answers a whole class of subarray problems in O(n).` },
        { type: "h3", text: "5.1 The key identity" },
        { type: "p", text: `For a target k, a subarray ending at index j sums to k exactly when there exists an earlier prefix P[i] = P[j] - k. So as we sweep j, we keep a map of prefix-sum -> how many times it has occurred, and at each step we look up P[j] - k.` },
        { type: "h3", text: "5.2 Subarray Sum Equals K" },
        { type: "p", text: `Problem: count the number of contiguous subarrays whose sum equals k. Works with negatives, so a sliding window won't do — but prefix sums plus a count map will.` },
        { type: "code", code: `from collections import defaultdict\n\ndef subarray_sum(nums, k):\n    count = 0\n    prefix = 0\n    seen = defaultdict(int)\n    seen[0] = 1                     # empty prefix: sum 0 occurs once\n    for x in nums:\n        prefix += x\n        count += seen[prefix - k]   # subarrays ending here that sum to k\n        seen[prefix] += 1\n    return count` },
        { type: "callout", text: `seen[0] = 1 is the bug that bites everyone. It seeds the "empty prefix" so a subarray that starts at index 0 and itself sums to k is counted. Forget it and you undercount every subarray that begins at the start of the array.` },
        { type: "diagram", kind: "array", data: { values: [1, 4, 6, 9, 11], window: [1, 3], labels: { "0": "P0", "1": "P1", "4": "P4" } }, caption: "Prefix sums of [1,3,2,3,2], k=5: P3 - P1 = 9 - 4 = 5, so the subarray [2,3] (indices 1..2) sums to k." },
        { type: "h3", text: "5.3 The same engine, retuned" },
        {
          type: "table",
          headers: ["Problem", "What the map stores / lookup"],
          rows: [
            ["Subarray sum == k", "map: prefix_sum -> count; look up prefix - k"],
            ["Longest subarray sum == k", "map: prefix_sum -> earliest index; len = j - first[prefix - k]"],
            ["Subarray sum divisible by k", "map: (prefix mod k) -> count/first index"],
            ["Contiguous array (equal 0s and 1s)", "treat 0 as -1; longest subarray with sum 0"],
            ["Subarrays with k distinct (atMost trick)", "atMost(k) - atMost(k-1) with a count window"]
          ]
        },
        { type: "p", text: `The shared structure: transform the array into a running quantity (sum, sum mod k, +1/-1 balance), then use a hash map keyed on that quantity. For counting problems store frequencies; for longest/shortest problems store the first index a value appeared.` },
        { type: "h3", text: "5.4 Contiguous Array (worked transform)" },
        { type: "code", code: `def find_max_length(nums):\n    # equal number of 0s and 1s  <=>  +1/-1 balance returns to a prior value\n    first = {0: -1}               # balance 0 first seen "before" index 0\n    balance = 0\n    best = 0\n    for i, x in enumerate(nums):\n        balance += 1 if x == 1 else -1\n        if balance in first:\n            best = max(best, i - first[balance])\n        else:\n            first[balance] = i    # store earliest index only\n    return best` },
        { type: "diagram", kind: "array", data: { values: [-1, 0, -1, 0, 1, 0], window: [1, 4], labels: { "0": "0->-1", "4": "balance 0" } }, caption: "Contiguous Array [0,1,0,1,1,0] as +1/-1 balance: balance returns to 0 at index 4 (first seen at -1) -> span of length 4." },
        { type: "p", text: `Storing the earliest index (and never overwriting it) is what makes the subtraction i - first[balance] the longest possible span. This "first index only" rule is the longest-subarray counterpart to the "count" rule in 5.2.` }
      ]
    },
    {
      heading: "6. Pattern E: seen-sets for dedup and sequences",
      blocks: [
        { type: "p", text: `A bare set — no values, just membership — solves a surprising range of problems: deduplication, cycle / repeat detection, and clever O(n) sequence problems where the set lets you test "is x's neighbour present?" in O(1).` },
        { type: "h3", text: "6.1 Longest Consecutive Sequence" },
        { type: "p", text: `Problem: given an unsorted array, find the length of the longest run of consecutive integers. Sorting gives O(n log n); a set gives O(n).` },
        { type: "code", code: `def longest_consecutive(nums):\n    num_set = set(nums)\n    best = 0\n    for x in num_set:\n        if x - 1 not in num_set:        # x is the START of a run\n            length = 1\n            while x + length in num_set:\n                length += 1\n            best = max(best, length)\n    return best` },
        { type: "callout", text: `The 'x - 1 not in num_set' guard is what keeps this O(n), not O(n²). Only run-starts trigger the inner while-loop, so each element is visited by the while-loop at most once across the whole algorithm. Drop the guard and every element re-walks its run — back to quadratic.` },
        { type: "diagram", kind: "array", data: { values: [100, 4, 200, 1, 3, 2], pointers: [{ name: "start", index: 3, color: "#E0A23B" }], highlight: [1, 3, 4, 5] }, caption: "Longest Consecutive in [100,4,200,1,3,2]: only 1 is a run-start (0 absent); it walks 1->2->3->4, length 4." },
        { type: "h3", text: "6.2 Cycle / repeat detection" },
        { type: "p", text: `Whenever a process can repeat a state (Happy Number, linked-list cycle by value, "have we been here before?"), a seen-set detects the loop: if you're about to enter a state already in the set, you've found a cycle.` },
        { type: "code", code: `def is_happy(n):\n    def squares(x):\n        return sum(int(d) ** 2 for d in str(x))\n    seen = set()\n    while n != 1 and n not in seen:\n        seen.add(n)\n        n = squares(n)\n    return n == 1                  # exited because n hit 1, not a cycle` },
        { type: "h3", text: "6.3 Set algebra on arrays" },
        { type: "p", text: `Python's set operators express intersection, union, and difference directly — far cleaner than hand-rolled loops, and each is O(n).` },
        { type: "code", code: `a, b = set(nums1), set(nums2)\na & b      # intersection: elements in both\na | b      # union: elements in either\na - b      # difference: in a but not b\na ^ b      # symmetric difference: in exactly one\n\ndef intersection(nums1, nums2):\n    return list(set(nums1) & set(nums2))` },
        { type: "p", text: `For Intersection of Two Arrays II (keep duplicates), set algebra loses the multiplicity, so fall back to Counter: (Counter(nums1) & Counter(nums2)) takes element-wise minimums and preserves counts.` }
      ]
    },
    {
      heading: "7. Pattern F: index maps",
      blocks: [
        { type: "p", text: `An index map stores value -> last (or first) index seen. It powers problems about distance between equal elements and is the backbone of sliding-window dedup.` },
        { type: "h3", text: "7.1 Contains Duplicate II (within distance k)" },
        { type: "p", text: `Problem: is there a pair of equal values whose indices differ by at most k? Map each value to its most recent index and check the gap.` },
        { type: "code", code: `def contains_nearby_duplicate(nums, k):\n    last = {}                       # value -> most recent index\n    for i, x in enumerate(nums):\n        if x in last and i - last[x] <= k:\n            return True\n        last[x] = i                 # overwrite with the nearer index\n    return False` },
        { type: "p", text: `Note we overwrite last[x] every time. For nearest-duplicate questions you always want the most recent index, the opposite of the longest-subarray rule (5.4) where you preserve the earliest. Choosing first-vs-last index is a decision you make per problem.` },
        { type: "h3", text: "7.2 Longest substring without repeating characters" },
        { type: "p", text: `An index map turns the sliding-window dedup into O(n): when you hit a repeat, jump the window's left edge just past the previous occurrence.` },
        { type: "code", code: `def length_of_longest_substring(s):\n    last = {}                       # char -> last index\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1     # jump past the duplicate\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best` },
        { type: "callout", text: `The 'last[ch] >= left' guard matters: a repeat that occurred before the current window's left edge is stale and must be ignored, otherwise left would jump backwards and the window would corrupt.` }
      ]
    },
    {
      heading: "8. Pattern G: in-place marking (the array as a hash table)",
      blocks: [
        { type: "p", text: `When the values are constrained to the range [1..n] (or [0..n-1]) and the array has length n, you don't need a separate hash set — the array's own indices form a perfect hash. You encode "I've seen value v" by marking position v, using either the sign bit or cyclic placement. This achieves O(1) extra space.` },
        { type: "h3", text: "8.1 Sign-marking: Find All Numbers Disappeared" },
        { type: "p", text: `Problem: array of n integers in [1..n], some appear twice and some are missing; return the missing ones. Mark "value v is present" by negating nums[v - 1].` },
        { type: "code", code: `def find_disappeared_numbers(nums):\n    for x in nums:\n        idx = abs(x) - 1            # abs: x may already be negated\n        if nums[idx] > 0:\n            nums[idx] = -nums[idx]  # mark v=idx+1 as seen\n    missing = []\n    for i, x in enumerate(nums):\n        if x > 0:                   # never marked -> i+1 never appeared\n            missing.append(i + 1)\n    return missing` },
        { type: "callout", text: `Always index with abs(x) - 1, not x - 1. By the time you read a later element it may already have been negated by an earlier mark; abs() recovers the original magnitude. Forgetting abs() is the classic in-place-marking bug.` },
        { type: "diagram", kind: "array", data: { values: [4, 3, 2, 7, 8, 2, 3, 1], labels: { "0": "before" } }, caption: "Find Disappeared, before marking: [4,3,2,7,8,2,3,1] in range [1..8]." },
        { type: "diagram", kind: "array", data: { values: [-4, -3, -2, -7, 8, 2, -3, -1], highlight: [4, 5], labels: { "4": "5 missing", "5": "6 missing" } }, caption: "After marking: slots 4 and 5 stayed positive -> values 5 and 6 never appeared." },
        { type: "h3", text: "8.2 Find the Duplicate via sign-marking" },
        { type: "code", code: `def find_duplicate_marking(nums):\n    # nums has n+1 ints in [1..n]; one value repeats\n    for x in nums:\n        idx = abs(x)\n        if nums[idx] < 0:           # idx already marked -> idx is the dup\n            return idx\n        nums[idx] = -nums[idx]\n    return -1` },
        { type: "p", text: `If mutating the input is forbidden, Floyd's cycle detection (treating nums as a linked list where i -> nums[i]) finds the duplicate in O(n) time and O(1) space without touching the array. Mention both options in an interview.` },
        { type: "h3", text: "8.3 First Missing Positive (cyclic placement)" },
        { type: "p", text: `Problem: find the smallest missing positive integer in O(n) time, O(1) space. The answer is in [1..n+1]. Place each value v in slot v-1 by swapping, then scan for the first slot holding the wrong value.` },
        { type: "code", code: `def first_missing_positive(nums):\n    n = len(nums)\n    for i in range(n):\n        # put nums[i] at its correct slot, if it's in range and not already there\n        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:\n            v = nums[i]\n            nums[i], nums[v - 1] = nums[v - 1], nums[i]\n    for i in range(n):\n        if nums[i] != i + 1:\n            return i + 1\n    return n + 1` },
        { type: "p", text: `The while-loop looks quadratic but isn't: each swap places one value into its final slot, so there are at most n swaps total across the whole outer loop — O(n). The condition nums[nums[i] - 1] != nums[i] prevents an infinite swap loop when duplicates would otherwise ping-pong.` },
        { type: "callout", text: `In-place marking only applies when values live in a known range tied to the array length. If the values can be arbitrary, fall back to a real hash set. Always confirm the [1..n] (or [0..n-1]) constraint before reaching for this pattern.` }
      ]
    },
    {
      heading: "9. Hashing pitfalls",
      blocks: [
        { type: "h3", text: "9.1 Mutable / unhashable keys" },
        { type: "p", text: `Only hashable objects can be dict keys or set elements. Immutable built-ins (int, str, tuple of hashables, frozenset) are hashable; mutable ones (list, dict, set) are not, because their hash could change after insertion and break the table.` },
        { type: "code", code: `seen = set()\nseen.add([1, 2])        # TypeError: unhashable type: 'list'\nseen.add((1, 2))        # OK: tuples are hashable\nseen.add(frozenset({1, 2}))   # OK: frozenset for order-independent keys\n\n# Need a list-like key? Convert first:\nkey = tuple(my_list)          # ordered key\nkey = frozenset(my_list)      # order-independent key (loses duplicates!)` },
        { type: "p", text: `frozenset as a key is order-independent but collapses duplicates — use a tuple of sorted elements (or a Counter-derived tuple) when multiplicity matters. This is exactly the tuple(count) trick from 4.2.` },
        { type: "h3", text: "9.2 Worst-case collisions" },
        { type: "p", text: `Hash-table operations are O(1) on average, not worst case. If many keys hash to the same bucket, lookups degrade toward O(n). Python's randomized string hashing makes this practically irrelevant for interviews, but it's why guarantees are stated as "average" or "amortized". If a problem needs a hard worst-case bound, a balanced tree (O(log n) guaranteed) may be required instead.` },
        { type: "h3", text: "9.3 Don't rely on iteration order for logic" },
        { type: "p", text: `Since Python 3.7 dicts preserve insertion order, and that's a language guarantee you can use deliberately (e.g. LRU-style ordering). But sets have no order guarantee at all — never assume the iteration order of a set. And reordering does not mean sorted: insertion order is not value order. If you need sorted output, call sorted() explicitly.` },
        { type: "code", code: `s = {3, 1, 2}\nlist(s)                 # order is arbitrary, do NOT depend on it\nsorted(s)               # [1, 2, 3]  <- the only way to get value order\n\nd = {}\nd['b'] = 1; d['a'] = 2\nlist(d)                 # ['b', 'a']  insertion order, NOT sorted` },
        { type: "h3", text: "9.4 Subtler gotchas" },
        {
          type: "ul",
          items: [
            `True == 1 and False == 0, and hash(True) == hash(1). So {1: 'a', True: 'b'} is a one-key dict {1: 'b'}. Beware mixing bools and ints as keys.`,
            `Floating-point keys: 0.1 + 0.2 != 0.3, so float-valued keys can miss. Prefer integer or string keys when possible.`,
            `Mutating a dict/set while iterating over it raises RuntimeError. Iterate over a list(d) snapshot if you must modify during the loop.`,
            `Counter(missing) is 0, but plain dict[missing] raises KeyError — use .get(key, default) or defaultdict to avoid guards.`
          ]
        }
      ]
    },
    {
      heading: "10. Complexity & space trade-offs",
      blocks: [
        { type: "p", text: `Hashing is the canonical time-for-space trade. The question to answer for any solution: is the O(n) extra space worth the speedup, or does the problem forbid it?` },
        {
          type: "table",
          headers: ["Approach", "Time", "Extra space", "When to prefer"],
          rows: [
            ["Brute force nested loop", "O(n^2)", "O(1)", "n tiny; or space is hard-forbidden and no in-place trick"],
            ["Hash set / map", "O(n)", "O(n)", "Default for unsorted arrays needing membership/lookup"],
            ["Sort + two pointers", "O(n log n)", "O(1)*", "Output needs order, or O(1) space required, dups OK"],
            ["In-place marking", "O(n)", "O(1)", "Values in [1..n]; mutation of input allowed"],
            ["Bucket sort by frequency", "O(n)", "O(n)", "Sort key bounded by n (top-K, sort-by-count)"]
          ]
        },
        { type: "p", text: `*Sort is O(1) extra only if you may sort the input in place; otherwise the sort needs O(n). The four levers you trade between are time, space, mutability-of-input, and whether order is needed in the output — every choice above moves along those axes.` },
        { type: "callout", text: `In interviews, state the trade explicitly: "the hash set buys O(n) time for O(n) space; if you forbid extra space and let me sort/mutate the input, I can do it in O(1) extra with in-place marking." Naming the trade-off scores points even before you code.` }
      ]
    },
    {
      heading: "11. Common bugs & study plan",
      blocks: [
        { type: "h3", text: "11.1 Common bugs" },
        {
          type: "table",
          headers: ["Bug", "Symptom", "Fix"],
          rows: [
            ["Two Sum: insert before checking complement", "Element pairs with itself", "seen[x] = i AFTER the complement lookup"],
            ["Subarray-sum: missing seen[0] = 1", "Undercounts subarrays starting at index 0", "Seed the empty prefix: seen[0] = 1"],
            ["Sign-marking with x-1 instead of abs(x)-1", "Wrong index after earlier negation", "Index with abs(x) - 1 / abs(x)"],
            ["Longest-consecutive without the start guard", "Silent O(n^2) blowup", "Only expand runs where x - 1 not in set"],
            ["List used as dict/set key", "TypeError: unhashable type: 'list'", "Convert to tuple / frozenset first"],
            ["Assuming set/dict iteration is sorted", "Wrong order in output", "Call sorted() explicitly"],
            ["KeyError on first increment", "Crash on missing key", "Use Counter / defaultdict(int) / .get"],
            ["Index map: first vs last index confusion", "Wrong span or missed near-duplicate", "Earliest index for longest span; latest for nearest dup"],
            ["Mutating dict/set during iteration", "RuntimeError: changed size during iteration", "Iterate over list(d) snapshot"],
            ["frozenset key when duplicates matter", "Distinct multisets collide", "Use tuple(sorted(...)) or count-tuple instead"]
          ]
        },
        { type: "h3", text: "11.2 Study plan — classic problems by pattern" },
        {
          type: "table",
          headers: ["Problem", "Pattern it teaches"],
          rows: [
            ["Contains Duplicate", "set membership / dedup (Pattern A & E)"],
            ["Valid Anagram", "frequency equality via Counter (Pattern A/C)"],
            ["Two Sum", "complement search with value->index map (Pattern B)"],
            ["Group Anagrams", "canonical key (sorted str or count-tuple) (Pattern C)"],
            ["Top K Frequent Elements", "count map + bucket sort by frequency (Pattern A)"],
            ["Product of Array Except Self", "prefix/suffix products (prefix-array thinking)"],
            ["Encode and Decode Strings", "length-prefixed serialization (array/string design)"],
            ["Longest Consecutive Sequence", "seen-set + run-start guard (Pattern E)"],
            ["Subarray Sum Equals K", "prefix sum + count map, seen[0]=1 (Pattern D)"],
            ["Contiguous Array", "+1/-1 transform + first-index map (Pattern D)"],
            ["Contains Duplicate II", "value->last-index map within distance k (Pattern F)"],
            ["Longest Substring Without Repeating", "index map sliding window (Pattern F)"],
            ["Find All Numbers Disappeared in an Array", "in-place sign marking (Pattern G)"],
            ["Find the Duplicate Number", "sign marking or Floyd's cycle (Pattern G)"],
            ["First Missing Positive", "cyclic in-place placement (Pattern G)"]
          ]
        },
        { type: "p", text: `Work them roughly top to bottom: the first five cement the core map/set/Counter reflexes, the middle group builds prefix-sum and index-map intuition, and the last three drill the harder in-place O(1)-space tricks that distinguish strong candidates.` }
      ]
    },
    {
      heading: "12. One-page cheat sheet",
      blocks: [
        { type: "h3", text: "12.1 Trigger -> pattern" },
        {
          type: "table",
          headers: ["When you see...", "Reach for..."],
          rows: [
            ["'duplicate', 'unique', 'most common', 'appears k times'", "Frequency count: Counter / dict (Pattern A)"],
            ["'two numbers that sum to', 'pair with difference'", "Complement search: target - x in seen map (Pattern B)"],
            ["'group', 'anagram', 'same after transform'", "Canonical key dict: sorted str / count-tuple (Pattern C)"],
            ["'subarray sum equals / divisible by k'", "Prefix sum + hash map; seed seen[0]=1 (Pattern D)"],
            ["'longest run', 'consecutive', 'seen before / cycle'", "Seen-set; run-start guard for O(n) (Pattern E)"],
            ["'within distance k', 'longest without repeating'", "Index map value->index; sliding window (Pattern F)"],
            ["'values in [1..n]', 'O(1) extra space', 'missing/duplicate'", "In-place sign / cyclic marking (Pattern G)"],
            ["'intersection / union of arrays'", "set algebra: & | - ^ ; Counter for multiplicity (Pattern E)"],
            ["'k most frequent', 'sort by count'", "Count map + bucket sort by frequency (Pattern A)"]
          ]
        },
        { type: "h3", text: "12.2 Quick API reference" },
        { type: "code", code: `from collections import Counter, defaultdict\n\nCounter(iterable)            # frequency map; missing key -> 0\nCounter(...).most_common(k)  # k highest-count (value, count) pairs\nCounter(a) & Counter(b)      # elementwise min (multiset intersection)\nCounter(a) - Counter(b)      # elementwise subtract (keeps positives)\n\ndefaultdict(int)             # missing -> 0\ndefaultdict(list)            # missing -> []\ndefaultdict(set)             # missing -> set()\n\nd.get(key, default)          # safe read, no KeyError\nkey in d / key in s          # O(1) average membership\n\nset(a) & set(b)              # intersection (drops duplicates)\nset(a) | set(b)              # union\nset(a) - set(b)              # difference\ntuple(sorted(x))             # hashable, order-independent multiset key` }
      ]
    }
  ],
  cheatsheet: [
    `Reflex: any nested loop asking "have I seen / does the match exist?" -> replace the inner scan with a set/dict for O(1) lookup, turning O(n^2) into O(n).`,
    `dict vs set: set for pure membership; dict when you need the value (index/count/list); Counter for frequencies; defaultdict to skip first-touch guards.`,
    `Two Sum: seen[value]=index, check target-x BEFORE inserting x so nothing pairs with itself.`,
    `Group by canonical key: anagrams -> ''.join(sorted(s)) or tuple of 26 counts (a list isn't hashable; a tuple is).`,
    `Prefix sum + map: count subarrays summing to k via seen[prefix-k]; SEED seen[0]=1. Store counts for "how many", earliest index for "longest".`,
    `Seen-set sequences: Longest Consecutive only expands runs where x-1 not in set (keeps it O(n)); seen-set also detects cycles (Happy Number).`,
    `Index map: value->latest index for "within distance k"; value->index sliding window for longest-substring-without-repeat (guard last[ch] >= left).`,
    `In-place marking for values in [1..n]: negate nums[abs(x)-1] to mark seen (always abs!); or cyclic-swap each value to slot v-1 for First Missing Positive — O(1) space.`,
    `set algebra: & | - ^ for intersection/union/difference; switch to Counter when duplicate multiplicity must be preserved.`,
    `Pitfalls: lists/dicts unhashable (use tuple/frozenset); set iteration order is undefined and never sorted (call sorted()); True==1 collides as a key; don't mutate a dict/set while iterating it.`,
    `Trade-off to state aloud: hash = O(n) time for O(n) space; if extra space is forbidden and input may be sorted/mutated, use two pointers or in-place marking for O(1) extra.`
  ]
}
