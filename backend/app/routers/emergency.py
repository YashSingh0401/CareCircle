# backend/app/routers/emergency.py
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user
from app.db import supabase as neon
from app.ml.prediction.severity_predictor import SeverityPredictor

router = APIRouter()
predictor = SeverityPredictor()


class EmergencyRequest(BaseModel):
    patient_id: str
    hospital_id: str | None = None
    alert_type: str
    symptoms: list[str] = []
    description: str | None = None
    location_latitude: float | None = None
    location_longitude: float | None = None


@router.post("/alert")
async def create_emergency(req: EmergencyRequest, user: dict = Depends(get_current_user)):
    severity_result = await predictor.predict(req.symptoms or [req.alert_type])
    severity = int(severity_result["severity_score"] * 5)
    severity = max(1, min(5, severity))

    now = datetime.utcnow()
    row = await neon.fetchrow(
        """
        INSERT INTO emergency_alerts
            (patient_id, hospital_id, alert_type, severity_level, symptoms,
             description, location_latitude, location_longitude, status,
             created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, $9)
        RETURNING id
        """,
        req.patient_id, req.hospital_id, req.alert_type, severity, req.symptoms,
        req.description, req.location_latitude, req.location_longitude, now,
    )

    return {
        "alert_id": row["id"] if row else None,
        "severity_level": severity,
        "seek_emergency": severity_result["seek_emergency"],
        "message": "Emergency alert dispatched",
    }


@router.get("/active")
async def get_active_emergencies(
    hospital_id: str | None = None,
    user: dict = Depends(get_current_user),
):
    where = ["ea.status = ANY($1::text[])"]
    args: list = [["active", "acknowledged", "dispatched"]]
    if hospital_id:
        args.append(hospital_id)
        where.append(f"ea.hospital_id = ${len(args)}")

    sql = f"""
        SELECT ea.*,
               p.full_name   AS patient_full_name,
               p.phone       AS patient_phone,
               p.blood_group AS patient_blood_group
        FROM emergency_alerts ea
        LEFT JOIN profiles p ON p.id = ea.patient_id
        WHERE {' AND '.join(where)}
        ORDER BY ea.severity_level DESC, ea.created_at
    """
    emergencies = await neon.fetch(sql, *args)
    return {"emergencies": emergencies}


@router.patch("/{alert_id}/status")
async def update_status(
    alert_id: str,
    status: str,
    responder_notes: str | None = None,
    user: dict = Depends(get_current_user),
):
    now = datetime.utcnow()
    resolved_at = now if status == "resolved" else None
    await neon.execute(
        """
        UPDATE emergency_alerts
        SET status = $1,
            updated_at = $2,
            responder_notes = COALESCE($3, responder_notes),
            resolved_at = COALESCE($4, resolved_at)
        WHERE id = $5
        """,
        status, now, responder_notes, resolved_at, alert_id,
    )
    return {"status": "updated"}
