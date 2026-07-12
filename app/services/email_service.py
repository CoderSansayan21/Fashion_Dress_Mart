"""High-level transactional email helpers."""
from app.config import settings
from app.models.order import Order
from app.models.user import User
from app.utils.email import send_email


def send_welcome_email(user: User) -> bool:
    subject = f"Welcome to {settings.PROJECT_NAME}!"
    body = (
        f"Hi {user.full_name},\n\n"
        f"Thanks for joining {settings.PROJECT_NAME}. Happy shopping!\n"
    )
    return send_email(user.email, subject, body)


def send_order_confirmation(user: User, order: Order) -> bool:
    subject = f"Order {order.order_number} confirmed"
    body = (
        f"Hi {user.full_name},\n\n"
        f"We've received your order {order.order_number}.\n"
        f"Total: {order.total_amount}\n\n"
        f"Thank you for shopping with {settings.PROJECT_NAME}!\n"
    )
    return send_email(user.email, subject, body)
