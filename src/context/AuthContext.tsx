/**
 * CRYPTORA Authentication Context
 * Centralized state provider for Firebase Authentication, Firestore profile synchronization,
 * and unified session management across all routes.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  checkFirebaseConfigured,
  getActiveFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
  signInWithGoogleFirebase,
  registerWithEmailFirebase,
  loginWithEmailFirebase,
  resetPasswordFirebase,
  signOutFirebase,
  onFirebaseConfigChange,
  FirebaseConfigValues,
} from '../services/firebase';
import { AuthSession } from '../types/crypto';
import {
  getCurrentSession,
  saveSession,
  logoutUser as logoutLocalUser,
  loginUser as loginLocalUser,
  registerUser as registerLocalUser,
} from '../services/authService';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  session: AuthSession | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  firebaseConfig: FirebaseConfigValues;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  saveConfig: (config: FirebaseConfigValues) => Promise<boolean>;
  disconnectConfig: () => Promise<void>;
  updateSessionName: (newName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(() => getCurrentSession());
  const [loading, setLoading] = useState<boolean>(true);
  const [configured, setConfigured] = useState<boolean>(() => checkFirebaseConfigured());
  const [currentConfig, setCurrentConfig] = useState<FirebaseConfigValues>(() => getActiveFirebaseConfig());

  // Listen to dynamic config changes
  useEffect(() => {
    const unsubConfig = onFirebaseConfigChange(() => {
      setConfigured(checkFirebaseConfigured());
      setCurrentConfig(getActiveFirebaseConfig());
    });
    return unsubConfig;
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;

    if (auth && checkFirebaseConfigured()) {
      unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          setFirebaseUser(fbUser);
          try {
            const token = await fbUser.getIdToken();
            const providerId = fbUser.providerData[0]?.providerId || 'firebase';
            const authProvider = providerId === 'google.com' ? 'Google' : 'Firebase Email';

            const newSession: AuthSession = {
              user: {
                id: fbUser.uid,
                email: fbUser.email || '',
                name: fbUser.displayName || 'Cryptora User',
                photoURL: fbUser.photoURL || undefined,
                provider: authProvider,
              },
              token,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            };
            setSession(newSession);
            saveSession(newSession);
          } catch (e) {
            console.warn('Error constructing auth session from Firebase user:', e);
          }
        } else {
          setFirebaseUser(null);
          // Only clear session if currently set to Firebase provider
          const active = getCurrentSession();
          if (active && (active.user.provider === 'Google' || active.user.provider === 'Firebase Email')) {
            setSession(null);
            logoutLocalUser();
          }
        }
        setLoading(false);
      });
    } else {
      // If Firebase not configured, check local stored session
      const active = getCurrentSession();
      if (active) {
        setSession(active);
      }
      setLoading(false);
    }

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, [configured]);

  // Actions
  const signInWithGoogle = async () => {
    const fbUser = await signInWithGoogleFirebase();
    setFirebaseUser(fbUser);
    const token = await fbUser.getIdToken();
    const newSession: AuthSession = {
      user: {
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || 'Google User',
        photoURL: fbUser.photoURL || undefined,
        provider: 'Google',
      },
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    setSession(newSession);
    saveSession(newSession);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (checkFirebaseConfigured()) {
      const fbUser = await loginWithEmailFirebase(email, pass);
      setFirebaseUser(fbUser);
      const token = await fbUser.getIdToken();
      const newSession: AuthSession = {
        user: {
          id: fbUser.uid,
          email: fbUser.email || email,
          name: fbUser.displayName || 'Cryptora User',
          photoURL: fbUser.photoURL || undefined,
          provider: 'Firebase Email',
        },
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      setSession(newSession);
      saveSession(newSession);
    } else {
      // Fallback to local PBKDF2 account
      const localSession = await loginLocalUser(email, pass);
      setSession(localSession);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    if (checkFirebaseConfigured()) {
      const fbUser = await registerWithEmailFirebase(name, email, pass);
      setFirebaseUser(fbUser);
      const token = await fbUser.getIdToken();
      const newSession: AuthSession = {
        user: {
          id: fbUser.uid,
          email: fbUser.email || email,
          name: fbUser.displayName || name,
          provider: 'Firebase Email',
        },
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      setSession(newSession);
      saveSession(newSession);
    } else {
      const localSession = await registerLocalUser(name, email, pass);
      setSession(localSession);
    }
  };

  const resetPassword = async (email: string) => {
    if (checkFirebaseConfigured()) {
      await resetPasswordFirebase(email);
    }
  };

  const logout = async () => {
    if (checkFirebaseConfigured()) {
      await signOutFirebase();
    }
    logoutLocalUser();
    setFirebaseUser(null);
    setSession(null);
  };

  const saveConfig = async (config: FirebaseConfigValues): Promise<boolean> => {
    const success = await saveStoredFirebaseConfig(config);
    if (success) {
      setConfigured(true);
      setCurrentConfig(getActiveFirebaseConfig());
    }
    return success;
  };

  const disconnectConfig = async () => {
    await clearStoredFirebaseConfig();
    setConfigured(false);
    setCurrentConfig(getActiveFirebaseConfig());
  };

  const updateSessionName = (newName: string) => {
    if (session) {
      const updated: AuthSession = {
        ...session,
        user: {
          ...session.user,
          name: newName,
        },
      };
      setSession(updated);
      saveSession(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        session,
        loading,
        isFirebaseConfigured: configured,
        firebaseConfig: currentConfig,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        saveConfig,
        disconnectConfig,
        updateSessionName,
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
