"""SQLAlchemy models package.

Importing every model here ensures they are all registered on ``Base.metadata``
(needed for ``create_all`` and Alembic autogenerate).
"""
from backend.app.models.cart import Cart, CartItem
from backend.app.models.category import Category
from backend.app.models.order import Order, OrderItem, OrderStatus
from backend.app.models.payment import Payment, PaymentMethod, PaymentStatus
from backend.app.models.product import Product
from backend.app.models.review import Review
from backend.app.models.user import User, UserRole
from backend.app.models.wishlist import WishlistItem

__all__ = [
    "Cart",
    "CartItem",
    "Category",
    "Order",
    "OrderItem",
    "OrderStatus",
    "Payment",
    "PaymentMethod",
    "PaymentStatus",
    "Product",
    "Review",
    "User",
    "UserRole",
    "WishlistItem",
]
