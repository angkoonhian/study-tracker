// Python trivia / gotcha cards (Phase 5b).
//
// "Predict-the-output / why does this behave weirdly" cards covering Python
// internals that trading firms (HRT, Jane Street, Two Sigma, Jump, Optiver,
// Citadel, etc.) probe in interviews: reference aliasing, mutable defaults,
// late-binding closures, integer/string interning, bool-is-int, float repr,
// floor division on negatives, and more.
//
// Each card's `code` is a small self-contained snippet that PRINTS something,
// and `answer` is the EXACT stdout it produces (verified by running every
// snippet under CPython 3.13). `firms` tags reflect the style of firm known to
// probe this category from public interview reports — they are illustrative.

export const PYTHON_TRIVIA = [
  {
    id: "mutable-default-arg",
    concept: "Mutable default argument",
    firms: ["HRT", "Two Sigma", "General"],
    source: "the canonical Python gotcha; shows up in nearly every firm's screen",
    code: `def add(x, acc=[]):
    acc.append(x)
    return acc

print(add(1))
print(add(2))`,
    question: "What does this print, and why?",
    answer: "[1]\n[1, 2]",
    explanation:
      "Default argument values are evaluated ONCE, at function-definition time, not on each call. So `acc` is a single shared list object that persists across calls. The fix is `acc=None` then `if acc is None: acc = []` inside the body.",
  },
  {
    id: "list-aliasing-assignment",
    concept: "Assignment binds names to the same object (aliasing)",
    firms: ["Jump", "Citadel", "General"],
    source: "classic reference-vs-copy question; Jump asks about object identity",
    code: `a = [1, 2, 3]
b = a
b.append(4)
print(a)
print(a is b)`,
    question: "What is printed?",
    answer: "[1, 2, 3, 4]\nTrue",
    explanation:
      "`b = a` does not copy the list; it binds the name `b` to the SAME object `a` points at. Mutating through either name is visible through both. Use `b = a[:]` or `b = list(a)` (shallow) or `copy.deepcopy` (deep) to actually copy.",
  },
  {
    id: "shared-empty-list-chain",
    concept: "Chained assignment shares one object (a = b = [])",
    firms: ["Two Sigma", "General"],
    source: "follow-up to aliasing; common confusion point",
    code: `a = b = []
a.append(1)
print(a)
print(b)
print(a is b)`,
    question: "What is printed?",
    answer: "[1]\n[1]\nTrue",
    explanation:
      "`a = b = []` evaluates the RHS `[]` once and binds BOTH names to that single list. They are aliases, so appending through `a` is seen through `b`. This differs from `a, b = [], []`, which creates two distinct lists.",
  },
  {
    id: "shallow-vs-deep-copy",
    concept: "Shallow copy shares nested objects",
    firms: ["HRT", "Jane Street", "General"],
    source: "copy module gotcha; nested-structure aliasing",
    code: `import copy
a = [[1, 2], [3, 4]]
b = copy.copy(a)
b[0].append(99)
print(a)
print(b is a)`,
    question: "What is printed?",
    answer: "[[1, 2, 99], [3, 4]]\nFalse",
    explanation:
      "`copy.copy` makes a NEW outer list but copies references to the same inner lists. `b is a` is False (different outer list), yet `b[0] is a[0]` is True, so mutating the inner list shows up in both. `copy.deepcopy` recursively copies the inner objects too.",
  },
  {
    id: "is-vs-eq-small-int",
    concept: "`is` vs `==` and small-int caching",
    firms: ["Jump", "Optiver", "General"],
    source: "identity-vs-equality; CPython caches ints in [-5, 256]",
    code: `a = 256
b = 256
print(a is b)
c = 257
d = int("257")
print(c is d)
print(c == d)`,
    question: "What is printed?",
    answer: "True\nFalse\nTrue",
    explanation:
      "CPython pre-allocates and caches small integers from -5 to 256, so equal values in that range are the SAME object (`is` True). 257 is outside the cache, so two separately-built 257 objects are distinct (`is` False) even though they're `==`. (Two 257 LITERALS in one code block get folded to one object by the compiler, so `d` is built at runtime via int(\"257\") to defeat that.) Never use `is` to compare values — use `==`.",
  },
  {
    id: "string-interning",
    concept: "String interning of identifier-like literals",
    firms: ["Two Sigma", "General"],
    source: "string interning quirk; identity comparison trap",
    code: `a = "hello"
b = "hello"
print(a is b)
c = "hello world!"
d = "hello world!"
print(c == d)`,
    question: "What is printed?",
    answer: "True\nTrue",
    explanation:
      "Compile-time string literals that look like identifiers (letters/digits/underscores) are interned, so `a is b` is True. Strings with spaces/punctuation may or may not be interned depending on the implementation, so you must not rely on `is` — but `==` is always reliable, hence the second line is True.",
  },
  {
    id: "late-binding-closure",
    concept: "Late-binding closures in a loop",
    firms: ["HRT", "Jane Street", "Jump", "General"],
    source: "the lambda-in-loop classic; very common phone-screen question",
    code: `fns = [lambda: i for i in range(3)]
print([f() for f in fns])`,
    question: "What does this print, and why isn't it [0, 1, 2]?",
    answer: "[2, 2, 2]",
    explanation:
      "Closures capture the VARIABLE `i`, not its value at creation time. By the time the lambdas are called, the loop has finished and `i` is 2, so all of them see 2. Fix by binding per-iteration: `lambda i=i: i` (default arg captures current value) or use `functools.partial`.",
  },
  {
    id: "closure-default-arg-fix",
    concept: "Fixing late binding with a default argument",
    firms: ["Jane Street", "General"],
    source: "the standard fix to the closure gotcha",
    code: `fns = [lambda i=i: i for i in range(3)]
print([f() for f in fns])`,
    question: "Why does this print [0, 1, 2] when the version without `i=i` prints [2, 2, 2]?",
    answer: "[0, 1, 2]",
    explanation:
      "`i=i` makes `i` a default parameter, which is evaluated at lambda-creation time (each loop iteration), snapshotting the current value. The body then reads the parameter, not the enclosing loop variable, so each closure remembers its own value.",
  },
  {
    id: "default-arg-eval-time",
    concept: "Default arg evaluated once at def time",
    firms: ["Two Sigma", "General"],
    source: "demonstrates def-time evaluation with a non-list default",
    code: `def f(x, n=len([1, 2, 3])):
    return x + n

print(f(10))
print(f(10))`,
    question: "What is printed?",
    answer: "13\n13",
    explanation:
      "The default expression `len([1, 2, 3])` runs ONCE when `def` executes, producing 3, which is stored as the default. It is not re-evaluated per call. This is the same mechanism behind the mutable-default-argument trap.",
  },
  {
    id: "tuple-augmented-assign",
    concept: "Augmented assignment on a list inside a tuple",
    firms: ["Jump", "HRT", "General"],
    source: "the infamous 't[1] += [3]' both-mutates-and-raises question",
    code: `t = (1, [2])
try:
    t[1] += [3]
except TypeError as e:
    print("TypeError")
print(t)`,
    question: "What is printed? (Hint: it both raises AND changes something.)",
    answer: "TypeError\n(1, [2, 3])",
    explanation:
      "`t[1] += [3]` is `t[1] = t[1].__iadd__([3])`. The list's in-place `__iadd__` SUCCEEDS and extends the list to [2, 3]. Then Python tries to store the result back into the tuple via item assignment, which raises TypeError because tuples are immutable. Net effect: the list is mutated AND an exception is raised.",
  },
  {
    id: "generator-exhaustion",
    concept: "Generators are single-use (exhaustion)",
    firms: ["Citadel", "Optiver", "General"],
    source: "iterator exhaustion; common data-pipeline bug",
    code: `g = (x * x for x in range(3))
print(list(g))
print(list(g))`,
    question: "What is printed? Why is the second list empty?",
    answer: "[0, 1, 4]\n[]",
    explanation:
      "A generator is an iterator that can be consumed only once. The first `list(g)` drains it; the second sees an already-exhausted iterator and yields nothing. To iterate twice, materialize into a list, or rebuild the generator.",
  },
  {
    id: "dict-comprehension-overwrite",
    concept: "Duplicate keys in a dict comprehension keep the last value",
    firms: ["Two Sigma", "General"],
    source: "dict-key collision in comprehensions",
    code: `d = {k: v for k, v in [("a", 1), ("b", 2), ("a", 3)]}
print(d)`,
    question: "What is printed?",
    answer: "{'a': 3, 'b': 2}",
    explanation:
      "Each assignment to an existing key overwrites the prior value, so the last `('a', 3)` wins. Insertion order (preserved since 3.7) keeps 'a' before 'b' because 'a' was inserted first, even though its value was updated later.",
  },
  {
    id: "dict-insertion-order",
    concept: "Dicts preserve insertion order (3.7+)",
    firms: ["General"],
    source: "ordered-dict-by-default guarantee",
    code: `d = {}
d["z"] = 1
d["a"] = 2
d["m"] = 3
print(list(d.keys()))`,
    question: "What order are the keys printed in?",
    answer: "['z', 'a', 'm']",
    explanation:
      "Since Python 3.7, regular dicts guarantee insertion order. Keys come out in the order they were first inserted, NOT sorted. (Updating an existing key's value does not change its position.)",
  },
  {
    id: "bool-is-int",
    concept: "bool is a subclass of int",
    firms: ["Jump", "Optiver", "General"],
    source: "True + True == 2; arithmetic on booleans",
    code: `print(True + True)
print(sum([True, True, False]))
print(True * 3)`,
    question: "What is printed?",
    answer: "2\n2\n3",
    explanation:
      "`bool` subclasses `int`, with True == 1 and False == 0. So booleans participate in arithmetic: True + True is 2, sum of [True, True, False] counts the truthy ones (2), and True * 3 is 3. This is why `sum(x > 0 for x in data)` counts positives.",
  },
  {
    id: "bool-dict-key-collision",
    concept: "1, 1.0, and True collide as dict keys",
    firms: ["HRT", "Jump", "General"],
    source: "hash/eq equivalence; {1: 'a', True: 'b', 1.0: 'c'}",
    code: `d = {1: "a", True: "b", 1.0: "c"}
print(d)
print(len(d))`,
    question: "What is printed?",
    answer: "{1: 'c'}\n1",
    explanation:
      "Dict keys are compared by hash and equality. Since 1 == True == 1.0 and they all hash the same, they're treated as the SAME key. The first key object encountered (the int 1) is KEPT, but its value is overwritten by each later assignment, ending at 'c'. Result: a single entry {1: 'c'}.",
  },
  {
    id: "chained-comparison",
    concept: "Chained comparison is not left-to-right grouping",
    firms: ["Jane Street", "Two Sigma", "General"],
    source: "1 < 2 < 3 desugars to 1<2 and 2<3, not (1<2)<3",
    code: `print(1 < 2 < 3)
print((1 < 2) < 3)
print(3 > 2 == 2)`,
    question: "What is printed?",
    answer: "True\nTrue\nTrue",
    explanation:
      "`1 < 2 < 3` is sugar for `1 < 2 and 2 < 3` (True). But `(1 < 2) < 3` first computes `True`, then `True < 3` is `1 < 3` (True) — same result here by coincidence. `3 > 2 == 2` chains to `3 > 2 and 2 == 2` (True). The trap is that grouping with parens changes the meaning.",
  },
  {
    id: "false-in-list-chain",
    concept: "Chained comparison surprise: False == False in [False]",
    firms: ["Jane Street", "General"],
    source: "a famous chained-comparison brain-teaser",
    code: `print(False == False in [False])`,
    question: "Is this True or False? (It's not what most people guess.)",
    answer: "True",
    explanation:
      "This chains to `(False == False) and (False in [False])`, i.e. `True and True`, which is True. People expect it to mean `False == (False in [False])` -> `False == True` -> False, but chaining binds both comparisons to the middle operand.",
  },
  {
    id: "float-repr",
    concept: "Floating-point representation (0.1 + 0.2)",
    firms: ["Optiver", "Citadel", "Jump", "General"],
    source: "IEEE-754 binary float rounding; pricing/PnL relevance",
    code: `print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)`,
    question: "What is printed?",
    answer: "0.30000000000000004\nFalse",
    explanation:
      "0.1, 0.2, and 0.3 have no exact binary representation, so their stored values are rounded. The sum's rounding error makes it slightly above 0.3, hence the long repr and `== 0.3` being False. Compare floats with a tolerance (math.isclose) or use Decimal/fixed-point for money.",
  },
  {
    id: "floor-division-negative",
    concept: "Floor division and modulo with negatives",
    firms: ["Jump", "HRT", "Optiver", "General"],
    source: "Python floors toward -inf; differs from C truncation",
    code: `print(-7 // 2)
print(-7 % 2)
print(7 % -2)`,
    question: "What is printed?",
    answer: "-4\n1\n-1",
    explanation:
      "Python's `//` floors toward negative infinity, so -7 // 2 = -4 (not -3 as C truncation would give). The modulo result takes the SIGN OF THE DIVISOR: -7 % 2 = 1 (divisor positive), 7 % -2 = -1 (divisor negative). The invariant a == (a//b)*b + (a%b) always holds.",
  },
  {
    id: "nested-list-multiplication",
    concept: "List multiplication shares nested references",
    firms: ["HRT", "Citadel", "General"],
    source: "[[0]*3]*3 makes 3 aliases of one row; grid-init bug",
    code: `grid = [[0] * 3] * 3
grid[0][0] = 9
print(grid)`,
    question: "What is printed? Why does setting grid[0][0] change other rows?",
    answer: "[[9, 0, 0], [9, 0, 0], [9, 0, 0]]",
    explanation:
      "`[[0]*3]*3` creates ONE inner list and repeats the SAME reference three times. All three rows are the same object, so writing to grid[0][0] is visible in every row. Build independent rows with `[[0]*3 for _ in range(3)]`.",
  },
  {
    id: "iadd-vs-plus-list",
    concept: "+= mutates a list in place; + rebinds",
    firms: ["Jump", "Two Sigma", "General"],
    source: "in-place __iadd__ vs creating a new list; function-arg consequence",
    code: `def grow(lst):
    lst += [4]

def grow_rebind(lst):
    lst = lst + [4]

a = [1, 2, 3]
grow(a)
print(a)
b = [1, 2, 3]
grow_rebind(b)
print(b)`,
    question: "What is printed for a and b?",
    answer: "[1, 2, 3, 4]\n[1, 2, 3]",
    explanation:
      "`lst += [4]` calls list.__iadd__, mutating the caller's list in place (a changes). `lst = lst + [4]` builds a NEW list and rebinds the local name only, leaving the caller's list untouched (b unchanged). For lists, += and + are NOT interchangeable.",
  },
  {
    id: "string-immutability-concat",
    concept: "Strings are immutable; += creates new objects",
    firms: ["Optiver", "General"],
    source: "string += in a loop; identity changes each time",
    code: `s = "ab"
first = id(s)
s += "c"
print(s)
print(id(s) == first)`,
    question: "What is printed?",
    answer: "abc\nFalse",
    explanation:
      "Strings are immutable, so `s += 'c'` cannot modify in place — it builds a brand-new string and rebinds `s`, giving a different id. Repeated `+=` in a loop is O(n^2); use ''.join(parts) instead. (Lists, being mutable, keep their id under +=.)",
  },
  {
    id: "any-all-empty",
    concept: "any/all on an empty iterable",
    firms: ["Two Sigma", "General"],
    source: "vacuous truth; all([]) is True, any([]) is False",
    code: `print(all([]))
print(any([]))`,
    question: "What is printed?",
    answer: "True\nFalse",
    explanation:
      "`all([])` is True by vacuous truth (no element fails the test). `any([])` is False (no element passes). This trips people up in guard conditions like `if all(checks): ...` when `checks` can be empty.",
  },
  {
    id: "sort-stability",
    concept: "Python's sort is stable",
    firms: ["Jane Street", "HRT", "General"],
    source: "Timsort stability; ties keep original relative order",
    code: `data = [("b", 2), ("a", 2), ("c", 1)]
print(sorted(data, key=lambda p: p[1]))`,
    question: "What is printed? How are the two items with key 2 ordered?",
    answer: "[('c', 1), ('b', 2), ('a', 2)]",
    explanation:
      "Python's sort (Timsort) is STABLE: elements comparing equal on the key keep their original relative order. So ('b', 2) stays before ('a', 2) because it appeared first in the input. Stability lets you sort by multiple keys in successive passes.",
  },
  {
    id: "truthiness-empty-containers",
    concept: "Truthiness of empty vs non-empty containers",
    firms: ["Optiver", "General"],
    source: "empty containers are falsy; common 'if x:' idiom",
    code: `vals = [[], [0], "", "x", {}, {0: 0}, 0, 0.0]
print([bool(v) for v in vals])`,
    question: "What is printed?",
    answer: "[False, True, False, True, False, True, False, False]",
    explanation:
      "Empty containers ([], '', {}) and numeric zeros (0, 0.0) are falsy; non-empty containers are truthy regardless of contents — note [0] and {0:0} are truthy because they're non-empty even though they 'contain zero'. This is why `if not lst:` tests emptiness.",
  },
  {
    id: "args-default-tuple",
    concept: "*args is always a tuple (empty if none passed)",
    firms: ["General"],
    source: "variadic args packing; empty-call behavior",
    code: `def f(*args):
    return args

print(f())
print(f(1, 2, 3))`,
    question: "What is printed?",
    answer: "()\n(1, 2, 3)",
    explanation:
      "`*args` packs positional arguments into a TUPLE. With no arguments it's an empty tuple `()`, never None. Because it's a fresh tuple per call (and tuples are immutable), it doesn't suffer the mutable-default-argument problem.",
  },
  {
    id: "int-float-set-collision",
    concept: "1 and 1.0 collapse in a set",
    firms: ["HRT", "Jump", "General"],
    source: "hash/eq equivalence in sets, like the dict-key case",
    code: `s = {1, 1.0, 2}
print(len(s))
print(s == {1, 2})`,
    question: "What is printed?",
    answer: "2\nTrue",
    explanation:
      "Sets de-duplicate by hash and equality. Since 1 == 1.0 and they hash identically, only one of them is kept, leaving {1, 2} with length 2. The whichever-was-added-first object is retained, but equality with {1, 2} holds either way.",
  },
  {
    id: "list-extend-vs-append",
    concept: "append adds one element; extend iterates",
    firms: ["Optiver", "General"],
    source: "append/extend confusion; iterating strings",
    code: `a = [1, 2]
a.append([3, 4])
print(a)
b = [1, 2]
b.extend("ab")
print(b)`,
    question: "What is printed?",
    answer: "[1, 2, [3, 4]]\n[1, 2, 'a', 'b']",
    explanation:
      "`append(x)` adds x as a SINGLE element (so the list becomes nested). `extend(iter)` iterates its argument and adds each item — and a string is iterable, so 'ab' contributes 'a' and 'b' separately. Mixing these up is a frequent bug.",
  },
  {
    id: "is-none-vs-eq",
    concept: "Comparing with None and falsy values",
    firms: ["Two Sigma", "General"],
    source: "the 'is None' vs truthiness distinction; 0 vs None bug",
    code: `def get(x):
    return "missing" if not x else "present"

def get2(x):
    return "missing" if x is None else "present"

print(get(0))
print(get2(0))`,
    question: "What is printed? Why do these disagree on 0?",
    answer: "missing\npresent",
    explanation:
      "`not x` is True for ANY falsy value (0, '', [], None), so get(0) wrongly reports 'missing'. `x is None` checks specifically for None, so get2(0) correctly reports 'present'. Always use `is None` when you mean 'no value', not a truthiness test.",
  },
  {
    id: "nan-self-comparison",
    concept: "NaN is not equal to itself",
    firms: ["Optiver", "Citadel", "Jump", "General"],
    source: "IEEE-754 NaN semantics; data-cleaning trap",
    code: `nan = float("nan")
print(nan == nan)
print(nan != nan)
print([nan] == [nan])`,
    question: "What is printed? Why is the list comparison different?",
    answer: "False\nTrue\nTrue",
    explanation:
      "By IEEE-754, NaN compares unequal to everything including itself, so `nan == nan` is False. But list/container equality first checks IDENTITY per element (`a is b or a == b`) — since both list slots hold the SAME nan object, the identity short-circuit makes `[nan] == [nan]` True.",
  },
];
