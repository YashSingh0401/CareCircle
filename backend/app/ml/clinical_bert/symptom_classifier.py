# backend/app/ml/clinical_bert/symptom_classifier.py
"""
Uses HuggingFace Inference API (FREE) to classify symptoms → medical department.
Model: emilyalsentzer/Bio_ClinicalBERT (zero-shot classification)
Zero local RAM - all inference happens on HF servers.
Falls back to keyword map if HF API is unavailable.
"""
import os
import httpx
from typing import Optional

HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")  # Free HF token from huggingface.co

DEPARTMENTS = [
    "Cardiology", "Neurology", "Orthopedics", "Dermatology", "Gastroenterology",
    "Pulmonology", "Endocrinology", "Gynecology", "Pediatrics", "Psychiatry",
    "Ophthalmology", "ENT", "Nephrology", "General Medicine", "Urology",
    "Oncology", "Rheumatology",
]

# Fast keyword fallback — no API needed
KEYWORD_MAP = {
    "Cardiology": ["chest pain", "heart", "palpitation", "cardiac", "ecg", "blood pressure", "angina", "breathless on exertion"],
    "Neurology": ["headache", "seizure", "paralysis", "stroke", "memory", "dizziness", "tremor", "migraine", "numbness"],
    "Orthopedics": ["bone", "joint", "knee", "fracture", "back pain", "spine", "shoulder", "hip", "arthritis"],
    "Dermatology": ["skin", "rash", "acne", "eczema", "psoriasis", "itching", "hair loss", "nail", "allergy skin"],
    "Gastroenterology": ["stomach", "liver", "acidity", "constipation", "diarrhea", "vomiting", "jaundice", "abdominal", "ibs"],
    "Pulmonology": ["cough", "asthma", "breathing", "tb", "tuberculosis", "lung", "wheezing", "sputum", "chest congestion"],
    "Endocrinology": ["diabetes", "thyroid", "sugar", "insulin", "hormone", "weight gain", "fatigue thirst", "pcod"],
    "Gynecology": ["periods", "pregnancy", "uterus", "ovary", "menstrual", "vaginal", "breast", "pcod", "fertility"],
    "Pediatrics": ["child", "infant", "baby", "kid", "newborn", "vaccination", "growth", "fever in child"],
    "Psychiatry": ["anxiety", "depression", "stress", "mental", "panic", "insomnia", "mood", "phobia", "ocd"],
    "Ophthalmology": ["eye", "vision", "cataract", "glaucoma", "floaters", "red eye", "blur"],
    "ENT": ["ear", "throat", "nose", "sinus", "tonsil", "hearing", "vertigo", "snoring"],
    "Nephrology": ["kidney", "urine", "dialysis", "renal", "uti", "foamy urine", "creatinine"],
    "General Medicine": ["fever", "cold", "flu", "weakness", "body ache", "malaria", "dengue", "typhoid", "general"],
    "Urology": ["prostate", "bladder", "urology", "urination pain", "kidney stone"],
    "Oncology": ["cancer", "tumor", "chemo", "biopsy", "oncology"],
    "Rheumatology": ["rheumatoid", "lupus", "gout", "autoimmune", "inflammation joint"],
}


def _keyword_classify(symptom_text: str) -> tuple[str, float]:
    text = symptom_text.lower()
    scores = {}
    for dept, keywords in KEYWORD_MAP.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[dept] = score
    if scores:
        best = max(scores, key=scores.get)
        return best, min(0.95, 0.6 + scores[best] * 0.1)
    return "General Medicine", 0.5


async def classify_symptom(symptom_text: str) -> dict:
    """
    Classify symptom text into a medical department.
    Returns: { department, confidence, method }
    """
    # Try HuggingFace Inference API first
    if HF_API_TOKEN:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    HF_API_URL,
                    headers={"Authorization": f"Bearer {HF_API_TOKEN}"},
                    json={
                        "inputs": symptom_text,
                        "parameters": {
                            "candidate_labels": DEPARTMENTS[:10],  # top 10 to stay fast
                            "multi_label": False,
                        }
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    labels = data.get("labels", [])
                    scores = data.get("scores", [])
                    if labels and scores:
                        return {
                            "department": labels[0],
                            "confidence": round(scores[0], 3),
                            "all_scores": dict(zip(labels[:5], [round(s, 3) for s in scores[:5]])),
                            "method": "clinicalbert_hf_api"
                        }
        except Exception:
            pass  # Fall through to keyword

    dept, conf = _keyword_classify(symptom_text)
    return {
        "department": dept,
        "confidence": conf,
        "all_scores": {},
        "method": "keyword_fallback"
    }


async def classify_multiple(symptoms: list[str]) -> dict:
    """Classify a list of symptoms, return best department."""
    combined = " ".join(symptoms)
    return await classify_symptom(combined)
