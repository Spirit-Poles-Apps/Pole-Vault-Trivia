import {
  BAR_RAISE_CM,
  OPENING_MAX_CM,
  OPENING_MIN_CM,
  OPENING_PRESETS,
  OPENING_STEP_CM,
  TOTAL_ROUNDS,
} from "../constants";
import { fmtHeight } from "../lib/height";

interface HeightPickerProps {
  value: number;
  onChange: (cm: number) => void;
}

export function HeightPicker({ value, onChange }: HeightPickerProps) {
  const fill = ((value - OPENING_MIN_CM) / (OPENING_MAX_CM - OPENING_MIN_CM)) * 100;
  const perfect = value + TOTAL_ROUNDS * BAR_RAISE_CM;

  return (
    <div className="picker">
      <div className="picker-top">
        <label className="label" htmlFor="opening-height">
          Your opening height
        </label>
        <output className="picker-value" htmlFor="opening-height" aria-live="polite">
          {fmtHeight(value)}
          <small>m</small>
        </output>
      </div>

      <div className="ruler">
        <div className="ruler-ticks" />
        <input
          id="opening-height"
          type="range"
          min={OPENING_MIN_CM}
          max={OPENING_MAX_CM}
          step={OPENING_STEP_CM}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={`${fmtHeight(value)} metres`}
          style={{ ["--fill" as string]: `${fill}%` }}
        />
        <div className="ruler-ends">
          <span>{fmtHeight(OPENING_MIN_CM)}</span>
          <span>{fmtHeight(OPENING_MAX_CM)}</span>
        </div>
      </div>

      <div className="presets" role="group" aria-label="Quick picks">
        {OPENING_PRESETS.map((p) => (
          <button
            key={p.cm}
            type="button"
            aria-pressed={value === p.cm}
            onClick={() => onChange(p.cm)}
          >
            {p.label}
            <b>{fmtHeight(p.cm)}</b>
          </button>
        ))}
      </div>

      <p className="picker-note">
        A perfect game finishes at <b>{fmtHeight(perfect)} m</b>. Each right answer raises your
        bar {BAR_RAISE_CM} cm.
      </p>
    </div>
  );
}
