/**
 * CRYPTORA Firebase Integration Service
 * Configures Firebase Authentication & Cloud Firestore with seamless environment variable fallback
 * and dynamic in-app configuration support.
 *
 * Strict Security Rules:
 * - Rejects Google Cloud Service Account Private Keys.
 * - Validates API Key, Project ID, and required Web App fields.
 * - Prevents duplicate Firebase app initialization.
 * - Zero-knowledge client isolation: No passwords, encryption keys, or plaintexts are ever sent to Firestore.
 */

import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from 'firebase/app';
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
  browserLocalPersistence,
  setPersistence,
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

export interface ConfigValidationResult {
  valid: boolean;
  error?: string;
  config?: FirebaseConfigValues;
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
 * Validates a Firebase configuration object against frontend security standards
 */
export function validateFirebaseConfig(config: Partial<FirebaseConfigValues>): ConfigValidationResult {
  if (!config) {
    return { valid: false, error: 'Configuration object is missing.' };
  }

  const apiKey = (config.apiKey || '').trim();
  const projectId = (config.projectId || '').trim();
  const authDomain = (config.authDomain || '').trim();
  const appId = (config.appId || '').trim();

  // 1. Critical Security Check: Detect accidental Service Account / Private Key input
  const stringified = JSON.stringify(config).toLowerCase();
  if (
    stringified.includes('private_key') ||
    stringified.includes('service_account') ||
    stringified.includes('client_email') ||
    stringified.includes('token_uri')
  ) {
    return {
      valid: false,
      error:
        'SECURITY ALERT: You entered a Google Cloud Service Account Private Key! Service account keys must NEVER be exposed in client-side web applications. Please provide your Web App configuration from Firebase Console > Project Settings > General > Your apps.',
    };
  }

  // 2. Validate API Key
  if (!apiKey) {
    return { valid: false, error: 'Firebase Web API Key is required.' };
  }
  if (apiKey === 'YOUR_FIREBASE_API_KEY' || apiKey === 'AIzaSy...' || apiKey.includes('YOUR_')) {
    return { valid: false, error: 'Please replace placeholder API Key with your real Firebase Web API Key.' };
  }
  if (apiKey.length < 15) {
    return { valid: false, error: 'Invalid Firebase Web API Key format (too short).' };
  }

  // 3. Validate Project ID
  if (!projectId) {
    return { valid: false, error: 'Firebase Project ID is required.' };
  }
  if (projectId === 'your-project-id' || projectId.includes('YOUR_') || projectId.includes(' ')) {
    return { valid: false, error: 'Please enter a valid Firebase Project ID (no spaces or placeholders).' };
  }

  // 4. Resolve authDomain if missing
  const resolvedAuthDomain = authDomain || `${projectId}.firebaseapp.com`;

  return {
    valid: true,
    config: {
      apiKey,
      authDomain: resolvedAuthDomain,
      projectId,
      storageBucket: (config.storageBucket || `${projectId}.firebasestorage.app`).trim(),
      messagingSenderId: (config.messagingSenderId || '').trim(),
      appId,
    },
  };
}

/**
 * Parses user-pasted Firebase config strings (JSON or JavaScript snippet)
 */
export function parseFirebaseConfig(raw: string): ConfigValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'Please enter or paste your Firebase configuration.' };
  }

  const trimmed = raw.trim();

  // Guard against service account private key in raw text
  if (
    trimmed.includes('private_key') ||
    trimmed.includes('service_account') ||
    trimmed.includes('BEGIN PRIVATE KEY') ||
    trimmed.includes('client_email')
  ) {
    return {
      valid: false,
      error:
        'SECURITY ALERT: You pasted a Google Cloud Service Account Private Key! Service account keys must NEVER be exposed in client-side applications. Please use your Web App Client Configuration from Firebase Console > Project Settings > General > Your apps.',
    };
  }

  // 1. Try JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      return validateFirebaseConfig(parsed);
    }
  } catch {
    // Continue to regex extractor
  }

  // 2. Extract via regex for JS snippet: const firebaseConfig = { ... }
  const extract = (key: string): string => {
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

  if (!apiKey && !projectId) {
    return {
      valid: false,
      error:
        'Could not find valid apiKey and projectId in snippet. Paste standard Firebase Web App configuration object.',
    };
  }

  return validateFirebaseConfig({
    apiKey,
    projectId,
    authDomain,
    storageBucket,
    messagingSenderId,
    appId,
  });
}

/**
 * Retrieve stored configuration from localStorage if present
 */
export function getStoredFirebaseConfig(): FirebaseConfigValues | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validated = validateFirebaseConfig(parsed);
    if (validated.valid && validated.config) {
      return validated.config;
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
  if (stored) {
    return stored;
  }
  return {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
    appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
  };
}

export let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let googleProvider: GoogleAuthProvider | null = null;
export let isFirebaseConfigured = false;

/**
 * Initializes or cleanly re-initializes Firebase instances
 */
export function initializeFirebaseInstance(): boolean {
  const cfg = getActiveFirebaseConfig();
  const validation = validateFirebaseConfig(cfg);

  if (validation.valid && validation.config) {
    try {
      if (getApps().length > 0) {
        app = getApp();
      } else {
        app = initializeApp(validation.config);
      }
      auth = getAuth(app);
      // Ensure persistence
      setPersistence(auth, browserLocalPersistence).catch(() => {});
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
 * Save configuration to localStorage, cleanly dispose old app if needed, and re-initialize
 */
export async function saveStoredFirebaseConfig(config: FirebaseConfigValues): Promise<boolean> {
  const validation = validateFirebaseConfig(config);
  if (!validation.valid || !validation.config) {
    throw new Error(validation.error || 'Invalid configuration');
  }

  try {
    // If an app was previously initialized, delete it to prevent duplicate app errors
    if (app && getApps().length > 0) {
      try {
        await deleteApp(app);
      } catch (e) {
        console.warn('Notice disposing previous app:', e);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validation.config));
    app = initializeApp(validation.config);
    auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence).catch(() => {});
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    isFirebaseConfigured = true;

    notifyListeners();
    return true;
  } catch (e: any) {
    console.error('Failed to save & initialize Firebase config:', e);
    isFirebaseConfigured = false;
    throw new Error(e.message || 'Firebase initialization failed with provided credentials.');
  }
}

/**
 * Clear configuration from localStorage and restore default
 */
export async function clearStoredFirebaseConfig(): Promise<void> {
  try {
    if (app && getApps().length > 0) {
      try {
        await deleteApp(app);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    app = null;
    auth = null;
    db = null;
    googleProvider = null;
    isFirebaseConfigured = false;
    initializeFirebaseInstance();
    notifyListeners();
  } catch (e) {
    console.warn('Failed to clear config:', e);
  }
}

export function checkFirebaseConfigured(): boolean {
  if (!isFirebaseConfigured) {
    return initializeFirebaseInstance();
  }
  return true;
}

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: number;
  lastLoginAt: number;
  authProvider: string;
}

/**
 * User-friendly mapping for Firebase error codes
 */
export function mapFirebaseAuthError(error: any): string {
  if (!error) return 'Authentication failed. Please try again.';
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in or use password reset.';
    case 'auth/invalid-email':
      return 'The email address format is invalid. Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters with letters, numbers, and symbols.';
    case 'auth/user-not-found':
      return 'No CRYPTORA account was found with this email. Please check your spelling or register.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials or reset your password.';
    case 'auth/popup-closed-by-user':
      return 'The Google Sign-In popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'The authentication popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return `This domain (${typeof window !== 'undefined' ? window.location.hostname : 'current domain'}) is not authorized in Firebase Console. Go to Firebase Console > Authentication > Settings > Authorized domains to add it.`;
    case 'auth/network-request-failed':
      return 'Network communication error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Access temporarily locked for security. Please try again later or reset password.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in your Firebase Console. Please enable Email/Password or Google under Authentication > Sign-in method.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please log in again before retrying.';
    default:
      if (message.includes('API key not valid')) {
        return 'The Firebase API Key provided is invalid. Please verify your Firebase project settings.';
      }
      return message || 'Authentication failed. Please verify credentials.';
  }
}

/**
 * Sync user profile to Firestore safely (Zero-Knowledge: Never stores passwords or cryptographic keys)
 */
export async function syncUserProfileToFirestore(
  user: FirebaseUser,
  displayName?: string,
  authProvider: string = 'google.com'
): Promise<void> {
  if (!db || !user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    const now = Date.now();

    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: displayName || user.displayName || 'Cryptora User',
        email: user.email || '',
        photoURL: user.photoURL || '',
        createdAt: now,
        lastLoginAt: now,
        authProvider,
      });
    } else {
      await setDoc(
        userRef,
        {
          displayName: displayName || user.displayName || existing.data()?.displayName || 'Cryptora User',
          lastLoginAt: now,
        },
        { merge: true }
      );
    }
  } catch (e) {
    console.warn('Could not sync user profile to Firestore:', e);
  }
}

/**
 * Sign In with Google via Firebase Popup
 */
export async function signInWithGoogleFirebase(): Promise<FirebaseUser> {
  initializeFirebaseInstance();

  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not configured yet. Connect your Firebase credentials to enable Google Sign-In.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await syncUserProfileToFirestore(user, user.displayName || undefined, 'google.com');
    return user;
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }
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

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      await syncUserProfileToFirestore(cred.user, name, 'password');
    }
    return cred.user;
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Login with Email and Password
 */
export async function loginWithEmailFirebase(email: string, pass: string): Promise<FirebaseUser> {
  initializeFirebaseInstance();
  if (!auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await syncUserProfileToFirestore(cred.user, cred.user.displayName || undefined, 'password');
    }
    return cred.user;
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Send Password Reset Email
 */
export async function resetPasswordFirebase(email: string): Promise<void> {
  initializeFirebaseInstance();
  if (!auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Sign out user
 */
export async function signOutFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}
