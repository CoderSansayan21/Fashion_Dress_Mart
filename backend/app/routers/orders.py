"""Order routes for the authenticated user."""
from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from backend.app.dependencies import (
    PaginationParams,
    get_current_active_user,
    get_db,
    pagination_params,
)
from backend.app.models.user import User
from backend.app.repository import order_repo
from backend.app.schemas.order import OrderCreate, OrderList, OrderOut
from backend.app.services import order_service
from backend.app.services import email_service

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> OrderOut:
    order = order_service.create_order_from_cart(db, current_user.id, payload)
    background_tasks.add_task(
        email_service.send_order_confirmation, current_user, order
    )
    return order


@router.get("", response_model=OrderList)
def list_my_orders(
    pagination: PaginationParams = Depends(pagination_params),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> OrderList:
    items, total = order_repo.list_for_user(
        db, current_user.id, offset=pagination.offset, limit=pagination.limit
    )
    return OrderList(
        total=total,
        page=pagination.page,
        size=pagination.size,
        items=[OrderOut.model_validate(item) for item in items],
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> OrderOut:
    return order_service.get_order(
        db, order_id, current_user.id, is_admin=False
    )
