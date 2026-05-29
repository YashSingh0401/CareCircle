# backend/app/routers/records.py
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.auth import get_current_user
from app.db import supabase as neon
from app.ml.ai.report_analyzer import ReportAnalyzer
from app.ml.trocr.prescription_reader import parse_prescription

router = APIRouter()
analyzer = ReportAnalyzer()

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"  # backend/uploads
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
_SAFE_FILENAME_RE = re.compile(r"[^A-Za-z0-9._-]+")


class AnalyzeRequest(BaseModel):
    record_id: str
    report_text: str
    record_type: str = "lab_report"


class RecordCreate(BaseModel):
    patient_id: str
    record_type: str = "lab_report"
    record_date: str | None = None
    doctor_id: str | None = None
    hospital_id: str | None = None
    title: str | None = None
    description: str | None = None
    report_text: str | None = None
    file_url: str | None = None


@router.post("/analyze")
async def analyze_record(req: AnalyzeRequest, user: dict = Depends(get_current_user)):
    """Gemini AI analyzes a medical report and saves summary back to record."""
    result = await analyzer.analyze_report(req.report_text, req.record_type)
    await neon.execute(
        """
        UPDATE medical_records
        SET ai_summary = $1, ai_explanation = $2
        WHERE id = $3
        """,
        result.get("summary", ""),
        result.get("patient_explanation", ""),
        req.record_id,
    )
    return result


@router.post("/ocr-prescription")
async def ocr_prescription(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """TrOCR + Gemini parses handwritten prescriptions."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files accepted (jpg, png, webp)")
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")
    return await parse_prescription(content, file.content_type or "image/jpeg")


@router.post("/")
async def create_record(req: RecordCreate, user: dict = Depends(get_current_user)):
    row = await neon.fetchrow(
        """
        INSERT INTO medical_records
            (patient_id, record_type, record_date, doctor_id, hospital_id,
             title, description, report_text, file_url)
        VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE), $4, $5, $6, $7, $8, $9)
        RETURNING *
        """,
        req.patient_id, req.record_type, req.record_date, req.doctor_id, req.hospital_id,
        req.title, req.description, req.report_text, req.file_url,
    )
    return row


@router.get("/patient/{patient_id}")
async def get_patient_records(
    patient_id: str,
    record_type: str = None,
    user: dict = Depends(get_current_user),
):
    """Fetch all medical records for a patient."""
    where = ["mr.patient_id = $1"]
    args: list = [patient_id]
    if record_type:
        args.append(record_type)
        where.append(f"mr.record_type = ${len(args)}")

    sql = f"""
        SELECT mr.*,
               d.name           AS doctor_name,
               d.specialization AS doctor_specialization,
               h.name           AS hospital_name
        FROM medical_records mr
        LEFT JOIN doctors   d ON d.id = mr.doctor_id
        LEFT JOIN hospitals h ON h.id = mr.hospital_id
        WHERE {' AND '.join(where)}
        ORDER BY mr.record_date DESC
    """
    return {"records": await neon.fetch(sql, *args)}


@router.get("/patient/{patient_id}/prescriptions")
async def get_patient_prescriptions(patient_id: str, user: dict = Depends(get_current_user)):
    rows = await neon.fetch(
        """
        SELECT p.*,
               d.name AS doctor_name
        FROM prescriptions p
        LEFT JOIN doctors d ON d.id = p.doctor_id
        WHERE p.patient_id = $1
        ORDER BY p.prescribed_at DESC
        """,
        patient_id,
    )
    return {"prescriptions": rows}


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Save an uploaded file under backend/uploads/{user_id}/ and return its URL.

    NOTE: Local-disk storage for dev. For production, swap save_to_disk() with
    an S3/R2 client (boto3.put_object) and return a CDN URL instead.
    """
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(400, "File too large (max 10MB)")
    if not file.filename:
        raise HTTPException(400, "Missing filename")

    safe_name = _SAFE_FILENAME_RE.sub("_", file.filename)[:120] or "file"
    user_dir = UPLOAD_ROOT / user["user_id"]
    user_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{safe_name}"
    target = user_dir / stored_name
    target.write_bytes(content)

    return {
        "file_url": f"/uploads/{user['user_id']}/{stored_name}",
        "file_size": len(content),
        "mime_type": file.content_type or "application/octet-stream",
    }


@router.post("/analyze-image")
async def analyze_image_report(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Use Gemini vision to analyze image-based medical reports (X-rays, scan reports)."""
    if not file.content_type:
        raise HTTPException(status_code=400, detail="No content type")
    content = await file.read()
    return await analyzer.analyze_image_report(content, file.content_type)
