// Advanced combinatorics brainteasers for quant-interview prep.
// Every count below has been re-derived from scratch and checked on a small case.

export const BT_COMBINATORICS = [
  {
    id: "comb-monotone-lattice-paths",
    category: "Combinatorics",
    difficulty: "Easy",
    question:
      "On an integer grid you start at (0,0) and want to reach (m,n), moving only one unit Right (R) or one unit Up (U) at each step.\nHow many distinct monotone lattice paths are there? Evaluate for (m,n) = (3,2).",
    answer:
      "C(m+n, m) total paths; for (3,2) that is C(5,3) = 10.",
    solution:
      "Any path consists of exactly m Right-steps and n Up-steps, in some order, for a total of m+n steps. A path is uniquely determined by choosing WHICH of the m+n step-slots hold the R's (the rest are U's).\nHence the count is C(m+n, m) = C(m+n, n) = (m+n)! / (m! n!).\nThese are equal because choosing the R-positions is complementary to choosing the U-positions.\n\nSmall-case check (3,2): C(5,3) = 10. Enumerate the multiset arrangements of {R,R,R,U,U}: number of distinct strings = 5!/(3!2!) = 120/12 = 10. Matches.",
  },
  {
    id: "comb-catalan-dyck-paths",
    category: "Combinatorics",
    difficulty: "Hard",
    question:
      "A path uses n up-steps (+1) and n down-steps (-1), and must NEVER go below the starting height (every prefix sum >= 0). These are Dyck paths.\nHow many are there? Derive the count using the reflection argument, and evaluate for n = 3.",
    answer:
      "The n-th Catalan number C_n = C(2n,n)/(n+1). For n=3 that is 20/4 = 5.",
    solution:
      "Total unrestricted paths with n up and n down steps: C(2n, n) (choose which of 2n positions are up-steps).\nWe subtract the BAD paths that dip below 0, i.e. that touch height -1 at some point.\n\nReflection: take any bad path and locate the FIRST step where the running sum hits -1. Reflect every step BEFORE... — more cleanly, reflect every step AFTER that first touch across the line y = -1 (swap up<->down). The portion after the first touch originally ends at height (n - n) = 0; reflecting it across -1 sends the endpoint from 0 to -2, so the reflected path ends at height -2. A path ending at -2 has u up-steps and d down-steps with u - d = -2 and u + d = 2n, giving u = n-1, d = n+1.\nThis reflection is a bijection between bad paths (n up, n down, touching -1) and ALL paths with (n-1) up and (n+1) down steps. The latter count is C(2n, n-1).\n\nTherefore good paths = C(2n,n) - C(2n,n-1) = C(2n,n) [1 - n/(n+1)] = C(2n,n)/(n+1) = C_n.\n\nSmall-case check n=3: C(6,3) - C(6,2) = 20 - 15 = 5. Catalan C_3 = 20/4 = 5. The five Dyck paths (U=+, D=-): +++---, ++-+--, ++--+-, +-++--, +-+-+-. Exactly 5. Matches.",
  },
  {
    id: "comb-ballot-problem",
    category: "Combinatorics",
    difficulty: "Hard",
    question:
      "In an election candidate A gets a votes and candidate B gets b votes, with a > b. Ballots are counted in a uniformly random order.\nWhat is the probability that A is STRICTLY ahead of B throughout the entire count (after every single ballot)? Check it for a=3, b=1.",
    answer:
      "(a - b)/(a + b). For a=3, b=1 the probability is 2/4 = 1/2.",
    solution:
      "Encode the count as a sequence of a '+1' (vote for A) and b '-1' (vote for B). 'A strictly ahead throughout' means every prefix sum is > 0; equivalently the first ballot is for A and the running A-lead never drops to a tie.\n\nUse the cycle-lemma / reflection count. The number of arrangements of a (+1)'s and b (-1)'s whose every prefix sum is positive equals (a-b)/(a+b) times the total number of arrangements C(a+b, a). Sketch: among all C(a+b,a) sequences, count those that stay strictly positive. The first step must be +1. After fixing a +1 first, we need the remaining path (a-1 ups, b downs) to never return to 0, i.e. stay >= 1, equivalently a Dyck-type constraint; reflection gives the count C(a+b-1, a-1) - C(a+b-1, a) of valid completions. Dividing by C(a+b,a):\n[C(a+b-1,a-1) - C(a+b-1,a)] / C(a+b,a).\nC(a+b-1,a-1) = (a/(a+b))C(a+b,a) and C(a+b-1,a) = (b/(a+b))C(a+b,a). Subtracting: (a-b)/(a+b) · C(a+b,a). Dividing by the total gives probability (a-b)/(a+b).\n\nSmall-case check a=3, b=1: claimed 1/2. Enumerate all C(4,3)=4 orderings of {+,+,+,-} and require every prefix > 0:\n+ + + - : prefixes 1,2,3,2 all >0  GOOD\n+ + - + : 1,2,1,2 all >0  GOOD\n+ - + + : 1,0,... hits 0  BAD\n- + + + : starts -1  BAD\n2 good of 4 = 1/2. Matches.",
  },
  {
    id: "comb-derangements-count",
    category: "Combinatorics",
    difficulty: "Medium",
    question:
      "n distinct letters are placed into n addressed envelopes at random, one per envelope.\nIn how many ways does NO letter end up in its correct envelope (a derangement)? Give the closed form and evaluate for n = 4.",
    answer:
      "D_n = n! · sum_{k=0}^{n} (-1)^k / k!  (nearest integer to n!/e). D_4 = 9.",
    solution:
      "Let A_i be the set of permutations fixing position i (letter i in envelope i). We want permutations in none of the A_i. By inclusion-exclusion:\n|A_1^c ∩ ... ∩ A_n^c| = sum_{k=0}^{n} (-1)^k · (#ways to pick k positions to fix) · (#perms fixing those k).\nPicking k positions to be fixed: C(n,k); the remaining n-k elements permute freely: (n-k)!. So the term is (-1)^k C(n,k)(n-k)! = (-1)^k n!/k!.\nTherefore D_n = sum_{k=0}^{n} (-1)^k n!/k! = n!(1 - 1/1! + 1/2! - ... ± 1/n!).\n\nSmall-case check n=4: D_4 = 24(1 - 1 + 1/2 - 1/6 + 1/24) = 24(0 + 0.5 - 0.16667 + 0.041667) = 24(0.375) = 9.\nVerify by recurrence D_n = (n-1)(D_{n-1}+D_{n-2}): D_1=0, D_2=1, D_3=2(1+0)=2, D_4=3(2+1)=9. Matches.",
  },
  {
    id: "comb-derangement-probability",
    category: "Combinatorics",
    difficulty: "Medium",
    question:
      "n people each toss their hat into a pile; the hats are then redistributed uniformly at random, one per person.\nWhat is the probability that NOBODY gets their own hat back, and what value does it approach as n -> infinity?",
    answer:
      "P_n = sum_{k=0}^{n} (-1)^k / k!, which -> 1/e ≈ 0.3679.",
    solution:
      "There are n! equally likely redistributions. The favorable ones are derangements, counted by D_n = n! · sum_{k=0}^{n} (-1)^k/k! (inclusion-exclusion as in the derangement-count problem).\nProbability = D_n / n! = sum_{k=0}^{n} (-1)^k / k!.\n\nThis is exactly the partial sum of the Taylor series for e^x at x = -1, namely e^{-1} = sum_{k=0}^{∞} (-1)^k/k!. So as n -> ∞, P_n -> 1/e ≈ 0.367879.\nThe convergence is extremely fast: the error is bounded by the first omitted term 1/(n+1)!.\n\nSmall-case checks:\nn=1: P = 1 - 1 = 0 (the one person must get their own hat). Correct.\nn=2: P = 1 - 1 + 1/2 = 1/2; the only derangement of {1,2} is the swap, 1 of 2 perms. Correct.\nn=4: P = 0.375; D_4/4! = 9/24 = 0.375. Already within 2% of 1/e.",
  },
  {
    id: "comb-stars-and-bars-upper-bounds",
    category: "Combinatorics",
    difficulty: "Hard",
    question:
      "How many integer solutions are there to x1 + x2 + x3 = 15 with 0 <= xi <= 7 for each i?\nUse stars & bars plus inclusion-exclusion. Verify the method on a tiny analogue.",
    answer:
      "28.",
    solution:
      "Unconstrained nonnegative solutions to x1+x2+x3 = 15: stars & bars gives C(15 + 3 - 1, 3 - 1) = C(17,2) = 136.\nNow subtract solutions violating an upper bound. Let B_i be the bad set where xi >= 8. For a single i, substitute xi = 8 + yi with yi >= 0; then x1+x2+x3 = 15 becomes yi + (other two) = 7, with nonnegative solutions C(7 + 3 - 1, 3 - 1) = C(9,2) = 36. There are 3 such sets (one per variable).\nTwo violations at once (xi, xj >= 8) would force sum >= 16 > 15, impossible, so all pairwise and higher intersections are empty.\nInclusion-exclusion: valid = 136 - 3·36 + 0 = 136 - 108 = 28.\n\nIndependent confirmation by symmetry: the substitution xi -> 7 - xi is a bijection on the box 0 <= xi <= 7, and it sends sum = 15 to sum = 21 - 15 = 6. For sum = 6 the upper bounds 7 can never bind (no single variable can exceed 6), so the count is simply the unconstrained C(6 + 2, 2) = C(8,2) = 28. Two independent methods agree: 28.\n\nTiny analogue check: x1+x2 = 4 with 0 <= xi <= 2. Direct enumeration of pairs summing to 4 with each <= 2: only (2,2), so 1 solution. Formula: unconstrained C(4+1,1) = 5; subtract xi >= 3 (set xi = 3+y -> x1+x2 = 1 -> C(2,1) = 2 each, 2 variables -> 4); double-violation needs sum >= 6 > 4, none. 5 - 4 = 1. Matches.",
  },
  {
    id: "comb-surjections-inclusion-exclusion",
    category: "Combinatorics",
    difficulty: "Hard",
    question:
      "How many functions from a set of n labeled balls onto a set of k labeled boxes are SURJECTIVE (every box gets at least one ball)?\nDerive via inclusion-exclusion and evaluate for n = 4, k = 3.",
    answer:
      "S = sum_{j=0}^{k} (-1)^j C(k,j) (k-j)^n = k! · {n choose k}_Stirling. For n=4,k=3: 36.",
    solution:
      "Total functions from n balls to k boxes: k^n. Let A_i be the set of functions that MISS box i (no ball maps to box i). We want functions in none of the A_i.\nFor a chosen set of j boxes to all be missed, the functions map n balls into the remaining k-j boxes: (k-j)^n. The number of ways to choose those j boxes is C(k,j).\nInclusion-exclusion:\nSurjections = sum_{j=0}^{k} (-1)^j C(k,j) (k-j)^n.\nThis equals k! · S(n,k) where S(n,k) is the Stirling number of the second kind (partition n balls into k nonempty unlabeled groups, then label the k groups with boxes).\n\nSmall-case check n=4, k=3:\nj=0: (+1)(1)(3^4) = 81\nj=1: (-1)(3)(2^4) = -48\nj=2: (+1)(3)(1^4) = +3\nj=3: (-1)(1)(0^4) = 0\nSum = 81 - 48 + 3 = 36.\nCross-check with Stirling: S(4,3) = 6 (the number of ways to split 4 elements into 3 nonempty blocks = choose the one pair that shares a block: C(4,2) = 6). Then 3! · 6 = 36. Matches.",
  },
  {
    id: "comb-no-two-adjacent",
    category: "Combinatorics",
    difficulty: "Medium",
    question:
      "From a row of n seats in a line, how many ways are there to choose k seats so that NO two chosen seats are adjacent?\nDerive the formula and evaluate for n = 8, k = 3.",
    answer:
      "C(n - k + 1, k). For n=8, k=3: C(6,3) = 20.",
    solution:
      "Model: we choose k occupied seats and n-k empty seats so that between any two chosen seats there is at least one empty seat. Lay out the n-k empty seats in a row; this creates (n-k)+1 'gaps' (including the two ends) into which the chosen seats may be inserted, AT MOST ONE per gap (placing two chosen seats in the same gap would make them adjacent).\nChoosing k of these (n-k+1) gaps to receive a chosen seat: C(n-k+1, k).\n\nEquivalent bijection: if the chosen positions in increasing order are p_1 < ... < p_k with each gap >= 2, set q_i = p_i - (i-1). Then q_1 < ... < q_k are strictly increasing with q_i in {1,...,n-(k-1)} = {1,...,n-k+1} and only need to be distinct, so the count is C(n-k+1, k).\n\nSmall-case check n=8, k=3: C(6,3) = 20.\nVerify a smaller instance by hand: n=4, k=2 -> C(3,2) = 3. The non-adjacent pairs of {1,2,3,4}: {1,3},{1,4},{2,4}. Exactly 3. Matches.",
  },
  {
    id: "comb-vandermonde-identity",
    category: "Combinatorics",
    difficulty: "Medium",
    question:
      "Give a combinatorial (double-counting) proof of Vandermonde's identity:\nsum_{j=0}^{r} C(m, j) C(n, r - j) = C(m + n, r).\nThen verify it numerically for m = 2, n = 3, r = 2.",
    answer:
      "Both sides count r-subsets of an (m+n)-set. For m=2,n=3,r=2 both equal C(5,2) = 10.",
    solution:
      "Combinatorial proof: take a set of m+n objects partitioned into a group M of size m and a group N of size n. We count the r-element subsets of the whole set in two ways.\nRIGHT SIDE: directly choose any r of the m+n objects: C(m+n, r).\nLEFT SIDE: condition on how many of the r chosen objects come from M. If exactly j come from M (0 <= j <= r), there are C(m, j) ways to pick them, and the remaining r-j must come from N, in C(n, r-j) ways. Since j ranges over all admissible values and these cases are disjoint and exhaustive, summing gives sum_{j=0}^{r} C(m,j) C(n, r-j).\nThe two counts are of the same objects, so they are equal. (Terms with j>m or r-j>n are automatically zero by the convention C(a,b)=0 for b>a, so the sum may run 0..r safely.)\n\nNumerical check m=2, n=3, r=2:\nj=0: C(2,0)C(3,2) = 1·3 = 3\nj=1: C(2,1)C(3,1) = 2·3 = 6\nj=2: C(2,2)C(3,0) = 1·1 = 1\nSum = 3 + 6 + 1 = 10 = C(5,2). Matches.",
  },
  {
    id: "comb-necklaces-burnside",
    category: "Combinatorics",
    difficulty: "Hard",
    question:
      "How many distinct necklaces of n = 6 beads can be made using k = 2 colors, where two necklaces are the same if one is a ROTATION of the other (reflections NOT counted as identical)?\nUse Burnside's lemma.",
    answer:
      "(1/n) sum_{d | n} phi(d) k^{n/d} = 14 for n=6, k=2.",
    solution:
      "The symmetry group is the cyclic group C_n of n rotations. Burnside: number of distinct colorings = (1/|G|) sum_{g in G} Fix(g), where Fix(g) is the number of colorings unchanged by g.\nA rotation by t positions partitions the n bead-slots into cycles; the number of cycles is gcd(n,t), and a coloring is fixed iff it is constant on each cycle, giving k^{gcd(n,t)} fixed colorings.\nSo distinct necklaces = (1/n) sum_{t=0}^{n-1} k^{gcd(n,t)}. Grouping rotations by d = gcd(n,t): there are phi(n/d) rotations with a given gcd d... equivalently the standard form is (1/n) sum_{d|n} phi(d) k^{n/d}.\n\nCompute for n=6, k=2 directly via the gcd sum:\nt=0: gcd(6,0)=6 -> 2^6 = 64\nt=1: gcd=1 -> 2^1 = 2\nt=2: gcd=2 -> 2^2 = 4\nt=3: gcd=3 -> 2^3 = 8\nt=4: gcd=2 -> 2^2 = 4\nt=5: gcd=1 -> 2^1 = 2\nSum = 64+2+4+8+4+2 = 84. Divide by 6: 84/6 = 14.\n\nCross-check with the divisor form: divisors of 6 are 1,2,3,6.\nphi(1)·2^6 + phi(2)·2^3 + phi(3)·2^2 + phi(6)·2^1 = 1·64 + 1·8 + 2·4 + 2·2 = 64+8+8+4 = 84; /6 = 14. Matches.",
  },
  {
    id: "comb-making-change-partitions",
    category: "Combinatorics",
    difficulty: "Medium",
    question:
      "In how many ways can you make 25 cents using pennies (1), nickels (5), dimes (10), and quarters (25)? Order does not matter; you may use any number (including zero) of each coin.\nVerify by an organized count.",
    answer:
      "13.",
    solution:
      "This is the coefficient of x^25 in 1/((1-x)(1-x^5)(1-x^10)(1-x^25)), but we count directly by cases on the larger coins; once those are fixed, the remainder is filled by nickels and pennies in a determined number of ways.\n\nKey sub-count: the number of ways to make an amount A (a multiple-or-not of 5) using only nickels and pennies is floor(A/5) + 1, since the number of nickels can be 0,1,...,floor(A/5) and pennies fill the rest uniquely.\n\nCase on quarters:\n- 1 quarter (25 cents): remainder 0 -> 1 way (no dimes/nickels/pennies). Count = 1.\n- 0 quarters: now distribute 25 among dimes, nickels, pennies.\n  Sub-case on dimes d in {0,1,2}:\n  d=2 (20 cents): remainder 5 with nickels+pennies -> floor(5/5)+1 = 2 ways.\n  d=1 (10 cents): remainder 15 -> floor(15/5)+1 = 4 ways.\n  d=0: remainder 25 -> floor(25/5)+1 = 6 ways.\n  Subtotal (0 quarters) = 2 + 4 + 6 = 12.\nTotal = 1 (with a quarter) + 12 = 13.\n\nSmall-case sanity for the nickel+penny lemma: make 10 cents with nickels+pennies -> floor(10/5)+1 = 3: (2 nickels), (1 nickel + 5 pennies), (10 pennies). Correct.\nFinal answer: 13.",
  },
  {
    id: "comb-round-table-couples",
    category: "Combinatorics",
    difficulty: "Medium",
    question:
      "n couples (2n people) are seated around a round table. Seatings are considered the same up to rotation (a circular arrangement).\n(a) How many circular arrangements of the 2n people are there?\n(b) In how many of them does every couple sit together (each pair adjacent)? Evaluate both for n = 3.",
    answer:
      "(a) (2n - 1)!. (b) 2^n · (n - 1)!. For n=3: (a) 120, (b) 16.",
    solution:
      "(a) Circular arrangements of N distinct people, identifying rotations: fix one person's seat to kill the N rotational symmetries, then arrange the remaining N-1 in the remaining seats: (N-1)!. With N = 2n people this is (2n-1)!.\n\n(b) Treat each couple as a single 'block' so that the two partners are adjacent. There are n blocks to arrange around the round table: (n-1)! circular arrangements of the blocks. Within each block the two partners can be ordered in 2 ways, and there are n blocks, contributing a factor 2^n. Total = 2^n · (n-1)!.\n(Why this doesn't over/under-count rotations: collapsing couples to blocks preserves the single rotational identification, since fixing one block's position kills rotations exactly as fixing one person would.)\n\nSmall-case check n=3 (6 people, 3 couples):\n(a) (2·3 - 1)! = 5! = 120.\n(b) 2^3 · (3-1)! = 8 · 2 = 16.\n\nVerify the block logic on n=2 (2 couples, 4 people): formula gives 2^2 · 1! = 4. Enumerate: fix couple-block A in place; the other block B sits across, and each block has 2 internal orders -> 2 (for A) · 2 (for B) = 4 arrangements. Matches.",
  },
];
