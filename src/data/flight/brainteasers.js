// Offline quant-interview brainteaser bank (Jane Street / HRT / Optiver caliber).
// Each entry: { id, category, difficulty, question, answer, solution }.
// Core categories below, plus expansion files in ./brainteasers/ that add depth
// across Probability, EV, Combinatorics, Logic, Markets, and the new
// "Game Theory & Trading", "Optimal Stopping", and "Estimation" categories.
import { BT_PROBABILITY } from "./brainteasers/probability.js";
import { BT_EV } from "./brainteasers/expectedValue.js";
import { BT_COMBINATORICS } from "./brainteasers/combinatorics.js";
import { BT_GAMES } from "./brainteasers/gameTheory.js";
import { BT_LOGIC } from "./brainteasers/logic.js";
import { BT_MARKETS } from "./brainteasers/marketsStats.js";
import { BT_STOPPING } from "./brainteasers/optimalStopping.js";
import { BT_ESTIMATION } from "./brainteasers/estimation.js";

const CORE = [
  // ============================ PROBABILITY (10) ============================
  {
    id: "ants-triangle",
    category: "Probability",
    difficulty: "Easy",
    question: `Three ants sit on the three corners of a triangle. At the same instant, each ant picks one of the two edges meeting at its corner uniformly at random and walks along it.\nWhat is the probability that no two ants collide?`,
    answer: `1/4`,
    solution: `Key insight: a collision is avoided only if all ants "circulate" in the same rotational direction.\n\nEach ant has 2 choices, so there are 2 x 2 x 2 = 8 equally likely outcomes.\n\nNo collision happens exactly when every ant walks in the same direction around the triangle: all clockwise, or all counterclockwise. If any pair walks "toward" each other on a shared edge, they collide.\n\nThere are exactly 2 collision-free outcomes (all CW, all CCW) out of 8.\n\nProbability = 2/8 = 1/4.\n\n(Same argument on a square or any n-gon gives 2/2^n.)`
  },
  {
    id: "ants-square",
    category: "Probability",
    difficulty: "Easy",
    question: `Four ants sit on the four corners of a square. Each independently picks one of its two adjacent edges uniformly at random and walks along it.\nWhat is the probability no two ants collide?`,
    answer: `1/8`,
    solution: `As with the triangle, ants avoid collision only if they all rotate the same way around the square.\n\nThere are 2^4 = 16 equally likely direction assignments.\n\nCollision-free outcomes: all 4 clockwise, or all 4 counterclockwise = 2 outcomes.\n\nProbability = 2/16 = 1/8.\n\nGeneral n-gon: 2/2^n = 2^(1-n).`
  },
  {
    id: "broken-stick-triangle",
    category: "Probability",
    difficulty: "Medium",
    question: `A stick of length 1 is broken at two points chosen independently and uniformly at random along its length.\nWhat is the probability the three resulting pieces can form a triangle?`,
    answer: `1/4`,
    solution: `Let the two break points be x and y, both uniform on [0,1], independent. The pieces can form a triangle iff no single piece exceeds 1/2 (the triangle inequality: each side must be less than the sum of the other two, i.e. less than 1/2 of the total).\n\nWork in the unit square (x,y). By symmetry consider x < y. The pieces are x, y - x, and 1 - y. We need all three < 1/2:\n  x < 1/2,  y - x < 1/2,  1 - y < 1/2 (i.e. y > 1/2).\n\nIn the region x < y, the favorable set is the triangle with vertices (0, 1/2), (1/2, 1/2), (1/2, 1), which has area 1/8. The region x < y has area 1/2, so the conditional probability is (1/8)/(1/2) = 1/4. By symmetry the x > y case gives the same.\n\nProbability = 1/4.`
  },
  {
    id: "two-coins-one-heads",
    category: "Probability",
    difficulty: "Easy",
    question: `I flip two fair coins and tell you (truthfully) that at least one came up heads.\nWhat is the probability that the other one is also heads (i.e. that both are heads)?`,
    answer: `1/3`,
    solution: `The unconditioned sample space for two fair coins is {HH, HT, TH, TT}, each with probability 1/4.\n\nThe information "at least one is heads" rules out TT, leaving {HH, HT, TH}, each equally likely (each had probability 1/4, now renormalized to 1/3).\n\nP(both heads | at least one heads) = P(HH) / P(at least one H) = (1/4) / (3/4) = 1/3.\n\nThe common wrong answer is 1/2; the trap is treating "the other coin" as a fresh independent flip. The conditioning event is asymmetric — it includes HT and TH but excludes only TT — so heads-heads is relatively less likely.`
  },
  {
    id: "expected-flips-hth-pattern",
    category: "Probability",
    difficulty: "Hard",
    question: `You flip a fair coin repeatedly until the sequence H-T-H first appears.\nWhat is the expected number of flips?`,
    answer: `10`,
    solution: `Use states for the longest current suffix that is a prefix of the target HTH. States: S (start / nothing useful), H, HT, HTH (done). Let E_X be expected additional flips from state X.\n\nTransitions (fair coin, p = 1/2 each):\n- From S: H -> state H; T -> state S. So E_S = 1 + (1/2)E_H + (1/2)E_S.\n- From H: H -> stay H (suffix is H); T -> state HT. So E_H = 1 + (1/2)E_H + (1/2)E_HT.\n- From HT: H -> done (HTH); T -> state S (suffix T is not a prefix). So E_HT = 1 + (1/2)(0) + (1/2)E_S.\n\nSolve. From the H equation: E_H = 1 + (1/2)E_H + (1/2)E_HT  =>  (1/2)E_H = 1 + (1/2)E_HT  =>  E_H = 2 + E_HT.\nFrom the S equation: (1/2)E_S = 1 + (1/2)E_H  =>  E_S = 2 + E_H = 2 + 2 + E_HT = 4 + E_HT.\nFrom the HT equation: E_HT = 1 + (1/2)E_S = 1 + (1/2)(4 + E_HT) = 1 + 2 + (1/2)E_HT  =>  (1/2)E_HT = 3  =>  E_HT = 6.\n\nThen E_H = 8, and E_S = 4 + 6 = 10.\n\nExpected number of flips to first see HTH = 10. (By contrast HTT takes 8 — overlapping patterns like HTH that can "reuse" a prefix take longer.)`
  },
  {
    id: "monty-hall",
    category: "Probability",
    difficulty: "Medium",
    question: `On a game show there are 3 doors; one hides a car, the other two hide goats. You pick a door. The host, who knows what's behind the doors, opens a different door revealing a goat, then offers you the chance to switch to the remaining unopened door.\nShould you switch, and what is your winning probability if you do?`,
    answer: `Switch; 2/3`,
    solution: `Your initial pick is correct with probability 1/3 and wrong with probability 2/3.\n\nCase 1 (prob 1/3): you initially picked the car. The host opens a goat; switching loses.\nCase 2 (prob 2/3): you initially picked a goat. The other goat and the car remain. The host is forced to open the other goat, so the remaining door is the car; switching wins.\n\nSwitching wins exactly when your first pick was wrong, which happens with probability 2/3.\n\nThe crucial point is that the host's choice is not random — he always reveals a goat, injecting information. Staying wins 1/3; switching wins 2/3.`
  },
  {
    id: "uniform-greater-than",
    category: "Probability",
    difficulty: "Easy",
    question: `X and Y are independent uniform random variables on [0, 1].\nWhat is the probability that X^2 < Y?`,
    answer: `2/3`,
    solution: `Picture the unit square [0,1] x [0,1], where (X,Y) is uniform, so probabilities equal areas.\n\nWe want the area of the region where Y > X^2, i.e. above the parabola y = x^2.\n\nArea above the curve = 1 - (area under the curve) = 1 - integral_0^1 x^2 dx = 1 - [x^3/3]_0^1 = 1 - 1/3 = 2/3.\n\nP(X^2 < Y) = 2/3.`
  },
  {
    id: "gamblers-ruin-fair",
    category: "Probability",
    difficulty: "Medium",
    question: `You start with $30 and repeatedly bet $1 on a fair coin (win $1 on heads, lose $1 on tails). You stop when you either reach $100 or go broke ($0).\nWhat is the probability you reach $100 before going broke?`,
    answer: `3/10`,
    solution: `This is the classic gambler's ruin with a fair game. Let p(k) be the probability of reaching N = 100 before 0, starting from k dollars.\n\nFor a fair game, p(k) satisfies p(k) = (1/2)p(k-1) + (1/2)p(k+1) with boundary conditions p(0) = 0 and p(N) = 1. The solution is linear: p(k) = k/N.\n\nIntuition / martingale argument: your wealth is a martingale (fair bet), so its expected value at the stopping time equals the starting value. If you end at 0 with probability 1 - p and at 100 with probability p, then 100p + 0(1-p) = 30, giving p = 30/100 = 3/10.\n\nProbability = 3/10.`
  },
  {
    id: "boy-girl-tuesday-basic",
    category: "Probability",
    difficulty: "Medium",
    question: `A family has two children. You are told (truthfully) that at least one of them is a boy.\nAssuming each child is independently a boy or girl with probability 1/2, what is the probability that both children are boys?`,
    answer: `1/3`,
    solution: `Equally likely outcomes for (older, younger): {BB, BG, GB, GG}, each probability 1/4.\n\n"At least one boy" removes GG, leaving {BB, BG, GB}.\n\nP(both boys | at least one boy) = P(BB) / P(at least one boy) = (1/4) / (3/4) = 1/3.\n\nThis is structurally identical to the two-coins problem. The subtle variant where you meet "a boy born on Tuesday" changes the answer (to 13/27) because the extra specifier shifts the conditioning, but with only the gender information the answer is 1/3.`
  },
  {
    id: "three-points-semicircle",
    category: "Probability",
    difficulty: "Hard",
    question: `Three points are chosen independently and uniformly at random on the circumference of a circle.\nWhat is the probability that all three lie within some common semicircle?`,
    answer: `3/4`,
    solution: `Fix the three points by their angular positions. For each point, consider the semicircle starting at that point and going clockwise. The event "all three points lie in a common semicircle" happens iff one of the points has the other two within the clockwise semicircle that begins at it.\n\nFor a fixed point i, the probability that both of the other two points fall in the clockwise half-circle starting at i is (1/2)^2 = 1/4. These three events (one for each point being the "leader") are mutually exclusive — at most one point can be the start of the arc that contains all three.\n\nSo P(all in some semicircle) = 3 x (1/4) = 3/4.\n\nGeneral result for n points: n / 2^(n-1). For n = 3 that is 3/4.`
  },

  // ============================ EXPECTED VALUE (8) ============================
  {
    id: "coupon-collector-die",
    category: "Expected Value",
    difficulty: "Medium",
    question: `You roll a fair six-sided die repeatedly.\nWhat is the expected number of rolls until you have seen all six faces at least once?`,
    answer: `14.7`,
    solution: `This is the coupon collector problem. After you have seen k distinct faces, the probability that the next roll shows a new face is (6 - k)/6. The number of rolls to get one new face is geometric with that success probability, so its expectation is 6/(6 - k).\n\nSum over k = 0,1,...,5:\nE = 6/6 + 6/5 + 6/4 + 6/3 + 6/2 + 6/1\n  = 6 (1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6)\n  = 6 x (49/20)\n  = 294/20 = 14.7.\n\nExpected number of rolls = 14.7.\n\n(In general, n x H_n where H_n is the n-th harmonic number.)`
  },
  {
    id: "expected-flips-hh",
    category: "Expected Value",
    difficulty: "Medium",
    question: `You flip a fair coin until you see two heads in a row (HH).\nWhat is the expected number of flips?`,
    answer: `6`,
    solution: `States by current progress toward HH: S0 (no current head), S1 (one head, "armed"), done.\n\nE0 = expected flips from S0, E1 = from S1.\nFrom S0: H -> S1, T -> S0. E0 = 1 + (1/2)E1 + (1/2)E0.\nFrom S1: H -> done, T -> S0. E1 = 1 + (1/2)(0) + (1/2)E0.\n\nFrom the S0 equation: (1/2)E0 = 1 + (1/2)E1 => E0 = 2 + E1.\nSubstitute E1 = 1 + (1/2)E0: E0 = 2 + 1 + (1/2)E0 => (1/2)E0 = 3 => E0 = 6.\n\nExpected flips to get HH = 6.`
  },
  {
    id: "expected-flips-ht",
    category: "Expected Value",
    difficulty: "Medium",
    question: `You flip a fair coin until you see heads immediately followed by tails (HT).\nWhat is the expected number of flips? Why does it differ from the HH case?`,
    answer: `4`,
    solution: `States: S0 (waiting for the first H), S1 (have an H, waiting for a T), done.\nFrom S0: H -> S1, T -> S0. E0 = 1 + (1/2)E1 + (1/2)E0.\nFrom S1: T -> done, H -> stay in S1 (still "armed" with a head). E1 = 1 + (1/2)(0) + (1/2)E1.\n\nFrom S1: (1/2)E1 = 1 => E1 = 2.\nFrom S0: (1/2)E0 = 1 + (1/2)E1 = 1 + 1 = 2 => E0 = 4.\n\nExpected flips to get HT = 4.\n\nWhy less than HH's 6? With HT, once you have a head you never "lose progress": any extra heads keep you armed, and a single tail finishes. With HH, a tail after a head throws you all the way back to start. Overlap structure makes HH slower despite both patterns being equally likely on any given pair of flips.`
  },
  {
    id: "secretary-problem",
    category: "Expected Value",
    difficulty: "Hard",
    question: `You interview n candidates one at a time in random order and must accept or reject each immediately, with no recall. You only observe relative ranks. You want to maximize the probability of hiring the single best candidate.\nFor large n, what fraction of candidates should you reject outright before being willing to accept, and what is the resulting probability of success?`,
    answer: `Reject ~1/e (~37%); succeed with prob ~1/e (~37%)`,
    solution: `Optimal policy ("37% rule"): reject the first r candidates no matter what, then accept the first subsequent candidate who is better than everyone seen so far.\n\nFor a cutoff r, the probability of selecting the best candidate is\nP(r) = sum over positions k = r+1..n of P(best is at position k) x P(best of first k-1 is in first r)\n     = sum_{k=r+1}^{n} (1/n)(r/(k-1)).\n\nFor large n, set x = r/n. The sum approximates -x ln(x). Maximize f(x) = -x ln x: f'(x) = -ln x - 1 = 0 => ln x = -1 => x = 1/e.\n\nAt x = 1/e, f(1/e) = -(1/e) ln(1/e) = 1/e.\n\nSo reject the first ~n/e (about 37%) candidates, then take the next record-best. The probability of hiring the very best converges to 1/e ~ 0.368.`
  },
  {
    id: "expected-max-uniforms",
    category: "Expected Value",
    difficulty: "Medium",
    question: `Let U_1, U_2, ..., U_n be independent uniform random variables on [0, 1].\nWhat is the expected value of their maximum?`,
    answer: `n/(n+1)`,
    solution: `Let M = max(U_1,...,U_n). Its CDF is P(M <= t) = P(all U_i <= t) = t^n for t in [0,1].\n\nThe density is f_M(t) = n t^(n-1).\n\nE[M] = integral_0^1 t x n t^(n-1) dt = n integral_0^1 t^n dt = n x [t^(n+1)/(n+1)]_0^1 = n/(n+1).\n\nAlternatively, by symmetry the n+1 gaps created by the n points on [0,1] all have equal expected length 1/(n+1); the max equals 1 minus the last gap, giving 1 - 1/(n+1) = n/(n+1).\n\nE[max] = n/(n+1).`
  },
  {
    id: "st-petersburg",
    category: "Expected Value",
    difficulty: "Hard",
    question: `A casino offers this game: a fair coin is flipped until the first tails appears. If the first tails is on flip number k, you win $2^k. \nWhat is the expected payout, and why is this a paradox?`,
    answer: `Infinite expected value`,
    solution: `The first tails appears on flip k with probability (1/2)^k (k-1 heads then a tails). The payout in that case is 2^k.\n\nExpected payout = sum over k = 1 to infinity of (1/2)^k x 2^k = sum of 1 = 1 + 1 + 1 + ... = infinity.\n\nSo the expected value is unbounded — in theory you should pay any finite amount to play.\n\nThe paradox: no rational person would pay even $100 to play, because the probability of a large payout is tiny (you need a long run of heads). This motivates expected *utility* theory: with a concave utility like log(wealth), the expected utility is finite, so a sensible person bets only a small amount. It is a foundational example of why EV alone is not a complete decision criterion, and connects directly to risk aversion and the Kelly criterion.`
  },
  {
    id: "expected-rolls-to-six",
    category: "Expected Value",
    difficulty: "Easy",
    question: `You roll a fair six-sided die until you get a 6.\nWhat is the expected number of rolls?`,
    answer: `6`,
    solution: `Each roll independently shows a 6 with probability p = 1/6. The number of rolls until the first success is geometric with parameter p, whose expectation is 1/p.\n\nE[rolls] = 1/(1/6) = 6.\n\nQuick self-check via recursion: E = 1 + (5/6)E (you always roll once; with prob 5/6 you fail and start over). Then E - (5/6)E = 1 => (1/6)E = 1 => E = 6.`
  },
  {
    id: "expected-dice-sum-stop",
    category: "Expected Value",
    difficulty: "Medium",
    question: `You roll a fair six-sided die once and observe the value V. You are then offered: keep V dollars, or re-roll and take the new value (you must keep the second roll). You want to maximize expected dollars.\nWhat is your optimal strategy and the expected value of the game?`,
    answer: `Re-roll if V <= 3; EV = $4.25`,
    solution: `The expected value of a single fair die roll is (1+2+3+4+5+6)/6 = 3.5.\n\nOptimal rule: re-roll whenever your current value V is less than 3.5, i.e. when V is 1, 2, or 3 (each below the 3.5 you would expect from a fresh roll). Keep V when it is 4, 5, or 6.\n\nCompute the EV. With probability 1/2, the first roll is 4, 5, or 6 and you keep it; the conditional average of {4,5,6} is 5. With probability 1/2, the first roll is 1, 2, or 3, you re-roll, and the re-roll averages 3.5.\n\nEV = (1/2)(5) + (1/2)(3.5) = 2.5 + 1.75 = 4.25.\n\nOptimal expected value = $4.25.`
  },

  // ============================ COMBINATORICS (6) ============================
  {
    id: "lattice-paths",
    category: "Combinatorics",
    difficulty: "Easy",
    question: `On a grid, how many distinct shortest paths are there from the bottom-left corner (0,0) to the top-right corner (m, n), moving only right or up one unit at a time?`,
    answer: `C(m+n, m)`,
    solution: `Any shortest (monotone) path consists of exactly m right-steps and n up-steps, for a total of m + n steps. A path is fully determined by choosing which of those m + n positions are the right-steps (the rest are up-steps).\n\nNumber of ways = C(m + n, m) = (m+n)! / (m! n!), which equals C(m+n, n).\n\nFor example, from (0,0) to (3,3): C(6,3) = 20 paths.`
  },
  {
    id: "derangements",
    category: "Combinatorics",
    difficulty: "Medium",
    question: `n people each check a hat. The hats are returned in a completely random order, one per person.\nWhat is the probability that NO person gets their own hat back? What value does this approach as n grows large?`,
    answer: `~1/e (~0.368)`,
    solution: `A permutation with no fixed point is a "derangement." The number of derangements of n items is\nD_n = n! sum_{k=0}^{n} (-1)^k / k!  (by inclusion-exclusion over the events "person i gets their own hat").\n\nThe probability of a derangement is D_n / n! = sum_{k=0}^{n} (-1)^k / k! = 1 - 1/1! + 1/2! - 1/3! + ...\n\nThis is exactly the truncated Taylor series for e^(-1). As n -> infinity, it converges to e^(-1) ~ 0.3679.\n\nRemarkably, the answer is already very close to 1/e even for small n (for n = 4 it is 3/8 = 0.375). Probability -> 1/e.`
  },
  {
    id: "stars-and-bars",
    category: "Combinatorics",
    difficulty: "Easy",
    question: `In how many ways can you distribute 10 identical balls into 4 distinct boxes (a box may be empty)?`,
    answer: `286`,
    solution: `This is a stars-and-bars problem: count nonnegative integer solutions to x1 + x2 + x3 + x4 = 10.\n\nRepresent the 10 balls as stars and use 3 bars to separate them into 4 groups. We arrange 10 stars and 3 bars in a row: total 13 symbols, choose which 3 are bars.\n\nNumber of ways = C(10 + 4 - 1, 4 - 1) = C(13, 3) = (13 x 12 x 11)/(3 x 2 x 1) = 1716/6 = 286.\n\nAnswer: 286.`
  },
  {
    id: "poker-flush",
    category: "Combinatorics",
    difficulty: "Medium",
    question: `From a standard 52-card deck, you are dealt 5 cards at random.\nWhat is the probability of being dealt a flush (all 5 cards of the same suit), including straight flushes?`,
    answer: `~0.00198 (about 1 in 505)`,
    solution: `Total 5-card hands: C(52, 5) = 2,598,960.\n\nCount flushes: choose the suit (4 ways), then choose 5 of that suit's 13 cards: C(13, 5) = 1287. So flushes = 4 x 1287 = 5148.\n\nProbability = 5148 / 2,598,960 = 0.0019808...\n\nThat is about 0.198%, or roughly 1 in 505.\n\n(If you exclude straight flushes (40 of them) to count "flush" as a distinct poker rank, you get 5108 hands, ~0.1965%. The question's phrasing includes them, giving 5148.)`
  },
  {
    id: "birthday-problem",
    category: "Combinatorics",
    difficulty: "Medium",
    question: `In a room of 23 people, what is the probability that at least two share a birthday (ignore leap years; assume 365 equally likely birthdays)?\nWhy is this surprisingly high?`,
    answer: `~50.7%`,
    solution: `Compute the complement: the probability that all 23 birthdays are distinct.\n\nP(all distinct) = (365/365)(364/365)(363/365) ... (343/365) = product_{k=0}^{22} (365 - k)/365.\n\nNumerically this product is about 0.4927.\n\nSo P(at least one shared birthday) = 1 - 0.4927 = 0.5073, about 50.7%.\n\nWhy so high? The relevant quantity is the number of *pairs*, not people: 23 people form C(23,2) = 253 pairs, each with a 1/365 chance of matching. Roughly 253/365 ~ 0.69 expected collisions, which makes a match likely. The count of pairs grows quadratically, so it overtakes 365 much faster than intuition suggests.`
  },
  {
    id: "handshake-round-table",
    category: "Combinatorics",
    difficulty: "Medium",
    question: `In how many distinct ways can 8 people be seated around a circular table, where two seatings are considered the same if one is a rotation of the other?`,
    answer: `5040`,
    solution: `For n people in a row there are n! arrangements. Around a circle, rotations are considered identical, and there are n rotations of any given circular arrangement.\n\nSo distinct circular arrangements = n!/n = (n-1)!.\n\nFor n = 8: (8 - 1)! = 7! = 5040.\n\nIf reflections (mirror images) were also considered identical, you would further divide by 2, giving 7!/2 = 2520 — but with rotations only, the answer is 5040.`
  },

  // ============================ LOGIC & PUZZLES (6) ============================
  {
    id: "100-prisoners-light",
    category: "Logic & Puzzles",
    difficulty: "Hard",
    question: `100 prisoners are taken one at a time (in an arbitrary, possibly repeating order, chosen adversarially) into a room with a single light switch. A prisoner may toggle the switch or leave it. At any point, any prisoner may declare "all 100 have now visited this room." If correct, all go free; if wrong, all are executed. The light starts OFF. They may strategize beforehand but cannot communicate afterward.\nWhat strategy guarantees freedom?`,
    answer: `Designate one counter who counts the switch toggled ON to 99`,
    solution: `Designate one prisoner as the "Counter." The protocol:\n\n- Every non-counter prisoner: the FIRST time they ever enter the room and find the light OFF, they turn it ON. On every other visit (or if the light is already ON when they arrive the first time), they do nothing. So each non-counter turns the light ON exactly once, ever.\n- The Counter: every time they enter and find the light ON, they turn it OFF and add 1 to their private count. If the light is OFF, they leave it.\n\nThe light being ON represents "one new non-counter has reported in." The counter is the only one who ever turns it OFF, and does so exactly once per ON event. So the counter's tally equals the number of distinct non-counters who have turned it on.\n\nThere are 99 non-counters. When the Counter's tally reaches 99, every non-counter has been in the room at least once, and the Counter has obviously been there too. The Counter then safely declares everyone has visited.\n\nThis works regardless of the adversarial visit order because the ON/OFF light acts as a single reliable one-bit accumulator, and the "turn on only once" rule prevents any prisoner from being double-counted.`
  },
  {
    id: "poison-wine-bottles",
    category: "Logic & Puzzles",
    difficulty: "Hard",
    question: `You have 1000 bottles of wine, exactly one of which is poisoned. The poison is lethal but only takes effect after exactly 24 hours, and even a single drop kills. You have a supply of test rats and 24 hours before a banquet.\nWhat is the minimum number of rats needed to guarantee identifying the poisoned bottle?`,
    answer: `10`,
    solution: `Encode each bottle's index in binary. With r rats you can represent 2^r distinct patterns, so you need 2^r >= 1000, i.e. r >= 10 (since 2^9 = 512 < 1000 <= 1024 = 2^10).\n\nProtocol: number the bottles 0 through 999 and write each number in 10-bit binary. Assign rat i (i = 0..9) to bit i. Rat i drinks from every bottle whose i-th binary bit is 1.\n\nAfter 24 hours, read which rats died. The set of dead rats spells out, bit by bit, the binary index of the poisoned bottle: bit i = 1 if rat i died, 0 if it lived. That binary number uniquely identifies the bottle (each bottle has a unique 10-bit code).\n\nMinimum rats = 10.`
  },
  {
    id: "weighing-balls",
    category: "Logic & Puzzles",
    difficulty: "Hard",
    question: `You have 12 visually identical balls. Exactly one is of a different weight (you do NOT know whether it is heavier or lighter). Using a two-pan balance, what is the minimum number of weighings guaranteed to identify the odd ball AND determine whether it is heavy or light?`,
    answer: `3`,
    solution: `Three weighings suffice (and are necessary: each weighing has 3 outcomes, giving 3^3 = 27 distinguishable results; you must distinguish 12 balls x 2 (heavy/light) = 24 cases, which fits in 27 but not in 3^2 = 9).\n\nA standard scheme: label balls 1-12.\n\nWeighing 1: {1,2,3,4} vs {5,6,7,8}.\n- If balanced, the odd ball is in {9,10,11,12}. Weighing 2: {9,10,11} vs {1,2,3} (known-good). If balanced, ball 12 is odd; weigh 12 vs a good ball to learn heavy/light. If {9,10,11} side tips, you know the direction; one more weighing among 9,10,11 (e.g. 9 vs 10) isolates the odd ball and its direction.\n- If unbalanced (say left heavy), the odd ball is among {1,2,3,4} (possibly heavy) or {5,6,7,8} (possibly lighter). Weighing 2 rotates suspects, e.g. {1,2,5} vs {3,4,6}, comparing the tilt direction across weighings to narrow the candidate set; weighing 3 then pins down the single ball and direction.\n\nThe key counting insight is the information bound: 3 weighings give 27 outcomes >= 24 needed, so 3 is the minimum.\n\nMinimum weighings = 3.`
  },
  {
    id: "burning-ropes",
    category: "Logic & Puzzles",
    difficulty: "Medium",
    question: `You have two ropes. Each takes exactly 60 minutes to burn completely, but they burn at non-uniform rates (so half a rope does NOT necessarily take 30 minutes). You have a lighter.\nHow do you measure exactly 45 minutes?`,
    answer: `45 min via lighting one rope at both ends + the other at one end`,
    solution: `Key idea: lighting a rope at BOTH ends makes it finish in half its remaining total time, regardless of the uneven burn rate, because the two flames together consume the whole rope's "60 minutes of material" at double speed.\n\nStep 1 (t = 0): Light Rope A at both ends, and simultaneously light Rope B at one end.\n\nStep 2: Rope A, burning from both ends, is fully consumed at t = 30 minutes. At that instant, Rope B has been burning from one end for 30 minutes, so it has exactly 30 minutes of burn-time left.\n\nStep 3 (t = 30): Immediately light the other (so far unlit) end of Rope B. Now Rope B burns from both ends, consuming its remaining 30 minutes of material in 15 minutes.\n\nStep 4: Rope B is fully burned at t = 30 + 15 = 45 minutes.\n\nThe moment Rope B finishes is exactly 45 minutes after you started.`
  },
  {
    id: "blue-eyed-islanders",
    category: "Logic & Puzzles",
    difficulty: "Hard",
    question: `On an island, 100 perfectly logical people have blue eyes (and there are others with brown eyes). No one knows their own eye color, there are no mirrors, and discussing eye color is forbidden. Anyone who deduces they have blue eyes must leave at midnight that night. One day a trusted outsider publicly announces, "At least one of you has blue eyes."\nWhat happens, and why does an announcement everyone already "knew" change anything?`,
    answer: `All 100 blue-eyed people leave on the 100th night`,
    solution: `Induction on the number of blue-eyed people, n.\n\nBase case n = 1: the single blue-eyed person sees zero other blue eyes. The announcement says at least one exists, so it must be them. They leave on night 1.\n\nInductive step: suppose with n - 1 blue-eyed people they all leave on night n - 1. Now with n blue-eyed people, each blue-eyed person sees n - 1 others with blue eyes. They reason: "If I had brown eyes, there would be only n - 1 blue-eyed people, and by the inductive hypothesis they would all leave on night n - 1." Each blue-eyed person waits and observes that no one leaves on night n - 1. That can only happen if there are actually n blue-eyed people (not n - 1), which means they themselves must be blue-eyed. So on night n, all n blue-eyed people leave simultaneously.\n\nWith n = 100, all blue-eyed people leave on the 100th night.\n\nWhy does the "obvious" announcement matter? Although everyone already knew "at least one person has blue eyes," that fact was not COMMON KNOWLEDGE — it was not known that everyone knew that everyone knew it, to unbounded depth. The public announcement creates common knowledge, which is exactly what the induction's nested counterfactual reasoning ("if I had brown eyes, then they would think that they would think...") requires. The announcement starts the synchronized clock.`
  },
  {
    id: "three-light-switches",
    category: "Logic & Puzzles",
    difficulty: "Easy",
    question: `There are three on/off switches outside a closed room, and exactly one of them controls a single incandescent light bulb inside the room. You can flip the switches as much as you like, but you may enter the room only ONCE to inspect the bulb.\nHow do you determine which switch controls the bulb?`,
    answer: `Use heat: leave one on long, then switch, then enter`,
    solution: `Exploit a second observable signal beyond on/off: the bulb's heat.\n\nStep 1: Turn switch A ON and leave it on for several minutes so the bulb (if A controls it) heats up.\nStep 2: Turn switch A OFF, then immediately turn switch B ON.\nStep 3: Leave switch C OFF the whole time, and now enter the room exactly once.\n\nInterpret the bulb:\n- Lit (on) -> switch B controls it (B is the one currently powered).\n- Off but warm to the touch -> switch A controls it (it was on long enough to heat up, then turned off).\n- Off and cold -> switch C controls it (it was never powered).\n\nEach of the three switches maps to a unique observable state (on, off-and-warm, off-and-cold), so one inspection identifies the controlling switch.`
  },

  // ============================ MARKETS & STATS (6) ============================
  {
    id: "kelly-criterion",
    category: "Markets & Stats",
    difficulty: "Hard",
    question: `You can repeatedly bet on a coin that lands heads with probability p = 0.6 (and tails 0.4). On heads you win even money (gain your stake); on tails you lose your stake. You reinvest your whole bankroll each round.\nWhat fraction of your bankroll should you bet each time to maximize long-run growth, and why not bet everything?`,
    answer: `20% (Kelly fraction f* = 0.2)`,
    solution: `The Kelly criterion maximizes the expected logarithm of wealth (equivalently the long-run geometric growth rate). For a bet at even odds (b = 1) with win probability p and loss probability q = 1 - p, the optimal fraction is\nf* = (bp - q)/b = p - q.\n\nDerivation: if you bet fraction f, after one round wealth multiplies by (1 + f) with prob p or (1 - f) with prob q. Maximize g(f) = p ln(1 + f) + q ln(1 - f). Setting g'(f) = p/(1+f) - q/(1-f) = 0 gives p(1 - f) = q(1 + f) => p - q = f(p + q) = f. So f* = p - q.\n\nHere f* = 0.6 - 0.4 = 0.2, so bet 20% of your bankroll each round.\n\nWhy not bet everything? Betting 100% means a single tails (which is certain to occur eventually) wipes you out — the geometric growth rate collapses to negative infinity because ln(0) = -infinity. Even though each bet has positive expected VALUE, maximizing expected value of a multiplicative, reinvested process leads to ruin. Kelly maximizes growth while keeping you solvent.`
  },
  {
    id: "sharpe-ratio",
    category: "Markets & Stats",
    difficulty: "Medium",
    question: `A strategy returns 12% per year on average with an annualized volatility (standard deviation) of 8%. The risk-free rate is 2%.\nWhat is its Sharpe ratio, and what does the number actually mean?`,
    answer: `1.25`,
    solution: `The Sharpe ratio is the excess return per unit of risk:\nSharpe = (mean return - risk-free rate) / (standard deviation of returns).\n\nSharpe = (0.12 - 0.02) / 0.08 = 0.10 / 0.08 = 1.25.\n\nMeaning: for every 1 unit of volatility (risk) taken on, the strategy earns 1.25 units of excess (above-risk-free) return. It is a risk-adjusted measure of efficiency, letting you compare strategies with different leverage or risk levels on equal footing.\n\nInterpretation guide: a Sharpe of ~1 is solid, ~2 is very good, and ~3+ is exceptional (and rare/suspicious for sustained periods). Higher is better. Because it scales returns by volatility, it answers "how much reward am I getting for the risk I bear?" rather than just "how much did I make?"`
  },
  {
    id: "vol-scales-sqrt-time",
    category: "Markets & Stats",
    difficulty: "Medium",
    question: `Daily returns of an asset are independent with a standard deviation of 1% per day. Assuming roughly 252 trading days per year, what is the approximate annualized volatility?\nWhy does volatility scale with the square root of time rather than linearly?`,
    answer: `~15.9% (= 1% x sqrt(252))`,
    solution: `For independent (uncorrelated) returns, VARIANCES add over time, not standard deviations. If one day's return variance is sigma^2, then T independent days have total variance T x sigma^2 (cross terms vanish because Cov = 0).\n\nVolatility (standard deviation) is the square root of variance, so the T-day volatility is sqrt(T x sigma^2) = sigma x sqrt(T).\n\nAnnualized vol = 1% x sqrt(252) = 1% x 15.87 ~ 15.9%.\n\nWhy sqrt(time)? Because variance is additive for independent increments while standard deviation is its square root. This is the same root-T law that governs a random walk: the expected drift grows linearly in time but the typical spread (uncertainty) grows like sqrt(time). It underlies Brownian motion and the dt-vs-sqrt(dt) scaling in the Black-Scholes framework.`
  },
  {
    id: "correlation-causation",
    category: "Markets & Stats",
    difficulty: "Easy",
    question: `Over the summer, ice cream sales and the number of drownings both rise, and they are strongly positively correlated. Does eating ice cream cause drowning? What is the statistical lesson and a markets analogue?`,
    answer: `No — confounding variable (heat); correlation is not causation`,
    solution: `The correlation is real but not causal. A hidden CONFOUNDING variable — hot weather — independently drives both: heat increases ice cream consumption AND increases swimming, which raises drownings. Neither variable causes the other; they share a common cause.\n\nStatistical lesson: correlation measures co-movement, not mechanism. To infer causation you need either a controlled experiment (randomization) or careful control for confounders, instrumental variables, or a credible identifying assumption.\n\nMarkets analogue: two stocks (or a stock and an indicator) may be highly correlated simply because both load on a common factor (the overall market, an interest-rate regime, a sector trend). A trader who assumes one "causes" or reliably predicts the other can be blindsided when the shared driver shifts, or when the spurious relationship breaks down out of sample. Backtests are full of such spurious correlations; this is why quants stress out-of-sample validation and economic rationale, not just historical fit.`
  },
  {
    id: "random-walk-martingale-stop",
    category: "Markets & Stats",
    difficulty: "Hard",
    question: `A stock price follows a symmetric random walk: each step it goes up $1 or down $1 with equal probability, starting at $100. A trader says: "I'll just wait until it's up $5 from where I bought, then sell — guaranteed profit, since a fair random walk always eventually drifts up by 5." Where is the flaw, and what does the optional stopping theorem say about expected profit?`,
    answer: `Expected profit is 0; the strategy risks unbounded loss / unbounded time`,
    solution: `A symmetric random walk is a MARTINGALE: at every point its expected future value equals its current value. The optional stopping theorem says that for a martingale and a stopping time tau satisfying suitable conditions (e.g. bounded, or bounded increments with finite expected stopping time), E[X_tau] = X_0. You cannot manufacture positive expected profit from a fair game by any stopping rule meeting those conditions.\n\nThe trader's claim is partly true and partly a trap. It IS true that a 1-D symmetric random walk is recurrent — it will, with probability 1, eventually reach +5 (and indeed any level). So "sell at +5" eventually triggers and books a $5 gain.\n\nThe flaw: there is no cap on how far DOWN it goes first, and no bound on how LONG it takes. Before hitting +5 it can wander to -50, -500, etc. If you have finite capital (a stop-out, a margin call, or just finite patience/time horizon), you will sometimes be wiped out before the +5 ever arrives. The unconditional expected profit, accounting for those ruinous paths and finite resources, is exactly 0 — consistent with optional stopping. The "guaranteed $5" requires infinite bankroll and infinite time, which no real trader has. This is essentially the martingale (double-or-nothing) betting fallacy in disguise.`
  },
  {
    id: "market-maker-spread",
    category: "Markets & Stats",
    difficulty: "Medium",
    question: `You are a market maker quoting a stock whose true fair value you believe is $50.00. You post a bid of $49.95 and an ask of $50.05, and you are equally likely to get hit on the bid (you buy) or lifted on the ask (you sell) by uninformed flow.\nWhat is your expected profit per round-trip trade, and what is the main risk this simple model ignores?`,
    answer: `$0.10 per round trip (capture the full spread)`,
    solution: `When you buy at your bid of $49.95, the asset is worth $50.00 to you, so you earn $0.05 of edge. When you sell at your ask of $50.05, you earn another $0.05 of edge versus the $50.00 fair value. A full round trip (one buy and one sell) captures the entire spread:\n\nProfit per round trip = ask - bid = $50.05 - $49.95 = $0.10.\n\nEquivalently, each trade earns half the spread ($0.05) relative to mid, and a buy plus a sell sums to the full $0.10 spread.\n\nThe main risk the model ignores is ADVERSE SELECTION (informed flow / inventory risk). If some counterparties know the true value is moving — say it is actually heading to $51 — they will preferentially lift your $50.05 ask, leaving you short an asset that keeps rising. Real market makers lose to informed traders and must manage inventory; they widen spreads, skew quotes, and hedge to compensate. The clean "capture the spread" profit only holds against genuinely uninformed, symmetric flow.`
  }
];

// Core bank plus the JS/HRT-caliber expansion files, concatenated into one deck.
export const BRAINTEASERS = [
  ...CORE,
  ...BT_PROBABILITY, ...BT_EV, ...BT_COMBINATORICS, ...BT_GAMES,
  ...BT_LOGIC, ...BT_MARKETS, ...BT_STOPPING, ...BT_ESTIMATION,
];
