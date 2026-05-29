# backend/app/routers/doctors.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user, get_current_user_optional
from app.db import supabase as neon

router = APIRouter()


class ReviewCreate(BaseModel):
    rating: int  # 1..5
    review_text: str | None = None


@router.get("/")
async def list_doctors(
    specialization: str | None = None,
    hospital_id: str | None = None,
    max_fee: float | None = None,
    min_experience: int | None = None,
    user: dict | None = Depends(get_current_user_optional),
):
    where = ["d.is_available = TRUE"]
    args: list = []
    if specialization:
        args.append(f"%{specialization}%")
        where.append(f"d.specialization ILIKE ${len(args)}")
    if hospital_id:
        args.append(hospital_id)
        where.append(f"d.hospital_id = ${len(args)}")
    if max_fee is not None:
        args.append(max_fee)
        where.append(f"d.consultation_fee <= ${len(args)}")
    if min_experience is not None:
        args.append(min_experience)
        where.append(f"d.experience_years >= ${len(args)}")

    sql = f"""
        SELECT d.*,
               h.name AS hospital_name,
               h.city AS hospital_city,
               dep.name AS department_name
        FROM doctors d
        LEFT JOIN hospitals   h   ON h.id   = d.hospital_id
        LEFT JOIN departments dep ON dep.id = d.department_id
        WHERE {' AND '.join(where)}
        ORDER BY d.rating DESC NULLS LAST
    """
    return {"doctors": await neon.fetch(sql, *args)}


@router.get("/hospital/{hospital_id}")
async def list_doctors_by_hospital(
    hospital_id: str,
    specialization: str | None = None,
    user: dict | None = Depends(get_current_user_optional),
):
    where = ["d.hospital_id = $1", "d.is_available = TRUE"]
    args: list = [hospital_id]
    if specialization:
        args.append(f"%{specialization}%")
        where.append(f"d.specialization ILIKE ${len(args)}")
    sql = f"""
        SELECT d.*, dep.name AS department_name
        FROM doctors d
        LEFT JOIN departments dep ON dep.id = d.department_id
        WHERE {' AND '.join(where)}
        ORDER BY d.rating DESC NULLS LAST
    """
    return {"doctors": await neon.fetch(sql, *args)}


@router.get("/{doctor_id}")
async def get_doctor(doctor_id: str, user: dict | None = Depends(get_current_user_optional)):
    doctor = await neon.fetchrow(
        """
        SELECT d.*,
               h.name AS hospital_name,
               h.city AS hospital_city,
               dep.name AS department_name
        FROM doctors d
        LEFT JOIN hospitals   h   ON h.id   = d.hospital_id
        LEFT JOIN departments dep ON dep.id = d.department_id
        WHERE d.id = $1
        """,
        doctor_id,
    )
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor["availability"] = await neon.fetch(
        "SELECT * FROM doctor_availability WHERE doctor_id = $1",
        doctor_id,
    )
    return doctor


@router.get("/{doctor_id}/availability")
async def get_availability(doctor_id: str, user: dict | None = Depends(get_current_user_optional)):
    rows = await neon.fetch(
        """
        SELECT * FROM doctor_availability
        WHERE doctor_id = $1 AND is_active = TRUE
        """,
        doctor_id,
    )
    return {"availability": rows}


@router.post("/{doctor_id}/reviews")
async def submit_review(doctor_id: str, req: ReviewCreate, user: dict = Depends(get_current_user)):
    """Insert/update review; then recompute doctor's rating & total_reviews."""
    if not 1 <= req.rating <= 5:
        raise HTTPException(400, "Rating must be 1..5")

    async with neon.transaction() as conn:
        await conn.execute(
            """
            INSERT INTO doctor_reviews (doctor_id, patient_id, rating, review_text)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (doctor_id, patient_id) DO UPDATE
              SET rating = EXCLUDED.rating,
                  review_text = EXCLUDED.review_text,
                  updated_at = NOW()
            """,
            doctor_id, user["user_id"], req.rating, req.review_text,
        )
        stats = await conn.fetchrow(
            """
            SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating, COUNT(*) AS n
            FROM doctor_reviews WHERE doctor_id = $1
            """,
            doctor_id,
        )
        await conn.execute(
            "UPDATE doctors SET rating = $1, total_reviews = $2 WHERE id = $3",
            float(stats["avg_rating"] or 0), int(stats["n"] or 0), doctor_id,
        )
    return {"status": "ok", "rating": float(stats["avg_rating"] or 0), "total_reviews": int(stats["n"] or 0)}
