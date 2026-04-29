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

# import uuid
# from langchain_community.document_loaders import PyPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter

# from fastembed import TextEmbedding

# from db.database import weaviate_client
# import weaviate.classes.config as wvc
# from weaviate.classes.query import Filter
# from weaviate.util import generate_uuid5

# # =========================
# # ⚡ FAST EMBEDDING MODEL
# # =========================
# embeddings_model = TextEmbedding("BAAI/bge-base-en-v1.5")

# COLLECTION_NAME = "DocumentChunk"


# # =========================
# # 📦 CREATE SCHEMA
# # =========================
# def create_weaviate_schema():
#     if not weaviate_client.collections.exists(COLLECTION_NAME):
#         weaviate_client.collections.create(
#             name=COLLECTION_NAME,
#             vector_config=wvc.Configure.Vectors.self_provided(),
#             properties=[
#                 wvc.Property(name="content", data_type=wvc.DataType.TEXT),
#                 wvc.Property(name="user_id", data_type=wvc.DataType.UUID),
#                 wvc.Property(name="file_id", data_type=wvc.DataType.UUID),
#             ]
#         )
# # =========================
# # 📄 PROCESS + EMBED FILE
# # =========================
# def process_and_embed_file(file_path: str, user_id: uuid.UUID, file_id: uuid.UUID):
#     loader = PyPDFLoader(file_path)
#     documents = loader.load()

#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=500,
#         chunk_overlap=80,
#         separators=["\n\n", "\n", ". ", " ", ""]
#     )

#     chunks = text_splitter.split_documents(documents)
#     collection = weaviate_client.collections.get(COLLECTION_NAME)

#     texts = [chunk.page_content for chunk in chunks]

#     if not texts:
#         return 0

#     vectors = list(embeddings_model.embed(texts))

#     with collection.batch.fixed_size(100) as batch:
#         for chunk, vector in zip(chunks, vectors):
#             data_object = {
#                 "content": chunk.page_content,
#                 "user_id": user_id,
#                 "file_id": file_id,
#             }

#             batch.add_object(
#                 properties=data_object,
#                 vector=vector,
#                 uuid=generate_uuid5(data_object)
#             )

#     return len(chunks)


# # =========================
# # 🔍 QUERY VECTOR DB
# # =========================
# def query_weaviate(query: str, user_id: uuid.UUID, file_ids: list[uuid.UUID]):
#     query_vector = list(embeddings_model.embed([query]))[0]
#     collection = weaviate_client.collections.get(COLLECTION_NAME)

#     file_id_strs = [str(fid) for fid in file_ids]

#     response = collection.query.near_vector(
#         near_vector=query_vector,
#         filters=(
#             Filter.by_property("user_id").equal(user_id) &
#             Filter.by_property("file_id").contains_any(file_id_strs)
#         ),
#         limit=5,
#         return_properties=["content"]
#     )

#     return [obj.properties for obj in response.objects]

# # services/rag_service.py

# import uuid
# import os
# from typing import List, Optional

# from langchain_community.document_loaders import PyPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from fastembed import TextEmbedding

# from db.database import get_weaviate
# import weaviate.classes.config as wvc
# from weaviate.classes.query import Filter
# from weaviate.util import generate_uuid5


# # =========================
# # ⚙️ ENV OPTIMIZATION
# # =========================
# os.environ["OMP_NUM_THREADS"] = "1"
# os.environ["TOKENIZERS_PARALLELISM"] = "false"


# # =========================
# # ⚡ CONFIG
# # =========================
# COLLECTION_NAME = "DocumentChunk"
# EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
# CHUNK_SIZE = 300
# CHUNK_OVERLAP = 50
# BATCH_SIZE = 16


# # =========================
# # 🧠 LAZY EMBEDDING MODEL
# # =========================
# _embedding_model: Optional[TextEmbedding] = None


# def get_embedding_model() -> TextEmbedding:
#     global _embedding_model
#     if _embedding_model is None:
#         _embedding_model = TextEmbedding(EMBED_MODEL_NAME)
#     return _embedding_model


# # =========================
# # 📦 CREATE SCHEMA
# # =========================
# def create_weaviate_schema():
#     client = get_weaviate()

#     if client is None:
#         print("⚠️ Weaviate not connected → skipping schema creation")
#         return

#     try:
#         if not client.collections.exists(COLLECTION_NAME):
#             client.collections.create(
#                 name=COLLECTION_NAME,
#                 vector_config=wvc.Configure.Vectors.self_provided(),
#                 properties=[
#                     wvc.Property(name="content", data_type=wvc.DataType.TEXT),
#                     wvc.Property(name="user_id", data_type=wvc.DataType.UUID),
#                     wvc.Property(name="file_id", data_type=wvc.DataType.UUID),
#                 ]
#             )

#     except Exception as e:
#         print(f"⚠️ Schema creation failed: {e}")


# # =========================
# # 🔪 SPLITTER
# # =========================
# def get_text_splitter():
#     return RecursiveCharacterTextSplitter(
#         chunk_size=CHUNK_SIZE,
#         chunk_overlap=CHUNK_OVERLAP,
#         separators=["\n\n", "\n", ". ", " ", ""]
#     )


# # =========================
# # ⚡ EMBEDDINGS
# # =========================
# def embed_texts(texts: List[str]) -> List[List[float]]:
#     model = get_embedding_model()

#     vectors = []
#     for i in range(0, len(texts), BATCH_SIZE):
#         batch = texts[i:i + BATCH_SIZE]
#         vectors.extend(list(model.embed(batch)))

#     return vectors


# # =========================
# # 📄 PROCESS + EMBED FILE
# # =========================
# def process_and_embed_file(file_path: str, user_id: uuid.UUID, file_id: uuid.UUID) -> int:
#     try:
#         client = get_weaviate()
#         if client is None:
#             raise RuntimeError("Weaviate not initialized")

#         loader = PyPDFLoader(file_path)
#         documents = list(loader.lazy_load())

#         if not documents:
#             return 0

#         splitter = get_text_splitter()
#         chunks = splitter.split_documents(documents)

#         texts = [c.page_content for c in chunks if c.page_content.strip()]
#         if not texts:
#             return 0

#         vectors = embed_texts(texts)

#         collection = client.collections.get(COLLECTION_NAME)

#         with collection.batch.fixed_size(50) as batch:
#             for chunk, vector in zip(chunks, vectors):
#                 data_object = {
#                     "content": chunk.page_content,
#                     "user_id": user_id,
#                     "file_id": file_id,
#                 }

#                 batch.add_object(
#                     properties=data_object,
#                     vector=vector,
#                     uuid=generate_uuid5(data_object)
#                 )

#         return len(chunks)

#     except Exception as e:
#         raise RuntimeError(f"File processing failed: {str(e)}")


# # =========================
# # 🔍 QUERY VECTOR DB
# # =========================
# def query_weaviate(query: str, user_id: uuid.UUID, file_ids: List[uuid.UUID], limit: int = 5) -> List[str]:
#     try:
#         client = get_weaviate()
#         if client is None:
#             raise RuntimeError("Weaviate not initialized")

#         model = get_embedding_model()
#         query_vector = list(model.embed([query]))[0]

#         collection = client.collections.get(COLLECTION_NAME)

#         file_id_strs = [str(fid) for fid in file_ids]

#         response = collection.query.near_vector(
#             near_vector=query_vector,
#             filters=(
#                 Filter.by_property("user_id").equal(user_id) &
#                 Filter.by_property("file_id").contains_any(file_id_strs)
#             ),
#             limit=limit,
#             return_properties=["content"]
#         )

#         return [obj.properties["content"] for obj in response.objects]

#     except Exception as e:
#         raise RuntimeError(f"Query failed: {str(e)}")


import os
import uuid
from typing import List

import db.database as database


# =========================
# 🔧 CONFIG
# =========================
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50


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

        if "classes" in existing and any(c["class"] == "Document" for c in existing["classes"]):
            print("ℹ️ Schema already exists")
            return

        schema = {
            "class": "Document",
            "vectorizer": "none",  # we provide embeddings manually
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
    """
    Replace this with OpenAI / HuggingFace embedding later.
    For now: dummy vector (required for 'vectorizer: none')
    """
    return [0.0] * 384  # fake vector


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

        # 3️⃣ Insert into Weaviate
        count = 0

        with client.batch as batch:
            batch.batch_size = 10

            for chunk in chunks:
                embedding = generate_embedding(chunk)

                data_object = {
                    "content": chunk,
                    "user_id": str(user_id),
                    "file_id": str(file_id),
                }

                batch.add_data_object(
                    data_object=data_object,
                    class_name="Document",
                    uuid=str(uuid.uuid4()),
                    vector=embedding,
                )

                count += 1

        print(f"✅ Inserted {count} chunks into Weaviate")
        return count

    except Exception as e:
        raise RuntimeError(f"File processing failed: {str(e)}")


# =========================
# 🔍 QUERY FUNCTION (OPTIONAL)
# =========================
def query_documents(query: str, user_id: str, limit: int = 5):
    try:
        client = get_client()

        # dummy embedding (replace later)
        query_vector = generate_embedding(query)

        result = (
            client.query
            .get("Document", ["content", "file_id"])
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
