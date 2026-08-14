from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date
from collections import defaultdict

from app.database import get_db
from app.models.user import User
from app.models.goal import Goal
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.api.auth import get_current_user
from pydantic import BaseModel
from app.services.financial_context import (
    build_financial_context
)

from app.services.gemini_service import (
    generate_financial_response
)


router = APIRouter(
    prefix="/ai-twin",
    tags=["AI Twin"]
)


# =========================================================
# AI CHAT REQUEST
# =========================================================

class AIChatRequest(BaseModel):

    message: str


# =========================================================
# FINANCIAL HEALTH SCORE
# =========================================================

def calculate_health_score(
    total_income: float,
    total_expenses: float,
    budget_used_percentage: float,
    goal_progress: float
):

    score = 0

    # -----------------------------------------------------
    # 1. CASH FLOW HEALTH - 40 POINTS
    # -----------------------------------------------------

    if total_income > 0:

        savings_rate = (
            (total_income - total_expenses)
            / total_income
        ) * 100

        if savings_rate >= 30:
            score += 40

        elif savings_rate >= 20:
            score += 35

        elif savings_rate >= 10:
            score += 30

        elif savings_rate >= 0:
            score += 20

        else:
            score += 5

    # -----------------------------------------------------
    # 2. BUDGET HEALTH - 30 POINTS
    # -----------------------------------------------------

    if budget_used_percentage <= 60:
        score += 30

    elif budget_used_percentage <= 80:
        score += 25

    elif budget_used_percentage <= 100:
        score += 15

    else:
        score += 5

    # -----------------------------------------------------
    # 3. GOAL PROGRESS - 30 POINTS
    # -----------------------------------------------------

    if goal_progress >= 75:
        score += 30

    elif goal_progress >= 50:
        score += 25

    elif goal_progress >= 25:
        score += 20

    elif goal_progress > 0:
        score += 10

    # -----------------------------------------------------
    # HEALTH RATING
    # -----------------------------------------------------

    if score >= 85:
        rating = "Excellent"

    elif score >= 70:
        rating = "Good"

    elif score >= 50:
        rating = "Fair"

    elif score >= 30:
        rating = "Poor"

    else:
        rating = "Critical"

    return {
        "score": score,
        "rating": rating
    }


# =========================================================
# AI INSIGHTS
# =========================================================

def generate_insights(
    total_income: float,
    total_expenses: float,
    savings_rate: float,
    budget_used_percentage: float,
    total_budget: float,
    goal_progress: float
):

    insights = []

    # -----------------------------------------------------
    # CASH FLOW INSIGHTS
    # -----------------------------------------------------

    if total_income == 0 and total_expenses > 0:

        insights.append({
            "type": "warning",
            "category": "cash_flow",
            "title": "No Income Recorded",
            "message":
                "You have recorded expenses but no income. "
                "Add your income transactions for a more "
                "accurate financial analysis."
        })

    elif total_income > 0:

        if total_expenses > total_income:

            insights.append({
                "type": "danger",
                "category": "cash_flow",
                "title": "Negative Cash Flow",
                "message":
                    "Your expenses are higher than your income. "
                    "Consider reducing unnecessary spending."
            })

        elif savings_rate >= 30:

            insights.append({
                "type": "success",
                "category": "cash_flow",
                "title": "Strong Savings Rate",
                "message":
                    f"You are saving {round(savings_rate, 1)}% "
                    "of your income. Your cash flow is healthy."
            })

        elif savings_rate >= 10:

            insights.append({
                "type": "info",
                "category": "cash_flow",
                "title": "Moderate Savings Rate",
                "message":
                    f"Your savings rate is "
                    f"{round(savings_rate, 1)}%. "
                    "Increasing it can improve your "
                    "financial stability."
            })

        else:

            insights.append({
                "type": "warning",
                "category": "cash_flow",
                "title": "Low Savings Rate",
                "message":
                    f"Your savings rate is only "
                    f"{round(savings_rate, 1)}%. "
                    "Try reducing non-essential expenses."
            })

    # -----------------------------------------------------
    # BUDGET INSIGHTS
    # -----------------------------------------------------

    if total_budget == 0:

        insights.append({
            "type": "info",
            "category": "budget",
            "title": "No Monthly Budget",
            "message":
                "You have not created a budget for this month. "
                "Creating budgets can help control spending."
        })

    elif budget_used_percentage > 100:

        insights.append({
            "type": "danger",
            "category": "budget",
            "title": "Budget Exceeded",
            "message":
                f"You have used "
                f"{round(budget_used_percentage, 1)}% "
                "of your monthly budget."
        })

    elif budget_used_percentage >= 80:

        insights.append({
            "type": "warning",
            "category": "budget",
            "title": "Budget Almost Exhausted",
            "message":
                f"You have already used "
                f"{round(budget_used_percentage, 1)}% "
                "of your monthly budget. "
                "Consider limiting additional expenses."
        })

    else:

        insights.append({
            "type": "success",
            "category": "budget",
            "title": "Budget Under Control",
            "message":
                f"You have used "
                f"{round(budget_used_percentage, 1)}% "
                "of your monthly budget."
        })

    # -----------------------------------------------------
    # GOAL INSIGHTS
    # -----------------------------------------------------

    if goal_progress == 0:

        insights.append({
            "type": "info",
            "category": "goals",
            "title": "Start Saving Towards Goals",
            "message":
                "No savings progress has been recorded "
                "towards your financial goals."
        })

    elif goal_progress >= 75:

        insights.append({
            "type": "success",
            "category": "goals",
            "title": "Goals Nearly Achieved",
            "message":
                f"You have completed "
                f"{round(goal_progress, 1)}% "
                "of your overall savings goals."
        })

    else:

        insights.append({
            "type": "info",
            "category": "goals",
            "title": "Goal Progress",
            "message":
                f"You have completed "
                f"{round(goal_progress, 1)}% "
                "of your overall savings goals. "
                "Continue saving regularly."
        })

    return insights


# =========================================================
# RECOMMENDATIONS
# =========================================================

def generate_recommendations(
    total_income: float,
    total_expenses: float,
    savings_rate: float,
    budget_used_percentage: float,
    total_budget: float,
    goal_progress: float,
    health_score: int
):

    recommendations = []

    # -----------------------------------------------------
    # CASH FLOW
    # -----------------------------------------------------

    if total_income == 0 and total_expenses > 0:

        recommendations.append({
            "category": "cash_flow",
            "title": "Record Your Income",
            "action":
                "Add income transactions so FinTwin AI "
                "can calculate your real savings rate and "
                "cash-flow health."
        })

    elif total_expenses > total_income:

        recommendations.append({
            "category": "cash_flow",
            "title": "Reduce Discretionary Spending",
            "action":
                "Your expenses exceed income. Review your "
                "latest transactions to identify "
                "non-essential spending to cut."
        })

    elif total_income > 0 and savings_rate < 20:

        recommendations.append({
            "category": "cash_flow",
            "title": "Increase Your Savings Rate",
            "action":
                "Try to save at least 20% of your income "
                "by reducing unnecessary expenses."
        })

    # -----------------------------------------------------
    # BUDGET
    # -----------------------------------------------------

    if total_budget == 0:

        recommendations.append({
            "category": "budgeting",
            "title": "Create Monthly Budgets",
            "action":
                "Set category-based monthly budgets to "
                "improve spending control."
        })

    elif budget_used_percentage >= 80:

        recommendations.append({
            "category": "budgeting",
            "title": "Monitor Remaining Budget",
            "action":
                "You have used over 80% of your monthly "
                "budget limit. Hold off on "
                "non-essential purchases."
        })

    # -----------------------------------------------------
    # GOALS
    # -----------------------------------------------------

    if goal_progress < 50:

        recommendations.append({
            "category": "goals",
            "title": "Automate Goal Contributions",
            "action":
                "Set up monthly automated transfers to "
                "reach your savings targets faster."
        })

    elif goal_progress >= 75:

        recommendations.append({
            "category": "goals",
            "title": "Finish Your Financial Goals",
            "action":
                "Your goals are progressing well. "
                "Prioritize completing the goals closest "
                "to their target."
        })

    # -----------------------------------------------------
    # HEALTH
    # -----------------------------------------------------

    if health_score < 50:

        recommendations.append({
            "category": "health",
            "title": "Improve Financial Health Score",
            "action":
                "Focus on lowering budget usage and "
                "consistently depositing into your "
                "savings goals."
        })

    return recommendations


# =========================================================
# FINANCIAL RISKS
# =========================================================

def generate_risks(
    total_income: float,
    total_expenses: float,
    total_budget: float,
    budget_used_percentage: float,
    savings_rate: float
):

    risks = []

    # -----------------------------------------------------
    # NO INCOME RISK
    # -----------------------------------------------------

    if total_income == 0 and total_expenses > 0:

        risks.append({
            "level": "high",
            "category": "cash_flow",
            "title": "No Income Recorded",
            "message":
                "Expenses are being recorded without any "
                "income. Your financial position cannot "
                "be sustained without positive cash flow."
        })

    # -----------------------------------------------------
    # NEGATIVE CASH FLOW
    # -----------------------------------------------------

    elif total_expenses > total_income:

        risks.append({
            "level": "high",
            "category": "cash_flow",
            "title": "Negative Cash Flow Risk",
            "message":
                "Your total expenses are greater than "
                "your total income."
        })

    elif total_income > 0 and savings_rate < 10:

        risks.append({
            "level": "medium",
            "category": "cash_flow",
            "title": "Low Savings Risk",
            "message":
                "Your savings rate is below 10%. "
                "Unexpected expenses may create "
                "financial pressure."
        })

    # -----------------------------------------------------
    # BUDGET RISKS
    # -----------------------------------------------------

    if total_budget > 0:

        if budget_used_percentage > 100:

            risks.append({
                "level": "high",
                "category": "budget",
                "title": "Budget Exceeded",
                "message":
                    f"You have used "
                    f"{round(budget_used_percentage, 1)}% "
                    "of your monthly budget."
            })

        elif budget_used_percentage >= 80:

            risks.append({
                "level": "high",
                "category": "budget",
                "title": "Budget Exhaustion Risk",
                "message":
                    f"You have already used "
                    f"{round(budget_used_percentage, 1)}% "
                    "of your monthly budget."
            })

    return risks


# =========================================================
# MONTHLY FORECAST
# =========================================================

def generate_monthly_forecast(
    monthly_income: float,
    monthly_expenses: float,
    total_budget: float,
    current_day: int,
    days_in_month: int
):

    days_elapsed = max(current_day, 1)

    daily_spending_rate = (
        monthly_expenses / days_elapsed
    )

    projected_monthly_expenses = (
        daily_spending_rate * days_in_month
    )

    projected_month_end_balance = (
        monthly_income -
        projected_monthly_expenses
    )

    projected_budget_usage = (
        (
            projected_monthly_expenses
            / total_budget
        ) * 100
        if total_budget > 0
        else 0
    )

    projected_budget_remaining = (
        total_budget -
        projected_monthly_expenses
        if total_budget > 0
        else 0
    )

    # -----------------------------------------------------
    # BUDGET FORECAST
    # -----------------------------------------------------

    if total_budget == 0:

        budget_forecast = "No Budget"

    elif projected_monthly_expenses > total_budget:

        budget_forecast = "Likely To Exceed"

    elif projected_budget_usage >= 80:

        budget_forecast = "Warning"

    else:

        budget_forecast = "On Track"

    # -----------------------------------------------------
    # CASH FLOW FORECAST
    # -----------------------------------------------------

    if monthly_income == 0:

        cash_flow_forecast = "Insufficient Income Data"

    elif projected_month_end_balance < 0:

        cash_flow_forecast = "Negative"

    elif projected_month_end_balance == 0:

        cash_flow_forecast = "Break Even"

    else:

        cash_flow_forecast = "Positive"

    return {
        "days_elapsed": days_elapsed,
        "days_in_month": days_in_month,

        "daily_spending_rate": round(
            daily_spending_rate,
            2
        ),

        "projected_monthly_expenses": round(
            projected_monthly_expenses,
            2
        ),

        "projected_month_end_balance": round(
            projected_month_end_balance,
            2
        ),

        "projected_budget_usage": round(
            projected_budget_usage,
            2
        ),

        "projected_budget_remaining": round(
            projected_budget_remaining,
            2
        ),

        "budget_forecast": budget_forecast,

        "cash_flow_forecast": cash_flow_forecast
    }


# =========================================================
# 1.12 - GOAL FORECASTING
# =========================================================

def generate_goal_forecasts(goals):

    forecasts = []

    today = date.today()

    for goal in goals:

        target_amount = float(
            goal.target_amount
        )

        saved_amount = float(
            goal.saved_amount
        )

        remaining = max(
            target_amount - saved_amount,
            0
        )

        progress = (
            (saved_amount / target_amount) * 100
            if target_amount > 0
            else 0
        )

        # -------------------------------------------------
        # COMPLETED GOAL
        # -------------------------------------------------

        if remaining <= 0:

            forecasts.append({
                "goal_id": goal.id,
                "goal_name": goal.name,
                "category": goal.category,

                "target_amount": round(
                    target_amount,
                    2
                ),

                "saved_amount": round(
                    saved_amount,
                    2
                ),

                "remaining": 0,

                "progress": round(
                    progress,
                    2
                ),

                "target_date": (
                    str(goal.target_date)
                    if goal.target_date
                    else None
                ),

                "days_remaining": 0,

                "months_remaining": 0,

                "required_monthly_saving": 0,

                "required_daily_saving": 0,

                "status": "Completed"
            })

            continue

        # -------------------------------------------------
        # NO TARGET DATE
        # -------------------------------------------------

        if not goal.target_date:

            forecasts.append({
                "goal_id": goal.id,
                "goal_name": goal.name,
                "category": goal.category,

                "target_amount": round(
                    target_amount,
                    2
                ),

                "saved_amount": round(
                    saved_amount,
                    2
                ),

                "remaining": round(
                    remaining,
                    2
                ),

                "progress": round(
                    progress,
                    2
                ),

                "target_date": None,

                "days_remaining": None,

                "months_remaining": None,

                "required_monthly_saving": None,

                "required_daily_saving": None,

                "status": "No Target Date"
            })

            continue

        # -------------------------------------------------
        # DATE CONVERSION
        # -------------------------------------------------

        target_date = goal.target_date

        if isinstance(target_date, datetime):
            target_date = target_date.date()

        days_remaining = (
            target_date - today
        ).days

        # -------------------------------------------------
        # TARGET DATE PASSED
        # -------------------------------------------------

        if days_remaining <= 0:

            forecasts.append({
                "goal_id": goal.id,
                "goal_name": goal.name,
                "category": goal.category,

                "target_amount": round(
                    target_amount,
                    2
                ),

                "saved_amount": round(
                    saved_amount,
                    2
                ),

                "remaining": round(
                    remaining,
                    2
                ),

                "progress": round(
                    progress,
                    2
                ),

                "target_date": str(
                    target_date
                ),

                "days_remaining": 0,

                "months_remaining": 0,

                "required_monthly_saving": round(
                    remaining,
                    2
                ),

                "required_daily_saving": round(
                    remaining,
                    2
                ),

                "status": "Target Date Passed"
            })

            continue

        # -------------------------------------------------
        # REQUIRED SAVINGS
        # -------------------------------------------------

        months_remaining = max(
            days_remaining / 30,
            1
        )

        required_monthly_saving = (
            remaining / months_remaining
        )

        required_daily_saving = (
            remaining / days_remaining
        )

        # -------------------------------------------------
        # FORECAST STATUS
        # -------------------------------------------------

        if progress >= 75:

            forecast_status = "Nearly Complete"

        elif progress >= 50:

            forecast_status = "Good Progress"

        elif progress >= 25:

            forecast_status = "In Progress"

        elif progress > 0:

            forecast_status = "Needs Attention"

        else:

            forecast_status = "Not Started"

        forecasts.append({
            "goal_id": goal.id,
            "goal_name": goal.name,
            "category": goal.category,

            "target_amount": round(
                target_amount,
                2
            ),

            "saved_amount": round(
                saved_amount,
                2
            ),

            "remaining": round(
                remaining,
                2
            ),

            "progress": round(
                progress,
                2
            ),

            "target_date": str(
                target_date
            ),

            "days_remaining": (
                days_remaining
            ),

            "months_remaining": round(
                months_remaining,
                1
            ),

            "required_monthly_saving": round(
                required_monthly_saving,
                2
            ),

            "required_daily_saving": round(
                required_daily_saving,
                2
            ),

            "status": forecast_status
        })

    return forecasts


# =========================================================
# 1.13 - SPENDING ANALYSIS
# =========================================================

def generate_spending_analysis(
    transactions
):

    category_spending = defaultdict(
        float
    )

    total_expense_transactions = 0

    # -----------------------------------------------------
    # GROUP EXPENSES BY CATEGORY
    # -----------------------------------------------------

    for transaction in transactions:

        if (
            transaction.transaction_type
            and
            transaction.transaction_type.lower()
            == "expense"
        ):

            category = (
                transaction.category
                if transaction.category
                else "Other"
            )

            category_spending[category] += (
                float(transaction.amount)
            )

            total_expense_transactions += 1

    total_spending = sum(
        category_spending.values()
    )

    categories = []

    # -----------------------------------------------------
    # CATEGORY PERCENTAGES
    # -----------------------------------------------------

    for category, amount in (
        category_spending.items()
    ):

        percentage = (
            (amount / total_spending) * 100
            if total_spending > 0
            else 0
        )

        categories.append({
            "category": category,

            "amount": round(
                amount,
                2
            ),

            "percentage": round(
                percentage,
                2
            )
        })

    # Highest spending first
    categories.sort(
        key=lambda item: item["amount"],
        reverse=True
    )

    # -----------------------------------------------------
    # HIGHEST SPENDING CATEGORY
    # -----------------------------------------------------

    if categories:

        highest_spending_category = (
            categories[0]["category"]
        )

        highest_spending_amount = (
            categories[0]["amount"]
        )

        highest_spending_percentage = (
            categories[0]["percentage"]
        )

    else:

        highest_spending_category = None
        highest_spending_amount = 0
        highest_spending_percentage = 0

    # -----------------------------------------------------
    # SPENDING CONCENTRATION
    # -----------------------------------------------------

    if highest_spending_percentage >= 50:

        spending_pattern = (
            "Highly Concentrated"
        )

    elif highest_spending_percentage >= 30:

        spending_pattern = (
            "Moderately Concentrated"
        )

    elif total_spending > 0:

        spending_pattern = "Balanced"

    else:

        spending_pattern = "No Expense Data"

    return {
        "total_spending": round(
            total_spending,
            2
        ),

        "expense_transaction_count":
            total_expense_transactions,

        "category_count": len(
            categories
        ),

        "highest_spending_category":
            highest_spending_category,

        "highest_spending_amount":
            highest_spending_amount,

        "highest_spending_percentage":
            highest_spending_percentage,

        "spending_pattern":
            spending_pattern,

        "categories": categories
    }


# =========================================================
# 1.14 - FINANCIAL PROFILE
# =========================================================

def generate_financial_profile(
    total_income: float,
    total_expenses: float,
    savings_rate: float,
    total_budget: float,
    budget_used_percentage: float,
    goal_progress: float,
    health_score: int,
    health_rating: str,
    spending_analysis: dict
):

    # -----------------------------------------------------
    # CASH FLOW BEHAVIOR
    # -----------------------------------------------------

    if total_income == 0:

        cash_flow_behavior = (
            "Insufficient Income Data"
        )

    elif total_expenses > total_income:

        cash_flow_behavior = (
            "Negative Cash Flow"
        )

    elif savings_rate >= 30:

        cash_flow_behavior = (
            "Strong Saver"
        )

    elif savings_rate >= 20:

        cash_flow_behavior = (
            "Healthy Saver"
        )

    elif savings_rate >= 10:

        cash_flow_behavior = (
            "Moderate Saver"
        )

    else:

        cash_flow_behavior = (
            "Low Saver"
        )

    # -----------------------------------------------------
    # SPENDING BEHAVIOR
    # -----------------------------------------------------

    if total_expenses == 0:

        spending_behavior = (
            "No Spending Data"
        )

    elif (
        total_income > 0
        and total_expenses > total_income
    ):

        spending_behavior = (
            "Overspending"
        )

    elif (
        total_income > 0
        and total_expenses
        >= total_income * 0.8
    ):

        spending_behavior = (
            "High Spending"
        )

    elif (
        total_income > 0
        and total_expenses
        <= total_income * 0.5
    ):

        spending_behavior = (
            "Controlled Spending"
        )

    else:

        spending_behavior = (
            "Moderate Spending"
        )

    # -----------------------------------------------------
    # BUDGET DISCIPLINE
    # -----------------------------------------------------

    if total_budget == 0:

        budget_discipline = (
            "No Budget Data"
        )

    elif budget_used_percentage > 100:

        budget_discipline = (
            "Poor"
        )

    elif budget_used_percentage >= 80:

        budget_discipline = (
            "Needs Attention"
        )

    elif budget_used_percentage >= 60:

        budget_discipline = (
            "Moderate"
        )

    else:

        budget_discipline = (
            "Good"
        )

    # -----------------------------------------------------
    # GOAL DISCIPLINE
    # -----------------------------------------------------

    if goal_progress >= 75:

        goal_discipline = (
            "Excellent"
        )

    elif goal_progress >= 50:

        goal_discipline = (
            "Good"
        )

    elif goal_progress >= 25:

        goal_discipline = (
            "Moderate"
        )

    elif goal_progress > 0:

        goal_discipline = (
            "Needs Improvement"
        )

    else:

        goal_discipline = (
            "No Progress"
        )

    # -----------------------------------------------------
    # OVERALL FINANCIAL STATUS
    # -----------------------------------------------------

    if health_score >= 85:

        overall_status = (
            "Financially Strong"
        )

    elif health_score >= 70:

        overall_status = (
            "Financially Healthy"
        )

    elif health_score >= 50:

        overall_status = (
            "Financially Stable"
        )

    elif health_score >= 30:

        overall_status = (
            "Financially Vulnerable"
        )

    else:

        overall_status = (
            "Financially Critical"
        )

    # -----------------------------------------------------
    # AI TWIN SUMMARY
    # -----------------------------------------------------

    highest_category = (
        spending_analysis.get(
            "highest_spending_category"
        )
    )

    if total_income == 0:

        summary = (
            "Your FinTwin currently has insufficient "
            "income data for a complete cash-flow "
            "assessment. "
        )

    else:

        summary = (
            f"Your current savings rate is "
            f"{round(savings_rate, 1)}%. "
        )

    if highest_category:

        summary += (
            f"Your highest spending category is "
            f"{highest_category}. "
        )

    if total_budget > 0:

        summary += (
            f"You have used "
            f"{round(budget_used_percentage, 1)}% "
            f"of your current monthly budget. "
        )

    summary += (
        f"Your overall goal progress is "
        f"{round(goal_progress, 1)}%. "
        f"Your financial health is rated "
        f"{health_rating} with a score of "
        f"{health_score}/100."
    )

    return {
        "overall_status":
            overall_status,

        "cash_flow_behavior":
            cash_flow_behavior,

        "spending_behavior":
            spending_behavior,

        "budget_discipline":
            budget_discipline,

        "goal_discipline":
            goal_discipline,

        "spending_pattern":
            spending_analysis.get(
                "spending_pattern"
            ),

        "financial_health_rating":
            health_rating,

        "summary":
            summary
    }


# =========================================================
# 1.15 - FINANCIAL BEHAVIOR DETECTION
# =========================================================

def detect_financial_behavior(
    total_income: float,
    total_expenses: float,
    savings_rate: float,
    budget_used_percentage: float,
    goal_progress: float
):

    behavior_score = 0
    traits = []

    # =====================================================
    # SAVINGS BEHAVIOR
    # =====================================================

    if total_income == 0:

        traits.append(
            "Insufficient Income Data"
        )

    elif savings_rate >= 30:

        behavior_score += 30

        traits.append(
            "Strong Saver"
        )

    elif savings_rate >= 20:

        behavior_score += 25

        traits.append(
            "Consistent Saver"
        )

    elif savings_rate >= 10:

        behavior_score += 15

        traits.append(
            "Moderate Saver"
        )

    elif savings_rate >= 0:

        behavior_score += 5

        traits.append(
            "Low Saver"
        )

    else:

        traits.append(
            "Overspender"
        )

    # =====================================================
    # SPENDING BEHAVIOR
    # =====================================================

    if total_income > 0:

        spending_ratio = (
            total_expenses /
            total_income
        ) * 100

        if spending_ratio <= 50:

            behavior_score += 30

            traits.append(
                "Controlled Spender"
            )

        elif spending_ratio <= 70:

            behavior_score += 20

            traits.append(
                "Moderate Spender"
            )

        elif spending_ratio <= 90:

            behavior_score += 10

            traits.append(
                "High Spender"
            )

        else:

            traits.append(
                "Aggressive Spender"
            )

    else:

        spending_ratio = None

    # =====================================================
    # BUDGET BEHAVIOR
    # =====================================================

    if budget_used_percentage <= 60:

        behavior_score += 20

        traits.append(
            "Budget Disciplined"
        )

    elif budget_used_percentage <= 80:

        behavior_score += 15

        traits.append(
            "Budget Conscious"
        )

    elif budget_used_percentage <= 100:

        behavior_score += 5

        traits.append(
            "Budget At Risk"
        )

    else:

        traits.append(
            "Budget Overspender"
        )

    # =====================================================
    # GOAL BEHAVIOR
    # =====================================================

    if goal_progress >= 75:

        behavior_score += 20

        traits.append(
            "Highly Goal Focused"
        )

    elif goal_progress >= 50:

        behavior_score += 15

        traits.append(
            "Goal Focused"
        )

    elif goal_progress >= 25:

        behavior_score += 10

        traits.append(
            "Moderately Goal Focused"
        )

    elif goal_progress > 0:

        behavior_score += 5

        traits.append(
            "Low Goal Progress"
        )

    else:

        traits.append(
            "No Goal Progress"
        )

    # =====================================================
    # DETERMINE FINANCIAL PERSONALITY
    # =====================================================

    if behavior_score >= 80:

        personality = (
            "Disciplined Wealth Builder"
        )

    elif behavior_score >= 65:

        personality = (
            "Balanced Financial Planner"
        )

    elif behavior_score >= 50:

        personality = (
            "Developing Saver"
        )

    elif behavior_score >= 30:

        personality = (
            "Financially Inconsistent"
        )

    else:

        personality = (
            "High Risk Spender"
        )

    # =====================================================
    # BEHAVIOR MESSAGE
    # =====================================================

    if personality == "Disciplined Wealth Builder":

        message = (
            "Your financial behavior shows strong "
            "saving discipline, controlled spending "
            "and consistent progress toward goals."
        )

    elif personality == "Balanced Financial Planner":

        message = (
            "You maintain generally healthy financial "
            "habits, but there are still opportunities "
            "to improve savings and budget efficiency."
        )

    elif personality == "Developing Saver":

        message = (
            "You are building positive financial habits, "
            "but improving savings consistency and "
            "spending control can strengthen your profile."
        )

    elif personality == "Financially Inconsistent":

        message = (
            "Your current financial behavior shows "
            "inconsistency between spending, budgeting "
            "and savings progress."
        )

    else:

        message = (
            "Your current spending and savings patterns "
            "indicate elevated financial risk. "
            "Prioritize expense control and savings."
        )

    return {

        "behavior_score":
            behavior_score,

        "personality":
            personality,

        "traits":
            traits,

        "spending_ratio": (
            round(spending_ratio, 2)
            if spending_ratio is not None
            else None
        ),

        "message":
            message
    }


# =========================================================
# 1.16 - AI TWIN ACTION PLAN
# =========================================================

def generate_action_plan(
    total_income: float,
    total_expenses: float,
    savings_rate: float,
    total_budget: float,
    budget_used_percentage: float,
    goal_progress: float,
    health_score: int
):

    actions = []

    # =====================================================
    # 1. CASH FLOW ACTION
    # =====================================================

    if total_income == 0 and total_expenses > 0:

        actions.append({
            "priority": 1,
            "level": "critical",
            "category": "cash_flow",
            "title": "Record Your Income",
            "action":
                "Add your income transactions so FinTwin "
                "can accurately evaluate your cash flow, "
                "savings rate and financial health."
        })

    elif total_expenses > total_income:

        actions.append({
            "priority": 1,
            "level": "critical",
            "category": "cash_flow",
            "title": "Reduce Monthly Expenses",
            "action":
                "Your expenses are greater than your income. "
                "Review recent transactions and reduce "
                "non-essential spending."
        })

    elif savings_rate < 10:

        actions.append({
            "priority": 2,
            "level": "high",
            "category": "savings",
            "title": "Increase Savings Rate",
            "action":
                "Try to save at least 10% to 20% of your "
                "monthly income before increasing "
                "discretionary spending."
        })

    elif savings_rate < 20:

        actions.append({
            "priority": 3,
            "level": "medium",
            "category": "savings",
            "title": "Strengthen Your Savings",
            "action":
                "Your savings rate is positive but can be "
                "improved. Target a savings rate of at "
                "least 20%."
        })

    # =====================================================
    # 2. BUDGET ACTION
    # =====================================================

    if total_budget == 0:

        actions.append({
            "priority": 2,
            "level": "high",
            "category": "budget",
            "title": "Create Monthly Budgets",
            "action":
                "Create category-based monthly budgets "
                "to track and control your spending."
        })

    elif budget_used_percentage > 100:

        actions.append({
            "priority": 1,
            "level": "critical",
            "category": "budget",
            "title": "Stop Budget Overspending",
            "action":
                "Your monthly spending has exceeded your "
                "budget. Avoid non-essential purchases "
                "until your next budget cycle."
        })

    elif budget_used_percentage >= 80:

        actions.append({
            "priority": 2,
            "level": "high",
            "category": "budget",
            "title": "Protect Remaining Budget",
            "action":
                f"You have already used "
                f"{round(budget_used_percentage, 1)}% "
                "of your monthly budget. Limit additional "
                "non-essential expenses."
        })

    elif budget_used_percentage >= 60:

        actions.append({
            "priority": 4,
            "level": "medium",
            "category": "budget",
            "title": "Monitor Budget Usage",
            "action":
                "Your budget usage is increasing. "
                "Monitor upcoming expenses carefully."
        })

    # =====================================================
    # 3. GOAL ACTION
    # =====================================================

    if goal_progress == 0:

        actions.append({
            "priority": 3,
            "level": "high",
            "category": "goals",
            "title": "Start Goal Contributions",
            "action":
                "Begin contributing regularly toward your "
                "financial goals."
        })

    elif goal_progress < 25:

        actions.append({
            "priority": 4,
            "level": "medium",
            "category": "goals",
            "title": "Increase Goal Contributions",
            "action":
                "Your savings goals have low progress. "
                "Consider increasing your monthly "
                "contributions."
        })

    elif goal_progress < 50:

        actions.append({
            "priority": 5,
            "level": "medium",
            "category": "goals",
            "title": "Maintain Goal Momentum",
            "action":
                f"You have completed "
                f"{round(goal_progress, 1)}% "
                "of your savings goals. Continue making "
                "consistent contributions."
        })

    elif goal_progress < 75:

        actions.append({
            "priority": 6,
            "level": "low",
            "category": "goals",
            "title": "Continue Goal Progress",
            "action":
                "Your goals are progressing well. "
                "Continue your current saving pattern."
        })

    else:

        actions.append({
            "priority": 7,
            "level": "low",
            "category": "goals",
            "title": "Complete Your Goals",
            "action":
                "You are close to reaching your savings "
                "targets. Prioritize completing the goals "
                "nearest to their targets."
        })

    # =====================================================
    # 4. FINANCIAL HEALTH ACTION
    # =====================================================

    if health_score < 30:

        actions.append({
            "priority": 1,
            "level": "critical",
            "category": "financial_health",
            "title": "Stabilize Financial Health",
            "action":
                "Focus first on positive cash flow, "
                "expense reduction and budget control "
                "before increasing discretionary spending."
        })

    elif health_score < 50:

        actions.append({
            "priority": 2,
            "level": "high",
            "category": "financial_health",
            "title": "Improve Financial Health",
            "action":
                "Improve your financial health by "
                "controlling budget usage, increasing "
                "savings and maintaining goal contributions."
        })

    elif health_score < 70:

        actions.append({
            "priority": 4,
            "level": "medium",
            "category": "financial_health",
            "title": "Strengthen Financial Position",
            "action":
                "Your finances are relatively stable. "
                "Improve savings consistency and maintain "
                "healthy budget usage."
        })

    else:

        actions.append({
            "priority": 8,
            "level": "low",
            "category": "financial_health",
            "title": "Maintain Financial Discipline",
            "action":
                "Your financial position is healthy. "
                "Continue your current saving and "
                "budgeting habits."
        })

    # =====================================================
    # SORT BY PRIORITY
    # =====================================================

    actions.sort(
        key=lambda item: item["priority"]
    )

    # =====================================================
    # DETERMINE PRIMARY FOCUS
    # =====================================================

    if actions:

        primary_focus = actions[0]["title"]

    else:

        primary_focus = (
            "Maintain Financial Discipline"
        )

    # =====================================================
    # COUNT PRIORITIES
    # =====================================================

    critical_actions = sum(
        1
        for action in actions
        if action["level"] == "critical"
    )

    high_actions = sum(
        1
        for action in actions
        if action["level"] == "high"
    )

    # =====================================================
    # PLAN STATUS
    # =====================================================

    if critical_actions > 0:

        plan_status = "Immediate Action Required"

    elif high_actions > 0:

        plan_status = "Attention Required"

    elif actions:

        plan_status = "Improvement Plan"

    else:

        plan_status = "On Track"

    return {
        "status": plan_status,

        "primary_focus": primary_focus,

        "total_actions": len(actions),

        "critical_actions": critical_actions,

        "high_priority_actions": high_actions,

        "actions": actions
    }


# =========================================================
# AI TWIN OVERVIEW
# =========================================================

@router.get("/overview")
def get_ai_twin_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =====================================================
    # GOALS DATA
    # =====================================================

    goals = (
        db.query(Goal)
        .filter(
            Goal.user_id == current_user.id
        )
        .all()
    )

    total_goal_amount = sum(
        float(goal.target_amount)
        for goal in goals
    )

    total_saved = sum(
        float(goal.saved_amount)
        for goal in goals
    )

    goal_remaining = (
        total_goal_amount - total_saved
    )

    goal_progress = (
        (total_saved / total_goal_amount) * 100
        if total_goal_amount > 0
        else 0
    )

    completed_goals = sum(
        1
        for goal in goals
        if float(goal.saved_amount)
        >= float(goal.target_amount)
    )

    active_goals = (
        len(goals) - completed_goals
    )

    # =====================================================
    # ALL TRANSACTION DATA
    # =====================================================

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id
            == current_user.id
        )
        .all()
    )

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

    balance = (
        total_income -
        total_expenses
    )

    savings_rate = (
        (balance / total_income) * 100
        if total_income > 0
        else 0
    )

    # =====================================================
    # CURRENT MONTH
    # =====================================================

    now = datetime.now()

    current_month = now.month
    current_year = now.year

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

    monthly_balance = (
        monthly_income -
        monthly_expenses
    )

    # =====================================================
    # CURRENT MONTH BUDGET DATA
    # =====================================================

    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id
            == current_user.id,

            Budget.month
            == current_month,

            Budget.year
            == current_year
        )
        .all()
    )

    total_budget = sum(
        float(budget.amount)
        for budget in budgets
    )

    budget_remaining = (
        total_budget -
        monthly_expenses
    )

    budget_used_percentage = (
        (
            monthly_expenses
            / total_budget
        ) * 100
        if total_budget > 0
        else 0
    )

    # =====================================================
    # BUDGET STATUS
    # =====================================================

    if total_budget == 0:

        budget_status = (
            "No Budget"
        )

    elif monthly_expenses > total_budget:

        budget_status = (
            "Over Budget"
        )

    elif budget_used_percentage >= 80:

        budget_status = (
            "Warning"
        )

    else:

        budget_status = (
            "Healthy"
        )

    # =====================================================
    # HEALTH SCORE
    # =====================================================

    health_score = calculate_health_score(
        total_income=total_income,
        total_expenses=total_expenses,
        budget_used_percentage=
            budget_used_percentage,
        goal_progress=goal_progress
    )

    # =====================================================
    # INSIGHTS
    # =====================================================

    insights = generate_insights(
        total_income=total_income,
        total_expenses=total_expenses,
        savings_rate=savings_rate,
        budget_used_percentage=
            budget_used_percentage,
        total_budget=total_budget,
        goal_progress=goal_progress
    )

    # =====================================================
    # RECOMMENDATIONS
    # =====================================================

    recommendations = (
        generate_recommendations(
            total_income=total_income,
            total_expenses=total_expenses,
            savings_rate=savings_rate,
            budget_used_percentage=
                budget_used_percentage,
            total_budget=total_budget,
            goal_progress=goal_progress,
            health_score=
                health_score["score"]
        )
    )

    # =====================================================
    # RISKS
    # =====================================================

    risks = generate_risks(
        total_income=total_income,
        total_expenses=total_expenses,
        total_budget=total_budget,
        budget_used_percentage=
            budget_used_percentage,
        savings_rate=savings_rate
    )

    # =====================================================
    # NUMBER OF DAYS IN CURRENT MONTH
    # =====================================================

    if current_month == 12:

        next_month = datetime(
            current_year + 1,
            1,
            1
        )

    else:

        next_month = datetime(
            current_year,
            current_month + 1,
            1
        )

    current_month_start = datetime(
        current_year,
        current_month,
        1
    )

    days_in_month = (
        next_month -
        current_month_start
    ).days

    # =====================================================
    # MONTHLY FORECAST
    # =====================================================

    forecast = generate_monthly_forecast(
        monthly_income=monthly_income,
        monthly_expenses=
            monthly_expenses,
        total_budget=total_budget,
        current_day=now.day,
        days_in_month=days_in_month
    )

    # =====================================================
    # 1.12 GOAL FORECAST
    # =====================================================

    goal_forecasts = (
        generate_goal_forecasts(
            goals
        )
    )

    # =====================================================
    # 1.13 SPENDING ANALYSIS
    # =====================================================

    spending_analysis = (
        generate_spending_analysis(
            monthly_transactions
        )
    )

    # =====================================================
    # 1.14 FINANCIAL PROFILE
    # =====================================================

    financial_profile = (
        generate_financial_profile(
            total_income=total_income,
            total_expenses=total_expenses,
            savings_rate=savings_rate,
            total_budget=total_budget,
            budget_used_percentage=
                budget_used_percentage,
            goal_progress=goal_progress,
            health_score=
                health_score["score"],
            health_rating=
                health_score["rating"],
            spending_analysis=
                spending_analysis
        )
    )

    # =====================================================
    # 1.15 FINANCIAL BEHAVIOR
    # =====================================================

    financial_behavior = (
        detect_financial_behavior(
            total_income=total_income,
            total_expenses=total_expenses,
            savings_rate=savings_rate,
            budget_used_percentage=
                budget_used_percentage,
            goal_progress=goal_progress
        )
    )

    # =====================================================
    # 1.16 AI TWIN ACTION PLAN
    # =====================================================

    action_plan = (
        generate_action_plan(
            total_income=total_income,
            total_expenses=total_expenses,
            savings_rate=savings_rate,

            total_budget=total_budget,

            budget_used_percentage=
                budget_used_percentage,

            goal_progress=goal_progress,

            health_score=
                health_score["score"]
        )
    )

    # =====================================================
    # FINAL AI TWIN RESPONSE
    # =====================================================

    return {

        "user_id": current_user.id,

        # -------------------------------------------------
        # FINANCIALS
        # -------------------------------------------------

        "financials": {

            "total_income": round(
                total_income,
                2
            ),

            "total_expenses": round(
                total_expenses,
                2
            ),

            "balance": round(
                balance,
                2
            ),

            "savings_rate": round(
                savings_rate,
                2
            ),

            "transaction_count": len(
                transactions
            )
        },

        # -------------------------------------------------
        # MONTHLY FINANCIALS
        # -------------------------------------------------

        "monthly_financials": {

            "month": current_month,

            "year": current_year,

            "income": round(
                monthly_income,
                2
            ),

            "expenses": round(
                monthly_expenses,
                2
            ),

            "balance": round(
                monthly_balance,
                2
            )
        },

        # -------------------------------------------------
        # BUDGETS
        # -------------------------------------------------

        "budgets": {

            "total_budget": round(
                total_budget,
                2
            ),

            "spent": round(
                monthly_expenses,
                2
            ),

            "remaining": round(
                budget_remaining,
                2
            ),

            "used_percentage": round(
                budget_used_percentage,
                2
            ),

            "active_budgets": len(
                budgets
            ),

            "status": budget_status
        },

        # -------------------------------------------------
        # GOALS
        # -------------------------------------------------

        "goals": {

            "total_target": round(
                total_goal_amount,
                2
            ),

            "total_saved": round(
                total_saved,
                2
            ),

            "remaining": round(
                goal_remaining,
                2
            ),

            "progress": round(
                goal_progress,
                2
            ),

            "active_goals":
                active_goals,

            "completed_goals":
                completed_goals
        },

        # -------------------------------------------------
        # HEALTH
        # -------------------------------------------------

        "health_score":
            health_score,

        # -------------------------------------------------
        # INTELLIGENCE
        # -------------------------------------------------

        "insights":
            insights,

        "recommendations":
            recommendations,

        "risks":
            risks,

        # -------------------------------------------------
        # FORECAST
        # -------------------------------------------------

        "forecast":
            forecast,

        # -------------------------------------------------
        # STEP 1.12
        # -------------------------------------------------

        "goal_forecasts":
            goal_forecasts,

        # -------------------------------------------------
        # STEP 1.13
        # -------------------------------------------------

        "spending_analysis":
            spending_analysis,

        # -------------------------------------------------
        # STEP 1.14
        # -------------------------------------------------

        "financial_profile":
            financial_profile,

        # -------------------------------------------------
        # STEP 1.15
        # -------------------------------------------------

        "financial_behavior":
            financial_behavior,

        # -------------------------------------------------
        # STEP 1.16
        # -------------------------------------------------

        "action_plan":
            action_plan
    }


# =========================================================
# AI TWIN CHAT
# =========================================================

@router.post("/chat")
def ai_twin_chat(
    request: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =====================================================
    # VALIDATE MESSAGE
    # =====================================================

    user_message = request.message.strip()

    if not user_message:

        return {
            "success": False,
            "message": "Please enter a question."
        }

    # =====================================================
    # BUILD USER FINANCIAL CONTEXT
    # =====================================================

    financial_context = build_financial_context(
        db=db,
        user_id=current_user.id
    )

    # =====================================================
    # GENERATE GEMINI RESPONSE
    # =====================================================

    answer = generate_financial_response(
        user_question=user_message,
        financial_context=financial_context
    )

    # =====================================================
    # RETURN RESPONSE
    # =====================================================

    return {
        "success": True,
        "user_id": current_user.id,
        "question": user_message,
        "answer": answer
    }


@router.get("/context-test")
def context_test(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    context = build_financial_context(
        db=db,
        user_id=current_user.id
    )


    return {
        "user_id": current_user.id,
        "financial_context": context
    }