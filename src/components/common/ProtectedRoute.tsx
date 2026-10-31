/**
 * CRYPTORA Protected Route Guard Component
 * Enforces authenticated access for confidential cryptographic modules, dashboard, history, and profile.
 * Displays a zero-knowledge security gate with seamless login redirection.
 */

import React from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthSession } from '../../types/crypto';

interface ProtectedRouteProps {
  session: AuthSession | null;
  currentRoute: string;
  onOpenAuth: (mode?: 'login' | 'register' | 'connect') => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  session,
  currentRoute,
  onOpenAuth,
  onNavigateHome,
  children,
}) => {
  if (session) {
    return <>{children}</>;
  }

  // Route labels for clear feedback
  const routeTitles: Record<string, string> = {
    dashboard: 'Cryptographic Workspace & Dashboard',
    encrypt: 'Authenticated Text Encryption (AES-256-GCM)',
    decrypt: 'Authenticated Text Decryption',
    'file-encrypt': 'Universal File & Image Encryption (CPT Container)',
    'file-decrypt': 'Universal File & Image Decryption',
    history: 'Cryptographic Operation & Audit Log',
    'password-generator': 'CSPRNG Entropy Password Generator',
    profile: 'User Profile & Identity Management',
    settings: 'Security Policies & Firebase Configuration',
  };

  const currentTitle = routeTitles[currentRoute] || 'Restricted Cryptographic Tool';

  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5 animate-in fade-in duration-200">
      <div className="w-14 h-14 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#111111] shadow-xs">
        <Lock className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777] block">
          Access Control Enforcement
        </span>
        <h1 className="text-xl font-bold tracking-tight text-[#111111]">
          Authentication Required
        </h1>
        <p className="text-xs text-[#777777] leading-relaxed max-w-sm mx-auto">
          Access to <strong>{currentTitle}</strong> is restricted to authenticated sessions.
          Please sign in with Google or your CRYPTORA email credentials to continue.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => onOpenAuth('login')}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <span>Sign In to Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onNavigateHome}
          className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#F7F7F7] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] transition-colors"
        >
          Return to Home
        </button>
      </div>

      <div className="pt-6 border-t border-[#E5E5E5]">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#777777]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Zero-Knowledge Architecture: Keys & plaintext are processed exclusively in your browser.</span>
        </div>
      </div>
    </div>
  );
};
