# 🩺 SknAI - Disease Image Classification API

SknAI is a production-ready FastAPI application for classifying skin diseases using a fine-tuned ViT (Vision Transformer) model. It includes modular training, inference, testing, and deployment pipelines.

---

## 📁 Folder Structure
```
disease_classification/
├── config/                 # id2label and preprocessor configs
├── models/                 # Saved model files (e.g., model.safetensors)
├── pipelines/              # Entry-point scripts for train/test/deploy/infer
├── src/                    # Core application logic
│   ├── api/                # FastAPI endpoints
│   ├── models/             # Training + inference logic
│   ├── utils/              # Preprocessing, config, dataset loader
│   └── main.py             # FastAPI app
├── tests/                  # Unit tests for all core modules
├── Dockerfile              # Containerization
├── requirements.txt        # Dependencies
└── README.md               # Project documentation
```

---

## 🔧 Installation & Setup
### ✅ Clone and Install
```bash
git clone <repo-url>
cd disease_classification
pip install -r requirements.txt
```

### 🐍 (Optional) Virtual Environment
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

---

## 🐳 Run with Docker
### ✅ Build and Run
```bash
docker build -t sknai-classifier .
docker run -p 8080:8080 sknai-classifier
```
Then visit: [http://localhost:8080/docs](http://localhost:8080/docs)

---

## ✅ Running the API (Without Docker)

-> Run this api before you run the LLM API

```bash
python pipelines/deploy_pipeline.py
```
Then open: [http://localhost:8080/docs](http://localhost:8080/docs)

You can also run manually:
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8080
```

---

## 🔁 Training a New Model
### ✍️ Step-by-step:
1. Update your dataset (Hugging Face or local)
2. Update `config/config.json` with new `id2label`
3. Run training pipeline:
```bash
python pipelines/train_pipeline.py
```
4. Once training completes, the new model will be saved in `models/`

---

## 🤖 Run Inference on an Image
```bash
python pipelines/inference_pipeline.py path/to/image.jpg
```
Expected output:
```
Prediction: Acne (Confidence: 0.97)
```

---

## 🧪 Run Tests
```bash
python pipelines/test_pipeline.py
```
Or manually:
```bash
pytest tests/ -q
```
You’ll see simple PASS/FAIL output for all modules.

---

## 📦 API Endpoints (Swagger UI)
| Method | Endpoint       | Description  |
|--------|--------------|--------------|
| `GET`  | `/`          | Welcome message |
| `POST` | `/upload`    | Upload an image for classification |
| `POST` | `/predict`   | Get a disease classification for an uploaded image |

Visit [http://localhost:8080/docs](http://localhost:8080/docs) for Swagger interface.

---

## 👨‍💻 Guide for New Contributors (Retrain + Redeploy)
### 🔄 To retrain with new labels:
1. Add new images to your dataset
2. Update `config/config.json` with new labels (e.g., id 11, 12, etc.)
3. Re-run:
```bash
python pipelines/train_pipeline.py
```
4. To redeploy the updated model:
```bash
python pipelines/deploy_pipeline.py
```

You don’t need to change any code in API — it dynamically picks up the updated model and label mapping.

---

## 🧠 Developer Notes
- 🔍 `trainer.py` has optimizer, metrics, and training pipeline logic
- 🧼 `preprocessing.py` includes all transformations
- 🧪 Unit tests for every core function in `tests/`
- 🪄 FastAPI auto-docs enabled at `/docs`