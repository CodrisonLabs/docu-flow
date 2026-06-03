from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from src.auth.router import router as auth_router
from src.users.router import router as users_router
from src.chat.router import router as chat_router
from src.api_keys.router import router as api_keys_router


from src.knowledge_base.router import router as kb_router

import src.users.models
import src.api_keys.models
import src.chat.models
import src.knowledge_base.models

app = FastAPI(title="DocuFlow")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(chat_router)
app.include_router(api_keys_router)
app.include_router(kb_router)