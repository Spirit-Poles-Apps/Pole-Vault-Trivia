import { useState } from "react";
import { minPlayersToStart } from "../constants";
import { fmtHeight } from "../lib/height";
import { Frame } from "../components/Frame";
import type { Player, Pool } from "../types";

interface LobbyScreenProps {
  pool: Pool;
  players: Player[];
  meId: string;
  isHost: boolean;
  onStart: () => Promise<void>;
}

export function LobbyScreen({ pool, players, meId, isHost, onStart }: LobbyScreenProps) {
  const [starting, setStarting] = useState(false);
  const minToStart = minPlayersToStart(pool.max_players);
  const canStart = players.length >= minToStart;

  return (
    <Frame right={<>Warm-up · <b>{players.length}/{pool.max_players}</b> in</>} ticker>
      <div>
        <p className="kicker">Waiting for the flight</p>
        <h1 className="title title-l" style={{ marginTop: 8 }}>
          On the
          <br />
          <span className="outline">Runway</span>
        </h1>
      </div>

      <div className="board" aria-label={`Pool code ${pool.code}`}>
        <span className="board-l">
          Pool
          <br />
          code
        </span>
        <span className="board-r">{pool.code}</span>
      </div>
      <p className="dim" style={{ fontSize: 13, marginTop: -6 }}>
        Friends can join this pool from Pool play on their phones.
      </p>

      <div className="list">
        {players.map((p, i) => (
          <div key={p.id} className="list-row">
            <span>
              {p.display_name}
              {i === 0 && <span className="tag">Host</span>}
              {p.id === meId && i !== 0 && <span className="tag">You</span>}
            </span>
            <span className="meta">
              {p.opening_height_cm ? `opens ${fmtHeight(p.opening_height_cm)} m` : ""}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
        {isHost ? (
          <>
            <button
              className="btn btn-primary btn-block"
              disabled={starting || !canStart}
              onClick={async () => {
                setStarting(true);
                await onStart();
                setStarting(false);
              }}
            >
              {starting ? "Starting…" : "Start the competition"}
            </button>
            {!canStart && (
              <p className="status-line">
                Need at least {minToStart} vaulters to start
              </p>
            )}
          </>
        ) : (
          <p className="status-line">Waiting for the host to start the competition…</p>
        )}
      </div>
    </Frame>
  );
}
