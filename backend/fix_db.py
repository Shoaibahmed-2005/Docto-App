from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DATABASE_URL'))

def repair():
    with engine.connect() as conn:
        print("Starting DB repair...")
        
        # Ensure enum types exist (SubscriptionPlanEnum)
        # SQLAlchemy might have created it as subscription_plan_enum
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN subscription_plan subscription_plan_enum DEFAULT 'free'"))
            print("Added subscription_plan to users")
        except Exception as e:
            print(f"subscription_plan already exists or error on users: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE"))
            print("Added subscription_expires_at to users")
        except Exception as e:
            print(f"subscription_expires_at already exists or error on users: {e}")

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
            print("Added is_active to users")
        except Exception as e:
            print(f"is_active already exists or error on users: {e}")

        conn.commit()
        print("DB repair complete.")

if __name__ == "__main__":
    repair()
