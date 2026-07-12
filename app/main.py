"""FastAPI application entry point for Fashion Dress Mart."""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base  
from app.models import User            

from app.config import settings
from app.routers import (
    admin,
    auth,
    cart,
    categories,
    orders,
    payments,
    products,
    reviews,
    users,
    wishlist,
)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="Backend API for the Fashion Dress Mart e-commerce platform.",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Serve uploaded files and static assets.
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

_static_dir = Path("app/static")
if _static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")

# Register API routers under the versioned prefix.
_prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=_prefix)
app.include_router(users.router, prefix=_prefix)
app.include_router(products.router, prefix=_prefix)
app.include_router(categories.router, prefix=_prefix)
app.include_router(cart.router, prefix=_prefix)
app.include_router(orders.router, prefix=_prefix)
app.include_router(payments.router, prefix=_prefix)
app.include_router(wishlist.router, prefix=_prefix)
app.include_router(reviews.router, prefix=_prefix)
app.include_router(admin.router, prefix=_prefix)


@app.get("/", tags=["Health"])
def root() -> dict[str, str]:
    return {"name": settings.PROJECT_NAME, "status": "ok", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "healthy"}
