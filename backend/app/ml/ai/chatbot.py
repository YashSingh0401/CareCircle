# backend/app/ml/ai/chatbot.py
import google.generativeai as genai
from app.config import settings
from typing import Optional

genai.configure(api_key=settings.gemini_api_key)

SYSTEM_PROMPT = """You are CareCircle's AI Health Assistant, built for Indian patients.

Your role:
- Help patients understand symptoms and when to seek care
- Explain medical reports in simple, clear language
- Provide general wellness and lifestyle guidance
- Guide patients to appropriate specialists

Rules you MUST follow:
- NEVER diagnose a condition definitively
- ALWAYS recommend seeing a doctor for serious symptoms
- Be empathetic, clear, and use simple non-medical language
- If symptoms sound like a heart attack, stroke, or life-threatening emergency, IMMEDIATELY say "SEEK EMERGENCY CARE NOW — call 102"
- Keep responses concise (under 200 words unless explaining a complex topic)
- Use Indian context (e.g., AIIMS, Ayushman Bharat, ABHA)
- Suggested actions must be from: ["Find a Doctor", "Book Appointment", "Emergency SOS", "View Records"]"""

class MedicalChatbot:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def get_response(self, message: str, session_id: str, user_id: str) -> dict:
        try:
            response = self.model.generate_content(
                f"{SYSTEM_PROMPT}\n\nPatient message: {message}"
            )
            text = response.text
            actions = self._extract_actions(text)
            return {"response": text, "suggested_actions": actions}
        except Exception as e:
            return {
                "response": "I'm having trouble responding right now. For urgent issues, please call 102 or use Emergency SOS.",
                "suggested_actions": ["Emergency SOS"]
            }

    def _extract_actions(self, text: str) -> list[str]:
        actions = []
        lower = text.lower()
        if any(w in lower for w in ["emergency", "immediately", "call 102", "urgent", "911"]):
            actions.append("Emergency SOS")
        if any(w in lower for w in ["doctor", "specialist", "physician", "consult"]):
            actions.append("Find a Doctor")
        if any(w in lower for w in ["appointment", "book", "schedule", "visit"]):
            actions.append("Book Appointment")
        return list(dict.fromkeys(actions))[:3]  # deduplicate, max 3
