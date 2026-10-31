/**
 * CRYPTORA Authentication Modal
 * Full support for Google Sign-In, Email/Password Registration, Login, and Password Reset.
 * Seamlessly integrates Firebase Auth with local PBKDF2 cryptographic fallback.
 */

import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react';
import { loginUser, registerUser } from '../../services/authService';
import {
  signInWithGoogleFirebase,
  registerWithEmailFirebase,
  loginWithEmailFirebase,
  resetPasswordFirebase,
  isFirebaseConfigured,
} from '../../services/firebase';
import { AuthSession } from '../../types/crypto';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password strength calculation
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty' };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 14) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 25;

    let label = 'Weak';
    if (score >= 100) label = 'Enterprise (High Entropy)';
    else if (score >= 75) label = 'Strong';
    else if (score >= 50) label = 'Fair';
    return { score, label };
  };

  const strength = calculateStrength(password);

  // Google Authentication Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      if (isFirebaseConfigured) {
        const firebaseUser = await signInWithGoogleFirebase();
        const session: AuthSession = {
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email || 'user@cryptora.internal',
            name: firebaseUser.displayName || 'Google User',
            photoURL: firebaseUser.photoURL || undefined,
            provider: 'Google',
          },
          token: await firebaseUser.getIdToken(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };
        onSuccess(session);
        onClose();
      } else {
        // Transparent explanation if Firebase credentials are missing in env
        setError(
          'Firebase Google Auth requires VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables. For local instant access, please register with Email or use the pre-configured Security Auditor credentials below.'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          throw new Error('Please enter your registered email address.');
        }
        if (isFirebaseConfigured) {
          await resetPasswordFirebase(email.trim());
          setSuccessMsg('Password reset link sent to your email address.');
        } else {
          setSuccessMsg('If an account exists with this email, password recovery instructions have been initiated.');
        }
        return;
      }

      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (!acceptTerms) {
          throw new Error('Please accept the Terms & Conditions and Privacy Policy.');
        }

        if (isFirebaseConfigured) {
          const fbUser = await registerWithEmailFirebase(name, email, password);
          const session: AuthSession = {
            user: {
              id: fbUser.uid,
              email: fbUser.email || email,
              name: fbUser.displayName || name,
              provider: 'Firebase Email',
            },
            token: await fbUser.getIdToken(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          };
          onSuccess(session);
          onClose();
        } else {
          // Cryptographically salted PBKDF2 local registration
          const session = await registerUser(name, email, password);
          onSuccess(session);
          onClose();
        }
      } else {
        // Mode: Login
        if (isFirebaseConfigured) {
          try {
            const fbUser = await loginWithEmailFirebase(email, password);
            const session: AuthSession = {
              user: {
                id: fbUser.uid,
                email: fbUser.email || email,
                name: fbUser.displayName || 'Cryptora User',
                provider: 'Firebase Email',
              },
              token: await fbUser.getIdToken(),
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            };
            onSuccess(session);
            onClose();
          } catch (fbErr: any) {
            // Fallback to local stored credentials if firebase user does not exist
            const session = await loginUser(email, password);
            onSuccess(session);
            onClose();
          }
        } else {
          const session = await loginUser(email, password);
          onSuccess(session);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
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
        className="w-full max-w-md bg-white border border-[#E5E5E5] rounded shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#111111]" />
            <h3 id="auth-modal-title" className="text-sm font-bold text-[#111111]">
              {mode === 'login'
                ? 'Sign In to CRYPTORA'
                : mode === 'register'
                ? 'Create CRYPTORA Account'
                : 'Reset Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#777777] hover:text-[#111111] transition-colors rounded"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-[#E5E5E5] bg-[#F7F7F7] text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-3 transition-colors text-center ${
                mode === 'login'
                  ? 'bg-white text-[#111111] border-b-2 border-[#111111]'
                  : 'text-[#777777] hover:text-[#111111]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-3 transition-colors text-center ${
                mode === 'register'
                  ? 'bg-white text-[#111111] border-b-2 border-[#111111]'
                  : 'text-[#777777] hover:text-[#111111]'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#DC2626] rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-xs text-[#16A34A] rounded flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          {mode !== 'forgot' && (
            <div>
              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#F7F7F7] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] transition-colors flex items-center justify-center gap-2.5"
              >
                {/* Minimal Google Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.25 21.32 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.27C.46 8.22 0 10.05 0 12s.46 3.78 1.27 5.4l4.01-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.68 1.27 6.6l4.01 3.13c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E5E5]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                  <span className="bg-white px-2 text-[#777777]">Or continue with email</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 pl-9 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  />
                  <User className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 pl-9 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
                <Mail className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-2.5" />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-[#111111]">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                      }}
                      className="text-[11px] text-[#777777] hover:text-[#111111] underline"
                    >
                      Forgot password?
                    </button>
                  )}
                  {mode === 'register' && password && (
                    <span className="text-[10px] font-mono text-[#777777]">
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
                    placeholder={mode === 'register' ? 'Min 8 characters' : 'Enter password'}
                    className="w-full px-3 py-2 pl-9 pr-9 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#777777] hover:text-[#111111]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {mode === 'register' && password && (
                  <div className="mt-1 h-1 w-full bg-[#E5E5E5] rounded overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        strength.score >= 75
                          ? 'bg-[#16A34A]'
                          : strength.score >= 50
                          ? 'bg-[#111111]'
                          : 'bg-[#D97706]'
                      }`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm"
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />

                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#777777]">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 accent-[#111111]"
                    />
                    <span>
                      I agree to the <span className="text-[#111111] underline">Terms & Conditions</span> and acknowledge the <span className="text-[#111111] underline">Privacy Policy</span>.
                    </span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Sign In'
                      : mode === 'register'
                      ? 'Create Protected Account'
                      : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#111111] underline"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Security Auditor Demo Account Shortcut */}
          <div className="pt-3 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={handleUseDemoAccount}
              className="w-full py-2 px-3 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#111111] text-xs font-medium rounded border border-[#E5E5E5] transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Use Pre-Configured Security Auditor Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
