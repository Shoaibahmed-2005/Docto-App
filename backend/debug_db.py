from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DATABASE_URL'))

def debug_db():
    with engine.connect() as conn:
        # Check current search path
        path = conn.execute(text("SHOW search_path")).scalar()
        print(f"Postgres search_path: {path}")

        # Check tables in public
        tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")).all()
        print(f"Tables in public: {[t[0] for t in tables]}")
        
        # Check columns in users
        columns = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'")).all()
        print(f"Columns in users: {[(c[0], c[1]) for c in columns]}")

        # Force add if missing (just in case)
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan subscription_plan_enum DEFAULT 'free'"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE"))
            conn.commit()
            print("Repair commands executed successfully.")
        except Exception as e:
            print(f"Repair command error: {e}")

if __name__ == "__main__":
    debug_db()
