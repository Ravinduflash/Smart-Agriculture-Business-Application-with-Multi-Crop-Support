# Cloud Functions Deployment Guide

## Overview
This guide covers deploying and testing the `getPiConfig` Cloud Function for Raspberry Pi integration.

## Prerequisites

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase (if not done)
```bash
cd firebase-functions
firebase init functions
```
Select:
- Existing project: gen-lang-client-0092156800
- Language: JavaScript
- Use ESLint: No (or Yes, your choice)
- Install dependencies: Yes

---

## Deploy Cloud Functions

### Deploy All Functions
```bash
cd firebase-functions
firebase deploy --only functions
```

### Deploy Specific Function Only
```bash
firebase deploy --only functions:getPiConfig
```

### View Deployment Logs
```bash
firebase functions:log
```

---

## Function Details

### 1. getPiConfig (Callable Function)

**Purpose**: Raspberry Pi calls this to get its current crop configuration

**URL Format**: 
```
https://us-central1-gen-lang-client-0092156800.cloudfunctions.net/getPiConfig
```

**Request Format**:
```json
{
  "data": {
    "piId": "raspberry_pi_01"
  }
}
```

**Response Format**:
```json
{
  "result": {
    "success": true,
    "config": {
      "piId": "raspberry_pi_01",
      "activeCropProfileId": "amaranthus",
      "status": "online",
      "lastUpdated": "2025-11-02T10:30:00Z",
      "cropProfile": {
        "name": "Amaranthus",
        "waterNeeds": "Moderate",
        "optimalPh": "6.0-7.5",
        "sunlight": "Full Sun"
      }
    }
  }
}
```

---

## Testing

### 1. Test from Terminal (curl)
```bash
curl -X POST \
  https://us-central1-gen-lang-client-0092156800.cloudfunctions.net/getPiConfig \
  -H "Content-Type: application/json" \
  -d '{"data":{"piId":"raspberry_pi_01"}}'
```

### 2. Test with Python Script
```bash
cd raspberry_module
python get_pi_config.py
```

Expected output:
```
============================================================
Testing Cloud Function Connection
============================================================
[2025-11-02 10:30:00] Fetching Pi configuration...
✅ Config fetched successfully!
   Active Crop: amaranthus
   Status: online
   Crop Name: Amaranthus
   Water Needs: Moderate

✅ Connection successful!
============================================================
```

### 3. Test from Firebase Console
1. Go to Firebase Console → Functions
2. Click on `getPiConfig`
3. Go to "Logs" tab
4. Trigger manually if available

---

## Firestore Setup

### Create Pi Configuration Document

**Collection**: `piConfigs`
**Document ID**: `raspberry_pi_01`
**Fields**:
```json
{
  "piId": "raspberry_pi_01",
  "activeCropProfileId": "amaranthus",
  "status": "online",
  "location": "Field A",
  "lastUpdated": "2025-11-02T10:00:00Z"
}
```

### Using Firebase Console
1. Go to Firestore Database
2. Select database: `sasapp`
3. Create collection: `piConfigs`
4. Add document with ID: `raspberry_pi_01`
5. Add fields as shown above

### Using Python Script
```python
from firebase_admin import firestore
import firebase_admin

# Initialize (if not already done)
cred = firebase_admin.credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)

db = firestore.client(database='sasapp')

# Create Pi config
db.collection('piConfigs').document('raspberry_pi_01').set({
    'piId': 'raspberry_pi_01',
    'activeCropProfileId': 'amaranthus',
    'status': 'online',
    'location': 'Field A',
    'lastUpdated': firestore.SERVER_TIMESTAMP
})

print("✅ Pi config created!")
```

---

## Integration with Sensor Script

### Update `all_sensors_script_new.py`

Add at the top:
```python
from get_pi_config import get_active_crop_id

# Get crop ID from Cloud Function
CROP_ID = get_active_crop_id()
print(f"Monitoring crop: {CROP_ID}")
```

This will automatically fetch the crop configuration before collecting sensor data.

---

## Troubleshooting

### Error: Function not found
**Solution**: Deploy functions first
```bash
firebase deploy --only functions
```

### Error: Permission denied
**Solution**: Check IAM permissions in Firebase Console

### Error: CORS issues
**Solution**: Already handled in the function code with proper CORS headers

### Error: Timeout
**Solution**: Check if Firestore database ID is correct (`sasapp`)

### Error: Document not found
**Solution**: Create the piConfigs document in Firestore first

---

## Function URL

After deployment, you'll get URLs like:
```
✔  functions[getPiConfig(us-central1)]: Successful create operation.
Function URL: https://us-central1-gen-lang-client-0092156800.cloudfunctions.net/getPiConfig
```

**Important**: Copy this URL and update it in `get_pi_config.py`:
```python
CLOUD_FUNCTION_URL = "YOUR_ACTUAL_FUNCTION_URL_HERE"
```

---

## Monitoring

### View Function Logs
```bash
firebase functions:log --only getPiConfig
```

### Real-time Logs
```bash
firebase functions:log --only getPiConfig --follow
```

### Check Function Status
1. Firebase Console → Functions
2. Click on function name
3. View metrics, logs, and health status

---

## Cost Estimation

**Free Tier (Spark Plan):**
- 2 million invocations/month
- 400,000 GB-seconds
- 200,000 CPU-seconds

**Your Usage:**
- Sensor reads every 5 minutes = 288 calls/day
- Monthly: ~8,640 calls
- **Well within free tier!** ✅

---

## Next Steps

1. ✅ Deploy `getPiConfig` function
2. ✅ Create `piConfigs` document in Firestore
3. ✅ Test with Python script
4. ⏳ Deploy `ingestSensorData` function
5. ⏳ Integrate with Raspberry Pi sensor script

---

## Security Notes

### Production Recommendations:
1. **Enable Authentication**: Require authentication for callable functions
2. **API Keys**: Store in environment variables
3. **Rate Limiting**: Implement to prevent abuse
4. **Firestore Rules**: Restrict read/write access

### Example Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /piConfigs/{piId} {
      allow read: if true; // Or require auth
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

---

## Support

For issues:
1. Check Firebase Console → Functions → Logs
2. Run test script with verbose output
3. Verify Firestore document exists
4. Check network connectivity from Raspberry Pi
