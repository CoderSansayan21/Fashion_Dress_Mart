"""Product Pydantic schemas."""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryOut


class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: str | None = None
    price: Decimal = Field(..., ge=0, decimal_places=2)
    discount_price: Decimal | None = Field(None, ge=0, decimal_places=2)
    stock: int = Field(0, ge=0)
    sku: str | None = Field(None, max_length=80)
    brand: str | None = Field(None, max_length=120)
    size: str | None = Field(None, max_length=80)
    color: str | None = Field(None, max_length=80)
    material: str | None = Field(None, max_length=120)
    image_url: str | None = None
    is_active: bool = True
    is_featured: bool = False
    category_id: int | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    description: str | None = None
    price: Decimal | None = Field(None, ge=0, decimal_places=2)
    discount_price: Decimal | None = Field(None, ge=0, decimal_places=2)
    stock: int | None = Field(None, ge=0)
    sku: str | None = Field(None, max_length=80)
    brand: str | None = Field(None, max_length=120)
    size: str | None = Field(None, max_length=80)
    color: str | None = Field(None, max_length=80)
    material: str | None = Field(None, max_length=120)
    image_url: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    category_id: int | None = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    category: CategoryOut | None = None


class ProductList(BaseModel):
    total: int
    page: int
    size: int
    items: list[ProductOut]
