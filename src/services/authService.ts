/**
 * CRYPTORA Authentication Service
 * Cryptographically secure client-side user account and session management.
 * Passwords hashed with PBKDF2-SHA256 (100,000 iterations) and unique 16-byte random salts.
 */

import { AuthSession, UserAccount } from '../types/crypto';
import { bytesToHex, hexToBytes } from './cryptoEngine';

const ACCOUNTS_STORAGE_KEY = 'cryptora_accounts_v1';
const SESSION_STORAGE_KEY = 'cryptora_session_v1';
const PBKDF2_AUTH_ITERATIONS = 100000;

/**
 * Hash password with PBKDF2-SHA256 and salt
 */
async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_AUTH_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bytesToHex(new Uint8Array(derivedBits));
}

/**
 * Get all stored user accounts
 */
function getStoredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save user accounts
 */
function saveAccounts(accounts: UserAccount[]): void {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

/**
 * Initialize default security auditor account if no accounts exist
 */
export async function initializeDefaultAccounts(): Promise<void> {
  const accounts = getStoredAccounts();
  const defaultEmail = 'security@cryptora.io';
  const exists = accounts.find((a) => a.email.toLowerCase() === defaultEmail);

  if (!exists) {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    const hashHex = await hashPassword('CryptoraSecure#2026', salt);

    accounts.push({
      id: 'usr_sec_admin_01',
      email: defaultEmail,
      name: 'Cryptora Security Auditor',
      passwordSaltHex: bytesToHex(salt),
      passwordHashHex: hashHex,
      createdAt: Date.now() - 86400000 * 7,
      lastLoginAt: Date.now(),
    });

    saveAccounts(accounts);
  }
}

/**
 * Register a new user account
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthSession> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || cleanName.length < 2) {
    throw new Error('Name must be at least 2 characters long.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const accounts = getStoredAccounts();
  if (accounts.some((a) => a.email === cleanEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const passwordHashHex = await hashPassword(password, salt);

  const newUser: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    name: cleanName,
    passwordSaltHex: bytesToHex(salt),
    passwordHashHex,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  accounts.push(newUser);
  saveAccounts(accounts);

  return createSession(newUser);
}

/**
 * Authenticate user with email and password
 */
export async function loginUser(email: string, password: string): Promise<AuthSession> {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const user = accounts.find((a) => a.email === cleanEmail);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const salt = hexToBytes(user.passwordSaltHex);
  const computedHashHex = await hashPassword(password, salt);

  if (computedHashHex !== user.passwordHashHex) {
    throw new Error('Invalid email or password.');
  }

  // Update last login
  user.lastLoginAt = Date.now();
  saveAccounts(accounts);

  return createSession(user);
}

/**
 * Create a cryptographically secure session
 */
function createSession(user: UserAccount): AuthSession {
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = bytesToHex(tokenBytes);

  const session: AuthSession = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
 * Get current active session
 */
export function getCurrentSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);

    if (Date.now() > session.expiresAt) {
      logoutUser();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Terminate user session
 */
export function logoutUser(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
