/**
 * CRYPTORA Audit Log Service
 * Records authentic client-side encryption and decryption events.
 * Strictly avoids fake mock metrics; records real user actions only.
 * Supports Firestore synchronization when Firebase is authenticated.
 */

import { AuditLogItem } from '../types/crypto';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';

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

export function logAuditEvent(item: Omit<AuditLogItem, 'id' | 'timestamp'>, userId?: string): AuditLogItem {
  const logs = getAuditLogs();
  const newItem: AuditLogItem = {
    ...item,
    id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    userId: userId || item.userId,
  };

  // Prepend so latest is first, cap to 200 entries
  const updated = [newItem, ...logs].slice(0, 200);
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));

  // Sync to Firestore if user is authenticated and db is available
  if (db && userId) {
    // Map strictly to firestore.rules allowed enum values
    const opType = newItem.type === 'decrypt' ? 'Decrypt' : newItem.type === 'hash' ? 'Hash' : 'Encrypt';
    const category = newItem.category === 'text' ? 'Text' : 'File';
    const status = newItem.status === 'success' ? 'Success' : 'Error';

    setDoc(doc(db, 'users', userId, 'history', newItem.id), {
      operationId: newItem.id,
      operationType: opType,
      category,
      algorithm: (newItem.algorithm || 'AES-256-GCM').slice(0, 64),
      fileName: (newItem.fileName || 'untitled').slice(0, 256),
      fileSize: Number(newItem.fileSize) || 0,
      mimeType: (newItem.mimeType || 'application/octet-stream').slice(0, 128),
      status,
      createdAt: newItem.timestamp,
      details: (newItem.details || '').slice(0, 2048),
    }).catch((e) => {
      // Non-blocking history sync notice
      console.warn('[CRYPTORA] Audit history sync notice (non-fatal):', e);
    });
  }

  return newItem;
}

export function deleteAuditLog(id: string, userId?: string): void {
  const logs = getAuditLogs();
  const updated = logs.filter((l) => l.id !== id);
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));

  if (db && userId) {
    deleteDoc(doc(db, 'users', userId, 'history', id)).catch((e) => {
      console.warn('[CRYPTORA] Audit history delete notice (non-fatal):', e);
    });
  }
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
    const headers = ['Timestamp', 'Type', 'Category', 'Target Identifier', 'Size (Bytes)', 'MIME Type', 'Algorithm', 'Status', 'Details'];
    const rows = logs.map((l) => [
      new Date(l.timestamp).toISOString(),
      l.type,
      l.category,
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
