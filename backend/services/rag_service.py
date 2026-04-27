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

import uuid
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from fastembed import TextEmbedding

from db.database import weaviate_client
import weaviate.classes.config as wvc
from weaviate.classes.query import Filter
from weaviate.util import generate_uuid5

# =========================
# ⚡ FAST EMBEDDING MODEL
# =========================
embeddings_model = TextEmbedding("BAAI/bge-base-en-v1.5")

COLLECTION_NAME = "DocumentChunk"


# =========================
# 📦 CREATE SCHEMA
# =========================
def create_weaviate_schema():
    if not weaviate_client.collections.exists(COLLECTION_NAME):
        weaviate_client.collections.create(
            name=COLLECTION_NAME,
            vector_config=wvc.Configure.Vectors.self_provided(),
            properties=[
                wvc.Property(name="content", data_type=wvc.DataType.TEXT),
                wvc.Property(name="user_id", data_type=wvc.DataType.UUID),
                wvc.Property(name="file_id", data_type=wvc.DataType.UUID),
            ]
        )
# =========================
# 📄 PROCESS + EMBED FILE
# =========================
def process_and_embed_file(file_path: str, user_id: uuid.UUID, file_id: uuid.UUID):
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=80,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    chunks = text_splitter.split_documents(documents)
    collection = weaviate_client.collections.get(COLLECTION_NAME)

    texts = [chunk.page_content for chunk in chunks]

    if not texts:
        return 0

    vectors = list(embeddings_model.embed(texts))

    with collection.batch.fixed_size(100) as batch:
        for chunk, vector in zip(chunks, vectors):
            data_object = {
                "content": chunk.page_content,
                "user_id": user_id,
                "file_id": file_id,
            }

            batch.add_object(
                properties=data_object,
                vector=vector,
                uuid=generate_uuid5(data_object)
            )

    return len(chunks)


# =========================
# 🔍 QUERY VECTOR DB
# =========================
def query_weaviate(query: str, user_id: uuid.UUID, file_ids: list[uuid.UUID]):
    query_vector = list(embeddings_model.embed([query]))[0]
    collection = weaviate_client.collections.get(COLLECTION_NAME)

    file_id_strs = [str(fid) for fid in file_ids]

    response = collection.query.near_vector(
        near_vector=query_vector,
        filters=(
            Filter.by_property("user_id").equal(user_id) &
            Filter.by_property("file_id").contains_any(file_id_strs)
        ),
        limit=5,
        return_properties=["content"]
    )

    return [obj.properties for obj in response.objects]

