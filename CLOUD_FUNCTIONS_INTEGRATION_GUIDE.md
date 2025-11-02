# Cloud Functions Integration Guide

## ✅ What's Been Completed

1. **Cloud Functions Deployed** (You confirmed: `{"success": true}`)
   - ✅ `ingest_sensor_data` - Working and tested
   - ✅ `get_pi_config` - Deployed
   - ✅ `generate_crop_profile` - Deployed

2. **Raspberry Pi Simulator Updated**
   - ✅ Removed direct Firestore writes
   - ✅ Added Cloud Function integration
   - ✅ Uses `requests.post()` to send data
   - ✅ Fetches active crop ID from `get_pi_config`

---

## 🎯 Next Steps (In Order)

### Step 1: Set Up `piConfigs` Collection in Firestore

**Go to Firebase Console:**
1. Open: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore
2. Select database: **`sasapp`**
3. Create a new collection: **`piConfigs`**
4. Add a document:
   - **Document ID**: `raspberry_pi_01`
   - **Fields**:
     ```json
     {
       "activeCropProfileId": "crop_1762085977354",
       "status": "online",
       "location": "Field A - Development",
       "settings": {
         "readInterval": 30,
         "uploadToCloud": true
       },
       "lastUpdated": [Current timestamp]
     }
     ```

5. Click **Save**

---

### Step 2: Test `get_pi_config` Function

**PowerShell Command:**
```powershell
curl -X POST https://asia-south1-gen-lang-client-0092156800.cloudfunctions.net/get_pi_config -H "Content-Type: application/json" -d '{\"data\": {\"pi_id\": \"raspberry_pi_01\"}}'
```

**Expected Response:**
```json
{
  "result": {
    "activeCropProfileId": "crop_1762085977354",
    "status": "online",
    "location": "Field A - Development",
    "settings": {
      "readInterval": 30,
      "uploadToCloud": true
    }
  }
}
```

---

### Step 3: Test Updated Raspberry Pi Simulator

**Run the simulator:**
```powershell
cd "C:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\raspberry_module"
python sensor_simulator.py
```

**What to Look For:**
1. ✅ "Fetching active crop profile from Cloud Function..."
2. ✅ "Using crop profile: crop_1762085977354"
3. ✅ "Data sent to Cloud Function. Document ID: crop_..."
4. ✅ Check Firestore `sensorReadings` collection for new documents

---

### Step 4: Verify Data in Firestore

**Go to Firebase Console:**
1. Navigate to Firestore Database → `sasapp` → `sensorReadings`
2. Look for documents with IDs like: `crop_1762085977354_20251103_HHMMSS`
3. Verify the document contains:
   - ✅ `timestamp`
   - ✅ `crop_id`
   - ✅ All sensor readings (temperature, humidity, NPK, etc.)
   - ✅ `uploaded_at` (server timestamp)

---

### Step 5: Add `generate_crop_profile` to React App

**File to Update:** `Frontend/ToolTip - Netlify - .../pages/CropManagement.tsx` (or similar)

**Add this function:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(app, 'asia-south1');

async function generateCropProfile(cropName: string) {
  try {
    const generateProfile = httpsCallable(functions, 'generate_crop_profile');
    const result = await generateProfile({ crop_name: cropName });
    
    console.log('Crop profile generated:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error generating crop profile:', error);
    throw error;
  }
}
```

**Usage Example:**
```typescript
// In your Crop Management page
const handleCreateCrop = async () => {
  const cropName = "Amaranthus"; // From user input
  const profile = await generateCropProfile(cropName);
  
  // Profile now contains AI-generated details from Gemini
  console.log(profile.description);
  console.log(profile.optimal_conditions);
}
```

---

## 📊 Current Architecture

```
┌─────────────────────┐
│  Raspberry Pi       │
│  (simulator)        │
└──────────┬──────────┘
           │
           │ 1. GET /get_pi_config
           │    → Returns: activeCropProfileId
           ▼
┌─────────────────────┐
│  Cloud Function     │
│  get_pi_config      │
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │  Firestore  │
    │  piConfigs  │
    └─────────────┘

┌─────────────────────┐
│  Raspberry Pi       │
│  (sends data)       │
└──────────┬──────────┘
           │
           │ 2. POST /ingest_sensor_data
           │    → Sensor readings
           ▼
┌─────────────────────┐
│  Cloud Function     │
│  ingest_sensor_data │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────────┐
    │    Firestore     │
    │  sensorReadings  │
    └──────────────────┘

┌─────────────────────┐
│   React Web App     │
│  (authenticated)    │
└──────────┬──────────┘
           │
           │ 3. CALL generate_crop_profile
           │    → { crop_name: "Amaranthus" }
           ▼
┌─────────────────────┐
│  Cloud Function     │
│  generate_crop_     │
│  profile            │
└──────────┬──────────┘
           │
           │ Calls Gemini AI
           ▼
    ┌──────────────────┐
    │    Firestore     │
    │  cropProfiles    │
    └──────────────────┘
```

---

## 🔥 Quick Test Commands

### Test All Functions:

**1. Test ingest_sensor_data (Already working ✓):**
```powershell
curl -X POST https://asia-south1-gen-lang-client-0092156800.cloudfunctions.net/ingest_sensor_data -H "Content-Type: application/json" -d '{\"timestamp\": \"2025-11-03 00:31:00\", \"crop_id\": \"test_crop_001\", \"air_temp_c\": 28.5, \"humidity_percent\": 75.0}'
```

**2. Test get_pi_config (After setting up piConfigs):**
```powershell
curl -X POST https://asia-south1-gen-lang-client-0092156800.cloudfunctions.net/get_pi_config -H "Content-Type: application/json" -d '{\"data\": {\"pi_id\": \"raspberry_pi_01\"}}'
```

**3. Test generate_crop_profile:**
- Must be called from React app (requires auth)
- Or use Firebase CLI: `firebase functions:shell`

---

## 🎉 Success Criteria

### You'll know everything is working when:

- ✅ Raspberry Pi simulator starts without errors
- ✅ Simulator fetches crop ID from Cloud Function
- ✅ New documents appear in `sensorReadings` every 30 seconds
- ✅ Documents have `uploaded_at` timestamp
- ✅ React app can call `generate_crop_profile`
- ✅ New crop profiles appear in `cropProfiles` collection
- ✅ Crop profiles have AI-generated descriptions and optimal conditions

---

## 🐛 Troubleshooting

### Simulator Can't Connect:
- Check internet connection
- Verify Cloud Function URLs are correct
- Check Firebase Console for function logs

### get_pi_config Returns Error:
- Verify `piConfigs/raspberry_pi_01` document exists
- Check document has `activeCropProfileId` field
- View function logs in Firebase Console

### Data Not Appearing in Firestore:
- Check function logs for errors
- Verify `sasapp` database exists
- Check `sensorReadings` collection permissions

### generate_crop_profile Fails:
- Ensure user is authenticated
- Check Gemini API key is set
- View function logs for Gemini API errors

---

## 📝 Firestore Collections Structure

```
sasapp (database)
├── piConfigs
│   └── raspberry_pi_01
│       ├── activeCropProfileId: "crop_1762085977354"
│       ├── status: "online"
│       ├── location: "Field A"
│       └── settings: {...}
│
├── sensorReadings
│   └── crop_1762085977354_20251103_HHMMSS
│       ├── timestamp: "2025-11-03 HH:MM:SS"
│       ├── crop_id: "crop_1762085977354"
│       ├── air_temp_c: 28.5
│       ├── humidity_percent: 75.2
│       ├── uploaded_at: [Server Timestamp]
│       └── ... (all sensor data)
│
└── cropProfiles
    └── amaranthus
        ├── cropId: "amaranthus"
        ├── name: "Amaranthus"
        ├── description: "AI-generated..."
        ├── optimalConditions: {...}
        ├── imageUrl: "https://..."
        ├── createdBy: "user_uid"
        └── createdAt: [Server Timestamp]
```

---

## 🚀 What's Next?

After completing these steps:

1. **Build Crop Management UI** in React
   - Form to enter crop names
   - Button to generate profile with AI
   - Display generated profiles

2. **Build Dashboard** to display sensor data
   - Real-time charts
   - Historical data analysis
   - Alerts for out-of-range values

3. **Add ML Model Integration**
   - Yield prediction function
   - Disease detection
   - Automated recommendations

4. **Production Hardening**
   - Add authentication to all functions
   - Implement rate limiting
   - Add monitoring and alerts
   - Set up backup schedules

---

## 📞 Need Help?

Check Firebase Console logs:
```
https://console.firebase.google.com/project/gen-lang-client-0092156800/functions/logs
```

View Firestore data:
```
https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp
```

---

**You're almost there! 🌱**
