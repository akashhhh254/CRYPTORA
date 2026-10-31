/**
 * CRYPTORA Navigation Bar
 * Conforms to Phase 4 Navigation Requirements:
 * Left: Cryptora Logo + CRYPTORA
 * Center: Home, Features, How It Works, Algorithms, Security, About
 * Right: Sign In, Get Started / User Profile Dropdown
 */

import React, { useState } from 'react';
import { CryptoraLogo } from '../common/CryptoraLogo';
import { AuthSession } from '../../types/crypto';
import { Menu, X, Lock, LogOut, User, LayoutDashboard, History, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  session: AuthSession | null;
  onOpenAuth: (mode?: 'login' | 'register' | 'connect') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  session,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNav = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleProtectedAction = (targetRoute: string) => {
    if (!session) {
      onOpenAuth('login');
    } else {
      handleNav(targetRoute);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Left: Brand Wordmark & Shield Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] rounded-sm py-1"
          aria-label="CRYPTORA Home"
        >
          <CryptoraLogo size="md" />
        </button>

        {/* Center: Main Navigation (Home, Features, How It Works, Algorithms, Security, About) */}
        <nav
          className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#777777]"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => handleNav('home')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] ${
              currentRoute === 'home'
                ? 'text-[#111111] font-bold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              if (currentRoute === 'home') {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                handleNav('features');
              }
            }}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] ${
              currentRoute === 'features'
                ? 'text-[#111111] font-bold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Features
          </button>
          <button
            onClick={() => {
              if (currentRoute === 'home') {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                handleNav('home');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="whitespace-nowrap transition-colors hover:text-[#111111]"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('algorithms')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] ${
              currentRoute === 'algorithms'
                ? 'text-[#111111] font-bold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Algorithms
          </button>
          <button
            onClick={() => handleNav('security')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] ${
              currentRoute === 'security'
                ? 'text-[#111111] font-bold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Security
          </button>
          <button
            onClick={() => handleNav('about')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] ${
              currentRoute === 'about'
                ? 'text-[#111111] font-bold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            About
          </button>

          {/* Quick links to protected workspace for authenticated users */}
          {session && (
            <button
              onClick={() => handleNav('dashboard')}
              className={`whitespace-nowrap transition-colors hover:text-[#111111] flex items-center gap-1 ${
                currentRoute === 'dashboard'
                  ? 'text-[#111111] font-bold underline decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          )}
        </nav>

        {/* Right: Sign In / Get Started or User Menu */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#E5E5E5] bg-[#F7F7F7] hover:bg-[#E5E5E5] text-xs font-semibold text-[#111111] transition-colors"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-bold">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[130px] truncate">{session.user.name}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E5E5] rounded shadow-md py-1.5 z-50">
                  <div className="px-3.5 py-2 border-b border-[#E5E5E5]">
                    <p className="text-xs font-semibold text-[#111111] truncate">{session.user.name}</p>
                    <p className="text-[11px] text-[#777777] truncate">{session.user.email}</p>
                  </div>
                  <button
                    onClick={() => handleNav('dashboard')}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#111111] hover:bg-[#F7F7F7] flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Workspace Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleNav('profile')}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#111111] hover:bg-[#F7F7F7] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    onClick={() => handleNav('history')}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#111111] hover:bg-[#F7F7F7] flex items-center gap-2"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Operation History</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#DC2626] hover:bg-[#F7F7F7] flex items-center gap-2 border-t border-[#E5E5E5]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 text-xs font-semibold text-[#111111] hover:text-[#777777] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#333333] rounded transition-colors whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="flex lg:hidden items-center gap-2">
          {session ? (
            <button
              onClick={() => handleNav('dashboard')}
              className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold"
              aria-label="User Account"
            >
              {session.user.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3 py-1.5 text-xs font-semibold text-[#111111] border border-[#E5E5E5] rounded"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#111111] hover:bg-[#F7F7F7] rounded transition-colors"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E5E5] bg-white px-4 pt-3 pb-6 space-y-1">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded ${
              currentRoute === 'home' ? 'bg-[#F7F7F7] text-[#111111]' : 'text-[#777777]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('features')}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded ${
              currentRoute === 'features' ? 'bg-[#F7F7F7] text-[#111111]' : 'text-[#777777]'
            }`}
          >
            Features
          </button>
          <button
            onClick={() => handleNav('algorithms')}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded ${
              currentRoute === 'algorithms' ? 'bg-[#F7F7F7] text-[#111111]' : 'text-[#777777]'
            }`}
          >
            Algorithms
          </button>
          <button
            onClick={() => handleNav('security')}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded ${
              currentRoute === 'security' ? 'bg-[#F7F7F7] text-[#111111]' : 'text-[#777777]'
            }`}
          >
            Security Architecture
          </button>
          <button
            onClick={() => handleNav('about')}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded ${
              currentRoute === 'about' ? 'bg-[#F7F7F7] text-[#111111]' : 'text-[#777777]'
            }`}
          >
            About Cryptora
          </button>

          {session ? (
            <div className="pt-3 border-t border-[#E5E5E5] space-y-1">
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#111111] hover:bg-[#F7F7F7] rounded"
              >
                Dashboard Workspace
              </button>
              <button
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#111111] hover:bg-[#F7F7F7] rounded"
              >
                Profile & Settings
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-red-50 rounded"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#E5E5E5] grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="py-2.5 text-center text-xs font-semibold text-[#111111] border border-[#E5E5E5] rounded"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="py-2.5 text-center text-xs font-semibold text-white bg-[#111111] rounded"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
