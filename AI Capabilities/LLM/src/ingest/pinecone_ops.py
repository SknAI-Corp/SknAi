
from src.embeddings.embedder import embed_text
import os
from pinecone import Pinecone, ServerlessSpec
# Load .env file
from dotenv import load_dotenv
load_dotenv()

def initialize_pinecone(index_name="sknai", dimension=1536, metric="cosine"):
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=dimension,
            metric=metric,
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )

    return pc.Index(index_name)


def upload_to_pinecone(index, chunks, batch_size=32):
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
