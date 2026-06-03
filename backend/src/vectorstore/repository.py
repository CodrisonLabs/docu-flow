from src.vectorstore.pinecone import PineconeVectorStore
from typing import List, Dict


def get_vector_store(api_key: str, index_name: str) -> PineconeVectorStore:
    return PineconeVectorStore(api_key=api_key, index_name=index_name)


def upsert_documents(
    api_key: str,
    index_name: str,
    namespace: str,
    documents: List[Dict]
) -> None:
    store = get_vector_store(api_key, index_name)
    store.upsert(namespace, documents)


def query_documents(
    api_key: str,
    index_name: str,
    namespace: str,
    query: str,
    top_k: int = 5
) -> List[Dict]:
    store = get_vector_store(api_key, index_name)
    return store.query(namespace, query, top_k)


def delete_namespace(
    api_key: str,
    index_name: str,
    namespace: str
) -> None:
    store = get_vector_store(api_key, index_name)
    store.delete_namespace(namespace)