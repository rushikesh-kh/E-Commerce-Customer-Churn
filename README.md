# E-Commerce Customer Churn Prediction — An End-to-End ML System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![scikit--learn](https://img.shields.io/badge/scikit--learn-ML-orange.svg)](https://scikit-learn.org/)
[![Logistic Regression](https://img.shields.io/badge/Logistic%20Regression-Baseline-blueviolet.svg)](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html)
[![XGBoost](https://img.shields.io/badge/XGBoost-Classifier-brightgreen.svg)](https://xgboost.readthedocs.io/)
[![LightGBM](https://img.shields.io/badge/LightGBM-Classifier-9cf.svg)](https://lightgbm.readthedocs.io/)
[![CatBoost](https://img.shields.io/badge/CatBoost-Final%20Model-yellow.svg)](https://catboost.ai/)
[![Probability Calibration](https://img.shields.io/badge/Isotonic%20Regression-Calibration-yellowgreen.svg)](https://scikit-learn.org/stable/modules/calibration.html)
[![SHAP](https://img.shields.io/badge/SHAP-Explainability-important.svg)](https://shap.readthedocs.io/)

> A supervised, leakage-free binary classification system that estimates the probability of e-commerce customer churn using behavioural, engagement, satisfaction, transaction, and profile data. Built as a reproducible, benchmarked, calibrated, and interpretable end-to-end pipeline covering data preparation through model explainability.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Business & ML Objectives](#business--ml-objectives)
- [Dataset](#dataset)
- [Project Workflow](#project-workflow)
- [Exploratory Data Analysis](#exploratory-data-analysis)
- [Feature Engineering](#feature-engineering)
- [Data Preprocessing](#data-preprocessing)
- [Modeling Approach](#modeling-approach)
- [Results & Model Comparison](#results--model-comparison)
- [Probability Calibration & Threshold Optimization](#probability-calibration--threshold-optimization)
- [Final Test-Set Performance](#final-test-set-performance)
- [Model Explainability (SHAP)](#model-explainability-shap)
- [Key Insights](#key-insights)
- [Conclusion](#conclusion)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [Future Enhancements](#future-enhancements)
- [Disclaimer](#disclaimer)
- [Author](#author)

---

## Project Overview

Customer churn is a critical business problem in e-commerce, since the loss of existing customers reduces future purchasing activity and long-term customer value. This project develops a full machine learning pipeline — from raw data to a calibrated, explainable model — that estimates churn risk using **50,000 customer records** across demographic, engagement, transactional, and satisfaction features.

| Objective | Outcome |
|---|---|
| **Risk Prioritization** | Ranks customers by estimated churn probability to focus retention effort |
| **Probability Reliability** | Calibration ensures predicted probabilities reflect real-world likelihoods |
| **Model Transparency** | SHAP explains *why* each prediction was made, not just *what* was predicted |

---

## Problem Statement

Given a customer's demographic, behavioural, engagement, and transaction-related attributes available at prediction time, estimate the probability that the customer will churn.

The target variable `Churned` is binary:

- `0` — Customer does not churn
- `1` — Customer churns

---

## Business & ML Objectives

**Business Objective**
- Identify customers with elevated estimated churn risk so that retention activities can be prioritized.
- Support targeted customer engagement and more effective allocation of retention resources.

**ML Objective**
- Predict the `Churned` outcome using only information legitimately available at prediction time, preserving a strictly leakage-free workflow.
- Build, tune, and evaluate supervised binary classification models using stratified cross-validation.
- Select the final model based on probability-ranking quality and class-aware metrics — not raw accuracy alone — given an 82/18 class split.
- Calibrate predicted probabilities and select an operating threshold using training-side data only, before a single, final evaluation on the untouched test set.

| Attribute | Description |
|---|---|
| **Learning Type** | Supervised Learning |
| **Problem Category** | Binary Classification |
| **Target Variable** | `Churned` |
| **Target Classes** | `0` — Does Not Churn · `1` — Churns |
| **Primary Output** | Calibrated churn probability (operating threshold is a supporting output) |

---

## Dataset

**Source:** E-Commerce Customer Churn Dataset (Excel workbook, "Customer Data" sheet)
**File:** `data/E-Commerce_Customer_Churn_Dataset.xlsx`
**Raw Shape:** 51,706 records → **50,000 records × 20 features** after removing 1,706 duplicate rows

| Feature Group | Columns |
|---|---|
| Identifier | `Customer_Code` |
| Demographic / Profile | Gender, Marital_Status, Primary_Access_Device, City_Tier |
| Tenure & Engagement | Tenure_Months, App_Engagement_Hrs, Devices_Linked, Saved_Addresses |
| Transaction Behaviour | Monthly_Orders, Coupons_Redeemed, YoY_Spend_Growth_Pct, Avg_Reward_Value_INR, Top_Category, Payment_Mode |
| Satisfaction & Service | CSAT_Score, Complaint_Last_Month |
| Logistics | Hub_To_Home_KM |
| Recency | Days_Since_Last_Order |
| **Churned** *(Target)* | `0` — No Churn / `1` — Churn |

**Data Quality Checks**
- **1,706 duplicate records** identified and removed; customer-level uniqueness (`Customer_Code`) was validated post-cleaning with zero remaining duplicates.
- **12 of 20 features contain missing values** (ranging from ~2.9% to ~5.4% per feature). Genuine missing values are preserved through the cleaning stage and handled downstream inside a leakage-free preprocessing pipeline — not by dropping rows.
- Whitespace-only categorical entries were treated as missing, and leading/trailing whitespace was stripped from all text fields before analysis.
- Inconsistent categorical casing (e.g. `FEMALE`, `female`, `Female `) was standardized to a consistent representation without altering the underlying business labels.

**Target Distribution** — the dataset is class-imbalanced:

| Class | Count | % |
|---|---|---|
| Does Not Churn (0) | 41,125 | 82.25% |
| Churns (1) | 8,875 | 17.75% |

---

## Project Workflow

The notebook follows a 9-phase, leakage-aware pipeline:

1. **Project & Business Understanding** — business context, ML objective, target definition, and project scope.
2. **Data Preparation & Cleaning** — deduplication, whitespace handling, categorical text standardization; statistical transformations deferred until after the train-test split.
3. **Data Understanding** — shape, schema, missing-value profile, cardinality, and feature-type/value-domain assessment.
4. **Exploratory Data Analysis** — target distribution, univariate and categorical analysis, churn-vs-feature relationships, correlation analysis, and tenure-band churn behaviour.
5. **Feature Engineering** — two domain-derived behavioural features from existing predictors (no target leakage).
6. **Data Preprocessing** — feature–target separation, stratified train-test split, and model-specific `ColumnTransformer` pipelines fit only on training data.
7. **Model Development** — 4 algorithms benchmarked via stratified 5-fold CV, class-imbalance handling, hyperparameter tuning, out-of-fold probability calibration, threshold optimization, and final untouched test-set evaluation.
8. **Model Interpretation** — global SHAP feature importance and SHAP summary plot.
9. **Final Results & Conclusion** — consolidated test-set performance, final model configuration, and project conclusion.

---

## Exploratory Data Analysis

Built with **Matplotlib** and **Seaborn** — target distribution, numerical distributions, churn-vs-numerical boxplots, categorical churn-rate comparisons, correlation heatmap, and tenure-band churn analysis.

**Key Findings**
- **Days_Since_Last_Order** shows the clearest separation between churn classes, with churned customers exhibiting substantially higher inactivity, and the strongest correlation with churn (`+0.46`).
- **App_Engagement_Hrs**, **Monthly_Orders**, and **Coupons_Redeemed** are all noticeably lower among churned customers, reflecting reduced engagement and purchasing activity.
- **Payment_Mode** shows the strongest categorical variation in churn — Card on Delivery (POS) and Cash on Delivery record notably higher churn rates than other payment methods.
- **Marital_Status** (Separated/Divorced customers) and **Primary_Access_Device** (Mobile Browser users) also show meaningful churn variation; **Gender** shows limited separation.
- Churn is highest among newer customers, reaching **35.5%** in the 0–6 month tenure band, and declines consistently with tenure to **2.5%** for customers with 60+ months of tenure — the strongest lifecycle-driven pattern in the dataset.
- **Monthly_Orders** and **Days_Since_Last_Order** are strongly negatively correlated (`-0.71`); no severe multicollinearity is observed elsewhere, so no features were removed on correlation grounds alone.

---

## Feature Engineering

Two domain-relevant, target-independent behavioural features were derived from existing predictors:

| Feature | Formula | Rationale |
|---|---|---|
| **Digital_Engagement_Per_Device** | `App_Engagement_Hrs / Devices_Linked` | Normalized digital-engagement intensity per linked device, more contextual than raw app-usage hours |
| **Coupon_Redemption_Rate** | `Coupons_Redeemed / Monthly_Orders` (NaN where orders = 0) | Normalized view of promotional purchasing behaviour relative to order activity |

Both features are derived entirely from customer-level attributes with no use of the target or future information; genuine missing/undefined cases are preserved as `NaN` for the preprocessing stage rather than imputed at creation time.

---

## Data Preprocessing

- **Feature–target separation:** predictors stored in `X`, target `Churned` stored in `y`, ensuring the target cannot be inadvertently used as an input feature.
- **Split:** Stratified 80/20 train-test split → 40,000 train / 10,000 test, preserving the 17.75% churn rate in both sets.
- **Feature typing:** features classified by statistical/business meaning rather than raw data type —
  - **Numerical (12):** Tenure_Months, Hub_To_Home_KM, App_Engagement_Hrs, Devices_Linked, Saved_Addresses, YoY_Spend_Growth_Pct, Coupons_Redeemed, Monthly_Orders, Days_Since_Last_Order, Avg_Reward_Value_INR, Digital_Engagement_Per_Device, Coupon_Redemption_Rate
  - **Ordinal (2):** CSAT_Score, City_Tier
  - **Binary (1):** Complaint_Last_Month
  - **Nominal (5):** Primary_Access_Device, Payment_Mode, Gender, Top_Category, Marital_Status
- **Numerical pipeline:** median imputation for genuine missing values only (legitimate zeros are kept as valid observations); Logistic Regression additionally standardizes these features, while tree-based models (XGBoost, LightGBM, CatBoost) retain the original scale.
- **Ordinal pipeline:** no missing values present; ordinal order preserved without one-hot encoding.
- **Binary pipeline:** already 0/1-encoded; used as-is without imputation or scaling.
- **Nominal pipeline:** mode imputation followed by one-hot encoding with `handle_unknown="ignore"` to prevent inference-time errors on unseen categories.
- **Leakage-safe architecture:** all preprocessing lives inside model-specific `ColumnTransformer`/`Pipeline` objects and is refit independently within every cross-validation fold — no preprocessing step is fit outside a fold or on the test set. CatBoost is handled separately to preserve its native categorical-feature support, with categorical missing values represented as a dedicated `"__MISSING__"` category.

---

## Modeling Approach

Four classification algorithms were benchmarked using **Stratified 5-Fold Cross-Validation** on the training set, with the same fixed folds used throughout for reproducible, directly comparable evaluation:

| Model | Role |
|---|---|
| Logistic Regression | Interpretable linear baseline |
| XGBoost | Gradient-boosted tree model |
| LightGBM | Gradient-boosted tree model |
| **CatBoost** | Gradient-boosting model with native categorical-feature support |

**Evaluation metrics:** ROC-AUC, PR-AUC, F1, Recall, and Precision, giving a balanced view of discrimination and churn-class performance under class imbalance.

**Class imbalance handling:** addressed via cost-sensitive learning (class weighting). Class weights are computed separately within each training fold during cross-validation, and from the full training set only for the final model — the test set is never used to determine class weights.

**Hyperparameter tuning:** a compact `ParameterSampler`-based randomized search (8 configurations, fixed seed) was run for CatBoost over `iterations`, `depth`, `learning_rate`, and `l2_leaf_reg`, evaluated with the same stratified 5-fold CV. Because the final system outputs a churn probability on an imbalanced target, configurations were ranked primarily by **PR-AUC**, followed by ROC-AUC, with threshold-dependent metrics retained as supporting diagnostics. The classification threshold itself is optimized separately, after probability calibration, and was not used for hyperparameter selection.

---

## Results & Model Comparison

### Baseline Cross-Validation Performance (Training Set)

| Model | ROC-AUC | PR-AUC | F1 | Recall | Precision |
|---|---:|---:|---:|---:|---:|
| Logistic Regression | 0.9003 ± 0.0035 | 0.7300 ± 0.0046 | 0.6211 ± 0.0016 | 0.5286 ± 0.0048 | 0.7531 ± 0.0094 |
| XGBoost | 0.8909 ± 0.0026 | 0.7128 ± 0.0030 | 0.6089 ± 0.0050 | 0.5200 ± 0.0071 | 0.7347 ± 0.0070 |
| LightGBM | 0.8992 ± 0.0033 | 0.7311 ± 0.0048 | 0.6184 ± 0.0024 | 0.5224 ± 0.0043 | 0.7578 ± 0.0053 |
| **CatBoost** | **0.9033 ± 0.0034** | **0.7385 ± 0.0056** | **0.6222 ± 0.0036** | 0.5218 ± 0.0081 | 0.7707 ± 0.0094 |

CatBoost led the unweighted baseline comparison on both ROC-AUC and PR-AUC and was carried forward for class-imbalance handling and hyperparameter tuning.

### Class-Weighted Cross-Validation Performance

| Model | ROC-AUC | PR-AUC | F1 | Recall | Precision |
|---|---:|---:|---:|---:|---:|
| Logistic Regression | 0.9004 ± 0.0036 | 0.7290 ± 0.0047 | 0.6093 ± 0.0083 | 0.8139 ± 0.0065 | 0.4869 ± 0.0093 |
| XGBoost | 0.8866 ± 0.0032 | 0.7068 ± 0.0043 | 0.6089 ± 0.0046 | 0.7190 ± 0.0054 | 0.5282 ± 0.0085 |
| LightGBM | 0.8984 ± 0.0027 | 0.7277 ± 0.0048 | 0.6116 ± 0.0084 | 0.7876 ± 0.0059 | 0.5000 ± 0.0095 |

Class weighting substantially raises Recall across all models at the cost of Precision, as expected for a cost-sensitive imbalance strategy — this trade-off is subsequently managed explicitly through threshold optimization for the final model.

### CatBoost Hyperparameter Search (Top Configuration)

| Parameter | Value |
|---|---|
| `iterations` | 700 |
| `depth` | 5 |
| `learning_rate` | 0.03 |
| `l2_leaf_reg` | 3 |

This configuration achieved the best combined PR-AUC / ROC-AUC ranking (PR-AUC ≈ 0.74, ROC-AUC ≈ 0.90, Balanced Accuracy ≈ 0.81 on cross-validation) among the 8 sampled configurations and was selected for out-of-fold prediction, calibration, and threshold optimization.

**Final Model:** Class-weighted **CatBoost**, tuned configuration above.

---

## Probability Calibration & Threshold Optimization

Out-of-fold (OOF) probabilities were generated for the tuned CatBoost configuration using fold-specific class weights, then split into a calibration portion and a held-out OOF validation portion (70/30, stratified). The test set remained untouched throughout this stage.

### Calibration

**Isotonic Regression** was fit on the calibration portion and evaluated on the held-out OOF validation portion using Brier Score:

| Metric | Before Calibration | After Calibration |
|---|---:|---:|
| Brier Score | 0.12 | 0.08 |

Calibration meaningfully improved probability reliability and was retained for the final pipeline.

### Threshold Optimization

The classification threshold was selected on the calibrated OOF validation probabilities using a **minimum Precision constraint of 0.60** — at least 60% of flagged high-risk customers are expected to be actual churners. Among thresholds meeting this constraint, the one with the highest Recall was selected:

| Threshold | Recall | Precision | F1 | Balanced Accuracy | Macro F1 |
|---|---:|---:|---:|---:|---:|
| **0.30** | **0.66** | **0.62** | **0.64** | **0.79** | **0.78** |
| 0.35 | 0.60 | 0.68 | 0.64 | 0.77 | 0.78 |
| 0.40 | 0.58 | 0.72 | 0.64 | 0.77 | 0.79 |
| 0.50 | 0.52 | 0.77 | 0.62 | 0.74 | 0.78 |

**Selected operating threshold: 0.30.** Both the calibrator and the threshold were derived exclusively from training-side OOF predictions, with no test-set involvement at any point in this stage.

---

## Final Test-Set Performance

The final CatBoost model — trained on the full training set with training-only class weights, calibrated via the training-fitted isotonic calibrator, and evaluated at the training-selected 0.30 threshold — was evaluated **once** on the untouched 10,000-record test set:

| Metric | Score |
|---|---:|
| **ROC-AUC** | **0.90** |
| **PR-AUC** | **0.71** |
| **Brier Score** | **0.08** |
| **Recall** | **0.67** |
| **Precision** | **0.62** |
| **F1** | **0.64** |
| **Balanced Accuracy** | **0.79** |
| **Macro F1** | **0.78** |

The model demonstrates strong discrimination (ROC-AUC 0.90) and good probability reliability (Brier Score 0.08) on unseen data. At the selected operating threshold, roughly two out of three churners are correctly identified (Recall 0.67) while maintaining precision above the 0.60 business constraint.

**Final Model:** Tuned, class-weighted, isotonic-calibrated **CatBoost** at operating threshold **0.30**.

---

## Model Explainability (SHAP)

SHAP (`TreeExplainer`) was applied to the final CatBoost model on a representative training sample to quantify feature contributions to churn predictions.

**Global Feature Importance (highest → lowest):**
1. **Days_Since_Last_Order** — the single strongest predictor; customer recency dominates the model's overall behaviour.
2. **CSAT_Score** and **Monthly_Orders** — the next most influential, reflecting customer satisfaction and purchasing frequency.
3. **App_Engagement_Hrs** and **Tenure_Months** — substantial contributors related to digital engagement and customer lifecycle stage.
4. **YoY_Spend_Growth_Pct** and **Coupons_Redeemed** — moderate predictive contribution.
5. The engineered feature **Digital_Engagement_Per_Device** contributes meaningful predictive information and ranks among the more influential features.
6. **Payment_Mode, Top_Category, Hub_To_Home_KM, Complaint_Last_Month,** and **Avg_Reward_Value_INR** have smaller but measurable contributions.
7. **Marital_Status** and **Primary_Access_Device** show the lowest average SHAP importance among the displayed features.

**Directional insights (SHAP summary plot):**
- Higher `Days_Since_Last_Order` and lower `CSAT_Score`, `Monthly_Orders`, `App_Engagement_Hrs`, `Tenure_Months`, and `YoY_Spend_Growth_Pct` values each push predictions toward higher churn risk.
- Recent complaints and lower reward values also tend to increase predicted churn risk.
- Categorical features such as `Payment_Mode`, `Top_Category`, `Marital_Status`, and `Primary_Access_Device` show comparatively smaller and more varied effects.

**Takeaway:** the model relies primarily on **customer recency, satisfaction, purchasing activity, engagement, and tenure** — behavioural and transactional signals rather than demographic proxies — supporting its business plausibility. These results describe model behaviour, not causal relationships.

---

## Key Insights

1. **Days_Since_Last_Order, CSAT_Score, and Monthly_Orders** are the strongest predictors of churn.
2. Churn risk declines sharply with customer tenure — from **35.5%** in the 0–6 month band to **2.5%** at 60+ months — making early-tenure customers the highest-priority retention segment.
3. **CatBoost** outperformed Logistic Regression, XGBoost, and LightGBM on both ROC-AUC and PR-AUC under baseline evaluation, making it the deployment choice.
4. **Isotonic Regression calibration** materially reduced Brier Score (0.12 → 0.08 on OOF validation), so calibrated probabilities — not raw model scores — are used as the primary output.
5. **Threshold optimization under a Precision ≥ 0.60 constraint** selected an operating threshold of 0.30, balancing Recall (0.67) and Precision (0.62) on the final test set rather than defaulting to the conventional 0.50 cutoff.
6. All threshold, calibration, and hyperparameter decisions were derived exclusively from training-side (including out-of-fold) data, with the test set used only once, at the end, for final reporting.

---

## Conclusion

This project developed an **end-to-end, leakage-free churn prediction system** for e-commerce customers using demographic, engagement, transactional, and satisfaction features.

After benchmarking four classifiers, addressing class imbalance through cost-sensitive learning, tuning the strongest candidate, calibrating its probabilities, and optimizing an operating threshold under a business precision constraint, the final **CatBoost** model achieved **0.90 ROC-AUC, 0.71 PR-AUC, 0.08 Brier Score, and 0.78 Macro F1** on a fully untouched test set. SHAP analysis showed that customer recency, satisfaction, and purchasing activity are the dominant drivers of predicted churn risk. The system outputs a calibrated churn probability as its primary result, with an optional binary decision at the selected operating threshold.

> **Note:** Final performance should be interpreted from the metrics reported in this document rather than from any manually restated figures elsewhere.

---

## Tech Stack

| Category | Tools |
|---|---|
| Language | Python 3.10+ |
| Data Handling | Pandas, NumPy |
| Visualization | Matplotlib, Seaborn |
| Preprocessing | Scikit-learn (`ColumnTransformer`, `Pipeline`, `SimpleImputer`, `StandardScaler`, `OneHotEncoder`) |
| Class Imbalance Handling | Cost-sensitive class weighting (`compute_class_weight`) |
| Modeling | Scikit-learn (Logistic Regression), XGBoost, LightGBM, CatBoost |
| Tuning | `ParameterSampler` randomized search (Stratified 5-Fold CV) |
| Calibration | Isotonic Regression (`sklearn.isotonic`) |
| Explainability | SHAP |
| Environment | Jupyter Notebook |

---

## Project Structure

```text
e-commerce-customer-churn/
│
├── README.md
├── requirements.txt
├── .gitignore
│
├── notebook/
│   └── E-Commerce_Customer_Churn_Prediction.ipynb
│
├── api/
│   ├── app.py
│   ├── model.py
│   └── schemas.py
│
├── model/
│   └── churn_model.pkl
│
├── data/
│   ├── e_commerce_customer_churn.xlsx
│   ├── e_commerce_customer_churn_documentation.docx
│   ├── e_commerce_customer_churn_report.pdf
│   └── README.md
│
└── images/
    ├── churn_distribution.png
    ├── model_comparison.png
    ├── calibration_curve.png
    └── shap_summary.png
    
```

---

## How to Run

```bash
# 1. Clone the repository
git clone https://github.com/rushikesh-kh/E-Commerce-Customer-Churn-Prediction.git
cd E-Commerce-Customer-Churn-Prediction

# 2. Install dependencies
pip install -r requirements.txt

# 3. Explore the notebook
jupyter notebook notebook/E-Commerce_Customer_Churn_Prediction.ipynb
```

### Requirements

The project dependencies are defined in `requirements.txt`:

```text
pandas
numpy
matplotlib
seaborn
scikit-learn
xgboost
lightgbm
catboost
shap
openpyxl
```

---

## Future Enhancements

- Validate the pipeline against a live production data feed to confirm stability of feature distributions over time.
- Extend feature engineering with time-series/behavioural-trend features (e.g., rolling order frequency, engagement momentum).
- Package the final model behind a lightweight prediction service (e.g., Flask or FastAPI) for real-time or batch scoring.
- Add per-prediction SHAP explanations to support case-level retention decisions.
- Periodically re-evaluate the operating threshold and calibration as churn base rates or business precision requirements evolve.

---

## Disclaimer

This project is built for educational and portfolio purposes. Model outputs represent estimated churn probabilities derived from historical data and should be treated as decision-support input, not a guaranteed prediction of individual customer behaviour. Any operational use should be validated against current business data and objectives.

---

## Author

**Rushikesh Khamgaonkar**
[rushikeshkhamgaonkar9869@gmail.com](mailto:rushikeshkhamgaonkar9869@gmail.com) · [LinkedIn](https://www.linkedin.com/in/rushikesh-khamgaonkar-588b77227/) · [GitHub](https://github.com/rushikesh-kh)

