"""Public product catalogue routes."""
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.dependencies import PaginationParams, get_db, pagination_params
from backend.app.schemas.product import ProductList, ProductOut
from backend.app.services import product_service

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=ProductList)
def list_products(
    pagination: PaginationParams = Depends(pagination_params),
    q: str | None = Query(None, description="Search by product name"),
    category_id: int | None = Query(None),
    min_price: Decimal | None = Query(None, ge=0),
    max_price: Decimal | None = Query(None, ge=0),
    is_featured: bool | None = Query(None),
    db: Session = Depends(get_db),
) -> ProductList:
    items, total = product_service.list_products(
        db,
        offset=pagination.offset,
        limit=pagination.limit,
        q=q,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        is_featured=is_featured,
    )
    return ProductList(
        total=total,
        page=pagination.page,
        size=pagination.size,
        items=[ProductOut.model_validate(item) for item in items],
    )


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)) -> ProductOut:
    return product_service.get_product(db, product_id)
