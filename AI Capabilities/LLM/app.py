# import os
# import uuid
# import logging
# import time
# from functools import lru_cache
# from typing import Optional

# from fastapi import APIRouter, HTTPException, FastAPI
# from pydantic import BaseModel

# from motor.motor_asyncio import AsyncIOMotorClient
# import httpx
# from bson import ObjectId

# # LangChain Components
# from langchain_mistralai import ChatMistralAI
# from langchain.chains import create_history_aware_retriever, create_retrieval_chain
# from langchain.memory import ConversationSummaryBufferMemory
# from langchain.memory.chat_message_histories import RedisChatMessageHistory
# from langchain.chains.combine_documents import create_stuff_documents_chain
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain_community.vectorstores import Pinecone
# from langchain_core.runnables import RunnableLambda

# # Custom modules
# from ingest.pinecone_ops import initialize_pinecone
# from embeddings.model_loader import load_biobert_model
# from embeddings.embedder import embed_text

# # Load environment variables
# from dotenv import load_dotenv
# load_dotenv()

# # Configuration
# MONGO_URI = os.getenv("MONGO_URI")
# DB_NAME = os.getenv("MONGO_DB_NAME", "sknai")
# COLLECTION_NAME = os.getenv("MONGO_COLLECTION", "messages")
# MISTRAL_MODEL = os.getenv("LLM_MODEL_NAME")
# LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.5"))
# MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# # Logging
# logging.basicConfig(level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
#                     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # Initialize FastAPI and MongoDB
# app = FastAPI(title="AI Chat API")
# router = APIRouter()
# mongo_client = AsyncIOMotorClient(MONGO_URI)
# mongo_db = mongo_client[DB_NAME]
# log_collection = mongo_db[COLLECTION_NAME]

# # Load embedding model and vector store
# tokenizer, model = load_biobert_model()
# pinecone_index = initialize_pinecone()
# vector_store = Pinecone(index=pinecone_index, embedding=embed_text, text_key="text")

# # ---------------------- Models ---------------------- #
# class ChatRequest(BaseModel):
#     session_id: str
#     user_message: Optional[str] = None
#     predicted_disease: Optional[str] = None

# class ChatResponse(BaseModel):
#     response: str
#     session_id: str
#     processing_time: Optional[float] = None

# # ---------------------- Utils ---------------------- #
# @lru_cache()
# def get_llm():
#     logger.info(f"Initializing Mistral LLM with model {MISTRAL_MODEL}")
#     return ChatMistralAI(model=MISTRAL_MODEL, temperature=LLM_TEMPERATURE, mistral_api_key=MISTRAL_API_KEY)

# def get_message_history(session_id: str):
#     redis_url = f"redis://{os.getenv('REDIS_USERNAME')}:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_HOST')}:{os.getenv('REDIS_PORT')}"
#     return RedisChatMessageHistory(url=redis_url, session_id=session_id)

# def get_memory(session_id: str):
#     redis_memory = get_message_history(session_id)
#     return ConversationSummaryBufferMemory(llm=get_llm(), chat_memory=redis_memory, return_messages=True)

# async def rehydrate_memory_from_mongo(memory, session_id: str):
#     if len(memory.chat_memory.messages) > 0:
#         return

#     try:
#         past_messages = await log_collection.find({"sessionId": ObjectId(session_id)}).sort("timestamp", 1).to_list(length=100)
#         logger.info(f"[MongoDB] Rehydrating memory for session {session_id} with {len(past_messages)} messages")

#         for msg in past_messages:
#             sender = msg.get("sender", "unknown")
#             content = msg.get("content", "")
#             logger.info(f"[MongoDB] {sender}: {content}")
#             if sender == "user":
#                 memory.chat_memory.add_user_message(content)
#             elif sender == "ai":
#                 memory.chat_memory.add_ai_message(content)
#     except Exception as e:
#         logger.error(f"[MongoDB] Rehydration error for session {session_id}: {str(e)}")

# def create_disease_only_prompt(disease: str) -> str:
#     return f"""Provide comprehensive information about {disease} covering:
# 1. Overview
# 2. Symptoms
# 3. Causes
# 4. Diagnosis
# 5. Treatment
# 6. Prevention
# 7. When to seek help
# 8. Long-term care
# """
# def log_and_invoke(chain, inputs):
#     logger.info("📤 Final input to LLM:")
#     for key, value in inputs.items():
#         if key == "chat_history":
#             logger.info(f"{key}: {[msg.content for msg in value]}")
#         else:
#             logger.info(f"{key}: {value}")
#     return chain.invoke(inputs)

# def determine_query_type(request: ChatRequest) -> str:
#     if request.predicted_disease and not request.user_message:
#         return "disease_only"
#     elif request.user_message and not request.predicted_disease:
#         return "query_only"
#     elif request.user_message and request.predicted_disease:
#         return "combined"
#     return "invalid"

# # ---------------------- Main Chat Endpoint ---------------------- #
# @router.post("/chat", response_model=ChatResponse)
# async def chat_with_ai(request: ChatRequest):
#     request_id = str(uuid.uuid4())
#     start_time = time.time()
#     logger.info(f"Request {request_id}: Session {request.session_id} started")

#     query_type = determine_query_type(request)
#     if query_type == "invalid":
#         raise HTTPException(status_code=400, detail="Either user_message or predicted_disease must be provided")

#     try:
#         memory = get_memory(request.session_id)
#         await rehydrate_memory_from_mongo(memory, request.session_id)
#         chat_history = memory.chat_memory.messages

#         # Prompt setup
#         if query_type == "disease_only":
#             effective_query = create_disease_only_prompt(request.predicted_disease)
#             system_prompt = f"""You are a medical assistant. Provide details on {request.predicted_disease}.
# Context: {{context}}"""
#         elif query_type == "query_only":
#             effective_query = request.user_message
#             system_prompt = """You are a medical assistant. Use the context to answer.
# Context: {context}"""
#         else:
#             effective_query = request.user_message
#             system_prompt = f"""You are a medical assistant. Disease detected: {request.predicted_disease}.
# Context: {{context}}"""

#         # Retriever
#         retriever = vector_store.as_retriever(search_kwargs={"k": 5})
#         if query_type != "disease_only":
#             contextualize_prompt = ChatPromptTemplate.from_messages([
#                 ("system", "Contextualize the user query."),
#                 MessagesPlaceholder("chat_history"),
#                 ("human", "{input}"),
#             ])
#             retriever_to_use = create_history_aware_retriever(get_llm(), retriever, contextualize_prompt)
#         else:
#             retriever_to_use = retriever

#         # RAG QA Prompt
#         qa_prompt = ChatPromptTemplate.from_messages([
#             ("system", system_prompt),
#             MessagesPlaceholder("chat_history"),
#             ("human", "Question: {input}"),
#         ])

#         rag_chain = create_retrieval_chain(retriever_to_use, create_stuff_documents_chain(get_llm(), qa_prompt))
        
#         response = await rag_chain.ainvoke({
#             "input": effective_query,
#             "chat_history": chat_history if query_type != "disease_only" else []
#         })

#         ai_response = response["answer"]

#         if query_type != "disease_only":
#             memory.chat_memory.add_user_message(request.user_message)
#             memory.chat_memory.add_ai_message(ai_response)
#         else:
#             memory.chat_memory.add_user_message(f"Please tell me about {request.predicted_disease}")
#             memory.chat_memory.add_ai_message(ai_response)

#         processing_time = time.time() - start_time
#         logger.info(f"Request {request_id} processed in {processing_time:.2f}s")

#         return ChatResponse(response=ai_response, session_id=request.session_id, processing_time=processing_time)

#     except httpx.TimeoutException:
#         logger.error(f"Request {request_id}: Mistral API timeout")
#         raise HTTPException(status_code=504, detail="AI service timeout")
#     except Exception as e:
#         logger.error(f"Request {request_id}: Error: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

# # ---------------------- Debug Endpoints ---------------------- #
# from redis import Redis

# @router.delete("/debug/clear-session/{session_id}")
# async def clear_redis_session(session_id: str):
#     try:
#         redis_url = f"redis://{os.getenv('REDIS_USERNAME')}:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_HOST')}:{os.getenv('REDIS_PORT')}"
#         redis_conn = Redis.from_url(redis_url, decode_responses=True)
#         keys_deleted = redis_conn.delete(f"memory:{session_id}")
#         return {"status": "success", "deleted_keys": keys_deleted}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}

# @router.post("/end-session/{session_id}")
# async def end_session(session_id: str):
#     try:
#         redis_url = f"redis://{os.getenv('REDIS_USERNAME')}:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_HOST')}:{os.getenv('REDIS_PORT')}"
#         redis_conn = Redis.from_url(redis_url, decode_responses=True)
#         redis_conn.delete(f"message_store:{session_id}")
#         return {"status": "success", "message": f"Session {session_id} ended and memory cleared."}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}

# # Register router
# app.include_router(router)


import os
import uuid
import logging
import time
from functools import lru_cache
from typing import Optional

from fastapi import APIRouter, HTTPException, FastAPI
from pydantic import BaseModel

from motor.motor_asyncio import AsyncIOMotorClient
import httpx
from bson import ObjectId

# LangChain Components
from langchain_mistralai import ChatMistralAI
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.memory import ConversationSummaryBufferMemory
from langchain.memory.chat_message_histories import RedisChatMessageHistory
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.vectorstores import Pinecone
from langchain_core.runnables import RunnableLambda

# Custom modules
from ingest.pinecone_ops import initialize_pinecone
from embeddings.model_loader import load_biobert_model
from embeddings.embedder import embed_text

# Load environment variables
from dotenv import load_dotenv
load_dotenv()
    
# Configuration
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "sknai")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION", "messages")
MISTRAL_MODEL = os.getenv("LLM_MODEL_NAME")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.5"))
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Logging
logging.basicConfig(level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI and MongoDB
app = FastAPI(title="AI Chat API")
router = APIRouter()
mongo_client = AsyncIOMotorClient(MONGO_URI)
mongo_db = mongo_client[DB_NAME]
log_collection = mongo_db[COLLECTION_NAME]

# Load embedding model and vector store
tokenizer, model = load_biobert_model()
pinecone_index = initialize_pinecone()
vector_store = Pinecone(index=pinecone_index, embedding=embed_text, text_key="text")

# ---------------------- Models ---------------------- #
class ChatRequest(BaseModel):
    session_id: str
    user_message: Optional[str] = None
    predicted_disease: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    processing_time: Optional[float] = None

# ---------------------- Utils ---------------------- #
# @lru_cache()
# def get_llm():
#     logger.info(f"Initializing Mistral LLM with model {MISTRAL_MODEL}")
#     return ChatMistralAI(model=MISTRAL_MODEL, temperature=LLM_TEMPERATURE, mistral_api_key=MISTRAL_API_KEY)


from langchain.chat_models import ChatOpenAI
@lru_cache()
def get_llm():
<<<<<<< Updated upstream
    logger.info(f"Initializing ChatGPT LLM ")
    return ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=os.getenv("OPENAI_API_KEY"))
=======
    logger.info(f"Initializing Mistral LLM with model {MISTRAL_MODEL}")
    return ChatMistralAI(model=MISTRAL_MODEL, temperature=LLM_TEMPERATURE, mistral_api_key=MISTRAL_API_KEY)


# from langchain.chat_models import ChatOpenAI
# @lru_cache()
# def get_llm():
#     logger.info(f"Initializing ChatGPT LLM ")
#     return ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=os.getenv("OPENAI_API_KEY"))
>>>>>>> Stashed changes
def get_message_history(session_id: str):
    redis_url = f"redis://{os.getenv('REDIS_USERNAME')}:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_HOST')}:{os.getenv('REDIS_PORT')}"
    return RedisChatMessageHistory(url=redis_url, session_id=session_id)

def get_memory(session_id: str):
    redis_memory = get_message_history(session_id)
    return ConversationSummaryBufferMemory(llm=get_llm(), chat_memory=redis_memory, return_messages=True)

async def rehydrate_memory_from_mongo(memory, session_id: str):
    if len(memory.chat_memory.messages) > 0:
        return

    try:
        past_messages = await log_collection.find({"sessionId": ObjectId(session_id)}).sort("timestamp", 1).to_list(length=100)
        logger.info(f"[MongoDB] Rehydrating memory for session {session_id} with {len(past_messages)} messages")

        for msg in past_messages:
            sender = msg.get("sender", "unknown")
            content = msg.get("content", "")
            logger.info(f"[MongoDB] {sender}: {content}")
            if sender == "user":
                memory.chat_memory.add_user_message(content)
            elif sender == "ai":
                memory.chat_memory.add_ai_message(content)
    except Exception as e:
        logger.error(f"[MongoDB] Rehydration error for session {session_id}: {str(e)}")

def create_disease_only_prompt(disease: str) -> str:
   return f"""You are an AI Dermatology Assistant. A user uploaded an image which our system identified as possibly showing signs of **{disease}**.

Provide a medically-informed yet easy-to-understand summary covering:
1. Overview of {disease}
2. Common Symptoms
3. Likely Causes
4. How it's Diagnosed
5. Treatment Options
6. Prevention Tips
7. When to Seek a Dermatologist
8. Long-term Care Advice

Be concise, reliable, and use plain language suitable for a non-medical audience. Use Bullet points for clarity.
"""
def log_and_invoke(chain, inputs):
    logger.info("📤 Final input to LLM:")
    for key, value in inputs.items():
        if key == "chat_history":
            logger.info(f"{key}: {[msg.content for msg in value]}")
        else:
            logger.info(f"{key}: {value}")
    return chain.invoke(inputs)

def determine_query_type(request: ChatRequest) -> str:
    if request.predicted_disease and not request.user_message:
        return "disease_only"
    elif request.user_message and not request.predicted_disease:
        return "query_only"
    elif request.user_message and request.predicted_disease:
        return "combined"
    return "invalid"

# ---------------------- Main Chat Endpoint ---------------------- #
@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    logger.info(f"Request {request_id}: Session {request.session_id} started")

    query_type = determine_query_type(request)
    if query_type == "invalid":
        raise HTTPException(status_code=400, detail="Either user_message or predicted_disease must be provided")

    try:
        memory = get_memory(request.session_id)
        await rehydrate_memory_from_mongo(memory, request.session_id)
        chat_history = memory.chat_memory.messages

        # Prompt setup
        if query_type == "disease_only":
            effective_query = create_disease_only_prompt(request.predicted_disease)
            system_prompt = f"""You are a medical assistant. Provide details on {request.predicted_disease}.
Context: {{context}}"""
        elif query_type == "query_only":
            effective_query = request.user_message
            system_prompt = """You are an AI Dermatology Assistant. A user has asked a skin-related question. Use verified dermatology knowledge only to provide your answer.

            Always stay within dermatology. Do not discuss unrelated topics. Use bullet points for clarity.

            Context: {context}"""
        else:
            effective_query = request.user_message
            system_prompt = f"""You are an AI Dermatology Assistant. A user uploaded an image, and the system predicted the condition might be **{request.predicted_disease}**. They also asked a follow-up question.

            Use the predicted condition as context and combine it with their query to give a personalized, helpful answer.

            Only rely on medically approved dermatological information. Avoid speculation. Use Bullet points for clarity.

            Context: {{context}}"""


        # Retriever
        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        if query_type != "disease_only":
            contextualize_prompt = ChatPromptTemplate.from_messages([
                ("system", "Contextualize the user query."),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ])
            retriever_to_use = create_history_aware_retriever(get_llm(), retriever, contextualize_prompt)
        else:
            retriever_to_use = retriever

        # RAG QA Prompt
        qa_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "Question: {input}"),
        ])

        rag_chain = create_retrieval_chain(retriever_to_use, create_stuff_documents_chain(get_llm(), qa_prompt))
        
        response = await rag_chain.ainvoke({
            "input": effective_query,
            "chat_history": chat_history if query_type != "disease_only" else []
        })

        ai_response = response["answer"]

        if query_type != "disease_only":
            memory.chat_memory.add_user_message(request.user_message)
            memory.chat_memory.add_ai_message(ai_response)
        else:
            memory.chat_memory.add_user_message(f"Please tell me about {request.predicted_disease}")
            memory.chat_memory.add_ai_message(ai_response)

        processing_time = time.time() - start_time
        logger.info(f"Request {request_id} processed in {processing_time:.2f}s")

        return ChatResponse(response=ai_response, session_id=request.session_id, processing_time=processing_time)

    except httpx.TimeoutException:
        logger.error(f"Request {request_id}: Mistral API timeout")
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"Request {request_id}: Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

# ---------------------- Debug Endpoints ---------------------- #
from redis import Redis

@router.delete("/debug/clear-session/{session_id}")
async def clear_redis_session(session_id: str):
    try:
        redis_url = f"redis://{os.getenv('REDIS_USERNAME')}:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_HOST')}:{os.getenv('REDIS_PORT')}"
        redis_conn = Redis.from_url(redis_url, decode_responses=True)
        keys_deleted = redis_conn.delete(f"memory:{session_id}")
        return {"status": "success", "deleted_keys": keys_deleted}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/end-session/{session_id}")
async def end_session(session_id: str):
    try:
        redis_url = f"redis://{os.getenv('REDIS_USERNAME')}:{os.getenv('REDIS_PASSWORD')}@{os.getenv('REDIS_HOST')}:{os.getenv('REDIS_PORT')}"
        redis_conn = Redis.from_url(redis_url, decode_responses=True)
        redis_conn.delete(f"message_store:{session_id}")
        return {"status": "success", "message": f"Session {session_id} ended and memory cleared."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/debug/test-retrieval")
async def test_retrieval(request: ChatRequest):
    # Run with retrieval
    response_with_retrieval = await chat_with_ai(request)
    
    # Run without retrieval by creating a direct prompt to the LLM
    llm = get_llm()
    direct_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a medical assistant."),
        ("human", request.user_message)
    ])
    
    # Use the LLM to generate a response without retrieval
    chain = direct_prompt | llm
    response_without_retrieval = await chain.ainvoke({"input": request.user_message})
    
    return {
        "with_retrieval": response_with_retrieval.response,
        "without_retrieval": response_without_retrieval.content,
        "comparison": "Different" if response_with_retrieval.response != response_without_retrieval.content else "Same"
    }
    
# Register router
app.include_router(router)