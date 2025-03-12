from PIL import Image
import torch
import numpy as np

def preprocess_image(image: Image, feature_extractor):
    return feature_extractor(images=image, return_tensors="pt")

def transform_data(batch, feature_extractor):
    images = []
    for img in batch["image"]:
        img = Image.fromarray(np.array(img).astype("uint8")) if not isinstance(img, Image.Image) else img
        img = img.convert("RGB")
        images.append(img)

    encodings = feature_extractor(images=images, return_tensors="pt")
    batch["pixel_values"] = encodings["pixel_values"].numpy()
    return batch