from sqlalchemy.orm import Session
from src.chat import repository
from src.chat.schemas import ConversationCreate
from fastapi import HTTPException

def get_messages(db: Session, conversation_id: int):
    return repository.get_messages(db, conversation_id)

def create_conversation(db: Session, user_id: int, data: ConversationCreate):
    return repository.create_conversation(db, user_id, data.title)


def get_conversations(db: Session, user_id: int):
    return repository.get_conversations(db, user_id)


def get_conversation_by_id(db: Session, conversation_id: int, user_id: int):
    return repository.get_conversation_by_id(db, conversation_id, user_id)


def delete_conversation(db: Session, conversation_id: int, user_id: int):
    conversation = repository.delete_conversation(db, conversation_id, user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted"}