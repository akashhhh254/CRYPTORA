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
  signInWithGoogle: () => Promise<'redirect_initiated' | 'success'>;
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

  // 1. Check for Mobile Google Redirect result on initialization
  useEffect(() => {
    let mounted = true;

    async function checkRedirect() {
      if (!isFirebaseConfigured || !auth) return;
      try {
        const redirectedUser = await handleGoogleRedirectResult();
        if (redirectedUser && mounted) {
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
        }
      } catch (e) {
        console.warn('Error processing Google redirect result:', e);
      }
    }

    checkRedirect();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Subscribe to Firebase Auth State changes
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;

    if (auth && isFirebaseConfigured) {
      unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          setFirebaseUser(fbUser);
          const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');

          // Strict Security Rule: Unverified email/password users are not granted protected sessions
          if (!fbUser.emailVerified && !isGoogle) {
            setEmailVerificationPending(true);
            setUnverifiedUser(fbUser);
            setSession(null);
            logoutUser();
            setLoading(false);
            return;
          }

          // Verified User (Google or Email verified)
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
          } catch (e) {
            console.warn('Could not establish user session:', e);
          }
        } else {
          setFirebaseUser(null);
          setSession(null);
          logoutUser();
          setEmailVerificationPending(false);
          setUnverifiedUser(null);
        }
        setLoading(false);
      });
    } else {
      // Firebase not yet configured
      setLoading(false);
    }

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // Actions
  const signInWithGoogle = async (): Promise<'redirect_initiated' | 'success'> => {
    const result = await signInWithGoogleFirebase();
    if (result === 'redirect_initiated') {
      return 'redirect_initiated';
    }

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
    setFirebaseUser(result);
    setSession(newSession);
    saveSession(newSession);
    setEmailVerificationPending(false);
    setUnverifiedUser(null);
    return 'success';
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ isVerified: boolean }> => {
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
    return { isVerified: true };
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ emailVerificationSent: boolean }> => {
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
    await resetPasswordFirebase(email);
  };

  const logout = async (): Promise<void> => {
    await signOutFirebase();
    logoutUser();
    setFirebaseUser(null);
    setSession(null);
    setEmailVerificationPending(false);
    setUnverifiedUser(null);
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
