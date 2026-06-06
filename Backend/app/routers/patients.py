"""
Patients Router
===============
All patient-facing REST endpoints live here.

Endpoint summary
----------------
POST   /api/patients                           — Register a new patient
GET    /api/patients                           — List all patients (newest first)
GET    /api/patients?search=&department=       — Filtered list
GET    /api/patients/{patient_id}              — Single patient by PK
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Patient
from app.schemas import PatientCreate, PatientResponse, TokenResponse
from app.utils import generate_unique_token

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /api/patients — Check-in a new patient
# ---------------------------------------------------------------------------
@router.post(
    "/patients",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new patient",
    description=(
        "Validates the incoming payload, auto-generates a unique readable token "
        "(e.g. CARD-4921), persists the record, and returns only the non-sensitive "
        "confirmation fields — keeping PHI off the screen for the next patient."
    ),
)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    token = generate_unique_token(payload.department, db)

    patient = Patient(
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        mobile=payload.mobile,
        address=payload.address,
        department=payload.department,
        token=token,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient


# ---------------------------------------------------------------------------
# GET /api/patients — List all patients with optional filtering
# ---------------------------------------------------------------------------
@router.get(
    "/patients",
    response_model=list[PatientResponse],
    summary="List patients",
    description=(
        "Returns all patients ordered by registration time (newest first). "
        "Optionally filter by partial name match (`search`) and/or exact "
        "department (`department`)."
    ),
)
def list_patients(
    search: Optional[str] = Query(
        default=None,
        description="Partial (case-insensitive) match on patient name.",
        examples=["priya"],
    ),
    department: Optional[str] = Query(
        default=None,
        description="Exact department name filter.",
        examples=["Cardiology"],
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Patient)

    if search:
        query = query.filter(Patient.name.ilike(f"%{search}%"))

    if department:
        query = query.filter(Patient.department == department)

    patients = query.order_by(Patient.created_at.desc()).all()
    return patients


# ---------------------------------------------------------------------------
# GET /api/patients/{patient_id} — Retrieve a single patient
# ---------------------------------------------------------------------------
@router.get(
    "/patients/{patient_id}",
    response_model=PatientResponse,
    summary="Get a patient by ID",
    description="Returns the full record for a specific patient by their primary key.",
)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with id={patient_id} not found.",
        )

    return patient
