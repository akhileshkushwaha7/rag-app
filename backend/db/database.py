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

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

WEAVIATE_URL = os.getenv("WEAVIATE_URL")

weaviate_client = None

# def init_weaviate():
#     global weaviate_client

#     try:
#         weaviate_client = weaviate.connect_to_custom(
#             http_host="weaviate-service-99kh.onrender.com",
#             http_port=80,          # ✅ HTTP PORT (NOT 443)
#             http_secure=False,

#             grpc_host="weaviate-service-99kh.onrender.com",
#             grpc_port=50051,       # ✅ MUST be different
#             grpc_secure=False,
#         )

#         print("✅ Weaviate connected")

#     except Exception as e:
#         print(f"⚠️ Weaviate connection failed: {e}")
#         weaviate_client = None

import weaviate
import os

weaviate_client = None

def get_weaviate():
    return weaviate_client
    
def init_weaviate():
    global weaviate_client

    try:
        weaviate_client = weaviate.connect_to_wcs(
            cluster_url="https://weaviate-service-99kh.onrender.com",
            auth_credentials=None  # if no API key
        )

        print("✅ Weaviate connected")

    except Exception as e:
        print(f"⚠️ Weaviate connection failed: {e}")
        weaviate_client = None

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db_session() -> AsyncSession:
    async with async_session() as session:
        yield session
