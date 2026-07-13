"""Database queries related to users."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.user import User


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def list_users(db: Session, offset: int = 0, limit: int = 20) -> list[User]:
    stmt = select(User).order_by(User.id).offset(offset).limit(limit)
    return list(db.scalars(stmt).all())


def create(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def save(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
