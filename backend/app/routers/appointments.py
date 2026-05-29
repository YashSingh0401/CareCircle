# backend/app/routers/appointments.py
from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user
from app.db import supabase as neon

router = APIRouter()


class AppointmentRequest(BaseModel):
    patient_id: str
    doctor_id: str
    hospital_id: str
    appointment_date: str
    appointment_time: str
    reason: str | None = None


@router.post("/")
async def create_appointment(req: AppointmentRequest, user: dict = Depends(get_current_user)):
    try:
        appt_date = date.fromisoformat(req.appointment_date)
        appt_time = time.fromisoformat(req.appointment_time)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date/time format: {e}")

    # Check for duplicate (any non-cancelled/no_show booking on same doctor/date/time)
    existing = await neon.fetchval(
        """
        SELECT 1 FROM appointments
        WHERE doctor_id = $1
          AND appointment_date = $2
          AND appointment_time = $3
          AND status NOT IN ('cancelled', 'no_show')
        LIMIT 1
        """,
        req.doctor_id, appt_date, appt_time,
    )
    if existing:
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    now = datetime.utcnow()
    row = await neon.fetchrow(
        """
        INSERT INTO appointments
            (patient_id, doctor_id, hospital_id, appointment_date,
             appointment_time, reason, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $7)
        RETURNING *
        """,
        req.patient_id, req.doctor_id, req.hospital_id,
        appt_date, appt_time, req.reason, now,
    )
    return row or {}


@router.get("/{appointment_id}")
async def get_appointment(appointment_id: str, user: dict = Depends(get_current_user)):
    row = await neon.fetchrow(
        """
        SELECT a.*,
               d.name           AS doctor_name,
               d.specialization AS doctor_specialization,
               d.image_url      AS doctor_image_url,
               h.name           AS hospital_name,
               h.address        AS hospital_address
        FROM appointments a
        LEFT JOIN doctors   d ON d.id = a.doctor_id
        LEFT JOIN hospitals h ON h.id = a.hospital_id
        WHERE a.id = $1
        """,
        appointment_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return row


@router.get("/patient/{patient_id}")
async def get_patient_appointments(patient_id: str, user: dict = Depends(get_current_user)):
    rows = await neon.fetch(
        """
        SELECT a.*,
               d.name           AS doctor_name,
               d.specialization AS doctor_specialization,
               d.image_url      AS doctor_image_url,
               h.name           AS hospital_name,
               h.address        AS hospital_address
        FROM appointments a
        LEFT JOIN doctors   d ON d.id = a.doctor_id
        LEFT JOIN hospitals h ON h.id = a.hospital_id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date DESC
        """,
        patient_id,
    )
    return {"appointments": rows}


@router.patch("/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str, user: dict = Depends(get_current_user)):
    now = datetime.utcnow()
    await neon.execute(
        "UPDATE appointments SET status = 'cancelled', updated_at = $1 WHERE id = $2",
        now, appointment_id,
    )
    return {"status": "cancelled"}


@router.get("/doctor/{doctor_id}")
async def get_doctor_appointments(
    doctor_id: str,
    date: str | None = None,
    user: dict = Depends(get_current_user),
):
    from datetime import date as date_cls
    where = ["a.doctor_id = $1"]
    args: list = [doctor_id]
    if date:
        try:
            args.append(date_cls.fromisoformat(date))
        except ValueError as e:
            raise HTTPException(400, f"Invalid date: {e}")
        where.append(f"a.appointment_date = ${len(args)}")
    sql = f"""
        SELECT a.*
        FROM appointments a
        WHERE {' AND '.join(where)}
        ORDER BY a.appointment_time
    """
    return {"appointments": await neon.fetch(sql, *args)}


@router.get("/hospital/{hospital_id}")
async def get_hospital_appointments(
    hospital_id: str,
    date: str | None = None,
    user: dict = Depends(get_current_user),
):
    from datetime import date as date_cls
    where = ["a.hospital_id = $1"]
    args: list = [hospital_id]
    if date:
        try:
            args.append(date_cls.fromisoformat(date))
        except ValueError as e:
            raise HTTPException(400, f"Invalid date: {e}")
        where.append(f"a.appointment_date = ${len(args)}")
    sql = f"""
        SELECT a.*,
               d.name           AS doctor_name,
               d.specialization AS doctor_specialization
        FROM appointments a
        LEFT JOIN doctors d ON d.id = a.doctor_id
        WHERE {' AND '.join(where)}
        ORDER BY a.created_at DESC
    """
    return {"appointments": await neon.fetch(sql, *args)}


@router.post("/{appointment_id}/check-in")
async def check_in_appointment(appointment_id: str, user: dict = Depends(get_current_user)):
    """Mark appointment as checked_in and add patient to today's queue.

    All steps run in a single transaction so a failure mid-way doesn't leave
    half-state behind (e.g. counter incremented but no queue entry).
    """
    now = datetime.utcnow()
    today = datetime.utcnow().date()

    async with neon.transaction() as conn:
        appt = await conn.fetchrow(
            """
            UPDATE appointments SET status = 'checked_in', updated_at = $1
            WHERE id = $2
            RETURNING doctor_id, hospital_id, patient_id, appointment_date
            """,
            now, appointment_id,
        )
        if not appt:
            raise HTTPException(404, "Appointment not found")

        queue = await conn.fetchrow(
            "SELECT * FROM queues WHERE doctor_id = $1 AND date = $2",
            appt["doctor_id"], today,
        )
        if not queue:
            queue = await conn.fetchrow(
                """
                INSERT INTO queues (doctor_id, hospital_id, date, current_token, total_patients, is_active)
                VALUES ($1, $2, $3, 0, 0, TRUE)
                RETURNING *
                """,
                appt["doctor_id"], appt["hospital_id"], today,
            )

        next_token = queue["total_patients"] + 1
        entry = await conn.fetchrow(
            """
            INSERT INTO queue_entries
                (queue_id, appointment_id, patient_id, token_number, position,
                 status, check_in_time, priority_level)
            VALUES ($1, $2, $3, $4, $4, 'waiting', $5, 0)
            RETURNING *
            """,
            queue["id"], appointment_id, appt["patient_id"], next_token, now,
        )
        await conn.execute(
            "UPDATE queues SET total_patients = $1 WHERE id = $2",
            next_token, queue["id"],
        )
        await conn.execute(
            "UPDATE appointments SET status = 'in_queue', token_number = $1 WHERE id = $2",
            next_token, appointment_id,
        )
        return entry
