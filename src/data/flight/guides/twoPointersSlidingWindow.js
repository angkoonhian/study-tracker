export default {
  id: "two-pointers-sliding-window",
  title: "Two Pointers & Sliding Window",
  subtitle: "Two coordinated indices that turn O(n²) brute force into a single O(n) sweep.",
  emoji: "",
  intro: `Two pointers and sliding window are the same idea seen from two angles: instead of re-scanning the array from scratch for every candidate, you maintain a small amount of state and move one or two indices across the data exactly once. The payoff is dropping a nested-loop O(n²) solution down to O(n) time and usually O(1) extra space.

"Two pointers" is the umbrella term for any algorithm driven by two indices. They come in three flavors: pointers starting at opposite ends and moving toward each other (works on sorted data or symmetric problems like palindromes), pointers moving in the same direction at different speeds (in-place array surgery, cycle detection), and a pair of cursors walking two separate sorted sequences (merging).

"Sliding window" is a specialization of same-direction two pointers for contiguous subarrays/substrings. A window [left, right] expands by advancing right and contracts by advancing left. The art is knowing when to expand and when to contract so that every element enters and leaves the window at most once — that amortized "each element touched O(1) times" is what guarantees O(n).

The hardest part of these problems is rarely the code; it is recognizing the trigger. This guide gives you reusable templates, worked examples with correct Python, the monotonicity argument for why windows work, a common-bugs table, and a study plan. Internalize the two window templates and most "subarray/substring with property X" problems become fill-in-the-blank.`,
  sections: [
    {
      heading: "1. When to reach for these patterns",
      blocks: [
        { type: "p", text: `Before writing any code, scan the problem statement for the signals below. Two pointers and sliding window are pattern-matched, not derived from scratch each time.` },
        { type: "h3", text: "1.1 Trigger phrases" },
        { type: "ul", items: [
          `"contiguous subarray" or "substring" + an optimization ("longest", "shortest", "max sum", "count") → sliding window.`,
          `"sorted array" + "find a pair / triple summing to target" → opposite-ends two pointers (sort first if not sorted).`,
          `"in place", "O(1) extra space", "remove/move/partition elements" → same-direction (slow/fast) two pointers.`,
          `"palindrome", "reverse", "is symmetric" → opposite-ends pointers.`,
          `"merge two sorted ...", "intersection of two sorted ..." → dual-cursor two pointers.`,
          `"linked list cycle", "middle of list", "nth from end" → fast/slow pointers (Floyd).`,
        ]},
        { type: "callout", text: `Decision rule of thumb: if the answer is a contiguous range and the constraint is monotone (making the window bigger can only make it "more invalid"), use sliding window. If the array is sorted (or you can afford to sort) and you need a pair/triple, use opposite-ends two pointers. If you must rearrange elements without extra memory, use slow/fast.` },
        { type: "table", headers: ["Brute force you'd otherwise write", "Replace with", "New cost"], rows: [
          ["Nested loop testing all pairs in sorted array", "Opposite-ends two pointers", "O(n)"],
          ["Recompute sum/freq for every subarray", "Sliding window", "O(n)"],
          ["Build a new array then copy back", "Slow/fast in-place rewrite", "O(n) time, O(1) space"],
          ["Sort/merge by repeatedly scanning both lists", "Dual-cursor merge", "O(m+n)"],
        ]},
      ],
    },
    {
      heading: "2. Opposite-ends two pointers",
      blocks: [
        { type: "p", text: `Place one pointer at index 0 (left) and one at index n-1 (right). At each step inspect the pair, decide which pointer to move inward, and stop when they cross. The key is that moving a pointer must eliminate exactly the candidates you can prove are useless, so you never miss the answer.` },
        { type: "h3", text: "2.1 Two-sum on a sorted array" },
        { type: "p", text: `Because the array is sorted, the sum left+right tells you which way to move: too small → advance left (increase sum); too big → retreat right (decrease sum). Each move discards one element that can never participate in a valid pair, so the scan is O(n).` },
        { type: "code", code: `def two_sum_sorted(nums, target):
    """Return 1-based indices (i, j) with nums[i]+nums[j]==target, or None."""
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return (left + 1, right + 1)
        if s < target:
            left += 1          # need a bigger sum
        else:
            right -= 1         # need a smaller sum
    return None` },
        { type: "diagram", kind: "array", data: {
          values: [1, 3, 4, 6, 8, 11],
          pointers: [{ name: "L", index: 0, color: "#6FA8FF" }, { name: "R", index: 5, color: "#5FD79E" }],
          highlight: [0, 5]
        }, caption: "Sorted two-sum, target 10: 1+11=12 > target, so move R inward (decrease the sum). If the sum were too small, move L." },
        { type: "callout", text: `Why correct: suppose nums[left]+nums[right] < target. Then nums[left] paired with anything <= nums[right] is also too small, so nums[left] can be safely dropped — advancing left loses no valid pair. The symmetric argument justifies right -= 1.` },
        { type: "h3", text: "2.2 Container with most water" },
        { type: "p", text: `Heights are walls; area = width * min(height[left], height[right]). Width shrinks as pointers converge, so to have any hope of a larger area you must raise the limiting (shorter) wall. Always move the pointer at the shorter wall inward.` },
        { type: "code", code: `def max_area(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        h = min(height[left], height[right])
        best = max(best, h * (right - left))
        if height[left] < height[right]:
            left += 1          # move away from the shorter wall
        else:
            right -= 1
    return best` },
        { type: "diagram", kind: "array", data: {
          values: [1, 8, 6, 2, 5, 4, 8, 3, 7],
          pointers: [{ name: "L", index: 0, color: "#6FA8FF" }, { name: "R", index: 8, color: "#5FD79E" }],
          highlight: [0, 8],
          labels: { "0": "h=1", "8": "h=7" }
        }, caption: "Container with most water: area = width(8) * min(1,7) = 8. The left wall (1) is shorter, so move L inward — raising the limiting wall is the only way to grow area." },
        { type: "h3", text: "2.3 Valid palindrome (skipping non-alphanumerics)" },
        { type: "code", code: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True` },
        { type: "h3", text: "2.4 Trapping rain water" },
        { type: "p", text: `Water above index i is min(maxLeft, maxRight) - height[i]. Two pointers track running maxes from both sides. Process whichever side has the smaller running max, because that side's water level is fully determined (the taller side guarantees a wall at least that high exists).` },
        { type: "code", code: `def trap(height):
    if not height:
        return 0
    left, right = 0, len(height) - 1
    left_max, right_max = height[left], height[right]
    water = 0
    while left < right:
        if left_max <= right_max:
            left += 1
            left_max = max(left_max, height[left])
            water += left_max - height[left]
        else:
            right -= 1
            right_max = max(right_max, height[right])
            water += right_max - height[right]
    return water` },
        { type: "callout", text: `Trapping rain water also has an O(n)/O(n) prefix-max + suffix-max solution and an O(n)/O(n) monotonic-stack solution. The two-pointer version above is O(n) time and O(1) space — know it for follow-ups asking to reduce space.` },
      ],
    },
    {
      heading: "3. Same-direction (slow/fast) two pointers",
      blocks: [
        { type: "p", text: `Both pointers start near the front and move forward. "slow" marks the boundary of the finished region (the next write position); "fast" scans ahead reading candidates. This is the workhorse for in-place array compaction at O(1) extra space.` },
        { type: "h3", text: "3.1 Remove duplicates from a sorted array in place" },
        { type: "code", code: `def remove_duplicates(nums):
    """In-place; returns new logical length k. nums[:k] holds the uniques."""
    if not nums:
        return 0
    slow = 0                       # last written unique
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    return slow + 1` },
        { type: "diagram", kind: "array", data: {
          values: [1, 1, 2, 2, 3, 4],
          pointers: [{ name: "slow", index: 1, color: "#5FD79E" }, { name: "fast", index: 4, color: "#6FA8FF" }],
          highlight: [4],
          labels: { "1": "write", "4": "read" }
        }, caption: "Remove duplicates: slow marks the last written unique (the write cursor); fast scans ahead. When nums[fast] differs from nums[slow], advance slow and copy. nums[:slow+1] holds the uniques." },
        { type: "h3", text: "3.2 Move zeroes to the end (keep order)" },
        { type: "code", code: `def move_zeroes(nums):
    slow = 0                       # next slot for a non-zero
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    return nums` },
        { type: "diagram", kind: "array", data: {
          values: [1, 0, 3, 0, 5, 0],
          pointers: [{ name: "slow", index: 1, color: "#5FD79E" }, { name: "fast", index: 2, color: "#6FA8FF" }],
          highlight: [1],
          labels: { "1": "next non-zero slot" }
        }, caption: "Move zeroes: slow points at the next slot for a non-zero. fast scans; on each non-zero it swaps into slow and advances slow. Everything left of slow is already compacted non-zeros." },
        { type: "h3", text: "3.3 Partition (Dutch-national-flag style)" },
        { type: "p", text: `Generalizes the slow/fast idea to three regions. Useful for sort-colors (0/1/2) and as the partition step of quicksort.` },
        { type: "code", code: `def sort_colors(nums):
    """Sort an array of 0s, 1s, 2s in one pass. low/mid/high pointers."""
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:                       # nums[mid] == 2
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1               # do NOT advance mid: swapped-in value unseen
    return nums` },
        { type: "callout", text: `Common slip in sort-colors: after swapping with high you must NOT increment mid, because the value you just pulled from the back hasn't been examined yet. After swapping with low you DO increment both, because low <= mid means the swapped-in value was already classified.` },
      ],
    },
    {
      heading: "4. Dual-cursor two pointers on two sequences",
      blocks: [
        { type: "p", text: `When you have two already-sorted inputs, walk a cursor through each and advance whichever points at the smaller element. This underlies merge sort's merge step, sorted-list intersection, and "merge two sorted arrays" interview questions.` },
        { type: "h3", text: "4.1 Merge two sorted arrays into a new array" },
        { type: "code", code: `def merge_sorted(a, b):
    i, j = 0, 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:])              # one tail is empty; the other is appended
    out.extend(b[j:])
    return out` },
        { type: "h3", text: "4.2 Merge into nums1 in place (from the back)" },
        { type: "p", text: `Classic trick: when one array has trailing space, fill from the largest end so you never overwrite an unread element.` },
        { type: "code", code: `def merge_in_place(nums1, m, nums2, n):
    """nums1 has length m+n; first m entries valid, rest are padding."""
    i, j, k = m - 1, n - 1, m + n - 1
    while j >= 0:                  # once nums2 is exhausted, nums1 is already in place
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]; i -= 1
        else:
            nums1[k] = nums2[j]; j -= 1
        k -= 1
    return nums1` },
        { type: "callout", text: `Sorting first is itself the unlock for two pointers. 3Sum = sort, then for each i run a two-pointer two-sum on the suffix. The O(n log n) sort is dominated by the O(n²) scan, so sorting is "free" and lets you skip duplicates cleanly.` },
      ],
    },
    {
      heading: "5. The sliding window mental model",
      blocks: [
        { type: "p", text: `A window is a contiguous range [left, right] over the array/string. You maintain just enough aggregate state about the window (a sum, a count, a frequency map) to test in O(1) whether the window is "valid". The right pointer always marches forward; the left pointer only moves to restore validity. Because each pointer only ever increases and they never exceed n, total work is O(n).` },
        { type: "h3", text: "5.1 Three problem shapes — don't mix them up" },
        { type: "table", headers: ["Shape", "Question", "When to record answer", "Left moves..."], rows: [
          ["Longest valid window", "Max length window that stays valid", "After shrinking back to valid", "While window is INVALID (shrink to fix)"],
          ["Shortest valid window", "Min length window that is valid", "While window is valid (then shrink to seek smaller)", "While window is VALID (shrink to minimize)"],
          ["Count windows", "How many subarrays satisfy X", "Add (right-left+1) per right, or use at-most(k)-at-most(k-1)", "While window violates the bound"],
        ]},
        { type: "callout", text: `These three shapes share the expand/contract skeleton but differ in (a) the loop condition that triggers shrinking and (b) where you update the answer. Memorize which is which — putting the answer update in the wrong place is the #1 sliding-window bug.` },
        { type: "h3", text: "5.2 Why it works: monotonic feasibility" },
        { type: "p", text: `Sliding window is correct only when the validity predicate is monotone in window size for a fixed endpoint. For "longest", the property must be: if [left, right] is valid then every sub-window is valid, and if it is invalid, growing right keeps it invalid until you shrink left. That monotonicity means for each right there is a unique smallest left making the window valid, and that left only moves rightward as right advances — so we never need to re-examine earlier lefts. If the predicate is NOT monotone (e.g., "sum exactly k" with negative numbers), a plain window fails and you need prefix sums + a hash map instead.` },
        { type: "h3", text: "5.3 Amortized O(n) analysis" },
        { type: "ul", items: [
          `right advances exactly n times total (once per element).`,
          `left advances at most n times total across the whole run, because it only moves forward and is bounded by right.`,
          `Each element is added to the window once (when right passes it) and removed at most once (when left passes it) → O(1) amortized per element.`,
          `Even though there's an inner while-loop for shrinking, it is NOT nested O(n²): the inner loop's total iterations over the entire algorithm sum to <= n.`,
        ]},
      ],
    },
    {
      heading: "6. The two reusable templates",
      blocks: [
        { type: "p", text: `Burn these into muscle memory. Almost every variable-size window problem is a fill-in of Template A; every fixed-window problem is Template B.` },
        { type: "h3", text: "6.1 Template A — variable-size window (expand right, contract while invalid)" },
        { type: "code", code: `def variable_window(s):
    from collections import defaultdict
    window = defaultdict(int)      # aggregate state about current window
    left = 0
    answer = 0                     # or float('inf') for "shortest"
    for right in range(len(s)):
        # 1. EXPAND: bring s[right] into the window
        window[s[right]] += 1

        # 2. CONTRACT: shrink from the left while the window is INVALID
        while window_is_invalid(window):
            window[s[left]] -= 1
            if window[s[left]] == 0:
                del window[s[left]]
            left += 1

        # 3. RECORD: window is now valid; update the answer
        answer = max(answer, right - left + 1)   # "longest"
    return answer` },
        { type: "callout", text: `For "shortest valid window", flip the structure: expand right until VALID, then while VALID record (right-left+1) and shrink left to look for something smaller. The while-loop condition becomes "while window_is_valid" and the answer update lives inside that loop.` },
        { type: "h3", text: "6.2 Template B — fixed-size window of length k" },
        { type: "code", code: `def fixed_window(nums, k):
    window_sum = 0
    best = float('-inf')
    for right in range(len(nums)):
        window_sum += nums[right]          # add the entering element
        if right >= k - 1:
            best = max(best, window_sum)    # window [right-k+1, right] is full
            window_sum -= nums[right - k + 1]  # evict the leftmost before next step
    return best` },
        { type: "diagram", kind: "array", data: {
          values: [2, 1, 5, 1, 3, 2],
          pointers: [{ name: "evict", index: 1, color: "#E0A23B" }, { name: "R", index: 4, color: "#5FD79E" }],
          window: [2, 4],
          highlight: [2, 3, 4]
        }, caption: "Fixed window k=3: window [2,4] sum = 5+1+3 = 9. To advance, add nums[R+1] and evict nums[right-k+1] (the amber edge at index 1, just left of the window). The window size never changes." },
        { type: "callout", text: `Fixed-window off-by-one anchors: the window is complete the first time right == k-1. The element to evict for the NEXT iteration is at index right-k+1 (the current left edge). Get these two right and fixed windows never bite you.` },
      ],
    },
    {
      heading: "7. Worked window patterns (with code)",
      blocks: [
        { type: "h3", text: "7.1 Longest substring without repeating characters" },
        { type: "p", text: `Window invalid when a duplicate appears. Track last-seen index to jump left efficiently, or use a count map with the generic template. Map version shown for template consistency.` },
        { type: "code", code: `def length_of_longest_substring(s):
    from collections import defaultdict
    count = defaultdict(int)
    left = 0
    best = 0
    for right in range(len(s)):
        count[s[right]] += 1
        while count[s[right]] > 1:        # invalid: a char repeats
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best` },
        { type: "diagram", kind: "array", data: {
          values: ["a", "b", "c", "a", "b", "b"],
          pointers: [{ name: "L", index: 0, color: "#6FA8FF" }, { name: "R", index: 2, color: "#5FD79E" }],
          window: [0, 2]
        }, caption: "Snapshot 1 — \"abca...\": window [0,2] = \"abc\", all distinct and valid. R keeps expanding while no duplicate appears." },
        { type: "diagram", kind: "array", data: {
          values: ["a", "b", "c", "a", "b", "b"],
          pointers: [{ name: "L", index: 0, color: "#6FA8FF" }, { name: "R", index: 3, color: "#5FD79E" }],
          window: [0, 3],
          highlight: [0, 3]
        }, caption: "Snapshot 2 — R reaches index 3 ('a'): the window [0,3] now has a duplicate 'a' (indices 0 and 3). INVALID, so we must contract from the left." },
        { type: "diagram", kind: "array", data: {
          values: ["a", "b", "c", "a", "b", "b"],
          pointers: [{ name: "L", index: 1, color: "#6FA8FF" }, { name: "R", index: 3, color: "#5FD79E" }],
          window: [1, 3]
        }, caption: "Snapshot 3 — L advanced past the first 'a' to index 1: window [1,3] = \"bca\" is valid again. Length 3, matching the best so far. Each char enters once and leaves once → O(n)." },
        { type: "h3", text: "7.2 Minimum window substring (smallest window of s covering all of t)" },
        { type: "p", text: `A "shortest valid window" problem. need = required char counts; "have" tracks how many required chars are currently satisfied. Expand to become valid, then shrink to minimize while staying valid.` },
        { type: "code", code: `def min_window(s, t):
    from collections import Counter
    if not t or not s:
        return ""
    need = Counter(t)
    missing = len(t)               # total chars still needed (with multiplicity)
    left = 0
    best_len = float('inf')
    best_l = 0
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1              # may go negative for surplus chars
        while missing == 0:        # window is valid -> try to shrink
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_l = left
            need[s[left]] += 1
            if need[s[left]] > 0:  # we just removed a genuinely needed char
                missing += 1
            left += 1
    return "" if best_len == float('inf') else s[best_l:best_l + best_len]` },
        { type: "h3", text: "7.3 Longest repeating character replacement" },
        { type: "p", text: `You may replace at most k chars. A window is valid when (window length - count of its most frequent char) <= k, i.e. the non-majority chars can all be converted. Track the running max frequency.` },
        { type: "code", code: `def character_replacement(s, k):
    from collections import defaultdict
    count = defaultdict(int)
    left = 0
    max_freq = 0
    best = 0
    for right in range(len(s)):
        count[s[right]] += 1
        max_freq = max(max_freq, count[s[right]])
        # invalid if more than k chars would need replacing
        while (right - left + 1) - max_freq > k:
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best` },
        { type: "callout", text: `Subtlety: max_freq is never decreased when shrinking. That's fine — it can only make the window appear "valid" too generously, but since we only care about the MAX window ever seen, a stale max_freq can never produce a window longer than a legitimately achievable one. This keeps the code O(n) without rescanning the count map.` },
        { type: "h3", text: "7.4 Max consecutive ones III (flip at most k zeroes)" },
        { type: "code", code: `def longest_ones(nums, k):
    left = 0
    zeros = 0
    best = 0
    for right in range(len(nums)):
        if nums[right] == 0:
            zeros += 1
        while zeros > k:               # too many zeros to flip -> shrink
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left + 1)
    return best` },
        { type: "h3", text: "7.5 Minimum size subarray sum >= target (positive numbers)" },
        { type: "p", text: `Shortest-window shape with a running sum. Requires non-negative numbers so the sum is monotone in window size.` },
        { type: "code", code: `def min_subarray_len(target, nums):
    left = 0
    total = 0
    best = float('inf')
    for right in range(len(nums)):
        total += nums[right]
        while total >= target:         # valid -> record then shrink to seek smaller
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float('inf') else best` },
        { type: "diagram", kind: "array", data: {
          values: [2, 3, 1, 2, 4, 3],
          pointers: [{ name: "L", index: 0, color: "#6FA8FF" }, { name: "R", index: 3, color: "#5FD79E" }],
          window: [0, 3]
        }, caption: "Min subarray sum, target 7: expand R until sum 2+3+1+2 = 8 >= 7. Window [0,3] is now VALID — record length 4, then try to shrink." },
        { type: "diagram", kind: "array", data: {
          values: [2, 3, 1, 2, 4, 3],
          pointers: [{ name: "L", index: 3, color: "#6FA8FF" }, { name: "R", index: 4, color: "#5FD79E" }],
          window: [3, 4],
          highlight: [3, 4]
        }, caption: "After contracting and advancing R: window [3,4] = 2+4 = 6 < 7 invalid; once R hits index 5, [3,5] = 2+4+3 = 9 valid with length 3. For SHORTEST we record inside the while-valid loop while shrinking L." },
        { type: "h3", text: "7.6 Subarray product less than k (count windows)" },
        { type: "p", text: `Counting shape. For each right, every subarray ending at right with the current valid left is a valid subarray: that's (right-left+1) of them. Needs positive numbers.` },
        { type: "code", code: `def num_subarray_product_less_than_k(nums, k):
    if k <= 1:
        return 0
    left = 0
    prod = 1
    count = 0
    for right in range(len(nums)):
        prod *= nums[right]
        while prod >= k:
            prod //= nums[left]
            left += 1
        count += right - left + 1      # all windows ending at right
    return count` },
        { type: "h3", text: "7.7 Permutation in string / find all anagrams (fixed window + freq match)" },
        { type: "p", text: `Does s2 contain a permutation of s1? Slide a fixed window of len(s1) over s2 and compare frequency maps. Maintain a "matches" counter for O(1) per step instead of comparing full maps.` },
        { type: "code", code: `def check_inclusion(s1, s2):
    from collections import Counter
    if len(s1) > len(s2):
        return False
    need = Counter(s1)
    window = Counter()
    k = len(s1)
    for right in range(len(s2)):
        window[s2[right]] += 1
        if right >= k:                          # evict leftmost to keep size k
            left_ch = s2[right - k]
            window[left_ch] -= 1
            if window[left_ch] == 0:
                del window[left_ch]
        if window == need:                       # exact frequency match
            return True
    return False` },
        { type: "callout", text: `The "at most k distinct" / "exactly k distinct" family is solved with the count trick: exactly(k) = atMost(k) - atMost(k-1). atMost is a clean variable window where left advances while the distinct count exceeds k. This avoids the awkward "exactly" shrinking logic.` },
      ],
    },
    {
      heading: "8. Common bugs and how to avoid them",
      blocks: [
        { type: "p", text: `Most sliding-window/two-pointer failures fall into a handful of repeatable mistakes. Keep this table next to you while debugging.` },
        { type: "table", headers: ["Bug", "Symptom", "Fix"], rows: [
          ["Answer updated in the wrong place", "Off-by-one or completely wrong max/min", "Longest: update AFTER restoring validity. Shortest: update INSIDE the while-valid loop before/while shrinking."],
          ["Window length formula", "Length off by one", "Length of [left, right] inclusive is right - left + 1, never right - left."],
          ["Forgetting to evict in fixed window", "Window keeps growing past k", "Subtract nums[right - k + 1] (or right - k) once right reaches the full size."],
          ["Shrinking with wrong condition", "Window never valid / infinite candidates", "Use 'while INVALID' for longest, 'while VALID' for shortest. Match the loop to the shape."],
          ["Not removing zero-count keys from map", "window == need comparison fails", "del key when its count hits 0, or compare with a separate 'matches' counter."],
          ["max_freq never reset (char replacement)", "Worry it's a bug — it isn't", "Leaving it stale is correct and keeps O(n); resetting would require rescans."],
          ["Sliding window on non-monotone constraint", "Misses valid answers", "If numbers can be negative / constraint isn't monotone, switch to prefix sums + hash map."],
          ["left passing right", "Negative window length", "Loop guard left < right (opposite ends) or rely on right >= left invariant (same dir)."],
          ["Counting with duplicates (3Sum)", "Duplicate triples in output", "After recording a hit, skip equal neighbors: while left<right and nums[left]==nums[left+1]: left+=1."],
          ["Integer overflow in product window", "(Not in Python) wrong count", "Python ints are arbitrary precision; in other langs use division carefully or track logs."],
        ]},
      ],
    },
    {
      heading: "9. Study plan (work in order)",
      blocks: [
        { type: "p", text: `A 12–15 problem ladder. Do them in order; each rung adds one new idea. Time-box to ~20–30 min, then read an editorial if stuck and re-implement from memory the next day.` },
        { type: "table", headers: ["#", "Problem", "Pattern", "New idea"], rows: [
          ["1", "Two Sum II (sorted)", "Opposite ends", "Move pointer based on sum comparison"],
          ["2", "Valid Palindrome", "Opposite ends", "Skip/normalize characters"],
          ["3", "Container With Most Water", "Opposite ends", "Move the limiting side"],
          ["4", "3Sum", "Sort + two pointers", "Fix one, two-pointer the rest; skip dups"],
          ["5", "Trapping Rain Water", "Opposite ends", "Track running maxes, process smaller side"],
          ["6", "Remove Duplicates from Sorted Array", "Slow/fast", "In-place write pointer"],
          ["7", "Move Zeroes", "Slow/fast", "Swap-based compaction"],
          ["8", "Sort Colors", "3-way partition", "Dutch national flag, don't advance mid on high-swap"],
          ["9", "Merge Sorted Array (in place)", "Dual cursor", "Fill from the back"],
          ["10", "Longest Substring Without Repeating Characters", "Variable window", "Shrink on duplicate"],
          ["11", "Minimum Size Subarray Sum", "Variable window (shortest)", "Record inside while-valid loop"],
          ["12", "Longest Repeating Character Replacement", "Variable window", "Window len - maxFreq <= k"],
          ["13", "Max Consecutive Ones III", "Variable window", "Bounded count of zeros"],
          ["14", "Permutation in String / Find All Anagrams", "Fixed window", "Frequency-map match"],
          ["15", "Minimum Window Substring", "Variable window (shortest)", "need/missing counters — the boss level"],
        ]},
        { type: "callout", text: `Bonus reps once the above feel easy: Subarrays with K Different Integers (exactly = atMost(k) - atMost(k-1)), Sliding Window Maximum (monotonic deque), Subarray Product Less Than K, Fruit Into Baskets (= longest window with <= 2 distinct), Linked List Cycle II (fast/slow).` },
      ],
    },
    {
      heading: "10. One-page cheat sheet",
      blocks: [
        { type: "h3", text: "10.1 Trigger → template" },
        { type: "table", headers: ["You see...", "Use this"], rows: [
          ["Sorted array, find pair summing to target", "Opposite-ends two pointers"],
          ["Palindrome / reverse / symmetric check", "Opposite-ends two pointers"],
          ["Max area / trap water between bars", "Opposite-ends, move limiting side"],
          ["In-place remove/move/dedup, O(1) space", "Slow/fast pointers"],
          ["Sort 0/1/2 or partition in one pass", "3-way partition (DNF)"],
          ["Merge / intersect two sorted lists", "Dual-cursor"],
          ["Longest contiguous subarray with property P", "Variable window, shrink while INVALID, record after"],
          ["Shortest contiguous subarray with property P", "Variable window, shrink while VALID, record inside"],
          ["Count subarrays with property P", "Window: add (right-left+1), or atMost(k)-atMost(k-1)"],
          ["Best subarray of FIXED length k", "Fixed window (Template B)"],
          ["Anagram / permutation substring", "Fixed window + frequency match"],
          ["Sum exactly k with negatives", "NOT a window — prefix sum + hash map"],
        ]},
        { type: "h3", text: "10.2 Skeleton recall" },
        { type: "ul", items: [
          `Variable window: for right in range(n): add s[right]; while invalid: remove s[left]; left+=1; update answer.`,
          `Fixed window: add s[right]; if right>=k-1: use window; remove s[right-k+1].`,
          `Window length (inclusive) = right - left + 1.`,
          `Opposite ends: while left<right: inspect pair; move one pointer inward by a provable rule.`,
          `Slow/fast: slow = next write slot; advance slow only when you commit an element.`,
        ]},
      ],
    },
  ],
  cheatsheet: [
    "Two pointers replaces a nested loop with a single sweep → O(n) time, usually O(1) space.",
    "Opposite ends: needs sorted/symmetric data. Move the pointer that provably can't improve the answer.",
    "Sorted two-sum: sum < target → left++, sum > target → right--.",
    "Container/trap water: always move the side with the smaller height/running-max.",
    "Slow/fast: slow is the in-place write cursor; fast scans ahead. Great for remove/move/dedup at O(1) space.",
    "Sort-colors/DNF: after swapping with the high pointer, do NOT advance mid.",
    "Variable window template: expand right, while INVALID shrink left, then record (for LONGEST).",
    "Shortest window: expand to valid, record + shrink WHILE valid.",
    "Count windows: per right add (right-left+1); 'exactly k' = atMost(k) - atMost(k-1).",
    "Fixed window: window full at right==k-1; evict index right-k+1 each step.",
    "Window length = right - left + 1 (inclusive). This off-by-one is the #1 bug.",
    "Amortized O(n): right moves n times, left moves <= n times total; inner while is NOT nested O(n²).",
    "Sliding window needs MONOTONE feasibility. Negatives / 'sum exactly k' → use prefix sums + hash map instead.",
    "char-replacement: window valid when (len - maxFreq) <= k; stale maxFreq is OK and keeps it O(n).",
    "min-window-substring: track 'missing' count; shrink while missing==0 and record the smallest.",
    "Map cleanup: del a key when its count hits 0 so Counter == Counter comparisons stay correct.",
  ],
};
