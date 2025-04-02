# import sys
# from src.ingest.pdf_utils import extract_text_from_pdf, clean_extracted_text, chunk_text
# from src.ingest.pinecone_ops import initialize_pinecone, upload_to_pinecone

# def main(pdf_path):
#     text = extract_text_from_pdf(pdf_path)
#     cleaned = clean_extracted_text(text)
#     chunks = chunk_text(cleaned)
#     index = initialize_pinecone()
#     upload_to_pinecone(index, chunks)

# if __name__ == "__main__":
#     if len(sys.argv) != 2:
#         print("Usage: python pipelines/embed_pdf.py <pdf_path>")
#     else:
#         main(sys.argv[1])


# llm_chat_service/pipelines/embed_pdf.py

import sys
from ingest.pdf_utils import extract_text_from_pdf, clean_extracted_text, chunk_text
from ingest.pinecone_ops import initialize_pinecone, upload_to_pinecone

def main(pdf_path):
    print(f"[INFO] Embedding PDF: {pdf_path}")
    text = extract_text_from_pdf(pdf_path)
    cleaned = clean_extracted_text(text)
    chunks = chunk_text(cleaned)

    index = initialize_pinecone()
    upload_to_pinecone(index, chunks)

    print(f"[SUCCESS] Uploaded {len(chunks)} chunks to Pinecone index.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python pipelines/embed_pdf.py <path_to_pdf>")
    else:
        main(sys.argv[1])
