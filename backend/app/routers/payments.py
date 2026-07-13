"""Payment routes for the authenticated user."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.dependencies import get_current_active_user, get_db
from backend.app.models.user import User
from backend.app.repository import order_repo
from backend.app.schemas.payment import PaymentCreate, PaymentOut
from backend.app.services import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def pay(
    payload: PaymentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> PaymentOut:
    return payment_service.process_payment(db, current_user.id, payload)


@router.get("/order/{order_id}", response_model=PaymentOut)
def get_payment_for_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> PaymentOut:
    order = order_repo.get_by_id(db, order_id)
    if order is None or order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    if order.payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No payment found for this order",
        )
    return order.payment
