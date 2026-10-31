/**
 * CRYPTORA - Full-Stack Cybersecurity & Cryptography Platform
 * Main Application Shell & Master Routing Controller
 * Features 3-second splash screen, protected route isolation, and complete navigation.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SplashScreen } from './components/common/SplashScreen';
import { LandingView } from './components/landing/LandingView';
import { DashboardView } from './components/dashboard/DashboardView';
import { TextEncryptModule } from './components/encryption/TextEncryptModule';
import { TextDecryptModule } from './components/decryption/TextDecryptModule';
import { EncryptModule } from './components/encryption/EncryptModule';
import { DecryptModule } from './components/decryption/DecryptModule';
import { AlgorithmsView } from './components/algorithms/AlgorithmsView';
import { HistoryView } from './components/history/HistoryView';
import { PasswordGenerator } from './components/tools/PasswordGenerator';
import { SecurityView } from './components/security/SecurityView';
import { AboutView } from './components/about/AboutView';
import { DocsView } from './components/docs/DocsView';
import { PrivacyView } from './components/legal/PrivacyView';
import { TermsView } from './components/legal/TermsView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';
import { NotFoundView } from './components/common/NotFoundView';
import { AuthModal } from './components/auth/AuthModal';
import { AuthSession } from './types/crypto';
import {
  getCurrentSession,
  initializeDefaultAccounts,
  logoutUser,
} from './services/authService';
import { auth, isFirebaseConfigured, signOutFirebase } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Lock, ArrowRight } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return sessionStorage.getItem('cryptora_splash_shown') !== 'true';
  });

  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [postAuthRedirect, setPostAuthRedirect] = useState<string | null>(null);

  // Initialize and sync auth
  useEffect(() => {
    initializeDefaultAccounts();

    // Check local session
    const localActive = getCurrentSession();
    if (localActive) {
      setSession(localActive);
    }

    // If Firebase Auth is configured, subscribe to auth state
    if (auth && isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const token = await fbUser.getIdToken();
          setSession({
            user: {
              id: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || 'Cryptora User',
              photoURL: fbUser.photoURL || undefined,
              provider: fbUser.providerData[0]?.providerId || 'firebase',
            },
            token,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Sync route from URL Hash on first load & listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        const validRoutes = [
          'home',
          'features',
          'about',
          'algorithms',
          'security',
          'docs',
          'terms',
          'privacy',
          'login',
          'register',
          'dashboard',
          'encrypt',
          'decrypt',
          'file-encrypt',
          'file-decrypt',
          'history',
          'password-generator',
          'security-center',
          'profile',
          'settings',
        ];
        if (validRoutes.includes(hash)) {
          if (hash === 'login' || hash === 'register') {
            setAuthModalMode(hash as any);
            setAuthModalOpen(true);
            setCurrentRoute('home');
          } else {
            setCurrentRoute(hash);
          }
        } else {
          setCurrentRoute('404');
        }
      } else {
        setCurrentRoute('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    if (postAuthRedirect) {
      navigate(postAuthRedirect);
      setPostAuthRedirect(null);
    } else if (currentRoute === 'home') {
      navigate('dashboard');
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await signOutFirebase();
    }
    logoutUser();
    setSession(null);
    if (
      [
        'dashboard',
        'encrypt',
        'decrypt',
        'file-encrypt',
        'file-decrypt',
        'history',
        'password-generator',
        'profile',
        'settings',
      ].includes(currentRoute)
    ) {
      navigate('home');
    }
  };

  const handleSplashComplete = () => {
    sessionStorage.setItem('cryptora_splash_shown', 'true');
    setShowSplash(false);
  };

  // Protected Routes Check
  const protectedRoutes = [
    'dashboard',
    'encrypt',
    'decrypt',
    'file-encrypt',
    'file-decrypt',
    'history',
    'password-generator',
    'profile',
    'settings',
  ];

  const isAccessDenied = protectedRoutes.includes(currentRoute) && !session;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] selection:bg-[#111111] selection:text-white">
      {/* 3-Second Splash Screen on First Load */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Top Bar Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        session={session}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full">
        {/* Protected Route Gate */}
        {isAccessDenied ? (
          <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#111111]">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-[#111111]">
                Authentication Required
              </h1>
              <p className="text-xs text-[#777777] leading-relaxed">
                The requested cryptographic tool or workspace requires an authenticated session.
                Please sign in with Google or your email credentials to access this tool.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setPostAuthRedirect(currentRoute);
                  handleOpenAuth('login');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <span>Sign In to Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('home')}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#F7F7F7] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            {(currentRoute === 'home' || currentRoute === 'features') && (
              <LandingView
                onNavigate={navigate}
                onOpenAuth={handleOpenAuth}
                isAuthenticated={Boolean(session)}
              />
            )}

            {currentRoute === 'about' && (
              <AboutView onNavigate={navigate} />
            )}

            {currentRoute === 'algorithms' && (
              <AlgorithmsView />
            )}

            {currentRoute === 'security' && (
              <SecurityView />
            )}

            {currentRoute === 'security-center' && (
              <SecurityView />
            )}

            {currentRoute === 'docs' && (
              <DocsView onNavigate={navigate} />
            )}

            {currentRoute === 'privacy' && (
              <PrivacyView />
            )}

            {currentRoute === 'terms' && (
              <TermsView />
            )}

            {currentRoute === 'dashboard' && (
              <DashboardView
                session={session}
                initialTab="overview"
                onNavigate={navigate}
                onOpenAuth={handleOpenAuth}
                onLogout={handleLogout}
              />
            )}

            {currentRoute === 'encrypt' && (
              <DashboardView
                session={session}
                initialTab="text-encrypt"
                onNavigate={navigate}
                onOpenAuth={handleOpenAuth}
                onLogout={handleLogout}
              />
            )}

            {currentRoute === 'decrypt' && (
              <DashboardView
                session={session}
                initialTab="text-decrypt"
                onNavigate={navigate}
                onOpenAuth={handleOpenAuth}
                onLogout={handleLogout}
              />
            )}

            {currentRoute === 'file-encrypt' && (
              <DashboardView
                session={session}
                initialTab="file-encrypt"
                onNavigate={navigate}
                onOpenAuth={handleOpenAuth}
                onLogout={handleLogout}
              />
            )}

            {currentRoute === 'file-decrypt' && (
              <DashboardView
                session={session}
                initialTab="file-decrypt"
                onNavigate={navigate}
                onOpenAuth={handleOpenAuth}
                onLogout={handleLogout}
              />
            )}

            {currentRoute === 'history' && (
              <DashboardView
                session={session}
                initialTab="history"
                onNavigate={navigate}
                onOpenAuth={handleOpenAuth}
                onLogout={handleLogout}
              />
            )}

            {currentRoute === 'password-generator' && (
              <DashboardView
                session={session}
                initialTab="password-generator"
                onNavigate={navigate}
                onOpenAuth={handleOpenAuth}
                onLogout={handleLogout}
              />
            )}

            {(currentRoute === 'profile' || currentRoute === 'settings') && (
              <DashboardView
                session={session}
                initialTab={currentRoute}
                onNavigate={navigate}
                onOpenAuth={handleOpenAuth}
                onLogout={handleLogout}
              />
            )}

            {currentRoute === '404' && (
              <NotFoundView onNavigateHome={() => navigate('home')} />
            )}
          </>
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}
