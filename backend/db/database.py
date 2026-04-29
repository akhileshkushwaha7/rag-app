
# db/database.py
# import os
# import weaviate
# from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
# from sqlalchemy.orm import sessionmaker, declarative_base

# # =========================
# # 🐘 POSTGRES
# # =========================
# DATABASE_URL = os.getenv("DATABASE_URL")

# engine = create_async_engine(DATABASE_URL, echo=False)
# AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
# Base = declarative_base()

# async def get_db_session():
#     async with AsyncSessionLocal() as session:
#         yield session

# async def init_db():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
#     print("✅ Postgres initialized")


# # =========================
# # 🔮 WEAVIATE
# # =========================
# weaviate_client = None

# def init_weaviate():
#     global weaviate_client

#     url = os.getenv("WEAVIATE_URL", "")
#     if not url:
#         print("❌ WEAVIATE_URL not set")
#         return

#     host = url.replace("https://", "").replace("http://", "").rstrip("/")
#     is_secure = url.startswith("https")
#     port = 443 if is_secure else 80

#     try:
#         weaviate_client = weaviate.connect_to_custom(
#             http_host=host,
#             http_port=port,
#             http_secure=is_secure,
#             grpc_host=host,
#             grpc_port=50051,       # default Weaviate gRPC port
#             grpc_secure=is_secure,
#         )
#         print(f"✅ Weaviate connected → {url}")
#     except Exception as e:
#         print(f"❌ Weaviate connection failed: {e}")
#         weaviate_client = None


# def get_weaviate():
#     return weaviate_client

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
# 🔮 WEAVIATE (FIXED)
# =========================
weaviate_client = None

def init_weaviate():
    global weaviate_client

    url = os.getenv("WEAVIATE_URL")
    if not url:
        print("❌ WEAVIATE_URL not set")
        return

    try:
        # ✅ FIX: Use HTTP client (NOT gRPC)
        weaviate_client = weaviate.Client(url=url)

        if weaviate_client.is_ready():
            print(f"✅ Weaviate connected → {url}")
        else:
            print("❌ Weaviate not ready")
            weaviate_client = None

    except Exception as e:
        print(f"❌ Weaviate connection failed: {e}")
        weaviate_client = None


def get_weaviate():
    return weaviate_client
