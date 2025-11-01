#!/usr/bin/env python3
"""Fix column misalignment in local Amaranthus CSV log.

The existing CSV is missing the `air_pressure_status` column header,
so every subsequent value shifts left by one column. This script
inserts the missing column and writes a corrected CSV.
"""

from __future__ import annotations

import csv
from pathlib import Path

INPUT_PATH = Path("amaranthus dataset 1 from 6 -19  to 7-22.csv")
OUTPUT_PATH = Path("amaranthus_dataset_1_aligned.csv")

EXPECTED_COLUMNS = [
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


def realign_row(row: list[str]) -> list[str]:
    """Return a row with values aligned to EXPECTED_COLUMNS.

    The source rows contain 21 values but only 20 headers. The first
    five values already match the expected order. Starting from index 5,
    values are shifted left by one position because the header for
    `air_pressure_status` is missing. This helper simply maps the values
    by index.
    """

    # If row already matches expected length, return as-is
    if len(row) == len(EXPECTED_COLUMNS):
        return row

    if len(row) != len(EXPECTED_COLUMNS) + 1:
        raise ValueError(
            f"Unexpected row length {len(row)} encountered; cannot safely realign."
        )

    # Compose the corrected row by grabbing values in the desired order.
    return [
        row[0],  # timestamp
        row[1],  # air_temp_c
        row[2],  # humidity_percent
        row[3],  # water_soil_temp_c
        row[4],  # air_pressure_hpa
        row[5],  # air_pressure_status (missing header in source)
        row[6],  # soil_moisture_raw
        row[7],  # soil_moisture_status
        row[8],  # light_level_raw
        row[9],  # light_level_status
        row[10],  # rain_level_raw
        row[11],  # rain_level_status
        row[12],  # co2_ppm
        row[13],  # nh3_ppm
        row[14],  # voc_ppm
        row[15],  # nitrogen_mg_kg
        row[16],  # nitrogen_status
        row[17],  # phosphorus_mg_kg
        row[18],  # phosphorus_status
        row[19],  # potassium_mg_kg
        row[20],  # potassium_status
    ]


def main() -> None:
    if not INPUT_PATH.exists():
        raise FileNotFoundError(f"Input CSV not found: {INPUT_PATH}")

    with INPUT_PATH.open(newline="", encoding="utf-8") as src, OUTPUT_PATH.open(
        "w", newline="", encoding="utf-8"
    ) as dst:
        reader = csv.reader(src)
        writer = csv.writer(dst)

        # Write corrected header
        writer.writerow(EXPECTED_COLUMNS)

        header = next(reader, None)
        if header is None:
            raise ValueError("Input CSV has no data to process.")

        # Process rows, skipping any empty rows
        for row in reader:
            if not row:
                continue
            corrected = realign_row(row)
            writer.writerow(corrected)

    print(f"Corrected CSV written to {OUTPUT_PATH.resolve()}")


if __name__ == "__main__":
    main()
