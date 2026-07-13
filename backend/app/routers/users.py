"""Current-user profile routes."""
from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from backend.app.dependencies import get_current_active_user, get_db
from backend.app.models.user import User
from backend.app.repository import user_repo
from backend.app.schemas.user import UserOut, UserUpdate
from backend.app.utils.image_upload import save_image

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> User:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(current_user, field, value)
    return user_repo.save(db, current_user)


@router.post("/me/avatar", response_model=UserOut)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> User:
    current_user.profile_image = save_image(file, subfolder="profile")
    return user_repo.save(db, current_user)
