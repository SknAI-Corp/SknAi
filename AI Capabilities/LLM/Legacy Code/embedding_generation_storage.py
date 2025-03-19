"""
Purpose: Extract text from a PDF file, clean the text, chunk it into smaller pieces, generate embeddings using BioBERT, and upload the embeddings to Pinecone.
Author: Jainam Patel
"""
import pdfplumber
import torch
import pinecone
import os
import re
import numpy as np
from transformers import AutoTokenizer, AutoModel
from langchain.text_splitter import RecursiveCharacterTextSplitter
from tqdm import tqdm

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file.
    
    Returns:
        str: Extracted text from the PDF.
    """
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text.strip()

def clean_extracted_text(text):
    """
    Clean extracted text by removing extra spaces and unwanted newlines.
    
    Args:
        text (str): Raw extracted text.
    
    Returns:
        str: Cleaned text.
    """
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'\n+', '\n', text).strip()
    return text

def chunk_text(text, chunk_size=700, chunk_overlap=50):
    """
    Split cleaned text into smaller chunks for processing.
    
    Args:
        text (str): Cleaned text.
        chunk_size (int): Maximum size of each chunk.
        chunk_overlap (int): Overlapping characters between chunks.
    
    Returns:
        list: List of text chunks.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return text_splitter.split_text(text)

def get_biobert_embeddings(text):
    """
    Generate embeddings using the BioBERT model.
    
    Args:
        text (str): Input text for embedding generation.
    
    Returns:
        numpy.ndarray: Generated embeddings.
    """
    tokenizer = AutoTokenizer.from_pretrained("monologg/biobert_v1.1_pubmed")
    model = AutoModel.from_pretrained("monologg/biobert_v1.1_pubmed")
    
    inputs = tokenizer(
        text, padding=True, truncation=True, return_tensors="pt", max_length=512
    )
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    embeddings = torch.mean(outputs.last_hidden_state, dim=1)
    return embeddings.numpy()

def initialize_pinecone(index_name="sknai", dimension=1536, metric="cosine"):
    """
    Initialize and connect to Pinecone index.
    
    Args:
        index_name (str): Name of the Pinecone index.
        dimension (int): Embedding dimension.
        metric (str): Similarity metric.
    
    Returns:
        pinecone.Index: Connected Pinecone index instance.
    """
    pinecone.init(api_key=os.getenv("PINECONE_API_KEY"))
    
    if index_name not in pinecone.list_indexes():
        pinecone.create_index(
            name=index_name,
            dimension=dimension,
            metric=metric,
            cloud="aws",
            region="us-east-1"
        )
    
    return pinecone.Index(index_name)

def upload_to_pinecone(index, chunks, batch_size=32):
    """
    Upload text chunks and embeddings to Pinecone in batches.
    
    Args:
        index (pinecone.Index): Pinecone index instance.
        chunks (list): List of text chunks.
        batch_size (int): Number of chunks per batch.
    """
    batch = []
    for i, chunk in tqdm(enumerate(chunks), desc="Uploading to Pinecone"):
        embedding = get_biobert_embeddings(chunk).tolist()[0]
        metadata = {"text": chunk, "chunk_id": str(i)}
        batch.append((str(i), embedding, metadata))
        
        if len(batch) >= batch_size:
            index.upsert(vectors=batch)
            batch = []
    
    if batch:
        index.upsert(vectors=batch)

def main(pdf_path):
    """
    Main function to extract, clean, chunk, embed, and upload text to Pinecone.
    
    Args:
        pdf_path (str): Path to the input PDF file.
    """
    text = extract_text_from_pdf(pdf_path)
    cleaned_text = clean_extracted_text(text)
    text_chunks = chunk_text(cleaned_text)
    index = initialize_pinecone()
    upload_to_pinecone(index, text_chunks)

if __name__ == "__main__":
    pdf_path = "book.pdf"  # Replace with the actual PDF file path
    main(pdf_path)
