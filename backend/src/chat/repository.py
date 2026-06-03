from sqlalchemy.orm import Session
from src.chat.models import Conversation, Message


def create_conversation(db: Session, user_id: int, title: str):
    conversation = Conversation(user_id=user_id, title=title)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def get_conversations(db: Session, user_id: int):
    return db.query(Conversation).filter(Conversation.user_id == user_id).all()


def get_conversation_by_id(db: Session, conversation_id: int, user_id: int):
    return db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    ).first()


def delete_conversation(db: Session, conversation_id: int, user_id: int):
    conversation = get_conversation_by_id(db, conversation_id, user_id)
    if conversation:
        db.delete(conversation)
        db.commit()
    return conversation




def get_messages(db: Session, conversation_id: int):
    return db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()


def save_messages(db: Session, conversation_id: int, user_message: str, assistant_response: str):
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=user_message
    )
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=assistant_response
    )
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()