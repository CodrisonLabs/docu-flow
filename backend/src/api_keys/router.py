from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.deps import get_current_user
from src.api_keys import repository
from src.users.models import User
from pydantic import BaseModel


router = APIRouter(prefix="/api-keys", tags=["api-keys"])


class ApiKeyCreate(BaseModel):
    provider: str
    key: str


@router.post("")
def add_api_key(
    data: ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from src.api_keys.models import ApiKey
    api_key = ApiKey(user_id=current_user.id, provider=data.provider, key=data.key)
    db.add(api_key)
    db.commit()
    return {"message": "API key added"}



router = APIRouter(prefix="/api-keys", tags=["api-keys"])


class ApiKeyCreate(BaseModel):
    provider: str
    key: str


class ApiKeyResponse(BaseModel):
    id: int
    provider: str

    class Config:
        from_attributes = True


@router.post("")
def add_api_key(
    data: ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from src.api_keys.models import ApiKey
    api_key = ApiKey(user_id=current_user.id, provider=data.provider, key=data.key)
    db.add(api_key)
    db.commit()
    return {"message": "API key added"}


@router.get("", response_model=list[ApiKeyResponse])
def get_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return repository.get_user_api_keys(db, current_user.id)


@router.delete("/{key_id}")
def delete_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = repository.delete_api_key(db, key_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="API key not found")
    return {"message": "API key deleted"}