/**
 * CRYPTORA Cryptographic Algorithm Reference Center
 * In-depth specifications for Symmetric Ciphers, Asymmetric Public-Key Systems,
 * One-Way Hashes, and Password Key Derivation Functions.
 */

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Hash,
  Binary,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AlgorithmInfo } from '../../types/crypto';

const ALGORITHMS_DATA: AlgorithmInfo[] = [
  // 1. Symmetric
  {
    id: 'aes-256-gcm',
    name: 'AES-256-GCM',
    category: 'symmetric',
    purpose: 'High-throughput authenticated encryption with built-in integrity verification.',
    workingPrinciple:
      'Combines Advanced Encryption Standard in Counter mode (CTR) with Galois Message Authentication Code (GMAC) using finite field arithmetic.',
    keySize: '256 bits (32 bytes)',
    securityCharacteristics:
      '128-bit authentication tag protects against bit-flipping attacks, chosen-ciphertext attacks, and tampering.',
    applications: 'TLS 1.3, disk encryption, secure storage, CRYPTORA image & file protection.',
    advantages: [
      'High hardware acceleration across modern CPUs (AES-NI).',
      'Authenticated encryption (AEAD) in a single unified pass.',
      'Prevents padding oracle attacks completely.',
    ],
    limitations: [
      'Catastrophic failure if a Nonce/IV is ever reused with the same key.',
      'Requires 96-bit unique nonces per encryption session.',
    ],
    standard: 'NIST SP 800-38D',
  },
  {
    id: 'aes-256-cbc',
    name: 'AES-256-CBC',
    category: 'symmetric',
    purpose: 'Legacy block cipher mode chaining previous ciphertext blocks into current plaintext.',
    workingPrinciple:
      'Each block of plaintext is XORed with the previous ciphertext block before being encrypted. Requires PKCS#7 padding.',
    keySize: '256 bits (32 bytes)',
    securityCharacteristics:
      'Confidentiality only. Does NOT provide integrity or authenticity on its own without separate HMAC.',
    applications: 'Legacy enterprise VPNs, database column encryption, backwards compatibility.',
    advantages: [
      'Universally supported in all legacy cryptography runtimes.',
      'Good diffusion across successive blocks.',
    ],
    limitations: [
      'Vulnerable to padding oracle attacks if not combined with HMAC-then-decrypt.',
      'Cannot be parallelized during encryption.',
    ],
    standard: 'NIST SP 800-38A',
  },
  {
    id: 'chacha20-poly1305',
    name: 'ChaCha20-Poly1305',
    category: 'symmetric',
    purpose: 'Stream cipher authenticated encryption engineered for high speed on devices without AES hardware instructions.',
    workingPrinciple:
      'Uses the 20-round ChaCha stream cipher combined with the Poly1305 high-speed polynomial authenticator.',
    keySize: '256 bits (32 bytes)',
    securityCharacteristics:
      '128-bit Poly1305 authenticator tag with constant-time execution immune to cache-timing attacks.',
    applications: 'WireGuard VPN, TLS 1.3, mobile device encryption, SSH.',
    advantages: [
      'Ultra-fast in software without dedicated silicon instructions.',
      'Immune to cache-timing side-channel vulnerabilities.',
    ],
    limitations: [
      'Like AES-GCM, strict nonce uniqueness is mandatory.',
    ],
    standard: 'RFC 8439',
  },

  // 2. Asymmetric
  {
    id: 'rsa-oaep',
    name: 'RSA-OAEP (2048 / 4096-bit)',
    category: 'asymmetric',
    purpose: 'Public-key asymmetric encryption for key transport and digital envelopes.',
    workingPrinciple:
      'Factoring large composite numbers using Optimal Asymmetric Encryption Padding (OAEP) with Feistel networks to prevent malleability.',
    keySize: '2048 to 4096 bits',
    securityCharacteristics:
      'Semantic security against adaptive chosen-ciphertext attacks (IND-CCA2).',
    applications: 'Secure email (PGP/S-MIME), cryptographic key exchange, digital envelopes.',
    advantages: [
      'Allows encryption with public key and decryption exclusively with private key.',
      'OAEP padding prevents mathematical relation attacks.',
    ],
    limitations: [
      'Slow computational speed compared to symmetric ciphers.',
      'Plaintext size is mathematically bounded by key size minus padding overhead.',
    ],
    standard: 'PKCS #1 v2.2 / RFC 8017',
  },

  // 3. Hashing
  {
    id: 'sha-256',
    name: 'SHA-256',
    category: 'hash',
    purpose: 'Deterministic one-way cryptographic hash for data integrity, checksums, and signatures.',
    workingPrinciple:
      'Merkle–Damgård construction with Davies–Meyer compression function operating on 512-bit message blocks.',
    keySize: 'None (One-way mathematical digest)',
    securityCharacteristics:
      '128 bits of collision resistance and 256 bits of pre-image resistance.',
    applications: 'File checksums, digital signatures, blockchain proof-of-work, HMAC generation.',
    advantages: [
      'Hardware accelerated on modern CPUs (Intel SHA Extensions).',
      'Industry standard with zero known practical collisions.',
    ],
    limitations: [
      'Susceptible to length extension attacks if not paired with HMAC.',
      'Not suitable directly for passwords without key stretching (too fast for GPU brute-force).',
    ],
    standard: 'FIPS PUB 180-4',
  },
  {
    id: 'sha-512',
    name: 'SHA-512',
    category: 'hash',
    purpose: 'High-security 512-bit one-way cryptographic digest for long-term data verification.',
    workingPrinciple:
      'Operating natively on 64-bit words across 80 rounds with 1024-bit block chunking.',
    keySize: 'None (One-way digest)',
    securityCharacteristics:
      '256 bits of collision resistance; extreme resistance against quantum Grover searches.',
    applications: 'Military and enterprise archives, certificate authorities, high-assurance digital IDs.',
    advantages: [
      'Faster than SHA-256 on native 64-bit architectures.',
      'Extremely high theoretical collision resistance.',
    ],
    limitations: [
      'Produces larger 64-byte hashes; higher storage footprint.',
      'Irreversible: cannot be decrypted.',
    ],
    standard: 'FIPS PUB 180-4',
  },
  {
    id: 'sha-3',
    name: 'SHA-3 (Keccak)',
    category: 'hash',
    purpose: 'Next-generation cryptographic hash based on the sponge construction.',
    workingPrinciple:
      'Sponge function absorbing message bits and squeezing out hash outputs, completely distinct from Merkle–Damgård.',
    keySize: 'None (One-way digest)',
    securityCharacteristics:
      'Mathematically immune to length-extension attacks by architectural design.',
    applications: 'Ethereum, next-gen national security infrastructure, Post-Quantum algorithms.',
    advantages: [
      'Fundamentally different mathematical structure than SHA-2.',
      'Natural defense against length extension attacks without HMAC.',
    ],
    limitations: [
      'Slightly slower in pure software than SHA-2 on legacy systems.',
    ],
    standard: 'FIPS PUB 202',
  },

  // 4. Password KDF
  {
    id: 'pbkdf2',
    name: 'PBKDF2-SHA256',
    category: 'kdf',
    purpose: 'Cryptographic key stretching to derive strong symmetric keys from human passwords.',
    workingPrinciple:
      'Repeatedly executes HMAC-SHA256 over 100,000+ iterations with a pseudorandom 128-bit salt.',
    keySize: 'Outputs variable key lengths (e.g. 256 bits for AES)',
    securityCharacteristics:
      'Forces linear computational cost per guess, rendering dictionary and rainbow table attacks infeasible.',
    applications: 'CRYPTORA user password hashing, CPT container key derivation, WPA2/WPA3 Wi-Fi.',
    advantages: [
      'Supported natively by W3C WebCrypto API in every modern browser.',
      'FIPS-140 and NIST SP 800-132 compliant.',
    ],
    limitations: [
      'Not memory-hard like Argon2id (primarily computation-bound).',
    ],
    standard: 'RFC 8018',
  },
  {
    id: 'argon2id',
    name: 'Argon2id',
    category: 'kdf',
    purpose: 'State-of-the-art password hashing winner of the Password Hashing Competition.',
    workingPrinciple:
      'Hybrid mode blending Argon2d (data-dependent memory access) and Argon2i (data-independent memory access).',
    keySize: 'Configurable output size',
    securityCharacteristics:
      'Maximum resistance against GPU, FPGA, and ASIC dedicated cracking hardware.',
    applications: 'Modern password storage, Linux LUKS2 disk encryption, enterprise identity.',
    advantages: [
      'Memory-hard: enforces RAM consumption to defeat dedicated cracking clusters.',
      'Defends against both trade-off attacks and side-channel timing attacks.',
    ],
    limitations: [
      'Requires WebAssembly in browser environments due to high RAM parameters.',
    ],
    standard: 'RFC 9106',
  },
];

export const AlgorithmsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'symmetric' | 'asymmetric' | 'hash' | 'kdf'>('all');

  const filtered = activeTab === 'all'
    ? ALGORITHMS_DATA
    : ALGORITHMS_DATA.filter((a) => a.category === activeTab);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      {/* Title */}
      <div className="border-b border-[#E5E5E5] pb-6 space-y-2">
        <span className="text-xs font-mono font-bold text-[#777777] uppercase">
          Cryptographic Knowledge Base
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
          Algorithm Information & Cryptographic Standards
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] leading-relaxed max-w-2xl">
          Comprehensive technical analysis of the symmetric ciphers, public-key algorithms, one-way hashes, and password derivation functions implemented and analyzed by CRYPTORA.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-medium border-b border-[#E5E5E5] pb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === 'all' ? 'bg-[#111111] text-white' : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
          }`}
        >
          All Algorithms ({ALGORITHMS_DATA.length})
        </button>
        <button
          onClick={() => setActiveTab('symmetric')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === 'symmetric' ? 'bg-[#111111] text-white' : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
          }`}
        >
          Symmetric Ciphers (3)
        </button>
        <button
          onClick={() => setActiveTab('asymmetric')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === 'asymmetric' ? 'bg-[#111111] text-white' : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
          }`}
        >
          Asymmetric Encryption (1)
        </button>
        <button
          onClick={() => setActiveTab('hash')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === 'hash' ? 'bg-[#111111] text-white' : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
          }`}
        >
          One-Way Hashing (3)
        </button>
        <button
          onClick={() => setActiveTab('kdf')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === 'kdf' ? 'bg-[#111111] text-white' : 'bg-[#F7F7F7] text-[#777777] hover:text-[#111111]'
          }`}
        >
          Password Key Derivation (2)
        </button>
      </div>

      {/* Grid of Algorithms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((algo) => (
          <div
            key={algo.id}
            className="border border-[#E5E5E5] rounded bg-white p-6 space-y-4 hover:border-[#111111] transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] uppercase rounded">
                  {algo.category}
                </span>
                <span className="text-[11px] font-mono text-[#777777]">
                  {algo.standard}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  {algo.name}
                </h3>
                <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                  {algo.purpose}
                </p>
              </div>

              <div className="p-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#777777]">Key / Digest Size:</span>
                  <span className="font-mono font-semibold text-[#111111]">{algo.keySize}</span>
                </div>
                <div>
                  <span className="text-[#777777] block text-[11px]">Working Mechanism:</span>
                  <span className="text-[#111111] text-[11px] leading-relaxed block mt-0.5">
                    {algo.workingPrinciple}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div>
                  <span className="font-semibold text-[#111111] text-[11px] block mb-1">
                    Primary Advantages:
                  </span>
                  <ul className="space-y-1 text-[#777777] text-[11px]">
                    {algo.advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-[#111111] text-[11px] block mb-1">
                    Limitations & Precautions:
                  </span>
                  <ul className="space-y-1 text-[#777777] text-[11px]">
                    {algo.limitations.map((lim, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] text-[11px] text-[#777777]">
              <span>Applications: {algo.applications}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
