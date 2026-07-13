"""Tests for product catalogue and admin product management."""


def _create_product(client, admin_headers, **overrides):
    payload = {
        "name": "Summer Floral Dress",
        "description": "A light floral dress",
        "price": "49.99",
        "stock": 10,
        "is_featured": True,
    }
    payload.update(overrides)
    return client.post("/api/v1/admin/products", json=payload, headers=admin_headers)


def test_admin_can_create_product(client, admin_headers):
    resp = _create_product(client, admin_headers)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["name"] == "Summer Floral Dress"
    assert body["slug"].startswith("summer-floral-dress")


def test_customer_cannot_create_product(client, auth_headers):
    resp = _create_product(client, auth_headers)
    assert resp.status_code == 403


def test_list_and_get_product(client, admin_headers):
    created = _create_product(client, admin_headers).json()

    listing = client.get("/api/v1/products")
    assert listing.status_code == 200
    data = listing.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1

    detail = client.get(f"/api/v1/products/{created['id']}")
    assert detail.status_code == 200
    assert detail.json()["id"] == created["id"]


def test_product_search_filter(client, admin_headers):
    _create_product(client, admin_headers, name="Red Gown")
    _create_product(client, admin_headers, name="Blue Jeans")

    resp = client.get("/api/v1/products", params={"q": "gown"})
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 1
    assert items[0]["name"] == "Red Gown"


def test_update_and_delete_product(client, admin_headers):
    created = _create_product(client, admin_headers).json()
    pid = created["id"]

    updated = client.put(
        f"/api/v1/admin/products/{pid}",
        json={"price": "59.99", "stock": 5},
        headers=admin_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["stock"] == 5

    deleted = client.delete(
        f"/api/v1/admin/products/{pid}", headers=admin_headers
    )
    assert deleted.status_code == 204
    assert client.get(f"/api/v1/products/{pid}").status_code == 404
