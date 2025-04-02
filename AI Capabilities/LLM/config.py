# llm_chat_service/config.py

import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env in root

# === Pinecone Config ===
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "aws")
PINECONE_REGION = os.getenv("PINECONE_REGION", "us-east-1")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "sknai")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", 768))  # BioBERT = 768

# === LLM Config ===
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "mistral-large-latest")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", 0.4))
RETRIEVAL_TOP_K = int(os.getenv("RETRIEVAL_TOP_K", 15))
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# === Service Info ===
SERVICE_NAME = "LLM Chat Service for SknAI"
