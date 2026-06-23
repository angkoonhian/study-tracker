// Expected Value brainteasers for quant-interview prep.
// Every answer below was independently re-derived from first principles.

export const BT_EV = [
  {
    id: "ev-coupon-collector",
    category: "Expected Value",
    difficulty: "Medium",
    question:
      `A cereal company puts one of n distinct coupons in each box, each coupon equally likely and independent.\n` +
      `What is the expected number of boxes you must buy to collect all n distinct coupons?\n` +
      `Give the exact formula and the numeric value for n = 6 (a standard die).`,
    answer:
      `E[T] = n * H_n = n * (1 + 1/2 + ... + 1/n). For n = 6: 6 * 49/20 = 14.7 boxes.`,
    solution:
      `Technique: decompose the total time into the waiting times between successive "new" coupons and use the geometric-distribution mean.\n` +
      `Let T_i be the number of additional boxes needed to go from having i-1 distinct coupons to having i distinct coupons. Then T = T_1 + T_2 + ... + T_n.\n` +
      `When you already hold i-1 distinct coupons, each new box is "new" with probability p_i = (n - (i-1)) / n. The number of boxes until the next success is Geometric(p_i), so E[T_i] = 1/p_i = n / (n - i + 1).\n` +
      `By linearity of expectation (which holds even though the T_i are independent here, but independence is not needed):\n` +
      `E[T] = sum_{i=1}^{n} n/(n-i+1) = n * sum_{k=1}^{n} 1/k = n * H_n.\n` +
      `For n = 6: H_6 = 1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6 = 49/20 = 2.45. So E[T] = 6 * 2.45 = 14.7.`,
  },
  {
    id: "ev-coupon-collector-twist-pairs",
    category: "Expected Value",
    difficulty: "Hard",
    question:
      `Coupon-collector twist. There are n distinct coupons, each box equally likely.\n` +
      `Instead of collecting ALL n, you stop the moment you hold n-1 distinct coupons (i.e. you are missing exactly one).\n` +
      `What is the expected number of boxes? Compare it to the full-collection value and give the number for n = 6.`,
    answer:
      `E = n * (H_n - 1) = n*H_n - n. For n = 6: 6*49/20 - 6 = 14.7 - 6 = 8.7 boxes.`,
    solution:
      `Technique: same geometric decomposition as the classic coupon collector, but truncate the final waiting term.\n` +
      `Stopping at n-1 distinct coupons means we accumulate waiting times T_1 + T_2 + ... + T_{n-1} (we never wait for the very last, hardest coupon).\n` +
      `E[T_i] = n/(n-i+1) as before, so\n` +
      `E = sum_{i=1}^{n-1} n/(n-i+1) = n * sum_{k=2}^{n} 1/k = n*(H_n - 1).\n` +
      `The dropped term is T_n, the wait for the last coupon, whose expectation is n/1 = n. That single term is the largest contributor — which is exactly why dropping it saves so much: E_full - E = n. \n` +
      `For n = 6: E = 6*(49/20 - 1) = 6*(29/20) = 174/20 = 8.7. Indeed 14.7 - 6 = 8.7.`,
  },
  {
    id: "ev-toss-HH",
    category: "Expected Value",
    difficulty: "Medium",
    question:
      `Flip a fair coin repeatedly. What is the expected number of flips to first see the pattern HH (two heads in a row)?`,
    answer: `6 flips.`,
    solution:
      `Technique: first-step analysis with states tracking the current matching progress.\n` +
      `Define states by the longest suffix matching a prefix of HH:\n` +
      `S0 = no progress, S1 = last flip was H, S2 = done (HH seen).\n` +
      `Let a = E[flips to finish from S0], b = E[flips from S1].\n` +
      `From S0: flip once. With prob 1/2 -> H (go to S1), with prob 1/2 -> T (stay S0):\n` +
      `  a = 1 + (1/2)b + (1/2)a.\n` +
      `From S1: flip once. With prob 1/2 -> H (done), with prob 1/2 -> T (back to S0):\n` +
      `  b = 1 + (1/2)(0) + (1/2)a.\n` +
      `Solve: from the first equation, (1/2)a = 1 + (1/2)b => a = 2 + b. Substitute b = 1 + (1/2)a:\n` +
      `  a = 2 + 1 + (1/2)a => (1/2)a = 3 => a = 6.\n` +
      `So E[flips to HH] = 6. (Check via the pattern formula: for a pattern P, E = sum over self-overlaps of 2^(overlap length). HH overlaps itself at lengths 2 and 1, giving 2^2 + 2^1 = 4 + 2 = 6.)`,
  },
  {
    id: "ev-toss-HT",
    category: "Expected Value",
    difficulty: "Medium",
    question:
      `Flip a fair coin repeatedly. What is the expected number of flips to first see HT?\n` +
      `Why is this different from the expected wait for HH, even though each two-flip block is equally likely?`,
    answer: `4 flips — strictly fewer than the 6 needed for HH.`,
    solution:
      `Technique: first-step analysis, then the overlap explanation.\n` +
      `States: S0 = start/last flip not useful, S1 = last flip was H, done = HT seen.\n` +
      `Let a = E[flips from S0], b = E[flips from S1].\n` +
      `From S0: first H matters. a = 1 + (1/2)b + (1/2)a  (T keeps us in S0 since HT needs an H first).\n` +
      `From S1 (we hold an H): a T finishes; an H keeps us at S1 (still hold a fresh H).\n` +
      `  b = 1 + (1/2)(0) + (1/2)b.\n` +
      `Solve b: (1/2)b = 1 => b = 2. Then a = 1 + (1/2)(2) + (1/2)a => (1/2)a = 2 => a = 4.\n` +
      `So E[flips to HT] = 4.\n` +
      `Why HT < HH: it is about overlap, not about either two-block being equally likely (both have prob 1/4 per fixed pair). When you are waiting for HT and you have just seen an H, a "wrong" next flip is another H — which does NOT set you back; you still hold a live H and only need a T. But when waiting for HH and you have one H, a wrong flip (T) destroys all progress and you restart from scratch. HH can "overlap with itself" (the trailing H of a failed attempt is the start of the next), inflating the wait. The overlap formula E = sum 2^(self-overlap length) gives HT: only overlap of length 2 counts (no length-1 self-overlap since H != T), so 2^2 = 4; HH gets 2^2 + 2^1 = 6.`,
  },
  {
    id: "ev-abracadabra",
    category: "Expected Value",
    difficulty: "Hard",
    question:
      `A monkey types uniformly at random from a 26-letter alphabet, one letter per second.\n` +
      `What is the expected number of seconds until the string "ABRACADABRA" first appears?\n` +
      `Give the exact value and explain the martingale / overlap method.`,
    answer: `26^11 + 26^4 + 26 = 3,670,344,486,987,776 + 456,976 + 26 = 3,670,344,487,444,778 seconds.`,
    solution:
      `Technique: the "gambler / martingale" argument (optional stopping), equivalently the correlation/overlap method.\n` +
      `Set up a fair-casino martingale: at each second a fresh gambler arrives and bets $1 that the next letters spell ABRACADABRA. Each correct letter pays 26x and is reinvested on the next letter; a wrong letter loses the stake. Each gambler's game is fair, so the total casino bankroll is a martingale with mean 0 net.\n` +
      `Let T be the (stopping) time the word first completes. By optional stopping, E[total amount paid in] = E[total amount paid out].\n` +
      `Amount paid in by time T = T dollars (one new gambler per second). Amount paid out at time T: a gambler wins a payout of 26^k whenever the last k typed letters match the first k letters of the word (a self-overlap of length k that is still "alive" at T).\n` +
      `Find the self-overlaps of ABRACADABRA (lengths where a proper prefix equals the matching suffix):\n` +
      `  - length 11: the whole word matches itself -> pays 26^11.\n` +
      `  - length 4: prefix "ABRA" equals suffix "ABRA" -> pays 26^4.\n` +
      `  - length 1: prefix "A" equals suffix "A" -> pays 26^1.\n` +
      `No other overlaps work. So E[T] = 26^11 + 26^4 + 26^1.\n` +
      `Numerically 26^11 = 3,670,344,486,987,776; 26^4 = 456,976; 26^1 = 26. Sum = 3,670,344,487,444,778 seconds.`,
  },
  {
    id: "ev-records",
    category: "Expected Value",
    difficulty: "Medium",
    question:
      `n distinct numbers are arranged in a uniformly random order. A "record" is an element strictly larger than everything before it (the first element is always a record).\n` +
      `What is the expected number of records?`,
    answer: `H_n = 1 + 1/2 + 1/3 + ... + 1/n (approximately ln n + 0.577).`,
    solution:
      `Technique: indicator variables + linearity of expectation.\n` +
      `Let X_k = 1 if the element in position k is a record (larger than all of positions 1..k-1), else 0. Total records R = sum_{k=1}^{n} X_k.\n` +
      `Consider only the first k elements. Among these k values, by symmetry of a uniform random ordering each is equally likely to be the maximum of those k. Position k is a record exactly when the k-th element is the largest of the first k, which happens with probability 1/k.\n` +
      `Hence E[X_k] = 1/k. By linearity of expectation:\n` +
      `E[R] = sum_{k=1}^{n} 1/k = H_n.\n` +
      `For large n, H_n ~ ln n + gamma with gamma = 0.5772... . (Note: the same indicator probability 1/k also gives that the expected number of cycles in a random permutation equals H_n — see the cycles problem.)`,
  },
  {
    id: "ev-fixed-points",
    category: "Expected Value",
    difficulty: "Medium",
    question:
      `A uniformly random permutation of {1, 2, ..., n} is drawn. A "fixed point" is an i with pi(i) = i.\n` +
      `What is the expected number of fixed points? What is the expected number of fixed points squared, E[X^2]?`,
    answer: `E[X] = 1 for every n >= 1. E[X^2] = 2 for n >= 2 (so Var(X) = 1).`,
    solution:
      `Technique: indicator variables + linearity for the mean; pairwise products for the second moment.\n` +
      `Let I_i = 1 if pi(i) = i. Then X = sum_{i=1}^{n} I_i.\n` +
      `P(pi(i) = i) = (n-1)! / n! = 1/n, so E[I_i] = 1/n and\n` +
      `E[X] = sum_{i=1}^{n} 1/n = 1.  (Remarkably independent of n.)\n` +
      `Second moment: X^2 = sum_i I_i^2 + sum_{i != j} I_i I_j. Since I_i is 0/1, I_i^2 = I_i, so the first sum has expectation E[X] = 1.\n` +
      `For i != j, P(pi(i)=i and pi(j)=j) = (n-2)!/n! = 1/(n(n-1)). There are n(n-1) ordered pairs (i,j), so\n` +
      `E[sum_{i!=j} I_i I_j] = n(n-1) * 1/(n(n-1)) = 1.\n` +
      `Therefore E[X^2] = 1 + 1 = 2, and Var(X) = E[X^2] - (E[X])^2 = 2 - 1 = 1. (X is asymptotically Poisson(1), consistent with mean = variance = 1.)`,
  },
  {
    id: "ev-cycles",
    category: "Expected Value",
    difficulty: "Hard",
    question:
      `Draw a uniformly random permutation of n elements. What is the expected number of cycles in its cycle decomposition?\n` +
      `As a follow-up, what is the expected length of the cycle containing element 1?`,
    answer:
      `Expected number of cycles = H_n = 1 + 1/2 + ... + 1/n. Expected length of the cycle containing element 1 = (n+1)/2.`,
    solution:
      `Technique 1 (cycles via a sequential "close the cycle" construction + indicators).\n` +
      `Build the permutation by the standard chain: start at 1, follow 1 -> pi(1) -> pi(pi(1)) -> ... Build the functional graph by choosing images one unused element at a time. Index the choices j = 1..n by how many elements remain available. At the step where k elements remain to be assigned an image, a NEW cycle is closed exactly when we map the current element back to the open start; there are k available targets, one of which closes the cycle, so the probability a cycle closes at that step is 1/k.\n` +
      `Let C_k = 1 if a cycle closes when k elements remain. Number of cycles = sum_{k=1}^{n} C_k, E[C_k] = 1/k, so by linearity E[#cycles] = sum_{k=1}^{n} 1/k = H_n.\n` +
      `Technique 2 (cycle length of element 1, by symmetry).\n` +
      `Let L be the length of the cycle containing element 1. P(L >= m) = P(the first m-1 steps from 1 do not return to 1). Following the chain, the probability the m-th element along the chain is "1" (closing) only after surviving is uniform: in fact P(L = m) = 1/n for every m = 1,...,n. To see it, the cycle containing 1 is equally likely to have any length 1..n because, by symmetry of the random-mapping construction above, at each step the chance of closing among remaining targets makes all lengths equiprobable: P(L=m) = (n-1)/n * (n-2)/(n-1) * ... * (n-m+1)/(n-m+2) * 1/(n-m+1) = 1/n.\n` +
      `Hence E[L] = sum_{m=1}^{n} m * (1/n) = (1/n)*n(n+1)/2 = (n+1)/2.`,
  },
  {
    id: "ev-longest-run",
    category: "Expected Value",
    difficulty: "Hard",
    question:
      `Flip a fair coin n times. Let R be the length of the longest run (maximal streak) of consecutive identical outcomes.\n` +
      `Estimate E[R] and justify the scaling. As a concrete sub-question, for n = 4 flips compute E[R] exactly.`,
    answer:
      `E[R] grows like log_2(n) (about log_2 n - 2/3 for large n). For n = 4, E[R] = 19/8 = 2.375 exactly.`,
    solution:
      `Technique: indicator/threshold counting for the scaling, exact enumeration for n = 4.\n` +
      `Scaling argument: For a fixed length L, count the expected number of runs of length >= L using indicators. A run of length >= L starting at position i requires L-1 "matches" with the previous flip, an event of probability order 2^{-(L-1)}. Summing over the ~n starting positions, the expected number of length-L runs is order n * 2^{-L}. This count crosses 1 near L = log_2 n, and the longest run sits right where this expected count is order 1, giving E[R] ~ log_2 n. A finer extreme-value analysis gives E[R] ≈ log_2 n + gamma/ln2 - 3/2 ≈ log_2 n - 0.667.\n` +
      `Exact n = 4: enumerate all 2^4 = 16 equally likely sequences and record the longest run R.\n` +
      `  R = 4: HHHH, TTTT -> 2 sequences.\n` +
      `  R = 3: a maximal triple that cannot be extended: HHHT, THHH, TTTH, HTTT -> 4 sequences.\n` +
      `  R = 1: perfectly alternating: HTHT, THTH -> 2 sequences.\n` +
      `  R = 2: the remaining 16 - 2 - 4 - 2 = 8 sequences (HHTH, HHTT, HTHH, HTTH, THHT, THTT, TTHH, TTHT).\n` +
      `E[R] = (4*2 + 3*4 + 2*8 + 1*2)/16 = (8 + 12 + 16 + 2)/16 = 38/16 = 19/8 = 2.375.`,
  },
  {
    id: "ev-random-walk-boundary",
    category: "Expected Value",
    difficulty: "Hard",
    question:
      `A token starts at position k on the integers, 0 < k < N. Each step it moves +1 or -1 with probability 1/2 each (symmetric random walk).\n` +
      `It stops when it reaches 0 or N. What is the expected number of steps until it stops?`,
    answer: `E[steps] = k(N - k).`,
    solution:
      `Technique: first-step analysis to get a recurrence, then solve the boundary-value problem (a martingale/Gambler's-ruin argument).\n` +
      `Let T_k = expected steps to absorption starting from k. Boundary: T_0 = T_N = 0.\n` +
      `First-step: from k take one step, then average the two children:\n` +
      `  T_k = 1 + (1/2) T_{k-1} + (1/2) T_{k+1},  for 1 <= k <= N-1.\n` +
      `Rearrange: T_{k+1} - 2 T_k + T_{k-1} = -2. The second difference is constant (-2), so T_k is a downward parabola: T_k = -k^2 + bk + c.\n` +
      `Apply boundaries: T_0 = c = 0. T_N = -N^2 + bN = 0 => b = N.\n` +
      `Thus T_k = -k^2 + Nk = k(N - k).\n` +
      `Check: the second difference of -k^2 is -2 (correct), and T_0 = T_N = 0. Equivalently, M_t = (position_t)^2 - t is a martingale, and optional stopping on M gives E[T] = E[(final)^2] - k^2... applied with the ruin hitting probabilities yields the same k(N-k).\n` +
      `Example: start in the middle of [0, N], k = N/2 gives E = N^2/4.`,
  },
  {
    id: "ev-max-min-uniforms",
    category: "Expected Value",
    difficulty: "Medium",
    question:
      `Draw n i.i.d. Uniform(0,1) random variables. Let M = max and m = min.\n` +
      `Find E[M], E[m], and the expected gap E[M - m]. Also give E[range] interpretation.`,
    answer:
      `E[M] = n/(n+1), E[m] = 1/(n+1), E[M - m] = (n-1)/(n+1). The n points split (0,1) into n+1 gaps of expected size 1/(n+1) each.`,
    solution:
      `Technique: order-statistic CDF for the max/min; symmetry and the "spacings" identity for the range.\n` +
      `Max: P(M <= x) = x^n (all n below x). Density f_M(x) = n x^{n-1} on (0,1).\n` +
      `E[M] = integral_0^1 x * n x^{n-1} dx = n integral_0^1 x^n dx = n/(n+1).\n` +
      `Min: P(m > x) = (1-x)^n, so E[m] = integral_0^1 P(m > x) dx = integral_0^1 (1-x)^n dx = 1/(n+1).\n` +
      `(Alternatively m has the same distribution as 1 - max, giving E[m] = 1 - n/(n+1) = 1/(n+1).)\n` +
      `Range: E[M - m] = n/(n+1) - 1/(n+1) = (n-1)/(n+1).\n` +
      `Spacings view: n uniform points cut (0,1) into n+1 segments; by symmetry each segment (including the two end gaps below the min and above the max) has expected length 1/(n+1). E[m] is the expected first gap = 1/(n+1); E[1 - M] = 1/(n+1) likewise; and the range covers the middle n-1 gaps: (n-1)/(n+1). All consistent.`,
  },
  {
    id: "ev-die-stop-threshold",
    category: "Expected Value",
    difficulty: "Hard",
    question:
      `You roll a fair six-sided die up to 3 times. After each roll you may stop and be paid the value of that roll, or roll again (forfeiting the previous value). After the third roll you must take whatever it shows.\n` +
      `Playing optimally, what is your expected payoff, and what is the optimal stopping rule?`,
    answer:
      `Optimal rule: roll 1 - keep only a 5 or 6; roll 2 - keep a 4, 5, or 6; roll 3 - keep whatever. Expected payoff = 14/3 ≈ 4.667.`,
    solution:
      `Technique: backward induction / optimal stopping. Compute the continuation value with k rolls remaining, and stop on the current roll iff it is at least that continuation value.\n` +
      `Let E_k be the game's value when k rolls remain (under optimal play).\n` +
      `1 roll remaining: you must accept it. E_1 = (1+2+3+4+5+6)/6 = 21/6 = 3.5.\n` +
      `2 rolls remaining: after seeing the first of these two, the continuation value is E_1 = 3.5, so keep the current roll x iff x >= 3.5, i.e. keep 4, 5, 6 and reroll 1, 2, 3.\n` +
      `  E_2 = (1/6)(4) + (1/6)(5) + (1/6)(6) + (3/6)(E_1) = 15/6 + (1/2)(3.5) = 2.5 + 1.75 = 4.25 = 17/4.\n` +
      `3 rolls remaining: continuation value is E_2 = 4.25, so keep the current roll x iff x >= 4.25, i.e. keep 5, 6 and reroll 1, 2, 3, 4.\n` +
      `  E_3 = (1/6)(5) + (1/6)(6) + (4/6)(E_2) = 11/6 + (2/3)(17/4) = 11/6 + 17/6 = 28/6 = 14/3 ≈ 4.667.\n` +
      `So the threshold tightens as you have more rolls in reserve: with three rolls you demand a 5 or 6 first, relax to 4+ on the second, and accept anything on the last. The value of the 3-roll game is 14/3 ≈ 4.667. (Note: with UNLIMITED free rerolls the optimal play is to wait for a 6, giving payoff 6 with probability 1 — finiteness of rolls is what makes the threshold interesting.)`,
  },
  {
    id: "ev-keep-or-reroll-dice",
    category: "Expected Value",
    difficulty: "Medium",
    question:
      `You roll a fair die. You may keep that value, or reroll once and must take the second roll. (Exactly one optional reroll.)\n` +
      `What is your optimal strategy and the expected value of the game?`,
    answer: `Reroll if your first roll is 1, 2, or 3; keep 4, 5, or 6. Expected value = 17/4 = 4.25.`,
    solution:
      `Technique: backward induction (the value of rerolling is the EV of a single die).\n` +
      `If you reroll, you take a fresh die whose expected value is (1+2+3+4+5+6)/6 = 3.5. So you should keep your first roll x iff x >= 3.5, i.e. keep 4, 5, 6 and reroll 1, 2, 3.\n` +
      `Compute the game value:\n` +
      `  - With prob 1/2 the first roll is 4, 5, or 6 (you keep it): contributes (1/6)(4) + (1/6)(5) + (1/6)(6) = 15/6.\n` +
      `  - With prob 1/2 the first roll is 1, 2, or 3 (you reroll), getting expected 3.5: contributes (3/6)(3.5) = (1/2)(3.5) = 7/4.\n` +
      `E[game] = 15/6 + 7/4 = 5/2 + 7/4 = 10/4 + 7/4 = 17/4 = 4.25.`,
  },
  {
    id: "ev-comparisons-min-max",
    category: "Expected Value",
    difficulty: "Medium",
    question:
      `You read n distinct numbers one at a time, tracking the running maximum. Each time a new element exceeds the current max, you update (an "update operation").\n` +
      `Assuming a uniformly random input order, what is the expected number of updates? (The first element counts as an update.)\n` +
      `Follow-up: with n = 10, give the number.`,
    answer:
      `Expected updates = H_n = 1 + 1/2 + ... + 1/n. For n = 10: H_10 = 7381/2520 ≈ 2.929.`,
    solution:
      `Technique: indicator variables + linearity of expectation (this is the "records" problem in algorithmic disguise — e.g. expected reassignments of a max-tracking variable, or expected pivots in certain selection scans).\n` +
      `Let U_k = 1 if the k-th element read triggers an update, i.e. it is larger than all previous k-1 elements. Total updates U = sum_{k=1}^{n} U_k.\n` +
      `Among the first k elements (in random order), each is equally likely to be the largest, so the k-th is the running-max with probability exactly 1/k. Thus E[U_k] = 1/k.\n` +
      `By linearity: E[U] = sum_{k=1}^{n} 1/k = H_n. This is Theta(log n) — the reason "tracking the max" updates only logarithmically often on random data.\n` +
      `For n = 10: H_10 = 1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6 + 1/7 + 1/8 + 1/9 + 1/10 = 7381/2520 ≈ 2.9290.`,
  },
  {
    id: "ev-st-petersburg-capped",
    category: "Expected Value",
    difficulty: "Hard",
    question:
      `In the St. Petersburg game, a fair coin is flipped until the first head. If the first head is on flip k, you win 2^k dollars.\n` +
      `The uncapped expected payoff is infinite. Now suppose the casino caps the payout at 2^N (any winnings above 2^N are truncated to 2^N).\n` +
      `What is the expected payoff under the cap, and what is a fair price to play?`,
    answer:
      `E[payoff] = N + 1 dollars (a clean fair price). E.g. cap at 2^20 ≈ $1M gives a fair price of just $21.`,
    solution:
      `Technique: tail decomposition of the expectation, splitting at the cap level.\n` +
      `Without a cap: P(first head on flip k) = (1/2)^k, payoff 2^k, so each term contributes (1/2)^k * 2^k = 1, and E = sum_{k=1}^{infinity} 1 = infinity.\n` +
      `With the payout capped at 2^N: for k <= N you still receive 2^k; for k >= N+1 (the head comes on flip N+1 or later) the payout is capped at 2^N.\n` +
      `Split the expectation:\n` +
      `  E = sum_{k=1}^{N} (1/2)^k * 2^k  +  (capped tail).\n` +
      `First part: sum_{k=1}^{N} 1 = N.\n` +
      `Capped tail: the event "first head on flip N+1 or later" = "first N flips are all tails" has probability (1/2)^N, and on that event you are paid the cap 2^N. Contribution = (1/2)^N * 2^N = 1.\n` +
      `Therefore E = N + 1.\n` +
      `Interpretation: the fair price is only N + 1 dollars despite a huge maximum prize. A cap of 2^N = ~$1,000,000 corresponds to N = 20, so the fair price is just $21 — quantifying why nobody pays much to play: the expectation is grotesquely sensitive to the (finite, real-world) cap.`,
  },
];
