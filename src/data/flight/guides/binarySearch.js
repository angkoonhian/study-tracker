export default {
  id: "binary-search",
  title: "Binary Search",
  subtitle: "One template, an invariant you trust, and the answer-space pattern that powers half of hard interviews",
  emoji: "",
  intro: `Binary search is the algorithm everyone thinks they know and almost nobody writes correctly under pressure. The idea is trivial — halve the search space each step — but the implementation is a minefield of off-by-one errors, infinite loops, and boundary returns that are wrong by exactly one. The cure is not memorising five variants; it is committing to a single template, stating its loop invariant out loud, and deriving every variant from that invariant.\n\nThe bigger prize is "binary search on the answer." A huge fraction of medium and hard interview problems are not searches over an array at all — they are searches over an answer space governed by a monotonic predicate. "Minimum eating speed", "least capacity to ship packages", "smallest largest-subarray-sum": these all reduce to "find the smallest x for which feasible(x) is true." Once you see the monotone predicate, the binary search writes itself. Recognising that framing is the single highest-leverage skill in this guide.\n\nWe unify everything under one mental model: binary search finds a BOUNDARY — the first index (or value) at which a predicate flips from false to true. Classic lookup, lower/upper bound, rotated arrays, 2D matrices, peak finding, and answer-space search are all the same question wearing different clothes.\n\nTable of contents:\n1. The invariant and the canonical template\n2. Classic search on a sorted array\n3. Lower bound, upper bound, and bisect\n4. The boundary framing (the unifying model)\n5. Binary search on the answer\n6. Worked answer-space problems\n7. Rotated sorted arrays\n8. 2D matrices and peak finding\n9. Common bugs\n10. Study plan\n11. Cheat sheet`,
  sections: [
    {
      heading: "1. The invariant and the canonical template",
      blocks: [
        { type: "p", text: `Binary search maintains a search interval [lo, hi] and repeatedly discards the half that cannot contain the answer. Every bug in binary search is a violation of one of three things: the interval convention (what lo and hi mean), the loop condition (when to stop), or the shrink step (how to update lo and hi). Pick a convention, write the invariant down, and make every line consistent with it.` },
        { type: "h3", text: "1.1 Half-open vs closed intervals" },
        { type: "p", text: `Two conventions dominate. In the CLOSED convention, [lo, hi] are both valid indices and the loop runs while lo <= hi. In the HALF-OPEN convention, the interval is [lo, hi) — lo is inclusive, hi is exclusive — and the loop runs while lo < hi. Both are correct; mixing them is what kills you.` },
        { type: "table", headers: ["Aspect", "Closed [lo, hi]", "Half-open [lo, hi)"], rows: [
          ["Init", "lo=0, hi=n-1", "lo=0, hi=n"],
          ["Loop", "while lo <= hi", "while lo < hi"],
          ["Move right", "lo = mid + 1", "lo = mid + 1"],
          ["Move left", "hi = mid - 1", "hi = mid"],
          ["Terminates when", "lo > hi (empty)", "lo == hi (single point)"],
          ["Best for", "exact-match lookup", "boundary / first-true search"]
        ]},
        { type: "callout", text: `Recommendation: learn the HALF-OPEN boundary template (Section 4) as your default. It generalises to lower_bound, upper_bound, rotated arrays, and answer-space search with no edge-case rewrites. Keep the closed template only for the textbook "return index or -1" exact match.` },
        { type: "h3", text: "1.2 Computing mid without overflow" },
        { type: "p", text: `Always write mid = lo + (hi - lo) // 2. In Python integers are unbounded so (lo + hi) // 2 cannot overflow, but the lo + (hi - lo) // 2 form is the universal habit that transfers to C++/Java where lo + hi can overflow a 32-bit int. This form rounds DOWN (toward lo) — the left-biased mid. When a variant requires rounding UP (toward hi), use mid = lo + (hi - lo + 1) // 2. The rounding direction is the source of most infinite loops; see Section 9.` },
        { type: "h3", text: "1.3 The canonical closed template (exact match)" },
        { type: "code", code: `def binary_search(nums, target):\n    """Return index of target in sorted nums, or -1 if absent.\n    Invariant: if target exists, it lies within [lo, hi]."""\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:                       # interval is non-empty\n        mid = lo + (hi - lo) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            lo = mid + 1                  # discard mid and left half\n        else:\n            hi = mid - 1                  # discard mid and right half\n    return -1                            # lo > hi: interval empty, not found` },
        { type: "p", text: `Why this terminates: each iteration strictly shrinks (hi - lo) because mid is always inside [lo, hi] and we move past it with +1 or -1. The loop exits when lo > hi, i.e. the interval is empty, which is exactly the "not found" condition. The invariant — "if target exists it is in [lo, hi]" — holds before and after every iteration, so when the interval empties we are certain target is absent.` },
        { type: "callout", text: `State the invariant before writing code. For closed search it is "answer, if present, is in [lo, hi]". For boundary search it is "the predicate is false for everything strictly left of lo, and true at hi (or hi is the array end)". Every line must preserve the invariant — that is the entire skill.` }
      ]
    },
    {
      heading: "2. Classic search on a sorted array",
      blocks: [
        { type: "p", text: `The exact-match search above is O(log n) time and O(1) space. It is the right tool only when you want "does this exact value exist, and where." The moment the question becomes "first/last occurrence", "smallest value >= x", "insertion point", or "the array is rotated", you want the boundary template instead — exact-match search returns an arbitrary matching index when there are duplicates, which is rarely what you want.` },
        { type: "h3", text: "2.1 When binary search applies" },
        { type: "ul", items: [
          `The data is sorted, OR there is a monotonic property you can test in O(1)/O(n) (the predicate need not be the values themselves).`,
          `You can decide, from a single probe at mid, which half to keep. If you can't discard half from one look, binary search does not apply.`,
          `Random access is O(1). On a linked list, binary search degrades to O(n) probes and is pointless.`
        ]},
        { type: "h3", text: "2.2 Recursive form (rarely needed)" },
        { type: "code", code: `def bsearch_rec(nums, target, lo, hi):\n    if lo > hi:\n        return -1\n    mid = lo + (hi - lo) // 2\n    if nums[mid] == target:\n        return mid\n    if nums[mid] < target:\n        return bsearch_rec(nums, target, mid + 1, hi)\n    return bsearch_rec(nums, target, lo, mid - 1)` },
        { type: "p", text: `The recursive form is O(log n) stack depth and offers no advantage. Prefer iterative in interviews — it avoids accidental stack questions and is easier to reason about against the invariant.` },
        { type: "h3", text: "2.3 A search, step by step: find 7 in [1,3,5,7,9,11]" },
        { type: "p", text: `Watch the closed interval [lo, hi] shrink. Step 1: lo=0, hi=5, mid=2, nums[mid]=5 < 7 — too small, so discard the left half: lo = mid + 1 = 3.` },
        { type: "diagram", kind: "array", data: { values: [1, 3, 5, 7, 9, 11], window: [0, 5], pointers: [{ name: "lo", index: 0, color: "#2f8d46" }, { name: "mid", index: 2, color: "#E0A23B" }, { name: "hi", index: 5, color: "#1a7f37" }], highlight: [2] }, caption: "Step 1: mid=2, nums[2]=5 < 7 → too small, lo = mid + 1 = 3." },
        { type: "p", text: `Step 2: lo=3, hi=5, mid=4, nums[mid]=9 > 7 — too big, so discard the right half: hi = mid - 1 = 3.` },
        { type: "diagram", kind: "array", data: { values: [1, 3, 5, 7, 9, 11], window: [3, 5], pointers: [{ name: "lo", index: 3, color: "#2f8d46" }, { name: "mid", index: 4, color: "#E0A23B" }, { name: "hi", index: 5, color: "#1a7f37" }], highlight: [4] }, caption: "Step 2: mid=4, nums[4]=9 > 7 → too big, hi = mid - 1 = 3." },
        { type: "p", text: `Step 3: lo=3, hi=3, mid=3, nums[mid]=7 == 7 — found, return index 3. The window has collapsed onto the answer.` },
        { type: "diagram", kind: "array", data: { values: [1, 3, 5, 7, 9, 11], window: [3, 3], pointers: [{ name: "lo", index: 3, color: "#2f8d46" }, { name: "mid", index: 3, color: "#E0A23B" }, { name: "hi", index: 3, color: "#1a7f37" }], highlight: [3], labels: { "3": "found" } }, caption: "Step 3: lo == hi == mid = 3, nums[3] = 7 → match, return 3." }
      ]
    },
    {
      heading: "3. Lower bound, upper bound, and bisect",
      blocks: [
        { type: "p", text: `lower_bound(x) is the index of the FIRST element >= x. upper_bound(x) is the index of the first element > x. These two cover almost every "find the position" question: first occurrence, last occurrence, count of a value, insertion point, and ceiling/floor. Master these two and you rarely write the exact-match form again.` },
        { type: "h3", text: "3.1 lower_bound — first index with nums[i] >= x" },
        { type: "code", code: `def lower_bound(nums, x):\n    """First index i with nums[i] >= x; returns len(nums) if none.\n    Half-open invariant: nums[lo-1] < x  and  nums[hi] >= x (or hi==len)."""\n    lo, hi = 0, len(nums)            # note hi = len, exclusive\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if nums[mid] < x:\n            lo = mid + 1             # mid too small, answer is right of mid\n        else:\n            hi = mid                 # mid is a candidate, keep it (exclusive hi)\n    return lo                        # lo == hi == the boundary` },
        { type: "p", text: `Visualise the predicate p(i) = "nums[i] >= x". For x=5 over [1,3,5,5,7,9], the predicate reads F F T T T T — lower_bound is the first T (index 2), the boundary where it flips. upper_bound (nums[i] > 5) flips one later, at index 4.` },
        { type: "diagram", kind: "array", data: { values: [1, 3, 5, 5, 7, 9], pointers: [{ name: "lb", index: 2, color: "#2f8d46" }, { name: "ub", index: 4, color: "#1a7f37" }], highlight: [2, 4], labels: { "0": "F", "1": "F", "2": "T", "3": "T", "4": "T", "5": "T" } }, caption: "Predicate nums[i] >= 5 reads F F T T T T. lower_bound(5)=2 (first T); upper_bound(5)=4 (first nums[i] > 5)." },
        { type: "h3", text: "3.2 upper_bound — first index with nums[i] > x" },
        { type: "code", code: `def upper_bound(nums, x):\n    """First index i with nums[i] > x; returns len(nums) if none."""\n    lo, hi = 0, len(nums)\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if nums[mid] <= x:           # the ONLY change from lower_bound: <= not <\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo` },
        { type: "callout", text: `lower_bound and upper_bound differ by exactly one character: < versus <=. Everything else is identical. That single character is the difference between "first >= x" and "first > x".` },
        { type: "h3", text: "3.3 Deriving first/last occurrence and count" },
        { type: "ul", items: [
          `First occurrence of x: lo = lower_bound(x); valid iff lo < len(nums) and nums[lo] == x.`,
          `Last occurrence of x: upper_bound(x) - 1; valid iff that index >= 0 and nums[idx] == x.`,
          `Count of x: upper_bound(x) - lower_bound(x).`,
          `Number of elements < x: lower_bound(x). Number <= x: upper_bound(x).`,
          `Floor (largest <= x): upper_bound(x) - 1. Ceiling (smallest >= x): lower_bound(x).`
        ]},
        { type: "h3", text: "3.4 Python's bisect module" },
        { type: "p", text: `The standard library implements both bounds in C. In interviews, use it when allowed — but be ready to hand-roll the template, because most interviewers want to see you write the search.` },
        { type: "code", code: `import bisect\n\nbisect.bisect_left(nums, x)    # == lower_bound: first index with nums[i] >= x\nbisect.bisect_right(nums, x)   # == upper_bound: first index with nums[i]  > x\nbisect.insort_left(nums, x)    # insert x keeping nums sorted (left of equals)\n\n# Count of x in a sorted list:\ncount = bisect.bisect_right(nums, x) - bisect.bisect_left(nums, x)\n\n# Ceiling (smallest element >= x), or None:\ni = bisect.bisect_left(nums, x)\nceil = nums[i] if i < len(nums) else None\n\n# Floor (largest element <= x), or None:\nj = bisect.bisect_right(nums, x) - 1\nfloor = nums[j] if j >= 0 else None` },
        { type: "table", headers: ["Want", "Call"], rows: [
          ["First index >= x", "bisect_left(nums, x)"],
          ["First index > x", "bisect_right(nums, x)"],
          ["Insertion point (keep sorted)", "bisect_left / bisect_right"],
          ["Does x exist", "i = bisect_left(nums, x); i < len and nums[i] == x"],
          ["Count of x", "bisect_right - bisect_left"]
        ]}
      ]
    },
    {
      heading: "4. The boundary framing — the unifying model",
      blocks: [
        { type: "p", text: `Here is the one idea that subsumes every binary search you will ever write. Imagine the search space mapped to a boolean predicate p(i). For a valid binary search, p must be MONOTONE: once it becomes true it stays true. The array looks like F F F F T T T T. Binary search finds the BOUNDARY — the first index where p is true.` },
        { type: "code", code: `def find_first_true(lo, hi, predicate):\n    """Return the smallest x in [lo, hi] with predicate(x) == True.\n    Requires predicate to be monotone: F...F T...T.\n    If no x is true, returns hi (one past the searchable range,\n    or use hi as 'sentinel: impossible').\n    Invariant: predicate(lo-1) is False; predicate(hi) is True (or hi==end)."""\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if predicate(mid):\n            hi = mid           # mid works -> answer is mid or left of it\n        else:\n            lo = mid + 1       # mid fails -> answer is strictly right of mid\n    return lo                  # lo == hi == first True (the boundary)` },
        { type: "p", text: `Read every binary search problem as: "What is my monotone predicate, and what is the search range?" Then plug into find_first_true. The examples:` },
        { type: "table", headers: ["Problem", "Predicate p(x) = True when ...", "Answer is"], rows: [
          ["lower_bound(target)", "nums[x] >= target", "first True index"],
          ["upper_bound(target)", "nums[x] > target", "first True index"],
          ["Insert position", "nums[x] >= target", "first True index"],
          ["Koko bananas", "she finishes within h hours at speed x", "first True speed"],
          ["Ship in D days", "all packages fit in D days at capacity x", "first True capacity"],
          ["Sqrt(n)", "x*x > n", "first True minus 1"],
          ["Find min in rotated", "nums[x] <= nums[-1]", "first True index"]
        ]},
        { type: "callout", text: `If you can phrase the question as "smallest x such that something becomes true (and stays true)", you have a binary search. The whole job is (1) define the monotone predicate, (2) set the lo/hi range, (3) call the boundary template. Never write a bespoke loop again.` },
        { type: "p", text: `The mirror image — "largest x for which p is true" with a T T T F F F predicate — is handled by finding the first False and subtracting one, or by using the right-biased template with mid = lo + (hi - lo + 1) // 2. Prefer rephrasing into "first True" so you keep a single template.` }
      ]
    },
    {
      heading: "5. Binary search on the answer",
      blocks: [
        { type: "p", text: `This is the highest-value interview pattern in the entire topic. Many problems do not give you a sorted array to search — they give you a quantity to MINIMISE or MAXIMISE, and a way to CHECK whether a candidate value is feasible. If feasibility is monotone in the candidate, you binary-search the answer space instead of the input.` },
        { type: "h3", text: "5.1 The recipe" },
        { type: "ol", items: [
          `Identify the answer you're optimising (a speed, a capacity, a length, a threshold).`,
          `Write feasible(x): a boolean "can we achieve the goal if the answer is x?" — usually a single O(n) sweep.`,
          `Argue monotonicity: if x works, does every larger x also work (for minimisation), or every smaller x (for maximisation)? If yes, the predicate is F...F T...T and you can binary search.`,
          `Set the range: lo = smallest conceivable answer, hi = largest conceivable answer (a safe over-estimate).`,
          `Binary search for the boundary: the smallest feasible x (minimisation) or largest feasible x (maximisation).`
        ]},
        { type: "p", text: `The clue in the problem statement is almost always "minimum / maximum ... such that ..." combined with a constraint you can verify by simulation. "Minimum capacity", "least speed", "smallest largest sum", "maximum minimum distance" — each pairs an optimisation with a checkable constraint. The total cost is O(n log(range)).` },
        { type: "code", code: `def min_feasible(lo, hi, feasible):\n    """Smallest x in [lo, hi] with feasible(x) True; feasible monotone F..F T..T.\n    hi must itself be feasible (a valid over-estimate)."""\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if feasible(mid):\n            hi = mid          # mid works; try to do better (smaller)\n        else:\n            lo = mid + 1      # mid too small to be feasible\n    return lo` },
        { type: "callout", text: `The two things that trip people up: (1) getting the monotonicity direction backwards — always sanity-check "if x works, does x+1 work?" — and (2) setting hi too small so the true answer lies outside [lo, hi]. Make hi a generous upper bound (e.g. max element, or sum of all elements) so feasible(hi) is guaranteed True.` }
      ]
    },
    {
      heading: "6. Worked answer-space problems",
      blocks: [
        { type: "p", text: `Five canonical problems. Each is "binary search on the answer" with a different feasible() function. Once you see the shared skeleton, they become interchangeable.` },
        { type: "h3", text: "6.1 Koko eating bananas (LC 875)" },
        { type: "p", text: `Koko eats at speed k bananas/hour. With piles[i] bananas in pile i, eating a pile takes ceil(piles[i]/k) hours. Find the minimum k so she finishes all piles within h hours. Feasible(k) = "total hours at speed k <= h", which is monotone: faster speed never takes more hours. Range: k in [1, max(piles)].` },
        { type: "code", code: `import math\n\ndef minEatingSpeed(piles, h):\n    def feasible(k):\n        hours = sum(math.ceil(p / k) for p in piles)\n        return hours <= h\n    lo, hi = 1, max(piles)\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if feasible(mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo` },
        { type: "p", text: `The search space is the speed axis [1..max(piles)], NOT the piles array. For piles=[3,6,7,11], h=8, feasibility F F F F T T T T flips at k=4: any speed below 4 takes more than 8 hours, any speed >= 4 finishes in time. Binary search probes mid=4 (the boundary), confirms feasible, then narrows to it.` },
        { type: "diagram", kind: "array", data: { values: [1, 2, 3, 4, 5, 6, 7, 8], pointers: [{ name: "lo", index: 0, color: "#2f8d46" }, { name: "mid", index: 3, color: "#E0A23B" }, { name: "hi", index: 7, color: "#1a7f37" }], highlight: [3], labels: { "0": "F", "1": "F", "2": "F", "3": "T", "4": "T", "5": "T", "6": "T", "7": "T" } }, caption: "Koko answer space (candidate speeds 1..8): infeasible (F) below 4, feasible (T) from 4 on. The minimum feasible speed k=4 is the boundary." },
        { type: "h3", text: "6.2 Capacity to ship packages within D days (LC 1011)" },
        { type: "p", text: `Ship weights in order over D days; each day's load cannot exceed capacity C. Find the minimum C. Feasible(C) = "ship everything in <= D days using greedy fill". Monotone: bigger capacity never needs more days. Range: lo = max(weights) (must fit the heaviest single package), hi = sum(weights) (one day).` },
        { type: "code", code: `def shipWithinDays(weights, D):\n    def days_needed(cap):\n        days, load = 1, 0\n        for w in weights:\n            if load + w > cap:\n                days += 1        # start a new day\n                load = 0\n            load += w\n        return days\n    lo, hi = max(weights), sum(weights)\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if days_needed(mid) <= D:\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo` },
        { type: "h3", text: "6.3 Split array largest sum (LC 410)" },
        { type: "p", text: `Split nums into m contiguous subarrays minimising the largest subarray sum. This is identical to the shipping problem: "largest sum <= x" feasibility means "we can split into <= m parts where no part exceeds x". Range: lo = max(nums), hi = sum(nums).` },
        { type: "code", code: `def splitArray(nums, m):\n    def parts_needed(limit):\n        parts, cur = 1, 0\n        for x in nums:\n            if cur + x > limit:\n                parts += 1\n                cur = 0\n            cur += x\n        return parts\n    lo, hi = max(nums), sum(nums)\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if parts_needed(mid) <= m:   # feasible: fits in m parts\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo` },
        { type: "callout", text: `Koko, ship-packages, and split-array are the SAME problem in three costumes: minimise a per-bucket limit subject to "number of buckets needed <= K". Recognise the family and you solve all of them with one mental template.` },
        { type: "h3", text: "6.4 Sqrt(x) integer part (LC 69)" },
        { type: "p", text: `Return floor(sqrt(x)) using only integer arithmetic. Predicate p(k) = "k*k > x" is monotone F...F T...T; the answer is the last False, i.e. first True minus 1. Equivalently, search the largest k with k*k <= x. Range: [0, x] (or [0, max(1, x)]).` },
        { type: "code", code: `def mySqrt(x):\n    if x < 2:\n        return x\n    lo, hi = 1, x                    # search largest k with k*k <= x\n    while lo < hi:\n        mid = lo + (hi - lo + 1) // 2  # RIGHT-biased mid: we move lo up to mid\n        if mid * mid <= x:\n            lo = mid                 # mid is valid, keep it (no +1)\n        else:\n            hi = mid - 1\n    return lo` },
        { type: "p", text: `Note the right-biased mid here: because one branch sets lo = mid (not mid + 1), a left-biased mid would let lo and hi get stuck one apart forever. This is the classic infinite-loop trap — when a branch keeps mid by writing lo = mid, you MUST round up. See Section 9.` },
        { type: "h3", text: "6.5 Minimum eating speed is Koko; minimise-max distance variants" },
        { type: "p", text: `"Magnetic force between balls" (LC 1552) and "minimum time to complete trips" (LC 2187) are the same recipe. For maximise-the-minimum problems (place balls so the minimum gap is as large as possible), feasibility flips: feasible(gap) = "we can place all balls with every gap >= gap", which is monotone TRUE for small gaps and FALSE for large — so you search the LARGEST feasible value (T...T F...F). Rephrase as "first False minus one" or use the right-biased template.` },
        { type: "code", code: `def maxDistance(positions, m):\n    positions.sort()\n    def can_place(gap):\n        count, last = 1, positions[0]\n        for p in positions[1:]:\n            if p - last >= gap:\n                count += 1\n                last = p\n                if count == m:\n                    return True\n        return count >= m\n    lo, hi = 1, positions[-1] - positions[0]\n    while lo < hi:\n        mid = lo + (hi - lo + 1) // 2   # right-biased: maximise feasible gap\n        if can_place(mid):\n            lo = mid\n        else:\n            hi = mid - 1\n    return lo` },
        { type: "p", text: `Here feasibility runs the OTHER way. can_place(gap) is TRUE for small gaps and FALSE once the required gap is too large to fit all m balls: T T T F F F F. We want the LARGEST feasible gap (the last T), so the right-biased template climbs up while feasible. With the boundary at gap=3, the answer is the last T.` },
        { type: "diagram", kind: "array", data: { values: [1, 2, 3, 4, 5, 6, 7], pointers: [{ name: "lo", index: 0, color: "#2f8d46" }, { name: "mid", index: 3, color: "#E0A23B" }, { name: "hi", index: 6, color: "#1a7f37" }], highlight: [2], labels: { "0": "T", "1": "T", "2": "T", "3": "F", "4": "F", "5": "F", "6": "F" } }, caption: "Maximise-the-minimum answer space (candidate gaps 1..7): feasible (T) for small gaps, infeasible (F) once too wide. Answer is the LARGEST T — gap=3." }
      ]
    },
    {
      heading: "7. Rotated sorted arrays",
      blocks: [
        { type: "p", text: `A sorted array rotated at an unknown pivot (e.g. [4,5,6,7,0,1,2]) is no longer globally sorted, but at any mid, at least ONE half [lo..mid] or [mid..hi] is still sorted. That local monotonicity is enough to discard half each step. Two staple problems: find the minimum (the pivot) and search for a target.` },
        { type: "h3", text: "7.1 Find minimum in rotated sorted array (LC 153)" },
        { type: "p", text: `Predicate framing: the minimum is the first index where nums[x] <= nums[-1]. Everything before the pivot is greater than the last element; everything from the pivot on is <= it. That is a monotone F...F T...T predicate — pure boundary search.` },
        { type: "p", text: `On [4,5,6,7,0,1,2], the predicate "nums[i] <= nums[hi]" reads F F F F T T T — the first T (index 4, value 0) is the minimum, the rotation pivot. Everything left of it is the larger sorted run; everything from it on is the smaller run.` },
        { type: "diagram", kind: "array", data: { values: [4, 5, 6, 7, 0, 1, 2], pointers: [{ name: "min", index: 4, color: "#1a7f37" }], highlight: [4], labels: { "0": "F", "1": "F", "2": "F", "3": "F", "4": "T", "5": "T", "6": "T" } }, caption: "Rotated array: predicate nums[i] <= nums[hi] is F...F T...T; the first T (index 4, value 0) is the pivot / minimum." },
        { type: "code", code: `def findMin(nums):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if nums[mid] > nums[hi]:\n            lo = mid + 1        # min is strictly right of mid\n        else:\n            hi = mid            # mid could be the min; keep it\n    return nums[lo]             # lo == hi == index of minimum` },
        { type: "h3", text: "7.2 Search in rotated sorted array (LC 33)" },
        { type: "code", code: `def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = lo + (hi - lo) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[lo] <= nums[mid]:           # left half [lo..mid] is sorted\n            if nums[lo] <= target < nums[mid]:\n                hi = mid - 1                # target in sorted left half\n            else:\n                lo = mid + 1\n        else:                               # right half [mid..hi] is sorted\n            if nums[mid] < target <= nums[hi]:\n                lo = mid + 1                # target in sorted right half\n            else:\n                hi = mid - 1\n    return -1` },
        { type: "h3", text: "7.3 The duplicates caveat (LC 81)" },
        { type: "p", text: `When duplicates are allowed, nums[lo] == nums[mid] == nums[hi] can happen (e.g. [1,0,1,1,1]) and you can no longer tell which half is sorted. The fix: when nums[lo] == nums[mid] == nums[hi], shrink both ends by one (lo += 1; hi -= 1) and retry. This drops the worst case to O(n) — unavoidable, since duplicates can hide the pivot entirely.` },
        { type: "code", code: `def searchWithDuplicates(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = lo + (hi - lo) // 2\n        if nums[mid] == target:\n            return True\n        if nums[lo] == nums[mid] == nums[hi]:\n            lo += 1                         # cannot decide; shrink both ends\n            hi -= 1\n        elif nums[lo] <= nums[mid]:         # left half sorted\n            if nums[lo] <= target < nums[mid]:\n                hi = mid - 1\n            else:\n                lo = mid + 1\n        else:                               # right half sorted\n            if nums[mid] < target <= nums[hi]:\n                lo = mid + 1\n            else:\n                hi = mid - 1\n    return False` },
        { type: "callout", text: `For "find min" prefer the boundary template (clean and provable). For "search target" the sorted-half logic is unavoidable — memorise the four-case structure: determine which half is sorted, test whether target lies inside that sorted half, then move accordingly.` }
      ]
    },
    {
      heading: "8. 2D matrices and peak finding",
      blocks: [
        { type: "h3", text: "8.1 Search a 2D matrix — fully sorted (LC 74)" },
        { type: "p", text: `When each row is sorted and the first element of each row exceeds the last of the previous row, the matrix is one sorted list folded into a grid. Treat indices 0..(m*n - 1) as a virtual array and map index i to (i // cols, i % cols). A single binary search, O(log(m*n)).` },
        { type: "p", text: `Searching for 11 in a 3x4 grid: the flattened indices run 0..11. mid=5 maps to (1,1)=14 > 11 → go left; mid=2 maps to (0,2)=5 < 11 → go right; mid=3 maps to (0,3)=7 < 11 → right; mid=4 maps to (1,0)=10 < 11 → right; lands on (1,1)... the probed cells trace a path collapsing on (1,2)=11.` },
        { type: "diagram", kind: "grid", data: { cells: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], highlight: [[1, 1], [0, 2], [1, 2]], colors: { "1,1": "#E0A23B", "0,2": "#2f8d46", "1,2": "#1a7f37" } }, caption: "Fully-sorted matrix as a virtual 1D array. Probed mids (amber, blue) narrow to the target 11 at (1,2) (green)." },
        { type: "code", code: `def searchMatrix(matrix, target):\n    rows, cols = len(matrix), len(matrix[0])\n    lo, hi = 0, rows * cols - 1\n    while lo <= hi:\n        mid = lo + (hi - lo) // 2\n        val = matrix[mid // cols][mid % cols]   # unflatten the index\n        if val == target:\n            return True\n        elif val < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return False` },
        { type: "h3", text: "8.2 Search a 2D matrix II — row- and column-sorted (LC 240)" },
        { type: "p", text: `When rows AND columns are sorted but rows don't chain together, the flatten trick fails. Instead start at the top-right corner: if the value is too big, move left (drop the column); if too small, move down (drop the row). This staircase walk is O(m + n) — not strictly binary search, but the standard expected answer and worth knowing as the companion technique.` },
        { type: "code", code: `def searchMatrixII(matrix, target):\n    r, c = 0, len(matrix[0]) - 1            # start at top-right\n    while r < len(matrix) and c >= 0:\n        v = matrix[r][c]\n        if v == target:\n            return True\n        elif v > target:\n            c -= 1                          # this column is too large\n        else:\n            r += 1                          # this row is too small\n    return False` },
        { type: "h3", text: "8.3 Find peak element (LC 162)" },
        { type: "p", text: `A peak is any element greater than both neighbours (boundaries treated as -infinity). Even on an UNSORTED array you can binary search: if nums[mid] < nums[mid+1], a peak must exist to the right (the array is rising, and it can't rise forever); otherwise a peak exists at mid or to the left. This works because following the uphill direction always leads to a peak.` },
        { type: "code", code: `def findPeakElement(nums):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if nums[mid] < nums[mid + 1]:\n            lo = mid + 1        # uphill to the right -> peak is right of mid\n        else:\n            hi = mid            # downhill or equal -> peak is mid or left\n    return lo                  # lo == hi == a peak index` },
        { type: "callout", text: `Peak finding is the proof that binary search does NOT require a sorted array — it requires a property that lets you discard half from one probe. Here that property is "follow the rising slope". Internalise this: the real prerequisite is a discardable half, not global sortedness.` }
      ]
    },
    {
      heading: "9. Common bugs",
      blocks: [
        { type: "p", text: `Nearly every binary search bug is one of the following. When your search loops forever or returns an answer off by one, check this table first.` },
        { type: "table", headers: ["Bug", "Symptom", "Cause / Fix"], rows: [
          ["Infinite loop", "Loop never exits; lo and hi stuck adjacent.", "A branch sets lo = mid (not mid+1) but mid rounds DOWN. Use the right-biased mid: lo + (hi - lo + 1)//2 whenever a branch keeps mid via lo = mid."],
          ["Off-by-one in loop condition", "Misses the answer, or reads out of bounds.", "Match condition to interval: closed [lo,hi] uses while lo <= hi; half-open [lo,hi) uses while lo < hi. Don't mix."],
          ["Wrong mid rounding", "Left-biased search returns last instead of first (or vice versa).", "Left-biased (lo + (hi-lo)//2) pairs with hi = mid / lo = mid+1. Right-biased (round up) pairs with lo = mid / hi = mid-1."],
          ["hi initialised to len-1 for lower_bound", "Insertion point at the very end (== len) is never returned.", "Half-open boundary search must init hi = len so the answer 'past the end' is reachable."],
          ["Overflow (C++/Java)", "Negative mid on large arrays.", "Use lo + (hi - lo)//2, never (lo + hi)//2. Habit transfers; harmless in Python."],
          ["Boundary value not checked", "Returns an index but the value there isn't the target.", "Boundary search returns an INSERTION point. After it, verify nums[lo] == target before claiming a match."],
          ["hi too small (answer-space)", "feasible(hi) is False; search returns garbage.", "Make hi a guaranteed-feasible over-estimate (max element, or total sum)."],
          ["Monotonicity backwards", "Answer-space search converges to the wrong end.", "Sanity-check 'if x works does x+1 work?'. If feasibility shrinks with x, you want largest-True, not first-True."],
          ["Empty input", "Index error on nums[0] / max(nums).", "Guard len(nums) == 0 (or the answer-space lo/hi) before the loop."]
        ]},
        { type: "h3", text: "9.1 The infinite-loop rule, stated once" },
        { type: "callout", text: `The two safe pairings, memorise them: (A) mid = lo + (hi-lo)//2 with branches { lo = mid + 1 } and { hi = mid }. (B) mid = lo + (hi-lo+1)//2 with branches { lo = mid } and { hi = mid - 1 }. NEVER pair a left-biased mid with lo = mid, and NEVER pair a right-biased mid with hi = mid. Every infinite loop is a violation of this rule.` },
        { type: "h3", text: "9.2 The canonical template to reach for" },
        { type: "code", code: `# DEFAULT TEMPLATE: smallest x in [lo, hi) with predicate(x) True.\n# Half-open, left-biased mid, no edge cases. Use for 90% of problems.\ndef boundary(lo, hi, predicate):\n    while lo < hi:\n        mid = lo + (hi - lo) // 2\n        if predicate(mid):\n            hi = mid          # predicate holds; answer is mid or to the left\n        else:\n            lo = mid + 1      # predicate fails; answer is to the right\n    return lo                # first index where predicate is True\n\n# RIGHT-BIASED TEMPLATE: largest x in [lo, hi] with predicate(x) True.\ndef boundary_last(lo, hi, predicate):\n    while lo < hi:\n        mid = lo + (hi - lo + 1) // 2   # round UP\n        if predicate(mid):\n            lo = mid          # holds; try larger\n        else:\n            hi = mid - 1      # fails; go smaller\n    return lo                # last index where predicate is True` }
      ]
    },
    {
      heading: "10. Study plan",
      blocks: [
        { type: "p", text: `Work top to bottom. The first block builds the template muscle; the middle block drills the answer-space pattern (the interview money-maker); the last block covers the rotated/2D/peak variants. Do them in order — each row assumes the template from the rows above.` },
        { type: "table", headers: ["#", "Problem", "LC #", "Pattern / why it matters"], rows: [
          ["1", "Binary Search", "704", "The canonical exact-match template. Write it from memory."],
          ["2", "Search Insert Position", "35", "lower_bound in disguise; the boundary return."],
          ["3", "First Bad Version", "278", "Pure first-True boundary search; minimal predicate."],
          ["4", "Find First and Last Position", "34", "lower_bound + upper_bound together; count of a value."],
          ["5", "Sqrt(x)", "69", "Right-biased mid; integer answer-space search; the infinite-loop trap."],
          ["6", "Valid Perfect Square", "367", "Answer-space with x*x predicate; sibling of Sqrt."],
          ["7", "Koko Eating Bananas", "875", "First answer-space problem; feasible() as an O(n) sweep."],
          ["8", "Capacity To Ship Packages", "1011", "Same recipe; greedy days_needed feasibility."],
          ["9", "Split Array Largest Sum", "410", "Hard-tagged but identical to #8; minimise-the-max family."],
          ["10", "Minimize Max Distance / Magnetic Force", "1552", "Maximise-the-minimum; feasibility flips direction."],
          ["11", "Find Minimum in Rotated Sorted Array", "153", "Boundary search on a rotated array (the pivot)."],
          ["12", "Search in Rotated Sorted Array", "33", "Which-half-is-sorted four-case logic."],
          ["13", "Search in Rotated Sorted Array II", "81", "Duplicates caveat; O(n) worst case."],
          ["14", "Find Peak Element", "162", "Binary search WITHOUT a sorted array; follow the slope."],
          ["15", "Search a 2D Matrix", "74", "Flatten-the-grid index mapping."],
          ["16", "Median of Two Sorted Arrays", "4", "Capstone: binary search on the partition point. Hard, but pure template once framed."]
        ]},
        { type: "callout", text: `If you only have time for five: 704 (template), 34 (bounds), 875 (answer-space), 153 (rotated boundary), 33 (rotated search). These five cover every framing an interviewer is likely to reach for.` }
      ]
    },
    {
      heading: "11. Cheat sheet",
      blocks: [
        { type: "p", text: `One page to review the night before. The trigger-to-template table tells you which of the two templates to grab; the cheatsheet array below restates the load-bearing rules.` },
        { type: "table", headers: ["Trigger phrase", "Template to use"], rows: [
          ["\"index of target in sorted array\"", "Closed exact-match (while lo <= hi, return mid or -1)."],
          ["\"first element >= / > x\", \"insertion point\", \"count of x\"", "Half-open lower_bound / upper_bound (hi = len)."],
          ["\"smallest x such that <condition> becomes true\"", "Default boundary template (first-True)."],
          ["\"minimum capacity / speed / limit such that feasible\"", "Answer-space first-True; feasible() is an O(n) sweep."],
          ["\"maximum minimum gap / largest x that still works\"", "Right-biased boundary_last (round mid UP)."],
          ["\"minimum / pivot in rotated array\"", "Boundary: compare nums[mid] to nums[hi]."],
          ["\"target in rotated array\"", "Which-half-is-sorted four-case search."],
          ["\"peak element\" (unsorted ok)", "Compare nums[mid] to nums[mid+1]; climb the slope."],
          ["\"value in fully-sorted matrix\"", "Flatten to 1D: mid // cols, mid % cols."]
        ]}
      ]
    }
  ],
  cheatsheet: [
    `One template to rule them: smallest x with predicate True. while lo < hi: mid = lo + (hi-lo)//2; if predicate(mid): hi = mid else: lo = mid + 1; return lo.`,
    `Always mid = lo + (hi - lo) // 2 (overflow-safe habit; left-biased / rounds down toward lo).`,
    `Closed interval [lo, hi]: while lo <= hi, moves are lo = mid+1 / hi = mid-1, return -1 on exit. Use for exact-match lookup.`,
    `Half-open [lo, hi): while lo < hi, init hi = len, moves are lo = mid+1 / hi = mid. Use for boundary / lower_bound / upper_bound.`,
    `lower_bound = first index with nums[i] >= x (use <). upper_bound = first with nums[i] > x (use <=). They differ by ONE character.`,
    `Derived: first occ = lower_bound (check equality); last occ = upper_bound - 1; count = upper_bound - lower_bound; floor = upper_bound - 1; ceil = lower_bound.`,
    `Python: bisect.bisect_left == lower_bound, bisect.bisect_right == upper_bound; insort to insert keeping sorted.`,
    `Mental model: binary search finds a BOUNDARY in a monotone predicate F...F T...T. Define the predicate, set the range, return first True.`,
    `Binary search on the answer (the big interview pattern): write feasible(x) as an O(n) check, argue it's monotone, search the answer space. O(n log(range)).`,
    `Minimise-the-max family (Koko / ship packages / split array) are ALL the same: smallest per-bucket limit with buckets_needed(limit) <= K.`,
    `Maximise-the-minimum (place balls / aggressive cows): feasibility flips to T...T F...F; use the right-biased template (mid rounds UP, lo = mid).`,
    `Infinite-loop rule: left-biased mid pairs with { lo = mid+1, hi = mid }; right-biased mid (lo + (hi-lo+1)//2) pairs with { lo = mid, hi = mid-1 }. Never cross them.`,
    `Set hi to a guaranteed-feasible over-estimate (max element or total sum) so feasible(hi) is True and the answer stays inside the range.`,
    `Rotated array: at any mid one half is sorted. Find-min = boundary on nums[mid] vs nums[hi]. Search-target = decide which half is sorted, then check if target lies inside it.`,
    `Duplicates in rotated array: when nums[lo]==nums[mid]==nums[hi], shrink both ends (lo+=1; hi-=1). Worst case degrades to O(n).`,
    `Sorted matrix (rows chain): flatten to 1D, val = matrix[mid // cols][mid % cols]. Row+col sorted only (no chaining): staircase from top-right, O(m+n).`,
    `Peak element proves sortedness is NOT required — binary search needs a discardable half, here 'climb toward the higher neighbour'.`,
    `After a boundary search, the returned index is an INSERTION point — verify nums[lo] == target before declaring a match.`
  ]
}
