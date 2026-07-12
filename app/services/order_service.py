"""Order business logic: build orders from the user's cart."""
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus
from app.repository import cart_repo, order_repo
from app.schemas.order import OrderCreate


def _effective_price(product) -> Decimal:
    if product.discount_price is not None:
        return Decimal(product.discount_price)
    return Decimal(product.price)


def create_order_from_cart(
    db: Session, user_id: int, payload: OrderCreate
) -> Order:
    """Convert the user's current cart into a pending order."""
    cart = cart_repo.get_by_user(db, user_id)
    if cart is None or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty"
        )

    order_items: list[OrderItem] = []
    total = Decimal("0")
    for item in cart.items:
        product = item.product
        if product is None or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A product in your cart is no longer available",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'",
            )
        unit_price = _effective_price(product)
        total += unit_price * item.quantity
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                unit_price=unit_price,
                quantity=item.quantity,
            )
        )
        product.stock -= item.quantity

    from app.utils.helpers import generate_order_number

    order = Order(
        order_number=generate_order_number(),
        user_id=user_id,
        status=OrderStatus.PENDING,
        total_amount=total,
        shipping_address=payload.shipping_address,
        contact_phone=payload.contact_phone,
        note=payload.note,
        items=order_items,
    )
    db.add(order)
    cart_repo.clear(db, cart)
    db.commit()
    db.refresh(order)
    return order


def get_order(db: Session, order_id: int, user_id: int, is_admin: bool) -> Order:
    order = order_repo.get_by_id(db, order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    if not is_admin and order.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order",
        )
    return order


def update_status(db: Session, order_id: int, new_status: OrderStatus) -> Order:
    order = order_repo.get_by_id(db, order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    order.status = new_status
    return order_repo.save(db, order)
