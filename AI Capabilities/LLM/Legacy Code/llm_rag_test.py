"""
Purpose: This script demonstrates how to set up a dermatologist assistant using LangChain and Mistral AI. This is mainly for testing the rag functionality.
Author: Jainam Patel
"""
import os
import torch
import pinecone
from transformers import AutoModel, AutoTokenizer
from langchain.vectorstores import Pinecone
from langchain.chains import RetrievalQA
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI
from tqdm import tqdm

def initialize_pinecone(index_name="sknai"):
    """
    Initialize Pinecone and return the index instance.
    
    Args:
        index_name (str): Name of the Pinecone index.
    
    Returns:
        pinecone.Index: Pinecone index instance.
    """
    pc = pinecone.Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    return pc.Index(index_name)

def load_biobert_model():
    """
    Load BioBERT tokenizer and model.
    
    Returns:
        tuple: Tokenizer and model instances.
    """
    tokenizer = AutoTokenizer.from_pretrained("monologg/biobert_v1.1_pubmed")
    model = AutoModel.from_pretrained("monologg/biobert_v1.1_pubmed")
    return tokenizer, model

def embed_text(text, tokenizer, model):
    """
    Generate BioBERT embeddings for the given text.
    
    Args:
        text (str): Input text.
        tokenizer (AutoTokenizer): BioBERT tokenizer.
        model (AutoModel): BioBERT model.
    
    Returns:
        list: Generated embedding vector.
    """
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].squeeze().tolist()

def initialize_vector_store(index, tokenizer, model):
    """
    Initialize the vector store with Pinecone.
    
    Args:
        index (pinecone.Index): Pinecone index instance.
        tokenizer (AutoTokenizer): BioBERT tokenizer.
        model (AutoModel): BioBERT model.
    
    Returns:
        Pinecone: LangChain Pinecone vector store instance.
    """
    return Pinecone(
        index=index,
        embedding=lambda text: embed_text(text, tokenizer, model),
        text_key="text"
    )

def query_pinecone(index, query_text, tokenizer, model, top_k=3):
    """
    Perform similarity search on Pinecone.
    
    Args:
        index (pinecone.Index): Pinecone index instance.
        query_text (str): User query.
        tokenizer (AutoTokenizer): BioBERT tokenizer.
        model (AutoModel): BioBERT model.
        top_k (int): Number of top results to retrieve.
    
    Returns:
        list: Retrieved matching documents.
    """
    query_embedding = embed_text(query_text, tokenizer, model)
    results = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)
    return results["matches"]

def setup_qa_chain(vector_store):
    """
    Set up the retrieval-based QA chain using Mistral AI.
    
    Args:
        vector_store (Pinecone): Vector store instance.
    
    Returns:
        RetrievalQA: Retrieval-based QA chain.
    """
    llm = ChatMistralAI(
        model="mistral-large-latest",
        temperature=0.4,
        max_retries=2
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a dermatologist. Provide patient-friendly answers about skin conditions."),
        ("human", "{question}")
    ])
    retriever = vector_store.as_retriever(search_kwargs={"k": 50})
    return RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever, return_source_documents=True)

def interactive_chat(qa_chain):
    """
    Run an interactive chat loop for user queries.
    
    Args:
        qa_chain (RetrievalQA): QA chain instance.
    """
    print("Welcome to the Interactive Dermatologist Assistant!")
    print("Type 'exit' to quit.")
    
    while True:
        query = input("\nYour question: ")
        if query.lower() == 'exit':
            print("Goodbye!")
            break
        result = qa_chain({"query": query})
        print("AI Response:", result["result"])
        
        follow_up = input("\nDo you have any follow-up questions? (yes/no): ")
        if follow_up.lower() != 'yes':
            print("Thank you for using the assistant!")
            break

def main():
    """
    Main function to initialize components and start the interactive chat.
    """
    index = initialize_pinecone()
    tokenizer, model = load_biobert_model()
    vector_store = initialize_vector_store(index, tokenizer, model)
    qa_chain = setup_qa_chain(vector_store)
    interactive_chat(qa_chain)

if __name__ == "__main__":
    main()