import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { usePoolState } from "./hooks/usePoolState";
import { LandingScreen } from "./screens/LandingScreen";
import { OpenPoolsScreen } from "./screens/OpenPoolsScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { QuestionScreen } from "./screens/QuestionScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { createRound, createSoloSession } from "./lib/poolActions";
import { SESSION_STORAGE_KEY } from "./constants";
import type { Session } from "./types";

type Stage =
  | { kind: "landing" }
  | { kind: "pool-browse"; name: string; openingCm: number }
  | { kind: "in-session"; session: Session };

export default function App() {
  const [stage, setStage] = useState<Stage>({ kind: "landing" });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A saved in-progress pool game survives a refresh; solo games and the
  // browse screen are transient and always start fresh.
  useEffect(() => {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      try {
        setStage({ kind: "in-session", session: JSON.parse(raw) });
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  function enterSession(session: Session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    setStage({ kind: "in-session", session });
  }

  function handleLeave() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setStage({ kind: "landing" });
  }

  async function handleChoose(name: string, mode: "solo" | "pool", openingCm: number) {
    setError(null);
    if (mode === "pool") {
      setStage({ kind: "pool-browse", name, openingCm });
      return;
    }
    try {
      enterSession(await createSoloSession(name, openingCm));
    } catch (e: any) {
      setError(e.message ?? "Could not start a solo game.");
    }
  }

  if (!loaded) return null;

  if (stage.kind === "landing") {
    return <LandingScreen onChoose={handleChoose} error={error} />;
  }

  if (stage.kind === "pool-browse") {
    return (
      <OpenPoolsScreen
        displayName={stage.name}
        openingCm={stage.openingCm}
        onEntered={enterSession}
        onBack={() => setStage({ kind: "landing" })}
      />
    );
  }

  return <GameShell session={stage.session} onLeave={handleLeave} />;
}

function GameShell({ session, onLeave }: { session: Session; onLeave: () => void }) {
  const { pool, players, rounds, currentRound, hostPlayerId, setPool, refetchRounds } =
    usePoolState(session.pool);
  const isHost = hostPlayerId === session.player.id;
  const isSolo = pool.max_players === 1;
  const askedQuestionIds = rounds.map((r) => r.question_id);

  async function startGame() {
    if (rounds.length === 0) {
      await createRound(pool.id, 1, askedQuestionIds);
      await refetchRounds();
    }
    const { data } = await supabase
      .from("pools")
      .update({ status: "active" })
      .eq("id", pool.id)
      .select()
      .single();
    if (data) setPool(data as typeof pool);
  }

  async function advanceRound() {
    if (!currentRound) return;
    await createRound(pool.id, currentRound.round_number + 1, askedQuestionIds);
    await refetchRounds();
  }

  async function finishGame() {
    const { data } = await supabase
      .from("pools")
      .update({ status: "finished" })
      .eq("id", pool.id)
      .select()
      .single();
    if (data) setPool(data as typeof pool);
  }

  // Our own opening height lives on the saved session; prefer it so this
  // player's screens work even if the database column isn't there yet.
  const me = {
    ...session.player,
    opening_height_cm:
      session.player.opening_height_cm ??
      players.find((p) => p.id === session.player.id)?.opening_height_cm,
  };
  const playersWithMe = players.map((p) => (p.id === me.id ? { ...p, opening_height_cm: me.opening_height_cm } : p));

  if (pool.status === "waiting") {
    return (
      <LobbyScreen
        pool={pool}
        players={playersWithMe}
        meId={me.id}
        isHost={isHost}
        onStart={startGame}
      />
    );
  }

  if (pool.status === "active" && currentRound) {
    return (
      <QuestionScreen
        poolId={pool.id}
        round={currentRound}
        player={me}
        isHost={isHost}
        isSolo={isSolo}
        playerCount={players.length}
        onAdvance={advanceRound}
        onFinish={finishGame}
      />
    );
  }

  if (pool.status === "finished") {
    return (
      <LeaderboardScreen
        poolId={pool.id}
        poolCode={pool.code}
        players={playersWithMe}
        meId={me.id}
        isSolo={isSolo}
        onPlayAgain={onLeave}
      />
    );
  }

  return (
    <div className="app" style={{ justifyContent: "center", alignItems: "center" }}>
      <p className="label">Setting the bar&hellip;</p>
    </div>
  );
}
