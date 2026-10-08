import { BAR_RAISE_CM, OPENING_MAX_CM, OPENING_MIN_CM, OPENING_STEP_CM } from "../constants";

/** 240 -> "2.40" */
export function fmtHeight(cm: number): string {
  return (cm / 100).toFixed(2);
}

/** Current bar for a player: opener plus one raise per clear. */
export function barHeight(openingCm: number, clears: number): number {
  return openingCm + clears * BAR_RAISE_CM;
}

/** Keep any stored or typed value on the legal 5 cm grid. */
export function clampOpening(cm: number): number {
  if (!Number.isFinite(cm)) return OPENING_MIN_CM;
  const snapped = Math.round(cm / OPENING_STEP_CM) * OPENING_STEP_CM;
  return Math.min(OPENING_MAX_CM, Math.max(OPENING_MIN_CM, snapped));
}

/** "1st", "2nd", "3rd", "4th" ... */
export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
