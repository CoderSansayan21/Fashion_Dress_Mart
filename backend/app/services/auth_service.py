"""Authentication business logic."""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.hashing import hash_password, verify_password
from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from backend.app.models.user import User
from backend.app.repository import user_repo
from backend.app.schemas.user import Token, UserCreate


def register_user(db: Session, payload: UserCreate) -> User:
    """Create a new user, rejecting duplicate emails."""
    if user_repo.get_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
        hashed_password=hash_password(payload.password),
    )
    return user_repo.create(db, user)


def authenticate(db: Session, email: str, password: str) -> User:
    """Validate credentials and return the user or raise 401."""
    user = user_repo.get_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account"
        )
    return user


def issue_tokens(user: User) -> Token:
    """Create access and refresh tokens for a user."""
    return Token(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


def refresh_tokens(db: Session, refresh_token: str) -> Token:
    """Exchange a valid refresh token for a new token pair."""
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    user = user_repo.get_by_id(db, int(payload["sub"]))
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    return issue_tokens(user)
