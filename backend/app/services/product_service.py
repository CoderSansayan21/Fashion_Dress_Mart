"""Product business logic."""
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.models.product import Product
from backend.app.repository import product_repo
from backend.app.schemas.product import ProductCreate, ProductUpdate
from backend.app.utils.helpers import unique_slug


def get_product(db: Session, product_id: int) -> Product:
    product = product_repo.get_by_id(db, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    return product


def list_products(
    db: Session,
    *,
    offset: int,
    limit: int,
    q: str | None = None,
    category_id: int | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    is_featured: bool | None = None,
) -> tuple[list[Product], int]:
    return product_repo.search(
        db,
        offset=offset,
        limit=limit,
        q=q,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        is_featured=is_featured,
    )


def create_product(db: Session, payload: ProductCreate) -> Product:
    product = Product(
        **payload.model_dump(exclude_unset=False),
        slug=unique_slug(payload.name),
    )
    return product_repo.create(db, product)


def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    product = get_product(db, product_id)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(product, field, value)
    return product_repo.save(db, product)


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    product_repo.delete(db, product)


def adjust_stock(db: Session, product: Product, delta: int) -> None:
    """Increase/decrease stock; raise if it would go negative."""
    new_stock = product.stock + delta
    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock for '{product.name}'",
        )
    product.stock = new_stock
    product_repo.save(db, product)
