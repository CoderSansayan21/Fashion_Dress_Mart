"""Database queries related to orders."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.order import Order


def get_by_id(db: Session, order_id: int) -> Order | None:
    return db.get(Order, order_id)


def get_by_number(db: Session, order_number: str) -> Order | None:
    return db.scalar(select(Order).where(Order.order_number == order_number))


def list_for_user(
    db: Session, user_id: int, offset: int = 0, limit: int = 20
) -> tuple[list[Order], int]:
    condition = Order.user_id == user_id
    total = db.scalar(
        select(func.count()).select_from(Order).where(condition)
    ) or 0
    stmt = (
        select(Order)
        .where(condition)
        .order_by(Order.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(db.scalars(stmt).all()), total


def list_all(
    db: Session, offset: int = 0, limit: int = 20
) -> tuple[list[Order], int]:
    total = db.scalar(select(func.count()).select_from(Order)) or 0
    stmt = (
        select(Order).order_by(Order.created_at.desc()).offset(offset).limit(limit)
    )
    return list(db.scalars(stmt).all()), total


def create(db: Session, order: Order) -> Order:
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def save(db: Session, order: Order) -> Order:
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
