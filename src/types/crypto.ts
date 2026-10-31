/**
 * CRYPTORA Cryptography & Core Types
 * Complete Full-Stack Cybersecurity Platform Types
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

export interface TextEncryptionResult {
  ciphertext: string;
  algorithm: string;
  ivHex?: string;
  saltHex?: string;
  tagHex?: string;
  keyHex?: string;
  timestamp: number;
  isHash?: boolean;
  packageJson?: string;
}

export interface AuditLogItem {
  id: string;
  type: 'encrypt' | 'decrypt' | 'hash';
  category: 'text' | 'file';
  fileName: string;
  fileSize: number;
  mimeType: string;
  algorithm: string;
  timestamp: number;
  status: 'success' | 'failed';
  details?: string;
  userId?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  passwordSaltHex: string;
  passwordHashHex: string;
  createdAt: number;
  lastLoginAt: number;
  photoURL?: string;
  provider?: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
    provider?: string;
  };
  token: string;
  expiresAt: number;
}

export interface AlgorithmInfo {
  id: string;
  name: string;
  category: 'symmetric' | 'asymmetric' | 'hash' | 'kdf';
  purpose: string;
  workingPrinciple: string;
  keySize: string;
  securityCharacteristics: string;
  applications: string;
  advantages: string[];
  limitations: string[];
  standard: string;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}
