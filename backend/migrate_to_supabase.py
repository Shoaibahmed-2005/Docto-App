import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker

# Local DB
LOCAL_URL = "postgresql://postgres:ShoaibAhmed@localhost:5432/docto"

# Try the URL the user provided. Supabase session pooler usually uses port 6543, 
# but if 5432 works, we'll use that. We'll try 6543 as a fallback if it fails.
REMOTE_URL = "postgresql://postgres.irasqgwshohvjmvpdtbg:Shoaib%40Ahmed%40123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

def migrate():
    print("Connecting to local database...")
    local_engine = create_engine(LOCAL_URL)
    local_meta = MetaData()
    local_meta.reflect(bind=local_engine)

    print("Connecting to remote Supabase database...")
    try:
        remote_engine = create_engine(REMOTE_URL)
        remote_meta = MetaData()
        remote_meta.reflect(bind=remote_engine)
    except Exception as e:
        print(f"Failed to connect to 6543, trying 5432... Error: {e}")
        remote_engine = create_engine(REMOTE_URL.replace("6543", "5432"))
        remote_meta = MetaData()
        remote_meta.reflect(bind=remote_engine)

    print("Starting migration...")
    with local_engine.connect() as local_conn:
        with remote_engine.connect() as remote_conn:
            # We must migrate in sorted order to avoid Foreign Key constraint errors
            for table in local_meta.sorted_tables:
                print(f"Migrating table: {table.name}")
                # Fetch all data
                result = local_conn.execute(table.select())
                rows = [dict(row._mapping) for row in result]
                
                if not rows:
                    print(f"  -> No data to migrate for {table.name}")
                    continue
                
                remote_table = remote_meta.tables[table.name]
                
                # Delete existing data to prevent duplicate errors
                remote_conn.execute(remote_table.delete())
                
                # Insert data
                remote_conn.execute(remote_table.insert(), rows)
                
                # Commit if using SQLAlchemy 2.0
                try:
                    remote_conn.commit()
                except AttributeError:
                    pass # SQLAlchemy 1.4 auto-commits
                
                print(f"  -> Successfully migrated {len(rows)} rows for {table.name}")
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
