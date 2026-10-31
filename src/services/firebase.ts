/**
 * CRYPTORA Firebase Integration Service
 * Configures Firebase Authentication & Cloud Firestore with seamless environment variable fallback.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';

// Environment configurations
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }
}

export { app, auth, db, googleProvider };

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: number;
  authProvider: string;
}

/**
 * Sign In with Google via Firebase Popup
 */
export async function signInWithGoogleFirebase(): Promise<FirebaseUser> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase credentials are not configured in environment variables. Please configure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID, or use local email authentication.');
  }

  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Sync profile in Firestore
  if (db && user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'Cryptora User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: Date.now(),
          authProvider: 'google.com',
        });
      }
    } catch (e) {
      console.warn('Could not sync user profile to Firestore:', e);
    }
  }

  return user;
}

/**
 * Register with Email and Password
 */
export async function registerWithEmailFirebase(
  name: string,
  email: string,
  pass: string
): Promise<FirebaseUser> {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }

  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (cred.user) {
    await updateProfile(cred.user, { displayName: name });
    if (db) {
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          displayName: name,
          email,
          createdAt: Date.now(),
          authProvider: 'password',
        });
      } catch (e) {
        console.warn('Could not write user profile to Firestore:', e);
      }
    }
  }
  return cred.user;
}

/**
 * Login with Email and Password
 */
export async function loginWithEmailFirebase(email: string, pass: string): Promise<FirebaseUser> {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

/**
 * Send Password Reset Email
 */
export async function resetPasswordFirebase(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }
  await sendPasswordResetEmail(auth, email);
}

/**
 * Sign out user
 */
export async function signOutFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}
