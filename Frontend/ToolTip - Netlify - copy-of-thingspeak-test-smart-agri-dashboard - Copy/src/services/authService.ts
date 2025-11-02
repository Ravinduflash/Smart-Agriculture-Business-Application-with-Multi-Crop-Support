import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { firestoreService } from './firestoreService';

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUp(data: SignUpData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('🔐 Starting sign up process...');
      
      // Create Firebase Auth user
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      console.log('✅ Firebase Auth user created:', user.uid);

      // Update user profile with display name
      try {
        await updateProfile(user, {
          displayName: data.displayName
        });
        console.log('✅ Display name updated');
      } catch (profileError) {
        console.warn('⚠️ Failed to update display name:', profileError);
      }

      // Create user profile in Firestore
      try {
        const profileCreated = await firestoreService.createUserProfile({
          userId: user.uid,
          email: data.email,
          displayName: data.displayName,
          role: 'farmer',
          preferences: {
            selectedCropProfileId: null,
            language: 'en'
          }
        });

        if (profileCreated) {
          console.log('✅ Firestore user profile created');
        } else {
          console.warn('⚠️ Firestore profile creation returned false');
        }
      } catch (firestoreError) {
        console.error('❌ Firestore profile creation failed:', firestoreError);
        // Continue anyway - auth user is created
      }

      // Send email verification (optional - don't fail if this errors)
      try {
        await sendEmailVerification(user);
        console.log('📧 Verification email sent');
      } catch (emailError) {
        console.warn('⚠️ Email verification failed:', emailError);
        // Don't fail signup if email verification fails
      }

      return { success: true, user };
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Sign in existing user with email and password
   */
  async signIn(data: SignInData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Check if user profile exists in Firestore, create if not
      const profile = await firestoreService.getUserProfile(user.uid);
      if (!profile) {
        console.log('⚠️ User profile not found in Firestore, creating...');
        await firestoreService.createUserProfile({
          userId: user.uid,
          email: user.email || data.email,
          displayName: user.displayName || 'User',
          role: 'farmer',
          preferences: {
            selectedCropProfileId: null,
            language: 'en'
          }
        });
      }

      return { success: true, user };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      return {
        success: false,
        error: 'Failed to sign out. Please try again.'
      };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email. Please sign up first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}

export const authService = new AuthService();
export default authService;
