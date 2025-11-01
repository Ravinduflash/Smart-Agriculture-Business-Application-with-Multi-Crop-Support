"""
Quick Firestore Connection Test
Run this to verify Firebase setup is working

Usage:
    python test_firestore_connection.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

def test_firestore():
    print("\n" + "="*70)
    print("🧪 Firestore Connection Test")
    print("="*70 + "\n")
    
    try:
        # Initialize Firebase
        print("1. Initializing Firebase Admin SDK...")
        cred = credentials.Certificate(r'C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\Credientals\gen-lang-client-0092156800-3f84a3882b65.json')
        
        # Check if already initialized
        try:
            firebase_admin.get_app()
            print("   ⚠️  Firebase already initialized, using existing app")
        except ValueError:
            firebase_admin.initialize_app(cred)
            print("   ✅ Firebase initialized successfully")
        
        db = firestore.client()
        print("   ✅ Firestore client created\n")
        
        # Test 1: Read collections
        print("2. Testing collection access...")
        collections = db.collections()
        collection_names = [col.id for col in collections]
        
        if collection_names:
            print(f"   ✅ Found {len(collection_names)} collections:")
            for name in collection_names:
                count = len(list(db.collection(name).limit(100).stream()))
                print(f"      - {name} ({count} documents)")
        else:
            print("   ⚠️  No collections found (Firestore is empty)")
        
        print()
        
        # Test 2: Try to read a specific document
        print("3. Testing document read...")
        crop_ref = db.collection('cropProfiles').document('amaranthus')
        crop_doc = crop_ref.get()
        
        if crop_doc.exists:
            print("   ✅ Successfully read 'amaranthus' crop profile")
            data = crop_doc.to_dict()
            print(f"      Crop name: {data.get('name', 'N/A')}")
        else:
            print("   ⚠️  'amaranthus' document not found")
            print("   ℹ️  Run initialize_firestore.py to create sample data")
        
        print()
        
        # Test 3: Try to write a test document
        print("4. Testing document write...")
        test_collection = db.collection('_connection_test')
        test_doc = test_collection.document('test_timestamp')
        test_doc.set({
            'timestamp': firestore.SERVER_TIMESTAMP,
            'message': 'Connection test successful',
            'test_number': datetime.now().timestamp()
        })
        print("   ✅ Successfully wrote test document")
        
        # Clean up test document
        test_doc.delete()
        print("   ✅ Test document deleted\n")
        
        # Summary
        print("="*70)
        print("✅ ALL TESTS PASSED - Firestore is ready to use!")
        print("="*70)
        print("\nNext steps:")
        print("1. Run initialize_firestore.py to set up your database")
        print("2. Update firebase.ts in your React app with Firebase config")
        print("3. Start your React app: npm run dev")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}")
        print(f"   {str(e)}\n")
        
        if "SERVICE_DISABLED" in str(e):
            print("🔧 Fix:")
            print("   1. Enable Cloud Firestore API:")
            print("   2. https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=gen-lang-client-0092156800")
            print("   3. Wait 1-2 minutes after enabling")
            print("   4. Run this script again\n")
        elif "Permission denied" in str(e):
            print("🔧 Fix:")
            print("   1. Check service account JSON file path")
            print("   2. Verify Firestore is enabled in Firebase Console")
            print("   3. Check security rules allow service account access\n")
        
        return False

if __name__ == "__main__":
    test_firestore()
