/**
 * CRYPTORA Landing Page
 * Strictly adheres to White + Black visual identity (#FFFFFF canvas, #111111 typography).
 * Real cryptographic storytelling, zero-pill discipline, anti-slop principles.
 */

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Shield,
  FileCheck,
  Cpu,
  ArrowRight,
  Check,
  KeyRound,
  Download,
  Eye,
  FileCode2,
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (route: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onOpenAuth,
}) => {
  // Interactive Live Cryptographic Sandbox on Landing Page
  const [sampleText, setSampleText] = useState('Confidential biometric specimen #8491');
  const [samplePassword, setSamplePassword] = useState('AlphaBravo#2026');
  const [demoCiphertext, setDemoCiphertext] = useState('');
  const [demoTag, setDemoTag] = useState('');
  const [isDemoEncrypting, setIsDemoEncrypting] = useState(false);

  const handleRunDemoEncryption = async () => {
    setIsDemoEncrypting(true);
    try {
      const enc = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Derive key
      const passKey = await crypto.subtle.importKey(
        'raw',
        enc.encode(samplePassword),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      const aesKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 10000,
          hash: 'SHA-256',
        },
        passKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, tagLength: 128 },
        aesKey,
        enc.encode(sampleText)
      );

      const ctBytes = new Uint8Array(ciphertext);
      let hex = '';
      for (let i = 0; i < ctBytes.length; i++) {
        hex += ctBytes[i].toString(16).padStart(2, '0');
      }

      setDemoCiphertext(hex.slice(0, hex.length - 32));
      setDemoTag(hex.slice(hex.length - 32));
    } catch (e) {
      // Demo error handling
    } finally {
      setIsDemoEncrypting(false);
    }
  };

  return (
    <div className="w-full bg-white text-[#111111] overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs font-bold tracking-widest text-[#666666] uppercase">
              Authenticated Image Cryptography
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#111111] leading-[1.08] text-balance">
              Your Images. Your Security. Your Control.
            </h1>

            <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-2xl">
              Protect your digital images with secure encryption and straightforward decryption workflows.
              Experience privacy-focused image protection with CRYPTORA.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('encrypt')}
                className="py-3 px-6 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <span>Start Encrypting</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3 px-6 bg-white hover:bg-[#F5F5F5] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <span>Explore How It Works</span>
              </button>
            </div>

            <div className="pt-8 border-t border-[#E5E5E5] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#666666]">
              <div>
                <span className="block font-bold text-[#111111] text-sm">AES-256-GCM</span>
                <span>Authenticated encryption standard</span>
              </div>
              <div>
                <span className="block font-bold text-[#111111] text-sm">Zero Knowledge</span>
                <span>100% Client-side local execution</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block font-bold text-[#111111] text-sm">Verifiable CPT</span>
                <span>Tamper-evident container format</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 md:py-28 border-b border-[#E5E5E5] bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#666666] uppercase">
              Workflow Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] mt-2">
              How CRYPTORA Works
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1.5 max-w-xl">
              A transparent, mathematically provable sequence engineered for total confidentiality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-4">
              <span className="text-xs font-mono font-bold text-[#666666]">
                01. Upload Your Image
              </span>
              <h3 className="text-base font-bold text-[#111111]">
                Signature Validation
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Upload your PNG, JPEG, WEBP, GIF, SVG, BMP, or TIFF file. CRYPTORA inspects raw magic byte signatures and processes the image locally in browser memory.
              </p>
              <ul className="text-xs text-[#666666] space-y-1 pt-2 border-t border-[#E5E5E5]">
                <li>· Up to 50MB files supported</li>
                <li>· Aspect-ratio preserving preview</li>
                <li>· Zero server transmission</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-4">
              <span className="text-xs font-mono font-bold text-[#666666]">
                02. Encrypt Your Image
              </span>
              <h3 className="text-base font-bold text-[#111111]">
                AES-256-GCM Encryption
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Provide a passphrase to derive a 256-bit key via PBKDF2-SHA256 (100,000 iterations), or generate a random 256-bit master key with unique 96-bit nonces.
              </p>
              <ul className="text-xs text-[#666666] space-y-1 pt-2 border-t border-[#E5E5E5]">
                <li>· 128-bit authentication tag</li>
                <li>· Nonce reuse prevention</li>
                <li>· Unique 16-byte random salt</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-4">
              <span className="text-xs font-mono font-bold text-[#666666]">
                03. Download Protected File
              </span>
              <h3 className="text-base font-bold text-[#111111]">
                CPT Container Delivery
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Receive your self-contained <code className="font-mono text-[#111111]">.cpt</code> package containing version headers, salt, IV, authenticated metadata, and ciphertext.
              </p>
              <ul className="text-xs text-[#666666] space-y-1 pt-2 border-t border-[#E5E5E5]">
                <li>· Exportable .cpt binary file</li>
                <li>· Backup master key file (.cptkey)</li>
                <li>· Embedded SHA-256 integrity hash</li>
              </ul>
            </div>
          </div>

          {/* Decryption Explanation Strip */}
          <div className="bg-white border border-[#E5E5E5] rounded p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <h3 className="text-sm font-bold text-[#111111]">
                Decryption & Bit-Level Restoration Workflow
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                To restore an encrypted file, upload the <code className="font-mono text-[#111111]">.cpt</code> container and enter the password or key. CRYPTORA verifies the 128-bit GCM authentication tag before releasing the plaintext. Any tampered byte immediately halts decryption, guaranteeing complete file integrity.
              </p>
            </div>
            <button
              onClick={() => onNavigate('decrypt')}
              className="px-5 py-2.5 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded shrink-0 transition-colors"
            >
              Start Decryption
            </button>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section className="py-20 md:py-28 border-b border-[#E5E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#666666] uppercase">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] mt-2">
              Enterprise Image Protection Features
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1.5 max-w-xl">
              Only genuine, tested cryptographic capabilities engineered without bloat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-[#E5E5E5] rounded p-6 space-y-3">
              <div className="w-8 h-8 rounded bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111111]">Image Encryption</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Transforms high-resolution image data into unreadable ciphertext utilizing authenticated AES-256-GCM.
              </p>
            </div>

            <div className="border border-[#E5E5E5] rounded p-6 space-y-3">
              <div className="w-8 h-8 rounded bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Unlock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111111]">Image Decryption</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Restores the exact original image upon verification of matching credentials, ensuring 100% pixel fidelity.
              </p>
            </div>

            <div className="border border-[#E5E5E5] rounded p-6 space-y-3">
              <div className="w-8 h-8 rounded bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111111]">Secure File Processing</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Hardware-accelerated processing via the W3C Web Cryptography API. Zero network transmission of unencrypted images.
              </p>
            </div>

            <div className="border border-[#E5E5E5] rounded p-6 space-y-3">
              <div className="w-8 h-8 rounded bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111111]">Protected File Download</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Instantly download self-contained .cpt packages with embedded cryptographic parameters and integrity hashes.
              </p>
            </div>

            <div className="border border-[#E5E5E5] rounded p-6 space-y-3">
              <div className="w-8 h-8 rounded bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111111]">Privacy-Focused Workflow</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Passwords and raw encryption keys are never written to disk, sent to analytics, or stored in remote databases.
              </p>
            </div>

            <div className="border border-[#E5E5E5] rounded p-6 space-y-3">
              <div className="w-8 h-8 rounded bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#111111]">Strict File Validation</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Validates image magic numbers, MIME headers, file sizes, and container structural integrity before processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECURITY & CRYPTOGRAPHY DEEP DIVE */}
      <section className="py-20 md:py-28 border-b border-[#E5E5E5] bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#666666] uppercase">
              Cryptographic Specification
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] mt-2">
              Verified Technical Security Implementation
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1.5 max-w-xl">
              Concrete cryptographic parameters conforming to NIST SP 800-38D and RFC 8018 standards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Technical Specifications Matrix */}
            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-4 text-xs font-mono">
              <h3 className="font-sans font-bold text-sm text-[#111111]">
                Cryptographic Parameters
              </h3>

              <div className="divide-y divide-[#E5E5E5]">
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#666666] font-sans">Symmetric Cipher:</span>
                  <span className="text-[#111111] font-bold">AES-256 (256-bit key)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#666666] font-sans">Cipher Mode:</span>
                  <span className="text-[#111111] font-bold">Galois/Counter Mode (GCM)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#666666] font-sans">Authentication Tag:</span>
                  <span className="text-[#111111] font-bold">128-bit GMAC</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#666666] font-sans">Initialization Vector (IV):</span>
                  <span className="text-[#111111] font-bold">96-bit (12 bytes, unique per run)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#666666] font-sans">Key Derivation (KDF):</span>
                  <span className="text-[#111111] font-bold">PBKDF2 with HMAC-SHA-256</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#666666] font-sans">KDF Iteration Count:</span>
                  <span className="text-[#111111] font-bold tabular-nums">100,000 iterations</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#666666] font-sans">Salt Specification:</span>
                  <span className="text-[#111111] font-bold">128-bit CSPRNG (16 bytes)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#666666] font-sans">Fidelity Checksum:</span>
                  <span className="text-[#111111] font-bold">SHA-256 digest</span>
                </div>
              </div>
            </div>

            {/* Interactive Live Cryptographic Sandbox */}
            <div className="bg-white border border-[#E5E5E5] rounded p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#111111]">
                  Live Cryptographic Sandbox
                </h3>
                <span className="text-[11px] text-[#666666]">
                  Real In-Browser Execution
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Test the hardware AES-GCM engine live on sample data:
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                    Sample Plaintext Payload:
                  </label>
                  <input
                    type="text"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded bg-[#F5F5F5] font-mono text-xs text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                    Sample Passphrase:
                  </label>
                  <input
                    type="text"
                    value={samplePassword}
                    onChange={(e) => setSamplePassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#E5E5E5] rounded bg-[#F5F5F5] font-mono text-xs text-[#111111]"
                  />
                </div>

                <button
                  type="button"
                  disabled={isDemoEncrypting}
                  onClick={handleRunDemoEncryption}
                  className="px-4 py-2 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded transition-colors"
                >
                  {isDemoEncrypting ? 'Deriving & Encrypting...' : 'Execute AES-256-GCM'}
                </button>

                {demoCiphertext && (
                  <div className="mt-3 p-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded space-y-2 font-mono text-[11px]">
                    <div>
                      <span className="text-[#666666] block font-sans font-semibold">Ciphertext Output (Hex):</span>
                      <span className="text-[#111111] break-all">{demoCiphertext}</span>
                    </div>
                    <div>
                      <span className="text-[#666666] block font-sans font-semibold">128-bit Authentication Tag:</span>
                      <span className="text-[#16A34A] break-all font-bold">{demoTag}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
            Take Control of Your Image Security.
          </h2>
          <p className="text-sm sm:text-base text-[#666666] max-w-xl mx-auto leading-relaxed">
            Ensure private photos, sensitive medical scans, corporate diagrams, and digital credentials are completely protected with cryptographically verified AES-256-GCM.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('encrypt')}
              className="w-full sm:w-auto py-3 px-8 bg-[#111111] hover:bg-[#1C1C1C] text-white text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('docs')}
              className="w-full sm:w-auto py-3 px-6 bg-white hover:bg-[#F5F5F5] text-[#111111] text-xs font-semibold rounded border border-[#E5E5E5] transition-colors whitespace-nowrap"
            >
              Read Specification
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
