from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# =========================================================
# CREATE BUDGET
# =========================================================

class BudgetCreate(BaseModel):

    category: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    amount: float = Field(
        ...,
        gt=0
    )

    month: int = Field(
        ...,
        ge=1,
        le=12
    )

    year: int = Field(
        ...,
        ge=2000,
        le=2100
    )


# =========================================================
# UPDATE BUDGET
# =========================================================

class BudgetUpdate(BaseModel):

    category: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100
    )

    amount: Optional[float] = Field(
        None,
        gt=0
    )

    month: Optional[int] = Field(
        None,
        ge=1,
        le=12
    )

    year: Optional[int] = Field(
        None,
        ge=2000,
        le=2100
    )


# =========================================================
# BUDGET RESPONSE
# =========================================================

class BudgetResponse(BaseModel):

    id: int
    user_id: int
    category: str
    amount: float
    month: int
    year: int
    created_at: datetime

    class Config:
        from_attributes = True