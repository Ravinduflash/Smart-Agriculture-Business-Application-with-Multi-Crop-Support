"""
Delete all sensor readings from Firestore and re-upload with correct column mapping

Usage:
    python cleanup_and_reupload_firestore.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime
import sys
import time

def delete_all_sensor_readings(db):
    """Delete all documents from sensorReadings collection"""
    print("🗑️  Deleting existing sensor readings...")
    
    batch = db.batch()
    batch_count = 0
    total_deleted = 0
    
    # Get all documents
    docs = db.collection('sensorReadings').stream()
    
    for doc in docs:
        batch.delete(doc.reference)
        batch_count += 1
        total_deleted += 1
        
        # Commit every 500 deletes
        if batch_count >= 500:
            batch.commit()
            print(f"   ✓ Deleted {total_deleted:,} documents...")
            batch = db.batch()
            batch_count = 0
            time.sleep(0.3)
    
    # Commit remaining
    if batch_count > 0:
        batch.commit()
    
    print(f"   ✓ Total deleted: {total_deleted:,} documents")
    print()
    return total_deleted

def upload_corrected_data(db, csv_file_path):
    """
    Upload sensor data with CORRECT column mapping
    """
    print("=" * 70)
    print("Uploading Amaranthus Data with CORRECTED Column Mapping")
    print("=" * 70)
    print()
    
    # Read CSV
    print("1. Reading CSV file...")
    df = pd.read_csv(csv_file_path)
    
    # The CSV has 20 columns but header line seems to have 21
    # Let's read it manually to see the exact structure
    print(f"   Detected {len(df.columns)} columns")
    print(f"   First row timestamp: {df.iloc[0]['timestamp']}")
    print()
    
    # Check actual data structure from row 2 (index 1)
    print("2. Analyzing column alignment...")
    row2 = df.iloc[1]  # Second data row (first might be malformed)
    
    print("   Detected values:")
    for i, (col, val) in enumerate(row2.items()):
        print(f"   Col {i}: {col:25s} = {val}")
    print()
    
    # CORRECT MAPPING based on the pattern we see:
    # Row 2: 2025-06-19 00:18:39, 26.65, 96.00, 26.69, 1010.15, Normal, 14985, Wet, 25394, Very Dark, 26177, Dry, 489.06, 367.74, 484.18, 0, Low, 0, Low, 0, Low
    
    print("3. Applying correct column mapping...")
    print()
    
    total_records = len(df)
    batch = db.batch()
    batch_count = 0
    uploaded_count = 0
    skipped_count = 0
    
    for idx, row in df.iterrows():
        try:
            # Parse timestamp
            timestamp_str = str(row['timestamp']).strip()
            
            if timestamp_str == 'nan' or timestamp_str == '' or not timestamp_str.startswith('202'):
                skipped_count += 1
                continue
            
            timestamp_dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
            
            # CORRECTED COLUMN MAPPING
            # Based on actual CSV structure where columns are shifted
            sensor_reading = {
                'piId': 'pi_unit_001',
                'cropProfileId': 'amaranthus',
                'timestamp': timestamp_dt,
                'readings': {
                    # Column mapping: CSV column → Actual data meaning
                    'air_temp_c': float(row['air_temp_c']) if pd.notna(row['air_temp_c']) else None,
                    'humidity_percent': float(row['humidity_percent']) if pd.notna(row['humidity_percent']) else None,
                    'water_soil_temp_c': float(row['water_soil_temp_c']) if pd.notna(row['water_soil_temp_c']) else None,
                    'air_pressure_hpa': float(row['air_pressure_hpa']) if pd.notna(row['air_pressure_hpa']) and str(row['air_pressure_hpa']).replace('.','').isdigit() else None,
                    'soil_moisture_status': str(row['soil_moisture_raw']) if pd.notna(row['soil_moisture_raw']) and isinstance(row['soil_moisture_raw'], str) else None,
                    'soil_moisture_raw': float(row['soil_moisture_status']) if pd.notna(row['soil_moisture_status']) and str(row['soil_moisture_status']).replace('.','').isdigit() else None,
                    'light_level_status': str(row['light_level_raw']) if pd.notna(row['light_level_raw']) and isinstance(row['light_level_raw'], str) else None,
                    'light_level_raw': float(row['light_level_status']) if pd.notna(row['light_level_status']) and str(row['light_level_status']).replace('.','').isdigit() else None,
                    'rain_level_status': str(row['rain_level_raw']) if pd.notna(row['rain_level_raw']) and isinstance(row['rain_level_raw'], str) else None,
                    'rain_level_raw': float(row['rain_level_status']) if pd.notna(row['rain_level_status']) and str(row['rain_level_status']).replace('.','').isdigit() else None,
                    'co2_ppm': float(row['co2_ppm']) if pd.notna(row['co2_ppm']) and str(row['co2_ppm']) != 'Dry' else None,
                    'nh3_ppm': float(row['nh3_ppm']) if pd.notna(row['nh3_ppm']) else None,
                    'voc_ppm': float(row['voc_ppm']) if pd.notna(row['voc_ppm']) else None,
                    'nitrogen_mg_kg': float(row['nitrogen_mg_kg']) if pd.notna(row['nitrogen_mg_kg']) else None,
                    'nitrogen_status': str(row['nitrogen_status']) if pd.notna(row['nitrogen_status']) and isinstance(row['nitrogen_status'], str) else None,
                    'phosphorus_mg_kg': float(row['phosphorus_mg_kg']) if pd.notna(row['phosphorus_mg_kg']) else None,
                    'phosphorus_status': str(row['phosphorus_status']) if pd.notna(row['phosphorus_status']) and isinstance(row['phosphorus_status'], str) else None,
                    'potassium_mg_kg': float(row['potassium_mg_kg']) if pd.notna(row['potassium_mg_kg']) else None,
                    'potassium_status': str(row['potassium_status']) if pd.notna(row['potassium_status']) and isinstance(row['potassium_status'], str) else None
                },
                'source': 'historical_import_corrected',
                'dataset_version': 'amaranthus_dataset_1_2025-06-19_to_2025-07-22_v2',
                'uploaded_at': firestore.SERVER_TIMESTAMP
            }
            
            # Create unique document ID
            doc_id = f"amaranthus_{timestamp_dt.strftime('%Y%m%d_%H%M%S')}_{idx}"
            doc_ref = db.collection('sensorReadings').document(doc_id)
            batch.set(doc_ref, sensor_reading)
            
            batch_count += 1
            uploaded_count += 1
            
            # Commit batch every 500
            if batch_count >= 500:
                batch.commit()
                progress = (uploaded_count / total_records) * 100
                print(f"   ✓ Uploaded: {uploaded_count:,} / {total_records:,} ({progress:.1f}%)")
                batch = db.batch()
                batch_count = 0
                time.sleep(0.3)
                
        except Exception as e:
            if skipped_count < 5:
                print(f"   ⚠ Row {idx + 1}: {str(e)}")
            skipped_count += 1
            continue
    
    # Commit remaining
    if batch_count > 0:
        batch.commit()
        print(f"   ✓ Final batch: {uploaded_count:,} / {total_records:,}")
    
    print()
    print("=" * 70)
    print("✅ RE-UPLOAD COMPLETE!")
    print("=" * 70)
    print()
    print(f"📊 Summary:")
    print(f"   Total records:     {total_records:,}")
    print(f"   ✓ Uploaded:        {uploaded_count:,}")
    print(f"   ✗ Skipped:         {skipped_count:,}")
    print(f"   Success rate:      {(uploaded_count/total_records*100):.1f}%")
    print()
    
    return uploaded_count

def main():
    print()
    print("🔄 Cleanup and Re-upload Amaranthus Sensor Data")
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
        
        # Step 1: Delete existing data
        deleted_count = delete_all_sensor_readings(db)
        
        # Step 2: Re-upload with correct mapping
        csv_file = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\amaranthus dataset 1 from 6 -19  to 7-22.csv'
        uploaded_count = upload_corrected_data(db, csv_file)
        
        print("🔗 View in Firestore Console:")
        print("   https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp/data/~2FsensorReadings")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}")
        print(f"   {str(e)}\n")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
