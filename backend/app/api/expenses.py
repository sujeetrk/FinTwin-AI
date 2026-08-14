from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.api.auth import get_current_user


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


# =========================================================
# GET ALL EXPENSES
# =========================================================

@router.get("/")
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    expenses = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense"
        )
        .order_by(Transaction.created_at.desc())
        .all()
    )

    return expenses


# =========================================================
# EXPENSE SUMMARY
# =========================================================

@router.get("/summary")
def get_expense_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Total expenses
    total_expenses = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense"
        )
        .scalar()
        or 0
    )

    now = datetime.now()

    # Current month expenses
    monthly_expenses = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense",
            func.extract("month", Transaction.created_at) == now.month,
            func.extract("year", Transaction.created_at) == now.year
        )
        .scalar()
        or 0
    )

    # Number of expense transactions
    expense_count = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense"
        )
        .count()
    )

    # Average expense amount
    average_expense = (
        db.query(func.avg(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense"
        )
        .scalar()
        or 0
    )

    return {
        "total_expenses": round(float(total_expenses), 2),
        "monthly_expenses": round(float(monthly_expenses), 2),
        "expense_count": expense_count,
        "average_expense": round(float(average_expense), 2)
    }


# =========================================================
# EXPENSES BY CATEGORY
# =========================================================

@router.get("/categories")
def get_expenses_by_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    results = (
        db.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total")
        )
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense"
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return [
        {
            "category": category,
            "amount": round(float(total), 2)
        }
        for category, total in results
    ]


# =========================================================
# MONTHLY EXPENSE TREND
# =========================================================

@router.get("/trend")
def get_expense_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    results = (
        db.query(
            func.extract(
                "year",
                Transaction.created_at
            ).label("year"),

            func.extract(
                "month",
                Transaction.created_at
            ).label("month"),

            func.sum(
                Transaction.amount
            ).label("total")
        )
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense"
        )
        .group_by(
            func.extract("year", Transaction.created_at),
            func.extract("month", Transaction.created_at)
        )
        .order_by(
            func.extract("year", Transaction.created_at),
            func.extract("month", Transaction.created_at)
        )
        .all()
    )

    return [
        {
            "year": int(year),
            "month": int(month),
            "amount": round(float(total), 2)
        }
        for year, month, total in results
    ]