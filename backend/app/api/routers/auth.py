from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, verify_credentials
from app.schemas.auth import LoginRequest, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
def login(payload: LoginRequest):
    if not verify_credentials(payload.username, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
        )
    token = create_access_token(subject=payload.username)
    return TokenOut(access_token=token)
