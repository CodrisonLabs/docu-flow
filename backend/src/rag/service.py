from typing import List
from src.vectorstore import repository as vector_repository


def retrieve_context(
    query: str,
    namespace: str,
    pinecone_api_key: str,
    index_name: str,
    top_k: int = 5
) -> str:
    results = vector_repository.query_documents(
        api_key=pinecone_api_key,
        index_name=index_name,
        namespace=namespace,
        query=query,
        top_k=top_k
    )

    if not results:
        return ""

    # Join all retrieved chunks into one context string
    context = "\n\n".join([r["text"] for r in results])
    return context