/**
 * CRYPTORA About Page
 * Transparent mission statement, cryptographic guarantees, and technical background.
 */

import React from 'react';
import { CryptoraLogo } from '../common/CryptoraLogo';
import { Shield, Lock, Cpu, Globe, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (route: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-12 text-[#111111]">
      {/* Title */}
      <div className="border-b border-[#E5E5E5] pb-6 space-y-2">
        <span className="text-xs font-mono font-bold text-[#777777] uppercase">
          About CRYPTORA Platform
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
          Security Designed for Digital Sovereignty
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] leading-relaxed max-w-2xl">
          CRYPTORA is an independent cybersecurity initiative founded on the premise that digital privacy and data protection are fundamental rights that must be enforced through mathematics rather than corporate promises.
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#111111]">
            Our Core Mission
          </h2>
          <p className="text-xs text-[#777777] leading-relaxed">
            In an era of ubiquitous cloud telemetry and unauthorized AI training on personal data, confidential images, tokens, and documents should not be entrusted to opaque remote servers in plaintext.
          </p>
          <p className="text-xs text-[#777777] leading-relaxed">
            CRYPTORA guarantees that unencrypted data never leaves your workstation. Cryptographic keys, passphrases, and raw binary bytes remain isolated within your local browser runtime.
          </p>
        </div>

        <div className="border border-[#E5E5E5] rounded bg-[#F7F7F7] p-6 space-y-3 font-mono text-xs">
          <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
            Cryptographic Integrity Principles
          </span>
          <div className="space-y-2 text-[#111111]">
            <p>1. Zero Plaintext Server Transmission</p>
            <p>2. Hardware-Accelerated WebCrypto AEAD</p>
            <p>3. Standardized 128-bit Authentication Tags</p>
            <p>4. 100,000 Iteration Salted Key Derivation</p>
            <p>5. Verifiable Open Binary Container Format (.cpt)</p>
          </div>
        </div>
      </div>

      {/* Tech Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#E5E5E5]">
        <div className="space-y-2">
          <div className="w-8 h-8 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#111111]">Provable Encryption</h3>
          <p className="text-xs text-[#777777] leading-relaxed">
            Every operation is based on peer-reviewed standards (NIST SP 800-38D, FIPS 197, RFC 8018).
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-8 h-8 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#111111]">Client-Side Isolation</h3>
          <p className="text-xs text-[#777777] leading-relaxed">
            All key derivation and cipher transformations run locally via browser W3C WebCrypto API.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-8 h-8 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#111111]">Global Standards</h3>
          <p className="text-xs text-[#777777] leading-relaxed">
            Compatible with enterprise deployments, cloud identity providers, and offline secure enclaves.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-full sm:w-auto py-2.5 px-6 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors"
        >
          <span>Open Cryptora Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNavigate('security')}
          className="w-full sm:w-auto py-2.5 px-6 bg-white hover:bg-[#F7F7F7] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] transition-colors"
        >
          Review Security Architecture
        </button>
      </div>
    </div>
  );
};
