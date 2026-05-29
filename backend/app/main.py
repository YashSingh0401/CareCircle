# backend/app/main.py
import traceback
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.auth import get_current_user
from app.config import settings
from app.db.supabase import init_pool, close_pool
from app.routers import (
    appointments,
    assistant,
    doctors,
    emergency,
    emergency_contacts,
    home,
    hospitals,
    queue,
    records,
)

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_pool()
    yield
    await close_pool()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered Hospital Management System API",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(assistant.router, prefix="/api/assistant", tags=["AI Assistant"])
app.include_router(records.router,   prefix="/api/records",   tags=["Medical Records"])
app.include_router(queue.router,     prefix="/api/queue",     tags=["Queue"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency"])
app.include_router(hospitals.router, prefix="/api/hospitals", tags=["Hospitals"])
app.include_router(doctors.router,   prefix="/api/doctors",   tags=["Doctors"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(home.router,         prefix="/api/home",         tags=["Home"])
app.include_router(emergency_contacts.router, prefix="/api/emergency-contacts", tags=["Emergency Contacts"])

# Static file serving for uploaded medical-record files (dev only — swap to S3/CDN for prod)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.app_version}


if settings.debug:
    @app.get("/api/_debug/whoami", tags=["Debug"])
    async def whoami(user: dict = Depends(get_current_user)):
        """Returns decoded JWT claims for the calling user. DEBUG=true only."""
        return user


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Return a 500 that always carries CORS headers, so the browser shows the
    real error to the user instead of a misleading 'CORS blocked' message."""
    # Always log the traceback so the operator can see the cause in the console.
    print("=" * 70)
    print(f"Unhandled error on {request.method} {request.url.path}")
    traceback.print_exception(type(exc), exc, exc.__traceback__)
    print("=" * 70)

    body = {"detail": str(exc) if settings.debug else "Internal server error"}
    headers: dict[str, str] = {}

    # Echo the request origin back if it's in our allowlist — CORSMiddleware
    # does this on normal responses but skips it for errors raised in routes.
    origin = request.headers.get("origin")
    if origin and origin in settings.origins_list:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"

    return JSONResponse(status_code=500, content=body, headers=headers)
