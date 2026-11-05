/**
 * CRYPTORA Authentication Modal
 * Production authentication interface for genuine Firebase users only.
 * Strictly no demo logins, guest accounts, instant auditor bypasses, or hardcoded credentials.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Check,
  RotateCw,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthSession } from '../../types/crypto';
import { firebaseConfig } from '../../services/firebase';

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
  const {
    session,
    isFirebaseConfigured,
    emailVerificationPending,
    unverifiedUser,
    authError,
    clearAuthError,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resendVerification,
    checkVerification,
    resetPassword,
    dismissVerificationNotice,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Loading states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // Notification states
  const [error, setError] = useState<string | null>(authError);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    clearAuthError();
    setSuccessMsg(null);
    setGoogleLoading(true);

    try {
      if (!isFirebaseConfigured) {
        throw new Error(
          'Firebase Authentication is not configured. Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables are set in your deployment.'
        );
      }
      const res = await signInWithGoogle();
      if (res === 'redirect_initiated') {
        setSuccessMsg('Redirecting to Google for account selection...');
        return;
      }
      // On success via popup, onAuthStateChanged or session effect will dismiss modal
    } catch (err: any) {
      console.warn('[CRYPTORA] Google authentication failed in modal:', err);
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Sync mode and verification state on open
  useEffect(() => {
    if (isOpen) {
      if (emailVerificationPending) {
        setMode('verify');
      } else {
        setMode(initialMode);
      }
      setError(authError || null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode, emailVerificationPending, authError]);

  // If a session becomes active (e.g. from Google login or verified email)
  useEffect(() => {
    if (session && isOpen) {
      onSuccess(session);
      onClose();
    }
  }, [session, isOpen, onSuccess, onClose]);

  if (!isOpen) return null;

  // Password entropy calculation
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


  // Submit Handler for Email/Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setEmailLoading(true);

    try {
      if (!isFirebaseConfigured) {
        throw new Error(
          'Firebase Authentication is not configured. Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables are set in your deployment.'
        );
      }

      if (mode === 'forgot') {
        const cleanEmail = email.trim();
        if (!cleanEmail) {
          throw new Error('Please enter your registered email address.');
        }
        await resetPassword(cleanEmail);
        setSuccessMsg('Password reset instructions have been dispatched to your email.');
        return;
      }

      if (mode === 'register') {
        const cleanName = name.trim();
        const cleanEmail = email.trim();

        if (!cleanName || cleanName.length < 2) {
          throw new Error('Please provide your full name (minimum 2 characters).');
        }
        if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (!acceptTerms) {
          throw new Error('Please accept the Terms & Conditions and acknowledge Privacy Policy.');
        }

        const res = await registerWithEmail(cleanName, cleanEmail, password);
        if (res.emailVerificationSent) {
          setSuccessMsg('Account created. Verification email sent to ' + cleanEmail);
        }
        setMode('verify');
        return;
      }

      if (mode === 'login') {
        const cleanEmail = email.trim();
        if (!cleanEmail) {
          throw new Error('Please enter your registered email address.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }

        const result = await loginWithEmail(cleanEmail, password);
        if (!result.isVerified) {
          setMode('verify');
          setError('Your email address has not been verified yet. Please check your inbox.');
        }
        // If verified, session observer automatically triggers onSuccess
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle checking verification
  const handleCheckVerification = async () => {
    setError(null);
    setSuccessMsg(null);
    setCheckingVerification(true);

    try {
      const verified = await checkVerification();
      if (verified) {
        setSuccessMsg('Email verified successfully! Opening your dashboard...');
      } else {
        setError('Email is not verified yet. Please click the link sent to your inbox and retry.');
      }
    } catch (err: any) {
      setError(err.message || 'Error checking verification status.');
    } finally {
      setCheckingVerification(false);
    }
  };

  // Handle resending verification
  const handleResendVerification = async () => {
    setError(null);
    setSuccessMsg(null);
    setResendingVerification(true);

    try {
      await resendVerification();
      setSuccessMsg('A fresh verification link has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleBackToLogin = () => {
    dismissVerificationNotice();
    setMode('login');
    setError(null);
    setSuccessMsg(null);
  };

  const currentEmail = unverifiedUser?.email || email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white border border-[#E5E5E5] rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#111111]" />
            <h3 id="auth-modal-title" className="text-sm font-bold text-[#111111]">
              CRYPTORA Authentication
            </h3>
          </div>
          <button
            onClick={() => {
              clearAuthError();
              onClose();
            }}
            className="p-1 text-[#777777] hover:text-[#111111] transition-colors rounded"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Only on Login/Register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 border-b border-[#E5E5E5] bg-[#F7F7F7] text-xs font-semibold shrink-0">
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
        <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh] text-xs">
          {!isFirebaseConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-[#92400E] rounded flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B45309]" />
              <div className="space-y-1">
                <p className="font-semibold text-[#78350F]">Firebase Authentication Not Configured</p>
                <p className="text-[11px] leading-relaxed text-[#92400E]">
                  Please ensure <code className="font-mono text-[#78350F]">VITE_FIREBASE_API_KEY</code> and <code className="font-mono text-[#78350F]">VITE_FIREBASE_PROJECT_ID</code> environment variables are configured in your deployment settings.
                </p>
              </div>
            </div>
          )}

          {/* Notifications */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#DC2626] rounded space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {error.includes('Incorrect email or password') && mode === 'login' && (
                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#111111]">
                  <span>Pehle register nahi kiya?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="underline hover:text-black font-bold"
                  >
                    Click here to Register
                  </button>
                  <span className="text-[#999999]">or</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="underline hover:text-black"
                  >
                    Reset Password
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-xs text-[#16A34A] rounded flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* VIEW: EMAIL VERIFICATION PENDING */}
          {mode === 'verify' ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#111111]">
                <Mail className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-[#111111]">
                  Verify Your Email Address
                </h4>
                <p className="text-xs text-[#777777] leading-relaxed">
                  A verification link was dispatched to:
                  <br />
                  <strong className="text-[#111111] font-mono break-all">{currentEmail}</strong>
                </p>
                <p className="text-[11px] text-[#777777]">
                  To protect your confidential cryptographic keys and operations, CRYPTORA requires email verification prior to granting workspace access.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={checkingVerification}
                  onClick={handleCheckVerification}
                  className="w-full py-2.5 px-4 bg-[#111111] hover:bg-[#333333] text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkingVerification ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Status...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>I Have Verified My Email</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={resendingVerification}
                  onClick={handleResendVerification}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] font-semibold rounded text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{resendingVerification ? 'Sending...' : 'Resend Verification Email'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-xs text-[#777777] hover:text-[#111111] underline"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Headings */}
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#111111]">
                  {mode === 'login'
                    ? 'Welcome Back to Cryptora'
                    : mode === 'register'
                    ? 'Create Your Cryptora Account'
                    : 'Reset Your Password'}
                </h4>
                <p className="text-xs text-[#777777]">
                  {mode === 'login'
                    ? 'Securely access your cryptography workspace.'
                    : mode === 'register'
                    ? 'Join Cryptora to securely manage your encryption and decryption operations.'
                    : 'Enter your registered email address to receive password recovery instructions.'}
                </p>
              </div>

              {/* Genuine Google OAuth Button */}
              {mode !== 'forgot' && (
                <div className="space-y-3.5">
                  <button
                    type="button"
                    disabled={googleLoading || emailLoading}
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 bg-white hover:bg-[#F7F7F7] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    {googleLoading ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin text-[#111111]" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E5E5]" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                      <span className="bg-white px-2.5 text-[#777777]">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-3 py-2 pl-9 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                      />
                      <User className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-2.5" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Email Address <span className="text-red-500">*</span>
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
                        Password <span className="text-red-500">*</span>
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setError(null);
                            setSuccessMsg(null);
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
                      Confirm Password <span className="text-red-500">*</span>
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
                  disabled={emailLoading || googleLoading}
                  className="w-full py-2.5 px-4 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
                >
                  {emailLoading ? (
                    <span>
                      {mode === 'login'
                        ? 'Signing you in...'
                        : mode === 'register'
                        ? 'Creating your account...'
                        : 'Sending Reset Link...'}
                    </span>
                  ) : (
                    <>
                      <span>
                        {mode === 'login'
                          ? 'Sign In with Email'
                          : mode === 'register'
                          ? 'Register with Email'
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
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-[#111111] underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
