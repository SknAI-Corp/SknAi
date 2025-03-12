import sys
import os
import argparse

# Ensure the root project directory is in the path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.models.classifier import predict_disease

def run_inference_pipeline(image_path):
    result = predict_disease(image_path)
    print(f"Prediction: {result['prediction']} (Confidence: {result['confidence']:.2f})")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("image_path", type=str, help="Path to the image for classification")
    args = parser.parse_args()
    run_inference_pipeline(args.image_path)



# Run Inference
# python pipelines/inference_pipeline.py sample_image.jpg
