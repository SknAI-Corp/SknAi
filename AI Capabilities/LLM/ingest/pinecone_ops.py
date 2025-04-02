
# from src.embeddings.embedder import embed_text
# import os
# from pinecone import Pinecone, ServerlessSpec
# # Load .env file
# from dotenv import load_dotenv
# load_dotenv()

# def initialize_pinecone(index_name="sknai", dimension=1536, metric="cosine"):
#     pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

#     if index_name not in pc.list_indexes().names():
#         pc.create_index(
#             name=index_name,
#             dimension=dimension,
#             metric=metric,
#             spec=ServerlessSpec(cloud="aws", region="us-east-1")
#         )

#     return pc.Index(index_name)


# def upload_to_pinecone(index, chunks, batch_size=32):
#     batch = []
#     for i, chunk in enumerate(chunks):
#         embedding = embed_text(chunk)
#         metadata = {"text": chunk, "chunk_id": str(i)}
#         batch.append((str(i), embedding, metadata))
#         if len(batch) >= batch_size:
#             index.upsert(vectors=batch)
#             batch = []
#     if batch:
#         index.upsert(vectors=batch)


# llm_chat_service/ingest/pinecone_ops.py

from config import (
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
    PINECONE_REGION,
    PINECONE_ENVIRONMENT,
    EMBEDDING_DIM,
)
from embeddings.embedder import embed_text
from pinecone import Pinecone, ServerlessSpec

def initialize_pinecone(index_name: str = PINECONE_INDEX_NAME, dimension: int = EMBEDDING_DIM):
    """
    Initializes or connects to a Pinecone index.

    Returns:
        Index: Pinecone vector store index object.
    """
    pc = Pinecone(api_key=PINECONE_API_KEY)

    # Create index if it doesn't exist
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=dimension,
            metric="cosine",
            spec=ServerlessSpec(cloud=PINECONE_ENVIRONMENT, region=PINECONE_REGION)
        )

    return pc.Index(index_name)

def upload_to_pinecone(index, chunks: list, batch_size: int = 32):
    """
    Uploads chunks of text as vectors into Pinecone.

    Args:
        index: Pinecone index object.
        chunks (list): List of text chunks.
        batch_size (int): Number of vectors to upload per batch.
    """
    batch = []
    for i, chunk in enumerate(chunks):
        embedding = embed_text(chunk)
        metadata = {"text": chunk, "chunk_id": str(i)}
        batch.append((str(i), embedding, metadata))

        if len(batch) >= batch_size:
            index.upsert(vectors=batch)
            batch = []

    if batch:
        index.upsert(vectors=batch)
