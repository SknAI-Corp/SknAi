from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn

from config import (
    SERVICE_NAME,
    RETRIEVAL_TOP_K,
)
from ingest.pdf_utils import extract_text_from_pdf, clean_extracted_text, chunk_text
from ingest.pinecone_ops import initialize_pinecone, upload_to_pinecone
from embeddings.model_loader import load_biobert_model
from embeddings.embedder import embed_text
from chat.chain import setup_qa_chain
from langchain_community.vectorstores import Pinecone

# === FastAPI app ===
app = FastAPI(title=SERVICE_NAME)

# === One-time initialization of LLM system ===
tokenizer, model = load_biobert_model()
pinecone_index = initialize_pinecone()
vector_store = Pinecone(index=pinecone_index, embedding=embed_text, text_key="text")
qa_chain = setup_qa_chain(vector_store)


# === Request & Response Schemas ===
class ChatRequest(BaseModel):
    query: str
    disease_context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str


@app.get("/")
def root():
    return {"message": f"{SERVICE_NAME} is running", "status": "healthy"}


@app.post("/chat_llm", response_model=ChatResponse)
async def chat_llm(request: ChatRequest):
    """
    Handles disease-aware chat queries using LangChain + Mistral.
    """
    full_prompt = ""

    # Append RAG context based on disease
    if request.disease_context:
        docs = vector_store.similarity_search(
            query=request.disease_context,
            k=RETRIEVAL_TOP_K
        )
        formatted_context = "\n\n".join(doc.page_content for doc in docs)
        full_prompt += (
            f"You are an AI skin specialist. Based on the uploaded image, "
            f"the most probable disease is **{request.disease_context}**.\n"
            f"Here is some important medical information about this condition:\n\n"
            f"{formatted_context}\n\n"
        )

    # Append user query
    full_prompt += f"User: {request.query}"

    try:
        result = qa_chain.run(full_prompt)
        return ChatResponse(response=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embed_pdf")
async def embed_pdf(file: UploadFile = File(...)):
    """
    Upload and embed a PDF into Pinecone for RAG use.
    """
    try:
        # Save uploaded file temporarily
        pdf_path = f"temp_{file.filename}"
        with open(pdf_path, "wb") as f:
            f.write(await file.read())

        raw_text = extract_text_from_pdf(pdf_path)
        cleaned = clean_extracted_text(raw_text)
        chunks = chunk_text(cleaned)

        upload_to_pinecone(pinecone_index, chunks)

        return {"message": f"Successfully embedded {len(chunks)} chunks from {file.filename}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to embed PDF: {e}")


# Local development entry
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
