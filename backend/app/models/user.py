from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, DateTime, Integer, String

from app.database import Base


def generate_fintwin_user_id():
    """
    Generate a unique public FinTwin User ID.

    Example:
    FT-8A42F91C
    """

    unique_part = uuid.uuid4().hex[:8].upper()

    return f"FT-{unique_part}"


class User(Base):

    __tablename__ = "users"

    # =========================================================
    # DATABASE ID
    # =========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # =========================================================
    # USER NAME
    # =========================================================

    name = Column(
        String(100),
        nullable=False
    )

    # =========================================================
    # EMAIL
    # =========================================================

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    # =========================================================
    # PASSWORD
    # =========================================================

    hashed_password = Column(
        String(255),
        nullable=False
    )

    # =========================================================
    # UNIQUE FINTWIN USER ID
    # =========================================================

    fintwin_user_id = Column(
        String(20),
        unique=True,
        index=True,
        nullable=True,
        default=generate_fintwin_user_id
    )

    # =========================================================
    # PROFILE PICTURE
    # =========================================================

    profile_picture = Column(
        String(500),
        nullable=True
    )

    # =========================================================
    # ACCOUNT CREATION DATE
    # =========================================================

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )