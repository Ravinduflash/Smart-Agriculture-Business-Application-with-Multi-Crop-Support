"""
Upload Amaranthus Sensor Data CSV to Firestore
Uploads historical sensor readings to the sensorReadings collection

Usage:
    python upload_sensor_data_to_firestore.py
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
        # Try to convert to float
        return float(value)
    except (ValueError, TypeError):
        # If not a number, return as string
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
        
        # Check if already initialized
        try:
            firebase_admin.get_app()
            print("   ✓ Firebase already initialized")
        except ValueError:
            firebase_admin.initialize_app(cred)
            print("   ✓ Firebase initialized successfully")
        
        # Connect to Firestore with specific database ID
        db = firestore.client(database_id='sasapp')
        print("   ✓ Connected to Firestore database: sasapp")
        print()
        
        # Read CSV file
        print("2. Reading CSV file...")
        df = pd.read_csv(csv_file_path)
        df = df.reset_index(drop=True)  # Reset index to integers
        total_records = len(df)
        
        # Get date range safely
        try:
            first_timestamp = str(df['timestamp'].iloc[0])
            last_timestamp = str(df['timestamp'].iloc[-1])
            print(f"   ✓ Loaded {total_records:,} records from CSV")
            print(f"   ✓ Date range: {first_timestamp} to {last_timestamp}")
        except Exception as e:
            print(f"   ✓ Loaded {total_records:,} records from CSV")
            print(f"   ⚠ Could not parse date range: {e}")
        print()
        
        # Prepare data for Firestore
        print("3. Uploading sensor readings to Firestore...")
        print("   (This may take a few minutes for 8,440 records)")
        print()
        
        batch = db.batch()
        batch_count = 0
        uploaded_count = 0
        skipped_count = 0
        
        for idx, row in df.iterrows():
            try:
                # Parse timestamp - handle various formats
                timestamp_str = str(row['timestamp']).strip()
                
                # Skip if timestamp is invalid
                if timestamp_str == 'nan' or timestamp_str == '' or timestamp_str == 'N/A':
                    skipped_count += 1
                    continue
                
                try:
                    timestamp_dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    # Try alternative format
                    try:
                        timestamp_dt = pd.to_datetime(timestamp_str)
                    except:
                        record_num = int(idx) + 1
                        print(f"   ⚠ Skipped record {record_num}: Invalid timestamp '{timestamp_str}'")
                        skipped_count += 1
                        continue
                
                # Create sensor reading document
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
                
                # Create document with timestamp-based ID for uniqueness
                doc_id = f"amaranthus_{timestamp_dt.strftime('%Y%m%d_%H%M%S')}_{idx}"
                doc_ref = db.collection('sensorReadings').document(doc_id)
                batch.set(doc_ref, sensor_reading)
                
                batch_count += 1
                uploaded_count += 1
                
                # Commit batch every 500 documents (Firestore limit)
                if batch_count >= 500:
                    batch.commit()
                    print(f"   ✓ Uploaded batch: {uploaded_count:,} / {total_records:,} records ({(uploaded_count/total_records*100):.1f}%)")
                    batch = db.batch()  # Start new batch
                    batch_count = 0
                    time.sleep(0.5)  # Small delay to avoid rate limits
                    
            except Exception as e:
                record_num = int(idx) + 1
                print(f"   ⚠ Skipped record {record_num}: {str(e)}")
                if idx < 5:  # Show details for first few errors
                    print(f"      Row data: {dict(row)}")
                skipped_count += 1
                continue
        
        # Commit remaining documents
        if batch_count > 0:
            batch.commit()
            print(f"   ✓ Uploaded final batch: {uploaded_count:,} / {total_records:,} records")
        
        print()
        print("=" * 70)
        print("[UPLOAD COMPLETE!]")
        print("=" * 70)
        print()
        print(f"Total records processed: {total_records:,}")
        print(f"Successfully uploaded:   {uploaded_count:,}")
        print(f"Skipped (errors):        {skipped_count:,}")
        print()
        print("[Data Summary]:")
        print(f"   * Collection: sensorReadings")
        print(f"   * Crop: amaranthus")
        try:
            first_ts = str(df['timestamp'].iloc[0])
            last_ts = str(df['timestamp'].iloc[-1])
            print(f"   * Date range: {first_ts} to {last_ts}")
        except:
            print(f"   * Date range: See Firestore Console")
        print(f"   * Duration: ~33 days")
        print()
        print("[View data in Firestore]:")
        print("   https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp/data/~2FsensorReadings")
        print()
        
        return True
        
    except FileNotFoundError:
        print(f"\n❌ Error: CSV file not found at: {csv_file_path}")
        print("   Please check the file path and try again.\n")
        return False
        
    except Exception as e:
        print(f"\n[ERROR]: {type(e).__name__}")
        print(f"   {str(e)}")
        
        # Print full traceback for debugging
        import traceback
        print("\nFull Error Details:")
        traceback.print_exc()
        print()
        
        if "SERVICE_DISABLED" in str(e):
            print("🔧 Fix:")
            print("   1. Enable Cloud Firestore API")
            print("   2. Wait 1-2 minutes")
            print("   3. Run this script again\n")
        elif "Permission denied" in str(e):
            print("🔧 Fix:")
            print("   1. Check service account JSON file path")
            print("   2. Verify Firestore is enabled")
            print("   3. Check security rules allow service account writes\n")
        
        return False

if __name__ == "__main__":
    csv_file = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\amaranthus dataset 1 from 6 -19  to 7-22.csv'
    
    print("\n[CSV File]:", csv_file)
    print("[Target]: Firestore database 'sasapp' -> collection 'sensorReadings'")
    print("\n[Starting upload...]\n")
    
    success = upload_sensor_data_to_firestore(csv_file)
    
    if success:
        print("[SUCCESS] Next steps:")
        print("1. Check Firestore Console to verify data")
        print("2. View data in your React app (Dashboard/IoT Sensors page)")
        print("3. Use this data for ML model training")
        print()
    
    sys.exit(0 if success else 1)
