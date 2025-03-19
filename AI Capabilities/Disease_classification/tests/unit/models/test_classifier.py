"""
Unit test for predict_disease function with a temporary image.
"""

import os
from PIL import Image, UnidentifiedImageError
import sys
import pytest

# Fix path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.models.classifier import predict_disease

def test_predict_disease():
    """Test that prediction returns label and confidence in valid range."""
    image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "test.jpg"))
    img = Image.new("RGB", (224, 224), color="white")
    img.save(image_path)

    result = predict_disease(str(image_path))
    assert "prediction" in result
    assert "confidence" in result
    assert 0.0 <= result["confidence"] <= 1.0

def test_predict_disease_invalid_path():
    """Ensure predict_disease raises error for non-existent image."""
    with pytest.raises((FileNotFoundError, UnidentifiedImageError, OSError)):
        predict_disease("non_existing_file.jpg")