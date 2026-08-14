"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  IndianRupee,
  Plus,
  Search,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  Transaction,
} from "@/services/transactionService";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    transaction_type: "expense" as "income" | "expense",
    category: "",
    description: "",
  });

  // ==========================================
  // LOAD TRANSACTIONS
  // ==========================================

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const data = await getTransactions();

      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load transactions"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const totalIncome = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.transaction_type === "income")
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.transaction_type === "expense")
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  }, [transactions]);

  const balance = totalIncome - totalExpenses;

  // ==========================================
  // FILTER
  // ==========================================

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType =
        filter === "all" ||
        transaction.transaction_type === filter;

      const searchValue = search.toLowerCase();

      const matchesSearch =
        transaction.title.toLowerCase().includes(searchValue) ||
        transaction.category.toLowerCase().includes(searchValue);

      return matchesType && matchesSearch;
    });
  }, [transactions, search, filter]);

  // ==========================================
  // CREATE
  // ==========================================

  async function handleCreateTransaction(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await createTransaction({
        title: form.title,
        amount: Number(form.amount),
        transaction_type: form.transaction_type,
        category: form.category,
        description: form.description,
      });

      setForm({
        title: "",
        amount: "",
        transaction_type: "expense",
        category: "",
        description: "",
      });

      setShowModal(false);

      await loadTransactions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create transaction"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // DELETE
  // ==========================================

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTransaction(id);

      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete transaction"
      );
    }
  }

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar />

      <main className="h-screen flex-1 overflow-y-auto p-8">
        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Transactions
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track and manage your financial activity.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Balance"
            value={formatCurrency(balance)}
            icon={<WalletCards size={20} />}
          />

          <SummaryCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            icon={<ArrowUpRight size={20} />}
            valueClass="text-emerald-400"
          />

          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<ArrowDownRight size={20} />}
            valueClass="text-red-400"
          />
        </div>

        {/* TRANSACTIONS CONTAINER */}

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
          {/* FILTER BAR */}

          <div className="flex flex-col gap-4 border-b border-slate-800 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">
                Transaction History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {transactions.length} transactions recorded
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions..."
                  className="w-64 rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as
                      | "all"
                      | "income"
                      | "expense"
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
          </div>

          {/* TABLE */}

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400">
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <WalletCards
                size={32}
                className="mx-auto mb-3 text-slate-600"
              />

              <p className="font-medium text-slate-300">
                No transactions found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add your first transaction to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {transaction.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {transaction.description || "No description"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {transaction.category}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            transaction.transaction_type === "income"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {transaction.transaction_type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {new Date(
                          transaction.created_at
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td
                        className={`px-6 py-4 text-right font-semibold ${
                          transaction.transaction_type === "income"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {transaction.transaction_type === "income"
                          ? "+"
                          : "-"}
                        {formatCurrency(Number(transaction.amount))}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            handleDelete(transaction.id)
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                          title="Delete transaction"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ADD TRANSACTION MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Add Transaction
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Record new income or expense.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreateTransaction}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Title
                </label>

                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder="e.g. Grocery shopping"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Amount
                  </label>

                  <div className="relative">
                    <IndianRupee
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      required
                      min="0.01"
                      step="0.01"
                      type="number"
                      value={form.amount}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          amount: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Type
                  </label>

                  <select
                    value={form.transaction_type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        transaction_type: event.target.value as
                          | "income"
                          | "expense",
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Category
                </label>

                <input
                  required
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value,
                    })
                  }
                  placeholder="e.g. Food, Salary, Transport"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Optional notes"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  disabled={submitting}
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Adding..."
                    : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUMMARY CARD
// ==========================================

function SummaryCard({
  title,
  value,
  icon,
  valueClass = "text-white",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <div className="rounded-lg bg-slate-800 p-2 text-slate-400">
          {icon}
        </div>
      </div>

      <p className={`text-2xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}