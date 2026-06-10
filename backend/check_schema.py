import asyncio
from dotenv import load_dotenv
load_dotenv('.env')
from app.db.supabase import init_pool, fetch
async def main():
    await init_pool()
    cols = await fetch('''
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles')
        ORDER BY table_name, ordinal_position;
    ''')
    for c in cols:
        print(f"{c['table_name']}.{c['column_name']}")
asyncio.run(main())
