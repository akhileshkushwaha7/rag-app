
# # main.py
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager

# from db.database import init_db, init_weaviate, weaviate_client
# from routers import auth, chat
# from services.rag_service import create_weaviate_schema


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup
#     await init_db()
#     init_weaviate()
#     create_weaviate_schema()
#     yield
#     # Shutdown
#     if weaviate_client is not None:
#         weaviate_client.close()
#         print("✅ Weaviate connection closed")


# app = FastAPI(lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth.router, prefix="/auth", tags=["auth"])
# app.include_router(chat.router, prefix="/api", tags=["chat"])

# @app.get("/")
# def read_root():
#     return {"Hello": "World"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.database import init_db, init_weaviate
import db.database as database  # ✅ FIX: import module, not variable

from routers import auth, chat
from services.rag_service import create_weaviate_schema


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # =========================
#     # 🚀 STARTUP
#     # =========================
#     await init_db()
#     init_weaviate()

#     if database.weaviate_client is None:
#         print("❌ Weaviate NOT initialized - stopping startup")
#     else:
#         create_weaviate_schema()

#     yield

#     # =========================
#     # 🧹 SHUTDOWN
#     # =========================
#     if database.weaviate_client is not None:
#         database.weaviate_client.close()
#         print("✅ Weaviate connection closed")
@asynccontextmanager
async def lifespan(app: FastAPI):
    # =========================
    # 🚀 STARTUP
    # =========================
    print("🚀 Starting application...")

    await init_db()

    # Init Weaviate
    init_weaviate()

    # 🔴 HARD CHECK (not just None check)
    client = database.weaviate_client

    if client is None:
        print("❌ Weaviate failed to initialize")
    else:
        try:
            # 🔥 verify actual connection
            if hasattr(client, "is_ready") and not client.is_ready():
                print("❌ Weaviate not ready")
            else:
                print("✅ Weaviate connected successfully")
                create_weaviate_schema()

        except Exception as e:
            print(f"❌ Weaviate health check failed: {e}")
            database.weaviate_client = None

    yield

    # =========================
    # 🧹 SHUTDOWN
    # =========================
    print("🧹 Shutting down...")

    if database.weaviate_client is not None:
        try:
            database.weaviate_client.close()
            print("✅ Weaviate connection closed")
        except Exception as e:
            print(f"⚠️ Error closing Weaviate: {e}")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://rag-app-brown.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ✅ ADD THIS
@app.options("/{full_path:path}")
async def options_handler():
    return {"message": "OK"}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api", tags=["chat"])


@app.get("/")
def read_root():
    return {"Hello": "World"}
