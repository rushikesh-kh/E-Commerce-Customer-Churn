# =============================================================================
# model.py
# -----------------------------------------------------------------------------
# Loads the trained artifact produced by the notebook and exposes a single
# predict() method that reproduces the notebook's final inference pipeline:
#   1. CatBoost churn probability            (Notebook Section 7.12.2)
#   2. Isotonic probability calibration      (Notebook Section 7.9)
#   3. Operating-threshold risk classification (Notebook Section 7.11.1)
#
# The artifact is a single joblib bundle exported from the notebook — see the
# EXPORT SNIPPET at the bottom of this file for how to produce it.
# =============================================================================

import os
from pathlib import Path

import joblib

from .scripts import build_feature_frame

# Path to the trained artifact bundle. Overridable via the MODEL_PATH
# environment variable so the same code runs locally and in deployment.
DEFAULT_MODEL_PATH = Path(__file__).resolve().parent.parent / "model" / "churn_model.pkl"
MODEL_PATH = Path(os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH))

# Risk-band cut points, expressed as a fraction of the operating threshold.
# A customer is only ever flagged "High Risk" at or above the threshold the
# notebook selected (0.30) at a minimum-precision constraint of 60%.
MEDIUM_RISK_RATIO = 0.6


class ChurnModel:
    """Wraps the trained CatBoost model, its calibrator, and operating threshold."""

    def __init__(self, artifact_path: Path = MODEL_PATH):
        if not artifact_path.exists():
            raise FileNotFoundError(
                f"Model artifact not found at '{artifact_path}'. "
                "Run the export snippet at the bottom of model.py from the "
                "notebook to generate it."
            )

        artifact = joblib.load(artifact_path)
        self.model = artifact["model"]
        self.calibrator = artifact["calibrator"]
        self.threshold = float(artifact["threshold"])

    def predict(self, raw_input: dict) -> dict:
        """
        Run one customer record through the full inference pipeline and
        return a calibrated churn probability plus a risk classification.
        """
        features = build_feature_frame(raw_input)

        raw_probability = self.model.predict_proba(features)[:, 1][0]
        calibrated_probability = float(self.calibrator.predict([raw_probability])[0])
        calibrated_probability = min(max(calibrated_probability, 0.0), 1.0)

        risk_level = self._classify_risk(calibrated_probability)

        return {
            "churn_probability": round(calibrated_probability, 4),
            "risk_level": risk_level,
            "operating_threshold": self.threshold,
            "recommended_actions": recommend_actions(raw_input, risk_level),
        }

    def _classify_risk(self, probability: float) -> str:
        if probability >= self.threshold:
            return "High Risk"
        if probability >= self.threshold * MEDIUM_RISK_RATIO:
            return "Medium Risk"
        return "Low Risk"


def recommend_actions(raw_input: dict, risk_level: str) -> list[dict]:
    """
    Translate the customer's profile into concrete retention actions.

    Rules are grounded in the notebook's SHAP findings (Section 8.1-8.2):
    recency, satisfaction, order activity, and engagement are the strongest
    churn drivers, so recommendations target whichever of those look weakest.
    """
    if risk_level == "Low Risk":
        return [
            {
                "title": "Continue standard engagement",
                "detail": "No elevated churn signals detected; maintain regular communication.",
            }
        ]

    actions = []

    if raw_input["Days_Since_Last_Order"] >= 14:
        actions.append({
            "title": "Offer a personalized retention discount",
            "detail": "Extended inactivity is the model's strongest churn signal; a limited-time offer can re-trigger a purchase.",
        })

    if raw_input["CSAT_Score"] <= 3:
        actions.append({
            "title": "Engage proactively",
            "detail": "Below-average satisfaction score; reach out through email or a call to understand their concerns.",
        })

    if raw_input["Complaint_Last_Month"] == 1:
        actions.append({
            "title": "Resolve recent issues",
            "detail": "A complaint was logged in the last month; address delivery or support issues directly.",
        })

    if raw_input["Monthly_Orders"] <= 1 or raw_input["App_Engagement_Hrs"] < 0.15:
        actions.append({
            "title": "Re-engage with relevant recommendations",
            "detail": "Low order or app-engagement activity; suggest products aligned with their past interests.",
        })

    if not actions:
        actions.append({
            "title": "Monitor closely",
            "detail": "Elevated churn probability without a single dominant driver; track behaviour over the next cycle.",
        })

    return actions


# =============================================================================
# EXPORT SNIPPET — run this as the final cell of the notebook to produce the
# artifact this module loads. It packages exactly the objects already in
# memory after Section 7.12; no retraining or logic duplication required.
# =============================================================================
#
# import joblib
#
# joblib.dump(
#     {
#         "model": final_catboost_model,
#         "calibrator": calibrator,
#         "threshold": best_threshold,
#     },
#     "../model/churn_model.pkl",
# )
