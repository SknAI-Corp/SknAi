import os
import mongoengine as me
# Load Environment Variables
from dotenv import load_dotenv
load_dotenv()

# Define Image Schema using MongoEngine
class ImageModel(me.Document):
    image = me.BinaryField(required=True)  # This stores image as Binary data (Buffer in Node.js)
    contentType = me.StringField(required=True)  # Content Type like image/jpeg, image/png, etc.
    


