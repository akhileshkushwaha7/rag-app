# # routers/chat.py
# # SYSTEM ARCHITECTURE FLOW
# # Frontend (React / UI)
# #         ↓
# # FastAPI (chat.py routes)
# #         ↓
# # Postgres (Users / Sessions / ChatHistory / Files)
# #         ↓
# # Weaviate (Vector DB - RAG memory)
# #         ↓
# # FastEmbed (embeddings)
# #         ↓
# # Groq (LLM - GPT-OSS-20B)


# # 1. /upload (FILE INGESTION FLOW)
# # User uploads PDF
# #         ↓
# # FastAPI (/upload)
# #         ↓
# # Save file locally
# #         ↓
# # Store metadata → Postgres (FileModel)
# #         ↓
# # process_and_embed_file()
# #         ↓
# # PDF → chunks → embeddings (FastEmbed)
# #         ↓
# # Store vectors → Weaviate
# #         ↓
# # Delete local file
# #         ↓
# # Return file_id + chunk count
# # 💬 2. /chat (MAIN RAG FLOW)
# # User sends question
# #         ↓
# # FastAPI (/chat)
# #         ↓
# # Save user message → Postgres (ChatHistory)
# #         ↓
# # Check: does session have files?
# #         ↓
# # YES →
# #     Query Weaviate (vector search)
# #         ↓
# #     Get top chunks
# #         ↓
# #     Build context
# #         ↓
# #     Send to Groq LLM
# #         ↓
# #     Get answer

# # NO →
# #     Send question directly to Groq
# #         ↓
# #     Get answer
# #         ↓
# # Save assistant response → Postgres
# #         ↓
# # Return response
# # 📜 3. /chat/history/{session_id}
# # Request session_id
# #         ↓
# # Fetch ChatHistory from Postgres
# #         ↓
# # Sort by timestamp
# #         ↓
# # Return full conversation
# # 📂 4. /chat/sessions
# # Fetch all ChatHistory
# #         ↓
# # Group by session_id
# #         ↓
# # Pick latest message per session
# #         ↓
# # Return session list (titles + ids)
# # ❌ 5. DELETE /chat/sessions/{session_id}
# # Receive session_id
# #         ↓
# # Fetch all messages (ChatHistory)
# #         ↓
# # Delete all messages
# #         ↓
# # Delete session data
# #         ↓
# # Commit DB
# #         ↓
# # Return success message


# import os
# import shutil
# import uuid

# from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Cookie, Form
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from sqlalchemy import desc, func
# from pydantic import BaseModel

# from openai import OpenAI  # ✅ GROQ CLIENT

# from db.database import get_db_session
# from models.user import Session, User
# from models.file import File as FileModel
# from models.chat import ChatHistory
# from services.rag_service import process_and_embed_file, query_weaviate

# router = APIRouter()
# UPLOAD_DIR = "uploaded_files"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # =========================
# # 🔥 GROQ CLIENT
# # =========================
# client = OpenAI(
#     api_key=os.getenv("GROQ_API_KEY"),
#     base_url="https://api.groq.com/openai/v1",
# )

# MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


# class ChatQuery(BaseModel):
#     query: str
#     session_id: uuid.UUID


# # =========================
# # 🔐 AUTH
# # =========================
# async def get_current_user(session_token: str = Cookie(None), db: AsyncSession = Depends(get_db_session)):
#     if not session_token:
#         raise HTTPException(status_code=401, detail="Not authenticated")

#     result = await db.execute(select(Session).where(Session.session_token == session_token))
#     session = result.scalars().first()

#     if not session:
#         raise HTTPException(status_code=401, detail="Invalid session")

#     result = await db.execute(select(User).where(User.id == session.user_id))
#     user = result.scalars().first()

#     if not user:
#         raise HTTPException(status_code=401, detail="User not found")

#     return user


# # =========================
# # 📤 UPLOAD
# # =========================
# @router.post("/upload")
# async def upload_file(
#     session_id: str = Form(...),
#     file: UploadFile = FastAPIFile(...),
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user),
# ):
#     file_path = os.path.join(UPLOAD_DIR, file.filename)

#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     new_file = FileModel(
#         user_id=current_user.id,
#         session_id=uuid.UUID(session_id),
#         filename=file.filename
#     )

#     db.add(new_file)
#     await db.commit()
#     print("\n=== UPLOAD DEBUG ===")
#     print("User ID:", current_user.id)
#     print("Session ID (from form):", session_id)
#     print("Stored Session ID:", new_file.session_id)
#     print("File ID:", new_file.id)
#     print("Filename:", file.filename)
#     print("====================\n")
#     await db.refresh(new_file)

#     try:
#         chunks_created = process_and_embed_file(file_path, current_user.id, new_file.id)
#     finally:
#         os.remove(file_path)

#     return {
#         "filename": file.filename,
#         "file_id": new_file.id,
#         "chunks_created": chunks_created
#     }


# # =========================
# # 💬 CHAT (GROQ + RAG)
# # =========================
# @router.post("/chat")
# async def chat(
#     chat_query: ChatQuery,
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user),
# ):
#     print("\n=== CHAT DEBUG ===")
#     print("Incoming Session ID:", chat_query.session_id)
#     print("User ID:", current_user.id)
#     user_id = current_user.id
#     session_id = chat_query.session_id

#     # Save user message
#     db.add(ChatHistory(
#         user_id=user_id,
#         session_id=session_id,
#         role="user",
#         message=chat_query.query
#     ))


#     # Check if files exist
#     result = await db.execute(
#         select(FileModel).where(
#             FileModel.user_id == user_id,
#             FileModel.session_id == session_id
#         )
#     )
#     session_has_files = result.scalars().first() is not None
#     print("Session has files:", session_has_files)
    
#     if session_has_files:
#         files_in_session = await db.execute(
#             select(FileModel.id).where(
#                 FileModel.user_id == user_id,
#                 FileModel.session_id == session_id
#             )
#         )
#         file_ids = [row[0] for row in files_in_session.all()]
#         print("File IDs in session:", file_ids)

#         context_chunks = query_weaviate(chat_query.query, user_id, file_ids)
#         print("Chunks retrieved:", len(context_chunks))
#         context = "\n---\n".join([c['content'] for c in context_chunks])
#         print("\n=== CHAT DEBUG ===")
#         print("Incoming Session ID:", session_id)
#         print("User ID:", user_id)
#         print("Session has files:", session_has_files)  
#         if session_has_files:
#              print("File IDs in session:", file_ids)
#              print("Chunks retrieved:", len(context_chunks))
#              print("===================\n")

#         prompt = f"""
# You are a helpful assistant.

# Answer ONLY using the context below.
# If the answer is not in the context, say: "I don't know."

# Context:
# {context}

# Question:
# {chat_query.query}
# """

#         response = client.responses.create(
#             model=MODEL,
#             input=prompt
#         )

#         response_message = response.output_text

#     else:
#         response = client.responses.create(
#             model=MODEL,
#             input=chat_query.query
#         )
#         response_message = response.output_text

#     # Save assistant response
#     db.add(ChatHistory(
#         user_id=user_id,
#         session_id=session_id,
#         role="assistant",
#         message=response_message
#     ))

#     await db.commit()

#     return {"response": response_message}


# # =========================
# # 📜 HISTORY
# # =========================
# @router.get("/chat/history/{session_id}")
# async def get_chat_history(
#     session_id: uuid.UUID,
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user)
# ):
#     result = await db.execute(
#         select(ChatHistory)
#         .where(
#             ChatHistory.user_id == current_user.id,
#             ChatHistory.session_id == session_id
#         )
#         .order_by(ChatHistory.timestamp)
#     )
#     return result.scalars().all()


# # =========================
# # 📂 SESSIONS
# # =========================
# @router.get("/chat/sessions")
# async def get_chat_sessions(
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user)
# ):
#     subquery = (
#         select(
#             ChatHistory.session_id,
#             ChatHistory.message,
#             ChatHistory.timestamp,
#             func.row_number().over(
#                 partition_by=ChatHistory.session_id,
#                 order_by=desc(ChatHistory.timestamp)
#             ).label('rn')
#         )
#         .where(ChatHistory.user_id == current_user.id)
#         .subquery()
#     )

#     result = await db.execute(
#         select(subquery.c.session_id, subquery.c.message)
#         .where(subquery.c.rn == 1)
#         .order_by(desc(subquery.c.timestamp))
#     )

#     return [{"id": str(s.session_id), "title": s.message} for s in result.all()]


# # =========================
# # ❌ DELETE SESSION
# # =========================
# @router.delete("/chat/sessions/{session_id}")
# async def delete_chat_session(
#     session_id: uuid.UUID,
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user)
# ):
#     result = await db.execute(
#         select(ChatHistory).where(
#             ChatHistory.user_id == current_user.id,
#             ChatHistory.session_id == session_id
#         )
#     )

#     messages = result.scalars().all()

#     if not messages:
#         raise HTTPException(status_code=404, detail="Session not found")

#     for m in messages:
#         await db.delete(m)

#     await db.commit()

#     return {"message": "Session deleted"}


#---------------------------------------------------

# import os
# import shutil
# from typing import Optional
# import uuid

# from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Cookie, Form
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from sqlalchemy import desc, func
# from pydantic import BaseModel

# from openai import OpenAI

# from db.database import get_db_session
# from models.user import Session, User
# from models.file import File as FileModel
# from models.chat import ChatHistory
# from services.rag_service import process_and_embed_file, query_weaviate

# router = APIRouter()

# UPLOAD_DIR = "uploaded_files"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # =========================
# # GROQ CLIENT
# # =========================
# client = OpenAI(
#     api_key=os.getenv("GROQ_API_KEY"),
#     base_url="https://api.groq.com/openai/v1",
# )

# MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


# class ChatQuery(BaseModel):
#     query: str
#     session_id: uuid.UUID
#     file_id: Optional[str] = None


# # =========================
# # AUTH
# # =========================
# async def get_current_user(session_token: str = Cookie(None), db: AsyncSession = Depends(get_db_session)):
#     if not session_token:
#         raise HTTPException(status_code=401, detail="Not authenticated")

#     result = await db.execute(select(Session).where(Session.session_token == session_token))
#     session = result.scalars().first()

#     if not session:
#         raise HTTPException(status_code=401, detail="Invalid session")

#     result = await db.execute(select(User).where(User.id == session.user_id))
#     user = result.scalars().first()

#     if not user:
#         raise HTTPException(status_code=401, detail="User not found")

#     return user


# # =========================
# # UPLOAD
# # =========================
# @router.post("/upload")
# async def upload_file(
#     session_id: str = Form(...),
#     file: UploadFile = FastAPIFile(...),
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user),
# ):
#     file_path = os.path.join(UPLOAD_DIR, file.filename)

#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     new_file = FileModel(
#         user_id=current_user.id,
#         session_id=uuid.UUID(session_id),
#         filename=file.filename
#     )

#     db.add(new_file)
#     await db.commit()
#     await db.refresh(new_file)  # ✅ IMPORTANT: refresh BEFORE using id

#     print("\n=== UPLOAD DEBUG ===")
#     print("User ID:", current_user.id)
#     print("Session ID (from form):", session_id)
#     print("Stored Session ID:", new_file.session_id)
#     print("File ID:", new_file.id)
#     print("Filename:", file.filename)
#     print("====================\n")

#     try:
#         chunks_created = process_and_embed_file(file_path, current_user.id, new_file.id)
#     finally:
#         os.remove(file_path)

#     return {
#         "filename": file.filename,
#         "file_id": str(new_file.id),
#         "chunks_created": chunks_created
#     }


# # =========================
# # CHAT
# # =========================
# @router.post("/chat")
# async def chat(
#     chat_query: ChatQuery,
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user),
# ):
#     user_id = current_user.id
#     session_id = chat_query.session_id

#     print("\n=== CHAT DEBUG ===")
#     print("Incoming Session ID:", session_id)
#     print("User ID:", user_id)

#     # Save user message
#     db.add(ChatHistory(
#         user_id=user_id,
#         session_id=session_id,
#         role="user",
#         message=chat_query.query
#     ))

#     # Check files for session
#     result = await db.execute(
#         select(FileModel).where(
#             FileModel.user_id == user_id,
#             FileModel.session_id == session_id
#         )
#     )

#     files = result.scalars().all()
#     file_ids = [f.id for f in files]

#     session_has_files = len(file_ids) > 0

#     print("Session has files:", session_has_files)
#     print("File IDs:", file_ids)

#     context = ""

#     if session_has_files:
#         context_chunks = query_weaviate(chat_query.query, user_id, file_ids) or []

#         print("Chunks retrieved:", len(context_chunks))
#         print("\n=== RAW CHUNKS ===")
#         print(context_chunks)
#         print("===================\n")
#         for c in context_chunks:
#             print("TYPE:", type(c))
#             print("VALUE:", c)
# #         context = "\n---\n".join(
            
# #     [c if isinstance(c, str) else str(c.get("content", "")) for c in context_chunks]
# # )
#         context = "\n---\n".join(
#     [
#         (
#             c.get("content")
#             or c.get("text")
#             or c.get("page_content")
#             or str(c)
#         )
#         if isinstance(c, dict)
#         else str(c)
#         for c in context_chunks
#     ]
# )
#         print("FINAL CONTEXT ===")
#         print(context)
#         print("==================")
#         prompt = f"""
# You are a helpful assistant.

# Answer ONLY using the context below.
# If the answer is not in the context, say: "I don't know."

# Context:
# {context}

# Question:
# {chat_query.query}
# """

#         response = client.responses.create(
#             model=MODEL,
#             input=prompt
#         )

#     else:
#         response = client.responses.create(
#             model=MODEL,
#             input=chat_query.query
#         )

#     response_message = response.output_text

#     db.add(ChatHistory(
#         user_id=user_id,
#         session_id=session_id,
#         role="assistant",
#         message=response_message
#     ))

#     await db.commit()

#     print("===================\n")

#     return {"response": response_message}


# # =========================
# # HISTORY
# # =========================
# @router.get("/chat/history/{session_id}")
# async def get_chat_history(
#     session_id: uuid.UUID,
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user)
# ):
#     result = await db.execute(
#         select(ChatHistory)
#         .where(
#             ChatHistory.user_id == current_user.id,
#             ChatHistory.session_id == session_id
#         )
#         .order_by(ChatHistory.timestamp)
#     )

#     return result.scalars().all()


# # =========================
# # SESSIONS
# # =========================
# @router.get("/chat/sessions")
# async def get_chat_sessions(
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user)
# ):
#     subquery = (
#         select(
#             ChatHistory.session_id,
#             ChatHistory.message,
#             ChatHistory.timestamp,
#             func.row_number().over(
#                 partition_by=ChatHistory.session_id,
#                 order_by=desc(ChatHistory.timestamp)
#             ).label('rn')
#         )
#         .where(ChatHistory.user_id == current_user.id)
#         .subquery()
#     )

#     result = await db.execute(
#         select(subquery.c.session_id, subquery.c.message)
#         .where(subquery.c.rn == 1)
#         .order_by(desc(subquery.c.timestamp))
#     )

#     return [{"id": str(s.session_id), "title": s.message} for s in result.all()]


# # =========================
# # DELETE SESSION
# # =========================
# @router.delete("/chat/sessions/{session_id}")
# async def delete_chat_session(
#     session_id: uuid.UUID,
#     db: AsyncSession = Depends(get_db_session),
#     current_user: User = Depends(get_current_user)
# ):
#     result = await db.execute(
#         select(ChatHistory).where(
#             ChatHistory.user_id == current_user.id,
#             ChatHistory.session_id == session_id
#         )
#     )

#     messages = result.scalars().all()

#     if not messages:
#         raise HTTPException(status_code=404, detail="Session not found")

#     for m in messages:
#         await db.delete(m)

#     await db.commit()

#     return {"message": "Session deleted"}

#-------------------------------------------------
import os
import shutil
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Cookie, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func
from pydantic import BaseModel

from openai import OpenAI

from db.database import get_db_session
from models.user import Session, User
from models.file import File as FileModel
from models.chat import ChatHistory
from services.rag_service import process_and_embed_file, query_weaviate

router = APIRouter()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# GROQ CLIENT
# =========================
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


class ChatQuery(BaseModel):
    query: str
    session_id: uuid.UUID
    file_id: Optional[str] = None


# =========================
# AUTH
# =========================
async def get_current_user(session_token: str = Cookie(None), db: AsyncSession = Depends(get_db_session)):
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    result = await db.execute(select(Session).where(Session.session_token == session_token))
    session = result.scalars().first()

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    result = await db.execute(select(User).where(User.id == session.user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# =========================
# UPLOAD
# =========================
@router.post("/upload")
async def upload_file(
    session_id: str = Form(...),
    file: UploadFile = FastAPIFile(...),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_file = FileModel(
        user_id=current_user.id,
        session_id=uuid.UUID(session_id),
        filename=file.filename
    )

    db.add(new_file)
    await db.commit()
    await db.refresh(new_file)

    print("\n=== UPLOAD DEBUG ===")
    print("User ID:", current_user.id)
    print("Session ID:", session_id)
    print("File ID:", new_file.id)
    print("====================\n")

    try:
        chunks_created = process_and_embed_file(file_path, current_user.id, new_file.id)
    finally:
        os.remove(file_path)

    return {
        "filename": file.filename,
        "file_id": str(new_file.id),
        "chunks_created": chunks_created
    }


# =========================
# CHAT
# =========================
@router.post("/chat")
async def chat(
    chat_query: ChatQuery,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    session_id = chat_query.session_id

    print("\n=== CHAT DEBUG ===")
    print("Session ID:", session_id)
    print("User ID:", user_id)

    # Save user message
    db.add(ChatHistory(
        user_id=user_id,
        session_id=session_id,
        role="user",
        message=chat_query.query
    ))

    # Get files for session
    result = await db.execute(
        select(FileModel).where(
            FileModel.user_id == user_id,
            FileModel.session_id == session_id
        )
    )

    files = result.scalars().all()
    file_ids = [str(f.id) for f in files]

    print("File IDs:", file_ids)

    context = ""

    if file_ids:
        context_chunks = query_weaviate(chat_query.query, str(user_id), file_ids)

        print("Chunks retrieved:", len(context_chunks))
        print("RAW:", context_chunks)

        # SAFE parsing (now standardized output from Weaviate)
        context = "\n---\n".join(
            [c.get("content", "") for c in context_chunks if isinstance(c, dict)]
        )

    prompt = f"""
You are a helpful assistant.

Answer ONLY using the context below.
If the answer is not in the context, say: "I don't know."

Context:
{context}

Question:
{chat_query.query}
"""

    response = client.responses.create(
        model=MODEL,
        input=prompt
    )

    response_message = response.output_text

    db.add(ChatHistory(
        user_id=user_id,
        session_id=session_id,
        role="assistant",
        message=response_message
    ))

    await db.commit()

    return {"response": response_message}


# =========================
# HISTORY
# =========================
@router.get("/chat/history/{session_id}")
async def get_chat_history(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(ChatHistory)
        .where(
            ChatHistory.user_id == current_user.id,
            ChatHistory.session_id == session_id
        )
        .order_by(ChatHistory.timestamp)
    )

    return result.scalars().all()


# =========================
# SESSIONS
# =========================
@router.get("/chat/sessions")
async def get_chat_sessions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    subquery = (
        select(
            ChatHistory.session_id,
            ChatHistory.message,
            ChatHistory.timestamp,
            func.row_number().over(
                partition_by=ChatHistory.session_id,
                order_by=desc(ChatHistory.timestamp)
            ).label('rn')
        )
        .where(ChatHistory.user_id == current_user.id)
        .subquery()
    )

    result = await db.execute(
        select(subquery.c.session_id, subquery.c.message)
        .where(subquery.c.rn == 1)
        .order_by(desc(subquery.c.timestamp))
    )

    return [{"id": str(s.session_id), "title": s.message} for s in result.all()]


# =========================
# DELETE SESSION
# =========================
@router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(ChatHistory).where(
            ChatHistory.user_id == current_user.id,
            ChatHistory.session_id == session_id
        )
    )

    messages = result.scalars().all()

    if not messages:
        raise HTTPException(status_code=404, detail="Session not found")

    for m in messages:
        await db.delete(m)

    await db.commit()

    return {"message": "Session deleted"}