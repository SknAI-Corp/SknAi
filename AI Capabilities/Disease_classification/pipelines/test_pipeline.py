import subprocess

def run_test_pipeline():
    subprocess.run(["pytest", "tests/test_api.py"])
    subprocess.run(["pytest", "tests/test_model.py"])
    subprocess.run(["pytest", "tests/test_classifier.py"])
    subprocess.run(["pytest", "tests/test_trainer.py"])
    subprocess.run(["pytest", "tests/test_preprocessing.py"])

if __name__ == "__main__":
    run_test_pipeline()


# Run Tests
# python pipelines/test_pipeline.py
