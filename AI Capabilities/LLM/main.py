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
from typing import List
from functools import lru_cache
import logging
import numpy as np
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="SknAI Chatbot API")

# Pydantic models for request/response
class QuestionRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=1000, description="The question to ask the AI")

class SourceInfo(BaseModel):
    source: str
    title: str = ""

class QuestionResponse(BaseModel):
    response: str
    sources: List[SourceInfo]

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

@app.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    try:
        # Log the incoming query
        logger.info(f"Received question: {request.query}")
        
        # Check if services are initialized
        if qa_chain is None:
            logger.warning("Services not initialized, attempting to initialize now")
            init_services()
            
        # Process the query to get the response
        response_text = qa_chain.invoke(request.query)
        
        # Retrieve documents separately for source information
        docs = retriever.get_relevant_documents(request.query)
        
        # Format the sources
        sources = []
        for doc in docs:
            source_info = SourceInfo(
                source=doc.metadata.get("source", "Unknown"),
                title=doc.metadata.get("title", "")
            )
            sources.append(source_info)
        
        # Return the structured response
        return QuestionResponse(
            response=response_text,
            sources=sources
        )

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing your request: {str(e)}")

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