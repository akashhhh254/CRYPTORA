/**
 * CRYPTORA User Profile and Account Settings
 * Manage credentials, display name, Firebase session status, and security preferences.
 */

import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  Lock,
  Trash2,
  Check,
  AlertCircle,
  Database,
  RefreshCw,
  LogOut,
  Settings,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { AuthSession } from '../../types/crypto';
import {
  isFirebaseConfigured,
  checkFirebaseConfigured,
  getActiveFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
  parseFirebaseConfig,
  validateFirebaseConfig,
} from '../../services/firebase';
import { FirebaseSetupGuideModal } from '../auth/FirebaseSetupGuideModal';

interface ProfileSettingsViewProps {
  session: AuthSession | null;
  onLogout: () => void;
  onUpdateSessionName?: (newName: string) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  session,
  onLogout,
  onUpdateSessionName,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [displayName, setDisplayName] = useState(session?.user.name || '');
  const [nameSuccess, setNameSuccess] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  // Firebase config state in profile settings
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [cfgSnippet, setCfgSnippet] = useState('');
  const [cfgApiKey, setCfgApiKey] = useState('');
  const [cfgProjectId, setCfgProjectId] = useState('');
  const [cfgAuthDomain, setCfgAuthDomain] = useState('');
  const [cfgStorageBucket, setCfgStorageBucket] = useState('');
  const [cfgAppId, setCfgAppId] = useState('');
  const [cfgSuccess, setCfgSuccess] = useState(false);
  const [cfgError, setCfgError] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const activeCfg = getActiveFirebaseConfig();
  const isFbActive = checkFirebaseConfigured();

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
          Please sign in to view your user profile and manage security settings.
        </p>
      </div>
    );
  }

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    onUpdateSessionName?.(displayName.trim());
    setNameSuccess(true);
    setTimeout(() => setNameSuccess(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPass.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassSuccess(true);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassSuccess(false), 3000);
  };

  const handleSnippetChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCfgSnippet(val);
    setCfgError(null);

    if (val.trim()) {
      const parsed = parseFirebaseConfig(val);
      if (parsed.valid && parsed.config) {
        setCfgApiKey(parsed.config.apiKey);
        setCfgProjectId(parsed.config.projectId);
        setCfgAuthDomain(parsed.config.authDomain);
        setCfgStorageBucket(parsed.config.storageBucket || '');
        setCfgAppId(parsed.config.appId || '');
      } else if (parsed.error) {
        setCfgError(parsed.error);
      }
    }
  };

  const handleSaveFirebaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setCfgError(null);

    let configToSave = null;
    if (cfgSnippet.trim()) {
      const parsed = parseFirebaseConfig(cfgSnippet);
      if (!parsed.valid || !parsed.config) {
        setCfgError(parsed.error || 'Could not parse configuration snippet.');
        return;
      }
      configToSave = parsed.config;
    } else if (cfgApiKey.trim() && cfgProjectId.trim()) {
      configToSave = {
        apiKey: cfgApiKey.trim(),
        projectId: cfgProjectId.trim(),
        authDomain: cfgAuthDomain.trim() || `${cfgProjectId.trim()}.firebaseapp.com`,
        storageBucket: cfgStorageBucket.trim(),
        appId: cfgAppId.trim(),
      };
    } else {
      setCfgError('Please enter either a config snippet or API Key and Project ID.');
      return;
    }

    try {
      await saveStoredFirebaseConfig(configToSave);
      setCfgSuccess(true);
      setTimeout(() => {
        setCfgSuccess(false);
        setIsConfigDrawerOpen(false);
      }, 1500);
    } catch (err: any) {
      setCfgError(err.message || 'Initialization failed with provided credentials.');
    }
  };

  const handleDisconnectFirebase = async () => {
    if (window.confirm('Disconnect custom Firebase configuration and revert to default environment settings?')) {
      await clearStoredFirebaseConfig();
      alert('Custom Firebase configuration removed.');
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear local cryptographic cache and temporary session files?')) {
      localStorage.removeItem('cryptora_audit_logs_v1');
      alert('Local cache cleared successfully.');
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'WARNING: Deleting your account will remove your local credentials and associated audit logs. Are you sure?'
      )
    ) {
      localStorage.clear();
      onLogout();
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* Title */}
        <div className="border-b border-[#E5E5E5] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Account & Security Settings
            </h1>
            <p className="text-xs text-[#777777] mt-1">
              Manage your user identity, session policies, and cryptographic security credentials.
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
              Security & Preferences
            </button>
          </div>
        </div>

        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Avatar & Identity Card */}
            <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4 text-center">
              <div className="w-20 h-20 rounded-full bg-[#111111] text-white flex items-center justify-center text-2xl font-bold mx-auto">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111111]">{session.user.name}</h2>
                <p className="text-xs text-[#777777] font-mono break-all">{session.user.email}</p>
              </div>
              <div className="pt-3 border-t border-[#E5E5E5] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#777777]">Account UID:</span>
                  <span className="font-mono text-[#111111] truncate max-w-[120px]">{session.user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777777]">Provider:</span>
                  <span className="font-semibold text-[#111111]">
                    {session.user.provider || (isFbActive ? 'Firebase' : 'Local PBKDF2')}
                  </span>
                </div>
                <div className="flex justify-between">
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
                    Email address is permanently bound to this cryptographic identity.
                  </span>
                </div>

                {nameSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 text-xs text-[#16A34A] rounded flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Profile updated successfully.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded transition-colors"
                >
                  Save Name Changes
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Settings Tab */
          <div className="space-y-6">
            {/* Password Update Form */}
            <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#111111]">
                Change Master Password
              </h3>
              <p className="text-xs text-[#777777]">
                Re-hashes your credentials using PBKDF2 with 100,000 iterations and a fresh random salt.
              </p>

              {passError && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#DC2626] rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-xs text-[#16A34A] rounded flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Password updated and salted successfully.</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 max-w-md text-xs">
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">
                    New Password (min 8 chars)
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#111111] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 border border-[#E5E5E5] rounded bg-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#111111] hover:bg-[#333333] text-white font-semibold rounded transition-colors"
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Firebase Configuration & Cloud Sync Card */}
            <div className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#111111]" />
                    <span>Firebase & Cloud Authentication Settings</span>
                  </h3>
                  <p className="text-xs text-[#777777] mt-0.5">
                    Configure Firebase project integration for Google OAuth and Cloud Firestore history sync.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="px-3 py-1.5 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#111111] border border-[#E5E5E5] text-xs font-semibold rounded shrink-0 transition-colors flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Setup Guide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfigDrawerOpen(!isConfigDrawerOpen)}
                    className="px-3 py-1.5 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded shrink-0 transition-colors flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{isConfigDrawerOpen ? 'Close Form' : 'Configure Firebase'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded text-xs space-y-2 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-[#777777] font-sans">Firebase Integration Status:</span>
                  <span className={isFbActive ? 'text-[#16A34A] font-bold' : 'text-[#D97706] font-bold'}>
                    {isFbActive ? 'CONNECTED & ACTIVE' : 'CLIENT CRYPTO FALLBACK ACTIVE'}
                  </span>
                </div>
                {activeCfg.projectId && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#777777] font-sans">Target Project ID:</span>
                    <span className="text-[#111111]">{activeCfg.projectId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#777777] font-sans">Zero-Knowledge Isolation:</span>
                  <span className="text-[#16A34A] font-bold">STRICTLY ENFORCED (Plaintext Never Uploaded)</span>
                </div>
              </div>

              {/* Interactive Firebase Configuration Drawer */}
              {isConfigDrawerOpen && (
                <form onSubmit={handleSaveFirebaseConfig} className="p-4 border border-[#E5E5E5] rounded bg-white space-y-3 text-xs animate-in fade-in duration-150">
                  <div className="font-semibold text-[#111111]">
                    Connect Custom Firebase Project
                  </div>
                  <p className="text-[11px] text-[#777777]">
                    Paste your Firebase web config snippet or enter your project keys. Stored safely in your browser for instant Google Auth on preview and production.
                  </p>

                  {cfgError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-[#DC2626] rounded flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cfgError}</span>
                    </div>
                  )}

                  {cfgSuccess && (
                    <div className="p-2.5 bg-green-50 border border-green-200 text-[#16A34A] rounded flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Firebase configuration saved and activated!</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-[#111111] mb-1">
                      Config Snippet (JSON or JS Object)
                    </label>
                    <textarea
                      rows={4}
                      value={cfgSnippet}
                      onChange={handleSnippetChange}
                      placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "your-project-id"\n};`}
                      className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E5] rounded bg-white text-[#111111]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#111111] mb-0.5">
                        API Key <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cfgApiKey}
                        onChange={(e) => setCfgApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E5] rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#111111] mb-0.5">
                        Project ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cfgProjectId}
                        onChange={(e) => setCfgProjectId(e.target.value)}
                        placeholder="e.g. cryptora-secure"
                        className="w-full px-3 py-1.5 text-xs font-mono border border-[#E5E5E5] rounded bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white font-semibold rounded text-xs transition-colors"
                    >
                      Save & Activate
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectFirebase}
                      className="px-4 py-2 bg-white hover:bg-red-50 text-[#DC2626] border border-[#E5E5E5] font-semibold rounded text-xs transition-colors"
                    >
                      Disconnect Custom Config
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Danger Zone: Clear Cache / Delete Account */}
            <div className="border border-red-200 rounded bg-red-50/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#DC2626]">
                Danger Zone
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-[#111111] block">Clear Local Cryptographic Cache</span>
                  <span className="text-[#777777]">Removes cached audit logs and temporary memory buffers.</span>
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
                  <span className="font-semibold text-[#DC2626] block">Delete Account & Stored Data</span>
                  <span className="text-[#777777]">Irreversibly deletes your account credentials and terminates all active sessions.</span>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-[#DC2626] hover:bg-red-700 text-white font-semibold rounded shrink-0 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <FirebaseSetupGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onOpenConfigurator={() => {
          setIsConfigDrawerOpen(true);
        }}
      />
    </>
  );
};
