from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse
)

# Reuse the authentication function already working in auth.py
from app.api.auth import get_current_user


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


# =========================================================
# CREATE TRANSACTION
# =========================================================

@router.post(
    "/",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED
)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    transaction_type = transaction_data.transaction_type.lower()

    # Only income and expense are allowed
    if transaction_type not in ["income", "expense"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction type must be 'income' or 'expense'"
        )

    # Amount must be positive
    if transaction_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )

    # Create transaction for currently logged-in user
    new_transaction = Transaction(
        user_id=current_user.id,
        title=transaction_data.title,
        amount=transaction_data.amount,
        transaction_type=transaction_type,
        category=transaction_data.category,
        description=transaction_data.description
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


# =========================================================
# GET ALL TRANSACTIONS OF CURRENT USER
# =========================================================

@router.get(
    "/",
    response_model=List[TransactionResponse]
)
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .all()
    )

    return transactions


# =========================================================
# GET ONE TRANSACTION
# =========================================================

@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse
)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return transaction


# =========================================================
# DELETE TRANSACTION
# =========================================================

@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    db.delete(transaction)
    db.commit()

    return None