import sys
import os

# Add the parent directory (LLM) to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict
import uuid
import logging
from src.chat.chain import setup_qa_chain
from src.services.context import get_conversation_history
from src.ingest.pinecone_ops import initialize_pinecone
from src.embeddings.model_loader import load_biobert_model
from src.embeddings.embedder import embed_text
from langchain.vectorstores import Pinecone

logger = logging.getLogger(__name__)
router = APIRouter()

conversation_store: Dict[str, List[Dict[str, str]]] = {}

class FirstQuestionRequest(BaseModel):
    predicted_disease: str

class FollowUpQuestionRequest(BaseModel):
    session_id: str
    query: str = Field(..., min_length=3, max_length=1000)

class SourceInfo(BaseModel):
    source: str
    title: str = ""

class QuestionResponse(BaseModel):
    response: str
    sources: List[SourceInfo]
    session_id: str

index = initialize_pinecone()
tokenizer, model = load_biobert_model()
vector_store = Pinecone(index=index, embedding=embed_text, text_key="text")
qa_chain = setup_qa_chain(vector_store)
retriever = vector_store.as_retriever(search_kwargs={"k": 3})

@router.post("/ask/first", response_model=QuestionResponse)
async def ask_first_question(request: FirstQuestionRequest):
    session_id = str(uuid.uuid4())
    logger.info(f"New session {session_id}: Predicted Disease: {request.predicted_disease}")

    disease_context = retriever.get_relevant_documents(request.predicted_disease)
    formatted_context = "\n\n".join(doc.page_content for doc in disease_context)

    system_prompt = f"""You are a virtual doctor providing guidance to a patient. Based on the predicted disease "{request.predicted_disease}",  
explain the condition in a clear and professional manner...

Cover the following details:  
- What it is  
- Common symptoms  
- Causes  
- Treatments  

At the end of your response, clearly state that you are an AI and not a real doctor, advising the patient to consult a healthcare professional.

Disclaimer: "I am an AI medical assistant, not a licensed doctor. Please consult a qualified healthcare professional for diagnosis and treatment."
"""

    response_text = qa_chain.invoke(system_prompt)
    # Response text is a dict with keys "query" and "result"
    # We only need the "result" key
    response_text = response_text["result"]
    conversation_store[session_id] = [{"query": f"Info on {request.predicted_disease}", "response": response_text}]
    sources = [SourceInfo(source=doc.metadata.get("source", "Unknown"), title=doc.metadata.get("title", "")) for doc in disease_context]

    return QuestionResponse(response=response_text, sources=sources, session_id=session_id)

@router.post("/ask/followup", response_model=QuestionResponse)
async def ask_followup_question(request: FollowUpQuestionRequest):
    session_id = request.session_id
    if session_id not in conversation_store:
        raise HTTPException(status_code=400, detail="Invalid session_id or session expired.")

    previous_context = get_conversation_history(session_id, conversation_store)
    full_query = f"Previous conversation:\n{previous_context}\n\nNew Question: {request.query}"
    response_text = qa_chain.invoke(full_query)
    response_text = response_text["result"]
    docs = retriever.get_relevant_documents(request.query)
    sources = [SourceInfo(source=doc.metadata.get("source", "Unknown"), title=doc.metadata.get("title", "")) for doc in docs]

    conversation_store[session_id].append({"query": request.query, "response": response_text})

    return QuestionResponse(response=response_text, sources=sources, session_id=session_id)
