from langchain_community.vectorstores import Pinecone
from langchain.chains import RetrievalQA
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI
from config import LLM_MODEL_NAME, LLM_TEMPERATURE

def setup_qa_chain(vector_store: Pinecone) -> RetrievalQA:
    llm = ChatMistralAI(
        model=LLM_MODEL_NAME
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a dermatologist. Provide patient-friendly answers about skin conditions."),
        ("human", "{question}")
    ])

    retriever = vector_store.as_retriever(search_kwargs={"k": 50})

    # 🛠️ Fix: explicitly define document_variable_name
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=False,
        chain_type_kwargs={
            "prompt": prompt,
            "document_variable_name": "question"
        }
    )

    return qa_chain
