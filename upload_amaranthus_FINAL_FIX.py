"""
Final upload - Simply skip the first TWO rows (header + bad first data row)
Then manually set the correct header

Usage:
    python upload_amaranthus_FINAL_FIX.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime
import sys
import time

def upload_data():
    print("=" * 70)
    print("Amaranthus Upload - FINAL FIX")
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
        
        # Read CSV - skip rows 0 AND 1 (header and bad first data row)
        # Then provide the correct header manually
        print("2. Reading CSV (skipping malformed rows)...")
        csv_file = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\amaranthus dataset 1 from 6 -19  to 7-22.csv'
        
        # Column names from the header
        columns = ['timestamp', 'air_temp_c', 'humidity_percent', 'water_soil_temp_c', 
                  'air_pressure_hpa', 'soil_moisture_raw', 'soil_moisture_status', 
                  'light_level_raw', 'light_level_status', 'rain_level_raw', 
                  'rain_level_status', 'co2_ppm', 'nh3_ppm', 'voc_ppm', 
                  'nitrogen_mg_kg', 'nitrogen_status', 'phosphorus_mg_kg', 
                  'phosphorus_status', 'potassium_mg_kg', 'potassium_status']
        
        # Skip first 2 rows (0=header, 1=bad data), then use manual header
        df = pd.read_csv(csv_file, skiprows=2, names=columns, header=None)
        
        print(f"   ✓ Loaded {len(df):,} records")
        print()
        
        # Show first row to verify
        print("3. Verifying data (first row):")
        first = df.iloc[0]
        print(f"   Timestamp: {first['timestamp']}")
        print(f"   Air Temp: {first['air_temp_c']}°C")
        print(f"   Humidity: {first['humidity_percent']}%")
        print(f"   Soil Moisture Raw: {first['soil_moisture_raw']}")
        print(f"   Soil Moisture Status: {first['soil_moisture_status']}")
        print()
        
        # Upload
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
                
                if not timestamp_str.startswith('202'):
                    skipped_count += 1
                    continue
                
                timestamp_dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                
                # Parse values
                def parse_num(val):
                    if pd.isna(val) or val == 'N/A' or val == '':
                        return None
                    try:
                        return float(val)
                    except:
                        return None
                
                def parse_str(val):
                    if pd.isna(val) or val == 'N/A' or val == '':
                        return None
                    return str(val)
                
                # Create reading
                sensor_reading = {
                    'piId': 'pi_unit_001',
                    'cropProfileId': 'amaranthus',
                    'timestamp': timestamp_dt,
                    'readings': {
                        'air_temp_c': parse_num(row['air_temp_c']),
                        'humidity_percent': parse_num(row['humidity_percent']),
                        'water_soil_temp_c': parse_num(row['water_soil_temp_c']),
                        'air_pressure_hpa': parse_num(row['air_pressure_hpa']),
                        'soil_moisture_raw': parse_num(row['soil_moisture_raw']),
                        'soil_moisture_status': parse_str(row['soil_moisture_status']),
                        'light_level_raw': parse_num(row['light_level_raw']),
                        'light_level_status': parse_str(row['light_level_status']),
                        'rain_level_raw': parse_num(row['rain_level_raw']),
                        'rain_level_status': parse_str(row['rain_level_status']),
                        'co2_ppm': parse_num(row['co2_ppm']),
                        'nh3_ppm': parse_num(row['nh3_ppm']),
                        'voc_ppm': parse_num(row['voc_ppm']),
                        'nitrogen_mg_kg': parse_num(row['nitrogen_mg_kg']),
                        'nitrogen_status': parse_str(row['nitrogen_status']),
                        'phosphorus_mg_kg': parse_num(row['phosphorus_mg_kg']),
                        'phosphorus_status': parse_str(row['phosphorus_status']),
                        'potassium_mg_kg': parse_num(row['potassium_mg_kg']),
                        'potassium_status': parse_str(row['potassium_status'])
                    },
                    'source': 'historical_import',
                    'dataset_version': 'amaranthus_v1_2025-06-19_to_2025-07-22',
                    'uploaded_at': firestore.SERVER_TIMESTAMP
                }
                
                # Create doc
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
                    time.sleep(0.2)
                    
            except Exception as e:
                if skipped_count < 5:
                    print(f"   ⚠ Row {idx}: {str(e)[:60]}")
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
        print(f"📊 Summary:")
        print(f"   Total: {total_records:,}")
        print(f"   ✓ Uploaded: {uploaded_count:,}")
        print(f"   ✗ Skipped: {skipped_count:,}")
        print(f"   Success: {(uploaded_count/total_records*100):.1f}%")
        print()
        print("🔗 View: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp/data/~2FsensorReadings")
        print()
        
        return uploaded_count > 0
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = upload_data()
    sys.exit(0 if success else 1)
