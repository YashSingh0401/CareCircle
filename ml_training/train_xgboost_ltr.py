"""
ml_training/train_xgboost_ltr.py
Trains XGBoost Learning-To-Rank model on Bhopal doctor data.
Saves model to: backend/app/ml/xgboost_ltr/ranker.json

Runtime: ~1 min on CPU
Output size: ~2MB
RAM: <300MB

Usage:
  python ml_training/train_xgboost_ltr.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GroupShuffleSplit
from pathlib import Path

DATA_PATH    = Path("ml_training/data/bhopal/doctor_ranking.csv")
MODEL_OUT    = Path("backend/app/ml/xgboost_ltr/ranker.json")
SCALER_OUT   = Path("backend/app/ml/xgboost_ltr/scaler.pkl")

FEATURE_COLS = [
    "rating", "total_reviews", "experience_years", "consultation_fee",
    "distance_km", "is_available", "accepts_insurance",
    "hospital_type_encoded", "avg_consultation_minutes", "fee_within_budget",
]
TARGET_COL  = "relevance"
GROUP_COL   = "query_id"


def generate_data_if_missing():
    if not DATA_PATH.exists():
        print("Generating doctor ranking data...")
        from ml_training.scripts.generate_bhopal_data import generate_doctors, generate_doctor_ranking_data
        doctors = generate_doctors(n_per_hospital=15)
        ranking = generate_doctor_ranking_data(doctors, n_queries=3000)
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        ranking.to_csv(DATA_PATH, index=False)
    return pd.read_csv(DATA_PATH)


def train():
    print("=" * 60)
    print("XGBoost LTR Doctor Ranker Trainer")
    print("=" * 60)

    df = generate_data_if_missing()
    print(f"Loaded {len(df)} samples, {df[GROUP_COL].nunique()} queries")

    X = df[FEATURE_COLS].values.astype(float)
    y = df[TARGET_COL].values.astype(float)
    groups = df[GROUP_COL].values

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Group-based split (keep queries intact)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(X_scaled, y, groups))

    X_train, X_test = X_scaled[train_idx], X_scaled[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]
    g_train = df.iloc[train_idx].groupby(GROUP_COL).size().values
    g_test  = df.iloc[test_idx].groupby(GROUP_COL).size().values

    dtrain = xgb.DMatrix(X_train, label=y_train)
    dtrain.set_group(g_train)
    dtest  = xgb.DMatrix(X_test,  label=y_test)
    dtest.set_group(g_test)

    params = {
        "objective": "rank:pairwise",
        "eval_metric": "ndcg@5",
        "max_depth": 6,
        "eta": 0.1,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "min_child_weight": 5,
        "seed": 42,
        "nthread": 4,  # limit threads
    }

    evals = [(dtrain, "train"), (dtest, "eval")]
    model = xgb.train(
        params, dtrain,
        num_boost_round=200,
        evals=evals,
        early_stopping_rounds=20,
        verbose_eval=25,
    )

    MODEL_OUT.parent.mkdir(parents=True, exist_ok=True)
    model.save_model(str(MODEL_OUT))
    joblib.dump(scaler, str(SCALER_OUT))

    size_mb = MODEL_OUT.stat().st_size / (1024 * 1024)
    print(f"\n✅ Model saved: {MODEL_OUT} ({size_mb:.1f} MB)")
    print(f"✅ Scaler saved: {SCALER_OUT}")

    # Feature importance
    importance = model.get_score(importance_type="gain")
    print("\nTop feature importances:")
    for feat, imp in sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {FEATURE_COLS[int(feat[1:])]}: {imp:.1f}")


if __name__ == "__main__":
    train()
