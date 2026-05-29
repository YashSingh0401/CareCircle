# backend/app/routers/hospitals.py
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user, get_current_user_optional
from app.db import supabase as neon

router = APIRouter()


def _require_admin(user: dict) -> None:
    if (user.get("role") or "").lower() != "admin":
        raise HTTPException(403, "Admin role required")


class HospitalCreate(BaseModel):
    name: str
    address: str | None = None
    city: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    email: str | None = None
    type: str | None = "private"
    emergency_available: bool = False
    rating: float | None = None


class HospitalUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    phone: str | None = None
    email: str | None = None
    type: str | None = None
    emergency_available: bool | None = None
    rating: float | None = None
    is_active: bool | None = None


@router.get("/")
async def list_hospitals(
    city: str | None = None,
    emergency: bool | None = None,
    user: dict | None = Depends(get_current_user_optional),
):
    where = ["is_active = TRUE"]
    args: list = []
    if city:
        args.append(f"%{city}%")
        where.append(f"city ILIKE ${len(args)}")
    if emergency is not None:
        args.append(emergency)
        where.append(f"emergency_available = ${len(args)}")
    sql = f"""
        SELECT * FROM hospitals
        WHERE {' AND '.join(where)}
        ORDER BY rating DESC NULLS LAST
    """
    hospitals = await neon.fetch(sql, *args)
    return {"hospitals": hospitals}


@router.get("/{hospital_id}")
async def get_hospital(hospital_id: str, user: dict | None = Depends(get_current_user_optional)):
    hospital = await neon.fetchrow("SELECT * FROM hospitals WHERE id = $1", hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    departments = await neon.fetch(
        "SELECT * FROM departments WHERE hospital_id = $1",
        hospital_id,
    )
    hospital["departments"] = departments
    return hospital


@router.get("/{hospital_id}/doctors")
async def get_hospital_doctors(
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
        SELECT d.*,
               dep.name AS department_name
        FROM doctors d
        LEFT JOIN departments dep ON dep.id = d.department_id
        WHERE {' AND '.join(where)}
        ORDER BY d.rating DESC NULLS LAST
    """
    doctors = await neon.fetch(sql, *args)
    return {"doctors": doctors}


@router.post("/")
async def create_hospital(req: HospitalCreate, user: dict = Depends(get_current_user)):
    _require_admin(user)
    row = await neon.fetchrow(
        """
        INSERT INTO hospitals
            (name, address, city, state, latitude, longitude, phone, email,
             type, emergency_available, rating, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
        RETURNING *
        """,
        req.name, req.address, req.city, req.state, req.latitude, req.longitude,
        req.phone, req.email, req.type, req.emergency_available, req.rating,
    )
    return row


@router.patch("/{hospital_id}")
async def update_hospital(hospital_id: str, req: HospitalUpdate, user: dict = Depends(get_current_user)):
    _require_admin(user)
    changes = req.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(400, "No fields to update")

    sets, args = [], []
    for k, v in changes.items():
        args.append(v)
        sets.append(f"{k} = ${len(args)}")
    args.append(datetime.utcnow())
    sets.append(f"updated_at = ${len(args)}")
    args.append(hospital_id)
    sql = f"UPDATE hospitals SET {', '.join(sets)} WHERE id = ${len(args)} RETURNING *"
    row = await neon.fetchrow(sql, *args)
    if not row:
        raise HTTPException(404, "Hospital not found")
    return row


@router.delete("/{hospital_id}")
async def delete_hospital(hospital_id: str, user: dict = Depends(get_current_user)):
    """Soft delete â€” sets is_active = FALSE."""
    _require_admin(user)
    await neon.execute(
        "UPDATE hospitals SET is_active = FALSE, updated_at = $1 WHERE id = $2",
        datetime.utcnow(), hospital_id,
    )
    return {"status": "deleted"}
