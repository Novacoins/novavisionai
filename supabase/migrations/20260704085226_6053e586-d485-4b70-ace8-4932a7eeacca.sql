
-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_points integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS ai_interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS achievements jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2. Backfill existing users to 100 if null-ish (default handles new rows)
UPDATE public.profiles SET ai_points = 100 WHERE ai_points IS NULL OR ai_points = 0;

-- 3. Points ledger to make daily-login idempotent and audit awards
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  amount integer NOT NULL,
  dedupe_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, dedupe_key)
);

GRANT SELECT, INSERT ON public.points_ledger TO authenticated;
GRANT ALL ON public.points_ledger TO service_role;

ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ledger" ON public.points_ledger
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ledger" ON public.points_ledger
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. Award function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.award_points(_action text, _amount integer, _dedupe_key text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _new_total integer;
  _inserted boolean := false;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _amount <= 0 OR _amount > 1000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  BEGIN
    INSERT INTO public.points_ledger(user_id, action, amount, dedupe_key)
    VALUES (_uid, _action, _amount, _dedupe_key);
    _inserted := true;
  EXCEPTION WHEN unique_violation THEN
    _inserted := false;
  END;

  IF _inserted THEN
    UPDATE public.profiles SET ai_points = COALESCE(ai_points, 0) + _amount
    WHERE id = _uid
    RETURNING ai_points INTO _new_total;
  ELSE
    SELECT ai_points INTO _new_total FROM public.profiles WHERE id = _uid;
  END IF;

  RETURN COALESCE(_new_total, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_points(text, integer, text) TO authenticated;

-- 5. Update handle_new_user to seed 100 points (default handles it, but be explicit)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username, ai_points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    split_part(NEW.email, '@', 1),
    100
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
