from src.chat.chat_runner import interactive_chat
from src.embeddings.model_loader import load_biobert_model
from src.ingest.pinecone_ops import initialize_pinecone
from src.chat.chain import setup_qa_chain
from src.embeddings.embedder import embed_text
from langchain.vectorstores import Pinecone

def main():
    index = initialize_pinecone()
    tokenizer, model = load_biobert_model()
    vector_store = Pinecone(index=index, embedding=embed_text, text_key="text")
    qa_chain = setup_qa_chain(vector_store)
    interactive_chat(qa_chain)

if __name__ == "__main__":
    main()
