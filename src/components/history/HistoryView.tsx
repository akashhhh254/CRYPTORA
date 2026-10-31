/**
 * CRYPTORA Operation History & Audit Vault
 * Complete user-isolated activity logging with search, filters, individual deletion, and CSV/JSON export.
 * NEVER stores plaintext, passwords, or cryptographic keys.
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Download,
  Trash2,
  Search,
  Filter,
  Lock,
  Unlock,
  Hash,
  CheckCircle2,
  XCircle,
  FileText,
  File,
  Eye,
  X,
} from 'lucide-react';
import { AuditLogItem } from '../../types/crypto';
import {
  getAuditLogs,
  deleteAuditLog,
  clearAuditLogs,
  exportAuditLogs,
} from '../../services/auditService';

interface HistoryViewProps {
  userId?: string;
  onNavigateToTool?: (route: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  userId,
  onNavigateToTool,
}) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'encrypt' | 'decrypt' | 'file' | 'text'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AuditLogItem | null>(null);

  const loadLogs = () => {
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Delete this audit entry?')) {
      deleteAuditLog(id, userId);
      loadLogs();
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to permanently clear all local operation history records?')) {
      clearAuditLogs();
      setLogs([]);
      setSelectedRecord(null);
    }
  };

  // Filter and search computation
  const filteredLogs = logs.filter((log) => {
    // Type/Category filter
    if (filterType === 'encrypt' && log.type !== 'encrypt') return false;
    if (filterType === 'decrypt' && log.type !== 'decrypt') return false;
    if (filterType === 'file' && log.category !== 'file') return false;
    if (filterType === 'text' && log.category !== 'text') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = log.fileName.toLowerCase().includes(q);
      const matchAlg = log.algorithm.toLowerCase().includes(q);
      const matchId = log.id.toLowerCase().includes(q);
      return matchName || matchAlg || matchId;
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            Operation History & Audit Vault
          </h1>
          <p className="text-xs text-[#777777] mt-1 leading-relaxed">
            Authentic records of cryptographic operations executed under your session.
            Passwords and plaintext are strictly never stored.
          </p>
        </div>

        {logs.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportAuditLogs('csv')}
              className="px-3 py-1.5 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#111111] border border-[#E5E5E5] rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportAuditLogs('json')}
              className="px-3 py-1.5 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#111111] border border-[#E5E5E5] rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#DC2626] border border-red-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 border border-[#E5E5E5] rounded">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterType === 'all'
                ? 'bg-[#111111] text-white font-medium'
                : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
            }`}
          >
            All Operations ({logs.length})
          </button>
          <button
            onClick={() => setFilterType('encrypt')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterType === 'encrypt'
                ? 'bg-[#111111] text-white font-medium'
                : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
            }`}
          >
            Encryption
          </button>
          <button
            onClick={() => setFilterType('decrypt')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterType === 'decrypt'
                ? 'bg-[#111111] text-white font-medium'
                : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
            }`}
          >
            Decryption
          </button>
          <button
            onClick={() => setFilterType('file')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterType === 'file'
                ? 'bg-[#111111] text-white font-medium'
                : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
            }`}
          >
            File Operations
          </button>
          <button
            onClick={() => setFilterType('text')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterType === 'text'
                ? 'bg-[#111111] text-white font-medium'
                : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
            }`}
          >
            Text Operations
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file or algorithm..."
            className="w-full px-3 py-1.5 pl-8 text-xs border border-[#E5E5E5] rounded bg-[#F7F7F7] text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
          <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Records Table */}
      <div className="border border-[#E5E5E5] rounded bg-white overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center mx-auto text-[#777777]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#111111]">
              No matching operation logs found
            </h3>
            <p className="text-xs text-[#777777] max-w-sm mx-auto">
              {logs.length === 0
                ? 'Perform an encryption or decryption task to generate authentic session logs.'
                : 'Try adjusting your search criteria or category filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F7F7] border-b border-[#E5E5E5] text-[11px] font-semibold text-[#777777] uppercase">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Target Payload</th>
                  <th className="px-6 py-3">Algorithm</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F7F7F7]/60 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-[#777777] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString()} · {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-[#111111] whitespace-nowrap">
                      {log.type === 'encrypt' ? (
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-[#111111]" /> Encrypt
                        </span>
                      ) : log.type === 'decrypt' ? (
                        <span className="flex items-center gap-1.5">
                          <Unlock className="w-3.5 h-3.5 text-[#111111]" /> Decrypt
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-[#111111]" /> Hash
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 uppercase font-mono text-[10px] text-[#777777] whitespace-nowrap">
                      {log.category}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[#111111] truncate max-w-[200px]">
                      {log.fileName}
                    </td>
                    <td className="px-6 py-3.5 font-mono font-medium text-[#111111] whitespace-nowrap">
                      {log.algorithm}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-[#16A34A] font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#DC2626] font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRecord(log)}
                          className="p-1 text-[#777777] hover:text-[#111111] hover:bg-[#E5E5E5] rounded transition-colors"
                          title="View Details"
                          aria-label="View record details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(log.id)}
                          className="p-1 text-[#777777] hover:text-[#DC2626] hover:bg-red-50 rounded transition-colors"
                          title="Delete Record"
                          aria-label="Delete audit record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-[#E5E5E5] rounded shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">
                Operation Audit Record: {selectedRecord.id}
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#777777] hover:text-[#111111]"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded">
                <div>
                  <span className="text-[#777777] block text-[10px] font-sans">Operation:</span>
                  <span className="text-[#111111] font-bold">{selectedRecord.type.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[#777777] block text-[10px] font-sans">Category:</span>
                  <span className="text-[#111111] font-bold">{selectedRecord.category.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[#777777] block text-[10px] font-sans">Algorithm:</span>
                  <span className="text-[#111111] font-bold">{selectedRecord.algorithm}</span>
                </div>
                <div>
                  <span className="text-[#777777] block text-[10px] font-sans">Status:</span>
                  <span className={selectedRecord.status === 'success' ? 'text-[#16A34A] font-bold' : 'text-[#DC2626] font-bold'}>
                    {selectedRecord.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[#777777] block text-[11px] font-sans font-semibold mb-1">
                  Target Identifier / Name:
                </span>
                <div className="p-2.5 bg-white border border-[#E5E5E5] rounded break-all text-[#111111]">
                  {selectedRecord.fileName}
                </div>
              </div>

              <div>
                <span className="text-[#777777] block text-[11px] font-sans font-semibold mb-1">
                  Recorded Details:
                </span>
                <div className="p-2.5 bg-white border border-[#E5E5E5] rounded break-all text-[#777777]">
                  {selectedRecord.details || 'Standard cryptographic validation completed successfully.'}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#E5E5E5] text-[11px] text-[#777777]">
                <span>Timestamp: {new Date(selectedRecord.timestamp).toISOString()}</span>
                <button
                  onClick={() => handleDeleteRecord(selectedRecord.id)}
                  className="text-[#DC2626] hover:underline"
                >
                  Delete this record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
