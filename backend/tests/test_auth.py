"""Tests for authentication flows."""


def test_register_and_login(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "password": "password123",
        },
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["email"] == "jane@example.com"
    assert body["role"] == "customer"

    login = client.post(
        "/api/v1/auth/login",
        data={"username": "jane@example.com", "password": "password123"},
    )
    assert login.status_code == 200, login.text
    tokens = login.json()
    assert tokens["access_token"]
    assert tokens["refresh_token"]
    assert tokens["token_type"] == "bearer"


def test_duplicate_email_rejected(client):
    payload = {
        "full_name": "Dup User",
        "email": "dup@example.com",
        "password": "password123",
    }
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201
    assert client.post("/api/v1/auth/register", json=payload).status_code == 409


def test_login_wrong_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Wrong Pass",
            "email": "wrong@example.com",
            "password": "password123",
        },
    )
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@example.com", "password": "badpassword"},
    )
    assert resp.status_code == 401


def test_me_requires_auth(client):
    assert client.get("/api/v1/users/me").status_code == 401


def test_me_returns_current_user(client, auth_headers):
    resp = client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "customer@example.com"


def test_refresh_token(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Refresh User",
            "email": "refresh@example.com",
            "password": "password123",
        },
    )
    login = client.post(
        "/api/v1/auth/login",
        data={"username": "refresh@example.com", "password": "password123"},
    )
    refresh_token = login.json()["refresh_token"]
    resp = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert resp.status_code == 200
    assert resp.json()["access_token"]
