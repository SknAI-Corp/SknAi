import os
import uuid
import logging
import time
from functools import lru_cache
from typing import Dict, Any, Optional

from fastapi import APIRouter, HTTPException, FastAPI
from pydantic import BaseModel

from motor.motor_asyncio import AsyncIOMotorClient
import httpx


from ingest.pinecone_ops import initialize_pinecone
from embeddings.model_loader import load_biobert_model
from embeddings.embedder import embed_text

# LangChain Components
from langchain_mistralai import ChatMistralAI
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.memory import ConversationSummaryBufferMemory
from langchain.memory.chat_message_histories import MongoDBChatMessageHistory
from langchain_community.vectorstores import Pinecone
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "SknAi")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION", "messages")
MISTRAL_MODEL = os.getenv("LLM_MODEL_NAME")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

tokenizer, model = load_biobert_model()
pinecone_index = initialize_pinecone()
vector_store = Pinecone(index=pinecone_index, embedding=embed_text, text_key="text")

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Chat API")
router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    user_id: str
    user_message: str

class ChatResponse(BaseModel):
    response: str
    session_id: str
    processing_time: Optional[float] = None

@lru_cache()
def get_llm():
    logger.info(f"Initializing Mistral LLM with model {MISTRAL_MODEL}")
    return ChatMistralAI(
        model=MISTRAL_MODEL, 
        temperature=LLM_TEMPERATURE,
        mistral_api_key=MISTRAL_API_KEY
    )

@lru_cache()
def get_message_history(user_id: str, session_id: str):
    combined_key = f"{user_id}:{session_id}"
    logger.debug(f"Getting message history for {combined_key}")
    return MongoDBChatMessageHistory(
        connection_string=MONGO_URI,
        session_id=session_id,
        database_name=DB_NAME,
        collection_name=COLLECTION_NAME
    )

def get_memory(user_id: str, session_id: str):
    persistent_memory = get_message_history(user_id, session_id)
    
    memory = ConversationSummaryBufferMemory(
        llm=get_llm(),
        chat_memory=persistent_memory,
        return_messages=True
    )
    return memory

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    logger.info(f"Request {request_id}: User {request.user_id} sent message in session {request.session_id}")
    
    if not request.user_message:
        raise HTTPException(status_code=400, detail="Missing user message")
    
    try:
        memory = get_memory(request.user_id, request.session_id)
        retriever = vector_store.as_retriever()

        # Contextualize question prompt
        contextualize_q_system_prompt = (
            "Given a chat history and the latest user question, "
            "which might reference context in the chat history, "
            "formulate a standalone question that can be understood "
            "without the chat history. Do NOT answer the question, just "
            "reformulate it if needed and otherwise return it as is."
        )
        contextualize_q_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", contextualize_q_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )

        history_aware_retriever = create_history_aware_retriever(
            get_llm(), retriever, contextualize_q_prompt
        )

        # Answer question prompt
        qa_system_prompt = (
            "You are an assistant for question-answering tasks. Use "
            "the following retrieved context to answer the question. "
            "If you don't know the answer, just say that you don't know. "
            "Keep the answer concise."
            "Context: {context}"
        )
        
        qa_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", qa_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "Question: {input}"),
            ]
        )

        question_answer_chain = create_stuff_documents_chain(get_llm(), qa_prompt)
        rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

        # Get the current chat history from memory
        chat_history = memory.chat_memory.messages
        
        # Execute the chain
        response = await rag_chain.ainvoke({
            "input": request.user_message,
            "chat_history": chat_history
        })
        
        # Extract the answer from the response
        ai_response = response["answer"]
        
        # Add the user message and AI response to memory
        memory.chat_memory.add_user_message(request.user_message)
        memory.chat_memory.add_ai_message(ai_response)

        # Measure processing time
        processing_time = time.time() - start_time
        logger.info(f"Request {request_id}: Processed in {processing_time:.2f}s")

        # Return the response in the expected format
        return ChatResponse(
            response=ai_response,
            session_id=request.session_id,
            processing_time=processing_time
        )
        
    except httpx.TimeoutException:
        logger.error(f"Request {request_id}: Mistral API timeout")
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"Request {request_id}: Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")
    
app.include_router(router)








