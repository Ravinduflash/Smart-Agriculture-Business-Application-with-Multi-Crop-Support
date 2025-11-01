#!/usr/bin/env python3
"""Upload the aligned Amaranthus sensor CSV into Firestore."""

from __future__ import annotations

import os
import sys
from datetime import datetime

import firebase_admin
import pandas as pd
from firebase_admin import credentials, firestore

CSV_PATH = "amaranthus_dataset_1_aligned.csv"
SERVICE_ACCOUNT_CANDIDATES = [
    "Credientals/gen-lang-client-0092156800-3f84a3882b65.json",
    "gen-lang-client-0092156800-3f84a3882b65.json",
    "raspberry_module/gen-lang-client-0092156800-3f84a3882b65.json",
    "../gen-lang-client-0092156800-3f84a3882b65.json",
]
BATCH_SIZE = 500
COLLECTION_NAME = "sensorReadings"


def locate_service_account() -> str:
    for candidate in SERVICE_ACCOUNT_CANDIDATES:
        if os.path.exists(candidate):
            return candidate
    raise FileNotFoundError(
        "Service account JSON not found. Place it in Credientals/ or repo root."
    )


def parse_float_safe(value):
    if pd.isna(value) or value == "N/A":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def main() -> None:
    print("=" * 70)
    print("Amaranthus CSV Upload -> Firestore")
    print("=" * 70)

    print("\n1. Initializing Firebase...")
    try:
        cred_path = locate_service_account()
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        try:
            db = firestore.client(database="sasapp")
        except TypeError:
            db = firestore.client(database_id="sasapp")
        print(f"   ✓ Connected to Firestore using {cred_path}")
    except Exception as exc:
        print(f"   ✗ Firebase initialization failed: {exc}")
        sys.exit(1)

    print("\n2. Loading aligned CSV...")
    try:
        df = pd.read_csv(CSV_PATH)
    except Exception as exc:
        print(f"   ✗ Unable to read {CSV_PATH}: {exc}")
        sys.exit(1)

    if df.empty:
        print("   ✗ CSV contains no rows")
        sys.exit(1)

    expected_columns = [
        "timestamp",
        "air_temp_c",
        "humidity_percent",
        "water_soil_temp_c",
        "air_pressure_hpa",
        "air_pressure_status",
        "soil_moisture_raw",
        "soil_moisture_status",
        "light_level_raw",
        "light_level_status",
        "rain_level_raw",
        "rain_level_status",
        "co2_ppm",
        "nh3_ppm",
        "voc_ppm",
        "nitrogen_mg_kg",
        "nitrogen_status",
        "phosphorus_mg_kg",
        "phosphorus_status",
        "potassium_mg_kg",
        "potassium_status",
    ]

    if list(df.columns) != expected_columns:
        print("   ✗ CSV columns mismatch expected schema")
        print(f"     Found: {df.columns.tolist()}")
        sys.exit(1)

    print(f"   ✓ Loaded {len(df)} rows with expected schema")

    uploaded = 0
    skipped = 0
    batch = db.batch()
    batch_count = 0

    print("\n3. Uploading documents...")
    for idx, row in df.iterrows():
        timestamp_raw = str(row["timestamp"]).strip()
        if not timestamp_raw or timestamp_raw in {"nan", "N/A"}:
            skipped += 1
            continue

        try:
            timestamp = datetime.strptime(timestamp_raw, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            print(f"   ⚠ Skipping row {idx}: invalid timestamp '{timestamp_raw}'")
            skipped += 1
            continue

        doc_id = f"amaranthus_{timestamp.strftime('%Y%m%d_%H%M%S')}"
        doc_ref = db.collection(COLLECTION_NAME).document(doc_id)

        doc_data = {
            "timestamp": timestamp,
            "crop_id": "amaranthus",
            "pi_id": "pi_unit_001",
            "air_temp_c": parse_float_safe(row["air_temp_c"]),
            "humidity_percent": parse_float_safe(row["humidity_percent"]),
            "water_soil_temp_c": parse_float_safe(row["water_soil_temp_c"]),
            "air_pressure_hpa": parse_float_safe(row["air_pressure_hpa"]),
            "air_pressure_status": row["air_pressure_status"] if pd.notna(row["air_pressure_status"]) else None,
            "soil_moisture_raw": parse_float_safe(row["soil_moisture_raw"]),
            "soil_moisture_status": row["soil_moisture_status"] if pd.notna(row["soil_moisture_status"]) else None,
            "light_level_raw": parse_float_safe(row["light_level_raw"]),
            "light_level_status": row["light_level_status"] if pd.notna(row["light_level_status"]) else None,
            "rain_level_raw": parse_float_safe(row["rain_level_raw"]),
            "rain_level_status": row["rain_level_status"] if pd.notna(row["rain_level_status"]) else None,
            "co2_ppm": parse_float_safe(row["co2_ppm"]),
            "nh3_ppm": parse_float_safe(row["nh3_ppm"]),
            "voc_ppm": parse_float_safe(row["voc_ppm"]),
            "nitrogen_mg_kg": parse_float_safe(row["nitrogen_mg_kg"]),
            "nitrogen_status": row["nitrogen_status"] if pd.notna(row["nitrogen_status"]) else None,
            "phosphorus_mg_kg": parse_float_safe(row["phosphorus_mg_kg"]),
            "phosphorus_status": row["phosphorus_status"] if pd.notna(row["phosphorus_status"]) else None,
            "potassium_mg_kg": parse_float_safe(row["potassium_mg_kg"]),
            "potassium_status": row["potassium_status"] if pd.notna(row["potassium_status"]) else None,
        }

        batch.set(doc_ref, doc_data)
        uploaded += 1
        batch_count += 1

        if batch_count >= BATCH_SIZE:
            batch.commit()
            print(f"   ✓ Committed {uploaded} documents so far...")
            batch = db.batch()
            batch_count = 0

    if batch_count > 0:
        batch.commit()

    print("\n" + "=" * 70)
    status = "✅ Upload complete" if uploaded else "❌ No records uploaded"
    print(status)
    print("=" * 70)
    print(f"Total rows: {len(df)} | Uploaded: {uploaded} | Skipped: {skipped}")


if __name__ == "__main__":
    main()
