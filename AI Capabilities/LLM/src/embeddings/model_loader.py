import torch
from transformers import AutoModel, AutoTokenizer

def load_biobert_model():
    tokenizer = AutoTokenizer.from_pretrained("monologg/biobert_v1.1_pubmed")
    model = AutoModel.from_pretrained("monologg/biobert_v1.1_pubmed")
    return tokenizer, model