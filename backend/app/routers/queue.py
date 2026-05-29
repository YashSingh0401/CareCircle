# backend/app/routers/queue.py
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user
from app.db import supabase as neon
from app.ml.prediction.wait_time_predictor import WaitTimePredictor

router = APIRouter()
predictor = WaitTimePredictor()


@router.get("/{queue_id}/wait-time")
async def get_wait_time(queue_id: str, position: int = 1, user: dict = Depends(get_current_user)):
    return await predictor.predict(queue_id, position)


@router.get("/doctor/{doctor_id}/today")
async def get_doctor_queue(doctor_id: str, user: dict = Depends(get_current_user)):
    today = date.today()
    q = await neon.fetchrow(
        "SELECT * FROM queues WHERE doctor_id = $1 AND date = $2",
        doctor_id, today,
    )
    if not q:
        return {"queue": None, "entries": []}

    entries = await neon.fetch(
        """
        SELECT qe.*,
               p.full_name   AS patient_full_name,
               p.phone       AS patient_phone,
               p.blood_group AS patient_blood_group
        FROM queue_entries qe
        LEFT JOIN profiles p ON p.id = qe.patient_id
        WHERE qe.queue_id = $1
          AND qe.status = ANY($2::text[])
        ORDER BY qe.position
        """,
        q["id"], ["waiting", "next", "in_consultation"],
    )
    return {"queue": q, "entries": entries}


class CallNextRequest(BaseModel):
    queue_id: str


@router.post("/call-next")
async def call_next(req: CallNextRequest, user: dict = Depends(get_current_user)):
    queue = await neon.fetchrow("SELECT * FROM queues WHERE id = $1", req.queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    next_token = queue["current_token"] + 1
    entry = await neon.fetchrow(
        """
        SELECT * FROM queue_entries
        WHERE queue_id = $1 AND token_number = $2
        """,
        req.queue_id, next_token,
    )
    if not entry:
        raise HTTPException(status_code=404, detail="No more patients")

    now = datetime.utcnow()
    await neon.execute(
        "UPDATE queue_entries SET status = 'next', called_time = $1 WHERE id = $2",
        now, entry["id"],
    )
    await neon.execute(
        "UPDATE queues SET current_token = $1 WHERE id = $2",
        next_token, req.queue_id,
    )
    return {"called_token": next_token, "entry": entry}


class CompleteRequest(BaseModel):
    entry_id: str
    appointment_id: str
    queue_id: str


@router.post("/complete")
async def complete_consultation(req: CompleteRequest, user: dict = Depends(get_current_user)):
    now = datetime.utcnow()

    await neon.execute(
        "UPDATE queue_entries SET status = 'completed', completed_time = $1 WHERE id = $2",
        now, req.entry_id,
    )
    await neon.execute(
        "UPDATE appointments SET status = 'completed', actual_end_time = $1 WHERE id = $2",
        now, req.appointment_id,
    )

    # Update rolling average
    await predictor.update_queue_average(req.queue_id)
    return {"status": "completed"}


# â”€â”€ Polling endpoints (replace Supabase Realtime channels) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


@router.get("/{queue_id}/entries")
async def list_queue_entries(queue_id: str, user: dict = Depends(get_current_user)):
    """Returns all active entries in a queue. Polled by the hospital queue dashboard."""
    entries = await neon.fetch(
        """
        SELECT qe.*,
               p.full_name   AS patient_full_name,
               p.phone       AS patient_phone,
               p.blood_group AS patient_blood_group
        FROM queue_entries qe
        LEFT JOIN profiles p ON p.id = qe.patient_id
        WHERE qe.queue_id = $1
          AND qe.status = ANY($2::text[])
        ORDER BY qe.position
        """,
        queue_id, ["waiting", "next", "in_consultation"],
    )
    return {"entries": entries}


@router.get("/entry/by-appointment/{appointment_id}")
async def get_my_queue_entry(appointment_id: str, user: dict = Depends(get_current_user)):
    """Returns the patient's queue entry for a given appointment. Polled by the patient's own queue view."""
    entry = await neon.fetchrow(
        """
        SELECT qe.*, q.current_token, q.total_patients
        FROM queue_entries qe
        LEFT JOIN queues q ON q.id = qe.queue_id
        WHERE qe.appointment_id = $1
        """,
        appointment_id,
    )
    return entry  # may be null if not checked in yet


class QueueEntryPatch(BaseModel):
    status: str | None = None
    position: int | None = None
    priority_level: int | None = None


@router.patch("/entries/{entry_id}")
async def update_queue_entry(
    entry_id: str,
    req: QueueEntryPatch,
    user: dict = Depends(get_current_user),
):
    """Generic patch: used for start consultation / skip / prioritize emergency."""
    changes = req.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(400, "No fields to update")
    # Auto-set timestamps for known status transitions
    now = datetime.utcnow()
    if changes.get("status") == "in_consultation":
        changes["consultation_start_time"] = now
    elif changes.get("status") == "completed":
        changes["completed_time"] = now

    sets, args = [], []
    for k, v in changes.items():
        args.append(v)
        sets.append(f"{k} = ${len(args)}")
    args.append(entry_id)
    sql = f"UPDATE queue_entries SET {', '.join(sets)} WHERE id = ${len(args)} RETURNING *"
    row = await neon.fetchrow(sql, *args)
    if not row:
        raise HTTPException(404, "Queue entry not found")
    return row


@router.get("/emergency-alerts")
async def list_emergency_alerts(
    hospital_id: str | None = None,
    since: str | None = None,
    user: dict = Depends(get_current_user),
):
    """Polled by hospital staff emergency dashboard. `since` is an ISO timestamp cursor."""
    where = ["ea.status = ANY($1::text[])"]
    args: list = [["active", "acknowledged", "dispatched"]]
    if hospital_id:
        args.append(hospital_id)
        where.append(f"ea.hospital_id = ${len(args)}")
    if since:
        args.append(since)
        where.append(f"ea.created_at > ${len(args)}::timestamptz")
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
    return {"alerts": await neon.fetch(sql, *args)}
