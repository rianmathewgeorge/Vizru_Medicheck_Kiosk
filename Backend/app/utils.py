"""
Token Generation Utility
========================
Generates human-readable check-in tokens in the format DEPT-NNNN.

Design notes
------------
* Tokens use a department prefix + 4 random digits, e.g. CARD-4921.
* Elderly or low-literacy patients can read and recall a short token far
  more reliably than a UUID.
* Collision probability for 4 digits is 1/9000 per department — acceptable
  for a kiosk with low throughput.  The DB unique constraint is the hard
  safety net for the rare collision; the retry loop is the graceful handler.
"""

import random
import string

from sqlalchemy.orm import Session

from app.models import Patient
from app.schemas import DEPT_PREFIX, Department


def _random_digits(n: int = 4) -> str:
    """Return a string of n random decimal digits, zero-padded."""
    return "".join(random.choices(string.digits, k=n))


def generate_unique_token(department: str, db: Session, max_retries: int = 10) -> str:
    """
    Generate a unique DEPT-NNNN token for the given department.

    Retries up to `max_retries` times if the generated token already
    exists in the database (collision guard).

    Raises
    ------
    RuntimeError
        If a unique token cannot be generated within the retry budget
        (should be practically impossible under normal load).
    """
    dept_enum = Department(department)
    prefix = DEPT_PREFIX[dept_enum]

    for attempt in range(1, max_retries + 1):
        candidate = f"{prefix}-{_random_digits(4)}"
        exists = db.query(Patient).filter(Patient.token == candidate).first()
        if not exists:
            return candidate

    # Practically unreachable — raise to surface if it ever happens
    raise RuntimeError(
        f"Could not generate a unique token for department '{department}' "
        f"after {max_retries} attempts.  Database may be saturated."
    )
