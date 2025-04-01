from fastapi import FastAPI
from src.api.endpoints import router
import os
app = FastAPI()

from dotenv import load_dotenv
load_dotenv()

import mongoengine as me

def init_mongo():
   me.connect(host= os.getenv("MONGO_URI"))  

# Connecting to the MongoDB database when app start
app.add_event_handler("startup", init_mongo)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
