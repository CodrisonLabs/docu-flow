from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.deps import get_current_user
from src.knowledge_base import service
from src.knowledge_base.schemas import NamespaceCreate, NamespaceResponse, KnowledgeBaseResponse
from src.knowledge_base.repository import get_namespace_by_id, create_document
from src.users.models import User
from src.api_keys import repository as api_key_repository
from src.ingestion.pipeline import ingest_document
from src.config import settings
from typing import List
import os
import shutil

router = APIRouter(prefix="/kb", tags=["knowledge-base"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_TYPES = ["pdf", "txt", "csv", "json"]


@router.get("", response_model=KnowledgeBaseResponse)
def get_kb(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_or_create_kb(db, current_user.id)


@router.post("/namespaces", response_model=NamespaceResponse)
def create_namespace(
    data: NamespaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_namespace(db, current_user.id, data.name)


@router.get("/namespaces", response_model=List[NamespaceResponse])
def get_namespaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_namespaces(db, current_user.id)


@router.delete("/namespaces/{namespace_id}")
def delete_namespace(
    namespace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.delete_namespace(db, current_user.id, namespace_id)


@router.get("/namespaces/{namespace_id}/documents")
def get_documents(
    namespace_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_documents(db, current_user.id, namespace_id)


@router.post("/namespaces/{namespace_id}/upload")
def upload_document(
    namespace_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify namespace belongs to user
    kb = service.get_or_create_kb(db, current_user.id)
    namespace = get_namespace_by_id(db, namespace_id, kb.id)
    if not namespace:
        raise HTTPException(status_code=404, detail="Namespace not found")

    # Check file type
    file_type = file.filename.split(".")[-1].lower()
    if file_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_type}")

    # Get Pinecone API key
    pinecone_key = api_key_repository.get_api_key(db, current_user.id, "pinecone")
    if not pinecone_key:
        raise HTTPException(status_code=400, detail="No Pinecone API key found")

    # Save file locally
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Ingest
    try:
        chunk_count = ingest_document(
            file_path=file_path,
            file_type=file_type,
            pinecone_api_key=pinecone_key.key,
            index_name=settings.PINECONE_INDEX_NAME,
            namespace=namespace.pinecone_ref
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion error: {str(e)}")

    # Save document to DB
    doc = create_document(db, namespace_id, file.filename, file_type, file_path)

    return {
        "message": "Document uploaded and ingested",
        "filename": file.filename,
        "chunks": chunk_count,
        "document_id": doc.id
    }