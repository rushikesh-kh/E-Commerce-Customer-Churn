# QuickKart — E-Commerce Customer Churn Prediction

An end-to-end machine learning system that predicts e-commerce customer churn.
A tuned, calibrated CatBoost classifier (built and validated in the notebook)
is served through a FastAPI backend and a Next.js dashboard.

**Live demo:** _add your Render URL here after deploying, e.g. `https://quickkart-churn.onrender.com`_

## How it's built

| Layer      | Stack                                                              |
|------------|---------------------------------------------------------------------|
| Notebook   | pandas, scikit-learn, CatBoost, SHAP — full EDA-to-evaluation pipeline |
| Backend    | FastAPI, Pydantic, scikit-learn/CatBoost inference                  |
| Frontend   | Next.js, TypeScript, Tailwind CSS, Recharts, Lucide icons           |

The backend code (`api/scripts.py`, `api/model.py`) mirrors the notebook's
preprocessing and inference logic exactly — the same feature list, the same
column order, the same calibration and operating threshold — so predictions
made through the API match what the notebook reports on its test set.

## Repository structure

```
e-commerce-customer-churn/
├── notebook/
│   └── E-Commerce_Customer_Churn_Prediction.ipynb   # Full EDA → model → SHAP pipeline
├── api/
│   ├── scripts.py     # Data cleaning + feature engineering (mirrors notebook Phase 2 & 5)
│   ├── model.py        # CatBoost + calibration + threshold inference (mirrors Phase 7)
│   └── app.py           # FastAPI app: /api/predict, /api/model-info
├── model/
│   └── churn_model.pkl  # Trained artifact (generate via the snippet below)
├── data/                 # Source dataset and documentation
├── images/               # Exported notebook plots (EDA, SHAP, evaluation)
├── frontend/             # Next.js dashboard
│   ├── app/page.tsx       # Main dashboard: prediction form + result panel
│   ├── components/         # Sidebar, gauge, driver chart, UI primitives
│   └── lib/                  # API client, form field constants
├── requirements.txt
└── render.yaml
```

## 1. Generate the model artifact

The notebook trains `final_catboost_model` but doesn't export it. Add this
as the notebook's final cell and re-run it:

```python
import joblib

joblib.dump(
    {
        "model": final_catboost_model,
        "calibrator": calibrator,
        "threshold": best_threshold,
    },
    "../model/churn_model.pkl",
)
```

## 2. Run the backend

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.app:app --reload --port 8000
```

API docs are then available at `http://localhost:8000/docs`.

## 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. In development, the frontend calls the API at
`http://localhost:8000` (see `frontend/lib/api.ts`); override with
`NEXT_PUBLIC_API_BASE_URL` if needed.

## 4. Deploy (Render)

The frontend builds to static files and FastAPI serves them, so the whole
app deploys as **one** Render web service:

```bash
cd frontend && npm run build   # outputs to frontend/out
```

Render build command: `pip install -r requirements.txt && cd frontend && npm install && npm run build`
Render start command: `uvicorn api.app:app --host 0.0.0.0 --port $PORT`

Once deployed, replace the placeholder link at the top of this README with
your live Render URL.

## Model summary

- **Algorithm:** CatBoost classifier, tuned via randomized search, class-weighted for churn imbalance
- **Calibration:** Isotonic regression on out-of-fold probabilities
- **Operating threshold:** 0.30 (selected at a minimum-precision constraint of 60%)
- **Test-set performance:** ROC-AUC 0.90 · PR-AUC 0.71 · Precision 0.62 · Recall 0.67 · F1 0.64
- **Top churn drivers (SHAP):** days since last order, CSAT score, monthly orders, app engagement, tenure

See `notebook/E-Commerce_Customer_Churn_Prediction.ipynb` for the full analysis.
