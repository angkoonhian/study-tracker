// Game Theory & Trading-Game brainteasers.
// Signature Jane Street / HRT / Optiver / SIG interview style.
// Each optimal strategy and its value re-derived from first principles.

export const BT_GAMES = [
  {
    id: "game-market-make-die",
    category: "Game Theory & Trading",
    difficulty: "Medium",
    question:
      `I roll a fair six-sided die but don't show you the result. You must quote me a two-sided market (a bid and an ask) on the value X shown on the die. I then choose to BUY from you at your ask or SELL to you at your bid — whichever is profitable for me, given that I can see the die.\n` +
      `Assume I always trade the side that profits me (and trade either side if indifferent). How should you center your market, and what is the width that bounds your worst-case expected loss? What is your expected loss per trade if you quote the fair midpoint with width w (bid = 3.5 - w/2, ask = 3.5 + w/2)?`,
    answer:
      `Center on the mean, 3.5. With width w you quote bid 3.5 - w/2 / ask 3.5 + w/2. Expected loss to the informed counterparty is E[|X - 3.5|] - w/2 = 1.5 - w/2 per trade. You only break even (zero expected edge given away) at w = 3, i.e. bid 2 / ask 5; any tighter market loses money to the informed trader.`,
    solution:
      `The counterparty sees X and you do not. If your ask is a = 3.5 + w/2, they BUY only when X > a (they get something worth X for a, gaining X - a > 0). If your bid is b = 3.5 - w/2, they SELL only when X < b (they hand you something worth X for b, gaining b - X > 0).\n` +
      `By symmetry of the die around 3.5, consider the per-trade expected profit to THEM (your loss):\n` +
      `- Buy side: E[(X - a) when X > a].\n` +
      `- Sell side: E[(b - X) when X < b].\n` +
      `Center matters first: any center c ≠ 3.5 is strictly worse, because the informed trader picks off the side you've mispriced. The mean 3.5 minimizes the maximum adverse selection by symmetry. So center = E[X] = 3.5.\n` +
      `Now the clean closed form. Whatever the trade direction, the counterparty's gain equals max(X - a, 0) + max(b - X, 0); for a symmetric market around the mean and w small this is essentially |X - 3.5| - w/2 whenever |X - 3.5| > w/2, and 0 otherwise. Taking the natural benchmark where the informed trader always finds a profitable side, expected give-up = E[|X - 3.5|] - w/2.\n` +
      `Compute E[|X - 3.5|] for X uniform on {1..6}: deviations are 2.5, 1.5, 0.5, 0.5, 1.5, 2.5; mean = (2.5+1.5+0.5)*2/6 = 9/6 = 1.5.\n` +
      `So expected loss ≈ 1.5 - w/2. Setting this to zero gives w = 3: bid 2, ask 5. Intuition: you must quote wide enough that the average |deviation| the informed trader can exploit (1.5) is covered by your half-spread (w/2). This is the core market-making lesson — your spread must compensate for adverse selection, and against a perfectly informed counterparty you cannot make money, only lose less.`,
  },
  {
    id: "game-winners-curse-auction",
    category: "Game Theory & Trading",
    difficulty: "Hard",
    question:
      `A company is worth an unknown value V, uniformly distributed on [0, 100], known only to its current owner. You may bid b to acquire it. Crucially, the moment you take it over, it becomes worth 1.5 × V to you (you run it better). The owner sells if and only if your bid b ≥ V. How much should you bid to maximize expected profit?`,
    answer:
      `Bid 0 (don't bid). For any positive bid b, expected profit is negative: conditional on the owner accepting (V ≤ b), E[V] = b/2, so you pay b for an asset worth 1.5·(b/2) = 0.75b < b. The winner's curse makes every positive bid a loser despite the 1.5× synergy.`,
    solution:
      `This is the classic 'acquiring a company' / winner's curse problem. Key insight: the owner's accept/reject decision is informative. The owner accepts only when b ≥ V, i.e. when V ≤ b.\n` +
      `Given acceptance, V is uniform on [0, b], so E[V | accepted] = b/2.\n` +
      `Your post-acquisition value is 1.5·V, so E[value to you | accepted] = 1.5 · (b/2) = 0.75b.\n` +
      `You pay b. Expected profit conditional on a deal = 0.75b - b = -0.25b < 0 for every b > 0.\n` +
      `Probability of a deal is b/100 > 0, so unconditional expected profit = (b/100)·(-0.25b) = -0.0025 b² < 0.\n` +
      `Therefore the optimum is b = 0: do not bid. The trap is reasoning 'average V is 50, after synergy it's worth 75, so bid up to 75.' That ignores conditioning on winning: you only win when V is low, so the conditional mean collapses to b/2. Even a 50% value uplift is not enough; you would need the multiplier > 2 for any positive bid to be profitable (since you need 1.5 → k with k·(b/2) > b ⇒ k > 2).`,
  },
  {
    id: "game-guess-two-thirds",
    category: "Game Theory & Trading",
    difficulty: "Medium",
    question:
      `Every player on the desk secretly picks a real number in [0, 100]. The winner is whoever is closest to two-thirds of the average of all submitted numbers. Among perfectly rational players who know everyone is rational, what number should you pick, and why?`,
    answer:
      `Pick 0. It is the unique Nash equilibrium, reached by iterated elimination of dominated strategies: any number above 66.67 is dominated, then above 44.4, and so on, converging to 0.`,
    solution:
      `Iterated dominance. The target is (2/3)·average. The maximum possible average is 100, so the target can never exceed (2/3)·100 = 66.67. Therefore any guess above 66.67 is weakly dominated — it can never be closer to the target than 66.67 itself. Rational players eliminate (66.67, 100].\n` +
      `Now the effective max guess is 66.67, so the max possible target is (2/3)·66.67 = 44.4. Eliminate everything above 44.4. Iterate: 100 → 66.67 → 44.4 → 29.6 → ... → 0. Each round multiplies the ceiling by 2/3, converging to 0.\n` +
      `At 0 the system is fixed: if everyone picks 0, the average is 0, the target is 0, and no one can do better by deviating — that is the unique Nash equilibrium. The 'theory answer' is 0.\n` +
      `Trading-desk caveat the interviewer wants to hear: in a REAL room of imperfectly rational people the average tends to land around 20-35, so the empirically winning guess is often ~13-22 (two-thirds of that). The skill is modeling the rationality LEVEL of your opponents (level-k thinking), not blindly assuming full convergence — same as estimating how sophisticated your counterparties are in markets.`,
  },
  {
    id: "game-nim-classic",
    category: "Game Theory & Trading",
    difficulty: "Medium",
    question:
      `Three piles of stones: 3, 5, 7. Players alternate; on your turn you remove any positive number of stones from a single pile. The player who takes the last stone WINS. You move first. Can you force a win, and if so what is your first move?`,
    answer:
      `Yes — first player wins. Compute the XOR (nim-sum): 3 ⊕ 5 ⊕ 7 = 1 ≠ 0, so the position is winning. Optimal first move: remove 1 stone from the pile of 3 (making piles 2, 5, 7), leaving nim-sum 0.`,
    solution:
      `This is standard Nim under normal play. The Sprague-Grundy / Bouton theorem: a position is a LOSS for the player to move (a 'P-position') iff the nim-sum (bitwise XOR of pile sizes) is 0; otherwise it is a WIN ('N-position').\n` +
      `Compute in binary: 3 = 011, 5 = 101, 7 = 111. XOR column by column: bit0: 1⊕1⊕1 = 1; bit1: 1⊕0⊕1 = 0; bit2: 0⊕1⊕1 = 0. Nim-sum = 001 = 1 ≠ 0. So the position is winning for the mover.\n` +
      `Winning strategy: move to make the nim-sum 0. We need to change one pile so the three XOR to 0. Find a pile p whose value has a 1 in the highest set bit of the nim-sum (here bit0). 3 = 011 has bit0 set. New size for that pile = p ⊕ (nim-sum) = 3 ⊕ 1 = 2. So change pile 3 → 2, i.e. remove 1 stone. New piles 2, 5, 7: check 2 ⊕ 5 ⊕ 7 = 010 ⊕ 101 ⊕ 111 = 000. \n` +
      `Why this wins: from any nim-sum-0 position every move makes the nim-sum nonzero (changing one pile must flip at least one bit), and from any nonzero position you can always restore nim-sum 0. So you keep handing your opponent a 0-position; they can never give you a 0-position, and the terminal position (all empty, nim-sum 0) is a loss for whoever faces it — which will be your opponent. Hence you take the last stone.`,
  },
  {
    id: "game-subtraction-misere",
    category: "Game Theory & Trading",
    difficulty: "Easy",
    question:
      `A single pile of 21 coins. Players alternate; on each turn you remove 1, 2, or 3 coins. The player forced to take the LAST coin LOSES (misère). You move first. Do you win, and what is your strategy?`,
    answer:
      `No — you (the first player) lose with optimal play; the second player wins. Losing positions for the mover are counts ≡ 1 (mod 4), and 21 ≡ 1 (mod 4). The winning side keeps restoring the pile to ≡ 1 (mod 4) by removing (4 − opponent's take), marching 17 → 13 → 9 → 5 → 1.`,
    solution:
      `Misère subtraction game, moves {1,2,3}. Losing positions for the player TO MOVE are counts where you are forced to eventually take the last coin. Define L = positions where the mover loses.\n` +
      `Terminal logic: with 1 coin left, the mover must take it and loses. So n = 1 is a loss for the mover (L). With n = 2,3,4 the mover can leave exactly 1 for the opponent (take 1, 2, or 3), forcing the opponent to lose — so 2,3,4 are wins (W). With n = 5, any move (to 4,3,2) hands the opponent a W; so 5 is L. Pattern: L at n ≡ 1 (mod 4): 1, 5, 9, 13, 17, 21.\n` +
      `Strategy from a W position: move to leave a count ≡ 1 (mod 4); then whatever the opponent removes (1-3), you remove (4 - that) to restore ≡ 1 (mod 4), marching down 17 → 13 → 9 → 5 → 1, finally leaving them the single losing coin.\n` +
      `Now evaluate the actual start: 21 ≡ 1 (mod 4), which is an L-position. So the FIRST player is in a losing position: any first move (to 18, 19, or 20) leaves a W-position for the opponent, who then plays the leave-≡1 strategy and wins. Honest answer: with optimal play the SECOND player wins. (The framing 'do you win' is a trap — 21 is a loss for the mover. If the pile were 20, 22, 23, or 24 the first player would win by moving to 21 or 17.)`,
  },
  {
    id: "game-dollar-auction",
    category: "Game Theory & Trading",
    difficulty: "Hard",
    question:
      `I auction a $1 bill. Highest bidder pays their bid and gets the dollar — BUT the second-highest bidder also pays their bid and gets nothing. Bidding goes up in 5-cent increments. You and one other rational trader are bidding. What's the rational opening strategy, and what does game theory say about the trap?`,
    answer:
      `The only safe move is not to play (bid nothing). Once two bidders are committed the all-pay structure creates an escalation trap with no stable stopping point below absurd bids; the unique subgame-perfect outcome with deep pockets has bids escalating past $1. If forced in, bid the full $1 (or $0.95) immediately to deter — but ideally refuse.`,
    solution:
      `This is Shubik's dollar auction — the canonical escalation/war-of-attrition trap. The pathology comes from the second-price-also-pays rule.\n` +
      `Suppose you bid $0.95 and opponent bid $0.90. Opponent now faces: quit and lose $0.90, or bid $1.00 to win the dollar (net $0.00) — the latter dominates quitting (-$0.90 < $0.00). So they escalate. Now you're set to lose $0.95; you bid $1.05 because losing $1.05−$1.00 = -$0.05 beats losing your sunk $0.95. The logic of 'one more bid caps my loss' never terminates: at every step the loser's marginal choice is 'pay 5c more to possibly turn a sure loss into a smaller loss,' so bids ratchet past $1, past $2, bounded only by wealth.\n` +
      `Backward-induction view with finite wealth/cap: the player who can credibly bid up to the cap wins, and the equilibrium has the WEAKER player quitting only if they realize they're outgunned. With symmetric deep pockets there is no pure-strategy stopping point — the game is a money pump for the auctioneer.\n` +
      `Correct meta-strategy: recognize ex ante that entering is a trap (negative expected value once a second rational bidder exists) and DON'T bid, or pre-commit to bidding the maximal rational amount ($1.00 or $0.95) immediately so no opponent expects to profit by entering — a deterrence/commitment device. The lesson traders take: don't let sunk costs drive escalation; evaluate each marginal decision on a clean slate, and recognize negative-sum games before you're in one.`,
  },
  {
    id: "game-kelly-sizing",
    category: "Game Theory & Trading",
    difficulty: "Medium",
    question:
      `You have an edge: a bet that pays even money (win +1× your stake, lose −1× your stake) and wins with probability p = 0.6. You'll play many times and want to maximize long-run growth of your bankroll. What fraction f of your bankroll should you stake each round, and what is the resulting per-bet log-growth rate?`,
    answer:
      `Kelly fraction f* = 2p − 1 = 0.2 (stake 20% of bankroll each bet). For even-money odds the formula is f* = p − q = edge. Per-bet expected log-growth ≈ 0.6·ln(1.2) + 0.4·ln(0.8) ≈ 0.02014 (about a 2.0% compounding rate).`,
    solution:
      `Kelly criterion maximizes E[ln(wealth)], the long-run geometric growth rate. With even-money payoff, betting fraction f, wealth multiplies by (1 + f) on a win (prob p) and (1 − f) on a loss (prob q = 1 − p).\n` +
      `Growth objective: g(f) = p·ln(1 + f) + q·ln(1 − f).\n` +
      `Differentiate and set to 0: g'(f) = p/(1 + f) − q/(1 − f) = 0.\n` +
      `⇒ p(1 − f) = q(1 + f) ⇒ p − pf = q + qf ⇒ p − q = f(p + q) = f·1 ⇒ f* = p − q = 2p − 1.\n` +
      `With p = 0.6: f* = 0.2. Stake 20%.\n` +
      `Second-order check: g''(f) = −p/(1+f)² − q/(1−f)² < 0, so this is a maximum.\n` +
      `Resulting growth rate: g(0.2) = 0.6·ln(1.2) + 0.4·ln(0.8) = 0.6·(0.18232) + 0.4·(−0.22314) = 0.10939 − 0.08926 = 0.02014 per bet. So your bankroll compounds at ~2% per wager in the long run.\n` +
      `Why optimal: maximizing E[ln W] is the provably growth-optimal strategy (any other fixed fraction is asymptotically beaten with probability 1). Over-betting (f > 2f* = 0.4 here) actually gives NEGATIVE growth despite positive edge — at f = 0.4, g = 0.6·ln1.4 + 0.4·ln0.6 = 0.2019 − 0.2043 < 0. The desk takeaway: positive EV is necessary but not sufficient; sizing controls survival, and many practitioners bet 'half-Kelly' to cut variance at a small growth cost.`,
  },
  {
    id: "game-sequential-betting-doubling",
    category: "Game Theory & Trading",
    difficulty: "Medium",
    question:
      `A coin will be flipped once. Before the flip you and an opponent alternate, you first, either 'pass' or 'claim'. Simpler version asked at desks: I offer you a gamble — pay $x to play; a fair coin is flipped, you get $1 on heads and $0 on tails, and you may keep flipping, each flip independently, but you must decide IN ADVANCE how many flips n to buy at $0.40 each, each paying $1 on heads. Is buying n flips +EV, and how does variance scale as n grows? What's the per-flip edge?`,
    answer:
      `Each flip has EV = 0.5·$1 − $0.40 = +$0.10 (a 10c edge, +25% on cost). Buying is +EV; total expected profit = $0.10·n, which grows linearly in n. Variance of total payout = n·Var(single) = n·0.25, so standard deviation grows like √n. Edge/EV grows like n while risk grows like √n, so the Sharpe-like ratio improves as √n — buy as many independent flips as bankroll/Kelly allows.`,
    solution:
      `Single flip: payout is $1 w.p. 1/2, $0 w.p. 1/2; cost $0.40. EV per flip = 0.5·1 + 0.5·0 − 0.40 = +$0.10. Positive edge, so each flip is a good bet in isolation.\n` +
      `n independent flips: payouts are i.i.d. Bernoulli($1, p=1/2). Total expected profit = n·$0.10, linear in n.\n` +
      `Risk: Var(single payout) = E[X²] − E[X]² = 0.5·1² − 0.5² = 0.5 − 0.25 = 0.25, so SD = $0.50 per flip. For n independent flips, Var(total) = 0.25n and SD(total) = 0.5·√n.\n` +
      `So the ratio (expected profit)/(SD) = 0.10n / (0.5√n) = 0.2·√n → ∞. This is the law of large numbers / diversification across independent +EV bets: relative risk shrinks like 1/√n while edge accumulates linearly. The probability the n-flip total is a net loss → 0 as n → ∞.\n` +
      `Optimal play: since each flip is independently +EV and independent of the others, you want maximum exposure, sized by Kelly/risk limits rather than by any fear of a single bad flip. This is exactly why trading desks prize many small uncorrelated edges over one big bet: the same total edge with √n less relative risk. (Correctly applying Kelly to even this game would cap stake per flip, but directionally: more independent +EV bets is strictly better.)`,
  },
  {
    id: "game-uniform-draw-bet",
    category: "Game Theory & Trading",
    difficulty: "Hard",
    question:
      `I draw a number U uniformly from [0, 1] and look at it; you don't see it. You then quote a single price p. I choose to BUY a contract from you at p that pays U (I profit if U > p) or SELL it to me... rephrase: I, knowing U, decide to buy the U-paying contract at your price p (if U > p) or sell it to you at p (if U < p). You must set one price p before I decide. What p minimizes your worst-case expected loss, and what is that loss?`,
    answer:
      `Set p = 0.5 (the mean of U). The informed counterparty trades whichever side is profitable, and your expected loss is E[|U − 0.5|] = 1/4 per trade. Any other price is exploited harder, so p = 1/2 minimizes loss; the irreducible loss of $0.25 is the cost of facing a perfectly informed trader with a one-price (zero-width) quote.`,
    solution:
      `The counterparty knows U. If U > p they buy the contract from you at p and it pays them U, gaining U − p. If U < p they sell it to you at p (you pay p for something worth U), they gain p − U. Either way their profit = |U − p|, which is your loss.\n` +
      `Your expected loss as a function of p: L(p) = E[|U − p|] = ∫₀¹ |u − p| du.\n` +
      `Split: ∫₀ᵖ (p − u) du + ∫ₚ¹ (u − p) du = [p·p − p²/2] + [(1/2 − p²/2) − p(1 − p)] = (p²/2) + (1/2 − p²/2 − p + p²) = p² − p + 1/2.\n` +
      `Minimize: dL/dp = 2p − 1 = 0 ⇒ p = 1/2. Second derivative 2 > 0, a minimum.\n` +
      `L(1/2) = (1/4) − (1/2) + 1/2 = 1/4. So the minimal worst-case expected loss is $0.25 per trade, achieved by quoting the unconditional mean 0.5.\n` +
      `Why 1/2 is optimal: pricing at the mean balances the two adverse-selection tails symmetrically; shifting p toward 0 or 1 lets the informed trader pick off the larger remaining mass. This is the zero-width analog of the die market-making problem: with a single price you cannot avoid giving up E[|U − E U|] = mean absolute deviation = 1/4 to a fully informed counterparty. To make money you'd need a two-sided spread wide enough (bid 0.25 / ask 0.75 gives breakeven) to cover that 1/4 mean absolute deviation.`,
  },
  {
    id: "game-matrix-minimax",
    category: "Game Theory & Trading",
    difficulty: "Medium",
    question:
      `A 2×2 zero-sum game. You're the row player choosing rows T or B; opponent picks columns L or R. Your payoff matrix (your gain = opponent's loss):\n` +
      `        L      R\n` +
      `  T:   +3     -1\n` +
      `  B:   -2     +4\n` +
      `There is no pure-strategy saddle point. Find your optimal mixed strategy, the opponent's, and the value of the game.`,
    answer:
      `Play T with probability 3/5 and B with 2/5. Opponent plays L with probability 1/2 and R with 1/2. The value of the game to you is +1 (you secure an expected payoff of 1 regardless of the opponent's choice).`,
    solution:
      `First confirm no saddle: row minima are T: min(3,−1) = −1, B: min(−2,4) = −2; maximin = −1. Column maxima L: max(3,−2) = 3, R: max(−1,4) = 4; minimax = 3. Since maximin (−1) ≠ minimax (3), no pure saddle — solve for mixed.\n` +
      `Let row player play T w.p. q, B w.p. 1−q. Make the opponent indifferent between L and R (so they can't exploit you):\n` +
      `Payoff to you if opp plays L: 3q + (−2)(1 − q) = 5q − 2.\n` +
      `Payoff to you if opp plays R: (−1)q + 4(1 − q) = 4 − 5q.\n` +
      `Set equal: 5q − 2 = 4 − 5q ⇒ 10q = 6 ⇒ q = 3/5. Then value V = 5(3/5) − 2 = 3 − 2 = 1.\n` +
      `Now opponent's mixing: let opp play L w.p. r. Make ROW indifferent between T and B:\n` +
      `Row payoff from T: 3r + (−1)(1 − r) = 4r − 1.\n` +
      `Row payoff from B: (−2)r + 4(1 − r) = 4 − 6r.\n` +
      `Set equal: 4r − 1 = 4 − 6r ⇒ 10r = 5 ⇒ r = 1/2.\n` +
      `So row plays (3/5, 2/5), column plays (1/2, 1/2), value = +1.\n` +
      `Why optimal (minimax theorem): by mixing T:B = 3:5... = 3/5:2/5, you guarantee expected 1 no matter what the opponent does, so you can't do worse than 1. By mixing L:R = 1:1 the opponent holds you to exactly 1, so you can't do better. These bound the value from both sides at 1 — the Nash equilibrium of the zero-sum game. Each side mixes precisely to make the other indifferent, which is what makes the strategy unexploitable.`,
  },
  {
    id: "game-uniform-stopping",
    category: "Game Theory & Trading",
    difficulty: "Hard",
    question:
      `I reveal up to three independent Uniform[0,1] draws, one at a time. After seeing each draw you may STOP and take that value as your payoff, or PASS to see the next draw. If you pass the first two you are forced to take the third. You want to maximize the expected value you walk away with. What is the optimal stopping rule, and what is the expected payoff under optimal play?`,
    answer:
      `Backward-induction threshold rule. With one draw left the value is 1/2 (you must accept). With two draws left, accept the current draw iff it exceeds 1/2, giving value 5/8. With three draws left, accept the first draw iff it exceeds 5/8. So: accept draw 1 iff ≥ 5/8, accept draw 2 iff ≥ 1/2, always accept draw 3. Expected payoff under optimal play = 89/128 = 0.6953125 ≈ 0.695.`,
    solution:
      `Solve by backward induction on the number of draws remaining; let Vₖ be the expected payoff of optimal play with k draws still available, and the optimal rule is 'accept the current draw x iff x ≥ (the continuation value of the remaining draws).'\n` +
      `k = 1 (last draw): you must take it. V₁ = E[Uniform] = 1/2.\n` +
      `k = 2: threshold equals the continuation value V₁ = 1/2. See x ~ U[0,1]. If x ≥ 1/2 (prob 1/2) stop, taking x with E[x | x≥1/2] = 3/4. If x < 1/2 (prob 1/2) pass and get V₁ = 1/2.\n` +
      `V₂ = P(x≥1/2)·E[x|x≥1/2] + P(x<1/2)·V₁ = (1/2)(3/4) + (1/2)(1/2) = 3/8 + 1/4 = 5/8 = 0.625.\n` +
      `k = 3: threshold equals continuation value V₂ = 5/8. See x. If x ≥ 5/8 (prob 3/8) stop, taking E[x | x ≥ 5/8] = (5/8 + 1)/2 = 13/16. If x < 5/8 (prob 5/8) pass and get V₂ = 5/8.\n` +
      `V₃ = P(x≥5/8)·E[x|x≥5/8] + P(x<5/8)·V₂ = (3/8)(13/16) + (5/8)(5/8) = 39/128 + 25/64 = 39/128 + 50/128 = 89/128 = 0.6953125.\n` +
      `So the optimal rule is the threshold sequence: accept on the first draw iff x ≥ 5/8, accept on the second iff x ≥ 1/2, and accept whatever the third shows. Expected payoff ≈ 0.695.\n` +
      `Why optimal: at each stage you face a clean stop-or-continue choice; the value of continuing is exactly the optimal expected payoff of the remaining draws (Vₖ), which is a known constant by backward induction. Accepting iff the current draw beats that constant is the optimal stopping rule (it maximizes E[payoff] at every node, so by the optimality principle it's globally optimal). The thresholds rise as more draws remain (1/2 → 5/8) because with more options ahead you can afford to be pickier. This is the same secretary/optimal-stopping logic desks use for 'how good a fill do I demand before I lift the next quote.'`,
  },
  {
    id: "game-no-arbitrage-pricing",
    category: "Game Theory & Trading",
    difficulty: "Medium",
    question:
      `A stock trades at $100. In one period it goes up to $110 or down to $90 (you don't know real-world probabilities). The risk-free rate is 0% per period. Price a European call option struck at $100 (it pays max(S − 100, 0) at expiry) using no-arbitrage. What's the fair price, and why don't the real probabilities matter?`,
    answer:
      `Fair price = $5. Build a replicating portfolio (delta = 1/2 share, borrow $45) or use risk-neutral probabilities: the risk-neutral chance of an up-move is q = (100 − 90)/(110 − 90) = 1/2, so call value = q·10 + (1−q)·0 = $5. Real-world probabilities are irrelevant because the option is exactly replicable; any other price allows arbitrage.`,
    solution:
      `One-period binomial, no-arbitrage. Up payoff of the call: max(110 − 100, 0) = 10. Down payoff: max(90 − 100, 0) = 0.\n` +
      `Replication: hold Δ shares plus B dollars of bonds so the portfolio matches the call in both states.\n` +
      `Up: 110Δ + B = 10. Down: 90Δ + B = 0. Subtract: 20Δ = 10 ⇒ Δ = 1/2. Then B = −90·(1/2) = −45 (borrow $45).\n` +
      `Cost of this portfolio today = 100Δ + B = 100·(1/2) − 45 = 50 − 45 = $5. Since the portfolio pays exactly the call's payoff in every state, by no-arbitrage the call must cost $5 today.\n` +
      `Risk-neutral check: find q such that the stock is a fair (martingale) bet at 0% rate: 100 = q·110 + (1−q)·90 ⇒ 100 = 90 + 20q ⇒ q = 1/2. Price any claim as its q-expected payoff discounted at the risk-free rate: call = [q·10 + (1−q)·0]/1 = 5.\n` +
      `Why real probabilities don't matter: because the payoff is perfectly hedgeable with stock and bonds, the price is pinned by replication cost alone. If the market quoted the call at, say, $7, you'd sell the call for $7, buy the $5 replicating portfolio, pocket $2 risk-free, and the hedge covers all payoffs — pure arbitrage. The 'true' up-probability only affects expected profit of an unhedged speculator, not the arbitrage-free price. This is the foundational insight of derivatives pricing: hedge, then price by the cost of the hedge.`,
  },
  {
    id: "game-poker-bluff-ev",
    category: "Game Theory & Trading",
    difficulty: "Hard",
    question:
      `Heads-up simplified poker. The pot is $P. You are last to act on the river holding a busted hand (you will lose at showdown). You can either check (and lose, gaining 0) or bluff-bet $B. If you bet, your opponent calls with probability c and folds with probability 1−c. From the opponent's side: facing your bet, what calling frequency c makes them indifferent to your bluffing, and at that equilibrium, can bluffing be profitable for you? Also: what bluff frequency should YOU use to make THEM indifferent between calling and folding when you sometimes hold the nuts?`,
    answer:
      `Convention: the pot is $P before your bet; you bet $B; if called, you risk $B to win the $P pot. (1) The opponent's GTO call frequency that makes a pure bluff break even is c = P/(P+B); they fold the rest, α = B/(P+B). (2) Your GTO bluff fraction of your betting range, which makes the opponent indifferent between calling and folding, is f = B/(P+2B). For a pot-sized bet (B = P): opponent calls 1/2 (folds 1/2), and your range is 1/3 bluffs to 2/3 value (bluff:value = 1:2). At equilibrium a pure bluff is exactly break-even; it's only +EV when the opponent over-folds.`,
    solution:
      `Two separate indifference conditions in this classic toy poker model. Keep the convention fixed: pot $P sits before your bet, you bet $B, and a caller risks $B to win the $P pot.\n` +
      `(1) What call frequency makes YOUR bluff break even? If the opponent calls with probability c: when they fold (prob 1−c) you win the pot P; when they call (prob c) you lose your bet B (you lose at showdown anyway, so B is the marginal cost of betting vs. checking).\n` +
      `EV(bluff) − EV(check) = (1−c)·P + c·(−B) = P − c(P + B). Set to 0 ⇒ c* = P/(P + B). So the opponent must call with probability P/(P+B) and fold the complement α = B/(P+B). You PROFIT from bluffing iff they fold more than α = B/(P+B). For a pot-sized bet B = P: c* = P/2P = 1/2, fold 1/2.\n` +
      `(2) What bluff fraction makes the OPPONENT indifferent between calling and folding, given your range mixes value (nuts) and bluffs? Folding nets the caller 0. Let f be the fraction of your betting range that is bluffs. If the opponent CALLS: against a bluff (prob f) they win the pot plus your bet, +(P + B); against value (prob 1−f) they lose their call, −B.\n` +
      `Call EV = f·(P + B) − (1 − f)·B. Set equal to folding (0): f(P + B) = (1 − f)B ⇒ f(P + B) + fB = B ⇒ f(P + 2B) = B ⇒ f = B/(P + 2B).\n` +
      `For a pot-sized bet B = P: f = P/(3P) = 1/3, so bluffs are 1/3 of your bets and value 2/3 — the famous 1:2 bluff-to-value ratio.\n` +
      `Why this is the equilibrium: condition (2) makes the opponent indifferent to calling, so they can't exploit you by adjusting their call frequency; condition (1) makes you indifferent to bluffing any given busted hand, so you can't be exploited either. Both sides mixing to make the other indifferent is the Nash equilibrium of the betting subgame. Deviations are punished: if the opponent calls less than P/(P+B), pure bluffs become +EV and you should bluff every busted hand; if they call more, you should drop bluffs and only value-bet. The interview one-liners: GTO call frequency = pot odds = P/(P+B); GTO bluff fraction = B/(P+2B); pot-sized bet ⇒ call half, bluff:value = 1:2.`,
  },
  {
    id: "game-should-you-take-bet",
    category: "Game Theory & Trading",
    difficulty: "Medium",
    question:
      `I offer you a single bet: flip a fair coin; heads you win $150, tails you lose $100. The EV is clearly positive. But suppose your entire net worth is $200 and you have a logarithmic utility of wealth, u(W) = ln(W). Should you take the bet? And how does the answer change if instead this is one of 1000 independent identical bets you can take, each scaled to $1.50 win / $1.00 loss?`,
    answer:
      `Single large bet: EV = +$25, but with log utility on $200 wealth, expected utility = ½ln(350) + ½ln(100) ≈ 5.226 vs ln(200) ≈ 5.298 — DECLINE, the gamble lowers expected utility despite positive EV (risk of dropping to $100 hurts too much). Scaled small bets: each $1.50/$1.00 bet at this wealth is trivially +utility, and 1000 independent ones have negligible relative risk (SD scales as √1000), so TAKE them — the law of large numbers turns the edge into near-certain gain.`,
    solution:
      `EV is positive in both framings: ½(150) + ½(−100) = +$25 for the big bet; ½(1.50) + ½(−1.00) = +$0.25 per small bet, $250 over 1000. But a risk-averse (concave-utility) agent maximizes E[u(W)], not E[W].\n` +
      `Big bet, log utility, W₀ = 200: E[u] = ½·ln(200 + 150) + ½·ln(200 − 100) = ½·ln(350) + ½·ln(100) = ½(5.8579) + ½(4.6052) = 2.9290 + 2.3026 = 5.2315. Compare u(no bet) = ln(200) = 5.2983. Since 5.2315 < 5.2983, expected utility FALLS — decline. Intuition: log utility punishes the 50% chance of halving your wealth to $100 more than it rewards the 75% gain to $350. (Equivalently, the bet is too large relative to bankroll; Kelly would size it far smaller.)\n` +
      `Now 1000 independent small bets ($1.50 / $1.00), W₀ = 200: each bet is tiny relative to wealth, so locally utility is ~linear and EV dominates — each is +utility. Total profit over 1000 i.i.d. bets has mean +$250 and SD = √1000 · SD(one) = 31.6 · $1.25 ≈ $39.5. So you're overwhelmingly likely to finish well ahead (mean +$250 vs SD ~$40; probability of a net loss is essentially 0 by the CLT). Risk-adjusted, this is a clear TAKE.\n` +
      `The lesson (core to trading): positive EV alone doesn't justify a bet — SIZE relative to bankroll and the curvature of your utility matter. A single oversized +EV bet can be utility-destroying, while many small uncorrelated +EV bets are nearly free money because diversification kills the relative variance. This is exactly why desks scale positions to risk limits and prize many small independent edges over one big swing.`,
  },
];
