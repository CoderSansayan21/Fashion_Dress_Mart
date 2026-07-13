"""Shopping cart routes for the authenticated user."""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.dependencies import get_current_active_user, get_db
from backend.app.models.cart import Cart, CartItem
from backend.app.models.user import User
from backend.app.repository import product_repo
from backend.app.schemas.cart import CartItemCreate, CartItemUpdate, CartOut
from backend.app.repository import cart_repo

router = APIRouter(prefix="/cart", tags=["Cart"])


def _cart_total(cart: Cart) -> Decimal:
    total = Decimal("0")
    for item in cart.items:
        product = item.product
        if product is None:
            continue
        price = (
            Decimal(product.discount_price)
            if product.discount_price is not None
            else Decimal(product.price)
        )
        total += price * item.quantity
    return total


def _serialize(cart: Cart) -> CartOut:
    out = CartOut.model_validate(cart)
    out.total = _cart_total(cart)
    return out


@router.get("", response_model=CartOut)
def get_cart(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> CartOut:
    cart = cart_repo.get_or_create(db, current_user.id)
    return _serialize(cart)


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_item(
    payload: CartItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> CartOut:
    product = product_repo.get_by_id(db, payload.product_id)
    if product is None or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    cart = cart_repo.get_or_create(db, current_user.id)
    existing = cart_repo.get_item(db, cart.id, payload.product_id)
    if existing:
        existing.quantity += payload.quantity
        cart_repo.save(db)
    else:
        cart_repo.add_item(
            db,
            CartItem(
                cart_id=cart.id,
                product_id=payload.product_id,
                quantity=payload.quantity,
            ),
        )
    db.refresh(cart)
    return _serialize(cart)


@router.put("/items/{item_id}", response_model=CartOut)
def update_item(
    item_id: int,
    payload: CartItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> CartOut:
    item = cart_repo.get_item_by_id(db, item_id)
    cart = cart_repo.get_or_create(db, current_user.id)
    if item is None or item.cart_id != cart.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found"
        )
    item.quantity = payload.quantity
    cart_repo.save(db)
    db.refresh(cart)
    return _serialize(cart)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> CartOut:
    item = cart_repo.get_item_by_id(db, item_id)
    cart = cart_repo.get_or_create(db, current_user.id)
    if item is None or item.cart_id != cart.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found"
        )
    cart_repo.remove_item(db, item)
    db.refresh(cart)
    return _serialize(cart)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    cart = cart_repo.get_or_create(db, current_user.id)
    cart_repo.clear(db, cart)
