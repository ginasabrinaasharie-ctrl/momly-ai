import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDTtFAfOeVeTX51pJiUdHbWozV2MQTuhiE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'momly-ai-companion.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'momly-ai-companion',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'momly-ai-companion.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '824094119581',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:824094119581:web:e5a7fafcc4f3f53faae674',
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Setup Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Trigger official Google Sign-In popup via Firebase Auth.
 * Returns the authenticated Firebase User with real displayName, email, photoURL, and uid.
 */
export async function loginWithGooglePopup(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign out of Firebase Auth.
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut error:', err);
  }
}
