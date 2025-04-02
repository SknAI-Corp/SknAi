from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from PIL import Image
from io import BytesIO
from src.models.classifier import predict_disease_from_bytes


router = APIRouter()

from fastapi import APIRouter, HTTPException, Query
from PIL import Image
from io import BytesIO
import requests
from src.models.classifier import predict_disease_from_bytes

router = APIRouter()

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image
from io import BytesIO
import requests
from src.models.classifier import predict_disease_from_bytes

router = APIRouter()

# 🔸 Request schema
class ImageURLRequest(BaseModel):
    image_url: str

@router.post("/predict")
def predict_from_url(request: ImageURLRequest):
    try:
        # Step 1: Download image from Cloudinary
        response = requests.get(request.image_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch image from URL")

        image = Image.open(BytesIO(response.content)).convert("RGB")

        # Step 2: Run prediction
        result = predict_disease_from_bytes(image)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

