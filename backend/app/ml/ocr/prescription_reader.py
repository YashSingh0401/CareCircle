# backend/app/ml/ocr/prescription_reader.py
import io
import re
from PIL import Image
import pytesseract
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.gemini_api_key)

class PrescriptionReader:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def extract_text_tesseract(self, image_bytes: bytes) -> str:
        """Extract raw text from prescription image using Tesseract OCR"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Preprocess for better OCR
            image = image.convert('L')  # grayscale
            text = pytesseract.image_to_string(image, lang='eng')
            return text.strip()
        except Exception as e:
            return f"OCR failed: {str(e)}"

    async def parse_prescription(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
        """Use Gemini vision to parse prescription details"""
        try:
            image_part = {"mime_type": mime_type, "data": image_bytes}
            prompt = """Extract information from this medical prescription and return ONLY JSON:
{
  "doctor_name": "name or null",
  "patient_name": "name or null",
  "date": "date or null",
  "medications": [
    {
      "name": "drug name",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. twice daily",
      "duration": "e.g. 5 days",
      "notes": "with food, etc."
    }
  ],
  "instructions": "general instructions",
  "follow_up": "follow-up date or null",
  "diagnosis": "diagnosis if mentioned or null"
}"""
            response = self.model.generate_content([prompt, image_part])
            import json
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text.strip())
        except Exception:
            # Fallback to Tesseract
            raw_text = self.extract_text_tesseract(image_bytes)
            return {
                "raw_text": raw_text,
                "medications": [],
                "instructions": raw_text,
                "error": "AI parsing failed, raw text extracted"
            }

    def extract_medications_from_text(self, text: str) -> list[dict]:
        """Simple regex-based medication extraction fallback"""
        medications = []
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            # Common patterns: "Paracetamol 500mg - 3 times daily x 5 days"
            match = re.match(r'([A-Za-z\s]+)\s+(\d+\s*mg|\d+\s*ml|tablet|capsule)', line, re.I)
            if match:
                medications.append({
                    "name": match.group(1).strip(),
                    "dosage": match.group(2).strip(),
                    "frequency": "",
                    "duration": "",
                    "notes": line
                })
        return medications
