# 🛒 E-Commerce Customer Churn Prediction

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![scikit--learn](https://img.shields.io/badge/scikit--learn-ML-orange.svg)](https://scikit-learn.org/)
[![CatBoost](https://img.shields.io/badge/CatBoost-Final%20Model-brightgreen.svg)](https://catboost.ai/)
[![XGBoost](https://img.shields.io/badge/XGBoost-Benchmarked-orange.svg)](https://xgboost.readthedocs.io/)
[![LightGBM](https://img.shields.io/badge/LightGBM-Benchmarked-yellowgreen.svg)](https://lightgbm.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/SHAP-Explainability-9cf.svg)](https://shap.readthedocs.io/)

> An end-to-end, leakage-free binary classification system that predicts the probability of an e-commerce customer churning, using behavioural, engagement, satisfaction, and transaction data. Includes probability calibration, threshold optimization, and SHAP-based explainability.

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Dataset](#dataset)
- [Project Workflow](#project-workflow)
- [Exploratory Data Analysis](#exploratory-data-analysis)
- [Feature Engineering](#feature-engineering)
- [Data Preprocessing](#data-preprocessing)
- [Modeling Approach](#modeling-approach)
- [Results](#results)
- [Model Explainability (SHAP)](#model-explainability-shap)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
- [Future Enhancements](#future-enhancements)
- [Disclaimer](#disclaimer)
- [Author](#author)

---

## 🧭 Project Overview

Customer churn is a key risk for e-commerce businesses, since losing existing customers directly reduces future revenue. This project builds a complete machine learning pipeline — from raw data to a calibrated, interpretable model — that estimates the probability of a customer churning, using **50,000 customer records** across behavioural, engagement, satisfaction, and transaction-related features.

| Objective | Outcome |
|---|---|
| **Churn Risk Scoring** | Estimates each customer's probability of churning |
| **Reliable Probabilities** | Calibrated so predicted risk reflects real-world likelihood |
| **Transparency** | SHAP explains which factors drive each prediction |

---

## ❓ Problem Statement

Given a customer's tenure, engagement, satisfaction, and transaction behaviour, predict whether they will churn.

This is a **Supervised Learning → Binary Classification** problem:

| Attribute | Description |
|---|---|
| **Target Variable** | `Churned` |
| **Target Classes** | `0` — Does not churn · `1` — Churns |
| **Primary Output** | Calibrated probability of churn |

A higher predicted probability indicates greater churn risk, allowing customers to be ranked and prioritized for retention efforts.

---

## 📊 Dataset

**File:** `data/E-Commerce_Customer_Churn_Dataset.xlsx`
**Raw Shape:** 51,706 records → **50,000 records × 20 features** after removing duplicates

| Feature Group | Examples |
|---|---|
| Profile & Demographics | Gender, Marital Status, City Tier |
| Engagement | App Engagement Hrs, Devices Linked, Primary Access Device |
| Transactions | Monthly Orders, Days Since Last Order, YoY Spend Growth % |
| Satisfaction & Support | CSAT Score, Complaint Last Month |
| Rewards | Coupons Redeemed, Avg Reward Value (INR) |
| **Churned** *(Target)* | 0 = Retained · 1 = Churned |

**🧹 Data Quality Checks**
- 1,706 duplicate records identified and removed.
- 12 of 20 features contain missing values, handled through a leakage-free imputation pipeline fit only on training data.
- Categorical text values standardized (casing, whitespace, inconsistent labels).

**🎯 Target Distribution** — the dataset is class-imbalanced:

| Class | Count | % |
|---|---|---|
| Retained (0) | 41,125 | 82.25% |
| Churned (1) | 8,875 | 17.75% |

---

## 🔄 Project Workflow

The notebook follows a 9-phase, leakage-aware pipeline:

1. **Project & Business Understanding** — objective, target definition, and success criteria.
2. **Data Preparation & Cleaning** — deduplication, text standardization, missing-value handling.
3. **Data Understanding** — structure, data types, missingness, and cardinality checks.
4. **Exploratory Data Analysis** — target distribution, feature relationships, churn drivers.
5. **Feature Engineering** — two behaviour-derived features, computed without target leakage.
6. **Data Preprocessing** — model-specific pipelines for imputation, scaling, and encoding.
7. **Model Development** — baseline benchmarking, class-imbalance handling, hyperparameter tuning, calibration, and threshold selection.
8. **Model Interpretation** — SHAP-based feature importance and impact analysis.
9. **Final Results & Conclusion** — untouched test-set evaluation and model export.

---

## 🔍 Exploratory Data Analysis

Built with **Matplotlib** and **Seaborn** — distribution plots, churn-rate comparisons, and correlation analysis.

**🔑 Key Findings**
- **Days Since Last Order** shows the strongest relationship with churn — churned customers show much higher inactivity.
- **App Engagement Hrs**, **Monthly Orders**, and **Avg Reward Value** are all noticeably lower among churned customers.
- **Payment Mode** shows the clearest categorical link to churn — Card on Delivery and Cash on Delivery customers churn at higher rates.
- Churn is highest among newer customers (**35.5%** in their first 6 months) and drops sharply as tenure increases (**2.5%** beyond 60 months).

---

## 🛠️ Feature Engineering

Two behaviour-derived features were added, computed only from existing predictors:

| Feature | Formula | Rationale |
|---|---|---|
| **Digital Engagement per Device** | `App_Engagement_Hrs / Devices_Linked` | Normalizes engagement relative to how many devices a customer uses |
| **Coupon Redemption Rate** | `Coupons_Redeemed / Monthly_Orders` | Reflects promotional responsiveness relative to order activity |

---

## ⚙️ Data Preprocessing

- **Split:** Stratified train-test split, performed before any statistical transformation.
- **Numerical features:** Imputed and scaled.
- **Categorical features:** Imputed and encoded (one-hot for nominal, ordinal encoding where applicable).
- Separate preprocessing pipelines were built for linear models and tree-based/CatBoost models, all fit only on training data to prevent leakage.

---

## 🤖 Modeling Approach

Four models were benchmarked using **stratified 5-fold cross-validation**:

| Model | Role |
|---|---|
| Logistic Regression | Interpretable baseline |
| XGBoost | Gradient-boosted trees |
| LightGBM | Gradient-boosted trees |
| **CatBoost** | Gradient boosting with native categorical support — **final model** |

**⚙️ Process:**
- Baseline comparison across all four models.
- Class-imbalance handling via class weighting.
- Hyperparameter tuning for CatBoost via randomized search, optimizing probability-ranking quality.
- Out-of-fold probability calibration.
- Operating-threshold selection under a minimum-precision constraint (≥ 0.60), maximizing recall.
- Final evaluation on an untouched test set.

---

## 📈 Results

### 📊 Baseline Cross-Validation (ROC-AUC)

| Model | ROC-AUC | PR-AUC | F1 |
|---|---|---|---|
| **CatBoost** | **0.9033** | **0.7385** | **0.6222** |
| Logistic Regression | 0.9003 | 0.7300 | 0.6211 |
| LightGBM | 0.8992 | 0.7311 | 0.6184 |
| XGBoost | 0.8909 | 0.7128 | 0.6089 |

CatBoost led the baseline comparison and was selected for tuning, calibration, and final evaluation.

### ✅ Final Test-Set Performance (Tuned & Calibrated CatBoost)

| Metric | Score |
|---|---|
| ROC-AUC | 0.90 |
| PR-AUC | 0.71 |
| Brier Score | 0.08 |
| Precision | 0.62 |
| Recall | 0.67 |
| F1 | 0.64 |
| Balanced Accuracy | 0.79 |
| Macro F1 | 0.78 |

**🏁 Final Configuration:** `iterations=700, depth=5, learning_rate=0.03, l2_leaf_reg=3`, operating threshold = **0.30**.

At this threshold, the model correctly identifies 1,187 of 1,775 churned test customers, while flagging 735 false positives — a reasonable balance between catching churners and limiting unnecessary retention outreach.

---

## 💡 Model Explainability (SHAP)

SHAP was used to interpret the final CatBoost model's predictions at both the global and individual level, identifying which behavioural and engagement features contribute most to churn risk and in which direction.

---

## 🧰 Tech Stack

| Category | Tools |
|---|---|
| Data Handling | Pandas, NumPy |
| Visualization | Matplotlib, Seaborn |
| Preprocessing | Scikit-learn |
| Modeling | Scikit-learn (Logistic Regression), XGBoost, LightGBM, CatBoost |
| Tuning | Randomized Search (Stratified 5-Fold CV) |
| Calibration | Out-of-fold probability calibration |
| Explainability | SHAP |
| Environment | Jupyter Notebook |

---

## 🗂️ Project Structure

```text
e-commerce-customer-churn/
│
├── README.md
├── .gitignore
├── requirements.txt
├── render.yaml
│
├── api/
│   ├── __init__.py
│   ├── app.py
│   ├── model.py
│   └── scripts.py
│
├── data/
│   ├── E-Commerce_Customer_Churn_Prediction_Report.docx
│   ├── E-Commerce_Customer_Churn_Prediction_Report.pdf
│   └── E-Commerce_Customer_Churn_Dataset.xlsx
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.mjs
│   ├── next-env.d.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── postcss.config.js
│
├── images/
│   ├── Baseline Classification Performance Comparison.png
│   ├── Calibration Curve - Before Vs After.png
│   ├── Categorical Features Churn Rate.png
│   ├── CatBoost Model - ROC-AUC & PR-AUC Curve.png
│   ├── Churn Rate Tenure Band.png
│   ├── Churn Distribution.png
│   ├── Confusion Matrix.png
│   ├── Customer Churn Distribution.png
│   ├── Global SHAP Feature Importance.png
│   ├── Numerical Feature Distribution.png
│   ├── Numerical Features Churn Plots.png
│   ├── SHAP Summary Plot.png
│   ├── Spearman Correlation Matrix.png
│   └── Tuned CatBoost Classification Performance.png
│
├── model/
│   ├── .gitkeep
│   └── churn_model.pkl
│
└── notebook/
    └── E-Commerce_Customer_Churn_Prediction.ipynb
```

---

## ▶️ How to Run

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd E-Commerce-Customer-Churn-Prediction

# 2. Install dependencies
pip install -r requirements.txt

# 3. Explore the notebook
jupyter notebook notebook/E-Commerce_Customer_Churn_Prediction.ipynb
```

### 📦 Requirements

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
joblib
openpyxl
```

---

## 🚀 Future Enhancements

- Add a retention-priority dashboard that ranks customers by predicted churn risk.
- Incorporate additional behavioural signals (e.g., browsing or support-ticket history) for finer-grained prediction.
- Monitor model performance over time and retrain periodically as customer behaviour shifts.

---

## ⚠️ Disclaimer

This project is built for educational and portfolio purposes. Predictions reflect statistical patterns in the dataset and should be validated against business context before being used for real retention decisions.

---

## 👤 Author

### Rushikesh Khamgaonkar

Machine Learning / Data Science Project

| Contact | Details |
|---|---|
| 📧 **Email** | [rushikeshkhamgaonkar9869@gmail.com](mailto:rushikeshkhamgaonkar9869@gmail.com) |
| 💼 **LinkedIn** | [linkedin.com/in/rushikesh-khamgaonkar-588b77227](https://www.linkedin.com/in/rushikesh-khamgaonkar-588b77227/) |
| 🐙 **GitHub** | [github.com/rushikesh-kh](https://github.com/rushikesh-kh) |

> Developed as an end-to-end machine learning project covering data preparation, exploratory analysis, model development, evaluation, explainability, and application deployment.
