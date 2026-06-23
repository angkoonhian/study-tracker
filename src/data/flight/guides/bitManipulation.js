export default {
  id: "bit-manipulation",
  title: "Bit Manipulation",
  subtitle: "Think in bits: XOR tricks, masks, and bit-level arithmetic for the interview.",
  emoji: "",
  intro: `Bit manipulation is the art of operating on the individual binary digits of an integer instead of its decimal value. A handful of operators (& | ^ ~ << >>) and a small vocabulary of one-line idioms unlock O(1) tricks for problems that look much harder: finding the one element that appears an odd number of times, enumerating every subset of a set, packing a "visited" set into a single int, or adding two numbers with no + sign.\\n\\nThe core mental model: an integer is an array of bits indexed from the least-significant bit (LSB, position 0, value 2^0) upward. "Setting bit i" means turning on the bit worth 2^i. Almost every idiom is built from a mask (a number with exactly the bits you care about turned on) combined with one of the bitwise operators. Memorize maybe ten idioms and you can derive the rest.\\n\\nPython adds one crucial wrinkle that trips up nearly everyone: Python integers have arbitrary precision and behave as if they had infinitely many bits, using two's-complement semantics that extend infinitely to the left for negatives. There is no 32-bit int and no overflow. Most LeetCode bit problems are implicitly phrased in terms of fixed-width 32-bit two's-complement integers, so in Python you must simulate that width yourself with masking (& 0xFFFFFFFF) and reinterpret the sign by hand. This guide treats that caveat as a first-class topic because getting it wrong is the single most common source of wrong answers and infinite loops in Python bit problems.\\n\\nThis handbook covers the operators and the canonical idiom table, the XOR family of problems, counting bits and bitmask enumeration, bit-level arithmetic, the Python pitfalls, a study plan, and a one-page cheat sheet.`,
  sections: [
    {
      heading: "1. The operators",
      blocks: [
        { type: "p", text: `There are six operators. Five are bitwise (they act on each bit position independently) and two are shifts. All of them treat their operands as binary numbers.` },
        { type: "h3", text: "1.1 What each operator does" },
        { type: "table",
          headers: ["Op", "Name", "Effect on each bit position", "Example"],
          rows: [
            ["&", "AND", "1 only if both bits are 1", "0b1100 & 0b1010 = 0b1000 (8)"],
            ["|", "OR", "1 if either bit is 1", "0b1100 | 0b1010 = 0b1110 (14)"],
            ["^", "XOR", "1 if the bits differ", "0b1100 ^ 0b1010 = 0b0110 (6)"],
            ["~", "NOT", "flips every bit (unary)", "~5 = -6 in Python (two's complement)"],
            ["<<", "left shift", "x << k multiplies by 2^k (appends k zeros)", "1 << 4 = 16"],
            [">>", "right shift", "x >> k floor-divides by 2^k (drops k low bits)", "20 >> 2 = 5"]
          ]
        },
        { type: "callout", text: `Mental shortcut: AND clears bits (use it with a mask to keep/test bits), OR sets bits, XOR toggles bits and "cancels" equal values. Shifts move a mask to the position you want.` },
        { type: "diagram", kind: "array",
          data: {
            values: [0, 0, 0, 0, 1, 1, 0, 1],
            highlight: [4, 5, 7],
            labels: { "0": "b7", "1": "b6", "2": "b5", "3": "b4", "4": "b3", "5": "b2", "6": "b1", "7": "b0" }
          },
          caption: "The byte 13 = 0b00001101 as an array of bits, most-significant first. Set bits (green) are b3 (8), b2 (4), and b0 (1); 8 + 4 + 1 = 13."
        },
        { type: "h3", text: "1.2 Operator precedence — the #1 syntax bug" },
        { type: "p", text: `In Python (and C, Java, ...) the bitwise operators have LOWER precedence than comparison operators. So a == b & c parses as a == (b & c) is wrong — actually it parses as a == (b & c)? No: & binds tighter than == in C but in Python the comparison binds looser, yet the classic trap is mixing & with +, ==, or <. Always parenthesize.` },
        { type: "code", code: `# WRONG: parses as x & (1 == 0)  -> x & False -> 0
if x & 1 == 0: ...

# RIGHT:
if (x & 1) == 0: ...   # test if x is even

# Precedence low-to-high (roughly): | , ^ , & , <<>> , + - , * /
# When in doubt, parenthesize every bitwise sub-expression.` }
      ]
    },
    {
      heading: "2. The core idiom table",
      blocks: [
        { type: "p", text: `These are the building blocks. "Bit i" is the bit worth 2^i; the mask 1 << i isolates it. Memorize all of these — almost every bit problem is a composition of two or three rows from this table.` },
        { type: "table",
          headers: ["Goal", "Idiom", "Why it works"],
          rows: [
            ["Test bit i (is it set?)", "(x >> i) & 1   or   x & (1 << i)", "shift the bit to position 0, mask out the rest"],
            ["Set bit i to 1", "x | (1 << i)", "OR with a single-1 mask forces that bit on"],
            ["Clear bit i to 0", "x & ~(1 << i)", "AND with a single-0 mask forces that bit off"],
            ["Toggle bit i", "x ^ (1 << i)", "XOR flips exactly that bit"],
            ["Lowest set bit (value)", "x & -x", "two's complement: -x flips+adds 1, leaving only LSB"],
            ["Drop lowest set bit", "x & (x - 1)", "x-1 flips the LSB run; AND clears the lowest 1"],
            ["Is power of two?", "x > 0 and (x & (x - 1)) == 0", "a power of two has exactly one set bit"],
            ["Count set bits (popcount)", "bin(x).count('1')  or  x.bit_count()", "Python 3.10+ has int.bit_count()"],
            ["Isolate lowest 0 -> 1", "x | (x + 1)", "x+1 turns the lowest 0 into 1 (with carry)"],
            ["Get all-ones mask of n bits", "(1 << n) - 1", "2^n - 1 is n consecutive 1s"]
          ]
        },
        { type: "callout", text: `x & -x and x & (x-1) are the two most important non-obvious idioms. The first gives you the lowest set bit (e.g. 12 = 0b1100 -> 4). The second removes it (12 -> 8). Looping "while x: x &= x-1; count++" counts set bits in O(number of set bits).` },
        { type: "h3", text: "2.1 Worked example: build a mask and apply it" },
        { type: "code", code: `x = 0b1011            # 11

# test bit 2 (value 4): is it set?
(x >> 2) & 1          # -> 0  (bit 2 is off)

# set bit 2:
x | (1 << 2)          # 0b1111 = 15

# clear bit 0:
x & ~(1 << 0)         # 0b1010 = 10

# toggle bit 1:
x ^ (1 << 1)          # 0b1001 = 9` }
      ]
    },
    {
      heading: "3. Python specifics: arbitrary precision & 32-bit masking",
      blocks: [
        { type: "p", text: `This section is the one most likely to save your interview. Python integers are not fixed-width. They have unlimited precision and use an infinite two's-complement model for negatives, so ~ and >> behave differently than in C/Java.` },
        { type: "h3", text: "3.1 What's different in Python" },
        { type: "ul", items: [
          `No overflow: 1 << 100 is a perfectly valid 101-bit integer. There is no wraparound.`,
          `~x == -x - 1 always (e.g. ~5 == -6). Python pretends negatives have infinitely many leading 1 bits.`,
          `x >> k for negative x is an arithmetic shift that floor-divides and keeps the sign forever, so negative numbers never become 0 by shifting right. while x: x >>= 1 loops FOREVER for x < 0.`,
          `bin(-5) returns '-0b101' (a sign-magnitude string), NOT a two's-complement representation. Do not parse it expecting 32-bit bits.`
        ]},
        { type: "h3", text: "3.2 Simulating 32-bit two's complement" },
        { type: "p", text: `Most LeetCode problems specify a 32-bit signed integer. To emulate that in Python: do your bit math, then mask to 32 bits with & 0xFFFFFFFF, and finally reinterpret the top bit as a sign if a signed result is required.` },
        { type: "code", code: `MASK = 0xFFFFFFFF          # 32 ones
INT_MAX = 0x7FFFFFFF       # 2**31 - 1

def to_signed_32(x):
    """Take a non-negative 'raw' 32-bit pattern and read it as signed."""
    x &= MASK              # keep only low 32 bits
    if x > INT_MAX:        # top (sign) bit set -> negative
        x -= (1 << 32)     # subtract 2**32 to get the negative value
    return x

# Example: the 32-bit pattern for -1 is 0xFFFFFFFF
to_signed_32(0xFFFFFFFF)   # -> -1
to_signed_32(0x80000000)   # -> -2147483648 (INT_MIN)` },
        { type: "callout", text: `Rule of thumb: when a problem mentions "32-bit integer" or could produce negatives (add-without-plus, reverse-bits, divide), keep everything masked with & 0xFFFFFFFF during the loop, and convert with to_signed_32 only at the very end.` },
        { type: "h3", text: "3.3 Iterating bits safely" },
        { type: "code", code: `# UNSAFE for negatives (infinite loop if x < 0):
while x:
    bit = x & 1
    x >>= 1

# SAFE: bound the loop to a fixed width and mask first.
for i in range(32):
    bit = (x >> i) & 1     # works for any x because i is bounded` }
      ]
    },
    {
      heading: "4. XOR: properties and the single-number family",
      blocks: [
        { type: "p", text: `XOR (^) is the workhorse of interview bit problems because it cancels equal pairs.` },
        { type: "diagram", kind: "grid",
          data: {
            cells: [
              [1, 1, 0, 0],
              [1, 0, 1, 0],
              [0, 1, 1, 0]
            ],
            highlight: [[2, 1], [2, 2]],
            colors: { "2,1": "#1a7f37", "2,2": "#1a7f37" }
          },
          caption: "XOR column-by-column: row 0 = A (0b1100 = 12), row 1 = B (0b1010 = 10), row 2 = A ^ B (0b0110 = 6). Each result bit is 1 exactly where the two operand bits differ; the set result bits are highlighted."
        },
        { type: "h3", text: "4.1 Algebraic properties" },
        { type: "ul", items: [
          `a ^ a = 0  (a value XORed with itself cancels to zero)`,
          `a ^ 0 = a  (zero is the identity)`,
          `commutative: a ^ b = b ^ a`,
          `associative: (a ^ b) ^ c = a ^ (b ^ c)  -> order doesn't matter`,
          `Consequence: XOR of a list cancels everything that appears an even number of times, leaving the XOR of the odd-count values.`
        ]},
        { type: "h3", text: "4.2 Single Number (every element twice except one)" },
        { type: "code", code: `def single_number(nums):
    x = 0
    for n in nums:
        x ^= n          # pairs cancel; the lone element survives
    return x
# [4,1,2,1,2] -> 4` },
        { type: "h3", text: "4.3 Single Number II (every element three times except one)" },
        { type: "p", text: `XOR-cancel-pairs no longer works because counts are 3. Two clean approaches: count each bit position mod 3, or run a two-state automaton with two accumulators (ones, twos).` },
        { type: "code", code: `# Approach A: sum each bit mod 3 (clear and general; works for "k times").
def single_number_ii(nums):
    result = 0
    for i in range(32):
        cnt = sum((n >> i) & 1 for n in nums) % 3
        if cnt:
            result |= (1 << i)
    # the lone value may be negative: reinterpret the 32-bit pattern
    if result >= (1 << 31):
        result -= (1 << 32)
    return result

# Approach B: bitwise state machine, O(1) extra space.
def single_number_ii_fast(nums):
    ones = twos = 0
    for n in nums:
        ones = (ones ^ n) & ~twos
        twos = (twos ^ n) & ~ones
    return ones` },
        { type: "callout", text: `Approach A's explicit 32-bit reinterpretation matters: if the unique number is negative, summing bit 31 mod 3 sets the sign bit, and Python would otherwise read it as a huge positive. Always convert back to signed 32-bit.` },
        { type: "h3", text: "4.4 Single Number III (exactly two unique, rest in pairs)" },
        { type: "p", text: `XOR everything to get a ^ b where a and b are the two uniques. Their XOR is nonzero, so it has at least one set bit. Use the lowest set bit (diff & -diff) to partition all numbers into two groups — a and b land in different groups, and pairs land together and cancel within each group.` },
        { type: "code", code: `def single_number_iii(nums):
    xor_all = 0
    for n in nums:
        xor_all ^= n            # == a ^ b
    diff = xor_all & -xor_all   # lowest bit where a and b differ
    a = 0
    for n in nums:
        if n & diff:            # split into the two partitions
            a ^= n
    b = xor_all ^ a
    return [a, b]` },
        { type: "h3", text: "4.5 Missing Number (0..n with one missing)" },
        { type: "code", code: `def missing_number(nums):
    x = len(nums)               # start with n (the largest index)
    for i, v in enumerate(nums):
        x ^= i ^ v              # XOR all indices and all values
    return x                    # every present value cancels its index` },
        { type: "h3", text: "4.6 Find the Duplicate (relation to XOR)" },
        { type: "p", text: `When numbers are in 1..n with exactly one duplicate AND every other value appears once, XOR-of-indices-and-values does NOT directly isolate the duplicate (the duplicate appears twice so it cancels). The canonical O(n) / O(1) solution is Floyd's cycle detection (treat nums as a linked list). XOR shines only in the "all-paired-except-one" variant; recognize which invariant you actually have.` },
        { type: "code", code: `# Floyd's tortoise & hare (NOT XOR) for the classic duplicate problem:
def find_duplicate(nums):
    slow = fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow` }
      ]
    },
    {
      heading: "5. Counting bits & DP",
      blocks: [
        { type: "h3", text: "5.1 Count set bits — Brian Kernighan's algorithm" },
        { type: "p", text: `x & (x - 1) drops the lowest set bit, so the loop runs once per set bit — O(popcount) instead of O(width).` },
        { type: "diagram", kind: "array",
          data: {
            values: [0, 0, 0, 0, 1, 1, 0, 0],
            highlight: [4, 5],
            labels: { "4": "b3", "5": "b2", "6": "b1", "7": "b0" }
          },
          caption: "BEFORE: x = 12 = 0b00001100. Two set bits: b3 (8) and b2 (4). The lowest set bit is b2 (value 4)."
        },
        { type: "diagram", kind: "array",
          data: {
            values: [0, 0, 0, 0, 1, 0, 0, 0],
            highlight: [4],
            labels: { "4": "b3", "5": "b2", "6": "b1", "7": "b0" }
          },
          caption: "AFTER: x & (x-1) = 12 & 11 = 8 = 0b00001000. The lowest set bit (b2) has been cleared; only b3 remains. One pass of Brian Kernighan's loop removed exactly one set bit."
        },
        { type: "code", code: `def count_bits(x):
    count = 0
    while x:
        x &= x - 1      # remove lowest set bit
        count += 1
    return count

# In modern Python just use:  x.bit_count()   # 3.10+
# or for older versions:      bin(x).count('1')` },
        { type: "diagram", kind: "array",
          data: {
            values: [1, 0, 1, 1, 0, 1, 0, 1],
            highlight: [0, 2, 3, 5, 7],
            labels: { "0": "b7", "1": "b6", "2": "b5", "3": "b4", "4": "b3", "5": "b2", "6": "b1", "7": "b0" }
          },
          caption: "Counting set bits: 181 = 0b10110101. Highlighting every 1 bit (b7, b5, b4, b2, b0) gives a popcount of 5. Kernighan's loop runs exactly 5 times — once per highlighted bit."
        },
        { type: "h3", text: "5.2 Counting Bits (DP for 0..n)" },
        { type: "p", text: `Build an array where ans[i] = number of set bits in i, in O(n). Two standard recurrences:` },
        { type: "ul", items: [
          `Right-shift: ans[i] = ans[i >> 1] + (i & 1). Dropping the low bit of i gives a smaller already-solved subproblem; add back the bit you removed.`,
          `Lowest-bit: ans[i] = ans[i & (i - 1)] + 1. i with its lowest set bit removed is smaller and already solved.`
        ]},
        { type: "code", code: `def counting_bits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)   # popcount(i) = popcount(i/2) + last bit
    return ans
# counting_bits(5) -> [0,1,1,2,1,2]` }
      ]
    },
    {
      heading: "6. Bitmasks: subsets and submasks",
      blocks: [
        { type: "p", text: `A bitmask represents a subset of an n-element set: bit i set means "element i is included". With n up to ~20, every subset is just an integer from 0 to 2^n - 1, which makes enumeration trivial and lets you store sets as dictionary/array keys.` },
        { type: "diagram", kind: "array",
          data: {
            values: [0, 1, 1, 0, 1],
            highlight: [1, 2, 4],
            labels: { "0": "e4", "1": "e3", "2": "e2", "3": "e1", "4": "e0" }
          },
          caption: "A bitmask over a 5-element set, drawn most-significant first as 0b01101 = 13. Set bits (green) mark which elements are in the subset: e0, e2, and e3 are included; e1 and e4 are not. The integer 13 IS the subset."
        },
        { type: "h3", text: "6.1 Generate all subsets via bitmask" },
        { type: "code", code: `def subsets(nums):
    n = len(nums)
    result = []
    for mask in range(1 << n):          # 0 .. 2^n - 1
        subset = [nums[i] for i in range(n) if mask & (1 << i)]
        result.append(subset)
    return result
# subsets([1,2,3]) -> all 8 subsets` },
        { type: "h3", text: "6.2 Iterate all submasks of a mask" },
        { type: "p", text: `Sometimes you need every sub-subset of a given mask (e.g. partition DP). The standard idiom enumerates submasks in O(number of submasks), and across all masks the total is O(3^n).` },
        { type: "code", code: `# Enumerate every submask 'sub' of 'mask', including mask and 0.
sub = mask
while sub > 0:
    process(sub)
    sub = (sub - 1) & mask      # the magic: jumps to the next lower submask
# (handle the empty submask 0 separately if you need it)` },
        { type: "callout", text: `Why (sub - 1) & mask works: subtracting 1 borrows through the low zero bits, and ANDing with mask snaps the result back to only the bits that belong to mask — landing exactly on the next-smaller submask with no gaps.` },
        { type: "h3", text: "6.3 Handy subset-iteration tricks" },
        { type: "ul", items: [
          `Number of set bits in a mask = bin(mask).count('1') = size of the subset.`,
          `mask | (1 << i) adds element i; mask & ~(1 << i) removes it; mask ^ (1 << i) toggles membership.`,
          `Full set of n elements = (1 << n) - 1.`,
          `Complement within n elements = mask ^ ((1 << n) - 1).`
        ]}
      ]
    },
    {
      heading: "7. Bitmask DP (TSP / assignment flavor)",
      blocks: [
        { type: "p", text: `When n <= ~20, you can use a bitmask as the DP state representing "which elements are done". Classic uses: Traveling Salesman (visited cities), assignment problems (which tasks assigned), and "minimum cost to cover all" problems. The state space is 2^n masks; transitions flip one bit on.` },
        { type: "h3", text: "7.1 Assignment problem skeleton" },
        { type: "p", text: `Assign n people to n jobs minimizing cost. State = mask of jobs already assigned; the number of set bits tells you which person we're assigning next.` },
        { type: "code", code: `import functools

def min_assignment_cost(cost):
    n = len(cost)
    FULL = (1 << n) - 1

    @functools.lru_cache(maxsize=None)
    def dp(mask):
        person = bin(mask).count('1')   # bits set = people already placed
        if person == n:
            return 0
        best = float('inf')
        for job in range(n):
            if not (mask & (1 << job)):           # job still free
                best = min(best,
                           cost[person][job] + dp(mask | (1 << job)))
        return best

    return dp(0)` },
        { type: "callout", text: `Bitmask DP complexity is roughly O(2^n * n) states-times-transitions, which is fine for n up to about 18-20 but explodes beyond that. If n is larger, bitmask DP is the wrong tool.` },
        { type: "h3", text: "7.2 TSP shape" },
        { type: "ul", items: [
          `State: dp[mask][i] = min cost path that has visited exactly the cities in mask and currently sits at city i.`,
          `Transition: from (mask, i) go to an unvisited j: dp[mask | (1<<j)][j] = min(..., dp[mask][i] + dist[i][j]).`,
          `Answer: min over i of dp[FULL][i] + dist[i][start].`,
          `Total work O(2^n * n^2).`
        ]}
      ]
    },
    {
      heading: "8. Arithmetic and bit-twiddling without operators",
      blocks: [
        { type: "h3", text: "8.1 Sum of two integers (no + or -)" },
        { type: "p", text: `Addition splits into a "sum without carry" (XOR) and a "carry" (AND shifted left). Repeat until there is no carry. In Python you MUST mask to 32 bits each iteration, otherwise negative carries propagate infinitely and the loop never terminates.` },
        { type: "code", code: `def get_sum(a, b):
    MASK = 0xFFFFFFFF
    INT_MAX = 0x7FFFFFFF
    while b & MASK:                  # while there is still a carry (within 32 bits)
        carry = (a & b) << 1         # bits where both are 1 carry left
        a = a ^ b                    # add without carrying
        b = carry
    a &= MASK
    return a if a <= INT_MAX else ~(a ^ MASK)   # reinterpret as signed 32-bit` },
        { type: "callout", text: `The "& MASK" on the loop condition and the final signed reinterpretation are both mandatory in Python. Without them this is an infinite loop on any input that produces a negative intermediate value.` },
        { type: "h3", text: "8.2 Reverse bits (of a 32-bit integer)" },
        { type: "code", code: `def reverse_bits(n):
    result = 0
    for _ in range(32):
        result = (result << 1) | (n & 1)   # shift result, append n's LSB
        n >>= 1
    return result
# Each iteration peels the low bit off n and pushes it onto result.` },
        { type: "h3", text: "8.3 Swap two values without a temp" },
        { type: "code", code: `# XOR swap (works because x ^ y ^ y = x):
a ^= b
b ^= a
a ^= b
# Pythonic real-world answer is just:  a, b = b, a
# Know the XOR trick for the "no temp variable" interview gotcha.` },
        { type: "h3", text: "8.4 Other quick tricks" },
        { type: "ul", items: [
          `Multiply by 2^k: x << k.  Divide (floor) by 2^k: x >> k (careful: arithmetic shift for negatives).`,
          `Check even/odd: x & 1 (0 even, 1 odd) — faster and clearer than x % 2.`,
          `Get the i-th byte: (x >> (8 * i)) & 0xFF.`,
          `Turn off all bits except the lowest set bit: x & -x. Turn the lowest 0 into 1: x | (x + 1).`
        ]}
      ]
    },
    {
      heading: "9. Common bugs",
      blocks: [
        { type: "table",
          headers: ["Symptom", "Cause", "Fix"],
          rows: [
            ["Infinite loop on while x: x >>= 1", "x is negative; Python's arithmetic right shift never reaches 0", "loop a fixed range(32) and mask, or & 0xFFFFFFFF first"],
            ["get_sum / divide hangs forever", "negative intermediate has infinitely many 1-bits in Python", "mask with & 0xFFFFFFFF each iteration; reinterpret sign at end"],
            ["Answer is a huge positive instead of negative", "forgot to convert the 32-bit pattern back to signed", "if x > 0x7FFFFFFF: x -= (1 << 32)"],
            ["if x & 1 == 0 behaves wrong", "operator precedence: == binds, parses as x & (1==0)", "parenthesize: (x & 1) == 0"],
            ["~x not what C would give", "Python ~x == -x-1 (infinite two's complement)", "mask: (~x) & 0xFFFFFFFF to get the 32-bit pattern"],
            ["bin(-5) gives '-0b101'", "Python uses sign-magnitude strings, not two's complement", "mask first: bin(x & 0xFFFFFFFF) for the bit pattern"],
            ["Power-of-two check says 0 is a power of two", "0 & (0-1) == 0 passes the trick falsely", "add x > 0 guard: x > 0 and (x & (x-1)) == 0"],
            ["Submask loop misses empty set", "while sub > 0 stops before reaching 0", "handle sub == 0 explicitly after the loop"]
          ]
        }
      ]
    },
    {
      heading: "10. Study plan",
      blocks: [
        { type: "p", text: `A focused 12-problem ramp. Do them roughly in order; each builds an idiom you'll reuse. Aim for the bit-level solution, not a hash-map shortcut, so the techniques stick.` },
        { type: "table",
          headers: ["#", "Problem", "Technique it cements"],
          rows: [
            ["1", "Single Number", "XOR cancels pairs"],
            ["2", "Number of 1 Bits", "Kernighan x & (x-1)"],
            ["3", "Counting Bits", "DP via i>>1 and i&1"],
            ["4", "Power of Two", "x & (x-1) == 0 with x>0 guard"],
            ["5", "Missing Number", "XOR of indices and values"],
            ["6", "Reverse Bits", "shift-and-append over 32 bits"],
            ["7", "Sum of Two Integers", "XOR/carry add + Python 32-bit masking"],
            ["8", "Single Number II", "bit-count mod 3 / ones-twos automaton"],
            ["9", "Single Number III", "lowest-set-bit partition (x & -x)"],
            ["10", "Bitwise AND of Numbers Range", "common prefix via shifting"],
            ["11", "Subsets", "enumerate masks 0..2^n-1"],
            ["12", "Maximum XOR of Two Numbers in an Array", "bit trie / greedy prefix (stretch)"]
          ]
        },
        { type: "callout", text: `If you only have time for five: Single Number, Number of 1 Bits, Counting Bits, Sum of Two Integers (for the Python masking lesson), and Subsets. Those five cover XOR, popcount, DP, arithmetic-without-operators, and bitmask enumeration.` }
      ]
    },
    {
      heading: "11. Cheat sheet (must-memorize idioms)",
      blocks: [
        { type: "p", text: `One-page reference. If you internalize this table you can derive almost every bit-manipulation solution on the spot.` },
        { type: "table",
          headers: ["Idiom", "Code", "Use"],
          rows: [
            ["Test bit i", "(x >> i) & 1", "is element i present?"],
            ["Set bit i", "x | (1 << i)", "add element i"],
            ["Clear bit i", "x & ~(1 << i)", "remove element i"],
            ["Toggle bit i", "x ^ (1 << i)", "flip membership"],
            ["Lowest set bit", "x & -x", "isolate rightmost 1"],
            ["Drop lowest set bit", "x & (x - 1)", "Kernighan popcount step"],
            ["Power of two", "x > 0 and x & (x-1) == 0", "single-bit check"],
            ["Popcount", "x.bit_count() / bin(x).count('1')", "count set bits"],
            ["All-ones n bits", "(1 << n) - 1", "full subset mask"],
            ["Next submask", "(sub - 1) & mask", "submask enumeration"],
            ["32-bit mask", "x & 0xFFFFFFFF", "simulate fixed width in Python"],
            ["Signed reinterpret", "x - (1<<32) if x > 0x7FFFFFFF else x", "read top bit as sign"]
          ]
        }
      ]
    }
  ],
  cheatsheet: [
    "An int is an array of bits indexed from the LSB (bit 0 = value 2^0). A 'mask' is a number with exactly the bits you care about.",
    "& clears/tests, | sets, ^ toggles & cancels equal values, ~ flips, << multiplies by 2^k, >> floor-divides by 2^k.",
    "Test/set/clear/toggle bit i: (x>>i)&1  |  x|(1<<i)  |  x&~(1<<i)  |  x^(1<<i).",
    "Lowest set bit: x & -x. Drop lowest set bit: x & (x-1). Power of two: x>0 and (x & (x-1))==0.",
    "Popcount: x.bit_count() (3.10+) or bin(x).count('1'); manual loop while x: x&=x-1; count+=1 runs once per set bit.",
    "XOR facts: a^a=0, a^0=a, commutative & associative. XOR of a list leaves the XOR of odd-count elements.",
    "Single Number: XOR all. Single Number III: xor_all, then partition by (xor_all & -xor_all). Missing Number: XOR indices with values.",
    "Counting Bits DP: ans[i] = ans[i>>1] + (i&1).",
    "Bitmask subsets: loop mask in range(1<<n); bit i set means include element i. Enumerate submasks: sub=(sub-1)&mask.",
    "Bitmask DP (TSP/assignment) is for n<=~20: ~O(2^n * n) work; explodes beyond that.",
    "Add without +: while b: carry=(a&b)<<1; a^=b; b=carry. In Python mask each step with & 0xFFFFFFFF or it never terminates.",
    "PYTHON CAVEAT: ints are infinite-precision two's complement. ~x == -x-1; while x: x>>=1 loops forever for x<0; bin(-5)=='-0b101'.",
    "Simulate 32-bit: keep results & 0xFFFFFFFF; reinterpret with x -= (1<<32) when x > 0x7FFFFFFF (sign bit set).",
    "Parenthesize bitwise ops: (x & 1) == 0, never x & 1 == 0 (precedence trap)."
  ]
}
