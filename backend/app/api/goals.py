from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.goal import Goal
from app.models.user import User
from app.schemas.goal import (
    GoalCreate,
    GoalUpdate,
    GoalResponse
)
from app.api.auth import get_current_user


router = APIRouter(
    prefix="/goals",
    tags=["Goals"]
)


# =========================================================
# CREATE GOAL
# =========================================================

@router.post("/", response_model=GoalResponse)
def create_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Saved amount should not be greater than target amount
    if goal_data.saved_amount > goal_data.target_amount:
        raise HTTPException(
            status_code=400,
            detail="Saved amount cannot be greater than target amount"
        )

    new_goal = Goal(
        user_id=current_user.id,
        name=goal_data.name,
        target_amount=goal_data.target_amount,
        saved_amount=goal_data.saved_amount,
        target_date=goal_data.target_date,
        category=goal_data.category
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


# =========================================================
# GET ALL GOALS
# =========================================================

@router.get("/")
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goals = (
        db.query(Goal)
        .filter(
            Goal.user_id == current_user.id
        )
        .order_by(Goal.id.desc())
        .all()
    )

    result = []

    for goal in goals:

        target_amount = float(goal.target_amount)
        saved_amount = float(goal.saved_amount)

        remaining = target_amount - saved_amount

        progress = (
            (saved_amount / target_amount) * 100
            if target_amount > 0
            else 0
        )

        # Determine goal status
        if saved_amount >= target_amount:
            status = "Completed"
        elif saved_amount > 0:
            status = "In Progress"
        else:
            status = "Not Started"

        result.append(
            {
                "id": goal.id,
                "name": goal.name,
                "target_amount": target_amount,
                "saved_amount": saved_amount,
                "remaining": round(remaining, 2),
                "progress": round(progress, 2),
                "target_date": goal.target_date,
                "category": goal.category,
                "status": status
            }
        )

    return result


# =========================================================
# GOALS SUMMARY
# =========================================================

@router.get("/summary")
def get_goal_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goals = (
        db.query(Goal)
        .filter(
            Goal.user_id == current_user.id
        )
        .all()
    )

    total_target = sum(
        float(goal.target_amount)
        for goal in goals
    )

    total_saved = sum(
        float(goal.saved_amount)
        for goal in goals
    )

    remaining = total_target - total_saved

    overall_progress = (
        (total_saved / total_target) * 100
        if total_target > 0
        else 0
    )

    completed_goals = sum(
        1
        for goal in goals
        if float(goal.saved_amount)
        >= float(goal.target_amount)
    )

    return {
        "total_target": round(total_target, 2),
        "total_saved": round(total_saved, 2),
        "remaining": round(remaining, 2),
        "overall_progress": round(
            overall_progress,
            2
        ),
        "goal_count": len(goals),
        "completed_goals": completed_goals
    }


# =========================================================
# GET SINGLE GOAL
# =========================================================

@router.get("/{goal_id}")
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )

    target_amount = float(goal.target_amount)
    saved_amount = float(goal.saved_amount)

    remaining = target_amount - saved_amount

    progress = (
        (saved_amount / target_amount) * 100
        if target_amount > 0
        else 0
    )

    if saved_amount >= target_amount:
        status = "Completed"
    elif saved_amount > 0:
        status = "In Progress"
    else:
        status = "Not Started"

    return {
        "id": goal.id,
        "name": goal.name,
        "target_amount": target_amount,
        "saved_amount": saved_amount,
        "remaining": round(remaining, 2),
        "progress": round(progress, 2),
        "target_date": goal.target_date,
        "category": goal.category,
        "status": status
    }


# =========================================================
# UPDATE GOAL
# =========================================================

@router.put(
    "/{goal_id}",
    response_model=GoalResponse
)
def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )

    update_data = goal_data.model_dump(
        exclude_unset=True
    )

    # Calculate what target/saved amounts will be
    # after the update
    new_target = float(
        update_data.get(
            "target_amount",
            goal.target_amount
        )
    )

    new_saved = float(
        update_data.get(
            "saved_amount",
            goal.saved_amount
        )
    )

    if new_saved > new_target:
        raise HTTPException(
            status_code=400,
            detail="Saved amount cannot be greater than target amount"
        )

    for key, value in update_data.items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)

    return goal


# =========================================================
# ADD MONEY TO GOAL
# =========================================================

@router.patch("/{goal_id}/add-money")
def add_money_to_goal(
    goal_id: int,
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than 0"
        )

    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )

    current_saved = float(goal.saved_amount)
    target_amount = float(goal.target_amount)

    new_saved = current_saved + amount

    if new_saved > target_amount:
        raise HTTPException(
            status_code=400,
            detail="Amount exceeds the goal target"
        )

    goal.saved_amount = new_saved

    db.commit()
    db.refresh(goal)

    remaining = target_amount - new_saved

    progress = (
        new_saved / target_amount
    ) * 100

    status = (
        "Completed"
        if new_saved >= target_amount
        else "In Progress"
    )

    return {
        "id": goal.id,
        "name": goal.name,
        "target_amount": target_amount,
        "saved_amount": round(
            new_saved,
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
        "status": status
    }


# =========================================================
# DELETE GOAL
# =========================================================

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goal not found"
        )

    db.delete(goal)
    db.commit()

    return {
        "message": "Goal deleted successfully"
    }