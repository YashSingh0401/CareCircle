"""
ml_training/scripts/generate_bhopal_data.py
Generates realistic synthetic data for Bhopal, MP, India.
Real hospital names, real areas, realistic doctor profiles.
Run: python generate_bhopal_data.py
"""

import pandas as pd
import numpy as np
import json
import random
from datetime import datetime, timedelta
import os

random.seed(42)
np.random.seed(42)

# ── Real Bhopal hospitals ──────────────────────────────────────────────────
HOSPITALS = [
    {"name": "AIIMS Bhopal", "area": "Saket Nagar", "city": "Bhopal", "pincode": "462020",
     "lat": 23.1993, "lon": 77.3149, "type": "government", "beds": 960, "emergency": True,
     "rating": 4.5, "phone": "0755-2672335"},
    {"name": "Hamidia Hospital", "area": "Royal Market", "city": "Bhopal", "pincode": "462001",
     "lat": 23.2647, "lon": 77.4098, "type": "government", "beds": 1200, "emergency": True,
     "rating": 3.8, "phone": "0755-2540222"},
    {"name": "Bansal Hospital", "area": "Shahpura", "city": "Bhopal", "pincode": "462016",
     "lat": 23.2096, "lon": 77.4651, "type": "private", "beds": 250, "emergency": True,
     "rating": 4.3, "phone": "0755-4000000"},
    {"name": "Chirayu Medical College", "area": "Bairagarh", "city": "Bhopal", "pincode": "462030",
     "lat": 23.2741, "lon": 77.3340, "type": "private", "beds": 750, "emergency": True,
     "rating": 4.1, "phone": "0755-2763000"},
    {"name": "People's Hospital", "area": "Bhanpur", "city": "Bhopal", "pincode": "462037",
     "lat": 23.1766, "lon": 77.4425, "type": "private", "beds": 400, "emergency": True,
     "rating": 4.2, "phone": "0755-4073000"},
    {"name": "Bhopal Memorial Hospital", "area": "Berasia Road", "city": "Bhopal", "pincode": "462038",
     "lat": 23.3052, "lon": 77.3983, "type": "trust", "beds": 350, "emergency": True,
     "rating": 4.0, "phone": "0755-2740762"},
    {"name": "Gandhi Medical College", "area": "Sultania Road", "city": "Bhopal", "pincode": "462001",
     "lat": 23.2566, "lon": 77.4039, "type": "government", "beds": 900, "emergency": True,
     "rating": 3.9, "phone": "0755-2540222"},
    {"name": "Narmada Hospital", "area": "Kolar Road", "city": "Bhopal", "pincode": "462042",
     "lat": 23.1634, "lon": 77.4512, "type": "private", "beds": 150, "emergency": False,
     "rating": 4.0, "phone": "0755-2441000"},
    {"name": "Spandan Hospital", "area": "Hoshangabad Road", "city": "Bhopal", "pincode": "462026",
     "lat": 23.2003, "lon": 77.4801, "type": "private", "beds": 100, "emergency": False,
     "rating": 3.9, "phone": "0755-2573000"},
    {"name": "Apollo Sage Hospital", "area": "Bawadia Kalan", "city": "Bhopal", "pincode": "462026",
     "lat": 23.2450, "lon": 77.3560, "type": "private", "beds": 300, "emergency": True,
     "rating": 4.4, "phone": "0755-6700000"},
]

# ── Specializations with Indian doctor name pools ─────────────────────────
SPECIALIZATIONS = [
    "General Physician", "Cardiologist", "Neurologist", "Orthopedist",
    "Dermatologist", "Gynecologist", "Pediatrician", "Psychiatrist",
    "Gastroenterologist", "Pulmonologist", "Endocrinologist", "Nephrologist",
    "Ophthalmologist", "ENT Specialist", "Oncologist", "Urologist",
    "Rheumatologist", "Surgeon", "Radiologist", "Anesthesiologist",
]

DOCTOR_FIRST = ["Rajesh", "Sunil", "Amit", "Priya", "Neha", "Sunita", "Vikram",
                "Deepak", "Sanjay", "Ritu", "Kavita", "Mahesh", "Geeta", "Ashok",
                "Pooja", "Ramesh", "Anita", "Vinod", "Shweta", "Arun", "Rekha",
                "Narendra", "Meena", "Pramod", "Sarla", "Dinesh", "Usha", "Suresh"]
DOCTOR_LAST  = ["Sharma", "Verma", "Gupta", "Mishra", "Tiwari", "Joshi", "Patel",
                "Singh", "Yadav", "Pandey", "Soni", "Agarwal", "Saxena", "Dubey",
                "Tripathi", "Shukla", "Chaturvedi", "Dwivedi", "Bajpai", "Kulkarni"]

QUALIFICATIONS = {
    "General Physician": ["MBBS", "MBBS, MD (Internal Medicine)", "MBBS, DNB"],
    "Cardiologist": ["MBBS, MD, DM (Cardiology)", "MBBS, MD, DNB (Cardiology)"],
    "Neurologist": ["MBBS, MD, DM (Neurology)", "MBBS, DNB (Neurology)"],
    "Orthopedist": ["MBBS, MS (Orthopaedics)", "MBBS, DNB (Orthopaedics)"],
    "Dermatologist": ["MBBS, MD (Dermatology)", "MBBS, DVD"],
    "Gynecologist": ["MBBS, MS (OBG)", "MBBS, MD (OBG)", "MBBS, DGO"],
    "Pediatrician": ["MBBS, MD (Pediatrics)", "MBBS, DCH"],
    "Psychiatrist": ["MBBS, MD (Psychiatry)", "MBBS, DPM"],
    "Gastroenterologist": ["MBBS, MD, DM (Gastroenterology)"],
    "Pulmonologist": ["MBBS, MD (Respiratory Medicine)", "MBBS, DTCD"],
    "Endocrinologist": ["MBBS, MD, DM (Endocrinology)"],
    "Nephrologist": ["MBBS, MD, DM (Nephrology)"],
    "Ophthalmologist": ["MBBS, MS (Ophthalmology)", "MBBS, DO"],
    "ENT Specialist": ["MBBS, MS (ENT)", "MBBS, DLO"],
    "Oncologist": ["MBBS, MD, DM (Medical Oncology)"],
    "Urologist": ["MBBS, MS, MCh (Urology)"],
    "Rheumatologist": ["MBBS, MD, DM (Rheumatology)"],
    "Surgeon": ["MBBS, MS (General Surgery)", "MBBS, DNB (Surgery)"],
    "Radiologist": ["MBBS, MD (Radiology)", "MBBS, DMRD"],
    "Anesthesiologist": ["MBBS, MD (Anaesthesiology)", "MBBS, DA"],
}

def generate_doctors(n_per_hospital: int = 12) -> pd.DataFrame:
    records = []
    doc_id = 1
    for hosp in HOSPITALS:
        specs = random.sample(SPECIALIZATIONS, min(n_per_hospital, len(SPECIALIZATIONS)))
        for spec in specs:
            name = f"{random.choice(DOCTOR_FIRST)} {random.choice(DOCTOR_LAST)}"
            exp = random.randint(3, 32)
            base_fee = {"government": 100, "trust": 200, "private": 400}[hosp["type"]]
            fee_multiplier = {"General Physician": 1, "Cardiologist": 4, "Neurologist": 4,
                              "Orthopedist": 3, "Surgeon": 5, "Oncologist": 6}.get(spec, 2)
            fee = base_fee * fee_multiplier + random.randint(-50, 200)
            fee = max(100, round(fee / 50) * 50)

            records.append({
                "doctor_id": f"DOC{doc_id:04d}",
                "name": f"Dr. {name}",
                "specialization": spec,
                "qualification": random.choice(QUALIFICATIONS.get(spec, ["MBBS, MD"])),
                "experience_years": exp,
                "hospital_name": hosp["name"],
                "hospital_type": hosp["type"],
                "hospital_area": hosp["area"],
                "hospital_lat": hosp["lat"],
                "hospital_lon": hosp["lon"],
                "consultation_fee": fee,
                "rating": round(random.gauss(hosp["rating"] - 0.1, 0.3), 1),
                "total_reviews": random.randint(20, 800),
                "is_available": random.random() > 0.15,
                "avg_consultation_minutes": random.randint(8, 25),
                "morning_slots": random.randint(10, 20),
                "evening_slots": random.randint(5, 15),
                "accepts_insurance": random.random() > 0.3,
                "languages": random.choice(["Hindi, English", "Hindi", "Hindi, English, Urdu"]),
            })
            doc_id += 1

    df = pd.DataFrame(records)
    df["rating"] = df["rating"].clip(2.5, 5.0)
    return df


def generate_queue_data(n_days: int = 180) -> pd.DataFrame:
    """Generate queue history for TFT training."""
    records = []
    base_date = datetime(2024, 1, 1)
    for day_offset in range(n_days):
        date = base_date + timedelta(days=day_offset)
        day_of_week = date.weekday()  # 0=Mon
        is_weekend = day_of_week >= 5
        is_monday = day_of_week == 0

        for hosp in HOSPITALS[:6]:  # top 6 hospitals
            for hour in range(9, 18):
                base_patients = random.randint(8, 25)
                if is_monday:   base_patients = int(base_patients * 1.4)
                if is_weekend:  base_patients = int(base_patients * 0.6)
                if hour in [10, 11, 16]: base_patients = int(base_patients * 1.3)
                if hour in [13, 14]:    base_patients = int(base_patients * 0.7)

                avg_consult = random.gauss(15, 4)
                avg_consult = max(5, min(40, avg_consult))
                actual_wait = base_patients * avg_consult * random.gauss(1.0, 0.2)
                actual_wait = max(5, actual_wait)

                records.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "hospital": hosp["name"],
                    "hour_of_day": hour,
                    "day_of_week": day_of_week,
                    "is_weekend": int(is_weekend),
                    "is_monday": int(is_monday),
                    "month": date.month,
                    "patients_in_queue": base_patients,
                    "avg_consultation_minutes": round(avg_consult, 2),
                    "actual_wait_minutes": round(actual_wait, 2),
                    "queue_position": random.randint(1, base_patients),
                    "doctor_experience_years": random.randint(3, 30),
                    "doctor_specialization_encoded": random.randint(0, 19),
                })

    return pd.DataFrame(records)


def generate_symptom_data(n: int = 5000) -> pd.DataFrame:
    """Symptom → department classification data for ClinicalBERT fine-tuning."""
    symptom_dept_map = {
        "Cardiology": [
            "chest pain", "shortness of breath", "palpitations", "irregular heartbeat",
            "swollen ankles", "dizziness while climbing stairs", "chest tightness at rest",
            "heart racing", "breathlessness on exertion", "chest pressure",
        ],
        "Neurology": [
            "severe headache", "dizziness", "fainting", "memory loss", "confusion",
            "tingling in hands", "seizures", "weakness on one side", "slurred speech",
            "vision blurring suddenly", "numbness in face",
        ],
        "Orthopedics": [
            "knee pain", "back pain", "joint swelling", "fracture", "bone pain",
            "shoulder stiffness", "hip pain while walking", "neck stiffness",
            "swollen wrist", "foot pain in morning",
        ],
        "Dermatology": [
            "skin rash", "itching", "acne", "hair loss", "nail discoloration",
            "eczema flare", "psoriasis patches", "darkening of skin", "boil on skin",
            "allergic skin reaction",
        ],
        "Gastroenterology": [
            "stomach pain", "nausea", "vomiting", "diarrhea", "constipation",
            "blood in stool", "bloating", "acid reflux", "difficulty swallowing",
            "yellow eyes", "liver pain",
        ],
        "Pulmonology": [
            "cough for 3 weeks", "wheezing", "asthma attack", "coughing blood",
            "breathlessness at night", "chest congestion", "frequent chest infections",
            "smoking related cough", "TB symptoms",
        ],
        "Endocrinology": [
            "increased thirst", "frequent urination", "sudden weight gain", "fatigue",
            "thyroid swelling", "diabetes symptoms", "hair thinning", "cold intolerance",
            "excessive sweating", "insulin resistance",
        ],
        "Gynecology": [
            "irregular periods", "pelvic pain", "pregnancy symptoms", "vaginal discharge",
            "menstrual cramps", "PCOD symptoms", "breast lump", "hormonal imbalance",
            "menopause symptoms",
        ],
        "Pediatrics": [
            "child fever", "child vomiting", "infant not feeding", "child rash",
            "childhood asthma", "delayed milestones", "child ear pain",
            "vaccination", "newborn jaundice",
        ],
        "Psychiatry": [
            "anxiety", "depression", "panic attacks", "insomnia", "stress",
            "mood swings", "phobia", "OCD symptoms", "suicidal thoughts",
            "schizophrenia symptoms",
        ],
        "Ophthalmology": [
            "blurry vision", "eye pain", "red eye", "watery eyes", "cataract",
            "glaucoma symptoms", "squinting", "floaters in vision",
        ],
        "ENT": [
            "ear pain", "hearing loss", "sore throat", "nasal congestion",
            "sinusitis", "tonsillitis", "runny nose", "snoring", "vertigo",
        ],
        "Nephrology": [
            "kidney pain", "blood in urine", "frequent UTI", "swollen face in morning",
            "decreased urine output", "foamy urine", "dialysis related",
        ],
        "General Medicine": [
            "fever", "body ache", "weakness", "cold and cough", "malaria symptoms",
            "dengue symptoms", "typhoid symptoms", "fatigue", "loss of appetite",
            "general checkup", "health certificate",
        ],
    }

    rows = []
    for dept, symptoms in symptom_dept_map.items():
        for _ in range(n // len(symptom_dept_map)):
            base = random.choice(symptoms)
            # Add random modifiers for variety
            modifiers = ["", " since 2 days", " since 1 week", " with fever",
                         " worsening at night", " after eating", " in the morning",
                         " sudden onset", " chronic", " mild to moderate"]
            text = base + random.choice(modifiers)
            rows.append({"symptom_text": text, "department": dept, "label": list(symptom_dept_map.keys()).index(dept)})

    random.shuffle(rows)
    return pd.DataFrame(rows[:n])


def generate_emergency_severity_data(n: int = 8000) -> pd.DataFrame:
    """CatBoost training data: symptoms + vitals → severity (1-5)."""
    rows = []
    for _ in range(n):
        # Simulate vital signs
        heart_rate = np.random.normal(80, 20)
        bp_sys = np.random.normal(120, 25)
        spo2 = np.random.normal(97, 3)
        temp = np.random.normal(98.6, 1.5)
        resp_rate = np.random.normal(16, 4)
        pain_scale = random.randint(1, 10)

        # Emergency type
        emergency_type = random.choice([
            "cardiac", "respiratory", "trauma", "stroke", "allergic", "general"
        ])
        type_encoded = ["cardiac", "respiratory", "trauma", "stroke", "allergic", "general"].index(emergency_type)

        # Symptom flags
        has_chest_pain = int(emergency_type == "cardiac" or random.random() < 0.1)
        has_breathing_diff = int(emergency_type == "respiratory" or random.random() < 0.15)
        has_unconscious = int(random.random() < 0.08)
        has_bleeding = int(emergency_type == "trauma" and random.random() < 0.5)
        has_stroke_signs = int(emergency_type == "stroke" or random.random() < 0.05)
        age = random.randint(1, 85)
        age_risk = 1 if age > 60 or age < 5 else 0

        # Rule-based severity with noise
        sev = 1
        if spo2 < 90 or heart_rate > 130 or heart_rate < 45: sev += 2
        if bp_sys > 180 or bp_sys < 80: sev += 1
        if has_chest_pain or has_stroke_signs: sev += 2
        if has_unconscious: sev += 2
        if has_breathing_diff: sev += 1
        if pain_scale >= 8: sev += 1
        if age_risk: sev += 1
        sev = min(5, max(1, sev + random.randint(-1, 1)))

        rows.append({
            "heart_rate": round(max(30, min(200, heart_rate)), 1),
            "bp_systolic": round(max(60, min(220, bp_sys)), 1),
            "spo2": round(max(70, min(100, spo2)), 1),
            "temperature": round(max(95, min(106, temp)), 1),
            "respiratory_rate": round(max(8, min(40, resp_rate)), 1),
            "pain_scale": pain_scale,
            "emergency_type_encoded": type_encoded,
            "has_chest_pain": has_chest_pain,
            "has_breathing_difficulty": has_breathing_diff,
            "has_unconsciousness": has_unconscious,
            "has_bleeding": has_bleeding,
            "has_stroke_signs": has_stroke_signs,
            "age": age,
            "age_risk": age_risk,
            "severity": sev,
        })

    return pd.DataFrame(rows)


def generate_doctor_ranking_data(doctors_df: pd.DataFrame, n_queries: int = 3000) -> pd.DataFrame:
    """XGBoost LTR training data: query features + doctor features → relevance."""
    rows = []
    for qid in range(n_queries):
        target_spec = random.choice(SPECIALIZATIONS)
        user_lat = random.gauss(23.2330, 0.05)
        user_lon = random.gauss(77.4019, 0.05)
        max_budget = random.choice([200, 500, 800, 1200, 2000, 5000])

        spec_docs = doctors_df[doctors_df["specialization"] == target_spec].copy()
        if len(spec_docs) < 3:
            continue

        for _, doc in spec_docs.iterrows():
            dist_km = (((doc["hospital_lat"] - user_lat) ** 2 +
                        (doc["hospital_lon"] - user_lon) ** 2) ** 0.5) * 111

            # Relevance score (what a user would actually click/book)
            rel = 0
            if doc["rating"] >= 4.5: rel += 3
            elif doc["rating"] >= 4.0: rel += 2
            elif doc["rating"] >= 3.5: rel += 1

            if doc["consultation_fee"] <= max_budget: rel += 2
            if doc["consultation_fee"] <= max_budget * 0.5: rel += 1

            if doc["experience_years"] >= 15: rel += 2
            elif doc["experience_years"] >= 8: rel += 1

            if dist_km <= 3: rel += 3
            elif dist_km <= 7: rel += 2
            elif dist_km <= 15: rel += 1

            if doc["total_reviews"] >= 200: rel += 1
            if doc["is_available"]: rel += 1
            if doc["accepts_insurance"]: rel += 1

            rel = min(rel, 9)

            rows.append({
                "query_id": qid,
                "doctor_id": doc["doctor_id"],
                "rating": doc["rating"],
                "total_reviews": doc["total_reviews"],
                "experience_years": doc["experience_years"],
                "consultation_fee": doc["consultation_fee"],
                "distance_km": round(dist_km, 2),
                "is_available": int(doc["is_available"]),
                "accepts_insurance": int(doc["accepts_insurance"]),
                "hospital_type_encoded": ["government", "private", "trust"].index(doc["hospital_type"]) if doc["hospital_type"] in ["government", "private", "trust"] else 1,
                "avg_consultation_minutes": doc["avg_consultation_minutes"],
                "fee_within_budget": int(doc["consultation_fee"] <= max_budget),
                "relevance": rel,
            })

    return pd.DataFrame(rows)


if __name__ == "__main__":
    out = "ml_training/data"
    os.makedirs(f"{out}/bhopal", exist_ok=True)
    os.makedirs(f"{out}/processed", exist_ok=True)

    print("Generating Bhopal doctor data...")
    doctors = generate_doctors(n_per_hospital=15)
    doctors.to_csv(f"{out}/bhopal/doctors.csv", index=False)
    print(f"  → {len(doctors)} doctors saved")

    print("Generating queue history data...")
    queue = generate_queue_data(n_days=180)
    queue.to_csv(f"{out}/bhopal/queue_history.csv", index=False)
    print(f"  → {len(queue)} queue records saved")

    print("Generating symptom classification data...")
    symptoms = generate_symptom_data(n=5000)
    symptoms.to_csv(f"{out}/bhopal/symptoms.csv", index=False)
    print(f"  → {len(symptoms)} symptom records saved")

    print("Generating emergency severity data...")
    emergency = generate_emergency_severity_data(n=8000)
    emergency.to_csv(f"{out}/bhopal/emergency_severity.csv", index=False)
    print(f"  → {len(emergency)} emergency records saved")

    print("Generating doctor ranking data...")
    ranking = generate_doctor_ranking_data(doctors, n_queries=3000)
    ranking.to_csv(f"{out}/bhopal/doctor_ranking.csv", index=False)
    print(f"  → {len(ranking)} ranking records saved")

    # Save hospitals as JSON for the app
    with open(f"{out}/bhopal/hospitals.json", "w") as f:
        json.dump(HOSPITALS, f, indent=2)
    print(f"  → {len(HOSPITALS)} hospitals saved")

    print("\n✅ All Bhopal data generated successfully!")
    print(f"Files in {out}/bhopal/:")
    for f in os.listdir(f"{out}/bhopal"):
        size = os.path.getsize(f"{out}/bhopal/{f}") / 1024
        print(f"  {f}: {size:.1f} KB")
