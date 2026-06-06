"""
SQLAlchemy ORM Model — Patient
==============================
Maps the `patients` table in kiosk.db.

Design notes
------------
* `token` carries a UniqueConstraint so the database layer enforces
  uniqueness even if application logic produces a collision (extremely
  rare, but defence-in-depth matters in healthcare systems).
* `created_at` defaults to UTC now() at the Python layer rather than
  the DB layer so behaviour is consistent across SQLite and any future
  migration to PostgreSQL / MySQL.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, UniqueConstraint

from app.database import Base


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = (UniqueConstraint("token", name="uq_patients_token"),)

    id: int = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name: str = Column(String(120), nullable=False)
    age: int = Column(Integer, nullable=False)
    gender: str = Column(String(20), nullable=False)
    mobile: str = Column(String(10), nullable=False)
    address: str | None = Column(String(300), nullable=True)
    department: str = Column(String(60), nullable=False)
    token: str = Column(String(20), nullable=False, unique=True, index=True)
    created_at: datetime = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Patient id={self.id} token={self.token!r} name={self.name!r}>"
