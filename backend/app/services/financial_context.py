from datetime import datetime

from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal


# =========================================================
# BUILD FINANCIAL CONTEXT
# =========================================================

def build_financial_context(
    db: Session,
    user_id: int
) -> str:

    # =====================================================
    # GET USER TRANSACTIONS
    # =====================================================

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id
        )
        .order_by(
            Transaction.created_at.desc()
        )
        .all()
    )

    # =====================================================
    # GET USER GOALS
    # =====================================================

    goals = (
        db.query(Goal)
        .filter(
            Goal.user_id == user_id
        )
        .all()
    )

    # =====================================================
    # CURRENT MONTH
    # =====================================================

    now = datetime.now()

    current_month = now.month
    current_year = now.year

    # =====================================================
    # GET CURRENT MONTH BUDGETS
    # =====================================================

    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.month == current_month,
            Budget.year == current_year
        )
        .all()
    )

    # =====================================================
    # CALCULATE TOTAL INCOME
    # =====================================================

    total_income = sum(
        float(transaction.amount)
        for transaction in transactions
        if (
            transaction.transaction_type
            and
            transaction.transaction_type.lower()
            == "income"
        )
    )

    # =====================================================
    # CALCULATE TOTAL EXPENSES
    # =====================================================

    total_expenses = sum(
        float(transaction.amount)
        for transaction in transactions
        if (
            transaction.transaction_type
            and
            transaction.transaction_type.lower()
            == "expense"
        )
    )

    # =====================================================
    # BALANCE
    # =====================================================

    balance = total_income - total_expenses

    # =====================================================
    # SAVINGS RATE
    # =====================================================

    savings_rate = (
        (balance / total_income) * 100
        if total_income > 0
        else 0
    )

    # =====================================================
    # CURRENT MONTH TRANSACTIONS
    # =====================================================

    monthly_transactions = [
        transaction
        for transaction in transactions
        if (
            transaction.created_at
            and
            transaction.created_at.month
            == current_month
            and
            transaction.created_at.year
            == current_year
        )
    ]

    # =====================================================
    # CURRENT MONTH INCOME
    # =====================================================

    monthly_income = sum(
        float(transaction.amount)
        for transaction in monthly_transactions
        if (
            transaction.transaction_type
            and
            transaction.transaction_type.lower()
            == "income"
        )
    )

    # =====================================================
    # CURRENT MONTH EXPENSES
    # =====================================================

    monthly_expenses = sum(
        float(transaction.amount)
        for transaction in monthly_transactions
        if (
            transaction.transaction_type
            and
            transaction.transaction_type.lower()
            == "expense"
        )
    )

    # =====================================================
    # CURRENT MONTH BUDGET
    # =====================================================

    total_budget = sum(
        float(budget.amount)
        for budget in budgets
    )

    budget_remaining = (
        total_budget - monthly_expenses
    )

    budget_used_percentage = (
        (monthly_expenses / total_budget) * 100
        if total_budget > 0
        else 0
    )

    # =====================================================
    # GOALS
    # =====================================================

    total_goal_target = sum(
        float(goal.target_amount)
        for goal in goals
    )

    total_goal_saved = sum(
        float(goal.saved_amount)
        for goal in goals
    )

    total_goal_remaining = max(
        total_goal_target - total_goal_saved,
        0
    )

    goal_progress = (
        (total_goal_saved / total_goal_target) * 100
        if total_goal_target > 0
        else 0
    )

    # =====================================================
    # BUILD CONTEXT
    # =====================================================

    context = f"""
FINANCIAL DIGITAL TWIN DATA
============================

CURRENT DATE
{now.strftime("%Y-%m-%d")}


OVERALL FINANCIAL SUMMARY
--------------------------

Total Income: ₹{total_income:,.2f}

Total Expenses: ₹{total_expenses:,.2f}

Balance: ₹{balance:,.2f}

Savings Rate: {savings_rate:.2f}%


CURRENT MONTH
-------------

Month: {current_month}

Year: {current_year}

Monthly Income: ₹{monthly_income:,.2f}

Monthly Expenses: ₹{monthly_expenses:,.2f}


CURRENT MONTH BUDGET
--------------------

Total Budget: ₹{total_budget:,.2f}

Budget Remaining: ₹{budget_remaining:,.2f}

Budget Used: {budget_used_percentage:.2f}%


FINANCIAL GOALS
---------------

Total Goal Target: ₹{total_goal_target:,.2f}

Total Saved Towards Goals: ₹{total_goal_saved:,.2f}

Remaining Goal Amount: ₹{total_goal_remaining:,.2f}

Overall Goal Progress: {goal_progress:.2f}%


GOAL DETAILS
------------
"""

    # =====================================================
    # ADD GOAL DETAILS
    # =====================================================

    if goals:

        for goal in goals:

            target = float(
                goal.target_amount
            )

            saved = float(
                goal.saved_amount
            )

            remaining = max(
                target - saved,
                0
            )

            progress = (
                (saved / target) * 100
                if target > 0
                else 0
            )

            context += f"""
Goal: {goal.name}

Category: {goal.category or "Not specified"}

Target Amount: ₹{target:,.2f}

Saved Amount: ₹{saved:,.2f}

Remaining: ₹{remaining:,.2f}

Progress: {progress:.2f}%

Target Date: {
    str(goal.target_date)
    if goal.target_date
    else "Not specified"
}

---
"""

    else:

        context += """
No financial goals have been created.
"""

    # =====================================================
    # BUDGET DETAILS
    # =====================================================

    context += """

CURRENT BUDGET DETAILS
----------------------
"""

    if budgets:

        for budget in budgets:

            context += f"""
Category: {budget.category}

Budget Amount: ₹{float(budget.amount):,.2f}

---
"""

    else:

        context += """
No budgets have been created for the current month.
"""

    # =====================================================
    # RECENT TRANSACTIONS
    # =====================================================

    context += """

RECENT TRANSACTIONS
-------------------
"""

    if transactions:

        # Only provide recent 20 transactions
        # to keep the prompt reasonably small.

        for transaction in transactions[:20]:

            context += f"""
Title: {transaction.title}

Amount: ₹{float(transaction.amount):,.2f}

Type: {transaction.transaction_type}

Category: {transaction.category}

Description: {
    transaction.description
    if transaction.description
    else "None"
}

Date: {
    str(transaction.created_at)
    if transaction.created_at
    else "Unknown"
}

---
"""

    else:

        context += """
No transactions have been recorded.
"""

    return context