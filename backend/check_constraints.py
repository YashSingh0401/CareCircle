import asyncio
from dotenv import load_dotenv
load_dotenv('.env')
from app.db.supabase import init_pool, fetch

async def main():
    await init_pool()
    rows = await fetch("""
        SELECT conname, pg_get_constraintdef(oid) 
        FROM pg_constraint 
        WHERE conrelid = 'emergency_alerts'::regclass AND contype = 'c'
    """)
    for r in rows:
        print(f"{r['conname']}: {r['pg_get_constraintdef']}")

asyncio.run(main())
