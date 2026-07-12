"""SQLAlchemy models package.

Importing every model here ensures they are all registered on ``Base.metadata``
(needed for ``create_all`` and Alembic autogenerate).
"""
from app.models.cart import Cart, CartItem
from app.models.category import Category
from app.models.order import Order, OrderItem, OrderStatus
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.models.product import Product
from app.models.review import Review
from app.models.user import User, UserRole
from app.models.wishlist import WishlistItem

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
