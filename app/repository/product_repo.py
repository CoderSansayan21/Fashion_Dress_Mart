"""Database queries related to products."""
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product


def get_by_id(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def get_by_slug(db: Session, slug: str) -> Product | None:
    return db.scalar(select(Product).where(Product.slug == slug))


def search(
    db: Session,
    *,
    offset: int = 0,
    limit: int = 20,
    q: str | None = None,
    category_id: int | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    is_featured: bool | None = None,
    active_only: bool = True,
) -> tuple[list[Product], int]:
    """Return a filtered page of products plus the total match count."""
    conditions = []
    if active_only:
        conditions.append(Product.is_active.is_(True))
    if q:
        conditions.append(Product.name.ilike(f"%{q}%"))
    if category_id is not None:
        conditions.append(Product.category_id == category_id)
    if min_price is not None:
        conditions.append(Product.price >= min_price)
    if max_price is not None:
        conditions.append(Product.price <= max_price)
    if is_featured is not None:
        conditions.append(Product.is_featured.is_(is_featured))

    base = select(Product)
    count_stmt = select(func.count()).select_from(Product)
    for condition in conditions:
        base = base.where(condition)
        count_stmt = count_stmt.where(condition)

    total = db.scalar(count_stmt) or 0
    stmt = base.order_by(Product.created_at.desc()).offset(offset).limit(limit)
    items = list(db.scalars(stmt).all())
    return items, total


def create(db: Session, product: Product) -> Product:
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def save(db: Session, product: Product) -> Product:
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def delete(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()
