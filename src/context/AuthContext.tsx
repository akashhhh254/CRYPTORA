/**
 * CRYPTORA Authentication Context
 * Production state management for verified Firebase users, Google OAuth redirects,
 * email verification lifecycle, and protected workspace sessions.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, updateProfile } from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  signInWithGoogleFirebase,
  handleGoogleRedirectResult,
  registerWithEmailFirebase,
  loginWithEmailFirebase,
  resendVerificationEmail,
  reloadUserStatus,
  resetPasswordFirebase,
  signOutFirebase,
  syncUserProfileToFirestore,
  logAuthDebug,
} from '../services/firebase';
import { AuthSession } from '../types/crypto';
import {
  getCurrentSession,
  saveSession,
  logoutUser,
} from '../services/authService';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  session: AuthSession | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  emailVerificationPending: boolean;
  unverifiedUser: FirebaseUser | null;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: (targetDestination?: string) => Promise<'redirect_initiated' | 'success'>;
  loginWithEmail: (email: string, pass: string) => Promise<{ isVerified: boolean }>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<{ emailVerificationSent: boolean }>;
  resendVerification: () => Promise<void>;
  checkVerification: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSessionName: (newName: string) => Promise<void>;
  dismissVerificationNotice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(() => getCurrentSession());
  const [loading, setLoading] = useState<boolean>(true);
  const [emailVerificationPending, setEmailVerificationPending] = useState<boolean>(false);
  const [unverifiedUser, setUnverifiedUser] = useState<FirebaseUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Unified Firebase Authentication Lifecycle & Multi-Device Session Processor
  useEffect(() => {
    let mounted = true;
    let unsubAuth: (() => void) | undefined;

    async function initializeAuth() {
      if (!isFirebaseConfigured || !auth) {
        if (mounted) setLoading(false);
        return;
      }

      logAuthDebug('Authentication initialization started.');

      // 1. Process getRedirectResult FIRST on cold boot before concluding unauthenticated state
      let redirectedUser: FirebaseUser | null = null;
      try {
        logAuthDebug('Redirect processing started.');
        redirectedUser = await handleGoogleRedirectResult();
      } catch (redirectErr: any) {
        logAuthDebug('Authentication error occurred during redirect resolution:', redirectErr);
        if (mounted) {
          setAuthError(redirectErr.message || 'Google Authentication failed. Please try again.');
        }
      }

      // Check stored target destination (from both localStorage and sessionStorage)
      const destination =
        (typeof window !== 'undefined' &&
          (localStorage.getItem('cryptora_redirect_dest') ||
            sessionStorage.getItem('cryptora_redirect_dest'))) ||
        'dashboard';

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cryptora_redirect_pending');
        sessionStorage.removeItem('cryptora_redirect_dest');
        localStorage.removeItem('cryptora_redirect_pending');
        localStorage.removeItem('cryptora_redirect_dest');
      }

      // If redirect returned a valid user, immediately establish session and navigate to dashboard!
      if (redirectedUser && mounted) {
        logAuthDebug('Redirect result received.', { uid: redirectedUser.uid });
        logAuthDebug(`Firebase UID received: ${redirectedUser.uid}`);
        try {
          const token = await redirectedUser.getIdToken();
          const newSession: AuthSession = {
            user: {
              id: redirectedUser.uid,
              email: redirectedUser.email || '',
              name: redirectedUser.displayName || 'Cryptora User',
              photoURL: redirectedUser.photoURL || undefined,
              provider: 'Google',
            },
            token,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          };

          saveSession(newSession);
          setSession(newSession);
          setFirebaseUser(redirectedUser);
          setEmailVerificationPending(false);
          setUnverifiedUser(null);
          setAuthError(null);
          setLoading(false);
          logAuthDebug('Authentication state updated (from redirect).');
          logAuthDebug(`Dashboard navigation started: #${destination}`);
          window.location.hash = `#/${destination}`;
          return;
        } catch (tokenErr) {
          console.warn('[CRYPTORA] Failed to extract token from redirected user:', tokenErr);
        }
      }

      // 2. Subscribe to Firebase Auth State Changes as persistent source of truth
      unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
        if (!mounted) return;
        logAuthDebug('Authentication callback triggered.', { hasUser: Boolean(fbUser) });

        if (fbUser) {
          logAuthDebug(`Firebase UID received: ${fbUser.uid}`);
          setFirebaseUser(fbUser);
          const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');

          // Strict Security Rule: Unverified email/password users are not granted protected sessions
          if (!fbUser.emailVerified && !isGoogle) {
            setEmailVerificationPending(true);
            setUnverifiedUser(fbUser);
            setSession(null);
            logoutUser();
            setLoading(false);
            logAuthDebug('Email verification pending; session withheld.');
            return;
          }

          // Verified User (Google OAuth or Verified Email)
          try {
            const token = await fbUser.getIdToken();
            const providerName = isGoogle ? 'Google' : 'Firebase Email';

            const newSession: AuthSession = {
              user: {
                id: fbUser.uid,
                email: fbUser.email || '',
                name: fbUser.displayName || 'Cryptora User',
                photoURL: fbUser.photoURL || undefined,
                provider: providerName,
              },
              token,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            };

            setEmailVerificationPending(false);
            setUnverifiedUser(null);
            setSession(newSession);
            saveSession(newSession);
            logAuthDebug('Authentication state updated.');
          } catch (e) {
            console.warn('[CRYPTORA] Could not establish user session from auth state:', e);
          }
        } else {
          setFirebaseUser(null);
          setSession(null);
          logoutUser();
          setEmailVerificationPending(false);
          setUnverifiedUser(null);
          logAuthDebug('Unauthenticated state confirmed.');
        }

        setLoading(false);
      });
    }

    initializeAuth();

    return () => {
      mounted = false;
      if (unsubAuth) unsubAuth();
    };
  }, []);

  const signInWithGoogle = async (targetDestination: string = 'dashboard'): Promise<'redirect_initiated' | 'success'> => {
    setAuthError(null);
    logAuthDebug('Google authentication requested by user.', { targetDestination });
    const result = await signInWithGoogleFirebase(targetDestination);
    if (result === 'redirect_initiated') {
      logAuthDebug('Google OAuth redirect initiated.');
      return 'redirect_initiated';
    }

    logAuthDebug('Google OAuth popup credential obtained.');
    const token = await result.getIdToken();
    const newSession: AuthSession = {
      user: {
        id: result.uid,
        email: result.email || '',
        name: result.displayName || 'Google User',
        photoURL: result.photoURL || undefined,
        provider: 'Google',
      },
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    logAuthDebug(`Firebase UID received: ${result.uid}`);
    setFirebaseUser(result);
    setSession(newSession);
    saveSession(newSession);
    setEmailVerificationPending(false);
    setUnverifiedUser(null);
    setAuthError(null);
    logAuthDebug('Authentication state updated (popup).');
    logAuthDebug(`Dashboard navigation started: #${targetDestination}`);
    window.location.hash = `#/${targetDestination}`;
    return 'success';
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ isVerified: boolean }> => {
    setAuthError(null);
    const { user, isVerified } = await loginWithEmailFirebase(email, pass);
    setFirebaseUser(user);

    if (!isVerified) {
      setEmailVerificationPending(true);
      setUnverifiedUser(user);
      setSession(null);
      logoutUser();
      return { isVerified: false };
    }

    const token = await user.getIdToken();
    const newSession: AuthSession = {
      user: {
        id: user.uid,
        email: user.email || email,
        name: user.displayName || 'Cryptora User',
        photoURL: user.photoURL || undefined,
        provider: 'Firebase Email',
      },
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    setEmailVerificationPending(false);
    setUnverifiedUser(null);
    setSession(newSession);
    saveSession(newSession);
    setAuthError(null);
    return { isVerified: true };
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ emailVerificationSent: boolean }> => {
    setAuthError(null);
    const { user, emailVerificationSent } = await registerWithEmailFirebase(name, email, pass);
    setFirebaseUser(user);
    // User is created but must verify email before access to protected features
    setEmailVerificationPending(true);
    setUnverifiedUser(user);
    setSession(null);
    logoutUser();
    return { emailVerificationSent };
  };

  const resendVerification = async (): Promise<void> => {
    const targetUser = unverifiedUser || firebaseUser;
    if (targetUser) {
      await resendVerificationEmail(targetUser);
    } else {
      throw new Error('No user account pending verification.');
    }
  };

  const checkVerification = async (): Promise<boolean> => {
    const targetUser = unverifiedUser || firebaseUser;
    if (!targetUser) return false;

    const isVerified = await reloadUserStatus(targetUser);
    if (isVerified) {
      const token = await targetUser.getIdToken();
      const newSession: AuthSession = {
        user: {
          id: targetUser.uid,
          email: targetUser.email || '',
          name: targetUser.displayName || 'Cryptora User',
          photoURL: targetUser.photoURL || undefined,
          provider: 'Firebase Email',
        },
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      setEmailVerificationPending(false);
      setUnverifiedUser(null);
      setSession(newSession);
      saveSession(newSession);
      await syncUserProfileToFirestore(targetUser, targetUser.displayName || undefined, 'password');
      return true;
    }
    return false;
  };

  const resetPassword = async (email: string): Promise<void> => {
    setAuthError(null);
    await resetPasswordFirebase(email);
  };

  const logout = async (): Promise<void> => {
    await signOutFirebase();
    logoutUser();
    setFirebaseUser(null);
    setSession(null);
    setEmailVerificationPending(false);
    setUnverifiedUser(null);
    setAuthError(null);
  };

  const updateSessionName = async (newName: string): Promise<void> => {
    const clean = newName.trim();
    if (!clean) return;

    if (firebaseUser) {
      await updateProfile(firebaseUser, { displayName: clean });
      await syncUserProfileToFirestore(firebaseUser, clean, session?.user.provider || 'password');
    }

    if (session) {
      const updated: AuthSession = {
        ...session,
        user: {
          ...session.user,
          name: clean,
        },
      };
      setSession(updated);
      saveSession(updated);
    }
  };

  const dismissVerificationNotice = () => {
    setEmailVerificationPending(false);
    setUnverifiedUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        session,
        loading,
        isFirebaseConfigured,
        emailVerificationPending,
        unverifiedUser,
        authError,
        clearAuthError,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resendVerification,
        checkVerification,
        resetPassword,
        logout,
        updateSessionName,
        dismissVerificationNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
