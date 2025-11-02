"""
Setup Script: Create piConfigs Collection in Firestore
======================================================
This script creates the initial piConfigs document for your Raspberry Pi.

Usage:
    python setup_pi_config.py

This will create:
- Collection: piConfigs
- Document: raspberry_pi_01
- Fields: activeCropProfileId, status, location, settings
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Configuration
SERVICE_ACCOUNT_PATH = "c:/Users/User/Desktop/SAS/Smart-Agriculture-Business-Application-with-Multi-Crop-Support/Credientals/gen-lang-client-0092156800-3f84a3882b65.json"
FIRESTORE_DATABASE_ID = "sasapp"

# Pi Configuration Data
PI_ID = "raspberry_pi_01"
PI_CONFIG = {
    "activeCropProfileId": "crop_1762085977354",
    "status": "online",
    "location": "Field A",
    "settings": {
        "readInterval": 30,
        "uploadToCloud": True
    },
    "lastUpdated": firestore.SERVER_TIMESTAMP,
    "createdAt": firestore.SERVER_TIMESTAMP
}

def setup_pi_config():
    """Create piConfigs document in Firestore"""
    try:
        print("=" * 60)
        print("Firestore piConfigs Setup Script")
        print("=" * 60)
        
        # Initialize Firebase Admin SDK
        print("\n1. Initializing Firebase Admin SDK...")
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred, {
                'projectId': 'gen-lang-client-0092156800'
            })
        
        print("✓ Firebase Admin SDK initialized")
        
        # Connect to Firestore database
        print(f"\n2. Connecting to Firestore database: {FIRESTORE_DATABASE_ID}...")
        db = firestore.client(database_id=FIRESTORE_DATABASE_ID)
        print(f"✓ Connected to database: {FIRESTORE_DATABASE_ID}")
        
        # Check if document already exists
        print(f"\n3. Checking if piConfigs/{PI_ID} already exists...")
        doc_ref = db.collection('piConfigs').document(PI_ID)
        doc = doc_ref.get()
        
        if doc.exists:
            print(f"⚠️  Document piConfigs/{PI_ID} already exists!")
            print("\nCurrent data:")
            print(doc.to_dict())
            
            response = input("\nDo you want to update it? (y/n): ").strip().lower()
            if response != 'y':
                print("\n✗ Operation cancelled by user.")
                return
        
        # Create/Update the document
        print(f"\n4. Creating/Updating piConfigs/{PI_ID}...")
        doc_ref.set(PI_CONFIG)
        print(f"✓ Document created/updated successfully!")
        
        # Verify the document
        print(f"\n5. Verifying document...")
        doc = doc_ref.get()
        if doc.exists:
            print("✓ Document verified!")
            print("\nDocument data:")
            print("-" * 60)
            data = doc.to_dict()
            for key, value in data.items():
                print(f"  {key}: {value}")
            print("-" * 60)
        else:
            print("✗ Document verification failed!")
            return
        
        # Success message
        print("\n" + "=" * 60)
        print("✅ Setup Complete!")
        print("=" * 60)
        print("\nYour Raspberry Pi configuration is ready.")
        print("You can now run: python sensor_simulator.py")
        print("\nThe simulator will fetch this crop profile ID:")
        print(f"  {PI_CONFIG['activeCropProfileId']}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    setup_pi_config()
