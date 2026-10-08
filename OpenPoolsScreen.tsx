import { useState } from "react";
import { useOpenPools } from "../hooks/useOpenPools";
import { createPool, joinPoolById } from "../lib/poolActions";
import { POOL_TIERS } from "../constants";
import { fmtHeight } from "../lib/height";
import { Frame } from "../components/Frame";
import type { Session } from "../types";

interface OpenPoolsScreenProps {
  displayName: string;
  openingCm: number;
  onEntered: (session: Session) => void;
  onBack: () => void;
}

function tierLabel(maxPlayers: number) {
  return POOL_TIERS.find((t) => t.maxPlayers === maxPlayers)?.label ?? `${maxPlayers} players`;
}

export function OpenPoolsScreen({ displayName, openingCm, onEntered, onBack }: OpenPoolsScreenProps) {
  const { pools } = useOpenPools();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(maxPlayers: number) {
    setBusy(true);
    setError(null);
    try {
      onEntered(await createPool(displayName, maxPlayers, openingCm));
    } catch (e: any) {
      setError(e.message ?? "Could not create a pool. Try again.");
      setBusy(false);
    }
  }

  async function handleJoin(poolId: string) {
    setBusy(true);
    setError(null);
    try {
      onEntered(await joinPoolById(poolId, displayName, openingCm));
    } catch (e: any) {
      setError(e.message ?? "Could not join that pool. Pick another or start one.");
      setBusy(false);
    }
  }

  return (
    <Frame
      right={
        <>
          <b>{displayName}</b> · opens {fmtHeight(openingCm)}
        </>
      }
    >
      <div>
        <p className="kicker">Pool play</p>
        <h1 className="title title-l" style={{ marginTop: 8 }}>
          Pick your
          <br />
          <span className="outline">Flight</span>
        </h1>
      </div>

      <section style={{ display: "grid", gap: 10 }}>
        <p className="label">Join a pool · {pools.length} waiting</p>
        {pools.length === 0 ? (
          <p className="dim" style={{ fontSize: 14 }}>
            No pools are waiting right now. Start one below and share the code.
          </p>
        ) : (
          <div className="list">
            {pools.map((p) => (
              <button key={p.id} className="list-row" disabled={busy} onClick={() => handleJoin(p.id)}>
                <span>{tierLabel(p.max_players)}</span>
                <span className="meta">
                  {p.player_count}/{p.max_players} in · Join →
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section style={{ display: "grid", gap: 10 }}>
        <p className="label">Start a new pool</p>
        <div className="tier-grid">
          {POOL_TIERS.map((tier) => (
            <button
              key={tier.maxPlayers}
              className="tier-btn"
              disabled={busy}
              onClick={() => handleCreate(tier.maxPlayers)}
            >
              <span>{tier.label}</span>
              <span>Start →</span>
            </button>
          ))}
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}

      <button className="btn-link" style={{ marginTop: "auto" }} onClick={onBack} disabled={busy}>
        ← Back
      </button>
    </Frame>
  );
}
