import os
import uuid
from typing import List, Dict
from docling.document_converter import DocumentConverter
from docling.chunking import HybridChunker
from src.vectorstore import repository as vector_repository
from src.config import settings

os.environ["HF_TOKEN"] = settings.HF_TOKEN


converter = DocumentConverter()
chunker = HybridChunker(chunk_size=2000, chunk_overlap=200)


def ingest_document(
    file_path: str,
    file_type: str,
    pinecone_api_key: str,
    index_name: str,
    namespace: str,
) -> int:
    # 1. Convert document — Docling auto detects format
    result = converter.convert(file_path)
    document = result.document

    # 2. Chunk using HybridChunker
    chunks = list(chunker.chunk(document))

    # 3. Prepare records for Pinecone
    records = []
    for chunk in chunks:
        text = chunk.text.strip()
        if text:
            records.append({
                "id": str(uuid.uuid4()),
                "text": text,
                "metadata": {
                    "source": file_path,
                    "file_type": file_type
                }
            })

    # 4. Upsert to Pinecone
    vector_repository.upsert_documents(
        api_key=pinecone_api_key,
        index_name=index_name,
        namespace=namespace,
        documents=records
    )

    return len(records)