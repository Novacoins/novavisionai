
-- Drop old version
DROP FUNCTION IF EXISTS public.award_points(text, integer, text);

-- New hardened version: server-side amount allow-list, forced dedupe for daily_login,
-- takes explicit user_id (only callable by service_role from a trusted server function).
CREATE OR REPLACE FUNCTION public.award_points(_user_id uuid, _action text, _dedupe_key text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _amount integer;
  _new_total integer;
  _inserted boolean := false;
  _key text := _dedupe_key;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user';
  END IF;

  _amount := CASE _action
    WHEN 'signup' THEN 100
    WHEN 'scan' THEN 10
    WHEN 'chat' THEN 5
    WHEN 'image_generated' THEN 20
    WHEN 'lesson_completed' THEN 30
    WHEN 'daily_login' THEN 5
    ELSE NULL
  END;

  IF _amount IS NULL THEN
    RAISE EXCEPTION 'Invalid action: %', _action;
  END IF;

  -- Force server-generated dedupe key for once-per-day actions
  IF _action = 'daily_login' AND (_key IS NULL OR length(_key) = 0) THEN
    _key := 'daily_login:' || to_char((now() AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD');
  END IF;

  BEGIN
    INSERT INTO public.points_ledger(user_id, action, amount, dedupe_key)
    VALUES (_user_id, _action, _amount, _key);
    _inserted := true;
  EXCEPTION WHEN unique_violation THEN
    _inserted := false;
  END;

  IF _inserted THEN
    UPDATE public.profiles
    SET ai_points = COALESCE(ai_points, 0) + _amount
    WHERE id = _user_id
    RETURNING ai_points INTO _new_total;
  ELSE
    SELECT ai_points INTO _new_total FROM public.profiles WHERE id = _user_id;
  END IF;

  RETURN COALESCE(_new_total, 0);
END;
$$;

-- Lock down execute privileges: only the trusted backend can call this.
REVOKE ALL ON FUNCTION public.award_points(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.award_points(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.award_points(uuid, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.award_points(uuid, text, text) TO service_role;
