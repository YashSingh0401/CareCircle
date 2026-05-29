-- =============================================
-- CARECIRCLE COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'User',
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male','female','other')),
  blood_group TEXT,
  address TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient','admin','doctor','hospital_staff')),
  hospital_id UUID,
  abha_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. HOSPITALS
-- =============================================
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  image_url TEXT,
  facilities TEXT[],
  working_hours JSONB,
  emergency_available BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD CONSTRAINT profiles_hospital_fk FOREIGN KEY (hospital_id) REFERENCES hospitals(id);

-- =============================================
-- 3. DEPARTMENTS
-- =============================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  floor_number INTEGER,
  room_numbers TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. DOCTORS
-- =============================================
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  qualification TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  image_url TEXT,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  phone TEXT,
  email TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE doctor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 15,
  max_patients INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE doctor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);

-- =============================================
-- 5. APPOINTMENTS
-- =============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','checked_in','in_queue','in_consultation','completed','cancelled','no_show')),
  reason TEXT,
  notes TEXT,
  token_number INTEGER,
  estimated_wait_minutes INTEGER,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. QUEUE MANAGEMENT
-- =============================================
CREATE TABLE queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  current_token INTEGER DEFAULT 0,
  total_patients INTEGER DEFAULT 0,
  average_consultation_time INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, date)
);

CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id UUID REFERENCES queues(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token_number INTEGER NOT NULL,
  position INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting','next','in_consultation','completed','skipped')),
  check_in_time TIMESTAMPTZ,
  called_time TIMESTAMPTZ,
  completed_time TIMESTAMPTZ,
  priority_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. MEDICAL RECORDS (Immutable append-only)
-- =============================================
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  doctor_id UUID REFERENCES doctors(id),
  hospital_id UUID REFERENCES hospitals(id),
  record_type TEXT NOT NULL CHECK (record_type IN ('consultation','prescription','lab_report','imaging','discharge_summary','other')),
  title TEXT NOT NULL,
  description TEXT,
  diagnosis TEXT,
  symptoms TEXT[],
  file_url TEXT,
  file_type TEXT,
  ai_summary TEXT,
  ai_explanation TEXT,
  is_verified BOOLEAN DEFAULT false,
  record_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent deletion of medical records (immutability)
CREATE RULE no_delete_records AS ON DELETE TO medical_records DO INSTEAD NOTHING;

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  medications JSONB NOT NULL DEFAULT '[]',
  instructions TEXT,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. EMERGENCY CONTACTS
-- =============================================
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. EMERGENCY ALERTS
-- =============================================
CREATE TABLE emergency_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('cardiac','respiratory','trauma','stroke','allergic','other')),
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  symptoms TEXT[],
  description TEXT,
  location_latitude DECIMAL(10,8),
  location_longitude DECIMAL(11,8),
  location_address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','acknowledged','dispatched','arrived','resolved','cancelled')),
  responder_notes TEXT,
  response_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. AI/CHAT HISTORY
-- =============================================
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT CHECK (role IN ('user','assistant')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL,
  severity_score DECIMAL(3,2),
  predicted_conditions TEXT[],
  recommended_specialization TEXT,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. AUDIT LOGS
-- =============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 12. HOSPITAL NAVIGATION (Indoor Maps)
-- =============================================
CREATE TABLE hospital_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT CHECK (room_type IN ('doctor_room','lab','pharmacy','emergency','reception','ward','icu','other')),
  floor_number INTEGER DEFAULT 1,
  room_number TEXT,
  department_id UUID REFERENCES departments(id),
  coordinates JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 13. INDEXES
-- =============================================
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_queue_entries_queue ON queue_entries(queue_id);
CREATE INDEX idx_queue_entries_patient ON queue_entries(patient_id);
CREATE INDEX idx_queue_entries_status ON queue_entries(status);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX idx_emergency_alerts_hospital ON emergency_alerts(hospital_id);
CREATE INDEX idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_chat_history_session ON chat_history(session_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- =============================================
-- 14. ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Hospital staff view patients" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff','doctor','admin')));

-- Appointments
CREATE POLICY "Patients view own appts" ON appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients create appts" ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients update own appts" ON appointments FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Staff view hospital appts" ON appointments FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff','doctor','admin')));
CREATE POLICY "Staff update appts" ON appointments FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff','doctor','admin')));

-- Medical Records
CREATE POLICY "Patients view own records" ON medical_records FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients create own records" ON medical_records FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctors view patient records" ON medical_records FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor','hospital_staff','admin')));
CREATE POLICY "Doctors create records" ON medical_records FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor','hospital_staff','admin')));

-- Emergency Alerts
CREATE POLICY "Patients manage own emergencies" ON emergency_alerts FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "Staff view all emergencies" ON emergency_alerts FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff','doctor','admin')));
CREATE POLICY "Staff update emergencies" ON emergency_alerts FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff','doctor','admin')));

-- Emergency Contacts
CREATE POLICY "Patients manage own contacts" ON emergency_contacts FOR ALL USING (auth.uid() = patient_id);

-- Chat History
CREATE POLICY "Users access own chat" ON chat_history FOR ALL USING (auth.uid() = patient_id);

-- Queue Entries
CREATE POLICY "Patients view own queue" ON queue_entries FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Staff manage queue" ON queue_entries FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hospital_staff','doctor','admin')));

-- Hospitals (public read)
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active hospitals" ON hospitals FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage hospitals" ON hospitals FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Doctors (public read)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Admins manage doctors" ON doctors FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- 15. FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_hospitals_updated BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_queues_updated BEFORE UPDATE ON queues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_emergency_updated BEFORE UPDATE ON emergency_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Audit log trigger
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_medical_records AFTER INSERT OR UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER audit_emergency_alerts AFTER INSERT OR UPDATE ON emergency_alerts FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION log_audit();

-- =============================================
-- 16. SEED DATA (Sample hospitals)
-- =============================================
INSERT INTO hospitals (name, description, address, city, state, pincode, phone, emergency_available, facilities, rating)
VALUES
  ('AIIMS Bhopal', 'All India Institute of Medical Sciences, Bhopal', 'Saket Nagar', 'Bhopal', 'Madhya Pradesh', '462020', '+91-755-2672335', true, ARRAY['ICU','NICU','OT','Lab','Pharmacy','X-Ray','MRI','CT Scan','Blood Bank','Ambulance'], 4.5),
  ('Hamidia Hospital', 'Government hospital serving central MP', 'Royal Market', 'Bhopal', 'Madhya Pradesh', '462001', '+91-755-2540222', true, ARRAY['ICU','OT','Lab','Pharmacy','X-Ray','Ambulance'], 3.8),
  ('Bansal Hospital', 'Multi-specialty private hospital', 'Shahpura', 'Bhopal', 'Madhya Pradesh', '462016', '+91-755-4000000', false, ARRAY['ICU','OT','Lab','Pharmacy','MRI','CT Scan','Cafeteria','Parking'], 4.2);
