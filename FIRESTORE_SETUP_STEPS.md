# 🚀 Firestore Setup - Complete Step-by-Step Guide

## ⏱️ Total Time: ~10 minutes

---

## Step 1: Enable Cloud Firestore API (2 minutes)

### Option A: Using the Direct Link (Fastest)
1. **Click this link**: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=gen-lang-client-0092156800
2. Click the **"ENABLE"** button
3. Wait 30-60 seconds for activation

### Option B: Through Firebase Console
1. Go to: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore
2. Click **"Create Database"**
3. Choose **"Start in production mode"** (we'll add security rules later)
4. Select location: **us-central** (or closest to Sri Lanka: **asia-south1**)
5. Click **"Done"**

✅ **Verification**: You should see "Firestore Database" dashboard with empty collections

---

## Step 2: Run Firestore Initialization Script (1 minute)

```powershell
cd "c:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support"
.\sas_env\Scripts\Activate.ps1
python initialize_firestore.py
```

**Expected Output:**
```
======================================================================
Firestore Database Initialization
======================================================================

1. Creating cropProfiles collection...
   ✓ Created crop profile: Amaranthus
   ✓ Created crop profile: Kangkong (Water Spinach)

2. Creating piConfigs collection...
   ✓ Created Pi configuration: pi_unit_001

3. Creating chatbotKnowledgeBase collection...
   ✓ Added knowledge: What is this Smart Agriculture System?...
   ✓ Added knowledge: What does a soil moisture reading of 400 mean?...
   ✓ Added knowledge: What are NPK levels and why are they important?...
   ✓ Added knowledge: What is the ideal temperature for growing vegetables?...
   ✓ Added knowledge: How do I choose which crop to grow?...

4. Initializing empty collections...
   ✓ users (will be created on first user registration)
   ✓ sensorReadings (will be populated by Raspberry Pi)
   ✓ mlPredictions (will be created by ML models)

======================================================================
✅ Firestore Initialization Complete!
======================================================================
```

---

## Step 3: Verify Firestore Collections (1 minute)

1. Go to Firebase Console: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore
2. You should see 3 collections:
   - ✅ **cropProfiles** (2 documents: amaranthus, kangkong)
   - ✅ **piConfigs** (1 document: pi_unit_001)
   - ✅ **chatbotKnowledgeBase** (5 documents)

---

## Step 4: Get Firebase Web App Config (2 minutes)

1. Go to Firebase Console: https://console.firebase.google.com/project/gen-lang-client-0092156800/settings/general
2. Scroll down to **"Your apps"**
3. If you don't have a web app:
   - Click **"Add app"** → Choose **Web** icon `</>`
   - Enter nickname: `Smart Agriculture Dashboard`
   - Click **"Register app"**
4. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "gen-lang-client-0092156800.firebaseapp.com",
  projectId: "gen-lang-client-0092156800",
  storageBucket: "gen-lang-client-0092156800.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 5: Update React App Configuration (2 minutes)

### File: `Frontend/ToolTip - Netlify - copy-of-thingspeak-test-smart-agri-dashboard - Copy/src/config/firebase.ts`

Replace the placeholder values:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE", // ← Paste from Step 4
  authDomain: "gen-lang-client-0092156800.firebaseapp.com",
  projectId: "gen-lang-client-0092156800",
  storageBucket: "gen-lang-client-0092156800.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID_HERE", // ← Paste from Step 4
  appId: "YOUR_APP_ID_HERE" // ← Paste from Step 4
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

## Step 6: Deploy Security Rules (2 minutes)

1. Go to: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/rules
2. Replace existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Crop profiles - read-only for all authenticated users
    match /cropProfiles/{cropId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Pi configurations - admin only
    match /piConfigs/{piId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Sensor readings - read for authenticated, write for Pi service account
    match /sensorReadings/{readingId} {
      allow read: if request.auth != null;
      allow create: if true; // Allow service account writes
    }
    
    // Chatbot knowledge base - read for all, write for admin
    match /chatbotKnowledgeBase/{entryId} {
      allow read: if true; // Public read for chatbot
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // ML predictions
    match /mlPredictions/{predictionId} {
      allow read: if request.auth != null;
      allow create: if true; // Allow ML service writes
    }
  }
}
```

3. Click **"Publish"**

---

## ✅ Setup Complete!

### Next Steps:

1. **Test React App:**
   ```powershell
   cd "c:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\Frontend\ToolTip - Netlify - copy-of-thingspeak-test-smart-agri-dashboard - Copy"
   npm run dev
   ```

2. **Start Raspberry Pi Data Collection:**
   ```bash
   python raspberry_pi_firestore_client.py
   ```

3. **Test Firestore Connection:**
   - Open browser to React app
   - Go to Crop Management page
   - You should see Amaranthus and Kangkong crop profiles loaded from Firestore

---

## 🔧 Troubleshooting

### Issue: "Cloud Firestore API has not been used"
**Solution**: Wait 2-3 minutes after enabling API, then retry script

### Issue: "Permission denied" when running initialization script
**Solution**: Verify service account JSON file path is correct in `initialize_firestore.py`

### Issue: React app shows "Firebase config error"
**Solution**: Double-check all values copied from Firebase Console to `firebase.ts`

### Issue: No data showing in React app
**Solution**: 
1. Check browser console for errors
2. Verify Firestore rules are published
3. Ensure Firebase SDK installed: `npm list firebase`

---

## 📊 Database Structure Overview

```
Firestore Database
│
├── cropProfiles/
│   ├── amaranthus/
│   │   ├── name: "Amaranthus"
│   │   ├── optimalConditions: {...}
│   │   └── ...
│   └── kangkong/
│
├── piConfigs/
│   └── pi_unit_001/
│       ├── activeCropProfileId: "amaranthus"
│       └── status: "offline"
│
├── chatbotKnowledgeBase/
│   ├── [auto-generated-id-1]
│   ├── [auto-generated-id-2]
│   └── ...
│
├── sensorReadings/ (populated by Pi)
│   ├── [timestamp-1]
│   ├── [timestamp-2]
│   └── ...
│
├── users/ (created on registration)
│
└── mlPredictions/ (created by ML models)
```

---

## 🎯 Success Criteria

- [x] Firestore API enabled
- [x] 3 collections created (cropProfiles, piConfigs, chatbotKnowledgeBase)
- [x] Firebase config added to React app
- [x] Security rules deployed
- [x] React app can read Firestore data
- [ ] Raspberry Pi uploading sensor data (after Pi setup)

---

**Need help?** Check the browser console (F12) for detailed error messages.
