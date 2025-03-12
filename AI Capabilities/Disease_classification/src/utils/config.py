import json
import os

CONFIG_PATH = "./config/config.json"
PREPROCESSOR_CONFIG_PATH = "./config/preprocessor_config.json"
MODEL_PATH = "./models/model.safetensors"
UPLOAD_FOLDER = "uploads/"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def load_preprocessor_config():
    with open(PREPROCESSOR_CONFIG_PATH, "r") as f:
        return json.load(f)

config = load_config()
id2label = config["id2label"]