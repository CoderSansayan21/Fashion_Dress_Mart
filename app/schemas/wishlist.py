"""Wishlist Pydantic schemas."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductOut


class WishlistItemCreate(BaseModel):
    product_id: int


class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    created_at: datetime
    product: ProductOut
