# from src.chat.chat_runner import interactive_chat
# from src.embeddings.model_loader import load_biobert_model
# from src.ingest.pinecone_ops import initialize_pinecone
# from src.chat.chain import setup_qa_chain
# from src.embeddings.embedder import embed_text
# from langchain.vectorstores import Pinecone

# def main():
#     index = initialize_pinecone()
#     tokenizer, model = load_biobert_model()
#     vector_store = Pinecone(index=index, embedding=embed_text, text_key="text")
#     qa_chain = setup_qa_chain(vector_store)
#     interactive_chat(qa_chain)

# if __name__ == "__main__":
#     main()


# llm_chat_service/pipelines/interactive_chat.py

from chat.chain import setup_qa_chain
from embeddings.embedder import embed_text
from embeddings.model_loader import load_biobert_model
from ingest.pinecone_ops import initialize_pinecone
from langchain.vectorstores import Pinecone

def interactive_chat(qa_chain):
    print("Welcome to the Interactive Dermatologist Assistant!")
    print("Type 'exit' to quit.\n")

    while True:
        query = input("Your question: ")
        if query.lower() in {"exit", "quit"}:
            print("👋 Goodbye!")
            break

        result = qa_chain.run(query)
        print("AI:", result)

if __name__ == "__main__":
    index = initialize_pinecone()
    tokenizer, model = load_biobert_model()
    vector_store = Pinecone(index=index, embedding=embed_text, text_key="text")
    qa_chain = setup_qa_chain(vector_store)
    interactive_chat(qa_chain)
