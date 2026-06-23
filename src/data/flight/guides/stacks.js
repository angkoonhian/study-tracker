export default {
  id: "stacks",
  title: "Stacks & Monotonic Stacks",
  subtitle: "LIFO bookkeeping and the O(n) trick for nearest-greater/smaller queries",
  emoji: "🥞",
  intro: `A stack is the simplest possible data structure that still unlocks hard problems: it is just a list you only touch at one end, yet it powers parsing, expression evaluation, undo systems, and the famous "monotonic stack" family of array problems.

In Python a plain list IS a stack. \`append\` pushes, \`pop\` pops, \`[-1]\` peeks — all amortized O(1). There is no need to reach for \`collections.deque\` unless you also need fast pops from the front (a queue).

This handbook splits into two halves. The first half is "stack as a memory of unfinished work": validation/matching problems where the stack remembers brackets or directories you still owe a close, and design problems where a stack gives you O(1) extra superpowers (min-stack, queue-from-two-stacks). The second half is the marquee interview pattern — the MONOTONIC STACK — a stack you deliberately keep sorted so that every element you pop teaches you the "nearest greater" or "nearest smaller" neighbor of something. The magic is that each index is pushed and popped at most once, so a doubly-nested-looking algorithm runs in amortized O(n).

Master the next-greater template and the monotonic-stack decision guide and you can knock out daily temperatures, largest rectangle in a histogram, trapping rain water, subarray minimums, and stock span — problems that look unrelated but are the same three lines of code with different bookkeeping.`,
  sections: [
    {
      heading: "1. Stack Fundamentals",
      blocks: [
        { type: "p", text: `A stack is Last-In-First-Out (LIFO): the most recently pushed item is the first one out. Think of a stack of pancakes — you eat from the top.` },
        { type: "h3", text: "1.1 Python list as a stack" },
        { type: "code", code: `stack = []\nstack.append(1)      # push -> [1]\nstack.append(2)      # push -> [1, 2]\ntop = stack[-1]      # peek  -> 2 (does not remove)\nx = stack.pop()      # pop   -> returns 2, stack is [1]\nempty = not stack    # True when stack is empty\n\n# All of append / pop / [-1] are amortized O(1).\n# Guard every pop/peek: check 'if stack:' first or you get IndexError.` },
        { type: "table", headers: ["Operation", "Python", "Cost"], rows: [
          ["Push", "stack.append(x)", "O(1) amortized"],
          ["Pop", "stack.pop()", "O(1)"],
          ["Peek top", "stack[-1]", "O(1)"],
          ["Is empty", "not stack", "O(1)"],
          ["Size", "len(stack)", "O(1)"]
        ]},
        { type: "callout", text: `Do NOT use list.pop(0) as a stack/queue operation — that pops from the FRONT and is O(n) because every other element shifts. For a queue use collections.deque with popleft().` },
        { type: "h3", text: "1.2 When does a stack help?" },
        { type: "ul", items: [
          `You must match/close things in reverse order of opening (brackets, tags, directories).`,
          `You process a sequence and sometimes need to "undo" or revisit the most recent thing.`,
          `You want each new element compared against recent elements until some condition breaks (monotonic stack).`,
          `Recursion is secretly a stack — any DFS can be rewritten with an explicit stack.`
        ]}
      ]
    },
    {
      heading: "2. Matching & Validation",
      blocks: [
        { type: "p", text: `The canonical stack use: scan left to right, push openers, and when you hit a closer it must match the top of the stack. If it does not, the string is invalid.` },
        { type: "h3", text: "2.1 Valid Parentheses (LC 20)" },
        { type: "code", code: `def is_valid(s: str) -> bool:\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for ch in s:\n        if ch in '([{':\n            stack.append(ch)\n        else:\n            # closer: must match the most recent opener\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack   # leftover openers => invalid` },
        { type: "diagram", kind: "stack", data: { items: ["(", "[", "{"] }, caption: `Processing "([{}])": after pushing the three openers '(', '[', '{'. Top of stack is '{' (the last/rightmost element), waiting for its matching closer.` },
        { type: "diagram", kind: "stack", data: { items: ["(", "["] }, caption: `Next char is '}': it matches the top '{', so we pop. Stack is now ['(', '[']; top is '[', which the upcoming ']' must match.` },
        { type: "diagram", kind: "stack", data: { items: [] }, caption: `After ']' pops '[' and ')' pops '(': the stack is empty. Empty stack at the end => every opener was matched => the string is valid.` },
        { type: "callout", text: `Two failure modes to check: (1) a closer with nothing (or the wrong thing) on the stack, (2) leftover openers at the end. Forgetting the final 'not stack' check is the #1 bug here.` },
        { type: "h3", text: "2.2 Minimum Remove to Make Valid (LC 1249)" },
        { type: "p", text: `Stack stores the INDICES of unmatched '('. Any index left on the stack at the end, plus any ')' we could not match, must be deleted.` },
        { type: "code", code: `def min_remove_to_make_valid(s: str) -> str:\n    s = list(s)\n    stack = []                  # indices of unmatched '('\n    for i, ch in enumerate(s):\n        if ch == '(':\n            stack.append(i)\n        elif ch == ')':\n            if stack:\n                stack.pop()     # matched a '('\n            else:\n                s[i] = ''       # unmatched ')': mark for deletion\n    for i in stack:             # unmatched '(' left over\n        s[i] = ''\n    return ''.join(s)` },
        { type: "h3", text: "2.3 Decode String (LC 394)" },
        { type: "p", text: `Nested structure like 3[a2[c]] => "accaccacc". Push the current (string, repeat-count) onto a stack when you open a bracket; pop and combine when you close. The stack holds the OUTER context you must return to.` },
        { type: "code", code: `def decode_string(s: str) -> str:\n    stack = []                 # (prev_string, repeat_count)\n    cur = ''\n    num = 0\n    for ch in s:\n        if ch.isdigit():\n            num = num * 10 + int(ch)   # multi-digit counts\n        elif ch == '[':\n            stack.append((cur, num))\n            cur, num = '', 0\n        elif ch == ']':\n            prev, k = stack.pop()\n            cur = prev + cur * k\n        else:\n            cur += ch\n    return cur` }
      ]
    },
    {
      heading: "3. Expression Evaluation & Path Simplification",
      blocks: [
        { type: "h3", text: "3.1 Evaluate Reverse Polish Notation (LC 150)" },
        { type: "p", text: `In RPN (postfix) the operands come before the operator. Push numbers; on an operator pop the top two, apply, push the result. The second pop is the LEFT operand — order matters for - and /.` },
        { type: "code", code: `def eval_rpn(tokens: list[str]) -> int:\n    stack = []\n    ops = {'+', '-', '*', '/'}\n    for t in tokens:\n        if t in ops:\n            b = stack.pop()      # right operand (popped first)\n            a = stack.pop()      # left operand\n            if t == '+':   stack.append(a + b)\n            elif t == '-': stack.append(a - b)\n            elif t == '*': stack.append(a * b)\n            else:          stack.append(int(a / b))  # truncate toward 0\n        else:\n            stack.append(int(t))\n    return stack[-1]` },
        { type: "callout", text: `Python's // floors toward -infinity; LeetCode wants truncation toward zero. Use int(a / b) for the division to match (-7 / 2 -> -3, not -4).` },
        { type: "h3", text: "3.2 Simplify Path (LC 71)" },
        { type: "p", text: `Unix path canonicalization. Split on '/', then: '.' or '' do nothing, '..' pops one directory (if any), anything else is pushed.` },
        { type: "code", code: `def simplify_path(path: str) -> str:\n    stack = []\n    for part in path.split('/'):\n        if part == '' or part == '.':\n            continue\n        elif part == '..':\n            if stack:\n                stack.pop()      # go up one level\n        else:\n            stack.append(part)\n    return '/' + '/'.join(stack)` }
      ]
    },
    {
      heading: "4. Stack for Design",
      blocks: [
        { type: "h3", text: "4.1 Min Stack — O(1) getMin (LC 155)" },
        { type: "p", text: `Trick: alongside each value store the minimum of the stack AT OR BELOW that point. Then getMin is just reading the top's stored min. Pop discards both together, so the running min self-repairs.` },
        { type: "code", code: `class MinStack:\n    def __init__(self):\n        self.stack = []   # each entry: (value, min_so_far)\n\n    def push(self, val: int) -> None:\n        cur_min = val if not self.stack else min(val, self.stack[-1][1])\n        self.stack.append((val, cur_min))\n\n    def pop(self) -> None:\n        self.stack.pop()\n\n    def top(self) -> int:\n        return self.stack[-1][0]\n\n    def getMin(self) -> int:\n        return self.stack[-1][1]` },
        { type: "callout", text: `All four operations are O(1). Storing the min per-element costs O(n) extra space; a space-optimized variant keeps a second stack that only pushes when a new value is <= current min.` },
        { type: "h3", text: "4.2 Implement Queue using Two Stacks (LC 232)" },
        { type: "p", text: `Use an "in" stack for pushes and an "out" stack for pops. When "out" is empty, pour everything from "in" into "out", reversing the order — which turns LIFO into FIFO. Each element is moved at most once, so amortized O(1) per op.` },
        { type: "code", code: `class MyQueue:\n    def __init__(self):\n        self.in_stack = []\n        self.out_stack = []\n\n    def push(self, x: int) -> None:\n        self.in_stack.append(x)\n\n    def _transfer(self):\n        if not self.out_stack:\n            while self.in_stack:\n                self.out_stack.append(self.in_stack.pop())\n\n    def pop(self) -> int:\n        self._transfer()\n        return self.out_stack.pop()\n\n    def peek(self) -> int:\n        self._transfer()\n        return self.out_stack[-1]\n\n    def empty(self) -> bool:\n        return not self.in_stack and not self.out_stack` }
      ]
    },
    {
      heading: "5. The Monotonic Stack — Core Idea",
      blocks: [
        { type: "p", text: `A monotonic stack is a stack you deliberately keep sorted (either strictly/weakly increasing or decreasing) from bottom to top. Before pushing a new element, you POP everything that would violate the order. The genius is in what each pop MEANS: the element being popped has just found its nearest neighbor (on the right) that is greater/smaller than it.` },
        { type: "h3", text: "5.1 Why it finds the nearest greater/smaller element" },
        { type: "ul", items: [
          `Maintain a DECREASING stack (top is the smallest). When the incoming value is larger than the top, the top has found its "next greater element" — it is the incoming value. Pop it and record the answer.`,
          `Maintain an INCREASING stack (top is the largest). When the incoming value is smaller than the top, the top has found its "next smaller element" — the incoming value.`,
          `Because we pop greedily, the moment an element is popped is the FIRST (=nearest) time a violating neighbor appears, which is exactly "next greater/smaller".`,
          `Whatever remains on the stack at the end never found a greater/smaller neighbor — their answer is the default (-1, n, etc.).`
        ]},
        { type: "h3", text: "5.2 Amortized O(n): each index pushed and popped once" },
        { type: "p", text: `The inner while-loop looks like it could be O(n) per element, making O(n^2) overall. But across the WHOLE run, every index is appended exactly once and removed at most once. The total number of pops cannot exceed the total number of pushes (= n). So the combined work of all the while-loops is O(n), giving O(n) total — this is amortized analysis (the "aggregate method").` },
        { type: "callout", text: `Store INDICES on the stack, not values, when you also need distances/widths (e.g. daily temperatures, histogram). Store values when you only need the value of the neighbor. Indices are strictly more powerful — you can always recover the value via arr[i].` }
      ]
    },
    {
      heading: "6. The Next-Greater Template",
      blocks: [
        { type: "p", text: `Memorize this once. Every monotonic-stack problem is a re-skinning of it. "Next greater to the right" uses a stack that is decreasing from bottom to top (we pop when the current element is bigger).` },
        { type: "h3", text: "6.1 Canonical template (next greater element, indices)" },
        { type: "code", code: `def next_greater(nums: list[int]) -> list[int]:\n    """ans[i] = value of the next element to the right strictly\n    greater than nums[i], or -1 if none."""\n    n = len(nums)\n    ans = [-1] * n\n    stack = []                      # indices; values are DECREASING bottom->top\n    for i in range(n):\n        # current nums[i] is the 'next greater' for everything\n        # on top of the stack that is smaller than it\n        while stack and nums[stack[-1]] < nums[i]:\n            j = stack.pop()\n            ans[j] = nums[i]\n        stack.append(i)\n    return ans                      # leftover indices keep -1` },
        { type: "diagram", kind: "array", data: { values: [2, 1, 3], pointers: [{ name: "i", index: 1, color: "#6FA8FF" }], highlight: [], labels: {} }, caption: `Step A (i=1, nums=[2,1,3]). nums[i]=1 is NOT greater than the stack top's value (nums[0]=2), so nothing pops; we just push index 1. Stack holds [0, 1] with values 2, 1 — DECREASING bottom->top (the invariant).` },
        { type: "diagram", kind: "stack", data: { items: ["0 (val 2)", "1 (val 1)"] }, caption: `Stack of INDICES after step A. Bottom index 0 (value 2), top index 1 (value 1). Values decrease toward the top, so neither has found a next-greater yet.` },
        { type: "diagram", kind: "array", data: { values: [2, 1, 3], pointers: [{ name: "i", index: 2, color: "#6FA8FF" }], highlight: [0, 1], labels: { "0": "ans=3", "1": "ans=3" } }, caption: `Step B (i=2). nums[i]=3 is greater than the top (1) and then the next (2): both pop. Each popped index just found its NEXT GREATER = 3, so ans[1]=3 and ans[0]=3 (highlighted, resolved). Then push index 2; it stays unresolved (ans=-1).` },
        { type: "diagram", kind: "stack", data: { items: ["2 (val 3)"] }, caption: `Stack after step B: only index 2 (value 3) remains. It never found a greater element to its right, so its answer stays the default -1. Each index was pushed once and popped at most once => O(n).` },
        { type: "h3", text: "6.2 The four variants — flip two things" },
        { type: "table", headers: ["Want", "Scan direction", "Pop while", "Stack is"], rows: [
          ["Next greater (right)", "left -> right", "stack top < cur", "decreasing"],
          ["Next smaller (right)", "left -> right", "stack top > cur", "increasing"],
          ["Previous greater (left)", "left -> right", "stack top <= cur", "decreasing (answer = new top after pops)"],
          ["Previous smaller (left)", "left -> right", "stack top >= cur", "increasing (answer = new top after pops)"]
        ]},
        { type: "callout", text: `"Previous" variants read the answer from what is STILL on the stack after popping (the new top is the previous greater/smaller). "Next" variants WRITE the answer at pop time. Use < vs <= to decide strict vs non-strict and to break ties consistently.` }
      ]
    },
    {
      heading: "7. Worked Monotonic-Stack Examples",
      blocks: [
        { type: "h3", text: "7.1 Next Greater Element I & II (LC 496 / 503)" },
        { type: "p", text: `LC 503 is "circular": every element can look past the end and wrap around. Trick: iterate 2n times using i % n; only push real indices on the first pass conceptually, but it is simplest to push on the first n and just probe on the rest.` },
        { type: "code", code: `def next_greater_circular(nums: list[int]) -> list[int]:\n    n = len(nums)\n    ans = [-1] * n\n    stack = []                          # indices, decreasing\n    for i in range(2 * n):\n        cur = nums[i % n]\n        while stack and nums[stack[-1]] < cur:\n            ans[stack.pop()] = cur\n        if i < n:                       # only push original indices\n            stack.append(i)\n    return ans` },
        { type: "h3", text: "7.2 Daily Temperatures (LC 739)" },
        { type: "p", text: `"How many days until a warmer temperature?" This is next-greater but the answer is the DISTANCE, so we must store indices.` },
        { type: "code", code: `def daily_temperatures(temps: list[int]) -> list[int]:\n    n = len(temps)\n    ans = [0] * n\n    stack = []                          # indices, temps decreasing\n    for i, t in enumerate(temps):\n        while stack and temps[stack[-1]] < t:\n            j = stack.pop()\n            ans[j] = i - j              # days waited\n        stack.append(i)\n    return ans` },
        { type: "diagram", kind: "array", data: { values: [73, 74, 72, 76], pointers: [{ name: "i", index: 2, color: "#6FA8FF" }], highlight: [0], labels: { "0": "ans=1" } }, caption: `temps=[73,74,72,76]. At i=2 (temp 72): 72 < stack top temp (74), so nothing pops; push index 2. Index 0 was already resolved earlier (74 at i=1 warmed it after 1 day, ans[0]=1, highlighted). Stack now holds indices [1, 2] (temps 74, 72 — decreasing).` },
        { type: "diagram", kind: "stack", data: { items: ["1 (74)", "2 (72)"] }, caption: `Pending indices before i=3. Bottom 1 (temp 74), top 2 (temp 72). Both are still waiting for a warmer day.` },
        { type: "diagram", kind: "array", data: { values: [73, 74, 72, 76], pointers: [{ name: "i", index: 3, color: "#6FA8FF" }], highlight: [0, 1, 2], labels: { "1": "ans=2", "2": "ans=1" } }, caption: `At i=3 (temp 76): 76 beats top 72 -> pop index 2, ans[2]=3-2=1 day; 76 beats 74 -> pop index 1, ans[1]=3-1=2 days. Answer is the DISTANCE i-j, which is why we store indices. Index 3 is pushed with no warmer day after it, so ans[3]=0.` },
        { type: "h3", text: "7.3 Largest Rectangle in Histogram (LC 84)" },
        { type: "p", text: `Each bar is the limiting height of some rectangle. A bar can extend left until a SHORTER bar and right until a SHORTER bar. We keep an increasing stack; when the current bar is shorter than the top, the top's rectangle is now fully bounded on the right — pop and compute its area. The left boundary is the new stack top after popping.` },
        { type: "code", code: `def largest_rectangle(heights: list[int]) -> int:\n    stack = []          # indices, heights increasing bottom->top\n    best = 0\n    # append a sentinel 0 to flush everything at the end\n    for i, h in enumerate(heights + [0]):\n        while stack and heights[stack[-1]] >= h:\n            height = heights[stack.pop()]\n            # left boundary is the index just below on the stack\n            left = stack[-1] if stack else -1\n            width = i - left - 1\n            best = max(best, height * width)\n        stack.append(i)\n    return best` },
        { type: "callout", text: `The sentinel trailing 0 (height shorter than any real bar) forces every remaining bar to be popped and measured, so you don't need a separate cleanup loop. Note heights+[0] makes a copy; for huge inputs append/pop the sentinel manually.` },
        { type: "diagram", kind: "grid", data: { cells: [["", "", "", "■", ""], ["", "", "■", "■", ""], ["", "", "■", "■", ""], ["", "", "■", "■", ""], ["■", "", "■", "■", "■"], ["■", "■", "■", "■", "■"]], highlight: [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3]], colors: { "0,3": "#5FD79E" } }, caption: `heights=[2,1,5,6,2] drawn as a histogram (row 5 is the ground; taller bars rise upward). Columns are bar indices 0..4. The tall green-topped pair (indices 2 and 3, heights 5 and 6) are the ones currently held on an INCREASING stack.` },
        { type: "diagram", kind: "stack", data: { items: ["1 (h1)", "2 (h5)", "3 (h6)"] }, caption: `Stack of indices just before i=4 (bar height 2). Heights 1, 5, 6 INCREASE bottom->top. Now h=2 arrives: it is < 6, so pop index 3 (height 6), left boundary = new top index 2, width = 4-2-1 = 1, area = 6. Still < 5, so pop index 2 (height 5), left = index 1, width = 4-1-1 = 2, area = 5*2 = 10 — the answer.` },
        { type: "h3", text: "7.4 Trapping Rain Water — stack approach (LC 42)" },
        { type: "p", text: `Water is trapped in horizontal "bins" between a left wall and a right wall. Keep a decreasing stack of indices. When the current bar is taller than the top, that top is a valley bottom; the new top (after popping) is the left wall and the current bar is the right wall. Trapped water = bounded_height * width.` },
        { type: "code", code: `def trap(height: list[int]) -> int:\n    stack = []          # indices, heights decreasing\n    water = 0\n    for i, h in enumerate(height):\n        while stack and height[stack[-1]] < h:\n            bottom = stack.pop()        # valley floor\n            if not stack:\n                break                   # no left wall\n            left = stack[-1]\n            width = i - left - 1\n            bounded = min(height[left], h) - height[bottom]\n            water += bounded * width\n        stack.append(i)\n    return water` },
        { type: "h3", text: "7.5 Sum of Subarray Minimums (LC 907)" },
        { type: "p", text: `For each element, count how many subarrays have it as the minimum: (distance to previous strictly-smaller) * (distance to next smaller-or-equal). Multiply by the value and sum. The asymmetric strict/non-strict handles duplicates without double counting.` },
        { type: "code", code: `def sum_subarray_mins(arr: list[int]) -> int:\n    MOD = 10**9 + 7\n    n = len(arr)\n    # prev[i]: index of previous element STRICTLY smaller (-1 if none)\n    # next[i]: index of next element smaller-or-equal (n if none)\n    prev = [-1] * n\n    nxt = [n] * n\n    stack = []\n    for i in range(n):                  # next smaller-or-equal\n        while stack and arr[stack[-1]] > arr[i]:\n            nxt[stack.pop()] = i\n        stack.append(i)\n    stack = []\n    for i in range(n - 1, -1, -1):      # previous strictly smaller\n        while stack and arr[stack[-1]] >= arr[i]:\n            prev[stack.pop()] = i\n        stack.append(i)\n    total = 0\n    for i in range(n):\n        left = i - prev[i]              # choices for left boundary\n        right = nxt[i] - i              # choices for right boundary\n        total += arr[i] * left * right\n    return total % MOD` },
        { type: "h3", text: "7.6 Online Stock Span (LC 901)" },
        { type: "p", text: `Span = number of consecutive prior days (including today) with price <= today's price. Keep a decreasing stack of (price, span). When today's price >= the top, absorb that block's span — this collapses runs into one entry, keeping it O(1) amortized.` },
        { type: "code", code: `class StockSpanner:\n    def __init__(self):\n        self.stack = []     # (price, span), prices decreasing bottom->top\n\n    def next(self, price: int) -> int:\n        span = 1\n        while self.stack and self.stack[-1][0] <= price:\n            span += self.stack.pop()[1]   # merge swallowed spans\n        self.stack.append((price, span))\n        return span` }
      ]
    },
    {
      heading: "8. Monotonic Stack Decision Guide",
      blocks: [
        { type: "p", text: `When a problem says "next/previous greater/smaller", "warmer/cooler", "how far until taller", "as the minimum/maximum of subarrays", "rectangle/area bounded by heights", or "span/streak", reach for a monotonic stack. Then answer three questions.` },
        { type: "h3", text: "8.1 Which direction is the stack?" },
        { type: "ul", items: [
          `Looking for a GREATER neighbor => maintain a DECREASING stack (pop the smaller things; the survivor is bigger).`,
          `Looking for a SMALLER neighbor => maintain an INCREASING stack (pop the bigger things).`,
          `Scan LEFT->RIGHT to find NEXT (to the right). Scan RIGHT->LEFT (or read the surviving stack top) to find PREVIOUS (to the left).`
        ]},
        { type: "h3", text: "8.2 Store index or value?" },
        { type: "ul", items: [
          `Store INDEX when you need distance, width, or count of elements between boundaries (daily temperatures, histogram, rain water, subarray minimums).`,
          `Store VALUE (or a tuple like (value, span)) when you only need the neighbor's value or an aggregate you can merge (stock span).`,
          `When in doubt, store the index — you can always get the value with arr[idx], never the reverse.`
        ]},
        { type: "h3", text: "8.3 When you pop, what does it MEAN?" },
        { type: "table", headers: ["Stack type", "Pop trigger", "Meaning of the popped element"], rows: [
          ["Decreasing", "cur > top", "current is the popped element's NEXT GREATER"],
          ["Increasing", "cur < top", "current is the popped element's NEXT SMALLER"],
          ["Increasing (histogram)", "cur < top", "popped bar's rectangle is now right-bounded; measure it"],
          ["Decreasing (rain water)", "cur > top", "popped index is a valley floor between two walls"]
        ]},
        { type: "callout", text: `Tie-breaking with duplicates: choose '<' vs '<=' deliberately. A common pattern (subarray min/max counting) uses STRICT on one side and NON-STRICT on the other so each subarray is attributed to exactly one minimum/maximum. Get this wrong and you double-count.` }
      ]
    },
    {
      heading: "9. Common Bugs",
      blocks: [
        { type: "table", headers: ["Bug", "Symptom", "Fix"], rows: [
          ["Popping an empty stack", "IndexError", "Guard every pop/peek with 'if stack:'"],
          ["Forgetting leftover-openers check", "valid-parens returns True on '((('", "return 'not stack' at the end"],
          ["Storing value when you need distance", "can't compute width/days", "store index, use arr[idx] for value"],
          ["Wrong stack direction", "answers inverted (smaller vs greater)", "greater => decreasing stack; smaller => increasing"],
          ["< vs <= mix-up", "duplicates double-counted or missed", "pick strict on exactly one side for counting problems"],
          ["No sentinel in histogram", "tallest trailing bars never measured", "append a 0 sentinel or add a cleanup loop"],
          ["RPN operand order", "wrong result for - and /", "second pop is the LEFT operand"],
          ["Floor vs truncate division", "off-by-one on negatives in RPN", "use int(a / b), not a // b"],
          ["Circular array not handled", "wrap-around next-greater missed", "iterate 2n times with i % n, push only first n"],
          ["min-stack recomputing min", "getMin becomes O(n)", "store min_so_far alongside each value"]
        ]}
      ]
    },
    {
      heading: "10. Study Plan",
      blocks: [
        { type: "p", text: `Work top to bottom. The first block builds stack intuition; the monotonic block is the real interview payload — do them in order so each reuses the last template.` },
        { type: "table", headers: ["#", "Problem", "LC", "Pattern"], rows: [
          ["1", "Valid Parentheses", "20", "matching"],
          ["2", "Min Remove to Make Valid", "1249", "matching + indices"],
          ["3", "Decode String", "394", "nested context stack"],
          ["4", "Evaluate Reverse Polish Notation", "150", "expression eval"],
          ["5", "Simplify Path", "71", "stack as directory list"],
          ["6", "Min Stack", "155", "design, O(1) min"],
          ["7", "Implement Queue using Stacks", "232", "design, two stacks"],
          ["8", "Next Greater Element I", "496", "monotonic intro"],
          ["9", "Next Greater Element II", "503", "monotonic, circular"],
          ["10", "Daily Temperatures", "739", "monotonic, distance"],
          ["11", "Online Stock Span", "901", "monotonic, merge spans"],
          ["12", "Sum of Subarray Minimums", "907", "contribution counting"],
          ["13", "Largest Rectangle in Histogram", "84", "monotonic, area"],
          ["14", "Trapping Rain Water", "42", "monotonic, two walls"],
          ["15", "Maximal Rectangle", "85", "histogram per row (capstone)"]
        ]}
      ]
    },
    {
      heading: "11. Cheat Sheet & Trigger Table",
      blocks: [
        { type: "p", text: `Match the problem's phrasing to the stack you need. If the words on the left appear, build the stack on the right.` },
        { type: "table", headers: ["Problem says...", "Use this stack"], rows: [
          ["\"next/first greater\", \"warmer\", \"taller to the right\"", "DECREASING, scan left->right, write answer at pop"],
          ["\"next/first smaller\", \"cooler\", \"shorter to the right\"", "INCREASING, scan left->right, write answer at pop"],
          ["\"previous greater\", \"nearest taller on the left\"", "DECREASING, answer = stack top after popping"],
          ["\"previous smaller\", \"nearest shorter on the left\"", "INCREASING, answer = stack top after popping"],
          ["\"largest rectangle / area under bars\"", "INCREASING of indices + sentinel 0"],
          ["\"trap rain water\"", "DECREASING of indices, two-wall bins"],
          ["\"sum/count of subarray min or max\"", "monotonic + contribution (strict one side)"],
          ["\"span / streak of <= prices\"", "DECREASING of (value, span), merge on pop"],
          ["\"balanced brackets / valid string\"", "plain stack, push openers, match closers"],
          ["\"evaluate postfix / RPN\"", "plain stack, pop two on operator"]
        ]}
      ]
    }
  ],
  cheatsheet: [
    "Python list = stack: append (push), pop, [-1] (peek), 'not stack' (empty) — all amortized O(1).",
    "Never list.pop(0) for queue work — that's O(n). Use collections.deque.popleft().",
    "Matching: push openers, on a closer match the top; remember to check 'not stack' (no leftover openers) at the end.",
    "Min-stack: store (value, min_so_far) per entry => getMin is O(1).",
    "Queue from 2 stacks: in-stack for push, out-stack for pop; refill out only when empty (amortized O(1)).",
    "Monotonic stack: keep it sorted; pop on the violating element. Each index pushed & popped once => O(n) amortized.",
    "Greater neighbor => DECREASING stack. Smaller neighbor => INCREASING stack.",
    "NEXT (right) => scan left->right and write answer at pop time. PREVIOUS (left) => answer is the stack top after popping.",
    "Store INDEX when you need distance/width/count; store VALUE when you only need the neighbor's value.",
    "Next-greater core: 'while stack and nums[stack[-1]] < nums[i]: ans[stack.pop()] = nums[i]; stack.append(i)'.",
    "Histogram: increasing stack of indices + trailing sentinel 0; width = i - new_top - 1.",
    "Rain water (stack): decreasing stack; popped index is valley floor, bounded = min(left,right) - floor, width = i - left - 1.",
    "Counting subarrays by min/max: use strict on exactly one side to avoid double counting duplicates.",
    "RPN: second pop is the LEFT operand; use int(a / b) to truncate toward zero.",
    "Circular next-greater: loop 2n with i % n, push only original (i < n) indices."
  ]
}
