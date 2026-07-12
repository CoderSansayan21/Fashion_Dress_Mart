# Fashion Dress Mart — Backend

Advanced FastAPI + PostgreSQL backend for the **Fashion Dress Mart** e-commerce
platform. It provides authentication, a product catalogue, cart, orders,
payments, wishlist and reviews, plus an admin API.

## Tech stack

- **FastAPI** — web framework
- **SQLAlchemy 2.0** — ORM (typed, `Mapped[...]` style)
- **PostgreSQL** (via `psycopg` 3) — database
- **Alembic** — migrations
- **Pydantic v2** / **pydantic-settings** — schemas & configuration
- **PyJWT** + **passlib[bcrypt]** — auth (JWT access/refresh, hashed passwords)
- **pytest** + **httpx** — tests

## Project structure

```
backend/
├── app/
│   ├── main.py            # FastAPI entry point
│   ├── config.py          # Settings from environment variables
│   ├── database.py        # PostgreSQL connection & session
│   ├── dependencies.py    # Common dependencies (auth, pagination)
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   ├── routers/           # API routes
│   ├── services/          # Business logic
│   ├── repository/        # Database queries
│   ├── core/              # security (JWT), hashing, auth
│   ├── utils/             # image upload, validators, helpers, email
│   ├── uploads/           # user-uploaded images (gitignored)
│   └── static/            # static assets
├── migrations/            # Alembic migrations
├── tests/                 # pytest test suite
├── requirements.txt
├── .env.example
├── alembic.ini
└── run.py
```

## Getting started

### 1. Create a virtual environment & install dependencies

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# edit .env — set DATABASE_URL and a strong SECRET_KEY
```

Create the PostgreSQL database referenced by `DATABASE_URL`, e.g.:

```bash
createdb fashion_dress_mart
```

### 3. Run migrations

```bash
alembic revision --autogenerate -m "initial schema"   # first time
alembic upgrade head
```

### 4. Run the server

```bash
python run.py
# or: uvicorn app.main:app --reload
```

- API docs (Swagger UI): http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

All API routes are served under the `/api/v1` prefix.

## Running tests

Tests use an in-memory SQLite database, so no PostgreSQL is required:

```bash
pytest
```

## Linting

```bash
ruff check .
```

## API overview

| Area        | Prefix                 | Notes                                    |
|-------------|------------------------|------------------------------------------|
| Auth        | `/api/v1/auth`         | register, login (OAuth2), refresh        |
| Users       | `/api/v1/users`        | profile (`/me`), avatar upload           |
| Products    | `/api/v1/products`     | public catalogue with search/filters     |
| Categories  | `/api/v1/categories`   | public listing                           |
| Cart        | `/api/v1/cart`         | authenticated cart management            |
| Orders      | `/api/v1/orders`       | checkout from cart, order history        |
| Payments    | `/api/v1/payments`     | stub payment gateway                     |
| Wishlist    | `/api/v1/wishlist`     | authenticated wishlist                   |
| Reviews     | `/api/v1/reviews`      | product reviews (1–5 stars)              |
| Admin       | `/api/v1/admin`        | admin-only management (products, orders) |

> The default admin account is not seeded automatically. Create one by
> registering a user and updating its `role` to `admin` in the database, or add
> a seeding script.
