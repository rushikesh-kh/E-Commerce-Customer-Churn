"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

// Relative influence weights, ranked per the notebook's global SHAP importance
// (Section 8.1) — used only for ordering and bar length, not exact SHAP units.
const DRIVER_WEIGHTS: Record<string, number> = {
  Days_Since_Last_Order: 100,
  CSAT_Score: 82,
  Monthly_Orders: 74,
  App_Engagement_Hrs: 63,
  Tenure_Months: 55,
};

export function DriverBarChart({ drivers }: { drivers: string[] }) {
  const data = drivers.map((name) => ({
    name: name.replaceAll("_", " "),
    weight: DRIVER_WEIGHTS[name] ?? 40,
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: "#CBD5E1", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="weight" radius={[0, 6, 6, 0]} barSize={12}>
          {data.map((entry) => (
            <Cell key={entry.name} fill="url(#driverGradient)" />
          ))}
        </Bar>
        <defs>
          <linearGradient id="driverGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
