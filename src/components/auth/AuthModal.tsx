/**
 * CRYPTORA Authentication Modal
 * Full support for Google Sign-In, Email/Password Registration, Login, and Password Reset.
 * Includes dedicated "Connect Firebase Authentication" configuration panel with snippet parser,
 * strict Service Account rejection, individual field inputs, and 9-step setup guide.
 */

import React, { useState, useEffect } from 'react';
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
  Settings,
  HelpCircle,
  ExternalLink,
  Database,
  Key,
} from 'lucide-react';
import { loginUser, registerUser } from '../../services/authService';
import {
  signInWithGoogleFirebase,
  registerWithEmailFirebase,
  loginWithEmailFirebase,
  resetPasswordFirebase,
  isFirebaseConfigured,
  checkFirebaseConfigured,
  parseFirebaseConfig,
  validateFirebaseConfig,
  saveStoredFirebaseConfig,
  getActiveFirebaseConfig,
  clearStoredFirebaseConfig,
  FirebaseConfigValues,
} from '../../services/firebase';
import { AuthSession } from '../../types/crypto';
import { FirebaseSetupGuideModal } from './FirebaseSetupGuideModal';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot' | 'connect';
  onClose: () => void;
  onSuccess: (session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'connect'>(initialMode);
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
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Configuration Fields
  const [snippetInput, setSnippetInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [projectIdInput, setProjectIdInput] = useState('');
  const [authDomainInput, setAuthDomainInput] = useState('');
  const [storageBucketInput, setStorageBucketInput] = useState('');
  const [messagingSenderIdInput, setMessagingSenderIdInput] = useState('');
  const [appIdInput, setAppIdInput] = useState('');
  const [configSaving, setConfigSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);

      // Preload active config if any
      const active = getActiveFirebaseConfig();
      if (active.apiKey && active.apiKey !== 'AIzaSy...') {
        setApiKeyInput(active.apiKey);
        setProjectIdInput(active.projectId);
        setAuthDomainInput(active.authDomain);
        setStorageBucketInput(active.storageBucket || '');
        setMessagingSenderIdInput(active.messagingSenderId || '');
        setAppIdInput(active.appId || '');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Auto-parse snippet when pasted into textarea
  const handleSnippetChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSnippetInput(val);
    setError(null);

    if (val.trim()) {
      const parsed = parseFirebaseConfig(val);
      if (parsed.valid && parsed.config) {
        setApiKeyInput(parsed.config.apiKey);
        setProjectIdInput(parsed.config.projectId);
        setAuthDomainInput(parsed.config.authDomain);
        setStorageBucketInput(parsed.config.storageBucket || '');
        setMessagingSenderIdInput(parsed.config.messagingSenderId || '');
        setAppIdInput(parsed.config.appId || '');
        setSuccessMsg('Valid configuration snippet detected and parsed!');
      } else if (parsed.error) {
        setError(parsed.error);
      }
    }
  };

  // Save Configuration Handler
  const handleSaveFirebaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setConfigSaving(true);

    try {
      let configCandidate: Partial<FirebaseConfigValues> = {};

      if (snippetInput.trim()) {
        const parsed = parseFirebaseConfig(snippetInput);
        if (!parsed.valid || !parsed.config) {
          throw new Error(parsed.error || 'Failed to parse configuration snippet.');
        }
        configCandidate = parsed.config;
      } else {
        configCandidate = {
          apiKey: apiKeyInput.trim(),
          projectId: projectIdInput.trim(),
          authDomain: authDomainInput.trim() || (projectIdInput.trim() ? `${projectIdInput.trim()}.firebaseapp.com` : ''),
          storageBucket: storageBucketInput.trim(),
          messagingSenderId: messagingSenderIdInput.trim(),
          appId: appIdInput.trim(),
        };
      }

      const validation = validateFirebaseConfig(configCandidate);
      if (!validation.valid || !validation.config) {
        throw new Error(validation.error || 'Invalid Firebase configuration values.');
      }

      await saveStoredFirebaseConfig(validation.config);
      setSuccessMsg('Firebase Authentication successfully connected!');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Could not connect Firebase. Please verify credentials.');
    } finally {
      setConfigSaving(false);
    }
  };

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

  // 1-Click Instant Auditor Login
  const handleInstantAuditorLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const session = await loginUser('security@cryptora.io', 'CryptoraSecure#2026');
      onSuccess(session);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Auditor login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Google Authentication Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      if (checkFirebaseConfigured()) {
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
        // Open the Firebase configuration popup
        setMode('connect');
        setError(
          'Google Sign-In requires active Firebase credentials. Please configure your Firebase Web App below, or use the 1-Click Auditor Sign-In for instant access.'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Submit Handler for Email/Password
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
        if (checkFirebaseConfigured()) {
          await resetPasswordFirebase(email.trim());
          setSuccessMsg('Password reset instructions sent to your email.');
        } else {
          setSuccessMsg('If an account exists with this email, recovery instructions have been initiated.');
        }
        return;
      }

      if (mode === 'register') {
        if (!name.trim() || name.trim().length < 2) {
          throw new Error('Please provide your full name (minimum 2 characters).');
        }
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
          throw new Error('Please provide a valid email address.');
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

        if (checkFirebaseConfigured()) {
          const fbUser = await registerWithEmailFirebase(name.trim(), email.trim(), password);
          const session: AuthSession = {
            user: {
              id: fbUser.uid,
              email: fbUser.email || email.trim(),
              name: fbUser.displayName || name.trim(),
              provider: 'Firebase Email',
            },
            token: await fbUser.getIdToken(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          };
          onSuccess(session);
          onClose();
        } else {
          // Cryptographically salted PBKDF2 local registration
          const session = await registerUser(name.trim(), email.trim(), password);
          onSuccess(session);
          onClose();
        }
      } else {
        // Mode: Login
        if (!email.trim()) {
          throw new Error('Please enter your email address.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }

        if (checkFirebaseConfigured()) {
          try {
            const fbUser = await loginWithEmailFirebase(email.trim(), password);
            const session: AuthSession = {
              user: {
                id: fbUser.uid,
                email: fbUser.email || email.trim(),
                name: fbUser.displayName || 'Cryptora User',
                provider: 'Firebase Email',
              },
              token: await fbUser.getIdToken(),
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            };
            onSuccess(session);
            onClose();
          } catch (fbErr: any) {
            // Check if local auditor account matches
            if (email.trim().toLowerCase() === 'security@cryptora.io') {
              const session = await loginUser(email.trim(), password);
              onSuccess(session);
              onClose();
              return;
            }
            throw fbErr;
          }
        } else {
          const session = await loginUser(email.trim(), password);
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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div
          className={`w-full ${
            mode === 'connect' ? 'max-w-xl' : 'max-w-md'
          } bg-white border border-[#E5E5E5] rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#111111]" />
              <h3 id="auth-modal-title" className="text-sm font-bold text-[#111111]">
                {mode === 'connect'
                  ? 'Connect Firebase Authentication'
                  : mode === 'login'
                  ? 'Sign In to CRYPTORA'
                  : mode === 'register'
                  ? 'Create CRYPTORA Account'
                  : 'Reset Password'}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              {mode === 'connect' && (
                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] rounded flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Setup Guide</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-[#777777] hover:text-[#111111] transition-colors rounded"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          {mode !== 'connect' && mode !== 'forgot' && (
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
          <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#DC2626] rounded space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
                {mode !== 'connect' && !checkFirebaseConfigured() && (
                  <div className="pt-2 border-t border-red-200/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('connect');
                        setError(null);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] text-[11px] font-semibold rounded"
                    >
                      Connect Firebase Credentials
                    </button>
                    <button
                      type="button"
                      onClick={handleInstantAuditorLogin}
                      className="px-2.5 py-1 bg-[#111111] hover:bg-[#333333] text-white text-[11px] font-semibold rounded flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>Instant Auditor Login</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-200 text-xs text-[#16A34A] rounded flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* DEDICATED FIREBASE CONFIGURATION POPUP */}
            {mode === 'connect' ? (
              <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
                <div className="p-3.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111] text-xs">
                      Web App Client Configuration
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGuideModal(true)}
                      className="text-[11px] font-semibold text-[#111111] hover:underline flex items-center gap-1"
                    >
                      <span>Need help? View 9-step guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    Paste your Firebase configuration snippet from Firebase Console (Project Settings &rarr; Your apps &rarr; Web app SDK config).
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-[#111111] mb-1">
                    Firebase Configuration Snippet
                  </label>
                  <textarea
                    rows={4}
                    value={snippetInput}
                    onChange={handleSnippetChange}
                    placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSyD-YOUR_KEY",\n  projectId: "your-project-id",\n  authDomain: "your-project-id.firebaseapp.com",\n  storageBucket: "your-project-id.firebasestorage.app",\n  messagingSenderId: "1234567890",\n  appId: "1:1234567890:web:abcd123"\n};`}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  />
                  <span className="text-[10px] text-[#777777] block mt-1">
                    Accepts JavaScript declaration snippet or raw JSON. Values will auto-fill below.
                  </span>
                </div>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E5E5]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                    <span className="bg-white px-2 text-[#777777]">Configuration Fields</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                      API Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                      Project ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={projectIdInput}
                      onChange={(e) => setProjectIdInput(e.target.value)}
                      placeholder="e.g. cryptora-secure-prod"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                      Auth Domain
                    </label>
                    <input
                      type="text"
                      value={authDomainInput}
                      onChange={(e) => setAuthDomainInput(e.target.value)}
                      placeholder="your-project.firebaseapp.com"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                      Storage Bucket
                    </label>
                    <input
                      type="text"
                      value={storageBucketInput}
                      onChange={(e) => setStorageBucketInput(e.target.value)}
                      placeholder="your-project.firebasestorage.app"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                      Messaging Sender ID
                    </label>
                    <input
                      type="text"
                      value={messagingSenderIdInput}
                      onChange={(e) => setMessagingSenderIdInput(e.target.value)}
                      placeholder="e.g. 123456789012"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                      App ID
                    </label>
                    <input
                      type="text"
                      value={appIdInput}
                      onChange={(e) => setAppIdInput(e.target.value)}
                      placeholder="1:123456789012:web:abcdef"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={configSaving}
                      className="px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{configSaving ? 'Initializing SDK...' : 'Save & Connect Firebase'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="px-3 py-2.5 bg-white hover:bg-[#F7F7F7] text-[#777777] border border-[#E5E5E5] font-semibold rounded text-xs transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleInstantAuditorLogin}
                    className="text-[11px] font-semibold text-[#111111] hover:underline"
                  >
                    1-Click Auditor Sign-In
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Google Sign In Button */}
                {mode !== 'forgot' && (
                  <div>
                    <button
                      type="button"
                      disabled={googleLoading}
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 px-4 bg-white hover:bg-[#F7F7F7] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] transition-colors flex items-center justify-center gap-2.5 relative group"
                    >
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
                      <span>
                        {googleLoading ? 'Connecting Google...' : 'Continue with Google'}
                      </span>
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
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <span>
                          {mode === 'login'
                            ? 'Sign In to Dashboard'
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

                {/* Bottom Utilities */}
                <div className="pt-3 border-t border-[#E5E5E5] space-y-2">
                  <button
                    type="button"
                    onClick={handleInstantAuditorLogin}
                    disabled={loading}
                    className="w-full py-2 px-3 bg-[#111111] hover:bg-[#333333] text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>Instant 1-Click Auditor Sign-In</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-[#777777] px-1">
                    <button
                      type="button"
                      onClick={handleUseDemoAccount}
                      className="hover:text-[#111111] underline"
                    >
                      Pre-fill credentials
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('connect');
                        setError(null);
                      }}
                      className="hover:text-[#111111] flex items-center gap-1 font-semibold"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Connect Firebase Authentication</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 9-Step Firebase Setup Walkthrough Modal */}
      <FirebaseSetupGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onOpenConfigurator={() => {
          setMode('connect');
        }}
      />
    </>
  );
};
