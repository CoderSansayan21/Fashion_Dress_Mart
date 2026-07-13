"""Order Pydantic schemas."""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from backend.app.models.order import OrderStatus


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name: str
    unit_price: Decimal
    quantity: int


class OrderCreate(BaseModel):
    """Create an order from the current user's cart."""

    shipping_address: str = Field(..., min_length=5)
    contact_phone: str | None = Field(None, max_length=30)
    note: str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    user_id: int
    status: OrderStatus
    total_amount: Decimal
    shipping_address: str
    contact_phone: str | None
    note: str | None
    created_at: datetime
    items: list[OrderItemOut]


class OrderList(BaseModel):
    total: int
    page: int
    size: int
    items: list[OrderOut]
