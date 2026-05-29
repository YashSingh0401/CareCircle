# backend/app/ml/tft_queue/queue_predictor.py
"""
Queue wait time predictor using XGBoost (trained on Bhopal queue data).
Temporal Fusion Transformer is too heavy for free hosting.
XGBoost trained on same features achieves comparable accuracy and is <2MB.
Model: tft_queue/queue_model.json
Trained via: ml_training/train_queue_predictor.py
Falls back to rolling average if model not found.
"""
import numpy as np
from pathlib import Path
from datetime import datetime
import joblib

from app.ml._paths import resolve

_model = None
_scaler = None


def _load():
    global _model, _scaler
    if _model is not None:
        return True
    pkl = resolve("tft_queue", "queue_model.pkl")
    scl = resolve("tft_queue", "queue_scaler.pkl")
    if pkl:
        try:
            _model = joblib.load(str(pkl))
            if scl:
                _scaler = joblib.load(str(scl))
            return True
        except Exception as e:
            print(f"[Queue] pkl load failed: {e}")
    jsn = resolve("tft_queue", "queue_model.json")
    if jsn:
        try:
            import xgboost as xgb
            _model = xgb.XGBRegressor()
            _model.load_model(str(jsn))
            if scl:
                _scaler = joblib.load(str(scl))
            return True
        except Exception as e:
            print(f"[Queue] json load failed: {e}")
    return False


def predict_wait_time(
    queue_position: int,
    patients_in_queue: int,
    hour_of_day: int,
    day_of_week: int,
    avg_consultation_minutes: float = 15.0,
    doctor_experience_years: int = 10,
    month: int = None,
) -> dict:
    """
    Predict wait time for a patient at given queue position.
    Returns: { estimated_minutes, confidence, method }
    """
    if month is None:
        month = datetime.now().month

    is_weekend = int(day_of_week >= 5)
    is_monday = int(day_of_week == 0)
    is_peak_hour = int(hour_of_day in [10, 11, 16, 17])

    features = np.array([[
        queue_position,
        patients_in_queue,
        hour_of_day,
        day_of_week,
        is_weekend,
        is_monday,
        is_peak_hour,
        month,
        avg_consultation_minutes,
        doctor_experience_years,
    ]])

    if _load() and _model is not None:
        try:
            X = features.copy()
            if _scaler:
                X = _scaler.transform(X)
            pred = float(_model.predict(X)[0])
            pred = max(2, pred)
            return {
                "estimated_minutes": round(pred, 1),
                "confidence": "high",
                "method": "xgboost_trained"
            }
        except Exception:
            pass

    # Rolling average fallback
    multiplier = 1.3 if is_monday else 0.8 if is_weekend else 1.0
    multiplier *= 1.2 if is_peak_hour else 1.0
    estimated = queue_position * avg_consultation_minutes * multiplier
    return {
        "estimated_minutes": round(max(2, estimated), 1),
        "confidence": "medium",
        "method": "rolling_average_fallback"
    }


async def get_live_wait_time(queue_id: str, position: int) -> dict:
    """Get wait time using DB history + model prediction."""
    from app.db import supabase as neon

    try:
        queue = await neon.fetchrow("SELECT * FROM queues WHERE id = $1", queue_id)
        if not queue:
            return predict_wait_time(position, position, datetime.now().hour, datetime.now().weekday())

        now = datetime.now()
        return predict_wait_time(
            queue_position=position,
            patients_in_queue=queue.get("total_patients", position),
            hour_of_day=now.hour,
            day_of_week=now.weekday(),
            avg_consultation_minutes=queue.get("average_consultation_time", 15),
            month=now.month,
        )
    except Exception:
        return predict_wait_time(position, position, datetime.now().hour, datetime.now().weekday())
