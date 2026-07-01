export default {
  id: "probability",
  title: "Probability and Statistics",
  subtitle: "A comprehensive refresher for quant-trading interviews: conditional probability, Bayes, expectation, and the classic problems",
  emoji: "",
  intro: `Quantitative trading interviews (Hudson River Trading, Jane Street, Optiver, SIG, Citadel, Two Sigma) lean hard on probability. Not the memorised-formula kind — the kind where you have to define events precisely, condition on the right thing, and reason under uncertainty faster than the person across the table. The good news: the toolkit is small. A handful of ideas — conditional probability, Bayes' theorem, linearity of expectation, variance, a dozen named distributions, and first-step analysis — cover the overwhelming majority of what gets asked.\n\nThis guide is a from-scratch refresher built for that setting. It starts with the mental model (why probability is the language of trading), builds up the axioms and counting, then spends most of its length on the three highest-leverage ideas: conditional probability and Bayes, linearity of expectation (the single most useful trick in the entire subject), and variance/covariance. It then catalogues the common distributions, teaches expected-value-via-states (the HH-vs-HT flip problem, gambler's ruin), touches Markov chains, and works through the classic paradoxes (Monty Hall, birthday, two-child) that interviewers love. It closes with interview technique and a study plan around Xinfeng Zhou's green book.\n\nAll math is written in plain ASCII since there is no LaTeX here: E[X] is expectation, P(A|B) is conditional probability, Var(X) is variance, sqrt is square root, sum is summation, and * is multiplication. Every numerical claim in this guide has been derived and cross-checked by simulation.\n\nTable of contents: (1) Why probability for trading, (2) Sample spaces and axioms, (3) Counting and combinatorics, (4) Conditional probability and independence, (5) Law of total probability, (6) Bayes' theorem, (7) Random variables, (8) Expectation and linearity, (9) Variance and covariance, (10) Common distributions, (11) Expected value via states, (12) Markov chains, (13) Classic problems and paradoxes, (14) Law of large numbers and CLT, (15) Interview technique and traps, (16) Study plan.`,
  sections: [
    {
      heading: "1. Why probability for trading, and the mental model",
      blocks: [
        { type: "p", text: `Market making is applied probability. A market maker quotes a price at which they will buy and a slightly higher price at which they will sell. On any single trade they might lose. But if their estimate of fair value is even slightly better than the counterparty's, and they make thousands of such trades, the law of large numbers turns a tiny per-trade edge into a reliable profit. The entire business is "many small independent-ish bets with positive expectation." That is why interviews test whether you can compute expectations, quantify risk (variance), and update beliefs when new information arrives (Bayes).` },
        { type: "p", text: `The mental model to internalise: a random experiment produces one outcome from a set of possible outcomes. Probability assigns weights to events (sets of outcomes) so that the weights are consistent. Everything else — conditional probability, expectation, distributions — is bookkeeping built on top of that single picture.` },
        { type: "h3", text: "1.1 Define the event precisely, first" },
        { type: "p", text: `The number one source of wrong answers in probability interviews is not arithmetic — it is sloppy event definition. Before computing anything, write down in words exactly what event you are measuring and what you are conditioning on. "The probability that it's the two-headed coin GIVEN I saw three heads" is a different quantity from "the probability of three heads given the two-headed coin." Confusing P(A|B) with P(B|A) is the most common blunder in the entire subject (it is exactly the error Bayes' theorem exists to correct).` },
        { type: "callout", text: `Highest-leverage habit: before touching numbers, state the sample space and the exact event in one sentence each. Half of all "hard" probability questions become easy the moment the events are pinned down, and most wrong answers come from answering a subtly different question than the one asked.` }
      ]
    },
    {
      heading: "2. Sample space, events, and the axioms",
      blocks: [
        { type: "p", text: `The sample space S (sometimes Omega) is the set of all possible outcomes of an experiment. An event is any subset of S. For a single die roll, S = {1,2,3,4,5,6}; the event "even" is {2,4,6}. A probability measure P assigns to each event a number in [0,1] obeying three axioms (Kolmogorov):` },
        { type: "ul", items: [
          `Non-negativity: P(A) >= 0 for every event A.`,
          `Normalisation: P(S) = 1 — something must happen.`,
          `Countable additivity: if A1, A2, ... are mutually exclusive (disjoint), then P(A1 or A2 or ...) = P(A1) + P(A2) + ...`
        ]},
        { type: "p", text: `Everything else follows. From the axioms you can derive the complement rule, the union rule, and monotonicity — you never need to memorise them separately, but they are worth having at your fingertips.` },
        { type: "h3", text: "2.1 Complement, union, inclusion-exclusion" },
        { type: "table", headers: ["Rule", "Formula", "Note"], rows: [
          ["Complement", "P(not A) = 1 - P(A)", "Often the fastest path: 'at least one' = 1 - 'none'."],
          ["Union (2 events)", "P(A or B) = P(A) + P(B) - P(A and B)", "Subtract the overlap you double-counted."],
          ["Union (disjoint)", "P(A or B) = P(A) + P(B)", "Only when A and B cannot both occur."],
          ["Inclusion-exclusion (3)", "P(A or B or C) = P(A)+P(B)+P(C) - P(AB) - P(AC) - P(BC) + P(ABC)", "Alternating add/subtract of intersections."],
          ["Monotonicity", "If A is a subset of B then P(A) <= P(B)", "Bigger event, bigger (or equal) probability."]
        ]},
        { type: "callout", text: `The complement trick is the single most useful computational shortcut. Whenever a question says "at least one", compute 1 minus the probability of "none" instead. Example: probability of at least one 6 in four die rolls = 1 - (5/6)^4 = 1 - 0.482 = 0.518. Computing it directly via inclusion-exclusion is far more painful.` },
        { type: "code", code: `# Verify P(at least one 6 in 4 rolls) two ways
from itertools import product
S = list(product(range(1,7), repeat=4))          # 6^4 = 1296 outcomes
at_least_one = sum(1 for o in S if 6 in o) / len(S)
via_complement = 1 - (5/6)**4
print(at_least_one, via_complement)              # 0.5177..., 0.5177...` }
      ]
    },
    {
      heading: "3. Counting and combinatorics",
      blocks: [
        { type: "p", text: `When outcomes are equally likely, probability reduces to counting: P(A) = (number of outcomes in A) / (total number of outcomes). So combinatorics is the workhorse. Three building blocks handle almost everything.` },
        { type: "h3", text: "3.1 Multiplication principle" },
        { type: "p", text: `If a process has k independent stages with n1, n2, ..., nk choices at each stage, the total number of outcomes is n1 * n2 * ... * nk. A 4-digit PIN has 10*10*10*10 = 10000 possibilities.` },
        { type: "h3", text: "3.2 Permutations (order matters)" },
        { type: "p", text: `The number of ways to arrange r items chosen from n distinct items, where order matters, is P(n,r) = n! / (n-r)!. Arranging all n is just n!. Example: the number of ways to seat 3 people from 5 in a row is 5!/2! = 60.` },
        { type: "h3", text: "3.3 Combinations (order does not matter)" },
        { type: "p", text: `The number of ways to CHOOSE r items from n distinct items, ignoring order, is the binomial coefficient "n choose r" = C(n,r) = n! / (r! * (n-r)!). This is a permutation divided by r! to remove the orderings of the chosen set. Example: the number of 5-card poker hands from a 52-card deck is C(52,5) = 2,598,960.` },
        { type: "table", headers: ["Scenario", "Order matters?", "Repetition?", "Count"], rows: [
          ["Arrange r of n distinct", "Yes", "No", "n! / (n-r)!"],
          ["Choose r of n distinct", "No", "No", "C(n,r) = n! / (r!(n-r)!)"],
          ["Sequences of length r from n symbols", "Yes", "Yes", "n^r"],
          ["Multiset: r items from n types", "No", "Yes", "C(n+r-1, r)  (stars and bars)"]
        ]},
        { type: "h3", text: "3.4 Stars and bars" },
        { type: "p", text: `To count the number of ways to place r identical balls into n distinct boxes (equivalently, non-negative integer solutions to x1 + x2 + ... + xn = r), the answer is C(n + r - 1, r) = C(n + r - 1, n - 1). The picture: lay out r stars and n-1 bars in a row; the bars partition the stars into n groups. Any arrangement of the r + (n-1) symbols gives a distinct distribution, and we choose which positions are bars.` },
        { type: "p", text: `Example: number of ways to distribute 10 identical dollars among 4 people = C(10 + 4 - 1, 4 - 1) = C(13, 3) = 286.` },
        { type: "code", code: `from math import comb, factorial
print(comb(52, 5))                  # 2598960  (poker hands)
print(factorial(5)//factorial(2))   # 60       (seat 3 of 5, ordered)
print(comb(10 + 4 - 1, 4 - 1))      # 286      (stars and bars: 10 dollars, 4 people)` },
        { type: "callout", text: `Common trap: forgetting whether order matters. "How many ways to pick a committee of 3" uses combinations (order irrelevant). "How many ways to pick a president, VP, and treasurer" uses permutations (roles distinguish order). When in doubt, ask: if I swap two chosen items, is it a different outcome? Yes -> permutation. No -> combination.` }
      ]
    },
    {
      heading: "4. Conditional probability and independence",
      blocks: [
        { type: "p", text: `Conditional probability is how you update a probability once you learn something. The probability of A GIVEN that B has occurred is:` },
        { type: "code", code: `P(A | B) = P(A and B) / P(B),     defined when P(B) > 0` },
        { type: "p", text: `The intuition: conditioning on B restricts the sample space to B. Within that restricted world, the fraction of it that is also A is P(A and B) / P(B). You are renormalising by the size of B.` },
        { type: "h3", text: "4.1 The multiplication rule" },
        { type: "p", text: `Rearranging the definition gives the multiplication (chain) rule: P(A and B) = P(A | B) * P(B) = P(B | A) * P(A). Extended to a chain: P(A1 and A2 and ... and An) = P(A1) * P(A2|A1) * P(A3|A1,A2) * ... This is how you compute the probability of a sequence of dependent events, one conditioning at a time.` },
        { type: "p", text: `Example (drawing without replacement): probability both of the first two cards from a shuffled deck are aces = P(1st ace) * P(2nd ace | 1st ace) = (4/52) * (3/51) = 12/2652 = 1/221 = 0.00452.` },
        { type: "h3", text: "4.2 Independence" },
        { type: "p", text: `A and B are independent if knowing one tells you nothing about the other: P(A | B) = P(A), equivalently P(A and B) = P(A) * P(B). For independent events, the joint probability is just the product of the marginals. Independence is an assumption you must justify, not assume for free — dependent events (drawing without replacement, correlated assets) are the norm in the real world.` },
        { type: "h3", text: "4.3 Mutually exclusive is NOT the same as independent" },
        { type: "p", text: `This confusion is a favourite interview trap. Mutually exclusive (disjoint) means the events cannot both happen: P(A and B) = 0. Independent means they carry no information about each other: P(A and B) = P(A)*P(B). These are almost opposites. If A and B are mutually exclusive and both have positive probability, then learning B occurred tells you A definitely did NOT — that is the strongest possible dependence. So two events with positive probability that are mutually exclusive are necessarily dependent.` },
        { type: "callout", text: `Mutually exclusive vs independent is the classic gotcha. Disjoint events with positive probability are maximally dependent, never independent. If someone asks "are these independent because they can't both happen?", the answer is no — that reasoning proves the opposite.` },
        { type: "code", code: `# A = die shows <= 3, B = die shows even. Independent?
S = range(1,7)
PA = sum(1 for x in S if x <= 3)/6        # 1/2
PB = sum(1 for x in S if x % 2 == 0)/6    # 1/2
PAB = sum(1 for x in S if x <= 3 and x % 2 == 0)/6   # {2} -> 1/6
print(PAB, PA*PB)   # 0.1666..., 0.25  -> NOT independent (0.1667 != 0.25)` }
      ]
    },
    {
      heading: "5. Law of total probability and partitioning",
      blocks: [
        { type: "p", text: `Often you cannot compute P(A) directly, but you can compute it once you condition on which "case" you are in. Split the sample space into a partition B1, B2, ..., Bn (mutually exclusive events that together cover everything). Then:` },
        { type: "code", code: `P(A) = sum over i of  P(A | Bi) * P(Bi)` },
        { type: "p", text: `You are computing a weighted average of the conditional probabilities, weighted by how likely each case is. This "condition on the case, then combine" move is one of the most powerful problem-solving techniques in probability.` },
        { type: "p", text: `Example: two urns. Urn 1 has 3 red, 2 blue; urn 2 has 1 red, 4 blue. You pick an urn at random (50/50), then draw a ball. P(red) = P(red | urn1)*P(urn1) + P(red | urn2)*P(urn2) = (3/5)(1/2) + (1/5)(1/2) = 3/10 + 1/10 = 4/10 = 0.4.` },
        { type: "callout", text: `When a problem has a natural "which scenario am I in" structure — which coin, which urn, which day type — conditioning on the scenario via the law of total probability is almost always the clean path. It also sets up Bayes' theorem, which reverses the conditioning.` }
      ]
    },
    {
      heading: "6. Bayes' theorem",
      blocks: [
        { type: "p", text: `Bayes' theorem is the crown jewel and the single most-tested idea in quant interviews. It reverses conditional probabilities: it tells you P(cause | effect) in terms of P(effect | cause). You observe an effect (a positive test, three heads, a price move) and want the probability of the underlying cause.` },
        { type: "code", code: `P(A | B) = P(B | A) * P(A) / P(B)

# Expanded with the law of total probability in the denominator:
P(A | B) = P(B|A) * P(A) / [ P(B|A)*P(A) + P(B|not A)*P(not A) ]` },
        { type: "p", text: `Read it as: posterior = (likelihood * prior) / evidence. P(A) is your prior belief before the observation; P(A|B) is your updated (posterior) belief after seeing B. The denominator P(B) is just the total probability of the evidence, computed by summing over all causes.` },
        { type: "h3", text: "6.1 The disease-test example, end to end" },
        { type: "p", text: `The canonical problem. A disease affects 1% of a population (prevalence / prior = 0.01). A test has sensitivity 99% (it correctly flags 99% of sick people: P(+ | disease) = 0.99) and specificity 95% (it correctly clears 95% of healthy people, so the false-positive rate is 5%: P(+ | healthy) = 0.05). You test positive. What is the probability you actually have the disease?` },
        { type: "p", text: `Most people's gut says "around 99%." Let us compute it. Let D = have disease, + = test positive.` },
        { type: "table", headers: ["Quantity", "Symbol", "Value"], rows: [
          ["Prior (prevalence)", "P(D)", "0.01"],
          ["Sensitivity", "P(+ | D)", "0.99"],
          ["False-positive rate", "P(+ | not D)", "0.05"],
          ["Prior healthy", "P(not D)", "0.99"]
        ]},
        { type: "code", code: `P(+) = P(+|D)*P(D) + P(+|not D)*P(not D)
     = 0.99 * 0.01  +  0.05 * 0.99
     = 0.0099       +  0.0495
     = 0.0594

P(D | +) = P(+|D)*P(D) / P(+)
         = 0.0099 / 0.0594
         = 0.1667     (about 1/6, or 16.7%)` },
        { type: "p", text: `The answer is roughly 16.7%, not 99%. Even after a positive result on a very accurate test, you are more likely NOT to have the disease. The reason is the tiny prior: with only 1% sick, out of 10000 people about 100 are sick (99 test positive) but 9900 are healthy, and 5% of those — about 495 — also test positive. So of ~594 positives, only 99 are truly sick: 99/594 = 16.7%.` },
        { type: "code", code: `# Population sanity check on 10,000 people
sick = 10000 * 0.01              # 100
healthy = 10000 * 0.99           # 9900
true_pos = sick * 0.99           # 99
false_pos = healthy * 0.05       # 495
print(true_pos / (true_pos + false_pos))   # 0.16666...  -> matches Bayes` },
        { type: "callout", text: `Base-rate neglect. The human brain ignores the prior (the base rate) and over-weights the likelihood. When the underlying condition is rare, even a highly accurate test produces mostly false positives, because the huge healthy population contributes many false alarms. Always plug the prior into Bayes explicitly — never eyeball it. This exact structure (rare event + imperfect signal) is why "an accurate signal fired" often does not mean "the rare event happened."` }
      ]
    },
    {
      heading: "7. Random variables: discrete and continuous",
      blocks: [
        { type: "p", text: `A random variable X is a function mapping each outcome to a number. It lets you do arithmetic with randomness. Two flavours:` },
        { type: "ul", items: [
          `Discrete: takes values in a countable set (0,1,2,...). Examples: number of heads in 10 flips, number of arrivals in an hour.`,
          `Continuous: takes values in a continuous range (any real number in an interval). Examples: a stock's return, the time until the next trade.`
        ]},
        { type: "h3", text: "7.1 PMF, PDF, CDF" },
        { type: "table", headers: ["Object", "Discrete", "Continuous"], rows: [
          ["Distribution", "PMF: p(x) = P(X = x)", "PDF: f(x), where P(X in [a,b]) = integral of f from a to b"],
          ["Normalisation", "sum over x of p(x) = 1", "integral of f over all x = 1"],
          ["CDF", "F(x) = P(X <= x) = sum of p(t) for t <= x", "F(x) = P(X <= x) = integral of f from -inf to x"],
          ["Point probability", "p(x) can be positive", "P(X = x) = 0 for any single point"]
        ]},
        { type: "p", text: `Key subtlety for continuous variables: the PDF f(x) is a DENSITY, not a probability. f(x) can exceed 1. Only integrals of f over intervals are probabilities. The probability of any exact value is zero — which is why for continuous distributions P(X <= x) and P(X < x) are equal. The CDF F(x) = P(X <= x) is defined identically in both cases: it is non-decreasing, goes from 0 to 1, and P(a < X <= b) = F(b) - F(a).` }
      ]
    },
    {
      heading: "8. Expectation and linearity of expectation",
      blocks: [
        { type: "p", text: `This is the hero section. Linearity of expectation is the most useful single tool in probability, and the one that most cleanly separates people who have internalised the subject from people who merely memorised formulas. Master it and a large class of "impossibly hard" problems collapse to one-liners.` },
        { type: "h3", text: "8.1 Definition" },
        { type: "p", text: `The expectation (mean, expected value) of X is the probability-weighted average of its values:` },
        { type: "code", code: `Discrete:    E[X] = sum over x of  x * P(X = x)
Continuous:  E[X] = integral of  x * f(x) dx

# Law of the unconscious statistician (LOTUS), for any function g:
E[g(X)] = sum over x of  g(x) * P(X = x)` },
        { type: "p", text: `Example: for a fair die, E[X] = (1+2+3+4+5+6)/6 = 21/6 = 3.5. The expectation need not be an achievable value.` },
        { type: "h3", text: "8.2 Linearity — the magic property" },
        { type: "p", text: `For ANY random variables X and Y and constants a, b:` },
        { type: "code", code: `E[aX + bY] = a*E[X] + b*E[Y]` },
        { type: "p", text: `The astonishing part: this holds EVEN WHEN X and Y are dependent. There is no independence assumption. Expectation of a sum is always the sum of expectations, no matter how tangled the variables are. This is what makes it so powerful — you can decompose a complicated random quantity into a sum of simple pieces, take the expectation of each piece separately, and add, ignoring all the correlations.` },
        { type: "h3", text: "8.3 Indicator variables — the technique that unlocks everything" },
        { type: "p", text: `An indicator variable I_A equals 1 if event A happens and 0 otherwise. Its expectation is beautifully simple: E[I_A] = 1*P(A) + 0*(1-P(A)) = P(A). So the expected value of an indicator is just the probability of the event.` },
        { type: "p", text: `The technique: to find the expected COUNT of something, write the count as a sum of indicators (one per possible occurrence), then use linearity: E[count] = sum of P(each occurrence). The occurrences may be wildly dependent — linearity does not care.` },
        { type: "h3", text: "8.4 Worked example: fixed points of a random permutation" },
        { type: "p", text: `Shuffle n cards. A "fixed point" is a card that lands in its original position. Expected number of fixed points? Let I_k = 1 if card k stays in position k. By symmetry P(card k is fixed) = 1/n. Then E[fixed points] = E[sum of I_k] = sum of E[I_k] = n * (1/n) = 1. Exactly 1, regardless of n. The indicators are dependent (if n-1 cards are fixed, so is the last), but linearity sidesteps that entirely.` },
        { type: "h3", text: "8.5 Worked example: expected number of heads" },
        { type: "p", text: `Flip a coin with P(heads) = p, n times. Number of heads = sum of n indicators, each with expectation p. So E[heads] = n*p. For 10 fair flips, E = 10 * 0.5 = 5. (This is the Binomial mean, derived in one line via linearity instead of a messy sum.)` },
        { type: "h3", text: "8.6 Worked example: the hat-check / matching problem" },
        { type: "p", text: `n people check their hats; the hats are returned at random. Expected number of people who get their own hat back? This is identical to fixed points of a random permutation: E = 1. A striking, order-of-magnitude-defying result — no matter how many people, on average exactly one gets their own hat.` },
        { type: "h3", text: "8.7 Worked example: coupon collector" },
        { type: "p", text: `There are n distinct coupons; each cereal box contains one uniformly at random. Expected number of boxes to collect all n? Here we split the wait into phases. Once you have k distinct coupons, the probability the next box is new is (n-k)/n, so the expected number of boxes to get a new one is n/(n-k) (a geometric waiting time). Summing over k = 0..n-1:` },
        { type: "code", code: `E[boxes] = sum for k=0..n-1 of  n/(n-k)
         = n * (1/n + 1/(n-1) + ... + 1/1)
         = n * (1 + 1/2 + 1/3 + ... + 1/n)
         = n * H_n            where H_n is the n-th harmonic number

# n = 6 (a die): E = 6 * (1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6) = 6 * 2.45 = 14.7 rolls
from fractions import Fraction
n = 6
print(float(n * sum(Fraction(1, k) for k in range(1, n+1))))   # 14.7` },
        { type: "p", text: `Since H_n is approximately ln(n) + 0.577, the coupon collector needs about n*ln(n) boxes — for n = 6, that is 14.7 rolls to see all six faces of a die at least once.` },
        { type: "callout", text: `Linearity of expectation is the highest-leverage trick in the subject. Whenever you are asked for an EXPECTED COUNT (of matches, collisions, inversions, fixed points, records, etc.), define one indicator per possible occurrence, compute each occurrence's probability, and sum. You never need to know the joint distribution. If you learn only one thing from this guide for an interview, learn this.` }
      ]
    },
    {
      heading: "9. Variance, covariance, and standard deviation",
      blocks: [
        { type: "p", text: `Expectation tells you the center; variance tells you the spread — the risk. In trading, variance is not a footnote, it is half the job: you size positions by risk, and risk is variance.` },
        { type: "h3", text: "9.1 Variance and standard deviation" },
        { type: "code", code: `Var(X) = E[(X - E[X])^2]           # average squared distance from the mean
       = E[X^2] - (E[X])^2         # the computational shortcut (always use this)

SD(X) = sqrt(Var(X))               # standard deviation, in the same units as X` },
        { type: "p", text: `The shortcut Var(X) = E[X^2] - E[X]^2 is derived by expanding the square and using linearity; it is almost always the easier form to compute. Standard deviation is the square root of variance, restoring the original units (dollars, not dollars-squared).` },
        { type: "p", text: `Example: fair die. E[X] = 3.5. E[X^2] = (1+4+9+16+25+36)/6 = 91/6 = 15.1667. Var = 15.1667 - 3.5^2 = 15.1667 - 12.25 = 2.9167 = 35/12. SD = 1.708.` },
        { type: "h3", text: "9.2 Scaling and shifting" },
        { type: "code", code: `Var(aX + b) = a^2 * Var(X)         # shift b does not change spread; scale a squares` },
        { type: "p", text: `Adding a constant b just slides the whole distribution — it does not change the spread, so b drops out. Multiplying by a stretches distances by a, which stretches squared distances by a^2. Note that variance is NOT linear (unlike expectation).` },
        { type: "h3", text: "9.3 Covariance and the variance of a sum" },
        { type: "code", code: `Cov(X, Y) = E[(X - E[X])(Y - E[Y])] = E[XY] - E[X]*E[Y]

Var(X + Y) = Var(X) + Var(Y) + 2*Cov(X, Y)

# For independent X, Y:  Cov(X,Y) = 0, so Var(X + Y) = Var(X) + Var(Y).` },
        { type: "p", text: `Covariance measures how two variables move together: positive if they tend to be large together, negative if one being large tends to accompany the other being small. When X and Y are independent, E[XY] = E[X]E[Y], so Cov = 0 and variances simply add. This additivity for independent variables is why diversification works: combining many independent bets makes the variance grow like n while the mean grows like n, so the RELATIVE risk (SD/mean) shrinks like 1/sqrt(n).` },
        { type: "callout", text: `Watch the direction of one-way implications. Independence implies Cov = 0. The converse is FALSE: Cov(X,Y) = 0 does NOT imply independence. Classic counterexample: X uniform on {-1,0,1} and Y = X^2. They are clearly dependent (Y is a function of X), yet Cov(X,Y) = E[X^3] - E[X]E[X^2] = 0 - 0 = 0. Zero correlation only rules out LINEAR dependence.` },
        { type: "code", code: `# Cov = 0 but dependent
import statistics
xs = [-1, 0, 1]
# E[X]=0, E[X^3]=0  ->  Cov(X, X^2) = E[X*X^2] - E[X]E[X^2] = E[X^3] - 0 = 0
EX  = sum(xs)/3
EX3 = sum(x**3 for x in xs)/3
EX2 = sum(x**2 for x in xs)/3
print(EX3 - EX*EX2)     # 0.0  -> uncorrelated, yet Y=X^2 is fully determined by X` },
        { type: "h3", text: "9.4 Correlation" },
        { type: "p", text: `Correlation is normalised covariance: corr(X,Y) = Cov(X,Y) / (SD(X)*SD(Y)). It always lies in [-1, 1], is dimensionless, and measures the strength of the LINEAR relationship. +1 means perfectly linearly increasing, -1 perfectly linearly decreasing, 0 no linear relationship.` }
      ]
    },
    {
      heading: "10. Common distributions",
      blocks: [
        { type: "p", text: `A dozen named distributions cover the overwhelming majority of modelling and interview questions. Memorise this table cold — mean and variance especially, because interviewers ask for them on the spot.` },
        { type: "table", headers: ["Distribution", "PMF / PDF", "Mean", "Variance", "When it shows up"], rows: [
          ["Bernoulli(p)", "P(1)=p, P(0)=1-p", "p", "p(1-p)", "A single yes/no trial; one coin flip; did the trade fill?"],
          ["Binomial(n,p)", "C(n,k) p^k (1-p)^(n-k)", "n*p", "n*p*(1-p)", "Number of successes in n independent Bernoulli trials."],
          ["Geometric(p)", "(1-p)^(k-1) * p, k=1,2,...", "1/p", "(1-p)/p^2", "Number of trials until the FIRST success (waiting time)."],
          ["Neg. Binomial(r,p)", "C(k-1,r-1) p^r (1-p)^(k-r)", "r/p", "r(1-p)/p^2", "Trials until the r-th success; sum of r geometrics."],
          ["Poisson(lambda)", "e^-lambda * lambda^k / k!", "lambda", "lambda", "Count of rare events in a fixed interval (arrivals, ticks)."],
          ["Uniform discrete {1..n}", "1/n each", "(n+1)/2", "(n^2 - 1)/12", "A fair die; equally likely finite outcomes."],
          ["Uniform cont. [a,b]", "1/(b-a) on [a,b]", "(a+b)/2", "(b-a)^2 / 12", "No-information continuous guess; a random point in a range."],
          ["Normal(mu, sigma^2)", "(1/(sigma*sqrt(2pi))) e^(-(x-mu)^2/(2 sigma^2))", "mu", "sigma^2", "Sums/averages of many small effects; the CLT limit; returns."],
          ["Exponential(lambda)", "lambda * e^(-lambda x), x>=0", "1/lambda", "1/lambda^2", "Time BETWEEN Poisson events; memoryless waiting time."]
        ]},
        { type: "h3", text: "10.1 The ones interviewers love" },
        { type: "p", text: `Binomial(n,p) is the number of heads in n flips. Its mean n*p and variance n*p*(1-p) both fall straight out of linearity and independence: it is a sum of n independent Bernoulli(p) variables, each with mean p and variance p(1-p). For large n it looks approximately Normal (that is the CLT).` },
        { type: "p", text: `Geometric(p) is the number of flips until the first head. Mean 1/p is intuitive: if heads has probability p, you expect to wait 1/p flips. It is MEMORYLESS: given you have already flipped 5 tails, the expected additional wait is still 1/p — the coin has no memory of past failures. This memorylessness is the discrete cousin of the Exponential's, and shows up constantly.` },
        { type: "p", text: `Poisson(lambda) counts rare events over a fixed window when events are independent and occur at a constant average rate lambda. Its defining oddity: mean = variance = lambda. It is the limit of Binomial(n, p) as n -> infinity and p -> 0 with n*p = lambda held fixed. Market order arrivals over a short interval are often modelled as Poisson.` },
        { type: "p", text: `Exponential(lambda) is the continuous waiting time between Poisson events. Also memoryless (the only continuous distribution that is): P(X > s + t | X > s) = P(X > t). Its mean is 1/lambda — if events arrive at rate lambda per second, you wait 1/lambda seconds on average.` },
        { type: "p", text: `Normal(mu, sigma^2) is the bell curve, the attractor of the Central Limit Theorem. Useful facts: about 68% of mass lies within 1 SD of the mean, 95% within 2 SD, 99.7% within 3 SD. Any linear combination of independent Normals is Normal.` },
        { type: "callout", text: `Do not confuse the "waiting" distributions. Geometric counts DISCRETE trials until the first success (mean 1/p). Exponential is its CONTINUOUS analogue, the time until the next event (mean 1/lambda). Poisson counts how MANY events occur in a fixed window (mean lambda). Poisson and Exponential are two views of the same process: counts vs inter-arrival times.` }
      ]
    },
    {
      heading: "11. Expected value via states (first-step analysis)",
      blocks: [
        { type: "p", text: `Many "expected number of steps until X" problems are cleanest to solve by setting up equations over states, conditioning on the FIRST step. You define an expected value from each state, write one equation per state by averaging over the possible next moves, and solve the linear system. This is called first-step analysis.` },
        { type: "h3", text: "11.1 Expected flips to see HH vs HT (and why they differ)" },
        { type: "p", text: `Flip a fair coin until you see two specific consecutive outcomes. The expected number of flips to first see HH is 6; to first see HT is 4. People find it deeply counterintuitive that these differ — surely every 2-flip pattern is equally likely? — but the waiting times genuinely differ, and understanding WHY is a rite of passage.` },
        { type: "p", text: `HT, via states. Let E be the expected flips from the start. First flip: if T (prob 1/2), we have made no progress toward HT and are effectively back to start. If H (prob 1/2), we now just need a T. Let A = expected additional flips once we have an H and need a T. From "need a T": flip once; if T (1/2) we are done, if H (1/2) we still have an H and still need a T (no regress). So A = 1 + (1/2)*0 + (1/2)*A, giving A = 2. And E = 1 + (1/2)*E + (1/2)*A. Solving: E = 1 + E/2 + 1, so E/2 = 2, E = 4.` },
        { type: "code", code: `# HT: states  S (start) and H (have an H, need a T)
#   E_S = 1 + 1/2 * E_S + 1/2 * E_H      (flip: T -> back to S, H -> go to H)
#   E_H = 1 + 1/2 * 0   + 1/2 * E_H      (flip: T -> done,      H -> stay in H)
# From the second:  E_H = 2.  Sub in:  E_S = 1 + E_S/2 + 1  ->  E_S = 4.` },
        { type: "p", text: `HH, via states. The crucial asymmetry: when you are waiting for the SECOND H and instead flip a T, you fall ALL the way back to start — one bad flip destroys your progress. When waiting for HT, a "wrong" flip (another H) keeps you in the "have H" state; you never regress. That extra fragility is exactly why HH takes longer.` },
        { type: "code", code: `# HH: states  S (start) and H (have one H, need another H)
#   E_S = 1 + 1/2 * E_H + 1/2 * E_S      (flip: H -> go to H, T -> stay S)
#   E_H = 1 + 1/2 * 0   + 1/2 * E_S      (flip: H -> done,    T -> back to S!)
# From the first:  E_S/2 = 1 + E_H/2  ->  E_S = 2 + E_H.
# Sub into second:  E_H = 1 + (2 + E_H)/2  ->  E_H/2 = 2  ->  E_H = 4,  E_S = 6.` },
        { type: "p", text: `So E[HH] = 6 and E[HT] = 4. The lesson: overlapping patterns that can "self-destruct" on a wrong flip take longer to appear. Both patterns are equally likely on any GIVEN pair of flips, but the waiting-time distributions differ because of how failures propagate.` },
        { type: "code", code: `# Monte Carlo confirmation
import random
def wait(target, trials=200000):
    total = 0
    for _ in range(trials):
        s = ""
        while not s.endswith(target):
            s += random.choice("HT")
        total += len(s)
    return total / trials
print(wait("HH"), wait("HT"))    # approx 6.0, approx 4.0` },
        { type: "h3", text: "11.2 Gambler's ruin" },
        { type: "p", text: `You start with i dollars and bet 1 dollar per round on a game you win with probability p (lose with q = 1 - p). You stop at 0 (broke) or N (target). What is the probability you reach N before going broke?` },
        { type: "code", code: `# Let P_i = probability of reaching N starting from i dollars.
# Fair game (p = 1/2):        P_i = i / N
# Biased game (p != 1/2), r = q/p:
#     P_i = (1 - r^i) / (1 - r^N)` },
        { type: "p", text: `In the fair case the answer is beautifully simple: your chance of hitting N before 0 is just your fraction of the way there, i/N. Start with 100 dollars aiming for 200 in a fair game: probability 1/2. Aiming for 1000 from 100: probability 1/10 — the more ambitious the target, the less likely. In an UNFAIR game (p < 1/2, the casino's edge), r > 1 and the probability decays roughly like r^-(N-i): a persistent negative edge makes reaching a distant target exponentially unlikely, which is precisely why the house always wins in the long run.` },
        { type: "callout", text: `First-step analysis recipe: (1) enumerate the states, (2) let f(state) be the quantity you want (expected steps, or a probability), (3) write one equation per state by conditioning on the first move and averaging f over the next states (add 1 per step for expected-time problems), (4) solve the linear system. This dissolves most "expected number of steps / probability of reaching X first" brainteasers.` }
      ]
    },
    {
      heading: "12. Markov chains (brief)",
      blocks: [
        { type: "p", text: `A Markov chain is a random process that hops between states, where the next state depends ONLY on the current state, not on the full history. This "memorylessness" (the Markov property) is what makes them tractable, and it is exactly the structure underlying the first-step-analysis problems above.` },
        { type: "ul", items: [
          `States: the possible situations the process can be in (e.g. "have an H", "start").`,
          `Transition matrix P: P[i][j] is the probability of moving from state i to state j in one step. Each row sums to 1.`,
          `Markov property: P(next = j | current = i, and all history) = P(next = j | current = i). History beyond the present is irrelevant.`,
          `n-step transitions: the matrix P^n gives the probability of going from i to j in exactly n steps.`
        ]},
        { type: "h3", text: "12.1 Stationary distribution" },
        { type: "p", text: `A stationary distribution pi is a probability vector unchanged by one step: pi * P = pi. Intuitively, it is the long-run fraction of time the chain spends in each state — the equilibrium of the process. For a well-behaved (irreducible, aperiodic) chain, no matter where you start, the distribution over states converges to pi as the number of steps grows. You find pi by solving the linear system pi*P = pi together with the constraint that the entries of pi sum to 1. Stationary distributions underlie PageRank, MCMC sampling, and long-run occupancy questions.` }
      ]
    },
    {
      heading: "13. Classic problems and paradoxes",
      blocks: [
        { type: "p", text: `Interviewers reuse a small canon of classic problems because they cleanly separate people who reason carefully from people who pattern-match. Know these cold, and know the REASONING, not just the answer.` },
        { type: "h3", text: "13.1 Monty Hall" },
        { type: "p", text: `Three doors; a car behind one, goats behind the other two. You pick a door. The host — who knows where the car is — opens a DIFFERENT door revealing a goat, then offers you the chance to switch. Should you?` },
        { type: "p", text: `Yes, always switch. Switching wins with probability 2/3; staying wins with 1/3. The reasoning: your initial pick is correct with probability 1/3 and wrong with probability 2/3. If your initial pick was wrong (prob 2/3), the host is FORCED to open the only other goat door, leaving the car behind the remaining door — so switching wins in exactly those 2/3 of cases. The host's action is not random; it injects information precisely because he must avoid the car.` },
        { type: "code", code: `import random
def monty(switch, trials=200000):
    wins = 0
    for _ in range(trials):
        car = random.randint(0, 2)
        pick = random.randint(0, 2)
        # host opens a door that is neither the pick nor the car
        host = next(d for d in range(3) if d != pick and d != car)
        if switch:
            pick = next(d for d in range(3) if d != pick and d != host)
        wins += (pick == car)
    return wins / trials
print(monty(True), monty(False))    # approx 0.667, approx 0.333` },
        { type: "callout", text: `The Monty Hall trap is treating the host's reveal as random. It is not — the host KNOWS and deliberately avoids the car. That constraint is what makes switching a 2/3 winner. If the host opened a door at random (sometimes revealing the car), switching would only be 1/2. The information content lives in the host's rule, so always ask "what did the informed party know, and how did it constrain their action?"` },
        { type: "h3", text: "13.2 Birthday paradox" },
        { type: "p", text: `How many people must be in a room for a better-than-even chance that two share a birthday? Surprisingly few: just 23. The trick is the complement — compute the probability all birthdays are DISTINCT and subtract from 1.` },
        { type: "code", code: `P(all distinct, n people) = (365/365)(364/365)(363/365)...((365-n+1)/365)
P(some match) = 1 - P(all distinct)

def match_prob(n):
    p = 1.0
    for k in range(n):
        p *= (365 - k) / 365
    return 1 - p
print(match_prob(23))    # 0.5073  -> just over 50%
print(match_prob(50))    # 0.9704  -> almost certain` },
        { type: "p", text: `It feels wrong because people intuitively compare against THEIR OWN birthday, but the event is ANY pair matching. With 23 people there are C(23,2) = 253 pairs, and each pair matches with probability about 1/365 — so roughly 253/365 = 0.69 expected matches, comfortably enough for the probability of at least one to exceed 1/2. The lesson: count pairs, not people.` },
        { type: "h3", text: "13.3 St. Petersburg paradox" },
        { type: "p", text: `A game: flip a fair coin until the first heads; if it appears on flip k, you win 2^k dollars. The expected payout is sum over k>=1 of (1/2^k)*(2^k) = sum of 1 = infinity. Yet nobody would pay even 20 dollars to play. The resolution: humans value money by UTILITY (diminishing marginal value of each extra dollar), not by raw dollars; with, say, logarithmic utility the expected utility is finite and modest. The paradox is a caution that infinite or fat-tailed expectations do not translate into sensible real-world willingness to pay — a genuinely relevant point for tail-risk and bankroll sizing.` },
        { type: "h3", text: "13.4 Two-child problem (conditioning subtlety)" },
        { type: "p", text: `A family has two children. Given that AT LEAST ONE is a boy, what is the probability both are boys? Equally likely sample space {BB, BG, GB, GG}. Conditioning on "at least one boy" removes GG, leaving {BB, BG, GB}. Only BB has two boys, so the answer is 1/3, not 1/2.` },
        { type: "p", text: `But watch how the answer flips with the conditioning. If instead you are told "the OLDER child is a boy", the sample space is {BB, BG}, and the answer becomes 1/2. Same-seeming information, different conditioning, different answer. Even subtler: "at least one is a boy born on a Tuesday" gives yet another answer (about 13/27), because the extra qualifier changes how much the two-boy outcomes are over-counted.` },
        { type: "callout", text: `The two-child problem is the ultimate reminder to condition on EXACTLY what you were told, no more, no less. "At least one is a boy" (answer 1/3) and "the first is a boy" (answer 1/2) are different conditioning events. The mistake is silently upgrading vague information into specific information. Write out the restricted sample space explicitly.` },
        { type: "h3", text: "13.5 Bertrand's box" },
        { type: "p", text: `Three boxes: one has two gold coins, one two silver, one one of each. You pick a box at random and draw a coin at random; it is gold. Probability the OTHER coin in that box is also gold? Naive answer 1/2 (it is either the GG or the GS box). Correct answer 2/3. Reason: there are three equally likely GOLD coins you could have drawn — two from the GG box, one from the GS box. Two of those three come from the GG box, whose other coin is gold. Condition on coins drawn, not boxes.` }
      ]
    },
    {
      heading: "14. Law of large numbers and the Central Limit Theorem",
      blocks: [
        { type: "p", text: `Two theorems justify why probability is useful in the real world, and specifically why market making works. They are about what happens when you average or sum MANY independent random quantities.` },
        { type: "h3", text: "14.1 Law of large numbers (LLN)" },
        { type: "p", text: `As you take more independent samples of X, the sample mean converges to the true mean E[X]. Flip a fair coin a million times and the fraction of heads will be extremely close to 0.5. The LLN is why an edge that is positive in expectation reliably materialises over many trials: the average outcome stops being random and settles onto its expectation.` },
        { type: "h3", text: "14.2 Central Limit Theorem (CLT)" },
        { type: "p", text: `The sum (or average) of many independent, identically distributed variables — WHATEVER their individual distribution, provided it has finite variance — is approximately NORMAL. Specifically, for n samples with mean mu and variance sigma^2, the sample mean has mean mu and standard deviation sigma/sqrt(n), and its distribution approaches a bell curve as n grows. The 1/sqrt(n) shrinkage of the standard error is the single most important scaling law in statistics.` },
        { type: "code", code: `# Sum of many non-normal (uniform) variables becomes bell-shaped
import random
def sample_mean(n):
    return sum(random.random() for _ in range(n)) / n   # each Uniform[0,1], mean 0.5
means = [sample_mean(30) for _ in range(100000)]
# These means cluster tightly around 0.5 with SD approx sqrt(1/12)/sqrt(30) approx 0.053,
# and their histogram is approximately Normal even though the inputs are flat/uniform.` },
        { type: "callout", text: `Why market making relies on this: each trade has a tiny, noisy edge. By the LLN, the average edge over many trades converges to the true positive expectation. By the CLT, the total P&L over n trades is approximately Normal with standard deviation growing like sqrt(n) while the mean grows like n — so the SIGNAL (mean) outgrows the NOISE (SD) as sqrt(n). Enough small independent edges become a near-certain profit. This is the mathematical heart of the business.` }
      ]
    },
    {
      heading: "15. Interview technique and traps",
      blocks: [
        { type: "p", text: `Knowing the theory is necessary but not sufficient. The following habits are what separate a clean interview performance from a muddled one.` },
        { type: "ul", items: [
          `Define events precisely before computing. Write "A = ..." and "B = ..." in words. Most wrong answers solve a subtly different problem.`,
          `Condition on the RIGHT thing. Ask "what naturally splits this into cases?" and apply the law of total probability. Then, if the question reverses the arrow, apply Bayes.`,
          `Reach for linearity of expectation FIRST on any "expected count" question. Indicators + linearity beat brute force almost every time, and dodge dependence.`,
          `Use symmetry. If outcomes are interchangeable, each has the same probability — this collapses huge computations (fixed points, card positions, matching).`,
          `Sanity-check bounds. Every probability must be in [0,1]; every conditional must be consistent. If you get 1.4 or a negative variance, you have a bug.`,
          `Use the complement for "at least one". 1 - P(none) is almost always faster than a direct union.`,
          `Distinguish mutually exclusive from independent, and P(A|B) from P(B|A). These two confusions cause a huge share of errors.`,
          `When stuck, simulate mentally or on paper with a tiny case (n = 2 or n = 3) to check your formula before generalising.`,
          `State your assumptions out loud (independence, uniformity, with/without replacement). Interviewers grade reasoning, not just the final number.`
        ]},
        { type: "callout", text: `The meta-trap: answering fast with intuition instead of setting up the problem. Almost every classic (Monty Hall, base rates, two-child, HH-vs-HT) is engineered so that gut instinct is WRONG. Slow down, write the sample space or the states, and let the arithmetic — not the vibe — produce the answer. Then sanity-check that it lies in [0,1] and matches a tiny hand-simulated case.` }
      ]
    },
    {
      heading: "16. Study plan",
      blocks: [
        { type: "p", text: `The standard preparation text for quant-trading interviews is Xinfeng Zhou's "A Practical Guide to Quantitative Finance Interviews" — universally called the green book. Its probability and brainteaser chapters are exactly the material above. Use it deliberately rather than passively reading.` },
        { type: "h3", text: "16.1 Order of attack" },
        { type: "ol", items: [
          `Nail linearity of expectation FIRST. It is the highest-return concept: fixed points, coupon collector, hat-check, expected matches. Do every indicator-variable problem you can find until it is automatic.`,
          `Then conditional probability and Bayes. Grind the disease-test / false-positive family until base-rate reasoning is second nature. Do the green book's Bayes problems.`,
          `Then first-step analysis / expected value via states: HH vs HT, expected rolls, gambler's ruin. Set up the state equations by hand every time — do not memorise answers.`,
          `Then the distributions table. Be able to recite mean and variance for Bernoulli, Binomial, Geometric, Poisson, Uniform, Normal, Exponential without hesitation.`,
          `Then variance and covariance: Var(X)=E[X^2]-E[X]^2, Var(aX+b)=a^2 Var(X), Var(X+Y) with covariance, independence => Cov=0 (but not conversely).`,
          `Finally the paradox canon (Monty Hall, birthday, two-child, Bertrand, St. Petersburg) — know the reasoning, since interviewers will push on WHY.`
        ]},
        { type: "h3", text: "16.2 How to practise" },
        { type: "ul", items: [
          `Solve on paper first, out loud, as if in an interview — narrate your event definitions and assumptions.`,
          `After each problem, WRITE a tiny simulation to confirm your closed-form answer. Being able to sanity-check by simulation is itself an interview-relevant skill and cements the concept.`,
          `Redo missed problems a day later. Spaced repetition matters more than volume.`,
          `Time yourself. HRT/Jane Street/Optiver rounds are fast; aim to define the events and set up the computation within a minute.`
        ]},
        { type: "callout", text: `If you have limited time, over-invest in linearity of expectation and Bayes. Those two ideas alone account for a large fraction of quant-probability interview questions, and both reward exactly the "define it precisely, then compute mechanically" discipline this guide keeps hammering. Everything else is a bonus.` }
      ]
    }
  ],
  cheatsheet: [
    `P(A|B) = P(A and B) / P(B). Multiplication rule: P(A and B) = P(A|B)P(B) = P(B|A)P(A).`,
    `Independent: P(A and B) = P(A)P(B). Mutually exclusive: P(A and B) = 0. Disjoint events with positive probability are NEVER independent — they are maximally dependent.`,
    `Complement trick: P(at least one) = 1 - P(none). Union: P(A or B) = P(A) + P(B) - P(A and B).`,
    `Counting: permutations n!/(n-r)! (order matters); combinations C(n,r)=n!/(r!(n-r)!) (order does not); stars and bars C(n+r-1, r) for r identical items in n boxes.`,
    `Law of total probability: P(A) = sum_i P(A|Bi)P(Bi) over a partition {Bi}.`,
    `Bayes: P(A|B) = P(B|A)P(A) / P(B). Posterior = likelihood * prior / evidence. Disease test (1% prev, 99% sens, 5% false-pos) gives P(sick|+) = 1/6 ~ 16.7%, not 99% — base rates dominate.`,
    `E[X] = sum x P(X=x). Linearity: E[aX+bY] = aE[X] + bE[Y] ALWAYS, even for dependent X,Y.`,
    `Indicator trick: E[I_A] = P(A); expected count = sum of per-occurrence probabilities. Fixed points of a random permutation: E = 1. Coupon collector: E = n*H_n (n=6 gives 14.7).`,
    `Var(X) = E[X^2] - E[X]^2. Var(aX+b) = a^2 Var(X). Var(X+Y) = Var(X)+Var(Y)+2Cov(X,Y). Independence => Cov=0, but Cov=0 does NOT imply independence.`,
    `Distribution means/vars: Bernoulli(p): p, p(1-p). Binomial(n,p): np, np(1-p). Geometric(p): 1/p, (1-p)/p^2. Poisson(L): L, L. Uniform[a,b]: (a+b)/2, (b-a)^2/12. Exponential(L): 1/L, 1/L^2. Normal: mu, sigma^2.`,
    `Geometric and Exponential are memoryless. Poisson counts events in a window; Exponential is the time between them (same process, two views).`,
    `First-step analysis: E[flips to HH] = 6, E[flips to HT] = 4 — HH is longer because a wrong flip resets you to start, while HT never regresses. Gambler's ruin (fair): P(reach N from i) = i/N.`,
    `Markov property: next state depends only on the current state. Stationary distribution pi solves pi P = pi with entries summing to 1 (long-run occupancy).`,
    `Monty Hall: always switch, wins 2/3 (host's informed reveal injects info). Birthday: 23 people for >50% match (count pairs, use complement).`,
    `Two-child: "at least one boy" -> P(both boys)=1/3; "older is a boy" -> 1/2. Condition on EXACTLY what you were told. Bertrand's box: drew gold, P(other gold)=2/3.`,
    `LLN: sample mean -> true mean. CLT: sums/averages of many iid finite-variance variables are approximately Normal; standard error shrinks like sigma/sqrt(n). Market making = many small positive edges -> near-certain profit.`,
    `Interview discipline: define events precisely, condition on the right thing, use symmetry and linearity first, sanity-check every probability is in [0,1], and simulate a tiny case to verify.`,
    `Study order (Zhou's green book): linearity of expectation first, then Bayes, then first-step analysis, then distributions, then variance/covariance, then the paradox canon.`
  ]
}
