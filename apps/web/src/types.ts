export interface Pool {
  id: string;
  code: string;
  name: string;
  status: "waiting" | "active" | "finished";
  max_players: number;
  created_at: string;
}

export interface OpenPool {
  id: string;
  code: string;
  max_players: number;
  created_at: string;
  player_count: number;
}

export interface Player {
  id: string;
  pool_id: string;
  display_name: string;
  joined_at: string;
  /** Opening height in centimetres. Null for players who joined before the
   *  column existed, or if the database migration hasn't been applied yet. */
  opening_height_cm?: number | null;
}

export interface QuestionPublic {
  id: string;
  prompt: string;
  choices: string[];
  category: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  image_url: string | null;
}

export interface Round {
  id: string;
  pool_id: string;
  question_id: string;
  round_number: number;
  started_at: string;
  ends_at: string;
}

export interface LeaderboardRow {
  pool_id: string;
  player_id: string;
  display_name: string;
  total_points: number;
  correct_answers: number;
}

// Local session state, persisted to localStorage so a refresh doesn't
// kick a player out of an in-progress pool.
export interface Session {
  pool: Pool;
  player: Player;
}
