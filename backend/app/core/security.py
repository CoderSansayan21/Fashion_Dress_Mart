"""JWT token creation and decoding utilities."""
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt.exceptions import InvalidTokenError

from backend.app.config import settings


def _create_token(subject: str, expires_delta: timedelta, token_type: str) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload: dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": token_type,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(
    subject: str, expires_delta: timedelta | None = None
) -> str:
    """Create a short-lived access token for ``subject`` (usually the user id)."""
    delta = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token(subject, delta, "access")


def create_refresh_token(
    subject: str, expires_delta: timedelta | None = None
) -> str:
    """Create a long-lived refresh token for ``subject``."""
    delta = expires_delta or timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    return _create_token(subject, delta, "refresh")


def decode_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT. Returns the payload or ``None`` if invalid."""
    try:
        return jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except InvalidTokenError:
        return None
