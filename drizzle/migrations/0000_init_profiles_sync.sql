CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_sync (
  user_id UUID NOT NULL PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  folders JSONB NOT NULL DEFAULT '[]'::jsonb,
  progress JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sync TO authenticated;
GRANT ALL ON public.user_sync TO service_role;
ALTER TABLE public.user_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sync data" ON public.user_sync FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER user_sync_touch BEFORE UPDATE ON public.user_sync FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

REVOKE ALL ON FUNCTION public.touch_updated_at() FROM anon, authenticated, PUBLIC;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username));

CREATE OR REPLACE FUNCTION public.handle_new_app_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_sync (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_app_user();

REVOKE ALL ON FUNCTION public.handle_new_app_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_app_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_app_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_app_user() TO service_role;

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

REVOKE ALL ON FUNCTION public.enforce_viewer_profile_limit() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_viewer_profile_limit() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_viewer_profile_limit() FROM authenticated;