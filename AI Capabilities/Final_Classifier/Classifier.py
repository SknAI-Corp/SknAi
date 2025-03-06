from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from transformers import ViTForImageClassification, ViTFeatureExtractor
from PIL import Image
import torch
import io
import json
import os
from safetensors.torch import safe_open

# Load model configuration
CONFIG_PATH = "./fine_tuned_SknAI_v5_11Label/config.json"
PREPROCESSOR_CONFIG_PATH = "./preprocessor_config.json"
MODEL_PATH = "./fine_tuned_SknAI_v5_11Label/model.safetensors"
UPLOAD_FOLDER = "uploads/"  # Define the upload folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load configurations
def load_config():
    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)
    return config

def load_preprocessor_config():
    with open(PREPROCESSOR_CONFIG_PATH, "r") as f:
        preprocessor_config = json.load(f)
    return preprocessor_config

config = load_config()
id2label = config["id2label"]
preprocessor_config = load_preprocessor_config()

# Load feature extractor
feature_extractor = ViTFeatureExtractor.from_pretrained("google/vit-base-patch16-224-in21k")

# Load model
model = ViTForImageClassification.from_pretrained(
    "google/vit-base-patch16-224-in21k", num_labels=len(id2label)
)

# Corrected SafeTensors loading
with safe_open(MODEL_PATH, framework="pt", device="cpu") as f:
    model_weights = {k: f.get_tensor(k) for k in f.keys()}
model.load_state_dict(model_weights, strict=False)
model.eval()

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to the Skin Disease Classification API"}

@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        return {"message": "File uploaded successfully", "file_name": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
def predict(file_name: str = Form(...)):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Read image
        image = Image.open(file_path).convert("RGB")
        
        # Preprocess image
        inputs = feature_extractor(images=image, return_tensors="pt")
        
        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0, predicted_class].item()
        
        return {
            "file_name": file_name,
            "prediction": id2label[str(predicted_class)],
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the API with: uvicorn Classifier:app --reload
