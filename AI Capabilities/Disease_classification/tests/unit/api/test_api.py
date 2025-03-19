"""
API tests for FastAPI endpoints defined in endpoints.py.
Only `/` endpoint is tested here.
"""

import pytest
from fastapi.testclient import TestClient
import sys, os

# Fix path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.main import app

client = TestClient(app)

def test_home():
    """Test root endpoint returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Skin Disease Classification API"}