import sys
import os

# Ensure the root project directory is in the path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.models.trainer import train_model

def run_training_pipeline():
    train_model()

if __name__ == "__main__":
    run_training_pipeline()


# Run Training
# python pipelines/train_pipeline.py
