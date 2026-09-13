import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def run_migration():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("Error: DATABASE_URL not set.")
        return
        
    print(f"Connecting to database...")
    engine = create_async_engine(database_url)
    
    try:
        with open("migrations/001_initial_schema.sql", "r") as f:
            sql_script = f.read()
            
        async with engine.begin() as conn:
            statements = [s.strip() for s in sql_script.split(';') if s.strip()]
            for stmt in statements:
                await conn.execute(text(stmt))
        print("Migration 001_initial_schema.sql applied successfully!")
        
    except Exception as e:
        print(f"Failed to apply migration: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
