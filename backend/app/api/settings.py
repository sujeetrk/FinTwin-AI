from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.api.auth import get_current_user


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)


# =========================================================
# SETTINGS SCHEMA
# =========================================================

class SettingsUpdate(BaseModel):

    currency: Optional[str] = None

    language: Optional[str] = None

    theme: Optional[str] = None

    email_notifications: Optional[bool] = None

    budget_alerts: Optional[bool] = None

    goal_alerts: Optional[bool] = None

    ai_insights: Optional[bool] = None


# =========================================================
# DEFAULT SETTINGS
# =========================================================

def get_default_settings():

    return {
        "currency": "INR",
        "language": "English",
        "theme": "dark",
        "email_notifications": True,
        "budget_alerts": True,
        "goal_alerts": True,
        "ai_insights": True
    }


# =========================================================
# GET CURRENT USER SETTINGS
# =========================================================

@router.get("/me")
def get_my_settings(
    current_user: User = Depends(get_current_user)
):

    return {
        "user_id": current_user.id,
        "settings": get_default_settings()
    }


# =========================================================
# UPDATE CURRENT USER SETTINGS
# =========================================================

@router.put("/me")
def update_my_settings(
    settings_data: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # -----------------------------------------------------
    # VALIDATE CURRENCY
    # -----------------------------------------------------

    if settings_data.currency is not None:

        allowed_currencies = [
            "INR",
            "USD",
            "EUR",
            "GBP",
            "JPY"
        ]

        if settings_data.currency not in allowed_currencies:

            return {
                "message": "Invalid currency.",
                "allowed_currencies": allowed_currencies
            }


    # -----------------------------------------------------
    # VALIDATE LANGUAGE
    # -----------------------------------------------------

    if settings_data.language is not None:

        allowed_languages = [
            "English",
            "Hindi",
            "Kannada"
        ]

        if settings_data.language not in allowed_languages:

            return {
                "message": "Invalid language.",
                "allowed_languages": allowed_languages
            }


    # -----------------------------------------------------
    # VALIDATE THEME
    # -----------------------------------------------------

    if settings_data.theme is not None:

        allowed_themes = [
            "light",
            "dark",
            "system"
        ]

        if settings_data.theme not in allowed_themes:

            return {
                "message": "Invalid theme.",
                "allowed_themes": allowed_themes
            }


    # -----------------------------------------------------
    # CURRENT SETTINGS
    # -----------------------------------------------------

    current_settings = get_default_settings()


    # -----------------------------------------------------
    # UPDATE ONLY PROVIDED VALUES
    # -----------------------------------------------------

    if settings_data.currency is not None:

        current_settings["currency"] = settings_data.currency


    if settings_data.language is not None:

        current_settings["language"] = settings_data.language


    if settings_data.theme is not None:

        current_settings["theme"] = settings_data.theme


    if settings_data.email_notifications is not None:

        current_settings["email_notifications"] = (
            settings_data.email_notifications
        )


    if settings_data.budget_alerts is not None:

        current_settings["budget_alerts"] = (
            settings_data.budget_alerts
        )


    if settings_data.goal_alerts is not None:

        current_settings["goal_alerts"] = (
            settings_data.goal_alerts
        )


    if settings_data.ai_insights is not None:

        current_settings["ai_insights"] = (
            settings_data.ai_insights
        )


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "message": "Settings updated successfully.",

        "user_id": current_user.id,

        "settings": current_settings

    }


# =========================================================
# RESET SETTINGS
# =========================================================

@router.post("/reset")
def reset_settings(
    current_user: User = Depends(get_current_user)
):

    return {

        "message": "Settings reset successfully.",

        "user_id": current_user.id,

        "settings": get_default_settings()

    }