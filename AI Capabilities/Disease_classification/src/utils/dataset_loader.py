from datasets import load_dataset

def get_dataset():
    dataset = load_dataset("Team-SknAI/SknAI_300_v3_11Labels")
    return dataset