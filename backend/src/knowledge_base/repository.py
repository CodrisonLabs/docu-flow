from sqlalchemy.orm import Session
from src.knowledge_base.models import KnowledgeBase, Namespace, Document
import uuid


def get_or_create_kb(db: Session, user_id: int) -> KnowledgeBase:
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.user_id == user_id).first()
    if not kb:
        kb = KnowledgeBase(user_id=user_id)
        db.add(kb)
        db.commit()
        db.refresh(kb)
    return kb


def create_namespace(db: Session, kb_id: int, name: str) -> Namespace:
    pinecone_ref = str(uuid.uuid4()).replace("-", "")[:16]
    namespace = Namespace(kb_id=kb_id, name=name, pinecone_ref=pinecone_ref)
    db.add(namespace)
    db.commit()
    db.refresh(namespace)
    return namespace


def get_namespaces(db: Session, kb_id: int):
    return db.query(Namespace).filter(Namespace.kb_id == kb_id).all()


def get_namespace_by_id(db: Session, namespace_id: int, kb_id: int):
    return db.query(Namespace).filter(
        Namespace.id == namespace_id,
        Namespace.kb_id == kb_id
    ).first()


def delete_namespace(db: Session, namespace_id: int, kb_id: int):
    namespace = get_namespace_by_id(db, namespace_id, kb_id)
    if namespace:
        db.delete(namespace)
        db.commit()
    return namespace


def create_document(db: Session, namespace_id: int, filename: str, file_type: str, file_url: str):
    document = Document(
        namespace_id=namespace_id,
        filename=filename,
        file_type=file_type,
        file_url=file_url
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def get_documents(db: Session, namespace_id: int):
    return db.query(Document).filter(Document.namespace_id == namespace_id).all()