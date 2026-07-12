"""Product review routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_current_active_user, get_db
from app.models.review import Review
from app.models.user import User
from app.repository import product_repo
from app.schemas.review import ReviewCreate, ReviewOut, ReviewUpdate

router = APIRouter(tags=["Reviews"])


@router.get("/products/{product_id}/reviews", response_model=list[ReviewOut])
def list_reviews(product_id: int, db: Session = Depends(get_db)) -> list[Review]:
    stmt = (
        select(Review)
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
    )
    return list(db.scalars(stmt).all())


@router.post(
    "/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED
)
def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Review:
    if product_repo.get_by_id(db, payload.product_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    existing = db.scalar(
        select(Review).where(
            Review.user_id == current_user.id,
            Review.product_id == payload.product_id,
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this product",
        )
    review = Review(
        user_id=current_user.id,
        product_id=payload.product_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.put("/reviews/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Review:
    review = db.get(Review, review_id)
    if review is None or review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Review not found"
        )
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(review, field, value)
    db.commit()
    db.refresh(review)
    return review


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    review = db.get(Review, review_id)
    if review is None or review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Review not found"
        )
    db.delete(review)
    db.commit()
