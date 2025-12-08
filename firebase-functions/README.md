# Firebase Cloud Functions Setup Guide

## Overview
This directory contains Cloud Functions for the Smart Agriculture System, providing secure backend logic for:
- Raspberry Pi configuration management
- Sensor data ingestion with validation
- AI-powered crop profile generation using Gemini

## Functions Included

### 1. `getPiConfig` (Callable Function)
**Purpose**: Raspberry Pi calls this to retrieve its current crop configuration.

**Input**:
```json
{
  "piId": "pi_unit_001"
}
```

**Output**:
```json
{
  "success": true,
  "config": {
    "cropProfileId": "amaranthus",
    "location": "Kalutara, Sri Lanka",
    "cropProfile": { /* full crop details */ }
  }
}
```

### 2. `ingestSensorData` (HTTPS Function)
**Purpose**: Receives and validates sensor data from Raspberry Pi before storing in Firestore.

**Endpoint**: `POST https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/ingestSensorData`

**Input**:
```json
{
  "timestamp": "2025-11-01 14:30:00",
  "crop_type": "amaranthus",
  "air_temp_c": 28.5,
  "humidity_percent": 75.2,
  "soil_moisture_raw": 15000,
  "soil_moisture_status": "Optimal",
  ...
}
```

**Output**:
```json
{
  "success": true,
  "message": "Sensor data stored successfully",
  "documentId": "amaranthus_2025_11_01_14_30_00"
}
```

### 3. `generateCropProfile` (Callable Function)
**Purpose**: Generates complete crop profile using Gemini AI and stores in Firestore.

**Input**:
```json
{
  "cropName": "Tomato"
}
```

**Output**:
```json
{
  "success": true,
  "cropProfile": { /* AI-generated crop details */ },
  "documentId": "tomato"
}
```

### 4. `getLatestSensorReadings` (Callable Function)
**Purpose**: Retrieves latest sensor readings for dashboard display.

### 5. `updatePiConfig` (Callable Function)
**Purpose**: Updates Raspberry Pi configuration from React app.

## Setup Instructions

### Step 1: Install Dependencies
```bash
cd firebase-functions
npm install
```

### Step 2: Set Gemini API Key
```bash
firebase functions:config:set gemini.apikey="YOUR_GEMINI_API_KEY"
```

### Step 3: Deploy Functions
```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:ingestSensorData
```

### Step 4: Test Locally (Optional)
```bash
# Start emulator
npm run serve

# Functions will be available at:
# http://localhost:5001/gen-lang-client-0092156800/us-central1/ingestSensorData
```

## Integration Examples

### Raspberry Pi - Using ingestSensorData
```python
import requests

FUNCTION_URL = "https://us-central1-gen-lang-client-0092156800.cloudfunctions.net/ingestSensorData"

sensor_data = {
    "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    "crop_type": "amaranthus",
    "air_temp_c": 28.5,
    "humidity_percent": 75.2,
    # ... all other sensor fields
}

response = requests.post(FUNCTION_URL, json=sensor_data)
print(response.json())
```

### React App - Using generateCropProfile
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const generateProfile = httpsCallable(functions, 'generateCropProfile');

const result = await generateProfile({ cropName: 'Tomato' });
console.log(result.data.cropProfile);
```

### Raspberry Pi - Using getPiConfig
```python
from firebase_admin import functions

# Call Cloud Function
get_config = functions.https_callable('getPiConfig')
result = get_config({'piId': 'pi_unit_001'})
print(result['config'])
```

## Security Notes

✅ **Advantages of Cloud Functions**:
- Gemini API key stays server-side (never exposed to client)
- Data validation before storing in Firestore
- Rate limiting and monitoring built-in
- Centralized business logic
- No service account keys on Raspberry Pi

## Monitoring

View function logs:
```bash
firebase functions:log
```

Or in Firebase Console:
https://console.firebase.google.com/project/gen-lang-client-0092156800/functions

## Cost Optimization

- Functions run only when called (pay-per-use)
- First 2 million invocations per month are free
- Sensor data ingestion: ~12 calls/hour = ~8,640/month = FREE
- Crop profile generation: On-demand only

## Troubleshooting

**Error: "CORS blocked"**
- Already handled in `ingestSensorData` with CORS headers

**Error: "Permission denied"**
- Ensure Firebase project has Firestore enabled
- Check function deployment status

**Error: "Gemini API quota exceeded"**
- Check API key limits in Google Cloud Console
- Consider caching crop profiles

## Next Steps

After deploying functions:
1. Update Raspberry Pi script to use `ingestSensorData` endpoint
2. Update React app to use `generateCropProfile` for new crops
3. Test with Firebase emulator before production deployment
4. Set up monitoring alerts in Firebase Console
