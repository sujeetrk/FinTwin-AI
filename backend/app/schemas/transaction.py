from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class TransactionCreate(BaseModel):
    title: str
    amount: float
    transaction_type: str
    category: str
    description: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    amount: float
    transaction_type: str
    category: str
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)