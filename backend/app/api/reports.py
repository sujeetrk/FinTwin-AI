from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from calendar import monthrange

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal
from app.api.auth import get_current_user


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# =========================================================
# HELPER - SAFE PERCENTAGE
# =========================================================

def calculate_percentage(
    value: float,
    total: float
):
    if total <= 0:
        return 0

    return round(
        (value / total) * 100,
        2
    )


# =========================================================
# HELPER - MONTH NAME
# =========================================================

def get_month_name(month: int):
    return datetime(
        2000,
        month,
        1
    ).strftime("%B")


# =========================================================
# 3.1 - MAIN FINANCIAL REPORT
# =========================================================

@router.get("/summary")
def get_financial_report(
    month: int = Query(
        default=None,
        ge=1,
        le=12
    ),

    year: int = Query(
        default=None,
        ge=2000
    ),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )
):

    # =====================================================
    # REPORT PERIOD
    # =====================================================

    now = datetime.now()

    report_month = (
        month
        if month is not None
        else now.month
    )

    report_year = (
        year
        if year is not None
        else now.year
    )

    days_in_month = monthrange(
        report_year,
        report_month
    )[1]


    # =====================================================
    # 3.2 - MONTHLY TRANSACTIONS
    # =====================================================

    all_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id ==
            current_user.id
        )
        .all()
    )


    monthly_transactions = [
        transaction
        for transaction in all_transactions

        if transaction.created_at

        and transaction.created_at.month
        == report_month

        and transaction.created_at.year
        == report_year
    ]


    income_transactions = [
        transaction
        for transaction
        in monthly_transactions

        if transaction.transaction_type.lower()
        == "income"
    ]


    expense_transactions = [
        transaction
        for transaction
        in monthly_transactions

        if transaction.transaction_type.lower()
        == "expense"
    ]


    total_income = sum(
        float(transaction.amount)

        for transaction
        in income_transactions
    )


    total_expenses = sum(
        float(transaction.amount)

        for transaction
        in expense_transactions
    )


    net_savings = (
        total_income -
        total_expenses
    )


    savings_rate = (
        calculate_percentage(
            net_savings,
            total_income
        )
        if total_income > 0
        else 0
    )


    # =====================================================
    # 3.3 - EXPENSE CATEGORY ANALYSIS
    # =====================================================

    category_totals = {}


    for transaction in expense_transactions:

        category = (
            transaction.category
            or "Other"
        )

        amount = float(
            transaction.amount
        )


        if category in category_totals:

            category_totals[
                category
            ] += amount

        else:

            category_totals[
                category
            ] = amount


    category_breakdown = []


    for category, amount in category_totals.items():

        percentage = (
            calculate_percentage(
                amount,
                total_expenses
            )
        )


        category_breakdown.append({

            "category":
                category,

            "amount":
                round(
                    amount,
                    2
                ),

            "percentage":
                percentage
        })


    category_breakdown.sort(
        key=lambda item:
            item["amount"],
        reverse=True
    )


    if category_breakdown:

        highest_spending_category = (
            category_breakdown[0][
                "category"
            ]
        )

        highest_spending_amount = (
            category_breakdown[0][
                "amount"
            ]
        )

        highest_spending_percentage = (
            category_breakdown[0][
                "percentage"
            ]
        )

    else:

        highest_spending_category = None
        highest_spending_amount = 0
        highest_spending_percentage = 0


    # =====================================================
    # 3.4 - BUDGET PERFORMANCE
    # =====================================================

    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id ==
            current_user.id,

            Budget.month ==
            report_month,

            Budget.year ==
            report_year
        )
        .all()
    )


    total_budget = sum(
        float(budget.amount)

        for budget in budgets
    )


    budget_breakdown = []

    over_budget_categories = 0


    for budget in budgets:

        budget_amount = float(
            budget.amount
        )


        category_spent = (
            category_totals.get(
                budget.category,
                0
            )
        )


        remaining = (
            budget_amount -
            category_spent
        )


        used_percentage = (
            calculate_percentage(
                category_spent,
                budget_amount
            )
            if budget_amount > 0
            else 0
        )


        if category_spent > budget_amount:

            status = "Over Budget"

            over_budget_categories += 1

        elif used_percentage >= 80:

            status = "Warning"

        else:

            status = "Healthy"


        budget_breakdown.append({

            "category":
                budget.category,

            "budget":
                round(
                    budget_amount,
                    2
                ),

            "spent":
                round(
                    category_spent,
                    2
                ),

            "remaining":
                round(
                    remaining,
                    2
                ),

            "used_percentage":
                used_percentage,

            "status":
                status
        })


    total_budget_remaining = (
        total_budget -
        total_expenses
    )


    overall_budget_usage = (
        calculate_percentage(
            total_expenses,
            total_budget
        )
        if total_budget > 0
        else 0
    )


    if total_budget == 0:

        overall_budget_status = (
            "No Budget"
        )

    elif total_expenses > total_budget:

        overall_budget_status = (
            "Over Budget"
        )

    elif overall_budget_usage >= 80:

        overall_budget_status = (
            "Warning"
        )

    else:

        overall_budget_status = (
            "Healthy"
        )


    # =====================================================
    # 3.5 - GOAL PERFORMANCE
    # =====================================================

    goals = (
        db.query(Goal)
        .filter(
            Goal.user_id ==
            current_user.id
        )
        .all()
    )


    total_goal_target = sum(
        float(goal.target_amount)

        for goal in goals
    )


    total_goal_saved = sum(
        float(goal.saved_amount)

        for goal in goals
    )


    goal_remaining = (
        total_goal_target -
        total_goal_saved
    )


    goal_progress = (
        calculate_percentage(
            total_goal_saved,
            total_goal_target
        )
        if total_goal_target > 0
        else 0
    )


    completed_goals = sum(

        1

        for goal in goals

        if float(
            goal.saved_amount
        )
        >= float(
            goal.target_amount
        )
    )


    active_goals = (
        len(goals) -
        completed_goals
    )


    goal_breakdown = []


    for goal in goals:

        target = float(
            goal.target_amount
        )

        saved = float(
            goal.saved_amount
        )

        remaining = (
            target -
            saved
        )


        progress = (
            calculate_percentage(
                saved,
                target
            )
            if target > 0
            else 0
        )


        if saved >= target:

            status = "Completed"

        elif saved > 0:

            status = "In Progress"

        else:

            status = "Not Started"


        goal_breakdown.append({

            "id":
                goal.id,

            "name":
                goal.name,

            "category":
                goal.category,

            "target_amount":
                round(
                    target,
                    2
                ),

            "saved_amount":
                round(
                    saved,
                    2
                ),

            "remaining":
                round(
                    remaining,
                    2
                ),

            "progress":
                progress,

            "status":
                status,

            "target_date":
                goal.target_date
        })


    # =====================================================
    # 3.6 - REPORT HEALTH / SUMMARY
    # =====================================================

    if total_income == 0:

        cash_flow_status = (
            "No Income Data"
        )

    elif net_savings < 0:

        cash_flow_status = (
            "Negative"
        )

    elif savings_rate >= 20:

        cash_flow_status = (
            "Strong"
        )

    elif savings_rate >= 10:

        cash_flow_status = (
            "Moderate"
        )

    else:

        cash_flow_status = (
            "Low"
        )


    # -----------------------------------------------------
    # REPORT SCORE
    # -----------------------------------------------------

    report_score = 0


    # CASH FLOW - 40 POINTS

    if total_income > 0:

        if savings_rate >= 30:

            report_score += 40

        elif savings_rate >= 20:

            report_score += 35

        elif savings_rate >= 10:

            report_score += 30

        elif savings_rate >= 0:

            report_score += 20

        else:

            report_score += 5


    # BUDGET - 30 POINTS

    if total_budget > 0:

        if overall_budget_usage <= 60:

            report_score += 30

        elif overall_budget_usage <= 80:

            report_score += 25

        elif overall_budget_usage <= 100:

            report_score += 15

        else:

            report_score += 5


    # GOALS - 30 POINTS

    if goal_progress >= 75:

        report_score += 30

    elif goal_progress >= 50:

        report_score += 25

    elif goal_progress >= 25:

        report_score += 20

    elif goal_progress > 0:

        report_score += 10


    # -----------------------------------------------------
    # REPORT RATING
    # -----------------------------------------------------

    if report_score >= 85:

        report_rating = (
            "Excellent"
        )

    elif report_score >= 70:

        report_rating = (
            "Good"
        )

    elif report_score >= 50:

        report_rating = (
            "Fair"
        )

    elif report_score >= 30:

        report_rating = (
            "Poor"
        )

    else:

        report_rating = (
            "Critical"
        )


    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {

        # -------------------------------------------------
        # REPORT PERIOD
        # -------------------------------------------------

        "report_period": {

            "month":
                report_month,

            "month_name":
                get_month_name(
                    report_month
                ),

            "year":
                report_year,

            "days_in_month":
                days_in_month
        },


        # -------------------------------------------------
        # MONTHLY SUMMARY
        # -------------------------------------------------

        "monthly_summary": {

            "total_income":
                round(
                    total_income,
                    2
                ),

            "total_expenses":
                round(
                    total_expenses,
                    2
                ),

            "net_savings":
                round(
                    net_savings,
                    2
                ),

            "savings_rate":
                round(
                    savings_rate,
                    2
                ),

            "transaction_count":
                len(
                    monthly_transactions
                ),

            "income_transaction_count":
                len(
                    income_transactions
                ),

            "expense_transaction_count":
                len(
                    expense_transactions
                ),

            "cash_flow_status":
                cash_flow_status
        },


        # -------------------------------------------------
        # EXPENSE ANALYSIS
        # -------------------------------------------------

        "expense_analysis": {

            "total_expenses":
                round(
                    total_expenses,
                    2
                ),

            "category_count":
                len(
                    category_breakdown
                ),

            "highest_spending_category":
                highest_spending_category,

            "highest_spending_amount":
                round(
                    highest_spending_amount,
                    2
                ),

            "highest_spending_percentage":
                round(
                    highest_spending_percentage,
                    2
                ),

            "categories":
                category_breakdown
        },


        # -------------------------------------------------
        # BUDGET PERFORMANCE
        # -------------------------------------------------

        "budget_performance": {

            "total_budget":
                round(
                    total_budget,
                    2
                ),

            "total_spent":
                round(
                    total_expenses,
                    2
                ),

            "remaining":
                round(
                    total_budget_remaining,
                    2
                ),

            "used_percentage":
                round(
                    overall_budget_usage,
                    2
                ),

            "active_budgets":
                len(
                    budgets
                ),

            "over_budget_categories":
                over_budget_categories,

            "status":
                overall_budget_status,

            "categories":
                budget_breakdown
        },


        # -------------------------------------------------
        # GOAL PERFORMANCE
        # -------------------------------------------------

        "goal_performance": {

            "total_target":
                round(
                    total_goal_target,
                    2
                ),

            "total_saved":
                round(
                    total_goal_saved,
                    2
                ),

            "remaining":
                round(
                    goal_remaining,
                    2
                ),

            "progress":
                round(
                    goal_progress,
                    2
                ),

            "total_goals":
                len(
                    goals
                ),

            "active_goals":
                active_goals,

            "completed_goals":
                completed_goals,

            "goals":
                goal_breakdown
        },


        # -------------------------------------------------
        # REPORT HEALTH
        # -------------------------------------------------

        "report_health": {

            "score":
                report_score,

            "rating":
                report_rating,

            "cash_flow_status":
                cash_flow_status,

            "budget_status":
                overall_budget_status,

            "goal_progress":
                round(
                    goal_progress,
                    2
                )
        }
    }


# =========================================================
# CASH FLOW - LAST 6 MONTHS
# =========================================================


@router.get("/cash-flow")
def get_cash_flow(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns income and expenses for the last 6 months
    for the currently authenticated user.
    """


    now = datetime.now()


    # -----------------------------------------------------
    # Get all transactions for current user
    # -----------------------------------------------------


    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id
        )
        .all()
    )


    result = []


    # -----------------------------------------------------
    # Build last 6 months
    # -----------------------------------------------------


    for offset in range(5, -1, -1):


        month = now.month - offset
        year = now.year


        # Handle previous year
        while month <= 0:
            month += 12
            year -= 1


        # -------------------------------------------------
        # Calculate monthly income
        # -------------------------------------------------


        monthly_income = sum(
            float(transaction.amount)
            for transaction in transactions
            if (
                transaction.created_at
                and transaction.created_at.month == month
                and transaction.created_at.year == year
                and transaction.transaction_type
                and transaction.transaction_type.lower() == "income"
            )
        )


        # -------------------------------------------------
        # Calculate monthly expenses
        # -------------------------------------------------


        monthly_expenses = sum(
            float(transaction.amount)
            for transaction in transactions
            if (
                transaction.created_at
                and transaction.created_at.month == month
                and transaction.created_at.year == year
                and transaction.transaction_type
                and transaction.transaction_type.lower() == "expense"
            )
        )


        result.append({
            "month": datetime(
                year,
                month,
                1
            ).strftime("%b"),


            "income": round(
                monthly_income,
                2
            ),


            "expenses": round(
                monthly_expenses,
                2
            )
        })


    return result