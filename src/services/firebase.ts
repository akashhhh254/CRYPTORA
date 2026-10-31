/**
 * CRYPTORA Firebase Integration Service
 * Configures Firebase Authentication & Cloud Firestore with seamless environment variable fallback
 * and dynamic in-app configuration support.
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
  updateProfile,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';

export interface FirebaseConfigValues {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_KEY = 'cryptora_firebase_config_v1';
const listeners: Array<() => void> = [];

export function onFirebaseConfigChange(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  for (const fn of listeners) {
    try {
      fn();
    } catch (e) {
      console.warn('Config change listener error:', e);
    }
  }
}

/**
 * Parses user-pasted Firebase config strings (JSON or JavaScript snippet)
 */
export function parseFirebaseConfig(raw: string): FirebaseConfigValues | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // 1. Try pure JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && parsed.apiKey && parsed.projectId) {
      return {
        apiKey: String(parsed.apiKey).trim(),
        authDomain: String(parsed.authDomain || '').trim(),
        projectId: String(parsed.projectId).trim(),
        storageBucket: String(parsed.storageBucket || '').trim(),
        messagingSenderId: String(parsed.messagingSenderId || '').trim(),
        appId: String(parsed.appId || '').trim(),
      };
    }
  } catch {
    // Continue to regex extractor
  }

  // 2. Extract via regex for JS snippet or key-value pairs
  const extract = (key: string): string => {
    // Matches "key": "value", key: 'value', key: "value"
    const regex = new RegExp(`(?:['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"])`, 'i');
    const match = trimmed.match(regex);
    return match ? match[1].trim() : '';
  };

  const apiKey = extract('apiKey');
  const projectId = extract('projectId');
  const authDomain = extract('authDomain');
  const storageBucket = extract('storageBucket');
  const messagingSenderId = extract('messagingSenderId');
  const appId = extract('appId');

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    };
  }

  return null;
}

/**
 * Retrieve stored configuration from localStorage if present
 */
export function getStoredFirebaseConfig(): FirebaseConfigValues | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.apiKey && parsed.projectId) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Resolve current active configuration (LocalStorage overrides Env, Env overrides empty)
 */
export function getActiveFirebaseConfig(): FirebaseConfigValues {
  const stored = getStoredFirebaseConfig();
  if (stored && stored.apiKey && stored.projectId) {
    return stored;
  }
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };
}

export let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let googleProvider: GoogleAuthProvider | null = null;
export let isFirebaseConfigured = false;

/**
 * Initializes or re-initializes Firebase instances
 */
export function initializeFirebaseInstance(): boolean {
  const cfg = getActiveFirebaseConfig();
  const valid = Boolean(
    cfg.apiKey &&
    cfg.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    cfg.apiKey !== 'AIzaSy...' &&
    cfg.projectId &&
    cfg.projectId !== 'your-project-id'
  );

  if (valid) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(cfg);
      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      isFirebaseConfigured = true;
      return true;
    } catch (e) {
      console.warn('Firebase initialization error:', e);
      isFirebaseConfigured = false;
      return false;
    }
  }

  isFirebaseConfigured = false;
  return false;
}

// Initial bootstrap
initializeFirebaseInstance();

/**
 * Save configuration to localStorage and re-initialize Firebase
 */
export function saveStoredFirebaseConfig(config: FirebaseConfigValues): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    const ok = initializeFirebaseInstance();
    notifyListeners();
    return ok;
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
    return false;
  }
}

/**
 * Clear configuration from localStorage and restore default
 */
export function clearStoredFirebaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    initializeFirebaseInstance();
    notifyListeners();
  } catch (e) {
    console.warn('Failed to clear config:', e);
  }
}

export function checkFirebaseConfigured(): boolean {
  return isFirebaseConfigured;
}

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
  // Ensure instance is initialized
  initializeFirebaseInstance();

  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not configured yet. Connect your Firebase credentials to enable Google Sign-In.');
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
  initializeFirebaseInstance();
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
  initializeFirebaseInstance();
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
  initializeFirebaseInstance();
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
