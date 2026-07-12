"""Payment Pydantic schemas."""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.payment import PaymentMethod, PaymentStatus


class PaymentCreate(BaseModel):
    order_id: int
    method: PaymentMethod


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    transaction_id: str
    amount: Decimal
    currency: str
    method: PaymentMethod
    status: PaymentStatus
    created_at: datetime
