# backend/app/routers/emergency_contacts.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user
from app.db import supabase as neon

router = APIRouter()


class EmergencyContactCreate(BaseModel):
    name: str
    phone: str
    relationship: str | None = None


@router.get("/")
async def list_my_contacts(user: dict = Depends(get_current_user)):
    contacts = await neon.fetch(
        "SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at DESC",
        user["user_id"],
    )
    return {"contacts": contacts}


@router.post("/")
async def create_contact(req: EmergencyContactCreate, user: dict = Depends(get_current_user)):
    row = await neon.fetchrow(
        """
        INSERT INTO emergency_contacts (user_id, name, phone, relationship)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        """,
        user["user_id"], req.name, req.phone, req.relationship,
    )
    return row


@router.delete("/{contact_id}")
async def delete_contact(contact_id: str, user: dict = Depends(get_current_user)):
    # Verify ownership before delete
    owner = await neon.fetchval(
        "SELECT user_id FROM emergency_contacts WHERE id = $1",
        contact_id,
    )
    if owner is None:
        raise HTTPException(404, "Contact not found")
    if str(owner) != user["user_id"]:
        raise HTTPException(403, "Not your contact")
    await neon.execute("DELETE FROM emergency_contacts WHERE id = $1", contact_id)
    return {"status": "deleted"}
