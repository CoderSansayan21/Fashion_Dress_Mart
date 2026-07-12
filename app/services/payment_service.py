"""Payment business logic (stub gateway).

This simulates a payment provider. In production, replace ``_charge`` with a
real integration (Stripe, PayPal, etc.).
"""
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.order import Order, OrderStatus
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.repository import order_repo
from app.schemas.payment import PaymentCreate
from app.utils.helpers import generate_transaction_id


def _charge(amount: Decimal, method: PaymentMethod) -> PaymentStatus:
    """Simulate charging a payment method."""
    # A real gateway call would happen here.
    return PaymentStatus.COMPLETED


def process_payment(db: Session, user_id: int, payload: PaymentCreate) -> Payment:
    order: Order | None = order_repo.get_by_id(db, payload.order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    if order.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order",
        )
    if order.payment is not None and order.payment.status == PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This order has already been paid",
        )

    result = _charge(Decimal(order.total_amount), payload.method)
    payment = Payment(
        order_id=order.id,
        transaction_id=generate_transaction_id(),
        amount=order.total_amount,
        currency=settings.PAYMENT_CURRENCY,
        method=payload.method,
        status=result,
    )
    db.add(payment)

    if result == PaymentStatus.COMPLETED:
        order.status = OrderStatus.PAID

    db.commit()
    db.refresh(payment)
    return payment
