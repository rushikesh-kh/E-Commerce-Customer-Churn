import type { CustomerFormState } from "./constants";

// In production the frontend is served by the same FastAPI process, so a
// relative path is enough. In local development, point at the API server.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

export interface RecommendedAction {
  title: string;
  detail: string;
}

export interface PredictionResponse {
  churn_probability: number;
  risk_level: "Low Risk" | "Medium Risk" | "High Risk";
  operating_threshold: number;
  recommended_actions: RecommendedAction[];
}

export interface ModelInfo {
  roc_auc: number;
  pr_auc: number;
  precision: number;
  recall: number;
  f1_score: number;
  operating_threshold: number;
  top_churn_drivers: string[];
}

export async function predictChurn(customer: CustomerFormState): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.detail ?? "Prediction request failed.");
  }

  return response.json();
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  const response = await fetch(`${API_BASE}/api/model-info`);
  if (!response.ok) throw new Error("Could not load model info.");
  return response.json();
}
