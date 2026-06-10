# backend/app/ml/prediction/severity_predictor.py
import google.generativeai as genai
from app.config import settings
import json

genai.configure(api_key=settings.gemini_api_key)

# Symptom-to-specialization mapping for fast fallback
SYMPTOM_SPECIALIZATION_MAP = {
    "chest pain": "Cardiologist", "heart": "Cardiologist", "palpitation": "Cardiologist",
    "breathing": "Pulmonologist", "cough": "Pulmonologist", "asthma": "Pulmonologist",
    "headache": "Neurologist", "seizure": "Neurologist", "memory": "Neurologist",
    "stomach": "Gastroenterologist", "abdomen": "Gastroenterologist", "liver": "Gastroenterologist",
    "skin": "Dermatologist", "rash": "Dermatologist", "acne": "Dermatologist",
    "bone": "Orthopedist", "joint": "Orthopedist", "fracture": "Orthopedist",
    "eye": "Ophthalmologist", "vision": "Ophthalmologist",
    "ear": "ENT Specialist", "throat": "ENT Specialist", "nose": "ENT Specialist",
    "child": "Pediatrician", "infant": "Pediatrician",
    "pregnancy": "Gynecologist", "menstrual": "Gynecologist",
    "diabetes": "Endocrinologist", "thyroid": "Endocrinologist", "hormone": "Endocrinologist",
    "kidney": "Nephrologist", "urine": "Nephrologist",
    "cancer": "Oncologist", "tumor": "Oncologist",
    "anxiety": "Psychiatrist", "depression": "Psychiatrist", "mental": "Psychiatrist",
}

EMERGENCY_SYMPTOMS = [
    "chest pain", "heart attack", "stroke", "breathing difficulty", "unconscious",
    "severe bleeding", "fainting", "paralysis", "seizure", "severe allergic"
]

class SeverityPredictor:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def predict(self, symptoms: list[str]) -> dict:
        symptoms_text = ", ".join(symptoms).lower()

        # Check for emergency
        is_emergency = any(e in symptoms_text for e in EMERGENCY_SYMPTOMS)

        # Fast specialization from keyword map
        recommended_spec = "General Physician"
        for keyword, spec in SYMPTOM_SPECIALIZATION_MAP.items():
            if keyword in symptoms_text:
                recommended_spec = spec
                break

        try:
            prompt = f"""Analyze these symptoms and respond ONLY in JSON:
{{
  "severity_score": 0.0-1.0,
  "predicted_conditions": ["condition1", "condition2"],
  "recommended_specialization": "specialist name",
  "advice": "brief advice in 2 sentences",
  "seek_emergency": true/false
}}

Symptoms: {symptoms_text}
Return ONLY valid JSON."""

            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            result = json.loads(text.strip())
            result["seek_emergency"] = result.get("seek_emergency", is_emergency) or is_emergency
            return result
        except Exception:
            # Fallback
            severity = 0.8 if is_emergency else 0.4
            return {
                "severity_score": severity,
                "predicted_conditions": ["Needs medical evaluation"],
                "recommended_specialization": recommended_spec,
                "advice": "Please consult a doctor for proper evaluation of your symptoms.",
                "seek_emergency": is_emergency
            }
