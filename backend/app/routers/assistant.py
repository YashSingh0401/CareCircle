# backend/app/routers/assistant.py
"""
Main AI/ML assistant router - wires ALL real models together:
- ClinicalBERT (HF API) â†’ symptom â†’ department classification
- CatBoost â†’ emergency severity prediction
- XGBoost LTR â†’ doctor ranking
- Sentence Transformers (HF API) â†’ semantic search
- RAG â†’ Bhopal medical knowledge retrieval
- Gemini â†’ conversational AI + report analysis
- Isolation Forest â†’ anomaly detection
- TrOCR (HF API) â†’ prescription OCR
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional

from app.auth import get_current_user
from app.ml.ai.chatbot import MedicalChatbot
from app.ml.ai.report_analyzer import ReportAnalyzer
from app.ml.clinical_bert.symptom_classifier import classify_multiple, classify_symptom
from app.ml.catboost_severity.severity_model import predict_severity
from app.ml.xgboost_ltr.ranker import rank_doctors
from app.ml.sentence_transformers.semantic_search import semantic_rank_doctors, search_hospitals
from app.ml.rag.medical_rag import rag_answer
from app.ml.isolation_forest.anomaly_detector import detect_suspicious_review
from app.ml.trocr.prescription_reader import parse_prescription
from app.db import supabase as neon

router = APIRouter()
chatbot = MedicalChatbot()
analyzer = ReportAnalyzer()

# â”€â”€ Request / Response models â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_id: str

class SymptomsRequest(BaseModel):
    symptoms: list[str]
    user_id: str

class EmergencyPredictRequest(BaseModel):
    symptoms: list[str]
    heart_rate: Optional[float] = 80
    bp_systolic: Optional[float] = 120
    spo2: Optional[float] = 98
    temperature: Optional[float] = 98.6
    respiratory_rate: Optional[float] = 16
    pain_scale: Optional[int] = 5
    alert_type: Optional[str] = "other"
    age: Optional[int] = 35

class RecommendRequest(BaseModel):
    specialization: Optional[str] = None
    symptoms: Optional[list[str]] = None
    hospital_id: Optional[str] = None
    user_lat: Optional[float] = 23.2330
    user_lon: Optional[float] = 77.4019
    max_fee: Optional[float] = 5000
    min_experience: Optional[int] = 0
    query: Optional[str] = None

class ReportRequest(BaseModel):
    report_text: str
    record_type: str = "lab_report"

class ReviewRequest(BaseModel):
    rating: int
    text: str
    posted_at: Optional[str] = None
    appointment_date: Optional[str] = None

class SemanticSearchRequest(BaseModel):
    query: str
    search_type: str = "doctors"  # doctors | hospitals

# â”€â”€ Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@router.post("/chat")
async def chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    """RAG-enhanced conversational AI using Gemini + Bhopal knowledge base."""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    # Use RAG for knowledge-based questions, chatbot for conversational
    rag_keywords = ["hospital", "doctor", "where", "which", "cost", "fee", "bhopal", "address", "phone", "how to get"]
    use_rag = any(kw in req.message.lower() for kw in rag_keywords)
    if use_rag:
        result = await rag_answer(req.message)
        return {"response": result["answer"], "suggested_actions": [], "method": result["method"]}
    return await chatbot.get_response(req.message, req.session_id, req.user_id)


@router.post("/symptoms")
async def check_symptoms(req: SymptomsRequest, user: dict = Depends(get_current_user)):
    """
    Full symptom analysis pipeline:
    1. ClinicalBERT (HF API) â†’ department classification
    2. Keyword severity â†’ seek_emergency flag
    3. Returns department recommendation + advice
    """
    if not req.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms list cannot be empty")

    combined = " ".join(req.symptoms)
    # ClinicalBERT classification
    classification = await classify_multiple(req.symptoms)
    dept = classification["department"]

    # Quick severity from symptom keywords
    emergency_keywords = ["chest pain", "heart attack", "stroke", "unconscious",
                          "breathing difficulty", "severe bleeding", "fainting", "paralysis"]
    seek_emergency = any(kw in combined.lower() for kw in emergency_keywords)
    severity_score = 0.9 if seek_emergency else 0.4

    # Get AI advice via RAG
    rag_result = await rag_answer(f"What should I do if I have {combined}?")
    advice = rag_result.get("answer", "Please consult a doctor.")

    # Log to symptom_logs
    try:
        await neon.execute(
            """
            INSERT INTO symptom_logs (patient_id, symptoms, severity_score,
                                      recommended_specialization, ai_response)
            VALUES ($1, $2, $3, $4, $5)
            """,
            req.user_id, req.symptoms, severity_score, dept, advice,
        )
    except Exception:
        pass

    return {
        "severity_score": severity_score,
        "predicted_conditions": [dept],
        "recommended_specialization": dept,
        "advice": advice,
        "seek_emergency": seek_emergency,
        "classification_confidence": classification.get("confidence", 0.7),
        "classification_method": classification.get("method", "keyword"),
    }


@router.post("/emergency-severity")
async def predict_emergency_severity(req: EmergencyPredictRequest, user: dict = Depends(get_current_user)):
    """
    Real CatBoost model predicts emergency severity (1-5).
    Uses vitals + symptoms for prediction.
    """
    alert_map = {"cardiac": 0, "respiratory": 1, "trauma": 2, "stroke": 3, "allergic": 4, "other": 5}
    combined = " ".join(req.symptoms).lower()

    features = {
        "heart_rate": req.heart_rate,
        "bp_systolic": req.bp_systolic,
        "spo2": req.spo2,
        "temperature": req.temperature,
        "respiratory_rate": req.respiratory_rate,
        "pain_scale": req.pain_scale,
        "emergency_type_encoded": alert_map.get(req.alert_type, 5),
        "has_chest_pain": int("chest" in combined or "cardiac" in req.alert_type),
        "has_breathing_difficulty": int("breath" in combined or "respiratory" in req.alert_type),
        "has_unconsciousness": int("unconscious" in combined or "faint" in combined),
        "has_bleeding": int("bleed" in combined or "trauma" in req.alert_type),
        "has_stroke_signs": int("stroke" in combined or "paralysis" in combined),
        "age": req.age,
        "age_risk": int(req.age > 60 or req.age < 5),
    }

    result = predict_severity(features)
    return result


@router.post("/recommend-doctors")
async def recommend_doctors(req: RecommendRequest, user: dict = Depends(get_current_user)):
    """
    Real XGBoost LTR + Semantic search doctor recommendation.
    1. If symptoms given â†’ ClinicalBERT to get specialization
    2. Fetch doctors from DB filtered by specialization
    3. XGBoost LTR ranks them
    4. Semantic search re-ranks if query provided
    """
    spec = req.specialization

    # Auto-detect specialization from symptoms
    if not spec and req.symptoms:
        classification = await classify_multiple(req.symptoms)
        spec = classification["department"]

    # Build a parameterized SQL query â€” doctors LEFT JOIN hospitals for coords
    where = ["d.is_available = TRUE"]
    args: list = []
    if spec and spec != "General Medicine":
        args.append(f"%{spec.split()[0]}%")
        where.append(f"d.specialization ILIKE ${len(args)}")
    if req.hospital_id:
        args.append(req.hospital_id)
        where.append(f"d.hospital_id = ${len(args)}")
    if req.max_fee:
        args.append(req.max_fee)
        where.append(f"d.consultation_fee <= ${len(args)}")
    if req.min_experience:
        args.append(req.min_experience)
        where.append(f"d.experience_years >= ${len(args)}")

    sql = f"""
        SELECT d.*,
               h.name      AS hospital_name,
               h.city      AS hospital_city,
               h.area      AS hospital_area,
               h.latitude  AS hospital_lat,
               h.longitude AS hospital_lon,
               h.type      AS hospital_type
        FROM doctors d
        LEFT JOIN hospitals h ON h.id = d.hospital_id
        WHERE {' AND '.join(where)}
        LIMIT 30
    """
    doctors = await neon.fetch(sql, *args)

    # Default coords / type when hospital is missing
    for d in doctors:
        if d.get("hospital_lat") is None:
            d["hospital_lat"] = req.user_lat
        if d.get("hospital_lon") is None:
            d["hospital_lon"] = req.user_lon
        if not d.get("hospital_type"):
            d["hospital_type"] = "private"

    # XGBoost LTR ranking
    doctors = rank_doctors(doctors, req.user_lat, req.user_lon, req.max_fee or 5000)

    # Semantic re-ranking if query provided
    if req.query and doctors:
        doctors = await semantic_rank_doctors(req.query, doctors[:15])

    return {
        "doctors": doctors[:8],
        "count": len(doctors),
        "detected_specialization": spec,
        "ranking_method": "xgboost_ltr",
    }


@router.post("/analyze-report")
async def analyze_report(req: ReportRequest, user: dict = Depends(get_current_user)):
    """Gemini-powered medical report analysis."""
    if not req.report_text.strip():
        raise HTTPException(status_code=400, detail="Report text cannot be empty")
    return await analyzer.analyze_report(req.report_text, req.record_type)


@router.post("/semantic-search")
async def semantic_search(req: SemanticSearchRequest, user: dict = Depends(get_current_user)):
    """Semantic search for doctors or hospitals using Sentence Transformers."""
    if req.search_type == "hospitals":
        items = await neon.fetch("SELECT * FROM hospitals WHERE is_active = TRUE")
        ranked = await search_hospitals(req.query, items)
        return {"results": ranked[:6], "type": "hospitals"}
    else:
        items = await neon.fetch(
            """
            SELECT d.*, h.name AS hospital_name
            FROM doctors d
            LEFT JOIN hospitals h ON h.id = d.hospital_id
            WHERE d.is_available = TRUE
            """
        )
        ranked = await semantic_rank_doctors(req.query, items)
        return {"results": ranked[:8], "type": "doctors"}


@router.post("/ocr-prescription")
async def ocr_prescription(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """
    TrOCR (HF API) + Gemini prescription parser.
    Extracts medication names, dosages, instructions from handwritten prescriptions.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files accepted (jpg, png)")
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")
    return await parse_prescription(content, file.content_type)


@router.post("/check-review")
async def check_review(req: ReviewRequest, user: dict = Depends(get_current_user)):
    """Isolation Forest detects suspicious/fake reviews."""
    return detect_suspicious_review(req.dict())


@router.post("/rag-query")
async def rag_query(body: dict, user: dict = Depends(get_current_user)):
    """Direct RAG query for Bhopal medical knowledge."""
    question = body.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="Question required")
    return await rag_answer(question)
