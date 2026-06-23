// Offline Python coding problems: trees, graphs, tries, linked lists, stacks.
// Consumed by a Pyodide runner and a python3 verifier (eval(call) == eval(expected)).
// All binary-tree inputs use LeetCode level-order encoding with None for missing nodes.
// All order-ambiguous outputs are made deterministic (sorted) so == holds.

export const STRUCTURES = [
  // ------------------------------------------------------------------ Trees
  {
    id: "validate-bst",
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    topic: "Trees",
    statement: `Given the root of a binary tree, return True if it is a valid binary search tree (BST), else False.\n\nIn a valid BST, every node's left subtree contains only keys strictly less than the node's key, and the right subtree only keys strictly greater. This must hold for the whole subtree, not just immediate children.\n\nThe tree is given as a LeetCode-style level-order list where None marks a missing child. Build the tree inside your function.\n\nExample:\nInput: [2,1,3]\nThe tree is:\n    2\n   / \\\n  1   3\nOutput: True\n\nExample:\nInput: [5,1,4,None,None,3,6]\nNode 4 is in the right subtree of 5 but 4 < 5, so Output: False.`,
    funcName: "is_valid_bst",
    starter: `def is_valid_bst(root):\n    # root is a level-order list with None for missing nodes\n    # Your code here\n    pass`,
    solution: `def is_valid_bst(root):
    class N:
        __slots__ = ('val', 'left', 'right')
        def __init__(self, v):
            self.val = v
            self.left = None
            self.right = None
    def build(arr):
        if not arr or arr[0] is None:
            return None
        from collections import deque
        nodes = [N(x) if x is not None else None for x in arr]
        root = nodes[0]
        q = deque([0])
        i = 1
        while q and i < len(nodes):
            idx = q.popleft()
            cur = nodes[idx]
            if cur is None:
                continue
            if i < len(nodes):
                cur.left = nodes[i]
                if nodes[i] is not None:
                    q.append(i)
                i += 1
            if i < len(nodes):
                cur.right = nodes[i]
                if nodes[i] is not None:
                    q.append(i)
                i += 1
        return root
    r = build(root)
    def ok(node, lo, hi):
        if node is None:
            return True
        if not (lo < node.val < hi):
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
    return ok(r, float('-inf'), float('inf'))`,
    tests: [
      { call: "is_valid_bst([2,1,3])", expected: "True" },
      { call: "is_valid_bst([5,1,4,None,None,3,6])", expected: "False" },
      { call: "is_valid_bst([])", expected: "True" },
      { call: "is_valid_bst([1])", expected: "True" },
      { call: "is_valid_bst([10,5,15,None,None,6,20])", expected: "False" },
      { call: "is_valid_bst([2,2,2])", expected: "False" },
    ],
    hint: "Pass down an allowed (low, high) open interval and tighten it as you recurse.",
  },
  {
    id: "lowest-common-ancestor-bst",
    title: "Lowest Common Ancestor of a BST",
    difficulty: "Medium",
    topic: "Trees",
    statement: `Given the root of a BST (level-order list, None for missing) and two values p and q that both exist in the tree, return the value of their lowest common ancestor (LCA).\n\nThe LCA is the deepest node that has both p and q as descendants (a node may be a descendant of itself).\n\nExample:\nInput: root = [6,2,8,0,4,7,9,None,None,3,5], p = 2, q = 8\nOutput: 6\n\nExample:\nInput: root = [6,2,8,0,4,7,9,None,None,3,5], p = 2, q = 4\nOutput: 2  (2 is an ancestor of 4)`,
    funcName: "lca_bst",
    starter: `def lca_bst(root, p, q):\n    # root is a level-order list; return the LCA node's value\n    # Your code here\n    pass`,
    solution: `def lca_bst(root, p, q):
    from collections import deque
    class N:
        __slots__ = ('val', 'left', 'right')
        def __init__(self, v):
            self.val = v
            self.left = None
            self.right = None
    def build(arr):
        if not arr or arr[0] is None:
            return None
        nodes = [N(x) if x is not None else None for x in arr]
        qq = deque([0])
        i = 1
        while qq and i < len(nodes):
            cur = nodes[qq.popleft()]
            if cur is None:
                continue
            if i < len(nodes):
                cur.left = nodes[i]
                if nodes[i] is not None:
                    qq.append(i)
                i += 1
            if i < len(nodes):
                cur.right = nodes[i]
                if nodes[i] is not None:
                    qq.append(i)
                i += 1
        return nodes[0]
    cur = build(root)
    while cur:
        if p < cur.val and q < cur.val:
            cur = cur.left
        elif p > cur.val and q > cur.val:
            cur = cur.right
        else:
            return cur.val`,
    tests: [
      { call: "lca_bst([6,2,8,0,4,7,9,None,None,3,5], 2, 8)", expected: "6" },
      { call: "lca_bst([6,2,8,0,4,7,9,None,None,3,5], 2, 4)", expected: "2" },
      { call: "lca_bst([6,2,8,0,4,7,9,None,None,3,5], 3, 5)", expected: "4" },
      { call: "lca_bst([2,1], 2, 1)", expected: "2" },
      { call: "lca_bst([5], 5, 5)", expected: "5" },
    ],
    hint: "Walk down from the root: if both values are smaller go left, if both larger go right, otherwise you've found the split point.",
  },
  {
    id: "invert-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    topic: "Trees",
    statement: `Given the root of a binary tree (level-order list, None for missing), invert it (mirror left/right at every node) and return the inverted tree as a level-order list.\n\nTrim trailing None values from the returned list so it matches the canonical compact level-order form.\n\nExample:\nInput: [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]\n\nExample:\nInput: [2,1,3]\nOutput: [2,3,1]`,
    funcName: "invert_tree",
    starter: `def invert_tree(root):\n    # root is a level-order list; return inverted tree as a level-order list\n    # Your code here\n    pass`,
    solution: `def invert_tree(root):
    from collections import deque
    class N:
        __slots__ = ('val', 'left', 'right')
        def __init__(self, v):
            self.val = v
            self.left = None
            self.right = None
    def build(arr):
        if not arr or arr[0] is None:
            return None
        nodes = [N(x) if x is not None else None for x in arr]
        qq = deque([0])
        i = 1
        while qq and i < len(nodes):
            cur = nodes[qq.popleft()]
            if cur is None:
                continue
            if i < len(nodes):
                cur.left = nodes[i]
                if nodes[i] is not None:
                    qq.append(i)
                i += 1
            if i < len(nodes):
                cur.right = nodes[i]
                if nodes[i] is not None:
                    qq.append(i)
                i += 1
        return nodes[0]
    r = build(root)
    def flip(node):
        if node is None:
            return
        node.left, node.right = node.right, node.left
        flip(node.left)
        flip(node.right)
    flip(r)
    if r is None:
        return []
    out = []
    q = deque([r])
    while q:
        node = q.popleft()
        if node is None:
            out.append(None)
        else:
            out.append(node.val)
            q.append(node.left)
            q.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out`,
    tests: [
      { call: "invert_tree([4,2,7,1,3,6,9])", expected: "[4,7,2,9,6,3,1]" },
      { call: "invert_tree([2,1,3])", expected: "[2,3,1]" },
      { call: "invert_tree([])", expected: "[]" },
      { call: "invert_tree([1])", expected: "[1]" },
      { call: "invert_tree([1,2])", expected: "[1,None,2]" },
    ],
    hint: "Recursively swap each node's left and right children, then re-serialize with BFS and trim trailing Nones.",
  },
  {
    id: "diameter-of-tree",
    title: "Diameter of Binary Tree",
    difficulty: "Easy",
    topic: "Trees",
    statement: `Given the root of a binary tree (level-order list, None for missing), return its diameter: the length of the longest path between any two nodes, measured in number of edges. The path may or may not pass through the root.\n\nExample:\nInput: [1,2,3,4,5]\nThe longest path is 4 -> 2 -> 1 -> 3 (or 5 -> 2 -> 1 -> 3), 3 edges.\nOutput: 3\n\nExample:\nInput: [1,2]\nOutput: 1`,
    funcName: "diameter_of_tree",
    starter: `def diameter_of_tree(root):\n    # root is a level-order list; return the diameter in edges\n    # Your code here\n    pass`,
    solution: `def diameter_of_tree(root):
    from collections import deque
    class N:
        __slots__ = ('val', 'left', 'right')
        def __init__(self, v):
            self.val = v
            self.left = None
            self.right = None
    def build(arr):
        if not arr or arr[0] is None:
            return None
        nodes = [N(x) if x is not None else None for x in arr]
        qq = deque([0])
        i = 1
        while qq and i < len(nodes):
            cur = nodes[qq.popleft()]
            if cur is None:
                continue
            if i < len(nodes):
                cur.left = nodes[i]
                if nodes[i] is not None:
                    qq.append(i)
                i += 1
            if i < len(nodes):
                cur.right = nodes[i]
                if nodes[i] is not None:
                    qq.append(i)
                i += 1
        return nodes[0]
    r = build(root)
    best = [0]
    def depth(node):
        if node is None:
            return 0
        l = depth(node.left)
        rr = depth(node.right)
        best[0] = max(best[0], l + rr)
        return 1 + max(l, rr)
    depth(r)
    return best[0]`,
    tests: [
      { call: "diameter_of_tree([1,2,3,4,5])", expected: "3" },
      { call: "diameter_of_tree([1,2])", expected: "1" },
      { call: "diameter_of_tree([])", expected: "0" },
      { call: "diameter_of_tree([1])", expected: "0" },
      { call: "diameter_of_tree([1,2,3,4,None,None,5,6,None,None,7])", expected: "6" },
    ],
    hint: "For each node compute its height; the diameter through it is leftHeight + rightHeight. Track the max across all nodes.",
  },
  {
    id: "kth-smallest-bst",
    title: "Kth Smallest Element in a BST",
    difficulty: "Medium",
    topic: "Trees",
    statement: `Given the root of a BST (level-order list, None for missing) and an integer k (1-indexed), return the value of the kth smallest element in the tree.\n\nAn in-order traversal of a BST visits values in sorted ascending order.\n\nExample:\nInput: root = [3,1,4,None,2], k = 1\nOutput: 1\n\nExample:\nInput: root = [5,3,6,2,4,None,None,1], k = 3\nOutput: 3`,
    funcName: "kth_smallest_bst",
    starter: `def kth_smallest_bst(root, k):\n    # root is a level-order list; return the kth smallest value\n    # Your code here\n    pass`,
    solution: `def kth_smallest_bst(root, k):
    from collections import deque
    class N:
        __slots__ = ('val', 'left', 'right')
        def __init__(self, v):
            self.val = v
            self.left = None
            self.right = None
    def build(arr):
        if not arr or arr[0] is None:
            return None
        nodes = [N(x) if x is not None else None for x in arr]
        qq = deque([0])
        i = 1
        while qq and i < len(nodes):
            cur = nodes[qq.popleft()]
            if cur is None:
                continue
            if i < len(nodes):
                cur.left = nodes[i]
                if nodes[i] is not None:
                    qq.append(i)
                i += 1
            if i < len(nodes):
                cur.right = nodes[i]
                if nodes[i] is not None:
                    qq.append(i)
                i += 1
        return nodes[0]
    r = build(root)
    stack = []
    cur = r
    count = 0
    while stack or cur:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        count += 1
        if count == k:
            return cur.val
        cur = cur.right`,
    tests: [
      { call: "kth_smallest_bst([3,1,4,None,2], 1)", expected: "1" },
      { call: "kth_smallest_bst([5,3,6,2,4,None,None,1], 3)", expected: "3" },
      { call: "kth_smallest_bst([5,3,6,2,4,None,None,1], 6)", expected: "6" },
      { call: "kth_smallest_bst([1], 1)", expected: "1" },
      { call: "kth_smallest_bst([2,1,3], 2)", expected: "2" },
    ],
    hint: "Do an iterative in-order traversal and stop at the kth popped node.",
  },

  // ------------------------------------------------------------------ Graphs
  {
    id: "clone-graph",
    title: "Clone Graph",
    difficulty: "Medium",
    topic: "Graphs",
    statement: `You are given an undirected graph as an adjacency list. adj is a list of lists where adj[i] is the list of neighbors (0-indexed node ids) of node i. Deep-clone the graph and return the clone's adjacency list.\n\nSince the clone is structurally identical, the returned adjacency list must equal the input with each neighbor list sorted ascending for a deterministic comparison.\n\nExample:\nInput: [[1,2],[0,2],[0,1]]  (triangle of nodes 0,1,2)\nOutput: [[1,2],[0,2],[0,1]]\n\nExample:\nInput: []  (empty graph)\nOutput: []`,
    funcName: "clone_graph",
    starter: `def clone_graph(adj):\n    # adj[i] = list of neighbor ids of node i; return cloned adjacency list\n    # Your code here\n    pass`,
    solution: `def clone_graph(adj):
    n = len(adj)
    if n == 0:
        return []
    class Node:
        def __init__(self, val):
            self.val = val
            self.neighbors = []
    originals = [Node(i) for i in range(n)]
    for i in range(n):
        for j in adj[i]:
            originals[i].neighbors.append(originals[j])
    clones = {}
    def dfs(node):
        if node in clones:
            return clones[node]
        copy = Node(node.val)
        clones[node] = copy
        for nb in node.neighbors:
            copy.neighbors.append(dfs(nb))
        return copy
    for node in originals:
        dfs(node)
    out = [[] for _ in range(n)]
    for node, copy in clones.items():
        out[copy.val] = sorted(nb.val for nb in copy.neighbors)
    return out`,
    tests: [
      { call: "clone_graph([[1,2],[0,2],[0,1]])", expected: "[[1,2],[0,2],[0,1]]" },
      { call: "clone_graph([[1],[0]])", expected: "[[1],[0]]" },
      { call: "clone_graph([])", expected: "[]" },
      { call: "clone_graph([[]])", expected: "[[]]" },
      { call: "clone_graph([[1,2,3],[0],[0],[0]])", expected: "[[1,2,3],[0],[0],[0]]" },
    ],
    hint: "Build real node objects, deep-copy via DFS with a visited map, then serialize each clone's neighbors sorted.",
  },
  {
    id: "pacific-atlantic",
    title: "Pacific Atlantic Water Flow",
    difficulty: "Medium",
    topic: "Graphs",
    statement: `Given an m x n grid of non-negative heights, the Pacific ocean touches the top and left edges and the Atlantic ocean touches the bottom and right edges. Water flows from a cell to an adjacent cell (up/down/left/right) only if the neighbor's height is less than or equal to the current cell's height.\n\nReturn the list of cells [r, c] from which water can reach BOTH oceans. Return the list sorted ascending (by row, then column) for determinism.\n\nExample:\nInput: [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]\nOutput: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]\n\nExample:\nInput: [[1]]\nOutput: [[0,0]]`,
    funcName: "pacific_atlantic",
    starter: `def pacific_atlantic(heights):\n    # heights is a list of lists; return sorted list of [r,c] reaching both oceans\n    # Your code here\n    pass`,
    solution: `def pacific_atlantic(heights):
    if not heights or not heights[0]:
        return []
    m, n = len(heights), len(heights[0])
    pac = [[False] * n for _ in range(m)]
    atl = [[False] * n for _ in range(m)]
    def dfs(r, c, ocean):
        ocean[r][c] = True
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and not ocean[nr][nc] and heights[nr][nc] >= heights[r][c]:
                dfs(nr, nc, ocean)
    for r in range(m):
        dfs(r, 0, pac)
        dfs(r, n - 1, atl)
    for c in range(n):
        dfs(0, c, pac)
        dfs(m - 1, c, atl)
    res = []
    for r in range(m):
        for c in range(n):
            if pac[r][c] and atl[r][c]:
                res.append([r, c])
    res.sort()
    return res`,
    tests: [
      { call: "pacific_atlantic([[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]])", expected: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]" },
      { call: "pacific_atlantic([[1]])", expected: "[[0,0]]" },
      { call: "pacific_atlantic([[2,1],[1,2]])", expected: "[[0,0],[0,1],[1,0],[1,1]]" },
      { call: "pacific_atlantic([[1,2,3],[8,9,4],[7,6,5]])", expected: "[[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]]" },
      { call: "pacific_atlantic([])", expected: "[]" },
    ],
    hint: "Reverse the flow: DFS inward from each ocean's border cells, then intersect the two reachable sets.",
  },
  {
    id: "number-of-connected-components",
    title: "Number of Connected Components",
    difficulty: "Medium",
    topic: "Graphs",
    statement: `You have an undirected graph with n nodes labeled 0..n-1 and a list of edges where each edge is [a, b] connecting nodes a and b. Return the number of connected components.\n\nExample:\nInput: n = 5, edges = [[0,1],[1,2],[3,4]]\nOutput: 2  ({0,1,2} and {3,4})\n\nExample:\nInput: n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]\nOutput: 1`,
    funcName: "count_components",
    starter: `def count_components(n, edges):\n    # n nodes labeled 0..n-1, edges is a list of [a,b]; return component count\n    # Your code here\n    pass`,
    solution: `def count_components(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    count = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            count -= 1
    return count`,
    tests: [
      { call: "count_components(5, [[0,1],[1,2],[3,4]])", expected: "2" },
      { call: "count_components(5, [[0,1],[1,2],[2,3],[3,4]])", expected: "1" },
      { call: "count_components(4, [])", expected: "4" },
      { call: "count_components(1, [])", expected: "1" },
      { call: "count_components(6, [[0,1],[2,3],[4,5]])", expected: "3" },
    ],
    hint: "Union-find: start with n components and decrement each time an edge unites two different sets.",
  },

  // ------------------------------------------------------------------ Tries
  {
    id: "implement-trie",
    title: "Implement Trie (Prefix Tree)",
    difficulty: "Medium",
    topic: "Tries",
    statement: `Implement a trie supporting three operations, given as a list of [op, arg] commands. Process them in order and return the list of results.\n\nOperations:\n- ["insert", word]   -> inserts word; result is None\n- ["search", word]   -> result is True if word was inserted, else False\n- ["startsWith", prefix] -> result is True if any inserted word has the given prefix, else False\n\nExample:\nInput: [["insert","app"],["search","app"],["search","ap"],["startsWith","ap"]]\nOutput: [None, True, False, True]\n\nExample:\nInput: [["search","x"],["startsWith","x"]]\nOutput: [False, False]`,
    funcName: "trie_ops",
    starter: `def trie_ops(commands):\n    # commands is a list of [op, arg]; return list of results\n    # Your code here\n    pass`,
    solution: `def trie_ops(commands):
    root = {}
    END = '#'
    results = []
    for op, arg in commands:
        if op == 'insert':
            node = root
            for ch in arg:
                node = node.setdefault(ch, {})
            node[END] = True
            results.append(None)
        elif op == 'search':
            node = root
            found = True
            for ch in arg:
                if ch not in node:
                    found = False
                    break
                node = node[ch]
            results.append(found and END in node)
        elif op == 'startsWith':
            node = root
            found = True
            for ch in arg:
                if ch not in node:
                    found = False
                    break
                node = node[ch]
            results.append(found)
    return results`,
    tests: [
      { call: 'trie_ops([["insert","app"],["search","app"],["search","ap"],["startsWith","ap"]])', expected: "[None, True, False, True]" },
      { call: 'trie_ops([["search","x"],["startsWith","x"]])', expected: "[False, False]" },
      { call: 'trie_ops([["insert","apple"],["search","apple"],["search","app"],["startsWith","app"],["insert","app"],["search","app"]])', expected: "[None, True, False, True, None, True]" },
      { call: 'trie_ops([["insert","a"],["startsWith","a"],["search","a"]])', expected: "[None, True, True]" },
      { call: "trie_ops([])", expected: "[]" },
    ],
    hint: "Use nested dicts as nodes and a sentinel key to mark word endings; search needs that sentinel, startsWith does not.",
  },

  // ------------------------------------------------------------------ Linked List
  {
    id: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "Easy",
    topic: "Linked List",
    statement: `A singly linked list is encoded as [values, pos] where values is the list of node values in order and pos is the index that the tail's next pointer connects to (forming a cycle). If pos is -1, there is no cycle. Return True if the list has a cycle, else False.\n\nExample:\nInput: [[3,2,0,-4], 1]\nThe tail (-4) points back to index 1 (value 2), so there is a cycle.\nOutput: True\n\nExample:\nInput: [[1,2], -1]\nNo cycle.\nOutput: False`,
    funcName: "has_cycle",
    starter: `def has_cycle(data):\n    # data is [values, pos]; pos = index tail connects to, or -1\n    # Your code here\n    pass`,
    solution: `def has_cycle(data):
    values, pos = data[0], data[1]
    n = len(values)
    if n == 0:
        return False
    class Node:
        def __init__(self, v):
            self.val = v
            self.next = None
    nodes = [Node(v) for v in values]
    for i in range(n - 1):
        nodes[i].next = nodes[i + 1]
    if pos != -1:
        nodes[n - 1].next = nodes[pos]
    slow = fast = nodes[0]
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
    tests: [
      { call: "has_cycle([[3,2,0,-4], 1])", expected: "True" },
      { call: "has_cycle([[1,2], 0])", expected: "True" },
      { call: "has_cycle([[1,2], -1])", expected: "False" },
      { call: "has_cycle([[1], -1])", expected: "False" },
      { call: "has_cycle([[1], 0])", expected: "True" },
      { call: "has_cycle([[], -1])", expected: "False" },
    ],
    hint: "Build the list, wire the tail to index pos if not -1, then use Floyd's slow/fast pointers.",
  },
  {
    id: "reorder-list",
    title: "Reorder List",
    difficulty: "Medium",
    topic: "Linked List",
    statement: `Given the values of a singly linked list L0 -> L1 -> ... -> Ln-1, reorder it to L0 -> Ln-1 -> L1 -> Ln-2 -> L2 -> ... and return the reordered values as a list.\n\nExample:\nInput: [1,2,3,4]\nOutput: [1,4,2,3]\n\nExample:\nInput: [1,2,3,4,5]\nOutput: [1,5,2,4,3]`,
    funcName: "reorder_list",
    starter: `def reorder_list(values):\n    # values is the in-order list of node values; return reordered values\n    # Your code here\n    pass`,
    solution: `def reorder_list(values):
    n = len(values)
    if n <= 2:
        return list(values)
    res = []
    i, j = 0, n - 1
    take_front = True
    while i <= j:
        if i == j:
            res.append(values[i])
        elif take_front:
            res.append(values[i])
            res.append(values[j])
        else:
            res.append(values[i])
            res.append(values[j])
        if take_front:
            i += 1
            j -= 1
        take_front = take_front
    return res`,
    tests: [
      { call: "reorder_list([1,2,3,4])", expected: "[1,4,2,3]" },
      { call: "reorder_list([1,2,3,4,5])", expected: "[1,5,2,4,3]" },
      { call: "reorder_list([1])", expected: "[1]" },
      { call: "reorder_list([1,2])", expected: "[1,2]" },
      { call: "reorder_list([])", expected: "[]" },
      { call: "reorder_list([1,2,3])", expected: "[1,3,2]" },
    ],
    hint: "Two pointers from the ends, alternately appending front and back values until they meet.",
  },
  {
    id: "add-two-numbers",
    title: "Add Two Numbers",
    difficulty: "Medium",
    topic: "Linked List",
    statement: `Two non-negative integers are given as digit-lists in REVERSE order (least-significant digit first), one digit per element. Add the two numbers and return the sum as a digit-list, also in reverse order, with no leading-zero element (except the number 0 itself, which is [0]).\n\nExample:\nInput: l1 = [2,4,3], l2 = [5,6,4]   (342 + 465 = 807)\nOutput: [7,0,8]\n\nExample:\nInput: l1 = [9,9], l2 = [1]   (99 + 1 = 100)\nOutput: [0,0,1]`,
    funcName: "add_two_numbers",
    starter: `def add_two_numbers(l1, l2):\n    # l1, l2 are reverse-order digit lists; return reverse-order sum digits\n    # Your code here\n    pass`,
    solution: `def add_two_numbers(l1, l2):
    res = []
    carry = 0
    i = 0
    while i < len(l1) or i < len(l2) or carry:
        a = l1[i] if i < len(l1) else 0
        b = l2[i] if i < len(l2) else 0
        total = a + b + carry
        res.append(total % 10)
        carry = total // 10
        i += 1
    if not res:
        res = [0]
    return res`,
    tests: [
      { call: "add_two_numbers([2,4,3], [5,6,4])", expected: "[7,0,8]" },
      { call: "add_two_numbers([9,9], [1])", expected: "[0,0,1]" },
      { call: "add_two_numbers([0], [0])", expected: "[0]" },
      { call: "add_two_numbers([9,9,9,9], [9,9,9,9])", expected: "[8,9,9,9,1]" },
      { call: "add_two_numbers([5], [5])", expected: "[0,1]" },
    ],
    hint: "Add digit by digit with a running carry, just like grade-school addition; remember the final carry.",
  },

  // ------------------------------------------------------------------ Stack
  {
    id: "min-stack",
    title: "Min Stack",
    difficulty: "Medium",
    topic: "Stack",
    statement: `Implement a stack that supports push, pop, top, and retrieving the minimum element in O(1), driven by a list of commands. Process the commands in order and return the list of results produced by the read/pop operations.\n\nOperations:\n- ["push", x] -> push x; produces no result (skip)\n- ["pop"]     -> pop the top; append the popped value to results\n- ["top"]     -> append the current top value to results\n- ["getMin"]  -> append the current minimum to results\n\nExample:\nInput: [["push",-2],["push",0],["push",-3],["getMin"],["pop"],["top"],["getMin"]]\nOutput: [-3, -3, 0, -2]\n\nExample:\nInput: [["push",1],["top"],["getMin"]]\nOutput: [1, 1]`,
    funcName: "min_stack_ops",
    starter: `def min_stack_ops(commands):\n    # commands is a list of [op, ...]; return list of results from pop/top/getMin\n    # Your code here\n    pass`,
    solution: `def min_stack_ops(commands):
    stack = []
    mins = []
    results = []
    for cmd in commands:
        op = cmd[0]
        if op == 'push':
            x = cmd[1]
            stack.append(x)
            if not mins or x <= mins[-1]:
                mins.append(x)
            else:
                mins.append(mins[-1])
        elif op == 'pop':
            val = stack.pop()
            mins.pop()
            results.append(val)
        elif op == 'top':
            results.append(stack[-1])
        elif op == 'getMin':
            results.append(mins[-1])
    return results`,
    tests: [
      { call: 'min_stack_ops([["push",-2],["push",0],["push",-3],["getMin"],["pop"],["top"],["getMin"]])', expected: "[-3, -3, 0, -2]" },
      { call: 'min_stack_ops([["push",1],["top"],["getMin"]])', expected: "[1, 1]" },
      { call: 'min_stack_ops([["push",5],["push",3],["getMin"],["pop"],["getMin"]])', expected: "[3, 3, 5]" },
      { call: 'min_stack_ops([["push",2],["push",2],["getMin"],["pop"],["getMin"]])', expected: "[2, 2, 2]" },
      { call: "min_stack_ops([])", expected: "[]" },
    ],
    hint: "Keep a parallel stack of running minimums; push min(x, currentMin) alongside each value.",
  },
  {
    id: "largest-rectangle-histogram",
    title: "Largest Rectangle in Histogram",
    difficulty: "Hard",
    topic: "Stack",
    statement: `Given a list of non-negative integers heights representing the heights of bars of width 1, return the area of the largest rectangle that can be formed within the histogram.\n\nExample:\nInput: [2,1,5,6,2,3]\nThe largest rectangle has height 5 spanning bars [5,6] -> width 2, area 10.\nOutput: 10\n\nExample:\nInput: [2,4]\nOutput: 4`,
    funcName: "largest_rectangle",
    starter: `def largest_rectangle(heights):\n    # heights is a list of bar heights (width 1 each); return max rectangle area\n    # Your code here\n    pass`,
    solution: `def largest_rectangle(heights):
    stack = []
    best = 0
    for i, h in enumerate(heights + [0]):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            best = max(best, height * (i - idx))
            start = idx
        stack.append((start, h))
    return best`,
    tests: [
      { call: "largest_rectangle([2,1,5,6,2,3])", expected: "10" },
      { call: "largest_rectangle([2,4])", expected: "4" },
      { call: "largest_rectangle([])", expected: "0" },
      { call: "largest_rectangle([5])", expected: "5" },
      { call: "largest_rectangle([1,1,1,1])", expected: "4" },
      { call: "largest_rectangle([6,2,5,4,5,1,6])", expected: "12" },
    ],
    hint: "Use a monotonic increasing stack of (start_index, height); when a shorter bar arrives, pop and settle areas.",
  },
];
