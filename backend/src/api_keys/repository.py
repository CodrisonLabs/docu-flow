from sqlalchemy.orm import Session
from src.api_keys.models import ApiKey


def get_api_key(db: Session, user_id: int, provider: str):
    return db.query(ApiKey).filter(
        ApiKey.user_id == user_id,
        ApiKey.provider == provider
    ).first()


def get_user_api_keys(db: Session, user_id: int):
    return db.query(ApiKey).filter(ApiKey.user_id == user_id).all()


def delete_api_key(db: Session, key_id: int, user_id: int):
    api_key = db.query(ApiKey).filter(
        ApiKey.id == key_id,
        ApiKey.user_id == user_id
    ).first()
    if api_key:
        db.delete(api_key)
        db.commit()
    return api_key