from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


# =========================================================
# CREATE GOAL
# =========================================================

class GoalCreate(BaseModel):

    name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    target_amount: float = Field(
        ...,
        gt=0
    )

    saved_amount: float = Field(
        default=0,
        ge=0
    )

    target_date: Optional[date] = None

    category: Optional[str] = Field(
        default=None,
        max_length=50
    )


# =========================================================
# UPDATE GOAL
# =========================================================

class GoalUpdate(BaseModel):

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    target_amount: Optional[float] = Field(
        default=None,
        gt=0
    )

    saved_amount: Optional[float] = Field(
        default=None,
        ge=0
    )

    target_date: Optional[date] = None

    category: Optional[str] = Field(
        default=None,
        max_length=50
    )


# =========================================================
# GOAL RESPONSE
# =========================================================

class GoalResponse(BaseModel):

    id: int
    user_id: int

    name: str

    target_amount: float
    saved_amount: float

    target_date: Optional[date] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True