"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  CreditCard,
  Gift,
  Home,
  Lightbulb,
  Lock,
  MapPin,
  Percent,
  Route,
  Sailboat,
  ShieldAlert,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  User,
  UserRound,
  Users,
} from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { ChurnGauge } from "@/components/churn-gauge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import {
  fetchModelInfo,
  predictChurn,
  type ModelInfo,
  type PredictionResponse,
} from "@/lib/api";
import {
  DEFAULT_FORM_STATE,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PAYMENT_MODE_OPTIONS,
  PRIMARY_ACCESS_DEVICE_OPTIONS,
  TOP_CATEGORY_OPTIONS,
  type CustomerFormState,
} from "@/lib/constants";

const HISTORY_KEY = "quickkart-churn-history";

interface HistoryEntry {
  id: number;
  probability: number;
  riskLevel: string;
  timestamp: string;
}

/*
 * Controlled UI ranges.
 * These are tightly bounded to the model's training data distribution
 * (E-Commerce_Customer_Churn_Dataset.xlsx), with only a small rounding
 * buffer added at the edges. Keeping inputs inside the training range
 * keeps the model in its learned distribution and avoids unstable,
 * extrapolated predictions for out-of-range values.
 */
const INPUT_LIMITS = {
  Tenure_Months: { min: 0, max: 75 },
  Hub_To_Home_KM: { min: 0, max: 65 },
  App_Engagement_Hrs: { min: 0.01, max: 1.19 },
  Devices_Linked: { min: 1, max: 7 },
  Saved_Addresses: { min: 1, max: 13 },
  YoY_Spend_Growth_Pct: { min: -35, max: 45 },
  Coupons_Redeemed: { min: 0, max: 16 },
  Monthly_Orders: { min: 0, max: 20 },
  Days_Since_Last_Order: { min: 0, max: 85 },
  Avg_Reward_Value_INR: { min: 0, max: 1500 },
} as const;

// App Engagement is entered in minutes in the UI but stored in hours for the model.
const APP_ENGAGEMENT_MINUTES = {
  min: 1,
  max: 72,
} as const;

function clampNumber(
  value: string,
  min: number,
  max: number
): number | "" {
  if (value === "") return "";

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return Math.min(max, Math.max(min, numericValue));
}

export default function DashboardPage() {
  const [form, setForm] = useState<CustomerFormState>(DEFAULT_FORM_STATE);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore prediction history from this browser only.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);

      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Storage unavailable — history simply starts empty.
    }

    fetchModelInfo()
      .then(setModelInfo)
      .catch(() => setModelInfo(null));
  }, []);

  function updateField<K extends keyof CustomerFormState>(
    key: K,
    value: CustomerFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const numericFields = [
        "Tenure_Months",
        "City_Tier",
        "Hub_To_Home_KM",
        "App_Engagement_Hrs",
        "Devices_Linked",
        "CSAT_Score",
        "Saved_Addresses",
        "Complaint_Last_Month",
        "YoY_Spend_Growth_Pct",
        "Coupons_Redeemed",
        "Monthly_Orders",
        "Days_Since_Last_Order",
        "Avg_Reward_Value_INR",
      ] as const;

      const hasEmptyField = numericFields.some(
        (field) => form[field] === ""
      );

      if (hasEmptyField) {
        setError("Please fill in all fields before predicting churn.");
        setIsLoading(false);
        return;
      }

      const prediction = await predictChurn(form as CustomerFormState);

      setResult(prediction);

      const entry: HistoryEntry = {
        id: Date.now(),
        probability: prediction.churn_probability,
        riskLevel: prediction.risk_level,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const updated = [entry, ...history].slice(0, 8);

      setHistory(updated);

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // Non-fatal — history just won't persist across reloads.
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar modelInfo={modelInfo} history={history} />

      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#faf9f6] via-[#f3f4f6] to-[#e9edf2] dark:bg-slate-950 dark:bg-none">
        {/* Header bar */}
        <div className="relative overflow-hidden bg-white/90 dark:bg-sidebar px-10 pb-12 pt-6">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand-purple/40 blur-3xl" />

          <div className="pointer-events-none absolute -top-10 right-24 h-40 w-40 rounded-full bg-brand-pink/20 blur-3xl" />

          <div className="relative z-10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              aria-label="Go to dashboard"
              title="Dashboard"
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl
                border border-slate-200/80
                bg-white/80
                text-slate-700
                shadow-sm
                backdrop-blur-sm
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-white
                hover:text-slate-900
                hover:shadow-md
                active:translate-y-0
                dark:border-white/10
                dark:bg-white/10
                dark:text-slate-200
                dark:hover:bg-white/15
                dark:hover:text-white
              "
            >
              <Home className="h-[17px] w-[17px]" strokeWidth={2} />
            </button>

            <ThemeToggle />

            <span className="rounded-full bg-slate-900/5 px-4 py-2 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-white">
              Empower retention. Grow together.
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 mx-10 -mt-8 h-52 overflow-hidden rounded-2xl bg-gradient-to-r from-[#EEF0FF] via-[#F1E8FB] to-[#D9CCF5] px-10 py-8 shadow-sm ring-1 ring-slate-200/60 dark:from-slate-800 dark:via-slate-800 dark:to-[#2E1F52] dark:shadow-none dark:ring-0">
          <div className="relative z-10 max-w-xl">
            <h1 className="text-[32px] font-bold text-slate-900 dark:text-white">
              Predict Customer{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                Churn.
              </span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Enter customer details to predict the likelihood of churn and get
              smart recommendations to retain your valuable customers.
            </p>
          </div>

          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[380px] items-center justify-center md:flex">
            <div className="absolute h-64 w-64 rounded-full bg-brand-purple/30 blur-3xl dark:bg-brand-purple/40" />

            <div className="absolute right-6 top-6 h-40 w-40 rounded-full bg-brand-pink/30 blur-3xl dark:bg-brand-pink/30" />

            <HeroCartIllustration className="relative h-48 w-48 drop-shadow-xl md:h-56 md:w-56" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 px-10 py-6 xl:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm dark:border-0 dark:bg-slate-900"
          >
            <div className="mb-7 flex items-center gap-3">
              <UserRound className="h-5 w-5 text-brand-indigo" />

              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Customer Information
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in the customer details below
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
              {/* Customer Tenure */}
              <Field
                label="Customer Tenure (months)"
                icon={Calendar}
                hint="0–75 months"
                type="number"
                min={INPUT_LIMITS.Tenure_Months.min}
                max={INPUT_LIMITS.Tenure_Months.max}
                step="0.1"
                value={form.Tenure_Months}
                onChange={(e) => {
                  updateField(
                    "Tenure_Months",
                    clampNumber(
                      e.target.value,
                      INPUT_LIMITS.Tenure_Months.min,
                      INPUT_LIMITS.Tenure_Months.max
                    )
                  );
                }}
              />

              {/* Days Since Last Order */}
              <Field
                label="Days Since Last Order"
                icon={Calendar}
                hint="0–85 days"
                type="number"
                min={INPUT_LIMITS.Days_Since_Last_Order.min}
                max={INPUT_LIMITS.Days_Since_Last_Order.max}
                step="1"
                value={form.Days_Since_Last_Order}
                onChange={(e) => {
                  updateField(
                    "Days_Since_Last_Order",
                    clampNumber(
                      e.target.value,
                      INPUT_LIMITS.Days_Since_Last_Order.min,
                      INPUT_LIMITS.Days_Since_Last_Order.max
                    )
                  );
                }}
              />

              {/* Monthly Orders */}
              <Field
                label="Monthly Orders"
                icon={ShoppingBag}
                hint="0–20 orders"
                type="number"
                min={INPUT_LIMITS.Monthly_Orders.min}
                max={INPUT_LIMITS.Monthly_Orders.max}
                step="1"
                value={form.Monthly_Orders}
                onChange={(e) => {
                  const nextOrders = clampNumber(
                    e.target.value,
                    INPUT_LIMITS.Monthly_Orders.min,
                    INPUT_LIMITS.Monthly_Orders.max
                  );

                  updateField("Monthly_Orders", nextOrders);

                  // Coupons redeemed cannot exceed monthly orders.
                  if (
                    typeof nextOrders === "number" &&
                    typeof form.Coupons_Redeemed === "number" &&
                    form.Coupons_Redeemed > nextOrders
                  ) {
                    updateField("Coupons_Redeemed", nextOrders);
                  }
                }}
              />

              {/* Coupons Redeemed */}
              <Field
                label="Coupons Redeemed"
                icon={Percent}
                hint="0–16 coupons"
                type="number"
                min={INPUT_LIMITS.Coupons_Redeemed.min}
                max={
                  typeof form.Monthly_Orders === "number"
                    ? Math.min(
                        INPUT_LIMITS.Coupons_Redeemed.max,
                        form.Monthly_Orders
                      )
                    : INPUT_LIMITS.Coupons_Redeemed.max
                }
                step="1"
                value={form.Coupons_Redeemed}
                onChange={(e) => {
                  const dynamicMax =
                    typeof form.Monthly_Orders === "number"
                      ? Math.min(
                          INPUT_LIMITS.Coupons_Redeemed.max,
                          form.Monthly_Orders
                        )
                      : INPUT_LIMITS.Coupons_Redeemed.max;

                  updateField(
                    "Coupons_Redeemed",
                    clampNumber(
                      e.target.value,
                      INPUT_LIMITS.Coupons_Redeemed.min,
                      dynamicMax
                    )
                  );
                }}
              />

              {/* Average Reward Value */}
              <Field
                label="Avg. Reward Value (₹)"
                icon={Gift}
                hint="₹0–₹1,500"
                type="number"
                min={INPUT_LIMITS.Avg_Reward_Value_INR.min}
                max={INPUT_LIMITS.Avg_Reward_Value_INR.max}
                step="1"
                value={form.Avg_Reward_Value_INR}
                onChange={(e) => {
                  updateField(
                    "Avg_Reward_Value_INR",
                    clampNumber(
                      e.target.value,
                      INPUT_LIMITS.Avg_Reward_Value_INR.min,
                      INPUT_LIMITS.Avg_Reward_Value_INR.max
                    )
                  );
                }}
              />

              {/* YoY Spend Growth */}
              <Field
                label="YoY Spend Growth (%)"
                icon={TrendingUp}
                hint="-35% to +45%"
                type="number"
                min={INPUT_LIMITS.YoY_Spend_Growth_Pct.min}
                max={INPUT_LIMITS.YoY_Spend_Growth_Pct.max}
                step="0.1"
                value={form.YoY_Spend_Growth_Pct}
                onChange={(e) => {
                  updateField(
                    "YoY_Spend_Growth_Pct",
                    clampNumber(
                      e.target.value,
                      INPUT_LIMITS.YoY_Spend_Growth_Pct.min,
                      INPUT_LIMITS.YoY_Spend_Growth_Pct.max
                    )
                  );
                }}
              />

              {/* App Engagement — displayed in minutes, stored internally in hours */}
              <Field
                label="App Engagement (minutes)"
                icon={Smartphone}
                hint="1–72 minutes"
                type="number"
                min={APP_ENGAGEMENT_MINUTES.min}
                max={APP_ENGAGEMENT_MINUTES.max}
                step="1"
                value={
                  form.App_Engagement_Hrs === ""
                    ? ""
                    : Math.round(Number(form.App_Engagement_Hrs) * 60)
                }
                onChange={(e) => {
                  const minutes = clampNumber(
                    e.target.value,
                    APP_ENGAGEMENT_MINUTES.min,
                    APP_ENGAGEMENT_MINUTES.max
                  );

                  updateField(
                    "App_Engagement_Hrs",
                    minutes === "" ? "" : minutes / 60
                  );
                }}
              />

              {/* Devices Linked */}
              <Field
                label="Devices Linked"
                icon={Smartphone}
                hint="1–7 devices"
                type="number"
                min={INPUT_LIMITS.Devices_Linked.min}
                max={INPUT_LIMITS.Devices_Linked.max}
                step="1"
                value={form.Devices_Linked}
                onChange={(e) => {
                  updateField(
                    "Devices_Linked",
                    clampNumber(
                      e.target.value,
                      INPUT_LIMITS.Devices_Linked.min,
                      INPUT_LIMITS.Devices_Linked.max
                    )
                  );
                }}
              />

              {/* Saved Addresses */}
              <Field
                label="Saved Addresses"
                icon={MapPin}
                hint="1–13 addresses"
                type="number"
                min={INPUT_LIMITS.Saved_Addresses.min}
                max={INPUT_LIMITS.Saved_Addresses.max}
                step="1"
                value={form.Saved_Addresses}
                onChange={(e) => {
                  updateField(
                    "Saved_Addresses",
                    clampNumber(
                      e.target.value,
                      INPUT_LIMITS.Saved_Addresses.min,
                      INPUT_LIMITS.Saved_Addresses.max
                    )
                  );
                }}
              />

              {/* Distance to Hub */}
              <Field
                label="Distance to Hub (km)"
                icon={Route}
                hint="0–65 km"
                type="number"
                min={INPUT_LIMITS.Hub_To_Home_KM.min}
                max={INPUT_LIMITS.Hub_To_Home_KM.max}
                step="0.1"
                value={form.Hub_To_Home_KM}
                onChange={(e) => {
                  updateField(
                    "Hub_To_Home_KM",
                    clampNumber(
                      e.target.value,
                      INPUT_LIMITS.Hub_To_Home_KM.min,
                      INPUT_LIMITS.Hub_To_Home_KM.max
                    )
                  );
                }}
              />

              {/* Categorical Fields */}
              <SelectField
                label="Preferred Payment Method"
                options={PAYMENT_MODE_OPTIONS}
                value={form.Payment_Mode}
                onChange={(e) =>
                  updateField("Payment_Mode", e.target.value)
                }
              />

              <SelectField
                label="Primary Access Device"
                options={PRIMARY_ACCESS_DEVICE_OPTIONS}
                value={form.Primary_Access_Device}
                onChange={(e) =>
                  updateField("Primary_Access_Device", e.target.value)
                }
              />

              <SelectField
                label="Top Purchase Category"
                options={TOP_CATEGORY_OPTIONS}
                value={form.Top_Category}
                onChange={(e) =>
                  updateField("Top_Category", e.target.value)
                }
              />

              <SelectField
                label="Gender"
                options={GENDER_OPTIONS}
                value={form.Gender}
                onChange={(e) => updateField("Gender", e.target.value)}
              />

              <SelectField
                label="Marital Status"
                options={MARITAL_STATUS_OPTIONS}
                value={form.Marital_Status}
                onChange={(e) =>
                  updateField("Marital_Status", e.target.value)
                }
              />

              <SelectField
                label="City Tier"
                options={["1", "2", "3"]}
                value={String(form.City_Tier)}
                onChange={(e) => {
                  const value = e.target.value;

                  updateField(
                    "City_Tier",
                    value === "" ? "" : Number(value)
                  );
                }}
              />

              <SelectField
                label="CSAT Score (1-5)"
                options={["1", "2", "3", "4", "5"]}
                value={String(form.CSAT_Score)}
                onChange={(e) => {
                  const value = e.target.value;

                  updateField(
                    "CSAT_Score",
                    value === "" ? "" : Number(value)
                  );
                }}
              />

              <SelectField
                label="Complaint Last Month"
                options={["No", "Yes"]}
                value={form.Complaint_Last_Month ? "Yes" : "No"}
                onChange={(e) =>
                  updateField(
                    "Complaint_Last_Month",
                    e.target.value === "Yes" ? 1 : 0
                  )
                }
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-7 w-full"
            >
              <Sparkles className="h-4 w-4" />

              {isLoading ? "Predicting…" : "Predict Churn"}
            </Button>

            {error && (
              <p className="mt-3 text-center text-xs font-medium text-risk-high">
                {error}
              </p>
            )}

            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Lock className="h-3.5 w-3.5" />
              Your data is secure and will not be shared.
            </p>
          </form>

          {/* Prediction Result */}
          <div className="rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm dark:border-0 dark:bg-slate-900">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-brand-pink" />

                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Prediction Result
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Based on the provided customer information
                  </p>
                </div>
              </div>

              {result && <RiskBadge riskLevel={result.risk_level} />}
            </div>

            {!result ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sailboat className="mb-3 h-10 w-10 text-slate-300" />

                <p className="text-sm text-slate-400">
                  Fill in the customer details and run a prediction to see
                  results here.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center py-4">
                  <ChurnGauge probability={result.churn_probability} />
                </div>

                <AlertBanner riskLevel={result.risk_level} />

                <div className="mt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-indigo" />

                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Recommended Actions
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {result.recommended_actions.map((action) => (
                      <li
                        key={action.title}
                        className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 px-4 py-3.5 transition-colors hover:bg-slate-100/70 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                      >
                        <ActionIcon title={action.title} />

                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {action.title}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {action.detail}
                          </p>
                        </div>

                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-0 dark:bg-brand-indigo/15">
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-indigo dark:text-indigo-300" />

                  <p className="text-xs leading-relaxed text-indigo-900 dark:text-indigo-200">
                    Acting now can improve retention and customer lifetime
                    value. Small actions today, strong loyalty tomorrow.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="pb-8 text-center text-xs text-slate-400 dark:text-slate-600">
          © 2026 QuickCart. All Rights Reserved. | Machine
          Learning–Powered Customer Churn Prediction.
        </p>
      </main>
    </div>
  );
}

function HeroCartIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="heroCartStroke"
          x1="20"
          y1="20"
          x2="180"
          y2="180"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="55%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        <linearGradient
          id="heroCartFill"
          x1="20"
          y1="20"
          x2="180"
          y2="180"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <g transform="translate(0, 9)">
        <g opacity="0.9">
          <rect
            x="118"
            y="26"
            width="34"
            height="36"
            rx="6"
            fill="url(#heroCartFill)"
            stroke="url(#heroCartStroke)"
            strokeWidth="3"
          />

          <path
            d="M126 26v-6a9 9 0 0 1 18 0v6"
            stroke="url(#heroCartStroke)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <rect
            x="140"
            y="52"
            width="26"
            height="28"
            rx="5"
            fill="url(#heroCartFill)"
            stroke="url(#heroCartStroke)"
            strokeWidth="2.5"
          />

          <path
            d="M146 52v-4a7 7 0 0 1 14 0v4"
            stroke="url(#heroCartStroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        <path
          d="M18 44h14l8 18"
          stroke="url(#heroCartStroke)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M40 62h122l-14 62a10 10 0 0 1-9.8 8H61.8a10 10 0 0 1-9.7-7.6L36 70"
          stroke="url(#heroCartStroke)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#heroCartFill)"
          fillOpacity="0.25"
        />

        <path
          d="M52 78h108M60 96h94M68 114h80"
          stroke="url(#heroCartStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />

        <path
          d="M75 78v54M100 78v54M125 78v54"
          stroke="url(#heroCartStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />

        <circle
          cx="76"
          cy="150"
          r="9"
          fill="url(#heroCartFill)"
          stroke="url(#heroCartStroke)"
          strokeWidth="5"
        />

        <circle
          cx="128"
          cy="150"
          r="9"
          fill="url(#heroCartFill)"
          stroke="url(#heroCartStroke)"
          strokeWidth="5"
        />

        <path
          d="M164 96l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"
          fill="url(#heroCartStroke)"
          opacity="0.85"
        />

        <path
          d="M32 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"
          fill="url(#heroCartStroke)"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}

function RiskBadge({ riskLevel }: { riskLevel: string }) {
  const styles =
    riskLevel === "High Risk"
      ? "bg-red-50 text-risk-high dark:bg-risk-high/15"
      : riskLevel === "Medium Risk"
      ? "bg-amber-50 text-risk-medium dark:bg-risk-medium/15"
      : "bg-green-50 text-risk-low dark:bg-risk-low/15";

  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${styles}`}
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      {riskLevel}
    </span>
  );
}

function AlertBanner({ riskLevel }: { riskLevel: string }) {
  const copy =
    riskLevel === "High Risk"
      ? {
          title: "This customer is likely to churn.",
          detail: "Take immediate action with personalized engagement.",
        }
      : riskLevel === "Medium Risk"
      ? {
          title: "This customer shows early churn signals.",
          detail: "Consider proactive engagement to strengthen loyalty.",
        }
      : {
          title: "This customer looks likely to stay.",
          detail: "Continue standard engagement and monitor over time.",
        };

  const styles =
    riskLevel === "High Risk"
      ? "bg-red-50 text-risk-high dark:bg-risk-high/15"
      : riskLevel === "Medium Risk"
      ? "bg-amber-50 text-risk-medium dark:bg-risk-medium/15"
      : "bg-green-50 text-risk-low dark:bg-risk-low/15";

  return (
    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 ${styles}`}>
      <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />

      <div>
        <p className="text-sm font-semibold">{copy.title}</p>
        <p className="text-xs opacity-90">{copy.detail}</p>
      </div>
    </div>
  );
}

function ActionIcon({ title }: { title: string }) {
  const iconClass = "h-4 w-4";

  const wrap = (bg: string, icon: React.ReactNode) => (
    <span
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${bg}`}
    >
      {icon}
    </span>
  );

  if (title.includes("discount")) {
    return wrap(
      "bg-purple-100 dark:bg-brand-purple/20",
      <Gift className={`${iconClass} text-brand-purple`} />
    );
  }

  if (title.includes("proactively")) {
    return wrap(
      "bg-pink-100 dark:bg-brand-pink/20",
      <User className={`${iconClass} text-brand-pink`} />
    );
  }

  if (title.includes("issues")) {
    return wrap(
      "bg-green-100 dark:bg-risk-low/20",
      <Truck className={`${iconClass} text-green-600 dark:text-risk-low`} />
    );
  }

  if (title.includes("recommendations")) {
    return wrap(
      "bg-amber-100 dark:bg-risk-medium/20",
      <Star className={`${iconClass} text-amber-500 dark:text-risk-medium`} />
    );
  }

  return wrap(
    "bg-slate-100 dark:bg-slate-700",
    <CreditCard className={`${iconClass} text-slate-400`} />
  );
}