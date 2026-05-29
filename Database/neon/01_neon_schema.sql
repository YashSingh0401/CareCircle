-- ============================================================================
-- CareCircle — Neon Postgres schema (data tables only)
--
-- Run this ONCE in the Neon SQL Editor (https://console.neon.tech):
--   1. Pick your project
--   2. Click "SQL Editor" in the sidebar
--   3. Paste the entire file
--   4. Click "Run"
--
-- Hybrid architecture: Supabase owns `auth.users` and `public.profiles`.
-- Neon owns everything else. Cross-DB integrity (patient_id matches a real
-- Supabase user) is enforced at the application layer — there's no FK to
-- auth.users here because that table doesn't exist on Neon.
--
-- The script is idempotent (uses `IF NOT EXISTS` / `OR REPLACE`).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────────────────
-- updated_at auto-touch helper used by several tables
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. HOSPITALS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hospitals (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  description        TEXT,
  address            TEXT,
  city               TEXT,
  state              TEXT,
  area               TEXT,
  pincode            TEXT,
  phone              TEXT,
  email              TEXT,
  website            TEXT,
  latitude           DECIMAL(10,8),
  longitude          DECIMAL(11,8),
  image_url          TEXT,
  facilities         TEXT[],
  working_hours      JSONB,
  type               TEXT DEFAULT 'private' CHECK (type IN ('government','private','trust')),
  emergency_available BOOLEAN DEFAULT FALSE,
  rating             DECIMAL(2,1) DEFAULT 0,
  total_reviews      INTEGER DEFAULT 0,
  is_active          BOOLEAN DEFAULT TRUE,
  created_by         UUID,                  -- Supabase user UUID; no FK
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_hospitals_updated ON hospitals;
CREATE TRIGGER trg_hospitals_updated BEFORE UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. DEPARTMENTS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id  UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  floor_number INTEGER,
  room_numbers TEXT[],
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. DOCTORS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID,                  -- Supabase user UUID; no FK
  hospital_id       UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  department_id     UUID REFERENCES departments(id),
  name              TEXT NOT NULL,
  specialization    TEXT NOT NULL,
  qualification     TEXT,
  experience_years  INTEGER DEFAULT 0,
  bio               TEXT,
  image_url         TEXT,
  consultation_fee  DECIMAL(10,2) DEFAULT 0,
  phone             TEXT,
  email             TEXT,
  rating            DECIMAL(2,1) DEFAULT 0,
  total_reviews     INTEGER DEFAULT 0,
  is_available      BOOLEAN DEFAULT TRUE,
  accepts_insurance BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_doctors_updated ON doctors;
CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS doctor_availability (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id             UUID REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week           INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 15,
  max_patients          INTEGER DEFAULT 20,
  is_active             BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS doctor_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id   UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id  UUID NOT NULL,               -- Supabase user UUID; no FK
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);

DROP TRIGGER IF EXISTS trg_doctor_reviews_updated ON doctor_reviews;
CREATE TRIGGER trg_doctor_reviews_updated BEFORE UPDATE ON doctor_reviews
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. APPOINTMENTS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id             UUID NOT NULL,    -- Supabase user UUID; no FK
  doctor_id              UUID REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id            UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  appointment_date       DATE NOT NULL,
  appointment_time       TIME NOT NULL,
  status                 TEXT DEFAULT 'scheduled' CHECK (status IN
                           ('scheduled','checked_in','in_queue','in_consultation',
                            'completed','cancelled','no_show')),
  reason                 TEXT,
  notes                  TEXT,
  token_number           INTEGER,
  estimated_wait_minutes INTEGER,
  actual_start_time      TIMESTAMPTZ,
  actual_end_time        TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_appointments_updated ON appointments;
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. QUEUE MANAGEMENT
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS queues (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id                 UUID REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id               UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  date                      DATE NOT NULL,
  current_token             INTEGER DEFAULT 0,
  total_patients            INTEGER DEFAULT 0,
  average_consultation_time INTEGER DEFAULT 15,
  is_active                 BOOLEAN DEFAULT TRUE,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, date)
);

DROP TRIGGER IF EXISTS trg_queues_updated ON queues;
CREATE TRIGGER trg_queues_updated BEFORE UPDATE ON queues
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE IF NOT EXISTS queue_entries (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id                 UUID REFERENCES queues(id) ON DELETE CASCADE,
  appointment_id           UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id               UUID NOT NULL,  -- Supabase user UUID; no FK
  token_number             INTEGER NOT NULL,
  position                 INTEGER NOT NULL,
  status                   TEXT DEFAULT 'waiting' CHECK (status IN
                             ('waiting','next','in_consultation','completed','skipped')),
  check_in_time            TIMESTAMPTZ,
  called_time              TIMESTAMPTZ,
  consultation_start_time  TIMESTAMPTZ,
  completed_time           TIMESTAMPTZ,
  priority_level           INTEGER DEFAULT 0,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_queue_entries_updated ON queue_entries;
CREATE TRIGGER trg_queue_entries_updated BEFORE UPDATE ON queue_entries
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 6. MEDICAL RECORDS (append-only)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL,           -- Supabase user UUID; no FK
  appointment_id  UUID REFERENCES appointments(id),
  doctor_id       UUID REFERENCES doctors(id),
  hospital_id     UUID REFERENCES hospitals(id),
  record_type     TEXT NOT NULL DEFAULT 'consultation' CHECK (record_type IN
                    ('consultation','prescription','lab_report','imaging',
                     'discharge_summary','other')),
  title           TEXT,
  description     TEXT,
  diagnosis       TEXT,
  symptoms        TEXT[],
  report_text     TEXT,
  file_url        TEXT,
  file_type       TEXT,
  ai_summary      TEXT,
  ai_explanation  TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  record_date     DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_medical_records_updated ON medical_records;
CREATE TRIGGER trg_medical_records_updated BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Prevent hard delete of medical records (kept for audit/compliance)
CREATE OR REPLACE RULE no_delete_records AS ON DELETE TO medical_records DO INSTEAD NOTHING;

CREATE TABLE IF NOT EXISTS prescriptions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id      UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL,            -- Supabase user UUID; no FK
  doctor_id      UUID REFERENCES doctors(id),
  medications    JSONB NOT NULL DEFAULT '[]',
  instructions   TEXT,
  valid_until    DATE,
  prescribed_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. EMERGENCY CONTACTS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL,              -- Supabase user UUID; no FK
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  relationship TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. EMERGENCY ALERTS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id            UUID NOT NULL,     -- Supabase user UUID; no FK
  hospital_id           UUID REFERENCES hospitals(id),
  alert_type            TEXT NOT NULL CHECK (alert_type IN
                          ('cardiac','respiratory','trauma','stroke','allergic','other')),
  severity_level        INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  symptoms              TEXT[],
  description           TEXT,
  location_latitude     DECIMAL(10,8),
  location_longitude    DECIMAL(11,8),
  location_address      TEXT,
  status                TEXT DEFAULT 'active' CHECK (status IN
                          ('active','acknowledged','dispatched','arrived','resolved','cancelled')),
  responder_notes       TEXT,
  response_time_minutes INTEGER,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  resolved_at           TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_emergency_alerts_updated ON emergency_alerts;
CREATE TRIGGER trg_emergency_alerts_updated BEFORE UPDATE ON emergency_alerts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 9. AI / CHAT
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,                -- Supabase user UUID; no FK
  session_id UUID NOT NULL,
  role       TEXT CHECK (role IN ('user','assistant')),
  message    TEXT NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symptom_logs (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                 UUID NOT NULL, -- Supabase user UUID; no FK
  symptoms                   TEXT[] NOT NULL,
  severity_score             DECIMAL(3,2),
  predicted_conditions       TEXT[],
  recommended_specialization TEXT,
  ai_response                TEXT,
  created_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 10. AUDIT LOGS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID,                         -- Supabase user UUID; no FK
  action     TEXT NOT NULL,
  table_name TEXT,
  record_id  TEXT,
  old_data   JSONB,
  new_data   JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 11. HOSPITAL ROOMS (indoor map)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hospital_rooms (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id   UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  room_type     TEXT CHECK (room_type IN
                  ('doctor_room','lab','pharmacy','emergency','reception',
                   'ward','icu','other')),
  floor_number  INTEGER DEFAULT 1,
  room_number   TEXT,
  department_id UUID REFERENCES departments(id),
  coordinates   JSONB,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 12. INDEXES
-- ────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_appointments_patient   ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor    ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date      ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status    ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_queue_entries_queue    ON queue_entries(queue_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_patient  ON queue_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_status   ON queue_entries(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date    ON medical_records(record_date);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_hospital ON emergency_alerts(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital       ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_chat_history_session   ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user        ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts(user_id);

-- ============================================================================
-- Done. After running this, the backend's 500 errors should disappear.
-- Verify with:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- ============================================================================
