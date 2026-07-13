"""User and authentication Pydantic schemas."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from backend.app.models.user import UserRole


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(None, max_length=30)
    address: str | None = Field(None, max_length=500)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=150)
    phone: str | None = Field(None, max_length=30)
    address: str | None = Field(None, max_length=500)
    profile_image: str | None = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    profile_image: str | None = None
    created_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str
