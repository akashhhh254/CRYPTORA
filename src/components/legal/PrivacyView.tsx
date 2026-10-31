/**
 * CRYPTORA Privacy Policy
 * Authentic disclosure of client-side zero-retention architecture.
 */

import React from 'react';

export const PrivacyView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#111111]">
      <div className="border-b border-[#E5E5E5] pb-4">
        <span className="text-xs font-mono font-bold text-[#666666] uppercase">
          Compliance & Legal
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Last revised: October 2026 · CRYPTORA Zero-Knowledge Guarantee
        </p>
      </div>

      <div className="space-y-6 text-xs text-[#666666] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#111111]">
            1. Zero-Retention of Plaintext Data
          </h2>
          <p>
            CRYPTORA operates strictly on client-side hardware using the standardized W3C Web Cryptography API.
            When you select an image file to encrypt or upload a container to decrypt, the raw bytes are processed directly inside your browser’s isolated memory space.
          </p>
          <p className="font-semibold text-[#111111]">
            Neither your original image files, decrypted images, encryption passphrases, nor raw cryptographic keys are ever transmitted to or stored on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#111111]">
            2. Local Storage and Session Data
          </h2>
          <p>
            Account credentials registered on this platform utilize unique 16-byte cryptographically secure random salts and are hashed with PBKDF2-SHA256 (100,000 iterations) before storage in your local client browser storage.
            Session tokens and audit activity records are stored strictly on your local device and can be cleared at any time from your Security Dashboard.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#111111]">
            3. Telemetry and Analytics Policy
          </h2>
          <p>
            CRYPTORA strictly rejects privacy-invasive tracking, third-party advertising scripts, and keystroke logging.
            We do not collect information about your image contents, file metadata, or decryption passphrases.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#111111]">
            4. User Responsibilities & Custody of Keys
          </h2>
          <p>
            Because CRYPTORA enforces authenticated encryption (AES-256-GCM) with zero server backdoors,
            <strong> loss of your encryption password or master key makes data restoration mathematically impossible</strong>.
            You maintain full sovereign custody over your credentials.
          </p>
        </section>
      </div>
    </div>
  );
};
