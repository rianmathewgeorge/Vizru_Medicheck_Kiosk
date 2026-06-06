"""
seed_data.py — Populate the SQLite database with 15 realistic mock patients
============================================================================
Run once (or at any time) to pre-load the kiosk with representative data
across all five departments.  Idempotent: running it again will silently
skip records that would create duplicate tokens.

Usage
-----
    python seed_data.py
"""

import sys
from pathlib import Path

# Make sure the app package is importable when running from the project root
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, init_db  # noqa: E402
from app.models import Patient  # noqa: E402

# ---------------------------------------------------------------------------
# Seed records
# ---------------------------------------------------------------------------
SEED_PATIENTS = [
    # ---- General Medicine ----
    {
        "name": "Arjun Sharma",
        "age": 45,
        "gender": "Male",
        "mobile": "9876543210",
        "address": "14 MG Road, Bengaluru - 560001",
        "department": "General Medicine",
        "token": "GENM-1001",
    },
    {
        "name": "Lakshmi Iyer",
        "age": 62,
        "gender": "Female",
        "mobile": "8765432109",
        "address": "7 Anna Salai, Chennai - 600002",
        "department": "General Medicine",
        "token": "GENM-1002",
    },
    {
        "name": "Rahul Verma",
        "age": 28,
        "gender": "Male",
        "mobile": "7654321098",
        "address": None,
        "department": "General Medicine",
        "token": "GENM-1003",
    },
    # ---- Cardiology ----
    {
        "name": "Sunita Mehta",
        "age": 57,
        "gender": "Female",
        "mobile": "9988776655",
        "address": "21 Linking Road, Mumbai - 400050",
        "department": "Cardiology",
        "token": "CARD-2001",
    },
    {
        "name": "Devendra Patel",
        "age": 70,
        "gender": "Male",
        "mobile": "9012345678",
        "address": "3 Ashram Road, Ahmedabad - 380009",
        "department": "Cardiology",
        "token": "CARD-2002",
    },
    {
        "name": "Meena Nair",
        "age": 49,
        "gender": "Female",
        "mobile": "8899001122",
        "address": "55 Connaught Place, New Delhi - 110001",
        "department": "Cardiology",
        "token": "CARD-2003",
    },
    # ---- Orthopedics ----
    {
        "name": "Vikram Singh",
        "age": 38,
        "gender": "Male",
        "mobile": "7788990011",
        "address": "8 Park Street, Kolkata - 700016",
        "department": "Orthopedics",
        "token": "ORTH-3001",
    },
    {
        "name": "Ananya Bose",
        "age": 25,
        "gender": "Female",
        "mobile": "6677889900",
        "address": None,
        "department": "Orthopedics",
        "token": "ORTH-3002",
    },
    {
        "name": "Suresh Reddy",
        "age": 55,
        "gender": "Male",
        "mobile": "9345678901",
        "address": "33 Banjara Hills, Hyderabad - 500034",
        "department": "Orthopedics",
        "token": "ORTH-3003",
    },
    # ---- Dermatology ----
    {
        "name": "Pooja Gupta",
        "age": 31,
        "gender": "Female",
        "mobile": "8123456789",
        "address": "17 Civil Lines, Jaipur - 302006",
        "department": "Dermatology",
        "token": "DERM-4001",
    },
    {
        "name": "Karan Malhotra",
        "age": 22,
        "gender": "Male",
        "mobile": "9234567890",
        "address": None,
        "department": "Dermatology",
        "token": "DERM-4002",
    },
    {
        "name": "Asha Thomas",
        "age": 41,
        "gender": "Female",
        "mobile": "7890123456",
        "address": "9 MG Road, Kochi - 682016",
        "department": "Dermatology",
        "token": "DERM-4003",
    },
    # ---- Pediatrics ----
    {
        "name": "Rohan Pillai",
        "age": 6,
        "gender": "Male",
        "mobile": "9123456780",
        "address": "22 Jubilee Hills, Hyderabad - 500033",
        "department": "Pediatrics",
        "token": "PEDS-5001",
    },
    {
        "name": "Sneha Krishnan",
        "age": 3,
        "gender": "Female",
        "mobile": "8012345679",
        "address": "11 T Nagar, Chennai - 600017",
        "department": "Pediatrics",
        "token": "PEDS-5002",
    },
    {
        "name": "Aditya Joshi",
        "age": 10,
        "gender": "Male",
        "mobile": "7901234568",
        "address": "4 Koregaon Park, Pune - 411001",
        "department": "Pediatrics",
        "token": "PEDS-5003",
    },
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def run_seed() -> None:
    print("Initialising database…")
    init_db()

    db = SessionLocal()
    inserted = 0
    skipped = 0

    try:
        for record in SEED_PATIENTS:
            exists = db.query(Patient).filter(Patient.token == record["token"]).first()
            if exists:
                print(f"  SKIP  {record['token']} — already in database.")
                skipped += 1
                continue

            patient = Patient(**record)
            db.add(patient)
            db.commit()
            print(f"  OK    {record['token']} — {record['name']} ({record['department']})")
            inserted += 1

    except Exception as exc:
        db.rollback()
        print(f"\nERROR: {exc}")
        raise
    finally:
        db.close()

    print(
        f"\nSeeding complete.  "
        f"Inserted: {inserted}  |  Skipped (already exist): {skipped}"
    )


if __name__ == "__main__":
    run_seed()
