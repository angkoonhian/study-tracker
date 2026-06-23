export default {
  id: "heaps-graphs",
  title: "Heaps, Priority Queues & Graphs",
  subtitle: "A complete reference: data structures, algorithms, patterns, and problem archetypes",
  emoji: "",
  intro: `This guide covers two of the most important interview topics in one document, because they are deeply linked: heaps power Dijkstra's algorithm and Prim's MST, and union-find quietly underpins Kruskal's. By the end, you should be able to look at any LeetCode graph or heap problem and immediately know which pattern to apply.\n\nPart I builds heaps and priority queues from the ground up: the data structure, Python's heapq, the standard patterns (top K, merge K sorted, two-heap median, scheduling). Part II is a thorough graph tour: representations, BFS, DFS, connected components, cycle detection, topological sort, union-find, shortest paths (BFS, Dijkstra, Bellman-Ford), MST (Prim's, Kruskal's), bipartite checking, and grid problems. Heaps and graphs meet most explicitly in the shortest-path and MST sections.\n\nPart I: Heaps & Priority Queues. A priority queue is an abstract data type: it stores items and lets you efficiently retrieve the one with the highest (or lowest) priority. A heap is the standard concrete implementation. The two terms get used interchangeably, but technically the priority queue is the interface and the heap is the data structure that delivers it.`,
  sections: [
    {
      heading: "1. What is a heap",
      blocks: [
        { type: "p", text: `A heap is a binary tree with two strict properties:` },
        { type: "ul", items: [
          `Heap property. In a min-heap, every parent is less than or equal to its children. (In a max-heap, every parent is greater than or equal to its children.) Either way, the root holds the extremum.`,
          `Shape property. The tree is complete: every level is full except possibly the last, which fills left to right. This is what lets us store the whole thing in an array.`
        ]},
        { type: "h3", text: "1.1 Example: a min-heap" },
        { type: "code", code: `        1
       / \\
      3   2
     / \\ / \\
    7  5 4  6` },
        { type: "p", text: `Notice that 1 is the smallest and every parent is smaller than its children. But siblings have no required order — 3 and 2 do not need to be sorted relative to each other, and neither do 7, 5, 4, 6. The heap only enforces the parent-child relationship, not a full ordering.` },
        { type: "h3", text: "1.2 Heaps are arrays" },
        { type: "p", text: `Because the tree is complete, you don't store pointers. Just write the values into an array level by level. The heap above is stored as:` },
        { type: "code", code: `[1, 3, 2, 7, 5, 4, 6]` },
        { type: "diagram", kind: "tree", data: { nodes: [1, 3, 6, 5, 9, 8], highlight: [1] }, caption: "A min-heap viewed as a binary tree (level-order). The root (highlighted) is the minimum; every parent ≤ its children." },
        { type: "diagram", kind: "array", data: { values: [1, 3, 6, 5, 9, 8], highlight: [0], labels: { "0": "root", "1": "child of 0", "2": "child of 0" } }, caption: "The SAME heap as a flat array. Node at index i: parent = (i-1)//2, left child = 2i+1, right child = 2i+2. So index 0's children are indices 1 and 2; index 1's children are indices 3 and 4." },
        { type: "p", text: `And navigation is pure arithmetic. For the node at index i:` },
        { type: "ul", items: [
          `Parent index: (i - 1) // 2`,
          `Left child index: 2*i + 1`,
          `Right child index: 2*i + 2`
        ]},
        { type: "callout", text: `No pointer chasing, excellent cache locality, dead simple to implement. This is why heaps are the standard priority queue implementation.` },
        { type: "h3", text: "1.3 Why heaps matter" },
        { type: "p", text: `Heaps give you the fastest possible way to repeatedly access the minimum (or maximum) of a changing collection. If you only needed it once, sorting would do. If you only needed to add things, an unsorted list would do. Heaps shine when both happen, interleaved: insert, peek-min, insert, extract-min, insert, peek-min...` },
        { type: "p", text: `Concrete use cases: scheduling (always run the highest-priority task next), Dijkstra's algorithm (always relax the closest unvisited node next), top K problems, median maintenance, merging K sorted streams.` }
      ]
    },
    {
      heading: "2. Operations and complexity",
      blocks: [
        { type: "p", text: `Three core operations (plus heapify), all on a min-heap (max-heap is symmetric).` },
        { type: "table",
          headers: ["Operation", "Cost", "What happens"],
          rows: [
            ["Peek (top)", "O(1)", "Return heap[0]. Don't remove."],
            ["Push (insert)", "O(log n)", "Append to the end of the array, then \"sift up\": swap with parent while smaller. Touches at most one node per level, so the cost is the tree height."],
            ["Pop (extract-min)", "O(log n)", "Take heap[0] (the answer), move the last element to position 0, then \"sift down\": swap with the smaller child while smaller. Again O(height)."],
            ["Heapify (build from list)", "O(n)", "Sift-down from the last non-leaf to the root. The amortised total is O(n), not O(n log n) — most nodes are near the bottom and have very short sift paths."]
          ]
        },
        { type: "h3", text: "2.1 Sift-up in pseudocode" },
        { type: "diagram", kind: "array", data: { values: [1, 3, 6, 5, 9, 2], pointers: [{ name: "i", index: 5, color: "#5FD79E" }, { name: "parent", index: 2, color: "#6FA8FF" }], highlight: [5] }, caption: "Sift-up after pushing 2 at the end (index 5). Compare with parent (i-1)//2 = 2, which holds 6. Since 2 < 6, swap upward; repeat until the parent is smaller or we reach the root." },
        { type: "code", code: `def sift_up(heap, i):
    while i > 0:
        parent = (i - 1) // 2
        if heap[i] < heap[parent]:
            heap[i], heap[parent] = heap[parent], heap[i]
            i = parent
        else:
            break` },
        { type: "h3", text: "2.2 Sift-down in pseudocode" },
        { type: "diagram", kind: "tree", data: { nodes: [9, 3, 6, 5, 4, 8], highlight: [9] }, caption: "Sift-down after extract-min moved the last element (9) to the root. The highlighted root violates the heap property: swap it with its smaller child (3), then continue sinking it down until both children are larger." },
        { type: "code", code: `def sift_down(heap, i):
    n = len(heap)
    while True:
        left, right = 2*i + 1, 2*i + 2
        smallest = i
        if left  < n and heap[left]  < heap[smallest]: smallest = left
        if right < n and heap[right] < heap[smallest]: smallest = right
        if smallest == i: break
        heap[i], heap[smallest] = heap[smallest], heap[i]
        i = smallest` },
        { type: "p", text: `You almost never implement these in interview code — Python ships with heapq. But knowing what happens underneath is important: it tells you why operations are O(log n), why heap order is different from sorted order, and why an arbitrary update to a heap element is expensive.` },
        { type: "h3", text: "2.3 Why heapify is O(n) and not O(n log n)" },
        { type: "p", text: `It looks like you're doing n sift-downs of O(log n) each, but the bound is loose. Nodes near the bottom are far more numerous and have very short sift paths. The exact sum works out to O(n). This matters in practice because heapq.heapify(list) on a list of n items is significantly faster than pushing them one by one — the latter is O(n log n).` }
      ]
    },
    {
      heading: "3. Python's heapq module",
      blocks: [
        { type: "p", text: `Python's standard library ships a min-heap in heapq. It operates on a regular list, in place. There is no Heap class — you call module functions on your list.` },
        { type: "code", code: `import heapq
nums = [5, 3, 8, 1, 9, 2]
heapq.heapify(nums)         # O(n) - turn list into a heap in place
# nums is now [1, 3, 2, 5, 9, 8]
heapq.heappush(nums, 4)     # O(log n)
smallest = heapq.heappop(nums)   # O(log n), returns 1
peek = nums[0]              # O(1), smallest without removing` },
        { type: "h3", text: "3.1 The full heapq API" },
        { type: "table",
          headers: ["Function", "What it does"],
          rows: [
            ["heapify(list)", "Rearranges the list into a min-heap in place. O(n)."],
            ["heappush(heap, item)", "Adds item to the heap. O(log n)."],
            ["heappop(heap)", "Removes and returns the smallest item. O(log n)."],
            ["heappushpop(heap, item)", "Pushes item, then pops the smallest, in one operation. Faster than separate push and pop calls."],
            ["heapreplace(heap, item)", "Pops the smallest, then pushes item. Useful when you know you want to replace the top and don't care to see the old top."],
            ["nlargest(k, iter)", "Returns the k largest items. Internally uses a min-heap of size k. O(n log k)."],
            ["nsmallest(k, iter)", "Returns the k smallest items. O(n log k)."]
          ]
        },
        { type: "h3", text: "3.2 Max-heap: the negation trick" },
        { type: "p", text: `There is no heapq max-heap. The idiomatic workaround is to negate values on push and pop:` },
        { type: "code", code: `max_heap = []
for val in values:
    heapq.heappush(max_heap, -val)
largest = -heapq.heappop(max_heap)` },
        { type: "p", text: `It looks ugly but it's clean once you see it everywhere. The negation inverts the order, so the "smallest" item in the min-heap is the most negative, which is the most positive of the originals.` },
        { type: "h3", text: "3.3 Tuples for keyed priorities" },
        { type: "p", text: `Tuples compare lexicographically — first element first, ties broken by subsequent elements. This makes them ideal as heap entries when you need to attach extra information to a priority.` },
        { type: "code", code: `tasks = []
heapq.heappush(tasks, (3, 'write docs'))    # (priority, task)
heapq.heappush(tasks, (1, 'fix bug'))
heapq.heappush(tasks, (2, 'review PR'))
while tasks:
    priority, task = heapq.heappop(tasks)
    print(f'{priority}: {task}')
# 1: fix bug
# 2: review PR
# 3: write docs` },
        { type: "h3", text: "3.4 The tie-breaker trap" },
        { type: "p", text: `If two priorities are equal, Python compares the next tuple element. If that element is a non-comparable type (a custom class without __lt__, or a list), you get a TypeError. The standard fix is to insert a monotonically increasing counter as a tie-breaker:` },
        { type: "code", code: `import itertools
counter = itertools.count()
heapq.heappush(heap, (priority, next(counter), payload))
# Even if priority ties, the counter is unique - no comparison of payloads.` },
        { type: "callout", text: `This trick rescues you when you store dicts, custom objects, or anything that doesn't naturally compare. Memorise it; it shows up in real code.` }
      ]
    },
    {
      heading: "4. Priority queue patterns",
      blocks: [
        { type: "p", text: `Five patterns cover the vast majority of heap problems. Internalise these and you can recognise the structure of most heap questions immediately.` },
        { type: "h3", text: "4.1 Pattern 1: Top K / Kth largest" },
        { type: "p", text: `Given an array, find the K largest elements (or the Kth largest). The naive approach is to sort: O(n log n). The heap approach is O(n log k) and uses O(k) space.` },
        { type: "callout", text: `Trick: use a min-heap of size K. Whenever the heap exceeds K, pop the smallest. At the end, the heap contains exactly the K largest items, and the root is the Kth largest.` },
        { type: "code", code: `def find_kth_largest(nums, k):
    heap = []
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)   # discard the smallest
    return heap[0]               # the Kth largest` },
        { type: "p", text: `Why a min-heap and not a max-heap? Counter-intuitive at first, but the logic is: you want to throw away small things. A min-heap puts the smallest at the top, which is the easiest to discard. The K items left are the largest.` },
        { type: "p", text: `When k is much smaller than n, this is a huge win: O(n log k) instead of O(n log n). When k is close to n, the difference is negligible.` },
        { type: "h3", text: "4.2 Pattern 2: Merge K sorted lists or streams" },
        { type: "p", text: `You have K sorted lists. Merge them into one sorted output. With K = 2, this is a basic merge. With K large, the heap approach is best: O(N log K), where N is the total number of elements.` },
        { type: "code", code: `def merge_k_sorted(lists):
    heap = []
    # Seed the heap with the first element of each list
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))   # (val, list_idx, elem_idx)

    result = []
    while heap:
        val, list_idx, elem_idx = heapq.heappop(heap)
        result.append(val)
        if elem_idx + 1 < len(lists[list_idx]):
            next_val = lists[list_idx][elem_idx + 1]
            heapq.heappush(heap, (next_val, list_idx, elem_idx + 1))
    return result` },
        { type: "p", text: `The heap holds at most K elements at a time — one frontier from each list. Pop the smallest, advance that list by one, push its next element. The list_idx in the tuple serves as a tie-breaker so equal values don't try to compare lists (which would raise TypeError).` },
        { type: "h3", text: "4.3 Pattern 3: Top K frequent / by computed key" },
        { type: "p", text: `Variant of Pattern 1: you're not picking by the elements themselves, but by a derived quantity (frequency, length, score).` },
        { type: "code", code: `from collections import Counter
def top_k_frequent(nums, k):
    count = Counter(nums)
    heap = []                                # min-heap on (freq, num)
    for num, freq in count.items():
        heapq.heappush(heap, (freq, num))
        if len(heap) > k:
            heapq.heappop(heap)
    return [num for freq, num in heap]` },
        { type: "p", text: `Or, more compactly: heapq.nlargest(k, count.keys(), key=count.get). Same big-O, fewer lines.` },
        { type: "h3", text: "4.4 Pattern 4: Two heaps (running median)" },
        { type: "p", text: `Numbers stream in. After each arrival, report the running median. With two heaps you can do each operation in O(log n) and the median query in O(1).` },
        { type: "p", text: `The setup. Keep a max-heap for the lower half of the numbers and a min-heap for the upper half. Keep their sizes balanced (differ by at most 1). The median is then the top of one heap, or the average of the two tops.` },
        { type: "code", code: `class MedianFinder:
    def __init__(self):
        self.lo = []   # max-heap (use negation), holds the smaller half
        self.hi = []   # min-heap, holds the larger half
    def add(self, num):
        # 1. Push into the appropriate heap
        heapq.heappush(self.lo, -num)
        # 2. Move the largest of lo to hi to maintain ordering
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        # 3. Rebalance sizes if hi is bigger
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))
    def median(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2` },
        { type: "p", text: `Why the dance through hi? Just pushing into lo doesn't guarantee ordering — the new element might belong on the hi side. So we push it into lo, then immediately move lo's max to hi. This guarantees that max(lo) <= min(hi). Then we rebalance.` },
        { type: "h3", text: "4.5 Pattern 5: Scheduling / interval problems" },
        { type: "p", text: `Whenever you need to repeatedly pick "the next thing to expire" or "the room that frees up soonest", reach for a heap keyed on the expiration time.` },
        { type: "p", text: `Meeting rooms II: given intervals, what is the minimum number of rooms needed?` },
        { type: "code", code: `def min_meeting_rooms(intervals):
    intervals.sort(key=lambda x: x[0])    # sort by start time
    heap = []                              # heap of end times
    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heappop(heap)            # reuse the room that ended
        heapq.heappush(heap, end)
    return len(heap)` },
        { type: "p", text: `The heap size at any moment is the number of rooms in use. At the end, its peak size — which is exactly its final size, since we only push when we have to — is the answer.` }
      ]
    },
    {
      heading: "5. Common heap bugs",
      blocks: [
        { type: "table",
          headers: ["Bug", "What goes wrong"],
          rows: [
            ["Forgetting heapq is min-only", "Reaching for a max-heap and getting min behaviour. Negate values, or use heapq.nlargest / nsmallest."],
            ["Wrong heap direction in top-K", "Using a max-heap for \"top K largest\" feels right but is wrong: you'd have to keep all n elements. Use a min-heap of size K and discard the smallest. Symmetric for top-K-smallest."],
            ["Comparing non-comparable payloads", "Pushing (priority, payload) where two priorities tie and payload is a list/dict/custom object. Python tries to compare the payloads and raises TypeError. Fix: insert a unique counter as a tie-breaker."],
            ["Mutating heap items after push", "Heap invariants depend on comparison values. If you store mutable objects and mutate them after push, the heap quietly becomes invalid. Either store immutable snapshots, or treat the heap as append-only."],
            ["Using list.pop(0) by accident", "heap.pop(0) returns heap[0] but does NOT re-heapify. Use heapq.heappop(heap)."],
            ["Building a heap with repeated heappush", "n calls to heappush is O(n log n). heapq.heapify(list) is O(n). Always heapify when you have all items at once."],
            ["Stale entries (lazy deletion)", "When you can't update an item in the heap, you push a new entry and ignore stale ones at pop time. Forgetting the \"is this stale?\" check leads to using outdated values. Common in Dijkstra implementations."]
          ]
        },
        { type: "h3", text: "5.1 The lazy-deletion idiom" },
        { type: "p", text: `Heaps don't support "update an arbitrary element" cheaply — it's O(n) to find it. The standard workaround is lazy deletion: when you want to update item X to a better value, just push the new value as a new entry, and ignore the old entry when it eventually surfaces.` },
        { type: "code", code: `# Inside Dijkstra and similar algorithms:
while heap:
    d, node = heapq.heappop(heap)
    if d > dist[node]:   # stale entry, skip
        continue
    # ... process node ...` },
        { type: "p", text: `You may pop the same node multiple times, but at most one entry per node matters. The check d > dist[node] filters out the obsolete entries.` }
      ]
    },
    {
      heading: "6. Foundations and terminology",
      blocks: [
        { type: "p", text: `Part II: Graphs. Graphs are the most general data structure in this guide: trees are a special case (acyclic, connected, n - 1 edges), and grids are an implicit graph in disguise. Almost any problem about "reachability", "connection", "ordering with constraints", or "shortest path" is a graph problem.` },
        { type: "h3", text: "6.1 What is a graph" },
        { type: "p", text: `A graph is a set of vertices (also called nodes) connected by edges. Notation: G = (V, E). Vertices represent entities; edges represent relationships.` },
        { type: "h3", text: "6.2 Core terminology" },
        { type: "table",
          headers: ["Term", "Meaning"],
          rows: [
            ["Vertex (node)", "A point in the graph. Vertices are usually labelled 0..n-1 or with strings."],
            ["Edge", "A connection between two vertices. May be directed or undirected, weighted or unweighted."],
            ["Directed graph (digraph)", "Edges have direction. Edge (u, v) means \"u points to v\", but not the reverse."],
            ["Undirected graph", "Edges have no direction. Edge (u, v) means u and v are mutually connected. Internally usually stored as both (u, v) and (v, u)."],
            ["Weighted graph", "Each edge has a numeric weight (cost, distance, capacity)."],
            ["Path", "A sequence of vertices connected by edges. A simple path has no repeated vertex."],
            ["Cycle", "A path that starts and ends at the same vertex. A graph with no cycles is acyclic."],
            ["DAG", "Directed Acyclic Graph. Critical for topological sort and many scheduling problems."],
            ["Degree", "Number of edges touching a vertex. In a directed graph, split into in-degree (incoming) and out-degree (outgoing)."],
            ["Connected (undirected)", "Every vertex is reachable from every other. A graph that isn't connected splits into connected components."],
            ["Strongly connected (directed)", "Every vertex is reachable from every other, following edge directions. Disjoint pieces are strongly connected components (SCCs)."],
            ["Bipartite", "Vertices can be split into two sets such that every edge crosses between sets (no edge within a set). Equivalent to: the graph is 2-colourable."],
            ["Tree", "A connected undirected graph with no cycles, or equivalently, exactly n - 1 edges. Trees are the smallest connected graphs."]
          ]
        },
        { type: "callout", text: `The single most important distinction is directed vs undirected. It changes what "connected" means, what cycle detection looks like, whether topological sort applies, and how you represent edges. Always identify this first.` }
      ]
    },
    {
      heading: "7. Graph representations",
      blocks: [
        { type: "p", text: `How you store the graph determines which operations are fast. Three formats cover everything in practice.` },
        { type: "h3", text: "7.1 Adjacency list" },
        { type: "p", text: `A dictionary or list-of-lists, where each vertex maps to its list of neighbours. This is the default in LeetCode.` },
        { type: "code", code: `# Using a dict (works for any vertex label, including strings):
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D'],
    'C': ['A'],
    'D': ['B'],
}
# Using a list of lists (when vertices are 0..n-1, more compact):
n = 4
graph = [[] for _ in range(n)]
edges = [(0,1), (0,2), (1,3)]
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)         # undirected: add both directions` },
        { type: "p", text: `Space: O(V + E). Iterating neighbours of v: O(degree(v)). Checking if edge (u, v) exists: O(degree(u)) — slow if you query this often. Use a set of neighbours per vertex if you need fast lookups.` },
        { type: "p", text: `For weighted graphs:` },
        { type: "code", code: `graph = {
    'A': [('B', 4), ('C', 2)],   # (neighbour, weight)
    'B': [('A', 4), ('D', 5)],
    'C': [('A', 2)],
    'D': [('B', 5)],
}` },
        { type: "h3", text: "7.2 Adjacency matrix" },
        { type: "p", text: `A 2D array M[u][v] where the entry indicates the edge between u and v (1/0 for unweighted, weight for weighted, infinity for missing edges in shortest-path code).` },
        { type: "code", code: `n = 4
M = [[0] * n for _ in range(n)]
edges = [(0,1), (0,2), (1,3)]
for u, v in edges:
    M[u][v] = 1
    M[v][u] = 1                  # undirected` },
        { type: "p", text: `Space: O(V^2). Edge lookup: O(1). Iterate neighbours: O(V), even if most are absent.` },
        { type: "p", text: `Use a matrix when the graph is dense (E close to V^2) or you need many edge-existence queries. Use an adjacency list otherwise.` },
        { type: "h3", text: "7.3 Edge list" },
        { type: "p", text: `Just a list of edges, sometimes with weights: [(u, v), (u, v, w), ...]. Useful when the algorithm iterates over all edges (Bellman-Ford, Kruskal's MST) and doesn't need fast neighbour lookups.` },
        { type: "h3", text: "7.4 Implicit graphs" },
        { type: "p", text: `Sometimes the graph isn't explicitly given — it's implied by the problem structure. The vertices and edges exist conceptually but aren't stored. Recognising these is half the battle.` },
        { type: "ul", items: [
          `Grids. Each cell is a vertex; edges go to the 4 (or 8) adjacent cells. "Number of islands", "shortest path in a grid", "flood fill" are all graph problems on an implicit grid graph.`,
          `Word ladder. Each word is a vertex; an edge exists between two words that differ by exactly one character.`,
          `State-space search. Each configuration (puzzle state, board layout) is a vertex; moves are edges. "Open the lock", "sliding puzzle", "minimum genetic mutations".`
        ]},
        { type: "callout", text: `The pattern is the same: BFS or DFS as usual, but the neighbour function computes neighbours on the fly instead of looking them up in a stored structure.` }
      ]
    },
    {
      heading: "8. Breadth-first search (BFS)",
      blocks: [
        { type: "p", text: `BFS explores the graph in waves outward from a starting vertex. Use a queue. The fundamental property: BFS visits vertices in order of their (unweighted) distance from the source.` },
        { type: "h3", text: "8.1 Standard template" },
        { type: "diagram", kind: "graph", data: { nodes: ["A", "B", "C", "D", "E", "F"], edges: [["A", "B"], ["A", "C"], ["B", "D"], ["C", "E"], ["D", "F"], ["E", "F"]], directed: false, positions: { "A": [0, 1], "B": [1, 0], "C": [1, 2], "D": [2, 0], "E": [2, 2], "F": [3, 1] }, highlight: ["A", "B", "C"] }, caption: "Undirected graph for BFS from A. BFS expands in waves: level 0 = {A}, level 1 = {B, C} (highlighted), level 2 = {D, E}, level 3 = {F}. The first time you reach a node is via a shortest unweighted path." },
        { type: "code", code: `from collections import deque
def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        # process(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)` },
        { type: "callout", text: `Two critical details. Add to visited when you enqueue a vertex, not when you dequeue it. Otherwise the same vertex gets added to the queue multiple times via different paths, blowing up the runtime. And use deque, not a list — list.pop(0) is O(n).` },
        { type: "h3", text: "8.2 BFS for shortest path (unweighted)" },
        { type: "p", text: `Since BFS visits vertices in order of distance, the first time you reach the target is via a shortest path. Track distance as you go:` },
        { type: "code", code: `def shortest_path_length(graph, start, target):
    if start == target: return 0
    visited = {start}
    queue = deque([(start, 0)])
    while queue:
        node, d = queue.popleft()
        for neighbour in graph[node]:
            if neighbour == target:
                return d + 1
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append((neighbour, d + 1))
    return -1   # unreachable` },
        { type: "p", text: `Storing the distance in the tuple alongside the node is one common style. Another is to do level-by-level BFS like in the trees guide, where each outer iteration is one "step" away from the source.` },
        { type: "h3", text: "8.3 Multi-source BFS" },
        { type: "p", text: `Sometimes you have multiple starting points and want the shortest distance from any of them. The trick: enqueue them all initially with distance 0.` },
        { type: "code", code: `# Example: rotting oranges.
# Each rotten orange spreads to its 4 neighbours per minute.
# How many minutes until all are rotten?
def oranges_rotting(grid):
    R, C = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 2:
                queue.append((r, c, 0))
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    while queue:
        r, c, t = queue.popleft()
        minutes = t
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r+dr, c+dc
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh -= 1
                queue.append((nr, nc, t+1))
    return minutes if fresh == 0 else -1` },
        { type: "diagram", kind: "grid", data: { cells: [[2, 1, 1], [1, 1, 0], [0, 1, 1]], highlight: [[0, 1], [1, 0]], colors: { "0,0": "#E0A23B" } }, caption: "Rotting oranges grid: 2 = rotten (amber, a source), 1 = fresh, 0 = empty. Minute 1 frontier (highlighted) is the cells adjacent to the source. Multi-source BFS enqueues every rotten cell at distance 0 and spreads outward together." },
        { type: "callout", text: `Without multi-source BFS, you'd need to run BFS from every rotten orange and take the minimum at each cell. With it, one pass solves it. Pattern: any time you ask "distance to the nearest of these K things", try multi-source BFS.` }
      ]
    },
    {
      heading: "9. Depth-first search (DFS)",
      blocks: [
        { type: "p", text: `DFS dives as deep as possible before backtracking. Use a stack (or recursion). The fundamental property: DFS explores one branch fully before considering siblings. This makes it the right tool for structural questions (cycles, components, topological order), not shortest-path questions.` },
        { type: "h3", text: "9.1 Recursive DFS template" },
        { type: "code", code: `def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    # process(start)
    for neighbour in graph[start]:
        if neighbour not in visited:
            dfs(graph, neighbour, visited)
    return visited` },
        { type: "h3", text: "9.2 Iterative DFS template" },
        { type: "code", code: `def dfs_iter(graph, start):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        # process(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                stack.append(neighbour)
    return visited` },
        { type: "callout", text: `When to prefer iterative DFS. Python's recursion limit defaults to around 1000. On large or pathological inputs (long chains, deep grids), recursive DFS will blow the stack. Either raise the limit with sys.setrecursionlimit(...) or use the iterative version. For trees of practical sizes, recursion is fine.` },
        { type: "h3", text: "9.3 BFS vs DFS: when to choose which" },
        { type: "table",
          headers: ["Use BFS when...", "Use DFS when..."],
          rows: [
            ["You need the shortest path in an unweighted graph.", "You need to detect cycles."],
            ["You need to explore by distance (level-by-level work).", "You need topological order (postorder DFS)."],
            ["You're looking for the nearest target.", "You're enumerating paths or doing backtracking."],
            ["Multi-source spreading (rotting oranges, walls and gates).", "Connected components, structural exploration."],
            ["The graph is wide but shallow.", "The graph is deep and recursion fits."]
          ]
        }
      ]
    },
    {
      heading: "10. Connected components",
      blocks: [
        { type: "p", text: `An undirected graph splits into one or more connected components — maximal sets of vertices where every pair is connected. Finding them is one of the simplest, most fundamental graph operations.` },
        { type: "h3", text: "10.1 Counting components with DFS" },
        { type: "code", code: `def count_components(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    visited = set()
    components = 0

    def dfs(node):
        visited.add(node)
        for nb in graph[node]:
            if nb not in visited:
                dfs(nb)

    for v in range(n):
        if v not in visited:
            dfs(v)
            components += 1
    return components` },
        { type: "p", text: `The pattern: loop over all vertices. Each time you find an unvisited one, it's the seed of a new component — do a DFS/BFS from it, marking everyone reachable, then increment the counter. Works identically with BFS.` },
        { type: "p", text: `Connected components on a grid (with cells as vertices and edges to adjacent cells) is the same algorithm. "Number of islands" is just "count connected components on a 0/1 grid where 1s are walkable".` },
        { type: "h3", text: "10.2 Counting components with Union-Find" },
        { type: "p", text: `Union-Find is a competitive alternative when edges arrive one at a time (online problems). See section 13 for the full data structure.` }
      ]
    },
    {
      heading: "11. Cycle detection",
      blocks: [
        { type: "p", text: `Whether a graph contains a cycle depends sensitively on whether it's directed or undirected. The algorithms are different. Get this wrong and you'll either miss cycles or report false positives.` },
        { type: "h3", text: "11.1 Undirected: visited + parent check" },
        { type: "p", text: `In an undirected graph, every edge naturally goes "back" to its other endpoint. The trick is to skip the immediate parent when looking for back-edges. A cycle exists if we find a visited node that isn't our parent.` },
        { type: "code", code: `def has_cycle_undirected(graph, n):
    visited = set()

    def dfs(node, parent):
        visited.add(node)
        for nb in graph[node]:
            if nb not in visited:
                if dfs(nb, node):
                    return True
            elif nb != parent:
                return True       # back-edge to a non-parent: cycle!
        return False

    for v in range(n):
        if v not in visited:
            if dfs(v, -1):
                return True
    return False` },
        { type: "p", text: `Union-Find is the other standard approach for undirected cycle detection: for each edge (u, v), if find(u) == find(v), they're already in the same component, and adding this edge would create a cycle.` },
        { type: "h3", text: "11.2 Directed: three-colour DFS" },
        { type: "p", text: `In a directed graph, the parent-check trick doesn't work — direction matters. The standard algorithm uses three colours:` },
        { type: "ul", items: [
          `WHITE — not yet visited.`,
          `GRAY — currently on the DFS stack (i.e., we entered it but haven't finished yet).`,
          `BLACK — fully processed and exited.`
        ]},
        { type: "p", text: `A cycle exists iff DFS finds an edge into a GRAY node. That's a "back edge" — we're currently visiting that ancestor, and we just found a way back to it.` },
        { type: "code", code: `WHITE, GRAY, BLACK = 0, 1, 2

def has_cycle_directed(graph, n):
    color = [WHITE] * n

    def dfs(node):
        if color[node] == GRAY:  return True   # back-edge
        if color[node] == BLACK: return False  # already done
        color[node] = GRAY
        for nb in graph[node]:
            if dfs(nb):
                return True
        color[node] = BLACK
        return False

    for v in range(n):
        if color[v] == WHITE and dfs(v):
            return True
    return False` },
        { type: "callout", text: `A common bug is to use a single boolean visited set and call it cycle detection. That misses the distinction between "on the current path" and "already fully processed". Both are visited; only one indicates a cycle. The three-colour scheme makes this explicit.` }
      ]
    },
    {
      heading: "12. Topological sort",
      blocks: [
        { type: "p", text: `A topological order is a linear ordering of a DAG's vertices such that for every directed edge u to v, u comes before v. Only DAGs have topological orders — if there's a cycle, no valid ordering exists.` },
        { type: "callout", text: `When you see it. Course prerequisites, task scheduling with dependencies, build systems, recipe ordering, deadlock checking. Anywhere you have "X must happen before Y", reach for topological sort.` },
        { type: "diagram", kind: "graph", data: { nodes: ["A", "B", "C", "D", "E"], edges: [["A", "C"], ["B", "C"], ["C", "D"], ["C", "E"], ["D", "E"]], directed: true, positions: { "A": [0, 0], "B": [0, 2], "C": [1, 1], "D": [2, 0], "E": [2, 2] }, highlight: ["A", "B"] }, caption: "A DAG. Edges point from prerequisite to dependent. A and B have in-degree 0 (highlighted) so Kahn's algorithm starts there. One valid topological order: A, B, C, D, E — every edge points forward in the order." },
        { type: "h3", text: "12.1 Kahn's algorithm (BFS-based)" },
        { type: "p", text: `Track each vertex's in-degree. Start with vertices that have in-degree 0 (no prerequisites). Remove them one at a time, decrementing the in-degree of their successors. Whenever a successor's in-degree drops to 0, queue it.` },
        { type: "code", code: `from collections import deque
def topo_sort_kahn(graph, n):
    in_degree = [0] * n
    for u in range(n):
        for v in graph[u]:
            in_degree[v] += 1

    queue = deque(i for i in range(n) if in_degree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in graph[node]:
            in_degree[nb] -= 1
            if in_degree[nb] == 0:
                queue.append(nb)

    if len(order) != n:
        return []          # cycle detected; no valid order
    return order` },
        { type: "p", text: `Bonus: Kahn's algorithm doubles as a cycle detector. If your output doesn't include all n vertices, the leftover ones are stuck behind a cycle.` },
        { type: "h3", text: "12.2 DFS-based (postorder)" },
        { type: "p", text: `Do a DFS. As each node finishes (postorder), prepend it to the result. Reverse postorder is a topological order.` },
        { type: "code", code: `def topo_sort_dfs(graph, n):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n
    order = []
    has_cycle = [False]

    def dfs(node):
        if color[node] == GRAY:
            has_cycle[0] = True
            return
        if color[node] == BLACK: return
        color[node] = GRAY
        for nb in graph[node]:
            dfs(nb)
        color[node] = BLACK
        order.append(node)

    for v in range(n):
        if color[v] == WHITE:
            dfs(v)

    return [] if has_cycle[0] else order[::-1]` },
        { type: "p", text: `Why postorder reversed? The last node to finish in DFS is one with no outgoing dependencies — it should come first in the topological order. Reversing the order in which nodes finish gives you exactly that.` },
        { type: "p", text: `Either algorithm is fine. Kahn's is often cleaner to write, and it gives you cycle detection "for free" via the length check. DFS is a nice fit when you're already doing other DFS work on the same graph.` }
      ]
    },
    {
      heading: "13. Union-Find (Disjoint Set Union)",
      blocks: [
        { type: "p", text: `Union-Find (also called Disjoint Set Union, or DSU) maintains a partition of elements into disjoint sets. It supports two operations, both nearly O(1) with the right optimisations:` },
        { type: "ul", items: [
          `find(x) — return the representative (root) of the set containing x.`,
          `union(x, y) — merge the sets containing x and y.`
        ]},
        { type: "p", text: `Two elements are in the same set iff they have the same root. That gives you a fast "are these connected?" query.` },
        { type: "diagram", kind: "graph", data: { nodes: ["0", "1", "2", "3", "4", "5"], edges: [["1", "0"], ["2", "0"], ["3", "0"], ["5", "4"]], directed: true, positions: { "0": [1, 0], "1": [0, 1], "2": [1, 1], "3": [2, 1], "4": [3, 0], "5": [3, 1] }, highlight: ["0", "4"] }, caption: "Union-Find as a forest. Each directed edge is a parent pointer (child → root). Two roots here (highlighted: 0 and 4) means two disjoint sets: {0,1,2,3} and {4,5}. find(x) follows pointers to the root; two elements are connected iff they share a root." },
        { type: "h3", text: "13.1 The data structure" },
        { type: "code", code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))   # every node is its own root
        self.rank   = [0] * n          # approximate tree height

    def find(self, x):
        # Path compression: flatten the tree on the way up
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False                # already in the same set
        # Union by rank: attach shorter under taller
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True` },
        { type: "h3", text: "13.2 Why the two optimisations matter" },
        { type: "ul", items: [
          `Path compression in find: every time we walk up to find the root, point every node along the way directly at the root. Future find calls on those nodes are nearly constant time.`,
          `Union by rank in union: always attach the shorter tree under the taller one. Keeps the trees as flat as possible.`
        ]},
        { type: "callout", text: `Together they give amortised O(α(n)) per operation, where α is the inverse Ackermann function — effectively constant for any input size you will ever encounter.` },
        { type: "h3", text: "13.3 When to reach for Union-Find" },
        { type: "ul", items: [
          `Cycle detection in undirected graphs. Process edges one at a time; if both endpoints already have the same root, adding the edge would create a cycle.`,
          `Counting connected components. Build the union-find from the edge list, then count the distinct roots: len(set(uf.find(i) for i in range(n))).`,
          `Kruskal's MST. Sort edges by weight, greedily add each edge that doesn't form a cycle (use union-find to check).`,
          `Online connectivity queries. Edges arrive dynamically; after each edge, you can answer "are u and v connected?" instantly.`,
          `Accounts merge, friends grouping, equation equality problems. Any time the question reduces to "are these in the same group?".`
        ]},
        { type: "h3", text: "13.4 Example: counting components after a series of unions" },
        { type: "code", code: `def count_components(n, edges):
    uf = UnionFind(n)
    for u, v in edges:
        uf.union(u, v)
    return len({uf.find(i) for i in range(n)})` }
      ]
    },
    {
      heading: "14. Shortest paths",
      blocks: [
        { type: "p", text: `Three algorithms (plus Floyd-Warshall for all pairs) cover almost every shortest-path problem you'll meet. Picking the right one depends on the graph's edge weights.` },
        { type: "table",
          headers: ["Algorithm", "Use when...", "Time"],
          rows: [
            ["BFS", "Edges are unweighted (or all weights equal).", "O(V + E)"],
            ["Dijkstra", "Edge weights are non-negative.", "O((V + E) log V) with heap"],
            ["Bellman-Ford", "Edge weights may be negative (no negative cycles, or you want to detect them).", "O(V · E)"],
            ["Floyd-Warshall", "You need shortest paths between all pairs, V small.", "O(V^3)"]
          ]
        },
        { type: "h3", text: "14.1 BFS for unweighted shortest path" },
        { type: "p", text: `Already covered in section 8. BFS naturally visits vertices in order of their distance from the source. If your graph is unweighted, this is the right tool — no need for Dijkstra's overhead.` },
        { type: "h3", text: "14.2 Dijkstra's algorithm" },
        { type: "p", text: `The classic shortest-path algorithm for non-negative weights. The intuition: always extend the shortest known path next. With a min-heap keyed on tentative distance, this becomes a clean implementation.` },
        { type: "diagram", kind: "graph", data: { nodes: ["A", "B", "C", "D"], edges: [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"]], directed: true, positions: { "A": [0, 1], "B": [1, 0], "C": [1, 2], "D": [2, 1] }, highlight: ["A"] }, caption: "Dijkstra example (weights not drawn): A→B = 1, A→C = 4, B→D = 5, C→D = 1. Shortest A→D = 5 via A→B→D (1+5=6) vs A→C→D (4+1=5), so C→D wins. The min-heap always pops the closest unsettled node next; the stale-entry check skips outdated heap entries." },
        { type: "code", code: `import heapq
def dijkstra(graph, start):
    # graph[u] = list of (neighbour, weight)
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    heap = [(0, start)]

    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue              # stale entry (lazy deletion)
        for neighbour, weight in graph[node]:
            new_dist = d + weight
            if new_dist < dist[neighbour]:
                dist[neighbour] = new_dist
                heapq.heappush(heap, (new_dist, neighbour))
    return dist` },
        { type: "p", text: `The lazy-deletion check is critical. When we find a better path to a node, we push a new entry rather than trying to update the old one. The old entry stays in the heap as a stale ghost. When it eventually pops, we recognise it (its distance exceeds the current known best) and skip it. Without this check, you'd reprocess nodes from outdated distances.` },
        { type: "callout", text: `Why Dijkstra fails on negative weights. Dijkstra greedily commits: once a node pops from the heap, its distance is considered final. This is sound only when every edge is non-negative, because then no future path through a more-distant node could possibly improve on the current best. With negative edges, a longer-but-with-negatives path could improve things later, and the greedy commitment is wrong.` },
        { type: "h3", text: "14.3 Bellman-Ford" },
        { type: "p", text: `Slower than Dijkstra but handles negative edges. Idea: relax every edge V - 1 times. After V - 1 passes, the shortest paths are settled. If a V-th pass would still relax anything, a negative cycle exists.` },
        { type: "code", code: `def bellman_ford(edges, n, start):
    dist = [float('inf')] * n
    dist[start] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    # Negative-cycle check
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return None     # negative cycle reachable from start
    return dist` },
        { type: "p", text: `Bellman-Ford is also a building block for SPFA and similar algorithms. In practice, you'll meet it on LeetCode when negative weights appear or when the problem asks about K-edge constraints ("cheapest flights within K stops").` }
      ]
    },
    {
      heading: "15. Minimum spanning tree (MST)",
      blocks: [
        { type: "p", text: `A spanning tree of a connected undirected graph is a subset of edges forming a tree that touches every vertex (n - 1 edges, no cycles). A minimum spanning tree minimises the total edge weight. Two classic greedy algorithms.` },
        { type: "h3", text: "15.1 Prim's algorithm (heap-based)" },
        { type: "p", text: `Grow the tree one vertex at a time, always picking the cheapest edge that extends it. Structurally identical to Dijkstra, but keying on edge weight rather than total distance from the source.` },
        { type: "code", code: `import heapq
def prim(graph, n):
    # graph[u] = list of (neighbour, weight)
    visited = [False] * n
    heap = [(0, 0)]            # (cost, node) - start anywhere
    total = 0
    edges_used = 0

    while heap and edges_used < n:
        cost, node = heapq.heappop(heap)
        if visited[node]:
            continue
        visited[node] = True
        total += cost
        edges_used += 1
        for nb, w in graph[node]:
            if not visited[nb]:
                heapq.heappush(heap, (w, nb))
    return total if edges_used == n else -1` },
        { type: "p", text: `Time: O((V + E) log V) with a binary heap — same complexity class as Dijkstra. Good when the graph is given as an adjacency list.` },
        { type: "h3", text: "15.2 Kruskal's algorithm (union-find based)" },
        { type: "p", text: `Sort all edges by weight. Walk through them in order, adding each one that doesn't form a cycle (check via union-find). Stop when you have n - 1 edges.` },
        { type: "code", code: `def kruskal(edges, n):
    # edges: list of (weight, u, v)
    edges.sort()
    uf = UnionFind(n)
    total = 0
    used = 0
    for w, u, v in edges:
        if uf.union(u, v):
            total += w
            used += 1
            if used == n - 1:
                break
    return total if used == n - 1 else -1` },
        { type: "p", text: `Time: O(E log E) for the sort, dominated by that. Kruskal's is often the cleaner choice when the input is naturally an edge list.` },
        { type: "callout", text: `The greedy property that makes both work: the cheapest edge crossing any cut of the graph is always part of some MST. Prim and Kruskal both exploit this in different orders — Prim grows from a vertex outward, Kruskal scans edges globally.` }
      ]
    },
    {
      heading: "16. Bipartite checking",
      blocks: [
        { type: "p", text: `A graph is bipartite if its vertices can be split into two sets such that every edge crosses between them. Equivalently: the graph is 2-colourable. Equivalently: the graph contains no odd-length cycle.` },
        { type: "p", text: `The standard algorithm: BFS or DFS, trying to 2-colour the graph. Each neighbour must get the opposite colour of the current node. A conflict means the graph isn't bipartite.` },
        { type: "code", code: `def is_bipartite(graph, n):
    color = [0] * n              # 0 = unvisited, 1/-1 = two colours
    for start in range(n):
        if color[start] != 0:
            continue
        color[start] = 1
        queue = deque([start])
        while queue:
            node = queue.popleft()
            for nb in graph[node]:
                if color[nb] == 0:
                    color[nb] = -color[node]
                    queue.append(nb)
                elif color[nb] == color[node]:
                    return False
    return True` }
      ]
    },
    {
      heading: "17. Grid problems",
      blocks: [
        { type: "p", text: `A 2D grid is implicitly a graph: each cell is a vertex, edges go to adjacent cells (4-directional by default, sometimes 8). Most "matrix" problems on LeetCode are graph problems in disguise. Recognising this unlocks a large family of questions.` },
        { type: "h3", text: "17.1 The standard skeleton" },
        { type: "code", code: `DIRS = [(-1, 0), (1, 0), (0, -1), (0, 1)]    # up, down, left, right
def solve(grid):
    R, C = len(grid), len(grid[0])

    def in_bounds(r, c):
        return 0 <= r < R and 0 <= c < C

    # ... use BFS or DFS with neighbour enumeration:
    # for dr, dc in DIRS:
    #     nr, nc = r + dr, c + dc
    #     if in_bounds(nr, nc) and ...:
    #         ...` },
        { type: "h3", text: "17.2 Common grid problem patterns" },
        { type: "table",
          headers: ["Problem", "Pattern"],
          rows: [
            ["Number of islands", "DFS/BFS to mark each connected component. Count the components."],
            ["Max area of island", "Same component traversal, but track size."],
            ["Flood fill", "DFS/BFS from the starting cell, replace matching colour."],
            ["Surrounded regions", "Trick: start from the borders. Anything reachable from the border stays. Everything else flips."],
            ["Rotting oranges", "Multi-source BFS from all rotten cells. Track time as you go."],
            ["Walls and gates", "Multi-source BFS from all gates. Each non-wall cell is filled with its distance to the nearest gate."],
            ["Shortest path in binary matrix", "BFS from start. 8-directional movement is allowed in many variants."],
            ["Pacific Atlantic water flow", "Two BFS/DFS sweeps - one from Pacific border, one from Atlantic. Intersection is the answer."],
            ["Word search", "DFS with backtracking. Mark cells as visited (in place or via a set), undo after returning."]
          ]
        },
        { type: "h3", text: "17.3 Marking cells: in-place vs separate visited set" },
        { type: "p", text: `Two common styles for tracking visited cells:` },
        { type: "ul", items: [
          `In-place mutation: overwrite the cell with a sentinel (e.g., set grid[r][c] = '#'). Saves memory, but mutates input. Works for many problems; check if the problem allows mutation.`,
          `Separate visited set: visited = set() with (r, c) tuples. Doesn't mutate input. Slightly more memory but always safe.`
        ]},
        { type: "p", text: `For backtracking (word search), you typically mark and then unmark on the way out, so the cell can be used by other paths.` }
      ]
    },
    {
      heading: "18. Common graph bugs",
      blocks: [
        { type: "table",
          headers: ["Bug", "What goes wrong"],
          rows: [
            ["Forgetting to mark visited on enqueue (BFS)", "Adding to visited only when popping leads to the same vertex sitting in the queue multiple times. Runtime can blow up to O(V^2) or worse. Mark on enqueue."],
            ["Forgetting to add both directions for undirected graphs", "If your input is undirected, you must add both (u, v) and (v, u) to the adjacency list — otherwise edges only go one way and you'll miss reachable nodes."],
            ["Cycle detection on directed graphs with a simple visited set", "A node being visited doesn't mean it's on the current DFS path. Use three colours (or a separate \"on stack\" set) for directed cycle detection."],
            ["Trying Dijkstra with negative edges", "Dijkstra's greedy correctness depends on non-negative weights. Use Bellman-Ford if negatives are possible."],
            ["No stale-entry check in Dijkstra", "Without if d > dist[node]: continue, you process the same node multiple times from outdated distances. Correctness may survive (since you only improve), but performance degrades."],
            ["Recursive DFS on large graphs", "Python's recursion limit is around 1000. Long chains and large grids hit it. Either raise the limit or use iterative DFS."],
            ["Forgetting the unreachable case", "After BFS for shortest path, the target might be unreachable. Return -1 or whatever the problem specifies, not None."],
            ["Sorting before iterating in topological algorithms", "Sorting adjacency lists doesn't produce a topological order. Use Kahn's or DFS postorder explicitly."],
            ["Tuple comparison in Dijkstra heap", "If you push (dist, node) and node is an object without __lt__, ties on dist raise TypeError. Use an integer ID or a counter as a tie-breaker."],
            ["Mutating a grid while iterating", "If you're modifying the grid in place during BFS, you need to set the sentinel as the cell is enqueued, not later. Otherwise the same cell gets added twice via different paths."]
          ]
        }
      ]
    },
    {
      heading: "19. Study plan",
      blocks: [
        { type: "p", text: `Drill these problems in order. Each one introduces or reinforces a pattern. If you can solve all 30, you can handle nearly any heap or graph problem in interviews.` },
        { type: "table",
          headers: ["#", "Problem", "Pattern reinforced"],
          rows: [
            ["—", "Heaps & Priority Queues", ""],
            ["1", "Kth largest element in an array", "Min-heap of size K."],
            ["2", "Top K frequent elements", "Heap on derived key (frequency)."],
            ["3", "K closest points to origin", "Heap on derived key (distance)."],
            ["4", "Merge K sorted lists", "Heap of frontiers, tuple tie-breaker."],
            ["5", "Find median from data stream", "Two-heap trick (max + min)."],
            ["6", "Meeting rooms II", "Heap of end times."],
            ["7", "Task scheduler", "Heap of frequencies plus cooldown bookkeeping."],
            ["8", "Last stone weight", "Repeated max-heap pop-pop-push."],
            ["—", "Graph fundamentals", ""],
            ["9", "Number of islands", "Connected components on a grid (DFS or BFS)."],
            ["10", "Max area of island", "Component traversal with size tracking."],
            ["11", "Flood fill", "Recursive grid DFS basics."],
            ["12", "Clone graph", "Graph traversal with hashmap for copies."],
            ["13", "Rotting oranges", "Multi-source BFS."],
            ["14", "Walls and gates", "Multi-source BFS, distances in place."],
            ["—", "Cycles, components, sort", ""],
            ["15", "Course schedule", "Cycle detection in directed graph (or Kahn's)."],
            ["16", "Course schedule II", "Topological sort, returning the order."],
            ["17", "Number of connected components in an undirected graph", "DFS or union-find."],
            ["18", "Graph valid tree", "Connectivity plus exactly n - 1 edges, no cycle."],
            ["19", "Redundant connection", "Union-find for cycle edge detection."],
            ["20", "Accounts merge", "Union-find on string identifiers."],
            ["—", "Shortest path and MST", ""],
            ["21", "Network delay time", "Dijkstra to all nodes; return the max."],
            ["22", "Cheapest flights within K stops", "Bellman-Ford or BFS with K constraint."],
            ["23", "Path with minimum effort", "Dijkstra with custom edge weight (max difference)."],
            ["24", "Min cost to connect all points", "MST via Prim's or Kruskal's."],
            ["25", "Swim in rising water", "Dijkstra or binary search + BFS."],
            ["—", "Bipartite and grid advanced", ""],
            ["26", "Is graph bipartite?", "Two-colour BFS/DFS."],
            ["27", "Possible bipartition", "Apply bipartite check on a hate graph."],
            ["28", "Pacific Atlantic water flow", "Two BFS/DFS sweeps from borders."],
            ["29", "Word ladder", "BFS on implicit word graph."],
            ["30", "Open the lock", "BFS on implicit state-space graph."]
          ]
        }
      ]
    },
    {
      heading: "20. One-page mental cheat sheet",
      blocks: [
        { type: "h3", text: "20.1 Heaps & priority queues" },
        { type: "table",
          headers: ["Trigger", "Use"],
          rows: [
            ["\"Top K\" or \"Kth largest\"", "Min-heap of size K. Discard the smallest as you go."],
            ["\"Merge K sorted...\"", "Heap of frontiers, tuple includes a unique index."],
            ["\"Running median\"", "Two heaps: max-heap for lower half, min-heap for upper. Rebalance after each insert."],
            ["\"Scheduling / next available\"", "Heap keyed on time of next availability or expiration."],
            ["\"Dijkstra-style relaxation\"", "Min-heap of (tentative-distance, node). Lazy deletion via stale check."],
            ["Need a max-heap in Python", "Negate values on push and pop."],
            ["Tied priorities + non-comparable payload", "Insert a unique counter as tie-breaker."]
          ]
        },
        { type: "h3", text: "20.2 Graphs" },
        { type: "table",
          headers: ["Trigger", "Use"],
          rows: [
            ["Shortest path, unweighted", "BFS."],
            ["Shortest path, non-negative weights", "Dijkstra (heap-based)."],
            ["Shortest path, possible negatives", "Bellman-Ford."],
            ["Components, reachability", "DFS or BFS. Loop over vertices, run from each unvisited one."],
            ["Cycle in undirected graph", "DFS with parent check, or union-find."],
            ["Cycle in directed graph", "Three-colour DFS, or Kahn's algorithm (length check)."],
            ["Ordering with prerequisites", "Topological sort (Kahn or DFS postorder)."],
            ["Dynamic connectivity / merging groups", "Union-Find with path compression and union by rank."],
            ["Minimum spanning tree", "Prim's (heap, like Dijkstra) or Kruskal's (sort + union-find)."],
            ["2-colourability / no odd cycle", "Bipartite check via BFS or DFS."],
            ["Grid problem", "Treat each cell as a vertex, 4-direction neighbours. Apply BFS or DFS."],
            ["\"Nearest of K sources\"", "Multi-source BFS — enqueue all sources at distance 0."]
          ]
        },
        { type: "h3", text: "20.3 The meta-trick" },
        { type: "p", text: `When you read a problem, the first question is always: is there a graph hiding in this? Cities and roads, courses and prerequisites, words differing by one letter, board positions and moves, equations and variables — these are all graphs. Once you see the graph, picking the algorithm is mostly mechanical: ask yourself whether you need shortest path or structural information, then check whether weights are involved, then pick from the table above.` },
        { type: "p", text: `The second question is whether a heap can speed something up. "Always process the smallest/largest thing next" is the signature. If that phrase fits the algorithm, you're going to want a heap.` }
      ]
    }
  ],
  cheatsheet: [
    `Heap = complete binary tree stored as an array; parent (i-1)//2, children 2i+1 / 2i+2. Root is the extremum.`,
    `heapq is min-only: peek heap[0] O(1), heappush/heappop O(log n), heapify O(n). Always heapify a full list instead of n pushes.`,
    `Max-heap in Python: negate values on push and pop.`,
    `Tied priorities with non-comparable payloads → insert itertools.count() as a unique tie-breaker before the payload.`,
    `Top K / Kth largest → min-heap of size K, discard the smallest. O(n log k).`,
    `Merge K sorted → heap of (value, list_idx, elem_idx) frontiers; list_idx is the tie-breaker.`,
    `Running median → two heaps (max-heap lower half + min-heap upper half), rebalanced to differ by ≤ 1.`,
    `Scheduling / Meeting rooms II → heap of end times; heap size = rooms in use.`,
    `Lazy deletion (Dijkstra): push new entries on improvement; skip stale pops with if d > dist[node]: continue.`,
    `Identify directed vs undirected first — it changes connectivity, cycle detection, topo sort, and edge storage.`,
    `Representations: adjacency list O(V+E) default; adjacency matrix O(V^2) for dense / O(1) edge lookups; edge list for Bellman-Ford & Kruskal.`,
    `BFS = queue, visits by unweighted distance → shortest path in unweighted graphs. Mark visited on ENQUEUE, use deque.`,
    `Multi-source BFS → enqueue all sources at distance 0 (rotting oranges, walls and gates, "nearest of K things").`,
    `DFS = stack/recursion → structural questions (cycles, components, topological order). Prefer iterative on deep inputs (recursion limit ~1000).`,
    `Connected components → loop vertices, DFS/BFS from each unvisited seed; or Union-Find. "Number of islands" = components on a grid.`,
    `Undirected cycle → DFS with parent check (back-edge to non-parent), or union-find (find(u)==find(v)).`,
    `Directed cycle → three-colour DFS; cycle iff edge into a GRAY (on-stack) node. A plain visited set is not enough.`,
    `Topological sort → Kahn's (in-degree 0 queue; len(order)!=n means cycle) or DFS reverse-postorder.`,
    `Union-Find → path compression + union by rank ⇒ amortised O(α(n)). Use for cycle detection, components, Kruskal, dynamic connectivity, grouping.`,
    `Shortest paths: unweighted → BFS; non-negative → Dijkstra O((V+E)log V); negatives → Bellman-Ford O(V·E) (V-1 relax passes + Vth-pass cycle check); all-pairs small V → Floyd-Warshall O(V^3).`,
    `Dijkstra fails on negative edges (greedy finalisation is unsound); Bellman-Ford detects negative cycles.`,
    `MST → Prim's (heap, like Dijkstra, adjacency list) or Kruskal's (sort edges + union-find, edge list). Cheapest edge across any cut is in some MST.`,
    `Bipartite = 2-colourable = no odd cycle → BFS/DFS giving neighbours the opposite colour; conflict ⇒ not bipartite.`,
    `Grids are implicit graphs: each cell a vertex, 4 (or 8) neighbours. DIRS = [(-1,0),(1,0),(0,-1),(0,1)]. Mark in-place sentinel or separate visited set; unmark for backtracking (word search).`,
    `Meta-trick: first ask "is there a graph hiding here?", then choose shortest-path vs structural and check for weights. "Always process the smallest/largest next" ⇒ use a heap.`
  ]
}
