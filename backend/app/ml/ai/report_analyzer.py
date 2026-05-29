# backend/app/ml/ai/report_analyzer.py
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.gemini_api_key)

class ReportAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def analyze_report(self, report_text: str, record_type: str = "lab_report") -> dict:
        prompt = f"""You are a medical report explainer for Indian patients. Analyze this {record_type} and respond in this EXACT JSON format:

{{
  "summary": "2-3 sentence plain language summary",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "abnormal_values": ["value that is high/low: explanation"],
  "patient_explanation": "Simple explanation as if talking to a non-medical person",
  "next_steps": ["step 1", "step 2"],
  "questions_for_doctor": ["question 1", "question 2"],
  "urgency_level": "routine|soon|urgent"
}}

Report:
{report_text}

Return ONLY valid JSON, nothing else."""

        try:
            response = self.model.generate_content(prompt)
            import json
            text = response.text.strip()
            # Clean markdown code blocks if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text.strip())
        except Exception:
            return {
                "summary": "Report received. AI analysis encountered an issue.",
                "key_findings": [],
                "abnormal_values": [],
                "patient_explanation": "Please consult your doctor for interpretation of this report.",
                "next_steps": ["Consult your doctor"],
                "questions_for_doctor": ["Can you explain the main findings?"],
                "urgency_level": "routine"
            }

    async def analyze_image_report(self, image_data: bytes, mime_type: str) -> dict:
        """Analyze image-based medical reports (X-rays, scan reports)"""
        try:
            image_part = {"mime_type": mime_type, "data": image_data}
            prompt = "Analyze this medical image/report. Provide: 1) Simple summary 2) Key findings 3) What it means for the patient 4) Recommended next steps. Use plain language."
            response = self.model.generate_content([prompt, image_part])
            return {"analysis": response.text, "type": "image_analysis"}
        except Exception:
            return {"analysis": "Image analysis failed. Please consult your doctor.", "type": "error"}
