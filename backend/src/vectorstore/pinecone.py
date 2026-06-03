from pinecone import Pinecone
from typing import List, Dict
from src.vectorstore.base import BaseVectorStore


class PineconeVectorStore(BaseVectorStore):

    def __init__(self, api_key: str, index_name: str):
        self.pc = Pinecone(api_key=api_key)
        self.index = self.pc.Index(index_name)

    def upsert(self, namespace: str, documents: List[Dict]) -> None:
        records = []
        for doc in documents:
            records.append({
                "_id": doc["id"],
                "page_content": doc["text"],
                "metadata": str(doc.get("metadata", {}))
            })
        self.index.upsert_records(namespace=namespace, records=records)

    def query(self, namespace: str, query: str, top_k: int = 5) -> List[Dict]:
        results = self.index.search(
            namespace=namespace,
            top_k=top_k,
            inputs={"text": query}
        )
        matches = []
        for hit in results.result.hits:
            matches.append({
                "id": hit.id,
                "score": hit.score,
                "text": hit.fields.get("page_content", ""),
                "metadata": hit.fields.get("metadata", {})
            })
        return matches

    def delete_namespace(self, namespace: str) -> None:
        self.index.delete(delete_all=True, namespace=namespace)