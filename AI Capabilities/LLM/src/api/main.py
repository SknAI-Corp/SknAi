import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from fastapi import FastAPI
from src.api.routes import router
import mongoengine as me
from dotenv import load_dotenv
load_dotenv()



def init_mongo():
   me.connect(host= os.getenv("MONGO_URI"))  

app = FastAPI(title="SknAI Chatbot API")
@app.on_event("startup")
async def startup_event():
    init_mongo()
@app.get("/")
async def root():
    return {"message": "Welcome to the SknAI chatbot API!", "status": "healthy"}

app.include_router(router)
