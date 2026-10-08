// A player's O / X record for one pool, kept in this browser so the attempts
// card survives a refresh. Purely cosmetic: scoring lives in the database.
export type Mark = "O" | "X";

function key(poolId: string, playerId: string) {
  return `trivia_attempts:${poolId}:${playerId}`;
}

export function loadAttempts(poolId: string, playerId: string): Record<number, Mark> {
  try {
    const raw = localStorage.getItem(key(poolId, playerId));
    return raw ? (JSON.parse(raw) as Record<number, Mark>) : {};
  } catch {
    return {};
  }
}

export function saveAttempt(poolId: string, playerId: string, round: number, mark: Mark) {
  try {
    const all = loadAttempts(poolId, playerId);
    all[round] = mark;
    localStorage.setItem(key(poolId, playerId), JSON.stringify(all));
  } catch {
    /* storage blocked: the card just won't survive a refresh */
  }
}
