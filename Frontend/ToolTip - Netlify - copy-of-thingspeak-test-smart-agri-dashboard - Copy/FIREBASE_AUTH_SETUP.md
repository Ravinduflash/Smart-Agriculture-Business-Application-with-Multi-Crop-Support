# Firebase Authentication Setup Guide

## Quick Fix: Enable Email/Password Authentication

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Select your project: **gen-lang-client-0092156800**

### Step 2: Enable Authentication
1. Click **"Authentication"** in the left sidebar
2. Click **"Get Started"** button (if you haven't set it up yet)
3. Go to **"Sign-in method"** tab
4. Find **"Email/Password"** in the providers list
5. Click on it
6. Toggle **"Enable"** switch to ON
7. Click **"Save"**

### Step 3: Test Again
1. Go back to your signup page: `localhost:5173/#/signup`
2. Fill in the form with test data
3. Click "Sign Up"
4. Should now work!

## Common Errors & Solutions

### Error: "An unexpected error occurred"
**Cause**: Email/Password authentication not enabled in Firebase Console

**Solution**: Follow Step 2 above

---

### Error: "Email already in use"
**Cause**: You already created an account with this email

**Solution**: 
- Use a different email, OR
- Go to Firebase Console → Authentication → Users → Delete the existing user

---

### Error: "Invalid email"
**Cause**: Email format is incorrect

**Solution**: Use a valid email format (e.g., user@domain.com)

---

### Error: "Weak password"
**Cause**: Password is less than 6 characters

**Solution**: Use at least 6 characters

---

### Error: "Network error"
**Cause**: No internet connection or Firebase is unreachable

**Solution**: Check your internet connection

---

## Verify Setup

### Check Firebase Console
After enabling authentication:
1. Go to Authentication → Users
2. Try signing up
3. New user should appear in the list

### Check Firestore
After successful signup:
1. Go to Firestore Database
2. Look for `users` collection
3. Should have a document with the user's UID
4. Document should contain: userId, email, displayName, role, preferences

### Check Browser Console
Open DevTools (F12) → Console tab:
- Look for `🔐 Starting sign up process...`
- Look for `✅ Firebase Auth user created: [uid]`
- Look for `✅ Firestore user profile created`
- Any errors will show here

## Test Credentials
After enabling auth, test with:
- **Name**: Test Farmer
- **Email**: farmer@sas.com
- **Password**: farmer123

## Still Having Issues?

1. **Check console logs**: Open browser DevTools (F12) → Console
2. **Check Firebase status**: Visit https://status.firebase.google.com/
3. **Verify config**: Check `src/config/firebase.ts` has correct API keys
4. **Clear cache**: Hard refresh (Ctrl+Shift+R)

## Security Note
After testing, you should:
1. Set up Firestore security rules
2. Add email verification requirement
3. Consider adding reCAPTCHA for production
