import sys
from src.ingest.pdf_utils import extract_text_from_pdf, clean_extracted_text, chunk_text
from src.ingest.pinecone_ops import initialize_pinecone, upload_to_pinecone

def main(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    cleaned = clean_extracted_text(text)
    chunks = chunk_text(cleaned)
    index = initialize_pinecone()
    upload_to_pinecone(index, chunks)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python pipelines/embed_pdf.py <pdf_path>")
    else:
        main(sys.argv[1])
