"""
Pydantic Schemas — Zero-Trust Validation Layer
===============================================
Healthcare data integrity is non-negotiable.  Every field is validated
at the API boundary before a single byte is written to the database.

Key decisions
-------------
* Mobile regex ``^[0-9]{10}$`` — rejects spaces, dashes, country codes,
  and non-numeric characters.  FastAPI returns a 422 with a human-
  readable message if validation fails — no custom exception handler needed.
* Department is an Enum so the set of valid values is a single source of
  truth shared between validation and token-prefix generation.
* PatientCreate intentionally does NOT include `token` or `created_at`;
  those are server-generated — never trusted from the client.
"""

import re
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Allowed departments (single source of truth)
# ---------------------------------------------------------------------------
class Department(str, Enum):
    GENERAL_MEDICINE = "General Medicine"
    CARDIOLOGY = "Cardiology"
    ORTHOPEDICS = "Orthopedics"
    DERMATOLOGY = "Dermatology"
    PEDIATRICS = "Pediatrics"


# ---------------------------------------------------------------------------
# Token prefix map — kept here so business logic stays in the schema layer
# ---------------------------------------------------------------------------
DEPT_PREFIX: dict[Department, str] = {
    Department.GENERAL_MEDICINE: "GENM",
    Department.CARDIOLOGY: "CARD",
    Department.ORTHOPEDICS: "ORTH",
    Department.DERMATOLOGY: "DERM",
    Department.PEDIATRICS: "PEDS",
}

MOBILE_REGEX = re.compile(r"^[0-9]{10}$")


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------
class PatientCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=120,
        description="Full name — minimum 2 characters.",
        examples=["Priya Ramesh"],
    )
    age: int = Field(
        ...,
        ge=1,
        le=120,
        description="Age in years — must be between 1 and 120.",
        examples=[34],
    )
    gender: str = Field(
        ...,
        min_length=1,
        max_length=20,
        description="Gender identity (free text).",
        examples=["Female"],
    )
    mobile: str = Field(
        ...,
        description="Exactly 10 numeric digits — no spaces, dashes, or country codes.",
        examples=["9876543210"],
    )
    address: Optional[str] = Field(
        default=None,
        max_length=300,
        description="Optional home address.",
        examples=["12 Gandhi Nagar, Chennai - 600020"],
    )
    department: Department = Field(
        ...,
        description=f"Must be one of: {[d.value for d in Department]}",
        examples=["Cardiology"],
    )

    # -----------------------------------------------------------------------
    # Custom validators
    # -----------------------------------------------------------------------
    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        if not MOBILE_REGEX.match(v):
            raise ValueError(
                "Mobile number must be exactly 10 numeric digits "
                "(no spaces, dashes, or country codes)."
            )
        return v

    @field_validator("name")
    @classmethod
    def validate_name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name must not be blank or whitespace only.")
        return v.strip()

    model_config = {"use_enum_values": True}


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------
class TokenResponse(BaseModel):
    """Minimal response returned immediately after check-in — HIPAA aware.

    Only non-sensitive fields are returned so the screen can be handed to
    the next patient immediately.  The full PHI record is never echoed back.
    """

    token: str
    name: str
    department: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PatientResponse(BaseModel):
    """Full patient record — used by staff-facing GET endpoints."""

    id: int
    name: str
    age: int
    gender: str
    mobile: str
    address: Optional[str]
    department: str
    token: str
    created_at: datetime

    model_config = {"from_attributes": True}
