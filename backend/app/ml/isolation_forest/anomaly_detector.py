# backend/app/ml/isolation_forest/anomaly_detector.py
"""
Isolation Forest for detecting:
- Fake/suspicious doctor reviews
- Abnormal queue patterns
- Unusual login activity

Model is tiny (<1MB), trains fast on CPU.
Trained via ml_training/train_isolation_forest.py
"""
import numpy as np
import joblib
from pathlib import Path
from datetime import datetime

from app.ml._paths import resolve

MODEL_PATH = Path(__file__).parent / "anomaly_model.pkl"  # used only as dump destination by _train_default
_model = None


def _load():
    global _model
    if _model is not None:
        return _model
    p = resolve("isolation_forest", "anomaly_model.pkl")
    if p:
        try:
            candidate = joblib.load(str(p))
            n_in = getattr(candidate, "n_features_in_", 5)
            if n_in == 5:
                _model = candidate
                return _model
            print(f"[IsoForest] pkl expects {n_in} features, inference uses 5 — using fallback")
        except Exception as e:
            print(f"[IsoForest] pkl load failed: {e}")
    # Train a basic model on the fly if not found
    _train_default()
    return _model


def _train_default():
    """Train a basic Isolation Forest on synthetic normal data."""
    global _model
    from sklearn.ensemble import IsolationForest
    # Simulate normal review patterns: rating 3-5, short text, normal timing
    np.random.seed(42)
    normal_data = np.column_stack([
        np.random.uniform(3, 5, 500),       # rating
        np.random.randint(10, 200, 500),     # review_length
        np.random.randint(0, 23, 500),       # hour_posted
        np.random.randint(0, 6, 500),        # day_of_week
        np.random.randint(1, 30, 500),       # days_since_appointment
    ])
    _model = IsolationForest(contamination=0.1, random_state=42, n_estimators=50)
    _model.fit(normal_data)
    try:
        joblib.dump(_model, str(MODEL_PATH))
    except Exception:
        pass


def detect_suspicious_review(review: dict) -> dict:
    """
    Detect if a review looks suspicious/fake.
    review: { rating, text, posted_at, appointment_date }
    Returns: { is_suspicious, anomaly_score, reason }
    """
    model = _load()

    try:
        posted = datetime.fromisoformat(review.get("posted_at", datetime.utcnow().isoformat()))
        appt_date_str = review.get("appointment_date")
        days_since = 7  # default
        if appt_date_str:
            appt = datetime.fromisoformat(appt_date_str)
            days_since = max(0, (posted - appt).days)
    except Exception:
        days_since = 7

    features = np.array([[
        review.get("rating", 3),
        len(review.get("text", "")),
        posted.hour if 'posted' in dir() else 12,
        posted.weekday() if 'posted' in dir() else 3,
        days_since,
    ]])

    score = float(model.score_samples(features)[0])  # more negative = more anomalous
    is_suspicious = score < -0.5

    reason = []
    if review.get("rating") in [1, 5] and len(review.get("text", "")) < 20:
        reason.append("extreme rating with very short text")
    if days_since > 365:
        reason.append("reviewed very late after appointment")
    if days_since < 0:
        reason.append("reviewed before appointment date")

    return {
        "is_suspicious": is_suspicious or len(reason) > 0,
        "anomaly_score": round(score, 3),
        "reasons": reason,
        "action": "flag_for_review" if (is_suspicious or reason) else "approved"
    }


def detect_queue_anomaly(queue_stats: dict) -> dict:
    """Detect abnormal queue patterns that might indicate system abuse."""
    model = _load()

    # Use same feature space but adapt values
    features = np.array([[
        queue_stats.get("avg_wait_time", 15) / 60,   # normalize
        queue_stats.get("patients_per_hour", 10),
        queue_stats.get("hour_of_day", 12),
        queue_stats.get("day_of_week", 3),
        queue_stats.get("cancellation_rate", 0.1) * 100,
    ]])

    score = float(model.score_samples(features)[0])
    return {
        "is_anomalous": score < -0.6,
        "anomaly_score": round(score, 3),
        "message": "Unusual queue pattern detected" if score < -0.6 else "Normal queue pattern"
    }
