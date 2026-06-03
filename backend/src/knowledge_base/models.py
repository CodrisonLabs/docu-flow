from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database import Base


class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="knowledge_base")
    namespaces = relationship("Namespace", back_populates="knowledge_base")


class Namespace(Base):
    __tablename__ = "namespaces"

    id = Column(Integer, primary_key=True, index=True)
    kb_id = Column(Integer, ForeignKey("knowledge_base.id"), nullable=False)
    name = Column(String, nullable=False)
    pinecone_ref = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    knowledge_base = relationship("KnowledgeBase", back_populates="namespaces")
    documents = relationship("Document", back_populates="namespace")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    namespace_id = Column(Integer, ForeignKey("namespaces.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    page_content = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    namespace = relationship("Namespace", back_populates="documents")