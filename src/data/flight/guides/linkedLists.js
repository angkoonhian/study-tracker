export default {
  id: "linked-lists",
  title: "Linked Lists",
  subtitle: "Pointer manipulation, dummy nodes, two pointers, and every classic problem",
  emoji: "",
  intro: `Linked lists are deceptively hard. The data structure itself is trivial — nodes with a value and a next pointer — but the manipulation patterns are subtle enough that experienced engineers still get them wrong. Most linked-list bugs come from mismanaging a tiny set of pointer updates during reversals, deletions, or merges. This guide drills the patterns that handle those updates cleanly.\n\nWe cover the node structure and the dummy node trick, the two-pointer family (fast/slow for cycle detection, gap-based for nth-from-end), the canonical reversal (and its variants: reverse in groups, reverse between positions), merging, and the design problems that combine linked lists with hashmaps (LRU cache).\n\nTable of contents:\n1. Foundations: the node structure\n2. The dummy node trick\n3. Reversal (the most important technique)\n4. Two-pointer patterns\n5. Cycle detection (Floyd's tortoise and hare)\n6. Merging linked lists\n7. Reordering and partitioning\n8. Designing with linked lists (LRU cache)\n9. Common bugs\n10. Study plan\n11. Cheat sheet`,
  sections: [
    {
      heading: "1. Foundations: the node structure",
      blocks: [
        { type: "p", text: `Every LeetCode linked list problem uses this class. Memorise it.` },
        { type: "code", code: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next` },
        { type: "p", text: `A linked list is just a chain of these nodes, identified by its head. The chain ends with a node whose next is None.` },
        { type: "code", code: `head -> [1] -> [2] -> [3] -> [4] -> None` },
        { type: "diagram", kind: "linkedlist", data: { values: [1, 2, 3, 4, 5], cycleTo: -1, pointers: [{ name: "head", index: 0, color: "#6FA8FF" }] }, caption: "A singly linked list. The head pointer identifies the chain; the last node's next is None." },
        { type: "h3", text: "1.1 Why linked lists feel hard" },
        { type: "p", text: `Arrays are random-access: you can poke at nums[7] directly. Linked lists are sequential: to inspect or modify node 7, you have to walk through nodes 0 through 6 first. Every operation is about traversal with pointer surgery, not direct addressing.` },
        { type: "p", text: `The cognitive load comes from keeping track of multiple pointers in flight simultaneously. A reversal updates three pointers per step; a merge updates two; a deletion has to remember the node before the one being removed. Forget one, and the list silently goes wrong.` },
        { type: "h3", text: "1.2 The cardinal rule of linked-list code" },
        { type: "callout", text: `Before you overwrite a pointer, make sure you have a way to reach everything you still need. If you change node.next, the old node.next is gone forever unless something else points to it. This is the source of nearly every linked-list bug.` },
        { type: "h3", text: "1.3 Singly vs doubly linked" },
        { type: "p", text: `Most LeetCode problems use singly linked lists (one next pointer). Doubly linked lists add a prev pointer, which makes deletion and reverse-traversal trivial — at the cost of more bookkeeping on every insertion. The classic use case for doubly linked is LRU cache (covered in section 8).` }
      ]
    },
    {
      heading: "2. The dummy node trick",
      blocks: [
        { type: "p", text: `Half of linked-list code complexity comes from edge cases involving the head of the list. If you have to delete the first node, the operation is different from deleting any other node, because there's no predecessor to update. The dummy node trick eliminates this asymmetry.` },
        { type: "callout", text: `The technique. Create a sentinel node whose next points to the actual head. Now every real node has a predecessor. At the end, return dummy.next as the new head.` },
        { type: "code", code: `dummy = ListNode(0, head)\n# ... do work using dummy as a stand-in for "the node before head" ...\nreturn dummy.next` },
        { type: "diagram", kind: "linkedlist", data: { values: [0, 1, 2, 3], cycleTo: -1, pointers: [{ name: "dummy", index: 0, color: "#5FD79E" }, { name: "head", index: 1, color: "#6FA8FF" }] }, caption: "The dummy node (value 0) sits before the real head, so every real node has a predecessor. Return dummy.next at the end." },
        { type: "h3", text: "Example: remove all nodes with a given value" },
        { type: "p", text: `Without a dummy, you'd need two separate code paths — one for the head, one for everything else. With a dummy, it's one loop:` },
        { type: "code", code: `def removeElements(head, val):\n    dummy = ListNode(0, head)\n    curr = dummy\n    while curr.next:\n        if curr.next.val == val:\n            curr.next = curr.next.next      # skip the bad node\n        else:\n            curr = curr.next\n    return dummy.next` },
        { type: "p", text: `Even if the value to remove is the head's value, even if every node has the bad value (returning an empty list), this handles it correctly. The dummy never changes; dummy.next is whatever the new head turned out to be.` },
        { type: "callout", text: `Use a dummy whenever your output list's head might be different from the input's head. This applies to deletion, merging, and most construction problems. The few lines of overhead pay for themselves many times over in correctness.` }
      ]
    },
    {
      heading: "3. Reversal: the most important technique",
      blocks: [
        { type: "p", text: `Reversing a linked list is the single most useful linked-list skill. It appears as a sub-step in dozens of other problems: reverse in groups, reverse a range, palindrome check, reorder list. Master the basic reversal cold and the variants become straightforward.` },
        { type: "h3", text: "3.1 The canonical iterative reversal" },
        { type: "code", code: `def reverse(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next       # 1. remember the next node\n        curr.next = prev      # 2. flip the current pointer\n        prev = curr           # 3. advance prev\n        curr = nxt            # 4. advance curr\n    return prev               # prev is the new head` },
        { type: "p", text: `The four-line body is the canonical move. Memorise it. It comes up so often that interviewers expect you to be able to write it without a second's hesitation.` },
        { type: "diagram", kind: "linkedlist", data: { values: [1, 2, 3, 4], cycleTo: -1, pointers: [{ name: "head", index: 0, color: "#6FA8FF" }] }, caption: "Before reversal: 1 -> 2 -> 3 -> 4." },
        { type: "diagram", kind: "linkedlist", data: { values: [4, 3, 2, 1], cycleTo: -1, pointers: [{ name: "prev/new head", index: 0, color: "#5FD79E" }] }, caption: "After reversal: every next pointer is flipped; prev becomes the new head (4 -> 3 -> 2 -> 1)." },
        { type: "h3", text: "Tracing through [1 -> 2 -> 3]" },
        { type: "code", code: `Initial:      prev = None, curr = 1\n                          1 -> 2 -> 3 -> None\nAfter iter 1: prev = 1, curr = 2\n              None <- 1     2 -> 3 -> None\nAfter iter 2: prev = 2, curr = 3\n              None <- 1 <- 2     3 -> None\nAfter iter 3: prev = 3, curr = None\n              None <- 1 <- 2 <- 3` },
        { type: "callout", text: `The order of the four lines matters. If you advance curr before saving nxt, you lose access to the rest of the list. If you flip the pointer before saving nxt, same problem. The save-flip-advance order is the only one that works.` },
        { type: "h3", text: "3.2 Recursive reversal" },
        { type: "p", text: `The same algorithm written recursively:` },
        { type: "code", code: `def reverse(head):\n    if not head or not head.next:\n        return head\n    new_head = reverse(head.next)\n    head.next.next = head      # the node we passed now points back at us\n    head.next = None           # break our old forward pointer\n    return new_head` },
        { type: "p", text: `Less common in interviews because it uses O(n) stack space, but worth knowing as another angle on the algorithm. The tricky line is head.next.next = head: we're telling the node we already recursed past to point back at us.` },
        { type: "h3", text: "3.3 Reverse a sublist (between positions m and n)" },
        { type: "p", text: `Problem: reverse the nodes from position m to n (1-indexed). Everything outside that range stays the same.` },
        { type: "p", text: `Strategy. Walk to position m-1 (the node just before the section to reverse). Then run the canonical reversal for n - m + 1 steps. Then stitch the reversed section back into the surrounding list.` },
        { type: "code", code: `def reverseBetween(head, m, n):\n    dummy = ListNode(0, head)\n    before = dummy\n    for _ in range(m - 1):\n        before = before.next\n\n    # before is the node just before the reversed section\n    # tail will become the tail of the reversed section\n    tail = before.next\n    prev = None\n    curr = tail\n    for _ in range(n - m + 1):\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n\n    # Stitch back: before -> prev (new head of reversed) -> ... -> tail -> curr (rest of list)\n    before.next.next = curr\n    before.next = prev\n    return dummy.next` },
        { type: "p", text: `The dummy node earns its keep here — it handles the case where m = 1, which would otherwise require special-casing the head. The stitching step is the subtle part: after the reversal, before.next is still pointing at the tail of the reversed section (which used to be its head), and prev is the new head.` },
        { type: "h3", text: "3.4 Reverse nodes in K-groups" },
        { type: "p", text: `Problem: reverse every K consecutive nodes. The leftover tail (less than K nodes) stays as is.` },
        { type: "code", code: `def reverseKGroup(head, k):\n    # Check we have at least k nodes ahead\n    node = head\n    for _ in range(k):\n        if not node:\n            return head        # fewer than k left, don't reverse\n        node = node.next\n\n    # Reverse k nodes starting at head\n    prev = None\n    curr = head\n    for _ in range(k):\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n\n    # head is now the tail of this group; recursively process the rest\n    head.next = reverseKGroup(curr, k)\n    return prev` },
        { type: "p", text: `The recursion is on the rest of the list after this group; the result of the recursive call becomes the new next of the old head (which is now the tail of the reversed group). Iterative versions exist and are more space-efficient, but the recursive version is what most people write under time pressure.` }
      ]
    },
    {
      heading: "4. Two-pointer patterns",
      blocks: [
        { type: "p", text: `Two pointers walking a linked list at different rates (or with a fixed gap) unlock several classic problems. The technique is essentially the linked-list version of the array two-pointer pattern.` },
        { type: "h3", text: "4.1 Fast and slow: find the middle" },
        { type: "p", text: `Problem: return the middle node of a linked list (the second middle if even length).` },
        { type: "p", text: `Technique: walk two pointers, fast moving twice as fast as slow. When fast reaches the end, slow is at the middle.` },
        { type: "code", code: `def middleNode(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow` },
        { type: "p", text: `Tracing for length 5 (nodes 1-2-3-4-5): slow walks 1, 2, 3. Fast walks 1, 3, 5. When fast is at 5 and fast.next is None, slow is at 3 — the middle.` },
        { type: "diagram", kind: "linkedlist", data: { values: [1, 2, 3, 4, 5], cycleTo: -1, pointers: [{ name: "slow", index: 2, color: "#6FA8FF" }, { name: "fast", index: 4, color: "#E0A23B" }] }, caption: "Final positions for length 5: fast (amber) is at the tail, slow (blue) has landed on the middle node 3." },
        { type: "p", text: `For length 6 (1-2-3-4-5-6): slow ends at 4 (the second middle). If you want the first middle (3), change the condition slightly — but for most LeetCode problems, the second middle is what's wanted.` },
        { type: "h3", text: "4.2 The gap pattern: nth node from the end" },
        { type: "p", text: `Problem: remove the nth node from the end of the list.` },
        { type: "p", text: `Technique: two pointers with a gap of n between them. Move the fast pointer n steps ahead, then move both at the same speed until fast hits the end. Slow is then n nodes from the end.` },
        { type: "code", code: `def removeNthFromEnd(head, n):\n    dummy = ListNode(0, head)\n    fast = slow = dummy\n\n    # Advance fast n + 1 steps so slow lands on the node BEFORE the target\n    for _ in range(n + 1):\n        fast = fast.next\n\n    # Move both until fast falls off\n    while fast:\n        slow = slow.next\n        fast = fast.next\n\n    # slow.next is the node to remove\n    slow.next = slow.next.next\n    return dummy.next` },
        { type: "p", text: `The dummy is critical here. If we have to remove the head itself (n equals the length), without the dummy we'd need a special case. With the dummy, slow lands on it and slow.next = slow.next.next correctly skips the original head.` },
        { type: "callout", text: `Why n + 1 steps and not n? We want slow to land on the node before the target, so we can delete by skipping. Advancing fast one extra step pushes slow one position earlier in the final layout.` }
      ]
    },
    {
      heading: "5. Cycle detection: Floyd's tortoise and hare",
      blocks: [
        { type: "p", text: `Problem: does the linked list contain a cycle? (And if so, where does it start?)` },
        { type: "p", text: `Floyd's algorithm. Walk two pointers, fast at double speed. If there's no cycle, fast reaches the end. If there's a cycle, fast will eventually lap slow inside the cycle — they meet.` },
        { type: "code", code: `def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False` },
        { type: "diagram", kind: "linkedlist", data: { values: [1, 2, 3, 4, 5], cycleTo: 2, pointers: [{ name: "head", index: 0, color: "#6FA8FF" }] }, caption: "A cycle: the tail (node 5) points back to node 3 (cycleTo: 2) instead of None, so fast will eventually lap slow inside the loop." },
        { type: "h3", text: "5.1 Finding the cycle's entry point" },
        { type: "p", text: `Once fast and slow meet inside the cycle, here's a beautiful trick: reset one pointer to the head and walk both at the same speed. They'll meet again exactly at the cycle's start.` },
        { type: "diagram", kind: "linkedlist", data: { values: [1, 2, 3, 4, 5], cycleTo: 2, pointers: [{ name: "ptr", index: 0, color: "#5FD79E" }, { name: "slow", index: 2, color: "#6FA8FF" }], highlight: [2] }, caption: "Finding the entry: reset ptr (green) to head and walk both at the same speed. They meet at node 3 — the cycle's start (cycleTo: 2)." },
        { type: "code", code: `def detectCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            # Cycle detected; now find its start\n            ptr = head\n            while ptr is not slow:\n                ptr = ptr.next\n                slow = slow.next\n            return ptr\n    return None` },
        { type: "p", text: `The math. Let L = distance from head to cycle start. Let C = cycle length. When slow and fast first meet, slow has travelled L + k (some distance into the cycle); fast has travelled twice that. The difference (which is a multiple of C) gives us a useful identity, and the result is that the distance from head to cycle start equals the distance from the meeting point to cycle start (going forward in the cycle). So two pointers walking at the same speed, one from head and one from the meeting point, will meet exactly at the cycle start.` },
        { type: "callout", text: `You don't need to be able to re-derive this proof in an interview, but you should be able to write the code. "Two pointers, fast/slow, then reset one to head" is a memorable enough recipe.` }
      ]
    },
    {
      heading: "6. Merging linked lists",
      blocks: [
        { type: "p", text: `Problem: merge two sorted linked lists into one sorted linked list. The result reuses the input nodes (no new allocations).` },
        { type: "code", code: `def mergeTwoLists(l1, l2):\n    dummy = ListNode(0)\n    tail = dummy\n    while l1 and l2:\n        if l1.val <= l2.val:\n            tail.next = l1\n            l1 = l1.next\n        else:\n            tail.next = l2\n            l2 = l2.next\n        tail = tail.next\n    tail.next = l1 or l2          # attach whichever remains\n    return dummy.next` },
        { type: "p", text: `The pattern is universal. Dummy node + tail pointer. The tail is what you append to; the dummy holds the answer. After the loop, one list is exhausted and the other is just tacked on whole — no need to walk through it. l1 or l2 is Python's short-circuit: it returns the first truthy value.` },
        { type: "diagram", kind: "linkedlist", data: { values: [1, 3, 5], cycleTo: -1, pointers: [{ name: "l1", index: 0, color: "#6FA8FF" }] }, caption: "First sorted input list: 1 -> 3 -> 5." },
        { type: "diagram", kind: "linkedlist", data: { values: [2, 4, 6], cycleTo: -1, pointers: [{ name: "l2", index: 0, color: "#E0A23B" }] }, caption: "Second sorted input list: 2 -> 4 -> 6." },
        { type: "diagram", kind: "linkedlist", data: { values: [1, 2, 3, 4, 5, 6], cycleTo: -1, pointers: [{ name: "head", index: 0, color: "#5FD79E" }] }, caption: "Merged result: nodes from both lists interleaved into sorted order (1 -> 2 -> 3 -> 4 -> 5 -> 6)." },
        { type: "h3", text: "6.1 Merge K sorted lists" },
        { type: "p", text: `Problem: merge K sorted lists into one.` },
        { type: "p", text: `Heap approach (covered in the heaps guide): push the heads of all K lists into a min-heap; repeatedly pop the smallest and push its next. O(N log K) where N is total nodes.` },
        { type: "p", text: `Divide-and-conquer alternative: recursively merge pairs of lists. Same complexity, no heap needed, often easier to write in an interview:` },
        { type: "code", code: `def mergeKLists(lists):\n    if not lists: return None\n    while len(lists) > 1:\n        merged = []\n        for i in range(0, len(lists), 2):\n            l1 = lists[i]\n            l2 = lists[i + 1] if i + 1 < len(lists) else None\n            merged.append(mergeTwoLists(l1, l2))\n        lists = merged\n    return lists[0]` },
        { type: "p", text: `Each pass halves the number of lists. After log K passes, one list remains. Each pass touches each node once, giving O(N log K) total.` }
      ]
    },
    {
      heading: "7. Reordering and partitioning",
      blocks: [
        { type: "h3", text: "7.1 Reorder list (L0, Ln, L1, Ln-1, L2, ...)" },
        { type: "p", text: `Problem: reorder a list so that the first node alternates with the last, second with second-to-last, and so on.` },
        { type: "p", text: `Decomposes into three subproblems, each of which we already know:` },
        { type: "ol", items: [
          `Find the middle of the list (fast/slow).`,
          `Reverse the second half.`,
          `Merge the two halves alternately.`
        ] },
        { type: "code", code: `def reorderList(head):\n    if not head or not head.next: return\n\n    # 1. Find the middle\n    slow = fast = head\n    while fast.next and fast.next.next:\n        slow = slow.next\n        fast = fast.next.next\n\n    # 2. Reverse the second half\n    second = slow.next\n    slow.next = None\n    prev = None\n    while second:\n        nxt = second.next\n        second.next = prev\n        prev = second\n        second = nxt\n\n    # 3. Merge the two halves alternately\n    first, second = head, prev\n    while second:\n        t1, t2 = first.next, second.next\n        first.next = second\n        second.next = t1\n        first, second = t1, t2` },
        { type: "callout", text: `This is a perfect example of why mastering primitives matters. Three subproblems, each previously covered, compose into the full solution. Solving "reorder list" cold without those primitives would be a nightmare; with them, it's mechanical.` },
        { type: "h3", text: "7.2 Palindrome linked list" },
        { type: "p", text: `Same decomposition: find the middle, reverse the second half, then walk the two halves comparing values.` },
        { type: "code", code: `def isPalindrome(head):\n    # Find middle\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n\n    # Reverse second half\n    prev = None\n    while slow:\n        nxt = slow.next\n        slow.next = prev\n        prev = slow\n        slow = nxt\n\n    # Compare\n    left, right = head, prev\n    while right:\n        if left.val != right.val:\n            return False\n        left = left.next\n        right = right.next\n    return True` },
        { type: "h3", text: "7.3 Partition list" },
        { type: "p", text: `Problem: given a value x, partition the list so all nodes less than x come before all nodes greater than or equal to x, preserving relative order.` },
        { type: "p", text: `Two dummies, two tails. Walk through the list, appending each node to one of two sub-lists. Concatenate at the end.` },
        { type: "code", code: `def partition(head, x):\n    less_dummy = ListNode(0)\n    more_dummy = ListNode(0)\n    less, more = less_dummy, more_dummy\n    while head:\n        if head.val < x:\n            less.next = head\n            less = less.next\n        else:\n            more.next = head\n            more = more.next\n        head = head.next\n    more.next = None              # terminate the more list\n    less.next = more_dummy.next   # stitch them together\n    return less_dummy.next` },
        { type: "callout", text: `The more.next = None at the end is crucial. Without it, the last node in the "more" list might still point at some old successor, creating a cycle or stray pointer. Always terminate the tails of partitioned lists explicitly.` }
      ]
    },
    {
      heading: "8. Designing with linked lists: LRU cache",
      blocks: [
        { type: "p", text: `Problem: implement an LRU (Least Recently Used) cache supporting get(key) and put(key, value), both in O(1) average time. When the cache exceeds its capacity, evict the least-recently-used entry.` },
        { type: "p", text: `The data structure. A doubly linked list of (key, value) nodes, ordered by recency (most recent at the head), plus a hashmap from key to node. The hashmap gives O(1) lookup; the doubly linked list gives O(1) reordering and eviction.` },
        { type: "callout", text: `Why doubly linked? To remove a node from the middle of the list in O(1), you need its predecessor — which a singly linked list can't give you without walking. Doubly linked lists have a prev pointer at every node.` },
        { type: "code", code: `class Node:\n    def __init__(self, key=0, value=0):\n        self.key, self.value = key, value\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.cache = {}                    # key -> Node\n        # Two dummy nodes simplify all edge cases\n        self.head = Node()                 # most recently used\n        self.tail = Node()                 # least recently used\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_to_front(self, node):\n        node.prev = self.head\n        node.next = self.head.next\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key):\n        if key not in self.cache:\n            return -1\n        node = self.cache[key]\n        self._remove(node)\n        self._add_to_front(node)\n        return node.value\n\n    def put(self, key, value):\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = Node(key, value)\n        self.cache[key] = node\n        self._add_to_front(node)\n        if len(self.cache) > self.cap:\n            lru = self.tail.prev\n            self._remove(lru)\n            del self.cache[lru.key]` },
        { type: "p", text: `The two dummy nodes (head and tail) are essential. Every real node always has a real predecessor and successor — no None checks anywhere. The _remove and _add_to_front helpers are simple four-line operations.` },
        { type: "callout", text: `LRU cache is one of the most frequently asked design problems. The combination of hashmap (for lookup) + doubly linked list (for ordering) is also the pattern for LFU cache, MRU, and several scheduler-style problems.` },
        { type: "h3", text: "Python shortcut: OrderedDict" },
        { type: "p", text: `Python's collections.OrderedDict already supports O(1) move-to-end and remove-first, which gives a one-screen LRU implementation. Interviewers usually want to see the doubly linked list version explicitly, but it's worth knowing the shortcut.` },
        { type: "code", code: `from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap = capacity\n        self.cache = OrderedDict()\n\n    def get(self, key):\n        if key not in self.cache: return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n\n    def put(self, key, value):\n        if key in self.cache:\n            self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.cap:\n            self.cache.popitem(last=False)` }
      ]
    },
    {
      heading: "9. Common bugs",
      blocks: [
        { type: "table", headers: ["Bug", "What goes wrong"], rows: [
          ["Overwriting next before saving it", "curr.next = prev before nxt = curr.next drops the rest of the list. Always save first, then mutate."],
          ["Missing the dummy node", "Head-modifying operations (delete first node, merge, build new list) without a dummy require fragile head-special-case code. Use a dummy."],
          ["Not terminating a partitioned tail", "When you split a list into pieces, the last node in each piece may still point at a stale successor. Set tail.next = None explicitly when finished."],
          ["Off-by-one in fast/slow position", "For \"middle\", different conditions give different middles. For \"nth from end\", advancing fast n vs n + 1 changes whether slow lands on the target or the predecessor. Trace by hand for length 3 and 4."],
          ["Cycle in the output unintentionally", "Forgetting to break a backward pointer (especially after reversal sub-problems) creates a cycle. Visually trace the final layout."],
          ["Comparing nodes by value when you mean identity", "slow == fast may or may not compare by value depending on whether you override __eq__. For cycle detection, use slow is fast (identity)."],
          ["Recursion stack on long lists", "Recursive solutions hit Python's recursion limit on lists longer than ~1000. Use iterative versions for large inputs."],
          ["Modifying input when it's not allowed", "Some problems require you not to mutate the input. Reversal in particular rewires pointers — clone the list first if needed."],
          ["Forgetting to handle empty / single-node input", "Many algorithms work fine on n >= 2 but crash on n = 0 or n = 1. Always include the guard at the top."]
        ] }
      ]
    },
    {
      heading: "10. Study plan",
      blocks: [
        { type: "p", text: `Drill in order. Each problem builds a skill the later ones depend on.` },
        { type: "table", headers: ["#", "Problem", "Skill", "Group"], rows: [
          ["1", "Reverse linked list", "The four-line canonical reversal.", "Foundations"],
          ["2", "Middle of the linked list", "Fast and slow pointers.", "Foundations"],
          ["3", "Remove duplicates from sorted list", "Single-pointer walk with conditional skip.", "Foundations"],
          ["4", "Remove linked list elements", "Dummy node trick.", "Foundations"],
          ["5", "Linked list cycle", "Floyd's tortoise and hare.", "Two pointers and structure"],
          ["6", "Linked list cycle II", "Find cycle entry — reset pointer trick.", "Two pointers and structure"],
          ["7", "Remove nth node from end of list", "Gap-based two pointers + dummy.", "Two pointers and structure"],
          ["8", "Intersection of two linked lists", "Two pointers that switch heads when they reach end.", "Two pointers and structure"],
          ["9", "Merge two sorted lists", "Dummy + tail pattern.", "Merging"],
          ["10", "Merge K sorted lists", "Heap or divide-and-conquer.", "Merging"],
          ["11", "Sort list", "Merge sort on linked lists; uses middle finder + merge.", "Merging"],
          ["12", "Reverse linked list II (between m and n)", "Reverse a sublist; stitch back.", "Reversal variants"],
          ["13", "Reverse nodes in K-group", "Recursive group reversal.", "Reversal variants"],
          ["14", "Swap nodes in pairs", "Special case of K-group with k = 2.", "Reversal variants"],
          ["15", "Palindrome linked list", "Middle + reverse + compare.", "Reordering"],
          ["16", "Reorder list", "Middle + reverse + interleave.", "Reordering"],
          ["17", "Partition list", "Two dummies, two tails.", "Reordering"],
          ["18", "Odd even linked list", "Two-pointer split and stitch.", "Reordering"],
          ["19", "LRU cache", "Doubly linked list + hashmap.", "Design"],
          ["20", "LFU cache", "Frequency buckets, each a doubly linked list.", "Design"],
          ["21", "Copy list with random pointer", "Hashmap from old to new nodes, two-pass build.", "Advanced"],
          ["22", "Add two numbers (as linked lists)", "Digit-by-digit traversal with carry.", "Advanced"],
          ["23", "Rotate list", "Find length, mod, find new tail.", "Advanced"],
          ["24", "Flatten a multilevel doubly linked list", "Recursion or stack-based DFS.", "Advanced"]
        ] }
      ]
    },
    {
      heading: "11. One-page cheat sheet",
      blocks: [
        { type: "h3", text: "Patterns by trigger" },
        { type: "table", headers: ["When the problem says...", "Reach for..."], rows: [
          ["\"Reverse / unreverse a list (or a part of it)\"", "The four-line canonical reversal. For sublists, walk to the boundary first."],
          ["\"Find the middle\"", "Fast and slow pointers."],
          ["\"Nth from the end\"", "Gap-based two pointers + dummy node."],
          ["\"Cycle\"", "Floyd's tortoise and hare. For entry point, reset one to head after meeting."],
          ["\"Merge sorted lists\"", "Dummy + tail. Take whichever head is smaller, advance, repeat."],
          ["\"Remove / modify head\"", "Use a dummy node so the head isn't a special case."],
          ["\"Reorder / palindrome / odd-even\"", "Find middle, reverse second half, then merge/compare/stitch."],
          ["\"Cache with O(1) operations\"", "Hashmap + doubly linked list."]
        ] },
        { type: "h3", text: "The four-line canonical reversal" },
        { type: "code", code: `prev, curr = None, head\nwhile curr:\n    nxt = curr.next\n    curr.next = prev\n    prev = curr\n    curr = nxt\nreturn prev` },
        { type: "h3", text: "The fast-slow middle finder" },
        { type: "code", code: `slow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n# slow is at the middle (second middle if even length)` },
        { type: "h3", text: "The dummy-and-tail merge" },
        { type: "code", code: `dummy = ListNode(0)\ntail = dummy\nwhile l1 and l2:\n    if l1.val <= l2.val:\n        tail.next, l1 = l1, l1.next\n    else:\n        tail.next, l2 = l2, l2.next\n    tail = tail.next\ntail.next = l1 or l2\nreturn dummy.next` },
        { type: "h3", text: "The mental model" },
        { type: "callout", text: `Linked-list problems decompose into a small number of primitives — reverse, find middle, merge, two-pointer walk, dummy node. Most "hard" linked-list problems are 2-3 primitives chained together. Master the primitives first; the composite problems become exercises in recognising the components.` }
      ]
    }
  ],
  cheatsheet: [
    `Node: class ListNode: __init__(self, val=0, next=None) — chain ends at a node whose next is None.`,
    `Cardinal rule: before overwriting a pointer, make sure you can still reach everything you need. Save first, then mutate.`,
    `Dummy node: dummy = ListNode(0, head); work via dummy; return dummy.next. Use whenever the output head may differ from the input head (delete, merge, build).`,
    `Canonical reversal (4 lines): nxt = curr.next; curr.next = prev; prev = curr; curr = nxt. Return prev. Order is save-flip-advance.`,
    `Recursive reversal: new_head = reverse(head.next); head.next.next = head; head.next = None; return new_head. O(n) stack.`,
    `Reverse sublist [m, n]: dummy + walk to before(m-1), reverse n-m+1 nodes, stitch before.next.next = curr; before.next = prev.`,
    `Reverse K-group: bail if fewer than k ahead; reverse k nodes; head.next = reverseKGroup(curr, k); return prev.`,
    `Find middle (fast/slow): while fast and fast.next: slow=slow.next; fast=fast.next.next — slow is the second middle if even length.`,
    `Nth from end: dummy; advance fast n+1 steps; move both until fast falls off; slow.next = slow.next.next. The +1 lands slow on the predecessor.`,
    `Cycle detection (Floyd): fast at 2x; if slow is fast there's a cycle. Use identity (is), not == .`,
    `Cycle entry: after meeting, reset one pointer to head, walk both at same speed; they meet at the cycle start.`,
    `Merge two sorted: dummy + tail; append smaller head, advance; tail.next = l1 or l2 at the end.`,
    `Merge K sorted: min-heap of heads (O(N log K)) or divide-and-conquer merging pairs (same complexity, no heap).`,
    `Reorder / palindrome: find middle, reverse second half, then merge alternately / compare.`,
    `Partition: two dummies + two tails; append by value; more.next = None; less.next = more_dummy.next. Always terminate tails.`,
    `LRU cache: hashmap (key -> node) + doubly linked list with head/tail dummies. get/put are O(1) via _remove + _add_to_front; evict tail.prev. OrderedDict (move_to_end / popitem(last=False)) is the shortcut.`,
    `Guard empty / single-node inputs (n = 0, n = 1) at the top; iterative beats recursive on lists longer than ~1000.`
  ]
}
