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


import os
import weaviate
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models.base import Base

load_dotenv()

# =========================
# 🗄️ POSTGRES
# =========================
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# =========================
# 🧠 WEAVIATE CONFIG
# =========================
WEAVIATE_URL = os.getenv("WEAVIATE_URL")

weaviate_client = None


# =========================
# 🔌 WEAVIATE ACCESSOR
# =========================
# def get_weaviate():
#     return weaviate_client


# # =========================
# # 🚀 INIT WEAVIATE (RENDER SAFE)
# # =========================
# def init_weaviate():
#     global weaviate_client

#     try:
#         weaviate_client = weaviate.connect_to_custom(
#             http_host="weaviate-service-99kh.onrender.com",
#             http_port=443,
#             http_secure=True,

#             grpc_host="weaviate-service-99kh.onrender.com",
#             grpc_port=443,
#             grpc_secure=True,
#         )

#         print("✅ Weaviate connected")

#     except Exception as e:
#         print(f"⚠️ Weaviate connection failed: {e}")
#         weaviate_client = None
# db/database.py
import os
import weaviate
from weaviate.classes.init import Auth

_weaviate_client = None

def get_weaviate():
    global _weaviate_client

    # Return existing client if it's still alive
    if _weaviate_client is not None:
        try:
            _weaviate_client.is_ready()
            return _weaviate_client
        except Exception:
            _weaviate_client = None  # Reset if connection dropped

    weaviate_url = os.getenv("WEAVIATE_URL")  # e.g. https://weaviate-service-99kh.onrender.com

    if not weaviate_url:
        print("❌ WEAVIATE_URL env var is not set")
        return None

    try:
        _weaviate_client = weaviate.connect_to_custom(
            http_host=weaviate_url.replace("https://", "").replace("http://", ""),
            http_port=443,
            http_secure=True,
            grpc_host=weaviate_url.replace("https://", "").replace("http://", ""),
            grpc_port=443,
            grpc_secure=True,
        )
        print(f"✅ Weaviate connected: {weaviate_url}")
        return _weaviate_client
    except Exception as e:
        print(f"❌ Weaviate connection failed: {e}")
        return None

# =========================
# 🗄️ DB INIT
# =========================
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# =========================
# 🔁 SESSION
# =========================
async def get_db_session() -> AsyncSession:
    async with async_session() as session:
        yield session
