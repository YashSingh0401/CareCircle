# backend/app/ml/catboost_severity/severity_model.py
"""
Real CatBoost model for emergency severity prediction.
Model is trained once (ml_training/train_catboost.py) and saved as severity_model.cbm
Loaded at startup — only ~8MB, runs entirely on CPU, no GPU or RAM spike.
Falls back to rule-based if model file not found.
"""

import os
import numpy as np
from pathlib import Path

from app.ml._paths import resolve

_model = None

def _load_model():
    global _model
    if _model is not None:
        return _model
    pkl = resolve("catboost_severity", "severity_model.pkl")
    if pkl:
        try:
            import joblib
            _model = joblib.load(str(pkl))
            return _model
        except Exception as e:
            print(f"[CatBoost] pkl load failed: {e}")
    cbm = resolve("catboost_severity", "severity_model.cbm")
    if cbm:
        try:
            from catboost import CatBoostClassifier
            _model = CatBoostClassifier()
            _model.load_model(str(cbm))
            return _model
        except Exception as e:
            print(f"[CatBoost] cbm load failed: {e}")
    return None

def predict_severity(features: dict) -> dict:
    """
    features = {
        heart_rate, bp_systolic, spo2, temperature, respiratory_rate,
        pain_scale, emergency_type_encoded, has_chest_pain,
        has_breathing_difficulty, has_unconsciousness, has_bleeding,
        has_stroke_signs, age, age_risk
    }
    Returns: { severity: int(1-5), confidence: float, seek_emergency: bool }
    """
    model = _load_model()

    feature_order = [
        "heart_rate", "bp_systolic", "spo2", "temperature", "respiratory_rate",
        "pain_scale", "emergency_type_encoded", "has_chest_pain",
        "has_breathing_difficulty", "has_unconsciousness", "has_bleeding",
        "has_stroke_signs", "age", "age_risk"
    ]

    X = np.array([[features.get(f, 0) for f in feature_order]])

    if model is not None:
        try:
            pred = model.predict(X)[0]
            proba = model.predict_proba(X)[0]
            severity = int(pred)
            confidence = float(max(proba))
            return {
                "severity": severity,
                "confidence": round(confidence, 3),
                "seek_emergency": severity >= 4,
                "model": "catboost"
            }
        except Exception:
            pass

    # Rule-based fallback
    sev = _rule_based(features)
    return {"severity": sev, "confidence": 0.7, "seek_emergency": sev >= 4, "model": "rules"}


def _rule_based(f: dict) -> int:
    sev = 1
    if f.get("spo2", 98) < 90: sev += 2
    if f.get("heart_rate", 80) > 130 or f.get("heart_rate", 80) < 45: sev += 2
    if f.get("bp_systolic", 120) > 180 or f.get("bp_systolic", 120) < 80: sev += 1
    if f.get("has_chest_pain"): sev += 2
    if f.get("has_stroke_signs"): sev += 2
    if f.get("has_unconsciousness"): sev += 2
    if f.get("has_breathing_difficulty"): sev += 1
    if f.get("pain_scale", 5) >= 8: sev += 1
    if f.get("age_risk"): sev += 1
    return min(5, max(1, sev))
