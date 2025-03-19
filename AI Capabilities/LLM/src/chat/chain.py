from langchain.vectorstores import Pinecone
from langchain.chains import RetrievalQA
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI

def setup_qa_chain(vector_store):
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
