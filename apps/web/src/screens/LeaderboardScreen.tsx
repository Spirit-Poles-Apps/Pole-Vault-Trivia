import { useMemo } from "react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { Frame } from "../components/Frame";
import { TOTAL_ROUNDS } from "../constants";
import { barHeight, fmtHeight } from "../lib/height";
import type { LeaderboardRow, Player } from "../types";

interface LeaderboardScreenProps {
  poolId: string;
  poolCode: string;
  players: Player[];
  meId: string;
  isSolo: boolean;
  onPlayAgain: () => void;
}

export function LeaderboardScreen({ poolId, poolCode, players, meId, isSolo, onPlayAgain }: LeaderboardScreenProps) {
  const { rows } = useLeaderboard(poolId);
  const sorted = useMemo(
    () => [...rows].sort((a, b) => Number(b.total_points) - Number(a.total_points)),
    [rows]
  );
  const openers = useMemo(() => {
    const m = new Map<string, number | null | undefined>();
    players.forEach((p) => m.set(p.id, p.opening_height_cm));
    return m;
  }, [players]);

  function run(r: LeaderboardRow) {
    const open = openers.get(r.player_id);
    if (!open) return null;
    return (
      <>
        {fmtHeight(open)} → <b>{fmtHeight(barHeight(open, Number(r.correct_answers)))}</b>
      </>
    );
  }

  const top = [sorted[1], sorted[0], sorted[2]]; // podium order: 2, 1, 3
  const places = [2, 1, 3];

  return (
    <Frame
      badge="Final"
      still
      right={
        isSolo ? (
          "Solo"
        ) : (
          <>
            Pool <b>{poolCode}</b>
          </>
        )
      }
    >
      <h1 className="title title-l">
        Final
        <br />
        <span className="outline">Standings</span>
      </h1>

      {!isSolo && sorted.length > 1 && (
        <div className="podium">
          {top.map((r, i) => (
            <div key={i} className={`pd p${places[i]}${r ? "" : " empty"}`}>
              {r && Number(r.correct_answers) === TOTAL_ROUNDS && <span className="tag" style={{ margin: 0 }}>Perfect</span>}
              <span className="nm">{r?.display_name ?? "—"}</span>
              <span className="pts">{r ? Number(r.total_points).toLocaleString() : ""}</span>
              <span className="blk">{places[i]}</span>
            </div>
          ))}
        </div>
      )}

      <div className="standings">
        {sorted.map((r, i) => (
          <div key={r.player_id} className={r.player_id === meId ? "st-row me" : "st-row"}>
            <i>{i + 1}</i>
            <span className="nm">{r.display_name}</span>
            <span className="run">{run(r)}</span>
            <span className="pts">{Number(r.total_points).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <p className="rule-note">
        <b>Points win.</b> {Number(sorted.find((r) => r.player_id === meId)?.correct_answers ?? 0)} of{" "}
        {TOTAL_ROUNDS} clears for you. Heights show how far each vaulter climbed from their own opener.
      </p>

      <button className="btn btn-primary btn-block" style={{ marginTop: "auto" }} onClick={onPlayAgain}>
        Play again
      </button>
    </Frame>
  );
}
