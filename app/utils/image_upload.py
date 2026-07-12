"""Image upload handling for products and profiles."""
import os
import secrets
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import settings

_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _validate(file: UploadFile) -> str:
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type: {file.content_type}",
        )
    return _EXTENSIONS.get(file.content_type, ".bin")


def save_image(file: UploadFile, subfolder: str = "products") -> str:
    """Persist an uploaded image and return its public relative path.

    ``subfolder`` is typically ``products`` or ``profile``.
    """
    extension = _validate(file)
    target_dir = Path(settings.UPLOAD_DIR) / subfolder
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{secrets.token_hex(16)}{extension}"
    destination = target_dir / filename

    contents = file.file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Uploaded image exceeds the maximum allowed size",
        )
    with open(destination, "wb") as buffer:
        buffer.write(contents)

    return f"/uploads/{subfolder}/{filename}"


def delete_image(relative_path: str) -> None:
    """Best-effort deletion of a previously stored image."""
    if not relative_path:
        return
    normalized = relative_path.lstrip("/").removeprefix("uploads/")
    full_path = Path(settings.UPLOAD_DIR) / normalized
    if full_path.exists():
        os.remove(full_path)
