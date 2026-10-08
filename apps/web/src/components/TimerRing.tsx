interface TimerRingProps {
  secondsLeft: number;
  total: number;
}

const R = 26;
const C = 2 * Math.PI * R;

export function TimerRing({ secondsLeft, total }: TimerRingProps) {
  const frac = total > 0 ? Math.max(0, Math.min(1, secondsLeft / total)) : 0;
  const out = secondsLeft === 0;
  return (
    <div className={out ? "ring out" : "ring"} role="timer" aria-label={`${secondsLeft} seconds left`}>
      <svg viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={R} fill="none" stroke="rgba(246,243,236,.12)" strokeWidth="3" />
        <circle
          cx="30"
          cy="30"
          r={R}
          fill="none"
          stroke="#e4007c"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - frac)}
        />
      </svg>
      <span>0:{String(secondsLeft).padStart(2, "0")}</span>
    </div>
  );
}
