import pytest
import torch
import numpy as np

import sys
import os
# Make the path to the src folder available
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from src.embeddings.embedder import embed_text  

# Test the embed_text function with a real BioBERT model
def test_embed_text_real_case():
    # Input text to test
    text = "This is a test sentence."

    # Call the embed_text function, which will load the model and tokenizer
    embedding = embed_text(text)

    # Check if the output is a list (normalized embedding)
    assert isinstance(embedding, list)
    
    # Check if it's not empty (assuming your model returns valid embeddings)
    assert len(embedding) > 0

    # Ensure the embedding is a 1-dimensional list (the size should match your embedding output size)
    assert len(embedding) == 768  # The BioBERT embeddings are typically of size 768

    # Ensure it is normalized (L2 norm should be 1 if norm > 0)
    norm = np.linalg.norm(embedding)
    assert np.isclose(norm, 1.0, atol=1e-5)  # The norm should be 1 (or close to it)

# Edge case test for empty input
def test_embed_text_empty_input():
    text = ""  # Empty string
    
    # Call the embed_text function
    embedding = embed_text(text)

    # Ensure that the function still returns a list, even for an empty string
    assert isinstance(embedding, list)
    assert len(embedding) == 768  # Should still return an embedding with the same dimension

