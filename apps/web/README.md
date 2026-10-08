# Bar Exam — pole vault trivia (web)

React + Vite + TypeScript, talking directly to Supabase (no custom backend
needed — see `submit_answer()` in the Supabase migrations for how scoring
stays server-validated).

## Local setup

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + anon key
npm run dev
```

## How a game flows

1. **Join screen** — one player creates a pool (gets a 6-character code),
   others join with that code + a display name.
2. **Lobby** — whoever joined first is host (no separate roles table needed).
   Host taps "Start game," which inserts round 1 and flips the pool to `active`.
3. **Question screen** — every player sees the same question and a
   server-driven countdown (`rounds.ends_at`). Answers go through the
   `submit_answer` RPC, which scores server-side so no one can edit points
   in devtools. A live mini-leaderboard updates via Supabase Realtime.
4. **Host advances rounds** once the timer hits zero, up to `TOTAL_ROUNDS`
   (`src/constants.ts`), then finishes the game.
5. **Leaderboard screen** — final standings, "Play again" clears local
   session and returns to the join screen.`

## What's stubbed / next steps

- **Host disconnect isn't handled.** If the host closes their tab mid-game,
  no one else can advance rounds. Fine for a friends/team pool; add a
  "claim host" fallback if this matters for your use case.
- **No reconnect-mid-round polish** beyond localStorage session persistence
  — a refresh keeps you in the pool, but there's no "you already answered
  this round" UI state restore (the RPC will just reject the second answer).
- **Question images** — `questions_public.image_url` is in the schema but
  the UI doesn't render it yet, if you want visual questions later.
