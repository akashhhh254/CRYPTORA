/**
 * CRYPTORA - Full-Stack Cybersecurity & Cryptography Platform
 * Main Application Shell & Master Routing Controller
 * Features 3-second entrance splash screen, strict protected route isolation,
 * verified Firebase Authentication sessions, and zero-knowledge client cryptographic engines.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SplashScreen } from './components/common/SplashScreen';
import { LandingView } from './components/landing/LandingView';
import { DashboardView } from './components/dashboard/DashboardView';
import { AlgorithmsView } from './components/algorithms/AlgorithmsView';
import { SecurityView } from './components/security/SecurityView';
import { AboutView } from './components/about/AboutView';
import { DocsView } from './components/docs/DocsView';
import { PrivacyView } from './components/legal/PrivacyView';
import { TermsView } from './components/legal/TermsView';
import { NotFoundView } from './components/common/NotFoundView';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthSession } from './types/crypto';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { session, logout, authError, clearAuthError, loading } = useAuth();

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('cryptora_redirect_pending') === 'true') {
      return false;
    }
    return sessionStorage.getItem('cryptora_splash_shown') !== 'true';
  });

  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [postAuthRedirect, setPostAuthRedirect] = useState<string | null>(null);

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
          'security-center',
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

  // Automatic dashboard navigation when session becomes active on landing or login routes
  useEffect(() => {
    if (session) {
      setAuthModalOpen(false);
      const isPublicLanding = currentRoute === 'home' || currentRoute === 'login' || currentRoute === 'register';
      if (isPublicLanding) {
        const dest = postAuthRedirect || 'dashboard';
        navigate(dest);
        setPostAuthRedirect(null);
      }
    }
  }, [session]);

  // If a mobile redirect authentication error occurs, open AuthModal with the error
  useEffect(() => {
    if (authError) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
    }
  }, [authError]);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    clearAuthError();
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (_newSession: AuthSession) => {
    setAuthModalOpen(false);
    clearAuthError();
    // After successful authentication, redirect directly to dashboard or target
    if (postAuthRedirect) {
      navigate(postAuthRedirect);
      setPostAuthRedirect(null);
    } else {
      navigate('dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
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
    if (protectedRoutes.includes(currentRoute)) {
      navigate('home');
    }
  };

  const handleSplashComplete = () => {
    sessionStorage.setItem('cryptora_splash_shown', 'true');
    setShowSplash(false);
  };

  // Protected Routes List
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

  const isProtected = protectedRoutes.includes(currentRoute);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] selection:bg-[#111111] selection:text-white">
      {/* 3-Second Entrance Splash Screen on First Load */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Mobile Redirect Processing Overlay */}
      {loading && typeof window !== 'undefined' && sessionStorage.getItem('cryptora_redirect_pending') === 'true' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white p-4">
          <div className="w-10 h-10 border-3 border-[#111111] border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-sm font-bold text-[#111111]">Authenticating with Google</h2>
          <p className="text-xs text-[#777777] mt-1 font-mono">Restoring verified secure session...</p>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        session={session}
        onOpenAuth={(mode) => handleOpenAuth((mode as any) || 'login')}
        onLogout={handleLogout}
      />

      {/* Main Content View Container */}
      <main className="flex-1 w-full">
        {isProtected ? (
          <ProtectedRoute
            session={session}
            currentRoute={currentRoute}
            onOpenAuth={(mode) => {
              setPostAuthRedirect(currentRoute);
              handleOpenAuth((mode as any) || 'login');
            }}
            onNavigateHome={() => navigate('home')}
          >
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
          </ProtectedRoute>
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

            {currentRoute === '404' && (
              <NotFoundView onNavigateHome={() => navigate('home')} />
            )}
          </>
        )}
      </main>

      {/* Unified Genuine Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Global Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}
