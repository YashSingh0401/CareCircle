# backend/app/routers/home.py
"""Aggregated dashboard counts for the logged-in user's home page."""
import asyncio
from datetime import date

from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.db import supabase as neon

router = APIRouter()


@router.get("/stats")
async def get_home_stats(user: dict = Depends(get_current_user)):
    """Returns the 3 counts shown on the patient home dashboard.

    Uses the user_id from the verified JWT â€” never trusts a query param.
    """
    user_id = user["user_id"]
    today = date.today()

    upcoming_q = neon.fetchval(
        """
        SELECT COUNT(*) FROM appointments
        WHERE patient_id = $1
          AND appointment_date >= $2
          AND status NOT IN ('cancelled', 'no_show', 'completed')
        """,
        user_id, today,
    )
    records_q = neon.fetchval(
        "SELECT COUNT(*) FROM medical_records WHERE patient_id = $1",
        user_id,
    )
    queue_q = neon.fetchrow(
        """
        SELECT qe.*
        FROM queue_entries qe
        WHERE qe.patient_id = $1
          AND qe.status IN ('waiting', 'next', 'in_consultation')
        ORDER BY qe.position
        LIMIT 1
        """,
        user_id,
    )

    upcoming, total_records, queue_entry = await asyncio.gather(upcoming_q, records_q, queue_q)
    return {
        "upcoming_appointments": upcoming or 0,
        "total_records": total_records or 0,
        "active_queue_entry": queue_entry,
    }
