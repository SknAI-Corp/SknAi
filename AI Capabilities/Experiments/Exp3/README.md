# Vision Transformer (ViT) Fine-Tuning for Image Classification

## Overview
This project focuses on fine-tuning a Vision Transformer (ViT) model for image classification using the Hugging Face Transformers library. The model is trained on a custom dataset with **9 labels**, and the training process includes evaluation, saving the best model, and hosting it on Hugging Face for easy access and deployment.

This is the **third experimentation** in the series, where the model has been fine-tuned and optimized for better performance.

---

## Table of Contents
1. [Project Description](#project-description)
2. [Dataset](#dataset)
3. [Model Training](#model-training)
4. [Results](#results)
5. [Hosted Model on Hugging Face](#hosted-model-on-hugging-face)
6. [Usage](#usage)
7. [Requirements](#requirements)
8. [Author](#author)

---

## Project Description
The goal of this project is to fine-tune a Vision Transformer (ViT) model for Skin Disease image classification. The model is trained on a custom dataset containing images categorized into **9 labels**. The training process involves:
- Preprocessing the images using a ViT feature extractor.
- Fine-tuning the pre-trained ViT model (`google/vit-base-patch16-224-in21k`).
- Evaluating the model's performance using accuracy as the metric.
- Saving the best model checkpoint and hosting it on Hugging Face for public access.

---

## Dataset
The dataset used for this project consists of images organized into **9 categories**. Each category represents a specific label, and the images are stored in separate folders within the root directory. The dataset is split into training and validation sets with an **80/20 split**.

### Dataset Structure
```
sknAI_Dataset/
├── skin_cancer/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── acne/
│   ├── image1.jpg
│   └── ...
└── ...
```
### Classes
["Acne", "Allergy", "Alopecia", "Eczema", "Fungal Infection", "Hyper Pigmentation", "Psoriasis", "Skin Cancer", "Vitiligo"]

---

## Model Training
The model training process involves the following steps:
1. **Preprocessing**: Images are preprocessed using the `ViTFeatureExtractor` from Hugging Face.
2. **Fine-Tuning**: The pre-trained ViT model is fine-tuned on the custom dataset for **20 epochs**.
3. **Evaluation**: The model's performance is evaluated on the validation set after each epoch.
4. **Saving the Best Model**: The best model checkpoint (based on validation accuracy) is saved for future use.

### Hyperparameters
- **Learning Rate**: 0.0002
- **Batch Size**: 32 (training), 16 (evaluation)
- **Epochs**: 20
- **Weight decay**: 0.01
- **Linear Rate Scheduler Type**: "linear"

---

### Training Log
Below is the training log showing the **training loss**, **validation loss**, and **validation accuracy** for each epoch:

| Epoch | Training Loss | Validation Loss | Validation Accuracy |
|-------|---------------|-----------------|---------------------|
| 1     | 2.0271        | 1.9121          | 54.26%              |
| 2     | 1.2698        | 1.2129          | 67.96%              |
| 3     | 0.9036        | 0.9679          | 69.07%              |
| 4     | 0.6160        | 0.8740          | 70.56%              |
| 5     | 0.4861        | 0.9466          | 68.89%              |
| 6     | 0.4021        | 0.9085          | 70.56%              |
| 7     | 0.4218        | 1.0424          | 66.67%              |
| 8     | 0.3312        | 0.9888          | 69.26%              |
| 9     | 0.1700        | 1.1166          | 69.07%              |
| 10    | 0.1902        | 1.1844          | 69.63%              |
| 11    | 0.1054        | 1.1208          | 70.74%              |
| 12    | 0.1106        | 1.2487          | 70.00%              |
| 13    | 0.0493        | 1.2403          | 71.48%              |
| 14    | 0.0212        | 1.2575          | 72.04%              |
| 15    | 0.0453        | 1.3227          | 72.41%              |
| 16    | 0.0331        | 1.2888          | 73.52%              |
| 17    | 0.0107        | 1.3149          | 74.44%              |
| 18    | 0.0202        | 1.3364          | 74.07%              |
| 19    | 0.0159        | 1.3463          | 74.26%              |
| 20    | 0.0113        | 1.3503          | 74.26%              |

## Results
The fine-tuned model achieved the following results:
- **Best Validation Accuracy**: 74.44%
- **Best Model Checkpoint**: Saved at `./results/checkpoint-1156`

The model's performance improved over the course of training, with the final accuracy reaching **74.44%** on the validation set.

---

## Hosted Model on Hugging Face
The best model from this experimentation has been hosted on Hugging Face for easy access and deployment. You can find the model here:

🔗 **[Hosted Model on Hugging Face](https://huggingface.co/Team-SknAI/SknAI-v3-9label)**

---

## Usage
**The code contains both the training and evaluation script.**

### Requirements
To run this project, you need the following Python libraries:
- torch
- transformers
- Pillow
- scikit-learn

Run these command in your command line-

1. **Install Required Libraries**:
   ```pip install torch transformers Pillow scikit-learn```

2. **Run Jupyter Notebook**:
	```jupyter notebook```

## Author
This project was developed by Chintan Patel as part of an AI capstone project. For any questions or feedback, feel free to reach out.

## References
1. **Vision Transformer (ViT) Paper**:  
   [An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale](https://arxiv.org/abs/2010.11929)  
   Official paper introducing the Vision Transformer (ViT) architecture.

2. **Hugging Face Transformers Documentation**:  
   [Hugging Face Transformers](https://huggingface.co/docs/transformers/index)  
   Official documentation for the Hugging Face Transformers library, used for fine-tuning and deploying the ViT model.

3. **Hugging Face Model Hub**:  
   [Hugging Face Model Hub](https://huggingface.co/models)  
   Repository of pre-trained models, including the Vision Transformer (ViT) used in this project.
