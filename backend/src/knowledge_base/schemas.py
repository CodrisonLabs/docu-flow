from pydantic import BaseModel
from datetime import datetime
from typing import List


class NamespaceCreate(BaseModel):
    name: str


class NamespaceResponse(BaseModel):
    id: int
    name: str
    pinecone_ref: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class KnowledgeBaseResponse(BaseModel):
    id: int
    created_at: datetime
    namespaces: List[NamespaceResponse] = []

    class Config:
        from_attributes = True