import numpy as np
import torch
from src.embeddings.model_loader import load_biobert_model

def embed_text(text):
    tokenizer, model = load_biobert_model()
    model.eval()
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    embeddings = outputs.last_hidden_state[:, 0, :].squeeze().numpy()
    norm = np.linalg.norm(embeddings)
    return (embeddings / norm).tolist() if norm > 0 else embeddings.tolist()
