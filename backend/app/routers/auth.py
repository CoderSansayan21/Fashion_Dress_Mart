"""Authentication routes: register, login, refresh."""
from fastapi import APIRouter, BackgroundTasks, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.dependencies import get_db
from backend.app.schemas.user import Token, TokenRefresh, UserCreate, UserOut
from backend.app.services import email_service
from backend.app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> UserOut:
    user = auth_service.register_user(db, payload)
    background_tasks.add_task(email_service.send_welcome_email, user)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """OAuth2 password flow. ``username`` is the user's email."""
    user = auth_service.authenticate(db, form_data.username, form_data.password)
    return auth_service.issue_tokens(user)


@router.post("/refresh", response_model=Token)
def refresh(payload: TokenRefresh, db: Session = Depends(get_db)) -> Token:
    return auth_service.refresh_tokens(db, payload.refresh_token)

