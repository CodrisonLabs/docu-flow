from sqlalchemy.orm import Session
from src.prompts.builder import build_messages
from src.providers.factory import get_provider
from src.chat import repository
from src.rag.service import retrieve_context
from src.config import settings
from fastapi import HTTPException


def run_pipeline(
    db: Session,
    conversation_id: int,
    user_id: int,
    user_message: str,
    model: str,
    provider_name: str,
    api_key: str,
    pinecone_api_key: str = None,
    namespace_ref: str = None,
    file_base64: str = None,
    file_mime_type: str = None
):
    history = repository.get_messages(db, conversation_id)

    context = None
    if namespace_ref and pinecone_api_key:
        context = retrieve_context(
            query=user_message,
            namespace=namespace_ref,
            pinecone_api_key=pinecone_api_key,
            index_name=settings.PINECONE_INDEX_NAME
        )

    messages = build_messages(
        history,
        user_message,
        context,
        file_base64=file_base64,
        file_mime_type=file_mime_type
    )

    try:
        provider = get_provider(provider_name, api_key)
        response = provider.chat(messages, model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    repository.save_messages(db, conversation_id, user_message, response)

    return response