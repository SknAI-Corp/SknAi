# 🧠 SknAI - LLM Chat Service

This is the **standalone AI module** for the SknAI platform. It delivers medical-grade, personalized, and context-aware responses to user queries about skin conditions — powered by **Mistral LLM**, **BioBERT embeddings**, and **Pinecone vector search**.

It is designed as a **microservice** that integrates seamlessly with a Node.js backend or any API consumer.

---

## 🚀 Features

- ✅ Mistral LLM chatbot fine-tuned for dermatology
- ✅ RAG (Retrieval-Augmented Generation) using Pinecone
- ✅ BioBERT embeddings optimized for medical language
- ✅ Clean FastAPI endpoints (`/chat_llm`, `/embed_pdf`)
- ✅ CLI tools for embedding PDFs and local testing
- ✅ Zero MongoDB / zero backend bloat – AI-only
- ✅ Easily dockerizable and cloud-deployable

---

## 🗂 Project Structure

```
llm_chat_service/
├── app.py
├── config.py
├── chat/
│   └── chain.py
├── embeddings/
│   ├── embedder.py
│   └── model_loader.py
├── ingest/
│   ├── pdf_utils.py
│   └── pinecone_ops.py
├── pipelines/
│   ├── embed_pdf.py
│   └── interactive_chat.py
├── requirements.txt
└── README.md
```

---

## 🔐 .env File Example

```env
MISTRAL_API_KEY=your-mistral-api-key
LLM_MODEL_NAME=mistral-large-latest
LLM_TEMPERATURE=0.4
RETRIEVAL_TOP_K=15

PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=sknai
PINECONE_REGION=us-east-1
PINECONE_ENVIRONMENT=aws
EMBEDDING_DIM=768
```

---

## 🔧 Setup & Run

```bash
cd llm_chat_service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8081
```

---

## 📡 API Endpoints

### `POST /chat_llm`

```json
{
  "query": "What causes eczema?",
  "disease_context": "eczema"
}
```

### `POST /embed_pdf`

Upload PDF (form field: `file`)

---

## 🧪 CLI Tools

```bash
python pipelines/embed_pdf.py your.pdf
python pipelines/interactive_chat.py
```

---

## 🧠 AI Stack

- Mistral LLM via LangChain
- BioBERT for medical embeddings
- Pinecone for vector storage
- FastAPI for microservice API