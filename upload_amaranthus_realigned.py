"""
Upload Amaranthus CSV to Firestore with CORRECT column mapping
Based on all_sensors_script_new.py CSV structure

CSV Column Order from script:
'timestamp', 'air_temp_c', 'humidity_percent', 'water_soil_temp_c', 
'air_pressure_hpa', 'air_pressure_status', 
'soil_moisture_raw', 'soil_moisture_status', 
'light_level_raw', 'light_level_status',
'rain_level_raw', 'rain_level_status', 
'co2_ppm', 'nh3_ppm', 'voc_ppm', 
'nitrogen_mg_kg', 'nitrogen_status', 
'phosphorus_mg_kg', 'phosphorus_status', 
'potassium_mg_kg', 'potassium_status'

But the actual CSV file is MISSING 'air_pressure_status' column!

Usage:
    python upload_amaranthus_realigned.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime
import sys
import time

def safe_float(value):
    """Convert to float, handling N/A and invalid values"""
    if pd.isna(value) or value == 'N/A' or value == '':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def safe_string(value):
    """Convert to string, handling N/A and invalid values"""
    if pd.isna(value) or value == 'N/A' or value == '' or value == 'nan':
        return None
    return str(value)

def upload_amaranthus_data():
    print("=" * 70)
    print("Amaranthus CSV Upload - Column Realignment Fix")
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
        
        # Read CSV
        print("2. Reading CSV file...")
        csv_file = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\amaranthus dataset 1 from 6 -19  to 7-22.csv'
        
        # The CSV is MISSING air_pressure_status column, so columns are:
        # timestamp, air_temp_c, humidity_percent, water_soil_temp_c, air_pressure_hpa,
        # soil_moisture_raw, soil_moisture_status, light_level_raw, light_level_status,
        # rain_level_raw, rain_level_status, co2_ppm, nh3_ppm, voc_ppm,
        # nitrogen_mg_kg, nitrogen_status, phosphorus_mg_kg, phosphorus_status,
        # potassium_mg_kg, potassium_status
        
        df = pd.read_csv(csv_file)
        print(f"   ✓ Loaded {len(df):,} records")
        print(f"   ✓ Columns found: {len(df.columns)}")
        print()
        
        # Show actual column names
        print("3. CSV Column Analysis:")
        for i, col in enumerate(df.columns):
            print(f"   Col {i:2d}: {col}")
        print()
        
        # Show first valid row
        print("4. Sample data (first valid row):")
        valid_row_idx = None
        for i in range(min(5, len(df))):
            timestamp_val = str(df.iloc[i]['timestamp'])
            if timestamp_val.startswith('202'):
                valid_row_idx = i
                break
        
        if valid_row_idx is not None:
            sample = df.iloc[valid_row_idx]
            print(f"   Row {valid_row_idx + 1}:")
            print(f"      Timestamp: {sample['timestamp']}")
            print(f"      Air Temp: {sample['air_temp_c']}")
            print(f"      Humidity: {sample['humidity_percent']}")
            print(f"      Air Pressure: {sample['air_pressure_hpa']}")
            print(f"      Soil Moisture Raw: {sample['soil_moisture_raw']}")
            print(f"      Soil Moisture Status (next col): {sample['soil_moisture_status']}")
        print()
        
        # Upload to Firestore
        print("5. Uploading to Firestore...")
        batch = db.batch()
        batch_count = 0
        uploaded_count = 0
        skipped_count = 0
        error_samples = []
        
        total_records = len(df)
        
        for idx, row in df.iterrows():
            try:
                # Parse timestamp
                timestamp_str = str(row['timestamp']).strip()
                
                # Skip invalid timestamps
                if timestamp_str == 'nan' or timestamp_str == '' or not timestamp_str.startswith('202'):
                    skipped_count += 1
                    continue
                
                timestamp_dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                
                # Create sensor reading with CORRECT column mapping
                sensor_reading = {
                    'piId': 'pi_unit_001',
                    'cropProfileId': 'amaranthus',
                    'timestamp': timestamp_dt,
                    'readings': {
                        'air_temp_c': safe_float(row['air_temp_c']),
                        'humidity_percent': safe_float(row['humidity_percent']),
                        'water_soil_temp_c': safe_float(row['water_soil_temp_c']),
                        'air_pressure_hpa': safe_float(row['air_pressure_hpa']),
                        'soil_moisture_raw': safe_float(row['soil_moisture_raw']),
                        'soil_moisture_status': safe_string(row['soil_moisture_status']),
                        'light_level_raw': safe_float(row['light_level_raw']),
                        'light_level_status': safe_string(row['light_level_status']),
                        'rain_level_raw': safe_float(row['rain_level_raw']),
                        'rain_level_status': safe_string(row['rain_level_status']),
                        'co2_ppm': safe_float(row['co2_ppm']),
                        'nh3_ppm': safe_float(row['nh3_ppm']),
                        'voc_ppm': safe_float(row['voc_ppm']),
                        'nitrogen_mg_kg': safe_float(row['nitrogen_mg_kg']),
                        'nitrogen_status': safe_string(row['nitrogen_status']),
                        'phosphorus_mg_kg': safe_float(row['phosphorus_mg_kg']),
                        'phosphorus_status': safe_string(row['phosphorus_status']),
                        'potassium_mg_kg': safe_float(row['potassium_mg_kg']),
                        'potassium_status': safe_string(row['potassium_status'])
                    },
                    'source': 'historical_import',
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
                if len(error_samples) < 10:
                    error_samples.append(f"Row {idx + 1}: {str(e)[:100]}")
                skipped_count += 1
                continue
        
        # Commit remaining
        if batch_count > 0:
            batch.commit()
            print(f"   ✓ {uploaded_count:,} / {total_records:,} (Final batch)")
        
        print()
        print("=" * 70)
        print("✅ UPLOAD COMPLETE!")
        print("=" * 70)
        print()
        print(f"📊 Results:")
        print(f"   Total records: {total_records:,}")
        print(f"   ✓ Uploaded: {uploaded_count:,}")
        print(f"   ✗ Skipped: {skipped_count:,}")
        print(f"   Success rate: {(uploaded_count/total_records*100):.1f}%")
        print()
        
        if error_samples:
            print("⚠️  Sample errors:")
            for error in error_samples:
                print(f"   {error}")
            print()
        
        print("📍 Data Location:")
        print(f"   Collection: sensorReadings")
        print(f"   Crop: amaranthus")
        print(f"   Period: 2025-06-19 to 2025-07-22")
        print()
        print("🔗 View in Firestore:")
        print("   https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp/data/~2FsensorReadings")
        print()
        
        return uploaded_count > 0
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print()
    success = upload_amaranthus_data()
    
    if success:
        print("✅ SUCCESS!")
        print("\nNext steps:")
        print("1. Verify data in Firestore Console")
        print("2. Check a few documents to ensure columns are correct")
        print("3. Update Dashboard to display this historical data")
        print()
    else:
        print("❌ FAILED!")
        print()
    
    sys.exit(0 if success else 1)
