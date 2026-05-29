-- ============================================================================
-- Supabase-side schema: profiles + auth signup trigger
-- Run this ONCE in: Supabase dashboard -> SQL Editor -> New Query -> paste & Run
--
-- This is everything Supabase needs for the hybrid architecture. All other
-- tables (hospitals, doctors, appointments, ...) live in Neon, not here.
--
-- The script is idempotent: safe to re-run if anything fails midway.
-- ============================================================================

-- 1. Profiles table — 1:1 with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT NOT NULL DEFAULT 'User',
  phone       TEXT,
  date_of_birth DATE,
  gender      TEXT CHECK (gender IN ('male','female','other')),
  blood_group TEXT,
  address     TEXT,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'patient' CHECK (role IN ('patient','admin','doctor','hospital_staff')),
  hospital_id UUID,
  abha_id     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. updated_at auto-touch trigger (small helper)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Signup trigger: auto-create profiles row after auth.users insert.
--    SECURITY DEFINER lets it bypass RLS during the trigger run.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS — only the owner can read/update their own profile.
--    First drop EVERY existing policy on profiles (regardless of name) to
--    eliminate stale policies from earlier deploys that might cause
--    infinite-recursion errors (code 42P17).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy WHERE polrelid = 'public.profiles'::regclass
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.polname);
  END LOOP;
END $$;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5. Grants so the supabase-js client (role: authenticated) can use the table
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ============================================================================
-- Done. Test by signing up a new user in the frontend.
-- Verify:
--   SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 5;
-- ============================================================================
