# CareCircle — AI-Powered Smart Hospital Management System
### Bhopal, Madhya Pradesh | Hackathon 2026

> Three portals · Real ML models · Bhopal hospital data · Real-time queue · Emergency SOS · Gemini AI

---

## What's Built

| Portal | Who Uses It | Key Features |
|--------|-------------|--------------|
| **Patient** (`/home`) | Patients | Book appointments, track queue live, medical timeline, Emergency SOS, AI assistant, indoor navigation |
| **Hospital Staff** (`/hospital`) | Nurses, doctors, receptionists | Live queue management, patient check-in, emergency alerts, medical records |
| **Admin** (`/admin`) | System admins | All hospitals/doctors/users, analytics charts, emergency monitoring |

---

## Tech Stack

**Frontend:** Next.js 14 + TypeScript + Tailwind CSS + Supabase Realtime  
**Backend:** FastAPI (Python) + all ML models  
**Database:** Supabase (PostgreSQL + Auth + Storage + Realtime)  
**AI/ML:** Gemini 1.5 Flash + HuggingFace Inference API + XGBoost + CatBoost  
**Deploy:** Vercel (frontend) + Railway (backend) — both free tiers

---

## ML Models

| Model | Purpose | Where | RAM Impact |
|-------|---------|--------|-----------|
| **CatBoost** | Emergency severity (1–5) | Local (~8MB) | ~50MB |
| **XGBoost LTR** | Doctor ranking | Local (~2MB) | ~30MB |
| **XGBoost** | Queue wait-time | Local (~1MB) | ~20MB |
| **Isolation Forest** | Fraud/anomaly detection | Local (<1MB) | ~10MB |
| **ClinicalBERT** | Symptom → department | HF API (free) | **0 local RAM** |
| **TrOCR** | Handwritten prescription OCR | HF API (free) | **0 local RAM** |
| **Sentence Transformers** | Semantic doctor search | HF API (free) | **0 local RAM** |
| **Gemini 1.5 Flash** | Chat + report analysis + RAG | Google API (free) | **0 local RAM** |

**Heavy models (ClinicalBERT, TrOCR, Sentence Transformers) run on HuggingFace's servers — zero local RAM/GPU usage.**

---

## Quick Start

### 1. Supabase Setup (5 min)

```bash
# 1. Go to supabase.com → New Project
# 2. SQL Editor → paste and run:
database/migrations/001_initial_schema.sql

# 3. SQL Editor → paste and run seed data:
database/seed/bhopal_hospitals.sql

# 4. Authentication → Providers → Enable Google OAuth
#    Redirect URL: https://your-project.supabase.co/auth/v1/callback

# 5. Storage → New bucket: medical-records (private)
# 6. Storage → New bucket: profile-images (public)
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
# → http://localhost:3000
```

### 3. Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY
# Optional but recommended: HF_API_TOKEN (free at huggingface.co/settings/tokens)
pip install -r requirements.txt
# Install Tesseract: sudo apt install tesseract-ocr (Ubuntu) | brew install tesseract (Mac)
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs
```

### 4. Train ML Models (optional but recommended)

```bash
# From project root — takes ~4 min on CPU, safe for 16GB RAM
pip install -r ml_training/requirements.txt
python ml_training/train_all.py

# Or train individually:
python ml_training/train_catboost.py       # Emergency severity
python ml_training/train_xgboost_ltr.py   # Doctor ranking
python ml_training/train_queue_predictor.py # Queue wait-time
```

Models save to `backend/app/ml/*/` and are auto-loaded at backend startup.  
**If models aren't trained yet, backend uses intelligent rule-based fallbacks automatically.**

---

## Make Yourself Admin

After signing up:
```sql
-- In Supabase SQL Editor:
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Then refresh → you'll see Admin Portal at `/admin/dashboard`.

## Assign Hospital Staff

```sql
-- Get hospital ID first:
SELECT id, name FROM hospitals;

-- Assign staff:
UPDATE profiles 
SET role = 'hospital_staff', hospital_id = 'paste-hospital-uuid-here'
WHERE email = 'staff@email.com';
```

---

## Deployment

### Frontend → Vercel (free)
1. Push to GitHub
2. vercel.com → Import → set root directory: `frontend`
3. Add env vars from `frontend/.env.example`
4. Deploy

### Backend → Railway (free)
1. railway.app → New Project → from GitHub
2. Set root directory: `backend`
3. Add env vars from `backend/.env.example`
4. Railway auto-detects Dockerfile → deploys

### After Deploy
- Supabase Auth → URL Config → set Site URL to your Vercel URL
- Supabase Auth → URL Config → add Redirect URL: `https://your-app.vercel.app/auth/callback`
- Update `ALLOWED_ORIGINS` in Railway env to your Vercel URL

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/assistant/chat` | POST | RAG-enhanced AI chat |
| `/api/assistant/symptoms` | POST | ClinicalBERT symptom analysis |
| `/api/assistant/emergency-severity` | POST | CatBoost severity prediction |
| `/api/assistant/recommend-doctors` | POST | XGBoost LTR doctor ranking |
| `/api/assistant/analyze-report` | POST | Gemini report analysis |
| `/api/assistant/semantic-search` | POST | Sentence Transformers search |
| `/api/records/ocr-prescription` | POST | TrOCR prescription OCR |
| `/api/queue/{id}/wait-time` | GET | XGBoost queue prediction |
| `/api/emergency/alert` | POST | Create emergency alert |
| `/health` | GET | Backend health check |

---

## Project Structure

```
carecircle/
├── frontend/src/
│   ├── app/(dashboard)/     # Patient portal (home, hospitals, doctors, queue, records, emergency, AI)
│   ├── app/hospital/        # Hospital staff portal
│   ├── app/admin/           # Admin portal
│   ├── lib/api/             # API clients (appointments, hospitals, doctors, records, assistant)
│   ├── lib/hooks/           # useAuth, useRealtime
│   └── stores/              # Zustand (auth, queue, notifications)
│
├── backend/app/
│   ├── routers/             # FastAPI routes (all endpoints)
│   └── ml/
│       ├── catboost_severity/    # Real CatBoost severity model
│       ├── xgboost_ltr/          # Real XGBoost LTR ranker
│       ├── tft_queue/            # XGBoost queue predictor
│       ├── clinical_bert/        # ClinicalBERT via HF API
│       ├── trocr/                # TrOCR via HF API
│       ├── sentence_transformers/ # Sentence Transformers via HF API
│       ├── isolation_forest/     # Anomaly/fraud detection
│       ├── rag/                  # Bhopal medical knowledge RAG
│       └── ai/                   # Gemini chatbot + report analyzer
│
├── ml_training/
│   ├── train_all.py              # Master training script (run this)
│   ├── train_catboost.py         # CatBoost training
│   ├── train_xgboost_ltr.py      # XGBoost LTR training
│   ├── train_queue_predictor.py  # Queue model training
│   └── scripts/generate_bhopal_data.py  # Bhopal synthetic data generator
│
└── database/
    ├── migrations/001_initial_schema.sql  # Full DB schema + RLS + triggers
    └── seed/bhopal_hospitals.sql          # Real Bhopal hospital data
```

---

Built for Healthcare Innovation Hackathon 2026 · Bhopal, MP 🇮🇳
