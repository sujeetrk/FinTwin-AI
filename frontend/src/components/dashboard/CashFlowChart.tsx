"use client";

import { useEffect, useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getCashFlow } from "@/lib/api";

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
}

export default function CashFlowChart() {

  const [data, setData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    async function loadCashFlow() {

      try {

        setLoading(true);
        setError("");

        const result = await getCashFlow();

        setData(result);

      } catch (err) {

        console.error(
          "Failed to load cash flow:",
          err
        );

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Failed to load cash flow data."
          );
        }

      } finally {

        setLoading(false);

      }
    }

    loadCashFlow();

  }, []);


  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      {/* HEADER */}

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
          Cash Flow
        </h2>

        <p className="text-sm text-slate-400">
          Income vs expenses over the last 6 months
        </p>

      </div>


      {/* LOADING */}

      {loading && (

        <div className="flex h-72 items-center justify-center">

          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />

        </div>

      )}


      {/* ERROR */}

      {!loading && error && (

        <div className="flex h-72 items-center justify-center">

          <div className="rounded-lg border border-red-900 bg-red-950/20 p-4 text-center">

            <p className="text-sm text-red-400">
              {error}
            </p>

          </div>

        </div>

      )}


      {/* NO DATA */}

      {!loading && !error && data.length === 0 && (

        <div className="flex h-72 items-center justify-center">

          <p className="text-sm text-slate-500">
            No cash flow data available.
          </p>

        </div>

      )}


      {/* CHART */}

      {!loading && !error && data.length > 0 && (

        <div className="h-72 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart data={data}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
              />

              <XAxis
                dataKey="month"
                stroke="#64748b"
              />

              <YAxis
                stroke="#64748b"
              />

              <Tooltip
                formatter={(value) =>
                  `₹${Number(value).toLocaleString("en-IN")}`
                }
              />

              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                name="Income"
              />

              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.1}
                name="Expenses"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      )}

    </div>
  );
}