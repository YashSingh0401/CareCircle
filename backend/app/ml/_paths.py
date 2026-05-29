"""Resolve ML model file paths.

Search order for every model file:
  1. $ML_MODELS_DIR (env override, absolute or relative-to-repo-root)
  2. <repo-root>/ML Models/<subfolder>/<filename>
  3. backend/app/ml/<subfolder>/<filename>  (legacy module-local path)
  4. None  -> caller falls back to rules/keywords/etc.
"""
import os
from pathlib import Path

_BACKEND_APP_ML = Path(__file__).resolve().parent      # backend/app/ml
_REPO_ROOT = _BACKEND_APP_ML.parents[2]                # repo root


def _root() -> Path:
    override = os.getenv("ML_MODELS_DIR", "").strip()
    if override:
        p = Path(override)
        return p if p.is_absolute() else (_REPO_ROOT / p)
    return _REPO_ROOT / "ML Models"


def resolve(subfolder: str, filename: str) -> Path | None:
    for candidate in (
        _root() / subfolder / filename,
        _BACKEND_APP_ML / subfolder / filename,
    ):
        if candidate.exists():
            return candidate
    return None
