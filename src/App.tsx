/**
 * CRYPTORA - Digital Image Encryption & Decryption Platform
 * Master Application Shell & Routing Engine
 * Strictly adheres to White + Black visual identity and authenticated cryptography standards.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingView } from './components/landing/LandingView';
import { EncryptModule } from './components/encryption/EncryptModule';
import { DecryptModule } from './components/decryption/DecryptModule';
import { DashboardView } from './components/dashboard/DashboardView';
import { SecurityView } from './components/security/SecurityView';
import { DocsView } from './components/docs/DocsView';
import { PrivacyView } from './components/legal/PrivacyView';
import { TermsView } from './components/legal/TermsView';
import { NotFoundView } from './components/common/NotFoundView';
import { AuthModal } from './components/auth/AuthModal';
import { AuthSession } from './types/crypto';
import {
  getCurrentSession,
  initializeDefaultAccounts,
  logoutUser,
} from './services/authService';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [shortcutFile, setShortcutFile] = useState<File | null>(null);

  // Initialize accounts and check existing session
  useEffect(() => {
    initializeDefaultAccounts();
    const active = getCurrentSession();
    if (active) {
      setSession(active);
    }

    // Sync route from URL Hash on first load & listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        const validRoutes = [
          'home',
          'encrypt',
          'decrypt',
          'dashboard',
          'security',
          'docs',
          'privacy',
          'terms',
        ];
        if (validRoutes.includes(hash)) {
          setCurrentRoute(hash);
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

  // Update hash when navigating programmatically
  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    // If on home, direct to dashboard on successful login
    if (currentRoute === 'home') {
      navigate('dashboard');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setSession(null);
    if (currentRoute === 'dashboard') {
      navigate('home');
    }
  };

  // Shortcut from Encrypt success to Decrypt module with preloaded file
  const handleDecryptionShortcut = (file: File) => {
    setShortcutFile(file);
    navigate('decrypt');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] selection:bg-[#111111] selection:text-white">
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
        {currentRoute === 'home' && (
          <LandingView
            onNavigate={navigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentRoute === 'encrypt' && (
          <EncryptModule
            onDecryptionShortcut={handleDecryptionShortcut}
          />
        )}

        {currentRoute === 'decrypt' && (
          <DecryptModule
            initialFile={shortcutFile}
          />
        )}

        {currentRoute === 'dashboard' && (
          <DashboardView
            session={session}
            onNavigate={navigate}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
          />
        )}

        {currentRoute === 'security' && (
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
