import numpy as np
from types import SimpleNamespace
from transformers import TrainingArguments
from torch import nn
import sys
import os

# Ensure the root project directory is in the path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.insert(0, project_root)

from src.models.trainer import compute_metrics, custom_optimizer

def test_compute_metrics():
    preds = SimpleNamespace(
        predictions=np.array([[0.2, 0.8], [0.9, 0.1]]),
        label_ids=np.array([1, 0])
    )
    result = compute_metrics(preds)
    assert "accuracy" in result
    assert result["accuracy"] == 1.0

def test_custom_optimizer():
    model = nn.Linear(10, 2)
    training_args = TrainingArguments(
        output_dir="./test_output",
        per_device_train_batch_size=4,
        num_train_epochs=2
    )
    train_dataset = list(range(20))
    optimizer, scheduler = custom_optimizer(model, training_args, train_dataset)
    assert optimizer is not None
    assert scheduler is not None
