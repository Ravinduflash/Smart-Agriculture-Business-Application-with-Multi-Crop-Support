# getPiConfig Cloud Function - Quick Start Guide

## ✅ What's Already Done

The `getPiConfig` Cloud Function is **already implemented** in `firebase-functions/index.js`!

## 🚀 Quick Setup (3 Steps)

### Step 1: Initialize Pi Configuration in Firestore
```bash
python initialize_pi_config.py
```

Expected output:
```
✅ Pi Configuration Created Successfully!
Document ID: raspberry_pi_01
Active Crop: amaranthus
Status: online
```

---

### Step 2: Deploy Cloud Function
```bash
cd firebase-functions
firebase deploy --only functions:getPiConfig
```

Expected output:
```
✔  functions[getPiConfig(us-central1)]: Successful create operation.
Function URL: https://us-central1-gen-lang-client-0092156800.cloudfunctions.net/getPiConfig
```

**Important**: Copy the Function URL!

---

### Step 3: Test from Raspberry Pi
```bash
cd raspberry_module
python get_pi_config.py
```

Expected output:
```
✅ Config fetched successfully!
   Active Crop: amaranthus
   Status: online
```

---

## 📋 What the Function Does

### Purpose
Raspberry Pi calls this Cloud Function to find out which crop it should monitor.

### Flow
```
Raspberry Pi → Cloud Function → Firestore (piConfigs) → Returns crop ID
```

### Example Request
```python
import requests

response = requests.post(
    "https://us-central1-PROJECT.cloudfunctions.net/getPiConfig",
    json={"data": {"piId": "raspberry_pi_01"}}
)

config = response.json()["result"]["config"]
crop_id = config["activeCropProfileId"]  # "amaranthus"
```

### Example Response
```json
{
  "result": {
    "success": true,
    "config": {
      "piId": "raspberry_pi_01",
      "activeCropProfileId": "amaranthus",
      "status": "online",
      "location": "Field A",
      "lastUpdated": "2025-11-02T10:30:00Z"
    }
  }
}
```

---

## 🔧 How It Works

### 1. Firestore Structure
```
piConfigs/
  └── raspberry_pi_01/
      ├── piId: "raspberry_pi_01"
      ├── activeCropProfileId: "amaranthus"
      ├── status: "online"
      └── lastUpdated: timestamp
```

### 2. Cloud Function Code (Already in `index.js`)
```javascript
exports.getPiConfig = functions.https.onCall(async (data, context) => {
  const { piId } = data;
  
  // Fetch from Firestore
  const piConfigDoc = await db.collection('piConfigs').doc(piId).get();
  
  return {
    success: true,
    config: piConfigDoc.data()
  };
});
```

### 3. Python Client (Raspberry Pi)
```python
# In get_pi_config.py
def get_active_crop_id():
    response = requests.post(CLOUD_FUNCTION_URL, json={"data": {"piId": PI_ID}})
    config = response.json()["result"]["config"]
    return config["activeCropProfileId"]
```

---

## 🎯 Integration with Sensor Script

### Before (Hardcoded):
```python
# all_sensors_script_new.py
CROP_ID = "amaranthus"  # Hardcoded!
```

### After (Dynamic):
```python
# all_sensors_script_new.py
from get_pi_config import get_active_crop_id

CROP_ID = get_active_crop_id()  # Fetched from Cloud!
print(f"Monitoring: {CROP_ID}")
```

Now when you change the crop in Firestore, the Pi automatically switches!

---

## 🔄 Changing the Active Crop

### Option 1: Firebase Console
1. Go to Firestore → sasapp → piConfigs → raspberry_pi_01
2. Edit `activeCropProfileId` field
3. Change from "amaranthus" to "tomato" (or any crop ID)
4. Save
5. Next time Pi runs, it gets the new crop!

### Option 2: React Dashboard (Future)
Add a UI to change the active crop:
```typescript
await firestoreService.updateDocument('piConfigs', 'raspberry_pi_01', {
  activeCropProfileId: newCropId
});
```

### Option 3: Python Script
```python
from firebase_admin import firestore

db = firestore.client(database='sasapp')
db.collection('piConfigs').document('raspberry_pi_01').update({
    'activeCropProfileId': 'tomato'
})
```

---

## 🧪 Testing Checklist

- [ ] Step 1: Run `python initialize_pi_config.py` ✅
- [ ] Step 2: Verify in Firebase Console → Firestore → piConfigs ✅
- [ ] Step 3: Deploy function: `firebase deploy --only functions:getPiConfig` ⏳
- [ ] Step 4: Copy function URL to `get_pi_config.py` ⏳
- [ ] Step 5: Test: `python get_pi_config.py` ⏳
- [ ] Step 6: Integrate with sensor script ⏳

---

## 📊 Files Created

| File | Purpose |
|------|---------|
| `firebase-functions/index.js` | ✅ Already contains getPiConfig function |
| `raspberry_module/get_pi_config.py` | ✅ Python client to call the function |
| `initialize_pi_config.py` | ✅ Creates piConfigs document in Firestore |
| `firebase-functions/DEPLOYMENT_GUIDE.md` | ✅ Full deployment documentation |

---

## 🎉 Benefits

1. **Dynamic Crop Switching**: Change crop without updating Pi code
2. **Centralized Control**: Manage all Pis from one Firestore database
3. **Scalable**: Add more Pis easily (pi_02, pi_03, etc.)
4. **Real-time**: Changes take effect on next sensor reading
5. **Cloud-based**: No need to SSH into Raspberry Pi

---

## 🐛 Troubleshooting

### "Function not found"
→ Deploy first: `firebase deploy --only functions:getPiConfig`

### "Document not found"
→ Run: `python initialize_pi_config.py`

### "Connection timeout"
→ Check internet on Raspberry Pi

### "Permission denied"
→ Check Firebase IAM settings

### Function URL not working
→ Verify the URL in `get_pi_config.py` matches deployed URL

---

## 📞 Next Steps

1. ✅ **Completed**: `getPiConfig` function ready
2. ⏳ **Next**: Deploy and test the function
3. ⏳ **Then**: Implement `ingestSensorData` function (for sending sensor data)
4. ⏳ **Finally**: Integrate both with Raspberry Pi sensor script

**Ready to deploy? Run:**
```bash
cd firebase-functions
firebase deploy --only functions:getPiConfig
```
