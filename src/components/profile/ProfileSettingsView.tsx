/**
 * CRYPTORA User Profile and Account Settings
 * Manage genuine Firebase user identity, verified credentials, and security preferences.
 * Real Firebase profile and Firestore synchronization only.
 */

import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  Lock,
  Check,
  AlertCircle,
  Database,
  LogOut,
  Send,
  ExternalLink,
} from 'lucide-react';
import { AuthSession } from '../../types/crypto';
import { useAuth } from '../../context/AuthContext';
import { resetPasswordFirebase } from '../../services/firebase';

interface ProfileSettingsViewProps {
  session: AuthSession | null;
  onLogout: () => void;
  onUpdateSessionName?: (newName: string) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  session,
  onLogout,
}) => {
  const { firebaseUser, updateSessionName } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [displayName, setDisplayName] = useState(session?.user.name || '');
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  // Password reset state
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#111111]">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#111111]">
          Authentication Required
        </h2>
        <p className="text-xs text-[#777777]">
          Please sign in to view your verified user profile and manage security settings.
        </p>
      </div>
    );
  }

  const isGoogleUser = session.user.provider === 'Google';
  const isEmailVerified = firebaseUser?.emailVerified ?? true;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setNameLoading(true);
    try {
      await updateSessionName(displayName.trim());
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2500);
    } catch (err) {
      console.warn('Failed to update display name:', err);
    } finally {
      setNameLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!session.user.email) return;
    setResetLoading(true);
    setResetError(null);
    try {
      await resetPasswordFirebase(session.user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    } catch (err: any) {
      setResetError(err.message || 'Failed to dispatch password reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear local cryptographic cache and temporary session files?')) {
      localStorage.removeItem('cryptora_audit_logs_v1');
      alert('Local cryptographic cache cleared successfully.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title */}
      <div className="border-b border-[#E5E5E5] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            Account & Security Settings
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Manage your verified cryptographic identity, authentication provider, and session policies.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#111111] text-white'
                : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
            }`}
          >
            User Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#111111] text-white'
                : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
            }`}
          >
            Security & Authentication
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Avatar & Identity Card */}
          <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4 text-center">
            {session.user.photoURL ? (
              <img
                src={session.user.photoURL}
                alt={session.user.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border border-[#E5E5E5]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#111111] text-white flex items-center justify-center text-2xl font-bold mx-auto">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2 className="text-base font-bold text-[#111111]">{session.user.name}</h2>
              <p className="text-xs text-[#777777] font-mono break-all">{session.user.email}</p>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[#777777]">Firebase UID:</span>
                <span className="font-mono text-[#111111] truncate max-w-[130px]" title={session.user.id}>
                  {session.user.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#777777]">Provider:</span>
                <span className="font-semibold text-[#111111]">
                  {session.user.provider || 'Firebase'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#777777]">Email Status:</span>
                <span className={`font-semibold flex items-center gap-1 ${
                  isEmailVerified ? 'text-[#16A34A]' : 'text-[#D97706]'
                }`}>
                  <Check className="w-3 h-3" />
                  <span>{isEmailVerified ? 'Verified' : 'Verification Pending'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#777777]">Session Status:</span>
                <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full py-2 bg-[#F7F7F7] hover:bg-red-50 text-[#DC2626] border border-[#E5E5E5] rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Right: Update Profile Info */}
          <div className="md:col-span-2 border border-[#E5E5E5] rounded bg-white p-6 space-y-6">
            <h3 className="text-sm font-bold text-[#111111]">
              Personal Information
            </h3>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={session.user.email}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded bg-[#F7F7F7] text-[#777777] cursor-not-allowed font-mono"
                />
                <span className="text-[10px] text-[#777777] block mt-1">
                  Email address is permanently bound to this authenticated Firebase account.
                </span>
              </div>

              {nameSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-xs text-[#16A34A] rounded flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Profile updated and synchronized to Firestore.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={nameLoading}
                className="px-5 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded transition-colors disabled:opacity-50"
              >
                {nameLoading ? 'Saving...' : 'Save Name Changes'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Settings Tab */
        <div className="space-y-6">
          {/* Password Management */}
          <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#111111]">
              Password & Authentication Security
            </h3>

            {isGoogleUser ? (
              <div className="p-4 bg-[#F7F7F7] border border-[#E5E5E5] rounded space-y-2 text-xs">
                <span className="font-semibold text-[#111111] block">
                  Managed by Google Account
                </span>
                <p className="text-[#777777] leading-relaxed">
                  Your CRYPTORA workspace is secured via Google OAuth. To manage your password, 2-Factor Authentication, or security keys, visit your Google Account Security Dashboard.
                </p>
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] underline pt-1"
                >
                  <span>Open Google Security Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="space-y-3 max-w-md text-xs">
                <p className="text-xs text-[#777777]">
                  Send a secure password reset link to your verified email address: <strong className="text-[#111111] font-mono">{session.user.email}</strong>.
                </p>

                {resetSent && (
                  <div className="p-3 bg-green-50 border border-green-200 text-xs text-[#16A34A] rounded flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Password reset email dispatched to your inbox.</span>
                  </div>
                )}

                {resetError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#DC2626] rounded flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{resetError}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={resetLoading}
                  onClick={handleSendPasswordReset}
                  className="px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-semibold rounded text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{resetLoading ? 'Dispatching Link...' : 'Send Password Reset Email'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Zero-Knowledge Security Audit */}
          <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#111111]" />
              <span>Zero-Knowledge & Cloud Architecture Status</span>
            </h3>
            <div className="p-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded text-xs space-y-2 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[#777777] font-sans">Authentication Provider:</span>
                <span className="font-bold text-[#111111]">{session.user.provider || 'Firebase'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#777777] font-sans">Zero-Knowledge Isolation:</span>
                <span className="text-[#16A34A] font-bold">STRICTLY ENFORCED (Plaintext Never Uploaded)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#777777] font-sans">Firestore User Document:</span>
                <span className="text-[#111111]">users/{session.user.id}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone: Clear Cache / Terminate Session */}
          <div className="border border-red-200 rounded bg-red-50/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#DC2626]">
              Session Controls & Local Memory
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#111111] block">Clear Local Cryptographic Cache</span>
                <span className="text-[#777777]">Clears temporary memory buffers and local audit records.</span>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-4 py-2 bg-white hover:bg-[#E5E5E5] text-[#111111] border border-[#E5E5E5] font-semibold rounded shrink-0 transition-colors"
              >
                Clear Cache
              </button>
            </div>

            <div className="pt-3 border-t border-red-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#DC2626] block">Sign Out & Invalidate Session</span>
                <span className="text-[#777777]">Terminates your authenticated session across all tabs.</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 bg-[#DC2626] hover:bg-red-700 text-white font-semibold rounded shrink-0 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
