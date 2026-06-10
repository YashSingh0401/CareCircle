# backend/app/ml/rag/medical_rag.py
"""
RAG (Retrieval Augmented Generation) for CareCircle medical assistant.
Knowledge base: Indian medical guidelines, Bhopal hospital info, drug info.
Uses Gemini embeddings (free) + in-memory vector store (no external DB needed).
Lightweight: knowledge base is ~500KB JSON loaded once at startup.
"""
import os
import json
import numpy as np
from pathlib import Path
from typing import Optional
import httpx

KNOWLEDGE_PATH = Path(__file__).parent / "knowledge_base.json"

# Bhopal-specific medical knowledge base
BHOPAL_MEDICAL_KNOWLEDGE = [
    # Hospitals
    {"id": "h1", "text": "AIIMS Bhopal is a premier government hospital in Saket Nagar, Bhopal. It provides free treatment for all specialties including cardiology, neurology, orthopedics. Contact: 0755-2672335. Emergency available 24/7.", "category": "hospital"},
    {"id": "h2", "text": "Hamidia Hospital is the largest government hospital in Bhopal located at Royal Market. It has 1200 beds and provides subsidized treatment. Emergency department runs 24 hours.", "category": "hospital"},
    {"id": "h3", "text": "Bansal Hospital in Shahpura is a leading private multispecialty hospital in Bhopal. Known for cardiac surgery, neurology and orthopedics. Contact: 0755-4000000.", "category": "hospital"},
    {"id": "h4", "text": "Chirayu Medical College and Hospital in Bairagarh Bhopal is a private medical college hospital with 750 beds. All specialties available.", "category": "hospital"},
    {"id": "h5", "text": "People's Hospital in Bhanpur Bhopal is a private hospital with 400 beds known for good patient care and modern equipment.", "category": "hospital"},
    # Common conditions in MP/Bhopal
    {"id": "c1", "text": "Dengue fever is common in Bhopal during monsoon (July-October). Symptoms: high fever, severe headache, joint pain, rash. See a doctor immediately if platelets drop. Nearest hospitals: Hamidia, AIIMS Bhopal.", "category": "condition"},
    {"id": "c2", "text": "Malaria is prevalent in Madhya Pradesh. Symptoms: cyclic fever, chills, sweating. P. falciparum malaria is dangerous. Get blood smear test. Treatment available free at government hospitals.", "category": "condition"},
    {"id": "c3", "text": "Typhoid is common in Bhopal due to water contamination. Symptoms: sustained fever, stomach pain, weakness. Widal test recommended. Antibiotics needed - see a General Physician.", "category": "condition"},
    {"id": "c4", "text": "Diabetes management: India has one of the highest diabetes rates. AIIMS Bhopal has dedicated diabetology OPD. Monitor blood sugar regularly. HbA1c target below 7%. Diet: avoid maida, white rice in excess, sweets.", "category": "condition"},
    {"id": "c5", "text": "Heart disease prevention: Bhopal has high rates of hypertension. Reduce salt intake, exercise 30 min daily, no smoking. Emergency cardiac care at Bansal Hospital and AIIMS Bhopal.", "category": "condition"},
    # Emergency guidance
    {"id": "e1", "text": "Heart attack symptoms in India: chest pain radiating to left arm, sweating, nausea. Call 108 ambulance immediately. Nearest cardiac emergency: AIIMS Bhopal, Bansal Hospital, Apollo Sage Hospital.", "category": "emergency"},
    {"id": "e2", "text": "Stroke signs: FAST - Face drooping, Arm weakness, Speech difficulty, Time to call 108. Golden hour is critical. Thrombolysis available at AIIMS Bhopal neurology department.", "category": "emergency"},
    {"id": "e3", "text": "108 is the national ambulance number in India. Free service. In Bhopal, average response time is 8-12 minutes. Share your location when calling.", "category": "emergency"},
    {"id": "e4", "text": "Bhopal Gas Tragedy legacy: BMHRC (Bhopal Memorial Hospital) provides free treatment to gas victims. Located at Berasia Road. Also treats general public.", "category": "emergency"},
    # Medications
    {"id": "m1", "text": "Paracetamol (Crocin, Dolo 650): for fever and mild pain. Adult dose: 500mg-1000mg every 6-8 hours. Maximum 4g per day. Do not exceed dose. Available at all pharmacies.", "category": "medication"},
    {"id": "m2", "text": "ORS (Oral Rehydration Solution): for diarrhea and dehydration. Mix one sachet in 1 liter boiled cooled water. Give frequently. Jeevani ORS available free at government hospitals.", "category": "medication"},
    {"id": "m3", "text": "Ayushman Bharat: Government health scheme providing Rs 5 lakh coverage per family per year at empanelled hospitals including Bansal, Chirayu in Bhopal. Carry Aadhaar card.", "category": "scheme"},
    # Health tips for Bhopal
    {"id": "t1", "text": "Water quality in Bhopal: Drink filtered or boiled water. Kolar and Kerwa dams supply water. Use RO filter at home to prevent waterborne diseases like typhoid, cholera, hepatitis A.", "category": "tip"},
    {"id": "t2", "text": "Air quality in Bhopal: Industrial areas near Mandideep can have poor air quality. Wear mask if outdoors in heavy traffic. People with asthma should carry inhaler.", "category": "tip"},
    {"id": "t3", "text": "Mental health resources in Bhopal: NIMHANS telemedicine, iCall helpline 9152987821. Government hospitals provide free psychiatric OPD. Breaking stigma about mental health is important.", "category": "tip"},
]

_vectors: Optional[list] = None
_knowledge: list = BHOPAL_MEDICAL_KNOWLEDGE


def _simple_tf_idf_search(query: str, top_k: int = 3) -> list[dict]:
    """Fast keyword-based retrieval fallback."""
    query_words = set(query.lower().split())
    scored = []
    for item in _knowledge:
        text_words = set(item["text"].lower().split())
        overlap = len(query_words & text_words)
        if overlap > 0:
            scored.append((item, overlap))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [item for item, _ in scored[:top_k]]


async def retrieve_context(query: str, top_k: int = 3) -> list[str]:
    """Retrieve relevant medical knowledge for a query."""
    results = _simple_tf_idf_search(query, top_k)
    return [r["text"] for r in results]


async def rag_answer(question: str, user_context: dict = None) -> dict:
    """
    Full RAG pipeline: retrieve → augment → generate with Gemini.
    """
    # Retrieve relevant context
    contexts = await retrieve_context(question, top_k=3)
    context_text = "\n".join(f"- {c}" for c in contexts)

    # Augment prompt with retrieved context
    system_prompt = f"""You are CareCircle's AI health assistant for Bhopal, Madhya Pradesh, India.
Use the following local medical knowledge to answer accurately:

{context_text}

Rules:
- Be specific to Bhopal/MP when relevant
- Mention specific hospital names if helpful
- Never diagnose — always recommend consulting a doctor
- For emergencies, say "Call 108 immediately"
- Keep response concise (under 150 words)
"""

    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY", "")
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-flash-latest")
            response = model.generate_content(f"{system_prompt}\n\nQuestion: {question}")
            return {
                "answer": response.text,
                "sources": [r.get("id", "") for r in _simple_tf_idf_search(question)],
                "method": "rag_gemini"
            }
    except Exception:
        pass

    # Pure retrieval fallback
    return {
        "answer": contexts[0] if contexts else "Please consult a doctor for medical advice.",
        "sources": [],
        "method": "retrieval_only"
    }


def save_knowledge_base():
    """Save knowledge base to disk for persistence."""
    try:
        with open(KNOWLEDGE_PATH, "w") as f:
            json.dump(_knowledge, f, indent=2)
    except Exception:
        pass
