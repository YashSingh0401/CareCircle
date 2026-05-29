"""
ml_training/train_catboost.py
Trains CatBoost emergency severity classifier on Bhopal synthetic data.
Saves model to: backend/app/ml/catboost_severity/severity_model.cbm

Runtime: ~2 min on CPU, ~30s on GPU
Output size: ~8MB
RAM usage: <500MB (safe for 16GB system)

Usage:
  cd carecircle
  python ml_training/train_catboost.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from pathlib import Path

DATA_PATH = Path("ml_training/data/bhopal/emergency_severity.csv")
MODEL_OUT  = Path("backend/app/ml/catboost_severity/severity_model.cbm")

FEATURE_COLS = [
    "heart_rate", "bp_systolic", "spo2", "temperature", "respiratory_rate",
    "pain_scale", "emergency_type_encoded", "has_chest_pain",
    "has_breathing_difficulty", "has_unconsciousness", "has_bleeding",
    "has_stroke_signs", "age", "age_risk",
]
TARGET_COL = "severity"


def generate_data_if_missing():
    if not DATA_PATH.exists():
        print("Data not found. Generating...")
        from ml_training.scripts.generate_bhopal_data import generate_emergency_severity_data
        df = generate_emergency_severity_data(n=8000)
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(DATA_PATH, index=False)
    return pd.read_csv(DATA_PATH)


def train():
    from catboost import CatBoostClassifier, Pool

    print("=" * 60)
    print("CatBoost Emergency Severity Trainer")
    print("=" * 60)

    df = generate_data_if_missing()
    print(f"Loaded {len(df)} samples")
    print(f"Severity distribution:\n{df[TARGET_COL].value_counts().sort_index()}")

    X = df[FEATURE_COLS].values
    y = df[TARGET_COL].values - 1  # CatBoost wants 0-indexed classes

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = CatBoostClassifier(
        iterations=300,
        depth=6,
        learning_rate=0.1,
        loss_function="MultiClass",
        eval_metric="Accuracy",
        random_seed=42,
        verbose=50,
        # CPU only - no GPU to protect your laptop
        task_type="CPU",
        thread_count=4,  # limit threads to save RAM
        early_stopping_rounds=30,
    )

    train_pool = Pool(X_train, y_train)
    test_pool  = Pool(X_test,  y_test)

    model.fit(train_pool, eval_set=test_pool)

    y_pred = model.predict(X_test).flatten()
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Test Accuracy: {acc:.4f}")
    print("\nClassification Report (severity 1-5):")
    print(classification_report(y_test + 1, y_pred + 1,
                                 target_names=["Sev-1", "Sev-2", "Sev-3", "Sev-4", "Sev-5"]))

    MODEL_OUT.parent.mkdir(parents=True, exist_ok=True)
    model.save_model(str(MODEL_OUT))
    size_mb = MODEL_OUT.stat().st_size / (1024 * 1024)
    print(f"\n✅ Model saved: {MODEL_OUT} ({size_mb:.1f} MB)")
    return acc


if __name__ == "__main__":
    train()
