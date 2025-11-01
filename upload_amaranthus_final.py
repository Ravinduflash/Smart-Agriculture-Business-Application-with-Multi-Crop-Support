"""
Upload Amaranthus data with DATA-AWARE column mapping
The CSV header is correct, but data values are shifted by one position

Usage:
    python upload_amaranthus_final.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime
import sys
import time

def upload_with_correct_mapping():
    print("=" * 70)
    print("Amaranthus Sensor Data Upload - DATA-CORRECTED VERSION")
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
        
        # Read CSV normally
        print("2. Reading CSV...")
        csv_file = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\amaranthus dataset 1 from 6 -19  to 7-22.csv'
        
        df = pd.read_csv(csv_file)
        print(f"   ✓ Loaded {len(df):,} records")
        print()
        
        # Show the column shift problem
        print("3. Detected column shift - applying correction...")
        sample = df.iloc[1]  # Row with actual data
        print(f"   Example (Row 2):")
        print(f"      CSV says soil_moisture_raw = {sample['soil_moisture_raw']}")
        print(f"      But it's actually soil_moisture_status!")
        print(f"      Real soil_moisture_raw is in: {sample['soil_moisture_status']}")
        print()
        
        # Upload with CORRECTED mapping
        print("4. Uploading to Firestore with corrected mapping...")
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
                
                # CORRECTED DATA MAPPING (accounting for the shift)
                # What CSV calls X is actually Y:
                sensor_reading = {
                    'piId': 'pi_unit_001',
                    'cropProfileId': 'amaranthus',
                    'timestamp': timestamp_dt,
                    'readings': {
                        # These are correct (no shift)
                        'air_temp_c': float(row['air_temp_c']) if pd.notna(row['air_temp_c']) and row['air_temp_c'] != 'N/A' else None,
                        'humidity_percent': float(row['humidity_percent']) if pd.notna(row['humidity_percent']) and row['humidity_percent'] != 'N/A' else None,
                        'water_soil_temp_c': float(row['water_soil_temp_c']) if pd.notna(row['water_soil_temp_c']) else None,
                        'air_pressure_hpa': float(row['air_pressure_hpa']) if pd.notna(row['air_pressure_hpa']) else None,
                        
                        # SHIFTED: CSV column name → actual data content
                        'soil_moisture_status': str(row['soil_moisture_raw']) if pd.notna(row['soil_moisture_raw']) and isinstance(row['soil_moisture_raw'], str) else None,  # soil_moisture_raw contains status!
                        'soil_moisture_raw': float(row['soil_moisture_status']) if pd.notna(row['soil_moisture_status']) else None,  # soil_moisture_status contains raw value!
                        
                        'light_level_status': str(row['light_level_raw']) if pd.notna(row['light_level_raw']) and isinstance(row['light_level_raw'], str) else None,
                        'light_level_raw': float(row['light_level_status']) if pd.notna(row['light_level_status']) else None,
                        
                        'rain_level_status': str(row['rain_level_raw']) if pd.notna(row['rain_level_raw']) and isinstance(row['rain_level_raw'], str) else None,
                        'rain_level_raw': float(row['rain_level_status']) if pd.notna(row['rain_level_status']) else None,
                        
                        # co2_ppm column actually contains rain_level_status!
                        'co2_ppm': float(row['nh3_ppm']) if pd.notna(row['nh3_ppm']) else None,  # Shifted!
                        'nh3_ppm': float(row['voc_ppm']) if pd.notna(row['voc_ppm']) else None,  # Shifted!
                        'voc_ppm': float(row['nitrogen_mg_kg']) if pd.notna(row['nitrogen_mg_kg']) else None,  # Shifted!
                        
                        'nitrogen_mg_kg': float(row['nitrogen_status']) if pd.notna(row['nitrogen_status']) and str(row['nitrogen_status']).replace('.','').isdigit() else None,
                        'nitrogen_status': str(row['phosphorus_mg_kg']) if pd.notna(row['phosphorus_mg_kg']) and isinstance(row['phosphorus_mg_kg'], str) else None,
                        
                        'phosphorus_mg_kg': float(row['phosphorus_status']) if pd.notna(row['phosphorus_status']) and str(row['phosphorus_status']).replace('.','').isdigit() else None,
                        'phosphorus_status': str(row['potassium_mg_kg']) if pd.notna(row['potassium_mg_kg']) and isinstance(row['potassium_mg_kg'], str) else None,
                        
                        'potassium_mg_kg': float(row['potassium_status']) if pd.notna(row['potassium_status']) and row['potassium_status'] != 'N/A' else None,
                        'potassium_status': None  # Last column is always N/A or missing
                    },
                    'source': 'historical_import_corrected',
                    'dataset_version': 'amaranthus_dataset_1_2025-06-19_to_2025-07-22',
                    'uploaded_at': firestore.SERVER_TIMESTAMP,
                    'note': 'Data corrected for column shift in original CSV'
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
                if skipped_count < 10:
                    print(f"   ⚠ Row {idx}: {str(e)[:80]}")
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
        print("📍 Data uploaded with corrected column mapping!")
        print("   The CSV had shifted columns, now fixed in Firestore.")
        print()
        print("🔗 View data:")
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
    success = upload_with_correct_mapping()
    print()
    sys.exit(0 if success else 1)
