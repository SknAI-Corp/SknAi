import sys
import os
# Add the parent directory (LLM) to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import uuid
import logging
# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
import io
from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from PIL import Image
from src.chat.chain import setup_qa_chain
from src.ingest.pinecone_ops import initialize_pinecone
from src.embeddings.model_loader import load_biobert_model
from src.embeddings.embedder import embed_text
from langchain.vectorstores import Pinecone
PREDICT_API_URL = "http://localhost:8080/predict_mongo"  # URL of your predict_mongo route
from services.fetch_image_from_mongo import fetch_image_from_mongo
logger = logging.getLogger(__name__)
router = APIRouter()
SLIDING_WINDOW_SIZE = 5
import httpx

from fastapi.responses import JSONResponse
import json
conversation_store: Dict[str, List[Dict[str, str]]] = {}

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    user_message: Optional[str] = None
    image_id: Optional[str] = None

class SourceInfo(BaseModel):
    source: str
    title: str = ""

class ChatResponse(BaseModel):
    response: str
    session_id: str
    classification: Optional[Dict[str, float]] = None

index = initialize_pinecone()
tokenizer, model = load_biobert_model()
vector_store = Pinecone(index=index, embedding=embed_text, text_key="text")
qa_chain = setup_qa_chain(vector_store)
retriever = vector_store.as_retriever(search_kwargs={"k": 15})

def get_conversation_history(session_id: str) -> str:
    history = conversation_store.get(session_id, [])
    return "\n".join(f"User: {entry['query']}\nAI: {entry['response']}" for entry in history[-SLIDING_WINDOW_SIZE:])

async def generate_response(full_prompt, session_id):
    """Async generator to stream AI responses with session_id."""
    response_text = ""
    async for chunk in qa_chain.astream(full_prompt):
        # print(chunk)  # or use logging

        # chunk is a string, so append it directly to response_text
        response_text += chunk.get('result', '')

        # Yield the current response text as a JSON object for streaming
        yield {"response": response_text, "session_id": session_id}


        
        
@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    user_message = request.user_message
    image_id = request.image_id if hasattr(request, "image_id") else None  # Optional handling if needed
    full_prompt = ""
    if not session_id:
        session_id = str(uuid.uuid4())

    classification_result = None
    formatted_context = ""
    
    # Fetch classification results if an image ID is provided
    if image_id:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(PREDICT_API_URL, json={"image_id": image_id})
            
                # Log the raw response content
                logger.info(f"API response received: {response.text}")
                
                # Parse the JSON response
                classification_result = response.json()
                
                if classification_result:
                    logger.info(f"Classification Result: {classification_result}")
                else:
                    logger.error(f"No valid classification result returned for image_id {image_id}")
                    
            except httpx.HTTPError as e:
                logger.error(f"Error calling predict_mongo API: {e}")
                raise HTTPException(status_code=500, detail="Error calling disease classification API")


    # Check if the API response is in the expected format
    if classification_result and "prediction" in classification_result and "confidence" in classification_result:
        predicted_disease = classification_result["prediction"]
        confidence = classification_result["confidence"]
        
        # Log the disease and confidence
        logger.info(f"Predicted Disease: {predicted_disease}, Confidence: {confidence}")
        
        # Retrieve most likely disease and fetch relevant docs
        disease_context = retriever.get_relevant_documents(predicted_disease)
        formatted_context = "\n\n".join(doc.page_content for doc in disease_context)

        # Build your prompt
        full_prompt = f"""You are an AI skin specialist. Based on the uploaded image, the most probable disease is **{predicted_disease}** with a confidence of **{confidence}**.
        Here is some important medical information about this condition:\n\n{formatted_context}\n\n"""

    else:
        logger.error(f"Unexpected classification result format: {classification_result}")


    previous_context = get_conversation_history(session_id)
    full_prompt+=previous_context
    
    # 🔹 Append user query
    if user_message:
        full_prompt += f"User: {user_message}\n"

# Here we consume the async generator properly
    response_text = ""
    async for chunk in generate_response(full_prompt, session_id):  # Use async for to handle the generator
        response_text += chunk["response"]  # Access the response from the chunk dictionary


    return JSONResponse(content={
    "response": response_text,
    "session_id": session_id
})
