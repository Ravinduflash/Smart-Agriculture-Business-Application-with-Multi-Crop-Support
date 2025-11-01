"""
Complete Guide: Upload Amaranthus CSV to Firebase Realtime Database
Author: Smart Agriculture System
Date: 2025-10-29

Prerequisites:
1. Install dependencies: pip install firebase-admin pandas
2. Download serviceAccountKey.json from Firebase Console
3. Update CREDENTIALS_PATH and DATABASE_URL below
"""

import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AmaranthusDataUploader:
    """
    Handles uploading Amaranthus CSV data to Firebase Realtime Database
    """
    
    def __init__(self, credentials_path, database_url):
        """
        Initialize Firebase connection
        
        Args:
            credentials_path: Path to serviceAccountKey.json
            database_url: Firebase Realtime Database URL
        """
        try:
            cred = credentials.Certificate(credentials_path)
            firebase_admin.initialize_app(cred, {
                'databaseURL': database_url
            })
            logger.info("✓ Firebase initialized successfully")
        except Exception as e:
            logger.error(f"✗ Firebase initialization failed: {e}")
            raise

    def upload_csv_to_realtime_db(self, csv_file_path, db_path='crops/amaranthus'):
        """
        Upload CSV data to Firebase Realtime Database
        
        Args:
            csv_file_path: Path to the CSV file
            db_path: Firebase database path (default: crops/amaranthus)
        
        Returns:
            bool: True if upload successful, False otherwise
        """
        try:
            # Read CSV file
            logger.info(f"Reading CSV file: {csv_file_path}")
            df = pd.read_csv(csv_file_path)
            
            # Replace all NaN/null values with None for JSON compatibility
            df = df.fillna('null')  # Replace NaN with string 'null'
            df = df.replace('null', None)  # Then replace string 'null' with Python None
            
            # Data validation
            logger.info(f"Total records: {len(df)}")
            logger.info(f"Columns: {df.columns.tolist()}")
            
            # Convert to dictionary
            data = df.to_dict('records')
            
            # Prepare upload data with metadata
            upload_payload = {
                'metadata': {
                    'crop_name': 'Amaranthus',
                    'date_range': '6-19 to 7-22',
                    'file_name': csv_file_path,
                    'upload_timestamp': datetime.utcnow().isoformat(),
                    'total_records': len(data),
                    'columns': df.columns.tolist(),
                    'data_types': df.dtypes.astype(str).to_dict()
                },
                'sensor_data': data
            }
            
            # Upload to Firebase
            ref = db.reference(db_path)
            ref.set(upload_payload)
            
            logger.info(f"✓ Successfully uploaded {len(data)} records to {db_path}")
            return True
            
        except FileNotFoundError:
            logger.error(f"✗ CSV file not found: {csv_file_path}")
            return False
        except Exception as e:
            logger.error(f"✗ Upload failed: {e}")
            return False

    def upload_with_batch_processing(self, csv_file_path, batch_size=100, db_path='crops/amaranthus'):
        """
        Upload CSV data in batches (useful for large files)
        
        Args:
            csv_file_path: Path to the CSV file
            batch_size: Number of records per batch (default: 100)
            db_path: Firebase database path (default: crops/amaranthus)
        
        Returns:
            bool: True if upload successful, False otherwise
        """
        try:
            df = pd.read_csv(csv_file_path)
            total_records = len(df)
            
            # Replace all NaN/null values with None and convert to JSON-safe format
            df = df.fillna('null')  # Replace NaN with string 'null'
            df = df.replace('null', None)  # Then replace string 'null' with Python None
            
            # Upload metadata first
            ref = db.reference(db_path)
            ref.update({
                'metadata': {
                    'crop_name': 'Amaranthus',
                    'date_range': '6-19 to 7-22',
                    'file_name': csv_file_path,
                    'upload_timestamp': datetime.utcnow().isoformat(),
                    'total_records': total_records,
                    'upload_status': 'in_progress'
                }
            })
            
            # Upload data in batches
            for i in range(0, total_records, batch_size):
                batch = df.iloc[i:i+batch_size]
                batch_data = batch.to_dict('records')
                batch_path = f"{db_path}/sensor_data/batch_{i//batch_size}"
                
                db.reference(batch_path).set(batch_data)
                logger.info(f"✓ Uploaded batch {i//batch_size + 1} ({len(batch_data)} records)")
            
            # Update status
            ref.update({'metadata/upload_status': 'completed'})
            logger.info(f"✓ All {total_records} records uploaded successfully!")
            return True
            
        except Exception as e:
            logger.error(f"✗ Batch upload failed: {e}")
            return False

    def verify_upload(self, db_path='crops/amaranthus'):
        """
        Verify data was uploaded correctly
        
        Args:
            db_path: Firebase database path to verify
        """
        try:
            ref = db.reference(db_path)
            data = ref.get()
            
            if data:
                logger.info("✓ Data verification successful")
                logger.info(f"Metadata: {data.get('metadata', {})}")
                return True
            else:
                logger.warning("✗ No data found at specified path")
                return False
                
        except Exception as e:
            logger.error(f"✗ Verification failed: {e}")
            return False


def simple_upload_example():
    """
    Simple upload example - Use this for quick uploads
    """
    import firebase_admin
    from firebase_admin import credentials, db
    import pandas as pd
    from datetime import datetime

    # Initialize Firebase (download your serviceAccountKey.json from Firebase Console)
    cred = credentials.Certificate('path/to/serviceAccountKey.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://your-project-id.firebaseio.com'
    })

    # Read the CSV file
    csv_file_path = 'amaranthus dataset 1 from 6-19 to 7-22.csv'
    df = pd.read_csv(csv_file_path)

    # Convert DataFrame to dictionary format
    data = df.to_dict('records')

    # Upload to Firebase Realtime Database
    ref = db.reference('crops/amaranthus')
    ref.set({
        'metadata': {
            'crop_name': 'Amaranthus',
            'date_range': '6-19 to 7-22',
            'file_name': csv_file_path,
            'upload_timestamp': datetime.utcnow().isoformat(),
            'total_records': len(data)
        },
        'sensor_data': data
    })

    print("✓ Dataset uploaded successfully to Firebase Realtime Database!")


# Main execution
if __name__ == "__main__":
    # ============================================
    # CONFIGURATION - UPDATE THESE VALUES
    # ============================================
    CREDENTIALS_PATH = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\serviceAccountKey.json'
    DATABASE_URL = 'https://sas-web-app-e7cc5-default-rtdb.asia-southeast1.firebasedatabase.app'
    CSV_FILE = r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\amaranthus dataset 1 from 6 -19  to 7-22.csv'
    
    print("=" * 60)
    print("Amaranthus CSV to Firebase Uploader")
    print("=" * 60)
    
    try:
        # Create uploader instance
        uploader = AmaranthusDataUploader(CREDENTIALS_PATH, DATABASE_URL)
        
        # Choose one of the following options:
        
        # Option 1: Simple upload (recommended for files < 1000 records)
        print("\n[Option 1] Simple Upload")
        # uploader.upload_csv_to_realtime_db(CSV_FILE)
        
        # Option 2: Batch upload (recommended for large files)
        print("\n[Option 2] Batch Upload (Recommended)")
        uploader.upload_with_batch_processing(CSV_FILE, batch_size=100)
        
        # Verify upload
        print("\n[Verification] Checking uploaded data...")
        uploader.verify_upload()
        
    except Exception as e:
        logger.error(f"✗ Script execution failed: {e}")
        print("\nPlease check:")
        print("1. serviceAccountKey.json path is correct")
        print("2. Database URL is correct")
        print("3. CSV file exists in the specified location")
        print("4. Required packages are installed: pip install firebase-admin pandas")
