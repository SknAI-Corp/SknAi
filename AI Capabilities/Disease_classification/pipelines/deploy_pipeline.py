import sys
import os
import uvicorn

# Ensure the root project directory is in the path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.main import app  # ✅ Now this will work

def run_deploy_pipeline():
    print("🚀 Starting FastAPI server at http://127.0.0.1:8080 ...")
    uvicorn.run(app, host="0.0.0.0", port=8080)

if __name__ == "__main__":
    run_deploy_pipeline()



# Run API
# python pipelines/deploy_pipeline.py
