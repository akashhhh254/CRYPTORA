/**
 * CRYPTORA Technical Documentation & Cryptographic Specification
 * Complete documentation of the CPT container layout, NIST SP 800-38D implementation,
 * and Zero-Knowledge security architecture.
 */

import React from 'react';
import { Shield, Lock, FileCode, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface DocsViewProps {
  onNavigate: (route: string) => void;
}

export const DocsView: React.FC<DocsViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-12">
      {/* Title */}
      <div className="border-b border-[#E5E5E5] pb-6 space-y-2">
        <span className="text-xs font-mono font-bold text-[#666666] uppercase">
          Technical Whitepaper · Specification v1.0
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
          CRYPTORA Cryptographic Architecture & CPT Container
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
          Comprehensive specification of the cryptographic primitives, key derivation algorithms, and binary container standards powering CRYPTORA.
        </p>
      </div>

      {/* Section 1: Security Model */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#111111]">
          1. Zero-Knowledge Threat Model
        </h2>
        <p className="text-xs text-[#666666] leading-relaxed">
          CRYPTORA is engineered under a strict <strong>Zero-Knowledge client-authoritative security model</strong>.
          All cryptographic operations occur entirely inside the user's browser using hardware-accelerated instructions provided by the W3C Web Cryptography API (<code className="font-mono text-[#111111]">window.crypto.subtle</code>).
        </p>
        <div className="border border-[#E5E5E5] rounded p-4 bg-[#F5F5F5] text-xs space-y-2 text-[#666666]">
          <p className="font-semibold text-[#111111]">Core Security Guarantees:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Plaintext image pixels never transit over network connections.</li>
            <li>Passphrases and raw encryption keys are never stored on external servers or written to persistent logs.</li>
            <li>Key derivation (PBKDF2) occurs directly within browser threads with 100,000 iterations to resist GPU-based brute-force attacks.</li>
            <li>Authenticated encryption (AES-GCM) detects any bit flips, intentional alterations, or truncations before releasing decrypted bytes.</li>
          </ul>
        </div>
      </section>

      {/* Section 2: CPT Binary Format */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#111111]">
          2. The CPT Container Binary Layout
        </h2>
        <p className="text-xs text-[#666666] leading-relaxed">
          The <code className="font-mono text-[#111111]">.cpt</code> (CRYPTORA Package Container) format is a versioned, endian-safe binary structure. It encapsulates all cryptographic parameters required for deterministic decryption without exposing the plaintext or key material.
        </p>

        <div className="border border-[#E5E5E5] rounded overflow-hidden text-xs font-mono">
          <div className="bg-[#111111] text-white px-4 py-2 text-[11px] font-bold">
            CPT Container Byte Stream (Big-Endian)
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[11px] text-[#666666]">
              <tr>
                <th className="p-3">Offset</th>
                <th className="p-3">Field</th>
                <th className="p-3">Size</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <tr>
                <td className="p-3">0x00..0x07</td>
                <td className="p-3 font-semibold text-[#111111]">Magic Bytes</td>
                <td className="p-3">8 bytes</td>
                <td className="p-3 text-[#666666] font-sans">ASCII "CRYPTORA" (0x43 0x52 0x59 0x50 0x54 0x4F 0x52 0x41)</td>
              </tr>
              <tr>
                <td className="p-3">0x08</td>
                <td className="p-3 font-semibold text-[#111111]">Version</td>
                <td className="p-3">1 byte</td>
                <td className="p-3 text-[#666666] font-sans">0x01 (CPT Version 1)</td>
              </tr>
              <tr>
                <td className="p-3">0x09</td>
                <td className="p-3 font-semibold text-[#111111]">KDF Mode</td>
                <td className="p-3">1 byte</td>
                <td className="p-3 text-[#666666] font-sans">0x01 (PBKDF2-SHA256) or 0x02 (Raw AES-256 Key)</td>
              </tr>
              <tr>
                <td className="p-3">0x0A..0x0D</td>
                <td className="p-3 font-semibold text-[#111111]">Iterations</td>
                <td className="p-3">4 bytes</td>
                <td className="p-3 text-[#666666] font-sans">Uint32BE (default 100,000 rounds)</td>
              </tr>
              <tr>
                <td className="p-3">0x0E</td>
                <td className="p-3 font-semibold text-[#111111]">Salt Length</td>
                <td className="p-3">1 byte</td>
                <td className="p-3 text-[#666666] font-sans">0x10 (16 bytes)</td>
              </tr>
              <tr>
                <td className="p-3">0x0F..0x1E</td>
                <td className="p-3 font-semibold text-[#111111]">Random Salt</td>
                <td className="p-3">16 bytes</td>
                <td className="p-3 text-[#666666] font-sans">Cryptographically secure random salt</td>
              </tr>
              <tr>
                <td className="p-3">0x1F</td>
                <td className="p-3 font-semibold text-[#111111]">IV Length</td>
                <td className="p-3">1 byte</td>
                <td className="p-3 text-[#666666] font-sans">0x0C (12 bytes)</td>
              </tr>
              <tr>
                <td className="p-3">0x20..0x2B</td>
                <td className="p-3 font-semibold text-[#111111]">Nonce / IV</td>
                <td className="p-3">12 bytes</td>
                <td className="p-3 text-[#666666] font-sans">Standard 96-bit AES-GCM IV (never reused)</td>
              </tr>
              <tr>
                <td className="p-3">0x2C..0x2D</td>
                <td className="p-3 font-semibold text-[#111111]">Meta Length</td>
                <td className="p-3">2 bytes</td>
                <td className="p-3 text-[#666666] font-sans">Uint16BE length of UTF-8 JSON metadata</td>
              </tr>
              <tr>
                <td className="p-3">Variable</td>
                <td className="p-3 font-semibold text-[#111111]">Metadata JSON</td>
                <td className="p-3">N bytes</td>
                <td className="p-3 text-[#666666] font-sans">JSON with originalName, mimeType, originalSize, sha256Checksum</td>
              </tr>
              <tr>
                <td className="p-3">Variable..End</td>
                <td className="p-3 font-semibold text-[#111111]">Ciphertext + Tag</td>
                <td className="p-3">Variable</td>
                <td className="p-3 text-[#666666] font-sans">AES-256-GCM ciphertext followed by 16-byte authentication tag</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Genuine Cryptography vs Pseudo-Security */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#111111]">
          3. Genuine Cryptography vs Pseudo-Security (Anti-Patterns)
        </h2>
        <p className="text-xs text-[#666666] leading-relaxed">
          Many deceptive platforms simulate encryption using encoding schemes or superficial transformations. CRYPTORA adheres strictly to verified cryptographic constructions:
        </p>

        <div className="border border-[#E5E5E5] rounded overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[11px] font-semibold text-[#666666]">
              <tr>
                <th className="p-3">Technique</th>
                <th className="p-3">Security Level</th>
                <th className="p-3">CRYPTORA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <tr>
                <td className="p-3 font-medium text-[#111111]">Base64 / Hex Encoding</td>
                <td className="p-3 text-[#DC2626]">Zero Security (Reversible encoding, not encryption)</td>
                <td className="p-3 font-bold text-[#DC2626]">STRICTLY BANNED</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-[#111111]">XOR / Rot13 Obfuscation</td>
                <td className="p-3 text-[#DC2626]">Trivial to break via frequency analysis</td>
                <td className="p-3 font-bold text-[#DC2626]">STRICTLY BANNED</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-[#111111]">AES-ECB (Electronic Codebook)</td>
                <td className="p-3 text-[#D97706]">Insecure (Leaks pattern outlines in image bitmaps)</td>
                <td className="p-3 font-bold text-[#DC2626]">STRICTLY BANNED</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-[#111111]">AES-256-GCM + PBKDF2-SHA256</td>
                <td className="p-3 text-[#16A34A]">NIST Standard Authenticated Encryption</td>
                <td className="p-3 font-bold text-[#16A34A]">OFFICIAL STANDARD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Actions */}
      <div className="pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => onNavigate('encrypt')}
          className="w-full sm:w-auto py-2.5 px-6 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors"
        >
          <span>Launch Encryption Module</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNavigate('decrypt')}
          className="w-full sm:w-auto py-2.5 px-6 bg-white hover:bg-[#F5F5F5] text-[#111111] text-xs font-medium rounded border border-[#E5E5E5] transition-colors"
        >
          Launch Decryption Module
        </button>
      </div>
    </div>
  );
};
