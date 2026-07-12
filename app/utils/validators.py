"""Reusable validation helpers."""
import re

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_PHONE_RE = re.compile(r"^\+?[0-9\s\-()]{7,20}$")


def is_valid_email(email: str) -> bool:
    """Lightweight email format check."""
    return bool(_EMAIL_RE.match(email or ""))


def is_valid_phone(phone: str) -> bool:
    """Lightweight phone number format check."""
    return bool(_PHONE_RE.match(phone or ""))


def is_strong_password(password: str) -> bool:
    """Require at least 8 chars with letters and digits."""
    if len(password or "") < 8:
        return False
    has_letter = any(c.isalpha() for c in password)
    has_digit = any(c.isdigit() for c in password)
    return has_letter and has_digit
