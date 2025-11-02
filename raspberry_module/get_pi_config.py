"""
Raspberry Pi Config Fetcher
Calls Firebase Cloud Function to get the current crop configuration
"""

import requests
import json
from datetime import datetime

# Firebase Cloud Function URL
# Replace with your actual deployed function URL
CLOUD_FUNCTION_URL = "https://us-central1-gen-lang-client-0092156800.cloudfunctions.net/getPiConfig"

# Your Raspberry Pi ID (should match the document ID in piConfigs collection)
PI_ID = "raspberry_pi_01"


def get_pi_config():
    """
    Call the getPiConfig Cloud Function to get current crop configuration
    
    Returns:
        dict: Pi configuration including activeCropProfileId and crop details
        None: If request fails
    """
    try:
        print(f"[{datetime.now()}] Fetching Pi configuration...")
        
        # Prepare request data
        payload = {
            "data": {
                "piId": PI_ID
            }
        }
        
        # Make POST request to Cloud Function
        response = requests.post(
            CLOUD_FUNCTION_URL,
            json=payload,
            headers={
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        # Check response status
        if response.status_code == 200:
            result = response.json()
            
            if result.get("result", {}).get("success"):
                config = result["result"]["config"]
                print(f"✅ Config fetched successfully!")
                print(f"   Active Crop: {config.get('activeCropProfileId', 'None')}")
                print(f"   Status: {config.get('status', 'Unknown')}")
                
                # If crop profile details are included
                if 'cropProfile' in config:
                    crop = config['cropProfile']
                    print(f"   Crop Name: {crop.get('name', 'N/A')}")
                    print(f"   Water Needs: {crop.get('optimalConditions', {}).get('waterNeeds', 'N/A')}")
                
                return config
            else:
                print(f"❌ Failed to fetch config: {result}")
                return None
                
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout - Cloud Function took too long to respond")
        return None
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - Check internet connection")
        return None
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None


def get_active_crop_id():
    """
    Get just the active crop ID (simplified version)
    
    Returns:
        str: Crop profile ID or 'amaranthus' as default
    """
    config = get_pi_config()
    
    if config and 'activeCropProfileId' in config:
        return config['activeCropProfileId']
    else:
        print("⚠️ Using default crop: amaranthus")
        return 'amaranthus'


def test_connection():
    """
    Test the Cloud Function connection
    """
    print("=" * 60)
    print("Testing Cloud Function Connection")
    print("=" * 60)
    
    config = get_pi_config()
    
    if config:
        print("\n✅ Connection successful!")
        print("\nFull configuration:")
        print(json.dumps(config, indent=2))
    else:
        print("\n❌ Connection failed!")
        print("\nTroubleshooting steps:")
        print("1. Check if Cloud Functions are deployed:")
        print("   firebase deploy --only functions")
        print("2. Verify the function URL in this script")
        print("3. Check Firebase Console → Functions for errors")
        print("4. Ensure piConfigs collection has a document with ID:", PI_ID)
    
    print("=" * 60)


if __name__ == "__main__":
    # Run test when script is executed directly
    test_connection()
