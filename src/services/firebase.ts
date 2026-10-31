/**
 * CRYPTORA Firebase Integration Service
 * Production Firebase Authentication & Cloud Firestore with complete mobile/desktop OAuth support.
 *
 * Strict Security Architecture:
 * - Genuine Firebase Authentication only (Google OAuth & Email/Password with Verification).
 * - No demo accounts, mock profiles, or login bypasses.
 * - Mobile-optimized authentication using signInWithRedirect with getRedirectResult.
 * - Desktop-optimized popup with automatic redirect fallback if popups are blocked.
 * - Account linking detection to prevent duplicate user identities.
 * - Zero-knowledge Firestore profile and audit synchronization (Zero passwords/keys).
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
  linkWithCredential,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';

// Environment configurations strictly from import.meta.env
export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
};

// Check if Firebase environment variables are actively configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'AIzaSy...' &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your-project-id'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Enforce long-lived local browser persistence
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    db = getFirestore(app);

    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }
}

export { app, auth, db, googleProvider };

/**
 * Mobile device detector to choose between popup and redirect authentication
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && 'ontouchstart' in window)
  );
}

/**
 * User-friendly mapping for all Firebase Authentication error codes
 */
export function mapFirebaseAuthError(error: any): string {
  if (!error) return 'Authentication failed. Please try again.';
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method (Email/Password). Please sign in using your existing method.';
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
      return 'The authentication popup was blocked by your browser. Please allow popups or use redirect login.';
    case 'auth/cancelled-popup-request':
      return 'Another authentication request was initiated before the previous one finished.';
    case 'auth/unauthorized-domain':
      return `This domain (${typeof window !== 'undefined' ? window.location.hostname : 'current domain'}) is not authorized in Firebase Console. Add it under Authentication > Settings > Authorized domains.`;
    case 'auth/network-request-failed':
      return 'Network communication error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Access temporarily locked for security. Please try again later or reset password.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Console. Enable Google or Email/Password under Authentication > Sign-in method.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please sign in again before retrying.';
    default:
      if (message.includes('API key not valid')) {
        return 'The Firebase API Key provided is invalid. Please verify your environment configuration.';
      }
      return message || 'Authentication failed. Please verify credentials.';
  }
}

/**
 * Synchronize user profile into Firestore: users/{uid}
 * Strict Zero-Knowledge: Never stores passwords, encryption keys, or private plaintext.
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
        emailVerified: Boolean(user.emailVerified),
        provider: authProvider,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await setDoc(
        userRef,
        {
          displayName: displayName || user.displayName || existing.data()?.displayName || 'Cryptora User',
          email: user.email || existing.data()?.email || '',
          photoURL: user.photoURL || existing.data()?.photoURL || '',
          emailVerified: Boolean(user.emailVerified),
          provider: authProvider,
          updatedAt: now,
        },
        { merge: true }
      );
    }
  } catch (e) {
    console.warn('Could not sync user profile to Firestore:', e);
  }
}

/**
 * Handle mobile Google redirect completion via getRedirectResult()
 */
export async function handleGoogleRedirectResult(): Promise<FirebaseUser | null> {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await syncUserProfileToFirestore(result.user, result.user.displayName || undefined, 'google.com');
      return result.user;
    }
    return null;
  } catch (err: any) {
    console.warn('Redirect authentication notice:', err);
    throw new Error(mapFirebaseAuthError(err));
  }
}

/**
 * Sign In with Google
 * Uses signInWithRedirect on mobile devices (Android/iOS) and signInWithPopup on desktop
 * with automatic fallback if popups are blocked.
 */
export async function signInWithGoogleFirebase(): Promise<FirebaseUser | 'redirect_initiated'> {
  if (!auth || !googleProvider) {
    throw new Error(
      'Firebase Authentication is not configured. Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables are set in your deployment.'
    );
  }

  // 1. Mobile devices: Use redirect to prevent blank popup and navigation issues on Android/iOS
  if (isMobileDevice()) {
    try {
      await signInWithRedirect(auth, googleProvider);
      return 'redirect_initiated';
    } catch (err: any) {
      throw new Error(mapFirebaseAuthError(err));
    }
  }

  // 2. Desktop devices: Use popup with fallback to redirect if blocked
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await syncUserProfileToFirestore(user, user.displayName || undefined, 'google.com');
    return user;
  } catch (err: any) {
    if (err.code === 'auth/popup-blocked') {
      // Fallback to redirect
      await signInWithRedirect(auth, googleProvider);
      return 'redirect_initiated';
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
  if (!auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
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
  if (!auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
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
  if (!auth) {
    throw new Error('Firebase Authentication is not configured in this environment.');
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
