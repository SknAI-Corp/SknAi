# import torch
# from transformers import AutoModel, AutoTokenizer

# def load_biobert_model():
#     tokenizer = AutoTokenizer.from_pretrained("monologg/biobert_v1.1_pubmed")
#     model = AutoModel.from_pretrained("monologg/biobert_v1.1_pubmed")
#     return tokenizer, model


# llm_chat_service/embeddings/model_loader.py

from transformers import AutoModel, AutoTokenizer

def load_biobert_model():
    """
    Loads the BioBERT model and tokenizer for medical text embeddings.
    Returns:
        tuple: (tokenizer, model) both from HuggingFace.
    """
    tokenizer = AutoTokenizer.from_pretrained("monologg/biobert_v1.1_pubmed")
    model = AutoModel.from_pretrained("monologg/biobert_v1.1_pubmed")
    return tokenizer, model
