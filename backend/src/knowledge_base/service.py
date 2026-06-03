from sqlalchemy.orm import Session
from src.knowledge_base import repository
from fastapi import HTTPException


def get_or_create_kb(db: Session, user_id: int):
    return repository.get_or_create_kb(db, user_id)


def create_namespace(db: Session, user_id: int, name: str):
    kb = repository.get_or_create_kb(db, user_id)
    return repository.create_namespace(db, kb.id, name)


def get_namespaces(db: Session, user_id: int):
    kb = repository.get_or_create_kb(db, user_id)
    return repository.get_namespaces(db, kb.id)


def delete_namespace(db: Session, user_id: int, namespace_id: int):
    kb = repository.get_or_create_kb(db, user_id)
    namespace = repository.delete_namespace(db, namespace_id, kb.id)
    if not namespace:
        raise HTTPException(status_code=404, detail="Namespace not found")
    return {"message": "Namespace deleted"}


def get_documents(db: Session, user_id: int, namespace_id: int):
    kb = repository.get_or_create_kb(db, user_id)
    namespace = repository.get_namespace_by_id(db, namespace_id, kb.id)
    if not namespace:
        raise HTTPException(status_code=404, detail="Namespace not found")
    return repository.get_documents(db, namespace_id)