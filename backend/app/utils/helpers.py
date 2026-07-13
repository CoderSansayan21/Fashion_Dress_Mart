"""Miscellaneous helper functions."""
import re
import secrets
import unicodedata
from datetime import datetime, timezone


def slugify(value: str) -> str:
    """Convert an arbitrary string into a URL-safe slug."""
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = re.sub(r"[^\w\s-]", "", value).strip().lower()
    return re.sub(r"[-\s]+", "-", value) or "item"


def unique_slug(value: str) -> str:
    """Return a slug with a short random suffix to reduce collisions."""
    return f"{slugify(value)}-{secrets.token_hex(3)}"


def generate_order_number() -> str:
    """Generate a human-readable, unique-ish order number."""
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"ORD-{stamp}-{secrets.token_hex(2).upper()}"


def generate_transaction_id() -> str:
    """Generate a pseudo transaction id for the stub payment gateway."""
    return f"TXN-{secrets.token_hex(8).upper()}"
