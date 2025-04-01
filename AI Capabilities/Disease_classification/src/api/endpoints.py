from fastapi import APIRouter, Body, File, Request, UploadFile, HTTPException, Form
from PIL import Image
import os
from src.models.classifier import predict_disease
from src.utils.config import UPLOAD_FOLDER
from src.utils.mongo_utils import fetch_image_from_mongo
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

# Note : Another endpoint will be added to directly fetch image from mongoDB and predict the disease on it.

# @router.post("/predict_mongo")
# async def predict_mongo(image_id: str = Body(...)):
#     image = await fetch_image_from_mongo(image_id)
#     return predict_disease(image)


@router.post("/predict_mongo")
async def predict_mongo(request: Request):
    body = await request.json()  # Inspect incoming request
    print(f"Received Request Body: {body}")
    
    if "image_id" not in body:
        raise HTTPException(status_code=400, detail="Missing 'image_id' in request body")
    
    image_id = body["image_id"]
    image = await fetch_image_from_mongo(image_id)
    return predict_disease(image)
