import torch
from PIL import Image
from transformers import ViTForImageClassification, ViTFeatureExtractor
from safetensors.torch import safe_open
import os
from src.utils.config import MODEL_PATH, id2label
from src.utils.preprocessing import preprocess_image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load feature extractor and model
feature_extractor = ViTFeatureExtractor.from_pretrained("google/vit-base-patch16-224-in21k")
model = ViTForImageClassification.from_pretrained(
    "google/vit-base-patch16-224-in21k", num_labels=len(id2label)
)

# Load trained weights
with safe_open(MODEL_PATH, framework="pt", device=device.type) as f:
    model_weights = {k: f.get_tensor(k) for k in f.keys()}
model.load_state_dict(model_weights, strict=False)
model.to(device)
model.eval()

def predict_disease_from_bytes(image: Image.Image):
    inputs = preprocess_image(image, feature_extractor)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1)
        predicted_class = torch.argmax(probs, dim=1).item()
        confidence = probs[0, predicted_class].item()

    return {
        "prediction": id2label[str(predicted_class)]
    }

