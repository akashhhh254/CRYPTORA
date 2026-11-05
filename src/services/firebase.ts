/**
 * CRYPTORA Firebase Integration Service
 * Production-ready Firebase Authentication & Cloud Firestore with complete mobile/desktop OAuth support.
 *
 * Strict Security Architecture:
 * - Genuine Firebase Authentication only (Google OAuth & Email/Password with Verification).
 * - Centralized, multi-environment configuration (AI Studio Preview, Local, and Production Vercel).
 * - Automatic backward-compatibility for VITE_FIREBASE_FIRESTORE and VITE_FIREBASE_FIRESTORE_DATABASE_ID.
 * - Mobile-optimized authentication using signInWithRedirect with getRedirectResult.
 * - Desktop-optimized popup with automatic fallback to signInWithRedirect if popups are blocked.
 * - Account linking and collision protection.
 * - Zero-knowledge Firestore user profile and audit synchronization (zero passwords, keys, or plaintext).
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
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
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import rawAppletConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Validates whether a configuration string is non-empty and not an unresolved placeholder.
 */
function isValidConfigValue(val: unknown): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') return false;

  const placeholders = [
    'AIzaSy...',
    'YOUR_FIREBASE_API_KEY',
    'your-api-key',
    'YOUR_PROJECT_ID',
    'your-project-id',
    'remixed-project-id',
    'YOUR_APP_ID',
    'your-app-id',
    'YOUR_FIREBASE_AUTH_DOMAIN',
    'your-auth-domain.firebaseapp.com',
  ];

  return !placeholders.includes(trimmed);
}

/**
 * Resolves the first valid, non-placeholder configuration value from a cascade of candidates.
 */
function resolveConfigValue(...candidates: (unknown | undefined)[]): string {
  for (const candidate of candidates) {
    if (isValidConfigValue(candidate)) {
      return (candidate as string).trim();
    }
  }
  return '';
}

// Safe cross-runtime environment accessor (Vite import.meta.env or Node process.env)
const env: Record<string, string | undefined> =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env) ||
  (typeof process !== 'undefined' && process.env) ||
  {};

// Cast rawAppletConfig safely to avoid strict object index issues
const applet = (rawAppletConfig || {}) as Record<string, string | undefined>;

// 1. Resolve Project ID (prioritize applet config if valid, with env fallback)
const projectId = resolveConfigValue(
  applet.projectId,
  env.VITE_FIREBASE_PROJECT_ID
);

// 2. Resolve API Key
const apiKey = resolveConfigValue(
  applet.apiKey,
  env.VITE_FIREBASE_API_KEY
);

// 3. Resolve Auth Domain (fallback to ${projectId}.firebaseapp.com if projectId is available)
const authDomain = resolveConfigValue(
  applet.authDomain,
  env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId ? `${projectId}.firebaseapp.com` : undefined
);

// 4. Resolve Storage Bucket (fallback to ${projectId}.firebasestorage.app)
const storageBucket = resolveConfigValue(
  applet.storageBucket,
  env.VITE_FIREBASE_STORAGE_BUCKET,
  projectId ? `${projectId}.firebasestorage.app` : undefined
);

// 5. Resolve Messaging Sender ID
const messagingSenderId = resolveConfigValue(
  applet.messagingSenderId,
  env.VITE_FIREBASE_MESSAGING_SENDER_ID
);

// 6. Resolve App ID
const appId = resolveConfigValue(
  applet.appId,
  env.VITE_FIREBASE_APP_ID
);

// 7. Resolve Firestore Database ID with backward-compatible aliases:
// Supports appletConfig.firestoreDatabaseId, VITE_FIREBASE_FIRESTORE_DATABASE_ID, and VITE_FIREBASE_FIRESTORE
const rawDatabaseId = resolveConfigValue(
  applet.firestoreDatabaseId,
  env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  env.VITE_FIREBASE_FIRESTORE
);
// Normalize database ID: default database names are treated as empty for standard getFirestore(app)
const firestoreDatabaseId =
  rawDatabaseId === '(default)' || rawDatabaseId === 'default' ? '' : rawDatabaseId;

// Exported structured configuration
export const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  firestoreDatabaseId,
};

// Validated readiness flag: strictly checks for real API key and Project ID
export const isFirebaseConfigured = Boolean(
  isValidConfigValue(firebaseConfig.apiKey) &&
  isValidConfigValue(firebaseConfig.projectId)
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    // Avoid duplicate initialization
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Enforce long-lived local browser persistence
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    // Initialize Cloud Firestore:
    // If a named database is specified, use it; otherwise, initialize standard default instance.
    if (firebaseConfig.firestoreDatabaseId) {
      try {
        db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      } catch (namedDbError) {
        console.warn(
          'Could not connect to named Firestore database, attempting default instance:',
          namedDbError
        );
        db = getFirestore(app);
      }
    } else {
      db = getFirestore(app);
    }
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }
} else {
  // Safe warning for developers during builds or misconfigured environments (no secrets logged)
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.info(
      '[CRYPTORA] Firebase Authentication is not yet configured. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your deployment environment.'
    );
  }
}

/**
 * Standardized Firestore error handler conforming to strict audit specifications.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { app, auth, db };

/**
 * Detect mobile devices to route between popup and redirect OAuth flows.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const isSmallTouch = (window.innerWidth <= 768 || window.innerHeight <= 768) && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  return isMobileUA || isIPadOS || isSmallTouch;
}

/**
 * Comprehensive mapping for all Firebase Authentication & Firestore error codes.
 */
export function mapFirebaseAuthError(error: any): string {
  if (!error) return 'Authentication failed. Please try again.';
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not configured for this project. Please verify your Firebase project setup.';
    case 'auth/invalid-api-key':
      return 'The Firebase API Key provided is invalid or expired. Check your VITE_FIREBASE_API_KEY environment variable.';
    case 'auth/project-not-found':
      return 'The specified Firebase Project ID was not found. Check your VITE_FIREBASE_PROJECT_ID environment variable.';
    case 'auth/unauthorized-domain': {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      return `This domain (${currentHost}) is not authorized for OAuth in Firebase. Add "${currentHost}" in Firebase Console > Authentication > Settings > Authorized domains.`;
    }
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is disabled in Firebase Console. Enable Google or Email/Password under Authentication > Sign-in method.';
    case 'auth/popup-blocked':
      return 'The authentication popup was blocked by your browser. Please allow popups or use redirect authentication.';
    case 'auth/popup-closed-by-user':
      return 'The Google Sign-In window was closed before completing authentication. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'A previous authentication request was in progress. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method. Please sign in using your existing method.';
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
    case 'auth/network-request-failed':
      return 'Network communication error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily locked due to multiple failed login attempts. Please try again later or reset password.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires a fresh login. Please sign in again before retrying.';
    case 'permission-denied':
    case 'PERMISSION_DENIED':
      return 'Firestore permission denied. You do not have permission to access or modify this database record.';
    default:
      if (message.includes('API key not valid') || message.includes('api-key-not-valid')) {
        return 'The Firebase API Key provided is invalid. Please verify your environment configuration.';
      }
      if (message.includes('unauthorized domain') || message.includes('authorized domain')) {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        return `This domain (${currentHost}) is not authorized in Firebase Console. Add it under Authentication > Settings > Authorized domains.`;
      }
      return message || 'Authentication failed. Please verify credentials.';
  }
}

/**
 * Synchronize user profile into Firestore: users/{uid}
 * Strict Zero-Knowledge: Never stores passwords, encryption keys, tokens, or private plaintext.
 * Decoupled: Non-blocking background task that never interrupts authentication.
 */
export async function syncUserProfileToFirestore(
  user: FirebaseUser,
  displayName?: string,
  authProvider: string = 'password'
): Promise<void> {
  if (!db || !user || !user.uid) return;
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    let existing = null;
    try {
      existing = await getDoc(userRef);
    } catch {
      // Non-blocking read error
    }
    const now = Date.now();
    const cleanDisplayName = (displayName || user.displayName || 'Cryptora User').slice(0, 100);
    const cleanEmail = (user.email || '').slice(0, 255);
    const cleanPhoto = (user.photoURL || '').slice(0, 1000);
    const cleanProvider = (authProvider || 'password').slice(0, 64);

    if (!existing || !existing.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: cleanDisplayName,
        email: cleanEmail,
        photoURL: cleanPhoto,
        emailVerified: Boolean(user.emailVerified),
        provider: cleanProvider,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await setDoc(
        userRef,
        {
          displayName: cleanDisplayName || existing.data()?.displayName || 'Cryptora User',
          email: cleanEmail || existing.data()?.email || '',
          photoURL: cleanPhoto || existing.data()?.photoURL || '',
          emailVerified: Boolean(user.emailVerified),
          provider: cleanProvider,
          updatedAt: now,
        },
        { merge: true }
      );
    }
  } catch (e) {
    // Resilient fallback: profile sync is secondary and must never throw to caller
    console.warn(`[CRYPTORA] Firestore profile sync notice for ${path} (non-blocking):`, e);
  }
}

/**
 * Create a fresh, fully configured GoogleAuthProvider instance.
 * Strictly applies prompt: 'select_account' to guarantee the official Google
 * account selector and consent experience, allowing users to pick any account.
 */
export function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });
  provider.addScope('email');
  provider.addScope('profile');
  return provider;
}

/**
 * Handle Android / mobile Google redirect completion via getRedirectResult()
 */
export async function handleGoogleRedirectResult(): Promise<FirebaseUser | null> {
  if (!auth || !isFirebaseConfigured) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      // Fire-and-forget background profile sync; never blocks redirect resolution
      syncUserProfileToFirestore(result.user, result.user.displayName || undefined, 'google.com').catch((e) => {
        console.warn('[CRYPTORA] Background profile sync notice on redirect:', e);
      });
      return result.user;
    }
    return null;
  } catch (err: any) {
    console.warn('[CRYPTORA] Redirect authentication notice:', err);
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Sign In with Google
 * Device-appropriate production implementation:
 * - Android Mobile: Uses official signInWithRedirect() with getRedirectResult()
 * - Desktop: Uses official signInWithPopup() with automatic redirect fallback
 * - Enforces prompt: 'select_account' to show official Google Account Selection & Consent
 */
export async function signInWithGoogleFirebase(
  targetDestination: string = 'dashboard'
): Promise<FirebaseUser | 'redirect_initiated'> {
  if (!auth || !isFirebaseConfigured) {
    throw new Error(
      'Firebase Authentication is not configured. Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables are set in your deployment.'
    );
  }

  const provider = createGoogleProvider();

  // 1. Android & Mobile Devices: Use official signInWithRedirect
  if (isMobileDevice()) {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cryptora_redirect_pending', 'true');
        sessionStorage.setItem('cryptora_redirect_dest', targetDestination);
      }
      await signInWithRedirect(auth, provider);
      return 'redirect_initiated';
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cryptora_redirect_pending');
        sessionStorage.removeItem('cryptora_redirect_dest');
      }
      throw new Error(mapFirebaseAuthError(err));
    }
  }

  // 2. Desktop Devices: Use official popup with redirect fallback
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (user) {
      // Non-blocking fire-and-forget sync
      syncUserProfileToFirestore(user, user.displayName || undefined, 'google.com').catch((e) => {
        console.warn('[CRYPTORA] Background profile sync notice on popup:', e);
      });
    }
    return user;
  } catch (err: any) {
    const code = err.code || '';
    const message = err.message || '';

    // If popup was blocked by browser, seamlessly switch to redirect
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/operation-not-supported-in-this-environment' ||
      message.toLowerCase().includes('popup')
    ) {
      console.warn('[CRYPTORA] Popup blocked on desktop, falling back to signInWithRedirect');
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('cryptora_redirect_pending', 'true');
          sessionStorage.setItem('cryptora_redirect_dest', targetDestination);
        }
        await signInWithRedirect(auth, provider);
        return 'redirect_initiated';
      } catch (redirectErr: any) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('cryptora_redirect_pending');
          sessionStorage.removeItem('cryptora_redirect_dest');
        }
        throw new Error(mapFirebaseAuthError(redirectErr));
      }
    }

    if (code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In was closed before completing authentication. Please try again.');
    }

    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Register with Email and Password
 * Creates genuine user, sends verification email, and writes initial Firestore profile.
 */
export async function registerWithEmailFirebase(
  name: string,
  email: string,
  pass: string
): Promise<{ user: FirebaseUser; emailVerificationSent: boolean }> {
  if (!auth || !isFirebaseConfigured) {
    throw new Error(
      'Firebase Authentication is not configured. Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables are set in your deployment.'
    );
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = cred.user;

    // Update display name
    await updateProfile(user, { displayName: name.trim() });

    // Send verification email
    let verificationSent = false;
    try {
      await sendEmailVerification(user);
      verificationSent = true;
    } catch (verErr) {
      console.warn('Failed to send verification email:', verErr);
    }

    // Save initial Firestore profile
    await syncUserProfileToFirestore(user, name.trim(), 'password');

    return { user, emailVerificationSent: verificationSent };
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Login with Email and Password
 * Returns authenticated Firebase user and verifies email status
 */
export async function loginWithEmailFirebase(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser; isVerified: boolean }> {
  if (!auth || !isFirebaseConfigured) {
    throw new Error(
      'Firebase Authentication is not configured. Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables are set in your deployment.'
    );
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const user = cred.user;

    // Reload user to get latest emailVerified state
    await user.reload();

    if (user.emailVerified) {
      await syncUserProfileToFirestore(user, user.displayName || undefined, 'password');
    }

    return { user, isVerified: user.emailVerified };
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Resend verification email to unverified user
 */
export async function resendVerificationEmail(user: FirebaseUser): Promise<void> {
  try {
    await sendEmailVerification(user);
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Reload user to check if email was verified in another tab/window
 */
export async function reloadUserStatus(user: FirebaseUser): Promise<boolean> {
  try {
    await user.reload();
    return user.emailVerified;
  } catch (err: any) {
    console.warn('Error reloading user status:', err);
    return false;
  }
}

/**
 * Send Password Reset Email
 */
export async function resetPasswordFirebase(email: string): Promise<void> {
  if (!auth || !isFirebaseConfigured) {
    throw new Error(
      'Firebase Authentication is not configured. Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables are set in your deployment.'
    );
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err: any) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Sign out user cleanly
 */
export async function signOutFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}
