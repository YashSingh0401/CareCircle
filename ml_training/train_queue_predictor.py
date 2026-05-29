"""
ml_training/train_queue_predictor.py
Trains XGBoost queue wait-time predictor on Bhopal hospital queue data.
Saves model to: backend/app/ml/tft_queue/queue_model.json

Runtime: ~30s on CPU
RAM: <200MB

Usage:
  python ml_training/train_queue_predictor.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
from pathlib import Path

DATA_PATH  = Path("ml_training/data/bhopal/queue_history.csv")
MODEL_OUT  = Path("backend/app/ml/tft_queue/queue_model.json")
SCALER_OUT = Path("backend/app/ml/tft_queue/queue_scaler.pkl")

FEATURE_COLS = [
    "queue_position", "patients_in_queue", "hour_of_day", "day_of_week",
    "is_weekend", "is_monday", "is_peak_hour", "month",
    "avg_consultation_minutes", "doctor_experience_years",
]
TARGET_COL = "actual_wait_minutes"


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["is_peak_hour"] = df["hour_of_day"].isin([10, 11, 16, 17]).astype(int)
    df["queue_position"] = df["patients_in_queue"] // 2  # approximate position
    return df


def generate_data_if_missing():
    if not DATA_PATH.exists():
        print("Generating queue data...")
        from ml_training.scripts.generate_bhopal_data import generate_queue_data
        df = generate_queue_data(n_days=180)
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(DATA_PATH, index=False)
    return pd.read_csv(DATA_PATH)


def train():
    print("=" * 60)
    print("XGBoost Queue Wait-Time Predictor")
    print("=" * 60)

    df = generate_data_if_missing()
    df = prepare_features(df)
    print(f"Loaded {len(df)} samples")
    print(f"Target stats: mean={df[TARGET_COL].mean():.1f} min, max={df[TARGET_COL].max():.1f} min")

    X = df[FEATURE_COLS].values.astype(float)
    y = df[TARGET_COL].values.astype(float)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    dtrain = xgb.DMatrix(X_train_s, label=y_train, feature_names=FEATURE_COLS)
    dtest  = xgb.DMatrix(X_test_s,  label=y_test,  feature_names=FEATURE_COLS)

    params = {
        "objective": "reg:squarederror",
        "eval_metric": "mae",
        "max_depth": 5,
        "eta": 0.08,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "min_child_weight": 3,
        "seed": 42,
        "nthread": 4,
    }

    model = xgb.train(
        params, dtrain,
        num_boost_round=300,
        evals=[(dtrain, "train"), (dtest, "eval")],
        early_stopping_rounds=25,
        verbose_eval=50,
    )

    y_pred = model.predict(dtest)
    mae = mean_absolute_error(y_test, y_pred)
    r2  = r2_score(y_test, y_pred)
    print(f"\n✅ MAE: {mae:.2f} minutes | R²: {r2:.4f}")

    MODEL_OUT.parent.mkdir(parents=True, exist_ok=True)
    model.save_model(str(MODEL_OUT))
    joblib.dump(scaler, str(SCALER_OUT))

    size_mb = MODEL_OUT.stat().st_size / (1024 * 1024)
    print(f"✅ Model saved: {MODEL_OUT} ({size_mb:.1f} MB)")

    # Feature importance
    scores = model.get_score(importance_type="gain")
    print("\nTop feature importances:")
    for feat, imp in sorted(scores.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {feat}: {imp:.1f}")


if __name__ == "__main__":
    train()
