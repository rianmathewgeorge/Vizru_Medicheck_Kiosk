"""
Healthcare Patient Self Check-in Kiosk — FastAPI Backend
=========================================================
Entry point: registers routers, CORS middleware, and runs startup
database initialisation so the application is ready out of the box.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import patients


# ---------------------------------------------------------------------------
# Lifespan — replaces the deprecated @app.on_event("startup") pattern
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all SQLAlchemy tables on first boot (idempotent)."""
    init_db()
    yield


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Healthcare Kiosk API",
    description=(
        "Production-ready REST API for a patient self-check-in kiosk. "
        "Stores registrations in a local SQLite database so the kiosk "
        "remains operational even during network outages."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite/React dev server running on localhost:5173
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(patients.router, prefix="/api", tags=["Patients"])


# ---------------------------------------------------------------------------
# Health-check — useful for load balancers / container probes
# ---------------------------------------------------------------------------
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "Healthcare Kiosk API"}
