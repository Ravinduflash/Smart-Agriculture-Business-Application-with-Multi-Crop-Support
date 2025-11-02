# Firebase Authentication System

## Overview
Complete authentication system with Firebase Auth and Firestore user profiles.

## Features Implemented

### 1. **Authentication Service** (`src/services/authService.ts`)
- Sign up with email/password
- Sign in with email/password  
- Sign out
- Password reset
- Email verification
- User-friendly error messages

### 2. **User Profile Management** (Firestore `users` collection)
User profiles include:
```typescript
{
  userId: string;           // Firebase Auth UID
  email: string;           // User email
  displayName: string;     // Full name
  role: 'farmer' | 'admin';
  createdAt: Timestamp;
  preferences: {
    selectedCropProfileId: string | null;  // Current crop selection
    language: 'en' | 'si' | 'ta';         // UI language
  }
}
```

### 3. **Auth Context** (`src/contexts/AuthContext.tsx`)
Manages authentication state globally:
- `currentUser`: Firebase Auth user
- `userProfile`: Firestore user profile
- `loading`: Loading state
- `isAuthenticated`: Boolean
- `refreshUserProfile()`: Reload profile

### 4. **Protected Routes** (`src/components/ProtectedRoute.tsx`)
Wraps dashboard to require authentication:
- Redirects to `/login` if not authenticated
- Shows loading spinner while checking auth
- Allows access if authenticated

### 5. **Pages**
- **Login Page** (`pages/LoginPage.tsx`)
  - Email/password sign in
  - Forgot password flow
  - Link to sign up
  - Responsive design

- **Sign Up Page** (`pages/SignUpPage.tsx`)
  - Email/password registration
  - Name input
  - Password confirmation
  - Email verification sent
  - Link to login

### 6. **Integration**
- App.tsx: Routes configured with public (login/signup) and protected (dashboard) routes
- index.tsx: App wrapped in AuthProvider
- Header.tsx: Shows user name, sign out button

## Usage

### Sign Up
1. Navigate to `/signup` (or click "Sign Up" link on login page)
2. Enter name, email, password
3. Click "Sign Up"
4. Check email for verification link
5. User profile created in Firestore `users` collection

### Sign In
1. Navigate to `/login` (default redirect)
2. Enter email and password
3. Click "Sign In"
4. Redirected to dashboard

### Sign Out
1. Click user avatar in header
2. Click "Logout"
3. Redirected to login page

### Testing
Run authentication tests:
```typescript
import { runAuthTests } from './src/utils/testAuth';

// Run in browser console
runAuthTests();
```

Test credentials:
- Email: `farmer@sas.com`
- Password: `farmer123`

## Firebase Console Setup

### Enable Authentication
1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Enable "Email/Password" provider
4. Save

### Firestore Collection
The `users` collection will be automatically created when first user signs up.

**Document Structure:**
```
users/
  {userId}/
    - userId: "abc123..."
    - email: "farmer@sas.com"
    - displayName: "Test Farmer"
    - role: "farmer"
    - createdAt: Timestamp
    - preferences:
        - selectedCropProfileId: null
        - language: "en"
```

### Security Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read all users
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## User Flow

### New User
1. `/signup` → Create account
2. Email verification sent
3. User profile created in Firestore
4. Redirected to dashboard
5. Can select crop profile in settings

### Existing User
1. `/login` → Sign in
2. User profile loaded from Firestore
3. Redirected to dashboard
4. Previous crop selection restored

### Session Management
- Auth state persists across page refreshes
- User automatically redirected to dashboard if already signed in
- Protected routes check authentication before rendering

## Integration with Existing Features

### Crop Selection
Users can select their active crop in Settings:
```typescript
await firestoreService.updateUserSelectedCrop(userId, cropId);
```

This stores the selection in `users/{userId}/preferences/selectedCropProfileId`.

### Language Preference
Language selection is linked to user profile:
```typescript
await firestoreService.updateUserLanguage(userId, 'si');
```

### Sensor Data Filtering
Filter sensor readings by user's selected crop:
```typescript
const userProfile = await firestoreService.getUserProfile(userId);
const cropId = userProfile?.preferences.selectedCropProfileId;
const readings = await firestoreService.getSensorReadingsByCrop(cropId);
```

## Error Handling

All authentication errors are user-friendly:
- "This email is already registered"
- "Password must be at least 6 characters"
- "Invalid email or password"
- "Too many failed attempts"
- etc.

## Next Steps

1. **Email Verification Enforcement**: Require email verification before dashboard access
2. **Role-Based Access**: Different features for farmers vs admins
3. **Multi-Factor Authentication**: Add phone verification
4. **Social Login**: Google/Facebook sign in
5. **Profile Photos**: Upload user avatars
6. **Account Deletion**: Allow users to delete their account

## Files Created/Modified

### New Files
- `src/services/authService.ts` - Authentication logic
- `src/contexts/AuthContext.tsx` - Global auth state
- `src/components/ProtectedRoute.tsx` - Route protection
- `pages/LoginPage.tsx` - Login UI
- `pages/SignUpPage.tsx` - Sign up UI
- `src/utils/testAuth.ts` - Testing utilities

### Modified Files
- `App.tsx` - Added auth routes and protection
- `index.tsx` - Added AuthProvider
- `components/Header.tsx` - Added sign out, display user name
- `src/services/firestoreService.ts` - Already had user methods

## Support

For issues:
1. Check Firebase Console → Authentication → Users
2. Check Firestore → users collection
3. Check browser console for errors
4. Run `runAuthTests()` to verify setup
