# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    app_name: str = "CareCircle API"
    app_version: str = "2.0.0"
    debug: bool = False

    # Database (Neon Postgres)
    database_url: str = ""

    # Supabase Auth (we verify JWTs Supabase issued — we don't store data there)
    supabase_url: str = ""          # used to fetch JWKS at {url}/auth/v1/.well-known/jwks.json
    supabase_jwt_secret: str = ""   # legacy HS256 fallback for tokens issued before key rotation

    # AI
    gemini_api_key: str = ""
    hf_token: str = ""

    # HuggingFace model IDs (used by ML modules)
    hf_symptom_model: str = "emilyalsentzer/Bio_ClinicalBERT"
    hf_severity_model: str = "distilbert-base-uncased"
    hf_ocr_model: str = "microsoft/trocr-base-handwritten"

    # App
    app_secret_key: str = "change-in-production"
    cors_origins: str = "http://localhost:3000"

    # Bhopal defaults
    default_city: str = "Bhopal"
    default_state: str = "Madhya Pradesh"
    default_lat: float = 23.2599
    default_lng: float = 77.4126

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
