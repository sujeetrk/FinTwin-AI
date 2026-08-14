# FinTwin AI

## AI-Powered Personal Finance Digital Twin

FinTwin AI is an intelligent personal finance platform that combines financial management, analytics, and Generative AI to create a personalized digital representation of a user's financial behavior.

The platform allows users to manage transactions, expenses, budgets, and financial goals while receiving personalized financial insights through an AI assistant powered by Google Gemini.

---

# 🚀 Project Overview

Traditional personal finance applications mainly display financial information through dashboards and charts.

FinTwin AI goes one step further by creating a **Financial Digital Twin** for each authenticated user.

The system collects the user's actual:

- Income
- Expenses
- Transactions
- Budgets
- Savings goals
- Financial progress

and transforms this information into a structured financial context.

This context is then provided to Google Gemini, allowing FinTwin AI to answer financial questions using the user's actual financial situation.

The project was developed in four major phases.

---

# 🧩 Development Phases

```text
┌─────────────────────────────────────────────────────────────┐
│                       FinTwin AI                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PHASE 1        PHASE 2        PHASE 3        PHASE 4       │
│                                                             │
│ Foundation  →  Financial   →   LLM / AI   →   Intelligent   │
│ & Auth          Management      Integration     Integration  │
│                                                             │
│ Users           Transactions    Gemini          Dynamic     │
│ JWT             Budgets         Context         Dashboard   │
│ Database        Goals           AI Chat         Chatbot     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 🏗️ Overall System Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Next.js Frontend   │
                         │ React + TypeScript   │
                         │ Tailwind CSS         │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP / REST API
                                    ▼
                         ┌──────────────────────┐
                         │   FastAPI Backend    │
                         │       Python         │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
              Transactions       Budgets           Goals
                    │               │                │
                    └───────────────┼────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      PostgreSQL      │
                         │       Database       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Financial Context    │
                         │      Builder         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Google Gemini     │
                         │    Generative AI     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    FinTwin AI Chat   │
                         │ Personalized Insights│
                         └──────────────────────┘
```

---

# 🔐 PHASE 1 — Foundation & Authentication

## Objective

Build the fundamental application architecture and establish secure authentication and user management.

## Major Components

- Next.js application
- React frontend
- FastAPI backend
- PostgreSQL database
- SQLAlchemy ORM
- User registration
- User login
- JWT authentication
- Protected routes
- Authentication guard
- Profile management
- Settings
- Global navigation

## Phase 1 Architecture

```text
                    PHASE 1
          FOUNDATION & AUTHENTICATION

                         USER
                           │
                           ▼
                ┌──────────────────┐
                │  Next.js Frontend│
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ FastAPI Backend  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Authentication   │
                │                  │
                │ JWT              │
                │ Password Hashing │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │    PostgreSQL    │
                │      Users       │
                └──────────────────┘
```

## Authentication Flow

```text
User
 │
 ▼
Register / Login
 │
 ▼
FastAPI
 │
 ▼
Validate Credentials
 │
 ▼
Generate JWT
 │
 ▼
Next.js
 │
 ▼
Store access_token
 │
 ▼
AuthGuard
 │
 ▼
Protected Pages
```

---

# 💰 PHASE 2 — Financial Management & Analytics

## Objective

Build the core personal finance management system and convert financial records into useful analytics.

## Major Components

### Transactions

- Add income
- Add expenses
- Transaction categories
- Transaction descriptions
- Transaction history
- Delete transactions

### Budgets

- Category-based budgets
- Monthly budgets
- Budget tracking
- Budget usage analysis
- Remaining budget calculation

### Goals

- Financial goals
- Target amount
- Saved amount
- Target date
- Goal progress
- Remaining amount

### Reports

- Income analysis
- Expense analysis
- Savings analysis
- Budget performance
- Goal performance
- Financial health score

## Phase 2 Architecture

```text
                    PHASE 2
        FINANCIAL MANAGEMENT & ANALYTICS

                         USER
                           │
                           ▼
                ┌──────────────────┐
                │ Next.js Dashboard│
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   FastAPI APIs   │
                └────────┬─────────┘
                         │
             ┌───────────┼───────────┐
             │           │           │
             ▼           ▼           ▼
       Transactions   Budgets      Goals
             │           │           │
             └───────────┼───────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   PostgreSQL     │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Financial        │
                │ Analytics        │
                └────────┬─────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      Cash Flow     Spending       Goal Progress
                    Analysis
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                ┌──────────────────┐
                │ Financial Health │
                │      Score       │
                └──────────────────┘
```

## Dashboard

The financial dashboard provides:

- Total balance
- Monthly income
- Monthly expenses
- Total savings
- Cash-flow visualization
- Spending breakdown
- Recent transactions
- Financial health score

---

# 🤖 PHASE 3 — LLM / FinTwin AI Integration

## Objective

Integrate Generative AI with the user's actual financial data.

The goal is not to create a generic chatbot.

Instead, FinTwin AI builds a personalized financial context from the authenticated user's database records before sending the request to Google Gemini.

## Phase 3 Architecture

```text
                       PHASE 3
                LLM / FIN TWIN AI

                         USER
                           │
                           ▼
                ┌──────────────────┐
                │ Floating AI Chat │
                └────────┬─────────┘
                         │
                         │ User Question
                         ▼
                ┌──────────────────┐
                │ FastAPI AI API   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ JWT User         │
                │ Identification   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Financial        │
                │ Context Builder  │
                └────────┬─────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
        Transactions   Budgets     Goals
              │          │          │
              └──────────┼──────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Financial Context│
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Google Gemini    │
                │ Generative AI    │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Personalized AI  │
                │ Financial Answer │
                └──────────────────┘
```

## Financial Context

The system builds a structured context containing:

```text
FINANCIAL SUMMARY
├── Total Income
├── Total Expenses
├── Balance
└── Savings Rate

CURRENT MONTH
├── Monthly Income
└── Monthly Expenses

BUDGET
├── Total Budget
├── Budget Remaining
└── Budget Usage

GOALS
├── Target Amount
├── Saved Amount
├── Remaining Amount
├── Progress
└── Target Date

RECENT TRANSACTIONS
├── Title
├── Amount
├── Type
├── Category
├── Description
└── Date
```

## AI System Instructions

FinTwin AI is designed to:

- Use the user's actual financial data
- Never invent transactions
- Never invent income or expenses
- Never invent budgets or goals
- Clearly state when information is unavailable
- Use Indian Rupees (₹)
- Explain calculations when relevant
- Consider income, expenses, savings, budgets and goals together
- Provide practical financial guidance
- Avoid guaranteed investment returns
- Avoid claiming to be a certified financial advisor
- Avoid making decisions on behalf of the user

## Example AI Questions

Users can ask:

```text
How can I improve my savings?

Am I spending too much?

How can I manage my budget better?

How am I progressing toward my goals?

How much more do I need to save for my laptop?

Where am I spending the most?

What should I focus on financially?
```

The response is generated using the user's available financial context.

---

# 🧠 PHASE 4 — Intelligent Dashboard & Final Integration

## Objective

Connect the financial analytics and AI system into a unified Financial Digital Twin experience.

Phase 4 transforms the individual modules into a complete, interactive financial intelligence platform.

## Major Components

- Dynamic dashboard
- Database-driven financial cards
- Real-time transaction display
- Dynamic cash-flow chart
- Dynamic spending breakdown
- Financial health score
- Floating AI chatbot
- Suggested AI questions
- AI loading state
- AI error handling
- Responsive chatbot interface
- Authenticated page integration
- Global AI assistant

## Phase 4 Architecture

```text
                  PHASE 4
       INTELLIGENT FINANCIAL PLATFORM

                         USER
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌───────────────┐        ┌────────────────┐
       │   Dashboard   │        │ FinTwin AI Chat│
       └───────┬───────┘        └───────┬────────┘
               │                        │
               ▼                        ▼
       ┌───────────────┐        ┌────────────────┐
       │ Financial APIs│        │   AI API       │
       └───────┬───────┘        └───────┬────────┘
               │                        │
               │                        ▼
               │                ┌────────────────┐
               │                │ Financial      │
               │                │ Context Builder│
               │                └───────┬────────┘
               │                        │
               │                        ▼
               │                ┌────────────────┐
               │                │ Google Gemini  │
               │                └───────┬────────┘
               │                        │
               └────────────┬───────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │    PostgreSQL    │
                   │                  │
                   │ Users            │
                   │ Transactions     │
                   │ Budgets          │
                   │ Goals            │
                   └──────────────────┘
```

## Final User Experience

```text
                         FIN TWIN AI
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
      Dashboard          Financial Data        AI Twin
          │                   │                   │
          ▼                   ▼                   ▼
      Analytics          Transactions         Gemini AI
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
                   Personalized Insights
```

---

# 🛠️ Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

## Database

- PostgreSQL

## AI

- Google Gemini API
- Google GenAI SDK

## Development Tools

- Git
- GitHub
- VS Code
- Swagger / OpenAPI

---

# 📁 Project Structure

```text
FinTwin-AI/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── expenses/
│   │   │   ├── budgets/
│   │   │   ├── goals/
│   │   │   ├── ai-twin/
│   │   │   ├── reports/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   │
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   ├── dashboard/
│   │   │   ├── layout/
│   │   │   └── auth/
│   │   │
│   │   └── lib/
│   │
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── ...
│
├── screenshots/
│
├── .env.example
├── .gitignore
└── README.md
```

---

# 🔄 Core Data Flow

## Financial Data Flow

```text
User
 │
 ▼
Add Transaction
 │
 ▼
Next.js
 │
 ▼
FastAPI
 │
 ▼
JWT Authentication
 │
 ▼
PostgreSQL
 │
 ▼
Financial Analytics
 │
 ├── Income
 ├── Expenses
 ├── Savings
 ├── Budget
 └── Goals
 │
 ▼
Dashboard
```

## AI Data Flow

```text
User Question
 │
 ▼
Floating FinTwin AI
 │
 ▼
POST /ai-twin/chat
 │
 ▼
JWT Authentication
 │
 ▼
Identify Current User
 │
 ▼
Build Financial Context
 │
 ├── Transactions
 ├── Budgets
 ├── Goals
 └── Financial Summary
 │
 ▼
Google Gemini
 │
 ▼
Personalized Response
 │
 ▼
FinTwin AI Chatbot
```

---

# 🔑 Environment Variables

Create a `.env` file for the backend:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_database_url
```

Create `.env.local` for the frontend:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Important

Never commit:

```text
.env
.env.local
```

to GitHub.

Never expose:

- Gemini API keys
- Database passwords
- JWT secrets
- Private credentials

Use `.env.example` to show the required environment variables without exposing real credentials.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/fintwin-ai.git

cd fintwin-ai
```

---

# 🔧 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scriptsctivate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the backend `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_database_url
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Start Next.js:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🔒 Security

FinTwin AI uses JWT authentication to protect user-specific financial information.

Every protected financial request identifies the authenticated user before accessing financial records.

The system uses user-specific database filtering for:

- Transactions
- Budgets
- Goals
- Financial reports
- AI financial context

Sensitive environment variables are excluded from version control.

---

# 📊 Core Features

| Feature | Status |
|---|---|
| User Registration | ✅ |
| User Login | ✅ |
| JWT Authentication | ✅ |
| Protected Routes | ✅ |
| Profile Management | ✅ |
| Settings | ✅ |
| Transaction Management | ✅ |
| Income Tracking | ✅ |
| Expense Tracking | ✅ |
| Budget Management | ✅ |
| Savings Goals | ✅ |
| Financial Reports | ✅ |
| Dynamic Dashboard | ✅ |
| Cash Flow Analysis | ✅ |
| Spending Breakdown | ✅ |
| Financial Health Score | ✅ |
| Gemini Integration | ✅ |
| Financial Context Builder | ✅ |
| Personalized AI Responses | ✅ |
| Floating AI Chatbot | ✅ |
| Global Authenticated Chatbot | ✅ |

---

# 🎯 What Makes FinTwin AI Different?

FinTwin AI is designed around the concept of a **Financial Digital Twin**.

Instead of treating AI as a standalone chatbot, the application connects Generative AI with structured financial data.

```text
Traditional Finance App

Financial Data
      │
      ▼
 Dashboard
```

FinTwin AI:

```text
Financial Data
      │
      ├──────────────► Dashboard
      │
      ▼
Financial Context
      │
      ▼
Generative AI
      │
      ▼
Personalized Financial Intelligence
```

The AI therefore acts as an intelligent interface over the user's financial digital twin.

---

# 🔮 Future Improvements

Potential future enhancements include:

- Advanced financial forecasting
- AI-powered spending anomaly detection
- Personalized monthly financial plans
- Financial goal prediction
- Automated financial alerts
- Advanced financial trend analysis
- AI-generated financial reports
- Improved AI conversation memory
- Cloud deployment
- Production monitoring
- Advanced financial visualization

---

# 📸 Screenshots

Add application screenshots to the repository under:

```text
screenshots/
```

Recommended screenshots:

```text
screenshots/
├── landing-page.png
├── login.png
├── dashboard.png
├── transactions.png
├── expenses.png
├── budgets.png
├── goals.png
├── reports.png
├── ai-twin.png
├── chatbot.png
├── profile.png
└── settings.png
```

---

# 👨‍💻 Author

## Sujeeth R K

---

# 📄 License

MIT License

Copyright (c) 2026 Sujeetrk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

# ⭐ FinTwin AI

**Track your money. Understand your finances.  
Build your financial future with AI.**
