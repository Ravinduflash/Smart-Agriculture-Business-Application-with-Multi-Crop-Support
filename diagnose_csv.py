"""
CSV Structure Diagnostic - Find out why uploads are failing
"""
import pandas as pd

print("=" * 70)
print("CSV STRUCTURE DIAGNOSTIC")
print("=" * 70)

csv_file = 'amaranthus dataset 1 from 6 -19  to 7-22.csv'

# Test 1: Default pandas read (what's happening now)
print("\n📋 TEST 1: Default pandas.read_csv()")
print("-" * 70)
df1 = pd.read_csv(csv_file)
print(f"Shape: {df1.shape}")
print(f"Index: {df1.index[:3].tolist()}")
print(f"Columns: {df1.columns.tolist()}")
print(f"\nFirst row data:")
print(df1.iloc[0])

# Test 2: Explicit index_col=None (what we should use)
print("\n\n📋 TEST 2: pandas.read_csv(index_col=None)")
print("-" * 70)
df2 = pd.read_csv(csv_file, index_col=None)
print(f"Shape: {df2.shape}")
print(f"Index: {df2.index[:3].tolist()}")
print(f"Columns: {df2.columns.tolist()}")
print(f"\nFirst row data:")
print(df2.iloc[0])
print(f"\nFirst row timestamp value: {repr(df2.iloc[0]['timestamp'])}")
print(f"First row timestamp type: {type(df2.iloc[0]['timestamp'])}")

# Test 3: Check if first row is valid
print("\n\n📋 TEST 3: Valid Timestamps")
print("-" * 70)
valid_count = 0
for idx, row in df2.head(10).iterrows():
    ts = str(row['timestamp']).strip()
    is_valid = ts != 'nan' and ts != 'N/A' and len(ts) > 10
    status = "✓" if is_valid else "✗"
    print(f"  Row {idx}: {status} '{ts}'")
    if is_valid:
        valid_count += 1

print(f"\n  Valid timestamps in first 10: {valid_count}/10")

# Test 4: Show what the upload will see
print("\n\n📋 TEST 4: What Upload Script Will See")
print("-" * 70)
df3 = pd.read_csv(csv_file, index_col=None)
first_valid_idx = None
for idx, row in df3.iterrows():
    ts = str(row['timestamp']).strip()
    if ts != 'nan' and ts != 'N/A' and len(ts) > 10:
        first_valid_idx = idx
        break

if first_valid_idx is not None:
    print(f"First valid row found at index: {first_valid_idx}")
    row = df3.iloc[first_valid_idx]
    print(f"\nData from row {first_valid_idx}:")
    print(f"  timestamp: {row['timestamp']}")
    print(f"  air_temp_c: {row['air_temp_c']}")
    print(f"  humidity_percent: {row['humidity_percent']}")
    print(f"  water_soil_temp_c: {row['water_soil_temp_c']}")
    print(f"  air_pressure_hpa: {row['air_pressure_hpa']}")
    print(f"  soil_moisture_raw: {row['soil_moisture_raw']}")
else:
    print("❌ NO VALID ROWS FOUND!")

print("\n" + "=" * 70)
