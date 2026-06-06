"""
Database configuration — SQLAlchemy + SQLite
=============================================
SQLite is intentionally chosen for kiosk deployments:
  • Zero network dependency — registrations survive internet outages.
  • Single-file portability — the whole DB is one `kiosk.db` file.
  • No separate database server to install or maintain.

connect_args={"check_same_thread": False} is required when SQLite is
used with FastAPI because requests can be handled on different threads.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./kiosk.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    # Echo SQL to stdout — set to False in production
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def init_db() -> None:
    """Create all tables declared via Base.metadata (idempotent)."""
    # Import models here so that Base.metadata is populated before
    # create_all() is called — even if nothing else imported the model.
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def get_db():
    """
    FastAPI dependency that yields a SQLAlchemy session and guarantees
    the session is closed whether the request succeeds or raises.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
