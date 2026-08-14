"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ExpenseCategoryChart from "@/components/charts/ExpenseCategoryChart";
import ExpenseTrendChart from "@/components/charts/ExpenseTrendChart";

type ExpenseSummary = {
  total_expenses: number;
  monthly_expenses: number;
  expense_count: number;
  average_expense: number;
};

type CategoryExpense = {
  category: string;
  amount: number;
};

type ExpenseTrend = {
  year: number;
  month: number;
  amount: number;
};

type Expense = {
  id: number;
  title: string;
  amount: number;
  transaction_type: string;
  category: string;
  description?: string | null;
  created_at: string;
};

export default function ExpensesPage() {
  const [summary, setSummary] =
    useState<ExpenseSummary | null>(null);

  const [categories, setCategories] =
    useState<CategoryExpense[]>([]);

  const [trend, setTrend] =
    useState<ExpenseTrend[]>([]);

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD EXPENSE DATA
  // =========================================================

  useEffect(() => {
    async function loadExpenseData() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Load all expense APIs at the same time
        const [
          summaryResponse,
          categoriesResponse,
          trendResponse,
          expensesResponse,
        ] = await Promise.all([
          fetch(
            "http://127.0.0.1:8000/expenses/summary",
            {
              headers,
            }
          ),

          fetch(
            "http://127.0.0.1:8000/expenses/categories",
            {
              headers,
            }
          ),

          fetch(
            "http://127.0.0.1:8000/expenses/trend",
            {
              headers,
            }
          ),

          fetch(
            "http://127.0.0.1:8000/expenses/",
            {
              headers,
            }
          ),
        ]);

        // Check whether any API failed
        if (
          !summaryResponse.ok ||
          !categoriesResponse.ok ||
          !trendResponse.ok ||
          !expensesResponse.ok
        ) {
          throw new Error(
            "Failed to load expense data"
          );
        }

        // Convert API responses to JSON
        const summaryData =
          await summaryResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        const trendData =
          await trendResponse.json();

        const expensesData =
          await expensesResponse.json();

        // Store API data
        setSummary(summaryData);
        setCategories(categoriesData);
        setTrend(trendData);
        setExpenses(expensesData);
      } catch (error) {
        console.error(
          "Expense data error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadExpenseData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT */}

      <main className="h-screen flex-1 overflow-y-auto p-8">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div>
          <h1 className="text-3xl font-bold">
            Expenses
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Track and analyze your spending.
          </p>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <p className="mt-10 text-slate-400">
            Loading expenses...
          </p>
        ) : summary ? (
          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

              {/* TOTAL EXPENSES */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-400">
                  Total Expenses
                </p>

                <h2 className="mt-3 text-2xl font-bold text-red-400">
                  ₹
                  {summary.total_expenses.toLocaleString(
                    "en-IN"
                  )}
                </h2>

              </div>

              {/* THIS MONTH */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-400">
                  This Month
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  ₹
                  {summary.monthly_expenses.toLocaleString(
                    "en-IN"
                  )}
                </h2>

              </div>

              {/* TRANSACTION COUNT */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-400">
                  Transactions
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {summary.expense_count}
                </h2>

              </div>

              {/* AVERAGE EXPENSE */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-400">
                  Average Expense
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  ₹
                  {summary.average_expense.toLocaleString(
                    "en-IN"
                  )}
                </h2>

              </div>

            </div>

            {/* =================================================
                EXPENSE ANALYTICS
            ================================================= */}

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

              {/* ===============================================
                  SPENDING BY CATEGORY CHART
              =============================================== */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-lg font-semibold">
                  Spending by Category
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Where your money is going
                </p>

                <div className="mt-6">

                  {categories.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No expense data available.
                    </p>
                  ) : (
                    <ExpenseCategoryChart
                      data={categories}
                    />
                  )}

                </div>

              </div>

              {/* ===============================================
                  MONTHLY SPENDING TREND CHART
              =============================================== */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-lg font-semibold">
                  Monthly Spending Trend
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Your spending over time
                </p>

                <div className="mt-6">

                  {trend.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No trend data available.
                    </p>
                  ) : (
                    <ExpenseTrendChart
                      data={trend}
                    />
                  )}

                </div>

              </div>

            </div>

            {/* =================================================
                RECENT EXPENSES
            ================================================= */}

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">

              {/* TABLE HEADER */}

              <div className="border-b border-slate-800 p-6">

                <h2 className="text-lg font-semibold">
                  Recent Expenses
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Your latest spending activity
                </p>

              </div>

              {/* NO EXPENSES */}

              {expenses.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  No expenses recorded.
                </div>
              ) : (

                /* EXPENSE TABLE */

                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    {/* TABLE HEAD */}

                    <thead className="bg-slate-950 text-xs uppercase text-slate-500">

                      <tr>

                        <th className="px-6 py-4">
                          Expense
                        </th>

                        <th className="px-6 py-4">
                          Category
                        </th>

                        <th className="px-6 py-4">
                          Date
                        </th>

                        <th className="px-6 py-4 text-right">
                          Amount
                        </th>

                      </tr>

                    </thead>

                    {/* TABLE BODY */}

                    <tbody>

                      {expenses.map((expense) => (

                        <tr
                          key={expense.id}
                          className="border-t border-slate-800"
                        >

                          {/* EXPENSE NAME */}

                          <td className="px-6 py-4">

                            <p className="font-medium">
                              {expense.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {expense.description ||
                                "No description"}
                            </p>

                          </td>

                          {/* CATEGORY */}

                          <td className="px-6 py-4 text-sm text-slate-300">
                            {expense.category}
                          </td>

                          {/* DATE */}

                          <td className="px-6 py-4 text-sm text-slate-400">

                            {new Date(
                              expense.created_at
                            ).toLocaleDateString(
                              "en-IN"
                            )}

                          </td>

                          {/* AMOUNT */}

                          <td className="px-6 py-4 text-right font-semibold text-red-400">

                            -₹
                            {expense.amount.toLocaleString(
                              "en-IN"
                            )}

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

          </>
        ) : (

          /* ===================================================
              ERROR
          =================================================== */

          <p className="mt-10 text-red-400">
            Unable to load expense data.
          </p>

        )}

      </main>

    </div>
  );
}