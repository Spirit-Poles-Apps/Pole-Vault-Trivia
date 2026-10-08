export const TOTAL_ROUNDS = 8;
export const ROUND_DURATION_SECONDS = 10;
export const SESSION_STORAGE_KEY = "trivia_session";

export const SOLO_MAX_PLAYERS = 1;

export const POOL_TIERS: { label: string; maxPlayers: number }[] = [
  { label: "Duel (2 players)", maxPlayers: 2 },
  { label: "Small group (3-4)", maxPlayers: 4 },
  { label: "Large group (5-6)", maxPlayers: 6 },
];

// Host can start once this many players are in, even if the pool isn't
// full yet -- capped by the pool's actual size for small tiers like Duel.
export function minPlayersToStart(maxPlayers: number) {
  return Math.min(maxPlayers, 3);
}

// ---- Opening height ("Night Final" rules) ----
// Every player picks their own opening height. Each right answer is a clear
// and raises their bar by BAR_RAISE_CM; a wrong answer is a miss and the bar
// stays. Points (not height) decide the standings.
export const OPENING_MIN_CM = 150;
export const OPENING_MAX_CM = 530;
export const OPENING_STEP_CM = 5;
export const OPENING_DEFAULT_CM = 240;
export const BAR_RAISE_CM = 15;
export const OPENING_STORAGE_KEY = "trivia_opening_cm";

export const OPENING_PRESETS: { label: string; cm: number }[] = [
  { label: "First-timer", cm: 150 },
  { label: "High school", cm: 300 },
  { label: "College", cm: 450 },
  { label: "Elite", cm: 530 },
];
