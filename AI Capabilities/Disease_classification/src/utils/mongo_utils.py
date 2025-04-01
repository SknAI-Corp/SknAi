from PIL import Image
import io
from bson import ObjectId
from fastapi import HTTPException

# Define Image model for MongoDB
from src.Mongo_models.Image_model import ImageModel


async def fetch_image_from_mongo(image_id: str):
    """
    Fetches an image from MongoDB by its ID, and returns a PIL Image object.
    Args:
        image_id (str): The image ID in MongoDB.
    
    Returns:
        PIL.Image: The image in the form of a PIL Image object.
    """
    try:
       # Convert the string ID to ObjectId
        image_object_id = ObjectId(image_id)

        # Fetch the image document using MongoEngine
        image_document = ImageModel.objects(id=image_object_id).first()  # Use `.first()` instead of `.find_one()`
        
        if not image_document:
            raise HTTPException(status_code=404, detail="Image not found")

        # Convert the image data (stored as Buffer) to a PIL Image
        image_data = image_document['image']
        image = Image.open(io.BytesIO(image_data))
        return image
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
