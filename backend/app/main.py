from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.database import Base, engine

# =========================================================
# MODELS
# =========================================================

from app.models.user import User
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal


# =========================================================
# ROUTERS
# =========================================================

from app.api.auth import router as auth_router
from app.api.transactions import router as transaction_router
from app.api.expenses import router as expense_router
from app.api.budgets import router as budget_router
from app.api.goals import router as goal_router
from app.api import ai_twin
from app.api import reports
from app.api import profile
from app.api.settings import router as settings_router


# =========================================================
# CREATE FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="FinTwin AI API",
    description="Backend API for the FinTwin AI Personal Finance Platform",
    version="1.0.0",
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# STATIC FILES
# =========================================================
#
# Profile pictures will be stored inside:
#
# backend/
# └── uploads/
#     └── profile/
#
# They will be accessible through:
#
# http://127.0.0.1:8000/uploads/profile/filename.jpg
#
# =========================================================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)


# =========================================================
# INCLUDE API ROUTERS
# =========================================================

app.include_router(auth_router)

app.include_router(transaction_router)

app.include_router(expense_router)

app.include_router(budget_router)

app.include_router(goal_router)

app.include_router(ai_twin.router)

app.include_router(reports.router)

app.include_router(profile.router)

app.include_router(settings_router)


# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "FinTwin AI Backend is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# =========================================================
# DATABASE CONNECTION TEST
# =========================================================

@app.get("/database-test")
def database_test():

    with engine.connect() as connection:

        connection.execute(
            text("SELECT 1")
        )

    return {
        "message": "PostgreSQL connected successfully"
    }