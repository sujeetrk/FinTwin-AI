"use client";

import { useEffect, useState } from "react";

import Sidebar from "../../components/layout/Sidebar";
import CashFlowChart from "../../components/dashboard/CashFlowChart";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import SpendingBreakdown from "../../components/dashboard/SpendingBreakdown";

interface FinancialReport {
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
    };

    budget_performance: {
        total_budget: number;
        total_spent: number;
        remaining: number;
        used_percentage: number;
        active_budgets: number;
        over_budget_categories: number;
        status: string;
    };

    goal_performance: {
        total_target: number;
        total_saved: number;
        remaining: number;
        progress: number;
        total_goals: number;
        active_goals: number;
        completed_goals: number;
    };

    report_health: {
        score: number;
        rating: string;
        cash_flow_status: string;
        budget_status: string;
        goal_progress: number;
    };
}

export default function Dashboard() {
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFinancialReport() {
            try {
                const token = localStorage.getItem("access_token");

                if (!token) {
                    setError("Authentication token not found.");
                    return;
                }

                const response = await fetch(
                    "http://127.0.0.1:8000/reports/summary",
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load financial report (${response.status})`
                    );
                }

                const data: FinancialReport = await response.json();

                setReport(data);
            } catch (err) {
                console.error("Dashboard report error:", err);

                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Unable to load financial data.");
                }
            } finally {
                setLoading(false);
            }
        }

        loadFinancialReport();
    }, []);

    function formatCurrency(amount: number) {
        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    }

    if (loading) {
        return (
            <main className="flex h-screen bg-slate-950 text-white">
                <Sidebar />

                <section className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />

                        <p className="mt-4 text-sm text-slate-400">
                            Loading your financial dashboard...
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    if (error || !report) {
        return (
            <main className="flex h-screen bg-slate-950 text-white">
                <Sidebar />

                <section className="flex flex-1 items-center justify-center">
                    <div className="rounded-2xl border border-red-900 bg-red-950/20 p-8 text-center">
                        <h2 className="text-xl font-semibold text-red-400">
                            Unable to load financial data
                        </h2>

                        <p className="mt-3 text-sm text-slate-400">
                            {error || "No financial report available."}
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    const {
        monthly_summary,
        report_health,
    } = report;

    return (
        <main className="flex h-screen overflow-hidden bg-slate-950 text-white">

            <Sidebar />

            <section className="h-screen flex-1 overflow-y-auto bg-slate-900/40 p-8">

                {/* DASHBOARD HEADING */}

                <div className="mb-8">

                    <h1 className="text-3xl font-bold">
                        Financial Dashboard
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Here's an overview of your financial health.
                    </p>

                </div>


                {/* TOP 4 CARDS */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                    <StatCard
                        title="Total Balance"
                        value={formatCurrency(monthly_summary.net_savings)}
                        change={`${monthly_summary.savings_rate}%`}
                    />

                    <StatCard
                        title="Monthly Income"
                        value={formatCurrency(monthly_summary.total_income)}
                        change={monthly_summary.cash_flow_status}
                    />

                    <StatCard
                        title="Monthly Expenses"
                        value={formatCurrency(monthly_summary.total_expenses)}
                        change={`${monthly_summary.expense_transaction_count} transactions`}
                    />

                    <StatCard
                        title="Total Savings"
                        value={formatCurrency(monthly_summary.net_savings)}
                        change={`${monthly_summary.savings_rate}%`}
                    />

                </div>


                {/* ANALYTICS SECTION */}

                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

                    {/* CASH FLOW */}

                    <div className="xl:col-span-2">
                        <CashFlowChart />
                    </div>


                    {/* FINANCIAL HEALTH */}

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                        <h2 className="text-lg font-semibold">
                            Financial Health
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Your overall financial wellness
                        </p>


                        <div className="flex h-52 items-center justify-center">

                            <div className="text-center">

                                <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-emerald-500">

                                    <div>

                                        <p className="text-4xl font-bold">
                                            {report_health.score}
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            / 100
                                        </p>

                                    </div>

                                </div>


                                <p className="mt-4 font-semibold text-emerald-400">
                                    {report_health.rating}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* BOTTOM SECTION */}

                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

                    <div className="xl:col-span-2">
                        <RecentTransactions />
                    </div>

                    <SpendingBreakdown />

                </div>

            </section>

        </main>
    );
}


/* =========================================================
   REUSABLE STAT CARD
========================================================= */

function StatCard({
    title,
    value,
    change,
}: {
    title: string;
    value: string;
    change: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
                {title}
            </p>

            <h2 className="mt-3 text-2xl font-bold">
                {value}
            </h2>

            <p className="mt-3 text-sm text-emerald-400">
                {change}
            </p>

        </div>
    );
}