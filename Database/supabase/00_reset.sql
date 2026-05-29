-- ============================================================================
-- CareCircle — Supabase reset script
--
-- Drops all CareCircle tables in the public schema so the new split-schema
-- files (01_auth_profiles.sql + 01_neon_schema.sql) can be applied cleanly.
--
-- DOES NOT touch:
--   - auth.users (Supabase Auth identities — preserved)
--   - any non-CareCircle objects you may have added
--
-- RUN ORDER on Supabase SQL editor:
--   1. database/supabase/00_reset.sql   (this file)
--   2. database/supabase/01_auth_profiles.sql
--   3. database/neon/01_neon_schema.sql
--   4. database/seed/001_bhopal_hospitals.sql
--
-- This is destructive. Only run when you intend to drop all CareCircle data.
-- ============================================================================

-- Auth signup trigger — recreated by 01_auth_profiles.sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Audit triggers from the old monolithic schema (function may not exist; ignore errors)
DROP FUNCTION IF EXISTS public.log_audit() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.touch_updated_at() CASCADE;

-- Tables (CASCADE drops FKs, policies, indexes, triggers in one shot)
DROP TABLE IF EXISTS public.audit_logs            CASCADE;
DROP TABLE IF EXISTS public.symptom_logs          CASCADE;
DROP TABLE IF EXISTS public.chat_history          CASCADE;
DROP TABLE IF EXISTS public.emergency_alerts      CASCADE;
DROP TABLE IF EXISTS public.emergency_contacts    CASCADE;
DROP TABLE IF EXISTS public.prescriptions         CASCADE;
DROP TABLE IF EXISTS public.medical_records       CASCADE;
DROP TABLE IF EXISTS public.queue_entries         CASCADE;
DROP TABLE IF EXISTS public.queues                CASCADE;
DROP TABLE IF EXISTS public.appointments          CASCADE;
DROP TABLE IF EXISTS public.doctor_reviews        CASCADE;
DROP TABLE IF EXISTS public.doctor_availability   CASCADE;
DROP TABLE IF EXISTS public.doctors               CASCADE;
DROP TABLE IF EXISTS public.hospital_rooms        CASCADE;
DROP TABLE IF EXISTS public.departments           CASCADE;
DROP TABLE IF EXISTS public.hospitals             CASCADE;
DROP TABLE IF EXISTS public.profiles              CASCADE;

-- Drop the no_delete_records rule's underlying object if it lingers
-- (CASCADE on medical_records above already handles it; this is belt-and-suspenders)

-- ============================================================================
-- Verify clean state:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Should return zero rows (or only non-CareCircle tables you added).
-- ============================================================================
