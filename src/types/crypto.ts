/**
 * CRYPTORA Cryptography & Core Types
 * Strict Monochrome Cybersecurity Platform
 */

export type EncryptionMode = 'password' | 'generated_key';

export interface EncryptionOptions {
  mode: EncryptionMode;
  password?: string;
  rawKeyBytes?: Uint8Array;
  iterations?: number;
}

export interface EncryptedPackage {
  blob: Blob;
  filename: string;
  originalName: string;
  originalSize: number;
  originalMimeType: string;
  encryptedSize: number;
  saltHex: string;
  ivHex: string;
  kdfMode: 'PBKDF2-SHA256' | 'RAW-AES-256';
  iterations: number;
  timestamp: number;
  sha256Original: string;
  rawKeyHex?: string;
}

export interface DecryptedResult {
  blob: Blob;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  sha256Restored: string;
  originalSha256Expected?: string;
  verified: boolean;
  decryptionTimeMs: number;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  detectedFormat?: string;
  dimensions?: { width: number; height: number };
  sizeBytes?: number;
}

export interface CptHeaderInspection {
  valid: boolean;
  version?: number;
  kdfMode?: 'PBKDF2-SHA256' | 'RAW-AES-256';
  iterations?: number;
  saltHex?: string;
  ivHex?: string;
  metadata?: {
    originalName: string;
    mimeType: string;
    originalSize: number;
    timestamp: number;
    sha256Checksum: string;
  };
  ciphertextOffset?: number;
  ciphertextSize?: number;
  error?: string;
}

export interface AuditLogItem {
  id: string;
  type: 'encrypt' | 'decrypt';
  fileName: string;
  fileSize: number;
  mimeType: string;
  algorithm: string;
  timestamp: number;
  status: 'success' | 'failed';
  details?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  passwordSaltHex: string;
  passwordHashHex: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  expiresAt: number;
}
