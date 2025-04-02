# import pdfplumber
# import re
# from langchain.text_splitter import RecursiveCharacterTextSplitter

# def extract_text_from_pdf(pdf_path):
#     text = ""
#     with pdfplumber.open(pdf_path) as pdf:
#         for page in pdf.pages:
#             text += page.extract_text() + "\n"
#     return text.strip()

# def clean_extracted_text(text):
#     text = re.sub(r'\s+', ' ', text).strip()
#     text = re.sub(r'\n+', '\n', text).strip()
#     return text

# def chunk_text(text, chunk_size=700, chunk_overlap=50):
#     splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
#     return splitter.split_text(text)


# llm_chat_service/ingest/pdf_utils.py

import pdfplumber
import re
from langchain.text_splitter import RecursiveCharacterTextSplitter

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts raw text from a PDF using pdfplumber.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        str: Extracted text content.
    """
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def clean_extracted_text(text: str) -> str:
    """
    Cleans extracted text by normalizing whitespace and line breaks.

    Args:
        text (str): Raw text.

    Returns:
        str: Cleaned text.
    """
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n+', '\n', text)
    return text.strip()

def chunk_text(text: str, chunk_size=700, chunk_overlap=50) -> list:
    """
    Splits long text into overlapping chunks for RAG ingestion.

    Args:
        text (str): Cleaned text.
        chunk_size (int): Max size of each chunk.
        chunk_overlap (int): Overlap between chunks.

    Returns:
        list: List of string chunks.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return splitter.split_text(text)
