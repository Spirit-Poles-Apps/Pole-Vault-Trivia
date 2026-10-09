-- 0007_reveal_answer.sql
-- Lets the app show the correct answer (in green) once it's safe to:
--   * the round's clock has run out, or
--   * every player in the pool has answered (in solo, that's just you).
-- Until then it returns null, so nobody can peek at the answer key
-- while others in their pool are still answering.

create or replace function reveal_answer(p_round_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct text;
  v_ends_at timestamptz;
  v_pool_id uuid;
  v_players int;
  v_answered int;
begin
  select q.correct_choice, r.ends_at, r.pool_id
    into v_correct, v_ends_at, v_pool_id
  from rounds r
  join questions q on q.id = r.question_id
  where r.id = p_round_id;

  if v_correct is null then
    return null;
  end if;

  if now() >= v_ends_at then
    return v_correct;
  end if;

  select count(*) into v_players from players where pool_id = v_pool_id;
  select count(*) into v_answered from answers where round_id = p_round_id;

  if v_players > 0 and v_answered >= v_players then
    return v_correct;
  end if;

  return null;
end;
$$;

grant execute on function reveal_answer(uuid) to anon, authenticated;
