# 🚀 Quick Start Guide - Firestore Integration

## Prerequisites Checklist
- [ ] Firebase project created (`gen-lang-client-0092156800`)
- [ ] Cloud Firestore enabled in Firebase Console
- [ ] Service account key downloaded (already in `Credientals/` folder)
- [ ] Node.js and npm installed
- [ ] Python 3.7+ installed (for Raspberry Pi)

---

## Part 1: Firebase Console Setup (15 minutes)

### Step 1: Enable Firestore
1. Go to [Firebase Console](https://console.firebase.google.com/u/0/project/gen-lang-client-0092156800)
2. Click **Firestore Database** in left menu
3. Click **Create database**
4. Choose **Start in test mode** (we'll secure it later)
5. Select location: **asia-southeast1** (Singapore)
6. Click **Enable**

### Step 2: Get Firebase Config
1. Go to **Project Settings** (⚙️ icon)
2. Scroll down to **Your apps**
3. Click **Web app** icon (</>) or **Add app**
4. Register app name: `SAS Web App`
5. Copy the `firebaseConfig` object values

### Step 3: Enable Authentication
1. Go to **Authentication** in left menu
2. Click **Get started**
3. Enable **Email/Password** sign-in method
4. Click **Save**

### Step 4: Create Admin User
1. Go to **Authentication** → **Users** tab
2. Click **Add user**
3. Email: `admin@sasapp.com`
4. Password: Create a strong password
5. Click **Add user**

---

## Part 2: React App Configuration (10 minutes)

### Step 1: Update Firebase Config
1. Open: `Frontend/ToolTip.../src/config/firebase.ts`
2. Replace placeholders with values from Firebase Console:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_FROM_CONSOLE",
  authDomain: "gen-lang-client-0092156800.firebaseapp.com",
  projectId: "gen-lang-client-0092156800",
  storageBucket: "gen-lang-client-0092156800.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 2: Create .env.local File
1. Copy `.env.example` to `.env.local`
2. Fill in your actual Firebase values
3. Add to `.gitignore` (already configured)

### Step 3: Install Dependencies (Already Done!)
```bash
cd Frontend/ToolTip...
npm install firebase  # ✓ Already installed!
```

---

## Part 3: Initialize Firestore Collections (5 minutes)

### Option A: Using Firebase Console (Recommended for beginners)

1. Go to **Firestore Database** in Firebase Console
2. Click **Start collection**
3. Create these collections ONE BY ONE:

**Collection 1: cropProfiles**
- Collection ID: `cropProfiles`
- First document ID: `amaranthus`
- Fields:
  - `name` (string): `Amaranthus`
  - `imageUrl` (string): `https://example.com/amaranthus.jpg`
  - `description` (string): `A nutritious leafy green vegetable`
  - `createdAt` (timestamp): Auto-generate
  - Click **Save**

**Collection 2: piConfigs**
- Collection ID: `piConfigs`
- Document ID: `pi_unit_001`
- Fields:
  - `piId` (string): `pi_unit_001`
  - `activeCropProfileId` (string): `amaranthus`
  - `status` (string): `offline`
  - `lastUpdated` (timestamp): Auto-generate
  - Click **Save**

**Collection 3: users** (Leave empty for now, will be created on first login)

**Collection 4: sensorReadings** (Leave empty, Pi will populate)

**Collection 5: chatbotKnowledgeBase**
- Collection ID: `chatbotKnowledgeBase`
- Auto-generate document ID
- Fields:
  - `topic` (string): `General`
  - `question` (string): `What is this app about?`
  - `answer` (string): `This is a Smart Agriculture System...`
  - `language` (string): `en`
  - `tags` (array): [`general`, `info`]
  - `lastUpdated` (timestamp): Auto-generate
  - Click **Save**

### Option B: Using Python Script (Advanced)
```python
# Run this once to initialize collections
python initialize_firestore.py
```

---

## Part 4: Firestore Security Rules (IMPORTANT!)

1. Go to **Firestore Database** → **Rules** tab
2. Replace with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Crop Profiles - Read: All authenticated, Write: Admin only
    match /cropProfiles/{cropId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Sensor Readings - Read: Authenticated, Write: Service account
    match /sensorReadings/{readingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
    }
    
    // Pi Configs - Read: Authenticated, Write: Admin
    match /piConfigs/{piId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Users
    match /users/{userId} {
      allow read, write: if isAuthenticated() && 
                             (request.auth.uid == userId || isAdmin());
    }
    
    // Chatbot Knowledge - Read: All, Write: Admin
    match /chatbotKnowledgeBase/{knowledgeId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

3. Click **Publish**

---

## Part 5: Test React App (5 minutes)

### Start Development Server
```bash
cd Frontend/ToolTip...
npm run dev
```

### Test Checklist
1. [ ] App loads without errors
2. [ ] Can see Firebase connection in browser console
3. [ ] No "Firebase not initialized" errors
4. [ ] Dashboard displays (even with no sensor data yet)

---

## Part 6: Raspberry Pi Setup (15 minutes)

### Step 1: Install Python Dependencies
```bash
# On your Raspberry Pi
pip install firebase-admin google-cloud-firestore
```

### Step 2: Transfer Service Account Key
```bash
# From your PC to Raspberry Pi
scp "C:\Users\User\Desktop\SAS\...\Credientals\gen-lang-client-0092156800-3f84a3882b65.json" pi@raspberrypi.local:/home/pi/
```

### Step 3: Transfer Python Script
```bash
# Copy the Firestore client script
scp raspberry_pi_firestore_client.py pi@raspberrypi.local:/home/pi/
```

### Step 4: Test Pi Connection
```bash
# SSH into Pi
ssh pi@raspberrypi.local

# Run the script
python3 raspberry_pi_firestore_client.py
```

### Expected Output:
```
======================================================================
Smart Agriculture Pi Client - Firestore Integration
======================================================================
✓ Firebase Admin SDK initialized for Pi: pi_unit_001
✓ Fetched config: Monitoring crop 'amaranthus'
✓ Starting data collection (interval: 300s)
✓ Listening for configuration changes...
--- Reading sensors at 2025-11-01 15:30:00 ---
✓ Sensor data uploaded for crop: amaranthus
   Temperature: 28.5°C, Humidity: 75.2%
   Soil Moisture: 550 (Optimal)
✓ Data upload successful
Waiting 300s until next reading...
```

---

## Part 7: Verification (5 minutes)

### Check Firestore Console
1. Go to **Firestore Database**
2. Open **sensorReadings** collection
3. You should see new documents appearing every 5 minutes!

### Check React App
1. Refresh your web app
2. Dashboard should show real-time sensor data
3. Data updates automatically (no refresh needed!)

---

## Common Issues & Solutions

### Issue: "Firebase not initialized"
**Solution:** Check that `firebase.ts` config file has correct values

### Issue: "Permission denied" in Firestore
**Solution:** Check Security Rules are published correctly

### Issue: Pi can't connect to Firestore
**Solution:** 
1. Check internet connection on Pi
2. Verify service account key path is correct
3. Check file permissions: `chmod 600 gen-lang-client-*.json`

### Issue: No data in React app
**Solution:**
1. Check if Pi is actually running and sending data
2. Check browser console for errors
3. Verify crop profile ID matches in Pi config and user selection

---

## Next Steps

Once everything is working:

1. **Secure your database** - Update security rules for production
2. **Add more crops** - Create crop profiles in Firestore
3. **Set up ML models** - Deploy prediction models
4. **Configure chatbot** - Add knowledge base entries
5. **Create user accounts** - Set up farmer accounts
6. **Deploy to production** - Push to Netlify

---

## Need Help?

- Check Firebase Console logs
- Check browser console (F12)
- Check Pi terminal output
- Review the comprehensive migration guide

---

**Estimated Total Setup Time: 55 minutes**

✅ Firebase setup: 15 min
✅ React configuration: 10 min  
✅ Firestore initialization: 5 min
✅ Security rules: 5 min
✅ React testing: 5 min
✅ Pi setup: 15 min
✅ Verification: 5 min

---

**Status:** 🎉 **Ready to Go!**

Your Smart Agriculture System is now connected to Firestore and ready for real-time data collection and display!
