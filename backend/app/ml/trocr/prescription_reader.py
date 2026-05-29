# backend/app/ml/trocr/prescription_reader.py
"""
TrOCR for handwritten prescription reading via HuggingFace Inference API.
Model: microsoft/trocr-base-handwritten (via HF API - zero local RAM)
Falls back to Tesseract OCR if HF API unavailable.
Then uses Gemini to parse the extracted text into structured data.
"""
import os
import base64
import httpx
import io
from PIL import Image

HF_TROCR_URL = "https://api-inference.huggingface.co/models/microsoft/trocr-base-handwritten"
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")


async def extract_text_trocr(image_bytes: bytes) -> str:
    """Use TrOCR via HF API to extract text from handwritten prescription."""
    if HF_API_TOKEN:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    HF_TROCR_URL,
                    headers={"Authorization": f"Bearer {HF_API_TOKEN}"},
                    content=image_bytes,
                    headers_update={"Content-Type": "image/jpeg"}
                )
                if resp.status_code == 200:
                    result = resp.json()
                    if isinstance(result, list) and result:
                        return result[0].get("generated_text", "")
                    elif isinstance(result, dict):
                        return result.get("generated_text", "")
        except Exception:
            pass

    # Tesseract fallback
    return _tesseract_fallback(image_bytes)


def _tesseract_fallback(image_bytes: bytes) -> str:
    try:
        import pytesseract
        image = Image.open(io.BytesIO(image_bytes)).convert("L")
        return pytesseract.image_to_string(image, lang="eng").strip()
    except Exception:
        return ""


async def parse_prescription(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Full pipeline: TrOCR → Gemini parse → structured output
    """
    raw_text = await extract_text_trocr(image_bytes)

    if not raw_text:
        return {
            "raw_text": "",
            "medications": [],
            "instructions": "Could not extract text from image",
            "error": "OCR failed"
        }

    # Use Gemini to parse the raw OCR text into structured data
    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY", "")
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""Parse this prescription OCR text into structured JSON. Return ONLY valid JSON:
{{
  "doctor_name": "name or null",
  "patient_name": "name or null", 
  "date": "date or null",
  "medications": [
    {{"name": "drug", "dosage": "500mg", "frequency": "twice daily", "duration": "5 days", "notes": ""}}
  ],
  "instructions": "general instructions",
  "diagnosis": "diagnosis if mentioned or null"
}}

OCR Text:
{raw_text}"""
            response = model.generate_content(prompt)
            import json
            text = response.text.strip().lstrip("```json").rstrip("```").strip()
            parsed = json.loads(text)
            parsed["raw_text"] = raw_text
            parsed["ocr_method"] = "trocr_hf_api" if HF_API_TOKEN else "tesseract"
            return parsed
    except Exception:
        pass

    return {
        "raw_text": raw_text,
        "medications": [],
        "instructions": raw_text,
        "ocr_method": "tesseract_raw"
    }
