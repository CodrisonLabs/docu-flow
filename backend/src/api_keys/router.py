from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.deps import get_current_user
from src.api_keys import repository
from src.api_keys.models import ApiKey
from src.users.models import User
from src.providers.factory import PROVIDERS
from pydantic import BaseModel


router = APIRouter(prefix="/api-keys", tags=["api-keys"])


class ApiKeyCreate(BaseModel):
    provider: str
    key: str


class ApiKeyResponse(BaseModel):
    id: int
    provider: str

    class Config:
        from_attributes = True


class ModelResponse(BaseModel):
    id: str
    display_name: str
    description: str


@router.post("")
def add_api_key(
    data: ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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


@router.get("/{key_id}/models", response_model=list[ModelResponse])
def get_models(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    api_key = db.query(ApiKey).filter(
        ApiKey.id == key_id,
        ApiKey.user_id == current_user.id
    ).first()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    provider_class = PROVIDERS.get(api_key.provider)
    if not provider_class:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {api_key.provider}")

    return [
        {"id": model_id, **model_info}
        for model_id, model_info in provider_class.SUPPORTED_MODELS.items()
    ]


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