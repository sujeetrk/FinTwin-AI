"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

type BudgetSummary = {
  total_budget: number;
  total_spent: number;
  remaining: number;
  percentage_used: number;
  budget_count: number;
};

type Budget = {
  id: number;
  category: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  status: string;
};

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Education",
  "Travel",
  "Other",
];

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

export default function BudgetsPage() {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // CREATE BUDGET STATES
  // =====================================================

  const [showModal, setShowModal] = useState(false);

  const currentDate = new Date();

  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // EDIT BUDGET STATES
  // =====================================================

  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // LOAD BUDGET DATA
  // =====================================================

  const loadBudgetData = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [summaryResponse, budgetsResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/budgets/summary", {
          headers,
        }),

        fetch("http://127.0.0.1:8000/budgets/current", {
          headers,
        }),
      ]);

      if (!summaryResponse.ok || !budgetsResponse.ok) {
        throw new Error("Failed to load budget data");
      }

      const summaryData = await summaryResponse.json();
      const budgetsData = await budgetsResponse.json();

      setSummary(summaryData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error("Budget data error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);

  // =====================================================
  // CREATE BUDGET
  // =====================================================

  async function createBudget(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    try {
      setCreating(true);

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/budgets/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            category,
            amount: Number(amount),
            month: Number(month),
            year: Number(year),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail || "Failed to create budget."
        );

        return;
      }

      // Close modal
      setShowModal(false);

      // Reset form
      setCategory("Food");
      setAmount("");
      setMonth(currentDate.getMonth() + 1);
      setYear(currentDate.getFullYear());
      setError("");

      // Refresh budget information
      await loadBudgetData();

    } catch (error) {
      console.error("Create budget error:", error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setCreating(false);
    }
  }

  // =====================================================
  // STATUS COLORS
  // =====================================================

  function getStatusColor(status: string) {
    if (status === "Exceeded") {
      return "text-red-400";
    }

    if (status === "Warning") {
      return "text-yellow-400";
    }

    return "text-emerald-400";
  }

  function getProgressColor(status: string) {
    return "bg-emerald-500";
  }

  // =====================================================
  // EDIT BUDGET HANDLERS
  // =====================================================

  function handleEditClick(budget: Budget) {
    setEditingBudget(budget);
    setEditAmount(budget.amount.toString());
  }

  function handleDeleteClick(budget: Budget) {
    setDeletingBudget(budget);
  }

  async function handleConfirmDelete() {
    if (!deletingBudget) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:8000/budgets/${deletingBudget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.detail || "Failed to delete budget"
        );
      }

      // Close confirmation modal
      setDeletingBudget(null);

      // Reload summary + current budgets
      await loadBudgetData();

    } catch (error) {
      console.error("Delete budget error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete budget."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdateBudget() {
    if (!editingBudget) return;

    const amt = Number(editAmount);

    if (!amt || amt <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:8000/budgets/${editingBudget.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            amount: amt,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to update budget"
        );
      }

      setEditingBudget(null);
      setEditAmount("");

      // Reload budget data
      await loadBudgetData();
    } catch (error) {
      console.error("Update budget error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update budget."
      );
    }
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">

      <Sidebar />

      <main className="h-screen flex-1 overflow-y-auto p-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              Budgets
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Plan your spending and stay within your limits.
            </p>

          </div>

          <button
            onClick={() => {
              setError("");
              setShowModal(true);
            }}
            className="
              rounded-lg
              bg-emerald-500
              px-5
              py-2.5
              font-semibold
              text-slate-950
              transition
              hover:bg-emerald-400
            "
          >
            + Add Budget
          </button>

        </div>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading ? (

          <p className="mt-10 text-slate-400">
            Loading budgets...
          </p>

        ) : summary ? (

          <>

            {/* ================================================= */}
            {/* SUMMARY CARDS */}
            {/* ================================================= */}

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

              {/* MONTHLY BUDGET */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-400">
                  Monthly Budget
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  ₹{summary.total_budget.toLocaleString("en-IN")}
                </h2>

              </div>

              {/* TOTAL SPENT */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-400">
                  Total Spent
                </p>

                <h2 className="mt-3 text-2xl font-bold text-red-400">
                  ₹{summary.total_spent.toLocaleString("en-IN")}
                </h2>

              </div>

              {/* REMAINING */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-400">
                  Remaining
                </p>

                <h2
                  className={`mt-3 text-2xl font-bold ${
                    summary.remaining < 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  ₹{summary.remaining.toLocaleString("en-IN")}
                </h2>

              </div>

              {/* ACTIVE BUDGETS */}

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

                <p className="text-sm text-slate-400">
                  Active Budgets
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {summary.budget_count}
                </h2>

              </div>

            </div>

            {/* ================================================= */}
            {/* MONTHLY BUDGET USAGE */}
            {/* ================================================= */}

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-semibold">
                    Monthly Budget Usage
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Overall spending against your monthly budget
                  </p>

                </div>

                <p className="text-lg font-semibold">
                  {summary.percentage_used.toFixed(1)}%
                </p>

              </div>

              {/* PROGRESS */}

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className={
                    summary.percentage_used >= 100
                      ? "h-full rounded-full bg-red-500"
                      : summary.percentage_used >= 80
                      ? "h-full rounded-full bg-emerald-500"
                      : "h-full rounded-full bg-emerald-500"
                  }
                  style={{
                    width: `${Math.min(
                      summary.percentage_used,
                      100
                    )}%`,
                  }}
                />

              </div>

              <div className="mt-3 flex justify-between text-sm text-slate-400">

                <span>
                  ₹{summary.total_spent.toLocaleString("en-IN")} spent
                </span>

                <span>
                  ₹{summary.total_budget.toLocaleString("en-IN")} budget
                </span>

              </div>

            </div>

            {/* ================================================= */}
            {/* CATEGORY BUDGETS */}
            {/* ================================================= */}

            <div className="mt-6">

              <div className="mb-4">

                <h2 className="text-xl font-semibold">
                  Category Budgets
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Track spending limits by category.
                </p>

              </div>

              {budgets.length === 0 ? (

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">

                  <p className="text-slate-400">
                    No budgets created for this month.
                  </p>

                  <button
                    onClick={() => {
                      setError("");
                      setShowModal(true);
                    }}
                    className="mt-4 font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Create your first budget
                  </button>

                </div>

              ) : (

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                  {budgets.map((budget) => (

                    <div
                      key={budget.id}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                    >

                      {/* CATEGORY + STATUS */}

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {budget.category}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            Monthly spending limit
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm ${
                              budget.status === "Exceeded"
                                ? "text-red-400"
                                : budget.status === "Warning"
                                  ? "text-yellow-400"
                                  : "text-emerald-400"
                            }`}
                          >
                            {budget.status}
                          </span>

                          {/* Edit Budget */}
                          <button
                            onClick={() => handleEditClick(budget)}
                            className="rounded-md border border-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                          >
                            Edit
                          </button>

                          {/* Delete Budget */}
                          <button
                            onClick={() => handleDeleteClick(budget)}
                            className="rounded-md border border-red-900 px-3 py-1 text-sm text-red-400 transition hover:bg-red-950 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                        </div>
                

                      {/* SPENT / BUDGET */}

                      <div className="mt-6 flex items-end justify-between">

                        <div>

                          <p className="text-sm text-slate-400">
                            Spent
                          </p>

                          <p className="mt-1 text-xl font-bold">
                            ₹{budget.spent.toLocaleString("en-IN")}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-sm text-slate-400">
                            Budget
                          </p>

                          <p className="mt-1 font-semibold">
                            ₹{budget.amount.toLocaleString("en-IN")}
                          </p>

                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className={`h-full rounded-full ${getProgressColor(
                            budget.status
                          )}`}
                          style={{
                            width: `${Math.min(
                              budget.percentage_used,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                      {/* PERCENTAGE */}

                      <div className="mt-3 flex items-center justify-between text-sm">

                        <span className="text-slate-400">
                          {budget.percentage_used.toFixed(1)}% used
                        </span>

                        <span
                          className={
                            budget.remaining < 0
                              ? "text-red-400"
                              : "text-slate-400"
                          }
                        >

                          {budget.remaining >= 0
                            ? `₹${budget.remaining.toLocaleString(
                                "en-IN"
                              )} remaining`
                            : `₹${Math.abs(
                                budget.remaining
                              ).toLocaleString(
                                "en-IN"
                              )} over budget`}

                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </>

        ) : (

          <p className="mt-10 text-red-400">
            Unable to load budget data.
          </p>

        )}

      </main>

      {/* ================================================= */}
      {/* CREATE BUDGET MODAL */}
      {/* ================================================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Create Budget
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Set a monthly spending limit.
                </p>

              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="text-2xl text-slate-400 hover:text-white"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={createBudget}
              className="mt-6 space-y-5"
            >

              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-emerald-500
                  "
                >

                  {categories.map((item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  ))}

                </select>

              </div>

              {/* AMOUNT */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Monthly Budget
                </label>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    px-4
                    py-3
                    text-white
                    outline-none
                    placeholder:text-slate-600
                    focus:border-emerald-500
                  "
                />

              </div>

              {/* MONTH / YEAR */}

              <div className="grid grid-cols-2 gap-4">

                {/* MONTH */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Month
                  </label>

                  <select
                    value={month}
                    onChange={(e) =>
                      setMonth(Number(e.target.value))
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-700
                      bg-slate-950
                      px-4
                      py-3
                      text-white
                      outline-none
                      focus:border-emerald-500
                    "
                  >

                    {months.map((monthName, index) => (

                      <option
                        key={monthName}
                        value={index + 1}
                      >
                        {monthName}
                      </option>

                    ))}

                  </select>

                </div>

                {/* YEAR */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Year
                  </label>

                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    value={year}
                    onChange={(e) =>
                      setYear(Number(e.target.value))
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-700
                      bg-slate-950
                      px-4
                      py-3
                      text-white
                      outline-none
                      focus:border-emerald-500
                    "
                  />

                </div>

              </div>

              {/* ERROR */}

              {error && (

                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">

                  <p className="text-sm text-red-400">
                    {error}
                  </p>

                </div>

              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                  }}
                  className="
                    rounded-lg
                    border
                    border-slate-700
                    px-5
                    py-2.5
                    font-medium
                    text-slate-300
                    hover:bg-slate-800
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="
                    rounded-lg
                    bg-emerald-500
                    px-5
                    py-2.5
                    font-semibold
                    text-slate-950
                    transition
                    hover:bg-emerald-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {creating
                    ? "Creating..."
                    : "Create Budget"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* EDIT BUDGET MODAL */}
      {/* ================================================= */}

      {editingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Edit Budget
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Update your monthly spending limit.
                </p>
              </div>

              <button
                onClick={() => setEditingBudget(null)}
                className="text-xl text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-200">
                Category
              </label>

              <input
                value={editingBudget.category}
                disabled
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400"
              />
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-200">
                Monthly Budget
              </label>

              <input
                type="number"
                min="1"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="mt-7 flex justify-end gap-3">

              <button
                onClick={() => setEditingBudget(null)}
                className="rounded-lg border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateBudget}
                className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Save Changes
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* DELETE BUDGET MODAL */}
      {/* ================================================= */}

      {deletingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Delete Budget?
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Are you sure you want to delete the{" "}
                  <span className="font-semibold text-white">
                    {deletingBudget.category}
                  </span>{" "}
                  budget?
                </p>
              </div>

              <button
                onClick={() => setDeletingBudget(null)}
                disabled={deleting}
                className="text-xl text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-red-900/50 bg-red-950/30 p-4">
              <p className="text-sm text-red-300">
                This action cannot be undone.
              </p>
            </div>

            <div className="mt-7 flex justify-end gap-3">

              <button
                onClick={() => setDeletingBudget(null)}
                disabled={deleting}
                className="rounded-lg border border-slate-700 px-5 py-3 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Budget"}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}