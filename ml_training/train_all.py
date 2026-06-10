"""
ml_training/train_all.py
============================
Master script — trains ALL CareCircle ML models in sequence.

Run from project root:
  cd carecircle
  python ml_training/train_all.py

Order:
  1. Generate Bhopal synthetic data  (~10 sec)
  2. Train CatBoost severity model   (~2 min CPU)
  3. Train XGBoost LTR ranker        (~1 min CPU)
  4. Train Queue predictor           (~30 sec CPU)
  5. Initialize Isolation Forest     (~5 sec CPU)

Total: ~4 minutes on CPU, ~1.5 min with RTX 3050
RAM peak: ~600MB (safe for 16GB system)
All models save to backend/app/ml/*/
"""

import sys, os, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path

def section(title: str):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def check_requirements():
    """Make sure required packages are installed."""
    missing = []
    for pkg in ["catboost", "xgboost", "sklearn", "pandas", "numpy", "joblib"]:
        try:
            __import__(pkg if pkg != "sklearn" else "sklearn")
        except ImportError:
            missing.append(pkg)
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        print("Run: pip install -r ml_training/requirements.txt")
        sys.exit(1)
    print("✅ All required packages found")


def step1_generate_data():
    section("Step 1/5 — Generating Bhopal Synthetic Data")
    from ml_training.scripts.generate_bhopal_data import (
        generate_doctors, generate_queue_data,
        generate_symptom_data, generate_emergency_severity_data,
        generate_doctor_ranking_data, HOSPITALS
    )
    import json, pandas as pd

    out = Path("ml_training/data/bhopal")
    out.mkdir(parents=True, exist_ok=True)

    t = time.time()
    doctors = generate_doctors(n_per_hospital=15)
    doctors.to_csv(out / "doctors.csv", index=False)
    print(f"  ✓ Doctors: {len(doctors)} records")

    queue = generate_queue_data(n_days=180)
    queue.to_csv(out / "queue_history.csv", index=False)
    print(f"  ✓ Queue history: {len(queue)} records")

    symptoms = generate_symptom_data(n=5000)
    symptoms.to_csv(out / "symptoms.csv", index=False)
    print(f"  ✓ Symptoms: {len(symptoms)} records")

    emergency = generate_emergency_severity_data(n=8000)
    emergency.to_csv(out / "emergency_severity.csv", index=False)
    print(f"  ✓ Emergency: {len(emergency)} records")

    ranking = generate_doctor_ranking_data(doctors, n_queries=3000)
    ranking.to_csv(out / "doctor_ranking.csv", index=False)
    print(f"  ✓ Ranking: {len(ranking)} records")

    with open(out / "hospitals.json", "w") as f:
        json.dump(HOSPITALS, f, indent=2)
    print(f"  ✓ Hospitals: {len(HOSPITALS)} Bhopal hospitals")
    print(f"  Done in {time.time()-t:.1f}s")


def step2_train_catboost():
    section("Step 2/5 — Training CatBoost Severity Model")
    t = time.time()
    from ml_training.train_catboost import train
    acc = train()
    print(f"  ✓ Accuracy: {acc:.4f} | Time: {time.time()-t:.1f}s")


def step3_train_xgboost():
    section("Step 3/5 — Training XGBoost LTR Ranker")
    t = time.time()
    from ml_training.train_xgboost_ltr import train
    train()
    print(f"  ✓ Done in {time.time()-t:.1f}s")


def step4_train_queue():
    section("Step 4/5 — Training Queue Wait-Time Predictor")
    t = time.time()
    from ml_training.train_queue_predictor import train
    train()
    print(f"  ✓ Done in {time.time()-t:.1f}s")


def step5_isolation_forest():
    section("Step 5/5 — Initializing Isolation Forest")
    t = time.time()
    # Import triggers auto-training
    repo_root = Path(__file__).parent.parent
    sys.path.insert(0, str(repo_root))
    sys.path.insert(0, str(repo_root / "backend"))
    from backend.app.ml.isolation_forest.anomaly_detector import _train_default, MODEL_PATH
    _train_default()
    if MODEL_PATH.exists():
        print(f"  ✓ Model saved: {MODEL_PATH}")
    print(f"  Done in {time.time()-t:.1f}s")


def verify_models():
    section("Verification — Checking all model files")
    models = {
        "CatBoost Severity":    "backend/app/ml/catboost_severity/severity_model.cbm",
        "XGBoost LTR Ranker":   "backend/app/ml/xgboost_ltr/ranker.json",
        "XGBoost LTR Scaler":   "backend/app/ml/xgboost_ltr/scaler.pkl",
        "Queue Predictor":      "backend/app/ml/tft_queue/queue_model.json",
        "Queue Scaler":         "backend/app/ml/tft_queue/queue_scaler.pkl",
        "Isolation Forest":     "backend/app/ml/isolation_forest/anomaly_model.pkl",
    }
    all_ok = True
    for name, path in models.items():
        p = Path(path)
        if p.exists():
            size = p.stat().st_size / (1024 * 1024)
            print(f"  ✅ {name}: {size:.2f} MB")
        else:
            print(f"  ❌ {name}: NOT FOUND at {path}")
            all_ok = False
    return all_ok


if __name__ == "__main__":
    total_start = time.time()
    print("\n🏥 CareCircle ML Training Pipeline")
    print("   Bhopal, Madhya Pradesh — RTX 3050 safe (CPU training)")

    check_requirements()

    try:
        step1_generate_data()
        step2_train_catboost()
        step3_train_xgboost()
        step4_train_queue()
        step5_isolation_forest()
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback; traceback.print_exc()
        sys.exit(1)

    ok = verify_models()
    total = time.time() - total_start
    print(f"\n{'✅ All models trained!' if ok else '⚠️  Some models missing'}")
    print(f"Total time: {total/60:.1f} minutes")
    print("\nNext steps:")
    print("  1. cd backend && uvicorn app.main:app --reload")
    print("  2. cd frontend && npm run dev")
    print("  3. Open http://localhost:3000")
