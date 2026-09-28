# =============================================================================
# app.py
# -----------------------------------------------------------------------------
# FastAPI application. Exposes the churn-prediction API under /api and, in
# production, serves the built Next.js frontend as static files.
#
# Endpoints:
#   GET  /api/health        - liveness check
#   GET  /api/model-info    - static model performance summary (Notebook 9.1)
#   POST /api/predict       - run a customer record through the trained model
# =============================================================================

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator, model_validator

from .model import ChurnModel
from .scripts import (
    GENDER_OPTIONS,
    MARITAL_STATUS_OPTIONS,
    PAYMENT_MODE_OPTIONS,
    PRIMARY_ACCESS_DEVICE_OPTIONS,
    TOP_CATEGORY_OPTIONS,
)

app = FastAPI(
    title="E-Commerce Customer Churn Prediction API",
    description="Serves churn probability predictions from the notebook's final CatBoost model.",
    version="1.0.0",
)

# CORS is only needed during local development, where the Next.js dev server
# (port 3000) calls the API (port 8000) from a different origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# The model is loaded once at startup and reused across requests.
churn_model = ChurnModel()


# -----------------------------------------------------------------------------
# Request / response schemas
# -----------------------------------------------------------------------------

class CustomerInput(BaseModel):
    """
    Raw customer attributes, matching the notebook's 18 pre-engineering columns.

    Bounds mirror the training-data distribution (Notebook Section 3, describe()
    output) with the same small rounding buffer used by the frontend's
    INPUT_LIMITS, so a request that bypasses the UI (direct API call, a future
    frontend bug) can't push the model into unlearned, out-of-distribution
    territory. Categorical fields are validated against the same canonical
    option lists the model was trained on.
    """

    Tenure_Months: float = Field(..., ge=0, le=75, description="Months since the customer joined")
    Primary_Access_Device: str = Field(..., description=f"One of {PRIMARY_ACCESS_DEVICE_OPTIONS}")
    City_Tier: int = Field(..., ge=1, le=3, description="1 (metro) to 3 (smaller city)")
    Hub_To_Home_KM: float = Field(..., ge=0, le=65, description="Distance from fulfilment hub to home")
    Payment_Mode: str = Field(..., description=f"One of {PAYMENT_MODE_OPTIONS}")
    Gender: str = Field(..., description=f"One of {GENDER_OPTIONS}")
    App_Engagement_Hrs: float = Field(..., ge=0.01, le=1.19, description="Average daily app engagement, in hours")
    Devices_Linked: int = Field(..., ge=1, le=7, description="Number of devices linked to the account")
    Top_Category: str = Field(..., description=f"One of {TOP_CATEGORY_OPTIONS}")
    CSAT_Score: int = Field(..., ge=1, le=5, description="Customer satisfaction score")
    Marital_Status: str = Field(..., description=f"One of {MARITAL_STATUS_OPTIONS}")
    Saved_Addresses: int = Field(..., ge=1, le=13, description="Number of saved delivery addresses")
    Complaint_Last_Month: int = Field(..., ge=0, le=1, description="1 if a complaint was raised last month")
    YoY_Spend_Growth_Pct: float = Field(..., ge=-35, le=45, description="Year-over-year spend growth, in percent")
    Coupons_Redeemed: float = Field(..., ge=0, le=16, description="Coupons redeemed in the current period")
    Monthly_Orders: float = Field(..., ge=0, le=20, description="Average number of orders per month")
    Days_Since_Last_Order: float = Field(..., ge=0, le=85, description="Days since the most recent order")
    Avg_Reward_Value_INR: float = Field(..., ge=0, le=1500, description="Average loyalty reward value, in INR")

    @field_validator("Primary_Access_Device")
    @classmethod
    def _validate_primary_access_device(cls, value: str) -> str:
        if value not in PRIMARY_ACCESS_DEVICE_OPTIONS:
            raise ValueError(f"Primary_Access_Device must be one of {PRIMARY_ACCESS_DEVICE_OPTIONS}")
        return value

    @field_validator("Payment_Mode")
    @classmethod
    def _validate_payment_mode(cls, value: str) -> str:
        if value not in PAYMENT_MODE_OPTIONS:
            raise ValueError(f"Payment_Mode must be one of {PAYMENT_MODE_OPTIONS}")
        return value

    @field_validator("Gender")
    @classmethod
    def _validate_gender(cls, value: str) -> str:
        if value not in GENDER_OPTIONS:
            raise ValueError(f"Gender must be one of {GENDER_OPTIONS}")
        return value

    @field_validator("Top_Category")
    @classmethod
    def _validate_top_category(cls, value: str) -> str:
        if value not in TOP_CATEGORY_OPTIONS:
            raise ValueError(f"Top_Category must be one of {TOP_CATEGORY_OPTIONS}")
        return value

    @field_validator("Marital_Status")
    @classmethod
    def _validate_marital_status(cls, value: str) -> str:
        if value not in MARITAL_STATUS_OPTIONS:
            raise ValueError(f"Marital_Status must be one of {MARITAL_STATUS_OPTIONS}")
        return value

    @model_validator(mode="after")
    def _validate_coupons_within_orders(self) -> "CustomerInput":
        # Mirrors the frontend's dynamic cap so this constraint holds even for
        # requests that skip the UI entirely — Coupon_Redemption_Rate is
        # undefined/meaningless for combinations the training data never had.
        if self.Coupons_Redeemed > self.Monthly_Orders:
            raise ValueError("Coupons_Redeemed cannot exceed Monthly_Orders")
        return self


class RecommendedAction(BaseModel):
    title: str
    detail: str


class PredictionResponse(BaseModel):
    churn_probability: float
    risk_level: str
    operating_threshold: float
    recommended_actions: list[RecommendedAction]


class ModelInfo(BaseModel):
    roc_auc: float
    pr_auc: float
    precision: float
    recall: float
    f1_score: float
    operating_threshold: float
    top_churn_drivers: list[str]


# -----------------------------------------------------------------------------
# API routes
# -----------------------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/model-info", response_model=ModelInfo)
def model_info():
    """
    Static summary of the final model's test-set performance and top SHAP
    drivers (Notebook Sections 9.1 and 8.1). Powers the frontend's
    informational panel with genuine evaluation results, not placeholder text.
    """
    return ModelInfo(
        roc_auc=0.90,
        pr_auc=0.71,
        precision=0.62,
        recall=0.67,
        f1_score=0.64,
        operating_threshold=churn_model.threshold,
        top_churn_drivers=[
            "Days_Since_Last_Order",
            "CSAT_Score",
            "Monthly_Orders",
            "App_Engagement_Hrs",
            "Tenure_Months",
        ],
    )


@app.post("/api/predict", response_model=PredictionResponse)
def predict_churn(customer: CustomerInput):
    try:
        result = churn_model.predict(customer.model_dump())
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return PredictionResponse(**result)


# -----------------------------------------------------------------------------
# Static frontend hosting (production)
# -----------------------------------------------------------------------------
# The Next.js app is built to static files (`npm run build` with
# output: "export") into frontend/out. When present, FastAPI serves it so the
# whole application deploys as a single Render web service.

frontend_build = Path(__file__).resolve().parent.parent / "frontend" / "out"
if frontend_build.exists():
    app.mount("/", StaticFiles(directory=frontend_build, html=True), name="frontend")
