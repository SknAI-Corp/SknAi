# llm_chat_service/embeddings/embedder.py

import torch
import numpy as np
from typing import List
from langchain.embeddings.base import Embeddings
from embeddings.model_loader import load_biobert_model

# Cache model to avoid reloading
tokenizer, model = load_biobert_model()
model.eval()

def embed_text(text: str) -> List[float]:
    """
    Embeds a given text string using BioBERT [CLS] token output.
    """
    inputs = tokenizer(
        text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512
    )
    with torch.no_grad():
        outputs = model(**inputs)

    cls_embedding = outputs.last_hidden_state[:, 0, :].squeeze().numpy()
    norm = np.linalg.norm(cls_embedding)
    return (cls_embedding / norm).tolist() if norm > 0 else cls_embedding.tolist()

class BioBERTEmbeddings(Embeddings):
    """
    LangChain-compatible embedding wrapper for BioBERT.
    """

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [embed_text(text) for text in texts]

    def embed_query(self, text: str) -> List[float]:
        return embed_text(text)
