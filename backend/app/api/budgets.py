from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.database import get_db
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.budget import (
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse
)
from app.api.auth import get_current_user


router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"]
)


# =========================================================
# CREATE BUDGET
# =========================================================

@router.post("/", response_model=BudgetResponse)
def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check if same category budget already exists
    # for this user, month and year
    existing_budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category == budget_data.category,
            Budget.month == budget_data.month,
            Budget.year == budget_data.year
        )
        .first()
    )

    if existing_budget:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category and month"
        )

    new_budget = Budget(
        user_id=current_user.id,
        category=budget_data.category,
        amount=budget_data.amount,
        month=budget_data.month,
        year=budget_data.year
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return new_budget


# =========================================================
# GET ALL BUDGETS
# =========================================================

@router.get("/")
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id
        )
        .order_by(
            Budget.year.desc(),
            Budget.month.desc()
        )
        .all()
    )

    result = []

    for budget in budgets:

        # Calculate actual spending for the budget category
        # during the same month/year
        spent = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.user_id == current_user.id,
                Transaction.transaction_type == "expense",
                Transaction.category == budget.category,
                func.extract(
                    "month",
                    Transaction.created_at
                ) == budget.month,
                func.extract(
                    "year",
                    Transaction.created_at
                ) == budget.year
            )
            .scalar()
            or 0
        )

        spent = float(spent)
        budget_amount = float(budget.amount)

        remaining = budget_amount - spent

        percentage_used = (
            (spent / budget_amount) * 100
            if budget_amount > 0
            else 0
        )

        # Budget status
        if percentage_used >= 100:
            status = "Exceeded"
        elif percentage_used >= 80:
            status = "Warning"
        else:
            status = "On Track"

        result.append(
            {
                "id": budget.id,
                "category": budget.category,
                "amount": budget_amount,
                "month": budget.month,
                "year": budget.year,
                "spent": round(spent, 2),
                "remaining": round(remaining, 2),
                "percentage_used": round(
                    percentage_used,
                    2
                ),
                "status": status
            }
        )

    return result


# =========================================================
# CURRENT MONTH BUDGETS
# =========================================================

@router.get("/current")
def get_current_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    now = datetime.now()

    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == now.month,
            Budget.year == now.year
        )
        .all()
    )

    result = []

    for budget in budgets:

        spent = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.user_id == current_user.id,
                Transaction.transaction_type == "expense",
                Transaction.category == budget.category,
                func.extract(
                    "month",
                    Transaction.created_at
                ) == budget.month,
                func.extract(
                    "year",
                    Transaction.created_at
                ) == budget.year
            )
            .scalar()
            or 0
        )

        spent = float(spent)
        budget_amount = float(budget.amount)

        remaining = budget_amount - spent

        percentage_used = (
            (spent / budget_amount) * 100
            if budget_amount > 0
            else 0
        )

        if percentage_used >= 100:
            status = "Exceeded"
        elif percentage_used >= 80:
            status = "Warning"
        else:
            status = "On Track"

        result.append(
            {
                "id": budget.id,
                "category": budget.category,
                "amount": budget_amount,
                "month": budget.month,
                "year": budget.year,
                "spent": round(spent, 2),
                "remaining": round(remaining, 2),
                "percentage_used": round(
                    percentage_used,
                    2
                ),
                "status": status
            }
        )

    return result


# =========================================================
# BUDGET SUMMARY
# =========================================================

@router.get("/summary")
def get_budget_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    now = datetime.now()

    # Current month budgets
    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == now.month,
            Budget.year == now.year
        )
        .all()
    )

    total_budget = sum(
        float(budget.amount)
        for budget in budgets
    )

    # Current month expenses
    total_spent = (
        db.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "expense",
            func.extract(
                "month",
                Transaction.created_at
            ) == now.month,
            func.extract(
                "year",
                Transaction.created_at
            ) == now.year
        )
        .scalar()
        or 0
    )

    total_spent = float(total_spent)

    remaining = total_budget - total_spent

    percentage_used = (
        (total_spent / total_budget) * 100
        if total_budget > 0
        else 0
    )

    return {
        "total_budget": round(total_budget, 2),
        "total_spent": round(total_spent, 2),
        "remaining": round(remaining, 2),
        "percentage_used": round(
            percentage_used,
            2
        ),
        "budget_count": len(budgets)
    }


# =========================================================
# UPDATE BUDGET
# =========================================================

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    update_data = budget_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(
            budget,
            key,
            value
        )

    db.commit()
    db.refresh(budget)

    return budget


# =========================================================
# DELETE BUDGET
# =========================================================

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    db.delete(budget)
    db.commit()

    return {
        "message": "Budget deleted successfully"
    }
    