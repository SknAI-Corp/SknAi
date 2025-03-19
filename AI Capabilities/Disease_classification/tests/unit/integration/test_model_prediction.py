"""
Smoke test for model prediction using a real image file.
WARNING: This test depends on an existing image path.
"""

import pytest
from PIL import Image
import sys
import os

# Fix path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.models.classifier import predict_disease

def test_model_prediction():
    """Ensure prediction function works end-to-end on a sample image."""
    image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "test.jpg"))
    result = predict_disease(image_path)
    assert "prediction" in result
    assert 0 <= result["confidence"] <= 1