/**
 * Utility to test Firebase Authentication and user profile creation
 * This demonstrates the full authentication flow
 */

import { authService } from '../services/authService';
import { firestoreService } from '../services/firestoreService';

/**
 * Test sign up flow
 * This will create a user in Firebase Auth and a profile in Firestore users collection
 */
export async function testSignUp() {
  const testUser = {
    email: 'farmer@sas.com',
    password: 'farmer123',
    displayName: 'Test Farmer'
  };

  console.log('🔐 Testing Sign Up...');
  console.log('Email:', testUser.email);
  console.log('Password:', testUser.password);
  
  const result = await authService.signUp(testUser);
  
  if (result.success) {
    console.log('✅ Sign up successful!');
    console.log('User ID:', result.user?.uid);
    console.log('Email:', result.user?.email);
    console.log('Display Name:', result.user?.displayName);
    console.log('📧 Check your email for verification link');
    console.log('🔥 Check Firestore Console: users collection should have new document');
    return result.user;
  } else {
    console.error('❌ Sign up failed:', result.error);
    return null;
  }
}

/**
 * Test sign in flow
 */
export async function testSignIn() {
  const credentials = {
    email: 'farmer@sas.com',
    password: 'farmer123'
  };

  console.log('🔐 Testing Sign In...');
  const result = await authService.signIn(credentials);
  
  if (result.success) {
    console.log('✅ Sign in successful!');
    console.log('User ID:', result.user?.uid);
    return result.user;
  } else {
    console.error('❌ Sign in failed:', result.error);
    return null;
  }
}

/**
 * Test getting user profile from Firestore
 */
export async function testGetUserProfile(userId: string) {
  console.log('📋 Testing Get User Profile...');
  const profile = await firestoreService.getUserProfile(userId);
  
  if (profile) {
    console.log('✅ User profile retrieved:');
    console.log(JSON.stringify(profile, null, 2));
    return profile;
  } else {
    console.error('❌ User profile not found');
    return null;
  }
}

/**
 * Test updating user's selected crop
 */
export async function testUpdateUserCrop(userId: string, cropId: string) {
  console.log('🌾 Testing Update User Crop Selection...');
  const success = await firestoreService.updateUserSelectedCrop(userId, cropId);
  
  if (success) {
    console.log('✅ User crop selection updated to:', cropId);
    console.log('🔥 Check Firestore Console: users collection document should be updated');
  } else {
    console.error('❌ Failed to update user crop selection');
  }
  
  return success;
}

/**
 * Run all tests in sequence
 */
export async function runAuthTests() {
  console.log('🧪 Starting Authentication Tests...\n');
  
  // Test 1: Sign Up
  console.log('=== TEST 1: SIGN UP ===');
  const newUser = await testSignUp();
  
  if (!newUser) {
    console.log('\n⚠️ Sign up failed. User might already exist.');
    console.log('Trying to sign in instead...\n');
    
    // Test 2: Sign In
    console.log('=== TEST 2: SIGN IN ===');
    const existingUser = await testSignIn();
    
    if (existingUser) {
      // Test 3: Get Profile
      console.log('\n=== TEST 3: GET USER PROFILE ===');
      await testGetUserProfile(existingUser.uid);
      
      // Test 4: Update Crop Selection
      console.log('\n=== TEST 4: UPDATE CROP SELECTION ===');
      await testUpdateUserCrop(existingUser.uid, 'amaranthus');
    }
  } else {
    console.log('\n✅ All tests completed!');
    console.log('New user created with ID:', newUser.uid);
  }
  
  console.log('\n🏁 Authentication Tests Complete!\n');
}
