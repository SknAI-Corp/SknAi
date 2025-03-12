import numpy as np
import evaluate
from transformers import ViTForImageClassification, TrainingArguments, Trainer, get_scheduler, ViTFeatureExtractor
from transformers.data.data_collator import DefaultDataCollator
from torch.optim import Adam
from src.utils.config import config
from src.utils.dataset_loader import get_dataset
from src.utils.preprocessing import transform_data

# Load accuracy metric
metric = evaluate.load("accuracy")

def compute_metrics(p):
    return metric.compute(
        predictions=np.argmax(p.predictions, axis=1),
        references=p.label_ids
    )

def custom_optimizer(model, training_args, train_dataset):
    optimizer = Adam(model.parameters(), lr=0.0002, betas=(0.9, 0.999), eps=1e-08)

    scheduler = get_scheduler(
        name="linear",
        optimizer=optimizer,
        num_warmup_steps=0,
        num_training_steps=training_args.num_train_epochs * len(train_dataset) // training_args.per_device_train_batch_size
    )

    return optimizer, scheduler

def train_model():
    datasets = get_dataset()
    feature_extractor = ViTFeatureExtractor.from_pretrained("google/vit-base-patch16-224-in21k")
    datasets = datasets.map(lambda batch: transform_data(batch, feature_extractor), remove_columns=["image"], batched=True)

    model = ViTForImageClassification.from_pretrained(
        "google/vit-base-patch16-224-in21k", num_labels=len(config["id2label"]))

    training_args = TrainingArguments(
        output_dir="./SknAI_v5_11label",
        per_device_train_batch_size=32,
        per_device_eval_batch_size=16,
        seed=42,
        evaluation_strategy="steps",
        num_train_epochs=20,
        save_steps=100,
        eval_steps=100,
        logging_steps=10,
        learning_rate=0.0002,
        save_total_limit=2,
        remove_unused_columns=False,
        push_to_hub=False,
        load_best_model_at_end=True,
        fp16=True
    )

    optimizer, scheduler = custom_optimizer(model, training_args, datasets["train"])

    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=DefaultDataCollator(),
        train_dataset=datasets["train"],
        eval_dataset=datasets["test"],
        optimizers=(optimizer, scheduler),
        compute_metrics=compute_metrics
    )

    trainer.train()
    trainer.save_model("./../../models")