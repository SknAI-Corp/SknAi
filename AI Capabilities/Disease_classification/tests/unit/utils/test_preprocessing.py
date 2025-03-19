"""
Unit tests for preprocessing functions used in image transformation and model input formatting.

This file tests:
- preprocess_image: ensures image is converted to pixel tensors correctly.
- transform_data: ensures batch transformation adds pixel_values.
"""

import numpy as np
from PIL import Image
from transformers import ViTFeatureExtractor
import sys
import os

# Fix Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.utils.preprocessing import preprocess_image, transform_data

def test_preprocess_image():
    """Test single image conversion to pixel tensors."""
    img = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
    feature_extractor = ViTFeatureExtractor.from_pretrained("google/vit-base-patch16-224-in21k")
    result = preprocess_image(img, feature_extractor)
    assert "pixel_values" in result
    assert result["pixel_values"].shape[1:] == (3, 224, 224)

def test_transform_data():
    """Test transformation of a batch of images."""
    dummy_image = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
    batch = {"image": [dummy_image, dummy_image]}
    feature_extractor = ViTFeatureExtractor.from_pretrained("google/vit-base-patch16-224-in21k")
    result = transform_data(batch, feature_extractor)
    assert "pixel_values" in result
    assert result["pixel_values"].shape[0] == 2
