# import os
# import weaviate
# from dotenv import load_dotenv
# from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
# from sqlalchemy.orm import sessionmaker
# from models.base import Base

# load_dotenv()

# # =========================
# # PostgreSQL
# # =========================
# DATABASE_URL = os.getenv("DATABASE_URL")

# engine = create_async_engine(DATABASE_URL, echo=True)

# async_session = sessionmaker(
#     engine,
#     class_=AsyncSession,
#     expire_on_commit=False
# )

# # =========================
# # Weaviate (FINAL FIX)
# # =========================
# WEAVIATE_URL = os.getenv("WEAVIATE_URL")

# weaviate_client = weaviate.Client(
#     url=WEAVIATE_URL,
#     additional_headers={}
# )

# # =========================
# # DB INIT
# # =========================
# async def init_db():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

# # =========================
# # SESSION
# # =========================
# async def get_db_session() -> AsyncSession:
#     async with async_session() as session:
#         yield session


# db/database.py
import os
import weaviate
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# =========================
# 🐘 POSTGRES
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
    print("✅ Postgres initialized")


# =========================
# 🔮 WEAVIATE
# =========================
weaviate_client = None

def init_weaviate():
    global weaviate_client

    url = os.getenv("WEAVIATE_URL", "")
    if not url:
        print("❌ WEAVIATE_URL not set")
        return

    host = url.replace("https://", "").replace("http://", "").rstrip("/")
    is_secure = url.startswith("https")
    port = 443 if is_secure else 80

    try:
        weaviate_client = weaviate.connect_to_custom(
            http_host=host,
            http_port=port,
            http_secure=is_secure,
            grpc_host=host,
            grpc_port=50051,       # default Weaviate gRPC port
            grpc_secure=is_secure,
        )
        print(f"✅ Weaviate connected → {url}")
    except Exception as e:
        print(f"❌ Weaviate connection failed: {e}")
        weaviate_client = None


def get_weaviate():
    return weaviate_client
