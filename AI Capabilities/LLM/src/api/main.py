from fastapi import FastAPI
from src.api.routes import router

app = FastAPI(title="SknAI Chatbot API")

@app.get("/")
async def root():
    return {"message": "Welcome to the SknAI chatbot API!", "status": "healthy"}

app.include_router(router)
