/**
 * CRYPTORA Audit Log Service
 * Records authentic client-side encryption and decryption events.
 * Strictly avoids fake mock metrics; records real user actions only.
 */

import { AuditLogItem } from '../types/crypto';

const AUDIT_STORAGE_KEY = 'cryptora_audit_logs_v1';

export function getAuditLogs(): AuditLogItem[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logAuditEvent(item: Omit<AuditLogItem, 'id' | 'timestamp'>): AuditLogItem {
  const logs = getAuditLogs();
  const newItem: AuditLogItem = {
    ...item,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };

  // Prepend so latest is first, cap to 100 entries
  const updated = [newItem, ...logs].slice(0, 100);
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  return newItem;
}

export function clearAuditLogs(): void {
  localStorage.removeItem(AUDIT_STORAGE_KEY);
}

export function exportAuditLogs(format: 'json' | 'csv'): void {
  const logs = getAuditLogs();
  let content = '';
  let filename = `cryptora_audit_log_${new Date().toISOString().split('T')[0]}`;
  let type = '';

  if (format === 'json') {
    content = JSON.stringify(logs, null, 2);
    filename += '.json';
    type = 'application/json';
  } else {
    const headers = ['Timestamp', 'Type', 'File Name', 'Size (Bytes)', 'MIME Type', 'Algorithm', 'Status', 'Details'];
    const rows = logs.map((l) => [
      new Date(l.timestamp).toISOString(),
      l.type,
      `"${l.fileName.replace(/"/g, '""')}"`,
      l.fileSize,
      l.mimeType,
      l.algorithm,
      l.status,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);
    content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    filename += '.csv';
    type = 'text/csv';
  }

  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
