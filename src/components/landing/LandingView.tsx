/**
 * CRYPTORA Public Landing Page
 * Conforms to Phase 4 Requirements:
 * - Hero: "Secure Your Digital World with Cryptora."
 * - Why Cryptora? section
 * - 10 Professional Feature Cards with working CTAs
 * - How It Works 6-Step workflow
 * - Security Overview: "Your Data Deserves Strong Protection."
 * - Strict White + Black palette, anti-slop typography.
 */

import React, { useState } from 'react';
import {
  FileText,
  FileCode,
  Lock,
  Unlock,
  Sliders,
  History,
  KeyRound,
  FileCheck,
  Key,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Check,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (route: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  isAuthenticated?: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onOpenAuth,
  isAuthenticated = false,
}) => {
  const handleProtectedAction = (route: string) => {
    if (isAuthenticated) {
      onNavigate(route);
    } else {
      onOpenAuth('login');
    }
  };

  const featureCards = [
    {
      id: 'text-encrypt',
      title: 'Text Encryption',
      description: 'Transform sensitive messages, tokens, and credentials into authenticated AES-256-GCM ciphertexts.',
      icon: FileText,
      action: () => handleProtectedAction('encrypt'),
      actionLabel: 'Launch Text Encryptor',
    },
    {
      id: 'text-decrypt',
      title: 'Text Decryption',
      description: 'Authenticate 128-bit GMAC tags and restore original text payloads with zero corruption risk.',
      icon: FileCode,
      action: () => handleProtectedAction('decrypt'),
      actionLabel: 'Launch Text Decryptor',
    },
    {
      id: 'file-encrypt',
      title: 'File Encryption',
      description: 'Encapsulate images, PDFs, archives, and binaries into verifiable CRYPTORA container packages.',
      icon: Lock,
      action: () => handleProtectedAction('file-encrypt'),
      actionLabel: 'Encrypt File Package',
    },
    {
      id: 'file-decrypt',
      title: 'File Decryption',
      description: 'Verify digital container signatures and restore files with exact byte-for-byte fidelity.',
      icon: Unlock,
      action: () => handleProtectedAction('file-decrypt'),
      actionLabel: 'Decrypt File Package',
    },
    {
      id: 'algorithms',
      title: 'Cryptographic Algorithms',
      description: 'Explore verified specifications of AES-GCM, CBC, ChaCha20, RSA-OAEP, SHA-2, SHA-3, and Argon2.',
      icon: Sliders,
      action: () => onNavigate('algorithms'),
      actionLabel: 'Explore Knowledge Base',
    },
    {
      id: 'history',
      title: 'Secure Activity History',
      description: 'Review isolated session logs with search, category filtering, and CSV/JSON export capability.',
      icon: History,
      action: () => handleProtectedAction('history'),
      actionLabel: 'View Audit Records',
    },
    {
      id: 'password-generator',
      title: 'Password Generator',
      description: 'Produce high-entropy passphrases utilizing CSPRNG crypto.getRandomValues with exact bit metrics.',
      icon: KeyRound,
      action: () => handleProtectedAction('password-generator'),
      actionLabel: 'Generate Passwords',
    },
    {
      id: 'file-integrity',
      title: 'File Integrity Verification',
      description: 'Compute deterministic SHA-256 and SHA-512 hashes to detect unauthorized file tampering.',
      icon: FileCheck,
      action: () => onNavigate('security'),
      actionLabel: 'Verify File Hashes',
    },
    {
      id: 'key-management',
      title: 'Encryption Key Management',
      description: 'Generate 256-bit symmetric keys, export .cptkey backups, and audit key derivation parameters.',
      icon: Key,
      action: () => handleProtectedAction('dashboard'),
      actionLabel: 'Manage Keys',
    },
    {
      id: 'security-center',
      title: 'Security Center',
      description: 'Inspect live in-browser assertion tests, zero-knowledge proofs, and client memory isolation.',
      icon: ShieldCheck,
      action: () => onNavigate('security'),
      actionLabel: 'Open Security Center',
    },
  ];

  return (
    <div className="w-full bg-white text-[#111111]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono font-bold tracking-widest text-[#777777] uppercase block">
                Enterprise Cryptography Platform
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#111111] leading-[1.08] text-balance">
                Secure Your Digital World with Cryptora.
              </h1>

              <p className="text-base sm:text-lg text-[#777777] leading-relaxed max-w-xl">
                Experience powerful encryption, secure decryption and intelligent cryptographic tools designed to protect your digital information.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      onNavigate('dashboard');
                    } else {
                      onOpenAuth('register');
                    }
                  }}
                  className="py-3 px-6 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="py-3 px-6 bg-white hover:bg-[#F7F7F7] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-[#E5E5E5] grid grid-cols-3 gap-6 text-xs text-[#777777]">
                <div>
                  <span className="block font-bold text-[#111111] text-sm">AES-256-GCM</span>
                  <span>Authenticated AEAD</span>
                </div>
                <div>
                  <span className="block font-bold text-[#111111] text-sm">PBKDF2-SHA256</span>
                  <span>100,000 Iterations</span>
                </div>
                <div>
                  <span className="block font-bold text-[#111111] text-sm">Zero Knowledge</span>
                  <span>Client-Side Isolation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Sophisticated Cybersecurity Visual Illustration */}
            <div className="lg:col-span-5">
              <div className="relative border border-[#E5E5E5] rounded bg-[#F7F7F7] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
                    <span className="font-mono font-bold text-[#111111]">CRYPTORA_KERNEL_v1.0</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#16A34A] font-semibold">AUTHENTICATED</span>
                </div>

                {/* Visual Pipeline Stack */}
                <div className="space-y-2.5 font-mono text-[11px]">
                  <div className="p-3 bg-white border border-[#E5E5E5] rounded flex items-center justify-between">
                    <span className="text-[#777777]">01. Source Binary / Text</span>
                    <span className="text-[#111111] font-semibold">Memory Allocated</span>
                  </div>
                  <div className="p-3 bg-white border border-[#E5E5E5] rounded flex items-center justify-between">
                    <span className="text-[#777777]">02. CSPRNG Nonce Generator</span>
                    <span className="text-[#111111] font-semibold">96-bit Unique</span>
                  </div>
                  <div className="p-3 bg-white border border-[#E5E5E5] rounded flex items-center justify-between">
                    <span className="text-[#777777]">03. AES-256-GCM Cipher Engine</span>
                    <span className="text-[#111111] font-semibold">Hardware Acceleration</span>
                  </div>
                  <div className="p-3 bg-white border border-[#E5E5E5] rounded flex items-center justify-between">
                    <span className="text-[#777777]">04. 128-bit GMAC Authentication</span>
                    <span className="text-[#16A34A] font-semibold">Tamper Proof</span>
                  </div>
                  <div className="p-3 bg-[#111111] text-white rounded flex items-center justify-between">
                    <span className="text-white/80">05. CRYPTORA Package Container</span>
                    <span className="font-bold text-white">.cpt Sealed</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#777777] flex items-center justify-between pt-2">
                  <span>Standard: FIPS PUB 197 / RFC 8018</span>
                  <span>Zero Plaintext Transmission</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY CRYPTORA? SECTION */}
      <section className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold tracking-widest text-[#777777] uppercase block">
              Core Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] mt-2">
              Why Choose Cryptora?
            </h2>
            <p className="text-xs sm:text-sm text-[#777777] mt-2 leading-relaxed">
              Designed from the ground up to solve modern cloud privacy dilemmas without sacrificing user ergonomics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2.5">
              <span className="text-xs font-mono font-bold text-[#111111]">01. Protect Sensitive Information</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Ensure personal photography, identification, proprietary documents, and credentials remain entirely private even if storage infrastructure is breached.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2.5">
              <span className="text-xs font-mono font-bold text-[#111111]">02. Encrypt & Decrypt Text</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Seamlessly encrypt passwords, API keys, and secret messages into compact, portable JSON envelopes authenticated against unauthorized alteration.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2.5">
              <span className="text-xs font-mono font-bold text-[#111111]">03. Secure File Operations</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Universal binary file encryption supporting photos, documents, archives, and spreadsheets up to 100MB with embedded checksum verification.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2.5">
              <span className="text-xs font-mono font-bold text-[#111111]">04. Explore Cryptographic Algorithms</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Inspect formal specifications of symmetric ciphers, public-key cryptography, hashes, and memory-hard KDF algorithms in a dedicated knowledge base.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2.5">
              <span className="text-xs font-mono font-bold text-[#111111]">05. Manage Encryption Activity</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Track authentic session operations, audit statuses, and export audit trails in CSV and JSON formats without saving private keys or sensitive payloads.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2.5">
              <span className="text-xs font-mono font-bold text-[#111111]">06. Learn Digital Security</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Execute live in-browser security assertions proving how single-bit tampering is caught by 128-bit authentication tags in Galois/Counter Mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (10 Feature Cards with working CTAs) */}
      <section id="features" className="py-20 md:py-28 border-b border-[#E5E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold tracking-widest text-[#777777] uppercase block">
              Comprehensive Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] mt-2">
              Explore CRYPTORA Security Features
            </h2>
            <p className="text-xs sm:text-sm text-[#777777] mt-2 leading-relaxed">
              Every tool is fully implemented with real hardware-accelerated WebCrypto primitives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4 hover:border-[#111111] transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111111]">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#777777] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <button
                    onClick={feat.action}
                    className="pt-3 border-t border-[#E5E5E5] text-xs font-semibold text-[#111111] hover:text-[#777777] flex items-center justify-between w-full transition-colors"
                  >
                    <span>{feat.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (6-Step Workflow) */}
      <section id="how-it-works" className="py-20 md:py-28 border-b border-[#E5E5E5] bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold tracking-widest text-[#777777] uppercase block">
              Operational Sequence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] mt-2">
              How Cryptora Works in 6 Steps
            </h2>
            <p className="text-xs sm:text-sm text-[#777777] mt-2 leading-relaxed">
              A transparent, end-to-end authenticated workflow designed for maximum confidentiality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-[#111111]">Step 1: Create an Account</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Register using your email or Google Authentication to establish your personal, isolated workspace.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-[#111111]">Step 2: Sign In Securely</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Access your dashboard via cryptographic session tokens protected by client PBKDF2 hashing.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-[#111111]">Step 3: Select Tool</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Choose Text Encryption, Text Decryption, File Encryption, File Decryption, or the Password Generator.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-[#111111]">Step 4: Configure Algorithm</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Specify AES-256-GCM, CBC, or Hash digest. Provide your password or generate a random 256-bit key.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-[#111111]">Step 5: Perform Operation</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Hardware-accelerated encryption or tag-verified decryption executes locally inside browser memory.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-2">
              <span className="text-xs font-mono font-bold text-[#111111]">Step 6: Download or Copy Result</span>
              <p className="text-xs text-[#777777] leading-relaxed">
                Download sealed .cpt containers or copy authenticated JSON packages. Plaintext is automatically purged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECURITY OVERVIEW SECTION */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <span className="text-xs font-mono font-bold tracking-widest text-[#777777] uppercase block">
            Cryptographic Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
            Your Data Deserves Strong Protection.
          </h2>
          <p className="text-sm sm:text-base text-[#777777] max-w-2xl mx-auto leading-relaxed">
            CRYPTORA strictly rejects simulated encryption and proprietary non-standard algorithms.
            Every operation is grounded in published standards from NIST and the IETF, executed client-side with full memory isolation.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  onNavigate('dashboard');
                } else {
                  onOpenAuth('register');
                }
              }}
              className="w-full sm:w-auto py-3 px-8 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors"
            >
              <span>Get Started with Cryptora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('security')}
              className="w-full sm:w-auto py-3 px-6 bg-white hover:bg-[#F7F7F7] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] transition-colors"
            >
              Review Security Architecture
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
