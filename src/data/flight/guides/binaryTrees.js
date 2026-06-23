export default {
  id: "binary-trees",
  title: "Binary Trees",
  subtitle: "A complete reference guide: foundations, traversals, patterns, and problem archetypes.",
  emoji: "",
  intro: `This guide is designed to take you from zero knowledge of trees to recognising any LeetCode tree problem on sight. It covers the data structure, the four core traversals, the universal recursion template, seven problem archetypes (with worked examples for each), the bugs that catch people out, and a 22-problem study plan.\n\nTable of contents:\n1. Foundations\n2. The four core traversals\n3. The universal recursive pattern\n4. Problem archetypes A through G\n5. Common bugs to watch for\n6. A study plan\n7. One-page mental cheat sheet`,
  sections: [
    {
      heading: "1. Foundations",
      blocks: [
        { type: "h3", text: "1.1 The node structure" },
        { type: "p", text: `LeetCode tree problems almost always use this exact class definition. Memorise it; you will write it constantly.` },
        { type: "code", code: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right` },
        { type: "p", text: `Each node holds a value and two pointers, left and right. A pointer is None when there is no child on that side. A tree is identified by its root node, and everything else is reachable by following the pointers downward.` },

        { type: "h3", text: "1.2 Terminology" },
        { type: "code", code: `              1             <-- root (depth 0)\n            / \\\n           2    3           <-- depth 1\n          / \\     \\\n        4     5     6       <-- depth 2 (leaves)` },
        { type: "p", text: `Tree vocabulary is small but you have to know it cold. These terms come up in every problem statement.` },
        { type: "table", headers: ["Term", "Definition"], rows: [
          ["Root", "The single top node, with no parent."],
          ["Leaf", "A node with no children (both left and right are None)."],
          ["Internal node", "A node with at least one child."],
          ["Subtree", "Any node, plus everything reachable below it, is itself a tree."],
          ["Depth of a node", "Distance from the root. The root has depth 0."],
          ["Height of a node", "Distance from the node to its deepest descendant leaf."],
          ["Height of tree", "The height of the root."],
          ["Parent / child", "The direct relationship between two connected nodes."],
          ["Siblings", "Two nodes sharing the same parent."],
          ["Ancestor / descendant", "Transitive parent / child along the path to the root."]
        ]},

        { type: "h3", text: "1.3 Types of trees you will encounter" },
        { type: "table", headers: ["Tree type", "Defining property", "Where it shows up"], rows: [
          ["Binary tree", "Each node has at most two children.", "The default for most LeetCode problems."],
          ["Binary search tree (BST)", "For every node, all values in the left subtree are smaller and all values in the right subtree are larger.", "Search, insert, kth smallest, validate BST."],
          ["Balanced tree", "Height is O(log n). The left and right subtrees differ in height by at most 1 (one common definition).", "Performance analysis; underpins library map/set."],
          ["Complete tree", "Every level is filled, except possibly the last, which fills left to right.", "Heaps are stored as complete trees in an array."],
          ["N-ary tree", "Children are stored as a list rather than a fixed left/right pair.", "File systems, DOM, abstract syntax trees."]
        ]},
        { type: "callout", text: `The crucial distinction in practice is BST versus generic binary tree. If the problem promises BST ordering, you can usually descend into only one subtree at each step, giving you O(h) algorithms instead of O(n). If it does not, you almost always have to visit every node.` },

        { type: "h3", text: "1.4 Balanced versus skewed" },
        { type: "p", text: `The same six values can form a short, balanced tree or a degenerate one. Height drives the time and space complexity of every traversal, so this distinction is not cosmetic.` },
        { type: "diagram", kind: "tree", data: { nodes: [4, 2, 6, 1, 3, 5, 7], highlight: [] }, caption: "A balanced tree of 7 nodes: height 2, O(log n). Every level except the last is full." },
        { type: "diagram", kind: "tree", data: { nodes: [1, null, 2, null, 3], highlight: [] }, caption: "A right-skewed tree: height 2 for only 3 nodes, O(n). This is the degenerate, linked-list-like shape that causes stack overflow on deep recursion." }
      ]
    },
    {
      heading: "2. The four core traversals",
      blocks: [
        { type: "p", text: `Mastering traversals is non-negotiable. Every tree problem either is a traversal or uses one. There are three depth-first orders and one breadth-first order. Together they account for nearly every pattern.` },

        { type: "h3", text: "2.1 DFS: preorder, inorder, postorder" },
        { type: "p", text: `All three depth-first orders use the same recursive shape. They differ only in when they process the current node relative to recursing into its children.` },
        { type: "code", code: `def preorder(node):      # Root -> Left -> Right\n    if not node: return\n    process(node)\n    preorder(node.left)\n    preorder(node.right)\n\ndef inorder(node):       # Left -> Root -> Right\n    if not node: return\n    inorder(node.left)\n    process(node)\n    inorder(node.right)\n\ndef postorder(node):     # Left -> Right -> Root\n    if not node: return\n    postorder(node.left)\n    postorder(node.right)\n    process(node)` },
        { type: "p", text: `Running these on the example tree from section 1 produces:` },
        { type: "diagram", kind: "tree", data: { nodes: [1, 2, 3, 4, 5, null, 6], highlight: [] }, caption: "The running example tree. Node 3 has no left child, so a null sits in that level-order slot before its right child 6." },
        { type: "ul", items: [
          `Preorder: 1, 2, 4, 5, 3, 6`,
          `Inorder: 4, 2, 5, 1, 3, 6`,
          `Postorder: 4, 5, 2, 6, 3, 1`
        ]},
        { type: "diagram", kind: "array", data: { values: [1, 2, 4, 5, 3, 6], pointers: [], highlight: [] }, caption: "Preorder (Root -> Left -> Right): the root 1 comes first, then the entire left subtree, then the entire right subtree." },
        { type: "diagram", kind: "array", data: { values: [4, 2, 5, 1, 3, 6], pointers: [], highlight: [3] }, caption: "Inorder (Left -> Root -> Right): the root 1 (highlighted) sits between its left and right subtrees. On a BST this sequence comes out sorted." },
        { type: "diagram", kind: "array", data: { values: [4, 5, 2, 6, 3, 1], pointers: [], highlight: [5] }, caption: "Postorder (Left -> Right -> Root): the root 1 (highlighted) comes last, after both subtrees have been fully processed." },
        { type: "p", text: `When to reach for each:` },
        { type: "table", headers: ["Traversal", "Reach for it when..."], rows: [
          ["Preorder", "You need to act on a node before seeing its children. Common uses: copying a tree, serialising, propagating context down through parameters (running sum, bounds)."],
          ["Inorder", "You are working with a BST. Inorder gives values in sorted order. Classic uses: kth smallest in BST, validate BST by checking monotonicity, convert BST to sorted list."],
          ["Postorder", "You need the children's results before processing the node. Anything that bubbles up: height, subtree sum, balanced check, deleting a tree, diameter, max path sum."]
        ]},
        { type: "callout", text: `Mental cue: if the function returns a value that depends on what the children returned, the work is postorder. If the function pushes information downward through parameters, the work is preorder.` },

        { type: "h3", text: "2.2 BFS: level-order traversal" },
        { type: "p", text: `Breadth-first search visits nodes level by level. It uses a queue. The standard implementation uses Python's collections.deque because list.pop(0) is O(n).` },
        { type: "code", code: `from collections import deque\n\ndef bfs(root):\n    if not root: return\n    queue = deque([root])\n    while queue:\n        node = queue.popleft()\n        process(node)\n        if node.left: queue.append(node.left)\n        if node.right: queue.append(node.right)` },
        { type: "p", text: `On the example tree this visits 1, 2, 3, 4, 5, 6 in that order.` },
        { type: "diagram", kind: "tree", data: { nodes: [1, 2, 3, 4, 5, null, 6], highlight: [2, 3] }, caption: "BFS visits level by level. Here depth-1 (nodes 2 and 3) is highlighted: the level-aware variant drains exactly these before touching depth 2." },
        { type: "p", text: `Most level-order problems care about grouping by level: "return one list per level", "find the rightmost node of each level", "average each level". The trick is to snapshot the queue size at the start of each level, then drain exactly that many nodes before moving on.` },
        { type: "code", code: `def level_order(root):\n    if not root: return []\n    result = []\n    queue = deque([root])\n    while queue:\n        level_size = len(queue)        # snapshot before draining\n        level = []\n        for _ in range(level_size):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        result.append(level)\n    return result` },
        { type: "callout", text: `The level_size = len(queue) line is the single most useful idiom in BFS tree problems. Burn it into your brain.` },

        { type: "h3", text: "2.3 Iterative DFS" },
        { type: "p", text: `Sometimes you want to avoid Python's recursion limit, or an interviewer asks for an iterative version. Preorder is straightforward with a stack:` },
        { type: "code", code: `def preorder_iterative(root):\n    if not root: return\n    stack = [root]\n    while stack:\n        node = stack.pop()\n        process(node)\n        if node.right: stack.append(node.right)      # right first...\n        if node.left: stack.append(node.left)        # so left pops next` },
        { type: "p", text: `Iterative inorder and postorder are noticeably trickier and rarely needed in practice. Recursion is acceptable in nearly every interview unless the interviewer specifically asks otherwise.` }
      ]
    },
    {
      heading: "3. The universal recursive pattern",
      blocks: [
        { type: "p", text: `Almost every tree problem fits this three-step template. If you can answer three questions, you can write the solution.` },
        { type: "code", code: `def solve(node):\n    # 1. Base case\n    if not node:\n        return <something>           # 0, None, True, [], etc.\n\n    # 2. Recurse on children\n    left_result = solve(node.left)\n    right_result = solve(node.right)\n\n    # 3. Combine with current node\n    return <combine(node, left_result, right_result)>` },
        { type: "h3", text: "The three questions" },
        { type: "ol", items: [
          `What does the function return? A count? A boolean? A node? A height? The answer to the whole problem is rarely the same as what each recursive call returns.`,
          `What is the base case? Almost always when node is None. The return value at the base case must be the identity for whatever you are combining: 0 for sums, True for AND-style checks, None for tree-building, and so on.`,
          `How do you combine the children's results with the current node? This is the core of the algorithm. Once you have it, the code is mechanical.`
        ]},

        { type: "h3", text: "Worked example 1: maximum depth" },
        { type: "code", code: `def maxDepth(root):\n    if not root:\n        return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))` },
        { type: "ul", items: [
          `Returns: depth (int).`,
          `Base case: empty tree has depth 0.`,
          `Combine: this node contributes 1, plus the deeper of its two subtrees.`
        ]},

        { type: "h3", text: "Worked example 2: sum of all values" },
        { type: "code", code: `def treeSum(root):\n    if not root:\n        return 0\n    return root.val + treeSum(root.left) + treeSum(root.right)` },
        { type: "p", text: `Same template, different combine. The base case returns 0 because 0 is the identity for addition.` },

        { type: "h3", text: "Worked example 3: are two trees identical?" },
        { type: "code", code: `def isSameTree(p, q):\n    if not p and not q: return True\n    if not p or not q: return False\n    return (p.val == q.val and\n            isSameTree(p.left, q.left) and\n            isSameTree(p.right, q.right))` },
        { type: "p", text: `Two base cases here: if both are empty, they match. If exactly one is empty, they cannot match. Otherwise: roots must match AND left subtrees must match AND right subtrees must match.` },

        { type: "h3", text: "Worked example 4: invert a binary tree" },
        { type: "code", code: `def invertTree(root):\n    if not root:\n        return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root` },
        { type: "p", text: `Returns the (modified) root. The tuple-swap idiom mutates the tree in place while still satisfying the contract of returning the new root.` }
      ]
    },
    {
      heading: "4. Problem archetypes A through G",
      blocks: [
        { type: "p", text: `When you see a new tree problem, your goal is to recognise which of these patterns it fits. Most tree problems are a thin wrapper around one of seven patterns. Once you map the problem to a pattern, the solution is mechanical.` },

        { type: "h3", text: "Archetype A: compute something about each node or the whole tree" },
        { type: "p", text: `The bread and butter of tree problems. Postorder traversal, combine the children's results with the current node.` },
        { type: "p", text: `Examples: max depth, count nodes, sum of values, is it height-balanced, diameter, maximum path sum.` },
        { type: "h3", text: "The diameter trick" },
        { type: "p", text: `Diameter is the longest path between any two nodes. It introduces a pattern that recurs constantly: return one value, track another.` },
        { type: "code", code: `def diameterOfBinaryTree(root):\n    diameter = 0\n\n    def depth(node):\n        nonlocal diameter\n        if not node:\n            return 0\n        left = depth(node.left)\n        right = depth(node.right)\n        # Update the answer while we are here\n        diameter = max(diameter, left + right)\n        # But return depth (different quantity)\n        return 1 + max(left, right)\n\n    depth(root)\n    return diameter` },
        { type: "p", text: `The function returns depth, but tracks diameter via a closure variable. The path-through-this-node has length left + right, but the path that extends upward through this node has length 1 + max(left, right). These are two different quantities, and recognising that distinction is the heart of the pattern.` },
        { type: "callout", text: `This pattern shows up in: max path sum, longest univalue path, house robber III, and most "longest path / largest something" tree problems. Whenever the answer is about a path or subtree property that does not compose cleanly upward, reach for return-one-thing-track-another.` },

        { type: "h3", text: "Archetype B: propagate information down" },
        { type: "p", text: `Preorder. Pass running state as parameters so each recursive call knows the context it sits in.` },
        { type: "p", text: `Examples: path sum (does any root-to-leaf path equal target), all root-to-leaf paths, sum of root-to-leaf numbers, validate BST.` },
        { type: "code", code: `def hasPathSum(root, target):\n    if not root:\n        return False\n    if not root.left and not root.right:        # leaf\n        return root.val == target\n    remaining = target - root.val\n    return (hasPathSum(root.left, remaining) or\n            hasPathSum(root.right, remaining))` },
        { type: "p", text: `Note the explicit leaf check: not root.left and not root.right. An "empty node" (not root) and a "leaf node" (node with no children) are different concepts, and many bugs come from conflating them.` },
        { type: "h3", text: "Validate BST: the classic propagate-bounds problem" },
        { type: "code", code: `def isValidBST(root, low=float('-inf'), high=float('inf')):\n    if not root:\n        return True\n    if not (low < root.val < high):\n        return False\n    return (isValidBST(root.left, low, root.val) and\n            isValidBST(root.right, root.val, high))` },
        { type: "p", text: `The naive check left.val < root.val < right.val is wrong: the BST property is about all descendants on each side, not just the immediate children. The running bounds must be passed down.` },

        { type: "h3", text: "Archetype C: level-order operations" },
        { type: "p", text: `BFS with the level-size snapshot trick.` },
        { type: "p", text: `Examples: level order traversal (list per level), right side view (last node of each level), average of each level, zigzag level order, minimum depth (BFS terminates faster than DFS when leaves are shallow).` },
        { type: "h3", text: "Right side view as a template" },
        { type: "code", code: `def rightSideView(root):\n    if not root: return []\n    result = []\n    queue = deque([root])\n    while queue:\n        level_size = len(queue)\n        for i in range(level_size):\n            node = queue.popleft()\n            if i == level_size - 1:      # last node of this level\n                result.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n    return result` },

        { type: "h3", text: "Archetype D: BST-specific problems" },
        { type: "p", text: `Exploit the ordering property. Often you only recurse into one subtree at each step, giving O(h) algorithms.` },
        { type: "p", text: `Examples: search a value, insert a value, delete a node (trickier; case analysis), LCA in BST, kth smallest (inorder, stop at k), validate BST, convert sorted array to balanced BST.` },
        { type: "diagram", kind: "tree", data: { nodes: [8, 3, 10, 1, 6, null, 14], highlight: [8, 10, 14] }, caption: "A valid BST: every left subtree is entirely smaller than its node, every right subtree entirely larger. The highlighted path 8 -> 10 -> 14 is the O(h) search for 14 -- at each node we go right because the target is larger, never visiting the left subtree." },
        { type: "h3", text: "LCA in a BST: O(h) with no extra space" },
        { type: "code", code: `def lcaBST(root, p, q):\n    if p.val < root.val and q.val < root.val:\n        return lcaBST(root.left, p, q)\n    if p.val > root.val and q.val > root.val:\n        return lcaBST(root.right, p, q)\n    return root  # they split here, or one is the root` },
        { type: "diagram", kind: "tree", data: { nodes: [8, 3, 10, 1, 6, null, 14], highlight: [1, 6] }, caption: "LCA of the two highlighted targets 1 and 6 is node 3. In a BST: both are less than 8 so we go left to 3, then 1 < 3 < 6 means they split here -- 3 is the lowest common ancestor." },
        { type: "p", text: `Compare against the generic binary tree version. Without the ordering, you cannot tell which side a target lies on, so you must search both:` },
        { type: "code", code: `def lcaBinary(root, p, q):\n    if not root or root == p or root == q:\n        return root\n    left = lcaBinary(root.left, p, q)\n    right = lcaBinary(root.right, p, q)\n    if left and right:     # p and q split across subtrees -> root is LCA\n        return root\n    return left or right   # both on one side -> return whichever found something` },
        { type: "callout", text: `Study this one carefully. The function returns "either an LCA, or one of p/q, or None", and the same code handles all cases. The trick: when both left and right return non-None, current node is the split point and therefore the LCA.` },

        { type: "h3", text: "Archetype E: tree construction" },
        { type: "p", text: `You are given some representation and asked to build a tree.` },
        { type: "p", text: `Examples: build tree from preorder + inorder, build tree from inorder + postorder, convert sorted array to BST, deserialise from a string.` },
        { type: "h3", text: "From preorder and inorder" },
        { type: "p", text: `Idea: the first element of preorder is the root. Find it in inorder. Everything to the left of it in inorder is the left subtree; everything to the right is the right subtree. Recurse.` },
        { type: "code", code: `def buildTree(preorder, inorder):\n    if not preorder:\n        return None\n    root = TreeNode(preorder[0])\n    mid = inorder.index(preorder[0])\n    root.left = buildTree(preorder[1:mid+1], inorder[:mid])\n    root.right = buildTree(preorder[mid+1:], inorder[mid+1:])\n    return root` },
        { type: "p", text: `Optimisation note: the .index() call is O(n). For an interview-ready version, pre-build a value -> index hashmap on inorder and look up in O(1). Without this, you turn an O(n) algorithm into O(n^2).` },

        { type: "h3", text: "Archetype F: serialisation" },
        { type: "p", text: `Convert tree to string and back. The standard choice is preorder with explicit sentinels for empty children.` },
        { type: "code", code: `def serialize(root):\n    if not root:\n        return '#'\n    return f'{root.val},{serialize(root.left)},{serialize(root.right)}'\n\ndef deserialize(data):\n    values = iter(data.split(','))\n    def build():\n        v = next(values)\n        if v == '#':\n            return None\n        node = TreeNode(int(v))\n        node.left = build()\n        node.right = build()\n        return node\n    return build()` },
        { type: "p", text: `The sentinel # for empty children is what makes the structure unambiguous. Without it, you would need both a preorder and inorder traversal to reconstruct the tree (because there are many trees with the same preorder sequence).` },

        { type: "h3", text: "Archetype G: path problems" },
        { type: "p", text: `Find a path or set of paths with some property. Sub-types:` },
        { type: "ul", items: [
          `Root-to-leaf paths. Preorder with an accumulator passed down.`,
          `Any-node-to-any-node paths. Diameter trick: return the gain extending upward, track the best path passing through this node as a side effect.`,
          `Path sum equal to target (path sum III). Often elegantly solved with a prefix-sum hashmap, treating each root-to-current path as a running sum and asking whether running_sum - target has been seen earlier in the current path.`
        ]}
      ]
    },
    {
      heading: "5. Common bugs to watch for",
      blocks: [
        { type: "p", text: `These are the bugs that consistently trip people up on tree problems. Reviewing this list before submitting a solution catches a surprising fraction of them.` },
        { type: "table", headers: ["Bug", "What goes wrong"], rows: [
          ["Confusing empty node with leaf", "not root is for missing children; not root.left and not root.right is for a leaf. These behave differently in path-sum-style problems."],
          ["Forgetting the base case", "Without a base case, the recursion never bottoms out: infinite recursion or AttributeError on None.left."],
          ["Returning the wrong thing", "Especially when the recursive return differs from the final answer (diameter, max path sum). Track the answer in a closure variable and return whatever the parent needs."],
          ["Mutating the tree unintentionally", "Make sure the problem allows mutation. If not, build new nodes instead of swapping pointers."],
          ["O(n) work inside recursion", "Slicing arrays or calling .index() inside a recursive function easily turns O(n) into O(n^2). Pass indices, or pre-build a hashmap."],
          ["Mixing up traversal orders", "Using inorder when you needed preorder (or vice versa). If you are passing context down, you want preorder. If you are combining child results, postorder."],
          ["Validating BST with only neighbour checks", "left.val < root.val < right.val is insufficient. Propagate full bounds down."],
          ["Stack overflow on deep skewed trees", "Recursive depth can hit Python's recursion limit on degenerate (linked-list-like) trees. Either raise the limit, or use an iterative version."]
        ]}
      ]
    },
    {
      heading: "6. A study plan",
      blocks: [
        { type: "p", text: `Drill these in order. The earlier problems build the templates that the later ones rely on. If you can solve all 22, you can solve almost any binary tree problem an interviewer is likely to ask.` },
        { type: "table", headers: ["#", "Problem", "Why it matters"], rows: [
          ["1", "Maximum depth of binary tree", "The cleanest example of the universal template."],
          ["2", "Same tree", "Two-tree recursion with double base case."],
          ["3", "Invert binary tree", "Mutation pattern; tuple-swap idiom."],
          ["4", "Symmetric tree", "Mirror recursion: comparing two subtrees in opposite order."],
          ["5", "Inorder / preorder / postorder traversal (recursive)", "Cement the three DFS orders."],
          ["6", "Same three traversals iteratively", "Stack mechanics; preorder first."],
          ["7", "Level order traversal", "Master the level-size snapshot trick."],
          ["8", "Zigzag level order traversal", "BFS plus per-level direction flag."],
          ["9", "Right side view", "BFS with \"last of each level\" filter."],
          ["10", "Diameter of binary tree", "Return-one-thing-track-another pattern."],
          ["11", "Balanced binary tree", "Combine return value (height) with side answer (bool)."],
          ["12", "Binary tree maximum path sum", "Hardest version of the diameter trick."],
          ["13", "Longest univalue path", "Same pattern, predicate on equal values."],
          ["14", "Validate BST", "Propagate-bounds-down pattern."],
          ["15", "Search in BST / insert into BST", "Single-subtree descent; O(h)."],
          ["16", "Kth smallest in BST", "Inorder gives sorted order; stop at k."],
          ["17", "LCA of BST", "Single-side descent using ordering."],
          ["18", "LCA of binary tree", "The classic four-case return-value trick."],
          ["19", "Path sum I and II", "Preorder with accumulator and full path list."],
          ["20", "Path sum III", "Prefix-sum hashmap on tree paths."],
          ["21", "Construct tree from preorder + inorder", "Tree construction from traversal arrays."],
          ["22", "Serialise and deserialise binary tree", "Preorder with sentinel; iterator-based rebuild."]
        ]}
      ]
    },
    {
      heading: "7. One-page mental cheat sheet",
      blocks: [
        { type: "p", text: `When you see a tree problem, ask in this order:` },
        { type: "table", headers: ["Ask", "If yes, then..."], rows: [
          ["Is it a BST?", "Use the ordering. Often recurse into only one subtree. O(h) algorithms."],
          ["Do I need to act level-by-level?", "BFS with level_size = len(queue)."],
          ["Is the answer computed from children's answers?", "Postorder. Combine children's results with the current node."],
          ["Do I need to pass context down?", "Preorder. Add a running parameter (sum, bounds, path so far)."],
          ["Is the answer a path that goes through a node?", "Diameter trick. Return one thing, track another via a closure."],
          ["Am I building a tree?", "Identify which traversal locates the root, then recurse on the parts."],
          ["Am I converting tree to/from a string?", "Preorder with a sentinel for missing children."]
        ]},
        { type: "h3", text: "Final notes" },
        { type: "p", text: `Tree problems reward pattern recognition more than cleverness. Most of the difficulty is in noticing which of the seven archetypes you are looking at. Once you see the archetype, the universal template gives you a working skeleton in seconds, and the remaining work is filling in the combine step.` },
        { type: "p", text: `Two habits will accelerate you faster than anything else. First, before writing any code, state out loud (or write down) the three template questions: what does the function return, what is the base case, how do you combine children's results. Second, after writing a solution, scan the bug list in section 5 before submitting. Most incorrect submissions are not failures of insight but failures of one of those checks.` }
      ]
    }
  ],
  cheatsheet: [
    `Is it a BST? -> Use the ordering. Often recurse into only one subtree. O(h) algorithms.`,
    `Do I need to act level-by-level? -> BFS with level_size = len(queue).`,
    `Is the answer computed from children's answers? -> Postorder. Combine children's results with the current node.`,
    `Do I need to pass context down? -> Preorder. Add a running parameter (sum, bounds, path so far).`,
    `Is the answer a path that goes through a node? -> Diameter trick. Return one thing, track another via a closure.`,
    `Am I building a tree? -> Identify which traversal locates the root, then recurse on the parts.`,
    `Am I converting tree to/from a string? -> Preorder with a sentinel for missing children.`,
    `The three template questions: what does the function return, what is the base case, how do you combine children's results.`,
    `Base-case identities: 0 for sums, True for AND-style checks, None for tree-building, [] for lists.`,
    `Postorder = bubble results up (height, sum, diameter). Preorder = push context down (running sum, bounds).`,
    `Empty node (not root) is NOT the same as a leaf (not root.left and not root.right).`,
    `level_size = len(queue) is the single most useful BFS idiom; snapshot before draining each level.`,
    `Validate BST by propagating low/high bounds, not by checking immediate neighbours.`,
    `In tree construction, pre-build a value -> index hashmap to avoid O(n) .index() and O(n^2) blowup.`,
    `Serialise with preorder + '#' sentinels for unambiguous reconstruction.`
  ]
}
