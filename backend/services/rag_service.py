# services/rag_service.py

# PDF upload
#    ↓
# Chunking (500 tokens)
#    ↓
# FastEmbed (vectors)
#    ↓
# Weaviate storage
#    ↓
# User query
#    ↓
# Query embedding
#    ↓
# Vector search
#    ↓
# Top chunks
#    ↓
# Groq LLM answers using context

# # services/rag_service.py



# import os
# import uuid
# from typing import List

# import db.database as database


# # =========================
# # 🔧 CONFIG
# # =========================
# CHUNK_SIZE = 500
# CHUNK_OVERLAP = 50


# # =========================
# # 🔌 CLIENT HELPER
# # =========================
# def get_client():
#     client = database.weaviate_client
#     if client is None:
#         raise RuntimeError("Weaviate not initialized")
#     return client


# # =========================
# # 📦 SCHEMA SETUP
# # =========================
# def create_weaviate_schema():
#     client = database.weaviate_client

#     if client is None:
#         print("❌ Cannot create schema: Weaviate not initialized")
#         return

#     try:
#         existing = client.schema.get()

#         if "classes" in existing and any(c["class"] == "Document" for c in existing["classes"]):
#             print("ℹ️ Schema already exists")
#             return

#         schema = {
#             "class": "Document",
#             "vectorizer": "none",  # we provide embeddings manually
#             "properties": [
#                 {"name": "content", "dataType": ["text"]},
#                 {"name": "user_id", "dataType": ["string"]},
#                 {"name": "file_id", "dataType": ["string"]},
#             ],
#         }

#         client.schema.create_class(schema)
#         print("✅ Weaviate schema created")

#     except Exception as e:
#         print(f"❌ Schema creation failed: {e}")


# # =========================
# # ✂️ TEXT CHUNKING
# # =========================
# def chunk_text(text: str) -> List[str]:
#     chunks = []
#     start = 0

#     while start < len(text):
#         end = start + CHUNK_SIZE
#         chunk = text[start:end]
#         chunks.append(chunk)
#         start += CHUNK_SIZE - CHUNK_OVERLAP

#     return chunks


# # =========================
# # 🧠 EMBEDDING (PLACEHOLDER)
# # =========================
# def generate_embedding(text: str) -> List[float]:
#     """
#     Replace this with OpenAI / HuggingFace embedding later.
#     For now: dummy vector (required for 'vectorizer: none')
#     """
#     return [0.0] * 384  # fake vector


# # =========================
# # 📄 FILE READER
# # =========================
# def read_file(file_path: str) -> str:
#     try:
#         with open(file_path, "r", encoding="utf-8") as f:
#             return f.read()
#     except Exception as e:
#         raise RuntimeError(f"Failed to read file: {str(e)}")


# # =========================
# # 🚀 MAIN PROCESS FUNCTION
# # =========================
# def process_and_embed_file(file_path: str, user_id: str, file_id: str) -> int:
#     try:
#         client = get_client()

#         # 1️⃣ Read file
#         text = read_file(file_path)

#         if not text.strip():
#             raise RuntimeError("File is empty")

#         # 2️⃣ Chunk text
#         chunks = chunk_text(text)

#         # 3️⃣ Insert into Weaviate
#         count = 0

#         with client.batch as batch:
#             batch.batch_size = 10

#             for chunk in chunks:
#                 embedding = generate_embedding(chunk)

#                 data_object = {
#                     "content": chunk,
#                     "user_id": str(user_id),
#                     "file_id": str(file_id),
#                 }

#                 batch.add_data_object(
#                     data_object=data_object,
#                     class_name="Document",
#                     uuid=str(uuid.uuid4()),
#                     vector=embedding,
#                 )

#                 count += 1

#         print(f"✅ Inserted {count} chunks into Weaviate")
#         return count

#     except Exception as e:
#         raise RuntimeError(f"File processing failed: {str(e)}")


# # =========================
# # 🔍 QUERY FUNCTION (OPTIONAL)
# # =========================
# def query_documents(query: str, user_id: str, limit: int = 5):
#     try:
#         client = get_client()

#         # dummy embedding (replace later)
#         query_vector = generate_embedding(query)

#         result = (
#             client.query
#             .get("Document", ["content", "file_id"])
#             .with_near_vector({"vector": query_vector})
#             .with_where({
#                 "path": ["user_id"],
#                 "operator": "Equal",
#                 "valueString": str(user_id)
#             })
#             .with_limit(limit)
#             .do()
#         )

#         return result


    # except Exception as e:
    #     raise RuntimeError(f"Query failed: {str(e)}")


import os
import uuid
from typing import List

import db.database as database


# =========================
# 🔧 CONFIG
# =========================
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
CLASS_NAME = "Document"


# =========================
# 🔌 CLIENT HELPER
# =========================
def get_client():
    client = database.weaviate_client
    if client is None:
        raise RuntimeError("Weaviate not initialized")
    return client


# =========================
# 📦 SCHEMA SETUP
# =========================
def create_weaviate_schema():
    client = database.weaviate_client

    if client is None:
        print("❌ Cannot create schema: Weaviate not initialized")
        return

    try:
        existing = client.schema.get()

        if "classes" in existing and any(c["class"] == CLASS_NAME for c in existing["classes"]):
            print("ℹ️ Schema already exists")
            return

        schema = {
            "class": CLASS_NAME,
            "vectorizer": "none",
            "properties": [
                {"name": "content", "dataType": ["text"]},
                {"name": "user_id", "dataType": ["string"]},
                {"name": "file_id", "dataType": ["string"]},
            ],
        }

        client.schema.create_class(schema)
        print("✅ Weaviate schema created")

    except Exception as e:
        print(f"❌ Schema creation failed: {e}")


# =========================
# ✂️ TEXT CHUNKING
# =========================
def chunk_text(text: str) -> List[str]:
    chunks = []
    start = 0

    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end]
        chunks.append(chunk)
        start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


# =========================
# 🧠 EMBEDDING (PLACEHOLDER)
# =========================
def generate_embedding(text: str) -> List[float]:
    # Replace with real embedding later
    return [0.0] * 384


# =========================
# 📄 FILE READER
# =========================
def read_file(file_path: str) -> str:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        raise RuntimeError(f"Failed to read file: {str(e)}")


# =========================
# 🚀 MAIN PROCESS FUNCTION
# =========================
def process_and_embed_file(file_path: str, user_id: str, file_id: str) -> int:
    try:
        client = get_client()

        # 1️⃣ Read file
        text = read_file(file_path)

        if not text.strip():
            raise RuntimeError("File is empty")

        # 2️⃣ Chunk text
        chunks = chunk_text(text)

        count = 0

        # 3️⃣ Insert into Weaviate (v3 batch API)
        with client.batch as batch:
            batch.batch_size = 10

            for chunk in chunks:
                embedding = generate_embedding(chunk)

                batch.add_data_object(
                    data_object={
                        "content": chunk,
                        "user_id": str(user_id),
                        "file_id": str(file_id),
                    },
                    class_name=CLASS_NAME,
                    uuid=str(uuid.uuid4()),
                    vector=embedding,
                )

                count += 1

        print(f"✅ Inserted {count} chunks into Weaviate")
        return count

    except Exception as e:
        raise RuntimeError(f"File processing failed: {str(e)}")


# =========================
# 🔍 QUERY FUNCTION
# =========================
def query_weaviate(query: str, user_id: str, limit: int = 5):
    try:
        client = get_client()

        query_vector = generate_embedding(query)

        result = (
            client.query
            .get(CLASS_NAME, ["content", "file_id"])
            .with_near_vector({"vector": query_vector})
            .with_where({
                "path": ["user_id"],
                "operator": "Equal",
                "valueString": str(user_id)
            })
            .with_limit(limit)
            .do()
        )

        return result

    except Exception as e:
        raise RuntimeError(f"Query failed: {str(e)}")
