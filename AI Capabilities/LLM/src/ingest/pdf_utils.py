import pdfplumber
import re
from langchain.text_splitter import RecursiveCharacterTextSplitter

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text.strip()

def clean_extracted_text(text):
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'\n+', '\n', text).strip()
    return text

def chunk_text(text, chunk_size=700, chunk_overlap=50):
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_text(text)
