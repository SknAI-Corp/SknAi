from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from PIL import Image
import os
from src.models.classifier import predict_disease
from src.utils.config import UPLOAD_FOLDER

router = APIRouter()

@router.get("/")
def home():
    return {"message": "Welcome to the Skin Disease Classification API"}

@router.post("/upload")
def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        return {"message": "File uploaded successfully", "file_name": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict")
def predict(file_name: str = Form(...)):
    return predict_disease(file_name)
