import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration for Smart Agriculture System
// Project: gen-lang-client-0092156800
// Database: sasapp
const firebaseConfig = {
  apiKey: "REDACTED_SECRET",
  authDomain: "gen-lang-client-0092156800.firebaseapp.com",
  projectId: "gen-lang-client-0092156800",
  storageBucket: "gen-lang-client-0092156800.firebasestorage.app",
  messagingSenderId: "126088540777",
  appId: "1:126088540777:web:c47b63cb5dc2e2c57fe8f8",
  measurementId: "G-PP8NFDVBFR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID
export const db = getFirestore(app, 'sasapp');

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics (optional, for production)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
