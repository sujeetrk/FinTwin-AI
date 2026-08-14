"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  CalendarDays,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Activity,
  Target,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";


// ==========================================================
// TYPES
// ==========================================================

interface ReportData {
  report_period: {
    month: number;
    month_name: string;
    year: number;
    days_in_month: number;
  };

  monthly_summary: {
    total_income: number;
    total_expenses: number;
    net_savings: number;
    savings_rate: number;
    transaction_count: number;
    income_transaction_count: number;
    expense_transaction_count: number;
    cash_flow_status: string;
  };

  expense_analysis: {
    total_expenses: number;
    category_count: number;
    highest_spending_category: string | null;
    highest_spending_amount: number;
    highest_spending_percentage: number;
    categories: {
      category: string;
      amount: number;
      percentage: number;
    }[];
  };

  budget_performance: {
    total_budget: number;
    total_spent: number;
    remaining: number;
    used_percentage: number;
    active_budgets: number;
    over_budget_categories: number;
    status: string;
    categories: {
      category: string;
      budget: number;
      spent: number;
      remaining: number;
      used_percentage: number;
      status: string;
    }[];
  };

  goal_performance: {
    total_target: number;
    total_saved: number;
    remaining: number;
    progress: number;
    total_goals: number;
    active_goals: number;
    completed_goals: number;
    goals: {
      id: number;
      name: string;
      category: string;
      target_amount: number;
      saved_amount: number;
      remaining: number;
      progress: number;
      status: string;
      target_date: string;
    }[];
  };

  report_health: {
    score: number;
    rating: string;
    cash_flow_status: string;
    budget_status: string;
    goal_progress: number;
  };
}


// ==========================================================
// MAIN COMPONENT
// ==========================================================

export default function ReportsPage() {

  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [report, setReport] = useState<ReportData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


// ==========================================================
// FETCH REPORT
// ==========================================================

  const fetchReport = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/reports/summary?month=${month}&year=${year}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {

        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to load financial report."
        );
      }

      const data: ReportData = await response.json();

      setReport(data);

    } catch (err) {

      console.error("Report Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load financial report."
      );

    } finally {

      setLoading(false);
    }
  };


// ==========================================================
// LOAD REPORT
// ==========================================================

  useEffect(() => {

    fetchReport();

  }, [month, year]);


// ==========================================================
// MONTHS
// ==========================================================

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];


// ==========================================================
// LOADING
// ==========================================================

  if (loading) {

    return (
      <main className="flex h-screen overflow-hidden bg-slate-950 text-white">

        <Sidebar />

        <section className="h-screen flex flex-1 items-center justify-center overflow-y-auto">

          <div className="text-center">

            <RefreshCw
              className="mx-auto animate-spin text-emerald-400"
              size={32}
            />

            <p className="mt-4 text-slate-400">
              Generating financial report...
            </p>

          </div>

        </section>

      </main>
    );
  }


// ==========================================================
// ERROR
// ==========================================================

  if (error || !report) {

    return (
      <main className="flex h-screen overflow-hidden bg-slate-950 text-white">

        <Sidebar />

        <section className="h-screen flex flex-1 items-center justify-center overflow-y-auto">

          <div className="text-center">

            <h2 className="text-xl font-semibold text-red-400">
              Unable to Load Report
            </h2>

            <p className="mt-2 text-slate-400">
              {error}
            </p>

            <button
              onClick={fetchReport}
              className="mt-5 rounded-lg bg-emerald-500 px-5 py-2 font-medium text-slate-950"
            >
              Retry
            </button>

          </div>

        </section>

      </main>
    );
  }


// ==========================================================
// DATA SHORTCUTS
// ==========================================================

  const monthly = report.monthly_summary;

  const budget = report.budget_performance;

  const goals = report.goal_performance;

  const health = report.report_health;

  const expenses = report.expense_analysis;


// ==========================================================
// PAGE
// ==========================================================

  return (

    <main className="flex h-screen overflow-hidden bg-slate-950 text-white">

      <Sidebar />


      <section className="h-screen flex-1 overflow-y-auto bg-slate-900/40 p-8">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">

              <FileText size={30} />

            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Financial Reports
              </h1>

              <p className="mt-1 text-slate-400">
                Review your monthly financial performance.
              </p>

            </div>

          </div>


          {/* FILTERS */}

          <div className="flex flex-wrap items-center gap-3">


            {/* MONTH */}

            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4">

              <CalendarDays
                size={18}
                className="text-emerald-400"
              />

              <select
                value={month}
                onChange={(e) =>
                  setMonth(Number(e.target.value))
                }
                className="bg-transparent py-3 outline-none"
              >

                {months.map((monthName, index) => (

                  <option
                    key={monthName}
                    value={index + 1}
                    className="bg-slate-900"
                  >
                    {monthName}
                  </option>

                ))}

              </select>

            </div>


            {/* YEAR */}

            <select
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value))
              }
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 outline-none"
            >

              {[2025, 2026, 2027, 2028].map((y) => (

                <option key={y} value={y}>
                  {y}
                </option>

              ))}

            </select>


            {/* REFRESH */}

            <button
              onClick={fetchReport}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-emerald-400 transition hover:bg-emerald-500/20"
            >

              <RefreshCw size={18} />

              Refresh Report

            </button>

          </div>

        </div>


        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">


          <SummaryCard
            title="Monthly Income"
            value={`₹${monthly.total_income.toLocaleString()}`}
            subtitle={`${monthly.income_transaction_count} income transaction(s)`}
            icon={<TrendingUp size={22} />}
            positive
          />


          <SummaryCard
            title="Monthly Expenses"
            value={`₹${monthly.total_expenses.toLocaleString()}`}
            subtitle={`${monthly.expense_transaction_count} expense transaction(s)`}
            icon={<TrendingDown size={22} />}
          />


          <SummaryCard
            title="Net Balance"
            value={`₹${monthly.net_savings.toLocaleString()}`}
            subtitle="Income − Expenses"
            icon={<Wallet size={22} />}
            positive={monthly.net_savings >= 0}
          />


          <SummaryCard
            title="Savings Rate"
            value={`${monthly.savings_rate.toFixed(1)}%`}
            subtitle={monthly.cash_flow_status}
            icon={<PiggyBank size={22} />}
            positive={monthly.savings_rate > 0}
          />

        </div>


        {/* ==================================================
            HEALTH REPORT
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-7">


          <div className="mb-6 flex items-center gap-3">

            <Activity className="text-emerald-400" />

            <div>

              <h2 className="text-xl font-semibold">
                Financial Health Report
              </h2>

              <p className="text-sm text-slate-400">
                Overall assessment for{" "}
                {report.report_period.month_name}{" "}
                {report.report_period.year}
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">


            <ReportBox title="Health Score">

              <p className="text-4xl font-bold">

                {health.score}

                <span className="text-lg text-slate-500">
                  /100
                </span>

              </p>

              <p className="mt-2 font-semibold text-emerald-400">
                {health.rating}
              </p>

            </ReportBox>


            <ReportBox title="Cash Flow">

              <p className="text-lg font-semibold">
                {health.cash_flow_status}
              </p>

            </ReportBox>


            <ReportBox title="Budget Status">

              <p className="text-lg font-semibold">
                {health.budget_status}
              </p>

            </ReportBox>


            <ReportBox title="Goal Progress">

              <p className="text-lg font-semibold">
                {health.goal_progress.toFixed(1)}%
              </p>

            </ReportBox>

          </div>

        </div>


        {/* ==================================================
            BUDGET + GOALS
        ================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">


          {/* BUDGET */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  Budget Report
                </h2>

                <p className="text-sm text-slate-400">
                  Monthly budget performance
                </p>

              </div>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">

                {budget.status}

              </span>

            </div>


            <div className="mb-3 flex justify-between">

              <span className="text-slate-400">
                Budget Used
              </span>

              <span className="font-semibold">
                {budget.used_percentage.toFixed(1)}%
              </span>

            </div>


            <ProgressBar
              percentage={budget.used_percentage}
            />


            <div className="mt-6 grid grid-cols-3 gap-4">


              <MiniCard
                title="Total Budget"
                value={`₹${budget.total_budget.toLocaleString()}`}
              />


              <MiniCard
                title="Spent"
                value={`₹${budget.total_spent.toLocaleString()}`}
              />


              <MiniCard
                title="Remaining"
                value={`₹${budget.remaining.toLocaleString()}`}
              />

            </div>


            <p className="mt-5 text-sm text-slate-400">

              {budget.active_budgets} active budget(s) ·{" "}

              {budget.over_budget_categories} over-budget category(s)

            </p>

          </div>


          {/* GOALS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">


            <div className="mb-6 flex items-center gap-3">

              <Target className="text-emerald-400" />

              <div>

                <h2 className="text-xl font-semibold">
                  Savings Goals
                </h2>

                <p className="text-sm text-slate-400">
                  Overall savings goal progress
                </p>

              </div>

            </div>


            <div className="mb-3 flex justify-between">

              <span className="text-slate-400">
                Overall Progress
              </span>

              <span className="font-semibold text-emerald-400">

                {goals.progress.toFixed(1)}%

              </span>

            </div>


            <ProgressBar percentage={goals.progress} />


            <div className="mt-6 grid grid-cols-3 gap-4">


              <MiniCard
                title="Target"
                value={`₹${goals.total_target.toLocaleString()}`}
              />


              <MiniCard
                title="Saved"
                value={`₹${goals.total_saved.toLocaleString()}`}
              />


              <MiniCard
                title="Remaining"
                value={`₹${goals.remaining.toLocaleString()}`}
              />

            </div>


            <p className="mt-5 text-sm text-slate-400">

              {goals.active_goals} active goal(s) ·{" "}

              {goals.completed_goals} completed

            </p>

          </div>

        </div>


        {/* ==================================================
            EXPENSE ANALYSIS
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-7">


          <h2 className="text-xl font-semibold">
            Expense Analysis
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Spending distribution for the selected month
          </p>


          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">


            <MiniCard
              title="Total Expenses"
              value={`₹${expenses.total_expenses.toLocaleString()}`}
            />


            <MiniCard
              title="Top Category"
              value={expenses.highest_spending_category || "None"}
            />


            <MiniCard
              title="Top Category Spending"
              value={`₹${expenses.highest_spending_amount.toLocaleString()}`}
            />

          </div>


          {/* CATEGORY LIST */}

          {expenses.categories.length > 0 && (

            <div className="mt-6 space-y-4">

              {expenses.categories.map((category) => (

                <div
                  key={category.category}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                >

                  <div className="mb-3 flex justify-between">

                    <span className="font-medium">
                      {category.category}
                    </span>

                    <span className="text-slate-400">

                      ₹{category.amount.toLocaleString()} ·{" "}

                      {category.percentage.toFixed(1)}%

                    </span>

                  </div>

                  <ProgressBar
                    percentage={category.percentage}
                  />

                </div>

              ))}

            </div>

          )}

        </div>


        {/* ==================================================
            INDIVIDUAL GOALS
        ================================================== */}

        {goals.goals.length > 0 && (

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-7">


            <h2 className="text-xl font-semibold">
              Goal Details
            </h2>


            <div className="mt-5 space-y-4">


              {goals.goals.map((goal) => (

                <div
                  key={goal.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 p-5"
                >


                  <div className="flex flex-wrap justify-between gap-3">

                    <div>

                      <h3 className="font-semibold">
                        {goal.name}
                      </h3>

                      <p className="text-sm text-slate-400">
                        {goal.category}
                      </p>

                    </div>


                    <span className="text-sm text-emerald-400">
                      {goal.status}
                    </span>

                  </div>


                  <div className="mt-5">

                    <ProgressBar
                      percentage={goal.progress}
                    />

                  </div>


                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">


                    <MiniCard
                      title="Target"
                      value={`₹${goal.target_amount.toLocaleString()}`}
                    />


                    <MiniCard
                      title="Saved"
                      value={`₹${goal.saved_amount.toLocaleString()}`}
                    />


                    <MiniCard
                      title="Remaining"
                      value={`₹${goal.remaining.toLocaleString()}`}
                    />


                    <MiniCard
                      title="Progress"
                      value={`${goal.progress.toFixed(1)}%`}
                    />

                  </div>


                  <p className="mt-4 text-sm text-slate-500">

                    Target Date: {goal.target_date}

                  </p>

                </div>

              ))}

            </div>

          </div>

        )}


      </section>

    </main>
  );
}


// ==========================================================
// COMPONENTS
// ==========================================================

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  positive = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  positive?: boolean;
}) {

  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2
            className={`mt-3 text-2xl font-bold ${
              positive
                ? "text-emerald-400"
                : ""
            }`}
          >
            {value}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {subtitle}
          </p>

        </div>


        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">

          {icon}

        </div>

      </div>

    </div>

  );
}


function ReportBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">

      <p className="mb-3 text-sm text-slate-400">
        {title}
      </p>

      {children}

    </div>

  );
}


function MiniCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-2 font-semibold">
        {value}
      </p>

    </div>

  );
}


function ProgressBar({
  percentage,
}: {
  percentage: number;
}) {

  const safePercentage = Math.min(
    Math.max(percentage, 0),
    100
  );

  return (

    <div className="h-2 overflow-hidden rounded-full bg-slate-800">

      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
        style={{
          width: `${safePercentage}%`,
        }}
      />

    </div>

  );
}
