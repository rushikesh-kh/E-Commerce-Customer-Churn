# =============================================================================
# scripts.py
# -----------------------------------------------------------------------------
# Data preparation utilities used at inference time.
#
# These functions reproduce, at the single-record level, the same cleaning and
# feature-engineering logic applied to the full dataset in the notebook:
#   - Phase 2 (Data Preparation & Cleaning)  -> category standardization
#   - Phase 5 (Feature Engineering)          -> engineered ratio features
#
# Keeping this logic isolated in one file means app.py and model.py never
# duplicate preprocessing rules, and any change to the cleaning logic only
# needs to happen here.
# =============================================================================

import numpy as np
import pandas as pd

# -----------------------------------------------------------------------------
# Canonical category values
# -----------------------------------------------------------------------------
# These are the cleaned, title-cased category labels the model was trained on
# (Notebook Section 2.3.5). They are reused by the API to validate incoming
# requests and by the frontend to populate dropdown options consistently.

PRIMARY_ACCESS_DEVICE_OPTIONS = ["Smartphone App", "Mobile Browser", "Desktop/Laptop"]

PAYMENT_MODE_OPTIONS = [
    "UPI",
    "Debit Card",
    "Credit Card",
    "Digital Wallet",
    "Card on Delivery (POS)",
    "Cash on Delivery",
]

GENDER_OPTIONS = ["Female", "Male"]

TOP_CATEGORY_OPTIONS = [
    "Smartphones",
    "Tablets & Wearables",
    "Grocery & Essentials",
    "Apparel & Fashion",
    "Laptops & Accessories",
    "Miscellaneous",
]

MARITAL_STATUS_OPTIONS = ["Married", "Single", "Separated/Divorced"]

# -----------------------------------------------------------------------------
# Training-time column order
# -----------------------------------------------------------------------------
# CatBoost's categorical feature indices (Notebook Section 7.5.1) are
# positional, so every inference request must assemble its feature row in
# exactly this order — the same order X_train_final used during fitting.

RAW_FEATURE_ORDER = [
    "Tenure_Months",
    "Primary_Access_Device",
    "City_Tier",
    "Hub_To_Home_KM",
    "Payment_Mode",
    "Gender",
    "App_Engagement_Hrs",
    "Devices_Linked",
    "Top_Category",
    "CSAT_Score",
    "Marital_Status",
    "Saved_Addresses",
    "Complaint_Last_Month",
    "YoY_Spend_Growth_Pct",
    "Coupons_Redeemed",
    "Monthly_Orders",
    "Days_Since_Last_Order",
    "Avg_Reward_Value_INR",
    "Digital_Engagement_Per_Device",  # engineered, Phase 5.1
    "Coupon_Redemption_Rate",         # engineered, Phase 5.2
]

# Nominal (unordered) categorical columns passed natively to CatBoost.
# Position within RAW_FEATURE_ORDER determines the cat_feature index.
NOMINAL_FEATURES = ["Primary_Access_Device", "Payment_Mode", "Gender", "Top_Category", "Marital_Status"]
CAT_FEATURE_INDICES = [RAW_FEATURE_ORDER.index(col) for col in NOMINAL_FEATURES]


def engineer_features(raw: dict) -> dict:
    """
    Derive the two engineered features from Notebook Phase 5.

    - Digital_Engagement_Per_Device : app engagement normalized by device count
    - Coupon_Redemption_Rate        : coupons redeemed relative to order volume
    """
    record = dict(raw)

    devices = record["Devices_Linked"]
    record["Digital_Engagement_Per_Device"] = (
        record["App_Engagement_Hrs"] / devices if devices else np.nan
    )

    monthly_orders = record["Monthly_Orders"]
    record["Coupon_Redemption_Rate"] = (
        record["Coupons_Redeemed"] / monthly_orders if monthly_orders > 0 else np.nan
    )

    return record


def build_feature_frame(raw: dict) -> pd.DataFrame:
    """
    Assemble a single-row, model-ready DataFrame from a raw customer record.

    Applies feature engineering, then orders and types the columns exactly as
    the notebook did before fitting the final CatBoost model:
      - nominal columns cast to string (CatBoost's native categorical format)
      - numeric columns left as native numbers (CatBoost handles NaN natively)
    """
    enriched = engineer_features(raw)
    frame = pd.DataFrame([enriched])[RAW_FEATURE_ORDER]
    frame[NOMINAL_FEATURES] = frame[NOMINAL_FEATURES].astype(str)
    return frame
