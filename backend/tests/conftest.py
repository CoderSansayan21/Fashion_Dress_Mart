"""Shared pytest fixtures.

Tests run against an in-memory SQLite database so they need no external
PostgreSQL server. The production code targets PostgreSQL, but the ORM layer is
portable enough for these API-level tests.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base, get_db
from backend.app.main import app

engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    bind=engine, autocommit=False, autoflush=False, expire_on_commit=False
)


@pytest.fixture(autouse=True)
def _setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client):
    """Register + log in a customer and return Authorization headers."""
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test Customer",
            "email": "customer@example.com",
            "password": "password123",
        },
    )
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "customer@example.com", "password": "password123"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_headers(client):
    """Create an admin user directly in the DB and return auth headers."""
    from backend.app.core.hashing import hash_password
    from backend.app.models.user import User, UserRole

    db = TestingSessionLocal()
    try:
        admin = User(
            full_name="Admin User",
            email="admin@example.com",
            hashed_password=hash_password("password123"),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()

    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@example.com", "password": "password123"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
