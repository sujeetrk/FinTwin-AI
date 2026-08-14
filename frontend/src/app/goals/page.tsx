"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

type Goal = {
  id: number;
  name: string;
  target_amount: number;
  saved_amount: number;
  remaining: number;
  progress: number;
  target_date: string;
  category: string;
  status: string;
};

type GoalSummary = {
  total_target: number;
  total_saved: number;
  remaining: number;
  overall_progress: number;
  goal_count: number;
  completed_goals: number;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [goalName, setGoalName] = useState("");
  const [category, setCategory] = useState("Technology");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [moneyAmount, setMoneyAmount] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editGoal, setEditGoal] = useState({
    name: "",
    category: "",
    target_amount: "",
    saved_amount: "",
    target_date: "",
  });

  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadGoalData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const [goalsResponse, summaryResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/goals/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://127.0.0.1:8000/goals/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!goalsResponse.ok) {
        throw new Error("Failed to load goals.");
      }

      if (!summaryResponse.ok) {
        throw new Error("Failed to load goal summary.");
      }

      const goalsData = await goalsResponse.json();
      const summaryData = await summaryResponse.json();

      setGoals(goalsData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Goal loading error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load goal data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);
      setCreateError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      if (!goalName.trim()) {
        throw new Error("Please enter a goal name.");
      }

      if (!targetAmount || Number(targetAmount) <= 0) {
        throw new Error("Please enter a valid target amount.");
      }

      if (Number(savedAmount) < 0) {
        throw new Error("Saved amount cannot be negative.");
      }

      if (Number(savedAmount) > Number(targetAmount)) {
        throw new Error(
          "Saved amount cannot be greater than target amount."
        );
      }

      if (!targetDate) {
        throw new Error("Please select a target date.");
      }

      const response = await fetch(
        "http://127.0.0.1:8000/goals/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: goalName.trim(),
            target_amount: Number(targetAmount),
            saved_amount: Number(savedAmount),
            target_date: targetDate,
            category: category,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail || "Failed to create goal."
        );
      }

      // Close modal
      setShowCreateModal(false);

      // Reset form
      setGoalName("");
      setCategory("Technology");
      setTargetAmount("");
      setSavedAmount("0");
      setTargetDate("");

      // Reload goals + summary
      await loadGoalData();
    } catch (error) {
      console.error("Create goal error:", error);

      setCreateError(
        error instanceof Error
          ? error.message
          : "Unable to create goal."
      );
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadGoalData();
  }, [loadGoalData]);

  const handleAddMoney = async () => {
    if (!selectedGoal || !moneyAmount) return;

    const amount = Number(moneyAmount);

    if (amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:8000/goals/${selectedGoal.id}/add-money?amount=${amount}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add money");
      }

      // Close modal
      setShowAddMoneyModal(false);
      setSelectedGoal(null);
      setMoneyAmount("");

      // Refresh Goals + Summary
      await loadGoalData();

    } catch (error) {
      console.error("Add money error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to add money."
      );
    }
  };

  const handleUpdateGoal = async () => {
    if (!selectedGoal) return;

    if (
      !editGoal.name.trim() ||
      !editGoal.category ||
      !editGoal.target_amount ||
      !editGoal.target_date
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const targetAmount = Number(editGoal.target_amount);
    const savedAmount = Number(editGoal.saved_amount);

    if (targetAmount <= 0) {
      alert("Target amount must be greater than 0.");
      return;
    }

    if (savedAmount < 0) {
      alert("Saved amount cannot be negative.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:8000/goals/${selectedGoal.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: editGoal.name.trim(),
            target_amount: targetAmount,
            saved_amount: savedAmount,
            target_date: editGoal.target_date,
            category: editGoal.category,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.detail || "Failed to update goal"
        );
      }

      // Close modal
      setShowEditModal(false);
      setSelectedGoal(null);

      // Refresh goals + summary
      await loadGoalData();

    } catch (error) {
      console.error("Update goal error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update goal."
      );
    }
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoal) return;

    try {
      setIsDeleting(true);

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://127.0.0.1:8000/goals/${deletingGoal.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete goal.");
      }

      setDeletingGoal(null);

      // Reload goals + summary
      await loadGoalData();
    } catch (error) {
      console.error("Delete goal error:", error);
      alert("Failed to delete goal.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar />

      <main className="h-screen flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Goals
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track your savings goals and financial milestones.
            </p>
          </div>

          <button
            onClick={() => {
              setCreateError("");
              setShowCreateModal(true);
            }}
            className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            + Add Goal
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p className="mt-10 text-slate-400">
            Loading goals...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="mt-10 text-red-400">
            {error}
          </p>
        )}

        {/* Page Content */}
        {!loading && !error && summary && (
          <>
            {/* Summary Cards */}
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {/* Total Goal Amount */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Total Goal Amount
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {formatCurrency(summary.total_target)}
                </h2>
              </div>

              {/* Total Saved */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Total Saved
                </p>

                <h2 className="mt-3 text-2xl font-bold text-emerald-400">
                  {formatCurrency(summary.total_saved)}
                </h2>
              </div>

              {/* Remaining */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Remaining
                </p>

                <h2 className="mt-3 text-2xl font-bold text-amber-400">
                  {formatCurrency(summary.remaining)}
                </h2>
              </div>

              {/* Active Goals */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Active Goals
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {summary.goal_count}
                </h2>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Overall Goal Progress
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Progress across all your financial goals
                  </p>
                </div>

                <p className="font-bold">
                  {summary.overall_progress.toFixed(1)}%
                </p>
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(
                      summary.overall_progress,
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-sm text-slate-400">
                <span>
                  {formatCurrency(summary.total_saved)} saved
                </span>

                <span>
                  {formatCurrency(summary.total_target)} target
                </span>
              </div>
            </div>

            {/* Goals */}
            <div className="mt-7">
              <div>
                <h2 className="text-xl font-bold">
                  Your Goals
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Track progress toward your financial targets.
                </p>
              </div>

              {/* No Goals */}
              {goals.length === 0 ? (
                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
                  <p className="text-slate-400">
                    No goals created yet.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {goals.map((goal) => {
                    const progress = Math.min(goal.progress, 100);

                    return (
                      <div
                        key={goal.id}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-6"
                      >
                        {/* Goal Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold">
                              {goal.name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                              {goal.category}
                            </p>
                          </div>

                          <span className="text-sm font-medium text-emerald-400">
                            {goal.status}
                          </span>
                        </div>

                        {/* Amounts */}
                        <div className="mt-6 flex justify-between">
                          <div>
                            <p className="text-sm text-slate-400">
                              Saved
                            </p>

                            <p className="mt-1 text-lg font-bold text-emerald-400">
                              {formatCurrency(goal.saved_amount)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-slate-400">
                              Target
                            </p>

                            <p className="mt-1 text-lg font-bold">
                              {formatCurrency(goal.target_amount)}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        {/* Progress Information */}
                        <div className="mt-3 flex justify-between text-sm text-slate-400">
                          <span>
                            {goal.progress.toFixed(1)}% complete
                          </span>

                          <span>
                            {formatCurrency(goal.remaining)} remaining
                          </span>
                        </div>

                        {/* Target Date + Add Money */}
                        <div className="mt-5 flex items-end justify-between border-t border-slate-800 pt-4">
                          <div>
                            <p className="text-sm text-slate-400">Target Date</p>
                             <p className="mt-1 font-medium text-white">
                              {goal.target_date
                                ? new Date(
                                    `${goal.target_date}T00:00:00`
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGoal(goal);

                                setEditGoal({
                                  name: goal.name,
                                  category: goal.category || "Other",
                                  target_amount: String(goal.target_amount),
                                  saved_amount: String(goal.saved_amount),
                                  target_date: goal.target_date || "",
                                });

                                setShowEditModal(true);
                              }}
                              className="
                                rounded-lg
                                border border-slate-600
                                px-4 py-2
                                text-sm font-medium
                                text-slate-300
                                transition
                                hover:bg-slate-800
                                hover:text-white
                              "
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGoal(goal);
                                setMoneyAmount("");
                                setShowAddMoneyModal(true);
                              }}
                              className="
                                rounded-lg
                                border border-emerald-500/40
                                px-4 py-2
                                text-sm font-medium
                                text-emerald-400
                                transition
                                hover:bg-emerald-500/10
                              "
                            >
                              + Add Money
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingGoal(goal)}
                              className="
                                rounded-lg
                                border border-red-600
                                px-4 py-2
                                text-sm font-medium
                                text-red-400
                                transition
                                hover:bg-red-950
                              "
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ================================================= */}
      {/* CREATE GOAL MODAL */}
      {/* ================================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Create Goal
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Set a new financial savings target.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xl text-slate-400 transition hover:text-white"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateGoal}
              className="mt-6 space-y-5"
            >

              {/* Goal Name */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Goal Name
                </label>

                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Example: New Car"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                >
                  <option value="Technology">
                    Technology
                  </option>

                  <option value="Emergency">
                    Emergency
                  </option>

                  <option value="Travel">
                    Travel
                  </option>

                  <option value="Vehicle">
                    Vehicle
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Home">
                    Home
                  </option>

                  <option value="Investment">
                    Investment
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* Target + Saved */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Target Amount */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Target Amount
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={(e) =>
                      setTargetAmount(e.target.value)
                    }
                    placeholder="150000"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Saved Amount */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Already Saved
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={savedAmount}
                    onChange={(e) =>
                      setSavedAmount(e.target.value)
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target Date
                </label>

                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) =>
                    setTargetDate(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                  required
                />
              </div>

              {/* Error */}
              {createError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {createError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="rounded-lg border border-slate-700 px-5 py-3 text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* ADD MONEY MODAL */}
      {/* ================================================= */}

      {showAddMoneyModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Add Money
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Add savings to{" "}
                  <span className="font-semibold text-white">
                    {selectedGoal.name}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="text-xl text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-white">
                Amount
              </label>

              <input
                type="number"
                min="1"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
                placeholder="Enter amount"
                className="
                  w-full
                  rounded-lg
                  border border-slate-700
                  bg-slate-950
                  px-4 py-3
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  focus:border-emerald-500
                "
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddMoneyModal(false)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddMoney}
                disabled={!moneyAmount || Number(moneyAmount) <= 0}
                className="
                  rounded-lg
                  bg-emerald-500
                  px-5 py-2.5
                  font-semibold
                  text-slate-950
                  hover:bg-emerald-400
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Add Money
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* EDIT GOAL MODAL */}
      {/* ================================================= */}

      {showEditModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Edit Goal
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Update your financial savings goal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-xl text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Goal Name */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-white">
                Goal Name
              </label>

              <input
                type="text"
                value={editGoal.name}
                onChange={(e) =>
                  setEditGoal({
                    ...editGoal,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-white">
                Category
              </label>

              <select
                value={editGoal.category}
                onChange={(e) =>
                  setEditGoal({
                    ...editGoal,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="Technology">Technology</option>
                <option value="Travel">Travel</option>
                <option value="Education">Education</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Home">Home</option>
                <option value="Emergency">Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Amounts */}
            <div className="mb-4 grid grid-cols-2 gap-4">

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Target Amount
                </label>

                <input
                  type="number"
                  value={editGoal.target_amount}
                  onChange={(e) =>
                    setEditGoal({
                      ...editGoal,
                      target_amount: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Saved Amount
                </label>

                <input
                  type="number"
                  value={editGoal.saved_amount}
                  onChange={(e) =>
                    setEditGoal({
                      ...editGoal,
                      saved_amount: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

            </div>

            {/* Target Date */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-white">
                Target Date
              </label>

              <input
                type="date"
                value={editGoal.target_date}
                onChange={(e) =>
                  setEditGoal({
                    ...editGoal,
                    target_date: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateGoal}
                className="
                  rounded-lg
                  bg-emerald-500
                  px-5 py-2.5
                  font-semibold
                  text-slate-950
                  transition
                  hover:bg-emerald-400
                "
              >
                Save Changes
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* DELETE GOAL MODAL */}
      {/* ================================================= */}

      {deletingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">

            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Delete Goal?
              </h2>

              <button
                onClick={() => setDeletingGoal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="mb-5 text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {deletingGoal.name}
              </span>
              ?
            </p>

            <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-400">
              This action cannot be undone.
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingGoal(null)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-600 px-5 py-2.5 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteGoal}
                disabled={isDeleting}
                className="rounded-lg bg-red-500 px-5 py-2.5 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Goal"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}