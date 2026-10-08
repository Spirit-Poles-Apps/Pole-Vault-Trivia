import { BAR_RAISE_CM, TOTAL_ROUNDS } from "../constants";
import { fmtHeight } from "../lib/height";

interface HeightLadderProps {
  openingCm: number;
  clears: number;
}

/** Horizontal meter from the player's opener to a perfect-game finish. */
export function HeightLadder({ openingCm, clears }: HeightLadderProps) {
  const maxCm = openingCm + TOTAL_ROUNDS * BAR_RAISE_CM;
  const nowCm = openingCm + clears * BAR_RAISE_CM;
  const pct = Math.min(100, (clears / TOTAL_ROUNDS) * 100);
  const labelPct = Math.min(92, Math.max(8, pct));

  return (
    <div
      className="ladder"
      role="img"
      aria-label={`Bar at ${fmtHeight(nowCm)} metres. Opened at ${fmtHeight(openingCm)}, perfect finish ${fmtHeight(maxCm)}.`}
    >
      {[0, 25, 50, 75, 100].map((t) => (
        <span key={t} className="tk" style={{ left: t === 100 ? "calc(100% - 1px)" : `${t}%` }} />
      ))}
      <span className="bar" style={{ width: `${Math.max(pct, 2)}%` }} />
      <span className="now" style={{ left: `${labelPct}%` }}>
        {fmtHeight(nowCm)}
      </span>
      <span className="end" style={{ left: 0 }}>
        {fmtHeight(openingCm)} open
      </span>
      <span className="end" style={{ right: 0 }}>
        {fmtHeight(maxCm)} max
      </span>
    </div>
  );
}
