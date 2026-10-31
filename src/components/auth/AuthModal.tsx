/**
 * CRYPTORA Authentication Modal
 * Handles real registration, login, and OAuth provider configuration.
 * Strictly adheres to White + Black design system.
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser, registerUser } from '../../services/authService';
import { AuthSession } from '../../types/crypto';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOAuthGuide, setShowOAuthGuide] = useState(false);

  if (!isOpen) return null;

  // Calculate password strength
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None' };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 25;

    let label = 'Weak';
    if (score >= 75) label = 'Enterprise Grade';
    else if (score >= 50) label = 'Strong';
    else if (score >= 25) label = 'Fair';
    return { score, label };
  };

  const strength = calculateStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const session = await loginUser(email, password);
        onSuccess(session);
        onClose();
      } else {
        const session = await registerUser(name, email, password);
        onSuccess(session);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoAccount = () => {
    setEmail('security@cryptora.io');
    setPassword('CryptoraSecure#2026');
    setMode('login');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#111111]" />
            <h3 id="auth-modal-title" className="text-sm font-bold text-[#111111] tracking-tight">
              {mode === 'login' ? 'Sign In to CRYPTORA' : 'Create CRYPTORA Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#666666] hover:text-[#111111] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-[#E5E5E5] bg-[#F5F5F5] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-3 transition-colors text-center ${
              mode === 'login'
                ? 'bg-white text-[#111111] border-b-2 border-[#111111]'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-3 transition-colors text-center ${
              mode === 'register'
                ? 'bg-white text-[#111111] border-b-2 border-[#111111]'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#DC2626] rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 pl-9 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#111111] focus-visible:border-[#111111]"
                />
                <User className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#111111] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 pl-9 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#111111] focus-visible:border-[#111111]"
              />
              <Mail className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#111111]">
                Password
              </label>
              {mode === 'register' && password && (
                <span className="text-[10px] font-mono text-[#666666]">
                  {strength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Enter password'}
                className="w-full px-3 py-2 pl-9 pr-9 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#111111] focus-visible:border-[#111111]"
              />
              <Lock className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#888888] hover:text-[#111111]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Password strength progress bar for registration */}
            {mode === 'register' && password && (
              <div className="mt-1.5 space-y-1">
                <div className="w-full bg-[#E5E5E5] h-1 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength.score >= 75
                        ? 'bg-[#16A34A]'
                        : strength.score >= 50
                        ? 'bg-[#111111]'
                        : strength.score >= 25
                        ? 'bg-[#D97706]'
                        : 'bg-[#DC2626]'
                    }`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="inline-block animate-spin mr-1">↻</span>
            ) : null}
            <span>{mode === 'login' ? 'Sign In' : 'Create Protected Account'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>

          {/* Demo account convenience shortcut */}
          <div className="pt-3 border-t border-[#E5E5E5] flex flex-col gap-2">
            <button
              type="button"
              onClick={handleUseDemoAccount}
              className="w-full py-2 px-3 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#111111] text-xs font-medium rounded border border-[#E5E5E5] transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Use Pre-Configured Security Auditor Credentials</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOAuthGuide(!showOAuthGuide)}
              className="text-[11px] text-[#666666] hover:text-[#111111] text-center underline decoration-dotted"
            >
              {showOAuthGuide ? 'Hide Enterprise SSO & OAuth Notes' : 'Enterprise SSO & OAuth 2.0 Integration'}
            </button>
          </div>

          {showOAuthGuide && (
            <div className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded text-[11px] text-[#666666] space-y-1.5">
              <p className="font-semibold text-[#111111]">Zero-Knowledge Architecture:</p>
              <p>
                CRYPTORA uses client-side PBKDF2-SHA256 password derivation so your plaintext credentials never leave this machine.
              </p>
              <p className="text-[10px] text-[#888888]">
                For Google Cloud Identity / SAML integration in enterprise deployments, configure your client ID via environment secrets.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
