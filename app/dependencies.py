"""Common FastAPI dependencies reused across routers."""
from dataclasses import dataclass

from fastapi import Query

from app.core.auth import (
    get_current_active_user,
    get_current_admin_user,
    get_current_user,
    oauth2_scheme,
)
from app.database import get_db

__all__ = [
    "get_db",
    "get_current_user",
    "get_current_active_user",
    "get_current_admin_user",
    "oauth2_scheme",
    "PaginationParams",
    "pagination_params",
]


@dataclass
class PaginationParams:
    """Simple offset/limit pagination container."""

    page: int
    size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size

    @property
    def limit(self) -> int:
        return self.size


def pagination_params(
    page: int = Query(1, ge=1, description="1-based page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> PaginationParams:
    """Return validated pagination parameters from the query string."""
    return PaginationParams(page=page, size=size)
