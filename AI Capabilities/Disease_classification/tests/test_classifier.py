import os
from PIL import Image
import sys

# Ensure the root project directory is in the path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.models.classifier import predict_disease

def test_predict_disease(tmp_path):
    image_path = tmp_path / "test.jpg"
    img = Image.new("RGB", (224, 224), color="white")
    img.save(image_path)

    result = predict_disease(str(image_path))
    assert "prediction" in result
    assert "confidence" in result
    assert 0.0 <= result["confidence"] <= 1.0
