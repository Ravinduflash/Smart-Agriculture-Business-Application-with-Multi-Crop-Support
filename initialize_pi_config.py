"""
Initialize Raspberry Pi Configuration in Firestore
Creates the piConfigs document needed for the Cloud Function
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Path to your service account key
SERVICE_ACCOUNT_KEY = "Credientals/gen-lang-client-0092156800-3f84a3882b65.json"

def initialize_pi_config():
    """
    Create or update Pi configuration in Firestore
    """
    try:
        # Initialize Firebase Admin (if not already initialized)
        try:
            firebase_admin.get_app()
            print("Firebase Admin already initialized")
        except ValueError:
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin initialized")
        
        # Get Firestore client for sasapp database
        db = firestore.client(database='sasapp')
        print("✅ Connected to Firestore database: sasapp")
        
        # Pi configuration data
        pi_config = {
            'piId': 'raspberry_pi_01',
            'activeCropProfileId': 'amaranthus',  # Default crop
            'status': 'online',
            'location': 'Field A',
            'description': 'Main Raspberry Pi sensor node',
            'ipAddress': '192.168.1.100',  # Update with actual IP
            'lastUpdated': firestore.SERVER_TIMESTAMP,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'sensorTypes': [
                'DHT22',      # Temperature & Humidity
                'BMP180',     # Air Pressure
                'HW080',      # Soil Moisture
                'LDR',        # Light Level
                'Rain',       # Rain Sensor
                'MQ135',      # Gas Sensor (CO2, NH3, VOC)
                'NPK'         # NPK Sensor
            ],
            'settings': {
                'readInterval': 300,  # 5 minutes in seconds
                'uploadToCloud': True,
                'localLogging': True,
                'debugMode': False
            }
        }
        
        # Create/update document
        doc_ref = db.collection('piConfigs').document('raspberry_pi_01')
        doc_ref.set(pi_config, merge=True)
        
        print("\n" + "="*60)
        print("✅ Pi Configuration Created Successfully!")
        print("="*60)
        print(f"Document ID: raspberry_pi_01")
        print(f"Collection: piConfigs")
        print(f"Database: sasapp")
        print(f"Active Crop: {pi_config['activeCropProfileId']}")
        print(f"Status: {pi_config['status']}")
        print(f"Location: {pi_config['location']}")
        print("="*60)
        
        # Verify document was created
        doc = doc_ref.get()
        if doc.exists:
            print("\n✅ Verification: Document exists in Firestore")
            print("\nDocument data:")
            for key, value in doc.to_dict().items():
                if key not in ['createdAt', 'lastUpdated']:  # Skip timestamps for cleaner output
                    print(f"  {key}: {value}")
        else:
            print("\n❌ Verification failed: Document not found")
            
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


def verify_crop_profile_exists():
    """
    Check if the amaranthus crop profile exists
    """
    try:
        db = firestore.client(database='sasapp')
        
        crop_ref = db.collection('cropProfiles').document('amaranthus')
        crop_doc = crop_ref.get()
        
        if crop_doc.exists:
            print("\n✅ Amaranthus crop profile exists")
            crop_data = crop_doc.to_dict()
            print(f"   Name: {crop_data.get('name', 'N/A')}")
            print(f"   Water Needs: {crop_data.get('optimalConditions', {}).get('waterNeeds', 'N/A')}")
            return True
        else:
            print("\n⚠️ Amaranthus crop profile not found")
            print("   The Pi config will still work, but crop details won't be available")
            print("   Create the crop profile in the React dashboard first")
            return False
            
    except Exception as e:
        print(f"\n⚠️ Could not verify crop profile: {e}")
        return False


def test_get_config():
    """
    Test retrieving the configuration (simulates what the Cloud Function does)
    """
    try:
        db = firestore.client(database='sasapp')
        
        print("\n" + "="*60)
        print("Testing Configuration Retrieval")
        print("="*60)
        
        # Get Pi config
        pi_ref = db.collection('piConfigs').document('raspberry_pi_01')
        pi_doc = pi_ref.get()
        
        if not pi_doc.exists:
            print("❌ Pi configuration not found!")
            return False
        
        pi_data = pi_doc.to_dict()
        print(f"✅ Pi Config Retrieved")
        print(f"   Active Crop ID: {pi_data.get('activeCropProfileId')}")
        
        # Get crop profile if it exists
        crop_id = pi_data.get('activeCropProfileId')
        if crop_id:
            crop_ref = db.collection('cropProfiles').document(crop_id)
            crop_doc = crop_ref.get()
            
            if crop_doc.exists:
                crop_data = crop_doc.to_dict()
                print(f"✅ Crop Profile Retrieved")
                print(f"   Name: {crop_data.get('name')}")
                print(f"   Description: {crop_data.get('description', 'N/A')[:100]}...")
            else:
                print(f"⚠️ Crop profile '{crop_id}' not found")
        
        print("="*60)
        return True
        
    except Exception as e:
        print(f"❌ Error testing configuration: {e}")
        return False


if __name__ == "__main__":
    print("="*60)
    print("Raspberry Pi Configuration Initializer")
    print("="*60)
    
    # Step 1: Create Pi config
    if initialize_pi_config():
        # Step 2: Verify crop profile
        verify_crop_profile_exists()
        
        # Step 3: Test retrieval
        test_get_config()
        
        print("\n" + "="*60)
        print("Next Steps:")
        print("="*60)
        print("1. Deploy Cloud Functions:")
        print("   cd firebase-functions")
        print("   firebase deploy --only functions:getPiConfig")
        print("")
        print("2. Test Cloud Function:")
        print("   cd raspberry_module")
        print("   python get_pi_config.py")
        print("")
        print("3. Update sensor script to use dynamic crop ID")
        print("="*60)
    else:
        print("\n❌ Initialization failed!")
