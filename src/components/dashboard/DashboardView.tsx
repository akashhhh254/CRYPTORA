/**
 * CRYPTORA Authenticated Dashboard
 * Enterprise cybersecurity workspace with complete sidebar navigation,
 * authentic operational statistics, quick action triggers, and embedded sub-modules.
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileCode,
  FileText,
  File,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  History,
  Sliders,
  User,
  LogOut,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Menu,
  X,
} from 'lucide-react';
import { AuthSession, AuditLogItem } from '../../types/crypto';
import { getAuditLogs } from '../../services/auditService';
import { TextEncryptModule } from '../encryption/TextEncryptModule';
import { TextDecryptModule } from '../decryption/TextDecryptModule';
import { EncryptModule } from '../encryption/EncryptModule';
import { DecryptModule } from '../decryption/DecryptModule';
import { AlgorithmsView } from '../algorithms/AlgorithmsView';
import { HistoryView } from '../history/HistoryView';
import { PasswordGenerator } from '../tools/PasswordGenerator';
import { SecurityView } from '../security/SecurityView';
import { ProfileSettingsView } from '../profile/ProfileSettingsView';

interface DashboardViewProps {
  session: AuthSession | null;
  initialTab?: string;
  onNavigate: (route: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  session,
  initialTab = 'overview',
  onNavigate,
  onOpenAuth,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preloadedDecryptPayload, setPreloadedDecryptPayload] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLogs(getAuditLogs());
  }, [activeTab]);

  // Derive authentic metrics (NO FAKE NUMBERS)
  const totalEncrypt = logs.filter((l) => l.type === 'encrypt').length;
  const totalDecrypt = logs.filter((l) => l.type === 'decrypt').length;
  const totalFiles = logs.filter((l) => l.category === 'file').length;
  const totalText = logs.filter((l) => l.category === 'text').length;

  // Derive algorithm frequency
  const algCounts: Record<string, number> = {};
  logs.forEach((l) => {
    algCounts[l.algorithm] = (algCounts[l.algorithm] || 0) + 1;
  });

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'text-encrypt', label: 'Text Encryption', icon: FileText },
    { id: 'text-decrypt', label: 'Text Decryption', icon: FileCode },
    { id: 'file-encrypt', label: 'File Encryption', icon: Lock },
    { id: 'file-decrypt', label: 'File Decryption', icon: Unlock },
    { id: 'algorithms', label: 'Algorithms', icon: Sliders },
    { id: 'history', label: 'Operation History', icon: History },
    { id: 'password-generator', label: 'Password Generator', icon: KeyRound },
    { id: 'security-center', label: 'Security Center', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-white text-[#111111]">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 bg-[#111111] text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none"
          aria-label={sidebarOpen ? 'Close Menu' : 'Open Dashboard Menu'}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-[#E5E5E5] flex flex-col justify-between shrink-0 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="py-5 px-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 pb-3 mb-2 border-b border-[#E5E5E5]">
            <span className="text-[10px] font-mono font-bold text-[#777777] uppercase tracking-wider block">
              Workspace Dashboard
            </span>
            <span className="text-xs font-semibold text-[#111111] truncate block mt-0.5">
              {session?.user.name || 'Local Session'}
            </span>
          </div>

          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
                  isActive
                    ? 'bg-[#111111] text-white font-semibold'
                    : 'text-[#777777] hover:text-[#111111] hover:bg-[#F7F7F7]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E5E5E5]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#DC2626] hover:bg-red-50 rounded transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Greeting */}
            <div className="border border-[#E5E5E5] rounded bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
                  Welcome back, {session?.user.name || 'Security Auditor'}
                </h1>
                <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                  Cryptographic operations run locally inside your browser's hardware memory space.
                  Zero unencrypted data leaves this workstation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTabChange('text-encrypt')}
                  className="px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypt Text</span>
                </button>
                <button
                  onClick={() => handleTabChange('file-encrypt')}
                  className="px-4 py-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#111111] border border-[#E5E5E5] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <File className="w-3.5 h-3.5" />
                  <span>Encrypt File</span>
                </button>
              </div>
            </div>

            {/* Authentic Operational Metrics (STRICT: ONLY GENUINE DATA) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-[#E5E5E5] rounded bg-white p-5 space-y-1">
                <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                  Total Encryptions
                </span>
                <span className="text-2xl font-bold font-mono text-[#111111] block tabular-nums">
                  {totalEncrypt}
                </span>
                <span className="text-[11px] text-[#777777]">Authenticated runs</span>
              </div>

              <div className="border border-[#E5E5E5] rounded bg-white p-5 space-y-1">
                <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                  Total Decryptions
                </span>
                <span className="text-2xl font-bold font-mono text-[#111111] block tabular-nums">
                  {totalDecrypt}
                </span>
                <span className="text-[11px] text-[#777777]">Verified restorations</span>
              </div>

              <div className="border border-[#E5E5E5] rounded bg-white p-5 space-y-1">
                <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                  File Operations
                </span>
                <span className="text-2xl font-bold font-mono text-[#111111] block tabular-nums">
                  {totalFiles}
                </span>
                <span className="text-[11px] text-[#777777]">Images & Documents</span>
              </div>

              <div className="border border-[#E5E5E5] rounded bg-white p-5 space-y-1">
                <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
                  Text Operations
                </span>
                <span className="text-2xl font-bold font-mono text-[#111111] block tabular-nums">
                  {totalText}
                </span>
                <span className="text-[11px] text-[#777777]">Strings & Payloads</span>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleTabChange('text-encrypt')}
                className="border border-[#E5E5E5] rounded bg-white p-5 text-left hover:border-[#111111] transition-colors space-y-2 group"
              >
                <div className="w-8 h-8 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#111111] flex items-center justify-between">
                  <span>Encrypt Text</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#777777]">
                  Protect passwords, keys, or sensitive text notes.
                </p>
              </button>

              <button
                onClick={() => handleTabChange('text-decrypt')}
                className="border border-[#E5E5E5] rounded bg-white p-5 text-left hover:border-[#111111] transition-colors space-y-2 group"
              >
                <div className="w-8 h-8 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                  <FileCode className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#111111] flex items-center justify-between">
                  <span>Decrypt Text</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#777777]">
                  Restore ciphertexts and verify GMAC tags.
                </p>
              </button>

              <button
                onClick={() => handleTabChange('file-encrypt')}
                className="border border-[#E5E5E5] rounded bg-white p-5 text-left hover:border-[#111111] transition-colors space-y-2 group"
              >
                <div className="w-8 h-8 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#111111] flex items-center justify-between">
                  <span>Encrypt File</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#777777]">
                  Encapsulate images or binaries into a .cpt package.
                </p>
              </button>

              <button
                onClick={() => handleTabChange('file-decrypt')}
                className="border border-[#E5E5E5] rounded bg-white p-5 text-left hover:border-[#111111] transition-colors space-y-2 group"
              >
                <div className="w-8 h-8 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                  <Unlock className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#111111] flex items-center justify-between">
                  <span>Decrypt File</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#777777]">
                  Extract and verify encrypted .cpt packages.
                </p>
              </button>
            </div>

            {/* Recent Activity Table */}
            <div className="border border-[#E5E5E5] rounded bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F7F7F7] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                    Recent Cryptographic Activity
                  </h3>
                  <span className="text-[11px] text-[#777777]">Real operations recorded on this device</span>
                </div>
                <button
                  onClick={() => handleTabChange('history')}
                  className="text-xs text-[#111111] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View All ({logs.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#777777] space-y-1">
                  <p className="font-semibold text-[#111111]">No recent activity logs recorded</p>
                  <p>Encrypted or decrypted files and strings will appear here automatically.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F7F7] border-b border-[#E5E5E5] text-[11px] font-semibold text-[#777777] uppercase">
                      <tr>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3">Target</th>
                        <th className="px-6 py-3">Algorithm</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {logs.slice(0, 5).map((l) => (
                        <tr key={l.id} className="hover:bg-[#F7F7F7]/60 transition-colors">
                          <td className="px-6 py-3 font-mono text-[#777777] whitespace-nowrap">
                            {new Date(l.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-3 font-semibold text-[#111111] whitespace-nowrap">
                            {l.type.toUpperCase()}
                          </td>
                          <td className="px-6 py-3 font-mono text-[#111111] truncate max-w-[220px]">
                            {l.fileName}
                          </td>
                          <td className="px-6 py-3 font-mono text-[#777777]">
                            {l.algorithm}
                          </td>
                          <td className="px-6 py-3 text-right whitespace-nowrap">
                            {l.status === 'success' ? (
                              <span className="text-[#16A34A] font-semibold flex items-center justify-end gap-1 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="text-[#DC2626] font-semibold flex items-center justify-end gap-1 text-[11px]">
                                <XCircle className="w-3.5 h-3.5" /> Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Embedded Sub-Modules */}
        {activeTab === 'text-encrypt' && (
          <TextEncryptModule
            userId={session?.user.id}
            onNavigateToDecrypt={(payload) => {
              setPreloadedDecryptPayload(payload);
              setActiveTab('text-decrypt');
            }}
          />
        )}

        {activeTab === 'text-decrypt' && (
          <TextDecryptModule
            userId={session?.user.id}
            initialPayloadJson={preloadedDecryptPayload}
          />
        )}

        {activeTab === 'file-encrypt' && (
          <EncryptModule
            onDecryptionShortcut={() => setActiveTab('file-decrypt')}
          />
        )}

        {activeTab === 'file-decrypt' && (
          <DecryptModule />
        )}

        {activeTab === 'algorithms' && (
          <AlgorithmsView />
        )}

        {activeTab === 'history' && (
          <HistoryView
            userId={session?.user.id}
            onNavigateToTool={(tool) => handleTabChange(tool)}
          />
        )}

        {activeTab === 'password-generator' && (
          <PasswordGenerator />
        )}

        {activeTab === 'security-center' && (
          <SecurityView />
        )}

        {(activeTab === 'profile' || activeTab === 'settings') && (
          <ProfileSettingsView
            session={session}
            onLogout={onLogout}
          />
        )}
      </div>
    </div>
  );
};
