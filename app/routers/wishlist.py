"""Wishlist routes for the authenticated user."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_active_user, get_db
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.repository import product_repo
from app.schemas.wishlist import WishlistItemCreate, WishlistItemOut

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=list[WishlistItemOut])
def list_wishlist(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[WishlistItem]:
    stmt = (
        select(WishlistItem)
        .where(WishlistItem.user_id == current_user.id)
        .order_by(WishlistItem.created_at.desc())
    )
    return list(db.scalars(stmt).all())


@router.post("", response_model=WishlistItemOut, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    payload: WishlistItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> WishlistItem:
    product = product_repo.get_by_id(db, payload.product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    existing = db.scalar(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == payload.product_id,
        )
    )
    if existing:
        return existing
    item = WishlistItem(user_id=current_user.id, product_id=payload.product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    item = db.scalar(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
    )
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found"
        )
    db.delete(item)
    db.commit()
