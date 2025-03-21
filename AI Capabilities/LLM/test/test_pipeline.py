# test_pipeline.py
import pytest

def test_pipeline():
    # Run the first test file
    pytest.main(["test_embedding.py"])
    
    # Run the second test file
    pytest.main(["test_llm_api_test.py"])

if __name__ == "__main__":
    test_pipeline()
