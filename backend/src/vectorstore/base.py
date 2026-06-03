from abc import ABC, abstractmethod
from typing import List, Dict


class BaseVectorStore(ABC):

    @abstractmethod
    def upsert(self, namespace: str, documents: List[Dict]) -> None:
        """Store documents in vector store"""
        pass

    @abstractmethod
    def query(self, namespace: str, query: str, top_k: int = 5) -> List[Dict]:
        """Query vector store and return relevant documents"""
        pass

    @abstractmethod
    def delete_namespace(self, namespace: str) -> None:
        """Delete all vectors in a namespace"""
        pass