# 🧠 SknAI – Dermatology Conversational AI (LLM + RAG)

SknAI is a production-ready, privacy-focused Conversational AI assistant designed for dermatology-related patient queries.  
It uses **RAG (Retrieval-Augmented Generation)** combining:

- 🔍 **Pinecone** for fast vector similarity search  
- 🧬 **BioBERT** for domain-specific text embeddings  
- 🤖 **Mistral LLM** for medically sound and patient-friendly responses  
- ⚡ **LangChain** for robust chaining of context + LLM  
- 🌐 **FastAPI** for scalable and testable APIs  

---

## 📁 Folder Structure

```
LLM_Conversational_AI/
├── src/
│   ├── api/            → FastAPI endpoints & server
│   ├── chat/           → Mistral + LangChain QA setup + CLI loop
│   ├── embeddings/     → BioBERT tokenizer, model, and embedding logic
│   ├── ingest/         → PDF text extraction, chunking, and Pinecone upload
│   └── services/       → Session context, conversation memory
├── pipelines/          → CLI tools for embedding PDFs and chatting with AI
├── config/             → Environment variables
├── requirements.txt    → Python dependencies
├── Dockerfile          → Containerization setup
└── README.md           → Project overview and instructions
```

---

## 🚀 Features

- ✅ Medical-grade embeddings via **BioBERT**
- ✅ Real-time context retrieval with **Pinecone**
- ✅ Private **Mistral LLM** access (API-based)
- ✅ Query-aware prompt formatting for each session
- ✅ Session-based **conversation history**
- ✅ **FastAPI** microservice for UI/chatbot integration
- ✅ Modular and extensible architecture
- ✅ CLI + API interface support
- ✅ Ready to **containerize** and deploy

---

## ⚙️ Setup

### 🐍 1. Environment Setup
```bash
git clone <your-repo>
cd LLM_Conversational_AI
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

### 🔐 2. Environment Variables

Create `config/.env` with your API keys:

```ini
PINECONE_API_KEY=your-pinecone-api-key
MISTRAL_API_KEY=your-mistral-api-key
PINECONE_ENV=us-east1-gcp
PINECONE_INDEX=sknai
```

> Your app will load this via `os.getenv()` or `dotenv`.

---

## 📥 Embedding PDFs

To convert a dermatology book or article into searchable chunks:
```bash
python pipelines/embed_pdf.py path/to/your/book.pdf
```

This will:
- Extract text from PDF
- Clean and chunk it intelligently
- Embed using **BioBERT**
- Upload chunks into **Pinecone**

---

## 💬 CLI Assistant

Run the chatbot in your terminal:

```bash
python pipelines/interactive_chat.py
```

Example:
```
> Your question: What is eczema?
AI Response: Eczema is a common...
```

---

## 🌐 API Usage

### ▶️ Run the Server
```bash
uvicorn src.api.main:app --reload
```

### 📘 Open Swagger UI
Visit: [http://localhost:8000/docs](http://localhost:8000/docs)

### 📮 Available Endpoints

| Method | Endpoint         | Description                           |
|--------|------------------|---------------------------------------|
| `POST` | `/ask/first`     | Pass a predicted disease to start chat |
| `POST` | `/ask/followup`  | Ask follow-up questions in same session |
| `GET`  | `/`              | Root health check                     |

---

## 🧱 System Components

| Module               | Responsibility                                  |
|----------------------|--------------------------------------------------|
| `embedder.py`        | Embeds chunks using BioBERT                     |
| `model_loader.py`    | Loads BioBERT tokenizer & model                 |
| `pdf_utils.py`       | Extracts, cleans, and chunks PDF text           |
| `pinecone_ops.py`    | Handles Pinecone index creation & upload        |
| `chain.py`           | Constructs Mistral RAG pipeline with LangChain  |
| `chat_runner.py`     | CLI interface for interacting with the AI       |
| `context.py`         | Manages session memory for multi-turn dialogue  |
| `routes.py`          | Defines API endpoints using FastAPI             |

---

## 🐳 Docker Support

### 🛠 Build & Run
```bash
docker build -t sknai-chatbot .
docker run -d -p 8000:8000 --env-file config/.env sknai-chatbot
```

Now your FastAPI server is live at [http://localhost:8000](http://localhost:8000)

---

## 🧪 Testing & Development Tips

- Want to log every API request? Add `logging` to `routes.py`
- Need different embedding models? Swap BioBERT in `embedder.py`
- Want to plug into a frontend UI? Connect your chatbot to `/ask/first` and `/ask/followup` via HTTP

---

## 🌍 Future Improvements

- ✅ Unit testing for pipelines and API
- 📦 Hugging Face deployment
- 🔐 Auth middleware (JWT or session tokens)
- 🧠 Custom Q&A training on your org’s documents

---

## 🧠 License & Disclaimer

This AI is designed to support educational and informational use only.  
It is **not a replacement for a licensed medical professional**.  
Always consult a real doctor before making health-related decisions.
