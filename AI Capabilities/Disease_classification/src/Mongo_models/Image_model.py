import os
import mongoengine as me
# Load Environment Variables
from dotenv import load_dotenv
load_dotenv()

# Define Image Schema using MongoEngine
class ImageModel(me.Document):
    image = me.BinaryField(required=True)  # This stores image as Binary data (Buffer in Node.js)
    contentType = me.StringField(required=True)  # Content Type like image/jpeg, image/png, etc.
    
# Function to save an image to MongoDB
def save_image_to_mongo(image_path, content_type):
    with open(image_path, "rb") as f:
        image_binary = f.read()

    image_doc = ImageModel(image=image_binary, contentType=content_type)
    image_doc.save()

    print(f"Image saved with ID: {image_doc.id}")
    return str(image_doc.id)

