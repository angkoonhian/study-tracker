// Firm-tagged pointers into the existing Brainteasers / Mental Math practice
// (which lives in Flight Mode), plus a few NEW market-making math cards.
//
// This intentionally does NOT duplicate the existing teaser/mental-math bank —
// `byFirm` just maps firms to the emphases they screen for, and `cards` adds a
// small set of market-making-flavored EV cards not covered elsewhere.
//
// Card math has been worked out and double-checked by hand. Cards are
// reveal-style (question -> answer -> explanation), not auto-run.

export const QUANT_POINTERS = {
  note: "Probability, EV, and mental-math practice lives in Flight Mode → Brainteasers / Mental Math. These are the firm-relevant emphases.",
  byFirm: [
    {
      firm: "Optiver",
      focus: [
        "Fast mental arithmetic (e.g. 80 questions / 8 min)",
        "EV of simple games",
        "Market-making spread intuition",
        "Number-sequence / pattern recognition",
      ],
    },
    {
      firm: "Jane Street",
      focus: [
        "Conditional / Bayesian probability",
        "Combinatorics",
        "Fair-value / betting puzzles",
        "Estimation and tradeoff reasoning",
      ],
    },
    {
      firm: "SIG",
      focus: [
        "Expected value over most-likely-outcome",
        "Decision theory and bet sizing (poker mindset)",
        "Probability puzzles (Monty Hall-style)",
        "Information asymmetry under pressure",
      ],
    },
    {
      firm: "Akuna Capital",
      focus: [
        "Heavy mental math (80-in-8)",
        "Market-making / trading games",
        "Probability and statistics",
        "Basic derivatives intuition",
      ],
    },
    {
      firm: "Five Rings",
      focus: [
        "Fast-but-accurate math under a per-question timer",
        "Probability and stochastic processes",
        "Game theory",
        "Guesstimation",
      ],
    },
    {
      firm: "IMC",
      focus: [
        "Probability and EV (trading track)",
        "Market-making exercises",
        "Algorithms / data structures (SWE)",
        "Group problem-solving",
      ],
    },
    {
      firm: "Jane Street / SIG / Optiver",
      focus: [
        "Risk-neutral / fair-value pricing of simple bets",
        "Variance and risk of a position",
        "Spread and edge intuition",
      ],
    },
    {
      firm: "Citadel Securities",
      focus: [
        "Probability and EV reasoning",
        "Fast, correct quantitative estimation",
        "Statistics fundamentals",
      ],
    },
    {
      firm: "Two Sigma",
      focus: [
        "Probability and statistics",
        "Estimation / data reasoning",
        "Quantitative problem-solving",
      ],
    },
  ],
  cards: [
    {
      id: "mm-ev-quote",
      concept: "EV of a market-making quote",
      firms: ["Optiver", "IMC"],
      source: "reconstructed from public reports",
      question:
        "You quote a two-sided market 99 @ 101 on a coin-flip asset worth 100 or 0 with equal probability (fair value 50). A counterparty lifts your offer (buys from you at 101). What is your expected profit on that trade?",
      answer: "+51 expected",
      explanation:
        "Asset EV = 0.5*100 + 0.5*0 = 50. You sold at 101, so expected profit = 101 - 50 = 51 per unit (before inventory/adverse-selection risk).",
    },
    {
      id: "mm-edge-on-bid",
      concept: "Edge when your bid is hit",
      firms: ["Optiver", "SIG", "IMC"],
      source: "reconstructed from public reports",
      question:
        "An asset has fair value 50. You quote 48 @ 52. A counterparty hits your bid (sells to you at 48). What is your expected edge per unit, and what direction is your inventory?",
      answer: "+2 edge, now long 1 unit",
      explanation:
        "You bought at 48 versus fair value 50, so expected edge = 50 - 48 = +2 per unit. Buying leaves you long, so you now carry inventory risk if the fair value moves against you.",
    },
    {
      id: "ev-fair-die",
      concept: "EV of a single fair die",
      firms: ["Akuna Capital", "Five Rings", "Optiver"],
      source: "classic trading-game warmup",
      question: "What is the expected value of one roll of a fair six-sided die?",
      answer: "3.5",
      explanation:
        "EV = (1 + 2 + 3 + 4 + 5 + 6) / 6 = 21 / 6 = 3.5. The fair price to pay to play a game that pays you the face value is 3.5.",
    },
    {
      id: "ev-reroll-die",
      concept: "EV with one optional re-roll",
      firms: ["Jane Street", "SIG", "Five Rings"],
      source: "reconstructed from public reports",
      question:
        "You roll a fair die. You may keep the value, or re-roll once and must take the second value. Playing optimally, what is the EV?",
      answer: "4.25",
      explanation:
        "Re-roll whenever the first roll is below the EV of a fresh roll (3.5), i.e. on 1, 2, or 3; keep 4, 5, 6. EV = P(keep)*avg(4,5,6) + P(reroll)*3.5 = (1/2)*5 + (1/2)*3.5 = 2.5 + 1.75 = 4.25.",
    },
    {
      id: "ev-two-dice-sum",
      concept: "EV and variance of a sum",
      firms: ["Jane Street", "Citadel Securities", "Two Sigma"],
      source: "classic probability question",
      question:
        "Two fair dice are rolled. What are the expected value and the variance of their sum?",
      answer: "EV = 7, Variance = 35/6 ≈ 5.83",
      explanation:
        "EV adds: 3.5 + 3.5 = 7. For one die, Var = E[X^2] - (E[X])^2 = 91/6 - (3.5)^2 = 91/6 - 12.25 = 35/12. Dice are independent, so variance of the sum adds: 35/12 + 35/12 = 35/6 ≈ 5.83.",
    },
    {
      id: "risk-neutral-fair-value",
      concept: "Risk-neutral fair value of a binary",
      firms: ["Optiver", "IMC", "SIG"],
      source: "reconstructed from public reports",
      question:
        "A binary asset pays 100 if an event happens (probability 30%) and 0 otherwise. What is its risk-neutral fair value, and where would you center a tight two-sided quote?",
      answer: "Fair value 30; quote around 30 (e.g. 29 @ 31)",
      explanation:
        "Fair value = 0.30*100 + 0.70*0 = 30. A market maker centers the quote on fair value and earns the half-spread on each side, e.g. buy at 29 / sell at 31.",
    },
    {
      id: "ev-pay-to-flip",
      concept: "Net EV of a pay-to-play game",
      firms: ["Akuna Capital", "Optiver", "Five Rings"],
      source: "classic trading-game question",
      question:
        "A game pays you 10 on heads and 0 on tails of a fair coin. It costs 4 to play. What is your net EV, and what is the fair (break-even) price?",
      answer: "Net EV = +1; fair price = 5",
      explanation:
        "Gross EV = 0.5*10 + 0.5*0 = 5. At a cost of 4, net EV = 5 - 4 = +1, so you should play. The break-even price is 5; pay less than 5 for positive edge.",
    },
    {
      id: "kelly-even-money",
      concept: "Kelly fraction for an even-money bet",
      firms: ["SIG", "Jane Street", "Five Rings"],
      source: "reconstructed from public reports",
      question:
        "You can repeatedly make an even-money bet (win 1 for each 1 staked) that you win with probability 60%. What fraction of your bankroll does the Kelly criterion say to bet?",
      answer: "20% of bankroll",
      explanation:
        "Kelly fraction f = (b*p - q) / b with net odds b = 1, p = 0.6, q = 0.4: f = (1*0.6 - 0.4) / 1 = 0.2. For even-money bets this simplifies to 2p - 1 = 0.2, i.e. bet 20% of bankroll to maximize long-run log growth.",
    },
    {
      id: "ev-insurance",
      concept: "EV of writing insurance",
      firms: ["SIG", "Citadel Securities", "Optiver"],
      source: "classic EV / risk question",
      question:
        "You write a policy that pays out 10,000 if an event occurs (probability 1%) and 0 otherwise. You charge a premium of 120. What is your expected profit per policy?",
      answer: "+20 per policy",
      explanation:
        "Expected payout = 0.01*10,000 = 100. Expected profit = premium - expected payout = 120 - 100 = 20. The break-even (pure) premium is 100; the extra 20 is your loading/edge (before variance/tail risk).",
    },
    {
      id: "ev-adverse-selection",
      concept: "Adverse selection vs. naive edge",
      firms: ["Jane Street", "Citadel Securities", "Optiver"],
      source: "reconstructed from public reports",
      question:
        "You quote a tight market on an asset with fair value 100. Suppose informed traders only trade when the true value differs from 100 by 5 in their favor. Why can a quote with apparent positive half-spread edge still lose money?",
      answer: "Adverse selection can exceed the spread",
      explanation:
        "If you earn, say, +1 half-spread per trade but the trades you get filled on are systematically against you by 5 (counterparties know more), your realized EV is 1 - 5 = -4 per fill. Naive spread edge ignores that fills are conditional on the other side having information; market makers widen quotes or skew to defend against this.",
    },
  ],
};
