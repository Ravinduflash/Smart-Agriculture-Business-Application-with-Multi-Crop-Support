# 🚀 Netlify Deployment Guide - Smart Agriculture System

## ✅ Prerequisites Complete

- ✅ Firestore database "sasapp" created
- ✅ Firebase web app registered
- ✅ Collections initialized (cropProfiles, piConfigs, chatbotKnowledgeBase)
- ✅ Firebase configuration updated in code

---

## Quick Deploy Steps (10 minutes)

### Step 1: Install Firebase Analytics Package

```powershell
cd "c:\Users\User\Desktop\SAS\Smart-Agriculture-Business-Application-with-Multi-Crop-Support\Frontend\ToolTip - Netlify - copy-of-thingspeak-test-smart-agri-dashboard - Copy"
npm install firebase
```

### Step 2: Test Locally (3 minutes)

```powershell
npm run dev
```

Open http://localhost:5173 and verify:
- ✅ App loads without errors
- ✅ Check browser console (F12) - should see no Firebase errors
- ✅ Go to Crop Management page - should load Amaranthus & Kangkong from Firestore

### Step 3: Build for Production (2 minutes)

```powershell
npm run build
```

Expected output:
```
vite v5.x.x building for production...
✓ xx modules transformed.
dist/index.html                   x.xx kB
dist/assets/index-xxxxxx.js      xxx.xx kB
✓ built in xxxs
```

### Step 4: Deploy to Netlify

#### Option A: Netlify CLI (Fastest)

```powershell
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

Follow the prompts:
1. **Create & configure a new site**
2. **Team**: Choose your team
3. **Site name**: `sas-smart-agriculture` (or your preferred name)

After deployment, set environment variables:

```powershell
netlify env:set VITE_FIREBASE_API_KEY "REDACTED_SECRET"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "126088540777"
netlify env:set VITE_FIREBASE_APP_ID "1:126088540777:web:c47b63cb5dc2e2c57fe8f8"
netlify env:set VITE_FIREBASE_MEASUREMENT_ID "G-PP8NFDVBFR"
netlify env:set VITE_FIREBASE_DATABASE_ID "sasapp"
netlify env:set GEMINI_API_KEY "REDACTED_SECRET"

# Redeploy with environment variables
netlify deploy --prod --dir=dist
```

#### Option B: Netlify Dashboard (Alternative)

1. **Drag & Drop Deploy**:
   - Go to https://app.netlify.com/drop
   - Drag the `dist` folder to the upload area
   - Wait for deployment to complete

2. **Set Environment Variables**:
   - Go to **Site settings → Environment variables**
   - Add these variables:

   | Variable Name | Value |
   |--------------|-------|
   | `VITE_FIREBASE_API_KEY` | `REDACTED_SECRET` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `gen-lang-client-0092156800.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `gen-lang-client-0092156800` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `gen-lang-client-0092156800.firebasestorage.app` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `126088540777` |
   | `VITE_FIREBASE_APP_ID` | `1:126088540777:web:c47b63cb5dc2e2c57fe8f8` |
   | `VITE_FIREBASE_MEASUREMENT_ID` | `G-PP8NFDVBFR` |
   | `VITE_FIREBASE_DATABASE_ID` | `sasapp` |
   | `GEMINI_API_KEY` | `REDACTED_SECRET` |

3. **Redeploy**:
   - Go to **Deploys**
   - Click **Trigger deploy → Clear cache and deploy site**

---

## Step 5: Configure Firebase Security Rules (5 minutes)

1. Go to: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/rules

2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/sasapp/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Crop profiles - readable by all authenticated users
    match /cropProfiles/{cropId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Sensor readings - read for authenticated, write for service account
    match /sensorReadings/{readingId} {
      allow read: if isAuthenticated();
      allow create: if true; // Pi service account can write
      allow update, delete: if isAdmin();
    }
    
    // Pi configurations - admin only
    match /piConfigs/{piId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Chatbot knowledge base - public read, admin write
    match /chatbotKnowledgeBase/{entryId} {
      allow read: if true; // Public access for chatbot
      allow write: if isAdmin();
    }
    
    // User profiles
    match /users/{userId} {
      allow read, write: if isAuthenticated() && 
                           (request.auth.uid == userId || isAdmin());
    }
    
    // ML predictions
    match /mlPredictions/{predictionId} {
      allow read: if isAuthenticated();
      allow create: if true; // ML service can write
      allow update, delete: if isAdmin();
    }
  }
}
```

3. Click **"Publish"**

---

## Step 6: Enable Firebase Authentication (3 minutes)

1. Go to: https://console.firebase.google.com/project/gen-lang-client-0092156800/authentication/providers

2. Enable **Email/Password**:
   - Click **Email/Password**
   - Toggle **Enable**
   - Click **Save**

3. Configure **Authorized Domains**:
   - Go to **Authentication → Settings → Authorized domains**
   - Add your Netlify domain (e.g., `sas-smart-agriculture.netlify.app`)
   - `localhost` should already be there

---

## Step 7: Test Deployed Application

### 7.1 Visit Your Site

```
https://your-site-name.netlify.app
```

### 7.2 Test Checklist

Open browser console (F12) and verify:

- [ ] No Firebase initialization errors
- [ ] No CORS errors
- [ ] Network tab shows successful Firestore requests
- [ ] Crop Management page loads 2 crop profiles
- [ ] Dashboard displays sensor cards
- [ ] AI Farming Advisor section visible

### 7.3 Test Firestore Connection

Go to **Crop Management** page:
- Should see **Amaranthus** crop card
- Should see **Kangkong** crop card
- Data loaded from Firestore (check Network tab)

---

## Troubleshooting

### Issue: "Firebase: Error (auth/operation-not-allowed)"
**Solution**: Enable Email/Password authentication in Firebase Console

### Issue: "Missing or insufficient permissions"
**Solution**: 
1. Publish Firestore security rules
2. Ensure database ID is "sasapp"
3. Check rules allow public read for cropProfiles

### Issue: Build fails with "Module not found: firebase/analytics"
**Solution**: 
```powershell
npm install firebase
npm run build
```

### Issue: Environment variables not working on Netlify
**Solution**:
1. Verify all variables have `VITE_` prefix
2. Redeploy with **"Clear cache and deploy site"**
3. Check build logs for errors

---

## Performance Optimization

### Enable Firestore Offline Persistence

Add to `firebase.ts`:

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence only in first tab');
  } else if (err.code == 'unimplemented') {
    console.warn('Browser does not support persistence');
  }
});
```

### Create Firestore Indexes

For better query performance, create composite indexes:

1. Go to: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/indexes
2. Create index for `sensorReadings`:
   - Collection: `sensorReadings`
   - Fields: `cropProfileId` (Ascending), `timestamp` (Descending)
   - Query scope: Collection

---

## Continuous Deployment (Optional)

### Connect GitHub for Auto-Deploy

1. Push code to GitHub
2. In Netlify dashboard:
   - Go to **Site settings → Build & deploy → Continuous Deployment**
   - Click **Link to Git repository**
   - Select your GitHub repo
   - Set build settings:
     - **Base directory**: `Frontend/ToolTip - Netlify - copy-of-thingspeak-test-smart-agri-dashboard - Copy`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

Now every push to `main` auto-deploys! 🚀

---

## Next Steps

1. ✅ Deploy frontend to Netlify
2. ⬜ Set up Raspberry Pi client
3. ⬜ Deploy ML models to Google Cloud Run
4. ⬜ Configure custom domain
5. ⬜ Enable Firebase Performance Monitoring
6. ⬜ Set up error tracking (Sentry)

---

## Important URLs

- **Netlify Dashboard**: https://app.netlify.com
- **Firebase Console**: https://console.firebase.google.com/project/gen-lang-client-0092156800
- **Firestore Database**: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/databases/sasapp
- **Security Rules**: https://console.firebase.google.com/project/gen-lang-client-0092156800/firestore/rules

---

**🎉 Your Smart Agriculture System is ready to deploy!**

**Estimated Time**: 10-15 minutes for complete deployment
