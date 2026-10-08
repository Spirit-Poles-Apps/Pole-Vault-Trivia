import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { Frame } from "../components/Frame";
import { TimerRing } from "../components/TimerRing";
import { HeightLadder } from "../components/HeightLadder";
import { BAR_RAISE_CM, OPENING_DEFAULT_CM, ROUND_DURATION_SECONDS, TOTAL_ROUNDS } from "../constants";
import { barHeight, fmtHeight, ordinal } from "../lib/height";
import { loadAttempts, saveAttempt, type Mark } from "../lib/attempts";
import type { Player, QuestionPublic, Round } from "../types";

interface QuestionScreenProps {
  poolId: string;
  round: Round;
  player: Player;
  isHost: boolean;
  isSolo: boolean;
  onAdvance: () => Promise<void>;
  onFinish: () => Promise<void>;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuestionScreen({
  poolId,
  round,
  player,
  isHost,
  isSolo,
  onAdvance,
  onFinish,
}: QuestionScreenProps) {
  const [question, setQuestion] = useState<QuestionPublic | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ is_correct: boolean; points_awarded: number } | null>(
    null
  );
  const [secondsLeft, setSecondsLeft] = useState(ROUND_DURATION_SECONDS);
  const [advancing, setAdvancing] = useState(false);
  const [marks, setMarks] = useState<Record<number, Mark>>(() => loadAttempts(poolId, player.id));
  const { rows } = useLeaderboard(poolId);

  const opening = player.opening_height_cm ?? OPENING_DEFAULT_CM;
  const ranked = useMemo(() => [...rows].sort((a, b) => b.total_points - a.total_points), [rows]);
  const meIndex = ranked.findIndex((r) => r.player_id === player.id);
  const me = meIndex >= 0 ? ranked[meIndex] : undefined;
  const clears = Number(me?.correct_answers ?? 0);
  const points = Number(me?.total_points ?? 0);

  // Load this round's question fresh each time round.id changes
  useEffect(() => {
    setSelected(null);
    setResult(null);
    setQuestion(null);
    supabase
      .from("questions_public")
      .select("*")
      .eq("id", round.question_id)
      .single()
      .then(({ data }) => setQuestion(data as QuestionPublic));
  }, [round.id, round.question_id]);

  // Countdown driven by the round's server timestamp, not local elapsed time
  useEffect(() => {
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((new Date(round.ends_at).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [round.ends_at]);

  function record(mark: Mark) {
    saveAttempt(poolId, player.id, round.round_number, mark);
    setMarks((m) => ({ ...m, [round.round_number]: mark }));
  }

  async function handleAnswer(choice: string) {
    if (selected || secondsLeft === 0) return;
    setSelected(choice);
    const { data, error } = await supabase.rpc("submit_answer", {
      p_round_id: round.id,
      p_player_id: player.id,
      p_choice: choice,
    });
    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : data;
      setResult(row);
      record(row.is_correct ? "O" : "X");
    }
  }

  const isLastRound = round.round_number >= TOTAL_ROUNDS;
  const roundOver = secondsLeft === 0;

  // Time ran out without an answer: that attempt is a miss.
  useEffect(() => {
    if (roundOver && !selected && marks[round.round_number] === undefined) record("X");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundOver, selected, round.round_number]);

  // Solo games have no one to click "Next" -- advance automatically
  // after a short pause so the player can see their result first.
  useEffect(() => {
    if (!isSolo || !roundOver || advancing) return;
    setAdvancing(true);
    const timer = setTimeout(async () => {
      if (isLastRound) await onFinish();
      else await onAdvance();
      setAdvancing(false);
    }, 1800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolo, roundOver, isLastRound]);

  // Attempt card: each round so far at the height it was jumped, then the next bar.
  const attempts = useMemo(() => {
    const out: { cm: number; mark: Mark | "–"; next?: boolean }[] = [];
    let h = opening;
    for (let r = 1; r <= round.round_number; r++) {
      const m = marks[r];
      if (r === round.round_number && !m) {
        out.push({ cm: h, mark: "–", next: true });
        return out.slice(-5);
      }
      out.push({ cm: h, mark: m ?? "X" });
      if (m === "O") h += BAR_RAISE_CM;
    }
    if (round.round_number < TOTAL_ROUNDS) out.push({ cm: h, mark: "–", next: true });
    return out.slice(-5);
  }, [marks, opening, round.round_number]);

  const bar = barHeight(opening, clears);

  return (
    <Frame
      right={
        <>
          Attempt <b>{round.round_number}</b> of {TOTAL_ROUNDS}
        </>
      }
    >
      <div className="q-meta">
        <div className="label">
          Your bar
          <span className="big">{fmtHeight(bar)} m</span>
        </div>
        <TimerRing secondsLeft={secondsLeft} total={ROUND_DURATION_SECONDS} />
      </div>

      <HeightLadder openingCm={opening} clears={clears} />

      <div className="lower">
        <p className="kicker">
          Q{round.round_number}
          {question?.category ? ` · ${question.category}` : ""}
        </p>
        <h1 className="q">{question?.prompt ?? "Setting the bar…"}</h1>
      </div>

      <div className="answers">
        {question?.choices.map((choice, i) => {
          const isPicked = selected === choice;
          let cls = "answer";
          let tag = "";
          if (isPicked && result) {
            cls += result.is_correct ? " clear" : " miss";
            tag = result.is_correct ? `Clear · +${BAR_RAISE_CM} cm` : "Miss";
          } else if (isPicked) {
            cls += " picked";
            tag = "Locking in…";
          } else if (selected || roundOver) {
            cls += " faded";
          }
          return (
            <button
              key={choice}
              className={cls}
              onClick={() => handleAnswer(choice)}
              disabled={!!selected || roundOver}
            >
              <i>{LETTERS[i]}</i>
              <span>{choice}</span>
              <em>{tag}</em>
            </button>
          );
        })}
      </div>

      {result && (
        <p className="status-line" aria-live="polite">
          {result.is_correct
            ? `+${result.points_awarded} points. Bar goes up to ${fmtHeight(bar)} m.`
            : `No clear this time. Your bar stays at ${fmtHeight(bar)} m.`}
        </p>
      )}
      {roundOver && !selected && <p className="status-line">Time's up. That attempt is a miss.</p>}
      {isSolo && roundOver && (
        <p className="status-line">{isLastRound ? "Tallying your competition…" : "Next attempt coming up…"}</p>
      )}

      {isHost && !isSolo && (
        <button
          className="btn btn-primary btn-block"
          disabled={!roundOver || advancing}
          onClick={async () => {
            setAdvancing(true);
            if (isLastRound) await onFinish();
            else await onAdvance();
            setAdvancing(false);
          }}
        >
          {!roundOver
            ? "Clock running…"
            : advancing
            ? "Setting the bar…"
            : isLastRound
            ? "Final standings"
            : "Next attempt"}
        </button>
      )}

      <div className="card">
        <div className="card-top">
          <span>
            <b>{player.display_name}</b>
            {!isSolo && meIndex >= 0 && ` · ${ordinal(meIndex + 1)} of ${ranked.length}`}
          </span>
          <span>
            <b>{points.toLocaleString()}</b> pts
          </span>
        </div>
        <div className="attempts" aria-label="Your attempts">
          {attempts.map((a, i) => (
            <span key={i} className={a.mark === "X" ? "x" : a.next ? "up" : undefined}>
              <b>{a.mark}</b>
              {fmtHeight(a.cm)}
            </span>
          ))}
        </div>
      </div>
    </Frame>
  );
}
