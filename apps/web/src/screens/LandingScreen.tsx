import { useState } from "react";
import { Frame } from "../components/Frame";
import { VaulterArt } from "../components/VaulterArt";
import { HeightPicker } from "../components/HeightPicker";
import { OPENING_DEFAULT_CM, OPENING_STORAGE_KEY } from "../constants";
import { clampOpening } from "../lib/height";

interface LandingScreenProps {
  onChoose: (name: string, mode: "solo" | "pool", openingCm: number) => void;
  error?: string | null;
}

function savedOpening(): number {
  try {
    const raw = localStorage.getItem(OPENING_STORAGE_KEY);
    return raw ? clampOpening(Number(raw)) : OPENING_DEFAULT_CM;
  } catch {
    return OPENING_DEFAULT_CM;
  }
}

export function LandingScreen({ onChoose, error: outerError }: LandingScreenProps) {
  const [name, setName] = useState("");
  const [opening, setOpening] = useState(savedOpening);
  const [error, setError] = useState<string | null>(null);

  function pickOpening(cm: number) {
    const v = clampOpening(cm);
    setOpening(v);
    try {
      localStorage.setItem(OPENING_STORAGE_KEY, String(v));
    } catch {
      /* fine without it */
    }
  }

  function handle(mode: "solo" | "pool") {
    if (!name.trim()) return setError("Enter your name to start.");
    setError(null);
    onChoose(name.trim(), mode, opening);
  }

  return (
    <Frame right={<><b>UCS Spirit</b> · Reno</>} ticker>
      <VaulterArt />
      <div>
        <p className="kicker">The pole vault trivia game</p>
        <h1 className="title title-xl" style={{ marginTop: 8 }}>
          Bar
          <br />
          <span className="outline">Exam</span>
        </h1>
      </div>

      <HeightPicker value={opening} onChange={pickOpening} />

      <div>
        <label htmlFor="player-name" className="label">
          Your name
        </label>
        <input
          id="player-name"
          className="text-field"
          type="text"
          placeholder="How you'll show on the board"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle("pool")}
          maxLength={24}
          autoComplete="nickname"
        />
        {(error || outerError) && (
          <p className="error-text" style={{ marginTop: 8 }}>
            {error || outerError}
          </p>
        )}
      </div>

      <div className="btn-row" style={{ marginTop: "auto" }}>
        <button className="btn btn-primary" onClick={() => handle("pool")}>
          Pool play
        </button>
        <button className="btn btn-ghost" onClick={() => handle("solo")}>
          Solo
        </button>
      </div>
    </Frame>
  );
}
