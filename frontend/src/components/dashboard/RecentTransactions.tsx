"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/lib/api";

interface Transaction {
  id: number;
  title: string;
  amount: number;
  transaction_type: string;
  category: string;
  description?: string | null;
  created_at?: string | null;
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        setError("");

        const data = await getTransactions();

        setTransactions(data);
      } catch (err) {
        console.error("Failed to load transactions:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load transactions");
        }
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  function formatCurrency(amount: number, type: string) {
    const isIncome = type?.toLowerCase() === "income";
    const formatted = `₹${Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
    return isIncome ? `+${formatted}` : `-${formatted}`;
  }

  function formatDate(dateString?: string | null) {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <p className="text-sm text-slate-400">Your latest financial activity</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
          {error}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No recent transactions found.
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => {
            const isIncome =
              transaction.transaction_type?.toLowerCase() === "income";

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-none"
              >
                <div>
                  <p className="font-medium text-white">{transaction.title}</p>
                  <p className="text-sm text-slate-500">
                    {transaction.category}
                    {transaction.created_at ? ` • ${formatDate(transaction.created_at)}` : ""}
                  </p>
                </div>

                <p
                  className={`font-semibold ${
                    isIncome ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {formatCurrency(transaction.amount, transaction.transaction_type)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}