# backend/app/ml/xgboost_ltr/ranker.py
"""
Real XGBoost Learning-To-Rank doctor recommender.
Model file: xgboost_ltr/ranker.json (~2MB)
Trained via: ml_training/train_xgboost_ltr.py
Falls back to weighted scoring if model not found.
"""

import numpy as np
from pathlib import Path
import joblib

from app.ml._paths import resolve

_model = None
_scaler = None

FEATURE_COLS = [
    "rating", "total_reviews", "experience_years", "consultation_fee",
    "distance_km", "is_available", "accepts_insurance",
    "hospital_type_encoded", "avg_consultation_minutes", "fee_within_budget",
]

def _load():
    global _model, _scaler
    if _model is not None:
        return True
    pkl = resolve("xgboost_ltr", "ranker.pkl")
    scl = resolve("xgboost_ltr", "scaler.pkl")
    if pkl:
        try:
            _model = joblib.load(str(pkl))
            if scl:
                _scaler = joblib.load(str(scl))
            return True
        except Exception as e:
            print(f"[LTR] pkl load failed: {e}")
    jsn = resolve("xgboost_ltr", "ranker.json")
    if jsn:
        try:
            import xgboost as xgb
            _model = xgb.XGBRanker()
            _model.load_model(str(jsn))
            if scl:
                _scaler = joblib.load(str(scl))
            return True
        except Exception as e:
            print(f"[LTR] json load failed: {e}")
    return False


def rank_doctors(doctors: list[dict], user_lat: float, user_lon: float, max_fee: float = 5000) -> list[dict]:
    """
    Rank a list of doctor dicts by predicted relevance.
    Each dict must have: rating, total_reviews, experience_years,
    consultation_fee, hospital_lat, hospital_lon, is_available,
    hospital_type (government/private/trust).
    Returns sorted list, best first.
    """
    if not doctors:
        return doctors

    for d in doctors:
        dlat = d.get("hospital_lat", user_lat)
        dlon = d.get("hospital_lon", user_lon)
        d["distance_km"] = ((dlat - user_lat)**2 + (dlon - user_lon)**2)**0.5 * 111
        d["fee_within_budget"] = int(d.get("consultation_fee", 0) <= max_fee)
        ht = d.get("hospital_type", "private")
        d["hospital_type_encoded"] = {"government": 0, "trust": 1, "private": 2}.get(ht, 2)

    loaded = _load()

    if loaded and _model is not None:
        try:
            X = np.array([[d.get(f, 0) for f in FEATURE_COLS] for d in doctors], dtype=float)
            if _scaler:
                X = _scaler.transform(X)
            scores = _model.predict(X)
            for d, s in zip(doctors, scores):
                d["_score"] = float(s)
            return sorted(doctors, key=lambda x: x.get("_score", 0), reverse=True)
        except Exception:
            pass

    # Weighted fallback (same weights as training)
    for d in doctors:
        s = 0.0
        s += (d.get("rating", 0) / 5.0) * 0.35
        s += (min(d.get("experience_years", 0), 30) / 30.0) * 0.25
        s += (1 - min(d.get("distance_km", 10), 30) / 30.0) * 0.20
        s += d.get("fee_within_budget", 0) * 0.15
        s += (min(d.get("total_reviews", 0), 500) / 500.0) * 0.05
        d["_score"] = s
    return sorted(doctors, key=lambda x: x["_score"], reverse=True)
