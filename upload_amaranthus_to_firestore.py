"""
Upload Amaranthus Sensor Data CSV to Firestore
Fixed version that handles the actual CSV column structure

Usage:
    python upload_amaranthus_to_firestore.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime
import sys
import time

def parse_value(value):
    """Parse value handling N/A and converting to appropriate type"""
    if pd.isna(value) or value == 'N/A' or value == '' or value == 'nan':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return str(value)

def upload_sensor_data_to_firestore(csv_file_path):
    """
    Upload sensor data from CSV to Firestore
    """
    print("=" * 70)
    print("Uploading Amaranthus Sensor Data to Firestore")
    print("=" * 70)
    print()
    
    try:
        # Initialize Firebase Admin SDK
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
        
        # Read CSV file
        print("2. Reading CSV file...")
        # Read CSV and skip first row if it's malformed
        df = pd.read_csv(csv_file_path, skiprows=0, index_col=False)  # Don't use any column as index
        
        # Check if first row has valid timestamp
        first_timestamp = str(df.iloc[0]['timestamp'])
        if first_timestamp == 'nan' or not first_timestamp.startswith('202'):
            print("   ⚠️  First row appears malformed, re-reading with skiprows=1...")
            df = pd.read_csv(csv_file_path, skiprows=[1], index_col=False)  # Skip first data row, keep header
        
        # Reset index to ensure we have integer indices
        df = df.reset_index(drop=True)
        
        total_records = len(df)
        print(f"   ✓ Loaded {total_records:,} records from CSV")
        print(f"   ✓ Columns: {list(df.columns)}")
        print()
        
        # Show first row for debugging
        print("3. Sample data (first row):")
        first_row = df.iloc[0]
        for col in df.columns:
            print(f"   {col}: {first_row[col]}")
        print()
        
        # Uploading
        print("4. Uploading sensor readings to Firestore...")
        print("   (Processing in batches of 500)")
        print()
        
        batch = db.batch()
        batch_count = 0
        uploaded_count = 0
        skipped_count = 0
        error_details = []
        
        for idx, row in df.iterrows():
            try:
                # Parse timestamp
                timestamp_str = str(row['timestamp']).strip()
                
                if timestamp_str == 'nan' or timestamp_str == '' or timestamp_str == 'N/A':
                    skipped_count += 1
                    continue
                
                try:
                    timestamp_dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                except ValueError as e:
                    error_msg = f"Row {int(idx) + 1}: Invalid timestamp '{timestamp_str}'"
                    if len(error_details) < 5:
                        error_details.append(error_msg)
                    skipped_count += 1
                    continue
                
                # Create sensor reading document - matching actual CSV structure
                sensor_reading = {
                    'piId': 'pi_unit_001',
                    'cropProfileId': 'amaranthus',
                    'timestamp': timestamp_dt,
                    'readings': {
                        'air_temp_c': parse_value(row['air_temp_c']),
                        'humidity_percent': parse_value(row['humidity_percent']),
                        'water_soil_temp_c': parse_value(row['water_soil_temp_c']),
                        'air_pressure_hpa': parse_value(row['air_pressure_hpa']),
                        'soil_moisture_raw': parse_value(row['soil_moisture_raw']),
                        'soil_moisture_status': str(row['soil_moisture_status']) if pd.notna(row['soil_moisture_status']) else None,
                        'light_level_raw': parse_value(row['light_level_raw']),
                        'light_level_status': str(row['light_level_status']) if pd.notna(row['light_level_status']) else None,
                        'rain_level_raw': parse_value(row['rain_level_raw']),
                        'rain_level_status': str(row['rain_level_status']) if pd.notna(row['rain_level_status']) else None,
                        'co2_ppm': parse_value(row['co2_ppm']),
                        'nh3_ppm': parse_value(row['nh3_ppm']),
                        'voc_ppm': parse_value(row['voc_ppm']),
                        'nitrogen_mg_kg': parse_value(row['nitrogen_mg_kg']),
                        'nitrogen_status': str(row['nitrogen_status']) if pd.notna(row['nitrogen_status']) else None,
                        'phosphorus_mg_kg': parse_value(row['phosphorus_mg_kg']),
                        'phosphorus_status': str(row['phosphorus_status']) if pd.notna(row['phosphorus_status']) else None,
                        'potassium_mg_kg': parse_value(row['potassium_mg_kg']),
                        'potassium_status': str(row['potassium_status']) if pd.notna(row['potassium_status']) else None
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
                
                # Commit batch every 500 documents
                if batch_count >= 500:
                    batch.commit()
                    progress = (uploaded_count / total_records) * 100
                    print(f"   ✓ Batch committed: {uploaded_count:,} / {total_records:,} ({progress:.1f}%)")
                    batch = db.batch()
                    batch_count = 0
                    time.sleep(0.3)  # Small delay
                    
            except Exception as e:
                error_msg = f"Row {int(idx) + 1}: {str(e)}"
                if len(error_details) < 5:
                    error_details.append(error_msg)
                skipped_count += 1
                continue
        
        # Commit remaining documents
        if batch_count > 0:
            batch.commit()
            print(f"   ✓ Final batch committed: {uploaded_count:,} / {total_records:,}")
        
        print()
        print("=" * 70)
        print("✅ UPLOAD COMPLETE!")
        print("=" * 70)
        print()
        print(f"📊 Summary:")
        print(f"   Total records:     {total_records:,}")
        print(f"   ✓ Uploaded:        {uploaded_count:,}")
        print(f"   ✗ Skipped:         {skipped_count:,}")
        print(f"   Success rate:      {(uploaded_count/total_records*100):.1f}%")
        print()
        
        if error_details:
            print("⚠️  Sample errors (first 5):")
            for error in error_details:
                print(f"   {error}")
            print()
        
        print("📍 Data Location:")
        print(f"   Collection: sensorReadings")
        print(f"   Database:   sasapp")
        print(f"   Crop:       amaranthus")
        print(f"   Period:     2025-06-19 to 2025-07-22 (~33 days)")
        print()
        print("🔗 View in Firestore Console:")
        print("   https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp/data/~2FsensorReadings")
        print()
        
        return uploaded_count > 0
        
    except FileNotFoundError:
        print(f"\n❌ Error: CSV file not found")
        print(f"   Path: {csv_file_path}\n")
        return False
        
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}")
        print(f"   {str(e)}\n")
        
        import traceback
        traceback.print_exc()
        
        return False

if __name__ == "__main__":
    csv_file = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\amaranthus dataset 1 from 6 -19  to 7-22.csv'
    
    print()
    print("🌱 Amaranthus Sensor Data → Firestore Upload")
    print("=" * 70)
    print(f"📂 CSV File: {csv_file}")
    print(f"🎯 Target:   Firestore 'sasapp' → 'sensorReadings' collection")
    print("=" * 70)
    print()
    
    success = upload_sensor_data_to_firestore(csv_file)
    
    if success:
        print("✅ SUCCESS! Next steps:")
        print("   1. Verify data in Firestore Console")
        print("   2. Update Dashboard/IoT Sensors page to display historical data")
        print("   3. Use this data for ML model training")
        print()
    else:
        print("❌ FAILED! Check errors above and try again.")
        print()
    
    sys.exit(0 if success else 1)
