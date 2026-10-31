/**
 * CRYPTORA Privacy Policy
 * Comprehensive 13-section disclosure detailing zero-retention architecture,
 * client-side WebCrypto isolation, and Firebase processing boundaries.
 * Route: #/privacy
 */

import React from 'react';

export const PrivacyView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#111111]">
      <div className="border-b border-[#E5E5E5] pb-4">
        <span className="text-xs font-mono font-bold text-[#777777] uppercase">
          Privacy Architecture & Compliance
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#777777] mt-1 font-mono">
          Last Updated: October 2026 · CRYPTORA Version 1.0
        </p>
      </div>

      <div className="space-y-6 text-xs text-[#777777] leading-relaxed">
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">1. Information We Collect</h2>
          <p>
            CRYPTORA collects only minimal data necessary for user authentication and session management. We do NOT collect, inspect, or retain the contents of your plaintext messages, photographs, or encrypted containers.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">2. Authentication Information</h2>
          <p>
            When registering, we process your email address, display name, and a cryptographically salted PBKDF2-SHA256 password hash (or Google OAuth profile tokens when utilizing Google Sign-In).
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">3. User Profile Data</h2>
          <p>
            User profile metadata (UID, display name, email, creation timestamp, and provider identifier) is stored securely in Firebase Authentication and Cloud Firestore (or local encrypted browser storage).
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">4. Operation Metadata</h2>
          <p>
            Our operation audit log records non-sensitive operational metadata (action type, algorithm used, timestamp, status, and payload character/byte count). Passwords, keys, and raw payloads are strictly excluded from logging.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">5. Client-Side Data Processing</h2>
          <p>
            All symmetric encryption (AES-256-GCM), asymmetric operations, and hashing routines execute 100% locally within your client browser utilizing the W3C Web Cryptography API. Raw files and plaintext are processed in memory buffers and never uploaded to public cloud storage.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">6. Data Storage Policies</h2>
          <p>
            Audit records and account cache reside in your local browser’s localStorage. When Firebase is activated, audit summaries are synchronized to your private Firestore path (<code className="font-mono text-[#111111]">users/&#123;uid&#125;/history/</code>) protected by security rules.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">7. Data Retention</h2>
          <p>
            You maintain full authority over your data retention schedule. You can purge your operation audit log at any time with a single click in the History view or clear your cache in Settings.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">8. Data Security Practices</h2>
          <p>
            We implement industry-standard cryptographic primitives (100,000 PBKDF2 rounds, 128-bit CSPRNG salts, 96-bit unique nonces, 128-bit authentication tags, and HTTPS TLS 1.3 transit encryption).
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">9. Third-Party Services</h2>
          <p>
            CRYPTORA integrates with Google Firebase for optional cloud identity management and synchronized audit logs. When enabled, authentication is governed by Google’s Cloud Privacy Policies.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">10. User Rights (GDPR & CCPA)</h2>
          <p>
            You have the right to access, rectify, export (via CSV or JSON), and irreversibly delete all stored account and operational data associated with your identity.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">11. Account Deletion</h2>
          <p>
            Users can permanently delete their account and associated records directly from Account Settings. Deletion destroys local tokens and clears your profile from database storage.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">12. Policy Changes</h2>
          <p>
            Any modifications to our privacy practices will be posted directly to this route with an updated revision date.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">13. Contact Information</h2>
          <p>
            For privacy inquiries, audit exports, or security questions, contact our compliance officer at <span className="font-mono text-[#111111]">privacy@cryptora.io</span>.
          </p>
        </section>
      </div>
    </div>
  );
};
