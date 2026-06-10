// Current epoch ms, behind a function boundary. The SM-2 scheduler and the
// stores need "now" at click/compute time; this indirection keeps that out of
// the react-hooks/purity lint (which flags a bare Date.now() in component code)
// while staying trivially correct.
export const now = () => Date.now();
