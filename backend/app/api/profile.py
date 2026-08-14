from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from pathlib import Path
import uuid
import shutil

from app.database import get_db
from app.models.user import User
from app.api.auth import get_current_user


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


# =========================================================
# PROFILE IMAGE DIRECTORY
# =========================================================

PROFILE_UPLOAD_DIR = Path("uploads/profile")

PROFILE_UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# PYDANTIC SCHEMA - UPDATE PROFILE
# =========================================================

class ProfileUpdate(BaseModel):

    name: Optional[str] = None

    email: Optional[EmailStr] = None


# =========================================================
# GET CURRENT USER PROFILE
# =========================================================

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):

    return {

        "id": current_user.id,

        "fintwin_user_id": current_user.fintwin_user_id,

        "name": getattr(
            current_user,
            "name",
            None
        ),

        "email": current_user.email,

        "profile_picture": current_user.profile_picture,

        "account": {

            "user_id": current_user.id,

            "account_status": "Active",

            "authentication": "JWT",

        }

    }


# =========================================================
# UPDATE CURRENT USER PROFILE
# =========================================================

@router.put("/me")
def update_my_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # -----------------------------------------------------
    # UPDATE NAME
    # -----------------------------------------------------

    if profile_data.name is not None:

        name = profile_data.name.strip()

        if len(name) < 2:

            raise HTTPException(
                status_code=400,
                detail="Name must contain at least 2 characters."
            )

        current_user.name = name


    # -----------------------------------------------------
    # UPDATE EMAIL
    # -----------------------------------------------------

    if profile_data.email is not None:

        new_email = profile_data.email.lower().strip()

        # Check whether another user already uses email
        existing_user = (
            db.query(User)
            .filter(
                User.email == new_email,
                User.id != current_user.id
            )
            .first()
        )

        if existing_user:

            raise HTTPException(
                status_code=400,
                detail="Email is already registered."
            )

        current_user.email = new_email


    # -----------------------------------------------------
    # SAVE CHANGES
    # -----------------------------------------------------

    db.commit()

    db.refresh(current_user)


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "message": "Profile updated successfully.",

        "profile": {

            "id": current_user.id,

            "fintwin_user_id": current_user.fintwin_user_id,

            "name": current_user.name,

            "email": current_user.email,

            "profile_picture": current_user.profile_picture,

            "account_status": "Active"

        }

    }


# =========================================================
# UPLOAD PROFILE PICTURE
# =========================================================

@router.post("/photo")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # -----------------------------------------------------
    # CHECK FILE TYPE
    # -----------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp"
    }

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed."
        )


    # -----------------------------------------------------
    # CHECK FILE NAME
    # -----------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Invalid image file."
        )


    # -----------------------------------------------------
    # GENERATE UNIQUE FILE NAME
    # -----------------------------------------------------

    extension = Path(file.filename).suffix.lower()

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail="Invalid image extension."
        )


    unique_filename = (
        f"{current_user.fintwin_user_id}"
        f"_{uuid.uuid4().hex}"
        f"{extension}"
    )


    file_path = PROFILE_UPLOAD_DIR / unique_filename


    # -----------------------------------------------------
    # SAVE IMAGE
    # -----------------------------------------------------

    try:

        with file_path.open("wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail="Unable to save profile picture."
        ) from exc


    # -----------------------------------------------------
    # DELETE OLD PROFILE PICTURE
    # -----------------------------------------------------

    old_picture = current_user.profile_picture

    if old_picture:

        old_filename = Path(old_picture).name

        old_path = PROFILE_UPLOAD_DIR / old_filename

        try:

            if old_path.exists():

                old_path.unlink()

        except Exception:

            # Do not fail the request just because
            # an old image could not be deleted.
            pass


    # -----------------------------------------------------
    # SAVE NEW IMAGE PATH IN DATABASE
    # -----------------------------------------------------

    current_user.profile_picture = (
        f"/uploads/profile/{unique_filename}"
    )

    db.commit()

    db.refresh(current_user)


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "message": "Profile picture uploaded successfully.",

        "profile_picture": current_user.profile_picture,

        "fintwin_user_id": current_user.fintwin_user_id

    }


# =========================================================
# REMOVE PROFILE PICTURE
# =========================================================

@router.delete("/photo")
def delete_profile_picture(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    old_picture = current_user.profile_picture


    # -----------------------------------------------------
    # NOTHING TO DELETE
    # -----------------------------------------------------

    if not old_picture:

        return {
            "message": "No profile picture to remove."
        }


    # -----------------------------------------------------
    # DELETE FILE
    # -----------------------------------------------------

    old_filename = Path(old_picture).name

    old_path = PROFILE_UPLOAD_DIR / old_filename

    try:

        if old_path.exists():

            old_path.unlink()

    except Exception:

        pass


    # -----------------------------------------------------
    # REMOVE DATABASE REFERENCE
    # -----------------------------------------------------

    current_user.profile_picture = None

    db.commit()

    db.refresh(current_user)


    return {

        "message": "Profile picture removed successfully.",

        "profile_picture": None

    }


# =========================================================
# PROFILE SUMMARY
# =========================================================

@router.get("/summary")
def get_profile_summary(
    current_user: User = Depends(get_current_user)
):

    return {

        "user_id": current_user.id,

        "fintwin_user_id": current_user.fintwin_user_id,

        "name": getattr(
            current_user,
            "name",
            None
        ),

        "email": current_user.email,

        "profile_picture": current_user.profile_picture,

        "profile_status": "Active",

        "application": {

            "name": "FinTwin AI",

            "description": "Financial Digital Twin",

            "profile_type": "Personal Finance"

        }

    }