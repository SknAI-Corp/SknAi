import pytest
from fastapi.testclient import TestClient
import os
import sys
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Determine the correct path to add
project_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(project_root)

# Import your FastAPI app
from src.api.main import app

@pytest.fixture
def client():
    # Return the test client
    with TestClient(app) as test_client:
        yield test_client

# Test case for root endpoint
def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

# Test case for /ask/first endpoint with mocking
def test_ask_first_question(client, monkeypatch):
    # Mock the retriever.get_relevant_documents method
    mock_docs = [type('obj', (object,), {
        'page_content': 'Mock content about Psoriasis',
        'metadata': {'source': 'mock_source', 'title': 'Mock Title'}
    })]
    
    def mock_get_docs(*args, **kwargs):
        return mock_docs
    
    # Mock the qa_chain.invoke method
    def mock_invoke(*args, **kwargs):
        return "This is a test response about Psoriasis."
    
    # Apply monkeypatches
    import src.api.main
    # Create dummy class for qa_chain if it doesn't exist
    if not hasattr(src.api.main, "qa_chain"):
        class MockQAChain:
            def invoke(self, query):
                return "This is a test response about Psoriasis."
        src.api.main.qa_chain = MockQAChain()
    else:
        monkeypatch.setattr(src.api.main.qa_chain, "invoke", mock_invoke)
    
    # Create dummy class for retriever if it doesn't exist
    if not hasattr(src.api.main, "retriever"):
        class MockRetriever:
            def get_relevant_documents(self, query):
                return mock_docs
        src.api.main.retriever = MockRetriever()
    else:
        monkeypatch.setattr(src.api.main.retriever, "get_relevant_documents", mock_get_docs)
    
    # Send request
    request_data = {"predicted_disease": "Psoriasis"}
    response = client.post("/ask/first", json=request_data)
    
    # Check response
    assert response.status_code == 200
    
    # Basic structure validation
    response_data = response.json()
    assert "response" in response_data
    assert "session_id" in response_data
    assert "sources" in response_data
    
    return response_data["session_id"]

# Test case for /ask/followup endpoint
def test_ask_followup_question(client, monkeypatch):
    # First create a session
    session_id = test_ask_first_question(client, monkeypatch)
    
    # Mock documents for the followup
    mock_docs = [type('obj', (object,), {
        'page_content': 'Mock content about treatment options',
        'metadata': {'source': 'mock_source', 'title': 'Mock Title'}
    })]
    
    def mock_get_docs(*args, **kwargs):
        return mock_docs
    
    # Mock the retriever again (in case it was reset)
    import src.api.main
    if not hasattr(src.api.main, "retriever"):
        class MockRetriever:
            def get_relevant_documents(self, query):
                return mock_docs
        src.api.main.retriever = MockRetriever()
    else:
        monkeypatch.setattr(src.api.main.retriever, "get_relevant_documents", mock_get_docs)
    
    # Use the session_id to make a follow-up request
    request_data = {"session_id": session_id, "query": "What are the treatment options?"}
    response = client.post("/ask/followup", json=request_data)
    
    # Check response
    assert response.status_code == 200
    
    # Basic structure validation
    response_data = response.json()
    assert "response" in response_data
    assert "session_id" in response_data
    assert "sources" in response_data

# Test case for invalid session ID
def test_ask_followup_invalid_session(client):
    # Make a follow-up request with an invalid session_id
    request_data = {"session_id": "invalid-session-id", "query": "What are the treatment options?"}
    response = client.post("/ask/followup", json=request_data)
    
    # Check if the response status is 400 (Bad Request)
    assert response.status_code == 400