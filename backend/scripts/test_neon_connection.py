"""Quick Neon connectivity check.

Run from `backend/`:
    python scripts/test_neon_connection.py

Requires: `pip install -r requirements.txt` first.
Reads DATABASE_URL from backend/.env via the existing Settings.
"""
import asyncio
import sys

sys.path.insert(0, ".")

from app.db import supabase as neon


async def main() -> int:
    try:
        await neon.init_pool()
        version = await neon.fetchval("SELECT version()")
        db = await neon.fetchval("SELECT current_database()")
        user = await neon.fetchval("SELECT current_user")
        tables = await neon.fetch(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        )
        print("Connected to Neon")
        print("  database :", db)
        print("  user     :", user)
        print("  version  :", str(version).split(",")[0])
        print(f"  tables   : {len(tables)} in public schema")
        for t in tables:
            print("     -", t["tablename"])
        return 0
    except Exception as e:
        print(f"FAILED: {type(e).__name__}: {e}")
        return 1
    finally:
        await neon.close_pool()


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
