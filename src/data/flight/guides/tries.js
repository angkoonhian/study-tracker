export default {
  id: "tries",
  title: "Tries (Prefix Trees)",
  subtitle: "The data structure that makes prefixes a superpower",
  emoji: "",
  intro: `A trie (pronounced "try", from re**trie**val) is a tree-shaped data structure that stores a set of strings by sharing their common prefixes. Every node represents a prefix; the path of characters from the root down to a node spells that prefix. A boolean flag on each node marks whether the prefix ending there is also a complete inserted word.\n\nWhy not just use a hash set? A hash set answers "is this exact word present?" in O(L) (you still have to hash all L characters). What it cannot do cheaply is answer prefix questions: "how many words start with 'ca'?", "give me every word with prefix 'pre'", "does any inserted word match the pattern 'b.d'?". A trie answers all of those by walking the shared structure. That single capability — prefix navigation — is the entire reason tries exist and the signal you should reach for one.\n\nUse a trie when the problem mentions: prefixes, autocomplete / typeahead, dictionary or word-dictionary matching, "starts with", searching many words against a grid (Word Search II), wildcard matching over a word set, or bitwise prefixes of integers (maximum XOR). Reach for a hash set instead when you only ever need exact membership and never touch prefixes.\n\nThis handbook covers the structure, two standard encodings, the canonical Trie template, the core LeetCode patterns (wildcard search, Word Search II, longest word, replace words, maximum XOR via a binary trie), the bugs that bite everyone, and a one-page cheat sheet.`,
  sections: [
    {
      heading: "1. What a trie is & when to use it",
      blocks: [
        { type: "p", text: `A trie stores strings character by character along tree edges. The root is the empty prefix. Inserting "cat", "car", and "card" produces a tree where "ca" is a single shared path that then branches into 't' and 'r', and 'r' continues to 'd'. Shared prefixes are stored exactly once, which is both the space win and the source of every query trick.` },
        { type: "diagram", kind: "graph", caption: `Trie holding {"cat","car","dog"}. Each node id is the cumulative prefix it represents, so the label you see IS the prefix; the path root→node spells the stored characters. Highlighted nodes (cat, car, dog) are word-end nodes (is_end = True). Note "ca" is shared once before branching into "cat" and "car".`, data: {
          directed: true,
          nodes: ["root", "c", "ca", "cat", "car", "d", "do", "dog"],
          edges: [["root", "c"], ["c", "ca"], ["ca", "cat"], ["ca", "car"], ["root", "d"], ["d", "do"], ["do", "dog"]],
          positions: {
            "root": [160, 20],
            "c": [100, 80],
            "ca": [100, 140],
            "cat": [60, 200],
            "car": [140, 200],
            "d": [240, 80],
            "do": [240, 140],
            "dog": [240, 200]
          },
          highlight: ["cat", "car", "dog"]
        }},
        { type: "h3", text: "1.1 Trie vs hash set" },
        { type: "table", headers: ["Operation", "Hash set", "Trie"], rows: [
          ["Insert word (length L)", "O(L) to hash", "O(L) to walk/create nodes"],
          ["Exact search", "O(L) average", "O(L) worst case"],
          ["startsWith(prefix P)", "O(n·L) scan all words", "O(|P|) walk the prefix path"],
          ["Enumerate words by prefix", "O(n·L) scan", "O(|P|) to locate + DFS subtree"],
          ["Wildcard / '.' pattern match", "not supported directly", "O(branching) DFS over nodes"],
          ["Ordered / lexicographic traversal", "no", "yes (visit children in sorted order)"]
        ]},
        { type: "callout", text: `The litmus test: if the problem asks anything about prefixes, ordered enumeration, or matching many words simultaneously, a trie usually beats a hash set even though their exact-lookup costs are the same O(L).` },
        { type: "h3", text: "1.2 Complexity & space tradeoffs" },
        { type: "ul", items: [
          `Insert / search / startsWith: O(L) where L is the length of the word or prefix — independent of how many words are stored. No hashing constant, just pointer/dict hops.`,
          `Space: O(total characters across all words) in the worst case (no shared prefixes). With heavy prefix sharing a trie can use far less than storing each string separately.`,
          `Per-node overhead is the catch: a dict-of-children node carries a hash map; a fixed array-of-26 node carries 26 pointers even when only one is used. For sparse alphabets the dict wins; for dense, small alphabets the array wins on speed.`,
          `Tries trade memory for prefix speed. If you never query prefixes, that memory is wasted — use a set.`
        ]}
      ]
    },
    {
      heading: "2. Implementation: nodes & encodings",
      blocks: [
        { type: "p", text: `A trie node needs two things: a way to reach child nodes keyed by character, and a flag marking whether a word ends here. Optionally a counter (number of words passing through / ending here) for prefix-count problems.` },
        { type: "h3", text: "2.1 Encoding A — dict of children (most common)" },
        { type: "p", text: `Children stored in a Python dict keyed by character. Flexible alphabet, sparse-friendly, idiomatic. This is the default for interviews unless the problem fixes a small alphabet and demands speed.` },
        { type: "code", code: `class TrieNode:\n    def __init__(self):\n        self.children = {}      # char -> TrieNode\n        self.is_end = False     # True if a word ends at this node` },
        { type: "h3", text: "2.2 Encoding B — fixed array of 26" },
        { type: "p", text: `Children stored in a length-26 array indexed by ord(c) - ord('a'). Faster constant factor and no hashing, at the cost of 26 slots per node regardless of usage. Use when the alphabet is exactly lowercase a-z and you want raw speed.` },
        { type: "code", code: `class TrieNode:\n    def __init__(self):\n        self.children = [None] * 26   # index = ord(c) - ord('a')\n        self.is_end = False\n\n    def _idx(self, c):\n        return ord(c) - ord('a')` },
        { type: "callout", text: `Pick ONE encoding and stay consistent. Most of this guide uses the dict encoding because it generalizes to any alphabet and reads cleanly. Mentally swapping in the array version is a one-line change in each method.` }
      ]
    },
    {
      heading: "3. The standard Trie — TEMPLATE",
      blocks: [
        { type: "p", text: `This is the canonical Trie class (LeetCode 208). Memorize this exact shape — insert, search, and startsWith all follow the same "walk the path" skeleton; only the terminal check differs. Every other pattern in this guide is a variation on it.` },
        { type: "code", code: `class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        node = self.root\n        for ch in word:\n            if ch not in node.children:\n                node.children[ch] = TrieNode()\n            node = node.children[ch]\n        node.is_end = True            # mark the END node, not every node\n\n    def search(self, word: str) -> bool:\n        node = self._walk(word)\n        return node is not None and node.is_end   # exact word must end here\n\n    def startsWith(self, prefix: str) -> bool:\n        return self._walk(prefix) is not None      # path existing is enough\n\n    def _walk(self, s: str):\n        node = self.root\n        for ch in s:\n            if ch not in node.children:\n                return None\n            node = node.children[ch]\n        return node` },
        { type: "diagram", kind: "graph", caption: `Trie of {"car","card"}. The highlighted path root→c→ca→car is what _walk("car") traverses. search("car") returns True because node "car" has is_end = True (highlighted); startsWith("ca") also returns True because the path exists — but search("ca") returns False since "ca" is NOT a word-end. That single is_end check is the whole difference.`, data: {
          directed: true,
          nodes: ["root", "c", "ca", "car", "card"],
          edges: [["root", "c"], ["c", "ca"], ["ca", "car"], ["car", "card"]],
          positions: {
            "root": [160, 20],
            "c": [160, 80],
            "ca": [160, 140],
            "car": [160, 200],
            "card": [160, 260]
          },
          highlight: ["c", "ca", "car", "card"]
        }},
        { type: "callout", text: `The ONLY difference between search and startsWith is the final is_end check. search demands a completed word; startsWith just needs the path to exist. Confusing these two is the single most common trie bug.` }
      ]
    },
    {
      heading: "4. Pattern: add & search word with '.' wildcard",
      blocks: [
        { type: "p", text: `LeetCode 211 — Design Add and Search Words Data Structure. addWord is plain trie insert. search may contain '.' which matches any single character. The '.' forces a branch: you can no longer follow one path, so you DFS over all children at that position.` },
        { type: "h3", text: "4.1 Why DFS" },
        { type: "ul", items: [
          `For a normal character, descend the one matching child (or fail).`,
          `For '.', recurse into EVERY child, succeeding if any branch matches the rest of the pattern.`,
          `Base case: when the pattern is fully consumed, the answer is whether the current node is a word end (is_end).`
        ]},
        { type: "code", code: `class WordDictionary:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def addWord(self, word: str) -> None:\n        node = self.root\n        for ch in word:\n            node = node.children.setdefault(ch, TrieNode())\n        node.is_end = True\n\n    def search(self, word: str) -> bool:\n        def dfs(i, node):\n            if i == len(word):\n                return node.is_end          # consumed pattern -> must be a word\n            ch = word[i]\n            if ch == '.':\n                # wildcard: try every child\n                for child in node.children.values():\n                    if dfs(i + 1, child):\n                        return True\n                return False\n            if ch not in node.children:\n                return False\n            return dfs(i + 1, node.children[ch])\n\n        return dfs(0, self.root)` },
        { type: "diagram", kind: "graph", caption: `Wildcard search "b.d" against a trie of {"bad","bed","bud"}. The first char 'b' follows the one child b→ba/be/bu's parent. The '.' is a wildcard, so the DFS branches into EVERY child of node "b" (highlighted: ba, be, bu). Each branch then tries 'd'; "bad", "bed", and "bud" all match. If the pattern were "b.t", every branch would fail at the final char.`, data: {
          directed: true,
          nodes: ["root", "b", "ba", "be", "bu", "bad", "bed", "bud"],
          edges: [["root", "b"], ["b", "ba"], ["b", "be"], ["b", "bu"], ["ba", "bad"], ["be", "bed"], ["bu", "bud"]],
          positions: {
            "root": [160, 20],
            "b": [160, 80],
            "ba": [80, 140],
            "be": [160, 140],
            "bu": [240, 140],
            "bad": [80, 200],
            "bed": [160, 200],
            "bud": [240, 200]
          },
          highlight: ["ba", "be", "bu"]
        }},
        { type: "callout", text: `The wildcard return must be node.is_end at the base case, NOT True. Reaching a node after consuming the pattern only counts if a word actually ends there.` }
      ]
    },
    {
      heading: "5. Pattern: Word Search II (trie + grid backtracking)",
      blocks: [
        { type: "p", text: `LeetCode 212 — given a grid of letters and a list of words, return every word that can be formed by adjacent cells. The naive approach runs a separate DFS for each word: O(W · grid-DFS). With many words this re-walks the same grid paths over and over.` },
        { type: "h3", text: "5.1 Why a trie beats N separate searches" },
        { type: "ul", items: [
          `Build ONE trie from all words. Now a single DFS from each cell explores the grid while simultaneously walking the trie.`,
          `At each cell, you only continue if the current letter is a child in the trie — the trie prunes the grid search to paths that are prefixes of SOME word. Dead-end paths are abandoned immediately.`,
          `Words sharing prefixes are matched together in one traversal instead of once per word. This turns "for each word, search grid" into "search grid once, collect any word you pass through".`,
          `Store the full word on the terminal node so you can append it directly on a hit (avoids rebuilding the string).`,
          `Prune: after collecting a word, set its terminal node.word = None and optionally delete leaf children so the trie shrinks as words are found.`
        ]},
        { type: "code", code: `def findWords(board, words):\n    # 1) build a trie; stash the whole word at terminal nodes\n    root = {}\n    for w in words:\n        node = root\n        for ch in w:\n            node = node.setdefault(ch, {})\n        node['#'] = w               # '#' marks end and holds the word\n\n    rows, cols = len(board), len(board[0])\n    found = []\n\n    def dfs(r, c, node):\n        ch = board[r][c]\n        if ch not in node:\n            return\n        nxt = node[ch]\n        word = nxt.get('#')\n        if word is not None:\n            found.append(word)\n            nxt['#'] = None         # prune: don't report the same word twice\n        board[r][c] = '*'           # mark visited\n        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '*':\n                dfs(nr, nc, nxt)\n        board[r][c] = ch            # restore\n        # optional pruning of dead leaves\n        if not nxt:\n            del node[ch]\n\n    for r in range(rows):\n        for c in range(cols):\n            dfs(r, c, root)\n    return found` },
        { type: "callout", text: `Here the trie is a plain nested dict ({} of children, '#' key for terminal). That's a legitimate, very common lightweight encoding for this problem — no TrieNode class needed.` }
      ]
    },
    {
      heading: "6. Pattern: longest word in dictionary",
      blocks: [
        { type: "p", text: `LeetCode 720 — find the longest word that can be built one character at a time, where every prefix along the way is also a word in the list. Ties broken by smallest lexicographic order.` },
        { type: "ul", items: [
          `Insert all words. A word is "buildable" only if every node on its path is itself is_end.`,
          `DFS from the root; only descend into a child if child.is_end is True (the prefix so far is a valid word).`,
          `Track the best word seen: longer wins; on equal length, the lexicographically smaller wins (iterate children in sorted order and the natural traversal handles ties).`
        ]},
        { type: "code", code: `def longestWord(words):\n    root = TrieNode()\n    for w in words:\n        node = root\n        for ch in w:\n            node = node.children.setdefault(ch, TrieNode())\n        node.is_end = True\n\n    best = ""\n    # DFS; path is built only through nodes that are themselves word-ends\n    def dfs(node, path):\n        nonlocal best\n        if len(path) > len(best):       # sorted traversal => first hit is smallest\n            best = path\n        for ch in sorted(node.children):\n            child = node.children[ch]\n            if child.is_end:            # every prefix must be a word\n                dfs(child, path + ch)\n\n    dfs(root, "")\n    return best` },
        { type: "callout", text: `Iterating sorted(node.children) means the first word found at any given length is automatically the lexicographically smallest, so a simple length comparison settles ties for free.` }
      ]
    },
    {
      heading: "7. Pattern: replace words / prefix matching",
      blocks: [
        { type: "p", text: `LeetCode 648 — Replace Words. Given a dictionary of roots and a sentence, replace every word by the SHORTEST root that is a prefix of it. Insert all roots into a trie, then for each sentence word walk the trie and stop at the first is_end (shortest matching root).` },
        { type: "code", code: `def replaceWords(dictionary, sentence):\n    root = TrieNode()\n    for w in dictionary:\n        node = root\n        for ch in w:\n            node = node.children.setdefault(ch, TrieNode())\n        node.is_end = True\n\n    def shortest_root(word):\n        node = root\n        prefix = []\n        for ch in word:\n            if ch not in node.children:\n                return word             # no root is a prefix\n            node = node.children[ch]\n            prefix.append(ch)\n            if node.is_end:             # first (=shortest) root found\n                return ''.join(prefix)\n        return word\n\n    return ' '.join(shortest_root(w) for w in sentence.split())` },
        { type: "callout", text: `Stopping at the FIRST is_end gives the shortest root. If the problem asked for the longest matching prefix instead, you'd keep walking and remember the last is_end seen.` }
      ]
    },
    {
      heading: "8. Pattern: maximum XOR of two numbers (binary trie)",
      blocks: [
        { type: "p", text: `LeetCode 421 — Maximum XOR of Two Numbers in an Array. A bit trie (a.k.a. binary trie) stores integers as fixed-width bit strings (most-significant bit first). Each node has at most two children: '0' and '1'. To maximize XOR for a query number, you greedily walk toward the OPPOSITE bit at each level, because a differing bit contributes a 1 to that (higher) position of the XOR.` },
        { type: "h3", text: "8.1 The idea of a bit-trie" },
        { type: "ul", items: [
          `Treat each integer as a string of bits, say 32 bits, from MSB to LSB. Insert it like any other word into a trie over the alphabet {0, 1}.`,
          `XOR is maximized greedily from the top bit down: at each level you want the bit that DIFFERS from your number's bit (1 XOR 0 = 1, the maximum possible at that position).`,
          `For each number, query the trie taking the opposite bit when it exists, else the same bit. The XOR accumulates the best achievable against everything inserted so far.`,
          `Insert each number first (or all upfront), then query — this finds the best pair without the O(n²) all-pairs comparison.`
        ]},
        { type: "code", code: `def findMaximumXOR(nums):\n    HIGH = max(nums).bit_length() - 1 if max(nums) else 0\n    root = {}\n\n    def insert(num):\n        node = root\n        for i in range(HIGH, -1, -1):\n            bit = (num >> i) & 1\n            node = node.setdefault(bit, {})\n\n    def query(num):\n        # walk toward the opposite bit to maximize XOR\n        node = root\n        best = 0\n        for i in range(HIGH, -1, -1):\n            bit = (num >> i) & 1\n            want = 1 - bit\n            if want in node:\n                best |= (1 << i)        # this bit of XOR is 1\n                node = node[want]\n            else:\n                node = node[bit]\n        return best\n\n    ans = 0\n    for num in nums:\n        insert(num)\n    for num in nums:\n        ans = max(ans, query(num))\n    return ans` },
        { type: "diagram", kind: "graph", caption: `Binary trie over 3-bit numbers {3=011, 5=101, 6=110}. Each level is one bit MSB→LSB; node ids encode the bit-prefix (b0/b1 = first bit, b10/b11 = first two bits, etc.). Querying for the best XOR partner of 2=010 greedily takes the OPPOSITE bit at each level: want 1 (→b1), then want 0 (→b10), then want 1 (→b101) — landing on 5=101, giving 010 XOR 101 = 111 = 7. The highlighted path is that greedy opposite-bit walk.`, data: {
          directed: true,
          nodes: ["root", "b0", "b1", "b01", "b10", "b11", "b011", "b101", "b110"],
          edges: [["root", "b0"], ["root", "b1"], ["b0", "b01"], ["b1", "b10"], ["b1", "b11"], ["b01", "b011"], ["b10", "b101"], ["b11", "b110"]],
          positions: {
            "root": [160, 20],
            "b0": [100, 80],
            "b1": [220, 80],
            "b01": [100, 140],
            "b10": [180, 140],
            "b11": [260, 140],
            "b011": [100, 200],
            "b101": [180, 200],
            "b110": [260, 200]
          },
          highlight: ["b1", "b10", "b101"]
        }},
        { type: "callout", text: `The binary trie generalizes to range/count XOR queries and is the standard tool whenever you need "best XOR partner" in better than O(n²). Fix the bit width (e.g. 31) so all numbers align at the same depth.` }
      ]
    },
    {
      heading: "9. Common bugs & how to avoid them",
      blocks: [
        { type: "table", headers: ["Bug", "Symptom", "Fix"], rows: [
          ["Forgetting is_end", "startsWith works but search returns True for prefixes that aren't words (e.g. 'ca' when only 'cat' inserted)", "search must check node.is_end at the end, not just that the path exists"],
          ["Marking every node is_end", "Every prefix reports as a complete word", "Set is_end = True ONLY on the final node after the insert loop"],
          ["Wildcard base case returns True", "'.' search matches prefixes that aren't full words", "At pattern end, return node.is_end, not True"],
          ["Wildcard not iterating all children", "'.' only matches one branch and misses valid words", "Loop over node.children.values() and return True if ANY branch succeeds"],
          ["Not pruning in Word Search II", "Same word collected multiple times / slow", "Null out the terminal word marker after collecting; optionally delete empty child dicts"],
          ["Word Search II: not marking visited cells", "Reuses a cell within one path", "Temporarily overwrite board[r][c] then restore on backtrack"],
          ["Bit trie misaligned widths", "Wrong XOR because numbers have different bit lengths", "Iterate a FIXED bit range (high..0) for every number"],
          ["Mutating dict while iterating", "RuntimeError during '.' DFS or pruning", "Snapshot with list(...) or prune outside the loop"]
        ]}
      ]
    },
    {
      heading: "10. Study plan",
      blocks: [
        { type: "p", text: `Work top to bottom. The first two cement the template; the middle build the trie+DFS instinct; the last add the binary-trie variant.` },
        { type: "table", headers: ["#", "Problem", "LeetCode", "Skill", "Difficulty"], rows: [
          ["1", "Implement Trie (Prefix Tree)", "208", "The template — insert/search/startsWith", "Medium"],
          ["2", "Implement Trie II (prefix/word counts)", "1804", "Add counters to nodes", "Medium"],
          ["3", "Add and Search Word (wildcard '.')", "211", "DFS over trie for '.'", "Medium"],
          ["4", "Replace Words", "648", "Shortest-prefix walk", "Medium"],
          ["5", "Longest Word in Dictionary", "720", "DFS through all-prefix-words", "Medium"],
          ["6", "Map Sum Pairs", "677", "Prefix sum aggregation in trie", "Medium"],
          ["7", "Word Search II", "212", "Trie + grid backtracking + pruning", "Hard"],
          ["8", "Maximum XOR of Two Numbers", "421", "Binary (bit) trie greedy", "Medium"],
          ["9", "Concatenated Words", "472", "Trie/DFS word composition", "Hard"],
          ["10", "Stream of Characters", "1032", "Reverse-suffix trie matching", "Hard"],
          ["11", "Search Suggestions System", "1268", "Prefix enumeration / autocomplete", "Medium"],
          ["12", "Palindrome Pairs", "336", "Trie of reversed words", "Hard"]
        ]}
      ]
    },
    {
      heading: "11. Cheat sheet & trigger table",
      blocks: [
        { type: "h3", text: "11.1 When to reach for a trie" },
        { type: "table", headers: ["Trigger in the prompt", "Use"], rows: [
          ["\"prefix\", \"starts with\", autocomplete/typeahead", "Standard trie + startsWith / DFS enumeration"],
          ["Pattern with '.' / single-char wildcard over a word set", "Trie + DFS branching on '.'"],
          ["Find many words inside a grid", "Word Search II: one trie + grid backtracking"],
          ["Shortest/longest root that prefixes a word", "Trie walk, stop at first/last is_end"],
          ["Build word one char at a time, every prefix a word", "Trie DFS only through is_end children"],
          ["Max XOR / best XOR partner / bitwise prefix", "Binary (bit) trie, greedy opposite-bit walk"],
          ["Exact membership only, never prefixes", "Use a hash set, NOT a trie"]
        ]},
        { type: "h3", text: "11.2 The skeleton, from memory" },
        { type: "code", code: `# node = {children: {}, is_end: False}\n# insert: walk/create per char, set is_end on LAST node\n# search: walk; True iff path exists AND last node.is_end\n# startsWith: walk; True iff path exists\n# wildcard '.': DFS all children; base case returns node.is_end\n# grid: build ONE trie, DFS grid + trie together, prune found words\n# bit trie: insert bits MSB->LSB; query takes OPPOSITE bit greedily` }
      ]
    }
  ],
  cheatsheet: [
    `Trie = tree of prefixes. Node = {children dict/array, is_end flag}. Path root->node spells a prefix.`,
    `insert/search/startsWith are all O(L); the win over a hash set is PREFIX queries, not exact lookup.`,
    `search returns (path exists AND node.is_end). startsWith returns (path exists). The is_end check is the whole difference.`,
    `Set is_end = True ONLY on the final node of insert — never on intermediate nodes.`,
    `Wildcard '.': DFS into every child; base case (pattern consumed) returns node.is_end, NOT True.`,
    `Word Search II: build ONE trie from all words, DFS the grid and trie together; the trie prunes dead grid paths. Null out a word's terminal marker after collecting it.`,
    `Replace Words: walk the trie, stop at the FIRST is_end for the shortest root (LAST is_end for longest).`,
    `Longest Word in Dictionary: DFS only through children that are themselves is_end; iterate sorted children to break lexicographic ties for free.`,
    `Binary (bit) trie for max XOR: store integers as fixed-width bits MSB->LSB; to maximize XOR, greedily follow the OPPOSITE bit at each level.`,
    `Lightweight encoding: a nested plain dict with a '#' (or sentinel) key for the terminal node — no class needed, common in grid/XOR problems.`,
    `Space cost: per-node overhead (dict or 26-array). If you never query prefixes, a trie wastes memory — use a set.`,
    `Two encodings: dict-of-children (sparse, any alphabet, idiomatic) vs fixed array[26] (fast, dense lowercase a-z).`
  ]
}
