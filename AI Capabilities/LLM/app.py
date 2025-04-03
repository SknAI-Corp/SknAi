import os
import uuid
import logging
import time
from functools import lru_cache
from typing import Dict, Any, Optional, List

from fastapi import APIRouter, HTTPException, FastAPI
from pydantic import BaseModel, Field

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
    user_message: Optional[str] = None
    predicted_disease: Optional[str] = None

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

def create_disease_only_prompt(disease: str) -> str:
    """Generate a comprehensive query about a disease when only disease is provided."""
    return f"""Provide comprehensive information about {disease} covering the following aspects:
1. Brief overview and definition
2. Common symptoms and their progression
3. Causes and risk factors
4. Diagnostic methods
5. Standard treatment approaches
6. Prevention strategies
7. When to seek medical attention
8. Long-term management

Format the information in an easy-to-understand way using simple language. Focus on medically accurate information while being empathetic and reassuring where appropriate."""

def determine_query_type(request: ChatRequest) -> str:
    """Determine which type of query we're handling."""
    if request.predicted_disease and not request.user_message:
        return "disease_only"
    elif request.user_message and not request.predicted_disease:
        return "query_only"
    elif request.user_message and request.predicted_disease:
        return "combined"
    else:
        return "invalid"

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    logger.info(f"Request {request_id}: User {request.user_id} sent message in session {request.session_id}")
    
    query_type = determine_query_type(request)
    
    if query_type == "invalid":
        raise HTTPException(status_code=400, detail="Either user_message or predicted_disease must be provided")
    
    try:
        memory = get_memory(request.user_id, request.session_id)
        chat_history = memory.chat_memory.messages
        
        # Case 1: Only predicted disease is provided
        if query_type == "disease_only":
            # Create a comprehensive query about the disease
            effective_query = create_disease_only_prompt(request.predicted_disease)
            
            # Create a specialized system prompt for disease information
            system_prompt = f"""You are a medical assistant providing information about medical conditions. 
            You have been asked to provide information about {request.predicted_disease}.
            
            Provide accurate, comprehensive information about this condition in a structured format.
            Be informative but also compassionate and reassuring where appropriate.
            Emphasize the importance of consulting healthcare professionals for proper diagnosis and treatment.
            Avoid technical jargon when simpler terms can be used, but maintain medical accuracy.
            
            If you don't have sufficient information about this specific condition, acknowledge the limitations
            and suggest general approaches for seeking medical guidance."""
            
        # Case 2: Only user query is provided
        elif query_type == "query_only":
            effective_query = request.user_message
            
            # Contextualize question prompt to handle conversation history
            contextualize_q_system_prompt = """Given a chat history and the latest user question,
            which might reference context in the chat history, formulate a standalone question that can be understood
            without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is."""
            
            contextualize_q_prompt = ChatPromptTemplate.from_messages([
                ("system", contextualize_q_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ])
            
            system_prompt = """You are a medical assistant for question-answering tasks. Use
            the following retrieved context to answer the question.
            If you don't know the answer, just say that you don't know and suggest consulting a healthcare professional.
            Keep the answer informative but easy to understand.
            
            Context: {context}"""
            
        # Case 3: Both user query and predicted disease are provided
        else:  # combined
            effective_query = request.user_message
            
            # Contextualize question with disease context
            contextualize_q_system_prompt = f"""Given a chat history and the latest user question,
            which might reference context in the chat history, formulate a standalone question that can be understood
            without the chat history. The question may be related to {request.predicted_disease}.
            Do NOT answer the question, just reformulate it if needed and otherwise return it as is."""
            
            contextualize_q_prompt = ChatPromptTemplate.from_messages([
                ("system", contextualize_q_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ])
            
            system_prompt = f"""You are a medical assistant for question-answering tasks. Use
            the following retrieved context to answer the question. The user's question may be related to
            {request.predicted_disease}, so consider this condition as you formulate your response.
            
            If you don't know the answer, just say that you don't know and suggest consulting a healthcare professional.
            Keep the answer informative but easy to understand.
            
            Context: {{context}}"""
        
        # Set up retriever with appropriate context
        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        
        # Only use history-aware retriever for query_only and combined cases
        if query_type != "disease_only":
            contextualize_q_prompt = ChatPromptTemplate.from_messages([
                ("system", contextualize_q_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ])
            
            history_aware_retriever = create_history_aware_retriever(
                get_llm(), retriever, contextualize_q_prompt
            )
            retriever_to_use = history_aware_retriever
        else:
            # For disease-only, we don't need the history-aware component
            retriever_to_use = retriever
        
        # Create the QA prompt
        qa_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "Question: {input}"),
        ])
        
        # Create the QA chain
        question_answer_chain = create_stuff_documents_chain(get_llm(), qa_prompt)
        rag_chain = create_retrieval_chain(retriever_to_use, question_answer_chain)
        
        # Execute the chain
        response = await rag_chain.ainvoke({
            "input": effective_query,
            "chat_history": chat_history if query_type != "disease_only" else []
        })
        
        # Extract the answer from the response
        ai_response = response["answer"]
        
        # Add the interaction to memory, except for disease-only queries
        if query_type != "disease_only":
            memory.chat_memory.add_user_message(request.user_message)
            memory.chat_memory.add_ai_message(ai_response)
        else:
            # For disease-only queries, we might want to add context about what disease info was provided
            memory.chat_memory.add_user_message(f"Please tell me about {request.predicted_disease}")
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