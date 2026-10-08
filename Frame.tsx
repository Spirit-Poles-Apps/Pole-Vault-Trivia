import type { ReactNode } from "react";

interface FrameProps {
  /** Left side of the broadcast bug, e.g. "Live" or "Final". */
  badge?: string;
  /** Stop the blinking dot (for finished games). */
  still?: boolean;
  /** Right side of the bug. */
  right?: ReactNode;
  ticker?: boolean;
  children: ReactNode;
}

const TICKER_ITEMS = [
  "UCS Spirit",
  "Vaulting poles since 1987",
  "Aerospace-grade fiberglass",
  "National Pole Vault Summit",
  "Reno, Nevada",
  "Fly high",
];

/** Shared screen chrome: broadcast bug on top, optional fact ticker below. */
export function Frame({ badge = "Live", still, right, ticker, children }: FrameProps) {
  return (
    <div className="app">
      <header className="bug">
        <span className={still ? "live still" : "live"}>{badge}</span>
        <span>{right}</span>
      </header>
      <main className="app-body">{children}</main>
      {ticker && (
        <div className="ticker" aria-hidden="true">
          <span>
            {TICKER_ITEMS.map((t, i) => (
              <span key={t}>
                {i > 0 && <i>/</i>}
                {t}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
