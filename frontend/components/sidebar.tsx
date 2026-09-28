"use client";

import { ShoppingCart, LayoutDashboard, History, Rocket, Gauge } from "lucide-react";
import { DriverBarChart } from "./driver-bar-chart";
import type { ModelInfo } from "@/lib/api";

interface HistoryEntry {
  id: number;
  probability: number;
  riskLevel: string;
  timestamp: string;
}

export function Sidebar({
  modelInfo,
  history,
}: {
  modelInfo: ModelInfo | null;
  history: HistoryEntry[];
}) {
  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col justify-between bg-[#f7f6f2] px-4 py-6 text-slate-900 dark:bg-sidebar dark:text-white">
      <div>
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2 px-2">
          <ShoppingCart className="h-7 w-7 text-brand-purple" strokeWidth={2.5} />
          <div>
            <p className="text-lg font-bold leading-tight">QuickKart</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
  Customer Churn Predictor
</p>
          </div>
        </div>

        {/* Primary navigation */}
        <nav className="space-y-1">
          <div className="flex items-center gap-3 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </div>
          <p className="px-4 pt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Prediction History
          </p>
          {history.length === 0 ? (
            <p className="px-4 py-2 text-xs text-slate-500">
              Your predictions will appear here.
            </p>
          ) : (
            <ul className="space-y-1">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg px-4 py-2 text-xs text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-sidebar-card"
                >
                  <span className="flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-slate-500" />
                    {entry.timestamp}
                  </span>
                  <span
                    className={
                      entry.riskLevel === "High Risk"
                        ? "font-semibold text-risk-high"
                        : entry.riskLevel === "Medium Risk"
                        ? "font-semibold text-risk-medium"
                        : "font-semibold text-risk-low"
                    }
                  >
                    {Math.round(entry.probability * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Informative panel — real model performance, replacing decorative nav items */}
        <div className="mt-8 rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-sidebar-card dark:shadow-none dark:ring-0">
          <div className="mb-3 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-brand-pink" />
            <p className="text-sm font-semibold">Model Insights</p>
          </div>

          {modelInfo ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-center">
                <MetricTile label="ROC-AUC" value={modelInfo.roc_auc} />
                <MetricTile label="Precision" value={modelInfo.precision} />
                <MetricTile label="Recall" value={modelInfo.recall} />
                <MetricTile label="F1 Score" value={modelInfo.f1_score} />
              </div>

              <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-400">
  Top Churn Drivers
</p>
              <DriverBarChart drivers={modelInfo.top_churn_drivers} />
             <p className="mt-1 text-[11px] leading-snug text-slate-600 dark:text-slate-500">
  Ranked by SHAP feature importance on the held-out test set.
</p>
            </>
          ) : (
            <p className="text-xs text-slate-500">Loading model metrics…</p>
          )}
        </div>
      </div>

      {/* Bottom CTA card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-0 dark:bg-gradient-to-br dark:from-[#2D1B69] dark:to-[#3B1D5C] dark:shadow-none">
        <Rocket className="mb-3 h-7 w-7 text-brand-purple dark:text-brand-pink" />

<p className="text-base font-bold leading-snug text-slate-900 dark:text-white">
  Boost Retention. Maximize Growth.
</p>

<p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
  Make data-driven decisions and keep your customers coming back.
</p>
      </div>
    </aside>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-[#f1f2f4] px-2 py-2 dark:bg-sidebar">
      <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(value * 100)}%</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
