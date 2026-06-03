from sqlalchemy.orm import Session
from passlib.context import CryptContext
from src.auth import repository
from src.auth.schemas import RegisterRequest, LoginRequest
from src.core.security import create_access_token
from fastapi import HTTPException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def register_user(db: Session, data: RegisterRequest):
    existing_user = repository.get_user_by_email(db, data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(data.password)
    user = repository.create_user(db, data.name, data.email, hashed_password)
    return user


def login_user(db: Session, data: LoginRequest):
    user = repository.get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}