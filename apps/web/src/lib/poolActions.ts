import { supabase } from "../supabaseClient";
import { ROUND_DURATION_SECONDS } from "../constants";
import type { Player, Pool, Session } from "../types";

/**
 * Add a player to a pool with their opening height.
 *
 * If the database hasn't had migration 0004 applied yet (no
 * opening_height_cm column), retry without it so joining never breaks.
 * The height is still kept on the local session, so this player's own
 * screens work; other players just won't see it in the standings.
 */
async function insertPlayer(poolId: string, displayName: string, openingCm: number) {
  const first = await supabase
    .from("players")
    .insert({ pool_id: poolId, display_name: displayName, opening_height_cm: openingCm })
    .select()
    .single();

  const missingColumn =
    first.error &&
    (first.error.code === "PGRST204" ||
      first.error.code === "42703" ||
      /opening_height_cm/.test(first.error.message ?? ""));

  const result = missingColumn
    ? await supabase
        .from("players")
        .insert({ pool_id: poolId, display_name: displayName })
        .select()
        .single()
    : first;

  if (result.data) {
    result.data = { ...result.data, opening_height_cm: openingCm };
  }
  return result;
}

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createPool(
  displayName: string,
  maxPlayers: number,
  openingCm: number
): Promise<Session> {
  const { data: pool, error: poolErr } = await supabase
    .from("pools")
    .insert({ code: randomCode(), name: "Pole Vault Trivia", max_players: maxPlayers })
    .select()
    .single();
  if (poolErr || !pool) throw poolErr ?? new Error("Could not create pool");

  const { data: player, error: playerErr } = await insertPlayer(pool.id, displayName, openingCm);
  if (playerErr || !player) throw playerErr ?? new Error("Could not join pool");

  return { pool: pool as Pool, player: player as Player };
}

export async function joinPoolById(
  poolId: string,
  displayName: string,
  openingCm: number
): Promise<Session> {
  const { data: pool, error: poolErr } = await supabase
    .from("pools")
    .select("*")
    .eq("id", poolId)
    .single();
  if (poolErr || !pool) throw new Error("That pool isn't available anymore.");

  const { data: player, error: playerErr } = await insertPlayer(pool.id, displayName, openingCm);
  if (playerErr || !player) {
    throw new Error(
      playerErr?.message.includes("unique")
        ? "That name is already taken in this pool."
        : "Could not join pool -- it may have just filled up."
    );
  }

  return { pool: pool as Pool, player: player as Player };
}

export async function joinPoolByCode(
  code: string,
  displayName: string,
  openingCm: number
): Promise<Session> {
  const { data: pool, error: poolErr } = await supabase
    .from("pools")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single();
  if (poolErr || !pool) throw new Error("No pool found with that code.");
  return joinPoolById(pool.id, displayName, openingCm);
}

export async function pickNextQuestionId(excludeIds: string[] = []): Promise<string> {
  const { data, error } = await supabase.from("questions_public").select("id");
  if (error || !data || data.length === 0) throw new Error("No questions available.");
  const remaining = data.filter((q) => !excludeIds.includes(q.id));
  const pool = remaining.length > 0 ? remaining : data; // recycle if pool runs out
  return pool[Math.floor(Math.random() * pool.length)].id;
}

/** Solo practice: a pool sized for one player that starts itself immediately. */
export async function createSoloSession(displayName: string, openingCm: number): Promise<Session> {
  const session = await createPool(displayName, 1, openingCm);
  const questionId = await pickNextQuestionId();

  const endsAt = new Date(Date.now() + ROUND_DURATION_SECONDS * 1000).toISOString();
  await supabase.from("rounds").insert({
    pool_id: session.pool.id,
    question_id: questionId,
    round_number: 1,
    ends_at: endsAt,
  });
  await supabase.from("pools").update({ status: "active" }).eq("id", session.pool.id);

  return session;
}
