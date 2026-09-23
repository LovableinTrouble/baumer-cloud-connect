CREATE TABLE public.viewer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  avatar text,
  color text,
  pin text,
  is_kids boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.viewer_profiles TO authenticated;
GRANT ALL ON public.viewer_profiles TO service_role;

ALTER TABLE public.viewer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own viewer profiles"
  ON public.viewer_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX viewer_profiles_user_idx ON public.viewer_profiles (user_id);

CREATE TRIGGER viewer_profiles_touch
  BEFORE UPDATE ON public.viewer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_viewer_profile_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.viewer_profiles WHERE user_id = NEW.user_id) >= 4 THEN
    RAISE EXCEPTION 'You can have up to 4 profiles';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER viewer_profiles_limit
  BEFORE INSERT ON public.viewer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_viewer_profile_limit();