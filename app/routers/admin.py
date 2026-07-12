"""Admin-only management routes (products, categories, orders, users)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import (
    PaginationParams,
    get_current_admin_user,
    get_db,
    pagination_params,
)
from app.models.category import Category
from app.models.user import User
from app.repository import order_repo, user_repo
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.schemas.order import OrderList, OrderOut, OrderStatusUpdate
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.schemas.user import UserOut
from app.services import order_service, product_service
from app.utils.helpers import unique_slug

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin_user)],
)


# --- Products ---
@router.post(
    "/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED
)
def create_product(
    payload: ProductCreate, db: Session = Depends(get_db)
) -> ProductOut:
    return product_service.create_product(db, payload)


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)
) -> ProductOut:
    return product_service.update_product(db, product_id, payload)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> None:
    product_service.delete_product(db, product_id)


# --- Categories ---
@router.post(
    "/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED
)
def create_category(
    payload: CategoryCreate, db: Session = Depends(get_db)
) -> Category:
    category = Category(
        name=payload.name,
        slug=unique_slug(payload.name),
        description=payload.description,
        image=payload.image,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)
) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)) -> None:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    db.delete(category)
    db.commit()


# --- Orders ---
@router.get("/orders", response_model=OrderList)
def list_all_orders(
    pagination: PaginationParams = Depends(pagination_params),
    db: Session = Depends(get_db),
) -> OrderList:
    items, total = order_repo.list_all(
        db, offset=pagination.offset, limit=pagination.limit
    )
    return OrderList(
        total=total,
        page=pagination.page,
        size=pagination.size,
        items=[OrderOut.model_validate(item) for item in items],
    )


@router.put("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)
) -> OrderOut:
    return order_service.update_status(db, order_id, payload.status)


# --- Users ---
@router.get("/users", response_model=list[UserOut])
def list_users(
    pagination: PaginationParams = Depends(pagination_params),
    db: Session = Depends(get_db),
) -> list[User]:
    return user_repo.list_users(
        db, offset=pagination.offset, limit=pagination.limit
    )


@router.put("/users/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(user_id: int, db: Session = Depends(get_db)) -> User:
    user = user_repo.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    user.is_active = False
    return user_repo.save(db, user)
