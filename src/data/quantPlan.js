// The Python-only quant-developer track (Weeks 8-13, days 50-91), appended to
// the original Foundations plan. Kept in a separate module so the big inline
// PLAN in studyTracker.jsx stays append-only and existing task ids are stable.
import { W8_9 } from "./quant/probStats.js";
import { W10_11 } from "./quant/codingSystems.js";
import { W12_13 } from "./quant/marketsMocks.js";

export const QUANT_PLAN = [...W8_9, ...W10_11, ...W12_13];

// Weeks that belong to the quant track (used for labelling / default open week).
export const QUANT_WEEKS = [8, 9, 10, 11, 12, 13];
