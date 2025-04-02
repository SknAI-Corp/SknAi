import pytest
from PIL import Image

import sys
import os

# Ensure the root project directory is in the path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.models.classifier import predict_disease

def test_model_prediction():
    image_path = "download2.jpg"
    result = predict_disease(image_path)
    assert "prediction" in result
    assert 0 <= result["confidence"] <= 1