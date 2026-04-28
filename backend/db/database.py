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

# ❌ REMOVE global connection
weaviate_client = None

def init_weaviate():
    global weaviate_client
    weaviate_client = weaviate.Client(
        url=WEAVIATE_URL
    )

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db_session() -> AsyncSession:
    async with async_session() as session:
        yield session
