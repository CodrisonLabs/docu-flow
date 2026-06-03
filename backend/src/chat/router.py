from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from src.database import get_db
from src.auth.deps import get_current_user
from src.chat import service
from src.chat.schemas import ConversationCreate, ConversationResponse
from src.users.models import User
from src.chat.pipeline import run_pipeline
from src.api_keys import repository as api_key_repository
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import base64

# -- Added: imports required for the new MessageResponse schema --
from datetime import datetime
from pydantic import ConfigDict

router = APIRouter(prefix="/conversations", tags=["conversations"])


class ChatRequest(BaseModel):
    message: str
    model: str
    provider: str
    namespace_id: Optional[int] = None
    file_base64: Optional[str] = None
    file_mime_type: Optional[str] = None


# -- Added: Pydantic schema for serialising individual chat messages --
class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


@router.post("", response_model=ConversationResponse)
def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_conversation(db, current_user.id, data)


@router.get("", response_model=List[ConversationResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_conversations(db, current_user.id)


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.delete_conversation(db, conversation_id, current_user.id)


@router.post("/{conversation_id}/chat")
def chat(
    conversation_id: int,
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = service.get_conversation_by_id(db, conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get LLM API key
    api_key = api_key_repository.get_api_key(db, current_user.id, data.provider)
    if not api_key:
        raise HTTPException(status_code=400, detail=f"No API key found for {data.provider}")

    # Get Pinecone key and namespace ref if namespace provided
    pinecone_api_key = None
    namespace_ref = None
    if data.namespace_id:
        pinecone_key = api_key_repository.get_api_key(db, current_user.id, "pinecone")
        if not pinecone_key:
            raise HTTPException(status_code=400, detail="No Pinecone API key found")
        pinecone_api_key = pinecone_key.key

        from src.knowledge_base.repository import get_namespace_by_id
        from src.knowledge_base.service import get_or_create_kb
        kb = get_or_create_kb(db, current_user.id)
        namespace = get_namespace_by_id(db, data.namespace_id, kb.id)
        if not namespace:
            raise HTTPException(status_code=404, detail="Namespace not found")
        namespace_ref = namespace.pinecone_ref

    return {
        "response": run_pipeline(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
            user_message=data.message,
            model=data.model,
            provider_name=data.provider,
            api_key=api_key.key,
            pinecone_api_key=pinecone_api_key,
            namespace_ref=namespace_ref,
            file_base64=data.file_base64,
            file_mime_type=data.file_mime_type
        )
    }


import base64

ALLOWED_MIME_TYPES = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
    "gif": "image/gif",
    "txt": "text/plain",
    "md": "text/plain",
    "html": "text/plain",
    "csv": "text/plain",
}


@router.post("/{conversation_id}/upload")
def upload_file(
    conversation_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = service.get_conversation_by_id(db, conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    file_ext = file.filename.split(".")[-1].lower()
    mime_type = ALLOWED_MIME_TYPES.get(file_ext)
    if not mime_type:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_ext}")

    # Read and encode to base64
    file_bytes = file.file.read()
    file_base64 = base64.b64encode(file_bytes).decode("utf-8")

    return {
        "filename": file.filename,
        "mime_type": mime_type,
        "base64": file_base64
    }


# -- Added: endpoint to fetch all messages for a given conversation --
# GET /conversations/{conversation_id}/messages
# Returns a list of MessageResponse objects, validated via service.get_messages()
@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify the conversation exists and belongs to the current user
    conversation = service.get_conversation_by_id(db, conversation_id, current_user.id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return service.get_messages(db, conversation_id)