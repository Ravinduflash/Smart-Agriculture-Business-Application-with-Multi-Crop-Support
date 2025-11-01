"""
Upload Amaranthus Sensor Data CSV to Firestore (Fixed Column Mapping)
Handles misaligned columns in the CSV file

Usage:
    python upload_amaranthus_fixed.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime
import sys
import time

def parse_value(value):
    """Parse value handling N/A and converting to appropriate type"""
    if pd.isna(value) or value == 'N/A' or value == '':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return str(value)

def upload_sensor_data_to_firestore(csv_file_path):
    """Upload sensor data from CSV to Firestore with correct column mapping"""
    print("=" * 70)
    print("Uploading Amaranthus Sensor Data to Firestore")
    print("=" * 70)
    print()
    
    try:
        # Initialize Firebase
        print("1. Initializing Firebase Admin SDK...")
        cred = credentials.Certificate(r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\Credientals\gen-lang-client-0092156800-3f84a3882b65.json')
        
        try:
            firebase_admin.get_app()
            print("   ✓ Firebase already initialized")
        except ValueError:
            firebase_admin.initialize_app(cred)
            print("   ✓ Firebase initialized successfully")
        
        db = firestore.client(database_id='sasapp')
        print("   ✓ Connected to Firestore database: sasapp")
        print()
        
        # Read CSV file with correct column interpretation
        print("2. Reading CSV file...")
        df = pd.read_csv(csv_file_path)
        df = df.reset_index(drop=True)
        total_records = len(df)
        
        print(f"   ✓ Loaded {total_records:,} records from CSV")
        print(f"   ✓ Columns: {list(df.columns)}")
        
        # Analyze first valid row
        first_valid_row = df.iloc[1]  # Skip potential header row
        print(f"\n   Sample row 1:")
        print(f"     timestamp: {first_valid_row['timestamp']}")
        print(f"     air_temp_c: {first_valid_row['air_temp_c']}")
        print(f"     humidity_percent: {first_valid_row['humidity_percent']}")
        print()
        
        # Prepare data for Firestore
        print("3. Uploading sensor readings to Firestore...")
        print(f"   (Processing {total_records:,} records)")
        print()
        
        batch = db.batch()
        batch_count = 0
        uploaded_count = 0
        skipped_count = 0
        
        for idx, row in df.iterrows():
            try:
                # Get timestamp from first column
                timestamp_val = row['timestamp']
                
                # Skip header rows or invalid timestamps
                if pd.isna(timestamp_val) or timestamp_val == 'timestamp':
                    skipped_count += 1
                    continue
                
                timestamp_str = str(timestamp_val).strip()
                
                # Parse timestamp
                try:
                    timestamp_dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    try:
                        timestamp_dt = pd.to_datetime(timestamp_str)
                    except:
                        skipped_count += 1
                        if skipped_count <= 5:  # Show first few errors
                            print(f"   ⚠ Skipped row {idx}: Invalid timestamp '{timestamp_str}'")
                        continue
                
                # Create sensor reading document with correct field mapping
                sensor_reading = {
                    'piId': 'pi_unit_001',
                    'cropProfileId': 'amaranthus',
                    'timestamp': timestamp_dt,
                    'readings': {
                        'air_temp_c': parse_value(row.get('air_temp_c')),
                        'humidity_percent': parse_value(row.get('humidity_percent')),
                        'water_soil_temp_c': parse_value(row.get('water_soil_temp_c')),
                        'air_pressure_hpa': parse_value(row.get('air_pressure_hpa')),
                        'soil_moisture_raw': parse_value(row.get('soil_moisture_raw')),
                        'soil_moisture_status': str(row.get('soil_moisture_status')) if pd.notna(row.get('soil_moisture_status')) else None,
                        'light_level_raw': parse_value(row.get('light_level_raw')),
                        'light_level_status': str(row.get('light_level_status')) if pd.notna(row.get('light_level_status')) else None,
                        'rain_level_raw': parse_value(row.get('rain_level_raw')),
                        'rain_level_status': str(row.get('rain_level_status')) if pd.notna(row.get('rain_level_status')) else None,
                        'co2_ppm': parse_value(row.get('co2_ppm')),
                        'nh3_ppm': parse_value(row.get('nh3_ppm')),
                        'voc_ppm': parse_value(row.get('voc_ppm')),
                        'nitrogen_mg_kg': parse_value(row.get('nitrogen_mg_kg')),
                        'nitrogen_status': str(row.get('nitrogen_status')) if pd.notna(row.get('nitrogen_status')) else None,
                        'phosphorus_mg_kg': parse_value(row.get('phosphorus_mg_kg')),
                        'phosphorus_status': str(row.get('phosphorus_status')) if pd.notna(row.get('phosphorus_status')) else None,
                        'potassium_mg_kg': parse_value(row.get('potassium_mg_kg')),
                        'potassium_status': str(row.get('potassium_status')) if pd.notna(row.get('potassium_status')) else None
                    },
                    'source': 'historical_import',
                    'dataset_version': 'amaranthus_dataset_1_2025-06-19_to_2025-07-22'
                }
                
                # Create document with unique ID
                doc_id = f"amaranthus_{timestamp_dt.strftime('%Y%m%d_%H%M%S')}_{idx}"
                doc_ref = db.collection('sensorReadings').document(doc_id)
                batch.set(doc_ref, sensor_reading)
                
                batch_count += 1
                uploaded_count += 1
                
                # Commit batch every 500 documents
                if batch_count >= 500:
                    batch.commit()
                    progress = (uploaded_count / total_records) * 100
                    print(f"   ✓ Progress: {uploaded_count:,} / {total_records:,} records ({progress:.1f}%)")
                    batch = db.batch()
                    batch_count = 0
                    time.sleep(0.5)  # Small delay
                    
            except Exception as e:
                error_msg = str(e)[:100]  # Truncate long error messages
                if skipped_count < 10:  # Show first 10 errors
                    record_num = int(idx) + 1
                    print(f"   ⚠ Error at row {record_num}: {error_msg}")
                skipped_count += 1
                continue
        
        # Commit remaining documents
        if batch_count > 0:
            batch.commit()
            print(f"   ✓ Final batch uploaded: {uploaded_count:,} / {total_records:,} records")
        
        print()
        print("=" * 70)
        print("✅ UPLOAD COMPLETE!")
        print("=" * 70)
        print()
        print(f"📊 Summary:")
        print(f"   Total records processed: {total_records:,}")
        print(f"   ✅ Successfully uploaded:   {uploaded_count:,}")
        print(f"   ⚠️  Skipped (errors):        {skipped_count:,}")
        print(f"   📈 Success rate:            {(uploaded_count/total_records*100):.1f}%")
        print()
        print(f"📁 Firestore Collection: sensorReadings")
        print(f"🌱 Crop: amaranthus")
        print(f"📅 Date range: 2025-06-19 to 2025-07-22 (~33 days)")
        print()
        print("🔗 View data in Firestore Console:")
        print("   https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp/data/~2FsensorReadings")
        print()
        
        return True
        
    except FileNotFoundError:
        print(f"\n❌ Error: CSV file not found at: {csv_file_path}")
        return False
        
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}")
        print(f"   {str(e)}")
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    csv_file = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\amaranthus dataset 1 from 6 -19  to 7-22.csv'
    
    print("\n📂 CSV File:", csv_file)
    print("🎯 Target: Firestore database 'sasapp' -> collection 'sensorReadings'")
    print("\n🚀 Starting upload...\n")
    
    success = upload_sensor_data_to_firestore(csv_file)
    
    if success:
        print("✅ SUCCESS! Data uploaded to Firestore")
        print("\n📋 Next steps:")
        print("1. Verify data in Firestore Console")
        print("2. View data in your React app (Dashboard/IoT Sensors)")
        print("3. Use this data for ML model training")
        print()
    
    sys.exit(0 if success else 1)
