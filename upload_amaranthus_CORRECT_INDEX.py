#!/usr/bin/env python3
"""
Amaranthus CSV to Firestore Upload - INDEX FIX
The CSV's first column is being used as pandas index, not as a data column!
"""

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime
import sys
import os

print("=" * 70)
print("Amaranthus CSV Upload - INDEX FIX")
print("=" * 70)

# Firebase initialization
print("\n1. Initializing Firebase...")
try:
    # Try to find service account file in multiple locations
    service_account_paths = [
        'gen-lang-client-0092156800-3f84a3882b65.json',
        'raspberry_module/gen-lang-client-0092156800-3f84a3882b65.json',
        '../gen-lang-client-0092156800-3f84a3882b65.json'
    ]
    
    cred_file = None
    for path in service_account_paths:
        if os.path.exists(path):
            cred_file = path
            break
    
    if not cred_file:
        print("   ✗ Service account JSON file not found!")
        print("   Please download from: https://console.firebase.google.com/project/gen-lang-client-0092156800/settings/serviceaccounts/adminsdk")
        print("   Save as: gen-lang-client-0092156800-3f84a3882b65.json")
        sys.exit(1)
    
    cred = credentials.Certificate(cred_file)
    firebase_admin.initialize_app(cred)
    db = firestore.client(database='sasapp')
    print(f"   ✓ Connected to Firestore: sasapp (using {cred_file})")
except Exception as e:
    print(f"   ✗ Firebase initialization failed: {e}")
    sys.exit(1)

# Read CSV - CRITICAL: index_col=None to prevent auto-indexing
print("\n2. Reading CSV file...")
csv_file = 'amaranthus dataset 1 from 6 -19  to 7-22.csv'

try:
    # Read WITHOUT allowing pandas to use first column as index
    df = pd.read_csv(csv_file, index_col=None)
    print(f"   ✓ Loaded {len(df)} records")
    print(f"   ✓ Columns found: {len(df.columns)}")
    
    # Show actual structure
    print("\n3. Actual CSV Structure:")
    print(f"   Columns: {df.columns.tolist()}")
    print(f"\n   First row sample:")
    first_row = df.iloc[0]
    for col in df.columns[:5]:
        print(f"      {col}: {first_row[col]}")
    
except Exception as e:
    print(f"   ✗ Failed to read CSV: {e}")
    sys.exit(1)

# Helper function for safe float parsing
def parse_float_safe(value):
    """Convert value to float, return None for invalid values"""
    if pd.isna(value) or value == 'N/A':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

# Upload to Firestore
print("\n4. Uploading to Firestore...")
uploaded = 0
skipped = 0
batch = db.batch()
batch_count = 0
BATCH_SIZE = 500

for idx, row in df.iterrows():
    try:
        # Parse timestamp from the FIRST column (which should be 'timestamp')
        timestamp_str = str(row['timestamp']).strip()
        
        # Skip if timestamp is invalid
        if not timestamp_str or timestamp_str == 'nan' or timestamp_str == 'N/A':
            skipped += 1
            continue
        
        # Try to parse timestamp
        try:
            timestamp = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            print(f"   ⚠ Invalid timestamp at row {idx}: {timestamp_str}")
            skipped += 1
            continue
        
        # Build document data
        doc_data = {
            'timestamp': timestamp,
            'crop_id': 'amaranthus',
            'pi_id': 'pi_unit_001',
            
            # Environmental sensors
            'air_temp_c': parse_float_safe(row['air_temp_c']),
            'humidity_percent': parse_float_safe(row['humidity_percent']),
            'water_soil_temp_c': parse_float_safe(row['water_soil_temp_c']),
            'air_pressure_hpa': parse_float_safe(row['air_pressure_hpa']),
            
            # Soil moisture
            'soil_moisture_raw': parse_float_safe(row['soil_moisture_raw']),
            'soil_moisture_status': str(row['soil_moisture_status']) if pd.notna(row['soil_moisture_status']) else None,
            
            # Light sensor
            'light_level_raw': parse_float_safe(row['light_level_raw']),
            'light_level_status': str(row['light_level_status']) if pd.notna(row['light_level_status']) else None,
            
            # Rain sensor
            'rain_level_raw': parse_float_safe(row['rain_level_raw']),
            'rain_level_status': str(row['rain_level_status']) if pd.notna(row['rain_level_status']) else None,
            
            # Air quality (MQ135)
            'co2_ppm': parse_float_safe(row['co2_ppm']),
            'nh3_ppm': parse_float_safe(row['nh3_ppm']),
            'voc_ppm': parse_float_safe(row['voc_ppm']),
            
            # NPK sensor
            'nitrogen_mg_kg': parse_float_safe(row['nitrogen_mg_kg']),
            'nitrogen_status': str(row['nitrogen_status']) if pd.notna(row['nitrogen_status']) else None,
            'phosphorus_mg_kg': parse_float_safe(row['phosphorus_mg_kg']),
            'phosphorus_status': str(row['phosphorus_status']) if pd.notna(row['phosphorus_status']) else None,
            'potassium_mg_kg': parse_float_safe(row['potassium_mg_kg']),
            'potassium_status': str(row['potassium_status']) if pd.notna(row['potassium_status']) else None,
        }
        
        # Create document ID
        doc_id = f"amaranthus_{timestamp.strftime('%Y%m%d_%H%M%S')}"
        doc_ref = db.collection('sensorReadings').document(doc_id)
        batch.set(doc_ref, doc_data)
        
        batch_count += 1
        uploaded += 1
        
        # Commit batch every BATCH_SIZE records
        if batch_count >= BATCH_SIZE:
            batch.commit()
            print(f"   ✓ Uploaded batch: {uploaded} records so far...")
            batch = db.batch()
            batch_count = 0
        
    except Exception as e:
        print(f"   ⚠ Error at row {idx}: {e}")
        skipped += 1

# Commit remaining batch
if batch_count > 0:
    batch.commit()
    print(f"   ✓ Final batch committed")

# Summary
print("\n" + "=" * 70)
print("✅ UPLOAD COMPLETE!" if uploaded > 0 else "❌ UPLOAD FAILED!")
print("=" * 70)
print(f"\n📊 Results:")
print(f"   Total records: {len(df)}")
print(f"   ✓ Uploaded: {uploaded}")
print(f"   ✗ Skipped: {skipped}")
print(f"   Success rate: {(uploaded/len(df)*100):.1f}%")

if uploaded > 0:
    print(f"\n📍 Data Location:")
    print(f"   Collection: sensorReadings")
    print(f"   Crop: amaranthus")
    print(f"   Period: {df.iloc[1]['timestamp']} to {df.iloc[-1]['timestamp']}")
    print(f"\n🔗 View in Firestore:")
    print(f"   https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp/data/~2FsensorReadings")
else:
    print("\n❌ No records uploaded. Please check the CSV file structure.")

print("\n" + "=" * 70)
