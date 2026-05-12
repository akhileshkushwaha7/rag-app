
# db/database.py


import os
import weaviate
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# =========================
#  POSTGRES
# =========================
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db_session():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(" Postgres initialized")


# =========================
#  WEAVIATE (FIXED)
# =========================
weaviate_client = None

def init_weaviate():
    global weaviate_client

    url = os.getenv("WEAVIATE_URL")
    if not url:
        print(" WEAVIATE_URL not set")
        return

    try:
        #  FIX: Use HTTP client (NOT gRPC)
        weaviate_client = weaviate.Client(url=url)

        if weaviate_client.is_ready():
            print(f" Weaviate connected → {url}")
        else:
            print(" Weaviate not ready")
            weaviate_client = None

    except Exception as e:
        print(f" Weaviate connection failed: {e}")
        weaviate_client = None


def get_weaviate():
    return weaviate_client
