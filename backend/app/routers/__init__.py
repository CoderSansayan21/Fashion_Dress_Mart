"""API routers package."""
from backend.app.routers import (
    wishlist,
)
from backend.app.routers import admin, auth, cart, categories, orders, payments, products, reviews, users

__all__ = [
    "admin",
    "auth",
    "cart",
    "categories",
    "orders",
    "payments",
    "products",
    "reviews",
    "users",
    "wishlist",
]
