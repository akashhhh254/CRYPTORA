/**
 * CRYPTORA Navigation Bar
 * Conforms to Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (4-5 Nav Links) — Zone 3 (1 Primary Action)
 * Strictly monochrome: #FFFFFF background, #111111 text, #E5E5E5 borders.
 */

import React, { useState } from 'react';
import { CryptoraLogo } from '../common/CryptoraLogo';
import { AuthSession } from '../../types/crypto';
import { Menu, X, Shield, Lock, Unlock, LogOut, User } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  session: AuthSession | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
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

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] rounded-sm py-1"
          aria-label="CRYPTORA Home"
        >
          <CryptoraLogo size="md" />
        </button>

        {/* Zone 2: Single-line Text Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#666666]"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => handleNav('home')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] ${
              currentRoute === 'home'
                ? 'text-[#111111] font-semibold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('encrypt')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] flex items-center gap-1.5 ${
              currentRoute === 'encrypt'
                ? 'text-[#111111] font-semibold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypt</span>
          </button>
          <button
            onClick={() => handleNav('decrypt')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] flex items-center gap-1.5 ${
              currentRoute === 'decrypt'
                ? 'text-[#111111] font-semibold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Decrypt</span>
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] ${
              currentRoute === 'dashboard'
                ? 'text-[#111111] font-semibold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNav('security')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] ${
              currentRoute === 'security'
                ? 'text-[#111111] font-semibold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Security Architecture
          </button>
          <button
            onClick={() => handleNav('docs')}
            className={`whitespace-nowrap transition-colors hover:text-[#111111] ${
              currentRoute === 'docs'
                ? 'text-[#111111] font-semibold underline decoration-2 underline-offset-8'
                : ''
            }`}
          >
            Documentation
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#E5E5E5] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-xs font-medium text-[#111111] transition-colors"
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
                    <p className="text-[11px] text-[#666666] truncate">{session.user.email}</p>
                  </div>
                  <button
                    onClick={() => handleNav('dashboard')}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#111111] hover:bg-[#F5F5F5] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>User Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#DC2626] hover:bg-[#F5F5F5] flex items-center gap-2 border-t border-[#E5E5E5]"
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
                className="px-3 py-2 text-xs font-medium text-[#111111] hover:text-[#666666] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('encrypt')}
                className="px-4 py-2 text-xs font-medium text-white bg-[#111111] hover:bg-[#1C1C1C] rounded transition-colors whitespace-nowrap"
              >
                Start Encrypting
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {session && (
            <button
              onClick={() => handleNav('dashboard')}
              className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-bold"
              aria-label="User Account"
            >
              {session.user.name.charAt(0).toUpperCase()}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#111111] hover:bg-[#F5F5F5] rounded transition-colors"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] bg-white px-4 pt-3 pb-6 space-y-1">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded ${
              currentRoute === 'home' ? 'bg-[#F5F5F5] text-[#111111] font-semibold' : 'text-[#666666]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('encrypt')}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded flex items-center gap-2 ${
              currentRoute === 'encrypt' ? 'bg-[#F5F5F5] text-[#111111] font-semibold' : 'text-[#666666]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Encrypt Image</span>
          </button>
          <button
            onClick={() => handleNav('decrypt')}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded flex items-center gap-2 ${
              currentRoute === 'decrypt' ? 'bg-[#F5F5F5] text-[#111111] font-semibold' : 'text-[#666666]'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>Decrypt Image</span>
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded ${
              currentRoute === 'dashboard' ? 'bg-[#F5F5F5] text-[#111111] font-semibold' : 'text-[#666666]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNav('security')}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded ${
              currentRoute === 'security' ? 'bg-[#F5F5F5] text-[#111111] font-semibold' : 'text-[#666666]'
            }`}
          >
            Security Architecture
          </button>
          <button
            onClick={() => handleNav('docs')}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded ${
              currentRoute === 'docs' ? 'bg-[#F5F5F5] text-[#111111] font-semibold' : 'text-[#666666]'
            }`}
          >
            Documentation
          </button>

          <div className="pt-4 border-t border-[#E5E5E5] space-y-2">
            {session ? (
              <>
                <div className="px-3 py-2 bg-[#F5F5F5] rounded text-xs">
                  <div className="font-semibold text-[#111111]">{session.user.name}</div>
                  <div className="text-[#666666]">{session.user.email}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#DC2626] font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-[#111111] border border-[#E5E5E5] rounded"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-white bg-[#111111] rounded"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
