/**
 * CRYPTORA Session Management Service
 * Manages authentic client-side session tokens derived exclusively from verified Firebase Authentication.
 * No dummy accounts, fake credentials, or local authentication bypasses.
 */

import { AuthSession } from '../types/crypto';

const SESSION_STORAGE_KEY = 'cryptora_session_v1';

/**
 * Save an authentic user session
 */
export function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Could not persist session to localStorage:', e);
  }
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
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('Could not remove session from localStorage:', e);
  }
}
