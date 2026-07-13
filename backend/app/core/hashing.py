"""Password hashing helpers built on top of passlib/bcrypt."""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Return a salted bcrypt hash for ``password``."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return ``True`` if ``plain_password`` matches ``hashed_password``."""
    return pwd_context.verify(plain_password, hashed_password)
