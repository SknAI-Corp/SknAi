from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from langchain.vectorstores import Pinecone
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import pinecone
import os
import torch
from transformers import AutoModel, AutoTokenizer
from functools import lru_cache
import logging
import uuid
import numpy as np
from dotenv import load_dotenv
from typing import List, Dict, Optional
# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Dictionary to store conversation history - Temperory measure, will be replaced by a database
conversation_store: Dict[str, List[Dict[str,str]]] = {}


# Initialize FastAPI app
app = FastAPI(title="SknAI Chatbot API")

# Define request models
class FirstQuestionRequest(BaseModel):
    predicted_disease: str  # Only the disease name, no user query

class FollowUpQuestionRequest(BaseModel):
    session_id: str
    query: str = Field(..., min_length=3, max_length=1000)

# Define response models
class SourceInfo(BaseModel):
    source: str
    title: str = ""

class QuestionResponse(BaseModel):
    response: str
    sources: List[SourceInfo]
    session_id: str


# Pydantic models for request/response
class QuestionRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=1000, description="The question to ask the AI")


# Function to get conversation history
def get_conversation_history(session_id: str) -> str:
    """Retrieve formatted conversation history for LLM input."""
    history = conversation_store.get(session_id, [])
    formatted_history = "\n\n".join(
        f"User: {entry['query']}\nAI: {entry['response']}" for entry in history
    )
    return formatted_history

# Load environment variables safely
def get_env_variable(name: str) -> str:
    value = os.getenv(name)
    if value is None:
        raise ValueError(f"Environment variable {name} is not set")
    return value
# Initialize FastAPI app
# Initialize FastAPI app
# Singleton pattern for model loading
@lru_cache(maxsize=1)
def get_biobert_model():
    logger.info("Loading BioBERT model...")
    tokenizer = AutoTokenizer.from_pretrained("monologg/biobert_v1.1_pubmed")
    model = AutoModel.from_pretrained("monologg/biobert_v1.1_pubmed")
    return tokenizer, model

# Generate embeddings with proper normalization
def embed_text(text):
    """Generate normalized BioBERT embeddings for a given text."""
    tokenizer, model = get_biobert_model()
    
    # Ensure model is in evaluation mode
    model.eval()
    
    # Preprocess text
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    
    # Generate embeddings
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get the embeddings from the last hidden state's CLS token
    embeddings = outputs.last_hidden_state[:, 0, :].squeeze().numpy()
    
    # Normalize the embeddings (L2 normalization)
    norm = np.linalg.norm(embeddings)
    if norm > 0:
        normalized_embeddings = embeddings / norm
    else:
        normalized_embeddings = embeddings
        
    return normalized_embeddings.tolist()

# Format retrieved documents for the prompt
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Global variables for services
vector_store = None
qa_chain = None
retriever = None

# Initialize services at startup
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing services...")
    
    try:
        # Load models early
        get_biobert_model()
        
        # Initialize Pinecone and other global services
        init_services()
        logger.info("Application startup completed successfully")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        # Don't raise here to allow the app to start even with errors

# Service initialization
def init_services():
    global vector_store, qa_chain, retriever
    
    try:
        # Get API keys -
        pinecone_api_key = get_env_variable("PINECONE_API_KEY")
        mistral_api_key = get_env_variable("MISTRAL_API_KEY")
        
        logger.info("Initializing Pinecone client...")
        pc = pinecone.Pinecone(api_key=pinecone_api_key)
        
        # Get index name from environment or use default
        index_name = os.getenv("PINECONE_INDEX_NAME", "sknai")
        logger.info(f"Using Pinecone index: {index_name}")
        
        # Initialize vector store
        logger.info("Setting up vector store...")
        vector_store = Pinecone(
            index=pc.Index(index_name),
            embedding=embed_text,
            text_key="text"
        )
        
        # Setup retriever
        retriever = vector_store.as_retriever(search_kwargs={"k": 3})
        
        # Initialize Mistral AI model
        logger.info("Initializing Mistral AI model...")
        llm = ChatMistralAI(
            model="mistral-large-latest",
            temperature=0.4,
            api_key=mistral_api_key,
            max_retries=2
        )
        
        # Setup prompt using the LCEL pattern (LangChain Expression Language)
        template = """Answer the question based on the following context and your knowledge. 
        Use simple terms, explaining as if to a patient. If you don't know, say you don't know.
        
        Context:
        {context}
        
        Question:
        {question}
        """
        
        prompt = ChatPromptTemplate.from_template(template)
        
        # Create the modern LCEL-style chain
        qa_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        logger.info("Services initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing services: {str(e)}")
        raise RuntimeError(f"Failed to initialize services: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to the SknAI chatbot API!", "status": "healthy"}

@app.post("/ask/first", response_model=QuestionResponse)
async def ask_first_question(request: FirstQuestionRequest):
    """Handles the first request, generating a summary based on predicted disease."""
    try:
        session_id = str(uuid.uuid4())  # Generate new session ID
        logger.info(f"New session {session_id}: Predicted Disease: {request.predicted_disease}")

        # Retrieve context from Pinecone
        disease_context = retriever.get_relevant_documents(request.predicted_disease)
        formatted_context = "\n\n".join(doc.page_content for doc in disease_context)

        # Prepare system prompt
        
        system_prompt = f"""
You are a virtual doctor providing guidance to a patient. Based on the predicted disease "{request.predicted_disease}",  
explain the condition in a clear and professional manner, just as a doctor would during a consultation.  
Ensure the response is **informative, empathetic, and reassuring**, while still being easy to understand.  

Cover the following details:  
- **What it is** – Briefly describe the condition.  
- **Common symptoms** – Mention the usual signs patients experience.  
- **Causes** – Explain why this condition may occur.  
- **Treatments** – Outline general treatment options, including medications, lifestyle changes, and when to seek professional care.  

Use a **calm, professional, and reassuring tone**, making the patient feel supported.  
However, at the end of your response, **clearly state that you are an AI and not a real doctor**, advising the patient to consult a healthcare professional for a proper diagnosis and treatment.  

---

**Disclaimer:** "I am an AI medical assistant, not a licensed doctor. While I strive to provide accurate and helpful information, please consult a qualified healthcare professional for a proper diagnosis and treatment plan."
"""

        # Generate response
        response_text = qa_chain.invoke(system_prompt)

        # Store conversation history
        conversation_store[session_id] = [{"query": f"Info on {request.predicted_disease}", "response": response_text}]

        # Extract sources
        sources = [SourceInfo(source=doc.metadata.get("source", "Unknown"), title=doc.metadata.get("title", "")) for doc in disease_context]

        return QuestionResponse(response=response_text, sources=sources, session_id=session_id)

    except Exception as e:
        logger.error(f"Error processing first request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing your request: {str(e)}")


@app.post("/ask/followup", response_model=QuestionResponse)
async def ask_followup_question(request: FollowUpQuestionRequest):
    """Handles follow-up user questions with stored session context."""
    try:
        session_id = request.session_id
        if session_id not in conversation_store:
            raise HTTPException(status_code=400, detail="Invalid session_id or session expired.")

        logger.info(f"Session {session_id}: Follow-up question: {request.query}")

        # Retrieve previous chat history
        previous_context = get_conversation_history(session_id)

        # Construct new query with history
        full_query = f"Previous conversation:\n{previous_context}\n\nNew Question: {request.query}"

        # Generate response
        response_text = qa_chain.invoke(full_query)

        # Retrieve source documents
        docs = retriever.get_relevant_documents(request.query)
        sources = [SourceInfo(source=doc.metadata.get("source", "Unknown"), title=doc.metadata.get("title", "")) for doc in docs]

        # Store query & response in session history
        conversation_store[session_id].append({"query": request.query, "response": response_text})

        return QuestionResponse(response=response_text, sources=sources, session_id=session_id)

    except Exception as e:
        logger.error(f"Error processing follow-up question: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing your request: {str(e)}")


# @app.post("/ask", response_model=QuestionResponse)
# async def ask_question(request: QuestionRequest):
#     try:
#         # Log the incoming query
#         logger.info(f"Received question: {request.query}")
        
#         # Check if services are initialized
#         if qa_chain is None:
#             logger.warning("Services not initialized, attempting to initialize now")
#             init_services()
            
#         # Process the query to get the response
#         response_text = qa_chain.invoke(request.query)
        
#         # Retrieve documents separately for source information
#         docs = retriever.get_relevant_documents(request.query)
        
#         # Format the sources
#         sources = []
#         for doc in docs:
#             source_info = SourceInfo(
#                 source=doc.metadata.get("source", "Unknown"),
#                 title=doc.metadata.get("title", "")
#             )
#             sources.append(source_info)
        
#         # Return the structured response
#         return QuestionResponse(
#             response=response_text,
#             sources=sources
#         )

#     except Exception as e:
#         logger.error(f"Error processing request: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error processing your request: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        # Check if services are initialized
        if qa_chain is None:
            return {"status": "degraded", "message": "Services not fully initialized"}
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)