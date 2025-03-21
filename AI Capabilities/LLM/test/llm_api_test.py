import pytest
from fastapi.testclient import TestClient
import os
import sys
import logging
import sys
import os
# Make the path to the src folder available
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))


from src.api.routes import router

# Creating test cases for the API
# Make session id a global variable
session_id = ""

def test_ask_first_question():
    client = TestClient(router)
    response = client.post("/ask/first", json={"predicted_disease": "psoriasis"})

    # Debugging step: Print response JSON
    print("DEBUG: Response JSON =", response.json())

    # Save the session id for the next test
    global session_id
    session_id = response.json().get("session_id", None)

    assert response.status_code == 200
    assert "response" in response.json()
    assert "session_id" in response.json()


def test_ask_followup_question():
    client = TestClient(router)
    response = client.post("/ask/followup", json={"session_id": session_id, "query": "What is a psoriasis?"})
    assert response.status_code == 200
    assert "response" in response.json()
    assert "session_id" in response.json()
    
# Test the API

# Test the first question
test_ask_first_question()

# Test the follow-up question
test_ask_followup_question()

