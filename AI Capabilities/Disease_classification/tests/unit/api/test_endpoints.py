"""
Unit tests for API endpoints: /upload and /predict.
Uses FastAPI's TestClient with mocking.
"""

import os
import io
from fastapi.testclient import TestClient
from unittest.mock import patch

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.main import app

client = TestClient(app)

def test_upload_file():
    """Test /upload endpoint with a dummy file."""
    dummy_file = io.BytesIO(b"fake image data")
    response = client.post("/upload", files={"file": ("test.jpg", dummy_file, "image/jpeg")})
    assert response.status_code == 200
    assert "file_name" in response.json()
    assert response.json()["file_name"] == "test.jpg"

@patch("src.api.endpoints.predict_disease")
def test_predict(mock_predict):
    """Test /predict endpoint with mocked prediction."""
    mock_predict.return_value = {
        "prediction": "eczema",
        "confidence": 0.92
    }

    response = client.post("/predict", data={"file_name": "test.jpg"})
    assert response.status_code == 200
    assert response.json() == {"prediction": "eczema", "confidence": 0.92}
