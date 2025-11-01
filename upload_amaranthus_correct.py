"""
Upload Amaranthus data with proper CSV parsing
Skips the malformed first row and uses correct data

Usage:
    python upload_amaranthus_correct.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime
import sys
import time

def parse_float(value):
    """Safely parse float value"""
    if pd.isna(value):
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def parse_string(value):
    """Safely parse string value"""
    if pd.isna(value) or value == '' or value == 'nan':
        return None
    return str(value)

def upload_correct_data():
    print("=" * 70)
    print("Uploading Amaranthus Sensor Data - FIXED VERSION")
    print("=" * 70)
    print()
    
    try:
        # Initialize Firebase
        print("1. Initializing Firebase...")
        cred = credentials.Certificate(r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\Credientals\gen-lang-client-0092156800-3f84a3882b65.json')
        
        try:
            firebase_admin.get_app()
        except ValueError:
            firebase_admin.initialize_app(cred)
        
        db = firestore.client(database_id='sasapp')
        print("   ✓ Connected to Firestore: sasapp")
        print()
        
        # Read CSV - skip first data row (row 1, keeping header row 0)
        print("2. Reading CSV (skipping malformed first row)...")
        csv_file = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\amaranthus dataset 1 from 6 -19  to 7-22.csv'
        
        df = pd.read_csv(csv_file, skiprows=[1])  # Skip row 1 (first data row after header)
        print(f"   ✓ Loaded {len(df):,} records")
        print()
        
        # Show first few rows to verify
        print("3. Sample data (first 3 rows):")
        for i in range(min(3, len(df))):
            row = df.iloc[i]
            print(f"\n   Row {i+1}:")
            print(f"      Timestamp: {row['timestamp']}")
            print(f"      Air Temp: {row['air_temp_c']}°C")
            print(f"      Humidity: {row['humidity_percent']}%")
            print(f"      Soil Moisture: {row['soil_moisture_raw']}")
        print()
        
        # Upload to Firestore
        print("4. Uploading to Firestore...")
        batch = db.batch()
        batch_count = 0
        uploaded_count = 0
        skipped_count = 0
        
        total_records = len(df)
        
        for idx, row in df.iterrows():
            try:
                # Parse timestamp
                timestamp_str = str(row['timestamp']).strip()
                
                if timestamp_str == 'nan' or timestamp_str == '' or not timestamp_str.startswith('202'):
                    skipped_count += 1
                    continue
                
                timestamp_dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                
                # Create sensor reading with correct data
                sensor_reading = {
                    'piId': 'pi_unit_001',
                    'cropProfileId': 'amaranthus',
                    'timestamp': timestamp_dt,
                    'readings': {
                        'air_temp_c': parse_float(row['air_temp_c']),
                        'humidity_percent': parse_float(row['humidity_percent']),
                        'water_soil_temp_c': parse_float(row['water_soil_temp_c']),
                        'air_pressure_hpa': parse_float(row['air_pressure_hpa']),
                        'soil_moisture_raw': parse_float(row['soil_moisture_raw']),
                        'soil_moisture_status': parse_string(row['soil_moisture_status']),
                        'light_level_raw': parse_float(row['light_level_raw']),
                        'light_level_status': parse_string(row['light_level_status']),
                        'rain_level_raw': parse_float(row['rain_level_raw']),
                        'rain_level_status': parse_string(row['rain_level_status']),
                        'co2_ppm': parse_float(row['co2_ppm']),
                        'nh3_ppm': parse_float(row['nh3_ppm']),
                        'voc_ppm': parse_float(row['voc_ppm']),
                        'nitrogen_mg_kg': parse_float(row['nitrogen_mg_kg']),
                        'nitrogen_status': parse_string(row['nitrogen_status']),
                        'phosphorus_mg_kg': parse_float(row['phosphorus_mg_kg']),
                        'phosphorus_status': parse_string(row['phosphorus_status']),
                        'potassium_mg_kg': parse_float(row['potassium_mg_kg']),
                        'potassium_status': parse_string(row['potassium_status'])
                    },
                    'source': 'historical_import_fixed',
                    'dataset_version': 'amaranthus_dataset_1_2025-06-19_to_2025-07-22',
                    'uploaded_at': firestore.SERVER_TIMESTAMP
                }
                
                # Create unique document ID
                doc_id = f"amaranthus_{timestamp_dt.strftime('%Y%m%d_%H%M%S')}_{idx}"
                doc_ref = db.collection('sensorReadings').document(doc_id)
                batch.set(doc_ref, sensor_reading)
                
                batch_count += 1
                uploaded_count += 1
                
                # Commit every 500
                if batch_count >= 500:
                    batch.commit()
                    progress = (uploaded_count / total_records) * 100
                    print(f"   ✓ {uploaded_count:,} / {total_records:,} ({progress:.1f}%)")
                    batch = db.batch()
                    batch_count = 0
                    time.sleep(0.3)
                    
            except Exception as e:
                if skipped_count < 5:
                    print(f"   ⚠ Row {idx}: {str(e)}")
                skipped_count += 1
                continue
        
        # Commit remaining
        if batch_count > 0:
            batch.commit()
            print(f"   ✓ {uploaded_count:,} / {total_records:,} (100.0%)")
        
        print()
        print("=" * 70)
        print("✅ UPLOAD COMPLETE!")
        print("=" * 70)
        print()
        print(f"📊 Results:")
        print(f"   Total: {total_records:,}")
        print(f"   ✓ Uploaded: {uploaded_count:,}")
        print(f"   ✗ Skipped: {skipped_count:,}")
        print()
        print("🔗 View data:")
        print("   https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp/data/~2FsensorReadings")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = upload_correct_data()
    sys.exit(0 if success else 1)
