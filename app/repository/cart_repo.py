"""Database queries related to shopping carts."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem


def get_by_user(db: Session, user_id: int) -> Cart | None:
    return db.scalar(select(Cart).where(Cart.user_id == user_id))


def get_or_create(db: Session, user_id: int) -> Cart:
    cart = get_by_user(db, user_id)
    if cart is None:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def get_item(db: Session, cart_id: int, product_id: int) -> CartItem | None:
    return db.scalar(
        select(CartItem).where(
            CartItem.cart_id == cart_id, CartItem.product_id == product_id
        )
    )


def get_item_by_id(db: Session, item_id: int) -> CartItem | None:
    return db.get(CartItem, item_id)


def add_item(db: Session, item: CartItem) -> CartItem:
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def save(db: Session) -> None:
    db.commit()


def remove_item(db: Session, item: CartItem) -> None:
    db.delete(item)
    db.commit()


def clear(db: Session, cart: Cart) -> None:
    for item in list(cart.items):
        db.delete(item)
    db.commit()
