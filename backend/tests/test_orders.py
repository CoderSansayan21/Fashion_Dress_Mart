"""Tests for the cart -> order -> payment flow."""


def _seed_product(client, admin_headers, stock=10, price="30.00"):
    resp = client.post(
        "/api/v1/admin/products",
        json={"name": "Test Dress", "price": price, "stock": stock},
        headers=admin_headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_full_checkout_flow(client, admin_headers, auth_headers):
    product = _seed_product(client, admin_headers)

    add = client.post(
        "/api/v1/cart/items",
        json={"product_id": product["id"], "quantity": 2},
        headers=auth_headers,
    )
    assert add.status_code == 201, add.text
    cart = add.json()
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 2
    assert str(cart["total"]) == "60.00"

    order_resp = client.post(
        "/api/v1/orders",
        json={"shipping_address": "123 Fashion Ave", "contact_phone": "555-1234"},
        headers=auth_headers,
    )
    assert order_resp.status_code == 201, order_resp.text
    order = order_resp.json()
    assert order["status"] == "pending"
    assert str(order["total_amount"]) == "60.00"
    assert len(order["items"]) == 1

    # Cart is cleared after ordering.
    cart_after = client.get("/api/v1/cart", headers=auth_headers).json()
    assert cart_after["items"] == []

    pay = client.post(
        "/api/v1/payments",
        json={"order_id": order["id"], "method": "card"},
        headers=auth_headers,
    )
    assert pay.status_code == 201, pay.text
    assert pay.json()["status"] == "completed"

    refreshed = client.get(
        f"/api/v1/orders/{order['id']}", headers=auth_headers
    ).json()
    assert refreshed["status"] == "paid"


def test_order_requires_non_empty_cart(client, auth_headers):
    resp = client.post(
        "/api/v1/orders",
        json={"shipping_address": "123 Fashion Ave"},
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_cannot_order_more_than_stock(client, admin_headers, auth_headers):
    product = _seed_product(client, admin_headers, stock=1)
    client.post(
        "/api/v1/cart/items",
        json={"product_id": product["id"], "quantity": 5},
        headers=auth_headers,
    )
    resp = client.post(
        "/api/v1/orders",
        json={"shipping_address": "123 Fashion Ave"},
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_user_cannot_view_others_order(client, admin_headers, auth_headers):
    product = _seed_product(client, admin_headers)
    client.post(
        "/api/v1/cart/items",
        json={"product_id": product["id"], "quantity": 1},
        headers=auth_headers,
    )
    order = client.post(
        "/api/v1/orders",
        json={"shipping_address": "123 Fashion Ave"},
        headers=auth_headers,
    ).json()

    # Register a second user.
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Other User",
            "email": "other@example.com",
            "password": "password123",
        },
    )
    other_login = client.post(
        "/api/v1/auth/login",
        data={"username": "other@example.com", "password": "password123"},
    )
    other_headers = {
        "Authorization": f"Bearer {other_login.json()['access_token']}"
    }
    resp = client.get(
        f"/api/v1/orders/{order['id']}", headers=other_headers
    )
    assert resp.status_code == 403
