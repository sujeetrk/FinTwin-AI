"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { name: "Food", value: 8200 },
  { name: "Rent", value: 12000 },
  { name: "Transport", value: 4200 },
  { name: "Shopping", value: 5000 },
  { name: "Others", value: 3000 },
];

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#64748b",
];

export default function SpendingBreakdown() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="text-lg font-semibold">
        Spending Breakdown
      </h2>

      <p className="text-sm text-slate-400">
        Expenses by category
      </p>

      <div className="h-52">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
            >

              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

      <div className="grid grid-cols-2 gap-3">

        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center gap-2 text-sm text-slate-400"
          >

            <div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: COLORS[index],
              }}
            />

            {item.name}

          </div>
        ))}

      </div>

    </div>
  );
}