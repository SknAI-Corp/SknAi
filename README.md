# 🩺 SknAI – AI-Driven Skin Health Navigator

**SknAI** is a modular and intelligent AI system designed to assist in skin disease detection and dermatological information delivery. It includes two core AI capabilities:

1. 🧠 **Conversational AI (LLM + RAG)**: Answers user queries related to skin health using domain-specific language models and medical literature.  
2. 🖼️ **Disease Image Classification**: Detects and classifies common skin conditions from uploaded images using a fine-tuned ViT (Vision Transformer) model.

> ⚙️ **Note**: The full-stack frontend (React/React Native) and backend services (Node.js/Express) are currently under development and will be integrated soon.

---

## 📁 Project Structure

```
sknai/
├── disease_classification/        # Image classification system
│   ├── config/                    # id2label, configs
│   ├── models/                    # Trained ViT model
│   ├── pipelines/                # Train/test/infer/deploy scripts
│   ├── src/                      # FastAPI logic
│   └── tests/                    # Unit + integration tests

├── LLM_Conversational_AI/        # Conversational AI system
│   ├── src/                      # API endpoints, chat logic
│   ├── pipelines/                # PDF embed, chat CLI
│   ├── config/                   # API keys and environment
│   └── requirements.txt          # Dependencies

├── Dockerfile(s)                 # Containerization setup
├── README.md                     # This file
└── requirements.txt              # Combined Python dependencies
```

---

## 🖼️ AI Capability #1 – Disease Image Classification

This microservice allows users to upload an image of a skin condition and receive a predicted label using a fine-tuned ViT model.

### 🔧 Features
- ✅ 11-class skin disease detection  
- ✅ Vision Transformer backbone  
- ✅ Fully containerized  
- ✅ FastAPI endpoints  
- ✅ PyTorch backend

### ▶️ Run the API
```bash
cd disease_classification
uvicorn src.main:app --reload --port 8080
```

Visit Swagger UI at: [http://localhost:8080/docs](http://localhost:8080/docs)

### 🧪 Run Inference
```bash
python pipelines/inference_pipeline.py path/to/image.jpg
```

---

## 🧠 AI Capability #2 – Conversational AI (LLM + RAG)

A domain-specific chatbot that uses medical books + language models to answer patient questions with context-aware responses.

### 🤖 Stack
- 🔍 **Pinecone** – Semantic document retrieval  
- 🧬 **BioBERT** – Domain-specific embeddings  
- 🤖 **Mistral LLM** – Response generation  
- ⚡ **LangChain** – Context-aware chaining  
- 🌐 **FastAPI** – API integration layer

### 📥 Embed PDFs to Pinecone
```bash
cd LLM_Conversational_AI
python pipelines/embed_pdf.py path/to/your/book.pdf
```

### 💬 Chat via CLI
```bash
python pipelines/interactive_chat.py
```

### ▶️ Run the Chat API
```bash
uvicorn src.api.main:app --reload --port 8000
```

Visit Swagger UI at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🐳 Docker Support

### 🖼 Image Classifier
```bash
docker build -t sknai-classifier -f disease_classification/Dockerfile .
docker run -p 8080:8080 sknai-classifier
```

### 💬 Conversational AI
```bash
docker build -t sknai-chatbot -f LLM_Conversational_AI/Dockerfile .
docker run --env-file config/.env -p 8000:8000 sknai-chatbot
```

---

## 🧪 Testing

### Disease Classification
```bash
cd disease_classification
python pipelines/test_pipeline.py
```

### Conversational AI
Unit testing support coming soon for embedding and API endpoints.
```bash
cd LLM
python test/test_pipeline.py
```

---

## 📌 Tech Stack Overview

| Layer            | Tools & Frameworks                             |
|------------------|------------------------------------------------|
| Frontend         | React.js, React Native (🚧 In Progress)       |
| Backend          | Node.js, Express.js (🚧 In Progress)          |
| Image Classifier | PyTorch, ViT, FastAPI                         |
| Chat Assistant   | BioBERT, Pinecone, LangChain, Mistral, FastAPI|
| Storage          | MongoDB, Pinecone                            |
| Deployment       | Docker, Uvicorn, Pydantic                    |

---

## 🌱 Future Additions

- 🌐 Fullstack UI for Web and Mobile  
- 📱 Mobile App (React Native)  
- 🔐 Auth (JWT / Session Tokens)  
- 📊 Doctor Dashboard with Validation Workflow  
- 🧠 Fine-tuning LLM on custom dermatology Q&A  

---

## ⚠️ Disclaimer

This AI system is intended for **educational and informational purposes only**.  
It is **not a replacement for licensed medical advice**.  
Users should always consult a qualified dermatologist for diagnosis or treatment.

---

## 👥 Team Contributors

- Jainam Patel  
- Sagar Parmar  
- Chintan Patel  
- Vivek Prajapati  
- Aakash Parekh  
- Divyanshu Sharma

---
