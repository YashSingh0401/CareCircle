import asyncio
import uuid
from dotenv import load_dotenv
load_dotenv('.env')

from app.db.supabase import init_pool, execute, fetchrow, fetch

async def main():
    await init_pool()

    print("Seeding database...")
    
    # Check if a hospital exists, else create one
    h = await fetchrow("SELECT id FROM hospitals LIMIT 1")
    if not h:
        hospital_id = await fetchrow(
            "INSERT INTO hospitals (name, city, state, zip) VALUES ($1, $2, $3, $4) RETURNING id",
            "CareCircle General", "New York", "NY", "10001"
        )
        hospital_id = hospital_id['id']
    else:
        hospital_id = h['id']
        
    # Create department
    d = await fetchrow("SELECT id FROM departments WHERE hospital_id = $1 LIMIT 1", hospital_id)
    if not d:
        dep_id = await fetchrow(
            "INSERT INTO departments (hospital_id, name) VALUES ($1, $2) RETURNING id",
            hospital_id, "Cardiology"
        )
        dep_id = dep_id['id']
    else:
        dep_id = d['id']

    # Create doctor
    doc = await fetchrow("SELECT id FROM doctors WHERE hospital_id = $1 LIMIT 1", hospital_id)
    if not doc:
        doc_id = await fetchrow(
            "INSERT INTO doctors (hospital_id, department_id, name, specialization, qualification, is_available) VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING id",
            hospital_id, dep_id, "Dr. Alice Smith", "Cardiologist", "MD, FACC"
        )
        doc_id = doc_id['id']
    else:
        doc_id = doc['id']

    # Create queue
    q = await fetchrow("SELECT id FROM queues WHERE doctor_id = $1 LIMIT 1", doc_id)
    if not q:
        queue_id = await fetchrow(
            "INSERT INTO queues (hospital_id, doctor_id, current_token, date) VALUES ($1, $2, 0, CURRENT_DATE) RETURNING id",
            hospital_id, doc_id
        )
        queue_id = queue_id['id']
    else:
        queue_id = q['id']

    # Create patients and queue_entries
    for i in range(1, 4):
        pid = str(uuid.uuid4())
        try:
            # Insert profile first
            await execute(
                "INSERT INTO profiles (id, full_name, email, role) VALUES ($1, $2, $3, 'patient')",
                pid, f"Patient {i}", f"patient{i}@example.com"
            )
            await execute(
                "INSERT INTO queue_entries (queue_id, patient_id, token_number, position, status, priority_level) VALUES ($1, $2, $3, $4, $5, $6)",
                queue_id, pid, i, i, "waiting" if i > 1 else "next", 0
            )
        except Exception as e:
            print("Could not insert queue entry:", e)

    print("Seed complete. Use this Queue ID:", queue_id)

asyncio.run(main())
